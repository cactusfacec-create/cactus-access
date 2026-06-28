"use server";

import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/auth/guards";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { empresaSchema, type EmpresaInput } from "@/lib/validations/empresa.schema";
import {
  crearEmpresaSchema,
  type CrearEmpresaInput,
} from "@/lib/validations/crear-empresa.schema";
import { logAudit } from "@/actions/admin/logs.actions";
import type { ActionResult, EmpresaConLicencia } from "@/lib/types/domain";

export async function listEmpresasConLicencias(): Promise<EmpresaConLicencia[]> {
  await requireSuperAdmin();

  const supabase = createServiceRoleClient();
  const [{ data: empresas }, { data: licencias }, { data: sucursales }, { data: empleados }] =
    await Promise.all([
      supabase.from("empresas").select("*").order("nombre_empresa"),
      supabase.from("licencias").select("*"),
      supabase.from("sucursales").select("id_empresa"),
      supabase.from("empleados").select("id_empresa"),
    ]);

  const licenciaByEmpresa = new Map((licencias ?? []).map((l) => [l.id_empresa, l]));

  const countBy = (rows: { id_empresa: string }[] | null) => {
    const map = new Map<string, number>();
    for (const row of rows ?? []) {
      map.set(row.id_empresa, (map.get(row.id_empresa) ?? 0) + 1);
    }
    return map;
  };
  const sucursalesCount = countBy(sucursales);
  const empleadosCount = countBy(empleados);

  return (empresas ?? []).map((empresa) => ({
    ...empresa,
    licencia: licenciaByEmpresa.get(empresa.id) ?? null,
    totalSucursales: sucursalesCount.get(empresa.id) ?? 0,
    totalEmpleados: empleadosCount.get(empresa.id) ?? 0,
  }));
}

export async function updateEmpresaAdmin(
  idEmpresa: string,
  input: EmpresaInput,
): Promise<ActionResult> {
  const parsed = empresaSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos" };

  const { user } = await requireSuperAdmin();

  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("empresas")
    .update({
      nombre_empresa: parsed.data.nombreEmpresa,
      direccion: parsed.data.direccion || null,
      telefono: parsed.data.telefono || null,
      email: parsed.data.email || null,
      ruc: parsed.data.ruc || null,
      telefono_notificacion_tardanza: parsed.data.telefonoNotificacionTardanza || null,
    })
    .eq("id", idEmpresa);
  if (error) return { ok: false, error: "No se pudo actualizar la empresa" };

  await logAudit({
    userEmail: user.email ?? "",
    userId: user.id,
    accion: "editar_empresa",
    entidad: "empresa",
    entidadId: idEmpresa,
    empresaNombre: parsed.data.nombreEmpresa,
    detalle: { campos: Object.keys(parsed.data) },
  });

  revalidatePath("/admin");
  return { ok: true };
}

export async function crearEmpresa(input: CrearEmpresaInput): Promise<ActionResult> {
  const parsed = crearEmpresaSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos" };

  const { user } = await requireSuperAdmin();

  const supabase = createServiceRoleClient();

  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
  });
  if (userError || !userData.user) {
    return { ok: false, error: userError?.message ?? "No se pudo crear el usuario" };
  }

  const { error: rpcError } = await supabase.rpc("handle_new_company_signup", {
    p_user_id: userData.user.id,
    p_nombre_empresa: parsed.data.nombreEmpresa,
  });
  if (rpcError) {
    return { ok: false, error: "No se pudo crear la empresa. Contacta a soporte." };
  }

  // Obtener id_empresa del profile recién creado por el RPC
  const { data: profileData } = await supabase
    .from("profiles")
    .select("id_empresa")
    .eq("id", userData.user.id)
    .single();

  if (profileData?.id_empresa) {
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 15);
    const trialFields = {
      plan_tipo: "prueba" as const,
      activa: true,
      fecha_vencimiento: trialEnd.toISOString().slice(0, 10),
      limite_sucursales: 1,
      limite_empleados: 5,
      precio: 0,
    };

    // Verificar si el RPC ya creó la fila de licencia
    const { data: licenciaExistente } = await supabase
      .from("licencias")
      .select("id_empresa")
      .eq("id_empresa", profileData.id_empresa)
      .maybeSingle();

    if (licenciaExistente) {
      // Ya existe → solo actualizar los campos de trial
      await supabase
        .from("licencias")
        .update(trialFields)
        .eq("id_empresa", profileData.id_empresa);
    } else {
      // No existe → insertar con todos los campos requeridos
      await supabase.from("licencias").insert({
        id_empresa: profileData.id_empresa,
        tipo_corte: "mensual",
        periodo_facturacion: "trimestral",
        ...trialFields,
      });
    }
  }

  await logAudit({
    userEmail: user.email ?? "",
    userId: user.id,
    accion: "crear_empresa",
    entidad: "empresa",
    empresaNombre: parsed.data.nombreEmpresa,
    detalle: { email: parsed.data.email },
  });

  revalidatePath("/admin");
  return { ok: true };
}

export async function deleteEmpresa(idEmpresa: string): Promise<ActionResult> {
  const { user } = await requireSuperAdmin();

  const supabase = createServiceRoleClient();

  const { data: empresaData } = await supabase
    .from("empresas")
    .select("nombre_empresa")
    .eq("id", idEmpresa)
    .single();

  // profiles.id_empresa no tiene ON DELETE CASCADE (a propósito, para no perder
  // el historial de auth.users); hay que limpiarlos antes de borrar la empresa.
  await supabase.from("profiles").delete().eq("id_empresa", idEmpresa);

  const { error } = await supabase.from("empresas").delete().eq("id", idEmpresa);
  if (error) return { ok: false, error: "No se pudo eliminar la empresa" };

  await logAudit({
    userEmail: user.email ?? "",
    userId: user.id,
    accion: "eliminar_empresa",
    entidad: "empresa",
    entidadId: idEmpresa,
    empresaNombre: empresaData?.nombre_empresa,
  });

  revalidatePath("/admin");
  return { ok: true };
}
