"use client";

import { useState, useTransition } from "react";
import { HandCoins } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/cactus/loading-button";
import { registrarAdelanto } from "@/actions/adelantos.actions";

interface Props {
  idEmpleado: string;
  nombreEmpleado: string;
}

export function RegistrarAdelantoDialog({ idEmpleado, nombreEmpleado }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [monto, setMonto] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [descripcion, setDescripcion] = useState("");

  function handleClose() {
    setOpen(false);
    setMonto("");
    setDescripcion("");
    setFecha(new Date().toISOString().slice(0, 10));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await registrarAdelanto({
        idEmpleado,
        monto: parseFloat(monto),
        fecha,
        descripcion: descripcion || undefined,
      });
      if (res.ok) {
        toast.success("Adelanto registrado");
        handleClose();
      } else {
        toast.error(res.error ?? "Error inesperado");
      }
    });
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <HandCoins className="size-4" />
        Adelanto
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Registrar adelanto</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-1">
            <div className="rounded-xl border border-border bg-muted/30 px-4 py-2.5">
              <p className="text-sm font-medium text-foreground">{nombreEmpleado}</p>
              <p className="text-xs text-muted-foreground">Se notificará al empleado por WhatsApp</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="adelanto-monto">Monto ($)</Label>
              <Input
                id="adelanto-monto"
                type="number"
                min={0.01}
                step={0.01}
                placeholder="0.00"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="adelanto-fecha">Fecha</Label>
              <Input
                id="adelanto-fecha"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="adelanto-desc">Descripción <span className="text-muted-foreground">(opcional)</span></Label>
              <Input
                id="adelanto-desc"
                placeholder="Ej: Adelanto quincenal"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
                Cancelar
              </Button>
              <LoadingButton type="submit" loading={isPending}>
                {isPending ? "Guardando…" : "Registrar"}
              </LoadingButton>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
