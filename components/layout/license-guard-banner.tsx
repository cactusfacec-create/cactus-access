"use client";

import { useMemo, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { AlertTriangle, X } from "lucide-react";
import Link from "next/link";
import type { LicenseUsage } from "@/lib/types/domain";

const LABEL: Record<LicenseUsage["recurso"], string> = {
  empleados: "empleados",
  sucursales: "sucursales",
};

const STORAGE_KEY = "cactus:licencia-banner-descartados";
const CHANGE_EVENT = "cactus:licencia-banner-cambio";

function leerDescartadosRaw(): string {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function suscribir(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  return () => window.removeEventListener(CHANGE_EVENT, callback);
}

function snapshotServidor() {
  return "[]";
}

export function LicenseGuardBanner({ usages }: { usages: LicenseUsage[] }) {
  const pathname = usePathname();
  // useSyncExternalStore lee sessionStorage de forma segura para SSR: en el
  // servidor usa snapshotServidor ("[]"), y tras hidratar React reconcilia
  // con el valor real del cliente sin el warning de "setState en un efecto"
  // ni un mismatch de hidratación. El cierre persiste mientras dure la
  // pestaña del navegador.
  const raw = useSyncExternalStore(suscribir, leerDescartadosRaw, snapshotServidor);
  const descartados = useMemo(() => new Set<string>(JSON.parse(raw) as string[]), [raw]);

  // El límite de recursos solo es accionable desde el Dashboard y Sucursales;
  // en vistas operativas (Asistencias, No Reconocidos, Empleados, Empresa)
  // solo generaría ruido visual repetido en cada pantalla.
  const visibleEnRuta = pathname === "/dashboard" || pathname.startsWith("/sucursales");
  if (!visibleEnRuta) return null;

  const relevantes = usages.filter(
    (usage) => usage.ratio >= 0.9 && usage.limite > 0 && !descartados.has(usage.recurso),
  );
  if (relevantes.length === 0) return null;

  function descartar(recurso: string) {
    const next = new Set(descartados);
    next.add(recurso);
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }

  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive animate-in fade-in slide-in-from-top-2 duration-300 fill-mode-backwards" style={{ animationDelay: "50ms" }}>
      {relevantes.map((usage, index) => {
        const alcanzado = usage.actual >= usage.limite;
        return (
          <div
            key={usage.recurso}
            className="flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-300 fill-mode-backwards"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <AlertTriangle className="size-4 shrink-0" />
            <span className="flex-1">
              {alcanzado
                ? `Has alcanzado el límite de ${LABEL[usage.recurso]} de tu plan (${usage.actual}/${usage.limite}).`
                : `Estás cerca del límite de ${LABEL[usage.recurso]} de tu plan (${usage.actual}/${usage.limite}).`}
            </span>
            {alcanzado ? (
              <Link
                href="/planes"
                className="font-medium underline underline-offset-2 transition-colors hover:text-destructive/80"
              >
                Mejorar plan
              </Link>
            ) : null}
            <button
              type="button"
              onClick={() => descartar(usage.recurso)}
              aria-label="Cerrar notificación"
              className="shrink-0 rounded-full p-1 text-destructive/70 transition-colors duration-200 hover:bg-destructive/15 hover:text-destructive"
            >
              <X className="size-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
