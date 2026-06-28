"use client";

import { useTransition } from "react";
import { Building2, Calendar, CheckCheck, Eye, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { updateEstadoSugerencia, type SugerenciaConEmpresa } from "@/actions/admin/sugerencias.actions";
import type { EstadoSugerencia } from "@/lib/types/database.types";

const ESTADO_META: Record<EstadoSugerencia, { label: string; color: string; icon: React.ReactNode }> = {
  nueva: {
    label: "Nueva",
    color: "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20",
    icon: <Lightbulb className="size-3" />,
  },
  revisada: {
    label: "Revisada",
    color: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    icon: <Eye className="size-3" />,
  },
  implementada: {
    label: "Implementada",
    color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    icon: <CheckCheck className="size-3" />,
  },
};

const ESTADOS: EstadoSugerencia[] = ["nueva", "revisada", "implementada"];

function fmtFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-EC", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SugerenciaCard({ s }: { s: SugerenciaConEmpresa }) {
  const [isPending, startTransition] = useTransition();
  const meta = ESTADO_META[s.estado];

  function handleEstado(estado: EstadoSugerencia) {
    if (estado === s.estado) return;
    startTransition(async () => {
      const res = await updateEstadoSugerencia(s.id, estado);
      if (!res.ok) toast.error(res.error ?? "Error al actualizar");
    });
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-sm transition-opacity animate-in fade-in slide-in-from-bottom-1 duration-200",
        isPending && "opacity-50",
        s.estado === "nueva" ? "border-violet-500/15" : "border-border",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Building2 className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">{s.empresa_nombre}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="size-3" />
            {fmtFecha(s.created_at)}
          </div>
        </div>

        {/* Estado selector */}
        <div className="flex gap-1">
          {ESTADOS.map((e) => {
            const m = ESTADO_META[e];
            const active = s.estado === e;
            return (
              <button
                key={e}
                type="button"
                onClick={() => handleEstado(e)}
                disabled={isPending}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-all duration-150",
                  active
                    ? m.color
                    : "border-border text-muted-foreground hover:border-border/80 hover:bg-muted/50",
                )}
              >
                {m.icon}
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-sm leading-relaxed text-foreground">{s.mensaje}</p>
    </div>
  );
}

interface Props {
  sugerencias: SugerenciaConEmpresa[];
}

export function SugerenciasList({ sugerencias }: Props) {
  if (sugerencias.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card py-16 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-muted">
          <Lightbulb className="size-5 text-muted-foreground" />
        </span>
        <div className="flex flex-col gap-1">
          <p className="font-semibold text-foreground">Sin sugerencias aún</p>
          <p className="text-sm text-muted-foreground">
            Las sugerencias de los clientes aparecerán aquí.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {sugerencias.map((s) => (
        <SugerenciaCard key={s.id} s={s} />
      ))}
    </div>
  );
}
