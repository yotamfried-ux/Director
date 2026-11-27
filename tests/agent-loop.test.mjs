import test from 'node:test'; import assert from 'node:assert/strict';
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path'; import { spawnSync } from 'node:child_process';
const REPO = process.cwd();
function sb(extra = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'loop-'));
  fs.mkdirSync(path.join(root, 'agents/benchmarks/x/fixtures'), { recursive: true }); fs.mkdirSync(path.join(root, 'agents/charters'), { recursive: true });
  fs.writeFileSync(path.join(root, 'agents/charters/x.json'), '{"v":1}');
  fs.writeFileSync(path.join(root, 'agents/benchmarks/x/fixtures/f.json'), JSON.stringify({ _about: 'planted traps', items: [{ a: 1, _trap: 'dup' }, { a: 2, note: 'planted: pii' }] }));
  const std = { agent: 'x', tasks: [{ id: 'dev', fixtures: ['agents/benchmarks/x/fixtures/f.json'], prompt: 'p' }, { id: 'holdout', fixtures: [], prompt: 'q' }], rubric: [{ id: 'g', gating: true }, { id: 'n' }], checks: [], target: { min_total_pct: 85, min_gating: 4, consecutive_runs: 2 }, ...extra };
  fs.writeFileSync(path.join(root, 'agents/benchmarks/x/standard.json'), JSON.stringify(std));
  const run = (...a) => spawnSync('node', [path.join(REPO, 'scripts/agent-loop.mjs'), ...a, '--agent', 'x'], { cwd: root, env: { ...process.env, LOOP_ROOT: root }, encoding: 'utf8' });
  const judge = (s) => { const f = path.join(root, 'j' + Math.random() + '.json'); fs.writeFileSync(f, JSON.stringify({ scores: s })); return f; };
  return { root, run, judge };
}
test('prepare hides planted traps from the agent input and keeps them in the key', () => {
  const { root, run } = sb(); assert.equal(run('prepare', '--task', 'dev').status, 0);
  const inp = fs.readFileSync(path.join(root, 'business/benchmarks/x/loop/dev/input/f.json'), 'utf8');
  assert.ok(!/trap|planted|dup|pii/.test(inp));
  assert.match(fs.readFileSync(path.join(root, 'business/benchmarks/x/loop/dev/key.json'), 'utf8'), /dup/);
});
test('gating below 4 fails even with a high total', () => {
  const { run, judge } = sb(); const r = run('grade', '--task', 'dev', '--judge', judge({ g: 3, n: 5 }));
  assert.match(r.stdout, /FAIL/);
});
test('REACHED needs two consecutive passing rounds with dev and holdout', () => {
  const { run, judge } = sb(); const good = () => judge({ g: 5, n: 5 });
  run('grade', '--task', 'dev', '--judge', good()); run('grade', '--task', 'holdout', '--judge', good());
  assert.match(run('status').stdout, /CONTINUE/);
  run('grade', '--task', 'dev', '--judge', good()); run('grade', '--task', 'holdout', '--judge', good());
  assert.match(run('status').stdout, /REACHED/);
});
test('holdout failure keeps the loop going and withholds holdout details', () => {
  const { run, judge } = sb(); run('grade', '--task', 'dev', '--judge', judge({ g: 5, n: 5 })); run('grade', '--task', 'holdout', '--judge', judge({ g: 2, n: 5 }));
  const s = run('status').stdout; assert.match(s, /CONTINUE/); assert.match(s, /holdout: FAIL/); assert.ok(!/gating low \[g\]/.test(s.split('holdout')[1] ?? ''));
});
test('changing the standard invalidates history', () => {
  const { root, run, judge } = sb(); run('grade', '--task', 'dev', '--judge', judge({ g: 5, n: 5 }));
  const p = path.join(root, 'agents/benchmarks/x/standard.json'); const s = JSON.parse(fs.readFileSync(p, 'utf8')); s.target.min_total_pct = 50; fs.writeFileSync(p, JSON.stringify(s));
  assert.match(run('status').stdout, /STANDARD_CHANGED/);
});
test('stalled dev scores stop the loop', () => {
  const { run, judge } = sb({ target: { min_total_pct: 95, min_gating: 4, consecutive_runs: 2 } });
  for (let i = 0; i < 3; i++) { run('grade', '--task', 'dev', '--judge', judge({ g: 4, n: 3 })); run('grade', '--task', 'holdout', '--judge', judge({ g: 4, n: 3 })); }
  assert.match(run('status').stdout, /STALLED/);
});
