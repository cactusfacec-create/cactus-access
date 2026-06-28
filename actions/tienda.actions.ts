"use server";

import { requireCliente } from "@/lib/auth/guards";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { createDLocalGoPayment } from "@/lib/payments/dlocalgo";
import { getPaymentConfig, isDLocalGoReady } from "@/lib/payments/config";
import type { ActionResult } from "@/lib/types/domain";
import type { ProductoTienda, PedidoTienda, PedidoTiendaItem } from "@/lib/types/database.types";

export async function getProductosTienda(): Promise<ProductoTienda[]> {
  const admin = createServiceRoleClient();
  const { data } = await admin
    .from("productos_tienda")
    .select("*")
    .eq("activo", true)
    .order("orden_display", { ascending: true });
  return data ?? [];
}

export interface IniciarPagoProductoInput {
  idProducto: string;
  cantidad: number;
  direccionEntrega: string;
  telefonoContacto: string;
  notas?: string;
}

export async function iniciarPagoProducto(
  input: IniciarPagoProductoInput,
): Promise<ActionResult<{ checkoutUrl: string }>> {
  const { profile } = await requireCliente();
  const idEmpresa = profile.id_empresa;
  if (!idEmpresa) return { ok: false, error: "Empresa no encontrada" };

  if (!input.direccionEntrega.trim()) return { ok: false, error: "Dirección de entrega requerida" };
  if (!input.telefonoContacto.trim()) return { ok: false, error: "Teléfono de contacto requerido" };
  if (input.cantidad < 1) return { ok: false, error: "Cantidad inválida" };

  const admin = createServiceRoleClient();

  const { data: producto } = await admin
    .from("productos_tienda")
    .select("*")
    .eq("id", input.idProducto)
    .eq("activo", true)
    .single();
  if (!producto) return { ok: false, error: "Producto no disponible" };

  const cfg = await getPaymentConfig();
  if (!isDLocalGoReady(cfg)) {
    return { ok: false, error: "Pasarela de pago no disponible en este momento" };
  }

  const montoTotal = Number(producto.precio) * input.cantidad;

  const { data: pedido, error: pedidoError } = await admin
    .from("pedidos_tienda")
    .insert({
      id_empresa: idEmpresa,
      estado: "pendiente_pago",
      monto_total: montoTotal,
      direccion_entrega: input.direccionEntrega.trim(),
      telefono_contacto: input.telefonoContacto.trim(),
      notas: input.notas?.trim() || null,
    })
    .select()
    .single();

  if (pedidoError || !pedido) {
    return { ok: false, error: "No se pudo crear el pedido" };
  }

  await admin.from("pedidos_tienda_items").insert({
    id_pedido: pedido.id,
    id_producto: input.idProducto,
    nombre_producto: producto.nombre,
    cantidad: input.cantidad,
    precio_unitario: producto.precio,
  });

  const clientTransactionId = `tienda-${idEmpresa.slice(0, 8)}-${Date.now()}`;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const webhookBase = process.env.NEXT_PUBLIC_WEBHOOK_URL ?? baseUrl;

  try {
    const result = await createDLocalGoPayment(
      {
        amount: montoTotal,
        order_id: clientTransactionId,
        description: `Cactus Tienda — ${producto.nombre} ×${input.cantidad}`,
        success_url: `${baseUrl}/tienda?pago=ok`,
        back_url: `${baseUrl}/tienda?pago=cancelado`,
        notification_url: `${webhookBase}/api/webhooks/dlocalgo`,
      },
      {
        apiKey: cfg.dlocalgo.apiKey!,
        secretKey: cfg.dlocalgo.secretKey!,
        env: cfg.dlocalgo.env,
      },
    );

    await admin.from("payment_intents").insert({
      id_empresa: idEmpresa,
      proveedor: "dlocalgo",
      estado: "pendiente",
      monto: montoTotal,
      moneda: "USD",
      plan_tipo: "producto",
      periodo_facturacion: "unico",
      fecha_hasta: new Date().toISOString().slice(0, 10),
      limite_sucursales: 0,
      limite_empleados: 0,
      client_transaction_id: clientTransactionId,
      checkout_url: result.redirect_url,
      tipo: "producto",
      id_pedido_tienda: pedido.id,
      payload_inicio: {
        request: { amount: montoTotal, order_id: clientTransactionId },
        response: result,
      },
    });

    return { ok: true, data: { checkoutUrl: result.redirect_url } };
  } catch (err) {
    await admin.from("pedidos_tienda").delete().eq("id", pedido.id);
    const msg = err instanceof Error ? err.message : "Error desconocido";
    console.error("[tienda.actions] error dlocalgo:", msg);
    return {
      ok: false,
      error: "No se pudo conectar con la pasarela de pago. Intenta de nuevo.",
    };
  }
}

export interface PedidoConItems extends PedidoTienda {
  items: PedidoTiendaItem[];
}

export async function getMisPedidos(): Promise<PedidoConItems[]> {
  const { profile } = await requireCliente();
  const idEmpresa = profile.id_empresa;
  if (!idEmpresa) return [];

  const admin = createServiceRoleClient();
  const { data: pedidos } = await admin
    .from("pedidos_tienda")
    .select("*")
    .eq("id_empresa", idEmpresa)
    .order("created_at", { ascending: false });

  if (!pedidos?.length) return [];

  const pedidoIds = pedidos.map((p) => p.id);
  const { data: items } = await admin
    .from("pedidos_tienda_items")
    .select("*")
    .in("id_pedido", pedidoIds);

  return pedidos.map((p) => ({
    ...p,
    items: items?.filter((i) => i.id_pedido === p.id) ?? [],
  }));
}
