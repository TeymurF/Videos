// Shots 1: prehistoric sea, burial, oil generation, migration, the trap, waiting in the pore.

// ---------- prehistoric sea: plankton settle into dark mud ----------
shot('sea', 8, (ctx, t) => {
  const d = smooth(t / 5.2), bed = lerp(H + 260, 760, smooth((t - 3) / 2.6)) - 150 * smooth((t - 5.6) / 2.4);
  ctx.fillStyle = vgrad(ctx, 0, H, [rgb([lerp(.30, .02, d), lerp(.72, .13, d), lerp(.78, .2, d)]), rgb([lerp(.05, .01, d), lerp(.3, .06, d), lerp(.42, .11, d)])]); ctx.fillRect(0, 0, W, H);
  // light shafts fading with depth
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 7; i++) { const x = 200 + i * 260 + 40 * Math.sin(t * .4 + i), w = 70 + 40 * Math.sin(i * 2.1 + t * .3), g = ctx.createLinearGradient(0, 0, 0, 900); g.addColorStop(0, `rgba(190,255,250,${.16 * (1 - d)})`); g.addColorStop(1, 'rgba(190,255,250,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x, -20); ctx.lineTo(x + w, -20); ctx.lineTo(x + w + 260, 900); ctx.lineTo(x + 180, 900); ctx.fill(); }
  ctx.restore();
  // marine snow and plankton; the camera sinks, then they settle
  const R = rng(7), cam = 520 * (t < 5.2 ? t - t * t / 10.4 : 2.6);
  for (let i = 0; i < 300; i++) {
    const z = .25 + R() * .75, x0 = R() * W, y0 = R() * 2400 - 600, ph = R() * TAU, big = R() < .08;
    let y = ((y0 - cam * z * 1.6 + t * 26 * z) % 2000 + 2000) % 2000 - 300; const x = x0 + Math.sin(t * .6 + ph) * 22 * z;
    if (y > bed - 4) y = bed - 4 + (i % 9);
    const sz = (big ? 7 : 2.4) * z, a = (big ? .5 : .65) * z;
    if (big) { ctx.strokeStyle = `rgba(210,255,230,${a})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(x, y, sz * 1.6, sz, ph + t * .3, 0, TAU); ctx.stroke(); ctx.fillStyle = `rgba(160,240,200,${a * .3})`; ctx.fill(); }
    else { ctx.fillStyle = `rgba(225,245,235,${a})`; ctx.beginPath(); ctx.arc(x, y, sz, 0, TAU); ctx.fill(); }
  }
  // sea bed: dark, oxygen-poor mud, then fresh sediment drifting over it
  ctx.fillStyle = vgrad(ctx, bed, H, ['#0d1210', '#040605']); ctx.beginPath(); ctx.moveTo(0, H); for (let x = 0; x <= W; x += 30) ctx.lineTo(x, bed + 16 * Math.sin(x / 190) + 8 * Math.sin(x / 61 + 2)); ctx.lineTo(W, H); ctx.fill();
  const sd = smooth((t - 5.4) / 2.6);
  if (sd > 0) { const g = ctx.createLinearGradient(0, bed - 220, 0, bed + 40); g.addColorStop(0, 'rgba(70,60,45,0)'); g.addColorStop(1, `rgba(70,60,45,${.75 * sd})`); ctx.fillStyle = g; ctx.fillRect(0, bed - 220, W, 300); fines(ctx, t, { n: 160, seed: 5, vy: 40, color: [.6, .52, .4], a: .5 * sd, size: 3 }); }
}, { fi: 1.2, fo: .5, snd: [['water', .9], ['waves', .5]] });

// ---------- burial: layers accumulate and compact; push into the organic-rich layer ----------
const BUR = (() => { const R = rng(17), a = []; for (let i = 0; i < 26; i++) a.push({ h: 34 + R() * 60, c: [[.42, .36, .27], [.30, .29, .28], [.50, .44, .33], [.22, .21, .20], [.36, .30, .24]][i % 5].map(v => v * (.8 + R() * .4)), w: R() * TAU }); return a; })();
shot('burial', 5, (ctx, t) => {
  const z = lerp(1, 7, ease((t - 2.6) / 2.4)), n = 1 + t * 5.2, oy = 620;
  ctx.fillStyle = '#04090c'; ctx.fillRect(0, 0, W, H);
  ctx.save(); zoomAt(ctx, z, W / 2, oy);
  // the organic layer stays put; younger layers stack above it and thin as they compact
  let y = oy - 26;
  for (let i = 0; i < Math.min(BUR.length, Math.ceil(n)); i++) {
    const L = BUR[i], age = clamp(n - i), comp = 1 - .5 * clamp((n - i) / 12), h = L.h * comp * age, y1 = y - h;
    fillTex(ctx, tex('bur' + (i % 5), L.c, .07, 30 + i % 5), () => { ctx.moveTo(-100, y + 9 * Math.sin(L.w)); for (let x = -100; x <= W + 100; x += 60) ctx.lineTo(x, y + 7 * Math.sin(x / 210 + L.w)); for (let x = W + 100; x >= -100; x -= 60) ctx.lineTo(x, y1 + 7 * Math.sin(x / 230 + L.w + 1)); }, { s: 1 / comp > 1.6 ? .8 : 1 });
    y = y1;
  }
  ctx.fillStyle = vgrad(ctx, y - 500, y, ['#02161c', '#0b3a44']); ctx.fillRect(-100, -3000, W + 200, 3000 + y);   // the sea above
  fillTex(ctx, tex('org', [.07, .06, .05], .035, 77, .6), () => ctx.rect(-100, oy - 30, W + 200, 64));
  fillTex(ctx, tex('bur1', BUR[1].c, .07, 31), () => ctx.rect(-100, oy + 34, W + 200, 600));
  // a faint sheen: the first oil films
  const sh = smooth((t - 3.2) / 1.6); ctx.globalCompositeOperation = 'lighter'; const R = rng(4); for (let i = 0; i < 70; i++) { ctx.fillStyle = `rgba(200,130,40,${.18 * sh * R()})`; ctx.fillRect(R() * W, oy - 26 + R() * 54, 14 + R() * 30, 1.5); }
  ctx.restore();
  ctx.fillStyle = `rgba(0,0,0,${.35 + .3 * ease((t - 2.6) / 2.4)})`; ctx.fillRect(0, 0, W, H); glow(ctx, W / 2, oy, 900, [1, .85, .6], .16);
}, { fi: .5, fo: .35, snd: [['rock', .7]], events: s => [{ t: 1.2, type: 'creak' }, { t: 3.1, type: 'creak' }] });

// ---------- oil generation inside the source rock ----------
shot('kerogen', 5, (ctx, t) => {
  const k = smooth(t / 4.4);
  pore(ctx, camZ(2.05 + t * .07, { sway: .03, look: .6 }), ROCK.source, { uDrop: k, uFog: [lerp(.012, .05, k), lerp(.010, .026, k), .008], uFogD: lerp(.9, .75, k), uLight: lerp(.85, 1.15, k) });
  fines(ctx, t, { n: 40, seed: 3, a: .25, color: [.8, .6, .3], size: 2.5 });
}, { fi: .35, fo: .2, snd: [['deep', .8]], events: s => [{ t: 2.4, type: 'creak' }] });

// ---------- migration: microfracture -> carrier bed -> conductive fault -> sandstone ----------
shot('mig_a', 3.6, (ctx, t) => {
  pore(ctx, camZ(4 + t * .5 + t * t * .05, { sway: .03 }), mixLook(ROCK.source, ROCK.carrier, .25), { uSlab: [0, .1, 0], uDrop: .7 });
  rush(ctx, t, { n: 30, speed: .25, a: .16, color: [.9, .6, .3] });
}, { fi: .2, fo: .2, snd: [['seep', .5], ['deep', .5]] });
shot('mig_b', 3.8, (ctx, t) => {
  pore(ctx, camZ(9 + t * .85, { sway: .05 }), ROCK.carrier);
  rush(ctx, t, { n: 46, speed: .35, a: .2, color: [1, .75, .4] });
}, { fi: .2, fo: .2, snd: [['seep', .7], ['deep', .4]] });
shot('mig_c', 3.8, (ctx, t) => {
  const k = smooth(t / 3.8);
  pore(ctx, camZ(15 + t * .9, { sway: .05, gy: .25 * (1 - k) }), mixLook(ROCK.carrier, ROCK.sand, k), { uSlab: [0, lerp(.24, .0001, smooth((t - 2.2) / 1.4)), 1] });
  rush(ctx, t, { n: 46, speed: .4, a: .2, color: [1, .75, .4] });
}, { fi: .2, fo: .35, snd: [['seep', .7], ['deep', .4]] });

// ---------- the trap: an anticline under a sealing cap rock ----------
const AFOLD = x => -210 * Math.exp(-(((x - 960) / 520) ** 2));
shot('trap', 5.5, (ctx, t) => {
  const z = lerp(1, 1.9, ease(t / 5.5)), B = [[-400, 0], [330, .25], [470, .7], [560, 1], [760, 1], [900, .75], [1500, .4]];
  const by = (i, x) => B[i][0] + AFOLD(x) * B[i][1], band = i => () => { for (let x = -200; x <= W + 200; x += 40) ctx.lineTo(x, by(i, x)); for (let x = W + 200; x >= -200; x -= 40) ctx.lineTo(x, by(i + 1, x)); };
  ctx.save(); zoomAt(ctx, z, 960, 520);
  const pats = [tex('ov1', [.21, .19, .17], .05, 51), tex('ov2', [.26, .24, .22], .05, 52), tex('cap', [.13, .14, .16], .03, 53, .5), tex('res', [.50, .42, .31], .1, 54, 1.4), tex('und', [.2, .18, .16], .05, 55), tex('und2', [.12, .12, .13], .04, 56)];
  for (let i = 0; i < 6; i++) fillTex(ctx, pats[i], band(i));
  // fluids inside the porous reservoir: gas at the crest, oil below, water deeper
  ctx.save(); ctx.beginPath(); band(3)(); ctx.clip(); ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = 'rgba(120,150,170,.9)'; ctx.fillRect(-200, 560, W + 400, 500); ctx.fillStyle = 'rgba(70,40,12,.92)'; ctx.fillRect(-200, 430, W + 400, 130);
  ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = 'rgba(200,215,205,.42)'; ctx.fillRect(-200, 300, W + 400, 130); ctx.restore();
  // rim light on the cap rock, darkness around
  ctx.strokeStyle = 'rgba(255,240,210,.25)'; ctx.lineWidth = 3; ctx.beginPath(); for (let x = -200; x <= W + 200; x += 40) ctx.lineTo(x, by(3, x)); ctx.stroke();
  ctx.restore();
  ctx.fillStyle = vgrad(ctx, 0, H, ['rgba(0,0,0,.55)', 'rgba(0,0,0,.05)', 'rgba(0,0,0,.6)']); ctx.fillRect(0, 0, W, H); glow(ctx, 960, 470, 700, [1, .9, .7], .1);
}, { fi: .4, fo: .4, snd: [['deep', .7]] });

// ---------- waiting: one oil-filled pore, a water film on the grains ----------
const WAITCAM = camZ(21.02, { sway: .03, look: .55 });
function waiting(ctx, t, amp = 0) {
  ctx.save(); if (amp) shake(ctx, t, amp, 14); zoomAt(ctx, 1.03 + .012 * Math.sin(t * .5));
  pore(ctx, WAITCAM, ROCK.sand); ctx.restore();
  fines(ctx, t, { n: 46, seed: 9, a: .32, color: [1, .8, .5], size: 2.6, jit: amp * 1.6 });
}
shot('wait', 5.5, (ctx, t) => waiting(ctx, t), { fi: .5, snd: [['deep', .55]] });
