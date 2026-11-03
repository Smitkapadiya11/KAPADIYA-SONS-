import assert from "node:assert/strict";
import fs from "node:fs";
import { offers, offerSchema, booking } from "../offers.js";
const expected = {
  "lions-cut": 19999,
  architect: null,
  apartments: null,
  "avatar-demo": null,
  "cats-cut": 25999,
  monster: 49999,
  fox: 29999,
  arijit: 50999,
  director: 251999,
};
assert.deepEqual(
  Object.fromEntries(offers.map((o) => [o.id, o.price])),
  expected,
);
assert.equal(offerSchema()["@graph"].length, 6);
for (const o of offers) {
  const u = new URL(booking(o));
  assert.equal(u.hostname, "wa.me");
  assert.equal(u.pathname, "/917575807403");
  assert.ok(u.searchParams.get("text").includes(o.name));
  assert.ok(!u.searchParams.get("text").includes("Diwali"));
}
const html = fs.readFileSync("dist/index.html", "utf8");
assert.ok(
  !/Diwali|__OFFERS__|__PAGE_TITLE__|__DESCRIPTION__|__TERMS__|__OFFER_SCHEMA__/.test(
    html,
  ),
);
assert.ok(html.includes("https://pinyoursite-kapadiya.vercel.app"));
assert.equal((html.match(/class="plan /g) || []).length, 9);
for (const m of html.matchAll(
  /(?:src|poster|href)="(\/[^"#?]+)(?:[?#][^"]*)?"/g,
)) {
  const path = "dist" + m[1];
  assert.ok(fs.existsSync(path), "Missing main asset: " + path);
}
for (const name of ["ugc-latest", "ugc-captioned", "ugc-story"]) {
  assert.ok(
    fs.statSync("public/media/" + name + ".mp4").size < 50 * 1024 * 1024,
  );
  assert.ok(fs.statSync("public/media/" + name + ".webp").size > 1000);
}
const plots = JSON.parse(fs.readFileSync("pinyoursite/plots.json"));
assert.equal(plots.length, 63);
assert.equal(new Set(plots.map((p) => p.id)).size, 63);
assert.ok(
  plots.every(
    (p) =>
      p.area > 0 &&
      p.points.split(" ").length >= 4 &&
      ["available", "hold", "sold"].includes(p.status),
  ),
);
assert.equal(plots.filter((p) => p.area / 9 >= 200).length, 3);
for (let i = 1; i <= 14; i++)
  assert.ok(
    fs.existsSync(
      "pinyoursite/public/gallery/" + String(i).padStart(2, "0") + ".webp",
    ),
  );
assert.ok(
  fs
    .readFileSync("pinyoursite/public/pinyoursite-demo.pdf")
    .subarray(0, 5)
    .toString() === "%PDF-",
);
console.log(
  "PASS: 9 packages; 6 structured prices; WhatsApp CTAs; no seasonal copy; all built assets; 3 compressed videos; 63 unique plots; 14 gallery images; brochure.",
);
