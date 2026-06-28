import { createClient } from "@/lib/supabase/server";
import { requireCliente } from "@/lib/auth/guards";
import { checkLimiteDisponible } from "@/lib/auth/license-limits";
import { getPasarelasCliente } from "@/actions/cliente/pago.actions";
import { PageShell } from "@/components/cactus/page-shell";
import { EmpresaForm } from "./_components/empresa-form";
import { LicenciaResumenCard } from "./_components/licencia-resumen-card";
import { PlanNegociadoCard } from "./_components/plan-negociado-card";
import { SeguridadCard } from "./_components/seguridad-card";

export default async function EmpresaPage() {
  const { profile } = await requireCliente();
  const supabase = await createClient();

  const [{ data: empresa }, { data: licencia }, empleadosUsage, sucursalesUsage, pasarelas] =
    await Promise.all([
      supabase.from("empresas").select("*").eq("id", profile.id_empresa).single(),
      supabase.from("licencias").select("*").eq("id_empresa", profile.id_empresa).single(),
      checkLimiteDisponible({ idEmpresa: profile.id_empresa, recurso: "empleados" }),
      checkLimiteDisponible({ idEmpresa: profile.id_empresa, recurso: "sucursales" }),
      getPasarelasCliente(),
    ]);

  // Plan negociado pendiente: admin configuró precio/periodo pero aún no hay pago registrado
  // (plan_tipo sigue siendo "prueba" o cualquier otro — no cambia hasta el pago)
  const tieneNegociadoPendiente =
    licencia != null &&
    licencia.precio != null &&
    licencia.precio > 0 &&
    licencia.periodo_facturacion != null &&
    licencia.plan_tipo !== "personalizado" &&
    licencia.plan_tipo !== "pro" &&
    licencia.plan_tipo !== "max";

  return (
    <PageShell title="Empresa" description="Datos generales de tu empresa">
      <div className="flex flex-col items-start justify-start gap-6 lg:flex-row">
        <div className="flex w-full max-w-xl flex-col gap-6">
          {empresa ? <EmpresaForm empresa={empresa} /> : null}
          {empresa ? (
            <SeguridadCard otpRequerido={empresa.otp_requerido ?? true} />
          ) : null}
        </div>
        <div className="flex w-full max-w-sm flex-col gap-4 lg:sticky lg:top-6">
          <LicenciaResumenCard
            licencia={licencia}
            empleadosUsage={empleadosUsage}
            sucursalesUsage={sucursalesUsage}
            pasarelas={pasarelas}
          />
          {tieneNegociadoPendiente && licencia && (
            <PlanNegociadoCard licencia={licencia} pasarelas={pasarelas} />
          )}
        </div>
      </div>
    </PageShell>
  );
}
