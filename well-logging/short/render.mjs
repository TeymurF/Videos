// Renders the animation to video.
//   node render.mjs --meta            write out/meta.json and out/captions.srt only
//   node render.mjs [--workers 4]     render frames, then mux with out/audio.wav if present
import { createRequire } from 'module';
import { spawn, execFileSync } from 'child_process';
import path from 'path'; import fs from 'fs';
const { chromium } = createRequire(import.meta.url)('playwright');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i < 0 ? d : (process.argv[i + 1] ?? true); };
const FPS = +arg('fps', 30), WORKERS = +arg('workers', 4), OUT = arg('out', 'out'), NAME = arg('name', 'well-logging-short.mp4');
fs.mkdirSync(OUT, { recursive: true });
const url = 'file://' + path.resolve('src/index.html');
const browser = await chromium.launch();
const open = async () => { const p = await browser.newPage({ viewport: { width: 1920, height: 1080 } }); p.on('pageerror', e => { console.error('PAGE ERROR', e.message); process.exit(1); }); await p.goto(url); await p.waitForFunction('window.READY', null, { timeout: 120000 }); return p; };
const first = await open(), meta = await first.evaluate('window.META');
fs.writeFileSync(path.join(OUT, 'meta.json'), JSON.stringify(meta, null, 1));
const ts = t => { const ms = Math.round(t * 1000), p = (n, l = 2) => String(n).padStart(l, '0'); return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`; };
fs.writeFileSync(path.join(OUT, 'captions.srt'), meta.scenes.flatMap(s => s.cues).map((c, i) => `${i + 1}\n${ts(c.start)} --> ${ts(c.end)}\n${c.text}\n`).join('\n'));
console.log(`duration ${meta.total.toFixed(1)} s, ${meta.scenes.length} scenes`);
if (arg('meta', false)) { await browser.close(); process.exit(0); }

const from = Math.round(+arg('from', 0) * FPS), to = Math.round(+arg('to', meta.total) * FPS), per = Math.ceil((to - from) / WORKERS);
let done = 0; const t0 = Date.now();
const tick = setInterval(() => console.log(`${done}/${to - from} frames, ${((Date.now() - t0) / 1000).toFixed(0)} s`), 15000);
const chunks = await Promise.all(Array.from({ length: WORKERS }, async (_, w) => {
  const a = from + w * per, b = Math.min(to, a + per), file = path.join(OUT, `chunk_${w}.mp4`);
  const page = w ? await open() : first;
  const ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', String(arg('crf', 21)), '-pix_fmt', 'yuv420p', '-threads', '2', file], { stdio: ['pipe', 'inherit', 'inherit'] });
  const closed = new Promise((res, rej) => ff.on('close', c => c ? rej(new Error('ffmpeg exit ' + c)) : res()));
  for (let f = a; f < b; f++) {
    const b64 = await page.evaluate(T => { renderFrame(T); return document.getElementById('cv').toDataURL('image/jpeg', 0.94).slice(23); }, f / FPS);
    if (!ff.stdin.write(Buffer.from(b64, 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
    done++;
  }
  ff.stdin.end(); await closed; return file;
}));
clearInterval(tick); await browser.close();
fs.writeFileSync(path.join(OUT, 'list.txt'), chunks.map(c => `file '${path.resolve(c)}'`).join('\n'));
const audio = path.join(OUT, 'audio.wav'), final = path.join(OUT, NAME);
execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(OUT, 'list.txt'), ...(fs.existsSync(audio) ? ['-i', audio, '-c:a', 'aac', '-b:a', '160k', '-shortest'] : []), '-c:v', 'copy', '-movflags', '+faststart', final], { stdio: 'inherit' });
chunks.forEach(c => fs.unlinkSync(c)); fs.unlinkSync(path.join(OUT, 'list.txt'));
console.log('written', final, ((Date.now() - t0) / 1000).toFixed(0) + ' s');
