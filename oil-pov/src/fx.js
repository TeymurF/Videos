// 2D helpers shared by the shots: camera shake, drifting particles, perspective streaks and
// bubbles, procedural rock textures, glows, simple silhouettes.
function shake(ctx, t, amp, f = 9, seed = 0) { ctx.translate(W / 2, H / 2); ctx.rotate(vnoise(t * f * .7, seed + 5) * amp * .0012); ctx.translate(-W / 2 + vnoise(t * f, seed) * amp, -H / 2 + vnoise(t * f * 1.13, seed + 9) * amp); }
function zoomAt(ctx, k, cx = W / 2, cy = H / 2) { ctx.translate(cx, cy); ctx.scale(k, k); ctx.translate(-cx, -cy); }
function glow(ctx, x, y, r, col, a = 1) { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, rgb(col, a)); g.addColorStop(1, rgb(col, 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }
function vgrad(ctx, y0, y1, stops) { const g = ctx.createLinearGradient(0, y0, 0, y1); stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s)); return g; }
// specks suspended in fluid; o: n, seed, vx, vy (px/s), jit, color [r,g,b], a, size
function fines(ctx, t, o = {}) {
  const R = rng(o.seed ?? 1), n = o.n ?? 80, col = o.color ?? [1, .9, .7];
  for (let i = 0; i < n; i++) {
    const z = .3 + R() * .7, x0 = R() * W, y0 = R() * H, ph = R() * TAU, sz = (o.size ?? 3) * z * (.6 + R());
    const x = ((x0 + (o.vx ?? 0) * t * z + Math.sin(t * .5 + ph) * 14 + vnoise(t * 14, i) * (o.jit ?? 0)) % W + W) % W, y = ((y0 + (o.vy ?? 0) * t * z + Math.cos(t * .4 + ph) * 10 + vnoise(t * 15, i + 50) * (o.jit ?? 0)) % H + H) % H;
    ctx.fillStyle = rgb(col, (o.a ?? .5) * z * (.5 + .5 * Math.sin(t * 1.3 + ph))); ctx.beginPath(); ctx.arc(x, y, sz, 0, TAU); ctx.fill();
  }
}
// streaks flying outward from a vanishing point (forward motion); o: n, speed, color, seed, len, a, cx, cy, w
function rush(ctx, t, o = {}) {
  const R = rng(o.seed ?? 2), n = o.n ?? 90, cx = o.cx ?? W / 2, cy = o.cy ?? H / 2, col = o.color ?? [1, .95, .85];
  ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const an = R() * TAU, sp = .5 + R(), ph = R(), u = (ph + t * (o.speed ?? .6) * sp) % 1, r = Math.pow(u, 2.2) * 1250 + 20, l = (o.len ?? 60) * u * u * sp;
    ctx.strokeStyle = rgb(col, (o.a ?? .5) * Math.min(1, u * 4) * (1 - u * .5)); ctx.lineWidth = (o.w ?? 2.5) * (.4 + u * 1.4);
    ctx.beginPath(); ctx.moveTo(cx + Math.cos(an) * r, cy + Math.sin(an) * r); ctx.lineTo(cx + Math.cos(an) * (r + l), cy + Math.sin(an) * (r + l)); ctx.stroke();
  }
}
// bubbles or droplets approaching the viewer; o: n, speed, seed, col, a, grow, cx, cy, rim
function orbs(ctx, t, o = {}) {
  const R = rng(o.seed ?? 3), n = o.n ?? 24, cx = o.cx ?? W / 2, cy = o.cy ?? H / 2, col = o.col ?? [.85, .95, 1];
  for (let i = 0; i < n; i++) {
    const an = R() * TAU, sp = .5 + R(), ph = R(), u = (ph + t * (o.speed ?? .3) * sp) % 1, r = Math.pow(u, 1.8) * 1100 + 10, sz = (o.size ?? 44) * u * u * (.5 + R()) * (o.grow ?? 1) + 2;
    const x = cx + Math.cos(an) * r, y = cy + Math.sin(an) * r * .8, a = (o.a ?? .6) * Math.min(1, u * 5) * (1 - u * .4);
    const g = ctx.createRadialGradient(x - sz * .3, y - sz * .35, sz * .05, x, y, sz); g.addColorStop(0, rgb([1, 1, 1], a * .9)); g.addColorStop(.25, rgb(col, a * .35)); g.addColorStop(.85, rgb(col, a * .12)); g.addColorStop(1, rgb(col, a * (o.rim ?? .7)));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, sz, 0, TAU); ctx.fill();
  }
}
// mottled rock texture tile -> pattern
const TEX = {};
function tex(name, base, vary, seed, grain = 1) {
  if (TEX[name]) return TEX[name];
  const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d'), R = rng(seed);
  g.fillStyle = rgb(base); g.fillRect(0, 0, 512, 512);
  for (const [n, sz, al] of [[90, 90, .16], [500, 26, .2], [5000, 5 * grain, .3]]) for (let i = 0; i < n; i++) { const v = R() < .5 ? 0 : 1, x = R() * 512, y = R() * 512, r = sz * (.4 + R()); g.fillStyle = rgb(v ? base.map(b => Math.min(1, b + vary)) : base.map(b => Math.max(0, b - vary)), al); for (const dx of [-512, 0, 512]) for (const dy of [-512, 0, 512]) { g.beginPath(); g.ellipse(x + dx, y + dy, r, r * (.5 + R() * .5), R() * 3, 0, TAU); g.fill(); } }
  return TEX[name] = ctx.createPattern(c, 'repeat');
}
function fillTex(ctx, pat, drawPath, o = {}) { ctx.save(); ctx.beginPath(); drawPath(); ctx.clip(); ctx.translate(o.ox ?? 0, o.oy ?? 0); ctx.scale(o.s ?? 1, o.s ?? 1); ctx.fillStyle = pat; ctx.fillRect(-4000, -4000, 9000, 9000); ctx.restore(); }
function steelV(ctx, x, y, w, h, o = {}) { const g = ctx.createLinearGradient(x, 0, x + w, 0); const b = o.b ?? 1; g.addColorStop(0, rgb([.12 * b, .13 * b, .15 * b])); g.addColorStop(.35, rgb([.5 * b, .53 * b, .57 * b])); g.addColorStop(.6, rgb([.3 * b, .32 * b, .35 * b])); g.addColorStop(1, rgb([.08 * b, .09 * b, .1 * b])); ctx.fillStyle = g; ctx.fillRect(x, y, w, h); }
// dusk / dawn exterior: sky gradient, haze, ground; then the caller draws silhouettes
function exterior(ctx, sky, gy, o = {}) {
  ctx.fillStyle = vgrad(ctx, 0, gy, sky); ctx.fillRect(0, 0, W, gy);
  if (o.sun) glow(ctx, o.sun[0], o.sun[1], o.sun[2] ?? 520, o.sunC ?? [1, .75, .45], o.sunA ?? .8);
  ctx.fillStyle = o.far ?? '#1a1a22'; ctx.beginPath(); ctx.moveTo(0, gy); for (let x = 0; x <= W; x += 40) ctx.lineTo(x, gy - 26 - 22 * Math.sin(x / 260 + (o.seed ?? 0)) - 12 * Math.sin(x / 97)); ctx.lineTo(W, gy); ctx.fill();
  ctx.fillStyle = vgrad(ctx, gy, H, o.ground ?? ['#15151a', '#060608']); ctx.fillRect(0, gy, W, H - gy);
}
