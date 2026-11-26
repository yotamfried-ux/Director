# Routines
Prompts for scheduled runs. Start every run with: read `CLAUDE.md`, `docs/10-business-os.md`, `docs/06-lessons-learned.md`, `products/registry.json`. Unattended: decide, say which reading you took, never publish/send/spend/change prices. Finish by sending Yotam one short Hebrew message (what is ready for his approval) and saving the report to `business/reports/<date>-<routine>.md`.

The eight scheduled agents (cron and event) are defined in `agents/registry.json` with prompts in `routines/agents/`; see `docs/11-agents.md`. The three files above are the earlier single-prompt versions.
