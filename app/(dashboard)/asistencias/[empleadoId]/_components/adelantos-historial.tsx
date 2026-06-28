"use client";

import { useTransition } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { HandCoins, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { eliminarAdelanto } from "@/actions/adelantos.actions";
import { ConfirmDialog } from "@/components/cactus/confirm-dialog";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/nomina";
import type { AdelantoEmpleado } from "@/lib/types/database.types";

function AdelantoRow({ adelanto }: { adelanto: AdelantoEmpleado }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const res = await eliminarAdelanto(adelanto.id);
      if (!res.ok) toast.error(res.error);
      else toast.success("Adelanto eliminado");
    });
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-3.5 shadow-sm">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
        <HandCoins className="size-4 text-amber-600 dark:text-amber-400" />
      </div>

      <div className="flex flex-1 flex-col gap-0.5 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold tabular-nums text-amber-600 dark:text-amber-400">
            {formatMoney(adelanto.monto)}
          </span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {format(parseISO(adelanto.fecha), "d MMM yyyy", { locale: es })}
          </span>
        </div>
        {adelanto.descripcion && (
          <p className="truncate text-xs text-muted-foreground">{adelanto.descripcion}</p>
        )}
      </div>

      <ConfirmDialog
        trigger={
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={isPending}
            aria-label="Eliminar adelanto"
            className="shrink-0 text-muted-foreground transition-colors duration-200 hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-3.5" />
          </Button>
        }
        title="Eliminar adelanto"
        description="¿Eliminar este registro? El adelanto en sí no se revierte, solo el historial."
        confirmLabel="Eliminar"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}

export function AdelantosHistorial({ adelantos }: { adelantos: AdelantoEmpleado[] }) {
  if (adelantos.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-8 text-center">
        <HandCoins className="size-6 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">Sin adelantos registrados</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {adelantos.map((a) => (
        <AdelantoRow key={a.id} adelanto={a} />
      ))}
    </div>
  );
}
