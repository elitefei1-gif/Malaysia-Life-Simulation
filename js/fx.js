'use strict';
// Toast, save/load, motion effects and the auto-update check.
/* ================= toast & save ================= */
/* ---- v81 motion: action icons fly into the stats they raise, coins into Cash, celebrations, new-year banner ---- */
const RM_MOTION=matchMedia('(prefers-reduced-motion: reduce)');
// Skipped for reduced motion, auto years, hidden tabs, and when effects pile up faster than they finish (scripted play).
const noFx=()=>RM_MOTION.matches||autoYears>0||document.hidden||typeof Element.prototype.animate!=='function'||($('#fx')&&$('#fx').childElementCount>120);
const ACT_FX={play:['🧸','✨','😄'],study:['📚','✏️','💡'],exercise:['💪','💦','❤️'],social:['💬','😄','🧋'],hobby:['🎨','✨','🖌️'],lang:['💬','🔤','🗣️'],
  routine:['📅','✅','⏰'],groom:['✨','💇','🪞'],volunteer:['🤝','⭐','🌟'],parttime:['💵','✨'],overtime:['💼','✨'],date:['💕','❤️','🌹'],kids:['🧸','❤️','🎈'],
  baby:['🍼','💕','✨'],adopt:['🍼','💕','✨'],nation:['🇲🇾','⭐','✨'],invest:['📈','✨'],rest:['😴','☁️','✨']};
const FX_KEYS=['int','hlt','cha','look','cre','ath','dis','hap','know'];
const fxVal=(o,k)=>Math.round(k==='know'?(o.know||0):o.stats?o.stats[k]:o[k]);
function fxLayer(){let l=$('#fx');if(!l){l=document.createElement('div');l.id='fx';l.setAttribute('aria-hidden','true');document.body.appendChild(l);}return l;}
function fxCtr(r){return [r.left+r.width/2,r.top+r.height/2];}
function fxEl(tag,cls,html){const e=document.createElement(tag);e.className=cls;if(html!=null)e.innerHTML=html;fxLayer().appendChild(e);return e;}
// One particle: pops up near the source, then arcs into the target and fades.
function fxFly(html,cls,from,to,delay){const e=fxEl('i','fx-p '+cls,html),[x0,y0]=from,dx=to[0]-x0,dy=to[1]-y0,sx=(Math.random()-.5)*70,up=30+Math.random()*30;
  const at=(x,y,s)=>`translate(${x0+x}px,${y0+y}px) translate(-50%,-50%) scale(${s})`;
  e.animate([{transform:at(0,0,.3),opacity:0},{transform:at(sx,-up,1.1),opacity:1,offset:.2},{transform:at(dx,dy,.6),opacity:.9,offset:.92},{transform:at(dx,dy,.4),opacity:0}],
    {duration:850,delay,easing:'cubic-bezier(.5,0,.6,1)',fill:'both'}).onfinish=()=>e.remove();}
function fxLabel(txt,at,neg){const e=fxEl('b','fx-lbl'+(neg?' neg':''));e.textContent=txt;const [x,y]=at,p=(dy,s)=>`translate(${x}px,${y+dy}px) translate(-50%,-50%) scale(${s})`;
  e.animate([{transform:p(10,.6),opacity:0},{transform:p(0,1.1),opacity:1,offset:.2},{transform:p(0,1),opacity:1,offset:.7},{transform:p(-40,1),opacity:0}],{duration:1500,delay:350,fill:'both',easing:'ease-out'}).onfinish=()=>e.remove();}
function fxPulse(el,cls){if(!el)return;el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls);setTimeout(()=>el.classList.remove(cls),1200);}
function fxRusty(){return [...document.querySelectorAll('#g-stats .rusty-tag')].map(e=>[e.closest('.stat').dataset.k,e.getBoundingClientRect()]);}
function actFx(id,src,b,pre){if(noFx()||!src)return;const LAND=750,from=fxCtr(src),parts=ACT_FX[id]||['✨'];let n=0;const ups=[];
  fxPulse($(`.act[data-arg="${id}"]`),'fx-picked');
  for(const k of FX_KEYS){const v0=fxVal(b,k),v1=fxVal(S,k);if(v0===v1)continue;
    const st=$(`.stat[data-k="${k}"]`);if(!st)continue;const bar=st.querySelector('.bar i'),num=st.querySelector('.lbl>span:last-child');
    bar.style.transition='none';bar.style.width=Math.max(0,v0)+'%';num.textContent=v0;void bar.offsetWidth;
    setTimeout(()=>{bar.style.transition='width .7s cubic-bezier(.2,1.3,.4,1)';bar.style.width=v1+'%';num.textContent=v1;fxPulse(num,'fx-tick');fxPulse(st,'fx-glow');},v1>v0?LAND:250);
    if(v1>v0)ups.push([k,v1-v0,st]);}
  for(const [,,st] of ups){const to=fxCtr(st.querySelector('.bar').getBoundingClientRect());for(let j=0;j<3;j++){fxFly(parts[n%parts.length],'fx-emo',from,to,120+n*70);n++;}}
  const dm=S.money-b.money,cash=$('#id-cash');
  if(dm>=1&&cash){const to=fxCtr(cash.getBoundingClientRect());for(let j=0;j<6;j++)fxFly('RM','fx-coin',from,to,120+j*80);
    cash.textContent=fmt(b.money);setTimeout(()=>{cash.textContent=fmt(S.money);fxPulse(cash,'fx-tick');fxPulse(cash.parentElement,'fx-glow');},LAND+300);}
  const lab=dm>=1?'+'+fmt(dm):ups.slice(0,2).map(([k,d])=>'+'+d+' '+(k==='know'?'Knowledge':STAT_NAMES[k])).join(' · ');
  if(lab)fxLabel(lab,[from[0],src.top]);
  // A "rusty" tag that this action cleared falls off its stat.
  for(const [k,r] of pre)if(!$(`#g-stats .stat[data-k="${k}"] .rusty-tag`)){const e=fxEl('small','rusty-tag fx-fall','rusty');
    e.animate([{transform:`translate(${r.left}px,${r.top}px)`,opacity:1},{transform:`translate(${r.left}px,${r.top}px) rotate(-12deg)`,offset:.3},{transform:`translate(${r.left}px,${r.top+40}px) rotate(30deg)`,opacity:0}],
      {duration:700,delay:LAND+200,easing:'ease-in',fill:'both'}).onfinish=()=>e.remove();}}
// Hibiscus petals and gold confetti for big moments.
function fxCelebrate(){const H=innerHeight,W=innerWidth;for(let i=0;i<42;i++){const k=['h','h','g','g','f'][i%5],e=fxEl('i','fx-p fx-petal '+k,k==='f'?'🌺':'');
  if(k!=='f')e.style.background=k==='h'?['#c92c43','#e04a5f','#ff8fa3'][i%3]:['#e7b84a','#0b8a7d','#f5d78a'][i%3];
  const x=Math.random()*W,sw=(Math.random()-.5)*120,r=360+Math.random()*360;
  e.animate([{transform:`translate(${x}px,-30px) rotate(0)`},{transform:`translate(${x+sw}px,${H+40}px) rotate(${r}deg)`}],{duration:2400+Math.random()*1800,delay:Math.random()*900,easing:'linear',fill:'both'}).onfinish=()=>e.remove();}}
// Life-changing events, matched on the log line the game writes when they happen (not on pop-up wording,
// which celebrated "A card at a wedding dinner" and missed becoming an MP). Promotions count only at the top rank.
const FX_LIFE=/^(Married |Welcomed .+ into the family|Adopted .+ into the family|Graduated|First-class honours|Conferred the title|Won the (Parliament|state) seat|Became Menteri Besar|The Prime Minister resigned\. You take over|Won the 4D jackpot)/;
function fxLifeEvent(t){return FX_LIFE.test(t)||(/^Promoted to /.test(t)&&!!S.job&&S.job.level===JOBS[S.job.id].levels.length-1);}
// A pop-up celebrates when it has _party: set on the event's own pop-up (baby, graduation, royal honour, Prime
// Minister, top promotion), or by choose() when the choice just made logged one (wedding, title, seat, jackpot).
let fxParty=0,fxLast=0;
// A choice can also retitle its result and swap the picture: getting married shows the wedding, not the proposal.
let fxArt=null;
function modalFx(m){if(noFx()||m._fx)return;m._fx=1;const d=m.delta||[];
  if(m._party&&Date.now()-fxLast>4000){fxLast=Date.now();fxCelebrate();}
  const mm=d.find(x=>/^\+RM/.test(x));if(!mm||!S)return;const amt=+mm.replace(/[^\d.]/g,'')*(/M$/.test(mm)?1e6:1);
  const w=fxEl('div','fx-wallet',`${ico('m_money','st')}Cash <b>${fmt(S.money-amt)}</b>`),wb=w.querySelector('b');
  w.animate([{transform:'translate(-50%,-60px)',opacity:0},{transform:'translate(-50%,0)',opacity:1,offset:.12},{transform:'translate(-50%,0)',opacity:1,offset:.88},{transform:'translate(-50%,-60px)',opacity:0}],{duration:3200,delay:200,fill:'both',easing:'ease-out'}).onfinish=()=>w.remove();
  setTimeout(()=>{const s=$('#m-sheet');if(!s||!w.isConnected)return;const from=fxCtr(s.getBoundingClientRect()),to=fxCtr(w.getBoundingClientRect());
    for(let j=0;j<8;j++)fxFly('RM','fx-coin',from,to,j*80);setTimeout(()=>{wb.textContent=fmt(S.money);fxPulse(wb,'fx-tick');fxPulse(w,'fx-glow');},950);},500);}
// New year: a songket banner sweeps in and the age flips over.
function yearFx(a0){if(noFx()||!S||!S.alive||age()===a0)return;
  const e=fxEl('div','fx-banner',`<div class="fx-age"><span>${a0}</span><span>${age()}</span></div><div class="fx-btxt"><small>Happy new year</small>Year ${S.year}</div>`),[o,nw]=e.querySelectorAll('.fx-age span');
  e.animate([{transform:'translateX(-100%)',easing:'cubic-bezier(.2,1,.3,1)'},{transform:'none',offset:.2},{transform:'none',offset:.85,easing:'ease-in'},{transform:'translateX(100%)'}],{duration:2600,fill:'both'}).onfinish=()=>e.remove();
  o.animate([{transform:'none',opacity:1},{transform:'rotateX(90deg)',opacity:0}],{duration:400,delay:650,fill:'both'});
  nw.animate([{transform:'rotateX(-90deg)',opacity:0},{transform:'none',opacity:1}],{duration:400,delay:1000,fill:'both'});}
let tt;function toast(t){sfx('locked');const el=$('#toast');el.textContent=t;el.hidden=false;clearTimeout(tt);tt=setTimeout(()=>el.hidden=true,2600);}
function barCls(v){return v<30?'lv1':v<50?'lv2':v<75?'lv3':'lv4';}
const SKIN_KEY='my-lifesim-skin';
function skinNow(){return document.documentElement.dataset.skin||'songket';}
function setSkin(k){if(k==='songket')delete document.documentElement.dataset.skin;else document.documentElement.dataset.skin=k;try{localStorage.setItem(SKIN_KEY,k);}catch(e){}}
// Home screen icon: the phone reads it when the game is added to the home screen (see the <head> script in index.html).
const ICON_KEY='my-lifesim-icon',APP_ICONS=[['kid','Kid','img/icon_kid.png'],['hibiscus','Hibiscus','img/icon_hibiscus.png'],['malam','Malam','img/icon_malam.png']];
function iconNow(){let k;try{k=localStorage.getItem(ICON_KEY);}catch(e){}return APP_ICONS.some(x=>x[0]===k)?k:'kid';}
function setAppIcon(k){const I=APP_ICONS.find(x=>x[0]===k);if(!I)return;try{localStorage.setItem(ICON_KEY,k);}catch(e){}['ico-apple','ico-fav'].forEach(id=>{const l=document.getElementById(id);if(l)l.href=I[2];});}
function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(S));}catch(e){}}
/* ---- auto-update: home-screen web apps on iPhone can keep showing an old cached copy ---- */
const VERSION_LABEL='v'+GAME_VERSION.split('.').pop();
document.querySelectorAll('.ver-label').forEach(el=>el.textContent=VERSION_LABEL);
function checkUpdate(){if(!/^https?:$/.test(location.protocol)||!window.fetch)return;
  fetch(location.pathname+'?check='+Date.now(),{cache:'no-store'}).then(r=>r.ok?r.text():'').then(t=>{const m=t.match(/const GAME_VERSION='([^']+)'/);
    if(!m||m[1]===GAME_VERSION)return;if(new URLSearchParams(location.search).get('v')===m[1])return;
    if(S&&S.alive&&!cur)save();location.replace(location.pathname+'?v='+encodeURIComponent(m[1])+location.hash);}).catch(()=>{});}
window.addEventListener('load',checkUpdate);
if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol))window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkUpdate();});
// Save backup: the whole save as one text code, so a player can keep it in Notes and restore it on any phone.
const CODE_TAG='MYLIFE1:';
function saveCode(){if(S)save();let r;try{r=localStorage.getItem(SAVE_KEY);}catch(e){}if(!r)return '';const b=new TextEncoder().encode(r);let s='';for(let i=0;i<b.length;i+=8192)s+=String.fromCharCode(...b.subarray(i,i+8192));return CODE_TAG+btoa(s);}
function readCode(c){c=(c||'').replace(/\s+/g,'');if(!c.startsWith(CODE_TAG))return null;try{const s=atob(c.slice(CODE_TAG.length)),b=Uint8Array.from(s,ch=>ch.charCodeAt(0)),o=JSON.parse(new TextDecoder().decode(b));return o&&o.stats&&o.year&&o.birthYear?o:null;}catch(e){return null;}}
function load(){try{const r=localStorage.getItem(SAVE_KEY);return r?JSON.parse(r):null;}catch(e){return null;}}
function clearSave(){try{localStorage.removeItem(SAVE_KEY);}catch(e){}}

