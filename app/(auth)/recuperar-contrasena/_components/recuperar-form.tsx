"use client";

import { useState, useRef, type FormEvent, type KeyboardEvent } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/cactus/loading-button";
import { requestPasswordResetOtp, verifyResetOtp } from "@/actions/auth.actions";

type Step = "identificador" | "otp";

export function RecuperarForm() {
  const [step, setStep] = useState<Step>("identificador");
  const [maskedPhone, setMaskedPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  async function handleIdentificador(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const identificador = String(form.get("identificador"));
    setError(null);
    setLoading(true);
    const result = await requestPasswordResetOtp(identificador);
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? "Error inesperado");
      return;
    }
    if (!result.phone) {
      setError("No encontramos una cuenta con esa cédula/RUC o no tiene WhatsApp registrado.");
      return;
    }
    setMaskedPhone(result.phone);
    setStep("otp");
  }

  async function handleOtp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) return;
    setError(null);
    setLoading(true);
    const result = await verifyResetOtp(code);
    setLoading(false);
    if (result && !result.ok) setError(result.error ?? "Error inesperado");
  }

  function handleOtpInput(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  }

  function handleOtpKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 6) {
      e.preventDefault();
      setOtp(text.split(""));
      otpRefs.current[5]?.focus();
    }
  }

  if (step === "otp") {
    return (
      <form onSubmit={handleOtp} className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Enviamos un código a tu WhatsApp{maskedPhone ? ` (${maskedPhone})` : ""}. Ingrésalo
          para continuar.
        </p>
        <div className="flex flex-col gap-1.5">
          <Label>Código de verificación</Label>
          <div className="flex gap-2">
            {otp.map((digit, i) => (
              <Input
                key={i}
                ref={(el) => { otpRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpInput(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                onPaste={i === 0 ? handleOtpPaste : undefined}
                className="h-12 w-full text-center text-lg font-mono"
                autoFocus={i === 0}
                aria-label={`Dígito ${i + 1}`}
              />
            ))}
          </div>
        </div>
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <LoadingButton
          type="submit"
          loading={loading}
          disabled={otp.join("").length < 6}
          className="mt-1 h-9"
        >
          {loading ? "Verificando…" : "Verificar código"}
        </LoadingButton>
        <button
          type="button"
          onClick={() => { setStep("identificador"); setError(null); setOtp(["", "", "", "", "", ""]); }}
          className="inline-flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Volver
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleIdentificador} className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Ingresa tu cédula o RUC y enviaremos un código a tu WhatsApp registrado.
      </p>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="identificador">Cédula o RUC</Label>
        <Input
          id="identificador"
          name="identificador"
          type="text"
          inputMode="numeric"
          placeholder="0987654321"
          required
          minLength={5}
        />
      </div>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <LoadingButton type="submit" loading={loading} className="mt-1 h-9">
        {loading ? "Enviando…" : "Enviar código"}
      </LoadingButton>
      <Link
        href="/login"
        className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        <ArrowLeft className="size-4" />
        Volver a ingresar
      </Link>
    </form>
  );
}
