"use server";

import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/auth/guards";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { createDLocalGoPayment } from "@/lib/payments/dlocalgo";
import { getPaymentConfig, isDLocalGoReady } from "@/lib/payments/config";
import { logAudit } from "@/actions/admin/logs.actions";
import type { ActionResult } from "@/lib/types/domain";

export interface CrearEnlacePagoInput {
  idEmpresa: string;
  monto: number;
  planTipo: string;
  periodoFacturacion: string;
  fechaHasta: string;
  limiteSucursales?: number;
  limiteEmpleados?: number;
}

export interface EnlacePagoResult {
  checkoutUrl: string;
  clientTransactionId: string;
  intentId: string;
}

export async function crearEnlacePago(
  input: CrearEnlacePagoInput,
): Promise<ActionResult<EnlacePagoResult>> {
  const { user } = await requireSuperAdmin();
  const supabase = createServiceRoleClient();

  let limiteSucursales = input.limiteSucursales ?? 1;
  let limiteEmpleados = input.limiteEmpleados ?? 5;

  if (input.planTipo !== "personalizado" && input.planTipo !== "prueba") {
    const { data: plan } = await supabase
      .from("planes")
      .select("*")
      .eq("id", input.planTipo)
      .single();
    if (plan) {
      limiteSucursales = plan.limite_sucursales;
      limiteEmpleados = plan.limite_empleados;
    }
  }

  const { data: empresa } = await supabase
    .from("empresas")
    .select("nombre_empresa, email")
    .eq("id", input.idEmpresa)
    .single();

  if (!empresa) return { ok: false, error: "Empresa no encontrada" };

  const cfg = await getPaymentConfig();

  if (!isDLocalGoReady(cfg)) {
    return { ok: false, error: "dLocal Go no está configurado. Ingresa las credenciales en Configuración." };
  }

  const clientTransactionId = `cactus-${input.idEmpresa.slice(0, 8)}-${Date.now()}`;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const webhookBase = process.env.NEXT_PUBLIC_WEBHOOK_URL ?? baseUrl;

  const planLabel = { pro: "Plan Pro", max: "Plan Max", personalizado: "Plan Personalizado" }[input.planTipo] ?? input.planTipo;
  const periodoLabel = { trimestral: "trimestral (3 meses)", semestral: "semestral (6 meses)", anual: "anual (12 meses)" }[input.periodoFacturacion] ?? input.periodoFacturacion;

  let checkoutUrl: string;
  let payloadInicio: Record<string, unknown>;

  try {
    const result = await createDLocalGoPayment(
      {
        amount: input.monto,
        order_id: clientTransactionId,
        description: `Cactus Access — ${planLabel} ${periodoLabel}`,
        success_url: `${baseUrl}/dashboard?pago=ok`,
        back_url: `${baseUrl}/planes?pago=cancelado`,
        notification_url: `${webhookBase}/api/webhooks/dlocalgo`,
      },
      {
        apiKey: cfg.dlocalgo.apiKey!,
        secretKey: cfg.dlocalgo.secretKey!,
        env: cfg.dlocalgo.env,
      },
    );

    checkoutUrl = result.redirect_url;
    payloadInicio = { request: { amount: input.monto, order_id: clientTransactionId }, response: result };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    console.error("[payment-gateway] error dlocalgo:", msg);
    return { ok: false, error: `No se pudo crear el enlace: ${msg}` };
  }

  const { data: intent, error: intentError } = await supabase
    .from("payment_intents")
    .insert({
      id_empresa: input.idEmpresa,
      proveedor: "dlocalgo",
      estado: "pendiente",
      monto: input.monto,
      moneda: "USD",
      plan_tipo: input.planTipo,
      periodo_facturacion: input.periodoFacturacion,
      fecha_hasta: input.fechaHasta,
      limite_sucursales: limiteSucursales,
      limite_empleados: limiteEmpleados,
      client_transaction_id: clientTransactionId,
      checkout_url: checkoutUrl,
      payload_inicio: payloadInicio,
    })
    .select("id")
    .single();

  if (intentError || !intent) {
    return { ok: false, error: "No se pudo guardar el intent de pago" };
  }

  await logAudit({
    userEmail: user.email ?? "",
    userId: user.id,
    accion: "crear_enlace_pago",
    entidad: "payment_intent",
    entidadId: intent.id,
    empresaNombre: empresa.nombre_empresa,
    detalle: {
      proveedor: "dlocalgo",
      monto: input.monto,
      plan: input.planTipo,
      periodo: input.periodoFacturacion,
    },
  });

  revalidatePath("/admin/pagos");

  return { ok: true, data: { checkoutUrl, clientTransactionId, intentId: intent.id } };
}

export async function getPasarelasDisponibles(): Promise<{ dlocalgo: boolean }> {
  const cfg = await getPaymentConfig();
  return { dlocalgo: isDLocalGoReady(cfg) };
}
