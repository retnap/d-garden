// Botanical leaf silhouettes: elongated, pointed-tip blades with a central vein
// and (for some variants) subtle secondary veins. Built from one parametrized
// template so every variant stays consistent while differing in length, width,
// and curvature — never an identical repeated outline.

export type LeafVariant = {
  /** Filled blade silhouette, base at (0,0), tip pointing toward +x. */
  blade: string;
  /** Central vein plus any secondary veins, drawn as one multi-subpath stroke. */
  veins: string;
};

function makeBlade(length: number, width: number, curveBias: number): string {
  const topC1: [number, number] = [length * 0.22, -width * 0.95];
  const topC2: [number, number] = [length * 0.6, -width * curveBias];
  const bottomC1: [number, number] = [length * 0.66, width * 0.3];
  const bottomC2: [number, number] = [length * 0.3, width * 0.6];

  return [
    "M 0 0",
    `C ${topC1[0].toFixed(2)} ${topC1[1].toFixed(2)} ${topC2[0].toFixed(2)} ${topC2[1].toFixed(2)} ${length.toFixed(2)} 0`,
    `C ${bottomC1[0].toFixed(2)} ${bottomC1[1].toFixed(2)} ${bottomC2[0].toFixed(2)} ${bottomC2[1].toFixed(2)} 0 0`,
    "Z",
  ].join(" ");
}

function makeVeins(length: number, withSecondary: boolean): string {
  const mid = `M 1 0 Q ${(length * 0.5).toFixed(2)} ${(length * -0.03).toFixed(2)} ${(length * 0.9).toFixed(2)} 0`;

  if (!withSecondary) return mid;

  const branches = [0.35, 0.55, 0.72].map((t) => {
    const vx = length * t;
    const dx = length * 0.12;
    const dyUp = -width_at(t) * 0.8;
    const dyDown = width_at(t) * 0.6;
    return [
      `M ${vx.toFixed(2)} 0 L ${(vx + dx).toFixed(2)} ${dyUp.toFixed(2)}`,
      `M ${vx.toFixed(2)} 0 L ${(vx + dx).toFixed(2)} ${dyDown.toFixed(2)}`,
    ].join(" ");
  });

  function width_at(t: number) {
    // Rough width envelope matching makeBlade's silhouette, just for vein placement.
    return length * 0.18 * Math.sin(Math.PI * t);
  }

  return [mid, ...branches].join(" ");
}

// Four distinct silhouettes: slim lanceolate, broad ovate, long narrow, and a
// compact rounded-tip variant — each with its own proportions and vein detail.
export const LEAF_VARIANTS: LeafVariant[] = [
  { blade: makeBlade(26, 7.5, 0.55), veins: makeVeins(26, false) },
  { blade: makeBlade(22, 9.5, 0.7), veins: makeVeins(22, true) },
  { blade: makeBlade(29, 6.5, 0.45), veins: makeVeins(29, false) },
  { blade: makeBlade(24, 8.5, 0.6), veins: makeVeins(24, true) },
];

// Forest green, sage, and a medium botanical green — the restrained palette the
// identity calls for. A fourth entry reuses the gradient def for subtle depth.
export const LEAF_FILLS = [
  "#1F5D42",
  "#8FB9A3",
  "#4D8B68",
  "url(#garden-leaf-gradient)",
] as const;
