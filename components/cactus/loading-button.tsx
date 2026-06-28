import type { ComponentProps } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LoadingButtonProps extends ComponentProps<typeof Button> {
  loading?: boolean;
}

export function LoadingButton({ loading, disabled, className, children, ...props }: LoadingButtonProps) {
  return (
    <Button
      disabled={loading || disabled}
      aria-busy={loading || undefined}
      className={cn("relative", loading && "cursor-not-allowed", className)}
      {...props}
    >
      <span aria-hidden={loading || undefined} className={cn("inline-flex items-center gap-1.5", loading && "invisible")}>
        {children}
      </span>
      {loading ? (
        <>
          <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
            <Loader2 className="size-5 animate-spin" />
          </span>
          <span className="sr-only">Cargando…</span>
        </>
      ) : null}
    </Button>
  );
}
