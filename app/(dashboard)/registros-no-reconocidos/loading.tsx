import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/cactus/table-skeleton";

export default function RegistrosNoReconocidosLoading() {
  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-5 p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="size-8 rounded-lg" />
      </div>
      <TableSkeleton rows={5} />
    </div>
  );
}
