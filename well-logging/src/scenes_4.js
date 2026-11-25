// Scenes: neutron-density together, borehole images, interpretation, outro.

// ---------- 12. Neutron + density ----------
const NV = { y0: 232, y1: 892, d0: 2398, d1: 2512 };
function bandHL(ctx, x0, x1, v, d0, d1, col, a) {
  if (a <= .01) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.fillStyle = col.length === 7 ? col + '22' : col;
  rr(ctx, x0 - 6, Y(v, d0), x1 - x0 + 12, Y(v, d1) - Y(v, d0), 8); ctx.fill(); ctx.stroke(); ctx.restore();
}
function miniPattern(ctx, x, y, w, h, kind, a) {
  if (a <= .01) return;
  ctx.save(); ctx.globalAlpha *= a;
  box(ctx, x, y, w, h, { r: 12, fill: '#0d1319', stroke: '#2e3c4b', lw: 2 });
  const [pd, pn, title, sub, col] = { water: [.40, .40, 'Water sand', 'curves overlay', C.water], gas: [.22, .58, 'Gas sand', 'crossover', '#ffd166'], shale: [.58, .14, 'Shale', 'wide separation', '#c9c2a8'] }[kind];
  const X = f => x + 20 + f * (w - 40);
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  for (let yy = y + 10; yy < y + h - 10; yy += 3) {
    const xd = X(pd + vnoise(yy * .05, 3) * .03), xn = X(pn + vnoise(yy * .05, 7) * .03);
    if (kind === 'gas') { ctx.fillStyle = 'rgba(255,209,102,.5)'; ctx.fillRect(xd, yy, xn - xd, 3); }
    if (kind === 'shale') { ctx.fillStyle = 'rgba(150,150,140,.3)'; ctx.fillRect(xn, yy, xd - xn, 3); }
  }
  for (const [f, colr, dash, s] of [[pd, C.rhob, [], 3], [pn, C.nphi, [10, 6], 7]]) {
    ctx.strokeStyle = colr; ctx.lineWidth = 3.5; ctx.setLineDash(dash); ctx.beginPath();
    for (let yy = y + 10; yy < y + h - 10; yy += 3) ctx.lineTo(X(f + vnoise(yy * .05, s) * .03), yy);
    ctx.stroke(); ctx.setLineDash([]);
  }
  ctx.restore();
  txt(ctx, title, x + w / 2, y - 28, { size: 26, weight: 700, align: 'center' });
  txt(ctx, sub, x + w / 2, y + h + 30, { size: 22, weight: 600, align: 'center', color: col });
  ctx.restore();
}
SCENES.push({
  id: 'nd', title: 'Neutron and density together', amb: 'lab',
  cues: [
    'Neutron and density share compatible scales, so in clean water-filled sandstone the two curves lie on top of each other.',
    'In gas, density porosity rises and neutron porosity falls. The curves cross over, one of the clearest gas signs on a log.',
    'In shale the neutron swings left of the density. Together they give porosity, lithology and fluid type.',
  ],
  events(s) { return [1, 2].map(i => ({ t: s.c[i] + .3, type: 'ding' })); },
  draw(ctx, t, c, s) {
    const tr = { x: 520, w: 390 }, a1 = lin(t, c[1] - .2, .8), a2 = lin(t, c[2] - .2, .8);
    drawFormation(ctx, 60, 400, NV, { labels: 1, labelX: 74 });
    drawDepthTrack(ctx, 420, 80, NV);
    drawTrack(ctx, { ...tr, curves: [cv('RHOB'), cv('NPHI')], cross: true, crossA: a1, shaleSep: a2 }, NV, 2398);
    bandHL(ctx, 60, tr.x + tr.w, NV, 2447, 2462, C.water, cueA(t, s, 0));
    bandHL(ctx, 60, tr.x + tr.w, NV, 2418, 2432, '#ffd166', cueA(t, s, 1));
    bandHL(ctx, 60, tr.x + tr.w, NV, 2462, 2477, '#c9c2a8', cueA(t, s, 2));
    // right panel: compatible scales + the three patterns
    const px = 980, pw = 890;
    panel(ctx, px, 140, pw, 752, 'SANDSTONE-COMPATIBLE SCALES');
    const sx = px + 70, sw = pw - 140, sy = 230;
    [[CV.RHOB, 'Density  g/cm³', [1.9, 2.15, 2.4, 2.65, 2.9]], [CV.NPHI, 'Neutron  porosity', [.45, .3, .15, 0, -.15]]].forEach(([c0, n, ticks], i) => {
      const yy = sy + i * 96;
      txt(ctx, n, sx, yy - 24, { size: 19, mono: true, weight: 700, color: c0.color });
      ctx.fillStyle = c0.color; rr(ctx, sx, yy - 4, sw, 8, 4); ctx.fill();
      for (const v of ticks) { const xx = sx + cPos(c0, v) * sw; ctx.fillRect(xx - 1.5, yy - 12, 3, 24); txt(ctx, fmtS(v), xx, yy + 30, { size: 17, mono: true, color: '#d7dde3', align: 'center' }); }
    });
    const xz = sx + cPos(CV.RHOB, 2.65) * sw;
    ctx.strokeStyle = C.accent; ctx.setLineDash([6, 6]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(xz, sy - 14); ctx.lineTo(xz, sy + 110); ctx.stroke(); ctx.setLineDash([]);
    chip(ctx, xz - 14, sy + 150, 'quartz 2.65 g/cm³ = 0 porosity', { align: 'right', size: 18 });
    [['water', 0], ['gas', 1], ['shale', 2]].forEach(([k, i]) => miniPattern(ctx, px + 50 + i * 285, 480, 240, 300, k, lin(t, c[i] + .2, .6)));
  },
});

// ---------- 13. Borehole images ----------
const IV = { y0: 210, y1: 880, d0: 2410, d1: 2438 };
const IMG = { x: 1060, w: 800, dip: .9, az: 2.2, fz: 2427, fa: 4.2, faz: 4.0 };
const IMGC = (() => {
  const w = IMG.w, h = IV.y1 - IV.y0, c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'), im = g.createImageData(w, h), R = rng(31);
  const pal = [[0, [24, 11, 2]], [.3, [92, 46, 9]], [.55, [176, 98, 28]], [.78, [228, 164, 62]], [1, [255, 240, 186]]];
  const col = v => { v = clamp(v); for (let i = 1; i < pal.length; i++) if (v <= pal[i][0]) { const k = (v - pal[i - 1][0]) / (pal[i][0] - pal[i - 1][0]); return pal[i - 1][1].map((a, j) => a + (pal[i][1][j] - a) * k); } return pal[4][1]; };
  const vugs = []; for (let i = 0; i < 26; i++) vugs.push([R() * w, 2420 + R() * 16, 3 + R() * 6]);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const th = x / w * TAU, z = IV.d0 + y / h * (IV.d1 - IV.d0), zp = z - IMG.dip * Math.cos(th - IMG.az);
    const r = Math.log10(logAt('RD', zp)), sand = clamp((r - .6) / 1.0);
    const zc = z - .35 * Math.cos(th - IMG.az - 1.2), set = Math.floor(zc / 1.7) % 2;
    let v = .12 + .5 * sand + .17 * Math.sin((set ? zc : zp) / .3 * TAU + Math.sin(th * 3) * .3) * (sand > .5 ? 1 : .45) + .07 * Math.sin(zp / .08 * TAU) + .08 * vnoise(zp * 2.2 + th * .3, 4) + (R() - .5) * .09;
    const zf = IMG.fz + IMG.fa * Math.cos(th - IMG.faz); if (Math.abs(z - zf) < .11) v = .02;
    for (const [vx, vz, vr] of vugs) if (Math.hypot(x - vx, (z - vz) * 24) < vr) v = .08;
    const [rr_, gg, bb] = col(v), i = (y * w + x) * 4; im.data[i] = rr_; im.data[i + 1] = gg; im.data[i + 2] = bb; im.data[i + 3] = 255;
  }
  g.putImageData(im, 0, 0); return c;
})();
const sineY = (z0, A, az, th) => Y(IV, z0 + A * Math.cos(th - az));
function drawFMITool(ctx, cx, y, hw) {
  ctx.strokeStyle = '#9fb0c0'; ctx.lineWidth = 5;
  for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(cx, y - 120); ctx.lineTo(cx + sd * (hw - 16), y - 50); ctx.lineTo(cx + sd * (hw - 16), y + 50); ctx.lineTo(cx, y + 120); ctx.stroke(); }
  drawSonde(ctx, cx, y, { w: 30, up: 300, down: 260, cable: IV.y0 - 30 });
  for (const sd of [-1, 1]) { ctx.fillStyle = '#c9d3dc'; rr(ctx, cx + sd * (hw - 8) - 7, y - 55, 14, 110, 4); ctx.fill(); }
  ctx.fillStyle = '#c9d3dc'; rr(ctx, cx - 34, y - 55, 68, 110, 8); ctx.fill();
  ctx.fillStyle = '#4d5965'; for (let r = 0; r < 12; r++) for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(cx - 22 + k * 15, y - 46 + r * 8.2, 2.6, 0, TAU); ctx.fill(); }
}
SCENES.push({
  id: 'images', title: 'Borehole images', amb: 'lab',
  cues: [
    'Image logs map the wall itself. An imager presses eight pads, with nearly two hundred tiny electrodes, against the rock.',
    'Each electrode is one pixel. Unrolled around the hole, the readings form a picture: conductive rock dark, resistive rock bright.',
    'A plane cutting the hole shows as a sine wave. Its height gives the dip, its low point the direction. Geologists read bedding, fractures and faults.',
  ],
  draw(ctx, t, c, s) {
    const d = toolDepth(t, s, { from: c[0] + .5, to: c[2] - .3, d1: 2437.5, d0: 2410.5 }), hx = 270, hw = 120;
    drawFormation(ctx, 60, 480, IV);
    drawBorehole(ctx, hx, IV, { hw: 104, cake: false });
    ctx.save(); ctx.beginPath(); ctx.rect(60, IV.y0 - 40, 420, IV.y1 - IV.y0 + 40); ctx.clip(); drawFMITool(ctx, hx, Y(IV, d), hw); ctx.restore();
    label(ctx, hx + 30, Y(IV, d) - 30, hx + 80, Y(IV, d) - 170, 'Pads with button\nelectrodes', { size: 21, a: cueA(t, s, 0) });
    // cylinder concept
    const cx = 760, cr = 120, cy0 = 300, cy1 = 800, A = 90, az = IMG.az;
    ctx.save(); ctx.globalAlpha = .95;
    const g = ctx.createLinearGradient(cx - cr, 0, cx + cr, 0); g.addColorStop(0, '#3a3129'); g.addColorStop(.5, '#7a6648'); g.addColorStop(1, '#3a3129');
    ctx.fillStyle = g; ctx.fillRect(cx - cr, cy0, cr * 2, cy1 - cy0);
    ctx.fillStyle = '#4a3f33'; ctx.beginPath(); ctx.ellipse(cx, cy0, cr, 26, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = '#9fb0c0'; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(cx, cy1, cr, 26, 0, 0, Math.PI); ctx.stroke();
    // dipping plane intersection: front solid, back dashed
    const ptsF = [], ptsB = [];
    for (let i = 0; i <= 120; i++) { const th = i / 120 * TAU, x = cx + cr * Math.sin(th), y = 550 + A * Math.cos(th - az) + 26 * Math.cos(th); (Math.cos(th) > 0 ? ptsF : ptsB).push([x, y, th]); }
    ctx.strokeStyle = C.accent; ctx.lineWidth = 4;
    ctx.setLineDash([6, 6]); ctx.beginPath(); ptsB.forEach(p => ctx.lineTo(p[0], p[1])); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); let prev = null; for (const p of ptsF.sort((a, b) => a[0] - b[0])) { if (prev && Math.abs(p[0] - prev[0]) > 30) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); prev = p; } ctx.stroke();
    ['N', 'E', 'S', 'W'].forEach((n, i) => { const th = i * Math.PI / 2; txt(ctx, n, cx + (cr + 22) * Math.sin(th), cy0 + 34 * Math.cos(th), { size: 20, mono: true, weight: 700, align: 'center', color: '#d7dde3' }); });
    ctx.restore();
    txt(ctx, 'the borehole wall', cx, cy1 + 60, { size: 21, weight: 600, align: 'center', color: C.dim });
    arrow(ctx, cx + cr + 20, 550, IMG.x - 16, 550, { color: C.accent, w: 4, a: lin(t, c[1] - .2, .6) });
    txt(ctx, 'unroll', (cx + cr + IMG.x) / 2, 525, { size: 20, weight: 700, align: 'center', color: C.accent, a: lin(t, c[1] - .2, .6) });
    // image log
    const ix = IMG.x, iw = IMG.w;
    ['N', 'E', 'S', 'W', 'N'].forEach((n, i) => txt(ctx, `${n} ${i * 90}°`, ix + i * iw / 4, IV.y0 - 22, { size: 17, mono: true, weight: 700, align: i === 0 ? 'left' : i === 4 ? 'right' : 'center', color: C.dim }));
    ctx.fillStyle = '#0d1319'; ctx.fillRect(ix, IV.y0, iw, IV.y1 - IV.y0);
    const yTop = Y(IV, d);
    ctx.save(); ctx.beginPath();
    for (let p = 0; p < 8; p++) ctx.rect(ix + (p + .06) * iw / 8, Math.max(IV.y0, yTop), iw / 8 * .8, IV.y1 - Math.max(IV.y0, yTop));
    ctx.clip(); ctx.drawImage(IMGC, ix, IV.y0); ctx.restore();
    ctx.strokeStyle = '#2e3c4b'; ctx.lineWidth = 2; ctx.strokeRect(ix, IV.y0, iw, IV.y1 - IV.y0);
    if (yTop > IV.y0 + 2) { ctx.strokeStyle = 'rgba(255,209,102,.6)'; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.moveTo(ix, yTop); ctx.lineTo(ix + iw, yTop); ctx.stroke(); ctx.setLineDash([]); }
    chip(ctx, ix + 10, IV.y1 - 30, '8 pads · ~80 % of the wall · gaps between pads', { size: 17, color: '#d7dde3', a: cueA(t, s, 1) });
    // interpretation overlay
    const a3 = lin(t, c[2] - .2, .6);
    if (a3 > 0) {
      ctx.save(); ctx.globalAlpha = a3;
      for (const [z0, A2, az2, col] of [[2418, IMG.dip, IMG.az, C.accent], [IMG.fz, IMG.fa, IMG.faz, '#6cc4ff']]) {
        ctx.strokeStyle = col; ctx.lineWidth = 3.5; ctx.beginPath();
        for (let i = 0; i <= 200; i++) { const th = i / 200 * TAU; ctx.lineTo(ix + i / 200 * iw, sineY(z0, A2, az2, th)); } ctx.stroke();
      }
      const yLow = sineY(2418, IMG.dip, IMG.az, IMG.az), yHigh = sineY(2418, IMG.dip, IMG.az, IMG.az + Math.PI), xLow = ix + IMG.az / TAU * iw;
      arrow(ctx, ix + 40, yHigh, ix + 40, yLow, { color: C.accent, w: 3, head: 12 });
      chip(ctx, ix + 60, (yHigh + yLow) / 2 - 64, 'height → dip angle', { size: 18 });
      glowDot(ctx, xLow, yLow, 8, C.accent);
      chip(ctx, xLow + 14, yLow + 34, 'low point → dip direction', { size: 18 });
      chip(ctx, ix + iw - 10, sineY(IMG.fz, IMG.fa, IMG.faz, IMG.faz + Math.PI) + 30, 'steep fracture · conductive', { size: 18, align: 'right', color: '#6cc4ff' });
      chip(ctx, ix + iw - 10, IV.y1 - 30, 'ultrasonic imagers: same idea with sound', { size: 17, align: 'right', color: '#d7dde3' });
      ctx.restore();
    }
  },
});

// ---------- 14. Putting it together ----------
const TV = { y0: 262, y1: 892, d0: 2398, d1: 2512 };
SCENES.push({
  id: 'together', title: 'Putting it together', amb: 'lab',
  cues: [
    'Read together, the logs tell the story. Low gamma ray marks the reservoir. High deep resistivity means hydrocarbons, low resistivity means water.',
    { t: 'Neutron–density crossover flags the gas, the resistivity drop marks the oil–water contact, and Archie\'s equation turns it into saturation.', say: 'Neutron density crossover flags the gas, the resistivity drop marks the oil water contact, and Archie\'s equation turns it into saturation.' },
    'Geologists then map the pay zone, estimate oil and gas in place, choose where to perforate, and correlate with nearby wells.',
  ],
  events(s) { return [{ t: s.c[1] + .5, type: 'ding' }, { t: s.c[2] + .5, type: 'ding' }]; },
  draw(ctx, t, c, s) {
    const L = suiteLayout(0), v = TV, x0 = L.t1.x, x1 = L.t4.x + L.t4.w;
    drawSuite(ctx, L, v, 2398, {});
    const a0 = cueA(t, s, 0, .5) + 0, k0 = lin(t, c[0], .6) * (1 - lin(t, c[1] - .3, .6));
    bandHL(ctx, L.t1.x, L.t1.x + L.t1.w, v, 2418, 2462, C.gr, k0 * lin(t, at(s, 0, .3), .5));
    bandHL(ctx, L.t2.x, L.t2.x + L.t2.w, v, 2418, 2447, C.rd, k0 * lin(t, at(s, 0, .55), .5));
    bandHL(ctx, L.t2.x, L.t2.x + L.t2.w, v, 2447, 2462, C.water, k0 * lin(t, at(s, 0, .8), .5));
    const k1 = lin(t, c[1] - .2, .6);
    bandHL(ctx, L.t3.x, L.t3.x + L.t3.w, v, 2418, 2432, '#ffd166', k1 * (1 - lin(t, c[2] - .3, .6)));
    for (const [dd, n, col] of [[2432, 'GOC', '#cfeee0'], [2447, 'OWC', C.water]]) {
      if (k1 <= 0) continue;
      ctx.save(); ctx.globalAlpha = k1; ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.setLineDash([12, 8]);
      ctx.beginPath(); ctx.moveTo(L.fx0, Y(v, dd)); ctx.lineTo(x1, Y(v, dd)); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
      chip(ctx, x1 + 14, Y(v, dd), n, { size: 18, color: col, a: k1 });
    }
    // zone interpretation on the right
    const zones = [[2408, 'Shale · seal', '#c9c2a8'], [2425, 'Gas', '#cfeee0'], [2439.5, 'Oil', C.oil], [2454.5, 'Water', C.water], [2469.5, 'Shale', '#c9c2a8']];
    zones.forEach(([dd, n, col], i) => chip(ctx, x1 + 110, Y(v, dd), n, { size: 20, color: col, a: lin(t, at(s, 0, .2 + i * .12), .5) }));
    // Archie results
    const a1 = lin(t, at(s, 1, .55), .6);
    if (a1 > 0) {
      ctx.save(); ctx.globalAlpha = a1;
      const bx = 1520, by = 694, bw = 380;
      box(ctx, bx, by, bw, 196, { r: 14, fill: 'rgba(9,13,18,.94)', stroke: C.accent, lw: 1.5 });
      txt(ctx, 'ARCHIE · Rw = 0.043 Ω·m', bx + 18, by + 26, { size: 16, mono: true, weight: 700, color: C.accent });
      txt(ctx, 'zone       φ      Sw', bx + 18, by + 58, { size: 19, mono: true, weight: 700, color: C.dim });
      [['gas', '24 %', '11 %', '#cfeee0'], ['oil', '21 %', '16 %', C.oil], ['water', '21 %', '100 %', C.water]].forEach(([z, p, sw, col], i) => txt(ctx, `${z.padEnd(9)}${p.padStart(5)}  ${sw.padStart(6)}`, bx + 18, by + 92 + i * 30, { size: 21, mono: true, weight: 700, color: col }));
      txt(ctx, 'hydrocarbons where Sw is low', bx + 18, by + 178, { size: 18, color: C.dim });
      ctx.restore();
    }
    // pay zone and perforations
    const a2 = lin(t, c[2] - .2, .6);
    if (a2 > 0) {
      ctx.save(); ctx.globalAlpha = a2;
      const xb = L.fx0 - 18;
      ctx.strokeStyle = C.accent; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(xb + 10, Y(v, 2418)); ctx.lineTo(xb, Y(v, 2418)); ctx.lineTo(xb, Y(v, 2447)); ctx.lineTo(xb + 10, Y(v, 2447)); ctx.stroke();
      ctx.save(); ctx.translate(xb - 14, (Y(v, 2418) + Y(v, 2447)) / 2); ctx.rotate(-Math.PI / 2); txt(ctx, 'PAY · 29 m', 0, 0, { size: 18, mono: true, weight: 700, align: 'center', color: C.accent }); ctx.restore();
      const cxh = (L.fx0 + L.fx1) / 2;
      for (let i = 0; i < 6; i++) { const yy = Y(v, 2435 + i * 1.8), sd = i % 2 ? 1 : -1; ctx.fillStyle = '#1a140e'; ctx.beginPath(); ctx.moveTo(cxh + sd * 10, yy - 3); ctx.lineTo(cxh + sd * 58, yy); ctx.lineTo(cxh + sd * 10, yy + 3); ctx.fill(); glowDot(ctx, cxh + sd * 40, yy, 3, C.oil); }
      chip(ctx, x1 + 190, Y(v, 2439.5), '← perforate here', { size: 18, color: C.accent });
      ctx.restore();
    }
  },
});

// ---------- Outro ----------
SCENES.push({
  id: 'outro', amb: 'lab', lead: 1.2, extra: 3.2,
  cues: ['Each tool reads one property of the rock. Together, they turn a narrow hole in the ground into a detailed picture of the reservoir.'],
  draw(ctx, t, c, s) {
    drawSuite(ctx, suiteLayout(190), SV, 2398, { a: .22 });
    ctx.fillStyle = 'rgba(11,16,22,.55)'; ctx.fillRect(0, 0, W, H);
    txt(ctx, 'Well logging in one picture', 960, 170, { size: 54, weight: 700, align: 'center', a: pr(t, .2, .8) });
    const tiles = [['Gamma ray', 'lithology · shale · correlation', C.gr], ['SP', 'permeable beds · Rw', C.sp], ['Resistivity', 'fluids · water saturation', C.rd], ['Sonic', 'porosity · rock mechanics', C.dt], ['Density', 'porosity · lithology', C.rhob], ['Neutron', 'porosity · gas', C.nphi], ['Images', 'dip · fractures · texture', C.accent]];
    tiles.forEach(([n, d2, col], i) => {
      const row = i < 4 ? 0 : 1, k = row ? i - 4 : i, n2 = row ? 3 : 4, x = 960 + (k - (n2 - 1) / 2) * 420 - 190, y = 260 + row * 190, a = pr(t, .6 + i * .25, .5);
      ctx.save(); ctx.globalAlpha = a; ctx.translate(0, (1 - a) * 16);
      box(ctx, x, y, 380, 150, { r: 16, fill: 'rgba(18,26,35,.95)', stroke: col, lw: 2 });
      ctx.fillStyle = col; ctx.fillRect(x, y + 20, 6, 110);
      txt(ctx, n, x + 30, y + 52, { size: 34, weight: 700, color: col });
      txt(ctx, d2, x + 30, y + 104, { size: 22, weight: 500, color: '#d7dde3' });
      ctx.restore();
    });
    txt(ctx, 'Based on H. Liu, Principles and Applications of Well Logging (Springer, 2017)', 960, 690, { size: 22, align: 'center', color: C.dim, a: pr(t, 3, 1) });
  },
});
