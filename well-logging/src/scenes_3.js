// Tool scenes 2: sonic, density, neutron.

// ---------- 9. Sonic ----------
const SON = { P: 2.2, T: 230, R1: -30, R2: -150, vm: 300 };
function sonicPhysics(ctx, t, d) {
  const zv = ZV(d), hx = PX.cx, hw = 78, ym = Y(zv, d), dt = logAt('DT', d);
  const vf = SON.vm * 189 / dt, tau = t % SON.P, yT = ym + SON.T;
  const tArr = dy => (SON.T - dy) / vf + 2 * 60 / SON.vm; // up the wall + mud legs
  const t1 = tArr(SON.R1), t2 = tArr(SON.R2);
  zoomBox(ctx, () => {
    drawFormation(ctx, PX.x0, PX.x1, zv); drawBorehole(ctx, hx, zv, { hw });
    // compressional wave in the rock (fast) and in the mud (slow)
    const fade = clamp(1 - tau / 1.3);
    ctx.save(); ctx.beginPath(); ctx.rect(PX.x0, PX.y0, PX.x1 - PX.x0, PX.y1 - PX.y0); ctx.rect(hx + hw, PX.y0, -2 * hw, PX.y1 - PX.y0); ctx.clip('evenodd');
    for (let k = 0; k < 3; k++) { const r = vf * Math.max(0, tau - k * .03); ctx.strokeStyle = `rgba(196,155,255,${fade * (.9 - k * .25)})`; ctx.lineWidth = 4 - k; ctx.beginPath(); ctx.arc(hx, yT, r, 0, TAU); ctx.stroke(); }
    ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(hx - hw, PX.y0, 2 * hw, PX.y1 - PX.y0); ctx.clip();
    ctx.strokeStyle = `rgba(200,220,240,${fade * .7})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(hx, yT, SON.vm * tau, 0, TAU); ctx.stroke();
    // head waves leaking back into the mud from the wall
    const yf = yT - vf * tau + 40;
    if (yf > PX.y0 && tau > .15) for (const sd of [-1, 1]) { ctx.strokeStyle = `rgba(196,155,255,${fade})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(hx + sd * hw, yf); ctx.lineTo(hx + sd * 28, yf + 70); ctx.stroke(); }
    ctx.restore();
    drawSonde(ctx, hx, ym, { w: 52, up: 420, down: 420, cable: null, joints: [60, 120] });
    for (const [dy, n, ta, col] of [[SON.T, 'T', -1, C.dt], [SON.R1, 'R1', t1, C.accent], [SON.R2, 'R2', t2, C.accent]]) {
      const fl = ta < 0 ? Math.exp(-tau / .12) : (tau > ta ? Math.exp(-(tau - ta) / .15) : 0);
      ctx.save(); ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 10 + 30 * fl; ctx.globalAlpha = .55 + .45 * fl; rr(ctx, hx - 27, ym + dy - 10, 54, 20, 5); ctx.fill(); ctx.restore();
      txt(ctx, n, hx - 40, ym + dy, { size: 22, mono: true, weight: 700, align: 'right', color: col });
    }
    // spacing bracket
    ctx.strokeStyle = '#d7dde3'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(hx + 40, ym + SON.R1); ctx.lineTo(hx + 52, ym + SON.R1); ctx.lineTo(hx + 52, ym + SON.R2); ctx.lineTo(hx + 40, ym + SON.R2); ctx.stroke();
    txt(ctx, 'spacing', hx + 60, ym + (SON.R1 + SON.R2) / 2, { size: 18, mono: true, color: '#d7dde3' });
  });
  // receiver waveforms
  const bx = PX.x0 + 26, by = PX.y1 - 250, bw = 300, bh = 226, T0 = 1.2;
  box(ctx, bx, by, bw, bh, { r: 12, fill: 'rgba(9,13,18,.92)', stroke: C.dt, lw: 1.5 });
  txt(ctx, 'RECEIVED WAVEFORMS', bx + 16, by + 24, { size: 15, mono: true, weight: 700, color: C.dim });
  const tx = tt => bx + 60 + tt / T0 * (bw - 80);
  [[t1, 'R1', by + 80], [t2, 'R2', by + 150]].forEach(([ta, n, yy]) => {
    txt(ctx, n, bx + 20, yy, { size: 18, mono: true, weight: 700, color: C.accent });
    ctx.strokeStyle = '#e6ebf0'; ctx.lineWidth = 2; ctx.beginPath();
    for (let tt = 0; tt <= Math.min(tau, T0); tt += .004) { const a = tt < ta ? vnoise(tt * 300, 3) * .05 : Math.sin((tt - ta) * 60) * Math.exp(-(tt - ta) / .18); ctx.lineTo(tx(tt), yy - a * 26); }
    ctx.stroke();
    if (tau > ta) { ctx.strokeStyle = C.dt; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(tx(ta), by + 50); ctx.lineTo(tx(ta), by + 180); ctx.stroke(); ctx.setLineDash([]); }
  });
  if (tau > t2) { arrow(ctx, tx(t1), by + 196, tx(t2), by + 196, { color: C.dt, w: 3, head: 10 }); arrow(ctx, tx(t2), by + 196, tx(t1), by + 196, { color: C.dt, w: 3, head: 10 }); txt(ctx, 'Δt', (tx(t1) + tx(t2)) / 2, by + 178, { size: 20, weight: 700, align: 'center', color: C.dt }); }
  readout(ctx, PX.x1 - 290, PX.y1 - 120, 'INTERVAL TRANSIT TIME', dt.toFixed(0) + ' µs/ft', C.dt, { w: 260 });
}
SCENES.push({
  id: 'sonic', title: 'Sonic (acoustic) log', amb: 'lab',
  cues: [
    'Sonic, or acoustic, logging times sound. A transmitter fires a short pulse, around twenty kilohertz, many times a second.',
    { t: 'The wave travels along the borehole wall to two receivers. Their arrival-time difference, over the spacing, gives the transit time, Δt.', say: 'The wave travels along the borehole wall to two receivers. Their arrival-time difference, over the spacing, gives the transit time, delta-t.' },
    { t: 'Sound is fast in tight rock and slower through pores, so Δt rises with porosity. Shear waves also give rock strength.', say: 'Sound is fast in tight rock and slower through pores, so delta-t rises with porosity. Shear waves also give rock strength.' },
  ],
  events(s) { const e = []; for (let t = 0; t < s.dur - .5; t += SON.P) e.push({ t, type: 'ping' }); return e; },
  draw(ctx, t, c, s) {
    const d = toolDepth(t, s);
    drawProbe(ctx, t, s, {
      depth: d, track: { x: PVX.tr, w: PVX.trw, curves: [cv('DT')] },
      tool: (ctx, x, y) => drawSonde(ctx, x, y, { w: 24, up: 120, down: 110, cable: PV.y0 - 40, parts: [{ dy: 80, h: 10, color: C.dt, glow: 12 }, { dy: -10, h: 8, color: C.accent }, { dy: -40, h: 8, color: C.accent }] }),
    });
    panel(ctx, PX.x0, PX.y0, PVX.pw, PX.y1 - PX.y0, 'TIMING A SOUND PULSE');
    sonicPhysics(ctx, t, d);
    const a2 = lin(t, c[2] - .2, .6);
    if (a2 > 0) {
      ctx.save(); ctx.globalAlpha = a2;
      box(ctx, PX.x0 + 30, PX.y0 + 60, PVX.pw - 60, 150, { r: 14, fill: 'rgba(9,13,18,.93)', stroke: C.dt, lw: 1.5 });
      txt(ctx, 'Wyllie:  φ = (Δt − Δt_ma) / (Δt_f − Δt_ma)', PX.cx, PX.y0 + 100, { size: 24, mono: true, weight: 700, align: 'center', color: C.accent });
      txt(ctx, 'tight limestone ≈ 50 µs/ft  ·  porous sandstone ≈ 93 µs/ft', PX.cx, PX.y0 + 146, { size: 22, align: 'center' });
      txt(ctx, 'shear waves → rock strength and stability', PX.cx, PX.y0 + 182, { size: 19, align: 'center', color: C.dim });
      ctx.restore();
    }
  },
});

// ---------- 10. Density ----------
function densityPhysics(ctx, t, d) {
  const zv = ZV(d), hx = PX.cx, hw = 78, ym = Y(zv, d), rho = logAt('RHOB', d);
  const wall = hx + holeHW(d, hw), tx = wall - 34, yS = ym + 170, yN = ym + 40, yF = ym - 110;
  const keep = clamp(1.9 - (rho - 1.9) * 1.25, .25, 1);
  zoomBox(ctx, () => {
    drawFormation(ctx, PX.x0, PX.x1, zv); drawBorehole(ctx, hx, zv, { hw });
    // caliper arm pushing the pad against the wall
    ctx.strokeStyle = '#9fb0c0'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(tx - 20, ym - 40); ctx.lineTo(hx - holeHW(d, hw) + 6, ym + 40); ctx.lineTo(tx - 20, ym + 120); ctx.stroke();
    drawSonde(ctx, tx - 6, ym, { w: 44, up: 420, down: 420, cable: null });
    ctx.fillStyle = '#7d8c99'; rr(ctx, wall - 18, ym - 160, 18, 360, 6); ctx.fill();
    // photon random walks: source -> scattering on electrons -> detectors
    const dt = .05, life = .9;
    for (let j = Math.max(0, Math.floor((t - life) / dt)); j <= Math.floor(t / dt); j++) {
      const R = rng(j * 131 + 17), k = (t - j * dt) / life, det = R() < .5 ? yN : yF, hit = R() < keep * (det === yF ? .7 : 1);
      const n = 3 + Math.floor(R() * 2), pts = [[wall, yS]];
      for (let i = 1; i < n; i++) pts.push([wall + 30 + R() * 230, lerp(yS, det, i / n) + (R() - .5) * 160]);
      pts.push(hit ? [wall, det] : [wall + 140 + R() * 200, lerp(yS, det, 1) + (R() - .5) * 300]);
      const L = polyLen(pts), hd = k * L[L.length - 1];
      ctx.strokeStyle = 'rgba(255,224,102,.55)'; ctx.lineWidth = 2; ctx.beginPath();
      for (let s2 = Math.max(0, hd - 90); s2 <= hd; s2 += 6) { const q = polyAt(pts, L, s2); ctx.lineTo(q[0], q[1]); }
      ctx.stroke();
      const q = polyAt(pts, L, hd); glowDot(ctx, q[0], q[1], 4, C.gamma, k < .98 ? 1 : 0);
      for (let i = 1; i < pts.length - 1; i++) if (hd > L[i] && hd - L[i] < 40) glowDot(ctx, pts[i][0], pts[i][1], 6, '#ffffff', 1 - (hd - L[i]) / 40);
    }
    for (const [yy, n, col] of [[yS, 'Cs-137 source', '#ff8a5c'], [yN, 'near detector', C.accent], [yF, 'far detector', C.accent]]) { ctx.save(); ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 16; rr(ctx, wall - 16, yy - 12, 14, 24, 4); ctx.fill(); ctx.restore(); chip(ctx, tx - 50, yy, n, { align: 'right', size: 18, color: col }); }
    chip(ctx, PX.x0 + 30, PX.y0 + 84, 'white flashes: gamma rays scattering off electrons', { size: 18, color: '#e6ebf0' });
  });
  readout(ctx, PX.x0 + 30, PX.y1 - 120, 'BULK DENSITY ρb', rho.toFixed(2) + ' g/cm³', C.rhob, { w: 290 });
  // count-rate bars
  const bx = PX.x1 - 300, by = PX.y1 - 130;
  box(ctx, bx, by, 270, 104, { r: 12, fill: 'rgba(9,13,18,.9)', stroke: '#243240', lw: 1.5 });
  [['near', keep], ['far', keep * .7]].forEach(([n, v], i) => { txt(ctx, n, bx + 16, by + 32 + i * 40, { size: 18, mono: true, weight: 700, color: C.dim }); ctx.fillStyle = C.accent; rr(ctx, bx + 80, by + 22 + i * 40, 170 * v, 18, 6); ctx.fill(); });
}
SCENES.push({
  id: 'density', title: 'Density log', amb: 'lab',
  cues: [
    'The density tool presses a pad against the wall. A caesium source fires gamma rays that scatter off electrons in the rock.',
    'Denser rock has more electrons, so fewer gamma rays reach the detectors. Near and far detectors correct for the mudcake.',
    { t: 'Bulk density gives porosity: matrix density is 2.65 g/cm³ for sandstone, 2.71 for limestone.', say: 'Bulk density gives porosity: matrix density is two point six five for sandstone, two point seven one for limestone.' },
  ],
  events(s) { return countEvents(s, 'RHOB', r => clamp(1.9 - (r - 1.9) * 1.25, .25, 1) * 14, 'click', { seed: 9 }); },
  draw(ctx, t, c, s) {
    const d = toolDepth(t, s);
    drawProbe(ctx, t, s, {
      depth: d, track: { x: PVX.tr, w: PVX.trw, curves: [cv('RHOB')] },
      tool: (ctx, x, y) => drawSonde(ctx, x + 10, y, { w: 22, up: 110, down: 70, cable: PV.y0 - 40, parts: [{ dy: 30, h: 8, color: '#ff8a5c', glow: 10 }, { dy: 0, h: 8, color: C.accent }, { dy: -30, h: 8, color: C.accent }] }),
    });
    panel(ctx, PX.x0, PX.y0, PVX.pw, PX.y1 - PX.y0, 'GAMMA-GAMMA DENSITY');
    densityPhysics(ctx, t, d);
    const a2 = lin(t, c[2] - .2, .6);
    if (a2 > 0) {
      ctx.save(); ctx.globalAlpha = a2;
      box(ctx, PX.x0 + 30, PX.y0 + 60, PVX.pw - 60, 150, { r: 14, fill: 'rgba(9,13,18,.93)', stroke: C.rhob, lw: 1.5 });
      txt(ctx, 'φ = (ρmatrix − ρb) / (ρmatrix − ρfluid)', PX.cx, PX.y0 + 100, { size: 26, mono: true, weight: 700, align: 'center', color: C.accent });
      txt(ctx, 'sandstone 2.65  ·  limestone 2.71  ·  dolomite 2.87 g/cm³', PX.cx, PX.y0 + 146, { size: 22, align: 'center' });
      txt(ctx, 'oil sand: ρb = 2.31  →  φ ≈ 21 %', PX.cx, PX.y0 + 182, { size: 20, align: 'center', color: C.dim });
      ctx.restore();
    }
  },
});

// ---------- 11. Neutron ----------
const HATOMS = (() => { const R = rng(55), a = []; for (let i = 0; i < 5200; i++) { const d = LD0 + R() * (LD1 - LD0), x = 20 + R() * 380; if (R() < clamp(logAt('NPHI', d) / .4, .02, 1)) a.push([x, d, R() < .5 ? -1 : 1]); } return a; })();
function neutronPhysics(ctx, t, d, cmp) {
  const zv = ZV(d), hx = PX.cx, hw = 78, ym = Y(zv, d), np = logAt('NPHI', d);
  const wall = hx + holeHW(d, hw), tx = wall - 30, yS = ym + 170, yN = ym + 50, yF = ym - 110;
  const step = 22 + 70 * clamp(1 - np / .35);
  zoomBox(ctx, () => {
    drawFormation(ctx, PX.x0, PX.x1, zv); drawBorehole(ctx, hx, zv, { hw });
    for (const [x, dd, sd] of HATOMS) { if (dd < zv.d0 || dd > zv.d1) continue; const px = sd > 0 ? wall + x : hx - holeHW(dd, hw) - x; glowDot(ctx, px, Y(zv, dd), 3.2, '#7cc8ff', .75); }
    drawSonde(ctx, tx, ym, { w: 46, up: 420, down: 420, cable: null });
    const dt = .07, life = 1.4;
    for (let j = Math.max(0, Math.floor((t - life) / dt)); j <= Math.floor(t / dt); j++) {
      const R = rng(j * 977 + 5), k = (t - j * dt) / life, pts = [[wall, yS]];
      let x = wall, y = yS, a = (R() - .5) * 1.6;
      for (let i = 0; i < 9; i++) { const L = step * (1 - i * .07) * (.6 + R() * .8); a += (R() - .5) * 2.4; x = Math.max(wall + 8, x + Math.cos(a) * L); y += Math.sin(a) * L - 6; pts.push([x, y]); }
      const L = polyLen(pts), hd = k * L[L.length - 1], q = polyAt(pts, L, hd);
      ctx.strokeStyle = 'rgba(232,244,255,.35)'; ctx.lineWidth = 1.6; ctx.beginPath();
      for (let s2 = Math.max(0, hd - 70); s2 <= hd; s2 += 5) { const p = polyAt(pts, L, s2); ctx.lineTo(p[0], p[1]); } ctx.stroke();
      const hot = clamp(1 - k * 1.3);
      glowDot(ctx, q[0], q[1], 4.5, hot > .3 ? '#ffffff' : '#7cc8ff', k < .97 ? 1 : 0);
      if (k > .94) glowDot(ctx, q[0], q[1], 10, C.gamma, (1 - k) / .06);
    }
    for (const [yy, n, col] of [[yS, 'neutron source', '#ffffff'], [yN, 'near detector', C.nphi], [yF, 'far detector', C.nphi]]) { ctx.save(); ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 16; rr(ctx, wall - 16, yy - 12, 14, 24, 4); ctx.fill(); ctx.restore(); chip(ctx, tx - 46, yy, n, { align: 'right', size: 18, color: col }); }
  });
  chip(ctx, PX.x0 + 28, PX.y0 + 84, 'blue dots: hydrogen in the pore fluid', { color: '#7cc8ff', size: 18 });
  readout(ctx, PX.x0 + 30, PX.y1 - 120, 'NEUTRON POROSITY', (np * 100).toFixed(0) + ' %', C.nphi, { w: 270 });
  if (cmp > 0) {
    ctx.save(); ctx.globalAlpha = cmp;
    box(ctx, PX.x1 - 400, PX.y1 - 220, 370, 196, { r: 14, fill: 'rgba(9,13,18,.93)', stroke: C.nphi, lw: 1.5 });
    txt(ctx, 'Gas', PX.x1 - 376, PX.y1 - 186, { size: 24, weight: 700, color: '#cfeee0' });
    txt(ctx, 'little hydrogen → reads too low', PX.x1 - 376, PX.y1 - 154, { size: 20, color: '#d7dde3' });
    txt(ctx, 'Shale', PX.x1 - 376, PX.y1 - 106, { size: 24, weight: 700, color: '#c9c2a8' });
    txt(ctx, 'bound water → reads too high', PX.x1 - 376, PX.y1 - 74, { size: 20, color: '#d7dde3' });
    ctx.restore();
  }
}
SCENES.push({
  id: 'neutron', title: 'Neutron log', amb: 'lab',
  cues: [
    'The neutron tool emits fast neutrons. They slow down fastest by hitting hydrogen nuclei, which have almost the same mass.',
    'Water and oil are rich in hydrogen, so in liquid-filled rock the neutron count follows porosity.',
    'Gas holds little hydrogen, so the neutron reads low in gas zones. Shale holds bound water, so there it reads high.',
  ],
  events(s) { return countEvents(s, 'NPHI', n => 4 + (1 - n / .4) * 10, 'click', { seed: 13 }); },
  draw(ctx, t, c, s) {
    const d = toolDepth(t, s);
    drawProbe(ctx, t, s, {
      depth: d, track: { x: PVX.tr, w: PVX.trw, curves: [cv('NPHI', { dash: [] })] },
      tool: (ctx, x, y) => drawSonde(ctx, x + 10, y, { w: 22, up: 110, down: 70, cable: PV.y0 - 40, parts: [{ dy: 30, h: 8, color: '#ffffff', glow: 10 }, { dy: 0, h: 8, color: C.nphi }, { dy: -30, h: 8, color: C.nphi }] }),
    });
    panel(ctx, PX.x0, PX.y0, PVX.pw, PX.y1 - PX.y0, 'NEUTRONS AND HYDROGEN');
    neutronPhysics(ctx, t, d, lin(t, c[2] - .2, .6));
  },
});
