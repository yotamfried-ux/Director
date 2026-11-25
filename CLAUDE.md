# Director — Yotam's marketing & content studio

This repo is the working memory and toolbox of the agent (Claude, usually in Cowork / Claude Code) that produces **all marketing and content for Yotam's software products**: promo videos for WhatsApp groups, silent clips for his websites, social content, later publishing and performance analysis. It improves over time through logged experiments (`experiments/`).

Owner: Yotam (independent builder, Israel). **Talk to him in Hebrew.** Docs and skills here are in English; on-screen product copy is Hebrew (RTL) unless a locale variant is requested.

## Read first
1. `docs/00-vision.md` — what this repo is for and the roadmap.
2. `docs/01-workflow.md` — the mandatory flow: research → script → build → QA → deliver.
3. `docs/06-lessons-learned.md` — every correction Yotam made so far. Do not repeat them.
4. The product file: `products/<slug>.md` (+ `.json`). Tori is the reference.

## Non-negotiable rules
- **Research and script before building.** Understand the product as a buyer/business owner would, write the script, show it to Yotam (short, Hebrew), then execute. Do not start rendering on a guess.
- **Only claim what the product really does.** Every on-screen claim must come from the product's own docs/copy/UI (see `products/<slug>.md` "verified claims"). Never advertise payments/invoicing for Tori (skeleton only). No invented numbers, testimonials, reviews or customers.
- **All data shown is demo data.** Label invented numbers "נתוני דמו" on screen. Real customer data never appears.
- **Dark mode** for product videos. UI is rendered in Remotion from real screenshots or from faithful motion graphics using the product's real labels; never let an AI video model draw text or UI.
- **Nothing is published to any social network or sent to anyone without Yotam's explicit approval** in chat, per action.
- **Music: real CC0 tracks only** (see `docs/04-music.md`). Synthesized music was rejected twice.
- **Site clips are silent.** Music is only on the phone/WhatsApp version.
- **Options are named A/B/C, never "left/right"** (the UI is RTL; position is ambiguous).
- Do not wait with long `sleep`s; poll renders in short loops and keep Yotam informed with one line.
- Verify outputs before delivering (`docs/05-qa.md`), then send the file inline. State plainly what you did not check.

## Skills (`.claude/skills/`)
| Skill | Use when |
|---|---|
| `product-research` | Starting a video for any product: buyer lens, verified feature list, claims |
| `video-brief` | Before any script: goal, viewer, one promise, sales angle A/B/C; again as director review after the build |
| `video-script` | Turning research into a scene-by-scene script with timings and Hebrew copy |
| `remotion-product-video` | Building/modifying compositions in `src/` |
| `whatsapp-export` | Final encode, music mux, delivery guidance for WhatsApp |
| `site-video` | Silent per-locale clips for the portfolio / product sites |
| `music-selection` | Choosing and trimming CC0 music |
| `video-qa` | Checking a render before delivery |
| `marketing-experiments` | Logging hypotheses and results; improving this repo |
| `social-content` | Posts/captions/carousels and the publishing approval gate |

Commands: `/new-video <product>` runs the whole flow; `/log-experiment` adds a log entry.

## Repo map
`src/` Remotion compositions (Promo, Site, Showcase) · `public/` fonts, logo, product screenshots · `products/` per-product brief + script · `scripts/` render/encode/QA/music tools · `music/library/` chosen CC0 tracks · `docs/` method and decisions · `experiments/` log.

## Setup (sandbox or local)
`npm ci` · system Chrome (`CHROME_PATH`, default `/usr/bin/google-chrome`; renders use `--gl=swangle`, `--concurrency=2`) · `ffmpeg` · `tesseract` with `heb` + `eng` · Python 3 with `numpy scipy pillow` (`pip install --break-system-packages …`). GitHub GraphQL is blocked in Claude Code sessions: use `gh api` REST for PRs. Details: `docs/07-setup.md`.
