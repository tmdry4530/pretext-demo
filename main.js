import { prepareWithSegments, layoutNextLine } from '@chenglou/pretext';

const canvas = document.getElementById('scene');
const ctx = canvas.getContext('2d');

const copy = {
  horizon: `Cities dream in multilingual layers: 서울 wakes in neon fog, القاهرة folds into dawn prayer, 東京 hums under commuter rails, and somewhere a small note says, “the future still fits.” Pretext measures the sentence once, then lets layout become choreography. The paragraph does not merely wrap — it yields, arcs, and recovers. Around a moving gravity well, each line finds a different path, like language learning how to flow around impossible objects without losing its meaning. 🚀`,
  atlas: `Typography becomes an atlas of force. English threads through data, 한국어 lands with quiet precision, العربية curves with ceremonial weight, 日本語 flickers like station light, and numbers turn into pulse and orbit. Pretext is not asking the DOM what happened after render; it decides the layout beforehand, line by line, width by width, as if text were navigating weather. In the hands of a product team, that means feeds, editors, maps, charts, and immersive interfaces can feel computationally alive instead of mechanically wrapped.`,
  manifesto: `This is the pitch: not another text utility, but a programmable paragraph engine. Give it shape, motion, interruption, pressure, and it keeps semantic flow intact while geometry mutates beneath it. That opens a path to editorial systems that react to imagery, AI canvases that predict text placement before paint, and brand experiences where copy is no longer pasted onto the surface of interaction — it becomes part of the physics. Pretext makes language feel less like a box model and more like a field.`,
};

const presets = [
  { id: 'singularity', label: 'Singularity', key: 'horizon' },
  { id: 'binary', label: 'Binary Stars', key: 'atlas' },
  { id: 'corridor', label: 'Wormhole', key: 'manifesto' },
];

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

const descriptions = {
  singularity: '단일 중력원 주변으로 문단이 굽어 흐릅니다.',
  binary: '두 개의 질량장 사이에서 각 라인이 다른 경로를 선택합니다.',
  corridor: '중앙 웜홀을 피해 좌우 채널로 문장이 분기됩니다.',
};

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
    state.pointer.x = state.width * 0.72;
    state.pointer.y = state.height * 0.5;
  }
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getDriver(time) {
  const x = state.pointerActive
    ? state.pointer.x
    : state.width * 0.5 + Math.cos(time * 0.0004) * Math.min(240, state.width * 0.22);
  const y = state.pointerActive
    ? state.pointer.y
    : state.height * 0.5 + Math.sin(time * 0.0007) * Math.min(160, state.height * 0.18);
  return { x, y };
}

function getFields(time) {
  const driver = getDriver(time);
  const baseR = Math.min(state.width, state.height) * 0.12;
  const preset = presets[state.presetIndex].id;

  if (preset === 'singularity') {
    return [
      { type: 'circle', x: driver.x, y: driver.y, r: baseR * 1.05, glow: 1 },
    ];
  }

  if (preset === 'binary') {
    const orbit = Math.min(220, state.width * 0.14);
    return [
      {
        type: 'circle',
        x: driver.x + Math.cos(time * 0.0011) * orbit,
        y: driver.y + Math.sin(time * 0.0013) * orbit * 0.62,
        r: baseR * 0.88,
        glow: 0.9,
      },
      {
        type: 'circle',
        x: driver.x - Math.cos(time * 0.0011) * orbit,
        y: driver.y - Math.sin(time * 0.0013) * orbit * 0.62,
        r: baseR * 0.72,
        glow: 0.7,
      },
    ];
  }

  const corridorWidth = Math.min(180, state.width * 0.16) + Math.sin(time * 0.0014) * 32;
  return [
    {
      type: 'corridor',
      x: driver.x,
      y: driver.y,
      halfWidth: corridorWidth * 0.5,
      halfHeight: Math.min(state.height * 0.28, 220),
      feather: 42,
      glow: 0.8,
    },
    {
      type: 'circle',
      x: driver.x,
      y: driver.y,
      r: baseR * 0.42,
      glow: 0.55,
    },
  ];
}

function getBlockedIntervals(y, fields) {
  const intervals = [];
  for (const field of fields) {
    if (field.type === 'circle') {
      const dy = Math.abs(y - field.y);
      if (dy >= field.r * 1.04) continue;
      const inset = Math.sqrt(field.r ** 2 - dy ** 2);
      intervals.push([field.x - inset - 18, field.x + inset + 18]);
    } else if (field.type === 'corridor') {
      const dy = Math.abs(y - field.y);
      if (dy >= field.halfHeight + field.feather) continue;
      const taper = clamp(1 - dy / (field.halfHeight + field.feather), 0, 1);
      const width = field.halfWidth * (0.78 + taper * 0.74);
      intervals.push([field.x - width, field.x + width]);
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

function getBestSegment(y, fields, left, right) {
  const blocked = getBlockedIntervals(y, fields);
  const segments = [];
  let cursor = left;
  for (const [start, end] of blocked) {
    if (start > cursor) segments.push([cursor, Math.min(start, right)]);
    cursor = Math.max(cursor, end);
    if (cursor >= right) break;
  }
  if (cursor < right) segments.push([cursor, right]);

  const valid = segments
    .map(([x1, x2]) => ({ x: x1, width: x2 - x1 }))
    .filter(segment => segment.width >= 96);

  if (!valid.length) return null;

  valid.sort((a, b) => b.width - a.width);
  const primary = valid[0];
  const secondary = valid[1];

  if (secondary && Math.abs(secondary.width - primary.width) < 24) {
    return primary.x < secondary.x ? primary : secondary;
  }

  return primary;
}

function drawBackground(time, fields) {
  ctx.clearRect(0, 0, state.width, state.height);

  const bg = ctx.createLinearGradient(0, 0, state.width, state.height);
  bg.addColorStop(0, '#050816');
  bg.addColorStop(0.5, '#090f23');
  bg.addColorStop(1, '#04060f');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, state.width, state.height);

  for (const field of fields) {
    const radius = field.type === 'circle' ? field.r * 3.4 : field.halfWidth * 3.6;
    const g = ctx.createRadialGradient(field.x, field.y, 0, field.x, field.y, radius);
    g.addColorStop(0, `rgba(255, 190, 120, ${0.18 * field.glow})`);
    g.addColorStop(0.18, `rgba(111, 207, 255, ${0.16 * field.glow})`);
    g.addColorStop(0.34, `rgba(197, 124, 255, ${0.14 * field.glow})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, state.width, state.height);
  }

  for (let i = 0; i < 220; i += 1) {
    const wave = Math.sin(time * 0.00016 + i * 1.73);
    const x = (i * 61.73 + time * 0.018 + wave * 24) % (state.width + 120) - 60;
    const y = (i * 97.31 + Math.cos(time * 0.00023 + i) * 30) % (state.height + 80) - 40;
    let intensity = 0.03;
    for (const field of fields) {
      const dx = x - field.x;
      const dy = y - field.y;
      const d = Math.hypot(dx, dy);
      const influence = field.type === 'circle' ? field.r * 3 : field.halfWidth * 3.2;
      intensity += Math.max(0, 1 - d / influence) * 0.16;
    }
    ctx.fillStyle = `rgba(255,255,255,${intensity})`;
    const size = 0.8 + intensity * 4.2;
    ctx.fillRect(x, y, size, size);
  }

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (const field of fields) {
    if (field.type === 'circle') {
      const ring = ctx.createRadialGradient(field.x, field.y, field.r * 0.45, field.x, field.y, field.r * 1.34);
      ring.addColorStop(0, 'rgba(0,0,0,1)');
      ring.addColorStop(0.44, 'rgba(0,0,0,1)');
      ring.addColorStop(0.67, 'rgba(255,159,92,0.78)');
      ring.addColorStop(0.84, 'rgba(96, 202, 255, 0.28)');
      ring.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = ring;
      ctx.beginPath();
      ctx.arc(field.x, field.y, field.r * 1.34, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(0,0,0,0.98)';
      ctx.beginPath();
      ctx.arc(field.x, field.y, field.r * 0.54, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const grad = ctx.createLinearGradient(field.x, field.y - field.halfHeight, field.x, field.y + field.halfHeight);
      grad.addColorStop(0, 'rgba(99, 222, 255, 0)');
      grad.addColorStop(0.5, 'rgba(99, 222, 255, 0.22)');
      grad.addColorStop(1, 'rgba(197, 124, 255, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(field.x - field.halfWidth * 1.5, field.y - field.halfHeight * 1.2, field.halfWidth * 3, field.halfHeight * 2.4);
    }
  }
  ctx.restore();
}

function drawParagraph(time, fields) {
  const prepared = preparedByKey[presets[state.presetIndex].key];
  const top = Math.max(146, state.height * 0.18);
  const left = Math.max(58, state.width * 0.08);
  const right = state.width - Math.max(58, state.width * 0.08);
  const bottom = state.height - 84;

  ctx.font = paragraphFont;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  ctx.shadowColor = 'rgba(101, 197, 255, 0.14)';
  ctx.shadowBlur = 18;

  let cursor = { segmentIndex: 0, graphemeIndex: 0 };
  let y = top;
  let lineIndex = 0;
  let coverage = 0;

  while (y < bottom) {
    const segment = getBestSegment(y, fields, left, right);
    if (!segment) {
      y += lineHeight;
      continue;
    }

    const line = layoutNextLine(prepared, cursor, segment.width);
    if (!line) break;

    const nearest = fields.reduce((best, field) => {
      const dx = segment.x + line.width * 0.5 - field.x;
      const dy = y - field.y;
      const dist = Math.hypot(dx, dy);
      return Math.min(best, dist);
    }, Infinity);

    const hue = 195 + Math.sin(time * 0.001 + lineIndex * 0.22) * 24 + Math.max(-18, Math.min(18, (state.width * 0.5 - segment.x) * 0.035));
    const luminance = clamp(92 - nearest * 0.03, 72, 93);
    ctx.fillStyle = `hsl(${hue} 92% ${luminance}%)`;

    const drift = Math.sin(time * 0.0016 + lineIndex * 0.7) * Math.min(6, nearest * 0.012);
    ctx.fillText(line.text, segment.x + drift, y);

    const underline = ctx.createLinearGradient(segment.x, y - 18, segment.x + line.width, y + 6);
    underline.addColorStop(0, 'rgba(116, 224, 255, 0.18)');
    underline.addColorStop(0.55, 'rgba(197, 124, 255, 0.10)');
    underline.addColorStop(1, 'rgba(255, 255, 255, 0.01)');
    ctx.fillStyle = underline;
    ctx.fillRect(segment.x, y - lineHeight + 8, line.width, lineHeight + 6);

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
    const cycle = Math.floor(time / 9000) % presets.length;
    if (cycle !== state.presetIndex) setPreset(cycle);
  }

  const fields = getFields(time);
  drawBackground(time, fields);
  drawParagraph(time, fields);
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
  if (event.key.toLowerCase() === ' ') {
    event.preventDefault();
    controls.auto.click();
  }
});

setPreset(0);
resize();
requestAnimationFrame(frame);
