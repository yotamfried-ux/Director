import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const OPP_FILE = join(mkdtempSync(join(tmpdir(), "op-")), "o.json");
const run = (...a) => execFileSync("node", ["scripts/opportunity-audit.mjs", ...a], { encoding: "utf8", env: { ...process.env, OPP_FILE }, stdio: ["ignore", "pipe", "pipe"] });
const ev = (s, u) => ({ source: s, url: u, seen_on: "2026-11-26" });
const opp = (id, o = {}) => JSON.stringify({ id, title: "t " + id, solution: "s", kind: "explicit", evidence_level: 3, evidence: [ev("a", "https://a/1"), ev("b", "https://b/1")], ...o });
test("registers as UNVERIFIED and rejects bad input and personal data", () => {
  assert.throws(() => run("add", "--json", opp("x", { kind: "maybe" })));
  assert.throws(() => run("add", "--json", opp("x", { evidence: [{ source: "a" }] })));
  assert.throws(() => run("add", "--json", opp("x", { title: "call dana@example.com" })));
  assert.match(run("add", "--json", opp("o1")), /UNVERIFIED/);
  assert.throws(() => run("add", "--json", opp("o1")));
});
test("VERIFIED needs level 2+, two independent sources and a real reason; unverified items never appear as opportunities", () => {
  run("add", "--json", opp("o2", { evidence: [ev("a", "https://a/2")] }));
  assert.throws(() => run("audit", "--id", "o2", "--status", "VERIFIED", "--reason", "looked fine to me ok"));
  assert.throws(() => run("audit", "--id", "o1", "--status", "VERIFIED", "--reason", "short"));
  assert.throws(() => run("audit", "--id", "o1", "--status", "GREAT", "--reason", "long enough reason here"));
  run("audit", "--id", "o1", "--status", "VERIFIED", "--reason", "both listings open and dated this week, budgets match");
  run("audit", "--id", "o2", "--status", "NEEDS_RESEARCH", "--reason", "single source only, needs a second independent one", "--gap-type", "verification");
  const b = run("board");
  assert.match(b.split("## Not verified")[0], /o1/); assert.doesNotMatch(b.split("## Not verified")[0], /o2/);
  assert.match(b.split("## Not verified")[1], /o2: NEEDS_RESEARCH/);
});
test("inferred needs are labelled, reopen is only for fixable statuses, gaps and stats are computed", () => {
  run("add", "--json", opp("o3", { kind: "inferred", found_by: "auditor" }));
  run("audit", "--id", "o3", "--status", "VERIFIED", "--reason", "two sources show repeated manual work, no request");
  assert.match(run("board"), /o3 \[level 3, INFERRED need, not a customer request\]/);
  assert.throws(() => run("reopen", "--id", "o3", "--note", "x"));
  assert.match(run("reopen", "--id", "o2", "--note", "added a second source"), /round 1/);
  run("audit", "--id", "o2", "--status", "NEEDS_CORRECTION", "--reason", "second source is older than 120 days", "--gap-type", "verification");
  assert.match(run("gaps"), /verification: 2.*recurring/);
  const s = JSON.parse(run("stats"));
  assert.equal(s.verified, 2); assert.equal(s.needs_work, 1); assert.equal(s.missed_found_by_audit, 1); assert.equal(s.inferred_share, 33);
});
