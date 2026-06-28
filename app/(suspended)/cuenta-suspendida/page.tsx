import { AlertTriangle, MessageCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BotonesPago } from "@/components/cactus/botones-pago";
import { SignOutButton } from "@/components/cactus/sign-out-button";
import { signOut } from "@/actions/auth.actions";
import { buildWhatsAppLink } from "@/lib/soporte";
import { getSession, getProfile } from "@/lib/auth/session";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { getPlanesPublicos } from "@/actions/planes.actions";
import { getPasarelasCliente } from "@/actions/cliente/pago.actions";
import { PeriodoToggle } from "@/app/(dashboard)/planes/_components/periodo-toggle";

const PERIODO_MESES: Record<string, number> = {
  trimestral: 3,
  semestral: 6,
  anual: 12,
};

function fechaHasta(periodo: string): string {
  const d = new Date();
  d.setMonth(d.getMonth() + (PERIODO_MESES[periodo] ?? 12));
  return d.toISOString().slice(0, 10);
}

export default async function CuentaSuspendidaPage() {
  const user = await getSession();
  const profile = user ? await getProfile(user.id) : null;

  const [planes, pasarelas] = await Promise.all([
    getPlanesPublicos(),
    getPasarelasCliente(),
  ]);

  let licenciaData: {
    plan_tipo: string | null;
    precio: number | null;
    periodo_facturacion: string | null;
    limite_sucursales: number;
    limite_empleados: number;
    fecha_vencimiento: string;
  } | null = null;

  if (profile?.id_empresa) {
    const supabase = createServiceRoleClient();
    const { data } = await supabase
      .from("licencias")
      .select("*")
      .eq("id_empresa", profile.id_empresa)
      .single();
    licenciaData = data;
  }

  // Hay un plan negociado pendiente de pago si precio > 0 y plan_tipo no es ya uno pagado
  const tienePersonalizado =
    licenciaData != null &&
    licenciaData.precio != null &&
    licenciaData.precio > 0 &&
    licenciaData.periodo_facturacion != null &&
    licenciaData.plan_tipo !== "pro" &&
    licenciaData.plan_tipo !== "max";

  const planPro = planes.find((p) => p.id === "pro");
  const planMax = planes.find((p) => p.id === "max");
  const hayPasarela = pasarelas.dlocalgo;

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col items-center gap-3 text-center animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-backwards" style={{ animationDelay: "80ms" }}>
        <span className="flex size-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
          <AlertTriangle className="size-6" />
        </span>
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-foreground">
            Tu período de prueba ha terminado
          </h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            Para seguir usando Cactus Access elige un plan o comunícate con nosotros.
          </p>
        </div>
      </div>

      {/* Plan personalizado negociado */}
      {tienePersonalizado && licenciaData && (
        <div className="w-full rounded-2xl border border-violet-200 bg-violet-50 p-6 dark:border-violet-800 dark:bg-violet-950/40 animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-backwards" style={{ animationDelay: "160ms" }}>
          <div className="mb-4 flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/50">
              <Zap className="size-5 text-violet-600 dark:text-violet-400" />
            </span>
            <div>
              <p className="font-semibold text-violet-900 dark:text-violet-200">
                Plan personalizado negociado
              </p>
              <p className="text-sm text-violet-700 dark:text-violet-400">
                ${licenciaData.precio}{" "}
                <span className="text-xs font-normal">
                  / {licenciaData.periodo_facturacion} ·{" "}
                  {licenciaData.limite_sucursales} sucursal
                  {licenciaData.limite_sucursales !== 1 ? "es" : ""} ·{" "}
                  {licenciaData.limite_empleados} empleados
                </span>
              </p>
            </div>
          </div>
          {hayPasarela ? (
            <BotonesPago
              planTipo="personalizado"
              periodoFacturacion={licenciaData.periodo_facturacion!}
              monto={licenciaData.precio!}
              fechaHasta={fechaHasta(licenciaData.periodo_facturacion!)}
              limiteSucursales={licenciaData.limite_sucursales}
              limiteEmpleados={licenciaData.limite_empleados}
              pasarelas={pasarelas}
              layout="row"
            />
          ) : (
            <Button
              render={
                <a
                  href={buildWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
              nativeButton={false}
              className="w-full justify-center gap-1.5 rounded-full bg-violet-600 text-white hover:bg-violet-700"
            >
              <MessageCircle className="size-4" />
              Pagar por WhatsApp
            </Button>
          )}
        </div>
      )}

      {/* Planes disponibles */}
      {planPro && planMax ? (
        <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-backwards" style={{ animationDelay: "220ms" }}>
          <p className="mb-4 text-center text-sm font-medium text-muted-foreground">
            {tienePersonalizado ? "O elige un plan estándar:" : "Elige el plan ideal para tu empresa:"}
          </p>
          <PeriodoToggle planPro={planPro} planMax={planMax} pasarelas={pasarelas} />
        </div>
      ) : null}

      {/* Acciones */}
      <div className="flex w-full max-w-xs flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-backwards" style={{ animationDelay: "300ms" }}>
        <Button
          render={
            <a href={buildWhatsAppLink()} target="_blank" rel="noopener noreferrer" />
          }
          nativeButton={false}
          variant="outline"
          className="w-full justify-center gap-1.5 rounded-full"
        >
          <MessageCircle className="size-4" />
          Contactar a soporte
        </Button>
        <form action={signOut} className="w-full">
          <SignOutButton variant="outline" />
        </form>
      </div>
    </div>
  );
}
