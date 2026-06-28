-- ── Tienda de dispositivos biométricos ────────────────────────────────────────

-- Catálogo de productos
create table if not exists productos_tienda (
  id            uuid          primary key default gen_random_uuid(),
  nombre        text          not null,
  descripcion   text,
  precio        numeric(10,2) not null,
  specs         jsonb,
  activo        boolean       not null default true,
  orden_display integer       not null default 0,
  created_at    timestamptz   not null default now()
);

-- Pedidos
create table if not exists pedidos_tienda (
  id                uuid          primary key default gen_random_uuid(),
  id_empresa        uuid          not null references empresas(id) on delete cascade,
  estado            text          not null default 'pendiente_pago'
    check (estado in ('pendiente_pago', 'pagado', 'en_preparacion', 'enviado', 'entregado', 'cancelado')),
  monto_total       numeric(10,2) not null,
  direccion_entrega text          not null,
  telefono_contacto text          not null,
  notas             text,
  created_at        timestamptz   not null default now(),
  updated_at        timestamptz   not null default now()
);

-- Items por pedido (snapshot de nombre y precio al momento de compra)
create table if not exists pedidos_tienda_items (
  id              uuid          primary key default gen_random_uuid(),
  id_pedido       uuid          not null references pedidos_tienda(id) on delete cascade,
  id_producto     uuid          not null references productos_tienda(id),
  nombre_producto text          not null,
  cantidad        integer       not null default 1,
  precio_unitario numeric(10,2) not null
);

-- Extender payment_intents para soportar pedidos de tienda
alter table payment_intents
  add column if not exists tipo             text not null default 'plan'
    check (tipo in ('plan', 'producto')),
  add column if not exists id_pedido_tienda uuid references pedidos_tienda(id);

-- Índice para búsquedas de pedidos por empresa
create index if not exists idx_pedidos_tienda_empresa
  on pedidos_tienda (id_empresa);

-- ── RLS ───────────────────────────────────────────────────────────────────────

alter table productos_tienda enable row level security;
-- Cualquier usuario autenticado puede ver productos activos
create policy "productos_tienda_select"
  on productos_tienda for select
  to authenticated
  using (activo = true);

alter table pedidos_tienda enable row level security;
create policy "pedidos_tienda_select"
  on pedidos_tienda for select
  using (id_empresa = (select id_empresa from profiles where id = auth.uid()));
create policy "pedidos_tienda_insert"
  on pedidos_tienda for insert
  with check (id_empresa = (select id_empresa from profiles where id = auth.uid()));

alter table pedidos_tienda_items enable row level security;
create policy "pedidos_tienda_items_select"
  on pedidos_tienda_items for select
  using (
    id_pedido in (
      select id from pedidos_tienda
      where id_empresa = (select id_empresa from profiles where id = auth.uid())
    )
  );
create policy "pedidos_tienda_items_insert"
  on pedidos_tienda_items for insert
  with check (
    id_pedido in (
      select id from pedidos_tienda
      where id_empresa = (select id_empresa from profiles where id = auth.uid())
    )
  );

-- ── Catálogo inicial (Hikvision) ─────────────────────────────────────────────
insert into productos_tienda (nombre, descripcion, precio, specs, orden_display) values
(
  'Hikvision DS-K1A8503EF',
  'Terminal de control de asistencia de huellas dactilares Hikvision. Pantalla LCD de 2.4 pulgadas. Capacidad para 1,000 usuarios, 1,000 huellas y 100,000 registros de eventos. Comunicación TCP/IP cableada y descarga de reportes vía USB. Soporta hasta 32 turnos y batería de respaldo integrada.',
  57.15,
  '{"capacidad_huella": 1000, "conectividad": ["TCP/IP", "USB"], "pantalla": "2.4\" LCD", "garantia": "1 año"}',
  1
),
(
  'Hikvision DS-K1T8003EF',
  'Terminal híbrida para control de acceso y asistencia de personal. Capacidad para 1,000 usuarios, 1,000 huellas dactilares y 1,000 tarjetas EM de 125 kHz. Pantalla LCD de 2.4 pulgadas, comunicación TCP/IP, salida de relay para chapa magnética o cerradura eléctrica, y reportes directos por USB.',
  66.30,
  '{"capacidad_huella": 1000, "capacidad_tarjeta": 1000, "conectividad": ["TCP/IP", "USB"], "pantalla": "2.4\" LCD", "garantia": "1 año"}',
  2
),
(
  'Hikvision DS-K1T320MFX',
  'Terminal de reconocimiento facial y asistencia para interiores Hikvision MinMoe Serie Value. Pantalla LCD de 2.4 pulgadas, cámara de 2 MP. Autenticación múltiple por rostro, huella digital, tarjeta Mifare (M1) y PIN. Capacidad para 500 rostros, 1,000 huellas y 100,000 eventos.',
  65.40,
  '{"capacidad_facial": 500, "capacidad_huella": 1000, "capacidad_tarjeta": 1000, "conectividad": ["TCP/IP"], "pantalla": "2.4\" LCD", "garantia": "1 año"}',
  3
),
(
  'Hikvision DS-K1T321MFWX',
  'Terminal biométrica portátil avanzada de reconocimiento facial de la serie MinMoe con conexión Wi-Fi (2.4G) integrada. Cuenta con pantalla de 2.4 pulgadas, lente de 2 MP con tecnología Deep Learning de alta precisión. Capacidad para 500 rostros, 3,000 huellas, 3,000 tarjetas Mifare y 150,000 eventos.',
  85.55,
  '{"capacidad_facial": 500, "capacidad_huella": 3000, "capacidad_tarjeta": 3000, "conectividad": ["Wi-Fi 2.4G", "TCP/IP"], "pantalla": "2.4\"", "garantia": "1 año"}',
  4
);
