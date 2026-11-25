#!/usr/bin/env bash
# Short social cut (about 90 s): reuses the full film's code in ../src with compressed timing (src/short.js).
set -euo pipefail
cd "$(dirname "$0")"
export NODE_PATH="${NODE_PATH:-$(npm root -g)}"
export NODE_USE_ENV_PROXY=1
[ -f src/narration.js ] || echo "window.NARR = null;" > src/narration.js
node render.mjs --meta
node narrate.mjs --speed 1.08
node render.mjs --meta
BEAT_BPM=104 python3 audio.py
node render.mjs --workers "${WORKERS:-4}"
