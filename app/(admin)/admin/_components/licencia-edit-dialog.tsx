"use client";

import { useState, useTransition, useEffect } from "react";
import { Info, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/cactus/loading-button";
import { asignarPlan } from "@/actions/admin/licencias.actions";
import { toast } from "sonner";
import type { Licencia } from "@/lib/types/database.types";

const PERIODO_OPTIONS = [
  { label: "Trimestral (3 meses)", value: "trimestral" },
  { label: "Semestral (6 meses)", value: "semestral" },
  { label: "Anual (12 meses)", value: "anual" },
];

export function LicenciaEditDialog({
  licencia,
  open,
  onOpenChange,
}: {
  licencia: Licencia;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const dialogOpen = isControlled ? open! : internalOpen;
  const setDialogOpen = isControlled
    ? (next: boolean) => onOpenChange?.(next)
    : setInternalOpen;

  const [pending, startTransition] = useTransition();

  const [periodo, setPeriodo] = useState<"trimestral" | "semestral" | "anual">(
    (licencia.periodo_facturacion as "trimestral" | "semestral" | "anual") ?? "anual",
  );
  const [limiteSucursales, setLimiteSucursales] = useState(String(licencia.limite_sucursales));
  const [limiteEmpleados, setLimiteEmpleados] = useState(String(licencia.limite_empleados));
  const [precio, setPrecio] = useState(String(licencia.precio ?? 0));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (dialogOpen) {
      setPeriodo((licencia.periodo_facturacion as "trimestral" | "semestral" | "anual") ?? "anual");
      setLimiteSucursales(String(licencia.limite_sucursales));
      setLimiteEmpleados(String(licencia.limite_empleados));
      setPrecio(String(licencia.precio ?? 0));
      setError(null);
    }
  }, [dialogOpen, licencia]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await asignarPlan({
        idEmpresa: licencia.id_empresa,
        planTipo: "personalizado",
        periodoFacturacion: periodo,
        limiteSucursales: Number(limiteSucursales),
        limiteEmpleados: Number(limiteEmpleados),
        precio: Number(precio),
      });
      if (result.ok) {
        toast.success("Plan configurado", {
          description: "El cliente verá el plan negociado en su panel y podrá pagar para activarlo.",
        });
        setDialogOpen(false);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {!isControlled && (
        <DialogTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label="Editar plan">
              <Settings2 className="size-4" />
            </Button>
          }
        />
      )}
      <DialogContent className="flex max-h-[80vh] flex-col gap-0 p-0">
        <DialogHeader className="shrink-0 border-b border-border px-4 py-4">
          <DialogTitle>Editar plan / licencia</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">

            {/* Aviso informativo */}
            <div className="flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5 text-xs text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
              <Info className="mt-0.5 size-3.5 shrink-0" />
              <span>
                Esto solo configura el plan negociado. La licencia actual no se ve afectada —
                se activará cuando el cliente pague (manual o pasarela).
              </span>
            </div>

            {/* Período */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lp-periodo">Período de facturación</Label>
              <select
                id="lp-periodo"
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value as "trimestral" | "semestral" | "anual")}
                className="h-10 cursor-pointer rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {PERIODO_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Límites y precio */}
            <div className="flex flex-col gap-4 rounded-xl border border-dashed border-border p-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="lp-suc">Límite sucursales</Label>
                  <Input
                    id="lp-suc"
                    type="number"
                    min={0}
                    value={limiteSucursales}
                    onChange={(e) => setLimiteSucursales(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="lp-emp">Límite empleados</Label>
                  <Input
                    id="lp-emp"
                    type="number"
                    min={0}
                    value={limiteEmpleados}
                    onChange={(e) => setLimiteEmpleados(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="lp-precio">Precio negociado ($)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                  <Input
                    id="lp-precio"
                    type="number"
                    min={0}
                    step="0.01"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    className="pl-7"
                  />
                </div>
              </div>
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>
          <DialogFooter className="mx-0 mb-0 shrink-0 rounded-b-xl border-t bg-muted/50 px-4 py-4">
            <LoadingButton type="submit" loading={pending}>
              {pending ? "Guardando…" : "Guardar configuración"}
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
