# Experiment log
Format: `experiments/template.md`. Qualitative entries are Yotam's feedback in chat (2026-11-24); no channel metrics exist yet.

### EXP-001 — site clip pacing (2026-11-24)
- **Product / asset:** Tori site cut (he/en)
- **Hypothesis:** a faster, zoomed cut reads better in the ~630px portfolio card than the 10s phone cut.
- **Variants:** A = phone-cut pacing, UI small · B = fast cut · C = 8s, soft ease-in-out, longer holds, zoomed UI.
- **Evidence:** A "too slow and hard to read in the small frame"; B "too fast, unnatural, unpleasant"; C accepted ("upload this one").
- **Decision:** keep C (8s @30fps, `bezier(.45,0,.2,1)`).
- **Where recorded:** `docs/06-lessons-learned.md`, `skills/site-video`.

### EXP-002 — advantages-first storyboard (2026-11-24)
- **Product / asset:** Tori phone promo
- **Hypothesis:** a buyer-lens storyboard (pain → flow → automation → reports) conveys the product's strengths better than a feature walk-through.
- **Variants:** A = 10s feature walk-through · B = v1 20s with stacked feature cards · C = v6 27s with continuous automation scene + reports.
- **Evidence:** A "doesn't emphasise advantages enough"; B direction "better", cards "not smooth"; C "excellent".
- **Decision:** keep C; keep buyer-lens research as mandatory step.
- **Where recorded:** `docs/02-marketing-method.md`, `products/tori-script-v6.md`.

### EXP-003 — touch indicator (2026-11-24)
- **Hypothesis:** an on-screen tap indicator makes the demo feel real.
- **Variants:** A = ripple dots · B = travelling translucent finger · C = no cursor, soft highlight on the pressed element.
- **Evidence:** A and B "unnatural"; C accepted.
- **Decision:** C. **Recorded:** `skills/remotion-product-video`.

### EXP-004 — music (2026-11-24)
- **Hypothesis:** background music strengthens the phone version.
- **Variants:** A = synthesized warm pads · B = real CC0 "Advertime" (~117 BPM) · C = real CC0 "Elevate Inspirate" (~103 BPM).
- **Evidence:** synthesized: "odd, unpleasant", then "doesn't carry the message"; real tracks: preferred; chose Elevate Inspirate.
- **Decision:** real CC0 only; Elevate Inspirate for Tori. **Recorded:** `docs/04-music.md`.

### EXP-005 — state-change smoothness in the automation scene (2026-11-24)
- **Variants:** A = threshold swaps at 50% (button, status chip, toggles) · B = continuous colour blend + crossfaded labels.
- **Evidence:** A "button presses not smooth"; B accepted.
- **Decision:** B. **Recorded:** `skills/remotion-product-video`.

### EXP-005 — short vs long site videos (2026-11-24/25)
- **Product / asset:** Tori and SportReel site clips (16:9, silent, he/en)
- **Hypothesis:** a short card-preview cut derived from the long walkthrough gives visitors the same message faster.
- **Variants:** A = long sped up/trimmed · B = independent one-idea short · C = long only in both card and project page.
- **Evidence:** A "just a fast version of the long, doesn't work"; Tori long accepted and merged; SportReel long accepted and merged; SportReel short B (v6) "I don't like it" → use the long in card and page.
- **Decision:** SportReel: long only (card preview 720p + project page 1080p). Tori: agreed 8 s card cut + long on project page. Shorts only when they carry their own idea.
- **Where recorded:** `docs/06-lessons-learned.md`, `products/sportreel.md`, `products/tori-script-long-v1.md`.

### EXP-006 — match-cut transitions in SportReel (2026-11-25)
- **Hypothesis:** continuous match-cut transitions look more natural than separate scenes with fades.
- **Variants:** v4 separate scenes with fades · v5 grid→hero clip and phone→lineup match-cuts.
- **Evidence:** v4 "transitions unnatural, boxes not centred"; v5 "closer to what we want", then long approved.
- **Decision:** keep match-cuts; keep sidecar-offset + display-smoothing fixes. **Recorded:** lessons, `products/sportreel.md`.

### EXP-007 — Flow plates vs real footage (2026-11-24)
- **Hypothesis:** AI-generated plates can replace real-footage scenes.
- **Evidence:** plates work as title/atmosphere backgrounds; real-footage scenes must stay real (the model cannot draw athletes/UI faithfully).
- **Decision:** plates yes (titles), generated footage no. **Recorded:** `products/sportreel.md`.

### EXP-008 — churn overview: reading budget and UI (2026-11-25)
- **Product / asset:** Customer Churn Prediction project clip (`Churn-overview-he/en`, 16:9, silent)
- **Hypothesis:** the clip fails because viewers cannot read it in time (too many words per second, 24-frame cross-fades), not because the content is wrong.
- **Variants:** journey-of-one-customer v1 (60 s plan) · overview v1 30 s · v2 33 s with background + stepper · v3 39.5 s with a reading budget (≥0.4 s/word, ≥1.3 s full-visible hold, 30-frame cross-fades via `Scene fade`), bigger type, one-screen prep+models, labelled 70–82% axis, 374-dot "193 found" picture, cards that fit the frame.
- **Evidence:** v1 journey "not good, text not good, can't understand"; 60 s "too long"; overview v1 "improved but unfinished, no background"; v2 "UI needs improvement, transitions too fast to read and understand". v3: awaiting verdict.
- **Director notes (v3):** 5-second test passes (title, course project, goal by 3 s); honesty: all numbers from `products/churn-prediction.md`, truncated axis labelled; cut test: AUC kept only as small stat. Length 39.5 s is longer than Yotam's 30 s target: stated to him as a trade-off.
- **Decision:** pending Yotam. **Recorded:** `products/churn-prediction-script-v3.md`.

### EXP-009 — first Reel hook for Tori (proposed 2026-11-26, not run)
- **Hypothesis:** a pain-first hook holds viewers longer than a product-first hook.
- **Variants:** A = pain-first · B = product-first · C = result-first (demo data labelled "נתוני דמו").
- **Metric:** 3-second view rate (3s views / reach). **Evidence:** none yet; nothing published, no insights connected.
- **Decision:** pending Yotam's approval to publish; small sample = directional only.
