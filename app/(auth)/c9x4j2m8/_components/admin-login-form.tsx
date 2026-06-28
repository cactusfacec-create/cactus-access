"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/cactus/loading-button";
import { signInAsSuperAdmin, verifyAdminOtp } from "@/actions/auth.actions";

export function AdminLoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpState, setOtpState] = useState<{ phone: string } | null>(null);

  async function handleCredentials(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError(null);
    setLoading(true);
    const result = await signInAsSuperAdmin({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? "Error inesperado");
      return;
    }
    if (result.requiresOtp && result.phone) {
      setOtpState({ phone: result.phone });
    }
  }

  async function handleOtp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError(null);
    setLoading(true);
    const result = await verifyAdminOtp(String(form.get("code")));
    setLoading(false);
    if (!result.ok) setError(result.error ?? "Error inesperado");
  }

  if (otpState) {
    return (
      <form onSubmit={handleOtp} className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground text-center">
          Enviamos un código de verificación a WhatsApp {otpState.phone}
        </p>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="code">Código de verificación</Label>
          <Input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            placeholder="000000"
            maxLength={6}
            autoComplete="one-time-code"
            required
          />
        </div>
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <LoadingButton type="submit" loading={loading} className="mt-1 h-9">
          {loading ? "Verificando…" : "Confirmar código"}
        </LoadingButton>
        <button
          type="button"
          className="text-sm text-muted-foreground hover:text-foreground text-center transition-colors"
          onClick={() => {
            setOtpState(null);
            setError(null);
          }}
        >
          Volver al inicio
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleCredentials} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          placeholder="admin@cactusaccess.com"
          autoComplete="username"
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Contraseña</Label>
        <PasswordInput id="password" name="password" autoComplete="current-password" required />
      </div>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <LoadingButton type="submit" loading={loading} className="mt-1 h-9">
        {loading ? "Verificando…" : "Ingresar"}
      </LoadingButton>
    </form>
  );
}
