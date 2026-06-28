"use client";

import { useState } from "react";
import { Loader2, AlertCircle, CreditCard, Building2, QrCode, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { iniciarPago, type IniciarPagoInput } from "@/actions/cliente/pago.actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface BotonespagoProps {
  planTipo: IniciarPagoInput["planTipo"];
  periodoFacturacion: IniciarPagoInput["periodoFacturacion"];
  monto: number;
  fechaHasta: string;
  limiteSucursales?: number;
  limiteEmpleados?: number;
  pasarelas: { dlocalgo: boolean };
  layout?: "row" | "col";
  className?: string;
}

const PASOS_DEUNA = [
  {
    num: 1,
    texto: 'Selecciona "Pagar en efectivo" en el checkout.',
    icon: <CreditCard className="size-4 text-[#00A3FF]" />,
  },
  {
    num: 2,
    texto: 'Elige "Almacenes TIA" y toca "Confirmar pago".',
    icon: <Building2 className="size-4 text-[#00A3FF]" />,
  },
  {
    num: 3,
    texto: "Aparecerán las opciones: app Banco Guayaquil, app Banco Pichincha o QR DeUna. Selecciona la que prefieras.",
    icon: <QrCode className="size-4 text-[#00A3FF]" />,
  },
];

export function BotonesPago({
  planTipo,
  periodoFacturacion,
  monto,
  fechaHasta,
  limiteSucursales,
  limiteEmpleados,
  pasarelas,
  layout = "col",
  className,
}: BotonespagoProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!pasarelas.dlocalgo) return null;

  async function pagar() {
    setLoading(true);
    setErrorMsg("");

    const result = await iniciarPago({
      planTipo,
      periodoFacturacion,
      monto,
      fechaHasta,
      limiteSucursales,
      limiteEmpleados,
    });

    if (result.ok && result.data) {
      window.location.href = result.data.checkoutUrl;
    } else {
      setLoading(false);
      setModalOpen(false);
      setErrorMsg(!result.ok ? result.error : "Error desconocido");
    }
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className={cn("flex gap-2", layout === "row" ? "flex-row" : "flex-col")}>
        <button
          type="button"
          onClick={() => { setErrorMsg(""); setModalOpen(true); }}
          className={cn(
            "relative flex min-h-[44px] flex-1 items-center justify-center gap-2.5 rounded-xl px-4 py-2.5",
            "border-2 border-[#00A3FF] bg-[#00A3FF]/10 text-sm font-semibold text-[#0082cc] transition-all duration-150",
            "hover:bg-[#00A3FF]/20 active:scale-[0.98]",
            "dark:text-[#00A3FF] dark:border-[#00A3FF]/60 dark:bg-[#00A3FF]/10 dark:hover:bg-[#00A3FF]/15",
          )}
          aria-label="Pagar con tarjeta o DeUna"
        >
          <DLocalGoLogo />
          <span>Pagar con tarjeta o DeUna</span>
        </button>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive"
        >
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <p className="text-center text-[11px] text-muted-foreground">
        Pago procesado de forma segura · SSL encriptado
      </p>

      {/* Modal informativo */}
      <Dialog open={modalOpen} onOpenChange={(o) => { if (!loading) setModalOpen(o); }}>
        <DialogContent className="max-w-sm gap-0 p-0 overflow-hidden">
          {/* Header */}
          <DialogHeader className="px-5 pt-5 pb-4 border-b border-border">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <DialogTitle className="text-base font-semibold leading-snug">
                  Formas de pago disponibles
                </DialogTitle>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Puedes pagar con tarjeta de crédito/débito directamente, o con tu banco vía DeUna.
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="flex flex-col gap-0 divide-y divide-border">
            {/* Opción tarjeta */}
            <div className="flex items-center gap-3 px-5 py-3.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#00A3FF]/10">
                <CreditCard className="size-4 text-[#00A3FF]" />
              </span>
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-medium text-foreground">Tarjeta de crédito / débito</p>
                <p className="text-xs text-muted-foreground">Visa, Mastercard — ingresa tus datos en el checkout.</p>
              </div>
            </div>

            {/* Separador con label */}
            <div className="relative flex items-center px-5 py-2 bg-muted/40">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Para pagar con DeUna (banco o QR)
              </span>
            </div>

            {/* Pasos DeUna */}
            <div className="flex flex-col gap-0 divide-y divide-border/60 px-5">
              {PASOS_DEUNA.map((paso) => (
                <div key={paso.num} className="flex items-start gap-3 py-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#00A3FF]/15 text-[11px] font-bold text-[#0082cc] dark:text-[#00A3FF] mt-0.5">
                    {paso.num}
                  </span>
                  <p className="text-sm text-foreground leading-relaxed">{paso.texto}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-4">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              disabled={loading}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
            >
              Cancelar
            </button>
            <Button
              onClick={pagar}
              disabled={loading}
              className="min-h-[44px] min-w-[140px] rounded-xl bg-[#00A3FF] text-white hover:bg-[#00A3FF]/90 active:scale-[0.98] transition-all duration-150 font-semibold"
            >
              {loading ? (
                <><Loader2 className="size-4 animate-spin" /> Conectando…</>
              ) : (
                "Ir a pagar"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DLocalGoLogo() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect width="24" height="24" rx="6" fill="#00A3FF" />
      <path
        d="M6 12C6 8.686 8.686 6 12 6h3v2.5h-3C10.067 8.5 8.5 10.067 8.5 12S10.067 15.5 12 15.5h3V18h-3C8.686 18 6 15.314 6 12Z"
        fill="white"
      />
      <path
        d="M15 8.5h1.5C18.433 8.5 20 10.067 20 12S18.433 15.5 16.5 15.5H15V13h1.5c.828 0 1.5-.672 1.5-1.5S16.328 10 15.5 10H15V8.5Z"
        fill="white"
        opacity="0.7"
      />
    </svg>
  );
}
