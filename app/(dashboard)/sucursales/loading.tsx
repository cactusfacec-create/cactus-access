import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/cactus/table-skeleton";

export default function SucursalesLoading() {
  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-5 p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="size-8 rounded-lg" />
          <Skeleton className="h-8 w-40 rounded-lg" />
        </div>
      </div>
      <TableSkeleton rows={5} />
    </div>
  );
}
