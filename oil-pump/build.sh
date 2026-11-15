#!/usr/bin/env bash
# Full build: timeline metadata -> soundtrack -> frames -> out/pumpjack.mp4
# Requires: node + playwright (with Chromium), ffmpeg, python3 + numpy.
set -euo pipefail
cd "$(dirname "$0")"
export NODE_PATH="${NODE_PATH:-$(npm root -g)}"
node render.mjs --meta
python3 audio.py
node render.mjs --workers "${WORKERS:-4}"
