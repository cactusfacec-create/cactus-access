import type { ControlDiario, Empleado, Empresa, Licencia } from "@/lib/types/database.types";
import type { HorarioProgramado } from "@/lib/asistencia";

export type EmpresaConLicencia = Empresa & {
  licencia: Licencia | null;
  totalSucursales: number;
  totalEmpleados: number;
};

// Fila de la vista de "Log de operaciones diario": un empleado con su
// marcación completa del día seleccionado.
export type EmpleadoAsistenciaDia = {
  empleado: Pick<Empleado, "id" | "nombre" | "cedula">;
  sucursalNombre: string;
  row: ControlDiario;
  horarioProgramado?: HorarioProgramado;
};

export type LicenseUsage = {
  recurso: "empleados" | "sucursales";
  actual: number;
  limite: number;
  ratio: number;
};

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };
