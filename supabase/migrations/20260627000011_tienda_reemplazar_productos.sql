-- Reemplaza el catálogo de productos de la tienda con los Hikvision reales
-- (borra pedidos de prueba y productos existentes, luego inserta el catálogo correcto)

delete from pedidos_tienda_items;
delete from pedidos_tienda;
delete from productos_tienda;

insert into productos_tienda (nombre, descripcion, precio, specs, imagen_url, activo, orden_display) values
(
  'Hikvision DS-K1A8503EF',
  'Terminal de control de asistencia de huellas dactilares Hikvision. Pantalla LCD de 2.4 pulgadas. Capacidad para 1,000 usuarios, 1,000 huellas y 100,000 registros de eventos. Comunicación TCP/IP cableada y descarga de reportes vía USB. Soporta hasta 32 turnos y batería de respaldo integrada.',
  57.15,
  '{"capacidad_huella": 1000, "conectividad": ["TCP/IP", "USB"], "pantalla": "2.4\" LCD", "garantia": "1 año"}',
  'https://clicksd.ec/wp-content/uploads/2025/12/DS-K1A8503EFMF2-Photoroom.png',
  true,
  1
),
(
  'Hikvision DS-K1T8003EF',
  'Terminal híbrida para control de acceso y asistencia de personal. Capacidad para 1,000 usuarios, 1,000 huellas dactilares y 1,000 tarjetas EM de 125 kHz. Pantalla LCD de 2.4 pulgadas, comunicación TCP/IP, salida de relay para chapa magnética o cerradura eléctrica, y reportes directos por USB.',
  66.30,
  '{"capacidad_huella": 1000, "capacidad_tarjeta": 1000, "conectividad": ["TCP/IP", "USB"], "pantalla": "2.4\" LCD", "garantia": "1 año"}',
  'https://clicksd.ec/wp-content/uploads/2025/12/D_NQ_NP_907226-MEC50804891696_072022-O-Photoroom.png',
  true,
  2
),
(
  'Hikvision DS-K1T320MFX',
  'Terminal de reconocimiento facial y asistencia para interiores Hikvision MinMoe Serie Value. Pantalla LCD de 2.4 pulgadas, cámara de 2 MP. Autenticación múltiple por rostro, huella digital, tarjeta Mifare (M1) y PIN. Capacidad para 500 rostros, 1,000 huellas y 100,000 eventos.',
  65.40,
  '{"capacidad_facial": 500, "capacidad_huella": 1000, "capacidad_tarjeta": 1000, "conectividad": ["TCP/IP"], "pantalla": "2.4\" LCD", "garantia": "1 año"}',
  'https://clicksd.ec/wp-content/uploads/2025/12/K1T320-指纹-正视图-Photoroom.png',
  true,
  3
),
(
  'Hikvision DS-K1T321MFWX',
  'Terminal biométrica portátil avanzada de reconocimiento facial de la serie MinMoe con conexión Wi-Fi (2.4G) integrada. Cuenta con pantalla de 2.4 pulgadas, lente de 2 MP con tecnología Deep Learning de alta precisión. Capacidad para 500 rostros, 3,000 huellas, 3,000 tarjetas Mifare y 150,000 eventos.',
  85.55,
  '{"capacidad_facial": 500, "capacidad_huella": 3000, "capacidad_tarjeta": 3000, "conectividad": ["Wi-Fi 2.4G", "TCP/IP"], "pantalla": "2.4\"", "garantia": "1 año"}',
  'https://clicksd.ec/wp-content/uploads/2025/12/DS-K1T321MFWX-WIFI.png',
  true,
  4
);
