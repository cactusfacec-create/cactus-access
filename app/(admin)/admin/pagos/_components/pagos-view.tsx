"use client";

import { useState, useMemo } from "react";
import {
  CreditCard,
  Banknote,
  ArrowLeftRight,
  List,
  CalendarDays,
  ExternalLink,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Pago } from "@/lib/types/database.types";

type PagoConNombre = Pago & { empresa_nombre: string };

const METODO_ICON: Record<string, React.ReactNode> = {
  tarjeta: <CreditCard className="size-3.5" />,
  efectivo: <Banknote className="size-3.5" />,
  transferencia: <ArrowLeftRight className="size-3.5" />,
};

const METODO_COLOR: Record<string, string> = {
  tarjeta: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  efectivo: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  transferencia: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
};

const PLAN_COLOR: Record<string, string> = {
  pro: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  max: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  personalizado: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-EC", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtMoney(n: number) {
  return new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" }).format(n);
}

function PagoRow({ pago }: { pago: PagoConNombre }) {
  return (
    <tr className="border-b border-border/50 transition-colors hover:bg-muted/30">
      <td className="py-3 pl-4 pr-2">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">{pago.empresa_nombre}</span>
          <span className="text-xs text-muted-foreground">{fmtDate(pago.created_at)}</span>
        </div>
      </td>
      <td className="px-2 py-3">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium capitalize",
            METODO_COLOR[pago.metodo_pago] ?? "bg-muted text-muted-foreground",
          )}
        >
          {METODO_ICON[pago.metodo_pago]}
          {pago.metodo_pago}
        </span>
      </td>
      <td className="px-2 py-3 font-mono text-sm tabular-nums text-foreground">
        {fmtMoney(pago.monto)}
      </td>
      <td className="px-2 py-3">
        <div className="flex flex-col gap-0.5">
          <span
            className={cn(
              "inline-block max-w-fit rounded-full px-2 py-0.5 text-xs font-medium capitalize",
              PLAN_COLOR[pago.plan_tipo] ?? "bg-muted text-muted-foreground",
            )}
          >
            {pago.plan_tipo}
          </span>
          <span className="text-xs capitalize text-muted-foreground">{pago.periodo_facturacion}</span>
        </div>
      </td>
      <td className="px-2 py-3">
        <div className="flex flex-col text-xs">
          <span className="text-foreground">{fmtDate(pago.fecha_desde)}</span>
          <span className="text-muted-foreground">→ {fmtDate(pago.fecha_hasta)}</span>
        </div>
      </td>
      <td className="px-2 py-3">
        {pago.codigo_transaccion ? (
          <span className="font-mono text-xs text-muted-foreground">{pago.codigo_transaccion}</span>
        ) : (
          <span className="text-xs text-muted-foreground/40">—</span>
        )}
      </td>
      <td className="px-2 py-3">
        {pago.comprobante_url ? (
          <a
            href={pago.comprobante_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary underline-offset-2 hover:underline"
          >
            Ver <ExternalLink className="size-3" />
          </a>
        ) : (
          <span className="text-xs text-muted-foreground/40">—</span>
        )}
      </td>
      <td className="px-2 py-3 pr-4">
        {pago.aprobado_por ? (
          <span className="text-xs text-muted-foreground">{pago.aprobado_por}</span>
        ) : (
          <span className="text-xs text-muted-foreground/40">—</span>
        )}
      </td>
    </tr>
  );
}

function DayGroup({ date, pagos }: { date: string; pagos: PagoConNombre[] }) {
  const total = pagos.reduce((s, p) => s + p.monto, 0);
  return (
    <div className="flex flex-col gap-0">
      <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2">
        <div className="flex items-center gap-2">
          <CalendarDays className="size-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {new Date(date + "T12:00:00").toLocaleDateString("es-EC", {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
        <span className="text-xs font-semibold tabular-nums text-foreground">
          {fmtMoney(total)} · {pagos.length} pago{pagos.length !== 1 ? "s" : ""}
        </span>
      </div>
      <table className="w-full">
        <tbody>
          {pagos.map((p) => (
            <PagoRow key={p.id} pago={p} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PagosView({ pagos }: { pagos: PagoConNombre[] }) {
  const [view, setView] = useState<"lista" | "dia">("lista");
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      pagos.filter(
        (p) =>
          p.empresa_nombre.toLowerCase().includes(search.toLowerCase()) ||
          p.metodo_pago.includes(search.toLowerCase()) ||
          p.plan_tipo.includes(search.toLowerCase()) ||
          (p.codigo_transaccion ?? "").toLowerCase().includes(search.toLowerCase()),
      ),
    [pagos, search],
  );

  const totalGeneral = filtered.reduce((s, p) => s + p.monto, 0);

  const byDay = useMemo(() => {
    const map = new Map<string, PagoConNombre[]>();
    for (const p of filtered) {
      const day = p.created_at.slice(0, 10);
      if (!map.has(day)) map.set(day, []);
      map.get(day)!.push(p);
    }
    return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a));
  }, [filtered]);

  return (
    <div className="flex flex-col gap-4">
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Total recaudado</p>
          <p className="mt-0.5 text-xl font-bold tabular-nums text-foreground">
            {fmtMoney(totalGeneral)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Transacciones</p>
          <p className="mt-0.5 text-xl font-bold tabular-nums text-foreground">{filtered.length}</p>
        </div>
        {(["tarjeta", "transferencia"] as const).map((m) => {
          const total = filtered.filter((p) => p.metodo_pago === m).reduce((s, p) => s + p.monto, 0);
          return (
            <div key={m} className="rounded-2xl border border-border bg-card px-4 py-3">
              <p className="flex items-center gap-1.5 text-xs capitalize text-muted-foreground">
                {METODO_ICON[m]} {m}
              </p>
              <p className="mt-0.5 text-xl font-bold tabular-nums text-foreground">
                {fmtMoney(total)}
              </p>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar empresa, método, plan…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex items-center rounded-xl border border-border bg-muted/30 p-1">
          <button
            type="button"
            onClick={() => setView("lista")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              view === "lista"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <List className="size-3.5" />
            Lista general
          </button>
          <button
            type="button"
            onClick={() => setView("dia")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              view === "dia"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <CalendarDays className="size-3.5" />
            Por día
          </button>
        </div>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-16 text-center">
          <CreditCard className="size-8 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">Sin transacciones</p>
          <p className="text-xs text-muted-foreground/60">
            Registra el primer pago desde la tabla de empresas.
          </p>
        </div>
      ) : view === "lista" ? (
        <div className="overflow-hidden rounded-2xl border border-border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {["Empresa", "Método", "Monto", "Plan", "Vigencia", "Código", "Comprobante", "Admin"].map((h) => (
                    <th key={h} className="px-2 py-2.5 pl-4 text-left text-xs font-semibold text-muted-foreground first:pl-4 last:pr-4">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <PagoRow key={p.id} pago={p} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border">
          {byDay.map(([date, dayPagos]) => (
            <DayGroup key={date} date={date} pagos={dayPagos} />
          ))}
        </div>
      )}
    </div>
  );
}
