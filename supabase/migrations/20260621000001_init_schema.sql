-- Esquema base de Cactus Access. Crea las 7 tablas de negocio desde cero
-- (empleados ya incluye sucursal_id/horario_id, no se hace como ALTER posterior).

create extension if not exists "pgcrypto";

create table if not exists empresas (
  id     uuid primary key default gen_random_uuid(),
  nombre text not null
);

create table if not exists licencias (
  empresa_id        uuid primary key references empresas(id) on delete cascade,
  limite_empleados  integer not null default 0,
  limite_sucursales integer not null default 0,
  tipo_corte        text not null default 'quincenal',
  fecha_vencimiento timestamptz not null default (now() + interval '14 days'),
  activa            boolean not null default true
);

create table if not exists sucursales (
  id           uuid primary key default gen_random_uuid(),
  empresa_id   uuid not null references empresas(id) on delete cascade,
  nombre       text not null,
  zona_horaria text not null default 'America/Guatemala'
);

create table if not exists horarios (
  id                  uuid primary key default gen_random_uuid(),
  empresa_id          uuid not null references empresas(id) on delete cascade,
  nombre              text not null,
  hora_entrada        time not null,
  hora_salida         time not null,
  tolerancia_minutos  integer not null default 0
);

create table if not exists dispositivos_biometricos (
  id                  uuid primary key default gen_random_uuid(),
  empresa_id          uuid not null references empresas(id) on delete cascade,
  sucursal_id         uuid not null references sucursales(id) on delete cascade,
  device_id_hikvision text not null,
  unique (device_id_hikvision)
);

create table if not exists empleados (
  id                uuid primary key default gen_random_uuid(),
  empresa_id        uuid not null references empresas(id) on delete cascade,
  biometric_id      text not null,
  nombre            text not null,
  telefono_whatsapp text,
  sucursal_id       uuid references sucursales(id) on delete set null,
  horario_id        uuid references horarios(id) on delete set null,
  unique (empresa_id, biometric_id)
);

create table if not exists control_diario (
  empresa_id              uuid not null references empresas(id) on delete cascade,
  empleado_id             uuid not null references empleados(id) on delete cascade,
  fecha                   date not null,
  hora_entrada_real       timestamptz,
  hora_salida_real        timestamptz,
  minutos_atraso          integer not null default 0,
  minutos_salida_temprana integer not null default 0,
  minutos_extras          integer not null default 0,
  primary key (empleado_id, fecha)
);

alter table licencias enable row level security;
alter table sucursales enable row level security;
alter table horarios enable row level security;
alter table dispositivos_biometricos enable row level security;
alter table empleados enable row level security;
alter table control_diario enable row level security;
-- Las policies se añaden en la migración *_rls_kill_switch.sql, una vez que
-- existe la tabla profiles (necesaria para resolver empresa_id del usuario).
