---
name: video-qa
description: Check a rendered promo before delivering it: typecheck, still contact sheet, transition frames, ffprobe, OCR, and an honest list of what was not verified.
---
# Video QA

Follow `docs/05-qa.md`. First run `python3 -I scripts/qa-gate.py <video> --product <slug> --locale <he|en>`; do not send anything that FAILs. Minimum before sending: contact sheet viewed, ffprobe matches the spec, captions readable and correct Hebrew, no unverified claim, demo data labelled. Tell Yotam what you could not check (audio, beat sync, WhatsApp behaviour, live site). If a defect shows (clipped text, ghost overlap, empty half-screen) fix and re-render rather than shipping with a note.
