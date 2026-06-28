"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/cactus/status-badge";
import { EmptyState } from "@/components/cactus/empty-state";
import { EmpresaActionsMenu } from "./empresa-actions-menu";
import { cn } from "@/lib/utils";
import type { EmpresaConLicencia } from "@/lib/types/domain";

const PLAN_STYLES: Record<string, string> = {
  prueba: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  pro: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  max: "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300",
  personalizado: "bg-secondary text-secondary-foreground",
};

function CompanyAvatar({ name }: { name: string }) {
  const initial = name.charAt(0).toUpperCase();
  const hue = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <span
      className="flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
      style={{ backgroundColor: `hsl(${hue} 55% 45%)` }}
    >
      {initial}
    </span>
  );
}

function UsageBar({ actual, limite, label }: { actual: number; limite: number; label: string }) {
  const ratio = limite > 0 ? Math.min(actual / limite, 1) : 0;
  const isOver = actual > limite;
  return (
    <div className="flex flex-col gap-0.5 min-w-[100px]">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] text-muted-foreground">{label}</span>
        <span className={cn("text-[10px] font-medium tabular-nums", isOver ? "text-destructive" : "text-foreground")}>
          {actual}/{limite}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            isOver ? "bg-destructive" : ratio > 0.8 ? "bg-amber-500" : "bg-primary",
          )}
          style={{ width: `${Math.round(ratio * 100)}%` }}
        />
      </div>
    </div>
  );
}

function ExpiryDate({ fecha }: { fecha: string | null }) {
  if (!fecha) return <span className="text-xs text-muted-foreground">—</span>;
  // fecha puede ser "YYYY-MM-DD" o un timestamptz completo — tomamos solo la parte de fecha
  const vence = new Date(fecha.slice(0, 10) + "T00:00:00");
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((vence.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

  const isExpired = diffDays < 0;
  const isWarning = !isExpired && diffDays <= 30;

  return (
    <div className="flex flex-col gap-0.5">
      <span
        className={cn(
          "text-sm tabular-nums",
          isExpired ? "font-medium text-destructive" : isWarning ? "font-medium text-amber-600 dark:text-amber-400" : "text-foreground",
        )}
      >
        {vence.toLocaleDateString("es-EC")}
      </span>
      {isExpired ? (
        <span className="text-[10px] text-destructive">Vencida</span>
      ) : isWarning ? (
        <span className="text-[10px] text-amber-600 dark:text-amber-400">
          {diffDays === 0 ? "Hoy" : `${diffDays}d`}
        </span>
      ) : null}
    </div>
  );
}

export function EmpresasTable({
  empresas,
  pasarelas,
}: {
  empresas: EmpresaConLicencia[];
  pasarelas?: { dlocalgo: boolean };
}) {
  const [search, setSearch] = useState("");

  const filtered = empresas.filter((e) =>
    e.nombre_empresa.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="relative w-full max-w-xs">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar empresa…"
          className="pl-8"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Sin empresas"
          description={search ? "Ninguna empresa coincide con la búsqueda." : "Crea la primera con el botón 'Nueva empresa'."}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Empresa</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">RUC / Tel</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Uso</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Plan</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Vence</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Estado</th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((empresa) => (
                <tr
                  key={empresa.id}
                  className="border-b border-border/60 transition-colors last:border-0 hover:bg-muted/30"
                >
                  {/* Empresa */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <CompanyAvatar name={empresa.nombre_empresa} />
                      <div className="flex flex-col min-w-0">
                        <span className="truncate font-medium text-foreground">
                          {empresa.nombre_empresa}
                        </span>
                        <span className="truncate text-[11px] text-muted-foreground">
                          {empresa.email ?? "Sin email"}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* RUC / Tel */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5 text-xs">
                      <span className="tabular-nums">{empresa.ruc ?? "—"}</span>
                      <span className="text-muted-foreground tabular-nums">{empresa.telefono ?? "—"}</span>
                    </div>
                  </td>

                  {/* Uso */}
                  <td className="px-4 py-3">
                    {empresa.licencia ? (
                      <div className="flex flex-col gap-1.5">
                        <UsageBar
                          actual={empresa.totalSucursales}
                          limite={empresa.licencia.limite_sucursales}
                          label="Sucursales"
                        />
                        <UsageBar
                          actual={empresa.totalEmpleados}
                          limite={empresa.licencia.limite_empleados}
                          label="Empleados"
                        />
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Sin licencia</span>
                    )}
                  </td>

                  {/* Plan */}
                  <td className="px-4 py-3">
                    {empresa.licencia ? (
                      <div className="flex flex-col gap-0.5">
                        <span
                          className={cn(
                            "w-fit rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize",
                            PLAN_STYLES[empresa.licencia.plan_tipo ?? "personalizado"] ?? PLAN_STYLES.personalizado,
                          )}
                        >
                          {empresa.licencia.plan_tipo ?? "—"}
                        </span>
                        {empresa.licencia.periodo_facturacion && empresa.licencia.precio != null ? (
                          <span className="text-[10px] text-muted-foreground tabular-nums">
                            ${empresa.licencia.precio} / {empresa.licencia.periodo_facturacion}
                          </span>
                        ) : null}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>

                  {/* Vence */}
                  <td className="px-4 py-3">
                    {empresa.licencia ? (
                      <ExpiryDate fecha={empresa.licencia.fecha_vencimiento ?? null} />
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>

                  {/* Estado */}
                  <td className="px-4 py-3">
                    <StatusBadge status={empresa.licencia?.activa ? "activa" : "suspendida"} />
                  </td>

                  {/* Acciones */}
                  <td className="px-4 py-3 text-right">
                    <EmpresaActionsMenu empresa={empresa} pasarelas={pasarelas} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
