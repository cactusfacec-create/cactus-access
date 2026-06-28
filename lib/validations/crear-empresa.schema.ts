import { z } from "zod";

// Usado por el Súper Admin para crear una empresa nueva + su primer usuario
// cliente, sin pasar por el flujo público de /registro.
export const crearEmpresaSchema = z.object({
  nombreEmpresa: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export type CrearEmpresaInput = z.infer<typeof crearEmpresaSchema>;
