"use client";

import { CalendarIcon } from "lucide-react";
import { startOfWeek, endOfWeek, isSameWeek } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

function formatRangoSemana(date: Date) {
  const inicio = startOfWeek(date, { weekStartsOn: 1 });
  const fin = endOfWeek(date, { weekStartsOn: 1 });
  const fmtDia = (d: Date) => d.toLocaleDateString("es-EC", { day: "2-digit" });
  const fmtMes = (d: Date) => d.toLocaleDateString("es-EC", { month: "short" });
  return inicio.getMonth() === fin.getMonth()
    ? `${fmtDia(inicio)} – ${fmtDia(fin)} ${fmtMes(fin)}`
    : `${fmtDia(inicio)} ${fmtMes(inicio)} – ${fmtDia(fin)} ${fmtMes(fin)}`;
}

export function WeekPicker({
  value,
  onChange,
}: {
  value: Date;
  onChange: (date: Date) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="outline" className="gap-1.5">
            <CalendarIcon className="size-4" />
            {formatRangoSemana(value)}
          </Button>
        }
      />
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          required
          selected={value}
          onSelect={onChange}
          weekStartsOn={1}
          modifiers={{ selectedWeek: (date) => isSameWeek(date, value, { weekStartsOn: 1 }) }}
          modifiersClassNames={{ selectedWeek: "rounded-none bg-secondary" }}
        />
      </PopoverContent>
    </Popover>
  );
}
