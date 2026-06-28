"use client";

import { useState, useTransition } from "react";
import { CalendarClock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { DiaCorteCalendar } from "@/components/forms/dia-corte-picker";
import { updateSucursal } from "@/actions/sucursales.actions";
import type { Sucursal } from "@/lib/types/database.types";

export function DiaCorteDialog({ sucursal }: { sucursal: Sucursal }) {
  const [open, setOpen] = useState(false);
  const [diaCorte, setDiaCorte] = useState<number | null>(sucursal.dia_corte ?? null);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      const res = await updateSucursal(sucursal.id, {
        nombreSucursal: sucursal.nombre_sucursal,
        direccion: sucursal.direccion ?? "",
        macAddress: sucursal.mac_address ?? "",
        diaCorte,
        jornada1IncluyeAlmuerzo: !!(sucursal.jornada1_salida_almuerzo && sucursal.jornada1_entrada_almuerzo),
        jornada1Entrada: sucursal.jornada1_entrada ?? "",
        jornada1SalidaAlmuerzo: sucursal.jornada1_salida_almuerzo ?? "",
        jornada1EntradaAlmuerzo: sucursal.jornada1_entrada_almuerzo ?? "",
        jornada1Salida: sucursal.jornada1_salida ?? "",
      });
      if (res.ok) {
        toast.success("Día de corte guardado");
        setOpen(false);
      } else {
        toast.error(res.error ?? "No se pudo guardar");
      }
    });
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setOpen(true)}
        aria-label="Configurar día de corte"
        className={sucursal.dia_corte ? "text-lime-700 dark:text-lime-400" : "text-muted-foreground"}
        title={sucursal.dia_corte ? `Corte: día ${sucursal.dia_corte}` : "Sin día de corte"}
      >
        <CalendarClock className="size-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Día de corte — {sucursal.nombre_sucursal}</DialogTitle>
          </DialogHeader>
          <DiaCorteCalendar value={diaCorte} onChange={setDiaCorte} />
          <DialogFooter showCloseButton>
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? "Guardando…" : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
