import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const run = (...a) => JSON.parse(execFileSync("node", ["scripts/demand-analyze.mjs", ...a, "--json"], { encoding: "utf8" }));
const F = "business/demand/fixtures/demo-listings.json", E = "business/demand/fixtures/demo-effort.json";

test("drops duplicate ids and clusters recurring types", () => {
  const r = run(F, E);
  assert.equal(r.duplicates_dropped, 1);
  const a = r.clusters.find(c => c.key.startsWith("automation:"));
  assert.equal(a.listings, 5); assert.equal(a.distinct_posters, 5);
});
test("budgets are never mixed across currencies and never invented", () => {
  const r = run(F, E);
  const a = r.clusters.find(c => c.key.startsWith("automation:"));
  assert.deepEqual(Object.keys(a.budgets), ["ILS"]);
  assert.equal(a.budgets.ILS.median, 1275); assert.equal(a.budgets.ILS.n, 4);
});
test("ROI uses only supplied effort estimates", () => {
  const r = run(F, E);
  const a = r.clusters.find(c => c.key.startsWith("automation:"));
  assert.equal(a.roi_per_build_hour.ILS.build_hours, 54);   // 30 + 4*6
  assert.equal(a.roi_per_build_hour.ILS.per_hour, 98);       // 5300 / 54
  const c = r.clusters.find(c => c.key.startsWith("fullstack:booking"));
  assert.equal(c.roi_per_build_hour, null); assert.equal(c.effort_estimate, "needs estimate");
  assert.equal(run(F).clusters.every(x => x.roi_per_build_hour === null), true);
});
test("same poster twice counts once", () => {
  const c = run(F, E).clusters.find(c => c.key.startsWith("fullstack:booking"));
  assert.equal(c.listings, 3); assert.equal(c.distinct_posters, 2);
});
test("rejects malformed listings", () => {
  const f = join(mkdtempSync(join(tmpdir(), "dm-")), "bad.json");
  writeFileSync(f, JSON.stringify([{ id: "x" }]));
  const r = spawnSync("node", ["scripts/demand-analyze.mjs", f], { encoding: "utf8" });
  assert.equal(r.status, 2);
});
