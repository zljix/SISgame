import { CHECKS, FILES, newRun, type Difficulty, type Run, score, arcadeScore } from './core.ts';
import { EXPERT_REVIEWS, TIERS, type ContentTier } from './curriculum.ts';
import { alertsFor, verdictsFor, WIFI_GUESTS, WIFI_SECURITY } from './network.ts';
import { cleanMeasures, cleanResponse, prioritiesFor, risksFor } from './operations.ts';
import { parsePractice, type PracticeBook } from './practice.ts';
import { cleanHashAnswers, cleanSignatureAnswers, cleanSignatureKey } from './integrity.ts';
import { eventsFor, samplesFor } from './missions.ts';
import type { Permissions } from './core.ts';
export type Best = { learning: number; arcade: number; independent: number; completed: boolean };
export type PlayMode='campaign'|'topics';
export type ResultBook={best:Record<string,Best>;practice:PracticeBook};
export type TopicProgress=ResultBook&{drafts:Record<string,Run>};
export type Profile = ResultBook & { active: Run | null; drafts?:Record<string,Run>; topics?:TopicProgress };
export type Save = { schema: 2; settings: { content: ContentTier; difficulty: Difficulty; timed: boolean; sound: boolean; reducedMotion: boolean }; profiles: Record<ContentTier,Profile> };
// Keep the storage key so v0.1/v0.2 saves are migrated on the first load.
export const SAVE_KEY = 'sisgame.save.v1';
export function emptySave(): Save { return { schema: 2, settings: { content:'standard', difficulty:'easy', timed:false, sound:false, reducedMotion:false }, profiles:{junior:{best:{},active:null,practice:{}},standard:{best:{},active:null,practice:{}},expert:{best:{},active:null,practice:{}}}}; }
export function profile(save:Save,tier:ContentTier=save.settings.content):Profile{return save.profiles[tier];}
const emptyTopics=():TopicProgress=>({best:{},drafts:{},practice:{}});
export function readTopics(save:Save,tier:ContentTier=save.settings.content):TopicProgress{return profile(save,tier).topics||emptyTopics();}
export function resultBook(save:Save,mode:PlayMode,tier:ContentTier):ResultBook{
  return mode==='topics'?(profile(save,tier).topics??=emptyTopics()):profile(save,tier);
}
export function savedRun(save:Save,level:number,mode:PlayMode,tier:ContentTier):Run|null{
  const p=profile(save,tier);
  const current=mode==='topics'?readTopics(save,tier).drafts[level]:p.active?.level===level?p.active:p.drafts?.[level];
  return current?.level===level?current:null;
}
const clamp=(v:unknown,min:number,max:number)=> typeof v==='number'&&Number.isFinite(v)?Math.max(min,Math.min(max,v)):min;
const difficulties: Difficulty[] = ['relaxed','easy','medium','hard'];
const knownFlags = new Set(['card','paper','secret','failure','expert-review',...Object.values(CHECKS).flat()]);
function parseRun(a:any,tier:ContentTier):Run|null {
  if(!a||!Number.isInteger(a.level)||!Object.hasOwn(CHECKS,a.level)||!difficulties.includes(a.difficulty)||a.completed===true)return null;
  const r=newRun(a.level,a.difficulty,tier,a.review?.enabled===true);
  r.x=clamp(a.x,48,976);r.y=clamp(a.y,48,656);
  r.health=Math.floor(clamp(a.health,1,3));r.hits=clamp(a.hits,0,100000);r.seconds=clamp(a.seconds,0,10000000);
  const ids=new Set(FILES.map(f=>f.id));
  const strings=(value:unknown,valid:(s:string)=>boolean):string[]=>Array.isArray(value)?[...new Set(value.filter((s:unknown):s is string=>typeof s==='string'&&valid(s)))]:[];
  r.flags=strings(a.flags,s=>knownFlags.has(s));r.files=strings(a.files,s=>ids.has(s));r.backup=strings(a.backup,s=>ids.has(s));
  r.bits=strings(a.bits,s=>/^bit-(?:[0-9]|1[01])$/.test(s));
  for(const key of CHECKS[r.level]){const c=a.checks?.[key];r.checks[key]={done:c?.done===true,errors:clamp(c?.errors,0,100000)};}
  if(tier==='expert'&&a.review){r.review.started=a.review.started===true;r.review.remaining=clamp(a.review.remaining,0,90);r.review.expired=a.review.expired===true||r.review.remaining===0;}
  if(tier==='expert')for(const question of EXPERT_REVIEWS[r.level].questions){const value=a.review?.answers?.[question.id];if(question.choices.some(([choice])=>choice===value))r.review.answers[question.id]=value;}
  for(const key of ['web','admin','outside'])if(typeof a.networkRules?.[key]==='boolean')r.networkRules[key]=a.networkRules[key];
  // Optional fields preserve the exact shape of older portable copies.
  if(r.level===2&&a.permissions!==undefined){
    r.permissions={};
    for(const kind of ['schedule','grades'] as const){
      if(!a.permissions?.[kind])continue;
      const saved=a.permissions[kind],permissions:Permissions={student:'none',teacher:'none',guest:'none'};
      for(const role of ['student','teacher','guest'] as const)if(['none','read','write'].includes(saved[role]))permissions[role]=saved[role];
      if(tier==='junior')permissions.guest=kind==='schedule'?'read':'none';
      r.permissions[kind]=permissions;
    }
  }
  if(r.level===4&&a.sampleAnswers!==undefined){
    r.sampleAnswers={};
    const kinds=tier==='junior'?['worm','trojan']:['virus','worm','trojan'];
    for(const sample of samplesFor(tier))if(kinds.includes(a.sampleAnswers?.[sample.id]))r.sampleAnswers[sample.id]=a.sampleAnswers[sample.id];
  }
  if(r.level===5&&a.sessionChoice!==undefined){
    const responses=tier==='junior'?['password','revoke']:['password','erase','revoke'];
    r.sessionChoice={event:eventsFor(tier).some(e=>e.id===a.sessionChoice?.event)?a.sessionChoice.event:'',response:responses.includes(a.sessionChoice?.response)?a.sessionChoice.response:''};
  }
  if(r.level===6&&a.serviceSettings!==undefined){
    r.serviceSettings={updates:true,remote:true,coursework:true};
    for(const key of ['updates','remote','coursework'] as const)if(typeof a.serviceSettings?.[key]==='boolean')r.serviceSettings[key]=a.serviceSettings[key];
    if(tier==='junior')r.serviceSettings.updates=true;
  }
  if(r.level===9)for(const report of alertsFor(tier)){const value=a.alertAnswers?.[report.id];if(verdictsFor(tier).some(([id])=>id===value))r.alertAnswers[report.id]=value;}
  if(r.level===10){
    if(tier!=='junior'&&WIFI_SECURITY.some(([id])=>id===a.wifiSettings?.security))r.wifiSettings.security=a.wifiSettings.security;
    if(WIFI_GUESTS.some(([id])=>id===a.wifiSettings?.guests))r.wifiSettings.guests=a.wifiSettings.guests;
  }
  if(r.level===11){
    for(const risk of risksFor(tier)){const value=a.riskAnswers?.[risk.id];if(prioritiesFor(tier).some(([id])=>id===value))r.riskAnswers[risk.id]=value;}
    r.riskMeasures=cleanMeasures(a.riskMeasures,tier);
  }
  if(r.level===12)r.responseOrder=cleanResponse(a.responseOrder,tier);
  if(r.level===13)r.hashAnswers=cleanHashAnswers(a.hashAnswers,tier);
  if(r.level===14){r.signatureKey=cleanSignatureKey(a.signatureKey);r.signatureAnswers=cleanSignatureAnswers(a.signatureAnswers,tier);}
  return r;
}
function parseBest(input:any):Record<string,Best>{
  const best:Record<string,Best>={};
  for(const n of Object.keys(CHECKS)){const b=input?.[n];if(b&&typeof b==='object')best[n]={learning:clamp(b.learning,0,100),arcade:clamp(b.arcade,0,60),independent:clamp(b.independent,0,4),completed:b.completed===true};}
  return best;
}
export function parseSave(raw:string|null): Save {
  const out=emptySave();if(!raw)return out;
  try {
    const input=JSON.parse(raw);if(input?.schema!==1&&input?.schema!==2)return out;
    if(difficulties.includes(input.settings?.difficulty))out.settings.difficulty=input.settings.difficulty;
    if(input.schema===2&&TIERS.includes(input.settings?.content))out.settings.content=input.settings.content;
    out.settings.timed=input.schema===2&&input.settings?.timed===true;
    out.settings.sound=input.settings?.sound===true;out.settings.reducedMotion=input.settings?.reducedMotion===true;
    for(const tier of TIERS){
      const source=input.schema===1?(tier==='standard'?input:null):input.profiles?.[tier];if(!source)continue;
      const target=profile(out,tier);
      target.best=parseBest(source.best);
      target.active=parseRun(source.active,tier);
      if(input.schema===2&&source.drafts!==undefined){
        target.drafts={};
        for(const n of Object.keys(CHECKS)){
          const draft=parseRun(source.drafts?.[n],tier);
          if(draft?.level===Number(n)&&draft.level!==target.active?.level)target.drafts[n]=draft;
        }
      }
      target.practice=parsePractice(source.practice,tier,target.best);
      // Optional extension: old exported schema-2 saves retain their exact shape.
      // Topic drafts are bounded by the known mission IDs and cannot replace campaign work.
      if(input.schema===2&&source.topics!==undefined){
        const topics=emptyTopics(),raw=source.topics;
        topics.best=parseBest(raw?.best);
        for(const n of Object.keys(CHECKS)){
          const draft=parseRun(raw?.drafts?.[n],tier);
          if(draft?.level===Number(n))topics.drafts[n]=draft;
        }
        topics.practice=parsePractice(raw?.practice,tier,topics.best);
        target.topics=topics;
      }
    }
  }catch{/* A damaged save must not stop the game. */}
  return out;
}
export function recordBest(save:Save,run:Run,mode:PlayMode='campaign'){
  const target=resultBook(save,mode,run.content),prior=target.best[run.level];
  target.best[run.level]={learning:Math.max(prior?.learning||0,score(run)),arcade:Math.max(prior?.arcade||0,arcadeScore(run)),independent:Math.max(prior?.independent||0,Object.values(run.checks).filter(c=>c.done&&c.errors===0).length),completed:!!prior?.completed||run.completed};
}
export function checkpoint(save:Save,run:Run,mode:PlayMode){
  recordBest(save,run,mode);
  if(mode==='topics'){
    const topics=profile(save,run.content).topics!;
    if(run.completed)delete topics.drafts[run.level];else topics.drafts[run.level]=run;
  }else{
    const p=profile(save,run.content);
    if(p.active&&!p.active.completed&&p.active.level!==run.level)(p.drafts??={})[p.active.level]=p.active;
    if(p.drafts)delete p.drafts[run.level];
    p.active=run.completed?null:run;
  }
}
export function totalXP(save:Save,tier:ContentTier=save.settings.content){return Object.values(profile(save,tier).best).reduce((sum,b)=>sum+b.learning+b.arcade,0);}
export function totalLearning(save:Save,tier:ContentTier=save.settings.content){return Object.values(profile(save,tier).best).reduce((sum,b)=>sum+b.learning,0);}
