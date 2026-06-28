"use client";

import { useRouter, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Scissors } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { MonthPicker } from "@/components/forms/month-picker";
import { hoyISO, rangoPeriodo, shiftPeriodoCorte } from "@/lib/asistencia";

interface Props {
  diaCorte: number | null;
  desde: string;
  hasta: string;
}

export function PeriodoFiltro({ diaCorte, desde, hasta }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  function navigate(newDesde: string, newHasta: string) {
    const params = new URLSearchParams({ desde: newDesde, hasta: newHasta });
    router.push(`${pathname}?${params.toString()}`);
  }

  function goMonth(date: Date) {
    const fecha = date.toISOString().slice(0, 10);
    const { desde: d, hasta: h } = rangoPeriodo(fecha);
    navigate(d, h);
  }

  if (diaCorte) {
    const desdeDate = parseISO(desde);
    const hastaDate = parseISO(hasta);
    const label = `${format(desdeDate, "d MMM", { locale: es })} – ${format(hastaDate, "d MMM yyyy", { locale: es })}`;

    function prev() {
      const { desde: d, hasta: h } = shiftPeriodoCorte(desde, -1);
      navigate(d, h);
    }

    function next() {
      const hoy = hoyISO();
      const { desde: d, hasta: h } = shiftPeriodoCorte(desde, 1);
      if (d <= hoy) navigate(d, h);
    }

    const { desde: nextDesde } = shiftPeriodoCorte(desde, 1);
    const isCurrentOrFuture = nextDesde > hoyISO();

    return (
      <div className="flex flex-col items-center gap-0.5">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prev}
            className="flex size-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Período anterior"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="min-w-[160px] text-center text-sm font-medium text-foreground">
            {label}
          </span>
          <button
            type="button"
            onClick={next}
            disabled={isCurrentOrFuture}
            className="flex size-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Período siguiente"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground/70">
          <Scissors className="size-2.5" />
          corte día {diaCorte}
        </span>
      </div>
    );
  }

  // No dia_corte → calendar month navigation
  const anchor = new Date(`${desde}T00:00:00`);
  return (
    <MonthPicker
      value={anchor}
      onChange={goMonth}
    />
  );
}
