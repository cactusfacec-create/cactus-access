"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireCliente, requireLicenciaActiva } from "@/lib/auth/guards";
import { n8nNotificarPagoEmpleado } from "@/lib/n8n";
import type { ActionResult } from "@/lib/types/domain";

const adelantoSchema = z.object({
  idEmpleado: z.string().uuid(),
  monto: z.coerce.number().min(0.01),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  descripcion: z.string().optional(),
});

export type RegistrarAdelantoInput = z.infer<typeof adelantoSchema>;

export async function registrarAdelanto(input: RegistrarAdelantoInput): Promise<ActionResult> {
  const parsed = adelantoSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos" };

  const { profile } = await requireCliente();
  await requireLicenciaActiva(profile.id_empresa);

  const supabase = await createClient();

  const { data: empleado } = await supabase
    .from("empleados")
    .select("id, nombre, telefono")
    .eq("id", parsed.data.idEmpleado)
    .eq("id_empresa", profile.id_empresa)
    .maybeSingle();
  if (!empleado) return { ok: false, error: "Empleado no encontrado" };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("adelantos_empleado").insert({
    id_empresa: profile.id_empresa,
    id_empleado: parsed.data.idEmpleado,
    monto: parsed.data.monto,
    fecha: parsed.data.fecha,
    descripcion: parsed.data.descripcion?.trim() || null,
  });
  if (error) return { ok: false, error: "No se pudo registrar el adelanto" };

  // Fire-and-forget WhatsApp notification to employee
  if (empleado.telefono) {
    n8nNotificarPagoEmpleado({
      phone: empleado.telefono,
      empleadoNombre: empleado.nombre,
      monto: parsed.data.monto,
      periodoDesde: parsed.data.fecha,
      periodoHasta: parsed.data.fecha,
      tipo: "adelanto",
      descripcion: parsed.data.descripcion,
    });
  }

  revalidatePath(`/asistencias/${parsed.data.idEmpleado}`);
  return { ok: true };
}

export async function eliminarAdelanto(id: string): Promise<ActionResult> {
  const { profile } = await requireCliente();
  await requireLicenciaActiva(profile.id_empresa);

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("adelantos_empleado")
    .delete()
    .eq("id", id)
    .eq("id_empresa", profile.id_empresa);
  if (error) return { ok: false, error: "No se pudo eliminar el adelanto" };

  revalidatePath("/asistencias");
  return { ok: true };
}
