'use strict';
// Businesses, luxury, investments, careers, personal finance and yearly ticks.
/* ================= wealth: businesses, luxury and investments ================= */
// Returns are close to the stock market's on average, but swing more, so a fortune can grow or shrink.
const BIZ=[
  {id:'kopitiam',name:'Kopitiam',where:'Ipoh old town',price:450000,yld:.10,sd:.14,stat:'cha'},
  {id:'workshop',name:'Car workshop',where:'Shah Alam',price:800000,yld:.09,sd:.16,stat:'dis'},
  {id:'minimart',name:'Minimart chain (3 shops)',where:'Klang Valley',price:1200000,yld:.09,sd:.12,stat:'int'},
  {id:'factory',name:'Glove factory',where:'Kulim, Kedah',price:4500000,yld:.085,sd:.2,stat:'int',crisis:.05},
  {id:'resort',name:'Boutique resort',where:'Pantai Cenang, Langkawi',price:6000000,yld:.075,sd:.18,stat:'cha',tour:1}];
const LUX=[
  {id:'rolex',name:'Rolex Submariner',price:70000,up:.01,dep:-.03,boost:{look:3,hap:4},min:21},
  {id:'birkin',name:'Hermès Birkin bag',price:160000,up:.005,dep:-.04,boost:{look:3,hap:4},min:21},
  {id:'ferrari',name:'Ferrari Roma',price:1800000,up:.04,dep:.12,boost:{look:4,cha:2,hap:8},min:21},
  {id:'yacht',name:'Yacht at Telaga Harbour',price:3500000,up:.1,dep:.08,boost:{cha:3,hap:10},min:25},
  {id:'villa',name:'Holiday villa in Langkawi',price:4000000,up:.02,dep:-.03,boost:{hap:7,hlt:2},min:25}];
function wealthInit(){if(!S)return;S.assets.biz=S.assets.biz||[];S.assets.lux=S.assets.lux||[];S.inv=S.inv||{safe:0,risky:0,gold:0,angel:[],banker:0};}
function wealthValue(){const v=S.inv;return S.assets.biz.reduce((t,b)=>t+b.value,0)+S.assets.lux.reduce((t,l)=>t+l.value,0)+v.safe+v.risky+v.gold+v.angel.reduce((t,a)=>t+a.value,0);}
const bankerOk=()=>S.inv.banker||netWorth()>=2e6*infl();
const angelOk=()=>netWorth()>=3e6*infl();
function wealthTick(fx,IN,EX){wealthInit();const I=infl();
  for(const b of S.assets.biz){const B=BIZ.find(x=>x.id===b.id)||{yld:.08,sd:.15,stat:'int'};
    let y=B.yld+R(-B.sd,B.sd)+(S.stats[B.stat]-55)/600+(fx.stock||0)*.3-(S.job?.025:0)-(S.country!=='MY'?.03:0)-(b.weak?.06:0);
    if(B.tour&&fx.travel>1.5)y-=.25;if(B.crisis&&chance(B.crisis)){y-=.3;log(`Hard times: big orders were cancelled at your ${b.name.toLowerCase()}.`,'big');}
    b.weak=0;if(S.ttl&&S.ttl.engYears>0)y+=.02;let p=b.value*y;if(p>0)p*=1+HON_BIZ[honTier()];b.last=p;if(p>=0)IN('Profit from '+b.name,p);else EX('Loss at '+b.name,-p);
    b.value*=clamp(1+(y-B.yld)*.6+.02,.5,1.4);}
  if(S.assets.biz.length&&chance(.12))q(bizEventModal(pick(S.assets.biz)));
  let joy=0;for(const l of S.assets.lux){const L=LUX.find(x=>x.id===l.id);EX('Upkeep: '+l.name,l.price*L.up);l.value*=1-L.dep;joy++;}
  if(joy)bump('hap',Math.min(3,joy));
  const v=S.inv,st=fx.stock||0;
  if(v.safe>0){v.safe*=1+.045+R(-.025,.025)-.005;}
  if(v.risky>0){v.risky*=Math.max(.35,1+.08+st*1.3+R(-.2,.2)-.015);}
  if(v.gold>0){v.gold*=Math.max(.6,1+.05-st*.5+R(-.14,.14));}
  v.angel=v.angel.filter(a=>{a.age++;if(chance(.18)){log(`${a.name}, a startup you backed, shut down. Your ${fmt(a.cost)} is gone.`,'big');return false;}
    if(a.age>=2&&chance(.025)){const m=R(3,12);const pay=a.cost*m;S.money+=pay;log(`${a.name} was bought out! Your stake pays ${fmt(pay)} (${m.toFixed(1)}×).`,'big');return false;}
    a.value=a.cost*(a.age<2?1:R(.6,1.8));return true;});}
function wealthOwned(){wealthInit();
  const b=S.assets.biz.map((x,i)=>`<div class="item">${ico('b_'+x.id)}<div class="t"><b>${esc(x.name)} <span class="chip gold">Business</span></b><small>${esc(x.where)} · value <span class="mono">${fmt(x.value)}</span>${x.last!=null?` · last year <span class="mono ${x.last<0?'neg':'pos'}">${x.last<0?'−':'+'}${fmt(Math.abs(x.last))}</span>`:''}</small></div><button class="btn small danger" data-act="sellbiz" data-arg="${i}">Sell</button></div>`).join('');
  const l=S.assets.lux.map((x,i)=>`<div class="item">${ico('l_'+x.id)}<div class="t"><b>${esc(x.name)} <span class="chip gold">Luxury</span></b><small>value <span class="mono">${fmt(x.value)}</span> · upkeep <span class="mono">${fmt(x.price*LUX.find(y=>y.id===x.id).up)}</span>/yr</small></div><button class="btn small danger" data-act="selllux" data-arg="${i}">Sell</button></div>`).join('');
  return b+l;}
function buyBiz(id){const B=BIZ.find(x=>x.id===id),p=B&&B.price*infl();if(!B||S.money<p||age()<21)return;
  qFront({title:`${B.name}, ${B.where}`,icon:'b_'+B.id,tag:'Money',text:`Asking price: ${fmt(p)}.\nIn a normal year it makes about ${Math.round(B.yld*100)}% of its value, but a bad year can mean a loss.${S.job?' You have a day job, so you will pay a manager to run it.':''}`,choices:[
    ['Buy it',()=>{S.money-=p;S.assets.biz.push({id:B.id,name:B.name,where:B.where,price:p,value:p*.9});log(`Bought a ${B.name.toLowerCase()} in ${B.where} for ${fmt(p)}.`,'big');bump('hap',4);return 'The keys and the books are yours. Time to be the boss.';}],['Not now',null]]});showNext();}
function sellBiz(i){const b=S.assets.biz[i];if(!b)return;const net=b.value*.95;S.money+=net;S.assets.biz.splice(i,1);log(`Sold your ${b.name.toLowerCase()} for ${fmt(net)}.`,'big');render();save();}
function buyLux(id){const L=LUX.find(x=>x.id===id),p=L&&L.price*infl();if(!L||S.money<p||age()<L.min)return;S.money-=p;S.assets.lux.push({id:L.id,name:L.name,price:p,value:p*(L.dep>0?.85:1)});
  for(const k in L.boost)bump(k,L.boost[k]);if(L.boost.look)S.stats.look=clamp(S.stats.look);log(`Bought a ${L.name} for ${fmt(p)}.`,'big');render();save();}
function sellLux(i){const l=S.assets.lux[i];if(!l)return;const net=l.value*.9;S.money+=net;S.assets.lux.splice(i,1);log(`Sold your ${l.name} for ${fmt(net)}.`);render();save();}
function invest(k){if(!['safe','risky','gold'].includes(k))return;if(k!=='gold'&&!bankerOk())return;const amt=S.money*.25;if(amt<1000)return;S.money-=amt;S.inv[k]+=amt;if(k!=='gold')S.inv.banker=1;
  log(`Put ${fmt(amt)} into ${k==='gold'?'gold':k==='safe'?'a bond fund':'a growth fund'}.`);render();save();}
function cashOut(k){const v=S.inv[k];if(!(v>0))return;const net=k==='gold'?v*.97:v;S.money+=net;S.inv[k]=0;log(`Cashed out ${fmt(net)} from ${k==='gold'?'gold':k==='safe'?'the bond fund':'the growth fund'}.`);render();save();}
const STARTUP_A=['Kopi','Pasar','Teh','Durian','Jom','Lepak','Mamak','Sambal','Batik','Grab'],STARTUP_B=['Pay','Go','Hub','AI','Box','Ride','Mart','Labs','Cloud','Eats'];
function backStartup(){const c=250000*infl();if(!angelOk()||S.money<c)return;let n;do n=pick(STARTUP_A)+pick(STARTUP_B);while(S.inv.angel.some(a=>a.name===n));
  S.money-=c;S.inv.angel.push({name:n,cost:c,value:c,age:0});log(`Backed ${n}, a Malaysian startup, with ${fmt(c)}.`,'big');render();save();}
function bizEventModal(b){const v=b.value;
  const ev=pick([
    {t:'Expansion offer',x:`A good second location opens up for your ${b.name.toLowerCase()}. Expanding costs ${fmt(v*.3)}.`,c:[['Expand',()=>{S.money-=v*.3;if(chance(.72)){b.value*=1.38;return 'The new branch takes off. Your business is worth a lot more now.';}b.value*=1.1;return 'The new branch struggles. You keep it open, but it barely pays for itself.';},()=>S.money>=v*.3,'Needs '+fmt(v*.3)],['Stay the size you are',()=>'You keep things simple.']]},
    {t:'Your best manager wants to leave',x:`The manager who keeps your ${b.name.toLowerCase()} running has an offer from a rival.`,c:[['Give a big raise and bonus',()=>{S.money-=Math.max(30000*infl(),v*.02);return 'They stay, and the staff are relieved.';}],['Let them go',()=>{b.weak=1;return 'Next year will be rough while you find someone new.';}]]},
    {t:'A buyer comes knocking',x:`A larger company offers to buy your ${b.name.toLowerCase()} for ${fmt(v*1.3)}.`,c:[['Sell it',()=>{const i=S.assets.biz.indexOf(b);if(i<0)return 'It no longer matters.';S.money+=v*1.3;S.assets.biz.splice(i,1);log(`Sold your ${b.name.toLowerCase()} to a bigger company for ${fmt(v*1.3)}.`,'big');return 'You shake hands on a great price.';}],['Keep it',()=>'It is not for sale. Not yet, anyway.']]}]);
  return {title:ev.t,icon:'b_'+b.id,tag:'Money',text:ev.x,choices:ev.c};}
function fortuneModal(amt){return {title:'A fortune to manage',icon:'m_money',tag:'Money',text:`You now have ${fmt(amt)} to look after. What will you do with it?`,choices:[
  ['Meet a private banker',()=>{wealthInit();S.inv.banker=1;tab='assets';shopTab='inv';return 'The banker offers you a bond fund and a growth fund. They are in Assets → Shop → Investments.';}],
  ['Look at businesses for sale',()=>{tab='assets';shopTab='biz';return 'A broker sends you a list. You can find it in Assets → Shop → Business.';}],
  ['Treat yourself',()=>{tab='assets';shopTab='lux';return 'Watches, cars, a yacht. They are in Assets → Shop → Luxury.';}],
  ['Leave it in the bank for now',()=>'Slow and safe.']]};}
function familyCoModal(){const v=RI(1500000,4000000)*infl();const n=(S.dyn.famName||S.famName)+' Holdings';
  return {title:'The family company',icon:'b_family',tag:'Money',text:`Your late parents' company, ${esc(n)}, is worth about ${fmt(v)}. Your relatives ask whether you will take it over or sell your share to them.`,choices:[
    ['Take over the company',()=>{wealthInit();S.assets.biz.push({id:'family',name:n,where:town().name,price:v,value:v});log(`Took over ${n}, the family company.`,'big');return 'You sit in your father\'s old chair for the first time. Everyone is watching.';}],
    ['Sell your share to your relatives',()=>{const c=v*.45;S.money+=c;log(`Sold your share of ${n} for ${fmt(c)}.`,'big');return `Your relatives pay you ${fmt(c)}. Less than it is worth, but no headaches.`;}]]};}

/* ================= careers ================= */
function meets(o){for(const k in o)if(S.stats[k]<o[k])return false;return true;}
function eligible(id){const J=JOBS[id],r=J.req||{},a=age(),E=S.edu,why=[];
  if(r.edu){if(EDU_RANK[E.level]<EDU_RANK[r.edu]){if(!(r.orStat&&meets(r.orStat)))why.push(EDU_LABEL[r.edu]);}
    else if(r.major&&E.level==='degree'&&!r.major.includes(E.major)&&['doctor','lawyer','engineer','accountant'].includes(id))why.push('Degree in '+r.major.map(m=>MAJORS[m].name).join(' / ')+' (licensed profession)');}
  if(id==='nurse'&&E.level==='degree'&&!['med','sport'].includes(E.major))why.push('A nursing or health qualification (licensed profession)');
  if(r.stat)for(const k in r.stat)if(S.stats[k]<r.stat[k])why.push(STAT_NAMES[k]+' '+r.stat[k]+'+');
  if(r.car&&!S.assets.cars.length)why.push('A vehicle');
  if(J.startCost&&S.money<J.startCost*infl())why.push(fmt(J.startCost*infl())+' capital');
  if(J.maxAge&&a>J.maxAge)why.push('Age under '+J.maxAge);
  if(J.from&&S.year<J.from)why.push('Doesn\'t exist yet');
  if(a<17)why.push('Age 17+');
  if(S.country!=='MY')why.push('Work is in Malaysia only (part-time jobs are fine while studying)');
  else if(J.myOnly&&!S.myCitizen)why.push('Malaysian citizens only');
  if(['civil','police'].includes(id)&&E.exam!=='SPM'&&EDU_RANK[E.level]<3)why.push('SPM certificate');
  return why;}
const OFF_FIELD_P=.03;
function offField(id){const r=JOBS[id].req||{},E=S.edu;return !!r.major&&!(E.level==='degree'&&r.major.includes(E.major));}
function jobModal(){const I=infl();const ids=Object.keys(JOBS).filter(id=>!S.job||S.job.id!==id);
  const rows=ids.map(id=>({id,why:eligible(id),J:JOBS[id]})).sort((a,b)=>(a.why.length?1:0)-(b.why.length?1:0)||b.J.base-a.J.base);
  const ch=rows.map(r=>{const pr=abroadPrem(r.id),m=r.J.base*I*(S.country==='MY'?1:ctry().sal)*(1+pr);
    return [`${r.J.name} <span class="mono muted">~${fmt(m)}/mo${pr>.005?' (+'+Math.round(pr*100)+'% overseas degree)':''}</span>`,()=>applyJob(r.id),()=>!r.why.length&&S.applied<4,r.why.length?'Needs '+r.why.join(', '):S.applied>=4?'No more applications this year':offField(r.id)?'Not your field of study: about '+Math.round(OFF_FIELD_P*100)+'% chance. Study a related degree to improve your odds':r.J.levels[0]];});
  ch.push(['Not now',null]);
  return {icon:'m_job',title:'Job hunting'+(S.country!=='MY'?' in '+ctry().city:''),tag:'Career',text:`You can apply up to 4 times a year (${Math.max(0,4-S.applied)} left). Better stats, uni and reputation raise your odds. Jobs outside your field of study rarely hire you.`,choices:ch};}
function applyJob(id){const J=JOBS[id],E=S.edu;S.applied++;
  let p=J.easy?.9:.45+(S.stats[J.stat]-50)/100+(E.uniTier||0)*.07+(S.intern?.1:0)+S.dyn.rep/300+(E.gpa?(E.gpa-3)*.15:0);if(S.pol&&!S.pol.jail)p+=.05;p=clamp(p,.1,.95);if(offField(id))p=OFF_FIELD_P;
  if(chance(p)){const prevLvl=S.job?S.job.level:0;S.job={id,level:0,years:0,lvl:0,bonus:1};if(S.retired){S.retired=false;log('Came out of retirement.','big');}
    if(J.startCost){S.money-=J.startCost*infl();}
    if(!S.ach.includes('firstJob'))addAch('firstJob');log(`Started work as ${J.levels[0]} (${J.name}).`,'big');bump('hap',4);
    return `You got the job! You start as ${J.levels[0]}.`+(J.startCost?` You invest ${fmt(J.startCost*infl())} to get the business running.`:'');}
  if(S.applied<4)qFront(jobModal());return `${pick(['After three interviews','After a long wait','Following a tough panel interview'])}, they chose someone else.`;}
// Reaching the top rank of a career is a big moment, so it gets its own pop-up (and the celebration).
function topModal(J){return {title:'Top of your field',icon:'ev_topjob',tag:'Career',_party:1,text:`You are promoted to ${esc(J.levels[J.levels.length-1])}, the highest rank there is as a ${esc(J.name)}.`,choices:[['Treat the team to dinner',()=>{bump('cha',2);return 'The whole team toasts you with teh tarik.';}]]};}
function careerTick(fx){if(!S.job)return;const J=JOBS[S.job.id],a=age();S.lastJobId=S.job.id;S.lastJobName=J.name;
  let lp=(fx.layoff.all||0)+(fx.layoff[J.sector]||0);if(J.stable)lp*=.2;
  if(lp>0&&chance(lp)){layoff();return;}
  if(J.maxAge&&a>J.maxAge){S.job=null;log('Retired from professional sport.','big');q({title:'Hanging up your boots',icon:'m_job',tag:'Career',text:'At '+a+' your body can\'t keep up with professional sport.',choices:[['Become a coach',()=>{S.job={id:'coach',level:0,years:0,lvl:0,bonus:1};return 'You start coaching the next generation.';}],['Look for other work',()=>{qFront(jobModal());return '';}]]});return;}
  if(S.job.id==='entrepreneur'&&chance(Math.max(.02,.1-S.stats.cre/1500))){S.job=null;const l=RI(10000,60000)*infl();S.money-=l;log('Your business failed. Lost '+fmt(l)+'.','big');bump('hap',-10);return;}
  S.job.years++;S.job.lvl++;const sc=perfScore(),need=(sc>=78?2:sc>=55?3:4)+S.job.level;
  if(S.job.level<J.levels.length-1&&S.job.lvl>=need){if(chance((clamp((sc-25)/70+(S.ot>=2?.1:0)+S.dyn.rep/400+(S.stats.luck-50)/400,0,1)*.9+.05)*(1-.12*S.job.level))){S.job.level++;S.job.lvl=0;log('Promoted to '+J.levels[S.job.level]+'!','big');bump('hap',5);if(S.job.level===J.levels.length-1){addAch('boss');S.dyn.rep+=3;q(topModal(J));}}}
  if(sc>=70&&chance(.5)&&(S.job.bonus||1)<1.5)S.job.bonus=Math.min(1.5,(S.job.bonus||1)*(1+Math.min(.03,(sc-65)/500)));
  if(S.country==='MY'&&S.edu.bond>0)S.edu.bond--;}
function canHop(){const J=S.job&&JOBS[S.job.id];return !!J&&S.country==='MY'&&!J.stable&&!J.noEpf&&S.job.years>=1;}
function hopModal(){const J=JOBS[S.job.id],sc=perfScore(),recent=S.lastHop!=null&&S.year-S.lastHop<2;
  const odds=clamp(.25+(sc-40)/80+Math.min(S.job.lvl,4)*.05-(recent?.25:0)+(S.edu.abroadDeg?.05:0),.05,.9);
  const raise=Math.round((10+Math.max(0,sc-45)/2.5)*(recent?.6:1));
  const go=senior=>()=>{if(!S.job)return 'That no longer matters now.';S.ap--;S.hopYear=S.year;const ok=chance(senior?odds*.55:odds);
    if(!ok){if(chance(.15)){S.job.lvl=0;return 'Your boss finds your CV on JobStreet. Things are frosty at work now, and your promotion clock resets.';}return 'You interview at three companies, but no offer comes through this time.';}
    S.lastHop=S.year;const r=(senior?raise+10:raise)/100;S.job.bonus=(S.job.bonus||1)*(1+r);S.job.lvl=0;S.job.years=0;
    if(senior&&S.job.level<J.levels.length-1){S.job.level++;}
    log(`Job hopped to ${pick(['a rival firm in KL','a bigger company in Petaling Jaya','an MNC in Bangsar South','a fast-growing firm in Penang','a GLC in Putrajaya'])} for a raise of ${Math.round(r*100)}%.`,'big');bump('hap',3);
    return `You resign, serve your notice period and start somewhere new with a raise of ${Math.round(r*100)}%`+(senior&&S.job.level>0?' and the title '+J.levels[S.job.level]:'')+'.';};
  const ch=[[`Same role, higher pay (about +${raise}%)`,go(false),null,`Chance of an offer: ${Math.round(odds*100)}%`]];
  if(S.job.level<J.levels.length-1)ch.push([`Jump a rank to ${J.levels[S.job.level+1]} (about +${raise+10}%)`,go(true),null,`Chance of an offer: ${Math.round(odds*55)}%`]);
  ch.push(['Stay where you are',null]);
  return {title:'Job hopping',icon:'m_job',tag:'Career',text:`Look for the same kind of job at another company. Your performance (${perfLabel(sc)}) decides how much they will pay.`+(recent?'\nYou hopped recently, so employers see you as a "job hopper". Odds and pay offers are lower.':''),choices:ch};}
function layoff(){const sev=S.job?salaryBase()*3:0;S.money+=sev;log('Retrenched from your job as '+JOBS[S.job.id].name+'. Severance: '+fmt(sev)+'.','big');S.job=null;bump('hap',-8);
  q({title:'Retrenched',icon:'m_layoff',tag:'Career',text:'The company is cutting costs and your position is gone. You receive '+fmt(sev)+' in severance.',choices:[['Look for a new job now',()=>{qFront(jobModal());return '';}],['Take a short break',()=>{bump('hap',4);bump('hlt',2);return 'You rest, travel a little and recharge.';}]]});}

/* ================= finance ================= */
function finances(fx){const a=age(),I=infl(),E=S.edu,col=colNow(fx);let inc=0,exp=0;const BR={};const IN=(l,v)=>{if(v>.5){inc+=v;BR[l]=(BR[l]||0)+v;}},EX=(l,v)=>{if(v>.5){exp+=v;BR[l]=(BR[l]||0)-v;}};
  S.lastMonthly=0;
  if(S.job){const m=salary(fx);S.job.lastMonthly=m;let g=m*12*(1+.08*Math.min(S.ot,3));let tax;
    if(S.country==='MY'){const ch=Math.max(0,g-9000*I);tax=ch<50000*I?ch*.03:ch<100000*I?ch*.09:ch<250000*I?ch*.17:ch*.25;if(!JOBS[S.job.id].noEpf){S.epf+=g*.23;g*=.89;}}
    else tax=S.country==='AE'?0:g*.18;if(S.taxCut===S.year)tax*=.8;IN('Salary after tax and EPF',g-tax);S.takeHome=g-tax;}else S.takeHome=0;
  IN('Spouse\'s contribution',partnerMonthly()*12*.6);
  if(S.retired&&S.epf>0){const d=S.epf/Math.max(5,85-a);S.epf-=d;IN('EPF withdrawals',d);}
  if(S.pension)IN('Pension',S.pension*I*12);
  if(S.pol&&!S.pol.jail&&S.pol.rank>=3){IN(polTitle()+' pay',POL_PAY[S.pol.rank]*I*12*.8);if(S.pol.rank===4&&inGov())IN('GLC board fees',60000*I);}
  if(S.glcChair&&a<75)IN('GLC chairman fees',300000*I);
  else if(honTier()>=2&&a<75&&!S.jail&&!(S.pol&&S.pol.jail))IN(honTier()>=3?'Board chairman fees':'Company director fees',(honTier()>=3?450000:180000)*I);
  S.assets.houses.forEach((h,i)=>{h.value*=1+.03+(fx.prop||0)+R(-.02,.02);const home=i===S.home&&h.country===S.country;
    if(!home){const v=chance(h.rental?.12:.08),bad=!v&&chance(.06);
      if(v)log(`Your ${h.name.toLowerCase().replace(/ \(to rent out\)/,'')} in ${h.where} sat empty this year. No rent.`);
      else if(bad){EX('Repairs after a bad tenant',h.value*.03);log(`A bad tenant skipped rent and trashed your ${h.name.toLowerCase().replace(/ \(to rent out\)/,'')} in ${h.where}.`);}
      else IN('Rental income',h.value*(h.rental?.052:.035));}
    EX('Property upkeep and tax',(h.price||h.value)*(h.rental?.006:.004)); // based on the price paid, so it stays the same each year (like cukai taksiran)
    if(h.loanLeft>0){const r=rate(fx),it=h.loanLeft*r,pay=Math.min(h.pay,h.loanLeft+it);h.loanLeft=Math.max(0,h.loanLeft+it-pay);EX('Home loan',pay);}});
  const student=!!E.track,mar=married();
  const kidsN=S.kids.filter(k=>k.alive!==false&&S.year-k.born<22).length;
  if(!(student&&a<26)&&!(S.withParents&&!S.job&&a<26&&!mar)){
    let living=2200*I*col*(mar?1.7:1)*(1+HON_COL[honTier()]);if(S.withParents&&!mar)living*=.5;living+=kidsN*900*I*col;if(a>=65)living+=600*I*col;const style=(S.takeHome||0)*.35;EX(style>living*12?'Living costs and lifestyle':'Living costs'+(kidsN?' (incl. children)':''),Math.max(living*12,style));
    if(!homeOk()&&!(S.withParents&&!mar)&&!(S.pol&&S.pol.rank>=6))EX('Rent',(S.country==='MY'?1100:1400)*I*col*(mar||kidsN?1.4:1)*12);}
  S.assets.cars.forEach(c=>{EX('Car running costs',((c.ev?2400:4200*(fx.fuel||1))*I+c.price*.02)*(S.pol&&S.pol.rank>=5&&!S.pol.jail?0:1));c.value*=.88+(!c.ev&&fx.petrolCar?fx.petrolCar:0);if(c.loanLeft>0){const p=Math.min(c.pay,c.loanLeft);c.loanLeft-=p;EX('Car loan',p);}});
  S.assets.pets.forEach(p=>EX('Pets',p.cost*I));
  wealthTick(fx,IN,EX);
  if(S.ptptn>0&&!E.track){S.ptptn*=1.01;
    if(S.job&&!S.ptptnSkip&&S.money>0){const p=Math.min(S.ptptn,3600*I);S.ptptn-=p;EX('PTPTN repayment',p);S.ptptnMiss=0;if(S.travelBan){S.travelBan=false;log('Travel ban lifted after resuming PTPTN payments.','big');}}
    else if(S.job||S.ptptnSkip){S.ptptnMiss=(S.ptptnMiss||0)+1;if(S.ptptnMiss>=3&&!S.travelBan){S.travelBan=true;log('Barred from leaving Malaysia over unpaid PTPTN.','big');q({title:'Barred from travel',icon:'ev_u_ptptn',tag:'Money',text:'You have not paid your PTPTN loan for 3 years in a row. The Immigration Department now bars you from leaving Malaysia until you pay again.',choices:[['Oh no',()=>'Local holidays only for now.']]});}}}
  if(S.money<0)EX('Interest on debt',-S.money*.12);
  if(fx.aid&&(S.group==='B40'||incomeMonthly()<5000*I)){IN('Government cash aid',1200*I);log('Received '+fmt(1200*I)+' in government cash aid.');}
  S.epf*=1.055;S.stocks*=Math.max(.3,1+.06+(fx.stock||0)+R(-.12,.12));
  S.money+=inc-exp;S.lastInc=inc;S.lastExp=exp;S.lastBreak=Object.entries(BR).filter(e=>Math.abs(e[1])>.5).sort((x,y)=>y[1]-x[1]);
  if(S.money<0&&S.inv){let need=-S.money,got=0;for(const k of ['safe','gold','risky']){const t=Math.min(need,S.inv[k]);if(t>0){S.inv[k]-=t;need-=t;got+=t;}}if(got>0){S.money+=got;log('Sold '+fmt(got)+' of investments to cover your debts.');}}
  if(S.bankruptYears)S.bankruptYears--;
  if(S.money<-250000*I){q(declareBankrupt(true));}
  else if(S.money<-120000*I&&!S.bankruptAsked){S.bankruptAsked=true;q(bankruptModal());}}
function kidMoney(){const a=age(),I=infl(),BR=[],par=S.parents.some(p=>p.alive);
  S.famSpend=({T20:40000,M40:15000,B40:6000}[S.group]||10000)*I*(a<7?.7:1);
  if(a>=7&&par){const pm=({T20:4000,M40:1500,B40:600}[S.group]||1000)*I*(a>=13?1.6:1),sp=pm*R(.5,.9);S.money+=pm-sp;
    BR.push(['Pocket money from your parents',pm],[a>=13?'Food with friends, phone top-ups and outings':'Snacks, stationery and toys',-sp]);}
  S.lastInc=BR.filter(x=>x[1]>0).reduce((t,x)=>t+x[1],0);S.lastExp=-BR.filter(x=>x[1]<0).reduce((t,x)=>t+x[1],0);S.lastBreak=BR;}
function stmtLines(){return (S.lastBreak||[]).map(([l,v])=>`${v>=0?'+':'−'} ${fmt(Math.abs(v))}  ${l}`).join('\n');}
// What this year's world events mean for this player, shown in the yearly money summary.
function worldLines(){const A=S.world.active;if(!A.length)return '';const pct=x=>Math.round(Math.abs(x)*100)+'%',out=[];
  for(const e of A){const f=e.fx||{},L=[];
    if(S.job&&age()>=18){const J=JOBS[S.job.id];let lp=(f.layoff&&((f.layoff.all||0)+(f.layoff[J.sector]||0)))||0;if(J.stable)lp*=.2;
      if(lp>0)L.push(`${pct(lp)} chance you are retrenched${J.stable?' (your job is safer than most)':''}`);
      const sm=f.sal&&f.sal[J.sector];if(sm&&sm!==1)L.push(`your pay ${sm>1?'up':'down'} ${pct(sm-1)}`);}
    if(f.stock&&S.stocks>0)L.push(`your shares ${f.stock>0?'up':'down'} about ${pct(f.stock)}`);
    if(f.prop&&S.assets.houses.length)L.push(`house values ${f.prop>0?'up':'down'} about ${pct(f.prop)}`);
    if(f.col&&age()>=18)L.push(`living costs up ${pct(f.col-1)}`);
    if(f.rate&&S.assets.houses.some(h=>h.loanLeft>0))L.push(`loan interest up ${Math.round(f.rate*100)} point${f.rate*100>1?'s':''}`);
    if(f.fuel&&S.assets.cars.length)L.push(`petrol ${f.fuel>1?'up':'down'} ${pct(f.fuel-1)}`);
    if(f.petrolCar&&S.assets.cars.some(c=>!c.ev))L.push('petrol cars lose value faster');
    if(f.travel&&f.travel!==1)L.push(`trips ${f.travel>1?(f.travel>=2?f.travel+'× the price':'up '+pct(f.travel-1)):'down '+pct(f.travel-1)}`);
    if(f.abroadSal&&S.country!=='MY')L.push(`overseas pay worth ${f.abroadSal>1?'more':'less'} in ringgit`);
    if(f.hlt)L.push(`Health ${f.hlt} a year`);if(f.hap)L.push(`Happiness ${f.hap} a year`);
    if(f.aid&&(S.group==='B40'||incomeMonthly()<5000*infl()))L.push(`${fmt(1200*infl())} cash aid for your household`);
    if(e.onset==='flood'||/flood/i.test(e.title))L.push(`flood risk where you live: ${S.country==='MY'?(town().flood>=.2?'high':town().flood>=.08?'medium':'low'):'none (you are abroad)'}`);
    out.push(`${e.good?'▲':'▼'} ${e.title}${e.end>S.year?' (until '+e.end+')':''}: ${L.length?L.join(', '):'little direct effect on you'}.`);}
  return '<b>World events this year</b>\n'+out.join('\n');}
const sgn=v=>(v>=0?'+':'−')+Math.abs(v).toFixed(1);
function statLines(){const d=S.yDelta||[],w=S.statWhy||{};if(!d.length&&!Object.keys(w).length)return '';
  let t='<b>Your stats this year</b>\n'+(d.length?d.map(([k,v])=>`<span class="sl ${v>0?'up':'dn'}">${STAT_NAMES[k]} ${sgn(v)}</span>`).join(' '):'No change.');
  const own=Object.entries(w).flatMap(([k,L])=>L.map(([r,v])=>`<span class="sl rs">${STAT_NAMES[k]} ${sgn(-v)}</span> (${r})`));
  if(own.length){const m=S.statDm||1,pct=Math.round(Math.abs(1-m)*100);
    t+='\nOn their own: '+own.join(' · ')+'.';
    if(pct)t+=m<1?` Your Discipline (${Math.round(S.stats.dis)}) made these drops ${pct}% smaller.`:` Your low Discipline (${Math.round(S.stats.dis)}) made these drops ${pct}% bigger.`;}
  return t;}
function stmtModal(){const net=(S.lastInc||0)-(S.lastExp||0),kid=age()<18;return {title:'Your year: '+S.year,icon:'ev_year',tag:'Money',text:`${!kid&&!S.lastBreak.length?'No money came in or went out this year. Your family is still covering your living costs.\n\n':''}${kid?`Your ${S.parents.some(p=>p.alive)?'family spends':'relatives spend'} about ${fmt(S.famSpend||0)} on your food, ${age()<7?'nappies and check-ups':'school and clothes'} this year.${age()<7?' You are too young for pocket money.':''}\n\n`:''}Income ${fmt(S.lastInc||0)} · Spending ${fmt(S.lastExp||0)}${stmtLines()?'\n\n'+stmtLines():''}\n\nNet: ${net>=0?'+':'−'} ${fmt(Math.abs(net))}. Cash now: ${fmt(S.money)}.${statLines()?'\n\n'+statLines():''}${worldLines()?'\n\n'+worldLines():''}`,choices:[['Got it',null],['Stop showing this every year',()=>{S.showStmt=false;return 'You can still see it in the Assets tab.';}]]};}
function declareBankrupt(forced){let got=0;S.assets.houses.forEach(h=>got+=h.value*.7-h.loanLeft);S.assets.cars.forEach(c=>got+=c.value*.6-c.loanLeft);
  S.assets.houses=[];S.assets.cars=[];S.assets.biz=[];S.assets.lux=[];S.inv={safe:0,risky:0,gold:0,angel:[],banker:0};S.home=null;S.money=0;S.stocks=0;S.bankruptAsked=false;S.bankruptYears=5;bump('hap',-20);S.dyn.rep-=5;
  if(S.partner&&S.partner.gold){log(S.partner.name+' left when you went bankrupt.','big');S.partner=null;}
  log('Declared bankrupt.','big');
  return {title:'Declared bankrupt',icon:'m_money',tag:'Money',text:(forced?'Your debts passed the point of no return. The court declares you bankrupt.':'You file for bankruptcy.')+' The Insolvency Department takes your house, car and investments, and your debts are wiped. Banks will not lend to you for 5 years.',choices:[['Start over',()=>'You start again from zero. At least the phone has stopped ringing.']]};}
function bankruptModal(){return {title:'Drowning in debt',icon:'m_money',tag:'Money',text:'Your debts have spiralled. The bank is calling every day.',choices:[['Sell assets to pay off debt',()=>{let got=0;S.assets.houses.forEach(h=>got+=h.value*.85-h.loanLeft);S.assets.cars.forEach(c=>got+=c.value*.8-c.loanLeft);
    S.assets.houses=[];S.assets.cars=[];S.home=null;S.money+=got+S.stocks;S.stocks=0;S.bankruptAsked=false;
    if(S.money<-100000*infl()){S.money=0;bump('hap',-20);S.dyn.rep-=5;log('Declared bankrupt.','big');return 'Even after selling everything, it\'s not enough. You are declared bankrupt and start over from zero.';}
    bump('hap',-8);log('Sold assets to clear debts.','big');return 'You sell everything you own. It hurts, but you\'re breathing again.';}],['Declare bankruptcy',()=>{qFront(declareBankrupt(false));return '';}],['Hang on and hope for the best',()=>'You keep juggling the debts. If they keep growing, the court will make the decision for you.']]};}

/* ================= yearly ticks ================= */
function passive(fx){const a=age(),st=S.stats,dm=S.statDm=decayMult(),why=S.statWhy={};
  const fall=(k,n,r)=>{const v=Math.min(n*dm,Math.max(0,st[k]));if(v<=0)return;st[k]-=v;(why[k]=why[k]||[]).push([r,v]);};
  if(a<18){st.int+=a>=4?.5:.3;st.ath+=.4;st.cha+=.3;st.cre+=.3;}
  if(a<18){if(S.parenting==='Strict')st.dis+=1;if(S.parenting==='Loving')st.hap+=.6;if(S.parenting==='Distant'||S.parenting==='Divorced')st.hap-=.6;}
  st.hap+=(55-st.hap)*.12;
  if(a>45)fall('hlt',a>65?2:.8,'ageing');if(a>40)fall('look',.4,'ageing');if(a>60)fall('ath',1,'ageing');
  if(a>=18){const u=S.used||(S.used={}),J=S.job&&JOBS[S.job.id],jailed=S.jail||(S.pol&&S.pol.jail)||S.hosp===S.year-1;
    // A job keeps its main stat and Discipline in practice, studying keeps Smarts. Nothing fades in prison, where there are no actions.
    if(J){u[J.stat]=S.year;u.dis=S.year;}if(S.edu.track){u.int=S.year;u.dis=S.year;}
    for(const k of FADE_STATS){if(jailed){u[k]=S.year;continue;}const n=idleYrs(k);if(n<=3||st[k]<=20)continue;
      if(n===4)log(`Your ${STAT_NAMES[k]} is getting rusty. Try ${FADE_HOW[k]} to keep it up.`);
      const v=Math.min((n>8?1:.5)*dm,st[k]-20);if(v>0){st[k]-=v;(why[k]=why[k]||[]).push([`out of practice, ${n} years without ${FADE_HOW[k]}`,v]);}}}
  else{const u=S.used||(S.used={});for(const k of FADE_STATS)u[k]=S.year;}
  st.hlt+=fx.hlt||0;st.hap+=fx.hap||0;
  if(S.job)st.hap+=(JOBS[S.job.id].hap||0)*.5;
  if(S.ot>=2){S.otYrs++;}else S.otYrs=0;
  if(married())st.hap+=1;
  S.assets.pets.forEach(p=>{st.hap+=Math.min(1.5,p.hap*.3);});
  st.luck=clamp(st.luck+(S.assets.pets.some(p=>p.id==='arowana')?.5:0));
  if(S.country!=='MY'){S.yearsAbroad++;S.everAbroad++;S.homesick=clamp(S.homesick+Math.max(1,8-S.yearsAbroad)-(married()?3:0));st.hap-=S.homesick/25;}
  if(S.money<0)st.hap-=3;
  if(a>=7&&a<=17){const p=S.edu.primary,sec=S.edu.secondary,L=S.langs;
    if(a<=12){if(p==='sk'){L.ms+=4;L.en+=2;}else if(p==='sjkc'){L.zh+=4;L.ms+=2;L.en+=1.5;}else if(p==='sjkt'){L.ta+=4;L.ms+=2;L.en+=1.5;}else{L.en+=5;L.ms+=1;}}
    else{if(sec==='intl'){L.en+=4;L.ms+=1;}else if(sec==='uec'){L.zh+=3;L.en+=2;L.ms+=1.5;}else{L.ms+=3;L.en+=2;}}}
  if(S.country!=='MY'){const l=ctry().lang;S.langs[l]=clamp((S.langs[l]||0)+4);}
  for(const k in S.langs)S.langs[k]=clamp(S.langs[k]);for(const k in st)st[k]=clamp(st[k]);
  S.edu.effort*=.6;}
function schoolNotes(){const a=age();const sc=S.stats.int+S.edu.effort*4;const g=sc>=90?'A+':sc>=78?'A':sc>=65?'B':sc>=52?'C':sc>=40?'D':'E';
  if(a===12)log('Finished primary school. Final report card: mostly '+g+'.','big');
  if(a===15)log('Finished Form 3. Teachers say you\'re a "'+g+'" student.');}
function milestones(){const a=age(),E=S.edu;
  if(a===4)q(tadikaModal());if(a===7)q(primaryModal());if(a===13)q(secondaryModal());if(a===16)q(streamModal());
  if(a===7)S.know=clamp(5+S.stats.int/10);
  if(a===13){log(`Finished primary school. Final report card: mostly ${gradeOf(S.know)}.`,'big');S.know*=.3;}
  if(a===16){log(`Finished ${E.exam==='UEC'?'junior middle':'Form 3'}. Overall grade: ${gradeOf(S.know)}.`,'big');S.know*=.4;}
  if(a>=7&&a<=17)S.know=clamp(S.know+30/stageInfo().L*passiveMult());
  if(a===18&&E.level==='none'){spmResult();if(origCult()==='chinese'&&(E.exam==='UEC'||E.spmA>=7)&&chance(.6+(S.dyn.honParent?.1:0)))q(clanModal());if(E.exam==='UEC')q(uecModal());else{if(E.spmA>=9&&E.exam==='SPM')q(scholarModal());else if(E.spmA>=7&&E.exam==='SPM'&&isBumi()&&chance(.6+(S.dyn.honParent?.1:0)))q(scholarModal('MARA'));q(preuModal());}}
  if(E.track&&a>18){payFees();S.know=clamp(S.know+30/(E.track.len||1)*passiveMult());E.track.left--;if(E.track.left<=0)finishTrack();}
  if(a===55&&S.epf>0&&!S.epfDone&&S.country==='MY'){S.epfDone=true;q({title:'EPF at 55',icon:'m_money',tag:'Money',text:`Your EPF balance is ${fmt(S.epf)}. You can now withdraw it.`,choices:[['Withdraw everything',()=>{S.money+=S.epf;S.epf=0;return 'The money lands in your bank account. Spend wisely!';}],['Keep it growing; draw it down after retiring',()=>'EPF keeps paying dividends and will fund your retirement.']]});}
  if(S.job&&a>=S.retireAsk&&!S.retired){S.retireAsk=a+5;q({title:'Time to retire?',icon:'m_retire',tag:'Career',text:`You're ${a}. Retire now, or keep working a few more years?`,choices:[['Retire',()=>{retire();return 'Pencen! No more alarm clocks.';}],['Keep working',()=>'You\'re not done yet.',()=>a<75]]});}
  if(!S.job&&!S.retired&&a>=62&&!E.track){retire();}
  if(S.country!=='MY'&&S.residency==='visa'&&!S.job&&!E.track&&a>=22){S.jobless++;if(S.jobless>=2){S.jobless=0;q({title:'Visa expired',icon:'m_abroad',tag:'Travel',text:'Without a job your work visa has lapsed. You must leave '+ctry().name+'.',choices:[['Fly home to Malaysia',()=>{moveTo('MY');return 'Back home. Time to regroup.';}]]});}}else S.jobless=0;}
function retire(){if(S.job){S.lastJobId=S.job.id;S.lastJobName=JOBS[S.job.id].name;if(JOBS[S.job.id].pension)S.pension=salaryBase()/infl()*.5;}S.job=null;S.retired=true;log('Retired.','big');}
function relationships(){const p=S.partner;if(!p)return;p.age++;
  if(p.alive!==false&&p.age>60&&chance(Math.pow((p.age-55)/45,3)*.45)){p.alive=false;log(p.name+' passed away at '+p.age+'.','big');bump('hap',-20);q({title:'Loss',icon:'m_rip',text:`${esc(p.name)} passed away at ${p.age}. The house feels very quiet.`,choices:[['Remember them',()=>'You keep their photo by the bed.']]});return;}
  if(p.alive===false){if(age()<70&&chance(.15))S.partner=null;return;}
  if(p.gold){p.rel=clamp(p.rel-4);
    if(S.money<a2c(15000)&&chance(.5)){S.partner=null;bump('hap',-10);log(p.name+' left when the money ran out.','big');q({title:'Gone',icon:'m_gold',tag:'Love',text:`${esc(p.name)} packs up and leaves. Your bank balance was the main attraction.`,choices:[['Ouch',()=>'Lesson learned.']]});return;}
    if(chance(.45))q(goldDemandModal());if(chance(.22))q(cheatModal());}
  else if(p.loy===-1?chance(p.rel<50?.2:.1):p.loy!==1&&p.rel<35&&chance(.06))q(cheatModal());
  p.rel=clamp(p.rel-(married()?3:6)-spouses().length+(p.loy||0)*2);
  if(p.status==='dating'&&p.rel<(p.loy===1?10:p.loy===-1?35:25)&&chance(p.rel<(p.loy===1?5:12)?1:.5)){q(breakupModal(p));return;}
  if(married()&&p.rel<(p.loy===1?8:p.loy===-1?28:20)&&!S.divorceAsked&&chance(p.rel<(p.loy===1?4:10)?1:.5)){S.divorceAsked=true;q(divorceAskModal(p));return;}
  const a=age();if(p.alive!==false&&p.rel>=45&&a>=20&&a<46&&p.age<46&&S.kids.length<8&&!expecting()&&!S.babyAsked&&chance(married()?(S.kids.length?.12:.3):.08)){S.babyAsked=true;q(babyAskModal(p));}}
function breakupModal(p){return {title:'"We need to talk"',icon:'m_love',tag:'Love',text:`${esc(p.name)} says the spark is gone and wants to break up.`,choices:[
  ['Beg them to stay',()=>{if(S.partner!==p)return '';if(chance(.25+(S.stats.cha-50)/150)){p.rel=clamp(p.rel+25);return `${esc(p.name)} agrees to give it one more try.`;}S.partner=null;bump('hap',-12);log(p.name+' broke up with you.','big');return 'It doesn\'t work. They leave anyway, and you feel worse for asking.';}],
  ['Let them go',()=>{if(S.partner!==p)return '';S.partner=null;bump('hap',-6);log(p.name+' broke up with you.','big');return 'You part ways. It hurts, but maybe it\'s for the best.';}]]};}
function divorceAskModal(p){const half=()=>{if(S.money>0)S.money*=.5;};return {title:'Divorce papers',icon:'m_love',tag:'Love',text:`${esc(p.name)} says the marriage is over and asks for a divorce.`,choices:[
  ['Beg for marriage counselling',()=>{if(S.partner!==p)return '';S.money-=a2c(3000);S.divorceAsked=false;if(chance(.55)){p.rel=clamp(p.rel+35);return 'Slowly, you learn to listen to each other again.';}half();S.partner=null;bump('hap',-15);log('Divorced '+p.name+'.','big');return 'Counselling doesn\'t save it. The divorce goes through, and the assets are split.';}],
  ['Agree to the divorce',()=>{if(S.partner!==p)return '';half();S.partner=null;bump('hap',-12);S.divorceAsked=false;log('Divorced '+p.name+'.','big');return 'The divorce is finalised. Assets are split.';}],
  ['Fight it in court',()=>{if(S.partner!==p)return '';S.money-=a2c(20000);S.partner=null;bump('hap',-18);S.divorceAsked=false;log('Divorced '+p.name+' after a court battle.','big');return 'Months of lawyers later, the divorce goes through anyway. The lawyers are the only winners.';}]]};}
function babyAskModal(p){const same=samePartner(),wed=married();
  const yes=()=>{S.babyAsked=false;if(S.partner!==p)return '';p.rel=clamp(p.rel+10);
    if(same){qFront(adoptModal());return '';}
    if(!chance(.65))return 'You try for months, but no luck yet. Maybe next year.';
    expectKid(p.stats,{note:wed?'':'born before marriage'});if(p.gold&&!wed)p.rel=clamp(p.rel+20);return 'Good news: a baby is on the way, due next year!'+(wed?'':' You are not married yet, and the relatives have opinions.');};
  return {title:same?'Talk of a family':'Baby fever',icon:'m_preg',tag:'Family',text:`${esc(p.name)} says ${same?'they want to adopt a child with you.':wed?'it is time to start a family.':'they want a baby with you, even before marriage.'}`+(p.gold?'\nYou wonder if a baby is their way of securing your money.':''),choices:[
    [same?'Yes, let\'s adopt':'Yes, let\'s try',yes],
    ['Not yet',()=>{S.babyAsked=false;if(S.partner!==p)return '';p.rel=clamp(p.rel-8);return `${esc(p.name)} looks disappointed but agrees to wait.`;}],
    ['Never',()=>{S.babyAsked=false;if(S.partner!==p)return '';p.rel=clamp(p.rel-20);return `${esc(p.name)} goes very quiet. This could become a big problem.`;}]]};}
function parentsTick(){if(S.withParents&&age()>=18&&!parAlive())S.withParents=false;famRel();const ag=age(),abroad=S.country!=='MY';
  for(const p of S.parents){if(!p.alive)continue;p.age++;
  // Closeness drifts: teens pull away, adults drift unless they make time; living together or nearby keeps it warm.
  if(ag>=13)p.rel=clamp(p.rel-(ag<18?1:S.withParents?0:abroad?3:1.5));
  if(p.age>62&&chance(Math.pow((p.age-55)/45,3)*.5*(S.dyn.leg&&S.dyn.leg.dial?.85:1))){p.alive=false;const a=age();
    let amt=S.group==='T20'?RI(300000,3000000):S.group==='M40'?RI(40000,300000):RI(0,30000);amt*=infl()/2;
    const lastOne=!S.parents.some(x=>x.alive);if(a<18||p.handedOver)amt=0;
    const cold=p.rel<25&&a>=18&&amt>0;if(cold)amt*=.4;
    log(`Your ${p.role.toLowerCase()} ${p.name} passed away at ${p.age}.`,'big');bump('hap',p.rel<35?-20:-15);
    let txt=`Your ${p.role.toLowerCase()}, ${esc(p.name)}, passed away at ${p.age}.`;
    txt+=p.rel>=75?'\nYou were close to the end, and you said everything you wanted to say.':p.rel<35?'\nYou never really made peace. That is the hardest part.':'';
    if(amt>0){S.money+=amt;txt+=`\nYou inherit ${fmt(amt)}.`+(cold?' Most of the estate goes to relatives who were there for them.':'');if(amt>=400000*infl()&&a>=21)S.fortune=amt;}
    if(lastOne&&S.withParents&&a>=18){S.withParents=false;txt+='\nThe family home is sold to settle the estate, so you will need a place of your own.';}
    if(lastOne&&town().kampung&&a>=18){S.assets.houses.push({name:'Family kampung house',where:town().name,value:180000*infl(),price:180000*infl(),loanLeft:0,pay:0,country:'MY',landed:1});txt+='\nThe family kampung house passes to you.';}
    q({title:'Farewell',icon:'m_rip',text:txt,choices:[['Hold the funeral',()=>'Relatives come from all over to pay their respects.']]});if(S.fortune){if(S.group==='T20'&&chance(.45))q(familyCoModal());q(fortuneModal(S.fortune));S.fortune=0;}}}}
function petsTick(){S.assets.pets=S.assets.pets.filter(p=>{p.age++;if(p.age>=p.life){log(`Your ${p.kind.toLowerCase()} ${p.name} passed away.`,'big');bump('hap',-5);return false;}return true;});}
function kidsTick(){const sb=S.dyn.leg&&S.dyn.leg.school?.1:0;famRel();const far=S.country!=='MY'||(S.pol&&S.pol.jail>0)||inHosp();
  for(const k of S.kids){const ka=S.year-k.born;if(k.alive!==false&&ka>=1)k.rel=clamp(k.rel-(ka<13?1:ka<18?2:1)-(far?2:0)-((S.otYrs||0)>0&&ka<18?1:0));if(ka<18){k.stats.int=clamp(k.stats.int+.8+sb);k.stats.ath=clamp(k.stats.ath+.4);}
  if(ka===18){const n=Math.round(clamp((k.stats.int-35)/5.5+R(-1.5,1.5),0,10));k.spm=n;log(`${k.name} got ${n}A in SPM.`);}
  if(ka===24&&!k.job){k.job=k.stats.int>=60?pick(['Engineer','Doctor','Accountant','Software engineer','Lawyer']):pick(['Clerk','Sales executive','Technician','Designer','Nurse']);log(`${k.name} started work as a ${k.job.toLowerCase()}.`);}}}

