#!/usr/bin/env node
// Benchmark: does an agent running inside the Agent Shell beat bare Claude on the same task?
// freeze  --agent <id> --files a,b,c [--process k=v ...]   freeze the bare-Claude baseline (sha256 manifest + local copy)
// verify  --agent <id>                                       check the frozen baseline is unchanged
// score   --agent <id> --side baseline|shell --var k=v ...   run the charter's deterministic checks on that side
// pack    --agent <id> --shell-dir <dir>                     build a blind judge pack (random A/B) + sealed key
// verdict --agent <id> --judge <judge.json> [--yotam win|lose|tie]  compute and record the verdict
// Rules: gating rubric items must not lose; shell must win on total by margin; n=1 is stated as such; Yotam's verdict is the ground truth.
import fs from 'node:fs'; import path from 'node:path'; import crypto from 'node:crypto'; import { spawnSync } from 'node:child_process';
const ROOT = process.env.BENCH_ROOT || process.cwd();
const rel = (...p) => path.join(ROOT, ...p);
const args = process.argv.slice(2); const cmd = args.shift();
const opt = (k, d) => { const i = args.indexOf('--' + k); return i < 0 ? d : args[i + 1]; };
const all = k => args.flatMap((a, i) => a === '--' + k ? [args[i + 1]] : []);
const die = m => { console.error(m); process.exit(2); };
const agent = opt('agent'); if (!agent) die('--agent required');
const charter = JSON.parse(fs.readFileSync(rel('agents/charters', agent + '.json'), 'utf8'));
const bench = charter.benchmark || {};
const specDir = rel('agents/benchmarks', agent), workDir = rel('business/benchmarks', agent);
const sha = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const vars = Object.fromEntries(all('var').map(s => [s.split('=')[0], s.slice(s.indexOf('=') + 1)]));
const fill = (s, v) => s.replace(/\{(\w+)\}/g, (m, k) => v[k] ?? m);
const MARGIN = 1; // shell must beat baseline on rubric total by at least this many points (of 0-5 per item)

if (cmd === 'freeze') {
  const files = (opt('files') || '').split(',').filter(Boolean); if (!files.length) die('--files required');
  const dest = path.join(workDir, 'baseline'); fs.mkdirSync(dest, { recursive: true }); fs.mkdirSync(specDir, { recursive: true });
  const man = { agent, task: bench.task, frozen_at: new Date().toISOString(), files: [], process: Object.fromEntries(all('process').map(s => [s.split('=')[0], s.slice(s.indexOf('=') + 1)])), note: 'bare Claude, no shell, no stages; produced before the shell existed' };
  for (const f of files) { if (!fs.existsSync(f)) die('missing ' + f); const t = path.join(dest, f.replace(/[\\/]/g, '__')); fs.copyFileSync(f, t); man.files.push({ path: f, copy: path.relative(ROOT, t), sha256: sha(f), bytes: fs.statSync(f).size }); }
  fs.writeFileSync(path.join(specDir, 'baseline.json'), JSON.stringify(man, null, 2));
  console.log(`frozen ${man.files.length} files for ${agent}`);
} else if (cmd === 'verify') {
  const man = JSON.parse(fs.readFileSync(path.join(specDir, 'baseline.json'), 'utf8')); let bad = 0;
  for (const f of man.files) { const p = rel(f.copy); if (!fs.existsSync(p) || sha(p) !== f.sha256) { console.log('CHANGED ' + f.path); bad++; } }
  console.log(bad ? `BASELINE TAMPERED (${bad})` : 'baseline intact'); process.exit(bad ? 1 : 0);
} else if (cmd === 'score') {
  const side = opt('side'); if (!['baseline', 'shell'].includes(side)) die('--side baseline|shell');
  const res = [];
  for (const c of bench.checks || []) {
    const cmdline = fill(c.cmd, vars); const r = spawnSync('bash', ['-c', cmdline], { cwd: ROOT, encoding: 'utf8' });
    res.push({ id: c.id, pass: r.status === 0, exit: r.status });
  }
  const pass = res.filter(r => r.pass).length;
  const out = { agent, side, ts: new Date().toISOString(), checks: res, pass, total: res.length };
  fs.mkdirSync(workDir, { recursive: true }); fs.writeFileSync(path.join(workDir, `score-${side}.json`), JSON.stringify(out, null, 2));
  console.log(`${side}: ${pass}/${res.length} deterministic checks passed` + res.filter(r => !r.pass).map(r => ' FAIL:' + r.id).join(''));
} else if (cmd === 'pack') {
  const shellDir = opt('shell-dir'); if (!shellDir) die('--shell-dir required');
  const man = JSON.parse(fs.readFileSync(path.join(specDir, 'baseline.json'), 'utf8'));
  const flip = crypto.randomInt(2) === 1; const A = flip ? 'shell' : 'baseline';
  const pack = { agent, task: bench.task, instructions: 'You have not seen how these were made. Score each candidate 0-5 on every rubric item from the files only. Gating items are marked. Do not guess which is which; if you cannot tell, say so.', rubric: bench.rubric, candidates: { A: A === 'shell' ? shellDir : path.join(workDir, 'baseline'), B: A === 'shell' ? path.join(workDir, 'baseline') : shellDir } };
  fs.mkdirSync(workDir, { recursive: true });
  fs.writeFileSync(path.join(workDir, 'judge-pack.json'), JSON.stringify(pack, null, 2));
  fs.writeFileSync(path.join(workDir, 'key.sealed.json'), JSON.stringify({ A: A, B: A === 'shell' ? 'baseline' : 'shell' }));
  console.log('pack written: business/benchmarks/' + agent + '/judge-pack.json (key sealed; do not read key.sealed.json before the judge returns)');
} else if (cmd === 'verdict') {
  const judge = JSON.parse(fs.readFileSync(opt('judge'), 'utf8')); const key = JSON.parse(fs.readFileSync(path.join(workDir, 'key.sealed.json'), 'utf8'));
  const side = { shell: judge[Object.keys(key).find(k => key[k] === 'shell')], baseline: judge[Object.keys(key).find(k => key[k] === 'baseline')] };
  const items = bench.rubric || []; const tot = s => items.reduce((a, i) => a + (s.scores?.[i.id] ?? 0), 0);
  const gating = items.filter(i => i.gating); const gateLoss = gating.filter(i => (side.shell.scores?.[i.id] ?? 0) < (side.baseline.scores?.[i.id] ?? 0));
  const det = ['baseline', 'shell'].map(s => { try { return JSON.parse(fs.readFileSync(path.join(workDir, `score-${s}.json`), 'utf8')); } catch { return null; } });
  const detLoss = det[0] && det[1] && det[1].pass < det[0].pass;
  const diff = tot(side.shell) - tot(side.baseline);
  const verdict = (gateLoss.length || detLoss) ? 'no-advantage' : diff >= MARGIN ? 'shell-wins' : diff <= -MARGIN ? 'baseline-wins' : 'tie';
  const rec = { ts: new Date().toISOString(), agent, verdict, rubric_total: { shell: tot(side.shell), baseline: tot(side.baseline), max: items.length * 5 }, gating_losses: gateLoss.map(i => i.id), deterministic: { baseline: det[0]?.pass ?? null, shell: det[1]?.pass ?? null }, n: 1, caveat: 'single run per side, LLM judge; Yotam verdict is ground truth', yotam: opt('yotam') ?? null, judge_notes: judge.notes ?? '' };
  fs.mkdirSync(rel('business/metrics'), { recursive: true }); fs.appendFileSync(rel('business/metrics/benchmarks.jsonl'), JSON.stringify(rec) + '\n');
  console.log(JSON.stringify(rec, null, 2));
} else if (cmd === 'blind') {
  // blind --agent <id> --task <t> --a <dir> --b <dir>: neutral, scrubbed copies in a temp dir OUTSIDE the repo; sealed key kept in the repo.
  // Only deliverables are packed (never run folders, stage files, logs). Fails closed if any identifying token survives.
  const os = await import('node:os');
  const dirs = { A: opt('a'), B: opt('b') }; if (!dirs.A || !dirs.B) die('--a and --b required');
  const swap = crypto.randomInt(2) === 1; const src = swap ? { A: dirs.B, B: dirs.A } : dirs;
  const side = swap ? { A: 'b', B: 'a' } : { A: 'a', B: 'b' };
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'judge-')); const leaks = [];
  const TOK = /(agent[- ]shell|\bshell\b|baseline|benchmark|charter|run_id|stage[ -]?\d|bare claude|without the shell|reference|key\.json|agent-(shell|metrics)\.mjs|compliance|learning-log|\bclaude\b|anthropic)/i;
  const SCRUB = [[/business\/benchmarks\/[\w\/.-]+/g, 'input.json'], [/ai-agent-system(-shell|-bench)?/g, 'product'], [/\b20\d{6}\d{6}\b/g, 'RUNID']];
  const removed = [];
  for (const lab of ['A', 'B']) {
    const out = path.join(tmp, lab); fs.mkdirSync(out); let n = { md: 0, json: 0, vid: 0, img: 0, txt: 0 };
    const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
    for (const f of walk(src[lab])) {
      const ext = path.extname(f).toLowerCase(); const base = path.basename(f);
      if (/^(state|events)\.|^\d\d-.*\.md$|learning-log|\.log$/.test(base)) continue; // process files never travel
      if (['.mp4', '.mov', '.webm'].includes(ext)) { const t = path.join(out, `video${++n.vid}.mp4`); const r = spawnSync('ffmpeg', ['-y', '-v', 'error', '-i', f, '-map_metadata', '-1', '-c', 'copy', '-fflags', '+bitexact', '-flags:v', '+bitexact', '-flags:a', '+bitexact', t]); if (r.status !== 0) fs.copyFileSync(f, t); }
      else if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) fs.copyFileSync(f, path.join(out, `image${++n.img}${ext}`));
      else { let txt = fs.readFileSync(f, 'utf8'); for (const [re, rp] of SCRUB) txt = txt.replace(re, rp); txt = txt.split('\n').filter(l => { if (TOK.test(l)) { removed.push(`${lab}: ${l.slice(0, 60)}`); return false; } return true; }).join('\n'); const nm = `${ext === '.json' ? 'data' : 'doc'}${++n[ext === '.json' ? 'json' : 'md']}${ext || '.txt'}`; fs.writeFileSync(path.join(out, nm), txt); if (TOK.test(txt)) leaks.push(`${lab}/${nm}: ${txt.match(TOK)[0]}`); }
    }
    const now = new Date('2026-01-01T00:00:00Z'); for (const f of fs.readdirSync(out)) fs.utimesSync(path.join(out, f), now, now);
  }
  if (leaks.length) { fs.rmSync(tmp, { recursive: true, force: true }); console.error('LEAK, pack refused:\n' + leaks.join('\n')); process.exit(3); }
  fs.mkdirSync(workDir, { recursive: true }); fs.writeFileSync(path.join(workDir, `blind-key-${opt('task', 'x')}.sealed.json`), JSON.stringify({ A: side.A === 'a' ? 'a' : 'b', B: side.B === 'a' ? 'a' : 'b', a: dirs.A, b: dirs.B, lines_removed: removed }));
  console.error(`scrubbed ${removed.length} process-revealing lines (listed in the sealed key; report this to the reader)`); console.log(tmp);
} else die('usage: agent-benchmark.mjs freeze|verify|score|pack|verdict --agent <id>');
