import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const identificadorSchema = z.object({
  identificador: z.string().min(5, "Ingresa tu cédula o RUC"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const otpSchema = z.object({
  code: z
    .string()
    .length(6, "El código debe tener 6 dígitos")
    .regex(/^\d{6}$/, "Solo dígitos"),
});

export const signUpSchema = z.object({
  password: z.string().min(6),
  nombreEmpresa: z.string().min(2),
  direccion: z.string().optional().or(z.literal("")),
  telefono: z.string().min(7, "Ingresa un número de WhatsApp válido"),
  ruc: z.string().min(5, "Ingresa tu cédula o RUC"),
});

export const forgotPasswordSchema = z.object({
  identificador: z.string().min(5, "Ingresa tu cédula o RUC"),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type IdentificadorInput = z.infer<typeof identificadorSchema>;
export type OtpInput = z.infer<typeof otpSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
