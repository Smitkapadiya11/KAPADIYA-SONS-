import assert from "node:assert/strict";
import fs from "node:fs";
import { dimensions, fitView, plotView } from "../pinyoursite/geometry.js";
const plots = JSON.parse(fs.readFileSync("pinyoursite/plots.json"));
const p = plots.find((p) => p.id === 24),
  dims = dimensions(p);
assert.equal(dims[0].length.toFixed(2), "50.94");
assert.equal(dims[1].length.toFixed(2), "20.19");
for (const p of plots) {
  const d = dimensions(p);
  assert.ok(d.every((s) => Number.isFinite(s.length) && s.length > 0));
}
for (const [w, h] of [
  [360, 800],
  [390, 844],
  [768, 1024],
  [1440, 900],
]) {
  const f = fitView(w, h);
  assert.ok(f.k > 0);
  assert.ok(Math.abs(f.x + 960 * f.k - w / 2) < 0.001);
  for (const p of plots) {
    const v = plotView(p, w, h);
    assert.ok(v.k >= 2 && v.k <= 8);
    assert.ok(Number.isFinite(v.x) && Number.isFinite(v.y));
    assert.ok(
      Math.abs(v.x + p.x * v.k - (w - (w < 1024 ? 0 : 360)) / 2) < 0.001,
    );
  }
}
console.log(
  "PASS: 63 plot dimensions; reference Plot 24 dimensions; desktop/mobile fit and selected-plot framing.",
);
