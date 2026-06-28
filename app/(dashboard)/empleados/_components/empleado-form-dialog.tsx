"use client";

import { useState, useTransition, useEffect, type TransitionStartFunction } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, User, DollarSign, Clock, Info } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { LoadingButton } from "@/components/cactus/loading-button";
import { PhoneInput, parsePhone, combinePhone } from "@/components/forms/phone-input";
import { empleadoSchema, type EmpleadoInput } from "@/lib/validations/empleado.schema";
import { DiaCorteCalendar } from "@/components/forms/dia-corte-picker";
import { createEmpleado, updateEmpleado } from "@/actions/empleados.actions";
import type { Empleado, HorarioEmpleado, Sucursal } from "@/lib/types/database.types";
import type { ActionResult } from "@/lib/types/domain";

/* ── Section header ── */
function SectionHeader({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

/* ── Field wrapper ── */
function Field({
  label,
  htmlFor,
  error,
  help,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {help && !error && <p className="text-xs text-muted-foreground">{help}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

/* ── Switch row ── */
function SwitchRow({
  id,
  label,
  description,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-muted/30 px-4 py-3">
      <div className="flex flex-col gap-0.5">
        <Label htmlFor={id} className="cursor-pointer text-sm font-medium">
          {label}
        </Label>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

/* ── Styled select ── */
function NativeSelect({
  id,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { id?: string }) {
  return (
    <select
      id={id}
      className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      {...props}
    >
      {children}
    </select>
  );
}

/* ── Styled time input ── */
function TimeInput({ id, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      id={id}
      type="time"
      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      {...props}
    />
  );
}

/* ── Form body (fields only, no footer) ── */
interface FormBodyProps {
  sucursales: Sucursal[];
  prefill?: { cedula: string; sucursalId: string };
  horarioEmpleado?: HorarioEmpleado;
  empleado?: Empleado;
  startTransition: TransitionStartFunction;
  onSubmit: (values: EmpleadoInput) => Promise<ActionResult>;
  onClose: () => void;
}

function EmpleadoFormBody({
  sucursales,
  prefill,
  horarioEmpleado,
  empleado,
  startTransition,
  onSubmit,
  onClose,
}: FormBodyProps) {
  const parsedPhone = parsePhone(empleado?.telefono);
  const [phoneCode, setPhoneCode] = useState(parsedPhone.code);
  const [phoneDigits, setPhoneDigits] = useState(parsedPhone.digits);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EmpleadoInput>({
    resolver: zodResolver(empleadoSchema) as Resolver<EmpleadoInput>,
    defaultValues: {
      nombre: empleado?.nombre ?? "",
      cedula: empleado?.cedula ?? prefill?.cedula ?? "",
      telefono: "",
      sucursalId: empleado?.id_sucursal ?? prefill?.sucursalId ?? undefined,
      fechaIngreso: empleado?.fecha_ingreso ?? new Date().toISOString().slice(0, 10),
      tipoSalario: empleado?.tipo_salario ?? "diario",
      salarioDiario: empleado?.salario_diario ?? 0,
      horasJornada: empleado?.horas_jornada ?? 8,
      valorHoraExtra: empleado?.multiplicador_hora_extra ?? 0,
      descuentaAtrasos: empleado?.descuenta_atrasos ?? false,
      diaCorte: empleado?.dia_corte ?? undefined,
      usaHorarioGlobal: horarioEmpleado?.usa_horario_global ?? true,
      jornada1IncluyeAlmuerzo: Boolean(
        horarioEmpleado?.jornada1_salida_almuerzo && horarioEmpleado?.jornada1_entrada_almuerzo,
      ),
      jornada1Entrada: horarioEmpleado?.jornada1_entrada ?? "",
      jornada1SalidaAlmuerzo: horarioEmpleado?.jornada1_salida_almuerzo ?? "",
      jornada1EntradaAlmuerzo: horarioEmpleado?.jornada1_entrada_almuerzo ?? "",
      jornada1Salida: horarioEmpleado?.jornada1_salida ?? "",
    },
  });

  const usaHorarioGlobal = watch("usaHorarioGlobal");
  const incluyeAlmuerzo = watch("jornada1IncluyeAlmuerzo");
  const tipoSalario = watch("tipoSalario");
  const horasJornada = watch("horasJornada");
  const sucursalId = watch("sucursalId");
  const jornada1Entrada = watch("jornada1Entrada");
  const jornada1Salida = watch("jornada1Salida");
  const jornada1SalidaAlmuerzo = watch("jornada1SalidaAlmuerzo");
  const jornada1EntradaAlmuerzo = watch("jornada1EntradaAlmuerzo");

  const sucursal = sucursales.find((s) => s.id === sucursalId);

  // Auto-calculate hours from whichever schedule is active
  useEffect(() => {
    const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };

    let entrada: string | null = null;
    let salida: string | null = null;
    let salidaAlm: string | null = null;
    let entradaAlm: string | null = null;
    let conAlm = false;

    if (usaHorarioGlobal && sucursal) {
      entrada = sucursal.jornada1_entrada;
      salida = sucursal.jornada1_salida;
      salidaAlm = sucursal.jornada1_salida_almuerzo;
      entradaAlm = sucursal.jornada1_entrada_almuerzo;
      conAlm = !!(salidaAlm && entradaAlm);
    } else if (!usaHorarioGlobal) {
      entrada = jornada1Entrada || null;
      salida = jornada1Salida || null;
      salidaAlm = jornada1SalidaAlmuerzo || null;
      entradaAlm = jornada1EntradaAlmuerzo || null;
      conAlm = incluyeAlmuerzo;
    }

    if (!entrada || !salida) return;
    let total = toMin(salida) - toMin(entrada);
    if (conAlm && salidaAlm && entradaAlm) {
      total -= toMin(entradaAlm) - toMin(salidaAlm);
    }
    if (total > 0) setValue("horasJornada", Math.round((total / 60) * 100) / 100);
  }, [usaHorarioGlobal, sucursalId, sucursal, jornada1Entrada, jornada1Salida, jornada1SalidaAlmuerzo, jornada1EntradaAlmuerzo, incluyeAlmuerzo, setValue]);

  function submit(values: EmpleadoInput) {
    startTransition(async () => {
      const telefono = combinePhone(phoneCode, phoneDigits);
      const res = await onSubmit({ ...values, telefono });
      if (res.ok) {
        toast.success(empleado ? "Empleado actualizado" : "Empleado creado");
        onClose();
      } else {
        toast.error(res.error ?? "Error inesperado");
      }
    });
  }

  return (
    <form id="empleado-form" onSubmit={handleSubmit(submit)} className="flex flex-col gap-5">
      {/* ── Datos personales ── */}
      <SectionHeader label="Datos personales" icon={<User className="size-3.5" />} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Nombre" htmlFor="nombre" error={errors.nombre?.message}>
          <Input id="nombre" {...register("nombre")} placeholder="Ej: Juan Pérez" />
        </Field>
        <Field label="Cédula" htmlFor="cedula" error={errors.cedula?.message}>
          <Input id="cedula" {...register("cedula")} placeholder="0503008732" />
        </Field>
      </div>

      <PhoneInput
        id="telefono-emp"
        label="Teléfono"
        code={phoneCode}
        digits={phoneDigits}
        onCodeChange={setPhoneCode}
        onDigitsChange={setPhoneDigits}
        helperText="Opcional — para contacto o notificaciones"
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Sucursal" htmlFor="sucursalId">
          <NativeSelect id="sucursalId" {...register("sucursalId")}>
            <option value="">Sin sucursal</option>
            {sucursales.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre_sucursal}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field label="Fecha de ingreso" htmlFor="fechaIngreso" error={errors.fechaIngreso?.message}>
          <Input id="fechaIngreso" type="date" {...register("fechaIngreso")} />
        </Field>
      </div>

      {/* ── Nómina ── */}
      <SectionHeader label="Nómina" icon={<DollarSign className="size-3.5" />} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Tipo de salario" htmlFor="tipoSalario">
          <NativeSelect id="tipoSalario" {...register("tipoSalario")}>
            <option value="diario">Por día</option>
            <option value="mensual">Mensual</option>
          </NativeSelect>
        </Field>
        <Field
          label={tipoSalario === "mensual" ? "Salario mensual ($)" : "Salario por día ($)"}
          htmlFor="salarioDiario"
          error={errors.salarioDiario?.message}
        >
          <Input
            id="salarioDiario"
            type="number"
            min={0}
            step={0.01}
            placeholder="0.00"
            {...register("salarioDiario")}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2">
        {/* Always informative — auto-calculated from schedule */}
        <div className="flex flex-col gap-1.5">
          <Label>Horas por jornada</Label>
          <div className="flex h-9 items-center rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground">
            {horasJornada ?? 8}h
          </div>
          <p className="text-xs text-muted-foreground">
            {usaHorarioGlobal
              ? sucursal?.jornada1_entrada && sucursal?.jornada1_salida
                ? `Horario de ${sucursal.nombre_sucursal}`
                : "Sin horario de sucursal"
              : "Calculado del horario personalizado"}
          </p>
        </div>
        <Field
          label="Valor hora extra ($)"
          htmlFor="valorHoraExtra"
          error={errors.valorHoraExtra?.message}
          help="Pago por cada hora extra trabajada"
        >
          <Input
            id="valorHoraExtra"
            type="number"
            min={0}
            step={0.01}
            placeholder="0.00"
            {...register("valorHoraExtra")}
          />
        </Field>
      </div>

      <Controller
        name="descuentaAtrasos"
        control={control}
        render={({ field }) => (
          <SwitchRow
            id="descuentaAtrasos"
            label="Descontar atrasos del sueldo"
            description="El tiempo de atraso se deduce proporcionalmente del pago"
            checked={field.value}
            onCheckedChange={field.onChange}
          />
        )}
      />

      <Controller
        name="diaCorte"
        control={control}
        render={({ field }) => (
          <div className="flex flex-col gap-1.5">
            <Label>Día de corte de nómina</Label>
            <DiaCorteCalendar
              value={field.value ?? null}
              onChange={(day) => field.onChange(day ?? undefined)}
            />
            <p className="text-xs text-muted-foreground">
              Si no se configura, se usa el corte de la sucursal o el mes calendario.
            </p>
          </div>
        )}
      />

      {/* ── Horario ── */}
      <SectionHeader label="Horario" icon={<Clock className="size-3.5" />} />

      <Controller
        name="usaHorarioGlobal"
        control={control}
        render={({ field }) => (
          <SwitchRow
            id="usaHorarioGlobal"
            label="Usar horario de la sucursal"
            description="Hereda el horario definido en la sucursal asignada"
            checked={field.value}
            onCheckedChange={field.onChange}
          />
        )}
      />

      {!usaHorarioGlobal && (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/20 p-4">
          <div className="flex items-start gap-2 rounded-lg bg-blue-500/8 px-3 py-2">
            <Info className="mt-0.5 size-3.5 shrink-0 text-blue-500" />
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Horario personalizado — sobreescribe el de la sucursal
            </p>
          </div>

          <Controller
            name="jornada1IncluyeAlmuerzo"
            control={control}
            render={({ field }) => (
              <SwitchRow
                id="jornada1IncluyeAlmuerzo"
                label="Incluye receso de almuerzo"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Hora de entrada" htmlFor="j1entrada">
              <TimeInput id="j1entrada" {...register("jornada1Entrada")} />
            </Field>
            <Field label="Hora de salida" htmlFor="j1salida">
              <TimeInput id="j1salida" {...register("jornada1Salida")} />
            </Field>
          </div>

          {incluyeAlmuerzo && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Salida al almuerzo" htmlFor="j1salalmuerzo">
                <TimeInput id="j1salalmuerzo" {...register("jornada1SalidaAlmuerzo")} />
              </Field>
              <Field label="Regreso del almuerzo" htmlFor="j1regalmuerzo">
                <TimeInput id="j1regalmuerzo" {...register("jornada1EntradaAlmuerzo")} />
              </Field>
            </div>
          )}
        </div>
      )}
    </form>
  );
}

/* ── Public component ── */
interface EmpleadoFormDialogProps {
  mode: "create" | "edit";
  empleado?: Empleado;
  horarioEmpleado?: HorarioEmpleado;
  sucursales: Sucursal[];
  prefill?: { cedula: string; sucursalId: string };
  trigger?: React.ReactElement;
  onSubmitOverride?: (values: EmpleadoInput) => Promise<ActionResult>;
}

export function EmpleadoFormDialog({
  mode,
  empleado,
  horarioEmpleado,
  sucursales,
  prefill,
  trigger,
  onSubmitOverride,
}: EmpleadoFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const defaultTrigger =
    mode === "edit" ? (
      <Button variant="ghost" size="icon-sm" aria-label={`Editar ${empleado?.nombre}`}>
        <Pencil className="size-4" />
      </Button>
    ) : (
      <Button>
        <Plus className="size-4" />
        Nuevo empleado
      </Button>
    );

  const handleAction = (values: EmpleadoInput) => {
    if (onSubmitOverride) return onSubmitOverride(values);
    if (mode === "edit" && empleado) return updateEmpleado(empleado.id, values);
    return createEmpleado(values);
  };

  return (
    <>
      <div onClick={() => setOpen(true)} className="contents">
        {trigger ?? defaultTrigger}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[90vh] max-w-lg flex-col gap-0 p-0">
          {/* Sticky title */}
          <DialogHeader className="shrink-0 border-b border-border px-6 py-4">
            <DialogTitle>
              {mode === "edit" ? "Editar empleado" : "Nuevo empleado"}
            </DialogTitle>
          </DialogHeader>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <EmpleadoFormBody
              key={open ? "open" : "closed"}
              sucursales={sucursales}
              prefill={prefill}
              horarioEmpleado={horarioEmpleado}
              empleado={empleado}
              startTransition={startTransition}
              onSubmit={handleAction}
              onClose={() => setOpen(false)}
            />
          </div>

          {/* Sticky footer */}
          <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border px-6 py-4">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancelar
            </Button>
            <LoadingButton form="empleado-form" type="submit" loading={isPending}>
              {isPending ? "Guardando…" : "Guardar"}
            </LoadingButton>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
