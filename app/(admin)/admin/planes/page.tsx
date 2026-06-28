import { getPlanes } from "@/actions/admin/planes.actions";
import { PageShell } from "@/components/cactus/page-shell";
import { PlanPrecioForm } from "./_components/plan-precio-form";

export default async function PlanesAdminPage() {
  const planes = await getPlanes();

  const planPro = planes.find((p) => p.id === "pro");
  const planMax = planes.find((p) => p.id === "max");

  const emptyPlan = (id: string) => ({
    id,
    precio_trimestral: 0,
    precio_semestral: 0,
    precio_anual: 0,
    limite_sucursales: 1,
    limite_empleados: 5,
    updated_at: new Date().toISOString(),
  });

  return (
    <PageShell
      title="Configuración de planes"
      description="Define precios y límites para cada plan. Se aplican automáticamente al asignar un plan a una empresa."
    >
      <div className="flex flex-col gap-6">
        <PlanPrecioForm plan={planPro ?? emptyPlan("pro")} />
        <PlanPrecioForm plan={planMax ?? emptyPlan("max")} />
      </div>
    </PageShell>
  );
}
