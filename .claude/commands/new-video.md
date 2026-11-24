---
description: Create a new promo video for a product end to end (research → script → build → QA → deliver)
argument-hint: <product slug or name> [phone|site|both]
---
Produce a promo video for **$ARGUMENTS** following `docs/01-workflow.md` exactly:
1. Use skill `product-research` (create/update `products/<slug>.md`).
2. Use skill `video-script` (write `products/<slug>-script-v1.md`, send Yotam a short Hebrew summary).
3. Build with `remotion-product-video` (stills first), choose music with `music-selection` (A/B), export with `whatsapp-export` and/or `site-video`.
4. Run `video-qa`, deliver inline, log with `marketing-experiments`.
Talk to Yotam in Hebrew; do not publish anything.
