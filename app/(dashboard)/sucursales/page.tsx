import { createClient } from "@/lib/supabase/server";
import { requireCliente } from "@/lib/auth/guards";
import { PageShell } from "@/components/cactus/page-shell";
import { RefreshButton } from "@/components/cactus/refresh-button";
import { SucursalesTable } from "./_components/sucursales-table";
import { SucursalFormDialog } from "./_components/sucursal-form-dialog";

export default async function SucursalesPage() {
  const { profile } = await requireCliente();
  const supabase = await createClient();
  const { data: sucursales } = await supabase
    .from("sucursales")
    .select("*")
    .eq("id_empresa", profile.id_empresa)
    .order("nombre_sucursal");

  return (
    <PageShell
      title="Sucursales"
      description="Administra las sucursales de tu empresa y el biométrico de cada una"
      actions={
        <div className="flex items-center gap-2">
          <RefreshButton />
          <SucursalFormDialog mode="create" />
        </div>
      }
    >
      <SucursalesTable sucursales={sucursales ?? []} />
    </PageShell>
  );
}
