-- Se elimina el sistema de verificación por código (n8n + WhatsApp/correo):
-- ahora la autenticación es 100% nativa de Supabase (Google OAuth o Email OTP),
-- que ya garantizan la propiedad del correo sin necesidad de un código propio.
-- handle_new_company_signup vuelve a su firma original de 2 argumentos.
drop function if exists handle_new_company_signup(uuid, text, boolean);

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
