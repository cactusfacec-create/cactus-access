import { getAllPedidos } from "@/actions/admin/tienda.actions";
import { PageShell } from "@/components/cactus/page-shell";
import { PedidosView } from "./_components/pedidos-view";

export default async function PedidosTiendaPage() {
  const pedidos = await getAllPedidos();

  return (
    <PageShell
      title="Pedidos tienda"
      description="Gestión de pedidos de dispositivos biométricos"
    >
      <PedidosView pedidos={pedidos} />
    </PageShell>
  );
}
