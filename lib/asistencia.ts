import { startOfMonth, endOfMonth } from "date-fns";
import type { ControlDiario, JustificacionFalta } from "@/lib/types/database.types";
import type { StatusBadgeStatus } from "@/components/cactus/status-badge";

export type EntradaDia =
  | { tipo: "registro"; fecha: string; row: ControlDiario; justificacion?: JustificacionFalta }
  | { tipo: "falta"; fecha: string; justificacion?: JustificacionFalta };

export type AsistenciaEstado = Extract<StatusBadgeStatus, "a_tiempo" | "atrasado" | "horas_extra" | "incompleto">;

type DiaConMinutos = Pick<
  ControlDiario,
  "minutos_atraso" | "minutos_extras" | "hora_salida_almuerzo_real" | "hora_entrada_almuerzo_real" | "hora_salida_real"
>;

export function isRegistroIncompleto(row: Pick<ControlDiario, "hora_salida_almuerzo_real" | "hora_entrada_almuerzo_real" | "hora_salida_real">): boolean {
  return (
    row.hora_salida_almuerzo_real !== null &&
    row.hora_entrada_almuerzo_real === null &&
    row.hora_salida_real === null
  );
}

export function getEstadoDia(row: DiaConMinutos): AsistenciaEstado {
  if (isRegistroIncompleto(row)) return "incompleto";
  if (row.minutos_atraso > 0) return "atrasado";
  if (row.minutos_extras > 0) return "horas_extra";
  return "a_tiempo";
}

export function hoyISO() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Guayaquil" }).format(new Date());
}

export type PeriodoModo = "mes" | "corte";

function isoLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function rangoPeriodo(fechaISO: string) {
  const anchor = new Date(`${fechaISO}T00:00:00`);
  return {
    desde: isoLocal(startOfMonth(anchor)),
    hasta: isoLocal(endOfMonth(anchor)),
  };
}

/** Calcula el período de corte actual (o el que contiene `anchorISO`) dado un día de corte. */
export function rangoPeriodoCorte(diaCorte: number, anchorISO?: string): { desde: string; hasta: string } {
  const ref = anchorISO
    ? new Date(`${anchorISO}T00:00:00`)
    : new Date(`${hoyISO()}T00:00:00`);

  let startYear = ref.getFullYear();
  let startMonth = ref.getMonth();

  if (ref.getDate() < diaCorte) {
    startMonth -= 1;
    if (startMonth < 0) { startMonth = 11; startYear -= 1; }
  }

  const desde = new Date(startYear, startMonth, diaCorte);
  const hasta = new Date(startYear, startMonth + 1, diaCorte - 1);

  return { desde: isoLocal(desde), hasta: isoLocal(hasta) };
}

/** Desplaza un período de corte por `delta` meses (−1 = anterior, +1 = siguiente). */
export function shiftPeriodoCorte(desdeISO: string, delta: number): { desde: string; hasta: string } {
  const d = new Date(`${desdeISO}T00:00:00`);
  const diaCorte = d.getDate();
  d.setMonth(d.getMonth() + delta);
  return rangoPeriodoCorte(diaCorte, isoLocal(d));
}

export function formatHora(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleTimeString("es-EC", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Guayaquil",
  });
}

export interface Marca {
  label: string;
  hora: string | null;
  horaEsperada?: string | null;
  nota?: { texto: string; tono: "warn" | "info" };
}

export interface HorarioProgramado {
  entrada: string | null;
  salidaAlmuerzo: string | null;
  entradaAlmuerzo: string | null;
  salida: string | null;
}

type DiaConMarcas = Pick<
  ControlDiario,
  | "hora_entrada_real"
  | "hora_salida_almuerzo_real"
  | "hora_entrada_almuerzo_real"
  | "hora_salida_real"
  | "minutos_atraso"
  | "minutos_extras"
  | "minutos_salida_temprana"
>;

export function buildMarcas(row: DiaConMarcas, horario?: HorarioProgramado): Marca[] {
  return [
    {
      label: "Entrada",
      hora: formatHora(row.hora_entrada_real),
      horaEsperada: horario?.entrada ?? null,
      nota: row.minutos_atraso > 0 ? { texto: `+${row.minutos_atraso} min`, tono: "warn" } : undefined,
    },
    {
      label: "Salida almuerzo",
      hora: formatHora(row.hora_salida_almuerzo_real),
      horaEsperada: horario?.salidaAlmuerzo ?? null,
    },
    {
      label: "Regreso almuerzo",
      hora: formatHora(row.hora_entrada_almuerzo_real),
      horaEsperada: horario?.entradaAlmuerzo ?? null,
    },
    {
      label: "Salida final",
      hora: formatHora(row.hora_salida_real),
      horaEsperada: horario?.salida ?? null,
      nota:
        row.minutos_extras > 0
          ? { texto: `+${row.minutos_extras} min extra`, tono: "info" }
          : row.minutos_salida_temprana > 0
            ? { texto: `-${row.minutos_salida_temprana} min`, tono: "warn" }
            : undefined,
    },
  ];
}
