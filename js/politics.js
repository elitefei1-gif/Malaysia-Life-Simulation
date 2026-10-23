'use strict';
// Politics: parties, elections, scandals.
/* ================= politics ================= */
const PARTIES={BR:{name:'Barisan Rakyat',str:{rural:.6,urban:.36,east:.44,borneo:.38}},GR:{name:'Gabungan Reformasi',str:{rural:.36,urban:.64,east:.3,borneo:.4}},
  PAU:{name:'Parti Amanah Ummah',str:{rural:.48,urban:.2,east:.66,borneo:.15}},GB:{name:'Gabungan Borneo',str:{rural:.15,urban:.18,east:.1,borneo:.66}},
  IND:{name:'Independent',str:{rural:.14,urban:.18,east:.12,borneo:.16}}};
const SEATS={rural:['Rural seat','Sik, Kedah'],urban:['Urban mixed seat','Petaling Jaya, Selangor'],east:['East coast seat','Pasir Mas, Kelantan'],borneo:['Borneo seat','Tawau, Sabah']};
const POL_RANKS=['Party member','Branch Youth Chief','Division Chief','ADUN (State Assemblyman)','Member of Parliament','Deputy Minister','Minister','Deputy Prime Minister','Prime Minister'];
const POL_PAY=[0,0,0,8000,16000,22000,30000,35000,40000];
const SEAT_W={rural:.35,urban:.35,east:.12,borneo:.18};
function polW(){if(!S.polW){let ge=S.year+1;while((ge-2022)%5)ge++;S.polW={gov:S.year<2018?'BR':'GR',swing:{BR:0,GR:0,PAU:0,GB:0,IND:0},nextGE:ge};}return S.polW;}
function inGov(){return !!S.pol&&S.pol.party===polW().gov;}
function canStand(){return !S.bankruptYears&&!(S.pol.ban>S.year)&&!S.pol.jail;}
function polTitle(){return S.pol&&S.pol.mb&&S.pol.rank<5?'Menteri Besar':S.pol?POL_RANKS[S.pol.rank]:'';}
function heatHint(h){return h<15?'Nobody is looking':h<35?'A few rumours':h<60?'Journalists are asking questions':h<80?'The MACC has opened a file':'An arrest feels close';}
// The player's name with any royal title in front, e.g. "Tan Sri Wei Jie".
function honTier(){return {Datuk:1,"Dato'":1,'Datuk Seri':2,"Dato' Sri":2,"Dato' Seri":2,'Dato Seri':2,'Tan Sri':3,'Puan Sri':3,Tun:4}[S.honour]||0;}
function dispName(){return (S.honour?S.honour+' ':'')+S.name;}
function giveHonour(t){const rep={Datuk:5,'Datuk Seri':6,'Tan Sri':8,Tun:15}[t]||3;S.honour=t;TT().src='pol';if(S.pol)S.pol.title=t;S.dyn.rep+=rep;addAch('datuk');log(`Conferred the title "${t}".`,'big');
  q({title:'Royal honour',icon:'m_scholar',tag:'Politics',text:`You are conferred the title of ${t}. From now on, people call you "${t} ${S.name}".`,choices:[['Receive it at the palace',()=>{bump('hap',6);return 'A proud day for the whole family.';}]]});}
function setRank(r){const P=S.pol;const was=P.rank;P.rank=r;if(r>was&&r>=3)log('Became '+POL_RANKS[r]+'.','big');
  if(r>=5&&S.job){S.lastJobId=S.job.id;S.lastJobName=JOBS[S.job.id].name;S.job=null;log('Resigned from your job to serve in government.');}
  if(r>=6)addAch('minister');if(r===8){addAch('pm');P.wasPM=1;}}
function nationalResult(){const W=polW(),P=S.pol;for(const k in W.swing)W.swing[k]=R(-.12,.12);
  if(P&&P.rank===8&&P.budgetHit)W.swing[P.party]+=P.budgetHit;if(P)P.budgetHit=0;
  const score=k=>Object.keys(SEAT_W).reduce((t,s)=>t+SEAT_W[s]*(PARTIES[k].str[s]+W.swing[k]),0);
  const old=W.gov;W.gov=['BR','GR','PAU','GB'].sort((a,b)=>score(b)-score(a))[0];
  log(`General election: ${PARTIES[W.gov].name} forms the government.`+(old!==W.gov?' A change of government!':''),'big');
  if(P&&old!==W.gov&&P.party===old&&P.heat>15){P.heat+=20;}
  return old!==W.gov;}
function winProb(type,lvl,spend){const P=S.pol,W=polW(),share=PARTIES[P.party].str[type]+(W.swing[P.party]||0);
  return clamp(.5+(share-.45)*1.6+(S.stats.cha-50)/250+P.sup/300+S.dyn.rep/400+spend+(P.rank>=3&&P.seat===type?.07:0)+(P.dirty===0&&type==='urban'?.05:0)+(S.dyn.leg&&S.dyn.leg.bridge&&type!=='urban'?.05:0)-(P.heat>60?.08:0)-(lvl==='fed'?.05:0),.03,.95);}
function geModal(){const P=S.pol,seat=P.rank>=3,ch=[];
  if(seat){ch.push([`Defend your seat in ${SEATS[P.seat][1]}`,()=>{qFront(spendModal(P.seat,P.rank>=4?'fed':'state'));return '';}]);
    if(P.rank===3)ch.push([`Move up to the Parliament seat of ${SEATS[P.seat][1]}`,()=>{qFront(spendModal(P.seat,'fed'));return '';}]);}
  else for(const k in SEATS)ch.push([`${SEATS[k][0]}: ${SEATS[k][1]}`,()=>{qFront(levelModal(k));return '';},null,`${PARTIES[P.party].name} is ${PARTIES[P.party].str[k]>=.55?'strong':PARTIES[P.party].str[k]>=.35?'competitive':'weak'} here`]);
  ch.push(['Sit this election out',()=>{if(seat){P.rank=Math.min(P.rank,2);P.seat=null;P.mb=0;log('Stepped down at the general election.','big');}return 'You stay out of the race this time.';}]);
  return {title:'General election',icon:'m_vote',tag:'Politics',text:`Parliament is dissolved. ${PARTIES[P.party].name} ${P.party==='IND'?'has no party machine, so you are on your own.':'wants you on the ballot.'}${P.heat>=35?'\nThe opposition is talking about your "unexplained wealth".':''}`,choices:ch};}
function levelModal(k){return {title:SEATS[k][1],icon:'m_vote',tag:'Politics',text:'Which seat will you contest?',choices:[['State seat (ADUN)',()=>{qFront(spendModal(k,'state'));return '';}],['Parliament seat (MP), harder to win',()=>{qFront(spendModal(k,'fed'));return '';}]]};}
function spendModal(k,lvl){const I=infl();const go=(cost,bonus,heat)=>()=>{const P=S.pol;S.money-=cost*I;if(heat){P.heat+=heat;P.dirty++;}return runElection(k,lvl,bonus);};
  const ch=[['Shoestring campaign (RM 10k)',go(10000,0,0)],['Full campaign at the legal cap (RM 200k)',go(200000,.08,0),()=>S.money>=200000*I,'Needs '+fmt(200000*I)],
    ['Spend whatever it takes (RM 1M, over the cap)',go(1000000,.14,15),()=>S.money>=1000000*I,'Illegal. Raises MACC attention'],
    ['Hand out cash to voters before polling day (RM 300k)',go(300000,.12,20),()=>S.money>=300000*I,'Vote buying. Raises MACC attention']];
  return {title:'Campaign',icon:'m_vote',tag:'Politics',text:`${lvl==='fed'?'Parliament':'State'} seat: ${SEATS[k][1]}. Ceramah talks, posters on every lamp post, and a lot of teh tarik with voters.`,choices:ch};}
function runElection(k,lvl,bonus){const P=S.pol,W=polW(),p=winProb(k,lvl,bonus),won=chance(p);
  const vs=Math.round(clamp(42+(p-.5)*30+R(-4,4)+(won?6:-6),20,80));
  if(!won){const had=P.rank>=3;P.rank=Math.min(P.rank,2);P.seat=null;P.mb=0;bump('hap',-10);log(`Lost the election in ${SEATS[k][1]} with ${vs}% of the vote.`,'big');
    return `You lose with ${vs}% of the vote.`+(had?' You are no longer a Yang Berhormat.':'')+' The party will remember who campaigned hard.';}
  const prev=P.rank;P.seat=k;P.terms++;P.sup=Math.max(P.sup,40);addAch('yb');bump('hap',10);
  setRank(lvl==='fed'?4:3);let txt=`You win ${SEATS[k][1]} with ${vs}% of the vote! You are now a Yang Berhormat.`;
  log(`Won the ${lvl==='fed'?'Parliament':'state'} seat of ${SEATS[k][1]} with ${vs}% of the vote.`,'big');
  if(inGov()&&lvl==='fed'&&P.party!=='IND'){const L=P.loy;
    if(prev>=7&&chance(.5)){setRank(8);txt+=' The party picks you as Prime Minister!';}
    else if(prev>=6&&L>=75&&chance(.35)){setRank(7);txt+=' You are made Deputy Prime Minister.';}
    else if((prev>=5||L>=70)&&chance(.45)){setRank(6);txt+=' You are appointed a Minister.';}
    else if(L>=50&&chance(.35+L/300)){setRank(5);txt+=' You are appointed a Deputy Minister.';}}
  else if(inGov()&&lvl==='state'&&P.party!=='IND'&&P.loy>=55&&chance(.25)){P.mb=1;txt+=' The party names you Menteri Besar of the state!';log('Became Menteri Besar.','big');}
  if(!inGov()&&P.rank>=4)txt+=` ${PARTIES[W.gov].name} forms the government, so you sit in the opposition.`;
  return txt;}
function partyElModal(){const P=S.pol,to=POL_RANKS[P.rank+1],I=infl(),p=clamp(.25+(S.stats.cha-50)/150+(P.loy-40)/150+S.dyn.rep/300,.05,.9);
  const win=extra=>{if(chance(Math.min(.95,p+extra))){setRank(P.rank+1);P.loy+=5;log('Won the party election for '+to+'.','big');return 'The delegates vote for you. You are now '+to+'!';}P.loy-=5;return 'You lose the party election. There is always the next one.';};
  return {title:'Party elections',icon:'m_vote',tag:'Politics',text:`${PARTIES[P.party].name} is holding party elections. You could run for ${to}. Your chance: about ${Math.round(p*100)}%.`,choices:[
    ['Campaign clean',()=>win(0)],['Buy delegates\' votes (RM 100k)',()=>{S.money-=100000*I;P.heat+=12;P.dirty++;return win(.3);},()=>S.money>=100000*I,'Money politics. Raises MACC attention'],['Don\'t contest',null]]};}
function allocModal(){const P=S.pol,I=infl(),amt=500000*I;
  return {title:'Constituency allocation',icon:'m_money',tag:'Politics',text:`You have ${fmt(amt)} in allocations this year to spend in ${SEATS[P.seat][1]}.`,choices:[
    ['Fix roads, the surau and the dewan',()=>{P.sup+=15;bump('hap',2);return 'New tar on the kampung roads and a fresh coat of paint on the dewan. Voters notice.';}],
    ['Give the projects to cronies for a 10% cut',()=>{const g=amt*.1;S.money+=g;P.sup+=6;P.heat+=10;P.dirty++;log('Received "commissions" on constituency projects.');return `The projects go to "friendly" contractors. ${fmt(g)} finds its way to you.`;}]]};}
function polEvent(){const P=S.pol,pool=[];
  if(P.rank>=3)pool.push({t:'Late-night WhatsApp',x:'At 11pm a voter messages you: their house is flooded and the family needs help.',ch:[['Rush over with supplies',()=>{bump('hlt',-1);S.money-=a2c(500);P.sup+=8;return 'You wade in with food boxes. The photos go viral, in a good way.';}],['Send an aide',()=>{P.sup+=2;return 'Your aide handles it. Fair enough.';}],['Ignore it',()=>{P.sup-=6;return 'The family posts about it on Facebook. Ouch.';}]]});
  pool.push({t:'A fiery speech',x:'At a big ceramah, the crowd is restless. Your speechwriter suggests playing the race and religion card.',ch:[['Play the race and religion card',()=>{P.sup+=P.seat==='urban'?5:18;S.dyn.rep-=4;if(chance(.3)){P.heat+=10;log('Investigated by police over a speech.','big');return 'The crowd roars, but police open an investigation under the Sedition Act.';}return 'The crowd roars. The editorials are not kind.';}],['Talk about bread-and-butter issues',()=>{P.sup+=4;S.dyn.rep+=1;return 'Less applause, more respect.';}]]});
  pool.push({t:'Viral TikTok',x:'A clip of you mixing up two state capitals at a ceramah goes viral.',ch:[['Apologise quickly',()=>{P.sup-=3;return 'You laugh it off. It blows over in a week.';}],['Double down',()=>{if(chance(.5)){P.sup+=6;return 'Your fans love the defiance.';}P.sup-=12;S.dyn.rep-=3;return 'Now there are memes. So many memes.';}]]});
  if(P.rank>=2&&P.party!=='IND')pool.push({t:'Faction war',x:'Two factions are fighting for control of the party ahead of its general assembly.',ch:[['Back the president',()=>{P.loy+=10;return 'You stay loyal. The president remembers.';}],['Back the challenger',()=>{if(chance(.45)){P.loy+=20;return 'The challenger wins and rewards you.';}P.loy-=25;return 'The challenger loses. You are frozen out of party posts.';}]]});
  if(P.rank>=4&&P.party!=='IND')pool.push({t:'The "hotel move"',x:'Rival leaders invite you to a hotel in Petaling Jaya. They offer you a Minister post if you switch sides.',ch:[
    ['Switch sides',()=>{const W=polW(),to=['BR','GR','PAU','GB'].filter(k=>k!==P.party).sort((a,b)=>PARTIES[b].str[P.seat]-PARTIES[a].str[P.seat])[0];
      log('Switched from '+PARTIES[P.party].name+' to '+PARTIES[to].name+'.','big');P.party=to;P.loy=50;
      if(chance(clamp(.45+(S.stats.cha-50)/200+P.sup/400,.1,.85))){const flip=W.gov!==to;W.gov=to;setRank(6);return `Under the anti-hopping law you lose your seat, but you win the by-election. `+(flip?`Your defection tips the balance: ${PARTIES[to].name} now leads the government, and you are a Minister!`:`You join the ${PARTIES[to].name} government as a Minister!`);}
      P.rank=2;P.seat=null;P.mb=0;bump('hap',-12);return 'Under the anti-hopping law you lose your seat, and voters punish you in the by-election. Ouch.';}],
    ['Stay loyal',()=>{P.loy+=15;return 'You walk out of the hotel. Your party leaders hear about it.';}]]});
  const e=pick(pool);q({title:e.t,icon:'m_vote',tag:'Politics',text:e.x,choices:e.ch.map(c=>[c[0],()=>S.pol&&!S.pol.jail?c[1]():'That no longer matters now.'])});}
function polTick(){const P=S.pol;
  if(!P||age()<18)return;const W=polW(),I=infl();
  if(P.jail>0){P.jail--;bump('hap',-8);if(S.partner)S.partner.rel=clamp(S.partner.rel-10);
    if(P.jail>0&&inGov()&&chance(.15)){P.jail=0;P.ban=S.year+5;log('Received a royal pardon and walked free.','big');q({title:'Royal pardon',icon:'m_vote',tag:'Politics',text:'The Pardons Board cuts your sentence. You walk out of prison early.',choices:[['Walk free',()=>'Your supporters wait outside the gate with banners.']]});return;}
    if(P.jail===0){P.ban=S.year+5;log('Released from prison.','big');q({title:'Released',icon:'m_vote',tag:'Politics',text:'You walk out of Kajang Prison. You cannot stand for election for the next 5 years.',choices:[['Start again',()=>'The world moved on without you.']]});}
    else log('Another year in Kajang Prison.');return;}
  if(P.rank>=5){const T=pick(TRIPS.filter(t=>!['cameron','langkawi'].includes(t.id)));const st=pick(['int','cha','cre']);bump(st,2);if(!S.visited.includes(T.id))S.visited.push(T.id);log('Official working trip: '+T.name+'.');}
  if(P.rank>=6)bump('hlt',-1);
  P.sup=clamp(P.sup-4);P.loy=clamp(P.loy-2);P.heat=Math.max(0,P.heat-4);
  if(P.dirty>0&&P.rank>=3){P.heat+=3*(S.assets.cars.filter(c=>c.lux).length+S.assets.houses.filter(h=>h.lux).length);}
  if(P.offshore&&chance(.05)){P.heat+=40;log('An overseas leak names your offshore accounts.','big');q({title:'Leaked files',icon:'m_money',tag:'Politics',text:'A leak of offshore records names you as the owner of a company in the Seychelles.',choices:[['No comment',()=>'Reporters camp outside your house.']]});}
  if(P.proxy&&chance(.05)&&S.money>0){const l=S.money*.2;S.money-=l;log('A relative holding your assets kept '+fmt(l)+'.','big');q({title:'Family betrayal',icon:'m_money',tag:'Politics',text:`The brother-in-law who holds assets in his name refuses to give back ${fmt(l)}. You can't exactly report it.`,choices:[['Grit your teeth',()=>'Lesson learned.']]});}
  if(P.dirty===0&&P.rank>=3)S.dyn.rep+=.5;
  if(chance(Math.max(0,(P.heat-35)/120))){q(raidModal());return;}
  if(S.year>=W.nextGE||W.snap){W.snap=0;W.nextGE=S.year+5;const changed=nationalResult();
    if(P.rank>=5&&!inGov()){P.rank=4;}
    if(canStand()&&(P.rank>=2||P.party==='IND'||P.loy>=60))q(geModal());
    else if(P.rank>=3){P.rank=2;P.seat=null;P.mb=0;log('Could not stand at the general election and lost your seat.','big');}
    else if(changed)log('A new government takes office.');}
  else{
    if(P.party!=='IND'&&P.rank<2&&S.year%3===0&&S.year-P.joined>=1)q(partyElModal());
    if((P.rank===3||P.rank===4)&&P.seat)q(allocModal());
    if(P.rank===7&&inGov()&&chance(.1)){setRank(8);log('The Prime Minister resigned. You take over.','big');q({title:'Prime Minister',icon:'m_vote',tag:'Politics',text:'The Prime Minister resigns, and the party picks you to lead the country.',choices:[['Take the oath',()=>'You are sworn in at Istana Negara.']]});}
    if(P.party!=='IND'&&P.loy<10&&chance(.5)){P.party='IND';if(P.rank>=5)P.rank=4;log('Sacked from the party.','big');q({title:'Sacked',icon:'m_vote',tag:'Politics',text:'The party supreme council sacks you. You keep your seat for now, as an independent.',choices:[['Fight on alone',()=>'Being an independent is lonely.']]});}
    if(P.rank>=1&&chance(.4))polEvent();}
  if(P.rank>=3&&honTier()<1&&chance(.06))giveHonour('Datuk');
  else if((P.rank>=6||P.mb)&&honTier()===1&&chance(.12))giveHonour(P.mb?'Datuk Seri':'Tan Sri');
  else if(P.rank>=6&&honTier()===2&&chance(.1))giveHonour('Tan Sri');}
function raidModal(){const P=S.pol,I=infl();const seized=Math.max(0,S.money)*.35;S.money-=seized;P.heat=Math.max(0,P.heat-30);log('MACC raided your home. Seized: '+fmt(seized)+'.','big');
  const trial=lawyer=>()=>{const plead=lawyer==='plead';if(lawyer==='top')S.money-=800000*I;if(lawyer==='normal')S.money-=100000*I;
    const r=Math.random(),acq=lawyer==='top'?.35:lawyer==='normal'?.15:0,dnaa=plead?0:inGov()?.3:.1;
    if(r<acq){P.heat=10;S.dyn.rep-=2;log('Acquitted of corruption charges.','big');return 'The judge acquits you. Your supporters cheer outside the court.';}
    if(r<acq+dnaa){P.heat=40;S.dyn.rep-=4;log('Given a discharge not amounting to acquittal (DNAA).','big');return 'The prosecution drops the case with a "discharge not amounting to acquittal". You are free, but the case could come back.';}
    const yrs=plead?RI(1,3):RI(3,12),fine=Math.max(a2c(1000000),seized);S.money-=fine;S.dyn.rep-=10;P.jail=yrs;P.rank=0;P.seat=null;P.mb=0;P.heat=0;S.ap=0;if(S.ttl&&S.ttl.src==='buy'){stripTitle();S.ttl.bought=0;}
    if(S.job){S.lastJobId=S.job.id;S.lastJobName=JOBS[S.job.id].name;S.job=null;}bump('hap',-20);log(`Convicted of corruption: ${yrs} year${yrs===1?'':'s'} in prison and a ${fmt(fine)} fine.`,'big');
    return `Guilty. You are sentenced to ${yrs} year${yrs===1?'':'s'} in prison and fined ${fmt(fine)}. You lose your seat and every party post.`;};
  return {title:'MACC raid',icon:'m_vote',tag:'Politics',text:`At dawn, MACC officers search your home. They seize ${fmt(seized)} in cash, handbags and watches. You are charged in court.`,choices:[
    [`Hire the top lawyer in KL (${fmt(800000*I)})`,trial('top')],[`Hire a normal lawyer (${fmt(100000*I)})`,trial('normal')],['Plead guilty for a lighter sentence',trial('plead')]]};}
function dealsModal(){const P=S.pol,I=infl(),r=P.rank,ch=[];
  const deal=(lbl,min,max,heat,note)=>[lbl,()=>{if(S.ap<1)return '';S.ap--;const g=RI(min,max)*I;S.money+=g;P.heat+=heat;P.dirty++;log('Received a "donation".');return `${fmt(g)} quietly changes hands.`;},()=>S.ap>0,note];
  ch.push(deal('Take cash "donations", no receipts',50000,200000,8,'Low MACC attention'));
  if(r>=6||P.mb)ch.push(deal('Award contracts to cronies for a cut',1000000,10000000,25,'High MACC attention'));
  if(P.mb||r>=6)ch.push(deal('Sell state land cheap to a "friendly" developer',5000000,15000000,30,'High MACC attention'));
  if(r===8)ch.push(deal('Siphon money from a state investment fund',100000000,500000000,60,'Very high MACC attention'));
  ch.push(['Stay clean',null]);
  return {title:'Back-room deals',icon:'m_money',tag:'Politics',text:'Businessmen are always happy to "help" a politician. Each deal uses 1 action.\nMACC attention: '+heatHint(P.heat)+'.',choices:ch};}
function hideModal(){const P=S.pol;return {title:'Hide the money',icon:'m_money',tag:'Politics',text:'MACC attention: '+heatHint(P.heat)+'.',choices:[
    ['Put assets in a relative\'s name (10% fee)',()=>{S.money-=Math.max(0,S.money)*.1;P.heat=Math.max(0,P.heat-20);P.proxy=1;return 'Your brother-in-law now "owns" a lot of things. Hopefully he stays loyal.';},()=>S.money>0],
    ['Move it to offshore accounts (5% fee)',()=>{S.money-=Math.max(0,S.money)*.05;P.heat=Math.max(0,P.heat-25);P.offshore=1;return 'A shell company in the Seychelles now holds your money. Leaks do happen, though.';},()=>S.money>0],['Not now',null]]};}
function policyModal(){const P=S.pol,W=polW();P.policyYear=S.year;const pm=P.rank===8;
  const opts=pm?[['Tax cuts for the middle class',()=>{S.taxCut=S.year+1;P.budgetHit=.03;P.sup+=6;return 'The budget cuts income tax. Your own tax bill drops next year too.';}],
      ['Cash aid for B40 households',()=>{P.budgetHit=.04;P.sup+=10;S.dyn.rep+=1;return 'Millions of families receive cash aid. Your approval rating jumps.';}],
      ['Cut subsidies to balance the books',()=>{P.budgetHit=-.04;S.dyn.rep+=4;P.sup-=8;return 'Economists applaud. Voters at the petrol station do not.';}],
      ['A mega infrastructure push',()=>{P.budgetHit=.02;P.sup+=6;return 'New highways and rail lines are announced. Contractors line up at your door.';}]]
    :[['Raise the minimum wage',()=>{P.sup+=10;S.dyn.rep+=1;return 'Workers celebrate. Business groups grumble.';}],['Cut fuel subsidies',()=>{S.dyn.rep+=3;P.sup-=10;W.swing[P.party]=(W.swing[P.party]||0)-.02;return 'Economists approve. Your voters do not.';}],
      ['Free tuition at public universities',()=>{P.sup+=8;return 'Students and parents cheer.';}],['Launch a mega project in your state',()=>{P.sup+=5;return 'A new highway is announced. Ribbon-cutting photos everywhere.';}]];
  return {title:pm?'Table the national budget':'Choose your policy for the year',icon:'m_vote',tag:'Politics',text:pm?'As Prime Minister you table this year\'s national budget.':'Pick one policy to push this year.',choices:opts};}
function joinModal(){const ch=['BR','GR','PAU','GB'].map(k=>[PARTIES[k].name,()=>{S.pol={party:k,rank:0,sup:20+polBoost(),loy:40,heat:0,dirty:0,seat:null,joined:S.year,jail:0,ban:0,terms:0,mb:0};log('Joined '+PARTIES[k].name+'.','big');return 'You pay your membership fee and get your party T-shirt.';},null,{BR:'Strong in rural seats',GR:'Strong in urban, mixed seats',PAU:'Strong on the east coast',GB:'Strong in Sabah and Sarawak'}[k]]);
  ch.push(['Go independent',()=>{S.pol={party:'IND',rank:0,sup:20+polBoost(),loy:50,heat:0,dirty:0,seat:null,joined:S.year,jail:0,ban:0,terms:0,mb:0};log('Started an independent political career.','big');return 'No party, no machinery, no bosses.';},null,'Very hard to win']);
  ch.push(['Not now',null]);return {title:'Join a political party',icon:'m_vote',tag:'Politics',text:'Pick a party. Which seats you can win depends on where the party is strong.',choices:ch};}
function polPanel(){const a=age();if(a<18||S.country!=='MY')return '';const P=S.pol,W=polW();
  if(!P)return `<div class="panel"><h3>Politics</h3><p class="muted" style="margin:0;font-size:13px">${S.honour?'Title: '+S.honour+'. ':''}Join a party to start a political career, all the way up to Prime Minister.</p><div class="row"><button class="btn small" data-act="poljoin">Join a political party</button></div></div>`;
  if(P.jail)return `<div class="panel"><h3>Politics</h3><p style="margin:0">You are in Kajang Prison. ${P.jail} year${P.jail===1?'':'s'} left.</p></div>`;
  const b=(act,lbl,ok)=>`<button class="btn small" data-act="${act}" ${ok?'':'disabled'}>${lbl}</button>`;
  return `<div class="panel"><h3>Politics</h3><dl class="kv"><dt>Party</dt><dd>${PARTIES[P.party].name}${inGov()?' (in government)':P.party==='IND'?'':' (opposition)'}</dd><dt>Position</dt><dd>${polTitle()}${P.seat?' · '+SEATS[P.seat][1]:''}</dd>${S.honour?`<dt>Title</dt><dd>${S.honour}</dd>`:''}
    <dt>Local support</dt><dd>${Math.round(P.sup)}/100</dd><dt>Party standing</dt><dd>${Math.round(P.loy)}/100</dd><dt>MACC attention</dt><dd>${heatHint(P.heat)}</dd><dt>Next general election</dt><dd>${W.nextGE}</dd>${P.rank>=3?`<dt>Pay</dt><dd class="mono">${fmt(POL_PAY[P.rank]*infl())}/month</dd>`:''}${P.ban>S.year?`<dt>Banned from standing</dt><dd>until ${P.ban}</dd>`:''}</dl>
    <div class="row">${P.party!=='IND'?b('polwork','Party work (1 action)',S.ap>0):''}${P.rank>=1||P.party==='IND'?b('ceramah','Hold a ceramah (1 action)',S.ap>0):''}${P.rank>=2?b('deals','Back-room deals',S.ap>0):''}${P.dirty>0?b('hide','Hide the money',S.money>0):''}${P.rank>=6||P.mb?b('policy',P.rank===8?'Table the budget':'Choose a policy',P.policyYear!==S.year):''}${P.rank===8?b('callge','Call a snap election',!W.snap&&W.nextGE>S.year+1):''}${b('polquit','Retire from politics',true)}</div></div>`;}

