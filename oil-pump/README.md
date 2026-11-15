# How an oil pumpjack works — educational animation

An ~11-minute, 1080p explainer video about a well with a sucker-rod pump
(pumpjack / beam pumping unit): from oil in the rock pores to the flowline at
the surface. English narration and captions, over a soundtrack of the machinery
itself (motor, counterweights, valves, fluid) that is synthesized procedurally
and locked to the animation.

**Result:** [`out/pumpjack.mp4`](out/pumpjack.mp4) · captions: [`out/captions.srt`](out/captions.srt)

## Scenes

| # | Scene | What it shows |
|---|-------|---------------|
| 1 | Overview | Pumpjack, wellhead, flowline; the principle in one sentence |
| 2 | What is underground | Casing, cement, tubing, rods, pump, reservoir; energy path vs. fluid path |
| 3 | Oil lives in rock pores | Grains, pores, oil / water / gas; porosity vs. permeability |
| 4 | Why fluid flows to the well | Drawdown Δp = p_res − p_wf, fluid level, inflow |
| 5 | Connecting the well to the reservoir | Casing, cementing, perforating; horizontal section through the well |
| 6 | Fluid level and gas | Static and dynamic level, free gas, gas anchor |
| 7 | Inside the downhole pump | Barrel, plunger, standing and traveling valves, chamber, ball valve |
| 8 | How the pumpjack drives the rods | Motor, belt, gearbox, cranks, pitman arms, beam, horsehead, counterweights, stuffing box |
| 9 | The pump cycle | Upstroke, top of stroke, downstroke with valve states, flow and chamber pressure |
| 10 | From the pump to the surface | Many strokes per charge; hydrostatic pressure ρgH; gas expansion |
| 11 | Out to the gathering system | Flowline, metering unit, separator: gas / oil / water |
| 12 | Real-world operation | Rod stretch, pump displacement, gas interference and gas lock, fluid pound, dynamometer card, controller |
| 13 | The whole picture | Summary |

The animation is schematic and not to scale; it follows the classic design with
a stationary barrel and a traveling plunger.

## How it is made

- `src/` — the whole film is a deterministic HTML canvas program: `renderFrame(t)`
  draws the frame for any time `t`. Open `src/index.html` in a browser for a live
  preview (space: pause, arrow keys: seek, `?t=120` to start at a time).
  - `engine.js` — timeline, captions, drawing helpers
  - `parts.js` — pumpjack linkage (real four-bar kinematics), downhole pump, well cross-section
  - `scenes_a.js`, `scenes_b.js`, `scenes_c.js` — the scenes and their caption text
- `render.mjs` — renders frames in headless Chromium (Playwright) and encodes with ffmpeg
- `narrate.mjs` — synthesizes the narration with the open Kokoro-82M text-to-speech
  model (`kokoro-js`; voice `am_michael`, change with `--voice`), one clip per caption
- `audio.py` — synthesizes the machinery soundtrack from the exported timeline and
  mixes the narration over it (numpy only)
- `snap.mjs` — renders individual test frames
- `build.sh` — runs the full pipeline

```bash
./build.sh          # -> out/pumpjack.mp4
```

Each caption is shown for as long as its narration clip lasts, so editing a caption
in a scene file re-voices and re-times that scene on the next build. The first
build downloads the voice model from huggingface.co.
