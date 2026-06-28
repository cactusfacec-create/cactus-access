alter table justificaciones_falta
  add column if not exists tipo text not null default 'falta'
  check (tipo in ('falta', 'incompleto'));
