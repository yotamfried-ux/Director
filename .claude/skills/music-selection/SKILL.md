---
name: music-selection
description: Choose real CC0 background music for a promo video, offer Yotam named A/B options, trim and mux it. Never synthesize music.
---
# Music selection

Full method in `docs/04-music.md`. Short version:
1. `bash scripts/fetch-music.sh --list | grep -i -E "upbeat|inspir|hopeful|energ|sunny|shining"` (prefer `freepd.com/` = CC0).
2. Fetch 8–12 tracks, `python3 scripts/analyze-music.py tmp/music/*.mp3` (BPM, brightness; numbers only).
3. Pick two, describe them in one line each, label **A** and **B** (never left/right), send both muxed versions of the same video.
4. Apply exactly the chosen one; copy it to `music/library/` with a line in `docs/04-music.md`.
5. Credit isn't required for CC0 but note the source in the library table.
Never: synthesize music, use tracks with unclear licence, or put music on the silent site clips.
