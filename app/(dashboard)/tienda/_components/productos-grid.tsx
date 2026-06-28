"use client";

import { useState } from "react";
import {
  Cpu,
  Fingerprint,
  MessageCircle,
  ShoppingCart,
  UserCheck,
  Wifi,
  X,
  ZoomIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CheckoutDialog } from "./checkout-dialog";
import type { ProductoTienda } from "@/lib/types/database.types";

const WHATSAPP_NUMBER = "593980004089";

const PRODUCT_VISUALS: Record<
  string,
  { accent: string; bg: string; border: string; icon: React.ReactNode }
> = {
  "DS-K1A8503EF": {
    accent: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-500/10",
    border: "border-blue-200/60 dark:border-blue-500/20",
    icon: <Fingerprint className="size-7" />,
  },
  "DS-K1T8003EF": {
    accent: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    border: "border-emerald-200/60 dark:border-emerald-500/20",
    icon: <UserCheck className="size-7" />,
  },
  "DS-K1T320MFX": {
    accent: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-500/10",
    border: "border-violet-200/60 dark:border-violet-500/20",
    icon: <Cpu className="size-7" />,
  },
  "DS-K1T321MFWX": {
    accent: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-500/10",
    border: "border-amber-200/60 dark:border-amber-500/20",
    icon: <Wifi className="size-7" />,
  },
};

function getVisual(nombre: string) {
  for (const [key, val] of Object.entries(PRODUCT_VISUALS)) {
    if (nombre.includes(key)) return val;
  }
  return {
    accent: "text-muted-foreground",
    bg: "bg-muted",
    border: "border-border",
    icon: <Cpu className="size-7" />,
  };
}

function fmtPrice(n: number) {
  return new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" }).format(n);
}

type SpecsKey = {
  key: string;
  label: string;
  icon: React.ReactNode;
  format?: (v: unknown) => string;
};

const SPEC_KEYS: SpecsKey[] = [
  {
    key: "capacidad_facial",
    label: "Facial",
    icon: <UserCheck className="size-3.5" />,
    format: (v) => `${v} rostros`,
  },
  {
    key: "capacidad_huella",
    label: "Huella",
    icon: <Fingerprint className="size-3.5" />,
    format: (v) => `${v} huellas`,
  },
  {
    key: "conectividad",
    label: "Red",
    icon: <Wifi className="size-3.5" />,
    format: (v) => (Array.isArray(v) ? v.join(" / ") : String(v)),
  },
  {
    key: "garantia",
    label: "Garantía",
    icon: <ShoppingCart className="size-3.5" />,
    format: (v) => String(v),
  },
];

// ── Lightbox ──────────────────────────────────────────────────────────────────

interface LightboxProps {
  producto: ProductoTienda;
  onClose: () => void;
}

function Lightbox({ producto, onClose }: LightboxProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex w-full max-w-lg flex-col gap-4 overflow-hidden rounded-3xl bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
          aria-label="Cerrar"
        >
          <X className="size-4" />
        </button>

        {/* Image */}
        {producto.imagen_url ? (
          <div className="flex max-h-72 w-full items-center justify-center overflow-hidden bg-muted">
            <img
              src={producto.imagen_url}
              alt={producto.nombre}
              className="h-full w-full object-contain"
            />
          </div>
        ) : null}

        {/* Body */}
        <div className="flex flex-col gap-2 px-5 pb-5">
          <h3 className="text-base font-bold text-foreground">{producto.nombre}</h3>
          {producto.descripcion && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {producto.descripcion}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Product card ──────────────────────────────────────────────────────────────

interface ProductCardProps {
  producto: ProductoTienda;
  onComprar: (p: ProductoTienda) => void;
  onPreview: (p: ProductoTienda) => void;
  hayPasarela: boolean;
}

function ProductCard({ producto, onComprar, onPreview, hayPasarela }: ProductCardProps) {
  const visual = getVisual(producto.nombre);
  const specs = (producto.specs ?? {}) as Record<string, unknown>;
  const precio = Number(producto.precio);

  function handleWhatsApp() {
    const msg = encodeURIComponent(
      `Hola, me interesa comprar el ${producto.nombre} de Cactus Access. ¿Me pueden dar más información?`,
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
  }

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-shadow duration-200 hover:shadow-md">
      {/* Product visual header */}
      {producto.imagen_url ? (
        <button
          type="button"
          onClick={() => onPreview(producto)}
          className="relative h-44 w-full overflow-hidden bg-muted focus:outline-none"
          aria-label="Ver imagen completa"
        >
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            loading="lazy"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/20">
            <span className="flex size-9 items-center justify-center rounded-full bg-white/80 text-foreground opacity-0 shadow transition-opacity duration-200 group-hover:opacity-100 backdrop-blur-sm">
              <ZoomIn className="size-4" />
            </span>
          </span>
        </button>
      ) : (
        <div className={`relative flex items-center justify-center py-10 ${visual.bg}`}>
          <div className={`flex size-16 items-center justify-center rounded-2xl bg-white/80 dark:bg-black/20 shadow-sm ${visual.accent}`}>
            {visual.icon}
          </div>
        </div>
      )}

      {/* Body */}
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-bold text-foreground">{producto.nombre}</h3>
          {producto.descripcion && (
            <button
              type="button"
              onClick={() => onPreview(producto)}
              className="text-left text-xs leading-relaxed text-muted-foreground line-clamp-2 hover:text-foreground transition-colors"
              aria-label="Ver descripción completa"
            >
              {producto.descripcion}
            </button>
          )}
        </div>

        {/* Specs */}
        <ul className="flex flex-col gap-1.5">
          {SPEC_KEYS.filter((sk) => specs[sk.key] !== undefined).map((sk) => (
            <li key={sk.key} className="flex items-center gap-2">
              <span className={`shrink-0 ${visual.accent}`}>{sk.icon}</span>
              <span className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{sk.label}:</span>{" "}
                {sk.format ? sk.format(specs[sk.key]) : String(specs[sk.key])}
              </span>
            </li>
          ))}
        </ul>

        {/* Price + CTA */}
        <div className="mt-auto flex flex-col gap-3 pt-2">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold tabular-nums text-foreground">
              {fmtPrice(precio)}
            </span>
            <span className="text-xs text-muted-foreground">IVA inc.</span>
          </div>

          {hayPasarela ? (
            <Button
              onClick={() => onComprar(producto)}
              className="min-h-[44px] w-full justify-center rounded-xl"
            >
              <ShoppingCart className="size-4" />
              Comprar ahora
            </Button>
          ) : (
            <Button
              onClick={handleWhatsApp}
              className="min-h-[44px] w-full justify-center rounded-xl"
            >
              <MessageCircle className="size-4" />
              Consultar precio
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

// ── Grid ──────────────────────────────────────────────────────────────────────

interface ProductosGridProps {
  productos: ProductoTienda[];
  hayPasarela: boolean;
}

export function ProductosGrid({ productos, hayPasarela }: ProductosGridProps) {
  const [productoSeleccionado, setProductoSeleccionado] = useState<ProductoTienda | null>(null);
  const [productoPreview, setProductoPreview] = useState<ProductoTienda | null>(null);

  if (!productos.length) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <ShoppingCart className="size-7" />
        </span>
        <div>
          <p className="font-semibold text-foreground">Sin productos disponibles</p>
          <p className="text-sm text-muted-foreground">Vuelve pronto para ver el catálogo.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {productos.map((p) => (
          <ProductCard
            key={p.id}
            producto={p}
            onComprar={setProductoSeleccionado}
            onPreview={setProductoPreview}
            hayPasarela={hayPasarela}
          />
        ))}
      </div>

      <CheckoutDialog
        producto={productoSeleccionado}
        onClose={() => setProductoSeleccionado(null)}
        hayPasarela={hayPasarela}
      />

      {productoPreview && (
        <Lightbox
          producto={productoPreview}
          onClose={() => setProductoPreview(null)}
        />
      )}
    </>
  );
}
