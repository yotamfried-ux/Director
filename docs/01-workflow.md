# Workflow (mandatory)

0. **Brief / direction** (`video-brief`): goal, viewer and moment, the one promise, sales angle (A/B/C), form and length with reason, objections. Done again as a *director's review* after the build (5-second, message, honesty, feel, cut tests) before QA.
1. **Research** (`product-research`): read the product's docs, own marketing copy, UI strings, evidence; think as a business owner buying it. **Re-verify claims against the product's current state every time (it keeps changing): repo HEAD, live site, changelog.** Output: verified feature list, buyer pains, claims allowed/forbidden, what visuals exist (screenshots) vs. need capture.
2. **Script** (`video-script`): scenes with timings, Hebrew copy, visual source per scene, music direction. Send Yotam a short Hebrew summary. Proceed to build in the same turn unless he has asked to approve first or a decision is irreversible.
3. **Build** (`remotion-product-video`): compositions in `src/`, stills first (contact sheet of key frames), then full render in the background.
4. **Music** (`music-selection`): offer two real CC0 options (A/B) when taste matters; mux with `scripts/encode-whatsapp.sh`.
5. **QA** (`video-qa`): run `scripts/qa-gate.py` first; frames at transitions, OCR of must-appear text, ffprobe, loudness. Say what was not checked (e.g. never heard the audio).
6. **Deliver**: send the file inline. Phone version: WhatsApp-safe MP4 + short guidance to send as video (gallery / "Photos & videos"), never as document.
7. **Log** (`marketing-experiments`): what changed, what Yotam said, what to keep.
8. **Publish**: only after explicit approval; see `social-content`.

Principles: smooth over fast; specific over grand; one idea per scene; hold long enough to read; never a snap between states (blend colours, crossfade labels).
