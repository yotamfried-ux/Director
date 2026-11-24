---
name: site-video
description: Produce silent per-locale (he/en) 16:9 clips and poster for Yotam's websites, and integrate them into the portfolio repo (Next.js) with tests and a PR.
---
# Site video (portfolio & product sites)

## Clip spec
8s, 1280×720, 30fps, **silent**, soft easing, UI zoomed (card is ~630px wide: phone height 700, monitor 940 wide), 3 short captions (58px), locale variants `Site-he` / `Site-en`, poster WebP **without text**. Too fast felt unnatural, too slow felt dull; this pacing was approved. Render: `bash scripts/render-site.sh`.

## Integrating into `yotamfried-ux/Portfolio`
- Files: `public/media/<slug>-preview-{en,he}.mp4`, `public/media/<slug>.webp` (poster).
- `src/lib/media.ts`: `Video.src` is `string | Bilingual`; use `videoSrc(video, locale)`; set `isIllustration:true` and a bilingual `attribution`.
- CSS: cards with video use 16/9 ratio (`globals.css`).
- Tests: `npm test` (tsx unit tests incl. `tests/content.test.ts`), Playwright e2e with `PLAYWRIGHT_CHROMIUM_PATH=/usr/bin/google-chrome`.
- PRs: GitHub GraphQL is blocked → create/merge with `gh api repos/yotamfried-ux/Portfolio/pulls …` (REST). CI is "Portfolio CI" (must pass; re-run via `gh api -X POST …/actions/runs/<id>/rerun`). Vercel gives preview URLs; Yotam verifies the live site.
- Never merge without Yotam's go-ahead.
