import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const dir = mkdtempSync(join(tmpdir(), "ds-"));
const put = (n, v) => { const p = join(dir, n); writeFileSync(p, JSON.stringify(v)); return p; };
const L = (i, src, extra = {}) => ({ id: `l${i}`, source: src, poster_ref: `p${i}`, need: "appointments-by-messages", ...extra });
const listings = put("l.json", [
  L(1, "a", { signals: ["existing-spend", "time-loss"], matched_phrases: ["appointments-by-messages"] }),
  L(2, "b", { signals: ["time-loss"], matched_phrases: ["appointments-by-messages"] }),
  L(3, "a", {}), L(4, "c", { need: "manual-reporting", signals: [] }), L(5, "c", { need: "nonexistent" })]);
const bank = put("b.json", { phrases: [{ id: "appointments-by-messages" }, { id: "unused" }], need_patterns: [
  { id: "appointments-by-messages", label: "x", tags: ["booking", "whatsapp", "calendar"] }, { id: "manual-reporting", label: "y", tags: ["dashboard", "etl"] }] });
const assets = put("a.json", { assets: [{ id: "tori", confirmed: true, capabilities: ["booking", "calendar", "email"] }] });
const run = () => JSON.parse(execFileSync("node", ["scripts/demand-signals.mjs", listings, bank, assets, "--json"], { encoding: "utf8" }));
test("evidence and recurrence set the priority; the best base and action follow", () => {
  const n = run().needs.find(x => x.need === "appointments-by-messages");
  assert.equal(n.distinct_posters, 3); assert.equal(n.recurring, true);
  assert.equal(n.score, 3 + 2 + 3); assert.equal(n.priority, "high");
  assert.equal(n.best_base.asset, "tori"); assert.deepEqual(n.best_base.missing, ["whatsapp"]);
  assert.equal(n.action, "prepare-offer-draft"); assert.equal(n.evidence_level, 3); assert.equal(n.request_kind, "explicit");
});
test("no evidence stays low and is only watched; unknown ids and unused phrases are reported", () => {
  const r = run(); const m = r.needs.find(x => x.need === "manual-reporting");
  assert.equal(m.priority, "low"); assert.equal(m.action, "watch");
  assert.deepEqual(r.unknown_need_ids, ["l5"]);
  assert.deepEqual(r.phrase_yield.find(p => p.id === "unused"), { id: "unused", listings: 0, with_signal: 0 });
  assert.deepEqual(r.phrase_yield.find(p => p.id === "appointments-by-messages"), { id: "appointments-by-messages", listings: 2, with_signal: 2 });
});
