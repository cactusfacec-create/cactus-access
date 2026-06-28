"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { History, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DataTable, type DataTableColumn } from "@/components/cactus/data-table";
import { ConfirmDialog } from "@/components/cactus/confirm-dialog";
import { EmpleadoFormDialog } from "./empleado-form-dialog";
import { deleteEmpleado } from "@/actions/empleados.actions";
import type {
  Empleado,
  HorarioEmpleado,
  Jornadas,
  Sucursal,
} from "@/lib/types/database.types";

function getInitials(nombre: string) {
  const palabras = nombre.trim().split(/\s+/).filter(Boolean);
  if (palabras.length === 0) return "?";
  if (palabras.length === 1) return palabras[0].slice(0, 2).toUpperCase();
  return (palabras[0][0] + palabras[1][0]).toUpperCase();
}

function formatHorarioDetalle(jornada: Jornadas | undefined) {
  if (!jornada) return "Sin horario configurado";

  const segmentos: string[] = [];
  if (jornada.jornada1_activo) {
    if (jornada.jornada1_salida_almuerzo && jornada.jornada1_entrada_almuerzo) {
      if (jornada.jornada1_entrada) {
        segmentos.push(`${jornada.jornada1_entrada} - ${jornada.jornada1_salida_almuerzo}`);
      }
      if (jornada.jornada1_salida) {
        segmentos.push(`${jornada.jornada1_entrada_almuerzo} - ${jornada.jornada1_salida}`);
      }
    } else if (jornada.jornada1_entrada && jornada.jornada1_salida) {
      segmentos.push(`${jornada.jornada1_entrada} - ${jornada.jornada1_salida}`);
    }
  }
  if (jornada.jornada2_activo && jornada.jornada2_entrada && jornada.jornada2_salida) {
    segmentos.push(`${jornada.jornada2_entrada} - ${jornada.jornada2_salida}`);
  }

  return segmentos.length > 0 ? segmentos.join(" / ") : "Sin horario configurado";
}

function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function EmpleadosTable({
  empleados,
  sucursales,
  horariosEmpleados,
}: {
  empleados: Empleado[];
  sucursales: Sucursal[];
  horariosEmpleados: HorarioEmpleado[];
}) {
  const [sucursalFiltro, setSucursalFiltro] = useState("all");
  const [busqueda, setBusqueda] = useState("");

  const sucursalById = new Map(sucursales.map((s) => [s.id, s]));
  const horarioByEmpleado = new Map(horariosEmpleados.map((h) => [h.id_empleado, h]));

  const sucursalItems: Record<string, string> = { all: "Todas las sucursales" };
  for (const sucursal of sucursales) sucursalItems[sucursal.id] = sucursal.nombre_sucursal;

  const empleadosFiltrados = useMemo(() => {
    const query = normalizar(busqueda.trim());
    return empleados.filter((e) => {
      if (sucursalFiltro !== "all" && e.id_sucursal !== sucursalFiltro) return false;
      if (!query) return true;
      return normalizar(e.nombre).includes(query) || normalizar(e.cedula).includes(query);
    });
  }, [empleados, sucursalFiltro, busqueda]);

  const columns: DataTableColumn<Empleado>[] = [
    {
      key: "nombre",
      header: "Nombre",
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <Avatar size="sm">
            <AvatarFallback className="font-semibold">
              {getInitials(row.nombre)}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-foreground">{row.nombre}</span>
        </div>
      ),
    },
    { key: "cedula", header: "Cédula", render: (row) => row.cedula },
    {
      key: "salario",
      header: "Salario",
      render: (row) =>
        row.salario_diario > 0 ? (
          <span className="tabular-nums">
            ${row.salario_diario.toFixed(2)}
            <span className="ml-1 text-xs text-muted-foreground">
              /{row.tipo_salario === "mensual" ? "mes" : "día"}
            </span>
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    { key: "telefono", header: "Teléfono", render: (row) => row.telefono || "—" },
    {
      key: "sucursal",
      header: "Sucursal",
      render: (row) =>
        (row.id_sucursal ? sucursalById.get(row.id_sucursal)?.nombre_sucursal : null) ?? "—",
    },
    {
      key: "horario",
      header: "Horario",
      render: (row) => {
        const horario = horarioByEmpleado.get(row.id);
        const usaGlobal = horario?.usa_horario_global !== false;
        const jornada = usaGlobal
          ? (row.id_sucursal ? sucursalById.get(row.id_sucursal) : undefined)
          : horario;

        return (
          <Tooltip>
            <TooltipTrigger render={<span />}>
              <Badge variant="outline" className="cursor-default">
                {usaGlobal ? "De la sucursal" : "Personalizado"}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>{formatHorarioDetalle(jornada)}</TooltipContent>
          </Tooltip>
        );
      },
    },
    {
      key: "actions",
      header: "",
      className: "w-32 text-right",
      render: (row) => (
        <div className="flex justify-end gap-4">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Historial de ${row.nombre}`}
            render={<Link href={`/asistencias/${row.id}`} />}
            nativeButton={false}
          >
            <History className="size-4" />
          </Button>
          <EmpleadoFormDialog
            mode="edit"
            empleado={row}
            horarioEmpleado={horarioByEmpleado.get(row.id)}
            sucursales={sucursales}
          />
          <ConfirmDialog
            trigger={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Eliminar ${row.nombre}`}
                className="text-muted-foreground transition-colors duration-200 hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            }
            title="Eliminar empleado"
            description={`¿Eliminar "${row.nombre}"? Su historial en Asistencias se conservará.`}
            confirmLabel="Eliminar"
            variant="destructive"
            onConfirm={async () => {
              const res = await deleteEmpleado(row.id);
              if (!res.ok) toast.error(res.error ?? "No se pudo eliminar el empleado");
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <Select
          items={sucursalItems}
          value={sucursalFiltro}
          onValueChange={(value) => setSucursalFiltro(value ?? "all")}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Todas las sucursales" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(sucursalItems).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o cédula..."
            aria-label="Buscar empleado por nombre o cédula"
            className="pl-8"
          />
        </div>
      </div>
      <DataTable
        columns={columns}
        rows={empleadosFiltrados}
        rowKey={(row) => row.id}
        emptyTitle="Sin empleados"
        emptyDescription="Agrega empleados y vincula su cédula para empezar a recibir su asistencia."
      />
    </div>
  );
}
