"use client";

import { AlertCircle, FileCheck2, AlarmClock, LogOut, TrendingUp } from "lucide-react";
import { isRegistroIncompleto } from "@/lib/asistencia";
import { getEstadoDia, buildMarcas } from "@/lib/asistencia";
import type { EntradaDia, HorarioProgramado } from "@/lib/asistencia";
import { StatusBadge } from "@/components/cactus/status-badge";
import { MarcasTimeline } from "@/components/cactus/marcas-timeline";
import { NuevaJustificacionDialog } from "@/app/(dashboard)/justificaciones/_components/nueva-justificacion-dialog";
import type { Empleado, EstadoJustificacion } from "@/lib/types/database.types";
import { cn } from "@/lib/utils";

const ESTADO_JUST_META: Record<EstadoJustificacion, { label: string; color: string }> = {
  pendiente: { label: "Pendiente", color: "text-amber-600 bg-amber-500/10 dark:text-amber-400" },
  aprobada: { label: "Aprobada", color: "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400" },
  rechazada: { label: "Rechazada", color: "text-red-600 bg-red-500/10 dark:text-red-400" },
};

function formatFecha(fecha: string) {
  return new Date(`${fecha}T00:00:00`).toLocaleDateString("es-EC", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

function formatMinutos(min: number): string {
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

interface Props {
  entradas: EntradaDia[];
  empleado: Empleado;
  horarioProgramado?: HorarioProgramado;
}

export function AsistenciaTimeline({ entradas, empleado, horarioProgramado }: Props) {
  return (
    <div className="flex w-full flex-col gap-2.5">
      {entradas.map((entrada, index) => {
        if (entrada.tipo === "registro") {
          const { row, justificacion } = entrada;
          const estado = getEstadoDia(row);
          const tieneAtraso = row.minutos_atraso > 0;
          const tieneExtras = row.minutos_extras > 0;
          const tieneSalidaTemprana = row.minutos_salida_temprana > 0;
          const esIncompleto = isRegistroIncompleto(row);

          return (
            <div
              key={entrada.fecha}
              className={cn(
                "flex w-full flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm sm:flex-row sm:items-center animate-in fade-in slide-in-from-bottom-1 duration-200 fill-mode-backwards",
                tieneAtraso ? "border-amber-500/20" : "border-border",
              )}
              style={{ animationDelay: `${Math.min(index * 30, 350)}ms` }}
            >
              {/* Date + status */}
              <div className="flex items-center gap-3 sm:w-36 sm:shrink-0 sm:flex-col sm:items-start sm:gap-1.5">
                <span className="text-sm font-semibold text-foreground capitalize">
                  {formatFecha(row.fecha)}
                </span>
                <StatusBadge status={estado} />
              </div>

              {/* Marks */}
              <div className="flex-1 min-w-0">
                <MarcasTimeline marcas={buildMarcas(row, horarioProgramado)} />
              </div>

              {/* Right: highlights + justificación */}
              <div className="flex shrink-0 flex-wrap items-center gap-1.5 sm:flex-col sm:items-end">
                {tieneAtraso && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                    <AlarmClock className="size-3" />
                    +{formatMinutos(row.minutos_atraso)}
                  </span>
                )}
                {tieneExtras && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2 py-0.5 text-xs font-medium text-violet-700 dark:text-violet-400">
                    <TrendingUp className="size-3" />
                    +{formatMinutos(row.minutos_extras)} extra
                  </span>
                )}
                {tieneSalidaTemprana && !esIncompleto && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                    <LogOut className="size-3" />
                    -{formatMinutos(row.minutos_salida_temprana)}
                  </span>
                )}
                {justificacion ? (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${ESTADO_JUST_META[justificacion.estado].color}`}
                  >
                    <FileCheck2 className="size-3" />
                    {ESTADO_JUST_META[justificacion.estado].label}
                  </span>
                ) : esIncompleto ? (
                  <NuevaJustificacionDialog
                    empleados={[empleado]}
                    prefill={{ idEmpleado: empleado.id, fecha: row.fecha, tipo: "incompleto" }}
                    trigger={
                      <button
                        type="button"
                        className="ml-auto flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-orange-400/30 bg-orange-500/8 px-3 py-1.5 text-xs font-medium text-orange-700 transition-colors hover:bg-orange-500/15 dark:text-orange-400"
                      >
                        <FileCheck2 className="size-3.5" />
                        Justificar
                      </button>
                    }
                  />
                ) : null}
              </div>
            </div>
          );
        }

        // Falta
        const { fecha, justificacion } = entrada;
        return (
          <div
            key={fecha}
            className="flex w-full flex-col gap-3 rounded-2xl border border-red-500/15 bg-red-500/3 p-5 shadow-sm sm:flex-row sm:items-center animate-in fade-in slide-in-from-bottom-1 duration-200 fill-mode-backwards"
            style={{ animationDelay: `${Math.min(index * 30, 350)}ms` }}
          >
            <div className="flex items-center gap-3 sm:w-36 sm:shrink-0 sm:flex-col sm:items-start sm:gap-1.5">
              <span className="text-sm font-semibold text-foreground capitalize">
                {formatFecha(fecha)}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-600 dark:text-red-400">
                <AlertCircle className="size-3" />
                Falta
              </span>
            </div>

            <div className="flex flex-1 items-center gap-3">
              {justificacion ? (
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm text-muted-foreground">{justificacion.motivo}</span>
                  <span
                    className={`inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${ESTADO_JUST_META[justificacion.estado].color}`}
                  >
                    <FileCheck2 className="size-3" />
                    {ESTADO_JUST_META[justificacion.estado].label}
                  </span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Sin registro de asistencia</p>
              )}
            </div>

            {!justificacion && (
              <NuevaJustificacionDialog
                empleados={[empleado]}
                prefill={{ idEmpleado: empleado.id, fecha }}
                trigger={
                  <button
                    type="button"
                    className="ml-auto flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
                  >
                    <FileCheck2 className="size-3.5" />
                    Justificar
                  </button>
                }
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
