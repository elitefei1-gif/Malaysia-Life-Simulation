'use strict';
// Festivals, random events, life-stage events, achievements and death.
/* ================= festivals ================= */
function festival(){const C=cult(),a=age(),I=infl(),F=C.fest;if(a<2)return;S.festN=(S.festN||0)+1; // festive music plays for the first 5 festivals of each life
  if(a>=18&&S.country==='MY'&&S.dyn.leg&&S.dyn.leg.hall)bump('hap',3); // the whole community comes to the hall you built
  if(chance(.5)&&a>=6&&S.country==='MY'){const o=pick(Object.values(CULTURES).filter(c=>c.fest!==F));log(`Visited a friend's ${o.fest} open house. Ate far too much.`,'festive');bump('cha',1);}
  if(a<18||(a<=25&&S.edu.track&&!S.job)){const amt=Math.round((a<12?RI(80,300):RI(150,600))*I*(S.group==='T20'?2:S.group==='B40'?.6:1));
    q({title:F,icon:'f_'+S.culture,tag:'Festive season',text:`Relatives hand you ${C.gift}. ${fmt(amt)} in total!`,choices:[
      ['Save it in the bank',()=>{S.money+=amt;bump('dis',2);return 'Into the savings account it goes.';}],
      [a<13?'Spend it on snacks and toys':'Treat yourself',()=>{S.money+=amt*.2;bump('hap',4);return a<13?'Fireworks, sweets and a new toy. Best day ever.':'New shoes, bubble tea and a movie with friends.';}],
      ['Give half to your parents',()=>{S.money+=amt*.5;bump('hap',2);bump('cha',1);return 'Your parents are touched.';},()=>parAlive(),parAlive()?'':'Your parents have passed away']]});return;}
  if(S.country!=='MY'){const fl=COUNTRIES[S.country].flight*I*((fxNow().travel)||1);
    q({title:F+' abroad',icon:'f_'+S.culture,tag:'Festive season',text:`${F} is here and you're far from home in ${ctry().city}.`,choices:[
      [`Fly home to balik kampung (${fmt(fl)})`,()=>{S.money-=fl;S.homesick=clamp(S.homesick-35);bump('hap',7);return parAlive()?'Mum\'s cooking, cousins everywhere, and a very full stomach.':'Cousins everywhere, old family recipes and a very full stomach.';}],
      ['Celebrate with fellow Malaysians there',()=>{S.homesick=clamp(S.homesick-12);bump('hap',3);bump('cha',1);return 'A potluck with the Malaysian student association. Someone brought rendang!';}],
      ['Video call the family',()=>{S.homesick=clamp(S.homesick-5);return 'The whole family crowds around the phone to wave.';}]]});return;}
  const ch=[['Balik kampung (brace for the highway jam)',()=>{const jam=RI(4,14);S.money-=300*I;bump('hap',5);return `${jam} hours on the highway, but home cooking and catching up with relatives make it worth it.`;}]];
  if(a>=25)ch.push([`Host an open house (${fmt(3000*I)})`,()=>{S.money-=3000*I;bump('cha',3);bump('hap',4);S.openHouses++;S.dyn.rep+=1;if(S.openHouses>=5)addAch('openHouse');return 'Neighbours, colleagues and friends of every background drop by. Classic Malaysian open house.';},()=>S.money>3000*I,'Needs cash']);
  if(S.job){const g=RI(300,1500)*I*(honTier()?2:1);ch.push([`Give ${C.gift} to the young ones (${fmt(g)})`,()=>{S.money-=g;bump('cha',2);bump('hap',2);return 'The kids line up politely, eyes on the envelopes.';}]);}
  ch.push(['Quiet celebration at home',()=>{bump('hlt',2);bump('hap',2);return 'A calm, restful break with close family.';}]);
  q({title:F,icon:'f_'+S.culture,tag:'Festive season',text:`It's ${F}! How will you celebrate this year?`,choices:ch});}

/* ================= random events ================= */
// Romance with people from other countries, at home (v66). fNpc makes someone from abroad around your age.
function fNpc(k,minA,maxA){const p=npc(minA,maxA,k);p.age=clamp(age()+RI(-3,3),minA,maxA);if(p.age<22&&age()<23)p.job='Student';return p;}
const fLang=k=>COUNTRIES[k].lang;
const EV_FOREIGN=[
  {id:'f_exchange',c:a=>a>=15&&a<=17&&S.country==='MY'&&!S.partner,t:'The new exchange student',x:()=>{const k=S._fx=pick(['JP','KR','UK','DE','US']);return `A student from ${COUNTRIES[k].name} joins your class for a term. Everyone wants to sit next to them, but the teacher asks you to show them around.`;},ch:[
    ['Show them around school',()=>{const k=S._fx||'JP',o=fNpc(k,15,17);bump('cha',2);S.friends++;if(chance(.45+(S.stats.cha-50)/200)){qFront(meetModal(false,null,o));return `You take ${esc(o.name)} to the canteen for nasi lemak and teach them how to order teh ais. You have a lot in common.`;}return `${esc(o.name)} becomes a good friend. You promise to visit ${COUNTRIES[k].name} one day.`;}],
    ['Swap language lessons',()=>{const k=S._fx||'JP',l=fLang(k);S.langs[l]=clamp((S.langs[l]||0)+RI(6,10));bump('int',1);return `You teach them "boleh" and "jom makan". They teach you some ${LANG[l]}.`;}],
    ['Leave it to the class monitor',()=>'You stick with your usual group.']]},
  {id:'f_tourist',c:a=>a>=18&&a<=40&&S.country==='MY'&&!S.partner,t:'Lost in Jonker Street',x:()=>{const k=S._fx=pick(['UK','AU','US','KR','JP','DE']);return `On a weekend in Melaka, a traveller from ${COUNTRIES[k].name} asks you for directions. Their map app has given up.`;},ch:[
    ['Offer to show them around',()=>{const k=S._fx||'UK',o=fNpc(k,18,60);bump('hap',3);if(chance(.4+(S.stats.cha-50)/200+(S.langs.en||0)/400)){qFront(meetModal(false,null,o));return `Cendol, the Stadthuys and a river cruise at sunset. By the end of the day you and ${esc(o.name)} are still talking.`;}return `${esc(o.name)} thanks you with a selfie and flies home the next day.`;}],
    ['Point the way and go',()=>{bump('cha',1);return 'They wave goodbye. Good deed for the day.';}]]},
  {id:'f_langex',c:a=>a>=18&&a<=45&&S.country==='MY'&&!S.partner&&['kl','pj','penang','jb','shahalam'].includes(S.town),t:'Language exchange night',x:'A café near your place runs a language exchange every Thursday. Expats and locals swap languages over coffee.',ch:[
    ['Practise Japanese',()=>fLangEx('JP')],['Practise Korean',()=>fLangEx('KR')],['Practise English',()=>fLangEx(pick(['UK','AU','US']))],['Stay home tonight',()=>'Maybe next week.']]},
  {id:'f_expat',c:a=>office(a)&&a<=50&&S.country==='MY'&&!S.partner,t:'A new colleague from abroad',x:()=>{const k=S._fx=pick(['JP','KR','UK','DE','AU']);return `Your company transfers someone from its ${COUNTRIES[k].city} office to KL. They don't know anyone here yet.`;},ch:[
    ['Take them out for makan',()=>{const k=S._fx||'JP',o=fNpc(k,23,60);o.job=pick(['Engineer','Manager','Consultant','Designer','Analyst']);o.salary=7000*R(.8,1.4);if(chance(.4+(S.stats.cha-50)/200)){qFront(meetModal(false,null,o));return `Roti canai, then durian, which ${esc(o.name)} bravely tries. You keep finding reasons to have lunch together.`;}S.friends++;return `${esc(o.name)} becomes a good friend at work.`;}],
    ['Keep it professional',()=>'You help them with the printer and leave it there.']]},
];
function fLangEx(k){const l=fLang(k),o=fNpc(k,18,60);S.langs[l]=clamp((S.langs[l]||0)+RI(5,9));
  if(chance(.35+(S.stats.cha-50)/200)){qFront(meetModal(false,null,o));return `You get paired with ${esc(o.name)} from ${COUNTRIES[k].name}. The hour flies by.`;}return `Your ${LANG[l]} improves a little. Everyone is friendly, but no sparks.`;}
const EV=[
  // 4D: legal age is 21, and Muslims are barred from buying, so Malay families never get it.
  {id:'lottery4d',c:a=>a>=21&&S.country==='MY'&&S.culture!=='malay',t:'4D fever',x:'The jackpot is over RM 10 million this week and the queue at the 4D shop is out the door. Your aunt swears your IC number is lucky.',ch:[
    ['Buy RM 10 on your IC number',()=>{const I=infl();S.money-=10*I;const r=Math.random();
      if(r<.001){const w=25000*I;S.money+=w;bump('hap',10);log('Won first prize in 4D: '+fmt(w)+'.','big');return `First prize! Your RM 10 ticket wins ${fmt(w)}. Your aunt wants a cut.`;}
      if(r<.023){const w=RI(50,600)*I;S.money+=w;bump('hap',3);return `A small prize: ${fmt(w)}. You buy kopi for everyone at the shop.`;}
      return 'Not even close. Your aunt blames the date format.';}],
    ['Go big: RM 500 on a "dream number"',()=>{const I=infl();S.money-=500*I;const r=Math.random();
      if(r<.001){const w=1250000*I;S.money+=w;bump('hap',20);log('Won the 4D jackpot: '+fmt(w)+'.','big');return `Jackpot! ${fmt(w)}. Relatives you have never met start calling.`;}
      if(r<.023){const w=RI(3000,30000)*I;S.money+=w;bump('hap',6);return `Your dream number comes in for a ${fmt(w)} prize.`;}
      bump('hap',-3);return `${fmt(500*I)} gone. The dream was just a dream.`;},()=>S.money>500*infl(),'Needs cash'],
    ['Skip it',()=>{bump('dis',1);return 'You keep your money. The house always wins.';}]]},
  {id:'ramadan',c:a=>a>=6&&S.country==='MY',t:'Ramadan bazaar',x:()=>S.culture==='malay'?'It\'s the fasting month. By 6pm the bazaar near your house is packed with murtabak, ayam percik and air bandung stalls.':'The Ramadan bazaar near your house is open again. Your Muslim friends say the murtabak there is the best in town.',ch:[
    ['Buy everything that looks good',()=>{S.money-=60*infl();bump('hap',4);bump('hlt',-1);return 'You come home with far too much food: murtabak, satay, kuih and three kinds of drinks. Worth it.';}],
    ['Run a kuih stall for the month',()=>{const w=RI(800,3000)*infl();S.money+=w;bump('cha',2);bump('hlt',-1);log('Ran a Ramadan bazaar stall and made '+fmt(w)+'.');return `Long hot afternoons, but your kuih sells out most days. You make ${fmt(w)}.`;},()=>age()>=16,'Age 16+'],
    ['Break fast with friends',()=>{bump('cha',2);bump('hap',3);S.friends++;return S.culture==='malay'?'You wait for the azan together, then everyone digs in at once.':'Your friends save you a seat. You learn it is rude to start eating before the azan.';}]]},
  {id:'bully',c:a=>a>=7&&a<=15,t:'Trouble at the canteen',x:'A classmate is being picked on near the canteen.',ch:[
    ['Step in',()=>{if(roll('cha')>.45){bump('cha',3);S.friends++;return 'You stood up for them. They become a loyal friend.';}bump('hlt',-2);bump('hap',-2);return 'The bullies turned on you too. You got a bruise, but your classmate is grateful.';}],
    ['Tell the cikgu',()=>{bump('dis',2);return 'The teacher sorts it out quickly.';}],['Walk away',()=>{bump('hap',-3);return 'It bothers you for days.';}]]},
  {id:'quiz',c:a=>a>=8&&a<=17,t:'Inter-school quiz',x:'Your teacher picks you for the inter-school quiz competition.',ch:[
    ['Prepare hard',()=>{bump('int',2);if(roll('int')>.55){bump('hap',5);S.dyn.rep+=.5;log('Won the inter-school quiz!','big');return 'Your team wins! Your photo goes on the school notice board.';}return 'Second place. Not bad at all.';}],['Decline politely',()=>'Someone else goes instead.']]},
  {id:'sports',c:a=>a>=7&&a<=17,t:'Sports Day',x:'You\'re entered in the 100m sprint.',ch:[
    ['Go all out',()=>{if(roll('ath')>.55){bump('ath',2);bump('hap',5);return 'Gold medal! Your sports house goes wild.';}bump('ath',1);return 'You finish fourth, but you ran your best time.';}],['Cheer from the stands',()=>{bump('cha',1);return 'You lead the cheering for your sports house.';}]]},
  {id:'skip',c:a=>a>=14&&a<=17,t:'Ponteng?',x:'Friends want to skip class and go to the mall.',ch:[
    ['Go with them',()=>{bump('hap',4);bump('int',-1.5);if(chance(.35)){bump('dis',-2);return 'A discipline teacher spots you at the mall. Detention for a week.';}return 'Mamak, arcade, and nobody noticed.';}],['Stay in class',()=>{bump('dis',2);return 'You stay. The lesson was actually useful.';}]]},
  {id:'crush',c:a=>a>=13&&a<=17&&!S.partner,once:1,t:'First crush',x:'You can\'t stop thinking about someone in your class.',ch:[
    ['Confess your feelings',()=>{if(roll('cha')+(S.stats.look-50)/200>.55){S.partner=npc(13,18);S.partner.age=age();S.partner.rel=40;log('First relationship with '+S.partner.name+'.','big');bump('hap',8);return S.partner.name+' likes you too! Your first relationship.';}bump('hap',-5);return 'They say "let\'s just be friends". The whole class finds out by recess.';}],['Keep it a secret',()=>'Some feelings stay in the diary.']]},
  {id:'tuition',c:a=>a>=9&&a<=17,t:'Tuition every evening',x:'Your parents want to send you to tuition after school.',ch:[
    ['Go to tuition',()=>{bump('hap',-2);S.know=clamp(S.know+5*studyMult());return 'Three evenings a week of extra maths and science.';}],['Negotiate fewer classes',()=>{bump('int',1);bump('cha',1);return 'You agree on one subject only.';}]]},
  {id:'gaming',c:a=>a>=11&&a<=28,t:'Late-night gaming',x:'You\'ve been gaming until 3am every night.',ch:[
    ['Cut back',()=>{bump('dis',3);return 'You set a midnight cut-off and stick to it.';}],['Keep playing',()=>{bump('hap',3);bump('hlt',-2);bump('int',-1);return 'You reach a new rank. Your eye bags reach a new low.';}]]},
  {id:'prefect',c:a=>a>=12&&a<=17&&S.stats.cha>=55,once:1,t:'Prefect appointment',x:'The school wants to appoint you as a prefect.',ch:[
    ['Accept',()=>{bump('cha',3);bump('dis',2);return 'You get the special tie and a lot of responsibility.';}],['Decline',()=>'You prefer a quieter school life.']]},
  {id:'plkn',c:a=>a===18&&S.year>=2004&&S.year<=2018&&S.country==='MY',once:1,t:'National Service (PLKN)',x:'You\'ve been selected for the National Service Training Programme.',ch:[
    ['Report for camp',()=>{bump('ath',4);bump('cha',3);bump('dis',3);log('Completed National Service (PLKN).');return 'Three months of marching, kayaking and making friends from every state.';}]]},
  {id:'group',c:a=>!!S.edu.track&&S.edu.track.kind==='uni',t:'Group project nightmare',x:'Your group-project teammates have disappeared.',ch:[
    ['Do it all yourself',()=>{bump('hap',-3);S.know=clamp(S.know+5);return 'You submit at 11:58pm. A solid grade.';}],['Report them to the lecturer',()=>{bump('cha',-1);bump('dis',1);return 'They get marked down. Awkward lectures follow.';}],['Let it slide',()=>{S.know=clamp(S.know-5);return 'The project is mediocre and so is the grade.';}]]},
  {id:'intern',c:a=>!!S.edu.track&&S.edu.track.kind==='uni'&&S.edu.track.left<=2&&!S.intern,t:'Internship offer',x:'A company offers you an internship over the semester break.',ch:[
    ['Accept',()=>{S.intern=1;S.money+=a2c(3000);bump('dis',2);return 'Real work experience on your CV. Job hunting will be easier.';}],['Decline and travel',()=>{bump('hap',4);return 'You backpack around Indochina instead.';}]]},
  {id:'credit',c:()=>!!S.job&&!JOBS[S.job.id].noEpf,t:'Stolen credit',x:'Your boss presents your idea to management as their own.',ch:[
    ['Confront them privately',()=>{if(roll('cha')>.55){S.job.lvl+=1;return 'Your boss apologises and credits you at the next meeting.';}bump('hap',-3);return 'It gets frosty. You\'re left off the next project.';}],['Let it go',()=>{bump('hap',-3);return 'You keep quiet, but you remember.';}],['Start job hunting',()=>{qFront(jobModal());return '';}]]},
  {id:'headhunt',c:a=>!!S.job&&a>=25&&a<=52&&!JOBS[S.job.id].noEpf,t:'Headhunter on LinkedIn',x:'A headhunter offers you the same role at a competitor with 20% more pay.',ch:[
    ['Take the offer',()=>{S.job.bonus=(S.job.bonus||1)*1.2;bump('hap',2);log('Switched to a competitor for a 20% raise.');return 'New office, new badge, fatter payslip.';}],['Stay loyal',()=>{S.job.lvl+=1;return 'Your boss hears about it and puts you up for promotion sooner.';}]]},
  // Closeness with parents (parRel) and children (k.rel). FP / FK hold the parent / child a pop-up is about.
  {id:'par_recipe',c:a=>a>=14&&a<=40&&parRel()>=70&&livePar().some(p=>p.role==='Mother'),once:1,t:'The family recipe',
   x:()=>`Your mum says it is time you learned her ${{malay:'rendang',chinese:'bak kut teh',indian:'fish curry',iban:'manok pansoh',kadazan:'hinava'}[S.culture]||'curry'}. "Nobody else knows how I make it."`,ch:[
    ['Learn it properly',()=>{bump('cre',2);bump('hap',3);parBump(4);return 'Three tries, one burnt pot and a lot of laughing. Now it is yours to pass on.';}],
    ['Ask her to send a WhatsApp voice note',()=>{bump('hap',1);return 'You get a 14-minute voice note. You listen to it twice and never cook it.';}]]},
  {id:'par_house',c:a=>a>=25&&a<=40&&parRel()>=70&&S.country==='MY'&&!S.assets.houses.length,once:1,t:'Help with the down payment',
   x:()=>`${parWho(1)} call${livePar().length>1?'':'s'} you home for a "serious talk". They have been saving quietly for years and want to give you ${fmt(parGift())} for the down payment on your first home.`,ch:[
    ['Accept, with a big hug',()=>{S.money+=parGift();parBump(3);bump('hap',4);return 'A long hug, a few tears, and a promise to have them over every week.';}],
    ['Thank them, but say no',()=>{bump('dis',2);parBump(2);return 'They insist, you refuse, and they are secretly proud of you.';}]]},
  {id:'par_anniv',c:a=>a>=22&&S.parents.every(p=>p.alive)&&S.parenting!=='Divorced'&&parRel()>=55&&S.parents[0].age>=55,once:1,t:'Their 30th anniversary',
   x:'Your parents\' 30th wedding anniversary is coming up. They say they do not want any fuss.',ch:[
    ['Throw a surprise dinner',()=>{S.money-=a2c(1500);parBump(10);bump('hap',4);return 'Relatives, old friends and a slideshow of embarrassing photos. Your dad gives a speech nobody expected.';}],
    ['Send a sticker in the family group',()=>{parBump(-4);return 'Your mum replies with a thumbs up. Your aunt asks why you did not organise anything.';}]]},
  {id:'par_fight',c:a=>a>=13&&a<=17&&parRel()>=0&&parRel()<60,t:'A shouting match',
   x:()=>{FP=pick(livePar());return `Your ${momDad(FP)} finds your phone at 2am and your test results on the same day. Voices are raised. Doors are slammed.`;},ch:[
    ['Apologise the next morning',()=>{FP.rel=clamp(FP.rel+8);bump('dis',1);return 'A plate of nasi lemak is waiting for you on the table. Nothing more needs to be said.';}],
    ['Ask for a calm talk tonight',()=>{if(roll('cha')>.5){FP.rel=clamp(FP.rel+12);return 'You both say what you really feel. It is the best talk you have had in years.';}FP.rel=clamp(FP.rel-3);return 'It starts calm and ends loud. At least you tried.';}],
    ['Lock yourself in your room',()=>{FP.rel=clamp(FP.rel-8);bump('hap',-3);return 'A week of silent dinners. Dinner is very, very quiet.';}]]},
  {id:'par_career',c:a=>a===17&&S.country==='MY'&&parAlive(),once:1,t:'"Be a doctor, ah"',
   x:()=>`${parWho(1)} ${livePar().length>1?'have':'has'} already told the relatives what you will be: a doctor, a lawyer or an engineer. You are not so sure.`,ch:[
    ['Promise to try your best',()=>{parBump(6);bump('dis',1);return 'They beam. The pressure is on.';}],
    ['Tell them you want your own path',()=>{if(roll('cha')>.55){parBump(2);bump('hap',3);return 'It takes a long dinner, but they come round. "Just make sure you can feed yourself."';}parBump(-10);bump('hap',-2);return 'The house goes silent for a week.';}]]},
  {id:'par_disapprove',c:a=>a>=18&&a<=35&&S.partner&&S.partner.alive!==false&&S.partner.status==='dating'&&parRel()>=0&&parRel()<65,once:1,t:'They don\'t approve',
   x:()=>`${parWho(1)} ${livePar().length>1?'have':'has'} heard about ${esc(S.partner.name)}. "What does their family do? Where are they from?" The message is clear: end it.`,ch:[
    ['Bring them home for dinner',()=>{if(!S.partner)return 'That moment has passed.';if(roll('cha')>.5){parBump(8);S.partner.rel=clamp(S.partner.rel+4);return `${esc(S.partner.name)} charms everyone and even helps wash up. "When are they coming again?"`;}parBump(-4);S.partner.rel=clamp(S.partner.rel-4);return 'The dinner is awkward. Very awkward.';}],
    ['Stand by your partner',()=>{if(!S.partner)return 'That moment has passed.';S.partner.rel=clamp(S.partner.rel+8);parBump(-12);return 'Your partner is touched. Home goes quiet.';}]]},
  {id:'par_hospital',c:a=>a>=25&&parRel()>=0&&parRel()<40&&livePar().some(p=>p.age>=60),once:1,t:'You hear it from a cousin',
   x:()=>{FP=pick(livePar().filter(p=>p.age>=60));return `Your cousin mentions that your ${momDad(FP)} was in hospital last week. Nobody told you.`;},ch:[
    ['Rush home',()=>{S.money-=a2c(400);FP.rel=clamp(FP.rel+15);bump('hap',-2);return `Your ${momDad(FP)} pretends to be annoyed that you came, but cannot stop smiling.`;}],
    ['Send money for the bills',()=>{S.money-=a2c(1500);FP.rel=clamp(FP.rel+3);return 'The bills are paid. The distance stays.';}],
    ['Call them next week',()=>{FP.rel=clamp(FP.rel-5);bump('hap',-3);return 'Next week becomes next month.';}]]},
  {id:'par_balik',c:a=>a>=22&&!S.withParents&&S.country==='MY'&&parAlive(),t:'Balik kampung?',
   x:()=>`Your ${momDad(FP=pick(livePar()))} calls: "Coming home for ${CULTURES[S.culture].fest} this year or not?"`,ch:[
    ['Of course',()=>{S.money-=a2c(300);parBump(7);bump('hap',3);return 'Eight hours in the jam, then home cooking and the whole family under one roof.';}],
    ['Too busy with work this year',()=>{parBump(-7);return `"Never mind lah." It is the way they say it.`;}]]},
  {id:'k_card',c:a=>liveKids(5,10).some(k=>k.rel>=60),t:'A card for you',
   x:()=>{FK=pick(liveKids(5,10).filter(k=>k.rel>=60));return `${esc(FK.name)} hands you a crumpled card covered in glitter: "To the best ${S.gender==='M'?'Papa':'Mama'} in the world".`;},ch:[
    ['Stick it on the fridge',()=>{bump('hap',4);FK.rel=clamp(FK.rel+3);return 'It stays there for years.';}],
    ['Keep it in your wallet',()=>{bump('hap',5);FK.rel=clamp(FK.rel+3);return 'You will find it again one day, and it will make you cry.';}]]},
  {id:'k_door',c:a=>liveKids(13,17).some(k=>k.rel<60),t:'A slammed door',
   x:()=>{FK=pick(liveKids(13,17).filter(k=>k.rel<60));return `${esc(FK.name)} storms upstairs after dinner and slams the bedroom door. Something is wrong, but they will not say what.`;},ch:[
    ['Knock and talk',()=>{if(roll('cha')>.5){FK.rel=clamp(FK.rel+12);return `It is a friend who betrayed them. You listen. ${esc(FK.name)} hugs you for the first time in months.`;}FK.rel=clamp(FK.rel-2);return '"You wouldn\'t understand!" Maybe next time.';}],
    ['Take away their phone',()=>{FK.rel=clamp(FK.rel-10);FK.stats.dis=clamp((FK.stats.dis||40)+5);return 'The house is quieter. Colder, too.';}],
    ['Give them space',()=>{FK.rel=clamp(FK.rel-2);return 'They come down for supper at 11pm. Nobody mentions it.';}]]},
  {id:'k_vape',c:a=>liveKids(14,17).length>0,once:1,t:'Caught vaping',
   x:()=>{FK=pick(liveKids(14,17));return `The school calls: ${esc(FK.name)} was caught vaping in the toilet.`;},ch:[
    ['Talk it through calmly',()=>{FK.rel=clamp(FK.rel+4);FK.stats.dis=clamp((FK.stats.dis||40)+2);return 'They promise to stop. You decide to believe them.';}],
    ['Ground them for a month',()=>{FK.rel=clamp(FK.rel-8);FK.stats.dis=clamp((FK.stats.dis||40)+6);return 'A month of sulking. But no more vaping.';}],
    ['Pretend it never happened',()=>{FK.stats.dis=clamp((FK.stats.dis||40)-5);return 'The school calls again next month.';}]]},
  {id:'k_advice',c:a=>liveKids(22,45).some(k=>k.rel>=65),t:'Asking for advice',
   x:()=>{FK=pick(liveKids(22,45).filter(k=>k.rel>=65));return `${esc(FK.name)} calls late at night. They have a job offer in Singapore and do not know what to do. "What would you do?"`;},ch:[
    ['"Go. Chase it."',()=>{FK.rel=clamp(FK.rel+5);bump('hap',2);return 'They go, and video call you every Sunday.';}],
    ['"Stay close to family."',()=>{FK.rel=clamp(FK.rel+3);return 'They stay, and drop by for dinner every week.';}]]},
  {id:'k_noshow',c:a=>a>=50&&liveKids(22).some(k=>k.rel<40),t:'An empty seat',
   x:()=>{FK=pick(liveKids(22).filter(k=>k.rel<40));return `${esc(FK.name)} will not be home for ${CULTURES[S.culture].fest} this year. "Busy with work." It is the third year in a row.`;},ch:[
    ['Call and say you miss them',()=>{if(roll('cha')>.4){FK.rel=clamp(FK.rel+12);bump('hap',3);return 'A long pause, then: "I miss you too." They come home after all.';}FK.rel=clamp(FK.rel+3);bump('hap',-2);return 'An awkward call. But it is a start.';}],
    ['Say nothing',()=>{FK.rel=clamp(FK.rel-3);bump('hap',-5);return 'You set one plate less at the table.';}]]},
  {id:'k_care',c:a=>a>=65&&liveKids(25).some(k=>k.rel>=70),t:'The children take turns',
   x:()=>`Your children have worked out a rota. Someone drops by every day, and they insist on giving you ${fmt(a2c(500))} a month.`,ch:[
    ['Let them spoil you',()=>{S.money+=a2c(6000);bump('hap',6);bump('hlt',2);return 'Grandchildren on weekends and someone to check your blood pressure. A good life.';}],
    ['Insist you are fine on your own',()=>{bump('hap',3);kidBump(-2,liveKids(25));return 'You win the argument. They visit anyway.';}]]},
  {id:'k_oldfolks',c:a=>a>=72&&liveKids(25).length>0&&liveKids(25).every(k=>k.rel<35),once:1,t:'"A nice place for you"',
   x:'Your children come together for the first time in years. They have found an old folks\' home in Cheras. "It has nurses and activities. It is for the best."',ch:[
    ['Agree quietly',()=>{bump('hap',-10);bump('hlt',2);log('Moved into an old folks\' home.','big');return 'The nurses are kind. Visitors are rare.';}],
    ['Refuse and stay at home',()=>{bump('hap',-4);kidBump(-5,liveKids(25));return 'You stay in the house, alone with the photo albums.';}]]},
  // Cash aid for B40 households: the child sees the family get it, the adult applies. Scheme names follow the real year.
  {id:'bantuan',c:a=>a<18&&S.country==='MY'&&S.year>=2012&&S.group==='B40'&&parAlive(),t:'Bantuan for the family',
   x:()=>`Your family qualifies for ${aidName()} this year. The money lands in your parents' bank account, and there is a long talk at the dinner table about what to do with it.`,ch:[
    ['Ask for new school shoes',()=>{bump('hap',3);return 'New school shoes from Bata. They squeak in the corridor for a week and you love them.';}],
    ['Tell them to pay the bills first',()=>{bump('dis',1);parBump(4);return 'The electricity bill is paid on time for once. Your parents are proud of you.';}]]},
  {id:'bantuan_adult',c:a=>a>=21&&S.country==='MY'&&S.year>=2012&&S.myCitizen&&incomeMonthly()<5000*infl()&&netWorth()<300000*infl(),t:'Bantuan approved',
   x:()=>`Your application for ${aidName()} is approved. ${fmt(Math.round(1200*infl()))} will be paid into your bank account.`+(S.year>=2024?' There is also SARA credit on your MyKad for groceries at the kedai runcit.':''),ch:[
    ['Pay the bills and buy groceries',()=>{S.money+=Math.round(1200*infl());bump('hap',2);return 'Rent paid, rice and cooking oil stocked up. One less thing to worry about this month.';}],
    ['Treat the family to a makan',()=>{S.money+=Math.round(600*infl());bump('hap',5);bump('cha',1);return 'Ikan bakar by the river for everyone. Half the money is gone, but the whole table is smiling.';}]]},
  {id:'mlm',c:a=>a>=20&&a<=65,once:1,t:'A "business opportunity"',x:'An old schoolmate invites you to a scheme with "guaranteed 30% monthly returns". Just bring in two friends!',ch:[
    ['Invest RM 5,000',()=>{S.money-=a2c(5000);bump('hap',-4);return 'Three months later the founder vanishes. So does your money.';}],['Politely decline',()=>{addAch('scamProof');return 'Guaranteed high returns are a classic sign of a scam. Smart move.';}]]},
  {id:'macau',c:a=>a>=25&&S.country==='MY',once:1,t:'A call from the "police"',x:'A caller says your bank account is linked to money laundering. Transfer your savings to a "safe account" now or be arrested.',ch:[
    ['Transfer the money',()=>{const l=Math.max(0,Math.min(S.money*.5,60000*infl()));S.money-=l;bump('hap',-8);return 'It was a Macau scam. You lose '+fmt(l)+'.';}],['Hang up and call 997 (NSRC)',()=>{addAch('scamProof');bump('dis',1);return 'The National Scam Response Centre confirms it\'s a scam. Real police never ask you to move money.';}]]},
  {id:'accident',c:()=>S.assets.cars.length>0,t:'Fender-bender',x:'Someone rear-ends you at a roundabout.',ch:[
    ['Settle on the spot',()=>{S.money-=a2c(1500);return 'You agree on cash. Quick, but your bumper costs more than expected.';}],['Make a police report and claim insurance',()=>{S.money-=a2c(300);bump('hap',-1);return 'A whole afternoon at the station, but insurance covers it.';}]]},
  {id:'borrow',c:a=>a>=25&&S.money>a2c(6000),t:'Cousin needs money',x:'A cousin asks to borrow RM 5,000 (scaled) for a "sure-win" business.',ch:[
    ['Lend it',()=>{const amt=a2c(5000);S.money-=amt;if(chance(.4)){S.money+=amt;return 'Surprise: they pay you back in full a year later.';}return 'You never see that money again.';}],['Say no',()=>{bump('cha',-1);return 'Family dinners are a little awkward for a while.';}]]},
  {id:'checkup',c:a=>a>=35,t:'Health screening',x:'Your health screening shows high blood pressure and cholesterol.',ch:[
    ['See a doctor and change your diet',()=>{bump('hlt',5);bump('hap',-1);return 'Less nasi lemak, more vegetables and walking.';}],['Ignore it',()=>{bump('hlt',-5);return 'You tell yourself it\'s fine.';}]]},
  {id:'marathon',c:a=>a>=18&&a<=60,t:'Marathon challenge',x:'Friends sign up for a city marathon.',ch:[
    ['Train and run',()=>{bump('ath',3);bump('hlt',3);bump('hap',2);return 'You cross the finish line. Your legs disagree with your pride.';}],['Cheer them on',()=>'You hold up a sign at kilometre 30.']]},
  {id:'viral',c:a=>a>=16&&a<=45,t:'You went viral!',x:'Your video of making nasi lemak at 6am goes viral.',ch:[
    ['Lean into it',()=>{bump('cha',3);S.money+=a2c(RI(500,5000));return 'Brands slide into your DMs. A content-creator career is now an option.';}],['Stay low-key',()=>'Fame fades in a week.']]},
  {id:'durian',c:a=>a>=6,t:'Durian season',x:'Your neighbour brings over a basket of Musang King.',ch:[
    ['Durian party!',()=>{bump('hap',4);bump('hlt',-1);return 'The whole street smells of durian. Worth it.';}],['Politely pass',()=>'More for everyone else.']]},
  {id:'burnout',c:()=>S.otYrs>=2,t:'Burning out',x:'Months of overtime have left you exhausted.',ch:[
    ['Take leave',()=>{bump('hap',6);bump('hlt',4);S.otYrs=0;return 'Two weeks off. You remember what weekends feel like.';}],['Push through',()=>{bump('hlt',-6);if(S.job)S.job.lvl+=1;return 'Your boss is impressed. Your body is not.';}]]},
  {id:'oldparents',c:a=>a>=35&&S.parents.some(p=>p.alive&&p.age>=70),once:1,t:'Ageing parents',x:'Your parents are getting older and need more help.',ch:[
    ['Move them in with you',()=>{bump('hap',2);S.money-=a2c(5000);return 'Three generations under one roof. Busy, but warm.';}],['Hire a caregiver',()=>{S.money-=a2c(18000);return 'A caregiver helps them daily. You visit on weekends.';}],['Visit every weekend',()=>{bump('hap',1);bump('hlt',-1);return 'Long drives every Saturday, but they love seeing you.';}]]},
  {id:'reunion',c:a=>a>=30,t:'School reunion',x:'Your SPM batch is organising a reunion dinner.',ch:[
    ['Go',()=>{bump('cha',2);bump('hap',3);if(!S.partner&&chance(.3))qFront(meetModal());return 'Everyone looks older, except the class clown.';}],['Skip it',()=>'You like the group chat photos instead.']]},
  {id:'startup',c:a=>a>=22&&a<=55&&S.stats.cre>=55&&(!S.job||S.job.id!=='entrepreneur'),t:'A business idea',x:'You have an idea for a business that won\'t leave your head.',ch:[
    ['Quit and start it',()=>{if(S.money<30000*infl())return 'You need at least '+fmt(30000*infl())+' in capital. Save up first.';S.money-=30000*infl();S.job={id:'entrepreneur',level:0,years:0,lvl:0,bonus:1};log('Started your own business.','big');return 'You register a Sdn Bhd and get to work.';}],['Keep it as a side project',()=>{const g=a2c(RI(0,8000));S.money+=g;return 'Weekend hustle earns '+fmt(g)+' this year.';}]]},
  {id:'transfer',c:a=>!!S.job&&a>=25&&a<=45&&S.country==='MY'&&EDU_RANK[S.edu.level]>=3&&!JOBS[S.job.id].myOnly,t:'Regional role',x:'Your company offers you a regional role from the KL office, covering Singapore, Jakarta and Bangkok. Lots of flying.',ch:[
    ['Accept the role',()=>{if(!S.job)return 'That no longer matters now.';S.job.bonus=(S.job.bonus||1)*1.2;bump('hlt',-2);if(S.partner)S.partner.rel=clamp(S.partner.rel-5);return 'A 20% raise and a lot of airport lounges. Your family sees less of you.';}],['Decline',()=>'You stay close to family.']]},
  {id:'kidwin',c:()=>S.kids.some(k=>{const ka=S.year-k.born;return ka>=10&&ka<=17;}),t:'Proud parent',x:()=>{const k=S.kids.find(k=>{const ka=S.year-k.born;return ka>=10&&ka<=17;});return `${esc(k.name)} wins a state-level ${pick(['science fair','debate championship','art competition','badminton tournament'])}!`;},ch:[
    ['Celebrate with a family dinner',()=>{bump('hap',4);S.dyn.rep+=.5;return 'Steamboat for everyone!';}]]},
  {id:'stray',c:a=>a>=10&&S.assets.pets.length<4,t:'A stray kitten',x:'A ginger kitten keeps following you home.',ch:[
    ['Adopt it',()=>{addPet(PETS[0],'Oyen');return 'Meet Oyen, the newest family member.';}],['Bring it to an animal shelter',()=>{bump('cha',1);return 'The shelter finds it a good home.';}]]},
  {id:'midlife',c:a=>a>=40&&a<=52,once:1,t:'Mid-life itch',x:'You feel like you need something new in life.',ch:[
    ['Learn a new skill',()=>{bump('int',3);bump('cre',2);return 'You sign up for evening classes in '+pick(['coding','pottery','photography','cooking'])+'.';}],['Book a big trip',()=>{switchTab('travel');return 'You open the travel tab and start dreaming.';}],['Buy a dream car',()=>{shopTab='cars';switchTab('assets');return 'You start browsing car listings...';}]]},
  {id:'homesick',c:()=>S.country!=='MY',t:'Missing home',x:'You haven\'t had proper roti canai in months.',ch:[
    ['Cook it yourself',()=>{bump('cre',2);S.homesick=clamp(S.homesick-10);return 'It\'s not the mamak\'s, but it\'s close.';}],['Find the Malaysian restaurant in town',()=>{S.money-=a2c(100);S.homesick=clamp(S.homesick-8);return 'Overpriced, but the teh tarik tastes like home.';}]]},
  {id:'garden',c:()=>S.retired,t:'Community garden',x:'Neighbours are starting a community orchid garden.',ch:[
    ['Join them',()=>{bump('hap',5);bump('cha',2);bump('hlt',2);return 'You become the local orchid expert.';}],['Not for you',()=>'You prefer your morning kopi in peace.']]},
  {id:'grandkid',c:()=>S.retired&&S.kids.length>0&&S.money>a2c(25000),t:'Helping a grandchild',x:'Your grandchild needs help with university fees.',ch:[
    ['Pay RM 20,000 (scaled)',()=>{S.money-=a2c(20000);bump('hap',5);S.dyn.rep+=1;return 'They hug you so hard your glasses fall off.';}],['Say you can\'t',()=>'They understand, but you feel a bit guilty.']]},
  {id:'carried',c:a=>a>=18&&a<=28&&S.partner&&S.partner.alive!==false&&S.partner.age>=18&&S.partner.status==='dating'&&!samePartner(),t:'Getting serious',x:()=>`You and ${esc(S.partner.name)} are spending a lot of time alone together.`,ch:[
    ['Be responsible and take it slow',()=>{if(!S.partner)return 'That moment has passed. You are single again.';bump('dis',2);S.partner.rel=clamp(S.partner.rel+3);return 'You talk about the future and agree there is no rush.';}],
    ['Throw caution to the wind',()=>{if(!S.partner)return 'That moment has passed. You are single again.';bump('hap',3);S.partner.rel=clamp(S.partner.rel+6);if(chance(.35)){q(pregModal({stats:S.partner.stats,name:S.partner.name}));return 'A few weeks later, something feels different…';}return 'Nothing comes of it. This time.';}]]},
];
/* ================= stage events (primary → working adult) =================
   Drop-in additions for the random-event pool in malaysian-life-simulator.html.
   Same format as EV: {id, c:(age)=>bool, once?, t:title, x:text|fn, ch:[[label, fn, condFn?, note?], ...]}
   Uses only existing helpers: bump, roll, chance, pick, RI, clamp, a2c, fmt, log, addAch, S.know, studyMult, S.friends, S.langs, S.job, JOBS.
   Merge: paste after the EV array, then:
     EV.push(...EV_STAGE); Object.assign(ICON_EMOJI, EV_STAGE_ICONS);
   (ICON_EMOJI must be defined before this runs; randomEvent() already uses icon 'ev_'+id.)
*/
const inPrimary=a=>a>=7&&a<=12;
const inSecondary=a=>a>=13&&a<=17;
const atUni=()=>!!S.edu.track&&S.edu.track.kind==='uni';
const atCollege=()=>!!S.edu.track; // pre-U, diploma, TVET or degree
const working=a=>!!S.job&&a>=18&&!S.retired;
const office=a=>working(a)&&!JOBS[S.job.id].noEpf;

const EV_STAGE=[
  /* ---------- primary school (7–12) ---------- */
  {id:'p_monitor',c:inPrimary,once:1,t:'Class monitor',x:'Cikgu asks who wants to be the ketua kelas this year.',ch:[
    ['Raise your hand',()=>{bump('cha',2);bump('dis',2);return 'You now write the names of noisy classmates on the whiteboard. Power!';}],
    ['Nominate your best friend',()=>{bump('cha',1);S.friends++;return 'They win, and you become the unofficial penolong ketua.';}],
    ['Hide behind your textbook',()=>'Someone else gets the job.']]},
  {id:'p_spelling',c:inPrimary,t:'Spelling test tomorrow',x:'There\'s a spelling test tomorrow and cartoons are on TV tonight.',ch:[
    ['Practise with Mum',()=>{bump('dis',1);S.know=clamp(S.know+3*studyMult());return 'Mum quizzes you over dinner. You get 10/10!';}],
    ['Watch cartoons',()=>{bump('hap',2);S.know=clamp(S.know-2);return 'You spell "necessary" with three S\'s.';}]]},
  {id:'p_canteen',c:inPrimary,t:'Canteen money',x:'You get RM 2 for recess. Nasi lemak, or save it?',ch:[
    ['Buy nasi lemak and Milo ais',()=>{bump('hap',2);bump('hlt',1);return 'Full tummy, happy afternoon.';}],
    ['Save it in your tabung',()=>{S.money+=a2c(150);bump('dis',2);return 'By the end of the year your piggy bank is heavy.';}],
    ['Spend it all on keropok and sweets',()=>{bump('hap',3);bump('hlt',-1);return 'Your tongue turns blue. Totally worth it.';}]]},
  {id:'p_pengakap',c:inPrimary,once:1,t:'Co-curricular club',x:'Every pupil has to join a uniformed body. Which one?',ch:[
    ['Pengakap (Scouts)',()=>{bump('ath',2);bump('dis',1);return 'Knots, campfires and a very itchy scarf.';}],
    ['Puteri Islam / Girl Guides / St John',()=>{bump('cha',1);bump('dis',2);return 'Marching practice every Saturday morning.';}],
    ['Bulan Sabit Merah (Red Crescent)',()=>{bump('int',1);bump('cha',1);return 'You learn first aid and bandage everyone in sight.';}]]},
  {id:'p_teacherday',c:inPrimary,t:'Teachers\' Day',x:'It\'s Hari Guru on 16 May. Your class is planning a surprise.',ch:[
    ['Make a handmade card',()=>{bump('cre',2);bump('hap',1);return 'Your teacher pins it on the staffroom board.';}],
    ['Perform a song with friends',()=>{bump('cha',2);S.friends++;return 'Off-key, but Cikgu tears up anyway.';}],
    ['Just enjoy the party',()=>{bump('hap',2);return 'Curry puffs, cake and no lessons.';}]]},
  {id:'p_homework',c:inPrimary,t:'Forgot your homework',x:'You realise at the school gate that your workbook is still on the dining table.',ch:[
    ['Own up to the teacher',()=>{bump('dis',2);return 'Cikgu appreciates your honesty. Just bring it tomorrow.';}],
    ['Copy a friend\'s answers before class',()=>{if(chance(.4)){bump('dis',-2);bump('hap',-2);return 'Caught! You both stand outside the class.';}bump('hap',1);return 'Nobody noticed. This time.';}],
    ['Call Mum to bring it',()=>{bump('hap',-1);return 'She brings it, along with a long lecture.';}]]},
  {id:'p_upsr',c:a=>inPrimary(a)&&a>=11&&S.year<=2020&&S.country==='MY',once:1,t:'UPSR is coming',x:'The UPSR exam is next year and everyone is talking about straight As.',ch:[
    ['Join the school\'s extra classes',()=>{bump('hap',-2);S.know=clamp(S.know+6*studyMult());return 'Saturday classes and endless past-year papers.';}],
    ['Study at your own pace',()=>{bump('dis',1);S.know=clamp(S.know+3*studyMult());return 'You keep a steady routine.';}],
    ['Not worried at all',()=>{bump('hap',2);return 'You\'re 11. There are drains to explore.';}]]},
  {id:'p_rain',c:inPrimary,t:'Playing in the rain',x:'A huge thunderstorm hits just as school ends. The field is a giant puddle.',ch:[
    ['Play football in the rain',()=>{bump('hap',4);bump('ath',1);if(chance(.35)){bump('hlt',-3);return 'Best game ever, followed by a week of fever.';}return 'Soaked, muddy and grinning.';}],
    ['Wait under the shelter',()=>'You watch the others from the corridor.']]},
  {id:'p_pet',c:a=>inPrimary(a),once:1,t:'Fish from the pasar malam',x:'A stall at the pasar malam sells tiny fish in plastic bags.',ch:[
    ['Beg your parents for one',()=>{bump('hap',3);bump('dis',1);return 'You name it Nemo and feed it twice a day.';}],
    ['Win a goldfish at the game stall',()=>{if(roll('luck')>.5){bump('hap',4);return 'Bullseye! You go home with a goldfish.';}return 'You lose every ring toss.';}]]},
  {id:'p_tuisyen',c:inPrimary,t:'Report card day',x:'Your report card comes home. Your parents look at the Maths grade for a very long time.',ch:[
    ['Promise to try harder',()=>{bump('dis',2);S.know=clamp(S.know+2);return 'You set up a little study corner in your room.';}],
    ['Point out your Art grade instead',()=>{bump('cre',1);bump('cha',1);return 'It\'s an A! The Maths conversation is postponed.';}],
    ['Hide it until Dad signs without reading',()=>{if(chance(.5)){bump('hap',-3);return 'He reads it. You lose TV for a month.';}return 'Signed. Phew.';}]]},

  /* ---------- secondary school (13–17) ---------- */
  {id:'s_band',c:inSecondary,once:1,t:'Joining the school band',x:'The brass band is short of members before the district competition.',ch:[
    ['Join the band',()=>{bump('cre',3);bump('dis',2);S.friends++;return 'You learn the trumpet and practise until your lips go numb.';}],
    ['Join the debate team instead',()=>{bump('cha',3);bump('int',1);return 'You argue with everyone for the next three years.';}],
    ['Stick to studying',()=>{S.know=clamp(S.know+3);return 'More time for revision.';}]]},
  {id:'s_phone',c:inSecondary,t:'Phone confiscated',x:'A teacher catches you using your phone during class and takes it.',ch:[
    ['Apologise and wait it out',()=>{bump('dis',2);bump('hap',-2);return 'You get it back at the end of term, battery dead.';}],
    ['Ask your parents to collect it',()=>{bump('hap',-3);return 'Very awkward meeting with the discipline teacher.';}],
    ['Use your old backup phone',()=>{bump('hap',1);bump('dis',-1);return 'Nobody can stop you. Except your grades.';}]]},
  {id:'s_trial',c:a=>a===17&&S.country==='MY',once:1,t:'SPM trial exams',x:'The trial exams are next month. Your friends are forming a study group.',ch:[
    ['Join the study group',()=>{S.know=clamp(S.know+5*studyMult());bump('cha',1);S.friends++;return 'Late nights at the mamak with notes and teh tarik.';}],
    ['Study alone at home',()=>{S.know=clamp(S.know+5*studyMult());bump('hap',-2);return 'Quiet, focused and a little lonely.';}],
    ['Just wing it',()=>{bump('hap',2);S.know=clamp(S.know-3);return 'The trial results are a wake-up call.';}]]},
  {id:'s_canteenbiz',c:inSecondary,t:'Side hustle at school',x:'Your friends will pay for snacks you bring from home.',ch:[
    ['Start selling',()=>{if(chance(.3)){bump('dis',-2);return 'The discipline teacher shuts down your business. Contraband!';}S.money+=a2c(RI(200,800));bump('cre',2);return 'Your Mum\'s kuih sells out every morning.';}],
    ['Stay out of trouble',()=>{bump('dis',1);return 'You leave the entrepreneurship for later.';}]]},
  {id:'s_cheat',c:inSecondary,t:'Leaked exam paper',x:'A WhatsApp group is sharing what claims to be tomorrow\'s exam paper.',ch:[
    ['Report it to a teacher',()=>{bump('dis',3);bump('cha',-1);return 'The exam is rescheduled. Some classmates suspect you.';}],
    ['Look at it',()=>{if(chance(.5)){bump('hap',-4);bump('dis',-3);return 'It was fake, and you studied the wrong chapters.';}S.know=clamp(S.know+2);bump('dis',-2);return 'It was real. You feel uneasy about the A.';}],
    ['Ignore it and study properly',()=>{S.know=clamp(S.know+3*studyMult());bump('dis',2);return 'You trust your own preparation.';}]]},
  {id:'s_sukma',c:a=>inSecondary(a)&&S.stats.ath>=60,once:1,t:'State team trials',x:'Your coach thinks you could make the state team for MSSM.',ch:[
    ['Go for the trials',()=>{if(roll('ath')>.6){bump('ath',3);bump('hap',5);log('Selected for the state team at MSSM.','big');return 'You\'re in! You get a state jersey and a lot of early mornings.';}bump('ath',1);return 'You just miss the cut. Next year!';}],
    ['Focus on studies',()=>{S.know=clamp(S.know+3);return 'Your coach is disappointed but understands.';}]]},
  {id:'s_hair',c:inSecondary,t:'Spot check',x:'There\'s a surprise hair and uniform check at assembly. Your hair is definitely too long.',ch:[
    ['Accept the punishment',()=>{bump('dis',2);bump('look',-2);return 'The discipline teacher gives you a free "haircut". It\'s uneven.';}],
    ['Hide at the back of the line',()=>{if(chance(.5)){bump('hap',-3);return 'Spotted. Detention plus a haircut.';}bump('hap',1);return 'You escape. The legend grows.';}]]},
  {id:'s_tiktok',c:inSecondary,t:'Dance video challenge',x:'Your friends want to film a dance trend in the school corridor.',ch:[
    ['Film it',()=>{bump('cha',2);bump('hap',2);if(chance(.25)){bump('dis',-1);return 'It gets 50k views, and the principal is one of them.';}return 'It does well in the class group chat.';}],
    ['Be the camera person',()=>{bump('cre',2);return 'Your editing skills impress everyone.';}],
    ['Pass',()=>'You protect your future reputation.']]},
  {id:'s_breakup',c:a=>inSecondary(a)&&!!S.partner,t:'Exam stress and love',x:()=>`${esc(S.partner.name)} says you never have time for them since exam season started.`,ch:[
    ['Make time for them',()=>{if(!S.partner)return 'That moment has passed. You are single again.';S.partner.rel=clamp((S.partner.rel||50)+10);S.know=clamp(S.know-2);return 'You go for ABC together after school. Things feel better.';}],
    ['Explain studies come first',()=>{if(!S.partner)return 'That moment has passed. You are single again.';if(chance(.5)){log('Broke up with '+S.partner.name+'.');S.partner=null;bump('hap',-5);return 'You break up. Sad songs on repeat for weeks.';}return 'They understand. You promise a date after SPM.';}]]},
  {id:'s_volunteer',c:inSecondary,t:'Gotong-royong',x:'Your school organises a gotong-royong to clean up the nearby river.',ch:[
    ['Join in',()=>{bump('hlt',1);bump('cha',2);bump('hap',2);return 'You pull out three tyres and a shopping trolley.';}],
    ['Pretend to be sick',()=>{bump('dis',-1);return 'You stay home. The group photo is missing you.';}]]},
  {id:'s_careerday',c:a=>a>=15&&a<=17,t:'Career day',x:'Professionals visit the school to talk about their jobs.',ch:[
    ['Talk to the doctor',()=>{bump('int',1);return 'Long years, but you find it inspiring.';}],
    ['Talk to the game designer',()=>{bump('cre',2);return 'You didn\'t know that was a real job!';}],
    ['Talk to the entrepreneur',()=>{bump('cha',1);bump('cre',1);return 'They started with a nasi lemak stall. Now they own twelve.';}]]},

  /* ---------- college / university ---------- */
  {id:'u_hostel',c:a=>atCollege()&&a>=17&&a<=26,once:1,t:'Hostel roommate',x:'Your new hostel roommate plays loud music until 2am.',ch:[
    ['Talk it out',()=>{if(roll('cha')>.45){S.friends++;bump('cha',2);return 'They didn\'t realise. You become good friends.';}bump('hap',-2);return 'They agree, then forget the next night.';}],
    ['Buy earplugs',()=>{S.money-=a2c(30);return 'You learn to sleep through anything.';}],
    ['Ask the warden for a room change',()=>{bump('dis',1);return 'You move to a quieter block.';}]]},
  {id:'u_parttime',c:a=>atCollege()&&a<=28,t:'Part-time job',x:'A café near campus is hiring part-time baristas.',ch:[
    ['Take the job',()=>{S.money+=a2c(RI(3000,6000));bump('cha',1);bump('hap',-1);S.know=clamp(S.know-2);return 'Your latte art is improving. Your sleep is not.';}],
    ['Become a tutor instead',()=>{S.money+=a2c(RI(2000,5000));bump('int',1);return 'Teaching SPM Add Maths pays surprisingly well.';},()=>S.stats.int>=60,'Needs Smarts 60+'],
    ['Focus on studies',()=>{S.know=clamp(S.know+3*studyMult());return 'Your CGPA thanks you.';}]]},
  {id:'u_allnighter',c:()=>atCollege(),t:'Finals week',x:'Three exams in three days. The 24-hour McDonald\'s is calling.',ch:[
    ['Pull an all-nighter',()=>{S.know=clamp(S.know+4);bump('hlt',-3);return 'You survive on Nescafé and panic.';}],
    ['Study smart and sleep',()=>{S.know=clamp(S.know+3*studyMult());bump('hlt',1);bump('dis',1);return 'A rested brain remembers more.';}],
    ['Accept your fate',()=>{bump('hap',2);S.know=clamp(S.know-3);return 'You pray for bell curves.';}]]},
  {id:'u_club',c:a=>atUni()&&a<=26,once:1,t:'Society elections',x:'You\'re nominated for president of a student society.',ch:[
    ['Run for president',()=>{if(roll('cha')>.5){bump('cha',3);bump('dis',2);log('Elected president of a student society.');return 'You win! Your CV just got a lot stronger.';}bump('hap',-2);return 'You lose by six votes.';}],
    ['Be the treasurer instead',()=>{bump('int',1);bump('dis',1);return 'You manage a budget of RM 2,000 and a lot of receipts.';}],
    ['Stay a regular member',()=>{bump('hap',1);return 'You enjoy the events without the stress.';}]]},
  {id:'u_exchange',c:a=>atUni()&&a<=26&&S.country==='MY',once:1,t:'Student exchange',x:'Your university offers a one-semester exchange in Japan or Korea.',ch:[
    ['Go on exchange',()=>{S.money-=a2c(8000);bump('cha',3);bump('cre',2);bump('hap',5);return 'Cherry blossoms, convenience stores and new friends from around the world.';}],
    ['Stay and finish early',()=>{S.know=clamp(S.know+2);return 'You stay on track for graduation.';}]]},
  {id:'u_ptptn',c:a=>atUni()&&S.ptptn>0,t:'PTPTN money arrives',x:'Your PTPTN loan instalment just landed in your bank account.',ch:[
    ['Save it for fees and books',()=>{bump('dis',2);return 'Responsible. Future you is grateful.';}],
    ['Buy a new phone',()=>{S.money-=a2c(3000);bump('hap',3);return 'Shiny new phone. Shiny new debt.';}],
    ['Treat your friends to dinner',()=>{S.money-=a2c(400);bump('cha',2);bump('hap',2);return 'Everyone remembers that night at the seafood restaurant.';}]]},
  {id:'u_lecturer',c:()=>atCollege(),t:'Strict lecturer',x:'Your lecturer marks you absent for being two minutes late, for the third time.',ch:[
    ['Apologise and set three alarms',()=>{bump('dis',3);return 'You are never late again.';}],
    ['Argue your case',()=>{if(roll('cha')>.55){bump('cha',2);return 'They let it go, impressed by your argument.';}bump('hap',-2);return 'You get a warning letter. One more and you\'re barred from the final exam.';}],
    ['Ask a friend to sign you in next time',()=>{if(chance(.4)){bump('dis',-3);bump('hap',-3);return 'You both get caught and called to the dean\'s office.';}return 'It works. For now.';}]]},
  {id:'u_hackathon',c:a=>atCollege()&&a<=28&&S.stats.cre>=45,t:'Hackathon weekend',x:'A tech company is running a 48-hour hackathon with a RM 10,000 prize.',ch:[
    ['Form a team and compete',()=>{bump('cre',2);bump('int',1);bump('hlt',-1);if(roll('cre')>.6){S.money+=a2c(3000);log('Won a hackathon prize.','big');return 'Your team wins! Recruiters ask for your CV.';}return 'No prize, but you learn a lot and eat a lot of free pizza.';}],
    ['Rest instead',()=>{bump('hlt',1);return 'A slow weekend of sleep and Netflix.';}]]},
  {id:'u_fyp',c:()=>atUni()&&S.edu.track.left<=1,once:1,t:'Final year project',x:'Your final year project supervisor is impossible to reach.',ch:[
    ['Camp outside their office',()=>{bump('dis',2);S.know=clamp(S.know+3);return 'Persistence pays off. You get your feedback.';}],
    ['Figure it out yourself',()=>{bump('int',2);bump('hap',-2);return 'You learn more than you ever expected.';}],
    ['Change supervisor',()=>{bump('cha',1);S.know=clamp(S.know-2);return 'A fresh start, with a lot of catching up.';}]]},
  {id:'u_convo',c:()=>atUni()&&S.edu.track.left<=1,once:1,t:'Convocation photos',x:'Graduation is coming. Your family wants to rent the full robe and book a studio photo.',ch:[
    ['Go all out with the family',()=>{S.money-=a2c(500);bump('hap',4);return 'Your grandmother brings tissues and a flower bouquet bigger than you.';}],
    ['Keep it simple',()=>{bump('hap',2);return 'A few phone photos at the faculty sign.';}]]},

  /* ---------- working adult ---------- */
  {id:'w_firstpay',c:a=>working(a)&&a<=30,once:1,t:'First payslip',x:'Your first full salary just came in!',ch:[
    ['Give some to your parents',()=>{S.money-=a2c(500);bump('hap',3);bump('cha',1);return 'Your Mum pretends not to cry.';},()=>S.parents.some(p=>p.alive),'Needs a living parent'],
    ['Start saving and investing',()=>{bump('dis',3);return 'You open an ASB account and feel very grown up.';}],
    ['Treat yourself',()=>{S.money-=a2c(800);bump('hap',4);return 'New shoes and a fancy dinner. You earned it.';}]]},
  {id:'w_jam',c:a=>working(a)&&S.country==='MY',t:'Traffic jam',x:'Rain, an accident on the highway and a 2-hour crawl to the office.',ch:[
    ['Switch to the LRT/MRT',()=>{bump('hlt',1);bump('hap',1);return 'Standing room only, but you\'re never late again.';}],
    ['Leave home at 6am',()=>{bump('dis',2);bump('hlt',-1);return 'You beat the jam but sleep in the car park.';}],
    ['Ask to work from home',()=>{if(roll('cha')>.5){bump('hap',3);return 'Your boss agrees to two WFH days a week.';}return 'Your boss says no. Back to the jam.';}]]},
  {id:'w_dinner',c:office,t:'Annual dinner',x:'It\'s the company annual dinner and there\'s a lucky draw.',ch:[
    ['Go and dress to impress',()=>{bump('cha',2);if(roll('luck')>.65){S.money+=a2c(2000);return 'You win the grand prize: a new TV!';}return 'You win a thermos flask. Classic.';}],
    ['Perform on stage',()=>{bump('cha',3);bump('hap',2);return 'Your karaoke becomes office legend.';}],
    ['Skip it',()=>'You hear the gossip on Monday.']]},
  {id:'w_colleague',c:office,t:'Lazy colleague',x:'A colleague keeps leaving their work for you to finish.',ch:[
    ['Talk to them directly',()=>{if(roll('cha')>.5){bump('cha',2);return 'They didn\'t realise. Things get better.';}bump('hap',-2);return 'They get defensive and the office goes quiet.';}],
    ['Raise it with the manager',()=>{bump('dis',1);return 'The workload is redistributed.';}],
    ['Just do it',()=>{bump('hap',-2);bump('hlt',-1);if(S.job)S.job.lvl+=.5;return 'Your manager notices you\'re always getting things done.';}]]},
  {id:'w_course',c:office,t:'Company training',x:'HR offers a fully-paid HRD Corp course of your choice.',ch:[
    ['Leadership course',()=>{bump('cha',2);return 'You learn to say "let\'s take this offline" with confidence.';}],
    ['Data and AI skills',()=>{bump('int',2);if(S.job)S.job.lvl+=.5;return 'You automate your boring reports.';}],
    ['Skip it, too busy',()=>{bump('hap',-1);return 'Your inbox wins again.';}]]},
  {id:'w_layoff',c:a=>office(a)&&a>=25,once:1,t:'Restructuring rumours',x:'Rumours say your company is cutting 20% of staff.',ch:[
    ['Update your CV and start looking',()=>{bump('dis',2);qFront(jobModal());return 'You line up interviews just in case.';}],
    ['Work harder to stand out',()=>{bump('hlt',-2);if(roll('dis')>.5){if(S.job)S.job.lvl+=1;return 'You survive the cuts and get some extra responsibility.';}bump('hap',-3);return 'You survive, but the stress takes a toll.';}],
    ['Hope for a VSS package',()=>{if(chance(.4)){S.money+=a2c(30000);S.job=null;log('Took a voluntary separation package.','big');return 'You get a VSS payout. Time for something new.';}return 'No package offered. Business as usual.';}]]},
  {id:'w_raise',c:a=>office(a)&&a>=24,t:'Performance review',x:'It\'s appraisal season. Your manager asks how you think you did this year.',ch:[
    ['Ask for a raise',()=>{if(roll('cha')>.55){S.job.bonus=(S.job.bonus||1)*1.08;bump('hap',3);return 'You get an 8% raise!';}bump('hap',-1);return '"Maybe next year." The classic answer.';}],
    ['Ask for more responsibility',()=>{S.job.lvl+=.5;bump('dis',1);return 'You get a new project and a fancier title.';}],
    ['Just say thank you',()=>'A standard 3% increment.']]},
  {id:'w_house',c:a=>working(a)&&a>=26&&a<=40&&!S.assets.houses.length,once:1,t:'Should you buy a house?',x:()=>'Your friends are all buying condos. '+(parAlive()?'Your parents say renting is "throwing money away".':'Your relatives say renting is "throwing money away".'),ch:[
    ['Start house hunting',()=>{shopTab='houses';switchTab('assets');return 'You start scrolling through property listings...';}],
    ['Keep renting and invest',()=>{bump('dis',1);return 'You stay flexible and keep your savings.';}],
    ['Move back home to save',()=>{S.withParents=true;bump('hap',-1);return 'Free rent. Very little privacy.';},()=>S.parents.some(p=>p.alive),'Needs a living parent']]},
  {id:'w_wedding',c:a=>working(a)&&a>=24&&a<=40,t:'Wedding season',x:'You\'ve been invited to four weddings in one month.',ch:[
    ['Attend them all',()=>{S.money-=a2c(800);bump('cha',2);bump('hap',2);return 'So much nasi minyak and so many angpau envelopes.';}],
    ['Go to the close friends\' ones only',()=>{S.money-=a2c(300);return 'You send gifts to the others.';}]]},
  {id:'w_sidehustle',c:a=>working(a)&&a<=50,t:'Weekend side hustle',x:'A friend suggests driving e-hailing or selling online on weekends.',ch:[
    ['Drive e-hailing',()=>{S.money+=a2c(RI(3000,8000));bump('hlt',-2);bump('hap',-1);return 'Extra cash, and some very interesting passengers.';},()=>S.assets.cars.length>0,'Needs a car'],
    ['Sell things online',()=>{if(roll('cre')>.5){S.money+=a2c(RI(2000,10000));bump('cre',2);return 'Your Shopee store gets five stars!';}S.money-=a2c(1000);return 'Unsold stock fills your living room.';}],
    ['Rest on weekends',()=>{bump('hlt',2);bump('hap',2);return 'Weekends are for family and sleep.';}]]},
];

const EV_STAGE_ICONS={
  ev_p_monitor:'📋',ev_p_spelling:'🔤',ev_p_canteen:'🍛',ev_p_pengakap:'⛺',ev_p_teacherday:'💐',ev_p_homework:'📒',ev_p_upsr:'📝',ev_p_rain:'🌧️',ev_p_pet:'🐟',ev_p_tuisyen:'📄',
  ev_s_band:'🎺',ev_s_phone:'📵',ev_s_trial:'📚',ev_s_canteenbiz:'🍪',ev_s_cheat:'🕵️',ev_s_sukma:'🥇',ev_s_hair:'✂️',ev_s_tiktok:'🎬',ev_s_breakup:'💔',ev_s_volunteer:'🧹',ev_s_careerday:'🧑‍💼',
  ev_u_hostel:'🛏️',ev_u_parttime:'☕',ev_u_allnighter:'🌙',ev_u_club:'🗳️',ev_u_exchange:'✈️',ev_u_ptptn:'💳',ev_u_lecturer:'⏰',ev_u_hackathon:'💻',ev_u_fyp:'📑',ev_u_convo:'🎓',
  ev_w_firstpay:'💵',ev_w_jam:'🚗',ev_w_dinner:'🎤',ev_w_colleague:'😩',ev_w_course:'📈',ev_w_layoff:'📉',ev_w_raise:'💹',ev_w_house:'🏠',ev_w_wedding:'💒',ev_w_sidehustle:'🛵',
};
EV.push(...EV_STAGE,...EV_FOREIGN);Object.assign(ICON_EMOJI,EV_STAGE_ICONS,{ev_f_exchange:'🎒',ev_f_tourist:'🗺️',ev_f_langex:'☕',ev_f_expat:'🧳'});
// work events can resolve after the job is gone (e.g. retrenched earlier the same year)
EV_STAGE.filter(e=>e.id.startsWith('w_')).forEach(e=>{e.ch=e.ch.map(c=>[c[0],()=>S.job?c[1]():'That no longer matters now.',c[2],c[3]]);});
function promote(){const J=JOBS[S.job.id];if(S.job.level<J.levels.length-1){S.job.level++;S.job.lvl=0;log('Promoted to '+J.levels[S.job.level]+'!','big');bump('hap',5);if(S.job.level===J.levels.length-1){addAch('boss');S.dyn.rep+=3;}return 'Promoted to '+J.levels[S.job.level]+'!';}
  const b=salaryBase()*3;S.money+=b;return 'You are already at the top, so you get a '+fmt(b)+' bonus instead.';}
function demote(){const J=JOBS[S.job.id];S.job.lvl=0;bump('hap',-6);if(S.job.level>0){S.job.level--;log('Demoted to '+J.levels[S.job.level]+'.','big');return 'You are demoted to '+J.levels[S.job.level]+'.';}return 'You get a warning letter, and your next promotion is pushed back.';}
const jobIs=(...ids)=>ids.includes(S.job.id)||ids.includes(JOBS[S.job.id].sector);
const FESTS={malay:'Hari Raya',chinese:'Chinese New Year',indian:'Deepavali',iban:'Gawai',kadazan:'Kaamatan'};
const WEV=[
  {id:'bigproject',c:()=>true,t:'The big GLC tender',x:'Your boss puts you in charge of the bid for a big government-linked company contract. The board will be watching.',ch:[
    ['Work nights and weekends to nail it',()=>{bump('hlt',-3);S.otYrs++;if(roll(JOBS[S.job.id].stat)>.5)return 'You win the tender. '+promote();return 'Despite your effort, a rival with better connections wins it. '+demote();}],
    ['Do a solid job in normal hours',()=>{if(chance(.6)){S.job.lvl++;return 'A respectable bid. Your boss notes it in your appraisal.';}return 'It goes fine. Nobody remembers it a month later.';}]]},
  {id:'kabel',c:()=>JOBS[S.job.id].levels.length>1&&S.job.level<JOBS[S.job.id].levels.length-1,t:'"Kabel besar"',x:'A promotion opens up, but the big boss\'s nephew is also in the running. Everyone says he has a "big cable".',ch:[
    ['Join the boss\'s Saturday golf games',()=>{S.money-=a2c(3000);if(roll('cha')>.55)return 'Eighteen holes and many teh tarik later, the boss picks you. '+promote();return 'You spend a fortune on green fees. The nephew gets the job.';}],
    ['Complain to HR',()=>{if(chance(.3))return 'HR reviews the case and finds you were better qualified. '+promote();S.job.lvl=0;S.dyn.rep-=1;return 'Nothing changes, except now you are known as a troublemaker.';}],
    ['Let it go',()=>{bump('hap',-3);return 'The nephew gets the job. You update your LinkedIn profile.';}]]},
  {id:'openhouse',c:()=>true,t:'Open house season',x:()=>`Your boss invites the whole team to their ${FESTS[S.culture]||'Hari Raya'} open house.`,ch:[
    ['Go, and bring a box of kuih',()=>{S.money-=a2c(150);bump('cha',1);S.job.lvl++;return 'You stay three hours and eat four plates of rendang. The boss remembers who came.';}],
    ['Skip it, you need the rest',()=>'Nobody minds. Mostly.']]},
  {id:'kpi',c:()=>!JOBS[S.job.id].noEpf,t:'Year-end KPI appraisal',x:'Appraisal season. Your rating decides your bonus.',ch:[
    ['Argue for the top rating',()=>{if(roll(JOBS[S.job.id].stat)>.55){const b=a2c(RI(4000,15000));S.money+=b;S.job.lvl++;return 'Rated 5 out of 5. Bonus: '+fmt(b)+'.';}bump('hap',-2);return 'Rated 3, "meets expectations". Same as everyone else.';}],
    ['Accept whatever you get',()=>{const b=a2c(RI(1000,3000));S.money+=b;return 'A modest bonus of '+fmt(b)+'.';}]]},
  {id:'mistake',c:()=>true,t:'A costly mistake',x:'A misplaced decimal point in a quotation to a big client in Penang costs the company a lot of money.',ch:[
    ['Own up to it',()=>{if(roll('cha')>.5){bump('cha',1);return 'Your honesty impresses your boss. You keep your position.';}return demote();}],
    ['Quietly blame a colleague',()=>{if(chance(.5)){S.job.lvl++;bump('hap',-2);return 'It works. Your colleague takes the fall, and you sleep badly for a while.';}S.dyn.rep-=2;return 'The WhatsApp group proves it was you. '+demote();}]]},
  {id:'flood',c:()=>true,t:'Banjir kilat',x:'A flash flood hits the city the night before a key deadline. The office basement, and maybe your car, are under water.',ch:[
    ['Wade in and rescue the files',()=>{if(roll('dis')>.5){bump('hlt',-2);S.job.lvl++;return 'Your boss calls you a hero at the next town hall.';}bump('hlt',-6);return 'You catch a fever, and the files are ruined anyway.';}],
    ['Work from home',()=>'You submit from your kitchen table. Fair enough.']]},
  {id:'leave',c:()=>!!FESTS[S.culture],t:'Leave cancelled',x:()=>`Your manager cancels your ${FESTS[S.culture]} leave because of a "very urgent" client request.`,ch:[
    ['Balik kampung anyway',()=>{bump('hap',4);if(chance(.3))return 'Your manager does not forget it. '+demote();return 'Family time wins. Work survives without you.';}],
    ['Stay and work',()=>{bump('hap',-5);S.job.lvl++;return 'You video-call your family from the office. Your manager owes you one.';}]]},
  {id:'posting',c:()=>JOBS[S.job.id].levels.length>1&&S.country==='MY'&&age()<50,t:'Posting to East Malaysia',x:()=>`HQ wants you to lead the new branch in ${pick(['Kota Kinabalu','Kuching','Miri','Sandakan'])} for two years.`,ch:[
    ['Accept the posting',()=>{bump('hap',-2);if(S.partner)S.partner.rel=clamp(S.partner.rel-6);if(chance(.6))return 'You build the branch from scratch. '+promote();S.job.lvl++;return 'Hard work and lots of flights, but HQ is impressed.';}],
    ['Decline, family comes first',()=>'HQ sends someone else.']]},
  {id:'raid',c:()=>jobIs('factory','planter','technician','hawker','entrepreneur')&&S.job.level>=1,t:'Immigration raid',x:'Immigration Department officers raid the site and find workers without valid permits. As a supervisor, you are questioned.',ch:[
    ['Cooperate fully',()=>{S.dyn.rep+=1;if(chance(.75))return 'The company is fined, and you are cleared.';return 'Someone has to take the blame. '+demote();}],
    ['Help the owner hide the records',()=>{if(chance(.4)){S.money-=a2c(10000);S.dyn.rep-=5;bump('hap',-10);S.lastJobId=S.job.id;S.lastJobName=JOBS[S.job.id].name;S.job=null;log('Charged for harbouring undocumented workers. Lost your job.','big');return 'You are charged in court. You pay a heavy fine and lose your job.';}const b=a2c(5000);S.money+=b;return 'The owner slips you an ang pow of '+fmt(b)+' for your "loyalty".';}]]},
  {id:'award',c:()=>S.stats.dis>=50,t:()=>JOBS[S.job.id].sector==='gov'?'Anugerah Perkhidmatan Cemerlang':'Employee of the Year',x:()=>JOBS[S.job.id].sector==='gov'?'You receive the Excellent Service Award (APC) from your department!':'You are named Employee of the Year!',ch:[
    ['Accept the award on stage',()=>{const b=a2c(JOBS[S.job.id].sector==='gov'?1000:5000);S.money+=b;bump('hap',5);S.job.lvl++;S.dyn.rep+=1;return 'Applause, a certificate and '+fmt(b)+'.';}]]},
  {id:'bribe',c:()=>jobIs('gov','eng','trade','finance','law','planter'),t:'"Duit kopi"',x:()=>'A contractor slips you an envelope with '+fmt(a2c(50000))+' to approve their bid.',ch:[
    ['Take the money',()=>{if(chance(.35)){S.money-=a2c(20000);S.dyn.rep-=6;bump('hap',-15);S.lastJobId=S.job.id;S.lastJobName=JOBS[S.job.id].name;S.job=null;log('Arrested by the MACC for taking a bribe. Lost your job.','big');return 'The MACC arrests you a month later. You lose your job and pay a heavy fine.';}S.money+=a2c(50000);bump('hap',-2);return 'The envelope is thick. Nobody finds out… for now.';}],
    ['Refuse and report it to the MACC',()=>{S.dyn.rep+=2;S.job.lvl++;return 'You report it. Management quietly notes your integrity.';}]]},
  {id:'durian',c:()=>true,t:'Durian party',x:'Your boss hosts a Musang King durian party at the office car park.',ch:[
    ['Eat like a champion',()=>{bump('hap',3);bump('cha',1);S.job.lvl++;return 'You finish six seeds and bond with the boss over durian prices.';}],
    ['Politely avoid the smell',()=>'Your boss looks a little hurt.']]},
  {id:'workaccident',c:()=>jobIs('factory','technician','planter','police','athlete','coach','engineer','eng'),t:'Accident at work',x:'Something goes badly wrong on the job and you are hurt. DOSH officers arrive to investigate.',ch:[
    ['Rush to the hospital',()=>{const r=Math.random();if(r<.04+Math.max(0,70-S.stats.hlt)/1000){die();return 'The injuries are too severe. You pass away in hospital.';}
      if(r<.35){bump('hlt',-15);bump('ath',-8);const c=a2c(30000);S.money+=c;return 'A serious injury. You spend months recovering. SOCSO compensation: '+fmt(c)+'.';}bump('hlt',-5);return 'Stitches and a week of MC. You were lucky.';}]]},
  {id:'collapse',c:()=>age()>=35&&(S.otYrs>=1||S.stats.hlt<50),t:'Chest pain at your desk',x:'A sharp pain spreads across your chest during a late meeting.',ch:[
    ['Go to the emergency room now',()=>{bump('hlt',-6);S.money-=a2c(8000);return 'A minor heart attack. The doctors at IJN put in a stent and order you to slow down.';}],
    ['Finish the meeting first',()=>{if(chance(.2+Math.max(0,50-S.stats.hlt)/200)){die();return 'You collapse in the meeting room and never wake up.';}bump('hlt',-12);return 'You make it through, barely. Your doctor is furious.';}]]},
  {id:'scandal',c:()=>!JOBS[S.job.id].stable&&!JOBS[S.job.id].noEpf,t:'Company scandal',x:'The business papers report that your company cooked its accounts. The Securities Commission is investigating.',ch:[
    ['Polish your CV and look elsewhere',()=>{qFront(jobModal());return '';}],
    ['Stay and ride it out',()=>{if(chance(.4)){layoff();return 'The company collapses.';}return 'The storm passes. The company survives, just.';}]]},
  {id:'poach',c:()=>age()<50&&EDU_RANK[S.edu.level]>=2&&!JOBS[S.job.id].noEpf,t:'Headhunter call',x:'A headhunter says a rival in KL wants you, for a 30% raise and much longer hours.',ch:[
    ['Take the offer',()=>{S.job.bonus=(S.job.bonus||1)*1.3;S.job.lvl=0;bump('hlt',-2);if(chance(.2)){layoff();return 'Six months in, the new company restructures.';}return 'New office, new access card, and a 30% raise.';}],
    ['Use it to ask for a raise',()=>{if(roll('cha')>.5){S.job.bonus=(S.job.bonus||1)*1.12;return 'Your boss matches part of it. A 12% raise!';}S.job.lvl=0;return 'Your boss calls your bluff. Awkward.';}],
    ['Stay put',()=>'Safe and steady.']]},
  {id:'startup',c:()=>age()<50&&EDU_RANK[S.edu.level]>=2&&!JOBS[S.job.id].noEpf,t:'Cyberjaya startup offer',x:'A fast-growing startup in Cyberjaya offers you a senior role with share options, at a lower salary.',ch:[
    ['Take the gamble',()=>{if(chance(.25)){const g=a2c(RI(300000,2000000));S.money+=g;log('Startup shares paid out '+fmt(g)+'.','big');return 'The startup is acquired. Your shares pay out '+fmt(g)+'!';}
      if(chance(.45))return 'The startup grows steadily. Long hours, but you learn a lot.';layoff();return 'The startup runs out of money.';}],
    ['Stay put',()=>'Safe and steady.']]},
];
function workEvent(){const pool=WEV.filter(e=>e.c());if(!pool.length)return;const e=pick(pool);
  q({title:typeof e.t==='function'?e.t():e.t,icon:'ev_'+e.id,tag:'Career',text:typeof e.x==='function'?e.x():e.x,choices:e.ch.map(c=>[c[0],()=>S.job?c[1]():'That no longer matters now.'])});}
function parWho(cap){const L=livePar(),w=L.length>1?'your parents':'your '+momDad(L[0]);return cap?w[0].toUpperCase()+w.slice(1):w;}
function parGift(){return Math.round(a2c(S.group==='T20'?100000:S.group==='M40'?30000:8000));}
function aidName(){const y=S.year;return y<=2018?'BR1M (Bantuan Rakyat 1Malaysia)':y<=2020?'Bantuan Sara Hidup (BSH)':y===2021?'Bantuan Prihatin Rakyat':y===2022?'Bantuan Keluarga Malaysia':'Sumbangan Tunai Rahmah (STR)';}
function randomEvent(){const a=age();const pool=EV.filter(e=>e.c(a)&&!(e.once&&S.seen.includes(e.id)));if(!pool.length)return;const e=pick(pool);S.seen.push(e.id);
  q({title:e.t,icon:'ev_'+e.id,text:typeof e.x==='function'?e.x():e.x,choices:e.ch.map(c=>[c[0],()=>e.c(age())?c[1]():'That no longer matters now.',...c.slice(2)])});}

/* ================= achievements & death ================= */
function checkAch(){const nw=netWorth();if(nw>=1e6)addAch('millionaire');if(S.birthGroup==='B40'&&nw>=2e6)addAch('b40t20');
  if(TOWNS[S.town].kampung&&S.assets.houses.some(h=>h.lux))addAch('kampungKLCC');if(S.visited.length>=5)addAch('globetrotter');if(S.everAbroad>=5)addAch('expat');
  if(age()>=100)addAch('centenarian');if(S.assets.pets.length>=3)addAch('petLover');if(S.assets.cars.length>=3)addAch('carCollector');
  if(Object.values(S.langs).filter(v=>v>=60).length>=4)addAch('polyglot');if(S.assets.houses.length)addAch('homeowner');if(S.dyn.gen>=3)addAch('dynasty3');
  if(S.group!=='T20'&&nw>2e6)S.group='T20';else if(S.group==='B40'&&nw>3e5&&age()>=25)S.group='M40';}
function deathChance(){const a=age();if(a<18)return 0;let p=.0004;if(a>=50)p+=Math.pow((a-50)/45,3)*.5;p*=(1.6-S.stats.hlt/100);if(S.stats.hlt<HLT_WEAK)p+=(HLT_WEAK-S.stats.hlt)/HLT_WEAK*.04;if(S.traits.includes('Sickly'))p*=1.3;return Math.min(p,.95);}
function die(){sfx('sad');if(S.job){S.lastJobId=S.job.id;S.lastJobName=JOBS[S.job.id].name;}S.alive=false;MQ=[];autoYears=0;const a=age();log(`Passed away at ${a}.`,'big');if(S.honour==='Tun')log('Given a state funeral. Flags fly at half-mast across the country.','big');
  q({title:'Rest in peace',icon:'m_rip',text:`${esc(dispName())} passed away at the age of ${a} in ${S.year}${S.country==='MY'?'':', in '+ctry().name}.`,choices:[['See life summary',null]]});}

