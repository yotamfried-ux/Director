#!/usr/bin/env bash
# Usage: scripts/render-site.sh   -> out/site/tori-{he,en}.mp4 (8s, 1280x720, 30fps, silent) + poster (no text)
set -euo pipefail
mkdir -p out/site
for l in he en; do
  npx remotion render src/index.ts "Site-$l" "out/site/tori-$l.raw.mp4" --codec=h264 --concurrency="${CONCURRENCY:-2}" --gl=swangle
  ffmpeg -y -loglevel error -i "out/site/tori-$l.raw.mp4" -an -c:v libx264 -profile:v main -pix_fmt yuv420p -crf 24 -preset slow -movflags +faststart "out/site/tori-$l.mp4"
done
ls -la out/site
