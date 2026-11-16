// WebGL2 shots: PORE (raymarched granular rock seen from inside the pore space) and
// TUNNEL (inside a pipe). Both render to an offscreen canvas that the 2D engine composites.
const GLW = 1280, GLH = 720;
let GLC, gl, PROG = {}, lastKey = '';

const VS = `#version 300 es
in vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }`;

const NOISE = `
float h1(vec3 p){ p = fract(p*.3183099+.1); p *= 17.; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float n3(vec3 x){ vec3 i = floor(x), f = fract(x); f = f*f*(3.-2.*f);
  return mix(mix(mix(h1(i), h1(i+vec3(1,0,0)), f.x), mix(h1(i+vec3(0,1,0)), h1(i+vec3(1,1,0)), f.x), f.y),
             mix(mix(h1(i+vec3(0,0,1)), h1(i+vec3(1,0,1)), f.x), mix(h1(i+vec3(0,1,1)), h1(i+vec3(1,1,1)), f.x), f.y), f.z); }
float fbm(vec3 p){ return .5*n3(p) + .25*n3(p*2.03) + .125*n3(p*4.01) + .0625*n3(p*8.07); }`;

// Grains sit on a jittered lattice (cell = 1). The pore network follows the lattice lines through
// the cell corners, so a camera travelling along integer x/y/z lines always has room to pass.
const FS_PORE = `#version 300 es
precision highp float;
uniform vec2 R; uniform vec3 uRo, uTa; uniform float uRoll, uFov, uTime;
uniform float uRad, uJit, uRough;
uniform vec3 uGA, uGB, uFog, uLightC, uGlowP, uGlowC, uOil;
uniform float uFogD, uLight, uWet, uDrop, uDark, uSeed;
uniform vec3 uSlab;   // x: plane position, y: half width (0 = none), z: axis (0 = x-plane, 1 = y-plane)
out vec4 o;
${NOISE}
float smin(float a, float b, float k){ float h = clamp(.5+.5*(b-a)/k, 0., 1.); return mix(b, a, h) - k*h*(1.-h); }
float smax(float a, float b, float k){ return -smin(-a, -b, k); }
float gid;
float grains(vec3 p){ vec3 i = floor(p), f = fract(p); float d = 9.;
  for(int a=0;a<2;a++) for(int b=0;b<2;b++) for(int c=0;c<2;c++){
    vec3 g = vec3(a,b,c) + step(.5, f) - 1., cid = i + g + uSeed; float hh = h1(cid);
    vec3 ce = g + .5 + uJit*(fract(hh*vec3(1., 57.31, 113.17)) - .5);
    float dd = length(f - ce) - uRad*(.9 + .2*fract(hh*31.7));
    if(dd < d){ d = dd; gid = fract(hh*7.3); } }
  return d; }
float drops(vec3 p){ vec3 c = floor(p+.5), q = p - c; float hh = h1(c+31.+uSeed);
  vec3 dir = normalize(fract(hh*vec3(1., 57.31, 113.17)) - .5 + .001);
  float d1 = length(q - .30*dir) - uDrop*(.05 + .10*hh);
  float d2 = length(q + .27*dir.yzx) - uDrop*(.04 + .08*fract(hh*9.1));
  return min(d1, d2); }
float mat;
float map(vec3 p){
  float d = grains(p);
  float lo = n3(p*2.6) + .5*n3(p*5.3) - .72;
  d -= uRough*lo;
  vec3 f = abs(fract(p + .5 + .05*sin(p.yzx*2.1)) - .5);   // keep the lattice channels open
  float ch = min(min(length(f.xy), length(f.yz)), length(f.xz)) - .055;
  d = smax(d, -ch, .1);
  if(uSlab.y > 0.){ float w = (uSlab.z < .5 ? p.x : p.y) - uSlab.x - .13*sin(p.z*1.3 + (uSlab.z < .5 ? p.y : p.x)*.9);
    float s = abs(w) - uSlab.y - .12*lo; d = smax(d, -s, .08); }
  mat = 0.;
  if(uDrop > 0.){ float dr = drops(p); if(dr < d) mat = 1.; d = smin(d, dr, .05); }
  return d*.8; }
vec3 nrm(vec3 p){ vec2 e = vec2(.0035, 0.); return normalize(vec3(map(p+e.xyy)-map(p-e.xyy), map(p+e.yxy)-map(p-e.yxy), map(p+e.yyx)-map(p-e.yyx))); }
void main(){
  vec2 uv = (gl_FragCoord.xy*2. - R)/R.y;
  float cr = cos(uRoll), sr = sin(uRoll); uv = mat2(cr, -sr, sr, cr)*uv;
  vec3 f = normalize(uTa - uRo), r = normalize(cross(vec3(.03, 1., .02), f)), u = cross(f, r);
  vec3 rd = normalize(f*uFov + uv.x*r + uv.y*u);
  float t = .02; bool hit = false;
  for(int i=0;i<60;i++){ float d = map(uRo + rd*t); if(d < .0018*t + .0006){ hit = true; break; } t += d; if(t > 7.) break; }
  vec3 col = vec3(0.);
  if(hit){
    vec3 p = uRo + rd*t; float m = mat, g = gid; vec3 n = nrm(p);
    n = normalize(n + (1. - m)*.38*(vec3(n3(p*38.), n3(p*38. + 17.), n3(p*38. + 31.)) - .5));   // mineral grain texture
    float mott = fbm(p*7. + g*20.), speck = n3(p*60.);
    vec3 alb = mix(uGA, uGB, g)*(.55 + .7*mott)*(.85 + .3*speck);
    alb = mix(alb, alb*vec3(.18, .15, .13), uDark*smoothstep(.35, .7, fbm(p*2.2 + 9.)));   // kerogen-rich patches
    alb = mix(alb, uOil, m);
    float ao = clamp(.35 + 3.2*map(p + n*.12) + 2.*map(p + n*.3), 0., 1.);
    vec3 l = normalize(uRo + u*.06 - p); float dif = max(dot(n, l), 0.), att = uLight/(1. + t*t*.9);
    vec3 hv = normalize(l - rd); float wet = max(uWet*step(.45, g), m);
    float spec = pow(max(dot(n, hv), 0.), mix(18., 90., wet))*mix(.12, 1.1, wet);
    float fres = pow(1. - max(dot(n, -rd), 0.), 3.);
    col = alb*uLightC*(dif*att*ao + .02);
    col += uLightC*spec*att*ao;
    col += vec3(.25, .45, .6)*fres*wet*att*.9*(1. - m);                 // water film: cool rim
    col += uOil*3.*fres*m*att;                                           // oil: warm glossy rim
  }
  float tf = hit ? t : 7.;
  // light arriving from a distant opening
  vec3 gp = uGlowP - uRo; float tc = clamp(dot(gp, rd), 0., tf); float gd = length(gp - rd*tc);
  vec3 glow = uGlowC/(1. + gd*gd*5.)*exp(-tc*uFogD*.5);
  col = mix(uFog*(.6 + .4*att0()), col, exp(-tf*uFogD)) + glow;
  col = col/(1. + col*.6);
  o = vec4(pow(max(col, 0.), vec3(.47)), 1.);
}`.replace('att0()', '(uLight/(1. + 2.))');

const FS_TUNNEL = `#version 300 es
precision highp float;
uniform vec2 R, uC; uniform float uZ, uTwist, uRib, uRibW, uFogD, uGlowA, uSq, uRadius, uStreak, uSeed, uTime, uLight, uWetW;
uniform vec3 uWall, uWall2, uFog, uEnd, uGlow;
out vec4 o;
${NOISE}
void main(){
  vec2 uv = (gl_FragCoord.xy*2. - R)/R.y;
  float z0 = uRadius/max(length(uv - uC*.8), .03);
  vec2 q2 = uv - uC*(1. - 1./(1. + z0*.3));
  float r = mix(length(q2), max(abs(q2.x), abs(q2.y)), uSq), a = atan(q2.y, q2.x) + uTwist;
  float z = uRadius/max(r, .004), zz = z + uZ;
  vec3 tp = vec3(cos(a)*1.6, sin(a)*1.6, zz*.6);
  float nn = fbm(tp*1.6 + uSeed), fine = n3(tp*14. + uSeed);
  vec3 wall = mix(uWall, uWall2, nn)*(.75 + .4*fine);
  float rl = abs(fract(zz*uRib + .5) - .5), rib = 1. - smoothstep(0., uRibW, rl);
  wall *= 1. - .55*rib*step(.0001, uRib); wall += .12*smoothstep(uRibW, uRibW*2.2, rl)*(1. - smoothstep(uRibW*2.2, uRibW*3.4, rl))*step(.0001, uRib);
  wall += uStreak*(n3(vec3(a*5., zz*.25, uSeed)) - .5);
  float lit = uLight*1.6/(1. + z*z*.16)*(.78 + .22*cos(a - 1.3));
  float sp = pow(max(cos(a - 1.3), 0.), 6.)*uWetW*lit*.5;
  wall *= .8 + .5*n3(vec3(a*9., zz*2.2, uSeed + 3.));   // scratches and scale
  vec3 col = wall*lit + sp + uGlow*uGlowA*(.35 + .65*fbm(vec3(a*2., zz*.5, uTime*.6)))/(1. + z*.08);
  col = mix(uFog, col, exp(-z*uFogD));
  col = mix(col, uEnd, smoothstep(5., 16., z));
  col = col/(1. + col*.5);
  o = vec4(pow(max(col, 0.), vec3(.47)), 1.);
}`;

function initGL() {
  GLC = document.createElement('canvas'); GLC.width = GLW; GLC.height = GLH;
  gl = GLC.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false });
  if (!gl) { console.error('WebGL2 unavailable'); return; }
  const sh = (t, s) => { const x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x); if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(x)); return x; };
  for (const [name, fs] of [['pore', FS_PORE], ['tunnel', FS_TUNNEL]]) {
    const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs)); gl.bindAttribLocation(p, 0, 'p'); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) console.error(gl.getProgramInfoLog(p)); PROG[name] = p;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
}
function glRender(name, u) {
  const key = name + JSON.stringify(u); if (key === lastKey) return; lastKey = key;   // identical frame: reuse
  const p = PROG[name]; gl.useProgram(p); gl.viewport(0, 0, GLW, GLH);
  gl.uniform2f(gl.getUniformLocation(p, 'R'), GLW, GLH);
  for (const k in u) { const v = u[k], loc = gl.getUniformLocation(p, k); if (loc === null) continue; if (typeof v === 'number') gl.uniform1f(loc, v); else if (v.length === 2) gl.uniform2f(loc, v[0], v[1]); else gl.uniform3f(loc, v[0], v[1], v[2]); }
  gl.drawArrays(gl.TRIANGLES, 0, 3); gl.finish();
}

// ---- looks ----
const ROCK = {
  // organic-rich source rock: dark, tight
  source: { uRad: .52, uJit: .1, uRough: .09, uGA: [.20, .17, .14], uGB: [.11, .095, .08], uFog: [.012, .010, .008], uFogD: .9, uLight: 1.0, uLightC: [1, .9, .76], uWet: 0, uDark: 1, uSeed: 3 },
  // carrier bed: coarser, paler
  carrier: { uRad: .49, uJit: .12, uRough: .11, uGA: [.56, .47, .36], uGB: [.36, .31, .25], uFog: [.05, .028, .008], uFogD: .62, uLight: 1.15, uLightC: [1, .86, .62], uWet: .5, uDark: 0, uSeed: 11 },
  // reservoir sandstone, oil in the pores, water film on part of the grains
  sand: { uRad: .5, uJit: .1, uRough: .1, uGA: [.72, .60, .44], uGB: [.50, .41, .30], uFog: [.07, .036, .008], uFogD: .6, uLight: 1.2, uLightC: [1, .84, .58], uWet: 1, uDark: 0, uSeed: 23 },
  // catalyst bed: grey-blue pellets, clear pale fluid
  cat: { uRad: .48, uJit: .14, uRough: .02, uGA: [.50, .56, .64], uGB: [.34, .38, .46], uFog: [.10, .11, .10], uFogD: .34, uLight: 1.5, uLightC: [1, .97, .9], uWet: .2, uDark: 0, uSeed: 41 },
};
const PORE0 = { uRoll: 0, uFov: 1.05, uTime: 0, uDrop: 0, uSlab: [0, 0, 0], uGlowP: [0, 0, 99], uGlowC: [0, 0, 0], uOil: [.10, .045, .008] };
// draw a pore-space frame: cam = { ro, ta, roll }, look = one of ROCK (or a blend), extra uniforms in o
function pore(ctx, cam, look, o = {}) {
  const r = v => (typeof v === 'number' ? Math.round(v * 1e4) / 1e4 : v.map(x => Math.round(x * 1e4) / 1e4));
  const u = Object.assign({}, PORE0, look, o, { uRo: cam.ro, uTa: cam.ta, uRoll: cam.roll ?? 0 }); for (const k in u) u[k] = r(u[k]);
  glRender('pore', u); ctx.drawImage(GLC, 0, 0, W, H);
}
const mixLook = (a, b, k) => { const o = {}; for (const key in a) o[key] = typeof a[key] === 'number' ? lerp(a[key], b[key], k) : a[key].map((v, i) => lerp(v, b[key][i], k)); return o; };
// camera travelling along z on the lattice line (x0, y0), with a gentle sway and wandering gaze
function camZ(z, o = {}) {
  const x0 = o.x ?? 0, y0 = o.y ?? 0, sw = o.sway ?? .045, look = o.look ?? .5;
  const P = q => [x0 + sw * Math.sin(q * 1.7 + 1), y0 + sw * Math.cos(q * 1.3), q];
  const ro = P(z), ta = P(z + look); ta[0] += (o.gx ?? 0) + .08 * Math.sin(z * .9); ta[1] += (o.gy ?? 0) + .06 * Math.cos(z * .7);
  return { ro, ta, roll: (o.roll ?? 0) + .12 * Math.sin(z * .55) };
}
const TUN0 = { uC: [0, 0], uZ: 0, uTwist: 0, uRib: 0, uRibW: .04, uFogD: .07, uGlowA: 0, uSq: 0, uRadius: 1, uStreak: .08, uSeed: 1, uTime: 0, uLight: 1, uWetW: .35, uWall: [.3, .3, .32], uWall2: [.16, .16, .18], uFog: [.05, .03, .01], uEnd: [0, 0, 0], uGlow: [0, 0, 0] };
function tunnel(ctx, o = {}) {
  const r = v => (typeof v === 'number' ? Math.round(v * 1e4) / 1e4 : v.map(x => Math.round(x * 1e4) / 1e4));
  const u = Object.assign({}, TUN0, o); for (const k in u) u[k] = r(u[k]);
  glRender('tunnel', u); ctx.drawImage(GLC, 0, 0, W, H);
}
