"use server";

import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/auth/guards";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { registrarPagoSchema, type RegistrarPagoInput } from "@/lib/validations/pago.schema";
import { logAudit } from "@/actions/admin/logs.actions";
import type { ActionResult } from "@/lib/types/domain";
import type { Pago } from "@/lib/types/database.types";

export async function registrarPago(input: RegistrarPagoInput): Promise<ActionResult> {
  const parsed = registrarPagoSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos" };

  const { user } = await requireSuperAdmin();
  const supabase = createServiceRoleClient();

  let limiteSucursales = parsed.data.limiteSucursales ?? 1;
  let limiteEmpleados = parsed.data.limiteEmpleados ?? 5;

  if (parsed.data.planTipo !== "personalizado") {
    const { data: plan } = await supabase
      .from("planes")
      .select("*")
      .eq("id", parsed.data.planTipo)
      .single();
    if (plan) {
      limiteSucursales = plan.limite_sucursales;
      limiteEmpleados = plan.limite_empleados;
    }
  }

  const { error: pagoError } = await supabase.from("pagos").insert({
    id_empresa: parsed.data.idEmpresa,
    metodo_pago: parsed.data.metodoPago,
    monto: parsed.data.monto,
    plan_tipo: parsed.data.planTipo,
    periodo_facturacion: parsed.data.periodoFacturacion,
    fecha_desde: parsed.data.fechaDesde,
    fecha_hasta: parsed.data.fechaHasta,
    limite_sucursales: limiteSucursales,
    limite_empleados: limiteEmpleados,
    codigo_transaccion: parsed.data.codigoTransaccion || null,
    comprobante_url: parsed.data.comprobanteUrl || null,
    notas: parsed.data.notas || null,
    aprobado_por: user.email ?? null,
  });

  if (pagoError) {
    console.error("[registrarPago] Supabase error:", pagoError);
    return { ok: false, error: pagoError.message };
  }

  // Actualizar licencia con el nuevo plan
  await supabase
    .from("licencias")
    .update({
      plan_tipo: parsed.data.planTipo,
      periodo_facturacion: parsed.data.periodoFacturacion,
      precio: parsed.data.monto,
      fecha_vencimiento: parsed.data.fechaHasta,
      activa: true,
      limite_sucursales: limiteSucursales,
      limite_empleados: limiteEmpleados,
    })
    .eq("id_empresa", parsed.data.idEmpresa);

  // Obtener nombre de empresa para el audit log
  const { data: empresa } = await supabase
    .from("empresas")
    .select("nombre_empresa")
    .eq("id", parsed.data.idEmpresa)
    .single();

  await logAudit({
    userEmail: user.email ?? "",
    userId: user.id,
    accion: "registrar_pago",
    entidad: "pago",
    entidadId: parsed.data.idEmpresa,
    empresaNombre: empresa?.nombre_empresa,
    detalle: {
      metodo: parsed.data.metodoPago,
      monto: parsed.data.monto,
      plan: parsed.data.planTipo,
      periodo: parsed.data.periodoFacturacion,
      hasta: parsed.data.fechaHasta,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/pagos");
  return { ok: true };
}

export async function uploadComprobante(formData: FormData): Promise<ActionResult<{ url: string }>> {
  await requireSuperAdmin();
  const supabase = createServiceRoleClient();

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { ok: false, error: "No se recibió archivo" };
  if (file.size > 5 * 1024 * 1024) return { ok: false, error: "El archivo supera 5 MB" };

  const ext = file.name.split(".").pop() ?? "bin";
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from("comprobantes")
    .upload(fileName, buffer, { contentType: file.type });

  if (error) return { ok: false, error: "No se pudo subir el archivo" };

  const { data } = supabase.storage.from("comprobantes").getPublicUrl(fileName);
  return { ok: true, data: { url: data.publicUrl } };
}

export async function getAllPagos(): Promise<(Pago & { empresa_nombre: string })[]> {
  const supabase = createServiceRoleClient();
  const { data: pagos } = await supabase
    .from("pagos")
    .select("*")
    .order("created_at", { ascending: false });

  if (!pagos?.length) return [];

  const { data: empresas } = await supabase
    .from("empresas")
    .select("id, nombre_empresa");

  const empresaMap = new Map((empresas ?? []).map((e) => [e.id, e.nombre_empresa]));

  return (pagos as Pago[]).map((p) => ({
    ...p,
    empresa_nombre: empresaMap.get(p.id_empresa) ?? "—",
  }));
}

export async function getPagosPorEmpresa(idEmpresa: string): Promise<Pago[]> {
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("pagos")
    .select("*")
    .eq("id_empresa", idEmpresa)
    .order("created_at", { ascending: false });
  return (data as Pago[]) ?? [];
}
