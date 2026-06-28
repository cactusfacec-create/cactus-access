"use client";

import { cn } from "@/lib/utils";

const DIAS = Array.from({ length: 28 }, (_, i) => i + 1);

interface Props {
  value: number | null;
  onChange: (day: number | null) => void;
}

export function DiaCorteCalendar({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-7 gap-1">
        {DIAS.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => onChange(value === d ? null : d)}
            className={cn(
              "flex aspect-square items-center justify-center rounded-lg text-sm font-medium transition-colors duration-100",
              value === d
                ? "bg-lime-400 text-emerald-950 ring-2 ring-lime-400/50"
                : "text-foreground hover:bg-muted",
            )}
          >
            {d}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {value
          ? `El período va del día ${value} al día ${value - 1 || 28} del mes siguiente.`
          : "Sin día de corte — se usará el mes calendario."}
      </p>
      {value && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="self-start text-xs text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground"
        >
          Quitar día de corte
        </button>
      )}
    </div>
  );
}
