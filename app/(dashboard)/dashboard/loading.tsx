import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-5 p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="size-8 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Skeleton className="h-32 rounded-2xl lg:col-span-4" />
        <Skeleton className="h-32 rounded-2xl lg:col-span-4" />
        <Skeleton className="h-32 rounded-2xl lg:col-span-4" />

        <div className="flex flex-col gap-3 rounded-2xl bg-card p-5 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] lg:col-span-12">
          <Skeleton className="h-4 w-40" />
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>

        <div className="flex flex-col gap-3 rounded-2xl bg-card p-5 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] lg:col-span-6">
          <Skeleton className="h-4 w-32" />
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
        <Skeleton className="h-56 rounded-2xl lg:col-span-6" />
      </div>
    </div>
  );
}
