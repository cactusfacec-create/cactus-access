"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/cactus/status-badge";
import { cn } from "@/lib/utils";
import type { Licencia } from "@/lib/types/database.types";
import type { LicenseUsage } from "@/lib/types/domain";

function nombrePlan(licencia: Licencia | null): string {
  if (!licencia) return "Sin plan";
  if (!licencia.plan_tipo) return "Plan Personalizado";
  const nombres: Record<string, string> = {
    pro: "Plan Pro",
    max: "Plan Max",
    personalizado: "Plan Personalizado",
    prueba: "Prueba gratuita",
  };
  return nombres[licencia.plan_tipo] ?? "Plan";
}

const PERIODOS: Record<string, string> = {
  trimestral: "trimestre",
  semestral: "semestre",
  anual: "año",
};

const PERIODO_MESES: Record<string, number> = {
  trimestral: 3,
  semestral: 6,
  anual: 12,
};

function calcularFechaHasta(
  fechaVencimiento: string,
  periodo: string,
): string {
  const meses = PERIODO_MESES[periodo] ?? 3;
  const base = new Date(fechaVencimiento) > new Date()
    ? new Date(fechaVencimiento)
    : new Date();
  base.setMonth(base.getMonth() + meses);
  return base.toISOString().slice(0, 10);
}

function RecursoBar({ label, usage, delay = 0 }: { label: string; usage: LicenseUsage; delay?: number }) {
  const ratio = usage.limite > 0 ? Math.min(1, usage.actual / usage.limite) : 0;
  const alcanzado = usage.limite > 0 && usage.actual >= usage.limite;
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setFilled(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className={cn("text-sm font-bold tabular-nums", alcanzado ? "text-destructive" : "text-foreground")}>
          {usage.actual}/{usage.limite > 0 ? usage.limite : "∞"}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-[width] ease-out", alcanzado ? "bg-destructive" : "bg-success")}
          style={{
            width: filled ? `${ratio * 100}%` : "0%",
            transitionDuration: filled ? "800ms" : "0ms",
          }}
        />
      </div>
    </div>
  );
}

function TrialDaysBar({ fechaVencimiento, delay = 0 }: { fechaVencimiento: string; delay?: number }) {
  const TOTAL_DIAS = 15;
  const diasRestantes = Math.max(
    0,
    Math.ceil((new Date(fechaVencimiento).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
  );
  const ratio = diasRestantes / TOTAL_DIAS;
  const urgente = diasRestantes <= 3;
  const moderado = diasRestantes > 3 && diasRestantes <= 7;
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setFilled(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Días de prueba</span>
        <span
          className={cn(
            "text-sm font-bold tabular-nums",
            urgente ? "text-destructive" : moderado ? "text-amber-600 dark:text-amber-400" : "text-foreground",
          )}
        >
          {diasRestantes}/{TOTAL_DIAS}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-[width] ease-out",
            urgente ? "bg-destructive" : moderado ? "bg-amber-400" : "bg-lime-400",
          )}
          style={{
            width: filled ? `${ratio * 100}%` : "0%",
            transitionDuration: filled ? "800ms" : "0ms",
          }}
        />
      </div>
    </div>
  );
}

export function LicenciaResumenCard({
  licencia,
  empleadosUsage,
  sucursalesUsage,
  pasarelas,
}: {
  licencia: Licencia | null;
  empleadosUsage: LicenseUsage;
  sucursalesUsage: LicenseUsage;
  pasarelas: { dlocalgo: boolean };
}) {
  const vencida =
    !licencia || !licencia.activa || new Date(licencia.fecha_vencimiento) < new Date();

  const esPersonalizado =
    licencia?.plan_tipo === "personalizado" &&
    licencia.precio != null &&
    licencia.precio > 0 &&
    licencia.periodo_facturacion != null;

  const esPrueba = licencia?.plan_tipo === "prueba";
  const hayPasarela = pasarelas.dlocalgo;

  return (
    <div className="flex flex-col gap-6 rounded-xl border border-border bg-card p-8 shadow-sm">
      <div className="flex flex-col gap-2">
        <div className="flex items-end justify-between gap-2">
          <span className="text-2xl font-bold tracking-tight text-foreground">
            {nombrePlan(licencia)}
          </span>
          {licencia?.plan_tipo === "prueba" ? (
            <span className="rounded-full bg-lime-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-lime-400/15 dark:text-lime-300">
              Gratis
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={vencida ? "vencida" : "activa"} />
          {licencia ? (
            <span className="text-xs text-muted-foreground">
              Fecha de corte: {new Date(licencia.fecha_vencimiento).toLocaleDateString("es-EC")}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-5 border-t border-border pt-5">
        <RecursoBar label="Sucursales" usage={sucursalesUsage} delay={150} />
        <RecursoBar label="Empleados" usage={empleadosUsage} delay={350} />
        {esPrueba && (
          <TrialDaysBar fechaVencimiento={licencia!.fecha_vencimiento} delay={550} />
        )}
      </div>

      {/* Footer */}
      {!esPersonalizado && (
        <div className="border-t border-border pt-5">
          {esPrueba ? (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-muted-foreground">
                Estás en período de prueba. Elige un plan para continuar.
              </p>
              <Button
                render={<Link href="/planes" />}
                nativeButton={false}
                size="sm"
                className="w-full justify-center gap-1.5 rounded-full bg-lime-400 text-emerald-950 hover:bg-lime-400/90"
              >
                <Sparkles className="size-3.5" />
                Ver planes disponibles
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">¿Necesitas más sucursales o empleados?</p>
              <Button
                render={<Link href="/planes" />}
                nativeButton={false}
                variant="outline"
                size="sm"
                className="shrink-0 gap-1.5 rounded-full"
              >
                Mejorar plan
                <ArrowRight className="size-3.5" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
