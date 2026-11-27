import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const REPO = process.cwd();
function sandbox() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'shell-'));
  fs.mkdirSync(path.join(root, 'agents/charters'), { recursive: true });
  fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
  fs.mkdirSync(path.join(root, '.claude/skills/demo-skill'), { recursive: true });
  fs.writeFileSync(path.join(root, '.claude/skills/demo-skill/SKILL.md'), '# demo');
  fs.copyFileSync(path.join(REPO, 'agents/shell.json'), path.join(root, 'agents/shell.json'));
  fs.copyFileSync(path.join(REPO, 'scripts/agent-metrics.mjs'), path.join(root, 'scripts/agent-metrics.mjs'));
  fs.writeFileSync(path.join(root, 'agents/registry.json'), JSON.stringify({ agents: [{ id: 'mini', prompt: 'p.md' }] }));
  fs.writeFileSync(path.join(root, 'p.md'), 'x');
  const ch = {
    id: 'mini', domain: 'test domain', mission: 'test', vars: [], min_sources: 2, knowledge_dir: 'business/knowledge/mini',
    data_questions: [{ id: 'one', q: 'first?' }, { id: 'two', q: 'second?' }], skills: ['demo-skill'], tools: [], rules: [],
    produce: { artifacts: ['out/{date}.txt'] }, gates: [{ id: 'g', cmd: 'test -f out/{date}.txt', why: 'output exists' }],
    report: 'reports/{date}.md', benchmark: {},
  };
  fs.writeFileSync(path.join(root, 'agents/charters/mini.json'), JSON.stringify(ch));
  const env = { ...process.env, SHELL_ROOT: root, SHELL_RUNS_DIR: path.join(root, 'runs'), METRICS_DIR: path.join(root, 'metrics'), SHELL_DATE: '2026-11-26' };
  const sh = (...a) => spawnSync('node', [path.join(REPO, 'scripts/agent-shell.mjs'), ...a], { env, cwd: root, encoding: 'utf8' });
  return { root, sh, env };
}
const runIdOf = out => out.match(/run_id: (\S+)/)[1];
const write = (dir, name, txt) => fs.writeFileSync(path.join(dir, name), txt);
const LONG = ' '.repeat(0) + 'This is real content that is long enough to pass the minimum length check of the shell for any artifact.';

test('start lists stages and rejects unknown agent', () => {
  const { sh } = sandbox();
  assert.notEqual(sh('start', '--agent', 'nope').status, 0);
  const r = sh('start', '--agent', 'mini');
  assert.equal(r.status, 0);
  assert.match(r.stdout, /context > data > research > plan > produce > verify > impact > results > learn > report/);
});

test('stage order is enforced and missing artifact is rejected', () => {
  const { sh } = sandbox();
  const id = runIdOf(sh('start', '--agent', 'mini').stdout);
  const early = sh('done', '--run', id, '--stage', 'data');
  assert.equal(early.status, 2); assert.match(early.stdout, /earlier stage/);
  const noart = sh('done', '--run', id, '--stage', 'context');
  assert.equal(noart.status, 2); assert.match(noart.stdout, /missing artifact 01-context.md/);
});

test('data stage needs a real answer per question; placeholders are rejected', () => {
  const { sh, root } = sandbox();
  const id = runIdOf(sh('start', '--agent', 'mini').stdout);
  const dir = fs.readdirSync(path.join(root, 'runs/mini')).map(d => path.join(root, 'runs/mini', d))[0];
  write(dir, '01-context.md', `## Files read\n- CLAUDE.md\n## Open items inherited from earlier runs\nnone. ${LONG}`);
  assert.equal(sh('done', '--run', id, '--stage', 'context').status, 0);
  write(dir, '02-data.md', `Q:one\nA: ${LONG}\n\nQ:two\nA: TODO\n\n## Surprises\nnone ${LONG}`);
  const bad = sh('done', '--run', id, '--stage', 'data');
  assert.equal(bad.status, 2); assert.match(bad.stdout, /placeholder/);
  write(dir, '02-data.md', `Q:one\nA: ${LONG}\n\nQ:two\nNO DATA: connector not available in this run, so no figures exist\n\n## Surprises\nnone ${LONG}`);
  assert.equal(sh('done', '--run', id, '--stage', 'data').status, 0);
});

function fullRun({ skipSkill = false, breakGate = false } = {}) {
  const { sh, root } = sandbox();
  const id = runIdOf(sh('start', '--agent', 'mini').stdout);
  const dir = fs.readdirSync(path.join(root, 'runs/mini')).map(d => path.join(root, 'runs/mini', d))[0];
  const ok = (st) => { const r = sh('done', '--run', id, '--stage', st); assert.equal(r.status, 0, r.stdout); };
  write(dir, '01-context.md', `## Files read\n- a\n## Open items inherited from earlier runs\nnone ${LONG}`); ok('context');
  write(dir, '02-data.md', `Q:one\nA: ${LONG}\nQ:two\nA: ${LONG}\n## Surprises\nnone ${LONG}`); ok('data');
  write(dir, '03-research.md', `- Source: spec.md | defines the domain ${LONG}\n- Source: log.md | earlier run\n## What I now know that I did not know before\n${LONG}`);
  const noSrc = sh('done', '--run', id, '--stage', 'research');
  assert.equal(noSrc.status, 2); assert.match(noSrc.stdout, /only 0 were logged/);
  sh('log', '--run', id, '--kind', 'source', '--name', 'spec.md'); sh('log', '--run', id, '--kind', 'source', '--name', 'log.md'); ok('research');
  write(dir, '04-plan.md', `## Hypothesis\nh ${LONG}\n## Alternatives\nA B ${LONG}\n## Decision\nA\n## Success metric\nm`); ok('plan');
  fs.mkdirSync(path.join(root, 'out'), { recursive: true });
  if (!breakGate) fs.writeFileSync(path.join(root, 'out/2026-11-26.txt'), 'output');
  else fs.writeFileSync(path.join(root, 'out/2026-11-26.txt'), 'output');
  if (!skipSkill) sh('log', '--run', id, '--kind', 'skill', '--name', 'demo-skill');
  return { sh, root, id, dir, ok };
}
function restOfRun({ sh, root, id, dir, ok }, { breakGate }) {
  ok('produce');
  if (breakGate) fs.rmSync(path.join(root, 'out/2026-11-26.txt'));
  write(dir, '07-impact.md', `## Who or what this affects\na ${LONG}\n## Risks\nr\n## Reversible?\ny\n## What could go wrong in the world\nw`);
  return;
}

test('produce is refused when a required skill was not logged', () => {
  const run = fullRun({ skipSkill: true });
  const r = run.sh('done', '--run', run.id, '--stage', 'produce');
  assert.equal(r.status, 2); assert.match(r.stdout, /required skill "demo-skill"/);
});

test('unknown skill cannot be logged', () => {
  const { sh } = sandbox();
  const id = runIdOf(sh('start', '--agent', 'mini').stdout);
  assert.notEqual(sh('log', '--run', id, '--kind', 'skill', '--name', 'made-up').status, 0);
});

test('a failing gate blocks verify; fixing it lets the run continue', () => {
  const run = fullRun();
  restOfRun(run, { breakGate: true });
  const bad = run.sh('done', '--run', run.id, '--stage', 'verify');
  assert.equal(bad.status, 2); assert.match(bad.stdout, /gate "g" failed/);
  fs.writeFileSync(path.join(run.root, 'out/2026-11-26.txt'), 'output');
  assert.equal(run.sh('done', '--run', run.id, '--stage', 'verify').status, 0);
});

test('finish ok is refused with open stages; partial needs a reason; full run finishes ok and logs compliance', () => {
  const run = fullRun();
  restOfRun(run, { breakGate: false });
  assert.equal(run.sh('done', '--run', run.id, '--stage', 'verify').status, 0);
  const early = run.sh('finish', '--run', run.id, '--status', 'ok');
  assert.equal(early.status, 2); assert.match(early.stdout, /REFUSED/);
  assert.notEqual(run.sh('finish', '--run', run.id, '--status', 'partial').status, 0);
  assert.equal(run.sh('done', '--run', run.id, '--stage', 'impact').status, 0);
  write(run.dir, '08-results.md', `## Previous outputs and their results\ntoo little data ${LONG}\n## Yotam's verdicts\nnone yet`);
  assert.equal(run.sh('done', '--run', run.id, '--stage', 'results').status, 0);
  write(run.dir, '09-learn.md', `## Learned\nx ${LONG}\n## Mistakes and corrections\nnone\n## Next run should\ny`);
  const noLog = run.sh('done', '--run', run.id, '--stage', 'learn');
  assert.equal(noLog.status, 2); assert.match(noLog.stdout, /learning log/);
  const kd = path.join(run.root, 'business/knowledge/mini'); fs.mkdirSync(kd, { recursive: true });
  fs.appendFileSync(path.join(kd, 'learning-log.md'), `- 2026-11-26 ${run.id}: learned something\n`);
  assert.equal(run.sh('done', '--run', run.id, '--stage', 'learn').status, 0);
  write(run.dir, '10-message.md', 'שלום, הכול מוכן לאישור.\n');
  fs.mkdirSync(path.join(run.root, 'reports'), { recursive: true });
  fs.writeFileSync(path.join(run.root, 'reports/2026-11-26.md'), 'report');
  assert.equal(run.sh('done', '--run', run.id, '--stage', 'report').status, 0);
  const fin = run.sh('finish', '--run', run.id, '--status', 'ok');
  assert.equal(fin.status, 0, fin.stdout + fin.stderr); assert.match(fin.stdout, /compliance 100%/);
  const rec = JSON.parse(fs.readFileSync(path.join(run.root, 'metrics/shell-runs.jsonl'), 'utf8').trim());
  assert.equal(rec.status, 'ok'); assert.equal(rec.gates_fail, 0); assert.equal(rec.skills_missing.length, 0);
  assert.match(run.sh('compliance').stdout, /mini: 1 runs, 1 ok/);
});

test('skipped stage forces partial and is counted', () => {
  const { sh } = sandbox();
  const id = runIdOf(sh('start', '--agent', 'mini').stdout);
  assert.notEqual(sh('skip', '--run', id, '--stage', 'data', '--reason', 'short').status, 0);
  assert.equal(sh('skip', '--run', id, '--stage', 'data', '--reason', 'connector missing in this run').status, 0);
  assert.equal(sh('finish', '--run', id, '--status', 'ok').status, 2);
  const p = sh('finish', '--run', id, '--status', 'partial', '--blocked', 'data connector missing');
  assert.equal(p.status, 0); assert.match(p.stdout, /partial/);
});

test('repo charters pass the shell check and compose a prompt for every agent', () => {
  const r = spawnSync('node', ['scripts/agent-shell.mjs', 'check'], { cwd: REPO, encoding: 'utf8' });
  assert.equal(r.status, 0, r.stdout);
  const reg = JSON.parse(fs.readFileSync(path.join(REPO, 'agents/registry.json'), 'utf8')).agents;
  for (const a of reg) {
    const p = spawnSync('node', ['scripts/agent-shell.mjs', 'prompt', '--agent', a.id], { cwd: REPO, encoding: 'utf8' });
    assert.equal(p.status, 0); assert.match(p.stdout, /STAGES:/); assert.match(p.stdout, /DATA QUESTIONS/);
  }
});
