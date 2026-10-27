import Phaser from 'phaser';
import './style.css';
import { act, advanceReviewClock, applyPermissions, arcadeScore, assessRisks, CHECK_NAMES, classifyAlerts, classifyMalware, collect, configureFirewall, configureServices, configureWifi, FILES, has, newRun, nextTarget, planIncidentResponse, planRiskMeasures, ready, score, secureSession, submitExpertReview, VERSION, type Difficulty, type Permissions, type Result, type Run } from './core.ts';
import { LEVELS, levelContent, missionNumber, TARGET_TEXT, type Station } from './data.ts';
import { DECISIONS, eventsFor, flowsFor, samplesFor, servicesFor, VERIFICATION_REPORTS, type MalwareKind } from './missions.ts';
import { EXPERT_REVIEWS, JUNIOR_CHOICES, JUNIOR_LESSONS, JUNIOR_REPORTS, TERMS, TIERS, TIER_INFO, type ContentTier } from './curriculum.ts';
import { alertsFor, verdictsFor, WIFI_GUESTS, WIFI_SECURITY, wifiPreview, type AlertVerdict, type WifiSettings } from './network.ts';
import { budgetFor, cleanResponse, measuresFor, prioritiesFor, PRIORITIES, responseOptions, responsePreview, riskPreview, risksFor, type RiskPriority } from './operations.ts';
import { Sector, type Bridge } from './game.ts';
import { emptySave, parseSave, profile, recordBest, SAVE_KEY, totalLearning, type Save } from './storage.ts';
import { emptyPracticeProgress, PRACTICE_CASES, practiceCase, practiceFeedback, practiceSummary, practiceUnlocked, setPracticeAnswer, submitPractice } from './practice.ts';
import { createProgressBackup, MAX_BACKUP_BYTES, progressFilename, progressReport, progressSnapshot, readProgressBackup, RESTORE_POINT_KEY, restoreProgress, type ProgressBackup } from './progress.ts';

const icons = {
 radar:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="M12 12 19 5"/><circle cx="8" cy="15" r="1"/></svg>',
 wifi:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 8a15 15 0 0 1 18 0M6 12a10 10 0 0 1 12 0M9 16a5 5 0 0 1 6 0"/><circle cx="12" cy="20" r="1"/></svg>',
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
 bug:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="7" y="7" width="10" height="13" rx="5"/><path d="M9 7V5h6v2m-3 4v9M3 9h4m10 0h4M3 14h4m10 0h4M4 20l4-3m8 0 4 3"/></svg>',
 key:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="8" cy="9" r="5"/><path d="m12 13 8 8m-5-5 3-3m0 6 3-3"/></svg>',
};
const ico=(k:keyof typeof icons)=>`<span class="icon" aria-hidden="true">${icons[k]}</span>`;
const app=document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML=`
<main id="home" class="home">
 <header class="home-header"><a href="./" class="brand" aria-label="SISgame početna">${ico('shield')}<span>SIS<span class="brand-light">game</span></span></a><div class="top-actions"><button class="icon-button offline-button" title="Instalacija i rad bez interneta" aria-label="Instalacija i rad bez interneta">${ico('download')}</button><button id="home-settings" class="icon-button" aria-label="Postavke">${ico('gear')}</button></div></header>
 <section class="hero"><div class="hero-copy"><div class="eyebrow"><span class="live-dot"></span> SIGURNOST INFORMACIJSKIH SUSTAVA</div><h1>Čuvari<br><span>sustava.</span></h1><p>Škola treba tvoju zaštitu.<br>Istraži. Odluči. Provjeri.</p><div class="hero-actions"><button id="play-primary" class="primary large">Započni misiju ${ico('arrow')}</button><button id="progress-open" class="secondary">Moj rad</button><button id="how-play" class="text-button">Kako se igra? ${ico('help')}</button></div><div class="hero-meta"><span>2D ARKADA</span><i></i><span>${LEVELS.length} MISIJA</span><i></i><span>BEZ PRIJAVE</span></div></div>
 <div class="hero-art" aria-hidden="true"><div class="art-topline"><span>ŠKOLSKA MREŽA</span><span class="status-small">ČEKA ČUVARA</span></div><svg class="campus" viewBox="0 0 520 360" fill="none"><defs><pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0v24" stroke="#31445a" stroke-width=".5"/></pattern></defs><rect width="520" height="360" fill="url(#grid)"/><path d="M109 85h144v196h158M109 85v196h144m0-196h158v196" stroke="#365e6d" stroke-width="9"/><path d="M109 85h144v196h158" stroke="#6ee7b6" stroke-width="2" stroke-dasharray="5 8"/><g fill="#233a50" stroke="#456079" stroke-width="2"><rect x="59" y="42" width="100" height="85" rx="8"/><rect x="203" y="42" width="100" height="85" rx="8"/><rect x="361" y="42" width="100" height="85" rx="8"/><rect x="59" y="238" width="100" height="85" rx="8"/><rect x="203" y="238" width="100" height="85" rx="8"/><rect x="361" y="238" width="100" height="85" rx="8"/></g><g fill="#112439"><rect x="75" y="57" width="68" height="55" rx="4"/><rect x="219" y="57" width="68" height="55" rx="4"/><rect x="377" y="57" width="68" height="55" rx="4"/></g><g fill="#7bc8e5"><rect x="84" y="67" width="50" height="7"/><rect x="84" y="81" width="50" height="7"/><rect x="84" y="95" width="29" height="5"/><rect x="231" y="66" width="44" height="34" rx="3"/><rect x="394" y="65" width="34" height="40" rx="3"/></g><path d="m247 72-9 14h12l-3 10 15-19h-12z" fill="#183447"/><path d="M402 78h18m-18 8h18m-18 8h13" stroke="#183447" stroke-width="3"/><path d="M109 256 130 264v18c0 15-21 25-21 25s-21-10-21-25v-18z" fill="#6ee7b6"/><path d="m99 280 7 7 14-16" stroke="#163b3b" stroke-width="4"/><rect x="232" y="257" width="43" height="45" rx="3" fill="#ffd087"/><path d="M243 270h20m-20 10h20m-20 10h13" stroke="#6a583b" stroke-width="4"/><rect x="391" y="258" width="40" height="43" rx="5" fill="#a99aef"/><path d="M402 272h18m-18 12h18" stroke="#40375d" stroke-width="4"/><g class="robot"><ellipse cx="253" cy="209" rx="28" ry="7" fill="#091723" opacity=".5"/><path d="M235 149h36v10h10v35h-10v14h-12v-10h-12v10h-12v-14h-10v-35h10z" fill="#7cd9ea"/><path d="M237 159h32v23h-32z" fill="#102b3e"/><path d="M241 166h8v8h-8zm18 0h8v8h-8z" fill="#ddfff5"/><path d="M243 190h20v6h-20z" fill="#67e7ab"/><path d="M225 181h-9v20h9zm56 0h9v20h-9z" fill="#67e7ab"/></g><g fill="#ffd087"><path d="m164 177 6 6-6 6-6-6z"/><path d="m338 177 6 6-6 6-6-6z"/></g></svg><div class="art-caption"><span class="mini-shield">${ico('shield')}</span><div><strong>${LEVELS.length} sektora. Jedna zadaća.</strong><span>Sačuvaj podatke i omogući rad škole.</span></div></div></div>
 </section>
 <section class="campaign"><div class="section-line"><div><span class="eyebrow">TVOJA KAMPANJA</span><h2>Korak po korak do sigurnije škole.</h2></div><div class="xp-pill">${ico('bolt')}<strong id="total-xp">0</strong><span>učenje</span></div></div><div class="content-picker"><label for="content-level">Nastavni sadržaj<select id="content-level"><option value="junior">Junior · 11–13</option><option value="standard">Standard · 14–16</option><option value="expert">Expert · 16+</option></select></label><p id="content-detail"></p><button id="pace-settings" class="secondary">Tempo i postavke</button></div><p class="fine-print">Dob je orijentacijska. Sadržaj i brzinu igranja biraš odvojeno; svaka razina ima svoj napredak.</p><div class="practice-banner"><div><strong>Primijeni znanje u novoj situaciji.</strong><p id="practice-progress">Svaka završena misija otvara novi slučaj.</p></div><button id="practice-open" class="secondary">Primjena znanja</button></div><div id="missions" class="mission-grid"></div></section>
 <footer class="home-footer"><span id="save-status">Napredak se sprema na ovom uređaju.</span><button id="version" class="text-button">v${VERSION}</button></footer>
</main>
<section id="play" class="play" aria-label="Igra" inert aria-hidden="true"><header class="hud"><button id="back-map" class="hud-logo" aria-label="Pauza i karta misija">${ico('shield')}<span>SISgame</span></button><div id="hud-context" class="hud-context"><div class="hud-mission"><small id="level-number">SEKTOR 01</small><strong id="level-title">Zaključaj rizik</strong></div><div id="notice-slot"></div></div><div class="hud-stats"><div class="health" id="health" aria-label="Energija: 3 od 3">● ● ●</div><div class="score"><strong id="run-xp">0</strong><span>učenje</span></div><button id="lesson" class="icon-button" aria-label="Pouka i cilj misije">${ico('help')}</button><button id="pause" class="icon-button" aria-label="Pauza">${ico('pause')}</button></div></header>
 <div id="game-stage"><div id="canvas-host"></div><button id="goal" class="goal"><span id="goal-count">0/4</span><span id="goal-text">Preuzmi službenu karticu</span><span class="goal-arrow">↗</span></button><div class="map-caption">DODIRNI TLO ZA KRETANJE</div><div class="controls"><div id="joystick" class="joystick" role="group" aria-label="Virtualna palica za kretanje"><div class="joy-cross"></div><div id="joy-thumb" class="joy-thumb"></div></div><div id="nearby" class="nearby" aria-live="polite"></div><div class="action-controls"><button id="shield" class="shield-control" aria-label="Aktiviraj štit">${ico('shield')}<span id="shield-label">Štit</span><kbd>Q</kbd></button><button id="action" class="action-control" disabled>${ico('bolt')}<span id="action-label">Priđi opremi</span><kbd>E</kbd></button></div></div></div>
</section>
<dialog id="dialog" aria-labelledby="dialog-title"></dialog><div id="toast" class="toast" hidden><button id="toast-message"><span id="toast-symbol" class="toast-symbol" aria-hidden="true">✓</span><span class="toast-copy"><strong id="toast-title"></strong><small>Pročitaj objašnjenje ↗</small></span></button><button id="toast-close" aria-label="Zatvori obavijest">×</button><span id="toast-status" class="sr-only" role="status" aria-live="polite" aria-atomic="true"></span></div>`;

const $=<T extends HTMLElement=HTMLElement>(s:string)=>document.querySelector<T>(s)!;
let save:Save;let storageOK=true;let lastStoredRaw:string|null=null;
try {lastStoredRaw=localStorage.getItem(SAVE_KEY);save=parseSave(lastStoredRaw);}catch{save=emptySave();storageOK=false;}
let run=profile(save).active||newRun(1,save.settings.difficulty,save.settings.content,save.settings.timed), running=false, near:Station|null=null;
let closeHook:(()=>void)|null=null;let toastTimer:number|undefined;let dialogObserver:ResizeObserver|undefined;
let audio:AudioContext|undefined;
let lastNotice:{title:string;message:string;ok:boolean}|null=null;
const dialog=$<HTMLDialogElement>('#dialog');
const bridge:Bridge={paused:true,axes:{x:0,y:0},reducedMotion:save.settings.reducedMotion,
  interact:openStation,changed:()=>{if(running){profile(save).active=run;recordBest(save,run);persist();updateHUD();}},result:showResult,nearby:s=>{near=s;updateNear();},hit:()=>{tone(180);updateHUD();},shield:remaining=>{
    const text=remaining>0?`${Math.ceil(remaining)} s`:'Štit';if($('#shield-label').textContent!==text)$('#shield-label').textContent=text;
    $('#shield').classList.toggle('cooldown',remaining>0);
  }};
const sector=new Sector(bridge);
const game=new Phaser.Game({type:Phaser.AUTO,parent:'canvas-host',backgroundColor:'#132632',pixelArt:true,antialias:false,scene:[sector],scale:{mode:Phaser.Scale.RESIZE,width:window.innerWidth,height:window.innerHeight-68},input:{activePointers:3},render:{roundPixels:true},audio:{noAudio:true}});

function persist(){
  try{
    if(localStorage.getItem(SAVE_KEY)!==lastStoredRaw){storageOK=false;$('#save-status').textContent='Napredak je promijenjen u drugom prozoru. Sačuvaj ovaj rad kroz Moj rad, zatim osvježi igru.';return;}
    const raw=JSON.stringify(save);localStorage.setItem(SAVE_KEY,raw);lastStoredRaw=raw;storageOK=true;
  }catch{storageOK=false;}
  $('#save-status').textContent=storageOK?'Napredak se sprema na ovom uređaju.':'Spremanje nije dostupno. Sačuvaj kopiju kroz Moj rad prije zatvaranja.';
}
function tone(freq=650){if(!save.settings.sound)return;try{audio??=new AudioContext();void audio.resume();const osc=audio.createOscillator(),gain=audio.createGain();osc.type='sine';osc.frequency.value=freq;gain.gain.setValueAtTime(.05,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.12);osc.connect(gain);gain.connect(audio.destination);osc.start();osc.stop(audio.currentTime+.12);}catch{/* sound is optional */}}
function dismissToast(){window.clearTimeout(toastTimer);const el=$('#toast');el.hidden=true;el.classList.remove('visible');$('#hud-context').classList.remove('has-notice');}
function scheduleToastDismiss(){window.clearTimeout(toastTimer);toastTimer=window.setTimeout(dismissToast,12000);}
function toast(title:string,message:string,ok=true){
  lastNotice={title,message,ok};
  const el=$('#toast');(running?$('#notice-slot'):app).append(el);
  $('#toast-title').textContent=title;$('#toast-symbol').textContent=ok?'✓':'!';
  $('#toast-message').setAttribute('aria-label',`${title}. Pročitaj objašnjenje`);
  $('#toast-status').textContent=`${title}. ${message}`;
  $('#hud-context').classList.toggle('has-notice',running);
  el.className='toast visible'+(ok?'':' caution');el.hidden=false;scheduleToastDismiss();
}
function readNotice(){
  if(!lastNotice)return;const notice=lastNotice;dismissToast();
  openDialog(`<div class="eyebrow">OBJAŠNJENJE</div><h2 id="dialog-title">${notice.title}</h2><p class="dialog-lead">${notice.message}</p><button id="notice-read" class="primary wide">Razumijem ${ico('check')}</button>`,()=>$('#notice-read').onclick=closeDialog);
}
$('#toast-message').onclick=readNotice;
$('#toast-close').onclick=dismissToast;
$('#toast').addEventListener('pointerenter',()=>window.clearTimeout(toastTimer));
$('#toast').addEventListener('pointerleave',scheduleToastDismiss);
$('#toast').addEventListener('focusin',()=>window.clearTimeout(toastTimer));
$('#toast').addEventListener('focusout',scheduleToastDismiss);
function showResult(result:Result){toast(result.title,result.message,result.ok);if(result.ok)tone();}
function renderHome(){
  $<HTMLSelectElement>('#content-level').value=save.settings.content;$('#content-detail').textContent=TIER_INFO[save.settings.content].detail;
  const complete=Object.values(profile(save).best).filter(b=>b.completed).length;
  $('#total-xp').textContent=String(totalLearning(save));
  const practice=practiceSummary(profile(save).practice,profile(save).best);
  $('#practice-progress').textContent=`Riješeno ${practice.solved}/${PRACTICE_CASES.length} · dostupno ${practice.available}/${PRACTICE_CASES.length}. Odluka i razlog, bez sata.`;
  document.body.classList.toggle('content-junior',save.settings.content==='junior');
  $('#play-primary').innerHTML=`${profile(save).active?'Nastavi misiju':complete===LEVELS.length?'Igraj ponovno':'Započni misiju'} ${ico('arrow')}`;
  $('#missions').innerHTML=LEVELS.map((base,i)=>{const level=levelContent(base,save.settings.content);const b=profile(save).best[level.id],unlocked=i===0||!!profile(save).best[LEVELS[i-1].id]?.completed;return `<button class="mission-card ${b?.completed?'completed':''}" data-level="${level.id}" ${unlocked?'':'disabled'} style="--accent:${level.color}"><div class="mission-top"><span class="sector-number">${missionNumber(level.id)}</span><span class="mission-symbol">${ico((['shield','lock','file','bug','key','gear','help','shield','radar','wifi','radar','file'] as const)[i])}</span><span class="mission-state">${b?.completed?'ZAVRŠENO':unlocked?'DOSTUPNO':'ZAKLJUČANO'}</span></div><span class="eyebrow">${level.subtitle}</span><h3>${level.title}</h3><p>${level.description}</p><div class="mission-foot"><span>${b?.completed?`${b.learning} učenje · ${b.arcade} bonus`:'4 sigurnosne zadaće'}</span>${ico(unlocked?'arrow':'lock')}</div><div class="mission-progress"><span style="width:${b?.learning||0}%"></span></div></button>`;}).join('');
  document.querySelectorAll<HTMLButtonElement>('[data-level]').forEach(b=>b.onclick=()=>start(Number(b.dataset.level),profile(save).active?.level===Number(b.dataset.level)));
}
function start(level:number,resume=false){
  if(dialog.open)closeDialog();dismissToast();lastNotice=null;run=resume&&profile(save).active?profile(save).active!:newRun(level,save.settings.difficulty,save.settings.content,save.settings.timed);running=true;bridge.paused=true;profile(save).active=run;persist();
  document.body.classList.add('playing');document.body.classList.toggle('content-junior',run.content==='junior');document.body.classList.toggle('calm-play',run.difficulty==='relaxed');$('#home').hidden=true;$('#play').removeAttribute('inert');$('#play').setAttribute('aria-hidden','false');
  sector.startRun(run);near=null;updateNear();updateHUD();
  requestAnimationFrame(resizeGame);
  briefing(resume);
}
function downloadProgress(kind:'backup'|'report'){
  let url:string|undefined;const now=new Date();
  try{
    const text=kind==='backup'?createProgressBackup(save,now):progressReport(save,now);
    url=URL.createObjectURL(new Blob([text],{type:kind==='backup'?'application/json;charset=utf-8':'text/plain;charset=utf-8'}));
    const link=document.createElement('a');link.href=url;link.download=progressFilename(kind,now);document.body.append(link);link.click();link.remove();
    const objectURL=url;window.setTimeout(()=>URL.revokeObjectURL(objectURL),30000);
    revealFeedback('Preuzimanje je pokrenuto',kind==='backup'?'Sačuvaj JSON datoteku. Ona sadrži sve tri razine i nedovršeni rad. Preglednik može ponuditi otvaranje ili spremanje datoteke.':'Sažetak sadrži rezultate svih triju razina. TXT možeš otvoriti ili kopirati u dokument; za obnovu koristi JSON kopiju.');
  }catch{if(url)URL.revokeObjectURL(url);revealFeedback('Preuzimanje nije pokrenuto','Preglednik nije uspio pripremiti datoteku. Pokušaj ponovno prije zatvaranja igre.');}
}
function myWork(tier:ContentTier=save.settings.content){
  const state=progressSnapshot(save,tier);let point:ProgressBackup|undefined,pointProblem=false;
  try{const raw=localStorage.getItem(RESTORE_POINT_KEY);if(raw)point=readProgressBackup(raw);}catch{pointProblem=true;}
  openDialog(`<div class="eyebrow">NAPREDAK I SIGURNOSNA KOPIJA</div><h2 id="dialog-title">Moj rad</h2><label class="setting-label" for="progress-tier">Pregled razine</label><select id="progress-tier" class="wide-select">${TIERS.map(value=>`<option value="${value}" ${tier===value?'selected':''}>${TIER_INFO[value].name}</option>`).join('')}</select><div class="pause-summary"><span>${state.completed}/${LEVELS.length}<small>završene misije</small></span><span>${state.learning}<small>bodovi učenja</small></span><span>${state.practice.solved}/${PRACTICE_CASES.length}<small>riješena primjena</small></span></div><p class="fine-print">Arkadni bonus: ${state.arcade}. Primjena iz prve: ${state.practice.firstTry}. Prikazani su najbolji zapisi kampanje; „iz prve” u primjeni označava prvu potpunu predaju uz dostupnu pomoć.</p>${state.active?`<div class="note"><strong>Aktivni pokušaj</strong><p>${missionNumber(state.active.level)}. ${state.active.title} · ${state.active.learning}/100 učenje. Nastavlja se s karte misija u ovoj razini.</p></div>`:''}${state.practice.review.length?`<p class="progress-review"><strong>Za ponavljanje:</strong> ${state.practice.review.map(n=>levelContent(LEVELS[n-1],tier).title).join(' · ')}</p>`:''}<details class="progress-details"><summary>Rezultati svih misija · ${state.name}</summary><div class="progress-table-wrap"><table class="progress-table"><caption>Najbolji rezultati i dodatna primjena — ${state.name}</caption><thead><tr><th scope="col">Misija</th><th scope="col">Učenje</th><th scope="col">Primjena</th></tr></thead><tbody>${state.rows.map(row=>`<tr><th scope="row">${missionNumber(row.level)}. ${row.title}<small>${row.completed?'Dovršeno':'Nije dovršeno'} · najviše ${row.independent}/4 bez ispravka · bonus ${row.arcade}</small></th><td>${row.learning}/100</td><td>${row.application}</td></tr>`).join('')}</tbody></table></div></details><section class="progress-files"><h3>Sačuvaj ili prenesi napredak</h3><p>Obje datoteke obuhvaćaju <strong>Junior, Standard i Expert</strong>. JSON kopija čuva i nedovršene odabire te postavke; TXT je čitljiv sažetak rada.</p><div class="progress-downloads"><button id="export-progress" class="secondary">Preuzmi kopiju (JSON)</button><button id="export-report" class="secondary">Preuzmi sažetak (TXT)</button></div><label class="setting-label" for="import-progress">Obnovi napredak iz JSON kopije</label><input id="import-progress" type="file" accept=".json,application/json" aria-describedby="import-help"><p id="import-help" class="fine-print">Najprije ćeš vidjeti pregled. Tek potvrda zamjenjuje sve tri razine. Pri svakoj obnovi igra čuva jedan prethodni zapis na ovom uređaju.</p>${point?'<button id="restore-previous" class="text-button">Pregledaj prethodni zapis za povratak</button>':''}${pointProblem?'<p class="fine-print">Prethodni zapis trenutačno nije dostupan. Preuzetu JSON kopiju možeš zasebno odabrati.</p>':''}</section><p class="fine-print">Podatci ostaju na uređaju; igra ih ne šalje nastavniku ni poslužitelju. Kopija je zapis vježbanja bez potvrde identiteta ili formalne ocjene.</p><div id="feedback" class="feedback" role="status" hidden></div><button id="progress-close" class="primary wide">Karta misija</button>`,()=>{
    $('#progress-tier').onchange=()=>myWork($<HTMLSelectElement>('#progress-tier').value as ContentTier);
    $('#export-progress').onclick=()=>downloadProgress('backup');$('#export-report').onclick=()=>downloadProgress('report');
    const input=$<HTMLInputElement>('#import-progress');let selection=0;
    input.onchange=async()=>{
      const token=++selection,file=input.files?.[0];if(!file)return;
      if(file.size>MAX_BACKUP_BYTES){revealFeedback('Kopija nije učitana','Datoteka je veća od 1 MB. Odaberi JSON kopiju preuzetu iz SISgamea.');input.value='';return;}
      let text:string;
      try{text=await file.text();}catch{if(dialog.open&&input.isConnected&&token===selection){input.value='';revealFeedback('Kopija nije učitana','Datoteku nije moguće pročitati. Napredak nije promijenjen.');}return;}
      if(!dialog.open||!input.isConnected||token!==selection)return;
      input.value='';
      try{previewRestore(readProgressBackup(text),false,tier);}catch(error){revealFeedback('Kopija nije učitana',error instanceof Error?error.message:'Datoteka nije valjana. Napredak nije promijenjen.');}
    };
    if(point)$('#restore-previous').onclick=()=>previewRestore(point!,true,tier);
    $('#progress-close').onclick=closeDialog;
  });
}
function previewRestore(backup:ProgressBackup,previous:boolean,tier:ContentTier){
  const current=JSON.parse(JSON.stringify(save)) as Save,expectedRaw=lastStoredRaw;
  try{if(localStorage.getItem(SAVE_KEY)!==expectedRaw){revealFeedback('Napredak je promijenjen','Drugi prozor promijenio je spremljeni rad. Sačuvaj ovu kopiju rada pa osvježi igru prije obnove.');return;}}catch{revealFeedback('Pohrana nije dostupna','Za obnovu je potrebno spremiti i prethodno stanje. Najprije omogući pohranu preglednika.');return;}
  const cell=(source:Save,content:ContentTier)=>{const p=progressSnapshot(source,content);return `${p.completed}/${LEVELS.length} misija<br>${p.learning} učenje · ${p.practice.solved}/${PRACTICE_CASES.length} primjena<small>${p.active?`Aktivno: ${missionNumber(p.active.level)}. ${p.active.title} (${p.active.learning}/100)`:'Nema aktivne misije'}</small>`;};
  openDialog(`<div class="eyebrow">PREGLED PRIJE OBNOVE</div><h2 id="dialog-title">${previous?'Vrati prethodni zapis':'Obnovi spremljeni rad'}</h2><p class="dialog-lead">Potvrda zamjenjuje rezultate, postavke i nedovršene odabire u <strong>sve tri razine</strong>. Trenutačni zapis prije zamjene spremit će se za povratak.</p><p class="fine-print">Kopija: SISgame ${backup.gameVersion} · ${new Date(backup.createdAt).toLocaleString('hr-HR')} (vrijeme ovog uređaja).</p><div class="progress-table-wrap"><table class="progress-table restore-comparison"><caption>Usporedba trenutačnog napretka i kopije</caption><thead><tr><th scope="col">Razina</th><th scope="col">Sada</th><th scope="col">U kopiji</th></tr></thead><tbody>${TIERS.map(content=>`<tr><th scope="row">${TIER_INFO[content].name}</th><td>${cell(current,content)}</td><td>${cell(backup.save,content)}</td></tr>`).join('')}</tbody></table></div><div class="note"><strong>Odabrane postavke u kopiji</strong><p>${TIER_INFO[backup.save.settings.content].name} · tempo: ${{relaxed:'bez smetnji',easy:'lagan',medium:'srednji',hard:'brz'}[backup.save.settings.difficulty]}.</p></div><div id="feedback" class="feedback" role="status" hidden></div><button id="confirm-import" class="primary wide">${previous?'Vrati ovaj prethodni zapis':'Obnovi iz ove kopije'}</button><button id="cancel-import" class="secondary wide">Odustani</button>`,()=>{
    $('#cancel-import').onclick=()=>myWork(tier);
    $('#confirm-import').onclick=()=>{
      let result;
      try{result=restoreProgress(localStorage,current,backup,expectedRaw);}catch{revealFeedback('Obnova nije spremljena','Pohrana preglednika nije dostupna. Postojeći napredak nije promijenjen.');return;}
      if(!result.ok){revealFeedback('Obnova nije spremljena',result.message);return;}
      save=result.save;lastStoredRaw=JSON.stringify(save);storageOK=true;
      run=profile(save).active||newRun(1,save.settings.difficulty,save.settings.content,save.settings.timed);bridge.reducedMotion=save.settings.reducedMotion;
      closeHook=null;home();myWork();
      $('#save-status').textContent='Napredak se sprema na ovom uređaju.';
      revealFeedback('Rad je obnovljen','Učitane su sve tri razine. Prethodno stanje dostupno je u Moj rad → Pregledaj prethodni zapis za povratak.');
    };
  },()=>myWork(tier));
}
function practiceHub(){
  const target=profile(save),summary=practiceSummary(target.practice,target.best);
  openDialog(`<div class="eyebrow">${TIER_INFO[save.settings.content].name} · PRIMJENA ZNANJA</div><h2 id="dialog-title">Nova situacija. Tvoja odluka.</h2><p class="dialog-lead">Nakon svake završene misije otvara se jedan novi slučaj. Odaberi postupak i razlog. Nema sata; možeš se podsjetiti i ispraviti odgovor.</p><div class="pause-summary"><span>${summary.solved}/${PRACTICE_CASES.length}<small>riješenih slučajeva</small></span><span>${summary.firstTry}<small>točno iz prve</small></span><span>${summary.review.length}<small>teme za ponavljanje</small></span></div>${summary.review.length?`<div class="note"><strong>Vrijedi ponoviti</strong><p>${summary.review.map(n=>levelContent(LEVELS[n-1],save.settings.content).title).join(' · ')}</p><p>U tim je slučajevima trebalo ispraviti odluku. Otvori slučaj i ponovi pouku; riješeni slučaj i njegov prvi rezultat ostaju zabilježeni.</p></div>`:''}<p class="fine-print">Dostupno: ${summary.available}/${PRACTICE_CASES.length}. Ovaj zapis vježbanja odvojen je od bodova kampanje. „Iz prve” znači prvu potpunu predaju, uz dostupnu pomoć; nije dokaz samostalnosti ni ocjena.</p><div class="practice-list">${PRACTICE_CASES.map(c=>{const entry=target.practice[c.level],unlocked=practiceUnlocked(target.best,c.level);const status=!unlocked?`Dovrši misiju ${missionNumber(c.level)}`:entry?.solved?(entry.firstCorrect?'Riješeno iz prve':'Riješeno uz ispravak'):entry?.attempts?'Nastavi ispravak':Object.keys(entry?.answers||{}).length?'Nastavi odabire':'Spremno za primjenu';return `<button class="practice-card ${entry?.solved?'completed':''}" data-practice="${c.level}" ${unlocked?'':'disabled'}><span class="practice-number">${missionNumber(c.level)}</span><span><strong>${c.title}</strong><small>${status}</small></span>${ico(unlocked?'arrow':'lock')}</button>`;}).join('')}</div>${summary.next?'<button id="practice-next" class="primary wide">Nastavi primjenu</button>':''}<button id="practice-home" class="text-button wide">Karta misija</button>`,()=>{
    document.querySelectorAll<HTMLButtonElement>('[data-practice]').forEach(button=>button.onclick=()=>openPracticeCase(Number(button.dataset.practice)));
    if(summary.next)$('#practice-next').onclick=()=>openPracticeCase(summary.next!);
    $('#practice-home').onclick=closeDialog;
  });
}
function practiceLesson(level:number){
  const tier=save.settings.content,lesson=levelContent(LEVELS[level-1],tier);
  openDialog(`<div class="eyebrow">PODSJETNIK · MISIJA ${missionNumber(level)}</div><h2 id="dialog-title">${lesson.title}</h2><div class="lesson-grid">${lesson.lesson.map(([title,text],i)=>`<article><span>0${i+1}</span><div><h3>${title}</h3><p>${text}</p></div></article>`).join('')}</div>${tier==='junior'?'':`<dl class="practice-terms">${TERMS[level].map(([word,definition])=>`<dt>${word}</dt><dd>${definition}</dd>`).join('')}</dl>`}<button id="practice-back" class="primary wide">Vrati se na slučaj</button>`,()=>$('#practice-back').onclick=()=>openPracticeCase(level),()=>openPracticeCase(level));
}
function openPracticeCase(level:number){
  const tier=save.settings.content,target=profile(save),scenario=practiceCase(level,tier);
  if(!scenario||!practiceUnlocked(target.best,level)){practiceHub();return;}
  const entry=target.practice[level]||emptyPracticeProgress();
  const next=practiceSummary(target.practice,target.best).next;
  const solved=entry.solved;
  openDialog(`<div class="eyebrow">${TIER_INFO[tier].name} · SLUČAJ ${missionNumber(level)} / ${PRACTICE_CASES.length}</div><h2 id="dialog-title">${scenario.title}</h2><p class="dialog-lead">${scenario.context}</p>${scenario.expertEvidence?`<div class="case-evidence"><strong>Dodatni dokaz za Expert</strong><p>${scenario.expertEvidence}</p></div>`:''}<details class="practice-reminder"><summary>Podsjeti me na pravilo</summary><p>${scenario.reminder}</p></details><p class="fine-print">${tier==='expert'?'Odaberi postupak, razlog i zaključak iz dodatnog dokaza.':'Odaberi postupak i razlog.'} Ovo je izmišljena situacija; stvarne školske promjene vodi odgovorna osoba.</p><div class="review-questions practice-questions">${scenario.questions.map((q,i)=>`<fieldset ${solved?'disabled':''}><legend>${i+1}. ${q.prompt}</legend>${q.choices.map(c=>`<label><input type="radio" name="practice-${q.id}" value="${c.id}" ${entry.answers[q.id]===c.id?'checked':''} aria-describedby="practice-feedback-${q.id}"><span>${c.label}</span></label>`).join('')}<p id="practice-feedback-${q.id}" class="practice-feedback" hidden></p></fieldset>`).join('')}</div><div id="feedback" class="feedback" role="status" hidden></div>${solved?`<div class="practice-success" role="status"><strong>${entry.firstCorrect?'Riješeno iz prve.':'Riješeno uz ispravak.'}</strong><p>Prvi rezultat ostaje zabilježen. Bodovi kampanje ostaju isti.</p></div><div class="note"><strong>Od igre prema vježbi</strong><p>${scenario.transfer}</p></div>`:''}<button id="practice-lesson" class="text-button">Ponovi pouku misije ${missionNumber(level)}</button>${solved?`<button id="practice-continue" class="primary wide">${next?'Sljedeći dostupni slučaj':'Pregled primjene'}</button>`:'<button id="practice-submit" class="primary wide">Provjeri odluku i razlog</button>'}<button id="practice-overview" class="secondary wide">Svi slučajevi</button>`,()=>{
    const paintFeedback=()=>{
      const current=target.practice[level];if(!current?.submitted)return;
      for(const feedback of practiceFeedback(scenario,current.submitted)){
        const el=$(`#practice-feedback-${feedback.id}`);
        el.hidden=current.answers[feedback.id]!==current.submitted[feedback.id];
        el.classList.toggle('correct',feedback.correct);
        el.textContent=`${feedback.correct?'Točno':'Provjeri odluku'}: ${feedback.message}`;
      }
    };
    paintFeedback();
    document.querySelectorAll<HTMLInputElement>('.practice-questions input').forEach(input=>input.onchange=()=>{
      if(setPracticeAnswer(target.practice,target.best,level,tier,input.name.slice('practice-'.length),input.value)){
        persist();$('#feedback').hidden=true;paintFeedback();
      }
    });
    if(!solved)$('#practice-submit').onclick=()=>{
      const result=submitPractice(target.practice,target.best,level,tier);persist();renderHome();
      if(result==='solved'||result==='already-solved'){tone();openPracticeCase(level);return;}
      paintFeedback();
      revealFeedback(result==='incomplete'?'Dopuni odabire':'Provjeri obrazloženja',result==='incomplete'?'Odaberi jedan odgovor na svako pitanje. Nepotpuna predaja ne broji se kao pokušaj.':'Pročitaj objašnjenje uz svako pitanje pa ispravi odluku. Možeš otvoriti podsjetnik ili ponoviti pouku.');
    };
    $('#practice-lesson').onclick=()=>practiceLesson(level);
    $('#practice-overview').onclick=practiceHub;
    if(solved)$('#practice-continue').onclick=()=>next?openPracticeCase(next):practiceHub();
  });
}
function home(){if(dialog.open)closeDialog();bridge.paused=true;sector.resetInput();running=false;document.body.classList.remove('playing');$('#home').hidden=false;$('#play').setAttribute('inert','');$('#play').setAttribute('aria-hidden','true');dismissToast();renderHome();}
function updateHUD(){const level=levelContent(LEVELS[run.level-1],run.content);$('#level-number').textContent=`${TIER_INFO[run.content].name} · ${missionNumber(run.level)}`;$('#level-title').textContent=level.title;$('#run-xp').textContent=String(score(run));$('#health').textContent='● '.repeat(run.health)+'○ '.repeat(3-run.health);$('#health').setAttribute('aria-label',`Energija: ${run.health} od 3`);$('#goal-count').textContent=`${Object.values(run.checks).filter(c=>c.done).length}/4`;const target=nextTarget(run);$('#goal-text').textContent=target==='backup'&&has(run,'failure')?'Obnovi podatke iz kopije':TARGET_TEXT[target];$('#goal').title='Dodirni za kretanje prema cilju';sector.sync?.();}
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
  stopReviewClock();dialogObserver?.disconnect();if(dialog.open)dialog.close();bridge.paused=true;releaseStick();sector.resetInput();closeHook=onClose||null;
  dialog.innerHTML=`<header class="dialog-header"><div class="dialog-heading"></div><button id="dialog-close" class="dialog-close" aria-label="Zatvori">×</button></header><div id="dialog-body" class="dialog-body" role="region" aria-label="Sadržaj prozora" tabindex="0"><div class="dialog-content">${body}</div></div><div id="dialog-scroll-hint" class="dialog-scroll-hint" aria-hidden="true" hidden>Pomakni za više ↓</div><footer class="dialog-actions" hidden></footer>`;
  const content=$('.dialog-content'),heading=$('.dialog-heading'),actions=$('.dialog-actions');
  for(const child of Array.from(content.children)){
    if(child.matches('.eyebrow,h2'))heading.append(child);
    else if(child.matches('.finish-icon'))child.remove();
    else if(child.matches('button.wide'))actions.append(child);
    else if(child.matches('.stack-buttons')){actions.append(...Array.from(child.children));child.remove();}
  }
  actions.hidden=!actions.childElementCount;dialog.classList.toggle('permissions-dialog',!!content.querySelector('.permission-table'));dialog.classList.toggle('evidence-dialog',!!content.querySelector('.evidence-cards,.investigation-grid,.review-questions'));document.body.classList.add('modal-open');
  dialog.showModal();$('#dialog-close').onclick=closeDialog;mount?.();const title=$('#dialog-title');title.tabIndex=-1;title.focus({preventScroll:true});
  $('#dialog-body').addEventListener('scroll',syncDialogScroll,{passive:true});
  dialogObserver=new ResizeObserver(syncDialogScroll);dialogObserver.observe($('#dialog-body'));dialogObserver.observe(content);
  requestAnimationFrame(syncDialogScroll);
}
function closeDialog(){stopReviewClock();const hook=closeHook;closeHook=null;dialogObserver?.disconnect();dialog.close();document.body.classList.remove('modal-open');bridge.paused=!running||run.completed;sector.resetInput();hook?.();}
dialog.addEventListener('cancel',e=>{e.preventDefault();closeDialog();});
function briefing(resume=false){
  const level=levelContent(LEVELS[run.level-1],run.content),junior=run.content==='junior';
  const flowIcons:Record<number,(keyof typeof icons)[]>={1:['key','check','shield'],2:['file','lock','key'],3:['file','download','check'],4:['bug','lock','help'],5:['lock','key','check'],6:['download','key','check'],7:['pause','help','shield'],8:['file','shield','lock'],9:['radar','file','shield'],10:['wifi','lock','check'],11:['file','radar','shield'],12:['file','download','check']};
  const flow=junior?`<ol class="visual-steps" aria-label="Koraci zaštite">${JUNIOR_LESSONS[run.level].flow.map((label,i)=>`<li>${ico(flowIcons[run.level][i])}<span>${i+1}. ${label}</span></li>`).join('')}</ol>`:'';
  const glossary=!junior?`<details class="glossary"><summary>Pojmovi ove misije</summary><dl>${TERMS[run.level].map(([word,definition])=>`<dt>${word}</dt><dd>${definition}</dd>`).join('')}</dl></details>`:'';
  openDialog(`<div class="eyebrow">${TIER_INFO[run.content].name} · MISIJA ${missionNumber(level.id)}</div><h2 id="dialog-title">${resume?'Nastavljamo: ':''}${level.title}</h2><p class="dialog-lead">${level.description}</p>${flow}<div class="lesson-grid">${level.lesson.map(([title,text],i)=>`<article><span>0${i+1}</span><div><h3>${title}</h3><p>${text}</p></div></article>`).join('')}</div>${glossary}<div class="note"><strong>Upravljanje</strong> Palica ili WASD / strelice za kretanje. Dodirni cilj za pomoć pri kretanju. Priđi opremi i pritisni Djeluj ili E. ${run.difficulty==='relaxed'?'Igraš bez arkadnih smetnji.':'Q, razmak ili Štit štite lika od arkadnih smetnji.'} Čitanje pauzira kretanje.</div>${run.content==='expert'?'<p class="fine-print">Prije završne provjere analizirat ćeš dodatni slučaj. Vremenski izazov je opcionalan i ne mijenja bodove učenja.</p>':''}<button id="begin" class="primary wide">${resume?'Nastavi gdje si stao':'Kreni u misiju'} ${ico('arrow')}</button>`,()=>{$('#begin').onclick=()=>{closeDialog();if(!resume)toast('Dodirni cilj za pomoć pri kretanju','Žuti bitovi donose zaseban arkadni bonus. Sudari ne mijenjaju bodove učenja.');};});
}
function pause(){if(!running)return;openDialog(`<div class="eyebrow">ODMOR ZA ČUVARA</div><h2 id="dialog-title">Misija je pauzirana.</h2><p class="dialog-lead">${storageOK?'Napredak je spremljen na ovom uređaju. Nastavi kad budeš spreman.':'Spremanje nije dostupno. Vrati se na kartu i sačuvaj kopiju kroz Moj rad prije zatvaranja.'}</p><div class="pause-summary"><span>${score(run)}/100<small>učenje</small></span><span>${arcadeScore(run)}<small>arkadni bonus</small></span><span>${run.health}/3<small>energija</small></span></div><div class="stack-buttons"><button id="resume" class="primary wide">Nastavi igru ${ico('arrow')}</button><button id="show-lesson" class="secondary wide">Ponovi pouku</button><button id="to-home" class="text-button">Karta misija</button>${lastNotice?'<button id="last-notice" class="text-button">Posljednja poruka</button>':''}</div>`,()=>{$('#resume').onclick=closeDialog;$('#show-lesson').onclick=()=>briefing(true);$('#to-home').onclick=home;if(lastNotice)$('#last-notice').onclick=readNotice;});}
function finish(){recordBest(save,run);profile(save).active=null;persist();tone(900);const checks=Object.entries(run.checks);const independent=checks.filter(([,c])=>c.errors===0).length;openDialog(`<div class="finish-icon">${ico('shield')}</div><div class="eyebrow">${TIER_INFO[run.content].name} · SEKTOR ${missionNumber(run.level)} OSIGURAN</div><h2 id="dialog-title">Dobro odrađeno, <br>čuvaru.</h2><p class="dialog-lead">Zaštitu si postavio i isprobao. Sljedeći korak je primijeniti je u stvarnoj laboratorijskoj vježbi.</p><div class="pause-summary"><span>${score(run)}<small>bodova učenja</small></span><span>+${arcadeScore(run)}<small>arkadni bonus</small></span><span>${independent}/4<small>bez ispravka</small></span></div><ul class="results-list">${checks.map(([key,c])=>`<li>${ico('check')}<span>${CHECK_NAMES[key]}</span><small>${c.errors?'uz ispravak':'samostalno'}</small></li>`).join('')}</ul>${levelContent(LEVELS[run.level-1],run.content).debrief?`<div class="note"><strong>Pitanje za primjenu</strong>${levelContent(LEVELS[run.level-1],run.content).debrief}</div>`:""}${run.content==='expert'&&run.review.started?`<p class="fine-print">Vremenski izazov: ${run.review.expired?'istekao; nastavio si bez kazne':run.review.enabled?'završio unutar vremena':'isključeno mjerenje'}. Vrijeme nije dio bodova učenja.</p>`:''}<p class="fine-print">Ovo je zapis vježbanja, a ne zaključna ocjena. Ponavljanjem možeš poboljšati najbolji rezultat.</p><button id="next" class="primary wide">${run.level<LEVELS.length?'Sljedeća misija':'Povratak na kartu'} ${ico('arrow')}</button><button id="results-practice" class="secondary wide">Primijeni u novom slučaju</button><button id="results-home" class="text-button wide">Karta misija</button>`,()=>{$('#next').onclick=()=>{closeHook=null;if(run.level<LEVELS.length)start(run.level+1);else home();};$('#results-home').onclick=()=>{closeHook=null;home();};$('#results-practice').onclick=()=>{const level=run.level;closeHook=null;home();openPracticeCase(level);};},home);}
function perform(station:string,choice:string){const result=act(run,station,choice);recordBest(save,run);profile(save).active=run.completed?null:run;persist();updateHUD();if(result.review){openExpertReview(station,choice);return;}if(result.complete){closeDialog();finish();return;}if(result.ok){closeDialog();showResult(result);if(VERIFICATION_REPORTS[station])showVerification(station,result);}else{const feedback=document.getElementById('feedback');if(feedback){revealFeedback(result.title,result.message);}else showResult(result);}}
type Option=[string,string,string];
function choices(s:Station,description:string,options:Option[],extra=''){const simple=run.content==='junior'&&!(s.id==='backup'&&has(run,'failure'))?JUNIOR_CHOICES[s.id]:undefined;if(simple){description=simple.description;options=simple.options;}openDialog(`<div class="eyebrow">${LEVELS[run.level-1].subtitle}</div><h2 id="dialog-title">${s.label}</h2><p class="dialog-lead">${description}</p>${extra}<div class="choices">${options.map(([value,label,detail])=>`<button class="choice" data-choice="${value}"><span><strong>${label}</strong><small>${detail}</small></span>${ico('arrow')}</button>`).join('')}</div><div id="feedback" class="feedback" role="status" hidden></div>`,()=>{document.querySelectorAll<HTMLButtonElement>('[data-choice]').forEach(b=>b.onclick=()=>perform(s.id,b.dataset.choice!));});}
function openStation(s:Station){
  if(s.collectible){const r=collect(run,s.id);showResult(r);bridge.changed();return;}
  if(s.id==='exit'){perform('exit','finish');return;}
  if(run.checks[s.id]?.done&&s.id!=='backup'){toast('Ova zadaća je dovršena','Sljedeći cilj prikazan je pri vrhu. Ostvareni bodovi ostaju sačuvani.');return;}
  if(s.id==='samples')return sampleConsole();
  if(s.id==='sessions')return sessionConsole();
  if(s.id==='services')return serviceConsole();
  if(s.id==='firewall')return firewallConsole();
  if(s.id==='alerts')return alertConsole();
  if(s.id==='wifi-config')return wifiConsole();
  if(s.id==='risk-analysis')return riskConsole();
  if(s.id==='risk-plan')return measuresConsole();
  if(s.id==='response-plan')return responseConsole();
  const decision=DECISIONS[s.id];
  if(decision?.level===run.level)return choices(s,decision.description,decision.options.map(o=>[o.id,o.label,o.detail]),s.id==='message'?messageEvidence():decision.requires.length?`<div class="system-list">${decision.requires.map(key=>`<span>${run.checks[key]?.done?'✓':'○'} ${CHECK_NAMES[key]}</span>`).join('')}</div>`:'');
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
function showVerification(station:string,result:Result){
  dismissToast();
  openDialog(`<div class="eyebrow">REZULTATI PROVJERE</div><h2 id="dialog-title">${result.title}</h2><p class="dialog-lead">Sve provjere u ovoj simulaciji su prošle. Sada se uputi prema izlazu.</p><div class="verification-grid">${(run.content==='junior'?JUNIOR_REPORTS[station]||VERIFICATION_REPORTS[station]:VERIFICATION_REPORTS[station]).map(([title,detail])=>`<article>${ico('check')}<div><strong>${title}</strong><p>${detail}</p></div></article>`).join('')}</div><button id="verification-done" class="primary wide">Prema izlazu ${ico('arrow')}</button>`,()=>$('#verification-done').onclick=()=>{closeDialog();sector.guide();});
}
function submitConsole(result:Result){
  bridge.changed();
  if(result.ok){closeDialog();showResult(result);}else revealFeedback(result.title,result.message);
}
function sampleConsole(){
  const samples=samplesFor(run.content),junior=run.content==='junior';
  openDialog(`<div class="eyebrow">IZOLIRANI LABORATORIJ</div><h2 id="dialog-title">Što otkriva ponašanje?</h2><p class="dialog-lead">Razvrstaj ${junior?'dva':'tri'} gotova izvještaja. Uzorke ne treba pokretati.</p><div class="evidence-cards" style="--card-count:${samples.length}">${samples.map(sample=>`<article class="evidence-card"><h3>${sample.label}</h3><p>${sample.evidence}</p><label><span class="sr-only">Vrsta: ${sample.label}</span><select id="sample-${sample.id}"><option value="">Odaberi vrstu</option>${junior?'':'<option value="virus">Virus</option>'}<option value="worm">Crv</option><option value="trojan">Trojanski konj</option></select></label></article>`).join('')}</div><div id="feedback" class="feedback" role="status" hidden></div><button id="classify-samples" class="primary wide">Provjeri razvrstavanje ${ico('check')}</button>`,()=>{
    $('#classify-samples').onclick=()=>submitConsole(classifyMalware(run,Object.fromEntries(samples.map(sample=>[sample.id,$<HTMLSelectElement>(`#sample-${sample.id}`).value as MalwareKind|'']))));
  });
}
function sessionConsole(){
  const junior=run.content==='junior';
  openDialog(`<div class="eyebrow">ISTRAGA PRIJAVE</div><h2 id="dialog-title">${junior?'Tko je ušao u račun?':'Pronađi sumnjivu sesiju.'}</h2><p class="dialog-lead">Odaberi uspješnu prijavu koju vlasnik ne prepoznaje i postupak zaštite računa.</p><div class="investigation-grid"><fieldset class="event-list"><legend>1. Jučerašnji zapisi</legend>${eventsFor(run.content).map(event=>`<label class="event-row"><input type="radio" name="login-event" value="${event.id}"><span><strong><time>${event.time}</time> ${event.outcome}</strong><small>${event.device} · ${event.detail}</small></span></label>`).join('')}</fieldset><div class="response-panel"><label for="session-response">2. Postupak zaštite</label><select id="session-response"><option value="">Odaberi postupak</option><option value="password">Samo promijeni lozinku</option>${junior?'':'<option value="erase">Obriši dnevnik prijava</option>'}<option value="revoke">${junior?'Prijavi i prekini prijave':'Prijavi i opozovi sesije'}</option></select><p>${junior?'Javi administratoru i zatraži prekid tuđeg pristupa. Zatim pripremaš novu lozinku i osobni ključ.':'Opoziv uključuje privremenu blokadu prijava i čuvanje zapisa. Zatim postavljaš novu lozinku i dodatni faktor.'}</p></div></div><div id="feedback" class="feedback" role="status" hidden></div><button id="secure-session" class="primary wide">Primijeni postupak ${ico('check')}</button>`,()=>{
    $('#secure-session').onclick=()=>submitConsole(secureSession(run,document.querySelector<HTMLInputElement>('input[name="login-event"]:checked')?.value||'',$<HTMLSelectElement>('#session-response').value));
  });
}
function serviceConsole(){
  const services=servicesFor(run.content);
  openDialog(`<div class="eyebrow">PRIPREMA RADNE STANICE</div><h2 id="dialog-title">Ostavi potrebne usluge.</h2><p class="dialog-lead">Uključi usluge potrebne za rad. Isključi neodobreni udaljeni pristup.${run.content==='junior'?' Nadogradnje su već uključene.':''}</p><div class="evidence-cards service-cards" style="--card-count:${services.length}">${services.map(service=>`<article class="evidence-card"><h3>${service.label}</h3><p>${service.detail}</p><label class="service-toggle"><input type="checkbox" id="service-${service.id}" checked><span>Uključeno</span><span class="sr-only">: ${service.label}</span></label></article>`).join('')}</div><div id="feedback" class="feedback" role="status" hidden></div><button id="apply-services" class="primary wide">Primijeni postavke ${ico('check')}</button>`,()=>{
    for(const service of services){const control=$<HTMLInputElement>(`#service-${service.id}`);control.onchange=()=>{control.nextElementSibling!.textContent=control.checked?'Uključeno':'Isključeno';};}
    $('#apply-services').onclick=()=>submitConsole(configureServices(run,{updates:document.querySelector<HTMLInputElement>('#service-updates')?.checked??true,remote:$<HTMLInputElement>('#service-remote').checked,coursework:$<HTMLInputElement>('#service-coursework').checked}));
  });
}
function messageEvidence(){
  return `<article class="message-evidence"><span class="eyebrow">IZMIŠLJENA PORUKA · POVEZNICA NIJE AKTIVNA</span><h3>Račun se gasi za 10 minuta!</h3><p><strong>Od:</strong> „Školska podrška” &lt;podrska@potvrda.example&gt;</p><p>Potvrdi lozinku i jednokratni kod kako ne bi izgubio pristup. Otvori:</p><code>https://portal.skola.example.potvrda.example</code><p class="fine-print">Poznata školska adresa: <strong>portal.skola.example</strong></p></article>`;
}
function firewallConsole(){
  const flows=flowsFor(run.content),junior=run.content==='junior';
  openDialog(`<div class="eyebrow">PROBA MREŽNIH PRAVILA</div><h2 id="dialog-title">Kome otvaraš prolaz?</h2><p class="dialog-lead">${junior?'Učenik treba poslati rad. Nepoznata osoba ne smije upravljati školskim računalom. Pristup školskog administratora već je pripremljen.':'Dopusti predaju rada i upravljanje iz odobrene mreže. Nepoznati izvor nema pravo administracije.'}</p><div class="flow-list">${flows.map(flow=>`<label class="flow-row"><input type="checkbox" id="flow-${flow.id}" ${run.networkRules[flow.id]?'checked':''}><span><strong>${flow.label}</strong>${junior?'':`<small>${flow.detail}</small>`}</span><output id="flow-state-${flow.id}" aria-live="polite"></output></label>`).join('')}</div><p class="fine-print">Prekidači prikazuju učinak pravila. Provjerom uspoređuješ rezultat s potrebama škole.</p><div id="feedback" class="feedback" role="status" hidden></div><button id="apply-firewall" class="primary wide">Primijeni i isprobaj veze ${ico('check')}</button>`,()=>{
    for(const flow of flows){const control=$<HTMLInputElement>(`#flow-${flow.id}`),output=$(`#flow-state-${flow.id}`);const update=()=>{output.textContent=control.checked?'→ PROLAZI':'⊣ BLOKIRANO';output.classList.toggle('flow-open',control.checked);};control.onchange=update;update();}
    $('#apply-firewall').onclick=()=>submitConsole(configureFirewall(run,Object.fromEntries(flows.map(flow=>[flow.id,$<HTMLInputElement>(`#flow-${flow.id}`).checked]))));
  });
}
function alertConsole(){
  const junior=run.content==='junior',reports=alertsFor(run.content),verdicts=verdictsFor(run.content);
  openDialog(`<div class="eyebrow">SIGURNOSNI ZAPISI · IZMIŠLJENI SLUČAJ</div><h2 id="dialog-title">Što dokazi stvarno govore?</h2><p class="dialog-lead">${junior?'Pročitaj dva zapisa. Razlikuj potvrđen dopušten rad od potvrđenog nepozvanog pristupa.':'Usporedi svaki događaj s dodatnim dokazima. Razlikuj odobreni rad, slučaj koji treba istražiti i potvrđen incident.'}</p><div class="evidence-cards alert-cards" style="--card-count:${reports.length}">${reports.map((report,i)=>`<article class="evidence-card"><h3>${report.label}</h3><p>${junior?report.simple:report.evidence}</p><label for="alert-${report.id}">Zaključak za zapis ${String.fromCharCode(65+i)}</label><select id="alert-${report.id}"><option value="">Odaberi zaključak</option>${verdicts.map(([id,label])=>`<option value="${id}" ${run.alertAnswers[report.id]===id?'selected':''}>${label}</option>`).join('')}</select></article>`).join('')}</div><p class="fine-print">Odabiri se spremaju tijekom rada. Prazan odabir nije pogrešna odluka.</p><div id="feedback" class="feedback" role="status" hidden></div><button id="classify-alerts" class="primary wide">Provjeri zaključke ${ico('check')}</button>`,()=>{
    const read=()=>Object.fromEntries(reports.map(report=>[report.id,$<HTMLSelectElement>(`#alert-${report.id}`).value as AlertVerdict]));
    for(const report of reports)$(`#alert-${report.id}`).onchange=()=>{run.alertAnswers=read();bridge.changed();};
    $('#classify-alerts').onclick=()=>submitConsole(classifyAlerts(run,read()));
  });
}
function wifiConsole(){
  const junior=run.content==='junior';
  openDialog(`<div class="eyebrow">SIMULACIJA PRISTUPNE TOČKE</div><h2 id="dialog-title">Internet za goste. Podatci za školu.</h2><p class="dialog-lead">${junior?'Gostima omogući internet, a zaustavi njihovu vezu prema internoj školskoj mreži. WPA3 zaštita i posebna duga lozinka već su pripremljene.':'Svi uređaji ove misije podržavaju WPA3-Personal. Odaberi zaštitu bežične veze i pristup gostiju. Gostima treba internet, bez puta do interne školske mreže.'}</p><div class="evidence-cards wifi-controls" style="--card-count:2"><article class="evidence-card"><h3>1. Bežična veza</h3>${junior?'<p>WPA3-Personal · pripremljena zaštita uz zasebnu dugu lozinku.</p>':`<label for="wifi-security">Zaštita Wi-Fi veze</label><select id="wifi-security"><option value="">Odaberi zaštitu</option>${WIFI_SECURITY.map(([id,label])=>`<option value="${id}" ${run.wifiSettings.security===id?'selected':''}>${label}</option>`).join('')}</select><p>Lozinka se u ovoj simulaciji postavlja automatski. Ne upisuješ pravu lozinku.</p>`}</article><article class="evidence-card"><h3>2. Mrežne granice</h3><label for="wifi-guests">Pristup gostiju</label><select id="wifi-guests"><option value="">Odaberi pristup</option>${WIFI_GUESTS.filter(([id])=>!junior||id!=='blocked').map(([id,label])=>`<option value="${id}" ${run.wifiSettings.guests===id?'selected':''}>${label}</option>`).join('')}</select><p>Promjena naziva mreže sama ne mijenja pristup. Ovdje postavljaš pravila.</p></article></div><section class="wifi-preview" aria-label="Učinak odabranih postavki"><h3>Učinak postavki</h3><div class="wifi-path"><span>Bežična veza</span><output id="wifi-radio" aria-live="polite"></output></div><div class="wifi-path"><span>Gost → internet</span><output id="wifi-internet" aria-live="polite"></output></div><div class="wifi-path"><span>Gost → interna školska mreža</span><output id="wifi-internal" aria-live="polite"></output></div></section><div id="feedback" class="feedback" role="status" hidden></div><button id="apply-wifi" class="primary wide">Primijeni i isprobaj ${ico('check')}</button>`,()=>{
    const read=():WifiSettings=>({security:junior?'wpa3':$<HTMLSelectElement>('#wifi-security').value as WifiSettings['security'],guests:$<HTMLSelectElement>('#wifi-guests').value as WifiSettings['guests']});
    const update=()=>{const draft=read(),result=wifiPreview(draft);for(const [id,label,ok] of [
      ['radio',!draft.security?'ODABERI ZAŠTITU':result.protectedRadio?'WPA3 · ZAŠTIĆENO':draft.security==='wep'?'WEP · ZASTARJELO':'BEZ ZAŠTITE',result.protectedRadio],
      ['internet',!draft.guests?'ODABERI PRISTUP':result.guestInternet?'PROLAZI':'BLOKIRANO',!!draft.guests&&result.guestInternet],
      ['internal',!draft.guests?'ODABERI PRISTUP':result.guestInternal?'PROLAZI · NEPOTREBNA OVLAST':'BLOKIRANO',!!draft.guests&&!result.guestInternal],
    ] as const){const output=$(`#wifi-${id}`);output.textContent=label;output.classList.toggle('safe',ok);}};
    for(const id of junior?['guests']:['security','guests'])$(`#wifi-${id}`).onchange=()=>{run.wifiSettings=read();bridge.changed();update();};
    update();$('#apply-wifi').onclick=()=>submitConsole(configureWifi(run,read()));
  });
}
function riskConsole(){
  const junior=run.content==='junior',risks=risksFor(run.content),priorities=prioritiesFor(run.content);
  openDialog(`<div class="eyebrow">POVEŽI DOKAZE I PRIORITET</div><h2 id="dialog-title">Što traži bržu zaštitu?</h2>
    <p class="dialog-lead">${junior?'Usporedi koliko se problem može dogoditi i koliko bi naštetio školskom radu. Odaberi visok ili nizak prioritet.':'Tim je za sljedeći mjesec procijenio vjerojatnost (V) i učinak (U): 1 malo, 2 umjereno, 3 veliko. Pomnoži zadane ocjene i odredi prioritet prema školskoj ljestvici.'}</p>
    ${junior?'':`<div class="risk-scale" aria-label="Pravilo školskog modela"><span>V × U = prioritet</span><span class="priority low">1–2 · nizak</span><span class="priority medium">3–4 · srednji</span><span class="priority high">6–9 · visok</span></div><p class="fine-print">Ocjene su procjena tima u izmišljenom slučaju. Ova ljestvica nije univerzalna formula ni izračun novčanog gubitka.</p>`}
    <div class="evidence-cards risk-cards" style="--card-count:${risks.length}">${risks.map((risk,index)=>`<article class="evidence-card"><div class="risk-index">SLUČAJ ${index+1}</div><h3>${risk.label}</h3><p>${junior?risk.simple:risk.evidence}</p>${junior?'':`<div class="risk-ratings"><span>Vjerojatnost <b>${risk.likelihood}</b></span><span>Učinak <b>${risk.impact}</b></span></div>`}<label for="risk-${risk.id}">Prioritet zaštite</label><select id="risk-${risk.id}"><option value="">Odaberi prioritet</option>${priorities.map(([id,label])=>`<option value="${id}" ${run.riskAnswers[risk.id]===id?'selected':''}>${label}</option>`).join('')}</select></article>`).join('')}</div>
    <p class="fine-print">Odabiri se spremaju. Prazno polje nije pogrešna odluka.</p><div id="feedback" class="feedback" role="status" hidden></div><button id="assess-risks" class="primary wide">Provjeri prioritete ${ico('check')}</button>`,()=>{
    const read=()=>Object.fromEntries(risks.map(risk=>[risk.id,$<HTMLSelectElement>(`#risk-${risk.id}`).value as RiskPriority]).filter(([,value])=>value));
    for(const risk of risks)$(`#risk-${risk.id}`).onchange=()=>{run.riskAnswers=read();bridge.changed();};
    $('#assess-risks').onclick=()=>submitConsole(assessRisks(run,read()));
  });
}
function measuresConsole(){
  const tier=run.content,junior=tier==='junior',measures=measuresFor(tier),risks=risksFor(tier),budget=budgetFor(tier);
  const priorityName=(id:RiskPriority)=>PRIORITIES.find(([key])=>key===id)?.[1]||'';
  openDialog(`<div class="eyebrow">OGRANIČENI RESURSI · STVARNI PRIORITETI</div><h2 id="dialog-title">Složi plan zaštite.</h2>
    <p class="dialog-lead">${junior?'Odaberi zaštitu važnih radova. Na raspolaganju su tri jedinice rada.':'Na raspolaganju je pet jedinica rada. Prvo zaštiti arhivu visokog prioriteta, zatim račun srednjeg prioriteta. Odaberi mjere koje stanu u plan.'} Jedinice su dogovorena vrijednost ove vježbe.</p>
    <div class="budget-strip"><span>Planirano / dostupno</span><output id="measure-budget" aria-live="polite"></output></div>
    <div class="operations-grid"><div class="measure-list">${measures.map(measure=>`<label class="measure-option"><input type="checkbox" id="measure-${measure.id}" ${run.riskMeasures.includes(measure.id)?'checked':''}><span><strong>${measure.label}</strong><small>${junior?measure.simple:measure.detail}</small></span><b class="measure-cost" aria-label="${measure.cost} jedinica rada">${measure.cost}</b></label>`).join('')}</div>
    <section class="risk-outcomes" aria-label="Očekivani učinak plana"><h3>Prije → poslije mjere</h3><p class="fine-print">${junior?'Kopija čuva radove, ali ne popravlja disk.':'Preostali rizik je procjena nakon mjere. Sljedeća stanica provjerava njezin učinak.'}</p>${risks.map(risk=>`<article><h4>${risk.label}</h4><output id="remaining-${risk.id}" aria-live="polite"></output><p id="effect-${risk.id}"></p></article>`).join('')}</section></div>
    <div id="feedback" class="feedback" role="status" hidden></div><button id="apply-measures" class="primary wide">Predaj plan zaštite ${ico('check')}</button>`,()=>{
    const read=()=>measures.filter(measure=>$<HTMLInputElement>(`#measure-${measure.id}`).checked).map(measure=>measure.id);
    const paint=()=>{const preview=riskPreview(tier,read());const budgetOutput=$('#measure-budget');budgetOutput.textContent=`${preview.cost} / ${budget}${preview.cost>budget?' · prekoračeno':''}`;budgetOutput.classList.toggle('over-budget',preview.cost>budget);
      for(const row of preview.rows){const output=$(`#remaining-${row.id}`);output.textContent=`${priorityName(row.before)} → ${priorityName(row.after)}`;output.className='priority '+row.after;$(`#effect-${row.id}`).textContent=row.detail;}
    };
    for(const measure of measures)$(`#measure-${measure.id}`).onchange=()=>{run.riskMeasures=read();bridge.changed();paint();};
    paint();$('#apply-measures').onclick=()=>submitConsole(planRiskMeasures(run,read()));
  });
}
function responseConsole(){
  const tier=run.content,junior=tier==='junior',labels=['Na početku','Nakon ograničavanja','Prije povratka'];
  openDialog(`<div class="eyebrow">PROBA PLANA · LAB-12</div><h2 id="dialog-title">Od prijave do povratka.</h2>
    <p class="dialog-lead">${junior?'Odaberi prvi i posljednji korak. Administratorov popravak u sredini već je pripremljen.':'Složi tri koraka za ovaj slučaj. Najprije ograniči širenje, zatim pripremi oporavak, a prije povratka provjeri rad i ovlasti.'}</p>
    <div class="response-steps evidence-cards" style="--card-count:3">${labels.map((label,index)=>`<article class="evidence-card"><div class="response-number" aria-hidden="true">${index+1}</div><h3>${label}</h3>${junior&&index===1?'<p class="prepared-step">Pripremljeno: administrator uklanja uzrok i vraća provjerene podatke.</p>':`<label for="response-${index}">Postupak u koraku ${index+1}</label><select id="response-${index}"><option value="">Odaberi postupak</option>${responseOptions(tier,index).map(step=>`<option value="${step.id}" ${run.responseOrder[index]===step.id?'selected':''}>${junior?step.simple:step.label}</option>`).join('')}</select>`}<div class="step-outcome" id="response-effect-${index}" role="status"></div></article>`).join('')}</div>
    <p class="fine-print">Ovo je proba odabranog slijeda, a ne promjena stvarnog računala. Prijava, komunikacija i čuvanje dokaza traju cijelo vrijeme. Koraci se u stvarnosti mogu preklapati.</p>
    <div id="feedback" class="feedback" role="status" hidden></div><button id="apply-response" class="primary wide">Provjeri plan postupanja ${ico('check')}</button>`,()=>{
    const read=()=>cleanResponse(labels.map((_,index)=>junior&&index===1?'recover':$<HTMLSelectElement>(`#response-${index}`).value),tier);
    const paint=()=>responsePreview(read()).steps.forEach((step,index)=>{const output=$(`#response-effect-${index}`);output.textContent=step.text;output.classList.toggle('safe',step.ok);});
    for(let index=0;index<3;index++){if(junior&&index===1)continue;$(`#response-${index}`).onchange=()=>{run.responseOrder=read();bridge.changed();paint();};}
    paint();$('#apply-response').onclick=()=>submitConsole(planIncidentResponse(run,read()));
  });
}
let reviewTimer:number|undefined;
function stopReviewClock(){if(reviewTimer!==undefined){clearInterval(reviewTimer);reviewTimer=undefined;if(running){profile(save,run.content).active=run;persist();}}}
function openExpertReview(station:string,choice:string){
  const review=EXPERT_REVIEWS[run.level];
  openDialog(`<div class="eyebrow">EXPERT · ANALIZA SLUČAJA</div><h2 id="dialog-title">${review.title}</h2><p class="dialog-lead">${review.teach}</p><div class="case-evidence"><strong>Dokazi i ograničenja</strong><p>${review.evidence}</p></div><div class="review-clock"><div><strong id="clock-status"></strong><small>Vrijeme ne mijenja bodove učenja. Zatvaranje prozora pauzira mjerenje.</small></div><button id="clock-start" class="secondary">Pokreni 90 s</button><button id="clock-off" class="text-button">Isključi mjerenje</button></div><div class="review-questions">${review.questions.map((question,i)=>`<fieldset><legend>${i+1}. ${question.label}</legend>${question.choices.map(([value,label])=>`<label><input type="radio" name="review-${question.id}" value="${value}" ${run.review.answers[question.id]===value?'checked':''}><span>${label}</span></label>`).join('')}</fieldset>`).join('')}</div><div id="feedback" class="feedback" role="status" hidden></div><button id="submit-review" class="primary wide">Primijeni plan i provjeri ${ico('check')}</button>`,()=>{
    const paint=()=>{const clock=run.review;$('#clock-status').textContent=clock.expired?'Vrijeme je isteklo — nastavi bez kazne':!clock.enabled?'Analiza bez mjerenja vremena':!clock.started?'Najprije pročitaj slučaj':`${Math.ceil(clock.remaining)} s · preostalo`;
      $('#clock-start').hidden=!clock.enabled||clock.started;$('#clock-off').hidden=!clock.enabled||clock.expired;};
    for(const question of review.questions)document.querySelectorAll<HTMLInputElement>(`input[name="review-${question.id}"]`).forEach(input=>input.onchange=()=>{run.review.answers[question.id]=input.value;bridge.changed();});
    let previous=performance.now();paint();
    $('#clock-start').onclick=()=>{run.review.started=true;previous=performance.now();bridge.changed();paint();};
    $('#clock-off').onclick=()=>{run.review.enabled=false;bridge.changed();paint();};
    reviewTimer=window.setInterval(()=>{const now=performance.now(),elapsed=(now-previous)/1000;previous=now;if(document.hidden||!document.hasFocus())return;advanceReviewClock(run,elapsed<2?elapsed:0);paint();},250);
    $('#submit-review').onclick=()=>{const result=submitExpertReview(run,Object.fromEntries(review.questions.map(question=>[question.id,document.querySelector<HTMLInputElement>(`input[name="review-${question.id}"]:checked`)?.value||''])));bridge.changed();if(result.ok)perform(station,choice);else revealFeedback(result.title,result.message);};
  });
}
function permissions(s:Station,kind:'schedule'|'grades'){
  const junior=run.content==='junior';
  const roles=junior?[['student','Učenik'],['teacher','Nastavnik']]:[['student','Učenik'],['teacher','Nastavnik'],['guest','Gost']];
  const policy=kind==='schedule'?'Raspored čitaju učenik i gost, a ovlašteni nastavnik smije ga i uređivati.':'U ovoj misiji samo ovlašteni nastavnik smije uređivati Ocjene; učenik i gost nemaju pristup.';
  openDialog(`<div class="eyebrow">POSTAVKE PRISTUPA</div><h2 id="dialog-title">${s.label}</h2><p class="dialog-lead permission-policy">${policy} <span>Uređivanje uključuje čitanje.${junior?` Pravo gosta već je postavljeno: ${kind==='schedule'?'čitanje':'bez pristupa'}.`:''}</span></p><div class="permission-table" style="--role-count:${roles.length}">${roles.map(([key,name])=>`<label><span>${name}</span><select id="permission-${key}" aria-label="Prava: ${name}"><option value="none">Bez pristupa</option><option value="read">Čitanje</option><option value="write">Uređivanje</option></select></label>`).join('')}</div><button id="apply-permissions" class="primary wide">Primijeni i isprobaj ${ico('check')}</button><div id="feedback" class="feedback" role="status" hidden></div>`,()=>{$('#apply-permissions').onclick=()=>{
    const p={student:$<HTMLSelectElement>('#permission-student').value,teacher:$<HTMLSelectElement>('#permission-teacher').value,guest:junior?(kind==='schedule'?'read':'none'):$<HTMLSelectElement>('#permission-guest').value} as Permissions;
    const res=applyPermissions(run,kind,p);bridge.changed();if(res.ok){closeDialog();showResult(res);}else{revealFeedback(res.title,res.message);}
  };});
}
function settings(){openDialog(`<div class="eyebrow">SADRŽAJ I TEMPO BIRAŠ ODVOJENO</div><h2 id="dialog-title">Tvoj način učenja</h2><div class="settings-grid"><div><label class="setting-label" for="content-setting">Nastavni sadržaj</label><select id="content-setting" class="wide-select">${TIERS.map(tier=>`<option value="${tier}">${TIER_INFO[tier].name} · ${TIER_INFO[tier].age}</option>`).join('')}</select><p class="fine-print" id="setting-content-detail"></p></div><div><label class="setting-label" for="difficulty">Tempo igranja</label><select id="difficulty" class="wide-select"><option value="relaxed">Bez smetnji</option><option value="easy">Lagan · spore smetnje</option><option value="medium">Srednji · brže smetnje</option><option value="hard">Brz · bez oznake cilja na tlu</option></select><p class="fine-print">Brzina, sudari i žuti bitovi ne mijenjaju bodove učenja.</p></div></div><label class="switch-row">Vremenski izazov u Expertu (90 s)<input type="checkbox" id="timed"></label><p class="fine-print">Odbrojavanje počinje tek kad pročitaš slučaj i pokreneš ga. Možeš ga isključiti; istek ne oduzima bodove.</p><label class="switch-row">Kratki zvučni efekti<input type="checkbox" id="sound"></label><label class="switch-row">Smanjeno gibanje i bljeskanje<input type="checkbox" id="reduced"></label><p class="fine-print">Tempo možeš promijeniti i za započetu misiju. Početno mjerenje vrijedi za nove pokušaje; u otvorenoj analizi možeš ga isključiti. Svaka razina sadržaja ima svoj napredak; dosadašnji rezultati pripadaju Standardu.</p><button id="save-settings" class="primary wide">Spremi postavke</button><details class="reset-details"><summary>Upravljanje napretkom</summary><button id="settings-progress" class="secondary">Moj rad i kopije</button><p>Brisanje uklanja napredak svih triju razina i prethodni zapis za povratak samo na ovom uređaju.</p><button id="reset-progress" class="danger">Obriši lokalni napredak</button></details>`,()=>{
  $<HTMLSelectElement>('#content-setting').value=save.settings.content;$<HTMLSelectElement>('#difficulty').value=profile(save).active?.difficulty||save.settings.difficulty;$<HTMLInputElement>('#timed').checked=save.settings.timed;$<HTMLInputElement>('#sound').checked=save.settings.sound;$<HTMLInputElement>('#reduced').checked=save.settings.reducedMotion;
  const detail=()=>$('#setting-content-detail').textContent=TIER_INFO[$<HTMLSelectElement>('#content-setting').value as ContentTier].detail;$('#content-setting').onchange=detail;detail();
  $('#save-settings').onclick=()=>{save.settings.content=$<HTMLSelectElement>('#content-setting').value as ContentTier;save.settings.difficulty=$<HTMLSelectElement>('#difficulty').value as Difficulty;if(profile(save).active)profile(save).active!.difficulty=save.settings.difficulty;save.settings.timed=$<HTMLInputElement>('#timed').checked;save.settings.sound=$<HTMLInputElement>('#sound').checked;save.settings.reducedMotion=$<HTMLInputElement>('#reduced').checked;bridge.reducedMotion=save.settings.reducedMotion;persist();closeDialog();renderHome();tone();};
  $('#settings-progress').onclick=()=>myWork();
  $('#reset-progress').onclick=()=>openDialog(`<h2 id="dialog-title">Obrisati napredak?</h2><p class="dialog-lead">Izbrisat će se spremljene misije, najbolji rezultati, slučajevi primjene i prethodni zapis za povratak za Junior, Standard i Expert na ovom uređaju. Preuzete datoteke kopija ostaju kod tebe.</p><div id="feedback" class="feedback" role="status" hidden></div><button id="confirm-reset" class="danger wide">Obriši napredak</button><button id="cancel-reset" class="secondary wide">Zadrži napredak</button>`,()=>{$('#confirm-reset').onclick=()=>{const next=emptySave(),raw=JSON.stringify(next);try{if(localStorage.getItem(SAVE_KEY)!==lastStoredRaw){revealFeedback('Napredak je promijenjen','Osvježi igru prije brisanja napretka.');return;}localStorage.removeItem(RESTORE_POINT_KEY);localStorage.setItem(SAVE_KEY,raw);}catch{revealFeedback('Brisanje nije dovršeno','Pohrana preglednika nije dostupna.');return;}save=next;lastStoredRaw=raw;storageOK=true;bridge.reducedMotion=false;home();};$('#cancel-reset').onclick=closeDialog;});
});}
function how(){openDialog(`<div class="eyebrow">DOBRO DOŠAO, ČUVARU</div><h2 id="dialog-title">Istraži. Odluči. Provjeri.</h2><div class="lesson-grid"><article><span>01</span><div><h3>Kreći se prostorijama</h3><p>Na mobitelu koristi palicu. Na računalu WASD ili strelice. Možeš dodirnuti tlo ili trenutačni cilj za kretanje do njega.</p></div></article><article><span>02</span><div><h3>Priđi i djeluj</h3><p>Kad si blizu opreme, pritisni E ili tipku Djeluj. Uredi zaštitu i isprobaj njezin učinak.</p></div></article><article><span>03</span><div><h3>Izbjegavaj smetnje</h3><p>Q, razmak ili tipka Štit kratko štite lika. Žuti bitovi nose arkadni bonus. U postavkama možeš odabrati i igru bez smetnji. Sudari ne mijenjaju bodove učenja.</p></div></article></div><div class="note">Svaka misija ima 4 sigurnosne zadaće i 100 bodova učenja. Rezultat bilježi i koje si odluke ispravio. Ponavljanje čuva najbolji rezultat bez gomilanja istih bodova. Arkadni bonus prikazuje se zasebno.</div><p class="fine-print">Sadržaj je prvenstveno namijenjen uzrastu 13–18 godina. Junior, Standard i Expert biraju se prema predznanju; dobne oznake su preporuka, a ne formalna PEGI klasifikacija. Primjerenost i razumljivost treba potvrditi isprobavanjem s učenicima.</p><button id="got-it" class="primary wide">Razumijem ${ico('check')}</button>`,()=>$('#got-it').onclick=closeDialog);}

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

$('#play-primary').onclick=()=>{if(profile(save).active)start(profile(save).active!.level,true);else start(LEVELS.find(l=>!profile(save).best[l.id]?.completed)?.id||1);};
$('#content-level').onchange=()=>{save.settings.content=$<HTMLSelectElement>('#content-level').value as ContentTier;persist();renderHome();};$('#pace-settings').onclick=settings;
$('#practice-open').onclick=practiceHub;$('#progress-open').onclick=()=>myWork();
$('#how-play').onclick=how;$('#home-settings').onclick=settings;$('#version').onclick=()=>openDialog(`<div class="eyebrow">SISGAME ${VERSION}</div><h2 id="dialog-title">Sačuvaj svoj rad.</h2><p class="dialog-lead">Novo: Moj rad prikazuje rezultate i nedovršene misije po razinama. Preuzmi JSON kopiju svih triju razina za nastavak na drugom uređaju ili TXT sažetak za čitanje. Prije obnove pregledaj usporedbu; igra čuva prethodni zapis za povratak. Kampanja i dodatni slučajevi ostaju dostupni.</p><button id="version-close" class="primary wide">U redu</button>`,()=>$('#version-close').onclick=closeDialog);
document.querySelectorAll<HTMLButtonElement>('.offline-button').forEach(b=>b.onclick=offlineInfo);
$('#pause').onclick=pause;$('#back-map').onclick=pause;$('#lesson').onclick=()=>briefing(true);$('#goal').onclick=()=>{if(!bridge.paused)sector.guide();};$('#action').onclick=()=>sector.use();$('#shield').onclick=()=>sector.shield();
document.addEventListener('keydown',e=>{if(!running||dialog.open)return;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();if(e.repeat)return;if(e.key.toLowerCase()==='e')sector.use();if(e.key.toLowerCase()==='q'||e.key===' ')sector.shield();if(e.key==='Escape'){e.preventDefault();pause();}});
const stick=$('#joystick'),thumb=$('#joy-thumb');let stickPointer:number|null=null;
function moveStick(e:PointerEvent){const r=stick.getBoundingClientRect(),dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2;const limit=r.width*.3,d=Math.hypot(dx,dy),scale=d>limit?limit/d:1;const x=dx*scale,y=dy*scale;bridge.axes={x:x/limit,y:y/limit};thumb.style.transform=`translate(${x}px,${y}px)`;}
function releaseStick(){stickPointer=null;bridge.axes={x:0,y:0};thumb.style.transform='translate(0,0)';}
stick.addEventListener('pointerdown',e=>{if(bridge.paused)return;stickPointer=e.pointerId;stick.setPointerCapture(e.pointerId);moveStick(e);e.preventDefault();});
stick.addEventListener('pointermove',e=>{if(e.pointerId===stickPointer)moveStick(e);});stick.addEventListener('pointerup',releaseStick);stick.addEventListener('pointercancel',releaseStick);stick.addEventListener('lostpointercapture',releaseStick);
document.addEventListener('visibilitychange',()=>{if(document.hidden){releaseStick();if(running){profile(save).active=run.completed?null:run;persist();if(!dialog.open)pause();}}});
window.addEventListener('blur',()=>{releaseStick();if(running&&!dialog.open)pause();});
window.addEventListener('pagehide',()=>{if(running)profile(save).active=run.completed?null:run;persist();});
function resizeGame(){if(running){game.scale.getParentBounds();game.scale.refresh();}}
// Fixed elements can retain old layout bounds while mobile browser chrome changes.
// Follow the visible viewport at normal zoom; preserve the user's pinch zoom.
function syncViewport(){
  const viewport=window.visualViewport;
  if(viewport&&Math.abs(viewport.scale-1)>.01)return;
  document.documentElement.style.setProperty('--app-height',`${viewport?.height||window.innerHeight}px`);
  document.documentElement.style.setProperty('--app-top',`${viewport?.offsetTop||0}px`);
}
let viewportFrame=0;
function queueViewportSync(){cancelAnimationFrame(viewportFrame);viewportFrame=requestAnimationFrame(syncViewport);}
window.addEventListener('resize',queueViewportSync);
window.addEventListener('pageshow',queueViewportSync);
window.visualViewport?.addEventListener('resize',queueViewportSync);
window.visualViewport?.addEventListener('scroll',queueViewportSync);
syncViewport();
new ResizeObserver(resizeGame).observe($('#game-stage'));
renderHome();persist();void setupOffline();
