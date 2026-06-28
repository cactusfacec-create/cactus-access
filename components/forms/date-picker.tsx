"use client";

import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

function formatDate(date: Date) {
  return date.toLocaleDateString("es-EC", {
    weekday: "long",
    day: "2-digit",
    month: "short",
  });
}

export function DatePicker({
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
          <Button variant="outline" className="gap-1.5 capitalize">
            <CalendarIcon className="size-4" />
            {formatDate(value)}
          </Button>
        }
      />
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          required
          selected={value}
          onSelect={(date) => onChange(date)}
        />
      </PopoverContent>
    </Popover>
  );
}
