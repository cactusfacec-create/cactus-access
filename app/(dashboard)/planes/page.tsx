import { requireCliente } from "@/lib/auth/guards";
import { getPlanesPublicos } from "@/actions/planes.actions";
import { getPasarelasCliente } from "@/actions/cliente/pago.actions";
import { PeriodoToggle } from "./_components/periodo-toggle";

export default async function PlanesPage() {
  const { profile } = await requireCliente();
  const [planes, pasarelas] = await Promise.all([
    getPlanesPublicos(),
    getPasarelasCliente(),
  ]);

  const planPro = planes.find((p) => p.id === "pro");
  const planMax = planes.find((p) => p.id === "max");

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-10 p-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="inline-flex items-center rounded-full bg-lime-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-lime-400/15 dark:text-lime-300 animate-in fade-in slide-in-from-top-3 duration-400">
          Planes
        </span>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-backwards" style={{ animationDelay: "80ms" }}>
          Elige el plan ideal para tu empresa
        </h1>
        <p className="max-w-md text-sm text-muted-foreground animate-in fade-in duration-400 fill-mode-backwards" style={{ animationDelay: "180ms" }}>
          Crece sin preocuparte por los límites: cambia de plan cuando lo necesites.
        </p>
      </div>

      {planPro && planMax ? (
        <PeriodoToggle
          planPro={planPro}
          planMax={planMax}
          pasarelas={pasarelas}
        />
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          Planes no disponibles. Contáctanos por WhatsApp.
        </p>
      )}
    </div>
  );
}
