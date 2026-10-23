'use strict';
// The year loop: nextYear() runs every yearly system in order. Auto-play.
/* ================= year loop ================= */
function nextYear(){if(cur||!S.alive)return;const yb=S.yStart||snap(),a0=age();
  S.year++;tab='life';S.applied=0;
  worldTick();const fx=fxNow();
  if(age()>=18)finances(fx);else kidMoney();
  careerTick(fx);polTick();titleTick();passive(fx);milestones();fixPartners();relationships();spousesTick();affairTick();parentsTick();petsTick();kidsTick();birthsTick();
  if(S.alive&&S.stats.hlt<HLT_CRIT&&!S.jail&&!(S.pol&&S.pol.jail)){S.hosp=S.year;q(hospModal());}
  else{if(age()>=3&&S.alive&&chance(illChance()))q(illModal(pickIll()));
  if(age()>=2)festival();
  if(age()>=5&&chance(.55))randomEvent();
  if(S.job&&age()>=18&&chance(.4))workEvent();}
  S.bgmLove=loveSeason();
  S.yDelta=['int','hlt','cha','look','cre','ath','dis','hap'].map(k=>[k,S.stats[k]-(yb[k]??S.stats[k])]).filter(x=>Math.abs(x[1])>=.05);S.yStart=snap();
  checkAch();S.hapSum+=S.stats.hap;S.hapN++;S.ot=0;S.trips=0;S.ap=apFor();
  if(age()>=1&&!autoYears&&S.showStmt!==false&&S.lastBreak&&!(S.pol&&S.pol.jail)&&!S.jail)qFront(stmtModal());
  if(age()>=105||chance(deathChance()))die();
  render();save();yearFx(a0);showNext();}
function autoSpend(){const a=age();let guard=10;while(S.ap>0&&guard--){let id;
  if(a<7)id=pick(['play','study']);else if(a<=17||S.edu.track)id=pick(['study','study','social','exercise']);
  else if(S.retired)id=pick(['hobby','exercise','rest']);else id=pick(['exercise','social','rest',S.partner?'date':'hobby']);
  const A=ACTS.find(x=>x.id===id);if(!A||!A.ok(a)){S.ap--;continue;}S.ap--;const o=A.run();practise(id);if(o)log(o);}}
function runAuto(){if(!S.alive){autoYears=0;return;}if(cur)return;if(autoYears<=0){render();return;}autoYears--;autoSpend();nextYear();}

