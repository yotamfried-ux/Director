#!/usr/bin/env node
// Measures the agents so we are never blind. Append-only logs (no personal data), one report.
//   record  --agent <id> --status ok|partial|failed [--started ISO] [--finished ISO] [--outputs N]
//           [--checks-pass N --checks-fail N] [--quality 0-100] [--note "<=200 chars"]
//   outcome --agent <id> --item <key> --result approved|edited|rejected|published [--edit-ratio 0-1]   (Yotam's verdicts: the ground truth)
//   audit   --agent <id> --score 0-100 --verdict pass|concerns|fail --findings N [--overclaim yes|no] [--note "<=200 chars"]   (independent auditor's judgement of an agent's outputs)
//   result  --agent <id> --metric <id from agents/results-spec.json> --value N --n N --period YYYY-MM-DD..YYYY-MM-DD --source "<where the number comes from>" [--baseline N]   (real-world result, aggregate only)
//   report  [--days 28] [--now ISO] [--json]
// Files: business/metrics/runs.jsonl, business/metrics/outcomes.jsonl (override dir with METRICS_DIR). Contains no names, contacts or listing text.
import { readFileSync, appendFileSync, existsSync, mkdirSync } from "node:fs";
const dir = process.env.METRICS_DIR ?? "business/metrics";
const [cmd, ...rest] = process.argv.slice(2), a = {};
for (let i = 0; i < rest.length; i++) if (rest[i].startsWith("--")) a[rest[i].slice(2)] = rest[i + 1]?.startsWith("--") || rest[i + 1] == null ? true : rest[++i];
const reg = JSON.parse(readFileSync("agents/registry.json", "utf8")).agents;
const load = f => existsSync(`${dir}/${f}`) ? readFileSync(`${dir}/${f}`, "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l)) : [];
const append = (f, o) => { mkdirSync(dir, { recursive: true }); appendFileSync(`${dir}/${f}`, JSON.stringify(o) + "\n"); };
const fail = m => { console.error(m); process.exit(2); };
const num = (k, lo, hi) => { if (a[k] == null) return undefined; const v = Number(a[k]); if (!Number.isFinite(v) || v < lo || v > hi) fail(`--${k} must be ${lo}..${hi}`); return v; };
if (cmd === "record") {
  if (!reg.some(x => x.id === a.agent)) fail("unknown agent id");
  if (!["ok", "partial", "failed"].includes(a.status)) fail("--status ok|partial|failed");
  const note = a.note === true ? "" : String(a.note ?? "");
  if (note.length > 200 || /[\w.+-]+@[\w-]+\.\w+|\+?\d[\d\s-]{8,}/.test(note)) fail("note: max 200 chars and no emails or phone numbers");
  const finished = a.finished ?? new Date().toISOString(), started = a.started ?? finished;
  append("runs.jsonl", { agent: a.agent, status: a.status, started, finished, seconds: Math.max(0, Math.round((Date.parse(finished) - Date.parse(started)) / 1000)), outputs: num("outputs", 0, 1e6), checks_pass: num("checks-pass", 0, 1e6), checks_fail: num("checks-fail", 0, 1e6), quality: num("quality", 0, 100), note });
  console.log("recorded");
} else if (cmd === "outcome") {
  if (!reg.some(x => x.id === a.agent)) fail("unknown agent id");
  if (!["approved", "edited", "rejected", "published"].includes(a.result)) fail("--result approved|edited|rejected|published");
  append("outcomes.jsonl", { agent: a.agent, item: String(a.item ?? fail("--item required")), result: a.result, edit_ratio: num("edit-ratio", 0, 1), at: a.now ?? new Date().toISOString() });
  console.log("recorded");
} else if (cmd === "audit") {
  if (!reg.some(x => x.id === a.agent)) fail("unknown agent id");
  if (!["pass", "concerns", "fail"].includes(a.verdict)) fail("--verdict pass|concerns|fail");
  if (a.overclaim != null && !["yes", "no"].includes(a.overclaim)) fail("--overclaim yes|no");
  const note = a.note === true ? "" : String(a.note ?? "");
  if (note.length > 200 || /[\w.+-]+@[\w-]+\.\w+|\+?\d[\d\s-]{8,}/.test(note)) fail("note: max 200 chars and no emails or phone numbers");
  append("audits.jsonl", { agent: a.agent, score: num("score", 0, 100) ?? fail("--score required"), verdict: a.verdict, findings: num("findings", 0, 1e6) ?? 0, overclaim: a.overclaim ?? null, note, at: a.now ?? new Date().toISOString() });
  console.log("recorded");
} else if (cmd === "result") {
  const spec = JSON.parse(readFileSync("agents/results-spec.json", "utf8")).agents[a.agent];
  if (!spec) fail("agent has no entry in agents/results-spec.json");
  if (!spec.metrics.some(m => m.id === a.metric)) fail(`--metric must be one of: ${spec.metrics.map(m => m.id).join(", ")}`);
  if (!/^\d{4}-\d{2}-\d{2}\.\.\d{4}-\d{2}-\d{2}$/.test(String(a.period))) fail("--period YYYY-MM-DD..YYYY-MM-DD");
  const source = a.source === true ? "" : String(a.source ?? "");
  if (source.length < 3 || source.length > 200 || /[\w.+-]+@[\w-]+\.\w+|\+?\d[\d\s-]{8,}/.test(source)) fail("--source required (3-200 chars, no emails or phone numbers)");
  append("results.jsonl", { agent: a.agent, metric: a.metric, value: num("value", -1e12, 1e12) ?? fail("--value required"), n: num("n", 0, 1e9) ?? fail("--n required"), period: a.period, baseline: num("baseline", -1e12, 1e12) ?? null, source, at: a.now ?? new Date().toISOString() });
  console.log("recorded");
} else if (cmd === "report") {
  const now = Date.parse(a.now ?? new Date().toISOString()), days = Number(a.days ?? 28), since = now - days * 864e5;
  const runs = load("runs.jsonl").filter(r => Date.parse(r.finished) >= since), outs = load("outcomes.jsonl").filter(o => Date.parse(o.at) >= since), auds = load("audits.jsonl").filter(o => Date.parse(o.at) >= since), ress = load("results.jsonl"), rspec = JSON.parse(readFileSync("agents/results-spec.json", "utf8")).agents;
  const med = xs => { if (!xs.length) return null; const s = [...xs].sort((p, q) => p - q), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
  const mean = xs => xs.length ? Math.round(xs.reduce((p, q) => p + q, 0) / xs.length * 10) / 10 : null;
  const rows = reg.map(g => {
    const r = runs.filter(x => x.agent === g.id).sort((p, q) => p.finished.localeCompare(q.finished)), o = outs.filter(x => x.agent === g.id);
    const last = r.at(-1), hours = last ? (now - Date.parse(last.finished)) / 36e5 : null;
    let health = "no-heartbeat-defined";
    if (g.heartbeat_hours) health = !last ? "NEVER-RAN" : hours > g.heartbeat_hours ? `SILENT ${Math.round(hours)}h (limit ${g.heartbeat_hours}h)` : r.slice(-3).length === 3 && r.slice(-3).every(x => x.status === "failed") ? "FAILING (3 in a row)" : "ok";
    const decided = o, good = o.filter(x => ["approved", "published"].includes(x.result)).length;
    const cp = r.reduce((s, x) => s + (x.checks_pass ?? 0), 0), cf = r.reduce((s, x) => s + (x.checks_fail ?? 0), 0);
    const q = r.map(x => x.quality).filter(x => x != null), au = auds.filter(x => x.agent === g.id).sort((p, q) => p.at.localeCompare(q.at));
    return { agent: g.id, health, status: g.status, runs: r.length, ok_rate: r.length ? Math.round(100 * r.filter(x => x.status === "ok").length / r.length) : null, median_seconds: med(r.map(x => x.seconds)), outputs: r.reduce((s, x) => s + (x.outputs ?? 0), 0), check_pass_rate: cp + cf ? Math.round(100 * cp / (cp + cf)) : null, quality_mean: mean(q), quality_n: q.length, audit_score: mean(au.map(x => x.score)), audit_n: au.length, audit_last_verdict: au.at(-1)?.verdict ?? null, overclaims: au.filter(x => x.overclaim === "yes").length, results: (() => { const sp = rspec[g.id], mine = ress.filter(x => x.agent === g.id), latest = {}; for (const x of mine) if (!latest[x.metric] || x.at >= latest[x.metric].at) latest[x.metric] = x; const nmax = Math.max(0, ...Object.values(latest).map(x => x.n)); return { judged_by: sp?.judged_by ?? null, min_n: sp?.min_n ?? null, metrics: Object.values(latest).map(x => ({ metric: x.metric, value: x.value, n: x.n, baseline: x.baseline, period: x.period, source: x.source })), status: !mine.length ? "no result data" : nmax < (sp?.min_n ?? 5) ? "too little data" : "has data" }; })(), verdicts: decided.length, approval_rate: decided.length ? Math.round(100 * good / decided.length) : null, median_edit_ratio: med(o.map(x => x.edit_ratio).filter(x => x != null)), enough_data: r.length >= 5 && decided.length >= 5 };
  });
  if (a.json) { console.log(JSON.stringify({ window_days: days, rows }, null, 2)); process.exit(0); }
  console.log(`window ${days}d, now ${new Date(now).toISOString()}`);
  for (const x of rows) console.log(`${x.agent.padEnd(16)} ${String(x.status).padEnd(9)} ${x.health.padEnd(28)} runs=${x.runs} ok=${x.ok_rate ?? "-"}% checks=${x.check_pass_rate ?? "-"}% quality=${x.quality_mean ?? "-"}(n=${x.quality_n}) audit=${x.audit_score ?? "-"}(n=${x.audit_n}${x.overclaims ? `, overclaims=${x.overclaims}` : ""}) results=${x.results.status} approved=${x.approval_rate ?? "-"}%(n=${x.verdicts}) ${x.enough_data ? "" : "[too little data to judge]"}`);
} else fail("usage: agent-metrics.mjs record --agent ID --status ok|partial|failed --started ISO --finished ISO [--outputs N --checks-pass N --checks-fail N --quality N --note TEXT] | outcome --agent ID --item KEY --result approved|edited|rejected|published [--edit-ratio 0-1] | result --agent ID --metric ID --value N --n N --period A..B --source TEXT [--baseline N] | audit --agent ID --score 0-100 --verdict pass|concerns|fail --findings N [--overclaim yes|no] [--note TEXT] | report [--days 28] [--json]");
