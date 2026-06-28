-- Soporta la máquina de estados de marcaciones (entrada / salida a almuerzo /
-- regreso de almuerzo / salida final) que decide el flujo de n8n a partir de
-- qué columnas de la marca de hoy ya tienen hora registrada.
alter table control_diario
  add column if not exists hora_salida_almuerzo_real timestamptz,
  add column if not exists hora_entrada_almuerzo_real timestamptz;
