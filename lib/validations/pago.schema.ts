import { z } from "zod";

export const registrarPagoSchema = z.object({
  idEmpresa: z.string().uuid(),
  metodoPago: z.enum(["tarjeta", "efectivo", "transferencia"]),
  monto: z.coerce.number().min(0),
  planTipo: z.enum(["pro", "max", "personalizado"]),
  periodoFacturacion: z.enum(["trimestral", "semestral", "anual"]),
  fechaDesde: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  fechaHasta: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  limiteSucursales: z.coerce.number().int().min(1).optional(),
  limiteEmpleados: z.coerce.number().int().min(1).optional(),
  codigoTransaccion: z.string().optional(),
  comprobanteUrl: z.string().optional(),
  notas: z.string().optional(),
});

export type RegistrarPagoInput = z.infer<typeof registrarPagoSchema>;
