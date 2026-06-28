-- Gap encontrado: empresas tenía GRANT pero nunca se le habilitó RLS ni se le
-- creó una policy — cualquier rol autenticado podía leer/editar CUALQUIER
-- empresa (no solo la propia), ya que las tablas dependientes (sucursales,
-- empleados, etc.) sí estaban aisladas pero empresas no.

alter table empresas enable row level security;

drop policy if exists "empresas_tenant_isolation" on empresas;
create policy "empresas_tenant_isolation" on empresas
  for all using (id = profile_id_empresa());
