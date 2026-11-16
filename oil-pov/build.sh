#!/usr/bin/env bash
# Full build: timeline metadata -> sound design -> frames -> out/oil-pov.mp4
# Requires: node + playwright (with Chromium), ffmpeg, python3 + numpy.
# The 3D shots are raymarched with a software rasterizer, so expect roughly 40 minutes.
set -euo pipefail
cd "$(dirname "$0")"
export NODE_PATH="${NODE_PATH:-$(npm root -g)}"
node render.mjs --meta
python3 audio.py
node render.mjs --workers "${WORKERS:-4}"
