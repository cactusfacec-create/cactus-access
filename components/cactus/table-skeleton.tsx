import { Skeleton } from "@/components/ui/skeleton";

function RowSkeleton() {
  return (
    <div className="flex items-center gap-4 border-b border-border px-3 py-3 last:border-0">
      <Skeleton className="size-8 shrink-0 rounded-full" />
      <Skeleton className="h-4 flex-1" />
      <Skeleton className="h-4 w-24 shrink-0" />
      <Skeleton className="h-4 w-20 shrink-0" />
      <Skeleton className="h-5 w-16 shrink-0 rounded-full" />
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-card shadow-[0px_4px_20px_rgba(0,0,0,0.03)]">
      {Array.from({ length: rows }).map((_, index) => (
        <RowSkeleton key={index} />
      ))}
    </div>
  );
}
