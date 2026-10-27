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

// Local DOM unit harness. No network, user browser, rendering or real game canvas.
const source=stripTypeScriptTypes(await readFile('src/main.ts','utf8'))
 .replace(/^import .*;\s*$/gm,'').replaceAll('import.meta.env.PROD','false');
let assertions=0;
function check(value,message){assert.ok(value,message);assertions++;}
async function setup(tier, saved=null){
 const w=new Window({url:'https://sisgame.invalid/',settings:{enableJavaScriptEvaluation:false,enableCSSFileLoading:false,enableImageFileLoading:false,enableIframePageLoading:false,disableJavaScriptFileLoading:true,navigation:{disableMainFrameNavigation:true,disableChildFrameNavigation:true,disableChildPageNavigation:true}}});
 w.document.body.innerHTML='<div id="app"></div>';
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
 class Sector {startRun(){} resetInput(){} sync(){} guide(){} use(){} shield(){}}
 const context={window:w,document:w.document,navigator:w.navigator,localStorage:testStore,location:w.location,console,Blob,URL:LocalURL,
  requestAnimationFrame:()=>0,cancelAnimationFrame:()=>{},clearInterval:()=>{},performance,
  ResizeObserver:class{observe(){}disconnect(){}},
  Phaser:{AUTO:0,Scale:{RESIZE:0},Game:class{scale={getParentBounds(){},refresh(){}}}},Sector,
  ...core,...data,...curriculum,...missions,...network,...operations,...storage,...practice,...progress,...integrity};
 runInNewContext(source+'\nwindow.__checks={start,openStation,getRun:()=>run,getSave:()=>save};',context);
 const h=w.__checks;
 const click=id=>{const e=w.document.querySelector(id);assert.ok(e,id);e.click();};
 const select=(id,value)=>{const e=w.document.querySelector(id);assert.ok(e,id);e.value=value;e.dispatchEvent(new w.Event('change',{bubbles:true}));};
 const tick=(id,value=true)=>{const e=w.document.querySelector(id);assert.ok(e,id);e.checked=value;e.dispatchEvent(new w.Event('change',{bubbles:true}));};
 const station=id=>h.openStation(data.LEVELS[h.getRun().level-1].stations.find(s=>s.id===id));
 const chooseFile=async(file)=>{const input=w.document.querySelector('#import-progress'),transfer=new w.DataTransfer();transfer.items.add(file);input.files=transfer.files;await input.onchange(new w.Event('change'));};
 return{w,h,click,select,tick,station,chooseFile,downloads,storageControl,close:()=>w.happyDOM.close()};
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
 check(ui.w.document.querySelectorAll('.restore-comparison tbody tr').length===3,'preview compares all tiers');
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
console.log(`${assertions} local DOM assertions passed. Rendering, physical input and visual layout were not tested.`);
