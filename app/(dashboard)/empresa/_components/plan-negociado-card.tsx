import { Zap } from "lucide-react";
import { BotonesPago } from "@/components/cactus/botones-pago";
import type { Licencia } from "@/lib/types/database.types";

const PERIODOS: Record<string, string> = {
  trimestral: "trimestre",
  semestral: "semestre",
  anual: "año",
};

const PERIODO_MESES: Record<string, number> = {
  trimestral: 3,
  semestral: 6,
  anual: 12,
};

function calcularFechaHasta(periodo: string): string {
  const d = new Date();
  d.setMonth(d.getMonth() + (PERIODO_MESES[periodo] ?? 12));
  return d.toISOString().slice(0, 10);
}

export function PlanNegociadoCard({
  licencia,
  pasarelas,
}: {
  licencia: Licencia;
  pasarelas: { dlocalgo: boolean };
}) {
  const periodo = licencia.periodo_facturacion!;
  const precio = licencia.precio!;
  const hayPasarela = pasarelas.dlocalgo;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-violet-200 bg-violet-50 p-6 dark:border-violet-800 dark:bg-violet-950/30">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/50">
          <Zap className="size-5 text-violet-600 dark:text-violet-400" />
        </span>
        <div>
          <p className="font-semibold text-violet-900 dark:text-violet-200">
            Plan negociado
          </p>
          <p className="text-xs text-violet-600 dark:text-violet-400">
            Paga para activarlo cuando venza tu período actual
          </p>
        </div>
      </div>

      {/* Detalles del plan */}
      <div className="flex items-baseline justify-between rounded-lg bg-white/60 px-4 py-3 dark:bg-violet-950/40">
        <div className="flex flex-col">
          <span className="text-xl font-bold tabular-nums text-foreground">
            ${precio}
          </span>
          <span className="text-xs text-muted-foreground">
            por {PERIODOS[periodo] ?? periodo}
          </span>
        </div>
        <div className="flex flex-col items-end gap-0.5 text-right">
          <span className="text-xs text-muted-foreground">
            {licencia.limite_sucursales} sucursal{licencia.limite_sucursales !== 1 ? "es" : ""}
          </span>
          <span className="text-xs text-muted-foreground">
            {licencia.limite_empleados} empleados
          </span>
        </div>
      </div>

      {hayPasarela ? (
        <BotonesPago
          planTipo="personalizado"
          periodoFacturacion={periodo}
          monto={precio}
          fechaHasta={calcularFechaHasta(periodo)}
          limiteSucursales={licencia.limite_sucursales}
          limiteEmpleados={licencia.limite_empleados}
          pasarelas={pasarelas}
          layout="col"
        />
      ) : (
        <p className="text-center text-xs text-violet-600 dark:text-violet-400">
          Contacta a soporte para completar el pago.
        </p>
      )}
    </div>
  );
}
