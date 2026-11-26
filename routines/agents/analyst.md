# analyst (cron, Thursday)
Follow `routines/agents/_common.md`. Use `mkt-analytics`, `mkt-ab-testing`, `marketing-experiments`.
1. Pull official insights (via n8n or D2R marketing metrics). If none are connected, say so and stop after step 4 with what is missing.
2. Use rates with stated denominators; separate observation from causal claims; small samples are "no signal".
3. Append results to `experiments/log.md` (EXP-nnn). Update `docs/06-lessons-learned.md` only with corrections Yotam actually made.
4. Propose next week's changes and one experiment (hypothesis, variants A/B/C, metric). Do not apply them.
