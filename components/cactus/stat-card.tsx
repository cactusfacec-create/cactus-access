import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaVariant?: "default" | "warn" | "error";
  /** Secondary muted text shown below the value (neutral, no color). */
  note?: string;
  icon?: ReactNode;
  tone?: "neutral" | "warn" | "error" | "success" | "extra";
  /** Si se provee, toda la tarjeta navega a esta URL al hacer clic. */
  href?: string;
  className?: string;
  /** Delay de entrada en ms — úsalo para crear efecto stagger en grids. */
  animationDelay?: number;
}

export function StatCard({ label, value, delta, deltaVariant = "default", note, icon, tone = "neutral", href, className, animationDelay }: StatCardProps) {
  const classes = cn(
    "group flex flex-col gap-2 rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow duration-200 hover:shadow-md animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-backwards",
    href && "cursor-pointer hover:border-primary/30",
    className,
  );
  const animStyle = animationDelay ? { animationDelay: `${animationDelay}ms` } : undefined;

  const content = (
    <>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <div className="flex items-center gap-1">
          {icon ? (
            <span
              className={cn(
                "flex size-8 items-center justify-center rounded-full",
                tone === "warn"    ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                : tone === "error"   ? "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400"
                : tone === "success" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
                : tone === "extra"   ? "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400"
                : "bg-primary/15 text-accent",
              )}
            >
              {icon}
            </span>
          ) : null}
          {href ? (
            <ChevronRight className="size-4 text-muted-foreground/0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
          ) : null}
        </div>
      </div>
      <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">{value}</span>
      {note ? (
        <span className="text-xs text-muted-foreground">{note}</span>
      ) : null}
      {delta ? (
        <span className={cn(
          "text-xs font-medium",
          deltaVariant === "warn"  ? "text-amber-600 dark:text-amber-400"
          : deltaVariant === "error" ? "text-red-600 dark:text-red-400"
          : "text-accent"
        )}>{delta}</span>
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes} style={animStyle}>
        {content}
      </Link>
    );
  }

  return <section className={classes} style={animStyle}>{content}</section>;
}
