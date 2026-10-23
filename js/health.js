'use strict';
// Illness, hospitals, and continuing as an heir.
/* ================= illness & hospitals (v62) ================= */
const ILLS=[
  {n:'a bad flu',sev:1},{n:'food poisoning after a dodgy nasi lemak',sev:1},{n:'a sprained ankle',sev:1},{n:'a nasty eye infection',sev:1},{n:'hand, foot and mouth disease',sev:1,maxA:10},{n:'a stomach bug',sev:1},
  {n:'dengue fever',sev:2},{n:'appendicitis',sev:2},{n:'a broken arm',sev:2},{n:'kidney stones',sev:2,minA:25},{n:'a slipped disc',sev:2,minA:30},{n:'pneumonia',sev:2},{n:'diabetes complications',sev:2,minA:40},
  {n:'a heart attack',sev:3,minA:40},{n:'a stroke',sev:3,minA:45},{n:'cancer',sev:3,minA:25},{n:'kidney failure',sev:3,minA:40},{n:'serious injuries from a road accident',sev:3,minA:16}];
// Cost in RM by severity, and chance of a full recovery by severity.
const CARE={gov:{n:'Government hospital',cost:[30,600,4000],ok:[.95,.78,.55],note:'Cheap, but long queues'},
  clinic:{n:'Private clinic',cost:[90,2500,9000],ok:[.97,.55,.2],note:'Quick, best for small problems'},
  priv:{n:'Private hospital',cost:[500,18000,90000],ok:[.99,.9,.72],note:'Fast and comfortable'},
  abroad:{n:'Top hospital in Singapore',cost:[3000,45000,260000],ok:[.99,.94,.82],note:'The best care money can buy'},
  none:{n:'Rest at home and self-medicate',cost:[0,0,0],ok:[.75,.3,.06],note:'Free, and risky'}};
function pandemicNow(){return S.world.active.find(e=>['sars03','covid','pandemic'].includes(e.id));}
// Health below HLT_WEAK makes you sick more often, with worse illnesses and a higher yearly death risk. Below HLT_CRIT you are admitted to hospital for a year.
const HLT_WEAK=35,HLT_CRIT=15,inHosp=()=>S.hosp===S.year;
function illChance(){const a=age();let p=.07+Math.max(0,a-35)/250+Math.max(0,55-S.stats.hlt)/250+(S.stats.hlt<HLT_WEAK?.12:0);if(S.traits.includes('Sickly'))p*=1.4;if(pandemicNow())p+=.25;return Math.min(p,.6);}
function pickIll(){const a=age(),pd=pandemicNow();
  if(pd&&chance(.7)){const nm=pd.id==='sars03'?'SARS':pd.id==='covid'?'COVID-19':'the new virus';return {n:nm,sev:a>=60?pick([2,3]):a>=40?pick([1,2,2]):pick([1,1,2]),pand:1};}
  const w=S.stats.hlt<HLT_WEAK?.15:0,r=Math.random();let sev=r<(a<30?.04:a<50?.12:.25)+w?3:r<.4+w?2:1,L;
  // Young children have no life-threatening illness on the list, so drop to the next severity down.
  while(!(L=ILLS.filter(x=>x.sev===sev&&a>=(x.minA||0)&&a<=(x.maxA||200))).length&&sev>1)sev--;return pick(L);}
function illModal(il){const a=age(),kid=a<18,s=il.sev-1,abroad=S.country!=='MY';
  const can=k=>!kid||k==='gov'||k==='clinic'||k==='none'||(k==='priv'&&S.birthGroup!=='B40')||(k==='abroad'&&S.birthGroup==='T20');
  const ch=['gov','clinic','priv','abroad','none'].filter(can).map(k=>{const C=CARE[k];
    const L=S.dyn.leg||{},doc=S.ttl&&S.ttl.freeDoc&&!abroad;
    const cost=kid||doc?0:a2c(C.cost[s])*(k==='gov'&&abroad&&S.residency!=='citizen'?3:1)*(abroad?1:(L.dial?.75:1)*(L.hall&&s>=1?.8:1));
    const ok=clamp(C.ok[s]+(S.stats.hlt-50)/400-(a>60?.05:0)-(il.pand&&k!=='none'?.03:0),.02,.995);
    const nm=abroad&&k==='gov'?'Public hospital':abroad&&k==='abroad'?'World-class specialist hospital':C.n;
    return [nm+(cost?` (${fmt(cost)})`:''),()=>treat(il,k,cost,ok,nm),()=>k==='gov'||k==='none'||S.money>=cost,`${Math.round(ok*100)}% chance of a full recovery · ${kid&&k!=='none'?'Your parents pay':C.note}`];});
  const lvl=['Minor','Serious','Life-threatening'][s];
  // Own picture per severity (and for outbreaks) once the art exists; until then the health-screening picture.
  const art=il.pand?'ev_ill_virus':['ev_ill_minor','ev_ill_serious','ev_ill_critical'][s];
  return {title:il.pand?'You caught '+il.n:'Feeling unwell',icon:ICON_IMG[art]?art:'ev_checkup',tag:'Health',text:`You come down with ${il.n}.${il.pand?' The virus is spreading fast this year.':''}\nSeverity: ${lvl}. Where do you go for treatment?`,choices:ch};}
function hospModal(){const a=age(),kid=a<18,abroad=S.country!=='MY',doc=S.ttl&&S.ttl.freeDoc&&!abroad;
  const opts=[['gov',R(40,50),.1],['priv',R(50,62),.06],['abroad',R(58,70),.035]].filter(([k])=>!kid||k==='gov'||(k==='priv'&&S.birthGroup!=='B40')||(k==='abroad'&&S.birthGroup==='T20'));
  const ch=opts.map(([k,to,risk])=>{const C=CARE[k],cost=kid||doc?0:a2c(C.cost[2])*(k==='gov'&&abroad&&S.residency!=='citizen'?3:1);
    const die_=clamp(risk+Math.max(0,a-60)/200,.02,.4),nm=abroad&&k==='gov'?'Public hospital':abroad&&k==='abroad'?'World-class specialist hospital':C.n;
    return [nm+(cost?` (${fmt(cost)})`:''),()=>{S.money-=cost;if(doc&&k!=='gov')S.ttl.freeDoc=0;bump('hap',-6);
      if(chance(die_)){die();return 'Your body is too weak to pull through. You pass away in hospital.';}
      S.stats.hlt=Math.max(S.stats.hlt,to);log(`Spent the year in hospital (${nm}) and recovered.`,'big');
      return pick(['Months of drips, scans and hospital food. Slowly, you get your strength back.','The nurses become your friends. By the end of the year you can walk out on your own.'])+' Look after yourself this time.';},
      ()=>k==='gov'||S.money>=cost,`${Math.round((1-die_)*100)}% chance you pull through · ${kid&&k!=='gov'?'Your parents pay':C.note}`];});
  return {title:'Admitted to hospital',icon:ICON_IMG.ev_ill_critical?'ev_ill_critical':'ev_checkup',tag:'Health',
    text:`Your health has fallen to ${Math.round(S.stats.hlt)}. You collapse and are rushed to hospital. The doctors say you must stay for treatment, so you lose this whole year: no actions and no trips.${S.job?' Your employer puts you on medical leave.':''}\nWhere are you treated?`,choices:ch};}
function treat(il,k,cost,ok,nm){S.money-=cost;const s=il.sev,a=age();if(k!=='none'&&S.ttl&&S.ttl.freeDoc){S.ttl.freeDoc=0;ok=Math.min(.995,ok+.05);}
  if(chance(ok)){bump('hlt',-[1,3,6][s-1]);log(`Recovered from ${il.n}`+(k==='none'?' at home.':` (${nm}).`),s===3?'big':'');
    return k==='none'?'You sleep it off with Panadol and plenty of water. You feel fine.':pick(['The treatment works. You are back on your feet.','The doctors sort it out. You make a full recovery.','A few days of rest, and you feel like yourself again.']);}
  bump('hlt',-[6,14,25][s-1]);bump('hap',-[2,5,10][s-1]);
  if(s===3&&chance(.25+Math.max(0,a-50)/150+(k==='none'?.35:0)-(S.dyn.leg&&S.dyn.leg.wing?.1:0))){die();return `The treatment for ${il.n} doesn't work. You pass away.`;}
  log(`${s===3?'Survived':'Struggled with'} ${il.n}; the treatment did not fully work.`,s>=2?'big':'');
  return s===1?'It drags on for weeks before you finally recover.':s===2?'There are complications, and recovery takes months. Your health takes a hit.':'You survive, but only just. Your health may never be quite the same.';}
function heirFrom(kid){const prev=S;const es=estate();const living=prev.kids.filter(k=>k.alive!==false);const n=Math.max(1,living.length+allSpouses().length);
  const share=prev.will?es.cash*.5+es.cash*.5/n:es.cash/n;const sum=lifeSummary();
  const dyn={...prev.dyn,gen:prev.dyn.gen+1,history:prev.dyn.history.concat([sum])};if(prev.honour)dyn.rep+=3;if(prev.honour==='Tun')dyn.rep+=10;if(prev.dyn.leg&&prev.dyn.leg.wing)dyn.rep+=5;dyn.honParent=prev.honour?1:0;if(prev.pol&&prev.pol.dirty>=3)dyn.rep-=5;
  const a=prev.year-kid.born;
  const st={...kid.stats};const grow=Math.min(a,22);st.int=clamp(st.int+grow*.8);st.ath=clamp(st.ath+grow*.3);st.cha=clamp(st.cha+grow*.4);st.cre=clamp(st.cre+grow*.3);
  st.dis=clamp((st.dis||30)+Math.min(a,25)*.6);st.hap=clamp((st.hap||60)-10);st.luck=st.luck||RI(20,80);if(a>45)st.hlt=clamp(st.hlt-(a-45)*.8);
  const nwP=netWorth();const group=nwP>2e6?'T20':nwP>3e5?'M40':'B40';
  const d={culture:prev.culture,group,town:prev.town,famName:prev.famName,stats:st,traits:[],parenting:'Loving',langs:{}};
  for(const k in prev.langs)d.langs[k]=Math.round(prev.langs[k]*.8);
  d.parents=[{role:prev.gender==='M'?'Father':'Mother',name:prev.name,job:prev.lastJobName||'—',age:prev.year-prev.birthYear,alive:false,stats:{}}];
  if(prev.partner)d.parents.push({role:prev.partner.gender==='M'?'Father':'Mother',name:prev.partner.name,job:prev.partner.job,age:prev.partner.age,alive:prev.partner.alive!==false,stats:prev.partner.stats});
  const ns=freshState(d,{name:kid.name,gender:kid.gender,pref:prev.pref,birthYear:kid.born,dyn});
  ns.year=prev.year;ns.polyRule=prev.polyRule;ns.birthGroup=group;ns.world=prev.world;ns.country=kid.country||prev.country;ns.myCitizen=ns.country==='MY'||prev.myCitizen;ns.residency=ns.country==='MY'?'citizen':(prev.myCitizen?'PR':'citizen');
  ns.money=share;ns.assets={houses:prev.assets.houses,cars:prev.assets.cars.filter(c=>c.value>2000),pets:prev.assets.pets,biz:prev.assets.biz||[],lux:prev.assets.lux||[]};ns.inv=prev.inv;ns.home=null;
  ns.assets.houses.forEach((h,i)=>{if(ns.home==null&&h.country===ns.country)ns.home=i;});ns.withParents=false;
  // auto history
  const E=ns.edu;S=ns;
  if(a>=18){E.level='spm';E.spmA=kid.spm??Math.round(clamp((st.int-35)/5.5,0,10));E.primary='sk';E.secondary='smk';E.stream=st.int>=50?'sci':'arts';}
  if(a>=23){if(st.int>=55){E.level='degree';const best=Object.entries(MAJORS).filter(([k,m])=>(!m.int||st.int>=m.int)&&(!m.cre||st.cre>=m.cre)&&(!m.ath||st.ath>=m.ath));const mj=best.length?pick(best)[0]:'bus';E.major=mj;E.uniTier=st.int>75?3:2;E.uni=E.uniTier===3?'Universiti Malaya':"Taylor's University";E.gpa=+clamp(2.3+(st.int-50)/40,2,4).toFixed(2);}else if(st.int>=42)E.level='diploma';}
  else if(a>=19&&st.int>=55){E.track={kind:'uni',id:'bus',label:'University · '+MAJORS.bus.name,left:23-a,len:4,cost:4000,uni:'UiTM',tier:2};}
  else if(a<18){ns.withParents=true;if(a<7)E.primary=null;}
  ns.know=clamp(st.int*.6);
  if(a>=19&&!E.track&&a<60){const opts=Object.keys(JOBS).filter(id=>!eligible(id).length&&!JOBS[id].startCost);if(opts.length){opts.sort((x,y)=>JOBS[y].base-JOBS[x].base);const id=opts[0];const J=JOBS[id];ns.job={id,level:Math.min(J.levels.length-1,Math.max(0,Math.floor((a-23)/6))),years:Math.max(0,a-23),lvl:0,bonus:1};}}
  if(a>=60)ns.retired=true;
  if(a>=28&&chance(.55)){ns.partner=npc(25);ns.partner.age=clamp(a+RI(-3,3),20,99);ns.partner.status='married';ns.partner.rel=65;marryConvert(ns.partner,true);if(a>=32&&chance(.6)){const n=RI(1,2),lo=Math.max(1,a-42),hi=Math.max(lo,a-26);for(let i=0;i<n;i++)newKidSilent(ns,RI(lo,hi));}}
  ns.ap=apFor();
  log(`${dyn.famLabel||CULTURES[prev.culture].famLabel(prev.famName)}: Generation ${dyn.gen} begins. ${kid.name} (${a}) inherits ${fmt(share)}${prev.will?'':' after '+fmt(es.legal)+' in legal fees and family disputes (no will)'}.`,'big');
  if(ns.assets.houses.length)log('Inherited '+ns.assets.houses.length+' propert'+(ns.assets.houses.length>1?'ies':'y')+'.');
  ns.ach=[];checkAch();return ns;}
function newKidSilent(ns,ageBack){const st=inherit(ns.stats,ns.partner.stats);st.dis=RI(20,45);st.hap=RI(55,80);st.luck=RI(20,80);const g=pick(['M','F']);
  ns.kids.push({name:genName(ns.culture,g),gender:g,born:ns.year-ageBack,stats:st,alive:true,country:ns.country});}
function relativeHeir(){const g=pick(['M','F']);const fake={name:genName(S.culture,g),gender:g,born:S.year-RI(20,35),stats:{int:RI(35,80),hlt:RI(45,90),cha:RI(35,80),look:RI(35,80),cre:RI(35,80),ath:RI(35,80),dis:RI(30,60),hap:60,luck:RI(20,80)},country:S.country};return fake;}

