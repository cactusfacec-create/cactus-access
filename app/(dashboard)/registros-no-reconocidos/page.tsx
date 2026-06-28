import { createClient } from "@/lib/supabase/server";
import { requireCliente } from "@/lib/auth/guards";
import { PageShell } from "@/components/cactus/page-shell";
import { RefreshButton } from "@/components/cactus/refresh-button";
import { listPendientes } from "@/actions/registros-no-reconocidos.actions";
import { RegistrosNoReconocidosTable } from "./_components/registros-no-reconocidos-table";

export default async function RegistrosNoReconocidosPage() {
  const { profile } = await requireCliente();
  const supabase = await createClient();

  const [registros, { data: sucursales }] = await Promise.all([
    listPendientes(),
    supabase
      .from("sucursales")
      .select("*")
      .eq("id_empresa", profile.id_empresa)
      .order("nombre_sucursal"),
  ]);

  return (
    <PageShell
      title="Registros No Reconocidos"
      description="Marcaciones del biométrico de cédulas que todavía no tienen un empleado registrado"
      actions={<RefreshButton />}
    >
      <RegistrosNoReconocidosTable registros={registros} sucursales={sucursales ?? []} />
    </PageShell>
  );
}
