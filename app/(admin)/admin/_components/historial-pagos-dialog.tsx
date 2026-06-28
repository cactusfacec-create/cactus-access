"use client";

import { useState, useEffect } from "react";
import {
  Banknote,
  ArrowLeftRight,
  CreditCard,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Receipt,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getPagosPorEmpresa } from "@/actions/admin/pagos.actions";
import { cn } from "@/lib/utils";
import type { Pago, Licencia } from "@/lib/types/database.types";

const METODO_ICON: Record<string, React.ReactNode> = {
  tarjeta: <CreditCard className="size-3.5" />,
  efectivo: <Banknote className="size-3.5" />,
  transferencia: <ArrowLeftRight className="size-3.5" />,
};

const METODO_LABEL: Record<string, string> = {
  tarjeta: "Tarjeta",
  efectivo: "Efectivo",
  transferencia: "Transferencia",
};

const METODO_COLOR: Record<string, string> = {
  tarjeta: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  efectivo: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  transferencia: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
};

const PLAN_LABEL: Record<string, string> = {
  pro: "Pro",
  max: "Max",
  personalizado: "Personalizado",
  prueba: "Prueba",
};

const PLAN_COLOR: Record<string, string> = {
  pro: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  max: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  personalizado: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  prueba: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
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

function LicenciaCard({ licencia }: { licencia: Licencia }) {
  const vence = new Date(licencia.fecha_vencimiento);
  const now = new Date();
  const expired = vence < now;
  const diasRestantes = Math.ceil((vence.getTime() - now.getTime()) / 86_400_000);

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border px-4 py-3",
        licencia.activa && !expired
          ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/20"
          : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20",
      )}
    >
      <div className="mt-0.5 shrink-0">
        {licencia.activa && !expired ? (
          <CheckCircle2 className="size-4 text-emerald-600" />
        ) : (
          <XCircle className="size-4 text-red-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-block rounded-full px-2 py-0.5 text-xs font-semibold",
              PLAN_COLOR[licencia.plan_tipo ?? "prueba"] ?? "bg-zinc-100 text-zinc-600",
            )}
          >
            {PLAN_LABEL[licencia.plan_tipo ?? "prueba"] ?? licencia.plan_tipo}
          </span>
          {licencia.periodo_facturacion && (
            <span className="text-xs capitalize text-muted-foreground">
              {licencia.periodo_facturacion}
            </span>
          )}
          <span
            className={cn(
              "text-xs font-medium",
              licencia.activa && !expired ? "text-emerald-700 dark:text-emerald-400" : "text-red-600",
            )}
          >
            {licencia.activa && !expired ? "Activa" : expired ? "Vencida" : "Inactiva"}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Vence:{" "}
          <span className={cn("font-medium", expired ? "text-red-600" : "text-foreground")}>
            {fmtDate(licencia.fecha_vencimiento)}
          </span>
          {!expired && diasRestantes > 0 && (
            <span className="ml-1 text-muted-foreground/70">
              ({diasRestantes} día{diasRestantes !== 1 ? "s" : ""} restante{diasRestantes !== 1 ? "s" : ""})
            </span>
          )}
        </p>
        <p className="text-xs text-muted-foreground">
          Límites: {licencia.limite_sucursales} sucursal{licencia.limite_sucursales !== 1 ? "es" : ""} ·{" "}
          {licencia.limite_empleados} empleado{licencia.limite_empleados !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}

function PagoCard({ pago }: { pago: Pago }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:bg-muted/20">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              METODO_COLOR[pago.metodo_pago] ?? "bg-muted text-muted-foreground",
            )}
          >
            {METODO_ICON[pago.metodo_pago]}
            {METODO_LABEL[pago.metodo_pago] ?? pago.metodo_pago}
          </span>
          <span
            className={cn(
              "inline-block rounded-full px-2 py-0.5 text-xs font-medium",
              PLAN_COLOR[pago.plan_tipo] ?? "bg-muted text-muted-foreground",
            )}
          >
            {PLAN_LABEL[pago.plan_tipo] ?? pago.plan_tipo}
          </span>
          <span className="text-xs capitalize text-muted-foreground">{pago.periodo_facturacion}</span>
        </div>
        <span className="shrink-0 font-mono text-sm font-semibold tabular-nums text-foreground">
          {fmtMoney(pago.monto)}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <CalendarDays className="size-3.5" />
          {fmtDate(pago.fecha_desde)} → {fmtDate(pago.fecha_hasta)}
        </span>
        {pago.codigo_transaccion && (
          <span className="font-mono text-muted-foreground/70">#{pago.codigo_transaccion}</span>
        )}
        {pago.comprobante_url && (
          <a
            href={pago.comprobante_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-primary hover:underline"
          >
            Comprobante <ExternalLink className="size-3" />
          </a>
        )}
        {pago.aprobado_por && (
          <span className="text-muted-foreground/60">por {pago.aprobado_por}</span>
        )}
      </div>

      {pago.notas && (
        <p className="text-xs italic text-muted-foreground/70">{pago.notas}</p>
      )}

      <div className="flex items-center gap-1 text-xs text-muted-foreground/50">
        <Clock className="size-3" />
        {new Date(pago.created_at).toLocaleString("es-EC", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    </div>
  );
}

export function HistorialPagosDialog({
  idEmpresa,
  nombreEmpresa,
  licencia,
  open,
  onOpenChange,
}: {
  idEmpresa: string;
  nombreEmpresa: string;
  licencia: Licencia | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getPagosPorEmpresa(idEmpresa)
      .then(setPagos)
      .finally(() => setLoading(false));
  }, [open, idEmpresa]);

  const total = pagos.reduce((s, p) => s + p.monto, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-lg flex-col gap-0 p-0">
        <DialogHeader className="shrink-0 border-b border-border px-4 py-4">
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="size-4 text-muted-foreground" />
            Historial de pagos — {nombreEmpresa}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
          {/* Estado actual de licencia */}
          {licencia ? (
            <LicenciaCard licencia={licencia} />
          ) : (
            <div className="rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
              Esta empresa no tiene licencia activa
            </div>
          )}

          {/* Historial */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Pagos registrados
              </h3>
              {pagos.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {pagos.length} pago{pagos.length !== 1 ? "s" : ""} · {fmtMoney(total)} total
                </span>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col gap-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-24 animate-pulse rounded-xl border border-border bg-muted/40"
                  />
                ))}
              </div>
            ) : pagos.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-10 text-center">
                <CreditCard className="size-7 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">Sin pagos registrados</p>
                <p className="text-xs text-muted-foreground/60">
                  Los pagos manuales aparecerán aquí
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {pagos.map((pago) => (
                  <PagoCard key={pago.id} pago={pago} />
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
