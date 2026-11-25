# SportReel — product brief for marketing

- **What:** a pipeline that turns drone footage of many athletes (surf, cycling) into a personal vertical reel for each athlete. Part of Yotam's D2R drone-content work. Portfolio entry: project page `sportreel` on `portfolio.d2ryf.com`.
- **Audience on the portfolio site:** freelance clients (what it does for a customer, not how). Engineering detail belongs in the project-page exploration views, not in the videos.
- **Video look:** dark navy `#0A0E1A`, yellow `#FFD60A` brackets, cyan `#00E5FF` accent, Heebo font. 16:9, 30fps, silent. EN + HE captions (footage has no UI text, so both locales share the same picture).

## Verified claims (safe to show or say) — verified 2026-11-25 against the pipeline as described by Yotam and the sidecar data; re-verify before the next video
- Finds the athletes in each clip and follows each one (Ultralytics YOLO detection + BoT-SORT tracking).
- Links the same athlete across different clips **without face recognition** (non-biometric athlete ids). Say "without face recognition" exactly this way.
- Picks the full ride/run and crops a tracked, athlete-centred frame; output is **vertical** (reel proxies are 720x1280) and ready to post.
- One personal reel per athlete.

## Not to claim
- **"4K"**: the reel proxies are 720x1280; original resolution is not what the pipeline outputs today. Removed from captions once; do not bring it back until real 4K masters exist.
- Accuracy numbers, speed, "AI" marketing language, customers, athlete names, any real person's identity.
- Real people appear only as small, unidentifiable figures in drone shots.

## Assets (in `public/sportreel/`, ~85 MB, **not committed**: regenerate or copy from Yotam's machine)
`clips/`, `plates/` (title backgrounds), `reel/reel_0097.mp4` (reel shown dissolving in at the end), `data/` (tracks sidecars), `logo.png`, `icon.png`.

## Technical constraints that bit us
- Sidecar (track) time = **proxy time + window start**. 0094 offset 2.0 s; 0097 `CLIP97_T0` = 1.001 s; the 0097 proxy is only 9.17 s. A wrong offset puts the brackets beside the athlete, not on them.
- Featured-athlete boxes are **display-smoothed** (EMA) so brackets glide; raw detections jitter and look broken.
- Phone/reel `OffthreadVideo` needs a constant `startFrom`/`playbackRate`; wrap in the `Local` helper to start a clip at a chosen moment.
- Noisy water footage explodes CRF encodes (40 MB for 30 s): use target-bitrate site encodes (below).

## Compositions (src/SportReelSite5.tsx; older v1–v4 kept for history)
- `SportReel5-long-{en,he}`: 902 frames (30.07 s) — hook → chaos grid expanding into the hero clip (match-cut) → identity linking → centre lineup → phone/reel → end. **On the site (card preview + project page).**
- `SportReel5-short-{en,he}`: 336 frames (11.2 s) — one idea (clip → follow → vertical reel), dissolves to the playing reel. **Rejected by Yotam (2026-11-25: "I don't like the short"); not on the site.** Redo as a new concept only if he asks.

## Site encodes
Demo 1080p: `-b:v 2300k -maxrate 3200k -bufsize 6400k` (≈7.6 MB). Card preview 720p: `-b:v 850k -maxrate 1300k -bufsize 2600k` (≈2.8 MB; some blocking in mid-fade frames — raise to ~1200k if it bothers him).
