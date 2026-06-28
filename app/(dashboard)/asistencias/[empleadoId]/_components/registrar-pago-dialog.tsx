"use client";

import { useState, useTransition } from "react";
import { DollarSign } from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { registrarPago } from "@/actions/pagos.actions";
import type { RegistrarPagoInput } from "@/actions/pagos.actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { formatMoney, formatHoras } from "@/lib/nomina";

interface Props {
  idEmpleado: string;
  nombreEmpleado: string;
  periodoDesde: string;
  periodoHasta: string;
  preloaded: Omit<RegistrarPagoInput, "notas">;
  deduccionAdelantos?: number;
  cantidadAdelantos?: number;
}

export function RegistrarPagoDialog({
  idEmpleado,
  nombreEmpleado,
  periodoDesde,
  periodoHasta,
  preloaded,
  deduccionAdelantos = 0,
  cantidadAdelantos = 0,
}: Props) {
  const [open, setOpen] = useState(false);
  const [notas, setNotas] = useState("");
  const [ajuste, setAjuste] = useState(0);
  const [isPending, startTransition] = useTransition();

  const total = Math.round((preloaded.montoTotal + ajuste) * 100) / 100;

  function handleSubmit() {
    startTransition(async () => {
      const res = await registrarPago({
        ...preloaded,
        montoTotal: total,
        notas,
      });
      if (res.ok) {
        toast.success("Pago registrado correctamente");
        setOpen(false);
        setNotas("");
        setAjuste(0);
      } else {
        toast.error(res.error);
      }
    });
  }

  const labelPeriodo = `${format(parseISO(periodoDesde), "d MMM", { locale: es })} – ${format(parseISO(periodoHasta), "d MMM yyyy", { locale: es })}`;

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm" variant="outline" className="gap-2">
        <DollarSign className="size-4" />
        Registrar pago
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Registrar pago de sueldo</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {/* Period summary */}
            <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm">
              <p className="font-medium text-foreground">{nombreEmpleado}</p>
              <p className="text-xs text-muted-foreground">{labelPeriodo}</p>
            </div>

            {/* Breakdown */}
            <div className="flex flex-col gap-2 rounded-xl border border-border px-4 py-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Salario base ({preloaded.diasTrabajados} días)
                </span>
                <span className="tabular-nums">{formatMoney(preloaded.salarioBase)}</span>
              </div>
              {preloaded.pagoHorasExtra > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Horas extra ({formatHoras(preloaded.minutosExtraTotal)})
                  </span>
                  <span className="tabular-nums text-emerald-600 dark:text-emerald-400">
                    +{formatMoney(preloaded.pagoHorasExtra)}
                  </span>
                </div>
              )}
              {preloaded.deduccionAtrasos > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Atrasos ({formatHoras(preloaded.minutosAtrasoTotal)})
                  </span>
                  <span className="tabular-nums text-red-600 dark:text-red-400">
                    -{formatMoney(preloaded.deduccionAtrasos)}
                  </span>
                </div>
              )}
              {preloaded.deduccionFaltas > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Faltas ({preloaded.faltasNoJustificadas})
                  </span>
                  <span className="tabular-nums text-red-600 dark:text-red-400">
                    -{formatMoney(preloaded.deduccionFaltas)}
                  </span>
                </div>
              )}
              {deduccionAdelantos > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Adelantos ({cantidadAdelantos})
                  </span>
                  <span className="tabular-nums text-red-600 dark:text-red-400">
                    -{formatMoney(deduccionAdelantos)}
                  </span>
                </div>
              )}
            </div>

            {/* Manual adjustment */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ajuste-manual">
                Ajuste manual{" "}
                <span className="text-muted-foreground">(+ / - opcional)</span>
              </Label>
              <Input
                id="ajuste-manual"
                type="number"
                step={0.01}
                placeholder="0.00"
                value={ajuste === 0 ? "" : ajuste}
                onChange={(e) => setAjuste(Number(e.target.value) || 0)}
              />
            </div>

            {/* Total highlight */}
            <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
              <span className="text-sm font-medium text-muted-foreground">Total a pagar</span>
              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatMoney(total)}
              </span>
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="notas-pago">
                Notas <span className="text-muted-foreground">(opcional)</span>
              </Label>
              <Input
                id="notas-pago"
                placeholder="Ej: Incluye bono de puntualidad"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !isPending && handleSubmit()}
              />
            </div>
          </div>

          <DialogFooter showCloseButton>
            <Button onClick={handleSubmit} disabled={isPending || total < 0}>
              <DollarSign className="size-4" />
              {isPending ? "Registrando…" : `Confirmar ${formatMoney(total)}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
