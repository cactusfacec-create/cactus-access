import { z } from "zod";

export const planPrecioSchema = z.object({
  id: z.enum(["pro", "max"]),
  precio_trimestral: z.coerce.number().min(0),
  precio_semestral: z.coerce.number().min(0),
  precio_anual: z.coerce.number().min(0),
  limite_sucursales: z.coerce.number().int().min(1),
  limite_empleados: z.coerce.number().int().min(1),
});

export type PlanPrecioInput = z.infer<typeof planPrecioSchema>;
