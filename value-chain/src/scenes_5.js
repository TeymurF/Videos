// Part 3b: conversion, upgrading, blending, utilities and petrochemicals, distribution, accounting and lifecycle, summary.

// atoms joined by bonds; pts = [[x,y],...]
function atoms(ctx, pts, col, r = 11, o = {}) {
  ctx.save(); ctx.globalAlpha *= o.a ?? 1; ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 4;
  ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); if (o.closed) ctx.closePath(); ctx.stroke();
  for (const p of pts) { ctx.fillStyle = p[2] ?? col; ctx.beginPath(); ctx.arc(p[0], p[1], p[3] ?? r, 0, TAU); ctx.fill(); }
  ctx.restore();
}
const zig = (x, y, n, d = 30) => Array.from({ length: n }, (_, i) => [x + i * d, y + (i % 2 ? -d * .34 : d * .34)]);
const mixP = (a, b, k) => a.map((p, i) => [lerp(p[0], b[i][0], k), lerp(p[1], b[i][1], k), p[2], p[3]]);

// ---------- 18. Conversion ----------
SCENES.push({
  id: 'convert', title: 'Conversion: changing the molecules', amb: 'plant', part: 2,
  cues: [
    'Conversion units change the molecules themselves. A fluid catalytic cracker uses hot, circulating catalyst to break heavy molecules into lighter ones.',
    'Coke left on the catalyst is burned off in a regenerator, which reheats the catalyst for another pass.',
    'Hydrocracking does a similar job with hydrogen and a catalyst. Coking turns the heaviest residue into lighter streams and solid petroleum coke.',
  ],
  events(s) { const ev = []; for (let k = 0; 2 + k * 5 < s.c[2]; k++) ev.push({ t: 2 + k * 5 + 2.2, type: 'tick' }); return ev; },
  draw(ctx, t, c, s) {
    // fluid catalytic cracker: riser + reactor, regenerator, catalyst loop
    const rx = 330, gx = 650;
    ctx.fillStyle = '#93a4b3'; ctx.fillRect(rx - 16, 360, 32, 400); ctx.fillStyle = '#3a2c14'; ctx.fillRect(rx - 10, 360, 20, 400);
    tower(ctx, rx, 170, 190, 230, { tint: '#3a2c14', lw: 6 }); tower(ctx, gx, 420, 250, 330, { tint: '#3a1a10', lw: 6, hl: t > c[1] && t < c[2] });
    txt(ctx, 'Reactor', rx - 112, 285, { size: 24, weight: 700, align: 'right' }); txt(ctx, 'Regenerator', gx + 142, 700, { size: 24, weight: 700 }); txt(ctx, 'Riser', rx - 34, 620, { size: 22, color: C.dim, align: 'right' });
    const glow = .5 + .5 * Math.sin(t * 6); ctx.save(); rr(ctx, gx - 125, 420, 250, 330, 125); ctx.clip(); ctx.fillStyle = `rgba(255,110,40,${.25 + .15 * glow})`; ctx.fillRect(gx - 125, 560, 250, 200); for (let i = 0; i < 5; i++) flame(ctx, gx - 80 + i * 40, 740, .8, t + i); ctx.restore();
    const spent = [[rx + 60, 380], [rx + 110, 470], [gx - 110, 560]], regen = [[gx - 60, 740], [gx - 60, 800], [rx, 800], [rx, 760]], up = [[rx, 760], [rx, 380]];
    pipe(ctx, spent, { w: 14 }); pipe(ctx, regen, { w: 14 });
    dots(ctx, up, t, { colors: ['#e9d9b0', C.oil], speed: 170, gap: 20, r: 5 }); dots(ctx, spent, t, { color: '#4a3a2a', speed: 80, gap: 18, r: 5 }); dots(ctx, regen, t, { color: '#f4e7c4', speed: 90, gap: 18, r: 5 });
    const feed = [[90, 720], [rx - 16, 720]], prod = [[rx, 170], [rx, 110], [560, 110]], air = [[gx, 830], [gx, 752]], flue = [[gx, 420], [gx, 360], [820, 360]];
    pipe(ctx, feed, { w: 12 }); pipe(ctx, prod, { w: 12 }); pipe(ctx, flue, { w: 10 }); dots(ctx, feed, t, { color: '#a8703a', speed: 90, gap: 26, r: 6 }); dots(ctx, prod, t, { color: C.ngl, speed: 130, gap: 26, r: 5.5 }); dots(ctx, flue, t, { color: '#9aa6b2', speed: 90, gap: 26, r: 4.5 });
    txt(ctx, 'heavy feed', 90, 686, { size: 22, weight: 600, color: '#d39a5c' }); txt(ctx, 'lighter products, to fractionation', 575, 110, { size: 22, weight: 600, color: C.ngl }); txt(ctx, 'flue gas', 835, 360, { size: 22, color: C.dim }); txt(ctx, 'air', gx, 858, { size: 22, color: C.dim, align: 'center' });
    label(ctx, rx + 90, 440, 480, 250, 'Spent catalyst\ncarries coke', { a: win(t, c[1] + .3, c[2]), color: '#c9a37a' }); label(ctx, gx - 60, 780, 760, 620, 'Regenerated catalyst\nhot and clean', { a: win(t, at(s, 1, .5), c[2]), color: '#f4e7c4' });
    label(ctx, gx + 60, 640, 860, 500, 'Coke burns off', { a: win(t, c[1] + 1, c[2]), color: C.hot });
    // molecular view: a long chain cracks on the catalyst
    const px = 1020, pw = 800; box(ctx, px, 150, pw, 380, { stroke: 'rgba(255,255,255,.18)' }); txt(ctx, 'CRACKING', px + 34, 196, { size: 22, mono: true, weight: 700, color: C.dim });
    const ph = ((t - 2) / 5 + 10) % 1, cx = px + 400, cy = 350, br = ease(clamp((ph - .42) / .3)), inn = ease(clamp(ph / .4));
    ctx.fillStyle = '#6f8091'; ctx.beginPath(); ctx.arc(cx, cy + 64, 46, 0, TAU); ctx.fill(); txt(ctx, 'catalyst', cx, cy + 64, { size: 20, weight: 600, align: 'center', color: '#0b1016' });
    const base = zig(cx - 225, cy - 10, 16, 30).map(p => [p[0] - (1 - inn) * 330, p[1] - (1 - inn) * 60]);
    const fr = [[0, 6, -90, -70], [6, 10, 0, -110], [10, 16, 100, -60]], fa = 1 - clamp((ph - .88) / .1);
    fr.forEach((f, i) => atoms(ctx, base.slice(f[0], f[1]).map(p => [p[0] + f[2] * br, p[1] + f[3] * br]), [C.oil, C.ngl, C.oil][i], 11, { a: fa * lin(ph, .02, .06) }));
    txt(ctx, br > .5 ? 'smaller, lighter molecules' : 'one large, heavy molecule', cx, 498, { size: 24, weight: 600, align: 'center', color: br > .5 ? C.ngl : '#d39a5c' });
    // other conversion routes
    const a2 = lin(t, c[2] + .2, .7);
    [['Hydrocracker', 'hydrogen + catalyst', 'heavy feed → lighter products', '#ff9ad5'], ['Coker', 'heat, no catalyst', 'residue → lighter streams + coke', '#9aa6b2']].forEach((u, i) => {
      const a = a2 * lin(t, at(s, 2, i ? .5 : .08), .5), x = px + i * 410; box(ctx, x, 570, 390, 290, { a, stroke: u[3], lw: 3 }); ctx.globalAlpha = a;
      txt(ctx, u[0], x + 30, 620, { size: 34, weight: 700, color: u[3] }); txt(ctx, u[1], x + 30, 668, { size: 24, color: C.dim }); txt(ctx, u[2], x + 30, 820, { size: 22, color: '#c4cfd9' });
      if (i === 0) { atoms(ctx, zig(x + 40, 740, 5, 28), C.oil, 10); atoms(ctx, zig(x + 220, 740, 4, 28), C.ngl, 10); for (let k = 0; k < 5; k++) { const u2 = (k / 5 + t * .2) % 1; atoms(ctx, [[x + 60 + k * 62, 700 + u2 * 30], [x + 74 + k * 62, 700 + u2 * 30]], '#ff9ad5', 5); } }
      else { ctx.fillStyle = '#1c1c1c'; ctx.beginPath(); ctx.moveTo(x + 220, 780); ctx.lineTo(x + 290, 705); ctx.lineTo(x + 360, 780); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#555'; ctx.lineWidth = 2; ctx.stroke(); atoms(ctx, zig(x + 40, 740, 5, 28), C.ngl, 10); txt(ctx, 'coke', x + 290, 760, { size: 20, weight: 700, align: 'center', color: '#bbb' }); }
      ctx.globalAlpha = 1;
    });
  },
});

// ---------- 19. Treating and upgrading ----------
SCENES.push({
  id: 'upgrade', title: 'Treating and upgrading', amb: 'calc', part: 2,
  cues: [
    'Other units improve quality rather than size. Hydrotreating uses hydrogen and a catalyst to strip out sulfur, which leaves as hydrogen sulfide.',
    'Reforming rearranges naphtha into high-octane components, and makes hydrogen as a by-product. Isomerisation and alkylation build better gasoline components.',
    'Three different jobs: remove contaminants, rearrange molecules, and crack large molecules.',
  ],
  events(s) { return [{ t: at(s, 2, .2), type: 'tick' }, { t: at(s, 2, .5), type: 'tick' }, { t: at(s, 2, .8), type: 'tick' }]; },
  draw(ctx, t, c, s) {
    const H2 = '#ff9ad5', P = [120, 700, 1280], pw = 540, k1 = lin(t, c[1] - .2, .7);
    const head = (i, name, sub, col, a) => { box(ctx, P[i], 160, pw, 560, { a, stroke: col, lw: 3 }); txt(ctx, name, P[i] + 30, 214, { size: 34, weight: 700, color: col, a }); txt(ctx, sub, P[i] + 30, 262, { size: 24, color: C.dim, a }); };
    // hydrotreating: sulfur leaves as H2S
    const a0 = lin(t, .5, .7); head(0, 'Hydrotreating', 'removes sulfur', C.sulfur, a0);
    const ph = ((t - 1) / 5.5 + 10) % 1, go = ease(clamp((ph - .35) / .3)), fa = 1 - clamp((ph - .9) / .08), x0 = P[0] + 90, y0 = 470;
    ctx.globalAlpha = a0 * fa; const ch = zig(x0, y0, 9, 40); atoms(ctx, ch, C.oil, 15);
    const sx = lerp(ch[4][0], P[0] + 430, go), sy = lerp(ch[4][1] - 58, 330, go); if (go < .05) { ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(ch[4][0], ch[4][1]); ctx.lineTo(sx, sy); ctx.stroke(); }
    const hin = ease(clamp(ph / .32)); for (const sd of [-1, 1]) { const hx = lerp(sx + sd * 150, sx + sd * 24, hin), hy = lerp(sy - 110, sy - 18, hin); ctx.fillStyle = H2; ctx.beginPath(); ctx.arc(hx, hy, 9, 0, TAU); ctx.fill(); }
    ctx.fillStyle = C.sulfur; ctx.beginPath(); ctx.arc(sx, sy, 20, 0, TAU); ctx.fill(); txt(ctx, 'S', sx, sy + 1, { size: 22, weight: 700, align: 'center', color: '#0b1016' });
    ctx.globalAlpha = a0; txt(ctx, go > .5 ? 'sulfur leaves as H₂S' : 'hydrogen attacks the sulfur', P[0] + pw / 2, 640, { size: 24, weight: 600, align: 'center', color: go > .5 ? C.sulfur : H2 }); ctx.globalAlpha = 1;
    // reforming: chain -> ring, releases hydrogen; isomerisation: straight -> branched
    head(1, 'Reforming, isomerisation', 'rearrange the molecule', C.cold, k1);
    const p2 = ((t - c[1]) / 5 + 10) % 1, m = ease(clamp((p2 - .2) / .4)), cx = P[1] + 270, cy = 400;
    const lineP = Array.from({ length: 6 }, (_, i) => [cx - 125 + i * 50, cy + (i % 2 ? -14 : 14)]), ringP = Array.from({ length: 6 }, (_, i) => [cx + Math.cos(i / 6 * TAU - Math.PI / 2) * 70, cy + Math.sin(i / 6 * TAU - Math.PI / 2) * 70]);
    ctx.globalAlpha = k1; atoms(ctx, mixP(lineP, ringP, m), C.ngl, 15, { closed: m > .95 });
    for (let i = 0; i < 3; i++) { const u = clamp((p2 - .55) / .4); ctx.globalAlpha = k1 * (u > 0 ? 1 - u : 0); atoms(ctx, [[cx + 110 + u * 90, cy - 60 + i * 60 - u * 30], [cx + 126 + u * 90, cy - 60 + i * 60 - u * 30]], H2, 7); }
    ctx.globalAlpha = k1; txt(ctx, m > .5 ? 'ring: higher octane, plus hydrogen' : 'straight chain: low octane', cx, 520, { size: 24, weight: 600, align: 'center', color: C.ngl });
    const st = zig(P[1] + 60, 630, 6, 40), brn = [st[0], st[1], st[2], st[3], [st[2][0], st[2][1] - 60], [st[1][0] + 10, st[1][1] + 60]].map(p => [p[0] + 190, p[1]]); atoms(ctx, st.slice(0, 4), C.oil, 11); atoms(ctx, [st[3], st[4], st[5]], C.oil, 11);
    arrow(ctx, P[1] + 290, 630, P[1] + 340, 630, { color: '#fff', w: 4 }); const b0 = P[1] + 370; atoms(ctx, [[b0, 640], [b0 + 40, 620], [b0 + 80, 640], [b0 + 120, 620]], C.oil, 11); atoms(ctx, [[b0 + 40, 620], [b0 + 40, 570]], C.oil, 11); atoms(ctx, [[b0 + 80, 640], [b0 + 80, 690]], C.oil, 11);
    ctx.globalAlpha = 1;
    // alkylation: two small molecules join
    const k2 = lin(t, at(s, 1, .55), .7); head(2, 'Alkylation', 'joins small molecules', C.ok, k2);
    const p3 = ((t - c[1]) / 5 + 10.4) % 1, j = ease(clamp((p3 - .2) / .4)), ax = P[2] + 270, ay = 440;
    ctx.globalAlpha = k2; atoms(ctx, zig(ax - 200 + j * 60, ay, 3, 40), C.ok, 15); atoms(ctx, zig(ax + 40 - j * 60, ay, 4, 40).concat([[ax + 80 - j * 60, ay - 76]]).slice(0, 4), C.gas, 15); atoms(ctx, [[ax + 80 - j * 60, ay - 14], [ax + 80 - j * 60, ay - 76]], C.gas, 15);
    if (j > .9) { ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(ax - 60, ay + 14); ctx.lineTo(ax - 20, ay + 14); ctx.stroke(); }
    txt(ctx, j > .9 ? 'one valuable blending component' : 'two light molecules', ax, 600, { size: 24, weight: 600, align: 'center', color: C.ok }); ctx.globalAlpha = 1;
    // three jobs
    const a2 = lin(t, c[2] + .1, .6);
    [['REMOVE', 'contaminants', C.sulfur], ['REARRANGE', 'molecules', C.cold], ['CRACK', 'large molecules', C.hot]].forEach((j2, i) => { const a = a2 * lin(t, at(s, 2, .2 + i * .3), .4), x = 330 + i * 430; box(ctx, x, 760, 400, 110, { a, fill: '#101820', stroke: j2[2], lw: 3 }); txt(ctx, j2[0], x + 30, 800, { size: 34, mono: true, weight: 700, color: j2[2], a }); txt(ctx, j2[1], x + 30, 842, { size: 24, color: '#c4cfd9', a }); });
  },
});

// ---------- 20. Blending and certification ----------
const COMP = [['Reformate', '#f2d06b', .32], ['Alkylate', '#7fe0b0', .2], ['Cracked\nnaphtha', '#e9a63b', .3], ['Isomerate', '#9ad1ff', .12], ['Butane', '#f6edc4', .06]];
SCENES.push({
  id: 'blend', title: 'Blending and certification', amb: 'plant', part: 2,
  cues: [
    'Finished fuels are blended from several components to hit many specifications at once: octane, sulfur, volatility, density and flash point.',
    'Laboratory tests and online analysers check every batch. Only a certified tank is released. Off-spec product is held and corrected.',
  ],
  events(s) { return [0, 1, 2, 3].map(i => ({ t: at(s, 1, .12 + i * .1), type: 'tick' })).concat([{ t: at(s, 1, .55), type: 'ding' }, { t: at(s, 1, .8), type: 'alert' }]); },
  draw(ctx, t, c, s) {
    const hy = 560, fill = pr(t, c[0] + 1.5, (s.e[0] - c[0]) * .8), rel = lin(t, at(s, 1, .58), .6);
    pipe(ctx, [[150, hy], [1010, hy]], { w: 18 });
    COMP.forEach((cp, i) => { const x = 200 + i * 180, a = lin(t, .5 + i * .35, .5); ctx.globalAlpha = a; tank(ctx, x - 60, 200, 120, 150, .75 - fill * .3, { fluid: cp[1] }); pipe(ctx, [[x, 350], [x, hy]], { w: 9 }); valve(ctx, x, 440, 1, { vert: true }); ctx.globalAlpha = 1; dots(ctx, [[x, 350], [x, hy]], t, { color: cp[1], speed: 60 + cp[2] * 160, gap: 26, r: 5, a }); txt(ctx, cp[0], x, cp[0].includes('\n') ? 138 : 150, { size: 22, weight: 600, align: 'center', a, lh: 1.15 }); ctx.globalAlpha = a; ctx.fillStyle = '#1b2733'; rr(ctx, x + 34, 470, 12, 70, 6); ctx.fill(); ctx.fillStyle = cp[1]; rr(ctx, x + 34, 470 + 70 * (1 - cp[2] * 2.6), 12, 70 * cp[2] * 2.6, 6); ctx.fill(); ctx.globalAlpha = 1; });
    dots(ctx, [[150, hy], [1010, hy]], t, { colors: COMP.map(x => x[1]), speed: 110, gap: 22, r: 6 });
    txt(ctx, 'blend header', 150, hy + 44, { size: 22, color: C.dim }); txt(ctx, 'recipe', 150, 505, { size: 20, color: C.dim, align: 'right' });
    // product tank
    tank(ctx, 1010, 400, 300, 380, .1 + .68 * fill, { fluid: '#e7b54a', hl: rel > 0 }); txt(ctx, 'Gasoline batch', 1160, 820, { size: 26, weight: 700, align: 'center' });
    // specification checks
    const a0 = lin(t, at(s, 0, .4), .6); box(ctx, 1400, 170, 430, 420, { a: a0, stroke: 'rgba(255,255,255,.2)' }); txt(ctx, 'SPECIFICATIONS', 1432, 214, { size: 22, mono: true, weight: 700, color: C.dim, a: a0 });
    ['Octane', 'Sulfur', 'Volatility', 'Density', 'Flash point'].forEach((sp2, i) => { const a = a0 * lin(t, at(s, 0, .45 + i * .08), .4), ok = lin(t, at(s, 1, .12 + i * .1), .3), y = 268 + i * 62; txt(ctx, sp2, 1432, y, { size: 30, weight: 600, a }); ctx.globalAlpha = a * ok; ctx.strokeStyle = C.ok; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(1756, y); ctx.lineTo(1770, y + 14); ctx.lineTo(1796, y - 14); ctx.stroke(); ctx.globalAlpha = 1; });
    dataLine(ctx, [[1310, 480], [1396, 480]], t, { a: lin(t, c[1] + .2, .5) }); txt(ctx, 'lab + online analysers', 1400, 620, { size: 22, color: C.data, a: lin(t, c[1] + .2, .5) });
    // certified release
    const ks = lin(t, at(s, 1, .55), .25); ctx.save(); ctx.globalAlpha = ks; ctx.translate(1160, 560); ctx.rotate(-.14); ctx.scale(2 - ks, 2 - ks); ctx.fillStyle = 'rgba(11,16,22,.85)'; rr(ctx, -130, -34, 260, 68, 10); ctx.fill(); ctx.strokeStyle = C.ok; ctx.lineWidth = 5; ctx.stroke(); txt(ctx, 'CERTIFIED', 0, 2, { size: 38, mono: true, weight: 700, color: C.ok, align: 'center' }); ctx.restore();
    const out = [[1310, 740], [1560, 740]]; pipe(ctx, out, { w: 16 }); dots(ctx, out, t, { color: '#e7b54a', speed: 110, gap: 26, r: 6, a: rel }); valve(ctx, 1380, 740, rel); truck(ctx, 1680, 800, .8, '#e7b54a'); txt(ctx, rel > .5 ? 'released' : 'held until certified', 1470, 700, { size: 22, weight: 600, color: rel > .5 ? C.ok : C.dim, align: 'center' });
    // off-spec batch
    const ao = lin(t, at(s, 1, .78), .6); ctx.globalAlpha = ao; tank(ctx, 520, 650, 170, 190, .6, { fluid: '#8a6a3a' }); ctx.strokeStyle = C.bad; ctx.lineWidth = 5; ctx.strokeRect(520, 650, 170, 190); ctx.globalAlpha = 1;
    chip(ctx, 605, 745, 'OFF-SPEC: HOLD', { a: ao, size: 24, mono: true, align: 'center', color: C.bad, tc: C.bad }); backArrow(ctx, [[520, 720], [380, 720], [380, hy + 16]], t, { a: ao, color: C.bad, w: 4 }); txt(ctx, 'corrected and re-blended', 230, 760, { size: 22, color: C.bad, a: ao });
  },
});

// ---------- 21. Utilities and petrochemicals ----------
SCENES.push({
  id: 'utilities', title: 'Utilities and petrochemicals', amb: 'plant', part: 2,
  cues: [
    'Behind the process units run the utilities: steam, power, cooling water, fuel gas and hydrogen, along with wastewater treatment and sulfur recovery.',
    'The flare is a safety system for upsets and relief. It is not the routine destination for gas.',
    { t: 'And not every molecule becomes fuel. Ethane, LPG and naphtha feed steam crackers that make ethylene and propylene: the building blocks of plastics, fibres and packaging.', say: 'And not every molecule becomes fuel. Ethane, L P G and naphtha feed steam crackers that make ethylene and propylene: the building blocks of plastics, fibres and packaging.' },
    'Refineries also yield lubricants, waxes, bitumen and petroleum coke.',
  ],
  events(s) { return [0, 1, 2, 3, 4].map(i => ({ t: at(s, 0, .15 + i * .1), type: 'tick' })).concat([{ t: s.c[1] + .5, type: 'whoosh' }, { t: at(s, 3, .2), type: 'tick' }]); },
  draw(ctx, t, c, s) {
    const kA = 1 - pr(t, c[2] - .5, .9);
    if (kA > 0) {
      ctx.save(); ctx.globalAlpha = kA; const gy = 500;
      sky(ctx, gy); ctx.fillStyle = '#1b2026'; ctx.fillRect(0, gy, W, H - gy); ctx.fillStyle = '#39434d'; ctx.fillRect(0, gy, W, 8);
      // refinery skyline
      tower(ctx, 300, 170, 80, 330, { trays: 9, hot: true }); tower(ctx, 440, 250, 60, 250, { trays: 6, tint: '#2a323a' }); furnace(ctx, 540, gy, 130, 130, t); tower(ctx, 800, 210, 70, 290, { trays: 8, tint: '#1f2a34' }); tank(ctx, 900, 380, 140, 120, .6); sphereTank(ctx, 1150, gy, 62); tower(ctx, 1300, 290, 56, 210, { trays: 5, tint: '#2a323a' }); vessel(ctx, 1010, 300, 0, 0, { a: 0 });
      // flare stack
      const fl = t > c[1] ? 1 + 2.2 * Math.sin(Math.PI * clamp((t - c[1] - .6) / 2.4)) ** 2 : .5;
      ctx.fillStyle = '#93a4b3'; ctx.fillRect(1634, 150, 12, gy - 150); flame(ctx, 1640, 150, fl * (t > c[1] ? .7 : .5), t);
      label(ctx, 1640, 250, 1380, 190, 'Flare: relief and upsets only', { a: win(t, c[1] + .3, c[2]), align: 'right', color: C.hot });
      // utility networks under the units
      const U = [['Steam', '#e9eef3'], ['Electric power', C.accent], ['Cooling water', C.water], ['Fuel gas', C.gas], ['Hydrogen', '#ff9ad5']];
      U.forEach((u, i) => { const a = lin(t, at(s, 0, .15 + i * .1), .5), y = gy + 60 + i * 62; ctx.globalAlpha = kA * a; pipe(ctx, [[260, y], [1500, y]], { w: 8, color: u[1], edge: '#0b1016' }); ctx.globalAlpha = kA; dots(ctx, [[260, y], [1500, y]], t + i, { color: '#fff', speed: 90 + i * 12, gap: 60, r: 4, a: a * .9 }); txt(ctx, u[0], 240, y, { size: 24, weight: 700, color: u[1], align: 'right', a }); for (const tx of [300, 440, 605, 800, 1300]) { ctx.globalAlpha = kA * a * .7; ctx.fillStyle = u[1]; ctx.fillRect(tx - 2 + i * 7 - 14, gy + 8, 3, y - gy - 8); } ctx.globalAlpha = kA; });
      chip(ctx, 1690, gy + 110, 'wastewater treatment', { a: lin(t, at(s, 0, .7), .5), size: 24, align: 'center', color: C.water }); chip(ctx, 1690, gy + 180, 'sulfur recovery', { a: lin(t, at(s, 0, .82), .5), size: 24, align: 'center', color: C.sulfur });
      ctx.restore();
    }
    const kB = pr(t, c[2] - .2, .9);
    if (kB > 0) {
      ctx.save(); ctx.globalAlpha = kB; const y = 380, LC = '#c9a0ff';
      ['Ethane', 'LPG', 'Naphtha'].forEach((f, i) => { const a = lin(t, at(s, 2, .12 + i * .07), .4); chip(ctx, 130, y - 80 + i * 80, f, { a, size: 28, color: C.ngl, tc: C.ngl }); pipe(ctx, [[300, y - 80 + i * 80], [380, y - 80 + i * 80], [420, y]], { w: 6, a }); });
      const kf2 = lin(t, at(s, 2, .32), .5); ctx.globalAlpha = kB * kf2; furnace(ctx, 420, y + 90, 190, 190, t); txt(ctx, 'Steam cracker', 515, y + 130, { size: 26, weight: 700, align: 'center' }); ctx.globalAlpha = kB;
      // olefins
      const ko = lin(t, at(s, 2, .45), .5); arrow(ctx, 630, y, 720, y, { color: '#fff', w: 5, a: ko });
      ctx.globalAlpha = kB * ko; atoms(ctx, [[780, y - 60], [840, y - 60]], LC, 16); ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(780, y - 70); ctx.lineTo(840, y - 70); ctx.stroke(); txt(ctx, 'Ethylene', 870, y - 60, { size: 28, weight: 700, color: LC });
      atoms(ctx, [[780, y + 50], [840, y + 30], [900, y + 50]], LC, 16); txt(ctx, 'Propylene', 930, y + 44, { size: 28, weight: 700, color: LC }); ctx.globalAlpha = kB;
      // polymer chain grows
      const kp = lin(t, at(s, 2, .58), .5), n = Math.floor(3 + lin(t, at(s, 2, .6), (s.e[2] - c[2]) * .35) * 13); arrow(ctx, 1100, y, 1180, y, { color: '#fff', w: 5, a: kp });
      ctx.globalAlpha = kB * kp; atoms(ctx, zig(1220, y, n, 36), LC, 13); txt(ctx, 'polymer: thousands of units long', 1220, y + 70, { size: 24, color: C.dim }); ctx.globalAlpha = kB;
      ['plastics', 'fibres', 'packaging'].forEach((p, i) => { const a = lin(t, at(s, 2, .78 + i * .06), .4); ctx.globalAlpha = kB * a; if (i === 0) icon(ctx, 'bottle', 1270, 590, 1.2, LC); if (i === 1) { ctx.strokeStyle = LC; ctx.lineWidth = 5; for (let k = 0; k < 5; k++) { ctx.beginPath(); for (let q = 0; q <= 20; q++) { const px = 1440 + q * 4, py = 560 + k * 14 + 6 * Math.sin(q * .6 + k); q ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke(); } } if (i === 2) { ctx.fillStyle = LC; rr(ctx, 1640, 556, 80, 70, 8); ctx.fill(); ctx.fillStyle = '#0b1016'; ctx.fillRect(1640, 584, 80, 6); ctx.fillRect(1676, 556, 6, 70); } ctx.globalAlpha = kB; txt(ctx, p, 1270 + i * 210, 670, { size: 26, weight: 700, align: 'center', a }); });
      chip(ctx, 540, 590, 'petrochemicals: a separate manufacturing chain', { a: lin(t, at(s, 2, .5), .5), size: 24, align: 'center', color: LC });
      // other non-fuel products
      const a3 = lin(t, c[3] + .1, .6); txt(ctx, 'OTHER NON-FUEL PRODUCTS', 130, 760, { size: 22, mono: true, weight: 700, color: C.dim, a: a3 });
      ['Lubricating oils', 'Waxes', 'Bitumen', 'Petroleum coke'].forEach((p, i) => chip(ctx, 130 + i * 420, 830, p, { a: a3 * lin(t, at(s, 3, .15 + i * .15), .4), size: 32, color: ['#f2d06b', '#f6edc4', '#8a8f96', '#9aa6b2'][i] }));
      ctx.restore();
    }
  },
});

// ---------- 22. Distribution ----------
SCENES.push({
  id: 'deliver', title: 'Delivering to customers', amb: 'field', part: 2,
  cues: [
    'Finished products fan out by pipeline, ship, rail and truck to terminals. Road fuels reach service stations, and jet fuel reaches airports.',
    'Gas reaches power plants and industry, or passes through pressure reduction into city networks, where an odorant is added for safety.',
  ],
  events(s) { return [0, 1, 2].map(i => ({ t: at(s, 0, .4 + i * .15), type: 'tick' })).concat([0, 1, 2].map(i => ({ t: at(s, 1, .15 + i * .25), type: 'tick' }))); },
  draw(ctx, t, c, s) {
    const hub = [330, 330], dest = [[1380, 190, 'station', 'Service stations', '#e7b54a'], [1380, 330, 'plane', 'Airports', '#9ad1ff'], [1380, 470, 'factory', 'Industry and chemicals', '#c9a0ff']];
    // liquids
    ctx.globalAlpha = lin(t, .4, .6); tank(ctx, hub[0] - 150, hub[1] - 70, 110, 140, .7, { fluid: '#e7b54a' }); tank(ctx, hub[0] - 20, hub[1] - 70, 110, 140, .55, { fluid: '#9ad1ff' }); ctx.globalAlpha = 1; txt(ctx, 'Product terminal', hub[0] - 20, hub[1] + 106, { size: 26, weight: 700, align: 'center', a: lin(t, .4, .6) });
    dest.forEach((d, i) => {
      const a = lin(t, at(s, 0, .4 + i * .15), .5), p = [[hub[0] + 100, hub[1]], [700, hub[1]], [900, d[1]], [d[0] - 90, d[1]]]; if (a <= 0) return;
      ctx.globalAlpha = a; ctx.strokeStyle = '#2a3642'; ctx.lineWidth = i === 0 ? 22 : 10; ctx.lineJoin = 'round'; ctx.beginPath(); p.forEach((q, k) => k ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.stroke();
      const L = polyLen(p), u = ((t * (i === 0 ? .1 : .13) + i * .3) % 1), q = polyAt(p, L, u * L[3]);
      if (i === 0) truck(ctx, q[0], q[1] + 16, .55, d[4]); else if (i === 2) { railcar(ctx, q[0], q[1] + 14, .55); } else dots(ctx, p, t, { color: d[4], speed: 130, gap: 30, r: 5, a });
      ctx.fillStyle = '#16212c'; ctx.beginPath(); ctx.arc(d[0], d[1], 62, 0, TAU); ctx.fill(); ctx.strokeStyle = d[4]; ctx.lineWidth = 4; ctx.stroke(); icon(ctx, d[2], d[0], d[1], 1, d[4]);
      ctx.globalAlpha = 1; txt(ctx, d[3], d[0] + 84, d[1], { size: 28, weight: 700, a });
      txt(ctx, ['truck', 'pipeline', 'rail'][i], 800, lerp(hub[1], d[1], .5) - 26, { size: 20, color: C.dim, align: 'center', a });
    });
    // gas
    const a1 = lin(t, c[1] - .2, .7), gyy = 720, gd = [[1380, 640, 'power', 'Power generation'], [1380, 790, 'house', 'Homes and businesses']];
    ctx.globalAlpha = a1; ctx.fillStyle = '#93a4b3'; ctx.fillRect(120, gyy - 14, 420, 28); ctx.fillStyle = C.gas; ctx.fillRect(120, gyy - 8, 420, 16); ctx.globalAlpha = 1; dots(ctx, [[120, gyy], [540, gyy]], t, { color: '#eafff4', speed: 150, gap: 40, r: 5, a: a1 }); txt(ctx, 'Gas transmission', 330, gyy + 50, { size: 26, weight: 700, align: 'center', a: a1 });
    gd.forEach((d, i) => {
      const a = a1 * lin(t, at(s, 1, .15 + i * .25), .5), p = [[540, gyy], [760, gyy], [900, d[1]], [d[0] - 90, d[1]]]; ctx.globalAlpha = a; ctx.strokeStyle = '#2f5a4a'; ctx.lineWidth = i ? 7 : 12; ctx.lineJoin = 'round'; ctx.beginPath(); p.forEach((q, k) => k ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.stroke(); ctx.globalAlpha = 1; dots(ctx, p, t, { color: C.gas, speed: i ? 70 : 140, gap: 30, r: i ? 4 : 5.5, a });
      ctx.globalAlpha = a; ctx.fillStyle = '#16212c'; ctx.beginPath(); ctx.arc(d[0], d[1], 62, 0, TAU); ctx.fill(); ctx.strokeStyle = C.gas; ctx.lineWidth = 4; ctx.stroke(); icon(ctx, d[2], d[0], d[1], 1, C.gas); ctx.globalAlpha = 1; txt(ctx, d[3], d[0] + 84, d[1], { size: 28, weight: 700, a });
    });
    const a2 = a1 * lin(t, at(s, 1, .45), .5); ctx.globalAlpha = a2; ctx.fillStyle = '#16212c'; rr(ctx, 1010, 750, 130, 80, 10); ctx.fill(); ctx.strokeStyle = C.accent; ctx.lineWidth = 3; ctx.stroke(); valve(ctx, 1075, 790, 1); ctx.globalAlpha = 1;
    label(ctx, 1075, 830, 1000, 880, 'Pressure reduction', { a: a2, align: 'right' }); const a3 = a1 * lin(t, at(s, 1, .7), .5); ctx.globalAlpha = a3; icon(ctx, 'drop', 1210, 740, .5, C.accent); ctx.globalAlpha = 1; label(ctx, 1210, 760, 1190, 880, 'Odorant added', { a: a3, align: 'left' });
  },
});

// ---------- 23. Accounting, feedback, lifecycle ----------
SCENES.push({
  id: 'account', title: 'Accounting, feedback and the field lifecycle', amb: 'calc', part: 2,
  cues: [
    'Across the whole chain, every stage balances what comes in against products, inventories, internal use and losses. Volumes can change. Mass is conserved.',
    'Information also flows backwards. Market demand shapes refinery plans, and pipeline limits can hold back production at the wells.',
    'And when a field reaches the end of its life, the wells are permanently plugged, the equipment is removed, and the site is restored.',
  ],
  events(s) { return [0, 1, 2].map(i => ({ t: at(s, 0, .3 + i * .15), type: 'ding' })).concat([{ t: s.c[1] + .4, type: 'whoosh' }, { t: at(s, 2, .3), type: 'tick' }, { t: at(s, 2, .5), type: 'tick' }]); },
  draw(ctx, t, c, s) {
    const kA = 1 - pr(t, c[2] - .5, .9);
    if (kA > 0) {
      ctx.save(); ctx.globalAlpha = kA; ribbon(ctx, GT, { y: 260, h: 280 });
      RIB.forEach((p, i) => { const a = lin(t, at(s, 0, .3 + i * .15), .4), x = 110 + i * 570; box(ctx, x + 40, 560, 480, 76, { a, fill: '#101820', stroke: C.ok, lw: 3 }); txt(ctx, 'in = out + stock change  ✓', x + 280, 600, { size: 26, mono: true, weight: 700, align: 'center', color: C.ok, a }); });
      [['Mass', 'conserved', C.ok], ['Volume', 'changes with density, pressure, phase', C.accent], ['Energy', 'accounted for, including fuel use', C.hot]].forEach((r, i) => { const a = lin(t, at(s, 0, .7 + i * .08), .4), x = 150 + i * 570; txt(ctx, r[0], x, 720, { size: 34, weight: 700, color: r[2], a }); txt(ctx, r[1], x, 766, { size: 22, color: '#c4cfd9', a }); });
      // feedback: information moving against the flow
      const a1 = lin(t, c[1] + .2, .7);
      if (a1 > 0) { dataLine(ctx, [[1790, 220], [140, 220]], t, { a: a1, k: lin(t, c[1] + .4, 2.4), w: 6 }); txt(ctx, 'market demand', 1790, 180, { size: 26, weight: 700, color: C.data, align: 'right', a: a1 }); txt(ctx, 'plans and limits reach the wells', 140, 180, { size: 26, weight: 700, color: C.data, a: a1 * lin(t, at(s, 1, .55), .5) }); chip(ctx, 960, 180, 'information flows backwards', { a: a1, size: 24, align: 'center', color: C.data, tc: C.data }); }
      ctx.restore();
    }
    const kB = pr(t, c[2] - .2, .9);
    if (kB > 0) {
      ctx.save(); ctx.globalAlpha = kB; const gy = 420, X = 960, rm = pr(t, at(s, 2, .5), 2), grn = pr(t, at(s, 2, .72), 2);
      sky(ctx, gy); strataFlat(ctx, gy, [[70, '#40342a'], [200, '#2e2822'], [300, '#262b30']]); ctx.fillStyle = '#5c4a30'; ctx.fillRect(0, 760, W, 90); speck(ctx, 8, 0, 760, W, 850, 200);
      wellbore(ctx, X, gy, 850, { r: 34 });
      [[780, 830], [560, 640], [gy + 6, gy + 80]].forEach((pl, i) => { const k = lin(t, at(s, 2, .12 + i * .13), .5); ctx.globalAlpha = kB * k; ctx.fillStyle = '#b9bfc5'; ctx.fillRect(X - 34, pl[0], 68, pl[1] - pl[0]); ctx.fillStyle = '#8d9499'; for (let q = 0; q < 5; q++) ctx.fillRect(X - 30 + q * 14, pl[0] + 6, 6, 6); });
      ctx.globalAlpha = kB * (1 - rm); ctx.save(); ctx.translate(X - 233 * .6, gy); ctx.scale(.6, .6); drawPumpjack(ctx, 2.2, { flowLen: 200 }); ctx.restore();
      ctx.globalAlpha = kB * grn; ctx.fillStyle = '#3f7a48'; ctx.fillRect(0, gy - 4, W, 14); const R = rng(4); for (let i = 0; i < 60; i++) { const x = R() * W; ctx.fillRect(x, gy - 4 - 10 * R() * grn, 3, 12); }
      ctx.globalAlpha = kB; label(ctx, X + 34, 800, X + 220, 720, 'Cement plugs isolate the reservoir', { a: lin(t, at(s, 2, .15), .5) }); label(ctx, X + 34, gy + 40, X + 220, gy + 130, 'Surface plug', { a: lin(t, at(s, 2, .4), .5) });
      // lifecycle strip
      const st = ['Explore', 'Appraise', 'Develop', 'Produce', 'Decommission']; st.forEach((n, i) => { const x = 240 + i * 360, on = i === 4; ctx.fillStyle = on ? C.accent : '#3a4652'; ctx.beginPath(); ctx.arc(x, 180, on ? 16 : 11, 0, TAU); ctx.fill(); if (i < 4) { ctx.fillStyle = '#3a4652'; ctx.fillRect(x + 20, 178, 320, 4); } txt(ctx, n, x, 224, { size: 24, weight: on ? 700 : 500, align: 'center', color: on ? C.accent : C.dim }); });
      chip(ctx, 400, 560, 'site restored and monitored', { a: grn, size: 28, align: 'center', color: C.ok, tc: C.ok });
      ctx.restore();
    }
  },
});

// ---------- 24. Summary ----------
SCENES.push({
  id: 'outro', title: 'The whole chain', amb: 'calc', part: 2, extra: 6.5, drift: .04,
  cues: [
    'Upstream discovers and produces hydrocarbons. Midstream connects production with processing facilities and markets. Downstream transforms and delivers useful products.',
    'Together they form one interconnected system of wells, facilities, transport networks, measurements and decisions, linking the reservoir to the final consumer.',
  ],
  events(s) { return [0, 1, 2].map(i => ({ t: at(s, 0, .02 + i * .33), type: 'tick' })).concat([{ t: s.e[1] + .9, type: 'whoosh' }]); },
  draw(ctx, t, c, s) {
    const hl = t < c[1] ? Math.min(2, Math.floor(lin(t, c[0], s.e[0] - c[0]) * 3)) : null;
    ribbon(ctx, GT, { y: 330, h: 320, hl });
    ['wells', 'facilities', 'transport networks', 'measurements', 'decisions'].forEach((w, i) => chip(ctx, 250 + i * 355, 760, w, { a: lin(t, at(s, 1, .15 + i * .1), .4), size: 28, align: 'center' }));
    txt(ctx, 'reservoir', 110, 250, { size: 28, weight: 700, color: C.up, a: lin(t, c[1], .6) }); txt(ctx, 'final consumer', 1810, 250, { size: 28, weight: 700, color: C.down, align: 'right', a: lin(t, at(s, 1, .7), .6) });
    const aE = pr(t, s.e[1] + .9, 1.5);
    if (aE > 0) {
      ctx.globalAlpha = aE * .92; ctx.fillStyle = C.bg; ctx.fillRect(-50, -50, W + 100, H + 100); ctx.globalAlpha = aE;
      txt(ctx, 'From the reservoir\nto the final consumer', 960, 400, { size: 96, weight: 700, align: 'center', lh: 1.15 });
      ctx.fillStyle = C.accent; ctx.fillRect(915, 600, 90, 5);
      let x = 590; PARTS.forEach(p => { x += chip(ctx, x, 680, p[0], { size: 28, mono: true, color: p[1], tc: p[1] }) + 20; });
      txt(ctx, 'Schematic overview · not every facility uses every process', 960, 770, { size: 26, color: C.dim, align: 'center' });
      ctx.globalAlpha = 1;
    }
  },
});
