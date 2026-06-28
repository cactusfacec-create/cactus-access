import { Fragment } from "react";
import { cn } from "@/lib/utils";
import type { Marca } from "@/lib/asistencia";

export function MarcasTimeline({ marcas }: { marcas: Marca[] }) {
  return (
    <div className="flex w-full items-center justify-center">
      {marcas.map((marca, index) => (
        <Fragment key={marca.label}>
          {index > 0 ? (
            <span
              aria-hidden="true"
              className={cn(
                "h-px flex-1",
                marca.hora ? "bg-border" : "bg-border/40 border-t border-dashed border-border/60 h-0",
              )}
            />
          ) : null}
          <div
            className="group relative flex flex-col items-center gap-1 px-1 text-center animate-in fade-in zoom-in-75 duration-200 fill-mode-backwards"
            style={{ animationDelay: `${index * 75}ms` }}
          >
            {marca.horaEsperada ? (
              <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 rounded-lg border border-border bg-popover px-2.5 py-1.5 text-center shadow-md opacity-0 transition-opacity duration-150 group-hover:opacity-100 whitespace-nowrap">
                <span className="block text-[10px] text-muted-foreground">programado</span>
                <span className="block text-xs font-semibold text-popover-foreground">{marca.horaEsperada}</span>
              </div>
            ) : null}
            <span
              aria-hidden="true"
              className={cn(
                "size-3 rounded-full ring-2 transition-transform duration-150 hover:scale-125",
                marca.hora
                  ? marca.nota?.tono === "warn"
                    ? "bg-amber-400 ring-amber-400/20 dark:bg-amber-500 dark:ring-amber-500/20"
                    : marca.nota?.tono === "info"
                      ? "bg-sky-400 ring-sky-400/20 dark:bg-sky-500 dark:ring-sky-500/20"
                      : "bg-emerald-400 ring-emerald-400/20 dark:bg-emerald-500 dark:ring-emerald-500/20"
                  : "bg-transparent ring-border",
              )}
            />
            <span className="text-[11px] font-medium whitespace-nowrap text-muted-foreground">
              {marca.label}
            </span>
            <span className={cn(
              "text-xs font-semibold whitespace-nowrap",
              marca.hora ? "text-foreground" : "text-muted-foreground/40",
            )}>
              {marca.hora ?? "—"}
            </span>
            {marca.nota ? (
              <span
                className={cn(
                  "text-[11px] font-medium whitespace-nowrap",
                  marca.nota.tono === "warn"
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-sky-600 dark:text-sky-400",
                )}
              >
                {marca.nota.texto}
              </span>
            ) : null}
          </div>
        </Fragment>
      ))}
    </div>
  );
}
