# Upstream, midstream, downstream — educational animation

A 13-minute, 1080p explainer that follows oil and natural gas from their
formation underground to the delivery of fuels, energy and materials. English
narration and captions over a procedurally generated soundtrack. Three parts,
24 scenes, constant motion and short captions.

**Result:** [`out/value-chain.mp4`](out/value-chain.mp4) · captions: [`out/captions.srt`](out/captions.srt)

## Scenes

| Part | # | Scene |
|------|---|-------|
| Upstream | 1 | How oil and gas form: source rock, migration, trap, seal, pores |
| | 2 | Exploration starts with a question: five elements, the prospect |
| | 3 | Seismic: source, receivers, section, interpretation |
| | 4 | Drilling the exploration well: bit, mud circulation, casing, blowout preventers |
| | 5 | Is it a discovery? Logs, cores, tests, appraisal, development concepts |
| | 6 | Completing the well: tubing, packer, tree, perforations, optional stimulation |
| | 7 | Production, lift and pressure support |
| | 8 | Gathering the production: subsea wells, manifold, riser, flow assurance |
| | 9 | Separation: three-phase separator, pressure stages |
| | 10 | Treating the oil and the water |
| | 11 | Measurement and handover: metering, back allocation, custody transfer |
| Midstream | 12 | Moving crude oil: pump stations, batches, terminals, integrity |
| | 13 | Processing natural gas: acid gas removal, dehydration, sulfur, NGL |
| | 14 | Gas pipelines and storage: compression, linepack, underground storage |
| | 15 | LNG: liquefaction, LNG vs LPG, shipping, regasification |
| Downstream | 16 | Into the refinery: crude grades, heat recovery, desalting, furnace |
| | 17 | Distillation: atmospheric and vacuum columns |
| | 18 | Conversion: catalytic cracking, hydrocracking, coking |
| | 19 | Treating and upgrading: hydrotreating, reforming, isomerisation, alkylation |
| | 20 | Blending and certification |
| | 21 | Utilities and petrochemicals |
| | 22 | Delivering to customers |
| | 23 | Accounting, feedback and the field lifecycle |
| | 24 | The whole chain |

The diagrams are schematic and not to scale; not every field, plant or refinery
uses every process shown.

## How it is made

- `src/` — a deterministic HTML canvas program: `renderFrame(t)` draws the frame
  for any time `t`. Open `src/index.html` in a browser for a live preview
  (space: pause, arrow keys: seek, `?t=120` to start at a time).
  - `engine.js` — timeline, captions, value-chain tracker, drawing helpers
  - `parts.js` — scenery, wells, rig, vessels, towers, ships, molecules, icons
  - `scenes_1.js` … `scenes_5.js` — the scenes with their caption and narration text
- `narrate.mjs` — narration with the open Kokoro-82M text-to-speech model
  (`kokoro-js`; voice `am_michael`, change with `--voice`), one clip per caption
- `audio.py` — soundtrack (musical pad, ambience, interface sounds) with the
  narration mixed over it (numpy only)
- `render.mjs` — renders frames in headless Chromium (Playwright), encodes with ffmpeg
- `snap.mjs` — renders individual test frames
- `build.sh` — runs the full pipeline

```bash
./build.sh          # -> out/value-chain.mp4
```

A caption is `'text'` or `{ t: 'text on screen', say: 'spoken form' }`. Each caption
stays on screen for the length of its narration clip, so editing a caption
re-voices and re-times its scene on the next build. The first build downloads
the voice model from huggingface.co.
