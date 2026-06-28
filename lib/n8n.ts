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
  return res.json();
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
  const base = process.env.N8N_BASE_URL;
  if (!base) return;
  fetch(`${base}/webhook/pago-empleado-whatsapp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, phone: normalizePhone(payload.phone) }),
  }).catch(() => {});
}

export async function n8nVerifyOtp(telefono: string, code: string): Promise<boolean> {
  const phone = normalizePhone(telefono);
  const data = (await post("verificar-otp-whatsapp", { phone, code })) as {
    valid?: boolean;
  } | null;
  return data?.valid === true;
}
