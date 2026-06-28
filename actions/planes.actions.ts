"use server";

import { createServiceRoleClient } from "@/lib/supabase/service-role";
import type { Plan } from "@/lib/types/database.types";

export async function getPlanesPublicos(): Promise<Plan[]> {
  const supabase = createServiceRoleClient();
  const { data } = await supabase.from("planes").select("*").order("id");
  return (data as Plan[]) ?? [];
}
