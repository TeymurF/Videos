// Shots 3: the refinery (desalter, heater, column, catalyst beds, blending), distribution, the engine, the road.
const STRAW = [.86, .78, .46];

// ---------- desalter: wash water captures the salts, droplets coalesce and leave ----------
shot('desalter', 3.5, (ctx, t) => {
  ctx.fillStyle = vgrad(ctx, 0, H, ['#6a4212', '#22130a']); ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 4; i++) { const y = 260 + i * 150; ctx.fillStyle = `rgba(220,225,230,${.16 + .1 * Math.sin(t * 11 + i * 2)})`; ctx.fillRect(0, y, W, 7); for (let x = 60; x < W; x += 120) ctx.fillRect(x, y - 16, 5, 40); }
  coalesce(ctx, t + 1, { n: 15, big: 1.6, col: [.6, .82, 1], seed: 12 });
  ctx.fillStyle = vgrad(ctx, 900, H, ['rgba(40,90,120,.0)', 'rgba(40,90,120,.9)']); ctx.fillRect(0, 880, W, 200);
  fines(ctx, t, { n: 70, seed: 3, a: .3, color: [.7, .85, 1], size: 3, vy: 40, vx: 60 });
}, { fi: .15, fo: .1, snd: [['vessel', .8], ['buzz', .35]] });

// ---------- fired heater: the crude runs inside the tubes, the flames stay outside ----------
shot('heater', 3.5, (ctx, t) => {
  const k = smooth(t / 3.5);
  ctx.save(); shake(ctx, t, 2.5, 12);
  tunnel(ctx, { uZ: t * 9, uRib: .2, uRibW: .04, uLight: .7, uWall: [.3, .14, .06], uWall2: [.1, .04, .02], uFog: [lerp(.11, .22, k), lerp(.055, .12, k), lerp(.014, .04, k)], uFogD: .15, uGlow: [1, .42, .08], uGlowA: .5 + .5 * k, uTime: t, uC: [.3 * Math.sin(t * 1.2), .1 * Math.sin(t * 2)], uSeed: 12 }); ctx.restore();
  rush(ctx, t, { n: 90, speed: 1.2, a: .25, color: [1, .8, .5], len: 120 });
  orbs(ctx, t, { n: Math.round(40 * k), speed: .8, a: .6 * k, size: 50, col: [1, .9, .7], seed: 4 });
}, { fi: .1, fo: .1, snd: [['rush', .7], ['furnace', 1]] });

// ---------- atmospheric column: the naphtha fraction rises as vapour through the trays, then condenses ----------
shot('column', 7, (ctx, t) => {
  const up = smooth(t / 5), cond = smooth((t - 4.8) / 2);
  const c0 = [lerp(.74, .70, up), lerp(.50, .68, up), lerp(.24, .60, up)], c1 = [lerp(.34, .42, up), lerp(.19, .40, up), lerp(.07, .36, up)];
  ctx.fillStyle = vgrad(ctx, 0, H, [rgb(c0), rgb(c1)]); ctx.fillRect(0, 0, W, H);
  glow(ctx, W / 2, H / 2, 800, [1, .92, .8], .35);
  { const wg = ctx.createRadialGradient(W / 2, H / 2 - 40, 380, W / 2, H / 2 - 40, 1150); wg.addColorStop(0, 'rgba(12,12,14,0)'); wg.addColorStop(1, 'rgba(12,12,14,.8)'); ctx.fillStyle = wg; ctx.fillRect(0, 0, W, H); }   // column wall
  // perforated trays approach from above and pass
  for (let k = 0; k < 4; k++) {
    const d = ((k / 4 - t * .34) % 1 + 1) % 1, s = 1 / (.05 + d * 1.15), a = Math.min(1, d * 6) * Math.min(1, (1 - d) * 3) * (1 - cond);
    if (a <= 0) continue; ctx.save(); ctx.translate(W / 2, H / 2 - 40); ctx.scale(s, s * .92); ctx.globalAlpha = a * .92;
    const pg = ctx.createRadialGradient(0, -80, 60, 0, 0, 640); pg.addColorStop(0, '#4a4f56'); pg.addColorStop(1, '#1d2024'); ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(0, 0, 620, 0, TAU);
    ctx.moveTo(150, 0); ctx.arc(0, 0, 150, 0, TAU, true);
    for (let i = 0; i < 14; i++) { const an = i / 14 * TAU + k, rr = 260 + (i % 3) * 110; ctx.moveTo(Math.cos(an) * rr + 30, Math.sin(an) * rr); ctx.arc(Math.cos(an) * rr, Math.sin(an) * rr, 30, 0, TAU, true); }
    ctx.fill('evenodd'); ctx.strokeStyle = 'rgba(255,210,140,.6)'; ctx.lineWidth = 6 / s + 2; ctx.beginPath(); ctx.arc(0, 0, 150, 0, TAU); ctx.stroke();
    ctx.restore();
  }
  // froth and falling liquid on the way; vapour streaks upward
  orbs(ctx, t, { n: 34, speed: .5, a: .45 * (1 - cond), size: 34, col: [1, .85, .55], seed: 15 });
  rush(ctx, t, { n: 80, speed: .9, a: .22 * (1 - cond), color: [1, .97, .9], len: 110 });
  // overhead condenser: cold tubes, droplets form, the view turns to clear liquid
  if (cond > 0) {
    ctx.globalAlpha = cond; ctx.fillStyle = vgrad(ctx, 0, H, ['#aeb5ad', '#6f776f']); ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 5; i++) { const y = 150 + i * 190 + 30 * Math.sin(i * 2), g = ctx.createLinearGradient(0, y - 46, 0, y + 46); g.addColorStop(0, '#2b3238'); g.addColorStop(.35, '#aab6c0'); g.addColorStop(1, '#161a1e'); ctx.fillStyle = g; ctx.fillRect(0, y - 46, W, 92); const R = rng(i + 3); for (let q = 0; q < 16; q++) { const x = R() * W, u = (R() + t * .5) % 1, r = 6 + 16 * u; ctx.fillStyle = `rgba(250,240,190,${.85 * cond})`; ctx.beginPath(); ctx.ellipse(x, y + 46 + u * u * 120, r * .7, r, 0, 0, TAU); ctx.fill(); } }
    ctx.fillStyle = rgb(STRAW, .55 * smooth((t - 5.8) / 1.2)); ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
  }
}, { fi: .12, fo: .2, snd: [['vapor', 1], ['furnace', .25]], events: s => [{ t: 5.2, type: 'trickle' }] });

// ---------- hydrotreating and reforming: through the catalyst beds with hydrogen ----------
shot('hydrotreat', 4, (ctx, t) => {
  ctx.save(); shake(ctx, t, 1.5, 10);
  pore(ctx, camZ(3 + t * 1.0, { sway: .05 }), ROCK.cat, { uFog: [.17, .16, .10], uFogD: .3 }); ctx.restore();
  rush(ctx, t, { n: 60, speed: .7, a: .22, color: [1, .98, .85], len: 70 });
  orbs(ctx, t, { n: 46, speed: .9, a: .5, size: 16, col: [.9, .97, 1], seed: 31 });
}, { fi: .15, fo: .12, snd: [['rush', .6], ['compressor', .9]] });
shot('reform', 3.5, (ctx, t) => {
  ctx.save(); shake(ctx, t, 1.5, 10);
  pore(ctx, camZ(40 + t * 1.1, { sway: .05 }), ROCK.cat, { uGA: [.66, .62, .56], uGB: [.44, .42, .40], uFog: [.26, .2, .1], uFogD: .28, uLightC: [1, .86, .6], uSeed: 77, uRough: .01 }); ctx.restore();
  rush(ctx, t, { n: 60, speed: .8, a: .22, color: [1, .95, .75], len: 70 });
  orbs(ctx, t, { n: 40, speed: 1, a: .45, size: 14, col: [.9, .97, 1], seed: 33 });
}, { fi: .12, fo: .12, snd: [['rush', .6], ['compressor', 1]] });

// ---------- blending manifold: components join to make finished gasoline ----------
shot('blend', 5, (ctx, t) => {
  const k = smooth(t / 4.2);
  tunnel(ctx, { uZ: t * 5, uRib: .3, uRibW: .04, uLight: 1.15, uWall: [.46, .46, .44], uWall2: [.2, .2, .2], uFog: STRAW.map(v => v * .5), uFogD: .13, uWetW: .7, uSeed: 21 });
  const cols = [[1, .93, .5], [.95, .7, .3], [.8, .95, .7], [.95, .97, 1]];
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.globalCompositeOperation = 'screen';
  ctx.filter = 'blur(22px)'; ctx.lineCap = 'round';
  cols.forEach((c, i) => { for (let seg = 0; seg < 6; seg++) { ctx.strokeStyle = rgb(c, .55 * (1 - k * .9)); ctx.lineWidth = lerp(190, 30, (seg + .5) / 6); ctx.beginPath(); for (let q = 0; q <= 14; q++) { const u = (seg + q / 14) / 6, an = i * TAU / 4 + u * 5.5 + t * 1.6 + .3 * Math.sin(u * 9 + t * 3 + i), r = lerp(1150, 30, u); q ? ctx.lineTo(Math.cos(an) * r, Math.sin(an) * r * .8) : ctx.moveTo(Math.cos(an) * r, Math.sin(an) * r * .8); } ctx.stroke(); } });
  ctx.filter = 'none';
  ctx.restore();
  ctx.fillStyle = rgb(STRAW, .28 * k); ctx.fillRect(0, 0, W, H);
  rush(ctx, t, { n: 70, speed: .8, a: .2, color: [1, 1, .9], len: 90 });
}, { fi: .12, fo: .12, snd: [['rush', .6], ['mix', 1]] });

// ---------- product tank: a pale, clear gasoline blend ----------
function paleBody(ctx, t, top = '#f2e6a0', bot = '#a58f3a') {
  ctx.fillStyle = vgrad(ctx, 0, H, [top, bot]); ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalCompositeOperation = 'screen'; for (let i = 0; i < 9; i++) { ctx.strokeStyle = `rgba(255,255,235,${.18 + .1 * Math.sin(t * 2 + i)})`; ctx.lineWidth = 14; ctx.beginPath(); for (let x = -40; x <= W + 40; x += 40) { const y = 130 + i * 26 + 22 * Math.sin(x / 150 + t * 1.6 + i * 1.3) + 10 * Math.sin(x / 47 - t * 2); x < 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); } ctx.restore();
}
shot('ptank', 2, (ctx, t) => {
  paleBody(ctx, t); fines(ctx, t, { n: 40, seed: 8, a: .35, color: [1, 1, .9], size: 3, vy: -20 });
  const k = ease((t - .5) / 1.5), r = 34 + k * k * 1400; ctx.fillStyle = '#231d08'; ctx.beginPath(); ctx.arc(lerp(1200, W / 2, k), lerp(760, H / 2, k), r, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(255,250,220,.6)'; ctx.lineWidth = 6 + 14 * k; ctx.stroke();
}, { fi: .12, snd: [['vessel', .5], ['pumphum', .6]] });

// ---------- road tanker at golden hour ----------
shot('tanker', 1.6, (ctx, t) => {
  const gy = 760; exterior(ctx, ['#2a3f66', '#8a8fa6', '#f0b070', '#ffd9a0'], gy, { sun: [1450, gy - 40, 800], sunC: [1, .86, .6], seed: 5, far: '#3a3340', ground: ['#2a2622', '#0c0a09'] });
  ctx.fillStyle = '#1b1a19'; ctx.fillRect(0, gy + 40, W, 130); ctx.fillStyle = 'rgba(240,220,170,.5)'; for (let x = -200 + ((t * -900) % 240); x < W; x += 240) ctx.fillRect(x, gy + 100, 110, 8);
  ctx.save(); ctx.translate(1500 - t * 520, gy + 60); ctx.fillStyle = '#0a0a0b';
  ctx.beginPath(); ctx.roundRect(-430, -190, 600, 150, 70); ctx.fill(); ctx.fillRect(-440, -60, 640, 26); ctx.beginPath(); ctx.roundRect(200, -200, 150, 170, 18); ctx.fill(); ctx.fillRect(170, -60, 200, 26);
  for (const wx of [-360, -280, -40, 40, 300]) { ctx.beginPath(); ctx.arc(wx, -18, 40, 0, TAU); ctx.fill(); }
  ctx.fillStyle = 'rgba(255,230,180,.75)'; ctx.fillRect(250, -180, 80, 60); ctx.restore();
}, { fi: .06, fo: .06, vig: .4, snd: [['wind', .6], ['truck', 1]] });

// ---------- unloading hose into the station's underground tank ----------
shot('hose', 2.5, (ctx, t) => {
  ctx.save(); shake(ctx, t, 2, 12);
  tunnel(ctx, { uZ: t * 8, uRib: 1.1, uRibW: .12, uLight: 1.1, uWall: [.2, .2, .19], uWall2: [.07, .07, .07], uFog: STRAW.map(v => v * .62), uFogD: .2, uC: [.6 * Math.sin(t * 1.4), .3 * Math.cos(t * 1.1)], uSeed: 31 }); ctx.restore();
  rush(ctx, t, { n: 80, speed: 1.1, a: .25, color: [1, 1, .9], len: 110 });
}, { fi: .1, fo: .08, snd: [['flow', 1]], events: s => [{ t: .05, type: 'click' }] });

// ---------- the service station ----------
shot('station', 1.4, (ctx, t) => {
  const gy = 780; exterior(ctx, ['#0d1730', '#39446b', '#c0806a', '#f0b890'], gy, { sun: [300, gy - 20, 600], seed: 8, ground: ['#1c1b1c', '#08080a'] });
  ctx.save(); zoomAt(ctx, 1 + .025 * t, 900, 700); ctx.fillStyle = '#07080a';
  ctx.fillRect(520, gy - 330, 900, 42); for (const x of [600, 960, 1320]) ctx.fillRect(x - 12, gy - 290, 24, 290);
  for (const x of [760, 1140]) { ctx.fillRect(x - 34, gy - 150, 68, 150); ctx.fillRect(x + 30, gy - 110, 34, 8); }
  // a car at the pump
  ctx.beginPath(); ctx.moveTo(840, gy - 14); ctx.lineTo(850, gy - 70); ctx.lineTo(910, gy - 80); ctx.lineTo(950, gy - 130); ctx.lineTo(1050, gy - 130); ctx.lineTo(1090, gy - 80); ctx.lineTo(1120, gy - 70); ctx.lineTo(1126, gy - 14); ctx.fill(); for (const x of [900, 1070]) { ctx.beginPath(); ctx.arc(x, gy - 14, 26, 0, TAU); ctx.fill(); }
  ctx.restore();
  ctx.globalCompositeOperation = 'lighter'; for (const x of [690, 880, 1070, 1250]) { const g = ctx.createLinearGradient(0, gy - 290, 0, gy); g.addColorStop(0, 'rgba(255,240,210,.5)'); g.addColorStop(1, 'rgba(255,240,210,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - 20, gy - 290); ctx.lineTo(x + 20, gy - 290); ctx.lineTo(x + 130, gy); ctx.lineTo(x - 130, gy); ctx.fill(); } ctx.globalCompositeOperation = 'source-over';
}, { fi: .06, fo: .06, vig: .4, snd: [['wind', .5], ['pumphum', .5]] });

// ---------- through the nozzle into the car's tank ----------
shot('nozzle', 3, (ctx, t) => {
  if (t < 1.1) {
    ctx.save(); shake(ctx, t, 2.5, 14);
    tunnel(ctx, { uZ: t * 9, uRib: .0, uLight: 1.3, uWall: [.6, .6, .58], uWall2: [.25, .25, .25], uFog: STRAW.map(v => v * .6), uFogD: .12, uEnd: [.05, .05, .06], uRadius: .9, uWetW: .9, uSeed: 5 }); ctx.restore();
    rush(ctx, t, { n: 80, speed: 1.4, a: .3, color: [1, 1, .9], len: 120 });
  } else {
    const u = t - 1.1, fall = clamp(u / .7), sub = smooth((u - .7) / .5), sy = lerp(1500, 420, fall * fall) - 420 * sub;
    ctx.fillStyle = vgrad(ctx, 0, H, ['#0b0b0c', '#1a1a1c']); ctx.fillRect(0, 0, W, H); glow(ctx, W / 2, -100, 700, [1, .95, .8], .3 * (1 - sub));
    // the fuel surface comes up to meet the falling stream
    ctx.save(); shake(ctx, t, 6 * (1 - Math.abs(fall - .9)), 18);
    ctx.fillStyle = vgrad(ctx, sy, sy + 900, ['#f0e298', '#8f7a2c']); ctx.beginPath(); ctx.moveTo(0, H + 400); for (let x = 0; x <= W; x += 30) ctx.lineTo(x, sy + (40 * (1 - sub) + 14) * Math.sin(x / 170 + t * 6) + 18 * Math.sin(x / 61 - t * 9)); ctx.lineTo(W, H + 400); ctx.fill();
    ctx.restore();
    if (fall < 1) { rush(ctx, t, { n: 70, speed: 2, a: .4, color: [1, .98, .85], len: 180 }); }
    if (sub > 0) { ctx.globalAlpha = sub; paleBody(ctx, t, '#e8dc92', '#8f7a2c'); ctx.globalAlpha = 1; const R = rng(9); for (let i = 0; i < 70; i++) { const q = (R() + u * (.5 + R())) % 1, x = R() * W + Math.sin(t * 5 + i) * 12, y = H - q * (H + 100); ctx.fillStyle = `rgba(255,255,240,${.6 * sub * (1 - q)})`; ctx.beginPath(); ctx.arc(x, y, 4 + R() * 14, 0, TAU); ctx.fill(); } }
  }
}, { fi: .08, fo: .12, snd: [['flow', 1], ['slosh', .9]], events: s => [{ t: 2.75, type: 'click' }] });

// ---------- fuel line, pump, rail ----------
shot('fuelline', 3, (ctx, t) => {
  const hp = smooth((t - 1.6) / 1.2);
  ctx.save(); shake(ctx, t, 1.5 + 4 * hp, 16);
  tunnel(ctx, { uZ: t * 9 + hp * t * 10, uRib: .7, uRibW: .04, uLight: .95, uWall: [.55, .5, .3], uWall2: [.2, .18, .09], uFog: STRAW.map(v => v * .6), uFogD: .2, uRadius: lerp(.8, .55, hp), uC: [.4 * Math.sin(t * 2), .25 * Math.sin(t * 1.3)], uWetW: .8, uSeed: 8 }); ctx.restore();
  rush(ctx, t, { n: 90, speed: 1.4 + 2 * hp, a: .3, color: [1, 1, .9], len: 140 });
  const m = t > .9 && t < 1.25 ? 1 - Math.abs((t - 1.075) / .175) : 0; if (m > 0) { ctx.strokeStyle = `rgba(30,30,32,${m})`; ctx.lineWidth = 4 + 10 * m; for (let x = -W; x < 2 * W; x += 60 + 200 * (t - .9)) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); } for (let y = -H; y < 2 * H; y += 60 + 200 * (t - .9)) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); } }
}, { fi: .1, fo: .06, snd: [['whirr', 1], ['flow', .5]] });

// ---------- the cylinder ----------
function cylinder(ctx, t, pis, tint) {   // inside the combustion chamber, looking across at the piston crown
  ctx.fillStyle = vgrad(ctx, 0, H, ['#16181b', '#0a0b0c']); ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(W / 2, 330, 40, W / 2, 400, 1000); g.addColorStop(0, rgb(tint, .5)); g.addColorStop(1, rgb(tint, 0)); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // cylinder head: valves and the spark plug
  ctx.fillStyle = '#25282c'; ctx.beginPath(); ctx.ellipse(W / 2, 150, 900, 150, 0, 0, TAU); ctx.fill();
  for (const x of [-420, 420]) { ctx.fillStyle = '#34383d'; ctx.beginPath(); ctx.ellipse(W / 2 + x, 180, 230, 70, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = '#0c0d0f'; ctx.lineWidth = 6; ctx.stroke(); }
  ctx.fillStyle = '#b9bcc0'; ctx.fillRect(W / 2 - 14, 150, 28, 70); ctx.fillStyle = '#5a5d61'; ctx.fillRect(W / 2 - 30, 216, 44, 10);
  // piston crown rising from below
  const py = lerp(1250, 640, pis); ctx.fillStyle = vgrad(ctx, py - 150, py + 300, ['#5a5e64', '#1b1d20']); ctx.beginPath(); ctx.ellipse(W / 2, py, 1050, 190, 0, 0, TAU); ctx.fill(); ctx.fillRect(0, py, W, H);
  ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(W / 2, py, 1050, 190, 0, Math.PI, TAU); ctx.stroke();
}
shot('inject', 2.2, (ctx, t) => {
  cylinder(ctx, t, lin(t, 0, 2.2) * .3, [.5, .55, .6]);
  // fine spray fanning out from the injector
  const R = rng(3), n = Math.round(700 * lin(t, .25, 1.3));
  for (let i = 0; i < n; i++) { const an = Math.PI / 2 + (R() - .5) * 1.5, life = (R() + (t - .25) * (1 + R())) % 1, d = life * (500 + R() * 500), x = W / 2 + 70 + Math.cos(an) * d * 1.3, y = 235 + Math.sin(an) * d, r = (5 - 3.5 * life) * (.5 + R()); ctx.fillStyle = rgb(STRAW, .75 * (1 - life)); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
  ctx.fillStyle = rgb(STRAW, .12 * lin(t, .6, 1.4)); ctx.fillRect(0, 0, W, H);
}, { fi: .06, snd: [['whirr', .3]], events: s => [.25, .5, .75, 1.0, 1.25, 1.5].map(x => ({ t: x, type: 'tick' })) });
shot('compress', 2.2, (ctx, t) => {
  const k = ease(t / 2.2);
  ctx.save(); zoomAt(ctx, 1 + .12 * k, W / 2, 380); cylinder(ctx, t, .3 + .7 * k, [lerp(.5, .9, k), lerp(.55, .7, k), lerp(.6, .45, k)]); ctx.restore();
  // the fuel-air mixture swirls and tightens
  const R = rng(5); for (let i = 0; i < 380; i++) { const a = R() * TAU + t * (1.5 + R()), r = (120 + R() * 700) * (1 - .45 * k); ctx.fillStyle = rgb(STRAW, .16 + .1 * k); ctx.beginPath(); ctx.arc(W / 2 + Math.cos(a) * r * 1.2, 400 + Math.sin(a) * r * .35 * (1 - .4 * k), 3 + R() * 5, 0, TAU); ctx.fill(); }
  ctx.fillStyle = `rgba(0,0,0,${.25 * k})`; ctx.fillRect(0, 0, W, H);
}, { snd: [['whirr', .3]], events: s => [{ t: .1, type: 'thud' }] });
shot('combust', 4.2, (ctx, t) => {
  const sp = .45, e = Math.max(0, t - sp), fr = 1 - Math.exp(-e * 1.15), rad = fr * 1500, ex = smooth((t - 2.3) / 1.9);
  ctx.save(); shake(ctx, t, 10 * Math.exp(-Math.abs(t - 1.4) * 1.6), 20); zoomAt(ctx, 1.12, W / 2, 380);
  cylinder(ctx, t, 1 - .7 * ex, [.9, .7, .45]);
  if (t > sp - .12 && t < sp + .25) { ctx.strokeStyle = '#dff'; ctx.lineWidth = 5; ctx.shadowColor = '#9cf'; ctx.shadowBlur = 40; ctx.beginPath(); ctx.moveTo(W / 2 - 4, 220); ctx.lineTo(W / 2 + 6 * Math.sin(t * 90), 236); ctx.lineTo(W / 2 - 8, 250); ctx.stroke(); ctx.shadowBlur = 0; }
  if (e > 0) {
    // the flame front: a wrinkled, fast-moving surface; hot gases behind it
    const N = 90, cx = W / 2, cy = 250;
    const path = k => { ctx.beginPath(); for (let i = 0; i <= N; i++) { const a = i / N * TAU, r = rad * k * (1 + .12 * Math.sin(a * 7 + t * 9) + .08 * Math.sin(a * 13 - t * 14) + .05 * vnoise(a * 9 + t * 6, 3)); const x = cx + Math.cos(a) * r * 1.25, y = cy + Math.sin(a) * r * .9; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.closePath(); };
    const b = Math.pow(1 - ex, 1.4), hot = Math.exp(-e * 1.2);
    ctx.filter = 'blur(26px)'; path(1); ctx.fillStyle = `rgba(${lerp(90, 225, b) | 0},${lerp(40, 96, b) | 0},${lerp(20, 22, b) | 0},${.5 + .45 * b})`; ctx.fill();
    path(.8); ctx.fillStyle = `rgba(255,178,70,${.7 * b * (.35 + .65 * hot)})`; ctx.fill();
    path(.5); ctx.fillStyle = `rgba(255,240,200,${.85 * hot * b})`; ctx.fill();
    ctx.filter = 'blur(10px)'; path(1.01); ctx.strokeStyle = `rgba(110,160,255,${.9 * b})`; ctx.lineWidth = 26; ctx.stroke(); ctx.filter = 'none';
    const RR = rng(8); for (let i = 0; i < 60; i++) { const a2 = RR() * TAU, r2 = rad * (.2 + .75 * RR()), x2 = cx + Math.cos(a2 + t * .5) * r2 * 1.25, y2 = cy + Math.sin(a2 + t * .5) * r2 * .9; glow(ctx, x2, y2, 60 + 80 * RR(), [1, .85, .55], .25 * b * hot + .05 * b); }
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.restore();
  if (e > 0 && ex > 0) rush(ctx, t, { n: 80, speed: .6, a: .2 * ex, color: [1, .7, .4], len: 90 });
}, { fo: .15, snd: [], events: s => [{ t: .45, type: 'spark' }, { t: .62, type: 'burn' }] });

// ---------- exhaust: through the catalytic converter honeycomb ----------
shot('exhaust', 2.6, (ctx, t) => {
  const k = smooth((t - 1.0) / .7);
  ctx.save(); shake(ctx, t, 3, 16);
  tunnel(ctx, { uZ: t * 14, uRib: k > .5 ? 0 : .25, uLight: 1, uWall: k > .5 ? [.5, .43, .36] : [.26, .25, .25], uWall2: k > .5 ? [.26, .2, .16] : [.1, .1, .1], uFog: [.3, .29, .28], uFogD: .16, uSq: k > .5 ? 1 : 0, uGlow: [1, .5, .2], uGlowA: .25 * k, uTime: t, uSeed: 14 }); ctx.restore();
  // the honeycomb face rushes up before we enter one cell
  const g = t > .55 && t < 1.35 ? (t - .55) / .8 : -1; if (g >= 0) { const s = 26 + g * g * 2600; ctx.strokeStyle = `rgba(40,34,30,${Math.min(1, g * 3)})`; ctx.lineWidth = s * .16; for (let x = W / 2 - s / 2 - 12 * s; x < W + s; x += s) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); } for (let y = H / 2 - s / 2 - 8 * s; y < H + s; y += s) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); } }
  rush(ctx, t, { n: 90, speed: 1.8, a: .25, color: [1, .98, .95], len: 150 });
}, { fi: .1, fo: .06, snd: [['engine', 1], ['exhaustgas', .8]] });

// ---------- motion: crankshaft, wheel, the road ----------
shot('crank', 1.7, (ctx, t) => {
  ctx.fillStyle = vgrad(ctx, 0, H, ['#1b1d20', '#08090a']); ctx.fillRect(0, 0, W, H); glow(ctx, W / 2, 300, 900, [1, .9, .75], .14);
  for (let j = 0; j < 4; j++) { const cx = 300 + j * 440, cy = 640, a = t * 22 + j * Math.PI / 2 * (j % 2 ? 1 : 3);
    for (let gh = 0; gh < 3; gh++) { const aa = a - gh * .12, px = cx + Math.cos(aa) * 110, py = cy + Math.sin(aa) * 110; ctx.globalAlpha = [1, .35, .15][gh];
      ctx.strokeStyle = '#70757b'; ctx.lineWidth = 46; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(cx + Math.cos(aa) * 30, py - 420); ctx.stroke();
      ctx.fillStyle = '#3c4045'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, 210, aa + Math.PI - .9, aa + Math.PI + .9); ctx.fill(); ctx.fillStyle = '#8f949a'; ctx.beginPath(); ctx.arc(px, py, 52, 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 1; steelV(ctx, cx - 60, py0(), 120, 150, { b: 1.1 }); function py0() { return cy + Math.sin(a) * 110 - 560; }
  }
  ctx.fillStyle = '#5a5e64'; ctx.fillRect(0, 610, W, 60); ctx.fillStyle = 'rgba(255,255,255,.1)'; ctx.fillRect(0, 618, W, 8);
}, { fi: .06, fo: .06, snd: [['engine', 1]] });
shot('wheel', 1.6, (ctx, t) => {
  ctx.fillStyle = vgrad(ctx, 0, 700, ['#8fb4d6', '#dfe9ef']); ctx.fillRect(0, 0, W, H); glow(ctx, 1500, 200, 700, [1, 1, .9], .7);
  ctx.fillStyle = vgrad(ctx, 760, H, ['#4a4b4d', '#2a2b2c']); ctx.fillRect(0, 760, W, 320);
  const R = rng(2); for (let i = 0; i < 90; i++) { const y = 770 + R() * 300, sp = (y - 700) * 9, x = ((R() * W * 2 - t * sp) % (W + 400) + W + 400) % (W + 400) - 200; const v = R() > .5 ? 225 : 18; ctx.fillStyle = `rgba(${v},${v},${v},.3)`; ctx.fillRect(x, y, 60 + (y - 760) * .5, 3); }
  ctx.fillStyle = '#16171a'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(W, 0); ctx.lineTo(W, 330); ctx.quadraticCurveTo(1500, 330, 1420, 520); ctx.lineTo(500, 520); ctx.quadraticCurveTo(420, 330, 0, 330); ctx.fill();
  ctx.save(); ctx.translate(960, 640 + 3 * Math.sin(t * 40)); ctx.fillStyle = '#0d0d0e'; ctx.beginPath(); ctx.arc(0, 0, 330, 0, TAU); ctx.fill();
  for (let gh = 0; gh < 4; gh++) { ctx.save(); ctx.rotate(t * 30 - gh * .1); ctx.globalAlpha = [.9, .4, .25, .15][gh]; ctx.fillStyle = '#b9bec4'; ctx.beginPath(); ctx.arc(0, 0, 210, 0, TAU); ctx.fill(); ctx.fillStyle = '#17181a'; for (let i = 0; i < 5; i++) { ctx.rotate(TAU / 5); ctx.beginPath(); ctx.moveTo(40, 30); ctx.lineTo(190, 60); ctx.lineTo(190, -60); ctx.lineTo(40, -30); ctx.fill(); } ctx.restore(); }
  ctx.fillStyle = '#2a2c2f'; ctx.beginPath(); ctx.arc(0, 0, 50, 0, TAU); ctx.fill(); ctx.restore();
}, { fi: .06, fo: .06, vig: .35, snd: [['engine', .8], ['tires', 1]] });
shot('drive', 5.8, (ctx, t) => {
  const hy = 470, k = smooth(t / 5.8), far = lerp(.0, 1, k);
  ctx.fillStyle = vgrad(ctx, 0, hy, ['#5f9fd6', '#bcd9ee', '#f4efe0']); ctx.fillRect(0, 0, W, hy); glow(ctx, 1380, 260, 900, [1, 1, .92], .8);
  ctx.fillStyle = '#6f8f5a'; ctx.beginPath(); ctx.moveTo(0, hy); for (let x = 0; x <= W; x += 40) ctx.lineTo(x, hy - 24 - 18 * Math.sin(x / 300 + 1) - 8 * Math.sin(x / 90)); ctx.lineTo(W, hy); ctx.fill();
  ctx.fillStyle = vgrad(ctx, hy, H, ['#9aa66a', '#5f7a3c']); ctx.fillRect(0, hy, W, H - hy);
  // the road, its markings sliding toward the viewer
  ctx.fillStyle = vgrad(ctx, hy, H, ['#77787a', '#3b3c3e']); ctx.beginPath(); ctx.moveTo(930, hy); ctx.lineTo(990, hy); ctx.lineTo(1700, H); ctx.lineTo(220, H); ctx.fill();
  for (let i = 0; i < 12; i++) { const u = ((i / 12 + t * .9) % 1), y = hy + u * u * (H - hy), w = 4 + u * u * 26; ctx.fillStyle = 'rgba(245,240,225,.9)'; ctx.fillRect(960 - w / 2, y, w, 10 + u * u * 90); }
  for (let i = 0; i < 8; i++) for (const sd of [-1, 1]) { const u = ((i / 8 + t * .9) % 1), y = hy + u * u * (H - hy), x = 960 + sd * (40 + u * u * 900), h = 10 + u * u * 190; ctx.fillStyle = '#2a2a2a'; ctx.fillRect(x - 3, y - h, 6 + u * 6, h); }
  // the car drives away
  const s = lerp(1.25, .09, ease(t / 5.4)), cy = lerp(880, hy + 8, ease(t / 5.4));
  ctx.save(); ctx.translate(960, cy); ctx.scale(s, s); ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(0, 6, 300, 40, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#b3272a'; ctx.beginPath(); ctx.roundRect(-250, -210, 500, 200, 40); ctx.fill(); ctx.fillStyle = '#8c1d20'; ctx.beginPath(); ctx.moveTo(-190, -210); ctx.lineTo(-150, -340); ctx.lineTo(150, -340); ctx.lineTo(190, -210); ctx.fill();
  ctx.fillStyle = '#243240'; ctx.beginPath(); ctx.moveTo(-160, -220); ctx.lineTo(-130, -322); ctx.lineTo(130, -322); ctx.lineTo(160, -220); ctx.fill(); ctx.fillStyle = '#ff5a4a'; ctx.fillRect(-240, -170, 80, 34); ctx.fillRect(160, -170, 80, 34); ctx.fillStyle = '#16171a'; ctx.fillRect(-260, -50, 520, 40); ctx.fillRect(-230, -30, 80, 46); ctx.fillRect(150, -30, 80, 46);
  ctx.restore();
  ctx.fillStyle = `rgba(255,252,240,${.25 * far})`; ctx.fillRect(0, 0, W, H);
}, { fi: .1, fo: 1.4, vig: .3, grain: .09, snd: [['engine', .7], ['tires', .8], ['outdoor', 1]] });
