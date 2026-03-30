import { prepareWithSegments, layoutNextLine } from '@chenglou/pretext';

const canvas = document.getElementById('scene');
const ctx = canvas.getContext('2d');

const text = `Cities dream in multilingual layers: 서울 wakes in neon fog, القاهرة folds into dawn prayer, 東京 hums under commuter rails, and somewhere a small note says, “the future still fits.” Pretext measures the sentence once, then lets layout become choreography. The paragraph does not merely wrap — it yields, arcs, and recovers. Around a moving gravity well, each line finds a different path, like language learning how to flow around impossible objects without losing its meaning. 🚀`;
const fontSize = 24;
const lineHeight = 30;
const paragraphFont = `${fontSize}px Georgia`;
const prepared = prepareWithSegments(text, paragraphFont);

const pointer = { x: window.innerWidth * 0.7, y: window.innerHeight * 0.52, active: false };
let width = window.innerWidth;
let height = window.innerHeight;
let dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
let t = 0;

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function getHole(time) {
  const idleX = width * 0.7 + Math.cos(time * 0.00045) * Math.min(180, width * 0.12);
  const idleY = height * 0.55 + Math.sin(time * 0.00062) * Math.min(110, height * 0.08);
  const x = pointer.active ? pointer.x : idleX;
  const y = pointer.active ? pointer.y : idleY;
  const r = Math.min(width, height) * 0.14;
  return { x, y, r };
}

function drawBackground(time, hole) {
  ctx.clearRect(0, 0, width, height);

  const g = ctx.createRadialGradient(hole.x, hole.y, 0, hole.x, hole.y, hole.r * 3.2);
  g.addColorStop(0, 'rgba(255, 210, 120, 0.20)');
  g.addColorStop(0.12, 'rgba(255, 140, 80, 0.22)');
  g.addColorStop(0.24, 'rgba(120, 200, 255, 0.22)');
  g.addColorStop(0.45, 'rgba(66, 24, 114, 0.16)');
  g.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < 160; i++) {
    const x = (i * 73.17 + (time * 0.01)) % (width + 80) - 40;
    const y = (i * 129.73) % height;
    const dx = x - hole.x;
    const dy = y - hole.y;
    const dist = Math.hypot(dx, dy);
    const alpha = Math.max(0, 0.7 - dist / (hole.r * 4.2)) * 0.22 + 0.05;
    const size = dist < hole.r * 1.6 ? 2.1 : 1.1;
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fillRect(x, y, size, size);
  }

  const ring = ctx.createRadialGradient(hole.x, hole.y, hole.r * 0.55, hole.x, hole.y, hole.r * 1.18);
  ring.addColorStop(0, 'rgba(0,0,0,0.98)');
  ring.addColorStop(0.55, 'rgba(0,0,0,0.98)');
  ring.addColorStop(0.72, 'rgba(255,160,82,0.85)');
  ring.addColorStop(0.84, 'rgba(124,214,255,0.4)');
  ring.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = ring;
  ctx.beginPath();
  ctx.arc(hole.x, hole.y, hole.r * 1.25, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(0,0,0,0.98)';
  ctx.beginPath();
  ctx.arc(hole.x, hole.y, hole.r * 0.58, 0, Math.PI * 2);
  ctx.fill();
}

function drawParagraph(time, hole) {
  const top = Math.max(150, height * 0.19);
  const leftMargin = Math.max(56, width * 0.08);
  const rightMargin = Math.max(56, width * 0.08);
  const maxRight = width - rightMargin;

  ctx.font = paragraphFont;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  ctx.shadowColor = 'rgba(90, 180, 255, 0.18)';
  ctx.shadowBlur = 14;

  let cursor = { segmentIndex: 0, graphemeIndex: 0 };
  let y = top;
  let lineIndex = 0;

  while (true) {
    const verticalDist = Math.abs(y - hole.y);
    let x = leftMargin;
    let availableWidth = maxRight - leftMargin;

    if (verticalDist < hole.r * 1.02) {
      const horizontalInset = Math.sqrt((hole.r * 1.02) ** 2 - verticalDist ** 2);
      const avoidLeft = hole.x - horizontalInset;
      const avoidRight = hole.x + horizontalInset;
      const leftWidth = avoidLeft - leftMargin - 18;
      const rightStart = avoidRight + 18;
      const rightWidth = maxRight - rightStart;

      if (leftWidth >= rightWidth && leftWidth > 120) {
        x = leftMargin;
        availableWidth = leftWidth;
      } else if (rightWidth > 120) {
        x = rightStart;
        availableWidth = rightWidth;
      }
    }

    if (availableWidth < 80) {
      y += lineHeight;
      if (y > height - 60) break;
      continue;
    }

    const line = layoutNextLine(prepared, cursor, availableWidth);
    if (line === null) break;

    const hue = 200 + Math.sin(time * 0.001 + lineIndex * 0.24) * 28 + Math.max(-22, Math.min(22, (hole.x - x) * 0.02));
    ctx.fillStyle = `hsl(${hue} 80% 92%)`;
    ctx.fillText(line.text, x, y);

    const grad = ctx.createLinearGradient(x, y - 18, x + line.width, y + 6);
    grad.addColorStop(0, 'rgba(135,212,255,0.16)');
    grad.addColorStop(1, 'rgba(197,124,255,0.02)');
    ctx.fillStyle = grad;
    ctx.fillRect(x, y - lineHeight + 8, line.width, lineHeight + 4);

    cursor = line.end;
    y += lineHeight;
    lineIndex += 1;
    if (y > height - 50) break;
  }
}

function frame(time) {
  t = time;
  const hole = getHole(time);
  drawBackground(time, hole);
  drawParagraph(time, hole);
  requestAnimationFrame(frame);
}

window.addEventListener('resize', resize);
window.addEventListener('pointermove', event => {
  pointer.x = event.clientX;
  pointer.y = event.clientY;
  pointer.active = true;
});
window.addEventListener('pointerleave', () => {
  pointer.active = false;
});
window.addEventListener('touchend', () => {
  pointer.active = false;
});

resize();
requestAnimationFrame(frame);
