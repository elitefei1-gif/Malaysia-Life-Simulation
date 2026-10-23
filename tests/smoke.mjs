// Play-test: serves the game locally, plays several random lives in headless Chromium and
// fails on any JavaScript error. Run with:  node tests/smoke.mjs   (options: --lives=N --seed=N --steps=N)
// Every life is driven by a seeded random number generator, so a failing seed can be replayed.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { checkVersions } from '../tools/bump-version.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k, d) => { const a = process.argv.find(x => x.startsWith('--' + k + '=')); return a ? a.split('=')[1] : d; };
const LIVES = +arg('lives', 6), SEED = +arg('seed', 1), STEPS = +arg('steps', 4000);
const badVersions = checkVersions(fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'));
if (badVersions.length) { badVersions.forEach(b => console.log(b)); console.log('\nRun: node tools/bump-version.mjs'); process.exit(1); }
// Every picture and music file named in the code must exist (names are case-sensitive on GitHub Pages).
const code = ['index.html', 'sw.js', ...['css', 'js'].flatMap(d => fs.readdirSync(path.join(ROOT, d)).map(f => d + '/' + f))]
  .map(f => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n');
const missing = [...new Set(code.match(/(?:img|music)\/[A-Za-z0-9_.@-]+\.(?:webp|png|jpg|mp3)/g) || [])].filter(f => !fs.existsSync(path.join(ROOT, f)));
if (missing.length) { console.log('Missing files named in the code:\n  ' + missing.join('\n  ')); process.exit(1); }
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.mp3': 'audio/mpeg' };

const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  const file = p.endsWith(path.sep) ? path.join(p, 'index.html') : p;
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const URL_ = `http://127.0.0.1:${server.address().port}/`;

const browser = await chromium.launch(fs.existsSync('/opt/pw-browsers/chromium') ? { executablePath: '/opt/pw-browsers/chromium' } : {});
let failed = false;

for (let n = 0; n < LIVES; n++) {
  const seed = SEED + n;
  const ctx = await browser.newContext({ reducedMotion: 'reduce', serviceWorkers: 'block' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + (e.stack || e.message)));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push('console.error: ' + m.text()); });
  page.on('response', r => { if (r.status() >= 400) errors.push(`missing file (${r.status()}): ${r.url().replace(URL_, '')}`); });
  // Seed the game's Math.random so the whole life is reproducible.
  await page.addInitScript(s => {
    let a = s >>> 0;
    Math.random = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    try { localStorage.clear(); } catch (e) {}
  }, seed);
  await page.goto(URL_);
  // Pick setup options at random, then be born.
  const result = await page.evaluate(async ({ seed, steps }) => {
    let b = (seed * 2654435761) >>> 0;
    const rnd = () => { b ^= b << 13; b >>>= 0; b ^= b >>> 17; b ^= b << 5; b >>>= 0; return b / 4294967296; };
    const pickEl = list => list[Math.floor(rnd() * list.length)];
    const vis = sel => { const el = document.querySelector(sel); return el && !el.hidden; };
    const tick = () => new Promise(r => setTimeout(r, 0));
    document.querySelector('[data-act="toSetup"]').click();
    for (const seg of document.querySelectorAll('#s-setup [data-seg]')) pickEl([...seg.querySelectorAll('button:not(:disabled)')]).click();
    document.querySelector('[data-act="beBorn"]').click();
    document.querySelector('#s-birth [data-act="startLife"]').click();
    let clicks = 0, generations = 1;
    for (let i = 0; i < steps; i++) {
      if (i % 25 === 0) await tick();
      // When a life ends, carry on as an heir (Dynasty mode) for up to 3 generations.
      if (vis('#s-end') && !vis('#modal')) {
        const heirs = [...document.querySelectorAll('#s-end [data-act="heir"], #s-end [data-act="relative"]')];
        if (generations >= 3 || !heirs.length) break;
        pickEl(heirs).click(); generations++; continue;
      }
      if (!vis('#s-game') && !vis('#modal')) break;
      if (vis('#modal')) { const bs = [...document.querySelectorAll('#m-sheet button:not(:disabled)')]; if (bs.length) { pickEl(bs).click(); clicks++; continue; } }
      const r = rnd();
      if (r < 0.65) {
        // Everything on the game screen except "abandon" (start a different family), which would end the test early.
        const bs = [...document.querySelectorAll('#g-tabs button, #g-panel button[data-act]:not(:disabled):not([data-act^="abandon"])')];
        if (bs.length) { pickEl(bs).click(); clicks++; continue; }
      }
      document.querySelector('#btn-next').click(); clicks++;
    }
    await tick();
    return { clicks, generations, ended: vis('#s-end'), S: typeof S === 'object' && S ? { year: S.year, alive: S.alive, money: Math.round(S.money), log: (S.log || []).length } : null };
  }, { seed, steps: STEPS });
  const ok = !errors.length;
  console.log(`life seed=${seed}: ${ok ? 'ok' : 'FAILED'}  ${JSON.stringify(result)}`);
  for (const e of errors.slice(0, 5)) console.log('  ' + e.split('\n').slice(0, 4).join('\n  '));
  if (!ok) failed = true;
  await ctx.close();
}
// Offline check: let the service worker save everything, go offline, reload, and play a few years.
{
  const ctx = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  await page.goto(URL_);
  const saved = await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    const want = [...document.querySelectorAll('script[src], link[rel=stylesheet][href^="css/"]')].map(e => new URL(e.src || e.href, location.href).href);
    for (let i = 0; i < 300; i++) {
      const c = await caches.open('lifesim-code-v1'), have = (await c.keys()).map(k => k.url);
      const page = await (await caches.open('lifesim-page-v1')).match(new URL('./', location.href).href);
      if (page && want.every(u => have.includes(u))) return true;
      await new Promise(r => setTimeout(r, 100));
    }
    return false;
  });
  await ctx.setOffline(true);
  await page.reload();
  const played = await page.evaluate(async () => {
    document.querySelector('[data-act="toSetup"]').click();
    document.querySelector('[data-act="beBorn"]').click();
    document.querySelector('#s-birth [data-act="startLife"]').click();
    for (let i = 0; i < 200 && S && S.alive && age() < 10; i++) {
      const b = document.querySelector('#modal:not([hidden]) #m-sheet button:not(:disabled)');
      (b || document.querySelector('#btn-next')).click();
      await new Promise(r => setTimeout(r, 0));
    }
    return S ? age() : -1;
  }).catch(e => { errors.push(String(e)); return -1; });
  const ok = saved && played > 0 && !errors.length;
  console.log(`offline: ${ok ? 'ok' : 'FAILED'}  files saved: ${saved}, years played offline: ${played}`);
  for (const e of errors.slice(0, 5)) console.log('  ' + e);
  if (!ok) failed = true;
  await ctx.close();
}
await browser.close();
server.close();
if (failed) { console.log('\nSmoke test FAILED'); process.exit(1); }
console.log('\nSmoke test passed');
