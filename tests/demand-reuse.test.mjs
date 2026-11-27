import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const dir = mkdtempSync(join(tmpdir(), "dr-"));
const put = (n, v) => { const p = join(dir, n); writeFileSync(p, JSON.stringify(v)); return p; };
const L = i => ({ id: `l${i}`, source: i % 2 ? "s1" : "s2", seen_on: "2026-11-20", region: "IL", category: "automation", tags: ["n8n", "whatsapp", "google-sheets"], poster_ref: `p${i}` });
const listings = put("l.json", [L(1), L(2), L(3)]);
const assets = put("a.json", { assets: [
  { id: "strong", category: "automation", capabilities: ["n8n", "whatsapp", "google-sheets", "email"], reuse_hours_saved: 10, confirmed: true },
  { id: "partial", category: "fullstack", capabilities: ["n8n", "calendar"], reuse_hours_saved: null, confirmed: false },
  { id: "unrelated", category: "etl", capabilities: ["sql"], confirmed: true }] });
const run = (...x) => JSON.parse(execFileSync("node", ["scripts/demand-reuse.mjs", listings, assets, ...x, "--json"], { encoding: "utf8" })).clusters[0];
test("ranks existing assets by how much of the demanded work they already cover and lists the gap", () => {
  const c = run();
  assert.equal(c.best.asset, "strong"); assert.equal(c.best.level, "strong"); assert.deepEqual(c.best.missing_to_build, []);
  assert.equal(c.others[0].asset, "partial"); assert.equal(c.others[0].level, "weak"); assert.deepEqual(c.others[0].missing_to_build.sort(), ["google-sheets", "whatsapp"]);
  assert.ok(![c.best, ...c.others].some(m => m.asset === "unrelated"));
});
test("hours with reuse only appear when Yotam supplied both numbers", () => {
  assert.equal(run().best.hours, null);
  const key = JSON.parse(execFileSync("node", ["scripts/demand-analyze.mjs", listings, "--json"], { encoding: "utf8" })).clusters[0].key;
  const effort = put("e.json", { hourly_value: null, clusters: { [key]: { first_build_hours: 30, repeat_build_hours: 5 } } });
  const h = run(effort).best.hours;
  assert.deepEqual(h, { first_build_from_scratch: 30, reuse_hours_saved: 10, first_build_with_reuse: 20 });
  assert.equal(run(effort).others[0].hours, null);
});
