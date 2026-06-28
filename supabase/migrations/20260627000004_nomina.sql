-- Payroll configuration per employee
alter table empleados
  add column if not exists tipo_salario text not null default 'diario'
    check (tipo_salario in ('diario', 'mensual')),
  add column if not exists horas_jornada numeric(4,2) not null default 8,
  add column if not exists multiplicador_hora_extra numeric(4,2) not null default 1.5,
  add column if not exists descuenta_atrasos boolean not null default false;

-- Enrich payment records with full payroll breakdown
alter table pagos_empleado
  add column if not exists tipo_salario text not null default 'diario',
  add column if not exists salario_base numeric(10,2) not null default 0,
  add column if not exists pago_horas_extra numeric(10,2) not null default 0,
  add column if not exists deduccion_atrasos_val numeric(10,2) not null default 0,
  add column if not exists deduccion_faltas_val numeric(10,2) not null default 0,
  add column if not exists faltas_no_justificadas integer not null default 0,
  add column if not exists minutos_extra_total integer not null default 0,
  add column if not exists minutos_atraso_total integer not null default 0;
