"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/cactus/loading-button";
import { updateEmpresa } from "@/actions/empresa.actions";
import { PhoneInput, parsePhone, combinePhone } from "@/components/forms/phone-input";
import type { Empresa } from "@/lib/types/database.types";

export function EmpresaForm({ empresa }: { empresa: Empresa }) {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const telParsed = parsePhone(empresa.telefono);
  const notifParsed = parsePhone(empresa.telefono_notificacion_tardanza);

  const [telCode, setTelCode] = useState(telParsed.code);
  const [telDigits, setTelDigits] = useState(telParsed.digits);
  const [notifCode, setNotifCode] = useState(notifParsed.code);
  const [notifDigits, setNotifDigits] = useState(notifParsed.digits);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    setServerError(null);
    setSuccess(false);
    setLoading(true);

    const result = await updateEmpresa({
      nombreEmpresa: String(form.get("nombreEmpresa") ?? ""),
      direccion: String(form.get("direccion") ?? ""),
      ruc: String(form.get("ruc") ?? ""),
      telefono: combinePhone(telCode, telDigits),
      telefonoNotificacionTardanza: combinePhone(notifCode, notifDigits),
    });

    setLoading(false);
    if (!result.ok) {
      setServerError(result.error ?? "Error inesperado");
    } else {
      setSuccess(true);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-xl border border-border bg-card p-8 shadow-sm"
    >
      <div className="flex flex-col gap-1 border-b border-border pb-4">
        <h2 className="text-base font-semibold text-foreground">Datos de la empresa</h2>
        <p className="text-xs text-muted-foreground">
          Información general visible en tus reportes
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="nombreEmpresa">
          Nombre de la empresa <span className="text-destructive">*</span>
        </Label>
        <Input
          id="nombreEmpresa"
          name="nombreEmpresa"
          defaultValue={empresa.nombre_empresa}
          required
          minLength={2}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="direccion">Dirección</Label>
        <Input
          id="direccion"
          name="direccion"
          defaultValue={empresa.direccion ?? ""}
        />
      </div>

      <PhoneInput
        id="telefono"
        label="Teléfono"
        code={telCode}
        digits={telDigits}
        onCodeChange={setTelCode}
        onDigitsChange={setTelDigits}
      />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ruc">Cédula o RUC</Label>
        <Input
          id="ruc"
          name="ruc"
          inputMode="numeric"
          defaultValue={empresa.ruc ?? ""}
        />
        <p className="text-xs text-muted-foreground">
          Lo usas para iniciar sesión. Cámbialo solo si es necesario.
        </p>
      </div>

      <PhoneInput
        id="telefonoNotificacionTardanza"
        label="WhatsApp para alertas de tardanza"
        helperText="Recibirá notificaciones cuando un empleado llegue tarde."
        code={notifCode}
        digits={notifDigits}
        onCodeChange={setNotifCode}
        onDigitsChange={setNotifDigits}
      />

      {serverError ? (
        <p role="alert" className="text-sm text-destructive">
          {serverError}
        </p>
      ) : null}
      {success ? (
        <p role="status" className="text-sm text-success">
          Cambios guardados correctamente.
        </p>
      ) : null}

      <LoadingButton type="submit" loading={loading} className="self-start">
        {loading ? "Guardando…" : "Guardar cambios"}
      </LoadingButton>
    </form>
  );
}
