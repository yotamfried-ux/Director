#!/usr/bin/env node
// Development loop for agents: run on the benchmark -> grade against the absolute standard -> improve charter/skills from DEV failures -> repeat.
// prepare --agent <id> --task dev|holdout   write blinded fixtures + answer key (the agent under test never sees the key)
// grade   --agent <id> --task <t> --judge <judge.json> [--var k=v ...] [--charter-change "<what changed>"]   score one run vs the standard
// status  --agent <id>                      REACHED | CONTINUE (with dev failures to fix) | STALLED | MAX_ITERATIONS | STANDARD_CHANGED
// Guards: the standard (rubric, fixtures, target) is hashed; if it changes the history is invalid. Hints come from DEV only; holdout shows pass/fail only.
import fs from 'node:fs'; import path from 'node:path'; import crypto from 'node:crypto'; import { spawnSync } from 'node:child_process';
const ROOT = process.env.LOOP_ROOT || process.cwd(); const rel = (...p) => path.join(ROOT, ...p);
const args = process.argv.slice(2); const cmd = args.shift();
const opt = (k, d) => { const i = args.indexOf('--' + k); return i < 0 ? d : args[i + 1]; };
const all = k => args.flatMap((a, i) => a === '--' + k ? [args[i + 1]] : []);
const die = m => { console.error(m); process.exit(2); };
const agent = opt('agent'); if (!agent) die('--agent required');
const stdPath = rel('agents/benchmarks', agent, 'standard.json'); if (!fs.existsSync(stdPath)) die('no standard for ' + agent);
const std = JSON.parse(fs.readFileSync(stdPath, 'utf8'));
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const fixtureFiles = (std.tasks || []).flatMap(t => t.fixtures || []).sort();
const standardHash = () => sha(fs.readFileSync(stdPath) + fixtureFiles.map(f => fs.existsSync(rel(f)) ? fs.readFileSync(rel(f)) : 'MISSING').join('|'));
const charterHash = () => sha(fs.readFileSync(rel('agents/charters', agent + '.json')));
const LOG = rel('business/metrics/agent-loop.jsonl');
const readLog = () => fs.existsSync(LOG) ? fs.readFileSync(LOG, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l)).filter(r => r.agent === agent) : [];
const MAX_ITER = 8, STALL = 3;

function strip(o, key) {
  if (Array.isArray(o)) return o.map(x => strip(x, key));
  if (o && typeof o === 'object') { const r = {}; for (const [k, v] of Object.entries(o)) { if (k === '_trap' || k === 'note' || k === '_about') { if (v) key.push(v); continue; } r[k] = strip(v, key); } return r; }
  return o;
}
function evaluate(rubric, scores) {
  const max = rubric.length * 5, total = rubric.reduce((a, i) => a + (scores?.[i.id] ?? 0), 0);
  const gatingLow = rubric.filter(i => i.gating && (scores?.[i.id] ?? 0) < std.target.min_gating).map(i => i.id);
  const lowItems = rubric.filter(i => (scores?.[i.id] ?? 0) < 4).map(i => i.id);
  return { total, max, pct: Math.round(total / max * 100), gatingLow, lowItems };
}

if (cmd === 'prepare') {
  const t = (std.tasks || []).find(x => x.id === opt('task')); if (!t) die('unknown task');
  const out = rel('business/benchmarks', agent, 'loop', t.id); fs.mkdirSync(path.join(out, 'input'), { recursive: true });
  const key = [];
  for (const f of t.fixtures || []) { const j = JSON.parse(fs.readFileSync(rel(f), 'utf8')); fs.writeFileSync(path.join(out, 'input', path.basename(f)), JSON.stringify(strip(j, key), null, 2)); }
  fs.writeFileSync(path.join(out, 'key.json'), JSON.stringify({ planted: key }, null, 2));
  fs.writeFileSync(path.join(out, 'task.txt'), t.prompt);
  console.log(`prepared ${t.id}: input in business/benchmarks/${agent}/loop/${t.id}/input (answer key withheld in key.json: do not give it to the agent)`);
} else if (cmd === 'grade') {
  const t = (std.tasks || []).find(x => x.id === opt('task')); if (!t) die('unknown task');
  const judge = JSON.parse(fs.readFileSync(opt('judge'), 'utf8')); const vars = Object.fromEntries(all('var').map(s => [s.split('=')[0], s.slice(s.indexOf('=') + 1)]));
  const ev = evaluate(std.rubric, judge.scores);
  const checks = (std.checks || []).map(c => { const r = spawnSync('bash', ['-c', c.cmd.replace(/\{(\w+)\}/g, (m, k) => vars[k] ?? m)], { cwd: ROOT, encoding: 'utf8' }); return { id: c.id, pass: r.status === 0 }; });
  const checksOk = checks.every(c => c.pass);
  const pass = ev.pct >= std.target.min_total_pct && !ev.gatingLow.length && checksOk;
  const log = readLog(); const rec = { ts: new Date().toISOString(), agent, task: t.id, iteration: log.length + 1, standard_hash: standardHash(), charter_hash: charterHash(), charter_change: opt('charter-change') ?? null, pct: ev.pct, gating_low: ev.gatingLow, low_items: ev.lowItems, checks, pass, notes: judge.notes ?? '' };
  fs.mkdirSync(path.dirname(LOG), { recursive: true }); fs.appendFileSync(LOG, JSON.stringify(rec) + '\n');
  console.log(`${t.id}: ${ev.pct}% (target ${std.target.min_total_pct}%), gating low: ${ev.gatingLow.join(',') || 'none'}, checks ${checks.filter(c => c.pass).length}/${checks.length} -> ${pass ? 'PASS' : 'FAIL'}`);
} else if (cmd === 'status') {
  const log = readLog(); const h = standardHash();
  if (log.some(r => r.standard_hash !== h)) { console.log('STANDARD_CHANGED: rubric/fixtures/target changed since earlier runs; history is not comparable. Start a new series and tell Yotam.'); process.exit(1); }
  const need = std.target.consecutive_runs;
  // a "round" = a dev run followed by a holdout run
  const rounds = []; let cur = {}; for (const r of log) { cur[r.task] = r; if (r.task === 'holdout') { rounds.push(cur); cur = {}; } }
  const passed = rounds.map(r => r.dev?.pass && r.holdout?.pass);
  const tail = passed.slice(-need);
  if (rounds.length >= need && tail.length === need && tail.every(Boolean)) { console.log(`REACHED: ${need} consecutive rounds passed on dev and holdout`); process.exit(0); }
  if (rounds.length >= MAX_ITER) { console.log(`MAX_ITERATIONS (${MAX_ITER}): stop and show Yotam the history; the standard or the design may be wrong`); process.exit(1); }
  const best = rounds.map(r => (r.dev?.pct ?? 0)); const stalled = best.length >= STALL && Math.max(...best.slice(-(STALL - 1))) <= best.at(-STALL);
  if (stalled) { console.log(`STALLED: no dev improvement in ${STALL} rounds. Stop editing; escalate to Yotam with the history.`); process.exit(1); }
  const lastDev = [...log].reverse().find(r => r.task === 'dev'), lastHold = [...log].reverse().find(r => r.task === 'holdout');
  console.log(`CONTINUE (rounds so far: ${rounds.length}/${MAX_ITER})`);
  if (lastDev && !lastDev.pass) console.log(`fix from DEV: gating low [${lastDev.gating_low.join(', ') || 'none'}], items below 4 [${lastDev.low_items.join(', ') || 'none'}], failed checks [${lastDev.checks.filter(c => !c.pass).map(c => c.id).join(', ') || 'none'}], dev ${lastDev.pct}%`);
  if (lastHold) console.log(`holdout: ${lastHold.pass ? 'PASS' : 'FAIL'} (${lastHold.pct}%; details withheld so fixes generalise instead of fitting the test)`);
  console.log('rules: change the charter/skills/playbook only; never the standard, fixtures or judge; log the change with --charter-change on the next grade.');
} else die('usage: agent-loop.mjs prepare|grade|status --agent <id>');
