# Oil: a point-of-view journey — three-minute film

A wordless, 1080p film that follows a parcel of petroleum from its origin on a
prehistoric sea bed to the moment it moves a car. No narration, captions, titles
or music: only picture and location sound. The camera travels *with* the oil.

**Result:** [`out/oil-pov.mp4`](out/oil-pov.mp4)

## Sequence

| Time | What happens |
|------|--------------|
| 0:00 | Plankton settle into dark mud; sediment buries it; layers compact |
| 0:13 | Inside the source rock: kerogen matures, the first oil films and droplets appear |
| 0:18 | Migration: a microfracture, a carrier bed, a conductive fault, into sandstone |
| 0:29 | The trap: an anticline under a sealing cap rock — gas above, oil, water below |
| 0:35 | Waiting in one oil-filled pore, a water film on the grains |
| 0:40 | Something approaches: vibration, then the drill bit; casing, cement, tubing, packer, gun |
| 1:06 | **Perforation** — shaped charges cut through steel, cement and rock |
| 1:09 | The shock in the pore; a way out appears; oil converges on the perforation |
| 1:24 | Up the production tubing as gas comes out of solution; tree, choke, flowline |
| 1:35 | Separator, oil treatment, export pump, pipeline, refinery tank |
| 1:57 | Desalter, fired heater, distillation column, condenser |
| 2:11 | Hydrotreating and reforming catalyst beds, gasoline blending |
| 2:23 | Product tank, road tanker, service station, nozzle, the car's tank |
| 2:34 | Fuel line, injection, compression, spark, combustion |
| 2:45 | Exhaust and catalytic converter, crankshaft, wheel, the car drives away |

The picture is a stylised render, not photoreal footage, and it is schematic:
geological time and travel distances are compressed by cuts.

## How it is made

- `src/engine.js` — deterministic frame renderer (`renderFrame(t)`), film grain,
  vignette, letterbox, fades. Open `src/index.html` for a live preview
  (space: pause, arrows: seek, `?t=60`).
- `src/gl.js` — WebGL2 shaders: `PORE` raymarches granular rock from inside the
  pore space (source rock, carrier bed, sandstone, catalyst bed); `TUNNEL` is the
  inside of a pipe.
- `src/fx.js` — 2D helpers: camera shake, suspended particles, streaks, bubbles,
  rock textures, exteriors.
- `src/shots_1.js` … `shots_3.js` — the 48 shots, each with its picture, its
  sound layers and its one-off sound events.
- `audio.py` — sound design synthesized with numpy from `out/meta.json`.
- `render.mjs` — headless Chromium (Playwright) + ffmpeg; `snap.mjs` renders test frames.

```bash
./build.sh          # -> out/oil-pov.mp4
```
