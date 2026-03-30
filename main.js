import { prepareWithSegments, layoutNextLine } from '@chenglou/pretext';

const canvas = document.getElementById('scene');
const ctx = canvas.getContext('2d');

const copy = {
  thesis: `Pretext is a layout engine for moving interfaces. It computes multiline text before paint, so copy can flow around live geometry without DOM reads. In AI canvases, editors, dashboards, and immersive brand systems, that means text stays intentional while the scene keeps changing.`,
  builders: `Each frame can supply a different width for the next line. The paragraph is prepared once, then re-routed deterministically with layoutNextLine(). That turns text from a passive artifact of layout into an active part of the rendering system.`,
  outcome: `The visual is the proof: when the object shifts, the paragraph does not fall apart. It recomputes. That is useful for creative tools, generative UI, spatial publishing, and product surfaces where motion and readability must coexist.`
};

const prepared = prepareWithSegments(`${copy.thesis} ${copy.builders} ${copy.outcome}`, '28px "Iowan Old Style", Georgia, serif');

const state = {
  width: window.innerWidth,
  height: window.innerHeight,
  dpr: 1,
  pointer: { x: 0, y: 0, active: false },
  time: 0,
};

const metricEl = document.getElementById('metrics');

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function resize() {
  state.width = window.innerWidth;
  state.height = window.innerHeight;
  state.dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
  canvas.width = Math.floor(state.width * state.dpr);
  canvas.height = Math.floor(state.height * state.dpr);
  canvas.style.width = `${state.width}px`;
  canvas.style.height = `${state.height}px`;
  ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
  if (!state.pointer.x) {
    state.pointer.x = state.width * 0.58;
    state.pointer.y = state.height * 0.5;
  }
}

function getPortal(time) {
  const idleX = state.width * 0.58 + Math.cos(time * 0.00034) * Math.min(90, state.width * 0.05);
  const idleY = state.height * 0.52 + Math.sin(time * 0.00052) * Math.min(70, state.height * 0.04);
  const x = state.pointer.active ? state.pointer.x : idleX;
  const y = state.pointer.active ? state.pointer.y : idleY;
  const r = Math.min(state.width, state.height) * 0.16;
  return { x, y, r };
}

function drawBackground(time, portal) {
  ctx.clearRect(0, 0, state.width, state.height);

  const bg = ctx.createLinearGradient(0, 0, state.width, state.height);
  bg.addColorStop(0, '#040712');
  bg.addColorStop(0.45, '#091020');
  bg.addColorStop(1, '#04050d');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, state.width, state.height);

  const vignette = ctx.createRadialGradient(state.width * 0.52, state.height * 0.48, state.width * 0.06, state.width * 0.52, state.height * 0.48, state.width * 0.7);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.38)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, state.width, state.height);

  ctx.strokeStyle = 'rgba(120, 155, 255, 0.045)';
  ctx.lineWidth = 1;
  for (let x = -40; x < state.width + 40; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x + (time * 0.015) % 64, 0);
    ctx.lineTo(x + (time * 0.015) % 64, state.height);
    ctx.stroke();
  }
  for (let y = -40; y < state.height + 40; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y + (time * 0.008) % 64);
    ctx.lineTo(state.width, y + (time * 0.008) % 64);
    ctx.stroke();
  }

  for (let i = 0; i < 220; i += 1) {
    const x = (i * 53.17 + time * 0.025 + Math.sin(i * 2.7 + time * 0.0002) * 20) % (state.width + 120) - 60;
    const y = (i * 91.31 + Math.cos(i * 4.2 + time * 0.00023) * 24) % (state.height + 120) - 60;
    const d = Math.hypot(x - portal.x, y - portal.y);
    const alpha = 0.02 + Math.max(0, 1 - d / (portal.r * 4)) * 0.2;
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    const size = 1 + alpha * 6;
    ctx.fillRect(x, y, size, size);
  }
}

function drawPortal(time, portal) {
  const halo = ctx.createRadialGradient(portal.x, portal.y, portal.r * 0.2, portal.x, portal.y, portal.r * 2.4);
  halo.addColorStop(0, 'rgba(255,255,255,0.18)');
  halo.addColorStop(0.2, 'rgba(114,219,255,0.24)');
  halo.addColorStop(0.45, 'rgba(187,126,255,0.18)');
  halo.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(portal.x, portal.y, portal.r * 2.4, 0, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < 3; i += 1) {
    const ringR = portal.r * (1.02 + i * 0.17 + Math.sin(time * 0.0012 + i) * 0.015);
    ctx.strokeStyle = `rgba(${i === 1 ? '208,130,255' : '117,226,255'},${0.22 - i * 0.05})`;
    ctx.lineWidth = 2 - i * 0.3;
    ctx.beginPath();
    ctx.ellipse(portal.x, portal.y, ringR * (1.08 + i * 0.06), ringR * (0.86 - i * 0.03), Math.sin(time * 0.0004 + i) * 0.45, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.save();
  ctx.translate(portal.x, portal.y);
  ctx.rotate(Math.sin(time * 0.0005) * 0.16);
  for (let i = 0; i < 7; i += 1) {
    const a = (Math.PI * 2 * i) / 7 + time * 0.0006;
    const x = Math.cos(a) * portal.r * 1.18;
    const y = Math.sin(a) * portal.r * 0.9;
    ctx.fillStyle = i % 2 ? 'rgba(120,225,255,0.9)' : 'rgba(222,132,255,0.85)';
    ctx.beginPath();
    ctx.moveTo(x + 16, y);
    ctx.lineTo(x - 8, y - 6);
    ctx.lineTo(x - 18, y);
    ctx.lineTo(x - 8, y + 6);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  const core = ctx.createRadialGradient(portal.x, portal.y, 0, portal.x, portal.y, portal.r * 0.92);
  core.addColorStop(0, 'rgba(5,8,18,0)');
  core.addColorStop(0.55, 'rgba(7,10,20,0.2)');
  core.addColorStop(1, 'rgba(5,8,18,0.98)');
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(portal.x, portal.y, portal.r * 0.92, 0, Math.PI * 2);
  ctx.fill();
}

function getAvailableSegments(y, portal, left, right) {
  const segments = [];
  const vertical = Math.abs(y - portal.y);
  if (vertical >= portal.r * 1.08) {
    segments.push({ x: left, width: right - left });
    return segments;
  }

  const inset = Math.sqrt((portal.r * 1.08) ** 2 - vertical ** 2);
  const holeLeft = portal.x - inset - 26;
  const holeRight = portal.x + inset + 26;

  if (holeLeft - left > 90) segments.push({ x: left, width: holeLeft - left });
  if (right - holeRight > 90) segments.push({ x: holeRight, width: right - holeRight });
  return segments;
}

function chooseSegment(segments, lineIndex) {
  if (!segments.length) return null;
  if (segments.length === 1) return segments[0];
  const [a, b] = segments;
  if (Math.abs(a.width - b.width) < 60) return lineIndex % 2 === 0 ? a : b;
  return a.width > b.width ? a : b;
}

function drawParagraph(time, portal) {
  const top = Math.max(430, state.height * 0.43);
  const left = Math.max(92, state.width * 0.08);
  const right = state.width - Math.max(72, state.width * 0.08);
  const bottom = state.height - 100;

  ctx.font = '28px "Iowan Old Style", Georgia, serif';
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  ctx.shadowColor = 'rgba(104, 201, 255, 0.14)';
  ctx.shadowBlur = 12;

  let cursor = { segmentIndex: 0, graphemeIndex: 0 };
  let y = top;
  let lineIndex = 0;
  let coverage = 0;

  while (y < bottom) {
    const available = getAvailableSegments(y, portal, left, right);
    const slot = chooseSegment(available, lineIndex);
    if (!slot) {
      y += 36;
      continue;
    }

    const line = layoutNextLine(prepared, cursor, slot.width);
    if (!line) break;

    const dist = Math.hypot(slot.x + line.width * 0.5 - portal.x, y - portal.y);
    const energy = Math.max(0, 1 - dist / (portal.r * 2.2));
    const hue = 204 + Math.sin(time * 0.001 + lineIndex * 0.18) * 8 + energy * 22;
    const light = clamp(92 - energy * 7, 80, 94);
    const drift = Math.sin(time * 0.002 + lineIndex * 0.4) * energy * 2.5;

    ctx.fillStyle = `hsl(${hue} 78% ${light}%)`;
    ctx.fillText(line.text, slot.x + drift, y);

    const wash = ctx.createLinearGradient(slot.x, y - 18, slot.x + line.width, y + 4);
    wash.addColorStop(0, `rgba(120,224,255,${0.04 + energy * 0.08})`);
    wash.addColorStop(0.5, `rgba(255,255,255,${0.02 + energy * 0.03})`);
    wash.addColorStop(1, `rgba(211,132,255,${0.02 + energy * 0.05})`);
    ctx.fillStyle = wash;
    ctx.fillRect(slot.x, y - 28, line.width, 34);

    cursor = line.end;
    coverage += line.width;
    lineIndex += 1;
    y += 36;
  }

  metricEl.textContent = `${lineIndex} lines reflowed · ${Math.round(coverage)}px routed · pointer-reactive geometry`;
}

function frame(time) {
  state.time = time;
  const portal = getPortal(time);
  drawBackground(time, portal);
  drawParagraph(time, portal);
  drawPortal(time, portal);
  requestAnimationFrame(frame);
}

window.addEventListener('resize', resize);
window.addEventListener('pointermove', event => {
  state.pointer.x = event.clientX;
  state.pointer.y = event.clientY;
  state.pointer.active = true;
});
window.addEventListener('pointerleave', () => {
  state.pointer.active = false;
});
window.addEventListener('touchend', () => {
  state.pointer.active = false;
});

resize();
requestAnimationFrame(frame);
