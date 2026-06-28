"use client";

import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Loader2,
  MapPin,
  MessageCircle,
  Minus,
  Phone,
  Plus,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { iniciarPagoProducto } from "@/actions/tienda.actions";
import type { ProductoTienda } from "@/lib/types/database.types";

const WHATSAPP_NUMBER = "593980004089";

const COUNTRIES = [
  { code: "593", flag: "🇪🇨", name: "Ecuador" },
  { code: "51",  flag: "🇵🇪", name: "Perú" },
  { code: "503", flag: "🇸🇻", name: "El Salvador" },
  { code: "507", flag: "🇵🇦", name: "Panamá" },
  { code: "57",  flag: "🇨🇴", name: "Colombia" },
  { code: "1",   flag: "🇺🇸", name: "EE.UU." },
];

interface CheckoutDialogProps {
  producto: ProductoTienda | null;
  onClose: () => void;
  hayPasarela: boolean;
}

function fmtPrice(n: number) {
  return new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" }).format(n);
}

export function CheckoutDialog({ producto, onClose, hayPasarela }: CheckoutDialogProps) {
  const [cantidad, setCantidad] = useState(1);
  const [direccion, setDireccion] = useState("");
  const [countryCode, setCountryCode] = useState("593");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [notas, setNotas] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isOpen = producto !== null;
  const precio = producto ? Number(producto.precio) : 0;
  const total = precio * cantidad;
  const fullPhone = `+${countryCode}${phoneDigits.replace(/^0+/, "")}`;

  function handleClose() {
    if (loading) return;
    setCantidad(1);
    setDireccion("");
    setCountryCode("593");
    setPhoneDigits("");
    setNotas("");
    setError("");
    onClose();
  }

  async function handlePago() {
    if (!producto) return;
    if (!direccion.trim()) { setError("Ingresa la dirección de entrega"); return; }
    if (!phoneDigits.trim()) { setError("Ingresa tu teléfono de contacto"); return; }

    setLoading(true);
    setError("");

    const result = await iniciarPagoProducto({
      idProducto: producto.id,
      cantidad,
      direccionEntrega: direccion,
      telefonoContacto: fullPhone,
      notas,
    });

    if (result.ok && result.data) {
      window.location.href = result.data.checkoutUrl;
      return;
    }

    setLoading(false);
    setError(!result.ok ? result.error : "Error desconocido");
  }

  function handleWhatsApp() {
    if (!producto) return;
    const msg = encodeURIComponent(
      `Hola, quiero comprar: ${producto.nombre} × ${cantidad}\n\nDirección de entrega: ${direccion || "(pendiente)"}\nTeléfono: ${phoneDigits ? fullPhone : "(pendiente)"}`,
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="max-w-md gap-0 overflow-hidden p-0">
        {/* Header */}
        <DialogHeader className="border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="size-4 text-muted-foreground" />
            <DialogTitle className="text-base font-semibold">Checkout</DialogTitle>
          </div>
          {producto && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {producto.nombre} · {fmtPrice(precio)} c/u
            </p>
          )}
        </DialogHeader>

        <div className="flex flex-col gap-5 px-5 py-5">
          {/* Cantidad */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-foreground">Cantidad</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCantidad((q) => Math.max(1, q - 1))}
                disabled={loading || cantidad <= 1}
                className="flex size-9 items-center justify-center rounded-xl border border-border bg-muted text-foreground transition-colors hover:bg-muted/80 disabled:opacity-40"
                aria-label="Reducir cantidad"
              >
                <Minus className="size-4" />
              </button>
              <span className="w-8 text-center text-lg font-bold tabular-nums text-foreground">
                {cantidad}
              </span>
              <button
                type="button"
                onClick={() => setCantidad((q) => q + 1)}
                disabled={loading}
                className="flex size-9 items-center justify-center rounded-xl border border-border bg-muted text-foreground transition-colors hover:bg-muted/80 disabled:opacity-40"
                aria-label="Aumentar cantidad"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>

          {/* Dirección */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="direccion" className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <MapPin className="size-3.5 text-muted-foreground" />
              Dirección de entrega
              <span className="text-destructive">*</span>
            </label>
            <textarea
              id="direccion"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              disabled={loading}
              rows={2}
              placeholder="Ej. Av. Principal 123, Quito, Ecuador"
              className="min-h-[68px] w-full resize-none rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            />
          </div>

          {/* Teléfono */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="telefono-digits" className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Phone className="size-3.5 text-muted-foreground" />
              Teléfono de contacto
              <span className="text-destructive">*</span>
            </label>
            <div className="flex overflow-hidden rounded-xl border border-input bg-background focus-within:ring-2 focus-within:ring-ring">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                disabled={loading}
                aria-label="Código de país"
                className="shrink-0 border-r border-input bg-muted px-2 py-2 text-sm text-foreground focus:outline-none disabled:opacity-50"
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
                disabled={loading}
                placeholder="0998765432"
                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
              />
            </div>
          </div>

          {/* Notas */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="notas" className="text-xs font-medium text-muted-foreground">
              Notas adicionales (opcional)
            </label>
            <input
              id="notas"
              type="text"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              disabled={loading}
              placeholder="Instrucciones de entrega, horario, etc."
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            />
          </div>

          {/* Resumen de precio */}
          <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
            <span className="text-sm text-muted-foreground">
              {fmtPrice(precio)} × {cantidad}
            </span>
            <span className="text-lg font-bold tabular-nums text-foreground">
              {fmtPrice(total)}
            </span>
          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-xs text-destructive"
            >
              <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
          >
            Cancelar
          </button>

          {hayPasarela ? (
            <Button
              onClick={handlePago}
              disabled={loading}
              className="min-h-[44px] min-w-[160px] rounded-xl bg-[#00A3FF] font-semibold text-white hover:bg-[#00A3FF]/90 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Conectando…
                </>
              ) : (
                <>
                  <CreditCard className="size-4" />
                  Pagar {fmtPrice(total)}
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleWhatsApp}
              disabled={loading}
              className="min-h-[44px] min-w-[160px] rounded-xl"
            >
              <MessageCircle className="size-4" />
              Pedir por WhatsApp
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function PagoExitosoToast() {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-emerald-200/60 bg-emerald-50 px-5 py-4 dark:border-emerald-500/20 dark:bg-emerald-500/8">
      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
          ¡Pago recibido!
        </p>
        <p className="text-xs leading-relaxed text-emerald-700 dark:text-emerald-400">
          Tu pedido ha sido registrado. Nos comunicaremos contigo al teléfono indicado para coordinar la entrega.
        </p>
      </div>
    </div>
  );
}

export function PagoCanceladoBanner() {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-amber-200/60 bg-amber-50 px-5 py-4 dark:border-amber-500/20 dark:bg-amber-500/8">
      <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
          Pago no completado
        </p>
        <p className="text-xs leading-relaxed text-amber-700 dark:text-amber-400">
          El pago fue cancelado o no se procesó. Puedes intentarlo de nuevo cuando quieras.
        </p>
      </div>
    </div>
  );
}
