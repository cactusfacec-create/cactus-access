import Link from "next/link";
import {
  Building2,
  CalendarDays,
  ChevronDown,
  Clock,
  CreditCard,
  FileCheck2,
  LayoutDashboard,
  Settings,
  ShoppingBag,
  Sparkles,
  UserSearch,
  Users,
  Zap,
} from "lucide-react";
import { CactusIcon } from "@/components/cactus/cactus-icon";
import { signOut } from "@/actions/auth.actions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/cactus/sign-out-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarNavItem } from "@/components/layout/sidebar-nav-item";
import { SoporteDialog } from "@/components/layout/soporte-dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { TrialProgressFill } from "@/components/layout/trial-progress-fill";

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

export function SidebarCliente({
  nombreEmpresa,
  diasRestantesPrueba,
}: {
  nombreEmpresa: string;
  diasRestantesPrueba?: number | null;
}) {
  return (
    <aside className="sticky top-3 hidden h-[calc(100dvh-1.5rem)] w-64 shrink-0 flex-col gap-1 overflow-y-auto rounded-3xl bg-sidebar p-4 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] lg:flex animate-in fade-in slide-in-from-left-4 duration-500 fill-mode-backwards">
      <div className="mb-2 flex items-center gap-2 px-1 py-2">
        <CactusIcon className="size-9" />
        <div className="flex flex-1 flex-col min-w-0">
          <span className="truncate text-sm font-semibold text-sidebar-foreground">Cactus</span>
          <span className="truncate text-[10px] text-muted-foreground">Control de asistencia</span>
        </div>
        <ThemeToggle />
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
          <DropdownMenuItem render={<Link href="/empresa" />}>
            <Settings className="size-4" />
            Editar datos de empresa
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/planes" />}>
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

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item, index) => (
          <div
            key={item.href}
            className="animate-in fade-in slide-in-from-left-2 duration-200 fill-mode-backwards"
            style={{ animationDelay: `${100 + index * 30}ms` }}
          >
            <SidebarNavItem {...item} />
          </div>
        ))}
        <div className="animate-in fade-in duration-200 fill-mode-backwards" style={{ animationDelay: "370ms" }}>
          <SoporteDialog />
        </div>
      </nav>
      <div className="mt-auto flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-backwards" style={{ animationDelay: "400ms" }}>
        {diasRestantesPrueba != null && (
          <div
            className={cn(
              "overflow-hidden rounded-2xl border",
              diasRestantesPrueba <= 3
                ? "border-red-200/60 bg-red-50 dark:border-red-500/20 dark:bg-red-500/8"
                : diasRestantesPrueba <= 7
                  ? "border-amber-200/60 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/8"
                  : "border-lime-200/60 bg-lime-50 dark:border-lime-500/20 dark:bg-lime-500/8",
            )}
          >
            <div className="flex items-center gap-2.5 px-3 py-2.5">
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-md",
                  diasRestantesPrueba <= 3
                    ? "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400"
                    : diasRestantesPrueba <= 7
                      ? "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
                      : "bg-lime-100 text-lime-700 dark:bg-lime-500/20 dark:text-lime-300",
                )}
              >
                <Sparkles className="size-3" />
              </span>
              <span className="flex-1 text-xs font-medium text-sidebar-foreground">
                Días de prueba
              </span>
              <span
                className={cn(
                  "text-xs font-bold tabular-nums",
                  diasRestantesPrueba <= 3
                    ? "text-red-600 dark:text-red-400"
                    : diasRestantesPrueba <= 7
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-lime-700 dark:text-lime-400",
                )}
              >
                {diasRestantesPrueba}<span className="font-normal opacity-50">/15</span>
              </span>
            </div>
            <div
              className={cn(
                "h-0.5 w-full",
                diasRestantesPrueba <= 3
                  ? "bg-red-100 dark:bg-red-500/20"
                  : diasRestantesPrueba <= 7
                    ? "bg-amber-100 dark:bg-amber-500/20"
                    : "bg-lime-100 dark:bg-lime-500/20",
              )}
            >
              <TrialProgressFill
                ratio={diasRestantesPrueba / 15}
                urgente={diasRestantesPrueba <= 3}
                moderado={diasRestantesPrueba > 3 && diasRestantesPrueba <= 7}
              />
            </div>
          </div>
        )}

        <div className="flex flex-col items-center gap-2 rounded-2xl bg-muted px-4 pb-4 pt-5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Zap className="size-4" />
          </span>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">Mejorar plan</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              Desbloquea más empleados y sucursales.
            </p>
          </div>
          <Button
            render={<Link href="/planes" />}
            nativeButton={false}
            className="w-full justify-center rounded-full"
          >
            Ver planes
          </Button>
        </div>
      </div>
    </aside>
  );
}
