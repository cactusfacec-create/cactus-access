"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getEstadoDia } from "@/lib/asistencia";
import type { EmpleadoAsistenciaDia } from "@/lib/types/domain";

const ESTADO_LABEL: Record<ReturnType<typeof getEstadoDia>, string> = {
  a_tiempo: "A tiempo",
  atrasado: "Atrasado",
  horas_extra: "Horas extra",
  incompleto: "Incompleto",
};

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function formatHora(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" });
}

function toCsv(registros: EmpleadoAsistenciaDia[]) {
  const header = [
    "Empleado",
    "Cédula",
    "Sucursal",
    "Entrada",
    "Salida almuerzo",
    "Regreso almuerzo",
    "Salida",
    "Minutos atraso",
    "Minutos salida temprana",
    "Minutos extra",
    "Estado",
  ];
  const lines = registros.map(({ empleado, sucursalNombre, row }) => [
    empleado.nombre,
    empleado.cedula,
    sucursalNombre,
    formatHora(row.hora_entrada_real),
    formatHora(row.hora_salida_almuerzo_real),
    formatHora(row.hora_entrada_almuerzo_real),
    formatHora(row.hora_salida_real),
    String(row.minutos_atraso),
    String(row.minutos_salida_temprana),
    String(row.minutos_extras),
    ESTADO_LABEL[getEstadoDia(row)],
  ]);
  return [header, ...lines].map((cols) => cols.map(csvEscape).join(",")).join("\n");
}

export function ExportarReporteButton({
  registros,
  fecha,
}: {
  registros: EmpleadoAsistenciaDia[];
  fecha: string;
}) {
  function handleExport() {
    const csv = toCsv(registros);
    // BOM al inicio para que Excel detecte UTF-8 y no rompa tildes/ñ.
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `asistencias_${fecha}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button variant="outline" onClick={handleExport} className="gap-1.5">
      <Download className="size-4" />
      Exportar reporte
    </Button>
  );
}
