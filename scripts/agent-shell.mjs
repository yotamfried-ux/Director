#!/usr/bin/env node
// Agent shell: the fixed wrapper around Claude for every Director agent.
// Claude is the LLM; the shell owns the stages, the evidence, the gates and the closing check.
// Commands: prompt | start | status | next | done | skip | log | finish | check | compliance
// Env (tests): SHELL_RUNS_DIR, METRICS_DIR, SHELL_ROOT, SHELL_DATE
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.env.SHELL_ROOT || process.cwd();
const RUNS = process.env.SHELL_RUNS_DIR || path.join(ROOT, 'business/runs');
const METRICS = process.env.METRICS_DIR || path.join(ROOT, 'business/metrics');
const SHELL = JSON.parse(fs.readFileSync(path.join(ROOT, 'agents/shell.json'), 'utf8'));
const argv = process.argv.slice(2);
const cmd = argv[0];
const flags = {};
const vars = {};
for (let i = 1; i < argv.length; i++) {
  if (!argv[i].startsWith('--')) continue;
  const k = argv[i].slice(2);
  const v = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : 'true';
  if (k === 'var') { const [a, ...b] = v.split('='); vars[a] = b.join('='); } else flags[k] = v;
}
const die = (m, code = 1) => { console.error(m); process.exit(code); };
const today = () => process.env.SHELL_DATE || new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Jerusalem' });

function charter(id) {
  const p = path.join(ROOT, 'agents/charters', `${id}.json`);
  if (!fs.existsSync(p)) die(`no charter for agent "${id}" (agents/charters/${id}.json)`);
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}
function stagesOf(ch) {
  const produce = {
    id: 'produce', title: 'Produce the domain output',
    instructions: ch.produce?.instructions || 'Produce the deliverables of your domain with the required skills and tools.',
    produce: true,
  };
  return [...SHELL.stages_before_produce, ...(ch.domain_stages || []), produce, ...SHELL.stages_after_produce];
}
function sub(str, st) {
  return String(str)
    .replaceAll('{date}', st.date).replaceAll('{run_dir}', st.run_dir).replaceAll('{run_id}', st.run_id)
    .replace(/\{var\.(\w+)\}/g, (_, k) => st.vars?.[k] ?? `{var.${k}}`);
}
function globFiles(pattern) {
  // supports a trailing '*' in the last path segment, or a plain path
  const abs = path.isAbsolute(pattern) ? pattern : path.join(ROOT, pattern);
  const dir = path.dirname(abs), base = path.basename(abs);
  if (!base.includes('*')) return fs.existsSync(abs) ? [abs] : [];
  if (!fs.existsSync(dir)) return [];
  const re = new RegExp('^' + base.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
  return fs.readdirSync(dir).filter(f => re.test(f)).map(f => path.join(dir, f));
}
function findRun(runId) {
  const hits = fs.existsSync(RUNS) ? fs.readdirSync(RUNS).flatMap(a => {
    const d = path.join(RUNS, a, runId, 'state.json');
    return fs.existsSync(d) ? [d] : [];
  }) : [];
  if (!hits.length) die(`run not found: ${runId}`);
  return hits[0];
}
const load = runId => { const p = findRun(runId); return { p, st: JSON.parse(fs.readFileSync(p, 'utf8')) }; };
const save = (p, st) => fs.writeFileSync(p, JSON.stringify(st, null, 2));
const event = (st, e) => fs.appendFileSync(path.join(st.run_dir, 'events.jsonl'), JSON.stringify({ t: new Date().toISOString(), ...e }) + '\n');

function readArtifact(st, name) {
  const f = path.join(st.run_dir, name);
  return fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null;
}

// ---- validation: returns list of problems (empty = stage evidence is good)
function validate(st, ch, stage) {
  const problems = [];
  const minChars = SHELL.defaults.min_chars;
  if (stage.artifact) {
    const txt = readArtifact(st, stage.artifact);
    if (txt == null) problems.push(`missing artifact ${stage.artifact} in the run dir`);
    else {
      if (stage.max_lines) {
        const n = txt.trim().split('\n').filter(Boolean).length;
        if (n > stage.max_lines) problems.push(`${stage.artifact} has ${n} lines, max ${stage.max_lines}`);
        if (txt.trim().length < 10) problems.push(`${stage.artifact} is empty`);
      } else if (txt.trim().length < minChars) problems.push(`${stage.artifact} is too short (${txt.trim().length} < ${minChars} chars)`);
      for (const h of stage.headings || []) if (!txt.includes(h)) problems.push(`${stage.artifact} lacks heading "${h}"`);
      if (/\b(TODO|TBD|FIXME|lorem ipsum)\b/i.test(txt)) problems.push(`${stage.artifact} contains a placeholder (TODO/TBD)`);
      if (stage.per_data_question) {
        for (const q of ch.data_questions || []) {
          const m = txt.match(new RegExp(`Q:${q.id}\\s*\\n+\\s*(A:|NO DATA:)([^\\n]*(?:\\n(?!Q:)[^\\n]*)*)`));
          if (!m || m[2].trim().length < 12) problems.push(`data question "${q.id}" has no real answer (write 'Q:${q.id}' then 'A:' or 'NO DATA: reason')`);
        }
      }
      if (stage.min_source_lines) {
        const need = ch.min_sources ?? SHELL.defaults.min_sources;
        const n = (txt.match(/^- Source: .+\|.+/gm) || []).length;
        const noSrc = /^NO SOURCES:\s*\S+/m.test(txt);
        if (n < need && !noSrc) problems.push(`research has ${n} source lines, need ${need} ('- Source: <path|url> | <what it established>') or 'NO SOURCES: reason'`);
        const logged = st.events_count?.source || 0;
        if (n >= need && logged < Math.min(need, n)) problems.push(`sources are written but only ${logged} were logged with 'agent-shell.mjs log --kind source'`);
      }
      if (stage.needs_metrics_report && !/agent-metrics|too little data|report/i.test(txt)) problems.push('08-results.md must show the agent-metrics report or say "too little data"');
      if (stage.learning_log) {
        const kd = path.join(ROOT, ch.knowledge_dir || `business/knowledge/${ch.id}`);
        const lf = path.join(kd, 'learning-log.md');
        if (!fs.existsSync(lf) || !fs.readFileSync(lf, 'utf8').includes(st.run_id)) problems.push(`learning log ${path.relative(ROOT, lf)} has no entry with the run id ${st.run_id}`);
      }
    }
  }
  if (stage.produce) {
    const arts = ch.produce?.artifacts || [];
    const startMs = Date.parse(st.started) - 2000;
    for (const a of arts) {
      const pat = sub(a, st);
      const files = globFiles(pat).filter(f => fs.statSync(f).mtimeMs >= startMs && fs.statSync(f).size > 0);
      if (!files.length) problems.push(`no non-empty file matching ${pat} was written during this run`);
    }
    for (const s of ch.skills || []) {
      if (!(st.skills_logged || []).includes(s)) problems.push(`required skill "${s}" was not logged (agent-shell.mjs log --kind skill --name ${s})`);
    }
    for (const t of ch.produce?.tools_required || []) {
      if (!(st.tools_logged || []).includes(t)) problems.push(`required tool "${t}" was not logged`);
    }
  }
  if (stage.report_from_charter && ch.report) {
    const pat = sub(ch.report, st);
    const files = globFiles(pat).filter(f => fs.statSync(f).mtimeMs >= Date.parse(st.started) - 2000);
    if (!files.length) problems.push(`report ${pat} was not written during this run`);
  }
  return problems;
}
function runGates(st, ch, stage) {
  const problems = [];
  const gates = ch.gates || [];
  const results = [];
  for (const g of gates) {
    const c = sub(g.cmd, st);
    const r = spawnSync('sh', ['-c', c], { cwd: ROOT, encoding: 'utf8', timeout: 600000 });
    const out = `$ ${c}\n${r.stdout || ''}${r.stderr || ''}\nexit ${r.status}\n`;
    fs.appendFileSync(path.join(st.run_dir, `gate-${g.id}.log`), out);
    const expect = g.expect_exit ?? 0;
    const ok = r.status === expect;
    results.push({ id: g.id, ok, exit: r.status });
    if (!ok) problems.push(`gate "${g.id}" failed (exit ${r.status}, expected ${expect}): ${g.why || c}`);
  }
  st.gate_results = results;
  return problems;
}

// ---- commands
function composePrompt(id) {
  const ch = charter(id);
  const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'agents/registry.json'), 'utf8')).agents.find(a => a.id === id);
  const stages = stagesOf(ch);
  const lines = [];
  lines.push(`You are the "${id}" agent of Yotam's business system: ${ch.domain}. You own this domain end to end: the data, the research, the output, its consequences and its measured results. Claude is your language model; the Agent Shell is your wrapper. Talk to Yotam in Hebrew.`);
  lines.push(`Mission: ${ch.mission}`);
  lines.push('');
  lines.push('HOW YOU WORK (fixed, every run):');
  lines.push(`1. Run: node scripts/agent-shell.mjs start --agent ${id}${(ch.vars || []).map(v => ` --var ${v}=<value>`).join('')}`);
  lines.push('2. Work stage by stage. After each stage run: node scripts/agent-shell.mjs done --run <run_id> --stage <stage>. The shell checks your evidence (files, headings, sources, skills, gates it runs itself). If it says NOT DONE, fix and run it again. You cannot skip a required stage.');
  lines.push('3. Log what you use: node scripts/agent-shell.mjs log --run <run_id> --kind skill|tool|source --name <name>. Use the skills and tools of your charter by actually reading/running them.');
  lines.push(`4. Close with: node scripts/agent-shell.mjs finish --run <run_id> --status ok|partial|failed [--blocked "<reason>"]. ok is refused while a required stage is open. A run that is not finished is a failed run.`);
  lines.push('');
  lines.push('STAGES:');
  stages.forEach((s, i) => lines.push(`${i + 1}. [${s.id}] ${s.title}. ${s.instructions}`));
  lines.push('');
  lines.push('DATA QUESTIONS (answer each in 02-data.md, from real data):');
  (ch.data_questions || []).forEach(q => lines.push(`- Q:${q.id}: ${q.q}`));
  lines.push('');
  lines.push(`REQUIRED SKILLS (read each SKILL.md and log it): ${(ch.skills || []).join(', ') || 'none'}`);
  lines.push(`TOOLS: ${(ch.tools || []).join(', ')}`);
  lines.push('RULES (a rule you cannot meet makes the run partial, never ok):');
  [...(ch.rules || []), 'Follow routines/agents/_common.md.', 'Draft only: never post, send, spend, change a price, connect an account or schedule anything. Ask Yotam.', 'Honesty: no invented numbers, customers or reviews; demo data is labelled; say what you did not check.'].forEach(r => lines.push(`- ${r}`));
  lines.push('');
  lines.push(`DOMAIN PLAYBOOK: read ${reg?.prompt || `routines/agents/${id}.md`} and follow it inside these stages.`);
  console.log(lines.join('\n'));
}

function start() {
  const id = flags.agent || die('start --agent <id>');
  const ch = charter(id);
  const missing = (ch.vars || []).filter(v => !vars[v]);
  if (missing.length) die(`missing --var for: ${missing.join(', ')}`);
  const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
  const run_id = `${id}-${stamp}${flags.suffix ? '-' + flags.suffix : ''}`;
  const run_dir = path.join(RUNS, id, run_id);
  fs.mkdirSync(run_dir, { recursive: true });
  const stages = stagesOf(ch);
  const st = {
    run_id, agent: id, run_dir, date: today(), started: new Date().toISOString(), vars,
    input: flags.input || null,
    stages: Object.fromEntries(stages.map(s => [s.id, { status: 'open' }])),
    order: stages.map(s => s.id), skills_logged: [], tools_logged: [], events_count: {},
  };
  save(path.join(run_dir, 'state.json'), st);
  fs.mkdirSync(path.join(ROOT, ch.knowledge_dir || `business/knowledge/${id}`), { recursive: true });
  event(st, { kind: 'start' });
  console.log(`run_id: ${run_id}\nrun_dir: ${run_dir}\nstages: ${st.order.join(' > ')}\nnext: ${st.order[0]}`);
}

function status() {
  const { st } = load(flags.run || die('status --run <id>'));
  console.log(`${st.run_id}  started ${st.started}${st.finished ? '  finished ' + st.finished + ' (' + st.final_status + ')' : ''}`);
  for (const id of st.order) console.log(`  ${st.stages[id].status.padEnd(8)} ${id}${st.stages[id].reason ? '  (' + st.stages[id].reason + ')' : ''}`);
  console.log(`skills logged: ${st.skills_logged.join(', ') || '-'} | tools: ${st.tools_logged.join(', ') || '-'} | sources: ${st.events_count.source || 0}`);
}
function next() {
  const { st } = load(flags.run || die('next --run <id>'));
  const ch = charter(st.agent);
  const stage = stagesOf(ch).find(s => st.stages[s.id].status === 'open');
  if (!stage) return console.log('all stages closed: run finish');
  console.log(`[${stage.id}] ${stage.title}\n${stage.instructions}`);
}
function done() {
  const { p, st } = load(flags.run || die('done --run <id> --stage <id>'));
  if (st.finished) die('run already finished');
  const ch = charter(st.agent);
  const stage = stagesOf(ch).find(s => s.id === flags.stage);
  if (!stage) die(`unknown stage "${flags.stage}"`);
  const idx = st.order.indexOf(stage.id);
  const prevOpen = st.order.slice(0, idx).filter(id => st.stages[id].status === 'open');
  if (prevOpen.length) { console.log(`NOT DONE: earlier stage(s) still open: ${prevOpen.join(', ')}`); process.exit(2); }
  let problems = validate(st, ch, stage);
  if (stage.gates_from_charter) problems = problems.concat(runGates(st, ch, stage));
  if (problems.length) {
    st.stages[stage.id] = { ...st.stages[stage.id], status: 'open', last_problems: problems };
    save(p, st); event(st, { kind: 'done_rejected', stage: stage.id, problems });
    console.log(`NOT DONE [${stage.id}]:\n- ${problems.join('\n- ')}`);
    process.exit(2);
  }
  st.stages[stage.id] = { status: 'done', at: new Date().toISOString(), note: flags.note || null };
  save(p, st); event(st, { kind: 'done', stage: stage.id });
  const nxt = st.order.find(id => st.stages[id].status === 'open');
  console.log(`DONE [${stage.id}]. next: ${nxt || 'finish'}`);
}
function skip() {
  const { p, st } = load(flags.run || die('skip --run <id> --stage <id> --reason ...'));
  const ch = charter(st.agent);
  const stage = stagesOf(ch).find(s => s.id === flags.stage);
  if (!stage) die(`unknown stage "${flags.stage}"`);
  if (!flags.reason || flags.reason.length < 10) die('a skip needs --reason (>= 10 chars)');
  st.stages[stage.id] = { status: 'skipped', reason: flags.reason, at: new Date().toISOString() };
  save(p, st); event(st, { kind: 'skip', stage: stage.id, reason: flags.reason });
  console.log(`SKIPPED [${stage.id}]: the run can now only finish as partial or failed.`);
}
function log() {
  const { p, st } = load(flags.run || die('log --run <id> --kind skill|tool|source --name <x>'));
  const kind = flags.kind, name = flags.name;
  if (!['skill', 'tool', 'source'].includes(kind) || !name) die('log --kind skill|tool|source --name <x>');
  if (kind === 'skill') {
    const ch = charter(st.agent);
    const known = (ch.skills || []).concat(ch.optional_skills || []);
    const skillFile = path.join(ROOT, '.claude/skills', name, 'SKILL.md');
    if (!known.includes(name) && !fs.existsSync(skillFile)) die(`unknown skill "${name}" (not in the charter and no .claude/skills/${name}/SKILL.md)`);
    if (!st.skills_logged.includes(name)) st.skills_logged.push(name);
  }
  if (kind === 'tool' && !st.tools_logged.includes(name)) st.tools_logged.push(name);
  st.events_count[kind] = (st.events_count[kind] || 0) + 1;
  save(p, st); event(st, { kind: 'log', what: kind, name });
  console.log(`logged ${kind}: ${name}`);
}
function finish() {
  const { p, st } = load(flags.run || die('finish --run <id> --status ok|partial|failed'));
  const status = flags.status;
  if (!['ok', 'partial', 'failed'].includes(status)) die('--status ok|partial|failed');
  const ch = charter(st.agent);
  const stages = stagesOf(ch);
  const open = stages.filter(s => st.stages[s.id].status === 'open').map(s => s.id);
  const skipped = stages.filter(s => st.stages[s.id].status === 'skipped').map(s => s.id);
  if (status === 'ok' && (open.length || skipped.length)) {
    console.log(`REFUSED: status ok needs every required stage done. open: ${open.join(', ') || '-'}; skipped: ${skipped.join(', ') || '-'}. Finish as partial/failed with --blocked "<reason>", or complete the stages.`);
    process.exit(2);
  }
  if (status !== 'ok' && !flags.blocked) die('partial/failed needs --blocked "<reason>"');
  const done_n = stages.filter(s => st.stages[s.id].status === 'done').length;
  const gates = st.gate_results || [];
  st.finished = new Date().toISOString(); st.final_status = status; st.blocked = flags.blocked || null;
  const rec = {
    run_id: st.run_id, agent: st.agent, status, started: st.started, finished: st.finished,
    stages_total: stages.length, stages_done: done_n, stages_skipped: skipped.length, stages_open: open.length,
    compliance: Math.round((done_n / stages.length) * 100),
    skills_required: (ch.skills || []).length, skills_logged: st.skills_logged.length,
    skills_missing: (ch.skills || []).filter(s => !st.skills_logged.includes(s)),
    tools_logged: st.tools_logged.length, sources_logged: st.events_count.source || 0,
    gates_pass: gates.filter(g => g.ok).length, gates_fail: gates.filter(g => !g.ok).length,
    blocked: st.blocked, input_hash: st.input ? String(st.input).length : 0,
  };
  fs.mkdirSync(METRICS, { recursive: true });
  fs.appendFileSync(path.join(METRICS, 'shell-runs.jsonl'), JSON.stringify(rec) + '\n');
  save(p, st); event(st, { kind: 'finish', status });
  const m = spawnSync('node', [path.join(ROOT, 'scripts/agent-metrics.mjs'), 'record', '--agent', st.agent, '--status', status,
    '--started', st.started, '--finished', st.finished, '--checks-pass', String(rec.gates_pass), '--checks-fail', String(rec.gates_fail)],
    { cwd: ROOT, encoding: 'utf8', env: { ...process.env, METRICS_DIR: METRICS } });
  console.log(`FINISHED ${st.run_id}: ${status}, compliance ${rec.compliance}% (${done_n}/${stages.length} stages), gates ${rec.gates_pass}/${gates.length}${rec.skills_missing.length ? ', skills not logged: ' + rec.skills_missing.join(', ') : ''}`);
  if (m.status !== 0) console.log(`(metrics record failed: ${(m.stderr || '').trim().slice(0, 120)})`);
}
function check() {
  const dir = path.join(ROOT, 'agents/charters');
  const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'agents/registry.json'), 'utf8')).agents;
  const bad = [];
  for (const a of reg) {
    const f = path.join(dir, `${a.id}.json`);
    if (!fs.existsSync(f)) { bad.push(`${a.id}: no charter`); continue; }
    const ch = JSON.parse(fs.readFileSync(f, 'utf8'));
    for (const k of ['id', 'domain', 'mission', 'data_questions', 'skills', 'tools', 'rules', 'produce', 'gates', 'report', 'benchmark'])
      if (ch[k] == null) bad.push(`${a.id}: charter lacks "${k}"`);
    if (ch.id !== a.id) bad.push(`${a.id}: charter id mismatch`);
    for (const s of ch.skills || []) if (!fs.existsSync(path.join(ROOT, '.claude/skills', s, 'SKILL.md'))) bad.push(`${a.id}: skill "${s}" has no .claude/skills/${s}/SKILL.md`);
    for (const t of ch.tools || []) if (/^scripts\//.test(t) && !fs.existsSync(path.join(ROOT, t))) bad.push(`${a.id}: tool ${t} missing`);
    if (!(ch.data_questions || []).length) bad.push(`${a.id}: no data questions`);
    if (!fs.existsSync(path.join(ROOT, a.prompt || `routines/agents/${a.id}.md`))) bad.push(`${a.id}: playbook prompt missing`);
  }
  for (const f of fs.existsSync(dir) ? fs.readdirSync(dir) : []) if (!reg.some(a => `${a.id}.json` === f)) bad.push(`${f}: charter without a registry entry`);
  if (bad.length) { console.log('CHECK FAILED\n- ' + bad.join('\n- ')); process.exit(1); }
  console.log(`charters OK for ${reg.length} agents`);
}
function compliance() {
  const f = path.join(METRICS, 'shell-runs.jsonl');
  if (!fs.existsSync(f)) return console.log('no shell runs yet');
  const rows = fs.readFileSync(f, 'utf8').trim().split('\n').map(l => JSON.parse(l)).filter(r => !flags.agent || r.agent === flags.agent);
  const by = {};
  for (const r of rows) (by[r.agent] ||= []).push(r);
  for (const [a, rs] of Object.entries(by)) {
    const ok = rs.filter(r => r.status === 'ok').length;
    console.log(`${a}: ${rs.length} runs, ${ok} ok, mean compliance ${Math.round(rs.reduce((s, r) => s + r.compliance, 0) / rs.length)}%`);
  }
}

const table = { prompt: () => composePrompt(flags.agent || die('prompt --agent <id>')), start, status, next, done, skip, log, finish, check, compliance };
if (!table[cmd]) die('usage: agent-shell.mjs prompt|start|status|next|done|skip|log|finish|check|compliance [--agent id] [--run id] [--stage id] [--kind skill|tool|source --name x] [--status ok|partial|failed --blocked "why"] [--var k=v]');
table[cmd]();
