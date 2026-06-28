import Link from "next/link";
import { AlarmClock, TrendingUp } from "lucide-react";
import { buildMarcas, getEstadoDia } from "@/lib/asistencia";
import { StatusBadge } from "@/components/cactus/status-badge";
import { MarcasTimeline } from "@/components/cactus/marcas-timeline";
import type { EmpleadoAsistenciaDia } from "@/lib/types/domain";

function formatMinutos(min: number): string {
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export function AsistenciaDiaCard({ item, fecha }: { item: EmpleadoAsistenciaDia; fecha: string }) {
  const { empleado, sucursalNombre, row, horarioProgramado } = item;
  const estado = getEstadoDia(row);
  const marcas = buildMarcas(row, horarioProgramado);
  const tieneAtraso = row.minutos_atraso > 0;
  const tieneExtras = row.minutos_extras > 0;

  return (
    <Link
      href={`/asistencias/${empleado.id}?desde=${fecha}&hasta=${fecha}`}
      className="flex flex-col gap-4 rounded-2xl border border-border bg-card px-5 py-4 shadow-sm transition-shadow duration-200 hover:shadow-md focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="font-semibold text-foreground">{empleado.nombre}</span>
          {sucursalNombre !== "—" && (
            <span className="text-sm text-muted-foreground">{sucursalNombre}</span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <StatusBadge status={estado} />
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
        </div>
      </div>

      <MarcasTimeline marcas={marcas} />
    </Link>
  );
}
