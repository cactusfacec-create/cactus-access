import { ShieldCheck, Users } from "lucide-react";
import { getAdmins } from "@/actions/admin/admins.actions";
import { getSession } from "@/lib/auth/session";
import { PageShell } from "@/components/cactus/page-shell";
import { AdminsView } from "./_components/admins-view";
import { CrearAdminDialog } from "./_components/crear-admin-dialog";

export default async function AdministradoresPage() {
  const [admins, session] = await Promise.all([getAdmins(), getSession()]);

  return (
    <PageShell
      title="Administradores"
      description="Gestiona quién tiene acceso al panel de administración de Cactus Access"
      actions={<CrearAdminDialog />}
    >
      {/* Stat */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="col-span-2 flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 sm:col-span-1">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <ShieldCheck className="size-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total admins</p>
            <p className="text-2xl font-bold tabular-nums text-foreground">{admins.length}</p>
          </div>
        </div>
        <div className="col-span-2 flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 sm:col-span-1">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
            <Users className="size-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Con acceso activo</p>
            <p className="text-2xl font-bold tabular-nums text-foreground">
              {admins.filter((a) => !!a.last_sign_in_at).length}
            </p>
          </div>
        </div>
      </div>

      <AdminsView admins={admins} currentUserId={session?.id ?? ""} />
    </PageShell>
  );
}
