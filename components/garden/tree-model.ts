// Pure, deterministic geometry and growth model for the D-Garden reading tree.
// Nothing here depends on React — it only maps a verified-book count to shapes.

export const MAX_BOOKS = 200;
export const LEAVES_PER_BRANCH = 20;
export const BRANCH_COUNT = 10;

export type Point = readonly [number, number];

export type BranchDefinition = {
  id: string;
  /** Point on (or just inside) the trunk silhouette where the branch originates. */
  start: Point;
  /** Quadratic Bezier control point. */
  control: Point;
  /** Branch tip. */
  end: Point;
  /** Silhouette width where the branch meets the trunk. */
  baseWidth: number;
  /** Silhouette width at the tip. */
  tipWidth: number;
  /** Base leaf scale for leaves growing on this branch (outer branches carry smaller leaves). */
  leafScale: number;
  /** Fraction of the curve (0-1) where the first/last leaf sit, so leaves don't crowd the trunk or overshoot the tip. */
  leafSpan: readonly [number, number];
};

export type TreeStage = {
  label: string;
  minBooks: number;
};

const STAGES: TreeStage[] = [
  { label: "Tohum", minBooks: 0 },
  { label: "Filiz", minBooks: 1 },
  { label: "Fidan", minBooks: 21 },
  { label: "Genç Ağaç", minBooks: 41 },
  { label: "Gelişen Ağaç", minBooks: 61 },
  { label: "Güçlü Ağaç", minBooks: 101 },
  { label: "Olgun Ağaç", minBooks: 141 },
  { label: "Bilge Ağaç", minBooks: 181 },
];

/** Clamps arbitrary input (negative, decimal, NaN, Infinity, ...) to a safe 0-200 integer. */
export function clampBooks(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(MAX_BOOKS, Math.max(0, Math.floor(value)));
}

/** Clamps arbitrary input to a safe non-negative integer, with no upper bound (for raw book counts past 200). */
export function clampRawBooks(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.floor(value));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function getTreeStage(books: number): string {
  let label = STAGES[0].label;
  for (const stage of STAGES) {
    if (books >= stage.minBooks) {
      label = stage.label;
    }
  }
  return label;
}

export function getActiveBranchCount(books: number): number {
  return Math.min(BRANCH_COUNT, Math.ceil(books / LEAVES_PER_BRANCH));
}

export function isBranchVisible(branchIndex: number, books: number): boolean {
  return books > branchIndex * LEAVES_PER_BRANCH;
}

export function getLeafCountForBranch(branchIndex: number, books: number): number {
  return Math.min(
    LEAVES_PER_BRANCH,
    Math.max(0, books - branchIndex * LEAVES_PER_BRANCH),
  );
}

/**
 * Branches appear in the order lower branches grow first, then progressively
 * higher ones — mirroring how a real tree's older growth sits lower on the trunk.
 * Order matches the spec's 1-20 / 21-40 / ... 181-200 table exactly.
 */
export const BRANCHES: BranchDefinition[] = [
  {
    id: "left-lower",
    start: [148, 222],
    control: [106, 206],
    end: [71, 164],
    baseWidth: 9,
    tipWidth: 3,
    leafScale: 1,
    leafSpan: [0.22, 0.97],
  },
  {
    id: "right-lower",
    start: [153, 213],
    control: [197, 199],
    end: [228, 155],
    baseWidth: 8.4,
    tipWidth: 2.8,
    leafScale: 0.98,
    leafSpan: [0.2, 0.96],
  },
  {
    id: "center",
    start: [150, 189],
    control: [145, 149],
    end: [151, 103],
    baseWidth: 7,
    tipWidth: 2.4,
    leafScale: 0.92,
    leafSpan: [0.22, 0.97],
  },
  {
    id: "left-upper",
    start: [147, 175],
    control: [115, 148],
    end: [95, 114],
    baseWidth: 6.4,
    tipWidth: 2.2,
    leafScale: 0.9,
    leafSpan: [0.18, 0.96],
  },
  {
    id: "right-upper",
    start: [154, 167],
    control: [183, 141],
    end: [207, 102],
    baseWidth: 6.1,
    tipWidth: 2.1,
    leafScale: 0.88,
    leafSpan: [0.18, 0.96],
  },
  {
    id: "left-middle",
    start: [145, 199],
    control: [99, 192],
    end: [63, 197],
    baseWidth: 5.6,
    tipWidth: 2,
    leafScale: 0.84,
    leafSpan: [0.2, 0.96],
  },
  {
    id: "right-middle",
    start: [157, 190],
    control: [206, 182],
    end: [239, 171],
    baseWidth: 5.3,
    tipWidth: 1.9,
    leafScale: 0.82,
    leafSpan: [0.2, 0.96],
  },
  {
    id: "center-upper",
    start: [150, 145],
    control: [155, 111],
    end: [148, 73],
    baseWidth: 4.8,
    tipWidth: 1.7,
    leafScale: 0.78,
    leafSpan: [0.2, 0.97],
  },
  {
    id: "left-top",
    start: [142, 127],
    control: [120, 103],
    end: [107, 75],
    baseWidth: 4.1,
    tipWidth: 1.5,
    leafScale: 0.74,
    leafSpan: [0.18, 0.97],
  },
  {
    id: "right-top",
    start: [158, 117],
    control: [180, 95],
    end: [194, 65],
    baseWidth: 3.9,
    tipWidth: 1.4,
    leafScale: 0.72,
    leafSpan: [0.18, 0.97],
  },
];

/** Discrete trunk-thickening tiers — "slightly thicker", not a continuous scale-up. */
export function getTrunkWidthScale(books: number): number {
  if (books <= 0) return 1;
  if (books <= 40) return 0.92;
  if (books <= 100) return 1;
  if (books <= 160) return 1.08;
  return 1.16;
}

/** Subtle, secondary, stage-based size nudge — branches/leaves remain the primary growth signal. */
export function getCanopyScale(books: number): number {
  if (books <= 0) return 0.92;
  if (books <= 60) return 0.94;
  if (books <= 140) return 0.97;
  return 1;
}

function quadraticPoint(p0: Point, p1: Point, p2: Point, t: number): Point {
  const mt = 1 - t;
  const x = mt * mt * p0[0] + 2 * mt * t * p1[0] + t * t * p2[0];
  const y = mt * mt * p0[1] + 2 * mt * t * p1[1] + t * t * p2[1];
  return [x, y];
}

function quadraticTangent(p0: Point, p1: Point, p2: Point, t: number): Point {
  const mt = 1 - t;
  const dx = 2 * mt * (p1[0] - p0[0]) + 2 * t * (p2[0] - p1[0]);
  const dy = 2 * mt * (p1[1] - p0[1]) + 2 * t * (p2[1] - p1[1]);
  return [dx, dy];
}

/** Deterministic pseudo-random value in [0, 1) — a pure function of the integer seed. */
export function hash(seed: number): number {
  const s = Math.sin(seed * 12.9898) * 43758.5453;
  return s - Math.floor(s);
}

/**
 * Builds a tapered, filled branch silhouette instead of a uniform-width stroke.
 * `endT` (0-1) draws only the first portion of the branch's curve, so a branch
 * that is still growing stops short of its final tip rather than appearing at
 * full length the instant it becomes visible. Width tapering still follows the
 * branch's true (global) position along the curve, so a partially-grown branch
 * reads as a young version of the full branch rather than a stubby clone of it.
 */
export function buildBranchPath(branch: BranchDefinition, endT: number = 1): string {
  const clampedEnd = clamp(endT, 0.03, 1);
  const samples = 10;
  const top: Point[] = [];
  const bottom: Point[] = [];

  for (let i = 0; i <= samples; i += 1) {
    const t = (i / samples) * clampedEnd;
    const [x, y] = quadraticPoint(branch.start, branch.control, branch.end, t);
    const [tx, ty] = quadraticTangent(branch.start, branch.control, branch.end, t);
    const len = Math.sqrt(tx * tx + ty * ty) || 1;
    const nx = -ty / len;
    const ny = tx / len;
    const width = (branch.baseWidth * (1 - t) + branch.tipWidth * t) / 2;

    top.push([x + nx * width, y + ny * width]);
    bottom.push([x - nx * width, y - ny * width]);
  }

  const topPath = top.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  const bottomPath = bottom
    .slice()
    .reverse()
    .map(([x, y]) => `L${x.toFixed(2)},${y.toFixed(2)}`)
    .join(" ");

  return `${topPath} ${bottomPath} Z`;
}

export type LeafPlacement = {
  x: number;
  y: number;
  angle: number;
  scale: number;
  colorIndex: number;
  variantIndex: number;
};

/**
 * Places leaf `leafIndex` (0-19) along `branch`'s actual curve (not its straight
 * chord), offset to the branch edge and angled from the local tangent so leaves
 * read as attached to the branch rather than scattered near it.
 */
export function getLeafPlacement(
  branch: BranchDefinition,
  branchIndex: number,
  leafIndex: number,
  globalIndex: number,
): LeafPlacement {
  const [spanStart, spanEnd] = branch.leafSpan;
  const t = spanStart + ((spanEnd - spanStart) * leafIndex) / (LEAVES_PER_BRANCH - 1);

  const [x, y] = quadraticPoint(branch.start, branch.control, branch.end, t);
  const [tx, ty] = quadraticTangent(branch.start, branch.control, branch.end, t);
  const tangentLen = Math.sqrt(tx * tx + ty * ty) || 1;
  const nx = -ty / tangentLen;
  const ny = tx / tangentLen;

  const side = leafIndex % 2 === 0 ? 1 : -1;
  const branchHalfWidth = (branch.baseWidth * (1 - t) + branch.tipWidth * t) / 2;
  const jitter = hash(globalIndex * 7.13 + branchIndex * 3.7);
  // Leaves fan further from the branch line as they sit closer to the tip,
  // so foliage reads as a full rounded canopy rather than a thin feather
  // hugging each branch's own curve.
  const offset = branchHalfWidth + 6 + t * 15 + jitter * 8;

  const anchorX = x + nx * offset * side;
  const anchorY = y + ny * offset * side;

  const tangentAngleDeg = (Math.atan2(ty, tx) * 180) / Math.PI;
  const spreadJitter = hash(globalIndex * 4.31 + 11) * 24 - 12;
  const angle = tangentAngleDeg + side * (68 + spreadJitter);

  const sizeJitter = hash(globalIndex * 9.17 + 5);
  const scale = branch.leafScale * (0.82 + sizeJitter * 0.3);

  const colorIndex = Math.floor(hash(globalIndex * 17.3 + branchIndex * 31.1) * 3.999);
  const variantIndex = Math.floor(hash(globalIndex * 53.7 + 7.9) * 3.999);

  return { x: anchorX, y: anchorY, angle, scale, colorIndex, variantIndex };
}

/* =========================================================================
 * Trunk
 * ========================================================================= */

/** Ground line all trunk, root and seed geometry is anchored to. */
export const GROUND_Y = 332;
export const TRUNK_BASE: Point = [150, GROUND_Y];
const TRUNK_TOP_Y = 140;
const TRUNK_BASE_HALF_WIDTH = 15;
const TRUNK_TOP_HALF_WIDTH = 4.5;

/**
 * Tapered trunk silhouette from the ground to where the canopy's primary
 * branches take over. A gentle S-lean (deterministic, not random) keeps it
 * from reading as a rigid triangle.
 */
export function buildTrunkPath(widthScale: number): string {
  const samples = 14;
  const left: Point[] = [];
  const right: Point[] = [];

  for (let i = 0; i <= samples; i += 1) {
    const t = i / samples;
    const bend = 5 * Math.sin(t * Math.PI) - 2.5 * Math.sin(t * Math.PI * 2);
    const x = TRUNK_BASE[0] + bend;
    const y = TRUNK_BASE[1] + (TRUNK_TOP_Y - TRUNK_BASE[1]) * t;
    const halfWidth = (TRUNK_BASE_HALF_WIDTH * (1 - t) + TRUNK_TOP_HALF_WIDTH * t) * widthScale;

    left.push([x - halfWidth, y]);
    right.push([x + halfWidth, y]);
  }

  const leftPath = left.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  const rightPath = right
    .slice()
    .reverse()
    .map(([x, y]) => `L${x.toFixed(2)},${y.toFixed(2)}`)
    .join(" ");

  return `${leftPath} ${rightPath} Z`;
}

/** A subtle bark-grain line following the trunk's own lean, for depth without extra silhouettes. */
export function buildTrunkGrainPath(): string {
  const samples = 10;
  const points: Point[] = [];

  for (let i = 0; i <= samples; i += 1) {
    const t = i / samples;
    const bend = 5 * Math.sin(t * Math.PI) - 2.5 * Math.sin(t * Math.PI * 2);
    const x = TRUNK_BASE[0] + bend;
    const y = TRUNK_BASE[1] - 8 + (TRUNK_TOP_Y - TRUNK_BASE[1] + 8) * t;
    points.push([x, y]);
  }

  return points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
}

/* =========================================================================
 * Roots — revealed gradually once books exceeds MAX_BOOKS (200)
 * ========================================================================= */

export type RootDefinition = {
  id: string;
  d: string;
  forkD?: string;
  width: number;
};

const ROOT_COUNT_MAX = 12;
const ROOT_BOOKS_PER_STEP = 8;

export const ROOTS: RootDefinition[] = Array.from({ length: ROOT_COUNT_MAX }, (_, i) => {
  const side = i % 2 === 0 ? -1 : 1;
  const row = Math.floor(i / 2);
  const jitter = hash(i * 5.41 + 2.3);

  const startX = TRUNK_BASE[0] + side * (3 + row * 2.1);
  const startY = GROUND_Y - 3;
  const bendX = startX + side * (9 + (i % 3) * 4);
  const bendY = GROUND_Y + 9;
  const spread = 19 + row * 10 + jitter * 6;
  const endX = TRUNK_BASE[0] + side * spread;
  const endY = GROUND_Y + 13 + (row % 3) * 8 + jitter * 4;

  const d = [
    `M ${startX.toFixed(2)} ${startY.toFixed(2)}`,
    `C ${(startX + side * 2).toFixed(2)} ${(startY + 9).toFixed(2)}, ${bendX.toFixed(2)} ${bendY.toFixed(2)}, ${bendX.toFixed(2)} ${(bendY + 5).toFixed(2)}`,
    `S ${(endX - side * 3).toFixed(2)} ${(endY - 5).toFixed(2)}, ${endX.toFixed(2)} ${endY.toFixed(2)}`,
  ].join(" ");

  let forkD: string | undefined;
  if (row < 2) {
    const forkStartT = 0.55;
    const forkStartX = bendX + (endX - bendX) * forkStartT;
    const forkStartY = bendY + (endY - bendY) * forkStartT;
    const forkJitter = hash(i * 9.77 + 4.1);
    const forkEndX = forkStartX + side * (8 + forkJitter * 5);
    const forkEndY = forkStartY + 10 + forkJitter * 5;

    forkD = [
      `M ${forkStartX.toFixed(2)} ${forkStartY.toFixed(2)}`,
      `Q ${(forkStartX + side * 4).toFixed(2)} ${(forkStartY + 6).toFixed(2)}, ${forkEndX.toFixed(2)} ${forkEndY.toFixed(2)}`,
    ].join(" ");
  }

  return {
    id: `root-${i}`,
    d,
    forkD,
    width: Math.max(0.7, 2.4 - row * 0.16),
  };
});

/** Roots stay hidden through 200 books, then reveal gradually, a few more every few books read. */
export function getVisibleRootCount(rawBooks: number): number {
  if (rawBooks <= MAX_BOOKS) return 0;
  return Math.min(ROOT_COUNT_MAX, Math.ceil((rawBooks - MAX_BOOKS) / ROOT_BOOKS_PER_STEP));
}
