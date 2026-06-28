"use client";

import { useRef, useState, useTransition } from "react";
import { Plus, Upload, X, FileText } from "lucide-react";
import { toast } from "sonner";
import { createJustificacion } from "@/actions/justificaciones.actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Empleado } from "@/lib/types/database.types";

interface Props {
  empleados: Empleado[];
  prefill?: { idEmpleado: string; fecha: string; tipo?: "falta" | "incompleto" };
  trigger?: React.ReactNode;
  onCreated?: () => void;
}

export function NuevaJustificacionDialog({ empleados, prefill, trigger, onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files?.[0] ?? null);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (file) formData.set("comprobante", file);

    startTransition(async () => {
      const res = await createJustificacion(formData);
      if (res.ok) {
        toast.success("Justificación registrada");
        setOpen(false);
        setFile(null);
        formRef.current?.reset();
        onCreated?.();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <>
      <div onClick={() => setOpen(true)} className="contents">
        {trigger ?? (
          <Button>
            <Plus className="size-4" />
            Nueva justificación
          </Button>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {prefill?.tipo === "incompleto"
                ? "Justificar registro incompleto"
                : "Nueva justificación de falta"}
            </DialogTitle>
          </DialogHeader>

          <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input type="hidden" name="tipo" value={prefill?.tipo ?? "falta"} />
            {/* Empleado */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="idEmpleado">
                Empleado <span className="text-destructive">*</span>
              </Label>
              <select
                id="idEmpleado"
                name="idEmpleado"
                defaultValue={prefill?.idEmpleado ?? ""}
                required
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
              >
                <option value="" disabled>
                  Selecciona un empleado
                </option>
                {empleados.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fecha">
                {prefill?.tipo === "incompleto" ? "Fecha" : "Fecha de falta"}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fecha"
                name="fecha"
                type="date"
                defaultValue={prefill?.fecha ?? ""}
                required
                max={new Date().toISOString().slice(0, 10)}
              />
            </div>

            {/* Motivo */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="motivo">
                Motivo <span className="text-destructive">*</span>
              </Label>
              <textarea
                id="motivo"
                name="motivo"
                required
                rows={3}
                placeholder="Describe el motivo de la falta…"
                className="w-full resize-none rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
              />
            </div>

            {/* File upload */}
            <div className="flex flex-col gap-1.5">
              <Label>
                Comprobante{" "}
                <span className="text-muted-foreground">(opcional)</span>
              </Label>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={handleFile}
                className="hidden"
                aria-label="Subir comprobante"
              />
              {file ? (
                <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
                  <FileText className="size-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1 truncate text-sm text-foreground">
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ""; }}
                    className="flex size-5 cursor-pointer items-center justify-center rounded text-muted-foreground hover:text-destructive"
                    aria-label="Quitar archivo"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  <Upload className="size-4" />
                  Adjuntar PDF, imagen (máx 10 MB)
                </button>
              )}
            </div>

            <DialogFooter showCloseButton>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Guardando…" : "Guardar justificación"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
