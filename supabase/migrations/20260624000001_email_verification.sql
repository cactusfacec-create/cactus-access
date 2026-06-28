-- Verificación de correo para el flujo de registro self-service (/registro).
-- Las columnas viven en profiles (no en empresas) porque verificar el correo
-- es una propiedad del usuario/login (auth.users 1:1 vía profiles.id), no de
-- la empresa.

alter table profiles
  add column email_verified boolean not null default false,
  add column verification_code_hash text,
  add column verification_code_expires_at timestamptz,
  add column verification_code_sent_at timestamptz;

-- Cuentas creadas antes de esta migración (self-service o por un super_admin)
-- ya están en uso; no deben quedar atrapadas detrás del nuevo guard.
update profiles set email_verified = true;
