"use client";

import { useState } from "react";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const MESES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

function formatMesAnio(date: Date) {
  const label = date.toLocaleDateString("es-EC", { month: "long", year: "numeric" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function MonthPicker({
  value,
  onChange,
}: {
  value: Date;
  onChange: (date: Date) => void;
}) {
  const [open, setOpen] = useState(false);

  function seleccionarMes(monthIndex: number) {
    onChange(new Date(value.getFullYear(), monthIndex, 1));
    setOpen(false);
  }

  function cambiarAnio(delta: number) {
    onChange(new Date(value.getFullYear() + delta, value.getMonth(), 1));
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button variant="outline" className="gap-1.5 capitalize">
            <CalendarIcon className="size-4" />
            {formatMesAnio(value)}
          </Button>
        }
      />
      <PopoverContent align="start" className="w-56 p-3">
        <div className="flex items-center justify-between pb-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => cambiarAnio(-1)}
            aria-label="Año anterior"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-sm font-semibold text-foreground">{value.getFullYear()}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => cambiarAnio(1)}
            aria-label="Año siguiente"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {MESES.map((mes, index) => (
            <button
              key={mes}
              type="button"
              onClick={() => seleccionarMes(index)}
              className={cn(
                "rounded-md px-2 py-1.5 text-sm font-medium transition-colors duration-200",
                value.getMonth() === index
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted",
              )}
            >
              {mes}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
