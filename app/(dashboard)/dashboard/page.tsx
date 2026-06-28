import { AlarmClock, Building2, CheckCircle2, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireCliente } from "@/lib/auth/guards";
import { checkLimiteDisponible } from "@/lib/auth/license-limits";
import { listPendientes } from "@/actions/registros-no-reconocidos.actions";
import { PageShell } from "@/components/cactus/page-shell";
import { RefreshButton } from "@/components/cactus/refresh-button";
import { DashboardGrid, GridItem } from "@/components/cactus/dashboard-grid";
import { HeroCard } from "@/components/cactus/hero-card";
import { StatCard } from "@/components/cactus/stat-card";
import { AttendanceTrendChart, type DiaTendencia } from "@/components/cactus/attendance-trend-chart";
import { RecentEventsTable, type EventoReciente } from "./_components/recent-events-table";
import { NoReconocidosPreview, type NoReconocidoPreview } from "./_components/no-reconocidos-preview";

function fechaISO(date: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Guayaquil" }).format(date);
}

function diasAtras(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

export default async function DashboardPage() {
  const { profile } = await requireCliente();
  const supabase = await createClient();

  const fechaDesde7 = fechaISO(diasAtras(6));
  const fechaDesde14 = fechaISO(diasAtras(13));

  const [
    { data: licencia },
    { data: empleados },
    { data: sucursales },
    { data: controlDiario },
    registrosPendientes,
    empleadosUsage,
    sucursalesUsage,
  ] = await Promise.all([
    supabase.from("licencias").select("*").eq("id_empresa", profile.id_empresa).single(),
    supabase.from("empleados").select("*").eq("id_empresa", profile.id_empresa),
    supabase.from("sucursales").select("*").eq("id_empresa", profile.id_empresa),
    supabase
      .from("control_diario")
      .select("*")
      .eq("id_empresa", profile.id_empresa)
      .gte("fecha", fechaDesde14)
      .order("fecha", { ascending: false }),
    listPendientes(),
    checkLimiteDisponible({ idEmpresa: profile.id_empresa, recurso: "empleados" }),
    checkLimiteDisponible({ idEmpresa: profile.id_empresa, recurso: "sucursales" }),
  ]);

  const sucursalNombreById = new Map((sucursales ?? []).map((s) => [s.id, s.nombre_sucursal]));
  const empleadoById = new Map((empleados ?? []).map((e) => [e.id, e]));

  // --- Métricas del día ---
  const hoy = fechaISO(new Date());
  const registrosHoy = (controlDiario ?? []).filter((r) => r.fecha === hoy);
  const entradosHoy = registrosHoy.filter((r) => r.hora_entrada_real).length;
  const atrasosHoy = registrosHoy.filter((r) => r.minutos_atraso > 0).length;

  // --- Tendencia de los últimos 7 días (gráfica compacta de la fila de notificaciones) ---
  const dias7: DiaTendencia[] = [];
  for (let i = 6; i >= 0; i--) {
    dias7.push({ fecha: fechaISO(diasAtras(i)), aTiempo: 0, atrasos: 0 });
  }
  const diaPorFecha = new Map(dias7.map((d) => [d.fecha, d]));
  for (const row of controlDiario ?? []) {
    if (row.fecha < fechaDesde7 || !row.hora_entrada_real) continue;
    const dia = diaPorFecha.get(row.fecha);
    if (!dia) continue;
    if (row.minutos_atraso > 0) dia.atrasos += 1;
    else dia.aTiempo += 1;
  }

  // --- Eventos recientes: cada timestamp no nulo es un evento, con sucursal y estatus ---
  const eventos: EventoReciente[] = [];
  for (const row of controlDiario ?? []) {
    const empleado = empleadoById.get(row.id_empleado);
    const nombre = empleado?.nombre ?? "Empleado eliminado";
    const sucursalNombre = empleado?.id_sucursal
      ? sucursalNombreById.get(empleado.id_sucursal) ?? "—"
      : "—";

    if (row.hora_entrada_real) {
      eventos.push({
        empleadoId: row.id_empleado,
        empleadoNombre: nombre,
        tipo: "Entrada",
        hora: row.hora_entrada_real,
        sucursalNombre,
        estatus: row.minutos_atraso > 0 ? "atrasado" : "a_tiempo",
      });
    }
    if (row.hora_salida_almuerzo_real) {
      eventos.push({
        empleadoId: row.id_empleado,
        empleadoNombre: nombre,
        tipo: "Salida a almuerzo",
        hora: row.hora_salida_almuerzo_real,
        sucursalNombre,
      });
    }
    if (row.hora_entrada_almuerzo_real) {
      eventos.push({
        empleadoId: row.id_empleado,
        empleadoNombre: nombre,
        tipo: "Regreso de almuerzo",
        hora: row.hora_entrada_almuerzo_real,
        sucursalNombre,
      });
    }
    if (row.hora_salida_real) {
      eventos.push({
        empleadoId: row.id_empleado,
        empleadoNombre: nombre,
        tipo: "Salida",
        hora: row.hora_salida_real,
        sucursalNombre,
        estatus:
          row.minutos_extras > 0
            ? "horas_extra"
            : row.minutos_salida_temprana > 0
              ? "incompleto"
              : "a_tiempo",
      });
    }
  }
  eventos.sort((a, b) => new Date(b.hora).getTime() - new Date(a.hora).getTime());
  const eventosRecientes = eventos.slice(0, 8);

  // --- No reconocidos: vista previa de los más recientes ---
  const noReconocidosPreview: NoReconocidoPreview[] = registrosPendientes.slice(0, 5).map((registro) => ({
    id: registro.id,
    cedulaRecibida: registro.cedula_recibida,
    idSucursal: registro.id_sucursal,
    sucursalNombre: sucursalNombreById.get(registro.id_sucursal) ?? "—",
    fechaHoraEvento: registro.fecha_hora_evento,
  }));

  return (
    <PageShell
      title="Dashboard"
      description="Resumen de actividad"
      actions={<RefreshButton />}
    >
      <DashboardGrid>
        {/* Fila de KPIs: Licencia hero + 4 métricas en grid 2×2 */}
        <GridItem span={4}>
          <HeroCard
            variant="primary"
            href="/planes"
            title="Licencia"
            value={licencia?.activa ? "Activa" : "Suspendida"}
            description={
              licencia
                ? `Vence el ${new Date(licencia.fecha_vencimiento).toLocaleDateString("es-EC")}`
                : undefined
            }
            className="h-full"
          />
        </GridItem>
        <GridItem span={8}>
          <div className="grid h-full grid-cols-2 gap-3 sm:gap-4">
            <StatCard
              label="Sucursales"
              value={
                sucursalesUsage.limite > 0
                  ? `${sucursalesUsage.actual} / ${sucursalesUsage.limite}`
                  : sucursalesUsage.actual
              }
              href="/sucursales"
              icon={<Building2 className="size-4" />}
              className="h-full"
              animationDelay={75}
            />
            <StatCard
              label="Empleados"
              value={
                empleadosUsage.limite > 0
                  ? `${empleadosUsage.actual} / ${empleadosUsage.limite}`
                  : empleadosUsage.actual
              }
              href="/empleados"
              icon={<Users className="size-4" />}
              className="h-full"
              animationDelay={150}
            />
            <StatCard
              label="Entraron hoy"
              value={entradosHoy}
              icon={<CheckCircle2 className="size-4" />}
              tone="success"
              delta={entradosHoy === 0 ? "Sin marcaciones aún" : `de ${empleadosUsage.actual} empleados`}
              className="h-full"
              animationDelay={225}
            />
            <StatCard
              label="Atrasos hoy"
              value={atrasosHoy}
              icon={<AlarmClock className="size-4" />}
              tone={atrasosHoy > 0 ? "warn" : "neutral"}
              delta={atrasosHoy === 0 ? "Sin atrasos registrados" : `empleado${atrasosHoy !== 1 ? "s" : ""} con demora`}
              deltaVariant={atrasosHoy > 0 ? "warn" : "default"}
              className="h-full"
              animationDelay={300}
            />
          </div>
        </GridItem>

        <GridItem span={12}>
          <RecentEventsTable eventos={eventosRecientes} />
        </GridItem>

        <GridItem span={6}>
          <NoReconocidosPreview registros={noReconocidosPreview} sucursales={sucursales ?? []} />
        </GridItem>
        <GridItem span={6}>
          <AttendanceTrendChart dias={dias7} />
        </GridItem>
      </DashboardGrid>
    </PageShell>
  );
}
