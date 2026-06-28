"use server";

import { revalidatePath } from "next/cache";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { requireSuperAdmin } from "@/lib/auth/guards";
import type { EstadoSugerencia } from "@/lib/types/database.types";
import type { ActionResult } from "@/lib/types/domain";

export type SugerenciaConEmpresa = {
  id: string;
  id_empresa: string;
  mensaje: string;
  estado: EstadoSugerencia;
  created_at: string;
  empresa_nombre: string;
};

export async function listSugerencias(): Promise<SugerenciaConEmpresa[]> {
  await requireSuperAdmin();
  const supabase = createServiceRoleClient();

  const [{ data: sugerencias }, { data: empresas }] = await Promise.all([
    supabase
      .from("sugerencias")
      .select("id, id_empresa, mensaje, estado, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("empresas").select("id, nombre_empresa"),
  ]);

  const empresaById = new Map((empresas ?? []).map((e) => [e.id, e.nombre_empresa]));

  return (sugerencias ?? []).map((row) => ({
    id: row.id,
    id_empresa: row.id_empresa,
    mensaje: row.mensaje,
    estado: row.estado as EstadoSugerencia,
    created_at: row.created_at,
    empresa_nombre: empresaById.get(row.id_empresa) ?? "—",
  }));
}

export async function updateEstadoSugerencia(
  id: string,
  estado: EstadoSugerencia,
): Promise<ActionResult> {
  await requireSuperAdmin();
  const supabase = createServiceRoleClient();

  const { error } = await supabase
    .from("sugerencias")
    .update({ estado })
    .eq("id", id);

  if (error) return { ok: false, error: "No se pudo actualizar el estado" };
  revalidatePath("/admin/sugerencias");
  return { ok: true };
}
