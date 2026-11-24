---
name: product-research
description: Use at the start of any promo/marketing video or post for a software product. Understand the product as a business owner would buy it and produce a verified feature list, buyer pains, allowed/forbidden claims and an asset inventory.
---
# Product research (buyer lens)

Do this before any script. Yotam explicitly requires: understand the system first, think like an independent business owner, go beyond basic features, think marketing.

## Steps
1. **Gather sources** (read, don't guess): the product's repo docs and UI strings (e.g. `messages/he.json` `home.*`), readiness/evidence docs, live site, existing screenshots/videos (Google Drive connector), portfolio entry (`Portfolio/src/lib/media.ts`). Reference: `products/tori.md`.
2. **List what exists vs what is only planned/skeleton.** Mark skeleton features as forbidden (Tori: payments/invoicing).
3. **Buyer lens:** who pays, what hurts (time, money, stress), what they compare against, what makes them say "I want this". Map each pain to a verified feature (table like `docs/02-marketing-method.md`). Go past basics: automations, control, insight, trust.
4. **Pick 4–6 advantages** forming a story: remove pain → show it working → show control → show numbers.
5. **Asset inventory:** which advantages have real screenshots, which need capture, which need motion graphics built from real labels. Flag the gap honestly.
6. **Write `products/<slug>.md`**: facts, verified claims with source, forbidden claims, audience, tone, assets.
7. Optional hypothesis generation: Engineering-OS `founder-skill` / `minimalist-entrepreneur` (synthetic personas = hypotheses only, never evidence).

## Output
`products/<slug>.md` + a 5-line Hebrew summary to Yotam. Then run `video-script`.

## Never
Invent stats, testimonials, customers or capabilities; present demo data as real; read private customer data.
