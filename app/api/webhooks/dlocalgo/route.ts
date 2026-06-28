import { type NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import {
  getDLocalGoPayment,
  verifyDLocalGoWebhookSignature,
} from "@/lib/payments/dlocalgo";
import { getPaymentConfig } from "@/lib/payments/config";

/**
 * Webhook POST de dLocal Go.
 * dLocal envía { "payment_id": "DP-xxx" } cuando cambia el estado de un pago.
 * Debemos consultar GET /v1/payments/{id} para obtener el order_id y el estado.
 *
 * POST /api/webhooks/dlocalgo
 * Header: Authorization: V2-HMAC-SHA256, Signature: <hex>
 */
export async function POST(request: NextRequest) {
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json({ error: "No se pudo leer el body" }, { status: 400 });
  }

  const cfg = await getPaymentConfig();

  // Verificar firma si el secret está configurado
  const authHeader = request.headers.get("authorization") ?? "";
  if (cfg.dlocalgo.apiKey && cfg.dlocalgo.secretKey && authHeader) {
    if (!verifyDLocalGoWebhookSignature(rawBody, authHeader, {
      apiKey: cfg.dlocalgo.apiKey,
      secretKey: cfg.dlocalgo.secretKey,
      env: cfg.dlocalgo.env,
    })) {
      console.error("[dlocalgo webhook] firma inválida");
      return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
    }
  }

  let payload: { payment_id?: string };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const paymentId = payload.payment_id;
  if (!paymentId) {
    return NextResponse.json({ error: "payment_id requerido" }, { status: 400 });
  }

  if (!cfg.dlocalgo.apiKey || !cfg.dlocalgo.secretKey) {
    console.error("[dlocalgo webhook] credenciales no configuradas");
    return NextResponse.json({ received: true });
  }

  // Obtener detalles completos del pago (incluye order_id y status)
  let payment;
  try {
    payment = await getDLocalGoPayment(paymentId, {
      apiKey: cfg.dlocalgo.apiKey,
      secretKey: cfg.dlocalgo.secretKey,
      env: cfg.dlocalgo.env,
    });
  } catch (err) {
    console.error("[dlocalgo webhook] error obteniendo pago:", err);
    return NextResponse.json({ received: true });
  }

  const supabase = createServiceRoleClient();

  // Buscar el payment intent por clientTransactionId (= order_id que enviamos)
  const { data: intent } = await supabase
    .from("payment_intents")
    .select("*")
    .eq("client_transaction_id", payment.order_id)
    .single();

  if (!intent) {
    console.error("[dlocalgo webhook] intent no encontrado:", payment.order_id);
    return NextResponse.json({ received: true });
  }

  // Ignorar duplicados
  if (intent.estado !== "pendiente") {
    return NextResponse.json({ received: true, status: intent.estado });
  }

  const aprobado = payment.status === "COMPLETED";
  const nuevoEstado = aprobado
    ? "aprobado"
    : payment.status === "CANCELLED"
    ? "cancelado"
    : "rechazado";

  await supabase
    .from("payment_intents")
    .update({
      estado: nuevoEstado,
      referencia_externa: paymentId,
      payload_respuesta: { payment_id: paymentId, payment },
      updated_at: new Date().toISOString(),
    })
    .eq("client_transaction_id", payment.order_id);

  if (!aprobado) {
    return NextResponse.json({ received: true, status: nuevoEstado });
  }

  const n8nBase = process.env.N8N_BASE_URL;

  // Pago aprobado — distinguir entre compra de plan y compra de producto
  if (intent.tipo === "producto" && intent.id_pedido_tienda) {
    await supabase
      .from("pedidos_tienda")
      .update({
        estado: "pagado",
        updated_at: new Date().toISOString(),
      })
      .eq("id", intent.id_pedido_tienda);

    if (n8nBase) {
      // Buscar pedido + items + empresa para la notificación
      const [{ data: pedido }, { data: items }, { data: empresa }] = await Promise.all([
        supabase
          .from("pedidos_tienda")
          .select("*")
          .eq("id", intent.id_pedido_tienda)
          .single(),
        supabase
          .from("pedidos_tienda_items")
          .select("*")
          .eq("id_pedido", intent.id_pedido_tienda),
        supabase
          .from("empresas")
          .select("nombre_empresa, telefono, email")
          .eq("id", intent.id_empresa)
          .single(),
      ]);

      const productosTexto = items
        ?.map((i) => `${i.nombre_producto} ×${i.cantidad} — $${Number(i.precio_unitario).toFixed(2)}`)
        .join("\n") ?? "";

      const secretHeader = process.env.N8N_WEBHOOK_SECRET_HEADER;
      const secretValue = process.env.N8N_WEBHOOK_SECRET;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (secretHeader && secretValue) headers[secretHeader] = secretValue;

      fetch(`${n8nBase}/webhook/cactus-tienda-pedido`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          accion: "pedido_pagado",
          pedidoId: intent.id_pedido_tienda,
          monto: intent.monto,
          moneda: intent.moneda ?? "USD",
          empresa: {
            id: intent.id_empresa,
            nombre: empresa?.nombre_empresa ?? "",
            telefono: empresa?.telefono ?? "",
            email: empresa?.email ?? "",
          },
          pedido: {
            direccionEntrega: pedido?.direccion_entrega ?? "",
            telefonoContacto: pedido?.telefono_contacto ?? "",
            notas: pedido?.notas ?? "",
          },
          productos: productosTexto,
          referenciaExterna: paymentId,
        }),
      }).catch(() => {});
    }
  } else {
    // Plan upgrade — comportamiento original
    await supabase.from("pagos").insert({
      id_empresa: intent.id_empresa,
      metodo_pago: "tarjeta",
      monto: intent.monto,
      moneda: intent.moneda,
      plan_tipo: intent.plan_tipo,
      periodo_facturacion: intent.periodo_facturacion,
      fecha_desde: new Date().toISOString().slice(0, 10),
      fecha_hasta: intent.fecha_hasta,
      limite_sucursales: intent.limite_sucursales,
      limite_empleados: intent.limite_empleados,
      proveedor: "dlocalgo",
      estado: "aprobado",
      referencia_externa: paymentId,
      codigo_transaccion: paymentId,
      payload_respuesta: { payment_id: paymentId, payment },
      aprobado_por: "dlocalgo_webhook",
    });

    await supabase
      .from("licencias")
      .update({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        plan_tipo: intent.plan_tipo as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        periodo_facturacion: intent.periodo_facturacion as any,
        precio: intent.monto,
        fecha_vencimiento: intent.fecha_hasta,
        activa: true,
        limite_sucursales: intent.limite_sucursales,
        limite_empleados: intent.limite_empleados,
      })
      .eq("id_empresa", intent.id_empresa);

    if (n8nBase) {
      fetch(`${n8nBase}/webhook/cactus-notificaciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accion: "pago_dlocalgo",
          empresaId: intent.id_empresa,
          monto: intent.monto,
          moneda: intent.moneda,
          planTipo: intent.plan_tipo,
          detalle: `Pago dLocal Go aprobado · ${paymentId}`,
        }),
      }).catch(() => {});
    }
  }

  return NextResponse.json({ received: true, status: "aprobado" });
}
