import Link from "next/link";
import { ArrowLeft, CalendarClock } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireCliente } from "@/lib/auth/guards";
import { PageShell } from "@/components/cactus/page-shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/cactus/empty-state";
import { hoyISO, rangoPeriodo, rangoPeriodoCorte, type PeriodoModo, type EntradaDia, type HorarioProgramado } from "@/lib/asistencia";
import { calcularNomina } from "@/lib/nomina";
import { PeriodoFiltro } from "./_components/periodo-filtro";
import { ExportarPerfilButton } from "./_components/exportar-perfil-button";
import { AsistenciaKpis } from "./_components/asistencia-kpis";
import { AsistenciaTimeline } from "./_components/asistencia-timeline";
import { NominaCard } from "./_components/nomina-card";
import { PagosHistorial } from "./_components/pagos-historial";
import { AdelantosHistorial } from "./_components/adelantos-historial";
import { RegistrarAdelantoDialog } from "./_components/registrar-adelanto-dialog";

export default async function AsistenciaEmpleadoPage({
  params,
  searchParams,
}: {
  params: Promise<{ empleadoId: string }>;
  searchParams: Promise<{ modo?: string; fecha?: string; desde?: string; hasta?: string }>;
}) {
  const { profile } = await requireCliente();
  const { empleadoId } = await params;
  const sp = await searchParams;

  const supabase = await createClient();

  const { data: empleado } = await supabase
    .from("empleados")
    .select("*")
    .eq("id", empleadoId)
    .eq("id_empresa", profile.id_empresa)
    .single();

  if (!empleado) redirect("/asistencias");

  const [{ data: sucursal }, { data: horarioEmpleado }] = await Promise.all([
    empleado.id_sucursal
      ? supabase
          .from("sucursales")
          .select("nombre_sucursal, dia_corte, jornada1_entrada, jornada1_salida_almuerzo, jornada1_entrada_almuerzo, jornada1_salida")
          .eq("id", empleado.id_sucursal)
          .single()
      : Promise.resolve({ data: null }),
    supabase
      .from("horarios_empleados")
      .select("usa_horario_global, jornada1_entrada, jornada1_salida_almuerzo, jornada1_entrada_almuerzo, jornada1_salida")
      .eq("id_empleado", empleadoId)
      .maybeSingle(),
  ]);

  // Priority: empleado.dia_corte → sucursal.dia_corte → calendar month
  const diaCorte = empleado.dia_corte ?? sucursal?.dia_corte ?? null;

  let modo: PeriodoModo;
  let desde: string;
  let hasta: string;

  if (sp.desde && sp.hasta) {
    // Explicit navigation (prev/next arrows)
    modo = diaCorte ? "corte" : "mes";
    desde = sp.desde;
    hasta = sp.hasta;
  } else if (diaCorte) {
    // Auto-compute current payroll period from dia_corte
    modo = "corte";
    ({ desde, hasta } = rangoPeriodoCorte(diaCorte));
  } else {
    // Default: calendar month
    modo = "mes";
    const fecha = sp.fecha ?? hoyISO();
    ({ desde, hasta } = rangoPeriodo(fecha));
  }

  const horarioProgramado: HorarioProgramado = (() => {
    const fuente = !horarioEmpleado || horarioEmpleado.usa_horario_global ? sucursal : horarioEmpleado;
    return {
      entrada: fuente?.jornada1_entrada ?? null,
      salidaAlmuerzo: fuente?.jornada1_salida_almuerzo ?? null,
      entradaAlmuerzo: fuente?.jornada1_entrada_almuerzo ?? null,
      salida: fuente?.jornada1_salida ?? null,
    };
  })();

  const [
    { data: controlDiario },
    { data: justificaciones },
    { data: diasFeriados },
    { data: diasNoLabSucursal },
    { data: diasNoLabEmpleado },
    { data: fechasNoLabEmpleado },
    { data: pagosEmpleado },
    { data: adelantosEmpleado },
  ] = await Promise.all([
    supabase
      .from("control_diario")
      .select("*")
      .eq("id_empresa", profile.id_empresa)
      .eq("id_empleado", empleadoId)
      .gte("fecha", desde)
      .lte("fecha", hasta)
      .order("fecha", { ascending: true }),
    supabase
      .from("justificaciones_falta")
      .select("*")
      .eq("id_empleado", empleadoId)
      .gte("fecha", desde)
      .lte("fecha", hasta),
    empleado.id_sucursal
      ? supabase
          .from("dias_feriados")
          .select("fecha")
          .eq("id_sucursal", empleado.id_sucursal)
          .gte("fecha", desde)
          .lte("fecha", hasta)
      : Promise.resolve({ data: [] as { fecha: string }[] }),
    empleado.id_sucursal
      ? supabase
          .from("dias_no_laborables_sucursal")
          .select("dia_semana")
          .eq("id_sucursal", empleado.id_sucursal)
      : Promise.resolve({ data: [] as { dia_semana: number }[] }),
    supabase
      .from("dias_no_laborables_empleado")
      .select("dia_semana")
      .eq("id_empleado", empleadoId),
    supabase
      .from("fechas_no_laborables_empleado")
      .select("fecha")
      .eq("id_empleado", empleadoId)
      .gte("fecha", desde)
      .lte("fecha", hasta),
    supabase
      .from("pagos_empleado")
      .select("*")
      .eq("id_empleado", empleadoId)
      .order("created_at", { ascending: false }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("adelantos_empleado")
      .select("*")
      .eq("id_empleado", empleadoId)
      .order("fecha", { ascending: false }),
  ]);

  // Build working-day exclusion sets
  const feriadosSet = new Set((diasFeriados ?? []).map((f) => f.fecha));
  const diasNoLabSucSet = new Set((diasNoLabSucursal ?? []).map((d) => d.dia_semana));
  const diasNoLabEmpSet = new Set((diasNoLabEmpleado ?? []).map((d) => d.dia_semana));
  const fechasNoLabEmpSet = new Set((fechasNoLabEmpleado ?? []).map((f) => f.fecha));
  const registrosMap = new Map((controlDiario ?? []).map((r) => [r.fecha, r]));
  const justificacionesMap = new Map((justificaciones ?? []).map((j) => [j.fecha, j]));

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  // Absences are only counted from the employee's hire date onwards
  const fechaIngreso = empleado.fecha_ingreso
    ? new Date(`${empleado.fecha_ingreso}T00:00:00`)
    : new Date(`${desde}T00:00:00`);

  const entradas: EntradaDia[] = [];
  const cursor = new Date(`${desde}T00:00:00`);
  const fin = new Date(`${hasta}T00:00:00`);

  while (cursor <= fin) {
    const fechaISO = cursor.toISOString().slice(0, 10);
    const diaSemana = cursor.getDay();
    const row = registrosMap.get(fechaISO);
    const justificacion = justificacionesMap.get(fechaISO);

    if (row) {
      entradas.push({ tipo: "registro", fecha: fechaISO, row, justificacion });
    } else {
      const esNoLaborable =
        feriadosSet.has(fechaISO) ||
        diasNoLabSucSet.has(diaSemana) ||
        diasNoLabEmpSet.has(diaSemana) ||
        fechasNoLabEmpSet.has(fechaISO);

      if (!esNoLaborable && cursor < hoy && cursor >= fechaIngreso) {
        entradas.push({ tipo: "falta", fecha: fechaISO, justificacion });
      }
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  entradas.reverse();

  const rows = controlDiario ?? [];
  const totales = rows.reduce(
    (acc, row) => ({
      atraso: acc.atraso + row.minutos_atraso,
      salidaTemprana: acc.salidaTemprana + row.minutos_salida_temprana,
      extras: acc.extras + row.minutos_extras,
    }),
    { atraso: 0, salidaTemprana: 0, extras: 0 },
  );

  const totalFaltas = entradas.filter((e) => e.tipo === "falta").length;
  const totalFaltasJustificadas = entradas.filter(
    (e) => e.tipo === "falta" && e.justificacion && e.justificacion.estado !== "rechazada",
  ).length;
  const faltasNoJustificadas = totalFaltas - totalFaltasJustificadas;
  const diasTrabajados = entradas.filter((e) => e.tipo === "registro").length;
  const totalDiasHabiles = diasTrabajados + totalFaltas;

  // Detect if any payment overlaps with the current period (fecha de corte)
  const periodoYaPagado = (pagosEmpleado ?? []).find(
    (p) => p.periodo_hasta >= desde && p.periodo_desde <= hasta,
  );

  const adelantosEnPeriodo = (adelantosEmpleado ?? []).filter(
    (a: { fecha: string }) => a.fecha >= desde && a.fecha <= hasta,
  );
  const totalAdelantos = adelantosEnPeriodo.reduce(
    (sum: number, a: { monto: number }) => sum + Number(a.monto),
    0,
  );

  const nominaResult =
    (empleado.salario_diario ?? 0) > 0
      ? calcularNomina(
          {
            salario: empleado.salario_diario,
            tipo: empleado.tipo_salario ?? "diario",
            horasJornada: empleado.horas_jornada ?? 8,
            valorHoraExtra: empleado.multiplicador_hora_extra ?? 0,
            descuentaAtrasos: empleado.descuenta_atrasos ?? false,
          },
          {
            diasTrabajados,
            minutosExtra: totales.extras,
            minutosAtraso: totales.atraso,
            faltasNoJustificadas,
            minutosSalidaTemprana: totales.salidaTemprana,
            adelantos: totalAdelantos,
          },
        )
      : null;

  return (
    <PageShell
      title={empleado.nombre}
      description={
        sucursal?.nombre_sucursal
          ? `Perfil de asistencia · ${sucursal.nombre_sucursal}`
          : "Perfil de asistencia"
      }
      actions={
        <div className="flex flex-wrap items-center gap-4">
          <Button
            variant="outline"
            render={<Link href="/asistencias" />}
            nativeButton={false}
            className="gap-1.5"
          >
            <ArrowLeft className="size-4" />
            Volver
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <PeriodoFiltro diaCorte={diaCorte} desde={desde} hasta={hasta} />
            <ExportarPerfilButton
              rows={rows}
              empleadoNombre={empleado.nombre}
              desde={desde}
              hasta={hasta}
            />
          </div>
        </div>
      }
    >
      <div className="flex w-full flex-col items-start gap-6">
        <AsistenciaKpis
          totalAtraso={totales.atraso}
          totalSalidaTemprana={totales.salidaTemprana}
          totalExtras={totales.extras}
          totalFaltas={totalFaltas}
          totalFaltasJustificadas={totalFaltasJustificadas}
          diasTrabajados={diasTrabajados}
          totalDiasHabiles={totalDiasHabiles}
        />

        <NominaCard
          nominaResult={nominaResult}
          idEmpleado={empleadoId}
          nombreEmpleado={empleado.nombre}
          periodoDesde={desde}
          periodoHasta={hasta}
          diasTrabajados={diasTrabajados}
          salarioDiario={empleado.salario_diario ?? 0}
          tipoSalario={empleado.tipo_salario ?? "diario"}
          valorHoraExtra={empleado.multiplicador_hora_extra ?? 0}
          minutosExtra={totales.extras}
          minutosAtraso={totales.atraso}
          minutosSalidaTemprana={totales.salidaTemprana}
          faltasNoJustificadas={faltasNoJustificadas}
          periodoYaPagado={periodoYaPagado}
          cantidadAdelantos={adelantosEnPeriodo.length}
        />

        {entradas.length === 0 ? (
          <EmptyState
            icon={<CalendarClock className="size-6" />}
            title={
              modo === "corte"
                ? "No hay registros para este período"
                : "No hay registros para este mes"
            }
            description="Elige otro periodo en el calendario para ver el historial de este empleado."
          />
        ) : (
          <AsistenciaTimeline entradas={entradas} empleado={empleado} horarioProgramado={horarioProgramado} />
        )}

        {/* Payroll history */}
        <div className="flex w-full flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Historial de pagos</h2>
          </div>
          <PagosHistorial pagos={pagosEmpleado ?? []} />
        </div>

        {/* Advances */}
        <div className="flex w-full flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Adelantos</h2>
            <RegistrarAdelantoDialog
              idEmpleado={empleadoId}
              nombreEmpleado={empleado.nombre}
            />
          </div>
          <AdelantosHistorial adelantos={adelantosEmpleado ?? []} />
        </div>
      </div>
    </PageShell>
  );
}
