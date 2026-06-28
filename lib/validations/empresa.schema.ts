import { z } from "zod";

const telefonoSchema = z.string().optional().or(z.literal(""));

export const empresaSchema = z.object({
  nombreEmpresa: z.string().min(2),
  direccion: z.string().optional().or(z.literal("")),
  telefono: telefonoSchema,
  email: z.string().email().optional().or(z.literal("")),
  ruc: z.string().optional().or(z.literal("")),
  telefonoNotificacionTardanza: telefonoSchema,
});

export type EmpresaInput = z.infer<typeof empresaSchema>;
