-- RLS multi-tenant + Kill Switch (defensa en profundidad junto al guard de la
-- app) + GRANT a los roles de PostgREST (sin esto toda query da "permission
-- denied" sin importar las policies, como ya descubrimos antes).

create or replace function profile_id_empresa()
returns uuid
language sql
security definer
stable
as $$
  select id_empresa from profiles where id = auth.uid();
$$;

create or replace function empresa_licencia_activa(p_id_empresa uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from licencias l
    where l.id_empresa = p_id_empresa and l.activa = true
  );
$$;

-- profiles
drop policy if exists "profiles_select_own" on profiles;
create policy "profiles_select_own" on profiles
  for select using (id = auth.uid());

drop policy if exists "profiles_insert_own_cliente_only" on profiles;
create policy "profiles_insert_own_cliente_only" on profiles
  for insert with check (id = auth.uid() and rol = 'cliente');

-- licencias: el cliente solo lee la suya (incluso inactiva, para poder mostrar
-- la pantalla de "cuenta suspendida").
drop policy if exists "licencias_select_own" on licencias;
create policy "licencias_select_own" on licencias
  for select using (id_empresa = profile_id_empresa());

-- sucursales
drop policy if exists "sucursales_tenant_isolation" on sucursales;
create policy "sucursales_tenant_isolation" on sucursales
  for all using (
    id_empresa = profile_id_empresa() and empresa_licencia_activa(id_empresa)
  );

-- empleados
drop policy if exists "empleados_tenant_isolation" on empleados;
create policy "empleados_tenant_isolation" on empleados
  for all using (
    id_empresa = profile_id_empresa() and empresa_licencia_activa(id_empresa)
  );

-- control_diario
drop policy if exists "control_diario_tenant_isolation" on control_diario;
create policy "control_diario_tenant_isolation" on control_diario
  for all using (
    id_empresa = profile_id_empresa() and empresa_licencia_activa(id_empresa)
  );

-- horarios_empleados: no tiene id_empresa propio, se resuelve via empleados.
drop policy if exists "horarios_empleados_tenant_isolation" on horarios_empleados;
create policy "horarios_empleados_tenant_isolation" on horarios_empleados
  for all using (
    exists (
      select 1 from empleados e
      where e.id = horarios_empleados.id_empleado
        and e.id_empresa = profile_id_empresa()
        and empresa_licencia_activa(e.id_empresa)
    )
  );

-- registros_no_reconocidos: no tiene id_empresa propio, se resuelve via sucursales.
drop policy if exists "registros_no_reconocidos_tenant_isolation" on registros_no_reconocidos;
create policy "registros_no_reconocidos_tenant_isolation" on registros_no_reconocidos
  for all using (
    exists (
      select 1 from sucursales s
      where s.id = registros_no_reconocidos.id_sucursal
        and s.id_empresa = profile_id_empresa()
        and empresa_licencia_activa(s.id_empresa)
    )
  );

grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant all on all routines in schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant all on routines to anon, authenticated, service_role;
