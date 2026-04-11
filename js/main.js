// PokéBattle Main — G state, router, helpers, boot

// Pokéball SVGs (used by showSplash + animPokeball)
const POKEBALL_MINI=`<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" width="40" height="40"><circle cx="100" cy="100" r="95" fill="white" stroke="#1E293B" stroke-width="6"/><path d="M 10 100 A 90 90 0 0 1 190 100 Z" fill="#EF4444"/><line x1="10" y1="100" x2="190" y2="100" stroke="#1E293B" stroke-width="6"/><circle cx="100" cy="100" r="22" fill="white" stroke="#1E293B" stroke-width="6"/><circle cx="100" cy="100" r="10" fill="#E2E8F0"/></svg>`;
const POKEBALL=`<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" width="110" height="110"><circle cx="100" cy="100" r="95" fill="white" stroke="#1E293B" stroke-width="6"/><path d="M 10 100 A 90 90 0 0 1 190 100 Z" fill="#EF4444"/><line x1="10" y1="100" x2="190" y2="100" stroke="#1E293B" stroke-width="6"/><circle cx="100" cy="100" r="22" fill="white" stroke="#1E293B" stroke-width="6"/><circle cx="100" cy="100" r="10" fill="#E2E8F0"/></svg>`;

let G={scr:"title",mode:"cpu",diff:"normal",tutorial:!localStorage.getItem("pb_played"),cstep:1,av1:0,av2:3,p1:null,p2:null,sel:[],sfor:1,pvpk:null,bat:null,vd:null,smode:"load",pact:null,pp:null,pcb:null,fsfor:null,scenario:null,modal:null,fType:"all",fSearch:""};

function te(atk,dt){let m=1;for(const d of dt){const c=CH[atk]||{};if(c[d]!==undefined)m*=c[d];}return m;}
function dd(a,d,p,m){return Math.max(1,Math.floor(Math.floor(((20/5+2)*p*(a/d)/50)+2)*m));}
function hc(v){return v>.5?"#22C55E":v>.25?"#F59E0B":"#EF4444";}
function su(id){return"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/"+id+".png";}
function bdg(t){const c=TC[t]||TC.normal;return`<span class="bdg" style="background:${c.bg};color:${c.t};">${c.l}</span>`;}
function mkBar(cur,max,flip,id=""){
  const p=Math.max(0,cur/max)*100;
  const col=hc(cur/max);
  const idAttr=id?`id="${id}"`:"";
  return`<div class="sf-hpbar-wrap"><div ${idAttr} class="sf-hpbar-fill${flip?" r":""}" style="width:${p.toFixed(1)}%;background:${col};${flip?"right:0;left:auto;":""}box-shadow:0 0 8px ${col}88;transition:width .8s cubic-bezier(.4,0,.2,1),background .5s ease;"></div></div>`;
}
function animHpBar(id,cur,max,flip){
  const el=document.getElementById(id);
  if(!el)return;
  const p=Math.max(0,cur/max)*100;
  const pct=cur/max;
  const grad=pct>.5?(flip?"linear-gradient(270deg,#22C55E,#86efac,#22C55E)":"linear-gradient(90deg,#22C55E,#86efac,#22C55E)"):pct>.25?(flip?"linear-gradient(270deg,#EF4444,#f97316,#FCD34D)":"linear-gradient(90deg,#EF4444,#f97316,#FCD34D)"):(flip?"linear-gradient(270deg,#991B1B,#EF4444,#ff6b6b)":"linear-gradient(90deg,#991B1B,#EF4444,#ff6b6b)");
  el.style.width=p.toFixed(1)+"%";
  el.style.background=grad;
  el.style.boxShadow=`0 0 8px rgba(34,197,94,.5)`;
}
function statusBadge(st){if(!st)return"";const s=STATUS[st];return`<span style="display:inline-block;background:${s.bg};color:${s.color};border:1px solid ${s.color};border-radius:999px;font-size:.6rem;font-weight:800;padding:1px 6px;margin-left:4px;animation:statusBadge .4s ease;">${s.icon} ${s.label}</span>`;}
function applyStatusAnimation(spId, status){
  const sp=document.getElementById(spId);if(!sp)return;
  sp.style.animation="none";void sp.offsetWidth;
  const isP1=spId==="sp1";
  if(status==="poison")sp.style.animation="poisonPulse 1.5s ease-in-out infinite"+(isP1?", sleepFloat 2s ease-in-out infinite":"");
  else if(status==="burn")sp.style.animation="burnFlicker 1s ease-in-out infinite";
  else if(status==="paralysis")sp.style.animation="paralysePulse .8s ease-in-out infinite";
  else if(status==="sleep")sp.style.animation=(isP1?"sleepFloat 2s ease-in-out infinite":"sleepFloat2 2s ease-in-out infinite");
  else sp.style.animation="";
}
function spawnZzz(wrapId){
  const w=document.getElementById(wrapId);if(!w)return;
  const z=document.createElement("div");
  z.style.cssText="position:absolute;top:10%;left:60%;font-size:1.2rem;pointer-events:none;animation:zzzFloat 1.5s ease-out forwards;z-index:50;";
  z.textContent="💤";w.appendChild(z);setTimeout(()=>z.remove(),1600);
}
function gs(){try{return JSON.parse(localStorage.getItem("pb8")||"[]");}catch{return[];}}
function ps(s){try{localStorage.setItem("pb8",JSON.stringify(s));}catch{}}
// Favorites
function getFavs(){try{return JSON.parse(localStorage.getItem("pb_favs")||"null");}catch{return null;}}
function saveFav(ids){try{localStorage.setItem("pb_favs",JSON.stringify(ids));}catch{}}
// Records
function getRec(){try{return JSON.parse(localStorage.getItem("pb_rec")||'{"wins":0,"losses":0,"streak":0,"bestStreak":0,"totalMoves":0,"games":0}');}catch{return{wins:0,losses:0,streak:0,bestStreak:0,totalMoves:0,games:0};}}
function addRec(won,moves){
  const r=getRec();r.games++;r.totalMoves+=moves;
  if(won){r.wins++;r.streak++;r.bestStreak=Math.max(r.bestStreak,r.streak);}
  else{r.losses++;r.streak=0;}
  try{localStorage.setItem("pb_rec",JSON.stringify(r));}catch{}
}
function go(s){if(G.scr==="battle"&&s!=="battle")stopMusic();G.scr=s;render();}
function showSplash(){
  const app=document.getElementById("app");
  app.innerHTML=`<div id="splash" style="position:absolute;inset:0;background:linear-gradient(160deg,#0F172A,#1E3A5F);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:999;animation:splashFadeIn .4s ease both;">
    <div style="animation:splashSpin 1.2s ease-in-out;margin-bottom:20px;">${POKEBALL}</div>
    <h1 style="font-family:'Rajdhani',Impact,sans-serif;font-weight:700;font-size:clamp(2rem,8vw,3.5rem);background:linear-gradient(90deg,#FCD34D,#F97316,#EC4899,#60A5FA);-webkit-background-clip:text;-webkit-text-fill-color:transparent;letter-spacing:.1em;animation:splashFadeIn .6s ease .3s both;">⚡ POKÉBATTLE ⚡</h1>
    <p style="font-family:'Roboto',sans-serif;color:#60A5FA;font-size:.9rem;font-weight:600;letter-spacing:.3em;margin-top:8px;animation:splashFadeIn .6s ease .6s both;">GENERACIÓN 1</p>
    <div style="margin-top:28px;width:48px;height:4px;background:linear-gradient(90deg,#3B82F6,#60A5FA);border-radius:2px;animation:splashFadeIn .5s ease .8s both;"></div>
  </div>`;
  setTimeout(()=>{
    const el=document.getElementById("splash");
    if(el){el.style.animation="splashFadeOut .4s ease forwards";}
    setTimeout(()=>render(),400);
  },1600);
}
function render(){document.getElementById("app").innerHTML=SCREENS[G.scr]?SCREENS[G.scr]():`<div style="color:#fff;padding:20px;">Error: ${G.scr}</div>`;}


// Boot
showSplash();
