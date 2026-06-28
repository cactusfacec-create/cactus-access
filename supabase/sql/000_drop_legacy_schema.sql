-- Refactor arquitectónico: device_id pasa de empresa/dispositivos_biometricos a
-- sucursales, y se introduce registros_no_reconocidos. Se borra y recrea el
-- esquema completo (decisión del usuario: no hay datos de producción que migrar,
-- solo una empresa demo descartable).

drop function if exists handle_new_company_signup(uuid, text) cascade;
drop function if exists empresa_licencia_activa(uuid) cascade;
drop function if exists profile_empresa_id() cascade;

drop table if exists control_diario cascade;
drop table if exists registros_no_reconocidos cascade;
drop table if exists horarios_empleados cascade;
drop table if exists horarios cascade;
drop table if exists dispositivos_biometricos cascade;
drop table if exists empleados cascade;
drop table if exists sucursales cascade;
drop table if exists profiles cascade;
drop table if exists licencias cascade;
drop table if exists empresas cascade;

drop type if exists rol_usuario cascade;
