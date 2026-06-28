-- Añade p_email_verified a handle_new_company_signup: el registro self-service
-- (actions/auth.actions.ts -> signUp) pasa false (requiere verificar código),
-- el registro creado por un super_admin (actions/admin/empresas.actions.ts ->
-- crearEmpresa, via admin.createUser con email_confirm:true) pasa true porque
-- el admin ya da fe del correo.

create or replace function handle_new_company_signup(
  p_user_id uuid,
  p_nombre_empresa text,
  p_email_verified boolean default false
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_id_empresa uuid;
begin
  insert into empresas (nombre_empresa) values (p_nombre_empresa)
  returning id into v_id_empresa;

  insert into licencias (
    id_empresa, limite_empleados, limite_sucursales,
    tipo_corte, fecha_vencimiento, activa
  ) values (
    v_id_empresa, 15, 2, 'quincenal', now() + interval '14 days', true
  );

  insert into profiles (id, id_empresa, rol, email_verified)
  values (p_user_id, v_id_empresa, 'cliente', p_email_verified);

  return v_id_empresa;
end;
$$;
