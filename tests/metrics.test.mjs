import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const dir = mkdtempSync(join(tmpdir(), "met-"));
const env = { ...process.env, METRICS_DIR: dir };
const m = (...a) => spawnSync("node", ["scripts/agent-metrics.mjs", ...a], { encoding: "utf8", env });
const report = now => JSON.parse(m("report", "--json", "--now", now).stdout).rows;
const lint = f => spawnSync("node", ["scripts/content-lint.mjs", f, "--product", "tori", "--json"], { encoding: "utf8" });

test("lint: a traceable clean draft passes, an invented/forbidden one fails the right checks", () => {
  assert.equal(lint("tests/fixtures/draft-good.md").status, 0);
  const bad = lint("tests/fixtures/draft-bad.md");
  assert.equal(bad.status, 1);
  assert.deepEqual(JSON.parse(bad.stdout).hard_failed, ["claim-traceable", "no-forbidden-text", "no-invented-social-proof", "numbers-are-labelled"]);
});
test("record validates input and refuses personal data in notes", () => {
  assert.equal(m("record", "--agent", "nope", "--status", "ok").status, 2);
  assert.equal(m("record", "--agent", "intake", "--status", "ok", "--note", "mail a@b.co").status, 2);
  assert.equal(m("record", "--agent", "intake", "--status", "ok", "--quality", "140").status, 2);
});
test("report: never-ran, silent and failing agents are flagged; healthy ones are not", () => {
  assert.equal(report("2026-12-01T09:00:00Z").find(r => r.agent === "intake").health, "NEVER-RAN");
  m("record", "--agent", "intake", "--status", "ok", "--started", "2026-12-01T05:00:00Z", "--finished", "2026-12-01T05:01:30Z", "--outputs", "3", "--checks-pass", "9", "--checks-fail", "1", "--quality", "80");
  let r = report("2026-12-02T09:00:00Z").find(x => x.agent === "intake");
  assert.equal(r.health, "ok"); assert.equal(r.median_seconds, 90); assert.equal(r.check_pass_rate, 90); assert.equal(r.enough_data, false);
  r = report("2026-12-10T09:00:00Z").find(x => x.agent === "intake");
  assert.match(r.health, /^SILENT/);
  for (let i = 0; i < 3; i++) m("record", "--agent", "analyst", "--status", "failed", "--finished", `2026-12-0${i + 1}T08:00:00Z`);
  assert.equal(report("2026-12-04T09:00:00Z").find(x => x.agent === "analyst").health, "FAILING (3 in a row)");
});
test("outcomes become approval rate and edit ratio", () => {
  for (const [res, er] of [["approved"], ["edited", "0.4"], ["rejected"], ["published"]]) m("outcome", "--agent", "content-planner", "--item", `i-${res}`, "--result", res, ...(er ? ["--edit-ratio", er] : []), "--now", "2026-12-01T10:00:00Z");
  const r = report("2026-12-02T09:00:00Z").find(x => x.agent === "content-planner");
  assert.equal(r.verdicts, 4); assert.equal(r.approval_rate, 50); assert.equal(r.median_edit_ratio, 0.4);
  assert.match(readFileSync(join(dir, "outcomes.jsonl"), "utf8"), /i-rejected/);
});
