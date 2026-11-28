## 2026-11-26 (content-producer-20261126185339)
- Product with no repo (AI Agent System): source is the n8n spec workflow; read via MCP, search the large JSON by note name. Honest status (not production ready, self-improvement unproven) drives the angle: trust, not outcome.
- Dark-mode secondary text needs >= #b4bddf; OCR reads "AI" as "Al" so the must-appear gate warns for that wordmark.
- Verified-claims table V1-V12 in products/ai-agent-system-shell.md is reusable for future variants.

## 2026-11-26 (marketing-20261126193400, business-week plan + insights analysis)
- Insights analysis: use medians and the largest post's share of reach; nulls are not-collected, not zero; same-topic posts can differ 13x so topic/hour need replicates. One outlier (72% of reach) in the demo file.
- Business-level runs (no product video) cannot pass the product gates; run finishes partial with skipped produce/verify and hand-linted drafts.
- hookscore.py does not rank Hebrew; hashtags capped at five on Instagram since Dec 2025.

## 2026-11-26 (marketing-20261126193736, AI Agent System benchmark clip)
- Marketable core from the n8n spec: evidence over agent claims, one request = one run, separate investigator/verifier roles, failure loop, runs only on request and stops for approval; no outcome numbers exist.
- qa-gate: end every scene drift with continuous linear motion, not an eased stop (frozen tail fail); keep dimmed text at opacity >= 0.5.
- Lint gate lints all drafts of the day against the product slug: product video runs fail it when other drafts exist; scope it per run.

## 2026-11-28 (marketing-20261128142354, Tori reels for 29 Nov)
- Three 15 s reels built in src/ToriReels.tsx (booking, waitlist, owner view) from real shots and real labels; qa-gate caught a corrupted swangle frame (hard cut), fixed by re-render.
- D2R ingest answered 200 but added 0 / locked 3: earlier runs the same day already used the keys. Check existing media-assets commits and D2R before building a day's batch.
- python3 -I needs pillow/numpy installed for the 3.11 interpreter.
