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
  v_empresa_id uuid;
begin
  insert into empresas (nombre) values (p_nombre_empresa)
  returning id into v_empresa_id;

  insert into licencias (
    empresa_id, limite_empleados, limite_sucursales,
    tipo_corte, fecha_vencimiento, activa
  ) values (
    v_empresa_id, 15, 2, 'quincenal', now() + interval '14 days', true
  );

  insert into profiles (id, empresa_id, rol)
  values (p_user_id, v_empresa_id, 'cliente');

  return v_empresa_id;
end;
$$;
