import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';
import { spawnSync } from 'node:child_process';
const REPO = process.cwd();
function sb(rubric, checks = []) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bench-'));
  fs.mkdirSync(path.join(root, 'agents/charters'), { recursive: true });
  fs.writeFileSync(path.join(root, 'agents/charters/x.json'), JSON.stringify({ id: 'x', benchmark: { task: 't', checks, rubric } }));
  fs.writeFileSync(path.join(root, 'base.txt'), 'baseline output');
  const run = (...a) => spawnSync('node', [path.join(REPO, 'scripts/agent-benchmark.mjs'), ...a, '--agent', 'x'], { cwd: root, env: { ...process.env, BENCH_ROOT: root }, encoding: 'utf8' });
  return { root, run };
}
const R = [{ id: 'g', q: 'gating', gating: true }, { id: 'n', q: 'normal' }];
function judged(root, shellScores, baseScores) {
  const key = JSON.parse(fs.readFileSync(path.join(root, 'business/benchmarks/x/key.sealed.json'), 'utf8'));
  const j = {}; for (const k of Object.keys(key)) j[k] = { scores: key[k] === 'shell' ? shellScores : baseScores };
  const f = path.join(root, 'judge.json'); fs.writeFileSync(f, JSON.stringify(j)); return f;
}
test('freeze + verify detects tampering', () => {
  const { root, run } = sb(R);
  assert.equal(run('freeze', '--files', 'base.txt').status, 0);
  assert.equal(run('verify').status, 0);
  fs.writeFileSync(path.join(root, 'business/benchmarks/x/baseline/base.txt'), 'doctored');
  const r = run('verify'); assert.equal(r.status, 1); assert.match(r.stdout, /TAMPERED/);
});
test('shell wins only with margin and no gating loss', () => {
  const { root, run } = sb(R); run('freeze', '--files', 'base.txt'); fs.mkdirSync(path.join(root, 'sh'));
  run('pack', '--shell-dir', 'sh');
  let v = run('verdict', '--judge', judged(root, { g: 4, n: 4 }, { g: 3, n: 3 }));
  assert.match(v.stdout, /"verdict": "shell-wins"/);
  v = run('verdict', '--judge', judged(root, { g: 2, n: 5 }, { g: 3, n: 1 }));
  assert.match(v.stdout, /"verdict": "no-advantage"/);
  v = run('verdict', '--judge', judged(root, { g: 3, n: 3 }, { g: 3, n: 3 }));
  assert.match(v.stdout, /"verdict": "tie"/);
});
test('worse deterministic checks block a win; record is appended with n=1 caveat', () => {
  const { root, run } = sb(R, [{ id: 'c', cmd: 'test -f ok.txt' }]); run('freeze', '--files', 'base.txt');
  fs.writeFileSync(path.join(root, 'ok.txt'), '1'); run('score', '--side', 'baseline');
  fs.rmSync(path.join(root, 'ok.txt')); run('score', '--side', 'shell');
  run('pack', '--shell-dir', root);
  const v = run('verdict', '--judge', judged(root, { g: 5, n: 5 }, { g: 1, n: 1 }));
  assert.match(v.stdout, /no-advantage/);
  const rec = fs.readFileSync(path.join(root, 'business/metrics/benchmarks.jsonl'), 'utf8').trim().split('\n').pop();
  assert.equal(JSON.parse(rec).n, 1);
});
test('blind pack strips process files and process-revealing lines, scrubs names, randomises, and reports what it removed', () => {
  const { root, run } = sb(R);
  for (const d of ['a', 'b']) fs.mkdirSync(path.join(root, d), { recursive: true });
  fs.writeFileSync(path.join(root, 'a/report.md'), 'plan for ai-agent-system-shell, ok');
  fs.writeFileSync(path.join(root, 'a/04-plan.md'), 'process file with Agent Shell');
  fs.writeFileSync(path.join(root, 'b/report.md'), 'plain output');
  const r = run('blind', '--task', 'dev', '--a', 'a', '--b', 'b'); assert.equal(r.status, 0, r.stderr);
  const tmp = r.stdout.trim(); assert.ok(!tmp.startsWith(root));
  const files = ['A', 'B'].flatMap(l => fs.readdirSync(path.join(tmp, l)).map(f => fs.readFileSync(path.join(tmp, l, f), 'utf8')));
  assert.ok(files.every(t => !/shell|04-plan/i.test(t)));
  fs.writeFileSync(path.join(root, 'b/leak.md'), 'this was written by Claude without the shell');
  const bad = run('blind', '--task', 'dev', '--a', 'a', '--b', 'b'); assert.equal(bad.status, 0); assert.match(bad.stderr, /scrubbed [1-9]/); const tmp2 = bad.stdout.trim(); assert.ok(['A','B'].every(l => fs.readdirSync(path.join(tmp2, l)).every(f => !/claude/i.test(fs.readFileSync(path.join(tmp2, l, f), 'utf8')))));
});
