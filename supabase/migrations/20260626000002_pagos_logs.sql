-- ── Historial de pagos por empresa ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pagos (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  id_empresa           UUID        NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  metodo_pago          TEXT        NOT NULL CHECK (metodo_pago IN ('tarjeta', 'efectivo', 'transferencia')),
  monto                NUMERIC     NOT NULL DEFAULT 0,
  plan_tipo            TEXT        NOT NULL,
  periodo_facturacion  TEXT        NOT NULL,
  fecha_desde          DATE        NOT NULL DEFAULT CURRENT_DATE,
  fecha_hasta          DATE        NOT NULL,
  limite_sucursales    INTEGER     NOT NULL DEFAULT 1,
  limite_empleados     INTEGER     NOT NULL DEFAULT 5,
  codigo_transaccion   TEXT,
  comprobante_url      TEXT,
  notas                TEXT,
  aprobado_por         TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Historial de ingresos al panel admin ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_access_logs (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID,
  user_email TEXT        NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Historial de modificaciones (audit log) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID,
  user_email     TEXT        NOT NULL,
  accion         TEXT        NOT NULL,
  entidad        TEXT        NOT NULL,
  entidad_id     TEXT,
  empresa_nombre TEXT,
  detalle        JSONB,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Bucket de Supabase Storage para comprobantes de pago ─────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'comprobantes',
  'comprobantes',
  true,
  5242880,
  ARRAY['image/jpeg','image/png','image/webp','image/gif','application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Política: usuarios autenticados pueden subir comprobantes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects' AND schemaname = 'storage'
      AND policyname = 'auth_upload_comprobantes'
  ) THEN
    CREATE POLICY auth_upload_comprobantes ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'comprobantes');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects' AND schemaname = 'storage'
      AND policyname = 'auth_read_comprobantes'
  ) THEN
    CREATE POLICY auth_read_comprobantes ON storage.objects
      FOR SELECT TO authenticated
      USING (bucket_id = 'comprobantes');
  END IF;
END;
$$;
