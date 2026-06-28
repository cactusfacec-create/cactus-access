alter table empresas
  add column if not exists otp_requerido boolean not null default true;
