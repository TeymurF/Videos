#!/usr/bin/env bash
# Russian-voice edition: same visuals and English captions, narration in Russian.
# Needs: pip install piper-tts, and the voice model in models/ (from huggingface.co/rhasspy/piper-voices,
#   ru/ru_RU/ruslan/medium: ru_RU-ruslan-medium.onnx and .onnx.json).
set -euo pipefail
cd "$(dirname "$0")"
export NODE_PATH="${NODE_PATH:-$(npm root -g)}"
node render.mjs --meta
python3 narrate_ru.py                 # out/narration/*.wav from ru.json + src/narration.js
node render.mjs --meta                # timeline re-timed to the Russian clips
python3 audio.py
node render.mjs --workers "${WORKERS:-4}" --name back-allocation-ru.mp4
