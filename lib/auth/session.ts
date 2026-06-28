import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types/database.types";

export async function getSession() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return data ?? null;
}

export async function getDashboardPathForUser(): Promise<
  "/dashboard" | "/admin" | "/login"
> {
  const user = await getSession();
  if (!user) return "/login";

  const profile = await getProfile(user.id);
  if (!profile) return "/login";

  return profile.rol === "super_admin" ? "/admin" : "/dashboard";
}
