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

## 2026-11-28 (marketing-20261128083201, Tori reels batch for 29 Nov)
- D2R ingest returns HTTP 200 even when publications are "locked" (key already approved/finished): check added vs locked and use a v2 key for same-day re-runs.
- Reels pipeline: src/Reels.tsx (3 compositions, 15 s, ~1 min per render), poster via --props poster, encode H.264 Main + AAC faststart, files to media-assets/reels/<date>-vN/.
- qa-gate: opacity-only cross-fades with long overlap avoid false "hard cut" fails; split hook text into short lines.
