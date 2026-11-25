---
name: video-script
description: Turn product research into a scene-by-scene promo video script with timings, Hebrew captions, visual source per scene and music direction. Use before building any video.
---
# Video script

Requires a creative brief (`video-brief`, `products/<slug>-brief-vN.md`). Every scene must serve the one promise, a ranked proof or an objection; cut the rest.

## Structure (short promo, 20–30s, vertical)
1. **Hook (≈2s):** the pain in four words ("פחות הודעות. יותר תורים."). Text only.
2. **Core flow (≈8–10s):** the main job done on a real screen (customer books alone), 3 captions, one idea each.
3. **Result (≈3s):** where it lands for the owner.
4. **Differentiators (≈7s):** ONE continuous scene with 2–3 elements staggered (not separate pop-in cards).
5. **Proof of control/insight (≈5s):** numbers/reports, labelled "נתוני דמו".
6. **Outro (≈2s):** logo + tagline.

## Rules
- Caption = one short Hebrew idea, ≤ ~28 chars so it fits one line at 54px; fade in/out ≥10 frames.
- Every scene says its **visual source**: real screenshot / motion graphic with real labels / text.
- Time per scene must allow reading: ~0.4s per word minimum + 0.6s hold.
- Prefer smooth: every transition ≥20 frames at 30fps; no hard cuts between states.
- Site clip: 8s, 16:9, silent, zoomed UI; see `site-video`.
- Write the script as a table (time | scene | visual | caption) in `products/<slug>-script-vN.md` (example: `products/tori-script-v6.md`), plus "known limits".
- Send Yotam a short Hebrew summary of the script, then build unless he asked to approve first.
