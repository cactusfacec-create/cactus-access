export type TipoSalario = "diario" | "mensual";

export interface NominaConfig {
  salario: number;
  tipo: TipoSalario;
  horasJornada: number;
  valorHoraExtra: number;
  descuentaAtrasos: boolean;
}

export interface NominaInput {
  diasTrabajados: number;
  minutosExtra: number;
  minutosAtraso: number;
  faltasNoJustificadas: number;
  minutosSalidaTemprana: number;
  adelantos?: number;
}

export interface NominaResult {
  salarioDia: number;
  tarifaHora: number;
  horasExtraDecimal: number;
  base: number;
  pagoHorasExtra: number;
  deduccionAtrasos: number;
  deduccionFaltas: number;
  deduccionIncompleto: number;
  deduccionAdelantos: number;
  neto: number;
  totalAPagar: number;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function calcularNomina(cfg: NominaConfig, input: NominaInput): NominaResult {
  const salarioDia =
    cfg.tipo === "diario" ? cfg.salario : round2(cfg.salario / 30);

  const tarifaHora = cfg.horasJornada > 0 ? round2(salarioDia / cfg.horasJornada) : 0;

  const horasExtraDecimal = round2(input.minutosExtra / 60);

  const base = round2(input.diasTrabajados * salarioDia);
  const pagoHorasExtra = round2(horasExtraDecimal * cfg.valorHoraExtra);
  const deduccionAtrasos = cfg.descuentaAtrasos
    ? round2((input.minutosAtraso / 60) * tarifaHora)
    : 0;
  const deduccionFaltas = round2(input.faltasNoJustificadas * salarioDia);
  const deduccionIncompleto = round2((input.minutosSalidaTemprana / 60) * tarifaHora);
  const deduccionAdelantos = round2(input.adelantos ?? 0);

  const neto = round2(
    Math.max(0, base + pagoHorasExtra - deduccionAtrasos - deduccionFaltas - deduccionIncompleto),
  );
  const totalAPagar = round2(Math.max(0, neto - deduccionAdelantos));

  return {
    salarioDia,
    tarifaHora,
    horasExtraDecimal,
    base,
    pagoHorasExtra,
    deduccionAtrasos,
    deduccionFaltas,
    deduccionIncompleto,
    deduccionAdelantos,
    neto,
    totalAPagar,
  };
}

export function formatMoney(n: number, showSign = false): string {
  const abs = Math.abs(n).toFixed(2);
  if (showSign) return n >= 0 ? `+$${abs}` : `-$${abs}`;
  return `$${abs}`;
}

export function formatHoras(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}
