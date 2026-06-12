/* ============================================
   CAPRICHART — LÍNEA CLÁSICA
   Flujo: cantidad cajas → iguales/personalizar
   → sabores/salsas/toppings → pago → entrega
   → domicilio → resumen → WhatsApp
   ============================================ */

const pedido = {
  cajas9: 0, cajas15: 0,
  modo: null,
  configs: [],
  pago: null,
  entrega: null,
  direccion: '', barrio: '', nombreRecibe: '',
};

function $(id) { return document.getElementById(id); }
function show(id) { const e = $(id); if (e) e.style.display = 'block'; }
function hide(id) { const e = $(id); if (e) e.style.display = 'none'; }
function setErr(id, msg) { const e = $(id); if (e) e.textContent = msg; }
function clearErr(id) { setErr(id, ''); }
function fmt(n) { return '$' + n.toLocaleString('es-CO'); }

// ── PASO 1: CANTIDAD ──────────────────────────
function cambiarCajas(tipo, delta) {
  if (tipo === 'c9')  { pedido.cajas9  = Math.max(0, pedido.cajas9  + delta); $('qty-c9').textContent  = pedido.cajas9;  }
  else                { pedido.cajas15 = Math.max(0, pedido.cajas15 + delta); $('qty-c15').textContent = pedido.cajas15; }
  resetDesdePaso2();
  actualizarResumenCantidad();
}

function actualizarResumenCantidad() {
  const total = pedido.cajas9 * CONFIG.PRECIO_CAJA_9 + pedido.cajas15 * CONFIG.PRECIO_CAJA_15;
  const el = $('resumen-cantidad');
  if (pedido.cajas9 === 0 && pedido.cajas15 === 0) { el.textContent = ''; hide('paso2-wrap'); return; }
  let txt = '';
  if (pedido.cajas9  > 0) txt += `${pedido.cajas9} caja(s) ×9 = ${fmt(pedido.cajas9 * CONFIG.PRECIO_CAJA_9)}`;
  if (pedido.cajas9  > 0 && pedido.cajas15 > 0) txt += '   +   ';
  if (pedido.cajas15 > 0) txt += `${pedido.cajas15} caja(s) ×15 = ${fmt(pedido.cajas15 * CONFIG.PRECIO_CAJA_15)}`;
  txt += `   →   Total: ${fmt(total)}`;
  el.textContent = txt;
  show('paso2-wrap');
}

function resetDesdePaso2() {
  pedido.modo = null; pedido.configs = [];
  pedido.pago = null; pedido.entrega = null;
  pedido.direccion = ''; pedido.barrio = ''; pedido.nombreRecibe = '';
  document.querySelectorAll('.modo-chip').forEach(c => c.classList.remove('modo-chip--selected'));
  ['paso2-wrap','paso3-wrap','paso4-wrap','paso5-wrap','paso6-wrap','resumen-final-wrap']
    .forEach(id => hide(id));
}

// ── PASO 2: MODO ──────────────────────────────
function elegirModoGlobal(modo) {
  pedido.modo = modo;
  document.querySelectorAll('#paso2-wrap .modo-chip').forEach(c => c.classList.remove('modo-chip--selected'));
  $('modo-' + modo).classList.add('modo-chip--selected');
  construirConfiguradores();
  show('paso3-wrap');
  ['paso4-wrap','paso5-wrap','paso6-wrap','resumen-final-wrap'].forEach(id => hide(id));
  $('paso3-wrap').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── PASO 3: FICHAS ────────────────────────────
function construirConfiguradores() {
  const wrap = $('configuradores-wrap');
  wrap.innerHTML = '';
  pedido.configs = [];
  const listaCajas = [];
  for (let i = 0; i < pedido.cajas9;  i++) listaCajas.push(9);
  for (let i = 0; i < pedido.cajas15; i++) listaCajas.push(15);
  const numFichas = pedido.modo === 'iguales' ? 1 : listaCajas.length;
  const usarGrid = numFichas === 2;

  if (usarGrid) {
    wrap.innerHTML = '<div class="container-fluid px-0"><div class="row g-3" id="fichas-row"></div></div>';
  }

  for (let i = 0; i < numFichas; i++) {
    const tipo = listaCajas[i];
    const cfg = {
      id: `cfg${i}`, tipo, choco: 0, vainilla: 0,
      modo: tipo === 9 ? null : 'fijo',
      maxSalsas: tipo === 9 ? 0 : 3, maxToppings: tipo === 9 ? 0 : 3,
      minSalsas: tipo === 9 ? 0 : 1, minToppings: tipo === 9 ? 0 : 1,
      salsas: [], toppings: []
    };
    pedido.configs.push(cfg);
    const totalCajas = pedido.cajas9 + pedido.cajas15;
    const etiqueta = pedido.modo === 'iguales'
      ? (totalCajas === 1 ? (tipo === 9 ? 'Caja ×9' : 'Caja ×15') : 'Configuración para todas las cajas')
      : `${tipo === 9 ? 'Caja ×9' : 'Caja ×15'} — Caja ${i + 1}`;

    if (usarGrid) {
      const col = document.createElement('div');
      col.className = 'col-12 col-md-6';
      col.innerHTML = fichaHTML(cfg, etiqueta, i);
      document.getElementById('fichas-row').appendChild(col);
    } else {
      wrap.innerHTML += fichaHTML(cfg, etiqueta, i);
    }
  }
}

function fichaHTML(cfg, etiqueta, idx) {
  const esModo9 = cfg.tipo === 9;
  return `
  <div class="ficha-config" id="ficha-${idx}">
    <div class="ficha-header">
      <span class="ficha-tag">${esModo9 ? '🍩' : '🍩🍩'}</span>
      <span class="ficha-label">${etiqueta}</span>
      <span class="ficha-precio">${fmt(esModo9 ? CONFIG.PRECIO_CAJA_9 : CONFIG.PRECIO_CAJA_15)}</span>
    </div>
    <div class="config-group">
      <span class="config-label">🍫 Sabores (total ${cfg.tipo})</span>
      <div class="sabor-row">
        <span class="sabor-row__name">Chocolate</span>
        <div class="counter">
          <button class="counter__btn" onclick="cambiarSaborCfg(${idx},'choco',-1)">−</button>
          <span class="counter__val" id="${cfg.id}-choco">0</span>
          <button class="counter__btn" onclick="cambiarSaborCfg(${idx},'choco',1)">+</button>
        </div>
      </div>
      <div class="sabor-row">
        <span class="sabor-row__name">Vainilla</span>
        <div class="counter">
          <button class="counter__btn" onclick="cambiarSaborCfg(${idx},'vainilla',-1)">−</button>
          <span class="counter__val" id="${cfg.id}-vainilla">0</span>
          <button class="counter__btn" onclick="cambiarSaborCfg(${idx},'vainilla',1)">+</button>
        </div>
      </div>
      <div class="counter-status counter-status--warn" id="${cfg.id}-sabor-status">Faltan ${cfg.tipo} donas por asignar</div>
    </div>
    ${esModo9 ? `
    <div class="config-group">
      <span class="config-label">⚖️ ¿Cómo combinar?</span>
      <div class="modo-chips">
        <button class="modo-chip" id="${cfg.id}-modo-2s1t" onclick="elegirModoCfg(${idx},'2s1t')">2 Salsas + 1 Topping</button>
        <button class="modo-chip" id="${cfg.id}-modo-1s2t" onclick="elegirModoCfg(${idx},'1s2t')">1 Salsa + 2 Toppings</button>
      </div>
    </div>` : ''}
    <div class="config-group">
      <span class="config-label">🍯 Salsas${esModo9 ? '' : ' (elige 1 a 3)'}</span>
      ${esModo9 ? `<span class="config-note" id="${cfg.id}-salsas-note">Elige tu modo primero</span>` : ''}
      <div class="chips" id="${cfg.id}-salsas-chips">
        <button class="chip" onclick="toggleChipCfg(${idx},'salsas','Leche condensada',this)">Leche condensada</button>
        <button class="chip" onclick="toggleChipCfg(${idx},'salsas','Arequipe',this)">Arequipe</button>
        <button class="chip" onclick="toggleChipCfg(${idx},'salsas','Chocolate',this)">Chocolate</button>
      </div>
      <div class="error-msg" id="${cfg.id}-salsas-err"></div>
    </div>
    <div class="config-group">
      <span class="config-label">🌈 Toppings${esModo9 ? '' : ' (elige 1 a 3)'}</span>
      ${esModo9 ? `<span class="config-note" id="${cfg.id}-toppings-note">Elige tu modo primero</span>` : ''}
      <div class="chips" id="${cfg.id}-toppings-chips">
        <button class="chip" onclick="toggleChipCfg(${idx},'toppings','Chocodiscos',this)">Chocodisk</button>
        <button class="chip" onclick="toggleChipCfg(${idx},'toppings','Mini chips de chocolate',this)">Mini chips choco</button>
        <button class="chip" onclick="toggleChipCfg(${idx},'toppings','Maní',this)">Maní</button>
        <button class="chip" onclick="toggleChipCfg(${idx},'toppings','Oreo triturado',this)">Oreo triturado</button>
        <button class="chip" onclick="toggleChipCfg(${idx},'toppings','Fresa picada',this)">Fresa picada</button>
      </div>
      <div class="error-msg" id="${cfg.id}-toppings-err"></div>
    </div>
    <div class="error-msg" id="${cfg.id}-err"></div>
  </div>`;
}

function cambiarSaborCfg(idx, tipo, delta) {
  const cfg = pedido.configs[idx], otro = tipo === 'choco' ? 'vainilla' : 'choco';
  let v = cfg[tipo] + delta; if (v < 0) v = 0; if (v > cfg.tipo - cfg[otro]) v = cfg.tipo - cfg[otro];
  cfg[tipo] = v; $(`${cfg.id}-${tipo}`).textContent = v;
  const diff = cfg.tipo - cfg.choco - cfg.vainilla, el = $(`${cfg.id}-sabor-status`);
  if (diff > 0)      { el.textContent = `Faltan ${diff} dona(s)`; el.className = 'counter-status counter-status--warn'; }
  else if (diff < 0) { el.textContent = `Reduce ${Math.abs(diff)}`; el.className = 'counter-status counter-status--warn'; }
  else               { el.textContent = `✅ ${cfg.tipo} donas asignadas`; el.className = 'counter-status counter-status--ok'; }
}

function elegirModoCfg(idx, modo) {
  const cfg = pedido.configs[idx];
  cfg.modo = modo; cfg.salsas = []; cfg.toppings = [];
  document.querySelectorAll(`#${cfg.id}-salsas-chips .chip, #${cfg.id}-toppings-chips .chip`).forEach(c => c.classList.remove('chip--selected'));
  if (modo === '2s1t') { cfg.maxSalsas = 2; cfg.maxToppings = 1; $(`${cfg.id}-salsas-note`).textContent = 'Elige 2 salsas'; $(`${cfg.id}-toppings-note`).textContent = 'Elige 1 topping'; }
  else                 { cfg.maxSalsas = 1; cfg.maxToppings = 2; $(`${cfg.id}-salsas-note`).textContent = 'Elige 1 salsa';  $(`${cfg.id}-toppings-note`).textContent = 'Elige 2 toppings'; }
  $(`${cfg.id}-modo-2s1t`).classList.toggle('modo-chip--selected', modo === '2s1t');
  $(`${cfg.id}-modo-1s2t`).classList.toggle('modo-chip--selected', modo === '1s2t');
}

function toggleChipCfg(idx, tipo, valor, el) {
  const cfg = pedido.configs[idx], max = tipo === 'salsas' ? cfg.maxSalsas : cfg.maxToppings;
  const arr = cfg[tipo], errId = `${cfg.id}-${tipo}-err`;
  if (cfg.tipo === 9 && !cfg.modo) { setErr(errId, '⚠️ Elige tu combinación primero'); setTimeout(() => clearErr(errId), 2000); return; }
  const i = arr.indexOf(valor);
  if (i > -1) { arr.splice(i, 1); el.classList.remove('chip--selected'); }
  else {
    if (arr.length >= max) { setErr(errId, `Solo ${max} ${tipo === 'salsas' ? 'salsa(s)' : 'topping(s)'}`); setTimeout(() => clearErr(errId), 2000); return; }
    arr.push(valor); el.classList.add('chip--selected');
  }
  clearErr(errId);
}

function confirmarConfigs() {
  for (let i = 0; i < pedido.configs.length; i++) {
    const cfg = pedido.configs[i];
    if (cfg.choco + cfg.vainilla !== cfg.tipo)   { setErr(`${cfg.id}-err`, `⚠️ Asigna exactamente ${cfg.tipo} donas`); return; }
    if (cfg.tipo === 9 && !cfg.modo)             { setErr(`${cfg.id}-err`, `⚠️ Elige una combinación`); return; }
    if (cfg.salsas.length < (cfg.minSalsas || cfg.maxSalsas))     { setErr(`${cfg.id}-err`, `⚠️ Elige al menos ${cfg.minSalsas || cfg.maxSalsas} salsa(s)`); return; }
    if (cfg.toppings.length < (cfg.minToppings || cfg.maxToppings)) { setErr(`${cfg.id}-err`, `⚠️ Elige al menos ${cfg.minToppings || cfg.maxToppings} topping(s)`); return; }
    clearErr(`${cfg.id}-err`);
  }
  show('paso4-wrap');
  ['paso5-wrap','paso6-wrap','resumen-final-wrap'].forEach(id => hide(id));
  $('paso4-wrap').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── PASO 4: PAGO ──────────────────────────────
function elegirPago(valor, el) {
  pedido.pago = valor;
  document.querySelectorAll('#paso4-wrap .pago-chip').forEach(c => c.classList.remove('pago-chip--selected'));
  el.classList.add('pago-chip--selected');
  show('paso5-wrap');
  ['paso6-wrap','resumen-final-wrap'].forEach(id => hide(id));
  $('paso5-wrap').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── PASO 5: ENTREGA ───────────────────────────
function elegirEntrega(valor, el) {
  pedido.entrega = valor;
  document.querySelectorAll('#paso5-wrap .entrega-chip').forEach(c => c.classList.remove('entrega-chip--selected'));
  el.classList.add('entrega-chip--selected');
  hide('resumen-final-wrap');
  if (valor === 'domicilio') { show('paso6-wrap'); $('paso6-wrap').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  else                       { hide('paso6-wrap'); mostrarResumen(); }
}

// ── PASO 6: DOMICILIO ─────────────────────────
function confirmarDomicilio() {
  pedido.direccion    = $('input-direccion').value.trim();
  pedido.barrio       = $('input-barrio').value.trim();
  pedido.nombreRecibe = $('input-nombre').value.trim();
  if (!pedido.direccion)    { setErr('paso6-err', '⚠️ Ingresa la dirección'); return; }
  if (!pedido.barrio)       { setErr('paso6-err', '⚠️ Ingresa el barrio'); return; }
  if (!pedido.nombreRecibe) { setErr('paso6-err', '⚠️ Ingresa el nombre de quien recibe'); return; }
  clearErr('paso6-err');
  mostrarResumen();
}

// ── RESUMEN ───────────────────────────────────
function mostrarResumen() {
  const totalDonas = pedido.cajas9 * CONFIG.PRECIO_CAJA_9 + pedido.cajas15 * CONFIG.PRECIO_CAJA_15;
  const wrap = $('resumen-final-wrap');
  let html = `<div class="resumen-box"><h3 class="resumen-titulo">📋 Resumen de tu pedido</h3><div class="resumen-section">`;
  if (pedido.cajas9  > 0) html += `<div class="resumen-row"><span>🍩 Caja ×9 × ${pedido.cajas9}</span><span>${fmt(pedido.cajas9 * CONFIG.PRECIO_CAJA_9)}</span></div>`;
  if (pedido.cajas15 > 0) html += `<div class="resumen-row"><span>🍩 Caja ×15 × ${pedido.cajas15}</span><span>${fmt(pedido.cajas15 * CONFIG.PRECIO_CAJA_15)}</span></div>`;
  html += `</div><div class="resumen-total">`;
  html += `<div class="resumen-row resumen-row--donas"><span>🍩 Total donas</span><span>${fmt(totalDonas)}</span></div>`;
  if (pedido.entrega === 'domicilio') {
    html += `<div class="resumen-row"><span>🛵 Domicilio</span><span>A convenir</span></div>`;
    html += `<div class="resumen-row resumen-row--final"><span>💰 Total</span><span>${fmt(totalDonas)} + domicilio</span></div>`;
  } else {
    html += `<div class="resumen-row resumen-row--final"><span>💰 Total</span><span>${fmt(totalDonas)}</span></div>`;
    html += `<div class="resumen-row"><span>📍 Recoge en</span><span>${CONFIG.PUNTO_RECOGIDA}</span></div>`;
  }
  html += `</div></div>`;
  const svg = `<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`;
  wrap.innerHTML = html + `<div class="error-msg" id="resumen-err"></div><button class="btn-enviar" onclick="enviarPedidoCompleto()">${svg} Enviar Pedido por WhatsApp 💬</button>`;
  show('resumen-final-wrap');
  wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── ENVIAR WHATSAPP ───────────────────────────
function enviarPedidoCompleto() {
  const totalDonas = pedido.cajas9 * CONFIG.PRECIO_CAJA_9 + pedido.cajas15 * CONFIG.PRECIO_CAJA_15;
  const esIgual = pedido.modo === 'iguales';
  let msg = `🍩✨ *PEDIDO CAPRICHART* ✨🍩\n━━━━━━━━━━━━━━━━━━━━━━━\n\n📦 *Pedido:*\n`;
  if (pedido.cajas9  > 0) msg += `  🍩 ${pedido.cajas9} caja(s) ×9 donas — ${fmt(pedido.cajas9 * CONFIG.PRECIO_CAJA_9)}\n`;
  if (pedido.cajas15 > 0) msg += `  🍩 ${pedido.cajas15} caja(s) ×15 donas — ${fmt(pedido.cajas15 * CONFIG.PRECIO_CAJA_15)}\n`;
  msg += `\n`;
  if (esIgual) {
    msg += `🎨 *Configuración (todas iguales):*\n` + detalleConfig(pedido.configs[0]);
  } else {
    const lista = [];
    for (let i = 0; i < pedido.cajas9;  i++) lista.push({ label: `Caja ×9 — #${i+1}`,             cfg: pedido.configs[i] });
    for (let i = 0; i < pedido.cajas15; i++) lista.push({ label: `Caja ×15 — #${pedido.cajas9+i+1}`, cfg: pedido.configs[pedido.cajas9+i] });
    lista.forEach(item => { msg += `🎨 *${item.label}:*\n` + detalleConfig(item.cfg); });
  }
  msg += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `💰 *Total donas:* ${fmt(totalDonas)}\n`;
  if (pedido.entrega === 'domicilio') {
    msg += `🛵 *Domicilio:* A convenir\n`;
    msg += `💳 *Total a pagar:* ${fmt(totalDonas)} + domicilio\n`;
    msg += `\n🛵 *Datos de entrega:*\n`;
    msg += `  📌 Dirección: ${pedido.direccion}\n`;
    msg += `  🏘️ Barrio: ${pedido.barrio}\n`;
    msg += `  👤 Recibe: ${pedido.nombreRecibe}\n`;
  } else {
    msg += `💳 *Total a pagar:* ${fmt(totalDonas)}\n`;
    msg += `📍 *Recoge en:* ${CONFIG.PUNTO_RECOGIDA}\n`;
  }
  msg += `💵 *Pago:* ${pedido.pago}\n\n`;
  msg += `¡Hola! Me gustaría hacer este pedido 😊🍩`;
  window.open(`https://wa.me/${CONFIG.WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
}

function detalleConfig(cfg) {
  let t = '';
  if (cfg.choco    > 0) t += `  🍫 Chocolate: ${cfg.choco} dona(s)\n`;
  if (cfg.vainilla > 0) t += `  🍦 Vainilla: ${cfg.vainilla} dona(s)\n`;
  t += `  🍯 Salsas: ${cfg.salsas.join(', ')}\n`;
  t += `  🌈 Toppings: ${cfg.toppings.join(', ')}\n\n`;
  return t;
}
