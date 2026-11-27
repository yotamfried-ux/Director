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
- **Links (Yotam, 26 Nov 2026): every big project needs its link both in the profile bio and in its posts.** Use the full `https://` URL on its own line so it is clickable.
  - Facebook: the URL in the post text is clickable.
  - Instagram: a caption link is never clickable. Still put the full URL on its own line, and add "הקישור בביו". Instagram allows up to 5 links in the bio; add one only for a project that is ready and approved here.
  - Right now Tori (`https://turim.d2ryf.com`) is the only project that gets a link and posts (Yotam, 26 Nov 2026). SportReel is not ready yet: no posts or bio link until Yotam says so. AI Agent System is an internal infrastructure project for Yotam only: never post it or link it on Instagram/Facebook.
  - The portfolio link (`https://portfolio.d2ryf.com/projects`) stays in the bio always (Yotam, 26 Nov 2026): it is for people who may want to hire him, and it links to neither SportReel nor AI Agent System. Bio links now: portfolio + Tori. SportReel is added later when he says it is ready.
  - A product without a `url` in the registry gets no post until Yotam supplies it.
- Research platform specs/opening retention before choosing formats (Engineering-OS `docs/product-experience/video-hooks-and-retention-research.md`).

## Approval gate (hard rule)
Prepare → send Yotam the exact text + file → wait for explicit "publish" for **that** post → publish through the connected tool (n8n/Postiz/channel API) → record it in `experiments/log.md` with the date and link. Never schedule or post on a standing instruction; never bulk-message people.
**Daily batch (since 27 Nov 2026):** Yotam may approve all of one day's posts together. The batch message lists, per post, the exact IG/FB text, the file and the slot time; his approval (given at the latest the day before) covers exactly those items on that date and then expires; a post not published within 2 hours after its slot lapses. Anything changed afterwards needs a new approval. See `business/social/rules.md`.

## Analytics (later)
Pull metrics from official analytics only, store a dated summary in the experiment log, propose the next variation.
