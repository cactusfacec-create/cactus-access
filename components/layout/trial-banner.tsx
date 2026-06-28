"use client";

import { useMemo, useSyncExternalStore, useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "cactus:trial-banner-cerrado";
const CHANGE_EVENT = "cactus:trial-banner-cambio";

function leerFechaCierrRaw() {
  try { return window.sessionStorage.getItem(STORAGE_KEY) ?? ""; } catch { return ""; }
}
function suscribir(cb: () => void) {
  window.addEventListener(CHANGE_EVENT, cb);
  return () => window.removeEventListener(CHANGE_EVENT, cb);
}
function snapshotServidor() { return ""; }

export function TrialBanner({ diasRestantes }: { diasRestantes: number }) {
  const hoy = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const cerradoRaw = useSyncExternalStore(suscribir, leerFechaCierrRaw, snapshotServidor);
  const [barFilled, setBarFilled] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setBarFilled(true), 500);
    return () => clearTimeout(t);
  }, []);

  if (cerradoRaw === hoy) return null;

  const urgente = diasRestantes <= 3;
  const moderado = diasRestantes > 3 && diasRestantes <= 7;
  const porcentaje = Math.max(0, Math.min(100, (diasRestantes / 15) * 100));

  function cerrar() {
    window.sessionStorage.setItem(STORAGE_KEY, hoy);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }

  const mensaje =
    diasRestantes <= 0
      ? "¡Tu prueba gratuita vence hoy!"
      : urgente
        ? `Solo quedan ${diasRestantes} día${diasRestantes !== 1 ? "s" : ""} de prueba`
        : `Prueba gratuita en curso`;

  const tono = urgente
    ? {
        wrap: "border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/8",
        icon: "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400",
        text: "text-red-900 dark:text-red-200",
        sub: "text-red-600 dark:text-red-400",
        bar: "bg-red-500",
        barTrack: "bg-red-200/60 dark:bg-red-500/20",
        btn: "bg-red-500 text-white hover:bg-red-600",
        close: "text-red-600/60 hover:text-red-700 dark:text-red-400/60 dark:hover:text-red-300",
      }
    : moderado
      ? {
          wrap: "border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/8",
          icon: "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
          text: "text-amber-900 dark:text-amber-200",
          sub: "text-amber-600 dark:text-amber-400",
          bar: "bg-amber-400",
          barTrack: "bg-amber-200/60 dark:bg-amber-500/20",
          btn: "bg-amber-500 text-white hover:bg-amber-600",
          close: "text-amber-600/60 hover:text-amber-700 dark:text-amber-400/60 dark:hover:text-amber-300",
        }
      : {
          wrap: "border-lime-200 bg-lime-50 dark:border-lime-500/20 dark:bg-lime-500/8",
          icon: "bg-lime-100 text-lime-700 dark:bg-lime-500/20 dark:text-lime-300",
          text: "text-lime-900 dark:text-lime-200",
          sub: "text-lime-600 dark:text-lime-400",
          bar: "bg-lime-500",
          barTrack: "bg-lime-200/60 dark:bg-lime-500/20",
          btn: "bg-lime-500 text-white hover:bg-lime-600",
          close: "text-lime-600/60 hover:text-lime-800 dark:text-lime-400/60 dark:hover:text-lime-300",
        };

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("overflow-hidden rounded-2xl border animate-in fade-in slide-in-from-top-2 duration-300", tono.wrap)}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-lg", tono.icon)}>
          <Sparkles className="size-3.5" />
        </span>

        <div className="flex min-w-0 flex-1 items-baseline gap-2">
          <span className={cn("text-sm font-semibold", tono.text)}>{mensaje}</span>
          <span className={cn("text-xs font-medium tabular-nums", tono.sub)}>
            {diasRestantes} / 15 días restantes
          </span>
        </div>

        <Link
          href="/planes"
          className={cn(
            "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors duration-150",
            tono.btn,
          )}
        >
          Ver planes
        </Link>

        <button
          type="button"
          onClick={cerrar}
          aria-label="Cerrar notificación de prueba"
          className={cn(
            "shrink-0 rounded-full p-1 transition-colors duration-150",
            tono.close,
          )}
        >
          <X className="size-3.5" />
        </button>
      </div>

      <div
        className={cn("h-0.5 w-full", tono.barTrack)}
        role="progressbar"
        aria-valuenow={diasRestantes}
        aria-valuemin={0}
        aria-valuemax={15}
        aria-label={`${diasRestantes} días restantes de prueba`}
      >
        <div
          className={cn("h-full transition-[width] ease-out", tono.bar)}
          style={{
            width: barFilled ? `${porcentaje}%` : "0%",
            transitionDuration: barFilled ? "800ms" : "0ms",
          }}
        />
      </div>
    </div>
  );
}
