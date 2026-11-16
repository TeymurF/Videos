// Field facilities (gathering, separation, treatment, handover) and Part 2: crude transport, gas processing.
const MIXC = [C.oil, C.gas, C.oil, C.water];

// ---------- 8. Gathering ----------
SCENES.push({
  id: 'gather', title: 'Gathering the production', amb: 'sea', part: 0,
  cues: [
    'Each well sends a mixed stream of oil, gas and water through a flowline to a manifold. Offshore, subsea wells connect to a platform or a floating unit through flowlines and risers.',
    'Along the way, pressure and temperature drop. That can cause wax, hydrates or liquid slugs, so operators use insulation, heating, chemicals and pigging to keep the flow moving.',
  ],
  draw(ctx, t, c, s) {
    const sy = 270, by = 790, mx = 1000, fx = 1180;
    sky(ctx, sy); sea(ctx, sy, by, t);
    const trees = [260, 520, 1500, 1720];
    for (const x of trees) { ctx.fillStyle = '#8d9499'; ctx.fillRect(x - 8, by, 16, 200); const p = [[x, by - 20], [x < mx ? x + 60 : x - 60, by - 14], [x < mx ? mx - 70 : mx + 70, by - 14]]; pipe(ctx, p, { w: 8, color: '#6f8091' }); dots(ctx, p, t, { colors: MIXC, speed: 70, gap: 24, r: 5 }); ctx.fillStyle = C.accent; rr(ctx, x - 22, by - 44, 44, 44, 6); ctx.fill(); ctx.fillStyle = '#c0563b'; rr(ctx, x - 12, by - 60, 24, 18, 4); ctx.fill(); }
    ctx.fillStyle = '#46627a'; rr(ctx, mx - 70, by - 50, 140, 50, 8); ctx.fill(); ctx.fillStyle = C.accent; ctx.fillRect(mx - 60, by - 42, 120, 6);
    // riser up to the floating unit
    const riser = []; for (let i = 0; i <= 20; i++) { const u = i / 20; riser.push([lerp(mx + 40, fx + 150, u) + 90 * Math.sin(u * Math.PI), lerp(by - 50, sy + 20, u)]); }
    pipe(ctx, riser, { w: 8, color: '#6f8091' }); dots(ctx, riser, t, { colors: MIXC, speed: 90, gap: 24, r: 5 });
    ship(ctx, fx, sy, .95, 'fpso', t);
    label(ctx, 260, by - 50, 200, by - 190, 'Subsea tree', { a: win(t, c[0] + .8, c[1]) }); label(ctx, mx, by - 50, mx - 220, by - 230, 'Manifold', { a: win(t, at(s, 0, .3), c[1]), align: 'right' });
    label(ctx, riser[10][0], riser[10][1], riser[10][0] + 150, riser[10][1] + 30, 'Riser', { a: win(t, at(s, 0, .6), c[1]) }); label(ctx, fx - 60, sy - 80, fx - 420, sy - 150, 'Floating production unit', { a: win(t, at(s, 0, .72), s.e[1]), align: 'right' });
    label(ctx, 760, by - 14, 640, by - 120, 'Flowline', { a: win(t, at(s, 0, .2), c[1]), align: 'right' });
    // pressure and temperature fall along the route
    const a1 = lin(t, c[1] + .3, .8);
    chip(ctx, 300, by - 110, 'at the well: high pressure, hot', { a: a1, size: 24, align: 'center', color: C.hot }); chip(ctx, 1520, 400, 'at the surface: lower pressure, cooler', { a: a1 * lin(t, c[1] + 1.2, .5), size: 24, align: 'center', color: C.cold });
    // close-up: wax building on the pipe wall, removed by a pig
    const a2 = lin(t, at(s, 1, .3), .8);
    if (a2 > 0) {
      const cx = 560, cy = 500, r = 190, cyc = ((t - at(s, 1, .3)) % 7) / 7, wax = cyc < .6 ? cyc / .6 : 0, pigx = cx - 260 + clamp((cyc - .6) / .3) * 520, cleaned = cyc >= .6;
      ctx.save(); ctx.globalAlpha = a2; ctx.strokeStyle = C.accent; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(760, by - 20); ctx.lineTo(cx + 60, cy + r - 10); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fillStyle = '#0d1319'; ctx.fill(); ctx.save(); ctx.clip();
      ctx.fillStyle = '#7a4d16'; ctx.fillRect(cx - r, cy - 70, 2 * r, 140); dots(ctx, [[cx - r, cy], [cx + r, cy]], t, { colors: MIXC, speed: 80, gap: 30, r: 7 });
      for (const sd of [-1, 1]) { ctx.fillStyle = '#f1e3b0'; for (let x = cx - r; x < cx + r; x += 10) { const th = (cleaned && x < pigx ? 0 : (cleaned ? 1 : wax)) * (22 + 8 * Math.sin(x * .09 + sd)); ctx.fillRect(x, sd < 0 ? cy - 70 : cy + 70 - th, 10, th); } }
      ctx.fillStyle = '#93a4b3'; ctx.fillRect(cx - r, cy - 90, 2 * r, 20); ctx.fillRect(cx - r, cy + 70, 2 * r, 20);
      if (cleaned && cyc < .93) { ctx.fillStyle = '#c0563b'; rr(ctx, pigx - 44, cy - 56, 88, 112, 14); ctx.fill(); ctx.fillStyle = '#12181e'; ctx.fillRect(pigx - 34, cy - 70, 12, 140); ctx.fillRect(pigx + 22, cy - 70, 12, 140); }
      ctx.restore(); ctx.strokeStyle = C.accent; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke(); ctx.restore();
      chip(ctx, cx, cy - r - 30, cleaned ? 'a pig scrapes the line clean' : 'wax builds up as the stream cools', { a: a2, size: 24, align: 'center' });
      ['insulation', 'heating', 'chemicals', 'pigging'].forEach((w, i) => chip(ctx, 1020 + i * 210, 560, w, { a: lin(t, at(s, 1, .5 + i * .09), .4), size: 26, align: 'center', color: C.ok, tc: C.ok }));
      txt(ctx, 'FLOW ASSURANCE', 1020 - 78, 506, { size: 22, mono: true, weight: 700, color: C.dim, a: lin(t, at(s, 1, .5), .4) });
    }
  },
});

// ---------- 9. Separation ----------
SCENES.push({
  id: 'separate', title: 'Separation', amb: 'plant', part: 0,
  cues: [
    'At the production facility, a separator slows the stream down. Gas rises to the top, water settles to the bottom, and oil floats between them.',
    'Level controls regulate each outlet. Several pressure stages recover more liquid, and the gas from every stage is collected and compressed.',
  ],
  events(s) { return [{ t: at(s, 1, .12), type: 'valve' }, { t: at(s, 1, .5), type: 'whoosh' }]; },
  draw(ctx, t, c, s) {
    const x = 260, y = 190, w = 1240, h = 330, wx = x + w * .74, yo = y + h * .42, yw = y + h * .72;
    // inlet
    pipe(ctx, [[60, y + h * .3], [x + 30, y + h * .3]], { w: 22 }); dots(ctx, [[60, y + h * .3], [x + 60, y + h * .3]], t, { colors: MIXC, speed: 130, gap: 24, r: 7 });
    ctx.save(); rr(ctx, x, y, w, h, h / 2); ctx.clip();
    ctx.fillStyle = '#243039'; ctx.fillRect(x, y, w, h); ctx.fillStyle = C.oil; ctx.fillRect(x, yo, w, h); ctx.fillStyle = C.water; ctx.fillRect(x, yw, wx - x, h);
    ctx.fillStyle = '#93a4b3'; ctx.fillRect(x + 150, y + 30, 12, h * .5); ctx.fillRect(wx, yw - 46, 12, h);  // inlet diverter, weir
    for (let i = 0; i < 6; i++) { ctx.fillStyle = '#566574'; ctx.fillRect(x + w * .86 + i * 14, y + 16, 6, h * .26); } // mist extractor
    const R = rng(21);
    for (let i = 0; i < 46; i++) { const u = (R() + t * .16) % 1, bx = x + 190 + R() * (w - 320); ctx.globalAlpha = (1 - u) * .9; ctx.fillStyle = '#d8f5e6'; ctx.beginPath(); ctx.arc(bx + u * 60, yo - 6 - u * (yo - y - 30), 3 + R() * 5, 0, TAU); ctx.fill(); }
    for (let i = 0; i < 36; i++) { const u = (R() + t * .1) % 1, bx = x + 200 + R() * (wx - x - 260); ctx.globalAlpha = .9; ctx.fillStyle = C.water; ctx.beginPath(); ctx.arc(bx + u * 80, yo + 8 + u * (yw - yo - 10), 3 + R() * 4, 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 1; ctx.restore();
    ctx.strokeStyle = '#93a4b3'; ctx.lineWidth = 8; rr(ctx, x, y, w, h, h / 2); ctx.stroke();
    // three outlets
    const og = [[x + w * .9, y], [x + w * .9, 130], [1840, 130]], oo = [[x + w * .86, y + h], [x + w * .86, 600], [1840, 600]], ow = [[x + w * .5, y + h], [x + w * .5, 600], [x + w * .5 - 300, 600]];
    pipe(ctx, og, { w: 14 }); pipe(ctx, oo, { w: 14 }); pipe(ctx, ow, { w: 14 });
    dots(ctx, og, t, { color: C.gas, speed: 130, gap: 34, r: 6 }); dots(ctx, oo, t, { color: C.oil, speed: 90, gap: 30, r: 6 }); dots(ctx, ow, t, { color: C.water, speed: 90, gap: 30, r: 6 });
    const hlc = t > c[1] + .2 && t < at(s, 1, .45);
    [[x + w * .9 + 180, 130], [x + w * .86 + 150, 600], [x + w * .5 - 150, 600]].forEach((v, i) => { valve(ctx, v[0], v[1], 1); if (hlc) { ctx.strokeStyle = C.accent; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(v[0], v[1], 30, 0, TAU); ctx.stroke(); } });
    txt(ctx, 'gas', x + w * .9 + 260, 96, { size: 30, weight: 700, color: C.gas }); txt(ctx, 'oil', x + w * .86 + 230, 566, { size: 30, weight: 700, color: C.oil }); txt(ctx, 'water', x + w * .5 - 290, 566, { size: 30, weight: 700, color: C.water, align: 'right' });
    const L = (ax, ay, tx, ty, str, k, al, col) => label(ctx, ax, ay, tx, ty, str, { a: win(t, at(s, 0, k), c[1]), align: al, color: col });
    L(x + 156, y + 90, x + 120, y - 60, 'Inlet device slows the stream', .15, 'left'); L(x + w * .45, y + 60, x + w * .45 + 60, y - 60, 'Gas disengages', .35, 'left', C.gas);
    L(x + w * .35, (yo + yw) / 2, 150, 640, 'Oil layer', .5, 'left', C.oil); L(x + w * .25, yw + 40, 150, 720, 'Water settles', .62, 'left', C.water); L(wx + 6, yw - 30, wx + 130, yw + 150, 'Weir: only oil spills over', .78, 'left');
    label(ctx, x + w * .89, y + 50, x + w * .89 + 210, y + 50, 'Mist extractor', { a: win(t, at(s, 0, .9), c[1] + 3) });
    chip(ctx, 960, 690, 'Level controllers set the valve on each outlet', { a: win(t, c[1] + .3, at(s, 1, .45)), size: 28, align: 'center' });
    // pressure stages
    const a1 = lin(t, at(s, 1, .42), .8);
    if (a1 > 0) {
      ctx.save(); ctx.globalAlpha = a1; box(ctx, 120, 660, 1680, 240, { fill: 'rgba(11,16,22,.96)', stroke: 'rgba(255,255,255,.18)' });
      txt(ctx, 'PRESSURE STAGES', 156, 700, { size: 22, mono: true, weight: 700, color: C.dim });
      const st = [['High pressure', 420], ['Medium pressure', 800], ['Low pressure', 1180]];
      pipe(ctx, [[180, 800], [1560, 800]], { w: 12 }); dots(ctx, [[180, 800], [1560, 800]], t, { color: C.oil, speed: 90, gap: 30, r: 6 });
      pipe(ctx, [[420, 730], [1560, 730]], { w: 8 }); dots(ctx, [[420, 730], [1560, 730]], t, { color: C.gas, speed: 120, gap: 30, r: 5 });
      st.forEach((p, i) => { ctx.globalAlpha = a1 * lin(t, at(s, 1, .5 + i * .12), .4); pipe(ctx, [[p[1], 770], [p[1], 730]], { w: 8 }); vessel(ctx, p[1] - 90, 765, 180, 70, { t, seed: i }); txt(ctx, p[0], p[1], 876, { size: 22, weight: 600, align: 'center' }); });
      ctx.globalAlpha = a1; compSym(ctx, 1610, 730, 1, t); txt(ctx, 'to compression', 1660, 730, { size: 22, color: C.gas }); txt(ctx, 'stabilised oil', 1580, 800, { size: 22, color: C.oil });
      ctx.restore();
    }
  },
});

// ---------- 10. Oil treatment and produced water ----------
SCENES.push({
  id: 'treat', title: 'Treating the oil and the water', amb: 'plant', part: 0,
  cues: [
    'The oil is then treated. Heat, chemicals and electrostatic coalescers break the remaining emulsion, and stabilisation removes the lightest components.',
    'Produced water has its own treatment train, before reuse, reinjection or permitted disposal. The recovered oil goes back into the process.',
  ],
  draw(ctx, t, c, s) {
    const yo = 330, yw = 720;
    txt(ctx, 'OIL', 120, 180, { size: 26, mono: true, weight: 700, color: C.oil }); txt(ctx, 'WATER', 120, 596, { size: 26, mono: true, weight: 700, color: C.water, a: lin(t, c[1] - .3, .6) });
    // oil train
    const po = [[120, yo], [1560, yo]]; pipe(ctx, po, { w: 14 }); dots(ctx, po, t, { color: C.oil, speed: 100, gap: 32, r: 6 });
    const k = i => lin(t, at(s, 0, .08 + i * .2), .5);
    ctx.globalAlpha = k(0); hxSym(ctx, 330, yo, 44); flame(ctx, 330, yo + 96, .8, t); txt(ctx, 'Heater', 330, yo - 74, { size: 24, weight: 600, align: 'center' });
    // electrostatic coalescer cutaway
    ctx.globalAlpha = k(1); const cx = 560, cw = 420, ch = 210, cy = yo - ch / 2;
    ctx.save(); rr(ctx, cx, cy, cw, ch, ch / 2); ctx.clip(); ctx.fillStyle = C.oil; ctx.fillRect(cx, cy, cw, ch); ctx.fillStyle = C.water; ctx.fillRect(cx, cy + ch * .78, cw, ch);
    for (let i = 0; i < 7; i++) { ctx.fillStyle = i % 2 ? '#fff' : C.accent; ctx.globalAlpha = k(1) * (.55 + .45 * Math.sin(t * 9 + i)); ctx.fillRect(cx + 90 + i * 40, cy + 26, 4, ch * .5); }
    const R = rng(31); for (let i = 0; i < 40; i++) { const u = (R() + t * .14) % 1, grow = 2 + 9 * u * u; ctx.globalAlpha = k(1); ctx.fillStyle = C.water; ctx.beginPath(); ctx.arc(cx + 70 + R() * (cw - 140) + Math.sin(t * 12 + i) * 3 * (1 - u), cy + 30 + u * u * ch * .68 + R() * 20 * (1 - u), grow, 0, TAU); ctx.fill(); }
    ctx.restore(); ctx.globalAlpha = k(1); ctx.strokeStyle = '#93a4b3'; ctx.lineWidth = 6; rr(ctx, cx, cy, cw, ch, ch / 2); ctx.stroke();
    txt(ctx, 'Electrostatic coalescer', cx + cw / 2, cy - 30, { size: 24, weight: 600, align: 'center' }); txt(ctx, 'small water droplets merge and fall', cx + cw / 2, cy + ch + 34, { size: 22, color: C.dim, align: 'center' });
    ctx.globalAlpha = k(2); tower(ctx, 1150, yo - 190, 100, 300, { trays: 8, tint: '#3a2c14', name: 'Stabiliser' }); pipe(ctx, [[1150, yo - 190], [1150, yo - 230], [1330, yo - 230]], { w: 8 }); dots(ctx, [[1150, yo - 190], [1150, yo - 230], [1330, yo - 230]], t, { color: C.gas, speed: 110, gap: 28, r: 5, a: k(2) }); txt(ctx, 'light ends', 1345, yo - 230, { size: 22, color: C.gas });
    ctx.globalAlpha = k(3); tank(ctx, 1560, yo - 120, 200, 220, .5 + .25 * Math.sin(t * .3)); txt(ctx, 'Export storage', 1660, yo + 134, { size: 24, weight: 600, align: 'center' });
    ctx.globalAlpha = 1;
    // water train
    const a1 = lin(t, c[1] - .2, .8);
    if (a1 > 0) {
      ctx.save(); ctx.globalAlpha = a1; const kw = i => lin(t, at(s, 1, .06 + i * .16), .5);
      const drop = [[cx + cw * .5, cy + ch], [cx + cw * .5, yw], [330, yw]]; pipe(ctx, drop, { w: 10 }); dots(ctx, drop, t, { color: C.water, speed: 90, gap: 28, r: 5 });
      const pw = [[330, yw], [1500, yw]]; pipe(ctx, pw, { w: 14 }); dots(ctx, pw, t, { color: C.water, speed: 100, gap: 32, r: 6 });
      ctx.globalAlpha = a1 * kw(0); ctx.fillStyle = '#6f8091'; ctx.beginPath(); ctx.moveTo(560, yw - 70); ctx.lineTo(640, yw - 70); ctx.lineTo(612, yw + 70); ctx.lineTo(588, yw + 70); ctx.closePath(); ctx.fill(); ctx.strokeStyle = C.water; ctx.lineWidth = 4; ctx.beginPath(); for (let i = 0; i < 40; i++) { const u = i / 40; ctx.lineTo(600 + Math.cos(u * 22 + t * 6) * 30 * (1 - u), yw - 60 + u * 120); } ctx.stroke(); txt(ctx, 'Hydrocyclone', 600, yw + 106, { size: 22, weight: 600, align: 'center' });
      ctx.globalAlpha = a1 * kw(1); const fx2 = 860; ctx.fillStyle = '#1b2d3c'; rr(ctx, fx2, yw - 70, 300, 140, 12); ctx.fill(); ctx.fillStyle = C.water; ctx.fillRect(fx2 + 6, yw - 40, 288, 104); ctx.fillStyle = C.oil; ctx.fillRect(fx2 + 6, yw - 46, 288, 10);
      const R2 = rng(9); for (let i = 0; i < 26; i++) { const u = (R2() + t * .25) % 1; ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.beginPath(); ctx.arc(fx2 + 20 + R2() * 260, yw + 56 - u * 92, 3, 0, TAU); ctx.fill(); }
      ctx.strokeStyle = '#93a4b3'; ctx.lineWidth = 5; rr(ctx, fx2, yw - 70, 300, 140, 12); ctx.stroke(); txt(ctx, 'Flotation: bubbles lift the oil', fx2 + 150, yw + 106, { size: 22, weight: 600, align: 'center' });
      // recovered oil returns to the oil train
      ctx.globalAlpha = a1 * kw(2); const rec = [[fx2 + 150, yw - 70], [fx2 + 150, 520], [440, 520], [440, yo + 10]]; ctx.strokeStyle = C.oil; ctx.lineWidth = 4; ctx.setLineDash([12, 9]); ctx.beginPath(); rec.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke(); ctx.setLineDash([]); dots(ctx, rec, t, { color: C.oil, speed: 70, gap: 40, r: 5, a: a1 * kw(2) }); txt(ctx, 'recovered oil returns', 700, 548, { size: 22, color: C.oil, weight: 600 });
      ctx.globalAlpha = a1 * kw(3); pumpSym(ctx, 1330, yw, 34, t, { color: C.water });
      ['reuse', 'reinjection', 'permitted disposal'].forEach((d, i) => chip(ctx, 1540, yw - 70 + i * 70, d, { a: lin(t, at(s, 1, .55 + i * .1), .4), size: 26, color: C.water, tc: C.water }));
      ctx.restore();
    }
  },
});

// ---------- 11. Measurement and handover ----------
SCENES.push({
  id: 'handover', title: 'Measurement and handover', amb: 'plant', part: 0,
  cues: [
    'Meters and laboratory samples establish quantity and quality. Where streams from many wells are mixed, back allocation assigns the totals to individual wells.',
    'At the transfer point, a custody-transfer meter and a quality certificate record exactly what was delivered. Ownership changes. The fluid does not.',
  ],
  events(s) { return [{ t: at(s, 1, .55), type: 'ding' }, { t: at(s, 1, .15), type: 'whoosh' }]; },
  draw(ctx, t, c, s) {
    const y = 640, line = [[60, y], [1860, y]];
    pipe(ctx, line, { w: 26 }); dots(ctx, line, t, { color: C.oil, speed: 120, gap: 38, r: 8 });
    tank(ctx, 120, y - 190, 180, 190, .6); txt(ctx, 'Export storage', 210, y + 60, { size: 22, weight: 600, align: 'center', color: C.dim });
    // metering skid
    ctx.fillStyle = '#16212c'; rr(ctx, 560, y - 70, 480, 140, 14); ctx.fill(); ctx.strokeStyle = '#3a4652'; ctx.lineWidth = 3; ctx.stroke();
    pipe(ctx, [[560, y], [1040, y]], { w: 26 }); dots(ctx, [[560, y], [1040, y]], t, { color: C.oil, speed: 120, gap: 38, r: 8 });
    meter(ctx, 700, y, { t, color: C.accent, r: 44, hl: true }); ctx.fillStyle = C.cold; rr(ctx, 880, y - 100, 22, 90, 6); ctx.fill(); ctx.fillStyle = '#c9d3dc'; rr(ctx, 868, y - 130, 46, 36, 6); ctx.fill();
    txt(ctx, 'Flow meter', 700, y + 104, { size: 22, weight: 600, align: 'center' }); txt(ctx, 'Sampler', 891, y + 104, { size: 22, weight: 600, align: 'center' });
    // data to the accounting system
    const a0 = lin(t, c[0] + .5, .8);
    box(ctx, 540, 150, 520, 300, { a: a0, stroke: C.data, lw: 3 }); txt(ctx, 'PRODUCTION ACCOUNTING', 572, 194, { size: 22, mono: true, weight: 700, color: C.data, a: a0 });
    [['Quantity', (18250 + t * 2.3).toFixed(1) + ' m³'], ['Density', '842 kg/m³'], ['Water and sediment', '0.3 %'], ['Temperature', '41 °C']].forEach((r, i) => { const a = a0 * lin(t, at(s, 0, .15 + i * .1), .4); txt(ctx, r[0], 572, 250 + i * 50, { size: 26, color: C.dim, a }); txt(ctx, r[1], 1030, 250 + i * 50, { size: 28, mono: true, weight: 700, align: 'right', a }); });
    dataLine(ctx, [[700, y - 50], [700, 458]], t, { a: a0 }); dataLine(ctx, [[891, y - 134], [891, 458]], t, { a: a0 });
    txt(ctx, 'example values', 800, 472, { size: 18, color: C.dim, align: 'center', a: a0 });
    // back allocation to wells
    const ab = win(t, at(s, 0, .55), c[1] + .2);
    if (ab > 0) { ['A', 'B', 'C'].forEach((w, i) => { const wy = 130 + i * 78; ctx.globalAlpha = ab; ctx.save(); ctx.translate(200, wy + 50); ctx.scale(.2, .2); drawPumpjack(ctx, TH(GT) + i * 2, { flowLen: 30 }); ctx.restore(); txt(ctx, 'Well ' + w, 300, wy + 30, { size: 24, weight: 600 }); ctx.globalAlpha = 1; dataLine(ctx, [[536, 300], [450, 300], [450, wy + 30], [390, wy + 30]], t, { a: ab, k: lin(t, at(s, 0, .6) + i * .25, 1) }); }); chip(ctx, 300, 404, 'back allocation: totals → wells', { a: ab, size: 22, align: 'center', color: C.data, tc: C.data }); }
    // custody transfer
    const a1 = lin(t, c[1] + .2, .7), tx = 1220;
    if (a1 > 0) {
      ctx.save(); ctx.globalAlpha = a1; ctx.strokeStyle = C.accent; ctx.lineWidth = 4; ctx.setLineDash([16, 12]); ctx.beginPath(); ctx.moveTo(tx, 140); ctx.lineTo(tx, 900); ctx.stroke(); ctx.setLineDash([]);
      chip(ctx, tx, 150, 'TRANSFER POINT', { size: 24, mono: true, align: 'center', tc: C.accent }); txt(ctx, 'producer', tx - 30, 740, { size: 28, weight: 700, align: 'right', color: C.up }); txt(ctx, 'transporter', tx + 30, 740, { size: 28, weight: 700, color: C.mid });
      const kc = pr(t, at(s, 1, .15), .9); ctx.translate((1 - kc) * 200, 0); ctx.globalAlpha = a1 * kc;
      box(ctx, 1320, 190, 500, 370, { fill: '#f4f1e8', stroke: '#c9c2ad', r: 10 }); txt(ctx, 'QUALITY CERTIFICATE', 1356, 240, { size: 26, mono: true, weight: 700, color: '#2a2a2a' }); ctx.fillStyle = '#c9c2ad'; ctx.fillRect(1356, 266, 428, 3);
      ['Quantity delivered', 'Density', 'Water and sediment', 'Sulfur content'].forEach((r, i) => { const a = lin(t, at(s, 1, .25 + i * .07), .3); txt(ctx, r, 1356, 310 + i * 52, { size: 26, color: '#333', a }); txt(ctx, '✓', 1770, 310 + i * 52, { size: 30, weight: 700, color: '#1c8f52', align: 'right', a }); });
      const ks = lin(t, at(s, 1, .55), .25); ctx.save(); ctx.globalAlpha = a1 * ks; ctx.translate(1640, 500); ctx.rotate(-.18); ctx.scale(2 - ks, 2 - ks); ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 5; rr(ctx, -110, -30, 220, 60, 8); ctx.stroke(); txt(ctx, 'ACCEPTED', 0, 2, { size: 34, mono: true, weight: 700, color: '#c0392b', align: 'center' }); ctx.restore();
      ctx.restore();
      chip(ctx, 1220, 850, 'Custody and responsibility change.  The fluid stays the same.', { a: lin(t, at(s, 1, .7), .5), size: 28, align: 'center' });
    }
  },
});

partCard(1, 'Part two: midstream. Move the oil and the gas, process them, and store them on the way to market.', 'Move it, process it, store it');

// ---------- 12. Moving crude oil ----------
SCENES.push({
  id: 'crude', title: 'Moving crude oil', amb: 'plant', part: 1,
  cues: [
    'Crude oil travels by pipeline, tanker, rail or truck. On a pipeline, pump stations restore the pressure lost to friction.',
    'Terminals store, measure and dispatch the crude. Tanks buffer the gap between production, shipping and refinery demand, and different grades travel in separate batches.',
    'Control rooms watch pressures and flows around the clock. Coatings and cathodic protection fight corrosion, and inspection pigs travel inside the line to check its condition.',
  ],
  events(s) { return [0, 1, 2, 3].map(i => ({ t: at(s, 0, .1 + i * .1), type: 'tick' })); },
  draw(ctx, t, c, s) {
    const py = 560, x0 = 100, x1 = 1820, ps = [380, 860, 1340];
    // batched pipeline, drawn as a cutaway
    ctx.fillStyle = '#93a4b3'; ctx.fillRect(x0, py - 30, x1 - x0, 60); ctx.save(); ctx.beginPath(); ctx.rect(x0, py - 22, x1 - x0, 44); ctx.clip();
    const off = (t * 70) % 760; for (let i = -2; i < 4; i++) { const bx = x0 + i * 760 + off; ctx.fillStyle = C.oil; ctx.fillRect(bx, py - 22, 380, 44); ctx.fillStyle = '#7a4a22'; ctx.fillRect(bx + 380, py - 22, 380, 44); for (const ix of [bx + 380, bx + 760]) { const g = ctx.createLinearGradient(ix - 30, 0, ix + 30, 0); const a = ix === bx + 380; g.addColorStop(0, a ? C.oil : '#7a4a22'); g.addColorStop(1, a ? '#7a4a22' : C.oil); ctx.fillStyle = g; ctx.fillRect(ix - 30, py - 22, 60, 44); } }
    ctx.restore();
    for (const x of ps) { ctx.fillStyle = '#16212c'; rr(ctx, x - 54, py - 54, 108, 108, 12); ctx.fill(); pumpSym(ctx, x, py, 40, t, { color: C.accent }); }
    // pressure profile
    const a0 = lin(t, c[0] + .8, .8) * (1 - .0), gy0 = 460, gh = 160;
    ctx.save(); ctx.globalAlpha = a0 * (1 - .7 * lin(t, c[2], .6)); txt(ctx, 'PRESSURE ALONG THE LINE', x0, gy0 - gh - 20, { size: 22, mono: true, weight: 700, color: C.dim });
    ctx.strokeStyle = C.hot; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.beginPath(); const P = x => { let last = x0; for (const p of ps) if (x >= p) last = p; return gy0 - gh * (.95 - .75 * (x - last) / 480); }; const kx = lerp(x0, x1, lin(t, c[0] + 1, 3));
    for (let x = x0; x <= kx; x += 4) x === x0 ? ctx.moveTo(x, P(x)) : ctx.lineTo(x, P(x)); ctx.stroke();
    for (const x of ps) if (kx > x) { arrow(ctx, x, gy0 - 20, x, gy0 - gh + 10, { color: C.accent, w: 4, a: .9 }); }
    ctx.restore();
    label(ctx, ps[0], py - 54, ps[0] - 40, py + 130, 'Pump station', { a: win(t, at(s, 0, .55), c[1]), align: 'right' });
    // transport modes
    const modes = ['Pipeline', 'Tanker', 'Rail', 'Truck'];
    modes.forEach((m, i) => { const a = win(t, at(s, 0, .1 + i * .1), c[1]), x = 1180 + i * 170, yy = 160; if (a <= 0) return; ctx.globalAlpha = a; if (i === 0) { pipe(ctx, [[x - 50, yy], [x + 50, yy]], { w: 16 }); } if (i === 1) ship(ctx, x, yy + 10, .2, 'tanker', t); if (i === 2) railcar(ctx, x, yy + 26, .5); if (i === 3) truck(ctx, x, yy + 26, .45); ctx.globalAlpha = 1; txt(ctx, m, x, yy + 62, { size: 22, weight: 600, align: 'center', a }); });
    // terminal: tanks, batches, marine loading
    const a1 = win(t, c[1] - .1, c[2] + .2, .7);
    if (a1 > 0) {
      ctx.save(); ctx.globalAlpha = a1;
      [0, 1, 2, 3].forEach(i => { const x = 300 + i * 190, lv = .5 + .35 * Math.sin(t * .5 + i * 1.7); pipe(ctx, [[x + 60, py + 30], [x + 60, 690]], { w: 8 }); tank(ctx, x, 690, 120, 150, lv, { fluid: i % 2 ? '#7a4a22' : undefined }); });
      txt(ctx, 'Storage buffers\nsupply and demand', 1010, 760, { size: 24, weight: 600, lh: 1.25 });
      ctx.fillStyle = '#15526f'; ctx.fillRect(1250, 800, 670, 70); ship(ctx, 1560, 800, .62, 'tanker', t); pipe(ctx, [[1300, py + 30], [1300, 740], [1470, 740], [1470, 770]], { w: 8 }); dots(ctx, [[1300, py + 30], [1300, 740], [1470, 740], [1470, 770]], t, { color: C.oil, speed: 80, gap: 26, r: 5 });
      txt(ctx, 'Marine loading', 1300, 700, { size: 24, weight: 600 });
      ctx.restore();
      chip(ctx, 660, py - 70, 'grade A', { a: a1, size: 22, align: 'center', color: C.oil }); chip(ctx, 1060, py - 70, 'grade B', { a: a1, size: 22, align: 'center', color: '#a8703a' }); chip(ctx, 1560, py - 70, 'batches, with a managed interface', { a: a1 * lin(t, at(s, 1, .6), .5), size: 22, align: 'center' });
    }
    // control and integrity
    const a2 = lin(t, c[2] + .1, .8);
    if (a2 > 0) {
      ctx.save(); ctx.globalAlpha = a2;
      box(ctx, 110, 150, 620, 280, { stroke: C.data, lw: 3 }); txt(ctx, 'CONTROL ROOM', 144, 194, { size: 22, mono: true, weight: 700, color: C.data });
      [['pressure', C.hot], ['flow', C.ok], ['temperature', C.cold]].forEach((tr, i) => { txt(ctx, tr[0], 144, 250 + i * 60, { size: 22, color: C.dim }); ctx.strokeStyle = tr[1]; ctx.lineWidth = 3; ctx.beginPath(); for (let k = 0; k <= 60; k++) { const x = 300 + k * 6.6, yy = 250 + i * 60 + 12 * Math.sin((k + t * 12) * .25 + i * 2) + 5 * Math.sin((k + t * 12) * .7); k ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); } ctx.stroke(); });
      for (const x of [240, 620, 1100, 1580]) { ctx.fillStyle = C.data; ctx.beginPath(); ctx.arc(x, py - 36, 9, 0, TAU); ctx.fill(); dataLine(ctx, [[x, py - 46], [x, 470], [Math.min(x, 700), 470], [Math.min(x, 700), 436]], t, { w: 3 }); }
      // inspection pig
      const px = x0 + ((t - c[2]) * 110) % (x1 - x0); ctx.fillStyle = '#d8e1e9'; rr(ctx, px - 50, py - 16, 100, 32, 10); ctx.fill(); ctx.fillStyle = '#c0563b'; ctx.fillRect(px - 44, py - 22, 10, 44); ctx.fillRect(px + 34, py - 22, 10, 44); ctx.fillStyle = C.accent; for (let i = 0; i < 4; i++) ctx.fillRect(px - 20 + i * 12, py - 22, 4, 44);
      label(ctx, px, py + 22, clamp(px, 260, 1500), py + 150, 'Inspection pig\nmeasures the pipe wall', { a: a2 * lin(t, at(s, 2, .62), .5) });
      for (const x of [1000, 1700]) { valve(ctx, x, py - 46, 1, { vert: false }); }
      chip(ctx, 1320, 300, 'isolation valves divide the line into sections', { a: lin(t, at(s, 2, .2), .5), size: 24, align: 'center', color: C.dim });
      chip(ctx, 1320, 370, 'coating + cathodic protection against corrosion', { a: lin(t, at(s, 2, .4), .5), size: 24, align: 'center', color: C.ok });
      ctx.restore();
    }
  },
});

// ---------- 13. Processing natural gas ----------
const GCOMP = [['methane', C.gas, .54], ['heavier hydrocarbons', C.ngl, .2], ['CO₂', '#9aa6b2', .08], ['H₂S', C.sulfur, .06], ['water vapour', C.water, .12]];
SCENES.push({
  id: 'gasplant', title: 'Processing natural gas', amb: 'plant', part: 1,
  cues: [
    'Now the gas. Raw gas carries water vapour, carbon dioxide, hydrogen sulfide and heavier hydrocarbons. Each has to be dealt with.',
    'A solvent absorbs the acid gases and is regenerated for reuse. Dehydration removes the water. Hydrogen sulfide is converted into solid sulfur.',
    'Cooling then recovers the natural gas liquids, which are split into ethane, propane, butanes and natural gasoline. What remains is methane-rich sales gas.',
  ],
  events(s) { return [{ t: at(s, 1, .15), type: 'tick' }, { t: at(s, 1, .5), type: 'tick' }, { t: at(s, 1, .8), type: 'ding' }, { t: at(s, 2, .12), type: 'tick' }, { t: at(s, 2, .9), type: 'ding' }]; },
  draw(ctx, t, c, s) {
    const ty = 290, th = 300, by = ty + th, X = { sep: 210, abs: 430, reg: 610, deh: 820, cold: 1030, dem: 1230 };
    const rm = [0, lin(t, at(s, 2, .12), .8), lin(t, at(s, 1, .15), .8), lin(t, at(s, 1, .15), .8), lin(t, at(s, 1, .5), .8)]; // removed fraction per component
    // composition bar
    txt(ctx, 'WHAT IS IN THE GAS', 120, 150, { size: 22, mono: true, weight: 700, color: C.dim }); let bx = 120; const bw = 1400;
    GCOMP.forEach((g, i) => { const w = bw * g[2]; ctx.globalAlpha = 1 - rm[i] * .85; ctx.fillStyle = g[1]; rr(ctx, bx, 176, w - 4, 44, 6); ctx.fill(); ctx.globalAlpha = lin(t, c[0] + .5 + i * .7, .4) * (1 - rm[i] * .6); txt(ctx, g[0], bx + w / 2, 199, { size: w > 200 ? 21 : 18, weight: 700, align: 'center', color: '#0b1016' }); if (rm[i] > .5) { ctx.strokeStyle = C.bad; ctx.lineWidth = 4; ctx.globalAlpha = rm[i]; ctx.beginPath(); ctx.moveTo(bx + 6, 214); ctx.lineTo(bx + w - 10, 182); ctx.stroke(); } bx += w; });
    ctx.globalAlpha = 1; chip(ctx, 1560, 198, rm[1] > .5 ? 'sales gas' : 'raw gas', { size: 26, color: C.gas, tc: C.gas });
    // main gas path
    const main = [[60, 440], [X.sep - 60, 440], [X.sep + 60, 440], [X.abs, 520], [X.abs, ty + 20], [X.deh, ty - 30], [X.deh, ty + 20], [X.cold, 440], [X.dem, 440], [X.dem, ty], [X.dem, ty - 40], [1840, ty - 40]];
    pipe(ctx, [[60, 440], [X.sep - 60, 440]], { w: 14 }); pipe(ctx, [[X.sep + 60, 440], [X.abs - 40, 520]], { w: 12 }); pipe(ctx, [[X.abs, ty], [X.abs, ty - 30], [X.deh, ty - 30], [X.deh, ty]], { w: 12 }); pipe(ctx, [[X.deh + 40, 440], [X.dem - 40, 440]], { w: 12 }); pipe(ctx, [[X.dem, ty], [X.dem, ty - 40], [1840, ty - 40]], { w: 14 });
    vessel(ctx, X.sep - 60, 405, 120, 70, { t }); txt(ctx, 'Inlet\nseparator', X.sep, 520, { size: 20, weight: 600, align: 'center', color: C.dim, lh: 1.15 });
    const on = (a, b) => t > a && t < b;
    tower(ctx, X.abs, ty, 84, th, { trays: 9, tint: '#16302c', name: 'Absorber', hl: on(c[1], at(s, 1, .4)) }); tower(ctx, X.reg, ty + 40, 72, th - 40, { trays: 7, tint: '#3a2218', name: 'Regenerator', hl: on(c[1], at(s, 1, .4)) });
    tower(ctx, X.deh, ty, 84, th, { trays: 0, tint: '#152a3a', name: 'Dehydration', hl: on(at(s, 1, .4), at(s, 1, .7)) });
    hxSym(ctx, X.cold, 440, 42, { c2: C.cold }); txt(ctx, 'Cooling', X.cold, 520, { size: 20, weight: 600, align: 'center', color: C.dim }); txt(ctx, '❄', X.cold, 386, { size: 36, align: 'center', color: C.cold });
    tower(ctx, X.dem, ty, 84, th, { trays: 9, tint: '#16242e', name: 'Liquids\nrecovery', hl: on(c[2], at(s, 2, .4)) });
    dots(ctx, main, t, { color: C.gas, speed: 150, gap: 34, r: 6 });
    // solvent loop between absorber and regenerator
    const loopA = [[X.abs + 30, by - 30], [X.abs + 70, by - 30], [X.abs + 70, by + 84], [X.reg - 62, by + 84], [X.reg - 62, by - 60], [X.reg - 34, by - 60]], loopB = [[X.reg, ty + 50], [X.reg, ty - 6], [X.abs + 60, ty - 6], [X.abs + 44, ty + 30]];
    const al = lin(t, c[1] + .2, .6); pipe(ctx, loopA, { w: 6, a: al, color: '#2e7f72' }); pipe(ctx, loopB, { w: 6, a: al, color: '#2e7f72' }); dots(ctx, loopA, t, { color: '#f0c05a', speed: 80, gap: 26, r: 4.5, a: al }); dots(ctx, loopB, t, { color: '#5fe0cc', speed: 80, gap: 26, r: 4.5, a: al });
    chip(ctx, (X.abs + X.reg) / 2, by + 150, 'solvent circulates and is reused', { a: win(t, c[1] + .5, c[2]), size: 22, align: 'center', color: '#5fe0cc' });
    // side streams: acid gas -> sulfur, water
    const a1 = lin(t, at(s, 1, .15), .6);
    const acid = [[X.reg + 36, ty + 70], [X.reg + 110, ty + 70], [X.reg + 110, 800], [X.reg + 40, 800]]; pipe(ctx, acid, { w: 6, a: a1 }); dots(ctx, acid, t, { colors: ['#9aa6b2', C.sulfur], speed: 80, gap: 24, r: 4.5, a: a1 });
    node(ctx, X.reg - 60, 800, 'Sulfur\nrecovery', { a: a1, w: 190, h: 90, size: 24, color: C.sulfur });
    const ks = lin(t, at(s, 1, .75), 2); ctx.globalAlpha = a1; ctx.fillStyle = C.sulfur; ctx.beginPath(); ctx.moveTo(300, 850); ctx.lineTo(380, 850 - 70 * ks); ctx.lineTo(460, 850); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1; arrow(ctx, X.reg - 160, 810, 440, 810, { color: C.sulfur, w: 5, a: a1 * lin(t, at(s, 1, .7), .4) }); txt(ctx, 'solid sulfur', 380, 880, { size: 22, weight: 600, color: C.sulfur, align: 'center', a: a1 * ks });
    const aw = lin(t, at(s, 1, .5), .6); const wp = [[X.deh + 40, by - 40], [X.deh + 96, by - 40], [X.deh + 96, 760]]; pipe(ctx, wp, { w: 6, a: aw }); dots(ctx, wp, t, { color: C.water, speed: 70, gap: 22, r: 4.5, a: aw }); chip(ctx, X.deh + 96, 790, 'water removed', { a: aw, size: 22, align: 'center', color: C.water, tc: C.water });
    // NGL fractionation
    const a2 = lin(t, at(s, 2, .1), .6);
    if (a2 > 0) {
      const fy = 610, fh = 190, fr = [[1340, 'Ethane'], [1490, 'Propane'], [1640, 'Butanes']];
      const feed = [[X.dem + 38, by - 40], [X.dem + 84, by - 40], [X.dem + 84, by + 110], [fr[0][0] - 34, by + 110]]; pipe(ctx, feed, { w: 8, a: a2, color: '#8a7a3a' }); dots(ctx, feed, t, { color: C.ngl, speed: 80, gap: 24, r: 5, a: a2 });
      fr.forEach((f, i) => { const a = a2 * lin(t, at(s, 2, .3 + i * .13), .5); tower(ctx, f[0], fy, 56, fh, { trays: 6, tint: '#2e2a14', a }); if (i < 2) pipe(ctx, [[f[0] + 20, fy + fh - 20], [fr[i + 1][0] - 30, fy + fh - 20], [fr[i + 1][0] - 30, fy + 100]], { w: 5, a, color: '#8a7a3a' }); arrow(ctx, f[0], fy, f[0], fy - 46, { color: C.ngl, w: 5, a }); txt(ctx, f[1], f[0], fy - 66, { size: 24, weight: 700, align: 'center', color: C.ngl, a }); });
      const an = a2 * lin(t, at(s, 2, .7), .5); arrow(ctx, fr[2][0] + 28, fy + fh - 20, fr[2][0] + 110, fy + fh - 20, { color: C.ngl, w: 5, a: an }); txt(ctx, 'Natural\ngasoline', fr[2][0] + 124, fy + fh - 32, { size: 24, weight: 700, color: C.ngl, a: an, lh: 1.15 });
      txt(ctx, 'NATURAL GAS LIQUIDS', 1330, 880, { size: 22, mono: true, weight: 700, color: C.dim, a: a2 });
    }
    txt(ctx, 'methane-rich sales gas', 1830, ty - 6, { size: 24, weight: 700, color: C.gas, align: 'right', a: lin(t, at(s, 2, .85), .5) });
  },
});
