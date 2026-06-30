"use server";

import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { n8nNotificarAdmin } from "@/lib/n8n";
import type { AdminAccessLog, AdminAuditLog } from "@/lib/types/database.types";

export async function logAdminAccess(userEmail: string, userId?: string): Promise<void> {
  try {
    const supabase = createServiceRoleClient();
    await supabase.from("admin_access_logs").insert({
      user_email: userEmail,
      user_id: userId ?? null,
    });
  } catch {
    // Logging failures must not break the application
  }
}

export interface LogAuditInput {
  userEmail: string;
  userId?: string;
  accion: string;
  entidad: string;
  entidadId?: string;
  empresaNombre?: string;
  detalle?: Record<string, unknown>;
}

export async function logAudit(input: LogAuditInput): Promise<void> {
  try {
    const supabase = createServiceRoleClient();
    await supabase.from("admin_audit_log").insert({
      user_email: input.userEmail,
      user_id: input.userId ?? null,
      accion: input.accion,
      entidad: input.entidad,
      entidad_id: input.entidadId ?? null,
      empresa_nombre: input.empresaNombre ?? null,
      detalle: input.detalle ?? null,
    });
  } catch {
    // Logging failures must not break the application
  }

  // Fire-and-forget: notificar a n8n para WhatsApp (con X-Webhook-Secret)
  n8nNotificarAdmin({
    accion: input.accion,
    userEmail: input.userEmail,
    empresaNombre: input.empresaNombre ?? null,
    detalle: input.detalle ?? null,
  });
}

export async function getAccessLogs(): Promise<AdminAccessLog[]> {
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("admin_access_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  return (data as AdminAccessLog[]) ?? [];
}

export async function getAuditLogs(): Promise<AdminAuditLog[]> {
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("admin_audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  return (data as AdminAuditLog[]) ?? [];
}
