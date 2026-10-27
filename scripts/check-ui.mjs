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
  ...core,...data,...curriculum,...missions,...network,...operations,...storage};
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
 rc('#verification-done');rs('exit');rc('#next');
 check(!rw.document.querySelector('#home').hidden,`${tier}: campaign returns to map`);
 check(storage.profile(rh.getSave()).best[12].completed,`${tier}: final mission saved`);
 check(rw.document.querySelector('#total-xp').textContent==='1200',`${tier}: points total`);
 await resumed.close();
}
console.log(`${assertions} local DOM assertions passed. Rendering, physical input and visual layout were not tested.`);
