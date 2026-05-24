/* ═══════════════════════════════════════
   FPBCIRCUITOS — SCRIPT.JS
   Simulador Interativo de Circuitos Lógicos
═══════════════════════════════════════ */

// ── ESTADO GLOBAL ────────────────────────
const state = {
  nodes: [],        // { id, type, x, y, label, value, inputs:[], outputs:[] }
  wires: [],        // { from: {nodeId, port:'out'}, to: {nodeId, port:'in0'|'in1'} }
  selected: null,   // nodeId selecionado
  connecting: null, // { nodeId, port } aguardando conexão
  inputValues: {},  // { nodeId: 0|1 }
  nextId: 1,
  dragging: null,   // { nodeId, offX, offY }
};

// ── DIMENSÕES DE NÓS ─────────────────────
const NODE = {
  W: 90, H: 50,
  port: 10,         // raio do terminal
};

// ── CANVAS SETUP ─────────────────────────
let canvas, ctx;

function initCanvas() {
  canvas = document.getElementById('circuit-canvas');
  ctx = canvas.getContext('2d');
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  canvas.addEventListener('mousedown', onCanvasMousedown);
  canvas.addEventListener('mousemove', onCanvasMousemove);
  canvas.addEventListener('mouseup',   onCanvasMouseup);
  canvas.addEventListener('dblclick',  onCanvasDblclick);
  window.addEventListener('keydown',   onKeydown);
}

function resizeCanvas() {
  canvas.width  = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  render();
}

// ── NAVEGAÇÃO ENTRE TELAS ─────────────────
function goTo(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
  if (screenId === 'screen-builder') {
    setTimeout(() => { resizeCanvas(); render(); }, 50);
  }
}

// ── DRAG FROM SIDEBAR ─────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.comp-item').forEach(item => {
    item.addEventListener('dragstart', e => {
      e.dataTransfer.setData('type', item.dataset.type);
    });
  });

  const canvasArea = document.querySelector('.canvas-area');
  canvasArea.addEventListener('dragover', e => e.preventDefault());
  canvasArea.addEventListener('drop', e => {
    e.preventDefault();
    const type = e.dataTransfer.getData('type');
    if (!type) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - NODE.W / 2;
    const y = e.clientY - rect.top  - NODE.H / 2;
    addNode(type, Math.round(x / 16) * 16, Math.round(y / 16) * 16);
  });

  initCanvas();
});

// ── ADICIONAR NÓ ─────────────────────────
function addNode(type, x, y) {
  const id = state.nextId++;
  const node = { id, type, x, y, label: labelFor(type), inputs: [], outputs: [] };
  if (type.startsWith('INPUT')) {
    state.inputValues[id] = 0;
  }
  state.nodes.push(node);
  updateHint();
  updateStatus();
  updateInputControls();
  render();
}

function labelFor(type) {
  const map = {
    INPUT_A: 'A', INPUT_B: 'B', INPUT_C: 'C',
    AND:'AND', OR:'OR', NOT:'NOT', NAND:'NAND', NOR:'NOR', XOR:'XOR', XNOR:'XNOR',
    OUTPUT: 'OUT',
  };
  return map[type] || type;
}

function isInput(type) { return type.startsWith('INPUT'); }
function isOutput(type) { return type === 'OUTPUT'; }
function isGate(type) { return !isInput(type) && !isOutput(type); }

// ── TERMINAIS: posições de entrada/saída dos nós ──
function getPortPos(node, port) {
  // port: 'out' | 'in0' | 'in1'
  const { x, y } = node;
  const cx = x + NODE.W / 2;
  const cy = y + NODE.H / 2;

  if (port === 'out') {
    return { px: x + NODE.W, py: cy };
  }
  if (port === 'in0') {
    const twoIn = numInputs(node.type) === 2;
    return { px: x, py: twoIn ? cy - 12 : cy };
  }
  if (port === 'in1') {
    return { px: x, py: cy + 12 };
  }
}

function numInputs(type) {
  if (isInput(type)) return 0;
  if (type === 'NOT') return 1;
  if (isOutput(type)) return 1;
  return 2;
}

function numOutputs(type) {
  if (isOutput(type)) return 0;
  return 1;
}

// ── RENDER ────────────────────────────────
function render() {
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // wires
  state.wires.forEach(w => drawWire(w));

  // wire in progress
  if (state.connecting) {
    const n = getNodeById(state.connecting.nodeId);
    if (n) {
      const pos = getPortPos(n, state.connecting.port);
      ctx.beginPath();
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = '#00d4ff88';
      ctx.lineWidth = 2;
      ctx.moveTo(pos.px, pos.py);
      ctx.lineTo(state.mouseX || pos.px, state.mouseY || pos.py);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  // nodes
  state.nodes.forEach(n => drawNode(n));
}

function drawWire(w) {
  const fromNode = getNodeById(w.from.nodeId);
  const toNode   = getNodeById(w.to.nodeId);
  if (!fromNode || !toNode) return;

  const fp = getPortPos(fromNode, w.from.port);
  const tp = getPortPos(toNode,   w.to.port);

  // valor do fio = valor de saída do nó de origem
  const val = w.from.port === 'out' ? fromNode._outVal : undefined;
  const color = val === 1 ? '#00ff88' : val === 0 ? '#5a6380' : '#2a3045';

  ctx.beginPath();
  const mx = (fp.px + tp.px) / 2;
  ctx.moveTo(fp.px, fp.py);
  ctx.bezierCurveTo(mx, fp.py, mx, tp.py, tp.px, tp.py);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.shadowColor = val === 1 ? '#00ff88' : 'transparent';
  ctx.shadowBlur  = val === 1 ? 6 : 0;
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function drawNode(n) {
  const { x, y, type, label } = n;
  const isSelected = state.selected === n.id;
  const isConn = state.connecting && state.connecting.nodeId === n.id;

  // corpo
  const borderColor = isSelected
    ? '#00d4ff'
    : isConn
    ? '#ffd600'
    : isInput(type) ? '#00d4ff44' : isOutput(type) ? '#00ff8844' : '#2a3045';

  const fillColor = isInput(type)
    ? '#0d1520'
    : isOutput(type)
    ? '#0d201a'
    : '#111520';

  ctx.fillStyle = fillColor;
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = isSelected ? 2 : 1;
  roundRect(ctx, x, y, NODE.W, NODE.H, 6);
  ctx.fill();
  ctx.stroke();

  // label
  ctx.fillStyle = isInput(type) ? '#00d4ff' : isOutput(type) ? '#00ff88' : '#c8d0e0';
  ctx.font = `bold 13px 'Exo 2', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + NODE.W / 2, y + NODE.H / 2 - 2);

  // valor simulado
  if (n._outVal !== undefined && !isOutput(type)) {
    ctx.fillStyle = n._outVal === 1 ? '#00ff88' : '#5a6380';
    ctx.font = `bold 11px 'Share Tech Mono', monospace`;
    ctx.fillText(n._outVal, x + NODE.W / 2, y + NODE.H / 2 + 14);
  }

  // LED de saída
  if (isOutput(type)) {
    const val = n._inVals ? n._inVals[0] : undefined;
    ctx.beginPath();
    ctx.arc(x + NODE.W / 2, y + NODE.H / 2 + 12, 6, 0, Math.PI * 2);
    ctx.fillStyle = val === 1 ? '#00ff88' : '#1a1a1a';
    ctx.fill();
    ctx.strokeStyle = val === 1 ? '#00ff88' : '#2a3045';
    ctx.lineWidth = 1;
    ctx.stroke();
    if (val === 1) {
      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  // INPUT switch visual
  if (isInput(type)) {
    const val = state.inputValues[n.id] || 0;
    ctx.beginPath();
    ctx.arc(x + NODE.W / 2, y + NODE.H / 2 + 12, 6, 0, Math.PI * 2);
    ctx.fillStyle = val === 1 ? '#00ff88' : '#1a1a1a';
    ctx.fill();
    ctx.strokeStyle = val === 1 ? '#00ff88' : '#2a3045';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Terminais
  drawPort(n, 'out');
  if (numInputs(type) >= 1) drawPort(n, 'in0');
  if (numInputs(type) >= 2) drawPort(n, 'in1');
}

function drawPort(node, port) {
  const pos = getPortPos(node, port);
  const isConnRoot = state.connecting && state.connecting.nodeId === node.id && state.connecting.port === port;
  ctx.beginPath();
  ctx.arc(pos.px, pos.py, 5, 0, Math.PI * 2);
  ctx.fillStyle = isConnRoot ? '#ffd600' : '#1a1f2e';
  ctx.fill();
  ctx.strokeStyle = isConnRoot ? '#ffd600' : '#00d4ff66';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ── HIT TESTS ────────────────────────────
function getNodeById(id) { return state.nodes.find(n => n.id === id); }

function nodeAtPoint(mx, my) {
  // reversed so topmost is picked first
  return [...state.nodes].reverse().find(n =>
    mx >= n.x && mx <= n.x + NODE.W &&
    my >= n.y && my <= n.y + NODE.H
  );
}

function portAtPoint(mx, my) {
  // returns { nodeId, port } or null
  const SNAP = 12;
  for (const n of state.nodes) {
    const ports = ['out'];
    if (numInputs(n.type) >= 1) ports.push('in0');
    if (numInputs(n.type) >= 2) ports.push('in1');
    for (const port of ports) {
      const pos = getPortPos(n, port);
      const dx = mx - pos.px, dy = my - pos.py;
      if (dx*dx + dy*dy <= SNAP*SNAP) return { nodeId: n.id, port };
    }
  }
  return null;
}

// ── MOUSE EVENTS ─────────────────────────
function onCanvasMousedown(e) {
  const { mx, my } = mousePos(e);

  // check terminal hit first
  const portHit = portAtPoint(mx, my);
  if (portHit) {
    if (!state.connecting) {
      // start connection
      state.connecting = portHit;
    } else {
      // complete connection
      finishConnection(portHit);
    }
    render();
    return;
  }

  // cancel connecting if clicked elsewhere
  if (state.connecting) {
    state.connecting = null;
    render();
  }

  const node = nodeAtPoint(mx, my);
  if (node) {
    state.selected = node.id;
    state.dragging = { nodeId: node.id, offX: mx - node.x, offY: my - node.y };
  } else {
    state.selected = null;
  }
  render();
}

function onCanvasMousemove(e) {
  const { mx, my } = mousePos(e);
  state.mouseX = mx;
  state.mouseY = my;

  if (state.dragging) {
    const n = getNodeById(state.dragging.nodeId);
    if (n) {
      n.x = Math.round((mx - state.dragging.offX) / 8) * 8;
      n.y = Math.round((my - state.dragging.offY) / 8) * 8;
      render();
    }
  } else if (state.connecting) {
    render();
  }

  // cursor
  const onPort = portAtPoint(mx, my);
  const onNode = nodeAtPoint(mx, my);
  canvas.style.cursor = onPort ? 'crosshair' : onNode ? 'grab' : 'default';
}

function onCanvasMouseup(e) {
  if (state.dragging) {
    state.dragging = null;
    canvas.style.cursor = 'default';
  }
}

function onCanvasDblclick(e) {
  const { mx, my } = mousePos(e);
  const node = nodeAtPoint(mx, my);
  if (node && isInput(node.type)) {
    // toggle input value
    state.inputValues[node.id] = state.inputValues[node.id] === 1 ? 0 : 1;
    updateInputControls();
    runSimulation();
  }
}

function onKeydown(e) {
  if (e.key === 'Delete' || e.key === 'Backspace') {
    if (state.selected && document.activeElement.tagName === 'BODY') {
      removeNode(state.selected);
    }
  }
  if (e.key === 'Escape') {
    state.connecting = null;
    state.selected = null;
    render();
  }
}

function mousePos(e) {
  const rect = canvas.getBoundingClientRect();
  return { mx: e.clientX - rect.left, my: e.clientY - rect.top };
}

// ── CONEXÕES ─────────────────────────────
function finishConnection(target) {
  const src = state.connecting;
  state.connecting = null;

  if (src.nodeId === target.nodeId) return; // self-loop
  // must connect out→in or in→out
  let from, to;
  if (src.port === 'out' && target.port !== 'out') {
    from = src; to = target;
  } else if (src.port !== 'out' && target.port === 'out') {
    from = target; to = src;
  } else {
    setStatus('Conecte um terminal de saída (●) a um de entrada.');
    return;
  }

  // check duplicate
  const dup = state.wires.find(w =>
    w.from.nodeId === from.nodeId && w.from.port === from.port &&
    w.to.nodeId   === to.nodeId   && w.to.port   === to.port
  );
  if (dup) { setStatus('Conexão já existe.'); return; }

  // check max inputs
  const toNode = getNodeById(to.nodeId);
  const existingInputsToPort = state.wires.filter(w =>
    w.to.nodeId === to.nodeId && w.to.port === to.port
  );
  if (existingInputsToPort.length >= 1) {
    setStatus('Esse terminal já está conectado.');
    return;
  }

  state.wires.push({ from, to });
  setStatus('Conexão criada com sucesso.');
  render();
}

// ── REMOVER NÓ ───────────────────────────
function removeNode(id) {
  state.nodes   = state.nodes.filter(n => n.id !== id);
  state.wires   = state.wires.filter(w => w.from.nodeId !== id && w.to.nodeId !== id);
  delete state.inputValues[id];
  state.selected = null;
  updateHint();
  updateStatus();
  updateInputControls();
  render();
}

// ── LIMPAR ────────────────────────────────
function clearCanvas() {
  state.nodes = [];
  state.wires = [];
  state.selected = null;
  state.connecting = null;
  state.inputValues = {};
  state.nextId = 1;
  updateHint();
  updateStatus();
  updateInputControls();
  resetResult();
  clearTruthTable();
  render();
}

// ── EXEMPLO ───────────────────────────────
function loadExample() {
  clearCanvas();

  // Circuito exemplo: (A AND B) OR (NOT C)  → saída
  const a  = addNodeReturn('INPUT_A', 60,  80);
  const b  = addNodeReturn('INPUT_B', 60, 180);
  const c  = addNodeReturn('INPUT_C', 60, 280);
  const and = addNodeReturn('AND',   220, 130);
  const not = addNodeReturn('NOT',   220, 280);
  const or  = addNodeReturn('OR',    380, 200);
  const out = addNodeReturn('OUTPUT',540, 200);

  state.inputValues[a]  = 1;
  state.inputValues[b]  = 1;
  state.inputValues[c]  = 0;

  // Wires
  state.wires.push({ from: { nodeId: a,   port: 'out' }, to: { nodeId: and, port: 'in0' } });
  state.wires.push({ from: { nodeId: b,   port: 'out' }, to: { nodeId: and, port: 'in1' } });
  state.wires.push({ from: { nodeId: c,   port: 'out' }, to: { nodeId: not, port: 'in0' } });
  state.wires.push({ from: { nodeId: and, port: 'out' }, to: { nodeId: or,  port: 'in0' } });
  state.wires.push({ from: { nodeId: not, port: 'out' }, to: { nodeId: or,  port: 'in1' } });
  state.wires.push({ from: { nodeId: or,  port: 'out' }, to: { nodeId: out, port: 'in0' } });

  updateHint();
  updateStatus();
  updateInputControls();
  runSimulation();
}

function addNodeReturn(type, x, y) {
  const id = state.nextId++;
  const node = { id, type, x, y, label: labelFor(type) };
  if (isInput(type)) state.inputValues[id] = 0;
  state.nodes.push(node);
  return id;
}

// ── SIMULAÇÃO ─────────────────────────────
function runSimulation() {
  if (state.nodes.length === 0) {
    setStatus('Nenhum componente no canvas.');
    return;
  }

  // topological evaluation
  evaluateAll();
  render();

  // mostrar resultado no LED
  const outputNode = state.nodes.find(n => isOutput(n.type));
  if (outputNode && outputNode._inVals !== undefined) {
    const val = outputNode._inVals[0];
    showResult(val);
    setStatus('Simulação executada com sucesso.');
    generateTruthTable();
  } else {
    setStatus('Conecte uma saída (LED) ao circuito para ver o resultado.');
    resetResult();
  }
}

function evaluateAll() {
  // reset
  state.nodes.forEach(n => { n._outVal = undefined; n._inVals = undefined; });

  // set input values
  state.nodes.filter(n => isInput(n.type)).forEach(n => {
    n._outVal = state.inputValues[n.id] || 0;
  });

  // iterative evaluation (up to N passes for chains)
  for (let pass = 0; pass < state.nodes.length + 2; pass++) {
    let changed = false;
    state.nodes.forEach(n => {
      if (isInput(n.type)) return;

      // gather inputs
      const ni = numInputs(n.type);
      const inVals = [];
      for (let i = 0; i < ni; i++) {
        const port = `in${i}`;
        const wire = state.wires.find(w => w.to.nodeId === n.id && w.to.port === port);
        if (wire) {
          const src = getNodeById(wire.from.nodeId);
          inVals.push(src?._outVal);
        } else {
          inVals.push(undefined);
        }
      }

      n._inVals = inVals;

      if (inVals.some(v => v === undefined)) return; // not ready

      const newOut = compute(n.type, inVals);
      if (n._outVal !== newOut) { n._outVal = newOut; changed = true; }
    });
    if (!changed) break;
  }
}

function compute(type, inVals) {
  const a = inVals[0], b = inVals[1];
  switch (type) {
    case 'AND':    return (a & b) & 1;
    case 'OR':     return (a | b) & 1;
    case 'NOT':    return a === 1 ? 0 : 1;
    case 'NAND':   return ((a & b) ^ 1) & 1;
    case 'NOR':    return ((a | b) ^ 1) & 1;
    case 'XOR':    return (a ^ b) & 1;
    case 'XNOR':   return ((a ^ b) ^ 1) & 1;
    case 'OUTPUT': return a;
    default: return 0;
  }
}

// ── RESULTADO ─────────────────────────────
function showResult(val) {
  const led    = document.getElementById('result-led');
  const label  = document.getElementById('result-label');
  const status = document.getElementById('result-status');

  if (val === 1) {
    led.className    = 'result-led on';
    label.className  = 'result-label on';
    label.textContent = '1';
    status.textContent = 'Saída: LIGADO (HIGH)';
  } else {
    led.className    = 'result-led off';
    label.className  = 'result-label';
    label.textContent = '0';
    status.textContent = 'Saída: DESLIGADO (LOW)';
  }
}

function resetResult() {
  document.getElementById('result-led').className    = 'result-led off';
  document.getElementById('result-label').className  = 'result-label';
  document.getElementById('result-label').textContent = '—';
  document.getElementById('result-status').textContent = 'Aguardando simulação...';
}

// ── TABELA VERDADE ────────────────────────
function generateTruthTable() {
  const inputs = state.nodes.filter(n => isInput(n.type));
  const output = state.nodes.find(n => isOutput(n.type));
  const area   = document.getElementById('truth-table-area');

  if (inputs.length === 0 || !output) {
    area.innerHTML = '<p class="hint-text">Adicione entradas e uma saída para ver a tabela.</p>';
    return;
  }

  const n = inputs.length;
  if (n > 4) {
    area.innerHTML = '<p class="hint-text">Tabela verdade disponível para até 4 entradas.</p>';
    return;
  }

  const rows = Math.pow(2, n);

  // save current values
  const savedVals = {};
  inputs.forEach(inp => savedVals[inp.id] = state.inputValues[inp.id] || 0);
  const currentBits = inputs.map(inp => savedVals[inp.id]);

  let html = '<table class="truth-table"><thead><tr>';
  inputs.forEach(inp => html += `<th>${inp.label}</th>`);
  html += '<th>OUT</th></tr></thead><tbody>';

  for (let r = 0; r < rows; r++) {
    // set bits
    const bits = [];
    for (let i = 0; i < n; i++) {
      bits[i] = (r >> (n - 1 - i)) & 1;
      state.inputValues[inputs[i].id] = bits[i];
    }
    evaluateAll();
    const outNode = state.nodes.find(nd => isOutput(nd.type));
    const outVal  = outNode?._inVals?.[0] ?? '?';

    const isCurrentRow = bits.every((b, i) => b === currentBits[i]);
    html += `<tr${isCurrentRow ? ' class="highlight"' : ''}>`;
    bits.forEach(b => html += `<td>${b}</td>`);
    html += `<td class="out-${outVal}">${outVal}</td></tr>`;
  }
  html += '</tbody></table>';
  area.innerHTML = html;

  // restore
  inputs.forEach(inp => {
    state.inputValues[inp.id] = savedVals[inp.id];
  });
  evaluateAll();
  render();
}

function clearTruthTable() {
  document.getElementById('truth-table-area').innerHTML =
    '<p class="hint-text">Simule para ver a tabela verdade.</p>';
}

// ── CONTROLES DE ENTRADA ─────────────────
function updateInputControls() {
  const container = document.getElementById('input-controls');
  const inputs = state.nodes.filter(n => isInput(n.type));

  if (inputs.length === 0) {
    container.innerHTML = '<p class="hint-text">Adicione entradas ao canvas para controlar aqui.</p>';
    return;
  }

  container.innerHTML = inputs.map(inp => {
    const val = state.inputValues[inp.id] || 0;
    return `
      <div class="input-row">
        <span class="input-name">${inp.label}</span>
        <label class="toggle-switch">
          <input type="checkbox" ${val ? 'checked' : ''} onchange="toggleInput(${inp.id}, this.checked)">
          <span class="toggle-track"></span>
        </label>
        <span class="toggle-value" id="tv-${inp.id}">${val}</span>
      </div>`;
  }).join('');
}

function toggleInput(nodeId, checked) {
  state.inputValues[nodeId] = checked ? 1 : 0;
  const tv = document.getElementById(`tv-${nodeId}`);
  if (tv) tv.textContent = checked ? '1' : '0';
  runSimulation();
}

// ── UI HELPERS ────────────────────────────
function updateHint() {
  const hint = document.getElementById('canvas-hint');
  hint.classList.toggle('hidden', state.nodes.length > 0);
}

function updateStatus() {
  document.getElementById('component-count').textContent =
    `${state.nodes.length} componente${state.nodes.length !== 1 ? 's' : ''}`;
}

function setStatus(msg) {
  document.getElementById('status-msg').textContent = msg;
}
