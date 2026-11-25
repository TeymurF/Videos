// Tool scenes 1: gamma ray, spontaneous potential, resistivity.

const PX = { x0: PVX.px, x1: PVX.px + PVX.pw, y0: 140, y1: 892, cx: PVX.px + PVX.pw / 2 };
function zoomBox(ctx, f) { ctx.save(); rr(ctx, PX.x0 + 14, PX.y0 + 46, PVX.pw - 28, PX.y1 - PX.y0 - 60, 12); ctx.clip(); f(); ctx.restore(); }
const ZV = d => ({ y0: PX.y0 + 46, y1: PX.y1 - 14, d0: d - 8, d1: d + 8 });
function readout(ctx, x, y, name, val, col, o = {}) {
  ctx.save(); ctx.globalAlpha *= o.a ?? 1;
  box(ctx, x, y, o.w ?? 250, 92, { r: 12, fill: 'rgba(9,13,18,.88)', stroke: col, lw: 2 });
  txt(ctx, name, x + 18, y + 26, { size: 16, mono: true, weight: 700, color: C.dim });
  txt(ctx, val, x + 18, y + 62, { size: 36, mono: true, weight: 700, color: col });
  ctx.restore();
}
// random clicks with a rate that follows a log value at the tool depth
function countEvents(s, key, scale, type, o = {}) {
  const R = rng(o.seed ?? 5), ev = [], a = o.from ?? s.c[0], b = o.to ?? s.dur - .5;
  for (let t = a; t < b; t += .01) { const d = toolDepth(t, s, o.td); if (R() < scale(logAt(key, d)) * .01) ev.push({ t, type }); }
  return ev;
}

// ---------- 6. Gamma ray ----------
function grPhysics(ctx, t, d, a) {
  if (a <= .01) return;
  ctx.save(); ctx.globalAlpha *= a;
  const zv = ZV(d), hx = PX.cx;
  zoomBox(ctx, () => {
    drawFormation(ctx, PX.x0, PX.x1, zv);
    drawBorehole(ctx, hx, zv, { hw: 78 });
    const ym = Y(zv, d), hot = logAt('GR', d) / 130;
    drawSonde(ctx, hx, ym, { w: 66, up: 420, down: 420, cable: null, joints: [-150, 140], parts: [{ dy: 0, h: 74, color: '#7ef0b0', glow: 16 + 26 * hot, a: .65 + .35 * hot }] });
    const dt = .022, life = .6;
    for (let j = Math.max(0, Math.floor((t - life) / dt)); j <= Math.floor(t / dt); j++) {
      const R = rng(j * 7919 + 3), side = R() < .5 ? -1 : 1, px = hx + side * (100 + R() * 290), py = zv.y0 + 10 + R() * (zv.y1 - zv.y0 - 20);
      if (R() > logAt('GR', DofY(zv, py)) / 125) continue;
      photon(ctx, px, py, hx + side * 30, ym + (R() - .5) * 60, (t - j * dt) / life, { tail: 70 });
    }
    label(ctx, hx - 34, ym - 20, hx - 110, ym - 150, 'Scintillation crystal\nflashes for every gamma ray', { a: 1, size: 22 });
  });
  chip(ctx, PX.x0 + 28, PX.y0 + 84, 'Natural gamma rays · K-40 · uranium · thorium', { color: C.gamma, size: 20 });
  const g = logAt('GR', d);
  readout(ctx, PX.x0 + 28, PX.y1 - 120, 'COUNT RATE → GR', g.toFixed(0) + ' API', g > 70 ? '#c9c2a8' : C.gr);
  ctx.restore();
}
function grCorrelation(ctx, t, a) {
  if (a <= .01) return;
  ctx.save(); ctx.globalAlpha *= a;
  const v = { y0: PX.y0 + 120, y1: PX.y1 - 120, d0: 2398, d1: 2512 }, x1 = PX.x0 + 90, x2 = PX.x0 + 500, w = 220;
  const map2 = d => 2398 + (d - 2398) * 1.16 + 10, inv2 = d2 => (d2 - 10 - 2398) / 1.16 + 2398;
  const v2 = { ...v, d0: 2398, d1: map2(2512) - 8 };
  txt(ctx, 'Well 1', x1 + w / 2, PX.y0 + 82, { size: 26, weight: 700, align: 'center' });
  txt(ctx, 'Well 2 · 3 km away', x2 + w / 2, PX.y0 + 82, { size: 26, weight: 700, align: 'center' });
  for (const [x, vv, f] of [[x1, v, d => logAt('GR', d)], [x2, v2, d2 => logAt('GR', inv2(d2)) + vnoise(d2 * 3, 12) * 4]]) {
    ctx.fillStyle = '#0d1319'; ctx.fillRect(x, vv.y0, w, vv.y1 - vv.y0); ctx.strokeStyle = '#2e3c4b'; ctx.lineWidth = 2; ctx.strokeRect(x, vv.y0, w, vv.y1 - vv.y0);
    ctx.save(); ctx.beginPath(); ctx.rect(x, vv.y0, w, vv.y1 - vv.y0); ctx.clip();
    for (let d = vv.d0; d < vv.d1; d += DSTEP) { const g = f(d), k = clamp((g - 20) / 90); ctx.fillStyle = `rgba(${Math.round(lerp(226, 92, k))},${Math.round(lerp(190, 98, k))},${Math.round(lerp(96, 92, k))},.5)`; ctx.fillRect(x, Y(vv, d), g / 150 * w, Y(vv, d + DSTEP) - Y(vv, d) + .6); }
    ctx.strokeStyle = C.gr; ctx.lineWidth = 3; ctx.beginPath(); for (let d = vv.d0; d < vv.d1; d += DSTEP) ctx.lineTo(x + f(d) / 150 * w, Y(vv, d)); ctx.stroke();
    ctx.restore();
  }
  LAYERS.slice(1).forEach((L, i) => {
    const k = lin(t, .4 + i * .25, .4); if (k <= 0) return;
    const ya = Y(v, L.top), yb = Y(v2, map2(L.top));
    ctx.strokeStyle = L.fluid ? FLUIDCOL[L.fluid] : '#c9c2a8'; ctx.globalAlpha = a * k; ctx.lineWidth = 2.5; ctx.setLineDash([8, 6]);
    ctx.beginPath(); ctx.moveTo(x1 + w, ya); ctx.lineTo(lerp(x1 + w, x2, k), lerp(ya, yb, k)); ctx.stroke(); ctx.setLineDash([]);
  });
  ctx.globalAlpha = a;
  box(ctx, PX.x0 + 40, PX.y1 - 96, PVX.pw - 80, 70, { r: 12, fill: 'rgba(9,13,18,.9)', stroke: C.gr, lw: 1.5 });
  txt(ctx, 'Shale volume:  I = (GR − GRclean) / (GRshale − GRclean)', PX.cx, PX.y1 - 61, { size: 20, mono: true, weight: 500, align: 'center' });
  ctx.restore();
}
SCENES.push({
  id: 'gr', title: 'Gamma ray log', amb: 'lab',
  cues: [
    'The gamma ray tool is passive. A scintillation crystal counts natural gamma rays from potassium, uranium and thorium in the rock.',
    'These elements gather in clay, so shale reads high and clean sandstone or limestone reads low. That separates reservoirs from seals.',
    'It gives shale volume, correlates layers between wells, and serves as the depth reference on almost every run.',
  ],
  events(s) { return countEvents(s, 'GR', g => g / 150 * 26, 'click', { to: s.c[2] }); },
  draw(ctx, t, c, s) {
    const d = toolDepth(t, s);
    drawProbe(ctx, t, s, {
      depth: d, track: { x: PVX.tr, w: PVX.trw, curves: [cv('GR')], fillGR: true },
      tool: (ctx, x, y) => drawSonde(ctx, x, y, { w: 26, up: 110, down: 60, cable: PV.y0 - 40, parts: [{ dy: 0, h: 18, color: '#7ef0b0', glow: 8 + 20 * logAt('GR', d) / 130 }] }),
    });
    const a1 = cueA(t, s, 1);
    if (a1 > 0) { for (const [dd, n, col] of [[2503, 'shale · high', '#c9c2a8'], [2486, 'limestone · low', C.gr], [2455, 'sandstone · low', C.gr]]) if (d < dd - 1) chip(ctx, PVX.tr + PVX.trw - 8, Y(PV, dd), n, { align: 'right', size: 18, color: col, a: a1 }); }
    panel(ctx, PX.x0, PX.y0, PVX.pw, PX.y1 - PX.y0, 'INSIDE THE MEASUREMENT');
    const k = pr(t, c[2] - .4, .8);
    grPhysics(ctx, t, d, 1 - k);
    grCorrelation(ctx, t - c[2], k);
  },
});

// ---------- 7. Spontaneous potential ----------
function ion(ctx, x, y, sign, a = 1) {
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = sign > 0 ? '#ff7a6b' : '#6cb8ff';
  ctx.beginPath(); ctx.arc(x, y, 11, 0, TAU); ctx.fill();
  txt(ctx, sign > 0 ? '+' : '−', x, y + 1, { size: 20, weight: 700, color: '#0b1016', align: 'center' });
  ctx.restore();
}
function spPhysics(ctx, t, d) {
  const x0 = PX.x0 + 14, x1 = PX.x1 - 14, ya = PX.y0 + 150, yb = PX.y0 + 330, yc = PX.y0 + 560, yd = PX.y1 - 14, hx = PX.cx, hw = 70;
  zoomBox(ctx, () => {
    for (const [a, b] of [[PX.y0 + 46, yb], [yc, yd]]) { ctx.save(); ctx.translate(0, a); ctx.fillStyle = ctx.createPattern(PAT.shale, 'repeat'); ctx.fillRect(x0, 0, x1 - x0, b - a); ctx.restore(); }
    ctx.save(); ctx.translate(0, yb); ctx.fillStyle = ctx.createPattern(PAT.sand, 'repeat'); ctx.fillRect(x0, 0, x1 - x0, yc - yb); ctx.restore();
    ctx.fillStyle = 'rgba(30,100,170,.35)'; ctx.fillRect(x0, yb, x1 - x0, yc - yb);
    ctx.fillStyle = 'rgba(190,215,235,.45)'; ctx.fillRect(hx - hw - 150, yb, 300 + hw * 2, yc - yb);
    const g = ctx.createLinearGradient(hx - hw, 0, hx + hw, 0); g.addColorStop(0, '#231d18'); g.addColorStop(.5, '#3a3129'); g.addColorStop(1, '#231d18');
    ctx.fillStyle = g; ctx.fillRect(hx - hw, PX.y0 + 46, hw * 2, yd - PX.y0 - 46);
    // salty formation water: dense ions; filtrate: sparse
    const R = rng(77);
    for (let i = 0; i < 90; i++) { const sd = R() < .5 ? -1 : 1, x = hx + sd * (hw + 160 + R() * 220), y = yb + 16 + R() * (yc - yb - 32); ion(ctx, x, y, R() < .5 ? 1 : -1, .55); }
    for (let i = 0; i < 10; i++) { const sd = R() < .5 ? -1 : 1, x = hx + sd * (hw + 20 + R() * 120), y = yb + 16 + R() * (yc - yb - 32); ion(ctx, x, y, R() < .5 ? 1 : -1, .55); }
    // Na+ through the shale (membrane) and Cl- across the liquid junction
    for (const sd of [-1, 1]) for (const [y0, y1] of [[yb + 30, yb - 120], [yc - 30, yc + 120]]) {
      const path = [[hx + sd * (hw + 330), y0], [hx + sd * (hw + 200), (y0 + y1) / 2], [hx + sd * (hw + 6), y1]], L = polyLen(path);
      for (let i = 0; i < 3; i++) { const k = ((t * .22 + i / 3) % 1), q = polyAt(path, L, k * L[2]); ion(ctx, q[0], q[1], 1, Math.min(1, k * 5, (1 - k) * 5)); }
    }
    for (const sd of [-1, 1]) for (let r = 0; r < 3; r++) { const k = ((t * .3 + r / 3) % 1), y = yb + 60 + r * 80; ion(ctx, hx + sd * (hw + 300 - k * 140), y, -1, Math.min(1, k * 5, (1 - k) * 5)); }
    // current loops in the mud at the bed boundaries
    for (const y of [yb, yc]) { ctx.strokeStyle = 'rgba(255,209,102,.75)'; ctx.lineWidth = 3; ctx.setLineDash([6, 6]); ctx.lineDashOffset = -t * 30; ctx.beginPath(); ctx.ellipse(hx, y, hw - 14, 46, 0, 0, TAU); ctx.stroke(); ctx.setLineDash([]); }
    // electrode on the cable
    const ey = lerp(yb - 100, yc + 100, (Math.sin(t * .4) + 1) / 2);
    ctx.strokeStyle = '#c9d3dc'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(hx, PX.y0 + 46); ctx.lineTo(hx, ey); ctx.stroke();
    glowDot(ctx, hx, ey, 12, C.sp);
  });
  chip(ctx, PX.x0 + 30, yb - 34, 'Shale: lets Na+ through, blocks Cl−', { size: 18, color: '#d7dde3' });
  chip(ctx, PX.x0 + 30, yc + 34, 'Sand: salty formation water', { size: 18, color: C.water });
  chip(ctx, PX.x1 - 30, yc + 34, 'fresher mud filtrate', { size: 18, color: '#cfe6f5', align: 'right' });
  chip(ctx, PX.x0 + 30, PX.y1 - 50, 'Na+ moving through shale = membrane potential', { size: 18, color: '#ff7a6b' });
  // voltmeter
  const v = logAt('SP', d), mx = PX.x1 - 200, my = PX.y0 + 110;
  box(ctx, mx - 130, my - 60, 290, 150, { r: 14, fill: 'rgba(9,13,18,.92)', stroke: C.sp, lw: 2 });
  ctx.strokeStyle = '#8b9aa9'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(mx + 15, my + 60, 80, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
  const ang = Math.PI * 1.5 + (v + 40) / 60 * .9;
  ctx.strokeStyle = C.sp; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(mx + 15, my + 60); ctx.lineTo(mx + 15 + Math.cos(ang) * 74, my + 60 + Math.sin(ang) * 74); ctx.stroke();
  txt(ctx, v.toFixed(0) + ' mV', mx + 15, my + 62, { size: 26, mono: true, weight: 700, align: 'center', color: C.sp });
}
SCENES.push({
  id: 'sp', title: 'Spontaneous potential (SP)', amb: 'lab',
  cues: [
    'The SP log needs no source. It records a natural voltage between an electrode in the mud and one at the surface.',
    'The voltage comes from the salinity contrast between mud filtrate and formation water, with shale acting as an ion-selective membrane.',
    'Opposite shale the curve holds a straight baseline. Opposite permeable beds it swings, usually to the left. It needs a water-based mud.',
  ],
  draw(ctx, t, c, s) {
    const d = toolDepth(t, s);
    drawProbe(ctx, t, s, {
      depth: d, track: { x: PVX.tr, w: PVX.trw, curves: [cv('SP', { dash: [], lw: 3.2 })] },
      tool: (ctx, x, y) => { drawSonde(ctx, x, y, { w: 22, up: 100, down: 40, cable: PV.y0 - 40 }); glowDot(ctx, x, y, 9, C.sp); },
    });
    // surface reference electrode note
    chip(ctx, PVX.hole + 20, PV.y0 - 22, 'reference electrode at surface ↑', { size: 17, color: C.sp, a: lin(t, c[0] + 2, .6) });
    const a2 = lin(t, c[2] - .2, .6);
    if (a2 > 0) {
      const xb = PVX.tr + cPos(CV.SP, 0) * PVX.trw, xs = PVX.tr + cPos(CV.SP, -65) * PVX.trw;
      ctx.save(); ctx.globalAlpha = a2; ctx.setLineDash([10, 8]); ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#d7dde3'; ctx.beginPath(); ctx.moveTo(xb, PV.y0); ctx.lineTo(xb, PV.y1); ctx.stroke();
      ctx.strokeStyle = C.accent; ctx.beginPath(); ctx.moveTo(xs, PV.y0); ctx.lineTo(xs, PV.y1); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
      chip(ctx, xb - 6, PV.y0 + 30, 'shale baseline', { align: 'right', size: 17, color: '#d7dde3', a: a2 });
      chip(ctx, xs + 6, Y(PV, 2440), 'sand line', { size: 17, a: lin(t, at(s, 2, .35), .5) });
    }
    panel(ctx, PX.x0, PX.y0, PVX.pw, PX.y1 - PX.y0, 'WHERE THE VOLTAGE COMES FROM');
    spPhysics(ctx, t, d);
  },
});

// ---------- 8. Resistivity ----------
function resScale(ctx, x, y, w) {
  const X = R => x + (Math.log10(R) + 1) / 5 * w;
  txt(ctx, 'Typical resistivity, Ω·m (log scale)', x, y - 34, { size: 19, mono: true, weight: 700, color: C.dim });
  const g = ctx.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, '#2f6d9c'); g.addColorStop(.45, '#7d6b50'); g.addColorStop(1, '#e9a63b');
  rr(ctx, x, y - 8, w, 16, 8); ctx.fillStyle = g; ctx.fill();
  for (const R of [.1, 1, 10, 100, 1000, 10000]) txt(ctx, String(R), X(R), y + 30, { size: 16, mono: true, color: C.dim, align: 'center' });
  [['brine sand', .5, 2, C.water, 0], ['shale', 1, 10, '#c9c2a8', 1], ['oil / gas sand', 10, 1000, C.oil, 0], ['tight limestone', 100, 10000, '#9fb0c0', 1]].forEach(([n, a, b, col, row]) => {
    const yy = y + 62 + row * 46; ctx.fillStyle = col; rr(ctx, X(a), yy - 6, X(b) - X(a), 12, 6); ctx.fill();
    txt(ctx, n, (X(a) + X(b)) / 2, yy + 20, { size: 17, weight: 600, align: 'center', color: col });
  });
}
const GRAINS = (() => { const R = rng(21), a = []; let tries = 0; while (a.length < 26 && tries++ < 4000) { const g = [R() * 330 + 10, R() * 300 + 10, 26 + R() * 18]; if (a.every(b => Math.hypot(b[0] - g[0], b[1] - g[1]) > b[2] + g[2] + 6)) a.push(g); } return a; })();
function poreBox(ctx, x, y, oil, t, title, val, col) {
  const w = 350, h = 320;
  ctx.save(); rr(ctx, x, y, w, h, 12); ctx.clip();
  ctx.fillStyle = oil ? '#9a6a22' : '#2f6d9c'; ctx.fillRect(x, y, w, h);
  for (const g of GRAINS) { if (oil) { ctx.strokeStyle = '#4aa8e0'; ctx.lineWidth = 9; ctx.beginPath(); ctx.arc(x + g[0], y + g[1], g[2] + 3, 0, TAU); ctx.stroke(); } }
  for (const g of GRAINS) { ctx.fillStyle = '#d8c39a'; ctx.beginPath(); ctx.arc(x + g[0], y + g[1], g[2], 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(80,60,30,.6)'; ctx.lineWidth = 2; ctx.stroke(); }
  // current carriers
  const n = oil ? 3 : 9;
  for (let i = 0; i < n; i++) { const yy = y + 20 + (i + .5) * (h - 40) / n; const p = []; for (let k = 0; k <= 14; k++) p.push([x + k * w / 14, yy + Math.sin(k * 1.3 + i) * 16]); dots(ctx, p, t + i * .3, { color: '#fff3c4', gap: oil ? 70 : 30, speed: oil ? 35 : 90, r: 4 }); }
  ctx.restore();
  box(ctx, x, y, w, h, { r: 12, fill: null, stroke: col, lw: 2 });
  txt(ctx, title, x + w / 2, y - 26, { size: 24, weight: 700, align: 'center' });
  txt(ctx, val, x + w / 2, y + h + 36, { size: 30, mono: true, weight: 700, align: 'center', color: col });
}
function lateroLog(ctx, t, d, a) {
  if (a <= .01) return; ctx.save(); ctx.globalAlpha *= a;
  const zv = ZV(d), hx = PX.cx;
  zoomBox(ctx, () => {
    drawFormation(ctx, PX.x0, PX.x1, zv); drawBorehole(ctx, hx, zv, { hw: 78 });
    const ym = Y(zv, d);
    drawSonde(ctx, hx, ym, { w: 56, up: 420, down: 420, cable: null, parts: [{ dy: -200, h: 120, color: '#6c7a88' }, { dy: 200, h: 120, color: '#6c7a88' }, { dy: -60, h: 10, color: '#cfd8e0' }, { dy: 60, h: 10, color: '#cfd8e0' }, { dy: 0, h: 16, color: C.accent, glow: 18 }] });
    // guard currents bend away; survey current goes straight out in a thin sheet
    for (const sd of [-1, 1]) {
      for (const dy of [-6, 6]) dots(ctx, [[hx + sd * 30, ym + dy], [hx + sd * 400, ym + dy]], t, { color: C.accent, gap: 26, speed: 120, r: 4.5 });
      for (const [gy, dir] of [[ym - 200, -1], [ym + 200, 1]]) for (let i = 0; i < 4; i++) {
        const p = []; for (let k = 0; k <= 12; k++) { const r = 30 + k * 32, ang = k / 12 * (.5 + i * .25); p.push([hx + sd * r * Math.cos(ang * .9), gy + dir * (i * 26 + r * Math.sin(ang) * .6)]); }
        dots(ctx, p, t + i * .2, { color: '#9fd6ff', gap: 32, speed: 90, r: 3.5, a: .8 });
      }
    }
    label(ctx, hx - 200, ym, hx - 150, ym + 100, 'Survey current\nfocused into a thin sheet', { size: 21 });
    label(ctx, hx - 30, ym - 230, hx - 130, ym - 300, 'Guard electrodes', { size: 21, color: '#9fd6ff' });
  });
  chip(ctx, PX.x0 + 28, PX.y0 + 84, 'Laterolog · electrodes · conductive (salty) mud', { color: C.accent, size: 20 });
  ctx.restore();
}
function inductionLog(ctx, t, d, a) {
  if (a <= .01) return; ctx.save(); ctx.globalAlpha *= a;
  const zv = ZV(d), hx = PX.cx;
  zoomBox(ctx, () => {
    drawFormation(ctx, PX.x0, PX.x1, zv); drawBorehole(ctx, hx, zv, { hw: 78 });
    const ym = Y(zv, d), yT = ym + 150, yR = ym - 150;
    drawSonde(ctx, hx, ym, { w: 52, up: 420, down: 420, cable: null });
    // magnetic field of the transmitter
    for (let i = 1; i <= 4; i++) { ctx.strokeStyle = `rgba(190,170,255,${.5 - i * .08})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(hx, yT, 40 + i * 70, 30 + i * 46, 0, 0, TAU); ctx.stroke(); }
    // ground loops
    for (let i = 0; i < 3; i++) {
      const rx = 170 + i * 100, ry = rx * .2, yy = ym + 20;
      ctx.strokeStyle = 'rgba(255,209,102,.55)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(hx, yy, rx, ry, 0, 0, TAU); ctx.stroke();
      for (let k = 0; k < 8; k++) { const ph = t * (1.6 - i * .3) + k * TAU / 8, px = hx + Math.cos(ph) * rx, py = yy + Math.sin(ph) * ry; glowDot(ctx, px, py, 4.5, C.accent, Math.sin(ph) > 0 ? 1 : .45); }
    }
    for (const [yy, n, col] of [[yT, 'T', '#c49bff'], [yR, 'R', '#6cc4ff']]) {
      ctx.strokeStyle = col; ctx.lineWidth = 4; for (let k = -3; k <= 3; k++) { ctx.beginPath(); ctx.ellipse(hx, yy + k * 8, 30, 6, 0, 0, Math.PI); ctx.stroke(); }
      txt(ctx, n, hx, yy, { size: 22, weight: 700, align: 'center', color: '#0b1016' });
    }
    label(ctx, hx - 26, yT, hx - 150, yT + 120, 'Transmitter coil\nalternating current', { size: 21, color: '#c49bff' });
    label(ctx, hx + 340, ym + 16, hx + 260, ym - 110, 'Induced ground-loop\ncurrents in the rock', { size: 21 });
    label(ctx, hx - 26, yR, hx - 140, yR - 90, 'Receiver coil', { size: 21, color: '#6cc4ff' });
  });
  chip(ctx, PX.x0 + 28, PX.y0 + 84, 'Induction · coils · works in oil-based mud', { color: '#c49bff', size: 20 });
  ctx.restore();
}
function radialProfile(ctx, t, a) {
  if (a <= .01) return; ctx.save(); ctx.globalAlpha *= a;
  const gx = PX.x0 + 110, gy = PX.y0 + 120, gw = 640, gh = 360;
  const Rr = r => Math.pow(10, lerp(Math.log10(7), Math.log10(32), clamp((r - .25) / .55) ** 1.2));
  const X = r => gx + r / 2 * gw, Yr = R => gy + gh - (Math.log10(R) - Math.log10(2)) / (Math.log10(80) - Math.log10(2)) * gh;
  txt(ctx, 'Oil sandstone, fresh mud: resistivity away from the wall', gx, PX.y0 + 84, { size: 22, weight: 600 });
  ctx.fillStyle = 'rgba(170,200,220,.16)'; ctx.fillRect(X(0), gy, X(.25) - X(0), gh);
  ctx.fillStyle = 'rgba(233,166,59,.12)'; ctx.fillRect(X(.8), gy, X(2) - X(.8), gh);
  ctx.strokeStyle = '#2e3c4b'; ctx.lineWidth = 2; ctx.strokeRect(gx, gy, gw, gh);
  for (const R of [2, 5, 10, 20, 50]) { ctx.strokeStyle = 'rgba(255,255,255,.07)'; ctx.beginPath(); ctx.moveTo(gx, Yr(R)); ctx.lineTo(gx + gw, Yr(R)); ctx.stroke(); txt(ctx, String(R), gx - 12, Yr(R), { size: 16, mono: true, color: C.dim, align: 'right' }); }
  txt(ctx, 'Ω·m', gx - 12, gy - 18, { size: 16, mono: true, color: C.dim, align: 'right' });
  txt(ctx, 'distance into the rock →', gx + gw, gy + gh + 28, { size: 18, color: C.dim, align: 'right' });
  txt(ctx, 'flushed · Rxo', X(.125), gy + 26, { size: 18, weight: 600, align: 'center', color: '#cfe6f5' });
  txt(ctx, 'undisturbed · Rt', X(1.4), gy + 26, { size: 18, weight: 600, align: 'center', color: C.oil });
  const k = lin(t, .3, 1.5);
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4; ctx.beginPath(); for (let r = 0; r <= 2 * k; r += .01) ctx.lineTo(X(r), Yr(Rr(r))); ctx.stroke();
  [['Shallow', .12, C.rs, 7], ['Medium', .5, C.rm, 17], ['Deep', 1.45, C.rd, 32]].forEach(([n, r, col, val], i) => {
    const b = lin(t, 1.6 + i * .5, .5); if (b <= 0) return;
    ctx.save(); ctx.globalAlpha *= b; ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.moveTo(X(r), gy + gh); ctx.lineTo(X(r), Yr(val)); ctx.stroke(); ctx.setLineDash([]);
    glowDot(ctx, X(r), Yr(val), 8, col); ctx.restore();
    chip(ctx, X(r) + 12, Yr(val) - 30, `${n} ≈ ${val}`, { color: col, size: 18, a: b });
  });
  const b2 = lin(t, 3.4, .6);
  box(ctx, PX.x0 + 40, PX.y1 - 196, PVX.pw - 80, 166, { r: 14, fill: 'rgba(9,13,18,.92)', stroke: C.rd, lw: 1.5, a: b2 });
  txt(ctx, 'Curves separate → filtrate invaded → the bed is permeable', PX.cx, PX.y1 - 160, { size: 23, weight: 600, align: 'center', a: b2 });
  txt(ctx, 'Archie:  Sw = ( a·Rw / (φ^m · Rt) )^(1/n)', PX.cx, PX.y1 - 104, { size: 26, mono: true, weight: 700, align: 'center', color: C.accent, a: b2 });
  txt(ctx, 'water saturation from the deep reading', PX.cx, PX.y1 - 62, { size: 19, align: 'center', color: C.dim, a: b2 });
  ctx.restore();
}
SCENES.push({
  id: 'res', title: 'Resistivity logs', amb: 'lab',
  cues: [
    'Grains, oil and gas do not conduct. Current flows only through salty water in the pores, so rock holding hydrocarbons reads high, and rock holding brine reads low.',
    'A laterolog drives current from electrodes, and guard electrodes focus it into a thin sheet deep into the rock. It needs conductive mud.',
    'An induction tool uses coils. A transmitter induces rings of current in the rock, and a receiver picks up their field, even in oil-based mud.',
    { t: 'Curves reading at different depths separate where filtrate invaded a permeable bed. The deep curve approaches the true resistivity, Rt.', say: 'Curves reading at different depths separate where filtrate invaded a permeable bed. The deep curve approaches the true resistivity, R T.' },
  ],
  events(s) { return [1, 2, 3].map(i => ({ t: s.c[i] - .2, type: 'whoosh' })); },
  draw(ctx, t, c, s) {
    const d = toolDepth(t, s);
    drawProbe(ctx, t, s, {
      depth: d, track: { x: PVX.tr, w: PVX.trw, grid: 'log', curves: [cv('RD'), cv('RM'), cv('RS')] },
      tool: (ctx, x, y) => drawSonde(ctx, x, y, { w: 26, up: 150, down: 90, cable: PV.y0 - 40, parts: [{ dy: -110, h: 30, color: '#6c7a88' }, { dy: 70, h: 30, color: '#6c7a88' }, { dy: 0, h: 10, color: C.rd, glow: 12 }] }),
    });
    panel(ctx, PX.x0, PX.y0, PVX.pw, PX.y1 - PX.y0, ['WHY RESISTIVITY SEES FLUIDS', 'LATEROLOG', 'INDUCTION', 'DEPTH OF INVESTIGATION'][[0, 1, 2, 3].filter(i => t >= c[i] - .4).pop() ?? 0]);
    const A = i => i === 3 ? lin(t, c[3] - .4, .6) : win(t, i ? c[i] - .4 : -1, c[i + 1] - .4, .6);
    if (A(0) > 0) { ctx.save(); ctx.globalAlpha = A(0); poreBox(ctx, PX.x0 + 40, PX.y0 + 110, false, t, 'Brine in the pores', 'low · 0.8 Ω·m', C.water); poreBox(ctx, PX.x0 + 420, PX.y0 + 110, true, t, 'Oil in the pores', 'high · 32 Ω·m', C.oil); txt(ctx, 'grains and oil are insulators · the current follows the water', PX.cx, PX.y0 + 516, { size: 22, align: 'center', color: C.dim }); resScale(ctx, PX.x0 + 50, PX.y0 + 596, PVX.pw - 100); ctx.restore(); }
    lateroLog(ctx, t, d, A(1));
    inductionLog(ctx, t, d, A(2));
    radialProfile(ctx, t - c[3], A(3));
  },
});
