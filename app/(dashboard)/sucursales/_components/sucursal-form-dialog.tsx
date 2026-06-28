"use client";

import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CrudFormDialog } from "@/components/forms/crud-form-dialog";
import { buildJornadasFields } from "@/components/forms/jornadas-fields";
import { sucursalSchema } from "@/lib/validations/sucursal.schema";
import { createSucursal, updateSucursal } from "@/actions/sucursales.actions";
import type { Sucursal } from "@/lib/types/database.types";

const FIELDS = [
  { name: "nombreSucursal", label: "Nombre" },
  { name: "direccion", label: "Dirección" },
  { name: "macAddress", label: "MAC Address del dispositivo biométrico" },
  ...buildJornadasFields(),
];

export function SucursalFormDialog({
  mode,
  sucursal,
}: {
  mode: "create" | "edit";
  sucursal?: Sucursal;
}) {
  if (mode === "edit" && sucursal) {
    return (
      <CrudFormDialog
        trigger={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Editar ${sucursal.nombre_sucursal}`}
          >
            <Pencil className="size-4" />
          </Button>
        }
        title="Editar sucursal"
        schema={sucursalSchema}
        fields={FIELDS}
        defaultValues={{
          nombreSucursal: sucursal.nombre_sucursal,
          direccion: sucursal.direccion ?? "",
          macAddress: sucursal.mac_address ?? "",
          jornada1IncluyeAlmuerzo: Boolean(
            sucursal.jornada1_salida_almuerzo && sucursal.jornada1_entrada_almuerzo,
          ),
          jornada1Entrada: sucursal.jornada1_entrada ?? "",
          jornada1SalidaAlmuerzo: sucursal.jornada1_salida_almuerzo ?? "",
          jornada1EntradaAlmuerzo: sucursal.jornada1_entrada_almuerzo ?? "",
          jornada1Salida: sucursal.jornada1_salida ?? "",
        }}
        onSubmit={(values) => updateSucursal(sucursal.id, values)}
      />
    );
  }

  return (
    <CrudFormDialog
      trigger={
        <Button>
          <Plus className="size-4" />
          Nueva sucursal
        </Button>
      }
      title="Nueva sucursal"
      schema={sucursalSchema}
      fields={FIELDS}
      defaultValues={{
        jornada1IncluyeAlmuerzo: true,
      }}
      onSubmit={createSucursal}
    />
  );
}
