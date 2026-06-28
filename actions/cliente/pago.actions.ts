"use server";

import { requireCliente } from "@/lib/auth/guards";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { createDLocalGoPayment } from "@/lib/payments/dlocalgo";
import { getPaymentConfig, isDLocalGoReady } from "@/lib/payments/config";
import type { ActionResult } from "@/lib/types/domain";

export interface IniciarPagoInput {
  planTipo: string;
  periodoFacturacion: string;
  monto: number;
  /** Fecha hasta en formato YYYY-MM-DD */
  fechaHasta: string;
  limiteSucursales?: number;
  limiteEmpleados?: number;
}

export async function iniciarPago(
  input: IniciarPagoInput,
): Promise<ActionResult<{ checkoutUrl: string }>> {
  const { profile } = await requireCliente();
  const idEmpresa = profile.id_empresa;

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

  const cfg = await getPaymentConfig();

  if (!isDLocalGoReady(cfg)) {
    return { ok: false, error: "Pasarela de pago no disponible en este momento" };
  }

  const clientTransactionId = `cactus-${idEmpresa.slice(0, 8)}-${Date.now()}`;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const webhookBase = process.env.NEXT_PUBLIC_WEBHOOK_URL ?? baseUrl;

  const planLabel: Record<string, string> = {
    pro: "Plan Pro",
    max: "Plan Max",
    personalizado: "Plan Personalizado",
  };
  const periodoLabel: Record<string, string> = {
    trimestral: "trimestral (3 meses)",
    semestral: "semestral (6 meses)",
    anual: "anual (12 meses)",
  };
  const descripcion = `Cactus Access — ${planLabel[input.planTipo] ?? input.planTipo} ${periodoLabel[input.periodoFacturacion] ?? input.periodoFacturacion}`;

  let checkoutUrl: string;
  let payloadInicio: Record<string, unknown>;

  try {
    const result = await createDLocalGoPayment(
      {
        amount: input.monto,
        order_id: clientTransactionId,
        description: descripcion,
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
    console.error("[pago.actions] error dlocalgo:", msg);
    return { ok: false, error: "No se pudo conectar con la pasarela de pago. Intenta de nuevo." };
  }

  await supabase.from("payment_intents").insert({
    id_empresa: idEmpresa,
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
  });

  return { ok: true, data: { checkoutUrl } };
}

export async function getPasarelasCliente(): Promise<{ dlocalgo: boolean }> {
  const cfg = await getPaymentConfig();
  return { dlocalgo: isDLocalGoReady(cfg) };
}
