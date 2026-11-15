// Shared drawing parts: pumpjack well icon, pipes, vessels, meters, tables, allocation arrows.

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
function badge(ctx, x, y, key, o = {}) {
  const r = o.r ?? 26;
  ctx.save(); ctx.globalAlpha *= o.a ?? 1;
  ctx.fillStyle = C[key]; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  txt(ctx, key, x, y + 1, { size: r * 1.15, weight: 700, align: 'center', color: '#0b1016' });
  ctx.restore();
}
// pumpjack well icon; (x,y) is the ground point under the post. Returns the flowline start.
function wellIcon(ctx, x, y, key, T, o = {}) {
  const s = o.s ?? .26, off = { A: 0, B: 2.1, C: 4.0 }[key] ?? 0, run = o.run ?? 1;
  ctx.save(); ctx.globalAlpha *= o.a ?? 1; ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#2a323a'; ctx.fillRect(-460, 0, 760, 14);
  drawPumpjack(ctx, run ? TH(T) + off : 2.2 + off, { flowLen: 40 });
  ctx.restore();
  badge(ctx, x - 150 * s - 34, y - 62 * s - 40, key, { a: o.a, r: o.br ?? 24 });
  return [x + 285 * s, y - 40 * s];
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
        if (d.badge) badge(ctx, cx + 34, ry + rh / 2, d.badge, { r: 21, a: ca });
        else txt(ctx, d.s, c.al === 'l' ? cx + 8 : c.al === 'c' ? cx + c.w / 2 : cx + c.w - 8, ry + rh / 2 + 1, { size: d.size ?? size, weight: d.weight ?? 600, mono: d.mono ?? (c.al !== 'l'), color: d.color ?? C.ink, align: c.al === 'l' ? 'left' : c.al === 'c' ? 'center' : 'right', a: ca });
      }
      cx += c.w;
    });
  });
  ctx.restore();
}
// fraction of a cue: time at k (0..1) between its start and end
const at = (s, i, k) => s.c[i] + (s.e[i] - s.c[i]) * k;

// ---------- The field: wells A, B, C -> manifold -> separator -> tank / meters ----------
const PFD = {
  wells: { A: [250, 255], B: [250, 485], C: [250, 715] },
  manX: 640, sep: [800, 395, 270, 150], tank: [1290, 380, 170, 190],
  mG: [1200, 250], mO: [1590, 475], mW: [1200, 690],
};
PFD.out = k => [PFD.wells[k][0] + 74, PFD.wells[k][1] - 10];
PFD.fl = k => { const o = PFD.out(k); return [o, [PFD.manX, o[1]], [PFD.manX, 470]]; };
PFD.hdr = [[PFD.manX, 470], [800, 470]];
PFD.gas = [[935, 398], [935, 250], [1720, 250]];
PFD.oil1 = [[1068, 470], [1290, 470]]; PFD.oil2 = [[1460, 475], [1790, 475]];
PFD.water = [[935, 542], [935, 690], [1620, 690]];
// o: a, flow (0..1), run:{A,B,C}, meters (alpha), val:{g,o,w}, level, hl:{...}, neutral (dots after manifold lose colour)
function drawPFD(ctx, T, o = {}) {
  const a = o.a ?? 1; if (a <= .01) return;
  const fl = o.flow ?? 1, run = Object.assign({ A: 1, B: 1, C: 1 }, o.run || {}), hl = o.hl || {}, S = PFD.sep, K = PFD.tank;
  ctx.save(); ctx.globalAlpha *= a;
  for (const k of 'ABC') pipe(ctx, PFD.fl(k), { color: hl[k] ? C[k] : '#55667a' });
  pipe(ctx, [[PFD.manX, 225], [PFD.manX, 735]], { w: 22, color: hl.man ? C.accent : '#6f8091', cap: 'butt' });
  pipe(ctx, PFD.hdr, { w: 16 }); pipe(ctx, PFD.gas); pipe(ctx, PFD.oil1); pipe(ctx, PFD.oil2); pipe(ctx, PFD.water);
  if (fl > 0) {
    for (const k of 'ABC') if (run[k]) dots(ctx, PFD.fl(k), T, { a: fl, color: C[k], speed: 70, gap: 34, r: 6 });
    const mixc = o.neutral ? [C.mix] : [C.A, C.B, C.A, C.C, C.A, C.B].filter(c => (c === C.A && run.A) || (c === C.B && run.B) || (c === C.C && run.C));
    if (mixc.length) dots(ctx, PFD.hdr, T, { a: fl, colors: mixc, speed: 80, gap: 22, r: 6 });
    dots(ctx, PFD.gas, T, { a: fl, color: C.gas, speed: 110, gap: 40, r: 5 });
    dots(ctx, PFD.oil1, T, { a: fl, color: C.oil, speed: 70, gap: 32, r: 6 }); dots(ctx, PFD.oil2, T, { a: fl * (o.exportFlow ?? 1), color: C.oil, speed: 70, gap: 32, r: 6 });
    dots(ctx, PFD.water, T, { a: fl, color: C.water, speed: 70, gap: 32, r: 6 });
  }
  vessel(ctx, S[0], S[1], S[2], S[3], { t: fl > 0 ? T : null, hl: hl.sep });
  tank(ctx, K[0], K[1], K[2], K[3], o.level ?? .55, { hl: hl.tank });
  for (const k of 'ABC') wellIcon(ctx, PFD.wells[k][0], PFD.wells[k][1], k, T, { run: run[k] });
  const ma = o.meters ?? 1, v = o.val || {};
  if (ma > 0) {
    meter(ctx, PFD.mG[0], PFD.mG[1], { a: ma, t: T, color: C.gas, label: 'Gas meter', value: v.g, hl: hl.mG });
    meter(ctx, PFD.mO[0], PFD.mO[1], { a: ma, t: T, color: C.oil, label: 'Oil export meter', value: v.o, hl: hl.mO });
    meter(ctx, PFD.mW[0], PFD.mW[1], { a: ma, t: T, color: C.water, label: 'Water meter', value: v.w, hl: hl.mW });
  }
  const la = o.labels ?? 1;
  if (la > 0) {
    txt(ctx, 'Manifold', PFD.manX, 198, { size: 22, weight: 600, align: 'center', color: C.dim, a: la });
    txt(ctx, 'Separator', S[0] + S[2] / 2, S[1] + S[3] + 52, { size: 22, weight: 600, align: 'center', color: C.dim, a: la });
    txt(ctx, 'Storage tank', K[0] + K[2] / 2, K[1] + K[3] + 28, { size: 22, weight: 600, align: 'center', color: C.dim, a: la });
    txt(ctx, 'sales · fuel · flare', 1730, 250, { size: 22, color: C.dim, a: la }); txt(ctx, 'export', 1800, 475, { size: 22, color: C.dim, a: la }); txt(ctx, 'disposal · injection', 1630, 690, { size: 22, color: C.dim, a: la });
  }
  ctx.restore();
}
