// Scenes 10-13: lifting to the surface, gathering system, real-world operation, summary.

// ---------- 10. Many cycles ----------
const LB = (() => { const R = rng(31), a = []; for (let i = 0; i < 46; i++) a.push({ x: (R() < .5 ? -1 : 1) * (14 + R() * 30), ph: R(), w: R() * TAU }); return a; })();
SCENES.push({
  id: 'lift', title: 'From the pump to the surface', amb: 'under',
  cues: [
    'One stroke does not carry a drop from the pump to the wellhead. Each cycle adds a new charge to the tubing and pushes everything above it a little higher.',
    'Let us follow one charge in fast-forward. It takes hundreds of strokes to travel the whole string.',
    'The pump has to overcome the weight of this column. A 1,000-metre column of liquid presses down with about 88 bar.',
    'As the fluid rises, pressure drops; gas comes out of the oil and expands.',
  ],
  draw(ctx, t, c, s) {
    const X = 520, yT = 150, yB = 690, bh = 20, T1 = c[1] + 1, T2 = T1 + 4.7;
    const stepf = n => Math.floor(n) + ease(clamp((n % 1) * 2));
    const o1 = stepf(T1 / 3), o2 = o1 + 1.25 * 4.7 * 4.7;
    const off = t < T1 ? stepf(t / 3) : t < T2 ? o1 + 1.25 * (t - T1) ** 2 : o2 + (t - T2) * .5;
    const ff = t > T1 && t < T2, count = t < T1 ? Math.floor(t / 3 + .5) : Math.floor(o1 + (Math.min(off, o2) - o1) * 12 + (t > T2 ? (t - T2) / 3 : 0));
    const sp = t < T1 ? (t / 3) % 1 : (t * (ff ? 2 : 1 / 3)) % 1, p = sp < .5 ? ease(sp * 2) : 1 - ease(sp * 2 - 1), upS = sp < .5;
    // column
    ctx.fillStyle = '#131a21'; ctx.fillRect(X - 55, yT - 40, 110, yB - yT + 40);
    ctx.save(); ctx.beginPath(); ctx.rect(X - 55, yT - 40, 110, yB - yT + 40); ctx.clip();
    const H = 3;
    for (let i = Math.floor(off) + 1; i > off - 32; i--) {
      const y = yB - (off - i) * bh - bh; if (y > yB) continue;
      ctx.fillStyle = i === H ? '#fff3c4' : ((i % 2) + 2) % 2 ? '#d9942f' : C.oil; ctx.fillRect(X - 55, y, 110, bh + .6);
    }
    const aB = lin(t, c[3], 1.5);
    if (aB > 0) for (const b of LB) { const u = (b.ph + t * .05) % 1, y = yB - u * (yB - yT + 30); ctx.globalAlpha = aB * .85; ctx.fillStyle = C.gas; ctx.beginPath(); ctx.arc(X + b.x + Math.sin(t * 2 + b.w) * 2, y, 1.5 + 9 * u * u, 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 1; ctx.restore();
    const hy = yB - (off - H) * bh - bh / 2;
    ctx.fillStyle = '#93a4b3'; ctx.fillRect(X - 65, yT - 40, 10, yB - yT + 40); ctx.fillRect(X + 55, yT - 40, 10, yB - yT + 40);
    const G = drawPump(ctx, { x: X, y: yB, w: 110, h: 215, wall: 10, p, sv: upS ? 1 : 0, tv: upS ? 0 : 1, t, up: ff ? 0 : upS ? 1 : 0, dn: ff ? 0 : upS ? 0 : 1, rodTop: yB, tail: 0, rod: .01 });
    ctx.fillStyle = C.steelL; ctx.fillRect(X - 6, 60, 12, G.yt - 30 - 60);
    // outlet
    ctx.fillStyle = '#5b6c7c'; ctx.fillRect(X + 55, yT - 30, 300, 26); ctx.fillStyle = C.oil; ctx.fillRect(X + 50, yT - 25, 305, 16);
    dots(ctx, [[X + 60, yT - 17], [X + 350, yT - 17]], off * 22, { color: '#fff3d6', speed: 1, gap: 30, r: 4 });
    ctx.fillStyle = '#3f8f6b'; rr(ctx, X - 24, yT - 76, 48, 40, 6); ctx.fill();
    txt(ctx, 'to the flowline', X + 370, yT - 17, { size: 24, color: C.dim });
    // tracked charge
    if (hy > yT - 30) { ctx.save(); ctx.shadowColor = '#fff3c4'; ctx.shadowBlur = 20; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.strokeRect(X - 55, hy - bh / 2, 110, bh); ctx.restore(); label(ctx, X - 60, hy, X - 220, hy, 'Tracked charge', { a: lin(t, c[0] + 4, .6), align: 'right' }); }
    // counter
    box(ctx, 110, 180, 300, 150, {}); txt(ctx, 'STROKE', 140, 222, { size: 24, mono: true, weight: 700, color: C.dim });
    txt(ctx, String(count).padStart(3, '0'), 140, 282, { size: 64, mono: true, weight: 700, color: C.accent });
    if (ff) { box(ctx, 110, 345, 300, 60, { fill: 'rgba(255,209,102,.14)', stroke: C.accent, a: .5 + .5 * Math.sin(t * 8) ** 2 }); txt(ctx, '▶▶  FAST-FORWARD', 260, 376, { size: 24, weight: 700, color: C.accent, align: 'center' }); }
    label(ctx, X + 30, yB + 80, X + 230, yB + 110, 'Pump adds one charge\nper stroke', { a: win(t, c[0] + 1.5, s.e[0]) });
    // pressure
    const aP = lin(t, c[2] + .3, 1);
    if (aP > 0) {
      ctx.save(); ctx.globalAlpha = aP;
      const g = ctx.createLinearGradient(0, yT, 0, yB); g.addColorStop(0, '#ffe2c2'); g.addColorStop(1, '#ff5a32');
      ctx.fillStyle = g; rr(ctx, X + 110, yT, 26, yB - yT, 13); ctx.fill();
      txt(ctx, 'lower pressure', X + 152, yT + 14, { size: 24, color: '#ffe2c2' }); txt(ctx, 'higher pressure', X + 152, yB - 14, { size: 24, color: '#ff8a66' });
      ctx.strokeStyle = C.dim; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X - 100, yT); ctx.lineTo(X - 100, yB); ctx.moveTo(X - 112, yT); ctx.lineTo(X - 88, yT); ctx.moveTo(X - 112, yB); ctx.lineTo(X - 88, yB); ctx.stroke();
      txt(ctx, 'H = 1000 m', X - 118, (yT + yB) / 2 + 60, { size: 26, mono: true, weight: 700, align: 'right' });
      const a2 = win(t, c[2] + 1.5, s.e[2] + .2);
      box(ctx, 1010, 240, 800, 400, { a: a2 });
      txt(ctx, 'Δp = ρ · g · H', 1060, 320, { size: 68, mono: true, weight: 700, a: a2 });
      txt(ctx, '900 kg/m³  ×  9.81 m/s²  ×  1000 m', 1060, 410, { size: 32, mono: true, color: C.dim, a: a2 * lin(t, c[2] + 3, .6) });
      txt(ctx, '≈ 8.8 MPa ≈ 88 bar', 1060, 500, { size: 56, mono: true, weight: 700, color: C.accent, a: a2 * lin(t, c[2] + 5, .6) });
      txt(ctx, 'static liquid column, ignoring gas and friction', 1060, 585, { size: 26, color: C.dim, a: a2 * lin(t, c[2] + 5, .6) });
      const a3 = win(t, c[3] + .5, s.e[3] + .2);
      box(ctx, 1010, 320, 800, 200, { a: a3, stroke: C.gas });
      txt(ctx, 'pressure ↓   →   gas expands', 1410, 390, { size: 44, weight: 700, align: 'center', a: a3 });
      txt(ctx, 'the mix of phases changes with depth', 1410, 460, { size: 28, color: C.dim, align: 'center', a: a3 });
      ctx.restore();
    }
  },
});

// ---------- 11. Gathering system ----------
SCENES.push({
  id: 'output', title: 'Out to the gathering system', amb: 'surface',
  cues: [
    'At the surface, the mixture leaves through the wellhead outlet into the flowline.',
    'Next come a metering unit and a separator. Here gas is separated from the liquid, and oil from water.',
    'Oil goes on to treatment and transport, water to treatment and disposal, and gas to its own line.',
  ],
  draw(ctx, t, c, s) {
    const cam = { cx: 880, cy: -345, z: .75 };
    ctx.save(); camOn(ctx, cam); drawSky(ctx, -700, 2500, -1200); ctx.fillStyle = '#40342a'; ctx.fillRect(-700, 0, 3200, 600); ctx.fillStyle = '#4b3d30'; ctx.fillRect(-700, 0, 3200, 8);
    drawPumpjack(ctx, TH(GT), { flowLen: 470, hl: t > c[0] + 1 && t < s.e[0] ? 'flow' : '' }); ctx.restore();
    const gy = 759, py = 729, pipe = (pts, col) => { ctx.strokeStyle = '#2a323a'; ctx.lineWidth = 18; ctx.lineJoin = 'round'; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke(); ctx.strokeStyle = col; ctx.lineWidth = 11; ctx.stroke(); };
    const P0 = [[490, py], [840, py]], P1 = [[980, py], [1090, py], [1090, 560], [1190, 560]];
    const PG = [[1375, 478], [1375, 400], [1870, 400]], PO = [[1562, 572], [1870, 572]], PW = [[1380, 646], [1380, 700], [1870, 700]];
    pipe(P1, '#5b6c7c'); pipe(PG, '#5b6c7c'); pipe(PO, '#5b6c7c'); pipe(PW, '#5b6c7c');
    // metering unit
    ctx.fillStyle = '#46627a'; rr(ctx, 830, 640, 160, 119, 10); ctx.fill(); ctx.fillStyle = '#131a21'; ctx.beginPath(); ctx.arc(910, 690, 30, 0, TAU); ctx.fill();
    ctx.strokeStyle = C.accent; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(910, 690); ctx.lineTo(910 + 24 * Math.cos(-2.2 + .5 * Math.sin(t * 1.05)), 690 + 24 * Math.sin(-2.2 + .5 * Math.sin(t * 1.05))); ctx.stroke();
    // separator
    ctx.fillStyle = '#39434d'; ctx.fillRect(1240, 640, 16, gy - 640); ctx.fillRect(1490, 640, 16, gy - 640);
    const kS = lin(t, c[1], 3);
    ctx.save(); rr(ctx, 1180, 470, 390, 180, 90); ctx.clip();
    ctx.fillStyle = '#27333d'; ctx.fillRect(1180, 470, 560, 180);
    ctx.fillStyle = C.oil; ctx.fillRect(1180, 650 - 125 * kS, 560, 130); ctx.fillStyle = C.water; ctx.fillRect(1180, 650 - 55 * kS, 560, 60);
    const R = rng(12); for (let i = 0; i < 30; i++) { const u = (R() + t * .12) % 1; ctx.globalAlpha = kS * (1 - u) * .8; ctx.fillStyle = C.gas; ctx.beginPath(); ctx.arc(1210 + R() * 330, 525 - u * 50, 3 + R() * 4, 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 1; ctx.restore();
    ctx.strokeStyle = '#93a4b3'; ctx.lineWidth = 8; rr(ctx, 1180, 470, 390, 180, 90); ctx.stroke();
    const a1 = lin(t, c[1] + 3, 1);
    txt(ctx, 'gas', 1270, 497, { size: 26, weight: 700, color: C.gas, a: a1 }); txt(ctx, 'oil', 1270, 560, { size: 26, weight: 700, color: '#3a2508', a: a1 }); txt(ctx, 'water', 1270, 622, { size: 26, weight: 700, color: '#06263c', a: a1 });
    // flows
    const d0 = lin(t, c[0] + .5, 1), d2 = lin(t, c[1] + 2, 1);
    dots(ctx, P0, t, { a: d0, color: '#fff3d6', speed: 70, gap: 26, r: 4 }); dots(ctx, P1, t, { a: d0 * lin(t, c[0] + 4, 1), color: '#fff3d6', speed: 70, gap: 26, r: 4 });
    dots(ctx, PG, t, { a: d2, color: C.gas, speed: 90, gap: 30, r: 4 }); dots(ctx, PO, t, { a: d2, color: C.oil, speed: 60, gap: 26, r: 4 }); dots(ctx, PW, t, { a: d2, color: C.water, speed: 60, gap: 26, r: 4 });
    label(ctx, 640, py, 640, 600, 'Flowline', { a: win(t, c[0] + 1, s.e[0]) });
    label(ctx, 910, 640, 870, 520, 'Metering unit', { a: win(t, c[1] + .5, s.e[2]) });
    label(ctx, 1300, 470, 1120, 330, 'Separator', { a: win(t, c[1] + 2, s.e[1]) });
    const a2 = lin(t, c[2] + .3, .8), out = (y, h1, h2, col, d) => { txt(ctx, h1, 1870, y - 52, { size: 30, weight: 700, color: col, align: 'right', a: a2 * lin(t, c[2] + d, .6) }); txt(ctx, h2, 1870, y - 22, { size: 22, color: C.ink, align: 'right', a: a2 * lin(t, c[2] + d, .6) }); };
    out(572, 'Oil', 'to treatment and transport', C.oil, .5); out(700, 'Water', 'to treatment and disposal', C.water, 3); out(400, 'Gas', 'to the gas line', C.gas, 5.5);
  },
});

// ---------- 12. Real-world operation ----------
const POUND_T0 = .5;
SCENES.push({
  id: 'real', title: 'Real-world operation', amb: 'quiet',
  cues: [
    'A real well is more complicated. A rod string a kilometre long is elastic: it stretches and contracts like a spring.',
    'So the plunger stroke downhole differs from the polished-rod stroke at the surface.',
    ['Theoretical displacement is plunger area times stroke length times pumping speed. A 44 mm plunger, a 2 m stroke and 6 strokes per minute give about 26 cubic metres per day.', 13],
    ['Actual output is lower because of gas, leakage and incomplete filling.', 6],
    ['Gas is compressible. With a lot of gas in the chamber, the downstroke first just compresses it, so the traveling valve opens late. In a severe case it never opens: this is gas lock.', 16],
    ['And if the pump takes more than the reservoir delivers, the chamber fills only partly. The plunger hits the liquid: this is fluid pound.', 12],
    'That is why operation is monitored. Sensors measure polished-rod load and position and plot a dynamometer card. Its shape shows how well the pump is filling.',
    'A controller then adjusts the speed or pauses the unit to let fluid build up.',
  ],
  events(s) {
    const ev = [], c = s.c, e = s.e;
    for (let tt = c[5] + POUND_T0 + 3; tt < e[5]; tt += 4) ev.push({ t: tt, type: 'pound' });
    for (let tt = c[4] + 3; tt < c[4] + 8; tt += 4) ev.push({ t: tt, type: 'click' });
    for (let tt = c[4]; tt < e[5]; tt += 2) ev.push({ t: tt, type: (Math.round((tt - c[4]) / 2) % 2) ? 'down' : 'up', dur: 2 });
    return ev;
  },
  draw(ctx, t, c, s) {
    const e = s.e;
    // A: rod elasticity
    const aA = win(t, .5, e[1] + .3);
    if (aA > 0) {
      ctx.save(); ctx.globalAlpha = aA;
      const w = TAU / 4, X = 330, ys = 250 + 60 * Math.sin(w * t), yp = 760 + 42 * Math.sin(w * t - 1.0);
      ctx.strokeStyle = C.steelL; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(X, ys);
      const n = 30; for (let i = 1; i < n; i++) ctx.lineTo(X + (i % 2 ? 34 : -34), lerp(ys + 20, yp - 20, i / n)); ctx.lineTo(X, yp); ctx.stroke();
      ctx.fillStyle = C.accent; rr(ctx, X - 60, ys - 26, 120, 26, 6); ctx.fill(); ctx.fillStyle = C.cold; rr(ctx, X - 50, yp, 100, 60, 8); ctx.fill();
      txt(ctx, 'Polished rod', X + 90, ys - 30, { size: 28, weight: 600, color: C.accent }); txt(ctx, 'surface', X + 90, ys + 4, { size: 24, color: C.dim });
      txt(ctx, 'Plunger', X + 90, yp + 16, { size: 28, weight: 600, color: C.cold }); txt(ctx, '~1 km below', X + 90, yp + 50, { size: 24, color: C.dim });
      txt(ctx, 'rod string\nacts like a spring', X + 90, 500, { size: 24, color: C.dim });
      const bx = 760, bw = 1040, by = 190, bhh = 650, my = by + bhh / 2;
      box(ctx, bx, by, bw, bhh, {}); txt(ctx, 'POSITION OVER TIME', bx + 36, by + 44, { size: 24, mono: true, weight: 700, color: C.dim });
      ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx + 30, my); ctx.lineTo(bx + bw - 30, my); ctx.stroke();
      const tr = (amp, lag, col) => { ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.beginPath(); for (let i = 0; i <= 120; i++) { const tt = t - (120 - i) / 120 * 9, x = bx + 40 + i / 120 * (bw - 280), y = my + amp * Math.sin(w * tt - lag); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(bx + bw - 240, my + amp * Math.sin(w * t - lag), 10, 0, TAU); ctx.fill(); };
      tr(190, 0, C.accent); tr(133, 1.0, C.cold);
      const a1 = lin(t, c[1] + .5, .8), bar = (x, amp, col, l) => { ctx.globalAlpha = aA * a1; ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, my - amp); ctx.lineTo(x, my + amp); ctx.moveTo(x - 12, my - amp); ctx.lineTo(x + 12, my - amp); ctx.moveTo(x - 12, my + amp); ctx.lineTo(x + 12, my + amp); ctx.stroke(); txt(ctx, l, x, my + amp + 34, { size: 22, weight: 600, color: col, align: 'center' }); };
      bar(bx + bw - 170, 190, C.accent, 'surface\nstroke'); bar(bx + bw - 70, 133, C.cold, 'downhole\nstroke');
      ctx.restore();
    }
    // B: displacement
    const aBq = win(t, c[2] - .2, e[3] + .3);
    if (aBq > 0) {
      ctx.save(); ctx.globalAlpha = aBq;
      box(ctx, 200, 170, 1520, 420, {});
      txt(ctx, 'Q  =  (π · D² / 4)  ×  S  ×  N', 960, 255, { size: 70, mono: true, weight: 700, align: 'center' });
      [['D = 44 mm', 'plunger diameter'], ['S = 2 m', 'downhole stroke'], ['N = 6 / min', 'pumping speed']].forEach((it, i) => {
        const a = lin(t, c[2] + 3 + i * 1.6, .6), x = 270 + i * 480; box(ctx, x, 330, 420, 110, { a: aBq * a, fill: '#0e151c', stroke: 'rgba(255,255,255,.18)' });
        txt(ctx, it[0], x + 28, 366, { size: 36, mono: true, weight: 700, color: C.accent, a }); txt(ctx, it[1], x + 28, 410, { size: 24, color: C.dim, a });
      });
      const ar = lin(t, c[2] + 8.5, .7);
      txt(ctx, 'Q ≈ 26.3 m³/day', 270, 515, { size: 60, mono: true, weight: 700, color: C.accent, a: ar });
      txt(ctx, 'geometric displacement of a completely filled pump,\nnot a guaranteed oil rate', 950, 502, { size: 26, color: C.dim, a: ar });
      const a3 = lin(t, c[3], .8), k = pr(t, c[3] + .8, 2);
      ctx.globalAlpha = aBq * a3;
      txt(ctx, 'Theoretical', 200, 680, { size: 28, weight: 600 }); ctx.fillStyle = C.accent; rr(ctx, 420, 660, 1300, 40, 8); ctx.fill();
      txt(ctx, 'Actual', 200, 770, { size: 28, weight: 600 }); ctx.fillStyle = 'rgba(255,100,100,.28)'; rr(ctx, 420, 750, 1300, 40, 8); ctx.fill();
      ctx.fillStyle = C.ok; rr(ctx, 420, 750, 1300 - 480 * k, 40, 8); ctx.fill();
      txt(ctx, 'gas · leakage · incomplete filling', 1720 - 240 * k, 830, { size: 24, color: C.bad, align: 'center', a: k });
      ctx.restore();
    }
    // C/D: gas interference, gas lock, fluid pound
    const aC = win(t, c[4] - .2, e[5] + .3);
    if (aC > 0) {
      ctx.save(); ctx.globalAlpha = aC;
      const mode = t < c[4] + 8 ? 0 : t < c[5] - .2 ? 1 : 2, t0 = mode === 2 ? c[5] + POUND_T0 : c[4];
      const psi = Math.max(0, t - t0) / 4 * TAU, p = (1 - Math.cos(psi)) / 2 * .85 + .05, upS = Math.sin(psi) > 0;
      let x = 470; const y = 170, w = 170, h = 650;
      const hitT = ((t - t0 - 3) % 4 + 4) % 4, hit = mode === 2 && t > t0 + 3 && hitT < .6 ? 1 - hitT / .6 : 0;
      x += hit * 7 * Math.sin(t * 90);
      const G0 = pumpGeom({ y, w, h, p }), chH = G0.seatY - G0.chTop, GL = pumpGeom({ y, w, h, p: mode === 0 ? .32 : mode === 1 ? -.02 : .47 }), Lpx = GL.seatY - GL.chTop;
      const gas = clamp(1 - Lpx / chH), full = gas < .02;
      const tv = mode === 1 ? 0 : (!upS && full ? 1 : 0), sv = mode === 1 ? 0 : mode === 0 ? (upS && p > .32 ? 1 : 0) : (upS && p < .47 ? 1 : 0);
      ctx.fillStyle = '#131a21'; ctx.fillRect(x - w / 2, 110, w, h + 110);
      drawPump(ctx, { x, y, w, h, p, sv, tv, t, up: sv, dn: tv, gas, rodTop: 60, tail: 44, over: 50, tint: upS ? -.3 : gas > 0 ? .5 * (1 - gas * 1.5) : .5 });
      if (hit > 0) { ctx.save(); ctx.globalAlpha = aC * hit; ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; ctx.lineCap = 'round'; for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * 110, G0.yb + Math.sin(a) * 40); ctx.lineTo(x + Math.cos(a) * (150 + 40 * (1 - hit)), G0.yb + Math.sin(a) * (60 + 20 * (1 - hit))); ctx.stroke(); } ctx.restore(); }
      label(ctx, x + 40, G0.chTop + chH * gas * .5, x + 170, G0.chTop - 40, mode === 2 ? 'Unfilled space' : 'Gas in the chamber', { a: gas > .04 ? 1 : 0, color: C.gas });
      const T = [['GAS INTERFERENCE', 'The downstroke first compresses the gas.\nThe traveling valve opens late,\nso part of the stroke is wasted.', C.accent], ['GAS LOCK', 'Gas is compressed and expands again.\nNeither valve opens: the unit keeps\nmoving, but no fluid is pumped.', C.bad], ['FLUID POUND', 'The chamber is only partly filled.\nThe plunger travels through the void,\nthen slams into the liquid.', C.hot]][mode];
      const am = mode === 0 ? win(t, c[4], c[4] + 8, .4) : mode === 1 ? win(t, c[4] + 8, c[5] - .2, .4) : win(t, c[5] - .2, e[5] + .3, .4);
      box(ctx, 960, 200, 820, 330, { a: am, stroke: T[2], lw: 3 });
      txt(ctx, T[0], 1005, 265, { size: 50, weight: 700, color: T[2], a: am }); txt(ctx, T[1], 1005, 345, { size: 30, lh: 1.45, a: am });
      const pill = (yy, name, v) => { const col = v ? C.ok : C.bad; box(ctx, 960, yy, 820, 84, {}); txt(ctx, name, 995, yy + 43, { size: 30, weight: 600 }); box(ctx, 1530, yy + 14, 220, 56, { fill: v ? 'rgba(95,211,141,.14)' : 'rgba(255,100,100,.14)', stroke: col, lw: 3, r: 28 }); txt(ctx, v ? 'OPEN' : 'CLOSED', 1640, yy + 43, { size: 26, weight: 700, color: col, align: 'center' }); };
      pill(570, 'Traveling valve', tv); pill(670, 'Standing valve', sv);
      if (hit > 0) txt(ctx, 'IMPACT', x + 250, G0.yb + 60, { size: 44, weight: 700, color: C.hot, a: hit });
      ctx.restore();
    }
    // E: dynamometer card and controller
    const aE = lin(t, c[6] - .2, .8);
    if (aE > 0) {
      ctx.save(); ctx.globalAlpha = aE;
      const bx = 150, by = 170, bw = 860, bhh = 700, X0 = bx + 110, Y0 = by + bhh - 110, PW2 = bw - 170, PH = bhh - 210;
      box(ctx, bx, by, bw, bhh, {}); txt(ctx, 'DYNAMOMETER CARD', bx + 36, by + 44, { size: 24, mono: true, weight: 700, color: C.dim });
      ctx.strokeStyle = C.dim; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X0, Y0 - PH); ctx.lineTo(X0, Y0); ctx.lineTo(X0 + PW2, Y0); ctx.stroke();
      txt(ctx, 'polished-rod position', X0 + PW2 / 2, Y0 + 50, { size: 26, color: C.dim, align: 'center' });
      ctx.save(); ctx.translate(X0 - 50, Y0 - PH / 2); ctx.rotate(-Math.PI / 2); txt(ctx, 'load', 0, 0, { size: 26, color: C.dim, align: 'center' }); ctx.restore();
      const M = p => [X0 + p[0] * PW2, Y0 - p[1] * PH];
      const ideal = [[.08, .25], [.2, .82], [.92, .82], [.8, .25], [.08, .25]].map(M), bad = [[.08, .25], [.2, .82], [.92, .82], [.87, .56], [.6, .5], [.48, .25], [.08, .25]].map(M);
      const trace = (pts, k, col, lw) => { const L = polyLen(pts), tot = L[L.length - 1]; ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) { if (L[i] <= k * tot) ctx.lineTo(pts[i][0], pts[i][1]); else { const q = polyAt(pts, L, k * tot); ctx.lineTo(q[0], q[1]); break; } } ctx.stroke(); return polyAt(pts, L, ((t / 4) % 1) * tot); };
      const k1 = lin(t, c[6] + 1.5, 4), k2 = lin(t, c[6] + 7.5, 3);
      const q1 = trace(ideal, k1, C.ok, 6); if (k2 > 0) { ctx.setLineDash([14, 10]); trace(bad, k2, C.bad, 6); ctx.setLineDash([]); }
      if (k1 >= 1) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(q1[0], q1[1], 10, 0, TAU); ctx.fill(); }
      txt(ctx, 'upstroke →', X0 + PW2 * .56, Y0 - PH * .82 - 28, { size: 22, color: C.dim, align: 'center', a: k1 }); txt(ctx, '← downstroke', X0 + PW2 * .3, Y0 - PH * .25 + 28, { size: 22, color: C.dim, align: 'center', a: k1 });
      ctx.fillStyle = C.ok; ctx.fillRect(bx + 420, by + 36, 34, 6); txt(ctx, 'full pump', bx + 464, by + 40, { size: 22, a: k1 });
      ctx.fillStyle = C.bad; ctx.globalAlpha = aE * k2; ctx.fillRect(bx + 600, by + 36, 34, 6); ctx.globalAlpha = aE; txt(ctx, 'incomplete fillage', bx + 644, by + 40, { size: 22, a: k2 });
      // controller
      const a7 = lin(t, c[7], .8), on = Math.floor((t - c[7]) / 2.5) % 2;
      box(ctx, 1100, 250, 690, 470, { a: a7, stroke: 'rgba(255,255,255,.2)' });
      txt(ctx, 'PUMP-OFF CONTROLLER', 1140, 300, { size: 24, mono: true, weight: 700, color: C.dim, a: a7 });
      const row = (yy, s1, act) => { box(ctx, 1140, yy, 610, 96, { a: a7, fill: act ? 'rgba(255,209,102,.14)' : '#0e151c', stroke: act ? C.accent : 'rgba(255,255,255,.14)' }); ctx.globalAlpha = aE * a7; ctx.fillStyle = act ? C.accent : C.steelD; ctx.beginPath(); ctx.arc(1180, yy + 48, 12, 0, TAU); ctx.fill(); ctx.globalAlpha = aE; txt(ctx, s1, 1212, yy + 49, { size: 30, weight: 600, a: a7, color: act ? C.ink : C.dim }); };
      row(350, 'Reads load and position', true); row(466, 'Slows the pumping speed', t > c[7] + 1 && !on); row(582, 'Pauses to let fluid build up', t > c[7] + 1 && !!on);
      ctx.restore();
    }
  },
});

// ---------- 13. Summary ----------
SCENES.push({
  id: 'outro', title: 'The whole picture', amb: 'surface', extra: 6,
  cues: [
    'To sum up: the motor turns the cranks, the walking beam rocks, the plunger moves up and down, and two valves turn that motion into flow.',
    'Stroke by stroke, oil makes its way from the rock pores to the surface.',
  ],
  draw(ctx, t, c, s) {
    drawWorld(ctx, CAM_FULL, GT, { flow: true });
    ctx.save(); camOn(ctx, CAM_FULL);
    for (const sd of [-1, 1]) for (const py of WORLD.perfs) dots(ctx, [[WX + sd * 1500, py + (py - 1350) * 1.2], [WX + sd * 400, py], [WX + sd * 60, py]], t, { color: '#fff3d6', speed: 70, gap: 90, r: 6, a: .9 });
    dots(ctx, [[WX + 30, -40], [1700, -40]], t, { color: '#fff3d6', speed: 90, gap: 60, r: 5 });
    ctx.restore();
    const aE = pr(t, s.e[1] + .8, 1.5);
    if (aE > 0) {
      ctx.globalAlpha = aE * .88; ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = aE;
      txt(ctx, 'From the rock pores\nto the surface', 960, 440, { size: 96, weight: 700, align: 'center', lh: 1.15 });
      ctx.fillStyle = C.accent; ctx.fillRect(915, 640, 90, 5);
      txt(ctx, 'Schematic animation · not to scale', 960, 700, { size: 28, color: C.dim, align: 'center' });
      ctx.globalAlpha = 1;
    }
  },
});
