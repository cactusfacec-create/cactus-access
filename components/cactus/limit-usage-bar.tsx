import { cn } from "@/lib/utils";

interface LimitUsageBarProps {
  label: string;
  actual: number;
  limite: number;
}

export function LimitUsageBar({ label, actual, limite }: LimitUsageBarProps) {
  const ratio = limite > 0 ? Math.min(actual / limite, 1) : 0;
  const isNearLimit = ratio >= 0.9;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-muted-foreground">{label}</span>
        <span
          className={cn(
            "font-medium",
            isNearLimit ? "text-destructive" : "text-foreground",
          )}
        >
          {actual} de {limite}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary/60">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            isNearLimit ? "bg-destructive/70" : "bg-primary",
          )}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  );
}
