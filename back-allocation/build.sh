#!/usr/bin/env bash
# Full build: timeline metadata -> soundtrack -> frames -> out/back-allocation.mp4
# Requires: node + playwright (with Chromium), ffmpeg, python3 + numpy;
# network access to huggingface.co on the first run (Kokoro voice model).
set -euo pipefail
cd "$(dirname "$0")"
export NODE_PATH="${NODE_PATH:-$(npm root -g)}"
export NODE_USE_ENV_PROXY=1            # lets Node fetch the voice model through an HTTPS proxy
[ -d node_modules ] || npm install
[ -f src/narration.js ] || echo "window.NARR = null;" > src/narration.js
node render.mjs --meta                 # caption texts
node narrate.mjs                       # narration clips + src/narration.js (cached per caption)
node render.mjs --meta                 # timeline re-timed to the narration
python3 audio.py
node render.mjs --workers "${WORKERS:-4}"
