---
name: whatsapp-export
description: Final encode and delivery of the vertical promo so WhatsApp sends it as a normal video (not a document): H.264 Main/yuv420p, AAC, faststart, music mux, and what to tell Yotam about sending.
---
# WhatsApp export

Run `bash scripts/render-showcase.sh [composition] [music] [outdir]` or `bash scripts/encode-whatsapp.sh raw.mp4 music.mp3 out.mp4 <frames>`.

## Spec (verified working for Yotam)
H.264 **Main**, level 4.0, `yuv420p`, constant 30fps, 1080×1920, AAC-LC stereo 44.1kHz 128kbps, `-movflags +faststart`, one video + one audio stream, ≲ 8 MB for 27s. Music trimmed to length, fade in 0.6s/out 2.2s, loudnorm −17 LUFS.

## Delivery
- Send the file inline with SendUserFile (`display: render` for a preview).
- Tell Yotam (Hebrew): WhatsApp decides video vs file by *how it is attached*: gallery / "Photos & videos" or drag into WhatsApp Web/Desktop → video; "Document" or Files-app share → file. WhatsApp recompresses videos, so small text softens slightly.
- Ask him to send it to himself once and confirm it shows with a play button. The agent cannot test WhatsApp or hear the audio.

## Naming
`<slug>-<format>-vN-whatsapp.mp4`; keep the raw render and chosen music in the handover message so a re-cut is easy.
