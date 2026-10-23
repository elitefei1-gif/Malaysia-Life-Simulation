'use strict';
// Sound effects (Web Audio) and music.
/* ---- sound effects (Web Audio, generated in the browser) ---- */
let AC=null,MUTED=false;try{MUTED=localStorage.getItem('my-lifesim-mute')==='1';}catch(e){}
// All sounds go through one master gain and a compressor, so they are louder without clipping.
let MASTER=null,PITCH=1;
function bus(){if(!MASTER){const c=AC.createDynamicsCompressor();c.threshold.value=-14;c.knee.value=10;c.ratio.value=4;c.attack.value=.003;c.release.value=.15;
  MASTER=AC.createGain();MASTER.gain.value=3;MASTER.connect(c).connect(AC.destination);}return MASTER;}
function tone(fr,dur,o){o=o||{};fr*=PITCH;const t=AC.currentTime+(o.at||0),osc=AC.createOscillator(),g=AC.createGain();osc.type=o.type||'sine';osc.frequency.setValueAtTime(fr,t);
  if(o.to)osc.frequency.exponentialRampToValueAtTime(o.to*PITCH,t+dur);if(o.vib){const l=AC.createOscillator(),lg=AC.createGain();l.frequency.value=o.vib;lg.gain.value=fr*.012;l.connect(lg).connect(osc.frequency);l.start(t);l.stop(t+dur+.02);}
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(o.vol||.12,t+(o.att||.008));g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  osc.connect(g).connect(bus());osc.start(t);osc.stop(t+dur+.02);}
// A short burst of filtered noise, for whooshes, thuds and shakers.
function noise(dur,o){o=o||{};const t=AC.currentTime+(o.at||0),n=Math.floor(AC.sampleRate*dur),buf=AC.createBuffer(1,n,AC.sampleRate),d=buf.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;
  const src=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();src.buffer=buf;f.type=o.type||'bandpass';f.frequency.setValueAtTime((o.f||1200)*PITCH,t);if(o.to)f.frequency.exponentialRampToValueAtTime(o.to,t+dur);f.Q.value=o.q||1;
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(o.vol||.1,t+(o.att||.01));g.gain.exponentialRampToValueAtTime(0.0001,t+dur);src.connect(f).connect(g).connect(bus());src.start(t);src.stop(t+dur+.02);}
const arp=(ns,step,o)=>ns.forEach((n,i)=>tone(n,o.dur||.14,{...o,at:(o.at||0)+i*step}));
const chord=(ns,dur,o)=>ns.forEach(n=>tone(n,dur,o));
const SFX={
  tap:()=>pick([()=>tone(620,.06,{type:'triangle',vol:.22}),()=>tone(700,.055,{type:'triangle',vol:.22}),()=>tone(560,.06,{type:'sine',vol:.26,to:640})])(),
  tab:()=>{tone(480,.08,{type:'triangle',to:720,vol:.2});noise(.06,{f:3000,vol:.05});},
  choose:()=>pick([()=>{tone(740,.06,{type:'square',vol:.05});tone(1110,.08,{type:'square',vol:.05,at:.05});},()=>{tone(660,.06,{type:'triangle',vol:.1});tone(990,.09,{type:'triangle',vol:.1,at:.05});},()=>arp([587,880,1175],.04,{type:'sine',vol:.1,dur:.08})])(),
  back:()=>tone(420,.09,{type:'triangle',to:300,vol:.18}),
  buy:()=>{noise(.05,{f:5000,q:2,vol:.06});tone(988,.07,{type:'square',vol:.06,at:.02});tone(1319,.25,{type:'square',vol:.06,at:.09});},
  gain:()=>{arp(pick([[784,988,1175,1568],[880,1109,1319,1760],[698,880,1047,1397]]),.06,{type:'triangle',vol:.11,dur:.12});noise(.25,{f:7000,q:3,vol:.025,at:.15});},
  next:()=>{noise(.22,{f:400,to:2400,q:.8,vol:.05});arp(pick([[523,659,784],[587,740,880],[523,698,880],[494,622,740]]),.07,{type:'triangle',vol:.11,dur:.1,at:.08});},
  locked:()=>{tone(150,.12,{type:'sawtooth',vol:.09});tone(120,.14,{type:'sawtooth',vol:.09,at:.1});},
  sad:()=>{arp([392,349,311,262],.28,{type:'sine',vol:.14,dur:.4,vib:5});chord([131,196],1.6,{type:'triangle',vol:.05,at:.9,att:.2});},
  good:()=>{arp([659,831,988,1319],.05,{type:'sine',vol:.11,dur:.18});tone(1976,.3,{type:'sine',vol:.04,at:.2});},
  bad:()=>{noise(.18,{type:'lowpass',f:300,vol:.12});tone(220,.25,{type:'sawtooth',to:150,vol:.05});tone(185,.3,{type:'sine',to:130,vol:.1,at:.12});},
  alert:()=>{[0,.22].forEach(a=>{tone(880,.12,{type:'square',vol:.08,at:a});tone(660,.14,{type:'square',vol:.08,at:a+.11});});noise(.4,{type:'lowpass',f:200,vol:.08});},
  promo:()=>{arp([523,659,784],.09,{type:'square',vol:.05,dur:.12});chord([1047,1319,1568],.6,{type:'triangle',vol:.07,at:.28});noise(.5,{f:8000,q:4,vol:.03,at:.28});},
  milestone:()=>{arp([784,1047,1319,1047,1568],.08,{type:'triangle',vol:.1,dur:.15});},
  love:()=>{arp([659,784,988,1175],.12,{type:'sine',vol:.11,dur:.45,vib:6,att:.04});},
  wedding:()=>{[0,.45].forEach((a,k)=>chord(k?[587,740,880,1175]:[523,659,784,1047],.9,{type:'sine',vol:.06,at:a,att:.01}));arp([1568,1760,2093],.12,{type:'sine',vol:.05,dur:.5,at:.9});},
  baby:()=>{arp(pick([[1047,1319,1568,2093,1568],[1175,1397,1760,2349,1760]]),.11,{type:'sine',vol:.09,dur:.35});noise(.15,{f:6000,q:5,vol:.02,at:.4});},
  festive:()=>{tone(196,1.2,{type:'sine',vol:.15,vib:3});tone(392,.8,{type:'triangle',vol:.05});arp([784,880,1047,1175],.1,{type:'sine',vol:.08,dur:.2,at:.25});},
  event:()=>{noise(.18,{f:900,to:2600,q:1,vol:.05});tone(880,.12,{type:'sine',vol:.08,at:.1});},
  coins:()=>{for(let i=0;i<5;i++)tone(pick([1976,2349,2637,2093]),.07,{type:'square',vol:.07,at:i*.05+Math.random()*.02});}};
// Big life moments queue a sound while a click is handled; the click handler plays the one with the highest priority.
const CUE_P={sad:9,wedding:8,baby:8,promo:7,bad:7,love:6,alert:6,milestone:5,festive:5,good:4,event:3};let CUE=null;
function cue(k){if(!CUE||CUE_P[k]>CUE_P[CUE])CUE=k;}
function cueLog(t){if(/^Married|life partners/.test(t))bgmEvent='wedding';cue(/^Married|life partners/.test(t)?'wedding':/^Welcomed|^Adopted/.test(t)?'baby':/passed away/i.test(t)?'sad':/^Promoted|^Won|^Graduated|^Selected|^Received|Prime Minister|^Paid off/.test(t)?'promo':/Started dating|First relationship/.test(t)?'love':/Divorced|Dumped|bankrupt|failed|Sacked|raided|Investigated|retrench|Convicted|prison|jail|broke up|Broke up/i.test(t)?'bad':'milestone');}
function sfx(k){if(MUTED||!SFX[k])return;try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();PITCH=Math.pow(2,(Math.random()-.5)*.9/12);SFX[k]();}catch(e){}}
function toggleMute(){MUTED=!MUTED;try{localStorage.setItem('my-lifesim-mute',MUTED?'1':'0');}catch(e){}bgm();}
// Background music (v86) follows your life: a song for each life stage, and short "moment" songs while their
// pop-up is open (Raya, CNY, wedding, hard times), then it fades back to the stage song where it left off.
// Songs are TRACKS ids. It starts on the first tap (browsers block autoplay) and follows the mute button.
// bgm() is called on every render, screen change and pop-up, and only acts when the wanted song changes.
let BGM=null,bgmId=null,bgmNext=null,bgmTimer=null,bgmEvent=null;const BGM_VOL=.25,BGM_POS={},BGM_BAD=new Set();
const MOMENTS=['raya','cny','wedding','hardship','legacy'];
const MOMENT_TITLE={'Declared bankrupt':'hardship','Drowning in debt':'hardship','Retrenched':'hardship','"We need to talk"':'hardship','Divorce papers':'hardship',
  'Gone':'hardship','Caught':'hardship','Messages on their phone':'hardship','MACC raid':'hardship','Sacked':'hardship','Rest in peace':'legacy'};
function bgmMoment(m){if(!m)return null;if(MOMENT_TITLE[m.title])return MOMENT_TITLE[m.title];if(m.icon==='m_rip')return 'hardship';
  if(m.tag==='Festive season')return (S&&S.festN||0)>5?null:/Raya/.test(m.title)?'raya':/Chinese New Year/.test(m.title)?'cny':null;
  return null;}
function bgmStage(){const a=age();
  if(S.jail||(S.pol&&S.pol.jail)||inHosp())return 'hardship';
  if(S.pol&&a>=18&&S.pol.dirty>(S.pol.raidDirty||0))return 'politics'; // only once you're corrupt, until a MACC raid or retiring
  if(S.bgmLove)return 'romance'; // the "falling in love" years, decided once a year in nextYear()
  if(a>=25&&(honTier()||netWorth()>=5e6*infl()))return 'rich';
  if(a>=60||S.retired)return 'golden';
  if(a<=12)return 'child';
  if(a<18)return 'school';
  if(S.edu.track&&!S.job)return 'uni';
  return 'work';}
function bgmWant(){if(!cur)bgmEvent=null;
  const id=$('#s-end')&&!$('#s-end').hidden?'legacy':!S||$('#s-game').hidden?'title':bgmEvent||bgmMoment(cur)||bgmStage();
  return TRACKS.find(t=>t.id===(BGM_BAD.has(id)?'hangat':id));}
// A song that fails to load (offline and never played) falls back to Menu Hangat, which is always saved.
function bgmErr(){if(!BGM.getAttribute('src')||bgmId==='hangat')return;BGM_BAD.add(bgmId);bgmId=null;bgm();}
function bgmRamp(to,done){clearInterval(bgmTimer);const from=BGM.volume;let n=0;
  bgmTimer=setInterval(()=>{n++;BGM.volume=Math.max(0,Math.min(1,from+(to-from)*n/12));if(n>=12){clearInterval(bgmTimer);bgmTimer=null;if(done)done();}},50);}
function bgmLoad(t){if(bgmId&&!MOMENTS.includes(bgmId))BGM_POS[bgmId]=BGM.currentTime;bgmId=t.id;bgmNext=null;BGM.src=t.file;
  const at=MOMENTS.includes(t.id)?t.cue||0:BGM_POS[t.id]||0;if(at)BGM.addEventListener('loadedmetadata',()=>{try{BGM.currentTime=at;}catch(e){}},{once:true});
  BGM.volume=0;bgmPlay();bgmRamp(BGM_VOL);}
function bgmPlay(){const p=BGM.play();if(p&&p.catch)p.catch(()=>{});}
function bgm(){try{const t=bgmWant();
  if(!BGM){BGM=new Audio();BGM.loop=true;BGM.preload='auto';BGM.addEventListener('error',bgmErr);}
  if(MUTED||document.hidden||mpOn()||!t){if(bgmTimer){clearInterval(bgmTimer);bgmTimer=null;}if(bgmNext){bgmNext=null;bgmId=null;}BGM.volume=BGM_VOL;BGM.pause();return;}
  if(t.id===bgmId&&!bgmNext){if(BGM.paused)bgmPlay();return;}
  if(bgmNext||t.id===bgmId){bgmNext=t.id===bgmId?null:t;if(!bgmNext)bgmRamp(BGM_VOL);return;}
  // Fade the current song out (if one is playing), then start the new one.
  if(!bgmId||BGM.paused){bgmLoad(t);return;}
  bgmNext=t;bgmRamp(0,()=>{if(bgmNext)bgmLoad(bgmNext);});}catch(e){}}
document.addEventListener('pointerdown',()=>{if(!BGM||BGM.paused)bgm();},{passive:true});
document.addEventListener('keydown',()=>{if(!BGM)bgm();});
document.addEventListener('visibilitychange',()=>{if(BGM)bgm();});
// Music page (v85): songs the player can listen to in full, from the title screen or the Music tab.
// To add a song, put the .mp3 in music/songs/ and add a line here. Background music pauses while a song plays.
// Songs aren't saved for offline play up front (they're large); each one is saved the first time it's played.
const TRACKS=[
  {id:'title',title:'Emas Harapan',sub:'Title theme',file:'music/songs/01-title-theme.mp3',len:97},
  {id:'child',title:'Kampung Petang',sub:'Childhood',file:'music/songs/02-childhood.mp3',len:75},
  {id:'school',title:'School Days',sub:'School',file:'music/songs/03-school-days.mp3',len:99},
  {id:'uni',title:'Uni Life',sub:'University',file:'music/songs/04-uni-life.mp3',len:163},
  {id:'work',title:'Working Life',sub:'Career',file:'music/songs/05-working-life.mp3',len:96},
  {id:'romance',title:'Romance',sub:'Love',file:'music/songs/06-romance.mp3',len:193,cue:4},
  {id:'wedding',title:'Wedding',sub:'Love',file:'music/songs/07-wedding.mp3',len:136},
  {id:'raya',title:'Raya',sub:'Festive season',file:'music/songs/08-raya.mp3',len:103},
  {id:'cny',title:'Chinese New Year',sub:'Festive season',file:'music/songs/09-cny.mp3',len:96},
  {id:'politics',title:'Politics',sub:'Election season',file:'music/songs/10-politics.mp3',len:106},
  {id:'hardship',title:'Hardship',sub:'Hard times',file:'music/songs/11-hardship.mp3',len:193},
  {id:'golden',title:'Golden Years',sub:'Retirement',file:'music/songs/12-golden-years.mp3',len:178},
  {id:'legacy',title:'Legacy',sub:'Dynasty',file:'music/songs/13-legacy.mp3',len:218},
  {id:'rich',title:'Rich Life',sub:'Wealth',file:'music/songs/14-rich-life.mp3',len:184},
  {id:'hangat',title:'Menu Hangat',sub:'Classic theme',file:'music/menu-hangat.mp3',len:89},
];
let MP=null,mpTrack=0,mpRepeat=false,mpDrag=false;
const mpOn=()=>!!MP&&!MP.paused;
const mpDur=()=>MP&&isFinite(MP.duration)?MP.duration:TRACKS[mpTrack].len;
const mpTime=s=>!isFinite(s)?'–:––':Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');
function mpAudio(){if(MP)return MP;MP=new Audio();MP.preload='metadata';
  MP.addEventListener('timeupdate',mpTick);
  MP.addEventListener('error',()=>{if(!MP.getAttribute('src'))return;MP.pause();toast(navigator.onLine===false?'Connect to the internet to play this song the first time.':'This song could not be loaded. Try again in a moment.');mpRefresh();});
  MP.addEventListener('play',()=>{bgm();mpRefresh();});MP.addEventListener('pause',()=>{bgm();mpRefresh();});
  MP.addEventListener('ended',()=>{if(mpTrack<TRACKS.length-1)mpPlay(mpTrack+1);else{MP.currentTime=0;mpRefresh();}});
  return MP;}
function mpPlay(i){const t=TRACKS[i];if(!t)return;const a=mpAudio();
  if(mpTrack!==i||!a.src){mpTrack=i;a.src=t.file;}a.loop=mpRepeat;const p=a.play();if(p&&p.catch)p.catch(()=>{});
  try{if('mediaSession' in navigator){navigator.mediaSession.metadata=new MediaMetadata({title:t.title,artist:'Malaysian Life Simulator',album:t.sub,artwork:[{src:'img/title-banner.webp',type:'image/webp'}]});
    navigator.mediaSession.setActionHandler('play',()=>mpPlay(mpTrack));navigator.mediaSession.setActionHandler('pause',()=>MP.pause());
    navigator.mediaSession.setActionHandler('previoustrack',()=>mpSkip(-1));navigator.mediaSession.setActionHandler('nexttrack',()=>mpSkip(1));}}catch(e){}
  mpRefresh();}
function mpToggle(){if(mpOn())MP.pause();else mpPlay(mpTrack);}
// Back to the start of the song if it's more than 3 seconds in, otherwise the previous song.
function mpSkip(d){if(d<0&&MP&&MP.currentTime>3){MP.currentTime=0;return;}mpPlay((mpTrack+d+TRACKS.length)%TRACKS.length);}
function mpSetRepeat(){mpRepeat=!mpRepeat;if(MP)MP.loop=mpRepeat;mpRefresh();}
function mpRefresh(){if(!$('#s-music').hidden)setHtml($('#music-page'),panelMusic());mpTick();}
function mpTick(){const d=mpDur(),c=MP?MP.currentTime:0;
  document.querySelectorAll('.mp-time').forEach(el=>el.textContent=mpTime(c)+' / '+mpTime(d));
  if(!mpDrag)document.querySelectorAll('.mp-seek').forEach(el=>el.value=d?Math.round(c/d*1000):0);}
document.addEventListener('input',e=>{if(!e.target.matches('.mp-seek'))return;mpDrag=true;const d=mpDur();
  document.querySelectorAll('.mp-time').forEach(el=>el.textContent=mpTime(e.target.value/1000*d)+' / '+mpTime(d));});
document.addEventListener('change',e=>{if(!e.target.matches('.mp-seek'))return;mpDrag=false;const a=mpAudio();
  if(!a.src){a.src=TRACKS[mpTrack].file;}const go=()=>{a.currentTime=e.target.value/1000*a.duration;mpTick();};if(isFinite(a.duration))go();else a.addEventListener('loadedmetadata',go,{once:true});});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&cur&&cur.choices===null)closeModal();});

