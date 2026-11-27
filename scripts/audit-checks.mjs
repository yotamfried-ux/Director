#!/usr/bin/env node
// Deterministic, evidence-only audit of what the agents left behind. No judgement here: each check is pass / fail / review with its evidence.
// Usage: node scripts/audit-checks.mjs [YYYY-MM-DD] [--json]     (default: today, UTC)
// Env: METRICS_DIR (default business/metrics), REPORTS_DIR (business/reports), DRAFTS_DIR (business/social/drafts)
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
const date = process.argv.slice(2).find(a => /^\d{4}-\d{2}-\d{2}$/.test(a)) ?? new Date().toISOString().slice(0, 10);
const M = process.env.METRICS_DIR ?? "business/metrics", R = process.env.REPORTS_DIR ?? "business/reports", D = process.env.DRAFTS_DIR ?? "business/social/drafts";
const reg = JSON.parse(readFileSync("agents/registry.json", "utf8")).agents;
const runs = existsSync(`${M}/runs.jsonl`) ? readFileSync(`${M}/runs.jsonl`, "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l)).filter(r => r.finished?.startsWith(date)) : [];
const files = d => existsSync(d) ? readdirSync(d).filter(f => statSync(`${d}/${f}`).isFile()).map(f => `${d}/${f}`) : [];
const PII = /[\w.+-]+@[\w-]+\.\w{2,}|(?:\+972|0)(?:5\d|[2-9])[-\s]?\d{3}[-\s]?\d{4}/;
const ACTION = /(נשלח|פורסם|שלחתי|פרסמתי|\bsent\b|\bposted\b|\bpublished\b)/i, NEG = /(לא |אין |בלי|never|not |no |nothing|n't|draft|טיוטה|would|היה|ממתין|awaiting|pending)/i;
const out = {};
for (const g of reg) {
  const rs = runs.filter(r => r.agent === g.id); if (!rs.length) continue;
  const res = out[g.id] = [];
  const add = (check, result, evidence) => res.push({ check, result, evidence });
  for (const r of rs) {
    const span = Math.round((Date.parse(r.finished) - Date.parse(r.started)) / 1000);
    add("time-consistent", Number.isFinite(span) && (Math.abs(span - r.seconds) <= 2 || /harness-measured/.test(r.note ?? "")) ? "pass" : "review", `started->finished=${span}s, seconds=${r.seconds}`);
    add("run-record-sane", r.seconds >= 1 && r.seconds <= 3600 ? "pass" : "fail", `status=${r.status} seconds=${r.seconds}`);
    add("status-matches-checks", !(r.status === "ok" && (r.checks_fail ?? 0) > 0) ? "pass" : "fail", `status=${r.status} checks_fail=${r.checks_fail ?? "n/a"}`);
  }
  const rep = (g.writes ?? []).map(w => w.replace(/\s*\(.*\)\s*$/, "")).find(w => w.includes("<date>")), prefix = rep && rep.split("/").at(-1).replace("<date>", date).split("<")[0].replace(/\.md$/, "");
  const rdir = rep ? (rep.startsWith("business/reports/") ? R : rep.split("/").slice(0, -1).join("/")) : R;
  const mine = prefix ? files(rdir).filter(f => f.split("/").at(-1).startsWith(prefix)) : [];
  if (!mine.length && rs.some(r => r.status === "ok" && !(r.outputs > 0))) add("ok-run-without-output", "review", "status ok but no report and no outputs counted");
  if (prefix) add("report-exists", mine.length ? "pass" : (g.id === "lead-followup" ? "review" : "fail"), mine.length ? mine.join(", ") : `no file starting ${rdir}/${prefix}`);
  for (const f of mine) {
    const t = readFileSync(f, "utf8");
    add("no-personal-data", PII.test(t) ? "fail" : "pass", f);
    const st = (t.match(/^\W*status:?\W*(ok|partial|failed)\b/im) ?? [])[1];
    if (st) add("report-status-matches-record", rs.some(r => r.status === st) ? "pass" : "fail", `report says ${st}, record says ${rs.map(r => r.status).join("/")}`);
    const hits = t.split("\n").filter(l => ACTION.test(l) && !NEG.test(l)).slice(0, 3);
    add("no-unqualified-outward-action-claim", hits.length ? "review" : "pass", hits.map(h => h.slice(0, 120)).join(" | ") || f);
  }
}
if (out["marketing"]) for (const dir of existsSync(D) ? readdirSync(D).filter(d => d.startsWith(date)) : []) for (const f of files(`${D}/${dir}`)) {
  const t = readFileSync(f, "utf8"), slug = (t.match(/^product:\s*(\S+)/m) ?? [])[1] ?? f.split("/").at(-1).split("-")[0], st = (t.match(/^status:\s*(\S+)/m) ?? [])[1];
  let lint = "n/a"; try { lint = execFileSync("node", ["scripts/content-lint.mjs", f, "--product", slug], { encoding: "utf8" }).trim().split("\n").at(-1); } catch (e) { lint = `FAILED: ${(e.stdout ?? "").toString().trim().split("\n").at(-1)}`; }
  out["marketing"].push({ check: "draft-is-draft", result: st === "draft" ? "pass" : "fail", evidence: `${f} status=${st}` });
  out["marketing"].push({ check: "draft-lint", result: /FAILED/.test(lint) ? "fail" : "pass", evidence: `${f}: ${lint}` });
  out["marketing"].push({ check: "draft-no-personal-data", result: PII.test(t) ? "fail" : "pass", evidence: f });
}
// Agent Shell: every recorded agent run of the day must have a finished shell record with all required stages.
{
  const SR = "business/metrics/shell-runs.jsonl";
  const rec = existsSync(SR) ? readFileSync(SR, "utf8").split("\n").filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean) : [];
  const RR = "business/metrics/runs.jsonl";
  const runs = existsSync(RR) ? readFileSync(RR, "utf8").split("\n").filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean) : [];
  for (const r of runs.filter(x => String(x.finished ?? x.ts ?? "").startsWith(date))) {
    const sh = rec.filter(x => x.agent === r.agent && String(x.finished ?? x.ts ?? "").startsWith(date));
    (out[r.agent] ??= []).push({ check: "ran-inside-shell", result: sh.length ? (sh.some(x => x.status === "ok") ? "pass" : "review") : "review", evidence: sh.length ? `shell runs: ${sh.map(x => `${x.status} ${Math.round(x.compliance ?? 0)}%`).join(", ")}` : "recorded run has no Agent Shell record (ran as free improvisation)" });
  }
}
const summary = Object.fromEntries(Object.entries(out).map(([k, v]) => [k, { pass: v.filter(x => x.result === "pass").length, fail: v.filter(x => x.result === "fail").length, review: v.filter(x => x.result === "review").length }]));
if (process.argv.includes("--json")) { console.log(JSON.stringify({ date, agents_with_runs: Object.keys(out), summary, checks: out }, null, 2)); process.exit(0); }
console.log(`# Audit checks ${date}`);
for (const [k, v] of Object.entries(out)) { console.log(`\n## ${k}  pass=${summary[k].pass} fail=${summary[k].fail} review=${summary[k].review}`); for (const c of v.filter(x => x.result !== "pass")) console.log(`- ${c.result.toUpperCase()} ${c.check}: ${c.evidence}`); }
