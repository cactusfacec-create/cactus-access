import Link from "next/link";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Clock,
  Cpu,
  FileCheck2,
  Info,
  MapPin,
  MessageCircle,
  Network,
  ShieldCheck,
  Sparkles,
  UserSearch,
  Wifi,
  Zap,
} from "lucide-react";

const SECTIONS = [
  { id: "dispositivos", label: "Dispositivos biométricos" },
  { id: "no-reconocidos", label: "Registros No Reconocidos" },
  { id: "jornadas", label: "Jornadas y horarios" },
  { id: "asistencias", label: "Estados de asistencia" },
  { id: "justificaciones", label: "Justificaciones de faltas" },
  { id: "dos-pasos", label: "Verificación en dos pasos" },
  { id: "calendario", label: "Calendario y feriados" },
];

export default function GuiaPage() {
  return (
    <div className="mx-auto max-w-[1400px] p-4 sm:p-6">
      {/* Header */}
      <div className="mb-8 border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BookOpen className="size-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Guía de uso</h1>
            <p className="text-sm text-muted-foreground">
              Todo lo que necesitas saber para sacar el máximo provecho de Cactus Access
            </p>
          </div>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-10">
        {/* TOC — sticky sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              En esta guía
            </p>
            <nav className="flex flex-col gap-0.5">
              {SECTIONS.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {s.label}
                </a>
              ))}
            </nav>

            <div className="mt-6 rounded-xl border border-border bg-muted/40 p-3.5">
              <p className="mb-2 text-xs font-semibold text-foreground">¿Necesitas más ayuda?</p>
              <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
                Nuestro equipo está disponible por WhatsApp.
              </p>
              <a
                href="https://wa.me/593980004089"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                <MessageCircle className="size-3.5" />
                Hablar con soporte
              </a>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="min-w-0">
          {/* Mobile TOC */}
          <div className="mb-8 rounded-xl border border-border bg-muted/30 p-4 lg:hidden">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              En esta guía
            </p>
            <ul className="flex flex-col gap-1">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="block rounded px-1 py-1 text-sm text-primary hover:underline"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-12">
            {/* ── 1. Dispositivos biométricos ── */}
            <section id="dispositivos" className="scroll-mt-6">
              <SectionHeader
                number={1}
                icon={<Cpu className="size-4" />}
                title="Dispositivos biométricos"
                color="blue"
              />
              <div className="mt-5 flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground">
                <p>
                  Cactus Access se conecta a <strong className="text-foreground">dispositivos de marcación</strong> (relojes biométricos, lectores de huella o tarjeta) que envían registros de entrada y salida a través de tu red local.
                </p>

                <InfoBox variant="info" title="¿Cómo funciona la conexión?">
                  Cada dispositivo tiene una <strong className="text-foreground">dirección MAC</strong> única — una cadena de 12 caracteres como{" "}
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
                    AA:BB:CC:DD:EE:FF
                  </code>
                  . Cactus usa esta dirección para identificar de qué sucursal provienen los registros.
                </InfoBox>

                <p className="font-medium text-foreground">Pasos para configurar un dispositivo:</p>
                <ol className="flex flex-col gap-3 pl-1">
                  <StepItem number={1}>
                    Ve a <NavPath>Sucursales</NavPath> y selecciona la sucursal donde está instalado el dispositivo.
                  </StepItem>
                  <StepItem number={2}>
                    Haz clic en <strong className="text-foreground">Editar</strong> y busca el campo{" "}
                    <strong className="text-foreground">Dirección MAC</strong>.
                  </StepItem>
                  <StepItem number={3}>
                    Ingresa la MAC del dispositivo en formato{" "}
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
                      AA:BB:CC:DD:EE:FF
                    </code>{" "}
                    (con dos puntos entre cada par).
                  </StepItem>
                  <StepItem number={4}>
                    Guarda los cambios. El sistema comenzará a recibir y procesar los registros del dispositivo automáticamente.
                  </StepItem>
                </ol>

                <InfoBox variant="tip" title="¿Dónde encuentro la dirección MAC?">
                  La MAC address generalmente aparece en la pantalla de configuración del propio dispositivo (menú Red o Ethernet) o en una etiqueta física en la parte trasera del equipo.
                </InfoBox>

                <div className="grid gap-3 sm:grid-cols-2">
                  <FeatureCard icon={<Wifi className="size-4 text-blue-600 dark:text-blue-400" />} bg="bg-blue-50 dark:bg-blue-500/8" border="border-blue-200/60 dark:border-blue-500/20">
                    <p className="text-xs font-semibold text-foreground">Red local</p>
                    <p className="text-xs text-muted-foreground">El dispositivo y el servidor deben estar en la misma red.</p>
                  </FeatureCard>
                  <FeatureCard icon={<Network className="size-4 text-violet-600 dark:text-violet-400" />} bg="bg-violet-50 dark:bg-violet-500/8" border="border-violet-200/60 dark:border-violet-500/20">
                    <p className="text-xs font-semibold text-foreground">Múltiples sucursales</p>
                    <p className="text-xs text-muted-foreground">Puedes tener un dispositivo distinto por cada sucursal.</p>
                  </FeatureCard>
                </div>
              </div>
            </section>

            <Divider />

            {/* ── 2. Registros No Reconocidos ── */}
            <section id="no-reconocidos" className="scroll-mt-6">
              <SectionHeader
                number={2}
                icon={<UserSearch className="size-4" />}
                title="Registros No Reconocidos"
                color="amber"
              />
              <div className="mt-5 flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground">
                <p>
                  Cuando el dispositivo biométrico envía una cédula que{" "}
                  <strong className="text-foreground">no coincide con ningún empleado</strong>{" "}
                  registrado en Cactus, el sistema guarda ese intento como un{" "}
                  <strong className="text-foreground">Registro No Reconocido</strong>.
                </p>

                <InfoBox variant="warning" title="¿Por qué aparecen estos registros?">
                  Ocurre cuando: (1) el empleado aún no ha sido dado de alta en Cactus, (2) la cédula en el dispositivo difiere de la registrada en el sistema, o (3) alguien externo intentó marcar.
                </InfoBox>

                <p className="font-medium text-foreground">Cómo resolverlos:</p>
                <ol className="flex flex-col gap-3 pl-1">
                  <StepItem number={1}>
                    Ve a <NavPath>No Reconocidos</NavPath> desde el menú lateral.
                  </StepItem>
                  <StepItem number={2}>
                    Verás la cédula recibida, la sucursal y la fecha/hora del intento.
                  </StepItem>
                  <StepItem number={3}>
                    Si reconoces al empleado, haz clic en{" "}
                    <strong className="text-foreground">Agregar empleado</strong> para darlo de alta con esa cédula.
                  </StepItem>
                  <StepItem number={4}>
                    Si no lo reconoces o fue un error, puedes <strong className="text-foreground">eliminar</strong> el registro.
                  </StepItem>
                </ol>

                <InfoBox variant="info" title="El dashboard te avisa">
                  El contador de <strong className="text-foreground">No Reconocidos</strong> en el panel principal se actualiza en tiempo real. Si ves un número alto, revisa que todos tus empleados estén registrados.
                </InfoBox>
              </div>
            </section>

            <Divider />

            {/* ── 3. Jornadas y horarios ── */}
            <section id="jornadas" className="scroll-mt-6">
              <SectionHeader
                number={3}
                icon={<Clock className="size-4" />}
                title="Jornadas y horarios"
                color="violet"
              />
              <div className="mt-5 flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground">
                <p>
                  Las <strong className="text-foreground">jornadas</strong> definen el horario de trabajo esperado. Cactus compara la hora real de marcación con la jornada para calcular atrasos y horas extra.
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="flex size-6 items-center justify-center rounded-md bg-violet-100 text-xs font-bold text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
                        J1
                      </span>
                      <p className="text-sm font-semibold text-foreground">Jornada 1 (principal)</p>
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Turno principal con horario de entrada, almuerzo y salida. Obligatorio si la sucursal trabaja en un solo turno.
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="flex size-6 items-center justify-center rounded-md bg-muted text-xs font-bold text-muted-foreground">
                        J2
                      </span>
                      <p className="text-sm font-semibold text-foreground">Jornada 2 (opcional)</p>
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Segunda jornada para negocios con doble turno (ej. mañana y noche). Solo se activa si la marcas como activa.
                    </p>
                  </div>
                </div>

                <p className="font-medium text-foreground">Dónde configurar los horarios:</p>
                <ol className="flex flex-col gap-3 pl-1">
                  <StepItem number={1}>
                    <strong className="text-foreground">Horario global de sucursal</strong>: en{" "}
                    <NavPath>Sucursales → Editar</NavPath>. Aplica a todos los empleados de esa sucursal por defecto.
                  </StepItem>
                  <StepItem number={2}>
                    <strong className="text-foreground">Horario individual</strong>: en{" "}
                    <NavPath>Empleados → Editar empleado → Horario</NavPath>. Permite sobreescribir el horario de un empleado específico.
                  </StepItem>
                </ol>

                <InfoBox variant="tip" title="¿Cuándo usar horario individual?">
                  Ideal para empleados con contrato part-time, turno rotativo, o un acuerdo de horario diferente al resto de su sucursal.
                </InfoBox>
              </div>
            </section>

            <Divider />

            {/* ── 4. Estados de asistencia ── */}
            <section id="asistencias" className="scroll-mt-6">
              <SectionHeader
                number={4}
                icon={<CheckCircle2 className="size-4" />}
                title="Estados de asistencia"
                color="emerald"
              />
              <div className="mt-5 flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground">
                <p>
                  Cada día, Cactus genera un registro en <NavPath>Asistencias</NavPath> con el resumen de marcaciones de cada empleado. Así se interpretan los estados:
                </p>

                <div className="flex flex-col gap-2.5">
                  <StatusRow
                    badge="Entrada"
                    badgeColor="emerald"
                    description="El empleado marcó entrada. Si lo hizo después de la hora establecida, se registran los minutos de atraso."
                  />
                  <StatusRow
                    badge="Salida"
                    badgeColor="blue"
                    description="El empleado marcó salida. Si salió antes de la hora, se contabilizan los minutos de salida temprana."
                  />
                  <StatusRow
                    badge="Atraso"
                    badgeColor="amber"
                    description="Llegó tarde. Los minutos de atraso se calculan desde la hora de entrada configurada. Puedes configurar si descuenta del salario en cada empleado."
                  />
                  <StatusRow
                    badge="Horas extra"
                    badgeColor="violet"
                    description="Trabajó más allá del horario. Los minutos extra se acumulan y pueden usarse para liquidaciones."
                  />
                  <StatusRow
                    badge="Falta"
                    badgeColor="red"
                    description="No marcó entrada durante el día. Aparece en Justificaciones como una falta pendiente de resolución."
                  />
                </div>

                <InfoBox variant="info" title="Ver el historial de un empleado">
                  Desde <NavPath>Asistencias</NavPath>, haz clic en cualquier fila para ver el historial completo de ese empleado, día por día.
                </InfoBox>
              </div>
            </section>

            <Divider />

            {/* ── 5. Justificaciones ── */}
            <section id="justificaciones" className="scroll-mt-6">
              <SectionHeader
                number={5}
                icon={<FileCheck2 className="size-4" />}
                title="Justificaciones de faltas"
                color="blue"
              />
              <div className="mt-5 flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground">
                <p>
                  Cuando un empleado falta, puedes registrar una <strong className="text-foreground">justificación</strong>{" "}
                  para que esa ausencia no afecte su liquidación. Las justificaciones tienen tres estados:
                </p>

                <div className="flex flex-col gap-2.5">
                  <StatusRow
                    badge="Pendiente"
                    badgeColor="amber"
                    description="La justificación fue enviada pero aún no ha sido revisada."
                  />
                  <StatusRow
                    badge="Aprobada"
                    badgeColor="emerald"
                    description="La falta queda justificada y no descuenta del salario del empleado."
                  />
                  <StatusRow
                    badge="Rechazada"
                    badgeColor="red"
                    description="La falta se mantiene como no justificada y puede deducirse en la liquidación."
                  />
                </div>

                <p className="font-medium text-foreground">Cómo registrar una justificación:</p>
                <ol className="flex flex-col gap-3 pl-1">
                  <StepItem number={1}>
                    Ve a <NavPath>Justificaciones</NavPath> desde el menú lateral.
                  </StepItem>
                  <StepItem number={2}>
                    Haz clic en <strong className="text-foreground">Nueva justificación</strong>, selecciona el empleado y la fecha de la falta.
                  </StepItem>
                  <StepItem number={3}>
                    Escribe el motivo y opcionalmente adjunta un comprobante (permiso médico, etc.).
                  </StepItem>
                  <StepItem number={4}>
                    Revisa y aprueba o rechaza desde la misma sección.
                  </StepItem>
                </ol>
              </div>
            </section>

            <Divider />

            {/* ── 6. Verificación en dos pasos ── */}
            <section id="dos-pasos" className="scroll-mt-6">
              <SectionHeader
                number={6}
                icon={<ShieldCheck className="size-4" />}
                title="Verificación en dos pasos"
                color="emerald"
              />
              <div className="mt-5 flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground">
                <p>
                  Por defecto, Cactus protege el acceso con{" "}
                  <strong className="text-foreground">verificación en dos pasos (2FA)</strong>: al
                  iniciar sesión se envía un código de 6 dígitos al WhatsApp registrado de tu empresa.
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <FeatureCard
                    icon={<ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />}
                    bg="bg-emerald-50 dark:bg-emerald-500/8"
                    border="border-emerald-200/60 dark:border-emerald-500/20"
                  >
                    <p className="text-xs font-semibold text-foreground">Con 2FA activo</p>
                    <p className="text-xs text-muted-foreground">
                      RUC + contraseña + código WhatsApp. Mayor seguridad.
                    </p>
                  </FeatureCard>
                  <FeatureCard
                    icon={<Zap className="size-4 text-amber-600 dark:text-amber-400" />}
                    bg="bg-amber-50 dark:bg-amber-500/8"
                    border="border-amber-200/60 dark:border-amber-500/20"
                  >
                    <p className="text-xs font-semibold text-foreground">Sin 2FA</p>
                    <p className="text-xs text-muted-foreground">
                      Solo RUC + contraseña. Acceso más rápido, menos protección.
                    </p>
                  </FeatureCard>
                </div>

                <p className="font-medium text-foreground">Cómo desactivar o activar el 2FA:</p>
                <ol className="flex flex-col gap-3 pl-1">
                  <StepItem number={1}>
                    Ve a <NavPath>Empresa</NavPath> desde el menú de tu cuenta (esquina superior izquierda del sidebar).
                  </StepItem>
                  <StepItem number={2}>
                    Desplázate hasta la sección <strong className="text-foreground">Seguridad de acceso</strong>.
                  </StepItem>
                  <StepItem number={3}>
                    Usa el interruptor para activar o desactivar la verificación en dos pasos.
                  </StepItem>
                </ol>

                <InfoBox variant="warning" title="Recomendación de seguridad">
                  Se recomienda mantener el 2FA activado siempre que sea posible. Si lo desactivas, usa una contraseña larga y única.
                </InfoBox>
              </div>
            </section>

            <Divider />

            {/* ── 7. Calendario y feriados ── */}
            <section id="calendario" className="scroll-mt-6">
              <SectionHeader
                number={7}
                icon={<Sparkles className="size-4" />}
                title="Calendario y feriados"
                color="amber"
              />
              <div className="mt-5 flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground">
                <p>
                  El <strong className="text-foreground">Calendario</strong> permite configurar los
                  días en que tu empresa o sucursal <em>no</em> trabaja, evitando que el sistema
                  registre faltas en esas fechas.
                </p>

                <div className="flex flex-col gap-2.5">
                  <FeatureCard
                    icon={<MapPin className="size-4 text-amber-600 dark:text-amber-400" />}
                    bg="bg-amber-50 dark:bg-amber-500/8"
                    border="border-amber-200/60 dark:border-amber-500/20"
                  >
                    <p className="text-xs font-semibold text-foreground">Días feriados por sucursal</p>
                    <p className="text-xs text-muted-foreground">
                      Añade fechas específicas (ej. feriados nacionales o locales) para una sucursal en particular.
                    </p>
                  </FeatureCard>
                  <FeatureCard
                    icon={<Clock className="size-4 text-blue-600 dark:text-blue-400" />}
                    bg="bg-blue-50 dark:bg-blue-500/8"
                    border="border-blue-200/60 dark:border-blue-500/20"
                  >
                    <p className="text-xs font-semibold text-foreground">Días no laborables</p>
                    <p className="text-xs text-muted-foreground">
                      Define qué días de la semana no trabaja una sucursal o un empleado (ej. domingos).
                    </p>
                  </FeatureCard>
                </div>

                <p className="font-medium text-foreground">Para añadir un feriado:</p>
                <ol className="flex flex-col gap-3 pl-1">
                  <StepItem number={1}>
                    Ve a <NavPath>Calendario</NavPath> desde el menú lateral.
                  </StepItem>
                  <StepItem number={2}>
                    Selecciona la sucursal y haz clic en el día en el calendario.
                  </StepItem>
                  <StepItem number={3}>
                    Ingresa una descripción (ej. &quot;Feriado nacional – Independencia&quot;).
                  </StepItem>
                  <StepItem number={4}>
                    Guarda. Ese día no contará como falta para ningún empleado de esa sucursal.
                  </StepItem>
                </ol>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="mt-14 border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>
              ¿No encontraste lo que buscabas?{" "}
              <Link href="/dashboard" className="font-medium text-primary hover:underline">
                Volver al dashboard
              </Link>{" "}
              o contacta a soporte desde el menú lateral.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

// ── Subcomponents ─────────────────────────────────────────────────────────────

const colorMap = {
  blue: {
    chip: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
    text: "text-blue-700 dark:text-blue-300",
  },
  amber: {
    chip: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
    text: "text-amber-700 dark:text-amber-300",
  },
  violet: {
    chip: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
    text: "text-violet-700 dark:text-violet-300",
  },
  emerald: {
    chip: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
    text: "text-emerald-700 dark:text-emerald-300",
  },
  red: {
    chip: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
    text: "text-red-700 dark:text-red-300",
  },
};

function SectionHeader({
  number,
  icon,
  title,
  color,
}: {
  number: number;
  icon: React.ReactNode;
  title: string;
  color: keyof typeof colorMap;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${colorMap[color].chip}`}
      >
        {icon}
      </span>
      <div className="flex items-baseline gap-2">
        <span className={`text-xs font-bold tabular-nums ${colorMap[color].text}`}>
          {String(number).padStart(2, "0")}
        </span>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      </div>
    </div>
  );
}

function InfoBox({
  variant,
  title,
  children,
}: {
  variant: "info" | "tip" | "warning";
  title: string;
  children: React.ReactNode;
}) {
  const config = {
    info: {
      bg: "bg-blue-50 dark:bg-blue-500/8",
      border: "border-blue-200/60 dark:border-blue-500/20",
      icon: <Info className="mt-0.5 size-4 shrink-0 text-blue-600 dark:text-blue-400" />,
      titleColor: "text-blue-800 dark:text-blue-300",
      bodyColor: "text-blue-700 dark:text-blue-400",
    },
    tip: {
      bg: "bg-emerald-50 dark:bg-emerald-500/8",
      border: "border-emerald-200/60 dark:border-emerald-500/20",
      icon: <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />,
      titleColor: "text-emerald-800 dark:text-emerald-300",
      bodyColor: "text-emerald-700 dark:text-emerald-400",
    },
    warning: {
      bg: "bg-amber-50 dark:bg-amber-500/8",
      border: "border-amber-200/60 dark:border-amber-500/20",
      icon: <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />,
      titleColor: "text-amber-800 dark:text-amber-300",
      bodyColor: "text-amber-700 dark:text-amber-400",
    },
  }[variant];

  return (
    <div className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 ${config.bg} ${config.border}`}>
      {config.icon}
      <div className="flex flex-col gap-0.5">
        <p className={`text-xs font-semibold ${config.titleColor}`}>{title}</p>
        <p className={`text-xs leading-relaxed ${config.bodyColor}`}>{children}</p>
      </div>
    </div>
  );
}

function StepItem({ number, children }: { number: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
        {number}
      </span>
      <span className="text-sm leading-relaxed text-muted-foreground">{children}</span>
    </li>
  );
}

function NavPath({ children }: { children: React.ReactNode }) {
  return (
    <strong className="inline-flex items-center gap-0.5 rounded bg-muted px-1.5 py-0.5 font-medium text-foreground">
      {children}
    </strong>
  );
}

function FeatureCard({
  icon,
  bg,
  border,
  children,
}: {
  icon: React.ReactNode;
  bg: string;
  border: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex items-start gap-3 rounded-xl border p-3.5 ${bg} ${border}`}>
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

const badgeColorMap = {
  emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  violet: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
  red: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
};

function StatusRow({
  badge,
  badgeColor,
  description,
}: {
  badge: string;
  badgeColor: keyof typeof badgeColorMap;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <span
        className={`mt-0.5 inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeColorMap[badgeColor]}`}
      >
        {badge}
      </span>
      <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

function Divider() {
  return <hr className="border-border" />;
}
