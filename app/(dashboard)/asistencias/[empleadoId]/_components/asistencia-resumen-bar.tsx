"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  diasTrabajados: number;
  faltasJustificadas: number;
  faltasNoJustificadas: number;
  totalDiasHabiles: number;
}

export function AsistenciaResumenBar({
  diasTrabajados,
  faltasJustificadas,
  faltasNoJustificadas,
  totalDiasHabiles,
}: Props) {
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setFilled(true), 80);
    return () => clearTimeout(t);
  }, []);

  const pct = (n: number) =>
    totalDiasHabiles > 0 ? `${(n / totalDiasHabiles) * 100}%` : "0%";

  const asistenciaPct =
    totalDiasHabiles > 0 ? Math.round((diasTrabajados / totalDiasHabiles) * 100) : 0;

  const pctColor =
    asistenciaPct >= 80
      ? "text-lime-600 dark:text-lime-400"
      : asistenciaPct >= 60
        ? "text-amber-600 dark:text-amber-400"
        : "text-red-600 dark:text-red-400";

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Resumen del período
        </span>
        {totalDiasHabiles > 0 && (
          <span className={cn("text-sm font-bold tabular-nums", pctColor)}>
            {asistenciaPct}% asistencia
          </span>
        )}
      </div>

      {/* Segmented bar */}
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted/60">
        <div
          className="h-full rounded-l-full bg-lime-400 transition-all duration-700 ease-out"
          style={{ width: filled ? pct(diasTrabajados) : "0%" }}
        />
        {faltasJustificadas > 0 && (
          <div
            className="h-full bg-amber-400 transition-all duration-700 ease-out"
            style={{
              width: filled ? pct(faltasJustificadas) : "0%",
              transitionDelay: "80ms",
            }}
          />
        )}
        {faltasNoJustificadas > 0 && (
          <div
            className="h-full rounded-r-full bg-red-500 transition-all duration-700 ease-out"
            style={{
              width: filled ? pct(faltasNoJustificadas) : "0%",
              transitionDelay: "160ms",
            }}
          />
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2 shrink-0 rounded-full bg-lime-400" />
          {diasTrabajados} trabajado{diasTrabajados !== 1 ? "s" : ""}
        </span>
        {faltasJustificadas > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="size-2 shrink-0 rounded-full bg-amber-400" />
            {faltasJustificadas} justificada{faltasJustificadas !== 1 ? "s" : ""}
          </span>
        )}
        {faltasNoJustificadas > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="size-2 shrink-0 rounded-full bg-red-500" />
            {faltasNoJustificadas} sin justificar
          </span>
        )}
        {totalDiasHabiles > 0 && (
          <span className="ml-auto text-muted-foreground/60">
            {totalDiasHabiles} día{totalDiasHabiles !== 1 ? "s" : ""} hábil{totalDiasHabiles !== 1 ? "es" : ""}
          </span>
        )}
      </div>
    </div>
  );
}
