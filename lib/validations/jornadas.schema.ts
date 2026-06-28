import { z } from "zod";

const horaRegex = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;
const horaOpcional = z.string().regex(horaRegex, "Formato HH:MM").optional().or(z.literal(""));

// Forma compartida entre sucursales (horario "global" de la sucursal) y
// horarios_empleados (override individual). La jornada 2 ya no se recolecta
// en el form (UI unificada a un solo horario) pero las columnas siguen
// existiendo en Supabase, así que jornadasToRow las escribe en false/null
// explícitamente para no forzar una migración.
export const jornadasSchema = z.object({
  // Apagado = turno continuo / media jornada: sin receso de almuerzo.
  jornada1IncluyeAlmuerzo: z.coerce.boolean().default(true),
  jornada1Entrada: horaOpcional,
  jornada1SalidaAlmuerzo: horaOpcional,
  jornada1EntradaAlmuerzo: horaOpcional,
  jornada1Salida: horaOpcional,
});

export type JornadasInput = z.infer<typeof jornadasSchema>;

// Mapea el input del form (camelCase) a las columnas de sucursales/horarios_empleados.
export function jornadasToRow(input: JornadasInput) {
  return {
    // Sin toggle explícito: hay horario activo si tiene entrada y salida.
    jornada1_activo: Boolean(input.jornada1Entrada) && Boolean(input.jornada1Salida),
    jornada1_entrada: input.jornada1Entrada || null,
    // Si no incluye almuerzo, se ignoran los campos aunque queden valores
    // residuales en el form — el turno continuo nunca debe guardar receso.
    jornada1_salida_almuerzo: input.jornada1IncluyeAlmuerzo
      ? input.jornada1SalidaAlmuerzo || null
      : null,
    jornada1_entrada_almuerzo: input.jornada1IncluyeAlmuerzo
      ? input.jornada1EntradaAlmuerzo || null
      : null,
    jornada1_salida: input.jornada1Salida || null,
    jornada2_activo: false,
    jornada2_entrada: null,
    jornada2_salida: null,
  };
}
