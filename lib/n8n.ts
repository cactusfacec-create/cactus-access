import "server-only";

const COUNTRY_CODES = ["593", "507", "503", "51"];

function normalizePhone(telefono: string): string {
  const digits = telefono.replace(/\D/g, "");
  // Ecuador local format: 10 digits starting with 0 → replace with 593
  if (/^0\d{9}$/.test(digits)) return "593" + digits.slice(1);
  // Already has a known country code prefix
  if (COUNTRY_CODES.some((c) => digits.startsWith(c))) return digits;
  // Fallback: assume Ecuador
  return "593" + digits;
}

export { normalizePhone };

async function post(path: string, body: unknown): Promise<unknown> {
  const base = process.env.N8N_BASE_URL;
  const secret = process.env.N8N_WEBHOOK_SECRET;
  const header = process.env.N8N_WEBHOOK_SECRET_HEADER ?? "X-Webhook-Secret";

  if (!base || !secret) throw new Error("N8N_BASE_URL / N8N_WEBHOOK_SECRET not set");

  const res = await fetch(`${base}/webhook/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", [header]: secret },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) return null;
  const text = await res.text();
  if (!text) return null;
  return JSON.parse(text);
}

export async function n8nSendOtp(
  telefono: string,
  purpose: "login" | "registro" | "reset",
  identifier: string,
): Promise<boolean> {
  const phone = normalizePhone(telefono);
  const data = (await post("enviar-otp-whatsapp", { phone, purpose, identifier })) as {
    ok?: boolean;
  } | null;
  return data?.ok === true;
}

export async function n8nNotificarPagoEmpleado(payload: {
  phone: string;
  empleadoNombre: string;
  monto: number;
  periodoDesde: string;
  periodoHasta: string;
  tipo: "pago_nomina" | "adelanto";
  descripcion?: string;
}): Promise<void> {
  post("notificar-pago-empleado", {
    nombre: payload.empleadoNombre,
    phone: normalizePhone(payload.phone),
    monto: payload.monto,
    periodoDesde: payload.periodoDesde,
    periodoHasta: payload.periodoHasta,
    tipo: payload.tipo === "pago_nomina" ? "pago" : "adelanto",
    descripcion: payload.descripcion,
  }).catch(() => {});
}

const ACCION_LABELS: Record<string, string> = {
  crear_empresa:        "🏢 Nueva empresa creada",
  editar_empresa:       "✏️ Empresa editada",
  eliminar_empresa:     "🗑️ Empresa eliminada",
  aprobar_pago:         "✅ Pago aprobado",
  rechazar_pago:        "❌ Pago rechazado",
  crear_enlace_pago:    "💳 Enlace de pago generado",
  actualizar_licencia:  "🔑 Licencia actualizada",
  crear_admin:          "👤 Nuevo administrador creado",
  eliminar_admin:       "👤 Administrador eliminado",
};

export async function n8nNotificarAdmin(payload: {
  accion: string;
  userEmail: string;
  empresaNombre: string | null;
  detalle: Record<string, unknown> | null;
}): Promise<void> {
  const adminPhone = process.env.ADMIN_NOTIFICATION_WHATSAPP;
  if (!adminPhone) return;

  const label = ACCION_LABELS[payload.accion] ?? `🔔 ${payload.accion}`;
  const empresa = payload.empresaNombre ? `\n📋 Empresa: ${payload.empresaNombre}` : "";
  const messageText = `*Cactus Access — Admin*\n${label}${empresa}\n👤 Por: ${payload.userEmail}`;

  post("notificaciones-whatsapp", {
    remoteJid: normalizePhone(adminPhone),
    messageText,
  }).catch(() => {});
}

export async function n8nVerifyOtp(telefono: string, code: string): Promise<boolean> {
  const phone = normalizePhone(telefono);
  const data = (await post("verificar-otp-whatsapp", { phone, code })) as {
    valid?: boolean;
  } | null;
  return data?.valid === true;
}
