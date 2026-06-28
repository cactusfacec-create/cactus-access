"use client";

import { Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/cactus/data-table";
import { ConfirmDialog } from "@/components/cactus/confirm-dialog";
import { EmpleadoFormDialog } from "@/app/(dashboard)/empleados/_components/empleado-form-dialog";
import {
  descartarRegistro,
  resolverRegistro,
} from "@/actions/registros-no-reconocidos.actions";
import type { EmpleadoInput } from "@/lib/validations/empleado.schema";
import type { RegistroNoReconocido, Sucursal } from "@/lib/types/database.types";

export function RegistrosNoReconocidosTable({
  registros,
  sucursales,
}: {
  registros: RegistroNoReconocido[];
  sucursales: Sucursal[];
}) {
  const sucursalById = new Map(sucursales.map((s) => [s.id, s.nombre_sucursal]));

  const columns: DataTableColumn<RegistroNoReconocido>[] = [
    {
      key: "fecha",
      header: "Fecha / Hora",
      render: (row) => new Date(row.fecha_hora_evento).toLocaleString("es-EC"),
    },
    {
      key: "sucursal",
      header: "Sucursal",
      render: (row) => sucursalById.get(row.id_sucursal) ?? "—",
    },
    { key: "cedula", header: "Cédula", render: (row) => row.cedula_recibida },
    {
      key: "actions",
      header: "",
      className: "w-56 text-right",
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <EmpleadoFormDialog
            mode="create"
            sucursales={sucursales}
            prefill={{ cedula: row.cedula_recibida, sucursalId: row.id_sucursal }}
            onSubmitOverride={(values: EmpleadoInput) => resolverRegistro(row.id, values)}
            trigger={
              <Button size="sm" variant="outline" className="gap-1.5">
                <UserPlus className="size-4" />
                Agregar empleado
              </Button>
            }
          />
          <ConfirmDialog
            trigger={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Eliminar registro"
                className="text-muted-foreground transition-colors duration-200 hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            }
            title="Eliminar registro"
            description={`¿Eliminar la marcación de cédula "${row.cedula_recibida}"? Esta acción no se puede deshacer.`}
            confirmLabel="Eliminar"
            variant="destructive"
            onConfirm={async () => {
              await descartarRegistro(row.id);
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={registros}
      rowKey={(row) => row.id}
      emptyTitle="Sin registros pendientes"
      emptyDescription="Las marcaciones de cédulas que no correspondan a un empleado registrado aparecerán aquí."
    />
  );
}
