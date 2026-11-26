# Measuring the agents

Goal: never be blind. Every agent is measured at six layers, from "did it run" to "did it make money". A lower layer being green says nothing about the layers above it.

| Layer | Question | How it is measured | Tool |
|---|---|---|---|
| 1 Heartbeat | Did it run when it should? | each run records itself; no run within `heartbeat_hours` = SILENT, none ever = NEVER-RAN, 3 failed in a row = FAILING | `agent-metrics.mjs record/report` |
| 2 Execution | Did it finish, how long? | status ok/partial/failed, seconds, outputs | same |
| 3 Hard checks | Is the output allowed to be shown? | deterministic pass/fail: draft status, claim traceable verbatim to the product file, no forbidden text, no invented social proof, numbers labelled, feed cut, hashtags, one link, language | `content-lint.mjs` (content); `demand-analyze.mjs` and `demand-match.mjs` tests (demand) |
| 4 Quality | Is it good? | independent grader (a different agent that did not write it) scores a fixed rubric 0-5 with evidence. A noisy proxy: keep `n`, never trust it alone | grader run, score stored with `--quality` |
| 5 Verdicts | Does Yotam accept it? | approved / edited (with edit ratio) / rejected / published per item. **This is the ground truth for layer 4** | `agent-metrics.mjs outcome` |
| 6 Outcomes | Did it move the business? | Instagram/Facebook insights (reach, saves/reach, shares, link clicks) into D2R `metric` records; leads, quotes, wins in D2R | n8n insights branch (not connected yet), `d2r-ingest.mjs` |

## Rules
- A number with fewer than 5 runs or 5 verdicts is shown as "too little data to judge". No trends, no conclusions.
- Compare like with like: same format, same platform; one change per experiment (`marketing-experiments`).
- Calibrate the grader: after 10 items with both a grader score and a Yotam verdict, check whether high scores are the approved ones. If not, stop using the grader as a signal.
- Reach and saves are outcomes of many things (timing, account size). They are logged, not used to score the agent until an experiment isolates one variable.
- Logs hold no personal data: no names, contacts, listing text. `record` refuses emails and phone numbers in notes.

## Demand agent funnel
listings collected (per source) > clusters > recommended to build (with hour estimates by Yotam) > built > delivered > offer candidates (`demand-match.mjs`) > drafts approved > sent by Yotam > replies > quotes > wins. Each step is a count; the ratio between steps is the metric. Until Yotam supplies listings and estimates, only the first two steps exist.

## What cannot be measured from inside a run
Token cost and model price per run (not visible to the agent), Hebrew naturalness beyond what a grader and Yotam say, whether a scheduled run really fired when the machine was off (that is what the heartbeat is for), anything on Meta until the insights credential exists.

## Where the logs live (open decision)
`business/metrics/runs.jsonl` and `outcomes.jsonl` contain no personal data, so they may sit in git. A scheduled run starts from a clean checkout and cannot push without a decision from Yotam, so today the logs persist only if the run commits them to a branch. Options: (A) agents push logs to a dedicated `agent-data` branch, (B) the final Hebrew message to Yotam carries the numbers and he records them, (C) a D2R record type for runs with history (the existing `run` record holds only 500 characters and 100 rows). Recommended: A. Not decided, not implemented.

## First real test (2026-11-26): content-planner on Tori
See the section appended below after the independent grading.

### Result
- Layer 3: 5 drafts; first lint pass found one false failure (the checker read production notes as caption text). Fixed in the checker, then 50/50.
- Layer 4: independent grader (a different agent) scored the drafts on 6 criteria, 0-5. Mean 71/100 before fixes (drafts 21-22 of 30; weakest: hooks 2-3, Hebrew of draft C). Its concrete findings were valid and applied: ungrammatical Hebrew in C, an unverified claim in A ("see who is coming"), an outcome promise in B, a label-style hook in E. Open items it raised that need the app, not me: whether the owner sees who confirmed, and whether the KPIs sit on one screen.
- Layer 5: no verdicts yet. The score above is a proxy until Yotam approves, edits or rejects these.
- Duration is wall time of this one session, not a scheduled run. No scheduled agent has run unattended.
