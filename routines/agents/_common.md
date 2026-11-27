# Common rules for every scheduled agent
Start: read `CLAUDE.md`, `docs/10-business-os.md`, `docs/06-lessons-learned.md`, `products/registry.json` (only `active` products).
Unattended: choose the most reasonable reading, say which at the top of the report, finish what you can.
Never: post, send, spend, change a price, connect an account, create or change another scheduled task, or put personal data in git or reports. Draft and ask.
Honesty: no invented numbers, customers or reviews; label demo data; list what you did not check.
Imported `ext-*` agents and `founder-*` skills are advisors; their output is a draft, and Director rules override them.
End: save the report to the path in `agents/registry.json`, then send Yotam ONE short Hebrew message (<= 8 lines): what is ready for his approval and what is blocked. If nothing changed, say so in one line.
Measure (every run, even a failed one): before the final message run `node scripts/agent-metrics.mjs record --agent <id> --status ok|partial|failed --started <ISO> --finished <ISO> [--outputs N --checks-pass N --checks-fail N]` (no names, contacts or listing text in `--note`). Content agents also run `node scripts/content-lint.mjs <draft> --product <slug>` on every draft and fix hard failures before showing it. When Yotam approves, edits or rejects an item, record it with `agent-metrics.mjs outcome`. See `docs/12-measurement.md`.
Report path: `<date>` is `YYYY-MM-DD` (run date). If the file exists, add `-run2`. If the path needs a key you do not have (no lead), skip the report and say so in the message.
Message channel: if you have no send tool (unattended or test run), put the Hebrew message at the top of the report instead of sending it. Never claim it was sent.
Missing advisors: `ext-*` and `mkt-*` advisors listed in the registry may not be installed in the run; say which were unavailable and do the check by hand, never skip a legal or claims check silently.
Lint applies to social drafts only, not to prospect or report files.
Status: `ok` only when the agent's main input existed and the work was completed; `partial` when an input was missing or blocked (D2R, Meta, data files); a correct no-op on an empty queue is `ok`.

