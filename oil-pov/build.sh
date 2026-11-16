#!/usr/bin/env bash
# Full build: timeline metadata -> sound design -> frames -> out/oil-pov.mp4
# Requires: node + playwright (with Chromium), ffmpeg, python3 + numpy.
# The 3D shots are raymarched with a software rasterizer, so expect roughly an hour.
set -euo pipefail
cd "$(dirname "$0")"
export NODE_PATH="${NODE_PATH:-$(npm root -g)}"
node render.mjs --meta
python3 audio.py
node render.mjs --workers "${WORKERS:-4}" --name master.mp4
# Film grain makes the master very large (~750 MB); two-pass encode to a shareable ~90 MB file.
ffmpeg -loglevel error -y -i out/master.mp4 -c:v libx264 -preset slow -b:v 3900k -pass 1 -passlogfile out/p2 -pix_fmt yuv420p -an -f null /dev/null
ffmpeg -loglevel error -y -i out/master.mp4 -c:v libx264 -preset slow -b:v 3900k -pass 2 -passlogfile out/p2 -pix_fmt yuv420p -c:a copy -movflags +faststart out/oil-pov.mp4
