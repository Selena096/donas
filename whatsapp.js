/* ============================================
   CAPRICHART — WHATSAPP UTILS
   ============================================ */

/**
 * Abre WhatsApp con un mensaje pre-armado.
 * @param {string} mensaje - Texto del mensaje
 */
function abrirWhatsApp(mensaje) {
  const url = `https://wa.me/${CONFIG.WA_NUMBER}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Arma el mensaje para la caja clásica de 9.
 */
function mensajeCaja9(datos) {
  const precio = CONFIG.PRECIO_CAJA_9.toLocaleString('es-CO');
  let msg = `🍩 *PEDIDO CAPRICHART — Caja de 9*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  msg += `🍫 *Sabores:*\n`;
  if (datos.choco   > 0) msg += `  • Chocolate: ${datos.choco} dona(s)\n`;
  if (datos.vainilla > 0) msg += `  • Vainilla: ${datos.vainilla} dona(s)\n`;
  msg += `\n🍯 *Salsas:* ${datos.salsas.join(', ')}\n`;
  msg += `🌈 *Toppings:* ${datos.toppings.join(', ')}\n`;
  msg += `\n💰 *Total:* $${precio} COP\n`;
  msg += `💳 *Pago:* ${datos.pago}\n\n`;
  msg += `¡Hola! Me gustaría hacer este pedido 😊`;
  return msg;
}

/**
 * Arma el mensaje para la caja clásica de 15.
 */
function mensajeCaja15(datos) {
  const precio = CONFIG.PRECIO_CAJA_15.toLocaleString('es-CO');
  let msg = `🍩 *PEDIDO CAPRICHART — Caja de 15*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  msg += `🍫 *Sabores:*\n`;
  if (datos.choco    > 0) msg += `  • Chocolate: ${datos.choco} dona(s)\n`;
  if (datos.vainilla > 0) msg += `  • Vainilla: ${datos.vainilla} dona(s)\n`;
  msg += `\n🍯 *Salsas:* ${datos.salsas.join(', ')}\n`;
  msg += `🌈 *Toppings:* ${datos.toppings.join(', ')}\n`;
  msg += `\n💰 *Total:* $${precio} COP\n`;
  msg += `💳 *Pago:* ${datos.pago}\n\n`;
  msg += `¡Hola! Me gustaría hacer este pedido 😊`;
  return msg;
}

/**
 * Arma el mensaje para la caja gourmet.
 */
function mensajeGourmet(datos) {
  const total  = datos.sabores.reduce((a, s) => a + s.cantidad, 0);
  const precio = Math.round(total * (CONFIG.PRECIO_GOURMET / 9)).toLocaleString('es-CO');

  let msg = `✨ *PEDIDO CAPRICHART — Caja Gourmet*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  msg += `🍩 *Sabores elegidos:*\n`;
  datos.sabores.forEach(s => {
    msg += `  • ${s.nombre}: ${s.cantidad} dona(s)\n`;
  });
  msg += `\n📦 *Total donas:* ${total}\n`;
  msg += `💰 *Precio estimado:* $${precio} COP\n`;
  msg += `💳 *Pago:* ${datos.pago}\n\n`;
  msg += `¡Hola! Quiero ser de los primeros en probar la Colección Gourmet 😊`;
  return msg;
}
