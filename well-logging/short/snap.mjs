// Test frames: node snap.mjs <outdir> <t1> <t2> ...  (t may be "id+sec" or "id+cN+sec")
import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)('playwright');
import path from 'path'; import fs from 'fs';
const [out, ...ts] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
p.on('pageerror', e => console.log('PAGEERR', e.message)); p.on('console', m => m.type() === 'error' && console.log('ERR', m.text()));
await p.goto('file://' + path.resolve('src/index.html')); await p.waitForFunction('window.READY', null, { timeout: 60000 });
const meta = await p.evaluate('window.META');
console.log('total', meta.total.toFixed(1), meta.scenes.map(s => `${s.id}@${s.start.toFixed(1)}+${s.dur.toFixed(1)}`).join(' '));
for (const a of ts) {
  let T = +a; if (isNaN(T)) { const [id, off, ex] = a.split('+'); const s = meta.scenes.find(s => s.id === id); const m = /^c(\d+)$/.exec(off); T = m ? s.cues[+m[1]].start + (+ex || 0) : s.start + +off; }
  const url = await p.evaluate(T => { renderFrame(T); const c = document.createElement('canvas'); c.width = 1280; c.height = 720; c.getContext('2d').drawImage(document.getElementById('cv'), 0, 0, 1280, 720); return c.toDataURL('image/jpeg', .8); }, T);
  fs.writeFileSync(path.join(out, a.replace(/[^\w.+-]/g, '_') + '.jpg'), Buffer.from(url.split(',')[1], 'base64'));
}
await b.close();
