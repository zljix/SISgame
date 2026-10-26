import Phaser from 'phaser';
import './style.css';
import { act, applyPermissions, arcadeScore, CHECK_NAMES, collect, FILES, has, newRun, nextTarget, ready, score, VERSION, type Difficulty, type Permissions, type Result, type Run } from './core.ts';
import { LEVELS, TARGET_TEXT, type Station } from './data.ts';
import { Sector, type Bridge } from './game.ts';
import { emptySave, parseSave, recordBest, SAVE_KEY, totalXP, type Save } from './storage.ts';

const icons = {
 shield:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6z"/><path d="m8 12 3 3 5-6"/></svg>',
 arrow:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>',
 pause:'<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>',
 gear:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="4"/><path d="m9 3 1-1h4l1 1 1 3 3 1 2 3v4l-2 3-3 1-1 3H9l-1-3-3-1-2-3v-4l2-3 3-1z"/></svg>',
 download:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/></svg>',
 check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 12 4 4L19 6"/></svg>',
 bolt:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m14 2-9 12h7l-2 8 9-12h-7z"/></svg>',
 lock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v3"/></svg>',
 file:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 3h8l4 4v14H6zM14 3v5h4M9 12h6m-6 4h6"/></svg>',
 help:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 0 1 6 0c0 2-3 2-3 5m0 2v2"/></svg>',
};
const ico=(k:keyof typeof icons)=>`<span class="icon" aria-hidden="true">${icons[k]}</span>`;
const app=document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML=`
<main id="home" class="home">
 <header class="home-header"><a href="./" class="brand" aria-label="SISgame početna">${ico('shield')}<span>SIS<span class="brand-light">game</span></span></a><div class="top-actions"><button class="icon-button offline-button" title="Instalacija i rad bez interneta" aria-label="Instalacija i rad bez interneta">${ico('download')}</button><button id="home-settings" class="icon-button" aria-label="Postavke">${ico('gear')}</button></div></header>
 <section class="hero"><div class="hero-copy"><div class="eyebrow"><span class="live-dot"></span> SIGURNOST INFORMACIJSKIH SUSTAVA</div><h1>Čuvari<br><span>sustava.</span></h1><p>Škola treba tvoju zaštitu.<br>Istraži. Odluči. Provjeri.</p><div class="hero-actions"><button id="play-primary" class="primary large">Započni misiju ${ico('arrow')}</button><button id="how-play" class="text-button">Kako se igra? ${ico('help')}</button></div><div class="hero-meta"><span>2D ARKADA</span><i></i><span>3 MISIJE</span><i></i><span>BEZ PRIJAVE</span></div></div>
 <div class="hero-art" aria-hidden="true"><div class="art-topline"><span>ŠKOLSKA MREŽA</span><span class="status-small">ČEKA ČUVARA</span></div><svg class="campus" viewBox="0 0 520 360" fill="none"><defs><pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0v24" stroke="#31445a" stroke-width=".5"/></pattern></defs><rect width="520" height="360" fill="url(#grid)"/><path d="M109 85h144v196h158M109 85v196h144m0-196h158v196" stroke="#365e6d" stroke-width="9"/><path d="M109 85h144v196h158" stroke="#6ee7b6" stroke-width="2" stroke-dasharray="5 8"/><g fill="#233a50" stroke="#456079" stroke-width="2"><rect x="59" y="42" width="100" height="85" rx="8"/><rect x="203" y="42" width="100" height="85" rx="8"/><rect x="361" y="42" width="100" height="85" rx="8"/><rect x="59" y="238" width="100" height="85" rx="8"/><rect x="203" y="238" width="100" height="85" rx="8"/><rect x="361" y="238" width="100" height="85" rx="8"/></g><g fill="#112439"><rect x="75" y="57" width="68" height="55" rx="4"/><rect x="219" y="57" width="68" height="55" rx="4"/><rect x="377" y="57" width="68" height="55" rx="4"/></g><g fill="#7bc8e5"><rect x="84" y="67" width="50" height="7"/><rect x="84" y="81" width="50" height="7"/><rect x="84" y="95" width="29" height="5"/><rect x="231" y="66" width="44" height="34" rx="3"/><rect x="394" y="65" width="34" height="40" rx="3"/></g><path d="m247 72-9 14h12l-3 10 15-19h-12z" fill="#183447"/><path d="M402 78h18m-18 8h18m-18 8h13" stroke="#183447" stroke-width="3"/><path d="M109 256 130 264v18c0 15-21 25-21 25s-21-10-21-25v-18z" fill="#6ee7b6"/><path d="m99 280 7 7 14-16" stroke="#163b3b" stroke-width="4"/><rect x="232" y="257" width="43" height="45" rx="3" fill="#ffd087"/><path d="M243 270h20m-20 10h20m-20 10h13" stroke="#6a583b" stroke-width="4"/><rect x="391" y="258" width="40" height="43" rx="5" fill="#a99aef"/><path d="M402 272h18m-18 12h18" stroke="#40375d" stroke-width="4"/><g class="robot"><ellipse cx="253" cy="209" rx="28" ry="7" fill="#091723" opacity=".5"/><path d="M235 149h36v10h10v35h-10v14h-12v-10h-12v10h-12v-14h-10v-35h10z" fill="#7cd9ea"/><path d="M237 159h32v23h-32z" fill="#102b3e"/><path d="M241 166h8v8h-8zm18 0h8v8h-8z" fill="#ddfff5"/><path d="M243 190h20v6h-20z" fill="#67e7ab"/><path d="M225 181h-9v20h9zm56 0h9v20h-9z" fill="#67e7ab"/></g><g fill="#ffd087"><path d="m164 177 6 6-6 6-6-6z"/><path d="m338 177 6 6-6 6-6-6z"/></g></svg><div class="art-caption"><span class="mini-shield">${ico('shield')}</span><div><strong>Tri sektora. Jedna zadaća.</strong><span>Sačuvaj podatke i omogući rad škole.</span></div></div></div>
 </section>
 <section class="campaign"><div class="section-line"><div><span class="eyebrow">TVOJA KAMPANJA</span><h2>Od prvog koraka do oporavka.</h2></div><div class="xp-pill">${ico('bolt')}<strong id="total-xp">0</strong><span>XP</span></div></div><div id="missions" class="mission-grid"></div></section>
 <footer class="home-footer"><span id="save-status">Napredak se sprema na ovom uređaju.</span><button id="version" class="text-button">v${VERSION}</button></footer>
</main>
<section id="play" class="play" aria-label="Igra" inert aria-hidden="true"><header class="hud"><button id="back-map" class="hud-logo" aria-label="Pauza i karta misija">${ico('shield')}<span>SISgame</span></button><div class="hud-mission"><small id="level-number">SEKTOR 01</small><strong id="level-title">Zaključaj rizik</strong></div><div class="hud-stats"><div class="health" id="health" aria-label="Energija: 3 od 3">● ● ●</div><div class="score"><strong id="run-xp">0</strong><span>XP</span></div><button id="lesson" class="icon-button" aria-label="Pouka i cilj misije">${ico('help')}</button><button id="pause" class="icon-button" aria-label="Pauza">${ico('pause')}</button></div></header>
 <div id="notice-slot"></div><div id="game-stage"><div id="canvas-host"></div><button id="goal" class="goal"><span id="goal-count">0/4</span><span id="goal-text">Preuzmi službenu karticu</span><span class="goal-arrow">↗</span></button><div class="map-caption">DODIRNI TLO ZA KRETANJE</div><div class="controls"><div id="joystick" class="joystick" role="group" aria-label="Virtualna palica za kretanje"><div class="joy-cross"></div><div id="joy-thumb" class="joy-thumb"></div></div><div id="nearby" class="nearby" aria-live="polite"></div><div class="action-controls"><button id="shield" class="shield-control" aria-label="Aktiviraj štit">${ico('shield')}<span id="shield-label">Štit</span><kbd>Q</kbd></button><button id="action" class="action-control" disabled>${ico('bolt')}<span id="action-label">Priđi opremi</span><kbd>E</kbd></button></div></div></div>
</section>
<dialog id="dialog" aria-labelledby="dialog-title"></dialog><div id="toast" class="toast" hidden><div id="toast-message" role="status" aria-live="polite" aria-atomic="true"></div><button id="toast-close" aria-label="Zatvori obavijest">×</button></div>`;

const $=<T extends HTMLElement=HTMLElement>(s:string)=>document.querySelector<T>(s)!;
let save:Save;let storageOK=true;
try {save=parseSave(localStorage.getItem(SAVE_KEY));}catch{save=emptySave();storageOK=false;}
let run=save.active||newRun(1,save.settings.difficulty), running=false, near:Station|null=null;
let closeHook:(()=>void)|null=null;let toastTimer:number|undefined;let dialogObserver:ResizeObserver|undefined;
let audio:AudioContext|undefined;
const dialog=$<HTMLDialogElement>('#dialog');
const bridge:Bridge={paused:true,axes:{x:0,y:0},reducedMotion:save.settings.reducedMotion,
  interact:openStation,changed:()=>{if(running){save.active=run;recordBest(save,run);persist();updateHUD();}},result:showResult,nearby:s=>{near=s;updateNear();},hit:()=>{tone(180);updateHUD();},shield:remaining=>{
    const text=remaining>0?`${Math.ceil(remaining)} s`:'Štit';if($('#shield-label').textContent!==text)$('#shield-label').textContent=text;
    $('#shield').classList.toggle('cooldown',remaining>0);
  }};
const sector=new Sector(bridge);
const game=new Phaser.Game({type:Phaser.AUTO,parent:'canvas-host',backgroundColor:'#132632',pixelArt:true,antialias:false,scene:[sector],scale:{mode:Phaser.Scale.RESIZE,width:window.innerWidth,height:window.innerHeight-68},input:{activePointers:3},render:{roundPixels:true},audio:{noAudio:true}});

function persist(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(save));storageOK=true;}catch{storageOK=false;}$('#save-status').textContent=storageOK?'Napredak se sprema na ovom uređaju.':'Spremanje trenutačno nije dostupno u ovom pregledniku.';}
function tone(freq=650){if(!save.settings.sound)return;try{audio??=new AudioContext();void audio.resume();const osc=audio.createOscillator(),gain=audio.createGain();osc.type='sine';osc.frequency.value=freq;gain.gain.setValueAtTime(.05,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.12);osc.connect(gain);gain.connect(audio.destination);osc.start();osc.stop(audio.currentTime+.12);}catch{/* sound is optional */}}
function dismissToast(){window.clearTimeout(toastTimer);const el=$('#toast');el.hidden=true;el.classList.remove('visible');}
function scheduleToastDismiss(){window.clearTimeout(toastTimer);toastTimer=window.setTimeout(dismissToast,12000);}
function toast(title:string,message:string,ok=true){
  const el=$('#toast');(running?$('#notice-slot'):app).append(el);
  $('#toast-message').innerHTML=`<span class="toast-symbol" aria-hidden="true">${ok?'✓':'!'}</span><div><strong>${title}</strong><p>${message}</p></div>`;
  el.className='toast visible'+(ok?'':' caution');el.hidden=false;scheduleToastDismiss();
}
$('#toast-close').onclick=dismissToast;
$('#toast').addEventListener('pointerenter',()=>window.clearTimeout(toastTimer));
$('#toast').addEventListener('pointerleave',scheduleToastDismiss);
$('#toast').addEventListener('focusin',()=>window.clearTimeout(toastTimer));
$('#toast').addEventListener('focusout',scheduleToastDismiss);
function showResult(result:Result){toast(result.title,result.message,result.ok);if(result.ok)tone();}
function renderHome(){
  const complete=Object.values(save.best).filter(b=>b.completed).length;
  $('#total-xp').textContent=String(totalXP(save));
  $('#play-primary').innerHTML=`${save.active?'Nastavi misiju':complete===3?'Igraj ponovno':'Započni misiju'} ${ico('arrow')}`;
  $('#missions').innerHTML=LEVELS.map((level,i)=>{const b=save.best[level.id],unlocked=i===0||!!save.best[i]?.completed;return `<button class="mission-card ${b?.completed?'completed':''}" data-level="${level.id}" ${unlocked?'':'disabled'} style="--accent:${level.color}"><div class="mission-top"><span class="sector-number">0${level.id}</span><span class="mission-symbol">${ico((['shield','lock','file'] as const)[i])}</span><span class="mission-state">${b?.completed?'ZAVRŠENO':unlocked?'DOSTUPNO':'ZAKLJUČANO'}</span></div><span class="eyebrow">${level.subtitle}</span><h3>${level.title}</h3><p>${level.description}</p><div class="mission-foot"><span>${b?.completed?`${b.learning} učenje · ${b.arcade} bonus`:'4 sigurnosne zadaće'}</span>${ico(unlocked?'arrow':'lock')}</div><div class="mission-progress"><span style="width:${b?.learning||0}%"></span></div></button>`;}).join('');
  document.querySelectorAll<HTMLButtonElement>('[data-level]').forEach(b=>b.onclick=()=>start(Number(b.dataset.level),save.active?.level===Number(b.dataset.level)));
}
function start(level:number,resume=false){
  if(dialog.open)closeDialog();dismissToast();run=resume&&save.active?save.active:newRun(level,save.settings.difficulty);running=true;bridge.paused=true;save.active=run;persist();
  document.body.classList.add('playing');$('#home').hidden=true;$('#play').removeAttribute('inert');$('#play').setAttribute('aria-hidden','false');
  sector.startRun(run);near=null;updateNear();updateHUD();
  requestAnimationFrame(resizeGame);
  briefing(resume);
}
function home(){if(dialog.open)closeDialog();bridge.paused=true;sector.resetInput();running=false;document.body.classList.remove('playing');$('#home').hidden=false;$('#play').setAttribute('inert','');$('#play').setAttribute('aria-hidden','true');dismissToast();renderHome();}
function updateHUD(){const level=LEVELS[run.level-1];$('#level-number').textContent=`SEKTOR 0${run.level}`;$('#level-title').textContent=level.title;$('#run-xp').textContent=String(score(run)+arcadeScore(run));$('#health').textContent='● '.repeat(run.health)+'○ '.repeat(3-run.health);$('#health').setAttribute('aria-label',`Energija: ${run.health} od 3`);$('#goal-count').textContent=`${Object.values(run.checks).filter(c=>c.done).length}/4`;const target=nextTarget(run);$('#goal-text').textContent=target==='backup'&&has(run,'failure')?'Obnovi podatke iz kopije':TARGET_TEXT[target];$('#goal').title='Dodirni za kretanje prema cilju';sector.sync?.();}
function updateNear(){const action=$<HTMLButtonElement>('#action');action.disabled=!near;$('#action-label').textContent=near?'Djeluj':'Priđi opremi';$('#nearby').innerHTML=near?`<strong>${near.label}</strong><span>Pritisni E ili dodirni Djeluj</span>`:'';}
function syncDialogScroll(){
  if(!dialog.open)return;
  const body=$('#dialog-body');
  $('#dialog-scroll-hint').hidden=body.scrollTop+body.clientHeight>=body.scrollHeight-3;
}
function revealFeedback(title:string,message:string){
  const feedback=$('#feedback');feedback.innerHTML=`<strong>${title}</strong><p>${message}</p>`;feedback.hidden=false;
  requestAnimationFrame(()=>{feedback.scrollIntoView({block:'nearest'});syncDialogScroll();});
}
function openDialog(body:string,mount?:()=>void,onClose?:()=>void){
  dialogObserver?.disconnect();if(dialog.open)dialog.close();bridge.paused=true;releaseStick();sector.resetInput();closeHook=onClose||null;
  dialog.innerHTML=`<header class="dialog-header"><div class="dialog-heading"></div><button id="dialog-close" class="dialog-close" aria-label="Zatvori" autofocus>×</button></header><div id="dialog-body" class="dialog-body" role="region" aria-label="Sadržaj prozora" tabindex="0"><div class="dialog-content">${body}</div></div><div id="dialog-scroll-hint" class="dialog-scroll-hint" aria-hidden="true" hidden>Pomakni za više ↓</div><footer class="dialog-actions" hidden></footer>`;
  const content=$('.dialog-content'),heading=$('.dialog-heading'),actions=$('.dialog-actions');
  for(const child of Array.from(content.children)){
    if(child.matches('.eyebrow,h2'))heading.append(child);
    else if(child.matches('.finish-icon'))child.remove();
    else if(child.matches('button.wide'))actions.append(child);
    else if(child.matches('.stack-buttons')){actions.append(...Array.from(child.children));child.remove();}
  }
  actions.hidden=!actions.childElementCount;document.body.classList.add('modal-open');
  dialog.showModal();$('#dialog-close').onclick=closeDialog;mount?.();
  $('#dialog-body').addEventListener('scroll',syncDialogScroll,{passive:true});
  dialogObserver=new ResizeObserver(syncDialogScroll);dialogObserver.observe($('#dialog-body'));dialogObserver.observe(content);
  requestAnimationFrame(syncDialogScroll);
}
function closeDialog(){const hook=closeHook;closeHook=null;dialogObserver?.disconnect();dialog.close();document.body.classList.remove('modal-open');bridge.paused=!running||run.completed;sector.resetInput();hook?.();}
dialog.addEventListener('cancel',e=>{e.preventDefault();closeDialog();});
function briefing(resume=false){const level=LEVELS[run.level-1];openDialog(`<div class="eyebrow">MISIJA 0${level.id} · ${level.subtitle}</div><h2 id="dialog-title">${resume?'Nastavljamo: ':''}${level.title}</h2><p class="dialog-lead">${level.description}</p><div class="lesson-grid">${level.lesson.map(([title,text],i)=>`<article><span>0${i+1}</span><div><h3>${title}</h3><p>${text}</p></div></article>`).join('')}</div><div class="note"><strong>Upravljanje</strong> Palica ili WASD / strelice za kretanje. E za radnju, Q ili razmak za štit. Dodir tla ili cilja također vodi lika. Crvene smetnje su arkadne prepreke; štit ih privremeno čini bezopasnima za lika.</div><button id="begin" class="primary wide">${resume?'Nastavi gdje si stao':'Kreni u misiju'} ${ico('arrow')}</button>`,()=>{$('#begin').onclick=()=>{closeDialog();if(!resume)toast('Prati zeleni krug','Dodirni cilj pri vrhu ako želiš pomoć pri kretanju. Žuti bitovi donose bonus.',true);};});}
function pause(){if(!running)return;openDialog(`<div class="eyebrow">ODMOR ZA ČUVARA</div><h2 id="dialog-title">Misija je pauzirana.</h2><p class="dialog-lead">Napredak je spremljen na ovom uređaju. Nastavi kad budeš spreman.</p><div class="pause-summary"><span>${score(run)}/100<small>učenje</small></span><span>${arcadeScore(run)}<small>arkadni bonus</small></span><span>${run.health}/3<small>energija</small></span></div><div class="stack-buttons"><button id="resume" class="primary wide">Nastavi igru ${ico('arrow')}</button><button id="show-lesson" class="secondary wide">Ponovi pouku</button><button id="to-home" class="text-button">Karta misija</button></div>`,()=>{$('#resume').onclick=closeDialog;$('#show-lesson').onclick=()=>briefing(true);$('#to-home').onclick=home;});}
function finish(){recordBest(save,run);save.active=null;persist();tone(900);const checks=Object.entries(run.checks);const independent=checks.filter(([,c])=>c.errors===0).length;openDialog(`<div class="finish-icon">${ico('shield')}</div><div class="eyebrow">SEKTOR 0${run.level} OSIGURAN</div><h2 id="dialog-title">Dobro odrađeno, <br>čuvaru.</h2><p class="dialog-lead">Zaštitu si postavio i isprobao. Sljedeći korak je primijeniti je u stvarnoj laboratorijskoj vježbi.</p><div class="pause-summary"><span>${score(run)}<small>bodova učenja</small></span><span>+${arcadeScore(run)}<small>arkadni bonus</small></span><span>${independent}/4<small>bez ispravka</small></span></div><ul class="results-list">${checks.map(([key,c])=>`<li>${ico('check')}<span>${CHECK_NAMES[key]}</span><small>${c.errors?'uz ispravak':'samostalno'}</small></li>`).join('')}</ul><p class="fine-print">Ovo je zapis vježbanja, a ne zaključna ocjena. Ponavljanjem možeš poboljšati najbolji rezultat.</p><button id="next" class="primary wide">${run.level<3?'Sljedeća misija':'Povratak na kartu'} ${ico('arrow')}</button><button id="results-home" class="text-button wide">Karta misija</button>`,()=>{$('#next').onclick=()=>{closeHook=null;if(run.level<3)start(run.level+1);else home();};$('#results-home').onclick=()=>{closeHook=null;home();};},home);}
function perform(station:string,choice:string){const result=act(run,station,choice);recordBest(save,run);save.active=run.completed?null:run;persist();updateHUD();if(result.complete){closeDialog();finish();return;}if(result.ok){closeDialog();showResult(result);}else{const feedback=document.getElementById('feedback');if(feedback){revealFeedback(result.title,result.message);}else showResult(result);}}
type Option=[string,string,string];
function choices(s:Station,description:string,options:Option[],extra=''){openDialog(`<div class="eyebrow">${LEVELS[run.level-1].subtitle}</div><h2 id="dialog-title">${s.label}</h2><p class="dialog-lead">${description}</p>${extra}<div class="choices">${options.map(([value,label,detail])=>`<button class="choice" data-choice="${value}"><span><strong>${label}</strong><small>${detail}</small></span>${ico('arrow')}</button>`).join('')}</div><div id="feedback" class="feedback" role="status" hidden></div>`,()=>{document.querySelectorAll<HTMLButtonElement>('[data-choice]').forEach(b=>b.onclick=()=>perform(s.id,b.dataset.choice!));});}
function openStation(s:Station){
  if(s.collectible){const r=collect(run,s.id);showResult(r);bridge.changed();return;}
  if(s.id==='exit'){perform('exit','finish');return;}
  if(run.checks[s.id]?.done&&s.id!=='backup'){toast('Ova zadaća je dovršena','Sljedeći cilj prikazan je pri vrhu. Ostvareni bodovi ostaju sačuvani.');return;}
  if(s.id==='door')return choices(s,'Osiguraj da u sobu mogu ući samo osobe koje imaju ovlast.',[['authorized','Uključi provjeru kartice','Ovlaštenu karticu prihvati, neovlaštenu odbij.'],['camera','Uključi samo kameru','Vrata ostaju otvorena, a kamera snima.'],['closed','Zabrani pristup svima','Ni ovlaštene osobe neće moći ući.']]);
  if(s.id==='ups')return choices(s,'UPS ima pričuvnu bateriju ograničenog kapaciteta. Koju ćeš opremu njime zaštititi u ovoj sobi?', [['server','Spoji poslužitelj na UPS','Omogući spremanje rada i uredno gašenje.'],['projector','Spoji samo projektor','Poslužitelj ostaje bez pričuvnog napajanja.'],['cable','Koristi običan produžni kabel','Nema bateriju za nestanak napajanja.']]);
  if(s.id==='shred')return choices(s,'Ispis s osobnim podatcima više nije potreban. Odaberi postupak zbrinjavanja.',[['destroy','Upotrijebi odgovarajući uništavač','Onemogući jednostavno čitanje osjetljivog ispisa.'],['bin','Odloži cijeli ispis u koš','Papir ostaje čitljiv.'],['fold','Presavij i odloži ispis','Sadržaj je skriven samo dok se list ne otvori.']]);
  if(s.id==='drill')return choices(s,'Provjeri djeluje li zaštita koju si postavio. Simulacija ispituje obje vrste kartica, nestanak napajanja i čitljivost odbačenog ispisa.',[['test','Pokreni probne događaje','Provjeri pristup, uredno gašenje i ispis.']],`<div class="system-list">${[['door','Pristup prostoru'],['ups','Pričuvno napajanje'],['shred','Zbrinjavanje ispisa']].map(([id,label])=>`<span>${has(run,id)?'✓':'○'} ${label}</span>`).join('')}</div>`);
  if(s.id==='schedule'||s.id==='grades')return permissions(s,s.id);
  if(s.id==='encrypt')return choices(s,'Povjerljiva datoteka treba putovati do sigurne arhive. Zaštiti njezin sadržaj prije prijenosa.',[['encrypt','Šifriraj sadržaj','Arhiva ima odgovarajući ključ za dešifriranje.'],['rename','Samo promijeni naziv','Nazovi datoteku tajno.dat.']]);
  if(s.id==='deliver')return choices(s,'Arhiva provjerava ovlast, dešifrira datoteku svojim ključem i uspoređuje sadržaj s izvornikom.',[['verify','Predaj i provjeri datoteku','Potvrdi da je ovlaštenom korisniku sadržaj dostupan.']],`<div class="payload">${ico('file')}<div><strong>Povjerljiva datoteka</strong><span>${has(run,'encrypt')?'Šifrirana · ključ čuva ovlaštena arhiva':'Sadržaj još nije šifriran'}</span></div></div>`);
  if(s.id==='backup'){
    if(has(run,'failure'))return choices(s,'Radni disk više nije dostupan. Kopija na odvojenom, sigurno spremljenom disku je sačuvana.',[['restore','Obnovi na zamjenski disk',`Vrati ${run.backup.length} spremljene datoteke pa provjeri sadržaj.`]],fileList(run.backup));
    return choices(s,'Izradi kopiju svih važnih datoteka koja će preživjeti kvar radnog diska.',[['same','Druga mapa na istom disku','Jedan fizički disk za izvornik i kopiju.'],['separate','Odvojeni vanjski disk','Nakon kopiranja odspoji i sigurno spremi disk.'],['partition','Druga particija istog diska','Podjela prostora na istom fizičkom uređaju.']],fileList(run.files));
  }
  if(s.id==='failure')return choices(s,'Ovo je probni kvar unutar igre. Izvorne datoteke na radnom disku postat će nedostupne.',[['simulate','Pokreni simulirani kvar','Zatim se vrati do odvojene kopije i obnovi podatke.']]);
  if(s.id==='verify'){
    if(!has(run,'restore')){showResult(act(run,'verify','verify'));return;}
    const opened=new Set<string>();
    openDialog(`<div class="eyebrow">PROVJERA OPORAVKA</div><h2 id="dialog-title">Otvori i usporedi.</h2><p class="dialog-lead">Za svaku obnovljenu datoteku provjeri odgovara li sadržaj spremljenoj inačici. Otvori sva tri dokumenta.</p><div class="file-checks">${FILES.map(f=>`<button class="file-check" data-file="${f.id}" aria-expanded="false">${ico('file')}<span><strong>${f.name}</strong><small>Otvori dokument</small></span><span class="file-mark">+</span></button><div class="file-content" id="content-${f.id}" hidden><span>SPREMLJENO</span><p>${f.text}</p><span>OBNOVLJENO</span><p>${run.files.includes(f.id)?f.text:'Datoteka nije pronađena'}</p></div>`).join('')}</div><button id="confirm-files" class="primary wide" disabled>Najprije otvori sve tri datoteke</button>`,()=>{document.querySelectorAll<HTMLButtonElement>('[data-file]').forEach(b=>b.onclick=()=>{opened.add(b.dataset.file!);b.setAttribute('aria-expanded','true');$(`#content-${b.dataset.file}`).hidden=false;b.querySelector('small')!.textContent='Sadržaj je prikazan';b.querySelector('.file-mark')!.textContent='✓';if(opened.size===3){const c=$<HTMLButtonElement>('#confirm-files');c.disabled=false;c.textContent='Potvrdi podudaranje sadržaja';}});$('#confirm-files').onclick=()=>perform('verify','verify');});
  }
}
function fileList(ids:string[]){return `<div class="system-list">${FILES.map(f=>`<span>${ids.includes(f.id)?'✓':'○'} ${f.name}</span>`).join('')}</div>`;}
function permissions(s:Station,kind:'schedule'|'grades'){
  const policy=kind==='schedule'?'Učenik i gost trebaju moći čitati javni raspored. Ovlašteni nastavnik treba ga moći čitati i mijenjati.':'Prema politici ove simulacije samo ovlašteni nastavnik smije čitati i mijenjati mapu Ocjene. Učenik i gost nemaju pristup ovoj mapi.';
  openDialog(`<div class="eyebrow">POSTAVKE PRISTUPA</div><h2 id="dialog-title">${s.label}</h2><p class="dialog-lead">${policy}</p><p class="small-note">Uređivanje uključuje i čitanje. Primijeni najmanje potrebne ovlasti.</p><div class="permission-table">${[['student','Učenik'],['teacher','Nastavnik'],['guest','Gost']].map(([key,name])=>`<label><span>${name}</span><select id="permission-${key}" aria-label="Prava: ${name}"><option value="none">Bez pristupa</option><option value="read">Čitanje</option><option value="write">Uređivanje</option></select></label>`).join('')}</div><button id="apply-permissions" class="primary wide">Primijeni i isprobaj ${ico('check')}</button><div id="feedback" class="feedback" role="status" hidden></div>`,()=>{$('#apply-permissions').onclick=()=>{
    const p={student:$<HTMLSelectElement>('#permission-student').value,teacher:$<HTMLSelectElement>('#permission-teacher').value,guest:$<HTMLSelectElement>('#permission-guest').value} as Permissions;
    const res=applyPermissions(run,kind,p);bridge.changed();if(res.ok){closeDialog();showResult(res);}else{revealFeedback(res.title,res.message);}
  };});
}
function settings(){openDialog(`<div class="eyebrow">TVOJ NAČIN IGRANJA</div><h2 id="dialog-title">Postavke</h2><label class="setting-label" for="difficulty">Težina novih misija</label><select id="difficulty" class="wide-select"><option value="easy">Lagana — sporije smetnje, označeni ciljevi</option><option value="medium">Srednja — brže smetnje, označeni ciljevi</option><option value="hard">Teška — brže smetnje, bez zelenog kruga</option></select><p class="fine-print">Sigurnosni ciljevi ostaju isti. Težina se primjenjuje pri novom pokretanju misije.</p><label class="switch-row">Kratki zvučni efekti<input type="checkbox" id="sound"></label><label class="switch-row">Smanjeno gibanje i bljeskanje<input type="checkbox" id="reduced"></label><button id="save-settings" class="primary wide">Spremi postavke</button><details class="reset-details"><summary>Upravljanje napretkom</summary><p>Brisanje uklanja napredak samo na ovom uređaju.</p><button id="reset-progress" class="danger">Obriši lokalni napredak</button></details>`,()=>{
  $<HTMLSelectElement>('#difficulty').value=save.settings.difficulty;$<HTMLInputElement>('#sound').checked=save.settings.sound;$<HTMLInputElement>('#reduced').checked=save.settings.reducedMotion;
  $('#save-settings').onclick=()=>{save.settings.difficulty=$<HTMLSelectElement>('#difficulty').value as Difficulty;save.settings.sound=$<HTMLInputElement>('#sound').checked;save.settings.reducedMotion=$<HTMLInputElement>('#reduced').checked;bridge.reducedMotion=save.settings.reducedMotion;persist();closeDialog();tone();};
  $('#reset-progress').onclick=()=>openDialog(`<h2 id="dialog-title">Obrisati napredak?</h2><p class="dialog-lead">Izbrisat će se spremljena misija i najbolji rezultati na ovom uređaju.</p><button id="confirm-reset" class="danger wide">Obriši napredak</button><button id="cancel-reset" class="secondary wide">Zadrži napredak</button>`,()=>{$('#confirm-reset').onclick=()=>{save=emptySave();persist();home();};$('#cancel-reset').onclick=closeDialog;});
});}
function how(){openDialog(`<div class="eyebrow">DOBRO DOŠAO, ČUVARU</div><h2 id="dialog-title">Istraži. Odluči. Provjeri.</h2><div class="lesson-grid"><article><span>01</span><div><h3>Kreći se prostorijama</h3><p>Na mobitelu koristi palicu. Na računalu WASD ili strelice. Možeš dodirnuti tlo ili trenutačni cilj za kretanje do njega.</p></div></article><article><span>02</span><div><h3>Priđi i djeluj</h3><p>Kad si blizu opreme, pritisni E ili tipku Djeluj. Uredi zaštitu i isprobaj njezin učinak.</p></div></article><article><span>03</span><div><h3>Izbjegavaj smetnje</h3><p>Q, razmak ili tipka Štit kratko štite lika. Žuti bitovi nose arkadni bonus. Sudari ne brišu naučeno.</p></div></article></div><div class="note">Svaka misija ima 4 sigurnosne zadaće i 100 bodova učenja. Rezultat bilježi i koje si odluke ispravio. Ponavljanje čuva najbolji rezultat bez gomilanja istih bodova.</div><button id="got-it" class="primary wide">Razumijem ${ico('check')}</button>`,()=>$('#got-it').onclick=closeDialog);}

let deferredInstall:{prompt:()=>Promise<void>;userChoice:Promise<{outcome:string}>}|null=null;
let offlineReady=false, waitingWorker:ServiceWorker|null=null;
function offlineInfo(){const isiOS=/iPhone|iPad|iPod/.test(navigator.userAgent);openDialog(`<div class="eyebrow">IGRA PRI RUCI</div><h2 id="dialog-title">Igraj i bez mreže.</h2><p class="dialog-lead">${offlineReady?'Sadržaj ove inačice spremljen je na uređaj. Igru možeš ponovno otvoriti bez interneta.':'Za offline igranje potrebno je prvo preuzeti i spremiti cijelu igru preko interneta.'}</p><div class="note"><strong>${isiOS?'iPhone i iPad':'Dodavanje na početni zaslon'}</strong><p>${isiOS?'U Safariju otvori Dijeli → Dodaj na početni zaslon. Ako je ponuđeno, uključi Otvori kao web-aplikaciju.':'Android: u izborniku Chromea odaberi instalaciju aplikacije. Na iPhoneu: Safari → Dijeli → Dodaj na početni zaslon.'}</p></div><p class="fine-print">Napredak je lokalni. Brisanje podataka preglednika može obrisati igru i napredak; za ponovno preuzimanje potreban je internet.</p>${deferredInstall?'<button id="install-app" class="primary wide">Dodaj igru na uređaj</button>':''}${waitingWorker?'<button id="update-app" class="secondary wide">Učitaj novu inačicu</button>':''}<button id="close-offline" class="text-button wide">Zatvori</button>`,()=>{
  if(deferredInstall)$('#install-app').onclick=async()=>{await deferredInstall!.prompt();await deferredInstall!.userChoice;deferredInstall=null;closeDialog();};
  if(waitingWorker)$('#update-app').onclick=()=>{persist();waitingWorker!.postMessage({type:'SKIP_WAITING'});};$('#close-offline').onclick=closeDialog;
});}
window.addEventListener('beforeinstallprompt',((e:Event)=>{e.preventDefault();deferredInstall=e as unknown as typeof deferredInstall;}) as EventListener);
function markOffline(){offlineReady=true;document.querySelectorAll('.offline-button').forEach(b=>{b.classList.add('ready');b.setAttribute('title','Spremno za offline · instalacija');});}
async function setupOffline(){if(!import.meta.env.PROD||!('serviceWorker'in navigator))return;
  try{const registration=await navigator.serviceWorker.register(new URL('./sw.js',document.baseURI).href,{scope:'./'});waitingWorker=registration.waiting;
    registration.addEventListener('updatefound',()=>{const worker=registration.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller){waitingWorker=worker;toast('Dostupna je nova inačica','Spremi napredak i otvori gumb za instalaciju na karti misija kada želiš ažurirati.');}});});
    const readyRegistration=await navigator.serviceWorker.ready;
    if(readyRegistration.active){const channel=new MessageChannel();channel.port1.onmessage=e=>{if(e.data?.type==='OFFLINE_READY'&&e.data.ready===true)markOffline();};readyRegistration.active.postMessage({type:'CHECK_CACHE'},[channel.port2]);}
  }catch{ /* Online gameplay remains available when installation is unavailable. */ }
  let refreshing=false;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(waitingWorker&&!refreshing){refreshing=true;location.reload();}});
}

$('#play-primary').onclick=()=>{if(save.active)start(save.active.level,true);else start(LEVELS.find(l=>!save.best[l.id]?.completed)?.id||1);};
$('#how-play').onclick=how;$('#home-settings').onclick=settings;$('#version').onclick=()=>openDialog(`<div class="eyebrow">SISGAME ${VERSION}</div><h2 id="dialog-title">Prva kampanja</h2><p class="dialog-lead">Tri igrive misije: fizička zaštita, prava i šifriranje te kopija i oporavak. Dodirne kontrole, tipkovnica, lokalni napredak i offline igranje.</p><button id="version-close" class="primary wide">U redu</button>`,()=>$('#version-close').onclick=closeDialog);
document.querySelectorAll<HTMLButtonElement>('.offline-button').forEach(b=>b.onclick=offlineInfo);
$('#pause').onclick=pause;$('#back-map').onclick=pause;$('#lesson').onclick=()=>briefing(true);$('#goal').onclick=()=>{if(!bridge.paused)sector.guide();};$('#action').onclick=()=>sector.use();$('#shield').onclick=()=>sector.shield();
document.addEventListener('keydown',e=>{if(!running||dialog.open)return;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();if(e.repeat)return;if(e.key.toLowerCase()==='e')sector.use();if(e.key.toLowerCase()==='q'||e.key===' ')sector.shield();if(e.key==='Escape'){e.preventDefault();pause();}});
const stick=$('#joystick'),thumb=$('#joy-thumb');let stickPointer:number|null=null;
function moveStick(e:PointerEvent){const r=stick.getBoundingClientRect(),dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2;const limit=r.width*.3,d=Math.hypot(dx,dy),scale=d>limit?limit/d:1;const x=dx*scale,y=dy*scale;bridge.axes={x:x/limit,y:y/limit};thumb.style.transform=`translate(${x}px,${y}px)`;}
function releaseStick(){stickPointer=null;bridge.axes={x:0,y:0};thumb.style.transform='translate(0,0)';}
stick.addEventListener('pointerdown',e=>{if(bridge.paused)return;stickPointer=e.pointerId;stick.setPointerCapture(e.pointerId);moveStick(e);e.preventDefault();});
stick.addEventListener('pointermove',e=>{if(e.pointerId===stickPointer)moveStick(e);});stick.addEventListener('pointerup',releaseStick);stick.addEventListener('pointercancel',releaseStick);stick.addEventListener('lostpointercapture',releaseStick);
document.addEventListener('visibilitychange',()=>{if(document.hidden){releaseStick();if(running){save.active=run.completed?null:run;persist();if(!dialog.open)pause();}}});
window.addEventListener('blur',()=>{releaseStick();if(running&&!dialog.open)pause();});
window.addEventListener('pagehide',()=>{if(running)save.active=run.completed?null:run;persist();});
function resizeGame(){if(running){game.scale.getParentBounds();game.scale.refresh();}}
new ResizeObserver(resizeGame).observe($('#game-stage'));
renderHome();persist();void setupOffline();
