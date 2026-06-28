import { getAllProductos } from "@/actions/admin/tienda.actions";
import { PageShell } from "@/components/cactus/page-shell";
import { ProductosAdminView } from "./_components/productos-admin-view";

export default async function AdminTiendaPage() {
  const productos = await getAllProductos();

  return (
    <PageShell
      title="Catálogo de tienda"
      description="Gestiona los productos biométricos disponibles para los clientes"
    >
      <ProductosAdminView productos={productos} />
    </PageShell>
  );
}
