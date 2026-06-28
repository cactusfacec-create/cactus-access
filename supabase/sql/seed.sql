-- Datos de prueba para el esquema nuevo (device_id en sucursales, horario de
-- 2 jornadas, registros_no_reconocidos). Después de correr esto, registra un
-- usuario desde /registro y actualiza su profile para apuntar a esta empresa:
--   update profiles set id_empresa = '11111111-1111-1111-1111-111111111111' where id = '<tu-user-id>';

insert into empresas (id, nombre_empresa, direccion, telefono, email, ruc, telefono_notificacion_tardanza) values
  ('11111111-1111-1111-1111-111111111111', 'Cactus Demo S.A.', 'Av. Amazonas 123, Quito', '+593987654321', 'contacto@cactusdemo.com', '1790000000001', '+593999111222')
on conflict (id) do nothing;

insert into licencias (id_empresa, limite_empleados, limite_sucursales, tipo_corte, fecha_vencimiento, activa) values
  ('11111111-1111-1111-1111-111111111111', 20, 3, 'quincenal', now() + interval '30 days', true)
on conflict (id_empresa) do nothing;

insert into sucursales (
  id, id_empresa, nombre_sucursal, direccion, device_id,
  jornada1_activo, jornada1_entrada, jornada1_salida_almuerzo, jornada1_entrada_almuerzo, jornada1_salida,
  jornada2_activo, jornada2_entrada, jornada2_salida
) values
  ('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', 'Sucursal Centro', 'Quito Centro', 'HIK-DEMO-0001',
   true, '08:00', '13:00', '14:00', '17:00', false, null, null)
on conflict (id) do nothing;

insert into empleados (id, id_empresa, id_sucursal, nombre, cedula, telefono) values
  ('44444444-4444-4444-4444-444444444441', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', 'Juan Pérez', '1700000001', '+593912345678')
on conflict (id) do nothing;

insert into horarios_empleados (id_empleado, usa_horario_global) values
  ('44444444-4444-4444-4444-444444444441', true)
on conflict (id_empleado) do nothing;

insert into control_diario (id_empresa, id_empleado, fecha, hora_entrada_real, hora_salida_real, minutos_atraso, minutos_salida_temprana, minutos_extras) values
  ('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444441', current_date - 1, (current_date - 1) + time '08:07', (current_date - 1) + time '17:00', 7, 0, 0)
on conflict do nothing;

-- Marcación de una cédula que no existe como empleado: debe aparecer en la
-- vista "Registros No Reconocidos".
insert into registros_no_reconocidos (id_sucursal, cedula_recibida, fecha_hora_evento, estado) values
  ('22222222-2222-2222-2222-222222222221', '1799999999', now() - interval '1 hour', 'pendiente');
