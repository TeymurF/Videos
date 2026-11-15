// Scenes 6-9: fluid level and gas, pump anatomy, surface drive, pump cycle.

// ---------- 6. Fluid level and gas ----------
const BUB = (() => { const R = rng(21), a = []; for (let i = 0; i < 110; i++) a.push({ sd: R() < .5 ? -1 : 1, x: 66 + R() * 76, sp: 45 + R() * 50, ph: R(), w: R() * TAU }); return a; })();
SCENES.push({
  id: 'level', title: 'Fluid level and gas', amb: 'under',
  cues: [
    'The pump needs fluid arriving at sufficient pressure. After the well is shut in, a static fluid level is established.',
    'While the pump runs, the level drops to the dynamic level, until inflow from the reservoir equals the rate of withdrawal.',
    'As pressure falls, dissolved gas comes out of the oil. Bubbles are lighter than the liquid and tend to rise.',
    'A gas anchor makes the mixture change direction: liquid goes to the pump intake, while gas rises up the annulus.',
    'The less gas enters the pump, the better it fills with liquid.',
  ],
  draw(ctx, t, c, s) {
    const X = 700, x0 = 100, x1 = 1300, y0 = 120, y1 = 910, ys = 215, yd = 405;
    const lvl = lerp(ys, yd, pr(t, c[1] + .8, 5)), run = lin(t, c[1], 1), th = TH(GT), up = pjDir(th) > 0 ? 1 : 0, aG = lin(t, c[2] + .3, 1.5);
    ctx.save(); rr(ctx, x0, y0, x1 - x0, y1 - y0, 20); ctx.clip();
    ctx.fillStyle = '#262b30'; ctx.fillRect(x0, y0, 1200, 600); ctx.fillStyle = '#6b5230'; ctx.fillRect(x0, 705, 1200, 160); ctx.fillStyle = '#20242a'; ctx.fillRect(x0, 865, 1200, 60);
    const R = rng(8); for (let i = 0; i < 260; i++) { ctx.fillStyle = R() > .5 ? 'rgba(233,166,59,.5)' : 'rgba(40,28,14,.45)'; ctx.beginPath(); ctx.arc(x0 + R() * 1200, 710 + R() * 150, 2 + R() * 4, 0, TAU); ctx.fill(); }
    ctx.fillStyle = C.cement; ctx.fillRect(X - 184, y0, 368, 780); ctx.fillStyle = '#4c5a67'; ctx.fillRect(X - 164, y0, 328, 772);
    ctx.fillStyle = '#131a21'; ctx.fillRect(X - 150, y0, 300, 762);
    const lg = ctx.createLinearGradient(0, lvl, 0, 880); lg.addColorStop(0, '#9a651f'); lg.addColorStop(1, '#6a4313');
    ctx.fillStyle = lg; ctx.fillRect(X - 150, lvl, 300, 882 - lvl);
    for (const py of [740, 790, 840]) for (const sd of [-1, 1]) { ctx.fillStyle = C.oil; ctx.beginPath(); ctx.moveTo(X + sd * 148, py - 10); ctx.lineTo(X + sd * 290, py); ctx.lineTo(X + sd * 148, py + 10); ctx.closePath(); ctx.fill(); }
    // bubbles
    if (aG > 0) for (const b of BUB) {
      const span = 870 - lvl, u = (b.ph + t * b.sp / span) % 1, y = 870 - u * span;
      const x = X + b.sd * (y > 780 ? lerp(b.x, 20 + b.x * .8, (y - 780) / 90) : b.x) + Math.sin(t * 2 + b.w) * 4;
      ctx.globalAlpha = aG * Math.min(1, u * 10, (1 - u) * 12) * .9; ctx.fillStyle = C.gas; ctx.beginPath(); ctx.arc(x, y, 3 + 6 * u, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (aG > 0) { const Rf = rng(2); for (let i = 0; i < 40; i++) { const fx = X - 148 + Rf() * 296; if (Math.abs(fx - X) < 58) continue; ctx.globalAlpha = aG * .7; ctx.fillStyle = C.gas; ctx.beginPath(); ctx.arc(fx, lvl + Math.sin(t * 3 + i) * 2, 3 + Rf() * 5, 0, TAU); ctx.fill(); } ctx.globalAlpha = 1; }
    // tubing and pump
    ctx.fillStyle = C.oil; ctx.fillRect(X - 46, y0, 92, 470 - y0);
    ctx.fillStyle = '#93a4b3'; ctx.fillRect(X - 56, y0, 10, 470 - y0); ctx.fillRect(X + 46, y0, 10, 470 - y0);
    // gas anchor: outer tube with ports + inner dip tube
    const hlA = t > c[3] + .5 && t < c[3] + 4;
    ctx.fillStyle = '#7a4d16'; ctx.fillRect(X - 46, 650, 92, 122);
    ctx.fillStyle = hlA ? C.accent : '#93a4b3';
    ctx.fillRect(X - 56, 650, 10, 14); ctx.fillRect(X + 46, 650, 10, 14); ctx.fillRect(X - 56, 694, 10, 88); ctx.fillRect(X + 46, 694, 10, 88); ctx.fillRect(X - 56, 772, 112, 10);
    ctx.fillStyle = hlA ? C.accent : '#b9c6d1'; ctx.fillRect(X - 20, 650, 6, 104); ctx.fillRect(X + 14, 650, 6, 104);
    drawPump(ctx, { x: X, y: 470, w: 92, h: 180, wall: 10, p: run ? pjS(th) : .25, sv: run * up, tv: run * (1 - up), t, up: run * up, dn: run * (1 - up), rodTop: y0, tail: 0 });
    // liquid path through the anchor
    const aL = lin(t, c[3] + 1.5, 1);
    if (aL > 0) for (const sd of [-1, 1]) dots(ctx, [[X + sd * 270, 790], [X + sd * 130, 790], [X + sd * 100, 730], [X + sd * 100, 679], [X + sd * 33, 679], [X + sd * 33, 756], [X, 764], [X, 660]], t, { a: aL, color: '#fff3d6', speed: 50, gap: 26, r: 4.5 });
    if (aL > 0) { chev(ctx, X - 105, lvl - 14, y0 + 20, t, { a: aL, color: C.gas, s: 9, gap: 40, speed: 50 }); chev(ctx, X + 105, lvl - 14, y0 + 20, t, { a: aL, color: C.gas, s: 9, gap: 40, speed: 50 }); }
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,.16)'; ctx.lineWidth = 2; rr(ctx, x0, y0, x1 - x0, y1 - y0, 20); ctx.stroke();
    // levels
    const line = (y, a, col) => { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.setLineDash([12, 9]); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X - 150, y); ctx.lineTo(X + 330, y); ctx.stroke(); ctx.restore(); };
    const aS = win(t, c[0] + 3.5, s.e[1]), aDn = win(t, c[1] + 5, s.e[1]);
    line(ys, aS, C.cold); label(ctx, X + 330, ys, X + 345, ys, 'Static level\nwell shut in', { a: aS, color: C.cold });
    line(yd, aDn, C.accent); label(ctx, X + 330, yd, X + 345, yd, 'Dynamic level\npump running', { a: aDn });
    if (aDn > 0) arrow(ctx, X + 250, ys + 16, X + 250, yd - 14, { a: aDn, color: '#fff', w: 4 });
    label(ctx, X + 30, 560, X - 330, 520, 'Pump', { a: win(t, c[0] + .8, s.e[0]) });
    label(ctx, X - 108, 560, X - 330, 610, 'Gas bubbles', { a: win(t, c[2] + 1.5, s.e[2]) });
    label(ctx, X + 52, 730, X + 345, 660, 'Gas anchor', { a: win(t, c[3] + .6, s.e[4]) });
    label(ctx, X - 100, 700, X - 330, 640, 'Liquid goes\nto the pump intake', { a: win(t, c[3] + 2, s.e[4]) });
    label(ctx, X + 105, 300, X + 345, 250, 'Gas rises\nup the annulus', { a: win(t, c[3] + 4, s.e[4]), color: C.gas });
    // right-hand panel
    const card = (y, a, h1, h2, col) => { if (a <= 0) return; box(ctx, 1350, y, 480, 150, { a: a * .96, stroke: col }); txt(ctx, h1, 1380, y + 48, { size: 30, weight: 700, color: col, a }); txt(ctx, h2, 1380, y + 100, { size: 26, color: C.ink, a, lh: 1.2 }); };
    card(330, win(t, c[1] + 6, s.e[1] + .3), 'Steady state', 'reservoir inflow = pump withdrawal', C.accent);
    card(330, win(t, c[4] + .3, s.e[4] + .3), 'Less gas in the pump:', 'better liquid fillage', C.ok);
  },
});

// ---------- 7. Pump anatomy ----------
SCENES.push({
  id: 'pump', title: 'Inside the downhole pump', amb: 'quiet',
  cues: [
    'Now the pump itself. Its body is a stationary barrel with a precisely machined inner surface.',
    'Inside it moves the plunger, connected to the rods. It is not solid: there is a passage through it for the fluid.',
    'At the bottom of the barrel sits the standing valve. It does not move, and it lets fluid into the pump.',
    'The plunger carries the traveling valve. It moves with the plunger and lets fluid pass upward.',
    'The volume between the standing valve and the plunger is the pump chamber. It changes as the plunger moves.',
    'Both are ball valves: a seat with a port, a ball, and a cage that limits how far the ball can lift.',
    ['They have no actuator. Higher pressure below lifts the ball and lets the flow through. Higher pressure above pushes the ball onto its seat.', 12],
  ],
  events(s) { return [{ t: s.c[6] + .7, type: 'click' }, { t: s.c[6] + 6.2, type: 'click' }]; },
  draw(ctx, t, c, s) {
    const x = 640, y = 150, w = 170, h = 680;
    const pIn = pr(t, c[1], 2.5), osc = lin(t, c[4] + .5, 1) * (1 - lin(t, s.e[4] - .5, 1));
    const p = lerp(2.3, .5, pIn) + osc * .36 * Math.sin((t - c[4]) * 1.3);
    ctx.fillStyle = '#131a21'; ctx.fillRect(x - w / 2, 110, w, h + 80);
    const o = { x, y, w, h, p, sv: 0, tv: 0, t, rodTop: 60, tail: 50, over: 40,
      al: { cyl: lin(t, .6, 1), pl: 1, sv: lin(t, c[2], .8), tv: lin(t, c[3], .8), fl: lerp(.22, 1, pr(t, c[4], 1.5)) },
      hl: t > c[0] + 1 && t < s.e[0] ? 'cyl' : t > c[1] + 2.6 && t < c[1] + 5 ? 'pl' : '',
      chHL: win(t, c[4] + .3, s.e[4]) * (.5 + .5 * Math.sin(t * 4)) };
    const G = drawPump(ctx, o);
    const ring = (yy, a) => { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a * (.6 + .4 * Math.sin(t * 5)); ctx.strokeStyle = C.accent; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(x, yy, w * .42, 0, TAU); ctx.stroke(); ctx.restore(); };
    ring(G.SV.by, win(t, c[2] + .5, c[2] + 5)); ring(G.TV.by, win(t, c[3] + .5, c[3] + 5));
    if (t > c[1] + 5 && t < s.e[1]) chev(ctx, x, G.yb - 30, G.yt + 10, t, { a: win(t, c[1] + 5, s.e[1]), color: C.accent, s: 12, gap: 36, speed: 60, lw: 4 });
    label(ctx, x - w / 2 - 12, 330, 430, 290, 'Barrel\nstationary body', { a: win(t, c[0] + 1, s.e[0]), align: 'right' });
    label(ctx, x + w / 2 - 16, G.yt + 50, 850, G.yt + 10, 'Plunger\nmoves with the rods', { a: win(t, c[1] + 2.6, s.e[1]) });
    label(ctx, x, G.yt + 120, 850, G.yt + 140, 'Inner passage\nfor the fluid', { a: win(t, c[1] + 5, s.e[1]) });
    label(ctx, x, 110, 430, 150, 'Rod', { a: win(t, c[1] + 2.6, s.e[1]), align: 'right' });
    label(ctx, x + G.SV.r, G.SV.by, 850, G.SV.by - 30, 'Standing valve\nstationary', { a: win(t, c[2] + .5, s.e[2]) });
    label(ctx, x - G.TV.r, G.TV.by, 430, G.TV.by - 30, 'Traveling valve\nmoves with the plunger', { a: win(t, c[3] + .5, s.e[3]), align: 'right' });
    label(ctx, x + 40, (G.chTop + G.seatY) / 2 - 30, 850, 600, 'Pump chamber\nvolume changes', { a: win(t, c[4] + .5, s.e[4]) });
    // valve close-up
    const aV = lin(t, c[5] - .3, .8);
    if (aV > 0) {
      const vx = 1450, vy = 610, vw = 380, since = t - c[6], open = t < c[6] ? 0 : since < 5.5 ? pr(since, .5, .5) : 1 - pr(since, 5.5, .5);
      ctx.save(); ctx.globalAlpha = aV;
      box(ctx, 1060, 150, 760, 760, { fill: '#0e151c', stroke: 'rgba(255,255,255,.16)' });
      txt(ctx, 'BALL CHECK VALVE', 1100, 200, { size: 24, mono: true, weight: 700, color: C.dim });
      ctx.save(); rr(ctx, 1062, 240, 756, 668, 12); ctx.clip();
      ctx.fillStyle = C.oil; ctx.fillRect(vx - vw / 2, 240, vw, 420); ctx.fillStyle = C.oilD; ctx.fillRect(vx - vw / 2, vy + vw * .2, vw, 300);
      ctx.fillStyle = '#93a4b3'; ctx.fillRect(vx - vw / 2 - 34, 240, 34, 680); ctx.fillRect(vx + vw / 2, 240, 34, 680);
      const V = drawBallValve(ctx, vx, vy, vw, open, {});
      if (open > .05) { for (const sd of [-1, 1]) { chev(ctx, vx, 900, vy + vw * .22, t, { a: open, s: 16, gap: 44, speed: 90, lw: 5 }); chev(ctx, vx + sd * vw * .36, vy - 30, 260, t, { a: open, s: 14, gap: 44, speed: 90, lw: 5 }); } }
      ctx.restore();
      label(ctx, vx + V.r * 1.25, V.cy + 60, 1700, 330, 'Cage', { a: win(t, c[5] + 4.5, s.e[5]) });
      label(ctx, vx + V.r * .7, V.by - 20, 1700, 420, 'Ball', { a: win(t, c[5] + 3, s.e[5]) });
      label(ctx, vx + vw * .34, vy + 40, 1700, 730, 'Seat', { a: win(t, c[5] + 1.5, s.e[5]) });
      if (t > c[6]) {
        const op = since < 5.5, a = win(t, c[6] + .3, c[6] + 5.4, .3) + win(t, c[6] + 5.6, s.e[6] + .3, .3);
        ctx.globalAlpha = aV * a;
        if (op) arrow(ctx, 1130, 870, 1130, 700, { color: C.hot, w: 16, head: 40 }); else arrow(ctx, 1130, 290, 1130, 470, { color: C.hot, w: 16, head: 40 });
        txt(ctx, op ? 'higher\npressure\nbelow' : 'higher\npressure\nabove', 1082, op ? 600 : 520, { size: 24, weight: 600, color: C.hot });
        box(ctx, 1530, 168, 260, 64, { fill: 'rgba(11,16,22,.92)', stroke: op ? C.ok : C.bad, lw: 3 });
        txt(ctx, op ? 'OPEN' : 'CLOSED', 1660, 201, { size: 34, weight: 700, align: 'center', color: op ? C.ok : C.bad });
      }
      ctx.restore();
    }
  },
});

// ---------- 8. Pumpjack drive ----------
SCENES.push({
  id: 'surface', title: 'How the pumpjack drives the rods', amb: 'surface',
  cues: [
    'Back to the surface. An electric motor turns the gearbox through a belt drive.',
    'The gearbox lowers the rotation speed and raises the torque. Its output shaft turns the cranks.',
    'Pitman arms link the cranks to the rear end of the walking beam. The beam rocks on a bearing atop the Samson post.',
    'The horsehead rises and falls. Its curved face keeps the bridle cables moving straight up and down.',
    'This is how rotation becomes the reciprocating motion of the polished rod.',
    'The rods and the fluid column are very heavy. Counterweights on the cranks descend as the rods go up, helping the motor.',
    'On the downstroke the counterweights rise and store energy. The load on the drive becomes more even.',
    'At the wellhead the rod passes through a stuffing box. The seal keeps the fluid in, so it leaves through the side outlet into the flowline.',
  ],
  draw(ctx, t, c, s) {
    const c1 = { cx: 15, cy: -185, z: 1.9 }, c2 = { cx: 290, cy: -62, z: 5.2 };
    const cam = camKf(t, [[0, c1], [c[7] - .5, c2, 2.5]]);
    const mid = i => (c[i] + s.e[i]) / 2, inw = (a, b) => t > a && t < b;
    const hl = inw(c[0] + 1, mid(0)) ? 'motor' : inw(mid(0), s.e[0]) ? 'belt' : inw(c[1] + .5, mid(1)) ? 'gear' : inw(mid(1), s.e[1]) ? 'crank' : inw(c[2] + .5, mid(2)) ? 'pitman' : inw(mid(2), s.e[2]) ? 'beam post' : inw(c[3] + .5, mid(3)) ? 'head' : inw(mid(3), s.e[3]) ? 'bridle' : inw(c[4] + .5, s.e[4]) ? 'rod' : inw(c[5] + 1, s.e[6]) ? 'cw' : inw(c[7] + 2, c[7] + 6) ? 'sbox' : inw(c[7] + 6, s.e[7]) ? 'tee flow' : '';
    const th = TH(GT), g = pjGeom(th);
    drawWorld(ctx, cam, GT, { pjhl: hl, flow: true });
    if (t > c[7]) { ctx.save(); camOn(ctx, cam); dots(ctx, [[WX, -16], [WX, -40], [WX + 30, -40], [WX + 500, -40]], t, { a: lin(t, c[7] + 6, 1), color: '#fff3d6', speed: 22, gap: 9, r: 1.7 }); ctx.restore(); }
    const L = (wx, wy, dx, dy, str, a, o = {}) => { const p = camP(cam, wx, wy); label(ctx, p[0], p[1], p[0] + dx, p[1] + dy, str, Object.assign({ a }, o)); };
    L(-366, -74, -40, -210, 'Electric motor', win(t, c[0] + 1, s.e[0]));
    L(-300, -95, 20, -330, 'Belt drive', win(t, mid(0), s.e[0]));
    L(-150, -125, 90, -200, 'Gearbox\nless speed, more torque', win(t, c[1] + .5, s.e[1]));
    L(PJ.O[0] + 30 * Math.cos(th), PJ.O[1] + 30 * Math.sin(th), -330, 150, 'Crank', win(t, mid(1), s.e[1]));
    L((g.E[0] + g.K[0]) / 2, (g.E[1] + g.K[1]) / 2, -330, -60, 'Pitman arm', win(t, c[2] + .5, s.e[2]));
    L(90, -300 - 90 * Math.sin(g.phi), 60, -110, 'Walking beam', win(t, mid(2), s.e[2]));
    L(30, -160, 150, 40, 'Samson post with bearing', win(t, mid(2), s.e[2]));
    L(215 * Math.cos(g.phi), -300 - 215 * Math.sin(g.phi), -260, -70, 'Horsehead', win(t, c[3] + .5, s.e[3]));
    L(WX, -255, 110, 60, 'Bridle', win(t, mid(3), s.e[4]));
    L(WX, -120, 110, 30, 'Polished rod', win(t, c[4] + .5, s.e[4]));
    const a4 = win(t, c[4] + .5, s.e[4]);
    if (a4 > 0) { const p = camP(cam, WX - 40, -150); arrow(ctx, p[0], p[1] + 70, p[0], p[1] - 70, { a: a4, w: 6 }); arrow(ctx, p[0], p[1] - 70, p[0], p[1] + 70, { a: a4, w: 6 }); }
    const upS = pjDir(th) > 0, a5 = win(t, c[5] + 1, s.e[6]);
    if (a5 > 0) {
      const p = camP(cam, PJ.O[0] + 98 * Math.cos(th), PJ.O[1] + 98 * Math.sin(th));
      label(ctx, p[0], p[1], 250, 250, upS ? 'Counterweight descends\nhelps lift the rods' : 'Counterweight rises\nstores energy', { a: a5, color: upS ? C.ok : C.cold, align: 'left', size: 30 });
      const q = camP(cam, WX + 70, -190);
      ctx.globalAlpha = a5; if (upS) arrow(ctx, q[0], q[1] + 60, q[0], q[1] - 60, { color: C.ok, w: 8 }); else arrow(ctx, q[0], q[1] - 60, q[0], q[1] + 60, { color: C.cold, w: 8 });
      txt(ctx, upS ? 'rods\ngo up' : 'rods\ngo down', q[0] + 26, q[1] - 16, { size: 28, weight: 600, color: upS ? C.ok : C.cold }); ctx.globalAlpha = 1;
    }
    L(WX + 8, -68, 190, -150, 'Stuffing box\nseals the moving rod', win(t, c[7] + 2.5, s.e[7]));
    L(WX - 10, -36, -200, -60, 'Pumping tee', win(t, c[7] + 6, s.e[7]));
    L(WX + 120, -40, 120, 150, 'Flowline', win(t, c[7] + 6, s.e[7]));
    L(WX, -150, -200, 50, 'Polished rod', win(t, c[7] + 2.5, s.e[7]));
  },
});

// ---------- 9. Pump cycle ----------
const TH_BOT = (() => { let b = 0, m = 9; for (let i = 0; i < 720; i++) { const v = pjS(i / 720 * TAU); if (v < m) { m = v; b = i / 720 * TAU; } } return b; })();
function cycState(t, c, e) {
  if (t >= c[13]) {
    const th = TH_BOT + (t - c[13]) / PERIOD * TAU, p = pjS(th), d = pjDir(th), ph = ((t - c[13]) / PERIOD) % 1;
    // fraction of the half-stroke travelled
    const up = d > 0, k = up ? p : 1 - p, sw = clamp((k - .04) * 14) * clamp((1 - k) * 30 + .0);
    return { th, p, dir: d, sv: up ? sw : 0, tv: up ? 0 : sw, pc: up ? lerp(.8, .22, clamp(k * 14)) : lerp(.22, .82, clamp(k * 14)), up: up ? sw : 0, dn: up ? 0 : sw, phase: up ? 'Upstroke' : 'Downstroke', final: true };
  }
  const p = kf(t, [[c[2], 0], [c[3], .05], [c[3] + 2.5, .1], [e[3], .42], [c[4], .45], [e[4], .93], [e[5], 1], [c[7], 1], [e[7], .97], [e[8], .93], [c[9], .92], [e[9], .75], [e[10], .4], [e[11], .06], [c[12] + 2, 0]], false);
  const pc = kf(t, [[c[2], .8], [c[2] + 1, .8], [c[3] + 2.5, .22], [c[7], .22], [e[7], .5], [c[8], .5], [e[8], .82], [c[12] + 2, .82], [c[12] + 3, .8]]);
  const sv = pr(t, c[3] + 2.2, .5) * (1 - pr(t, c[7] + .8, .5)), tv = pr(t, e[8] - .3, .5) * (1 - pr(t, c[12] + 1.6, .5));
  const dir = t < c[2] ? 0 : t < e[5] - .3 ? 1 : t < c[7] ? 0 : t < c[12] + 2 ? -1 : 0;
  return { p, pc, sv, tv, dir, up: sv * (1 - pr(t, e[5] - 1, 1)), dn: tv * (1 - pr(t, c[12] + 1, 1)), phase: t < c[2] ? 'Bottom of stroke' : t < c[6] ? 'Upstroke' : t < c[9] ? 'Top of stroke' : t < c[12] + 2 ? 'Downstroke' : 'Bottom of stroke' };
}
SCENES.push({
  id: 'cycle', title: 'The pump cycle', amb: 'quiet',
  cues: [
    'Now the key part: the pump cycle. For simplicity, assume the pump is full of liquid and the valves are in good order.',
    'The plunger is at the bottom of its stroke. There is already fluid above it: the tubing is full all the way to the wellhead.',
    'Upstroke. The rods pull the plunger up. The traveling valve is closed, so the plunger carries the whole fluid column.',
    'The chamber under the plunger grows and its pressure falls. Intake pressure is now higher, and the standing valve opens.',
    'Two things happen at once: a new charge of fluid enters under the plunger, and the fluid above it is lifted up the tubing.',
    ['No absolute vacuum is needed: a pressure difference is enough.', 5],
    ['Top of stroke. The plunger slows down and starts moving down.', 5],
    'The chamber shrinks and its pressure rises. The standing valve closes and keeps fluid from returning to the well.',
    'For a short moment both valves are closed, until the pressure under the plunger exceeds the pressure above it.',
    ['Downstroke. The traveling valve has opened.', 4.5],
    'Fluid from the chamber passes through the valve seat and the plunger passage into the space above the plunger.',
    'The plunger in effect sinks through the fluid. The column in the tubing does not fall: the closed standing valve holds it.',
    ['At the bottom the valves switch again, and the cycle repeats.', 5.5],
    ['In short: on the upstroke the pump takes in new fluid under the plunger and lifts the fluid above it. On the downstroke the standing valve holds the fluid while the traveling valve lets it pass above the plunger.', 18],
  ],
  events(s) {
    const c = s.c, e = s.e, ev = [{ t: c[2] + .3, type: 'click' }, { t: c[3] + 2.4, type: 'click' }, { t: c[7] + 1, type: 'click' }, { t: e[8], type: 'click' }, { t: c[12] + 1.8, type: 'click' },
      { t: c[2], type: 'up', dur: e[5] - c[2] }, { t: c[7], type: 'down', dur: c[12] + 2 - c[7] }];
    for (let k = 0; c[13] + k * PERIOD / 2 < s.dur - .5; k++) { const tt = c[13] + k * PERIOD / 2; ev.push({ t: tt + .2, type: 'click' }, { t: tt + .05, type: 'click2' }, { t: tt, type: k % 2 ? 'down' : 'up', dur: PERIOD / 2 }); }
    return ev;
  },
  draw(ctx, t, c, s) {
    const S = cycState(t, c, s.e), x = 560, y = 150, w = 190, h = 700;
    ctx.fillStyle = '#131a21'; ctx.fillRect(x - w / 2, 100, w, 820);
    const G = drawPump(ctx, { x, y, w, h, p: S.p, sv: S.sv, tv: S.tv, t, up: S.up, dn: S.dn, tint: (S.pc - .5) * 1.9, rodTop: 60, tail: 44, over: 50 });
    // direction indicator / pumpjack
    if (S.final) {
      ctx.save(); ctx.globalAlpha = lin(t, c[13], 1); ctx.translate(232, 640); ctx.scale(.47, .47);
      ctx.fillStyle = '#40342a'; ctx.fillRect(-460, 0, 800, 60); drawPumpjack(ctx, S.th, { flowLen: 60 }); ctx.restore();
      txt(ctx, 'at the surface', 215, 700, { size: 24, color: C.dim, align: 'center', a: lin(t, c[13], 1) });
    }
    const aA = S.final ? 0 : lin(t, c[1], .6);
    if (aA > 0) {
      const col = S.dir > 0 ? C.ok : S.dir < 0 ? C.cold : C.dim;
      if (S.dir > 0) arrow(ctx, 200, 560, 200, 340, { color: col, w: 18, head: 50, a: aA }); else if (S.dir < 0) arrow(ctx, 200, 340, 200, 560, { color: col, w: 18, head: 50, a: aA });
      else { ctx.globalAlpha = aA; ctx.fillStyle = col; rr(ctx, 165, 415, 70, 70, 10); ctx.fill(); ctx.globalAlpha = 1; }
      txt(ctx, 'PLUNGER', 200, 612, { size: 24, mono: true, weight: 700, color: C.dim, align: 'center', a: aA });
      txt(ctx, S.dir > 0 ? 'up' : S.dir < 0 ? 'down' : 'hold', 200, 656, { size: 38, weight: 700, color: col, align: 'center', a: aA });
    }
    // labels on the pump
    label(ctx, x + 60, G.yt - 120, 425, 210, 'Fluid above the plunger', { a: win(t, c[1] + 1.5, s.e[1]), align: 'right' });
    label(ctx, x - 50, (G.chTop + G.seatY) / 2 - 40, 425, 800, 'Chamber:\npressure falls', { a: win(t, c[3] + .5, c[3] + 5), align: 'right', color: C.cold });
    label(ctx, x - 55, (G.chTop + G.seatY) / 2 - 20, 425, 800, 'New charge of fluid', { a: win(t, c[4] + .8, s.e[4]), align: 'right' });
    label(ctx, x - 60, 200, 425, 210, 'Lifted up the tubing', { a: win(t, c[4] + .8, s.e[4]), align: 'right' });
    label(ctx, x - 50, (G.chTop + G.seatY) / 2 - 40, 425, 800, 'Chamber:\npressure rises', { a: win(t, c[7] + .5, s.e[8]), align: 'right', color: C.hot });
    label(ctx, x - 20, G.yt + 80, 425, 300, 'Through the plunger passage', { a: win(t, c[10] + .8, s.e[10]), align: 'right' });
    label(ctx, x - G.SV.r, G.SV.by, 425, 800, 'Standing valve\nholds the column', { a: win(t, c[11] + 2.5, s.e[11]), align: 'right', color: C.bad });
    // indicator panel
    const px = 900, pw = 900, aP = lin(t, c[0] + 1, 1);
    ctx.save(); ctx.globalAlpha = aP;
    txt(ctx, S.phase.toUpperCase(), px, 175, { size: 58, weight: 700, color: S.phase.includes('Up') ? C.ok : S.phase.includes('Down') ? C.cold : C.accent });
    const vcard = (yy, name, sub, v) => {
      box(ctx, px, yy, pw, 118, {}); txt(ctx, name, px + 30, yy + 42, { size: 32, weight: 600 }); txt(ctx, sub, px + 30, yy + 84, { size: 24, color: C.dim });
      const op = v > .5, col = op ? C.ok : C.bad; box(ctx, px + pw - 270, yy + 24, 240, 70, { fill: op ? 'rgba(95,211,141,.14)' : 'rgba(255,100,100,.14)', stroke: col, lw: 3, r: 35 });
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(px + pw - 232, yy + 59, 11, 0, TAU); ctx.fill();
      txt(ctx, op ? 'OPEN' : 'CLOSED', px + pw - 208, yy + 60, { size: 30, weight: 700, color: col });
    };
    vcard(235, 'Traveling valve', 'in the plunger, moves', S.tv);
    vcard(370, 'Standing valve', 'bottom of barrel, stationary', S.sv);
    box(ctx, px, 505, pw, 118, {}); txt(ctx, 'Flow', px + 30, 547, { size: 32, weight: 600 });
    const fl = S.up > .3 ? 'from the well into the chamber; above the plunger, up the tubing' : S.dn > .3 ? 'from the chamber, through the plunger, to the space above it' : 'no flow';
    txt(ctx, fl, px + 30, 589, { size: 26, color: S.up > .3 || S.dn > .3 ? C.accent : C.dim });
    // chamber pressure
    box(ctx, px, 640, pw, 250, {}); txt(ctx, 'Pump chamber pressure', px + 30, 682, { size: 32, weight: 600 });
    const gx = px + 40, gw = pw - 80, gy = 735;
    const gg = ctx.createLinearGradient(gx, 0, gx + gw, 0); gg.addColorStop(0, C.cold); gg.addColorStop(.5, '#b9a0a8'); gg.addColorStop(1, C.hot);
    ctx.fillStyle = gg; rr(ctx, gx, gy, gw, 26, 13); ctx.fill();
    const mark = (v, l1, l2) => { const mx = gx + gw * v; ctx.fillStyle = '#fff'; ctx.fillRect(mx - 2, gy - 10, 4, 46); txt(ctx, l1, mx, gy + 62, { size: 24, weight: 600, align: 'center' }); txt(ctx, l2, mx, gy + 92, { size: 22, color: C.dim, align: 'center' }); };
    mark(.28, 'intake pressure', 'below it: standing valve opens'); mark(.8, 'pressure above plunger', 'above it: traveling valve opens');
    const nx = gx + gw * S.pc; ctx.fillStyle = '#fff'; ctx.strokeStyle = '#0b1016'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(nx, gy + 6); ctx.lineTo(nx - 17, gy - 26); ctx.lineTo(nx + 17, gy - 26); ctx.closePath(); ctx.stroke(); ctx.fill();
    ctx.restore();
  },
});
