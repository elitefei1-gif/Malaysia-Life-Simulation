'use strict';
// Moving abroad, travel, assets and dynasty mode.
/* ================= moving / travel ================= */
function moveTo(code,study){const was=S.country;S.country=code;S.withParents=code==='MY'&&!married()&&S.parents.some(p=>p.alive);
  if(code==='MY'){if(was!=='MY'){if(S.everAbroad>=3&&EDU_RANK[S.edu.level]>=3&&S.myCitizen&&!S.repDone&&!study){S.repDone=1;const b=30000*infl();S.money+=b;log('Returning Expert Programme tax incentive: '+fmt(b)+'.');}
      log('Moved back to Malaysia.','big');}S.yearsAbroad=0;S.homesick=0;S.residency=S.myCitizen?'citizen':'long-term pass';
    if(S.job&&eligible(S.job.id).length)S.job=null;return;}
  S.yearsAbroad=0;S.homesick=10;S.residency=study?'student':'visa';log(`Moved to ${COUNTRIES[code].city}, ${COUNTRIES[code].name}.`,'big');
  if(S.edu.bond>0&&!study){const p=150000*infl();S.money-=p;S.edu.bond=0;log('Repaid JPA bond penalty: '+fmt(p)+'.');}}
function moveCheck(k){const C=COUNTRIES[k],a=age(),why=[];if(a<21)why.push('Age 21+');if(a>55)why.push('Age 55 or under');if(C.maxAge&&a>C.maxAge)why.push('Under '+C.maxAge+' for skilled visa');
  if((S.langs[C.lang]||0)<C.need)why.push(LANG[C.lang]+' '+C.need+'+');if(!C.anyJob&&EDU_RANK[S.edu.level]<3)why.push('Degree');
  if(S.money<15000*infl())why.push(fmt(15000*infl())+' to relocate');return why;}
function moveModal(k){const C=COUNTRIES[k],I=infl();const keep=S.job&&!JOBS[S.job.id].myOnly&&!JOBS[S.job.id].noEpf;
  return {title:`Move to ${C.flag} ${C.name}?`,icon:'m_abroad',tag:'Travel',text:`Salaries are about ${C.sal}× Malaysia's, and living costs about ${C.col}×. ${C.lottery?'US work visas are a lottery: about '+Math.round(C.lottery*100)+'% chance.':''}${S.edu.bond>0?'\nYou still have a scholarship bond. Leaving costs '+fmt(150000*I)+'.':''}`,
   choices:[[keep?'Move and ask for a transfer in my current job':'Move and job-hunt there',()=>{S.ap=Math.max(0,S.ap-1);if(C.lottery&&!chance(C.lottery))return 'Your visa wasn\'t picked in the lottery this year. Try again next year.';
       if(!chance(.75+(S.stats.cha-50)/200))return 'Your application was rejected this time. You can try again next year.';
       S.money-=15000*I;moveTo(k);if(!keep){S.job=null;qFront(jobModal());}
       return `Visa approved! You land in ${C.city} with big dreams.`+(keep?' Your company keeps you on in its local office.':'');},()=>S.ap>0,'Uses 1 action'],['Not now',null]]};}
function prModal(){const C=ctry();return {title:C.cit?'Apply for permanent residency':'Apply for a Golden Visa',icon:'m_abroad',tag:'Travel',text:'Permanent status means no visa worries if you lose your job.',choices:[['Apply',()=>{if(chance(.65+(S.job?.15:0))){S.residency='PR';log('Granted '+(C.cit?'permanent residency':'a Golden Visa')+' in '+C.name+'.','big');return 'Approved!';}return 'Rejected this time. Try again next year.';}],['Not now',null]]};}
function citModal(){const C=ctry();return {title:'Become a citizen of '+C.name+'?',icon:'m_abroad',tag:'Travel',text:`Malaysia does not allow dual citizenship. Becoming a ${C.name} citizen means renouncing your Malaysian citizenship.\nYou could only return to Malaysia on a long-term visit pass, and Malaysian-only jobs (civil service, police, government schools) would be closed to you.`,
  choices:[['Become a citizen',()=>{S.myCitizen=false;S.residency='citizen';S.homesick=clamp(S.homesick-20);log(`Became a citizen of ${C.name} and renounced Malaysian citizenship.`,'big');return 'You take the citizenship oath. A bittersweet day.';}],['Stay a permanent resident',null]]};}
function famTripMax(){return S.group==='T20'?Infinity:S.group==='M40'?6000:1500;}
function famTripOk(){return age()<18&&S.parents.some(x=>x.alive)&&S.famTripYear!==S.year;}
function famTrip(id){const T=TRIPS.find(t=>t.id===id);if(!T||!famTripOk()||T.cost>famTripMax())return;
  qFront({title:'Family holiday: '+T.name,icon:'d_'+T.id,tag:'Travel',text:'Your parents are paying for this one. Pack your bags!',choices:[['Let\'s go',()=>{
    S.famTripYear=S.year;bump('hap',T.hap);if(!S.visited.includes(T.id))S.visited.push(T.id);
    const ab=!['cameron','langkawi'].includes(T.id),g=ab?RI(2,3):1,st=pick([['int','cha'],['cha','cre'],['int','cre']]),gain=st.map(k=>(bump(k,g),STAT_NAMES[k]));
    S.parents.forEach(x=>{if(x.alive&&x.rel!=null)x.rel=clamp(x.rel+6);});
    let txt='Family trip: '+T.name+'. '+pick(['You ask "are we there yet?" the whole way.','Your dad insists on photos at every single stop.','Your mum packs enough snacks for a month.','You get to stay up late every night.'])+(ab?' Seeing another country opens your mind':' A good break')+' ('+gain.join(', ')+' up).';
    if(chance(.1)){bump('hlt',-2);txt+=' Someone gets food poisoning, but it\'s still a great memory.';}
    log(txt);checkAch();return txt;}],['Maybe another time',null]]});showNext();}
function bookTrip(id){const T=TRIPS.find(t=>t.id===id),cost=T.cost*infl()*(fxNow().travel||1),p=S.partner;
  if(S.travelBan&&!['cameron','langkawi'].includes(T.id))return toast('You are barred from leaving Malaysia until you pay your PTPTN loan again.');
  if(age()<16)return toast('You need to be 16+ to travel on your own.');if((S.trips||0)>=2)return toast('You have already taken 2 trips this year.');if(inHosp())return toast('You are in hospital this year.');
  if(p&&p.alive!==false&&age()>=18){qFront({title:T.name,icon:'d_'+T.id,tag:'Travel',text:'Who is coming along?',choices:[
    [`Go with ${esc(p.name)} (${fmt(cost*2)})`,()=>doTrip(T,cost,true),()=>S.money>=cost*2,'Needs '+fmt(cost*2)],
    [`Go alone (${fmt(cost)})`,()=>doTrip(T,cost,false),()=>S.money>=cost,'Needs '+fmt(cost)],['Cancel',null]]});showNext();return;}
  if(S.money<cost)return toast('Not enough cash for this trip.');
  toast(doTrip(T,cost,false));render();save();showNext();}
function doTrip(T,cost,withP){const p=S.partner;S.trips=(S.trips||0)+1;S.money-=cost*(withP?2:1);bump('hap',T.hap);if(!S.visited.includes(T.id))S.visited.push(T.id);let txt='Trip: '+T.name+(withP?' with '+p.name:'')+'.';
  if(withP){const r=Math.random();
    if(r<.3){p.rel=clamp(p.rel+18);txt+=pick([' A sunset walk turns into a long talk about the future.',' You get lost together and laugh the whole way back.'])+' You feel closer than ever.';if(p.status==='dating'&&p.rel>=60)txt+=' Marriage feels like the next step.';}
    else if(r<.5){p.rel=clamp(p.rel-20);bump('hap',-4);txt+=pick([' A huge fight at the airport about money ruins the mood.',' You discover you travel very differently. Lots of arguments.']);}
    else{p.rel=clamp(p.rel+8);txt+=' A lovely trip together.';}
    if(married()&&!samePartner()&&age()<46&&S.kids.length<8&&!expecting()&&chance(.15))q({title:'A holiday souvenir',icon:'m_preg',tag:'Family',text:'A few weeks after the trip, there is happy news: a baby is on the way!',choices:[['Celebrate',()=>{expectKid(S.partner&&S.partner.stats);return 'The baby is due next year. Time to get the nursery ready!';}]]});}
  else if(age()>=18&&chance(.22))q(flingModal(T));
  else if(chance(.15)&&!S.partner&&age()>=18){qFront(meetModal());txt+=' You meet someone interesting on the trip!';}
  {const ab=!['cameron','langkawi'].includes(T.id),g=ab?RI(2,4):1,gain=[];
   const st=pick([['int','cha'],['cha','cre'],['int','cre'],['cre','look']]);if(ab)st.push('hlt');
   st.forEach(k=>{bump(k,k==='hlt'?2:g);gain.push(STAT_NAMES[k]);});
   txt+=ab?' Seeing another country opens your mind ('+gain.join(', ')+' up).':' A good recharge ('+gain.join(', ')+' up).';}
  if(chance(.1)){bump('hlt',-3);txt+=' Food poisoning on day 3. Still worth it.';}
  log(txt);checkAch();return txt;}

/* ================= assets ================= */
function addPet(P,name){S.assets.pets.push({id:P.id,kind:P.name.replace(/ \(.*\)/,''),name:name||pick(PET_NAMES),age:0,life:RI(P.life[0],P.life[1]),cost:P.cost,hap:P.hap});}
function buyHouse(i){const list=houseList();const H=list[i];if(!H)return;const I=infl(),price=H.price*I*(S.pol&&S.pol.rank>=3&&!S.pol.jail?.9:1)*bumiDisc(H),a=age();
  const yrs=Math.min(35,70-a),r=rate(fxNow()),pay=amort(price*.9,r,Math.max(5,yrs));const annualInc=incomeMonthly()*12;
  const mk=(loan)=>()=>{const h={kind:H.id,name:H.name,where:H.where,price,value:price,loanLeft:loan?price*.9:0,pay:loan?pay:0,country:H.country||'MY',landed:!!H.landed,lux:!!H.lux,rental:!!H.rental};
    S.money-=loan?price*.13:price*1.03;S.assets.houses.push(h);
    if(h.country===S.country&&!homeOk()&&!h.rental){S.home=S.assets.houses.length-1;S.withParents=false;}
    addAch('homeowner');log(`Bought a ${H.name.toLowerCase()} in ${H.where} for ${fmt(price)}.`,'big');bump('hap',5);return 'You collect the keys!'+(h.country===S.country&&S.home===S.assets.houses.length-1?' You move in.':' It\'s rented out for extra income.');};
  qFront({title:`${H.name}, ${H.where}`,icon:houseKey(H),tag:'Property',text:`Price: ${fmt(price)}\nBank loan: 10% down + ~3% legal & stamp duty, ${Math.max(5,yrs)} years at ${(r*100).toFixed(1)}% ≈ ${fmt(pay/12)}/month.`,
    choices:[['Pay in cash',mk(false),()=>S.money>=price*1.03,'Needs '+fmt(price*1.03)],
      ['Take a bank loan',mk(true),()=>S.money>=price*.13&&a>=21&&a<=65&&pay<=annualInc*(S.pol&&S.pol.rank>=4?.6:.45)&&!S.bankruptYears,(S.bankruptYears?'Bankrupt: no loans for '+S.bankruptYears+' more years. ':'')+'Needs '+fmt(price*.13)+' upfront, age 21–65, and instalment ≤ 45% of household income'],['Cancel',null]]});showNext();}
function houseList(){const L=HOUSES.map(h=>({...h}));if(S.country!=='MY'){const C=ctry();L.unshift({id:'abroad',name:'Apartment',where:C.city,price:C.home*.6,country:S.country},{id:'abroad2',name:'House with garden',where:C.city+' suburbs',price:C.home,country:S.country,landed:1});}return L;}
function sellHouse(i){const h=S.assets.houses[i];if(!h)return;const net=h.value*.97-h.loanLeft;S.money+=net;S.assets.houses.splice(i,1);
  if(S.home===i)S.home=null;else if(S.home!=null&&S.home>i)S.home--;log(`Sold ${h.name.toLowerCase()} in ${h.where}. Cash after loan: ${fmt(net)}.`,'big');render();save();}
function buyCar(id){const C=CARS.find(c=>c.id===id),I=infl(),price=C.price*I*(S.country==='MY'?1:ctry().col*.8);const payYr=price*.9*(1+.03*9)/9;
  const mk=loan=>()=>{S.money-=loan?price*.1:price;S.assets.cars.push({id,name:C.name,type:C.type,price,value:price,ev:!!C.ev,lux:!!C.lux,loanLeft:loan?payYr*9:0,pay:payYr});if(C.lux)bump('cha',2);bump('hap',4);log(`Bought a ${C.name} for ${fmt(price)}.`,'big');checkAch();return 'Vroom! Your new '+C.name+' is in the driveway.';};
  qFront({title:C.name,icon:carKey(C.type,C.id),tag:'Vehicle',text:`${C.type}${C.ev?' · electric':''}\nPrice: ${fmt(price)}\nHire purchase: 10% down, 9 years at 3% flat ≈ ${fmt(payYr/12)}/month.`,
    choices:[['Pay in cash',mk(false),()=>S.money>=price,'Needs '+fmt(price)],['Hire purchase',mk(true),()=>S.money>=price*.1&&(S.job||S.retired)&&payYr<=incomeMonthly()*12*.3+1&&!S.bankruptYears,(S.bankruptYears?'Bankrupt: no loans for '+S.bankruptYears+' more years. ':'')+'Needs '+fmt(price*.1)+' down and a steady income'],['Cancel',null]]});showNext();}
function sellCar(i){const c=S.assets.cars[i];const net=c.value-c.loanLeft;S.money+=net;S.assets.cars.splice(i,1);log(`Sold your ${c.name} (${fmt(net)} after loan).`);render();save();}
function buyPet(id){const P=PETS.find(p=>p.id===id),cost=P.price*infl();if(S.money<cost)return toast('Not enough cash.');if(P.landed&&!(ownsLanded()||S.withParents))return toast('Most condos don\'t allow this pet. You need a landed home.');
  S.money-=cost;addPet(P);const p=S.assets.pets[S.assets.pets.length-1];log(`Welcomed ${p.name} the ${p.kind.toLowerCase()} home.`,'big');bump('hap',4);checkAch();toast(`Meet ${p.name}!`);render();save();}

/* ================= dynasty ================= */
function lifeSummary(){const nw=netWorth(),hap=S.hapN?S.hapSum/S.hapN:50;
  const w=clamp(Math.log10(Math.max(nw/infl(),1))/7*25,0,25),h=clamp(hap/4,0,25),r=clamp((married()||S.partner?.status==='married'?8:0)+Math.min(S.kids.length*3,9)+Math.min(S.friends,8),0,25),ac=clamp(S.ach.length*2.5,0,25);
  const real=nw/infl();const score=Math.round(w+h+r+ac);let title='The Everyday Malaysian';const J=S.job||S.lastJob;
  if(S.job){S.lastJobId=S.job.id;S.lastJobName=JOBS[S.job.id].name;}
  if(real>5e6)title='The Tycoon';else if(!S.myCitizen)title='The Malaysian Abroad';else if(S.kids.length>=4)title='The Family Pillar';else if(hap>72)title='The Happy Soul';
  else if(S.lastJobId==='doctor')title='The Healer';else if(S.lastJobId==='teacher')title='The Beloved Cikgu';else if(S.lastJobId==='entrepreneur')title='The Towkay';else if(S.everAbroad>=10)title='The Globetrotter';else if(real>1.5e6)title='The Comfortable Retiree';else if(nw<0)title='The Dreamer in Debt';
  return {name:dispName(),gen:S.dyn.gen,born:S.birthYear,died:S.year,age:age(),nw,score,title,career:S.lastJobName||'—',hap:Math.round(hap),w:Math.round(w),h:Math.round(h),r:Math.round(r),ac:Math.round(ac)};}
function estate(){let cash=S.money+S.stocks+S.epf-S.ptptn;const legal=S.will?0:Math.max(0,cash*.15);return {cash:cash-legal,legal};}
function handoverModal(){const ks=S.kids.filter(k=>k.alive!==false&&S.year-k.born>=18);
  return {title:'Pass on your wealth early',icon:'t_dynasty',tag:'Family',text:'Hand everything to one of your children now: cash, investments, property and cars. You step back and live out your days as a retired parent, and you continue the game as your child.\nThe heir you pick gets half your cash plus a share of the rest, and there are no legal fees.',
    choices:ks.map(k=>[`Hand over to ${k.name} (${S.year-k.born})`,()=>{const me=S,pt=S.partner;S.will=true;const ns=heirFrom(k);
      const pp=ns.parents[0];pp.alive=true;pp.handedOver=1;pp.job='Retired';pp.stats={...me.stats};
      if(ns.parents[1])ns.parents[1].handedOver=1;
      S=ns;MQ=[];cur=null;tab='life';log(`${me.name} handed the family wealth to you early.`,'big');$('#modal').hidden=true;if(netWorth()>=1e6*infl()){q(fortuneModal(S.money));setTimeout(showNext,0);}save();showScreen('s-game');render();return false;}]).concat([['Not yet',null]])};}
function canConceive(o){return o&&o.gender!==S.gender&&age()<46&&(o.age||30)<50&&S.kids.length<8&&!expecting();}
// Pregnancies wait in S.preg and the baby is born the following year (birthsTick in nextYear). Adoption stays instant.
function expecting(){return (S.preg||[]).length>0;}
function expectKid(other,o){(S.preg=S.preg||[]).push({other,o:o||{},due:S.year+1});log('A baby is on the way, due next year.','big');}
function birthsTick(){const L=S.preg||[];if(!L.length)return;S.preg=L.filter(x=>x.due>S.year);
  L.filter(x=>x.due<=S.year).forEach(x=>{if(x.o.note==='born before marriage'&&married())x.o.note='';addKid(x.other,x.o);});}
function nightModal(who){const p=who||S.partner,wed=p!==S.partner||married();
  const go=safe=>()=>{if(p.alive===false||S.partner!==p&&!spouses().includes(p)||S.ap<1)return '';S.ap--;p.rel=clamp(p.rel+(safe?6:8));bump('hap',5);bump('hlt',1);
    let t=pick(['Dinner, a bottle of wine, and the lights go off.','A quiet night in, just the two of you.','You both cancel your plans and stay in.'])+' The rest of the night stays between you.'+spTurn(p,3);
    if(!safe&&canConceive(p)&&chance(wed?.3:.2)){qFront(wed?{title:'Big news',icon:'m_preg',tag:'Family',text:`A few weeks later, ${esc(p.name)} has a positive pregnancy test!`,choices:[['Celebrate',()=>{expectKid(p.stats);return 'The baby is due next year. Time to get the nursery ready!';}]]}:pregModal({stats:p.stats,name:p.name}));}
    log('Spent the night with '+p.name+'.');return t;};
  return {title:'Spend the night',icon:'m_love',tag:'Love',text:`A romantic night with ${esc(p.name)}.`,choices:[['Use protection',go(true)],['No protection',go(false),null,canConceive(p)?'There is a chance of pregnancy':''],['Not tonight',null]]};}
function hookupModal(){const o=npc(18),p=S.partner&&S.partner.alive!==false?S.partner:null;o.age=Math.max(18,o.age);
  const go=safe=>()=>{if(S.ap<1)return '';S.ap--;bump('hap',p?1:4);let t=`You and ${esc(o.name)} leave the party together. What happens next stays between you.`;
    if(!safe&&chance(.08)){bump('hlt',-8);t+=' A week later, a clinic visit and a course of antibiotics. Lesson learned.';}
    if(p){bump('hap',-4);if(chance(.3)){p.rel=clamp(p.rel-35);log(p.name+' found out you cheated with '+o.name+'.','big');t+=` ${esc(p.name)} finds the messages. They are furious.`;}else t+=' You feel guilty the next morning.';}
    if(!safe&&canConceive(o)&&chance(.15))q(pregModal({stats:o.stats,name:o.name,fling:true,how:'party'}));
    log('One-night stand with '+o.name+'.');return t;};
  return {title:'A night out',icon:'m_fling',tag:'Love',text:`At a friend's party you hit it off with ${esc(o.name)}, ${o.age}.`+(p?`\nYou are with ${esc(p.name)}. Cheating has consequences.`:''),choices:[['Go home with them (use protection)',go(true)],['Go home with them (no protection)',go(false),null,'Risk of pregnancy and infection'],['Just exchange numbers',()=>{S.friends++;return 'You stay friends. Probably the wise choice.';}]]};}
