'use strict';
// Yearly activities, love & family, education.
/* ================= activities ================= */
const ACTS=[
  {id:'play',ic:'🧸',label:'Play & explore',sub:'Creativity, fitness',ok:a=>a>=4&&a<7,run(){bump('cre',2);bump('ath',1.5);bump('hap',2);return pick(['You build a fort out of pillows.','You chase chickens around grandma\'s house.','You draw your whole family with crayons.']);}},
  {id:'study',ic:'📖',label:'Study',sub:()=>stageInfo()?'Knowledge for this stage':'Smarts',ok:a=>a>=4,run(){const a=age();const si=stageInfo();bump('hap',-1);
    if(si){S.know=clamp((S.know||0)+28/(si.L*si.ap)*studyMult());bump('int',.25);}
    else{const g=(2+R(0,1.5))*(.6+S.stats.dis/100)*(S.traits.includes('Gifted')?1.3:1)*(a>50?.5:1)*(S.traits.includes('Late bloomer')&&a>=18?1.4:1);bump('int',a<7?g*.6:g);}
    return a<7?'You learn your ABCs and count to 100.':a<13?'You finish your homework and read storybooks.':a<18?pick(['You revise past-year SPM papers.','Late-night study with kopi.','Extra tuition class after school.']):S.edu.track?'You study in the library until closing.':'You take an online course to sharpen your skills.';}},
  {id:'exercise',ic:'🏸',label:'Exercise',sub:'Health, fitness',ok:a=>a>=6,run(){bump('hlt',2);bump('ath',2);bump('hap',1);return pick(['Badminton at the community hall.','Jogging around the taman.','Futsal with friends.','Gym session after work.','Morning walk at the park.']);}},
  {id:'social',ic:'🧋',label:'Socialise',sub:'Charisma, friends, love',ok:a=>a>=6,run(){bump('cha',2);bump('hap',2);if(chance(.3))S.friends++;
    if(age()>=16&&!S.partner&&chance(.28))qFront(meetModal());return pick(['Teh tarik at the mamak until midnight.','Bubble tea with friends.','A birthday party at a friend\'s house.','Karaoke night.']);}},
  {id:'hobby',ic:'🎨',label:'Hobby',sub:'Creativity, happiness',ok:a=>a>=5,run(){bump('cre',2);bump('hap',2.5);return pick(['You practise guitar.','You paint a sunset over the paddy fields.','You try a new recipe.','You build a model kit.','You garden and repot your orchids.']);}},
  {id:'lang',ic:'🗣️',label:'Learn a language',sub:'Opens doors abroad',ok:a=>a>=8,run(){qFront(langModal());return '';}},
  {id:'routine',ic:'🗓️',label:'Build a routine',sub:'Discipline',ok:a=>a>=10,run(){bump('dis',3);return 'You plan your week and stick to it.';}},
  {id:'groom',ic:'💇',label:'Self-care & style',sub:'Looks',ok:a=>a>=13,run(){const c=a2c(150);S.money-=age()>=18?c:0;bump('look',2);bump('hap',1);return 'New haircut, new outfit, new you.';}},
  {id:'volunteer',ic:'🤝',label:'Volunteer',sub:'Charisma, reputation',ok:a=>a>=13,run(){bump('cha',1);bump('hap',2);S.dyn.rep+=.5;return pick(['You help at a soup kitchen.','You clean up a beach with an NGO.','You tutor kids at a community centre.']);}},
  {id:'parttime',ic:'🧾',label:'Part-time job',sub:'Earn money',ok:a=>a>=16&&!S.job&&!S.retired,run(){const g=a2c(age()<18?2500:4500);S.money+=g;bump('dis',1);bump('hlt',-.5);return 'Weekend shifts at a '+pick(['fast-food outlet','bookstore','café','mall kiosk','car wash'])+'. Earned '+fmt(g)+'.';}},
  {id:'overtime',ic:'💼',label:'Work overtime',sub:'Pay, promotion; health −',ok:()=>!!S.job,run(){S.ot++;bump('hlt',-2);bump('hap',-1);return 'Late nights at the office. Your boss notices.';}},
  {id:'date',ic:'💞',label:()=>married()?'Quality time':'Go on a date',sub:'Relationship',ok:()=>S.partner&&S.partner.alive!==false,run(){const c=a2c(200);if(age()>=18)S.money-=c;S.partner.rel=clamp(S.partner.rel+8+S.stats.cha/12);bump('hap',2);return pick(['Dinner by the river in Melaka.','A movie and late supper.','Pasar malam stroll with satay.','A weekend trip up to Genting.'])+spTurn(S.partner,2,1);}},
  {id:'kids',ic:'🧒',label:'Time with kids',sub:'Happiness, kids grow',ok:()=>S.kids.some(k=>k.alive!==false&&S.year-k.born<18),run(){S.kids.forEach(k=>{if(S.year-k.born<18){k.stats.int=clamp(k.stats.int+1.5);k.stats.cha=clamp(k.stats.cha+1);}});bump('hap',3);return pick(['Homework help and a trip to the playground.','Family picnic at the lake.','Bedtime stories every night.']);}},
  {id:'baby',ic:'🍼',label:'Try for a baby',sub:'Grow the family',ok:a=>married()&&!samePartner()&&a<46&&S.kids.length<8&&!expecting(),run(){
    const p=age()<35?.45:age()<40?.3:.15;
    if(chance(p)){expectKid(S.partner&&S.partner.stats);return 'Good news: a baby is on the way! It is due next year.';}return 'Not this time. Keep trying.';}},
  {id:'adopt',ic:'🤱',label:'Adopt a child',sub:'Give a child a home',ok:a=>a>=25&&a<=60&&S.kids.length<8,run(){qFront(adoptModal());return '';}},
  {id:'nation',ic:'🏛️',label:'Contribute to the nation',sub:'Fund a project · once a year',ok:a=>a>=25&&natOk(),run(){qFront(nationModal());return '';}},
  {id:'invest',ic:'📈',label:'Invest 20% of cash',sub:'Stocks & unit trusts',ok:a=>a>=21,run(){if(S.money<1000)return 'You need at least RM 1,000 in cash to invest.';const v=S.money*.2;S.money-=v;S.stocks+=v;bump('int',.5);return 'You put '+fmt(v)+' into a stock & unit-trust portfolio.';}},
  {id:'rest',ic:'😴',label:'Rest',sub:'Health, happiness',ok:a=>a>=4,run(){bump('hlt',2);bump('hap',3);return pick(['A lazy weekend with Netflix.','Long nap after lunch.','A day at the beach.']);}},
];
ACTS.forEach(a=>{ICON_EMOJI['a_'+a.id]=a.ic;});
// Use it or lose it: an adult stat left unpractised for over 3 years starts to fade. These activities keep a stat in practice.
const PRACTICE={study:['int'],invest:['int'],lang:['int'],social:['cha'],volunteer:['cha'],date:['cha'],kids:['cha'],hobby:['cre'],play:['cre','ath'],exercise:['ath'],routine:['dis'],parttime:['dis']};
const FADE_STATS=['int','cha','cre','ath','dis'],FADE_HOW={int:'studying',cha:'socialising',cre:'a hobby',ath:'exercise',dis:'a routine'};
function practise(id){const u=S.used||(S.used={});for(const k of PRACTICE[id]||[])u[k]=S.year;}
function idleYrs(k){const u=S.used||(S.used={});if(u[k]==null)u[k]=S.year;return S.year-u[k];}
const rusty=k=>age()>=18&&FADE_STATS.includes(k)&&idleYrs(k)>3;
// High Discipline slows every drop from ageing and fading: 0 → 1.2x, 50 → 0.85x, 100 → 0.5x.
const decayMult=()=>1.2-S.stats.dis*.007;
Object.assign(ICON_EMOJI,{ev_lottery4d:'🎟️',ev_ramadan:'🌙'});
Object.assign(ICON_EMOJI,{s_int:'🧠',s_hlt:'❤️',s_cha:'🗣️',s_look:'✨',s_cre:'🎨',s_ath:'💪',s_dis:'🎯',s_hap:'😊',s_luck:'🍀'});
Object.assign(ICON_EMOJI,{m_adopt:'🤱',m_preg:'🤰',m_fling:'🍹',m_gold:'👜',m_cheat:'📱',ev_carried:'💞',ev_bigproject:'📊',ev_mistake:'😬',ev_workaccident:'🚑',ev_bossleaves:'🪑',ev_bribe:'💰',ev_award:'🏆',ev_collapse:'💔',ev_scandal:'📰',ev_kabel:'🔌',ev_openhouse:'🍛',ev_kpi:'📊',ev_flood:'🌊',ev_leave:'🗓️',ev_posting:'🛫',ev_raid:'🚨',ev_durian:'🍈',ev_startup:'🚀',ev_poach:'🚀',ev_politics:'🗣️'});
function a2c(n){return n*infl()*(S.country==='MY'?1:ctry().col);}
// Partners can be any race once its portraits exist (partner_f@indian and so on); until then Malay or Chinese.
// Malay and Chinese are listed twice so they come up more often, roughly following the population.
function partnerCults(){return Object.keys(CULTURES).filter(c=>PLAYABLE.includes(c)||ICON_IMG['partner_f@'+c]&&ICON_IMG['partner_m@'+c]).flatMap(c=>PLAYABLE.includes(c)?[c,c]:[c]);}
function samePartner(){return S.partner&&S.partner.gender===S.gender;}
// Malaysian law: a non-Muslim must convert to marry a Muslim, so a mixed marriage makes the household Malay.
function marryConvert(p,quiet){if(!p||p.gender===S.gender||!p.culture)return;
  if(S.culture==='malay'&&p.culture!=='malay'){p.origCulture=p.culture;if(CULTURES[p.culture])p.culture='malay';p.convert=1;
    if(!quiet){log(p.name+' converted to Islam to marry you.');q({title:'A new chapter',icon:'spouse_'+(p.gender==='M'?'m':'f'),tag:'Love',text:`Under Malaysian law a non-Muslim must convert to Islam to marry a Muslim. ${esc(p.name)} converts before the nikah, and your household follows Malay customs from now on.`,choices:[['Continue',()=>'']]});}}
  else if(S.culture!=='malay'&&p.culture==='malay'){S.origCulture=S.culture;S.culture='malay';S.convert=1;
    if(!quiet){log('Converted to Islam to marry '+p.name+'.','big');q({title:'A new chapter',icon:'spouse_'+(p.gender==='M'?'m':'f'),tag:'Love',text:`Under Malaysian law a non-Muslim must convert to Islam to marry a Muslim, so you convert before the nikah. From now on you celebrate Hari Raya, fast during Ramadan and your children grow up Malay. Your own education and work perks stay as they were, and your children count as bumiputera.`,choices:[['Continue',()=>'']]});}}}
function stageInfo(){const a=age(),t=S.edu.track;
  if(t)return {label:t.label,L:t.len||t.left||1,ap:3};
  if(a>=7&&a<=12)return {label:'Primary (Standard 1–6)',L:6,ap:2};
  if(a>=13&&a<=15)return {label:S.edu.exam==='UEC'?'Junior middle (UEC)':'Lower secondary (Form 1–3)',L:3,ap:3};
  if(a>=16&&a<=17)return {label:S.edu.exam==='UEC'?'Senior middle · UEC':S.edu.exam==='IGCSE'?'Upper secondary · IGCSE':'Upper secondary (Form 4–5) · SPM',L:2,ap:3};
  return null;}
function studyMult(){return (S.dyn.leg&&S.dyn.leg.school&&S.country==='MY'?1.05:1)*(.4+S.stats.int/80)*(.6+S.stats.dis/100)*(S.traits.includes('Gifted')?1.25:1)*(S.traits.includes('Late bloomer')&&age()>=18?1.3:1);}
const passiveMult=()=>.4+S.stats.int/80;
const gradeOf=k=>k>=88?'A+':k>=75?'A':k>=62?'B':k>=50?'C':k>=38?'D':'E';
function startTrack(t){t.len=t.left;S.edu.track=t;S.know=(S.know||0)*.25;}
function apFor(){const a=age();if(S.pol&&S.pol.jail||S.jail||inHosp())return 0;if(a<4)return 0;if(a<7)return 1;if(a<13)return 2;if(S.retired||a>=65)return 3;if(a<18)return 4;return 5;}
function doAct(id){if(cur)return;const A=ACTS.find(x=>x.id===id);if(!A||!A.ok(age()))return;if(S.ap<=0){toast('No actions left this year. Press Next year.');return;}
  const tile=$(`.act[data-arg="${id}"]`),src=tile&&tile.getBoundingClientRect(),pre=fxRusty();
  S.ap--;const b=snap();const out=A.run();practise(id);if(out){log(out);const d=diff(b);toast(out+(d.length?'  ('+d.join(', ')+')':''));}render();actFx(id,src,b,pre);save();showNext();}
function langModal(){const opts=Object.keys(LANG).map(k=>[`${LANG[k]} <span class="mono muted">${Math.round(S.langs[k]||0)}</span>`,()=>{const g=(6+R(0,4))*(.6+S.stats.dis/100);S.langs[k]=clamp((S.langs[k]||0)+g);return 'You practise '+LANG[k]+' with apps and conversation classes.';}]);
  opts.push(['Not now',()=>{S.ap++;return '';},null,'Keeps your action for something else']);
  return {title:'Which language?',text:'Languages help with exams, jobs and moving abroad.',choices:opts};}

/* ================= love & family ================= */
// Chance that someone you meet at home is from another country: rare, higher at international and private schools.
function intlChance(){const a=age(),E=S.edu,t=E.track;let p=S.country==='SG'?.15:['kl','pj','penang'].includes(S.town)?.04:.025;
  if(a<=12&&E.primary==='intl'||a>=13&&a<=17&&E.secondary==='intl')p=.25;
  else if(t&&t.kind==='uni'&&!t.abroad)p=t.cost>=35000?.15:.05;
  return p;}
const FOREIGN_FROM=['UK','US','AU','DE','KR','KR','JP','JP','CN'];
function npc(minA,maxA,from){let g=S.pref==='opp'?(S.gender==='M'?'F':'M'):S.pref==='same'?S.gender:pick(['M','F']);
  let name,culture;const c=S.country;
  if((c==='MY'||c==='SG')&&!from&&chance(intlChance()))from=pick(FOREIGN_FROM);
  if(from&&from!==c){culture={JP:'japanese',KR:'korean',CN:'chinese',TW:'chinese'}[from]||'western';const P=FOREIGN_NAMES[from]||FOREIGN_NAMES.west;name=pick(g==='M'?P.m:P.f);}
  else if(c==='MY'||c==='SG'){from=null;culture=pick(partnerCults());name=genName(culture,g);}
  else{from=null;culture={JP:'japanese',KR:'korean',CN:'chinese',TW:'chinese'}[c]||'western';const P=FOREIGN_NAMES[c]||FOREIGN_NAMES.west;name=pick(g==='M'?P.m:P.f);}
  const jobs=[['Teacher',3100],['Engineer',4500],['Nurse',3000],['Accountant',4000],['Designer',3200],['Sales executive',3200],['Software engineer',5500],['Doctor',7000],['Business owner',5000],['Civil servant',3200],['Chef',2800],['Pharmacist',4800]];
  const j=pick(jobs);const a=clamp(age()+RI(-4,4),minA||16,maxA||99);
  return {name,culture,from:from||undefined,gender:g,age:a,job:a<22?'Student':j[0],salary:a<22?0:j[1]*R(.8,1.4),rel:30,status:'dating',alive:true,stats:{int:RI(30,90),hlt:RI(40,90),cha:RI(30,90),look:RI(30,90),cre:RI(30,90),ath:RI(30,90)}};}
function loveLevelModal(){const lv=(lbl,k,note)=>[lbl,()=>{if(S.ap<1)return '';S.ap--;if(chance(k==='high'?.55:k==='low'?.9:.75)){qFront(meetModal(false,k));return '';}return 'No sparks this time.';},()=>S.ap>0,note];
  return {title:'Look for love',icon:'m_love',tag:'Love',text:'What kind of partner are you looking for? (1 action)',choices:[
    lv('Someone like me','same','Similar looks, smarts and charm. Normal odds and normal loyalty.'),
    lv('Someone below my level','low','Easier to win over, and very loyal. Hard to lose them.'),
    lv('Someone above my level','high','Hard to win over. They are more likely to cheat or leave, though not always.'),
    ['Not now',null]]};}
function meetModal(young,lvl,pre){const adult=young||age()>=18,p=pre||npc(adult?18:16,adult?99:17),nw=netWorth()/infl();
  if(lvl){const off=lvl==='low'?()=>-R(10,25):lvl==='high'?()=>R(10,25):()=>R(-8,8);for(const k of ['int','hlt','cha','look','cre','ath'])p.stats[k]=clamp(Math.round((S.stats[k]||50)+off()),5,99);
    p.loy=lvl==='low'?1:lvl==='high'?-1:0;p.lvl=lvl;}
  if(young){p.age=clamp(age()-RI(8,20),18,99);p.young=1;p.job=p.age<23?'Student':pick(['Model','Influencer','Flight attendant','Barista','Personal trainer','Sales assistant']);p.salary=p.age<23?0:2500*R(.8,1.3);p.stats.look=clamp(p.stats.look+20);
    p.gold=chance(clamp((.45+(nw>5e5?.2:0)+(nw>2e6?.1:0))*(honTier()?1.2:1),0,.9));}else p.gold=chance(honTier()?.075:.05);
  const rich=young?clamp(Math.log10(Math.max(nw,1))*4-12,0,25):0;
  const compat=clamp(50+(S.stats.cha-50)/2+(S.stats.look-50)/3+R(-20,20)-(p.stats.look-S.stats.look)/5+rich+(lvl==='low'?25:lvl==='high'?-25:0),5,95);
  const hint=(p.gold&&chance(.5)?'\nThey ask what car you drive. Twice.':'')+(lvl==='low'?'\nThey seem a little starstruck by you.':lvl==='high'?'\nHonestly, they are out of your league, and they know it.':'');
  return {title:'Someone catches your eye',icon:'m_love',tag:'Love',text:`You meet ${esc(p.name)}, ${p.age}${natTxt(p)?','+natTxt(p):''}, ${jobTxt(p)}.\nChemistry: ${Math.round(compat)}%.${hint}`,
   choices:[['Ask them out',()=>{if(chance(compat/100)){S.partner=p;log('Started dating '+p.name+'.','big');bump('hap',6);return p.name+' says yes! You\'re now dating.';}bump('hap',-3);return p.name+' politely says they\'re not interested.';}],['Stay friends',()=>{S.friends++;return 'You add '+p.name+' to your circle of friends.';}]]};}
function rndStats(){return {int:RI(30,85),hlt:RI(40,90),cha:RI(30,85),look:RI(30,85),cre:RI(30,85),ath:RI(30,85)};}
function addKid(other,o){o=o||{};const st=o.adopted?inherit(rndStats(),rndStats()):inherit(S.stats,other||inheritBase());st.dis=RI(20,45);st.hap=RI(55,80);st.luck=RI(20,80);
  const g=pick(['M','F']);const k={name:genName(S.culture,g),gender:g,born:S.year-(o.ageBack||0),stats:st,alive:true,country:S.country,adopted:!!o.adopted,note:o.note||''};
  S.kids.push(k);addAch('parent');log((o.adopted?'Adopted ':'Welcomed ')+k.name+' into the family'+(o.note?' ('+o.note+')':'')+'.','big');bump('hap',o.hap!=null?o.hap:8);
  if(!o.ageBack&&!autoYears)qFront(nameKidModal(k,S.log[S.log.length-1]));return k;}
// The player names each newborn; the box starts with a suggested name.
function nameKidModal(k,entry){const who=k.gender==='M'?'boy':'girl';
  return {title:'Name your baby',icon:k.gender==='M'?'son':'daughter',tag:'Family',_party:1,text:`It's a ${who}! Type a name, or keep the one suggested.<input id="kid-name" class="name-in" maxlength="24" value="${esc(k.name)}" autocomplete="off" onkeydown="if(event.key==='Enter')choose(0)">`,choices:[
    ['Use this name',()=>{const el=$('#kid-name');const n=(el&&el.value||'').replace(/\s+/g,' ').trim().slice(0,24);if(n&&n!==k.name){if(entry)entry.t=entry.t.replace(k.name,n);k.name=n;}return '';}],
    ['Suggest another name',()=>{const el=$('#kid-name');if(el){let n,t=0;do n=genName(S.culture,k.gender);while(n===el.value&&++t<8);el.value=n;el.focus();}return 'keep';}]]};}
function newKid(){return addKid(S.partner&&S.partner.stats);}
function adoptModal(){const ok=married()?.85:.55,I=a2c(1);
  const go=(lbl,ageBack,cost,txt)=>[`${lbl} (${fmt(cost*I)})`,()=>{S.money-=cost*I;if(!chance(ok+(S.stats.cha-50)/300))return 'The Social Welfare Department (JKM) says your application needs more time. You can try again next year.'+(married()?'':' Single applicants face extra checks.');
    const k=addKid(null,{adopted:true,ageBack,hap:10});return txt.replace('#',k.name);},()=>S.money>=cost*I,'Needs '+fmt(cost*I)];
  return {title:'Adopt a child',icon:'m_adopt',tag:'Family',text:'You apply through the Social Welfare Department (JKM). Home visits, interviews and paperwork follow.'+(married()?'':'\nYou are applying as a single parent, so approval is harder.'),
    choices:[go('A baby',0,8000,'Welcome home, #! The sleepless nights begin.'),go('A toddler (age 2 to 4)',RI(2,4),5000,'# holds your hand all the way home. A new chapter starts.'),go('An older child (age 6 to 12)',RI(6,12),3000,'# spent years in a children\'s home. Tonight they sleep in their own room.'),['Not now',()=>{S.ap++;return '';},null,'Keeps your action for something else']]};}
function pregModal(o){const a=age(),p=S.partner,me=S.gender==='F',nm=o.name||'your partner';
  const support=()=>{if(p&&p.alive!==false&&o.fling&&chance(.6)){p.rel=clamp(p.rel-40);log(p.name+' found out about the child from your fling.','big');return ' '+p.name+' finds out and is devastated.';}return '';};
  // o.how says where the baby came from: a holiday fling (default), a one-night stand ('party') or a secret affair ('affair').
  const note=o.how==='affair'?'from an affair':o.how==='party'?'from a one-night stand':'from a holiday fling';
  if(o.fling&&!me)return {title:o.how==='affair'?'She is pregnant':o.how==='party'?'A message out of the blue':'A message from abroad',icon:'m_preg',tag:'Love',text:o.how==='affair'?`${esc(nm)} tells you she is pregnant, and the baby is yours.`:o.how==='party'?`Months after that party, ${esc(nm)} messages you. She is pregnant, and she says it's yours.`:`Months after your trip, ${esc(nm)} messages you. She is pregnant, and she says it's yours.`,choices:[
    ['Take responsibility and pay child support',()=>{expectKid(o.stats,{note,hap:0});S.money-=a2c(10000);return `You promise to support her. The baby is due next year, and you will send money every month and visit when you can.`+support();}],
    ['Ask for a paternity test',()=>{if(chance(.6)){expectKid(o.stats,{note,hap:0});S.money-=a2c(10000);return `The test says you are the father. The baby is due next year and will join your family tree.`+support();}return 'The test says you are not the father. You breathe again.';}],
    ['Ignore the messages',()=>{bump('hap',-4);S.dyn.rep-=2;return 'You block the number. It does not stop you wondering.';}]]};
  const intro=me?'You find out you are pregnant.':`${esc(nm)} tells you she is pregnant, and the baby is yours.`;
  const ctx=a<18?' You are still in secondary school, and your parents will find out soon.':S.edu.track&&!S.job?' You are still studying.':'';
  const keep=marry=>()=>{expectKid(o.stats,{note:o.how==='affair'?note:marry||married()?'':'born before marriage',hap:3});
    if(a<18){S.know=clamp((S.know||0)*.7);bump('dis',3);bump('hap',-4);}if(S.parenting==='Strict'&&a<25)bump('hap',-6);
    if(marry&&p){p.status='married';marryConvert(p);S.money-=a2c(5000);addAch('married');log('Married '+p.name+' before the baby arrived.','big');}
    else if(p&&!o.fling)p.rel=clamp(p.rel+5);
    return (a<18?'Life changes overnight. ':'')+'The baby is due next year.'+(marry?' You marry in a small ceremony first.':a<18?' Your family will help raise the baby while you finish school.':'')+(o.fling?support():'');};
  const ch=[['Keep the baby',keep(false)]];
  if(p&&p.alive!==false&&!o.fling&&p.status==='dating'&&a>=18)ch.push(['Keep the baby and get married',keep(true),()=>S.money>=a2c(5000),'Needs '+fmt(a2c(5000))]);
  ch.push(['Give the baby up for adoption',()=>{bump('hap',-8);log('Gave a baby up for adoption.','big');return 'A loving family adopts the baby. You think of them on every birthday.';}]);
  ch.push(['End the pregnancy',()=>{bump('hap',-10);S.money-=a2c(1500);if(p&&!o.fling)p.rel=clamp(p.rel-10);log('Ended a pregnancy.');return 'It is a hard decision. You take time to recover and talk it through with someone you trust.';}]);
  return {title:'Unexpected pregnancy',icon:'m_preg',tag:'Love',text:intro+ctx+'\nWhat will you do?',choices:ch};}
function flingModal(T){const f=npc(18);f.age=clamp(age()+RI(-5,5),18,99);return {title:'Holiday spark',icon:'m_fling',tag:'Travel',text:`On your ${esc(T.name)} trip you click with ${esc(f.name)}, a fellow traveller. One drink turns into a long night out.`,choices:[
  ['Spend the night together',()=>{let t='A night you won\'t forget.';const p=S.partner;
    if(p&&p.alive!==false){bump('hap',-3);if(chance(.35)){p.rel=clamp(p.rel-45);t+=' But '+p.name+' finds out. Trust is shattered.';log(p.name+' found out about a holiday fling.','big');}else t+=' You feel guilty on the flight home.';}
    if(f.gender!==S.gender&&chance(.15))q(pregModal({stats:f.stats,name:f.name,fling:true}));return t;}],
  ['Say goodnight and head back',()=>{bump('dis',1);return 'You swap Instagram handles and call it a night.';}]]};}
function goldDemandModal(){const p=S.partner;const D=[['a designer handbag',4000],['the latest iPhone',6000],['a Paris holiday',18000],['a new car',70000],['money to clear their family\'s debt',25000],['a condo deposit in their name',60000]];const d=pick(D),c=a2c(d[1]);
  return {title:p.name+' wants something',icon:'m_gold',tag:'Love',text:`${esc(p.name)} asks you for ${d[0]} (${fmt(c)}). "If you really loved me…"`,choices:[
    ['Pay for it',()=>{if(S.partner!==p)return 'It no longer matters.';S.money-=c;p.rel=clamp(p.rel+20);return p.name+' is all smiles. For now.';},()=>S.money>=c,'Needs '+fmt(c)],
    ['Say no',()=>{if(S.partner!==p)return 'It no longer matters.';p.rel=clamp(p.rel-25);if(p.rel<20){const was=p.status==='married';if(was&&S.money>0)S.money*=.4;S.partner=null;bump('hap',-10);log((was?'Divorced by ':'Dumped by ')+p.name+' after refusing to pay up.','big');return p.name+' leaves you'+(was?', and the divorce takes 60% of your cash.':'.')+' It was never really about you.';}return p.name+' sulks for weeks.';}]]};}
function cheatModal(){const p=S.partner;return {title:'Messages on their phone',icon:'m_cheat',tag:'Love',text:`You see messages on ${esc(p.name)}'s phone from someone else. It has been going on for months.`,choices:[
  ['End it',()=>{if(S.partner!==p)return 'It no longer matters.';const was=p.status==='married';if(was&&S.money>0)S.money*=p.gold?.4:.6;S.partner=null;bump('hap',-12);log((was?'Divorced ':'Broke up with ')+p.name+' after discovering an affair.','big');return 'You walk away.'+(was?' The divorce is expensive.':'');}],
  ['Forgive them',()=>{if(S.partner!==p)return 'It no longer matters.';p.rel=clamp(p.rel-10);bump('hap',-6);return p.name+' promises it will never happen again.';}]]};}
function inheritBase(){return {int:50,hlt:60,cha:50,look:50,cre:50,ath:50};}
function proposeModal(){const p=S.partner;const legal=!samePartner()||['UK','AU','US','CA','NZ','DE','TW'].includes(S.country);const I=a2c(1);
  const wed=(lbl,cost,txt)=>[`${lbl} (${fmt(cost*I)})`,()=>{if(!chance(p.rel/100+.15)){p.rel-=15;bump('hap',-6);return p.name+' says they\'re not ready yet. Ouch.';}
    S.money-=cost*I;p.status='married';marryConvert(p);addAch('married');log('Married '+p.name+'! '+txt,'big');bump('hap',12);S.withParents=false;return 'They said yes! '+txt;}];
  if(!legal)return {title:'Pop the question?',icon:'m_ring',tag:'Love',text:`Same-sex marriage isn't legally recognised in Malaysia${S.country!=='MY'?' or here':''}. Many couples commit as life partners, or marry in a country that recognises it (Taiwan, the UK, Australia and others).`,
    choices:[wed('Commit as life partners with a small celebration',3000,'A celebration with close friends.'),wed('Marry abroad in Taiwan',15000,'You marry in Taipei and celebrate with a small group.'),['Not yet',null]]};
  return {title:'Pop the question?',icon:'m_ring',tag:'Love',text:`You and ${esc(p.name)} have been together a while. How do you want to celebrate if they say yes?`,
    choices:[wed('Simple registration and family lunch',5000,'A small, sweet ceremony.'),wed('Kampung-style wedding feast',25000,'Half the kampung comes for the kenduri.'),wed('Hotel ballroom banquet',80000,'A ten-course dinner with 500 guests.'),['Not yet',null]]};}

/* ================= education ================= */
function tadikaModal(){return {title:'Starting tadika',icon:'m_tadika',tag:'Milestone',text:'Your parents choose a kindergarten for you.',choices:[
  ['Community tadika (KEMAS)',()=>{S.edu.school='KEMAS tadika';bump('cha',2);return 'Lots of singing, colouring and making friends.';}],
  ['Private tadika',()=>{S.edu.school='Private tadika';bump('int',2);bump('cha',1);return 'Phonics, maths games and a very strict teacher.';},()=>S.group!=='B40','Needs M40 or T20 family income'],
  ['Montessori preschool',()=>{S.edu.school='Montessori';bump('cre',3);bump('int',2);return 'Wooden toys, hands-on learning and lots of freedom.';},()=>S.group==='T20','T20 families only']]};}
function primaryModal(){const L=S.langs;return {title:'Primary school',icon:'m_primary',tag:'Milestone',text:'Which primary school will you attend?',choices:[
  ['Sekolah Kebangsaan (SK)',()=>{S.edu.primary='sk';return 'Malay-medium national school.';},null,'Malay medium'],
  ['SJK (Cina)',()=>{S.edu.primary='sjkc';return 'Mandarin-medium school with lots of homework.';},null,'Mandarin medium'],
  ['SJK (Tamil)',()=>{S.edu.primary='sjkt';return 'Tamil-medium vernacular school.';},null,'Tamil medium'],
  ['International school',()=>{S.edu.primary='intl';return 'English-medium, IGCSE syllabus, high fees.';},()=>S.group==='T20','T20 families only']]};}
function secondaryModal(){const E=S.edu;const ch=[['Sekolah Menengah Kebangsaan (SMK)',()=>{E.secondary='smk';return 'Your local secondary school. Hello, Form 1!';}]];
  ch.push(['Boarding school (MRSM / SBP)',()=>{E.secondary='board';bump('dis',4);bump('hap',-2);return 'You pack your bags for asrama life. Strict schedules, lifelong friends.';},()=>S.stats.int>=(isBumi()?62:72),isBumi()?'Needs strong results (Smarts 62+)':'MRSM is mostly for bumiputera. SBP needs Smarts 72+']);
  if(E.primary==='sjkc')ch.push(['Chinese independent school (UEC)',()=>{E.secondary='uec';E.exam='UEC';return 'You\'ll sit for the UEC instead of SPM. The UEC is a pre-university qualification: private and overseas universities accept it straight away, but public universities don\'t.';},()=>S.group!=='B40','Needs M40 or T20 income']);
  ch.push(['International school (IGCSE)',()=>{E.secondary='intl';E.exam='IGCSE';return 'English-medium IGCSE path.';},()=>S.group==='T20','T20 families only']);
  return {title:'Secondary school',icon:'m_secondary',tag:'Milestone',text:'Form 1 begins. Where will you go?',choices:ch};}
function streamModal(){return {title:'Form 4 stream',icon:'m_secondary',tag:'Milestone',text:'Pick your upper-secondary stream.',choices:[
  ['Science stream',()=>{S.edu.stream='sci';return 'Physics, Chemistry, Biology, Add Maths. Opens Medicine and Engineering.';},()=>S.stats.int>=45,'Needs Smarts 45+'],
  ['Arts & Commerce stream',()=>{S.edu.stream='arts';return 'Accounting, Economics, Literature and Art.';}]]};}
function spmResult(){const E=S.edu;const n=Math.round(clamp((S.know*.8+S.stats.int*.2-35)/5.5+R(-1.2,1.2)+(S.stats.luck-50)/50,0,10));E.spmA=n;E.level='spm';
  log(`${E.exam} results: ${n}A out of 10 subjects.`,'big');if(n>=10)addAch('straightA');
  if(E.exam==='UEC'){E.preu='UEC';E.preuScore=Math.round(clamp(S.know*.8+S.stats.int*.15+n*.5+R(-5,5)));}}
function uecModal(){const E=S.edu;return {title:'UEC done: what next?',icon:'m_spm',tag:'Milestone',text:`You scored ${E.spmA}A in the UEC (pre-university score ${E.preuScore}/100).\nThe UEC counts as a pre-university qualification, so you can go straight into a degree at a private university or overseas. Public universities, Matrikulasi and STPM don't accept it.`,
  choices:[['Go straight to a degree',()=>{qFront(majorModal(0));return '';}],
   ['Diploma at a private college (2 years)',()=>{startTrack({kind:'preu',id:'diploma',label:'Diploma (private college)',left:2,cost:15000});log('Started a Diploma at a private college.');return 'Practical diploma at a private college. About RM 15k a year.';}],
   ['Start working now',()=>{qFront(jobModal());return 'Straight into the working world.';}]]};}
function preuModal(){const E=S.edu,n=E.spmA,local=E.exam==='SPM';
  const mk=(id,label,yrs,cost,txt)=>()=>{startTrack({kind:'preu',id,label,left:yrs,cost});log('Started '+label+'.');return txt;};
  const ch=[
   ['Matrikulasi (1 year)',()=>{if(chance(isBumi()?.85:.2)){return mk('matrik','Matrikulasi',1,1000,'Accepted into Matrikulasi. A fast, intense year.')();}return (isBumi()?'Rejected: Matrikulasi places are limited.':'Rejected: about 90% of Matrikulasi places go to bumiputera students.')+' Pick another path.'+(qFront(preuModal()),'');},()=>local&&n>=7,'Needs 7A+ in SPM. Cheap, fast route to public uni'+(isBumi()?' · bumiputera priority':' · few places for non-bumiputera')],
   ['STPM / Form 6 (2 years)',mk('stpm','STPM (Form 6)',2,500,'Form 6 it is. Tough exams, but almost free.'),()=>local,'Cheap but tough. SPM students only'],
   ['A-Levels (2 years)',mk('alevel','A-Levels',2,30000,'A-Levels at a private college. Recognised worldwide.'),()=>n>=5,'Needs 5A+. About RM 30k a year'],
   ['Foundation programme (1 year)',mk('foundation','Foundation',1,25000,'A one-year foundation at a private university.'),()=>n>=3,'Needs 3A+. About RM 25k'],
   ['Diploma at a polytechnic (3 years)',mk('diploma','Diploma (polytechnic)',3,2000,'Hands-on diploma at a polytechnic.'),null,'Leads to a job or degree year 2'],
   ['TVET skills institute (2 years)',mk('tvet','TVET (skills institute)',2,500,'Welding, electrical and mechatronics. Skilled trades are in demand.'),null,'Skilled trades certificate'],
   ['Start working now',()=>{qFront(jobModal());return 'Straight into the working world.';}]];
  return {title:'After '+E.exam+': what next?',icon:'m_spm',tag:'Milestone',text:`You scored ${n}A in ${E.exam}. Choose your next step.`,choices:ch};}
// Chinese families: clan associations and Chinese education foundations give bursaries with no bond.
function clanModal(){const g=RI(6000,12000)*infl();return {title:'Clan association bursary',icon:'m_scholar',tag:'Milestone',text:`Your family's clan association gives bursaries to members' children with good results. You are offered ${fmt(g)} towards your studies, with no bond.`,
  choices:[['Accept with thanks',()=>{S.money+=g;bump('cha',1);log('Received a clan association bursary of '+fmt(g)+'.','big');return 'The association president hands you the cheque at the annual dinner. Your grandparents beam.';}]]};}
function scholarModal(k){k=k||'JPA';return {title:'Scholarship offer!',icon:'m_scholar',tag:'Milestone',text:(k==='MARA'?'As a bumiputera student with strong results, you are offered a MARA scholarship':'Your results earn you a JPA scholarship')+' covering all fees for pre-U and university.\nCatch: a bond to work in Malaysia for 5 years after graduating. Leave early and you repay about RM 150k (scaled).',
  choices:[['Accept the scholarship',()=>{S.edu.scholar=k;addAch('scholar');log('Awarded a '+k+' scholarship.','big');return 'Your parents frame the offer letter.';}],['Decline',()=>'You keep your freedom.']]};}
function payFees(){const E=S.edu,t=E.track,I=infl();let fee=t.cost*I;if(E.scholar&&!t.mature)return;
  const alive=S.parents.some(p=>p.alive)&&age()<26;const cap=!alive?0:S.group==='T20'?1e12:S.group==='M40'?25000*I:5000*I;let rem=Math.max(0,fee-cap);
  if(rem>0&&!t.abroad&&S.country==='MY'&&E.ptptnOn!==0){const l=Math.min(rem,20000*I);S.ptptn+=l;rem-=l;if(l>0)log('Took a PTPTN loan of '+fmt(l)+' for fees.');}
  if(rem>0){S.money-=rem;log('Paid '+fmt(rem)+' towards fees yourself.');}}
function finishTrack(){const E=S.edu,t=E.track;E.track=null;
  if(t.kind==='master'){E.master=1;E.uniTier=Math.min(3,(E.uniTier||1)+1);if(S.job)S.job.bonus=(S.job.bonus||1)*1.15;addAch('grad');log("Graduated with a Master's degree from "+t.uni+'.','big');
    if(t.abroad){E.abroadDeg=t.abroad;qFront({title:'Graduation abroad',icon:'m_grad',tag:'Milestone',_party:1,text:`You finished your Master's in ${COUNTRIES[t.abroad].name}. Malaysian employers pay more for an overseas qualification.`,choices:[['Fly home and start job hunting',()=>{moveTo('MY');qFront(jobModal());return 'Balik Malaysia! Your old colleagues want to hear everything.';}]]});}
    else qFront({title:'Graduation day',icon:'m_grad',tag:'Milestone',_party:1,text:`You collect your Master's degree from ${esc(t.uni)}.${S.job?' Your pay goes up 15%.':''}`,choices:[['Celebrate with the family',()=>{bump('hap',3);return 'A proud day.';}]]});
    return;}
  if(t.kind==='preu'){E.preu=t.label;E.preuScore=Math.round(clamp(S.know*.8+S.stats.int*.15+(E.spmA||0)*.5+R(-5,5)+(t.id==='matrik'?5:0)));
    if(t.id==='tvet'){E.level='tvet';log('Completed TVET with a skills certificate.','big');qFront(jobModal());return;}
    if(t.id==='diploma'){E.level='diploma';log('Graduated with a Diploma.','big');qFront({title:'Diploma done!',icon:'m_grad',tag:'Milestone',_party:1,text:'Continue to a degree (enter year 2) or start working?',choices:[['Continue to a degree',()=>{qFront(majorModal(1));return 'Back to studying!';}],['Start working',()=>{qFront(jobModal());return 'Time to earn a living.';}]]});return;}
    log(`Finished ${t.label}. Score: ${E.preuScore}/100.`,'big');qFront(majorModal(0));return;}
  E.level='degree';E.major=t.id;E.uni=t.uni;E.uniTier=t.tier;E.gpa=+clamp(2+(S.know*.8+S.stats.int*.2-40)/28+R(-.15,.15),2,4).toFixed(2);
  if(E.scholar&&!t.mature)E.bond=5;addAch('grad');if(S.ptptn>0&&E.gpa>=3.67){log('First-class honours: your PTPTN loan of '+fmt(S.ptptn)+' is waived!','big');S.ptptn=0;}log(`Graduated from ${t.uni} in ${MAJORS[t.id].name}, CGPA ${E.gpa.toFixed(2)}.`,'big');
  if(t.abroad){E.abroadDeg=t.abroad;const c=COUNTRIES[t.abroad];qFront({title:'Graduation abroad',icon:'m_grad',tag:'Milestone',_party:1,text:`You graduated in ${c.name}. Malaysian employers pay more for an overseas degree, and how much more depends on the industry and where you studied.`,choices:[
    ['Fly home and start job hunting',()=>{moveTo('MY');qFront(jobModal());return parAlive()?'Balik Malaysia! Mum cooks your favourite dinner.':'Balik Malaysia! Your first meal home is nasi lemak at the airport.';}]]});}
  else{if(!S.job)qFront(jobModal());else{S.job.bonus=(S.job.bonus||1)*1.1;log('Your new degree earns you a 10% raise at work.');}
    qFront({title:'Graduation day',icon:'m_grad',tag:'Milestone',_party:1,text:`Convocation at ${esc(t.uni)}. You walk across the stage to collect your degree in ${MAJORS[t.id].name}, CGPA ${E.gpa.toFixed(2)}.${S.job?' Your new degree earns you a 10% raise at work.':''}`,choices:[['Take photos with the family',()=>{bump('hap',3);return parAlive()?'Mum frames the photo for the living room.':'You frame it next to your parents\' old photo.';}]]});}}
function restudyModal(){const E=S.edu,ch=[];
  if(EDU_RANK[E.level]<3)ch.push(['Study for a degree',()=>{qFront(restudyMajorModal());return '';},()=>EDU_RANK[E.level]>=1,'Needs at least SPM']);
  else{if(!E.master)ch.push(["Master's degree or MBA, part-time (2 years)",()=>{startTrack({kind:'master',id:'master',label:"Master's degree (part-time)",left:2,cost:15000,uni:pick(['Universiti Malaya','UKM','Sunway University','Asia School of Business']),parttime:1,mature:1});log("Started a part-time Master's degree.",'big');return 'Evening classes and weekend assignments. It will boost your career.';},()=>S.money>=a2c(15000),'About '+fmt(a2c(15000))+' a year']);
    if(!E.master)ch.push(["Master's degree or MBA overseas (full-time)",()=>{qFront(abroadStudyModal('master'));return '';},()=>!S.travelBan,'Barred from leaving Malaysia']);
    ch.push(['A second degree in a new field',()=>{qFront(restudyMajorModal());return '';}]);}
  ch.push(['Not now',null]);
  return {title:'Go back to study',icon:'m_uni',tag:'Education',text:'It is never too late. Study full-time, or part-time while you keep working. You can also quit and go overseas to study, then come home with a foreign degree.',choices:ch};}
// Working adults can quit and study overseas, for a Master's (kind 'master') or a new degree (a MAJORS key).
function abroadStudyModal(k){const E=S.edu,I=a2c(1),mas=k==='master',M=mas?null:MAJORS[k],need=mas?55:(M.int||40)+10,ch=[];
  for(const [c,C] of Object.entries(COUNTRIES)){if(c==='MY')continue;const langOk=(S.langs[C.lang]||0)>=C.need-10||((S.langs.en||0)>=70&&['JP','KR','DE','TW'].includes(c));
    const yrs=mas?(['UK','AU'].includes(c)?1:2):M.yrs,fee=mas?Math.round(C.fee*1.15):C.fee;
    ch.push([`${C.flag} ${C.uni} (${fmt(fee*I)}/yr incl. living, ${yrs} yr${yrs>1?'s':''})`,()=>{
      if(S.job){S.lastJobId=S.job.id;S.lastJobName=JOBS[S.job.id].name;log('Quit work as '+JOBS[S.job.id].name+' to study in '+C.name+'.','big');S.job=null;}
      startTrack(mas?{kind:'master',id:'master',label:"Master's degree · "+C.name,left:yrs,cost:fee,uni:C.uni,abroad:c,mature:1}:{kind:'uni',id:k,label:'University · '+M.name,left:yrs,cost:fee,uni:C.uni,tier:3,abroad:c,mature:1});
      moveTo(c,true);S.residency='student';log(`Enrolled at ${C.uni} for ${mas?"a Master's degree":M.name}.`,'big');
      return `You hand in your resignation, pack two suitcases and fly to ${C.name}. Back in the lecture hall at ${age()}!`;},
      ()=>S.stats.int>=need&&langOk&&S.money>=fee*I*yrs&&!S.travelBan,`Needs Smarts ${need}+, ${LANG[C.lang]} ${C.need-10}+ and ${fmt(fee*I*yrs)} saved`]);}
  ch.push(['Cancel',null]);
  return {title:mas?"Master's degree overseas":'Study '+M.name+' overseas',icon:'ev_study_abroad',tag:'Education',text:'Studying overseas full-time means quitting your job. You pay from your own savings, and a foreign degree raises your pay when you come home.',choices:ch};}
function restudyMajorModal(){const ch=Object.entries(MAJORS).filter(([k])=>k!==S.edu.major).map(([k,m])=>{const why=[];if(m.int&&S.stats.int<m.int)why.push('Smarts '+m.int+'+');if(m.cre&&S.stats.cre<m.cre)why.push('Creativity '+m.cre+'+');if(m.ath&&S.stats.ath<m.ath)why.push('Fitness '+m.ath+'+');
    return [m.name,()=>{qFront(restudyModeModal(k));return '';},()=>!why.length,why.length?'Needs '+why.join(', '):m.yrs+' years full-time'];});ch.push(['Cancel',null]);
  return {title:'Choose a degree',icon:'m_uni',tag:'Education',text:'As a mature student, your Smarts matter more than old exam results.',choices:ch};}
function restudyModeModal(k){const M=MAJORS[k],I=a2c(1),need=(M.int||40)+10,pub=pick(['UiTM','UKM','USM','UPM']);
  const go=(uni,tier,cost,pt)=>()=>{startTrack({kind:'uni',id:k,label:'University · '+M.name+(pt?' (part-time)':''),left:M.yrs+(pt?1:0),cost,uni,tier,parttime:pt,mature:1});
    if(!pt&&S.job){S.lastJobId=S.job.id;S.lastJobName=JOBS[S.job.id].name;log('Quit work as '+JOBS[S.job.id].name+' to study full-time.','big');S.job=null;}
    log(`Enrolled at ${uni} for ${M.name}${pt?' (part-time)':''}.`,'big');return `Back to the lecture hall at ${age()}! `+(pt?'Work by day, study by night.':'Your classmates are a lot younger than you.');};
  return {title:'How will you study '+M.name+'?',icon:'m_uni',tag:'Education',text:'Full-time is faster, but you stop working. Part-time keeps your job but takes a year longer.',choices:[
    [`Full-time at ${pub} (${fmt(4000*I)}/yr)`,go(pub,2,4000,0),()=>S.stats.int>=need,'Needs Smarts '+need+'+'],
    [`Full-time at a private university (${fmt(35000*I)}/yr)`,go(pick(["Taylor's University",'Sunway University','UCSI University']),2,35000,0)],
    [`Part-time at Open University Malaysia (${fmt(8000*I)}/yr)`,go('Open University Malaysia',1,8000,1),()=>k!=='med','Medicine cannot be studied part-time'],
    ['Study overseas instead',()=>{qFront(abroadStudyModal(k));return '';},()=>!S.travelBan,'Barred from leaving Malaysia'],
    ['Cancel',null]]};}
function majorModal(diplomaBonus){const E=S.edu;const ch=Object.entries(MAJORS).map(([k,m])=>{const why=[];if(m.int&&S.stats.int<m.int)why.push('Smarts '+m.int+'+');if(m.cre&&S.stats.cre<m.cre)why.push('Creativity '+m.cre+'+');if(m.ath&&S.stats.ath<m.ath)why.push('Fitness '+m.ath+'+');if(m.sci&&E.stream!=='sci')why.push('Science stream');
    return [m.name,()=>{qFront(placeModal(k,diplomaBonus));return '';},()=>!why.length,why.length?'Needs '+why.join(', '):m.yrs+' years'];});
  ch.push(['Skip university and start working',()=>{qFront(jobModal());return 'You head straight into work.';}]);
  return {title:'Choose your degree',icon:'m_uni',tag:'Milestone',text:E.preuScore!=null?`Your pre-university score: ${E.preuScore}/100.`:'Pick a field of study.',choices:ch};}
function ptptnModal(cost){const I=infl();return {title:'Apply for PTPTN?',icon:'ev_u_ptptn',tag:'Money',text:`A PTPTN loan covers up to ${fmt(20000*I)} a year of fees that your family can't pay.\nTerms: about 1% a year in charges. You start repaying about ${fmt(3600*I)} a year once you're working. Graduate with first-class honours (CGPA 3.67+) and the whole loan is waived. Miss payments for 3 years in a row and you are barred from leaving Malaysia.`,choices:[
  ['Apply for PTPTN',()=>{S.edu.ptptnOn=1;log('Applied for a PTPTN loan.');return 'Approved. The money goes straight to your university.';}],['No thanks, we will pay ourselves',()=>{S.edu.ptptnOn=0;return 'Any fees your family cannot cover come out of your own pocket.';}]]};}
function placeModal(maj,db){const E=S.edu,M=MAJORS[maj],sc=E.preuScore??55,I=infl();const yrs=Math.max(2,M.yrs-(db?1:0));
  const go=(uni,tier,cost,abroad)=>()=>{startTrack({kind:'uni',id:maj,label:'University · '+M.name,left:yrs,cost,uni,tier,abroad});if(!abroad&&!E.scholar&&S.group!=='T20')qFront(ptptnModal(cost));if(abroad){moveTo(abroad,true);S.residency='student';}else S.withParents=TOWNS[S.town].col>=1.05;log(`Enrolled at ${uni} for ${M.name}.`,'big');return `Welcome to ${uni}!`+(abroad?' You fly out with two suitcases and a jar of sambal.':'');};
  const pubOk=sc>=M.pub&&E.exam!=='UEC';const top=sc>=85;
  const pub=top?pick(['Universiti Malaya','UKM','USM','UPM','UTM']):pick(['UiTM','UUM','UMS','UNIMAS','UTHM','UniMAP']);
  const priv=pick(["Taylor's University",'Sunway University','Asia Pacific University (APU)','UCSI University']);const ptop=pick(['Monash University Malaysia','University of Nottingham Malaysia']);
  const ch=[[`Public university: ${pub} (${fmt(4000*I)}/yr)`,go(pub,top?3:2,4000,null),()=>pubOk,E.exam==='UEC'?'Public universities don\'t accept UEC':'Needs pre-U score '+M.pub+'+'],
    [`Private: ${priv} (${fmt(35000*I)}/yr)`,go(priv,2,35000,null),()=>sc>=45,'Needs score 45+'],
    [`Private (branch campus): ${ptop} (${fmt(48000*I)}/yr)`,go(ptop,3,48000,null),()=>sc>=60,'Needs score 60+']];
  for(const [k,C] of Object.entries(COUNTRIES)){if(k==='MY')continue;const langOk=(S.langs[C.lang]||0)>=C.need-10||((S.langs.en||0)>=70&&['JP','KR','DE','TW'].includes(k));
    const fund=S.group==='T20'||E.scholar||S.money>=C.fee*I*2;
    ch.push([`${C.flag} ${C.uni} (${fmt(C.fee*I)}/yr incl. living)`,go(C.uni,3,C.fee,k),()=>sc>=65&&langOk&&fund,`Needs score 65+, ${LANG[C.lang]} ${C.need-10}+, and T20 family, a scholarship or 2 years of fees saved`]);}
  ch.push(['Choose a different degree',()=>{qFront(majorModal(db));return '';}],['Skip university and start working',()=>{qFront(jobModal());return 'You head straight into work.';}]);
  return {title:'Where will you study '+M.name+'?',icon:'m_uni',tag:'Milestone',text:'Fees are covered by family first (T20: all, M40: up to RM 25k/yr, B40: up to RM 5k/yr), then PTPTN for local study, then your own money.'+(E.scholar?'\nYour '+E.scholar+' scholarship covers everything.':''),choices:ch};}


