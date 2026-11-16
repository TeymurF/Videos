// Test frames: node snap.mjs <outdir> <t|id+sec> ...
import { createRequire } from 'module'; import path from 'path'; import fs from 'fs';
const { chromium } = createRequire(import.meta.url)('playwright');
const [out, ...ts] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
p.on('pageerror', e => console.log('PAGEERR', e.message)); p.on('console', m => (m.type() === 'error' || m.type() === 'warning') && console.log('ERR', m.text().slice(0, 600)));
await p.goto('file://' + path.resolve('src/index.html')); await p.waitForFunction('window.READY', null, { timeout: 60000 });
const meta = await p.evaluate('window.META');
console.log('total', meta.total.toFixed(1), meta.shots.map(s => `${s.id}@${s.start.toFixed(1)}`).join(' '));
for (const a of ts) {
  let T = +a; if (isNaN(T)) { const [id, off] = a.split('+'); T = meta.shots.find(s => s.id === id).start + +(off || 0); }
  const t0 = Date.now();
  const url = await p.evaluate(T => { renderFrame(T); const c = document.createElement('canvas'); c.width = 1280; c.height = 720; c.getContext('2d').drawImage(document.getElementById('cv'), 0, 0, 1280, 720); return c.toDataURL('image/jpeg', .85); }, T);
  fs.writeFileSync(path.join(out, a.replace(/[^\w.+-]/g, '_') + '.jpg'), Buffer.from(url.split(',')[1], 'base64')); console.log(a, Date.now() - t0, 'ms');
}
await b.close();
