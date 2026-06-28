"use server";

import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/auth/guards";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { logAudit } from "@/actions/admin/logs.actions";
import type { ActionResult } from "@/lib/types/domain";

export interface ConfiguracionStatus {
  dlocalgo: {
    apiKeySet: boolean;
    secretKeySet: boolean;
    env: string;
  };
}

export async function getConfiguracion(): Promise<ConfiguracionStatus> {
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("configuracion")
    .select("dlocalgo_api_key,dlocalgo_secret_key,dlocalgo_env")
    .eq("id", "global")
    .single();

  return {
    dlocalgo: {
      apiKeySet: Boolean(data?.dlocalgo_api_key || process.env.DLOCALGO_API_KEY),
      secretKeySet: Boolean(data?.dlocalgo_secret_key || process.env.DLOCALGO_SECRET_KEY),
      env: data?.dlocalgo_env || process.env.DLOCALGO_ENV || "sandbox",
    },
  };
}

export async function saveDLocalGoConfig(input: {
  apiKey: string;
  secretKey: string;
  env: string;
}): Promise<ActionResult> {
  const { user } = await requireSuperAdmin();
  const supabase = createServiceRoleClient();

  const update: Record<string, unknown> = { id: "global", updated_at: new Date().toISOString() };
  if (input.apiKey.trim()) update.dlocalgo_api_key = input.apiKey.trim();
  if (input.secretKey.trim()) update.dlocalgo_secret_key = input.secretKey.trim();
  if (input.env) update.dlocalgo_env = input.env;

  if (Object.keys(update).length <= 2) {
    return { ok: false, error: "Ingresa al menos un valor para guardar" };
  }

  const { error } = await supabase.from("configuracion").upsert(update);
  if (error) return { ok: false, error: "No se pudo guardar la configuración" };

  await logAudit({
    userEmail: user.email ?? "",
    userId: user.id,
    accion: "actualizar_credenciales",
    entidad: "configuracion",
    detalle: { pasarela: "dlocalgo", env: input.env },
  });

  revalidatePath("/admin/configuracion");
  return { ok: true };
}
