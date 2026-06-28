"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";
import { EmptyState } from "@/components/cactus/empty-state";

export interface DiaTendencia {
  fecha: string;
  aTiempo: number;
  atrasos: number;
}

function formatDiaCorto(fecha: string) {
  return new Date(`${fecha}T00:00:00`).toLocaleDateString("es-EC", { weekday: "short" });
}

function formatDiaLargo(fecha: string) {
  const label = new Date(`${fecha}T00:00:00`).toLocaleDateString("es-EC", { weekday: "long" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function CustomTooltip({ active, payload }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;
  const fecha = (payload[0]?.payload as { fecha: string } | undefined)?.fecha;
  const aTiempo = payload.find((p) => p.dataKey === "aTiempo")?.value ?? 0;
  const atrasos = payload.find((p) => p.dataKey === "atrasos")?.value ?? 0;

  return (
    <div className="rounded-lg border border-border/60 bg-card/95 px-3 py-2 text-xs shadow-md backdrop-blur-sm">
      <p className="mb-1 font-semibold text-foreground">{fecha ? formatDiaLargo(fecha) : ""}</p>
      <p className="text-muted-foreground">
        <span className="font-semibold text-primary">{aTiempo}</span> a tiempo,{" "}
        <span className="font-semibold text-amber-500">{atrasos}</span> atrasos
      </p>
    </div>
  );
}

export function AttendanceTrendChart({ dias }: { dias: DiaTendencia[] }) {
  const totalRegistros = dias.reduce((acc, dia) => acc + dia.aTiempo + dia.atrasos, 0);
  const data = dias.map((dia) => ({ ...dia, diaCorto: formatDiaCorto(dia.fecha) }));

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Tendencia de asistencia</h2>
          <p className="text-xs text-muted-foreground">Últimos 7 días</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="size-2 rounded-full bg-primary" aria-hidden="true" />
            A tiempo
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="size-2 rounded-full bg-amber-400" aria-hidden="true" />
            Atrasos
          </span>
        </div>
      </div>

      {totalRegistros === 0 ? (
        <EmptyState
          title="Sin marcaciones esta semana"
          description="Cuando tus empleados marquen asistencia, verás la tendencia aquí."
        />
      ) : (
        <>
          <div
            className="h-56 w-full"
            role="img"
            aria-label="Gráfico de barras apiladas comparando marcaciones a tiempo y atrasos en los últimos 7 días"
          >
            <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={50}>
              <BarChart data={data} barCategoryGap="32%">
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="diaCorto"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  className="capitalize"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  width={24}
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                />
                <Tooltip
                  content={(props) => <CustomTooltip {...props} />}
                  cursor={{ fill: "var(--secondary)", opacity: 0.5 }}
                />
                <Bar dataKey="aTiempo" stackId="asistencia" fill="var(--primary)" barSize={32} />
                <Bar
                  dataKey="atrasos"
                  stackId="asistencia"
                  fill="#f59e0b"
                  radius={[4, 4, 0, 0]}
                  barSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Alternativa accesible para lectores de pantalla — el gráfico de barras
              de arriba no transmite los valores exactos por sí solo. */}
          <table className="sr-only">
            <caption>Tendencia de asistencia de los últimos 7 días</caption>
            <thead>
              <tr>
                <th>Día</th>
                <th>A tiempo</th>
                <th>Atrasos</th>
              </tr>
            </thead>
            <tbody>
              {dias.map((dia) => (
                <tr key={dia.fecha}>
                  <td>{dia.fecha}</td>
                  <td>{dia.aTiempo}</td>
                  <td>{dia.atrasos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </section>
  );
}
