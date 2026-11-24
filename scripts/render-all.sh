#!/usr/bin/env bash
# Usage: scripts/render-all.sh <slug>   -> out/<slug>-{16x9,9x16,1x1}.mp4 + whatsapp-friendly copies + poster
set -euo pipefail
slug="${1:-tori}"
props="$(python3 -c "import json;c=json.load(open('products/$slug.json'));print(json.dumps({'name':c['name'],'tagline':c['tagline_he'],'accent':c['accent'],'bg':c['bg']},ensure_ascii=False))")"
for r in 16x9 9x16 1x1; do
  npx remotion render src/index.ts "Promo-$r" "out/$slug-$r.mp4" --props="$props" --codec=h264 --crf=18
  ffmpeg -y -v error -i "out/$slug-$r.mp4" -vf "scale='min(1080,iw)':-2" -c:v libx264 -preset veryfast -crf 26 -movflags +faststart -an "out/$slug-$r-small.mp4"
done
ffmpeg -y -v error -i "out/$slug-16x9.mp4" -ss 3 -frames:v 1 "out/$slug-poster.jpg"
ls -la out
