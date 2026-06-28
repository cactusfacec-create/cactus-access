"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  Pencil,
  Settings2,
  CreditCard,
  Link2,
  Power,
  PowerOff,
  Trash2,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmpresaDetailsEditDialog } from "./empresa-details-edit-dialog";
import { LicenciaEditDialog } from "./licencia-edit-dialog";
import { RegistrarPagoDialog } from "./registrar-pago-dialog";
import { HistorialPagosDialog } from "./historial-pagos-dialog";
import { GenerarEnlacePagoDialog } from "./generar-enlace-pago-dialog";
import { KillSwitchToggle } from "./kill-switch-toggle";
import { DeleteEmpresaButton } from "./delete-empresa-button";
import type { EmpresaConLicencia } from "@/lib/types/domain";

type ActiveDialog =
  | "empresa"
  | "licencia"
  | "pago"
  | "historial"
  | "enlace"
  | "kill"
  | "delete"
  | null;

export function EmpresaActionsMenu({
  empresa,
  pasarelas,
}: {
  empresa: EmpresaConLicencia;
  pasarelas?: { dlocalgo: boolean };
}) {
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null);
  const close = () => setActiveDialog(null);
  const handleOpenChange = (open: boolean) => { if (!open) close(); };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label="Acciones">
              <MoreHorizontal className="size-4" />
            </Button>
          }
        />
        <DropdownMenuContent side="bottom" align="end">
          <DropdownMenuItem onClick={() => setActiveDialog("empresa")}>
            <Pencil className="size-4" />
            Editar empresa
          </DropdownMenuItem>
          {empresa.licencia ? (
            <DropdownMenuItem onClick={() => setActiveDialog("licencia")}>
              <Settings2 className="size-4" />
              Editar plan / licencia
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setActiveDialog("pago")}>
            <CreditCard className="size-4" />
            Registrar pago manual
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setActiveDialog("historial")}>
            <History className="size-4" />
            Ver historial de pagos
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setActiveDialog("enlace")}>
            <Link2 className="size-4" />
            Generar enlace de pago
          </DropdownMenuItem>
          {empresa.licencia ? (
            <>
              <DropdownMenuSeparator />
              {empresa.licencia.activa ? (
                <DropdownMenuItem onClick={() => setActiveDialog("kill")}>
                  <PowerOff className="size-4" />
                  Desactivar acceso
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => setActiveDialog("kill")}>
                  <Power className="size-4" />
                  Activar acceso
                </DropdownMenuItem>
              )}
            </>
          ) : null}
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setActiveDialog("delete")}>
            <Trash2 className="size-4" />
            Eliminar empresa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EmpresaDetailsEditDialog
        empresa={empresa}
        open={activeDialog === "empresa"}
        onOpenChange={handleOpenChange}
      />
      {empresa.licencia ? (
        <LicenciaEditDialog
          licencia={empresa.licencia}
          open={activeDialog === "licencia"}
          onOpenChange={handleOpenChange}
        />
      ) : null}
      <RegistrarPagoDialog
        idEmpresa={empresa.id}
        nombreEmpresa={empresa.nombre_empresa}
        licencia={empresa.licencia}
        open={activeDialog === "pago"}
        onOpenChange={handleOpenChange}
      />
      <HistorialPagosDialog
        idEmpresa={empresa.id}
        nombreEmpresa={empresa.nombre_empresa}
        licencia={empresa.licencia}
        open={activeDialog === "historial"}
        onOpenChange={handleOpenChange}
      />
      <GenerarEnlacePagoDialog
        idEmpresa={empresa.id}
        nombreEmpresa={empresa.nombre_empresa}
        dlocalgoDisponible={pasarelas?.dlocalgo ?? false}
        open={activeDialog === "enlace"}
        onOpenChange={handleOpenChange}
      />
      {empresa.licencia ? (
        <KillSwitchToggle
          empresaId={empresa.id}
          empresaNombre={empresa.nombre_empresa}
          activa={empresa.licencia.activa}
          open={activeDialog === "kill"}
          onOpenChange={handleOpenChange}
        />
      ) : null}
      <DeleteEmpresaButton
        idEmpresa={empresa.id}
        nombreEmpresa={empresa.nombre_empresa}
        open={activeDialog === "delete"}
        onOpenChange={handleOpenChange}
      />
    </>
  );
}
