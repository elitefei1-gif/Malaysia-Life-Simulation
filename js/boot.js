'use strict';
// Start-up: runs last, after every other file has loaded.
// Every js/ file is a plain script sharing one global scope, loaded in the order index.html lists them.
/* ================= boot ================= */
function boot(data){if(data&&data.S){S=data.S;tab=data.tab||'life';showScreen(S.alive?'s-game':'s-end');if(S.alive)render();else showEnd();return;}
  if(load())$('#btn-continue').hidden=false;showScreen('s-title');}
try{window.claude?.hot?.snapshot?.(()=>({S,tab}));}catch(e){}
window.claude?.hot?.ready?window.claude.hot.ready(boot):boot(window.claude?.hot?.data??{});
