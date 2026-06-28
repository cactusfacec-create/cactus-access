"use server";

import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/auth/guards";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import {
  licenciaLimitesSchema,
  asignarPlanSchema,
  type LicenciaLimitesInput,
  type AsignarPlanInput,
} from "@/lib/validations/licencia.schema";
import { logAudit } from "@/actions/admin/logs.actions";
import type { ActionResult } from "@/lib/types/domain";

export async function updateLicenciaLimites(
  input: LicenciaLimitesInput,
): Promise<ActionResult> {
  const parsed = licenciaLimitesSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos" };

  await requireSuperAdmin();

  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("licencias")
    .update({
      limite_empleados: parsed.data.limiteEmpleados,
      limite_sucursales: parsed.data.limiteSucursales,
      fecha_vencimiento: parsed.data.fechaVencimiento,
    })
    .eq("id_empresa", parsed.data.idEmpresa);
  if (error) return { ok: false, error: "No se pudo actualizar la licencia" };

  revalidatePath("/admin");
  return { ok: true };
}

export async function asignarPlan(input: AsignarPlanInput): Promise<ActionResult> {
  const parsed = asignarPlanSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos" };

  const { user } = await requireSuperAdmin();

  const supabase = createServiceRoleClient();

  let limiteSucursales = parsed.data.limiteSucursales ?? 0;
  let limiteEmpleados = parsed.data.limiteEmpleados ?? 0;
  let precio = parsed.data.precio ?? 0;

  // Para planes predefinidos, obtener límites y precio desde la tabla planes
  if (parsed.data.planTipo !== "personalizado") {
    const { data: plan } = await supabase
      .from("planes")
      .select("*")
      .eq("id", parsed.data.planTipo)
      .single();

    if (!plan) return { ok: false, error: `Plan "${parsed.data.planTipo}" no configurado` };

    limiteSucursales = plan.limite_sucursales;
    limiteEmpleados = plan.limite_empleados;

    const precioMap: Record<string, number> = {
      trimestral: plan.precio_trimestral,
      semestral: plan.precio_semestral,
      anual: plan.precio_anual,
    };
    precio = precioMap[parsed.data.periodoFacturacion] ?? 0;
  }

  // Solo actualiza la configuración del plan negociado — nunca toca plan_tipo,
  // fecha_vencimiento ni activa. plan_tipo se actualiza cuando se registra un pago.
  const { error } = await supabase
    .from("licencias")
    .update({
      periodo_facturacion: parsed.data.periodoFacturacion,
      precio,
      limite_sucursales: limiteSucursales,
      limite_empleados: limiteEmpleados,
    })
    .eq("id_empresa", parsed.data.idEmpresa);

  if (error) return { ok: false, error: "No se pudo asignar el plan" };

  const { data: empresa } = await supabase
    .from("empresas")
    .select("nombre_empresa")
    .eq("id", parsed.data.idEmpresa)
    .single();

  await logAudit({
    userEmail: user.email ?? "",
    userId: user.id,
    accion: "asignar_plan",
    entidad: "licencia",
    entidadId: parsed.data.idEmpresa,
    empresaNombre: empresa?.nombre_empresa,
    detalle: {
      plan: parsed.data.planTipo,
      periodo: parsed.data.periodoFacturacion,
      precio,
    },
  });

  revalidatePath("/admin");
  return { ok: true };
}

export async function toggleLicenciaActiva(
  idEmpresa: string,
  nuevoEstado: boolean,
): Promise<ActionResult> {
  const { user } = await requireSuperAdmin();

  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("licencias")
    .update({ activa: nuevoEstado })
    .eq("id_empresa", idEmpresa);
  if (error) return { ok: false, error: "No se pudo cambiar el estado de la licencia" };

  const { data: empresa } = await supabase
    .from("empresas")
    .select("nombre_empresa")
    .eq("id", idEmpresa)
    .single();

  await logAudit({
    userEmail: user.email ?? "",
    userId: user.id,
    accion: nuevoEstado ? "activar_empresa" : "desactivar_empresa",
    entidad: "licencia",
    entidadId: idEmpresa,
    empresaNombre: empresa?.nombre_empresa,
    detalle: { activa: nuevoEstado },
  });

  revalidatePath("/admin");
  return { ok: true };
}
