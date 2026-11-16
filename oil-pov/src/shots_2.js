// Shots 2: drilling, casing, cement, completion, perforation, inflow, the well, separation, pipeline.

// ---------- the borehole in section (used for drilling, completion and perforating) ----------
// st: pipeY, bit, casingY, cem (0..1), tubingY, packer (0..1), gun (0..1), fired (number of charge pairs), t
const BORE = { X: 960, hole: 172, cas: 132, casW: 14, rt: 380 };
const PERFY = [520, 600, 680, 760, 840];
function bore(ctx, st, t) {
  const { X, hole, cas, casW, rt } = BORE;
  // rock: cap rock above, oil-bearing sandstone below
  fillTex(ctx, tex('cap', [.13, .14, .16], .03, 53, .5), () => ctx.rect(-400, -600, W + 800, 600 + rt));
  fillTex(ctx, tex('res', [.50, .42, .31], .1, 54, 1.4), () => ctx.rect(-400, rt, W + 800, 1400));
  ctx.fillStyle = 'rgba(60,34,8,.62)'; ctx.fillRect(-400, rt, W + 800, 1400);
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(-400, rt - 6, W + 800, 12);
  // open hole with mud
  const bot = st.bot ?? 2000; ctx.fillStyle = vgrad(ctx, 0, H, ['#3b352c', '#2a251f']); ctx.fillRect(X - hole, -600, hole * 2, 600 + bot);
  ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.fillRect(X - hole, -600, 10, 600 + bot); ctx.fillRect(X + hole - 10, -600, 10, 600 + bot);
  // perforation tunnels (drawn under the steel so they look cut through it)
  const nf = st.fired ?? 0;
  for (let i = 0; i < Math.min(nf, PERFY.length); i++) for (const sd of [-1, 1]) { const y = PERFY[i]; ctx.fillStyle = '#0c0907'; ctx.beginPath(); ctx.moveTo(X + sd * (cas - casW), y - 13); ctx.lineTo(X + sd * (hole + 190), y + (i % 2 ? 4 : -4)); ctx.lineTo(X + sd * (cas - casW), y + 13); ctx.fill(); }
  // cement: down the inside of the casing, round the shoe, up the outside
  const cem = st.cem ?? 0, cy = st.casingY ?? -999;
  if (cem > 0) { const up = clamp((cem - .4) / .6); ctx.fillStyle = '#8f9498'; const top = lerp(cy, -700, up); ctx.fillRect(X - hole + 4, top, hole - cas - 4, cy - top + 40); ctx.fillRect(X + cas, top, hole - cas - 4, cy - top + 40); ctx.fillStyle = 'rgba(255,255,255,.07)'; for (let y = top; y < cy; y += 46) { ctx.fillRect(X - hole + 6, y + 10 * Math.sin(y), hole - cas - 8, 3); ctx.fillRect(X + cas + 2, y + 9 * Math.cos(y), hole - cas - 8, 3); } }
  // casing
  if (cy > -900) {
    ctx.fillStyle = cem > .05 && cem < .45 ? '#8f9498' : '#1f1c18'; ctx.fillRect(X - cas + casW, -700, 2 * (cas - casW), cy + 700);
    if (cem > 0 && cem < .45) { ctx.fillStyle = '#1f1c18'; const f = lerp(-700, cy, cem / .4); ctx.fillRect(X - cas + casW, f, 2 * (cas - casW), cy - f); }
    steelV(ctx, X - cas, -700, casW, cy + 700); steelV(ctx, X + cas - casW, -700, casW, cy + 700);
    for (let i = 0; i < nf; i++) for (const sd of [-1, 1]) { ctx.fillStyle = '#0c0907'; ctx.fillRect(X + sd * cas - (sd > 0 ? casW + 2 : -2) - (sd > 0 ? 0 : 0), PERFY[i] - 10, casW + 4, 20); }
  }
  // drillpipe
  if (st.pipeY != null && st.pipeY > -700) steelV(ctx, X - 46, -700, 92, st.pipeY + 700, { b: .9 });
  // production tubing, packer, perforating gun
  if (st.tubingY != null && st.tubingY > -700) {
    const ty = st.tubingY; steelV(ctx, X - 58, -700, 12, ty + 700); steelV(ctx, X + 46, -700, 12, ty + 700); ctx.fillStyle = '#15120f'; ctx.fillRect(X - 46, -700, 92, ty + 700);
    const pk = st.packer ?? 0; ctx.fillStyle = '#17181a'; ctx.fillRect(X - 58 - (cas - casW - 58) * pk, ty - 150, (cas - casW - 58) * pk, 70); ctx.fillRect(X + 58, ty - 150, (cas - casW - 58) * pk, 70);
    if (st.gun) { const gy = ty + 60; steelV(ctx, X - 40, gy, 80, 900 - gy, { b: .7 }); ctx.fillStyle = '#93989c'; ctx.fillRect(X - 6, ty, 12, 60); PERFY.forEach((y, i) => { for (const sd of [-1, 1]) { ctx.fillStyle = i < nf ? '#0a0a0a' : '#b0683a'; ctx.beginPath(); ctx.arc(X + sd * 26, y, 9, 0, TAU); ctx.fill(); } }); }
  }
}
function boreView(ctx, t, z, cy, st, o = {}) {
  ctx.save(); if (o.shake) shake(ctx, t, o.shake, 16); zoomAt(ctx, z, 960, cy); bore(ctx, st, t); if (o.over) o.over(); ctx.restore();
  ctx.fillStyle = 'rgba(0,0,0,.34)'; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'lighter'; glow(ctx, 960, 540, 800, [1, .9, .72], o.light ?? .3); ctx.globalCompositeOperation = 'source-over';
  const e = ctx.createLinearGradient(0, 0, W, 0); e.addColorStop(0, 'rgba(0,0,0,.75)'); e.addColorStop(.3, 'rgba(0,0,0,0)'); e.addColorStop(.7, 'rgba(0,0,0,0)'); e.addColorStop(1, 'rgba(0,0,0,.75)'); ctx.fillStyle = e; ctx.fillRect(0, 0, W, H);
}

// ---------- something approaches: the pore trembles ----------
shot('tremble', 4, (ctx, t) => waiting(ctx, t, 7 * smooth(t / 3.2) * (.55 + .45 * Math.sin(t * 20))), { snd: [['deep', .5], ['drillfar', 1]] });

// ---------- the drill bit ----------
shot('bit', 7, (ctx, t) => {
  const { X, hole } = BORE, by = 560 + t * 16, rot = t * 9;
  boreView(ctx, t, 1.55, 560, { bot: by + 40, pipeY: by - 150 }, {
    shake: 5, light: .26, over() {
      // bit body, rotating blades and cutters
      ctx.fillStyle = '#2b2e33'; ctx.beginPath(); ctx.moveTo(X - 60, by - 160); ctx.lineTo(X + 60, by - 160); ctx.lineTo(X + hole - 16, by - 40); ctx.lineTo(X + hole - 26, by + 26); ctx.lineTo(X - hole + 26, by + 26); ctx.lineTo(X - hole + 16, by - 40); ctx.fill();
      for (let i = 0; i < 6; i++) { const a = rot + i * TAU / 6, c = Math.cos(a), sx = Math.sin(a); if (c < -.15) continue; const x = X + sx * (hole - 34), w = 22 + 16 * c; steelV(ctx, x - w / 2, by - 130, w, 150, { b: .5 + .5 * c }); for (let k = 0; k < 4; k++) { ctx.fillStyle = `rgba(20,20,22,${.6 + .4 * c})`; ctx.beginPath(); ctx.arc(x, by - 104 + k * 36, 8, 0, TAU); ctx.fill(); } }
      // drilling fluid jets and crushed rock
      for (const jx of [-70, 0, 70]) { const g = ctx.createLinearGradient(0, by + 10, 0, by + 44); g.addColorStop(0, 'rgba(190,170,130,.7)'); g.addColorStop(1, 'rgba(190,170,130,0)'); ctx.fillStyle = g; ctx.fillRect(X + jx - 7 + 3 * Math.sin(t * 40 + jx), by + 8, 14, 40); }
      const R = rng(12); for (let i = 0; i < 130; i++) { const sd = i % 2 ? 1 : -1, u = (R() + t * (.5 + R() * .5)) % 1, x = X + sd * (hole - 4 - R() * 28) + Math.sin(u * 30 + i) * 5, y = by + 20 - u * 900; ctx.fillStyle = `rgba(${150 + R() * 60 | 0},${125 + R() * 50 | 0},${90 + R() * 40 | 0},${.9 * (1 - u * .6)})`; ctx.fillRect(x, y, 5 + R() * 7, 4 + R() * 6); }
      ctx.fillStyle = 'rgba(170,150,115,.28)'; ctx.fillRect(X - hole, by - 30, hole * 2, 70);
    },
  });
}, { fi: .12, fo: .2, snd: [['drill', 1], ['mudflow', .7]] });

// ---------- drillstring out, casing in, cement, completion ----------
shot('pullout', 2, (ctx, t) => boreView(ctx, t, 1.15, 560, { pipeY: lerp(980, -720, ease(t / 1.9)) }), { fi: .15, fo: .15, snd: [['steel', .8]], events: s => [{ t: .1, type: 'clank' }, { t: 1.3, type: 'clank' }] });
shot('casing', 3, (ctx, t) => boreView(ctx, t, 1.15, 560, { casingY: lerp(-720, 1150, ease(t / 2.6)) }, { shake: 1.5 }), { fi: .15, fo: .15, snd: [['steel', 1]], events: s => [{ t: .2, type: 'clank' }, { t: 2.5, type: 'thud' }] });
shot('cement', 4, (ctx, t) => boreView(ctx, t, 1.15, 560, { casingY: 1150, cem: lin(t, .2, 3.4) }), { fi: .15, fo: .25, snd: [['pump', .9]], events: s => [0, 1, 2, 3, 4, 5].map(i => ({ t: .3 + i * .55, type: 'pulse' })) });
shot('tubing', 3.5, (ctx, t) => boreView(ctx, t, 1.15, 560, { casingY: 1150, cem: 1, tubingY: lerp(-720, 440, ease(t / 2)), packer: smooth((t - 2.2) / .6), gun: 1 }), { fi: .2, fo: .5, snd: [['steel', .8]], events: s => [{ t: .1, type: 'clank' }, { t: 2.3, type: 'thud' }] });

// ---------- stillness, then perforation ----------
shot('wait2', 2.6, (ctx, t) => waiting(ctx, t), { fi: .5, snd: [['deep', .3]] });
const PT = i => .45 + i * .26;
shot('perf', 2.4, (ctx, t) => {
  let nf = 0, amp = 0; for (let i = 0; i < 5; i++) { if (t > PT(i)) nf = i + 1; amp += 26 * Math.exp(-Math.max(0, t - PT(i)) * 9) * (t > PT(i) ? 1 : 0); }
  boreView(ctx, t, 1.9, 680, { casingY: 1150, cem: 1, tubingY: 440, packer: 1, gun: 1, fired: nf }, {
    shake: amp, light: .22, over() {
      for (let i = 0; i < 5; i++) { const dt = t - PT(i); if (dt < 0 || dt > .22) continue; const k = 1 - dt / .22, y = PERFY[i];
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        for (const sd of [-1, 1]) { const g = ctx.createLinearGradient(BORE.X, 0, BORE.X + sd * 420, 0); g.addColorStop(0, `rgba(255,240,200,${k})`); g.addColorStop(1, 'rgba(255,140,40,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(BORE.X + sd * 30, y - 20 * k - 4); ctx.lineTo(BORE.X + sd * 420, y); ctx.lineTo(BORE.X + sd * 30, y + 20 * k + 4); ctx.fill(); glow(ctx, BORE.X + sd * 60, y, 260 * k + 40, [1, .8, .5], .8 * k); }
        const R = rng(40 + i); for (let q = 0; q < 26; q++) { const sd = q % 2 ? 1 : -1, a = (R() - .5) * 1.4, d = (1 - k) * (200 + R() * 260); ctx.fillStyle = `rgba(255,${190 + R() * 60 | 0},120,${k})`; ctx.fillRect(BORE.X + sd * (120 + Math.cos(a) * d), y + Math.sin(a) * d, 4, 4); }
        ctx.restore(); }
    },
  });
  const fl = Math.max(0, ...[0, 1, 2, 3, 4].map(i => (t > PT(i) ? 1 - (t - PT(i)) / .09 : 0))); if (fl > 0) { ctx.fillStyle = `rgba(255,235,200,${.5 * fl})`; ctx.fillRect(0, 0, W, H); }
}, { fi: .1, snd: [['deep', .2]], events: s => [0, 1, 2, 3, 4].map(i => ({ t: PT(i), type: 'shot' })).concat([{ t: PT(4) + .05, type: 'ring' }]) });

// ---------- the shock, seen from the pore; a way out appears ----------
const GLOWP = [.06, .03, 28.2];
shot('shock', 4, (ctx, t) => {
  const amp = 46 * Math.exp(-t * 2.2) + 3 * Math.exp(-t * .5), g = smooth((t - .6) / 2.4), mv = smooth((t - 2.2) / 1.8);
  ctx.save(); shake(ctx, t, amp, 22); zoomAt(ctx, 1.06 + .05 * Math.exp(-t * 3));
  pore(ctx, camZ(21.02 + mv * mv * .1, { sway: .03, look: .55 }), ROCK.sand, { uGlowP: GLOWP, uGlowC: [.9 * g, .55 * g, .22 * g] }); ctx.restore();
  fines(ctx, t, { n: 150, seed: 9, a: .6 * Math.exp(-t * .5) + .25, color: [1, .82, .55], size: 3, jit: amp * 2.2, vx: 30 * mv });
  if (t < .2) { ctx.fillStyle = `rgba(255,240,210,${.7 * (1 - t / .2)})`; ctx.fillRect(0, 0, W, H); }
}, { snd: [['deep', .5], ['seep', .5]], events: s => [{ t: 0, type: 'boomtail' }] });

// ---------- inflow: pressure drives the oil toward the perforation ----------
const INZ = t => 21.12 + .16 * t + .062 * t * t;
shot('inflow', 9, (ctx, t) => {
  const g = .9 + 2.6 * smooth(t / 9), v = (.16 + .124 * t);
  ctx.save(); shake(ctx, t, 1.5 + v * 2.2, 12);
  pore(ctx, camZ(INZ(t), { sway: .05, look: .5 }), ROCK.sand, { uGlowP: GLOWP, uGlowC: [.9 * g, .55 * g, .22 * g] }); ctx.restore();
  rush(ctx, t, { n: 70, speed: .25 + v * .5, a: .1 + .16 * smooth(t / 6), color: [1, .78, .45], len: 40 + v * 60 });
  fines(ctx, t, { n: 50, seed: 4, a: .3, color: [1, .82, .55], size: 2.5 });
}, { fo: .12, snd: [['seep', 1], ['rushup', 1]] });

// ---------- through the perforation tunnel into the well ----------
shot('ptunnel', 2.2, (ctx, t) => {
  ctx.save(); shake(ctx, t, 4, 15);
  tunnel(ctx, { uZ: t * 7, uWall: [.42, .33, .22], uWall2: [.2, .15, .09], uStreak: .3, uFog: [.09, .045, .01], uFogD: .1, uEnd: [.5 * smooth(t / 1.6), .3 * smooth(t / 1.6), .12 * smooth(t / 1.6)], uRadius: lerp(.75, 1.05, t / 2.2), uSeed: 7, uLight: 1.1 }); ctx.restore();
  const k = lin(t, 1.25, .75); if (k > 0) { const r = 40 + k * k * 1500; ctx.strokeStyle = '#8d9296'; ctx.lineWidth = 30 + 260 * k * k; ctx.beginPath(); ctx.arc(W / 2, H / 2, r + 60 + 150 * k * k, 0, TAU); ctx.stroke(); ctx.strokeStyle = '#3d4248'; ctx.lineWidth = 26 + 200 * k * k; ctx.beginPath(); ctx.arc(W / 2, H / 2, r, 0, TAU); ctx.stroke(); }
  rush(ctx, t, { n: 80, speed: 1.1, a: .3, color: [1, .8, .5], len: 110 });
}, { fo: .12, snd: [['rush', .9]] });

// ---------- up the production tubing; gas comes out of solution as pressure falls ----------
shot('tubing_up', 7, (ctx, t) => {
  const gz = smooth((t - 2.6) / 3.4);
  ctx.save(); shake(ctx, t, 2.5 + 2 * gz, 13);
  tunnel(ctx, { uZ: t * 6 + t * t * .25, uRib: .42, uRibW: .06, uLight: .8, uWall: [.34, .23, .11], uWall2: [.10, .06, .025], uFog: [lerp(.10, .17, gz), lerp(.05, .095, gz), lerp(.012, .035, gz)], uFogD: .17, uC: [.05 * Math.sin(t * .9), .04 * Math.cos(t * .7)], uTwist: t * .12, uSeed: 2 }); ctx.restore();
  rush(ctx, t, { n: 70, speed: .9, a: .22, color: [1, .82, .55], len: 90 });
  if (gz > 0) orbs(ctx, t, { n: Math.round(8 + 40 * gz), speed: .5, a: .7 * gz, size: 30 + 50 * gz, col: [1, .95, .8], seed: 6 });
}, { fi: .12, fo: .1, snd: [['rush', 1], ['gasliquid', .9]] });

// ---------- the production tree and the choke ----------
shot('tree', 3, (ctx, t) => {
  const bend = Math.sin(Math.PI * clamp((t - .15) / 1.0)) * 1.25, ck = t > 1.25 ? Math.sin(Math.PI * clamp((t - 1.25) / 1.1)) : 0;
  ctx.save(); shake(ctx, t, 3 + 9 * ck, 18);
  tunnel(ctx, { uZ: 60 + t * 7, uRib: .5, uRibW: .06, uLight: .85, uWall: [.36, .25, .13], uWall2: [.11, .07, .03], uFog: [.17, .095, .035], uFogD: .16, uC: [bend, -.2 * bend], uRadius: 1 - .5 * ck, uSeed: 9 }); ctx.restore();
  orbs(ctx, t, { n: 46, speed: .6 + ck, a: .6, size: 60, col: [1, .95, .8], seed: 8 });
  if (ck > 0) { const r = lerp(900, 190, ck); ctx.fillStyle = '#0c0d0f'; ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.arc(W / 2, H / 2, r, 0, TAU, true); ctx.fill('evenodd'); ctx.strokeStyle = 'rgba(190,195,200,.5)'; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(W / 2, H / 2, r, 0, TAU); ctx.stroke(); rush(ctx, t, { n: 120, speed: 2.4, a: .5 * ck, color: [1, .9, .7], len: 160 }); }
}, { fo: .08, snd: [['rush', .9], ['gasliquid', .8], ['hiss', 1]] });

// ---------- a controlled producing well, at dusk ----------
shot('wellhead', 1.1, (ctx, t) => {
  const gy = 800; exterior(ctx, ['#0a1020', '#27304a', '#8a5a4a', '#e09a5c'], gy, { sun: [420, gy - 10, 600], seed: 1 });
  ctx.save(); zoomAt(ctx, 1 + .03 * t, 1100, 700); ctx.fillStyle = '#07080a'; const x = 1100;
  ctx.fillRect(x - 16, gy - 300, 32, 300); for (const y of [gy - 110, gy - 190]) { ctx.fillRect(x - 40, y - 20, 80, 40); ctx.beginPath(); ctx.arc(x - 66, y, 22, 0, TAU); ctx.fill(); ctx.fillRect(x - 60, y - 5, 30, 10); }
  ctx.fillRect(x - 50, gy - 40, 100, 40); ctx.fillRect(x - 28, gy - 330, 56, 34); ctx.fillRect(x, gy - 262, 200, 22); ctx.fillRect(x + 150, gy - 284, 44, 64); ctx.fillRect(x + 190, gy - 262, 60, 22); ctx.fillRect(x + 240, gy - 262, 22, 240); ctx.fillRect(x + 240, gy - 44, 700, 22);
  ctx.beginPath(); ctx.arc(x + 172, gy - 300, 20, 0, TAU); ctx.fill(); ctx.fillRect(x + 168, gy - 300, 8, 20);
  ctx.fillRect(300, gy - 120, 14, 120); ctx.fillRect(1700, gy - 150, 10, 150); ctx.restore();
  ctx.globalCompositeOperation = 'lighter'; glow(ctx, 1707, gy - 156, 240, [1, .8, .5], .6); glow(ctx, 306, gy - 124, 160, [1, .85, .6], .4); ctx.globalCompositeOperation = 'source-over';
}, { fi: .06, fo: .06, vig: .45, snd: [['wind', .7], ['hiss', .25]] });

// ---------- inside the separator: gas above, water below, the oil layer between ----------
function coalesce(ctx, t, o = {}) {   // water droplets merging and sinking through oil
  const R = rng(o.seed ?? 5), n = o.n ?? 14, col = o.col ?? [.45, .7, .95];
  for (let g = 0; g < n; g++) {
    const cx = 160 + R() * 1600, cy = 180 + R() * 620, ph = R(), per = 2.2 + R() * 1.4, u = ((t / per) + ph) % 1, m = smooth(u / .55), fall = smooth((u - .55) / .45);
    const k = 2 + (g % 2), rr = (16 + R() * 20) * (o.big ?? 1);
    const ball = (x, y, r, a) => { const gr = ctx.createRadialGradient(x - r * .35, y - r * .4, r * .05, x, y, r); gr.addColorStop(0, rgb([1, 1, 1], a)); gr.addColorStop(.3, rgb(col, a * .55)); gr.addColorStop(1, rgb(col.map(v => v * .5), a * .8)); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); };
    if (m < 1) for (let j = 0; j < k; j++) { const a = j / k * TAU + g, d = (1 - m) * (70 + 30 * j); ball(cx + Math.cos(a) * d, cy + Math.sin(a) * d, rr, .8); }
    else ball(cx, cy + fall * fall * 520, rr * Math.cbrt(k) * (1 + .1 * Math.sin(u * 40)), .85 * (1 - fall * .6));
  }
}
shot('separator', 6, (ctx, t) => {
  const iy = y => 250 + 14 * Math.sin(y / 160 + t * 1.4) + 8 * Math.sin(y / 61 - t * 2.1), wy = x => 860 + 8 * Math.sin(x / 210 + t * .7);
  ctx.fillStyle = vgrad(ctx, 200, 900, ['#9a6a22', '#4a2c0c', '#22140a']); ctx.fillRect(0, 0, W, H);
  // far end of the vessel
  ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.lineWidth = 70; ctx.beginPath(); ctx.ellipse(W / 2, 560, 620 + t * 22, 430 + t * 15, 0, 0, TAU); ctx.stroke(); ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(W / 2, 560, 600 + t * 22, 410 + t * 15, 0, 0, TAU); ctx.fill();
  // gas space above a restless interface
  ctx.fillStyle = vgrad(ctx, 0, 280, ['#7f8f88', '#c9d6cf']); ctx.beginPath(); ctx.moveTo(0, 0); for (let x = 0; x <= W; x += 24) ctx.lineTo(x, iy(x)); ctx.lineTo(W, 0); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,245,.85)'; ctx.lineWidth = 5; ctx.beginPath(); for (let x = 0; x <= W; x += 24) x ? ctx.lineTo(x, iy(x)) : ctx.moveTo(x, iy(x)); ctx.stroke();
  ctx.fillStyle = vgrad(ctx, 250, 420, ['rgba(255,220,150,.3)', 'rgba(255,220,150,0)']); ctx.fillRect(0, 250, W, 170);
  // water settling below
  ctx.fillStyle = vgrad(ctx, 850, H, ['#1d3a4a', '#0b1a24']); ctx.beginPath(); ctx.moveTo(0, H); for (let x = 0; x <= W; x += 30) ctx.lineTo(x, wy(x)); ctx.lineTo(W, H); ctx.fill();
  // gas bubbles rising, water droplets sinking
  const R = rng(22); for (let i = 0; i < 70; i++) { const u = (R() + t * (.18 + R() * .2)) % 1, x = R() * W + Math.sin(t * 2 + i) * 10, y = 900 - u * 640, r = 3 + R() * 9; ctx.fillStyle = `rgba(255,250,230,${.5 * (1 - u * .5)})`; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
  for (let i = 0; i < 40; i++) { const u = (R() + t * (.1 + R() * .1)) % 1, x = R() * W, y = 300 + u * 560; ctx.fillStyle = `rgba(110,170,220,${.6 * u})`; ctx.beginPath(); ctx.arc(x, y, 3 + R() * 6, 0, TAU); ctx.fill(); }
  rush(ctx, t, { n: 60, speed: lerp(1.2, .12, smooth(t / 1.6)), a: .25 * (1 - smooth(t / 2.2)) + .05, color: [1, .85, .6], len: 90 });
  // the oil outlet approaches
  const k = ease((t - 2.6) / 3.4), r = 26 + k * k * 1500, ox = lerp(1240, W / 2, k), oy = lerp(640, H / 2, k);
  ctx.fillStyle = '#050403'; ctx.beginPath(); ctx.arc(ox, oy, r, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(210,200,180,.6)'; ctx.lineWidth = 6 + 18 * k; ctx.stroke();
}, { fi: .1, snd: [['vessel', 1], ['hiss', .18]] });

shot('treat', 3, (ctx, t) => {
  ctx.fillStyle = vgrad(ctx, 0, H, ['#7a4f18', '#2a1808']); ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 5; i++) { ctx.fillStyle = `rgba(255,230,170,${.05 + .04 * Math.sin(t * 9 + i)})`; ctx.fillRect(260 + i * 350, 0, 10, H); }
  coalesce(ctx, t + 2, { n: 13, big: 1.7 }); fines(ctx, t, { n: 60, seed: 2, a: .3, color: [.6, .8, 1], size: 3, vy: 30 });
}, { fi: .12, fo: .1, snd: [['vessel', .7]] });

shot('pump', 2, (ctx, t) => {
  ctx.fillStyle = '#1c1107'; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(1 + t * .9, 1 + t * .9); glow(ctx, 0, 0, 420, [.9, .55, .15], .9);
  for (let gh = 0; gh < 3; gh++) { ctx.save(); ctx.rotate(t * 16 - gh * .09); ctx.globalAlpha = [.9, .4, .2][gh]; for (let i = 0; i < 7; i++) { ctx.rotate(TAU / 7); const g = ctx.createLinearGradient(0, 0, 700, 0); g.addColorStop(0, '#6a6f75'); g.addColorStop(1, '#16181b'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(120, -10); ctx.quadraticCurveTo(420, -160, 820, 120); ctx.lineTo(800, 200); ctx.quadraticCurveTo(400, -60, 110, 40); ctx.fill(); } ctx.restore(); }
  ctx.fillStyle = '#0a0b0c'; ctx.beginPath(); ctx.arc(0, 0, 90, 0, TAU); ctx.fill(); ctx.restore();
  rush(ctx, t, { n: 90, speed: 1.6, a: .3, color: [1, .8, .5], len: 140 });
}, { fi: .08, fo: .1, snd: [['pumphum', 1]] });

// ---------- export pipeline ----------
const pipeLook = { uRib: .3, uRibW: .05, uLight: .8, uWall: [.32, .21, .10], uWall2: [.09, .055, .022], uFog: [.10, .052, .013], uFogD: .16, uStreak: .16, uSeed: 4 };
shot('pipe_a', 4, (ctx, t) => {
  ctx.save(); shake(ctx, t, 2.2, 10);
  tunnel(ctx, Object.assign({}, pipeLook, { uZ: t * 16, uC: [.75 * Math.sin(t * 1.1), .28 * Math.sin(t * 1.7 + 1)], uTwist: .2 * Math.sin(t * .8) })); ctx.restore();
  rush(ctx, t, { n: 90, speed: 1.5, a: .22, color: [1, .82, .55], len: 150 });
}, { fi: .1, fo: .06, snd: [['piperumble', 1], ['pumphum', .25]] });
shot('pipe_ext', 1.4, (ctx, t) => {
  const gy = 720; exterior(ctx, ['#101a2e', '#3a4a66', '#c98a66', '#f2c08a'], gy, { sun: [1500, gy - 6, 700], sunC: [1, .8, .55], seed: 3, ground: ['#1b1a17', '#0a0907'] });
  ctx.save(); zoomAt(ctx, 1 + .025 * t, 700, 700); ctx.fillStyle = '#08090a';
  ctx.fillRect(200, gy - 150, 330, 150); ctx.beginPath(); ctx.moveTo(190, gy - 150); ctx.lineTo(365, gy - 215); ctx.lineTo(540, gy - 150); ctx.fill();
  for (let i = 0; i < 3; i++) { ctx.fillRect(600 + i * 150, gy - 70, 110, 70); ctx.beginPath(); ctx.arc(655 + i * 150, gy - 70, 34, 0, TAU); ctx.fill(); ctx.fillRect(590 + i * 150, gy - 34, 150, 14); }
  ctx.fillRect(1010, gy - 260, 16, 260); ctx.fillRect(980, gy - 270, 76, 14);
  // right-of-way with markers running to the horizon
  ctx.fillStyle = 'rgba(40,36,30,.9)'; ctx.beginPath(); ctx.moveTo(1040, H); ctx.lineTo(1500, H); ctx.lineTo(1420, gy + 4); ctx.lineTo(1400, gy + 4); ctx.fill();
  ctx.fillStyle = '#08090a'; for (let i = 0; i < 7; i++) { const u = i / 7, x = lerp(1560, 1425, 1 - u * u * .0 - (1 - u)), y = lerp(H - 40, gy + 6, 1 - u), h = lerp(110, 8, 1 - u); ctx.fillRect(lerp(1620, 1424, 1 - u), y - h, lerp(12, 2, 1 - u), h); }
  ctx.restore(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, 364, gy - 120, 200, [1, .85, .6], .5); ctx.globalCompositeOperation = 'source-over';
}, { fi: .06, fo: .06, vig: .4, snd: [['wind', .6], ['pumphum', .7]] });
shot('pipe_b', 3, (ctx, t) => {
  const k = smooth((t - 1.6) / 1.4);
  ctx.save(); shake(ctx, t, 2.2, 10);
  tunnel(ctx, Object.assign({}, pipeLook, { uZ: 90 + t * 16, uC: [.5 * Math.sin(t * 1.3 + 2), .3 * Math.cos(t * 1.1)], uEnd: [.2 * k, .11 * k, .03 * k], uRadius: 1 + .8 * k * k })); ctx.restore();
  rush(ctx, t, { n: 90, speed: 1.5 - k, a: .22, color: [1, .82, .55], len: 150 });
}, { fi: .06, fo: .15, snd: [['piperumble', 1]] });

// ---------- refinery crude tank ----------
shot('tank', 2.2, (ctx, t) => {
  ctx.fillStyle = vgrad(ctx, 0, H, ['#5a3a12', '#1a0f05']); ctx.fillRect(0, 0, W, H);
  glow(ctx, W / 2, -60, 900, [.9, .6, .25], .35); for (let i = 0; i < 8; i++) { ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(i * 280 - 40 + t * 20, 0); ctx.lineTo(i * 280 + 60 + t * 20, H); ctx.stroke(); }
  fines(ctx, t, { n: 90, seed: 6, a: .35, color: [1, .8, .5], size: 3, vy: 50, vx: 30 });
  const k = ease((t - .5) / 1.7), r = 40 + k * k * 1400; ctx.fillStyle = '#040302'; ctx.beginPath(); ctx.arc(lerp(700, W / 2, k), lerp(820, H / 2, k), r, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(200,190,170,.5)'; ctx.lineWidth = 6 + 14 * k; ctx.stroke();
}, { fi: .15, snd: [['vessel', .6], ['pumphum', .5]] });
