import { z } from "zod";
import { jornadasSchema } from "@/lib/validations/jornadas.schema";

export const empleadoSchema = z.object({
  nombre: z.string().min(2),
  cedula: z.string().min(1),
  telefono: z.string().min(8).optional().or(z.literal("")),
  sucursalId: z.string().uuid().optional(),
  usaHorarioGlobal: z.coerce.boolean().default(true),
  salarioDiario: z.coerce.number().min(0).default(0),
  tipoSalario: z.enum(["diario", "mensual"]).default("diario"),
  horasJornada: z.coerce.number().min(1).max(24).default(8),
  valorHoraExtra: z.coerce.number().min(0).default(0),
  descuentaAtrasos: z.coerce.boolean().default(false),
  fechaIngreso: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  diaCorte: z.coerce.number().int().min(1).max(28).nullable().optional(),
}).merge(jornadasSchema);

export type EmpleadoInput = z.infer<typeof empleadoSchema>;
