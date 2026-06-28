"use client";

import Link from "next/link";
import { UserSearch } from "lucide-react";
import { EmptyState } from "@/components/cactus/empty-state";
import { EmpleadoFormDialog } from "@/app/(dashboard)/empleados/_components/empleado-form-dialog";
import { resolverRegistro } from "@/actions/registros-no-reconocidos.actions";
import type { EmpleadoInput } from "@/lib/validations/empleado.schema";
import type { Sucursal } from "@/lib/types/database.types";

export interface NoReconocidoPreview {
  id: string;
  cedulaRecibida: string;
  idSucursal: string;
  sucursalNombre: string;
  fechaHoraEvento: string;
}

function formatFechaHora(iso: string) {
  return new Date(iso).toLocaleString("es-EC", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function NoReconocidosPreview({
  registros,
  sucursales,
}: {
  registros: NoReconocidoPreview[];
  sucursales: Sucursal[];
}) {
  return (
    <section className="flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-foreground">No reconocidos</h2>
          <p className="text-xs text-muted-foreground">Marcaciones sin empleado vinculado</p>
        </div>
        {registros.length > 0 ? (
          <Link
            href="/registros-no-reconocidos"
            className="shrink-0 text-xs font-medium text-lime-700 hover:underline dark:text-lime-400"
          >
            Ver todos
          </Link>
        ) : null}
      </div>

      {registros.length === 0 ? (
        <EmptyState
          title="Sin pendientes"
          description="Las marcaciones con cédulas no registradas aparecerán aquí."
        />
      ) : (
        <ul className="flex flex-col gap-1">
          {registros.map((registro) => (
            <li key={registro.id}>
              <EmpleadoFormDialog
                mode="create"
                sucursales={sucursales}
                prefill={{ cedula: registro.cedulaRecibida, sucursalId: registro.idSucursal }}
                onSubmitOverride={(values: EmpleadoInput) => resolverRegistro(registro.id, values)}
                trigger={
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 rounded-xl px-2 py-2 text-left text-sm transition-colors duration-200 hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                        <UserSearch className="size-4" />
                      </span>
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate font-medium text-foreground">
                          Cédula {registro.cedulaRecibida}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {registro.sucursalNombre}
                        </span>
                      </div>
                    </div>
                    <span className="shrink-0 text-xs font-medium text-muted-foreground">
                      {formatFechaHora(registro.fechaHoraEvento)}
                    </span>
                  </button>
                }
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
