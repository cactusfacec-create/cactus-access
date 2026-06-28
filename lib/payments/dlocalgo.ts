/**
 * Cliente dLocal Go — pasarela de pagos Latam (Ecuador soportado)
 * Docs: https://docs.dlocalgo.com/integration-api
 */

import "server-only";
import crypto from "crypto";

const getBaseUrl = (env: string) =>
  env === "sandbox"
    ? "https://api-sbx.dlocalgo.com"
    : "https://api.dlocalgo.com";

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface DLocalGoConfig {
  apiKey: string;
  secretKey: string;
  env: string; // "sandbox" | "production"
}

export interface DLocalGoCreatePaymentInput {
  /** Monto en USD reales (140 = $140, NO en centavos) */
  amount: number;
  currency?: string;
  country?: string;
  /** Nuestro clientTransactionId */
  order_id: string;
  description?: string;
  /** URL tras pago exitoso */
  success_url: string;
  /** URL si el cliente vuelve sin pagar */
  back_url: string;
  /** URL del webhook server-to-server */
  notification_url: string;
}

export interface DLocalGoCreatePaymentResponse {
  /** ID de pago de dLocal ("DP-xxx") */
  id: string;
  /** URL del checkout donde redirigir al cliente */
  redirect_url: string;
  status: string;
  order_id?: string;
  amount?: number;
  currency?: string;
}

export interface DLocalGoPaymentDetail {
  id: string;
  /** Nuestro clientTransactionId */
  order_id: string;
  /** "COMPLETED" | "REJECTED" | "CANCELLED" | "PENDING" */
  status: string;
  amount: number;
  currency: string;
}

// ── Métodos ───────────────────────────────────────────────────────────────────

export async function createDLocalGoPayment(
  input: DLocalGoCreatePaymentInput,
  config: DLocalGoConfig,
): Promise<DLocalGoCreatePaymentResponse> {
  const res = await fetch(`${getBaseUrl(config.env)}/v1/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}:${config.secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      currency: input.currency ?? "USD",
      amount: input.amount,
      country: input.country ?? "EC",
      order_id: input.order_id,
      description: input.description,
      success_url: input.success_url,
      back_url: input.back_url,
      notification_url: input.notification_url,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`dLocalGo createPayment error ${res.status}: ${text}`);
  }

  return res.json() as Promise<DLocalGoCreatePaymentResponse>;
}

/** Obtiene los detalles de un pago por su ID ("DP-xxx"). */
export async function getDLocalGoPayment(
  paymentId: string,
  config: DLocalGoConfig,
): Promise<DLocalGoPaymentDetail> {
  const res = await fetch(`${getBaseUrl(config.env)}/v1/payments/${paymentId}`, {
    headers: {
      Authorization: `Bearer ${config.apiKey}:${config.secretKey}`,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`dLocalGo getPayment error ${res.status}: ${text}`);
  }

  return res.json() as Promise<DLocalGoPaymentDetail>;
}

/**
 * Verifica la firma HMAC del webhook de dLocal Go.
 * Header recibido: "Authorization: V2-HMAC-SHA256, Signature: <hex>"
 * Firma esperada: HMAC-SHA256(apiKey + rawBody, secretKey)
 */
export function verifyDLocalGoWebhookSignature(
  rawBody: string,
  authHeader: string,
  config: DLocalGoConfig,
): boolean {
  const match = authHeader.match(/Signature:\s*([a-f0-9]+)/i);
  if (!match) return false;

  const received = match[1];
  const expected = crypto
    .createHmac("sha256", config.secretKey)
    .update(config.apiKey + rawBody)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(received, "hex"),
      Buffer.from(expected, "hex"),
    );
  } catch {
    return false;
  }
}
