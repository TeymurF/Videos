// Engine: deterministic frame rendering for a silent (no text, no narration) point-of-view film.
// 1920x1080 2D canvas; 3D shots are raymarched in WebGL (gl.js) and composited here.
const W = 1920, H = 1080, TAU = Math.PI * 2;
const SHOTS = [];
let TOTAL = 0, ctx;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const ease = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const smooth = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const lin = (t, a, d = 1) => clamp((t - a) / d);
const pr = (t, a, d = 1) => ease((t - a) / d);
const win = (t, a, b, f = .4) => Math.min(lin(t, a, f), 1 - lin(t, b - f, f));
function rng(seed) { let s = seed >>> 0; return () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function kf(t, a, sm = true) { if (t <= a[0][0]) return a[0][1]; for (let i = 1; i < a.length; i++) if (t <= a[i][0]) { const k = (t - a[i - 1][0]) / (a[i][0] - a[i - 1][0] || 1); return lerp(a[i - 1][1], a[i][1], sm ? ease(k) : k); } return a[a.length - 1][1]; }
// smooth value noise in 1D (camera shake, flicker)
function vnoise(x, seed = 0) { const i = Math.floor(x), f = x - i, h = n => { const s = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453; return s - Math.floor(s); }; return lerp(h(i), h(i + 1), f * f * (3 - 2 * f)) * 2 - 1; }
const rgb = (c, a = 1) => `rgba(${c[0] * 255 | 0},${c[1] * 255 | 0},${c[2] * 255 | 0},${a})`;

// shot(id, seconds, draw(ctx, t, shot), { fi, fo, events(shot), snd })
function shot(id, dur, draw, o = {}) { SHOTS.push(Object.assign({ id, dur, draw }, o)); }
function buildTimeline() { let T = 0; for (const s of SHOTS) { s.start = T; T += s.dur; } TOTAL = T; }
function shotAt(T) { for (const s of SHOTS) if (T < s.start + s.dur) return s; return SHOTS[SHOTS.length - 1]; }

// film grain tiles
const GRAIN = [];
function makeGrain() { for (let k = 0; k < 6; k++) { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'), d = g.createImageData(256, 256), R = rng(900 + k); for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (R() + R() + R() - 1.5) * 150; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } g.putImageData(d, 0, 0); GRAIN.push(c); } }
function post(T, s, t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none';
  // vignette
  const v = ctx.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * 1.05); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(0,0,0,${s.vig ?? .62})`); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  // grain
  const f = Math.floor(T * 30); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = s.grain ?? .13;
  ctx.save(); ctx.translate(-((f * 97) % 256), -((f * 57) % 256)); ctx.fillStyle = ctx.createPattern(GRAIN[f % GRAIN.length], 'repeat'); ctx.fillRect(0, 0, W + 256, H + 256); ctx.restore();
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  // fades and cuts
  const fi = s.fi ?? 0, fo = s.fo ?? 0, k = Math.max(fi ? 1 - lin(t, 0, fi) : 0, fo ? lin(t, s.dur - fo, fo) : 0);
  if (k > 0) { ctx.fillStyle = `rgba(0,0,0,${k})`; ctx.fillRect(0, 0, W, H); }
  // 2:1 letterbox
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, 60); ctx.fillRect(0, H - 60, W, 60);
}
function renderFrame(T) {
  T = clamp(T, 0, TOTAL - 1e-4); const s = shotAt(T), t = T - s.start; window.GT = T;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  ctx.save(); s.draw(ctx, t, s); ctx.restore();
  post(T, s, t);
}
async function init() {
  ctx = document.getElementById('cv').getContext('2d'); makeGrain(); initGL(); buildTimeline(); window.READY = true;
  return { total: TOTAL, shots: SHOTS.map(s => ({ id: s.id, start: s.start, dur: s.dur, snd: s.snd || [], events: (s.events ? s.events(s) : []).map(e => ({ ...e, t: e.t + s.start })) })) };
}
