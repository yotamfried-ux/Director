---
name: remotion-product-video
description: Build or modify Remotion compositions in src/ for product promos (phone showcase, site clips). Contains timing rules, smoothness rules, helper conventions and render commands.
---
# Remotion product video

## Files
`src/Promo.tsx` shared primitives (`Phone`, `Monitor`, `Shot`, `Sheen`, `Background`, `ease`, `lerp`, `fontFamily`) and the first 10s promo · `src/Site.tsx` 8s silent site cut (he/en) · `src/Showcase.tsx` 27s phone promo (`Hook` + `ShowcaseMain` + `AutoScene` + `InsightScene`) · `src/Root.tsx` compositions and caption data (`Showcase-9x16` = 820 frames @30fps, 1080×1920).

## Rules that came from Yotam's feedback
- Easing: `Easing.bezier(0.45,0,0.2,1)` ("soft") through `prog(f,a,b)`; never linear for UI motion.
- Global time stretch: `const f = useCurrentFrame()/SPEED` (1.12). Changing SPEED changes total length: update `durationInFrames` in `Root.tsx` and re-cut music.
- **No states that snap.** Blend colour with `interpolateColors`, crossfade labels (two stacked spans, opacities `1-t` / `t`), animate toggles' knob and track together.
- **No fake cursor/finger.** Show a soft accent highlight on the pressed element (`Finger` component renders only that), then change the screen 6–10 frames later.
- Screen changes: slide ≤50px + fade over ≥20 frames. Scene changes: blur+fade over 26–32 frames with overlap.
- Scenes shouldn't pile in the top half: centre vertically or scale (`transform: scale(1.06–1.1)`, `transformOrigin: top center`).
- Captions: pill at `H-250`, Heebo 54px bold, RTL, max width W-80.
- Real screenshots only for product UI; motion graphics must reuse the product's real labels and mark invented numbers "נתוני דמו".
- Remotion's `<Sequence from>` resets the frame: wrap hooks/intro that way (done in `Showcase`).

## Workflow
1. `npx tsc --noEmit`
2. Stills: `npx remotion still Showcase-9x16 /tmp/x.png --frame=N --gl=swangle` for ~5–8 frames (key moments + mid-transition); build a contact sheet with PIL and view it.
3. Full render in the background: `bash scripts/render-showcase.sh` (≈6 min for 27s on 2 cores; poll with a short loop, never one long sleep).
4. Hand over to `whatsapp-export`/`video-qa`.

## Gotchas
- `useCurrentFrame()` inside child components is relative to the nearest `Sequence`; pass `f` down explicitly when stretching time.
- Tori's phone screenshots are static: selection states are baked in.
- Heebo comes from `public/fonts`; do not rely on network fonts.
