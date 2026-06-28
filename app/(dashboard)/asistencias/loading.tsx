import { Skeleton } from "@/components/ui/skeleton";

function AsistenciaCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-card p-5 shadow-[0px_4px_20px_rgba(0,0,0,0.03)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Skeleton className="h-5 w-20 shrink-0 rounded-full" />
        <div className="flex flex-1 items-center justify-between gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-16 rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AsistenciasLoading() {
  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-36 rounded-lg" />
          <Skeleton className="h-8 w-40 rounded-lg" />
          <Skeleton className="h-8 w-32 rounded-lg" />
          <Skeleton className="size-8 rounded-lg" />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <AsistenciaCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
