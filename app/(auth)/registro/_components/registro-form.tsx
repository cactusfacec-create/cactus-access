"use client";

import { useState, useRef, type FormEvent, type KeyboardEvent } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/cactus/loading-button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { sendRegistroOtp, verifyRegistroOtpAndSignUp } from "@/actions/auth.actions";

const COUNTRIES = [
  { code: "593", flag: "🇪🇨", name: "Ecuador" },
  { code: "51",  flag: "🇵🇪", name: "Perú" },
  { code: "503", flag: "🇸🇻", name: "El Salvador" },
  { code: "507", flag: "🇵🇦", name: "Panamá" },
];

type Step = "datos" | "otp";

type FormValues = {
  password: string;
  nombreEmpresa: string;
  direccion: string;
  telefono: string;
  ruc: string;
};

export function RegistroForm() {
  const [step, setStep] = useState<Step>("datos");
  const [countryCode, setCountryCode] = useState("593");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingValues, setPendingValues] = useState<FormValues | null>(null);
  const [maskedPhone, setMaskedPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const fullPhone = `${countryCode}${phoneDigits.replace(/^0+/, "")}`;
  const formattedPhone = `+${countryCode} ${phoneDigits}`;

  function handleDatos(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const values: FormValues = {
      nombreEmpresa: String(form.get("nombreEmpresa") ?? ""),
      direccion: String(form.get("direccion") ?? ""),
      ruc: String(form.get("ruc") ?? ""),
      password: String(form.get("password") ?? ""),
      telefono: fullPhone,
    };
    setPendingValues(values);
    setError(null);
    setShowConfirm(true);
  }

  async function handleConfirmAndSend() {
    if (!pendingValues) return;
    setShowConfirm(false);
    setLoading(true);
    setError(null);
    const result = await sendRegistroOtp(pendingValues.telefono);
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? "Error al enviar el código");
      return;
    }
    setMaskedPhone(result.phone ?? "");
    setStep("otp");
  }

  async function handleOtp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!pendingValues) return;
    const code = otp.join("");
    if (code.length < 6) return;
    setError(null);
    setLoading(true);
    const result = await verifyRegistroOtpAndSignUp(pendingValues, code);
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
          Enviamos un código a tu WhatsApp{maskedPhone ? ` (${maskedPhone})` : ""} para
          verificar tu número.
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
          <p role="alert" className="text-sm text-destructive">{error}</p>
        ) : null}
        <LoadingButton
          type="submit"
          loading={loading}
          disabled={otp.join("").length < 6}
          className="mt-1 h-9"
        >
          {loading ? "Creando cuenta…" : "Verificar y crear cuenta"}
        </LoadingButton>
        <button
          type="button"
          onClick={() => { setStep("datos"); setError(null); setOtp(["", "", "", "", "", ""]); }}
          className="text-center text-sm text-muted-foreground hover:text-foreground"
        >
          Volver
        </button>
      </form>
    );
  }

  return (
    <>
      <form onSubmit={handleDatos} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nombreEmpresa">Nombre de la empresa</Label>
          <Input id="nombreEmpresa" name="nombreEmpresa" required minLength={2} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="direccion">Dirección</Label>
          <Input id="direccion" name="direccion" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="telefono-digits">
            WhatsApp <span className="text-destructive">*</span>
          </Label>
          <div className="flex overflow-hidden rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="shrink-0 border-r border-input bg-muted px-2 py-2 text-sm text-foreground focus:outline-none"
              aria-label="Código de país"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} +{c.code}
                </option>
              ))}
            </select>
            <input
              id="telefono-digits"
              type="tel"
              inputMode="numeric"
              value={phoneDigits}
              onChange={(e) => setPhoneDigits(e.target.value.replace(/\D/g, ""))}
              placeholder="987654321"
              className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm focus:outline-none"
              required
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Se enviará un código de verificación a este número.
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ruc">
            Cédula o RUC <span className="text-destructive">*</span>
          </Label>
          <Input
            id="ruc"
            name="ruc"
            inputMode="numeric"
            required
            minLength={5}
            placeholder="0987654321"
          />
          <p className="text-xs text-muted-foreground">
            Lo usarás para iniciar sesión.
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Contraseña</Label>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            required
            minLength={6}
          />
        </div>
        {error ? (
          <p role="alert" className="text-sm text-destructive">{error}</p>
        ) : null}
        <LoadingButton type="submit" loading={loading} className="mt-1 h-9">
          {loading ? "Enviando código…" : "Continuar"}
        </LoadingButton>
      </form>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿El número es correcto?</AlertDialogTitle>
            <AlertDialogDescription>
              Enviaremos el código de verificación al número{" "}
              <strong className="text-foreground">{formattedPhone}</strong>. Asegúrate
              de que sea tu WhatsApp activo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Corregir</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAndSend} disabled={loading}>
              {loading ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : null}
              {loading ? "Enviando…" : "Sí, continuar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
