-- ── Extensiones a la tabla pagos para soportar pasarelas ────────────────────

ALTER TABLE pagos
  ADD COLUMN IF NOT EXISTS proveedor         TEXT NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS estado            TEXT NOT NULL DEFAULT 'aprobado',
  ADD COLUMN IF NOT EXISTS referencia_externa TEXT,
  ADD COLUMN IF NOT EXISTS moneda            TEXT NOT NULL DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS payload_respuesta JSONB;

-- Quitar constraints anteriores si existieran con otro nombre
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT con.conname FROM pg_constraint con
    JOIN pg_class cls ON cls.oid = con.conrelid
    WHERE cls.relname = 'pagos' AND con.contype = 'c'
      AND pg_get_constraintdef(con.oid) ILIKE '%proveedor%'
  LOOP
    EXECUTE 'ALTER TABLE pagos DROP CONSTRAINT ' || quote_ident(r.conname);
  END LOOP;

  FOR r IN
    SELECT con.conname FROM pg_constraint con
    JOIN pg_class cls ON cls.oid = con.conrelid
    WHERE cls.relname = 'pagos' AND con.contype = 'c'
      AND pg_get_constraintdef(con.oid) ILIKE '%estado%'
  LOOP
    EXECUTE 'ALTER TABLE pagos DROP CONSTRAINT ' || quote_ident(r.conname);
  END LOOP;
END;
$$;

ALTER TABLE pagos
  ADD CONSTRAINT pagos_proveedor_check
    CHECK (proveedor IN ('manual', 'payphone', 'deuna')),
  ADD CONSTRAINT pagos_estado_check
    CHECK (estado IN ('pendiente', 'aprobado', 'rechazado', 'reembolsado'));

-- ── Intents de pago: registro del intento antes de que el cliente pague ──────
-- Se crea cuando el admin genera un enlace de pago; se actualiza via webhook.

CREATE TABLE IF NOT EXISTS payment_intents (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  id_empresa            UUID        NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  proveedor             TEXT        NOT NULL CHECK (proveedor IN ('payphone', 'deuna')),
  estado                TEXT        NOT NULL DEFAULT 'pendiente'
                          CHECK (estado IN ('pendiente', 'aprobado', 'rechazado', 'expirado', 'cancelado')),
  monto                 NUMERIC     NOT NULL,
  moneda                TEXT        NOT NULL DEFAULT 'USD',
  plan_tipo             TEXT        NOT NULL,
  periodo_facturacion   TEXT        NOT NULL,
  fecha_hasta           DATE        NOT NULL,
  limite_sucursales     INTEGER     NOT NULL DEFAULT 1,
  limite_empleados      INTEGER     NOT NULL DEFAULT 5,
  -- Nuestro ID enviado al proveedor (debe ser único)
  client_transaction_id TEXT        UNIQUE NOT NULL,
  -- ID de transacción/orden devuelto por el proveedor (llega en el webhook)
  referencia_externa    TEXT,
  -- URL de checkout generada por el proveedor
  checkout_url          TEXT,
  -- Payload completo enviado al proveedor (para debug)
  payload_inicio        JSONB,
  -- Payload completo recibido del proveedor (webhook)
  payload_respuesta     JSONB,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para lookups rápidos por client_transaction_id en los webhooks
CREATE INDEX IF NOT EXISTS idx_payment_intents_client_tx
  ON payment_intents (client_transaction_id);

CREATE INDEX IF NOT EXISTS idx_payment_intents_empresa
  ON payment_intents (id_empresa);
