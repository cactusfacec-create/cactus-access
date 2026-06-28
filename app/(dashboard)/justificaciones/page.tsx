import { createClient } from "@/lib/supabase/server";
import { requireCliente } from "@/lib/auth/guards";
import { FileCheck2 } from "lucide-react";
import { JustificacionesTable } from "./_components/justificaciones-table";
import { FaltasList, type FaltaDetectada } from "./_components/faltas-list";
import { IncompletosList, type RegistroIncompletoDetectado } from "./_components/incompletos-list";
import { isRegistroIncompleto } from "@/lib/asistencia";
import type { JustificacionFalta } from "@/lib/types/database.types";

export default async function JustificacionesPage() {
  const { profile } = await requireCliente();
  const supabase = await createClient();

  // Rolling 30-day window (Ecuador timezone UTC-5)
  const ecFmt = (d: Date) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: "America/Guayaquil" }).format(d);
  const hasta = ecFmt(new Date());
  const desdeDate = new Date();
  desdeDate.setDate(desdeDate.getDate() - 29);
  const desde = ecFmt(desdeDate);

  const [
    { data: empleados },
    { data: controlDiario },
    { data: feriados },
    { data: diasNoLabSucursal },
    { data: diasNoLabEmpleado },
    { data: fechasNoLabEmpleado },
    { data: justificaciones },
  ] = await Promise.all([
    supabase
      .from("empleados")
      .select("id, nombre, id_empresa, id_sucursal, cedula, telefono, salario_diario, tipo_salario, horas_jornada, multiplicador_hora_extra, descuenta_atrasos, fecha_ingreso, dia_corte")
      .eq("id_empresa", profile.id_empresa)
      .order("nombre"),
    supabase
      .from("control_diario")
      .select("id_empleado, fecha, hora_salida_almuerzo_real, hora_entrada_almuerzo_real, hora_salida_real")
      .eq("id_empresa", profile.id_empresa)
      .gte("fecha", desde)
      .lte("fecha", hasta),
    supabase
      .from("dias_feriados")
      .select("id_sucursal, fecha")
      .gte("fecha", desde)
      .lte("fecha", hasta),
    supabase.from("dias_no_laborables_sucursal").select("id_sucursal, dia_semana"),
    supabase.from("dias_no_laborables_empleado").select("id_empleado, dia_semana"),
    supabase
      .from("fechas_no_laborables_empleado")
      .select("id_empleado, fecha")
      .gte("fecha", desde)
      .lte("fecha", hasta),
    supabase
      .from("justificaciones_falta")
      .select("*")
      .eq("id_empresa", profile.id_empresa)
      .order("fecha", { ascending: false }),
  ]);

  // Build lookup structures
  const registrosSet = new Set(
    (controlDiario ?? []).map((r) => `${r.id_empleado}|${r.fecha}`),
  );

  const empleadoNombreMap = new Map((empleados ?? []).map((e) => [e.id, e.nombre]));

  const feriadosPorSuc = new Map<string, Set<string>>();
  for (const f of feriados ?? []) {
    if (!feriadosPorSuc.has(f.id_sucursal)) feriadosPorSuc.set(f.id_sucursal, new Set());
    feriadosPorSuc.get(f.id_sucursal)!.add(f.fecha);
  }

  const diasNoLabSucMap = new Map<string, Set<number>>();
  for (const d of diasNoLabSucursal ?? []) {
    if (!diasNoLabSucMap.has(d.id_sucursal)) diasNoLabSucMap.set(d.id_sucursal, new Set());
    diasNoLabSucMap.get(d.id_sucursal)!.add(d.dia_semana);
  }

  const diasNoLabEmpMap = new Map<string, Set<number>>();
  for (const d of diasNoLabEmpleado ?? []) {
    if (!diasNoLabEmpMap.has(d.id_empleado)) diasNoLabEmpMap.set(d.id_empleado, new Set());
    diasNoLabEmpMap.get(d.id_empleado)!.add(d.dia_semana);
  }

  const fechasNoLabEmpMap = new Map<string, Set<string>>();
  for (const f of fechasNoLabEmpleado ?? []) {
    if (!fechasNoLabEmpMap.has(f.id_empleado)) fechasNoLabEmpMap.set(f.id_empleado, new Set());
    fechasNoLabEmpMap.get(f.id_empleado)!.add(f.fecha);
  }

  // Map justifications by employee+date
  const justMap = new Map<string, JustificacionFalta>();
  for (const j of justificaciones ?? []) {
    justMap.set(`${j.id_empleado}|${j.fecha}`, j);
  }

  // Detect incomplete records (left for lunch, never returned)
  const incompletos: RegistroIncompletoDetectado[] = (controlDiario ?? [])
    .filter((r) => isRegistroIncompleto(r))
    .map((r) => ({
      idEmpleado: r.id_empleado,
      nombreEmpleado: empleadoNombreMap.get(r.id_empleado) ?? r.id_empleado,
      fecha: r.fecha,
      justificacion: justMap.get(`${r.id_empleado}|${r.fecha}`),
    }))
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  // Compute absences for each employee
  const faltas: FaltaDetectada[] = [];

  for (const emp of empleados ?? []) {
    const fechaIngreso = emp.fecha_ingreso
      ? new Date(`${emp.fecha_ingreso}T00:00:00`)
      : new Date(`${desde}T00:00:00`);

    const feriadosSuc = emp.id_sucursal ? (feriadosPorSuc.get(emp.id_sucursal) ?? new Set<string>()) : new Set<string>();
    const diasNoLabSuc = emp.id_sucursal ? (diasNoLabSucMap.get(emp.id_sucursal) ?? new Set<number>()) : new Set<number>();
    const diasNoLabEmp = diasNoLabEmpMap.get(emp.id) ?? new Set<number>();
    const fechasNoLabEmp = fechasNoLabEmpMap.get(emp.id) ?? new Set<string>();

    const cursor = new Date(`${desde}T00:00:00`);
    const fin = new Date(`${hasta}T00:00:00`);

    while (cursor < fin) { // strictly before today (today may still be incomplete)
      const fechaISO = cursor.toISOString().slice(0, 10);
      const diaSemana = cursor.getDay();

      const tieneRegistro = registrosSet.has(`${emp.id}|${fechaISO}`);
      const esNoLaborable =
        feriadosSuc.has(fechaISO) ||
        diasNoLabSuc.has(diaSemana) ||
        diasNoLabEmp.has(diaSemana) ||
        fechasNoLabEmp.has(fechaISO);
      const antesDeIngreso = cursor < fechaIngreso;

      if (!tieneRegistro && !esNoLaborable && !antesDeIngreso) {
        const key = `${emp.id}|${fechaISO}`;
        faltas.push({
          idEmpleado: emp.id,
          nombreEmpleado: emp.nombre,
          fecha: fechaISO,
          justificacion: justMap.get(key),
        });
      }

      cursor.setDate(cursor.getDate() + 1);
    }
  }

  // Sort newest first
  faltas.sort((a, b) => b.fecha.localeCompare(a.fecha));

  const sinJustificar = faltas.filter(
    (f) => !f.justificacion || f.justificacion.estado === "rechazada",
  ).length;

  const pendientes = (justificaciones ?? []).filter((j) => j.estado === "pendiente").length;

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
            <FileCheck2 className="size-5 text-primary" />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-foreground">Justificaciones</h1>
            {sinJustificar > 0 && (
              <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                {sinJustificar}
              </span>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground pl-[2.875rem]">
          Faltas detectadas en los últimos 30 días — pulsa una para justificarla.
        </p>
      </div>

      {/* Absences list */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            Faltas detectadas
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              últimos 30 días
            </span>
          </h2>
          {faltas.length > 0 && (
            <div className="flex gap-3 text-xs text-muted-foreground">
              <span>
                <span className="font-semibold text-red-600 dark:text-red-400">{sinJustificar}</span> sin justificar
              </span>
              <span>
                <span className="font-semibold text-foreground">{faltas.length}</span> total
              </span>
            </div>
          )}
        </div>
        <FaltasList faltas={faltas} empleados={empleados ?? []} />
      </section>

      {/* Incomplete records */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            Registros incompletos
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              últimos 30 días
            </span>
          </h2>
          {incompletos.length > 0 && (
            <div className="flex gap-3 text-xs text-muted-foreground">
              <span>
                <span className="font-semibold text-orange-600 dark:text-orange-400">
                  {incompletos.filter((i) => !i.justificacion || i.justificacion.estado === "rechazada").length}
                </span>{" "}
                sin justificar
              </span>
              <span>
                <span className="font-semibold text-foreground">{incompletos.length}</span> total
              </span>
            </div>
          )}
        </div>
        <IncompletosList incompletos={incompletos} empleados={empleados ?? []} />
      </section>

      {/* Justification history */}
      {(justificaciones?.length ?? 0) > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground">Historial de justificaciones</h2>
            {pendientes > 0 && (
              <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">
                {pendientes} pendientes
              </span>
            )}
          </div>
          <JustificacionesTable
            justificaciones={justificaciones ?? []}
            empleados={empleados ?? []}
          />
        </section>
      )}
    </div>
  );
}
