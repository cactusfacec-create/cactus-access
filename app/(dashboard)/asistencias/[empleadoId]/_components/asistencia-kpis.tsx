import { AlarmClock, Briefcase, CalendarX, FileCheck2, LogOut, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/cactus/stat-card";
import { AsistenciaResumenBar } from "./asistencia-resumen-bar";
import { formatHoras } from "@/lib/nomina";

interface Props {
  totalAtraso: number;
  totalSalidaTemprana: number;
  totalExtras: number;
  totalFaltas: number;
  totalFaltasJustificadas: number;
  diasTrabajados: number;
  totalDiasHabiles: number;
}

export function AsistenciaKpis({
  totalAtraso,
  totalSalidaTemprana,
  totalExtras,
  totalFaltas,
  totalFaltasJustificadas,
  diasTrabajados,
  totalDiasHabiles,
}: Props) {
  const faltasNoJustificadas = totalFaltas - totalFaltasJustificadas;

  return (
    <div className="flex w-full flex-col gap-3">
      {/* Overview bar */}
      <AsistenciaResumenBar
        diasTrabajados={diasTrabajados}
        faltasJustificadas={totalFaltasJustificadas}
        faltasNoJustificadas={faltasNoJustificadas}
        totalDiasHabiles={totalDiasHabiles}
      />

      {/* Asistencia group */}
      <div className="flex flex-col gap-1.5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Asistencia
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard
            label="Días trabajados"
            value={diasTrabajados}
            note={totalDiasHabiles > 0 ? `de ${totalDiasHabiles} días hábiles` : undefined}
            icon={<Briefcase className="size-4" />}
            tone="neutral"
            animationDelay={0}
          />
          <StatCard
            label="Faltas"
            value={totalFaltas}
            delta={faltasNoJustificadas > 0 ? `${faltasNoJustificadas} sin justificar` : undefined}
            deltaVariant="error"
            icon={<CalendarX className="size-4" />}
            tone={totalFaltas > 0 ? "error" : "neutral"}
            className={totalFaltas > 0 ? "border-red-500/20 bg-red-500/5" : undefined}
            animationDelay={60}
          />
          <StatCard
            label="Justificadas"
            value={totalFaltasJustificadas}
            icon={<FileCheck2 className="size-4" />}
            tone={totalFaltasJustificadas > 0 ? "success" : "neutral"}
            className={totalFaltasJustificadas > 0 ? "border-emerald-500/20 bg-emerald-500/5" : undefined}
            animationDelay={120}
          />
        </div>
      </div>

      {/* Tiempo group */}
      <div className="flex flex-col gap-1.5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Tiempo
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard
            label="Atraso total"
            value={totalAtraso > 0 ? formatHoras(totalAtraso) : "—"}
            icon={<AlarmClock className="size-4" />}
            tone={totalAtraso > 0 ? "warn" : "neutral"}
            className={totalAtraso > 0 ? "border-amber-500/20 bg-amber-500/5" : undefined}
            animationDelay={0}
          />
          <StatCard
            label="Salida temprana"
            value={totalSalidaTemprana > 0 ? formatHoras(totalSalidaTemprana) : "—"}
            icon={<LogOut className="size-4" />}
            tone={totalSalidaTemprana > 0 ? "warn" : "neutral"}
            className={totalSalidaTemprana > 0 ? "border-amber-500/20 bg-amber-500/5" : undefined}
            animationDelay={60}
          />
          <StatCard
            label="Horas extra"
            value={totalExtras > 0 ? formatHoras(totalExtras) : "—"}
            icon={<TrendingUp className="size-4" />}
            tone={totalExtras > 0 ? "extra" : "neutral"}
            className={totalExtras > 0 ? "border-violet-500/20 bg-violet-500/5" : undefined}
            animationDelay={120}
          />
        </div>
      </div>
    </div>
  );
}
