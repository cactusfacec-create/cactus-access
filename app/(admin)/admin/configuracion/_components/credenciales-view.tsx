"use client";

import { useState, useTransition } from "react";
import { Eye, EyeOff, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  saveDLocalGoConfig,
  type ConfiguracionStatus,
} from "@/actions/admin/configuracion.actions";

function StatusBadge({ configured }: { configured: boolean }) {
  return configured ? (
    <Badge variant="outline" className="gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
      <CheckCircle2 className="size-3" />
      Configurado
    </Badge>
  ) : (
    <Badge variant="outline" className="gap-1.5 border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400">
      <XCircle className="size-3" />
      Sin configurar
    </Badge>
  );
}

function SecretInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  helper,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  helper?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "••••••••••••"}
          className="pr-10 font-mono text-sm"
          autoComplete="off"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Ocultar" : "Mostrar"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
    </div>
  );
}

function DLocalGoCard({ status }: { status: ConfiguracionStatus["dlocalgo"] }) {
  const [apiKey, setApiKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [env, setEnv] = useState<string>(status.env ?? "sandbox");
  const [pending, startTransition] = useTransition();

  const isConfigured = status.apiKeySet && status.secretKeySet;

  function handleSave() {
    if (!apiKey.trim() && !secretKey.trim()) {
      toast.error("Ingresa al menos un campo para actualizar");
      return;
    }
    startTransition(async () => {
      const result = await saveDLocalGoConfig({ apiKey, secretKey, env });
      if (result.ok) {
        toast.success("Credenciales de dLocal Go guardadas");
        setApiKey("");
        setSecretKey("");
      } else {
        toast.error(result.error ?? "Error al guardar");
      }
    });
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-base">dLocal Go</CardTitle>
            <CardDescription>
              Pagos con tarjeta de crédito/débito para Ecuador y Latam.
            </CardDescription>
          </div>
          <StatusBadge configured={isConfigured} />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <SecretInput
          id="dlg-apikey"
          label="API Key"
          value={apiKey}
          onChange={setApiKey}
          placeholder={status.apiKeySet ? "••••••••••••  (ya configurado)" : "MyMerchantApiKey"}
          helper="Panel dLocal Go → Integrations → API Integration → API Key"
        />
        <SecretInput
          id="dlg-secret"
          label="Secret Key"
          value={secretKey}
          onChange={setSecretKey}
          placeholder={status.secretKeySet ? "••••••••••••  (ya configurado)" : "MyMerchantSecretKey"}
          helper="Panel dLocal Go → Integrations → API Integration → Secret Key"
        />
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="dlg-env" className="text-sm font-medium">Entorno</Label>
          <select
            id="dlg-env"
            value={env}
            onChange={(e) => setEnv(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="sandbox">Sandbox (pruebas)</option>
            <option value="production">Producción</option>
          </select>
        </div>
        <div className="flex items-center justify-between gap-3 pt-1">
          <a
            href="https://sandbox.dlocalgo.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="size-3" />
            Ir al panel dLocal Go
          </a>
          <Button size="sm" onClick={handleSave} disabled={pending}>
            {pending ? "Guardando…" : "Guardar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function CredencialesView({ configuracion }: { configuracion: ConfiguracionStatus }) {
  return (
    <div className="max-w-lg">
      <DLocalGoCard status={configuracion.dlocalgo} />
    </div>
  );
}
