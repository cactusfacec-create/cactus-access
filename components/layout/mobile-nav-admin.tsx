"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, LayoutGrid, Menu, X, CreditCard, ShieldCheck, LogIn, Activity, KeyRound } from "lucide-react";
import { CactusIcon } from "@/components/cactus/cactus-icon";
import { signOut } from "@/actions/auth.actions";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { SignOutButton } from "@/components/cactus/sign-out-button";

export function MobileNavAdmin() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-sidebar px-4 lg:hidden">
      <button
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
        className="flex size-9 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-secondary"
      >
        <Menu className="size-5" />
      </button>
      <CactusIcon className="size-8" />
      <span className="text-sm font-semibold text-foreground">Cactus</span>
      <div className="ml-auto">
        <ThemeToggle />
      </div>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <aside className="animate-in slide-in-from-left fixed inset-y-0 left-0 z-50 flex w-64 flex-col gap-1 bg-sidebar p-4 shadow-2xl duration-200">
            <div className="mb-4 flex items-center gap-2 px-1">
              <CactusIcon className="size-8" />
              <div className="flex flex-1 flex-col">
                <span className="text-sm font-semibold text-sidebar-foreground">
                  Cactus
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">
                  Super Admin
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Cerrar menú"
                className="flex size-8 items-center justify-center rounded-xl text-sidebar-foreground hover:bg-sidebar-accent/40"
              >
                <X className="size-4" />
              </button>
            </div>

            <span className="px-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Menú principal
            </span>
            <nav className="mt-1 flex flex-col gap-1">
              {[
                { href: "/admin", icon: <Building2 className="size-4" />, label: "Empresas" },
                { href: "/admin/planes", icon: <LayoutGrid className="size-4" />, label: "Planes" },
                { href: "/admin/pagos", icon: <CreditCard className="size-4" />, label: "Transacciones" },
                { href: "/admin/administradores", icon: <ShieldCheck className="size-4" />, label: "Administradores" },
                { href: "/admin/configuracion", icon: <KeyRound className="size-4" />, label: "Credenciales" },
                { href: "/admin/accesos", icon: <LogIn className="size-4" />, label: "Ingresos" },
                { href: "/admin/modificaciones", icon: <Activity className="size-4" />, label: "Modificaciones" },
              ].map(({ href, icon, label }) => {
                const isActive = href === "/admin" ? pathname === href : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "relative flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-sm transition-colors duration-200",
                      isActive
                        ? "bg-sidebar-accent/60 font-semibold text-sidebar-accent-foreground"
                        : "font-medium text-sidebar-foreground/60 hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground",
                    )}
                  >
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="absolute top-1/2 left-0 h-5 w-1 -translate-y-1/2 rounded-full bg-lime-400"
                      />
                    )}
                    {icon}
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto">
              <form action={signOut} className="w-full">
                <SignOutButton variant="outline" />
              </form>
            </div>
          </aside>
        </>
      )}
    </header>
  );
}
