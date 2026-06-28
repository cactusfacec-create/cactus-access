"use client";

import { useState, type FormEvent } from "react";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/cactus/loading-button";
import { updatePassword } from "@/actions/auth.actions";

export function ActualizarForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);
    const password = String(formData.get("password"));
    const confirmacion = String(formData.get("confirmacion"));
    if (password !== confirmacion) {
      setError("Las contraseñas no coinciden");
      return;
    }
    setLoading(true);
    const result = await updatePassword({ password });
    setLoading(false);
    if (result && !result.ok) setError(result.error);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Nueva contraseña</Label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          required
          minLength={6}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirmacion">Confirma la contraseña</Label>
        <PasswordInput
          id="confirmacion"
          name="confirmacion"
          autoComplete="new-password"
          required
          minLength={6}
        />
      </div>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <LoadingButton type="submit" loading={loading} className="mt-1 h-9">
        {loading ? "Guardando…" : "Guardar contraseña"}
      </LoadingButton>
    </form>
  );
}
