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
