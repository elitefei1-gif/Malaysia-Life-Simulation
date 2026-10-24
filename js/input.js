'use strict';
// Button handlers (ACT) and the click/keyboard listeners.
/* ================= events ================= */
let musicFrom='s-title'; // the music page's Back returns here (title screen, or the game when opened from Settings)
const ACT={
  toSetup(){showScreen('s-setup');},toTitle(){showScreen('s-title');},
  continue(){const s=load();if(s){S=s;if(S.know==null)S.know=clamp(S.stats.int*.6);MQ=[];cur=null;if(!S.alive){showEnd();return;}showScreen('s-game');render();}},
  randName(){const c=setup.culture==='random'?pick(PLAYABLE):setup.culture;$('#f-name').value=genName(c,setup.gender);},
  beBorn(){setup.rerolls=3;birthDraft=rollBirth();const n=$('#f-name').value.trim();setup.nameNow=n||genName(birthDraft.culture,setup.gender);renderBirth();showScreen('s-birth');},
  reroll(){if(setup.rerolls<=0)return;setup.rerolls--;birthDraft=rollBirth();if(!$('#f-name').value.trim())setup.nameNow=genName(birthDraft.culture,setup.gender);renderBirth();},
  startLife(){S=freshState(birthDraft,{name:setup.nameNow,gender:setup.gender,pref:setup.pref,birthYear:+setup.year});S.polyRule=setup.poly||'law';birthDraft=null;MQ=[];cur=null;tab='life';
    log(`Born in ${TOWNS[S.town].name} to ${S.parents[0].name} and ${S.parents[1].name}.`,'big');if(S.traits.length)log('Born with a special trait: '+S.traits.join(', ')+'.');
    if(S.parenting==='Divorced')log('Your parents separated when you were a baby.');worldTick();S.ap=0;save();showScreen('s-game');render();},
  tab(a){switchTab(a);},mute(){toggleMute();render();},do(a){doAct(a);},next(){autoYears=0;nextYear();},
  auto(){if(cur||!S.alive)return;autoYears=5;runAuto();},
  choose(a){choose(+a);},close(){closeModal();},
  jobs(){qFront(jobModal());showNext();},
  quit(){if(!S.job)return;log('Quit your job as '+JOBS[S.job.id].name+'.','big');S.lastJobId=S.job.id;S.lastJobName=JOBS[S.job.id].name;S.job=null;render();save();},
  retire(){retire();render();save();},
  shop(a){shopTab=a;srClose();render();},showroom(a){showroom(+a);},srnav(a){srNav(+a);},srclose(){srClose();},srnoop(){},srgo(a){srGo(+a);},buyhouse(a){buyHouse(+a);},sellhouse(a){sellHouse(+a);},buycar(a){buyCar(a);},sellcar(a){sellCar(+a);},buypet(a){buyPet(a);},
  sethome(a){S.home=+a;S.withParents=false;log('Moved into your '+S.assets.houses[+a].name.toLowerCase()+'.');render();save();},
  sellstocks(){S.money+=S.stocks;log('Sold your stock portfolio for '+fmt(S.stocks)+'.');S.stocks=0;render();save();},
  toggleParents(){if(!S.withParents&&!S.parents.some(p=>p.alive))return toast('Your parents have passed away.');S.withParents=!S.withParents;log(S.withParents?'Moved back in with your parents.':'Moved out of your parents\' house. Freedom (and rent)!');render();save();},
  trip(a){bookTrip(a);},famtrip(a){famTrip(a);},famtime(a){famTime(a);},move(a){qFront(moveModal(a));showNext();},pr(){qFront(prModal());showNext();},citizen(){qFront(citModal());showNext();},
  gohome(){qFront({title:'Return to Malaysia?',icon:'m_abroad',tag:'Travel',text:S.myCitizen?'You\'ll leave your job abroad and start fresh at home.':'As a former Malaysian, you\'ll return on a long-term visit pass.',choices:[['Fly home',()=>{moveTo('MY');return 'Selamat pulang! Welcome home.';}],['Stay',null]]});showNext();},
  propose(){qFront(proposeModal());showNext();},
  breakup(){const p=S.partner;if(!p)return;if(p.status==='married'){S.money*=.5;log('Divorced '+p.name+'.','big');}else log('Broke up with '+p.name+'.');S.partner=null;bump('hap',-8);render();save();},
  findlove(){if(S.ap<1)return;qFront(loveLevelModal());showNext();},
  findspouse(){if(S.ap<1||!married()||!polyOK()||allSpouses().length>=MAX_SPOUSES)return;S.ap--;qFront(spouseFindModal());showNext();},
  spdate(a){const s=spouses()[+a];if(!s||S.ap<1)return;S.ap--;s.rel=clamp(s.rel+10+S.stats.cha/12);bump('hap',2);toast(pick(['Dinner by the river with ','A long drive with ','Breakfast at the mamak with '])+s.name+'.'+spTurn(s,2,1));render();save();},
  spdiv(a){const s=spouses()[+a];if(!s)return;dropSpouse(s,.5);log('Divorced '+s.name+'.','big');bump('hap',-8);render();save();},
  affair(){if(S.ap<1||!S.partner||S.partner.alive===false||S.affair||age()<18)return;S.ap--;qFront(affairStartModal());showNext();},
  affdate(){affairDate();},
  affend(){const f=S.affair;if(!f)return;S.affair=null;bump('hap',-3);log('Ended the affair with '+f.name+'.');if(S.partner&&S.partner.alive!==false&&chance(.2)){S.affair=f;qFront(caughtModal(`Hurt and angry, ${esc(f.name)} tells ${esc(S.partner.name)} everything.`));showNext();return;}render();save();},
  pref(){if(S.prefChanged)return;qFront(prefModal());showNext();},
  findyoung(){if(S.ap<1)return;S.ap--;if(chance(.8))qFront(meetModal(true));else toast('No luck this time.');render();showNext();},
  restudy(){qFront(restudyModal());showNext();},
  will(){S.money-=1500*infl();S.will=true;log('Wrote a will.');render();save();},
  night(a){const p=a==null||a===''?S.partner:spouses()[+a];if(S.ap<1||age()<18||!p||p.alive===false||p.age<18)return;qFront(nightModal(p));showNext();},
  sptime(){if(S.ap<1||allSpouses().length<2)return;qFront(spTimeModal());showNext();},hookup(){if(S.ap<1||age()<18)return;qFront(hookupModal());showNext();},
  hop(){if(S.ap<1||!canHop()||S.hopYear===S.year)return;qFront(hopModal());showNext();},
  buytitle(){if(S.ap<1||!buyOk()||!buyRich()||TT().buyYear===S.year)return;S.ap--;qFront(buyModal());showNext();},
  poljoin(){qFront(joinModal());showNext();},polwork(){if(S.ap<1||!S.pol)return;S.ap--;S.pol.loy=clamp(S.pol.loy+8);S.pol.sup=clamp(S.pol.sup+3);bump('hap',-1);toast('You give out flyers and fold chairs at the branch office. Party standing up.');render();save();},
  ceramah(){if(S.ap<1||!S.pol)return;S.ap--;bump('cha',1);S.pol.sup=clamp(S.pol.sup+8);if(chance(.1)){S.pol.sup=clamp(S.pol.sup-10);toast('Your joke falls flat and a clip goes viral. Support down.');}else toast('A big crowd under the tent. Charisma and local support up.');render();save();},
  deals(){if(!S.pol)return;qFront(dealsModal());showNext();},hide(){if(!S.pol)return;qFront(hideModal());showNext();},policy(){if(!S.pol||S.pol.policyYear===S.year)return;qFront(policyModal());showNext();},
  callge(){const W=polW();W.snap=1;log('Dissolved Parliament for a snap election.','big');toast('Parliament is dissolved. The election is held next year.');render();save();},
  polquit(){qFront({title:'Retire from politics?',icon:'m_vote',tag:'Politics',text:'You give up your party posts and any seat you hold.',choices:[['Retire',()=>{const P=S.pol;if(P.wasPM&&S.honour!=='Tun')giveHonour('Tun');if(P.rank>=6)S.glcChair=1;log('Retired from politics.','big');S.pol=null;return 'You hand over to the next generation.'+(S.glcChair?' A GLC asks you to be its chairman.':'');}],['Stay',null]]});showNext();},
  payhouse(a){const h=S.assets.houses[+a];if(!h||h.loanLeft<=0||S.money<h.loanLeft)return;S.money-=h.loanLeft;log(`Paid off the home loan on the ${h.name.toLowerCase()} (${fmt(h.loanLeft)}).`,'big');h.loanLeft=0;h.pay=0;bump('hap',4);toast('Home loan paid off. No more monthly instalments!');render();save();},
  paycar(a){const c=S.assets.cars[+a];if(!c||c.loanLeft<=0)return;const amt=c.loanLeft*.92;if(S.money<amt)return;S.money-=amt;log(`Settled the hire purchase on the ${c.name} early (${fmt(amt)}, after an interest rebate).`);c.loanLeft=0;bump('hap',2);toast('Car loan settled. You got an 8% early-settlement rebate.');render();save();},
  stmton(){S.showStmt=true;render();save();},
  ptpay(){if(S.money<S.ptptn)return;S.money-=S.ptptn;S.ptptn=0;S.ptptnMiss=0;if(S.travelBan){S.travelBan=false;log('Travel ban lifted after settling PTPTN.','big');}log('Paid off the PTPTN loan.','big');toast('PTPTN loan paid off!');render();save();},
  ptskip(){S.ptptnSkip=!S.ptptnSkip;toast(S.ptptnSkip?'You stop paying PTPTN. Miss 3 years in a row and you are barred from leaving Malaysia.':'PTPTN payments resume.');render();save();},
  handover(){qFront(handoverModal());showNext();},
  heir(a){const k=S.kids[+a];S=heirFrom(k);MQ=[];cur=null;tab='life';save();showScreen('s-game');render();},
  relative(){const k=relativeHeir();S=heirFrom(k);MQ=[];cur=null;tab='life';save();showScreen('s-game');render();},
  abandon(){if(cur&&cur._settings){cur=null;$('#modal').hidden=true;}qFront({title:'Start over?',text:'This deletes the current family and all its generations.',choices:[['Yes, start a new family',()=>{clearSave();S=null;MQ=[];cur=null;$('#modal').hidden=true;$('#btn-continue').hidden=true;showScreen('s-setup');return false;}],['Cancel',null]]});showNext();},
  buybiz(a){buyBiz(a);},sellbiz(a){sellBiz(+a);},buylux(a){buyLux(a);},selllux(a){sellLux(+a);},invest(a){invest(a);},cashout(a){cashOut(a);},angel(){backStartup();},
  music(){musicFrom=S&&!$('#s-game').hidden?'s-game':'s-title';if(cur&&cur._settings){cur=null;$('#modal').hidden=true;}showScreen('s-music');mpRefresh();},
  musicBack(){showScreen(musicFrom);if(musicFrom==='s-game'){render();showNext();}},
  mptoggle(){mpToggle();},mpplay(a){mpPlay(+a);},mpprev(){mpSkip(-1);},mpnext(){mpSkip(1);},mprepeat(){mpSetRepeat();},
  howto(){qFront({title:'How to play',tag:'Guide',text:'<ul class="howto"><li>Each turn is one year. Spend your <b>action points</b> on activities, then press <b>Next year</b>.</li><li>Your parents\' genes, family income and choices shape exam results, careers, love and money.</li><li><b>Knowledge</b> starts fresh at every school stage. Your <b>Smarts</b> and <b>Discipline</b> make each hour of study count for more.</li><li>Real Malaysian milestones: SPM, Matrikulasi/STPM/A-Levels, PTPTN, EPF, festivals and open houses.</li><li>History happens around you: the 1997 crisis, COVID-19 lockdowns, floods, booms and crashes.</li><li>When you die, continue as your child in <b>Dynasty mode</b> and inherit your estate.</li></ul>',choices:[['Got it',null]]});showNext();},
  settings(){qFront(settingsModal());showNext();},skin(a){setSkin(a);settingsRedraw();},appicon(a){setAppIcon(a);settingsRedraw();},
  achievements(){if(cur&&cur._settings){cur=null;$('#modal').hidden=true;}qFront({title:'Achievements',tag:'Settings',text:achHtml(),choices:[['Done',null]]});showNext();},
  backup(){const c=saveCode();if(!c)return toast('There is no saved game yet.');const show=()=>{qFront({title:'Your save code',tag:'Settings',text:`Copy all of this code and keep it somewhere safe, like Notes or a WhatsApp message to yourself.<textarea class="savecode" readonly onfocus="this.select()">${c}</textarea>`,choices:[['Done',null]]});showNext();};
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(c).then(()=>toast('Save code copied. Paste it into Notes or WhatsApp to keep it safe.'),show);else show();},
  restore(){if(cur&&cur._settings){cur=null;$('#modal').hidden=true;}qFront({title:'Restore a saved game',tag:'Settings',text:`Paste your save code below. ${load()?'This replaces the game on this phone.':''}<textarea class="savecode" id="restore-code" placeholder="MYLIFE1:..."></textarea>`,choices:[['Restore',()=>{const el=document.getElementById('restore-code'),o=readCode(el&&el.value);if(!o){toast('That code doesn\'t look right. Copy the whole code and try again.');return 'keep';}
    try{localStorage.setItem(SAVE_KEY,JSON.stringify(o));}catch(e){toast('Could not save on this phone.');return 'keep';}S=null;MQ=[];cur=null;$('#modal').hidden=true;showScreen('s-title');toast('Save restored: '+(o.name||'your family')+'. Tap Continue.');return false;}],['Cancel',null]]});showNext();},smute(){toggleMute();settingsRedraw();},
  abandonEnd(){clearSave();S=null;$('#btn-continue').hidden=true;showScreen('s-setup');},
};
// Stats bubble: tap opens the full stats, drag moves it (it snaps to the nearest side and remembers where).
(()=>{let d=null;const b=$('#sbub');b.addEventListener('pointerdown',e=>{d={x:e.clientX,y:e.clientY,moved:false};b.setPointerCapture(e.pointerId);});
  b.addEventListener('pointermove',e=>{if(!d)return;if(!d.moved&&Math.hypot(e.clientX-d.x,e.clientY-d.y)<8)return;d.moved=true;statPop(false);b.classList.add('drag');b.style.left=(e.clientX-32)+'px';b.style.top=(e.clientY-32)+'px';});
  b.addEventListener('pointerup',e=>{if(!d)return;const m=d.moved;d=null;b.classList.remove('drag');if(!m){statPop();return;}
    try{localStorage.setItem(BUB_KEY,JSON.stringify({side:e.clientX<innerWidth/2?'l':'r',y:(e.clientY-32)/innerHeight}));}catch(err){}bubPlace();});
  b.addEventListener('pointercancel',()=>{d=null;b.classList.remove('drag');bubPlace();});
  document.addEventListener('pointerdown',e=>{if(!$('#statpop').hidden&&!e.target.closest('#statpop,#sbub'))statPop(false);},true);
  addEventListener('resize',()=>{if(S)bubPlace();});})();
document.addEventListener('click',e=>{const seg=e.target.closest('[data-seg] button');if(seg){if(seg.disabled)return;const box=seg.parentElement;box.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',b===seg));setup[box.dataset.seg]=seg.dataset.v;return;}
  const b=e.target.closest('[data-act]');if(!b||b.disabled)return;const f=ACT[b.dataset.act];if(!f)return;
  const act=b.dataset.act,m0=S&&S.money,ch=act==='choose'&&cur&&cur.choices&&cur.choices[+b.dataset.arg];
  CUE=null;f(b.dataset.arg);if(act.startsWith('mp'))return;
  const d=S&&typeof m0==='number'?S.money-m0:0;
  if(CUE){const k=CUE;CUE=null;if(act==='next'||act==='auto'){sfx('next');setTimeout(()=>sfx(k),260);}else sfx(k);return;}
  if(act==='next'||act==='auto')sfx('next');else if(act==='tab')sfx('tab');else if(act==='close'||(ch&&!ch[1]))sfx('back');
  else if(d<-1)sfx(d<-50000?'coins':'buy');else if(d>1)sfx('gain');else if(act==='choose')sfx('choose');else sfx('tap');});
