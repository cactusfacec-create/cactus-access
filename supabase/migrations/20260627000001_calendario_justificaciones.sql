-- Días feriados por empresa (el flujo n8n los omite al detectar faltas)
create table dias_feriados (
  id          uuid primary key default gen_random_uuid(),
  id_empresa  uuid not null references empresas(id) on delete cascade,
  fecha       date not null,
  descripcion text,
  created_at  timestamptz not null default now(),
  unique (id_empresa, fecha)
);

-- Días fijos no laborables por sucursal (0=Dom, 1=Lun, ..., 6=Sáb)
create table dias_no_laborables_sucursal (
  id_sucursal uuid not null references sucursales(id) on delete cascade,
  dia_semana  smallint not null check (dia_semana between 0 and 6),
  primary key (id_sucursal, dia_semana)
);

-- Días fijos no laborables por empleado (override individual sobre la sucursal)
create table dias_no_laborables_empleado (
  id_empleado uuid not null references empleados(id) on delete cascade,
  dia_semana  smallint not null check (dia_semana between 0 and 6),
  primary key (id_empleado, dia_semana)
);

-- Justificaciones de faltas con comprobante adjunto
create table justificaciones_falta (
  id              uuid primary key default gen_random_uuid(),
  id_empresa      uuid not null references empresas(id) on delete cascade,
  id_empleado     uuid not null references empleados(id) on delete cascade,
  fecha           date not null,
  motivo          text not null,
  url_comprobante text,
  estado          text not null default 'pendiente'
                  check (estado in ('pendiente', 'aprobada', 'rechazada')),
  created_at      timestamptz not null default now(),
  unique (id_empleado, fecha)
);

-- RLS
alter table dias_feriados enable row level security;
alter table dias_no_laborables_sucursal enable row level security;
alter table dias_no_laborables_empleado enable row level security;
alter table justificaciones_falta enable row level security;

create policy "dias_feriados_tenant" on dias_feriados
  for all using (
    id_empresa = profile_id_empresa() and empresa_licencia_activa(id_empresa)
  );

create policy "dias_no_laborables_sucursal_tenant" on dias_no_laborables_sucursal
  for all using (
    exists (
      select 1 from sucursales s
      where s.id = dias_no_laborables_sucursal.id_sucursal
        and s.id_empresa = profile_id_empresa()
        and empresa_licencia_activa(s.id_empresa)
    )
  );

create policy "dias_no_laborables_empleado_tenant" on dias_no_laborables_empleado
  for all using (
    exists (
      select 1 from empleados e
      where e.id = dias_no_laborables_empleado.id_empleado
        and e.id_empresa = profile_id_empresa()
        and empresa_licencia_activa(e.id_empresa)
    )
  );

create policy "justificaciones_falta_tenant" on justificaciones_falta
  for all using (
    id_empresa = profile_id_empresa() and empresa_licencia_activa(id_empresa)
  );
