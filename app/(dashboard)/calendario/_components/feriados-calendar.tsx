"use client";

import { useState, useTransition } from "react";
import { DayPicker, type DayButtonProps } from "react-day-picker";
import { es } from "date-fns/locale";
import { format, parseISO } from "date-fns";
import { Trash2, CalendarX, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { toggleDiaFeriado } from "@/actions/calendario.actions";
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
import type { DiaFeriado, Sucursal } from "@/lib/types/database.types";

interface Props {
  sucursales: Sucursal[];
  feriadosIniciales: DiaFeriado[];
}

export function FeriadosCalendar({ sucursales, feriadosIniciales }: Props) {
  const [selectedSucursal, setSelectedSucursal] = useState<string>(
    sucursales[0]?.id ?? "",
  );
  const [feriados, setFeriados] = useState<DiaFeriado[]>(feriadosIniciales);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [descripcion, setDescripcion] = useState("");
  const [month, setMonth] = useState(new Date());
  const [isPending, startTransition] = useTransition();

  const feriadosSucursal = feriados.filter(
    (f) => f.id_sucursal === selectedSucursal,
  );

  function handleDayClick(day: Date) {
    if (!selectedSucursal) return;
    const isoDate = format(day, "yyyy-MM-dd");
    const existing = feriadosSucursal.find((f) => f.fecha === isoDate);
    if (existing) {
      handleDelete(existing.id, isoDate);
    } else {
      setSelectedDate(day);
      setDescripcion("");
      setDialogOpen(true);
    }
  }

  function handleDelete(id: string, fecha: string) {
    startTransition(async () => {
      const res = await toggleDiaFeriado(selectedSucursal, fecha);
      if (res.ok) {
        setFeriados((prev) => prev.filter((f) => f.id !== id));
        toast.success("Feriado eliminado");
      } else {
        toast.error(res.error);
      }
    });
  }

  function handleAdd() {
    if (!selectedDate || !selectedSucursal) return;
    const fecha = format(selectedDate, "yyyy-MM-dd");
    startTransition(async () => {
      const res = await toggleDiaFeriado(selectedSucursal, fecha, descripcion);
      if (res.ok) {
        setFeriados((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            id_sucursal: selectedSucursal,
            fecha,
            descripcion: descripcion || null,
            created_at: new Date().toISOString(),
          },
        ]);
        setDialogOpen(false);
        toast.success("Feriado registrado");
      } else {
        toast.error(res.error);
      }
    });
  }

  const feriadosMes = feriadosSucursal
    .filter((f) => f.fecha.startsWith(format(month, "yyyy-MM")))
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  if (sucursales.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No tienes sucursales registradas.
      </p>
    );
  }

  return (
    <>
      {/* Sucursal selector */}
      {sucursales.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {sucursales.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelectedSucursal(s.id)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors cursor-pointer
                ${selectedSucursal === s.id
                  ? "bg-amber-500 text-white"
                  : "border border-border bg-card text-foreground hover:bg-muted"
                }`}
            >
              {s.nombre_sucursal}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
        {/* Calendar */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-[0px_4px_20px_rgba(0,0,0,0.03)]">
          <DayPicker
            locale={es}
            month={month}
            onMonthChange={setMonth}
            onDayClick={handleDayClick}
            classNames={{
              root: "relative",
              months: "flex flex-col gap-4",
              month: "w-full",
              month_caption: "flex justify-center items-center pt-1 mb-3",
              caption_label: "text-sm font-semibold capitalize",
              nav: "absolute inset-x-0 top-0 flex items-center justify-between pt-1",
              button_previous: "flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-transparent opacity-50 hover:opacity-100",
              button_next: "flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-transparent opacity-50 hover:opacity-100",
              month_grid: "w-full border-collapse",
              weekdays: "flex",
              weekday: "w-9 text-center text-[0.8rem] font-normal text-muted-foreground",
              week: "mt-2 flex w-full",
              day: "h-9 w-9 p-0 text-center text-sm",
              today: "rounded-lg bg-muted font-semibold",
              outside: "opacity-30",
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
                const isFeriado = feriadosSucursal.some((f) => f.fecha === isoDate);
                return (
                  <button
                    {...props}
                    className={`relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-sm font-normal transition-colors hover:bg-muted ${isFeriado ? "bg-amber-500/15 font-semibold text-amber-700 dark:text-amber-300" : ""}`}
                  >
                    {day.date.getDate()}
                    {isFeriado && (
                      <span className="absolute bottom-0.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-amber-500" />
                    )}
                  </button>
                );
              },
            }}
          />
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Haz clic en un día para marcarlo como feriado
          </p>
        </div>

        {/* List */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold capitalize text-foreground">
              {format(month, "MMMM yyyy", { locale: es })}
            </h3>
            <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
              {feriadosSucursal.length} feriado{feriadosSucursal.length !== 1 ? "s" : ""}
            </span>
          </div>

          {feriadosMes.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-10 text-center">
              <CalendarX className="size-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                Sin feriados en este mes
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {feriadosMes.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                    <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                      {parseInt(f.fecha.slice(8, 10), 10)}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col">
                    <span className="text-sm font-medium text-foreground capitalize">
                      {format(parseISO(f.fecha), "EEEE d", { locale: es })}
                    </span>
                    {f.descripcion && (
                      <span className="text-xs text-muted-foreground">
                        {f.descripcion}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(f.id, f.fecha)}
                    disabled={isPending}
                    aria-label="Eliminar feriado"
                    className="flex size-7 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {feriadosSucursal.length > feriadosMes.length && (
            <details className="mt-1">
              <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                Ver todos los feriados de esta sucursal ({feriadosSucursal.length})
              </summary>
              <div className="mt-2 flex flex-col gap-1.5 pl-1">
                {feriadosSucursal
                  .slice()
                  .sort((a, b) => a.fecha.localeCompare(b.fecha))
                  .map((f) => (
                    <div key={f.id} className="flex items-center gap-2 text-xs">
                      <span className="tabular-nums text-muted-foreground">
                        {format(parseISO(f.fecha), "dd/MM")}
                      </span>
                      <span className="capitalize text-foreground">
                        {format(parseISO(f.fecha), "EEEE", { locale: es })}
                      </span>
                      {f.descripcion && (
                        <span className="text-muted-foreground">— {f.descripcion}</span>
                      )}
                    </div>
                  ))}
              </div>
            </details>
          )}
        </div>
      </div>

      {/* Add holiday dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar día feriado</DialogTitle>
          </DialogHeader>
          {selectedDate && (
            <div className="flex flex-col gap-4">
              <div className="rounded-lg bg-muted/50 px-4 py-3 text-center">
                <p className="text-sm font-semibold capitalize text-foreground">
                  {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="descripcion-feriado">
                  Descripción <span className="text-muted-foreground">(opcional)</span>
                </Label>
                <Input
                  id="descripcion-feriado"
                  placeholder="Ej: Día de la Independencia"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  autoFocus
                />
              </div>
            </div>
          )}
          <DialogFooter showCloseButton>
            <Button onClick={handleAdd} disabled={isPending}>
              <Plus className="size-4" />
              {isPending ? "Guardando…" : "Registrar feriado"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </>
  );
}
