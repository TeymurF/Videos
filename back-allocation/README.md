# Back allocation explained — educational animation

A ~15-minute, 1080p explainer on back allocation of oil, gas and water: how
quantities measured at shared points are assigned back to the wells that
produced them. English narration and captions over a procedurally generated
soundtrack. One worked example with wells A, B and C runs through the whole film.

**Result:** [`out/back-allocation.mp4`](out/back-allocation.mp4) · captions: [`out/captions.srt`](out/captions.srt)

## Scenes

| # | Scene | What it shows |
|---|-------|---------------|
| 1 | Production flows forward | Reservoir, three wells, flowlines, manifold, commingled stream, shared meters |
| 2 | Why back allocation is needed | Well data vs. measured totals; the calculation runs against the flow |
| 3 | What is allocated | Oil, gas, water, condensate/NGL, component mass, gas energy; one factor per phase |
| 4 | Define the boundary and the network | Balance area, inputs/outputs/internal flows, nodes and connections, routing periods |
| 5 | Define the accounting period | Production day, rate vs. period volume, meter readings, runtime, transit time |
| 6 | Collect and validate the data | Data groups and sources, validation checks, missing is not zero |
| 7 | Test an individual well | Test separator, transient vs. stable data, multiphase and virtual flow meters |
| 8 | Use a common measurement basis | Reference conditions, oil shrinkage, mass conservation |
| 9 | Calculate preliminary well quantities | V = q × t / 24; the three-well table (65.5 m³ preliminary oil) |
| 10 | Production is not the same as export | Material balance: 64.05 + 28 − 20 = 72.05 m³ |
| 11 | Proportional allocation | Shares, K = 1.10, allocated 52.80 / 16.50 / 2.75 m³ |
| 12 | Water and gas have their own factors | K water = 0.90; lift gas vs. reservoir gas; gas balance, K gas = 1.20 |
| 13 | Bigger networks and other methods | Allocation through levels; difference, component, energy, statistical methods |
| 14 | Diagnose the imbalance | Residual 6.55 m³ (10 %), possible causes, exceptions, deferment |
| 15 | From daily runs to an approved report | Daily vs. monthly, workflow, audit trail, final report, entitlement |
| 16 | The whole picture | Summary |

All numbers come from the source document's illustrative example. The diagrams
are schematic and not to scale.

## How it is made

- `src/` — a deterministic HTML canvas program: `renderFrame(t)` draws the frame
  for any time `t`. Open `src/index.html` in a browser for a live preview
  (space: pause, arrow keys: seek, `?t=120` to start at a time).
  - `engine.js` — timeline, captions, drawing helpers
  - `parts.js` — pumpjack well icon, pipes, vessels, meters, tables, the field diagram
  - `scenes_1.js` … `scenes_4.js` — the scenes with their caption and narration text
- `narrate.mjs` — narration with the open Kokoro-82M text-to-speech model
  (`kokoro-js`; voice `am_michael`, change with `--voice`), one clip per caption
- `audio.py` — soundtrack (musical pad, oilfield and plant ambience, interface
  sounds) with the narration mixed over it (numpy only)
- `render.mjs` — renders frames in headless Chromium (Playwright), encodes with ffmpeg
- `snap.mjs` — renders individual test frames
- `build.sh` — runs the full pipeline

```bash
./build.sh          # -> out/back-allocation.mp4
```

A caption is `'text'` or `{ t: 'text on screen', say: 'spoken form' }`; numbers are
spelled out in `say` so the narrator reads them correctly. Each caption stays on
screen for the length of its narration clip, so editing a caption re-voices and
re-times its scene on the next build. The first build downloads the voice model
from huggingface.co.

## Russian-voice edition

`out/back-allocation-ru.mp4` has the same visuals and English captions with a Russian voice
(Piper `ru_RU-ruslan-medium`). Texts: `ru.json`; build: `./build_ru.sh`. Running `./build_ru.sh`
overwrites `src/narration.js` with the Russian clip durations; `./build.sh` restores the English ones.
