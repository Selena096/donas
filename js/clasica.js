/* ============================================
   CAPRICHART — LÍNEA CLÁSICA
   ============================================ */

// ── ESTADO ───────────────────────────────────
const estadoClasica = {
  c9: {
    total:      9,
    choco:      0,
    vainilla:   0,
    modo:       null,   // '2s1t' | '1s2t'
    maxSalsas:  0,
    maxToppings:0,
    salsas:     [],
    toppings:   [],
    pago:       null,
  },
  c15: {
    total:      15,
    choco:      0,
    vainilla:   0,
    maxSalsas:  3,
    maxToppings:3,
    salsas:     [],
    toppings:   [],
    pago:       null,
  },
};

// ── HELPERS ──────────────────────────────────

function $(id) { return document.getElementById(id); }

function setError(id, msg) {
  const el = $(id);
  if (el) el.textContent = msg;
}
function clearError(id) { setError(id, ''); }

function actualizarTotalSabores(caja) {
  const e     = estadoClasica[caja];
  const asig  = e.choco + e.vainilla;
  const diff  = e.total - asig;
  const el    = $(`${caja}-sabor-status`);
  if (!el) return;
  if (diff > 0) {
    el.textContent = `Faltan ${diff} dona(s) por asignar`;
    el.className = 'counter-status counter-status--warn';
  } else if (diff < 0) {
    el.textContent = `Demasiadas. Reduce ${Math.abs(diff)}`;
    el.className = 'counter-status counter-status--warn';
  } else {
    el.textContent = `✅ ${e.total} donas asignadas`;
    el.className = 'counter-status counter-status--ok';
  }
}

// ── CONTADORES SABORES ────────────────────────

function cambiarSabor(caja, tipo, delta) {
  const e    = estadoClasica[caja];
  const otro = tipo === 'choco' ? 'vainilla' : 'choco';
  let nuevo  = e[tipo] + delta;
  if (nuevo < 0) nuevo = 0;
  const max  = e.total - e[otro];
  if (nuevo > max) nuevo = max;
  e[tipo] = nuevo;
  $(`${caja}-${tipo}`).textContent = nuevo;
  actualizarTotalSabores(caja);
}

// ── MODO C9 ───────────────────────────────────

function elegirModo(modo) {
  const e = estadoClasica.c9;
  e.modo     = modo;
  e.salsas   = [];
  e.toppings = [];

  // Limpia chips seleccionados
  document.querySelectorAll('#c9-salsas-chips .chip').forEach(c => c.classList.remove('chip--selected'));
  document.querySelectorAll('#c9-toppings-chips .chip').forEach(c => c.classList.remove('chip--selected'));
  clearError('c9-salsas-err');
  clearError('c9-toppings-err');

  if (modo === '2s1t') {
    e.maxSalsas = 2; e.maxToppings = 1;
    $('c9-salsas-note').textContent   = 'Elige 2 salsas';
    $('c9-toppings-note').textContent = 'Elige 1 topping';
  } else {
    e.maxSalsas = 1; e.maxToppings = 2;
    $('c9-salsas-note').textContent   = 'Elige 1 salsa';
    $('c9-toppings-note').textContent = 'Elige 2 toppings';
  }

  $('c9-modo-2s1t').classList.toggle('modo-chip--selected', modo === '2s1t');
  $('c9-modo-1s2t').classList.toggle('modo-chip--selected', modo === '1s2t');
}

// ── CHIPS GENÉRICO ────────────────────────────

function toggleChip(caja, tipo, valor, el) {
  const e   = estadoClasica[caja];
  const max = tipo === 'salsas' ? e.maxSalsas : e.maxToppings;
  const arr = e[tipo];
  const errId = `${caja}-${tipo}-err`;

  // C9: requiere modo elegido
  if (caja === 'c9' && !e.modo) {
    setError(errId, '⚠️ Elige primero tu combinación arriba');
    setTimeout(() => clearError(errId), 2500);
    return;
  }

  const idx = arr.indexOf(valor);
  if (idx > -1) {
    arr.splice(idx, 1);
    el.classList.remove('chip--selected');
  } else {
    if (arr.length >= max) {
      setError(errId, `Solo puedes elegir ${max} ${tipo === 'salsas' ? 'salsa(s)' : 'topping(s)'}`);
      setTimeout(() => clearError(errId), 2500);
      return;
    }
    arr.push(valor);
    el.classList.add('chip--selected');
  }
  clearError(errId);
}

// ── PAGO ─────────────────────────────────────

function elegirPago(caja, valor, el) {
  estadoClasica[caja].pago = valor;
  el.closest('.pago-chips')
    .querySelectorAll('.pago-chip')
    .forEach(c => c.classList.remove('pago-chip--selected'));
  el.classList.add('pago-chip--selected');
}

// ── VALIDAR & ENVIAR ──────────────────────────

function enviarPedido(caja) {
  const e     = estadoClasica[caja];
  const errId = `${caja}-global-err`;
  clearError(errId);

  if (e.choco + e.vainilla !== e.total) {
    setError(errId, `⚠️ Asigna exactamente ${e.total} donas entre Chocolate y Vainilla`);
    return;
  }
  if (caja === 'c9' && !e.modo) {
    setError(errId, '⚠️ Elige una combinación de salsas/toppings');
    return;
  }
  if (e.salsas.length < e.maxSalsas) {
    setError(errId, `⚠️ Elige ${e.maxSalsas} salsa(s) — tienes ${e.salsas.length}`);
    return;
  }
  if (e.toppings.length < e.maxToppings) {
    setError(errId, `⚠️ Elige ${e.maxToppings} topping(s) — tienes ${e.toppings.length}`);
    return;
  }
  if (!e.pago) {
    setError(errId, '⚠️ Elige forma de pago');
    return;
  }

  const builder = caja === 'c9' ? mensajeCaja9 : mensajeCaja15;
  abrirWhatsApp(builder({
    choco:    e.choco,
    vainilla: e.vainilla,
    salsas:   e.salsas,
    toppings: e.toppings,
    pago:     e.pago,
  }));
}
