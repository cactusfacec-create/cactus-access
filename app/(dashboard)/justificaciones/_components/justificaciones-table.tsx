"use client";

import { useTransition } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  ExternalLink,
  FileText,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import {
  updateEstadoJustificacion,
  deleteJustificacion,
} from "@/actions/justificaciones.actions";
import { Button } from "@/components/ui/button";
import type { JustificacionFalta, Empleado, EstadoJustificacion } from "@/lib/types/database.types";

interface JustificacionRow extends JustificacionFalta {
  empleadoNombre: string;
}

const ESTADO_META: Record<
  EstadoJustificacion,
  { label: string; color: string; icon: React.ReactNode }
> = {
  pendiente: {
    label: "Pendiente",
    color: "text-amber-600 bg-amber-500/10 dark:text-amber-400",
    icon: <Clock className="size-3" />,
  },
  aprobada: {
    label: "Aprobada",
    color: "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400",
    icon: <CheckCircle2 className="size-3" />,
  },
  rechazada: {
    label: "Rechazada",
    color: "text-red-600 bg-red-500/10 dark:text-red-400",
    icon: <XCircle className="size-3" />,
  },
};

function EstadoBadge({ estado }: { estado: EstadoJustificacion }) {
  const meta = ESTADO_META[estado];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${meta.color}`}>
      {meta.icon}
      {meta.label}
    </span>
  );
}

function JustificacionCard({ row }: { row: JustificacionRow }) {
  const [isPending, startTransition] = useTransition();

  function cambiarEstado(estado: EstadoJustificacion) {
    startTransition(async () => {
      const res = await updateEstadoJustificacion(row.id, estado);
      if (!res.ok) toast.error(res.error);
      else toast.success(`Justificación ${ESTADO_META[estado].label.toLowerCase()}`);
    });
  }

  function eliminar() {
    startTransition(async () => {
      const res = await deleteJustificacion(row.id);
      if (!res.ok) toast.error(res.error);
      else toast.success("Justificación eliminada");
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card px-5 py-4 shadow-[0px_2px_8px_rgba(0,0,0,0.03)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-foreground">{row.empleadoNombre}</span>
          <span className="text-sm capitalize text-muted-foreground">
            {format(parseISO(row.fecha), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
          </span>
        </div>
        <EstadoBadge estado={row.estado} />
      </div>

      <div className="rounded-xl bg-muted/40 px-3 py-2.5">
        <p className="text-sm text-foreground leading-relaxed">{row.motivo}</p>
      </div>

      {row.url_comprobante && (
        <a
          href={row.url_comprobante}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
        >
          <FileText className="size-3.5" />
          Ver comprobante
          <ExternalLink className="size-3" />
        </a>
      )}

      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
        {row.estado !== "aprobada" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => cambiarEstado("aprobada")}
            disabled={isPending}
            className="h-7 gap-1.5 text-xs text-emerald-600 hover:border-emerald-500/40 hover:bg-emerald-500/10 dark:text-emerald-400"
          >
            <CheckCircle2 className="size-3.5" />
            Aprobar
          </Button>
        )}
        {row.estado !== "rechazada" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => cambiarEstado("rechazada")}
            disabled={isPending}
            className="h-7 gap-1.5 text-xs text-destructive hover:border-destructive/40 hover:bg-destructive/10"
          >
            <XCircle className="size-3.5" />
            Rechazar
          </Button>
        )}
        {row.estado !== "pendiente" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => cambiarEstado("pendiente")}
            disabled={isPending}
            className="h-7 gap-1.5 text-xs text-muted-foreground"
          >
            <RotateCcw className="size-3.5" />
            Pendiente
          </Button>
        )}
        <div className="ml-auto">
          <button
            onClick={eliminar}
            disabled={isPending}
            aria-label="Eliminar justificación"
            className="flex size-7 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface Props {
  justificaciones: JustificacionFalta[];
  empleados: Empleado[];
}

export function JustificacionesTable({ justificaciones, empleados }: Props) {
  const empMap = new Map(empleados.map((e) => [e.id, e.nombre]));

  const rows: JustificacionRow[] = justificaciones.map((j) => ({
    ...j,
    empleadoNombre: empMap.get(j.id_empleado) ?? "Empleado",
  }));

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-xl bg-muted/50">
          <FileText className="size-6 text-muted-foreground/50" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">Sin justificaciones</p>
          <p className="text-xs text-muted-foreground">
            Las justificaciones registradas aparecerán aquí.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {rows.map((row) => (
        <JustificacionCard key={row.id} row={row} />
      ))}
    </div>
  );
}
