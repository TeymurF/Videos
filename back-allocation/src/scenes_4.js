// Scenes: water and gas, network levels and other methods, imbalance and exceptions, closing and report, summary.
const LIFT = '#9aa8ff'; // lift gas
const sp = v => String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

// ---------- 12. Water and gas ----------
SCENES.push({
  id: 'phases', title: 'Water and gas have their own factors', amb: 'plant',
  cues: [
    { t: 'Water is allocated separately. An independent water balance gives 31.05 m³, against a preliminary 34.5: a factor of 0.90.', say: 'Water is allocated separately. An independent water balance gives thirty-one point zero five cubic metres, against a preliminary thirty-four point five: a factor of zero point nine.' },
    { t: 'Allocated water becomes 10.80 m³ for A, 13.50 for B and 6.75 for C.', say: 'Allocated water becomes ten point eight cubic metres for A, thirteen point five for B, and six point seven five for C.' },
    'Gas needs extra care. Gas leaving a gas-lifted well contains reservoir gas and returning lift gas. Without telling them apart, the same gas would be counted as new production again and again.',
    { t: 'Subtracting the returning lift gas leaves 2400, 900 and 200 Sm³ of reservoir gas: 3500 in total.', say: 'Subtracting the returning lift gas leaves two thousand four hundred, nine hundred, and two hundred standard cubic metres of reservoir gas: three thousand five hundred in total.' },
    { t: 'The gas balance adds every outlet, sales, fuel, flare and injection, and subtracts the external lift gas: 4200 Sm³.', say: 'The gas balance adds every outlet: sales, fuel, flare and injection, and subtracts the external lift gas. The result is four thousand two hundred standard cubic metres.' },
    { t: 'The gas factor is 1.20, giving 2880, 1080 and 240 Sm³. Flared and fuel gas were produced too: they are uses of gas, not gas that never existed.', say: 'The gas factor is one point two, giving two thousand eight hundred and eighty, one thousand and eighty, and two hundred and forty standard cubic metres. Flared and fuel gas were produced too: they are uses of gas, not gas that never existed.' },
  ],
  events(s) { return [{ t: at(s, 0, .85), type: 'ding' }, { t: at(s, 1, .25), type: 'tick' }, { t: at(s, 1, .55), type: 'tick' }, { t: at(s, 1, .8), type: 'tick' }, { t: at(s, 3, .3), type: 'tick' }, { t: at(s, 3, .5), type: 'tick' }, { t: at(s, 3, .65), type: 'tick' }, { t: at(s, 3, .85), type: 'ding' }, { t: at(s, 4, .85), type: 'ding' }, { t: at(s, 5, .12), type: 'ding' }]; },
  draw(ctx, t, c, s) {
    const kW = 1 - pr(t, c[2] - .6, 1);
    if (kW > 0) {
      ctx.save(); ctx.globalAlpha = kW;
      const cols = [{ w: 150, al: 'l', head: 'Well' }, { w: 280, al: 'r', head: 'Preliminary\nwater m³' }, { w: 280, al: 'r', head: 'Allocated\nwater m³' }];
      const rows = 'ABC'.split('').map(k => [{ badge: k }, { s: fmt(EX[k].wat, 1), color: '#b9c5d0' }, { s: fmt(EX[k].aWat), color: C.water }]);
      rows.push([{ s: 'Total', mono: false, weight: 700 }, { s: '34.5', weight: 700 }, { s: '31.05', color: C.water, weight: 700 }]);
      table(ctx, 240, 250, cols, rows, { a: lin(t, c[0] + .2, .8), rh: 84, size: 38, totalRow: 3, cellA: (r, ci) => ci < 2 ? 1 : r < 3 ? lin(t, at(s, 1, [.25, .55, .8][r]), .4) : lin(t, at(s, 0, .3), .4) });
      box(ctx, 1080, 234, 640, 200, { a: lin(t, at(s, 0, .25), .6), stroke: C.water, lw: 3, fill: '#101820' });
      txt(ctx, 'WATER BALANCE', 1116, 280, { size: 22, mono: true, weight: 700, color: C.water, a: lin(t, at(s, 0, .25), .6) });
      txt(ctx, '31.05 m³', 1116, 350, { size: 64, mono: true, weight: 700, a: lin(t, at(s, 0, .3), .5) }); txt(ctx, 'control quantity of produced water', 1116, 404, { size: 24, color: C.dim, a: lin(t, at(s, 0, .3), .5) });
      const ak = lin(t, at(s, 0, .62), .5);
      box(ctx, 1080, 470, 640, 150, { a: ak, fill: '#101820', stroke: 'rgba(255,255,255,.2)' });
      ctx.globalAlpha = kW * ak; let x = formula(ctx, 1116, 546, [['K', C.water]], { size: 52 }); txt(ctx, 'water', x + 4, 562, { size: 26, weight: 700, color: C.water });
      formula(ctx, x + 84, 546, [[' = ', C.dim], '31.05 / 34.5', [' = ', C.dim, lin(t, at(s, 0, .85), .3)], ['0.90', C.water, lin(t, at(s, 0, .85), .3)]], { size: 44 });
      ctx.globalAlpha = kW;
      chip(ctx, 1400, 700, 'Oil used K = 1.10.  Water uses its own K = 0.90', { a: lin(t, at(s, 1, .6), .6), size: 28, align: 'center' });
      ctx.restore();
    }
    const kG = pr(t, c[2] - .2, 1);
    if (kG > 0) {
      ctx.save(); ctx.globalAlpha = kG;
      // left panel A: gas-lifted well
      const kL = 1 - pr(t, c[4] - .5, 1);
      if (kL > 0) {
        ctx.save(); ctx.globalAlpha = kG * kL;
        const X = 420, gy = 300, bot = 840;
        ctx.fillStyle = '#2e2822'; ctx.fillRect(150, gy, 600, bot - gy + 20); ctx.fillStyle = '#6b5230'; ctx.fillRect(150, 760, 600, 80); ctx.fillStyle = '#4b3d30'; ctx.fillRect(150, gy, 600, 6);
        ctx.fillStyle = '#8d9499'; ctx.fillRect(X - 70, gy, 140, bot - gy - 30); ctx.fillStyle = '#131a21'; ctx.fillRect(X - 58, gy, 116, bot - gy - 36);
        ctx.fillStyle = '#93a4b3'; ctx.fillRect(X - 24, gy - 60, 6, 640); ctx.fillRect(X + 18, gy - 60, 6, 640); ctx.fillStyle = '#1d2630'; ctx.fillRect(X - 18, gy - 60, 36, 640);
        // lift gas down the annulus, into the tubing through a valve
        pipe(ctx, [[170, gy - 30], [X - 41, gy - 30], [X - 41, gy + 20]], { w: 10 });
        dots(ctx, [[170, gy - 30], [X - 41, gy - 30], [X - 41, 660], [X - 18, 660]], GT, { color: LIFT, speed: 80, gap: 34, r: 6 });
        ctx.fillStyle = LIFT; ctx.fillRect(X - 26, 650, 12, 20);
        for (const sd of [-1, 1]) dots(ctx, [[X + sd * 300, 800], [X + sd * 62, 800], [X, 800]], GT, { colors: [C.oil, C.gas, C.oil, C.water], speed: 45, gap: 30, r: 5 });
        dots(ctx, [[X, 810], [X, 664]], GT, { colors: [C.oil, C.gas, C.oil, C.water], speed: 70, gap: 26, r: 5.5 });
        dots(ctx, [[X, 660], [X, gy - 60], [X + 220, gy - 60]], GT, { colors: [C.oil, C.gas, LIFT, C.water, LIFT, C.gas], speed: 100, gap: 20, r: 5.5 });
        pipe(ctx, [[X, gy - 60], [X + 240, gy - 60]], { w: 0, a: 0 });
        txt(ctx, 'External lift gas', 170, gy - 66, { size: 26, weight: 700, color: LIFT });
        label(ctx, X - 41, 500, X - 190, 520, 'Lift gas\ngoes down', { color: LIFT, size: 24, align: 'right', a: win(t, c[2] + 1, c[4]) });
        label(ctx, X, 430, X + 160, 450, 'Returns with the\nreservoir gas', { color: LIFT, size: 24, a: win(t, at(s, 2, .35), c[4]) });
        label(ctx, X + 150, 800, X + 190, 700, 'Reservoir gas', { color: C.gas, size: 24, a: win(t, at(s, 2, .25), c[4]) });
        ctx.restore();
      }
      // left panel B: gas balance outlets
      const kO = pr(t, c[4] - .1, 1);
      if (kO > 0) {
        ctx.save(); ctx.globalAlpha = kG * kO;
        node(ctx, 330, 450, 'Process', { w: 220, h: 300, size: 30 });
        const outs = [['Sales', 4300, 290], ['Fuel', 500, 390], ['Flare', 200, 490], ['Injection', 200, 590]];
        outs.forEach((o, i) => { const a = lin(t, at(s, 4, .12 + i * .13), .4); arrow(ctx, 440, o[2], 600, o[2], { color: C.oil, w: 7, a }); txt(ctx, o[0], 620, o[2], { size: 28, weight: 600, a }); txt(ctx, '+ ' + sp(o[1]), 850, o[2], { size: 32, mono: true, weight: 700, align: 'right', color: C.oil, a }); });
        const ai = lin(t, at(s, 4, .68), .4);
        arrow(ctx, 330, 760, 330, 610, { color: LIFT, w: 7, a: ai }); txt(ctx, 'External lift gas', 360, 730, { size: 28, weight: 600, color: LIFT, a: ai }); txt(ctx, '− 1 000', 850, 730, { size: 32, mono: true, weight: 700, align: 'right', color: LIFT, a: ai });
        ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.globalAlpha = kG * kO * lin(t, at(s, 4, .8), .3); ctx.fillRect(600, 778, 252, 3);
        ctx.globalAlpha = kG * kO; txt(ctx, 'Control reservoir gas', 200, 828, { size: 26, weight: 600, a: lin(t, at(s, 4, .85), .4) }); txt(ctx, '4 200 Sm³', 850, 828, { size: 40, mono: true, weight: 700, align: 'right', color: C.accent, a: lin(t, at(s, 4, .85), .4) });
        ctx.restore();
      }
      // right: gas bars per well
      const bx = 980, sc = .19, split = pr(t, at(s, 3, .05), 1.2), grow = t < c[5] ? 0 : 1;
      txt(ctx, 'GAS BY WELL, Sm³', bx, 190, { size: 22, mono: true, weight: 700, color: C.dim });
      'ABC'.split('').forEach((k, i) => {
        const e = EX[k], y = 270 + i * 130, kg = pr(t, at(s, 5, [.25, .4, .52][i]), .8);
        badge(ctx, bx - 50, y, k, { r: 28 });
        ctx.fillStyle = C.gas; ctx.fillRect(bx, y - 30, e.gRes * sc, 60);
        ctx.fillStyle = lerp(0, 1, split) > .02 ? LIFT : C.gas; ctx.globalAlpha = kG * lerp(1, .32, split); ctx.fillRect(bx + e.gRes * sc + 3 * split, y - 30, e.gLift * sc, 60); ctx.globalAlpha = kG;
        if (kg > 0) { ctx.strokeStyle = C.accent; ctx.lineWidth = 4; ctx.strokeRect(bx, y - 36, e.aGas * sc * kg, 72); }
        const tx = bx + Math.max(e.gTot, e.aGas * (t > c[5] ? 1 : 0)) * sc + 24;
        if (split < .5) txt(ctx, 'total ' + sp(e.gTot), tx, y, { size: 30, mono: true, weight: 700, a: 1 - split * 2 });
        else {
          const a = lin(t, at(s, 3, [.3, .5, .65][i]), .4);
          txt(ctx, sp(e.gTot) + ' − ' + e.gLift, tx, y - 18, { size: 22, mono: true, color: C.dim, a });
          txt(ctx, kg > .5 ? 'allocated ' + sp(e.aGas) : 'reservoir ' + sp(e.gRes), tx, y + 16, { size: 28, mono: true, weight: 700, color: kg > .5 ? C.accent : C.gas, a });
        }
      });
      ctx.fillStyle = C.gas; ctx.fillRect(bx, 630, 26, 26); txt(ctx, 'reservoir gas', bx + 38, 644, { size: 24, color: C.dim }); ctx.fillStyle = LIFT; ctx.globalAlpha = kG * split; ctx.fillRect(bx + 230, 630, 26, 26); txt(ctx, 'returning lift gas', bx + 268, 644, { size: 24, color: C.dim }); ctx.globalAlpha = kG;
      chip(ctx, bx, 716, 'Σ preliminary reservoir gas = 3 500 Sm³', { a: lin(t, at(s, 3, .85), .5), size: 28, mono: true, color: C.gas });
      const a5 = lin(t, c[5] + .2, .6);
      if (a5 > 0) {
        box(ctx, bx - 24, 770, 870, 104, { a: a5 * .98, stroke: C.accent, lw: 3, fill: '#101820' });
        ctx.globalAlpha = kG * a5; let x = formula(ctx, bx + 10, 822, [['K', C.accent]], { size: 48 }); txt(ctx, 'gas', x + 4, 838, { size: 24, weight: 700, color: C.accent });
        formula(ctx, x + 56, 822, [[' = ', C.dim], '4 200 / 3 500', [' = ', C.dim], ['1.20', C.accent]], { size: 42 });
      }
      ctx.restore();
    }
  },
});

// ---------- 13. Levels and other methods ----------
SCENES.push({
  id: 'levels', title: 'Bigger networks and other methods', amb: 'calc',
  cues: [
    'In a large network, allocation moves through levels: first from the overall total to facilities or fields, then to well groups, and then to wells.',
    'A valid intermediate meter constrains the wells downstream of it. One universal factor cannot simply be applied across facilities with different measurement arrangements.',
    'Other methods exist. The difference method subtracts reliably measured contributions and assigns what is left. But a small remainder of two large numbers is very uncertain.',
    'Component and energy allocation follow composition and heating value. Statistical reconciliation adjusts each measurement according to its uncertainty, while keeping the balances closed.',
  ],
  events(s) { return [{ t: at(s, 0, .3), type: 'whoosh' }, { t: at(s, 0, .55), type: 'whoosh' }, { t: at(s, 0, .8), type: 'whoosh' }]; },
  draw(ctx, t, c, s) {
    const kT = 1 - pr(t, c[2] - .6, 1);
    if (kT > 0) {
      ctx.save(); ctx.globalAlpha = kT;
      const top = [960, 200], F = [[520, 400], [1400, 400]], G = [[300, 600], [740, 600], [1180, 600], [1620, 600]], wy = 790;
      const k1 = lin(t, at(s, 0, .3), 1.6), k2 = lin(t, at(s, 0, .55), 1.6), k3 = lin(t, at(s, 0, .8), 1.6);
      // physical links (grey) and allocation arrows (dashed)
      ctx.strokeStyle = '#3a4652'; ctx.lineWidth = 5;
      F.forEach(f => { ctx.beginPath(); ctx.moveTo(f[0], f[1] - 40); ctx.lineTo(top[0], top[1] + 40); ctx.stroke(); });
      G.forEach((g, i) => { const f = F[i >> 1]; ctx.beginPath(); ctx.moveTo(g[0], g[1] - 36); ctx.lineTo(f[0], f[1] + 40); ctx.stroke(); for (let j = -1; j <= 1; j++) { ctx.beginPath(); ctx.moveTo(g[0] + j * 90, wy - 26); ctx.lineTo(g[0], g[1] + 36); ctx.stroke(); } });
      F.forEach((f, i) => backArrow(ctx, [[top[0] + (i ? 60 : -60), top[1] + 46], [f[0] + (i ? -40 : 40), f[1] - 46]], GT, { k: k1, a: k1 > 0 ? 1 : 0, w: 5 }));
      G.forEach((g, i) => { const f = F[i >> 1]; backArrow(ctx, [[f[0] + (i % 2 ? 50 : -50), f[1] + 46], [g[0] + (i % 2 ? -30 : 30), g[1] - 42]], GT, { k: k2, a: k2 > 0 ? 1 : 0, w: 4 }); });
      G.forEach(g => { for (let j = -1; j <= 1; j++) backArrow(ctx, [[g[0] + j * 20, g[1] + 42], [g[0] + j * 90, wy - 34]], GT, { k: k3, a: k3 > 0 ? 1 : 0, w: 3 }); });
      node(ctx, top[0], top[1], 'Overall measured total', { w: 400, h: 80, color: C.accent, size: 30, a: lin(t, c[0] + .2, .6) });
      F.forEach((f, i) => node(ctx, f[0], f[1], 'Facility ' + (i + 1), { w: 260, h: 76, size: 28, a: lin(t, c[0] + .6, .6), hl: t > c[1] && t < c[2] }));
      G.forEach((g, i) => node(ctx, g[0], g[1], 'Well group ' + (i + 1), { w: 250, h: 68, size: 26, a: lin(t, c[0] + 1, .6) }));
      G.forEach((g, i) => { for (let j = -1; j <= 1; j++) { ctx.globalAlpha = kT * lin(t, c[0] + 1.4, .6); ctx.fillStyle = [C.A, C.B, C.C][(j + 1 + i) % 3]; ctx.beginPath(); ctx.arc(g[0] + j * 90, wy, 24, 0, TAU); ctx.fill(); } });
      ctx.globalAlpha = kT;
      txt(ctx, 'wells', 150, wy, { size: 24, color: C.dim, align: 'center' });
      [[' 1  total → facilities', .3], [' 2  facilities → groups', .55], [' 3  groups → wells', .8]].forEach((l, i) => chip(ctx, 960, 290 + i * 200, l[0], { a: win(t, at(s, 0, l[1]), c[1]), size: 26, align: 'center' }));
      // intermediate meters and different factors
      const a1 = lin(t, c[1] + .3, .7);
      if (a1 > 0) {
        F.forEach((f, i) => { const mx = lerp(f[0], top[0], .42), my = lerp(f[1] - 40, top[1] + 40, .42); meter(ctx, mx, my, { t: GT + i, color: C.accent, r: 26, a: a1, hl: true }); });
        chip(ctx, 520, 500, 'K₁ for facility 1', { a: a1 * lin(t, at(s, 1, .3), .5), size: 28, mono: true, align: 'center' }); chip(ctx, 1400, 500, 'K₂ for facility 2', { a: a1 * lin(t, at(s, 1, .3), .5), size: 28, mono: true, align: 'center' });
        txt(ctx, '≠', 960, 500, { size: 70, weight: 700, color: C.hot, align: 'center', a: lin(t, at(s, 1, .5), .5) });
        chip(ctx, 960, 870, 'An intermediate meter constrains only the wells downstream of it', { a: lin(t, at(s, 1, .15), .5), size: 28, align: 'center' });
      }
      ctx.restore();
    }
    const kM = pr(t, c[2] - .2, 1);
    if (kM > 0) {
      ctx.save(); ctx.globalAlpha = kM;
      const card = (i, title, tag, col, draw) => {
        const x = 130 + (i % 2) * 850, y = 150 + (i >> 1) * 370, a = pr(t, i < 2 ? c[2] + .2 + i * (s.e[2] - c[2]) * .12 : at(s, 3, i === 2 ? .05 : .45), .7); if (a <= 0) return;
        ctx.save(); ctx.globalAlpha = kM * a; ctx.translate(0, (1 - a) * 16);
        box(ctx, x, y, 810, 340, { stroke: i === 0 ? C.accent : 'rgba(255,255,255,.14)', lw: i === 0 ? 3 : 2 });
        txt(ctx, title, x + 36, y + 52, { size: 36, weight: 700 }); if (tag) chip(ctx, x + 774, y + 52, tag, { size: 22, align: 'right', color: col, tc: col });
        draw(x, y); ctx.restore();
      };
      card(0, 'Proportional', 'used in this example', C.accent, (x, y) => {
        let bx = x + 36; 'ABC'.split('').forEach(k => { const w = 738 * EX[k].share / 100; ctx.fillStyle = C[k]; ctx.fillRect(bx, y + 110, w - 3, 54); bx += w; });
        txt(ctx, 'The control quantity is shared in proportion to\npreliminary estimates: V alloc = K × V pre', x + 36, y + 220, { size: 26, color: '#b9c5d0', lh: 1.4 });
      });
      card(1, 'Difference method', 'by subtraction', C.cold, (x, y) => {
        const kd = pr(t, at(s, 2, .4), 1.2);
        txt(ctx, 'total', x + 36, y + 118, { size: 22, color: C.dim }); ctx.fillStyle = C.accent; ctx.fillRect(x + 150, y + 100, 600, 36);
        txt(ctx, 'measured', x + 36, y + 168, { size: 22, color: C.dim }); ctx.fillStyle = C.cold; ctx.fillRect(x + 150, y + 150, 540 * kd, 36);
        txt(ctx, 'remainder', x + 36, y + 218, { size: 22, color: C.dim }); ctx.fillStyle = C.hot; ctx.globalAlpha *= lin(kd, .9, .1); ctx.fillRect(x + 690, y + 200, 60, 36);
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + 640, y + 218); ctx.lineTo(x + 790, y + 218); ctx.moveTo(x + 640, y + 206); ctx.lineTo(x + 640, y + 230); ctx.moveTo(x + 790, y + 206); ctx.lineTo(x + 790, y + 230); ctx.stroke();
        txt(ctx, 'A small difference of two large numbers\ncarries a high relative uncertainty', x + 36, y + 276, { size: 24, color: '#b9c5d0', lh: 1.35 });
      });
      card(2, 'Component and energy', 'by composition', '#c9a0ff', (x, y) => {
        glyph(ctx, 'comp', x + 76, y + 140, 30, '#c9a0ff'); txt(ctx, 'Source compositions, mixing,\nseparation and product yields', x + 130, y + 124, { size: 26, color: '#b9c5d0', lh: 1.35 });
        glyph(ctx, 'energy', x + 76, y + 250, 30, '#ff9f6b'); txt(ctx, 'Gas energy = quantity × heating value.\nShares can differ from volume shares.', x + 130, y + 234, { size: 26, color: '#b9c5d0', lh: 1.35 });
      });
      card(3, 'Statistical reconciliation', 'by uncertainty', C.ok, (x, y) => {
        formula(ctx, x + 36, y + 132, [['min Σ ', C.dim], ['(xᵢ − yᵢ)²', C.ink], [' / ', C.dim], ['σᵢ²', C.ok]], { size: 44 });
        txt(ctx, 'y  measurement      x  reconciled estimate      σ  uncertainty', x + 36, y + 196, { size: 22, color: C.dim });
        txt(ctx, 'Less certain measurements are adjusted more,\nwhile the conservation balances stay closed.', x + 36, y + 246, { size: 24, color: '#b9c5d0', lh: 1.35 });
      });
      ctx.restore();
    }
  },
});

// ---------- 14. Imbalance, exceptions, deferment ----------
const CAUSES = ['Outdated well tests', 'Incorrect runtime', 'Meter errors', 'Water-cut errors', 'PVT errors', 'Inventory errors', 'Wrong routing', 'Missing streams', 'Inconsistent periods'];
function warnTri(ctx, x, y, r, col) { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x + r, y + r * .8); ctx.lineTo(x - r, y + r * .8); ctx.closePath(); ctx.fill(); txt(ctx, '!', x, y + r * .22, { size: r * 1.2, weight: 700, align: 'center', color: '#0b1016' }); }
SCENES.push({
  id: 'imbalance', title: 'Diagnose the imbalance', amb: 'calc',
  cues: [
    { t: 'Before reconciling, look at the residual: 72.05 minus 65.5 is 6.55 m³, or 10% of the preliminary total.', say: 'Before reconciling, look at the residual: seventy-two point zero five, minus sixty-five point five, is six point five five cubic metres, or ten percent of the preliminary total.' },
    'Possible causes include outdated tests, wrong runtime, meter or water-cut errors, inventory errors, wrong routing, missing streams or mismatched periods. A residual alone does not prove a leak.',
    'Proportional allocation always closes the total. That confirms the arithmetic, not the accuracy of any single well. Imbalances beyond the acceptance criteria are investigated.',
    'Exceptions follow rules. A well shut in for the whole period gets zero: it earns no share just for being in the master data. And a missing estimate must never silently become zero.',
    'Deferment is different again: production that was possible but did not happen. That oil never passed through the facility, so it stays out of the physical balance.',
  ],
  events(s) { return [{ t: at(s, 0, .7), type: 'alert' }].concat(CAUSES.map((x, i) => ({ t: at(s, 1, .05 + i * .075), type: 'tick' }))).concat([{ t: at(s, 2, .3), type: 'ding' }, { t: at(s, 2, .75), type: 'alert' }]); },
  draw(ctx, t, c, s) {
    const kA = 1 - pr(t, c[3] - .6, 1);
    if (kA > 0) {
      ctx.save(); ctx.globalAlpha = kA;
      const bx = 520, sc = 11, y1 = 170, y2 = 250;
      txt(ctx, 'Control quantity', bx - 30, y1 + 26, { size: 28, weight: 600, align: 'right' }); ctx.fillStyle = C.accent; ctx.fillRect(bx, y1, EX.ctlOil * sc * pr(t, c[0] + .4, 1), 52);
      txt(ctx, '72.05', bx + EX.ctlOil * sc + 20, y1 + 27, { size: 34, mono: true, weight: 700, color: C.accent, a: lin(t, c[0] + 1.2, .4) });
      txt(ctx, 'Sum of preliminary', bx - 30, y2 + 26, { size: 28, weight: 600, align: 'right' });
      let x = bx; 'ABC'.split('').forEach((k, i) => { const w = EX[k].oil * sc; ctx.fillStyle = C[k]; ctx.globalAlpha = kA * lin(t, at(s, 0, .3) + i * .2, .4); ctx.fillRect(x, y2, w - 2, 52); x += w; }); ctx.globalAlpha = kA;
      const ar = lin(t, at(s, 0, .62), .5);
      ctx.save(); ctx.globalAlpha = kA * ar; ctx.beginPath(); ctx.rect(x, y2, 6.55 * sc, 52); ctx.clip(); ctx.fillStyle = 'rgba(255,100,100,.2)'; ctx.fillRect(x, y2, 6.55 * sc, 52); ctx.strokeStyle = C.bad; ctx.lineWidth = 3; for (let q = x - 60; q < x + 120; q += 14) { ctx.beginPath(); ctx.moveTo(q, y2 + 52); ctx.lineTo(q + 52, y2); ctx.stroke(); } ctx.restore();
      txt(ctx, '65.5', x - 16, y2 + 27, { size: 30, mono: true, weight: 700, color: '#0b1016', align: 'right', a: lin(t, at(s, 0, .5), .4) });
      txt(ctx, 'residual 6.55 m³ = 10 %', x + 6.55 * sc + 20, y2 + 27, { size: 30, mono: true, weight: 700, color: C.bad, a: ar });
      // causes
      CAUSES.forEach((cs, i) => {
        const a = lin(t, at(s, 1, .05 + i * .075), .4) * (1 - .75 * lin(t, c[2], .6)), cx = 300 + (i % 3) * 450, cy = 380 + Math.floor(i / 3) * 110; if (a <= 0) return;
        ctx.globalAlpha = kA * a; box(ctx, cx, cy, 420, 86, { stroke: 'rgba(255,209,102,.5)' }); warnTri(ctx, cx + 48, cy + 42, 20, C.accent); txt(ctx, cs, cx + 88, cy + 44, { size: 28, weight: 600 });
      });
      ctx.globalAlpha = kA;
      chip(ctx, 960, 760, 'A residual alone does not prove a physical leak', { a: win(t, at(s, 1, .78), c[2] + .2), size: 32, align: 'center', color: C.bad });
      const a2 = lin(t, c[2] + .3, .7);
      if (a2 > 0) {
        box(ctx, 240, 400, 700, 330, { a: a2 * .98, stroke: C.ok, lw: 3, fill: '#101820' }); box(ctx, 980, 400, 700, 330, { a: a2 * lin(t, at(s, 2, .35), .5) * .98, stroke: C.accent, lw: 3, fill: '#101820' });
        ctx.globalAlpha = kA * a2; txt(ctx, 'THE TOTAL CLOSES', 280, 450, { size: 24, mono: true, weight: 700, color: C.ok }); txt(ctx, 'Σ allocated = control  ✓', 280, 530, { size: 40, mono: true, weight: 700 }); txt(ctx, 'This confirms the arithmetic.', 280, 620, { size: 30, color: '#b9c5d0' });
        ctx.globalAlpha = kA * a2 * lin(t, at(s, 2, .35), .5); txt(ctx, 'BUT IS EACH WELL RIGHT?', 1020, 450, { size: 24, mono: true, weight: 700, color: C.accent }); txt(ctx, 'Not proven by closure.', 1020, 530, { size: 40, weight: 700 });
        const kn = pr(t, at(s, 2, .6), 1.2), gx = 1020, gw = 620; ctx.fillStyle = '#1b2733'; rr(ctx, gx, 600, gw, 24, 12); ctx.fill(); ctx.fillStyle = C.ok; rr(ctx, gx, 600, gw * .55, 24, 12); ctx.fill(); ctx.fillStyle = C.bad; ctx.fillRect(gx + gw * .55, 600, 4, 40);
        txt(ctx, 'acceptance limit', gx + gw * .55, 664, { size: 22, color: C.dim, align: 'center' }); ctx.fillStyle = '#fff'; ctx.beginPath(); const nx = gx + gw * lerp(.1, .82, kn); ctx.moveTo(nx, 596); ctx.lineTo(nx - 14, 572); ctx.lineTo(nx + 14, 572); ctx.closePath(); ctx.fill();
        txt(ctx, 'investigate', gx + gw * .82, 700, { size: 28, weight: 700, color: C.bad, align: 'center', a: lin(kn, .8, .2) });
      }
      ctx.restore();
    }
    // exceptions
    const kE = win(t, c[3] - .2, c[4] + .2, .7);
    if (kE > 0) {
      ctx.save(); ctx.globalAlpha = kE;
      const cols = [{ w: 150, al: 'l', head: 'Well' }, { w: 340, al: 'l', head: 'Status in the period' }, { w: 230, al: 'r', head: 'Preliminary\noil m³' }, { w: 200, al: 'r', head: 'Share' }];
      const rows = [[{ badge: 'A' }, { s: 'producing', mono: false }, '48.0', '73.3 %'], [{ badge: 'B' }, { s: 'producing', mono: false }, '15.0', '22.9 %'], [{ badge: 'C' }, { s: 'producing', mono: false }, '2.5', '3.8 %'], [{ s: 'D', mono: false, weight: 700, color: C.dim }, { s: 'shut in all period', mono: false, color: C.bad }, { s: '0.0', color: C.bad }, { s: '0 %', color: C.bad }]];
      table(ctx, 170, 200, cols, rows, { rh: 78, size: 32, hlRow: t > at(s, 3, .15) ? 3 : undefined, cellA: (r, ci) => r < 3 ? 1 : lin(t, at(s, 3, .12 + ci * .06), .4) });
      const am = lin(t, at(s, 3, .62), .6);
      box(ctx, 1200, 184, 560, 420, { a: am * .98, stroke: C.accent, lw: 3, fill: '#101820' });
      ctx.globalAlpha = kE * am; txt(ctx, 'A MISSING ESTIMATE', 1240, 236, { size: 24, mono: true, weight: 700, color: C.accent });
      txt(ctx, '—', 1320, 350, { size: 110, mono: true, weight: 700, align: 'center' }); txt(ctx, '→', 1480, 350, { size: 70, weight: 700, align: 'center', color: C.dim }); txt(ctx, '0', 1640, 350, { size: 110, mono: true, weight: 700, align: 'center', color: C.dim });
      ctx.strokeStyle = C.bad; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(1420, 290); ctx.lineTo(1540, 410); ctx.moveTo(1540, 290); ctx.lineTo(1420, 410); ctx.stroke();
      txt(ctx, 'Correct the data, or use a\ndocumented fallback method.', 1240, 480, { size: 28, color: '#b9c5d0', lh: 1.4 });
      ctx.globalAlpha = kE; chip(ctx, 560, 680, 'No flow, no share: existing in the master data is not enough', { a: lin(t, at(s, 3, .35), .5), size: 28, align: 'center' });
      ctx.restore();
    }
    // deferment
    const kD = lin(t, c[4] + .1, .8);
    if (kD > 0) {
      ctx.save(); ctx.globalAlpha = kD;
      const y = 520, x0 = 330, x1 = 1130;
      wellIcon(ctx, 220, y + 40, 'B', GT, { s: .34 });
      // potential (dashed) and actual (solid)
      ctx.save(); ctx.strokeStyle = C.accent; ctx.lineWidth = 4; ctx.setLineDash([14, 10]); ctx.lineDashOffset = -t * 30; ctx.strokeRect(x0, y - 120, x1 - x0 - 150, 90); ctx.restore();
      txt(ctx, 'Deferred: 10 m³ (example)', x0 + 30, y - 76, { size: 30, weight: 700, color: C.accent }); txt(ctx, 'potential that was not produced', x0 + 30, y - 152, { size: 24, color: C.dim });
      ctx.fillStyle = C.oil; ctx.fillRect(x0, y - 20, x1 - x0, 80); dots(ctx, [[x0, y + 20], [x1, y + 20]], GT, { color: '#fff3d6', speed: 90, gap: 40, r: 6 });
      txt(ctx, 'Actual production', x0 + 30, y + 96, { size: 30, weight: 700, color: C.oil });
      arrow(ctx, x1, y + 20, x1 + 110, y + 20, { color: C.oil, w: 14, head: 34 });
      box(ctx, x1 + 120, y - 150, 520, 340, { stroke: C.ok, lw: 3, fill: '#101820' });
      txt(ctx, 'PHYSICAL BALANCE', x1 + 160, y - 100, { size: 24, mono: true, weight: 700, color: C.ok });
      txt(ctx, 'Only material that actually\nentered the system is\ncounted here.', x1 + 160, y - 36, { size: 30, lh: 1.4 });
      const ax = lin(t, at(s, 4, .5), .6); ctx.globalAlpha = kD * ax;
      ctx.strokeStyle = C.bad; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(x1 - 120, y - 110); ctx.lineTo(x1 - 60, y - 40); ctx.moveTo(x1 - 60, y - 110); ctx.lineTo(x1 - 120, y - 40); ctx.stroke();
      ctx.globalAlpha = kD; chip(ctx, 960, 790, 'Deferment is an estimate of lost potential, not a stream in the balance', { a: ax, size: 30, align: 'center' });
      ctx.restore();
    }
  },
});

// ---------- 15. Closing, approval, report ----------
const STEPS = ['Import', 'Validation', 'Preliminary\nestimates', 'Phase\nconversions', 'Balance', 'Allocation', 'Checks', 'Exception\nreview', 'Approval', 'Publication'];
SCENES.push({
  id: 'close', title: 'From daily runs to an approved report', amb: 'calc',
  cues: [
    'Allocation runs every day for operations, often with provisional data. Monthly closing uses final data, and the monthly factor comes from monthly quantities, not from averaging the daily factors.',
    'The workflow runs from import and validation, through preliminary estimates, conversions, balance and allocation, to checks, exception review, approval and publication.',
    'Everything is retained: data versions, period, method, parameters, user, timestamp and reasons for corrections. The same inputs and rules must always reproduce the same result.',
    'The final report gives each well its oil, gas and water, runtime, factors and quality status, and from them the water cut and gas–oil ratio.',
    'Commercial entitlement is calculated afterwards, under the contracts. Physical production shares and revenue shares are not assumed to be the same.',
  ],
  events(s) { return STEPS.map((x, i) => ({ t: at(s, 1, .05 + i * .085), type: 'tick' })).concat([{ t: at(s, 0, .55), type: 'ding' }, { t: at(s, 2, .8), type: 'ding' }, { t: at(s, 3, .2), type: 'whoosh' }]); },
  draw(ctx, t, c, s) {
    const seg = (i) => win(t, c[i] - .2, i < 2 ? c[i + 1] + .1 : c[3] + .1, .6);
    // calendar
    const k0 = seg(0);
    if (k0 > 0) {
      ctx.save(); ctx.globalAlpha = k0;
      const kd = lin(t, c[0] + .5, (s.e[0] - c[0]) * .42) * 30, fin = lin(t, at(s, 0, .5), .8);
      txt(ctx, 'ONE MONTH', 200, 180, { size: 22, mono: true, weight: 700, color: C.dim });
      for (let d = 0; d < 30; d++) {
        const x = 200 + (d % 6) * 118, y = 210 + Math.floor(d / 6) * 118, a = lin(kd, d, 1); if (a <= 0) continue;
        ctx.globalAlpha = k0 * a; rr(ctx, x, y, 104, 104, 14); ctx.fillStyle = fin > 0 ? `rgba(95,211,141,${.25 * fin})` : 'rgba(255,209,102,.08)'; ctx.fill();
        ctx.strokeStyle = fin > .5 ? C.ok : C.accent; ctx.lineWidth = 3; ctx.setLineDash(fin > .5 ? [] : [8, 6]); ctx.stroke(); ctx.setLineDash([]);
        txt(ctx, String(d + 1), x + 52, y + 44, { size: 32, mono: true, weight: 700, align: 'center' }); txt(ctx, fin > .5 ? 'final' : 'provisional', x + 52, y + 80, { size: 16, align: 'center', color: fin > .5 ? C.ok : C.accent });
      }
      ctx.globalAlpha = k0;
      const am = lin(t, at(s, 0, .55), .6);
      box(ctx, 1010, 230, 760, 210, { a: am, stroke: C.ok, lw: 3, fill: '#101820' });
      ctx.globalAlpha = k0 * am; txt(ctx, 'MONTHLY FACTOR', 1046, 278, { size: 22, mono: true, weight: 700, color: C.ok }); txt(ctx, 'K = Σ monthly control', 1046, 340, { size: 36, mono: true, weight: 700 }); txt(ctx, '    / Σ monthly preliminary', 1046, 392, { size: 36, mono: true, weight: 700 });
      const an = lin(t, at(s, 0, .78), .6);
      ctx.globalAlpha = k0; box(ctx, 1010, 470, 760, 150, { a: an, stroke: C.bad, lw: 3, fill: '#101820' });
      ctx.globalAlpha = k0 * an; txt(ctx, 'NOT', 1046, 518, { size: 22, mono: true, weight: 700, color: C.bad }); txt(ctx, 'the average of daily K', 1046, 572, { size: 36, mono: true, weight: 700, color: '#b9c5d0' });
      ctx.strokeStyle = C.bad; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(1040, 574); ctx.lineTo(1530, 574); ctx.stroke();
      ctx.restore();
    }
    // workflow
    const k1 = seg(1);
    if (k1 > 0) {
      ctx.save(); ctx.globalAlpha = k1;
      STEPS.forEach((st, i) => {
        const x = 150 + (i % 5) * 330, y = i < 5 ? 300 : 580, on = lin(t, at(s, 1, .05 + i * .085), .4), cur = t > at(s, 1, .05 + i * .085) && t < at(s, 1, .05 + (i + 1) * .085);
        ctx.globalAlpha = k1 * (.3 + .7 * on);
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 270, y); ctx.lineTo(x + 310, y + 80); ctx.lineTo(x + 270, y + 160); ctx.lineTo(x, y + 160); ctx.lineTo(x + 40, y + 80); ctx.closePath();
        ctx.fillStyle = cur ? 'rgba(255,209,102,.22)' : on > .5 ? '#16212c' : '#10161d'; ctx.fill(); ctx.strokeStyle = cur ? C.accent : on > .5 ? C.ok : '#3a4652'; ctx.lineWidth = cur ? 5 : 3; ctx.stroke();
        txt(ctx, String(i + 1).padStart(2, '0'), x + 62, y + 34, { size: 20, mono: true, weight: 700, color: on > .5 ? C.accent : C.dim });
        const lines = st.split('\n'); txt(ctx, st, x + 160, y + (lines.length > 1 ? 74 : 92), { size: 28, weight: 700, align: 'center', lh: 1.2 });
      });
      ctx.restore();
    }
    // audit trail
    const k2 = seg(2);
    if (k2 > 0) {
      ctx.save(); ctx.globalAlpha = k2;
      box(ctx, 200, 160, 820, 700, {});
      txt(ctx, 'CALCULATION RECORD', 244, 212, { size: 22, mono: true, weight: 700, color: C.accent });
      [['Input-data version', 'retained'], ['Period', 'retained'], ['Method and equations', 'retained'], ['Parameters, test sources', 'retained'], ['User and timestamp', 'retained'], ['Reasons for corrections', 'retained']].forEach((r, i) => {
        const a = lin(t, at(s, 2, .06 + i * .085), .4), y = 280 + i * 92; ctx.globalAlpha = k2 * a;
        ctx.fillStyle = 'rgba(255,255,255,.05)'; rr(ctx, 232, y - 36, 756, 72, 10); ctx.fill(); txt(ctx, r[0], 262, y, { size: 30, weight: 600 }); chip(ctx, 964, y, r[1], { size: 24, align: 'right', color: C.ok, tc: C.ok });
      });
      const ar = lin(t, at(s, 2, .68), .6); ctx.globalAlpha = k2 * ar;
      box(ctx, 1090, 260, 660, 440, { stroke: C.ok, lw: 3, fill: '#101820' });
      txt(ctx, 'REPRODUCIBLE', 1130, 312, { size: 22, mono: true, weight: 700, color: C.ok });
      txt(ctx, 'same inputs + same rules', 1130, 380, { size: 32, weight: 600 });
      chip(ctx, 1130, 480, 'run 1:  52.80 m³', { size: 32, mono: true, color: C.A }); chip(ctx, 1130, 570, 'run 2:  52.80 m³', { size: 32, mono: true, color: C.A });
      txt(ctx, '=', 1590, 525, { size: 90, weight: 700, color: C.ok, align: 'center' }); txt(ctx, 'the same result, every time', 1130, 652, { size: 26, color: '#b9c5d0' });
      ctx.restore();
    }
    // report
    const k3 = lin(t, c[3] - .1, .8);
    if (k3 > 0) {
      const dim = lerp(1, .22, pr(t, c[4] - .2, .8));
      ctx.save(); ctx.globalAlpha = k3 * dim;
      const cols = [{ w: 130, al: 'l', head: 'Well' }, { w: 150, al: 'r', head: 'Runtime\nh' }, { w: 190, al: 'r', head: 'Oil\nm³' }, { w: 190, al: 'r', head: 'Water\nm³' }, { w: 200, al: 'r', head: 'Gas\nSm³' }, { w: 190, al: 'r', head: 'Water\ncut' }, { w: 210, al: 'r', head: 'GOR\nSm³/m³' }, { w: 190, al: 'r', head: 'Status' }];
      const rows = [['A', 24, '52.80', '10.80', '2 880', '17.0 %', '54.5'], ['B', 18, '16.50', '13.50', '1 080', '45.0 %', '65.5'], ['C', 12, '2.75', '6.75', '240', '71.1 %', '87.3']].map(r => [{ badge: r[0] }, String(r[1]), { s: r[2], color: C.oil }, { s: r[3], color: C.water }, { s: r[4], color: C.gas }, r[5], r[6], { s: 'final', color: C.ok, mono: false }]);
      rows.push([{ s: 'Total', mono: false, weight: 700 }, '—', { s: '72.05', color: C.oil, weight: 700 }, { s: '31.05', color: C.water, weight: 700 }, { s: '4 200', color: C.gas, weight: 700 }, '—', '—', ' ']);
      box(ctx, 211, 150, 1498, 96, { fill: '#16212c', stroke: C.accent, lw: 2 });
      txt(ctx, 'ALLOCATION REPORT', 245, 198, { size: 26, mono: true, weight: 700, color: C.accent });
      let x = 620; [['K oil 1.10', C.oil], ['K water 0.90', C.water], ['K gas 1.20', C.gas], ['version 1', C.dim], ['approved', C.ok]].forEach(p => { x += chip(ctx, x, 198, p[0], { size: 22, mono: true, color: p[1], tc: p[1] }) + 14; });
      table(ctx, 235, 290, cols, rows, { rh: 76, size: 32, totalRow: 3, cellA: (r, ci) => lin(t, at(s, 3, .12 + ci * .09 + r * .02), .4) });
      chip(ctx, 960, 760, 'Water cut and gas–oil ratio are derived from the allocated quantities', { a: lin(t, at(s, 3, .75), .5), size: 28, align: 'center' });
      ctx.restore();
      const a4 = lin(t, c[4] + .2, .8);
      if (a4 > 0) {
        box(ctx, 250, 330, 620, 300, { a: a4, stroke: C.accent, lw: 3, fill: '#101820' }); box(ctx, 1050, 330, 620, 300, { a: a4 * lin(t, at(s, 4, .3), .5), stroke: C.cold, lw: 3, fill: '#101820' });
        txt(ctx, 'PHYSICAL ALLOCATION', 290, 386, { size: 24, mono: true, weight: 700, color: C.accent, a: a4 }); txt(ctx, 'What each source\nproduced', 290, 470, { size: 44, weight: 700, lh: 1.2, a: a4 });
        const ab = a4 * lin(t, at(s, 4, .3), .5);
        txt(ctx, 'COMMERCIAL ENTITLEMENT', 1090, 386, { size: 24, mono: true, weight: 700, color: C.cold, a: ab }); txt(ctx, 'Who is entitled\nto what, by contract', 1090, 470, { size: 44, weight: 700, lh: 1.2, a: ab });
        arrow(ctx, 890, 480, 1030, 480, { color: '#fff', w: 8, a: ab }); txt(ctx, 'a separate, later stage', 960, 700, { size: 30, color: '#b9c5d0', align: 'center', a: ab });
      }
    }
  },
});

// ---------- 16. Summary ----------
SCENES.push({
  id: 'outro', title: 'The whole picture', amb: 'field', extra: 6.5,
  cues: [
    'Back allocation does not replace reliable meters or good well tests. Weak preliminary estimates mean greater uncertainty, even when the balance closes perfectly.',
    'Back allocation connects shared production accounting to the sources of that production. Measured totals, well data, operating time and material balances are combined to determine a reconciled contribution from each well.',
  ],
  events(s) { return [{ t: s.c[1] + .5, type: 'whoosh' }]; },
  draw(ctx, t, c, s) {
    drawPFD(ctx, GT, { val: { g: '4 200 Sm³', o: '64.05 m³', w: '31.05 m³' }, hl: { mG: 1, mO: 1, mW: 1 } });
    const ka = lin(t, c[1] + .5, 2.4), aa = lin(t, c[1] + .3, .5), ya = k => PFD.out(k)[1] + 34;
    backArrow(ctx, [[790, 509], [345, 509]], GT, { a: aa, k: ka });
    backArrow(ctx, [[790, 509], [690, 509], [690, ya('A')], [345, ya('A')]], GT, { a: aa, k: ka });
    backArrow(ctx, [[790, 509], [690, 509], [690, ya('C')], [345, ya('C')]], GT, { a: aa, k: ka });
    'ABC'.split('').forEach((k, i) => { const w = PFD.wells[k]; chip(ctx, w[0] - 150, w[1] + 46, 'oil ' + fmt(EX[k].aOil) + ' m³', { a: lin(t, c[1] + 2.4 + i * .5, .5), size: 26, mono: true, color: C[k], tc: C[k] }); });
    chip(ctx, 1400, 850, 'Good meters and good well tests come first', { a: win(t, at(s, 0, .15), c[1]), size: 30, align: 'center' });
    const aE = pr(t, s.e[1] + .9, 1.5);
    if (aE > 0) {
      ctx.globalAlpha = aE * .9; ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = aE;
      txt(ctx, 'From shared meters\nback to every well', 960, 420, { size: 96, weight: 700, align: 'center', lh: 1.15 });
      ctx.fillStyle = C.accent; ctx.fillRect(915, 620, 90, 5);
      txt(ctx, 'K oil 1.10   ·   K water 0.90   ·   K gas 1.20', 960, 690, { size: 30, mono: true, color: C.dim, align: 'center' });
      txt(ctx, 'Illustrative example · schematic, not to scale', 960, 750, { size: 26, color: C.dim, align: 'center' });
      ctx.globalAlpha = 1;
    }
  },
});
