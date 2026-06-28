alter table empleados
  add column if not exists fecha_ingreso date not null default current_date;
