"use client";

import { useState, useTransition } from "react";
import type { ReactElement, ReactNode } from "react";
import Link from "next/link";
import { BookOpen, CheckCircle, ChevronLeft, LifeBuoy, Lightbulb, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { buildWhatsAppLink } from "@/lib/soporte";
import { submitSugerencia } from "@/actions/sugerencias.actions";

type View = "menu" | "suggest" | "success";

const DEFAULT_TRIGGER = (
  <button className="relative flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/60 transition-colors duration-200 hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground">
    <LifeBuoy className="size-4" />
    Soporte
  </button>
);

export function SoporteDialog({ trigger = DEFAULT_TRIGGER }: { trigger?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("menu");
  const [mensaje, setMensaje] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleClose(v: boolean) {
    setOpen(v);
    if (!v) setTimeout(() => { setView("menu"); setMensaje(""); }, 200);
  }

  function handleSuggest() {
    startTransition(async () => {
      const res = await submitSugerencia({ mensaje });
      if (res.ok) {
        setView("success");
      } else {
        toast.error(res.error ?? "No se pudo enviar");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger render={trigger as ReactElement} />
      <DialogContent>
        {view === "menu" && (
          <>
            <DialogHeader>
              <DialogTitle>¿Necesitas ayuda?</DialogTitle>
              <DialogDescription>
                Consulta la guía de uso o escríbenos directamente por WhatsApp.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2.5">
              <Button
                variant="outline"
                render={<Link href="/guia" onClick={() => setOpen(false)} />}
                nativeButton={false}
                className="h-auto w-full justify-start gap-3 rounded-xl border-border px-4 py-3.5"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <BookOpen className="size-4" />
                </span>
                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-sm font-semibold text-foreground">Guía de uso</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    Dispositivos, asistencias, jornadas y más
                  </span>
                </div>
              </Button>

              <Button
                render={<a href={buildWhatsAppLink()} target="_blank" rel="noopener noreferrer" />}
                nativeButton={false}
                className="h-auto w-full justify-start gap-3 rounded-xl px-4 py-3.5"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/20">
                  <MessageCircle className="size-4" />
                </span>
                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-sm font-semibold">Hablar por WhatsApp</span>
                  <span className="text-xs font-normal opacity-70">
                    Un agente te responde a la brevedad
                  </span>
                </div>
              </Button>

              <Button
                variant="outline"
                onClick={() => setView("suggest")}
                className="h-auto w-full justify-start gap-3 rounded-xl border-border px-4 py-3.5"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
                  <Lightbulb className="size-4" />
                </span>
                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-sm font-semibold text-foreground">Sugerir una mejora</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    Cuéntanos qué mejorarías en Cactus
                  </span>
                </div>
              </Button>
            </div>
          </>
        )}

        {view === "suggest" && (
          <>
            <DialogHeader>
              <button
                type="button"
                onClick={() => setView("menu")}
                className="mb-1 flex w-fit items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <ChevronLeft className="size-3.5" />
                Volver
              </button>
              <DialogTitle>Sugerir una mejora</DialogTitle>
              <DialogDescription>
                Tu sugerencia llega directamente al equipo de Cactus.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3">
              <Textarea
                placeholder="Ej: sería útil poder exportar las asistencias por departamento…"
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                rows={4}
                maxLength={1000}
                className="resize-none"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{mensaje.length}/1000</span>
                <Button
                  onClick={handleSuggest}
                  disabled={isPending || mensaje.trim().length < 10}
                >
                  {isPending ? "Enviando…" : "Enviar sugerencia"}
                </Button>
              </div>
            </div>
          </>
        )}

        {view === "success" && (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="size-7" />
            </span>
            <div className="flex flex-col gap-1">
              <p className="font-semibold text-foreground">¡Gracias por tu sugerencia!</p>
              <p className="text-sm text-muted-foreground">
                El equipo de Cactus la revisará y tomará en cuenta para futuras mejoras.
              </p>
            </div>
            <Button variant="outline" onClick={() => handleClose(false)}>
              Cerrar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
