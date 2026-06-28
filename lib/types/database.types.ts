// Tipos a mano del esquema de Supabase (no hay proyecto linkeado para `supabase gen types`).
// Si se linkea un proyecto, reemplazar este archivo con `supabase gen types typescript --linked`.

export type Rol = "cliente" | "super_admin";
export type EstadoRegistroNoReconocido = "pendiente" | "resuelto";

export interface Empresa {
  id: string;
  nombre_empresa: string;
  direccion: string | null;
  telefono: string | null;
  email: string | null;
  ruc: string | null;
  telefono_notificacion_tardanza: string | null;
  otp_requerido: boolean;
}

export type PlanTipo = "pro" | "max" | "personalizado" | "prueba";
export type PeriodoFacturacion = "trimestral" | "semestral" | "anual";

export interface Plan {
  id: string; // 'pro' | 'max'
  precio_trimestral: number;
  precio_semestral: number;
  precio_anual: number;
  limite_sucursales: number;
  limite_empleados: number;
  updated_at: string;
}

export interface Licencia {
  id_empresa: string;
  limite_empleados: number;
  limite_sucursales: number;
  tipo_corte: string;
  fecha_vencimiento: string;
  activa: boolean;
  plan_tipo: PlanTipo | null;
  periodo_facturacion: PeriodoFacturacion | null;
  precio: number | null;
}

// Jornadas compartidas por sucursales (horario "global") y horarios_empleados
// (override individual) — misma forma en ambas tablas.
export interface Jornadas {
  jornada1_activo: boolean;
  jornada1_entrada: string | null;
  jornada1_salida_almuerzo: string | null;
  jornada1_entrada_almuerzo: string | null;
  jornada1_salida: string | null;
  jornada2_activo: boolean;
  jornada2_entrada: string | null;
  jornada2_salida: string | null;
}

export interface Sucursal extends Jornadas {
  id: string;
  id_empresa: string;
  nombre_sucursal: string;
  direccion: string | null;
  mac_address: string | null;
  dia_corte: number | null;
}

export interface Empleado {
  id: string;
  id_empresa: string;
  id_sucursal: string | null;
  nombre: string;
  cedula: string;
  telefono: string | null;
  salario_diario: number;
  tipo_salario: "diario" | "mensual";
  horas_jornada: number;
  multiplicador_hora_extra: number;
  descuenta_atrasos: boolean;
  fecha_ingreso: string;
  dia_corte: number | null;
}

export interface PagoEmpleado {
  id: string;
  id_empresa: string;
  id_empleado: string;
  periodo_desde: string;
  periodo_hasta: string;
  dias_trabajados: number;
  salario_diario: number;
  tipo_salario: "diario" | "mensual";
  salario_base: number;
  pago_horas_extra: number;
  deduccion_atrasos_val: number;
  deduccion_faltas_val: number;
  faltas_no_justificadas: number;
  minutos_extra_total: number;
  minutos_atraso_total: number;
  monto_total: number;
  notas: string | null;
  created_at: string;
}

export interface AdelantoEmpleado {
  id: string;
  id_empresa: string;
  id_empleado: string;
  monto: number;
  fecha: string;
  descripcion: string | null;
  created_at: string;
}

export interface HorarioEmpleado extends Jornadas {
  id_empleado: string;
  usa_horario_global: boolean;
}

export interface RegistroNoReconocido {
  id: string;
  id_sucursal: string;
  cedula_recibida: string;
  fecha_hora_evento: string;
  estado: EstadoRegistroNoReconocido;
}

export interface ControlDiario {
  id_empresa: string;
  id_empleado: string;
  fecha: string;
  hora_entrada_real: string | null;
  hora_salida_almuerzo_real: string | null;
  hora_entrada_almuerzo_real: string | null;
  hora_salida_real: string | null;
  minutos_atraso: number;
  minutos_salida_temprana: number;
  minutos_extras: number;
}

export interface Profile {
  id: string;
  id_empresa: string | null;
  rol: Rol;
  created_at: string;
  whatsapp: string | null;
}

export type MetodoPago = "tarjeta" | "efectivo" | "transferencia";
export type ProveedorPago = "manual" | "dlocalgo";
export type EstadoPago = "pendiente" | "aprobado" | "rechazado" | "reembolsado";
export type EstadoIntent = "pendiente" | "aprobado" | "rechazado" | "expirado" | "cancelado";

export interface Pago {
  id: string;
  id_empresa: string;
  metodo_pago: MetodoPago;
  monto: number;
  plan_tipo: string;
  periodo_facturacion: string;
  fecha_desde: string;
  fecha_hasta: string;
  limite_sucursales: number;
  limite_empleados: number;
  codigo_transaccion: string | null;
  comprobante_url: string | null;
  notas: string | null;
  aprobado_por: string | null;
  // Pasarela (DEFAULT 'manual' / 'aprobado' / 'USD' — no requieren envío manual)
  proveedor: ProveedorPago;
  estado: EstadoPago;
  referencia_externa: string | null;
  moneda: string;
  payload_respuesta: Record<string, unknown> | null;
  created_at: string;
}

export interface PaymentIntent {
  id: string;
  id_empresa: string;
  proveedor: Exclude<ProveedorPago, "manual">;
  estado: EstadoIntent;
  monto: number;
  moneda: string;
  plan_tipo: string;
  periodo_facturacion: string;
  fecha_hasta: string;
  limite_sucursales: number;
  limite_empleados: number;
  client_transaction_id: string;
  referencia_externa: string | null;
  checkout_url: string | null;
  payload_inicio: Record<string, unknown> | null;
  payload_respuesta: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  tipo: "plan" | "producto";
  id_pedido_tienda: string | null;
}

export interface AdminAccessLog {
  id: string;
  user_id: string | null;
  user_email: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface AdminLoginAttempt {
  id: number;
  email: string;
  succeeded: boolean;
  attempted_at: string;
}

export interface Configuracion {
  id: string;
  dlocalgo_api_key: string | null;
  dlocalgo_secret_key: string | null;
  dlocalgo_env: string;
  updated_at: string;
}

export interface DiaFeriado {
  id: string;
  id_sucursal: string;
  fecha: string;
  descripcion: string | null;
  created_at: string;
}

export interface FechaNoLaborableEmpleado {
  id_empleado: string;
  fecha: string;
  descripcion: string | null;
}

export interface DiaNoLaborableSucursal {
  id_sucursal: string;
  dia_semana: number;
}

export interface DiaNoLaborableEmpleado {
  id_empleado: string;
  dia_semana: number;
}

export type EstadoPedidoTienda =
  | "pendiente_pago"
  | "pagado"
  | "en_preparacion"
  | "enviado"
  | "entregado"
  | "cancelado";

export interface ProductoTienda {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  specs: Record<string, unknown> | null;
  imagen_url: string | null;
  activo: boolean;
  orden_display: number;
  created_at: string;
}

export interface PedidoTienda {
  id: string;
  id_empresa: string;
  estado: EstadoPedidoTienda;
  monto_total: number;
  direccion_entrega: string;
  telefono_contacto: string;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

export interface PedidoTiendaItem {
  id: string;
  id_pedido: string;
  id_producto: string;
  nombre_producto: string;
  cantidad: number;
  precio_unitario: number;
}

export type EstadoJustificacion = "pendiente" | "aprobada" | "rechazada";
export type TipoJustificacion = "falta" | "incompleto";

export interface JustificacionFalta {
  id: string;
  id_empresa: string;
  id_empleado: string;
  fecha: string;
  motivo: string;
  url_comprobante: string | null;
  estado: EstadoJustificacion;
  tipo: TipoJustificacion;
  created_at: string;
}

export interface AdminAuditLog {
  id: string;
  user_id: string | null;
  user_email: string;
  accion: string;
  entidad: string;
  entidad_id: string | null;
  empresa_nombre: string | null;
  detalle: Record<string, unknown> | null;
  created_at: string;
}

export type EstadoSugerencia = "nueva" | "revisada" | "implementada";

export interface Sugerencia {
  id: string;
  id_empresa: string;
  mensaje: string;
  estado: EstadoSugerencia;
  created_at: string;
}

// Envuelve las interfaces nominales en un mapped type antes de usarlas dentro de
// Database: @supabase/postgrest-js resuelve mal "extends GenericTable" cuando Row
// referencia una interface directamente (queda en `never`); como objeto mapeado
// (anónimo) sí se evalúa correctamente.
type Spread<T> = { [K in keyof T]: T[K] };

type Table<Row> = {
  Row: Spread<Row>;
  Insert: Spread<Partial<Row>>;
  Update: Spread<Partial<Row>>;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      empresas: Table<Empresa>;
      licencias: Table<Licencia>;
      planes: Table<Plan>;
      sucursales: Table<Sucursal>;
      empleados: Table<Empleado>;
      horarios_empleados: Table<HorarioEmpleado>;
      registros_no_reconocidos: Table<RegistroNoReconocido>;
      control_diario: Table<ControlDiario>;
      profiles: Table<Profile>;
      pagos: Table<Pago>;
      payment_intents: Table<PaymentIntent>;
      admin_access_logs: Table<AdminAccessLog>;
      admin_audit_log: Table<AdminAuditLog>;
      admin_login_attempts: Table<AdminLoginAttempt>;
      configuracion: Table<Configuracion>;
      dias_feriados: Table<DiaFeriado>;
      dias_no_laborables_sucursal: Table<DiaNoLaborableSucursal>;
      dias_no_laborables_empleado: Table<DiaNoLaborableEmpleado>;
      fechas_no_laborables_empleado: Table<FechaNoLaborableEmpleado>;
      justificaciones_falta: Table<JustificacionFalta>;
      pagos_empleado: Table<PagoEmpleado>;
      productos_tienda: Table<ProductoTienda>;
      pedidos_tienda: Table<PedidoTienda>;
      pedidos_tienda_items: Table<PedidoTiendaItem>;
      sugerencias: Table<Sugerencia>;
    };
    Views: Record<string, never>;
    Functions: {
      handle_new_company_signup: Spread<{
        Args: { p_user_id: string; p_nombre_empresa: string };
        Returns: string;
      }>;
    };
  };
}
