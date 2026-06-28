import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function DashboardGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">{children}</div>;
}

// Mapa estático: Tailwind necesita ver la clase completa en el código fuente,
// no puede generarla a partir de una interpolación como `lg:col-span-${span}`.
const COL_SPAN: Record<number, string> = {
  1: "lg:col-span-1",
  2: "lg:col-span-2",
  3: "lg:col-span-3",
  4: "lg:col-span-4",
  5: "lg:col-span-5",
  6: "lg:col-span-6",
  7: "lg:col-span-7",
  8: "lg:col-span-8",
  9: "lg:col-span-9",
  10: "lg:col-span-10",
  11: "lg:col-span-11",
  12: "lg:col-span-12",
};

export function GridItem({
  span,
  className,
  children,
}: {
  span: number;
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn(COL_SPAN[span] ?? "lg:col-span-12", className)}>{children}</div>;
}
