"use server";

import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/auth/guards";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import type { PedidoTienda, PedidoTiendaItem, ProductoTienda } from "@/lib/types/database.types";
import type { ActionResult } from "@/lib/types/domain";

export type EstadoPedidoTienda = PedidoTienda["estado"];

export type PedidoConDetalles = PedidoTienda & {
  empresa_nombre: string;
  items: PedidoTiendaItem[];
};

export async function getAllPedidos(): Promise<PedidoConDetalles[]> {
  await requireSuperAdmin();
  const admin = createServiceRoleClient();

  const { data: pedidos } = await admin
    .from("pedidos_tienda")
    .select("*")
    .order("created_at", { ascending: false });

  if (!pedidos?.length) return [];

  const empresaIds = [...new Set(pedidos.map((p) => p.id_empresa))];
  const pedidoIds = pedidos.map((p) => p.id);

  const [{ data: empresas }, { data: items }] = await Promise.all([
    admin.from("empresas").select("id, nombre_empresa").in("id", empresaIds),
    admin.from("pedidos_tienda_items").select("*").in("id_pedido", pedidoIds),
  ]);

  const empresaMap = Object.fromEntries((empresas ?? []).map((e) => [e.id, e.nombre_empresa]));

  return pedidos.map((p) => ({
    ...p,
    empresa_nombre: empresaMap[p.id_empresa] ?? "—",
    items: items?.filter((i) => i.id_pedido === p.id) ?? [],
  }));
}

// ── Catálogo de productos ─────────────────────────────────────────────────────

export async function getAllProductos(): Promise<ProductoTienda[]> {
  await requireSuperAdmin();
  const admin = createServiceRoleClient();
  const { data } = await admin
    .from("productos_tienda")
    .select("*")
    .order("orden_display", { ascending: true });
  return data ?? [];
}

export interface ProductoInput {
  nombre: string;
  descripcion: string;
  precio: number;
  capacidad_facial?: number | null;
  capacidad_huella?: number | null;
  capacidad_tarjeta?: number | null;
  conectividad: string;
  pantalla: string;
  garantia: string;
  temperatura: boolean;
  activo: boolean;
  orden_display: number;
  imagen_url?: string | null;
}

export async function uploadImagenProducto(
  formData: FormData,
): Promise<ActionResult<{ url: string }>> {
  await requireSuperAdmin();

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { ok: false, error: "No se recibió ninguna imagen" };
  if (!file.type.startsWith("image/")) return { ok: false, error: "Solo se permiten imágenes" };
  if (file.size > 5 * 1024 * 1024) return { ok: false, error: "La imagen no puede superar 5 MB" };

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const filename = `productos/${crypto.randomUUID()}.${ext}`;

  const admin = createServiceRoleClient();
  const bytes = await file.arrayBuffer();

  const { error } = await admin.storage
    .from("tienda-imagenes")
    .upload(filename, bytes, { contentType: file.type, upsert: false });

  if (error) return { ok: false, error: "No se pudo subir la imagen" };

  const { data } = admin.storage.from("tienda-imagenes").getPublicUrl(filename);
  return { ok: true, data: { url: data.publicUrl } };
}

function buildSpecs(input: ProductoInput): Record<string, unknown> {
  const specs: Record<string, unknown> = {};
  if (input.capacidad_facial) specs.capacidad_facial = input.capacidad_facial;
  if (input.capacidad_huella) specs.capacidad_huella = input.capacidad_huella;
  if (input.capacidad_tarjeta) specs.capacidad_tarjeta = input.capacidad_tarjeta;
  if (input.conectividad.trim()) {
    specs.conectividad = input.conectividad.split(",").map((s) => s.trim()).filter(Boolean);
  }
  if (input.pantalla.trim()) specs.pantalla = input.pantalla.trim();
  if (input.garantia.trim()) specs.garantia = input.garantia.trim();
  if (input.temperatura) specs.temperatura = true;
  return specs;
}

export async function createProducto(input: ProductoInput): Promise<ActionResult> {
  await requireSuperAdmin();
  if (!input.nombre.trim()) return { ok: false, error: "El nombre es obligatorio" };
  if (input.precio <= 0) return { ok: false, error: "El precio debe ser mayor a 0" };

  const admin = createServiceRoleClient();
  const { error } = await admin.from("productos_tienda").insert({
    nombre: input.nombre.trim(),
    descripcion: input.descripcion.trim() || null,
    precio: input.precio,
    specs: buildSpecs(input),
    imagen_url: input.imagen_url ?? null,
    activo: input.activo,
    orden_display: input.orden_display,
  });

  if (error) return { ok: false, error: "No se pudo crear el producto" };
  revalidatePath("/admin/tienda");
  revalidatePath("/tienda");
  return { ok: true };
}

export async function updateProducto(
  id: string,
  input: ProductoInput,
): Promise<ActionResult> {
  await requireSuperAdmin();
  if (!input.nombre.trim()) return { ok: false, error: "El nombre es obligatorio" };
  if (input.precio <= 0) return { ok: false, error: "El precio debe ser mayor a 0" };

  const admin = createServiceRoleClient();
  const { error } = await admin
    .from("productos_tienda")
    .update({
      nombre: input.nombre.trim(),
      descripcion: input.descripcion.trim() || null,
      precio: input.precio,
      specs: buildSpecs(input),
      imagen_url: input.imagen_url ?? null,
      activo: input.activo,
      orden_display: input.orden_display,
    })
    .eq("id", id);

  if (error) return { ok: false, error: "No se pudo actualizar el producto" };
  revalidatePath("/admin/tienda");
  revalidatePath("/tienda");
  return { ok: true };
}

export async function toggleProductoActivo(id: string, activo: boolean): Promise<ActionResult> {
  await requireSuperAdmin();
  const admin = createServiceRoleClient();
  const { error } = await admin
    .from("productos_tienda")
    .update({ activo })
    .eq("id", id);

  if (error) return { ok: false, error: "No se pudo cambiar el estado del producto" };
  revalidatePath("/admin/tienda");
  revalidatePath("/tienda");
  return { ok: true };
}

export async function deleteProducto(id: string): Promise<ActionResult> {
  await requireSuperAdmin();
  const admin = createServiceRoleClient();
  const { error } = await admin.from("productos_tienda").delete().eq("id", id);
  if (error) return { ok: false, error: "No se pudo eliminar el producto" };
  revalidatePath("/admin/tienda");
  revalidatePath("/tienda");
  return { ok: true };
}

// ── Pedidos ───────────────────────────────────────────────────────────────────

export async function updateEstadoPedido(
  idPedido: string,
  estado: EstadoPedidoTienda,
): Promise<ActionResult> {
  await requireSuperAdmin();
  const admin = createServiceRoleClient();

  const { error } = await admin
    .from("pedidos_tienda")
    .update({ estado, updated_at: new Date().toISOString() })
    .eq("id", idPedido);

  if (error) return { ok: false, error: "No se pudo actualizar el estado del pedido" };
  return { ok: true };
}
