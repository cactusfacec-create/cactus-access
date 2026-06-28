"use client";

import { useState, useRef, type FormEvent, type KeyboardEvent } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/cactus/loading-button";
import { signInWithIdentificador, verifyLoginOtp } from "@/actions/auth.actions";

type Step = "credentials" | "otp";

export function LoginForm() {
  const [step, setStep] = useState<Step>("credentials");
  const [maskedPhone, setMaskedPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  async function handleCredentials(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError(null);
    setLoading(true);
    const result = await signInWithIdentificador({
      identificador: String(form.get("identificador")),
      password: String(form.get("password")),
    });
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? "Error inesperado");
      return;
    }
    setMaskedPhone(result.phone ?? "");
    setStep("otp");
  }

  async function handleOtp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) return;
    setError(null);
    setLoading(true);
    const result = await verifyLoginOtp(code);
    setLoading(false);
    if (result && !result.ok) setError(result.error ?? "Error inesperado");
  }

  function handleOtpInput(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    } else if (digit && index === 5) {
      otpRefs.current[5]?.form?.requestSubmit();
    }
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
      <form onSubmit={handleOtp} className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-3 duration-300">
        <p className="text-sm text-muted-foreground animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-backwards" style={{ animationDelay: "50ms" }}>
          Enviamos un código a tu WhatsApp{maskedPhone ? ` (${maskedPhone})` : ""}. Ingrésalo
          para continuar.
        </p>
        <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-backwards" style={{ animationDelay: "100ms" }}>
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
                onPaste={handleOtpPaste}
                className="h-12 w-full text-center text-lg font-mono"
                autoFocus={i === 0}
                aria-label={`Dígito ${i + 1}`}
              />
            ))}
          </div>
        </div>
        {error ? (
          <p role="alert" className="text-sm text-destructive animate-in fade-in duration-200">
            {error}
          </p>
        ) : null}
        <LoadingButton
          type="submit"
          loading={loading}
          disabled={otp.join("").length < 6}
          className="mt-1 h-9 animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-backwards"
          style={{ animationDelay: "150ms" }}
        >
          {loading ? "Verificando…" : "Verificar código"}
        </LoadingButton>
        <button
          type="button"
          onClick={() => { setStep("credentials"); setError(null); setOtp(["", "", "", "", "", ""]); }}
          className="text-center text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground animate-in fade-in duration-300 fill-mode-backwards"
          style={{ animationDelay: "200ms" }}
        >
          Volver
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleCredentials} className="flex flex-col gap-4 animate-in fade-in slide-in-from-left-3 duration-300">
      <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-backwards" style={{ animationDelay: "50ms" }}>
        <Label htmlFor="identificador">Cédula o RUC</Label>
        <Input
          id="identificador"
          name="identificador"
          type="text"
          inputMode="numeric"
          placeholder="0987654321"
          autoComplete="username"
          required
          minLength={5}
        />
      </div>
      <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-backwards" style={{ animationDelay: "100ms" }}>
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Contraseña</Label>
          <Link
            href="/recuperar-contrasena"
            className="text-xs font-medium text-primary transition-colors duration-150 hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <PasswordInput id="password" name="password" autoComplete="current-password" required />
      </div>
      {error ? (
        <p role="alert" className="text-sm text-destructive animate-in fade-in duration-200">
          {error}
        </p>
      ) : null}
      <LoadingButton
        type="submit"
        loading={loading}
        className="mt-1 h-9 animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-backwards"
        style={{ animationDelay: "150ms" }}
      >
        {loading ? "Verificando…" : "Continuar"}
      </LoadingButton>
    </form>
  );
}
