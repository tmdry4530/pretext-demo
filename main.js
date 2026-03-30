import { prepareWithSegments, layoutNextLine } from '@chenglou/pretext';

const canvas = document.getElementById('scene');
const ctx = canvas.getContext('2d');

const copy = {
  flagship: `A craft of pure intention tears across the page. 서울 glows in its wake, القاهرة bends like a ribbon of signal, 東京 fractures into rails of light, and the paragraph refuses to collapse. Instead it computes itself again. Pretext turns language into a navigable medium: line by line, width by width, geometry in motion. This is not text reacting after the fact. This is text composed inside the event itself, as if the page had propulsion and the sentence understood turbulence.`,
  velocity: `The scene behaves like a title sequence for a product that does not exist yet but already feels inevitable. Every pass of the vehicle splits the editorial column, compresses one side, releases the other, and leaves behind a luminous corridor. English becomes plasma, 한국어 becomes precision, العربية becomes curvature, 日本語 becomes signal. The effect is not that text is animated; it is that layout itself becomes cinematic matter.`,
  future: `A programmable paragraph engine changes what interfaces can feel like. Imagine dashboards where commentary avoids live charts, AI canvases that preflow copy around generative objects before paint, identity systems where the headline moves as if it shares the same physics as the brand world. Pretext supplies the missing primitive: deterministic multiline layout that can route through changing space without waiting for the DOM to tell you what happened.`
};

const presets = [
  { id: 'interceptor', label: 'Interceptor', key: 'flagship' },
  { id: 'slipstream', label: 'Slipstream', key: 'velocity' },
  { id: 'cathedral', label: 'Neon Cathedral', key: 'future' },
];

const descriptions = {
  interceptor: '초고속 에너지 크래프트가 문단을 가르며 지나갑니다.',
  slipstream: '복수의 충격파와 트레일이 라인 분할을 연쇄적으로 유도합니다.',
  cathedral: '거대한 빛의 구조물 사이로 텍스트가 건축적으로 재배치됩니다.',
};

const fontFamily = 'Georgia, "Iowan Old Style", "Times New Roman", serif';
const fontSize = 24;
const lineHeight = 32;
const paragraphFont = `${fontSize}px ${fontFamily}`;
const preparedByKey = Object.fromEntries(
  Object.entries(copy).map(([key, text]) => [key, prepareWithSegments(text, paragraphFont)]),
);

const state = {
  presetIndex: 0,
  autoplay: true,
  pointerActive: false,
  pointer: { x: 0, y: 0 },
  width: window.innerWidth,
  height: window.innerHeight,
  dpr: 1,
  time: 0,
  metrics: { lines: 0, coverage: 0, mode: presets[0].label },
};

const controls = {
  title: document.getElementById('preset-title'),
  desc: document.getElementById('preset-desc'),
  chips: Array.from(document.querySelectorAll('[data-preset]')),
  auto: document.getElementById('toggle-autoplay'),
  metrics: document.getElementById('metrics'),
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
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
    state.pointer.x = state.width * 0.68;
    state.pointer.y = state.height * 0.45;
  }
}

function setPreset(index) {
  state.presetIndex = (index + presets.length) % presets.length;
  const preset = presets[state.presetIndex];
  state.metrics.mode = preset.label;
  controls.title.textContent = preset.label;
  controls.desc.textContent = descriptions[preset.id];
  controls.chips.forEach((chip, chipIndex) => {
    chip.dataset.active = chipIndex === state.presetIndex ? 'true' : 'false';
  });
}

function getDriver(time) {
  const x = state.pointerActive
    ? state.pointer.x
    : state.width * 0.5 + Math.cos(time * 0.00037) * Math.min(260, state.width * 0.2);
  const y = state.pointerActive
    ? state.pointer.y
    : state.height * 0.5 + Math.sin(time * 0.00063) * Math.min(180, state.height * 0.2);
  return { x, y };
}

function buildCraftSegments(headX, headY, angle, count, spacing, taper) {
  const segments = [];
  for (let i = 0; i < count; i += 1) {
    const t = i / Math.max(1, count - 1);
    const x = headX - Math.cos(angle) * spacing * i;
    const y = headY - Math.sin(angle) * spacing * i + Math.sin(state.time * 0.006 + i * 0.9) * (6 + t * 18);
    const r = lerp(taper[0], taper[1], t);
    segments.push({ x, y, r, glow: 1 - t * 0.6 });
  }
  return segments;
}

function getScene(time) {
  const driver = getDriver(time);
  const preset = presets[state.presetIndex].id;
  const craftAngle = Math.atan2(
    Math.cos(time * 0.0011) * 0.55 + (state.pointerActive ? driver.y - state.height * 0.5 : 0),
    Math.sin(time * 0.00084) * 0.85 + state.width * 0.1,
  );

  if (preset === 'interceptor') {
    const headX = state.pointerActive ? driver.x : (time * 0.42) % (state.width + 280) - 140;
    const headY = state.pointerActive ? driver.y : state.height * 0.48 + Math.sin(time * 0.0011) * state.height * 0.16;
    const segments = buildCraftSegments(headX, headY, 0.1 + Math.sin(time * 0.0012) * 0.18, 11, 32, [42, 12]);
    return {
      craft: { x: headX, y: headY, angle: 0.08 + Math.sin(time * 0.0012) * 0.18, length: 340, width: 90, hue: 196 },
      segments,
      shockwaves: [
        { x: headX - 130, y: headY, r: 70 + (time * 0.08) % 80, alpha: 0.13 },
      ],
      lanes: [],
    };
  }

  if (preset === 'slipstream') {
    const cx = driver.x;
    const cy = driver.y;
    const angle = time * 0.0011;
    const headX = cx + Math.cos(angle) * Math.min(260, state.width * 0.18);
    const headY = cy + Math.sin(angle * 1.4) * Math.min(180, state.height * 0.16);
    const segments = buildCraftSegments(headX, headY, angle + Math.PI * 0.2, 13, 28, [34, 10]);
    return {
      craft: { x: headX, y: headY, angle: angle + Math.PI * 0.2, length: 300, width: 78, hue: 282 },
      segments,
      shockwaves: [
        { x: headX - Math.cos(angle) * 60, y: headY - Math.sin(angle) * 60, r: 56 + Math.sin(time * 0.004) * 14, alpha: 0.14 },
        { x: headX - Math.cos(angle) * 118, y: headY - Math.sin(angle) * 118, r: 92 + Math.cos(time * 0.003) * 20, alpha: 0.09 },
      ],
      lanes: [
        { x: cx - 180, width: 56 + Math.sin(time * 0.0015) * 14, glow: 0.18 },
        { x: cx + 180, width: 64 + Math.cos(time * 0.0014) * 12, glow: 0.16 },
      ],
    };
  }

  const baseX = state.pointerActive ? driver.x : state.width * 0.5 + Math.sin(time * 0.0003) * 80;
  const baseY = state.pointerActive ? driver.y : state.height * 0.52;
  const segments = buildCraftSegments(baseX, baseY - 20, -Math.PI / 2, 9, 30, [26, 8]);
  return {
    craft: { x: baseX, y: baseY - 40, angle: -Math.PI / 2, length: 220, width: 64, hue: 214 },
    segments,
    shockwaves: [],
    lanes: [
      { x: baseX - 240, width: 110, glow: 0.14 },
      { x: baseX, width: 84, glow: 0.22 },
      { x: baseX + 240, width: 110, glow: 0.14 },
    ],
  };
}

function getBlockedIntervals(y, scene) {
  const intervals = [];

  for (const segment of scene.segments) {
    const dy = Math.abs(y - segment.y);
    if (dy >= segment.r * 1.06) continue;
    const dx = Math.sqrt(segment.r ** 2 - dy ** 2);
    intervals.push([segment.x - dx - 18, segment.x + dx + 18]);
  }

  for (const wave of scene.shockwaves) {
    const dy = Math.abs(y - wave.y);
    if (dy >= wave.r * 0.72) continue;
    const dx = Math.sqrt((wave.r * 0.72) ** 2 - dy ** 2);
    intervals.push([wave.x - dx, wave.x + dx]);
  }

  for (const lane of scene.lanes) {
    const towerHeight = state.height * 0.74;
    const centerY = state.height * 0.56;
    const dy = Math.abs(y - centerY);
    if (dy < towerHeight * 0.5) {
      intervals.push([lane.x - lane.width * 0.5, lane.x + lane.width * 0.5]);
    }
  }

  intervals.sort((a, b) => a[0] - b[0]);
  const merged = [];
  for (const interval of intervals) {
    const last = merged[merged.length - 1];
    if (!last || interval[0] > last[1]) merged.push([...interval]);
    else last[1] = Math.max(last[1], interval[1]);
  }
  return merged;
}

function getBestSegment(y, scene, left, right) {
  const blocked = getBlockedIntervals(y, scene);
  const segments = [];
  let cursor = left;

  for (const [start, end] of blocked) {
    if (start > cursor) segments.push({ x: cursor, width: Math.min(start, right) - cursor });
    cursor = Math.max(cursor, end);
    if (cursor >= right) break;
  }
  if (cursor < right) segments.push({ x: cursor, width: right - cursor });

  const valid = segments.filter(segment => segment.width >= 92);
  if (!valid.length) return null;

  valid.sort((a, b) => b.width - a.width);
  const center = state.width * 0.5;
  valid.sort((a, b) => {
    const scoreA = b.width === a.width ? 0 : 0;
    void scoreA;
    const midA = a.x + a.width * 0.5;
    const midB = b.x + b.width * 0.5;
    const weightA = a.width - Math.abs(midA - center) * 0.12;
    const weightB = b.width - Math.abs(midB - center) * 0.12;
    return weightB - weightA;
  });
  return valid[0];
}

function drawBackground(time, scene) {
  ctx.clearRect(0, 0, state.width, state.height);

  const bg = ctx.createLinearGradient(0, 0, state.width, state.height);
  bg.addColorStop(0, '#03040b');
  bg.addColorStop(0.35, '#081222');
  bg.addColorStop(0.7, '#0c0b1c');
  bg.addColorStop(1, '#020309');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, state.width, state.height);

  const gridAlpha = 0.06 + Math.sin(time * 0.0004) * 0.01;
  ctx.strokeStyle = `rgba(120,170,255,${gridAlpha})`;
  ctx.lineWidth = 1;
  for (let x = -40; x < state.width + 40; x += 48) {
    ctx.beginPath();
    ctx.moveTo(x + (time * 0.02) % 48, 0);
    ctx.lineTo(x + (time * 0.02) % 48, state.height);
    ctx.stroke();
  }
  for (let y = -40; y < state.height + 40; y += 48) {
    ctx.beginPath();
    ctx.moveTo(0, y + (time * 0.012) % 48);
    ctx.lineTo(state.width, y + (time * 0.012) % 48);
    ctx.stroke();
  }

  for (let i = 0; i < 260; i += 1) {
    const x = (i * 51.17 + time * 0.035 + Math.sin(i * 8 + time * 0.0005) * 32) % (state.width + 100) - 50;
    const y = (i * 83.91 + Math.cos(i * 7 + time * 0.0007) * 28) % (state.height + 100) - 50;
    let intensity = 0.02;
    for (const segment of scene.segments) {
      const d = Math.hypot(x - segment.x, y - segment.y);
      intensity += Math.max(0, 1 - d / (segment.r * 4.4)) * 0.22 * segment.glow;
    }
    ctx.fillStyle = `rgba(255,255,255,${intensity})`;
    const size = 1 + intensity * 4;
    ctx.fillRect(x, y, size, size);
  }

  scene.lanes.forEach((lane, index) => {
    const g = ctx.createLinearGradient(lane.x, 0, lane.x, state.height);
    g.addColorStop(0, 'rgba(90,210,255,0)');
    g.addColorStop(0.5, `rgba(${index === 1 ? '220,130,255' : '90,210,255'},${lane.glow})`);
    g.addColorStop(1, 'rgba(90,210,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(lane.x - lane.width * 0.8, 0, lane.width * 1.6, state.height);
  });
}

function drawCraft(scene) {
  const { craft } = scene;

  ctx.save();
  ctx.translate(craft.x, craft.y);
  ctx.rotate(craft.angle);

  const trail = ctx.createLinearGradient(-craft.length * 0.7, 0, 40, 0);
  trail.addColorStop(0, 'rgba(113, 226, 255, 0)');
  trail.addColorStop(0.5, 'rgba(113, 226, 255, 0.14)');
  trail.addColorStop(1, 'rgba(255,255,255,0.44)');
  ctx.fillStyle = trail;
  ctx.beginPath();
  ctx.moveTo(-craft.length, -18);
  ctx.lineTo(18, -6);
  ctx.lineTo(18, 6);
  ctx.lineTo(-craft.length, 18);
  ctx.closePath();
  ctx.fill();

  const body = ctx.createLinearGradient(-58, -12, 38, 18);
  body.addColorStop(0, 'rgba(255,255,255,0.18)');
  body.addColorStop(0.3, `hsla(${craft.hue} 95% 70% / 0.95)`);
  body.addColorStop(1, 'rgba(255,255,255,1)');
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(42, 0);
  ctx.lineTo(-22, -20);
  ctx.lineTo(-46, -14);
  ctx.lineTo(-54, 0);
  ctx.lineTo(-46, 14);
  ctx.lineTo(-22, 20);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-10, -8);
  ctx.lineTo(26, 0);
  ctx.lineTo(-10, 8);
  ctx.stroke();

  ctx.shadowColor = 'rgba(117, 221, 255, 0.9)';
  ctx.shadowBlur = 26;
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.beginPath();
  ctx.arc(34, 0, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  for (let i = scene.segments.length - 1; i >= 0; i -= 1) {
    const segment = scene.segments[i];
    const g = ctx.createRadialGradient(segment.x, segment.y, 0, segment.x, segment.y, segment.r * 2.8);
    g.addColorStop(0, `rgba(255,255,255,${0.24 * segment.glow})`);
    g.addColorStop(0.25, `rgba(113,226,255,${0.22 * segment.glow})`);
    g.addColorStop(0.56, `rgba(207,108,255,${0.12 * segment.glow})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(segment.x, segment.y, segment.r * 2.8, 0, Math.PI * 2);
    ctx.fill();
  }

  scene.shockwaves.forEach(wave => {
    ctx.strokeStyle = `rgba(117,221,255,${wave.alpha})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(wave.x, wave.y, wave.r, 0, Math.PI * 2);
    ctx.stroke();
  });
}

function drawParagraph(time, scene) {
  const prepared = preparedByKey[presets[state.presetIndex].key];
  const top = Math.max(148, state.height * 0.18);
  const left = Math.max(58, state.width * 0.08);
  const right = state.width - Math.max(58, state.width * 0.08);
  const bottom = state.height - 82;

  ctx.font = paragraphFont;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  ctx.shadowColor = 'rgba(80, 183, 255, 0.18)';
  ctx.shadowBlur = 18;

  let cursor = { segmentIndex: 0, graphemeIndex: 0 };
  let y = top;
  let lineIndex = 0;
  let coverage = 0;

  while (y < bottom) {
    const slot = getBestSegment(y, scene, left, right);
    if (!slot) {
      y += lineHeight;
      continue;
    }

    const line = layoutNextLine(prepared, cursor, slot.width);
    if (!line) break;

    const nearest = scene.segments.reduce((best, segment) => {
      const d = Math.hypot(slot.x + line.width * 0.5 - segment.x, y - segment.y);
      return Math.min(best, d - segment.r);
    }, Infinity);

    const waveEnergy = scene.shockwaves.reduce((sum, wave) => {
      const d = Math.hypot(slot.x + line.width * 0.5 - wave.x, y - wave.y);
      return sum + Math.max(0, 1 - d / (wave.r * 1.8));
    }, 0);

    const hue = 195 + Math.sin(time * 0.001 + lineIndex * 0.26) * 18 + waveEnergy * 40;
    const lightness = clamp(90 - nearest * 0.038 + waveEnergy * 6, 72, 95);
    const drift = Math.sin(time * 0.0022 + lineIndex * 0.72) * Math.min(8, waveEnergy * 8 + 2);

    ctx.fillStyle = `hsl(${hue} 92% ${lightness}%)`;
    ctx.fillText(line.text, slot.x + drift, y);

    const highlight = ctx.createLinearGradient(slot.x, y - 18, slot.x + line.width, y + 4);
    highlight.addColorStop(0, `rgba(113,226,255,${0.14 + waveEnergy * 0.12})`);
    highlight.addColorStop(0.5, `rgba(255,255,255,${0.04 + waveEnergy * 0.08})`);
    highlight.addColorStop(1, `rgba(207,108,255,${0.02 + waveEnergy * 0.10})`);
    ctx.fillStyle = highlight;
    ctx.fillRect(slot.x, y - lineHeight + 8, line.width, lineHeight + 6);

    coverage += line.width;
    cursor = line.end;
    y += lineHeight;
    lineIndex += 1;
  }

  state.metrics.lines = lineIndex;
  state.metrics.coverage = Math.round(coverage);
  controls.metrics.textContent = `${state.metrics.mode} · ${state.metrics.lines} lines · ${state.metrics.coverage}px flow`;
}

function frame(time) {
  state.time = time;
  if (state.autoplay && !state.pointerActive) {
    const cycle = Math.floor(time / 8000) % presets.length;
    if (cycle !== state.presetIndex) setPreset(cycle);
  }

  const scene = getScene(time);
  drawBackground(time, scene);
  drawParagraph(time, scene);
  drawCraft(scene);
  requestAnimationFrame(frame);
}

controls.chips.forEach((chip, index) => {
  chip.addEventListener('click', () => {
    state.autoplay = false;
    controls.auto.dataset.active = 'false';
    controls.auto.textContent = 'Autoplay Off';
    setPreset(index);
  });
});

controls.auto.addEventListener('click', () => {
  state.autoplay = !state.autoplay;
  controls.auto.dataset.active = String(state.autoplay);
  controls.auto.textContent = state.autoplay ? 'Autoplay On' : 'Autoplay Off';
});

window.addEventListener('resize', resize);
window.addEventListener('pointermove', event => {
  state.pointer.x = event.clientX;
  state.pointer.y = event.clientY;
  state.pointerActive = true;
});
window.addEventListener('pointerdown', event => {
  state.pointer.x = event.clientX;
  state.pointer.y = event.clientY;
  state.pointerActive = true;
});
window.addEventListener('pointerleave', () => {
  state.pointerActive = false;
});
window.addEventListener('touchend', () => {
  state.pointerActive = false;
});
window.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight') setPreset(state.presetIndex + 1);
  if (event.key === 'ArrowLeft') setPreset(state.presetIndex - 1);
  if (event.key === ' ') {
    event.preventDefault();
    controls.auto.click();
  }
});

setPreset(0);
resize();
requestAnimationFrame(frame);
