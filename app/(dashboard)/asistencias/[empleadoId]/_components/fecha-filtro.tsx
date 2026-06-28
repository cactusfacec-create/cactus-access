"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { DatePicker } from "@/components/forms/date-picker";
import { hoyISO } from "@/lib/asistencia";

export function FechaFiltro() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const fecha = searchParams.get("fecha") ?? hoyISO();

  return (
    <DatePicker
      value={new Date(`${fecha}T00:00:00`)}
      onChange={(date) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("fecha", date.toISOString().slice(0, 10));
        router.push(`${pathname}?${params.toString()}`);
      }}
    />
  );
}
