create table if not exists adelantos_empleado (
  id          uuid primary key default gen_random_uuid(),
  id_empresa  uuid not null references empresas(id) on delete cascade,
  id_empleado uuid not null references empleados(id) on delete cascade,
  monto       numeric(10,2) not null check (monto > 0),
  fecha       date not null default current_date,
  descripcion text,
  created_at  timestamptz not null default now()
);

alter table adelantos_empleado enable row level security;

create policy "empresa_own_adelantos" on adelantos_empleado
  using (id_empresa = profile_id_empresa())
  with check (id_empresa = profile_id_empresa());
