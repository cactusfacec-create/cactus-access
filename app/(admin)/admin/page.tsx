import { listEmpresasConLicencias } from "@/actions/admin/empresas.actions";
import { getPasarelasDisponibles } from "@/actions/admin/payment-gateway.actions";
import { PageShell } from "@/components/cactus/page-shell";
import { EmpresasTable } from "./_components/empresas-table";
import { AdminStats } from "./_components/admin-stats";
import { RefreshButton } from "@/components/cactus/refresh-button";

export default async function AdminPage() {
  const [empresas, pasarelas] = await Promise.all([
    listEmpresasConLicencias(),
    getPasarelasDisponibles(),
  ]);

  return (
    <PageShell
      title="Empresas"
      description="Administra licencias y el acceso de todas las empresas de Cactus Access"
      actions={<RefreshButton />}
    >
      <AdminStats empresas={empresas} />
      <EmpresasTable empresas={empresas} pasarelas={pasarelas} />
    </PageShell>
  );
}
