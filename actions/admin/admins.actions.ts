"use server";

import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/auth/guards";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { crearAdminSchema } from "@/lib/validations/admin.schema";
import { logAudit } from "@/actions/admin/logs.actions";
import type { ActionResult } from "@/lib/types/domain";

export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  whatsapp: string | null;
}

export async function getAdmins(): Promise<AdminUser[]> {
  await requireSuperAdmin();
  const supabase = createServiceRoleClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, whatsapp")
    .eq("rol", "super_admin");

  if (!profiles?.length) return [];

  const profileMap = new Map(profiles.map((p) => [p.id, p.whatsapp as string | null]));

  const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 500 });

  return users
    .filter((u) => profileMap.has(u.id))
    .map((u) => ({
      id: u.id,
      email: u.email ?? "",
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at ?? null,
      whatsapp: profileMap.get(u.id) ?? null,
    }))
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

export async function crearAdmin(
  input: { email: string; password: string; confirmPassword: string; whatsapp?: string },
): Promise<ActionResult> {
  const parsed = crearAdminSchema.safeParse(input);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Datos inválidos";
    return { ok: false, error: msg };
  }

  const { user: currentUser } = await requireSuperAdmin();
  const supabase = createServiceRoleClient();

  const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
  });

  if (createError || !user) {
    if (createError?.message?.toLowerCase().includes("already")) {
      return { ok: false, error: "Ya existe un usuario con ese correo" };
    }
    return { ok: false, error: createError?.message ?? "No se pudo crear el administrador" };
  }

  const whatsapp = parsed.data.whatsapp?.trim() || null;

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    rol: "super_admin",
    id_empresa: null,
    whatsapp,
  });

  if (profileError) {
    await supabase.auth.admin.deleteUser(user.id);
    return { ok: false, error: "No se pudo asignar el rol de administrador" };
  }

  await logAudit({
    userEmail: currentUser.email ?? "",
    userId: currentUser.id,
    accion: "crear_admin",
    entidad: "admin",
    entidadId: user.id,
    detalle: { email: parsed.data.email },
  });

  revalidatePath("/admin/administradores");
  return { ok: true };
}

export async function eliminarAdmin(adminId: string): Promise<ActionResult> {
  const { user: currentUser } = await requireSuperAdmin();

  if (adminId === currentUser.id) {
    return { ok: false, error: "No puedes eliminarte a ti mismo" };
  }

  const supabase = createServiceRoleClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id", adminId)
    .single();

  if (!profile || profile.rol !== "super_admin") {
    return { ok: false, error: "Administrador no encontrado" };
  }

  const { error } = await supabase.auth.admin.deleteUser(adminId);
  if (error) return { ok: false, error: "No se pudo eliminar el administrador" };

  await logAudit({
    userEmail: currentUser.email ?? "",
    userId: currentUser.id,
    accion: "eliminar_admin",
    entidad: "admin",
    entidadId: adminId,
    detalle: {},
  });

  revalidatePath("/admin/administradores");
  return { ok: true };
}
