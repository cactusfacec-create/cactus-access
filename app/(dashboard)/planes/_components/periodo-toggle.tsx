"use client";

import { useState } from "react";
import { Check, MessageCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BotonesPago } from "@/components/cactus/botones-pago";
import { cn } from "@/lib/utils";
import type { Plan } from "@/lib/types/database.types";

type Periodo = "trimestral" | "semestral" | "anual";

const PERIODOS: { key: Periodo; label: string; meses: number }[] = [
  { key: "trimestral", label: "Trimestral", meses: 3 },
  { key: "semestral", label: "Semestral", meses: 6 },
  { key: "anual", label: "Anual", meses: 12 },
];

function getPrecio(plan: Plan, periodo: Periodo): number {
  if (periodo === "trimestral") return plan.precio_trimestral;
  if (periodo === "semestral") return plan.precio_semestral;
  return plan.precio_anual;
}

function addMonths(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

function PrecioMensual({ total, meses }: { total: number; meses: number }) {
  const mensual = meses > 0 ? total / meses : 0;
  return (
    <p className="flex items-baseline gap-1">
      <span className="text-4xl font-bold tracking-tight text-foreground">
        ${mensual % 1 === 0 ? mensual : mensual.toFixed(2)}
      </span>
      <span className="text-sm text-muted-foreground">/mes</span>
      {meses > 1 && (
        <span className="ml-1 text-xs text-muted-foreground">
          (${total} / {meses === 3 ? "trimestre" : meses === 6 ? "semestre" : "año"})
        </span>
      )}
    </p>
  );
}

const WHATSAPP_NUMBER = "593980004089";
function buildWhatsAppLink(mensaje: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;
}

export function PeriodoToggle({
  planPro,
  planMax,
  pasarelas,
}: {
  planPro: Plan;
  planMax: Plan;
  pasarelas: { dlocalgo: boolean };
}) {
  const [periodo, setPeriodo] = useState<Periodo>("anual");
  const { meses } = PERIODOS.find((p) => p.key === periodo)!;

  const precioProTotal = getPrecio(planPro, periodo);
  const precioMaxTotal = getPrecio(planMax, periodo);
  const fechaHasta = addMonths(meses);
  const hayPasarela = pasarelas.dlocalgo;

  const caracteristicasPro = [
    `${planPro.limite_sucursales} sucursal${planPro.limite_sucursales !== 1 ? "es" : ""}`,
    `Hasta ${planPro.limite_empleados} trabajadores`,
    "Registro biométrico de asistencia",
    "Reportes de pre-nómina",
  ];

  const caracteristicasMax = [
    `${planMax.limite_sucursales} sucursales`,
    `Hasta ${planMax.limite_empleados} trabajadores`,
    "Registro biométrico de asistencia",
    "Reportes de pre-nómina",
    "Soporte prioritario",
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Toggle de período */}
      <div className="flex justify-center animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-backwards" style={{ animationDelay: "240ms" }}>
        <div className="inline-flex rounded-full border border-border bg-muted p-1">
          {PERIODOS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriodo(p.key)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-150",
                periodo === p.key
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="grid gap-6 md:grid-cols-3 md:items-start">

        {/* Plan Pro */}
        <div className="relative flex flex-col gap-6 rounded-3xl bg-card p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] animate-in fade-in slide-in-from-bottom-3 duration-400 fill-mode-backwards" style={{ animationDelay: "320ms" }}>
          <div className="flex flex-col gap-1.5">
            <h3 className="text-lg font-semibold text-foreground">Plan Pro</h3>
            <p className="text-sm text-muted-foreground">
              Para empresas que están comenzando a digitalizar su asistencia.
            </p>
          </div>
          <div key={periodo} className="animate-in fade-in slide-in-from-bottom-1 duration-200">
            <PrecioMensual total={precioProTotal} meses={meses} />
          </div>
          <ul className="flex flex-1 flex-col gap-3">
            {caracteristicasPro.map((c) => (
              <li key={c} className="flex items-start gap-2 text-sm text-foreground">
                <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-lime-100 text-emerald-700 dark:bg-lime-400/15 dark:text-lime-300">
                  <Check className="size-3" />
                </span>
                {c}
              </li>
            ))}
          </ul>

          {hayPasarela ? (
            <BotonesPago
              planTipo="pro"
              periodoFacturacion={periodo}
              monto={precioProTotal}
              fechaHasta={fechaHasta}
              limiteSucursales={planPro.limite_sucursales}
              limiteEmpleados={planPro.limite_empleados}
              pasarelas={pasarelas}
              layout="col"
            />
          ) : (
            <Button
              render={
                <Link
                  href={buildWhatsAppLink(
                    `Hola, quiero contratar el Plan Pro (${periodo}) de Cactus Access.`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
              nativeButton={false}
              className="w-full justify-center rounded-full"
            >
              <MessageCircle className="size-4" />
              Contratar Plan Pro
            </Button>
          )}
        </div>

        {/* Plan Max */}
        <div className="relative flex flex-col gap-6 rounded-3xl bg-card p-6 shadow-xl ring-2 ring-lime-300 animate-in fade-in slide-in-from-bottom-4 duration-400 fill-mode-backwards" style={{ animationDelay: "420ms" }}>
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-lime-400 px-3 py-1 text-xs font-semibold text-emerald-950 shadow-sm">
            Más popular
          </span>
          <div className="flex flex-col gap-1.5">
            <h3 className="text-lg font-semibold text-foreground">Plan Max</h3>
            <p className="text-sm text-muted-foreground">
              Para empresas en crecimiento con más de una sucursal.
            </p>
          </div>
          <div key={periodo} className="animate-in fade-in slide-in-from-bottom-1 duration-200">
            <PrecioMensual total={precioMaxTotal} meses={meses} />
          </div>
          <ul className="flex flex-1 flex-col gap-3">
            {caracteristicasMax.map((c) => (
              <li key={c} className="flex items-start gap-2 text-sm text-foreground">
                <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-lime-100 text-emerald-700 dark:bg-lime-400/15 dark:text-lime-300">
                  <Check className="size-3" />
                </span>
                {c}
              </li>
            ))}
          </ul>

          {hayPasarela ? (
            <BotonesPago
              planTipo="max"
              periodoFacturacion={periodo}
              monto={precioMaxTotal}
              fechaHasta={fechaHasta}
              limiteSucursales={planMax.limite_sucursales}
              limiteEmpleados={planMax.limite_empleados}
              pasarelas={pasarelas}
              layout="col"
            />
          ) : (
            <Button
              render={
                <Link
                  href={buildWhatsAppLink(
                    `Hola, quiero contratar el Plan Max (${periodo}) de Cactus Access.`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
              nativeButton={false}
              className="w-full justify-center rounded-full bg-lime-400 text-emerald-950 hover:bg-lime-400/90"
            >
              <MessageCircle className="size-4" />
              Contratar Plan Max
            </Button>
          )}
        </div>

        {/* Plan Personalizado — siempre WhatsApp */}
        <div className="relative flex flex-col gap-6 rounded-3xl bg-card p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] animate-in fade-in slide-in-from-bottom-3 duration-400 fill-mode-backwards" style={{ animationDelay: "510ms" }}>
          <div className="flex flex-col gap-1.5">
            <h3 className="text-lg font-semibold text-foreground">Plan Personalizado</h3>
            <p className="text-sm text-muted-foreground">
              Cotiza el plan que se adapte a tu número de sucursales y empleados.
            </p>
          </div>
          <p className="text-2xl font-semibold text-foreground">A tu medida</p>
          <ul className="flex flex-1 flex-col gap-3">
            {["Sucursales a tu medida", "Empleados a tu medida", "Onboarding asistido", "Soporte dedicado"].map((c) => (
              <li key={c} className="flex items-start gap-2 text-sm text-foreground">
                <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-lime-100 text-emerald-700 dark:bg-lime-400/15 dark:text-lime-300">
                  <Check className="size-3" />
                </span>
                {c}
              </li>
            ))}
          </ul>
          <Button
            render={
              <Link
                href={buildWhatsAppLink(
                  "Hola, quiero cotizar un plan personalizado para mi empresa en Cactus Access.",
                )}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
            nativeButton={false}
            variant="outline"
            className="w-full justify-center rounded-full"
          >
            <MessageCircle className="size-4" />
            Hablar con ventas
          </Button>
        </div>

      </div>
    </div>
  );
}
