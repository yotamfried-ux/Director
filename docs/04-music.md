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
