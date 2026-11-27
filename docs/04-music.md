# Music

**Rule:** real CC0 / public-domain music. Synthesized (numpy) tracks were tried twice and rejected ("odd, unpleasant", "doesn't carry the message"). Legacy synth scripts are not kept.

## Source
`SoundSafari/CC0-1.0-Music` (GitHub, ~9k tracks, 40 GB) — never clone it whole. Use `scripts/fetch-music.sh --list | grep -i <word>` and then fetch single files (treeless clone + sparse checkout). Best folder for promo use: `freepd.com/` (FreePD, CC0). Other folders (chosic.com, freemusicarchive.org) have mixed provenance: check the licence before using.
Also reachable in the sandbox: `raw.githubusercontent.com` only; Pixabay/Archive/FreePD sites are blocked, so GitHub mirrors are the route.

## Selection
1. Grep names for mood words (upbeat, inspir, hopeful, shining, energizing, sunny…).
2. Fetch 8–12 candidates, run `scripts/analyze-music.py`: duration, rough BPM, brightness. Numbers only — the agent cannot hear.
3. Offer Yotam **two** options named **A/B** with BPM and a one-line character description.
4. Trim to video length, fade in 0.6s / out 2.2s, -17 LUFS (`scripts/encode-whatsapp.sh` does it).

## Chosen so far
| Product | Track | BPM | Notes |
|---|---|---|---|
| Tori phone promo | **Elevate Inspirate** (FreePD, CC0) — `music/library/elevate-inspirate.mp3` | ~103 | Yotam chose option A over Advertime (~117 BPM). The video is 27s, the track is 64s: fine, but the fade-out is cut; logo hit is not beat-aligned (agent cannot hear beats). |

## Open improvements
Beat-align the logo reveal and key transitions to the track (needs a beat grid: try `librosa`/`madmom` if installable); try tracks with a clear drop for the logo.

## Search routes (checked 2026-11-26)
- **Primary, works today:** the GitHub CC0 library above (`scripts/fetch-music.sh`).
- **`scripts/music-search.mjs`:** CC0-only search on Freesound's official API; the filter is built in and every result is re-checked, so a non-CC0 sound cannot be offered. Needs Yotam's free Freesound API key (`FREESOUND_API_KEY`). Not run live: freesound.org is not reachable from the sandbox, so only the mock-server test (`tests/music.test.mjs`) has run. Freesound is mostly sound effects; expect few full music tracks.
- **Freesound MCP servers (`MuShan-bit/Freesound-MCP`, `johnkimdw/freesound-mcp-server`):** not installed. The first one is a personal GitHub project, not on npm; I read its ~230 lines: harmless, but it passes the license string to the API without checking it, mixes two `filter` parameters in one URL, and downloads only lossy MP3 previews. Using it could let a non-CC0 sound through, which breaks the CC0 rule.
- **Lots of Sounds MCP:** CC0, but sound effects; search needs a paid plan.
- **Engineering-OS `tools/openverse_audio_search.py`:** read-only Openverse search; the sandbox proxy blocked Openverse earlier, so not usable here.

