// Scenes: boundary and network, accounting period, data collection and validation, well testing.

function node(ctx, x, y, s, o = {}) { // centred rounded node
  const w = o.w ?? 190, h = o.h ?? 70, a = o.a ?? 1; if (a <= .01) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(.8 + .2 * a, .8 + .2 * a);
  rr(ctx, -w / 2, -h / 2, w, h, 14); ctx.fillStyle = o.fill ?? '#16212c'; ctx.fill(); ctx.strokeStyle = o.color ?? '#93a4b3'; ctx.lineWidth = o.hl ? 5 : 3; ctx.stroke();
  if (o.badge) { badge(ctx, -w / 2 + 38, 0, o.badge, { r: 22 }); txt(ctx, s, -w / 2 + 72, 1, { size: o.size ?? 26, weight: 600 }); }
  else txt(ctx, s, 0, 1, { size: o.size ?? 26, weight: 600, align: 'center' });
  ctx.restore();
}
function edge(ctx, x1, y1, x2, y2, o = {}) {
  const a = o.a ?? 1, k = o.k ?? 1; if (a <= .01 || k <= 0) return;
  arrow(ctx, x1, y1, lerp(x1, x2, k), lerp(y1, y2, k), { color: o.color ?? '#7f91a3', w: o.w ?? 5, a });
}

// ---------- 4. Boundary and network ----------
SCENES.push({
  id: 'boundary', title: 'Define the boundary and the network', amb: 'plant',
  cues: [
    'Start by drawing the boundary of the balance area: a well group, a platform, a facility or a whole field.',
    'Every stream crossing the boundary is an input or an output: production, imports, export, fuel, flare, disposal and injection.',
    'Streams that stay inside are internal. Lift gas circulating within the boundary does not become new production each time it goes round.',
    'Inside the boundary, the calculation network is built from nodes, such as wells, manifolds, separators, tanks and meters, and the connections between them.',
    'Every connection has an effective period. If a well flows to facility one before noon and to facility two afterwards, its daily quantity is split by routing time.',
  ],
  events(s) { return [{ t: s.c[0] + .8, type: 'whoosh' }, { t: at(s, 4, .5), type: 'valve' }]; },
  draw(ctx, t, c, s) {
    const kB = 1 - pr(t, c[3] - .6, 1.2);
    if (kB > 0) {
      ctx.save(); ctx.globalAlpha = kB;
      const bx = 430, by = 250, bw = 1060, bh = 540, y0 = 560;
      const blocks = [['Wells', 560], ['Manifold', 800], ['Separation', 1050], ['Storage', 1310]];
      blocks.forEach((b, i) => { node(ctx, b[1], y0, b[0], { w: 190, h: 110, size: 30 }); if (i) edge(ctx, blocks[i - 1][1] + 100, y0, b[1] - 100, y0, {}); });
      dots(ctx, [[660, y0], [1210, y0]], GT, { color: C.mix, speed: 60, gap: 40, r: 5, a: .9 });
      // boundary outline, drawn progressively
      const kd = pr(t, c[0] + .8, 2.5), per = 2 * (bw + bh);
      ctx.save(); ctx.strokeStyle = C.accent; ctx.lineWidth = 5; ctx.setLineDash([per * kd, per]); rr(ctx, bx, by, bw, bh, 34); ctx.stroke(); ctx.restore();
      ctx.fillStyle = 'rgba(255,209,102,.05)'; rr(ctx, bx, by, bw, bh, 34); ctx.fill();
      txt(ctx, 'BALANCE AREA', bx + 16, by + bh + 34, { size: 24, mono: true, weight: 700, color: C.accent, a: kd });
      const scope = ['well group', 'platform', 'facility', 'field'];
      scope.forEach((w, i) => chip(ctx, 500 + i * 250, 870, w, { a: win(t, at(s, 0, .4) + i * .5, s.e[0]), size: 28, align: 'center', color: C.dim }));
      // crossing streams
      const cross = (i, x1, y1, x2, y2, name, col, al, dx = 0, dy = 0) => {
        const a = lin(t, at(s, 1, .08 + i * .115), .5); if (a <= 0) return;
        arrow(ctx, x1, y1, x2, y2, { color: col, w: 7, a });
        txt(ctx, name, (al === 'right' ? x1 : x2) + dx, (al === 'right' ? y1 : y2) + dy, { size: 27, weight: 600, color: col, align: al, a });
      };
      cross(0, 190, y0, 455, y0, 'Production', C.ok, 'right', 190, -34);
      cross(1, 150, 400, 500, 400, 'Imported lift gas', C.ok, 'right', 262, -30);
      cross(2, 1410, y0, 1750, y0, 'Oil export', C.oil, 'left', -150, -34);
      cross(3, 1150, 430, 1750, 430, 'Gas sales', C.oil, 'left', -150, -34);
      cross(4, 1200, 430, 1200, 150, 'Fuel', C.oil, 'left', 16, 14);
      cross(5, 1330, 430, 1330, 150, 'Flare', C.oil, 'left', 16, 14);
      cross(6, 1050, 620, 1050, 880, 'Water disposal, injection', C.oil, 'left', 20, -14);
      if (t > c[1]) { pipe(ctx, [[1050, 500], [1050, 430], [1150, 430]], { w: 6, color: '#7f91a3', a: lin(t, at(s, 1, .3), .5) }); pipe(ctx, [[500, 400], [560, 400], [560, 500]], { w: 6, color: '#7f91a3', a: lin(t, at(s, 1, .2), .5) }); }
      const al = lin(t, at(s, 1, .1), .6);
      chip(ctx, 130, 180, 'IN', { a: al, color: C.ok, size: 26, tc: C.ok }); chip(ctx, 215, 180, 'OUT', { a: al, color: C.oil, size: 26, tc: C.oil });
      // internal loop
      const ai = lin(t, c[2] + .3, .8);
      if (ai > 0) {
        const loop = [[1010, 500], [1010, 330], [600, 330], [600, 500]];
        ctx.save(); ctx.globalAlpha = kB * ai; ctx.strokeStyle = C.gas; ctx.lineWidth = 5; ctx.setLineDash([12, 10]); ctx.beginPath(); loop.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke(); ctx.restore();
        dots(ctx, loop, GT, { a: ai, color: C.gas, speed: 80, gap: 46, r: 6 });
        txt(ctx, 'Lift gas circulating inside', 805, 302, { size: 27, weight: 600, color: C.gas, align: 'center', a: ai });
        chip(ctx, 325, 180, 'INTERNAL', { a: ai, color: C.gas, size: 26, tc: C.gas });
        chip(ctx, 960, 730, 'Internal flows are not counted as new production', { a: win(t, at(s, 2, .4), s.e[2]), size: 28, align: 'center', color: C.gas });
      }
      ctx.restore();
    }
    // network graph
    const kN = pr(t, c[3] - .2, 1);
    if (kN > 0) {
      ctx.save(); ctx.globalAlpha = kN;
      const yw = { A: 300, B: 520, C: 740 }, xw = 300, F = [[860, 360], [860, 680]], Tk = [[1220, 360], [1220, 680]], M = [[1560, 360], [1560, 680]];
      const q = i => lin(t, at(s, 3, .06 + i * .085), .5);
      const hr = t < c[4] ? 0 : 24 * lin(t, at(s, 4, .12), (s.e[4] - s.c[4]) * .7), toF2 = hr >= 12;
      edge(ctx, xw + 100, yw.A, F[0][0] - 105, F[0][1], { k: q(3) }); edge(ctx, xw + 100, yw.C, F[1][0] - 105, F[1][1], { k: q(3) });
      edge(ctx, xw + 100, yw.B, F[0][0] - 105, F[0][1] + 16, { k: q(3), color: toF2 ? '#3a4652' : C.B, w: toF2 ? 4 : 7 });
      if (t > c[4]) edge(ctx, xw + 100, yw.B, F[1][0] - 105, F[1][1] - 16, { color: toF2 ? C.B : '#3a4652', w: toF2 ? 7 : 4, a: lin(t, c[4], .6) });
      for (let j = 0; j < 2; j++) { edge(ctx, F[j][0] + 105, F[j][1], Tk[j][0] - 95, Tk[j][1], { k: q(5) }); edge(ctx, Tk[j][0] + 95, Tk[j][1], M[j][0] - 85, M[j][1], { k: q(7) }); }
      'ABC'.split('').forEach((k, i) => node(ctx, xw, yw[k], 'Well ' + k, { badge: k, a: q(i), w: 200, color: C[k] }));
      node(ctx, F[0][0], F[0][1], t > c[4] ? 'Facility 1' : 'Separator', { a: q(4), w: 210 }); node(ctx, F[1][0], F[1][1], t > c[4] ? 'Facility 2' : 'Separator', { a: q(4), w: 210 });
      node(ctx, Tk[0][0], Tk[0][1], 'Tank', { a: q(6) }); node(ctx, Tk[1][0], Tk[1][1], 'Tank', { a: q(6) });
      node(ctx, M[0][0], M[0][1], 'Meter', { a: q(8), w: 170, color: C.accent }); node(ctx, M[1][0], M[1][1], 'Meter', { a: q(8), w: 170, color: C.accent });
      chip(ctx, 300, 180, 'NODES', { a: q(1) * (1 - lin(t, c[4], .5)), size: 24, mono: true, align: 'center', color: C.dim }); chip(ctx, 580, 180, 'CONNECTIONS', { a: q(3) * (1 - lin(t, c[4], .5)), size: 24, mono: true, align: 'center', color: C.dim });
      // routing period for well B
      const a4 = lin(t, c[4] + .2, .8);
      if (a4 > 0) {
        const bx = 620, bw = 760, by = 190;
        ctx.globalAlpha = kN * a4;
        txt(ctx, 'ROUTING OF WELL B', bx, by - 34, { size: 22, mono: true, weight: 700, color: C.B });
        ctx.fillStyle = '#1b2733'; rr(ctx, bx, by, bw, 44, 10); ctx.fill();
        ctx.save(); rr(ctx, bx, by, bw, 44, 10); ctx.clip();
        ctx.fillStyle = C.B; ctx.globalAlpha *= .85; ctx.fillRect(bx, by, bw * Math.min(hr, 12) / 24, 44);
        ctx.fillStyle = '#7a5fd0'; ctx.fillRect(bx + bw / 2, by, bw * Math.max(0, hr - 12) / 24, 44); ctx.restore();
        ctx.fillStyle = '#fff'; ctx.fillRect(bx + bw * hr / 24 - 2, by - 8, 4, 60);
        txt(ctx, 'to Facility 1', bx + bw * .25, by + 23, { size: 24, weight: 700, align: 'center', color: '#0b1016', a: lin(hr, 3, 2) });
        txt(ctx, 'to Facility 2', bx + bw * .75, by + 23, { size: 24, weight: 700, align: 'center', color: '#0b1016', a: lin(hr, 15, 2) });
        ['00:00', '12:00', '24:00'].forEach((l, i) => txt(ctx, l, bx + bw * i / 2, by + 70, { size: 22, mono: true, color: C.dim, align: 'center' }));
        chip(ctx, 1010, 520, 'Daily quantity is split by routing time,', { a: lin(hr, 20, 3), size: 28, align: 'center' });
        chip(ctx, 1010, 572, 'not assigned by the end-of-day route', { a: lin(hr, 20, 3), size: 28, align: 'center' });
      }
      ctx.restore();
    }
  },
});

// ---------- 5. Accounting period ----------
SCENES.push({
  id: 'period', title: 'Define the accounting period', amb: 'calc',
  cues: [
    'Next, define the accounting period: the start and end of the production day, the time zone and the closing rules. A production day does not have to begin at midnight.',
    'A rate is a quantity per unit time. A period volume is what accumulates. A cumulative meter reading becomes a period quantity by subtracting the opening reading from the closing one.',
    { t: 'Operating time matters. In our example, well A runs for all 24 hours, well B for 18 hours, and well C for only 12.', say: 'Operating time matters. In our example, well A runs for all twenty-four hours, well B for eighteen hours, and well C for only twelve.' },
    'Flow also takes time to arrive, and pipelines and vessels can store or release fluid. So today’s export cannot simply be assigned to today’s well inflow.',
  ],
  events(s) { return [{ t: at(s, 1, .62), type: 'tick' }, { t: at(s, 1, .8), type: 'ding' }, { t: at(s, 2, .3), type: 'tick' }, { t: at(s, 2, .55), type: 'tick' }, { t: at(s, 2, .8), type: 'tick' }]; },
  draw(ctx, t, c, s) {
    const x0 = 300, x1 = 1660, by = 215, X = h => x0 + (x1 - x0) * h / 24;
    // production-day bar
    const a0 = lin(t, .5, .8);
    ctx.globalAlpha = a0;
    txt(ctx, 'PRODUCTION DAY', x0, by - 44, { size: 24, mono: true, weight: 700, color: C.accent });
    ctx.fillStyle = '#1b2733'; rr(ctx, x0, by, x1 - x0, 46, 10); ctx.fill();
    const kd = pr(t, c[0] + .8, 3); ctx.fillStyle = 'rgba(255,209,102,.3)'; rr(ctx, x0, by, (x1 - x0) * kd, 46, 10); ctx.fill();
    for (let h = 0; h <= 24; h += 3) { ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillRect(X(h) - 1, by + 46, 2, 12); txt(ctx, String((6 + h) % 24).padStart(2, '0') + ':00', X(h), by + 80, { size: 22, mono: true, color: h % 24 ? C.dim : C.accent, align: 'center' }); }
    ctx.globalAlpha = 1;
    label(ctx, X(0), by + 23, X(0) + 60, by - 60, 'Start of the production day', { a: win(t, c[0] + 1, s.e[0]) * 0 });
    ['defined start and end', 'time zone', 'calendar', 'closing rules'].forEach((w, i) => chip(ctx, 370 + i * 330 + (i ? 60 : 0), 400, w, { a: win(t, at(s, 0, .15) + i * .6, s.e[0]), size: 28, align: 'center', color: C.dim }));
    chip(ctx, 960, 500, 'This example day runs from 06:00 to 06:00, not from midnight', { a: win(t, at(s, 0, .62), s.e[0]), size: 30, align: 'center' });
    // cumulative meter
    const a1 = win(t, c[1] - .2, s.e[1] + .3);
    if (a1 > 0) {
      ctx.save(); ctx.globalAlpha = a1;
      // rate curve -> accumulated volume
      const px = 200, py = 370, pw = 640, ph = 300; box(ctx, px, py, pw, ph + 90, {});
      txt(ctx, 'RATE  →  ACCUMULATED VOLUME', px + 30, py + 40, { size: 22, mono: true, weight: 700, color: C.dim });
      const kr = lin(t, c[1] + .5, (s.e[1] - c[1]) * .5), f = u => .55 + .18 * Math.sin(u * 7) + .1 * Math.sin(u * 17 + 1);
      ctx.beginPath(); ctx.moveTo(px + 50, py + ph + 40);
      for (let i = 0; i <= 100 * kr; i++) ctx.lineTo(px + 50 + i / 100 * (pw - 100), py + ph + 40 - f(i / 100) * (ph - 70));
      ctx.lineTo(px + 50 + kr * (pw - 100), py + ph + 40); ctx.closePath(); ctx.fillStyle = 'rgba(233,166,59,.35)'; ctx.fill();
      ctx.beginPath(); for (let i = 0; i <= 100 * kr; i++) { const x = px + 50 + i / 100 * (pw - 100), y = py + ph + 40 - f(i / 100) * (ph - 70); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.strokeStyle = C.oil; ctx.lineWidth = 5; ctx.stroke();
      ctx.strokeStyle = C.dim; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(px + 50, py + 70); ctx.lineTo(px + 50, py + ph + 40); ctx.lineTo(px + pw - 40, py + ph + 40); ctx.stroke();
      txt(ctx, 'rate', px + 62, py + 84, { size: 22, color: C.oil }); txt(ctx, 'area = period volume', px + pw / 2, py + ph + 4, { size: 24, weight: 600, align: 'center', a: lin(kr, .5, .3) }); txt(ctx, 'time', px + pw - 44, py + ph + 62, { size: 22, color: C.dim, align: 'right' });
      // odometer
      const ox = 930; box(ctx, ox, py, 790, ph + 90, {});
      txt(ctx, 'CUMULATIVE METER READING', ox + 34, py + 40, { size: 22, mono: true, weight: 700, color: C.dim });
      const kc = pr(t, at(s, 1, .3), (s.e[1] - c[1]) * .3), read = 18250 + 64.05 * kc, fm = v => v.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      txt(ctx, 'Opening', ox + 34, py + 110, { size: 28, color: C.dim }); txt(ctx, fm(18250) + ' m³', ox + 750, py + 110, { size: 40, mono: true, weight: 700, align: 'right' });
      txt(ctx, 'Closing', ox + 34, py + 180, { size: 28, color: C.dim }); txt(ctx, fm(read) + ' m³', ox + 750, py + 180, { size: 40, mono: true, weight: 700, align: 'right', color: C.oil });
      ctx.fillStyle = 'rgba(255,255,255,.2)'; ctx.fillRect(ox + 34, py + 228, 722, 2);
      const ar = lin(t, at(s, 1, .62), .5);
      txt(ctx, 'Closing − opening', ox + 34, py + 288, { size: 28, weight: 600, a: ar }); txt(ctx, '64.05 m³', ox + 750, py + 288, { size: 56, mono: true, weight: 700, align: 'right', color: C.accent, a: ar });
      txt(ctx, 'allowing for resets, rollover, reverse flow and meter replacement', ox + 34, py + 352, { size: 22, color: C.dim, a: ar });
      ctx.restore();
    }
    // runtime bars
    const a2 = lin(t, c[2] - .2, .8);
    if (a2 > 0) {
      const rows = [['A', [[0, 24]], 24, .3], ['B', [[0, 9], [15, 24]], 18, .55], ['C', [[6, 18]], 12, .8]];
      rows.forEach((r, i) => {
        const y = 390 + i * 100, a = a2 * lin(t, at(s, 2, r[3]) - .6, .6);
        ctx.globalAlpha = a; badge(ctx, 210, y + 26, r[0], { r: 26 });
        ctx.fillStyle = '#1b2733'; rr(ctx, x0, y, x1 - x0, 52, 10); ctx.fill();
        // hatched shutdown background
        ctx.save(); rr(ctx, x0, y, x1 - x0, 52, 10); ctx.clip(); ctx.strokeStyle = 'rgba(255,100,100,.28)'; ctx.lineWidth = 3; for (let x = x0 - 60; x < x1; x += 22) { ctx.beginPath(); ctx.moveTo(x, y + 52); ctx.lineTo(x + 52, y); ctx.stroke(); }
        const kg = pr(t, at(s, 2, r[3]) - .4, 1); ctx.fillStyle = C[r[0]];
        for (const seg of r[1]) ctx.fillRect(X(seg[0]), y, (X(seg[1]) - X(seg[0])) * kg, 52);
        ctx.restore();
        txt(ctx, r[2] + ' h', x1 + 30, y + 27, { size: 40, mono: true, weight: 700, color: C[r[0]], a: lin(t, at(s, 2, r[3]), .4) });
        ctx.globalAlpha = 1;
      });
      txt(ctx, 'running', x0, 710, { size: 22, color: C.dim, a: a2 * (1 - lin(t, c[3], .5)) }); ctx.globalAlpha = a2 * (1 - lin(t, c[3], .5)); ctx.strokeStyle = 'rgba(255,100,100,.6)'; ctx.lineWidth = 3; for (let x = 420; x < 470; x += 14) { ctx.beginPath(); ctx.moveTo(x, 722); ctx.lineTo(x + 18, 700); ctx.stroke(); } ctx.globalAlpha = 1;
      txt(ctx, 'shut in', 500, 710, { size: 22, color: C.dim, a: a2 * (1 - lin(t, c[3], .5)) });
    }
    // transit and line inventory
    const a3 = lin(t, c[3] + .2, .8);
    if (a3 > 0) {
      const y = 790, xa = 330, xb = 1500, ph = ((t - c[3]) / 7) % 1;
      ctx.globalAlpha = a3;
      pipe(ctx, [[xa, y], [xb, y]], { w: 30, color: '#33414f' });
      ctx.fillStyle = C.oil; ctx.fillRect(xa, y - 12, (xb - xa) * ph, 24);
      ctx.fillStyle = '#fff'; ctx.fillRect(xa + (xb - xa) * ph - 2, y - 22, 4, 44);
      txt(ctx, 'well', xa - 20, y, { size: 26, weight: 600, align: 'right' }); meter(ctx, xb + 50, y, { t, color: C.oil, r: 26 });
      txt(ctx, 'transit time and line inventory', (xa + xb) / 2, y - 44, { size: 26, weight: 600, align: 'center' });
      chip(ctx, 960, 868, 'Today’s export  ≠  today’s well inflow', { size: 30, align: 'center' });
      ctx.globalAlpha = 1;
    }
  },
});

// ---------- 6. Data ----------
const DGROUPS = [['Wells', 'phase rates, tests,\npressure, temperature'], ['Time', 'startups, shutdowns,\nruntime, routing'], ['Shared meters', 'oil, gas, water,\nexport quantities'], ['Inventories', 'tank and vessel stock,\nlinepack'], ['Fluid quality', 'density, water and sediment,\ncomposition, PVT'], ['Special streams', 'gas lift, fuel, flare,\ninjection, imports'], ['Configuration', 'units, reference conditions,\nmethods, rule versions']];
SCENES.push({
  id: 'data', title: 'Collect and validate the data', amb: 'calc',
  cues: [
    'The calculation needs data: well rates and tests, operating time and routing, shared meters, inventories, fluid quality, and special streams such as gas lift, fuel and flare.',
    'The data come from automated systems, process historians, laboratories and operating logs. Every value keeps its source, timestamp and quality status.',
    'Before any calculation, the data are validated: missing values, duplicates, impossible readings, wrong units, and timestamps outside the period.',
    'Missing data do not mean zero production. A genuine zero is backed by shutdown information or a valid measurement. An unknown value is marked as missing or estimated.',
  ],
  events(s) { const ev = DGROUPS.map((g, i) => ({ t: at(s, 0, .1 + i * .11), type: 'tick' })); for (let i = 0; i < 7; i++) ev.push({ t: at(s, 2, .12 + i * .1), type: i < 2 ? 'ding' : 'alert' }); return ev; },
  draw(ctx, t, c, s) {
    const kA = 1 - pr(t, c[2] - .6, 1);
    if (kA > 0) {
      ctx.save(); ctx.globalAlpha = kA;
      const gx = i => 640 + (i % 4) * 300 - (i > 3 ? -150 : 0), gy = i => i < 4 ? 250 : 570;
      DGROUPS.forEach((g, i) => {
        const a = pr(t, at(s, 0, .1 + i * .11), .6), x = gx(i), y = gy(i); if (a <= 0) return;
        ctx.globalAlpha = kA * a; box(ctx, x, y, 280, 270, { stroke: 'rgba(255,255,255,.14)' });
        ctx.fillStyle = C.accent; ctx.fillRect(x + 26, y + 30, 44, 5);
        txt(ctx, g[0], x + 26, y + 76, { size: 30, weight: 700 }); txt(ctx, g[1], x + 26, y + 136, { size: 22, color: '#b9c5d0', lh: 1.4 });
      });
      ctx.globalAlpha = kA;
      // sources
      const a1 = lin(t, c[1] - .3, .8), srcs = ['Automated collection', 'Process historian', 'Laboratory', 'Operating logs'];
      srcs.forEach((n, i) => {
        const a = a1 * lin(t, at(s, 1, .05 + i * .1), .5), y = 290 + i * 150;
        node(ctx, 300, y, n, { a, w: 330, h: 84, color: C.cold, size: 27 });
        dots(ctx, [[470, y], [560, y], [600, lerp(y, 520, .5)], [640, 520]], GT + i, { a: a * .9, color: C.cold, speed: 90, gap: 40, r: 5 });
      });
      const a1b = win(t, at(s, 1, .5), s.e[1] + .2);
      if (a1b > 0) {
        box(ctx, 720, 400, 760, 290, { a: a1b * kA, fill: 'rgba(11,16,22,.96)', stroke: C.accent, lw: 3 });
        ctx.globalAlpha = kA * a1b;
        txt(ctx, 'EVERY VALUE KEEPS ITS PEDIGREE', 760, 446, { size: 22, mono: true, weight: 700, color: C.accent });
        txt(ctx, 'Well B · liquid rate', 760, 506, { size: 30, color: C.dim }); txt(ctx, '40.0 m³/day', 1440, 506, { size: 40, mono: true, weight: 700, align: 'right' });
        [['source', 'well test'], ['timestamp', 'recorded'], ['quality', 'valid']].forEach((p, i) => { const a = lin(t, at(s, 1, .62) + i * .5, .4); txt(ctx, p[0], 760 + i * 245, 586, { size: 22, color: C.dim, a }); txt(ctx, p[1], 760 + i * 245, 630, { size: 30, weight: 700, color: i === 2 ? C.ok : C.ink, a }); });
      }
      ctx.restore();
    }
    // validation list
    const kV = win(t, c[2] - .2, c[3] + .2, .6);
    if (kV > 0) {
      const rows = [['Well A · liquid rate', '60.0 m³/day', 'valid', C.ok], ['Well B · runtime', '18 h', 'valid', C.ok], ['Well C · water cut', '—', 'missing', C.accent], ['Gas meter · daily total', 'recorded twice', 'duplicate', C.accent], ['Tank level', '−3.2 m', 'impossible', C.bad], ['Well A · tubing pressure', 'psi sent as kPa', 'wrong unit', C.bad], ['Export meter reading', '07:15 next day', 'outside period', C.bad]];
      ctx.save(); ctx.globalAlpha = kV;
      box(ctx, 300, 150, 1320, 720, {});
      txt(ctx, 'VALIDATION', 340, 196, { size: 22, mono: true, weight: 700, color: C.accent });
      rows.forEach((r, i) => {
        const y = 240 + i * 88, a = lin(t, at(s, 2, .06 + i * .1), .4), as = lin(t, at(s, 2, .12 + i * .1), .3);
        ctx.globalAlpha = kV * a; ctx.fillStyle = i % 2 ? 'rgba(255,255,255,.03)' : 'rgba(255,255,255,.06)'; rr(ctx, 330, y, 1260, 74, 10); ctx.fill();
        txt(ctx, r[0], 360, y + 38, { size: 30, weight: 600 }); txt(ctx, r[1], 1130, y + 38, { size: 30, mono: true, align: 'right', color: '#b9c5d0' });
        chip(ctx, 1560, y + 37, r[2], { a: as, size: 26, align: 'right', color: r[3], tc: r[3] });
      });
      const sy = 240 + lin(t, at(s, 2, .06), (s.e[2] - c[2]) * .72) * 7 * 88;
      ctx.globalAlpha = kV * .9 * (1 - lin(t, at(s, 2, .8), .5)); ctx.fillStyle = C.cold; ctx.fillRect(330, sy, 1260, 3);
      ctx.restore();
    }
    // missing is not zero
    const kM = lin(t, c[3] + .2, .8);
    if (kM > 0) {
      ctx.save(); ctx.globalAlpha = kM;
      const card = (x, col, h1, big, l1, l2, a) => { box(ctx, x, 220, 720, 560, { stroke: col, lw: 3, a }); ctx.globalAlpha = kM * a; txt(ctx, h1, x + 50, 290, { size: 26, mono: true, weight: 700, color: col }); txt(ctx, big, x + 360, 440, { size: 150, mono: true, weight: 700, align: 'center' }); txt(ctx, l1, x + 360, 610, { size: 36, weight: 700, align: 'center', color: col }); txt(ctx, l2, x + 360, 676, { size: 28, color: '#b9c5d0', align: 'center', lh: 1.35 }); ctx.globalAlpha = kM; };
      card(200, C.ok, 'A GENUINE ZERO', '0.0', 'Zero production', 'confirmed by shutdown information\nor a valid measurement', 1);
      card(1000, C.accent, 'AN UNKNOWN VALUE', '—', 'Missing or estimated', 'replaced only by a defined rule,\nwith the reason recorded', lin(t, at(s, 3, .45), .6));
      txt(ctx, '≠', 960, 500, { size: 110, weight: 700, align: 'center', color: C.bad, a: lin(t, at(s, 3, .5), .5) });
      ctx.restore();
    }
  },
});

// ---------- 7. Well test ----------
const WT = { wx: { A: 300, B: 650, C: 1000 }, wy: 265, yP: 470, yT: 590, msep: [1420, 395, 250, 150], tsep: [1250, 650, 220, 120] };
WT.dx = k => WT.wx[k] + 104;
SCENES.push({
  id: 'welltest', title: 'Test an individual well', amb: 'plant',
  cues: [
    'To learn what one well produces, it is routed on its own to a test separator. Oil, gas and water are separated and measured, along with pressure, temperature and test duration.',
    'The first data after switching are transient. Only the stable part of a validated test is used.',
    'A test is a snapshot of a rate under particular conditions. After a choke or pump change, it may no longer be representative.',
    'There are other sources too. A multiphase flow meter estimates phase rates without separating the stream. A virtual flow meter calculates them from pressures, temperatures and a well model.',
    'The priority between these sources is defined in advance. And tested production returns to the main process, so it must not be counted twice.',
  ],
  events(s) { return [{ t: s.c[0] + 1.6, type: 'valve' }, { t: s.c[0] + 2, type: 'valve' }, { t: at(s, 2, .55), type: 'alert' }]; },
  draw(ctx, t, c, s) {
    const sw = pr(t, c[0] + 1.6, .8), M = WT.msep, Ts = WT.tsep, on = k => (k === 'B' ? 1 - sw : 1);
    // headers
    pipe(ctx, [[340, WT.yP], [M[0], WT.yP]], { w: 18, color: '#6f8091' }); pipe(ctx, [[340, WT.yT], [1190, WT.yT], [1190, Ts[1] + 60], [Ts[0], Ts[1] + 60]], { w: 14, color: '#5e6f80' });
    txt(ctx, 'Production\nheader', 318, WT.yP - 13, { size: 22, weight: 600, color: C.dim, align: 'right' }); txt(ctx, 'Test\nheader', 318, WT.yT - 13, { size: 22, weight: 600, color: C.dim, align: 'right' });
    const ret = [[1620, Ts[1] + 60], [1700, Ts[1] + 60], [1700, 580], [1340, 580], [1340, WT.yP]];
    pipe(ctx, ret, { w: 10, color: t > at(s, 4, .5) ? C.accent : '#55667a' });
    for (const k of 'ABC') {
      const x = WT.dx(k), o = [WT.wx[k] + 74, WT.wy - 10];
      pipe(ctx, [o, [x, o[1]], [x, WT.yP]]); pipe(ctx, [[x, WT.yP], [x, WT.yT]], { w: 10 });
      const toT = k === 'B' ? sw : 0;
      if (1 - toT > .05) dots(ctx, [o, [x, o[1]], [x, WT.yP]], GT, { color: C[k], speed: 70, gap: 30, r: 6, a: 1 });
      if (toT > .05) { dots(ctx, [[x, WT.yP - 40], [x, WT.yT], [1190, WT.yT], [1190, Ts[1] + 60], [Ts[0], Ts[1] + 60]], GT, { color: C[k], speed: 80, gap: 30, r: 6, a: toT }); }
      valve(ctx, x, WT.yP - 38, k === 'B' ? 1 - sw : 1, { vert: true }); valve(ctx, x, WT.yP + 60, toT, { vert: true });
      wellIcon(ctx, WT.wx[k], WT.wy, k, GT);
    }
    // production header flow
    dots(ctx, [[WT.dx('A'), WT.yP], [1340, WT.yP]], GT, { colors: sw > .5 ? [C.A, C.C, C.A] : [C.A, C.B, C.A, C.C, C.A, C.B], speed: 80, gap: 24, r: 6 });
    dots(ctx, [[1340, WT.yP], [M[0], WT.yP]], GT, { colors: [C.A, C.B, C.A, C.C, C.A, C.B], speed: 80, gap: 24, r: 6 });
    vessel(ctx, M[0], M[1], M[2], M[3], { t: GT }); txt(ctx, 'Main separator', M[0] + M[2] / 2, M[1] - 26, { size: 22, weight: 600, align: 'center', color: C.dim });
    // test separator with three meters
    vessel(ctx, Ts[0], Ts[1], Ts[2], Ts[3], { t: sw > .5 ? GT : null, seed: 9, hl: sw > .5 && t < c[1] });
    txt(ctx, 'Test separator', Ts[0] + Ts[2] / 2, Ts[1] + Ts[3] + 50, { size: 22, weight: 600, align: 'center', color: C.dim });
    const mm = [[C.gas, Ts[1] + 10, 'gas'], [C.oil, Ts[1] + 60, 'oil'], [C.water, Ts[1] + 110, 'water']];
    mm.forEach((m, i) => { const p = [[Ts[0] + Ts[2] - 4, m[1]], [1620, m[1]], [1620, Ts[1] + 60]]; pipe(ctx, p, { w: 8 }); if (sw > .5) dots(ctx, p, GT, { color: m[0], speed: 70, gap: 28, r: 4.5, a: sw }); meter(ctx, 1550, m[1], { t: GT + i, color: m[0], r: 20 }); });
    if (sw > .5) dots(ctx, ret, GT, { color: C.B, speed: 80, gap: 30, r: 5, a: sw });
    // test readout
    const ar = win(t, at(s, 0, .4), c[3] + .2);
    if (ar > 0) {
      box(ctx, 660, 650, 500, 220, { a: ar * .97, stroke: C.B, lw: 3 }); ctx.globalAlpha = ar;
      txt(ctx, 'WELL B ON TEST', 690, 690, { size: 22, mono: true, weight: 700, color: C.B });
      [['Liquid', '40 m³/day'], ['Water cut', '50 %'], ['Also recorded', 'gas, P, T, duration']].forEach((p, i) => { const a = lin(t, at(s, 0, .5 + i * .12), .4); txt(ctx, p[0], 690, 740 + i * 44, { size: 26, color: C.dim, a }); txt(ctx, p[1], 1130, 740 + i * 44, { size: i < 2 ? 30 : 24, mono: i < 2, weight: 700, align: 'right', a }); });
      ctx.globalAlpha = 1;
    }
    // trend: transient then stable
    const a1 = win(t, c[1] - .2, c[2] + .1), px = 1190, py = 140, pw = 660, ph = 215;
    if (a1 > 0) {
      ctx.save(); ctx.globalAlpha = a1; box(ctx, px, py, pw, ph, { fill: 'rgba(11,16,22,.96)', stroke: 'rgba(255,255,255,.18)' });
      const k = lin(t, c[1] + .3, (s.e[1] - c[1]) * .6), f = u => u < .35 ? .5 + .42 * Math.exp(-u * 7) * Math.cos(u * 46) : .5 + .012 * Math.sin(u * 60);
      ctx.fillStyle = 'rgba(255,100,100,.14)'; ctx.fillRect(px + 40, py + 46, (pw - 80) * .35, ph - 86); ctx.fillStyle = 'rgba(95,211,141,.14)'; ctx.fillRect(px + 40 + (pw - 80) * .35, py + 46, (pw - 80) * .65, ph - 86);
      ctx.beginPath(); for (let i = 0; i <= 200 * k; i++) { const x = px + 40 + i / 200 * (pw - 80), y = py + ph - 40 - f(i / 200) * (ph - 90); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.strokeStyle = C.B; ctx.lineWidth = 4; ctx.stroke();
      txt(ctx, 'transient: excluded', px + 46, py + 28, { size: 22, weight: 600, color: C.bad }); txt(ctx, 'stable: used', px + 50 + (pw - 80) * .35, py + 28, { size: 22, weight: 600, color: C.ok, a: lin(k, .45, .1) });
      txt(ctx, 'measured rate over the test', px + pw / 2, py + ph - 18, { size: 20, color: C.dim, align: 'center' }); ctx.restore();
    }
    // snapshot validity
    const a2 = win(t, c[2] - .1, c[3] + .1);
    if (a2 > 0) {
      ctx.save(); ctx.globalAlpha = a2; box(ctx, px, py, pw, ph, { fill: 'rgba(11,16,22,.96)', stroke: 'rgba(255,255,255,.18)' });
      const k = lin(t, c[2] + .4, (s.e[2] - c[2]) * .75), xa = px + 50, xb = px + pw - 50, xc = lerp(xa, xb, .55), y = py + 120;
      ctx.fillStyle = C.ok; ctx.fillRect(xa, y - 4, (Math.min(k, .55) / 1) * (xb - xa), 8); if (k > .55) { ctx.fillStyle = C.bad; ctx.fillRect(xc, y - 4, (k - .55) * (xb - xa), 8); }
      ctx.fillStyle = C.ok; ctx.beginPath(); ctx.arc(xa, y, 13, 0, TAU); ctx.fill(); txt(ctx, 'well test', xa - 8, y - 44, { size: 24, weight: 600 }); txt(ctx, 'representative', xa + 40, y + 40, { size: 22, color: C.ok });
      if (k > .55) { ctx.fillStyle = C.accent; ctx.beginPath(); ctx.moveTo(xc, y - 20); ctx.lineTo(xc + 18, y + 14); ctx.lineTo(xc - 18, y + 14); ctx.closePath(); ctx.fill(); txt(ctx, 'choke or pump change', xc, y - 44, { size: 24, weight: 600, align: 'center', color: C.accent }); txt(ctx, 're-test needed', xc + 40, y + 40, { size: 22, color: C.bad }); }
      txt(ctx, 'time', xb, y + 70, { size: 20, color: C.dim, align: 'right' }); ctx.restore();
    }
    // other sources
    const a3 = lin(t, c[3] + .2, .8);
    if (a3 > 0) {
      const xa = WT.dx('A'), xc = WT.dx('C');
      meter(ctx, xa, 365, { t: GT, color: C.A, r: 24, a: a3 }); label(ctx, xa - 26, 365, xa - 60, 365, 'Multiphase flow meter\nno separation needed', { a: a3 * win(t, c[3] + .5, s.e[4]), color: C.A, align: 'right', size: 24 });
      const av = a3 * lin(t, at(s, 3, .5), .6);
      ctx.save(); ctx.globalAlpha = av; ctx.strokeStyle = C.C; ctx.lineWidth = 3; ctx.setLineDash([8, 7]); rr(ctx, xc - 30, 335, 60, 60, 10); ctx.stroke(); ctx.setLineDash([]); txt(ctx, 'P', xc - 12, 366, { size: 22, weight: 700, color: C.C, align: 'center' }); txt(ctx, 'T', xc + 12, 366, { size: 22, weight: 700, color: C.C, align: 'center' }); ctx.restore();
      label(ctx, xc + 30, 365, xc + 90, 150, 'Virtual flow meter\npressure, temperature + model', { a: av * win(t, at(s, 3, .5), c[4] + .2), color: C.C, size: 24 });
    }
    // priority and no double counting
    const a4 = lin(t, c[4] + .2, .8);
    if (a4 > 0) {
      box(ctx, px, py, pw, ph, { a: a4 * .97, fill: 'rgba(11,16,22,.96)', stroke: C.accent, lw: 3 });
      txt(ctx, 'EXAMPLE PRIORITY OF SOURCES', px + 34, py + 36, { size: 22, mono: true, weight: 700, color: C.accent, a: a4 });
      ['1  Valid continuous measurement', '2  Model estimate', '3  Latest test, adjusted to conditions'].forEach((l, i) => txt(ctx, l, px + 34, py + 86 + i * 46, { size: 28, weight: 600, a: a4 * lin(t, at(s, 4, .08 + i * .1), .4) }));
      chip(ctx, 1520, 870, 'Returns to the main process: counted once', { a: lin(t, at(s, 4, .5), .5), size: 26, align: 'center' });
    }
  },
});
