-- Crea empresa + licencia trial + profile de forma atómica durante el registro.
-- Invocada desde actions/auth.actions.ts via supabase.rpc('handle_new_company_signup', ...).

create or replace function handle_new_company_signup(
  p_user_id uuid,
  p_nombre_empresa text
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

  insert into profiles (id, id_empresa, rol)
  values (p_user_id, v_id_empresa, 'cliente');

  return v_id_empresa;
end;
$$;
