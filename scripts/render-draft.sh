#!/usr/bin/env bash
# Fast low-res draft to check structure, timing, copy and transitions BEFORE a full render.
# Usage: scripts/render-draft.sh <CompositionId> [out.mp4]   (default out: out/draft/<id>.mp4)
# Renders at 25% scale (1920x1080 -> 480x270), CRF 32. Not for delivery: look at timing/flow only.
# Not checked by drafts: text sharpness, fine contrast, banding, bitrate behaviour.
set -euo pipefail
id="$1"; out="${2:-out/draft/$id.mp4}"; mkdir -p "$(dirname "$out")"
CHROME="${CHROME_PATH:-/usr/bin/google-chrome}"
start=$(date +%s)
npx remotion render src/index.ts "$id" "$out" --scale=0.25 --crf=32 --codec=h264 --pixel-format=yuv420p \
  --gl=swangle --concurrency=2 --browser-executable="$CHROME" --log=error
echo "draft: $out ($(( $(date +%s) - start ))s, $(du -h "$out" | cut -f1))"
