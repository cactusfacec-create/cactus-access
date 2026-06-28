"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireCliente, requireLicenciaActiva } from "@/lib/auth/guards";
import { n8nNotificarPagoEmpleado } from "@/lib/n8n";
import type { ActionResult } from "@/lib/types/domain";

const registrarPagoSchema = z.object({
  idEmpleado: z.string().uuid(),
  periodoDesde: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  periodoHasta: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  diasTrabajados: z.coerce.number().int().min(0),
  salarioDiario: z.coerce.number().min(0),
  tipoSalario: z.enum(["diario", "mensual"]).default("diario"),
  salarioBase: z.coerce.number().min(0).default(0),
  pagoHorasExtra: z.coerce.number().min(0).default(0),
  deduccionAtrasos: z.coerce.number().min(0).default(0),
  deduccionFaltas: z.coerce.number().min(0).default(0),
  faltasNoJustificadas: z.coerce.number().int().min(0).default(0),
  minutosExtraTotal: z.coerce.number().int().min(0).default(0),
  minutosAtrasoTotal: z.coerce.number().int().min(0).default(0),
  montoTotal: z.coerce.number().min(0),
  notas: z.string().optional(),
});

export type RegistrarPagoInput = z.infer<typeof registrarPagoSchema>;

export async function registrarPago(input: RegistrarPagoInput): Promise<ActionResult> {
  const parsed = registrarPagoSchema.safeParse(input);
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

  const { error } = await supabase.from("pagos_empleado").insert({
    id_empresa: profile.id_empresa,
    id_empleado: parsed.data.idEmpleado,
    periodo_desde: parsed.data.periodoDesde,
    periodo_hasta: parsed.data.periodoHasta,
    dias_trabajados: parsed.data.diasTrabajados,
    salario_diario: parsed.data.salarioDiario,
    tipo_salario: parsed.data.tipoSalario,
    salario_base: parsed.data.salarioBase,
    pago_horas_extra: parsed.data.pagoHorasExtra,
    deduccion_atrasos_val: parsed.data.deduccionAtrasos,
    deduccion_faltas_val: parsed.data.deduccionFaltas,
    faltas_no_justificadas: parsed.data.faltasNoJustificadas,
    minutos_extra_total: parsed.data.minutosExtraTotal,
    minutos_atraso_total: parsed.data.minutosAtrasoTotal,
    monto_total: parsed.data.montoTotal,
    notas: parsed.data.notas?.trim() || null,
  });
  if (error) return { ok: false, error: "No se pudo registrar el pago" };

  // Fire-and-forget WhatsApp notification to employee
  if (empleado.telefono) {
    n8nNotificarPagoEmpleado({
      phone: empleado.telefono,
      empleadoNombre: empleado.nombre,
      monto: parsed.data.montoTotal,
      periodoDesde: parsed.data.periodoDesde,
      periodoHasta: parsed.data.periodoHasta,
      tipo: "pago_nomina",
    });
  }

  revalidatePath(`/asistencias/${parsed.data.idEmpleado}`);
  return { ok: true };
}

export async function eliminarPago(id: string): Promise<ActionResult> {
  const { profile } = await requireCliente();
  await requireLicenciaActiva(profile.id_empresa);

  const supabase = await createClient();
  const { error } = await supabase
    .from("pagos_empleado")
    .delete()
    .eq("id", id)
    .eq("id_empresa", profile.id_empresa);
  if (error) return { ok: false, error: "No se pudo eliminar el pago" };

  revalidatePath("/asistencias");
  return { ok: true };
}
