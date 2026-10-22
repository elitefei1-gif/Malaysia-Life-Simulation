// Offline support for Malaysian Life Simulator.
// The page (index.html) is network-first: always try GitHub, fall back to the saved copy when offline.
// Pictures, music and fonts are cache-first. Every img/ and music/ file named in index.html is
// saved on the first online visit, and topped up whenever a newer index.html arrives.
const PAGE_CACHE='lifesim-page-v1',ASSET_CACHE='lifesim-assets-v1',FONT_CACHE='lifesim-fonts-v1';
const KEEP=[PAGE_CACHE,ASSET_CACHE,FONT_CACHE];
const SCOPE=new URL(self.registration.scope);
const PAGE_KEY=new URL('./',SCOPE).href;
const PAGE_TIMEOUT=6000;

self.addEventListener('install',e=>{e.waitUntil(fetchPage().catch(()=>{}).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('lifesim-')&&!KEEP.includes(k)).map(k=>caches.delete(k))))
  .then(()=>self.clients.claim()).then(()=>warm()));});
self.addEventListener('message',e=>{if(e.data==='warm')e.waitUntil(warm());});

function isPage(url){if(url.origin!==SCOPE.origin)return false;const p=url.pathname;return p===SCOPE.pathname||p===SCOPE.pathname+'index.html';}
function isAsset(url){return url.origin===SCOPE.origin&&/\/(img|music)\/[^/]+$/.test(url.pathname);}
function isFont(url){return url.hostname==='fonts.googleapis.com'||url.hostname==='fonts.gstatic.com';}

self.addEventListener('fetch',e=>{const req=e.request;if(req.method!=='GET')return;const url=new URL(req.url);
  if(req.mode==='navigate'&&url.origin===SCOPE.origin&&url.pathname.startsWith(SCOPE.pathname)&&(isPage(url)||url.pathname.endsWith('/')))e.respondWith(pageFirst());
  else if(isPage(url))e.respondWith(pageFirst());
  else if(isAsset(url))e.respondWith(assetFirst(req,url));
  else if(isFont(url))e.respondWith(fontFirst(req));});

// Fetch index.html fresh and keep a copy. Resolves with the network response.
function fetchPage(){return fetch(PAGE_KEY,{cache:'no-cache',credentials:'same-origin'}).then(r=>{
  if(r.ok){const c=r.clone();caches.open(PAGE_CACHE).then(ch=>ch.put(PAGE_KEY,c)).then(()=>warm()).catch(()=>{});}return r;});}
function pageFirst(){const net=fetchPage();
  const timeout=new Promise((_,rej)=>setTimeout(()=>rej(new Error('slow')),PAGE_TIMEOUT));
  return Promise.race([net,timeout]).then(r=>r.ok?r:fromPageCache().then(c=>c||r))
    .catch(()=>fromPageCache().then(c=>c||net));}
function fromPageCache(){return caches.open(PAGE_CACHE).then(c=>c.match(PAGE_KEY));}

function assetFirst(req,url){const key=url.origin+url.pathname;
  return caches.open(ASSET_CACHE).then(c=>c.match(key).then(hit=>{
    if(hit)return withRange(req,hit);
    return fetch(key,{credentials:'same-origin'}).then(r=>{if(r.ok&&r.status===200){c.put(key,r.clone()).catch(()=>{});return withRange(req,r);}return r;})
      .catch(()=>fetch(req));}));}
// Audio asks for byte ranges; Safari needs a proper 206 answer from a cached full file.
function withRange(req,res){const h=req.headers.get('range');if(!h||res.status!==200)return res;
  const m=/bytes=(\d*)-(\d*)/.exec(h);if(!m)return res;
  return res.arrayBuffer().then(buf=>{const size=buf.byteLength;let start=m[1]===''?size-Number(m[2]):Number(m[1]);let end=m[1]!==''&&m[2]!==''?Number(m[2]):size-1;
    start=Math.max(0,start);end=Math.min(end,size-1);
    if(start>end)return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+size}});
    return new Response(buf.slice(start,end+1),{status:206,headers:{'Content-Type':res.headers.get('Content-Type')||'application/octet-stream',
      'Content-Range':'bytes '+start+'-'+end+'/'+size,'Content-Length':String(end-start+1),'Accept-Ranges':'bytes'}});});}

function fontFirst(req){return caches.open(FONT_CACHE).then(c=>c.match(req).then(hit=>hit||fetch(req).then(r=>{if(r.ok||r.type==='opaque')c.put(req,r.clone()).catch(()=>{});return r;})));}

// Once per game version, ask GitHub (HEAD only, no download) whether any saved file was redrawn
// under the same name, and fetch just those again.
const MARK=new URL('./__sw-checked-version',SCOPE).href;
function recheck(c,html,urls){const v=(html.match(/const GAME_VERSION='([^']+)'/)||[])[1];if(!v)return;
  return caches.open(PAGE_CACHE).then(pc=>pc.match(MARK).then(m=>m?m.text():'').then(done=>{if(done===v)return;
    let i=0;const next=()=>{if(i>=urls.length)return Promise.resolve();const u=urls[i++];
      return c.match(u).then(old=>fetch(u,{method:'HEAD',cache:'no-store',credentials:'same-origin'}).then(h=>{
        if(!h.ok||!old)return;const tag=x=>x.headers.get('etag')||x.headers.get('last-modified')||'';
        if(tag(h)&&tag(h)!==tag(old))return fetch(u,{cache:'no-store',credentials:'same-origin'}).then(r=>{if(r.ok&&r.status===200)return c.put(u,r);});
      })).catch(()=>{}).then(next);};
    return Promise.all([next(),next(),next(),next()]).then(()=>{if(navigator.onLine!==false)return pc.put(MARK,new Response(v));});}));}

// Save every picture and music file the current page names, skipping ones already saved.
// Files no longer named are removed so the cache doesn't grow forever.
let warming=null;
function warm(){if(warming)return warming;
  warming=fromPageCache().then(p=>p?p.text():'').then(html=>{if(!html)return;
    const want=new Set((html.match(/(?:img|music)\/[A-Za-z0-9_.@-]+\.(?:webp|png|jpg|mp3)/g)||[]).map(p=>new URL(p,SCOPE).href));
    return caches.open(ASSET_CACHE).then(c=>c.keys().then(keys=>{const have=new Set(keys.map(k=>k.url));
      keys.forEach(k=>{if(!want.has(k.url))c.delete(k);});
      const todo=[...want].filter(u=>!have.has(u));let i=0;
      const next=()=>{if(i>=todo.length)return Promise.resolve();const u=todo[i++];
        return fetch(u,{credentials:'same-origin'}).then(r=>{if(r.ok&&r.status===200)return c.put(u,r);}).catch(()=>{}).then(next);};
      return Promise.all([next(),next(),next(),next()]).then(()=>recheck(c,html,[...want].filter(u=>have.has(u))));}));
  }).catch(()=>{}).then(()=>{warming=null;});
  return warming;}
