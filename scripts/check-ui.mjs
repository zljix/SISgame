import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import { runInNewContext } from 'node:vm';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';
import * as core from '../src/core.ts';
import * as data from '../src/data.ts';
import * as curriculum from '../src/curriculum.ts';
import * as missions from '../src/missions.ts';
import * as network from '../src/network.ts';
import * as operations from '../src/operations.ts';
import * as storage from '../src/storage.ts';
import * as practice from '../src/practice.ts';
import * as progress from '../src/progress.ts';
import * as integrity from '../src/integrity.ts';
import * as controls from '../src/controls.ts';
import * as learning from '../src/learning.ts';
import * as study from '../src/study.ts';

// Local DOM unit harness. No network, user browser, rendering or real game canvas.
const source=stripTypeScriptTypes(await readFile('src/main.ts','utf8'))
 .replace(/^import .*;\s*$/gm,'').replaceAll('import.meta.env.PROD','false');
let assertions=0;
function check(value,message){assert.ok(value,message);assertions++;}
async function setup(tier, saved=null, device={}){
 const w=new Window({url:'https://sisgame.invalid/',settings:{enableJavaScriptEvaluation:false,enableCSSFileLoading:false,enableImageFileLoading:false,enableIframePageLoading:false,disableJavaScriptFileLoading:true,navigation:{disableMainFrameNavigation:true,disableChildFrameNavigation:true,disableChildPageNavigation:true}}});
 w.document.body.innerHTML='<div id="app"></div>';
 const pointers={coarse:!!device.coarse,fine:!!device.fine};
 const media=new Map();
 w.matchMedia=query=>{const key=query==='(pointer: coarse)'?'coarse':'fine';const item={matches:pointers[key],addEventListener:(_name,listener)=>{item.listener=listener;}};media.set(key,item);return item;};
 if(device.preference)w.localStorage.setItem(controls.CONTROL_KEY,device.preference);
 const initial=storage.emptySave();initial.settings.content=tier;initial.settings.difficulty='relaxed';
 for(let n=1;n<=10;n++)storage.profile(initial).best[n]={learning:100,arcade:0,independent:4,completed:true};
 w.localStorage.setItem(storage.SAVE_KEY,saved||JSON.stringify(initial));
 const storageControl={blockedKey:''};
 const testStore={getItem:key=>w.localStorage.getItem(key),removeItem:key=>w.localStorage.removeItem(key),setItem:(key,value)=>{if(key===storageControl.blockedKey)throw new Error('Simulated quota');w.localStorage.setItem(key,value);}};
 const downloads=[],objects=new Map();let objectNumber=0;
 class LocalURL extends URL {
  static createObjectURL(blob){const url=`blob:https://sisgame.invalid/${++objectNumber}`;objects.set(url,blob);return url;}
  static revokeObjectURL(url){objects.delete(url);}
 }
 w.HTMLAnchorElement.prototype.click=function(){if(this.download)downloads.push({filename:this.download,blob:objects.get(this.href)});};
 const calls={guide:0,use:0,shield:0,reset:0,config:null};
 class Sector {startRun(){} resetInput(){calls.reset++;} sync(){} guide(){calls.guide++;} use(){calls.use++;} shield(){calls.shield++;}}
 const context={window:w,document:w.document,navigator:w.navigator,localStorage:testStore,location:w.location,console,Blob,URL:LocalURL,
  requestAnimationFrame:()=>0,cancelAnimationFrame:()=>{},clearInterval:()=>{},performance,
  ResizeObserver:class{observe(){}disconnect(){}},
  Phaser:{AUTO:0,Scale:{RESIZE:0},Game:class{constructor(config){calls.config=config;} scale={getParentBounds(){},refresh(){}}}},Sector,
  ...core,...data,...curriculum,...missions,...network,...operations,...storage,...practice,...progress,...integrity,...controls,...learning,...study};
 runInNewContext(source+'\nwindow.__checks={start,openStation,finish,updateHUD,getRun:()=>run,getSave:()=>save,getBridge:()=>bridge,getMode:()=>playMode};',context);
 const h=w.__checks;
 const click=id=>{const e=w.document.querySelector(id);assert.ok(e,id);e.click();};
 const select=(id,value)=>{const e=w.document.querySelector(id);assert.ok(e,id);e.value=value;e.dispatchEvent(new w.Event('change',{bubbles:true}));};
 const tick=(id,value=true)=>{const e=w.document.querySelector(id);assert.ok(e,id);e.checked=value;e.dispatchEvent(new w.Event('change',{bubbles:true}));};
 const station=id=>h.openStation(data.LEVELS[h.getRun().level-1].stations.find(s=>s.id===id));
 const chooseFile=async(file)=>{const input=w.document.querySelector('#import-progress'),transfer=new w.DataTransfer();transfer.items.add(file);input.files=transfer.files;await input.onchange(new w.Event('change'));};
 return{w,h,click,select,tick,station,chooseFile,downloads,storageControl,calls,media,close:()=>w.happyDOM.close()};
}
for(const tier of curriculum.TIERS){
 const {w,h,click,select,tick,station,close}=await setup(tier);
 check(w.document.querySelectorAll('.mission-card').length===data.LEVELS.length,`${tier}: all mission cards`);
 check(!w.document.querySelector('[data-level="11"]').disabled,`${tier}: new mission unlocked`);
 check(w.document.querySelector('[data-level="12"]').disabled,`${tier}: next mission still locked`);
 h.start(11);click('#begin');station('assets');click('[data-choice="context"]');station('risk-analysis');
 check(w.document.querySelectorAll('.risk-cards select').length===(tier==='junior'?2:3),`${tier}: risk controls`);
 select('#risk-archive','low');select('#risk-poster','low');if(tier!=='junior')select('#risk-account','medium');click('#assess-risks');
 check(!w.document.querySelector('#feedback').hidden,`${tier}: wrong answer feedback`);
 select('#risk-archive','high');click('#assess-risks');
 check(core.score(h.getRun())===50,`${tier}: correct priorities`);
 station('risk-plan');tick('#measure-backup');if(tier!=='junior')tick('#measure-accounts');tick('#measure-design');
 check(w.document.querySelector('#measure-budget').classList.contains('over-budget'),`${tier}: budget warning`);
 click('#apply-measures');check(!w.document.querySelector('#feedback').hidden,`${tier}: cannot submit over budget`);
 tick('#measure-design',false);
 check(w.document.querySelector('#remaining-archive').textContent==='Visok → Srednji',`${tier}: residual risk shown`);
 const saved=w.localStorage.getItem(storage.SAVE_KEY);
 await close();
 const resumed=await setup(tier,saved);const {w:rw,h:rh,click:rc,station:rs}=resumed;
 rc('#play-primary');rc('#begin');rs('risk-plan');
 check(rw.document.querySelector('#measure-backup').checked,`${tier}: selected measure restored`);
 rc('#apply-measures');check(core.score(rh.getRun())===75,`${tier}: accepted plan`);
 rs('risk-test');rc('[data-choice="test"]');
 if(tier==='expert'){
  for(const q of curriculum.EXPERT_REVIEWS[11].questions)rc(`input[name="review-${q.id}"][value="${q.answer}"]`);
  rc('#submit-review');
 }
 check(rw.document.querySelector('#verification-done'),`${tier}: report opens`);
 rc('#verification-done');rs('exit');
 check(rw.document.querySelector('#next'),`${tier}: mission eleven finished`);rc('#next');rc('#begin');
 rs('incident-report');rc('[data-choice="facts"]');rs('response-plan');
 check(rw.document.querySelectorAll('.response-steps select').length===(tier==='junior'?2:3),`${tier}: response controls`);
 resumed.select('#response-0','erase');if(tier!=='junior')resumed.select('#response-1','recover');resumed.select('#response-2','verify');rc('#apply-response');
 check(!rw.document.querySelector('#feedback').hidden,`${tier}: erase evidence rejected`);
 resumed.select('#response-0','contain');rc('#apply-response');
 check(core.score(rh.getRun())===50,`${tier}: valid response`);
 rs('recovery-source');rc('[data-choice="newest"]');check(!rw.document.querySelector('#feedback').hidden,`${tier}: damaged copy rejected`);
 rc('[data-choice="verified"]');rs('incident-test');rc('[data-choice="test"]');
 if(tier==='expert'){
  for(const q of curriculum.EXPERT_REVIEWS[12].questions)rc(`input[name="review-${q.id}"][value="${q.answer}"]`);
  rc('#submit-review');
 }
 rc('#verification-done');rs('exit');rc('#results-practice');
 check(rw.document.querySelector('#dialog-title').textContent===practice.practiceCase(12,tier).title,`${tier}: completion opens matching transfer case`);
 rc('#dialog-close');
 check(!rw.document.querySelector('#home').hidden,`${tier}: campaign returns to map`);
 check(storage.profile(rh.getSave()).best[12].completed,`${tier}: final mission saved`);
 check(rw.document.querySelector('#total-xp').textContent==='1200',`${tier}: points total`);
 await resumed.close();
}
for(const tier of curriculum.TIERS){
 const initial=storage.emptySave();initial.settings.content=tier;
 for(const level of data.LEVELS)initial.profiles[tier].best[level.id]={learning:100,arcade:0,independent:4,completed:true};
 initial.profiles[tier].active=core.newRun(6,'relaxed',tier);
 let ui=await setup(tier,JSON.stringify(initial));
 ui.click('#practice-open');
 check(ui.w.document.querySelectorAll('[data-practice]').length===practice.PRACTICE_CASES.length,`${tier}: all transfer cases`);
 for(const {level} of practice.PRACTICE_CASES){
  ui.click(`[data-practice="${level}"]`);
  const scenario=practice.practiceCase(level,tier);
  check(ui.w.document.querySelectorAll('.practice-questions fieldset').length===(tier==='expert'?3:2),`${tier}/${level}: adapted questions`);
  check(ui.w.document.querySelectorAll('.practice-questions input').length===(tier==='junior'?4:tier==='expert'?9:6),`${tier}/${level}: adapted choices`);
  if(level===1){
   ui.click('#practice-submit');
   check(ui.w.document.querySelector('#feedback').textContent.includes('Dopuni odabire'),`${tier}: incomplete guidance`);
   check(!storage.profile(ui.h.getSave()).practice[1],`${tier}: no attempt for empty form`);
   const first=scenario.questions[0];
   ui.click(`input[name="practice-${first.id}"][value="${first.answer}"]`);
   ui.click('#practice-lesson');ui.click('#practice-back');
   check(ui.w.document.querySelector(`input[name="practice-${first.id}"][value="${first.answer}"]`).checked,`${tier}: lesson preserves draft`);
   ui.click('#practice-lesson');ui.click('#dialog-close');
   check(ui.w.document.querySelector('#dialog-title').textContent===scenario.title,`${tier}: lesson close returns to case`);
   const saved=ui.w.localStorage.getItem(storage.SAVE_KEY);await ui.close();
   ui=await setup(tier,saved);ui.click('#practice-open');ui.click('[data-practice="1"]');
   check(ui.w.document.querySelector(`input[name="practice-${first.id}"][value="${first.answer}"]`).checked,`${tier}: draft reload`);
   for(const q of scenario.questions)ui.click(`input[name="practice-${q.id}"][value="${q.answer}"]`);
   const wrong=first.choices.find(c=>c.id!==first.answer);
   ui.click(`input[name="practice-${first.id}"][value="${wrong.id}"]`);ui.click('#practice-submit');
   check(!ui.w.document.querySelector(`#practice-feedback-${first.id}`).hidden,`${tier}: targeted feedback`);
   ui.click('#practice-submit');
   check(storage.profile(ui.h.getSave()).practice[1].attempts===1,`${tier}: duplicate submit ignored`);
  }
  for(const q of scenario.questions)ui.click(`input[name="practice-${q.id}"][value="${q.answer}"]`);
  ui.click('#practice-submit');
  check(!!ui.w.document.querySelector('.practice-success'),`${tier}/${level}: solved view`);
  check(storage.profile(ui.h.getSave()).practice[level].firstCorrect===(level!==1),`${tier}/${level}: first result retained`);
  check([...ui.w.document.querySelectorAll('.practice-questions fieldset')].every(f=>f.disabled),`${tier}/${level}: solved record cannot be overwritten`);
  if(level===1){ui.click('#practice-continue');check(ui.w.document.querySelector('#dialog-title').textContent===practice.practiceCase(2,tier).title,`${tier}: next available case`);}
  ui.click('#practice-overview');
 }
 check(ui.w.document.querySelector('.pause-summary').textContent.includes(`${practice.PRACTICE_CASES.length}/${practice.PRACTICE_CASES.length}`),`${tier}: full practice summary`);
 check(ui.w.document.querySelector('.note').textContent.includes('Vrijedi ponoviti'),`${tier}: correction recommendation`);
 ui.click('#practice-home');
 check(ui.w.document.querySelector('#total-xp').textContent===String(data.LEVELS.length*100),`${tier}: no campaign score inflation`);
 check(storage.profile(ui.h.getSave()).active.level===6,`${tier}: campaign draft survives practice`);
 ui.select('#content-level',tier==='junior'?'standard':'junior');ui.click('#practice-open');
 check([...ui.w.document.querySelectorAll('[data-practice]')].every(b=>b.disabled),`${tier}: other profile stays locked`);
 await ui.close();
}
for(const tier of curriculum.TIERS){
 const initial=storage.emptySave();initial.settings.content=tier;initial.settings.difficulty='relaxed';
 for(let level=1;level<=12;level++)initial.profiles[tier].best[level]={learning:100,arcade:0,independent:4,completed:true};
 let ui=await setup(tier,JSON.stringify(initial));
 check(ui.w.document.querySelectorAll('.mission-symbol svg').length===data.LEVELS.length,`${tier}: each mission has an icon`);
 check(!ui.w.document.querySelector('[data-level="13"]').disabled,`${tier}: mission thirteen unlocked from previous campaign`);
 check(ui.w.document.querySelector('[data-level="14"]').disabled,`${tier}: mission fourteen remains gated`);
 ui.click('[data-level="13"]');check(ui.w.document.querySelector('.lesson-grid').textContent.includes('SHA-256'),`${tier}: hash concept introduced before task`);ui.click('#begin');
 ui.station('hash-source');ui.click('[data-choice="message"]');check(!ui.w.document.querySelector('#feedback').hidden,`${tier}: untrusted reference feedback`);ui.click('[data-choice="known"]');
 ui.station('hash-lab');
 check(ui.w.document.querySelectorAll('.integrity-card').length===(tier==='junior'?2:3),`${tier}: adapted hash comparison count`);
 check(ui.w.document.querySelector('.hash-reference code').textContent===integrity.HASH_REFERENCE.digest,`${tier}: full reference digest visible`);
 ui.click('#check-hashes');check(ui.h.getRun().checks['hash-lab'].errors===0,`${tier}: empty hash form does not mark error`);
 ui.click('[data-hash-compare="changed"]');
 check(!ui.w.document.querySelector('#hash-result-changed').hidden&&ui.w.document.querySelector('#hash-result-changed').textContent.includes('razlikuje'),`${tier}: comparison aid explains difference`);
 ui.select('#hash-original','same');ui.select('#hash-changed','same');if(tier!=='junior')ui.select('#hash-renamed','same');
 ui.click('#check-hashes');check(ui.h.getRun().checks['hash-lab'].errors===1,`${tier}: incorrect comparison records correction`);
 const hashSave=ui.w.localStorage.getItem(storage.SAVE_KEY);await ui.close();ui=await setup(tier,hashSave);
 ui.click('#play-primary');ui.click('#begin');ui.station('hash-lab');
 check(ui.w.document.querySelector('#hash-changed').value==='same',`${tier}: hash draft survives reload`);
 ui.select('#hash-changed','changed');ui.click('#check-hashes');check(core.score(ui.h.getRun())===50,`${tier}: corrected hash comparison`);
 ui.station('hash-response');ui.click('[data-choice="rename"]');check(!ui.w.document.querySelector('#feedback').hidden,`${tier}: rename cannot fix content`);ui.click('[data-choice="retry"]');
 ui.station('hash-test');ui.click('[data-choice="test"]');
 if(tier==='expert'){
  const review=curriculum.EXPERT_REVIEWS[13];
  for(const q of review.questions)ui.click(`input[name="review-${q.id}"][value="${q.answer}"]`);
  const first=review.questions[0];ui.click(`input[name="review-${first.id}"][value="${first.choices.find(([id])=>id!==first.answer)[0]}"]`);ui.click('#submit-review');
  check(!ui.w.document.querySelector('#feedback').hidden,'expert: hash source inference needs correction');
  ui.click(`input[name="review-${first.id}"][value="${first.answer}"]`);ui.click('#submit-review');
 }
 check(ui.w.document.querySelectorAll('.verification-grid article').length===4,`${tier}: hash verification reports`);
 ui.click('#verification-done');ui.station('exit');ui.click('#results-practice');
 check(ui.w.document.querySelector('#dialog-title').textContent===practice.practiceCase(13,tier).title,`${tier}: new hash transfer case opens`);
 ui.click('#dialog-close');check(!ui.w.document.querySelector('[data-level="14"]').disabled,`${tier}: completing hash mission unlocks signatures`);
 ui.click('[data-level="14"]');check(ui.w.document.querySelector('.lesson-grid').textContent.includes('javni'),`${tier}: signature keys introduced before task`);ui.click('#begin');
 ui.station('sign-keys');ui.click('[data-choice="private"]');check(!ui.w.document.querySelector('#feedback').hidden,`${tier}: private key request rejected`);ui.click('[data-choice="public"]');
 ui.station('sign-lab');
 check(ui.w.document.querySelectorAll('.integrity-card').length===(tier==='junior'?2:3),`${tier}: adapted signature count`);
 check(ui.w.document.querySelector('.dialog-content').textContent.includes('Ne provjerava stvarne potpise'),`${tier}: teaching model labelled`);
 ui.click('#check-signatures');check(ui.h.getRun().checks['sign-lab'].errors===0,`${tier}: incomplete signature form is ungraded`);
 ui.select('#signature-key','enclosed');
 if(tier!=='junior'){
  const result=ui.w.document.querySelector('#signature-result-unknown');
  check(result.textContent.includes('Potpis prolazi')&&result.textContent.includes('nije potvrđena')&&!result.classList.contains('confirmed'),`${tier}: valid untrusted signature is not accepted`);
 }
 ui.select('#signature-approved','hold');ui.select('#signature-edited','hold');if(tier!=='junior')ui.select('#signature-unknown','accept');
 ui.click('#check-signatures');check(ui.h.getRun().checks['sign-lab'].errors===1,`${tier}: unconfirmed key cannot approve school record`);
 const signatureSave=ui.w.localStorage.getItem(storage.SAVE_KEY);await ui.close();ui=await setup(tier,signatureSave);
 ui.click('#play-primary');ui.click('#begin');ui.station('sign-lab');
 check(ui.w.document.querySelector('#signature-key').value==='enclosed'&&ui.w.document.querySelector('#signature-approved').value==='hold',`${tier}: key and decision drafts reload`);
 ui.select('#signature-key','school');
 check(ui.w.document.querySelector('#signature-result-approved').classList.contains('confirmed'),`${tier}: confirmed original passes`);
 check(ui.w.document.querySelector('#signature-result-edited').textContent.includes('ne prolazi'),`${tier}: modified contents fail`);
 ui.select('#signature-approved','accept');if(tier!=='junior')ui.select('#signature-unknown','hold');ui.click('#check-signatures');
 check(core.score(ui.h.getRun())===50,`${tier}: corrected signature decisions`);
 ui.station('sign-share');ui.click('[data-choice="public"]');check(!ui.w.document.querySelector('#feedback').hidden,`${tier}: signature does not grant confidentiality`);ui.click('[data-choice="protect"]');
 ui.station('sign-test');ui.click('[data-choice="test"]');
 if(tier==='expert'){for(const q of curriculum.EXPERT_REVIEWS[14].questions)ui.click(`input[name="review-${q.id}"][value="${q.answer}"]`);ui.click('#submit-review');}
 check(ui.w.document.querySelectorAll('.verification-grid article').length===4,`${tier}: signature verification reports`);
 ui.click('#verification-done');ui.station('exit');ui.click('#results-practice');
 check(ui.w.document.querySelector('#dialog-title').textContent===practice.practiceCase(14,tier).title,`${tier}: new signature transfer case opens`);
 ui.click('#dialog-close');
 check(ui.w.document.querySelector('#total-xp').textContent==='1400',`${tier}: complete expanded campaign total`);
 ui.click('#progress-open');ui.click('#export-progress');
 const exported=progress.readProgressBackup(await ui.downloads[0].blob.text()).save;
 check(storage.profile(exported,tier).best[14].completed&&storage.totalLearning(exported,tier)===1400,`${tier}: expanded campaign exported`);
 await ui.close();
}
{
 const legacy=await readFile('tests/fixtures/progress-v0.7.0.json','utf8');
 const ui=await setup('standard');ui.click('#progress-open');await ui.chooseFile(new ui.w.File([legacy],'v070.json'));ui.click('#confirm-import');ui.click('#progress-close');
 check(ui.w.document.querySelector('#total-xp').textContent==='1200','old exported work keeps all prior points');
 check(!ui.w.document.querySelector('[data-level="13"]').disabled&&ui.w.document.querySelector('[data-level="14"]').disabled,'old backup opens the next new mission without skipping it');
 ui.click('#play-primary');ui.click('#begin');ui.station('response-plan');
 check(ui.h.getRun().level===12&&ui.w.document.querySelector('#response-0').value==='contain','old backup resumes original draft mission');
 await ui.close();
}
{
 const initial=storage.emptySave();
 initial.profiles.standard.best[1]={learning:100,arcade:10,independent:3,completed:true};
 initial.profiles.standard.active=core.newRun(2,'relaxed');
 initial.profiles.junior.best[1]={learning:100,arcade:0,independent:4,completed:true};
 const junior=initial.profiles.junior;practice.setPracticeAnswer(junior.practice,junior.best,1,'junior','action','verify');
 const ui=await setup('standard',JSON.stringify(initial));
 const original=JSON.stringify(ui.h.getSave());
 ui.click('#progress-open');
 check(ui.w.document.querySelector('#dialog-title').textContent==='Moj rad','progress view opens');
 check(ui.w.document.querySelectorAll('.progress-table tbody tr').length===data.LEVELS.length,'progress has all mission rows');
 check(ui.w.document.querySelector('#progress-tier').value==='standard','progress starts in current tier');
 ui.click('#export-progress');
 const exported=ui.downloads[0];check(exported.filename.endsWith('.json'),'backup filename');
 check(JSON.stringify(progress.readProgressBackup(await exported.blob.text()).save)===original,'download contains the full save');
 ui.click('#export-report');const report=ui.downloads[1];
 check(report.filename.endsWith('.txt'),'report filename');
 const reportText=await report.blob.text();check(['JUNIOR','STANDARD','EXPERT'].every(name=>reportText.includes(name)),'report contains all tiers');
 ui.select('#progress-tier','junior');check(ui.w.document.querySelector('.progress-table').textContent.includes('Započeto'),'draft application shown');
 ui.select('#progress-tier','expert');check(ui.w.document.querySelector('.pause-summary').textContent.includes(`0/${data.LEVELS.length}`),'empty tier shown separately');
 check(JSON.stringify(ui.h.getSave())===original,'viewing and exporting do not mutate preferences or work');
 await ui.chooseFile(new ui.w.File(['not json'],'wrong.json'));
 check(ui.w.document.querySelector('#feedback').textContent.includes('Kopija nije učitana'),'invalid file feedback');
 check(JSON.stringify(ui.h.getSave())===original,'invalid file preserves work');
 await ui.chooseFile(new ui.w.File(['x'.repeat(progress.MAX_BACKUP_BYTES+1)],'large.json'));
 check(ui.w.document.querySelector('#feedback').textContent.includes('1 MB'),'oversize file rejected before reading');
 const malicious=JSON.parse(progress.createProgressBackup(initial));malicious.gameVersion='<img src=x onerror=alert(1)>';
 await ui.chooseFile(new ui.w.File([JSON.stringify(malicious)],'<img>.json'));
 check(!ui.w.document.querySelector('#dialog img'),'import metadata is never rendered as markup');
 const incoming=storage.emptySave();incoming.settings.content='expert';incoming.settings.reducedMotion=true;
 incoming.profiles.expert.active=core.newRun(8,'relaxed','expert');core.act(incoming.profiles.expert.active,'channel','https');
 incoming.profiles.expert.best[1]={learning:100,arcade:25,independent:2,completed:true};
 const json=progress.createProgressBackup(incoming),normalized=progress.readProgressBackup(json).save;
 const file=()=>new ui.w.File([json],'backup.json');
 const before=ui.w.localStorage.getItem(storage.SAVE_KEY);
 await ui.chooseFile(file());
 check(ui.w.document.querySelectorAll('.restore-comparison tbody tr').length===6,'preview compares both modes in all tiers');
 check(ui.w.localStorage.getItem(storage.SAVE_KEY)===before&&JSON.stringify(ui.h.getSave())===original,'preview does not apply data');
 ui.click('#cancel-import');check(ui.w.document.querySelector('#dialog-title').textContent==='Moj rad','cancel returns to progress');
 check(ui.w.localStorage.getItem(progress.RESTORE_POINT_KEY)===null,'cancel creates no restore point');
 await ui.chooseFile(file());ui.click('#dialog-close');
 check(ui.w.document.querySelector('#dialog-title').textContent==='Moj rad','closing preview cancels import');
 await ui.chooseFile(file());ui.click('#confirm-import');
 check(JSON.stringify(ui.h.getSave())===JSON.stringify(normalized),'confirmed import replaces all profiles and settings');
 check(JSON.stringify(progress.readProgressBackup(ui.w.localStorage.getItem(progress.RESTORE_POINT_KEY)).save)===original,'previous snapshot retained');
 check(ui.w.document.querySelector('#content-level').value==='expert','home updates to restored content setting');
 check(!!ui.w.document.querySelector('#restore-previous'),'restore point is accessible');
 ui.click('#restore-previous');ui.click('#confirm-import');
 check(JSON.stringify(ui.h.getSave())===original,'previous snapshot restores original work');
 check(JSON.stringify(progress.readProgressBackup(ui.w.localStorage.getItem(progress.RESTORE_POINT_KEY)).save)===JSON.stringify(normalized),'undo also preserves replaced work');
 await ui.chooseFile(file());ui.storageControl.blockedKey=progress.RESTORE_POINT_KEY;ui.click('#confirm-import');
 check(ui.w.document.querySelector('#feedback').textContent.includes('Obnova nije spremljena'),'blocked checkpoint reports failure');
 check(JSON.stringify(ui.h.getSave())===original,'failed import leaves memory unchanged');
 ui.storageControl.blockedKey='';ui.click('#cancel-import');
 let finishRead;const slow=new ui.w.File(['ignored'],'slow.json');slow.text=()=>new Promise(resolve=>finishRead=resolve);
 const pending=ui.chooseFile(slow);ui.click('#progress-close');finishRead(json);await pending;
 check(!ui.w.document.querySelector('#dialog').open,'late file read cannot reopen closed dialog');
 check(JSON.stringify(ui.h.getSave())===original,'late file read cannot change work');
 ui.click('#progress-open');let finishOlder;const older=new ui.w.File(['ignored'],'older.json');older.text=()=>new Promise(resolve=>finishOlder=resolve);
 const olderRead=ui.chooseFile(older);await ui.chooseFile(file());finishOlder(progress.createProgressBackup(initial));await olderRead;
 ui.click('#confirm-import');
 check(JSON.stringify(ui.h.getSave())===JSON.stringify(normalized),'latest file selection wins');
 ui.click('#progress-close');ui.click('#play-primary');ui.click('#begin');
 check(ui.h.getRun().level===8&&ui.h.getRun().content==='expert'&&core.score(ui.h.getRun())===25,'imported mission resumes at saved checkpoint');
 ui.click('#back-map');ui.click('#to-home');ui.click('#progress-open');
 await ui.chooseFile(new ui.w.File([progress.createProgressBackup(initial)],'initial.json'));
 const external=storage.emptySave();external.settings.sound=true;const externalRaw=JSON.stringify(external);
 ui.w.localStorage.setItem(storage.SAVE_KEY,externalRaw);const oldPoint=ui.w.localStorage.getItem(progress.RESTORE_POINT_KEY);
 ui.click('#confirm-import');
 check(ui.w.document.querySelector('#feedback').textContent.includes('promijenio'),'stale preview is rejected');
 check(ui.w.localStorage.getItem(storage.SAVE_KEY)===externalRaw&&ui.w.localStorage.getItem(progress.RESTORE_POINT_KEY)===oldPoint,'external update and restore point remain intact');
 ui.w.dispatchEvent(new ui.w.Event('pagehide'));
 check(ui.w.localStorage.getItem(storage.SAVE_KEY)===externalRaw,'pagehide cannot overwrite a detected external update');
 check(ui.w.document.querySelector('#save-status').textContent.includes('drugom prozoru'),'external update warning shown');
 ui.click('#cancel-import');ui.click('#progress-close');ui.click('#play-primary');ui.click('#begin');ui.click('#back-map');
 check(ui.w.document.querySelector('.dialog-lead').textContent.includes('Spremanje nije dostupno'),'pause does not claim stale work was saved');
 await ui.close();
}
{
 const ui=await setup('standard');ui.w.localStorage.setItem(progress.RESTORE_POINT_KEY,progress.createProgressBackup(storage.emptySave()));
 ui.click('#home-settings');ui.click('#settings-progress');check(ui.w.document.querySelector('#dialog-title').textContent==='Moj rad','settings reaches progress');
 ui.click('#progress-close');ui.click('#home-settings');ui.click('#reset-progress');ui.click('#confirm-reset');
 check(ui.w.localStorage.getItem(progress.RESTORE_POINT_KEY)===null,'confirmed reset clears restore point');
 check(JSON.stringify(ui.h.getSave())===JSON.stringify(storage.emptySave()),'confirmed reset clears all profiles');
 await ui.close();
}

// New scaffolds follow actual campaign state in every content tier.
for(const tier of curriculum.TIERS){
 const ui=await setup(tier);
 for(const level of data.LEVELS){
  ui.h.start(level.id);
  check(ui.w.document.querySelector('.learning-outcome').textContent.includes(learning.missionOutcome(level.id,tier)),`${tier}/${level.id}: measurable outcome before task`);
  check(ui.w.document.querySelectorAll('.worked-example li').length===3,`${tier}/${level.id}: situation, reason and decision`);
  check(ui.w.document.querySelectorAll('.mission-plan .mission-steps li').length===4,`${tier}/${level.id}: plan covers real checkpoints`);
  check(ui.w.document.querySelectorAll('#panel-steps [aria-current="step"]').length===1,`${tier}/${level.id}: next checkpoint marked in panel`);
  ui.click('#begin');
  const run=ui.h.getRun();
  for(const c of Object.values(run.checks))c.done=true;
  Object.values(run.checks)[0].errors=1;run.completed=true;ui.h.finish();
  check(ui.w.document.querySelector('.reflection').textContent.includes(learning.MISSION_GUIDES[level.id].reflection.question),`${tier}/${level.id}: explanation prompt on results`);
  check(!ui.w.document.querySelector('.reflection details').open,`${tier}/${level.id}: model explanation initially concealed`);
  check(ui.w.document.querySelectorAll('.results-list small')[1].textContent==='bez ispravka',`${tier}/${level.id}: no claim of independent mastery`);
  check(ui.w.document.querySelectorAll('.results-list small')[0].textContent==='uz ispravak',`${tier}/${level.id}: correction remains visible`);
  check(ui.w.document.querySelector('.dialog-actions > button').id==='results-practice',`${tier}/${level.id}: new case is the primary next step`);
 }
 await ui.close();
}
{
 const ui=await setup('standard');const {w,h,calls}=ui;
 const key=(value,options={},target=w.document.activeElement,type='keydown')=>{const event=new w.KeyboardEvent(type,{key:value,bubbles:true,cancelable:true,...options});target.dispatchEvent(event);return event;};
 const axes=()=>JSON.stringify(h.getBridge().keyboardAxes);
 const canvas=w.document.querySelector('#canvas-host');
 check(calls.config.input.keyboard===false,'Phaser global keyboard capture disabled');
 const settings=w.document.querySelector('#home-settings');settings.focus();ui.click('#home-settings');ui.click('#save-settings');
 check(w.document.activeElement===settings,'home dialog restores its invoking button');
 h.start(2);ui.click('#begin');check(w.document.activeElement===canvas,'begin focuses map for keyboard play');
 check(key('ArrowUp').defaultPrevented&&axes()==='{"x":0,"y":-1}','focused map receives movement and prevents page scroll');
 key('d');check(axes()==='{"x":1,"y":-1}','diagonal keyboard movement reaches game bridge');
 key('ArrowUp',{},canvas,'keyup');key('d',{},canvas,'keyup');check(axes()==='{"x":0,"y":0}','keyup releases movement');
 key('g');key('g',{repeat:true});check(calls.guide===1,'G guides once per press');
 key('e');key('e',{repeat:true});check(calls.use===1,'E interacts once per press');
 key('q');key(' ');check(calls.shield===2,'Q and map Space activate shield');
 key('w');key('h');check(w.document.querySelector('#dialog').open&&h.getBridge().paused,'H opens paused lesson');
 check(axes()==='{"x":0,"y":0}','opening lesson releases held movement');
 key('e');check(calls.use===1,'dialog text cannot trigger interaction');
 check(!key('ArrowDown').defaultPrevented,'dialog arrow key is not swallowed');
 ui.click('#begin');
 ui.station('schedule');const select=w.document.querySelector('#permission-student');select.focus();
 for(const value of ['ArrowUp','ArrowDown',' ','e','w'])check(!key(value).defaultPrevented,`native select preserves ${JSON.stringify(value)}`);
 check(calls.use===1&&axes()==='{"x":0,"y":0}','form input cannot move or interact with map');
 ui.click('#dialog-close');check(w.document.activeElement===canvas,'station dialog returns focus to map');
 key('w');const goal=w.document.querySelector('#goal');goal.focus();
 check(axes()==='{"x":0,"y":0}','Tab target focus stops held movement');
 check(!key(' ').defaultPrevented&&calls.shield===2,'Space on focused button retains native activation');
 check(!key('g').defaultPrevented&&calls.guide===1,'letter shortcut is limited to map focus');
 ui.click('#goal');check(calls.guide===2&&w.document.activeElement===canvas,'goal button starts route with map focus');
 key('w');check(!key('s',{ctrlKey:true}).defaultPrevented&&axes()==='{"x":0,"y":0}','browser shortcuts pass through and release movement');
 key('w');w.dispatchEvent(new w.Event('blur'));
 check(w.document.querySelector('#resume')&&axes()==='{"x":0,"y":0}','window blur pauses and releases all movement');
 ui.click('#resume');key('w',{repeat:true});check(axes()==='{"x":0,"y":0}','held repeat does not move after pause');
 key('w',{},canvas,'keyup');key('w');check(axes()==='{"x":0,"y":-1}','fresh press resumes movement');
 key('Tab');check(axes()==='{"x":0,"y":0}','Tab releases movement without preventing focus navigation');
 key('Escape');check(w.document.querySelector('#resume'),'Escape on map opens pause');ui.click('#resume');
 goal.focus();canvas.dispatchEvent(new w.PointerEvent('pointerdown',{bubbles:true,button:2}));check(w.document.activeElement===goal,'right click does not steal map focus');
 canvas.dispatchEvent(new w.PointerEvent('pointerdown',{bubbles:true,button:0}));check(w.document.activeElement===canvas,'left click restores map focus');
 // A synthetic joystick exercise checks state routing, not real device multitouch.
 const stick=w.document.querySelector('#joystick');let captured=null;
 stick.getBoundingClientRect=()=>({x:0,y:0,left:0,top:0,width:120,height:120});
 stick.setPointerCapture=id=>{captured=id;};stick.hasPointerCapture=id=>captured===id;stick.releasePointerCapture=()=>{captured=null;};
 const pointer=(type,id,x=96)=>stick.dispatchEvent(new w.PointerEvent(type,{pointerId:id,button:0,clientX:x,clientY:60,bubbles:true,cancelable:true}));
 pointer('pointerdown',1);check(h.getBridge().axes.x===1&&captured===1,'joystick writes touch axis');
 key('w');pointer('pointerdown',2,24);pointer('pointerup',2);
 check(h.getBridge().axes.x===1&&axes()==='{"x":0,"y":-1}','second pointer cannot cancel the controlling finger or keyboard');
 pointer('pointercancel',1);check(h.getBridge().axes.x===0&&axes()==='{"x":0,"y":-1}','touch cancellation leaves independent keyboard state');
 pointer('pointerdown',3);key('h');check(h.getBridge().axes.x===0&&captured===null,'opening a dialog releases touch capture');
 ui.click('#begin');
 Object.defineProperty(w.document,'hidden',{configurable:true,value:true});w.document.dispatchEvent(new w.Event('visibilitychange'));
 check(w.document.querySelector('#resume')&&h.getBridge().paused,'hidden document pauses play');
 await ui.close();
}
{
 const initial=storage.emptySave();initial.settings.difficulty='easy';initial.profiles.standard.active=core.newRun(1,'easy');
 core.collect(initial.profiles.standard.active,'card');core.act(initial.profiles.standard.active,'door','authorized');
 const ui=await setup('standard',JSON.stringify(initial),{coarse:true});
 check(ui.w.document.body.classList.contains('touch-controls'),'coarse-only device gets touch layout');
 ui.click('#play-primary');ui.click('#begin-calm');
 check(ui.h.getRun().difficulty==='relaxed'&&core.score(ui.h.getRun())===25,'calm start retains prior learning decisions');
 check(ui.h.getSave().settings.content==='standard'&&ui.h.getSave().settings.difficulty==='relaxed','calm start changes pace without changing content');
 check(ui.w.document.querySelector('#panel-steps .current').textContent.includes('napajanja'),'plan advances from the saved checkpoint');
 ui.click('#back-map');ui.click('#to-home');ui.click('#home-settings');ui.select('#controls-setting','keyboard');ui.click('#save-settings');
 check(ui.w.document.body.classList.contains('keyboard-controls'),'manual keyboard mode overrides coarse pointer');
 check(ui.w.localStorage.getItem(controls.CONTROL_KEY)==='keyboard','input preference persists separately from progress');
 check(!Object.hasOwn(ui.h.getSave().settings,'controls'),'progress backup schema remains unchanged');
 ui.click('#home-settings');ui.select('#controls-setting','auto');ui.click('#save-settings');
 check(ui.w.document.body.classList.contains('touch-controls'),'automatic mode follows coarse pointer again');
 const fine=ui.media.get('fine');fine.matches=true;fine.listener();
 check(ui.w.document.body.classList.contains('keyboard-controls'),'connecting a fine pointer updates hybrid layout');
 fine.matches=false;fine.listener();check(ui.w.document.body.classList.contains('touch-controls'),'disconnecting fine pointer returns touch layout');
 await ui.close();
 const reload=await setup('standard',null,{coarse:true,preference:'keyboard'});
 check(reload.w.document.body.classList.contains('keyboard-controls'),'saved manual choice applies after reload');await reload.close();
}

// Topic mode: use real UI decisions, isolated campaign data, interruption and reload.
for(const tier of curriculum.TIERS){
 const initial=storage.emptySave();initial.settings.content='standard';initial.settings.difficulty='hard';
 initial.profiles.standard.active=core.newRun(2,'easy','standard');initial.profiles.standard.active.networkRules={web:true};
 const completed=core.newRun(1,'relaxed',tier);for(const c of Object.values(completed.checks))c.done=true;completed.completed=true;storage.checkpoint(initial,completed,'topics');
 const campaignJSON=save=>JSON.stringify(Object.fromEntries(curriculum.TIERS.map(t=>{const {topics,...campaign}=save.profiles[t];return[t,campaign];})));
 const campaignBefore=campaignJSON(initial),settingsBefore=JSON.stringify(initial.settings);
 let ui=await setup('standard',JSON.stringify(initial));
 check(ui.w.document.querySelector('[data-level="14"]').disabled,`${tier}: signature campaign locked before topic practice`);
 ui.click('#topics-open');ui.select('#topic-tier',tier);
 check(ui.w.document.querySelectorAll('[data-topic-start]').length===14,`${tier}: all topics available without campaign unlocks`);
 const search=ui.w.document.querySelector('#topic-search');search.value='SHA-256';search.dispatchEvent(new ui.w.Event('input',{bubbles:true}));
 check(!ui.w.document.querySelector('[data-topic="13"]').hidden,`${tier}: search finds taught concept`);
 search.value='xyznonexistent';search.dispatchEvent(new ui.w.Event('input',{bubbles:true}));check(!ui.w.document.querySelector('#topic-empty').hidden,`${tier}: empty search explained`);
 search.value='potpis';search.dispatchEvent(new ui.w.Event('input',{bubbles:true}));
 ui.click('[data-topic-start="14"]');ui.click('#topic-back');check(ui.w.document.querySelector('#topic-search').value==='potpis',`${tier}: back retains search`);
 ui.click('[data-topic-start="14"]');check(ui.w.document.querySelector('#topic-pace').value==='relaxed',`${tier}: new topic starts with calm option`);
 check(ui.w.document.querySelector('.topic-preparation').textContent.includes(study.topicPreparation(14,tier)[0].text),`${tier}: related concept explained before free-choice task`);
 ui.select('#topic-pace','easy');ui.click('#topic-begin');
 check(ui.h.getMode()==='topics'&&ui.h.getRun().content===tier,`${tier}: chosen topic tier independent from campaign selection`);
 check(!ui.w.document.querySelector('#dialog-title').textContent.startsWith('Nastavljamo'),`${tier}: fresh attempt not labelled resumed`);
 check(ui.w.document.querySelector('.lesson-grid').textContent.includes('javni'),`${tier}: lesson precedes free-choice signature task`);
 ui.click('#begin');check(ui.w.document.querySelector('#level-number').textContent.startsWith('TEMA'),`${tier}: play visibly labels topic mode`);
 ui.station('sign-keys');ui.click('[data-choice="private"]');ui.click('[data-choice="public"]');ui.station('sign-lab');ui.select('#signature-key','enclosed');ui.select('#signature-approved','hold');
 ui.click('#dialog-close');ui.click('#pause');ui.click('#to-home');
 check(ui.w.document.querySelector('#topic-tier').value===tier,`${tier}: pause returns to matching topic list`);
 ui.click('[data-topic-start="13"]');ui.click('#topic-begin');ui.click('#begin');ui.station('hash-source');ui.click('[data-choice="known"]');ui.station('hash-lab');ui.select('#hash-original','same');
 ui.w.dispatchEvent(new ui.w.Event('pagehide'));
 const saved=ui.w.localStorage.getItem(storage.SAVE_KEY);
 check(Object.keys(storage.readTopics(ui.h.getSave(),tier).drafts).length===2,`${tier}: two interrupted topics stored`);
 check(campaignJSON(ui.h.getSave())===campaignBefore&&JSON.stringify(ui.h.getSave().settings)===settingsBefore,`${tier}: topic decisions do not alter campaign or its preferences`);
 await ui.close();ui=await setup('standard',saved);
 ui.click('#topics-open');ui.select('#topic-tier',tier);ui.click('[data-topic-start="14"]');
 check(ui.w.document.querySelector('#topic-pace').value==='easy',`${tier}: topic pace restored after reload`);
 ui.click('#topic-begin');check(ui.w.document.querySelector('#dialog-title').textContent.startsWith('Nastavljamo'),`${tier}: existing attempt is labelled resumed`);ui.click('#begin');
 check(ui.h.getRun().checks['sign-keys'].errors===1,`${tier}: correction count restored`);
 ui.station('sign-lab');check(ui.w.document.querySelector('#signature-key').value==='enclosed'&&ui.w.document.querySelector('#signature-approved').value==='hold',`${tier}: topic console drafts restored`);
 ui.select('#signature-key','school');ui.select('#signature-approved','accept');ui.select('#signature-edited','hold');if(tier!=='junior')ui.select('#signature-unknown','hold');ui.click('#check-signatures');
 ui.station('sign-share');ui.click('[data-choice="protect"]');ui.station('sign-test');ui.click('[data-choice="test"]');
 if(tier==='expert'){for(const q of curriculum.EXPERT_REVIEWS[14].questions)ui.click(`input[name="review-${q.id}"][value="${q.answer}"]`);ui.click('#submit-review');}
 ui.click('#verification-done');ui.station('exit');
 check(ui.w.document.querySelector('#next').textContent.includes('Odaberi drugu temu'),`${tier}: topic completion offers topic choice`);
 check(storage.readTopics(ui.h.getSave(),tier).drafts[14]===undefined&&!!storage.readTopics(ui.h.getSave(),tier).drafts[13],`${tier}: completion removes only current draft`);
 check(storage.readTopics(ui.h.getSave(),tier).best[14].completed,`${tier}: result belongs to topic book`);
 ui.click('#results-practice');check(ui.w.document.querySelector('.dialog-heading').textContent.includes('Vježbe po temama'),`${tier}: matching transfer case stays in topic mode`);
 ui.click('#practice-lesson');ui.click('#practice-back');
 const scenario=practice.practiceCase(14,tier);for(const q of scenario.questions)ui.click(`input[name="practice-${q.id}"][value="${q.answer}"]`);ui.click('#practice-submit');
 check(storage.readTopics(ui.h.getSave(),tier).practice[14].solved,`${tier}: transfer result stored in topic book`);
 ui.click('#practice-continue');
 check(ui.w.document.querySelector('#dialog-title').textContent===practice.practiceCase(1,tier).title&&ui.w.document.querySelector('.dialog-heading').textContent.includes('Vježbe po temama'),`${tier}: next transfer case retains mode and tier`);
 check(campaignJSON(ui.h.getSave())===campaignBefore,`${tier}: full topic loop leaves campaign unchanged`);
 ui.click('#practice-overview');ui.click('#practice-home');ui.click('#topic-work');
 check(ui.w.document.querySelector('#progress-mode').value==='topics'&&ui.w.document.querySelector('#progress-tier').value===tier,`${tier}: topic work opens correct scope`);
 check(ui.w.document.querySelector('[data-resume-topic="13"]'),`${tier}: work overview links pending topic`);
 ui.click('#export-progress');const exported=JSON.parse(await ui.downloads.at(-1).blob.text());
 check(exported.save.profiles[tier].topics.drafts[13].hashAnswers.original==='same',`${tier}: download includes separate topic draft`);
 ui.click('#export-report');check((await ui.downloads.at(-1).blob.text()).includes('VJEŽBE PO TEMAMA'),`${tier}: report identifies topic section`);
 ui.select('#progress-mode','campaign');check(ui.w.document.querySelector('.pause-summary').textContent.includes('0/14'),`${tier}: campaign view is separate`);
 ui.select('#progress-mode','topics');ui.click('[data-resume-topic="13"]');ui.click('#topic-begin');ui.click('#begin');ui.station('hash-lab');
 check(ui.w.document.querySelector('#hash-original').value==='same',`${tier}: resume from work overview retains saved choice`);
 ui.click('#dialog-close');ui.click('#pause');ui.click('#to-home');ui.click('#topic-close');
 check(ui.w.document.querySelector('#total-xp').textContent==='0'&&ui.w.document.querySelector('[data-level="14"]').disabled,`${tier}: home campaign remains unchanged`);
 ui.click('#play-primary');ui.click('#begin');check(ui.h.getMode()==='campaign'&&ui.h.getRun().level===2,`${tier}: original campaign draft still resumes`);
 await ui.close();
}
{
 const initial=storage.emptySave();const draft=core.newRun(14,'relaxed','expert');core.act(draft,'sign-keys','public');draft.signatureKey='school';storage.checkpoint(initial,draft,'topics');
 const ui=await setup('standard',JSON.stringify(initial));ui.click('#progress-open');ui.select('#progress-mode','topics');ui.select('#progress-tier','expert');
 const before=JSON.stringify(ui.h.getSave()),backup=progress.createProgressBackup(ui.h.getSave());
 await ui.chooseFile(new ui.w.File([backup],'topics.json'));ui.click('#confirm-import');
 check(storage.readTopics(ui.h.getSave(),'expert').drafts[14].signatureKey==='school','topic backup restores console drafts');
 check(ui.w.document.querySelector('#progress-mode').value==='topics','import keeps selected overview scope');
 const old=await readFile('tests/fixtures/progress-v0.9.0.json','utf8');await ui.chooseFile(new ui.w.File([old],'old-v090.json'));
 check(ui.w.document.querySelector('.dialog-lead').textContent.includes('Starija kopija'),'restoring older backup explains removal of topic records');
 check(ui.w.document.querySelectorAll('.restore-comparison tbody tr').length===6,'restore preview compares both modes across all tiers');
 ui.click('#cancel-import');check(JSON.stringify(ui.h.getSave())===before,'cancel old restore preserves topic work');
 await ui.chooseFile(new ui.w.File([old],'old-v090.json'));ui.click('#confirm-import');
 check(ui.h.getSave().profiles.expert.topics===undefined,'confirmed old restore consistently replaces topic records');
 ui.click('#restore-previous');ui.click('#confirm-import');
 check(storage.readTopics(ui.h.getSave(),'expert').drafts[14].signatureKey==='school','restore point recovers replaced topic work');
 ui.click('#progress-close');ui.click('#topic-close');ui.click('#home-settings');ui.click('#reset-progress');ui.click('#confirm-reset');
 check(ui.h.getSave().profiles.expert.topics===undefined,'confirmed reset clears topic workspace too');
 await ui.close();
}
console.log(`${assertions} local DOM assertions passed. Rendering, physical input and visual layout were not tested.`);
