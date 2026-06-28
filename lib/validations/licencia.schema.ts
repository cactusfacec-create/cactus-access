import { z } from "zod";

const PERIODOS = ["trimestral", "semestral", "anual"] as const;
const PLANES = ["pro", "max", "personalizado"] as const;

export const licenciaLimitesSchema = z.object({
  idEmpresa: z.string(),
  limiteEmpleados: z.coerce.number().int().min(0),
  limiteSucursales: z.coerce.number().int().min(0),
  fechaVencimiento: z.string(),
});

export const asignarPlanSchema = z.object({
  idEmpresa: z.string(),
  planTipo: z.enum(PLANES),
  periodoFacturacion: z.enum(PERIODOS),
  // Solo requeridos cuando planTipo === 'personalizado'
  limiteSucursales: z.coerce.number().int().min(0).optional(),
  limiteEmpleados: z.coerce.number().int().min(0).optional(),
  precio: z.coerce.number().min(0).optional(),
}).superRefine((val, ctx) => {
  if (val.planTipo === "personalizado") {
    if (val.limiteSucursales === undefined || val.limiteSucursales === null) {
      ctx.addIssue({ code: "custom", path: ["limiteSucursales"], message: "Requerido" });
    }
    if (val.limiteEmpleados === undefined || val.limiteEmpleados === null) {
      ctx.addIssue({ code: "custom", path: ["limiteEmpleados"], message: "Requerido" });
    }
    if (val.precio === undefined || val.precio === null) {
      ctx.addIssue({ code: "custom", path: ["precio"], message: "Requerido" });
    }
  }
});

export type LicenciaLimitesInput = z.infer<typeof licenciaLimitesSchema>;
export type AsignarPlanInput = z.infer<typeof asignarPlanSchema>;
