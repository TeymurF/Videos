// Part 1b: drilling, evaluation and appraisal, completion, production and lift.

function strataFlat(ctx, y0, bands) { let y = y0; for (const [h, c] of bands) { ctx.fillStyle = c; ctx.fillRect(0, y, W, h + 1); y += h; } }
function speck(ctx, seed, x0, y0, x1, y1, n) { const R = rng(seed); for (let i = 0; i < n; i++) { ctx.fillStyle = R() > .5 ? 'rgba(233,166,59,.5)' : 'rgba(40,28,14,.45)'; ctx.beginPath(); ctx.arc(x0 + R() * (x1 - x0), y0 + R() * (y1 - y0), 2 + R() * 4, 0, TAU); ctx.fill(); } }
// offshore structure pictograms on a small sea line
function offRig(ctx, kind, x, y, name) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = '#15526f'; ctx.fillRect(-90, 0, 180, 70); ctx.fillStyle = '#3a3126'; ctx.fillRect(-90, 70, 180, 8);
  ctx.strokeStyle = '#b4c1cc'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-14, -40); ctx.lineTo(0, -120); ctx.lineTo(14, -40); ctx.stroke();
  if (kind === 'jackup') { ctx.fillStyle = '#93a4b3'; for (const lx of [-56, 0, 56]) ctx.fillRect(lx - 5, -90, 10, 160); ctx.fillStyle = '#e0a437'; rr(ctx, -70, -44, 140, 28, 4); ctx.fill(); }
  if (kind === 'semi') { ctx.fillStyle = '#e0a437'; rr(ctx, -70, -46, 140, 22, 4); ctx.fill(); ctx.fillStyle = '#93a4b3'; for (const lx of [-50, 50]) ctx.fillRect(lx - 9, -24, 18, 50); ctx.fillStyle = '#b3411f'; rr(ctx, -74, 20, 148, 18, 8); ctx.fill(); ctx.strokeStyle = '#cfd8df'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-60, 38); ctx.lineTo(-86, 70); ctx.moveTo(60, 38); ctx.lineTo(86, 70); ctx.stroke(); }
  if (kind === 'ship') { ctx.fillStyle = '#b3411f'; ctx.beginPath(); ctx.moveTo(-84, -30); ctx.lineTo(86, -30); ctx.lineTo(70, 12); ctx.lineTo(-72, 12); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#e9eef3'; ctx.fillRect(-76, -54, 30, 24); }
  ctx.restore(); txt(ctx, name, x, y + 108, { size: 22, weight: 600, align: 'center' });
}
function platform(ctx, x, sy, by, s = 1, o = {}) { // fixed platform: deck on a jacket standing on the sea bed
  ctx.strokeStyle = '#93a4b3'; ctx.lineWidth = 6 * s; ctx.beginPath(); ctx.moveTo(x - 50 * s, sy - 30 * s); ctx.lineTo(x - 80 * s, by); ctx.moveTo(x + 50 * s, sy - 30 * s); ctx.lineTo(x + 80 * s, by); ctx.stroke();
  ctx.lineWidth = 3 * s; for (let i = 0; i < 4; i++) { const y0 = lerp(sy, by, i / 4), y1 = lerp(sy, by, (i + 1) / 4), w0 = 50 + 30 * i / 4, w1 = 50 + 30 * (i + 1) / 4; ctx.beginPath(); ctx.moveTo(x - w0 * s, y0); ctx.lineTo(x + w1 * s, y1); ctx.moveTo(x + w0 * s, y0); ctx.lineTo(x - w1 * s, y1); ctx.stroke(); }
  ctx.fillStyle = o.color ?? '#e0a437'; rr(ctx, x - 90 * s, sy - 70 * s, 180 * s, 40 * s, 5); ctx.fill(); ctx.fillStyle = '#5d7890'; rr(ctx, x - 70 * s, sy - 120 * s, 70 * s, 50 * s, 5); ctx.fill(); ctx.fillStyle = '#46627a'; rr(ctx, x + 10 * s, sy - 104 * s, 60 * s, 34 * s, 5); ctx.fill();
  ctx.strokeStyle = '#b4c1cc'; ctx.lineWidth = 4 * s; ctx.beginPath(); ctx.moveTo(x + 80 * s, sy - 70 * s); ctx.lineTo(x + 150 * s, sy - 150 * s); ctx.stroke();
}

// ---------- 4. Drilling ----------
SCENES.push({
  id: 'drill', title: 'Drilling the exploration well', amb: 'drill', part: 0,
  cues: [
    'An exploration well tests the idea. A drilling rig creates the well. It is not the pumpjack that may produce from it later.',
    'The drillstring turns a bit that breaks the rock. Drilling fluid is pumped down inside the pipe, and returns up the outside carrying the cuttings.',
    'As the well deepens, steel casing is run and cemented in stages, each one narrower than the last.',
    'Blowout preventers at the wellhead are part of well control. Offshore, the rig may be a jack-up, a semisubmersible or a drillship.',
  ],
  draw(ctx, t, c, s) {
    const gy = 330, X = 600, D = kf(t, [[0, gy + 20], [c[1], gy + 110], [c[2], gy + 300], [c[3], gy + 470], [s.e[3], gy + 530]], false);
    sky(ctx, gy); strataFlat(ctx, gy, [[70, '#40342a'], [120, '#2e2822'], [150, '#262b30'], [170, '#2d2620'], [150, '#5c4a30'], [200, '#20242a']]);
    speck(ctx, 5, 0, gy + 512, W, gy + 656, 300);
    // hole in three sections, each narrower
    const SEC = [[gy, gy + 190, 46], [gy + 190, gy + 370, 33], [gy + 370, gy + 560, 22]];
    for (const [y0, y1, r] of SEC) { const yb = Math.min(y1, D); if (yb <= y0) continue; ctx.fillStyle = '#6a5a44'; ctx.fillRect(X - r, y0, 2 * r, yb - y0); }
    // casing + cement once the next section has started
    SEC.forEach(([y0, y1, r], i) => { const k = pr(D, y1 + 30, 60); if (i > 1 || k <= 0) return; const h = (y1 - gy) * k; ctx.fillStyle = C.cement; ctx.fillRect(X - r, gy + (y1 - gy) - h, 7, h); ctx.fillRect(X + r - 7, gy + (y1 - gy) - h, 7, h); ctx.fillStyle = '#c0cbd5'; ctx.fillRect(X - r + 7, gy, 5, y1 - gy); ctx.fillRect(X + r - 12, gy, 5, y1 - gy); });
    // drillstring, bit, circulation
    const br = D > SEC[1][1] ? 20 : D > SEC[0][1] ? 30 : 42;
    ctx.fillStyle = '#93a4b3'; ctx.fillRect(X - 8, gy - 40, 16, D - gy + 20); ctx.fillStyle = C.mud; ctx.fillRect(X - 4, gy - 40, 8, D - gy + 20);
    ctx.save(); ctx.translate(X, D); ctx.fillStyle = '#d8e1e9'; ctx.beginPath(); ctx.moveTo(-br, -22); ctx.lineTo(br, -22); ctx.lineTo(br * .6, 6); ctx.lineTo(-br * .6, 6); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#2a323a'; for (let i = -2; i <= 2; i++) ctx.fillRect(i * br * .34 - 3 + Math.sin(t * 20 + i) * 2, -2, 6, 10); ctx.restore();
    const mf = lin(t, c[1] - .2, 1);
    dots(ctx, [[X, gy - 30], [X, D - 20]], t, { color: '#f4dcae', speed: 140, gap: 30, r: 3.5, a: mf });
    for (const sd of [-1, 1]) dots(ctx, [[X + sd * (br - 8), D - 8], [X + sd * 16, gy + 8]], t, { colors: ['#b08a5a', '#5a4630', '#b08a5a', '#3a2c1c'], speed: 100, gap: 20, r: 4.5, a: mf });
    rig(ctx, X, gy, .5, t);
    // blowout preventer stack
    const hb = t > c[3] + .5 && t < at(s, 3, .45);
    for (let i = 0; i < 3; i++) { ctx.fillStyle = hb ? C.accent : '#c0563b'; rr(ctx, X - 22, gy - 16 - i * 13, 44, 11, 3); ctx.fill(); }
    // mud system
    ctx.fillStyle = '#46627a'; rr(ctx, 880, gy - 60, 200, 60, 6); ctx.fill(); ctx.fillStyle = C.mud; ctx.fillRect(888, gy - 44, 184, 38);
    ctx.fillStyle = '#6f8091'; ctx.beginPath(); ctx.moveTo(800, gy - 54); ctx.lineTo(880, gy - 40); ctx.lineTo(880, gy - 28); ctx.lineTo(800, gy - 42); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#5a4630'; ctx.beginPath(); ctx.moveTo(770, gy); ctx.lineTo(805, gy - 26 * mf); ctx.lineTo(840, gy); ctx.closePath(); ctx.fill();
    pipe(ctx, [[X + 30, gy - 14], [760, gy - 14], [800, gy - 50]], { w: 6 }); pipe(ctx, [[1080, gy - 30], [1140, gy - 30], [1140, gy - 170], [X + 14, gy - 170]], { w: 6, a: .9 });
    dots(ctx, [[X + 30, gy - 14], [760, gy - 14], [800, gy - 50], [880, gy - 36]], t, { color: '#b08a5a', speed: 90, gap: 24, r: 4, a: mf }); dots(ctx, [[1080, gy - 30], [1140, gy - 30], [1140, gy - 170], [X + 14, gy - 170]], t, { color: '#f4dcae', speed: 120, gap: 28, r: 4, a: mf });
    txt(ctx, 'mud tanks', 980, gy + 30, { size: 20, color: C.dim, align: 'center' }); txt(ctx, 'shaker', 820, gy - 76, { size: 20, color: C.dim, align: 'center' });
    // rig is not a pumpjack
    const a0 = win(t, c[0] + .8, c[1]);
    if (a0 > 0) { ctx.save(); ctx.globalAlpha = a0; ctx.translate(1500, gy); ctx.scale(.42, .42); drawPumpjack(ctx, TH(GT), { flowLen: 60 }); ctx.restore(); chip(ctx, 1500, gy + 60, 'Pumpjack: produces the well, later', { a: a0, size: 24, align: 'center', color: C.dim }); chip(ctx, X, gy + 60 - 330, ' ', { a: 0 }); txt(ctx, '≠', 1180, 210, { size: 80, weight: 700, color: C.hot, align: 'center', a: a0 }); label(ctx, X + 40, 150, 860, 150, 'Drilling rig: creates the well', { a: a0 }); }
    label(ctx, X, gy + 150, 300, gy + 120, 'Down: inside the drillpipe', { a: win(t, c[1] + 1.5, c[2]), align: 'right' });
    label(ctx, X + br - 8, Math.min(D - 60, gy + 250), 900, gy + 230, 'Up: outside the pipe,\ncarrying rock cuttings', { a: win(t, at(s, 1, .5), c[2]) });
    label(ctx, X, D, 300, Math.min(D + 40, 880), 'Drill bit', { a: win(t, c[1] + .5, c[2]), align: 'right' });
    label(ctx, X + 40, gy + 120, 900, gy + 150, 'Casing and cement, stage 1', { a: win(t, at(s, 2, .3), c[3]) });
    label(ctx, X + 28, gy + 290, 900, gy + 300, 'Stage 2: narrower', { a: win(t, at(s, 2, .65), c[3]) });
    label(ctx, X + 22, gy - 30, 300, gy - 110, 'Blowout preventers', { a: win(t, c[3] + .4, at(s, 3, .45)), align: 'right' });
    const a3 = lin(t, at(s, 3, .42), .7);
    if (a3 > 0) { box(ctx, 1160, 440, 680, 400, { a: a3 * .97, stroke: 'rgba(255,255,255,.2)' }); ctx.globalAlpha = a3; txt(ctx, 'OFFSHORE DRILLING UNITS', 1196, 488, { size: 22, mono: true, weight: 700, color: C.dim }); [['jackup', 'Jack-up'], ['semi', 'Semisubmersible'], ['ship', 'Drillship']].forEach((r, i) => { ctx.globalAlpha = a3 * lin(t, at(s, 3, .5 + i * .12), .4); offRig(ctx, r[0], 1280 + i * 220, 680, r[1]); }); ctx.globalAlpha = 1; }
  },
});

// ---------- 5. Evaluation and appraisal ----------
SCENES.push({
  id: 'evaluate', title: 'Is it a discovery?', amb: 'calc', part: 0,
  cues: [
    'Logging tools, rock cores, pressure measurements and fluid samples reveal what the well has found.',
    'Finding hydrocarbons is not enough. The field must flow well, hold enough recoverable volume, and have a route to market.',
    'Appraisal wells narrow the uncertainty. Then engineers choose a development plan: a tie-back to existing facilities, or a standalone development.',
  ],
  events(s) { return [0, 1, 2].map(i => ({ t: at(s, 1, .25 + i * .22), type: 'tick' })).concat([0, 1, 2].map(i => ({ t: at(s, 2, .08 + i * .12), type: 'tick' }))); },
  draw(ctx, t, c, s) {
    const kA = 1 - pr(t, c[2] - .5, .9);
    if (kA > 0) {
      ctx.save(); ctx.globalAlpha = kA;
      const X = 250, y0 = 150, y1 = 880, td = lerp(y0 + 40, y1 - 40, lin(t, c[0] + .5, (s.e[0] - c[0]) * .8)), pay = [560, 690];
      ctx.fillStyle = '#262b30'; ctx.fillRect(120, y0, 260, y1 - y0); ctx.fillStyle = '#5c4a30'; ctx.fillRect(120, pay[0], 260, pay[1] - pay[0]); speck(ctx, 9, 120, pay[0], 380, pay[1], 60);
      wellbore(ctx, X, y0, y1, { r: 26 });
      ctx.strokeStyle = '#cfd8df'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X, y0); ctx.lineTo(X, td - 50); ctx.stroke();
      ctx.fillStyle = C.accent; rr(ctx, X - 10, td - 50, 20, 100, 8); ctx.fill(); ctx.fillStyle = '#0b1016'; for (let i = 0; i < 3; i++) ctx.fillRect(X - 10, td - 30 + i * 26, 20, 4);
      // log tracks
      const TR = [['Gamma ray', C.ok, y => .5 + .3 * Math.sin(y * .06) + .12 * Math.sin(y * .21) - (y > pay[0] && y < pay[1] ? .32 : 0)], ['Resistivity', C.bad, y => .22 + .08 * Math.sin(y * .09) + (y > pay[0] && y < pay[1] ? .5 : 0)], ['Porosity', C.cold, y => .3 + .1 * Math.sin(y * .13 + 1) + (y > pay[0] && y < pay[1] ? .32 : 0)]];
      TR.forEach((tr, i) => {
        const x = 440 + i * 180; ctx.fillStyle = '#10161d'; ctx.fillRect(x, y0, 160, y1 - y0); ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 1; for (let k = 1; k < 4; k++) { ctx.beginPath(); ctx.moveTo(x + k * 40, y0); ctx.lineTo(x + k * 40, y1); ctx.stroke(); }
        if (t > at(s, 0, .5)) { ctx.fillStyle = 'rgba(233,166,59,.14)'; ctx.fillRect(x, pay[0], 160, Math.max(0, Math.min(pay[1], td) - pay[0])); }
        ctx.strokeStyle = tr[1]; ctx.lineWidth = 3; ctx.beginPath(); for (let y = y0 + 6; y < td; y += 3) { const px = x + 10 + clamp(tr[2](y)) * 140; y === y0 + 6 ? ctx.moveTo(px, y) : ctx.lineTo(px, y); } ctx.stroke();
        txt(ctx, tr[0], x + 80, y0 - 22, { size: 20, weight: 600, align: 'center', color: tr[1] });
      });
      label(ctx, X + 10, td, 120, Math.max(td - 90, 200), 'Logging tool', { a: win(t, c[0] + .6, at(s, 0, .5)) * kA, align: 'left', size: 22 });
      chip(ctx, 700, (pay[0] + pay[1]) / 2, 'hydrocarbon-bearing interval', { a: lin(t, at(s, 0, .75), .5), size: 24, align: 'center', color: C.oil });
      // core, sample, pressure
      [['Rock core', 0], ['Fluid sample', 1], ['Pressure test', 2]].forEach((it, i) => {
        const a = lin(t, at(s, 0, .3 + i * .16), .5), x = 1130 + i * 260, y = 300; ctx.globalAlpha = kA * a * (1 - .0 * lin(t, c[1], 1));
        if (i === 0) { ctx.fillStyle = '#8a6e45'; rr(ctx, x - 30, y - 80, 60, 160, 10); ctx.fill(); speck(ctx, 2, x - 26, y - 76, x + 26, y + 76, 30); }
        if (i === 1) { ctx.fillStyle = '#c9d3dc'; ctx.fillRect(x - 12, y - 80, 24, 30); ctx.fillStyle = 'rgba(200,220,235,.25)'; rr(ctx, x - 34, y - 54, 68, 134, 12); ctx.fill(); ctx.fillStyle = C.oil; rr(ctx, x - 30, y + 4, 60, 72, 10); ctx.fill(); ctx.fillStyle = C.water; ctx.fillRect(x - 30, y + 50, 60, 20); }
        if (i === 2) meter(ctx, x, y, { t, r: 62, color: C.cold });
        txt(ctx, it[0], x, y + 124, { size: 26, weight: 600, align: 'center' });
      });
      ctx.globalAlpha = kA;
      ['Can it flow at useful rates?', 'Is there enough recoverable volume?', 'Do costs and market access work?'].forEach((q, i) => { const a = lin(t, at(s, 1, .25 + i * .22), .4), y = 530 + i * 100; box(ctx, 1040, y - 40, 760, 82, { a: a * kA, stroke: C.accent }); txt(ctx, q, 1076, y + 2, { size: 30, weight: 600, a }); });
      chip(ctx, 1420, 850, 'A discovery is not yet a commercial field', { a: lin(t, at(s, 1, .8), .5), size: 28, align: 'center', color: C.hot });
      ctx.restore();
    }
    const kB = pr(t, c[2] - .1, .9);
    if (kB > 0) {
      ctx.save(); ctx.globalAlpha = kB;
      // uncertainty narrows with each appraisal well
      txt(ctx, 'RANGE OF RECOVERABLE VOLUME', 200, 170, { size: 22, mono: true, weight: 700, color: C.dim });
      [['Discovery well', 1], ['+ appraisal well 1', .62], ['+ appraisal well 2', .36]].forEach((r, i) => { const a = lin(t, at(s, 2, .08 + i * .12), .5), y = 220 + i * 62, w = 1000 * r[1] * pr(t, at(s, 2, .08 + i * .12), .8); ctx.globalAlpha = kB * a; txt(ctx, r[0], 200, y + 20, { size: 26, weight: 600 }); ctx.fillStyle = '#1b2733'; rr(ctx, 560, y, 1100, 40, 10); ctx.fill(); ctx.fillStyle = C.oil; rr(ctx, 1110 - w / 2, y, w, 40, 10); ctx.fill(); });
      ctx.globalAlpha = kB;
      // two development concepts
      const a2 = lin(t, at(s, 2, .45), .8), sel = lin(t, at(s, 2, .85), .5), sy = 560, by = 800;
      [[200, 'TIE-BACK', 'to an existing platform'], [1000, 'STANDALONE', 'new dedicated facilities']].forEach((p, i) => {
        ctx.save(); ctx.globalAlpha = kB * a2 * lin(t, at(s, 2, .45 + i * .14), .5); rr(ctx, p[0], 440, 720, 420, 18); ctx.clip();
        ctx.fillStyle = '#16283a'; ctx.fillRect(p[0], 440, 720, 120); ctx.translate(0, 0);
        const g = ctx.createLinearGradient(0, sy, 0, by); g.addColorStop(0, '#15526f'); g.addColorStop(1, '#082534'); ctx.fillStyle = g; ctx.fillRect(p[0], sy, 720, by - sy); ctx.fillStyle = '#3a3126'; ctx.fillRect(p[0], by, 720, 70);
        if (i === 0) { platform(ctx, p[0] + 520, sy, by, .8, { color: '#8a97a3' }); const tr = [p[0] + 150, by]; ctx.fillStyle = C.accent; rr(ctx, tr[0] - 22, by - 34, 44, 34, 5); ctx.fill(); pipe(ctx, [[tr[0] + 22, by - 8], [p[0] + 450, by - 8], [p[0] + 490, sy - 20]], { w: 6, color: C.accent }); dots(ctx, [[tr[0] + 22, by - 8], [p[0] + 450, by - 8], [p[0] + 490, sy - 20]], t, { color: C.oil, speed: 70, gap: 26, r: 5 }); txt(ctx, 'existing platform', p[0] + 520, sy - 116, { size: 20, color: C.dim, align: 'center' }); txt(ctx, 'new subsea well', tr[0], by - 56, { size: 20, color: C.accent, align: 'center' }); }
        else { platform(ctx, p[0] + 500, sy, by, .9); for (const dx of [-60, 0, 60]) { ctx.strokeStyle = C.oil; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(p[0] + 500 + dx * .3, sy); ctx.lineTo(p[0] + 500 + dx * 2.2, by + 60); ctx.stroke(); } }
        ctx.restore();
        ctx.globalAlpha = kB * a2 * lin(t, at(s, 2, .45 + i * .14), .5); ctx.strokeStyle = i === 0 && sel > 0 ? C.accent : 'rgba(255,255,255,.2)'; ctx.lineWidth = i === 0 && sel > 0 ? 5 : 2; rr(ctx, p[0], 440, 720, 420, 18); ctx.stroke();
        txt(ctx, p[1], p[0] + 30, 478, { size: 26, mono: true, weight: 700, color: C.accent }); txt(ctx, p[2], p[0] + 30, 516, { size: 24, color: '#c4cfd9' });
      });
      ctx.globalAlpha = kB; chip(ctx, 560, 410, 'selected here (illustrative)', { a: sel, size: 22, align: 'center' });
      ctx.restore();
    }
  },
});

// ---------- 6. Completion ----------
SCENES.push({
  id: 'complete', title: 'Completing the well', amb: 'under', part: 0,
  cues: [
    'Completion turns a drilled hole into a producing well: production tubing, packers, a wellhead tree, and perforations through casing and cement into the rock.',
    'Some wells are also stimulated. Acid can clean or improve the rock near the well. Hydraulic fracturing opens fractures, held open by proppant. These are options, not standard steps.',
  ],
  events(s) { return [0, 1, 2].map(i => ({ t: at(s, 0, .62 + i * .06), type: 'bang' })).concat([{ t: at(s, 1, .45), type: 'whoosh' }]); },
  draw(ctx, t, c, s) {
    const gy = 250, X = 700, rt = 640, rb = 830, py = [680, 730, 780];
    sky(ctx, gy); strataFlat(ctx, gy, [[70, '#40342a'], [150, '#2e2822'], [170, '#262b30'], [190, '#5c4a30'], [300, '#20242a']]); speck(ctx, 6, 0, rt, W, rb, 320);
    wellbore(ctx, X, gy, 860, { r: 58 });
    // tubing slides in
    const kt = pr(t, c[0] + .8, 2.2), tb = lerp(gy, 610, kt), fl = lin(t, at(s, 0, .85), 1);
    ctx.fillStyle = '#1d2630'; ctx.fillRect(X - 22, gy - 30, 44, tb - gy + 30); ctx.fillStyle = '#93a4b3'; ctx.fillRect(X - 28, gy - 30, 6, tb - gy + 30); ctx.fillRect(X + 22, gy - 30, 6, tb - gy + 30);
    if (fl > 0) { ctx.globalAlpha = fl; ctx.fillStyle = C.oil; ctx.fillRect(X - 22, gy - 30, 44, tb - gy + 30); ctx.fillStyle = '#7a4d16'; ctx.fillRect(X - 58, 600, 116, 254); ctx.globalAlpha = 1; }
    const kp = lin(t, at(s, 0, .3), .5);
    ctx.globalAlpha = kp; ctx.fillStyle = '#12181e'; ctx.fillRect(X - 58, 570, 30, 34); ctx.fillRect(X + 28, 570, 30, 34); ctx.fillStyle = C.accent; ctx.fillRect(X - 58, 570, 30, 5); ctx.fillRect(X + 28, 570, 30, 5);
    ctx.fillStyle = '#c0563b'; rr(ctx, X - 30, 380, 60, 34, 5); ctx.fill(); ctx.globalAlpha = 1;
    xtree(ctx, X, gy, 1.1); pipe(ctx, [[X + 66, gy - 100], [X + 400, gy - 100]], { w: 12 });
    // perforations
    py.forEach((y, i) => { const tb2 = at(s, 0, .62 + i * .06), k = lin(t, tb2, .25); if (k <= 0) return; for (const sd of [-1, 1]) { ctx.fillStyle = fl > 0 ? C.oil : '#10161c'; ctx.beginPath(); ctx.moveTo(X + sd * 56, y - 11); ctx.lineTo(X + sd * (56 + 150 * k), y); ctx.lineTo(X + sd * 56, y + 11); ctx.closePath(); ctx.fill(); const f = 1 - lin(t, tb2, .45); if (f > 0) { ctx.save(); ctx.globalAlpha = f; ctx.shadowColor = '#ffb040'; ctx.shadowBlur = 40; ctx.fillStyle = '#fff4c8'; ctx.beginPath(); ctx.moveTo(X + sd * 20, y - 14); ctx.lineTo(X + sd * (56 + 180 * k), y); ctx.lineTo(X + sd * 20, y + 14); ctx.closePath(); ctx.fill(); ctx.restore(); } } });
    if (fl > 0) { for (const y of py) for (const sd of [-1, 1]) dots(ctx, [[X + sd * 330, y + (y - 730) * .6], [X + sd * 190, y], [X + sd * 40, y]], t, { color: '#fff3d6', speed: 50, gap: 30, r: 4.5, a: fl }); dots(ctx, [[X, 800], [X, gy - 100], [X + 400, gy - 100]], t, { color: '#fff3d6', speed: 110, gap: 30, r: 5, a: fl }); }
    const L = (ax, ay, tx, ty, str, k, al) => label(ctx, ax, ay, tx, ty, str, { a: win(t, at(s, 0, k), c[1]), align: al });
    L(X - 10, gy - 80, 420, 150, 'Wellhead tree', .1, 'right'); L(X + 26, 480, 1010, 440, 'Production tubing', .22); L(X + 44, 587, 1010, 540, 'Packer: seals the annulus', .34); L(X - 30, 397, 420, 400, 'Downhole safety valve', .44, 'right'); L(X + 150, 730, 1010, 640, 'Perforations', .7); L(X - 61, 500, 420, 520, 'Casing and cement', .16, 'right');
    // optional stimulation
    const a1 = lin(t, c[1] + .3, .8);
    if (a1 > 0) {
      const ka = pr(t, c[1] + 1, 2), kf2 = pr(t, at(s, 1, .45), 3);
      ctx.save(); ctx.globalAlpha = a1 * ka * .5; const g = ctx.createRadialGradient(X, 680, 40, X, 680, 190); g.addColorStop(0, 'rgba(120,255,160,.9)'); g.addColorStop(1, 'rgba(120,255,160,0)'); ctx.fillStyle = g; ctx.fillRect(X - 200, 640, 400, 80); ctx.restore();
      for (const sd of [-1, 1]) { const len = 560 * kf2; ctx.fillStyle = '#f4e3b0'; ctx.globalAlpha = a1; ctx.beginPath(); ctx.moveTo(X + sd * 56, 780 - 9); ctx.quadraticCurveTo(X + sd * (56 + len * .5), 780 - 16, X + sd * (56 + len), 780); ctx.quadraticCurveTo(X + sd * (56 + len * .5), 780 + 16, X + sd * 56, 780 + 9); ctx.closePath(); ctx.fill(); const R = rng(4 + sd); for (let i = 0; i < 40; i++) { const u = R() * kf2; ctx.fillStyle = '#b08a3c'; ctx.beginPath(); ctx.arc(X + sd * (60 + u * 540), 780 + (R() - .5) * 12 * (1 - u), 3, 0, TAU); ctx.fill(); } }
      ctx.globalAlpha = 1;
      chip(ctx, 250, 180, 'OPTIONAL', { a: a1, size: 28, mono: true, color: C.accent, tc: C.accent });
      label(ctx, X - 150, 680, 440, 590, 'Acid treatment\nimproves flow near the well', { a: a1 * lin(t, c[1] + 1.4, .5), align: 'right', color: C.ok });
      label(ctx, X + 380, 780, 1100, 600, 'Hydraulic fracture,\nheld open by proppant', { a: a1 * lin(t, at(s, 1, .55), .5), color: '#f4e3b0' });
    }
  },
});

// ---------- 7. Production, lift, pressure support ----------
SCENES.push({
  id: 'produce', title: 'Production, lift and pressure support', amb: 'field', part: 0,
  cues: [
    'Fluids flow into the well because reservoir pressure is higher than the pressure in the wellbore. A choke at the surface regulates the flow.',
    'Over time, pressure falls, water cut rises and production declines. Reservoir management adapts the strategy.',
    'Artificial lift adds energy to the well: a rod pump, an electrical submersible pump, or gas lift.',
    'Pressure support is a different job. Water or gas is injected through separate wells to maintain pressure and sweep oil toward the producers.',
  ],
  draw(ctx, t, c, s) {
    const gy = 300;
    const kA = 1 - pr(t, c[2] - .5, .9);
    if (kA > 0) {
      ctx.save(); ctx.globalAlpha = kA; const X = 420, rt = 600, rb = 820;
      sky(ctx, gy); strataFlat(ctx, gy, [[70, '#40342a'], [230, '#2a2f35'], [220, '#5c4a30'], [300, '#20242a']]); speck(ctx, 7, 0, rt, 900, rb, 200);
      for (const sd of [-1, 1]) { const g = ctx.createLinearGradient(X + sd * 60, 0, X + sd * 480, 0); g.addColorStop(0, 'rgba(73,182,255,.6)'); g.addColorStop(1, 'rgba(255,110,60,.55)'); ctx.fillStyle = g; ctx.fillRect(sd < 0 ? 0 : X + 60, rt, sd < 0 ? X - 60 : 420, rb - rt); }
      wellbore(ctx, X, gy, rb + 20, { r: 40, tubing: rb - 20, up: 30 });
      for (let i = 0; i < 4; i++) for (const sd of [-1, 1]) { const y = rt + 40 + i * 48; ctx.fillStyle = C.oil; ctx.beginPath(); ctx.moveTo(X + sd * 38, y - 7); ctx.lineTo(X + sd * 110, y); ctx.lineTo(X + sd * 38, y + 7); ctx.fill(); dots(ctx, [[X + sd * 420, y + (i - 1.5) * 30], [X + sd * 110, y], [X + sd * 30, y]], t, { color: '#fff3d6', speed: 55, gap: 34, r: 4.5 }); }
      dots(ctx, [[X, rb - 30], [X, gy - 96], [X + 300, gy - 96]], t, { color: '#fff3d6', speed: 120, gap: 30, r: 5 });
      xtree(ctx, X, gy, 1); pipe(ctx, [[X + 60, gy - 91], [X + 330, gy - 91]], { w: 12 });
      ctx.save(); ctx.translate(X + 190, gy - 91); valve(ctx, 0, 0, 1); ctx.strokeStyle = C.accent; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(0, -30); ctx.stroke(); ctx.save(); ctx.translate(0, -30); ctx.rotate(Math.sin(t * .8) * .8); ctx.beginPath(); ctx.moveTo(-16, 0); ctx.lineTo(16, 0); ctx.stroke(); ctx.restore(); ctx.restore();
      label(ctx, X + 190, gy - 126, X + 300, gy - 160, 'Choke', { a: win(t, at(s, 0, .6), c[2]) }); chip(ctx, 140, rt + 110, 'higher pressure', { a: win(t, c[0] + .8, c[2]), size: 24, color: C.hot }); chip(ctx, X + 60, rt - 30, 'lower pressure', { a: win(t, c[0] + .8, c[2]), size: 24, color: C.cold });
      // decline chart
      const a1 = lin(t, c[1] - .3, .8), px = 960, py = 200, pw = 840, ph = 620, k = lin(t, c[1] + .4, (s.e[1] - c[1]) * .75);
      box(ctx, px, py, pw, ph, { a: a1 * .97, stroke: 'rgba(255,255,255,.18)' });
      ctx.globalAlpha = kA * a1; txt(ctx, 'A WELL OVER ITS LIFE', px + 36, py + 44, { size: 22, mono: true, weight: 700, color: C.dim });
      ctx.strokeStyle = C.dim; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(px + 70, py + 90); ctx.lineTo(px + 70, py + ph - 70); ctx.lineTo(px + pw - 40, py + ph - 70); ctx.stroke(); txt(ctx, 'time', px + pw - 44, py + ph - 40, { size: 22, color: C.dim, align: 'right' });
      const cv = (f, col, dash) => { ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.setLineDash(dash || []); ctx.beginPath(); for (let i = 0; i <= 100 * k; i++) { const u = i / 100, x = px + 70 + u * (pw - 130), y = py + ph - 70 - f(u) * (ph - 190); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); ctx.setLineDash([]); };
      cv(u => .95 * Math.exp(-u * 2.2) * (u < .08 ? u / .08 : 1), C.oil); cv(u => .9 / (1 + Math.exp(-(u - .5) * 9)), C.water); cv(u => .9 - .55 * u, '#c9d3dc', [10, 8]);
      [['oil rate', C.oil, .2], ['water cut', C.water, .55], ['reservoir pressure', '#c9d3dc', .85]].forEach((l, i) => txt(ctx, l[0], px + 110 + i * 240, py + 96, { size: 24, weight: 700, color: l[1], a: lin(k, l[2] * .5, .1) }));
      ctx.restore();
    }
    // artificial lift: three wells
    const kL = win(t, c[2] - .2, c[3] + .2, .7);
    if (kL > 0) {
      ctx.save(); ctx.globalAlpha = kL; sky(ctx, gy); strataFlat(ctx, gy, [[70, '#40342a'], [800, '#252a2f']]);
      [[330, 'Rod pump', 'surface drive, rods, downhole pump'], [960, 'Electrical submersible pump', 'downhole motor, multistage pump'], [1590, 'Gas lift', 'injected gas lightens the column']].forEach((w, i) => {
        const X = w[0], a = lin(t, at(s, 2, .2 + i * .22), .6); ctx.globalAlpha = kL * (.35 + .65 * a);
        wellbore(ctx, X, gy, 800, { r: 44, tubing: 760, fluid: '#7a4d16' });
        if (i === 0) { ctx.save(); ctx.translate(X - 100, gy); ctx.scale(.43, .43); const g = drawPumpjack(ctx, TH(GT), { noWell: true }); ctx.restore(); const g2 = pjGeom(TH(GT)), ry = gy + g2.yc * .43; ctx.fillStyle = C.steelL; ctx.fillRect(X - 3, ry, 6, 620 - ry + pjS(TH(GT)) * -50 + 50); ctx.fillStyle = '#c0cbd5'; rr(ctx, X - 16, 640 - pjS(TH(GT)) * 50, 32, 70, 5); ctx.fill(); }
        else xtree(ctx, X, gy, .8);
        if (i === 1) { for (let k = 0; k < 6; k++) { const y = 480 + k * 34; ctx.fillStyle = '#93a4b3'; rr(ctx, X - 18, y, 36, 28, 5); ctx.fill(); ctx.fillStyle = '#0b1016'; ctx.fillRect(X - 14 + ((t * 60 + k * 9) % 28), y + 10, 5, 8); } ctx.fillStyle = C.hot; rr(ctx, X - 18, 690, 36, 70, 6); ctx.fill(); ctx.strokeStyle = C.accent; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X + 30, gy); ctx.lineTo(X + 30, 700); ctx.lineTo(X + 18, 710); ctx.stroke(); txt(ctx, 'motor', X + 70, 726, { size: 20, color: C.hot }); txt(ctx, 'pump stages', X + 70, 570, { size: 20, color: C.dim }); }
        if (i === 2) { dots(ctx, [[X - 150, gy - 40], [X - 31, gy - 40], [X - 31, 600], [X - 16, 600]], t, { color: C.gas, speed: 80, gap: 26, r: 5 }); const R = rng(5); for (let k = 0; k < 22; k++) { const u = (R() + t * .22) % 1; ctx.fillStyle = C.gas; ctx.beginPath(); ctx.arc(X - 12 + R() * 24, 600 - u * 290, 2 + 5 * u, 0, TAU); ctx.fill(); } txt(ctx, 'lift gas', X - 160, gy - 70, { size: 20, color: C.gas }); }
        dots(ctx, [[X, 740], [X, gy]], t, { color: '#fff3d6', speed: i === 0 ? 50 : 110, gap: 36, r: 4.5, a: .9 });
        txt(ctx, w[1], X, 846, { size: 30, weight: 700, align: 'center' }); txt(ctx, w[2], X, 884, { size: 22, color: C.dim, align: 'center' });
      });
      ctx.restore();
    }
    // injector and producer
    const kI = lin(t, c[3] + .1, .8);
    if (kI > 0) {
      ctx.save(); ctx.globalAlpha = kI; const rt = 520, rb = 760, xi = 380, xp = 1540, adv = lin(t, c[3] + .6, (s.e[3] - c[3]) * .9) * 780;
      sky(ctx, gy); strataFlat(ctx, gy, [[70, '#40342a'], [150, '#2a2f35'], [240, '#5c4a30'], [400, '#20242a']]);
      ctx.save(); ctx.beginPath(); ctx.rect(0, rt, W, rb - rt); ctx.clip(); ctx.fillStyle = 'rgba(233,166,59,.5)'; ctx.fillRect(0, rt, W, rb - rt);
      ctx.fillStyle = 'rgba(74,168,224,.85)'; ctx.beginPath(); ctx.moveTo(xi - 300, rt); for (let y = rt; y <= rb; y += 6) ctx.lineTo(xi + adv * (1 + .28 * Math.sin(y / 23) + .16 * Math.sin(y / 9 + 1)), y); ctx.lineTo(xi - 300, rb); ctx.closePath(); ctx.fill(); speck(ctx, 3, 0, rt, W, rb, 240); ctx.restore();
      wellbore(ctx, xi, gy, rb, { r: 34, tubing: rb - 20, fluid: C.water }); wellbore(ctx, xp, gy, rb, { r: 34, tubing: rb - 20 }); xtree(ctx, xi, gy, .8, { color: C.water }); xtree(ctx, xp, gy, .8);
      dots(ctx, [[xi, gy], [xi, rb - 30]], t, { color: '#dff3ff', speed: 100, gap: 30, r: 4.5 }); dots(ctx, [[xp, rb - 30], [xp, gy]], t, { color: '#fff3d6', speed: 100, gap: 30, r: 4.5 });
      for (let i = 0; i < 3; i++) arrow(ctx, xi + adv + 120, rt + 50 + i * 70, xi + adv + 230, rt + 50 + i * 70, { color: '#fff', w: 5, a: .8 });
      label(ctx, xi, gy - 60, xi + 80, gy - 150, 'Injection well\nwater or gas', { color: C.water }); label(ctx, xp, gy - 60, xp - 80, gy - 150, 'Production well', { align: 'right' });
      label(ctx, xi + adv * .9, rt + 30, xi + adv * .6 + 80, rt - 90, 'Injected water sweeps oil, but not evenly', { a: lin(t, at(s, 3, .45), .5), color: C.water });
      chip(ctx, 960, 850, 'Gas lift works inside a producer.  Gas injection supports the reservoir.', { a: lin(t, at(s, 3, .7), .5), size: 26, align: 'center' });
      ctx.restore();
    }
  },
});
