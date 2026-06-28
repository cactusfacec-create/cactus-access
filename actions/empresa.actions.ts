"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireCliente } from "@/lib/auth/guards";
import { empresaSchema, type EmpresaInput } from "@/lib/validations/empresa.schema";
import type { ActionResult } from "@/lib/types/domain";

export async function updateSeguridadEmpresa(otpRequerido: boolean): Promise<ActionResult> {
  const { profile } = await requireCliente();
  const supabase = await createClient();
  const { error } = await supabase
    .from("empresas")
    .update({ otp_requerido: otpRequerido })
    .eq("id", profile.id_empresa);
  if (error) return { ok: false, error: "No se pudo guardar el ajuste de seguridad" };
  revalidatePath("/empresa");
  return { ok: true };
}

export async function updateEmpresa(input: EmpresaInput): Promise<ActionResult> {
  const parsed = empresaSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos" };

  const { profile } = await requireCliente();

  const supabase = await createClient();
  const { error } = await supabase
    .from("empresas")
    .update({
      nombre_empresa: parsed.data.nombreEmpresa,
      direccion: parsed.data.direccion || null,
      telefono: parsed.data.telefono || null,
      ruc: parsed.data.ruc || null,
      telefono_notificacion_tardanza: parsed.data.telefonoNotificacionTardanza || null,
    })
    .eq("id", profile.id_empresa);
  if (error) return { ok: false, error: "No se pudo actualizar la empresa" };

  revalidatePath("/empresa");
  return { ok: true };
}
