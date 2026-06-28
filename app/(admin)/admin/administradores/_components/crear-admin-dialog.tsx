"use client";

import { useState, useTransition } from "react";
import { Eye, EyeOff, UserPlus, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/cactus/loading-button";
import { crearAdmin } from "@/actions/admin/admins.actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ caracteres", ok: password.length >= 8 },
    { label: "Una mayúscula", ok: /[A-Z]/.test(password) },
    { label: "Un número", ok: /[0-9]/.test(password) },
  ];
  if (!password) return null;
  return (
    <div className="flex flex-wrap gap-2 pt-0.5">
      {checks.map((c) => (
        <span
          key={c.label}
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs",
            c.ok
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
              : "bg-muted text-muted-foreground",
          )}
        >
          {c.ok ? <Check className="size-3" /> : <X className="size-3" />}
          {c.label}
        </span>
      ))}
    </div>
  );
}

export function CrearAdminDialog() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setWhatsapp("");
    setError(null);
    setShowPwd(false);
    setShowConfirm(false);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) reset();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await crearAdmin({ email, password, confirmPassword, whatsapp });
      if (result.ok) {
        toast.success("Administrador creado", {
          description: `${email} ya puede iniciar sesión en el panel.`,
        });
        setOpen(false);
      } else {
        setError(result.error);
      }
    });
  }

  const passwordMatch = confirmPassword && password === confirmPassword;
  const passwordMismatch = confirmPassword && password !== confirmPassword;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button>
            <UserPlus className="size-4" />
            Agregar administrador
          </Button>
        }
      />

      <DialogContent className="flex max-h-[85vh] max-w-md flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b border-border px-5 py-4">
          <DialogTitle>Nuevo administrador</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ca-email">Correo electrónico *</Label>
              <Input
                id="ca-email"
                type="email"
                placeholder="admin@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="off"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ca-password">Contraseña *</Label>
              <div className="relative">
                <Input
                  id="ca-password"
                  type={showPwd ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPwd ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <PasswordStrength password={password} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ca-confirm">Confirmar contraseña *</Label>
              <div className="relative">
                <Input
                  id="ca-confirm"
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className={cn(
                    "pr-10",
                    passwordMatch && "border-emerald-500 focus:ring-emerald-500",
                    passwordMismatch && "border-red-400 focus:ring-red-400",
                  )}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showConfirm ? "Ocultar" : "Mostrar"}
                >
                  {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {passwordMatch && (
                <p className="flex items-center gap-1 text-xs text-emerald-600">
                  <Check className="size-3" /> Las contraseñas coinciden
                </p>
              )}
              {passwordMismatch && (
                <p className="text-xs text-destructive">Las contraseñas no coinciden</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ca-whatsapp">
                WhatsApp para notificaciones{" "}
                <span className="font-normal text-muted-foreground">(opcional)</span>
              </Label>
              <Input
                id="ca-whatsapp"
                type="tel"
                placeholder="593987654321"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ""))}
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">
                Con código de país, sin el + (ej: 593987654321)
              </p>
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-border bg-muted/50 px-5 py-3">
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <LoadingButton type="submit" loading={pending}>
                {pending ? "Creando…" : "Crear administrador"}
              </LoadingButton>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
