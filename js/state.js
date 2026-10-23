'use strict';
// Game state (S), money helpers, world engine and the pop-up (modal) queue.
/* ================= state ================= */
let S=null, MQ=[], cur=null, tab='life', shopTab='houses', autoYears=0, setup={gender:'M',culture:'random',year:'2000',pref:'opp',poly:'law'}, birthDraft=null;
const age=()=>S.year-S.birthYear;
const infl=()=>Math.pow(1.03,S.year-2025);
const cult=()=>CULTURES[S.culture];
const isBumi=()=>BUMI.includes(S.origCulture||S.culture);
const origCult=()=>S.origCulture||S.culture;
const bumiDisc=H=>isBumi()&&(H.country||'MY')==='MY'&&!H.resale?.93:1;
const town=()=>TOWNS[S.town];
const ctry=()=>COUNTRIES[S.country];
const married=()=>S.partner&&S.partner.status==='married'&&S.partner.alive!==false;
function bump(k,n){S.stats[k]=clamp(S.stats[k]+n);}
function log(t,k){S.log.push({a:age(),y:S.year,t,k:k||''});if(k==='big')cueLog(t);if(S.log.length>500)S.log.splice(0,S.log.length-500);}
function roll(stat){return S.stats[stat]/100*.7+Math.random()*.3+(S.stats.luck-50)/500;}
function addAch(id){if(!S.ach.includes(id)){S.ach.push(id);if(!S.dyn.ach.includes(id))S.dyn.ach.push(id);toast('🏅 Achievement: '+ACH[id][0]);}}

// Avoids reusing a name already in the family (you, your partner, your children) when it can.
function genName(cKey,g){const C=CULTURES[cKey],L=g==='M'?C.m:C.f,used=S?[S.name,S.partner&&S.partner.name,...(S.kids||[]).map(k=>k.name)]:[];let n,t=0;do n=pick(L);while(used.includes(n)&&++t<10);return n;}
function parentStats(group){const lo=group==='T20'?50:group==='M40'?38:28,hi=group==='T20'?92:group==='M40'?82:75;
  return {int:RI(lo,hi),hlt:RI(35,90),cha:RI(30,90),look:RI(30,90),cre:RI(25,90),ath:RI(25,90)};}
const PJOBS={B40:['Hawker','Lorry driver','Factory worker','Rubber tapper','Security guard','Fisherman','Clerk'],M40:['Teacher','Nurse','Engineer','Police officer','Civil servant','Accountant','Shop owner','Bank officer'],T20:['Doctor','Lawyer','Business owner','Bank director','Surgeon','Property developer','Professor']};
function inherit(a,b){const out={};for(const k of ['int','hlt','cha','look','cre','ath'])out[k]=clamp(Math.round((a[k]+b[k])/2*.6+R(0,100)*.4));return out;}
const TRAITS=[['Gifted',s=>{s.int=clamp(s.int+15)},'Learns fast'],['Sickly',s=>{s.hlt=clamp(s.hlt-15)},'Gets ill easily'],['Natural charmer',s=>{s.cha=clamp(s.cha+15)},'People warm to you'],
  ['Late bloomer',s=>{},'Grows faster after 18'],['Artistic soul',s=>{s.cre=clamp(s.cre+15)},'Creative streak'],['Athletic build',s=>{s.ath=clamp(s.ath+15);s.hlt=clamp(s.hlt+5)},'Born to move']];

function rollBirth(){
  const culture=setup.culture==='random'?pick(PLAYABLE):setup.culture;const C=CULTURES[culture];
  const group=pick(['B40','B40','M40','M40','M40','T20']);
  const tKey=C.towns?pick(C.towns):pick(['kl','pj','shahalam','penang','jb','ipoh','melaka','kotabharu','kedah']);
  const fa={role:'Father',name:genName(culture,'M'),job:pick(PJOBS[group]),age:RI(25,38),alive:true,stats:parentStats(group)};
  const mo={role:'Mother',name:genName(culture,'F'),job:pick(PJOBS[group].concat(['Homemaker'])),age:RI(23,36),alive:true,stats:parentStats(group)};
  const st=inherit(fa.stats,mo.stats);const traits=[];
  if(chance(.12)){const t=pick(TRAITS);t[1](st);traits.push(t[0]);}
  const parenting=pick(['Loving','Loving','Strict','Strict','Relaxed','Distant','Divorced']);
  st.dis=RI(20,40)+(parenting==='Strict'?15:0);st.hap=RI(55,75)+(parenting==='Loving'?10:parenting==='Divorced'?-10:0);st.luck=RI(20,80);
  const langs={ms:0,en:0,zh:0,ta:0};for(const k in C.langs)langs[k]=Math.round(C.langs[k]*.3);
  return {culture,group,town:tKey,parents:[fa,mo],stats:st,traits,parenting,langs,famName:pick(C.fam)};
}
function icNo(y,m,d,st,g){const p=n=>String(n).padStart(2,'0');let last=RI(100,999)*10+(g==='M'?pick([1,3,5,7,9]):pick([0,2,4,6,8]));return `${p(y%100)}${p(m)}${p(d)}-${st}-${String(last).padStart(4,'0')}`;}

function freshState(d,o){
  const by=o.birthYear;const m=RI(1,12),dd=RI(1,28);
  const s={v:1,name:o.name,gender:o.gender,pref:o.pref,culture:d.culture,famName:d.famName,town:d.town,group:d.group,birthGroup:d.group,birthYear:by,year:by,bday:[m,dd],
    ic:icNo(by,m,dd,TOWNS[d.town].st,o.gender),stats:{...d.stats},langs:{...d.langs},traits:d.traits,parents:d.parents,parenting:d.parenting,
    money:0,epf:0,stocks:0,ptptn:0,know:0,assets:{houses:[],cars:[],pets:[]},home:null,withParents:true,
    country:'MY',yearsAbroad:0,residency:'citizen',myCitizen:true,homesick:0,visited:[],everAbroad:0,
    edu:{level:'none',school:null,effort:0,sec:0,spmA:null,exam:'SPM',preu:null,preuScore:null,uni:null,major:null,uniTier:0,gpa:null,track:null,scholar:null,bond:0,stream:null},
    job:null,retired:false,partner:null,kids:[],friends:2,ap:0,ot:0,otYrs:0,log:[],ach:[],seen:[],world:{active:[],done:[]},
    alive:true,will:false,openHouses:0,hapSum:0,hapN:0,applied:0,epfDone:false,retireAsk:60,pension:0,jobless:0,
    dyn:o.dyn||{famName:d.famName,culture:d.culture,gen:1,rep:0,history:[],ach:[]}};
  return s;
}

/* ================= money helpers ================= */
const SECTOR_STAT={tech:'int',finance:'int',law:'int',health:'int',eng:'int',creative:'cha',sport:'hlt',gov:'cha',edu:'int',trade:'dis',agri:'hlt',food:'cha',gig:'dis'};
function perfScore(id){const J=JOBS[id||S.job.id],st=S.stats,two=SECTOR_STAT[J.sector]||'dis',avg=['int','hlt','cha','look','cre','ath'].reduce((t,k)=>t+st[k],0)/6;
  return clamp(.45*st[J.stat]+.25*st[two===J.stat?'dis':two]+.15*st.dis+.15*avg);}
function perfLabel(sc){return sc>=78?'Star performer':sc>=64?'Strong':sc>=50?'Steady':sc>=38?'Below average':'Struggling';}
const ABROAD_PREM={US:.25,UK:.22,SG:.2,AU:.16,CA:.15,DE:.15,JP:.14,NZ:.12,KR:.12,CN:.12,TW:.1,AE:.08};
const SECTOR_PREM={finance:1.4,law:1.4,tech:1.25,eng:1.15,health:.9,creative:1,trade:.9,edu:.5,gov:.35,agri:.6,sport:.4,food:0,gig:0};
const PREM_SPECIAL={'UK:law':1.6,'US:tech':1.5,'DE:eng':1.5,'JP:eng':1.4,'SG:finance':1.4,'UK:finance':1.25,'US:finance':1.25,'AU:health':1.3,'UK:health':1.25,'CN:trade':1.5,'KR:creative':1.5,'TW:tech':1.4};
function abroadPrem(id){const c=S.edu.abroadDeg;if(!c||!ABROAD_PREM[c])return 0;const J=JOBS[id];return ABROAD_PREM[c]*(SECTOR_PREM[J.sector]??1)*(PREM_SPECIAL[c+':'+J.sector]||1);}
function salaryBase(){if(!S.job)return 0;const J=JOBS[S.job.id];let m=J.base*J.growth[S.job.level]*infl();if(S.country!=='MY')m*=ctry().sal;m*=1+(S.edu.uniTier||0)*.04;m*=S.job.bonus||1;
  m*=1+abroadPrem(S.job.id);m*=1+(perfScore()-50)/200;return m;}
function salary(fx){const J=JOBS[S.job.id];let m=salaryBase();if(S.country!=='MY')m*=fx.abroadSal||1;m*=(fx.sal&&fx.sal[J.sector])||1;
  if(S.job.id==='entrepreneur'&&S.pol&&S.pol.rank>=2)m*=1.3;
  if(origCult()==='chinese'&&['entrepreneur','sales'].includes(S.job.id))m*=1.15;
  if(honTier()&&['entrepreneur','sales'].includes(S.job.id))m*=1.05; // doors open for a Dato' // family and clan business network
  if(J.volatile)m*=Math.max(.15,1+(Math.random()*2-1)*J.volatile+(S.stats.luck-50)/200+(S.stats[J.stat]-50)/150);return m;}
function partnerMonthly(){return allSpouses().reduce((t,p)=>t+(p.age<62?p.salary:0),0)*infl()*(S.country==='MY'?1:ctry().sal);}
function incomeMonthly(){return (S.job?(S.job.lastMonthly||salaryBase()):0)+partnerMonthly();}
const rate=fx=>.04+((fx&&fx.rate)||0)-honRate();
function amort(P,r,n){return P*r/(1-Math.pow(1+r,-n));}
function homeOk(){const h=S.home!=null&&S.assets.houses[S.home];return !!(h&&h.country===S.country);}
function ownsLanded(){return homeOk()&&S.assets.houses[S.home].landed;}
function netWorth(){wealthInit();let n=S.money+S.epf+S.stocks-S.ptptn+wealthValue();S.assets.houses.forEach(h=>n+=h.value-h.loanLeft);S.assets.cars.forEach(c=>n+=c.value-c.loanLeft);return n;}
function colNow(fx){return (S.country==='MY'?town().col:ctry().col)*((fx&&fx.col)||1);}

/* ================= world engine ================= */
function fxNow(){const fx={sal:{},layoff:{}};for(const e of S.world.active){const f=e.fx||{};
  for(const k of ['stock','prop','hlt','hap','petrolCar','rate'])if(f[k])fx[k]=(fx[k]||0)+f[k];
  for(const k of ['col','fuel','travel','abroadSal'])if(f[k])fx[k]=(fx[k]||1)*f[k];
  if(f.sal)for(const k in f.sal)fx.sal[k]=(fx.sal[k]||1)*f.sal[k];
  if(f.layoff)for(const k in f.layoff)fx.layoff[k]=(fx.layoff[k]||0)+f.layoff[k];
  if(f.aid)fx.aid=1;}return fx;}
function worldTick(){
  S.world.active=S.world.active.filter(e=>e.end>=S.year);
  for(const h of HIST){if(h.y[0]<=S.year&&h.y[1]>=S.year&&!S.world.done.includes(h.id)){S.world.done.push(h.id);startEvent({...h,end:h.y[1]});}}
  if(S.year>2026&&S.world.active.length<2&&chance(.14)){const f=pick(FUT);if(!S.world.active.some(e=>e.id===f.id))startEvent({...f,end:S.year+RI(f.len[0],f.len[1])-1});}
}
function startEvent(e){S.world.active.push({id:e.id,title:e.title,desc:e.desc,fx:e.fx,end:e.end,good:e.good});log('📰 '+e.title+': '+e.desc,'world');
  if(e.onset==='covid'){if(age()>=5)q(covidModal(e));}else if(e.onset==='flood')floodHit(e);}
function covidModal(e){const a=age();const ch=[];
  if(a<18)return {title:e.title,icon:'w_pandemic',tag:'World event',text:'Schools close. Lessons move online and you spend months at home.',choices:[['Keep up with online classes',()=>{S.know=clamp(S.know+5);bump('dis',2);bump('hap',-2);return 'You log in every morning. Not fun, but you keep up.';}],['Mostly play games',()=>{bump('hap',3);S.know=clamp(S.know-6);return 'Online class with the camera off… your grades slip a bit.';}]]};
  if(S.job){ch.push(['Work from home and save money',()=>{S.money+=4000*infl();bump('hlt',-1);return 'No commute, no lunches out. Your savings grow.';}]);}
  ch.push(['Start an online business',()=>{if(roll('cre')>.5){const g=RI(8000,40000)*infl();S.money+=g;bump('cre',3);return 'Your home-baked cookies sell out on social media! Profit: '+fmt(g)+'.';}S.money-=2000*infl();return 'Orders trickle in, but you lose a little on stock.';}]);
  if(S.epf>3000&&S.country==='MY')ch.push(['Make a special EPF withdrawal',()=>{const w=Math.min(S.epf,10000*infl());S.epf-=w;S.money+=w;return 'You withdraw '+fmt(w)+' from EPF. Cash now, smaller retirement later.';}]);
  ch.push(['Stay home and look after your health',()=>{bump('hlt',3);bump('hap',-1);return 'Lots of home cooking and video calls.';}]);
  return {title:e.title,icon:'w_pandemic',tag:'World event',text:e.desc,choices:ch};}
function floodHit(e){if(S.country!=='MY'){log('Floods hit Malaysia. You donate to flood relief from abroad.');return;}
  const fm=S.dyn.leg&&S.dyn.leg.food?.5:1;if(fm<1&&age()>=18){S.dyn.rep+=2;log('The flood relief food bank you funded feeds thousands of evacuees.');}
  if(age()>=25&&S.ttl&&S.ttl.yrs.length&&S.money>=300000*infl())q(appealModal());
  const p=town().flood+(e.floodBoost||0);
  if(age()<14){if(chance(p)){bump('hap',-4);log('Floodwater enters your family home. Everyone helps clean up the mud.','world');}return;}
  if(!chance(p)){log('Floods hit other states. You volunteer with flood relief.');bump('cha',1);bump('hap',1);return;}
  const car=S.assets.cars[0];
  q({title:'The water is rising',icon:'w_flood',tag:'World event',text:'Heavy rain has flooded your area. Water is creeping up the road.',choices:[
    ['Move the car to higher ground',()=>{if(!car)return 'No car to save. You move valuables upstairs instead.';if(roll('luck')>.4)return 'You park on a flyover with dozens of others. Car saved!';car.value*=.5;S.money-=3000*infl()*fm;return 'Too late: the engine flooded. Repairs cost '+fmt(3000*infl()*fm)+' and the car loses value.';}],
    ['Sandbag the house',()=>{const dmg=(homeOk()?RI(5000,20000)*infl():RI(1000,4000)*infl())*fm;S.money-=dmg;bump('hlt',-1);return 'The sandbags help, but you still spend '+fmt(dmg)+' on repairs and cleaning.';}],
    ['Evacuate to the relief centre',()=>{bump('hap',-4);S.money-=RI(2000,8000)*infl()*fm;return 'You spend three nights at the school hall. The house needs cleaning and some furniture is gone.';}]]});}

/* ================= modal queue ================= */
// Pictures are separate files now, so start loading a pop-up's picture as soon as it is queued.
function preArt(m){try{const k=m&&m.icon,u=k&&icoSrc(k);if(u){const i=new Image();i.src=u;}}catch(e){}}
function q(m){if(m){MQ.push(m);preArt(m);}}
function qFront(m){if(m){MQ.unshift(m);preArt(m);}}
function snap(){return {...S.stats,money:S.money,know:S.know||0};}
function diff(b){const out=[];for(const k in STAT_NAMES){if(k==='luck')continue;const d=Math.round(S.stats[k]-b[k]);if(d)out.push((d>0?'+':'')+d+' '+STAT_NAMES[k]);}
  const dk=Math.round((S.know||0)-(b.know||0));if(dk)out.push((dk>0?'+':'')+dk+' Knowledge');
  const dm=S.money-b.money;if(Math.abs(dm)>=1)out.push((dm>0?'+':'')+fmt(dm));return out;}
function showNext(){if(cur)return;const m=MQ.shift();
  if(!m){$('#modal').hidden=true;render();save();if(!S.alive){showEnd();return;}if(autoYears>0)setTimeout(runAuto,180);return;}
  cur=m;drawModal();}
const TAG_ART={'Titles':'🎖️','Politics':'🏛️','Love':'💞','Milestone':'🎂','Travel':'✈️','Money':'💰','Career':'💼','Family':'👨‍👩‍👧','World event':'🌏','Health':'🏥','Festive season':'🏮','Education':'🎓','Vehicle':'🚗','Property':'🏠'};
// Illustration area: m.img (a picture URL) wins, then a full event picture (ev_ keys), then the event icon, then a tag emoji.
// Politics pop-ups have no event id, so their pictures are matched by title.
const POL_ART={'Late-night WhatsApp':'ev_pol_whatsapp','A fiery speech':'ev_pol_speech','Viral TikTok':'ev_pol_tiktok','Faction war':'ev_pol_faction','The "hotel move"':'ev_pol_hotel','General election':'ev_pol_ge','Party elections':'ev_pol_party','MACC raid':'ev_pol_raid','Prime Minister':'ev_pol_pm','Sacked':'ev_pol_sacked','Royal pardon':'ev_pol_pardon','Released':'ev_pol_released','Leaked files':'ev_pol_leak','Family betrayal':'ev_pol_betrayal'};
// Scene pictures for common pop-ups that otherwise only have a small icon (v70, more in v71): by title, or by the icon they use.
const TITLE_ART={'Someone catches your eye':'ev_meet','Look for love':'ev_meet','A dangerous spark':'ev_affair','"We need to talk"':'ev_breakup','Divorce papers':'ev_breakup','Name your baby':'ev_newborn','Job hunting':'ev_jobhunt','Job hopping':'ev_jobhunt','Time to retire?':'ev_retire',
  'The family company':'ev_biz_family','A buyer comes knocking':'ev_biz_buyer','Expansion offer':'ev_biz_expand','Your best manager wants to leave':'ev_biz_manager',
  'EPF at 55':'ev_epf','A fortune to manage':'ev_fortune','Drowning in debt':'ev_debt','Declared bankrupt':'ev_bankrupt','Retrenched':'ev_w_layoff',
  'Spend the night':'ev_night','A night out':'ev_nightout','Adopt a child':'ev_adopt','Baby fever':'ev_babynews','Talk of a family':'ev_babynews','Big news':'ev_babynews','She is pregnant':'ev_babynews'};
const ICON_ART={m_ring:'ev_propose',m_cheat:'ev_caught',m_rip:'ev_farewell',f_malay:'ev_fest_malay',f_chinese:'ev_fest_chinese',t_family:'ev_household',
  m_tadika:'ev_m_tadika',m_primary:'ev_m_primary',m_secondary:'ev_m_secondary',m_spm:'ev_m_spm',m_uni:'ev_degree',m_scholar:'ev_scholar',m_grad:'ev_grad',w_pandemic:'ev_mco',w_flood:'ev_flood'};
function modalArt(m){if(m.tag==='Politics'&&POL_ART[m.title]&&icoSrc(POL_ART[m.title]))m={...m,icon:POL_ART[m.title]};
  {const k=TITLE_ART[m.title]||ICON_ART[m.icon];if(k&&icoSrc(k))m={...m,icon:k};}if(m.img)return `<div class="m-art"><img class="pic" src="${m.img}" alt=""></div>`;if(m.icon&&/^ev_/.test(m.icon)&&icoSrc(m.icon))return `<div class="m-art"><img class="pic" src="${icoSrc(m.icon)}" alt=""></div>`;if(m.icon&&hasIco(m.icon))return `<div class="m-art">${ico(m.icon)}</div>`;if(m.tag&&TAG_ART[m.tag])return `<div class="m-art"><span class="ico" aria-hidden="true">${TAG_ART[m.tag]}</span></div>`;return '';}
function drawModal(){const m=cur;if(m.choices&&m.choices.length)cue(m.tag==='World event'?'alert':m.tag==='Festive season'?'festive':m.tag==='Love'?'love':m.tag==='Milestone'?'milestone':'event');else if(m.delta&&m.delta.length){const pos=m.delta.filter(x=>/^[+]/.test(x)).length,neg=m.delta.length-pos;cue(pos>neg?'good':neg>pos?'bad':'event');}const chs=(m.choices||[]).map((c,i)=>{const ok=!c[2]||c[2]();return `<button data-act="choose" data-arg="${i}" ${ok?'':'disabled'}>${c[0]}${c[3]?`<small>${c[3]}</small>`:''}</button>`;}).join('');
  $('#m-sheet').innerHTML=`${m.tag?`<span class="chip tag ${m.tag==='World event'?'warn':m.tag==='Festive season'?'gold':''}">${esc(m.tag)}</span>`:''}${modalArt(m)}<h2 id="m-title">${m.title}</h2><p class="txt">${m.text||''}</p>
   ${m.delta&&m.delta.length?`<div class="delta">${m.delta.map(d=>`<span class="${/^[+]/.test(d)?'pos':'neg'}">${esc(d)}</span>`).join('')}</div>`:''}
   <div class="choices">${chs||'<button data-act="close">Continue</button>'}${chs&&!(m.choices||[]).some(c=>!c[2]||c[2]())?'<button data-act="close">Continue</button>':''}</div>`;
  $('#modal').hidden=false;const b=$('#m-sheet button:not(:disabled)');if(b)b.focus({preventScroll:true});modalFx(m);}
function choose(i){const c=cur&&cur.choices&&cur.choices[i];if(!c){closeModal();return;}if(c[2]&&!c[2]())return;if(!c[1]){closeModal();return;}
  const b=snap();let out;try{out=c[1]();}catch(e){console.error(e);out='';}if(out===false){cur=null;return;}if(out==='keep')return;
  const d=S?diff(b):[];if(out||d.length){cur={title:cur.title,tag:cur.tag,icon:cur.icon,text:out||'Done.',delta:d,choices:null};drawModal();}else closeModal();}
function closeModal(){cur=null;$('#modal').hidden=true;showNext();}

