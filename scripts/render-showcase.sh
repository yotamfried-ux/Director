#!/usr/bin/env bash
# Usage: scripts/render-showcase.sh [composition=Showcase-9x16] [music=music/library/elevate-inspirate.mp3] [out=out/showcase]
# Renders the vertical phone/WhatsApp promo, muxes music and encodes a WhatsApp-safe MP4.
set -euo pipefail
comp="${1:-Showcase-9x16}"; music="${2:-music/library/elevate-inspirate.mp3}"; out="${3:-out/showcase}"
mkdir -p "$out"
npx remotion render src/index.ts "$comp" "$out/raw.mp4" --codec=h264 --concurrency="${CONCURRENCY:-2}" --gl=swangle
frames=$(ffprobe -v error -select_streams v:0 -count_frames -show_entries stream=nb_read_frames -of csv=p=0 "$out/raw.mp4")
bash scripts/encode-whatsapp.sh "$out/raw.mp4" "$music" "$out/whatsapp.mp4" "$frames"
