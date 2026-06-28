import { z } from "zod";

export const crearAdminSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .regex(/[A-Z]/, "Debe tener al menos una mayúscula")
    .regex(/[0-9]/, "Debe tener al menos un número"),
  confirmPassword: z.string(),
  whatsapp: z
    .string()
    .regex(/^\d{7,15}$/, "Solo dígitos, con código de país (ej: 593987654321)")
    .optional()
    .or(z.literal("")),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export type CrearAdminInput = z.infer<typeof crearAdminSchema>;
