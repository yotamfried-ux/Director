import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const dir = mkdtempSync(join(tmpdir(), "dm-"));
const put = (name, v) => { const p = join(dir, name); writeFileSync(p, JSON.stringify(v)); return p; };
const L = (id, o = {}) => ({ id, source: "s1", url: `https://example.test/${id}`, seen_on: "2026-11-20", region: "IL", category: "automation", tags: ["n8n", "whatsapp"], poster_ref: `p-${id}`, ...o });
const D = put("delivered.json", [{ slug: "bot", category: "automation", tags: ["n8n", "whatsapp"], delivered_on: "2026-11-26", offer: "x" }]);
const S = put("sources.json", { sources: [{ id: "s1" }, { id: "closed", outreach: "forbidden" }] });
const run = (listings, extra = []) => JSON.parse(execFileSync("node", ["scripts/demand-match.mjs", put("l.json", listings), D, "--sources", S, "--today", "2026-11-26", ...extra], { encoding: "utf8" }));

test("matches same category and tags; ignores other kinds of work silently", () => {
  const r = run([L("a"), L("b", { category: "etl" }), L("c", { tags: ["react"] })]);
  assert.deepEqual(r.candidates.map(c => c.listing), ["a"]);
  assert.equal(r.skipped.length, 0);
});
test("skips stale listings, forbidden sources, duplicates and previous offers", () => {
  const ledger = put("ledger.json", [{ poster_ref: "p-old", delivered_slug: "bot", state: "sent" }, { poster_ref: "p-out", delivered_slug: "other", state: "opted_out" }]);
  const r = run([L("fresh"), L("stale", { seen_on: "2026-06-01" }), L("shut", { source: "closed" }), L("dup", { poster_ref: "p-fresh" }), L("old", { poster_ref: "p-old" }), L("out", { poster_ref: "p-out" })].map(l => l.id === "dup" ? { ...l, poster_ref: "p-fresh" } : l).map(l => l.id === "fresh" ? { ...l, poster_ref: "p-fresh" } : l), ["--outreach", ledger]);
  assert.deepEqual(r.candidates.map(c => c.listing), ["fresh"]);
  const why = Object.fromEntries(r.skipped.map(s => [s.listing, s.reasons.join("|")]));
  assert.match(why.stale, /days old/); assert.match(why.shut, /forbid/); assert.match(why.dup, /duplicate/);
  assert.match(why.old, /already offered/); assert.match(why.out, /opted out/);
});
test("candidates never carry a message or personal data, and d2r leads start with no consent", () => {
  const r = run([L("a")]);
  assert.deepEqual(Object.keys(r.candidates[0]).sort(), ["age_days", "channel", "delivered", "listing", "poster_ref", "region", "similarity", "source", "state", "still_needed", "tag_overlap", "url"]);
  const d = run([L("a")], ["--d2r"]).records[0];
  assert.equal(d.type, "lead"); assert.equal(d.consent, "none"); assert.equal(d.status, "new"); assert.equal(d.contact, "https://example.test/a");
});
