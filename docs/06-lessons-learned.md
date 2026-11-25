# Lessons learned (Yotam's feedback, in order) — do not repeat

## Process
- He interrupts long blind waits: no `sleep 150`. Poll in short loops; one line of status.
- "Understand the system first": research from the buyer's perspective, **write the script, then execute**. Sent script is welcome; do not build on a guess.
- Use real product material; he checks details (he noticed the wrong music option was applied). When he picks A/B, apply exactly that.
- Everything shown is demo data; say so.

## Site clips
- First cut was too slow for a ~630px card (UI unreadable) → zoom in, bigger text. Second cut too fast and "unnatural" → **8s @30fps, soft ease-in-out `bezier(.45,0,.2,1)`, longer holds**. Per-locale files (he/en), **silent**, poster without text. Cards with video use 16/9 in CSS.
- Merge flow: PR via `gh api` REST (GraphQL blocked), CI must pass, then merge; repo had to be public for CI billing.

## Phone / WhatsApp promo
- Must be an MP4 that WhatsApp sends as a **video**, not a document (export spec in `skills/whatsapp-export`).
- The first version did not show the app's advantages → marketing-first storyboard (buyer lens).
- Feature display as stacked pop-in cards looked abrupt → **one continuous scene**, staggered, eased; no snaps: blend colours with `interpolateColors`, crossfade changing labels, longer in/out (≥ 25 frames).
- Fake mouse/tap dots "look unnatural" (twice: ripple dots, then a travelling translucent finger) → **no cursor at all; soft highlight on the pressed element, then the screen changes**.
- Transitions "too fast" → global time stretch (`SPEED = 1.12`) and slide+fade screen changes ≥ 20 frames.
- Music: synthesized pads/plucks rejected twice → real CC0 track, rhythmic & positive.
- Length: ~20s liked, 27s accepted with richer content.
- Captions: pill at bottom, one idea each, short; avoid wrapping to two lines.
- Don't show unverified features; no payments/invoices.

## Technical
- Remotion with system Chrome, `--gl=swangle`, `--concurrency=2` (2 cores); local Heebo font; renders ≈ 5–6 min for 27s at 1080x1920.
- A shallow clone `git pull` can fail on divergence; use `fetch --depth=1` + `reset --hard`.
- A stale `next start` served old assets; kill it before screenshots.

## Long/short site videos and SportReel (2026-11-24/25)
- **A short is not a sped-up long.** Yotam rejected the 8–11 s cut that was just the long one compressed ("it doesn't really work that way"). Give each length its own single idea and script it separately; if there is no separate idea, don't make the short.
- **Continuous transitions beat "nice" ones.** Cuts and generic fades read as unnatural. What worked: match-cuts where one element becomes the next scene (grid cell → full-screen hero clip; phone → centre lineup). Overlap ≥ 24 frames, blur+fade, no hard cuts.
- **Nothing ends frozen.** A held last frame (the phone) felt dead; dissolve into the real clip still playing. `scripts/qa-gate.py` now fails a static tail ≥ 1.2 s.
- **Do not state specs you have not verified.** "Vertical 4K" went into captions; proxies are 720x1280. Every claim needs a line in `products/<slug>.md` "Verified claims"; `forbidden_text` in the product json is OCR-checked.
- **Track/sidecar time ≠ clip time.** Sidecar time = proxy time + window start (per clip: 0094 = 2.0 s, 0097 = 1.001 s). When boxes are not centred on the athlete, check this offset first, then smoothing.
- **Smooth the featured athlete's box** (display smoothing) — raw tracker output jitters.
- **Captions on busy footage:** bigger (56 px), double shadow, short; check contrast, do not trust the eye at full size (the card shows it at ~600 px).
- **Site encodes:** CRF is wrong for noisy water footage (40 MB). Use target bitrate: demo 1080p `2300k/3200k/6400k`, preview 720p `850k/1300k/2600k`. Mid-fade blocking still shows at 850k.
- **UI-screenshot videos are single-locale:** the EN variant of Tori is English captions over the Hebrew UI; say so.
- **Process:** use the repo skills (video-script → remotion-product-video → video-qa → site-video) every time; Yotam noticed when I didn't. Run one Remotion render at a time (two heavy jobs → "Compositor quit with signal SIGKILL"). Approve-then-merge per PR, never before his explicit go-ahead.
- **Check the live site, not only the repo.** What a visitor sees (cache, deploy lag) can differ from `main`; verify the project page and tell him what you could not see.
- **Forbidden claims expire.** "Not shipped" is a dated fact, not a permanent rule (Yotam, 2026-11-25). Each video starts by re-verifying claims against the product's current state; `claims_verified_at` in the product json makes `qa-gate.py` warn after 14 days.
- **Direction before craft.** Each video starts with a creative brief (goal, viewer and moment, one promise, sales angle, objections, form/length reason) and ends with a director's review (5-second, message, honesty, feel, cut). Skill: `video-brief`.
