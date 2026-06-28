"use client";

import { useState, useTransition } from "react";
import {
  CheckCircle2,
  ChevronDown,
  Clock,
  Package,
  PackageCheck,
  Truck,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { updateEstadoPedido } from "@/actions/admin/tienda.actions";
import type { PedidoConDetalles, EstadoPedidoTienda } from "@/actions/admin/tienda.actions";

const ESTADO_CONFIG: Record<
  EstadoPedidoTienda,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  pendiente_pago: {
    label: "Pendiente pago",
    color: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-500/20",
    icon: <Clock className="size-3.5" />,
  },
  pagado: {
    label: "Pagado",
    color: "text-blue-700 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-500/20",
    icon: <CheckCircle2 className="size-3.5" />,
  },
  en_preparacion: {
    label: "En preparación",
    color: "text-violet-700 dark:text-violet-400",
    bg: "bg-violet-100 dark:bg-violet-500/20",
    icon: <Package className="size-3.5" />,
  },
  enviado: {
    label: "Enviado",
    color: "text-indigo-700 dark:text-indigo-400",
    bg: "bg-indigo-100 dark:bg-indigo-500/20",
    icon: <Truck className="size-3.5" />,
  },
  entregado: {
    label: "Entregado",
    color: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-500/20",
    icon: <PackageCheck className="size-3.5" />,
  },
  cancelado: {
    label: "Cancelado",
    color: "text-red-700 dark:text-red-400",
    bg: "bg-red-100 dark:bg-red-500/20",
    icon: <X className="size-3.5" />,
  },
};

const ESTADOS_ORDEN: EstadoPedidoTienda[] = [
  "pendiente_pago",
  "pagado",
  "en_preparacion",
  "enviado",
  "entregado",
  "cancelado",
];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-EC", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtMoney(n: number) {
  return new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" }).format(n);
}

function EstadoBadge({ estado }: { estado: EstadoPedidoTienda }) {
  const cfg = ESTADO_CONFIG[estado];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        cfg.bg,
        cfg.color,
      )}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

function EstadoSelector({
  pedidoId,
  estadoActual,
}: {
  pedidoId: string;
  estadoActual: EstadoPedidoTienda;
}) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  function cambiar(nuevo: EstadoPedidoTienda) {
    setOpen(false);
    startTransition(async () => {
      await updateEstadoPedido(pedidoId, nuevo);
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={isPending}
        className="flex items-center gap-1.5 rounded-lg border border-border bg-muted px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/80 disabled:opacity-50"
      >
        Cambiar estado
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-1 min-w-[180px] overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
            {ESTADOS_ORDEN.map((e) => {
              const cfg = ESTADO_CONFIG[e];
              return (
                <button
                  key={e}
                  type="button"
                  onClick={() => cambiar(e)}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-xs transition-colors hover:bg-muted",
                    e === estadoActual && "font-semibold",
                  )}
                >
                  <span className={cfg.color}>{cfg.icon}</span>
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function PedidoRow({ pedido }: { pedido: PedidoConDetalles }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        className="cursor-pointer border-b border-border/50 transition-colors hover:bg-muted/30"
        onClick={() => setExpanded((e) => !e)}
      >
        <td className="py-3 pl-4 pr-2">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">{pedido.empresa_nombre}</span>
            <span className="font-mono text-[11px] text-muted-foreground">
              {pedido.id.slice(0, 8).toUpperCase()}
            </span>
          </div>
        </td>
        <td className="px-2 py-3">
          <div className="flex flex-col gap-0.5">
            {pedido.items.map((item) => (
              <span key={item.id} className="text-xs text-foreground">
                {item.nombre_producto} ×{item.cantidad}
              </span>
            ))}
          </div>
        </td>
        <td className="px-2 py-3">
          <span className="text-sm font-bold tabular-nums text-foreground">
            {fmtMoney(pedido.monto_total)}
          </span>
        </td>
        <td className="px-2 py-3">
          <EstadoBadge estado={pedido.estado} />
        </td>
        <td className="px-2 py-3 text-xs text-muted-foreground">{fmtDate(pedido.created_at)}</td>
        <td className="px-2 py-3 pr-4" onClick={(e) => e.stopPropagation()}>
          <EstadoSelector pedidoId={pedido.id} estadoActual={pedido.estado} />
        </td>
      </tr>

      {expanded && (
        <tr className="border-b border-border/30 bg-muted/10">
          <td colSpan={6} className="px-4 py-3">
            <div className="grid gap-2 text-xs sm:grid-cols-3">
              <div>
                <p className="font-semibold text-foreground">Dirección de entrega</p>
                <p className="mt-0.5 text-muted-foreground">{pedido.direccion_entrega}</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">Teléfono</p>
                <p className="mt-0.5 text-muted-foreground">{pedido.telefono_contacto}</p>
              </div>
              {pedido.notas && (
                <div>
                  <p className="font-semibold text-foreground">Notas</p>
                  <p className="mt-0.5 text-muted-foreground">{pedido.notas}</p>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export function PedidosView({ pedidos }: { pedidos: PedidoConDetalles[] }) {
  if (!pedidos.length) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <span className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <Package className="size-6" />
        </span>
        <p className="text-sm text-muted-foreground">No hay pedidos registrados aún.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {["Empresa", "Productos", "Total", "Estado", "Fecha", "Acción"].map((h) => (
                <th
                  key={h}
                  className="px-2 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground first:pl-4 last:pr-4"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pedidos.map((p) => (
              <PedidoRow key={p.id} pedido={p} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
