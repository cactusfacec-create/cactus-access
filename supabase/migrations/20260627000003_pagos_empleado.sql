-- Salario diario por empleado
alter table empleados add column if not exists salario_diario numeric(10,2) not null default 0;

-- Historial de pagos de sueldo
create table if not exists pagos_empleado (
  id           uuid        primary key default gen_random_uuid(),
  id_empresa   uuid        not null references empresas(id)  on delete cascade,
  id_empleado  uuid        not null references empleados(id) on delete cascade,
  periodo_desde date       not null,
  periodo_hasta date       not null,
  dias_trabajados integer  not null,
  salario_diario  numeric(10,2) not null,
  monto_total     numeric(10,2) not null,
  notas           text,
  created_at   timestamptz not null default now()
);

alter table pagos_empleado enable row level security;

create policy "pagos_empleado_tenant" on pagos_empleado
  for all using (
    id_empresa = profile_id_empresa()
    and empresa_licencia_activa(id_empresa)
  );
