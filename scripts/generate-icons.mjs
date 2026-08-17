// Generates real PNG favicons/app icons (16, 32, 48, 180, 192, 512) matching public/favicon.svg.
// Pure JS via pngjs — no native deps, deterministic output.
import { writeFileSync, mkdirSync } from 'node:fs';
import { PNG } from 'pngjs';

const OUT = 'public';
mkdirSync(OUT, { recursive: true });

// ---------- geometry (normalized 0..1 coordinates, matching favicon.svg) ----------
const DOC = { x0: 174 / 512, y0: 102 / 512, x1: 338 / 512, y1: 410 / 512, r: 30 / 512 };
const TITLE = { x0: 195 / 512, y0: 138 / 512, x1: 317 / 512, y1: 156 / 512, r: 9 / 512 };
const LINES = [
  { x0: 195 / 512, y0: 196 / 512, x1: 317 / 512, y1: 210 / 512, r: 7 / 512 },
  { x0: 195 / 512, y0: 230 / 512, x1: 289 / 512, y1: 244 / 512, r: 7 / 512 },
  { x0: 195 / 512, y0: 264 / 512, x1: 305 / 512, y1: 278 / 512, r: 7 / 512 },
];
const CHECK = { cx: 338 / 512, cy: 338 / 512, r: 60 / 512 };
const CHECK_SEGS = [
  [318 / 512, 340 / 512, 332 / 512, 354 / 512],
  [332 / 512, 354 / 512, 362 / 512, 320 / 512],
];

const C = {
  indigo: [79, 70, 229],
  violet: [139, 92, 246],
  white: [255, 255, 255],
  ink: [49, 46, 129],
  line: [226, 232, 240],
  green: [34, 197, 94],
};

function inRoundRect(px, py, r) {
  const dx = Math.max(0.5 - r - px, px - (0.5 + r), 0);
  const dy = Math.max(0.5 - r - py, py - (0.5 + r), 0);
  return dx * dx + dy * dy <= r * r;
}

function inRR(px, py, b) {
  const dx = Math.max(b.x0 + b.r - px, px - (b.x1 - b.r), 0);
  const dy = Math.max(b.y0 + b.r - py, py - (b.y1 - b.r), 0);
  return dx * dx + dy * dy <= b.r * b.r;
}

function segDist(px, py, ax, ay, bx, by) {
  const vx = bx - ax, vy = by - ay;
  const wx = px - ax, wy = py - ay;
  const c1 = wx * vx + wy * vy;
  const c2 = vx * vx + vy * vy;
  const t = c2 === 0 ? 0 : Math.max(0, Math.min(1, c1 / c2));
  const dx = wx - vx * t, dy = wy - vy * t;
  return Math.sqrt(dx * dx + dy * dy);
}

function colorAt(px, py, radius) {
  if (!inRoundRect(px, py, radius)) return [0, 0, 0, 0];

  // check circle + stroke (topmost)
  const dc = Math.hypot(px - CHECK.cx, py - CHECK.cy);
  if (dc <= CHECK.r) {
    const dS = Math.min(
      segDist(px, py, ...CHECK_SEGS[0]),
      segDist(px, py, ...CHECK_SEGS[1])
    );
    if (dS <= 14 / 512) return [...C.white, 1];
    return [...C.green, 1];
  }

  // document lines
  for (const ln of LINES) if (inRR(px, py, ln)) return [...C.line, 1];
  if (inRR(px, py, TITLE)) return [...C.ink, 1];

  // document body
  if (inRR(px, py, DOC)) return [...C.white, 1];

  // gradient background
  const t = py;
  const r = Math.round(C.indigo[0] + (C.violet[0] - C.indigo[0]) * t);
  const g = Math.round(C.indigo[1] + (C.violet[1] - C.indigo[1]) * t);
  const b = Math.round(C.indigo[2] + (C.violet[2] - C.indigo[2]) * t);
  return [r, g, b, 1];
}

function render(size) {
  const png = new PNG({ width: size, height: size });
  const SS = 4;
  const radius = 112 / 512;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const px = (x + (sx + 0.5) / SS) / size;
          const py = (y + (sy + 0.5) / SS) / size;
          const [cr, cg, cb, ca] = colorAt(px, py, radius);
          r += cr * ca; g += cg * ca; b += cb * ca; a += ca;
        }
      }
      const n = SS * SS;
      const i = (y * size + x) * 4;
      png.data[i] = Math.round(r / n);
      png.data[i + 1] = Math.round(g / n);
      png.data[i + 2] = Math.round(b / n);
      png.data[i + 3] = Math.round((a / n) * 255);
    }
  }
  return PNG.sync.write(png);
}

const files = [
  ['icon-16.png', 16],
  ['icon-32.png', 32],
  ['icon-48.png', 48],
  ['apple-touch-icon.png', 180],
  ['icon-192.png', 192],
  ['icon-512.png', 512],
];

for (const [name, size] of files) {
  writeFileSync(`${OUT}/${name}`, render(size));
  console.log(`wrote ${OUT}/${name} (${size}x${size})`);
}
