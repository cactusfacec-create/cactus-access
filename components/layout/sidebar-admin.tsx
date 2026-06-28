import { Activity, Building2, LayoutGrid, CreditCard, Lightbulb, LogIn, ShieldCheck, KeyRound, ShoppingBag, Package } from "lucide-react";
import { signOut } from "@/actions/auth.actions";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarNavItem } from "@/components/layout/sidebar-nav-item";
import { SignOutButton } from "@/components/cactus/sign-out-button";
import { CactusIcon } from "@/components/cactus/cactus-icon";

export function SidebarAdmin({ userEmail }: { userEmail: string }) {
  return (
    <aside className="sticky top-3 hidden h-[calc(100dvh-1.5rem)] w-64 shrink-0 flex-col gap-1 overflow-y-auto rounded-3xl bg-sidebar p-4 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] lg:flex">
      <div className="mb-2 flex items-center gap-2 px-1 py-2">
        <CactusIcon className="size-9" />
        <div className="flex flex-1 flex-col min-w-0">
          <span className="truncate text-sm font-semibold text-sidebar-foreground">Cactus</span>
          <span className="truncate text-[10px] text-muted-foreground">Control de asistencia</span>
        </div>
        <ThemeToggle />
      </div>

      <div className="mb-2 flex items-center gap-2 rounded-2xl px-2 py-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground">
          {userEmail.slice(0, 2).toUpperCase()}
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-xs font-medium text-sidebar-foreground">{userEmail}</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">
            Super Admin
          </span>
        </div>
      </div>

      <span className="mt-1 px-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
        Gestión
      </span>
      <nav className="flex flex-col gap-1">
        <SidebarNavItem href="/admin" icon={<Building2 className="size-4" />} label="Empresas" exact />
        <SidebarNavItem href="/admin/planes" icon={<LayoutGrid className="size-4" />} label="Planes" />
        <SidebarNavItem href="/admin/pagos" icon={<CreditCard className="size-4" />} label="Transacciones" />
        <SidebarNavItem href="/admin/administradores" icon={<ShieldCheck className="size-4" />} label="Administradores" />
        <SidebarNavItem href="/admin/configuracion" icon={<KeyRound className="size-4" />} label="Credenciales" />
        <SidebarNavItem href="/admin/tienda" icon={<Package className="size-4" />} label="Catálogo tienda" />
        <SidebarNavItem href="/admin/pedidos" icon={<ShoppingBag className="size-4" />} label="Pedidos tienda" />
      </nav>

      <span className="mt-3 px-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
        Auditoría
      </span>
      <nav className="flex flex-col gap-1">
        <SidebarNavItem href="/admin/accesos" icon={<LogIn className="size-4" />} label="Ingresos" />
        <SidebarNavItem href="/admin/modificaciones" icon={<Activity className="size-4" />} label="Modificaciones" />
        <SidebarNavItem href="/admin/sugerencias" icon={<Lightbulb className="size-4" />} label="Sugerencias" />
      </nav>

      <div className="mt-auto">
        <form action={signOut} className="w-full">
          <SignOutButton variant="outline" />
        </form>
      </div>
    </aside>
  );
}
