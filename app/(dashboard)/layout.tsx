import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, getSession } from "@/lib/auth/session";
import { checkLimiteDisponible } from "@/lib/auth/license-limits";
import { SidebarCliente } from "@/components/layout/sidebar-cliente";
import { MobileNav } from "@/components/layout/mobile-nav";
import { LicenseGuardBanner } from "@/components/layout/license-guard-banner";
import { TrialBanner } from "@/components/layout/trial-banner";
import { TrialModal } from "@/components/layout/trial-modal";
import { Footer } from "@/components/layout/footer";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  if (!user) redirect("/login");

  const profile = await getProfile(user.id);
  if (!profile || profile.rol !== "cliente") redirect("/admin");
  if (!profile.id_empresa) redirect("/login");

  const supabase = await createClient();
  const [{ data: licencia }, { data: empresa }] = await Promise.all([
    supabase.from("licencias").select("*").eq("id_empresa", profile.id_empresa).single(),
    supabase
      .from("empresas")
      .select("nombre_empresa")
      .eq("id", profile.id_empresa)
      .single(),
  ]);

  const licenciaVencida =
    licencia?.activa &&
    licencia.fecha_vencimiento != null &&
    new Date(licencia.fecha_vencimiento.slice(0, 10) + "T23:59:59") < new Date();

  if (!licencia || !licencia.activa || licenciaVencida) redirect("/cuenta-suspendida");

  const [empleadosUsage, sucursalesUsage] = await Promise.all([
    checkLimiteDisponible({ idEmpresa: profile.id_empresa, recurso: "empleados" }),
    checkLimiteDisponible({ idEmpresa: profile.id_empresa, recurso: "sucursales" }),
  ]);

  const empresaNombre = empresa?.nombre_empresa ?? "Mi empresa";

  // Calcular días restantes de prueba (solo aplica cuando plan_tipo === 'prueba')
  const esPrueba = licencia.plan_tipo === "prueba";
  const diasRestantesPrueba = esPrueba
    ? Math.max(0, Math.ceil(
        (new Date(licencia.fecha_vencimiento).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      ))
    : null;

  return (
    <div className="flex min-h-dvh flex-col bg-background lg:flex-row lg:gap-3 lg:p-3">
      <MobileNav nombreEmpresa={empresaNombre} />
      <SidebarCliente nombreEmpresa={empresaNombre} diasRestantesPrueba={diasRestantesPrueba} />
      <div className="flex flex-1 flex-col lg:min-h-[calc(100dvh-1.5rem)]">
        <main className="flex-1">
          <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-4 pt-4 sm:px-6 sm:pt-6">
            {esPrueba && diasRestantesPrueba !== null && (
              <TrialBanner diasRestantes={diasRestantesPrueba} />
            )}
            <LicenseGuardBanner usages={[empleadosUsage, sucursalesUsage]} />
          </div>
          {children}
        </main>
        <Footer />
        {esPrueba && diasRestantesPrueba !== null && diasRestantesPrueba <= 3 && (
          <TrialModal diasRestantes={diasRestantesPrueba} />
        )}
      </div>
    </div>
  );
}
