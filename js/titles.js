'use strict';
// Honour titles (Dato', Tan Sri, Tun): buying, earning, events, yearly tick, panel.
/* ================= titles: buy one or earn one (v73) ================= */
// Dato' can be bought (illegal, MACC risk). Dato' and Dato' Seri can be earned with the yearly "Contribute to the nation" action.
// Tan Sri and Tun only come through politics. Legacies (S.dyn.leg) outlast you and pass to your heirs.
function TT(){if(!S.ttl)S.ttl={macc:0,bought:0,src:null,pts:0,yrs:[],last:0,given:0,natYear:0,buyYear:0,bribe:0,due:null,dueSrc:null,builds:[],sch:[],trust:0,inhYear:0,invite:0,pause:0,engYears:0,freeDoc:0};if(!S.dyn.leg)S.dyn.leg={};return S.ttl;}
function tArt(k,fb){return ICON_IMG[k]?k:fb;}
function heatNow(){return S.pol?S.pol.heat:TT().macc;}
function heatAdd(n){if(S.pol)S.pol.heat=Math.max(0,S.pol.heat+n);else{const T=TT();T.macc=Math.max(0,T.macc+n);}}
const HON_BIZ=[0,.05,.1,.15,.15],HON_COL=[0,.03,.05,.07,.07];
function honRate(){return !S?0:honTier()>=2?.01:honTier()?.005:0;}
function spouseHon(p){const t=honTier();return t&&p&&p.status==='married'&&p.gender==='F'?['','Datin ','Datin Seri ','Puan Sri ','Toh Puan '][t]:'';}
function polBoost(){const T=TT(),b=(honTier()>=2?10:0)+(T.invite?15:0);T.invite=0;return b;}
function blokName(){return 'Blok '+(S.famName||S.name.split(' ')[0]);}
function NAT(){const c=S.culture;return [
  {id:'sch',n:'Sponsor 10 B40 scholarships',c:75000,p:4,rep:.5,hap:2,cha:0,t:'Ten students from poor families get full scholarships. Your name is on every award letter.'},
  {id:'food',n:'A food bank and flood relief supplies',c:180000,p:9,rep:1,hap:2,cha:1,t:'Boats, generators and a warehouse of dry food, ready for the next monsoon.'},
  {id:'school',n:'A school block and library for a rural school',c:450000,p:22,rep:2,hap:3,cha:1,b:1,t:()=>`A new block with a library goes up at a rural school. The headmaster names it "${blokName()}".`},
  {id:'hall',n:c==='malay'?'A surau and community hall':c==='chinese'?'A temple hall and community centre':'A community hall',c:675000,p:32,rep:2,hap:3,cha:2,b:1,t:'The whole town turns up for the opening. There is enough food for a thousand people.'},
  {id:'dial',n:'A dialysis centre for a small town',c:1200000,p:55,rep:3,hap:4,cha:1,b:1,t:'Patients who used to travel three hours for dialysis can now go down the road.'},
  {id:'bridge',n:'A bridge and road to an Orang Asli village',c:2700000,p:120,rep:4,hap:5,cha:2,b:1,t:'For the first time, the village children can get to school when the river floods.'},
  {id:'wing',n:'A hospital wing',c:7500000,p:320,rep:6,hap:6,cha:3,b:1,t:()=>`A new wing opens at the state hospital. The sign over the door says "${S.dyn.wingName||S.famName+' Family'} Wing".`}];}
function natGoal(){const t=honTier();return t<1?{t:"Dato'",p:300,y:3}:t<2?{t:"Dato' Seri",p:900,y:6}:null;}
function natFill(){const g=natGoal(),T=TT();return g?Math.min(1,T.pts/g.p,T.yrs.length/g.y):1;}
function natHint(f){return f<.25?'Few people know your name':f<.5?'The local papers mention your charity':f<.75?'State officials have noticed your work':f<1?'Your name is on an honours shortlist':'Your name has gone to the palace';}
function natOk(){const T=TT();return age()>=25&&S.country==='MY'&&!S.jail&&T.natYear!==S.year&&T.pause!==S.year;}
function addPts(n){const T=TT();T.pts+=n;T.last=S.year;if(!T.yrs.includes(S.year))T.yrs.push(S.year);natCheck();}
function natCheck(){const g=natGoal(),T=TT();if(g&&!T.due&&T.pts>=g.p&&T.yrs.length>=g.y){T.due=g.t;T.dueSrc='nation';log('Your name has been put forward for a state honour.');}}
function nationModal(){const I=infl(),g=natGoal();
  const ch=NAT().map(P=>{const cost=P.c*I;return [`${P.n} (${fmt(cost)})`,()=>giveNation(P,cost),()=>S.money>=cost,'Needs '+fmt(cost)+' in cash'];});
  ch.push(['Not this year',()=>{S.ap++;return 'You put the chequebook back in the drawer.';}]);
  return {title:'Contribute to the nation',icon:tArt('ev_t_ribbon','ev_bigproject'),tag:'Titles',text:'Which project will you fund this year? Big projects are remembered long after you are gone.'+(g?`\nRecognition: ${natHint(natFill())}.`:''),choices:ch};}
function giveNation(P,cost){const T=TT(),L=S.dyn.leg,nw=Math.max(1,netWorth());S.money-=cost;T.natYear=S.year;T.given+=cost;
  S.dyn.rep+=P.rep;bump('hap',P.hap);if(P.cha)bump('cha',P.cha);
  if(P.id==='sch')T.sch.push(S.year);if(P.b)T.builds.push({n:P.n,c:cost,y:S.year});
  const first=!L[P.id];L[P.id]=(L[P.id]||0)+1;if(P.id==='wing'&&first)S.dyn.wingName=(S.famName||S.name)+' Family';
  if(P.id==='bridge'&&first)S.assets.houses.forEach(h=>{if(h.country==='MY'&&/kampung|terrace/i.test(h.name))h.value*=1.2;});
  if(S.pol&&S.pol.seat&&!S.pol.jail){S.pol.sup=clamp(S.pol.sup+P.p/5);if(polW().nextGE-S.year<=1)heatAdd(5);}
  log(`Funded ${P.n.replace(/^A /,'a ').replace(/^Sponsor/,'sponsorship of')} (${fmt(cost)}).`,'big');
  addPts(P.p);
  if(P.c>=450000&&chance(.4))q(ribbonModal());
  if(cost>nw*.3&&S.partner&&S.partner.alive!==false&&married()&&chance(.5))q(famFirstModal());
  let t=typeof P.t==='function'?P.t():P.t;const g=natGoal();if(g)t+=`\nRecognition: ${natHint(natFill())}.`;return t;}
function conferTitle(t,src){const T=TT();S.honour=t;T.src=src;if(S.pol)S.pol.title=t;addAch('datuk');log(`Conferred the title "${t}"${src==='buy'?' (arranged through a middleman)':''}.`,'big');}
function stripTitle(){const T=TT();if(T.src!=='buy')return false;S.honour=null;T.src=null;if(S.pol)S.pol.title=null;log('Stripped of your title.','big');return true;}
function honoursModal(t,src){const mum=S.parents.find(p=>p.alive&&p.role==='Mother'),seri=t!=="Dato'",I=infl();
  if(seri)return {title:'The honours list',icon:tArt('ev_t_investiture','ev_award'),tag:'Titles',text:`Years of schools, clinics and bridges have not gone unnoticed. On the Sultan's Birthday, the palace confers on you the title ${t}.`+(mum?' Your mother cries through the whole ceremony.':''),
    choices:[['Kneel before the Sultan',()=>{conferTitle(t,src);bump('hap',10);bump('cha',2);S.dyn.rep+=6;return `From today you are ${t} ${S.name}.`;}]]};
  return {title:'The honours list',icon:tArt('ev_t_investiture','ev_award'),tag:'Titles',text:`A letter with the state crest arrives. Your name is on this year's Sultan's Birthday honours list, for "outstanding service to the people". You are to be conferred the title ${t}.`,
    choices:[['Receive it at the palace',()=>{conferTitle(t,src);bump('hap',8);bump('cha',3);S.dyn.rep+=5;return `From today, people call you "${t} ${S.name}".`;}],
      [`Receive it, then hold a kenduri for the whole kampung (${fmt(45000*I)})`,()=>{conferTitle(t,src);S.money-=45000*I;bump('hap',10);bump('cha',5);S.dyn.rep+=7;return 'Three cows, a thousand guests and a queue for nasi minyak that goes round the block.';},()=>S.money>=45000*I]]};}
/* --- buying a title --- */
function buyOk(){return age()>=30&&S.country==='MY'&&!honTier()&&!S.jail&&!(S.pol&&S.pol.jail);}
function buyRich(){return netWorth()>=2e6*infl();}
function buyModal(free){const I=infl();TT().buyYear=S.year;
  return {title:'A title, for a price',icon:tArt('ev_t_lobby','ev_bribe'),tag:'Titles',text:'Everyone knows titles can be "arranged". Nobody says it out loud. The highest you can buy is Dato\'.\nMACC attention: '+heatHint(heatNow())+'.',choices:[
    [`Meet a middleman in a hotel lobby (${fmt(525000*I)})`,()=>buyTitle(525000*I,.7,20),()=>S.money>=525000*I,'Some of these men are conmen · raises MACC attention'],
    [`Go through a "royal insider" (${fmt(1200000*I)})`,()=>buyTitle(1200000*I,.95,30),()=>S.money>=1200000*I,'Almost certain · raises MACC attention a lot'],
    ['Walk away',()=>{if(!free)S.ap++;return 'You decide your name is fine as it is.';}]]};}
function buyTitle(cost,ok,heat){const T=TT();S.money-=cost;
  if(!chance(ok)){heatAdd(5);bump('hap',-6);log(`Lost ${fmt(cost)} to a title scam.`,'big');
    q({title:'Scammed',icon:tArt('ev_t_lobby','ev_bribe'),tag:'Titles',text:'The middleman stops answering his phone. The "palace contact" never existed. You can\'t exactly go to the police.',choices:[['Swallow the loss',()=>'An expensive lesson.']]});
    return `You hand over ${fmt(cost)} in a paper bag and wait for the good news.`;}
  heatAdd(heat);T.bought=1;T.bribe=cost;conferTitle("Dato'",'buy');S.dyn.rep+=2;bump('cha',3);bump('hap',6);
  return `A few months later your name appears on a state honours list. Nobody at the ceremony asks what you did to deserve it. From today you are "Dato' ${S.name}".`;}
function titleRaidModal(){const T=TT(),I=infl();const seized=Math.max(0,S.money)*.2;S.money-=seized;T.macc=Math.max(0,T.macc-30);log('MACC raided your home. Seized: '+fmt(seized)+'.','big');
  const fine=2*(T.bribe||300000*I);
  const trial=k=>()=>{if(k==='top')S.money-=800000*I;if(k==='normal')S.money-=100000*I;
    if(k==='plead'){const s=stripTitle();S.money-=fine;S.dyn.rep-=4;T.macc=0;T.bought=0;log(`Pleaded guilty to corruption. Fined ${fmt(fine)}.`,'big');return `You plead guilty. The court fines you ${fmt(fine)}${s?' and the palace strips your title':''}. No prison.`;}
    if(chance(k==='top'?.35:.15)){T.macc=10;S.dyn.rep-=2;log('Acquitted of corruption charges.','big');return 'The judge acquits you. The middleman takes all the blame.';}
    const yrs=RI(1,3),s=stripTitle();S.money-=fine;S.dyn.rep-=8;T.macc=0;T.bought=0;S.jail=yrs;S.ap=0;
    if(S.job){S.lastJobId=S.job.id;S.lastJobName=JOBS[S.job.id].name;S.job=null;}bump('hap',-20);
    log(`Convicted of corruption: ${yrs} year${yrs===1?'':'s'} in prison and a ${fmt(fine)} fine.`,'big');
    return `Guilty. You are sentenced to ${yrs} year${yrs===1?'':'s'} in prison and fined ${fmt(fine)}.${s?' The palace strips your title.':''} You lose your job.`;};
  return {title:'MACC at the door',icon:tArt('ev_t_macc','ev_raid'),tag:'Titles',text:`At dawn, MACC officers search your home. They seize ${fmt(seized)} and charge you with corruption.`,choices:[
    [`Hire the top lawyer in KL (${fmt(800000*I)})`,trial('top')],[`Hire a normal lawyer (${fmt(100000*I)})`,trial('normal')],['Plead guilty: a fine but no prison',trial('plead')]]};}
/* --- events --- */
function ribbonModal(){return {title:'The ribbon-cutting',icon:tArt('ev_t_ribbon','ev_bigproject'),tag:'Titles',text:'The Menteri Besar wants to officiate the opening of "your" building. His people have already printed his face on the banner.',choices:[
  ['Let him take the credit',()=>{addPts(15);return 'He gives a long speech and thanks you once, near the end. The state government remembers your good manners.';}],
  ['Insist on cutting the ribbon yourself',()=>{bump('cha',2);S.dyn.rep+=2;return 'You cut the ribbon. The photo makes the front page, and the MB\'s office goes quiet.';}]]};}
function famFirstModal(){const p=S.partner;return {title:'"Charity starts at home"',icon:'t_family',tag:'Titles',text:`${esc(p.name)} has seen the bank statements. "You gave away more this year than we spend in ten. What about us?"`,choices:[
  ['Promise to slow down',()=>{p.rel=clamp(p.rel+5);TT().pause=S.year+1;return 'You agree to skip giving next year. Dinner is warm again.';}],
  ['Explain why it matters',()=>{if(roll('cha')>.5){p.rel=clamp(p.rel+3);return `${esc(p.name)} listens, and then asks to come to the next opening.`;}p.rel=clamp(p.rel-10);return 'The talk turns into a fight. You sleep in the guest room.';}]]};}
function appealModal(){const I=infl(),c=300000*I;return {title:'Flood appeal',icon:'ev_flood',tag:'Titles',text:'The east coast is under water and the government asks tycoons to help. A donation now counts double.',choices:[
  [`Donate ${fmt(c)}`,()=>{const T=TT();S.money-=c;T.given+=c;S.dyn.rep+=1;bump('hap',3);log(`Gave ${fmt(c)} to the national flood appeal.`);addPts(28);return 'Your lorries of supplies reach Kuala Krai before the army does.';},()=>S.money>=c,'Needs '+fmt(c)],
  ['Send prayers',()=>'You share the appeal on WhatsApp.']]};}
function ringModal(){const T=TT();return {title:'The title ring is busted',icon:tArt('ev_t_macc','ev_pol_raid'),tag:'Titles',text:'MACC arrests the broker who "arranged" titles for a fee. The papers say he is naming his clients.',choices:[
  ['Turn witness and return the title',()=>{const s=stripTitle();S.dyn.rep-=4;T.bought=0;if(S.pol)S.pol.heat=Math.max(0,S.pol.heat-25);else T.macc=0;log('Turned witness against a title broker.','big');return s?'You give a statement and hand back your title. Embarrassing, but you stay out of court.':'You give a statement. MACC closes your file.';}],
  ['Deny everything',()=>{heatAdd(25);return 'Your lawyer says "no comment" on your behalf. MACC is not convinced.';}]]};}
function revokeModal(){const T=TT();return {title:'The palace cleans house',icon:tArt('ev_t_revoked','ev_pol_sacked'),tag:'Titles',text:'The Sultan revokes a batch of "questionable" titles. Your name is on the list in every newspaper.',choices:[
  ['Accept it quietly',()=>{stripTitle();T.bought=0;S.dyn.rep-=5;bump('hap',-6);return 'Your business cards go in the bin. At least nobody is going to prison.';}]]};}
function journoModal(){const I=infl(),c=75000*I;return {title:'A journalist starts digging',icon:'ev_scandal',tag:'Titles',text:'A reporter from an online portal is asking how you got your title. She has a copy of your bank transfer.',choices:[
  [`Pay her editor to drop it (${fmt(c)})`,()=>{S.money-=c;heatAdd(5);return 'The story never runs. Someone at MACC notices the payment, though.';},()=>S.money>=c],
  ['Ignore it',()=>{S.dyn.rep-=2;heatAdd(8);return 'The story goes viral for a week. MACC reads it too.';}]]};}
function blackmailModal(){const I=infl(),c=150000*I;return {title:'The middleman comes back',icon:tArt('ev_t_lobby','ev_bribe'),tag:'Titles',text:`The man who arranged your title calls. Business is slow. He wants ${fmt(c)} to "keep quiet".`,choices:[
  ['Pay him',()=>{S.money-=c;return 'He thanks you warmly. You have a feeling he will call again.';},()=>S.money>=c],
  ['Refuse',()=>{heatAdd(20);return 'He hangs up. A week later, an anonymous tip reaches MACC.';}]]};}
function fixerModal(){return {title:'A card at a wedding dinner',icon:tArt('ev_t_fixer','ev_w_wedding'),tag:'Titles',text:'Between the eighth course and the yam seng, a man in a batik shirt slides you a business card: "Titles. Discreet. Any state."',choices:[
  ['Hear him out',()=>{qFront(buyModal(true));return 'He lowers his voice and names his prices.';}],['Throw the card away',()=>'You go back to your shark fin soup.']]};}
function fastModal(){const I=infl(),c=300000*I,T=TT(),g=natGoal();return {title:'The fast-track offer',icon:tArt('ev_t_lobby','ev_bribe'),tag:'Titles',text:`A man in a songkok says your name is already on a shortlist. For ${fmt(c)}, he can make sure it goes to the top of the pile.`,choices:[
  ['Pay him',()=>{S.money-=c;T.bought=1;T.bribe=c;T.due=g.t;T.dueSrc='buy';heatAdd(20);return 'He promises good news next year. Your title will now come with strings attached.';},()=>S.money>=c],
  ['Report him to MACC',()=>{S.dyn.rep+=3;return 'He is arrested a month later. Your honesty is noted.';}]]};}
function partyAskModal(){return {title:'A party wants you',icon:'ev_pol_party',tag:'Titles',text:'A party division chief visits with a box of kuih. "Someone like you should be an MP. People already know your name."',choices:[
  ['Join a party',()=>{TT().invite=1;qFront(joinModal());return 'You ask him which party would have you. "Any of them, Boss."';}],['Stay out of politics',()=>'You thank him for the kuih.']]};}
function prModal(){return {title:'"Just a PR stunt"',icon:'ev_viral',tag:'Titles',text:'A viral post says your donations are just a tax trick to buy a title.',choices:[
  ['Publish your audited accounts',()=>{if(roll('int')>.45){S.dyn.rep+=2;return 'The numbers are clean. The post gets deleted, and people like you more for it.';}S.dyn.rep-=1;return 'Nobody understands the accounts, and the comments only get worse.';}],
  ['Ignore it',()=>{S.dyn.rep-=1;return 'It blows over, mostly.';}]]};}
function roofModal(){const T=TT(),b=T.builds.splice(Math.floor(Math.random()*T.builds.length),1)[0],nm=b.n.replace(/^A /,'').toLowerCase(),fix=b.c*.25;
  return {title:'The contractor cut corners',icon:tArt('ev_t_roof','ev_w_house'),tag:'Titles',text:`The roof of the ${nm} you funded leaks in the first monsoon. The contractor used cheap materials.`,choices:[
    [`Pay to fix it properly (${fmt(fix)})`,()=>{S.money-=fix;return 'New roof, new contractor. Nobody outside the committee ever knows.';},()=>S.money>=fix],
    ['Sue the contractor',()=>{if(chance(.5)){S.dyn.rep+=1;return 'The court orders the contractor to fix it at his own cost.';}S.money-=fix*1.2;return 'The case drags on and the contractor goes bust. You pay for the repairs and the lawyers.';}],
    ['Ignore it',()=>{T.pts*=.85;S.dyn.rep-=3;return '"Tycoon\'s showpiece falls apart" makes the evening news.';}]]};}
function scholarBackModal(){const T=TT();T.sch.shift();const v=S.assets.biz.length?pick(['doc','eng']):S.pol&&!S.pol.jail?pick(['doc','mp']):'doc';
  if(v==='eng'){T.engYears=5;return {title:'A letter from a scholar',icon:'ev_u_convo',tag:'Titles',text:'A young engineer you sponsored years ago asks to work for you. "I want to give back to the person who gave me a chance."',choices:[['Hire her',()=>{bump('hap',4);return 'She streamlines your business within a year. Profits are up.';}]]};}
  if(v==='mp'){return {title:'A letter from a scholar',icon:'ev_u_convo',tag:'Titles',text:'One of your old scholarship students has just been elected as an MP. She tells reporters you changed her life.',choices:[['Call to congratulate her',()=>{S.pol.sup=clamp(S.pol.sup+10);bump('hap',4);return 'She tells her voters to back you too.';}]]};}
  T.freeDoc=1;return {title:'A letter from a scholar',icon:'ev_u_convo',tag:'Titles',text:'A young doctor writes: "Your scholarship got me through medical school. If you ever need a doctor, call me."',choices:[['Write back',()=>{bump('hap',5);return 'You keep the letter in your desk drawer. Your next illness will be in good hands.';}]]};}
function vipModal(){const I=infl(),where=pick(['a round of golf with two ministers','the Sultan\'s Hari Raya open house','a charity gala at a KL hotel','a private dinner with a tycoon']);
  return {title:'A VIP invitation',icon:tArt('ev_t_golf','ev_w_dinner'),tag:'Titles',text:`As ${S.honour} ${esc(S.name)}, you are invited to ${where}.`,choices:[
    ['Talk business',()=>{if((S.assets.biz.length||(S.job&&['entrepreneur','sales'].includes(S.job.id)))&&chance(.4)){const g=RI(300000,1500000)*I;S.money+=g;log(`Closed a deal at a VIP event worth ${fmt(g)}.`,'big');return `A handshake over teh tarik turns into a deal worth ${fmt(g)}.`;}bump('cha',1);return 'You collect a stack of business cards.';}],
    ['Listen to a "special offer"',()=>{const g=RI(500000,2000000)*I;S.money+=g;heatAdd(15);log('Took a "consultancy fee".');return `A businessman wants you to put in a word for a tender. Your "consultancy fee" is ${fmt(g)}. MACC would call it something else.`;}],
    ['Just enjoy the evening',()=>{bump('hap',3);bump('cha',1);return 'Good food, good company, and a selfie with royalty.';}]]};}
function inheritModal(k){const I=infl(),c=450000*I,T=TT();T.inhYear=S.year;return {title:'"Our inheritance"',icon:'t_family',tag:'Titles',text:`${esc(k.name)} sits you down. "You keep giving everything away. Will there be anything left for your own grandchildren?"`,choices:[
  [`Set up a family trust (${fmt(c)})`,()=>{S.money-=c;T.trust=1;k.stats.hap=clamp((k.stats.hap||60)+10);return 'The lawyers draw up a trust for the grandchildren. The complaints stop.';},()=>S.money>=c],
  ['Stand firm',()=>{bump('hap',-3);k.stats.hap=clamp((k.stats.hap||60)-10);return `"It's my money." ${esc(k.name)} leaves without finishing dinner.`;}]]};}
/* --- yearly tick --- */
function titleTick(){if(age()<18)return;const T=TT(),L=S.dyn.leg,t=honTier(),MY=S.country==='MY';
  if(S.jail>0){S.jail--;bump('hap',-8);if(S.partner&&S.partner.alive!==false)S.partner.rel=clamp(S.partner.rel-10);
    if(S.jail===0){log('Released from prison.','big');q({title:'Released',icon:'ev_pol_released',tag:'Titles',text:'You walk out of Sungai Buloh Prison. The world moved on without you.',choices:[['Start again',()=>'Your family is waiting at the gate.']]});}
    else log('Another year in Sungai Buloh Prison.');return;}
  if(S.pol&&T.macc>0){S.pol.heat+=T.macc;T.macc=0;}
  if(!S.pol){T.macc=Math.max(0,T.macc-4);if(T.macc>=35&&chance((T.macc-35)/120)){q(titleRaidModal());return;}}
  if(L.wing)S.dyn.rep+=.5;
  const active=T.last&&S.year-T.last<=1;
  if(active){bump('hap',1);if(age()>=60)bump('hlt',1);S.kids.forEach(k=>{const ka=S.year-k.born;if(k.alive!==false&&ka>=13&&ka<18)k.stats.cha=clamp(k.stats.cha+1);});}
  if(T.pts>0&&T.last&&S.year-T.last>=3)T.pts*=.9;
  if(t>=2)S.kids.forEach(k=>{const ka=S.year-k.born;if(k.alive!==false&&ka>=6&&ka<18&&chance(.1))k.stats.dis=clamp((k.stats.dis||40)-2);});
  if(T.engYears>0)T.engYears--;
  if(T.due&&MY){const d=T.due,src=T.dueSrc||'nation';T.due=null;T.dueSrc=null;if(t<({"Dato'":1,"Dato' Seri":2}[d]||0)){q(honoursModal(d,src));return;}}
  const f=natFill(),a=age(),adultKid=S.kids.find(k=>k.alive!==false&&S.year-k.born>=21);
  const pool=[
    [T.bought?.05:0,ringModal],[T.bought&&T.src==='buy'?.03:0,revokeModal],[T.bought&&t?.08:0,journoModal],[T.bought?.06:0,blackmailModal],
    [MY&&a>=30&&!t&&!T.bought&&!T.due&&buyRich()?.1:0,fixerModal],
    [MY&&natGoal()&&!T.due&&!T.bought&&f>.5&&f<1?.1:0,fastModal],
    [MY&&!S.pol&&a>=25&&a<=65&&T.pts>0?.04+.1*f:0,partyAskModal],
    [active&&T.pts>0?.08*(.5+f):0,prModal],
    [T.builds.some(b=>S.year-b.y<=10)?.08:0,roofModal],
    [T.sch.some(y=>S.year-y>=6)?Math.min(.15,.05*T.sch.length):0,scholarBackModal],
    [MY&&t?.3:0,vipModal],
    [adultKid&&!T.trust&&S.year-T.inhYear>=5&&T.given>(Math.max(0,netWorth())+T.given)/3?.1:0,()=>inheritModal(adultKid)]];
  for(const [p,fn] of pool.sort(()=>Math.random()-.5))if(p>0&&chance(p)){q(fn());break;}}
function titlePanel(){const a=age();if(a<21||(S.country!=='MY'&&!S.honour))return '';const T=TT(),t=honTier(),g=natGoal(),h=heatNow(),L=S.dyn.leg;
  const src={buy:'arranged through a middleman',nation:'for service to the nation',pol:'for political service'}[T.src]||'';
  const hall=L.hall?(S.culture==='malay'?'a surau':S.culture==='chinese'||S.culture==='indian'?'a temple hall':'a community hall'):'';
  const legs=[L.sch&&'B40 scholarships',L.food&&'a flood relief food bank',L.school&&blokName(),hall,L.dial&&'a dialysis centre',L.bridge&&'a bridge to an Orang Asli village',L.wing&&`the ${S.dyn.wingName||S.famName+' Family'} Wing at the state hospital`].filter(Boolean);
  const perks=t?`Business +${Math.round(HON_BIZ[t]*100)}% · loans ${t>=2?'1':'0.5'}% cheaper${t>=3?' · board chairman':t>=2?' · company director':''} · living costs +${Math.round(HON_COL[t]*100)}%`:'';
  let out=`<div class="panel"><h3>Titles & honours</h3><dl class="kv"><dt>Title</dt><dd>${S.honour?esc(S.honour)+(src?' · '+src:''):'None yet'}</dd>${t?`<dt>Perks</dt><dd>${perks}</dd>`:''}${h>0||T.bought?`<dt>MACC attention</dt><dd>${heatHint(h)}</dd>`:''}${legs.length?`<dt>Your legacy</dt><dd>${esc(legs.join(', '))}</dd>`:''}${S.jail?`<dt>Prison</dt><dd>${S.jail} more year${S.jail===1?'':'s'}</dd>`:''}</dl>`;
  if(g&&a>=25&&S.country==='MY'){const f=natFill();out+=`<div class="stat"><div class="lbl"><span>Recognition · towards ${g.t}</span><span>${f>=1?'Complete':''}</span></div><div class="bar"><i class="hi" style="width:${Math.max(2,Math.round(f*100))}%"></i></div></div>
    <p class="muted" style="margin:0;font-size:12.5px">${natHint(f)}. Use <b>Contribute to the nation</b> each year. A title takes years of giving, not one big cheque.</p>`;}
  else if(!g)out+=`<p class="muted" style="margin:0;font-size:12.5px">Tan Sri and Tun only come through politics.</p>`;
  if(buyOk())out+=`<div class="row"><button class="btn small" data-act="buytitle" ${S.ap>0&&buyRich()&&T.buyYear!==S.year?'':'disabled'}>Find someone who can "arrange" a title (1 action)</button></div>${buyRich()?'':`<p class="muted" style="margin:0;font-size:12.5px">The fixers only talk to people worth ${fmt(2e6*infl())} or more.</p>`}`;
  return out+'</div>';}
