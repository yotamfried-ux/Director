---
name: business-os
description: Entry point for running Yotam's business domains (marketing, social, pricing and quotes, leads, finding customers, analytics). Use at the start of any scheduled run or any request that is not purely "make a video".
---
# Business OS (router)
1. Read `docs/10-business-os.md` and `products/registry.json` (only `active` products).
2. Route by domain: video -> `new-video`; social -> `social-manager`; pricing/quotes -> `pricing-manager`; leads -> `lead-manager`; new customers -> `customer-finder`; new repo/product -> `github-product-intake`; results -> `marketing-experiments`. Method detail lives in the `mkt-*` and `ig-*` skills.
3. Need background knowledge? Open Engineering-OS through `capability-registry/ROUTING-MAP.md`, read only the matching branch (map in `docs/10-business-os.md`). Prefer official sources; do not claim PASS without evidence.
4. Every outward action (post, message, quote, price change, spend, account connection) = prepare, send Yotam the exact content in Hebrew, wait for explicit approval for that action, then execute and log.
5. Unattended: choose the most reasonable reading, say which at the top, never do an irreversible step, report in <=8 lines.
6. Scheduled runs: the roster and rules are in `docs/11-agents.md` and `agents/registry.json`; run `node scripts/agents.mjs check` after editing them.
7. Honesty: no invented numbers, customers or reviews; label demo data; state what you did not check.
