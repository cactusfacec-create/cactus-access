import { getAllPagos } from "@/actions/admin/pagos.actions";
import { PageShell } from "@/components/cactus/page-shell";
import { PagosView } from "./_components/pagos-view";

export default async function PagosPage() {
  const pagos = await getAllPagos();

  return (
    <PageShell
      title="Transacciones"
      description="Historial de todos los pagos registrados en la plataforma"
    >
      <PagosView pagos={pagos} />
    </PageShell>
  );
}
