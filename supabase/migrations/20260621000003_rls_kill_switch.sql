-- Defensa en profundidad del Kill Switch: además del guard de layout en la app,
-- cada tabla de negocio verifica empresa_id del profile Y licencias.activa = true.

create or replace function profile_empresa_id()
returns uuid
language sql
security definer
stable
as $$
  select empresa_id from profiles where id = auth.uid();
$$;

create or replace function empresa_licencia_activa(p_empresa_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from licencias l
    where l.empresa_id = p_empresa_id and l.activa = true
  );
$$;

-- licencias: el cliente solo puede leer la suya propia (siempre, incluso si está
-- inactiva, porque la pantalla de "cuenta suspendida" necesita poder mostrarla).
-- Insert/update quedan reservados al RPC de signup y al service-role del admin.
drop policy if exists "licencias_select_own" on licencias;
create policy "licencias_select_own" on licencias
  for select using (empresa_id = profile_empresa_id());

-- sucursales
drop policy if exists "sucursales_tenant_isolation" on sucursales;
create policy "sucursales_tenant_isolation" on sucursales
  for all using (
    empresa_id = profile_empresa_id() and empresa_licencia_activa(empresa_id)
  );

-- empleados
drop policy if exists "empleados_tenant_isolation" on empleados;
create policy "empleados_tenant_isolation" on empleados
  for all using (
    empresa_id = profile_empresa_id() and empresa_licencia_activa(empresa_id)
  );

-- horarios
drop policy if exists "horarios_tenant_isolation" on horarios;
create policy "horarios_tenant_isolation" on horarios
  for all using (
    empresa_id = profile_empresa_id() and empresa_licencia_activa(empresa_id)
  );

-- dispositivos_biometricos
drop policy if exists "dispositivos_tenant_isolation" on dispositivos_biometricos;
create policy "dispositivos_tenant_isolation" on dispositivos_biometricos
  for all using (
    empresa_id = profile_empresa_id() and empresa_licencia_activa(empresa_id)
  );

-- control_diario
drop policy if exists "control_diario_tenant_isolation" on control_diario;
create policy "control_diario_tenant_isolation" on control_diario
  for all using (
    empresa_id = profile_empresa_id() and empresa_licencia_activa(empresa_id)
  );
