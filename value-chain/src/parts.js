// Shared drawing parts: scenery, wells, rigs, vessels, towers, ships, molecules, icons.

// ---------- Pumpjack well icon (local units, ground y=0, wellhead x=230) ----------
const PJ = { P: [0, -300], A: 230, Cr: 190, O: [-190, -80], R: 50, L: 220 };
function pjGeom(th) {
  const { P, A, Cr, O, R, L } = PJ;
  const K = [O[0] + R * Math.cos(th), O[1] + R * Math.sin(th)];
  const dx = K[0] - P[0], dy = K[1] - P[1], d = Math.hypot(dx, dy);
  const a = (Cr * Cr - L * L + d * d) / (2 * d), h = Math.sqrt(Math.max(0, Cr * Cr - a * a));
  const mx = P[0] + a * dx / d, my = P[1] + a * dy / d;
  const c1 = [mx + h * dy / d, my - h * dx / d], c2 = [mx - h * dy / d, my + h * dx / d];
  const E = c1[1] < c2[1] ? c1 : c2;
  const phi = Math.atan2(E[1] - P[1], -(E[0] - P[0]));
  return { K, E, phi, yc: -170 - A * phi };
}
const PJR = (() => { let mn = 9, mx = -9; for (let i = 0; i < 720; i++) { const p = pjGeom(i / 720 * TAU).phi; mn = Math.min(mn, p); mx = Math.max(mx, p); } return { mn, mx }; })();
// polished rod position 0..1 (0 = bottom) and direction (+1 up)
function pjS(th) { return (pjGeom(th).phi - PJR.mn) / (PJR.mx - PJR.mn); }
function pjDir(th) { return Math.sign(pjS(th + .01) - pjS(th - .01)); }
const TH = T => TAU * T / PERIOD;

function drawPumpjack(ctx, th, o = {}) {
  const { P, A, Cr, O, R } = PJ, g = pjGeom(th), hl = o.hl || '';
  const col = (part, base) => hl.includes(part) ? C.accent : base;
  const glow = part => { if (hl.includes(part)) { ctx.shadowColor = C.accent; ctx.shadowBlur = 18; } else ctx.shadowBlur = 0; };
  ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  // base
  ctx.fillStyle = '#39434d'; ctx.fillRect(-430, -16, 560, 16);
  ctx.fillStyle = '#2a323a'; ctx.fillRect(-440, -6, 580, 6);
  // motor
  glow('motor'); ctx.fillStyle = col('motor', '#5d7890');
  rr(ctx, -412, -74, 92, 50, 10); ctx.fill(); ctx.shadowBlur = 0;
  ctx.fillStyle = '#39434d'; ctx.fillRect(-404, -26, 76, 10);
  ctx.strokeStyle = 'rgba(0,0,0,.28)'; ctx.lineWidth = 2;
  for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-400 + i * 11, -68); ctx.lineTo(-400 + i * 11, -30); ctx.stroke(); }
  const M = [-338, -50], G = [-262, -96];
  // belt
  glow('belt'); ctx.strokeStyle = col('belt', '#1c2228'); ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(M[0] - 3, M[1] - 13); ctx.lineTo(G[0] - 6, G[1] - 35); ctx.moveTo(M[0] + 3, M[1] + 13); ctx.lineTo(G[0] + 8, G[1] + 35); ctx.stroke(); ctx.shadowBlur = 0;
  const pulley = (c, r, ang, part) => {
    ctx.fillStyle = col(part, '#7d8c99'); ctx.beginPath(); ctx.arc(c[0], c[1], r, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#1c2228'; ctx.lineWidth = Math.max(2, r * .12);
    for (let i = 0; i < 3; i++) { const a = ang + i * TAU / 3; ctx.beginPath(); ctx.moveTo(c[0], c[1]); ctx.lineTo(c[0] + Math.cos(a) * r * .8, c[1] + Math.sin(a) * r * .8); ctx.stroke(); }
    ctx.fillStyle = '#1c2228'; ctx.beginPath(); ctx.arc(c[0], c[1], r * .22, 0, TAU); ctx.fill();
  };
  pulley(M, 13, th * 14, 'motor'); pulley(G, 35, th * 5, 'belt');
  // gearbox
  glow('gear'); ctx.fillStyle = col('gear', '#46627a');
  rr(ctx, -250, -132, 124, 100, 12); ctx.fill(); ctx.shadowBlur = 0;
  ctx.fillStyle = '#39434d'; ctx.fillRect(-246, -34, 116, 18);
  ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.lineWidth = 2; rr(ctx, -242, -124, 108, 84, 8); ctx.stroke();
  // Samson post
  glow('post'); ctx.strokeStyle = col('post', '#6f8091'); ctx.lineWidth = 15;
  ctx.beginPath(); ctx.moveTo(-74, -16); ctx.lineTo(P[0], P[1] + 6); ctx.lineTo(74, -16); ctx.stroke();
  ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(-50, -105); ctx.lineTo(50, -105); ctx.moveTo(-28, -195); ctx.lineTo(28, -195); ctx.stroke(); ctx.shadowBlur = 0;
  // crank + counterweight
  ctx.save(); ctx.translate(O[0], O[1]); ctx.rotate(th);
  glow('crank'); ctx.fillStyle = col('crank', '#8e9eac'); rr(ctx, -18, -14, 142, 28, 12); ctx.fill();
  glow('cw'); ctx.fillStyle = col('cw', '#c0563b'); rr(ctx, 66, -36, 64, 72, 14); ctx.fill(); ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(0,0,0,.22)'; rr(ctx, 76, -26, 44, 52, 8); ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#1c2228'; ctx.beginPath(); ctx.arc(O[0], O[1], 9, 0, TAU); ctx.fill();
  // pitman arm
  glow('pitman'); ctx.strokeStyle = col('pitman', '#b4c1cc'); ctx.lineWidth = 9;
  ctx.beginPath(); ctx.moveTo(g.E[0], g.E[1]); ctx.lineTo(g.K[0], g.K[1]); ctx.stroke(); ctx.shadowBlur = 0;
  ctx.fillStyle = '#e6edf2'; ctx.beginPath(); ctx.arc(g.K[0], g.K[1], 7, 0, TAU); ctx.fill();
  // bridle
  glow('bridle'); ctx.strokeStyle = col('bridle', '#cfd8df'); ctx.lineWidth = 3.5;
  ctx.beginPath(); ctx.arc(P[0], P[1], A + 3, -0.40 - g.phi, 0); ctx.lineTo(P[0] + A + 3, g.yc); ctx.stroke(); ctx.shadowBlur = 0;
  // walking beam with horsehead
  ctx.save(); ctx.translate(P[0], P[1]); ctx.rotate(-g.phi);
  glow('beam'); ctx.fillStyle = col('beam', '#e0a437'); rr(ctx, -Cr - 22, -15, Cr + A - 20, 30, 5); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(-Cr - 22, -4, Cr + A - 20, 8); ctx.shadowBlur = 0;
  glow('head'); ctx.fillStyle = col('head', '#e0a437');
  ctx.beginPath(); ctx.arc(0, 0, A, -0.42, 0.42); ctx.lineTo(A - 62, A * Math.sin(.42) - 6); ctx.lineTo(A - 62, -A * Math.sin(.42) + 6); ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0;
  ctx.fillStyle = '#1c2228'; ctx.beginPath(); ctx.arc(-Cr, 0, 8, 0, TAU); ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#39434d'; ctx.beginPath(); ctx.arc(P[0], P[1], 13, 0, TAU); ctx.fill();
  ctx.fillStyle = '#e6edf2'; ctx.beginPath(); ctx.arc(P[0], P[1], 5, 0, TAU); ctx.fill();
  if (!o.noWell) drawWellhead(ctx, g.yc, o);
  ctx.restore();
  return g;
}
// wellhead: polished rod, stuffing box, tee, flowline (x=230)
function drawWellhead(ctx, yc, o = {}) {
  const X = PJ.A + 3, hl = o.hl || '', col = (p, b) => hl.includes(p) ? C.accent : b;
  ctx.save();
  if (hl.includes('rod')) { ctx.shadowColor = C.accent; ctx.shadowBlur = 16; }
  ctx.fillStyle = col('rod', C.steelL); ctx.fillRect(X - 3, yc, 6, -yc - 70); ctx.shadowBlur = 0;
  ctx.fillStyle = '#7d8c99'; rr(ctx, X - 16, yc - 5, 32, 10, 3); ctx.fill();
  // flowline
  const fl = o.flowLen ?? 190;
  ctx.fillStyle = col('flow', '#5b6c7c'); ctx.fillRect(X + 12, -47, fl, 14);
  ctx.fillStyle = col('flow', '#8fa1b1'); rr(ctx, X + 52, -52, 22, 24, 4); ctx.fill();
  ctx.strokeStyle = '#c0563b'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(X + 63, -52); ctx.lineTo(X + 63, -64); ctx.moveTo(X + 52, -64); ctx.lineTo(X + 74, -64); ctx.stroke();
  // pumping tee and casing head
  ctx.fillStyle = col('tee', '#6f8091'); rr(ctx, X - 13, -58, 26, 44, 4); ctx.fill();
  ctx.fillStyle = col('tee', '#8fa1b1'); rr(ctx, X - 22, -18, 44, 18, 3); ctx.fill();
  // stuffing box
  ctx.fillStyle = col('sbox', '#3f8f6b'); rr(ctx, X - 10, -80, 20, 24, 4); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(X - 10, -72, 20, 3); ctx.fillRect(X - 10, -65, 20, 3);
  ctx.restore();
}

function camOn(ctx, cam) { ctx.translate(960, cam.sy ?? 500); ctx.scale(cam.z, cam.z); ctx.translate(-cam.cx, -cam.cy); }
const camP = (cam, x, y) => [(x - cam.cx) * cam.z + 960, (y - cam.cy) * cam.z + (cam.sy ?? 500)];
const camMix = (a, b, k) => ({ cx: lerp(a.cx, b.cx, k), cy: lerp(a.cy, b.cy, k), z: Math.exp(lerp(Math.log(a.z), Math.log(b.z), k)) });
const camKf = (t, arr) => { // [[time, cam, duration], ...] eased transitions starting at each key
  let c = arr[0][1];
  for (let i = 1; i < arr.length; i++) c = camMix(c, arr[i][1], pr(t, arr[i][0], arr[i][2] ?? 2.2));
  return c;
};
function drawSky(ctx, x0, x1, top) {
  const g = ctx.createLinearGradient(0, top, 0, 0);
  g.addColorStop(0, '#0a1220'); g.addColorStop(.55, '#1b2a40'); g.addColorStop(.86, '#5a4a5c'); g.addColorStop(1, '#d98a55');
  ctx.fillStyle = g; ctx.fillRect(x0, top, x1 - x0, -top);
  // sun and hills
  const sg = ctx.createRadialGradient(-900, -20, 10, -900, -20, 380); sg.addColorStop(0, 'rgba(255,214,150,.9)'); sg.addColorStop(.12, 'rgba(255,170,90,.5)'); sg.addColorStop(1, 'rgba(255,150,80,0)');
  ctx.fillStyle = sg; ctx.fillRect(-1300, -400, 800, 400);
  ctx.fillStyle = '#2c2a3a'; ctx.beginPath(); ctx.moveTo(x0, 0);
  for (let x = x0; x <= x1; x += 60) ctx.lineTo(x, -34 - 26 * Math.sin(x / 310) - 16 * Math.sin(x / 123 + 1));
  ctx.lineTo(x1, 0); ctx.fill();
  ctx.fillStyle = '#211f29'; ctx.beginPath(); ctx.moveTo(x0, 0);
  for (let x = x0; x <= x1; x += 60) ctx.lineTo(x, -12 - 12 * Math.sin(x / 190 + 2));
  ctx.lineTo(x1, 0); ctx.fill();
}

// ---------- Process-flow parts ----------
const fmt = (v, d = 2) => v.toFixed(d);
function pipe(ctx, pts, o = {}) {
  ctx.save(); ctx.globalAlpha *= o.a ?? 1; ctx.lineJoin = 'round'; ctx.lineCap = o.cap ?? 'round';
  ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
  ctx.strokeStyle = o.edge ?? '#1a222b'; ctx.lineWidth = (o.w ?? 12) + 6; ctx.stroke();
  ctx.strokeStyle = o.color ?? '#55667a'; ctx.lineWidth = o.w ?? 12; ctx.stroke();
  ctx.restore();
}
// horizontal separator vessel with gas / oil / water layers
function vessel(ctx, x, y, w, h, o = {}) {
  const r = h / 2, k = o.fill ?? 1;
  ctx.save(); ctx.globalAlpha *= o.a ?? 1;
  ctx.fillStyle = '#39434d'; ctx.fillRect(x + w * .18, y + h - 4, 14, 34); ctx.fillRect(x + w * .82 - 14, y + h - 4, 14, 34);
  ctx.save(); rr(ctx, x, y, w, h, r); ctx.clip();
  ctx.fillStyle = '#25313b'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = C.oil; ctx.fillRect(x, y + h - h * .62 * k, w, h);
  ctx.fillStyle = C.water; ctx.fillRect(x, y + h - h * .27 * k, w, h);
  if (o.t != null) { const R = rng(o.seed ?? 3); for (let i = 0; i < 22; i++) { const u = (R() + o.t * .15) % 1; ctx.globalAlpha = (o.a ?? 1) * (1 - u) * .8; ctx.fillStyle = C.gas; ctx.beginPath(); ctx.arc(x + 20 + R() * (w - 40), y + h * .38 - u * h * .3, 2 + R() * 3, 0, TAU); ctx.fill(); } }
  ctx.restore();
  ctx.strokeStyle = o.hl ? C.accent : '#93a4b3'; ctx.lineWidth = 6; rr(ctx, x, y, w, h, r); ctx.stroke();
  ctx.restore();
}
function tank(ctx, x, y, w, h, level, o = {}) {
  ctx.save(); ctx.globalAlpha *= o.a ?? 1;
  ctx.fillStyle = '#1b242d'; ctx.fillRect(x, y, w, h);
  const lh = h * clamp(level);
  const g = ctx.createLinearGradient(0, y + h - lh, 0, y + h); g.addColorStop(0, C.oil); g.addColorStop(1, C.oilD);
  ctx.fillStyle = o.fluid ?? g; ctx.fillRect(x, y + h - lh, w, lh);
  ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(x, y + h - lh, w, 3);
  ctx.strokeStyle = o.hl ? C.accent : '#93a4b3'; ctx.lineWidth = 6; ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = '#93a4b3'; ctx.beginPath(); ctx.moveTo(x - 6, y); ctx.lineTo(x + w / 2, y - 26); ctx.lineTo(x + w + 6, y); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.lineWidth = 2; for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(x, y + h * i / 4); ctx.lineTo(x + 16, y + h * i / 4); ctx.stroke(); }
  ctx.restore();
}
// flow meter symbol with an optional readout below
function meter(ctx, x, y, o = {}) {
  const r = o.r ?? 30, col = o.color ?? C.accent;
  ctx.save(); ctx.globalAlpha *= o.a ?? 1;
  if (o.hl) { ctx.shadowColor = col; ctx.shadowBlur = 26; }
  ctx.fillStyle = '#0e151c'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.shadowBlur = 0;
  ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.stroke();
  ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y + 3, r * .58, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
  const an = Math.PI * 1.5 + .5 * Math.sin((o.t ?? 0) * 1.7 + x);
  ctx.beginPath(); ctx.moveTo(x, y + 5); ctx.lineTo(x + Math.cos(an) * r * .6, y + 5 + Math.sin(an) * r * .6); ctx.stroke();
  if (o.label) txt(ctx, o.label, x, y - r - 20, { size: o.ls ?? 22, weight: 600, align: 'center', color: C.ink });
  if (o.value != null) {
    ctx.font = font(o.vs ?? 26, 700, true); const tw = ctx.measureText(o.value).width + 28;
    rr(ctx, x - tw / 2, y + r + 10, tw, 42, 8); ctx.fillStyle = 'rgba(11,16,22,.92)'; ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke();
    txt(ctx, o.value, x, y + r + 32, { size: o.vs ?? 26, mono: true, weight: 700, align: 'center', color: col });
  }
  ctx.restore();
}
// small in-line valve: open = pipe colour bow-tie, closed = red
function valve(ctx, x, y, open, o = {}) {
  ctx.save(); ctx.globalAlpha *= o.a ?? 1; ctx.translate(x, y); if (o.vert) ctx.rotate(Math.PI / 2);
  ctx.fillStyle = open > .5 ? C.ok : C.bad;
  ctx.beginPath(); ctx.moveTo(-15, -11); ctx.lineTo(0, 0); ctx.lineTo(-15, 11); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(15, -11); ctx.lineTo(0, 0); ctx.lineTo(15, 11); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#0b1016'; ctx.lineWidth = 2; ctx.stroke();
  ctx.restore();
}
// reverse-calculation arrow: dashed, animated toward the end point (a calculation, not a fluid)
function backArrow(ctx, pts, t, o = {}) {
  const a = o.a ?? 1; if (a <= .01) return;
  const L = polyLen(pts), tot = L[L.length - 1], k = o.k ?? 1, col = o.color ?? C.accent;
  ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = col; ctx.lineWidth = o.w ?? 5; ctx.lineJoin = 'round';
  ctx.setLineDash([16, 12]); ctx.lineDashOffset = -t * 60;
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) { if (L[i] <= k * tot) ctx.lineTo(pts[i][0], pts[i][1]); else { const q = polyAt(pts, L, k * tot); ctx.lineTo(q[0], q[1]); break; } }
  ctx.stroke(); ctx.setLineDash([]);
  const q = polyAt(pts, L, k * tot), q0 = polyAt(pts, L, k * tot - 8), an = Math.atan2(q[1] - q0[1], q[0] - q0[0]), hd = (o.w ?? 5) * 4;
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(q[0] + Math.cos(an) * hd * .5, q[1] + Math.sin(an) * hd * .5);
  ctx.lineTo(q[0] - Math.cos(an - .5) * hd, q[1] - Math.sin(an - .5) * hd); ctx.lineTo(q[0] - Math.cos(an + .5) * hd, q[1] - Math.sin(an + .5) * hd); ctx.closePath(); ctx.fill();
  ctx.restore();
}
// pill label; returns its width
function chip(ctx, x, y, s, o = {}) {
  const size = o.size ?? 26, col = o.color ?? C.accent;
  ctx.save(); ctx.globalAlpha *= o.a ?? 1; ctx.font = font(size, o.weight ?? 600, o.mono);
  const tw = ctx.measureText(s).width + size * 1.3, h = size * 1.75, bx = o.align === 'center' ? x - tw / 2 : o.align === 'right' ? x - tw : x;
  rr(ctx, bx, y - h / 2, tw, h, h / 2); ctx.fillStyle = o.fill ?? 'rgba(11,16,22,.9)'; ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke();
  txt(ctx, s, bx + tw / 2, y + 1, { size, weight: o.weight ?? 600, mono: o.mono, align: 'center', color: o.tc ?? C.ink });
  ctx.restore(); return tw;
}
// table: cols [{w, al, head}], rows of cells (string or {s,color,weight,a,mono}); o.cellA(r,c) reveals cells
function table(ctx, x, y, cols, rows, o = {}) {
  const rh = o.rh ?? 66, size = o.size ?? 30, a = o.a ?? 1; if (a <= .01) return;
  const tw = cols.reduce((n, c) => n + c.w, 0);
  ctx.save(); ctx.globalAlpha *= a;
  box(ctx, x - 24, y - 16, tw + 48, rh * (rows.length + 1) + 32, { fill: o.fill ?? C.panel, stroke: o.stroke });
  let cx = x;
  cols.forEach(c => { txt(ctx, c.head, c.al === 'l' ? cx + 8 : c.al === 'c' ? cx + c.w / 2 : cx + c.w - 8, y + rh / 2, { size: o.hs ?? 22, weight: 600, color: C.dim, align: c.al === 'l' ? 'left' : c.al === 'c' ? 'center' : 'right', lh: 1.1 }); cx += c.w; });
  ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(x, y + rh - 1, tw, 2);
  rows.forEach((row, r) => {
    const ry = y + rh * (r + 1), ra = o.rowA ? o.rowA(r) : 1; if (ra <= .01) return;
    if (o.hlRow === r) { ctx.fillStyle = 'rgba(255,209,102,.10)'; ctx.fillRect(x - 12, ry + 3, tw + 24, rh - 6); }
    if (o.totalRow === r) { ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillRect(x, ry, tw, 2); }
    let cx = x;
    row.forEach((cell, ci) => {
      const c = cols[ci], d = typeof cell === 'object' ? cell : { s: cell }, ca = ra * (o.cellA ? o.cellA(r, ci) : 1) * (d.a ?? 1);
      if (ca > .01) {
        txt(ctx, d.s, c.al === 'l' ? cx + 8 : c.al === 'c' ? cx + c.w / 2 : cx + c.w - 8, ry + rh / 2 + 1, { size: d.size ?? size, weight: d.weight ?? 600, mono: d.mono ?? (c.al !== 'l'), color: d.color ?? C.ink, align: c.al === 'l' ? 'left' : c.al === 'c' ? 'center' : 'right', a: ca });
      }
      cx += c.w;
    });
  });
  ctx.restore();
}
// fraction of a cue: time at k (0..1) between its start and end
const at = (s, i, k) => s.c[i] + (s.e[i] - s.c[i]) * k;

// ---------- Scenery ----------
function sky(ctx, gy) { ctx.save(); ctx.translate(960, gy); drawSky(ctx, -1000, 1000, -gy - 10); ctx.restore(); }
function land(ctx, gy, o = {}) {
  ctx.fillStyle = o.top ?? '#40342a'; ctx.fillRect(0, gy, W, 80); ctx.fillStyle = o.sub ?? '#2a2520'; ctx.fillRect(0, gy + 60, W, H - gy);
  ctx.fillStyle = '#4b3d30'; ctx.fillRect(0, gy, W, 6);
}
function sea(ctx, sy, by, t) { // water from the surface sy down to the seabed by
  const g = ctx.createLinearGradient(0, sy, 0, by); g.addColorStop(0, '#15526f'); g.addColorStop(1, '#082534');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, by);
  for (let x = 0; x <= W; x += 24) ctx.lineTo(x, sy + 5 * Math.sin(x / 70 + t * 1.3) + 3 * Math.sin(x / 31 - t * 1.9));
  ctx.lineTo(W, by); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(190,230,245,.55)'; ctx.lineWidth = 3; ctx.beginPath();
  for (let x = 0; x <= W; x += 24) { const y = sy + 5 * Math.sin(x / 70 + t * 1.3) + 3 * Math.sin(x / 31 - t * 1.9); x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
  ctx.fillStyle = '#3a3126'; ctx.fillRect(0, by, W, H - by); ctx.fillStyle = '#4a3f30'; ctx.fillRect(0, by, W, 8);
}
// generic cased well: cement, casing, bore; o.tubing draws production tubing with fluid
function wellbore(ctx, x, y0, y1, o = {}) {
  const r = o.r ?? 30;
  ctx.fillStyle = C.cement; ctx.fillRect(x - r - 12, y0, 2 * r + 24, y1 - y0);
  ctx.fillStyle = '#4c5a67'; ctx.fillRect(x - r - 5, y0, 2 * r + 10, y1 - y0);
  ctx.fillStyle = o.fill ?? '#131a21'; ctx.fillRect(x - r, y0, 2 * r, y1 - y0 - 4);
  if (o.tubing) { const tr = r * .42; ctx.fillStyle = o.fluid ?? C.oil; ctx.fillRect(x - tr, y0 - (o.up ?? 0), 2 * tr, o.tubing - y0 + (o.up ?? 0)); ctx.fillStyle = '#93a4b3'; ctx.fillRect(x - tr - 4, y0 - (o.up ?? 0), 4, o.tubing - y0 + (o.up ?? 0)); ctx.fillRect(x + tr, y0 - (o.up ?? 0), 4, o.tubing - y0 + (o.up ?? 0)); }
}
function xtree(ctx, x, y, s = 1, o = {}) { // Christmas tree; y = ground level
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#8fa1b1'; rr(ctx, -26, -18, 52, 18, 3); ctx.fill();
  ctx.fillStyle = '#6f8091'; ctx.fillRect(-9, -110, 18, 94);
  for (const yy of [-44, -74]) { ctx.fillStyle = o.color ?? '#c0563b'; rr(ctx, -17, yy - 9, 34, 18, 4); ctx.fill(); }
  ctx.fillStyle = '#6f8091'; ctx.fillRect(-9, -98, 70, 14); ctx.fillStyle = o.color ?? '#c0563b'; rr(ctx, 26, -103, 20, 24, 4); ctx.fill();
  ctx.fillStyle = '#8fa1b1'; rr(ctx, -13, -122, 26, 14, 3); ctx.fill();
  ctx.restore();
}
// land drilling rig; (x,y) = ground under the well centre; o.block 0..1 travelling-block position
function rig(ctx, x, y, s, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineJoin = 'round';
  ctx.fillStyle = '#39434d'; ctx.fillRect(-150, -70, 300, 70); ctx.fillStyle = '#566574'; ctx.fillRect(-170, -84, 340, 16);
  ctx.strokeStyle = '#b4c1cc'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(-70, -84); ctx.lineTo(-22, -520); ctx.lineTo(22, -520); ctx.lineTo(70, -84); ctx.stroke();
  ctx.lineWidth = 3; for (let i = 0; i < 7; i++) { const y0 = -84 - i * 62, y1 = y0 - 62, w0 = 70 - i * 6.9, w1 = 70 - (i + 1) * 6.9; ctx.beginPath(); ctx.moveTo(-w0, y0); ctx.lineTo(w1, y1); ctx.moveTo(w0, y0); ctx.lineTo(-w1, y1); ctx.moveTo(-w1, y1); ctx.lineTo(w1, y1); ctx.stroke(); }
  ctx.fillStyle = '#e0a437'; rr(ctx, -30, -548, 60, 30, 5); ctx.fill();
  const by = lerp(-440, -200, o.block ?? .5 + .4 * Math.sin(t * .5));
  ctx.strokeStyle = '#cfd8df'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-8, -520); ctx.lineTo(-8, by); ctx.moveTo(8, -520); ctx.lineTo(8, by); ctx.stroke();
  ctx.fillStyle = '#e0a437'; rr(ctx, -20, by, 40, 46, 6); ctx.fill();
  ctx.fillStyle = C.steelL; ctx.fillRect(-4, by + 46, 8, -84 - by - 46 + 90);
  ctx.fillStyle = '#46627a'; rr(ctx, 180, -78, 150, 78, 8); ctx.fill(); ctx.fillStyle = '#5d7890'; rr(ctx, -330, -66, 130, 66, 8); ctx.fill();
  ctx.fillStyle = '#2a323a'; ctx.fillRect(-360, 0, 720, 10);
  ctx.restore();
}
function flame(ctx, x, y, s, t) {
  const f = 1 + .12 * Math.sin(t * 13) + .08 * Math.sin(t * 23 + 1);
  for (const [k, col] of [[1, '#ff7a2f'], [.66, '#ffb347'], [.36, '#fff0b8']]) {
    ctx.fillStyle = col; ctx.beginPath(); const h = 60 * s * k * f, w = 22 * s * k;
    ctx.moveTo(x, y - h); ctx.bezierCurveTo(x + w * 1.4, y - h * .45, x + w, y, x, y); ctx.bezierCurveTo(x - w, y, x - w * 1.4, y - h * .45, x, y - h); ctx.fill();
  }
}
// vertical column; x = centre, y = top. o: trays, tint (css), hot (temperature gradient), a
function tower(ctx, x, y, w, h, o = {}) {
  ctx.save(); ctx.globalAlpha *= o.a ?? 1;
  ctx.fillStyle = '#39434d'; ctx.fillRect(x - w * .36, y + h - 6, w * .72, 30);
  ctx.save(); rr(ctx, x - w / 2, y, w, h, w / 2); ctx.clip();
  if (o.hot) { const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#27506b'); g.addColorStop(.5, '#7a5a3c'); g.addColorStop(1, '#b3411f'); ctx.fillStyle = g; } else ctx.fillStyle = o.tint ?? '#1f2a34';
  ctx.fillRect(x - w / 2, y, w, h);
  if (o.trays) { ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 2; for (let i = 1; i < o.trays; i++) { const ty = y + h * i / o.trays, sd = i % 2 ? 1 : -1; ctx.beginPath(); ctx.moveTo(x - w / 2 + (sd > 0 ? 0 : w * .2), ty); ctx.lineTo(x + w / 2 - (sd > 0 ? w * .2 : 0), ty); ctx.stroke(); } }
  ctx.restore();
  ctx.strokeStyle = o.hl ? C.accent : '#93a4b3'; ctx.lineWidth = o.lw ?? 5; rr(ctx, x - w / 2, y, w, h, w / 2); ctx.stroke();
  if (o.name) txt(ctx, o.name, x, y + h + 48, { size: o.ns ?? 22, weight: 600, align: 'center', color: C.dim, lh: 1.15 });
  ctx.restore();
}
function sphereTank(ctx, x, y, r, col) { // y = ground
  ctx.strokeStyle = '#566574'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x - r * .6, y); ctx.lineTo(x - r * .5, y - r); ctx.moveTo(x + r * .6, y); ctx.lineTo(x + r * .5, y - r); ctx.stroke();
  const g = ctx.createRadialGradient(x - r * .3, y - r * 1.5, r * .1, x, y - r * 1.15, r); g.addColorStop(0, '#f4f7fa'); g.addColorStop(1, col ?? '#9fb0c0');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y - r * 1.15, r, 0, TAU); ctx.fill();
}
function furnace(ctx, x, y, w, h, t, o = {}) { // (x,y) = bottom-left
  ctx.fillStyle = '#566574'; ctx.fillRect(x + w * .36, y - h - 70, w * .28, 74);
  ctx.fillStyle = '#46627a'; rr(ctx, x, y - h, w, h, 8); ctx.fill();
  ctx.fillStyle = '#1a1210'; rr(ctx, x + w * .14, y - h * .62, w * .72, h * .5, 6); ctx.fill();
  for (let i = 0; i < 3; i++) flame(ctx, x + w * (.3 + i * .2), y - h * .14, .5 + .08 * i, t + i);
  if (o.name) txt(ctx, o.name, x + w / 2, y + 26, { size: 22, weight: 600, align: 'center', color: C.dim });
}
function pumpSym(ctx, x, y, r, t, o = {}) {
  ctx.fillStyle = '#0e151c'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.strokeStyle = o.color ?? '#93a4b3'; ctx.lineWidth = 4; ctx.stroke();
  ctx.save(); ctx.translate(x, y); ctx.rotate(t * (o.sp ?? 5)); ctx.lineWidth = 3; for (let i = 0; i < 3; i++) { ctx.rotate(TAU / 3); ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(r * .5, -r * .5, r * .78, 0); ctx.stroke(); } ctx.restore();
}
function compSym(ctx, x, y, s, t, o = {}) { // compressor: trapezoid narrowing to the right
  ctx.fillStyle = '#0e151c'; ctx.strokeStyle = o.color ?? C.gas; ctx.lineWidth = 4; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x - 34 * s, y - 30 * s); ctx.lineTo(x + 34 * s, y - 14 * s); ctx.lineTo(x + 34 * s, y + 14 * s); ctx.lineTo(x - 34 * s, y + 30 * s); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.save(); ctx.translate(x, y); ctx.rotate(t * 7); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-10 * s, 0); ctx.lineTo(10 * s, 0); ctx.moveTo(0, -10 * s); ctx.lineTo(0, 10 * s); ctx.stroke(); ctx.restore();
}
function hxSym(ctx, x, y, r, o = {}) {
  ctx.fillStyle = '#0e151c'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.strokeStyle = o.color ?? '#93a4b3'; ctx.lineWidth = 4; ctx.stroke();
  ctx.lineWidth = 3; ctx.strokeStyle = o.c2 ?? C.hot; ctx.beginPath(); ctx.moveTo(x - r, y); ctx.lineTo(x - r * .4, y); ctx.lineTo(x - r * .2, y - r * .5); ctx.lineTo(x + r * .2, y + r * .5); ctx.lineTo(x + r * .4, y); ctx.lineTo(x + r, y); ctx.stroke();
}
// ships; (x,y) = waterline at midship
function ship(ctx, x, y, s, kind, t = 0) {
  ctx.save(); ctx.translate(x, y + 3 * Math.sin(t * 1.1 + x * .01)); ctx.rotate(.008 * Math.sin(t * .9 + 1)); ctx.scale(s, s);
  const L = kind === 'seismic' ? 150 : 250;
  if (kind === 'lng') for (let i = 0; i < 4; i++) { ctx.fillStyle = '#e9eef3'; ctx.beginPath(); ctx.arc(-150 + i * 92, -34, 44, Math.PI, 0); ctx.fill(); ctx.fillStyle = '#c3ccd5'; ctx.fillRect(-194 + i * 92, -34, 88, 8); }
  if (kind === 'tanker') { ctx.fillStyle = '#7d5a2a'; ctx.fillRect(-190, -34, 330, 10); ctx.strokeStyle = '#b4c1cc'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-180, -40); ctx.lineTo(130, -40); ctx.stroke(); for (let i = 0; i < 5; i++) { ctx.fillStyle = '#93a4b3'; ctx.fillRect(-160 + i * 66, -52, 8, 18); } }
  if (kind === 'fpso') { for (let i = 0; i < 5; i++) { ctx.fillStyle = ['#5d7890', '#46627a', '#6f8091'][i % 3]; rr(ctx, -170 + i * 62, -84 - (i % 2) * 22, 54, 60 + (i % 2) * 22, 5); ctx.fill(); } ctx.strokeStyle = '#b4c1cc'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-190, -30); ctx.lineTo(-290, -150); ctx.stroke(); flame(ctx, -292, -150, .7, t); ctx.fillStyle = '#e0a437'; rr(ctx, 196, -70, 30, 46, 5); ctx.fill(); }
  ctx.fillStyle = kind === 'lng' ? '#a33b2c' : kind === 'fpso' ? '#b3411f' : '#263440';
  ctx.beginPath(); ctx.moveTo(-L, -30); ctx.lineTo(L + 24, -30); ctx.lineTo(L - 18, 34); ctx.lineTo(-L + 16, 34); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(-L + 10, 6, 2 * L - 14, 6);
  ctx.fillStyle = '#e9eef3'; rr(ctx, kind === 'fpso' ? -L + 8 : L - 96, -92, 62, 62, 5); ctx.fill(); ctx.fillStyle = '#263440'; ctx.fillRect((kind === 'fpso' ? -L + 8 : L - 96) + 8, -82, 46, 10);
  if (kind !== 'fpso') { ctx.fillStyle = '#566574'; ctx.fillRect(L - 74, -122, 16, 30); }
  ctx.restore();
}
function truck(ctx, x, y, s, col) { // (x,y) = road under the middle
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = col ?? '#c9d3dc'; rr(ctx, -110, -74, 150, 54, 26); ctx.fill(); ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(-104, -52, 138, 6);
  ctx.fillStyle = '#c0563b'; rr(ctx, 48, -68, 54, 52, 8); ctx.fill(); ctx.fillStyle = '#bfe3f2'; rr(ctx, 70, -60, 26, 20, 4); ctx.fill();
  ctx.fillStyle = '#39434d'; ctx.fillRect(-112, -22, 216, 8);
  for (const wx of [-84, -52, 0, 78]) { ctx.fillStyle = '#12181e'; ctx.beginPath(); ctx.arc(wx, -8, 13, 0, TAU); ctx.fill(); ctx.fillStyle = '#7d8c99'; ctx.beginPath(); ctx.arc(wx, -8, 5, 0, TAU); ctx.fill(); }
  ctx.restore();
}
function railcar(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#39434d'; rr(ctx, -90, -70, 180, 52, 26); ctx.fill(); ctx.fillStyle = '#566574'; ctx.fillRect(-14, -82, 28, 14); ctx.fillStyle = '#263440'; ctx.fillRect(-100, -20, 200, 8);
  for (const wx of [-70, -44, 44, 70]) { ctx.fillStyle = '#12181e'; ctx.beginPath(); ctx.arc(wx, -6, 11, 0, TAU); ctx.fill(); }
  ctx.restore();
}
// hydrocarbon chain: n carbon atoms in a zig-zag; returns the end x
function chainMol(ctx, x, y, n, o = {}) {
  const d = o.d ?? 26, r = o.r ?? 9, col = o.color ?? C.oil;
  ctx.save(); ctx.globalAlpha *= o.a ?? 1; ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 3;
  ctx.beginPath(); for (let i = 0; i < n; i++) { const px = x + i * d, py = y + (i % 2 ? -d * .34 : d * .34); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke();
  for (let i = 0; i < n; i++) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x + i * d, y + (i % 2 ? -d * .34 : d * .34), r, 0, TAU); ctx.fill(); }
  ctx.restore(); return x + (n - 1) * d;
}
// simple pictograms centred on (x,y), unit size s
function icon(ctx, kind, x, y, s, col) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = col ?? C.ink; ctx.strokeStyle = col ?? C.ink; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  if (kind === 'house') { ctx.beginPath(); ctx.moveTo(-34, 0); ctx.lineTo(0, -34); ctx.lineTo(34, 0); ctx.closePath(); ctx.fill(); ctx.fillRect(-25, 0, 50, 34); ctx.fillStyle = '#0b1016'; ctx.fillRect(-7, 12, 14, 22); }
  if (kind === 'factory') { ctx.fillRect(-38, -4, 76, 38); ctx.beginPath(); ctx.moveTo(-38, -4); ctx.lineTo(-38, -24); ctx.lineTo(-14, -4); ctx.lineTo(-14, -24); ctx.lineTo(10, -4); ctx.closePath(); ctx.fill(); ctx.fillRect(18, -42, 12, 40); }
  if (kind === 'power') { ctx.beginPath(); ctx.moveTo(-34, 34); ctx.lineTo(-22, -30); ctx.lineTo(-2, -30); ctx.lineTo(10, 34); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#0b1016'; ctx.beginPath(); ctx.moveTo(-8, -14); ctx.lineTo(-20, 6); ctx.lineTo(-11, 6); ctx.lineTo(-15, 24); ctx.lineTo(-1, 0); ctx.lineTo(-10, 0); ctx.closePath(); ctx.fill(); ctx.fillStyle = col ?? C.ink; ctx.fillRect(18, -8, 20, 42); }
  if (kind === 'plane') { ctx.beginPath(); ctx.moveTo(-40, 4); ctx.lineTo(30, -4); ctx.quadraticCurveTo(44, -2, 30, 6); ctx.lineTo(-40, 10); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(-6, 2); ctx.lineTo(-24, -30); ctx.lineTo(-12, -30); ctx.lineTo(14, 0); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(-6, 6); ctx.lineTo(-24, 34); ctx.lineTo(-12, 34); ctx.lineTo(14, 6); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(-40, 4); ctx.lineTo(-48, -14); ctx.lineTo(-40, -14); ctx.lineTo(-30, 4); ctx.closePath(); ctx.fill(); }
  if (kind === 'station') { ctx.fillRect(-26, -30, 36, 64); ctx.fillStyle = '#0b1016'; ctx.fillRect(-19, -22, 22, 18); ctx.strokeStyle = col ?? C.ink; ctx.beginPath(); ctx.moveTo(10, -6); ctx.lineTo(26, -6); ctx.lineTo(26, 22); ctx.quadraticCurveTo(26, 30, 34, 30); ctx.lineTo(34, -14); ctx.stroke(); }
  if (kind === 'bottle') { rr(ctx, -16, -12, 32, 46, 8); ctx.fill(); ctx.fillRect(-7, -34, 14, 24); }
  if (kind === 'drop') { ctx.beginPath(); ctx.moveTo(0, -36); ctx.bezierCurveTo(28, -4, 24, 30, 0, 30); ctx.bezierCurveTo(-24, 30, -28, -4, 0, -36); ctx.fill(); }
  if (kind === 'road') { ctx.beginPath(); ctx.moveTo(-36, 6); ctx.lineTo(-22, -12); ctx.lineTo(20, -12); ctx.lineTo(36, 6); ctx.lineTo(36, 20); ctx.lineTo(-36, 20); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#0b1016'; ctx.beginPath(); ctx.arc(-18, 22, 9, 0, TAU); ctx.arc(18, 22, 9, 0, TAU); ctx.fill(); }
  ctx.restore();
}
function node(ctx, x, y, s, o = {}) { // centred rounded box with text
  const w = o.w ?? 190, h = o.h ?? 70, a = o.a ?? 1; if (a <= .01) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(.85 + .15 * a, .85 + .15 * a);
  rr(ctx, -w / 2, -h / 2, w, h, o.r ?? 14); ctx.fillStyle = o.fill ?? '#16212c'; ctx.fill(); ctx.strokeStyle = o.color ?? '#93a4b3'; ctx.lineWidth = o.hl ? 5 : 3; ctx.stroke();
  txt(ctx, s, 0, s.includes('\n') ? -(o.size ?? 26) * .6 : 1, { size: o.size ?? 26, weight: 600, align: 'center', lh: 1.2, color: o.tc ?? C.ink });
  ctx.restore();
}
// data link: dashed, blue, with moving dashes (information, not fluid)
function dataLine(ctx, pts, t, o = {}) { backArrow(ctx, pts, t, Object.assign({ color: C.data, w: 4 }, o)); }
