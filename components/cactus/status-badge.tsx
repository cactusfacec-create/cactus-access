import { AlarmClock, AlertCircle, CheckCircle2, Clock, LogOut, Sparkles, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatusBadgeStatus =
  | "activa"
  | "suspendida"
  | "a_tiempo"
  | "tarde"
  | "trial"
  | "vencida"
  | "atrasado"
  | "horas_extra"
  | "incompleto";

const STATUS_STYLES: Record<StatusBadgeStatus, string> = {
  activa:      "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400",
  a_tiempo:    "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400",
  trial:       "bg-primary/12 text-accent",
  suspendida:  "bg-destructive/10 text-destructive",
  vencida:     "bg-destructive/10 text-destructive",
  tarde:       "bg-destructive/10 text-destructive",
  atrasado:    "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  horas_extra: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  incompleto:  "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
};

const STATUS_LABELS: Record<StatusBadgeStatus, string> = {
  activa:      "Activa",
  suspendida:  "Suspendida",
  a_tiempo:    "A tiempo",
  tarde:       "Tarde",
  trial:       "Trial",
  vencida:     "Vencida",
  atrasado:    "Atrasado",
  horas_extra: "Horas extra",
  incompleto:  "Incompleto",
};

const STATUS_ICONS: Record<StatusBadgeStatus, React.ReactNode> = {
  activa:      <CheckCircle2 className="size-3 shrink-0" />,
  a_tiempo:    <CheckCircle2 className="size-3 shrink-0" />,
  trial:       <Sparkles className="size-3 shrink-0" />,
  suspendida:  <AlertCircle className="size-3 shrink-0" />,
  vencida:     <AlertCircle className="size-3 shrink-0" />,
  tarde:       <Clock className="size-3 shrink-0" />,
  atrasado:    <AlarmClock className="size-3 shrink-0" />,
  horas_extra: <TrendingUp className="size-3 shrink-0" />,
  incompleto:  <LogOut className="size-3 shrink-0" />,
};

export function StatusBadge({
  status,
  children,
}: {
  status: StatusBadgeStatus;
  children?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        STATUS_STYLES[status],
      )}
    >
      {STATUS_ICONS[status]}
      {children ?? STATUS_LABELS[status]}
    </span>
  );
}
