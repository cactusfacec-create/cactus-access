import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { LicenseUsage } from "@/lib/types/domain";

const TABLE_BY_RECURSO = {
  empleados: "empleados",
  sucursales: "sucursales",
} as const;

const LIMITE_COLUMN_BY_RECURSO = {
  empleados: "limite_empleados",
  sucursales: "limite_sucursales",
} as const;

export async function checkLimiteDisponible(params: {
  idEmpresa: string;
  recurso: "empleados" | "sucursales";
}): Promise<LicenseUsage> {
  const supabase = await createClient();

  const [{ count }, { data: licencia }] = await Promise.all([
    supabase
      .from(TABLE_BY_RECURSO[params.recurso])
      .select("*", { count: "exact", head: true })
      .eq("id_empresa", params.idEmpresa),
    supabase
      .from("licencias")
      .select(LIMITE_COLUMN_BY_RECURSO[params.recurso])
      .eq("id_empresa", params.idEmpresa)
      .single(),
  ]);

  const actual = count ?? 0;
  const limite =
    (licencia as Record<string, number> | null)?.[
      LIMITE_COLUMN_BY_RECURSO[params.recurso]
    ] ?? 0;

  return {
    recurso: params.recurso,
    actual,
    limite,
    ratio: limite > 0 ? actual / limite : 0,
  };
}
