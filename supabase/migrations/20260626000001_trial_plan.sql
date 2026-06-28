-- Añadir soporte para plan 'prueba' (trial de 15 días para empresas nuevas)

-- 1. Eliminar cualquier CHECK constraint existente en plan_tipo
--    (en caso de que sólo permitía 'pro', 'max', 'personalizado')
ALTER TABLE licencias DROP CONSTRAINT IF EXISTS licencias_plan_tipo_check;
ALTER TABLE licencias DROP CONSTRAINT IF EXISTS licencias_plan_tipo_fkey;

-- 2. Asegurarse de que las columnas añadidas en la sesión anterior existen y son nullable
ALTER TABLE licencias ADD COLUMN IF NOT EXISTS plan_tipo TEXT;
ALTER TABLE licencias ADD COLUMN IF NOT EXISTS periodo_facturacion TEXT;
ALTER TABLE licencias ADD COLUMN IF NOT EXISTS precio NUMERIC;

-- Quitar NOT NULL por si fueron añadidas con esa restricción
ALTER TABLE licencias ALTER COLUMN plan_tipo DROP NOT NULL;
ALTER TABLE licencias ALTER COLUMN periodo_facturacion DROP NOT NULL;
ALTER TABLE licencias ALTER COLUMN precio DROP NOT NULL;

-- 3. Añadir CHECK constraint actualizado que incluye 'prueba'
ALTER TABLE licencias ADD CONSTRAINT licencias_plan_tipo_check
  CHECK (plan_tipo IS NULL OR plan_tipo IN ('pro', 'max', 'personalizado', 'prueba'));

-- 4. Crear la tabla planes si no existe
CREATE TABLE IF NOT EXISTS planes (
  id                TEXT PRIMARY KEY,
  precio_trimestral NUMERIC NOT NULL DEFAULT 0,
  precio_semestral  NUMERIC NOT NULL DEFAULT 0,
  precio_anual      NUMERIC NOT NULL DEFAULT 0,
  limite_sucursales INTEGER NOT NULL DEFAULT 1,
  limite_empleados  INTEGER NOT NULL DEFAULT 5,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Seed de planes si no existen
INSERT INTO planes (id, precio_trimestral, precio_semestral, precio_anual, limite_sucursales, limite_empleados)
VALUES
  ('pro',  45,  80, 140, 1,  5),
  ('max',  90, 160, 280, 3, 20)
ON CONFLICT (id) DO NOTHING;
