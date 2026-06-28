"use client";

import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/cactus/data-table";
import { ConfirmDialog } from "@/components/cactus/confirm-dialog";
import { SucursalFormDialog } from "./sucursal-form-dialog";
import { DiaCorteDialog } from "./dia-corte-sucursal-dialog";
import { deleteSucursal } from "@/actions/sucursales.actions";
import type { Sucursal } from "@/lib/types/database.types";

export function SucursalesTable({ sucursales }: { sucursales: Sucursal[] }) {
  const columns: DataTableColumn<Sucursal>[] = [
    { key: "nombre", header: "Nombre", render: (row) => row.nombre_sucursal },
    { key: "direccion", header: "Dirección", render: (row) => row.direccion ?? "—" },
    { key: "device", header: "MAC Address", render: (row) => row.mac_address ?? "—" },
    {
      key: "actions",
      header: "",
      className: "w-20 text-right",
      render: (row) => (
        <div className="flex justify-end gap-1">
          <DiaCorteDialog sucursal={row} />
          <SucursalFormDialog mode="edit" sucursal={row} />
          <ConfirmDialog
            trigger={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Eliminar ${row.nombre_sucursal}`}
                className="text-muted-foreground transition-colors duration-200 hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            }
            title="Eliminar sucursal"
            description={`¿Eliminar "${row.nombre_sucursal}"? Esta acción no se puede deshacer.`}
            confirmLabel="Eliminar"
            variant="destructive"
            onConfirm={async () => {
              const res = await deleteSucursal(row.id);
              if (!res.ok) toast.error(res.error ?? "No se pudo eliminar la sucursal");
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={sucursales}
      rowKey={(row) => row.id}
      emptyTitle="Sin sucursales"
      emptyDescription="Crea tu primera sucursal para vincular su biométrico."
    />
  );
}
