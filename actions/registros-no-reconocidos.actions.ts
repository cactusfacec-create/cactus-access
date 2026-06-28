"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireCliente } from "@/lib/auth/guards";
import { createEmpleado } from "@/actions/empleados.actions";
import { empleadoSchema, type EmpleadoInput } from "@/lib/validations/empleado.schema";
import type { ActionResult } from "@/lib/types/domain";
import type { RegistroNoReconocido } from "@/lib/types/database.types";

export async function listPendientes(): Promise<RegistroNoReconocido[]> {
  // No se filtra por id_empresa explícitamente porque registros_no_reconocidos
  // no tiene esa columna directa — la policy RLS ya aísla por tenant via
  // sucursales.id_empresa (ver migración 20260622000003_rls_and_functions.sql).
  await requireCliente();
  const supabase = await createClient();

  const { data } = await supabase
    .from("registros_no_reconocidos")
    .select("*")
    .eq("estado", "pendiente")
    .order("fecha_hora_evento", { ascending: false });

  return data ?? [];
}

export async function descartarRegistro(registroId: string): Promise<ActionResult> {
  await requireCliente();
  const supabase = await createClient();

  const { error } = await supabase
    .from("registros_no_reconocidos")
    .delete()
    .eq("id", registroId);

  if (error) return { ok: false, error: "No se pudo eliminar el registro" };

  revalidatePath("/registros-no-reconocidos");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function resolverRegistro(
  registroId: string,
  empleadoInput: EmpleadoInput,
): Promise<ActionResult> {
  const parsed = empleadoSchema.safeParse(empleadoInput);
  if (!parsed.success) return { ok: false, error: "Datos inválidos" };

  await requireCliente();

  const result = await createEmpleado(parsed.data);
  if (!result.ok) return result;

  const supabase = await createClient();
  const { error } = await supabase
    .from("registros_no_reconocidos")
    .update({ estado: "resuelto" })
    .eq("id", registroId);
  if (error) return { ok: false, error: "Empleado creado, pero no se pudo marcar el registro como resuelto" };

  revalidatePath("/registros-no-reconocidos");
  revalidatePath("/dashboard");
  return { ok: true };
}
