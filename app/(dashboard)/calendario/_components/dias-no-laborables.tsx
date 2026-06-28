"use client";

import { useState, useTransition } from "react";
import { DayPicker, type DayButtonProps } from "react-day-picker";
import { es } from "date-fns/locale";
import { format, parseISO } from "date-fns";
import { CalendarX, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { toast } from "sonner";
import {
  setDiasNoLaborablesSucursal,
  setDiasNoLaborablesEmpleado,
  toggleFechaNoLaborableEmpleado,
} from "@/actions/calendario.actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  Sucursal,
  Empleado,
  DiaNoLaborableSucursal,
  DiaNoLaborableEmpleado,
  FechaNoLaborableEmpleado,
} from "@/lib/types/database.types";

const DIAS = [
  { label: "D", full: "Domingo", value: 0 },
  { label: "L", full: "Lunes", value: 1 },
  { label: "M", full: "Martes", value: 2 },
  { label: "X", full: "Miércoles", value: 3 },
  { label: "J", full: "Jueves", value: 4 },
  { label: "V", full: "Viernes", value: 5 },
  { label: "S", full: "Sábado", value: 6 },
];

function WeekdayPicker({
  selected,
  onChange,
  disabled,
}: {
  selected: number[];
  onChange: (dias: number[]) => void;
  disabled?: boolean;
}) {
  function toggle(d: number) {
    onChange(selected.includes(d) ? selected.filter((x) => x !== d) : [...selected, d]);
  }

  return (
    <div className="flex gap-2" role="group" aria-label="Días de la semana">
      {DIAS.map((dia) => {
        const active = selected.includes(dia.value);
        return (
          <button
            key={dia.value}
            type="button"
            onClick={() => toggle(dia.value)}
            disabled={disabled}
            aria-pressed={active}
            aria-label={dia.full}
            title={dia.full}
            className={`flex size-10 cursor-pointer items-center justify-center rounded-full text-sm font-semibold transition-all duration-150
              ${active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "border border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }
              disabled:cursor-not-allowed disabled:opacity-40`}
          >
            {dia.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── Tab: Por Sucursal (días de semana) ── */
function SucursalTab({
  sucursales,
  diasSucursal,
}: {
  sucursales: Sucursal[];
  diasSucursal: DiaNoLaborableSucursal[];
}) {
  const [selected, setSelected] = useState<string>(sucursales[0]?.id ?? "");
  const [localDias, setLocalDias] = useState<Record<string, number[]>>(() => {
    const map: Record<string, number[]> = {};
    for (const s of sucursales) {
      map[s.id] = diasSucursal.filter((d) => d.id_sucursal === s.id).map((d) => d.dia_semana);
    }
    return map;
  });
  const [isPending, startTransition] = useTransition();

  function handleChange(dias: number[]) {
    setLocalDias((prev) => ({ ...prev, [selected]: dias }));
    startTransition(async () => {
      const res = await setDiasNoLaborablesSucursal(selected, dias);
      if (!res.ok) toast.error(res.error);
      else toast.success("Configuración guardada");
    });
  }

  if (sucursales.length === 0) {
    return <p className="text-sm text-muted-foreground">No tienes sucursales registradas.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {sucursales.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSelected(s.id)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors cursor-pointer
              ${selected === s.id
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card text-foreground hover:bg-muted"
              }`}
          >
            {s.nombre_sucursal}
          </button>
        ))}
      </div>
      {selected && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground">
            Los días marcados no se considerarán laborables para esta sucursal
          </p>
          <WeekdayPicker
            selected={localDias[selected] ?? []}
            onChange={handleChange}
            disabled={isPending}
          />
          {isPending && <p className="text-xs text-muted-foreground">Guardando…</p>}
        </div>
      )}
    </div>
  );
}

/* ── Tab: Por Empleado (días de semana) ── */
function EmpleadoSemanaTab({
  empleados,
  diasEmpleado,
}: {
  empleados: Empleado[];
  diasEmpleado: DiaNoLaborableEmpleado[];
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [localDias, setLocalDias] = useState<Record<string, number[]>>(() => {
    const map: Record<string, number[]> = {};
    for (const e of empleados) {
      map[e.id] = diasEmpleado.filter((d) => d.id_empleado === e.id).map((d) => d.dia_semana);
    }
    return map;
  });
  const [isPending, startTransition] = useTransition();

  const filtered = empleados.filter((e) =>
    e.nombre.toLowerCase().includes(search.toLowerCase()),
  );

  function handleChange(dias: number[]) {
    if (!selected) return;
    setLocalDias((prev) => ({ ...prev, [selected]: dias }));
    startTransition(async () => {
      const res = await setDiasNoLaborablesEmpleado(selected, dias);
      if (!res.ok) toast.error(res.error);
      else toast.success("Configuración guardada");
    });
  }

  if (empleados.length === 0) {
    return <p className="text-sm text-muted-foreground">No tienes empleados registrados.</p>;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
      <div className="flex flex-col gap-2">
        <input
          type="search"
          placeholder="Buscar empleado…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
        />
        <div className="flex max-h-64 flex-col gap-1 overflow-y-auto rounded-xl border border-border p-1">
          {filtered.map((e) => {
            const hasDias = (localDias[e.id]?.length ?? 0) > 0;
            return (
              <button
                key={e.id}
                type="button"
                onClick={() => setSelected(e.id)}
                className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors
                  ${selected === e.id ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"}`}
              >
                <span className="flex-1 truncate">{e.nombre}</span>
                {hasDias && (
                  <span className={`size-2 shrink-0 rounded-full ${selected === e.id ? "bg-primary-foreground/60" : "bg-primary/60"}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {selected ? (
          <>
            <p className="text-sm font-medium text-foreground">
              {empleados.find((e) => e.id === selected)?.nombre}
            </p>
            <p className="text-xs text-muted-foreground">
              Override individual sobre la configuración de la sucursal
            </p>
            <WeekdayPicker
              selected={localDias[selected] ?? []}
              onChange={handleChange}
              disabled={isPending}
            />
            {(localDias[selected]?.length ?? 0) === 0 && (
              <p className="text-xs text-muted-foreground">
                Sin días específicos — aplica la configuración de la sucursal
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Selecciona un empleado para configurar sus días no laborables
          </p>
        )}
      </div>
    </div>
  );
}

/* ── Tab: Calendario Personal (fechas específicas por empleado) ── */
function CalendarioPersonalTab({
  empleados,
  fechasIniciales,
}: {
  empleados: Empleado[];
  fechasIniciales: FechaNoLaborableEmpleado[];
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [month, setMonth] = useState(new Date());
  const [fechasMap, setFechasMap] = useState<Record<string, string[]>>(() => {
    const map: Record<string, string[]> = {};
    for (const f of fechasIniciales) {
      if (!map[f.id_empleado]) map[f.id_empleado] = [];
      map[f.id_empleado].push(f.fecha);
    }
    return map;
  });
  const [isPending, startTransition] = useTransition();

  const filtered = empleados.filter((e) =>
    e.nombre.toLowerCase().includes(search.toLowerCase()),
  );

  function toggleDate(isoDate: string) {
    if (!selected) return;
    const existing = (fechasMap[selected] ?? []).includes(isoDate);

    setFechasMap((prev) => {
      const current = prev[selected] ?? [];
      return {
        ...prev,
        [selected]: existing
          ? current.filter((f) => f !== isoDate)
          : [...current, isoDate],
      };
    });

    startTransition(async () => {
      const res = await toggleFechaNoLaborableEmpleado(selected, isoDate);
      if (!res.ok) {
        setFechasMap((prev) => {
          const current = prev[selected] ?? [];
          return {
            ...prev,
            [selected]: existing
              ? [...current, isoDate]
              : current.filter((f) => f !== isoDate),
          };
        });
        toast.error(res.error);
      } else {
        toast.success(existing ? "Fecha eliminada" : "Fecha marcada");
      }
    });
  }

  if (empleados.length === 0) {
    return <p className="text-sm text-muted-foreground">No tienes empleados registrados.</p>;
  }

  const empleadoActual = empleados.find((e) => e.id === selected);
  const totalFechas = selected ? (fechasMap[selected]?.length ?? 0) : 0;
  const mesStr = format(month, "yyyy-MM");
  const fechasMes = selected
    ? (fechasMap[selected] ?? []).filter((f) => f.startsWith(mesStr)).sort()
    : [];

  return (
    <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
      {/* Employee list */}
      <div className="flex flex-col gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Buscar empleado…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-input bg-transparent pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
          />
        </div>
        <div className="flex max-h-72 flex-col gap-0.5 overflow-y-auto rounded-xl border border-border p-1.5">
          {filtered.length === 0 ? (
            <p className="px-3 py-4 text-center text-xs text-muted-foreground">Sin resultados</p>
          ) : (
            filtered.map((e) => {
              const hasFechas = (fechasMap[e.id]?.length ?? 0) > 0;
              const isSelected = selected === e.id;
              return (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => setSelected(e.id)}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors
                    ${isSelected
                      ? "bg-violet-600 text-white shadow-sm"
                      : "text-foreground hover:bg-muted"
                    }`}
                >
                  <span className="flex-1 truncate">{e.nombre}</span>
                  {hasFechas && (
                    <span
                      className={`size-2 shrink-0 rounded-full ${
                        isSelected ? "bg-white/70" : "bg-violet-500"
                      }`}
                    />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-col gap-4">
        {selected && empleadoActual ? (
          <>
            {/* Employee header */}
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-violet-500/10">
                <span className="text-sm font-bold text-violet-600 dark:text-violet-400">
                  {empleadoActual.nombre.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {empleadoActual.nombre}
                </p>
                <p className="text-xs text-muted-foreground">Días libres personales</p>
              </div>
              {totalFechas > 0 && (
                <span className="shrink-0 rounded-full bg-violet-500/10 px-2.5 py-1 text-xs font-semibold text-violet-600 dark:text-violet-400">
                  {totalFechas} día{totalFechas !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* Calendar + dates side by side */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              {/* Calendar card — w-fit keeps it compact */}
              <div className="w-fit shrink-0 rounded-2xl border border-border bg-card p-4 shadow-sm">
                <DayPicker
                  locale={es}
                  month={month}
                  onMonthChange={setMonth}
                  onDayClick={(day) => toggleDate(format(day, "yyyy-MM-dd"))}
                  classNames={{
                    root: "relative",
                    months: "flex flex-col gap-4",
                    month: "w-full",
                    month_caption: "flex items-center justify-center pb-3 pt-1",
                    caption_label: "text-sm font-semibold capitalize",
                    nav: "absolute inset-x-0 top-0 flex items-center justify-between pt-1",
                    button_previous:
                      "flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                    button_next:
                      "flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                    month_grid: "w-full border-collapse",
                    weekdays: "flex",
                    weekday:
                      "w-9 text-center text-[0.72rem] font-semibold uppercase tracking-wide text-muted-foreground",
                    week: "mt-1 flex w-full",
                    day: "h-9 w-9 p-0 text-center text-sm",
                    today: "rounded-lg ring-1 ring-inset ring-violet-500/50 font-semibold",
                    outside: "opacity-25",
                  }}
                  components={{
                    Chevron: ({ orientation }) =>
                      orientation === "left" ? (
                        <ChevronLeft className="size-4" />
                      ) : (
                        <ChevronRight className="size-4" />
                      ),
                    DayButton: ({ day, modifiers: _m, ...props }: DayButtonProps) => {
                      const isoDate = format(day.date, "yyyy-MM-dd");
                      const isMarcado = (fechasMap[selected ?? ""] ?? []).includes(isoDate);
                      return (
                        <button
                          {...props}
                          className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-sm transition-colors
                            ${isMarcado
                              ? "bg-violet-500 font-semibold text-white shadow-sm hover:bg-violet-600"
                              : "font-normal text-foreground hover:bg-muted"
                            }`}
                        >
                          {day.date.getDate()}
                        </button>
                      );
                    },
                  }}
                />
                <p className="mt-2 text-center text-[11px] text-muted-foreground/60">
                  Toca un día para marcarlo como libre
                </p>
              </div>

              {/* Dates list for current month */}
              <div className="flex flex-1 flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {format(month, "MMMM yyyy", { locale: es })}
                </p>
                {fechasMes.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-10 text-center">
                    <CalendarX className="size-5 text-muted-foreground/40" />
                    <p className="text-xs text-muted-foreground">Sin días marcados este mes</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {fechasMes.map((f) => (
                      <div
                        key={f}
                        className="flex items-center gap-3 rounded-xl border border-violet-500/15 bg-violet-500/5 px-3 py-2.5"
                      >
                        <span className="size-2 shrink-0 rounded-full bg-violet-500" />
                        <span className="flex-1 text-sm font-medium capitalize text-foreground">
                          {format(parseISO(f), "EEEE d", { locale: es })}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleDate(f)}
                          disabled={isPending}
                          aria-label="Quitar día"
                          className="flex size-6 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-14 text-center">
            <CalendarX className="size-7 text-muted-foreground/40" />
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-medium text-foreground">Selecciona un empleado</p>
              <p className="text-xs text-muted-foreground">
                para gestionar su calendario personal
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Root component ── */
interface Props {
  sucursales: Sucursal[];
  empleados: Empleado[];
  diasSucursal: DiaNoLaborableSucursal[];
  diasEmpleado: DiaNoLaborableEmpleado[];
  fechasNoLaborablesEmpleado: FechaNoLaborableEmpleado[];
}

export function DiasNoLaborables({
  sucursales,
  empleados,
  diasSucursal,
  diasEmpleado,
  fechasNoLaborablesEmpleado,
}: Props) {
  return (
    <Tabs defaultValue="sucursal">
      <TabsList>
        <TabsTrigger value="sucursal">Por Sucursal</TabsTrigger>
        <TabsTrigger value="empleado">Por Empleado</TabsTrigger>
        <TabsTrigger value="personal">Calendario Personal</TabsTrigger>
      </TabsList>
      <TabsContent value="sucursal" className="pt-4">
        <SucursalTab sucursales={sucursales} diasSucursal={diasSucursal} />
      </TabsContent>
      <TabsContent value="empleado" className="pt-4">
        <EmpleadoSemanaTab empleados={empleados} diasEmpleado={diasEmpleado} />
      </TabsContent>
      <TabsContent value="personal" className="pt-4">
        <CalendarioPersonalTab
          empleados={empleados}
          fechasIniciales={fechasNoLaborablesEmpleado}
        />
      </TabsContent>
    </Tabs>
  );
}
