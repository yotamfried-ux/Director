# Scheduled agents

The roster lives in `agents/registry.json`; each agent's instructions are in `routines/agents/<id>.md`, with shared rules in `routines/agents/_common.md`.

| Agent | Trigger | Job |
|---|---|---|
| intake | Sun-Thu 07:41 | active repos, new leads, approval queue |
| content-planner | Sunday 08:17 | next week's calendar and drafts |
| analyst | Thursday 08:23 | results, experiment log, next experiment |
| customer-finder | Tuesday 09:34 | candidate customers, draft outreach (do not send) |
| demand-scanner | Wednesday 09:12 | recurring freelance project types ranked by demand and ROI (allowed sources only) |
| lead-followup | event | triage a new lead, draft the reply |
| quote-pricing | event | quote or pricing proposal on request |
| product-intake | event | research a newly activated product |

Times are Asia/Jerusalem and avoid :00/:30 on purpose. Israel's work week is Sunday-Thursday.

## Rules
All agents are draft-only: no posting, sending, spending, price changes, account connections, and they cannot create other scheduled tasks. Personal data never goes to git or reports. Each run ends with one short Hebrew message to Yotam.

## Time triggers
`node scripts/agents.mjs payload <id>` prints the scheduled-task payload (name, prompt, `CRON_TZ=` cron). Create the task with that payload only after Yotam approves the cadence. Every agent starts as `proposed`; change `status` to `active` once its task exists.

## Event triggers
An event agent is a scheduled task with no cron of its own (a poke-only task). It runs when something fires it: Yotam, another Claude session, or an automation that calls the scheduled-task fire endpoint. Which external callers (for example n8n) may fire a task has not been verified; until it is, event agents are poked by Yotam in chat, and `intake` is the safety net that notices new leads and releases the next morning.

## Adding an agent
1. Add it to `agents/registry.json` and write `routines/agents/<id>.md` (copy a neighbour).
2. `node scripts/agents.mjs check` must pass (prompt exists, skills and agents exist, valid cron, no :00/:30).
3. Ask Yotam to approve the cadence, then create the task and set `status`.

## Not verified
No scheduled task has been created yet. No agent has run unattended. Connections still needed: Meta insights in n8n (analyst), D2R deployed (lead-followup, lead data in intake), a legal check before any cold outreach (customer-finder).

## demand-scanner
Finds automation, ETL and full-stack project types that recur, mainly in Israel, so one build can be sold to several owners. Collects listings, not people; allowed sources only (`business/demand/sources.json`); ranking by `scripts/demand-analyze.mjs`. ROI per build hour is computed only from Yotam's own hour estimates (`business/demand/effort.template.json`); without them it reports demand only. Tests: `node --test tests/demand.test.mjs` (demo fixture, synthetic data).

## Measurement and the delivery-to-offer path
Every run records itself and content drafts pass `scripts/content-lint.mjs`: see `docs/12-measurement.md`. The demand agent's path from a finished project to offers for the owners who asked for it: `scripts/demand-match.mjs` (candidates only; Yotam approves and sends each message). Sources reviewed 2026-11-26 in `business/demand/sources.json`.
The demand agent also checks each recurring type against Yotam's existing projects (`business/demand/assets.json`, `scripts/demand-reuse.mjs`) so a project with a similar base is built faster.

Demand agent autonomy (section 8 of Yotam's spec) lives in `routines/agents/demand-scanner.md` (scope, evidence levels, explicit vs inferred, Draft Only) and `routines/agents/auditor.md` (independent opportunity audit: VERIFIED / NEEDS_RESEARCH / NEEDS_CORRECTION / REJECTED / POLICY_BLOCKED). Ledger and statuses: `business/demand/SCHEMA.md`, `scripts/opportunity-audit.mjs`. Source access order: `access_ladder` in `business/demand/sources.json`.


## Roster since 2026-11-26 (supersedes the ten-agent list above)
Five agents, each run inside the Agent Shell (`docs/13-agent-shell.md`, charters in `agents/charters/`):
- **marketing**: plan, research, videos, posts and the analysis of network data; covers the products Yotam marks active (today: Tori), the business itself and his capabilities. Absorbs content-planner, content-producer, analyst, product-intake.
- **projects-scout**: freelance projects to take and recurring needs to build once and sell many times. Was demand-scanner.
- **product-customers**: businesses that could pay for products that already exist (for example barbers for the appointment system). Was customer-finder.
- **sales**: lead to decision for both customer types, with pricing and quotes. Absorbs lead-followup and quote-pricing.
- **auditor**: independent audit, plus the approval-queue and blocked-agent watch. Absorbs intake.
Which products are active is decided only by Yotam in `products/registry.json`; no agent discovers repos on its own. Every charter has a mandatory data-analysis question. All run data stays in `business/` (git-ignored where private); moving it to D2R Management is a later step.
