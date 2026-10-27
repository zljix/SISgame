import { CHECKS, FILES, newRun, type Difficulty, type Run, score, arcadeScore } from './core.ts';
import { EXPERT_REVIEWS, TIERS, type ContentTier } from './curriculum.ts';
import { alertsFor, verdictsFor, WIFI_GUESTS, WIFI_SECURITY } from './network.ts';
export type Best = { learning: number; arcade: number; independent: number; completed: boolean };
export type Profile = { best: Record<string, Best>; active: Run | null };
export type Save = { schema: 2; settings: { content: ContentTier; difficulty: Difficulty; timed: boolean; sound: boolean; reducedMotion: boolean }; profiles: Record<ContentTier,Profile> };
// Keep the storage key so v0.1/v0.2 saves are migrated on the first load.
export const SAVE_KEY = 'sisgame.save.v1';
export function emptySave(): Save { return { schema: 2, settings: { content:'standard', difficulty:'easy', timed:false, sound:false, reducedMotion:false }, profiles:{junior:{best:{},active:null},standard:{best:{},active:null},expert:{best:{},active:null}}}; }
export function profile(save:Save,tier:ContentTier=save.settings.content):Profile{return save.profiles[tier];}
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
  if(r.level===9)for(const report of alertsFor(tier)){const value=a.alertAnswers?.[report.id];if(verdictsFor(tier).some(([id])=>id===value))r.alertAnswers[report.id]=value;}
  if(r.level===10){
    if(tier!=='junior'&&WIFI_SECURITY.some(([id])=>id===a.wifiSettings?.security))r.wifiSettings.security=a.wifiSettings.security;
    if(WIFI_GUESTS.some(([id])=>id===a.wifiSettings?.guests))r.wifiSettings.guests=a.wifiSettings.guests;
  }
  return r;
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
      for(const n of Object.keys(CHECKS)){const b=source.best?.[n];if(b&&typeof b==='object')target.best[n]={learning:clamp(b.learning,0,100),arcade:clamp(b.arcade,0,60),independent:clamp(b.independent,0,4),completed:b.completed===true};}
      target.active=parseRun(source.active,tier);
    }
  }catch{/* A damaged save must not stop the game. */}
  return out;
}
export function recordBest(save:Save,run:Run){
  const target=profile(save,run.content),prior=target.best[run.level];
  target.best[run.level]={learning:Math.max(prior?.learning||0,score(run)),arcade:Math.max(prior?.arcade||0,arcadeScore(run)),independent:Math.max(prior?.independent||0,Object.values(run.checks).filter(c=>c.done&&c.errors===0).length),completed:!!prior?.completed||run.completed};
}
export function totalXP(save:Save,tier:ContentTier=save.settings.content){return Object.values(profile(save,tier).best).reduce((sum,b)=>sum+b.learning+b.arcade,0);}
export function totalLearning(save:Save,tier:ContentTier=save.settings.content){return Object.values(profile(save,tier).best).reduce((sum,b)=>sum+b.learning,0);}
