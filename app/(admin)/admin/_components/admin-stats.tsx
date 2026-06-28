import { Building2, CheckCircle2, AlertTriangle, PackageX } from "lucide-react";
import { StatCard } from "@/components/cactus/stat-card";
import type { EmpresaConLicencia } from "@/lib/types/domain";

export function AdminStats({ empresas }: { empresas: EmpresaConLicencia[] }) {
  const total = empresas.length;
  const activas = empresas.filter((e) => e.licencia?.activa).length;
  const sinPlan = empresas.filter((e) => !e.licencia).length;

  const hoy = new Date();
  const en30Dias = new Date(hoy);
  en30Dias.setDate(en30Dias.getDate() + 30);

  const porVencer = empresas.filter((e) => {
    if (!e.licencia?.activa) return false;
    const vence = new Date(e.licencia.fecha_vencimiento);
    return vence >= hoy && vence <= en30Dias;
  }).length;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard
        label="Total empresas"
        value={total}
        icon={<Building2 className="size-4" />}
      />
      <StatCard
        label="Activas"
        value={activas}
        delta={total > 0 ? `${Math.round((activas / total) * 100)}% del total` : undefined}
        icon={<CheckCircle2 className="size-4" />}
      />
      <StatCard
        label="Vencen en 30 días"
        value={porVencer}
        tone={porVencer > 0 ? "warn" : "neutral"}
        icon={<AlertTriangle className="size-4" />}
      />
      <StatCard
        label="Sin plan"
        value={sinPlan}
        tone={sinPlan > 0 ? "warn" : "neutral"}
        icon={<PackageX className="size-4" />}
      />
    </div>
  );
}
