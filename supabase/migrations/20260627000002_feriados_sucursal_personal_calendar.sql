-- Feriados ahora son por sucursal (no por empresa)
drop policy if exists "dias_feriados_tenant" on dias_feriados;
alter table dias_feriados drop constraint if exists dias_feriados_id_empresa_fecha_key;
alter table dias_feriados drop constraint if exists dias_feriados_id_empresa_fkey;
alter table dias_feriados drop column if exists id_empresa;
alter table dias_feriados add column id_sucursal uuid not null references sucursales(id) on delete cascade;
alter table dias_feriados add constraint dias_feriados_id_sucursal_fecha_key unique (id_sucursal, fecha);

create policy "dias_feriados_tenant" on dias_feriados
  for all using (
    exists (
      select 1 from sucursales s
      where s.id = dias_feriados.id_sucursal
        and s.id_empresa = profile_id_empresa()
        and empresa_licencia_activa(s.id_empresa)
    )
  );

-- Calendario personal: fechas específicas por empleado (vacaciones, permisos, etc.)
create table fechas_no_laborables_empleado (
  id_empleado  uuid not null references empleados(id) on delete cascade,
  fecha        date not null,
  descripcion  text,
  primary key (id_empleado, fecha)
);

alter table fechas_no_laborables_empleado enable row level security;

create policy "fechas_no_lab_emp_tenant" on fechas_no_laborables_empleado
  for all using (
    exists (
      select 1 from empleados e
      where e.id = fechas_no_laborables_empleado.id_empleado
        and e.id_empresa = profile_id_empresa()
        and empresa_licencia_activa(e.id_empresa)
    )
  );
