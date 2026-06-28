"use server";

import { redirect } from "next/navigation";
import { headers, cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { getDashboardPathForUser } from "@/lib/auth/session";
import { n8nSendOtp, n8nVerifyOtp, normalizePhone } from "@/lib/n8n";
import {
  identificadorSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from "@/lib/validations/auth.schema";
import { logAdminAccess } from "@/actions/admin/logs.actions";
import type { ActionResult } from "@/lib/types/domain";

async function getOrigin() {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

// ─── Login con cédula/RUC + OTP ──────────────────────────────────────────────

export async function signInWithIdentificador(input: {
  identificador: string;
  password: string;
}): Promise<ActionResult & { phone?: string }> {
  const parsed = identificadorSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos" };

  // Usamos admin client para bypasear RLS — la tabla empresas solo es legible
  // por el propio tenant, pero aquí aún no hay sesión.
  const admin = createServiceRoleClient();
  const { data: empresaRows } = await admin
    .from("empresas")
    .select("email, telefono, otp_requerido")
    .eq("ruc", parsed.data.identificador)
    .limit(1);
  const empresa = empresaRows?.[0] ?? null;

  if (!empresa) return { ok: false, error: "Cédula/RUC no registrado" };

  // Si empresa.email es null (registro sin email guardado), lo derivamos del RUC
  const loginEmail =
    empresa.email ?? `${parsed.data.identificador.toLowerCase().trim()}@cactus.app`;

  // Verificar contraseña con el cliente de sesión normal
  const supabase = await createClient();
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: loginEmail,
    password: parsed.data.password,
  });
  if (authError) return { ok: false, error: "Contraseña incorrecta" };

  // Si la verificación en dos pasos está desactivada, la sesión ya está activa → redirect directo
  if (empresa.otp_requerido === false) {
    redirect(await getDashboardPathForUser());
  }

  if (!empresa.telefono) {
    await supabase.auth.signOut();
    return { ok: false, error: "Esta cuenta no tiene número de WhatsApp registrado" };
  }

  // Cerrar sesión: se reabrirá solo después de verificar el OTP
  await supabase.auth.signOut();

  // Generar token de magic link para usarlo después de verificar OTP
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: loginEmail,
  });
  if (linkError || !linkData?.properties?.hashed_token) {
    return { ok: false, error: "Error interno. Intenta de nuevo." };
  }

  const phone = normalizePhone(empresa.telefono);

  // Guardar estado pendiente en cookie httpOnly (10 min)
  const cookieStore = await cookies();
  cookieStore.set(
    "__auth_pending",
    JSON.stringify({ tokenHash: linkData.properties.hashed_token, phone }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 600,
      sameSite: "lax",
      path: "/",
    },
  );

  const sent = await n8nSendOtp(phone, "login", parsed.data.identificador);
  if (!sent) return { ok: false, error: "No se pudo enviar el código de verificación. Intenta de nuevo." };

  return { ok: true, phone: `****${phone.slice(-4)}` };
}

export async function verifyLoginOtp(code: string): Promise<ActionResult> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("__auth_pending")?.value;
  if (!raw) return { ok: false, error: "Sesión expirada. Inicia de nuevo." };

  let parsed2: { tokenHash: string; phone: string };
  try { parsed2 = JSON.parse(raw); }
  catch { return { ok: false, error: "Sesión expirada. Inicia de nuevo." }; }
  const { tokenHash, phone } = parsed2;

  const valid = await n8nVerifyOtp(phone, code);
  if (!valid) return { ok: false, error: "Código inválido o expirado" };

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: "magiclink",
  });
  if (error) return { ok: false, error: "Error al crear la sesión. Intenta de nuevo." };

  cookieStore.delete("__auth_pending");
  redirect(await getDashboardPathForUser());
}

// ─── Registro con verificación OTP de WhatsApp ───────────────────────────────

export async function sendRegistroOtp(
  telefono: string,
): Promise<ActionResult & { phone?: string }> {
  const phone = normalizePhone(telefono);
  if (phone.length < 10) return { ok: false, error: "Número de WhatsApp inválido" };

  const sent = await n8nSendOtp(phone, "registro", phone);
  if (!sent) return { ok: false, error: "No se pudo enviar el código. Intenta de nuevo." };

  return { ok: true, phone: `****${phone.slice(-4)}` };
}

export async function verifyRegistroOtpAndSignUp(
  input: {
    password: string;
    nombreEmpresa: string;
    direccion?: string;
    telefono: string;
    ruc: string;
  },
  code: string,
): Promise<ActionResult> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos" };

  const phone = normalizePhone(parsed.data.telefono);
  const valid = await n8nVerifyOtp(phone, code);
  if (!valid) return { ok: false, error: "Código inválido o expirado" };

  // Email interno generado del RUC — el usuario nunca lo ve ni recibe nada.
  // Admin client con email_confirm:true evita cualquier envío de correo.
  const generatedEmail = `${parsed.data.ruc.toLowerCase().trim()}@cactus.app`;

  const admin = createServiceRoleClient();
  let userId: string;

  const { data: adminData, error: adminError } = await admin.auth.admin.createUser({
    email: generatedEmail,
    password: parsed.data.password,
    email_confirm: true,
  });

  if (adminError) {
    if (!adminError.message.toLowerCase().includes("already")) {
      return { ok: false, error: "No se pudo crear la cuenta" };
    }
    // Usuario existe de un intento fallido anterior — intentar sign-in para recuperarlo
    const supabaseTmp = await createClient();
    const { error: signInErr } = await supabaseTmp.auth.signInWithPassword({
      email: generatedEmail,
      password: parsed.data.password,
    });
    if (signInErr) {
      return { ok: false, error: "Ya existe una cuenta con esta cédula/RUC. Intenta iniciar sesión." };
    }
    const { data: me } = await supabaseTmp.auth.getUser();
    if (!me.user) return { ok: false, error: "Error interno. Intenta de nuevo." };
    userId = me.user.id;
    await supabaseTmp.auth.signOut();
  } else {
    if (!adminData.user) return { ok: false, error: "No se pudo crear la cuenta" };
    userId = adminData.user.id;
  }

  // Iniciar sesión para tener sesión válida (RLS del RPC la requiere)
  const supabase = await createClient();
  await supabase.auth.signInWithPassword({
    email: generatedEmail,
    password: parsed.data.password,
  });

  // Verificar si la empresa ya existe para este usuario (via profile)
  const { data: profile } = await admin
    .from("profiles")
    .select("id_empresa")
    .eq("id", userId)
    .maybeSingle();

  let idEmpresa: string;
  let isNewCompany = false;

  if (profile?.id_empresa) {
    idEmpresa = profile.id_empresa;
  } else {
    const { data: newId, error: rpcError } = await supabase.rpc(
      "handle_new_company_signup",
      { p_user_id: userId, p_nombre_empresa: parsed.data.nombreEmpresa },
    );
    if (rpcError || !newId) {
      return { ok: false, error: "No se pudo crear la empresa. Contacta a soporte." };
    }
    idEmpresa = newId as string;
    isNewCompany = true;
  }

  const { error: updateError } = await admin
    .from("empresas")
    .update({
      nombre_empresa: parsed.data.nombreEmpresa,
      email: generatedEmail,
      direccion: parsed.data.direccion || null,
      telefono: parsed.data.telefono || null,
      ruc: parsed.data.ruc || null,
    })
    .eq("id", idEmpresa);

  if (updateError) {
    return { ok: false, error: "No se pudo guardar los datos de la empresa. Contacta a soporte." };
  }

  // Activar prueba gratuita de 15 días solo para empresas recién creadas
  if (isNewCompany) {
    const trialFields = {
      plan_tipo: "prueba" as const,
      activa: true,
      fecha_vencimiento: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10),
      limite_sucursales: 1,
      limite_empleados: 5,
      precio: 0,
    };

    const { data: licenciaExistente } = await admin
      .from("licencias")
      .select("id_empresa")
      .eq("id_empresa", idEmpresa)
      .maybeSingle();

    if (licenciaExistente) {
      // RPC ya creó la fila → sobreescribir con trial (el RPC puede haber puesto un plan_tipo por defecto)
      const { error: trialErr } = await admin
        .from("licencias")
        .update(trialFields)
        .eq("id_empresa", idEmpresa);
      if (trialErr) console.error("[trial] update failed:", trialErr.message);
    } else {
      const { error: trialErr } = await admin.from("licencias").insert({
        id_empresa: idEmpresa,
        tipo_corte: "quincenal",
        periodo_facturacion: "trimestral",
        ...trialFields,
      });
      if (trialErr) console.error("[trial] insert failed:", trialErr.message);
    }
  }

  redirect("/dashboard");
}

// ─── Recuperación de contraseña con OTP ──────────────────────────────────────

export async function requestPasswordResetOtp(
  identificador: string,
): Promise<ActionResult & { phone?: string }> {
  // Admin client para bypasear RLS — sin sesión no se puede leer empresas
  const admin = createServiceRoleClient();
  const { data: empresaRows } = await admin
    .from("empresas")
    .select("email, telefono")
    .eq("ruc", identificador)
    .limit(1);
  const empresa = empresaRows?.[0] ?? null;

  if (!empresa || !empresa.telefono) {
    return { ok: true };
  }

  const resetEmail =
    empresa.email ?? `${identificador.toLowerCase().trim()}@cactus.app`;

  const phone = normalizePhone(empresa.telefono);

  const cookieStore = await cookies();
  cookieStore.set(
    "__reset_pending",
    JSON.stringify({ email: resetEmail, phone }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 600,
      sameSite: "lax",
      path: "/",
    },
  );

  await n8nSendOtp(phone, "reset", identificador);

  return { ok: true, phone: `****${phone.slice(-4)}` };
}

export async function verifyResetOtp(code: string): Promise<ActionResult> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("__reset_pending")?.value;
  if (!raw) return { ok: false, error: "Sesión expirada. Inicia de nuevo." };

  const { email, phone } = JSON.parse(raw) as { email: string; phone: string };

  const valid = await n8nVerifyOtp(phone, code);
  if (!valid) return { ok: false, error: "Código inválido o expirado" };

  const admin = createServiceRoleClient();
  const origin = await getOrigin();
  const { data, error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo: `${origin}/actualizar-contrasena` },
  });
  if (error || !data?.properties?.hashed_token) {
    return { ok: false, error: "Error al generar el enlace. Intenta de nuevo." };
  }

  cookieStore.delete("__reset_pending");

  // Crear sesión de recuperación directamente sin redirigir por Supabase
  const supabase = await createClient();
  const { error: verifyError } = await supabase.auth.verifyOtp({
    token_hash: data.properties.hashed_token,
    type: "recovery",
  });
  if (verifyError) return { ok: false, error: "Error al verificar. Intenta de nuevo." };

  redirect("/actualizar-contrasena");
}

// ─── Login super_admin (email + contraseña + 2FA opcional por WhatsApp) ──────

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

export async function signInAsSuperAdmin(input: {
  email: string;
  password: string;
}): Promise<ActionResult & { requiresOtp?: boolean; phone?: string }> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos" };

  const serviceClient = createServiceRoleClient();

  // Rate limiting: bloquear tras 5 intentos fallidos en 15 min
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
  const { count: failedCount } = await serviceClient
    .from("admin_login_attempts")
    .select("id", { count: "exact", head: true })
    .eq("email", parsed.data.email)
    .eq("succeeded", false)
    .gte("attempted_at", windowStart);

  if ((failedCount ?? 0) >= RATE_LIMIT_MAX) {
    return {
      ok: false,
      error: "Demasiados intentos fallidos. Espera 15 minutos e inténtalo de nuevo.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    await serviceClient
      .from("admin_login_attempts")
      .insert({ email: parsed.data.email, succeeded: false });
    return { ok: false, error: "Correo o contraseña incorrectos" };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("rol, whatsapp")
    .eq("id", data.user.id)
    .single();

  if (profile?.rol !== "super_admin") {
    if (profileError?.code === "42P01" || profileError?.message?.includes("does not exist")) {
      await supabase.auth.signOut();
      return {
        ok: false,
        error: "La base de datos no está configurada. Ejecuta las migraciones con: npx supabase db push",
      };
    }

    // Bootstrap: primer login cuando no hay ningún super_admin
    const { count } = await serviceClient
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("rol", "super_admin");

    if (count === 0) {
      const { error: upsertError } = await serviceClient.from("profiles").upsert({
        id: data.user.id,
        rol: "super_admin",
        id_empresa: null,
      });
      if (upsertError) {
        await supabase.auth.signOut();
        return { ok: false, error: "No se pudo configurar el perfil de administrador" };
      }
      await serviceClient
        .from("admin_login_attempts")
        .insert({ email: parsed.data.email, succeeded: true });
      await logAdminAccess(data.user.email ?? parsed.data.email, data.user.id);
      redirect("/admin");
    } else {
      await supabase.auth.signOut();
      await serviceClient
        .from("admin_login_attempts")
        .insert({ email: parsed.data.email, succeeded: false });
      return { ok: false, error: "Acceso no autorizado" };
    }
  }

  // 2FA por WhatsApp si el admin tiene número registrado
  if (profile?.whatsapp) {
    await supabase.auth.signOut();

    const { data: linkData, error: linkError } = await serviceClient.auth.admin.generateLink({
      type: "magiclink",
      email: parsed.data.email,
    });
    if (linkError || !linkData?.properties?.hashed_token) {
      return { ok: false, error: "Error interno. Intenta de nuevo." };
    }

    const phone = normalizePhone(profile.whatsapp);

    const cookieStore = await cookies();
    cookieStore.set(
      "__admin_pending",
      JSON.stringify({
        tokenHash: linkData.properties.hashed_token,
        whatsapp: phone,
        email: parsed.data.email,
        userId: data.user.id,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 600,
        sameSite: "lax",
        path: "/",
      },
    );

    const sent = await n8nSendOtp(phone, "login", parsed.data.email);
    if (!sent) return { ok: false, error: "No se pudo enviar el código de verificación. Intenta de nuevo." };

    return { ok: true, requiresOtp: true, phone: `****${phone.slice(-4)}` };
  }

  // Sin 2FA: sesión activa, redirigir directamente
  await serviceClient
    .from("admin_login_attempts")
    .insert({ email: parsed.data.email, succeeded: true });
  await logAdminAccess(data.user.email ?? parsed.data.email, data.user.id);
  redirect("/admin");
}

export async function verifyAdminOtp(code: string): Promise<ActionResult> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("__admin_pending")?.value;
  if (!raw) return { ok: false, error: "Sesión expirada. Inicia de nuevo." };

  let parsedAdmin: { tokenHash: string; whatsapp: string; email: string; userId: string };
  try { parsedAdmin = JSON.parse(raw); }
  catch { return { ok: false, error: "Sesión expirada. Inicia de nuevo." }; }
  const { tokenHash, whatsapp, email, userId } = parsedAdmin;

  const valid = await n8nVerifyOtp(whatsapp, code);
  if (!valid) return { ok: false, error: "Código inválido o expirado" };

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: "magiclink",
  });
  if (error) return { ok: false, error: "Error al crear la sesión. Intenta de nuevo." };

  cookieStore.delete("__admin_pending");

  const serviceClient = createServiceRoleClient();
  await serviceClient
    .from("admin_login_attempts")
    .insert({ email, succeeded: true });
  await logAdminAccess(email, userId);

  redirect("/admin");
}

// ─── Cerrar sesión ────────────────────────────────────────────────────────────

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// ─── Actualizar contraseña (desde /actualizar-contrasena) ─────────────────────

export async function updatePassword(input: { password: string }): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: "La contraseña debe tener al menos 6 caracteres" };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error)
    return { ok: false, error: "No se pudo actualizar la contraseña. Solicita un nuevo código." };

  redirect(await getDashboardPathForUser());
}
