/* ============================================
   CAPRICHART — COLECCIÓN GOURMET
   ============================================ */

const SABORES_GOURMET = [
  { id: 'oreo',      emoji: '🍪', nombre: 'Oreo Supreme'      },
  { id: 'choco',     emoji: '🍫', nombre: 'Chocolate Intenso' },
  { id: 'cafe',      emoji: '☕', nombre: 'Café Latte'         },
  { id: 'fresa',     emoji: '🍓', nombre: 'Fresa Cream'       },
  { id: 'limon',     emoji: '🍋', nombre: 'Lemon Velvet'      },
  { id: 'naranja',   emoji: '🍊', nombre: 'Orange Delight'    },
  { id: 'vainilla',  emoji: '🌿', nombre: 'Vanilla Signature' },
];

// ── ESTADO ───────────────────────────────────
const estadoGourmet = {
  numSabores:     null,   // 1 | 2 | 3
  saboresElegidos:[],     // array de ids
  cantidades:     {},     // { id: numero }
  pago:           null,
};

// ── INIT ─────────────────────────────────────

function initGourmet() {
  if (!CONFIG.GOURMET_ENABLED) {
    // Ocultar toda la sección gourmet
    const secGourmet = document.getElementById('gourmet');
    const divider    = document.getElementById('divider-gourmet');
    const btnHeroG   = document.getElementById('btn-hero-gourmet');
    if (secGourmet) secGourmet.style.display = 'none';
    if (divider)    divider.style.display    = 'none';
    if (btnHeroG)   btnHeroG.style.display   = 'none';
    return;
  }
  renderChipsGourmet();
}

// ── RENDER CHIPS SABORES ──────────────────────

function renderChipsGourmet() {
  const container = document.getElementById('g-chips-sabores');
  if (!container) return;
  container.innerHTML = SABORES_GOURMET.map(s => `
    <button
      class="chip-gourmet"
      id="g-chip-${s.id}"
      onclick="toggleSaborGourmet('${s.id}', this)"
    >${s.emoji} ${s.nombre}</button>
  `).join('');
}

// ── ELEGIR NÚMERO DE SABORES ──────────────────

function elegirNumSabores(num) {
  estadoGourmet.numSabores     = num;
  estadoGourmet.saboresElegidos = [];
  estadoGourmet.cantidades     = {};

  // UI: resaltar chip elegido
  document.querySelectorAll('.num-chip').forEach(c => c.classList.remove('num-chip--selected'));
  const el = document.getElementById(`g-num-${num}`);
  if (el) el.classList.add('num-chip--selected');

  // Rehabilitar y deseleccionar todos los chips de sabor
  SABORES_GOURMET.forEach(s => {
    const chip = document.getElementById(`g-chip-${s.id}`);
    if (chip) {
      chip.classList.remove('chip-gourmet--selected', 'chip-gourmet--disabled');
      chip.removeAttribute('disabled');
    }
  });

  // Si solo 1 sabor: mostrar selector directamente
  const instruccion = document.getElementById('g-instruccion-sabores');
  if (instruccion) instruccion.textContent = `Elige ${num} sabor${num > 1 ? 'es' : ''}`;

  // Ocultar contadores hasta que se complete la selección
  document.getElementById('g-contadores-wrap').style.display = 'none';
  document.getElementById('g-resumen-wrap').style.display    = 'none';
  clearError('g-global-err');
}

// ── TOGGLE CHIP SABOR ─────────────────────────

function toggleSaborGourmet(id, el) {
  if (!estadoGourmet.numSabores) {
    setErrorG('⚠️ Primero elige cuántos sabores quieres (1, 2 o 3)');
    setTimeout(() => clearError('g-global-err'), 2500);
    return;
  }

  const idx = estadoGourmet.saboresElegidos.indexOf(id);

  if (idx > -1) {
    // Deseleccionar
    estadoGourmet.saboresElegidos.splice(idx, 1);
    delete estadoGourmet.cantidades[id];
    el.classList.remove('chip-gourmet--selected');
    // Rehabilitar chips bloqueados
    SABORES_GOURMET.forEach(s => {
      const chip = document.getElementById(`g-chip-${s.id}`);
      if (chip) chip.classList.remove('chip-gourmet--disabled');
    });
  } else {
    if (estadoGourmet.saboresElegidos.length >= estadoGourmet.numSabores) {
      setErrorG(`Solo puedes elegir ${estadoGourmet.numSabores} sabor(es)`);
      setTimeout(() => clearError('g-global-err'), 2500);
      return;
    }
    estadoGourmet.saboresElegidos.push(id);
    estadoGourmet.cantidades[id] = 0;
    el.classList.add('chip-gourmet--selected');
  }

  // Si ya llenó el cupo: bloquear los no seleccionados
  if (estadoGourmet.saboresElegidos.length >= estadoGourmet.numSabores) {
    SABORES_GOURMET.forEach(s => {
      if (!estadoGourmet.saboresElegidos.includes(s.id)) {
        const chip = document.getElementById(`g-chip-${s.id}`);
        if (chip) chip.classList.add('chip-gourmet--disabled');
      }
    });
  }

  clearError('g-global-err');
  actualizarContadoresGourmet();
}

// ── CONTADORES ────────────────────────────────

function actualizarContadoresGourmet() {
  const wrap = document.getElementById('g-contadores-wrap');
  const num  = estadoGourmet.numSabores;
  const eleg = estadoGourmet.saboresElegidos;

  // Mostrar contadores solo cuando se hayan elegido todos los sabores
  // EXCEPTO si num === 1: no necesita contador (las 9 van todas a ese sabor)
  if (eleg.length === num) {
    if (num === 1) {
      // Asignar las 9 automáticamente
      estadoGourmet.cantidades[eleg[0]] = 9;
      wrap.style.display = 'none';
      actualizarResumenGourmet();
      return;
    }
    wrap.style.display = 'block';
    renderContadoresGourmet();
  } else {
    wrap.style.display = 'none';
    document.getElementById('g-resumen-wrap').style.display = 'none';
  }
}

function renderContadoresGourmet() {
  const inner = document.getElementById('g-contadores-inner');
  if (!inner) return;
  inner.innerHTML = estadoGourmet.saboresElegidos.map(id => {
    const s = SABORES_GOURMET.find(x => x.id === id);
    return `
      <div class="gourmet-counter-row">
        <span class="gourmet-counter-row__name">${s.emoji} ${s.nombre}</span>
        <div class="counter counter--gourmet">
          <button class="counter__btn" onclick="cambiarCantGourmet('${id}',-1)">−</button>
          <span class="counter__val" id="g-cnt-${id}">${estadoGourmet.cantidades[id] || 0}</span>
          <button class="counter__btn" onclick="cambiarCantGourmet('${id}',1)">+</button>
        </div>
      </div>
    `;
  }).join('');
  actualizarResumenGourmet();
}

function cambiarCantGourmet(id, delta) {
  let v = (estadoGourmet.cantidades[id] || 0) + delta;
  if (v < 0) v = 0;
  estadoGourmet.cantidades[id] = v;
  const el = document.getElementById(`g-cnt-${id}`);
  if (el) el.textContent = v;
  actualizarResumenGourmet();
}

function actualizarResumenGourmet() {
  const total    = Object.values(estadoGourmet.cantidades).reduce((a, b) => a + b, 0);
  const precio   = Math.round(total * (CONFIG.PRECIO_GOURMET / 9));
  const elTotal  = document.getElementById('g-total-display');
  const elPrecio = document.getElementById('g-precio-display');
  const elWrap   = document.getElementById('g-resumen-wrap');

  if (elWrap)   elWrap.style.display = 'block';
  if (elTotal)  elTotal.textContent  = `${total} donas`;
  if (elPrecio) {
    if (total === 0) {
      elPrecio.textContent = 'Agrega donas para ver el precio';
      elPrecio.className   = 'gourmet-precio';
    } else {
      elPrecio.textContent = `Precio estimado: $${precio.toLocaleString('es-CO')} COP`;
      elPrecio.className   = 'gourmet-precio gourmet-precio--active';
    }
  }
}

// ── PAGO ─────────────────────────────────────

function elegirPagoG(valor, el) {
  estadoGourmet.pago = valor;
  el.closest('.pago-chips')
    .querySelectorAll('.pago-chip')
    .forEach(c => c.classList.remove('pago-chip--selected'));
  el.classList.add('pago-chip--selected');
}

// ── HELPERS ERROR ─────────────────────────────

function setErrorG(msg) {
  const el = document.getElementById('g-global-err');
  if (el) el.textContent = msg;
}

// ── VALIDAR & ENVIAR ──────────────────────────

function enviarGourmet() {
  clearError('g-global-err');

  if (!estadoGourmet.numSabores) {
    setErrorG('⚠️ Elige cuántos sabores quieres (1, 2 o 3)');
    return;
  }
  if (estadoGourmet.saboresElegidos.length < estadoGourmet.numSabores) {
    setErrorG(`⚠️ Elige ${estadoGourmet.numSabores} sabor(es)`);
    return;
  }

  const total = Object.values(estadoGourmet.cantidades).reduce((a, b) => a + b, 0);

  if (estadoGourmet.numSabores > 1 && total === 0) {
    setErrorG('⚠️ Asigna al menos 1 dona en los contadores');
    return;
  }
  const sinAsignar = estadoGourmet.saboresElegidos.filter(
    id => (estadoGourmet.cantidades[id] || 0) === 0
  );
  if (estadoGourmet.numSabores > 1 && sinAsignar.length > 0) {
    const nombres = sinAsignar.map(id => SABORES_GOURMET.find(s => s.id === id).nombre);
    setErrorG(`⚠️ Asigna donas a: ${nombres.join(', ')}`);
    return;
  }
  if (!estadoGourmet.pago) {
    setErrorG('⚠️ Elige forma de pago');
    return;
  }

  const saboresData = estadoGourmet.saboresElegidos.map(id => ({
    nombre:   SABORES_GOURMET.find(s => s.id === id).nombre,
    cantidad: estadoGourmet.cantidades[id],
  }));

  abrirWhatsApp(mensajeGourmet({ sabores: saboresData, pago: estadoGourmet.pago }));
}

// ── BOOT ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', initGourmet);
