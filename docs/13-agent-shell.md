# Agent Shell (docs/13)

An "agent" here is not Claude improvising in a session. It is **Claude as the LLM inside a fixed wrapper**:
- `agents/charters/<id>.json`: domain, mission, data questions, required skills, tools, rules, outputs, gates, report path, benchmark.
- `agents/shell.json`: the universal stages every agent must pass: context, data, research, plan, [domain stages], produce, verify, impact, results, learn, report.
- `scripts/agent-shell.mjs`: composes the one fixed prompt (`prompt --agent <id>`), tracks a run (`start/done/skip/log/finish`), validates evidence (files, headings, sources, logged skills), runs the gates itself, refuses `finish --status ok` while a required stage is open, and writes compliance to `business/metrics/shell-runs.jsonl`.
- Scheduled tasks run exactly `agent-shell.mjs prompt --agent <id>` (see `agents.mjs payload`).

What it enforces: stage order; real answers per data question (`NO DATA` is allowed, placeholders are not); sources logged, not just claimed; required skills actually logged; gates executed by the shell; impact and results sections; a learning-log entry carrying the run id. What it cannot enforce: that the content of a section is true. That is the auditor's and Yotam's job.

## Benchmark: does the shell beat bare Claude?
`scripts/agent-benchmark.mjs` (spec per agent in the charter's `benchmark`):
1. `freeze` a bare-Claude baseline (sha256 manifest, local copy, process facts). `verify` detects tampering.
2. A fresh shell run on the same task, without seeing the baseline.
3. `score` both sides with deterministic checks; `pack` gives a blind judge pack (random A/B, sealed key).
4. `verdict`: shell wins only if no gating rubric item or deterministic check is worse AND the rubric total is higher by the margin. Otherwise `no-advantage`, `tie` or `baseline-wins`. Recorded in `business/metrics/benchmarks.jsonl`.
Limits: n=1 per side, an LLM judge, a baseline that had Yotam's corrections as hints. Yotam's verdict is the ground truth; one win proves nothing, a trend over runs does.

## Standards and the development loop (since 2026-11-26)
Each of the 5 agents has `agents/benchmarks/<id>/standard.json`: a gold standard in words, a dev task and a holdout task (synthetic fixtures with planted traps, answer key withheld by `agent-loop.mjs prepare`), a rubric with anchors (5/3/1), gating items, deterministic checks and a target: total >= 85%, every gating item >= 4, all checks pass, on dev AND holdout, in 2 consecutive rounds.
Loop (`scripts/agent-loop.mjs`): prepare task -> fresh shell run -> blind judge -> `grade` -> `status`. On CONTINUE, fix the charter, skills or playbook from the DEV failures only (holdout shows pass/fail only), log the change, rerun. Never edit the standard, fixtures or judge (hash-checked: STANDARD_CHANGED invalidates history). Stops: REACHED, STALLED (no dev gain in 3 rounds), MAX_ITERATIONS (8): then Yotam decides. Synthetic fixtures prove method, not market success; real results (results-spec) and Yotam's verdicts stay the ground truth.
