#!/usr/bin/env bash
# Full build: timeline metadata -> narration -> soundtrack -> frames -> out/well-logging.mp4
# Requires: node + playwright (with Chromium), ffmpeg, python3 + numpy;
# kokoro-js (npm install) and network access to huggingface.co on the first run (voice model).
set -euo pipefail
cd "$(dirname "$0")"
export NODE_PATH="${NODE_PATH:-$(npm root -g)}"
export NODE_USE_ENV_PROXY=1            # lets Node fetch the voice model through an HTTPS proxy
[ -e node_modules ] || npm install
[ -f src/narration.js ] || echo "window.NARR = null;" > src/narration.js
node render.mjs --meta                 # caption texts
node narrate.mjs --speed 1.06          # narration clips + src/narration.js (cached per caption)
node render.mjs --meta                 # timeline re-timed to the narration
python3 audio.py
node render.mjs --workers "${WORKERS:-4}"
