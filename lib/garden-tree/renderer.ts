/**
 * Canvas çizici ve animasyon döngüsü. React'tan bağımsızdır; GardenTree bileşeni
 * bunu bir canvas'a bağlar.
 *
 * Gösterilen kitap sayısı (`shown`) hedefe (`target`) doğru yumuşakça ilerler; her parça
 * kendi doğum kitabına göre 0'dan 1'e büyür. Bu sayede 60 → 61 geçişinde yalnızca
 * yeni parça animasyonla açılır, 0 → 200 gibi büyük sıçramalar ise birkaç saniyede akar.
 */
import {
  CROWN_BOOKS, GROUND_Y, MAX_BOOKS, TRUNK_X, WORLD_H, WORLD_W,
  clamp, cPoint, easeOut, lerp, qAngle, qPoint, trunkAngle, trunkLength, trunkPoint,
  type Leaf, type LeafHost, type Limb, type Pt, type TreeModel, type Twig,
} from './model';

export interface TreeColors {
  bark: string;
  barkHighlight: string;
  root: string;
  ground: string;
  cloud: string;
  glow: string;
}

export const DEFAULT_COLORS: TreeColors = {
  bark: '#6b4a30',
  barkHighlight: '#8f6c4b',
  root: '#a5825f',
  ground: '#d3e8da',
  cloud: '#d9ece1',
  glow: '#f2dcb4',
};

/** Canvas'ın bulunduğu elemandaki CSS değişkenlerinden renkleri okur (tema desteği). */
export function readColorsFrom(el: Element): TreeColors {
  const cs = getComputedStyle(el);
  const v = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
  return {
    bark: v('--garden-bark', DEFAULT_COLORS.bark),
    barkHighlight: v('--garden-bark-hi', DEFAULT_COLORS.barkHighlight),
    root: v('--garden-root', DEFAULT_COLORS.root),
    ground: v('--garden-ground', DEFAULT_COLORS.ground),
    cloud: v('--garden-cloud', DEFAULT_COLORS.cloud),
    glow: v('--garden-glow', DEFAULT_COLORS.glow),
  };
}

/* ---------- renk yardımcıları ---------- */
function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  if (Number.isNaN(n)) return [120, 120, 120];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const mix = (a: string, b: string, t: number) => {
  const A = hexToRgb(a), B = hexToRgb(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], t))).join(',')})`;
};
const rgba = (hex: string, alpha: number) => {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
};

const easeBack = (t: number) => {
  const c1 = 1.5, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
const smoothstep = (t: number) => t * t * (3 - 2 * t);

/** Gövde kalınlığı: 20. kitaptan itibaren her 10 kitapta görünür bir kademe kalınlaşır. */
export function trunkWidth(b: number) {
  if (b < 10) return 1.6 + b * 0.12;
  let w = 2.8 + clamp((b - 10) / 10) * 1.6;
  for (let k = 1; k <= 19; k++) {
    const at = 10 + 10 * k;
    if (b <= at - 1) break;
    w += 2.3 * Math.pow(0.87, k - 1) * smoothstep(clamp(b - (at - 1)));
  }
  return w + 4 * clamp((b - CROWN_BOOKS) / (MAX_BOOKS - CROWN_BOOKS));
}

export interface RendererOptions {
  reducedMotion?: boolean;
  colors?: TreeColors;
  /** Çizim çözünürlüğü için üst sınır (mobilde pil için 2 yeterli) */
  maxDpr?: number;
}

export class GardenTreeRenderer {
  private ctx: CanvasRenderingContext2D;
  private model: TreeModel;
  private colors: TreeColors;
  private reduced: boolean;
  private maxDpr: number;

  private target = 0;
  private shown = 0;
  private time = 0;
  private last = 0;
  private sway = 0;
  private scale = 1;
  private raf = 0;
  private running = false;
  /** Görünen dünya yüksekliği; kökler yokken alt boşluk kırpılır */
  private viewH = WORLD_H;

  constructor(private canvas: HTMLCanvasElement, model: TreeModel, opts: RendererOptions = {}) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D desteklenmiyor');
    this.ctx = ctx;
    this.model = model;
    this.colors = opts.colors ?? DEFAULT_COLORS;
    this.reduced = opts.reducedMotion ?? false;
    this.maxDpr = opts.maxDpr ?? 2;
  }

  /* ---------- dış API ---------- */
  setModel(model: TreeModel) { this.model = model; this.drawOnce(); }
  setColors(colors: TreeColors) { this.colors = colors; this.drawOnce(); }
  setReducedMotion(reduced: boolean) { this.reduced = reduced; if (reduced) this.shown = this.target; this.drawOnce(); }

  /** Kitap sayısını ayarlar. `instant` true ise animasyonsuz atlar (ilk yükleme için). */
  setBooks(count: number, instant = false) {
    this.target = clamp(Math.round(count), 0, MAX_BOOKS);
    if (instant || this.reduced) this.shown = this.target;
    this.drawOnce();
  }

  /** Çizilen alanın yüksekliğini ayarlar (dünya biriminde). Ardından resize() çağrılmalı. */
  setViewHeight(h: number) { this.viewH = clamp(h, 300, WORLD_H); }

  /** Canvas'ı CSS boyutuna ve cihaz piksel oranına göre yeniden boyutlandırır. */
  resize() {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width === 0) return;
    const dpr = Math.min(this.maxDpr, window.devicePixelRatio || 1);
    this.canvas.width = Math.round(rect.width * dpr);
    this.canvas.height = Math.round(((rect.width * this.viewH) / WORLD_W) * dpr);
    this.scale = this.canvas.width / WORLD_W;
    this.drawOnce();
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    const loop = (now: number) => {
      if (!this.running) return;
      this.tick(now);
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  destroy() { this.stop(); }

  /* ---------- döngü ---------- */
  private tick(now: number) {
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.time += dt;
    const d = this.target - this.shown;
    if (this.reduced || Math.abs(d) < 0.002) this.shown = this.target;
    else {
      const step = Math.max(Math.abs(d) * dt * 2.2, dt * 1.3);
      this.shown += Math.sign(d) * Math.min(Math.abs(d), step);
    }
    this.draw();
  }

  private drawOnce() { if (!this.running) this.draw(); }

  /* ---------- geometri ---------- */
  private progress(birth: number, delay = 0) {
    return clamp((this.shown - (birth - 1) - delay) / (1 - delay));
  }
  private limbGrow(L: Limb) {
    const p = this.progress(L.birth);
    return p <= 0 ? 0 : easeOut(p) * (0.45 + 0.55 * clamp((this.shown - L.birth) / 9));
  }
  private twigGrow(t: Twig) { return easeOut(this.progress(t.birth)); }

  private hostPose(h: LeafHost): { p: Pt; a: number } {
    const { limbs, twigs } = this.model;
    switch (h.type) {
      case 'trunkTip': { const s = trunkLength(this.shown); return { p: trunkPoint(s), a: trunkAngle(s) }; }
      case 'trunk': return { p: trunkPoint(h.s), a: trunkAngle(h.s) };
      case 'limbTip': { const L = limbs[h.i], g = this.limbGrow(L); return { p: qPoint(L.P0, L.P1, L.P2, g), a: qAngle(L.P0, L.P1, L.P2, g) }; }
      case 'limb': { const L = limbs[h.i]; return { p: qPoint(L.P0, L.P1, L.P2, h.t), a: qAngle(L.P0, L.P1, L.P2, h.t) }; }
      case 'twigTip': { const t = twigs[h.j], g = this.twigGrow(t); return { p: qPoint(t.P0, t.P1, t.P2, g), a: qAngle(t.P0, t.P1, t.P2, g) }; }
      case 'twig': { const t = twigs[h.j]; return { p: qPoint(t.P0, t.P1, t.P2, h.u), a: qAngle(t.P0, t.P1, t.P2, h.u) }; }
    }
  }

  /** Rüzgâr salınımı: yükseldikçe artan hafif yatay kayma */
  private swayed(p: Pt): Pt {
    const h = Math.max(0, GROUND_Y - p.y) / 400;
    return { x: p.x + this.sway * h * h * 9, y: p.y };
  }

  /* ---------- çizim ilkel parçaları ---------- */
  private taper(pts: Pt[], widths: number[], color: string, highlight: string | null, noBaseCap = false) {
    const ctx = this.ctx, n = pts.length;
    if (n < 2) return;
    const left: Pt[] = [], right: Pt[] = [], normals: Pt[] = [];
    for (let i = 0; i < n; i++) {
      const a = pts[i > 0 ? i - 1 : 0], c = pts[i < n - 1 ? i + 1 : n - 1];
      const dx = c.x - a.x, dy = c.y - a.y, m = Math.hypot(dx, dy) || 1;
      const nx = -dy / m, ny = dx / m, w = widths[i] / 2;
      normals.push({ x: nx, y: ny });
      left.push({ x: pts[i].x + nx * w, y: pts[i].y + ny * w });
      right.push({ x: pts[i].x - nx * w, y: pts[i].y - ny * w });
    }
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(left[0].x, left[0].y);
    for (let i = 1; i < n; i++) ctx.lineTo(left[i].x, left[i].y);
    for (let i = n - 1; i >= 0; i--) ctx.lineTo(right[i].x, right[i].y);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath(); ctx.arc(pts[n - 1].x, pts[n - 1].y, widths[n - 1] / 2, 0, Math.PI * 2); ctx.fill();
    if (!noBaseCap) { ctx.beginPath(); ctx.arc(pts[0].x, pts[0].y, widths[0] / 2, 0, Math.PI * 2); ctx.fill(); }

    if (highlight && widths[0] > 2.2) {
      ctx.strokeStyle = highlight;
      ctx.globalAlpha = 0.55;
      ctx.lineCap = 'round';
      ctx.beginPath();
      for (let i = 0; i < n - 1; i++) {
        const o = widths[i] * 0.2, x = pts[i].x - normals[i].x * o, y = pts[i].y - normals[i].y * o;
        if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
      }
      ctx.lineWidth = Math.max(0.6, widths[0] * 0.22);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  private leafShape(x: number, y: number, ang: number, len: number, wr: number, color: string, dark: string, alpha: number, sc: number) {
    if (sc <= 0.01 || alpha <= 0.01) return;
    const ctx = this.ctx, w = len * wr, pet = Math.min(4, len * 0.2);
    ctx.save();
    ctx.translate(x, y); ctx.rotate(ang); ctx.scale(sc, sc);
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = this.colors.bark; ctx.lineWidth = 0.9;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(pet + 0.5, 0); ctx.stroke();
    ctx.translate(pet, 0);
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(0, 0);
    ctx.bezierCurveTo(len * 0.22, -w, len * 0.68, -w * 0.88, len, 0);
    ctx.bezierCurveTo(len * 0.68, w * 0.88, len * 0.22, w, 0, 0);
    ctx.fill();
    ctx.fillStyle = dark;
    ctx.beginPath(); ctx.moveTo(0, 0);
    ctx.bezierCurveTo(len * 0.22, w, len * 0.68, w * 0.88, len, 0);
    ctx.quadraticCurveTo(len * 0.5, w * 0.08, 0, 0);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.32)'; ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.moveTo(0.5, 0); ctx.quadraticCurveTo(len * 0.5, -w * 0.06, len * 0.9, 0); ctx.stroke();
    ctx.restore();
  }

  /* ---------- katmanlar ---------- */
  private drawClouds() {
    const ctx = this.ctx;
    const clouds: Array<[number, number, number, number]> = [[185, 118, 108, 30], [484, 262, 90, 26], [96, 330, 58, 17]];
    ctx.fillStyle = this.colors.cloud;
    clouds.forEach(([cx, cy, w, h], i) => {
      const dx = this.reduced ? 0 : Math.sin(this.time * 0.13 + i * 2.1) * 14;
      const dy = this.reduced ? 0 : Math.sin(this.time * 0.21 + i) * 3;
      ctx.globalAlpha = i === 2 ? 0.7 : 1;
      ctx.beginPath();
      ctx.roundRect(cx - w / 2 + dx, cy - h / 2 + dy, w, h, h / 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  private drawGround() {
    const tp = clamp(this.shown / CROWN_BOOKS), ctx = this.ctx;
    ctx.fillStyle = this.colors.ground;
    ctx.beginPath();
    ctx.ellipse(TRUNK_X, GROUND_Y + 3, 46 + 214 * tp, 7 + 15 * tp, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawRoots() {
    const ctx = this.ctx, b = this.shown, rp = clamp((b - CROWN_BOOKS) / (MAX_BOOKS - CROWN_BOOKS));
    if (rp > 0) {
      const g = ctx.createRadialGradient(TRUNK_X, GROUND_Y + 30, 4, TRUNK_X, GROUND_Y + 30, 60 + 150 * rp);
      g.addColorStop(0, rgba(this.colors.glow, 0.75));
      g.addColorStop(1, rgba(this.colors.glow, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(TRUNK_X, GROUND_Y + 30, 60 + 170 * rp, 40 + 90 * rp, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    for (const r of this.model.roots) {
      const p = this.progress(r.birth);
      if (p <= 0) continue;
      const g = easeOut(p), w0 = r.w0 * (0.55 + 0.45 * clamp((b - r.birth) / 40)), N = 14;
      const pts: Pt[] = [], ws: number[] = [];
      for (let i = 0; i <= N; i++) { pts.push(cPoint(r.P0, r.P1, r.P2, r.P3, (g * i) / N)); ws.push(lerp(w0, 0.5, i / N)); }
      this.taper(pts, ws, mix(this.colors.root, this.colors.glow, r.depth * 0.12), null);
    }
  }

  private drawLeaves(back: boolean) {
    const ctx = this.ctx, b = this.shown;
    for (const L of this.model.leaves as Leaf[]) {
      if (L.back !== back) continue;
      const p = this.progress(L.birth, L.delay);
      if (p <= 0) continue;
      let alpha = L.alpha, drop = 0;
      if (L.fade) {
        const f = clamp((b - L.fade[0]) / (L.fade[1] - L.fade[0]));
        alpha *= 1 - f; drop = f * 18;
        if (alpha <= 0.01) continue;
      }
      const pose = this.hostPose(L.host), q = this.swayed(pose.p);
      const flutter = this.reduced ? 0 : Math.sin(this.time * 1.7 + L.phase) * 0.08 + Math.sin(this.time * 0.9 + L.phase * 1.7) * 0.04;
      const len = L.len * (L.grow ? 1 + Math.min(1, b / 120) * 0.5 : 1);
      if (p < 1) {
        ctx.fillStyle = rgba(this.colors.glow, 0.55 * Math.sin(p * Math.PI));
        ctx.beginPath(); ctx.arc(q.x, q.y, len * 0.9, 0, Math.PI * 2); ctx.fill();
      }
      this.leafShape(q.x, q.y + drop, pose.a + L.rel + flutter + drop * 0.03, len, L.wr, L.color, L.colorDark, alpha, easeBack(p));
    }
  }

  private drawTrunk() {
    const b = this.shown, len = trunkLength(b);
    if (len <= 0) return;
    const wb = trunkWidth(b), N = 36, pts: Pt[] = [], ws: number[] = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      pts.push(this.swayed(trunkPoint(len * u)));
      let w = Math.max(1.2, wb * (1 - 0.7 * u));
      if (b > 20 && u < 0.1) w *= 1 + 0.32 * Math.pow(1 - u / 0.1, 2) * clamp((b - 20) / 80);
      ws.push(w);
    }
    const color = mix('#6f9c5c', this.colors.bark, clamp((b - 6) / 20));
    this.taper(pts, ws, color, b > 20 ? this.colors.barkHighlight : null, true);
  }

  private drawBranches() {
    const b = this.shown;
    for (const L of this.model.limbs) {
      const g = this.limbGrow(L);
      if (g <= 0) continue;
      const age = clamp((b - L.birth) / 60);
      const kids = L.childBirths.filter((cb) => b > cb - 1).length;
      const w0 = 1.7 + 4.2 * Math.pow(age, 0.7) + 1.2 * (1 - L.f) * age + 1.6 * kids, N = 18;
      const pts: Pt[] = [], ws: number[] = [];
      for (let i = 0; i <= N; i++) { pts.push(this.swayed(qPoint(L.P0, L.P1, L.P2, (g * i) / N))); ws.push(lerp(w0, 0.9, i / N)); }
      this.taper(pts, ws, this.colors.bark, this.colors.barkHighlight);
    }
    for (const t of this.model.twigs) {
      const g = this.twigGrow(t);
      if (g <= 0) continue;
      const w0 = 1.3 + 0.7 * clamp((b - t.birth) / 80), N = 8;
      const pts: Pt[] = [], ws: number[] = [];
      for (let i = 0; i <= N; i++) { pts.push(this.swayed(qPoint(t.P0, t.P1, t.P2, (g * i) / N))); ws.push(lerp(w0, 0.6, i / N)); }
      this.taper(pts, ws, this.colors.bark, null);
    }
  }

  private drawSeed() {
    const ctx = this.ctx, a = 1 - clamp(this.shown / 0.8);
    if (a <= 0) return;
    const open = clamp(this.shown / 0.8) * 4;
    ctx.globalAlpha = a;
    ctx.fillStyle = this.colors.bark;
    ctx.beginPath(); ctx.ellipse(TRUNK_X - open, GROUND_Y - 4, 6.5, 4.2, -0.35 - open * 0.1, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = this.colors.barkHighlight;
    ctx.beginPath(); ctx.ellipse(TRUNK_X - 1.5 - open, GROUND_Y - 5.5, 2.2, 1.2, -0.35, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }

  private draw() {
    const ctx = this.ctx;
    ctx.setTransform(this.scale, 0, 0, this.scale, 0, 0);
    ctx.clearRect(0, 0, WORLD_W, this.viewH);
    this.sway = this.reduced ? 0 : (Math.sin(this.time * 0.55) * 0.6 + Math.sin(this.time * 1.31) * 0.25) * Math.min(1, 0.2 + this.shown / 60);
    this.drawClouds();
    this.drawGround();
    this.drawRoots();
    this.drawLeaves(true);
    this.drawTrunk();
    this.drawBranches();
    this.drawLeaves(false);
    this.drawSeed();
  }
}
