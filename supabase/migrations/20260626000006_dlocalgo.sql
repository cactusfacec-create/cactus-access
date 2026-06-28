-- Añadir columnas dLocal Go a la tabla configuracion
alter table configuracion
  add column if not exists dlocalgo_api_key    text default null,
  add column if not exists dlocalgo_secret_key text default null,
  add column if not exists dlocalgo_env        text default 'sandbox';
