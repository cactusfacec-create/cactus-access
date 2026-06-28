import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, getSession } from "@/lib/auth/session";
import type { Profile } from "@/lib/types/database.types";

export async function requireSession() {
  const user = await getSession();
  if (!user) redirect("/login");
  return user;
}

export async function requireCliente() {
  const user = await requireSession();
  const profile = await getProfile(user.id);
  if (!profile || profile.rol !== "cliente") redirect("/admin");
  return { user, profile: profile as Profile & { id_empresa: string } };
}

export async function requireSuperAdmin() {
  const user = await requireSession();
  const profile = await getProfile(user.id);
  if (!profile || profile.rol !== "super_admin") redirect("/dashboard");
  return { user, profile };
}

export async function requireLicenciaActiva(idEmpresa: string) {
  const supabase = await createClient();
  const { data: licencia } = await supabase
    .from("licencias")
    .select("*")
    .eq("id_empresa", idEmpresa)
    .single();

  if (!licencia || !licencia.activa) redirect("/cuenta-suspendida");
  return licencia;
}
