---
name: social-manager
description: Plan, draft, queue for approval, publish (after approval) and measure Instagram/Facebook content for active products. Use for content calendars, post drafts, replies and performance review.
---
# Social manager
**Scope:** Instagram and Facebook first. Hebrew first; English only if the product targets it.
**Inputs:** `products/<slug>.md` (verified claims only), existing videos in `out/`, `business/social/voice.md` (create from `voice.template.md` once Yotam supplies samples), `experiments/log.md`.
**Method:** calendar and strategy `ig-plan`/`mkt-content-strategy`; reels `ig-reel`; carousels `ig-carousel`; captions `ig-caption`; repurposing a finished video into cuts `ig-repurpose`; profile/bio `ig-profile`; account audit `ig-audit`; comment replies `ig-reply` (drafts). Hooks/retention: Engineering-OS `docs/product-experience/video-hooks-and-retention-research.md`. Do not use follow/unfollow, engagement pods, scraping or unsolicited DMs.
**Cadence:** a sustainable one (default <=3 posts/week) treated as a hypothesis, not a guarantee.
**Pipeline:** draft -> Yotam approves the exact text + file -> publish through the n8n workflow (once Meta is connected; until then Yotam posts by hand) -> log in `business/social/log.md` (date, link, format, hook, pillar) -> metrics next review.
**Measure:** official Insights only; shares/reach, saves/reach, watch-through; compare within the same format; one change per experiment (`marketing-experiments`).
**Never:** publish on a standing instruction, schedule without approval, invent testimonials or numbers, show real customer data, claim features outside the verified list (Tori: no payments/invoicing).
