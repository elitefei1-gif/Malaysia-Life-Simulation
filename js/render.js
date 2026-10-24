'use strict';
// Drawing the screens: header, stats, tabs, panels, birth and end screens.
/* ================= render ================= */
function avatarKey(){const a=age(),m=S.gender==='M';if(!S.alive)return 'av_rip';if(a<4)return 'av_baby';if(a<13)return m?'av_boy':'av_girl';if(a<20)return m?'av_teen_m':'av_teen_f';if(a<60)return m?'av_man':'av_woman';return m?'av_old_m':'av_old_f';}
function stageName(){const a=age(),E=S.edu;if(!S.alive)return 'Passed away';if(a<4)return 'Baby';if(a<7)return E.school||'Tadika';if(a<13)return 'Primary school';
  if(a<18)return {board:'Boarding school',uec:'Independent school',intl:'International school'}[E.secondary]||'Secondary school';if(E.track)return E.track.label;if(S.retired)return 'Retired';if(S.job)return JOBS[S.job.id].levels[S.job.level];return a<62?'Looking for work':'Retired';}
// Only replace a section when its markup changed, so pictures that are already showing aren't rebuilt each year.
function setHtml(el,h){if(el._h!==h){el.innerHTML=h;el._h=h;}}
// Keep the main-screen icons decoded in memory so they appear instantly after Next year.
const ICON_WARM=[];let iconsWarm='';
function warmIcons(){const c=icoCult();if(iconsWarm===c)return;iconsWarm=c;
  for(const k of [...ACTS.map(x=>'a_'+x.id),...Object.keys(STAT_NAMES).map(x=>'s_'+x),...TABS.map(([x])=>'t_'+x)]){const src=icoSrc(k);if(src){const im=new Image();im.src=src;ICON_WARM.push(im);}}}
function render(){if(!S)return;fixPartners();warmIcons();
  const C=ctry(),loc=S.country==='MY'?town().name:C.city+', '+C.name;
  setHtml($('#g-head'),`<div class="idcard${honTier()?' hon hon'+honTier():''}">${honTier()?`<i class="hon-em" aria-hidden="true">${['','✦','✶','✷','❂'][honTier()]}</i>`:''}<div class="id-top"><span>Identity card · ${esc(CULTURES[S.dyn.culture||S.culture].famLabel(S.dyn.famName||S.famName))}</span><span>${C.flag} Gen ${S.dyn.gen}<button class="gear" data-act="settings" aria-label="Settings" title="Settings">⚙️</button></span></div>
    <div class="id-body">${ico(avatarKey(),'lg')}<div class="id-main"><div class="id-name">${S.honour?`<span class="id-hon">${esc(S.honour)}</span> `+esc(S.name):esc(dispName())}</div><div class="id-no">${S.ic}</div><div class="id-meta">${esc(loc)} · ${esc(stageName())}</div></div>
    <div class="id-age"><b>${age()}</b><span>yrs · ${S.year}</span><div class="pips id-pips" id="g-pips" title="Actions left this year"></div>${honTier()?`<b class="hon-tag">${'★'.repeat(honTier())}</b>`:''}</div></div>
    <div class="id-money"><span>Cash <b id="id-cash" class="${S.money<0?'neg':''}">${fmt(S.money)}</b></span><span>Net worth <b class="${netWorth()<0?'neg':''}">${fmt(netWorth())}</b></span><span>Household <b>${S.group}</b></span></div></div>`);
  $('#g-news').innerHTML=S.world.active.map(e=>`<span class="${e.good?'good':''}" title="${esc(e.desc)}">${e.good?'▲':'▼'} ${esc(e.title)}</span>`).join('');
  setHtml($('#g-stats'),['int','hlt','cha','look','cre','ath','dis','hap'].map(k=>{const v=Math.round(S.stats[k]);return `<div class="stat" data-k="${k}"><div class="lbl"><span>${ico('s_'+k,'st')}${STAT_NAMES[k]}${rusty(k)?' <small class="rusty-tag" title="Fading: try '+FADE_HOW[k]+'">rusty</small>':''}${k==='hlt'&&v<HLT_WEAK?` <small class="weak-tag" title="You get sick more often and are at higher risk of dying. Below ${HLT_CRIT} you go to hospital.">${inHosp()?'in hospital':v<HLT_CRIT?'critical':'weak'}</small>`:''}</span><span>${v}</span></div><div class="bar"><i class="${barCls(v)}" style="width:${v}%"></i></div></div>`;}).join(''));statBubble();
  $('#g-pips').innerHTML=Array.from({length:apFor()},(_,i)=>`<i class="${i<S.ap?'on':''}"></i>`).join('');
  setHtml($('#g-tabs'),TABS.map(([k,l])=>`<button role="tab" data-act="tab" data-arg="${k}" aria-selected="${tab===k}" style="--tc:var(--t-${k})">${ico('t_'+k)}<span>${l}</span></button>`).join(''));
  $('#g-panel').style.setProperty('--tc','var(--t-'+tab+')');
  $('#btn-next').disabled=!S.alive;
  if(tab==='dynasty')tab='family';if(!TABS.some(t=>t[0]===tab))tab='life';const P={life:panelLife,assets:panelAssets,travel:panelTravel,family:panelFamily}[tab];setHtml($('#g-panel'),P());bgm();}
// The stats bubble shows the stat that needs the most work: its picture, a ring filled to its value, and a red count of low stats.
const BUB_KEYS=['int','hlt','cha','look','cre','ath','dis','hap'],BUB_KEY='my-lifesim-bubble';
function statBubble(){const b=$('#sbub');if(!b||!S)return;const low=BUB_KEYS.reduce((m,k)=>S.stats[k]<S.stats[m]?k:m,BUB_KEYS[0]),v=Math.round(S.stats[low]),n=BUB_KEYS.filter(k=>S.stats[k]<35).length;
  b.innerHTML=`<svg viewBox="0 0 70 70" aria-hidden="true"><circle cx="35" cy="35" r="31" class="trk"/><circle cx="35" cy="35" r="31" class="arc ${barCls(v)}" stroke-dasharray="${(2*Math.PI*31*v/100).toFixed(1)} 999" transform="rotate(-90 35 35)"/></svg>${ico('s_'+low)}${n?`<span class="dot">${n}</span>`:''}`;
  b.title=`Needs the most work: ${STAT_NAMES[low]} (${v})`;$('#sp-age').textContent='age '+age();bubPlace();}
function bubPos(){let p;try{p=JSON.parse(localStorage.getItem(BUB_KEY));}catch(e){}return p&&p.y!=null?p:{side:'r',y:.72};}
function bubPlace(){const b=$('#sbub'),p=bubPos(),W=innerWidth,H=innerHeight,s=64;b.style.left=(p.side==='l'?10:W-s-10)+'px';b.style.top=Math.round(clamp(p.y*H,70,H-s-110))+'px';if(!$('#statpop').hidden)popPlace();}
function popPlace(){const b=$('#sbub').getBoundingClientRect(),pop=$('#statpop'),W=innerWidth,H=innerHeight,w=Math.min(320,W-24),left=b.left<W/2;
  pop.style.width=w+'px';pop.style.left=(left?Math.min(b.right+10,W-w-12):Math.max(12,b.left-w-10))+'px';const h=pop.offsetHeight;pop.style.top=Math.round(clamp(b.top+32-h/2,12,H-h-12))+'px';}
function statPop(open){const pop=$('#statpop');open=open??pop.hidden;pop.hidden=!open;$('#sbub').setAttribute('aria-expanded',open);if(open){popPlace();sfx('tap');}}
function panelLife(){const a=age();const acts=ACTS.filter(x=>x.ok(a));
  const actHtml=acts.length?`<div class="acts">${acts.map(x=>`<button class="act" data-act="do" data-arg="${x.id}" ${S.ap>0?'':'disabled'}>${ico('a_'+x.id)}<b>${typeof x.label==='function'?x.label():x.label}</b><small>${typeof x.sub==='function'?x.sub():x.sub}</small></button>`).join('')}</div>`:'<p class="muted" style="margin:0">Babies don\'t have choices yet. Press <b>Next year</b> to grow up.</p>';
  const E=S.edu,J=S.job&&JOBS[S.job.id];
  let career='';
  if(S.job)career=`<dl class="kv"><dt>Job</dt><dd>${J.levels[S.job.level]} · ${J.name}</dd><dt>Pay</dt><dd class="mono">~${fmt(S.job.lastMonthly||salaryBase())}/month</dd><dt>Years</dt><dd>${S.job.years} (next rank: ${S.job.level<J.levels.length-1?J.levels[S.job.level+1]:'top reached'})</dd><dt>Performance</dt><dd>${perfLabel(perfScore())} · ${STAT_NAMES[J.stat]} matters most</dd>${abroadPrem(S.job.id)>.005?`<dt>Overseas degree</dt><dd>+${Math.round(abroadPrem(S.job.id)*100)}% pay (${COUNTRIES[S.edu.abroadDeg].name})</dd>`:''}</dl>
    <div class="row">${canHop()?`<button class="btn small primary" data-act="hop" ${S.ap>0&&S.hopYear!==S.year?'':'disabled'}>Job hop for higher pay (1 action)</button>`:''}<button class="btn small" data-act="jobs">Change job</button><button class="btn small danger" data-act="quit">Quit job</button>${a>=55?'<button class="btn small" data-act="retire">Retire</button>':''}${!E.track&&a>=21&&a<60?'<button class="btn small" data-act="restudy">Go back to study</button>':''}</div>
    ${E.track?`<p class="muted" style="margin:0;font-size:13px">Also studying ${esc(E.track.label)}${E.track.uni?' at '+esc(E.track.uni):''} · ${E.track.left} yr${E.track.left===1?'':'s'} left</p>`:''}`;
  else if(a>=17&&!E.track&&!S.retired)career=`<p style="margin:0">You don't have a job.</p><div class="row"><button class="btn small primary" data-act="jobs">Look for a job</button>${a>=21&&a<60?'<button class="btn small" data-act="restudy">Go back to study</button>':''}</div>`;
  else if(E.track)career=`<dl class="kv"><dt>Studying</dt><dd>${esc(E.track.label)}${E.track.uni?' at '+esc(E.track.uni):''}</dd><dt>Years left</dt><dd>${E.track.left}</dd></dl>`;
  else if(S.retired)career=`<p style="margin:0">Retired.${S.pension?' Government pension: '+fmt(S.pension*infl())+'/month.':''} EPF balance draws down yearly.</p>`;
  const si=stageInfo();let fc='';
  if(si){if(a>=16&&a<=17&&!E.track)fc=`On track for about ${Math.round(clamp((S.know*.8+S.stats.int*.2-35)/5.5,0,10))}A in ${E.exam}.`;
    else if(E.track&&E.track.kind==='preu')fc=`Projected pre-U score: about ${Math.round(clamp(S.know*.8+S.stats.int*.15+(E.spmA||0)*.5))}/100.`;
    else if(E.track)fc=`Projected CGPA: about ${clamp(2+(S.know*.8+S.stats.int*.2-40)/28,2,4).toFixed(2)}.`;
    else fc=`Current grade: ${gradeOf(S.know)}.`;}
  const knowHtml=si?`<div class="stat" data-k="know"><div class="lbl"><span>Knowledge · ${esc(si.label)}</span><span>${Math.round(S.know)}</span></div><div class="bar blue"><i style="width:${S.know}%"></i></div></div>
    <p class="muted" style="margin:0;font-size:12.5px">${fc} Each new stage starts with new material. Your Smarts and Discipline make studying ×${studyMult().toFixed(2)} as effective.</p>`:'';
  const eduLine=knowHtml+`<dl class="kv"><dt>Education</dt><dd>${E.level==='none'?(a<4?'—':'In school'):EDU_LABEL[E.level]}${E.spmA!=null?` · ${E.exam} ${E.spmA}A`:''}${E.uni?` · ${esc(E.uni)} (${MAJORS[E.major].name}, CGPA ${E.gpa.toFixed(2)})`:''}${E.master?" · Master's":''}</dd>${E.scholar?`<dt>Scholarship</dt><dd>${E.scholar}${E.bond>0?` · bond ${E.bond} yrs left`:''}</dd>`:''}</dl>`;
  return `<div class="panel"><div class="row" style="justify-content:space-between"><h3>This year · age ${a}</h3><span class="ap-pill">${S.ap} action${S.ap===1?'':'s'} left</span></div>${actHtml}</div>
   <div class="panel"><h3>${S.job||S.retired?'Career':'School & career'}</h3>${eduLine}${career}</div>${polPanel()}${titlePanel()}
   <div class="panel"><h3>Life record</h3>${logHtml()}</div>`;}
function logHtml(){const groups=[];for(let i=S.log.length-1;i>=0&&groups.length<40;i--){const e=S.log[i];let g=groups[groups.length-1];if(!g||g.a!==e.a){g={a:e.a,y:e.y,items:[]};groups.push(g);}g.items.push(e);}
  return `<div class="passbook">${groups.map(g=>`<div class="pb-age"><div class="when">Age ${g.a}<span>${g.y}</span></div><ul>${g.items.reverse().map(e=>`<li class="${e.k}">${esc(e.t)}</li>`).join('')}</ul></div>`).join('')}</div>`;}
// Will & estate sits in the Assets tab.
function willPanel(){const a=age();return `<div class="panel"><h3>Will & estate</h3><p style="margin:0">${S.will?'✅ You have a will. Your chosen heir receives half your cash plus all property; the rest is split.':'No will yet. Without one, about 15% of your cash estate goes on legal fees and family disputes, and everything is split equally.'}</p>
    ${S.will?'':`<div class="row"><button class="btn small" data-act="will" ${a>=21&&S.money>=1500*infl()?'':'disabled'}>Write a will (${fmt(1500*infl())})</button></div>`}
    ${S.kids.some(k=>k.alive!==false&&S.year-k.born>=18)?`<div class="row"><button class="btn small" data-act="handover">Pass on wealth early and play as a child</button></div>`:''}</div>`;}
/* ================= shop: showroom shelves (v117) ================= */
// Every shop item as one record. The shelves and the showroom pop-up both draw from this; buying still goes
// through the old handlers (buyhouse, buycar, ...), so prices, loans and rules live in one place.
const SHOP_TABS=[['houses','Property','h_terrace'],['cars','Vehicles','c_axia'],['pets','Pets','p_kcat'],['biz','Business','b_kopitiam'],['lux','Luxury','l_rolex'],['inv','Invest','i_gold']];
function shopItems(k){const I=infl(),a=age(),fx=fxNow(),act=(label,name,arg,ok,why)=>({label,name,arg,ok:!!ok,why:ok?'':why||''});
  if(k==='houses'){const r=rate(fx),yrs=Math.max(5,Math.min(35,70-a)),C=ctry();return houseList().map((H,i)=>{const p=H.price*I*bumiDisc(H),bl=H.cond&&!H.cond();
    return {g:H.country?'Homes in '+C.city:H.lux?'Luxury homes':H.price<=400000?'Starter homes':H.landed?'Landed homes':'Condominiums',tag:H.lux?'Luxury':H.landed?'Landed':'Strata',
      name:H.name,sub:H.where,img:houseKey(H),price:p,mo:amort(p*.9,r,yrs)/12,moNote:`10% down, ${yrs} years at ${(r*100).toFixed(1)}%`,off:bl||a<18,
      note:a<18?'You need to be 18 to buy property.':bl?H.why:'You pay 10% down plus about 3% in fees. Property not lived in is rented out (~3.5% of its value a year).',
      acts:[act('See payment options','buyhouse',i,!bl&&a>=18)]};});}
  if(k==='cars'){const G={Motorcycle:'Two wheels',Budget:'Everyday cars',Popular:'Everyday cars',Sedan:'Family & SUV',SUV:'Family & SUV',EV:'Electric',Executive:'Luxury & dream',Luxury:'Luxury & dream',Supercar:'Luxury & dream'};
    return CARS.filter(c=>S.year>=c.from&&(!c.to||S.year<=c.to)).map(c=>{const p=c.price*I*(S.country==='MY'?1:ctry().col*.8),ok=a>=(c.minAge||18);
      return {g:G[c.type]||'Cars',tag:c.ev?'Electric':c.type,name:c.name,sub:c.type+(c.ev?' · electric':''),img:carKey(c.type,c.id),price:p,mo:p*.9*1.27/9/12,moNote:'Hire purchase: 10% down, 9 years at 3% flat',
        off:!ok,note:ok?'Models appear and disappear with their real launch years.':`You need to be ${c.minAge||18} to drive this.`,acts:[act('See payment options','buycar',c.id,ok)]};});}
  if(k==='pets'){const G={kcat:'Cats',persian:'Cats',bsh:'Cats',mutt:'Dogs',golden:'Dogs',shihtzu:'Dogs',betta:'Fish',arowana:'Fish',koi:'Fish'};
    return PETS.map(P=>({g:G[P.id]||'Small pets & birds',tag:P.price?'For sale':'Adopt',name:P.name,sub:P.landed?'Needs a landed home':'Fine in any home',img:'p_'+P.id,price:P.price*I,free:!P.price,
      kv2:['Upkeep',fmt(P.cost*I)+'/yr'],off:a<8,note:a<8?'Your parents say you can have a pet from age 8.':P.id==='arowana'?'Said to bring good luck.':P.id==='merbok'?'Merbok singing contests are a big deal in the kampung.':`Lives ${P.life[0]}–${P.life[1]} years.`,
      acts:[act(P.price?'Buy':'Adopt','buypet',P.id,a>=8)]}));}
  if(k==='biz')return BIZ.map(B=>{const p=B.price*I,ok=a>=21&&S.money>=p;return {g:'Businesses for sale',tag:'Business',name:B.name,sub:B.where,img:'b_'+B.id,price:p,
    kv2:['Usual profit',`${Math.round((B.yld-.02)*100)}–${Math.round((B.yld+.02)*100)}% a year`],off:!ok,note:'Profit swings every year. Your stats help, and a day job or living abroad means paying a manager.',
    acts:[act('Buy','buybiz',B.id,ok,a<21?'Age 21+':'Needs '+fmt(p))]};});
  if(k==='lux')return LUX.map(L=>{const p=L.price*I,ok=a>=L.min&&S.money>=p;return {g:'Luxury',tag:L.dep>0?'Loses value':'Holds value',name:L.name,sub:L.dep>0?'Loses value over time':'Holds its value',img:'l_'+L.id,price:p,
    kv2:['Upkeep',fmt(p*L.up)+'/yr'],off:!ok,note:'Luxury makes you happier and better-looking, and people notice.',acts:[act('Buy','buylux',L.id,ok,a<L.min?'Age '+L.min+'+':'Needs '+fmt(p))]};});
  wealthInit();const v=S.inv,chunk=Math.max(0,S.money*.25),inv=(id,name,sub,val,ok,why)=>({g:'Investments',tag:val>0?'You hold':'Invest',name,sub,img:'i_'+id,price:null,
    kv1:['You hold',fmt(val)],kv2:['Next invest',fmt(chunk)],card:[val>0?fmt(val)+' held':'Not invested yet','Invest '+fmt(chunk)+' at a time'],off:!ok,note:ok?'Each Invest puts in a quarter of your cash.':why,
    acts:[act('Invest '+fmt(chunk),'invest',id,ok&&chunk>=1000,'Needs at least '+fmt(4000)+' in cash'),...(val>0?[act('Cash out','cashout',id,1)]:[])]});
  return [inv('gold','Gold','Often rises when stocks fall',v.gold,a>=18,'Age 18+'),
    inv('safe','Bond fund','Private banker · about 4% a year',v.safe,bankerOk(),'Private banking needs a net worth of '+fmt(2e6*I)),
    inv('risky','Growth fund','Private banker · can beat the market or crash',v.risky,bankerOk(),'Private banking needs a net worth of '+fmt(2e6*I)),
    {g:'Investments',tag:'Startups',name:'Angel investing',sub:fmt(250000*I)+' per startup',img:'i_angel',price:null,kv1:['Backing',v.angel.length?v.angel.length+' startup'+(v.angel.length>1?'s':''):'None'],kv2:['Per startup',fmt(250000*I)],card:[v.angel.length?'Backing '+v.angel.length:'Not invested yet',fmt(250000*I)+' per startup'],
      off:!angelOk(),note:angelOk()?'Most startups fail. A few sell for many times the money.'+(v.angel.length?' Backing: '+v.angel.map(x=>esc(x.name)).join(', ')+'.':''):'Needs a net worth of '+fmt(3e6*I),
      acts:[act('Back a startup','angel','',angelOk()&&S.money>=250000*I,'Needs '+fmt(250000*I))]}];}
const shopPrice=x=>x.card?x.card[0]:x.free?'Free':fmt(x.price);
const shopSub=x=>x.card?x.card[1]:x.mo!=null?fmt(x.mo)+'/mo':x.kv2?x.kv2[0].toLowerCase()+' '+x.kv2[1]:'';
function shopShelves(){const L=shopItems(shopTab),gs=[...new Set(L.map(x=>x.g))];
  return gs.map(g=>{const ix=L.map((x,i)=>x.g===g?i:-1).filter(i=>i>=0);return `<div class="shelf"><h4>${esc(g)}<small>${ix.length}${ix.length>2?' · swipe ›':''}</small></h4><div class="srow">${ix.map(i=>{const x=L[i];
    return `<button class="mcard${x.off?' off':''}" data-act="showroom" data-arg="${i}"><span class="tag">${esc(x.tag)}</span><span class="pic">${ico(x.img)}</span><span class="b"><b>${esc(x.name)}</b><span class="pr${x.card&&!/^-?RM/.test(x.card[0])?' txt':''}">${shopPrice(x)}</span><small>${shopSub(x)}</small></span></button>`;}).join('')}</div></div>`;}).join('');}
// The showroom: one item big, with ‹ › (or a swipe) to the next. It sits on top of the game, outside the pop-up queue.
let SR=-1;
function showroomHtml(){const L=shopItems(shopTab),n=L.length;if(SR<0||!n)return '';SR=Math.min(SR,n-1);const x=L[SR];
  const kv=[x.price!=null?['Price',x.free?'Free':fmt(x.price)]:x.kv1,x.mo!=null?['Monthly (loan)',fmt(x.mo)]:x.kv2].filter(Boolean);
  return `<div class="sr-card" data-act="srnoop"><div class="sr-pic"><span class="tag">${esc(x.tag)}</span>${ico(x.img)}
    ${n>1?`<button class="sr-nav l" data-act="srnav" data-arg="-1" aria-label="Previous">‹</button><button class="sr-nav r" data-act="srnav" data-arg="1" aria-label="Next">›</button>`:''}
    <button class="sr-x" data-act="srclose" aria-label="Close">✕</button></div>
    <div class="sr-b"><div class="sr-cnt">${SR+1} of ${n}${n>1?' · swipe for more':''}</div><h2>${esc(x.name)}</h2><div class="sr-sub">${esc(x.sub)}</div>
    <div class="sr-kv">${kv.map(([k,v])=>`<div>${k}<b>${v}</b></div>`).join('')}</div>${x.moNote&&x.mo!=null?`<small class="muted">${x.moNote}</small>`:''}
    ${x.note?`<p class="sr-note">${x.off?'🔒 ':''}${x.note}</p>`:''}
    <div class="sr-acts">${x.acts.map((A,j)=>`<button class="btn ${j?'':'primary'}" data-act="srgo" data-arg="${j}" ${A.ok?'':'disabled'}>${A.label}${A.ok||!A.why?'':`<small>${A.why}</small>`}</button>`).join('')}</div></div></div>`;}
function showroom(i){let el=$('#showroom');if(!el){el=document.createElement('div');el.id='showroom';el.dataset.act='srclose';document.body.appendChild(el);
    let x0=null;el.addEventListener('touchstart',e=>{x0=e.touches[0].clientX;},{passive:true});
    el.addEventListener('touchend',e=>{if(x0==null)return;const d=e.changedTouches[0].clientX-x0;x0=null;if(Math.abs(d)>50)srNav(d<0?1:-1);},{passive:true});}
  SR=i;el.innerHTML=showroomHtml();el.hidden=SR<0;}
function srNav(d){const n=shopItems(shopTab).length;if(SR<0||n<2)return;showroom((SR+d+n)%n);sfx('tap');}
function srClose(){SR=-1;const el=$('#showroom');if(el)el.hidden=true;}
function srGo(j){const A=shopItems(shopTab)[SR]?.acts[j];if(!A||!A.ok)return;srClose();ACT[A.name](String(A.arg));}
function panelAssets(){const I=infl(),fx=fxNow();wealthInit();
  const houses=S.assets.houses.map((h,i)=>`<div class="item">${ico(houseKey(h))}<div class="t"><b>${esc(h.name)} ${i===S.home&&h.country===S.country?'<span class="chip">Home</span>':'<span class="chip gold">Rented out</span>'}</b><small>${esc(h.where)} · value <span class="mono">${fmt(h.value)}</span>${h.loanLeft>0?` · loan left <span class="mono">${fmt(h.loanLeft)}</span>`:''}</small></div><div class="row">${i!==S.home&&h.country===S.country&&!h.rental?`<button class="btn small" data-act="sethome" data-arg="${i}">Move in</button>`:''}${h.loanLeft>0?`<button class="btn small" data-act="payhouse" data-arg="${i}" ${S.money>=h.loanLeft?'':'disabled'}>Pay off loan (${fmt(h.loanLeft)})</button>`:''}<button class="btn small danger" data-act="sellhouse" data-arg="${i}">Sell</button></div></div>`).join('');
  const cars=S.assets.cars.map((c,i)=>`<div class="item">${ico(carKey(c.type,c.id))}<div class="t"><b>${esc(c.name)}</b><small>${c.type}${c.ev?' · EV':''} · value <span class="mono">${fmt(c.value)}</span>${c.loanLeft>0?` · loan left <span class="mono">${fmt(c.loanLeft)}</span>`:''}</small></div><div class="row">${c.loanLeft>0?`<button class="btn small" data-act="paycar" data-arg="${i}" ${S.money>=c.loanLeft*.92?'':'disabled'}>Pay off loan (${fmt(c.loanLeft*.92)})</button>`:''}<button class="btn small danger" data-act="sellcar" data-arg="${i}">Sell</button></div></div>`).join('');
  const pets=S.assets.pets.map(p=>`<div class="item">${ico('p_'+p.id)}<div class="t"><b>${esc(p.name)}</b><small>${esc(p.kind)} · ${p.age} yr${p.age===1?'':'s'} old</small></div></div>`).join('');
  const homeStatus=homeOk()?`Living in your own ${esc(S.assets.houses[S.home].name.toLowerCase())}.`:S.withParents?'Living with your parents (rent-free).':S.country==='MY'?'Renting a place.':'Renting in '+esc(ctry().city)+'.';
  return `<div class="panel"><h3>Balance sheet</h3><dl class="kv">
    <dt>Cash</dt><dd class="mono ${S.money<0?'neg':''}">${fmt(S.money)}</dd><dt>EPF / KWSP</dt><dd class="mono">${fmt(S.epf)}</dd>
    <dt>Stocks & unit trusts</dt><dd class="mono">${fmt(S.stocks)} ${S.stocks>0?'<button class="btn small" data-act="sellstocks">Sell all</button>':''}</dd>
    <dt>PTPTN loan</dt><dd class="mono ${S.ptptn>0?'neg':''}">${fmt(S.ptptn)}</dd><dt>Last year</dt><dd class="mono"><span class="pos">▲ ${fmt(S.lastInc||0)}</span> in · <span class="neg">▼ ${fmt(S.lastExp||0)}</span> out</dd>
    <dt>Net worth</dt><dd class="mono">${fmt(netWorth())}</dd></dl>
    ${S.lastBreak&&S.lastBreak.length?`<details><summary style="cursor:pointer;font-size:13px">This year's income and spending</summary><div class="list">${S.lastBreak.map(([l,v])=>`<div class="item"><div class="t"><b>${esc(l)}</b></div><span class="mono ${v>=0?'pos':'neg'}">${v>=0?'+':'−'} ${fmt(Math.abs(v))}</span></div>`).join('')}</div></details>`:''}
    ${S.ptptn>0&&!S.edu.track?`<div class="row"><button class="btn small" data-act="ptpay" ${S.money>=S.ptptn?'':'disabled'}>Pay off PTPTN (${fmt(S.ptptn)})</button><button class="btn small" data-act="ptskip">${S.ptptnSkip?'Resume PTPTN payments':'Stop paying PTPTN'}</button>${S.travelBan?'<span class="chip">Barred from leaving Malaysia</span>':''}</div>`:''}
    ${S.showStmt===false?'<div class="row"><button class="btn small" data-act="stmton">Show the money summary every year</button></div>':''}
    <p class="muted" style="margin:0;font-size:13px">${homeStatus} ${age()>=18&&S.country==='MY'&&!homeOk()?`<button class="btn small" data-act="toggleParents">${S.withParents?'Move out':'Move back home'}</button>`:''}</p></div>
   ${houses||cars||pets||wealthOwned()?`<div class="panel"><h3>What you own</h3><div class="list">${houses}${cars}${wealthOwned()}${pets}</div></div>`:''}
   <div class="panel"><h3>Shop</h3><div class="shoptabs">${SHOP_TABS.map(([k,n,ic])=>`<button data-act="shop" data-arg="${k}" aria-pressed="${shopTab===k}">${ico(ic)}${n}</button>`).join('')}</div>
   ${age()<16?'<p class="muted" style="margin:0">You\'re too young to buy most things. Pets need your parents\' OK (age 8+).</p>':''}${shopShelves()}
   <p class="muted" style="margin:0;font-size:12.5px">Tap anything to see it in the showroom. Loan rate: ${(rate(fx)*100).toFixed(1)}%.</p></div>`+willPanel();}
function panelTravel(){const I=infl(),fx=fxNow(),C=ctry(),abroad=S.country!=='MY';
  const tripOk=!(age()<16||(S.trips||0)>=2||inHosp());const trips=TRIPS.map(T=>`<div class="item trip${tripOk?' tap" data-act="trip" data-arg="'+T.id:''}">${ico('d_'+T.id)}<div class="t"><b>${esc(T.name)}</b><small>${fmt(T.cost*I*(fx.travel||1))} · 😊 +${T.hap}${S.visited.includes(T.id)?' · ✓ Visited':''}</small></div><button class="btn small" data-act="trip" data-arg="${T.id}" ${age()<16||(S.trips||0)>=2?'disabled':''}>Go</button></div>`).join('');
  const moves=Object.entries(COUNTRIES).filter(([k])=>k!=='MY'&&k!==S.country).map(([k,X])=>{const why=moveCheck(k);return `<div class="item"><span class="ico" aria-hidden="true">${X.flag}</span><div class="t"><b>${X.flag} ${X.city}, ${X.name}</b><small>Pay ~${X.sal}× · cost of living ~${X.col}× · ${LANG[X.lang]} ${X.need}+${X.anyJob?' · any job':' · degree'}${X.maxAge?' · under '+X.maxAge:''}${X.lottery?' · visa lottery':''}${why.length?' · <span class="neg">Needs '+esc(why.join(', '))+'</span>':''}</small></div><button class="btn small" data-act="move" data-arg="${k}" ${why.length||S.ap<1||S.edu.track?'disabled':''}>Apply</button></div>`;}).join('');
  const here=abroad?`<dl class="kv"><dt>Living in</dt><dd>${C.flag} ${C.city}, ${C.name}</dd><dt>Status</dt><dd>${esc(S.residency)}${S.myCitizen?' · Malaysian citizen':' · renounced Malaysian citizenship'}</dd><dt>Years here</dt><dd>${S.yearsAbroad}</dd></dl>
     <div class="stat"><div class="lbl"><span>Homesickness</span><span>${Math.round(S.homesick)}</span></div><div class="bar blue"><i style="width:${S.homesick}%"></i></div></div>
     <div class="row">${S.residency==='visa'?`<button class="btn small" data-act="pr" ${S.yearsAbroad>=4&&S.job?'':'disabled'}>Apply for ${C.cit?'PR':'Golden Visa'}${S.yearsAbroad<4?' (after 4 yrs)':''}</button>`:''}
       ${C.cit&&S.residency==='PR'?`<button class="btn small" data-act="citizen" ${S.yearsAbroad>=6?'':'disabled'}>Become a citizen${S.yearsAbroad<6?' (after 6 yrs)':''}</button>`:''}
       <button class="btn small" data-act="gohome" ${S.edu.track?'disabled':''}>Return to Malaysia</button></div>`
    :`<p style="margin:0">You live in ${esc(town().name)}, Malaysia.${S.myCitizen?'':' (on a long-term visit pass)'}</p>`;
  return `<div class="panel"><h3>Where you live</h3>${here}</div>
   ${age()<18&&S.parents.some(x=>x.alive)?`<div class="panel"><h3>Family holiday</h3><p class="muted" style="margin:0;font-size:13px">Once a year your parents take you on a trip for free. Where you can go depends on what your family can afford.${S.group==='B40'?' Money is tight at home, so they might have to say no.':''}${S.famTripYear===S.year?' You have already been this year.':''}</p><div class="list">${TRIPS.filter(T=>T.cost<=famTripMax()).map(T=>`<div class="item trip${famTripOk()?' tap" data-act="famtrip" data-arg="'+T.id:''}">${ico('d_'+T.id)}<div class="t"><b>${esc(T.name)}</b><small>Free · 😊 +${T.hap}</small></div><button class="btn small" data-act="famtrip" data-arg="${T.id}" ${famTripOk()?'':'disabled'}>Go</button></div>`).join('')}</div></div>`:''}
   <div class="panel"><h3>Holidays</h3><p class="muted" style="margin:0;font-size:13px">Up to 2 trips a year. Trips don't use actions. 😊 shows the happiness boost. ${fx.travel&&fx.travel!==1?'World events are changing travel prices right now.':''}</p><div class="list">${trips}</div></div>
   <div class="panel"><h3>Studying abroad</h3><p class="muted" style="margin:0;font-size:13px">Careers in this game are in Malaysia. You can study overseas when you choose a university, or later from Go back to study after you've started working. An overseas degree raises your starting pay back home. The boost is biggest for finance, law and tech, and for degrees from the US, UK and Singapore.</p></div>`;}
const closeWord=r=>r>=80?'Very close':r>=60?'Close':r>=40?'Okay':r>=20?'Distant':'Estranged';
const closeBar=r=>`<div class="stat close"><div class="lbl"><span>Closeness · ${closeWord(r)}</span><span>${Math.round(r)}</span></div><div class="bar"><i class="${barCls(r)}" style="width:${r}%"></i></div></div>`;
const famBtn=arg=>`<button class="btn small" data-act="famtime" data-arg="${arg}" ${S.ap>0?'':'disabled'}>Spend time</button>`;
function panelFamily(){const p=S.partner,a=age();famRel();
  const parents=S.parents.map((x,i)=>`<div class="item">${ico(x.role==='Father'?'father':'mother')}<div class="t"><b>${esc(x.role)}: ${esc(x.name)}</b><small>${esc(x.job)} · ${x.alive?'age '+x.age:'passed away'}</small>${x.alive?closeBar(x.rel):''}</div>${x.alive?famBtn('p'+i):''}</div>`).join('');
  let love;
  if(p&&p.alive!==false){love=`<div class="item">${ico((p.loy===-1||p.young)&&icoSrc(p.gender==='M'?'playboy':'playgirl',p.culture)?(p.gender==='M'?'playboy':'playgirl'):(p.status==='married'?'spouse_':'partner_')+(p.gender==='M'?'m':'f'),'',p.culture)}<div class="t"><b>${spouseHon(p)}${esc(p.name)} <span class="chip">${p.status==='married'?'Spouse':'Dating'}</span></b><small>${p.age} · ${esc(p.job)}${natTxt(p)?' · '+natTxt(p).trim():''}${p.young?' · much younger than you':''}${p.loy===1?' · devoted to you':p.loy===-1?' · has a wandering eye':''}</small></div></div>
    <div class="stat"><div class="lbl"><span>Relationship</span><span>${Math.round(p.rel)}</span></div><div class="bar"><i class="${barCls(p.rel)}" style="width:${p.rel}%"></i></div></div>
    <div class="row">${p.status==='dating'?`<button class="btn small primary" data-act="propose" ${p.rel>=60&&a>=20?'':'disabled'}>Propose${p.rel<60?' (relationship 60+)':a<20?' (age 20+)':''}</button>`:''}${a>=18?`${p.age>=18?`<button class="btn small" data-act="night" ${S.ap>0?'':'disabled'}>Spend the night (1 action)</button>`:''}<button class="btn small" data-act="hookup" ${S.ap>0?'':'disabled'}>Hook up with someone else (1 action)</button>${S.affair?'':`<button class="btn small" data-act="affair" ${S.ap>0?'':'disabled'}>Start a secret affair (1 action)</button>`}`:''}${married()&&polyOK()&&allSpouses().length<MAX_SPOUSES&&a>=21?`<button class="btn small" data-act="findspouse" ${S.ap>0?'':'disabled'}>Marry another partner (1 action)</button>`:''}<button class="btn small danger" data-act="breakup">${p.status==='married'?'Divorce':'Break up'}</button></div>`;}
  else love=`<p style="margin:0">${p?'Widowed. ':''}You're single.</p><div class="row"><button class="btn small" data-act="findlove" ${a>=16&&S.ap>0?'':'disabled'}>Look for love (1 action)</button>${a>=18?`<button class="btn small" data-act="hookup" ${S.ap>0?'':'disabled'}>Hook up with someone (1 action)</button>`:''}${a>=28?`<button class="btn small" data-act="findyoung" ${S.ap>0?'':'disabled'}>Look for a younger partner (1 action)</button>`:''}</div>`;
  love+=spouses().map((s,i)=>`<div class="item" style="margin-top:14px">${ico('spouse_'+(s.gender==='M'?'m':'f'),'',s.culture)}<div class="t"><b>${esc(s.name)} <span class="chip">Spouse ${i+2}</span></b><small>${s.age} · ${esc(s.job)}</small></div></div>
    <div class="stat"><div class="lbl"><span>Relationship</span><span>${Math.round(s.rel)}</span></div><div class="bar"><i class="${barCls(s.rel)}" style="width:${s.rel}%"></i></div></div>
    <div class="row"><button class="btn small" data-act="spdate" data-arg="${i}" ${S.ap>0?'':'disabled'}>Quality time (1 action)</button>${a>=18&&s.age>=18?`<button class="btn small" data-act="night" data-arg="${i}" ${S.ap>0?'':'disabled'}>Spend the night (1 action)</button>`:''}<button class="btn small danger" data-act="spdiv" data-arg="${i}">Divorce</button></div>`).join('');
  if(allSpouses().length>1)love+=`<div class="row" style="margin-top:14px"><button class="btn small primary" data-act="sptime" ${S.ap>0?'':'disabled'}>Time with your ${spWord()} (1 action)</button></div>`;
  if(S.affair){const f=S.affair,pk=f.gender==='M'?'playboy':'playgirl';love+=`<div class="item" style="margin-top:14px">${ico(icoSrc(pk,f.culture)?pk:'partner_'+(f.gender==='M'?'m':'f'),'',f.culture)}<div class="t"><b>${esc(f.name)} <span class="chip">Secret affair</span></b><small>${f.age} · ${esc(f.job)}</small></div></div>
    <div class="stat"><div class="lbl"><span>Their feelings</span><span>${Math.round(f.rel)}</span></div><div class="bar"><i class="${barCls(f.rel)}" style="width:${f.rel}%"></i></div></div>
    <div class="stat"><div class="lbl"><span>Suspicion at home</span><span>${Math.round(f.sus||0)}</span></div><div class="bar"><i class="${barCls(100-(f.sus||0))}" style="width:${f.sus||0}%"></i></div></div>
    <div class="row"><button class="btn small" data-act="affdate" ${S.ap>0?'':'disabled'}>Secret date (1 action)</button><button class="btn small danger" data-act="affend">End the affair</button></div>`;}
  if(a>=16&&!S.prefChanged)love+=`<div class="row"><button class="btn small" data-act="pref">Change who you're attracted to (once per life)</button></div>`;
  const kids=S.kids.map(k=>{const ka=S.year-k.born;return `<div class="item">${ico(ka<4?'baby':k.gender==='M'?'son':'daughter')}<div class="t"><b>${esc(k.name)}</b><small>${k.gender==='M'?'Son':'Daughter'}${k.adopted?' (adopted)':''} · ${ka<0?'—':ka+' yrs'}${k.note?' · '+esc(k.note):''}${k.spm!=null?' · SPM '+k.spm+'A':''}${k.job?' · '+esc(k.job):''} · Smarts ${Math.round(k.stats.int)}</small>${k.alive!==false&&ka>=1?closeBar(k.rel):''}</div>${k.alive!==false&&ka>=1?famBtn('k'+S.kids.indexOf(k)):''}</div>`;}).join('');
  return `<div class="panel"><h3>Parents</h3><p class="muted" style="margin:0;font-size:13px">Household income group: ${S.birthGroup} at birth · Parenting style: ${S.parenting}${parAlive()?'. Closeness fades a little each year unless you spend time together.':''}</p><div class="list">${parents}</div></div>
   <div class="panel"><h3>Love life</h3>${love}</div>
   <div class="panel"><h3>Children</h3>${expecting()?`<p style="margin:0">🍼 A baby is on the way, due in ${S.preg.map(x=>x.due).join(' and ')}.</p>`:''}${kids?`<div class="list">${kids}</div>`:'<p class="muted" style="margin:0">No children yet. Get married to try for a baby or adopt.</p>'}</div>
`+panelDynasty();} // the family tree lives at the end of Family
function panelDynasty(){const d=S.dyn;const hist=d.history.map(h=>`<div class="gen"><div class="g">Gen ${h.gen}</div><div class="item"><div class="t"><b>${esc(h.name)} · ${esc(h.title)}</b><small>${h.born}–${h.died} (age ${h.age}) · ${esc(h.career)} · net worth <span class="mono">${fmt(h.nw)}</span> · score ${h.score}</small></div></div></div>`).join('');
  return `<div class="panel"><h3>${esc(CULTURES[d.culture||S.culture].famLabel(d.famName))}</h3><dl class="kv"><dt>Generation</dt><dd>${d.gen}</dd><dt>Family reputation</dt><dd>${Math.round(d.rep)}</dd></dl>
   <div class="tree">${hist}<div class="gen"><div class="g">Gen ${d.gen}</div><div class="item"><div class="t"><b>${esc(dispName())} <span class="chip">Now</span></b><small>Born ${S.birthYear} · age ${age()}</small></div></div></div></div></div>`;}
const MP_ICON={play:'<path d="M8 5v14l11-7z"/>',pause:'<path d="M6 5h4v14H6zM14 5h4v14h-4z"/>',prev:'<path d="M6 6h2v12H6zM9.5 12 18 18V6z"/>',next:'<path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z"/>'};
const mpIcon=k=>`<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">${MP_ICON[k]}</svg>`;
function panelMusic(){const t=TRACKS[mpTrack],on=mpOn(),many=TRACKS.length>1,d=t.len;
  return `<div class="panel mp"><h3>Music</h3><p class="muted" style="margin:0;font-size:13px">Listen to the game's songs in full. The background music pauses while a song plays.</p>
   <div class="mp-now"><img class="mp-art${on?' on':''}" src="img/title-banner.webp" alt=""><div class="mp-info"><div class="eyebrow">${on?'Now playing':'Ready to play'}</div><b>${esc(t.title)}</b><small>${esc(t.sub)}</small></div></div>
   <input type="range" class="mp-seek" min="0" max="1000" step="1" value="0" aria-label="Position in song">
   <div class="mp-ctrl"><span class="mp-time mono">0:00 / ${mpTime(d)}</span>
    <div class="row">${many?`<button class="btn mp-btn" data-act="mpprev" aria-label="Previous song">${mpIcon('prev')}</button>`:''}<button class="btn primary mp-btn mp-main" data-act="mptoggle" aria-label="${on?'Pause':'Play'}">${mpIcon(on?'pause':'play')}</button>${many?`<button class="btn mp-btn" data-act="mpnext" aria-label="Next song">${mpIcon('next')}</button>`:''}</div>
    <button class="btn small" data-act="mprepeat" aria-pressed="${mpRepeat}">🔁 Repeat ${mpRepeat?'on':'off'}</button></div>
   ${many?`<div class="list">${TRACKS.map((x,i)=>`<div class="item tap mp-row${i===mpTrack?' cur':''}" data-act="mpplay" data-arg="${i}"><span class="mp-n">${i===mpTrack&&on?'🔊':i+1}</span><div class="t"><b>${esc(x.title)}</b><small>${esc(x.sub)}</small></div><span class="mono muted">${mpTime(x.len)}</span></div>`).join('')}</div>`:''}</div>`;}
// Settings (v98): themes, sound, and starting over. Opened by the ⚙️ on the ID card or the title screen.
const SKINS=[['songket','Songket','Teal & gold',['#0d4a52','#e7b84a','#c92c43']],['peranakan','Peranakan','Mint & pink',['#2a9d8f','#f2a7c3','#d6457a']],
  ['malam','Malam','Night mode',['#0f1a24','#d9a93f','#ff6b81']],['kampung','Kampung','Wood & paddy',['#5a3e22','#8cbf4f','#b5542a']],['batik','Batik Biru','Indigo & gold',['#16357a','#f0b44c','#2a58b8']]];
function settingsHtml(){const cur=skinNow(),game=S&&S.alive&&!$('#s-game').hidden;
  return `<div class="set-h">Theme</div><div class="skins">${SKINS.map(([k,n,d,c])=>`<button class="skin" data-act="skin" data-arg="${k}" aria-pressed="${cur===k}"><span class="sw">${c.map(x=>`<i style="background:${x}"></i>`).join('')}</span>${n}<small>${d}</small></button>`).join('')}</div>`+
    `<div class="set-h">Home screen icon</div><div class="appicons">${APP_ICONS.map(([k,n,src])=>`<button class="skin appico" data-act="appicon" data-arg="${k}" aria-pressed="${iconNow()===k}"><img src="${src}" alt="">${n}</button>`).join('')}</div><small class="muted set-note">Takes effect when you add the game to your home screen. Already added? Remove it and add it again.</small>`+
    `<div class="set-h">Save backup</div><div class="set-row"><span>Keep a copy of your game, for a new phone or before re-adding the icon</span></div><div class="set-row set-btns"><button class="btn small" data-act="backup" ${load()?'':'disabled'}>Copy save code</button><button class="btn small" data-act="restore">Restore from code</button></div>`+
    `<div class="set-h">Sound &amp; music</div><div class="set-row"><span>Music and sound effects</span><button class="btn small" data-act="smute" aria-pressed="${!MUTED}">${MUTED?'🔇 Off':'🔊 On'}</button></div>${[['music','🎵 Music volume'],['sfx','🔔 Sound effects volume']].map(([k,n])=>`<label class="set-vol"><span>${n}<b id="vol-${k}">${Math.round(VOL[k]*100)}%</b></span><input type="range" min="0" max="100" step="5" value="${Math.round(VOL[k]*100)}" data-vol="${k}" aria-label="${n}"></label>`).join('')}<div class="set-row"><span>Listen to the game's songs in full</span><button class="btn small" data-act="music">🎵 Music player</button></div>`+
    (game?`<div class="set-h">Achievements</div><div class="set-row"><span>${S.dyn.ach.length} of ${Object.keys(ACH).length} earned by your family</span><button class="btn small" data-act="achievements">🏆 View</button></div>`:'')+
    (game?`<div class="set-h">Game</div><div class="set-row"><span>Start over with a different family</span><button class="btn small danger" data-act="abandon">Start new family</button></div>`:'')+
    `<small class="muted">Malaysian Life Simulator ${VERSION_LABEL}</small>`;}
function achHtml(){const d=S.dyn;return `<p class="muted" style="margin:0;font-size:13px">Gold = earned by any generation of the family.</p><div class="ach">${Object.entries(ACH).map(([k,v])=>`<div class="${d.ach.includes(k)?'got':''}"><b>${v[0]}</b>${v[1]}</div>`).join('')}</div>`;}
function settingsModal(){return {title:'Settings',tag:'Settings',_settings:1,text:settingsHtml(),choices:[['Done',null]]};}
// Redraw the whole sheet: the settings markup has <div>s, which the browser moves out of the pop-up's <p class="txt">.
function settingsRedraw(){if(!cur||!cur._settings)return;const sh=$('#m-sheet'),y=sh.scrollTop;cur.text=settingsHtml();drawModal(1);sh.scrollTop=y;}
// Title screen "Continue" button names who you are playing.
function contBtn(){const s=load(),b=$('#btn-continue');if(!b)return;b.hidden=!s;if(s)b.textContent=s.alive&&s.name?`Continue: ${s.name}, age ${s.year-s.birthYear}`:'Continue saved life';}
function showScreen(id){if(id==='s-title')contBtn();['s-title','s-setup','s-birth','s-game','s-end','s-music'].forEach(s=>$('#'+s).hidden=s!==id);window.scrollTo(0,0);bgm();}
function switchTab(t){tab=t;render();$('#g-panel').scrollTop=0;}
function renderBirth(){const d=birthDraft,C=CULTURES[d.culture],T=TOWNS[d.town];
  const grp={B40:'B40 · lower income',M40:'M40 · middle income',T20:'T20 · top 20%'}[d.group];
  const pst=p=>[['int','Smarts'],['look','Looks'],['hlt','Health'],['cha','Charisma']].map(([k,n])=>`<div class="pst"><span>${n}</span><b>${p.stats[k]}</b><div class="bar"><i class="${barCls(p.stats[k])}" style="width:${p.stats[k]}%"></i></div></div>`).join('');
  $('#s-birth').innerHTML=`<div class="bcert"><div class="bc-top"><span>Birth certificate · ${esc(C.famLabel(d.famName))}</span><span>${setup.year}</span></div>
     <div class="bc-body">${ico('av_baby','bc-av')}<div><div class="eyebrow">Welcome to the world</div><h1>${esc(setup.nameNow)} is born</h1><p>${esc(T.name)} · festival: ${C.fest}</p></div></div></div>
   <div class="bc-parents">${d.parents.map(p=>`<div class="pcard">${ico(p.role==='Father'?'father':'mother','pc-av')}<div class="eyebrow">${p.role}</div><b class="pc-name">${esc(p.name)}</b><small>${esc(p.job)} · age ${p.age}</small><div class="pstats">${pst(p)}</div></div>`).join('')}</div>
   <div class="panel bc-start"><h3>Your start in life</h3><div class="bc-tags"><span>🏠 ${grp}</span><span>👪 ${d.parenting} parents</span><span>🗣️ ${Object.keys(C.langs).map(k=>LANG[k]).join(', ')}</span>${d.traits.length?d.traits.map(t=>`<span class="trait">✨ ${esc(t)}</span>`).join(''):''}</div>
     <div class="stats">${['int','hlt','cha','look','cre','ath','dis','hap'].map(k=>`<div class="stat"><div class="lbl"><span>${ico('s_'+k,'st')}${STAT_NAMES[k]}</span><span>${d.stats[k]}</span></div><div class="bar"><i class="${barCls(d.stats[k])}" style="width:${d.stats[k]}%"></i></div></div>`).join('')}</div></div>
   <div class="bc-actions"><button class="btn primary bc-go" data-act="startLife">Start this life ▸</button><button class="btn" data-act="reroll" ${setup.rerolls>0?'':'disabled'}>🎲 Reroll family (${setup.rerolls} left)</button></div>`;}
function showEnd(){const s=lifeSummary();S.lastSummary=s;save();const kids=S.kids.filter(k=>k.alive!==false&&S.year-k.born>=0);const es=estate();
  $('#s-end').innerHTML=`<div class="hero" style="padding-top:8px"><div class="eyebrow">In loving memory · ${s.born}–${s.died}</div><h1 style="font-size:40px">${esc(dispName())}</h1><p>${esc(s.title)}</p></div>
   <div class="panel"><div class="row" style="justify-content:space-between;align-items:flex-end"><div><div class="eyebrow">Life score</div><div class="score">${s.score}</div></div>
     <dl class="kv"><dt>Wealth</dt><dd class="mono">${s.w}/25</dd><dt>Happiness</dt><dd class="mono">${s.h}/25</dd><dt>Relationships</dt><dd class="mono">${s.r}/25</dd><dt>Achievements</dt><dd class="mono">${s.ac}/25</dd></dl></div>
     <dl class="kv"><dt>Lived to</dt><dd>${s.age}</dd><dt>Career</dt><dd>${esc(s.career)}</dd><dt>Net worth</dt><dd class="mono">${fmt(s.nw)}</dd><dt>Children</dt><dd>${S.kids.length}</dd><dt>Achievements</dt><dd>${S.ach.map(a=>ACH[a][0]).join(', ')||'—'}</dd></dl>
     <p class="muted" style="margin:0">Epitaph: “${esc(epitaph())}”</p></div>
   <div class="panel"><h3>Dynasty mode: continue the family</h3><p class="muted" style="margin:0;font-size:13px">Estate cash: ${fmt(es.cash)}${S.will?' (will in place)':' after '+fmt(es.legal)+' lost without a will'}. Your heir also inherits all property, vehicles and pets.</p>
     <div class="list">${kids.map((k,i)=>`<div class="item">${ico(k.gender==='M'?'son':'daughter')}<div class="t"><b>${esc(k.name)}</b><small>${k.gender==='M'?'Son':'Daughter'} · age ${S.year-k.born} · Smarts ${Math.round(k.stats.int)} · Looks ${Math.round(k.stats.look)} · Charisma ${Math.round(k.stats.cha)}</small></div><button class="btn small primary" data-act="heir" data-arg="${S.kids.indexOf(k)}">Continue as ${esc(k.name)}</button></div>`).join('')||'<p style="margin:0">No children. A niece or nephew can carry on the family name.</p>'}
     ${kids.length?'':'<div class="row"><button class="btn small primary" data-act="relative">Continue as a niece or nephew</button></div>'}</div></div>
   <div class="row"><button class="btn" data-act="abandonEnd">Start a completely new family</button></div>`;
  showScreen('s-end');}
function epitaph(){const big=S.log.filter(e=>e.k==='big'&&!/Passed away/.test(e.t));const pickd=[big[Math.floor(big.length*.3)],big[Math.floor(big.length*.6)],big[big.length-1]].filter(Boolean).map(e=>e.t.replace(/\.$/,''));return [...new Set(pickd)].join('. ')+'.';}

