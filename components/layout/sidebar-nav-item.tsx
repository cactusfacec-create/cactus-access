"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SidebarNavItem({
  href,
  icon,
  label,
  exact = false,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  exact?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    // Si estamos en una sub-ruta dinámica (ej. /asistencias/123), el item
    // ya aparece "activo" por el startsWith de arriba, pero <Link> no
    // navegaría porque cree que ya estamos en /asistencias. Forzamos la
    // vuelta a la vista general con push + refresh.
    if (isActive && pathname !== href) {
      event.preventDefault();
      router.push(href);
      router.refresh();
    }
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={cn(
        "relative flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-sm transition-colors duration-200",
        isActive
          ? "bg-sidebar-accent/60 font-semibold text-sidebar-accent-foreground"
          : "font-medium text-sidebar-foreground/60 hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground",
      )}
    >
      {isActive ? (
        <span
          aria-hidden="true"
          className="absolute top-1/2 left-0 h-5 w-1 -translate-y-1/2 rounded-full bg-lime-400 animate-in fade-in zoom-in-75 duration-200"
        />
      ) : null}
      {icon}
      {label}
    </Link>
  );
}
