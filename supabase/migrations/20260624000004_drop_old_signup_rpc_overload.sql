-- CREATE OR REPLACE no sustituye una función si la lista de parámetros de
-- entrada cambia de cantidad (aunque el nuevo parámetro tenga default): la
-- migración 20260624000002 creó un *segundo* overload de 3 argumentos en vez
-- de reemplazar el original de 2, dejando ambigüedad/inconsistencia para
-- cualquier llamada que no pase los 3 argumentos explícitos. Se elimina el
-- overload viejo para que solo exista la versión con p_email_verified.
drop function if exists handle_new_company_signup(uuid, text);
