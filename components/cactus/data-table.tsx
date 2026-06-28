"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/cactus/empty-state";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  /** Si se provee, cada fila navega a esta URL al hacer click o presionar Enter. */
  getRowHref?: (row: T) => string;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  getRowHref,
  emptyTitle = "Sin resultados",
  emptyDescription = "No hay registros para mostrar todavía.",
}: DataTableProps<T>) {
  const router = useRouter();

  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-muted/50">
            {columns.map((column, index) => (
              <th
                key={column.key}
                className={cn(
                  "px-4 py-3 text-left text-xs font-semibold tracking-wide text-muted-foreground",
                  index === 0 ? "rounded-tl-xl" : "",
                  index === columns.length - 1 ? "rounded-tr-xl" : "",
                  column.className ?? "",
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row, index) => {
            const href = getRowHref?.(row);
            return (
              <tr
                key={rowKey(row)}
                className={cn(
                  "bg-card transition-colors duration-150 hover:bg-muted/30 animate-in fade-in slide-in-from-bottom-1 duration-200 fill-mode-backwards",
                  href &&
                    "cursor-pointer focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2",
                )}
                style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
                {...(href
                  ? {
                      role: "link",
                      tabIndex: 0,
                      onClick: () => router.push(href),
                      onKeyDown: (event: KeyboardEvent<HTMLTableRowElement>) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          router.push(href);
                        }
                      },
                    }
                  : {})}
              >
                {columns.map((column) => (
                  <td key={column.key} className={cn("px-4 py-3", column.className ?? "")}>
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
