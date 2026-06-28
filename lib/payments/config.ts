import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export interface PaymentConfig {
  dlocalgo: {
    apiKey: string | null;
    secretKey: string | null;
    env: string;
  };
}

export async function getPaymentConfig(): Promise<PaymentConfig> {
  try {
    const supabase = createServiceRoleClient();
    const { data } = await supabase
      .from("configuracion")
      .select("dlocalgo_api_key,dlocalgo_secret_key,dlocalgo_env")
      .eq("id", "global")
      .single();

    return {
      dlocalgo: {
        apiKey: data?.dlocalgo_api_key || process.env.DLOCALGO_API_KEY || null,
        secretKey: data?.dlocalgo_secret_key || process.env.DLOCALGO_SECRET_KEY || null,
        env: data?.dlocalgo_env || process.env.DLOCALGO_ENV || "sandbox",
      },
    };
  } catch {
    return {
      dlocalgo: {
        apiKey: process.env.DLOCALGO_API_KEY || null,
        secretKey: process.env.DLOCALGO_SECRET_KEY || null,
        env: process.env.DLOCALGO_ENV || "sandbox",
      },
    };
  }
}

export function isDLocalGoReady(cfg: PaymentConfig): boolean {
  return Boolean(cfg.dlocalgo.apiKey && cfg.dlocalgo.secretKey);
}
