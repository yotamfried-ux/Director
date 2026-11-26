---
name: video-qa
description: Check a rendered promo before delivering it: typecheck, still contact sheet, transition frames, ffprobe, OCR, and an honest list of what was not verified.
---
# Video QA

Follow `docs/05-qa.md`. First run `python3 -I scripts/qa-gate.py <video> --product <slug> --locale <he|en>`; do not send anything that FAILs. Minimum before sending: contact sheet viewed, ffprobe matches the spec, captions readable and correct Hebrew, no unverified claim, demo data labelled. Tell Yotam what you could not check (audio, beat sync, WhatsApp behaviour, live site). If a defect shows (clipped text, ghost overlap, empty half-screen) fix and re-render rather than shipping with a note.

## Video Analyzer (MCP, pinned `mcp-video-analyzer@0.12.0`, configured in `.mcp.json`)
Use it to look at the finished file, not only at stills: `get_metadata` (size, fps, audio), `get_frames` / `analyze_video` (timeline of key frames), `get_frame_burst` (several frames across a narrow interval: use it on every transition and on the first and last second), `get_frame_at` (needs `timestamp`), `analyze_moment`.
Limits found in testing (2026-11-26, local MP4, sandbox): metadata, frame extraction and burst work; the built-in OCR downloads language data from the network and crashes where the network is blocked, and its default languages are English and Portuguese. For Hebrew text keep using system `tesseract -l heb+eng` (see `docs/05-qa.md`). Frames are evidence for you to look at; it does not judge quality by itself and absence in sparse frames is not proof.
Whether a scheduled (cloud) run loads `.mcp.json` automatically is not verified; the one-shot CLI `npx -y mcp-video-analyzer@0.12.0 analyze <file> --out <dir> --detail brief` is the fallback.

