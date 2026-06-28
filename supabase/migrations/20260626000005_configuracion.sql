create table configuracion (
  id                   text primary key default 'global',
  payphone_token       text default null,
  payphone_store_id    text default null,
  deuna_api_key        text default null,
  deuna_store_id       text default null,
  deuna_webhook_secret text default null,
  deuna_env            text default 'production',
  updated_at           timestamptz default now()
);

insert into configuracion (id) values ('global') on conflict do nothing;
