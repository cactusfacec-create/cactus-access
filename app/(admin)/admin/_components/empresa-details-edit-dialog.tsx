"use client";

import { useState, useTransition, useEffect } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/cactus/loading-button";
import { updateEmpresaAdmin } from "@/actions/admin/empresas.actions";
import { toast } from "sonner";
import type { Empresa } from "@/lib/types/database.types";

const COUNTRY_CODES = [
  { code: "+593", flag: "🇪🇨", name: "Ecuador" },
  { code: "+57",  flag: "🇨🇴", name: "Colombia" },
  { code: "+51",  flag: "🇵🇪", name: "Perú" },
  { code: "+56",  flag: "🇨🇱", name: "Chile" },
  { code: "+54",  flag: "🇦🇷", name: "Argentina" },
  { code: "+52",  flag: "🇲🇽", name: "México" },
  { code: "+58",  flag: "🇻🇪", name: "Venezuela" },
  { code: "+591", flag: "🇧🇴", name: "Bolivia" },
  { code: "+595", flag: "🇵🇾", name: "Paraguay" },
  { code: "+598", flag: "🇺🇾", name: "Uruguay" },
  { code: "+34",  flag: "🇪🇸", name: "España" },
  { code: "+1",   flag: "🇺🇸", name: "EEUU/CA" },
];

function parsePhone(full: string): { countryCode: string; local: string } {
  if (!full) return { countryCode: "+593", local: "" };
  const sorted = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length);
  for (const c of sorted) {
    if (full.startsWith(c.code)) {
      return { countryCode: c.code, local: full.slice(c.code.length) };
    }
  }
  return { countryCode: "+593", local: full };
}

function PhoneField({
  id,
  value,
  onChange,
  placeholder = "Número",
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const { countryCode, local } = parsePhone(value);
  return (
    <div className="flex gap-1.5">
      <select
        className="h-10 shrink-0 cursor-pointer rounded-lg border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        value={countryCode}
        onChange={(e) => onChange(e.target.value + local)}
        aria-label="Código de país"
      >
        {COUNTRY_CODES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.flag} {c.code}
          </option>
        ))}
      </select>
      <Input
        id={id}
        type="tel"
        placeholder={placeholder}
        value={local}
        onChange={(e) => onChange(countryCode + e.target.value)}
        className="flex-1"
      />
    </div>
  );
}

export function EmpresaDetailsEditDialog({
  empresa,
  open,
  onOpenChange,
}: {
  empresa: Empresa;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const dialogOpen = isControlled ? open! : internalOpen;
  const setDialogOpen = isControlled
    ? (next: boolean) => onOpenChange?.(next)
    : setInternalOpen;

  const [pending, startTransition] = useTransition();
  const [nombre, setNombre] = useState(empresa.nombre_empresa);
  const [direccion, setDireccion] = useState(empresa.direccion ?? "");
  const [telefono, setTelefono] = useState(empresa.telefono ?? "");
  const [ruc, setRuc] = useState(empresa.ruc ?? "");
  const [telefonoAlerta, setTelefonoAlerta] = useState(
    empresa.telefono_notificacion_tardanza ?? "",
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (dialogOpen) {
      setNombre(empresa.nombre_empresa);
      setDireccion(empresa.direccion ?? "");
      setTelefono(empresa.telefono ?? "");
      setRuc(empresa.ruc ?? "");
      setTelefonoAlerta(empresa.telefono_notificacion_tardanza ?? "");
      setError(null);
    }
  }, [dialogOpen, empresa]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await updateEmpresaAdmin(empresa.id, {
        nombreEmpresa: nombre,
        direccion,
        telefono,
        email: empresa.email ?? "",
        ruc,
        telefonoNotificacionTardanza: telefonoAlerta,
      });
      if (result.ok) {
        toast.success("Empresa actualizada");
        setDialogOpen(false);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {!isControlled && (
        <DialogTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label={`Editar ${empresa.nombre_empresa}`}>
              <Pencil className="size-4" />
            </Button>
          }
        />
      )}
      <DialogContent className="flex max-h-[80vh] flex-col gap-0 p-0">
        <DialogHeader className="shrink-0 border-b border-border px-4 py-4">
          <DialogTitle>Editar empresa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ee-nombre">Nombre de la empresa *</Label>
              <Input
                id="ee-nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ee-ruc">RUC</Label>
              <Input
                id="ee-ruc"
                value={ruc}
                onChange={(e) => setRuc(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ee-telefono">Teléfono</Label>
              <PhoneField
                id="ee-telefono"
                value={telefono}
                onChange={setTelefono}
                placeholder="Número de teléfono"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ee-direccion">Dirección</Label>
              <Input
                id="ee-direccion"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ee-tel-alerta">Teléfono de alertas de tardanza</Label>
              <PhoneField
                id="ee-tel-alerta"
                value={telefonoAlerta}
                onChange={setTelefonoAlerta}
                placeholder="Número para alertas"
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>
          <DialogFooter className="mx-0 mb-0 shrink-0 rounded-b-xl border-t bg-muted/50 px-4 py-4">
            <LoadingButton type="submit" loading={pending}>
              {pending ? "Guardando…" : "Guardar"}
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
