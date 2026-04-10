// PokéBattle Battle Engine — save/load, battle setup, combat actions

// Battle functions
function sBattle(){
  G.bat={
    t1:G.p1.team.map(p=>({...p,status:null,statusTurns:0})),
    t2:G.p2.team.map(p=>({...p,status:null,statusTurns:0})),
    a1:0,a2:0,ct:"p1",ph:"action",
    cd1:[0,0,0,0],cd2:[0,0,0,0],
    st:{moves:0,defeated:0,dmgDone:0,dmgTypes:{}},
    locked:false,
    potions1:1,potions2:1  // 1 potion each
  };
  G.pact=null;
  G._enterShown=false;
  go("intro");  // show epic intro first
}
function bPh(p){G.bat.ph=p;render();}
function pRdy(){const p=G.pp;document.getElementById("pi").innerHTML=`<div style="font-size:80px;margin-bottom:20px;">⚔️</div><h2 style="color:#fff;font-weight:900;font-size:1.8rem;margin:0 0 10px;">¡Hola, ${p.name}!</h2><p style="color:#93C5FD;font-size:1rem;margin-bottom:32px;">Prepárate para elegir tu acción</p><button class="btn" style="background:linear-gradient(135deg,#EF4444,#B91C1C);max-width:280px;font-size:1.1rem;" onclick="sfxMenu();pCont()">¡A combatir! ⚔️</button>`;}
function pCont(){if(G.pcb)G.pcb();G.pcb=null;}
function shPass(pl,cb){G.pp=pl;G.pcb=cb;go("pass");}
function fsTo(i){const b=G.bat,w=G.fsfor;if(w==="p1")b.a1=i;else b.a2=i;b.ph="action";go("battle");}
function doRm(){G.sel=[];G.sfor=1;G.pvpk=null;go("select");}
function oSaves(m){G.smode=m;go("saves");}
function lSave(id){const s=gs().find(x=>x.id===id);if(!s)return;G.p1=s.st.p1;G.p2=s.st.p2;G.mode=s.st.mode||"cpu";sBattle();}
function dSaveItem(id,btn){if(btn.dataset.c==="1"){const ns=gs().filter(s=>s.id!==id);ps(ns);go("saves");}else{btn.textContent="¿Seguro? Toca de nuevo";btn.dataset.c="1";setTimeout(()=>{btn.textContent="🗑️ Borrar";btn.dataset.c="0";},3000);}}
function tutStep(step){
  const el=document.getElementById("tut");
  if(!el)return;
  const steps=[
    {msg:"👋 ¡Bienvenido a PokéBattle! Esto es la pantalla de combate.",btn:"Siguiente →",target:null},
    {msg:"⚔ Pulsa ATACAR para ver los movimientos de tu Pokémon.",btn:"Entendido →",target:"bPh('attack')"},
    {msg:"🎯 Cada movimiento tiene un TIPO. ¡Los tipos son importantes! 🔥 vence a 🌿",btn:"¡Ya lo sé! →",target:null},
    {msg:"💊 Tienes 1 POCIÓN para curar 30HP. ¡Úsala en el momento correcto!",btn:"Ok →",target:null},
    {msg:"⚡ Fíjate en los indicadores ▲SÚPER ▼DÉBIL antes de atacar.",btn:"¡Entendido!",target:null,last:true},
  ];
  const s=steps[step];
  if(!s){el.remove();localStorage.setItem("pb_played","1");G.tutorial=false;return;}
  el.innerHTML=`<div style="position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);background:rgba(5,10,25,.96);border:2px solid #3B82F6;border-radius:12px;padding:14px 18px;width:min(320px,90vw);z-index:200;box-shadow:0 8px 32px rgba(0,0,0,.8);">
    <div style="font-family:'Roboto',sans-serif;font-size:.85rem;color:#fff;font-weight:600;margin-bottom:10px;line-height:1.4;">${s.msg}</div>
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <span style="font-size:.65rem;color:rgba(255,255,255,.3);">${step+1}/${steps.length}</span>
      <button onclick="${s.last?'tutStep(99)':`tutStep(${step+1})`}" style="border:none;cursor:pointer;background:linear-gradient(135deg,#3B82F6,#1D4ED8);color:#fff;font-family:'Roboto',sans-serif;font-size:.8rem;font-weight:700;padding:7px 16px;border-radius:6px;">${s.btn}</button>
    </div>
  </div>`;
}
function startTutorial(){
  const ac=document.querySelector("#app .btn");
  if(!ac)return;
  const tut=document.createElement("div");
  tut.id="tut";
  tut.style.cssText="position:fixed;bottom:80px;left:0;right:0;display:flex;justify-content:center;z-index:199;pointer-events:none;";
  tut.style.pointerEvents="all";
  document.getElementById("app").appendChild(tut);
  tutStep(0);
}
function exitBattle(){
  const el=document.getElementById("exit-confirm");
  if(!el)return;
  if(el.dataset.step==="1"){
    destroyCanvasScene();
    stopMusic();
    G.bat=null;
    go("title");
  } else {
    el.dataset.step="1";
    el.textContent="⚠ ¿SEGURO?";
    el.style.background="linear-gradient(180deg,#DC2626,#7f1d1d)";
    el.style.color="#fff";
    setTimeout(()=>{
      if(el&&el.dataset.step==="1"){
        el.dataset.step="0";
        el.textContent="🚪 SALIR";
        el.style.background="linear-gradient(180deg,#1a1a1a,#111)";
        el.style.color="#666";
      }
    },2500);
  }
}
function usePotion(){
  const b=G.bat;
  if(b.ct!=="p1"||b.locked)return;
  if(!b.potions1){amsg('<span style="color:#FDA4AF;font-weight:700;">❌ ¡Sin pociones!</span>',1400);return;}
  const pk=b.t1[b.a1];
  if(pk.currentHp>=pk.hp){amsg('<span style="color:#FDA4AF;font-weight:700;">💊 HP ya al máximo</span>',1400);return;}
  b.potions1=0;
  const heal=Math.min(30,pk.hp-pk.currentHp);
  pk.currentHp+=heal;
  blogPush(`<span style="color:#4ade80;font-weight:700;">💊 ${pk.name} recupera ${heal} HP</span>`);
  amsg(`<span style="color:#4ade80;font-size:1.1rem;font-weight:900;">💊 +${heal} HP!</span>`,1600);
  sfxMenu();
  // CPU also acts
  if(G.mode==="cpu"){
    b.locked=true;render();
    setTimeout(()=>{
      const ca=cpuA();
      if(ca.type==="potion"&&b.potions2>0){
        const cp=b.t2[b.a2];
        const ch=Math.min(30,cp.hp-cp.currentHp);
        cp.currentHp+=ch;b.potions2=0;
        blogPush(`<span style="color:#4ade80;font-weight:700;">💊 CPU: ${cp.name} recupera ${ch} HP</span>`);
        b.locked=false;render();
      } else {
        b.locked=false;render();
        setTimeout(()=>execAnim({type:"attack",moveIdx:0},ca),200);
      }
    },1800);
  } else render();
}
function dSave(){if(!G.p1||!G.p2)return;const svs=gs();if(svs.length>=10)svs.pop();svs.unshift({id:Date.now(),ts:Date.now(),p1n:G.p1.name,p2n:G.p2.name,ids:[...(G.p1.team||[]).map(p=>p.id),...(G.p2.team||[]).map(p=>p.id)],st:{p1:JSON.parse(JSON.stringify(G.p1)),p2:JSON.parse(JSON.stringify(G.p2)),mode:G.mode}});ps(svs);alert("✅ ¡Partida guardada!");}

// -- Arena floating message -------------------------------------
// Show message above a specific pokemon (p1=left, p2=right)
function amsgPoke(isP1, html, dur=1800){
  const arena=document.getElementById("arena");
  if(!arena)return;
  const W=arena.offsetWidth||300;
  const H=arena.offsetHeight||300;
  // Position above the pokemon sprite
  const x = isP1 ? (SP.p1cx||W*0.22) : (SP.p2cx||W*0.78);
  const y = SP.groundY>0 ? (SP.groundY - SP.sprH - 70) : H*0.25;
  const d=document.createElement("div");
  d.style.cssText=`position:absolute;left:${Math.round(x)}px;top:${Math.max(10,Math.round(y))}px;transform:translateX(-50%);z-index:25;pointer-events:none;max-width:min(220px,40%);text-align:center;`;
  d.innerHTML=`<div style="background:rgba(5,5,20,.92);backdrop-filter:blur(10px);border:2px solid rgba(255,255,255,.25);border-radius:12px;padding:8px 14px;box-shadow:0 4px 20px rgba(0,0,0,.8);">${html}</div>`;
  d.style.animation="msgPop .3s cubic-bezier(.175,.885,.32,1.275) forwards";
  arena.appendChild(d);
  setTimeout(()=>{
    d.style.opacity="0";d.style.transition="opacity .4s";
    setTimeout(()=>d.remove(),400);
  },dur);
}

// Battle log — keeps last 3 messages
const BLOG=[];
function updateBattleLog(){
  const el=document.getElementById("blog");
  if(!el)return;
  el.innerHTML=BLOG.slice(-3).map((h,i)=>`<div style="padding:5px 12px;background:rgba(5,5,20,${.55+i*.15});border-left:2px solid rgba(59,130,246,${.3+i*.2});border-radius:0 6px 6px 0;animation:battleLogSlide .25s ease;font-size:.78rem;line-height:1.4;">${h}</div>`).join("");
}
function blogPush(html){
  BLOG.push(html);
  if(BLOG.length>3)BLOG.shift();
  updateBattleLog();
}
function amsg(html,dur=2000){
  const el=document.getElementById("amsg");if(!el)return;
  const arena=document.getElementById("arena");
  // Always position at ~35% from top of arena (works even before onSpriteLoad fires)
  if(arena){
    const aH=arena.offsetHeight||200;
    el.style.top=Math.round(aH*0.30)+"px";
    el.style.left="50%";
    el.style.right="auto";
    el.style.bottom="auto";
    el.style.transform="translateX(-50%)";
    el.style.width="min(92%,420px)";
    el.style.position="absolute";
  }
  el.innerHTML=`<div style="background:rgba(5,5,20,.92);backdrop-filter:blur(12px);border:2px solid rgba(255,255,255,.25);border-radius:14px;padding:10px 18px;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,.8);">${html}</div>`;
  blogPush(html);
  el.style.display="block";
  el.style.animation="none";void el.offsetWidth;
  el.style.animation="msgPop .3s cubic-bezier(.175,.885,.32,1.275) forwards";
  clearTimeout(G._mt);
  G._mt=setTimeout(()=>{
    if(el){el.style.opacity="0";el.style.transition="opacity .3s";}
    setTimeout(()=>{if(el){el.style.display="none";el.style.opacity="1";el.style.transition="";}},350);
  },dur);
}

// -- Effects ----------------------------------------------------
