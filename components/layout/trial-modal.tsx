"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "cactus:trial-modal-descartado";

export function TrialModal({ diasRestantes }: { diasRestantes: number }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hoy = new Date().toISOString().slice(0, 10);
    const descartado = window.sessionStorage.getItem(STORAGE_KEY);
    if (descartado !== hoy) {
      // Pequeño retraso para que no interrumpa la carga inicial
      const t = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  if (!open) return null;

  function descartar() {
    const hoy = new Date().toISOString().slice(0, 10);
    window.sessionStorage.setItem(STORAGE_KEY, hoy);
    setOpen(false);
  }

  const titulo =
    diasRestantes <= 0
      ? "¡Tu prueba gratuita vence hoy!"
      : diasRestantes === 1
        ? "¡Tu prueba vence mañana!"
        : `¡Tu prueba vence en ${diasRestantes} días!`;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        aria-hidden="true"
        onClick={descartar}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="trial-modal-title"
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 px-4 animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-[300ms]"
      >
        <div className="relative flex flex-col gap-6 rounded-3xl bg-card p-8 shadow-2xl ring-2 ring-destructive/20">
          {/* Cerrar */}
          <button
            type="button"
            onClick={descartar}
            aria-label="Cerrar"
            className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>

          {/* Icono de urgencia */}
          <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive animate-in fade-in zoom-in-75 duration-300 fill-mode-backwards" style={{ animationDelay: "100ms" }}>
            <AlertTriangle className="size-7" />
          </div>

          {/* Días restantes destacados */}
          {diasRestantes > 0 && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-backwards" style={{ animationDelay: "180ms" }}>
              <span className="text-5xl font-black tabular-nums text-foreground">
                {diasRestantes}
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">
                  día{diasRestantes !== 1 ? "s" : ""}
                </span>
                <span className="text-xs text-muted-foreground">restantes</span>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-backwards" style={{ animationDelay: "260ms" }}>
            <h2 id="trial-modal-title" className="text-xl font-bold text-foreground">
              {titulo}
            </h2>
            <p className="text-sm text-muted-foreground">
              Contrata un plan y mantén el acceso completo a Cactus Access sin interrupciones.
            </p>
          </div>

          <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-backwards" style={{ animationDelay: "340ms" }}>
            <Button
              render={<Link href="/planes" onClick={descartar} />}
              nativeButton={false}
              className="w-full justify-center gap-2 rounded-full bg-lime-400 text-emerald-950 hover:bg-lime-400/90"
            >
              Contratar un plan
              <ArrowRight className="size-4" />
            </Button>
            <button
              type="button"
              onClick={descartar}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground hover:underline underline-offset-2"
            >
              Recordarme mañana
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
