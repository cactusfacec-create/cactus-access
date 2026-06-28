-- Vincula auth.users con empresa_id y rol.

do $$ begin
  create type rol_usuario as enum ('cliente', 'super_admin');
exception
  when duplicate_object then null;
end $$;

create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  empresa_id  uuid references empresas(id), -- null permitido (super_admin)
  rol         rol_usuario not null default 'cliente',
  created_at  timestamptz not null default now()
);

alter table profiles enable row level security;

drop policy if exists "profiles_select_own" on profiles;
create policy "profiles_select_own" on profiles
  for select using (id = auth.uid());

-- Nadie inserta/actualiza profiles directamente desde el cliente salvo su propia
-- fila con rol='cliente'. La asignación de rol='super_admin' se hace manualmente
-- en la base de datos, nunca desde el flujo de signup público.
drop policy if exists "profiles_insert_own_cliente_only" on profiles;
create policy "profiles_insert_own_cliente_only" on profiles
  for insert with check (id = auth.uid() and rol = 'cliente');
