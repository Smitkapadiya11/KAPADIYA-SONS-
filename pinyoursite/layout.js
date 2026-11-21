import { vertices } from "./geometry.js";

// Plan pixels to metres: the plan is drawn at about 0.46 ft per pixel.
export const S = 0.1402;
export const toWorld = (x, y) => ({ x: (x - 960) * S, z: (y - 540) * S });

// Road centre lines in plan pixels, used to find which edge of a plot faces a road.
const ROADS = [
  { key: "road.internal", a: [455, 394], b: [1205, 394], half: 26 },
  { key: "road.internal", a: [425, 669], b: [1345, 669], half: 26 },
  { key: "road.west", a: [430.5, 193], b: [349, 887], half: 54 },
  { key: "road.east", a: [1191.5, 193], b: [1543, 887], half: 80 },
];
function segmentDistance(p, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const t = Math.max(0, Math.min(1, ((p.x - a[0]) * dx + (p.y - a[1]) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(p.x - a[0] - t * dx, p.y - a[1] - t * dy);
}

export const DESIGNS = ["a", "b", "c", "d"];

export function plotLayout(plot) {
  const pts = vertices(plot);
  let best = { gap: Infinity };
  pts.forEach((a, i) => {
    const b = pts[(i + 1) % pts.length], mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    for (const r of ROADS) {
      const gap = segmentDistance(mid, r.a, r.b) - r.half;
      if (gap < best.gap) best = { gap, a, b, road: r.key };
    }
  });
  const world = pts.map((p) => toWorld(p.x, p.y));
  const centre = world.reduce((s, p) => ({ x: s.x + p.x / world.length, z: s.z + p.z / world.length }), { x: 0, z: 0 });
  const A = toWorld(best.a.x, best.a.y), B = toWorld(best.b.x, best.b.y);
  const width = Math.hypot(B.x - A.x, B.z - A.z);
  // Outward normal of the road edge (pointing from the plot towards the road).
  let nx = -(B.z - A.z) / width, nz = (B.x - A.x) / width;
  const mx = (A.x + B.x) / 2, mz = (A.z + B.z) / 2;
  if (nx * (mx - centre.x) + nz * (mz - centre.z) < 0) { nx = -nx; nz = -nz; }
  const depth = (plot.area * 0.092903) / width;
  return {
    id: plot.id,
    world,
    centre,
    front: { x: nx, z: nz },
    width,
    depth,
    road: best.road,
    design: DESIGNS[(plot.id * 5 + (plot.id >> 2)) % 4],
  };
}
