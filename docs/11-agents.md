# Scheduled agents

The roster lives in `agents/registry.json`; each agent's instructions are in `routines/agents/<id>.md`, with shared rules in `routines/agents/_common.md`.

| Agent | Trigger | Job |
|---|---|---|
| intake | Sun-Thu 07:41 | active repos, new leads, approval queue |
| content-planner | Sunday 08:17 | next week's calendar and drafts |
| analyst | Thursday 08:23 | results, experiment log, next experiment |
| customer-finder | Tuesday 09:34 | candidate customers, draft outreach (do not send) |
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
