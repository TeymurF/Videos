// Scenes: title, what logging is, when it is done, why we log, the invaded zone, the log display.

function drawSkyBand(ctx, y0, y1) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, '#0a1220'); g.addColorStop(.55, '#1b2a40'); g.addColorStop(.86, '#5a4a5c'); g.addColorStop(1, '#d98a55');
  ctx.fillStyle = g; ctx.fillRect(0, y0, W, y1 - y0);
  const sg = ctx.createRadialGradient(240, y1 - 10, 10, 240, y1 - 10, 380); sg.addColorStop(0, 'rgba(255,214,150,.85)'); sg.addColorStop(.14, 'rgba(255,170,90,.45)'); sg.addColorStop(1, 'rgba(255,150,80,0)');
  ctx.fillStyle = sg; ctx.fillRect(0, y0, 700, y1 - y0);
  ctx.fillStyle = '#2c2a3a'; ctx.beginPath(); ctx.moveTo(0, y1);
  for (let x = 0; x <= W; x += 60) ctx.lineTo(x, y1 - 30 - 22 * Math.sin(x / 310) - 14 * Math.sin(x / 123 + 1));
  ctx.lineTo(W, y1); ctx.fill();
}
// generic strata above the column (overburden), with a depth break
function drawOverburden(ctx, x0, x1, y0, y1) {
  const cols = ['#4b3f33', '#3d352d', '#463a2f', '#352f29', '#3f382f'], n = cols.length;
  for (let i = 0; i < n; i++) { ctx.fillStyle = cols[i]; ctx.fillRect(x0, y0 + (y1 - y0) * i / n, x1 - x0, (y1 - y0) / n + 1); }
  ctx.fillStyle = 'rgba(0,0,0,.25)'; for (let i = 1; i < n; i++) ctx.fillRect(x0, y0 + (y1 - y0) * i / n, x1 - x0, 2);
}
function depthBreak(ctx, x0, x1, y, label) {
  ctx.fillStyle = C.bg; ctx.beginPath(); ctx.moveTo(x0, y - 8);
  for (let x = x0; x <= x1; x += 24) ctx.lineTo(x, y - 8 + ((x / 24) % 2 ? 6 : -6));
  for (let x = x1; x >= x0; x -= 24) ctx.lineTo(x, y + 8 + ((x / 24) % 2 ? 6 : -6));
  ctx.fill();
  if (label) chip(ctx, x1 - 20, y, label, { align: 'right', size: 18, mono: true, color: '#9fb0c0' });
}

// ---------- Title ----------
SCENES.push({
  id: 'title', amb: 'lab', lead: 1.4, extra: .4,
  cues: ['Drilling tells us where the rock is, not what it holds. Well logging looks inside. Here is what it is, when it is done, and how each tool works.'],
  draw(ctx, t, c, s) {
    const v = { y0: 0, y1: H, d0: 2402, d1: 2508 }, d = lerp(2506, 2440, clamp(t / s.dur));
    drawFormation(ctx, 0, W, v);
    drawBorehole(ctx, 560, v, { hw: 40 });
    drawSonde(ctx, 560, Y(v, d), { w: 30, up: 150, down: 90, cable: -10, parts: [{ dy: -110, h: 14, color: C.gr, glow: 12 }, { dy: 0, h: 16, color: C.accent, glow: 16 }, { dy: 50, h: 10, color: C.rd, glow: 10 }] });
    const tv = { y0: 0, y1: H, d0: 2402, d1: 2508 };
    drawTrack(ctx, { x: 1280, w: 240, curves: [cv('GR')], fillGR: true }, tv, d, { header: false, pen: true });
    drawTrack(ctx, { x: 1540, w: 240, grid: 'log', curves: [cv('RD'), cv('RS')] }, tv, d, { header: false, pen: true });
    ctx.fillStyle = 'rgba(11,16,22,.7)'; ctx.fillRect(0, 0, W, H);
    const g = ctx.createLinearGradient(0, 0, W * .62, 0); g.addColorStop(0, 'rgba(11,16,22,.9)'); g.addColorStop(1, 'rgba(11,16,22,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const a = pr(t, .3, 1.2); ctx.save(); ctx.globalAlpha = a; ctx.translate(0, (1 - a) * 24);
    txt(ctx, 'FORMATION EVALUATION · OPEN HOLE · WIRELINE', 140, 330, { size: 26, mono: true, weight: 700, color: C.accent });
    txt(ctx, 'Well Logging', 132, 450, { size: 150, weight: 700 });
    ctx.globalAlpha = a * pr(t, 1.2, 1); ctx.fillStyle = C.accent; ctx.fillRect(140, 560, 90, 5);
    txt(ctx, 'How tools read the rock from inside the borehole', 140, 625, { size: 44, weight: 400, color: '#c4cfd9' });
    ['Gamma ray', 'SP', 'Resistivity', 'Sonic', 'Density', 'Neutron', 'Images'].forEach((k, i) => chip(ctx, 140 + [0, 175, 260, 425, 548, 682, 828][i], 720, k, { size: 22, a: pr(t, 2 + i * .18, .5), color: [C.gr, C.sp, C.rd, C.dt, C.rhob, C.nphi, C.accent][i] }));
    ctx.restore();
  },
});

// ---------- 1. What is well logging ----------
const WL = { gy: 380, hx: 900, v: { y0: 500, y1: 892, d0: 2398, d1: 2512 } };
function drawTruck(ctx, x, y, o = {}) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = '#c9d3dc'; rr(ctx, 0, -120, 300, 100, 8); ctx.fill();
  ctx.fillStyle = '#e04f3a'; ctx.fillRect(0, -64, 300, 10);
  ctx.fillStyle = '#9fb0c0'; rr(ctx, -96, -92, 100, 72, 10); ctx.fill();
  ctx.fillStyle = '#1b2a40'; rr(ctx, -84, -84, 56, 30, 4); ctx.fill();
  ctx.fillStyle = '#2b333c'; ctx.fillRect(-100, -24, 410, 10);
  for (const wx of [-56, 150, 250]) { ctx.fillStyle = '#14181c'; ctx.beginPath(); ctx.arc(wx, -10, 22, 0, TAU); ctx.fill(); ctx.fillStyle = '#6b7783'; ctx.beginPath(); ctx.arc(wx, -10, 9, 0, TAU); ctx.fill(); }
  // window with screen glow
  ctx.fillStyle = '#0f1a26'; rr(ctx, 30, -108, 120, 40, 4); ctx.fill();
  ctx.strokeStyle = C.gr; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i < 24; i++) ctx.lineTo(36 + i * 4.6, -88 + Math.sin(i * .9 + (o.T || 0) * 2) * 8); ctx.stroke();
  // drum
  ctx.fillStyle = '#3a4450'; ctx.beginPath(); ctx.arc(268, -86, 26, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#7d8c99'; ctx.lineWidth = 3; for (let i = 0; i < 4; i++) { const a = (o.T || 0) * 1.4 + i * TAU / 4; ctx.beginPath(); ctx.moveTo(268, -86); ctx.lineTo(268 + Math.cos(a) * 22, -86 + Math.sin(a) * 22); ctx.stroke(); }
  ctx.restore();
}
function drawMast(ctx, x, gy, top) {
  ctx.strokeStyle = '#8b9aa9'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - 70, gy); ctx.lineTo(x - 6, top + 20); ctx.moveTo(x + 70, gy); ctx.lineTo(x + 6, top + 20); ctx.stroke();
  ctx.lineWidth = 3; for (let i = 1; i < 5; i++) { const k = i / 5, y = lerp(gy, top + 20, k), hw = lerp(70, 6, k); ctx.beginPath(); ctx.moveTo(x - hw, y); ctx.lineTo(x + hw, y); ctx.stroke(); }
  ctx.fillStyle = '#39434d'; ctx.fillRect(x - 90, gy - 10, 180, 10);
}
SCENES.push({
  id: 'what', title: 'What is well logging?', amb: 'rig',
  cues: [
    'Well logging is the continuous recording of rock and fluid properties along a borehole. Every value is plotted against depth, and that record is the log.',
    'A tool called a sonde hangs on an armoured cable. A logging unit at the surface powers it, tracks its depth and records the data.',
    'The first log was run in France in 1927 by the Schlumberger brothers. They called it electrical coring.',
  ],
  draw(ctx, t, c, s) {
    const { gy, hx, v } = WL, d = toolDepth(t, s, { from: c[0] - .5, to: s.dur - 1, d1: 2508, d0: 2410 });
    drawSkyBand(ctx, 0, gy);
    ctx.fillStyle = '#3a3027'; ctx.fillRect(0, gy, W, 8);
    drawOverburden(ctx, 0, 1140, gy + 8, v.y0 - 10);
    drawFormation(ctx, 0, 1140, v, { labels: pr(t, 1, .8), labelX: 30 });
    depthBreak(ctx, 0, 1140, v.y0 - 8); chip(ctx, 950, v.y0 - 8, '≈ 2.4 km deep', { size: 18, mono: true, color: '#9fb0c0' });
    // hole through overburden + column
    ctx.fillStyle = '#2a241f'; ctx.fillRect(hx - 30, gy, 60, v.y0 - gy - 16);
    drawBorehole(ctx, hx, v, { hw: 30 });
    const ty = Y(v, d);
    // cable: drum -> sheave -> hole
    const sheave = [hx, 150], drum = [168 + 268, gy - 86];
    ctx.strokeStyle = '#d5dde4'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(drum[0], drum[1]); ctx.lineTo(sheave[0] - 22, sheave[1] - 4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hx, sheave[1]); ctx.lineTo(hx, v.y0 - 18); ctx.stroke();
    drawMast(ctx, hx, gy, 130);
    ctx.fillStyle = '#5d6b78'; ctx.beginPath(); ctx.arc(sheave[0], sheave[1], 24, 0, TAU); ctx.fill(); ctx.fillStyle = '#1c2228'; ctx.beginPath(); ctx.arc(sheave[0], sheave[1], 7, 0, TAU); ctx.fill();
    drawTruck(ctx, 168, gy, { T: t });
    drawSonde(ctx, hx, ty, { w: 24, up: 120, down: 60, cable: v.y0 - 20, parts: [{ dy: -80, h: 12, color: C.gr, glow: 10 }, { dy: -20, h: 12, color: C.rd, glow: 10 }, { dy: 30, h: 12, color: C.rhob, glow: 10 }], joints: [-50, 10] });
    chev(ctx, hx + 46, ty - 40, ty - 150, t, { a: .8, color: C.accent, speed: 70 });
    // callouts (cue 2)
    const a1 = cueA(t, s, 1);
    label(ctx, 300, gy - 120, 330, 210, 'Logging unit\npowers, depths, records', { a: a1 });
    label(ctx, hx, 260, hx + 60, 230, 'Armoured cable\n"wireline"', { a: a1 * lin(t, at(s, 1, .25), .5) });
    label(ctx, hx - 14, ty - 20, hx - 90, ty - 70, 'Sonde\nthe measuring tool', { a: a1 * lin(t, at(s, 1, .1), .5) });
    // recording screen
    const px = 1180, py = 140, pw = 690, ph = 752;
    panel(ctx, px, py, pw, ph, 'LOGGING UNIT · RECORDING');
    txt(ctx, 'DEPTH', px + 30, py + 82, { size: 18, mono: true, weight: 700, color: C.dim });
    txt(ctx, d.toFixed(1) + ' m', px + 30, py + 122, { size: 46, mono: true, weight: 700 });
    txt(ctx, 'LOGGING SPEED', px + 380, py + 82, { size: 18, mono: true, weight: 700, color: C.dim });
    txt(ctx, '9 m/min  ↑', px + 380, py + 122, { size: 46, mono: true, weight: 700, color: C.accent });
    const rv = { y0: py + 260, y1: py + ph - 24, d0: 2398, d1: 2512 };
    drawDepthTrack(ctx, px + 24, 74, rv);
    drawTrack(ctx, { x: px + 104, w: 270, curves: [cv('GR')], fillGR: true }, rv, d, { pen: true });
    drawTrack(ctx, { x: px + 390, w: 276, grid: 'log', curves: [cv('RD')] }, rv, d, { pen: true });
    // 1927 card
    const a2 = cueA(t, s, 2);
    if (a2 > 0) {
      ctx.save(); ctx.globalAlpha = a2;
      box(ctx, 90, 120, 700, 200, { r: 16, fill: 'rgba(32,26,18,.94)', stroke: '#c9a46a', lw: 2 });
      txt(ctx, '1927', 124, 180, { size: 64, weight: 700, color: '#f0d39a' });
      txt(ctx, 'Pechelbronn, France', 300, 166, { size: 30, weight: 600, color: '#f0e6d2' });
      txt(ctx, 'Conrad & Marcel Schlumberger', 300, 204, { size: 24, weight: 500, color: '#cdbb9a' });
      txt(ctx, 'first well log: "electrical coring"', 124, 278, { size: 26, weight: 500, color: '#e9d8b8' });
      ctx.restore();
    }
  },
});

// ---------- 2. When logging is done ----------
function lwdPanel(ctx, x, w, v, t, active) {
  const cx = x + w / 2, bitD = lerp(2470, 2492, clamp(t / 24)), by = Y(v, bitD);
  drawFormation(ctx, x, x + w, v);
  ctx.save(); ctx.beginPath(); ctx.rect(x, v.y0, w, by - v.y0); ctx.clip(); drawBorehole(ctx, cx, v, { hw: 34 }); ctx.restore();
  // drill pipe
  const g = ctx.createLinearGradient(cx - 16, 0, cx + 16, 0); g.addColorStop(0, '#4f5b67'); g.addColorStop(.4, '#cfd8e0'); g.addColorStop(1, '#4f5b67');
  ctx.fillStyle = g; ctx.fillRect(cx - 14, v.y0, 28, by - v.y0 - 70);
  ctx.fillStyle = 'rgba(0,0,0,.3)'; for (let yy = v.y0 + 60; yy < by - 80; yy += 90) ctx.fillRect(cx - 16, yy, 32, 8);
  // LWD collar with sensors
  ctx.fillStyle = g; rr(ctx, cx - 20, by - 190, 40, 140, 6); ctx.fill();
  [[C.gr, -170], [C.rd, -140], [C.rhob, -110], [C.nphi, -82]].forEach(([col, dy], i) => { ctx.save(); ctx.fillStyle = col; ctx.globalAlpha = .6 + .4 * Math.sin(t * 4 + i); ctx.shadowColor = col; ctx.shadowBlur = 14; ctx.fillRect(cx - 21, by + dy, 42, 10); ctx.restore(); });
  // bit
  ctx.save(); ctx.translate(cx, by - 30);
  ctx.fillStyle = '#7d8c99'; ctx.beginPath(); ctx.moveTo(-22, -22); ctx.lineTo(22, -22); ctx.lineTo(30, 6); ctx.quadraticCurveTo(0, 34, -30, 6); ctx.closePath(); ctx.fill();
  for (let i = 0; i < 6; i++) { const ph = ((t * 3 + i / 6) % 1) * TAU, xx = Math.sin(ph) * 24; if (Math.cos(ph) < 0) continue; ctx.fillStyle = '#e6edf2'; ctx.beginPath(); ctx.arc(xx, 10 + Math.abs(xx) * -.2, 4, 0, TAU); ctx.fill(); }
  ctx.restore();
  chev(ctx, cx, v.y0 + 20, by - 220, t, { a: .7 * active, color: '#9fd6ff', speed: 80 });
  // mud-pulse telemetry rings going up
  for (let i = 0; i < 3; i++) { const k = ((t * .5 + i / 3) % 1), yy = lerp(by - 200, v.y0 + 10, k); ctx.strokeStyle = `rgba(255,209,102,${(1 - k) * .8 * active})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(cx, yy, 24, 7, 0, 0, TAU); ctx.stroke(); }
}
function wirelinePanel(ctx, x, w, v, t) {
  const cx = x + w / 2, d = lerp(2505, 2430, clamp(t / 26));
  drawFormation(ctx, x, x + w, v); drawBorehole(ctx, cx, v, { hw: 34 });
  drawSonde(ctx, cx, Y(v, d), { w: 24, up: 120, down: 60, cable: v.y0, parts: [{ dy: -80, h: 12, color: C.gr, glow: 10 }, { dy: -20, h: 12, color: C.rd, glow: 10 }, { dy: 30, h: 12, color: C.rhob, glow: 10 }] });
}
function casedPanel(ctx, x, w, v, t) {
  const cx = x + w / 2, hw = 34, d = lerp(2470, 2420, (Math.sin(t * .25) + 1) / 2);
  drawFormation(ctx, x, x + w, v);
  ctx.fillStyle = '#8d9499'; ctx.fillRect(cx - hw - 4, v.y0, (hw + 4) * 2, v.y1 - v.y0);
  ctx.fillStyle = 'rgba(0,0,0,.18)'; for (let yy = v.y0; yy < v.y1; yy += 14) ctx.fillRect(cx - hw - 4, yy, (hw + 4) * 2, 2);
  ctx.fillStyle = '#b9c3cc'; ctx.fillRect(cx - 24, v.y0, 48, v.y1 - v.y0);
  ctx.fillStyle = '#2a2f35'; ctx.fillRect(cx - 19, v.y0, 38, v.y1 - v.y0);
  // perforations in the oil sand
  for (let i = 0; i < 6; i++) { const yy = Y(v, 2434 + i * 2.2), sd = i % 2 ? 1 : -1; ctx.fillStyle = '#1a140e'; ctx.beginPath(); ctx.moveTo(cx + sd * 20, yy - 5); ctx.lineTo(cx + sd * 120, yy); ctx.lineTo(cx + sd * 20, yy + 5); ctx.fill(); dots(ctx, [[cx + sd * 110, yy], [cx + sd * 24, yy]], t, { a: .9, color: C.oil, gap: 28, speed: 50, r: 3.5 }); }
  chev(ctx, cx, Y(v, 2447), v.y0 + 20, t, { a: .7, color: C.oil, speed: 70 });
  drawSonde(ctx, cx, Y(v, d), { w: 18, up: 110, down: 50, cable: v.y0, parts: [{ dy: -60, h: 10, color: C.accent, glow: 10 }, { dy: 20, h: 10, color: C.sp, glow: 10 }] });
  // spinner
  ctx.save(); ctx.translate(cx, Y(v, d) + 64); ctx.strokeStyle = '#e6edf2'; ctx.lineWidth = 3; const ph = t * 9; ctx.beginPath(); ctx.moveTo(-14 * Math.cos(ph), -4); ctx.lineTo(14 * Math.cos(ph), 4); ctx.stroke(); ctx.restore();
}
SCENES.push({
  id: 'when', title: 'When is logging done?', amb: 'rig',
  cues: [
    'Logging spans the life of a well. Logging-while-drilling tools sit in the drill string and record data just behind the bit.',
    'The classic suite runs on wireline in the open hole: when a section reaches depth, the drill pipe comes out, the tools go in, then casing is set.',
    'After casing, cased-hole logs check the cement, measure production and track the reservoir over the years.',
  ],
  draw(ctx, t, c, s) {
    const P = [
      ['1', 'While drilling · LWD', 'sensors just behind the bit'],
      ['2', 'Open hole · wireline', 'after drilling, before casing'],
      ['3', 'Cased hole', 'cement, production, monitoring'],
    ];
    const v = { y0: 300, y1: 892, d0: 2400, d1: 2508 };
    for (let i = 0; i < 3; i++) {
      const x = 70 + i * 600, w = 560, act = Math.max(.32, lin(t, c[i] - .4, .6)), on = i === 2 ? lin(t, c[2] - .4, .6) : win(t, c[i] - .4, c[i + 1] - .2, .6);
      ctx.save(); ctx.globalAlpha = act;
      box(ctx, x, 140, w, 752, { r: 16, fill: '#0f151c', stroke: on > .5 ? C.accent : '#243240', lw: on > .5 ? 3 : 2 });
      ctx.save(); rr(ctx, x, 140, w, 752, 16); ctx.clip();
      if (i === 0) lwdPanel(ctx, x, w, v, t, act); else if (i === 1) wirelinePanel(ctx, x, w, v, Math.max(0, t - c[1] + 1)); else casedPanel(ctx, x, w, v, t);
      ctx.restore();
      txt(ctx, P[i][0], x + 32, 190, { size: 40, weight: 700, color: C.accent, mono: true });
      txt(ctx, P[i][1], x + 80, 186, { size: 32, weight: 700 });
      txt(ctx, P[i][2], x + 80, 232, { size: 24, weight: 500, color: C.dim });
      ctx.restore();
    }
  },
});

// ---------- 3. Why we log ----------
const Q = [
  ['?', 'Is there oil or gas?', 'resistivity · neutron–density', C.rd],
  ['↕', 'Where is it? Top, base, thickness', 'gamma ray · SP', C.gr],
  ['%', 'How much? Porosity × saturation', 'density · neutron · sonic + resistivity', C.rhob],
  ['→', 'Will it flow? Permeability', 'invasion profile · tests', C.sp],
];
function drawToolString(ctx, x, y, len, o = {}) {
  const parts = [['Gamma ray', C.gr, .16], ['Resistivity', C.rd, .26], ['Density', C.rhob, .16], ['Neutron', C.nphi, .16], ['Sonic', C.dt, .26]];
  const h = o.h ?? 46, a = o.a ?? 1; if (a <= .01) return;
  ctx.save(); ctx.globalAlpha *= a;
  ctx.strokeStyle = '#c9d3dc'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 140, y - 60); ctx.quadraticCurveTo(x - 40, y, x, y); ctx.stroke();
  let xx = x;
  parts.forEach(([n, col, f], i) => {
    const w = len * f, k = lin(o.t ?? 9, i * .35, .4);
    const g = ctx.createLinearGradient(0, y - h / 2, 0, y + h / 2); g.addColorStop(0, '#4f5b67'); g.addColorStop(.35, '#dfe6ec'); g.addColorStop(.65, '#9aa8b5'); g.addColorStop(1, '#414c57');
    ctx.fillStyle = g; rr(ctx, xx + 2, y - h / 2, w - 4, h, 10); ctx.fill();
    ctx.save(); ctx.globalAlpha *= k; ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 16; ctx.fillRect(xx + w * .35, y - h / 2 - 2, w * .3, h + 4); ctx.restore();
    txt(ctx, n, xx + w / 2, y + h / 2 + 30, { size: 24, weight: 600, align: 'center', color: col, a: k });
    xx += w;
  });
  ctx.restore();
}
SCENES.push({
  id: 'why', title: 'Why we log', amb: 'lab',
  cues: ['Logs answer four questions. Is there oil or gas? Where, from top to base? How much? And will it flow? No single tool can answer them all, so several run together.'],
  draw(ctx, t, c, s) {
    const tq = [.04, .2, .33, .44].map(k => at(s, 0, k));
    Q.forEach(([ic, q, ans, col], i) => {
      const x = 150 + (i % 2) * 830, y = 170 + Math.floor(i / 2) * 230, a = pr(t, tq[i], .6);
      ctx.save(); ctx.globalAlpha = a; ctx.translate(0, (1 - a) * 20);
      box(ctx, x, y, 790, 196, { r: 18, fill: '#121a23', stroke: col, lw: 2 });
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x + 80, y + 98, 46, 0, TAU); ctx.fill();
      txt(ctx, ic, x + 80, y + 100, { size: 48, weight: 700, color: '#0b1016', align: 'center' });
      txt(ctx, q, x + 156, y + 80, { size: 36, weight: 700 });
      txt(ctx, ans, x + 156, y + 134, { size: 25, weight: 500, color: C.dim });
      ctx.restore();
    });
    const k = at(s, 0, .62);
    txt(ctx, 'One run, several tools: a combined tool string', 960, 680, { size: 26, weight: 600, align: 'center', color: C.dim, a: pr(t, k, .6) });
    drawToolString(ctx, 360, 750, 1200, { a: pr(t, k, .6), t: t - k });
  },
});

// ---------- 4. Borehole environment: invasion ----------
const INV = { y0: 140, ys: 330, ye: 650, y1: 892, hx0: 70, hx1: 210 };
SCENES.push({
  id: 'invasion', title: 'The borehole environment', amb: 'lab',
  cues: [
    'Mud pressure exceeds formation pressure. In permeable beds, mud filtrate pushes into the pores and leaves a thin mudcake on the wall.',
    'This creates a flushed zone, a transition zone, and undisturbed rock further out. Shallow and deep tools see different zones.',
  ],
  draw(ctx, t, c, s) {
    const { y0, ys, ye, y1, hx0, hx1 } = INV, inv = pr(t, c[0] + 1.5, 4);
    // shale above and below
    for (const [a, b] of [[y0, ys], [ye, y1]]) { ctx.save(); ctx.translate(0, a); ctx.fillStyle = ctx.createPattern(PAT.shale, 'repeat'); ctx.fillRect(hx1, 0, W - hx1, b - a); ctx.restore(); }
    // sand with oil
    ctx.save(); ctx.translate(0, ys); ctx.fillStyle = ctx.createPattern(PAT.sand, 'repeat'); ctx.fillRect(hx1, 0, W - hx1, ye - ys); ctx.restore();
    ctx.fillStyle = TINT.oil; ctx.fillRect(hx1, ys, W - hx1, ye - ys);
    // flushed + transition
    const fx = hx1 + 16 + 330 * inv, tx = fx + 300 * inv;
    const g = ctx.createLinearGradient(fx, 0, Math.max(fx + 1, tx), 0); g.addColorStop(0, 'rgba(170,200,220,.62)'); g.addColorStop(1, 'rgba(170,200,220,0)');
    ctx.fillStyle = 'rgba(170,200,220,.62)'; ctx.fillRect(hx1 + 16, ys, fx - hx1 - 16, ye - ys);
    ctx.fillStyle = g; ctx.fillRect(fx, ys, tx - fx, ye - ys);
    // borehole + mud + mudcake
    const mg = ctx.createLinearGradient(hx0, 0, hx1, 0); mg.addColorStop(0, '#231d18'); mg.addColorStop(1, '#3a3129');
    ctx.fillStyle = mg; ctx.fillRect(0, y0, hx1, y1 - y0);
    ctx.fillStyle = '#94784f'; ctx.fillRect(hx1, ys, 16 * pr(t, c[0] + .8, 1.5), ye - ys);
    // filtrate arrows
    for (let r = 0; r < 5; r++) dots(ctx, [[hx1 - 30, ys + 40 + r * 62], [fx + 40, ys + 40 + r * 62]], t, { a: .85 * lin(t, c[0], .8), color: '#cfe6f5', gap: 46, speed: 60, r: 4.5 });
    chev(ctx, hx1 / 2 + 30, y0 + 20, y1 - 20, t, { a: .5, color: '#bba98e', speed: 40 });
    // labels
    const L1 = lin(t, c[0] + .4, .6), L2 = cueA(t, s, 1) + lin(t, c[1], .1) * 0;
    txt(ctx, 'MUD', hx1 / 2 + 30, 180, { size: 22, mono: true, weight: 700, color: '#e0cdb0', align: 'center', a: L1 });
    txt(ctx, 'Shale: impermeable, no invasion', 1200, 230, { size: 26, weight: 600, color: '#d7dde3', a: L1 });
    label(ctx, hx1 + 8, ys + 26, hx1 + 70, ys - 46, 'Mudcake', { a: lin(t, at(s, 0, .7), .6) });
    const l2 = lin(t, c[1] - .2, .6);
    label(ctx, (hx1 + fx) / 2, ye - 40, (hx1 + fx) / 2 + 20, ye + 64, 'Flushed zone · Rxo\nfiltrate replaced the fluids', { a: l2 });
    label(ctx, (fx + tx) / 2, ye - 80, (fx + tx) / 2 + 30, ye + 150, 'Transition zone', { a: lin(t, at(s, 1, .15), .6) });
    label(ctx, 1450, ye - 60, 1450, ye + 64, 'Undisturbed zone · Rt\noriginal oil and water', { a: lin(t, at(s, 1, .28), .6) });
    // depth of investigation
    const k3 = lin(t, at(s, 1, .6), .5);
    [['Shallow', C.rs, 470, ys + 90], ['Medium', C.rm, 860, ys + 160], ['Deep', C.rd, 1500, ys + 230]].forEach(([n, col, x2, yy], i) => {
      const a = lin(t, at(s, 1, .6) + i * .35, .5); if (a <= 0) return;
      arrow(ctx, hx1 - 40, yy, lerp(hx1, x2, a), yy, { color: col, w: 5, a: a * k3 });
      chip(ctx, lerp(hx1, x2, a) + 16, yy, n, { color: col, size: 20, a });
    });
  },
});

// ---------- 5. The log display ----------
function suiteLayout(ox) {
  return {
    fx0: 60 + ox, fx1: 200 + ox, t1: { x: 240 + ox, w: 300 }, dx: 540 + ox, t2: { x: 620 + ox, w: 300 }, t3: { x: 920 + ox, w: 300 }, t4: { x: 1220 + ox, w: 270 },
  };
}
function drawSuite(ctx, L, v, d, o = {}) {
  const a = o.a ?? 1;
  drawFormation(ctx, L.fx0, L.fx1, v, { a });
  drawBorehole(ctx, (L.fx0 + L.fx1) / 2, v, { hw: 12, a, cake: false });
  if (o.tool) drawSonde(ctx, (L.fx0 + L.fx1) / 2, Y(v, d), { w: 12, up: 60, down: 24, cable: v.y0, a, parts: [{ dy: 0, h: 6, color: C.accent, glow: 10 }] });
  const hl = o.hl || [1, 1, 1, 1];
  ctx.save(); ctx.globalAlpha *= a;
  drawTrack(ctx, { ...L.t1, curves: [cv('GR'), cv('SP'), cv('CAL')], fillGR: true, fillA: o.fillA ?? 1 }, v, d, { pen: o.pen, a: hl[0] });
  drawDepthTrack(ctx, L.dx, 80, v);
  drawTrack(ctx, { ...L.t2, grid: 'log', curves: [cv('RD'), cv('RM'), cv('RS')] }, v, d, { pen: o.pen, a: hl[1] });
  drawTrack(ctx, { ...L.t3, curves: [cv('RHOB'), cv('NPHI')], cross: true, crossA: o.crossA ?? 1, shaleSep: o.shaleSep ?? 0 }, v, d, { pen: o.pen, a: hl[2] });
  drawTrack(ctx, { ...L.t4, curves: [cv('DT')] }, v, d, { pen: o.pen, a: hl[3] });
  ctx.restore();
}
const SV = { y0: 262, y1: 892, d0: 2398, d1: 2512 };
SCENES.push({
  id: 'display', title: 'How a log is recorded', amb: 'lab',
  cues: [{ t: 'Tools are logged upward at a steady speed, and every reading becomes a curve against depth. Track one: gamma ray and SP. Track two: resistivity. Then porosity.', say: 'Tools are logged upward at a steady speed, and every reading becomes a curve against depth. Track one holds gamma ray and S P. Track two, resistivity. Then the porosity logs.' }],
  draw(ctx, t, c, s) {
    const L = suiteLayout(190), d = lerp(2511, 2399, clamp((t - c[0]) / (at(s, 0, .5) - c[0])));
    const tH = [.5, .64, .8], hlOn = lin(t, at(s, 0, .47), .3);
    const hlAt = i => { const j = Math.min(i, 2), a = at(s, 0, tH[j]), b = j < 2 ? at(s, 0, tH[j + 1]) : s.dur + 1; return win(t, a, b, .3); };
    const hl = [0, 1, 2, 3].map(i => lerp(1, .3 + .7 * hlAt(i), hlOn));
    drawSuite(ctx, L, SV, d, { tool: true, pen: true, hl });
    const tags = [['Track 1 · lithology', C.gr, L.t1], ['Track 2 · resistivity (log scale)', C.rd, L.t2], ['Tracks 3–4 · porosity', C.rhob, L.t3]];
    tags.forEach(([n, col, tr], i) => chip(ctx, tr.x + 10, SV.y1 - 40, n, { color: col, size: 20, a: lin(t, at(s, 0, tH[i]), .3) }));
  },
});
