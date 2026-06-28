-- Limpieza del sistema de verificación por código, ya reemplazado por
-- autenticación nativa de Supabase (Google OAuth / Email OTP).
drop policy if exists "profiles_update_own_verification" on profiles;

alter table profiles
  drop column if exists email_verified,
  drop column if exists verification_code_hash,
  drop column if exists verification_code_expires_at,
  drop column if exists verification_code_sent_at;
