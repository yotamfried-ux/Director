# Vision & roadmap

**Goal:** one repo from which Claude produces all marketing and content for Yotam's business: promo videos for WhatsApp groups, silent clips for websites, social posts, and later publishing + performance analysis — improving through experiments.

## Outputs (all supported or planned)
| Output | Status | Where |
|---|---|---|
| Phone / WhatsApp promo, 9:16, ~27s, music | **Done for Tori (v6, approved)** | `src/Showcase.tsx`, `skills/whatsapp-export` |
| Site clips, 16:9, 8s, silent, he + en | **Done for Tori (live in portfolio)** | `src/Site.tsx`, `skills/site-video` |
| Short promo 10s in 16:9 / 9:16 / 1:1 | Done (first generation, superseded by Showcase) | `src/Promo.tsx` |
| Social content (posts, captions, carousels, reels cuts) | Planned | `skills/social-content` |
| Publishing with human approval | Planned (n8n / Postiz) | `docs/03-publishing-and-analytics.md` |
| Performance analysis → feed back into experiments | Planned | `docs/03-publishing-and-analytics.md` |

## Products
Tori (appointment scheduling, live at turim.d2ryf.com) is done. Next: **SportReel** (drone surf/football content pipeline, see Yotam's D2R project), then others from the portfolio (portfolio.d2ryf.com, repo `yotamfried-ux/Portfolio`).

## Roadmap
1. Generalise compositions: today `Showcase.tsx`/`Site.tsx` hold Tori-specific scenes. Extract reusable scenes (phone flow, monitor, feature scene, insights scene, outro) driven by `products/<slug>.json` props.
2. SportReel video using the same flow (research → script → build → QA).
3. Capture real dark-mode screenshots of reports/waitlist/reminders for Tori (needs the app running with a local DB) to replace motion graphics.
4. n8n automations: render → approval message → publish; schedule.
5. Social publishing with approval, then analytics collection and a weekly experiment review.
6. Add capability entries to Engineering-OS (needs a push from Yotam's side).
