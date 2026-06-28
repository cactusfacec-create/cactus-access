import {
  Activity,
  Building2,
  CreditCard,
  Trash2,
  UserCheck,
  UserX,
  PencilLine,
  Plus,
} from "lucide-react";
import { getAuditLogs } from "@/actions/admin/logs.actions";
import { PageShell } from "@/components/cactus/page-shell";
import { cn } from "@/lib/utils";

const ACCION_META: Record<
  string,
  { label: string; icon: React.ReactNode; color: string }
> = {
  crear_empresa: {
    label: "Empresa creada",
    icon: <Plus className="size-3.5" />,
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  editar_empresa: {
    label: "Empresa editada",
    icon: <PencilLine className="size-3.5" />,
    color: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  },
  eliminar_empresa: {
    label: "Empresa eliminada",
    icon: <Trash2 className="size-3.5" />,
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
  asignar_plan: {
    label: "Plan asignado",
    icon: <CreditCard className="size-3.5" />,
    color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  },
  registrar_pago: {
    label: "Pago registrado",
    icon: <CreditCard className="size-3.5" />,
    color: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  },
  activar_empresa: {
    label: "Empresa activada",
    icon: <UserCheck className="size-3.5" />,
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  desactivar_empresa: {
    label: "Empresa desactivada",
    icon: <UserX className="size-3.5" />,
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
};

function fmtFull(iso: string) {
  return new Date(iso).toLocaleString("es-EC", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Ahora";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

function DetalleChips({ detalle }: { detalle: Record<string, unknown> | null }) {
  if (!detalle) return null;
  const entries = Object.entries(detalle).slice(0, 4);
  return (
    <div className="flex flex-wrap gap-1.5">
      {entries.map(([k, v]) => (
        <span
          key={k}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 px-1.5 py-0.5 font-mono text-xs text-muted-foreground"
        >
          <span className="font-sans text-[10px] text-muted-foreground/60">{k}:</span>
          {String(v)}
        </span>
      ))}
    </div>
  );
}

export default async function ModificacionesPage() {
  const logs = await getAuditLogs();

  return (
    <PageShell
      title="Historial de modificaciones"
      description="Registro de todas las acciones realizadas por administradores"
    >
      {logs.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-16 text-center">
          <Activity className="size-8 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">Sin modificaciones registradas</p>
          <p className="text-xs text-muted-foreground/60">
            Las acciones del panel se registran automáticamente.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {["Acción", "Empresa", "Administrador", "Detalle", "Fecha"].map((h) => (
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
              {logs.map((log) => {
                const meta = ACCION_META[log.accion];
                return (
                  <tr
                    key={log.id}
                    className="border-b border-border/50 transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-3">
                      {meta ? (
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                            meta.color,
                          )}
                        >
                          {meta.icon}
                          {meta.label}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                          <Activity className="size-3.5" />
                          {log.accion}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {log.empresa_nombre ? (
                        <div className="flex items-center gap-1.5">
                          <Building2 className="size-3.5 shrink-0 text-muted-foreground" />
                          <span className="text-sm text-foreground">{log.empresa_nombre}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground/40">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground">{log.user_email}</span>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <DetalleChips detalle={log.detalle} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-foreground">{fmtFull(log.created_at)}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {fmtRelative(log.created_at)}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
}
