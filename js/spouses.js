'use strict';
// More spouses, affairs, partner preference.
/* ================= more spouses, affairs, partner preference (v62) ================= */
// S.partner stays the main partner; extra spouses (up to 3 in all) live in S.spouses, a secret partner in S.affair.
const MAX_SPOUSES=4;
// polyRule 'law' (the default, and for old saves): only a Muslim man married to a woman can take more wives. 'fun': anyone can.
function polyOK(){return S.polyRule==='fun'||S.culture==='malay'&&S.gender==='M'&&married()&&S.partner.gender==='F';}
function spouses(){return (S.spouses=S.spouses||[]);}
function allSpouses(){return [...(married()?[S.partner]:[]),...spouses().filter(x=>x.alive!==false)];}
// Time with several spouses (v83): one-on-one time makes the others jealous, unless they already had their turn this year.
function spWord(L){L=L||allSpouses();return L.every(s=>s.gender==='F')?'wives':L.every(s=>s.gender==='M')?'husbands':'spouses';}
function spTurn(p,hit,raw){p.tYr=S.year;const j=allSpouses().filter(s=>s!==p&&s.tYr!==S.year);j.forEach(s=>s.rel=clamp(s.rel-hit));
  if(!j.length)return '';const n=j.map(s=>raw?s.name:esc(s.name)).join(' and ');return ` ${n} ${j.length>1?'feel':'feels'} a little left out.`;}
function spTimeModal(){const L=allSpouses(),w=spWord(L),cost=a2c(200),all=a2c(150)*L.length;
  const one=s=>()=>{if(S.ap<1||s.alive===false)return '';S.ap--;S.money-=cost;s.rel=clamp(s.rel+8+S.stats.cha/12);bump('hap',2);
    log('Spent time alone with '+s.name+'.');return pick(['Dinner by the river in Melaka with ','A long drive up to Fraser\'s Hill with ','Breakfast at the mamak with ','A slow walk round the pasar malam with '])+esc(s.name)+'.'+spTurn(s,2);};
  const together=()=>{if(S.ap<1)return '';S.ap--;S.money-=all;L.forEach(s=>s.tYr=S.year);bump('hap',3);
    const avg=L.reduce((a,s)=>a+s.rel,0)/L.length,ok=chance(clamp(.45+(S.stats.cha-50)/150+(avg-50)/150,.15,.9));
    if(ok){L.forEach(s=>s.rel=clamp(s.rel+5));S.dyn.rep+=.5;log('A family day out with all your '+w+'.');
      return pick([`A big makan at the seafood restaurant. Everyone shares, everyone laughs.`,`A picnic at the lake. Your ${w} swap recipes and gang up on you about your driving.`,`Karaoke night at home. Nobody can sing, and nobody cares.`])+' The house feels like one family.';}
    const s=pick(L);L.forEach(x=>x.rel=clamp(x.rel+(x===s?-5:2)));bump('hap',-2);log('A family outing with all your '+w+' turned tense.');
    return pick([`It starts well, until ${esc(s.name)} notices who you sat next to.`,`Everyone is polite, a little too polite. ${esc(s.name)} goes quiet in the car home.`,`An argument over whose turn it is to host Raya breaks out over dessert. ${esc(s.name)} takes it hardest.`]);};
  return {title:'Time with your '+w,icon:'m_love',tag:'Love',text:`Who do you want to spend time with? One-on-one time is sweeter, but the others notice if they haven't had their turn this year.`+L.map(s=>meter(esc(s.name)+(s.tYr===S.year?' (had a turn this year)':''),s.rel)).join(''),
    choices:[...L.map(s=>['Just '+esc(s.name)+' ('+fmt(cost)+')',one(s)]),['All of you together ('+fmt(all)+')',together,null,'Builds the family, but someone may feel slighted'],['Not now',null]]};}
function natTxt(p){return p&&p.from&&p.from!==S.country&&COUNTRIES[p.from]?' from '+COUNTRIES[p.from].name:'';}
function jobTxt(p){const j=p.job.toLowerCase();return (/^[aeiou]/.test(j)?'an ':'a ')+j;}
function fixPartners(){const L=spouses();for(let i=L.length-1;i>=0;i--)if(L[i].alive===false)L.splice(i,1);
  if(L.length&&(!S.partner||S.partner.alive===false))S.partner=L.shift();
  if((!S.partner||S.partner.alive===false)&&S.affair){const a=S.affair;S.affair=null;a.status='dating';delete a.sus;S.partner=a;log(a.name+' is no longer a secret. You are now openly together.','big');}}
function dropSpouse(s,keep){if(S.partner===s)S.partner=null;else{const L=spouses(),i=L.indexOf(s);if(i>=0)L.splice(i,1);}if(keep!=null&&S.money>0)S.money*=keep;fixPartners();}
function wealthPull(){return clamp(Math.log10(Math.max(netWorth()/infl(),1))*5-20,0,20);}
// How willing a current spouse is to share you with spouse number n, and how willing the newcomer is to join.
function spouseOK(s,n,boost){let w=12+(s.rel-50)*.6+(S.stats.cha-50)/3+wealthPull()-(n-2)*12+(s.loy===1?12:s.loy===-1?-8:0)+(s.gold?8:0)+(boost||0);
  if(S.gender==='M'&&s.gender==='F'&&s.culture==='malay'&&S.culture==='malay')w+=10;return Math.round(clamp(w,2,95));}
function candOK(c,n){return Math.round(clamp(28+(S.stats.cha-50)/2+(S.stats.look-c.stats.look)/4+wealthPull()*1.2-(n-2)*10+(c.gold?15:0)+(c.boost||0),2,95));}
function meter(lbl,v,cls){return `<span class="stat" style="margin-top:10px"><span class="lbl"><span>${lbl}</span><span>${Math.round(v)}%</span></span><span class="bar" style="display:block"><i class="${cls||barCls(v)}" style="width:${v}%"></i></span></span>`;}
function spouseFindModal(){const pf=S.pref;if(S.polyRule!=='fun')S.pref='opp';const c=npc(18);S.pref=pf;c.age=Math.max(20,c.age);c.rel=45;
  if(c.age>age()+8&&chance(.5))c.gold=chance(.3);return polyModal(c);}
function polyModal(c){const L=allSpouses(),n=L.length+1,sw=L.map(s=>spouseOK(s,n,c.spBoost)),cw=candOK(c,n),gift=a2c(3000)*L.length,date=a2c(800);
  const names=L.map(s=>esc(s.name)).join(' and ');
  return {title:'Another wedding?',icon:'m_ring',tag:'Love',text:`You grow close to ${esc(c.name)}, ${c.age}${natTxt(c)?','+natTxt(c):''}, ${jobTxt(c)}. Marrying them would make them spouse number ${n}.\nYou need ${L.length>2?'all your spouses':L.length>1?'both your spouses':esc(L[0].name)} to agree before you can propose.${S.polyRule==='fun'?'':' The Syariah court will also want to see that you can support another family.'}`+L.map((s,i)=>meter(esc(s.name)+' would accept it',sw[i])).join('')+meter(esc(c.name)+' would say yes',cw),
    choices:[
      [`Ask ${names} for permission`,()=>{const no=L.filter((s,i)=>!chance(sw[i]/100));
        if(no.length){no.forEach(s=>s.rel=clamp(s.rel-12));bump('hap',-4);log(no.map(s=>s.name).join(' and ')+' refused to let you marry '+c.name+'.');return `${no.map(s=>esc(s.name)).join(' and ')} ${no.length>1?'refuse':'refuses'}. The house is very cold for a few weeks.`;}
        L.forEach(s=>s.rel=clamp(s.rel-4));qFront(polyWedModal(c,n,cw));return '';}],
      [`Shower ${names} with gifts first (${fmt(gift)})`,()=>{S.money-=gift;c.gifted=1;c.spBoost=(c.spBoost||0)+12;L.forEach(s=>s.rel=clamp(s.rel+3));qFront(polyModal(c));return '';},()=>S.money>=gift&&!c.gifted,'Raises their willingness. Once only'],
      [`Take ${esc(c.name)} out a few more times (${fmt(date)})`,()=>{S.money-=date;c.dated=1;c.boost=(c.boost||0)+12;qFront(polyModal(c));return '';},()=>S.money>=date&&!c.dated,'Raises their willingness. Once only'],
      ['Let it go',()=>'You stay friends with '+c.name+'. Probably simpler.']]};}
function polyWedModal(c,n,cw){const I=a2c(1);
  const wed=(lbl,cost,txt)=>[`${lbl} (${fmt(cost*I)})`,()=>{if(!chance(cw/100)){bump('hap',-5);return `Your family said yes, but ${esc(c.name)} doesn't want to be spouse number ${n}. Awkward.`;}
    S.money-=cost*I;c.status='married';c.rel=clamp(c.rel+20);marryConvert(c);spouses().push(c);allSpouses().forEach(s=>{if(s!==c)s.rel=clamp(s.rel-6);});addAch('married');bump('hap',8);log(`Married ${c.name}, your spouse number ${n}. ${txt}`,'big');return `${esc(c.name)} says yes! ${txt}`;},()=>S.money>=cost*I,'Needs '+fmt(cost*I)];
  return {title:'They said you can',icon:'m_ring',tag:'Love',text:`Your family has agreed, grudgingly. Now ask ${esc(c.name)}.`+meter(esc(c.name)+' would say yes',cw),
    choices:[wed('Small ceremony with close family',8000,'A quiet ceremony. Not everyone is smiling in the photos.'),wed('Big wedding feast',30000,'A full kenduri. The relatives will talk about this for years.'),['Change your mind',()=>'You decide your household is full enough.']]};}
function spousesTick(){const L=spouses(),n=allSpouses().length;
  for(const s of [...L]){if(s.alive===false)continue;s.age++;
    if(s.age>60&&chance(Math.pow((s.age-55)/45,3)*.45)){s.alive=false;bump('hap',-15);log(s.name+' passed away at '+s.age+'.','big');q({title:'Loss',icon:'m_rip',text:`${esc(s.name)} passed away at ${s.age}. The family grieves together.`,choices:[['Remember them',()=>'Their photo goes up in the living room.']]});continue;}
    s.rel=clamp(s.rel-3-(n-2)+(s.loy||0)*2);
    if(s.rel<15&&chance(.5)){dropSpouse(s,.7);bump('hap',-8);log(s.name+' divorced you.','big');q({title:'Divorce papers',icon:'m_love',tag:'Love',text:`${esc(s.name)} says sharing you was never going to work, and files for divorce. The settlement takes 30% of your cash.`,choices:[['Sign the papers',()=>'One fewer seat at the dinner table.']]});}}
  if(allSpouses().length>=2&&chance(.5))q(multiEvent());}
function multiEvent(){const L=allSpouses(),a=pick(L),b=pick(L.filter(x=>x!==a)),A=esc(a.name),B=esc(b.name),both=d=>{a.rel=clamp(a.rel+d);b.rel=clamp(b.rel+d);};
  const fest=S.culture==='chinese'?'Chinese New Year reunion dinner':'first morning of Hari Raya';
  const E=[
    {t:'Whose family first?',x:`${A} and ${B} both want you at their family's ${fest}. Nobody will budge.`,ch:[
      [`Go with ${A}`,()=>{a.rel=clamp(a.rel+10);b.rel=clamp(b.rel-12);return `${A} is delighted. ${B} spends the festival with their own family, and posts sad photos.`;}],
      [`Go with ${B}`,()=>{b.rel=clamp(b.rel+10);a.rel=clamp(a.rel-12);return `${B} is delighted. ${A} is not.`;}],
      ['Split the day between both families',()=>{if(roll('cha')>.55){both(4);return 'A long day of driving and two lunches, but everyone feels respected.';}both(-5);bump('hlt',-1);return 'You arrive late to both. Everyone is annoyed.';}]]},
    {t:'A feast for the family',x:`${A} and ${B} spend the whole weekend cooking together. The kitchen smells amazing.`,ch:[
      ['Thank them both',()=>{both(5);bump('hap',4);return 'Rendang, curry and three kinds of kuih. They are becoming real friends.';}],
      ['Wash every dish yourself',()=>{both(8);bump('dis',2);return 'Two hours at the sink. Worth it for the smiles.';}]]},
    {t:'The handbag incident',x:`${A} notices the expensive gift you bought ${B} last month. "Where is mine?"`,ch:[
      [`Buy ${A} a matching one (${fmt(a2c(3000))})`,()=>{S.money-=a2c(3000);a.rel=clamp(a.rel+8);return 'Equal treatment, restored. Your bank account is less happy.';},()=>S.money>=a2c(3000)],
      ['Explain it was a birthday present',()=>{if(roll('cha')>.5){return `${A} grudgingly accepts it.`;}a.rel=clamp(a.rel-10);return `${A} doesn't buy it. Fairness is everything in this house.`;}]]},
    {t:'United front',x:`${A} and ${B} sit you down together. They agree you have been working too late and spending too much.`,ch:[
      ['Promise to change',()=>{both(6);bump('dis',2);return 'You come home for dinner every night. They high-five behind your back.';}],
      ['Stand your ground',()=>{both(-8);return 'Two against one. You lose the argument and the TV remote.';}]]},
    {t:'Screaming match',x:`${A} and ${B} have a huge argument over chores. The neighbours hear everything.`,ch:[
      [`Take ${A}'s side`,()=>{a.rel=clamp(a.rel+6);b.rel=clamp(b.rel-15);return `${B} feels betrayed.`;}],
      [`Take ${B}'s side`,()=>{b.rel=clamp(b.rel+6);a.rel=clamp(a.rel-15);return `${A} feels betrayed.`;}],
      [`Book family counselling (${fmt(a2c(2000))})`,()=>{S.money-=a2c(2000);both(6);return 'A counsellor draws up a chore rota. Peace returns, mostly.';},()=>S.money>=a2c(2000)]]},
    {t:'Looking after you',x:`You come down with a bad fever. ${A} and ${B} take turns looking after you.`,ch:[
      ['Rest and let them fuss',()=>{bump('hlt',4);both(3);return 'Porridge, cold towels and two people checking your temperature. You recover fast.';}]]},
    {t:'A family business',x:`${A} and ${B} want to start a kuih and catering business together.`,ch:[
      [`Back them (${fmt(a2c(8000))})`,()=>{S.money-=a2c(8000);if(roll('cre')>.45){const g=a2c(RI(12000,40000));S.money+=g;both(6);return 'Orders pour in for weddings and open houses. Profit: '+fmt(g)+'.';}both(-2);return 'The business folds after a year. At least they still like each other.';},()=>S.money>=a2c(8000)],
      ['Say it is too risky',()=>{both(-4);return 'They are disappointed, and quietly start selling online anyway.';}]]}];
  if(S.kids.some(k=>S.year-k.born<18))E.push({t:'Homework rota',x:`${A} and ${B} set up a homework timetable for the kids, one subject each.`,ch:[
    ['Great teamwork',()=>{S.kids.forEach(k=>{if(S.year-k.born<18)k.stats.int=clamp(k.stats.int+3);});both(3);return 'The kids grumble, but their grades go up.';}]]});
  const low=L.find(s=>s.rel<35);
  if(low){const o=pick(L.filter(x=>x!==low)),LN=esc(low.name),ON=esc(o.name);E.push({t:'"It\'s me or them"',x:`${LN} gives you an ultimatum: divorce ${ON}, or ${LN} leaves.`,ch:[
    [`Divorce ${ON}`,()=>{dropSpouse(o,.75);low.rel=clamp(low.rel+20);bump('hap',-8);log('Divorced '+o.name+' after an ultimatum.','big');return `You divorce ${ON}. ${LN} is calmer now, but the house feels emptier.`;}],
    ['Refuse',()=>{low.rel=clamp(low.rel-15);return `${LN} goes very quiet. This isn't over.`;}]]});}
  const e=pick(E);return {title:e.t,icon:'t_family',tag:'Family',text:e.x,choices:e.ch};}
// Secret partners
function affairStartModal(){const c=npc(18);c.age=Math.max(18,c.age);const p=S.partner,compat=clamp(45+(S.stats.cha-50)/2+(S.stats.look-50)/3+R(-20,20),5,95);
  return {title:'A dangerous spark',icon:'m_fling',tag:'Love',text:`You keep running into ${esc(c.name)}, ${c.age}${natTxt(c)?','+natTxt(c):''}, ${jobTxt(c)}. The chemistry is obvious.\nYou are with ${esc(p.name)}. If you start something, they could find out.`+meter('Chance they say yes',compat),
    choices:[['Start seeing them in secret',()=>{if(!chance(compat/100)){bump('hap',-2);return `${esc(c.name)} says they don't date people who are taken. Fair.`;}c.secret=1;c.sus=10;c.rel=50;S.affair=c;log('Started a secret affair with '+c.name+'.');bump('hap',3);return `You start meeting ${esc(c.name)} in secret. Your phone now lives face down.`;}],
      ['Walk away',()=>'You go home to '+p.name+'. Nothing happened.']]};}
function affairTick(){const f=S.affair;if(!f)return;f.age++;if(!S.partner||S.partner.alive===false){fixPartners();return;}
  f.rel=clamp(f.rel-5);f.sus=clamp((f.sus||0)+6-S.stats.dis/25);
  if(f.rel<20&&chance(.5)){S.affair=null;log(f.name+' ended the affair.');q({title:'It\'s over',icon:'m_fling',tag:'Love',text:`${esc(f.name)} is tired of being a secret and ends it.`,choices:[['Let them go',()=>'Nobody finds out. This time.']]});return;}
  if(chance(f.sus/100*.6)){q(caughtModal('You leave your phone unlocked on the table.'));return;}
  if(f.rel>=70&&!spouses().length&&chance(.3)){q(affairUltimatum());return;}
  if(canConceive(f)&&chance(.06)){f.sus=clamp(f.sus+30);q(pregModal({stats:f.stats,name:f.name,fling:true,how:'affair'}));}}
function affairDate(){const f=S.affair;if(!f||S.ap<1)return;if(!S.partner||S.partner.alive===false){fixPartners();render();return;}S.ap--;f.rel=clamp(f.rel+10);f.sus=clamp(f.sus+12-S.stats.dis/10);bump('hap',3);
  if(f.sus>=60&&chance(.35)){qFront(caughtModal('Someone spots you two at a hotel lobby in Bukit Bintang.'));showNext();return;}
  toast(pick(['A long lunch at a hotel across town.','Supper in a quiet corner of a kopitiam.','A "work trip" to Penang.'])+' Suspicion is rising.');render();save();}
function caughtModal(how){const f=S.affair,L=allSpouses().length?allSpouses():[S.partner].filter(Boolean),F=esc(f.name),who=L.map(s=>esc(s.name)).join(' and ');
  const leave=s=>{dropSpouse(s,s.status==='married'?.5:null);log((s.status==='married'?'Divorced by ':'Dumped by ')+s.name+' over your affair with '+f.name+'.','big');};
  return {title:'Caught',icon:'m_cheat',tag:'Love',text:`${how} ${who} ${L.length>1?'find':'finds'} out about ${F}.`,choices:[
    ['Beg for forgiveness and end the affair',()=>{S.affair=null;const gone=[];for(const s of L){if(chance(clamp((s.rel-20)/100+(s.loy===1?.25:0)+(S.stats.cha-50)/300,.05,.85)))s.rel=clamp(s.rel-25);else{leave(s);gone.push(s.name);}}
      bump('hap',-10);return gone.length?`${gone.join(' and ')} can't forgive you and ${gone.length>1?'leave':'leaves'}.`+(L.some(s=>s.status==='married'&&gone.includes(s.name))?' The divorce takes half your cash.':''):`${who} ${L.length>1?'take':'takes'} you back, barely. Trust will take years to rebuild.`;}],
    [`Leave ${who} for ${F}`,()=>{L.forEach(leave);f.rel=clamp(f.rel+10);bump('hap',-6);fixPartners();return `You choose ${F}. It's messy and expensive, but you are finally out in the open.`;}],
    ['Deny everything',()=>{if(roll('cha')>.7){f.sus=40;L.forEach(s=>s.rel=clamp(s.rel-10));return `Somehow, ${who} half-${L.length>1?'believe':'believes'} your story. You'd better be careful.`;}
      S.affair=null;L.forEach(leave);bump('hap',-14);return 'The lies make it worse. You end up alone, and the settlement is brutal.';}]]};}
function affairUltimatum(){const f=S.affair,p=S.partner,F=esc(f.name),P=esc(p.name);
  return {title:'"Leave them for me"',icon:'m_fling',tag:'Love',text:`${F} is tired of hiding. They want you to leave ${P}.`,choices:[
    [`Leave ${P}`,()=>{const was=p.status==='married';dropSpouse(p,was?.5:null);log((was?'Divorced ':'Left ')+p.name+' for '+f.name+'.','big');bump('hap',-4);return `You leave ${P}.`+(was?' The divorce takes half your cash.':'')+` ${F} moves in.`;}],
    [`Stay with ${P}`,()=>{S.affair=null;if(chance(.3)){S.affair=f;qFront(caughtModal(`${F} sends ${P} every message you ever wrote.`));return '';}bump('hap',-4);return `${F} cries, then blocks your number.`;}]]};}
function prefModal(){const N={opp:'the opposite gender',same:'the same gender',any:'anyone'};
  return {title:'Who are you attracted to?',icon:'m_love',tag:'Love',text:`Right now you're interested in ${N[S.pref]}. You can change this once in your life.`,choices:[
    ...Object.keys(N).filter(k=>k!==S.pref).map(k=>[`I'm interested in ${N[k]}`,()=>{S.pref=k;S.prefChanged=true;log('Realised you are interested in '+N[k]+'.','big');bump('hap',3);return 'You feel more like yourself. New people you meet will reflect this.';}]),
    ['Keep things as they are',null]]};}

