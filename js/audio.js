// PokéBattle Audio — Web Audio API, SFX, Music

// ========================================
// AUDIO (Web Audio API - better sounds)
// ========================================
let AC=null;
function getAC(){if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)();}catch(e){}}return AC;}
function note(freq,dur,type,vol,atk,dec,vib=0){
  try{
    const ac=getAC();if(!ac)return;
    const g=ac.createGain(),o=ac.createOscillator();
    if(vib>0){const lfo=ac.createOscillator(),lg=ac.createGain();lfo.frequency.value=vib;lg.gain.value=10;lfo.connect(lg);lg.connect(o.frequency);lfo.start();}
    o.type=type;o.frequency.value=freq;
    g.gain.setValueAtTime(0,ac.currentTime);
    g.gain.linearRampToValueAtTime(vol,ac.currentTime+atk);
    g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+atk+dec+dur);
    o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+atk+dec+dur+.1);
  }catch(e){}
}
function sfxAtk(){if(!CFG.sfx)return;note(440,.05,"sawtooth",.2,.01,.15,5);setTimeout(()=>note(330,.08,"sawtooth",.15,.01,.2),60);}
function sfxHit(){if(!CFG.sfx)return;note(180,.05,"square",.3,.005,.2);note(90,.1,"triangle",.2,.005,.25);}
function sfxSuper(){if(!CFG.sfx)return;[523,659,784,1047].forEach((f,i)=>setTimeout(()=>note(f,.12,"square",.22,.01,.15),i*65));}
function sfxWeak(){if(!CFG.sfx)return;note(220,.15,"triangle",.12,.01,.3);}
function sfxFaint(){if(!CFG.sfx)return;[300,250,180,120,80].forEach((f,i)=>setTimeout(()=>note(f,.15,"sawtooth",.18,.01,.18),i*80));}
function sfxMenu(){if(!CFG.sfx)return;note(660,.03,"square",.1,.005,.06);}
function sfxSel(){if(!CFG.sfx)return;note(880,.04,"square",.12,.005,.05);setTimeout(()=>note(1100,.04,"square",.1,.005,.05),50);}
function sfxDefeat(){
  if(!CFG.sfx)return;
  const seq=[
    {f:392,t:0,d:.3,v:.2,tp:"sawtooth"},{f:349,t:350,d:.3,v:.18,tp:"sawtooth"},
    {f:330,t:700,d:.3,v:.18,tp:"sawtooth"},{f:294,t:1050,d:.6,v:.15,tp:"sawtooth"},
  ];
  seq.forEach(s=>setTimeout(()=>note(s.f,s.d,s.tp,s.v,.02,s.d*.9),s.t));
}
function sfxVic(){
  if(!CFG.sfx)return;
  // Dramatic victory fanfare — builds up then resolves
  const seq=[
    {f:523,t:0,d:.12,v:.25,tp:"square"},{f:523,t:130,d:.12,v:.25,tp:"square"},
    {f:523,t:260,d:.25,v:.3,tp:"square"},{f:415,t:390,d:.15,v:.2,tp:"square"},
    {f:523,t:520,d:.15,v:.25,tp:"square"},{f:659,t:700,d:.2,v:.3,tp:"square"},
    {f:784,t:900,d:.4,v:.3,tp:"square"},
    // Crash chord
    {f:523,t:1000,d:.5,v:.15,tp:"sawtooth"},{f:659,t:1000,d:.5,v:.15,tp:"sawtooth"},{f:784,t:1000,d:.5,v:.1,tp:"square"},
    // Resolution
    {f:1047,t:1400,d:.6,v:.25,tp:"square"},
  ];
  seq.forEach(s=>setTimeout(()=>note(s.f,s.d,s.tp,s.v,.01,s.d*.8),s.t));
  // Bass boom on KO
  setTimeout(()=>{note(80,.3,"sine",.4,.005,.4);note(120,.2,"sine",.3,.005,.3);},0);
}

// -- EPIC BATTLE MUSIC -----------------------------------------
// Settings: persist in localStorage
const CFG_KEY="pbCfg";
function loadCfg(){try{return JSON.parse(localStorage.getItem(CFG_KEY)||"{}");}catch(e){return{};}}
function saveCfg(k,v){const cfg=loadCfg();cfg[k]=v;try{localStorage.setItem(CFG_KEY,JSON.stringify(cfg));}catch(e){}}
let CFG={music:loadCfg().music!==false,sfx:loadCfg().sfx!==false};

let MUSIC={node:null,running:false,ac:null};
function startMusic(){
  if(!CFG.music||MUSIC.running)return;
  try{
    const ac=getAC();if(!ac)return;
    MUSIC.ac=ac;MUSIC.running=true;
    const master=ac.createGain();master.gain.value=0.18;master.connect(ac.destination);
    MUSIC.node=master;

    // Scenario-specific music parameters
    const scName=G.scenario?G.scenario.name:"estadio";
    const themes={
      campo:   {bpm:132,key:[0,2,4,7,9],mood:"bright"},
      estadio: {bpm:140,key:[0,3,5,7,10],mood:"epic"},
      futbol:  {bpm:148,key:[0,2,5,7,9],mood:"energetic"},
      galaxia: {bpm:120,key:[0,2,5,8,10],mood:"space"},
      cueva:   {bpm:108,key:[0,1,5,6,10],mood:"dark"},
      playa:   {bpm:128,key:[0,2,4,7,9],mood:"tropical"},
      noche:   {bpm:112,key:[0,2,5,7,9],mood:"mysterious"},
    };
    const theme=themes[scName]||themes.estadio;
    const BPM=theme.bpm,BEAT=60/BPM,BAR=BEAT*4;
    // Main melody notes (loop 8 bars)
    const melody=[
      [0,0.5,"E5"],[0.5,0.25,"D5"],[0.75,0.25,"C5"],
      [1,0.5,"E5"],[1.5,0.5,"G5"],
      [2,0.5,"A5"],[2.5,0.25,"G5"],[2.75,0.25,"F5"],
      [3,1,"E5"],
      [4,0.5,"C5"],[4.5,0.5,"E5"],
      [5,0.5,"G5"],[5.5,0.5,"A5"],
      [6,0.5,"B5"],[6.5,0.25,"A5"],[6.75,0.25,"G5"],
      [7,1,"E5"],
    ];
    // Bass line
    const bass=[
      [0,0.5,"E3"],[1,0.5,"A3"],[2,0.5,"F3"],[3,0.5,"G3"],
      [4,0.5,"C3"],[5,0.5,"E3"],[6,0.5,"G3"],[7,0.5,"E3"],
    ];
    // Percussion pattern (kick+snare)
    const perc=[
      {t:0,f:60,d:0.1,v:0.35,type:"sine"},  // kick
      {t:BEAT*2,f:200,d:0.05,v:0.2,type:"square"}, // snare
      {t:BEAT*4,f:60,d:0.1,v:0.35,type:"sine"},
      {t:BEAT*6,f:200,d:0.05,v:0.2,type:"square"},
    ];
    const NOTE_FREQ={
      "C3":130.8,"E3":164.8,"F3":174.6,"G3":196,"A3":220,"B3":246.9,
      "C4":261.6,"E4":329.6,"G4":392,"A4":440,
      "C5":523.3,"D5":587.3,"E5":659.3,"F5":698.5,"G5":784,"A5":880,"B5":987.8
    };
    const LOOP_LEN=BAR*8;
    let startT=ac.currentTime+0.1;
    function scheduleLoop(loopStart){
      if(!MUSIC.running)return;
      // Schedule melody
      melody.forEach(([beat,dur,note])=>{
        const t=loopStart+beat*BEAT;
        const g=ac.createGain(),o=ac.createOscillator();
        o.type="square";o.frequency.value=NOTE_FREQ[note]||440;
        g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(0.3,t+0.02);
        g.gain.exponentialRampToValueAtTime(0.001,t+dur*BEAT*0.9);
        o.connect(g);g.connect(master);o.start(t);o.stop(t+dur*BEAT);
      });
      // Schedule bass
      bass.forEach(([beat,dur,note])=>{
        const t=loopStart+beat*BEAT;
        const g=ac.createGain(),o=ac.createOscillator();
        o.type="sawtooth";o.frequency.value=NOTE_FREQ[note]||110;
        g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(0.25,t+0.01);
        g.gain.exponentialRampToValueAtTime(0.001,t+dur*BEAT*0.8);
        o.connect(g);g.connect(master);o.start(t);o.stop(t+dur*BEAT);
      });
      // Schedule percussion each bar
      for(let bar=0;bar<8;bar++){
        perc.forEach(({t,f,d,v,type})=>{
          const pt=loopStart+bar*BAR+t;
          const g=ac.createGain(),o=ac.createOscillator();
          o.type=type;o.frequency.value=f;
          g.gain.setValueAtTime(0,pt);g.gain.linearRampToValueAtTime(v,pt+0.005);
          g.gain.exponentialRampToValueAtTime(0.001,pt+d);
          o.connect(g);g.connect(master);o.start(pt);o.stop(pt+d+0.05);
        });
      }
      // Hi-hat 8th notes
      for(let i=0;i<32;i++){
        const pt=loopStart+i*(BEAT/2);
        const g=ac.createGain(),buf=ac.createBuffer(1,ac.sampleRate*0.04,ac.sampleRate);
        const data=buf.getChannelData(0);for(let j=0;j<data.length;j++)data[j]=(Math.random()*2-1)*0.3;
        const src=ac.createBufferSource();src.buffer=buf;
        g.gain.setValueAtTime(0.15,pt);g.gain.exponentialRampToValueAtTime(0.001,pt+0.04);
        src.connect(g);g.connect(master);src.start(pt);
      }
      // Schedule next loop
      if(MUSIC.running){
        const nextLoop=loopStart+LOOP_LEN;
        const delay=(nextLoop-ac.currentTime-0.1)*1000;
        setTimeout(()=>scheduleLoop(nextLoop),Math.max(0,delay));
      }
    }
    scheduleLoop(startT);
  }catch(e){console.log("Music error:",e);}
}
function stopMusic(){
  MUSIC.running=false;
  if(MUSIC.node){try{MUSIC.node.gain.linearRampToValueAtTime(0,MUSIC.ac.currentTime+0.5);}catch(e){}}
  MUSIC.node=null;
}
function toggleMusic(){
  CFG.music=!CFG.music;saveCfg("music",CFG.music);
  if(CFG.music&&G.scr==="battle")startMusic();
  else if(!CFG.music)stopMusic();
  render();
}
function toggleSfx(){
  CFG.sfx=!CFG.sfx;saveCfg("sfx",CFG.sfx);
  render();
}
function sfxSwitch(){note(330,.03,"square",.1,.005,.05);setTimeout(()=>note(500,.05,"square",.12,.005,.08),50);}

// ========================================
// BATTLE SCENARIOS
// ========================================
