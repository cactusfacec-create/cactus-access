import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface HeroCardProps {
  variant?: "primary" | "accent";
  title: string;
  value: string;
  description?: string;
  actions?: ReactNode;
  /** Si se provee, toda la tarjeta navega a esta URL al hacer clic. */
  href?: string;
  className?: string;
}

/**
 * Tarjeta de marca con fondo sólido (bg-primary/bg-accent). Úsala como máximo
 * una vez por vista — es el único elemento que rompe la monotonía de tarjetas
 * blancas; más de una por vista diluye la jerarquía visual (ver cactus-style.md §3).
 */
export function HeroCard({
  variant = "primary",
  title,
  value,
  description,
  actions,
  href,
  className,
}: HeroCardProps) {
  const isAccent = variant === "accent";

  const classes = cn(
    "relative flex flex-col justify-between overflow-hidden rounded-2xl p-5 shadow-sm transition-shadow duration-200 hover:shadow-lg animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-backwards",
    isAccent ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground",
    href && "cursor-pointer",
    className,
  );

  const content = (
    <>
      <div
        className={cn(
          "pointer-events-none absolute -right-10 -top-16 size-48 rounded-full border-[20px]",
          isAccent ? "border-accent-foreground/10" : "border-primary-foreground/10",
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute -bottom-12 -left-8 size-32 rounded-full border-[14px]",
          isAccent ? "border-accent-foreground/10" : "border-primary-foreground/10",
        )}
      />
      <div className="relative z-10 flex flex-col gap-1">
        <span className="text-xs font-medium opacity-80">{title}</span>
        <span className="text-3xl font-bold tracking-tight">{value}</span>
        {description ? <p className="text-sm opacity-80">{description}</p> : null}
      </div>
      {actions ? <div className="relative z-10 mt-4 flex gap-2">{actions}</div> : null}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return <section className={classes}>{content}</section>;
}

export function HeroPillButton({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary-foreground/90 px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
