// Shared parts: one geological column for the whole film, its synthetic logs,
// formation / borehole / tool drawing, log tracks, and small particle effects.

// ---------- The geological column ----------
const LAYERS = [
  { top: 2398, bot: 2418, lith: 'shale', name: 'Shale' },
  { top: 2418, bot: 2432, lith: 'sand', fluid: 'gas', name: 'Sandstone · gas' },
  { top: 2432, bot: 2447, lith: 'sand', fluid: 'oil', name: 'Sandstone · oil' },
  { top: 2447, bot: 2462, lith: 'sand', fluid: 'water', name: 'Sandstone · water' },
  { top: 2462, bot: 2477, lith: 'shale', name: 'Shale' },
  { top: 2477, bot: 2494, lith: 'lime', name: 'Tight limestone' },
  { top: 2494, bot: 2512, lith: 'shale', name: 'Shale' },
];
// typical log responses (GR API, SP mV, resistivities ohm·m, DT us/ft, RHOB g/cm3, NPHI v/v sandstone units, CAL in)
const PROP = {
  shale: { GR: 112, SP: 0, RD: 2.2, RM: 2.1, RS: 1.9, DT: 98, RHOB: 2.47, NPHI: .37, CAL: 9.6 },
  gas: { GR: 28, SP: -62, RD: 55, RM: 30, RS: 9, DT: 104, RHOB: 2.13, NPHI: .11, CAL: 8.4 },
  oil: { GR: 31, SP: -63, RD: 32, RM: 17, RS: 7, DT: 93, RHOB: 2.31, NPHI: .21, CAL: 8.4 },
  water: { GR: 27, SP: -66, RD: .8, RM: 1.5, RS: 4.5, DT: 92, RHOB: 2.30, NPHI: .22, CAL: 8.4 },
  lime: { GR: 15, SP: -16, RD: 400, RM: 330, RS: 170, DT: 50, RHOB: 2.69, NPHI: .01, CAL: 8.5 },
};
const lkey = L => L.fluid || L.lith;
const LD0 = 2388, LD1 = 2522, DSTEP = 0.2;
// vertical resolution of each measurement (half-width of the bed-boundary transition, m)
const RES = { GR: .8, SP: 2.6, RD: 1.3, RM: 1.0, RS: .6, DT: .8, RHOB: .6, NPHI: .9, CAL: .5 };
const LOGV = (() => {
  const out = {}, sm = x => { x = clamp(x); return x * x * (3 - 2 * x); };
  for (const k of Object.keys(PROP.shale)) {
    const a = [], h = RES[k], lg = ['RD', 'RM', 'RS'].includes(k);
    for (let d = LD0; d <= LD1 + 1e-6; d += DSTEP) {
      let sw = 0, sv = 0;
      LAYERS.forEach((L, i) => {
        const top = i ? L.top : -1e9, bot = i < LAYERS.length - 1 ? L.bot : 1e9;
        const w = sm((d - top + h) / (2 * h)) * (1 - sm((d - bot + h) / (2 * h)));
        const v = PROP[lkey(L)][k]; sw += w; sv += w * (lg ? Math.log10(v) : v);
      });
      let v = sv / sw;
      if (lg) v = Math.pow(10, v + vnoise(d * 1.6, 4 + k.length) * .045 + vnoise(d * 6, 9) * .015);
      else if (k === 'GR') v += vnoise(d * 2.3, 1) * 6 + vnoise(d * 8, 2) * 3;
      else if (k === 'SP') v += vnoise(d * .35, 3) * 2.5;
      else if (k === 'DT') v += vnoise(d * 2.5, 5) * 1.6;
      else if (k === 'RHOB') v += vnoise(d * 3.1, 6) * .016;
      else if (k === 'NPHI') v += vnoise(d * 2.9, 7) * .009;
      else if (k === 'CAL') v += vnoise(d * 1.3, 8) * (v > 9 ? .45 : .08);
      a.push(v);
    }
    out[k] = a;
  }
  return out;
})();
function logAt(k, d) {
  const f = clamp((d - LD0) / DSTEP, 0, LOGV[k].length - 1.001), i = Math.floor(f);
  return lerp(LOGV[k][i], LOGV[k][i + 1], f - i);
}
const layerAt = d => LAYERS.find(L => d < L.bot) || LAYERS[LAYERS.length - 1];

// depth view: depth d0..d1 drawn between y0..y1
const Y = (v, d) => v.y0 + (d - v.d0) / (v.d1 - v.d0) * (v.y1 - v.y0);
const DofY = (v, y) => v.d0 + (y - v.y0) / (v.y1 - v.y0) * (v.d1 - v.d0);

// ---------- Rock textures ----------
const mkCanvas = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); return c; };
const PAT = {
  shale: mkCanvas(256, 96, (g, w, h) => {
    g.fillStyle = '#46423c'; g.fillRect(0, 0, w, h); const R = rng(3);
    for (let i = 0; i < 70; i++) { const y = R() * h, x0 = R() * w, L = 30 + R() * 140; g.strokeStyle = R() < .5 ? `rgba(22,20,18,${.3 + R() * .3})` : `rgba(120,114,104,${.18 + R() * .2})`; g.lineWidth = .8 + R() * 1.4; for (const o of [0, -w]) { g.beginPath(); g.moveTo(x0 + o, y); g.lineTo(x0 + o + L, y); g.stroke(); } }
  }),
  sand: mkCanvas(128, 128, (g, w, h) => {
    g.fillStyle = '#a3865a'; g.fillRect(0, 0, w, h); const R = rng(5);
    for (let i = 0; i < 380; i++) { const x = R() * w, y = R() * h, r = 1.3 + R() * 2.4; g.fillStyle = R() < .5 ? `rgba(222,198,150,${.45 + R() * .4})` : `rgba(110,88,56,${.45 + R() * .4})`; for (const ox of [0, -w, w]) for (const oy of [0, -h, h]) { g.beginPath(); g.arc(x + ox, y + oy, r, 0, TAU); g.fill(); } }
  }),
  lime: mkCanvas(160, 80, (g, w, h) => {
    g.fillStyle = '#8994a0'; g.fillRect(0, 0, w, h); const R = rng(9);
    for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(255,255,255,${R() * .14})`; g.fillRect(R() * w, R() * h, 2, 2); }
    g.strokeStyle = 'rgba(40,48,58,.5)'; g.lineWidth = 2;
    for (let r = 0; r < 2; r++) { const y = r * 40; g.beginPath(); g.moveTo(0, y + 1); g.lineTo(w, y + 1); g.stroke(); for (let k = 0; k < 2; k++) { const x = (k * 80 + (r ? 40 : 0)) % w + 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 40); g.stroke(); } }
  }),
};
const TINT = { gas: 'rgba(210,238,226,.30)', oil: 'rgba(110,62,10,.50)', water: 'rgba(30,100,170,.42)' };
const FLUIDCOL = { gas: '#cfeee0', oil: '#e9a63b', water: '#4aa8e0' };

function drawFormation(ctx, x0, x1, v, o = {}) {
  ctx.save(); ctx.globalAlpha *= o.a ?? 1;
  ctx.beginPath(); ctx.rect(x0, v.y0, x1 - x0, v.y1 - v.y0); ctx.clip();
  for (const L of LAYERS) {
    const ya = Y(v, L === LAYERS[0] ? LD0 : L.top), yb = Y(v, L === LAYERS[LAYERS.length - 1] ? LD1 : L.bot);
    if (yb < v.y0 || ya > v.y1) continue;
    ctx.save(); ctx.translate(x0, ya); ctx.fillStyle = ctx.createPattern(PAT[L.lith], 'repeat'); ctx.fillRect(0, 0, x1 - x0, yb - ya); ctx.restore();
    if (L.fluid) { ctx.fillStyle = TINT[L.fluid]; ctx.fillRect(x0, ya, x1 - x0, yb - ya); }
    ctx.fillStyle = L.fluid && LAYERS[LAYERS.indexOf(L) - 1]?.fluid ? 'rgba(255,255,255,.25)' : 'rgba(0,0,0,.45)';
    ctx.fillRect(x0, Y(v, L.top) - 1, x1 - x0, 2);
  }
  ctx.restore();
  if (o.labels) drawLayerLabels(ctx, o.labelX ?? x0 + 14, v, { a: (o.a ?? 1) * o.labels, align: o.labelAlign });
}
function drawLayerLabels(ctx, x, v, o = {}) {
  const a = o.a ?? 1; if (a <= .01) return;
  for (const L of LAYERS) {
    const y = (Y(v, L.top) + Y(v, L.bot)) / 2; if (y < v.y0 + 10 || y > v.y1 - 10) continue;
    ctx.save(); ctx.globalAlpha *= a; ctx.font = font(21, 600);
    const tw = ctx.measureText(L.name).width, bx = o.align === 'right' ? x - tw - 20 : x;
    rr(ctx, bx, y - 15, tw + 20, 30, 8); ctx.fillStyle = 'rgba(9,13,18,.72)'; ctx.fill();
    if (L.fluid) { ctx.fillStyle = FLUIDCOL[L.fluid]; ctx.fillRect(bx, y - 15, 4, 30); }
    txt(ctx, L.name, bx + 10, y + 1, { size: 21, weight: 600, color: '#e6ebf0' });
    ctx.restore();
  }
}

// ---------- Borehole ----------
const holeHW = (d, hw) => hw * logAt('CAL', d) / 8.5;
function drawBorehole(ctx, cx, v, o = {}) {
  const hw = o.hw ?? 34, d0 = Math.max(v.d0, LD0), d1 = Math.min(v.d1, LD1), n = 140;
  ctx.save(); ctx.globalAlpha *= o.a ?? 1;
  ctx.beginPath(); ctx.rect(cx - hw * 3, v.y0, hw * 6, v.y1 - v.y0); ctx.clip();
  ctx.beginPath();
  for (let i = 0; i <= n; i++) { const d = lerp(d0, d1, i / n); ctx.lineTo(cx - holeHW(d, hw), Y(v, d)); }
  for (let i = n; i >= 0; i--) { const d = lerp(d0, d1, i / n); ctx.lineTo(cx + holeHW(d, hw), Y(v, d)); }
  ctx.closePath();
  const g = ctx.createLinearGradient(cx - hw * 1.3, 0, cx + hw * 1.3, 0);
  g.addColorStop(0, '#1d1916'); g.addColorStop(.5, '#3a3129'); g.addColorStop(1, '#1d1916');
  ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 2; ctx.stroke();
  if (o.cake !== false) {
    ctx.strokeStyle = '#94784f'; ctx.lineWidth = Math.max(3, hw * .1);
    for (const L of LAYERS) if (L.lith === 'sand') for (const sd of [-1, 1]) {
      ctx.beginPath(); for (let i = 0; i <= 24; i++) { const d = lerp(L.top + .4, L.bot - .4, i / 24); ctx.lineTo(cx + sd * (holeHW(d, hw) - ctx.lineWidth / 2), Y(v, d)); } ctx.stroke();
    }
  }
  ctx.restore();
}

// ---------- Logging tool (sonde) on a cable; y is the measure point ----------
function drawSonde(ctx, cx, y, o = {}) {
  const w = o.w ?? 26, up = o.up ?? 90, dn = o.down ?? 60;
  ctx.save(); ctx.globalAlpha *= o.a ?? 1;
  if (o.cable !== null) { ctx.strokeStyle = '#c9d3dc'; ctx.lineWidth = Math.max(2, w * .11); ctx.beginPath(); ctx.moveTo(cx, o.cable ?? -50); ctx.lineTo(cx, y - up - 6); ctx.stroke(); }
  ctx.fillStyle = '#6d7a86'; rr(ctx, cx - w * .3, y - up - 10, w * .6, 14, 4); ctx.fill();
  const g = ctx.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
  g.addColorStop(0, '#4f5b67'); g.addColorStop(.32, '#dfe6ec'); g.addColorStop(.62, '#9aa8b5'); g.addColorStop(1, '#414c57');
  ctx.fillStyle = g; rr(ctx, cx - w / 2, y - up, w, up + dn, Math.min(w / 2, 14)); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.3)'; for (const j of o.joints || []) ctx.fillRect(cx - w / 2, y + j - 1, w, 2);
  for (const p of o.parts || []) {
    ctx.save(); ctx.fillStyle = p.color; ctx.globalAlpha *= p.a ?? 1;
    if (p.glow) { ctx.shadowColor = p.color; ctx.shadowBlur = p.glow; }
    rr(ctx, cx - w / 2 - 1, y + p.dy - p.h / 2, w + 2, p.h, 4); ctx.fill(); ctx.restore();
  }
  ctx.restore();
}

// ---------- Log tracks ----------
// curve: { k, min, max, log, rev, color, dash, lw, name }
function cPos(c, val) {
  let f = c.log ? (Math.log10(Math.max(val, 1e-6)) - Math.log10(c.min)) / (Math.log10(c.max) - Math.log10(c.min)) : (val - c.min) / (c.max - c.min);
  return c.rev ? 1 - f : f;
}
const fmtS = x => (Math.abs(x) >= 100 || Number.isInteger(x)) ? String(x) : String(+x.toFixed(2));
function trackHeader(ctx, tr, v, o = {}) {
  const n = tr.curves.length, hh = 34 * n + 8, y0 = v.y0 - hh - 6;
  box(ctx, tr.x, y0, tr.w, hh, { r: 6, fill: '#121a23', stroke: '#243240', lw: 1.5 });
  tr.curves.forEach((c, i) => {
    const a = c.a ?? 1, yy = y0 + 8 + 34 * i + 13;
    ctx.save(); ctx.globalAlpha *= a;
    txt(ctx, c.name, tr.x + tr.w / 2, yy - 2, { size: 19, weight: 700, color: c.color, align: 'center' });
    const L = c.rev ? c.max : c.min, R = c.rev ? c.min : c.max;
    txt(ctx, fmtS(L), tr.x + 7, yy - 2, { size: 14, mono: true, color: C.dim });
    txt(ctx, fmtS(R), tr.x + tr.w - 7, yy - 2, { size: 14, mono: true, color: C.dim, align: 'right' });
    ctx.strokeStyle = c.color; ctx.lineWidth = 2.5; ctx.setLineDash(c.dash || []);
    ctx.beginPath(); ctx.moveTo(tr.x + 8, yy + 14); ctx.lineTo(tr.x + tr.w - 8, yy + 14); ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
  });
}
function drawTrack(ctx, tr, v, dNow, o = {}) {
  const { x, w } = tr, a = o.a ?? 1; if (a <= .01) return;
  ctx.save(); ctx.globalAlpha *= a;
  if (o.header !== false) trackHeader(ctx, tr, v);
  ctx.fillStyle = '#0d1319'; ctx.fillRect(x, v.y0, w, v.y1 - v.y0);
  ctx.save(); ctx.beginPath(); ctx.rect(x, v.y0, w, v.y1 - v.y0); ctx.clip();
  // grid
  ctx.lineWidth = 1;
  if (tr.grid === 'log') {
    const c = tr.curves[0], l0 = Math.log10(c.min), l1 = Math.log10(c.max);
    for (let e = Math.floor(l0); e < l1; e++) for (let m = 1; m < 10; m++) {
      const f = (Math.log10(m) + e - l0) / (l1 - l0); if (f <= 0 || f >= 1) continue;
      ctx.strokeStyle = m === 1 ? 'rgba(255,255,255,.16)' : 'rgba(255,255,255,.05)';
      ctx.beginPath(); ctx.moveTo(x + f * w, v.y0); ctx.lineTo(x + f * w, v.y1); ctx.stroke();
    }
  } else for (let i = 1; i < 10; i++) { ctx.strokeStyle = i === 5 ? 'rgba(255,255,255,.12)' : 'rgba(255,255,255,.06)'; ctx.beginPath(); ctx.moveTo(x + w * i / 10, v.y0); ctx.lineTo(x + w * i / 10, v.y1); ctx.stroke(); }
  for (let d = Math.ceil(v.d0 / 2) * 2; d <= v.d1; d += 2) { ctx.strokeStyle = d % 10 === 0 ? 'rgba(255,255,255,.13)' : 'rgba(255,255,255,.045)'; ctx.beginPath(); ctx.moveTo(x, Y(v, d)); ctx.lineTo(x + w, Y(v, d)); ctx.stroke(); }
  const dTop = Math.max(dNow, v.d0), dBot = Math.min(o.dEnd ?? v.d1, v.d1);
  if (dBot > dTop) {
    const step = DSTEP;
    // lithology shading under the gamma ray
    if (tr.fillGR) {
      const c = tr.curves.find(c => c.k === 'GR');
      for (let d = dTop; d < dBot; d += step) {
        const g = logAt('GR', d), f = clamp((g - 20) / 90);
        ctx.fillStyle = `rgba(${Math.round(lerp(226, 92, f))},${Math.round(lerp(190, 98, f))},${Math.round(lerp(96, 92, f))},${.5 * (tr.fillA ?? 1)})`;
        ctx.fillRect(x, Y(v, d), cPos(c, g) * w, Y(v, d + step) - Y(v, d) + .6);
      }
    }
    // neutron-density crossover (gas) and shale separation
    if (tr.cross) {
      const cn = tr.curves.find(c => c.k === 'NPHI'), cd = tr.curves.find(c => c.k === 'RHOB');
      for (let d = dTop; d < dBot; d += step) {
        const xn = x + cPos(cn, logAt('NPHI', d)) * w, xd = x + cPos(cd, logAt('RHOB', d)) * w, yy = Y(v, d), hh = Y(v, d + step) - yy + .6;
        if (xd < xn - 2) { ctx.fillStyle = `rgba(255,209,102,${.55 * (tr.crossA ?? 1)})`; ctx.fillRect(xd, yy, xn - xd, hh); }
        else if (xn < xd - 2 && tr.shaleSep) { ctx.fillStyle = `rgba(150,150,140,${.28 * tr.shaleSep})`; ctx.fillRect(xn, yy, xd - xn, hh); }
      }
    }
    for (const c of tr.curves) {
      ctx.save(); ctx.globalAlpha *= c.a ?? 1;
      ctx.strokeStyle = c.color; ctx.lineWidth = c.lw ?? 3; ctx.setLineDash(c.dash || []); ctx.lineJoin = 'round';
      ctx.beginPath();
      for (let d = dTop; d <= dBot + 1e-6; d += step) ctx.lineTo(x + cPos(c, logAt(c.k, d)) * w, Y(v, d));
      ctx.stroke(); ctx.setLineDash([]);
      ctx.restore();
    }
  }
  ctx.restore();
  ctx.strokeStyle = '#2e3c4b'; ctx.lineWidth = 2; ctx.strokeRect(x, v.y0, w, v.y1 - v.y0);
  // recording pen
  if (o.pen && dNow > v.d0 && dNow < v.d1) {
    const yy = Y(v, dNow);
    ctx.strokeStyle = 'rgba(255,209,102,.55)'; ctx.setLineDash([6, 6]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x + w, yy); ctx.stroke(); ctx.setLineDash([]);
    for (const c of tr.curves) { if ((c.a ?? 1) < .5) continue; const px = x + clamp(cPos(c, logAt(c.k, dNow))) * w; ctx.fillStyle = c.color; ctx.shadowColor = c.color; ctx.shadowBlur = 14; ctx.beginPath(); ctx.arc(px, yy, 6, 0, TAU); ctx.fill(); ctx.shadowBlur = 0; }
  }
  ctx.restore();
}
function drawDepthTrack(ctx, x, w, v, o = {}) {
  ctx.save(); ctx.globalAlpha *= o.a ?? 1;
  ctx.fillStyle = '#10171e'; ctx.fillRect(x, v.y0, w, v.y1 - v.y0);
  ctx.strokeStyle = '#2e3c4b'; ctx.lineWidth = 2; ctx.strokeRect(x, v.y0, w, v.y1 - v.y0);
  if (o.header !== false) { box(ctx, x, v.y0 - 48, w, 42, { r: 6, fill: '#121a23', stroke: '#243240', lw: 1.5 }); txt(ctx, 'DEPTH\nm', x + w / 2, v.y0 - 36, { size: 13, mono: true, weight: 700, color: C.dim, align: 'center', lh: 1.15 }); }
  for (let d = Math.ceil(v.d0 / 10) * 10; d <= v.d1; d += 10) { if (Y(v, d) < v.y0 + 10 || Y(v, d) > v.y1 - 8) continue; txt(ctx, String(d), x + w / 2, Y(v, d), { size: 16, mono: true, weight: 500, color: '#b7c3cf', align: 'center' }); }
  ctx.restore();
}

// standard curve definitions
const CV = {
  GR: { k: 'GR', min: 0, max: 150, color: C.gr, name: 'Gamma ray · API' },
  SP: { k: 'SP', min: -100, max: 20, color: C.sp, name: 'SP · mV', dash: [10, 6] },
  CAL: { k: 'CAL', min: 6, max: 16, color: '#c9b8a6', name: 'Caliper · in', dash: [3, 5], lw: 2 },
  RD: { k: 'RD', min: .2, max: 2000, log: true, color: C.rd, name: 'Deep resistivity', lw: 3.2 },
  RM: { k: 'RM', min: .2, max: 2000, log: true, color: C.rm, name: 'Medium', dash: [10, 6] },
  RS: { k: 'RS', min: .2, max: 2000, log: true, color: C.rs, name: 'Shallow', dash: [3, 5] },
  DT: { k: 'DT', min: 40, max: 140, rev: true, color: C.dt, name: 'Sonic Δt · µs/ft' },
  RHOB: { k: 'RHOB', min: 1.9, max: 2.9, color: C.rhob, name: 'Density · g/cm³' },
  NPHI: { k: 'NPHI', min: -.15, max: .45, rev: true, color: C.nphi, name: 'Neutron · v/v', dash: [10, 6] },
};
const cv = (k, extra = {}) => ({ ...CV[k], ...extra });

// ---------- Particles ----------
// a gamma-ray photon travelling from p1 to p2 (k = 0..1 progress), drawn as a short wavy streak
function photon(ctx, x1, y1, x2, y2, k, o = {}) {
  if (k <= 0 || k >= 1) return;
  const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L, tail = o.tail ?? 70, amp = o.amp ?? 5;
  const hd = k * L;
  ctx.save(); ctx.globalAlpha *= o.a ?? 1; ctx.strokeStyle = o.color ?? C.gamma; ctx.lineWidth = o.lw ?? 2.4; ctx.lineCap = 'round';
  ctx.beginPath();
  for (let s = Math.max(0, hd - tail); s <= hd; s += 3) { const wv = Math.sin(s * .45) * amp * ((s - hd + tail) / tail); ctx.lineTo(x1 + ux * s - uy * wv, y1 + uy * s + ux * wv); }
  ctx.stroke();
  ctx.fillStyle = '#fff6cc'; ctx.shadowColor = o.color ?? C.gamma; ctx.shadowBlur = 12; ctx.beginPath(); ctx.arc(x1 + ux * hd, y1 + uy * hd, o.r ?? 4, 0, TAU); ctx.fill();
  ctx.restore();
}
function glowDot(ctx, x, y, r, col, a = 1) { ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = r * 3; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.restore(); }
function chip(ctx, x, y, s, o = {}) {
  const a = o.a ?? 1; if (a <= .01) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.font = font(o.size ?? 22, 600, o.mono);
  const tw = ctx.measureText(s).width, bw = tw + 30, bx = o.align === 'center' ? x - bw / 2 : o.align === 'right' ? x - bw : x;
  rr(ctx, bx, y - 19, bw, 38, 19); ctx.fillStyle = o.fill ?? 'rgba(11,16,22,.85)'; ctx.fill();
  ctx.strokeStyle = o.color ?? C.accent; ctx.lineWidth = 2; ctx.stroke();
  txt(ctx, s, bx + 15, y + 1, { size: o.size ?? 22, weight: 600, color: o.textColor ?? o.color ?? C.accent, mono: o.mono });
  ctx.restore();
}
function panel(ctx, x, y, w, h, title, o = {}) {
  ctx.save(); ctx.globalAlpha *= o.a ?? 1;
  box(ctx, x, y, w, h, { r: 16, fill: '#0f151c', stroke: '#243240', lw: 2 });
  if (title) txt(ctx, title, x + 24, y + 30, { size: 17, mono: true, weight: 700, color: o.tc ?? C.accent });
  ctx.restore();
}
const at = (s, i, k) => s.c[i] + (s.e[i] - s.c[i]) * k;
// eased value of a cue-relative window
const cueA = (t, s, i, f = .5) => win(t, s.c[i] - .3, s.e[i] + .4, f);

// ---------- Probe-view layout shared by the tool scenes ----------
const PV = { y0: 210, y1: 892, d0: 2398, d1: 2512 };
const PVX = { f0: 50, f1: 690, hole: 330, tr: 735, trw: 270, px: 1060, pw: 810 };
// tool depth during a scene: logs upward from the bottom between the first cue and the last one
function toolDepth(t, s, o = {}) {
  const a = o.from ?? s.c[0] + .3, b = o.to ?? s.e[s.c.length - 1] - .6;
  return lerp(o.d1 ?? 2510, o.d0 ?? 2401, clamp((t - a) / (b - a)));
}
function drawProbe(ctx, t, s, spec) {
  const d = spec.depth;
  drawFormation(ctx, PVX.f0, PVX.f1, PV, { labels: spec.labels ?? 1, labelX: PVX.f0 + 14 });
  drawBorehole(ctx, PVX.hole, PV, { hw: 36 });
  ctx.save(); ctx.beginPath(); ctx.rect(PVX.f0, PV.y0 - 40, PVX.f1 - PVX.f0, PV.y1 - PV.y0 + 40); ctx.clip();
  spec.tool(ctx, PVX.hole, Y(PV, d));
  ctx.restore();
  // depth line from the tool's measure point to the track
  const yy = Y(PV, d);
  ctx.strokeStyle = 'rgba(255,209,102,.35)'; ctx.setLineDash([4, 6]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(PVX.hole + 40, yy); ctx.lineTo(PVX.tr, yy); ctx.stroke(); ctx.setLineDash([]);
  txt(ctx, d.toFixed(1) + ' m', PVX.hole + 52, yy - 14, { size: 17, mono: true, weight: 700, color: C.accent });
  drawTrack(ctx, spec.track, PV, d, { pen: true });
}
