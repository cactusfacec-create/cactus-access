"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { DatePicker } from "@/components/forms/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { hoyISO } from "@/lib/asistencia";
import type { Sucursal } from "@/lib/types/database.types";

export function AsistenciasFiltros({ sucursales }: { sucursales: Sucursal[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const fecha = searchParams.get("fecha") ?? hoyISO();
  const sucursalId = searchParams.get("sucursalId") ?? "all";

  function updateParams(next: { fecha?: string; sucursalId?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (!value || value === "all") params.delete(key);
      else params.set(key, value);
    });
    router.push(`${pathname}?${params.toString()}`);
  }

  const sucursalItems: Record<string, string> = { all: "Todas las sucursales" };
  for (const sucursal of sucursales) sucursalItems[sucursal.id] = sucursal.nombre_sucursal;

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <DatePicker
        value={new Date(`${fecha}T00:00:00`)}
        onChange={(date) => { if (date) updateParams({ fecha: date.toISOString().slice(0, 10) }); }}
      />
      <Select
        items={sucursalItems}
        value={sucursalId}
        onValueChange={(value) => updateParams({ sucursalId: value ?? undefined })}
      >
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Todas las sucursales" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(sucursalItems).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
