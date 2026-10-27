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
 class Sector {startRun(){} resetInput(){} sync(){} guide(){} use(){} shield(){}}
 const context={window:w,document:w.document,navigator:w.navigator,localStorage:w.localStorage,location:w.location,console,
  requestAnimationFrame:()=>0,cancelAnimationFrame:()=>{},clearInterval:()=>{},performance,
  ResizeObserver:class{observe(){}disconnect(){}},
  Phaser:{AUTO:0,Scale:{RESIZE:0},Game:class{scale={getParentBounds(){},refresh(){}}}},Sector,
  ...core,...data,...curriculum,...missions,...network,...operations,...storage,...practice};
 runInNewContext(source+'\nwindow.__checks={start,openStation,getRun:()=>run,getSave:()=>save};',context);
 const h=w.__checks;
 const click=id=>{const e=w.document.querySelector(id);assert.ok(e,id);e.click();};
 const select=(id,value)=>{const e=w.document.querySelector(id);assert.ok(e,id);e.value=value;e.dispatchEvent(new w.Event('change',{bubbles:true}));};
 const tick=(id,value=true)=>{const e=w.document.querySelector(id);assert.ok(e,id);e.checked=value;e.dispatchEvent(new w.Event('change',{bubbles:true}));};
 const station=id=>h.openStation(data.LEVELS[h.getRun().level-1].stations.find(s=>s.id===id));
 return{w,h,click,select,tick,station,close:()=>w.happyDOM.close()};
}
for(const tier of curriculum.TIERS){
 const {w,h,click,select,tick,station,close}=await setup(tier);
 check(w.document.querySelectorAll('.mission-card').length===12,`${tier}: twelve cards`);
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
 check(ui.w.document.querySelectorAll('[data-practice]').length===12,`${tier}: twelve transfer cases`);
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
 check(ui.w.document.querySelector('.pause-summary').textContent.includes('12/12'),`${tier}: full practice summary`);
 check(ui.w.document.querySelector('.note').textContent.includes('Vrijedi ponoviti'),`${tier}: correction recommendation`);
 ui.click('#practice-home');
 check(ui.w.document.querySelector('#total-xp').textContent==='1200',`${tier}: no campaign score inflation`);
 check(storage.profile(ui.h.getSave()).active.level===6,`${tier}: campaign draft survives practice`);
 ui.select('#content-level',tier==='junior'?'standard':'junior');ui.click('#practice-open');
 check([...ui.w.document.querySelectorAll('[data-practice]')].every(b=>b.disabled),`${tier}: other profile stays locked`);
 await ui.close();
}
console.log(`${assertions} local DOM assertions passed. Rendering, physical input and visual layout were not tested.`);
