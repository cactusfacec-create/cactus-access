"use server";

import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/auth/guards";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { planPrecioSchema, type PlanPrecioInput } from "@/lib/validations/plan.schema";
import type { Plan } from "@/lib/types/database.types";
import type { ActionResult } from "@/lib/types/domain";

export async function getPlanes(): Promise<Plan[]> {
  await requireSuperAdmin();
  const supabase = createServiceRoleClient();
  const { data } = await supabase.from("planes").select("*").order("id");
  return (data as Plan[]) ?? [];
}

export async function updatePlan(input: PlanPrecioInput): Promise<ActionResult> {
  const parsed = planPrecioSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos" };

  await requireSuperAdmin();

  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("planes")
    .upsert({
      id: parsed.data.id,
      precio_trimestral: parsed.data.precio_trimestral,
      precio_semestral: parsed.data.precio_semestral,
      precio_anual: parsed.data.precio_anual,
      limite_sucursales: parsed.data.limite_sucursales,
      limite_empleados: parsed.data.limite_empleados,
      updated_at: new Date().toISOString(),
    });

  if (error) return { ok: false, error: "No se pudo guardar el plan" };

  revalidatePath("/admin/planes");
  return { ok: true };
}
