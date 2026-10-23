// Sets the game version for a release: GAME_VERSION in index.html and the ?v= on every js/ and css/ link.
//   node tools/bump-version.mjs          -> today's date, next release number (e.g. 2026-10-23.85, shown as v85)
//   node tools/bump-version.mjs --check  -> only check that every ?v= matches GAME_VERSION (used by the play-test)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const FILE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'index.html');
const VER_RE = /const GAME_VERSION='([^']+)'/;
const LINK_RE = /((?:js\/[\w.-]+\.js|css\/[\w.-]+\.css)\?v=)([\w.-]+)/g;

export function checkVersions(html) {
  const v = (html.match(VER_RE) || [])[1];
  if (!v) return ['GAME_VERSION not found in index.html'];
  return [...html.matchAll(LINK_RE)].filter(m => m[2] !== v).map(m => `${m[1]}${m[2]} does not match GAME_VERSION ${v}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  let html = fs.readFileSync(FILE, 'utf8');
  if (process.argv.includes('--check')) {
    const bad = checkVersions(html);
    bad.forEach(b => console.log(b));
    process.exit(bad.length ? 1 : 0);
  }
  const old = html.match(VER_RE)[1];
  const next = new Date().toISOString().slice(0, 10) + '.' + (+old.split('.').pop() + 1);
  html = html.replace(VER_RE, `const GAME_VERSION='${next}'`).replace(LINK_RE, `$1${next}`);
  fs.writeFileSync(FILE, html);
  console.log(`Version ${old} -> ${next} (players see v${next.split('.').pop()})`);
}
