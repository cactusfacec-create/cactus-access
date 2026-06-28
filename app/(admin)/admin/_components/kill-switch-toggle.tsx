"use client";

import { Power, PowerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/cactus/confirm-dialog";
import { toggleLicenciaActiva } from "@/actions/admin/licencias.actions";

export function KillSwitchToggle({
  empresaId,
  empresaNombre,
  activa,
  open,
  onOpenChange,
}: {
  empresaId: string;
  empresaNombre: string;
  activa: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <ConfirmDialog
      trigger={
        open === undefined ? (
          <Button variant={activa ? "destructive" : "secondary"} size="sm" className="gap-1.5">
            {activa ? <PowerOff className="size-4" /> : <Power className="size-4" />}
            {activa ? "Desactivar" : "Activar"}
          </Button>
        ) : undefined
      }
      open={open}
      onOpenChange={onOpenChange}
      title={activa ? "Desactivar licencia" : "Activar licencia"}
      description={
        activa
          ? `Esto bloqueará de inmediato el acceso de "${empresaNombre}" a Cactus Access.`
          : `Esto restaurará el acceso de "${empresaNombre}" a Cactus Access.`
      }
      confirmLabel={activa ? "Desactivar" : "Activar"}
      variant={activa ? "destructive" : "default"}
      onConfirm={async () => {
        await toggleLicenciaActiva(empresaId, !activa);
      }}
    />
  );
}
