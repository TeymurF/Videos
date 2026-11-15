// Shared parts: pumpjack, downhole pump, cross-section "world".

// ---------- Pumpjack (local units, ground y=0, wellhead x=230) ----------
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

// ---------- Downhole pump (vertical section) ----------
// o: x (axis), y (barrel top), w (inner width), h (height), p (0..1 plunger, 0 = bottom),
//    sv, tv (0..1 valve opening), t, up, dn (flow activity), gas (gas fraction in chamber 0..1),
//    tint (-1..1 chamber pressure), fluid (color), al:{cyl,pl,sv,tv} part alphas, hl
function pumpGeom(o) {
  const w = o.w, h = o.h, y = o.y, svH = w * .95, pl = h * .34, gapMin = w * .12, top = w * .25;
  const stroke = h - svH - pl - gapMin - top, yb = y + h - svH - gapMin - o.p * stroke;
  return { svH, pl, stroke, yb, yt: yb - pl, seatY: y + h - w * .3, chTop: yb, chBot: y + h - svH + w * .55, yBot: y + h };
}
function drawBallValve(ctx, x, ySeatTop, w, open, o = {}) {
  // seat: two blocks with a port; ball on top; cage
  const hw = w / 2, hole = w * .17, r = w * .21, lift = w * .26 * open, sh = w * .2;
  ctx.save(); ctx.globalAlpha *= o.a ?? 1;
  ctx.fillStyle = o.seat ?? '#6c7c8b';
  ctx.fillRect(x - hw, ySeatTop, hw - hole, sh); ctx.fillRect(x + hole, ySeatTop, hw - hole, sh);
  // cage
  ctx.strokeStyle = o.cage ?? '#8fa1b1'; ctx.lineWidth = Math.max(2, w * .035);
  const cy = ySeatTop - r * 2 - w * .3;
  ctx.beginPath(); ctx.moveTo(x - r * 1.25, ySeatTop); ctx.lineTo(x - r * 1.25, cy + r * .5); ctx.quadraticCurveTo(x - r * 1.25, cy, x - r * .5, cy);
  ctx.moveTo(x + r * 1.25, ySeatTop); ctx.lineTo(x + r * 1.25, cy + r * .5); ctx.quadraticCurveTo(x + r * 1.25, cy, x + r * .5, cy); ctx.stroke();
  // ball
  const by = ySeatTop - r * .82 - lift;
  const g = ctx.createRadialGradient(x - r * .35, by - r * .35, r * .1, x, by, r);
  const bc = open > .5 ? C.ok : C.bad;
  g.addColorStop(0, '#fff'); g.addColorStop(.35, o.plain ? '#cfd8df' : bc); g.addColorStop(1, o.plain ? '#6c7c8b' : '#3a2a2a');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, by, r, 0, TAU); ctx.fill();
  ctx.restore();
  return { by, r, cy };
}
function drawPump(ctx, o) {
  const { x, y, w, h, t = 0 } = o, hw = w / 2, wall = o.wall ?? w * .14, G = pumpGeom(o);
  const A = Object.assign({ cyl: 1, pl: 1, sv: 1, tv: 1, fl: 1 }, o.al || {});
  const fluid = o.fluid ?? C.oil, tail = o.tail ?? w * .5, up = o.up ?? 0, dn = o.dn ?? 0;
  ctx.save();
  // fluid
  ctx.globalAlpha = A.fl;
  ctx.fillStyle = fluid; ctx.fillRect(x - hw, y - (o.over ?? 0), w, h + (o.over ?? 0));
  ctx.fillStyle = o.intake ?? C.oilD; ctx.fillRect(x - hw, G.seatY + w * .2, w, G.yBot - G.seatY - w * .2 + tail);
  // chamber: pressure tint
  const chH = G.seatY - G.chTop;
  if (o.tint != null) { ctx.fillStyle = o.tint > 0 ? `rgba(255,90,50,${.42 * o.tint})` : `rgba(60,150,255,${-.5 * o.tint})`; ctx.fillRect(x - hw, G.chTop, w, chH); }
  if (o.chHL) { ctx.fillStyle = `rgba(255,255,255,${.35 * o.chHL})`; ctx.fillRect(x - hw, G.chTop, w, chH); }
  // gas in the chamber
  if (o.gas > 0) {
    const gh = chH * clamp(o.gas);
    ctx.fillStyle = '#26323b'; ctx.fillRect(x - hw, G.chTop, w, gh);
    const R = rng(77); ctx.fillStyle = C.gas;
    for (let i = 0; i < 26; i++) { const bx = x - hw + R() * w, by = G.chTop + R() * gh, r = w * (.02 + R() * .035); ctx.globalAlpha = A.fl * .55; ctx.beginPath(); ctx.arc(bx + Math.sin(t * 2 + i) * 2, by, r, 0, TAU); ctx.fill(); }
    ctx.globalAlpha = A.fl;
  }
  // flows
  if (up > 0.01) {
    chev(ctx, x, G.yBot + tail - 4, G.seatY + w * .25, t, { a: up * A.fl, s: w * .07, gap: w * .22, speed: w * .5 });
    chev(ctx, x - hw * .62, G.seatY - w * .1, G.chTop + 6, t, { a: up * A.fl, s: w * .06, gap: w * .22, speed: w * .45 });
    chev(ctx, x + hw * .62, G.seatY - w * .1, G.chTop + 6, t, { a: up * A.fl, s: w * .06, gap: w * .22, speed: w * .45 });
    chev(ctx, x - hw * .55, G.yt - w * .25, y - (o.over ?? 0) + 4, t, { a: up * A.fl, s: w * .06, gap: w * .22, speed: w * .45 });
    chev(ctx, x + hw * .55, G.yt - w * .25, y - (o.over ?? 0) + 4, t, { a: up * A.fl, s: w * .06, gap: w * .22, speed: w * .45 });
  }
  ctx.globalAlpha = 1;
  // barrel walls
  ctx.globalAlpha = A.cyl;
  const cg = ctx.createLinearGradient(x - hw - wall, 0, x - hw, 0); cg.addColorStop(0, '#5d6c7a'); cg.addColorStop(.5, '#a7b6c3'); cg.addColorStop(1, '#6a7987');
  ctx.fillStyle = o.hl === 'cyl' ? C.accent : cg; ctx.fillRect(x - hw - wall, y - (o.over ?? 0), wall, h + (o.over ?? 0) + tail);
  ctx.save(); ctx.translate(2 * x, 0); ctx.scale(-1, 1); ctx.fillRect(x - hw - wall, y - (o.over ?? 0), wall, h + (o.over ?? 0) + tail); ctx.restore();
  // standing valve
  ctx.globalAlpha = 1;
  const SV = drawBallValve(ctx, x, G.seatY, w, o.sv ?? 0, { a: A.sv, plain: o.plain });
  // plunger
  ctx.globalAlpha = A.pl;
  const pw = w * .2, pg = ctx.createLinearGradient(x - hw, 0, x - hw + pw, 0); pg.addColorStop(0, '#c9d3dc'); pg.addColorStop(1, '#8696a5');
  ctx.fillStyle = o.hl === 'pl' ? C.accent : pg;
  ctx.fillRect(x - hw + 1.5, G.yt, pw, G.pl); ctx.fillRect(x + hw - pw - 1.5, G.yt, pw, G.pl);
  // plunger top: cage connecting to the rod (with windows)
  ctx.beginPath(); ctx.moveTo(x - hw + 1.5, G.yt); ctx.lineTo(x - hw + pw, G.yt); ctx.lineTo(x - w * .05, G.yt - w * .38); ctx.lineTo(x - w * .09, G.yt - w * .38); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x + hw - 1.5, G.yt); ctx.lineTo(x + hw - pw, G.yt); ctx.lineTo(x + w * .05, G.yt - w * .38); ctx.lineTo(x + w * .09, G.yt - w * .38); ctx.closePath(); ctx.fill();
  // rod
  const rw = o.rod ?? w * .14;
  ctx.fillStyle = C.steelL; ctx.fillRect(x - rw / 2, o.rodTop ?? (y - (o.over ?? 0)), rw, G.yt - w * .3 - (o.rodTop ?? (y - (o.over ?? 0))));
  // traveling valve (at the plunger bottom)
  ctx.globalAlpha = 1;
  const tvSeat = G.yb - w * .2;
  ctx.save(); ctx.beginPath(); ctx.rect(x - hw + pw + 1, G.yt, w - 2 * pw - 2, G.pl); ctx.clip();
  const TV = drawBallValve(ctx, x, tvSeat, w - 2 * pw, o.tv ?? 0, { a: A.tv * A.pl, plain: o.plain });
  ctx.restore();
  if (dn > 0.01) {
    chev(ctx, x, G.yb + w * .5, G.yb - w * .05, t, { a: dn, s: w * .06, gap: w * .2, speed: w * .5 });
    chev(ctx, x - w * .2, tvSeat - w * .12, G.yt + 4, t, { a: dn, s: w * .045, gap: w * .2, speed: w * .5 });
    chev(ctx, x + w * .2, tvSeat - w * .12, G.yt + 4, t, { a: dn, s: w * .045, gap: w * .2, speed: w * .5 });
    chev(ctx, x - hw * .5, G.yt - w * .08, G.yt - w * .7, t, { a: dn, s: w * .05, gap: w * .2, speed: w * .5 });
    chev(ctx, x + hw * .5, G.yt - w * .08, G.yt - w * .7, t, { a: dn, s: w * .05, gap: w * .2, speed: w * .5 });
  }
  ctx.restore();
  return Object.assign(G, { SV, TV, tvSeat });
}

// ---------- "World": surface + well cross-section ----------
const WX = PJ.A + 3; // well axis
const WORLD = { fmTop: 1250, fmBot: 1450, pumpY: 1040, pumpH: 190, bottom: 1480, perfs: [1290, 1330, 1370, 1410] };
function camOn(ctx, cam) { ctx.translate(960, cam.sy ?? 500); ctx.scale(cam.z, cam.z); ctx.translate(-cam.cx, -cam.cy); }
const camP = (cam, x, y) => [(x - cam.cx) * cam.z + 960, (y - cam.cy) * cam.z + (cam.sy ?? 500)];
const camMix = (a, b, k) => ({ cx: lerp(a.cx, b.cx, k), cy: lerp(a.cy, b.cy, k), z: Math.exp(lerp(Math.log(a.z), Math.log(b.z), k)) });
const camKf = (t, arr) => { // [[time, cam, duration], ...] eased transitions starting at each key
  let c = arr[0][1];
  for (let i = 1; i < arr.length; i++) c = camMix(c, arr[i][1], pr(t, arr[i][0], arr[i][2] ?? 2.2));
  return c;
};
const STRATA = [[0, '#40342a'], [70, '#2e2822'], [430, '#262b30'], [820, '#2d2620'], [1250, '#6b5230'], [1450, '#20242a'], [2200, '#20242a']];
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
const SPECK = (() => { const R = rng(5), a = []; for (let i = 0; i < 900; i++) a.push([-1700 + R() * 3900, 1258 + R() * 184, 1.5 + R() * 3.5, R()]); return a; })();
function drawGround(ctx, x0, x1, o = {}) {
  for (let i = 0; i < STRATA.length - 1; i++) {
    const [y, c] = STRATA[i], y2 = STRATA[i + 1][0];
    ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x0, y2 + 20);
    ctx.lineTo(x0, y);
    for (let x = x0; x <= x1; x += 80) ctx.lineTo(x, y + (i ? 9 * Math.sin(x / 170 + i * 1.7) : 0));
    ctx.lineTo(x1, y2 + 20); ctx.closePath(); ctx.fill();
  }
  for (const s of SPECK) { ctx.fillStyle = s[3] > .5 ? 'rgba(233,166,59,.55)' : 'rgba(40,28,14,.5)'; ctx.beginPath(); ctx.arc(s[0], s[1], s[2], 0, TAU); ctx.fill(); }
  ctx.fillStyle = '#4b3d30'; ctx.fillRect(x0, 0, x1 - x0, 7);
}
// well cross-section in world coordinates
function drawWell(ctx, th, t, o = {}) {
  const X = WX, Wd = WORLD, level = o.level ?? 780, g = pjGeom(th), s = pjS(th), dir = pjDir(th);
  const up = dir > 0 ? 1 : 0;
  ctx.save();
  // cement, casing
  ctx.fillStyle = o.hl === 'cement' ? C.accent : C.cement; ctx.fillRect(X - 66, 6, 132, Wd.bottom + 14);
  ctx.fillStyle = o.hl === 'casing' ? C.accent : '#4c5a67'; ctx.fillRect(X - 53, 0, 106, Wd.bottom + 4);
  ctx.fillStyle = '#131a21'; ctx.fillRect(X - 46, 0, 92, Wd.bottom - 2);
  // liquid in the annulus
  const lg = ctx.createLinearGradient(0, level, 0, Wd.bottom); lg.addColorStop(0, '#8a5a1c'); lg.addColorStop(1, '#6a4313');
  ctx.fillStyle = lg; ctx.fillRect(X - 46, level, 92, Wd.bottom - 2 - level);
  // perforations
  for (const py of Wd.perfs) for (const sd of [-1, 1]) {
    ctx.fillStyle = o.hl === 'perf' ? C.accent : C.oil; ctx.beginPath();
    ctx.moveTo(X + sd * 44, py - 7); ctx.lineTo(X + sd * 128, py); ctx.lineTo(X + sd * 44, py + 7); ctx.closePath(); ctx.fill();
  }
  // tubing
  const tb = Wd.pumpY + Wd.pumpH;
  ctx.fillStyle = C.oil; ctx.fillRect(X - 20, -16, 40, Wd.pumpY + 16);
  ctx.fillStyle = o.hl === 'tubing' ? C.accent : '#93a4b3'; ctx.fillRect(X - 26, -16, 6, Wd.pumpY + 16); ctx.fillRect(X + 20, -16, 6, Wd.pumpY + 16);
  // pump
  const P = drawPump(ctx, { x: X, y: Wd.pumpY, w: 40, h: Wd.pumpH, wall: 6, p: s, sv: up, tv: 1 - up, t, up: o.flow ? up : 0, dn: o.flow ? 1 - up : 0, rodTop: Wd.pumpY, tail: 26, rod: 0.01, hl: o.hl === 'pump' ? 'cyl' : '' });
  // rods with couplings
  ctx.fillStyle = o.hl === 'rods' ? C.accent : C.steelL; ctx.fillRect(X - 3.5, g.yc, 7, P.yt - 10 - g.yc);
  const off = (1 - s) * 60;
  for (let y = 60; y < Wd.pumpY - 40; y += 140) ctx.fillRect(X - 6, y + off, 12, 16);
  if (o.flow) { chev(ctx, X - 12, Wd.pumpY - 10, 0, t, { a: up * .9, s: 4, gap: 26, speed: 50, lw: 2 }); chev(ctx, X + 12, Wd.pumpY - 10, 0, t, { a: up * .9, s: 4, gap: 26, speed: 50, lw: 2 }); }
  ctx.restore();
  return P;
}
function drawWorld(ctx, cam, T, o = {}) {
  const th = o.th ?? TH(T);
  ctx.save(); camOn(ctx, cam);
  const x0 = cam.cx - 1100 / cam.z, x1 = cam.cx + 1100 / cam.z;
  drawSky(ctx, x0, x1, cam.cy - 600 / cam.z - 50);
  drawGround(ctx, x0, x1);
  const P = drawWell(ctx, th, T, o);
  drawPumpjack(ctx, th, { hl: o.pjhl, flowLen: 1500 });
  ctx.restore();
  return P;
}
