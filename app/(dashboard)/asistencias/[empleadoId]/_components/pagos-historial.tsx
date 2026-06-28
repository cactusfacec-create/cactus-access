"use client";

import { useTransition } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Banknote, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { eliminarPago } from "@/actions/pagos.actions";
import { ConfirmDialog } from "@/components/cactus/confirm-dialog";
import { Button } from "@/components/ui/button";
import { formatMoney, formatHoras } from "@/lib/nomina";
import type { PagoEmpleado } from "@/lib/types/database.types";

interface Props {
  pagos: PagoEmpleado[];
}

function formatPeriodo(desde: string, hasta: string) {
  const d = format(parseISO(desde), "d MMM", { locale: es });
  const h = format(parseISO(hasta), "d MMM yyyy", { locale: es });
  return `${d} – ${h}`;
}

function PagoRow({ pago }: { pago: PagoEmpleado }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const res = await eliminarPago(pago.id);
      if (!res.ok) toast.error(res.error);
      else toast.success("Pago eliminado");
    });
  }

  const hasBreakdown = pago.salario_base > 0;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card px-5 py-4 shadow-sm">
      {/* Top row: icon + amount + date + delete */}
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
          <Banknote className="size-5 text-emerald-600 dark:text-emerald-400" />
        </div>

        <div className="flex flex-1 flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
              {formatMoney(pago.monto_total)}
            </span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {formatPeriodo(pago.periodo_desde, pago.periodo_hasta)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {pago.dias_trabajados} día{pago.dias_trabajados !== 1 ? "s" : ""}
            {" · "}
            {pago.tipo_salario === "mensual"
              ? `${formatMoney(pago.salario_diario)}/mes`
              : `${formatMoney(pago.salario_diario)}/día`}
            {" · "}
            {format(parseISO(pago.created_at), "d MMM yyyy", { locale: es })}
          </p>
        </div>

        <ConfirmDialog
          trigger={
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={isPending}
              aria-label="Eliminar pago"
              className="shrink-0 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-3.5" />
            </Button>
          }
          title="Eliminar registro de pago"
          description="¿Eliminar este registro? El pago en sí no se revierte, solo el historial."
          confirmLabel="Eliminar"
          variant="destructive"
          onConfirm={handleDelete}
        />
      </div>

      {/* Breakdown (if available) */}
      {hasBreakdown && (
        <div className="flex flex-col gap-1 rounded-xl border border-border bg-muted/30 px-4 py-3">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Salario base ({pago.dias_trabajados} días)</span>
            <span className="tabular-nums">{formatMoney(pago.salario_base)}</span>
          </div>
          {pago.pago_horas_extra > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">
                Horas extra ({formatHoras(pago.minutos_extra_total)})
              </span>
              <span className="tabular-nums text-emerald-600 dark:text-emerald-400">
                +{formatMoney(pago.pago_horas_extra)}
              </span>
            </div>
          )}
          {pago.deduccion_atrasos_val > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">
                Atrasos ({formatHoras(pago.minutos_atraso_total)})
              </span>
              <span className="tabular-nums text-red-600 dark:text-red-400">
                -{formatMoney(pago.deduccion_atrasos_val)}
              </span>
            </div>
          )}
          {pago.deduccion_faltas_val > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">
                Faltas ({pago.faltas_no_justificadas})
              </span>
              <span className="tabular-nums text-red-600 dark:text-red-400">
                -{formatMoney(pago.deduccion_faltas_val)}
              </span>
            </div>
          )}
        </div>
      )}

      {pago.notas && (
        <p className="truncate text-xs text-muted-foreground/80">{pago.notas}</p>
      )}
    </div>
  );
}

export function PagosHistorial({ pagos }: Props) {
  if (pagos.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-10 text-center">
        <Banknote className="size-6 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">Sin pagos registrados aún</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {pagos.map((p) => (
        <PagoRow key={p.id} pago={p} />
      ))}
    </div>
  );
}
