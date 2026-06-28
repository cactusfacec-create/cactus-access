"use client";

import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";
import { NuevaJustificacionDialog } from "./nueva-justificacion-dialog";
import type { Empleado, JustificacionFalta } from "@/lib/types/database.types";

export interface FaltaDetectada {
  idEmpleado: string;
  nombreEmpleado: string;
  fecha: string;
  justificacion?: JustificacionFalta;
}

function getInitial(nombre: string) {
  return nombre.trim()[0]?.toUpperCase() ?? "?";
}

function EstadoTag({ j }: { j: JustificacionFalta }) {
  if (j.estado === "aprobada") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="size-3" /> Aprobada
      </span>
    );
  }
  if (j.estado === "rechazada") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-600 dark:text-red-400">
        <XCircle className="size-3" /> Rechazada
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
      <Clock className="size-3" /> Pendiente
    </span>
  );
}

interface Props {
  faltas: FaltaDetectada[];
  empleados: Empleado[];
}

export function FaltasList({ faltas, empleados }: Props) {
  if (faltas.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-14 text-center">
        <CheckCircle2 className="size-8 text-emerald-500/60" />
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-medium text-foreground">Sin faltas detectadas</p>
          <p className="text-xs text-muted-foreground">
            Todos los empleados tienen asistencia completa en los últimos 30 días.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {faltas.map((falta, index) => {
        const fechaLabel = format(parseISO(falta.fecha), "EEEE d 'de' MMMM", { locale: es });
        const sinJustificar = !falta.justificacion || falta.justificacion.estado === "rechazada";

        return (
          <div
            key={`${falta.idEmpleado}-${falta.fecha}`}
            className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition-colors animate-in fade-in slide-in-from-bottom-1 duration-200 fill-mode-backwards ${
              sinJustificar
                ? "border-red-500/15 bg-red-500/3"
                : "border-border bg-card"
            }`}
            style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
          >
            {/* Avatar */}
            <div
              className={`flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                sinJustificar
                  ? "bg-red-500/10 text-red-600 dark:text-red-400"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {getInitial(falta.nombreEmpleado)}
            </div>

            {/* Info */}
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate text-sm font-semibold text-foreground">
                {falta.nombreEmpleado}
              </span>
              <span className="text-xs capitalize text-muted-foreground">{fechaLabel}</span>
            </div>

            {/* Status / action */}
            <div className="shrink-0">
              {falta.justificacion && falta.justificacion.estado !== "rechazada" ? (
                <EstadoTag j={falta.justificacion} />
              ) : (
                <NuevaJustificacionDialog
                  empleados={empleados}
                  prefill={{ idEmpleado: falta.idEmpleado, fecha: falta.fecha }}
                  trigger={
                    <button
                      type="button"
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/8 px-2.5 py-1 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-500/15 dark:text-amber-400"
                    >
                      <AlertCircle className="size-3" />
                      Justificar
                    </button>
                  }
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
