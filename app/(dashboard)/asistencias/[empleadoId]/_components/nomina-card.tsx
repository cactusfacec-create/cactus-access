import { Settings, CheckCircle2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { formatMoney, formatHoras } from "@/lib/nomina";
import type { NominaResult } from "@/lib/nomina";
import type { RegistrarPagoInput } from "@/actions/pagos.actions";
import type { PagoEmpleado } from "@/lib/types/database.types";
import { RegistrarPagoDialog } from "./registrar-pago-dialog";

interface Props {
  nominaResult: NominaResult | null;
  idEmpleado: string;
  nombreEmpleado: string;
  periodoDesde: string;
  periodoHasta: string;
  diasTrabajados: number;
  salarioDiario: number;
  tipoSalario: "diario" | "mensual";
  valorHoraExtra: number;
  minutosExtra: number;
  minutosAtraso: number;
  minutosSalidaTemprana: number;
  faltasNoJustificadas: number;
  periodoYaPagado?: PagoEmpleado;
  cantidadAdelantos?: number;
}

interface LineItemProps {
  label: string;
  sub?: string;
  value: string;
  tone?: "positive" | "negative" | "neutral";
  tachado?: boolean;
}

function LineItem({ label, sub, value, tone = "neutral", tachado }: LineItemProps) {
  const valueClass =
    tone === "positive"
      ? "text-emerald-600 dark:text-emerald-400"
      : tone === "negative"
        ? "text-red-600 dark:text-red-400"
        : "text-foreground";

  return (
    <div className={`flex items-start justify-between gap-4 ${tachado ? "opacity-50" : ""}`}>
      <div className="min-w-0">
        <span className={`text-sm text-foreground ${tachado ? "line-through" : ""}`}>{label}</span>
        {sub && <span className="ml-1.5 text-xs text-muted-foreground">{sub}</span>}
      </div>
      <span className={`shrink-0 text-sm font-medium tabular-nums ${valueClass} ${tachado ? "line-through" : ""}`}>{value}</span>
    </div>
  );
}

export function NominaCard({
  nominaResult,
  idEmpleado,
  nombreEmpleado,
  periodoDesde,
  periodoHasta,
  diasTrabajados,
  salarioDiario,
  tipoSalario,
  valorHoraExtra,
  minutosExtra,
  minutosAtraso,
  minutosSalidaTemprana,
  faltasNoJustificadas,
  periodoYaPagado,
  cantidadAdelantos = 0,
}: Props) {
  if (!nominaResult || salarioDiario === 0) {
    return (
      <div className="flex w-full flex-col gap-3 rounded-2xl border border-dashed border-border bg-card px-5 py-5">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Settings className="size-4" />
          <span className="text-sm font-medium">Nómina no configurada</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Configura el salario del empleado para ver el cálculo de nómina automático.
        </p>
      </div>
    );
  }

  const registrarInput: Omit<RegistrarPagoInput, "notas"> = {
    idEmpleado,
    periodoDesde,
    periodoHasta,
    diasTrabajados,
    salarioDiario,
    tipoSalario,
    salarioBase: nominaResult.base,
    pagoHorasExtra: nominaResult.pagoHorasExtra,
    deduccionAtrasos: nominaResult.deduccionAtrasos,
    deduccionFaltas: nominaResult.deduccionFaltas,
    faltasNoJustificadas,
    minutosExtraTotal: minutosExtra,
    minutosAtrasoTotal: minutosAtraso,
    montoTotal: nominaResult.totalAPagar,
  };

  const pagado = !!periodoYaPagado;
  const horasExtraSub =
    valorHoraExtra > 0
      ? `${formatHoras(minutosExtra)} × ${formatMoney(valorHoraExtra)}/h`
      : formatHoras(minutosExtra);

  return (
    <div className="flex w-full flex-col gap-0 rounded-2xl border border-border bg-card shadow-[0px_4px_20px_rgba(0,0,0,0.03)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Nómina estimada</h3>
          <p className="text-xs text-muted-foreground">
            {tipoSalario === "diario"
              ? `${formatMoney(salarioDiario)} / día`
              : `${formatMoney(salarioDiario)} / mes`}
            {nominaResult.tarifaHora > 0 && ` · Tarifa hora: ${formatMoney(nominaResult.tarifaHora)}`}
            {valorHoraExtra > 0 && ` · Hora extra: ${formatMoney(valorHoraExtra)}`}
          </p>
        </div>
        <RegistrarPagoDialog
          idEmpleado={idEmpleado}
          nombreEmpleado={nombreEmpleado}
          periodoDesde={periodoDesde}
          periodoHasta={periodoHasta}
          preloaded={registrarInput}
          deduccionAdelantos={nominaResult.deduccionAdelantos}
          cantidadAdelantos={cantidadAdelantos}
        />
      </div>

      {/* Period already paid banner */}
      {pagado && periodoYaPagado && (
        <div className="flex items-center gap-2 border-b border-emerald-500/20 bg-emerald-500/6 px-5 py-2.5">
          <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs text-emerald-700 dark:text-emerald-400">
            Período cubierto · Pago registrado el{" "}
            {format(parseISO(periodoYaPagado.created_at), "d MMM yyyy", { locale: es })} ·{" "}
            <span className="font-semibold">{formatMoney(periodoYaPagado.monto_total)}</span>
          </span>
        </div>
      )}

      {/* Breakdown */}
      <div className={`flex flex-col gap-2.5 px-5 py-4 ${pagado ? "opacity-60" : ""}`}>
        <LineItem
          label="Salario base"
          sub={`${diasTrabajados} día${diasTrabajados !== 1 ? "s" : ""} × ${formatMoney(nominaResult.salarioDia)}`}
          value={formatMoney(nominaResult.base)}
          tachado={pagado}
        />
        {nominaResult.pagoHorasExtra > 0 && (
          <LineItem
            label="Horas extra"
            sub={horasExtraSub}
            value={formatMoney(nominaResult.pagoHorasExtra, true)}
            tone="positive"
            tachado={pagado}
          />
        )}
        {nominaResult.deduccionAtrasos > 0 && (
          <LineItem
            label="Deducción atrasos"
            sub={formatHoras(minutosAtraso)}
            value={`-${formatMoney(nominaResult.deduccionAtrasos)}`}
            tone="negative"
            tachado={pagado}
          />
        )}
        {nominaResult.deduccionIncompleto > 0 && (
          <LineItem
            label="Deducción registro incompleto"
            sub={formatHoras(minutosSalidaTemprana)}
            value={`-${formatMoney(nominaResult.deduccionIncompleto)}`}
            tone="negative"
            tachado={pagado}
          />
        )}
        {nominaResult.deduccionFaltas > 0 && (
          <LineItem
            label="Deducción faltas"
            sub={`${faltasNoJustificadas} falta${faltasNoJustificadas !== 1 ? "s" : ""} no justificada${faltasNoJustificadas !== 1 ? "s" : ""}`}
            value={`-${formatMoney(nominaResult.deduccionFaltas)}`}
            tone="negative"
            tachado={pagado}
          />
        )}
        {nominaResult.deduccionAdelantos > 0 && (
          <LineItem
            label="Adelantos descontados"
            sub={`${cantidadAdelantos} adelanto${cantidadAdelantos !== 1 ? "s" : ""} en el período`}
            value={`-${formatMoney(nominaResult.deduccionAdelantos)}`}
            tone="negative"
            tachado={pagado}
          />
        )}

        {/* Divider + total */}
        <div className="mt-1 border-t border-border pt-3">
          {nominaResult.deduccionAdelantos > 0 && (
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Neto devengado</span>
              <span className="text-sm tabular-nums text-muted-foreground">
                {formatMoney(nominaResult.neto)}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className={`text-sm font-semibold text-foreground ${pagado ? "line-through opacity-50" : ""}`}>
              Total a pagar
            </span>
            <span className={`text-xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400 ${pagado ? "line-through opacity-50" : ""}`}>
              {formatMoney(nominaResult.totalAPagar)}
            </span>
          </div>
          {pagado && (
            <p className="mt-1 text-right text-xs text-muted-foreground">
              Puedes registrar un pago adicional si corresponde
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
