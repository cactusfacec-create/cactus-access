-- Las migraciones anteriores crearon las tablas y las policies de RLS, pero
-- nunca otorgaron privilegios de tabla a los roles de PostgREST (anon,
-- authenticated, service_role). Sin estos GRANT, toda query falla con
-- "permission denied for table ..." antes de que RLS siquiera se evalúe.
-- RLS sigue siendo la capa que filtra FILAS; estos GRANT solo habilitan el
-- acceso a nivel de tabla (siguen sujetos a las policies ya creadas).

grant usage on schema public to anon, authenticated, service_role;

grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant all on all routines in schema public to anon, authenticated, service_role;

alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant all on routines to anon, authenticated, service_role;
