"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireCliente, requireLicenciaActiva } from "@/lib/auth/guards";
import { checkLimiteDisponible } from "@/lib/auth/license-limits";
import { sucursalSchema, type SucursalInput } from "@/lib/validations/sucursal.schema";
import { jornadasToRow } from "@/lib/validations/jornadas.schema";
import type { ActionResult } from "@/lib/types/domain";

export async function createSucursal(input: SucursalInput): Promise<ActionResult> {
  const parsed = sucursalSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos" };

  const { profile } = await requireCliente();
  await requireLicenciaActiva(profile.id_empresa);

  const usage = await checkLimiteDisponible({
    idEmpresa: profile.id_empresa,
    recurso: "sucursales",
  });
  if (usage.actual >= usage.limite) {
    return { ok: false, error: "Alcanzaste el límite de sucursales de tu licencia" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("sucursales").insert({
    id_empresa: profile.id_empresa,
    nombre_sucursal: parsed.data.nombreSucursal,
    direccion: parsed.data.direccion || null,
    mac_address: parsed.data.macAddress || null,
    ...jornadasToRow(parsed.data),
  });
  if (error) return { ok: false, error: "No se pudo crear la sucursal" };

  revalidatePath("/sucursales");
  return { ok: true };
}

export async function updateSucursal(
  id: string,
  input: SucursalInput,
): Promise<ActionResult> {
  const parsed = sucursalSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos" };

  const { profile } = await requireCliente();
  await requireLicenciaActiva(profile.id_empresa);

  const supabase = await createClient();
  const { error } = await supabase
    .from("sucursales")
    .update({
      nombre_sucursal: parsed.data.nombreSucursal,
      direccion: parsed.data.direccion || null,
      mac_address: parsed.data.macAddress || null,
      dia_corte: parsed.data.diaCorte ?? null,
      ...jornadasToRow(parsed.data),
    })
    .eq("id", id)
    .eq("id_empresa", profile.id_empresa);
  if (error) return { ok: false, error: "No se pudo actualizar la sucursal" };

  revalidatePath("/sucursales");
  return { ok: true };
}

export async function deleteSucursal(id: string): Promise<ActionResult> {
  const { profile } = await requireCliente();
  await requireLicenciaActiva(profile.id_empresa);

  const supabase = await createClient();
  const { error } = await supabase
    .from("sucursales")
    .delete()
    .eq("id", id)
    .eq("id_empresa", profile.id_empresa);
  if (error) return { ok: false, error: "No se pudo eliminar la sucursal" };

  revalidatePath("/sucursales");
  return { ok: true };
}
