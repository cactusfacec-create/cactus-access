import { CalendarClock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireCliente } from "@/lib/auth/guards";
import { PageShell } from "@/components/cactus/page-shell";
import { RefreshButton } from "@/components/cactus/refresh-button";
import { EmptyState } from "@/components/cactus/empty-state";
import { hoyISO, type HorarioProgramado } from "@/lib/asistencia";
import { AsistenciasFiltros } from "./_components/asistencias-filtros";
import { AsistenciaDiaCard } from "./_components/asistencia-dia-card";
import { ExportarReporteButton } from "./_components/exportar-reporte-button";
import type { EmpleadoAsistenciaDia } from "@/lib/types/domain";

export default async function AsistenciasPage({
  searchParams,
}: {
  searchParams: Promise<{ fecha?: string; sucursalId?: string }>;
}) {
  const { profile } = await requireCliente();
  const params = await searchParams;
  const fecha = params.fecha ?? hoyISO();

  const supabase = await createClient();

  const [{ data: empleados }, { data: sucursales }, { data: controlDiario }, { data: horarios }] = await Promise.all([
    supabase.from("empleados").select("*").eq("id_empresa", profile.id_empresa).order("nombre"),
    supabase
      .from("sucursales")
      .select("*")
      .eq("id_empresa", profile.id_empresa)
      .order("nombre_sucursal"),
    supabase
      .from("control_diario")
      .select("*")
      .eq("id_empresa", profile.id_empresa)
      .eq("fecha", fecha),
    supabase
      .from("horarios_empleados")
      .select("id_empleado, usa_horario_global, jornada1_entrada, jornada1_salida_almuerzo, jornada1_entrada_almuerzo, jornada1_salida"),
  ]);

  const empleadosVisibles = params.sucursalId
    ? (empleados ?? []).filter((empleado) => empleado.id_sucursal === params.sucursalId)
    : empleados ?? [];

  const empleadoById = new Map(empleadosVisibles.map((empleado) => [empleado.id, empleado]));
  const sucursalById = new Map((sucursales ?? []).map((s) => [s.id, s]));
  const horarioByEmpleadoId = new Map((horarios ?? []).map((h) => [h.id_empleado, h]));

  const registros: EmpleadoAsistenciaDia[] = (controlDiario ?? [])
    .filter((row) => empleadoById.has(row.id_empleado))
    .map((row) => {
      const empleado = empleadoById.get(row.id_empleado)!;
      const suc = empleado.id_sucursal ? sucursalById.get(empleado.id_sucursal) : null;
      const hor = horarioByEmpleadoId.get(empleado.id);
      const fuente = !hor || hor.usa_horario_global ? suc : hor;
      const horarioProgramado: HorarioProgramado = {
        entrada: fuente?.jornada1_entrada ?? null,
        salidaAlmuerzo: fuente?.jornada1_salida_almuerzo ?? null,
        entradaAlmuerzo: fuente?.jornada1_entrada_almuerzo ?? null,
        salida: fuente?.jornada1_salida ?? null,
      };
      return {
        empleado: { id: empleado.id, nombre: empleado.nombre, cedula: empleado.cedula },
        sucursalNombre: suc?.nombre_sucursal ?? "—",
        row,
        horarioProgramado,
      };
    })
    .sort((a, b) => a.empleado.nombre.localeCompare(b.empleado.nombre));

  return (
    <PageShell
      title="Asistencias"
      description="Registros de entrada y salida · haz clic en un empleado para ver su historial"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <AsistenciasFiltros sucursales={sucursales ?? []} />
          <ExportarReporteButton registros={registros} fecha={fecha} />
          <RefreshButton />
        </div>
      }
    >
      {registros.length === 0 ? (
        <EmptyState
          icon={<CalendarClock className="size-6" />}
          title="No hay registros de asistencia para este día"
          description="Elige otro día en el calendario para ver el log de operaciones."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {registros.map((item) => (
            <AsistenciaDiaCard key={item.empleado.id} item={item} fecha={fecha} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
