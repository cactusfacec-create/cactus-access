"use client";

import { useTransition } from "react";
import { Trash2, ShieldCheck, Clock, UserCircle2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { eliminarAdmin, type AdminUser } from "@/actions/admin/admins.actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-EC", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtRelative(iso: string | null) {
  if (!iso) return "Nunca";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Ahora";
  if (mins < 60) return `Hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `Hace ${days}d`;
  return fmtDate(iso);
}

function AdminAvatar({ email }: { email: string }) {
  const initials = email.slice(0, 2).toUpperCase();
  const hue = email.charCodeAt(0) * 37 + email.charCodeAt(1) * 17;
  const style = { background: `hsl(${hue % 360} 60% 50%)` };
  return (
    <span
      style={style}
      className="flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
    >
      {initials}
    </span>
  );
}

function DeleteAdminButton({
  adminId,
  adminEmail,
  isSelf,
}: {
  adminId: string;
  adminEmail: string;
  isSelf: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await eliminarAdmin(adminId);
      if (result.ok) {
        toast.success("Administrador eliminado", {
          description: `${adminEmail} ya no tiene acceso al panel.`,
        });
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={handleDelete}
      disabled={pending || isSelf}
      aria-label="Eliminar administrador"
      title={isSelf ? "No puedes eliminarte a ti mismo" : `Eliminar a ${adminEmail}`}
      className={cn(
        "text-muted-foreground hover:text-destructive",
        isSelf && "cursor-not-allowed opacity-30",
      )}
    >
      <Trash2 className="size-4" />
    </Button>
  );
}

export function AdminsView({
  admins,
  currentUserId,
}: {
  admins: AdminUser[];
  currentUserId: string;
}) {
  if (admins.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-16 text-center">
        <UserCircle2 className="size-8 text-muted-foreground/40" />
        <p className="text-sm font-medium text-muted-foreground">Sin administradores</p>
        <p className="text-xs text-muted-foreground/60">
          Agrega el primer administrador usando el botón de arriba.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            {["Administrador", "Rol", "WhatsApp", "Miembro desde", "Último acceso", ""].map((h) => (
              <th
                key={h}
                className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {admins.map((admin) => {
            const isSelf = admin.id === currentUserId;
            return (
              <tr
                key={admin.id}
                className="border-b border-border/50 transition-colors hover:bg-muted/30 last:border-0"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <AdminAvatar email={admin.email} />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">
                        {admin.email}
                      </span>
                      {isSelf && (
                        <span className="text-xs text-muted-foreground">Tú</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                    <ShieldCheck className="size-3.5" />
                    Super Admin
                  </span>
                </td>
                <td className="px-4 py-3">
                  {admin.whatsapp ? (
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                      <MessageCircle className="size-3.5 shrink-0" />
                      {admin.whatsapp}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground/50">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-foreground">{fmtDate(admin.created_at)}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3.5 shrink-0" />
                    {fmtRelative(admin.last_sign_in_at)}
                  </div>
                </td>
                <td className="px-4 py-3 pr-3 text-right">
                  <DeleteAdminButton
                    adminId={admin.id}
                    adminEmail={admin.email}
                    isSelf={isSelf}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
