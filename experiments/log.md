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

## 2026-11-26 — AI Agent System (Director) site video v1 (angle A, trust)
- Hypothesis: a trust angle (independent audit + approval gate) answers the viewer's fear that agents act unchecked better than an outcome angle, which we cannot back with verified numbers.
- Built: 30 s, 1920x1080@30, silent, HE; composition `AgentSystem-site-he`; real dashboard screenshot (test run 26.11.2026) + motion graphics with real agent ids/status names; example items labelled demo.
- Director's review: draft showed long static holds (QA warned 3-6 s) -> added slow per-scene drift and raised caption contrast; one 5 s hold remains (audit scene end).
- Not verified: motion feel on a phone, card-size readability at 600 px, EN variant, Yotam's reading of "my agent system".
- Result: pending Yotam's verdict.

## 2026-11-26 — AI Agent System site video v3 (correction of v1/v2)
- Lesson: "my agent system" was read twice wrongly (Director, then Engineering-OS). The real project lives in Yotam's own n8n (spec workflow "PROJECT SPEC — n8n On-Demand Engineering Run System"); name on screen must match the portfolio card ("AI Agent System"). When a product has no GitHub repo, ask or search the n8n/portfolio sources before researching.
- Built from the n8n spec: roles, one request = one RUN, failure loop, trust order of evidence, sandbox limits. Honest framing: spec says NOT production ready; self-improvement not proven (REJECTED_BY_HOLDOUT), so outro says "ניסויים בתהליכי עבודה עם בינה מלאכותית".
- Director's review/QA: gate caught a hard cut at 3.2 s caused by a per-scene zoom reset; replaced with one continuous slow zoom. Static-hold warnings remain in evidence/limits scenes (3-4 s).
- Not verified: card-size readability, EN variant, claims beyond the spec text (runtime behaviour not re-run today).
- Result: pending Yotam's verdict.

## 2026-11-26 — AI Agent System (shell run) site video v1 (angle A, trust)
- Hypothesis: a trust angle (one request = one RUN, separate Verifier, evidence order, honest status) answers "will agents ship unchecked code?" better than an outcome angle we cannot back with numbers.
- Built: 30 s, 1920x1080@30, silent, HE; composition `AgentSystemShell-he`; motion graphics with the n8n spec's real role names and status words; no demo numbers.
- Director's review: 5-second test passes (name + "בקשה אחת. ריצה אחת."); honesty: every on-screen claim maps to V1-V12 in `products/ai-agent-system-shell.md`; raised secondary text contrast after the first render; no static tail (fade-out, drifting background).
- Not verified: card-size readability (stills only), EN variant, motion feel on a phone, spec drift after today, Yotam's reading. OCR reads "AI" as "Al" (font), so the must-appear check warns; confirmed by eye.
- Result: pending Yotam's verdict.

### EXP-010 — business week: pain-first vs builder-first hook (proposed 2026-11-26, not run)
- **Product / asset:** business and capabilities posts (2 reels + 1 carousel), proof from Tori verified claims
- **Hypothesis:** a pain-first hook (A) holds viewers past 3 seconds more often than a builder-first hook (B) with the same content.
- **Variants:** A = pain-first · B = builder-first · (C = show-the-work carousel is the proof layer, not a test arm).
- **Metric:** 3-second view rate per reel against the account median (29.1% in the demo file, n=4); at least 4 reels per arm; per-post medians; gap under 5 points = no signal.
- **Evidence:** none yet; analysis of the demo insights shows one outlier (72% of reach) and an otherwise flat account. Nothing published.
- **Decision:** pending Yotam's approval to publish.

### EXP-011 — AI Agent System benchmark clip: hook question vs flow-first (proposed 2026-11-26, not run)
- **Product / asset:** AI Agent System site clip (benchmark, not for publication), slug agent-system-bench
- **Hypothesis:** the "I'm done. Who proves it?" hook keeps visitors watching longer than a flow-first opening.
- **Variants:** A = question hook · B = name plus one-request-one-run first.
- **Metric:** completion share and contact/project clicks per card view vs other cards; min 3 per arm.
- **Evidence:** none; not published.
- **Decision:** pending Yotam.

### EXP-012 — three Tori reels: pain-of-call (A) vs pain-of-empty-slot (B) vs no-call booking with real screens (C) (proposed 2026-11-27, not run)
- **Product / asset:** Tori reels p1/p2/p3 for 2026-11-29, slots A/B/C
- **Hypothesis:** pain-first hooks (A, B) hold viewers past 3 s more often than the process-first hook (C).
- **Variants:** A = Reel-tori-movelink · B = Reel-tori-waitlist · C = Reel-tori-booking (slot and format differ too: confounded).
- **Metric:** 3-second view rate and saves/shares per reel against the account median; no signal under 10 posts per angle or per slot.
- **Evidence:** none yet; waiting for Yotam's approval and first insights.
- **Decision:** pending Yotam's approval on the D2R screen.
