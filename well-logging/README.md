# Well logging, explained

A 7-minute educational animation (1080p, English narration and captions) about well logging:
what it is, when it is run, why we log, and how the main logs work at depth and turn into curves.

**Result:** [`out/well-logging.mp4`](out/well-logging.mp4) · captions: [`out/captions.srt`](out/captions.srt)

Content is based on H. Liu, *Principles and Applications of Well Logging* (Springer, 2017):
chapter 1 (definition, history, uses), 2 (resistivity, SP, laterolog, induction, FMI),
3 (sonic), 4 (gamma ray, density, neutron, neutron–density gas crossover) and 10 (integrated interpretation).

## Scenes

| # | Scene | What is shown |
|---|---|---|
| – | Title | |
| 1 | What is well logging? | logging unit, wireline, sonde; the log being recorded; 1927 Pechelbronn |
| 2 | When is logging done? | LWD while drilling · open-hole wireline before casing · cased-hole logs |
| 3 | Why we log | the four questions; the combined tool string |
| 4 | The borehole environment | mudcake, flushed / transition / undisturbed zones, depth of investigation |
| 5 | How a log is recorded | the standard four-track display drawn bottom-up |
| 6 | Gamma ray | natural gamma rays into a scintillation crystal; shale volume; well-to-well correlation |
| 7 | SP | membrane and liquid-junction potentials, shale baseline, sand line |
| 8 | Resistivity | pore-scale conduction, laterolog, induction, invasion profile, Archie |
| 9 | Sonic (acoustic) | transmitter, two receivers, waveforms, Δt, Wyllie |
| 10 | Density | Cs-137 source, Compton scattering, near/far detectors, density porosity |
| 11 | Neutron | neutron slowing by hydrogen, gas and shale effects |
| 12 | Neutron + density | compatible scales, overlay, gas crossover, shale separation |
| 13 | Borehole images | 8-pad microresistivity imager, unrolled image, sine waves = dip, fractures |
| 14 | Putting it together | full suite: reservoir, fluids, contacts, Archie saturation, pay, perforations |
| – | Outro | one tile per log |

Every log in the film comes from one synthetic geological column (`src/parts.js`: shale, gas / oil / water
sandstone, shale, tight limestone, shale) with textbook responses, so all scenes show consistent curves.

## Build

```bash
./build.sh          # -> out/well-logging.mp4  (about 15 minutes)
```

`node snap.mjs <dir> gr+c1+4 ...` renders single test frames; open `src/index.html` in a browser for a live preview.
