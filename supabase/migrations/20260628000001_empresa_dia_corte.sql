alter table sucursales
  add column if not exists dia_corte integer check (dia_corte between 1 and 28);

alter table empleados
  add column if not exists dia_corte integer check (dia_corte between 1 and 28);
