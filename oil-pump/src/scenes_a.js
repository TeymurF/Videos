// Scenes 0-5: title, overview, cross-section, rock, inflow, perforation.
const CAM_FULL = { cx: 230, cy: 545, z: .455 };
function subp(ctx, x, y, base, sub, size, color) { // p with a subscript; returns the width
  ctx.save(); ctx.font = font(size, 700, true); const w1 = ctx.measureText(base).width;
  txt(ctx, base, x, y, { size, mono: true, weight: 700, color });
  ctx.font = font(size * .52, 700); const w2 = ctx.measureText(sub).width;
  txt(ctx, sub, x + w1 + 2, y + size * .3, { size: size * .52, weight: 700, color });
  ctx.restore(); return w1 + w2 + 4;
}
function pathList(ctx, x, y, title, items, k, color, align = 'left') {
  txt(ctx, title, x, y, { size: 30, weight: 700, color, align, mono: true });
  items.forEach((it, i) => {
    const on = clamp(k * items.length - i), yy = y + 58 + i * 50;
    ctx.fillStyle = color; ctx.globalAlpha = .25 + .75 * on;
    ctx.beginPath(); ctx.arc(align === 'left' ? x + 9 : x - 9, yy, 7, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
    if (i < items.length - 1) { ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect((align === 'left' ? x + 9 : x - 9) - 1, yy + 12, 2, 26); }
    txt(ctx, it, align === 'left' ? x + 34 : x - 34, yy, { size: 28, weight: on > .5 ? 600 : 400, color: on > .5 ? C.ink : C.dim, align });
  });
}
function glowDot(ctx, p, k, color) {
  const L = polyLen(p), q = polyAt(p, L, k * L[L.length - 1]);
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 5; ctx.globalAlpha = .55; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]);
  for (let i = 1; i < p.length; i++) { if (L[i] <= k * L[L.length - 1]) ctx.lineTo(p[i][0], p[i][1]); else { ctx.lineTo(q[0], q[1]); break; } }
  ctx.stroke(); ctx.globalAlpha = 1;
  ctx.shadowColor = color; ctx.shadowBlur = 24; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(q[0], q[1], 9, 0, TAU); ctx.fill(); ctx.restore();
}

// ---------- 0. Title ----------
SCENES.push({
  id: 'title', amb: 'surface', cues: [], fixed: 7.5,
  draw(ctx, t) {
    drawWorld(ctx, { cx: -430, cy: -200, z: 1.25 + .04 * t / 7 }, GT);
    const g = ctx.createLinearGradient(0, 0, 1250, 0); g.addColorStop(0, 'rgba(11,16,22,.96)'); g.addColorStop(.6, 'rgba(11,16,22,.6)'); g.addColorStop(1, 'rgba(11,16,22,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 1300, H);
    const a = pr(t, .5, 1.2);
    ctx.globalAlpha = a; ctx.translate(0, (1 - a) * 24);
    txt(ctx, 'SUCKER-ROD PUMPING SYSTEM · PUMPJACK', 120, 330, { size: 24, mono: true, weight: 700, color: C.accent });
    txt(ctx, 'How an oil\npumpjack works', 116, 440, { size: 104, weight: 700, lh: 1.12 });
    ctx.globalAlpha = pr(t, 1.6, 1.2);
    ctx.fillStyle = C.accent; ctx.fillRect(120, 640, 90, 5);
    txt(ctx, 'A well with a sucker-rod pump:\nfrom the rock pores to the surface', 120, 700, { size: 36, weight: 400, color: '#c4cfd9', lh: 1.4 });
  },
});

// ---------- 1. Overview ----------
SCENES.push({
  id: 'overview', title: 'Overview', amb: 'surface',
  cues: [
    'This is an oil well with a downhole sucker-rod pump and a pumpjack on the surface.',
    'The principle is simple: a surface motor, through the pumpjack and a long string of rods, moves a plunger deep underground.',
    'Two check valves take turns letting fluid pass from the well into the pump, and then into the tubing.',
    'Repeating this cycle over and over is what brings production to the surface.',
  ],
  draw(ctx, t, c, s) {
    const cam = camKf(t, [[0, { cx: 30, cy: -150, z: 1.45 }], [c[1] - .3, CAM_FULL, 4]]);
    drawWorld(ctx, cam, GT, { flow: t > c[2] });
    const L = (wx, wy, dx, dy, str, a) => { const p = camP(cam, wx, wy); label(ctx, p[0], p[1], p[0] + dx, p[1] + dy, str, { a }); };
    const a0 = win(t, c[0] + .5, c[1] - .6);
    L(-80, -310, -150, -150, 'Pumpjack', a0); L(WX, -70, 170, -150, 'Wellhead', a0); L(430, -40, 120, 110, 'Flowline', a0);
    const a1 = win(t, c[1] + 3.5, s.e[3]);
    L(-366, -50, -200, -90, 'Motor', a1); L(WX, 520, -230, 0, 'Rod string', a1); L(WX, 1120, -230, 0, 'Pump plunger', a1);
    const a2 = win(t, c[2] + .4, s.e[3]);
    L(WX + 20, 1200, 230, 20, 'Two check valves', a2); L(WX + 23, 300, 230, 0, 'Tubing', a2); L(WX + 120, 1350, 230, 40, 'Reservoir', a2);
  },
});

// ---------- 2. Cross-section ----------
SCENES.push({
  id: 'section', title: 'What is underground', amb: 'under',
  cues: [
    'Let us look underground. The wellbore is supported by a steel casing string, with a cement sheath around it.',
    'Inside the casing hangs the production tubing. The produced fluid rises to the surface through it.',
    'Sucker rods move inside the tubing. At the bottom they are connected to the downhole pump.',
    'Lower still is the reservoir. It communicates with the well through perforations.',
    'There are two separate paths. The energy path: motor, gearbox, cranks, walking beam, polished rod, rods, plunger.',
    'And the fluid path: rock pores, perforations, pump intake, valves, tubing, wellhead and flowline.',
    'The rods only transmit force. The fluid rises through the space between the rods and the tubing wall.',
  ],
  draw(ctx, t, c, s) {
    const cA = { cx: 300, cy: 300, z: 1.75 }, cB = { cx: 300, cy: 1090, z: 1.75 }, cC = { cx: 330, cy: 1330, z: 1.5 }, cE = { cx: 235, cy: 480, z: 3.6 };
    const cam = camKf(t, [[0, CAM_FULL], [.3, cA, 2.5], [c[2] - .4, cB, 2.6], [c[3] - .4, cC], [c[4] - .5, CAM_FULL, 2.6], [c[6] - .4, cE, 2.6]]);
    const hl = t > c[0] + 1 && t < c[0] + 5 ? 'casing' : t > c[0] + 5 && t < s.e[0] ? 'cement' : t > c[1] + .5 && t < s.e[1] ? 'tubing' : t > c[2] + .5 && t < c[2] + 4 ? 'rods' : t > c[2] + 4 && t < s.e[2] ? 'pump' : t > c[3] + 2 && t < s.e[3] ? 'perf' : '';
    drawWorld(ctx, cam, GT, { flow: t > c[5], hl });
    const L = (wx, wy, dx, dy, str, a) => { const p = camP(cam, wx, wy); label(ctx, p[0], p[1], p[0] + dx, p[1] + dy, str, { a }); };
    L(WX + 50, 240, 240, -40, 'Casing\nsupports the wellbore', win(t, c[0] + 1.6, s.e[1]));
    L(WX - 60, 340, -240, 30, 'Cement sheath', win(t, c[0] + 5, s.e[1]));
    L(WX + 23, 420, 260, 40, 'Tubing\nproduction string', win(t, c[1] + .5, s.e[1]));
    L(WX, 960, -260, -20, 'Sucker rods', win(t, c[2] + 1, s.e[2]));
    L(WX + 24, 1130, 260, 0, 'Downhole pump', win(t, c[2] + 4, s.e[2]));
    L(WX + 420, 1340, 60, -150, 'Reservoir', win(t, c[3] + .5, s.e[3]));
    L(WX + 110, 1330, 200, 110, 'Perforations', win(t, c[3] + 2.5, s.e[3]));
    // energy path
    const aE = win(t, c[4] + 1, s.e[4] + .2), aP = win(t, c[5] + .3, s.e[5] + .2);
    if (aE > 0) {
      const g = pjGeom(TH(GT)), k = lin(t, c[4] + 1.2, s.e[4] - c[4] - 2.2);
      const pts = [[-366, -50], [-262, -96], [-190, -80], g.K, g.E, [0, -300], [WX, -300], [WX, 1130]].map(p => camP(cam, p[0], p[1]));
      ctx.save(); ctx.globalAlpha = aE; glowDot(ctx, pts, k, C.accent);
      pathList(ctx, 150, 250, 'ENERGY PATH', ['Motor', 'Belt drive', 'Gearbox', 'Cranks and pitman arms', 'Walking beam', 'Polished rod', 'Sucker rods', 'Plunger'], k * 1.05, C.accent); ctx.restore();
    }
    if (aP > 0) {
      const k = lin(t, c[5] + .6, s.e[5] - c[5] - 1.6);
      const pts = [[900, 1350], [360, 1350], [WX + 36, 1350], [WX + 36, 1262], [WX, 1262], [WX, 1040], [WX, -40], [WX + 30, -40], [1100, -40]].map(p => camP(cam, p[0], p[1]));
      ctx.save(); ctx.globalAlpha = aP; glowDot(ctx, pts, k, '#ffb84d');
      pathList(ctx, 1770, 250, 'FLUID PATH', ['Rock pores', 'Perforations', 'Wellbore', 'Pump intake', 'Valves and chamber', 'Tubing', 'Wellhead', 'Flowline'], k * 1.05, '#ffb84d', 'right'); ctx.restore();
    }
    L(WX, 470, -300, -60, 'Rod\ntransmits force', win(t, c[6] + 1.5, s.e[6]));
    L(WX + 13, 520, 300, 40, 'Fluid\nbetween rod and tubing', win(t, c[6] + 3, s.e[6]));
    L(WX + 23, 400, 300, -90, 'Tubing wall', win(t, c[6] + 3, s.e[6]));
  },
});

// ---------- 3. Rock ----------
function genField(seed, x0, y0, x1, y1, rmin, rmax, gap) {
  const R = rng(seed), gr = [];
  for (let k = 0; k < 6000; k++) {
    const r = rmin + R() * (rmax - rmin) * (k < 600 ? 1 : .5), x = x0 - 30 + R() * (x1 - x0 + 60), y = y0 - 30 + R() * (y1 - y0 + 60);
    if (gr.every(g => Math.hypot(g.x - x, g.y - y) > g.r + r + gap)) {
      const v = []; const n = 11; for (let i = 0; i < n; i++) v.push(.86 + R() * .22);
      gr.push({ x, y, r, v, rot: R() * TAU, sh: R(), wet: R() < .16 });
    }
  }
  const blobs = [], bub = [];
  for (let i = 0; i < 7; i++) blobs.push([x0 + R() * (x1 - x0), y0 + R() * (y1 - y0), 30 + R() * 30]);
  for (let i = 0; i < 70; i++) bub.push([x0 + R() * (x1 - x0), y0 + R() * (y1 - y0), 3 + R() * 6, R() * TAU]);
  // particle trajectories
  const paths = [];
  for (let i = 0; i < 90; i++) {
    let x = x0 - 20, y = y0 + R() * (y1 - y0); const p = [[x, y]];
    for (let st = 0; st < 700 && x < x1 + 20; st++) {
      let vx = 1, vy = 0;
      for (const g of gr) { const dx = x - g.x, dy = y - g.y, d = Math.hypot(dx, dy), m = g.r + 9; if (d < m + 26) { const f = clamp((m + 26 - d) / 26) * 1.6; vx += dx / d * f * .6; vy += (dy / d + (Math.abs(dy) < 4 ? (R() > .5 ? .6 : -.6) : 0)) * f; } }
      const n = Math.hypot(vx, vy) || 1; x += vx / n * 6; y += vy / n * 6; y = clamp(y, y0 + 4, y1 - 4); p.push([x, y]);
    }
    paths.push({ p, L: polyLen(p), ph: R() });
  }
  return { gr, blobs, bub, paths, x0, y0, x1, y1 };
}
const FLD = { A: genField(11, 110, 130, 1810, 905, 36, 66, 15), L: genField(23, 110, 190, 925, 905, 34, 60, 16), R: genField(37, 995, 190, 1810, 905, 15, 60, 2) };
function drawField(ctx, F, t, o = {}) {
  ctx.save(); rr(ctx, F.x0, F.y0, F.x1 - F.x0, F.y1 - F.y0, 22); ctx.clip();
  const g = ctx.createLinearGradient(0, F.y0, 0, F.y1); g.addColorStop(0, '#d0902c'); g.addColorStop(1, '#a8691a');
  ctx.fillStyle = g; ctx.fillRect(F.x0, F.y0, F.x1 - F.x0, F.y1 - F.y0);
  if (o.pulse) { ctx.fillStyle = `rgba(255,220,140,${.35 * o.pulse * (.6 + .4 * Math.sin(t * 4))})`; ctx.fillRect(F.x0, F.y0, F.x1 - F.x0, F.y1 - F.y0); }
  ctx.fillStyle = 'rgba(62,150,214,.85)'; for (const b of F.blobs) { ctx.beginPath(); ctx.arc(b[0], b[1], b[2], 0, TAU); ctx.fill(); }
  for (const b of F.bub) { ctx.fillStyle = 'rgba(232,250,248,.9)'; ctx.beginPath(); ctx.arc(b[0] + Math.sin(t * 1.3 + b[3]) * 3, b[1] + Math.cos(t * 1.1 + b[3]) * 3, b[2], 0, TAU); ctx.fill(); }
  if (o.flow > 0) for (const p of F.paths) {
    const tot = p.L[p.L.length - 1], d = ((p.ph + t * (o.speed ?? 110) / tot) % 1) * tot, q = polyAt(p.p, p.L, d);
    ctx.globalAlpha = o.flow; ctx.fillStyle = '#fff6dd'; ctx.beginPath(); ctx.arc(q[0], q[1], 6, 0, TAU); ctx.fill();
    const q2 = polyAt(p.p, p.L, d - 14); ctx.globalAlpha = o.flow * .45; ctx.beginPath(); ctx.arc(q2[0], q2[1], 4.5, 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;
  for (const gr of F.gr) {
    ctx.beginPath(); const n = gr.v.length;
    for (let i = 0; i <= n; i++) {
      const a0 = gr.rot + i / n * TAU, a1 = gr.rot + (i + .5) / n * TAU, r0 = gr.r * gr.v[i % n], r1 = gr.r * (gr.v[i % n] + gr.v[(i + 1) % n]) / 2 * 1.03;
      if (!i) ctx.moveTo(gr.x + Math.cos(a0) * r0, gr.y + Math.sin(a0) * r0);
      const a2 = gr.rot + (i + 1) / n * TAU, r2 = gr.r * gr.v[(i + 1) % n];
      ctx.quadraticCurveTo(gr.x + Math.cos(a1) * r1 * 1.04, gr.y + Math.sin(a1) * r1 * 1.04, gr.x + Math.cos(a2) * r2, gr.y + Math.sin(a2) * r2);
    }
    const l = 46 + gr.sh * 16 - (o.dark ?? 0) * 18;
    const gg = ctx.createRadialGradient(gr.x - gr.r * .3, gr.y - gr.r * .35, gr.r * .1, gr.x, gr.y, gr.r * 1.1);
    gg.addColorStop(0, `hsl(${32 + gr.sh * 10},26%,${l + 12}%)`); gg.addColorStop(1, `hsl(${28 + gr.sh * 10},24%,${l - 12}%)`);
    ctx.fillStyle = gg; ctx.fill();
    ctx.strokeStyle = gr.wet ? 'rgba(74,168,224,.95)' : 'rgba(40,26,10,.55)'; ctx.lineWidth = gr.wet ? 7 : 2.5; ctx.stroke();
  }
  ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,.16)'; ctx.lineWidth = 2; rr(ctx, F.x0, F.y0, F.x1 - F.x0, F.y1 - F.y0, 22); ctx.stroke();
}
SCENES.push({
  id: 'rock', title: 'Oil lives in rock pores', amb: 'micro',
  cues: [
    'Oil does not sit in underground lakes. It is held in the pores and fractures of rock, such as sandstone.',
    'Between the mineral grains there are gaps and narrow channels. They can hold oil, formation water and gas at the same time.',
    'Porosity tells how much void space the rock contains. Permeability tells how easily fluids move through connected pores.',
    'A rock may hold a lot of oil yet give it up slowly if the channels between the pores conduct fluid poorly.',
  ],
  draw(ctx, t, c, s) {
    const kS = pr(t, c[3] - .6, 1.2), half = (s.e[2] + c[2]) / 2;
    if (kS < 1) {
      ctx.save(); ctx.globalAlpha = 1 - kS;
      const z = 1.12 - .12 * pr(t, 0, 3); ctx.translate(960, 520); ctx.scale(z, z); ctx.translate(-960, -520);
      drawField(ctx, FLD.A, t, { pulse: win(t, c[2] + .3, half, .6), dark: win(t, c[2] + .3, half, .6), flow: lin(t, half, 1) });
      ctx.restore();
      txt(ctx, 'magnified ×200 · sandstone', 1790, 150, { size: 22, mono: true, align: 'right', color: '#fff', a: (1 - kS) * .8 });
      // legend
      const aL = win(t, c[1] + .5, s.e[1] + .3);
      if (aL > 0) {
        box(ctx, 1380, 190, 400, 250, { a: aL * .94, fill: 'rgba(11,16,22,.9)', stroke: 'rgba(255,255,255,.2)' });
        [['Rock grains', '#9a8562'], ['Oil', C.oil], ['Formation water', C.water], ['Gas', C.gas]].forEach((it, i) => {
          const a = aL * lin(t, c[1] + 1 + i * 1.3, .5);
          ctx.globalAlpha = a; ctx.fillStyle = it[1]; ctx.beginPath(); ctx.arc(1425, 235 + i * 54, 15, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
          txt(ctx, it[0], 1460, 235 + i * 54, { size: 30, weight: 600, a });
        });
      }
      const big = (a, h, sub) => { if (a <= 0) return; box(ctx, 150, 740, 760, 130, { a: a * .94, fill: 'rgba(11,16,22,.9)', stroke: C.accent }); txt(ctx, h, 185, 785, { size: 44, weight: 700, color: C.accent, a }); txt(ctx, sub, 185, 838, { size: 28, color: C.ink, a }); };
      big(win(t, c[2] + .3, half, .4), 'POROSITY', 'how much void space the rock has');
      big(win(t, half, s.e[2] + .2, .4), 'PERMEABILITY', 'how easily fluids can move');
    }
    if (kS > 0) {
      ctx.save(); ctx.globalAlpha = kS;
      drawField(ctx, FLD.L, t, { flow: 1, speed: 150 }); drawField(ctx, FLD.R, t, { flow: 1, speed: 22 });
      txt(ctx, 'Wide, connected channels', 518, 140, { size: 34, weight: 700, align: 'center', color: C.ok });
      txt(ctx, 'Narrow channels', 1402, 140, { size: 34, weight: 700, align: 'center', color: C.bad });
      box(ctx, 318, 815, 400, 62, { fill: 'rgba(11,16,22,.9)', stroke: C.ok }); txt(ctx, 'oil flows fast', 518, 846, { size: 30, weight: 600, align: 'center' });
      box(ctx, 1192, 815, 420, 62, { fill: 'rgba(11,16,22,.9)', stroke: C.bad }); txt(ctx, 'oil flows slowly', 1402, 846, { size: 30, weight: 600, align: 'center' });
      ctx.restore();
    }
  },
});

// ---------- 4. Inflow ----------
const INF = (() => { const R = rng(9), a = []; for (let i = 0; i < 170; i++) a.push({ sd: R() < .5 ? -1 : 1, y: 535 + R() * 250, ph: R(), pf: Math.floor(R() * 4) }); return a; })();
SCENES.push({
  id: 'inflow', title: 'Why fluid flows to the well', amb: 'under',
  cues: [
    ['What makes fluid move toward the well? A pressure difference.', 5],
    'When reservoir pressure is higher than the pressure at the bottom of the well, fluids flow toward it. This difference is called drawdown.',
    'The pump removes the fluid that has entered the well. The fluid level and bottomhole pressure drop, and inflow from the reservoir is sustained.',
    'Note: the pump does not have to enter the rock. It works inside the wellbore.',
  ],
  draw(ctx, t, c, s) {
    const X = 960, perf = [560, 620, 680, 740];
    ctx.fillStyle = '#262b30'; ctx.fillRect(0, 0, W, 520); ctx.fillStyle = '#20242a'; ctx.fillRect(0, 800, W, 280);
    ctx.fillStyle = '#6b5230'; ctx.fillRect(0, 520, W, 280);
    const R = rng(3); for (let i = 0; i < 500; i++) { ctx.fillStyle = R() > .5 ? 'rgba(233,166,59,.5)' : 'rgba(40,28,14,.45)'; ctx.beginPath(); ctx.arc(R() * W, 526 + R() * 268, 2 + R() * 4, 0, TAU); ctx.fill(); }
    // pressure field
    const aF = pr(t, c[0] + 1.5, 1.5);
    for (const sd of [-1, 1]) {
      const g = ctx.createLinearGradient(X + sd * 80, 0, X + sd * 960, 0);
      g.addColorStop(0, `rgba(73,182,255,${.62 * aF})`); g.addColorStop(.45, `rgba(190,140,160,${.3 * aF})`); g.addColorStop(1, `rgba(255,110,60,${.6 * aF})`);
      ctx.fillStyle = g; ctx.fillRect(sd < 0 ? 0 : X + 80, 520, 880, 280);
    }
    // particles
    const k2 = lin(t, c[2] + 1, 3), aD = lin(t, c[1], 1.5), ph = t * .05 + .09 * (t < c[2] + 1 ? 0 : t < c[2] + 3 ? (t - c[2] - 1) ** 2 / 4 : t - c[2] - 2);
    for (const d of INF) {
      const u = (d.ph + ph) % 1, dist = 84 + 860 * (1 - u * u), y = lerp(d.y, perf[d.pf], u ** 4);
      ctx.globalAlpha = aD * Math.min(1, u * 8, (1 - u) * 14); ctx.fillStyle = '#fff3d6';
      ctx.beginPath(); ctx.arc(X + d.sd * dist, y, 5, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;
    // well
    const lvl = lerp(150, 262, pr(t, c[2] + 1, 4));
    ctx.fillStyle = C.cement; ctx.fillRect(X - 86, 0, 172, 850); ctx.fillStyle = '#4c5a67'; ctx.fillRect(X - 70, 0, 140, 842);
    ctx.fillStyle = '#131a21'; ctx.fillRect(X - 60, 0, 120, 834);
    ctx.fillStyle = '#8a5a1c'; ctx.fillRect(X - 60, lvl, 120, 834 - lvl);
    for (const py of perf) for (const sd of [-1, 1]) { ctx.fillStyle = C.oil; ctx.beginPath(); ctx.moveTo(X + sd * 58, py - 9); ctx.lineTo(X + sd * 190, py); ctx.lineTo(X + sd * 58, py + 9); ctx.closePath(); ctx.fill(); }
    const th = TH(GT), up = pjDir(th) > 0 ? 1 : 0, run = lin(t, c[2] - .5, 1);
    ctx.fillStyle = C.oil; ctx.fillRect(X - 22, 0, 44, 300); ctx.fillStyle = '#93a4b3'; ctx.fillRect(X - 29, 0, 7, 300); ctx.fillRect(X + 22, 0, 7, 300);
    drawPump(ctx, { x: X, y: 300, w: 44, h: 175, wall: 7, p: run ? pjS(th) : .2, sv: run * up, tv: run * (1 - up), t, up: run * up, dn: run * (1 - up), rodTop: 0, tail: 24 });
    if (aD > 0) { chev(ctx, X - 44, 800, 500, t, { a: aD * .8, s: 6, gap: 36, speed: 30 }); chev(ctx, X + 44, 800, 500, t, { a: aD * .8, s: 6, gap: 36, speed: 30 }); }
    // pressure labels
    const a1 = win(t, c[1] + .3, s.e[3]);
    if (a1 > 0) {
      ctx.globalAlpha = a1;
      box(ctx, 70, 610, 330, 100, { fill: 'rgba(11,16,22,.88)', stroke: C.hot }); subp(ctx, 96, 643, 'p', 'res', 44, C.hot); txt(ctx, 'reservoir pressure', 96, 688, { size: 24, color: C.ink }); txt(ctx, 'HIGHER', 300, 643, { size: 26, weight: 700, color: C.hot });
      box(ctx, 1080, 610, 330, 100, { fill: 'rgba(11,16,22,.88)', stroke: C.cold }); subp(ctx, 1106, 643, 'p', 'wf', 44, C.cold); txt(ctx, 'bottomhole pressure', 1106, 688, { size: 24, color: C.ink }); txt(ctx, 'LOWER', 1310, 643, { size: 26, weight: 700, color: C.cold });
      arrow(ctx, 430, 660, 640, 660, { color: '#fff', w: 6, a: .9 }); arrow(ctx, 1490, 660, 1440, 660, { color: '#fff', w: 6, a: 0 });
      ctx.globalAlpha = 1;
      // formula
      const aF2 = win(t, c[1] + 4, s.e[3]);
      box(ctx, 110, 170, 640, 170, { a: aF2 * .95, fill: 'rgba(11,16,22,.9)', stroke: 'rgba(255,255,255,.2)' });
      ctx.globalAlpha = aF2; let x = 150; txt(ctx, 'Δp =', x, 228, { size: 60, mono: true, weight: 700 }); x += 190;
      x += subp(ctx, x, 228, 'p', 'res', 60, C.hot) + 16; txt(ctx, '−', x, 228, { size: 60, mono: true, weight: 700 }); x += 56; subp(ctx, x, 228, 'p', 'wf', 60, C.cold);
      txt(ctx, 'drawdown', 150, 300, { size: 30, color: C.dim }); ctx.globalAlpha = 1;
    }
    const a2 = win(t, c[2] + 1, s.e[2] + .2);
    if (a2 > 0) {
      ctx.globalAlpha = a2; ctx.strokeStyle = C.accent; ctx.setLineDash([10, 8]); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X - 60, lvl); ctx.lineTo(X + 190, lvl); ctx.stroke(); ctx.setLineDash([]);
      txt(ctx, 'fluid level ↓', X + 205, lvl, { size: 28, weight: 600, color: C.accent });
      box(ctx, 1190, 330, 620, 80, { fill: 'rgba(11,16,22,.9)', stroke: C.accent });
      txt(ctx, 'level ↓   →   p wf ↓   →   inflow ↑', 1500, 370, { size: 30, weight: 600, align: 'center' }); ctx.globalAlpha = 1;
    }
    const a3 = win(t, c[3] + .3, s.e[3]);
    label(ctx, X + 30, 390, X + 300, 300, 'The pump is inside the wellbore', { a: a3 });
    label(ctx, X - 150, 620, X - 330, 440, 'Connected to the reservoir\nthrough perforations', { a: a3 });
  },
});

// ---------- 5. Perforation and cross-section ----------
SCENES.push({
  id: 'perf', title: 'Connecting the well to the reservoir', amb: 'under',
  cues: [
    'After drilling, a steel casing string is run into the hole and the space behind it is cemented.',
    'Then the casing is perforated opposite the reservoir: shaped charges punch channels through steel and cement and on into the rock.',
    'Now the path is open: from connected pores, along the perforation tunnels, into the casing.',
    'Here is a horizontal slice above the pump. From outside in: rock, cement, casing, annulus, tubing, fluid and the rod.',
    'The annulus is the gap between the tubing and the casing. Do not confuse it with the cement sheath outside the casing.',
  ],
  events(s) { return [0, 1, 2].map(i => ({ t: s.c[1] + 3.2 + i * .7, type: 'bang' })); },
  draw(ctx, t, c, s) {
    const X = 500, x0 = 100, x1 = 900, y0 = 130, y1 = 910, sy = [430, 545, 660];
    ctx.save(); rr(ctx, x0, y0, x1 - x0, y1 - y0, 20); ctx.clip();
    ctx.fillStyle = '#262b30'; ctx.fillRect(x0, y0, 800, 200); ctx.fillStyle = '#6b5230'; ctx.fillRect(x0, 330, 800, 430); ctx.fillStyle = '#20242a'; ctx.fillRect(x0, 760, 800, 160);
    const R = rng(4); for (let i = 0; i < 420; i++) { ctx.fillStyle = R() > .5 ? 'rgba(233,166,59,.5)' : 'rgba(40,28,14,.45)'; ctx.beginPath(); ctx.arc(x0 + R() * 800, 336 + R() * 418, 2 + R() * 4, 0, TAU); ctx.fill(); }
    ctx.fillStyle = '#10161c'; ctx.fillRect(X - 112, y0, 224, 800);
    // cement (bottom to top)
    const kc = pr(t, c[0] + 4.5, 3), kcas = pr(t, c[0] + .8, 3);
    ctx.fillStyle = C.cement; const ch = 780 * kc; ctx.fillRect(X - 112, y1 - ch, 22, ch); ctx.fillRect(X + 90, y1 - ch, 22, ch);
    // casing
    ctx.fillStyle = '#7c8c9a'; const cy = y0 - 800 * (1 - kcas); ctx.fillRect(X - 90, cy, 13, 800); ctx.fillRect(X + 77, cy, 13, 800);
    // liquid inside after perforating
    const kfill = pr(t, c[2] + .5, 5); if (kfill > 0) { ctx.fillStyle = '#8a5a1c'; ctx.fillRect(X - 77, y1 - 560 * kfill, 154, 560 * kfill); }
    // tunnels
    sy.forEach((y, i) => {
      const tb = c[1] + 3.2 + i * .7, k = lin(t, tb, .25);
      if (k > 0) for (const sd of [-1, 1]) {
        ctx.fillStyle = t > c[2] ? C.oil : '#10161c'; ctx.beginPath(); ctx.moveTo(X + sd * 76, y - 13); ctx.lineTo(X + sd * (76 + 205 * k), y); ctx.lineTo(X + sd * 76, y + 13); ctx.closePath(); ctx.fill();
        const f = 1 - lin(t, tb, .5); if (f > 0) { ctx.save(); ctx.globalAlpha = f; ctx.shadowColor = '#ffb040'; ctx.shadowBlur = 40; ctx.fillStyle = '#fff4c8'; ctx.beginPath(); ctx.moveTo(X + sd * 30, y - 16); ctx.lineTo(X + sd * (76 + 230 * k), y); ctx.lineTo(X + sd * 30, y + 16); ctx.closePath(); ctx.fill(); ctx.restore(); }
      }
    });
    // perforating gun
    const gy = kf(t, [[c[1] + .5, -700], [c[1] + 2.7, 0], [c[1] + 5.8, 0], [c[1] + 8, -760]]);
    if (t > c[1] + .4 && t < c[1] + 8) {
      ctx.fillStyle = '#39434d'; rr(ctx, X - 34, 370 + gy, 68, 350, 14); ctx.fill(); ctx.fillStyle = '#93a4b3'; ctx.fillRect(X - 2, y0 - 10, 4, 380 + gy - y0 + 10);
      sy.forEach((y, i) => { const fired = t > c[1] + 3.2 + i * .7; for (const sd of [-1, 1]) { ctx.fillStyle = fired ? '#20262c' : C.hot; ctx.beginPath(); ctx.moveTo(X + sd * 4, y + gy - 14); ctx.lineTo(X + sd * 30, y + gy); ctx.lineTo(X + sd * 4, y + gy + 14); ctx.closePath(); ctx.fill(); } });
    }
    // inflow
    const aD = lin(t, c[2] + .3, 1);
    if (aD > 0) sy.forEach((y, i) => { for (const sd of [-1, 1]) { dots(ctx, [[X + sd * 390, y + (i - 1) * 60], [X + sd * 280, y], [X + sd * 60, y], [X + sd * 40, y - 120]], t, { a: aD, color: '#fff3d6', speed: 55, gap: 30, r: 5 }); } });
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,.16)'; ctx.lineWidth = 2; rr(ctx, x0, y0, 800, 780, 20); ctx.stroke();
    label(ctx, X + 84, 250, X + 210, 195, 'Casing', { a: win(t, c[0] + 1.5, s.e[0]) });
    label(ctx, X - 101, 820, X - 220, 850, 'Cement', { a: win(t, c[0] + 5, s.e[0]) });
    label(ctx, X + 34, 400, X + 200, 250, 'Perforating gun\nwith shaped charges', { a: win(t, c[1] + 2.4, c[1] + 6) });
    label(ctx, X + 200, 545, X + 240, 250, 'Perforation tunnels', { a: win(t, c[2] + .5, s.e[2]) });
    label(ctx, X - 300, 500, X - 250, 250, 'Reservoir', { a: win(t, c[2] + .5, s.e[2]), align: 'right' });
    // horizontal cross-section
    const aR = lin(t, c[3] - .3, .8);
    if (aR > 0) {
      const cx = 1235, cy0 = 520, dur = s.e[3] - c[3] - 1, pulse = t > c[4] + .5 && t < s.e[4] ? .5 + .5 * Math.sin((t - c[4]) * 4) : 0;
      const rings = [[null, '#4a3d2e', 'Rock', 262], [232, C.cement, 'Cement', 216], [200, '#7c8c9a', 'Casing', 192], [184, '#18222b', 'Annulus', 140], [98, '#93a4b3', 'Tubing', 90], [82, C.oil, 'Fluid', 56], [27, C.steelL, 'Rod', 8]];
      rings.forEach((rg, i) => {
        const a = aR * lin(t, c[3] + .2 + i * dur / 7.4, .6); if (a <= 0) return;
        ctx.globalAlpha = a; ctx.fillStyle = rg[1];
        if (rg[0] === null) { rr(ctx, cx - 275, cy0 - 275, 550, 550, 26); ctx.fill(); } else { ctx.beginPath(); ctx.arc(cx, cy0, rg[0], 0, TAU); ctx.fill(); }
        if (i === 3 && pulse) { ctx.globalAlpha = a * pulse * .6; ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(cx, cy0, 184, 0, TAU); ctx.arc(cx, cy0, 98, 0, TAU, true); ctx.fill(); }
        ctx.globalAlpha = 1;
      });
      rings.forEach((rg, i) => {
        const a = aR * lin(t, c[3] + .2 + i * dur / 7.4, .6), an = -1.0 + i * .33, ty = 250 + i * 86;
        const hot = t > c[4] && (i === 3 || i === 1);
        label(ctx, cx + Math.cos(an) * rg[3], cy0 + Math.sin(an) * rg[3], 1560, ty, rg[2], { a: a * (t > c[4] && !hot ? .35 : 1), color: hot && i === 3 ? C.accent : hot ? C.bad : C.accent, size: 27 });
      });
      txt(ctx, 'HORIZONTAL SECTION', cx, 180, { size: 24, mono: true, weight: 700, align: 'center', color: C.dim, a: aR });
    }
  },
});
