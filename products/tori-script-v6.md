# Tori phone / WhatsApp promo — script v6 (approved by Yotam)

Format 1080×1920 · 30 fps · **27.3 s** · music: Elevate Inspirate (CC0, option A) · composition `Showcase-9x16` (`src/Showcase.tsx`, caption data in `src/Root.tsx`). `SPEED = 1.12` slows all inner timings by 12%.

| Time (approx) | Scene | Visual | Caption (Hebrew) |
|---|---|---|---|
| 0–1.8s | Hook | Dark bg, two lines staged | "פחות הודעות." / "יותר תורים." |
| 1.8–7s | Customer books alone | 3D phone, real screens: services → date → time (slide+fade ≥20f), soft highlight on pressed element | הלקוח בוחר שירות ויום · רואה רק שעות פנויות · ומקבל אישור מיידי |
| 7–10s | It's already in the calendar | Phone shows owner agenda | ובצד העסק, התור כבר ביומן |
| 10.5–14.5s | Owner calendar | Monitor with real weekly calendar | יומן שבועי עם תפוסה ושעות פנויות |
| 14–21s | It runs itself | One continuous scene, three cards staggered: reminder + "אישור הגעה" press → waitlist slot `בוטל → הוצע לממתין → נקבע` → rules toggles | תזכורות ורשימת המתנה, הכול אוטומטי |
| 20.5–25.8s | You see what's happening | Reports: KPIs count up (תורים, הכנסות, אי-הגעות, לקוחות חוזרים), bars by day, by service, Excel export chip, "נתוני דמו" | ודוחות ברורים על מה שקורה בעסק |
| 25.3–27.3s | Outro | Logo icon + TORI + tagline | — |

## Why this storyboard (buyer lens)
See `docs/02-marketing-method.md`: remove ping-pong → fill empty hours → keep control → know your numbers.

## Known limits
- Scenes 5–6 are motion graphics (no real dark screenshots yet); numbers are demo.
- Phone screens show pre-selected state (e.g. 10:00 already highlighted) because screenshots are static.
- Scene content sits in the upper ~70% of the frame; free space below could host a secondary visual.
- Logo hit is not beat-synced.

## Rendering
`bash scripts/render-showcase.sh` (≈6 min on 2 cores) → `out/showcase/whatsapp.mp4` (≈7.8 MB, H.264 Main L4.0 + AAC).
