#!/usr/bin/env bash
# Replace isolated dark glitch frames (swangle render corruption, see scripts/glitch-scan.py) with the previous frame.
# Usage: scripts/glitch-fix.sh in.mp4 out.mp4
set -euo pipefail
in="$1"; out="$2"
bad=$(python3 -I "$(dirname "$0")/glitch-scan.py" "$in" 1.0)
if [ "$bad" = none ]; then cp "$in" "$out"; echo "no glitches"; exit 0; fi
fc=""; cur="0:v"; i=0
for r in $bad; do a0=${r%-*}; b0=${r#*-}; i=$((i+1)); fc="${fc}[$cur]split=2[a$i][b$i];[a$i][b$i]freezeframes=first=$a0:last=$b0:replace=$((a0-1))[v$i];"; cur="v$i"; done
ffmpeg -y -loglevel error -i "$in" -filter_complex "${fc%;}" -map "[$cur]" -c:v libx264 -preset medium -crf 16 -pix_fmt yuv420p -an "$out"
echo "fixed frames: $bad"
