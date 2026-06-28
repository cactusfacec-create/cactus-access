create table admin_login_attempts (
  id          bigint generated always as identity primary key,
  email       text        not null,
  succeeded   boolean     not null default false,
  attempted_at timestamptz not null default now()
);

create index admin_login_attempts_lookup_idx
  on admin_login_attempts (email, attempted_at desc)
  where not succeeded;

alter table admin_login_attempts enable row level security;
