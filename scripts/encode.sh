#!/usr/bin/env bash
# One place for delivery encodes. Usage: scripts/encode.sh <input.mp4> <profile> [output.mp4]
# Profiles (target-bitrate, because CRF explodes on noisy footage such as water):
#   site-demo      1080p, 2300k (max 3200k)  project-page video, silent        (~0.25 MB/s)
#   site-preview   720p,  1200k (max 1800k)  portfolio card loop, silent
#   review         1080p,  5000k             draft sent to Yotam for approval, silent
#   whatsapp-silent 1080p, 4000k, Main L4.0  phone/WhatsApp without music (music: skills/whatsapp-export)
# All: H.264 yuv420p (limited range), faststart, no audio unless the profile says otherwise.
set -euo pipefail
in="$1"; prof="$2"; out="${3:-${in%.mp4}-$prof.mp4}"
case "$prof" in
  site-demo)       v="-vf scale=-2:1080 -b:v 2300k -maxrate 3200k -bufsize 6400k -profile:v high" ;;
  site-preview)    v="-vf scale=-2:720  -b:v 1200k -maxrate 1800k -bufsize 3600k -profile:v high" ;;
  review)          v="-b:v 5000k -maxrate 7000k -bufsize 14000k -profile:v high" ;;
  whatsapp-silent) v="-b:v 4000k -maxrate 5500k -bufsize 11000k -profile:v main -level 4.0" ;;
  *) echo "unknown profile: $prof" >&2; exit 2 ;;
esac
ffmpeg -v error -y -i "$in" -an -c:v libx264 -pix_fmt yuv420p -color_range tv $v -movflags +faststart "$out"
echo "$prof -> $out ($(du -h "$out" | cut -f1), $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$out" | cut -c1-5)s)"
