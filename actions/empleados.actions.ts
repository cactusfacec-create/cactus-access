"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireCliente, requireLicenciaActiva } from "@/lib/auth/guards";
import { checkLimiteDisponible } from "@/lib/auth/license-limits";
import { empleadoSchema, type EmpleadoInput } from "@/lib/validations/empleado.schema";
import { jornadasToRow } from "@/lib/validations/jornadas.schema";
import type { ActionResult } from "@/lib/types/domain";

export async function createEmpleado(input: EmpleadoInput): Promise<ActionResult> {
  const parsed = empleadoSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos" };

  const { profile } = await requireCliente();
  await requireLicenciaActiva(profile.id_empresa);

  const usage = await checkLimiteDisponible({
    idEmpresa: profile.id_empresa,
    recurso: "empleados",
  });
  if (usage.actual >= usage.limite) {
    return { ok: false, error: "Alcanzaste el límite de empleados de tu licencia" };
  }

  const supabase = await createClient();

  const { data: existente } = await supabase
    .from("empleados")
    .select("id")
    .eq("id_empresa", profile.id_empresa)
    .eq("cedula", parsed.data.cedula)
    .maybeSingle();
  if (existente) {
    return { ok: false, error: "Ya existe un empleado con esa cédula" };
  }

  const { data: empleado, error } = await supabase
    .from("empleados")
    .insert({
      id_empresa: profile.id_empresa,
      nombre: parsed.data.nombre,
      cedula: parsed.data.cedula,
      telefono: parsed.data.telefono || null,
      id_sucursal: parsed.data.sucursalId || null,
      salario_diario: parsed.data.salarioDiario,
      tipo_salario: parsed.data.tipoSalario,
      horas_jornada: parsed.data.horasJornada,
      multiplicador_hora_extra: parsed.data.valorHoraExtra,
      descuenta_atrasos: parsed.data.descuentaAtrasos,
      ...(parsed.data.fechaIngreso ? { fecha_ingreso: parsed.data.fechaIngreso } : {}),
    })
    .select("id")
    .single();
  if (error || !empleado) return { ok: false, error: "No se pudo crear el empleado" };

  const { error: horarioError } = await supabase.from("horarios_empleados").insert({
    id_empleado: empleado.id,
    usa_horario_global: parsed.data.usaHorarioGlobal,
    ...jornadasToRow(parsed.data),
  });
  if (horarioError) return { ok: false, error: "No se pudo guardar el horario del empleado" };

  revalidatePath("/empleados");
  revalidatePath("/registros-no-reconocidos");
  return { ok: true };
}

export async function updateEmpleado(id: string, input: EmpleadoInput): Promise<ActionResult> {
  const parsed = empleadoSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos" };

  const { profile } = await requireCliente();
  await requireLicenciaActiva(profile.id_empresa);

  const supabase = await createClient();

  const { data: existente } = await supabase
    .from("empleados")
    .select("id")
    .eq("id_empresa", profile.id_empresa)
    .eq("cedula", parsed.data.cedula)
    .neq("id", id)
    .maybeSingle();
  if (existente) {
    return { ok: false, error: "Ya existe otro empleado con esa cédula" };
  }

  const { error } = await supabase
    .from("empleados")
    .update({
      nombre: parsed.data.nombre,
      cedula: parsed.data.cedula,
      telefono: parsed.data.telefono || null,
      id_sucursal: parsed.data.sucursalId || null,
      salario_diario: parsed.data.salarioDiario,
      tipo_salario: parsed.data.tipoSalario,
      horas_jornada: parsed.data.horasJornada,
      multiplicador_hora_extra: parsed.data.valorHoraExtra,
      descuenta_atrasos: parsed.data.descuentaAtrasos,
      dia_corte: parsed.data.diaCorte ?? null,
      ...(parsed.data.fechaIngreso ? { fecha_ingreso: parsed.data.fechaIngreso } : {}),
    })
    .eq("id", id)
    .eq("id_empresa", profile.id_empresa);
  if (error) return { ok: false, error: "No se pudo actualizar el empleado" };

  const { error: horarioError } = await supabase
    .from("horarios_empleados")
    .upsert({
      id_empleado: id,
      usa_horario_global: parsed.data.usaHorarioGlobal,
      ...jornadasToRow(parsed.data),
    });
  if (horarioError) return { ok: false, error: "No se pudo actualizar el horario del empleado" };

  revalidatePath("/empleados");
  return { ok: true };
}

export async function deleteEmpleado(id: string): Promise<ActionResult> {
  const { profile } = await requireCliente();
  await requireLicenciaActiva(profile.id_empresa);

  const supabase = await createClient();
  const { error } = await supabase
    .from("empleados")
    .delete()
    .eq("id", id)
    .eq("id_empresa", profile.id_empresa);
  if (error) return { ok: false, error: "No se pudo eliminar el empleado" };

  revalidatePath("/empleados");
  return { ok: true };
}
