---
name: video-brief
description: Director/planner step before any script. Define why the video exists, who watches it where, the one promise, the action wanted and the sales angle; then judge the finished cut as a viewer and seller, not only as an editor.
---
# Video brief (the director's job)

Editing and engineering are the last third of the work. Before `video-script`, and again after the build, act as strategist and director. Template: `docs/templates/creative-brief.md` → save as `products/<slug>-brief-vN.md`.

## 1. Understand the need (before research ends)
Answer in writing, from evidence (product file, site, Yotam's messages), not from habit:
- **Business goal:** what should change after someone watches (a client writes to Yotam, a customer joins a WhatsApp demo, a recruiter opens the repo)? One primary goal.
- **Viewer and moment:** who, where (portfolio card ~600 px silent, project page, WhatsApp forward, social feed), how much attention, sound on or off, what they already believe or fear.
- **The one promise:** one sentence a viewer can repeat. If you need "and", you have two videos.
- **Desired action** and where the video sits in the path to it.
- **Proof, ranked by persuasion:** which *currently verified* facts make the promise believable. Re-verify against the product's present state first (see `product-research` step 2); features and limits change with development.
- **Objections:** what a sceptical buyer would ask ("is it real?", "is my data safe?", "is it hard?") and which scene answers it, or an explicit "we do not answer this".

## 2. Choose the sales angle
Write 2–3 named angles (A/B/C, never left/right), each with promise, opening line, proof order, risk. Recommend one and say why. Ask Yotam only when the choice is truly his (brand, risk, taste) and not recoverable; max 3 short Hebrew questions with your recommendation inside each.
Typical angles: pain-first, outcome-first, "watch it work", control/insight, trust/how-it-works.

## 3. Shape the form to the goal
Length, pace, locale, sound and format follow the viewer (card preview: seconds, silent, readable at 600 px; project page: can hold a story; WhatsApp: hook in 2 s, sound-on). Justify the length in one line. A second length needs its own idea (see lessons: short ≠ sped-up long).

## 4. Hand over to `video-script`
Script must trace every scene to the promise or a ranked proof or an answered objection. A scene that serves none is cut.

## 5. Director's review after the build (before `video-qa` gate and before sending)
Watch the contact sheet and the render as the viewer, silent and at card size:
- **5-second test:** by second 5 can they say what it is and for whom?
- **Message test:** can they repeat the one promise? Is the order pain → proof → action?
- **Honesty test:** every on-screen claim traced to the product file as verified now; demo data labelled.
- **Feel test:** nothing snaps, nothing ends dead, motion has a reason, text is readable at card size.
- **Cut test:** what could be removed without losing the promise? Remove it.
Then run `scripts/qa-gate.py`. Record the director's notes (what you changed and why) in the experiment log, and tell Yotam in Hebrew what angle was chosen and what is not verified.
