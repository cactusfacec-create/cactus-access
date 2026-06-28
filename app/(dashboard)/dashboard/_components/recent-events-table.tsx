"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/cactus/status-badge";
import { EmptyState } from "@/components/cactus/empty-state";

export interface EventoReciente {
  empleadoId: string;
  empleadoNombre: string;
  tipo: "Entrada" | "Salida a almuerzo" | "Regreso de almuerzo" | "Salida";
  hora: string;
  sucursalNombre: string;
  estatus?: "a_tiempo" | "atrasado" | "horas_extra" | "incompleto";
}

const TIPO_DOT: Record<EventoReciente["tipo"], string> = {
  Entrada: "bg-emerald-500",
  "Salida a almuerzo": "bg-amber-400",
  "Regreso de almuerzo": "bg-sky-400",
  Salida: "bg-primary",
};

function getInitials(nombre: string) {
  const palabras = nombre.trim().split(/\s+/).filter(Boolean);
  if (palabras.length === 0) return "?";
  if (palabras.length === 1) return palabras[0].slice(0, 2).toUpperCase();
  return (palabras[0][0] + palabras[1][0]).toUpperCase();
}

function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString("es-EC", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Guayaquil",
  });
}

export function RecentEventsTable({ eventos }: { eventos: EventoReciente[] }) {
  const router = useRouter();

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold text-foreground">Eventos recientes</h2>
        <p className="text-xs text-muted-foreground">Últimas marcaciones biométricas</p>
      </div>

      {eventos.length === 0 ? (
        <div className="p-5">
          <EmptyState
            title="Sin marcaciones todavía"
            description="Las marcaciones de tus empleados aparecerán aquí en tiempo real."
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-5 py-3 text-left text-xs font-semibold tracking-wide text-muted-foreground">
                  Empleado
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-muted-foreground">
                  Acción
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-muted-foreground">
                  Hora
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-muted-foreground">
                  Sucursal
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold tracking-wide text-muted-foreground">
                  Estatus
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {eventos.map((evento, index) => (
                <tr
                  key={`${evento.empleadoId}-${evento.tipo}-${evento.hora}`}
                  tabIndex={0}
                  style={{ animationDelay: `${index * 40}ms` }}
                  aria-label={`Ver historial de ${evento.empleadoNombre}`}
                  onClick={() => router.push(`/asistencias/${evento.empleadoId}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      router.push(`/asistencias/${evento.empleadoId}`);
                    }
                  }}
                  className="cursor-pointer bg-card transition-colors duration-150 hover:bg-muted/30 focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2 animate-in fade-in slide-in-from-bottom-1 duration-200 fill-mode-backwards"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar size="sm">
                        <AvatarFallback className="font-semibold">
                          {getInitials(evento.empleadoNombre)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-foreground">{evento.empleadoNombre}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <span
                        aria-hidden="true"
                        className={cn("size-2 shrink-0 rounded-full", TIPO_DOT[evento.tipo])}
                      />
                      {evento.tipo}
                    </span>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-foreground">
                    {formatHora(evento.hora)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{evento.sucursalNombre}</td>
                  <td className="px-5 py-3">
                    {evento.estatus ? <StatusBadge status={evento.estatus} /> : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
