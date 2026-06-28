import { z } from "zod";
import { jornadasSchema } from "@/lib/validations/jornadas.schema";

export const sucursalSchema = z.object({
  nombreSucursal: z.string().min(2),
  direccion: z.string().optional().or(z.literal("")),
  macAddress: z.string().optional().or(z.literal("")),
  diaCorte: z.coerce.number().int().min(1).max(28).nullable().optional(),
}).merge(jornadasSchema);

export type SucursalInput = z.infer<typeof sucursalSchema>;
