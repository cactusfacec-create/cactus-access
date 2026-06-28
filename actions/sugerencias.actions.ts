"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireCliente } from "@/lib/auth/guards";
import type { ActionResult } from "@/lib/types/domain";

const schema = z.object({
  mensaje: z.string().min(10, "Mínimo 10 caracteres").max(1000),
});

export async function submitSugerencia(input: { mensaje: string }): Promise<ActionResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const { profile } = await requireCliente();
  const supabase = await createClient();

  const { error } = await supabase.from("sugerencias").insert({
    id_empresa: profile.id_empresa,
    mensaje: parsed.data.mensaje,
  });

  if (error) return { ok: false, error: "No se pudo enviar la sugerencia" };
  return { ok: true };
}
