// Short social-media cut: one punchy line per log, reusing the full film's animations
// with compressed cue timing. Replaces the long film's scene list.
const LONG = Object.fromEntries(SCENES.map(s => [s.id, s]));
SCENES.length = 0;

// a stand-in scene timing for the long scene's draw/events: cue starts c and ends e, in seconds of this scene
function fakeOf(s, f) { const D = s.dur, [c, e] = f(D); return { c, e, dur: D, start: s.start, id: s.id }; }
function shortScene(o) {
  const L = LONG[o.from];
  SCENES.push({
    id: o.id, title: o.title, tag: o.tag, col: o.col, amb: o.amb || 'lab', lead: o.lead, extra: o.extra ?? .3, cues: [o.say],
    events(s) {
      const F = fakeOf(s, o.time), ev = (L.events ? L.events(F) : []).filter(e => e.t < s.dur - .1);
      return [{ t: .02, type: 'whoosh' }, ...ev];
    },
    draw(ctx, t, c, s) { const F = fakeOf(s, o.time); L.draw(ctx, t, F.c, F); },
  });
}

shortScene({ id: 'hook', from: 'title', lead: .8, extra: .2, say: 'Well logging, explained fast.', time: D => [[.8], [D]] });
shortScene({
  id: 'what', from: 'what', title: 'Well logging', tag: '= reading the rock along the borehole', amb: 'rig',
  say: 'A tool on a cable reads the rock along the borehole, and every reading becomes a curve against depth. That is the log.',
  time: D => [[.2, D * .45, D + 5], [D * .45 - .1, D + .5, D + 6]],
});
shortScene({
  id: 'when', from: 'when', title: 'When?', tag: 'while drilling · before casing · through casing', amb: 'rig',
  say: 'It runs while drilling, after each section before casing, and later through the casing.',
  time: D => [[0, D * .33, D * .62], [D * .33, D * .62, D + 1]],
});
shortScene({
  id: 'gr', from: 'gr', title: 'Gamma ray', tag: '→ shale or reservoir?', col: C.gr,
  say: 'Gamma ray counts natural radiation. Shale is hot, clean sand is not, so it finds the reservoir.',
  time: D => [[.1, D * .5, D + 5], [D * .5 - .1, D, D + .4]],
});
shortScene({
  id: 'sp', from: 'sp', title: 'SP', tag: '→ permeable beds', col: C.sp,
  say: { t: 'SP reads a natural voltage in the mud. It swings away from the shale line opposite permeable beds.', say: 'S P reads a natural voltage in the mud. It swings away from the shale line opposite permeable beds.' },
  time: D => [[.1, D * .3, D * .55], [D * .3, D * .55, D + .4]],
});
shortScene({
  id: 'res', from: 'res', title: 'Resistivity', tag: '→ oil, gas or water?', col: C.rd,
  say: "Resistivity: salty water conducts, oil and gas don't. High resistivity means hydrocarbons.",
  time: D => [[.1, D + 5, D + 6, D + 7], [D, D + 5.5, D + 6.5, D + .4]],
});
shortScene({
  id: 'sonic', from: 'sonic', title: 'Sonic', tag: '→ porosity from sound', col: C.dt,
  say: 'Sonic times a sound pulse along the wall. The slower the sound, the more porous the rock.',
  time: D => [[.1, D * .4, D + 5], [D * .4, D, D + .4]],
});
shortScene({
  id: 'density', from: 'density', title: 'Density', tag: '→ porosity from gamma rays', col: C.rhob,
  say: 'Density fires gamma rays into the rock. Denser rock sends fewer back, and that gives porosity.',
  time: D => [[.1, D * .45, D * .72], [D * .45, D * .72, D + .4]],
});
shortScene({
  id: 'neutron', from: 'neutron', title: 'Neutron', tag: '→ counts hydrogen', col: C.nphi,
  say: 'Neutron counts hydrogen, so it sees the fluid in the pores, and reads low in gas.',
  time: D => [[.1, D * .4, D * .68], [D * .4, D * .68, D + .4]],
});
shortScene({
  id: 'nd', from: 'nd', title: 'Neutron + density', tag: '→ the gas finder', col: '#ffd166',
  say: "Put neutron and density together. Where the curves cross over, that's gas.",
  time: D => [[0, D * .42, D + 5], [D * .42, D + .3, D + 6]],
});
shortScene({
  id: 'images', from: 'images', title: 'Image logs', tag: '→ a picture of the wall', col: C.accent,
  say: 'Image logs map the borehole wall. Layers and fractures show up as sine waves that give their dip.',
  time: D => [[0, D * .3, D * .6], [D * .3, D * .6, D + .3]],
});
shortScene({
  id: 'together', from: 'together', title: 'All together', tag: '→ where the oil is', col: C.oil,
  say: 'Read together, they show where the oil is, how much there is, and where to perforate.',
  time: D => [[0, D * .33, D * .62], [D * .33, D * .62, D + .3]],
});
shortScene({ id: 'outro', from: 'outro', lead: .5, extra: 2.2, say: "That's well logging: the rock, read from inside.", time: D => [[.5], [D]] });
