"use client";

import { useState, useRef, useTransition, useEffect, useMemo } from "react";
import {
  Banknote,
  ArrowLeftRight,
  Upload,
  X,
  CheckCircle2,
  CalendarIcon,
  CreditCard,
  ChevronLeft,
  Check,
  Building2,
  BadgeCheck,
  Calendar as CalendarIconSolid,
  Wallet,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { registrarPago, uploadComprobante } from "@/actions/admin/pagos.actions";
import { getPlanes } from "@/actions/admin/planes.actions";
import { toast } from "sonner";
import type { Licencia, Plan } from "@/lib/types/database.types";

type MetodoPago = "efectivo" | "transferencia";
type PlanTipo = "pro" | "max" | "personalizado";
type Periodo = "trimestral" | "semestral" | "anual";

const METODOS: { value: MetodoPago; label: string; icon: React.ReactNode }[] = [
  { value: "transferencia", label: "Transferencia", icon: <ArrowLeftRight className="size-4" /> },
  { value: "efectivo", label: "Efectivo", icon: <Banknote className="size-4" /> },
];

const PLAN_OPTIONS: { label: string; value: PlanTipo }[] = [
  { label: "Pro", value: "pro" },
  { label: "Max", value: "max" },
  { label: "Personalizado", value: "personalizado" },
];

const PERIODO_OPTIONS: { label: string; value: Periodo; meses: number }[] = [
  { label: "Trimestral (3 meses)", value: "trimestral", meses: 3 },
  { label: "Semestral (6 meses)", value: "semestral", meses: 6 },
  { label: "Anual (12 meses)", value: "anual", meses: 12 },
];

function addMonths(date: Date, months: number): string {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("es-EC", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtDateLong(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("es-EC", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function fmtMoney(n: number) {
  return new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" }).format(n);
}

function resolveDefaultPlan(licencia: Licencia | null): PlanTipo {
  const t = licencia?.plan_tipo;
  if (t === "pro" || t === "max" || t === "personalizado") return t;
  return "pro";
}

function resolveDefaultPeriodo(licencia: Licencia | null): Periodo {
  const p = licencia?.periodo_facturacion;
  if (p === "trimestral" || p === "semestral" || p === "anual") return p;
  return "anual";
}

function DatePickerField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (iso: string) => void;
}) {
  const selected = value ? new Date(value + "T00:00:00") : undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Popover>
        <PopoverTrigger
          render={
            <button
              id={id}
              type="button"
              className="flex h-10 w-full cursor-pointer items-center gap-2 rounded-lg border border-input bg-background px-3 text-left text-sm transition-colors hover:bg-muted/30 focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
              <span className={!selected ? "text-muted-foreground" : ""}>
                {selected ? fmtDate(value) : "Seleccionar fecha"}
              </span>
            </button>
          }
        />
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(date) => {
              if (date) onChange(date.toISOString().slice(0, 10));
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function InfoRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="shrink-0 text-sm text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-right text-sm",
          highlight ? "font-semibold text-foreground" : "text-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function RegistrarPagoDialog({
  idEmpresa,
  nombreEmpresa,
  licencia,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: {
  idEmpresa: string;
  nombreEmpresa: string;
  licencia: Licencia | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);

  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? controlledOpen! : internalOpen;
  const setOpen = isControlled
    ? (next: boolean) => controlledOnOpenChange?.(next)
    : setInternalOpen;

  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState<"form" | "confirm">("form");
  const [planes, setPlanes] = useState<Plan[]>([]);

  const [metodo, setMetodo] = useState<MetodoPago>("transferencia");
  const [plan, setPlan] = useState<PlanTipo>(resolveDefaultPlan(licencia));
  const [periodo, setPeriodo] = useState<Periodo>(resolveDefaultPeriodo(licencia));
  const [fechaDesde, setFechaDesde] = useState(today);
  const [fechaHasta, setFechaHasta] = useState(() => {
    const meses = PERIODO_OPTIONS.find((o) => o.value === resolveDefaultPeriodo(licencia))?.meses ?? 12;
    return addMonths(new Date(), meses);
  });
  const [codigo, setCodigo] = useState("");
  const [notas, setNotas] = useState("");
  const [comprobanteUrl, setComprobanteUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setStep("form");
    getPlanes().then(setPlanes);

    const defaultPlan = resolveDefaultPlan(licencia);
    const defaultPeriodo = resolveDefaultPeriodo(licencia);
    const defaultMeses = PERIODO_OPTIONS.find((o) => o.value === defaultPeriodo)?.meses ?? 12;

    setMetodo("transferencia");
    setPlan(defaultPlan);
    setPeriodo(defaultPeriodo);
    setFechaDesde(today);
    setFechaHasta(addMonths(new Date(), defaultMeses));
    setCodigo("");
    setNotas("");
    setComprobanteUrl("");
    setFileName("");
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const computedMonto = useMemo(() => {
    if (plan === "personalizado") return licencia?.precio ?? 0;
    const p = planes.find((pl) => pl.id === plan);
    if (!p) return null; // still loading
    if (periodo === "trimestral") return p.precio_trimestral;
    if (periodo === "semestral") return p.precio_semestral;
    return p.precio_anual;
  }, [plan, periodo, planes, licencia]);

  function handlePeriodoChange(p: Periodo) {
    setPeriodo(p);
    const meses = PERIODO_OPTIONS.find((o) => o.value === p)?.meses ?? 12;
    setFechaHasta(addMonths(new Date(fechaDesde), meses));
  }

  function handleFechaDesdeChange(d: string) {
    setFechaDesde(d);
    const meses = PERIODO_OPTIONS.find((o) => o.value === periodo)?.meses ?? 12;
    setFechaHasta(addMonths(new Date(d), meses));
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadComprobante(fd);
    setUploading(false);
    if (result.ok && result.data) {
      setComprobanteUrl(result.data.url);
      setFileName(file.name);
    } else {
      toast.error("No se pudo subir el archivo");
    }
  }

  function handleContinuar(e: React.FormEvent) {
    e.preventDefault();
    setStep("confirm");
  }

  function handleConfirm() {
    startTransition(async () => {
      const result = await registrarPago({
        idEmpresa,
        metodoPago: metodo,
        monto: computedMonto ?? 0,
        planTipo: plan,
        periodoFacturacion: periodo,
        fechaDesde,
        fechaHasta,
        limiteSucursales:
          plan === "personalizado" ? (licencia?.limite_sucursales ?? 1) : undefined,
        limiteEmpleados:
          plan === "personalizado" ? (licencia?.limite_empleados ?? 5) : undefined,
        codigoTransaccion: codigo || undefined,
        comprobanteUrl: comprobanteUrl || undefined,
        notas: notas || undefined,
      });
      if (result.ok) {
        const planLabel = PLAN_OPTIONS.find((o) => o.value === plan)?.label ?? plan;
        const periodoLabel = PERIODO_OPTIONS.find((o) => o.value === periodo)?.label ?? periodo;
        toast.success("Pago registrado · Licencia renovada", {
          description: `${planLabel} · ${periodoLabel} — vigente hasta ${fmtDateLong(fechaHasta)}`,
          duration: 6000,
        });
        setOpen(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  const planLabel = PLAN_OPTIONS.find((o) => o.value === plan)?.label ?? plan;
  const periodoLabel = PERIODO_OPTIONS.find((o) => o.value === periodo)?.label ?? periodo;
  const metodoLabel = METODOS.find((m) => m.value === metodo)?.label ?? metodo;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label="Registrar pago">
              <CreditCard className="size-4" />
            </Button>
          }
        />
      )}

      <DialogContent className="flex max-h-[85vh] max-w-lg flex-col gap-0 overflow-hidden p-0">
        {/* ── HEADER fijo ── */}
        <DialogHeader className="shrink-0 border-b border-border px-5 py-4">
          <DialogTitle className="text-base">
            {step === "form" ? `Pago manual — ${nombreEmpresa}` : "Confirmar renovación de licencia"}
          </DialogTitle>
        </DialogHeader>

        {step === "form" ? (
          <>
            {/* ── CONTENIDO scrolleable ── */}
            <form
              id="pago-form"
              onSubmit={handleContinuar}
              className="flex flex-1 flex-col overflow-hidden"
            >
              <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-4">
                {/* Método de pago */}
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium">Método de pago *</Label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">
                    {METODOS.map((m) => (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => setMetodo(m.value)}
                        className={cn(
                          "flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors",
                          metodo === m.value
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                        )}
                      >
                        {m.icon}
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Plan + Período */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="rp-plan">Plan *</Label>
                    <select
                      id="rp-plan"
                      value={plan}
                      onChange={(e) => setPlan(e.target.value as PlanTipo)}
                      className="h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {PLAN_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="rp-periodo">Período *</Label>
                    <select
                      id="rp-periodo"
                      value={periodo}
                      onChange={(e) => handlePeriodoChange(e.target.value as Periodo)}
                      className="h-10 cursor-pointer rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {PERIODO_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Monto informativo */}
                <div className="flex flex-col gap-1.5">
                  <Label>Monto a cobrar</Label>
                  <div className="flex h-10 items-center gap-2 rounded-lg border border-input bg-muted/40 px-3">
                    <span className="text-sm text-muted-foreground">$</span>
                    <span className="flex-1 text-sm font-semibold tabular-nums text-foreground">
                      {computedMonto === null
                        ? "Cargando…"
                        : new Intl.NumberFormat("es-EC", { minimumFractionDigits: 2 }).format(
                            computedMonto,
                          )}
                    </span>
                    <span className="text-xs text-muted-foreground/60">
                      {plan === "personalizado" ? "configurado en licencia" : "configurado en planes"}
                    </span>
                  </div>
                </div>

                {/* Fechas */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <DatePickerField
                    id="rp-desde"
                    label="Desde *"
                    value={fechaDesde}
                    onChange={handleFechaDesdeChange}
                  />
                  <DatePickerField
                    id="rp-hasta"
                    label="Hasta *"
                    value={fechaHasta}
                    onChange={setFechaHasta}
                  />
                </div>

                {/* Separador — campos opcionales */}
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground">Datos opcionales</span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                {/* Código de transacción */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="rp-codigo">Código de transacción</Label>
                  <Input
                    id="rp-codigo"
                    placeholder="Ej: TXN-123456789"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                  />
                </div>

                {/* Comprobante */}
                <div className="flex flex-col gap-1.5">
                  <Label>Comprobante de pago</Label>
                  {comprobanteUrl ? (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 dark:border-emerald-800 dark:bg-emerald-950/30">
                      <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                      <span className="flex-1 truncate text-xs text-emerald-700 dark:text-emerald-400">
                        {fileName || comprobanteUrl}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setComprobanteUrl("");
                          setFileName("");
                        }}
                        className="shrink-0 text-emerald-600 hover:text-emerald-800"
                        aria-label="Quitar comprobante"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border py-4 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/30 hover:text-foreground disabled:opacity-50"
                      >
                        <Upload className="size-4" />
                        {uploading ? "Subiendo…" : "Subir imagen o PDF (máx. 5 MB)"}
                      </button>
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      <div className="flex items-center gap-2">
                        <div className="h-px flex-1 bg-border" />
                        <span className="text-xs text-muted-foreground">o pegar URL</span>
                        <div className="h-px flex-1 bg-border" />
                      </div>
                      <Input
                        placeholder="https://…"
                        value={comprobanteUrl}
                        onChange={(e) => setComprobanteUrl(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                {/* Notas */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="rp-notas">Notas internas</Label>
                  <textarea
                    id="rp-notas"
                    rows={2}
                    placeholder="Observaciones adicionales…"
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    className="resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              {/* ── FOOTER fijo ── */}
              <div className="shrink-0 border-t border-border bg-muted/50 px-5 py-3">
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={computedMonto === null || uploading}>
                    Continuar
                  </Button>
                </div>
              </div>
            </form>
          </>
        ) : (
          <>
            {/* ── CONTENIDO CONFIRMACIÓN scrolleable ── */}
            <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-4">
              {/* Tarjeta de resumen */}
              <div className="flex flex-col gap-0 overflow-hidden rounded-2xl border border-border">
                {/* Header de la tarjeta */}
                <div className="flex items-center gap-2 bg-muted/50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <Check className="size-3.5" />
                  Resumen del pago
                </div>

                <div className="flex flex-col gap-0 divide-y divide-border/60 px-4 py-1">
                  <div className="py-3">
                    <div className="flex items-center gap-2.5">
                      <Building2 className="size-4 shrink-0 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Empresa</p>
                        <p className="text-sm font-medium text-foreground">{nombreEmpresa}</p>
                      </div>
                    </div>
                  </div>

                  <div className="py-3">
                    <div className="flex items-center gap-2.5">
                      <BadgeCheck className="size-4 shrink-0 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Plan y período</p>
                        <p className="text-sm font-medium text-foreground">
                          {planLabel}{" "}
                          <span className="font-normal text-muted-foreground">· {periodoLabel}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="py-3">
                    <div className="flex items-center gap-2.5">
                      <Wallet className="size-4 shrink-0 text-muted-foreground" />
                      <div className="flex-1 flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Método · Monto</p>
                          <p className="text-sm text-foreground">{metodoLabel}</p>
                        </div>
                        <span className="font-mono text-lg font-bold tabular-nums text-foreground">
                          {fmtMoney(computedMonto ?? 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="py-3">
                    <div className="flex items-center gap-2.5">
                      <CalendarIconSolid className="size-4 shrink-0 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Vigencia de la licencia</p>
                        <p className="text-sm font-medium text-foreground">
                          {fmtDate(fechaDesde)}{" "}
                          <span className="text-muted-foreground">→</span>{" "}
                          <span className="text-emerald-600 dark:text-emerald-400">
                            {fmtDate(fechaHasta)}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detalles extra si existen */}
              {(codigo || notas || comprobanteUrl) && (
                <div className="flex flex-col gap-2 rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
                  {codigo && <InfoRow label="Código transacción" value={codigo} />}
                  {comprobanteUrl && <InfoRow label="Comprobante" value={fileName || "Adjunto"} />}
                  {notas && <InfoRow label="Notas" value={notas} />}
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Al confirmar se registrará el pago y la licencia de{" "}
                <strong>{nombreEmpresa}</strong> quedará activa hasta el{" "}
                <strong>{fmtDateLong(fechaHasta)}</strong>.
              </p>
            </div>

            {/* ── FOOTER fijo confirmación ── */}
            <div className="shrink-0 border-t border-border bg-muted/50 px-5 py-3">
              <div className="flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("form")}
                  disabled={pending}
                >
                  <ChevronLeft className="size-4" />
                  Volver
                </Button>
                <Button onClick={handleConfirm} disabled={pending}>
                  {pending ? "Registrando…" : "Confirmar y renovar licencia"}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
