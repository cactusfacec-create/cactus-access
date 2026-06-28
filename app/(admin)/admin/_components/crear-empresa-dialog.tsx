"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CrudFormDialog } from "@/components/forms/crud-form-dialog";
import { crearEmpresaSchema } from "@/lib/validations/crear-empresa.schema";
import { crearEmpresa } from "@/actions/admin/empresas.actions";

const FIELDS = [
  { name: "nombreEmpresa", label: "Nombre de la empresa" },
  { name: "email", label: "Email del usuario inicial (cliente)" },
  { name: "password", label: "Contraseña inicial" },
];

export function CrearEmpresaDialog() {
  return (
    <CrudFormDialog
      trigger={
        <Button>
          <Plus className="size-4" />
          Nueva empresa
        </Button>
      }
      title="Crear empresa"
      schema={crearEmpresaSchema}
      fields={FIELDS}
      onSubmit={crearEmpresa}
    />
  );
}
