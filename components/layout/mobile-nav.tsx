"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";
import {
  Building2,
  CalendarDays,
  ChevronDown,
  Clock,
  CreditCard,
  FileCheck2,
  LayoutDashboard,
  Menu,
  Settings,
  ShoppingBag,
  UserSearch,
  Users,
  X,
} from "lucide-react";
import { CactusIcon } from "@/components/cactus/cactus-icon";
import { signOut } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/cactus/sign-out-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SoporteDialog } from "@/components/layout/soporte-dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", icon: <LayoutDashboard className="size-4" />, label: "Dashboard" },
  { href: "/sucursales", icon: <Building2 className="size-4" />, label: "Sucursales" },
  { href: "/empleados", icon: <Users className="size-4" />, label: "Empleados" },
  {
    href: "/registros-no-reconocidos",
    icon: <UserSearch className="size-4" />,
    label: "No Reconocidos",
  },
  { href: "/asistencias", icon: <Clock className="size-4" />, label: "Asistencias" },
  { href: "/justificaciones", icon: <FileCheck2 className="size-4" />, label: "Justificaciones" },
  { href: "/calendario", icon: <CalendarDays className="size-4" />, label: "Calendario" },
  { href: "/tienda", icon: <ShoppingBag className="size-4" />, label: "Tienda" },
];

function getInitials(nombre: string) {
  const palabras = nombre.trim().split(/\s+/).filter(Boolean);
  if (palabras.length === 0) return "?";
  if (palabras.length === 1) return palabras[0].slice(0, 2).toUpperCase();
  return (palabras[0][0] + palabras[1][0]).toUpperCase();
}

function MobileNavLink({
  href,
  icon,
  label,
  onClose,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    if (isActive && pathname !== href) {
      e.preventDefault();
      router.push(href);
      router.refresh();
    }
    onClose();
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
}

export function MobileNav({ nombreEmpresa }: { nombreEmpresa: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-border bg-sidebar px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <CactusIcon className="size-8" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-tight text-sidebar-foreground">Cactus</span>
            <span className="text-[10px] leading-tight text-muted-foreground">Control de asistencia</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            onClick={() => setOpen(true)}
            aria-label="Abrir menú"
            className="flex size-9 items-center justify-center rounded-lg text-sidebar-foreground transition-colors hover:bg-sidebar-accent/40"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </header>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <aside className="animate-in slide-in-from-left fixed inset-y-0 left-0 z-50 flex w-72 flex-col gap-1 overflow-y-auto bg-sidebar p-4 shadow-2xl duration-200">
            <div className="mb-2 flex items-center gap-2 px-1 py-2">
              <span className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                C
              </span>
              <span className="flex-1 truncate text-sm font-semibold text-sidebar-foreground">
                Cactus Access
              </span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Cerrar menú"
                className="flex size-8 items-center justify-center rounded-lg text-sidebar-foreground transition-colors hover:bg-sidebar-accent/40"
              >
                <X className="size-4" />
              </button>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button className="mb-2 flex w-full items-center gap-2 rounded-2xl px-2 py-2 text-left transition-colors duration-200 hover:bg-sidebar-accent/40">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground">
                      {getInitials(nombreEmpresa)}
                    </span>
                    <span className="flex-1 truncate text-sm font-medium text-sidebar-foreground">
                      {nombreEmpresa}
                    </span>
                    <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                  </button>
                }
              />
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem
                  render={<Link href="/empresa" onClick={() => setOpen(false)} />}
                >
                  <Settings className="size-4" />
                  Editar datos de empresa
                </DropdownMenuItem>
                <DropdownMenuItem
                  render={<Link href="/planes" onClick={() => setOpen(false)} />}
                >
                  <CreditCard className="size-4" />
                  Mejorar plan
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  render={
                    <form action={signOut} className="w-full">
                      <SignOutButton />
                    </form>
                  }
                />
              </DropdownMenuContent>
            </DropdownMenu>

            <span className="mt-1 px-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Menú principal
            </span>
            <nav className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <MobileNavLink
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  onClose={() => setOpen(false)}
                />
              ))}
              <SoporteDialog />
            </nav>

            <div className="mt-auto rounded-2xl bg-muted p-4">
              <p className="text-sm font-semibold text-foreground">Mejorar Plan</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Desbloquea más empleados y sucursales para tu empresa.
              </p>
              <Button
                render={<Link href="/planes" onClick={() => setOpen(false)} />}
                nativeButton={false}
                className="mt-3 w-full justify-center rounded-full"
              >
                Mejorar plan
              </Button>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
