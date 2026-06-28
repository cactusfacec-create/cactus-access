import { createClient } from "@/lib/supabase/server";
import { requireCliente } from "@/lib/auth/guards";
import { CalendarDays, Info } from "lucide-react";
import { FeriadosCalendar } from "./_components/feriados-calendar";
import { DiasNoLaborables } from "./_components/dias-no-laborables";

export default async function CalendarioPage() {
  const { profile } = await requireCliente();
  const supabase = await createClient();

  const [
    { data: sucursales },
    { data: feriados },
    { data: empleados },
    { data: diasSucursal },
    { data: diasEmpleado },
    { data: fechasNoLaborablesEmpleado },
  ] = await Promise.all([
    supabase
      .from("sucursales")
      .select("*")
      .eq("id_empresa", profile.id_empresa)
      .order("nombre_sucursal"),
    supabase
      .from("dias_feriados")
      .select("*")
      .order("fecha"),
    supabase
      .from("empleados")
      .select("id, nombre, id_empresa, id_sucursal, cedula, telefono, salario_diario, tipo_salario, horas_jornada, multiplicador_hora_extra, descuenta_atrasos, fecha_ingreso, dia_corte")
      .eq("id_empresa", profile.id_empresa)
      .order("nombre"),
    supabase.from("dias_no_laborables_sucursal").select("id_sucursal, dia_semana"),
    supabase.from("dias_no_laborables_empleado").select("id_empleado, dia_semana"),
    supabase.from("fechas_no_laborables_empleado").select("id_empleado, fecha, descripcion"),
  ]);

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10">
            <CalendarDays className="size-5 text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Calendario Laboral</h1>
        </div>
        <p className="text-sm text-muted-foreground pl-11.5">
          Configura feriados y días no laborables — el sistema los excluirá de las alertas de falta.
        </p>
      </div>

      {/* Feriados section */}
      <section className="flex flex-col gap-4 rounded-2xl bg-card px-5 py-5 shadow-[0px_4px_20px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-base font-semibold text-foreground">Días Feriados por Sucursal</h2>
          <p className="text-sm text-muted-foreground">
            Marca los días feriados para cada sucursal (fiestas nacionales, locales, cierres).
          </p>
        </div>
        <FeriadosCalendar
          sucursales={sucursales ?? []}
          feriadosIniciales={feriados ?? []}
        />
      </section>

      {/* Non-working days section */}
      <section className="flex flex-col gap-4 rounded-2xl bg-card px-5 py-5 shadow-[0px_4px_20px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-base font-semibold text-foreground">Días No Laborables</h2>
          <p className="text-sm text-muted-foreground">
            Días de la semana fijos y calendarios personales de cada empleado.
          </p>
        </div>

        <div className="flex items-start gap-2 rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3">
          <Info className="mt-0.5 size-4 shrink-0 text-blue-500" />
          <p className="text-xs text-blue-600 dark:text-blue-400">
            Prioridad: Calendario personal del empleado → Días fijos del empleado → Días fijos de la sucursal.
            El punto violeta indica empleados con calendario personal configurado.
          </p>
        </div>

        <DiasNoLaborables
          sucursales={sucursales ?? []}
          empleados={empleados ?? []}
          diasSucursal={diasSucursal ?? []}
          diasEmpleado={diasEmpleado ?? []}
          fechasNoLaborablesEmpleado={fechasNoLaborablesEmpleado ?? []}
        />
      </section>
    </div>
  );
}
