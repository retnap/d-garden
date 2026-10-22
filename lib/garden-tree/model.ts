/**
 * D-Garden ağaç modeli.
 *
 * Ağacın tamamı (300 kitaplık hali) bir seed'den deterministik olarak bir kez üretilir.
 * Her parçanın bir `birth` (doğum kitabı) değeri vardır; ekranda yalnızca
 * `birth <= kitapSayısı` olan parçalar görünür. Aynı seed her zaman aynı ağacı verir,
 * bu yüzden seed'i kullanıcı ID'sinden üretmek her kullanıcıya kalıcı, kendine özgü
 * bir ağaç sağlar.
 *
 * Bu dosya React'a ve DOM'a bağımlı değildir; sunucuda da çalışabilir.
 */

/* ---------- sabitler ---------- */
export const WORLD_W = 600;
export const WORLD_H = 660;
export const GROUND_Y = 500;
export const TRUNK_X = 300;
export const TRUNK_LEN = 320;
export const CROWN_BOOKS = 200;
export const MAX_BOOKS = 300;
const CROWN = { cx: 300, cy: 245, rx: 178, ry: 166 };
const LIMB_COUNT = 19;
const ROOT_COUNT = 100;

/** Dalların taç içindeki yön dilimleri (dikeyden derece). Sıra, tacın dengeli dolmasını sağlar. */
const SLOTS = [46, -48, 16, -20, 66, -68, 32, -34, 2, 56, -58, 24, -10, -42, 40, 10, -28, 62, -4];
/** Yaprak tonları: [ana renk, damar tarafı koyu renk] */
const PALETTE: ReadonlyArray<readonly [string, string]> = [
  ['#2b684a', '#1f5038'],
  ['#4b8a68', '#3a7255'],
  ['#7fb396', '#68a081'],
  ['#a9d0b9', '#93bfa6'],
];
const SPROUT: readonly [string, string] = ['#8cc276', '#74ab60'];

/* ---------- tipler ---------- */
export type Pt = { x: number; y: number };

export type LeafHost =
  | { type: 'trunkTip' }
  | { type: 'trunk'; s: number }
  | { type: 'limbTip'; i: number }
  | { type: 'limb'; i: number; t: number }
  | { type: 'twigTip'; j: number }
  | { type: 'twig'; j: number; u: number };

export interface Leaf {
  birth: number;
  /** 0–1: aynı kitapta açılan yaprakların sırayla görünmesi için gecikme */
  delay: number;
  host: LeafHost;
  /** Bağlı olduğu dal teğetine göre açı (radyan) */
  rel: number;
  len: number;
  /** Genişlik / uzunluk oranı */
  wr: number;
  color: string;
  colorDark: string;
  alpha: number;
  /** Arka katmanda (dalların arkasında) çizilir */
  back: boolean;
  phase: number;
  /** Ağaç büyüdükçe boyu da büyür (tepe yaprakları) */
  grow: boolean;
  /** [başlangıç, bitiş] kitap aralığında solup düşer (filiz yaprakları) */
  fade?: readonly [number, number];
}

export interface Limb {
  birth: number;
  P0: Pt;
  P1: Pt;
  P2: Pt;
  len: number;
  /** 0 (ilk dal) – 1 (son dal) */
  f: number;
  index: number;
  /** Çatallandığı dalın indeksi, gövdeden çıkıyorsa -1 */
  parent: number;
  /** Bu daldan çatallanan dalların doğum kitapları */
  childBirths: number[];
}

export interface Twig {
  birth: number;
  limb: number;
  P0: Pt;
  P1: Pt;
  P2: Pt;
}

export interface Root {
  birth: number;
  P0: Pt;
  P1: Pt;
  P2: Pt;
  P3: Pt;
  w0: number;
  depth: number;
}

export interface TreeModel {
  seed: number;
  limbs: Limb[];
  twigs: Twig[];
  leaves: Leaf[];
  roots: Root[];
  /** events[n] = n. kitabın ağaca eklediği şeyin kısa açıklaması */
  events: string[];
}

/* ---------- yardımcılar ---------- */
export const clamp = (v: number, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export const qPoint = (A: Pt, B: Pt, C: Pt, t: number): Pt => {
  const u = 1 - t;
  return { x: u * u * A.x + 2 * u * t * B.x + t * t * C.x, y: u * u * A.y + 2 * u * t * B.y + t * t * C.y };
};
export const qAngle = (A: Pt, B: Pt, C: Pt, t: number) => {
  const u = 1 - t;
  return Math.atan2(2 * u * (B.y - A.y) + 2 * t * (C.y - B.y), 2 * u * (B.x - A.x) + 2 * t * (C.x - B.x));
};
export const cPoint = (A: Pt, B: Pt, C: Pt, D: Pt, t: number): Pt => {
  const u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
  return { x: a * A.x + b * B.x + c * C.x + d * D.x, y: a * A.y + b * B.y + c * C.y + d * D.y };
};
export const trunkPoint = (s: number): Pt => ({
  x: TRUNK_X + 6 * Math.sin(s * 3.6) - 6 * s * s,
  y: GROUND_Y - s * TRUNK_LEN,
});
export const trunkAngle = (s: number) => {
  const a = trunkPoint(Math.max(0, s - 0.01)), b = trunkPoint(s + 0.01);
  return Math.atan2(b.y - a.y, b.x - a.x);
};

/** Gövde uzunluğu (TRUNK_LEN'in oranı), sürekli kitap sayısına göre */
export function trunkLength(b: number) {
  if (b <= 0) return 0;
  if (b < 1) return 0.05 * easeOut(b);
  if (b < 10) return lerp(0.05, 0.4, (b - 1) / 9);
  const x = Math.min(18, (b - 10) / 10);
  return Math.min(0.82, 0.4 + 0.42 * (x / 18));
}

const ellipseValue = (p: Pt) => ((p.x - CROWN.cx) / CROWN.rx) ** 2 + ((p.y - CROWN.cy) / CROWN.ry) ** 2;
function rayToCrown(A: Pt, d: Pt) {
  const ox = (A.x - CROWN.cx) / CROWN.rx, oy = (A.y - CROWN.cy) / CROWN.ry;
  const dx = d.x / CROWN.rx, dy = d.y / CROWN.ry;
  const a = dx * dx + dy * dy, b = 2 * (ox * dx + oy * dy), c = ox * ox + oy * oy - 1;
  return (-b + Math.sqrt(Math.max(0, b * b - 4 * a * c))) / (2 * a);
}

function mulberry32(seed: number) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Kullanıcı ID'si gibi bir metinden kararlı bir sayısal seed üretir (FNV-1a). */
export function seedFromString(value: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function normalizeSeed(seed: string | number | undefined): number {
  if (seed === undefined) return 7;
  return typeof seed === 'number' ? seed >>> 0 : seedFromString(seed);
}

/* ---------- üretim ---------- */
type Sample = Pt & { owner: string };

export function buildTree(seedInput: string | number = 7): TreeModel {
  const seed = normalizeSeed(seedInput);
  const R = mulberry32(seed);
  const rnd = (a: number, b: number) => a + (b - a) * R();

  const limbs: Limb[] = [], twigs: Twig[] = [], leaves: Leaf[] = [], roots: Root[] = [];
  const events: string[] = [];
  const samples: Sample[] = [];
  const centers: Pt[] = [];

  for (let s = 0; s <= 1.001; s += 0.04) samples.push({ ...trunkPoint(s), owner: 't' });

  const tone = () => {
    const r = R();
    const t = r < 0.33 ? 0 : r < 0.66 ? 1 : r < 0.88 ? 2 : 3;
    return {
      color: PALETTE[t][0],
      colorDark: PALETTE[t][1],
      alpha: t === 3 ? 0.8 : 1,
      back: t === 3 || (t === 2 && R() < 0.5),
    };
  };
  const minDist = (p: Pt) => {
    let m = 1e9;
    for (const c of centers) { const d = Math.hypot(c.x - p.x, c.y - p.y); if (d < m) m = d; }
    return m;
  };
  type LeafInput = Omit<Leaf, 'delay' | 'phase' | 'wr' | 'grow'> & Partial<Pick<Leaf, 'delay' | 'wr' | 'grow'>>;
  const addLeaf = (o: LeafInput) =>
    leaves.push({ delay: 0, wr: 0.42, grow: false, ...o, phase: R() * Math.PI * 2 });

  /* --- 0–9: tohum ve filiz --- */
  events[0] = 'Tohum toprakta bekliyor';
  addLeaf({ birth: 1, host: { type: 'trunkTip' }, rel: -1, len: 12, wr: 0.6, color: SPROUT[0], colorDark: SPROUT[1], alpha: 1, back: false, fade: [10, 24] });
  addLeaf({ birth: 1, host: { type: 'trunkTip' }, rel: 1, len: 12, wr: 0.6, color: SPROUT[0], colorDark: SPROUT[1], alpha: 1, back: false, fade: [10, 24], delay: 0.15 });
  events[1] = 'Tohum çatladı, filiz çıktı';
  addLeaf({ birth: 2, host: { type: 'trunkTip' }, rel: -0.5, len: 15, color: PALETTE[1][0], colorDark: PALETTE[1][1], alpha: 1, back: false, grow: true });
  addLeaf({ birth: 2, host: { type: 'trunkTip' }, rel: 0.55, len: 15, color: PALETTE[0][0], colorDark: PALETTE[0][1], alpha: 1, back: false, grow: true, delay: 0.2 });
  events[2] = 'İlk gerçek yapraklar açtı';
  for (let k = 3; k <= 9; k++) {
    const side = k % 2 ? 1 : -1;
    addLeaf({
      birth: k, host: { type: 'trunk', s: trunkLength(k) - 0.035 }, rel: side * rnd(0.85, 1.1), len: rnd(13, 16),
      color: SPROUT[k % 2], colorDark: PALETTE[1][1], alpha: 1, back: false, fade: [11, 19],
    });
    events[k] = 'Filiz uzadı, gövdeye yaprak eklendi';
  }

  /* --- 10–199: her 10 kitapta bir dal, arada yaprak ve dalcıklar --- */
  const pattern = ['L', 'T2', 'L', 'T2', 'L', 'T3', 'L', 'T2', 'L'] as const;
  const flip = seed % 2 ? -1 : 1;

  for (let i = 0; i < LIMB_COUNT; i++) {
    const f = i / (LIMB_COUNT - 1), B = 10 + 10 * i;
    const a = ((SLOTS[i] + rnd(-4, 4)) * flip * Math.PI) / 180;
    const d = { x: Math.sin(a), y: -Math.cos(a) };

    // Aday bağlantı noktaları: gövde üzerinde ya da önceki bir dalda çatal olarak
    type Cand = { A: Pt; dir: Pt; owner: string; pref: number; parent?: Limb };
    const cands: Cand[] = [];
    const sMax = Math.max(0.3, trunkLength(B) - 0.03);
    for (let k = 0; k < 10; k++) cands.push({ A: trunkPoint(rnd(0.3, sMax)), dir: { x: 0, y: -1 }, owner: 't', pref: i < 4 ? 6 : 0 });
    for (const P of limbs) {
      for (let k = 0; k < 3; k++) {
        const t = rnd(0.3, 0.62), g = qAngle(P.P0, P.P1, P.P2, t);
        cands.push({ A: qPoint(P.P0, P.P1, P.P2, t), dir: { x: Math.cos(g), y: Math.sin(g) }, owner: 'L' + P.index, pref: i >= 3 ? 5 : -20, parent: P });
      }
    }

    let best: { sc: number; A: Pt; C: Pt; E: Pt; len: number; parent?: Limb } | null = null;
    for (const c of cands) {
      const len = rayToCrown(c.A, d) * 0.86;
      if (len < 55) continue;
      const mx = c.dir.x * 0.55 + d.x * 0.45, my = c.dir.y * 0.55 + d.y * 0.45, m = Math.hypot(mx, my);
      const C = { x: c.A.x + (mx / m) * len * 0.42, y: c.A.y + (my / m) * len * 0.42 };
      const E = { x: c.A.x + d.x * len, y: c.A.y + d.y * len };
      let sc = 1e9;
      for (let u = 0.2; u <= 1.001; u += 0.1) {
        const q = qPoint(c.A, C, E, u);
        for (const s2 of samples) {
          const fromA = Math.hypot(s2.x - c.A.x, s2.y - c.A.y);
          if ((s2.owner === c.owner && fromA < 40) || fromA < 12) continue;
          const dq = Math.hypot(s2.x - q.x, s2.y - q.y);
          if (dq < sc) sc = dq;
        }
      }
      sc = Math.min(sc, 28) + c.pref + len * 0.02;
      if (!best || sc > best.sc) best = { sc, A: c.A, C, E, len, parent: c.parent };
    }
    if (!best) continue;

    const { A, C, E, len } = best;
    const limb: Limb = { birth: B, P0: A, P1: C, P2: E, len, f, index: i, parent: best.parent ? best.parent.index : -1, childBirths: [] };
    best.parent?.childBirths.push(B);
    limbs.push(limb);
    for (let u = 0; u <= 1.001; u += 0.05) samples.push({ ...qPoint(A, C, E, u), owner: 'L' + i });
    events[B] = `Yeni dal (${i + 1}. dal) ve ilk yaprağı` + (B >= 20 ? ' · Gövde kalınlaştı' : '');

    // Uç yaprağı, büyüyen dalın ucuyla birlikte ilerler
    {
      const tipA = qAngle(A, C, E, 1), ang = tipA + rnd(-0.2, 0.2), L2 = rnd(18, 22);
      centers.push({ x: E.x + Math.cos(ang) * L2 * 0.6, y: E.y + Math.sin(ang) * L2 * 0.6 });
      addLeaf({ birth: B, host: { type: 'limbTip', i }, rel: ang - tipA, len: L2, ...tone(), back: false, delay: 0.35 });
    }

    pattern.forEach((type, ix) => {
      const k = ix + 1, tMax = 0.45 + (0.55 * k) / 9, book = B + k;

      if (type === 'L') {
        let bl: { sc: number; t: number; rel: number; L2: number; ctr: Pt } | null = null;
        for (let tr = 0; tr < 26; tr++) {
          const t = rnd(0.16, tMax - 0.03), P = qPoint(A, C, E, t), tg = qAngle(A, C, E, t);
          let rel = (R() < 0.5 ? 1 : -1) * rnd(0.65, 1.15);
          if (Math.sin(tg + rel) > 0.5) rel = -rel;
          const ang = tg + rel, L2 = rnd(16, 22);
          const ctr = { x: P.x + Math.cos(ang) * (L2 * 0.55 + 3), y: P.y + Math.sin(ang) * (L2 * 0.55 + 3) };
          const sc = minDist(ctr) - (ellipseValue(ctr) > 1.1 ? 40 : 0);
          if (!bl || sc > bl.sc) bl = { sc, t, rel, L2, ctr };
        }
        if (!bl) return;
        centers.push(bl.ctr);
        addLeaf({ birth: book, host: { type: 'limb', i, t: bl.t }, rel: bl.rel, len: bl.L2, ...tone() });
        events[book] = 'Dala yeni yaprak';
        return;
      }

      const nLeaves = type === 'T3' ? 3 : 2;
      let bt: { sc: number; P0: Pt; P1: Pt; P2: Pt } | null = null;
      for (let tr = 0; tr < 22; tr++) {
        const t = rnd(0.22, tMax - 0.05), P = qPoint(A, C, E, t), tg = qAngle(A, C, E, t);
        let rel = (R() < 0.5 ? 1 : -1) * rnd(0.55, 0.95);
        if (Math.sin(tg + rel) > 0.3) rel = -rel;
        const ang = tg + rel, lt = rnd(22, 38) * (0.8 + len / 420);
        const dd = { x: Math.cos(ang), y: Math.sin(ang) }, nn = { x: -dd.y, y: dd.x }, j = rnd(-0.15, 0.15) * lt;
        const P1 = { x: P.x + dd.x * lt * 0.5 + nn.x * j, y: P.y + dd.y * lt * 0.5 + nn.y * j };
        const P2 = { x: P.x + dd.x * lt, y: P.y + dd.y * lt };
        let sc = 1e9;
        for (let u = 0.35; u <= 1.001; u += 0.13) {
          const q = qPoint(P, P1, P2, u);
          for (const s2 of samples) {
            if (s2.owner === 'L' + i) continue;
            const dq = Math.hypot(s2.x - q.x, s2.y - q.y);
            if (dq < sc) sc = dq;
          }
        }
        sc = Math.min(sc, 30) + Math.min(minDist(P2), 30) * 0.6 - (ellipseValue(P2) > 1.04 ? 50 : 0);
        if (!bt || sc > bt.sc) bt = { sc, P0: P, P1, P2 };
      }
      if (!bt) return;
      const twig = bt;
      const j = twigs.length;
      twigs.push({ birth: book, limb: i, P0: twig.P0, P1: twig.P1, P2: twig.P2 });
      for (let u = 0.2; u <= 1.001; u += 0.2) samples.push({ ...qPoint(twig.P0, twig.P1, twig.P2, u), owner: 'T' + j });

      {
        const tg = qAngle(twig.P0, twig.P1, twig.P2, 1), rel = rnd(-0.25, 0.25), L2 = rnd(15, 20), ang = tg + rel;
        centers.push({ x: twig.P2.x + Math.cos(ang) * L2 * 0.6, y: twig.P2.y + Math.sin(ang) * L2 * 0.6 });
        addLeaf({ birth: book, host: { type: 'twigTip', j }, rel, len: L2, ...tone(), delay: 0.3 });
      }
      for (let m = 1; m < nLeaves; m++) {
        let bl: { sc: number; u: number; rel: number; L2: number; ctr: Pt } | null = null;
        for (let tr = 0; tr < 14; tr++) {
          const u = rnd(0.4, 0.85), P = qPoint(twig.P0, twig.P1, twig.P2, u), tg = qAngle(twig.P0, twig.P1, twig.P2, u);
          let rel = (m % 2 ? 1 : -1) * rnd(0.6, 1);
          if (Math.sin(tg + rel) > 0.55) rel = -rel;
          const L2 = rnd(13, 18), ang = tg + rel;
          const ctr = { x: P.x + Math.cos(ang) * (L2 * 0.55 + 2), y: P.y + Math.sin(ang) * (L2 * 0.55 + 2) };
          const sc = minDist(ctr) - (ellipseValue(ctr) > 1.12 ? 40 : 0);
          if (!bl || sc > bl.sc) bl = { sc, u, rel, L2, ctr };
        }
        if (!bl) continue;
        centers.push(bl.ctr);
        addLeaf({ birth: book, host: { type: 'twig', j, u: bl.u }, rel: bl.rel, len: bl.L2, ...tone(), delay: 0.3 + m * 0.15 });
      }
      events[book] = `Yeni dalcık ve ${nLeaves} yaprak`;
    });
  }

  /* --- 200: taç tamamlanır --- */
  addLeaf({ birth: CROWN_BOOKS, host: { type: 'trunkTip' }, rel: 0, len: 22, color: PALETTE[0][0], colorDark: PALETTE[0][1], alpha: 1, back: false });
  events[CROWN_BOOKS] = 'Taç tamamlandı';

  /* --- 201–300: kökler, önce ana kökler sonra uçlar --- */
  type RootDraft = Omit<Root, 'birth'> & { order: number };
  const drafts: RootDraft[] = [];
  const addRoot = (P0: Pt, ang: number, len: number, w0: number, depth: number) => {
    const d = { x: Math.cos(ang), y: Math.sin(ang) }, n = { x: -d.y, y: d.x };
    const j1 = rnd(-0.14, 0.14) * len, j2 = rnd(-0.14, 0.14) * len;
    const P1 = { x: P0.x + d.x * len * 0.33 + n.x * j1, y: P0.y + d.y * len * 0.33 + n.y * j1 };
    const P2 = { x: P0.x + d.x * len * 0.66 + n.x * j2, y: P0.y + d.y * len * 0.66 + n.y * j2 + len * 0.05 };
    const P3 = { x: P0.x + d.x * len, y: P0.y + d.y * len + len * 0.18 };
    drafts.push({ P0, P1, P2, P3, w0, depth, order: R() });
    if (depth >= 3) return;
    const kids = depth === 0 ? 3 : 2;
    for (let k = 0; k < kids; k++) {
      const t = lerp(0.3, 0.8, (k + rnd(0.1, 0.9)) / kids), Q = cPoint(P0, P1, P2, P3, t);
      const base = Math.atan2(P3.y - P0.y, P3.x - P0.x), side = k % 2 ? 1 : -1;
      addRoot(Q, base + side * rnd(0.4, 0.8), len * rnd(0.45, 0.62), w0 * (1 - t * 0.6) * 0.75, depth + 1);
    }
  };
  const mains = 7;
  for (let k = 0; k < mains; k++) {
    const deg = lerp(-84, 84, k / (mains - 1)) + rnd(-4, 4), rad = (deg * Math.PI) / 180;
    addRoot({ x: TRUNK_X + Math.sin(rad) * 8, y: GROUND_Y - 3 }, Math.PI / 2 - rad, rnd(110, 140) * (0.72 + (0.28 * Math.abs(deg)) / 84), 6.5, 0);
  }
  drafts.sort((a, b) => a.depth - b.depth || a.order - b.order);
  drafts.slice(0, ROOT_COUNT).forEach((r, k) => {
    const birth = CROWN_BOOKS + 1 + k;
    roots.push({ P0: r.P0, P1: r.P1, P2: r.P2, P3: r.P3, w0: r.w0, depth: r.depth, birth });
    events[birth] = r.depth === 0 ? 'Yeni ana kök' : 'Köke yeni bir uç';
  });

  return { seed, limbs, twigs, leaves, roots, events };
}
