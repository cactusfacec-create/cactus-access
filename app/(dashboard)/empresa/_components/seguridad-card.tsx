"use client";

import { useState } from "react";
import { ShieldCheck, ShieldOff, MessageCircle, AlertTriangle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { updateSeguridadEmpresa } from "@/actions/empresa.actions";

export function SeguridadCard({ otpRequerido }: { otpRequerido: boolean }) {
  const [enabled, setEnabled] = useState(otpRequerido);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle(next: boolean) {
    setLoading(true);
    setError(null);
    const result = await updateSeguridadEmpresa(next);
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? "Error inesperado");
      return;
    }
    setEnabled(next);
  }

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-border bg-card p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-border pb-4">
        <h2 className="text-base font-semibold text-foreground">Seguridad de acceso</h2>
        <p className="text-xs text-muted-foreground">
          Configura cómo acceden los usuarios a la plataforma
        </p>
      </div>

      {/* Toggle row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span
            className={
              enabled
                ? "flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                : "flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"
            }
          >
            {enabled ? <ShieldCheck className="size-4.5" /> : <ShieldOff className="size-4.5" />}
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-foreground">
              Verificación en dos pasos
            </span>
            <span className="text-xs leading-relaxed text-muted-foreground">
              Envía un código de 6 dígitos por WhatsApp al iniciar sesión
            </span>
          </div>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={handleToggle}
          disabled={loading}
          aria-label="Activar o desactivar verificación en dos pasos"
        />
      </div>

      {/* Estado actual */}
      {enabled ? (
        <div className="flex items-start gap-2.5 rounded-xl bg-emerald-50 px-4 py-3 dark:bg-emerald-500/8">
          <MessageCircle className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div className="flex flex-col gap-0.5">
            <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              Verificación activa
            </p>
            <p className="text-xs leading-relaxed text-emerald-700 dark:text-emerald-400">
              Al iniciar sesión se enviará un código de seguridad al WhatsApp registrado en tu
              cuenta. Requiere que el número esté configurado correctamente.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 px-4 py-3 dark:bg-amber-500/8">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="flex flex-col gap-0.5">
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
              Inicio de sesión simplificado
            </p>
            <p className="text-xs leading-relaxed text-amber-700 dark:text-amber-400">
              Los usuarios solo necesitan RUC y contraseña para acceder. Asegúrate de usar una
              contraseña segura, ya que no habrá una segunda verificación.
            </p>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
