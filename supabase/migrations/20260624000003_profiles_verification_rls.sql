-- Permite que un usuario autenticado actualice sus propias columnas de
-- verificación de correo (usado por actions/verificacion.actions.ts). No
-- existía ninguna policy "for update" sobre profiles hasta ahora.
drop policy if exists "profiles_update_own_verification" on profiles;
create policy "profiles_update_own_verification" on profiles
  for update
  using (id = auth.uid())
  with check (id = auth.uid());
