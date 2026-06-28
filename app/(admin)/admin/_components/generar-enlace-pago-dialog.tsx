"use client";

import { useState, useTransition } from "react";
import { Link2, Copy, CheckCheck, ExternalLink, Loader2 } from "lucide-react";
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
import { crearEnlacePago } from "@/actions/admin/payment-gateway.actions";
import { toast } from "sonner";

const PLAN_OPTIONS = [
  { label: "Pro", value: "pro" },
  { label: "Max", value: "max" },
  { label: "Personalizado", value: "personalizado" },
];

const PERIODO_OPTIONS = [
  { label: "Trimestral (3 meses)", value: "trimestral" },
  { label: "Semestral (6 meses)", value: "semestral" },
  { label: "Anual (12 meses)", value: "anual" },
];

const PERIODO_MESES: Record<string, number> = {
  trimestral: 3,
  semestral: 6,
  anual: 12,
};

function addMonths(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

export function GenerarEnlacePagoDialog({
  idEmpresa,
  nombreEmpresa,
  dlocalgoDisponible,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: {
  idEmpresa: string;
  nombreEmpresa: string;
  dlocalgoDisponible: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen! : internalOpen;
  const setOpen = isControlled
    ? (next: boolean) => controlledOnOpenChange?.(next)
    : setInternalOpen;

  const [pending, startTransition] = useTransition();
  const [plan, setPlan] = useState("pro");
  const [periodo, setPeriodo] = useState("anual");
  const [monto, setMonto] = useState("");
  const [fechaHasta, setFechaHasta] = useState(() => addMonths(12));
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [copied, setCopied] = useState(false);

  function handlePeriodoChange(p: string) {
    setPeriodo(p);
    setFechaHasta(addMonths(PERIODO_MESES[p] ?? 12));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await crearEnlacePago({
        idEmpresa,
        monto: parseFloat(monto) || 0,
        planTipo: plan as "pro" | "max" | "personalizado",
        periodoFacturacion: periodo as "trimestral" | "semestral" | "anual",
        fechaHasta,
      });

      if (result.ok && result.data) {
        setGeneratedUrl(result.data.checkoutUrl);
        toast.success("Enlace generado correctamente");
      } else {
        toast.error(!result.ok ? result.error : "No se pudo generar el enlace");
      }
    });
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setGeneratedUrl(""); }}>
      {!isControlled && (
        <DialogTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label="Generar enlace de pago online">
              <Link2 className="size-4" />
            </Button>
          }
        />
      )}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Enlace de pago — {nombreEmpresa}</DialogTitle>
        </DialogHeader>

        {!dlocalgoDisponible ? (
          <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
            <p className="font-medium">Pasarela no configurada</p>
            <p className="mt-1 text-xs">
              Agrega las credenciales de dLocal Go en Configuración para activar cobros online.
            </p>
            <code className="mt-2 block rounded bg-amber-100 px-2 py-1 font-mono text-xs dark:bg-amber-900/40">
              DLOCALGO_API_KEY, DLOCALGO_SECRET_KEY
            </code>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="gp-plan" className="text-sm font-medium">Plan</Label>
                <select
                  id="gp-plan"
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  className="h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {PLAN_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="gp-periodo" className="text-sm font-medium">Período</Label>
                <select
                  id="gp-periodo"
                  value={periodo}
                  onChange={(e) => handlePeriodoChange(e.target.value)}
                  className="h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {PERIODO_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="gp-monto" className="text-sm font-medium">Monto a cobrar ($) *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                <Input
                  id="gp-monto"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  className="pl-7"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="gp-hasta" className="text-sm font-medium">Acceso hasta *</Label>
              <Input
                id="gp-hasta"
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                required
              />
            </div>

            {generatedUrl && (
              <div className="flex flex-col gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-950/30">
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  Enlace generado — compártelo con el cliente
                </p>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={generatedUrl}
                    className="min-w-0 flex-1 rounded-lg border border-emerald-200 bg-white px-2.5 py-1.5 font-mono text-xs text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                  />
                  <Button type="button" size="icon-sm" variant="outline" onClick={handleCopy} aria-label="Copiar enlace">
                    {copied ? <CheckCheck className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                  </Button>
                  <Button type="button" size="icon-sm" variant="outline" onClick={() => window.open(generatedUrl, "_blank")} aria-label="Abrir enlace">
                    <ExternalLink className="size-3.5" />
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cerrar</Button>
              {!generatedUrl && (
                <Button type="submit" disabled={pending}>
                  {pending ? <><Loader2 className="size-4 animate-spin" /> Generando…</> : "Generar enlace"}
                </Button>
              )}
              {generatedUrl && (
                <Button type="button" variant="outline" onClick={() => setGeneratedUrl("")}>
                  Nuevo enlace
                </Button>
              )}
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
