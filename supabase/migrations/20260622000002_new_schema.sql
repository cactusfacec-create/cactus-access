-- Esquema nuevo: convención id_xxx para FKs en todo el proyecto, device_id vive
-- en sucursales, horario de 2 jornadas a nivel de sucursal (default) y a nivel
-- de empleado (override individual), y tabla de registros_no_reconocidos para
-- marcaciones de cédulas que no existen todavía como empleado.

create extension if not exists "pgcrypto";

create table empresas (
  id                            uuid primary key default gen_random_uuid(),
  nombre_empresa                text not null,
  direccion                     text,
  telefono                      text,
  email                         text,
  ruc                           text,
  telefono_notificacion_tardanza text
);

create table licencias (
  id_empresa        uuid primary key references empresas(id) on delete cascade,
  limite_empleados  integer not null default 0,
  limite_sucursales integer not null default 0,
  tipo_corte        text not null default 'quincenal',
  fecha_vencimiento timestamptz not null default (now() + interval '14 days'),
  activa            boolean not null default true
);

do $$ begin
  create type rol_usuario as enum ('cliente', 'super_admin');
exception
  when duplicate_object then null;
end $$;

create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  id_empresa  uuid references empresas(id), -- null permitido (super_admin)
  rol         rol_usuario not null default 'cliente',
  created_at  timestamptz not null default now()
);

create table sucursales (
  id                       uuid primary key default gen_random_uuid(),
  id_empresa               uuid not null references empresas(id) on delete cascade,
  nombre_sucursal          text not null,
  direccion                text,
  device_id                text unique,
  jornada1_activo          boolean not null default true,
  jornada1_entrada         time,
  jornada1_salida_almuerzo time,
  jornada1_entrada_almuerzo time,
  jornada1_salida          time,
  jornada2_activo          boolean not null default false,
  jornada2_entrada         time,
  jornada2_salida          time
);

create table empleados (
  id          uuid primary key default gen_random_uuid(),
  id_empresa  uuid not null references empresas(id) on delete cascade,
  id_sucursal uuid references sucursales(id) on delete set null,
  nombre      text not null,
  cedula      text not null,
  telefono    text,
  unique (id_empresa, cedula)
);

create table horarios_empleados (
  id_empleado              uuid primary key references empleados(id) on delete cascade,
  usa_horario_global       boolean not null default true,
  jornada1_activo          boolean not null default true,
  jornada1_entrada         time,
  jornada1_salida_almuerzo time,
  jornada1_entrada_almuerzo time,
  jornada1_salida          time,
  jornada2_activo          boolean not null default false,
  jornada2_entrada         time,
  jornada2_salida          time
);

create table registros_no_reconocidos (
  id                uuid primary key default gen_random_uuid(),
  id_sucursal       uuid not null references sucursales(id) on delete cascade,
  cedula_recibida   text not null,
  fecha_hora_evento timestamptz not null,
  estado            text not null default 'pendiente' check (estado in ('pendiente', 'resuelto'))
);

create table control_diario (
  id_empresa              uuid not null references empresas(id) on delete cascade,
  id_empleado             uuid not null references empleados(id) on delete cascade,
  fecha                   date not null,
  hora_entrada_real       timestamptz,
  hora_salida_real        timestamptz,
  minutos_atraso          integer not null default 0,
  minutos_salida_temprana integer not null default 0,
  minutos_extras          integer not null default 0,
  primary key (id_empleado, fecha)
);

alter table licencias enable row level security;
alter table profiles enable row level security;
alter table sucursales enable row level security;
alter table empleados enable row level security;
alter table horarios_empleados enable row level security;
alter table registros_no_reconocidos enable row level security;
alter table control_diario enable row level security;
-- Las policies se añaden en la migración *_rls_and_functions.sql.
