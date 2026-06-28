const WHATSAPP_NUMERO = "593980004089";
const WHATSAPP_MENSAJE = "Hola, necesito ayuda con Cactus Access.";

export function buildWhatsAppLink() {
  return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(WHATSAPP_MENSAJE)}`;
}
