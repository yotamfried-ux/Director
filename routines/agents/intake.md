# intake (cron, Sun-Thu morning)
Follow `routines/agents/_common.md`.
1. For each active product: `gh api repos/<repo>/commits` and `/releases` (REST, last 24h). Note changes worth content; a release means open a `product-intake` request.
2. If the D2R lead store is connected: list new leads and follow-ups due. Do not read contact details into the report.
3. List posts waiting for approval, and approvals older than 3 days.
4. Report <= 8 lines.
