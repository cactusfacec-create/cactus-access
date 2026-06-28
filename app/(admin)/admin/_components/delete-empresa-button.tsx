"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/cactus/confirm-dialog";
import { deleteEmpresa } from "@/actions/admin/empresas.actions";

export function DeleteEmpresaButton({
  idEmpresa,
  nombreEmpresa,
  open,
  onOpenChange,
}: {
  idEmpresa: string;
  nombreEmpresa: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <ConfirmDialog
      trigger={
        open === undefined ? (
          <Button variant="ghost" size="icon-sm" aria-label={`Eliminar ${nombreEmpresa}`}>
            <Trash2 className="size-4" />
          </Button>
        ) : undefined
      }
      open={open}
      onOpenChange={onOpenChange}
      title="Eliminar empresa"
      description={`¿Eliminar "${nombreEmpresa}" definitivamente? Se borran también sus sucursales, empleados, licencia e historial de Asistencias. Esta acción no se puede deshacer.`}
      confirmLabel="Eliminar"
      variant="destructive"
      onConfirm={async () => {
        await deleteEmpresa(idEmpresa);
      }}
    />
  );
}
