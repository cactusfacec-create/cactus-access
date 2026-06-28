import { createClient } from "@/lib/supabase/server";
import { requireCliente } from "@/lib/auth/guards";
import { PageShell } from "@/components/cactus/page-shell";
import { RefreshButton } from "@/components/cactus/refresh-button";
import { EmpleadosTable } from "./_components/empleados-table";
import { EmpleadoFormDialog } from "./_components/empleado-form-dialog";

export default async function EmpleadosPage() {
  const { profile } = await requireCliente();
  const supabase = await createClient();

  const [{ data: empleados }, { data: sucursales }] = await Promise.all([
    supabase
      .from("empleados")
      .select("*")
      .eq("id_empresa", profile.id_empresa)
      .order("nombre"),
    supabase
      .from("sucursales")
      .select("*")
      .eq("id_empresa", profile.id_empresa)
      .order("nombre_sucursal"),
  ]);

  const empleadoIds = (empleados ?? []).map((e) => e.id);
  const { data: horariosEmpleados } =
    empleadoIds.length > 0
      ? await supabase.from("horarios_empleados").select("*").in("id_empleado", empleadoIds)
      : { data: [] };

  return (
    <PageShell
      title="Empleados"
      description="Vincula a tus empleados con su cédula, sucursal y horario"
      actions={
        <div className="flex items-center gap-2">
          <RefreshButton />
          <EmpleadoFormDialog mode="create" sucursales={sucursales ?? []} />
        </div>
      }
    >
      <EmpleadosTable
        empleados={empleados ?? []}
        sucursales={sucursales ?? []}
        horariosEmpleados={horariosEmpleados ?? []}
      />
    </PageShell>
  );
}
