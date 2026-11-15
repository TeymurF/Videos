// Scenes: title, production flows forward, why back allocation, what is allocated.

// side view: reservoir, three wells, surface
const SIDE = { gy: 400, wx: { A: 330, B: 900, C: 1470 }, rt: 690, rb: 830 };
const SIDE_SP = (() => { const R = rng(41), a = []; for (let i = 0; i < 520; i++) a.push([R() * 1920, SIDE.rt + 6 + R() * (SIDE.rb - SIDE.rt - 12), 2 + R() * 4, R()]); return a; })();
function drawSide(ctx, T, o = {}) {
  const { gy, wx, rt, rb } = SIDE, a = o.a ?? 1; if (a <= .01) return;
  ctx.save(); ctx.globalAlpha *= a;
  ctx.save(); ctx.translate(960, gy); drawSky(ctx, -1000, 1000, -gy - 10); ctx.restore();
  ctx.fillStyle = '#40342a'; ctx.fillRect(0, gy, W, 90); ctx.fillStyle = '#2e2822'; ctx.fillRect(0, gy + 70, W, 150); ctx.fillStyle = '#262b30'; ctx.fillRect(0, gy + 200, W, rt - gy - 200);
  ctx.fillStyle = '#6b5230'; ctx.fillRect(0, rt, W, rb - rt); ctx.fillStyle = '#20242a'; ctx.fillRect(0, rb, W, H - rb);
  for (const p of SIDE_SP) { ctx.fillStyle = p[3] > .66 ? 'rgba(233,166,59,.6)' : p[3] > .4 ? 'rgba(74,168,224,.5)' : 'rgba(40,28,14,.45)'; ctx.beginPath(); ctx.arc(p[0], p[1], p[2], 0, TAU); ctx.fill(); }
  ctx.fillStyle = '#4b3d30'; ctx.fillRect(0, gy, W, 6);
  const fl = o.flow ?? 1, ph = [C.oil, C.water, C.oil, C.gas, C.oil, C.water];
  for (const k of 'ABC') {
    const x = wx[k] + 128;
    ctx.fillStyle = '#8d9499'; ctx.fillRect(x - 15, gy, 30, rb - gy - 30); ctx.fillStyle = '#131a21'; ctx.fillRect(x - 10, gy, 20, rb - gy - 36);
    if (fl > 0) {
      for (const sd of [-1, 1]) dots(ctx, [[x + sd * 330, rt + 70 + sd * 20], [x + sd * 40, rt + 70], [x, rt + 70]], T, { a: fl * .9, colors: ph, speed: 45, gap: 30, r: 5 });
      dots(ctx, [[x, rb - 60], [x, gy - 10]], T, { a: fl, colors: ph, speed: 90, gap: 24, r: 5.5 });
    }
    ctx.save(); ctx.translate(wx[k], gy); ctx.scale(.55, .55); drawPumpjack(ctx, TH(T) + { A: 0, B: 2.1, C: 4 }[k], { flowLen: 110 }); ctx.restore();
    badge(ctx, wx[k] - 150, gy - 215, k, { r: 30 });
  }
  ctx.restore();
}

// ---------- Title ----------
SCENES.push({
  id: 'title', amb: 'field', lead: 1.6, extra: .6,
  cues: ['Many wells flow into one facility, and their production is measured together. So how do we know what each well produced? The answer is back allocation.'],
  draw(ctx, t) {
    ctx.save(); ctx.translate(960, 540); ctx.scale(1.06 + .012 * t, 1.06 + .012 * t); ctx.translate(-960, -500); drawSide(ctx, GT); ctx.restore();
    ctx.fillStyle = 'rgba(11,16,22,.74)'; ctx.fillRect(0, 0, W, H);
    const a = pr(t, .4, 1.2); ctx.globalAlpha = a; ctx.translate(0, (1 - a) * 24);
    txt(ctx, 'PRODUCTION ALLOCATION · OIL · GAS · WATER', 960, 330, { size: 26, mono: true, weight: 700, color: C.accent, align: 'center' });
    txt(ctx, 'Back Allocation', 960, 450, { size: 150, weight: 700, align: 'center' });
    ctx.globalAlpha = pr(t, 1.4, 1.2); ctx.fillStyle = C.accent; ctx.fillRect(915, 560, 90, 5);
    txt(ctx, 'From shared meters back to every well', 960, 625, { size: 44, weight: 400, color: '#c4cfd9', align: 'center' });
    ['A', 'B', 'C'].forEach((k, i) => badge(ctx, 880 + i * 80, 730, k, { r: 30, a: pr(t, 2 + i * .25, .6) }));
  },
});

// ---------- 1. Production flows forward ----------
SCENES.push({
  id: 'flow', title: 'Production flows forward', amb: 'field',
  cues: [
    'Fluids enter each well from the reservoir and reach the surface by natural flow or artificial lift. The wellhead stream is a mixture of oil, water and gas.',
    'Flowlines carry production from wells A, B and C to a gathering manifold. There the streams mix and go on to separation and processing.',
    'After mixing, a conventional meter sees only the combined stream. The colours here show origin for you, the viewer. The meter cannot tell the sources apart.',
  ],
  draw(ctx, t, c, s) {
    const k = pr(t, c[1] - .7, 1.4);
    if (k < 1) {
      drawSide(ctx, GT, { a: 1 - k });
      const a0 = (1 - k) * win(t, c[0] + 1, s.e[0] + 1);
      label(ctx, 300, 760, 420, 600, 'Reservoir\noil, water and gas in the rock', { a: a0 });
      label(ctx, SIDE.wx.B + 128, 560, SIDE.wx.B + 330, 520, 'Wellhead stream\noil + water + gas', { a: (1 - k) * win(t, at(s, 0, .55), s.e[0] + 1) });
      [[C.oil, 'oil'], [C.water, 'water'], [C.gas, 'gas']].forEach((p, i) => { const a = (1 - k) * lin(t, at(s, 0, .6) + i * .3, .4); ctx.globalAlpha = a; ctx.fillStyle = p[0]; ctx.beginPath(); ctx.arc(1560, 596 + i * 40, 10, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; txt(ctx, p[1], 1582, 597 + i * 40, { size: 26, weight: 600, a }); });
    }
    if (k > 0) {
      drawPFD(ctx, GT, { a: k, meters: lin(t, c[2] - .5, 1), hl: { man: t > c[1] + 3 && t < s.e[1], mG: t > c[2] + .5, mO: t > c[2] + .5, mW: t > c[2] + .5 } });
      label(ctx, PFD.manX + 10, 600, PFD.manX + 110, 840, 'Streams A, B and C mix here', { a: k * win(t, at(s, 1, .4), s.e[1]) });
      label(ctx, 720, 470, 760, 300, 'Commingled stream', { a: k * win(t, at(s, 1, .6), s.e[1]) });
      const a2 = win(t, at(s, 2, .12), s.e[2] + .3);
      chip(ctx, 1380, 830, 'Each meter measures a total, not the sources', { a: a2, size: 30, align: 'center' });
      chip(ctx, 430, 860, 'Colours = origin, for the viewer only', { a: win(t, at(s, 2, .5), s.e[2] + .3), size: 26, align: 'center', color: C.dim });
    }
  },
});

// ---------- 2. Why back allocation ----------
SCENES.push({
  id: 'why', title: 'Why back allocation is needed', amb: 'plant',
  cues: [
    'Measuring every phase at every well, all the time, is rarely possible. Wells are tested periodically, metered with multiphase meters, or estimated with models.',
    'Combined, processed streams are measured much more reliably, but they already contain commingled production.',
    'Back allocation works in the opposite direction to the flow. It assigns the measured totals back to facilities, fields and individual wells.',
    'The result is a reconciled estimate for every source. It remains a calculated value with uncertainty, even when the total is measured accurately.',
    'It provides daily and monthly well production, supports water-cut and gas–oil-ratio analysis, guides well testing, and builds the production history for reservoir management.',
  ],
  events(s) { return [{ t: s.c[2] + .6, type: 'whoosh' }]; },
  draw(ctx, t, c, s) {
    const dim = lerp(1, .32, pr(t, c[4] - .4, 1));
    drawPFD(ctx, GT, { a: dim, hl: { mG: t > c[1] && t < c[2], mO: t > c[1] && t < c[2], mW: t > c[1] && t < c[2] } });
    const src = [['A', 'periodic well test'], ['B', 'multiphase meter'], ['C', 'model estimate']];
    src.forEach((p, i) => { const w = PFD.wells[p[0]]; chip(ctx, w[0] - 150, w[1] + 46, p[1], { a: win(t, at(s, 0, .45) + i * .9, c[2]) * dim, size: 24, color: C[p[0]] }); });
    chip(ctx, 1400, 850, 'Measured reliably, but already commingled', { a: win(t, c[1] + 1, c[2]), size: 30, align: 'center' });
    // reverse arrows
    const ka = lin(t, c[2] + .6, 2.4), aa = lin(t, c[2] + .4, .5) * dim;
    const ya = k => PFD.out(k)[1] + 34;
    backArrow(ctx, [[790, 509], [345, 509]], GT, { a: aa, k: ka });
    backArrow(ctx, [[790, 509], [690, 509], [690, ya('A')], [345, ya('A')]], GT, { a: aa, k: ka });
    backArrow(ctx, [[790, 509], [690, 509], [690, ya('C')], [345, ya('C')]], GT, { a: aa, k: ka });
    chip(ctx, 960, 870, 'Allocation is a calculation — it runs against the flow', { a: win(t, c[2] + 2, c[3]), size: 30, align: 'center' });
    const a3 = win(t, c[3] + .6, c[4]);
    'ABC'.split('').forEach((k, i) => { const w = PFD.wells[k]; chip(ctx, w[0] + 120, w[1] + 46, 'estimate ± uncertainty', { a: a3 * lin(t, c[3] + .8 + i * .5, .4), size: 24, color: C[k] }); });
    chip(ctx, 1400, 850, 'Totals: measured     Wells: calculated', { a: a3, size: 30, align: 'center' });
    // uses
    const a4 = lin(t, c[4] - .2, .8);
    if (a4 > 0) {
      box(ctx, 1010, 180, 800, 690, { a: a4 * .97, stroke: 'rgba(255,255,255,.18)' });
      txt(ctx, 'WHAT IT IS USED FOR', 1056, 236, { size: 24, mono: true, weight: 700, color: C.accent, a: a4 });
      ['Daily and monthly production of every well', 'Water-cut and gas–oil-ratio analysis', 'Evaluating equipment performance', 'Scheduling well tests', 'Production history for reservoir management', 'Input to partner reporting'].forEach((it, i) => {
        const a = a4 * lin(t, at(s, 4, .06 + i * .14), .5), y = 318 + i * 88;
        ctx.globalAlpha = a; ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(1072, y, 9, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
        txt(ctx, it, 1104, y, { size: 32, weight: 500, a });
      });
    }
  },
});

// ---------- 3. What is allocated ----------
function glyph(ctx, kind, x, y, r, col) {
  ctx.save(); ctx.translate(x, y); ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineWidth = r * .16; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const drop = (dx, dy, k) => { ctx.beginPath(); ctx.moveTo(dx, dy - r * k); ctx.bezierCurveTo(dx + r * .75 * k, dy - r * .1 * k, dx + r * .62 * k, dy + r * .8 * k, dx, dy + r * .8 * k); ctx.bezierCurveTo(dx - r * .62 * k, dy + r * .8 * k, dx - r * .75 * k, dy - r * .1 * k, dx, dy - r * k); ctx.fill(); };
  if (kind === 'oil') drop(0, 0, 1);
  if (kind === 'cond') { drop(-r * .35, r * .15, .7); drop(r * .45, -r * .2, .5); }
  if (kind === 'gas' || kind === 'energy') { ctx.beginPath(); ctx.moveTo(0, -r); ctx.bezierCurveTo(r * .9, -r * .2, r * .7, r * .9, 0, r * .9); ctx.bezierCurveTo(-r * .8, r * .9, -r * .7, 0, -r * .25, -r * .3); ctx.bezierCurveTo(-r * .1, 0, r * .1, -r * .4, 0, -r); ctx.fill(); }
  if (kind === 'energy') { ctx.fillStyle = '#0b1016'; ctx.beginPath(); ctx.moveTo(r * .12, -r * .3); ctx.lineTo(-r * .28, r * .25); ctx.lineTo(0, r * .25); ctx.lineTo(-r * .12, r * .72); ctx.lineTo(r * .3, r * .1); ctx.lineTo(r * .04, r * .1); ctx.closePath(); ctx.fill(); }
  if (kind === 'water') for (let i = -1; i <= 1; i++) { ctx.beginPath(); for (let j = 0; j <= 20; j++) { const px = -r + j / 20 * 2 * r, py = i * r * .5 + Math.sin(j / 20 * TAU * 1.5) * r * .16; j ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke(); }
  if (kind === 'comp') { ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + Math.PI / 6; i ? ctx.lineTo(Math.cos(a) * r * .8, Math.sin(a) * r * .8) : ctx.moveTo(Math.cos(a) * r * .8, Math.sin(a) * r * .8); } ctx.closePath(); ctx.stroke(); for (let i = 0; i < 6; i += 2) { const a = i / 6 * TAU + Math.PI / 6; ctx.beginPath(); ctx.arc(Math.cos(a) * r * .8, Math.sin(a) * r * .8, r * .2, 0, TAU); ctx.fill(); } }
  ctx.restore();
}
function infoCard(ctx, x, y, w, h, o) {
  const a = o.a ?? 1; if (a <= .01) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(0, (1 - a) * 18);
  box(ctx, x, y, w, h, { stroke: o.hl ? o.color : 'rgba(255,255,255,.12)', lw: o.hl ? 3 : 2 });
  ctx.fillStyle = o.color; ctx.globalAlpha *= .16; ctx.beginPath(); ctx.arc(x + 70, y + 76, 46, 0, TAU); ctx.fill(); ctx.globalAlpha /= .16;
  if (o.glyph) glyph(ctx, o.glyph, x + 70, y + 76, 28, o.color);
  txt(ctx, o.title, x + 136, y + 76, { size: o.ts ?? 38, weight: 700 });
  txt(ctx, o.body, x + 34, y + 166, { size: o.bs ?? 26, color: '#b9c5d0', lh: 1.38 });
  ctx.restore();
}
SCENES.push({
  id: 'what', title: 'What is allocated', amb: 'calc',
  cues: [
    'Three main quantities are allocated: oil, gas and water, each on a defined accounting basis.',
    'Where the process requires it, condensate and natural gas liquids, individual components, or gas energy are allocated as well.',
    'Oil, gas and water should not automatically share one allocation factor. Their meters, routes, inventories and rules are different.',
  ],
  events(s) { return [0, 1, 2].map(i => ({ t: at(s, 0, .12 + i * .2), type: 'tick' })).concat([0, 1, 2].map(i => ({ t: at(s, 1, .1 + i * .22), type: 'tick' }))); },
  draw(ctx, t, c, s) {
    const cards = [
      ['oil', 'Oil', C.oil, 'Net oil on a defined basis, with\nspecified treatment of water\nand sediment'],
      ['gas', 'Gas', C.gas, 'Reservoir gas, kept apart from\nexternal inputs and internal\ncirculation'],
      ['water', 'Water', C.water, 'Produced water, separate from\nexternal water and inventory\nchanges'],
      ['cond', 'Condensate, NGL', '#f2c66d', 'Separate products where the\nprocess and accounting model\nrequire them'],
      ['comp', 'Component mass', '#c9a0ff', 'Individual components tracked\nin compositional allocation'],
      ['energy', 'Gas energy', '#ff9f6b', 'Gas quantity multiplied by an\nagreed heating value'],
    ];
    cards.forEach((cd, i) => {
      const row = Math.floor(i / 3), col = i % 3, a = pr(t, row ? at(s, 1, .1 + col * .22) : at(s, 0, .12 + col * .2), .7);
      infoCard(ctx, 120 + col * 570, 150 + row * 330, 540, 300, { a, glyph: cd[0], title: cd[1], color: cd[2], body: cd[3], hl: row === 0 && t > c[2] });
    });
    const a2 = lin(t, c[2] + .5, .8);
    if (a2 > 0) {
      box(ctx, 360, 808, 1200, 84, { a: a2 * .97, fill: 'rgba(11,16,22,.95)', stroke: C.accent, lw: 3 });
      ctx.globalAlpha = a2; let x = 470;
      [['K', 'oil', C.oil], ['K', 'gas', C.gas], ['K', 'water', C.water]].forEach((p, i) => {
        txt(ctx, 'K', x, 850, { size: 46, mono: true, weight: 700, color: p[2] }); txt(ctx, p[1], x + 32, 864, { size: 26, weight: 700, color: p[2] });
        if (i < 2) txt(ctx, '≠', x + 200, 850, { size: 46, weight: 700, color: C.ink, align: 'center' });
        x += 290;
      });
      txt(ctx, 'one factor per phase', 1255, 850, { size: 26, color: C.dim }); ctx.globalAlpha = 1;
    }
  },
});
