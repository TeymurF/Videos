// Part 2 (gas pipelines, storage, LNG) and Part 3a: refinery intake, desalting, distillation.

// ---------- 14. Gas transmission and storage ----------
SCENES.push({
  id: 'gasline', title: 'Gas pipelines and storage', amb: 'plant', part: 1,
  cues: [
    'Sales gas moves through transmission pipelines. Compressor stations raise the pressure again and again along the route.',
    'The pipeline itself holds gas, called linepack. And underground storage, in depleted reservoirs, aquifers or salt caverns, balances supply against seasonal demand.',
  ],
  draw(ctx, t, c, s) {
    const gy = 430, py = 380, cs = [460, 1080], x0 = 80, x1 = 1840;
    sky(ctx, gy); strataFlat(ctx, gy, [[70, '#40342a'], [150, '#2e2822'], [600, '#262b30']]);
    // pipeline with pressure shown as brightness; it "breathes" as linepack changes
    const br = 1 + .22 * Math.sin(t * 1.2) * lin(t, c[1], 1) * (1 - lin(t, at(s, 1, .4), 1));
    const seg = [x0, ...cs, x1];
    for (let i = 0; i < seg.length - 1; i++) { const g = ctx.createLinearGradient(seg[i], 0, seg[i + 1], 0); g.addColorStop(0, '#7fe0b0'); g.addColorStop(1, '#2c5a48'); ctx.fillStyle = '#1a222b'; ctx.fillRect(seg[i], py - 17 * br, seg[i + 1] - seg[i], 34 * br); ctx.fillStyle = g; ctx.fillRect(seg[i], py - 11 * br, seg[i + 1] - seg[i], 22 * br); }
    dots(ctx, [[x0, py], [x1, py]], t, { color: '#eafff4', speed: 170, gap: 44, r: 4.5 });
    for (const x of cs) { ctx.fillStyle = '#16212c'; rr(ctx, x - 60, py - 60, 120, 120, 12); ctx.fill(); compSym(ctx, x, py, 1.3, t); }
    // pressure profile
    const kx = lerp(x0, x1, lin(t, c[0] + .8, 3)); ctx.strokeStyle = C.hot; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.beginPath();
    const P = x => { let last = x0; for (const p of cs) if (x >= p) last = p; return 280 - 110 * (.95 - .8 * (x - last) / 760); };
    for (let x = x0; x <= kx; x += 4) x === x0 ? ctx.moveTo(x, P(x)) : ctx.lineTo(x, P(x)); ctx.stroke();
    txt(ctx, 'PRESSURE', x0, 150, { size: 22, mono: true, weight: 700, color: C.hot });
    label(ctx, cs[0], py - 60, cs[0] + 120, 210, 'Compressor station', { a: win(t, at(s, 0, .5), c[1]) });
    chip(ctx, 1500, py - 60, 'Linepack: gas stored in the pipe itself', { a: win(t, c[1] + .4, at(s, 1, .45)), size: 26, align: 'center', color: C.gas });
    // underground storage, filling in summer and emptying in winter
    const a1 = lin(t, at(s, 1, .32), .8);
    if (a1 > 0) {
      ctx.save(); ctx.globalAlpha = a1;
      const ph = ((t - at(s, 1, .32)) / 9) % 1, inj = ph < .5, lv = inj ? ph * 2 : 2 - ph * 2, sm = ease(lv);
      // depleted reservoir (dome)
      const rx = 430, ry = 760; ctx.save(); ctx.beginPath(); ctx.ellipse(rx, ry, 300, 150, 0, Math.PI, 0); ctx.closePath(); ctx.fillStyle = '#5c4a30'; ctx.fill(); ctx.clip(); ctx.fillStyle = C.gas; ctx.globalAlpha = a1 * .8; ctx.fillRect(rx - 300, ry - 150, 600, 150 * (.25 + .6 * sm)); ctx.restore(); speck(ctx, 12, rx - 250, ry - 110, rx + 250, ry, 80);
      wellbore(ctx, rx, gy, ry - 100, { r: 14 }); pipe(ctx, [[rx, py + 16], [rx, gy]], { w: 10 }); dots(ctx, inj ? [[rx, py], [rx, ry - 110]] : [[rx, ry - 110], [rx, py]], t, { color: '#eafff4', speed: 90, gap: 26, r: 4.5 });
      // salt cavern
      const sx = 1380; ctx.save(); ctx.beginPath(); ctx.moveTo(sx, 560); ctx.bezierCurveTo(sx + 120, 620, sx + 110, 840, sx, 860); ctx.bezierCurveTo(sx - 110, 840, sx - 120, 620, sx, 560); ctx.fillStyle = '#12202a'; ctx.fill(); ctx.clip(); ctx.fillStyle = C.gas; ctx.globalAlpha = a1 * .8; ctx.fillRect(sx - 130, 560, 260, 300 * (.2 + .7 * sm)); ctx.restore();
      ctx.strokeStyle = '#dfe8ef'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(sx, 560); ctx.bezierCurveTo(sx + 120, 620, sx + 110, 840, sx, 860); ctx.bezierCurveTo(sx - 110, 840, sx - 120, 620, sx, 560); ctx.stroke();
      wellbore(ctx, sx, gy, 566, { r: 14 }); pipe(ctx, [[sx, py + 16], [sx, gy]], { w: 10 }); dots(ctx, inj ? [[sx, py], [sx, 580]] : [[sx, 580], [sx, py]], t, { color: '#eafff4', speed: 90, gap: 26, r: 4.5 });
      txt(ctx, 'Depleted reservoir', rx, ry + 44, { size: 26, weight: 700, align: 'center' }); txt(ctx, 'Salt cavern', sx + 140, 720, { size: 26, weight: 700 }); chip(ctx, 900, 800, 'also: aquifers', { size: 24, align: 'center', color: C.dim });
      box(ctx, 760, 520, 300, 150, { stroke: inj ? C.accent : C.cold, lw: 3 }); txt(ctx, inj ? 'SUMMER' : 'WINTER', 910, 566, { size: 34, mono: true, weight: 700, align: 'center', color: inj ? C.accent : C.cold }); txt(ctx, inj ? 'low demand: inject' : 'high demand: withdraw', 910, 620, { size: 24, align: 'center' });
      ctx.restore();
    }
  },
});

// ---------- 15. LNG ----------
SCENES.push({
  id: 'lng', title: 'LNG: gas across the ocean', amb: 'sea', part: 1,
  cues: [
    { t: 'Where a pipeline cannot reach, gas is liquefied. Cooled to about −162 °C, it becomes a liquid that takes up roughly 600 times less space.', say: 'Where a pipeline cannot reach, gas is liquefied. Cooled to about minus one hundred and sixty-two degrees Celsius, it becomes a liquid that takes up roughly six hundred times less space.' },
    { t: 'This is a physical change, not a chemical one: LNG is still mostly methane. It is not the same as LPG, which is mainly propane and butane.', say: 'This is a physical change, not a chemical one. L N G is still mostly methane. It is not the same as L P G, which is mainly propane and butane.' },
    'Specialised ships carry it in insulated tanks. Heat leaking in creates boil-off gas, which is recovered or used as fuel.',
    { t: 'At the import terminal, vaporisers warm the LNG back into gas for the pipeline grid.', say: 'At the import terminal, vaporisers warm the L N G back into gas for the pipeline grid.' },
  ],
  events(s) { return [{ t: at(s, 0, .75), type: 'ding' }, { t: s.c[2] - .3, type: 'whoosh' }]; },
  draw(ctx, t, c, s) {
    const LC = '#bfe9ff';
    const kA = 1 - pr(t, c[2] - .5, .9);
    if (kA > 0) {
      ctx.save(); ctx.globalAlpha = kA;
      // liquefaction: gas in, heat removed, liquid out
      const kc = pr(t, c[0] + .6, (s.e[0] - c[0]) * .5), temp = lerp(25, -162, kc);
      pipe(ctx, [[80, 420], [300, 420]], { w: 16 }); dots(ctx, [[80, 420], [300, 420]], t, { color: C.gas, speed: 120, gap: 30, r: 6 });
      box(ctx, 300, 250, 420, 340, { fill: '#12202c', stroke: C.cold, lw: 4 }); txt(ctx, 'LIQUEFACTION', 330, 290, { size: 22, mono: true, weight: 700, color: C.cold });
      ctx.strokeStyle = LC; ctx.lineWidth = 8; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(300, 420); for (let i = 0; i < 8; i++) { ctx.lineTo(340 + i * 44, i % 2 ? 350 : 500); } ctx.lineTo(720, 420); ctx.stroke();
      const coil = [[300, 420]]; for (let i = 0; i < 8; i++) coil.push([340 + i * 44, i % 2 ? 350 : 500]); coil.push([720, 420]); dots(ctx, coil, t, { colors: [C.gas, C.gas, LC, LC], speed: 110, gap: 28, r: 6 });
      txt(ctx, '❄ refrigeration removes heat', 510, 560, { size: 22, color: C.cold, align: 'center' });
      pipe(ctx, [[720, 420], [860, 420]], { w: 16 }); dots(ctx, [[720, 420], [860, 420]], t, { color: LC, speed: 100, gap: 28, r: 6 });
      ctx.fillStyle = '#dfe8ef'; ctx.beginPath(); ctx.arc(960, 400, 110, Math.PI, 0); ctx.fill(); ctx.fillRect(850, 400, 220, 190); ctx.fillStyle = LC; ctx.fillRect(864, 590 - 150 * (.3 + .5 * kc), 192, 150 * (.3 + .5 * kc)); txt(ctx, 'Insulated LNG tank', 960, 630, { size: 22, weight: 600, align: 'center' });
      // thermometer
      ctx.fillStyle = '#1b2733'; rr(ctx, 170, 520, 26, 300, 13); ctx.fill(); const th = 280 * (1 - kc * .88); ctx.fillStyle = kc > .5 ? C.cold : C.hot; rr(ctx, 174, 524 + 280 - th, 18, th + 12, 9); ctx.fill(); ctx.beginPath(); ctx.arc(183, 836, 22, 0, TAU); ctx.fill();
      txt(ctx, (temp > 0 ? '+' : '−') + Math.abs(Math.round(temp)) + ' °C', 220, 690, { size: 54, mono: true, weight: 700, color: kc > .5 ? C.cold : C.hot });
      // volume comparison
      const av = lin(t, at(s, 0, .6), .7) * (1 - lin(t, c[1], .6));
      if (av > 0) { ctx.globalAlpha = kA * av; ctx.strokeStyle = C.gas; ctx.lineWidth = 4; ctx.setLineDash([12, 9]); ctx.strokeRect(1240, 250, 380, 380); ctx.setLineDash([]); ctx.fillStyle = 'rgba(127,224,176,.12)'; ctx.fillRect(1240, 250, 380, 380); txt(ctx, 'as gas', 1430, 300, { size: 26, weight: 600, color: C.gas, align: 'center' }); ctx.fillStyle = LC; ctx.fillRect(1700, 585, 45, 45); txt(ctx, 'as LNG', 1722, 560, { size: 26, weight: 600, color: LC, align: 'center' }); txt(ctx, 'about 600 times less volume', 1500, 690, { size: 34, weight: 700, align: 'center', color: C.accent }); ctx.globalAlpha = kA; }
      // LNG vs LPG
      const a1 = lin(t, c[1] + .2, .7);
      if (a1 > 0) {
        [['LNG', 'liquefied natural gas', 'mostly methane', 'kept liquid by extreme cold', LC, 1], ['LPG', 'liquefied petroleum gas', 'propane and butanes', 'kept liquid by pressure or cooling', C.ngl, 3]].forEach((p, i) => {
          const y = 230 + i * 330, a = a1 * lin(t, at(s, 1, i ? .5 : .1), .5); box(ctx, 1180, y, 640, 280, { a, stroke: p[4], lw: 3 }); ctx.globalAlpha = kA * a;
          txt(ctx, p[0], 1216, y + 64, { size: 64, mono: true, weight: 700, color: p[4] }); txt(ctx, p[1], 1390, y + 66, { size: 24, color: C.dim });
          txt(ctx, p[2], 1216, y + 140, { size: 32, weight: 700 }); txt(ctx, p[3], 1216, y + 190, { size: 26, color: '#c4cfd9' });
          chainMol(ctx, 1640, y + 230, p[5], { color: p[4], d: 30, r: 12 }); if (i) chainMol(ctx, 1640, y + 150, 4, { color: p[4], d: 30, r: 12 });
          ctx.globalAlpha = kA;
        });
        txt(ctx, '≠', 1500, 536, { size: 60, weight: 700, color: C.hot, align: 'center', a: a1 * lin(t, at(s, 1, .5), .4) });
      }
      ctx.restore();
    }
    // shipping and regasification
    const kB = pr(t, c[2] - .2, .9);
    if (kB > 0) {
      ctx.save(); ctx.globalAlpha = kB; const sy = 600;
      sky(ctx, sy); sea(ctx, sy, 980, t); ctx.fillStyle = '#40342a'; ctx.fillRect(1180, sy - 14, 760, 500); ctx.fillStyle = '#4b3d30'; ctx.fillRect(1180, sy - 14, 760, 8);
      const sx = lerp(260, 760, pr(t, c[2] + .3, (s.e[2] - c[2]) * .85));
      ship(ctx, sx, sy, 1.25, 'lng', t);
      // boil-off inside the tanks, routed to the engine
      const ab = lin(t, at(s, 2, .4), .6) * (1 - lin(t, c[3], .8));
      if (ab > 0) { const R = rng(3); for (let i = 0; i < 20; i++) { const u = (R() + t * .3) % 1, k = i % 4; ctx.globalAlpha = kB * ab * (1 - u); ctx.fillStyle = C.gas; ctx.beginPath(); ctx.arc(sx - 188 + k * 115 + (R() - .5) * 50, sy - 46 - u * 44, 4, 0, TAU); ctx.fill(); } ctx.globalAlpha = kB; const bo = [[sx - 188, sy - 104], [sx - 188, sy - 124], [sx + 250, sy - 124], [sx + 250, sy - 90]]; pipe(ctx, bo, { w: 5, a: ab, color: '#3d7a62' }); dots(ctx, bo, t, { color: C.gas, speed: 90, gap: 22, r: 4, a: ab }); label(ctx, sx + 40, sy - 124, sx - 40, sy - 320, 'Boil-off gas: recovered or used as fuel', { a: ab, color: C.gas, align: 'left' }); label(ctx, sx - 240, sy - 70, sx - 250, sy - 230, 'Insulated cryogenic tanks', { a: ab, align: 'right', color: LC }); }
      // import terminal
      ctx.fillStyle = '#dfe8ef'; ctx.beginPath(); ctx.arc(1330, sy - 150, 100, Math.PI, 0); ctx.fill(); ctx.fillRect(1230, sy - 150, 200, 136); ctx.fillStyle = LC; ctx.fillRect(1242, sy - 100, 176, 86);
      const a3 = lin(t, c[3] + .2, .7), un = [[sx + 250, sy - 60], [1130, sy - 60], [1130, sy - 190], [1230, sy - 190]], out = [[1430, sy - 60], [1540, sy - 60]], gasl = [[1620, sy - 60], [1880, sy - 60]];
      pipe(ctx, [[1100, sy - 14], [1180, sy - 14]], { w: 10 }); pipe(ctx, un, { w: 8, a: a3 }); dots(ctx, un, t, { color: LC, speed: 90, gap: 24, r: 5, a: a3 });
      pipe(ctx, out, { w: 12 }); dots(ctx, out, t, { color: LC, speed: 90, gap: 24, r: 5, a: a3 }); pumpSym(ctx, 1480, sy - 60, 24, t, { color: LC });
      hxSym(ctx, 1580, sy - 60, 42, { c2: C.hot }); pipe(ctx, gasl, { w: 14 }); dots(ctx, gasl, t, { color: C.gas, speed: 140, gap: 30, r: 6, a: a3 });
      txt(ctx, 'Storage', 1330, sy - 270, { size: 24, weight: 600, align: 'center', a: a3 }); label(ctx, 1580, sy - 104, 1560, sy - 250, 'Vaporiser: adds heat', { a: a3 * lin(t, at(s, 3, .3), .5), color: C.hot }); txt(ctx, 'gas to the grid', 1750, sy - 100, { size: 24, weight: 700, color: C.gas, align: 'center', a: a3 * lin(t, at(s, 3, .6), .5) });
      txt(ctx, 'IMPORT TERMINAL', 1210, sy + 40, { size: 22, mono: true, weight: 700, color: C.dim });
      ctx.restore();
    }
  },
});

partCard(2, 'Part three: downstream. Turn crude oil into products, and deliver them to the people who use them.', 'Refine it, blend it, deliver it');

// ---------- 16. Refinery intake, desalting ----------
SCENES.push({
  id: 'refinery', title: 'Into the refinery', amb: 'plant', part: 2,
  cues: [
    'Downstream begins at the refinery. Crude oils differ in density, sulfur and boiling range, so each grade is sampled, stored separately and scheduled.',
    'First the crude is preheated with recovered heat and desalted: wash water picks up the salts and is separated out. Then a furnace brings it to distillation temperature.',
  ],
  events(s) { return [0, 1, 2].map(i => ({ t: at(s, 0, .4 + i * .12), type: 'tick' })); },
  draw(ctx, t, c, s) {
    const ly = 660, heavy = '#6b4320';
    // two crude grades, kept apart
    [[160, C.oil, 'Light, low-sulfur crude', [.35, .2, .75]], [520, heavy, 'Heavy, high-sulfur crude', [.8, .75, .35]]].forEach((g, i) => {
      const a = lin(t, .4 + i * .5, .6); ctx.globalAlpha = a; tank(ctx, g[0], 200, 190, 220, .7, { fluid: g[1] }); txt(ctx, g[2], g[0] + 95, 150, { size: 22, weight: 600, align: 'center' });
      ['density', 'sulfur', 'light fractions'].forEach((p, j) => { const ap = a * lin(t, at(s, 0, .4 + j * .12), .4), bx = 900 + i * 460, by2 = 250 + j * 62; txt(ctx, p, bx, by2 - 22, { size: 20, color: C.dim, a: ap }); ctx.globalAlpha = ap; ctx.fillStyle = '#1b2733'; rr(ctx, bx, by2 - 8, 380, 18, 9); ctx.fill(); ctx.fillStyle = g[1]; rr(ctx, bx, by2 - 8, 380 * g[3][j] * pr(t, at(s, 0, .4 + j * .12), .7), 18, 9); ctx.fill(); });
      ctx.globalAlpha = 1;
    });
    txt(ctx, 'LABORATORY ANALYSIS', 900, 170, { size: 22, mono: true, weight: 700, color: C.dim, a: lin(t, at(s, 0, .35), .5) });
    chip(ctx, 1320, 440, 'each grade is sampled, segregated and scheduled', { a: win(t, at(s, 0, .72), c[1] + .4), size: 24, align: 'center' });
    // process line: heat recovery, desalter, furnace
    const a1 = lin(t, c[1] - .2, .8), line = [[255, 420], [255, ly], [1820, ly]];
    ctx.globalAlpha = a1; pipe(ctx, [[615, 420], [615, ly]], { w: 12 }); pipe(ctx, line, { w: 16 });
    const g = ctx.createLinearGradient(300, 0, 1500, 0); g.addColorStop(0, C.cold); g.addColorStop(1, C.hot); ctx.fillStyle = g; ctx.fillRect(300, ly + 30, 1200, 6); txt(ctx, 'cold', 300, ly + 60, { size: 20, color: C.cold }); txt(ctx, 'hot', 1500, ly + 60, { size: 20, color: C.hot, align: 'right' });
    ctx.globalAlpha = 1; dots(ctx, line, t, { colors: [C.oil, C.oil, heavy], speed: 110, gap: 30, r: 6, a: a1 });
    const k = i => a1 * lin(t, at(s, 1, .05 + i * .2), .5);
    for (let i = 0; i < 3; i++) { ctx.globalAlpha = k(0); hxSym(ctx, 700 + i * 110, ly, 40); pipe(ctx, [[700 + i * 110, ly - 110], [700 + i * 110, ly - 44]], { w: 6, color: '#8a4a2a' }); } dots(ctx, [[1030, ly - 110], [680, ly - 110]], t, { color: C.hot, speed: 80, gap: 30, r: 4.5, a: k(0) });
    txt(ctx, 'Heat recovery from hot product streams', 810, ly - 140, { size: 22, weight: 600, align: 'center', a: k(0) });
    // desalter
    ctx.globalAlpha = k(1); const dx = 1140, dw = 300, dh = 150, dy = ly - dh / 2;
    ctx.save(); rr(ctx, dx, dy, dw, dh, dh / 2); ctx.clip(); ctx.fillStyle = C.oil; ctx.fillRect(dx, dy, dw, dh); ctx.fillStyle = '#3c7fb3'; ctx.fillRect(dx, dy + dh * .72, dw, dh);
    for (let i = 0; i < 5; i++) { ctx.fillStyle = C.accent; ctx.globalAlpha = k(1) * (.5 + .5 * Math.sin(t * 9 + i)); ctx.fillRect(dx + 70 + i * 40, dy + 18, 4, dh * .42); }
    const R = rng(5); for (let i = 0; i < 24; i++) { const u = (R() + t * .18) % 1; ctx.globalAlpha = k(1); ctx.fillStyle = C.water; ctx.beginPath(); ctx.arc(dx + 50 + R() * (dw - 100), dy + 24 + u * dh * .62, 2 + 5 * u, 0, TAU); ctx.fill(); }
    ctx.restore(); ctx.globalAlpha = k(1); ctx.strokeStyle = '#93a4b3'; ctx.lineWidth = 6; rr(ctx, dx, dy, dw, dh, dh / 2); ctx.stroke(); txt(ctx, 'Desalter', dx + dw / 2, dy - 26, { size: 24, weight: 700, align: 'center' });
    const ww = [[1080, ly - 170], [1080, ly - 26]], brn = [[dx + dw / 2, dy + dh], [dx + dw / 2, ly + 150]]; pipe(ctx, ww, { w: 6, color: '#2f6d9c' }); pipe(ctx, brn, { w: 6, color: '#2f6d9c' }); dots(ctx, ww, t, { color: C.water, speed: 70, gap: 22, r: 4.5, a: k(1) }); dots(ctx, brn, t, { color: '#8fd0ff', speed: 70, gap: 22, r: 4.5, a: k(1) });
    txt(ctx, 'wash water in', 1066, ly - 190, { size: 22, color: C.water, weight: 600, align: 'right', a: k(1) }); txt(ctx, 'salty water out, to treatment', dx + dw / 2 + 20, ly + 140, { size: 22, color: C.water, weight: 600, a: k(1) });
    ctx.globalAlpha = k(2); furnace(ctx, 1540, ly + 70, 170, 170, t, {}); txt(ctx, 'Furnace', 1625, ly - 190, { size: 24, weight: 700, align: 'center' }); ctx.globalAlpha = 1;
    txt(ctx, 'to distillation →', 1830, ly + 106, { size: 24, weight: 700, color: C.hot, align: 'right', a: a1 * lin(t, at(s, 1, .8), .5) });
  },
});

// ---------- 17. Distillation ----------
const CUTS = [['Gases, LPG', 3, '#f6edc4', 215], ['Naphtha', 6, '#f2d06b', 325], ['Kerosene', 9, '#e9a63b', 435], ['Diesel, gas oil', 13, '#b9742a', 545], ['Heavy gas oil', 17, '#a8703a', 655]];
SCENES.push({
  id: 'distill', title: 'Distillation', amb: 'plant', part: 2,
  cues: [
    'In the distillation column, hot vapour rises and liquid falls across trays. Light components travel to the top; heavy ones leave lower down.',
    'Side draws take off naphtha, kerosene and gas oils. Distillation separates molecules; it does not break them. And these are intermediate streams, not finished fuels.',
    'The heavy residue goes to a second column under vacuum, where low pressure lets it boil at a lower temperature, without cracking.',
  ],
  events(s) { return CUTS.map((x, i) => ({ t: at(s, 1, .04 + i * .09), type: 'tick' })).concat([{ t: s.c[2] + .4, type: 'whoosh' }]); },
  draw(ctx, t, c, s) {
    const X = 420, y0 = 150, hh = 710, w = 230;
    // feed from the furnace
    pipe(ctx, [[60, 760], [X - w / 2 + 10, 760]], { w: 18 }); dots(ctx, [[60, 760], [X - w / 2 + 20, 760]], t, { color: '#ffd9a0', speed: 130, gap: 30, r: 7 }); txt(ctx, 'hot crude', 70, 720, { size: 22, color: C.hot, weight: 600 });
    tower(ctx, X, y0, w, hh, { trays: 14, hot: true, lw: 7 });
    // vapour rising, liquid falling
    const R = rng(41); ctx.save(); rr(ctx, X - w / 2, y0, w, hh, w / 2); ctx.clip();
    for (let i = 0; i < 70; i++) { const u = (R() + t * .13) % 1, px = X - w / 2 + 24 + R() * (w - 48); ctx.globalAlpha = .75 * (1 - u * .5); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(px + Math.sin(u * 20 + i) * 8, y0 + hh - 60 - u * (hh - 110), 3 + R() * 3, 0, TAU); ctx.fill(); }
    for (let i = 0; i < 40; i++) { const u = (R() + t * .2) % 1, tr = Math.floor(R() * 13) + 1, ty2 = y0 + hh * tr / 14, sd = tr % 2 ? 1 : -1; ctx.globalAlpha = .9; ctx.fillStyle = '#ffcf7a'; ctx.beginPath(); ctx.arc(X + sd * (w / 2 - 16) - sd * 4, ty2 + u * hh / 14, 4, 0, TAU); ctx.fill(); }
    ctx.restore(); ctx.globalAlpha = 1;
    // temperature scale
    const g = ctx.createLinearGradient(0, y0, 0, y0 + hh); g.addColorStop(0, C.cold); g.addColorStop(1, C.hot); ctx.fillStyle = g; rr(ctx, X - w / 2 - 64, y0 + 30, 16, hh - 60, 8); ctx.fill(); txt(ctx, 'cooler', X - w / 2 - 80, y0 + 44, { size: 22, color: C.cold, align: 'right' }); txt(ctx, 'hotter', X - w / 2 - 80, y0 + hh - 44, { size: 22, color: C.hot, align: 'right' });
    label(ctx, X - 40, 480, 130, 420, 'Vapour rises', { a: win(t, c[0] + .8, c[1]), align: 'left', color: '#fff' }); label(ctx, X + w / 2 - 20, 560, 130, 540, 'Liquid falls\nfrom tray to tray', { a: win(t, at(s, 0, .4), c[1]), align: 'left', color: '#ffcf7a' });
    // side draws with molecule sizes
    const ks = 1 - .0 * lin(t, c[2], 1), sx = pr(t, c[2] - .3, .9);
    CUTS.forEach((cu, i) => {
      const a = lin(t, i === 0 ? at(s, 0, .55) : at(s, 1, .04 + (i - 1) * .09), .5), x1 = X + w / 2, xe = lerp(760, 700, sx); if (a <= 0) return;
      ctx.globalAlpha = a; const p = [[x1 - 6, cu[3]], [xe, cu[3]]]; pipe(ctx, p, { w: 10 }); dots(ctx, p, t, { color: cu[2], speed: 80, gap: 26, r: 5, a });
      txt(ctx, cu[0], xe + 20, cu[3] - 16, { size: 28, weight: 700, color: cu[2], a }); chainMol(ctx, xe + 26, cu[3] + 24, Math.min(cu[1], 14), { color: cu[2], d: 17, r: 6, a: a * (1 - sx * .0) });
      ctx.globalAlpha = 1;
    });
    const ar = lin(t, at(s, 1, .45), .5), res = [[X, y0 + hh], [X, y0 + hh + 34], [lerp(900, 1320, sx), y0 + hh + 34]];
    pipe(ctx, res, { w: 12, a: ar }); dots(ctx, res, t, { color: '#4a2c14', speed: 70, gap: 24, r: 6, a: ar }); txt(ctx, 'Atmospheric residue', 600, y0 + hh + 6, { size: 26, weight: 700, color: '#c58a55', a: ar });
    txt(ctx, 'lighter, smaller molecules', 1120, 215, { size: 22, color: C.dim, a: lin(t, at(s, 1, .5), .5) * (1 - sx) }); txt(ctx, 'heavier, larger molecules', 1120, 655, { size: 22, color: C.dim, a: lin(t, at(s, 1, .5), .5) * (1 - sx) });
    chip(ctx, 1500, 380, 'It separates. It does not crack.', { a: win(t, at(s, 1, .5), c[2]), size: 30, align: 'center' });
    chip(ctx, 1500, 460, 'Intermediate streams, not finished fuels', { a: win(t, at(s, 1, .75), c[2]), size: 28, align: 'center', color: C.hot });
    // vacuum column
    if (sx > 0) {
      ctx.save(); ctx.globalAlpha = sx; const vx = 1400, vy = 330, vh = 480;
      pipe(ctx, [[1320, y0 + hh + 34], [vx - 80, y0 + hh + 34], [vx - 80, vy + vh - 80]], { w: 12 });
      tower(ctx, vx, vy, 210, vh, { trays: 8, hot: true, lw: 7 }); txt(ctx, 'Vacuum column', vx, vy - 60, { size: 30, weight: 700, align: 'center' }); chip(ctx, vx, vy - 14, 'low pressure', { size: 22, align: 'center', color: C.cold, tc: C.cold });
      const vg = [[vx + 100, vy + 150], [1640, vy + 150]], vr = [[vx + 100, vy + vh - 60], [1640, vy + vh - 60]]; pipe(ctx, vg, { w: 10 }); pipe(ctx, vr, { w: 10 }); dots(ctx, vg, t, { color: '#a8703a', speed: 80, gap: 24, r: 5, a: sx }); dots(ctx, vr, t, { color: '#3a2412', speed: 60, gap: 24, r: 6, a: sx });
      const a2 = lin(t, at(s, 2, .45), .5); txt(ctx, 'Vacuum gas oil', 1655, vy + 132, { size: 26, weight: 700, color: '#d39a5c', a: a2 }); txt(ctx, 'to conversion units', 1655, vy + 168, { size: 22, color: C.dim, a: a2 });
      const a3 = lin(t, at(s, 2, .65), .5); txt(ctx, 'Vacuum residue', 1655, vy + vh - 78, { size: 26, weight: 700, color: '#a67850', a: a3 }); txt(ctx, 'coking, fuel oil,\nbitumen', 1655, vy + vh - 42, { size: 22, color: C.dim, a: a3, lh: 1.2 });
      ctx.restore();
    }
  },
});
