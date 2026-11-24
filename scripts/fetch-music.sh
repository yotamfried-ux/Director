#!/usr/bin/env bash
# Usage: scripts/fetch-music.sh "freepd.com/Elevate Inspirate.mp3" [more paths...]
# Pulls single tracks out of the huge CC0 collection https://github.com/SoundSafari/CC0-1.0-Music
# without cloning 40 GB (treeless clone + sparse checkout). Files land in tmp/music/.
# List/grep available names first:  scripts/fetch-music.sh --list | grep -i upbeat
set -euo pipefail
repo=tmp/cc0-music
if [ ! -d "$repo/.git" ]; then
  mkdir -p tmp
  GIT_LFS_SKIP_SMUDGE=1 git clone --filter=blob:none --no-checkout --depth 1 https://github.com/SoundSafari/cc0-1.0-music "$repo"
fi
if [ "${1:-}" = "--list" ]; then git -C "$repo" ls-tree -r --name-only HEAD | grep -v -E '^(LICENSE|README)'; exit 0; fi
git -C "$repo" sparse-checkout init --no-cone >/dev/null
args=(); for f in "$@"; do args+=("/$f"); done
git -C "$repo" sparse-checkout set --no-cone "${args[@]}"
GIT_LFS_SKIP_SMUDGE=1 git -C "$repo" checkout
mkdir -p tmp/music
for f in "$@"; do cp "$repo/$f" tmp/music/; done
ls -la tmp/music
