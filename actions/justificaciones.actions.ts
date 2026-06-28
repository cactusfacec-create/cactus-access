"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { requireCliente, requireLicenciaActiva } from "@/lib/auth/guards";
import type { ActionResult } from "@/lib/types/domain";

export async function createJustificacion(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const { profile } = await requireCliente();
  await requireLicenciaActiva(profile.id_empresa);

  const idEmpleado = formData.get("idEmpleado") as string;
  const fecha = formData.get("fecha") as string;
  const motivo = (formData.get("motivo") as string)?.trim();
  const tipo = (formData.get("tipo") as string) === "incompleto" ? "incompleto" : "falta";
  const file = formData.get("comprobante") as File | null;

  if (!idEmpleado || !fecha || !motivo)
    return { ok: false, error: "Completa todos los campos obligatorios" };

  const supabase = await createClient();
  const { data: empleado } = await supabase
    .from("empleados")
    .select("id")
    .eq("id", idEmpleado)
    .eq("id_empresa", profile.id_empresa)
    .maybeSingle();

  if (!empleado) return { ok: false, error: "Empleado no encontrado" };

  let urlComprobante: string | null = null;

  if (file && file.size > 0) {
    const nameParts = file.name.split(".");
    const ext = nameParts.length > 1 ? nameParts.pop()! : "bin";
    const path = `${profile.id_empresa}/${idEmpleado}/${fecha}.${ext}`;
    const srClient = createServiceRoleClient();

    await srClient.storage.createBucket("comprobantes", {
      public: false,
      fileSizeLimit: 10485760,
    }).catch(() => null);

    const bytes = await file.arrayBuffer();
    const { error: uploadError } = await srClient.storage
      .from("comprobantes")
      .upload(path, bytes, { contentType: file.type, upsert: true });

    if (uploadError)
      return { ok: false, error: "Error al subir el comprobante" };

    const { data: signed } = await srClient.storage
      .from("comprobantes")
      .createSignedUrl(path, 60 * 60 * 24 * 365);

    urlComprobante = signed?.signedUrl ?? null;
  }

  const { data, error } = await supabase
    .from("justificaciones_falta")
    .insert({
      id_empresa: profile.id_empresa,
      id_empleado: idEmpleado,
      fecha,
      motivo,
      tipo,
      url_comprobante: urlComprobante,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505")
      return {
        ok: false,
        error: "Ya existe una justificación para este empleado en esa fecha",
      };
    return { ok: false, error: "No se pudo guardar la justificación" };
  }

  revalidatePath("/justificaciones");
  revalidatePath("/asistencias", "layout");
  return { ok: true, data: { id: data.id } };
}

export async function updateEstadoJustificacion(
  id: string,
  estado: "aprobada" | "rechazada" | "pendiente",
): Promise<ActionResult> {
  const { profile } = await requireCliente();
  await requireLicenciaActiva(profile.id_empresa);

  const supabase = await createClient();
  const { error } = await supabase
    .from("justificaciones_falta")
    .update({ estado })
    .eq("id", id)
    .eq("id_empresa", profile.id_empresa);

  if (error) return { ok: false, error: "No se pudo actualizar el estado" };

  revalidatePath("/justificaciones");
  revalidatePath("/asistencias", "layout");
  return { ok: true };
}

export async function deleteJustificacion(id: string): Promise<ActionResult> {
  const { profile } = await requireCliente();
  await requireLicenciaActiva(profile.id_empresa);

  const supabase = await createClient();
  const { error } = await supabase
    .from("justificaciones_falta")
    .delete()
    .eq("id", id)
    .eq("id_empresa", profile.id_empresa);

  if (error) return { ok: false, error: "No se pudo eliminar la justificación" };

  revalidatePath("/justificaciones");
  revalidatePath("/asistencias", "layout");
  return { ok: true };
}
