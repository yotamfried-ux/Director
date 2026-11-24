---
name: social-content
description: Draft social posts, captions, carousels and reel cuts from the product videos, and handle the publishing approval gate. Use for Instagram/Facebook/LinkedIn/WhatsApp-status style content.
---
# Social content

Status: planned; drafting is allowed, publishing is not without approval.

## Drafting
- Start from `products/<slug>.md` verified claims; Hebrew first, specific not grandiose, no invented urgency/testimonials.
- Cut vertical clips from the Showcase (≤ 15s hook-first versions) and square/portrait variants via `Promo-*` compositions.
- Caption = 1 line hook + 2 lines value + one clear call to action (link: the product URL). Hashtags minimal.
- Research platform specs/opening retention before choosing formats (Engineering-OS `docs/product-experience/video-hooks-and-retention-research.md`).

## Approval gate (hard rule)
Prepare → send Yotam the exact text + file → wait for explicit "publish" for **that** post → publish through the connected tool (n8n/Postiz/channel API) → record it in `experiments/log.md` with the date and link. Never schedule or post on a standing instruction; never bulk-message people.

## Analytics (later)
Pull metrics from official analytics only, store a dated summary in the experiment log, propose the next variation.
