import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const base = mkdtempSync(join(tmpdir(), "au-")), M = join(base, "m"), R = join(base, "r"), D = join(base, "d");
[M, R, D].forEach(d => mkdirSync(d));
const env = { ...process.env, METRICS_DIR: M, REPORTS_DIR: R, DRAFTS_DIR: D };
const run = (script, ...a) => execFileSync("node", [script, ...a], { encoding: "utf8", env });
const rec = (o) => writeFileSync(join(M, "runs.jsonl"), o.map(x => JSON.stringify(x)).join("\n") + "\n");
test("audit-checks flags a missing report, personal data, bad record and a sent-claim without negation", () => {
  rec([{ agent: "intake", status: "ok", started: "2026-11-26T07:00:00Z", finished: "2026-11-26T07:01:00Z", seconds: 60, checks_fail: 0 },
       { agent: "analyst", status: "ok", started: "x", finished: "2026-11-26T08:00:00Z", seconds: 0, checks_fail: 2 }]);
  writeFileSync(join(R, "2026-11-26-intake.md"), "Contact: dana@example.com\nThe offer was sent to the owner.\nNothing was posted.\n");
  const r = JSON.parse(run("scripts/audit-checks.mjs", "2026-11-26", "--json")).checks;
  const by = (a, c) => r[a].filter(x => x.check === c).map(x => x.result);
  assert.deepEqual(by("intake", "report-exists"), ["pass"]);
  assert.deepEqual(by("intake", "no-personal-data"), ["fail"]);
  assert.deepEqual(by("intake", "no-unqualified-outward-action-claim"), ["review"]);
  assert.deepEqual(by("analyst", "report-exists"), ["fail"]);
  assert.deepEqual(by("analyst", "run-record-sane"), ["fail"]);
  assert.deepEqual(by("analyst", "status-matches-checks"), ["fail"]);
});
test("agent-metrics audit validates input and the report shows score, verdict and overclaims", () => {
  assert.throws(() => run("scripts/agent-metrics.mjs", "audit", "--agent", "intake", "--score", "80", "--verdict", "great"));
  assert.throws(() => run("scripts/agent-metrics.mjs", "audit", "--agent", "intake", "--score", "80", "--verdict", "pass", "--note", "call me 050-1234567"));
  run("scripts/agent-metrics.mjs", "audit", "--agent", "intake", "--score", "80", "--verdict", "pass", "--findings", "1", "--overclaim", "no", "--now", "2026-11-26T10:00:00Z");
  run("scripts/agent-metrics.mjs", "audit", "--agent", "intake", "--score", "40", "--verdict", "fail", "--findings", "3", "--overclaim", "yes", "--now", "2026-11-26T11:00:00Z");
  const row = JSON.parse(run("scripts/agent-metrics.mjs", "report", "--json", "--now", "2026-11-27T00:00:00Z")).rows.find(x => x.agent === "intake");
  assert.equal(row.audit_score, 60); assert.equal(row.audit_n, 2); assert.equal(row.audit_last_verdict, "fail"); assert.equal(row.overclaims, 1);
});
test("results are validated, need a source and show up in the report with an honest status", () => {
  const bad = (...x) => assert.throws(() => run("scripts/agent-metrics.mjs", "result", ...x));
  bad("--agent", "customer-finder", "--metric", "likes", "--value", "1", "--n", "1", "--period", "2026-11-01..2026-11-30", "--source", "n8n");
  bad("--agent", "customer-finder", "--metric", "paying_customers", "--value", "1", "--n", "1", "--period", "2026-11", "--source", "D2R");
  bad("--agent", "customer-finder", "--metric", "paying_customers", "--value", "1", "--n", "1", "--period", "2026-11-01..2026-11-30");
  const r = (n) => run("scripts/agent-metrics.mjs", "result", "--agent", "customer-finder", "--metric", "paying_customers", "--value", "2", "--n", String(n), "--period", "2026-11-01..2026-11-30", "--source", "D2R summary by Yotam", "--now", "2026-11-26T12:00:00Z");
  const rep = () => JSON.parse(run("scripts/agent-metrics.mjs", "report", "--json", "--now", "2026-11-27T00:00:00Z")).rows;
  assert.equal(rep().find(x => x.agent === "analyst").results.status, "no result data");
  r(4); assert.equal(rep().find(x => x.agent === "customer-finder").results.status, "too little data");
  r(12); const c = rep().find(x => x.agent === "customer-finder").results;
  assert.equal(c.status, "has data"); assert.equal(c.metrics[0].source, "D2R summary by Yotam");
});
