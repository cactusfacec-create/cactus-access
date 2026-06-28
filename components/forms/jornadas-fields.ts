import type { FieldConfig } from "@/components/forms/crud-form-dialog";
import type { FieldValues } from "react-hook-form";

// Campos compartidos por el form de Sucursal (horario "global") y el form de
// Empleado (horario individual) — un único horario laboral por entidad.
// No hay toggle de "activar horario": si entrada y salida tienen valor, el
// sistema asume que el horario está activo (ver jornadasToRow).
export function buildJornadasFields(): FieldConfig[] {
  return [
    { name: "jornada1IncluyeAlmuerzo", label: "Incluye receso para almuerzo", type: "switch" },
    { name: "jornada1Entrada", label: "Hora de entrada", type: "time" },
    {
      name: "jornada1SalidaAlmuerzo",
      label: "Salida al almuerzo",
      type: "time",
      showIf: (v: FieldValues) => Boolean(v.jornada1IncluyeAlmuerzo),
    },
    {
      name: "jornada1EntradaAlmuerzo",
      label: "Regreso del almuerzo",
      type: "time",
      showIf: (v: FieldValues) => Boolean(v.jornada1IncluyeAlmuerzo),
    },
    { name: "jornada1Salida", label: "Hora de salida", type: "time" },
  ];
}
