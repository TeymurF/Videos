// Title, the value-chain ribbon, part cards, and Part 1a: formation, exploration, seismic.

// ---------- value-chain ribbon (used in the title, part cards, accounting and outro) ----------
const RIB = [
  ['UPSTREAM', 'finds and produces', C.up, ['explore', 'drill', 'produce']],
  ['MIDSTREAM', 'gathers, processes, stores, transports', C.mid, ['gather', 'process', 'transport']],
  ['DOWNSTREAM', 'refines, manufactures, supplies', C.down, ['refine', 'blend', 'deliver']],
];
function ribbon(ctx, T, o = {}) {
  const y = o.y ?? 400, h = o.h ?? 300, a = o.a ?? 1; if (a <= .01) return;
  ctx.save(); ctx.globalAlpha *= a;
  RIB.forEach((p, i) => {
    const x = 110 + i * 570, w = 560, on = o.hl == null || o.hl === i, k = o.k ? o.k(i) : 1; if (k <= .01) return;
    ctx.save(); ctx.globalAlpha *= k * (on ? 1 : .35); ctx.translate(0, (1 - k) * 30);
    rr(ctx, x, y, w, h, 22); ctx.fillStyle = '#121a23'; ctx.fill(); ctx.strokeStyle = on ? p[2] : '#2a3642'; ctx.lineWidth = on ? 4 : 2; ctx.stroke();
    ctx.fillStyle = p[2]; rr(ctx, x + 30, y + 30, 70, 8, 4); ctx.fill();
    txt(ctx, p[0], x + 30, y + 84, { size: 46, weight: 700, mono: true, color: p[2] });
    txt(ctx, p[1], x + 30, y + 136, { size: 26, color: '#c4cfd9' });
    p[3].forEach((s, j) => chip(ctx, x + 30 + j * 172, y + h - 44, s, { size: 22, color: 'rgba(255,255,255,.25)', tc: C.dim, mono: true }));
    ctx.restore();
  });
  // the two storylines: oil and gas
  const fy = y + 182;
  if (o.flow ?? 1) {
    dots(ctx, [[60, fy - 11], [1860, fy - 11]], T, { color: C.oil, speed: 150, gap: 46, r: 6, a: o.flow ?? 1 });
    dots(ctx, [[60, fy + 11], [1860, fy + 11]], T + .4, { color: C.gas, speed: 170, gap: 46, r: 6, a: o.flow ?? 1 });
  }
  ctx.restore();
}
function partCard(part, say, tag) {
  SCENES.push({
    id: 'part' + (part + 1), amb: 'calc', part, lead: .7, drift: .04, cues: [say],
    events(s) { return [{ t: .3, type: 'whoosh' }]; },
    draw(ctx, t, c, s) {
      ribbon(ctx, GT, { y: 520, h: 280, hl: part, a: lin(t, .1, .6) });
      const a = pr(t, .2, .8);
      ctx.globalAlpha = a; ctx.translate((1 - a) * -40, 0);
      txt(ctx, 'PART ' + (part + 1) + ' OF 3', 120, 210, { size: 28, mono: true, weight: 700, color: RIB[part][2] });
      txt(ctx, RIB[part][0][0] + RIB[part][0].slice(1).toLowerCase(), 114, 320, { size: 130, weight: 700 });
      txt(ctx, tag, 120, 430, { size: 38, weight: 400, color: '#c4cfd9' });
    },
  });
}

// ---------- Title ----------
SCENES.push({
  id: 'title', amb: 'calc', lead: 1.4, drift: .05,
  cues: [
    'Every litre of fuel and every cubic metre of gas travels a long road, from rock deep underground to the final consumer.',
    'That road has three parts. Upstream finds and produces. Midstream gathers, processes and transports. Downstream refines and delivers.',
  ],
  events(s) { return [0, 1, 2].map(i => ({ t: at(s, 1, .1 + i * .3), type: 'tick' })); },
  draw(ctx, t, c, s) {
    const a = pr(t, .4, 1.1), up = pr(t, c[1] - .5, .9);
    ctx.save(); ctx.globalAlpha = a; ctx.translate(0, (1 - a) * 24 - up * 150);
    txt(ctx, 'THE OIL AND GAS VALUE CHAIN', 960, 300, { size: 26, mono: true, weight: 700, color: C.accent, align: 'center' });
    txt(ctx, 'Upstream  Midstream  Downstream', 960, 410, { size: lerp(96, 66, up), weight: 700, align: 'center' });
    txt(ctx, 'From the reservoir to the final consumer', 960, 500, { size: 40, weight: 400, color: '#c4cfd9', align: 'center', a: 1 - up });
    ctx.restore();
    const fl = lin(t, 1.2, 1) * (1 - up);
    dots(ctx, [[0, 640], [1920, 640]], GT, { color: C.oil, speed: 190, gap: 60, r: 8, a: fl }); dots(ctx, [[0, 690], [1920, 690]], GT + .3, { color: C.gas, speed: 210, gap: 60, r: 8, a: fl });
    txt(ctx, 'crude oil', 120, 606, { size: 24, color: C.oil, weight: 600, a: fl }); txt(ctx, 'natural gas', 120, 726, { size: 24, color: C.gas, weight: 600, a: fl });
    ribbon(ctx, GT, { y: 440, h: 320, a: up, k: i => pr(t, at(s, 1, .1 + i * .3) - .3, .7) });
  },
});

partCard(0, 'Part one: upstream. Find the hydrocarbons, prove them, and bring them to the surface.', 'Find it, prove it, produce it');

// ---------- 1. Formation and accumulation ----------
const FOLD = x => -125 * Math.exp(-(((x - 1000) / 340) ** 2));
const GEO = [[230, 0], [330, .35], [450, .85], [520, 1], [640, 1], [760, .7], [860, .5], [1100, .3]];
const GEOC = ['#2e2822', '#262b30', '#3f4b57', '#7a6038', '#2b241f', '#17130f', '#20242a'];
const gy = (i, x) => GEO[i][0] + FOLD(x) * GEO[i][1];
function bandPath(ctx, i) { ctx.beginPath(); for (let x = 0; x <= W; x += 30) ctx.lineTo(x, gy(i, x)); for (let x = W; x >= 0; x -= 30) ctx.lineTo(x, gy(i + 1, x)); ctx.closePath(); }
const GSP = (() => { const R = rng(3), a = []; for (let i = 0; i < 260; i++) a.push([R() * W, R(), 2 + R() * 3.5, R()]); return a; })();
const MIG = (() => { const R = rng(8), a = []; for (let i = 0; i < 34; i++) { const x0 = 150 + R() * 1650, xr = lerp(x0, 1000, .45 + R() * .3), xc = 1000 + (R() - .5) * 320; a.push({ p: [[x0, 810 + R() * 30], [x0 + (R() - .5) * 40, gy(4, x0) + 10], [xr, gy(4, xr) - 30], [xc, gy(3, xc) + 24 + R() * 40]], ph: R(), gas: R() < .3 }); } return a; })();
function drawGeo(ctx, t, o = {}) {
  sky(ctx, 230); ctx.fillStyle = '#40342a'; ctx.fillRect(0, 230, W, 60);
  for (let i = 0; i < 7; i++) { bandPath(ctx, i); ctx.fillStyle = GEOC[i]; ctx.fill(); }
  // reservoir fluids, clipped to the reservoir band
  ctx.save(); bandPath(ctx, 3); ctx.clip();
  for (const p of GSP) { ctx.fillStyle = p[3] > .5 ? 'rgba(210,170,100,.5)' : 'rgba(40,28,14,.45)'; ctx.beginPath(); ctx.arc(p[0], lerp(gy(3, p[0]), gy(4, p[0]), p[1]), p[2], 0, TAU); ctx.fill(); }
  const acc = o.acc ?? 0;
  if (acc > 0) {
    ctx.globalAlpha = acc * .85; ctx.fillStyle = C.water; ctx.globalAlpha = acc * .28; ctx.fillRect(0, 488, W, 300);
    ctx.globalAlpha = acc * .9; ctx.fillStyle = C.oil; ctx.fillRect(0, 440, W, 48); ctx.fillStyle = C.gas; ctx.fillRect(0, 300, W, 140);
  }
  ctx.restore();
  // organic-rich source rock
  ctx.save(); bandPath(ctx, 5); ctx.clip(); const R = rng(14);
  for (let i = 0; i < 160; i++) { ctx.fillStyle = `rgba(233,166,59,${.25 + .5 * (o.cook ?? 0) * (.5 + .5 * Math.sin(t * 2 + i))})`; ctx.fillRect(R() * W, 700 + R() * 170, 10 + R() * 14, 3); }
  ctx.restore();
  if (o.cook) { const g = ctx.createLinearGradient(0, 700, 0, 1080); g.addColorStop(0, 'rgba(255,90,40,0)'); g.addColorStop(1, `rgba(255,90,40,${.34 * o.cook * (.8 + .2 * Math.sin(t * 2))})`); ctx.fillStyle = g; ctx.fillRect(0, 700, W, 380); }
}
SCENES.push({
  id: 'form', title: 'How oil and gas form', amb: 'under', part: 0,
  cues: [
    'It starts with organic material buried in sediment. Over geological time, heat and burial turn it into hydrocarbons.',
    'They migrate upward into porous reservoir rock, and collect where a trap and a sealing layer stop them from escaping.',
    'A reservoir is not an underground cave of oil. It is rock, with oil, gas and water held in tiny connected pores.',
  ],
  draw(ctx, t, c, s) {
    const mig = lin(t, c[1] - .2, 1), acc = pr(t, c[1] + 1.5, (s.e[1] - c[1]) * .6);
    drawGeo(ctx, t, { cook: lin(t, c[0] + .8, 1.5), acc });
    for (const m of MIG) { const L = polyLen(m.p), tot = L[L.length - 1], u = (m.ph + t * .11) % 1, q = polyAt(m.p, L, u * tot); ctx.globalAlpha = mig * Math.min(1, u * 8, (1 - u) * 6); ctx.fillStyle = m.gas ? C.gas : C.oil; ctx.beginPath(); ctx.arc(q[0], q[1], 6, 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 1;
    label(ctx, 420, 810, 240, 700, 'Source rock\norganic material', { a: win(t, c[0] + .8, c[2]) });
    chip(ctx, 1500, 880, 'heat + burial', { a: win(t, at(s, 0, .45), c[1]), size: 30, color: C.hot, tc: C.hot });
    chip(ctx, 960, 170, 'geological time: millions of years', { a: win(t, at(s, 0, .5), c[1] + 1), size: 28, align: 'center', mono: true });
    label(ctx, 620, gy(4, 620) - 40, 330, 590, 'Migration', { a: win(t, c[1] + .5, c[2]), align: 'right' });
    label(ctx, 1000, 465, 1330, 350, 'Trap: fluids collect at the crest', { a: win(t, at(s, 1, .45), c[2]) });
    label(ctx, 760, gy(2, 760) + 34, 520, 300, 'Seal rock', { a: win(t, at(s, 1, .65), c[2]), align: 'right' });
    [['gas', C.gas, 400], ['oil', C.oil, 464], ['water', C.water, 520]].forEach((p, i) => txt(ctx, p[0], 1000, p[2] + (i === 0 ? 14 : 0), { size: 24, weight: 700, align: 'center', color: '#0b1016', a: acc * (i < 2 ? 1 : 0) }));
    // magnified rock sample
    const a2 = pr(t, c[2] + .2, 1);
    if (a2 > 0) {
      const cx = 1470, cy = 600, r = 250 * a2;
      ctx.save(); ctx.globalAlpha = a2; ctx.strokeStyle = C.accent; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(1130, 470); ctx.lineTo(cx - r * .7, cy - r * .7); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fillStyle = '#c98f30'; ctx.fill(); ctx.save(); ctx.clip();
      const R = rng(77), gr = [];
      for (let k = 0; k < 900 && gr.length < 46; k++) { const x = cx - 260 + R() * 520, y = cy - 260 + R() * 520, rr2 = 26 + R() * 30; if (gr.every(g => Math.hypot(g[0] - x, g[1] - y) > g[2] + rr2 + 9)) gr.push([x, y, rr2, R()]); }
      for (let k = 0; k < 9; k++) { ctx.fillStyle = 'rgba(74,168,224,.85)'; ctx.beginPath(); ctx.arc(cx - 220 + R() * 440, cy - 220 + R() * 440, 22 + R() * 20, 0, TAU); ctx.fill(); }
      for (let k = 0; k < 26; k++) { ctx.fillStyle = 'rgba(215,250,235,.95)'; ctx.beginPath(); ctx.arc(cx - 220 + R() * 440 + Math.sin(t * 1.4 + k) * 3, cy - 220 + R() * 440, 3 + R() * 5, 0, TAU); ctx.fill(); }
      for (let k = 0; k < 16; k++) { const u = (k / 16 + t * .07) % 1; ctx.fillStyle = '#fff6dd'; ctx.beginPath(); ctx.arc(cx - 250 + u * 500, cy - 180 + (k % 6) * 72 + Math.sin(u * 14 + k) * 16, 5, 0, TAU); ctx.fill(); }
      for (const g of gr) { const gg = ctx.createRadialGradient(g[0] - g[2] * .3, g[1] - g[2] * .3, 2, g[0], g[1], g[2]); gg.addColorStop(0, `hsl(${32 + g[3] * 8},26%,60%)`); gg.addColorStop(1, `hsl(${28 + g[3] * 8},24%,38%)`); ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(g[0], g[1], g[2], 0, TAU); ctx.fill(); }
      ctx.restore(); ctx.strokeStyle = C.accent; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke(); ctx.restore();
      chip(ctx, 1470, 300, 'rock grains with fluid-filled pores', { a: lin(t, c[2] + 1.2, .5), size: 26, align: 'center' });
      chip(ctx, 500, 590, 'Porosity: storage space', { a: lin(t, at(s, 2, .45), .5), size: 30, align: 'center' });
      chip(ctx, 500, 660, 'Permeability: ability to flow', { a: lin(t, at(s, 2, .65), .5), size: 30, align: 'center' });
    }
  },
});

// ---------- 2. Exploration ----------
SCENES.push({
  id: 'explore', title: 'Exploration starts with a question', amb: 'calc', part: 0,
  cues: [
    'Geoscientists look for places where five things come together: a source, a migration path, a reservoir, a trap and a seal.',
    'They combine regional geology, old wells and geophysical surveys. The result is a prospect: an interpretation, not proof, with a chance of success and a range of possible volumes.',
  ],
  events(s) { return [0, 1, 2, 3, 4].map(i => ({ t: at(s, 0, .3 + i * .13), type: 'tick' })).concat([{ t: at(s, 1, .5), type: 'ding' }]); },
  draw(ctx, t, c, s) {
    // stacked map layers (isometric)
    const LAY = [['Regional geology', '#3d6a58'], ['Existing wells', '#4a5f86'], ['Seismic lines', '#7a5a8c'], ['Gravity and magnetics', '#8a6a3c']];
    LAY.forEach((l, i) => {
      const k = pr(t, .5 + i * .55, .9), y = 690 - i * 120 - (1 - k) * 260, x = 190;
      ctx.save(); ctx.globalAlpha = k * .95; ctx.transform(1, 0, -.55, .5, x + 260, y);
      ctx.fillStyle = l[1]; ctx.fillRect(0, 0, 520, 300); ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 3; ctx.strokeRect(0, 0, 520, 300);
      if (i === 0) { ctx.strokeStyle = 'rgba(255,255,255,.3)'; for (let j = 1; j < 4; j++) { ctx.beginPath(); ctx.ellipse(270, 150, 60 * j, 34 * j, .3, 0, TAU); ctx.stroke(); } }
      if (i === 1) for (const p of [[90, 70], [200, 230], [420, 90], [350, 220], [130, 180]]) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(p[0], p[1], 9, 0, TAU); ctx.fill(); }
      if (i === 2) { ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 3; for (let j = 0; j < 6; j++) { ctx.beginPath(); ctx.moveTo(40 + j * 88, 10); ctx.lineTo(40 + j * 88, 290); ctx.stroke(); } }
      if (i === 3) { const g = ctx.createRadialGradient(270, 150, 10, 270, 150, 200); g.addColorStop(0, 'rgba(255,220,120,.7)'); g.addColorStop(1, 'rgba(255,220,120,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 520, 300); }
      // the prospect outline, aligned on every layer
      const kp = lin(t, at(s, 1, .25), .8); if (kp > 0) { ctx.strokeStyle = C.accent; ctx.lineWidth = 6; ctx.setLineDash([14, 10]); ctx.lineDashOffset = -t * 30; ctx.globalAlpha = k * kp; ctx.beginPath(); ctx.ellipse(270, 150, 86, 50, .3, 0, TAU); ctx.stroke(); }
      ctx.restore();
      txt(ctx, l[0], 800, y + 80, { size: 26, weight: 600, a: k, color: '#c4cfd9' });
    });
    // the five elements
    const kc = 1 - pr(t, c[1] - .3, .8);
    ['Source', 'Migration', 'Reservoir', 'Trap', 'Seal'].forEach((e, i) => {
      const a = lin(t, at(s, 0, .3 + i * .13), .4) * kc, y = 250 + i * 108; if (a <= 0) return;
      box(ctx, 1200, y - 42, 560, 86, { a, stroke: C.ok }); txt(ctx, e, 1290, y + 2, { size: 36, weight: 700, a });
      ctx.globalAlpha = a; ctx.strokeStyle = C.ok; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(1228, y + 2); ctx.lineTo(1242, y + 16); ctx.lineTo(1266, y - 14); ctx.stroke(); ctx.globalAlpha = 1;
    });
    // prospect card
    const a1 = lin(t, c[1] + .4, .8);
    if (a1 > 0) {
      box(ctx, 1160, 200, 640, 620, { a: a1, stroke: C.accent, lw: 3 });
      txt(ctx, 'PROSPECT', 1200, 256, { size: 26, mono: true, weight: 700, color: C.accent, a: a1 }); txt(ctx, 'an interpretation, not proof', 1200, 304, { size: 30, weight: 600, a: a1 });
      // nested uncertainty envelope
      ctx.save(); ctx.globalAlpha = a1;
      [[250, 96, 'high case'], [176, 66, 'mid case'], [104, 38, 'low case']].forEach((e, i) => { ctx.strokeStyle = C.oil; ctx.globalAlpha = a1 * (.4 + i * .25) * lin(t, at(s, 1, .45) + i * .4, .5); ctx.lineWidth = 4; ctx.setLineDash([12, 9]); ctx.beginPath(); ctx.ellipse(1480, 470, e[0], e[1], 0, Math.PI, 0); ctx.closePath(); ctx.stroke(); ctx.setLineDash([]); });
      txt(ctx, 'low, mid and high case', 1480, 500, { size: 22, color: C.dim, align: 'center', a: a1 * lin(t, at(s, 1, .45), .5) });
      ctx.restore();
      txt(ctx, '?', 1480, 440, { size: 70, weight: 700, align: 'center', color: C.accent, a: a1 * lin(t, at(s, 1, .5), .4) });
      const a2 = a1 * lin(t, at(s, 1, .62), .5);
      txt(ctx, 'Chance of success', 1200, 580, { size: 26, color: C.dim, a: a2 }); ctx.globalAlpha = a2; ctx.fillStyle = '#1b2733'; rr(ctx, 1200, 606, 560, 22, 11); ctx.fill(); ctx.fillStyle = C.accent; rr(ctx, 1200, 606, 560 * (.3 + .04 * Math.sin(t * 2)), 22, 11); ctx.fill(); ctx.globalAlpha = 1;
      const a3 = a1 * lin(t, at(s, 1, .8), .5);
      txt(ctx, 'Range of recoverable volume', 1200, 690, { size: 26, color: C.dim, a: a3 }); ctx.globalAlpha = a3; ctx.fillStyle = '#1b2733'; rr(ctx, 1200, 716, 560, 22, 11); ctx.fill(); const g = ctx.createLinearGradient(1280, 0, 1680, 0); g.addColorStop(0, 'rgba(233,166,59,0)'); g.addColorStop(.4, C.oil); g.addColorStop(1, 'rgba(233,166,59,0)'); ctx.fillStyle = g; ctx.fillRect(1280, 716, 400, 22);
      txt(ctx, 'low', 1290, 766, { size: 20, color: C.dim }); txt(ctx, 'high', 1670, 766, { size: 20, color: C.dim, align: 'right' }); ctx.globalAlpha = 1;
    }
  },
});

// ---------- 3. Seismic ----------
const SH = [[560, .5], [650, .85], [740, 1], [840, .8]]; // reflectors under the sea bed
const shy = (i, x) => SH[i][0] + FOLD(x + 300) * SH[i][1];
SCENES.push({
  id: 'seismic', title: 'Seismic: imaging the subsurface', amb: 'sea', part: 0,
  cues: [
    'A controlled source sends elastic waves into the ground: vibrating trucks on land, towed acoustic sources at sea.',
    'Receivers record the echoes from rock boundaries, and processing turns those recordings into an image of the structure.',
    'Interpreters map horizons, faults and possible traps. But a reflection is not a photograph of oil. Only a well can confirm it.',
  ],
  events(s) { const ev = []; for (let k = 0; k * 2.6 < s.dur - 2; k++) ev.push({ t: 1 + k * 2.6, type: 'thump' }); return ev; },
  draw(ctx, t, c, s) {
    const sy = 250, by = 440, vx = 560 + 9 * t, srcX = vx - 250, srcY = sy + 34;
    sky(ctx, sy); sea(ctx, sy, by, t);
    const cols = ['#2f2a25', '#3a3f45', '#5c4a30', '#2a2f35', '#1f2226'];
    for (let i = 0; i <= 4; i++) { ctx.fillStyle = cols[i]; ctx.beginPath(); for (let x = 0; x <= W; x += 30) ctx.lineTo(x, i ? shy(i - 1, x) : by + 8); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill(); }
    // streamer with receivers
    ctx.strokeStyle = '#e9eef3'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(vx - 240, sy + 4); ctx.lineTo(srcX - 40, sy + 26); ctx.lineTo(srcX - 520, sy + 26); ctx.stroke();
    const rec = []; for (let i = 0; i < 9; i++) { const rx = srcX - 60 - i * 56; rec.push(rx); ctx.fillStyle = C.accent; ctx.fillRect(rx - 6, sy + 20, 12, 12); }
    ctx.fillStyle = C.hot; ctx.beginPath(); ctx.arc(srcX, srcY, 10, 0, TAU); ctx.fill();
    ship(ctx, vx, sy, .62, 'seismic', t);
    // wavefronts and reflected rays
    const ph = ((t - 1) / 2.6) % 1, shot = t > 1;
    if (shot) {
      for (let k = 0; k < 3; k++) { const r = (ph + k * .12) * 620; if (r < 20) continue; ctx.strokeStyle = `rgba(255,255,255,${.5 * (1 - ph) * (1 - k * .3)})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(srcX, srcY, r, .12, Math.PI - .12); ctx.stroke(); }
      for (let i = 0; i < 9; i += 2) for (let h = 0; h < 3; h++) { const mx = (srcX + rec[i]) / 2, my = shy(h, mx), p = [[srcX, srcY], [mx, my], [rec[i], sy + 26]], L = polyLen(p), d = ((ph * 1.25) % 1) * L[2], q = polyAt(p, L, d); ctx.globalAlpha = (1 - ph) * .9; ctx.fillStyle = d > L[1] ? C.accent : '#fff'; ctx.beginPath(); ctx.arc(q[0], q[1], 5, 0, TAU); ctx.fill(); }
      ctx.globalAlpha = 1;
    }
    label(ctx, srcX, srcY, srcX + 120, sy + 150, 'Acoustic source', { a: win(t, c[0] + 1, c[1]), color: C.hot });
    label(ctx, rec[5], sy + 26, rec[5] - 60, sy - 110, 'Receivers on a towed streamer', { a: win(t, c[1] + .3, c[2]), align: 'right' });
    label(ctx, 300, shy(1, 300), 190, shy(1, 300) + 120, 'Rock boundaries\nreflect the waves', { a: win(t, at(s, 0, .5), c[2]), align: 'left' });
    chip(ctx, 300, 180, 'on land: vibrator trucks', { a: win(t, at(s, 0, .45), c[1]), size: 26, align: 'center', color: C.dim });
    // seismic section builds trace by trace
    const a1 = lin(t, c[1] + .5, .8);
    if (a1 > 0) {
      const px = 1150, py = 150, pw = 680, ph2 = 640, nT = 44, built = lin(t, c[1] + 1, (s.e[1] - c[1]) * .7) * nT;
      ctx.save(); ctx.globalAlpha = a1; box(ctx, px, py, pw, ph2, { fill: '#0d1319', stroke: 'rgba(255,255,255,.2)' });
      txt(ctx, 'SEISMIC SECTION', px + 30, py + 38, { size: 22, mono: true, weight: 700, color: C.dim }); txt(ctx, 'two-way time ↓', px + pw - 30, py + 38, { size: 20, color: C.dim, align: 'right' });
      const hz = (h, j) => py + 150 + h * 130 + FOLD(400 + j / nT * 1200) * (.5 + h * .16);
      ctx.strokeStyle = '#c9d3dc'; ctx.lineWidth = 1.6;
      for (let j = 0; j < Math.min(nT, built); j++) { const x0 = px + 40 + j * (pw - 80) / nT; ctx.beginPath(); for (let y = py + 70; y < py + ph2 - 30; y += 4) { let am = .12 * Math.sin(y * .31 + j * 1.7) * Math.sin(y * .07 + j); for (let h = 0; h < 4; h++) { const d = (y - hz(h, j)) / 9; am += (h % 2 ? -1 : 1) * (1 - d * d) * Math.exp(-d * d * .5) * 1.2; } const x = x0 + am * 8; y === py + 70 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); }
      // interpretation overlay, clearly different from the data
      const a2 = lin(t, c[2] + .4, .8);
      if (a2 > 0) {
        const cl = [C.ok, C.accent, C.cold];
        for (let h = 0; h < 3; h++) { ctx.globalAlpha = a1 * a2; ctx.strokeStyle = cl[h]; ctx.lineWidth = 4; ctx.beginPath(); const kk = lin(t, c[2] + .5 + h * .6, 1.2) * nT; for (let j = 0; j <= kk; j++) { const x = px + 40 + j * (pw - 80) / nT, y = hz(h, j); j ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); }
        ctx.strokeStyle = C.bad; ctx.lineWidth = 4; ctx.globalAlpha = a1 * lin(t, at(s, 2, .3), .5); ctx.beginPath(); ctx.moveTo(px + pw * .78, py + 90); ctx.lineTo(px + pw * .68, py + ph2 - 50); ctx.stroke(); txt(ctx, 'fault', px + pw * .8, py + 110, { size: 22, weight: 600, color: C.bad });
        ctx.globalAlpha = a1 * lin(t, at(s, 2, .5), .6); ctx.setLineDash([10, 8]); ctx.strokeStyle = C.oil; ctx.lineWidth = 4; const cx = px + 40 + (600 / 1200) * (pw - 80), cy2 = hz(1, nT / 2); ctx.beginPath(); ctx.ellipse(cx, cy2 + 44, 150, 40, 0, Math.PI, 0); ctx.closePath(); ctx.stroke(); ctx.setLineDash([]);
        txt(ctx, 'possible trap ?', cx, cy2 + 30, { size: 24, weight: 700, align: 'center', color: C.oil });
      }
      ctx.restore();
      chip(ctx, px + pw / 2, 850, 'Interpretation, not measurement: a well must confirm it', { a: lin(t, at(s, 2, .62), .5), size: 26, align: 'center' });
    }
  },
});
