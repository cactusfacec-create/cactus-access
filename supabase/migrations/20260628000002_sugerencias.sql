create table if not exists sugerencias (
  id          uuid        primary key default gen_random_uuid(),
  id_empresa  uuid        not null references empresas(id) on delete cascade,
  mensaje     text        not null check (char_length(mensaje) between 10 and 1000),
  estado      text        not null default 'nueva'
                check (estado in ('nueva', 'revisada', 'implementada')),
  created_at  timestamptz not null default now()
);

alter table sugerencias enable row level security;

create policy "sugerencias_insert" on sugerencias
  for insert with check (profile_id_empresa() = id_empresa);

create policy "sugerencias_select" on sugerencias
  for select using (profile_id_empresa() = id_empresa);
