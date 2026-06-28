import { LogIn, Clock, ShieldCheck } from "lucide-react";
import { getAccessLogs } from "@/actions/admin/logs.actions";
import { PageShell } from "@/components/cactus/page-shell";

function fmtRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Hace un momento";
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `Hace ${days}d`;
  return new Date(iso).toLocaleDateString("es-EC", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtFull(iso: string) {
  return new Date(iso).toLocaleString("es-EC", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AccesosPage() {
  const logs = await getAccessLogs();

  return (
    <PageShell
      title="Ingresos al panel"
      description="Historial de accesos al panel administrativo de Cactus Access"
    >
      {logs.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-16 text-center">
          <LogIn className="size-8 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">Sin registros de acceso</p>
          <p className="text-xs text-muted-foreground/60">
            Los ingresos al panel se registran automáticamente.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">
                  Administrador
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">
                  Fecha y hora
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">
                  Hace
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-border/50 transition-colors hover:bg-muted/30"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {log.user_email.slice(0, 2).toUpperCase()}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">{log.user_email}</span>
                        <span className="flex items-center gap-1 text-xs text-emerald-600">
                          <ShieldCheck className="size-3" />
                          Super Admin
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-sm text-foreground">
                      <Clock className="size-3.5 text-muted-foreground" />
                      {fmtFull(log.created_at)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {fmtRelative(log.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
}
