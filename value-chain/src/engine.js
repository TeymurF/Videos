// Engine: 1920x1080 canvas, deterministic frame rendering as a function of time.
const W = 1920, H = 1080;
const C = {
  bg: '#0b1016', panel: '#121a23', line: '#243240', ink: '#e9eef3', dim: '#8b9aa9',
  steel: '#9fb0c0', steelD: '#566574', steelL: '#d8e1e9', steelX: '#2f3a45',
  oil: '#e9a63b', oilD: '#a8691a', oilX: '#5e3b10', water: '#4aa8e0', 
  gas: '#7fe0b0', ngl: '#f2d06b', data: '#9ab4ff', sulfur: '#f5e04a', mud: '#b08a5a',
  up: '#ff8a5c', mid: '#35d0ba', down: '#b08cff',
  ok: '#5fd38d', bad: '#ff6464', hot: '#ff7a4d', cold: '#49b6ff', accent: '#ffd166',
  cement: '#8d9499', rock: '#2b251f', sand: '#b2935f',
};
const SCENES = [];
let TOTAL = 0;
const PERIOD = 6; // pumpjack stroke period, s
const TAU = Math.PI * 2;
const PARTS = [['UPSTREAM', C.up], ['MIDSTREAM', C.mid], ['DOWNSTREAM', C.down]];

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const ease = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const lin = (t, a, d = 1) => clamp((t - a) / d);
const pr = (t, a, d = 1) => ease((t - a) / d);
// visibility inside window [a,b] with soft edges
const win = (t, a, b, f = .5) => Math.min(lin(t, a, f), 1 - lin(t, b - f, f));
function rng(seed) { let s = seed >>> 0; return () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
// piecewise-linear keyframes [[t,v],...], optionally eased
function kf(t, a, sm = true) {
  if (t <= a[0][0]) return a[0][1];
  for (let i = 1; i < a.length; i++) if (t <= a[i][0]) {
    const k = (t - a[i - 1][0]) / (a[i][0] - a[i - 1][0] || 1);
    return lerp(a[i - 1][1], a[i][1], sm ? ease(k) : k);
  }
  return a[a.length - 1][1];
}
const font = (size, weight = 500, mono = false) => `${weight} ${size}px ${mono ? '"JetBrains Mono"' : '"Golos Text"'}, "DejaVu Sans", sans-serif`;
function txt(ctx, s, x, y, o = {}) {
  ctx.save();
  ctx.globalAlpha *= o.a ?? 1;
  ctx.font = font(o.size ?? 28, o.weight ?? 500, o.mono);
  ctx.fillStyle = o.color ?? C.ink; ctx.textAlign = o.align ?? 'left'; ctx.textBaseline = o.base ?? 'middle';
  const lines = String(s).split('\n'), lh = (o.lh ?? 1.28) * (o.size ?? 28);
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lh));
  ctx.restore();
}
function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function box(ctx, x, y, w, h, o = {}) {
  ctx.save(); ctx.globalAlpha *= o.a ?? 1;
  rr(ctx, x, y, w, h, o.r ?? 14);
  if (o.fill !== null) { ctx.fillStyle = o.fill ?? C.panel; ctx.fill(); }
  if (o.stroke) { ctx.strokeStyle = o.stroke; ctx.lineWidth = o.lw ?? 2; ctx.stroke(); }
  ctx.restore();
}
function arrow(ctx, x1, y1, x2, y2, o = {}) {
  const w = o.w ?? 5, hd = o.head ?? w * 3.2, a = Math.atan2(y2 - y1, x2 - x1);
  ctx.save(); ctx.globalAlpha *= o.a ?? 1;
  ctx.strokeStyle = ctx.fillStyle = o.color ?? C.accent; ctx.lineWidth = w; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - Math.cos(a) * hd * .8, y2 - Math.sin(a) * hd * .8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - Math.cos(a - .45) * hd, y2 - Math.sin(a - .45) * hd);
  ctx.lineTo(x2 - Math.cos(a + .45) * hd, y2 - Math.sin(a + .45) * hd); ctx.closePath(); ctx.fill();
  ctx.restore();
}
// callout label: anchor point (ax,ay) -> text at (tx,ty)
function label(ctx, ax, ay, tx, ty, s, o = {}) {
  const a = o.a ?? 1; if (a <= 0.01) return;
  const col = o.color ?? C.accent, size = o.size ?? 26, al = o.align ?? (tx >= ax ? 'left' : 'right');
  ctx.save(); ctx.globalAlpha *= a;
  ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(tx, ty); ctx.stroke();
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(ax, ay, 5, 0, TAU); ctx.fill();
  ctx.font = font(size, 600);
  const lines = s.split('\n'), lh = size * 1.25;
  const tw = Math.max(...lines.map(l => ctx.measureText(l).width)), th = lines.length * lh;
  const bx = al === 'left' ? tx : tx - tw - 24, by = ty - th / 2 - 8;
  rr(ctx, bx, by, tw + 24, th + 16, 10); ctx.fillStyle = 'rgba(11,16,22,.86)'; ctx.fill();
  ctx.strokeStyle = col; ctx.globalAlpha *= .6; ctx.lineWidth = 1.5; ctx.stroke(); ctx.globalAlpha /= .6;
  lines.forEach((l, i) => { txt(ctx, l, bx + 12, by + 8 + lh * (i + .5), { size, weight: i ? 500 : 600, color: i ? C.dim : C.ink }); });
  ctx.restore();
}
function polyLen(p) { let L = [0]; for (let i = 1; i < p.length; i++) L.push(L[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1])); return L; }
function polyAt(p, L, d) {
  d = clamp(d, 0, L[L.length - 1]);
  for (let i = 1; i < p.length; i++) if (d <= L[i]) { const k = (d - L[i - 1]) / (L[i] - L[i - 1] || 1); return [lerp(p[i - 1][0], p[i][0], k), lerp(p[i - 1][1], p[i][1], k)]; }
  return p[p.length - 1];
}
// dots running along a polyline
function dots(ctx, p, t, o = {}) {
  const a = o.a ?? 1; if (a <= 0.01) return;
  const L = polyLen(p), tot = L[L.length - 1], gap = o.gap ?? 34, n = Math.max(1, Math.floor(tot / gap)), sp = o.speed ?? 80;
  const base = ctx.globalAlpha;
  ctx.save(); ctx.fillStyle = o.color ?? C.accent;
  for (let i = 0; i < n; i++) {
    const d = ((i * gap + t * sp) % tot + tot) % tot, q = polyAt(p, L, d);
    // colours: each dot keeps its colour while it travels along the line
    if (o.colors) { const lap = Math.floor((i * gap + t * sp) / tot), id = i - lap * n; ctx.fillStyle = o.colors[((id % o.colors.length) + o.colors.length) % o.colors.length]; }
    ctx.globalAlpha = base * a * Math.min(1, d / 30, (tot - d) / 30);
    ctx.beginPath(); ctx.arc(q[0], q[1], o.r ?? 5, 0, TAU); ctx.fill();
  }
  ctx.restore();
}
// chevrons moving along a vertical line (y1 < y0 means upward)
function chev(ctx, x, y0, y1, t, o = {}) {
  const a = o.a ?? 1; if (a <= 0.01 || Math.abs(y1 - y0) < 8) return;
  const gap = o.gap ?? 30, s = o.s ?? 8, sp = o.speed ?? 60, len = Math.abs(y1 - y0), dir = y1 < y0 ? -1 : 1;
  const base = ctx.globalAlpha;
  ctx.save(); ctx.strokeStyle = o.color ?? '#fff3d6'; ctx.lineWidth = o.lw ?? 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (let d = ((t * sp) % gap + gap) % gap; d < len; d += gap) {
    const y = y0 + dir * d;
    ctx.globalAlpha = base * a * Math.min(1, d / 14, (len - d) / 14);
    ctx.beginPath(); ctx.moveTo(x - s, y - dir * s * .8); ctx.lineTo(x, y); ctx.lineTo(x + s, y - dir * s * .8); ctx.stroke();
  }
  ctx.restore();
}
function wrap(ctx, s, maxW) {
  const out = []; let cur = '';
  for (const w of s.split(' ')) { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur) { out.push(cur); cur = w; } else cur = t; }
  if (cur) out.push(cur); return out;
}

function buildTimeline() {
  let T = 0;
  SCENES.forEach((s, i) => {
    s.start = T; s.idx = i; let t = s.lead ?? 0.9; s.c = []; s.e = []; s.txt = []; s.say = [];
    for (const cu of s.cues) {
      // a cue is 'text', ['text', seconds] or { t: 'text', say: 'spoken form', d: seconds }
      const [tx, d] = Array.isArray(cu) ? cu : typeof cu === 'string' ? [cu] : [cu.t, cu.d];
      s.say = s.say || []; s.say.push(typeof cu === 'object' && !Array.isArray(cu) && cu.say ? cu.say : tx);
      const base = d ?? clamp(tx.length / 13.5, 4, 11.5), nd = window.NARR?.[s.id]?.[s.c.length];
      // with narration: long enough for the spoken clip, never much shorter than the silent timing
      const dur = nd ? Math.max(base * (d ? 1 : .85), nd + .8) : base;
      s.c.push(t); s.e.push(t + dur); s.txt.push(tx); t += dur + 0.5;
    }
    s.dur = s.fixed ?? (t + 0.5 + (s.extra || 0)); T += s.dur;
  });
  TOTAL = T;
}
function sceneAt(T) { for (const s of SCENES) if (T < s.start + s.dur) return s; return SCENES[SCENES.length - 1]; }

let ctx;
function renderFrame(T) {
  T = clamp(T, 0, TOTAL - 1e-4);
  const s = sceneAt(T), t = T - s.start;
  window.GT = T;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  // slow push-in keeps every scene alive
  ctx.save(); const dz = 1 + (s.drift ?? .022) * t / s.dur; ctx.translate(960, 520); ctx.scale(dz, dz); ctx.translate(-960, -520);
  s.draw(ctx, t, s.c, s); ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  const pc = s.part != null ? PARTS[s.part][1] : C.accent;
  // scene header + position in the value chain
  if (s.title) {
    const a = lin(t, .2, .6);
    ctx.save(); ctx.globalAlpha = a;
    const g = ctx.createLinearGradient(0, 0, 0, 120); g.addColorStop(0, 'rgba(11,16,22,.94)'); g.addColorStop(1, 'rgba(11,16,22,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, 120);
    txt(ctx, String(s.num).padStart(2, '0'), 56, 52, { size: 30, mono: true, weight: 700, color: pc });
    ctx.fillStyle = pc; ctx.fillRect(108, 38, 3, 28);
    txt(ctx, s.title, 128, 52, { size: 32, weight: 600 });
    if (s.part != null) {
      let x = W - 56;
      for (let i = 2; i >= 0; i--) {
        ctx.font = font(20, 700, true); const w = ctx.measureText(PARTS[i][0]).width + 30, on = i === s.part;
        rr(ctx, x - w, 34, w, 36, 18); ctx.fillStyle = on ? PARTS[i][1] : 'rgba(255,255,255,.06)'; ctx.fill();
        txt(ctx, PARTS[i][0], x - w / 2, 53, { size: 20, mono: true, weight: 700, align: 'center', color: on ? '#0b1016' : C.dim });
        x -= w + 10;
      }
    }
    ctx.restore();
  }
  // caption
  for (let i = 0; i < s.c.length; i++) {
    const a = win(t, s.c[i] - .1, s.e[i] + .25, .3); if (a <= 0) continue;
    ctx.save(); ctx.globalAlpha = a; ctx.font = font(36, 500);
    const lines = wrap(ctx, s.txt[i], 1560), lh = 48, bh = lines.length * lh + 34, by = 1040 - bh;
    const tw = Math.max(...lines.map(l => ctx.measureText(l).width));
    rr(ctx, 960 - tw / 2 - 34, by, tw + 68, bh, 16); ctx.fillStyle = 'rgba(7,10,14,.84)'; ctx.fill();
    lines.forEach((l, j) => txt(ctx, l, 960, by + 17 + lh * (j + .5), { size: 36, align: 'center' }));
    ctx.restore();
  }
  // fade at scene boundaries
  const f = Math.max(1 - lin(t, 0, .45), lin(t, s.dur - .4, .4));
  if (f > 0) { ctx.globalAlpha = f; ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  // progress bar
  ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(0, H - 6, W, 6);
  ctx.fillStyle = pc; ctx.fillRect(0, H - 6, W * T / TOTAL, 6);
}
async function init() {
  const cv = document.getElementById('cv'); ctx = cv.getContext('2d');
  await Promise.all([400, 500, 600, 700].map(w => document.fonts.load(font(30, w), 'Aa Bb')).concat([500, 700].map(w => document.fonts.load(font(30, w, true), 'Aa Bb'))));
  buildTimeline();
  let n = 0; SCENES.forEach(s => { if (s.title) s.num = ++n; });
  window.READY = true;
  return { total: TOTAL, period: PERIOD, scenes: SCENES.map(s => ({ id: s.id, start: s.start, dur: s.dur, amb: s.amb || 'none', title: s.title || '', cues: s.c.map((c, i) => ({ start: s.start + c, end: s.start + s.e[i], text: s.txt[i], say: s.say[i] })), events: (s.events ? s.events(s) : []).map(e => ({ ...e, t: e.t + s.start })) })) };
}
