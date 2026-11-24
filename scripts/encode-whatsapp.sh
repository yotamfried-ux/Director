#!/usr/bin/env bash
# Usage: scripts/encode-whatsapp.sh <raw.mp4> <music.(mp3|wav)> <out.mp4> <frames> [fps=30]
# H.264 Main L4.0 yuv420p, constant fps, AAC-LC stereo 44.1k, faststart, well under 16 MB.
# Music is trimmed to the video length, faded in (0.6s) / out (2.2s), loudness-normalised to -17 LUFS.
set -euo pipefail
raw="$1"; music="$2"; out="$3"; frames="$4"; fps="${5:-30}"
T=$(python3 -c "print(round($frames/$fps,2))")
tmp="$(mktemp -d)"
ffmpeg -y -loglevel error -t "$T" -i "$music" \
  -af "afade=t=in:d=0.6,afade=t=out:st=$(python3 -c "print(round($T-2.2,2))"):d=2.2,loudnorm=I=-17:TP=-1.5:LRA=9" -ar 44100 -ac 2 "$tmp/a.wav"
ffmpeg -y -loglevel error -i "$raw" -i "$tmp/a.wav" -map 0:v:0 -map 1:a:0 \
  -c:v libx264 -profile:v main -level 4.0 -pix_fmt yuv420p -preset medium -crf 23 -r "$fps" \
  -c:a aac -b:a 128k -ar 44100 -ac 2 -movflags +faststart -shortest "$out"
ffprobe -v error -show_entries stream=codec_name,profile,level,width,height:format=duration,size -of compact "$out"
