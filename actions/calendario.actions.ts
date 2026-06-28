"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireCliente, requireLicenciaActiva } from "@/lib/auth/guards";
import type { ActionResult } from "@/lib/types/domain";

export async function toggleDiaFeriado(
  idSucursal: string,
  fecha: string,
  descripcion?: string,
): Promise<ActionResult> {
  const { profile } = await requireCliente();
  await requireLicenciaActiva(profile.id_empresa);

  const supabase = await createClient();

  // Validate sucursal belongs to this empresa
  const { data: sucursal } = await supabase
    .from("sucursales")
    .select("id")
    .eq("id", idSucursal)
    .eq("id_empresa", profile.id_empresa)
    .maybeSingle();

  if (!sucursal) return { ok: false, error: "Sucursal no encontrada" };

  const { data: existing } = await supabase
    .from("dias_feriados")
    .select("id")
    .eq("id_sucursal", idSucursal)
    .eq("fecha", fecha)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("dias_feriados")
      .delete()
      .eq("id", existing.id);
    if (error) return { ok: false, error: "No se pudo eliminar el feriado" };
  } else {
    const { error } = await supabase.from("dias_feriados").insert({
      id_sucursal: idSucursal,
      fecha,
      descripcion: descripcion?.trim() || null,
    });
    if (error) return { ok: false, error: "No se pudo registrar el feriado" };
  }

  revalidatePath("/calendario");
  return { ok: true };
}

export async function setDiasNoLaborablesSucursal(
  idSucursal: string,
  dias: number[],
): Promise<ActionResult> {
  const { profile } = await requireCliente();
  await requireLicenciaActiva(profile.id_empresa);

  const supabase = await createClient();
  const { data: sucursal } = await supabase
    .from("sucursales")
    .select("id")
    .eq("id", idSucursal)
    .eq("id_empresa", profile.id_empresa)
    .maybeSingle();

  if (!sucursal) return { ok: false, error: "Sucursal no encontrada" };

  await supabase
    .from("dias_no_laborables_sucursal")
    .delete()
    .eq("id_sucursal", idSucursal);

  if (dias.length > 0) {
    const { error } = await supabase.from("dias_no_laborables_sucursal").insert(
      dias.map((d) => ({ id_sucursal: idSucursal, dia_semana: d })),
    );
    if (error) return { ok: false, error: "No se pudo guardar la configuración" };
  }

  revalidatePath("/calendario");
  return { ok: true };
}

export async function setDiasNoLaborablesEmpleado(
  idEmpleado: string,
  dias: number[],
): Promise<ActionResult> {
  const { profile } = await requireCliente();
  await requireLicenciaActiva(profile.id_empresa);

  const supabase = await createClient();
  const { data: empleado } = await supabase
    .from("empleados")
    .select("id")
    .eq("id", idEmpleado)
    .eq("id_empresa", profile.id_empresa)
    .maybeSingle();

  if (!empleado) return { ok: false, error: "Empleado no encontrado" };

  await supabase
    .from("dias_no_laborables_empleado")
    .delete()
    .eq("id_empleado", idEmpleado);

  if (dias.length > 0) {
    const { error } = await supabase.from("dias_no_laborables_empleado").insert(
      dias.map((d) => ({ id_empleado: idEmpleado, dia_semana: d })),
    );
    if (error) return { ok: false, error: "No se pudo guardar la configuración" };
  }

  revalidatePath("/calendario");
  return { ok: true };
}

export async function toggleFechaNoLaborableEmpleado(
  idEmpleado: string,
  fecha: string,
  descripcion?: string,
): Promise<ActionResult> {
  const { profile } = await requireCliente();
  await requireLicenciaActiva(profile.id_empresa);

  const supabase = await createClient();
  const { data: empleado } = await supabase
    .from("empleados")
    .select("id")
    .eq("id", idEmpleado)
    .eq("id_empresa", profile.id_empresa)
    .maybeSingle();

  if (!empleado) return { ok: false, error: "Empleado no encontrado" };

  const { data: existing } = await supabase
    .from("fechas_no_laborables_empleado")
    .select("id_empleado")
    .eq("id_empleado", idEmpleado)
    .eq("fecha", fecha)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("fechas_no_laborables_empleado")
      .delete()
      .eq("id_empleado", idEmpleado)
      .eq("fecha", fecha);
    if (error) return { ok: false, error: "No se pudo eliminar la fecha" };
  } else {
    const { error } = await supabase.from("fechas_no_laborables_empleado").insert({
      id_empleado: idEmpleado,
      fecha,
      descripcion: descripcion?.trim() || null,
    });
    if (error) return { ok: false, error: "No se pudo registrar la fecha" };
  }

  revalidatePath("/calendario");
  return { ok: true };
}
