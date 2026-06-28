import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  nombre: string;
  descripcion: string;
  precio?: { monto: string; periodo: string };
  caracteristicas: string[];
  destacado?: boolean;
  cta: {
    label: string;
    href: string;
    variant?: "default" | "outline";
    external?: boolean;
  };
}

export function PricingCard({
  nombre,
  descripcion,
  precio,
  caracteristicas,
  destacado,
  cta,
}: PricingCardProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col gap-6 rounded-3xl bg-card p-6",
        destacado ? "shadow-xl ring-2 ring-lime-300" : "shadow-[0px_4px_20px_rgba(0,0,0,0.03)]",
      )}
    >
      {destacado ? (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-lime-400 px-3 py-1 text-xs font-semibold text-emerald-950 shadow-sm">
          Más popular
        </span>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <h3 className="text-lg font-semibold text-foreground">{nombre}</h3>
        <p className="text-sm text-muted-foreground">{descripcion}</p>
      </div>

      {precio ? (
        <p className="flex items-baseline gap-1">
          <span className="text-4xl font-bold tracking-tight text-foreground">{precio.monto}</span>
          <span className="text-sm text-muted-foreground">{precio.periodo}</span>
        </p>
      ) : (
        <p className="text-2xl font-semibold text-foreground">A tu medida</p>
      )}

      <ul className="flex flex-1 flex-col gap-3">
        {caracteristicas.map((caracteristica) => (
          <li key={caracteristica} className="flex items-start gap-2 text-sm text-foreground">
            <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-lime-100 text-emerald-700 dark:bg-lime-400/15 dark:text-lime-300">
              <Check className="size-3" />
            </span>
            {caracteristica}
          </li>
        ))}
      </ul>

      <Button
        render={
          <Link
            href={cta.href}
            target={cta.external ? "_blank" : undefined}
            rel={cta.external ? "noopener noreferrer" : undefined}
          />
        }
        nativeButton={false}
        variant={cta.variant ?? "default"}
        className={cn(
          "w-full justify-center rounded-full",
          destacado &&
            (cta.variant ?? "default") === "default" &&
            "bg-lime-400 text-emerald-950 hover:bg-lime-400/90",
        )}
      >
        {cta.label}
      </Button>
    </div>
  );
}
