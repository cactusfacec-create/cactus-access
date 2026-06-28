"use client";

import { useState, useTransition } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Edit2,
  Package,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toggleProductoActivo, deleteProducto } from "@/actions/admin/tienda.actions";
import { ProductoFormDialog } from "./producto-form-dialog";
import type { ProductoTienda } from "@/lib/types/database.types";

function fmtPrice(n: number) {
  return new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" }).format(n);
}

function SpecChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
      {label}
    </span>
  );
}

function buildSpecChips(specs: Record<string, unknown> | null): string[] {
  if (!specs) return [];
  const chips: string[] = [];
  if (specs.capacidad_facial) chips.push(`${specs.capacidad_facial} facial`);
  if (specs.capacidad_huella) chips.push(`${specs.capacidad_huella} huellas`);
  if (specs.capacidad_tarjeta) chips.push(`${specs.capacidad_tarjeta} tarjetas`);
  if (Array.isArray(specs.conectividad)) chips.push(...(specs.conectividad as string[]));
  if (specs.pantalla) chips.push(String(specs.pantalla));
  if (specs.garantia) chips.push(String(specs.garantia));
  if (specs.temperatura) chips.push("Temperatura");
  return chips;
}

function DeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const [confirm, setConfirm] = useState(false);

  if (confirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">¿Seguro?</span>
        <button
          type="button"
          onClick={() =>
            startTransition(async () => {
              await deleteProducto(id);
              setConfirm(false);
            })
          }
          disabled={isPending}
          className="rounded-lg bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/20 disabled:opacity-50"
        >
          {isPending ? "…" : "Eliminar"}
        </button>
        <button
          type="button"
          onClick={() => setConfirm(false)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirm(true)}
      disabled={isPending}
      className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
      aria-label="Eliminar producto"
    >
      <Trash2 className="size-4" />
    </button>
  );
}

function ToggleActivoButton({ id, activo }: { id: string; activo: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() =>
        startTransition(async () => {
          await toggleProductoActivo(id, !activo);
        })
      }
      disabled={isPending}
      className={cn(
        "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-40",
        activo
          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400"
          : "bg-muted text-muted-foreground hover:bg-muted/80",
      )}
      aria-label={activo ? "Desactivar producto" : "Activar producto"}
    >
      {activo ? (
        <>
          <ToggleRight className="size-3.5" />
          Activo
        </>
      ) : (
        <>
          <ToggleLeft className="size-3.5" />
          Inactivo
        </>
      )}
    </button>
  );
}

function ProductoRow({
  producto,
  onEdit,
}: {
  producto: ProductoTienda;
  onEdit: (p: ProductoTienda) => void;
}) {
  const chips = buildSpecChips(producto.specs);

  return (
    <tr className="border-b border-border/50 transition-colors hover:bg-muted/20">
      <td className="py-3 pl-4 pr-2">
        <div className="flex items-center gap-3">
          {producto.imagen_url ? (
            <img
              src={producto.imagen_url}
              alt={producto.nombre}
              loading="lazy"
              className="size-10 shrink-0 rounded-lg object-cover"
            />
          ) : (
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Package className="size-5" />
            </div>
          )}
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-foreground">{producto.nombre}</span>
            {producto.descripcion && (
              <span className="line-clamp-1 max-w-xs text-xs text-muted-foreground">
                {producto.descripcion}
              </span>
            )}
          </div>
        </div>
      </td>
      <td className="px-2 py-3">
        <span className="text-sm font-bold tabular-nums text-foreground">
          {fmtPrice(Number(producto.precio))}
        </span>
      </td>
      <td className="px-2 py-3">
        <div className="flex flex-wrap gap-1">
          {chips.slice(0, 4).map((c) => (
            <SpecChip key={c} label={c} />
          ))}
          {chips.length > 4 && (
            <SpecChip label={`+${chips.length - 4}`} />
          )}
        </div>
      </td>
      <td className="px-2 py-3 text-xs text-muted-foreground tabular-nums">
        {producto.orden_display}
      </td>
      <td className="px-2 py-3">
        <ToggleActivoButton id={producto.id} activo={producto.activo} />
      </td>
      <td className="py-3 pr-4">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(producto)}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Editar producto"
          >
            <Edit2 className="size-4" />
          </button>
          <DeleteButton id={producto.id} />
        </div>
      </td>
    </tr>
  );
}

export function ProductosAdminView({ productos }: { productos: ProductoTienda[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<ProductoTienda | null>(null);

  function openCreate() {
    setEditando(null);
    setDialogOpen(true);
  }

  function openEdit(p: ProductoTienda) {
    setEditando(p);
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditando(null);
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {productos.length}
          </span>
          producto{productos.length !== 1 ? "s" : ""} en catálogo
          {productos.some((p) => !p.activo) && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
              <AlertTriangle className="size-3" />
              {productos.filter((p) => !p.activo).length} inactivos
            </span>
          )}
          {productos.every((p) => p.activo) && productos.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
              <CheckCircle2 className="size-3" />
              Todos activos
            </span>
          )}
        </div>
        <Button onClick={openCreate} className="rounded-xl">
          <Plus className="size-4" />
          Nuevo producto
        </Button>
      </div>

      {/* Table */}
      {productos.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Package className="size-6" />
          </span>
          <div>
            <p className="font-semibold text-foreground">Sin productos</p>
            <p className="text-sm text-muted-foreground">
              Crea el primer producto para que aparezca en la tienda.
            </p>
          </div>
          <Button onClick={openCreate} className="mt-2 rounded-xl">
            <Plus className="size-4" />
            Crear primer producto
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {["Producto", "Precio", "Especificaciones", "Orden", "Estado", "Acciones"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-2 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground first:pl-4 last:pr-4"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {productos.map((p) => (
                  <ProductoRow key={p.id} producto={p} onEdit={openEdit} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ProductoFormDialog
        open={dialogOpen}
        onClose={closeDialog}
        producto={editando}
      />
    </>
  );
}
