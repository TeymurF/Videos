// Scenes: common basis and phase changes, preliminary quantities, material balance, proportional allocation.

// the worked example (all values from the source document)
const EX = {
  A: { q: 60, h: 24, wc: .20, liq: 60, oil: 48, wat: 12, aOil: 52.80, aWat: 10.80, gTot: 3000, gLift: 600, gRes: 2400, aGas: 2880, share: 73.2824 },
  B: { q: 40, h: 18, wc: .50, liq: 30, oil: 15, wat: 15, aOil: 16.50, aWat: 13.50, gTot: 1200, gLift: 300, gRes: 900, aGas: 1080, share: 22.9008 },
  C: { q: 20, h: 12, wc: .75, liq: 10, oil: 2.5, wat: 7.5, aOil: 2.75, aWat: 6.75, gTot: 300, gLift: 100, gRes: 200, aGas: 240, share: 3.8168 },
  preOil: 65.5, preWat: 34.5, preGas: 3500, ctlOil: 72.05, ctlWat: 31.05, ctlGas: 4200, kOil: 1.10, kWat: 0.90, kGas: 1.20,
};
const GASD = (() => { const R = rng(51), a = []; for (let i = 0; i < 70; i++) a.push([R(), R(), R() * TAU]); return a; })();
function formula(ctx, x, y, parts, o = {}) { // parts: [text, color?] drawn left to right in mono; returns end x
  ctx.save(); ctx.globalAlpha *= o.a ?? 1; const size = o.size ?? 48;
  for (const p of parts) { const s = typeof p === 'string' ? p : p[0], col = typeof p === 'string' ? C.ink : p[1], a = typeof p === 'string' ? 1 : (p[2] ?? 1); ctx.font = font(size, 700, true); if (a > .01) txt(ctx, s, x, y, { size, mono: true, weight: 700, color: col, a }); x += ctx.measureText(s).width; }
  ctx.restore(); return x;
}

// ---------- 8. Common basis and phase changes ----------
SCENES.push({
  id: 'basis', title: 'Use a common measurement basis', amb: 'calc',
  cues: [
    'Volumes measured at different pressures and temperatures cannot simply be added. Gas volume is especially sensitive to conditions.',
    'So every phase is converted to defined reference conditions: a stated temperature, an absolute pressure, and a dry or wet gas convention.',
    'Processing changes the phases too. In the separator, gas comes out of the oil, so stabilised tank oil is less than separator oil. This shrinkage is not a leak.',
    'Laboratory factors or a P V T model make these conversions. Mass is conserved through phase changes, even when volumes are not.',
  ].map((x, i) => i === 3 ? { t: x.replace('P V T', 'PVT'), say: x } : x),
  events(s) { return [{ t: at(s, 1, .25), type: 'tick' }, { t: at(s, 1, .45), type: 'tick' }, { t: at(s, 1, .65), type: 'tick' }, { t: at(s, 3, .6), type: 'ding' }]; },
  draw(ctx, t, c, s) {
    const kA = 1 - pr(t, c[2] - .6, 1.1);
    if (kA > 0) {
      ctx.save(); ctx.globalAlpha = kA;
      // piston: same gas, different volume
      const cx = 260, cw = 300, top = 200, bot = 830, k = .5 - .5 * Math.cos(Math.min((t - c[0] - .5) / 3.2, 1e9) * 1.0), gh = lerp(150, 520, t < c[0] + .5 ? 0 : k), py = bot - gh;
      ctx.fillStyle = '#131a21'; ctx.fillRect(cx, top, cw, bot - top);
      ctx.fillStyle = `rgba(191,232,216,${lerp(.42, .12, (gh - 150) / 370)})`; ctx.fillRect(cx, py, cw, gh);
      for (const d of GASD) { ctx.fillStyle = C.gas; ctx.beginPath(); ctx.arc(cx + 12 + d[0] * (cw - 24) + Math.sin(t * 2 + d[2]) * 3, py + 14 + d[1] * (gh - 24) + Math.cos(t * 2.3 + d[2]) * 3, 5, 0, TAU); ctx.fill(); }
      ctx.fillStyle = '#93a4b3'; ctx.fillRect(cx - 10, top, 10, bot - top + 10); ctx.fillRect(cx + cw, top, 10, bot - top + 10); ctx.fillRect(cx - 10, bot, cw + 20, 10);
      ctx.fillStyle = '#c0cbd5'; ctx.fillRect(cx, py - 26, cw, 26); ctx.fillStyle = '#93a4b3'; ctx.fillRect(cx + cw / 2 - 10, top - 40, 20, py - 26 - top + 40);
      txt(ctx, 'the same amount of gas', cx + cw / 2, bot + 44, { size: 26, weight: 600, align: 'center' });
      const hp = gh < 335;
      chip(ctx, cx + cw + 40, py + gh / 2, hp ? 'high pressure: small volume' : 'low pressure: large volume', { size: 26, color: hp ? C.hot : C.cold });
      ctx.strokeStyle = C.dim; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx - 44, py); ctx.lineTo(cx - 44, bot); ctx.moveTo(cx - 54, py); ctx.lineTo(cx - 34, py); ctx.moveTo(cx - 54, bot); ctx.lineTo(cx - 34, bot); ctx.stroke();
      txt(ctx, 'V', cx - 70, py + gh / 2, { size: 34, mono: true, weight: 700, align: 'center' });
      // cannot add
      const a0 = win(t, at(s, 0, .3), c[1] + .2);
      box(ctx, 1040, 300, 760, 300, { a: a0 * kA });
      ctx.globalAlpha = kA * a0;
      txt(ctx, 'DIFFERENT CONDITIONS', 1080, 348, { size: 22, mono: true, weight: 700, color: C.dim });
      chip(ctx, 1080, 430, 'volume at pressure 1', { size: 28, color: C.hot }); txt(ctx, '+', 1420, 430, { size: 44, weight: 700, align: 'center' }); chip(ctx, 1460, 430, 'volume at pressure 2', { size: 28, color: C.cold });
      txt(ctx, 'cannot be added directly', 1420, 530, { size: 34, weight: 700, align: 'center', color: C.bad });
      ctx.strokeStyle = C.bad; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(1395, 405); ctx.lineTo(1445, 455); ctx.moveTo(1445, 405); ctx.lineTo(1395, 455); ctx.stroke();
      // reference conditions card
      const a1 = lin(t, c[1] - .1, .8);
      if (a1 > 0) {
        ctx.globalAlpha = kA * a1; box(ctx, 1040, 230, 760, 560, { stroke: C.accent, lw: 3, fill: '#101820' });
        txt(ctx, 'REFERENCE CONDITIONS', 1084, 286, { size: 24, mono: true, weight: 700, color: C.accent });
        [['Temperature', 'stated'], ['Absolute pressure', 'stated'], ['Dry or wet gas', 'defined']].forEach((r, i) => {
          const a = lin(t, at(s, 1, .25 + i * .2), .4), y = 370 + i * 96;
          ctx.globalAlpha = kA * a1 * a; ctx.fillStyle = 'rgba(255,255,255,.05)'; rr(ctx, 1076, y - 38, 688, 76, 10); ctx.fill();
          txt(ctx, r[0], 1104, y, { size: 34, weight: 600 }); chip(ctx, 1740, y, r[1], { size: 26, align: 'right', color: C.ok, tc: C.ok });
        });
        ctx.globalAlpha = kA * a1 * lin(t, at(s, 1, .8), .5);
        txt(ctx, 'A label such as Sm³ or Nm³ is not enough:\nits basis must be defined.', 1084, 690, { size: 28, color: '#b9c5d0', lh: 1.4 });
      }
      ctx.restore();
    }
    const kB = pr(t, c[2] - .2, 1);
    if (kB > 0) {
      ctx.save(); ctx.globalAlpha = kB;
      const bx1 = 330, bx2 = 1060, bw = 280, bot = 800, h1 = 470, k = pr(t, at(s, 2, .22), 3), h2 = lerp(h1, 380, k);
      const col = (x, h, name, sub, bub) => {
        ctx.fillStyle = '#131a21'; ctx.fillRect(x, 250, bw, bot - 250);
        const g = ctx.createLinearGradient(0, bot - h, 0, bot); g.addColorStop(0, C.oil); g.addColorStop(1, C.oilD); ctx.fillStyle = g; ctx.fillRect(x, bot - h, bw, h);
        if (bub) { const R = rng(7); for (let i = 0; i < 26; i++) { const u = (R() + t * .12) % 1; ctx.fillStyle = C.gas; ctx.globalAlpha = kB * .85; ctx.beginPath(); ctx.arc(x + 16 + R() * (bw - 32), bot - 14 - u * (h - 28), 3 + R() * 4, 0, TAU); ctx.fill(); } ctx.globalAlpha = kB; }
        ctx.strokeStyle = '#93a4b3'; ctx.lineWidth = 6; ctx.strokeRect(x, 250, bw, bot - 250);
        txt(ctx, name, x + bw / 2, bot + 44, { size: 30, weight: 700, align: 'center' }); txt(ctx, sub, x + bw / 2, bot + 82, { size: 22, color: C.dim, align: 'center' });
      };
      col(bx1, h1, 'Separator oil', 'gas still dissolved', true); col(bx2, h2, 'Stabilised tank oil', 'on the accounting basis', false);
      arrow(ctx, bx1 + bw + 50, 560, bx2 - 50, 560, { color: '#7f91a3', w: 8 }); txt(ctx, 'pressure falls, oil cools', (bx1 + bw + bx2) / 2, 520, { size: 24, color: C.dim, align: 'center' });
      // released gas
      const R = rng(19); for (let i = 0; i < 34; i++) { const u = (R() + t * .16) % 1; ctx.globalAlpha = kB * k * (1 - u) * .9; ctx.fillStyle = C.gas; ctx.beginPath(); ctx.arc(bx2 + bw + 90 + R() * 200, 470 - u * 250 + R() * 40, 5 + R() * 9, 0, TAU); ctx.fill(); }
      ctx.globalAlpha = kB;
      txt(ctx, 'Gas released', bx2 + bw + 190, 520, { size: 30, weight: 700, color: C.gas, align: 'center', a: k });
      // shrinkage bracket
      if (k > .3) { const a = lin(k, .3, .4); ctx.globalAlpha = kB * a; ctx.strokeStyle = C.accent; ctx.lineWidth = 4; ctx.setLineDash([10, 8]); ctx.beginPath(); ctx.moveTo(bx1 + bw, bot - h1); ctx.lineTo(bx2 + bw, bot - h1); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = 'rgba(255,209,102,.18)'; ctx.fillRect(bx2, bot - h1, bw, h1 - h2); txt(ctx, 'shrinkage', bx2 + bw / 2, bot - h1 + (h1 - h2) / 2, { size: 26, weight: 700, align: 'center', color: C.accent }); ctx.globalAlpha = kB; }
      chip(ctx, 960, 190, 'Shrinkage is not a leak: the hydrocarbons moved into the gas phase', { a: win(t, at(s, 2, .62), c[3] + .2), size: 30, align: 'center' });
      const a3 = lin(t, c[3] + .3, .8);
      if (a3 > 0) {
        box(ctx, 300, 140, 1320, 96, { a: a3 * .98, stroke: C.ok, lw: 3, fill: '#101820' });
        ctx.globalAlpha = kB * a3;
        txt(ctx, 'mass of separator oil', 350, 188, { size: 30, weight: 600 }); txt(ctx, '=', 720, 188, { size: 44, weight: 700, color: C.ok, align: 'center' });
        txt(ctx, 'mass of tank oil', 770, 188, { size: 30, weight: 600 }); txt(ctx, '+', 1060, 188, { size: 44, weight: 700, color: C.ok, align: 'center' }); txt(ctx, 'mass of released gas', 1100, 188, { size: 30, weight: 600, color: C.gas });
        chip(ctx, 1630, 640, 'Laboratory factors', { a: lin(t, at(s, 3, .1), .5), size: 28, align: 'center', color: C.cold }); chip(ctx, 1630, 712, 'PVT model', { a: lin(t, at(s, 3, .2), .5), size: 28, align: 'center', color: C.cold });
      }
      ctx.restore();
    }
  },
});

// ---------- 9. Preliminary quantities ----------
const PCOLS = [{ w: 130, al: 'l', head: 'Well' }, { w: 210, al: 'r', head: 'Liquid\nm³/day' }, { w: 190, al: 'r', head: 'Runtime\nh' }, { w: 190, al: 'r', head: 'Water\ncut' }, { w: 250, al: 'r', head: 'Period\nliquid m³' }, { w: 220, al: 'r', head: 'Oil\nm³' }, { w: 220, al: 'r', head: 'Water\nm³' }];
SCENES.push({
  id: 'prelim', title: 'Calculate preliminary well quantities', amb: 'calc',
  cues: [
    { t: 'Now the calculation. For a well with a constant rate, the preliminary volume is the daily rate multiplied by the operating hours and divided by 24.', say: 'Now the calculation. For a well with a constant rate, the preliminary volume is the daily rate, multiplied by the operating hours, and divided by twenty-four.' },
    { t: 'Well A: 60 m³ per day for 24 hours gives 60 m³ of liquid. With a 20% water cut, that is 48 m³ of oil and 12 m³ of water.', say: 'Well A: sixty cubic metres per day, for twenty-four hours, gives sixty cubic metres of liquid. With a twenty percent water cut, that is forty-eight cubic metres of oil, and twelve of water.' },
    { t: 'Well B: 40 m³ per day, but only 18 hours: 30 m³ of liquid. Half of it is water, so 15 m³ of oil and 15 m³ of water.', say: 'Well B: forty cubic metres per day, but only eighteen hours: thirty cubic metres of liquid. Half of it is water, so fifteen cubic metres of oil, and fifteen of water.' },
    { t: 'Well C: 20 m³ per day for 12 hours gives 10 m³. At a 75% water cut: 2.5 m³ of oil and 7.5 m³ of water.', say: 'Well C: twenty cubic metres per day, for twelve hours, gives ten cubic metres. At a seventy-five percent water cut: two and a half cubic metres of oil, and seven and a half of water.' },
    { t: 'Together: 100 m³ of liquid, of which 65.5 m³ is preliminary oil. These are first estimates, not final allocated results.', say: 'Together: one hundred cubic metres of liquid, of which sixty-five and a half is preliminary oil. These are first estimates, not final allocated results.' },
  ],
  events(s) { const ev = []; for (let r = 0; r < 3; r++) for (const k of [.05, .38, .62, .8]) ev.push({ t: at(s, r + 1, k), type: 'tick' }); ev.push({ t: at(s, 4, .15), type: 'tick' }, { t: at(s, 4, .4), type: 'ding' }); return ev; },
  draw(ctx, t, c, s) {
    const a0 = lin(t, c[0] + .2, .8);
    box(ctx, 236, 140, 1458, 150, { a: a0 });
    ctx.globalAlpha = a0;
    let x = formula(ctx, 280, 214, [['V', C.accent], ['pre', C.accent]].slice(0, 1), { size: 60 }); txt(ctx, 'pre', x + 2, 232, { size: 30, weight: 700, color: C.accent });
    formula(ctx, x + 70, 214, [' = ', ['q', C.ink, lin(t, at(s, 0, .4), .3)], [' × ', C.dim, lin(t, at(s, 0, .55), .3)], ['t', C.ink, lin(t, at(s, 0, .6), .3)], [' / ', C.dim, lin(t, at(s, 0, .8), .3)], ['24', C.ink, lin(t, at(s, 0, .85), .3)]], { size: 60 });
    txt(ctx, 'q  rate per day      t  operating hours', 1000, 196, { size: 24, color: C.dim }); txt(ctx, 'oil = liquid × (1 − WC)     water = liquid × WC', 1000, 240, { size: 24, mono: true, color: '#b9c5d0' });
    ctx.globalAlpha = 1;
    const cur = t < c[1] ? -1 : t < c[2] ? 0 : t < c[3] ? 1 : t < c[4] ? 2 : 3;
    const rows = 'ABC'.split('').map(k => { const e = EX[k]; return [{ badge: k }, String(e.q), String(e.h), Math.round(e.wc * 100) + ' %', fmt(e.liq, 1), { s: fmt(e.oil, 1), color: C.oil }, { s: fmt(e.wat, 1), color: C.water }]; });
    rows.push([{ s: 'Total', mono: false, weight: 700 }, '—', '—', '—', { s: '100.0', weight: 700 }, { s: '65.5', color: C.oil, weight: 700 }, { s: '34.5', color: C.water, weight: 700 }]);
    const reveal = (r, ci) => { if (r < 3) { const k = ci < 4 ? .04 : ci === 4 ? .38 : ci === 5 ? .62 : .8; return lin(t, at(s, r + 1, k), .35); } const k = ci < 4 ? .02 : ci === 4 ? .15 : ci === 5 ? .4 : .5; return lin(t, at(s, 4, k), .35); };
    table(ctx, 260, 330, PCOLS, rows, { a: lin(t, c[0] + 1.5, .8), rh: 72, size: 34, cellA: reveal, hlRow: cur >= 0 ? cur : undefined, totalRow: 3 });
    // arithmetic strip
    if (cur >= 0 && cur < 3) {
      const k = 'ABC'[cur], e = EX[k], a = win(t, c[cur + 1] + .2, s.e[cur + 1] + .2, .3);
      box(ctx, 236, 722, 1458, 150, { a: a * .98, stroke: C[k], lw: 3, fill: '#101820' });
      ctx.globalAlpha = a; badge(ctx, 300, 797, k, { r: 30 });
      formula(ctx, 370, 770, [`${e.q} × ${e.h} / 24`, [' = ', C.dim], [fmt(e.liq, 0) + ' m³ liquid', C.accent, lin(t, at(s, cur + 1, .38), .3)]], { size: 40 });
      formula(ctx, 370, 828, [[`${fmt(e.liq, 0)} × (1 − ${e.wc.toFixed(2)})`, C.ink, lin(t, at(s, cur + 1, .56), .3)], [' = ', C.dim, lin(t, at(s, cur + 1, .56), .3)], [e.oil + ' m³ oil', C.oil, lin(t, at(s, cur + 1, .62), .3)]], { size: 40 });
      formula(ctx, 1080, 828, [[`${fmt(e.liq, 0)} × ${e.wc.toFixed(2)}`, C.ink, lin(t, at(s, cur + 1, .76), .3)], [' = ', C.dim, lin(t, at(s, cur + 1, .76), .3)], [e.wat + ' m³ water', C.water, lin(t, at(s, cur + 1, .8), .3)]], { size: 40 });
      // runtime bar
      ctx.fillStyle = '#1b2733'; rr(ctx, 1080, 752, 560, 34, 8); ctx.fill(); ctx.fillStyle = C[k]; rr(ctx, 1080, 752, 560 * e.h / 24 * pr(t, c[cur + 1] + .4, 1), 34, 8); ctx.fill();
      txt(ctx, `${e.h} of 24 h`, 1650, 733, { size: 22, color: C.dim, align: 'right' });
      ctx.globalAlpha = 1;
    }
    if (cur === 3) {
      const a = lin(t, at(s, 4, .55), .6);
      chip(ctx, 960, 790, 'Preliminary estimates: a first view of each well’s contribution', { a, size: 32, align: 'center' });
    }
  },
});

// ---------- 10. Material balance ----------
SCENES.push({
  id: 'balance', title: 'Production is not the same as export', amb: 'plant',
  cues: [
    'The measured side comes from a material balance. Production plus external inputs equals outputs plus the change in inventory.',
    'So production is not the same as export. If oil accumulates in storage, export is lower than production. If stock is drawn down, export is higher.',
    { t: 'In our example, the export meter records 64.05 m³ for the day. The tank inventory rises from 20 to 28 m³.', say: 'In our example, the export meter records sixty-four point zero five cubic metres for the day. The tank inventory rises from twenty, to twenty-eight cubic metres.' },
    { t: 'So the control quantity of produced oil is 64.05 plus 28 minus 20: that is 72.05 m³. This is the total we allocate.', say: 'So the control quantity of produced oil is sixty-four point zero five, plus twenty-eight, minus twenty: that is seventy-two point zero five cubic metres. This is the total we allocate.' },
  ],
  events(s) { return [{ t: at(s, 2, .3), type: 'tick' }, { t: at(s, 2, .8), type: 'tick' }, { t: at(s, 3, .25), type: 'tick' }, { t: at(s, 3, .4), type: 'tick' }, { t: at(s, 3, .5), type: 'tick' }, { t: at(s, 3, .68), type: 'ding' }]; },
  draw(ctx, t, c, s) {
    // equation banner
    const a0 = lin(t, c[0] + .3, .8), k2 = pr(t, at(s, 0, .92), .8) * (t > c[1] - 1 ? 1 : 0);
    box(ctx, 200, 140, 1520, 100, { a: a0 });
    const eq = [['Production', C.ok], [' + ', C.dim], ['external inputs', C.ink], [' = ', C.accent], ['outputs', C.oil], [' + ', C.dim], ['inventory change', C.cold]];
    ctx.save(); ctx.globalAlpha = a0; ctx.font = font(38, 700);
    let tw = eq.reduce((n, p) => n + ctx.measureText(p[0]).width, 0), x = 960 - tw / 2;
    eq.forEach((p, i) => { const a = lin(t, at(s, 0, .3 + i * .08), .4); txt(ctx, p[0], x, 191, { size: 38, weight: 700, color: p[1], a }); x += ctx.measureText(p[0]).width; });
    ctx.restore();
    // tank with scale 0..40 m3
    const tx = 720, ty = 330, tw2 = 300, th = 440, full = 40;
    const lvl = t < c[1] ? 20 : t < c[2] ? 20 + 6 * Math.sin((t - c[1]) / (s.e[1] - c[1]) * TAU) * lin(t, c[1] + .3, 1) * (1 - lin(t, s.e[1] - .8, .8)) : lerp(20, 28, pr(t, at(s, 2, .45), (s.e[2] - c[2]) * .4));
    const rising = t > c[1] && t < c[2] && Math.cos((t - c[1]) / (s.e[1] - c[1]) * TAU) > 0;
    const inflow = [[200, 600], [tx, 600]], outflow = [[tx + tw2, 700], [1720, 700]];
    pipe(ctx, inflow, { w: 20 }); pipe(ctx, outflow, { w: 20 });
    dots(ctx, inflow, GT, { color: C.oil, speed: 90, gap: 30, r: 7 }); dots(ctx, outflow, GT, { color: C.oil, speed: t > c[1] && t < c[2] ? (rising ? 50 : 130) : 80, gap: 34, r: 7 });
    tank(ctx, tx, ty, tw2, th, lvl / full, { hl: t > c[2] && t < c[3] });
    for (let v = 0; v <= 40; v += 10) { const y = ty + th - th * v / full; ctx.fillStyle = C.dim; ctx.fillRect(tx - 22, y - 1, 16, 2); txt(ctx, String(v), tx - 32, y, { size: 22, mono: true, color: C.dim, align: 'right' }); }
    txt(ctx, 'm³', tx - 32, ty - 18, { size: 22, mono: true, color: C.dim, align: 'right' }); txt(ctx, 'Storage tank', tx + tw2 / 2, ty + th + 34, { size: 26, weight: 600, align: 'center', color: C.dim });
    const known = lin(t, at(s, 3, .68), .5);
    txt(ctx, 'Production', 220, 548, { size: 30, weight: 700, color: C.ok });
    if (known < 1) txt(ctx, '?', 400, 546, { size: 44, weight: 700, color: C.ok, a: 1 - known });
    txt(ctx, '72.05 m³', 400, 548, { size: 40, mono: true, weight: 700, color: C.ok, a: known });
    const cnt = t < c[2] ? null : 64.05 * pr(t, at(s, 2, .1), (s.e[2] - c[2]) * .35);
    meter(ctx, 1380, 700, { t: GT, color: C.oil, label: 'Export meter', value: cnt == null ? undefined : fmt(cnt) + ' m³', vs: 34, r: 36, hl: t > c[2] && t < c[3] });
    txt(ctx, 'Export', 1640, 648, { size: 30, weight: 700, color: C.oil });
    // cue 1: two cases
    const a1 = win(t, c[1] + .4, c[2]);
    if (a1 > 0) {
      chip(ctx, 1420, 380, 'Stock builds up:  export < production', { a: a1 * (rising ? 1 : .25), size: 30, align: 'center', color: C.cold });
      chip(ctx, 1420, 450, 'Stock is drawn down:  export > production', { a: a1 * (rising ? .25 : 1), size: 30, align: 'center', color: C.hot });
      arrow(ctx, tx + tw2 + 46, ty + th - th * lvl / full + (rising ? 34 : -34), tx + tw2 + 46, ty + th - th * lvl / full + (rising ? -34 : 34), { color: rising ? C.cold : C.hot, w: 8, a: a1 });
    }
    // cue 2: opening / closing marks
    const a2 = lin(t, c[2] + .2, .6);
    if (a2 > 0) {
      const yo = ty + th - th * 20 / full, yc = ty + th - th * lvl / full;
      ctx.save(); ctx.globalAlpha = a2; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.setLineDash([10, 8]); ctx.beginPath(); ctx.moveTo(tx, yo); ctx.lineTo(tx + tw2 + 30, yo); ctx.stroke(); ctx.restore();
      txt(ctx, 'opening  20 m³', tx + tw2 + 44, yo, { size: 28, mono: true, weight: 700, a: a2 });
      const ac = lin(t, at(s, 2, .8), .4);
      txt(ctx, 'closing  28 m³', tx + tw2 + 44, yc - 4, { size: 28, mono: true, weight: 700, color: C.cold, a: ac * (lvl > 22.5 ? 1 : 0) });
      chip(ctx, tx + tw2 / 2, ty + th - th * 24 / full, '+8 m³', { a: ac, size: 30, align: 'center', color: C.cold, mono: true });
    }
    // cue 3: calculation
    const a3 = lin(t, c[3] + .2, .8);
    if (a3 > 0) {
      box(ctx, 1370, 290, 470, 260, { a: a3 * .98, stroke: C.accent, lw: 3, fill: '#101820' });
      ctx.globalAlpha = a3;
      txt(ctx, 'CONTROL QUANTITY OF OIL', 1400, 336, { size: 22, mono: true, weight: 700, color: C.accent });
      formula(ctx, 1400, 408, [['64.05', C.oil, lin(t, at(s, 3, .25), .3)], [' + ', C.dim, lin(t, at(s, 3, .4), .3)], ['28', C.cold, lin(t, at(s, 3, .4), .3)], [' − ', C.dim, lin(t, at(s, 3, .5), .3)], ['20', C.ink, lin(t, at(s, 3, .5), .3)]], { size: 40 });
      txt(ctx, 'export + closing − opening', 1400, 458, { size: 22, color: C.dim });
      formula(ctx, 1400, 510, [['= ', C.dim], ['72.05 m³', C.accent]], { size: 52, a: lin(t, at(s, 3, .68), .4) });
      ctx.globalAlpha = 1;
    }
  },
});

// ---------- 11. Proportional allocation ----------
SCENES.push({
  id: 'alloc', title: 'Proportional allocation', amb: 'calc',
  cues: [
    'Now we work backwards. The control quantity is distributed to the wells in proportion to their preliminary estimates.',
    { t: 'Each well’s share is its preliminary volume divided by the total: about 73% for A, 23% for B and 4% for C.', say: 'Each well’s share is its preliminary volume divided by the total: about seventy-three percent for A, twenty-three percent for B, and four percent for C.' },
    { t: 'Equivalently, one reconciliation factor K is the control quantity divided by the preliminary total: 72.05 over 65.5 equals 1.10.', say: 'Equivalently, one reconciliation factor, K, is the control quantity divided by the preliminary total: seventy-two point zero five, over sixty-five point five, equals one point one.' },
    { t: 'Well A is allocated 52.80 m³, well B 16.50 and well C 2.75. Their sum equals the control quantity exactly.', say: 'Well A is allocated fifty-two point eight cubic metres, well B sixteen point five, and well C two point seven five. Their sum equals the control quantity exactly.' },
    { t: 'The 10% increase does not mean more oil was produced. The estimate was reconciled, and the factor alone does not say which well was in error.', say: 'The ten percent increase does not mean more oil was produced. The estimate was reconciled, and the factor alone does not say which well was in error.' },
  ],
  events(s) { return [{ t: s.c[0] + .8, type: 'whoosh' }, { t: at(s, 1, .5), type: 'tick' }, { t: at(s, 1, .68), type: 'tick' }, { t: at(s, 1, .86), type: 'tick' }, { t: at(s, 2, .8), type: 'ding' }, { t: at(s, 3, .1), type: 'tick' }, { t: at(s, 3, .4), type: 'tick' }, { t: at(s, 3, .55), type: 'tick' }, { t: at(s, 3, .8), type: 'ding' }]; },
  draw(ctx, t, c, s) {
    const ys = { A: 380, B: 530, C: 680 }, bx = 330, sc = 7.6, cx = 1400, cy = 530;
    // control quantity
    const a0 = lin(t, c[0] + .2, .8);
    box(ctx, cx, cy - 110, 420, 220, { a: a0, stroke: C.accent, lw: 3, fill: '#101820' });
    txt(ctx, 'CONTROL QUANTITY', cx + 30, cy - 66, { size: 22, mono: true, weight: 700, color: C.accent, a: a0 });
    txt(ctx, '72.05 m³', cx + 30, cy, { size: 64, mono: true, weight: 700, a: a0 }); txt(ctx, 'from the oil balance', cx + 30, cy + 62, { size: 24, color: C.dim, a: a0 });
    // rows
    'ABC'.split('').forEach((k, i) => {
      const e = EX[k], y = ys[k], ar = lin(t, c[0] + .6 + i * .3, .6), kg = pr(t, at(s, 3, [.1, .4, .55][i]), .9);
      badge(ctx, 230, y, k, { r: 32, a: ar });
      ctx.globalAlpha = ar;
      ctx.strokeStyle = C[k]; ctx.lineWidth = 3; ctx.setLineDash([8, 6]); ctx.strokeRect(bx, y - 30, e.oil * sc, 60); ctx.setLineDash([]);
      ctx.fillStyle = C[k]; ctx.globalAlpha = ar * .9; ctx.fillRect(bx, y - 30, lerp(0, e.aOil * sc, kg), 60); ctx.globalAlpha = ar;
      const nx = bx + Math.max(e.aOil * sc, 60) + 26;
      txt(ctx, 'preliminary ' + fmt(e.oil, 1), nx, y - 16, { size: 24, mono: true, color: C.dim });
      txt(ctx, kg > .02 ? 'allocated ' + fmt(lerp(e.oil, e.aOil, kg)) + ' m³' : ' ', nx, y + 18, { size: 30, mono: true, weight: 700, color: C[k] });
      ctx.globalAlpha = 1;
      // share
      const as = lin(t, at(s, 1, [.5, .68, .86][i]), .4);
      chip(ctx, 1180, y, fmt(e.share, 1) + ' %', { a: as, size: 30, mono: true, align: 'center', color: C[k], tc: C[k] });
      // reverse arrows
      backArrow(ctx, [[cx - 14, cy + (i - 1) * 46], [1290, cy + (i - 1) * 46], [1290, y], [1262, y]], GT, { a: a0 * lin(t, c[0] + 1, .6), k: lin(t, c[0] + 1 + i * .3, 1.4) });
    });
    chip(ctx, 1290, 290, 'calculation, not flow', { a: win(t, c[0] + 2, c[1] + .2), size: 24, align: 'center', color: C.dim });
    // stacked share bar
    const a1 = lin(t, c[1] + .2, .7);
    if (a1 > 0) {
      const sx = 330, sw = 930, sy = 190; let x = sx;
      txt(ctx, 'w = V pre / Σ V pre', sx, sy - 30, { size: 24, mono: true, weight: 700, color: C.dim, a: a1 }); txt(ctx, 'shares sum to 100 %', sx + sw, sy - 30, { size: 24, color: C.dim, align: 'right', a: a1 * lin(t, at(s, 1, .9), .4) });
      'ABC'.split('').forEach((k, i) => { const w = sw * EX[k].share / 100, a = a1 * lin(t, at(s, 1, [.5, .68, .86][i]), .4); ctx.globalAlpha = a; ctx.fillStyle = C[k]; ctx.fillRect(x, sy, w - 3, 52); if (w > 70) txt(ctx, k, x + w / 2, sy + 27, { size: 28, weight: 700, align: 'center', color: '#0b1016' }); x += w; });
      ctx.globalAlpha = 1;
    }
    // K formula
    const a2 = lin(t, c[2] + .2, .7);
    if (a2 > 0) {
      box(ctx, 236, 772, 1160, 110, { a: a2 * .98, fill: '#101820', stroke: 'rgba(255,255,255,.2)' });
      ctx.globalAlpha = a2;
      formula(ctx, 276, 828, [['K', C.accent], [' = ', C.dim], ['V control / Σ V pre', C.ink, lin(t, at(s, 2, .3), .3)], [' = ', C.dim, lin(t, at(s, 2, .55), .3)], ['72.05 / 65.5', C.ink, lin(t, at(s, 2, .55), .3)], [' = ', C.dim, lin(t, at(s, 2, .8), .3)], ['1.10', C.accent, lin(t, at(s, 2, .8), .3)]], { size: 40 });
      ctx.globalAlpha = 1;
    }
    // total check
    const a3 = lin(t, at(s, 3, .72), .5);
    if (a3 > 0) { box(ctx, cx, cy + 130, 420, 110, { a: a3, stroke: C.ok, lw: 3, fill: '#101820' }); txt(ctx, '52.80 + 16.50 + 2.75', cx + 30, cy + 164, { size: 26, mono: true, weight: 700, a: a3 }); txt(ctx, '= 72.05 m³  ✓', cx + 30, cy + 208, { size: 32, mono: true, weight: 700, color: C.ok, a: a3 }); }
    const a4 = lin(t, c[4] + .3, .7);
    if (a4 > 0) {
      chip(ctx, 815, 255 + 0, ' ', { a: 0 });
      box(ctx, 1400, 150, 420, 240, { a: a4 * .98, stroke: C.hot, lw: 3, fill: '#101820' });
      txt(ctx, 'K = 1.10', 1430, 200, { size: 40, mono: true, weight: 700, color: C.hot, a: a4 });
      txt(ctx, 'a reconciled estimate,\nnot extra oil.\nIt does not show which\nwell was in error.', 1430, 252, { size: 25, lh: 1.35, a: a4 });
    }
  },
});
