import { CHECKS, FILES, newRun, type Difficulty, type Run, score, arcadeScore } from './core.ts';
export type Best = { learning: number; arcade: number; independent: number; completed: boolean };
export type Save = { schema: 1; settings: { difficulty: Difficulty; sound: boolean; reducedMotion: boolean }; best: Record<string, Best>; active: Run | null };
export const SAVE_KEY = 'sisgame.save.v1';
export function emptySave(): Save { return { schema: 1, settings: { difficulty: 'easy', sound: false, reducedMotion: false }, best: {}, active: null }; }
const clamp=(v:unknown,min:number,max:number)=> typeof v==='number'&&Number.isFinite(v)?Math.max(min,Math.min(max,v)):min;
const difficulties: Difficulty[] = ['easy','medium','hard'];
const knownFlags = new Set(['card','paper','secret','failure',...Object.values(CHECKS).flat()]);
export function parseSave(raw:string|null): Save {
  const out=emptySave();if(!raw)return out;
  try {
    const input=JSON.parse(raw);if(input?.schema!==1)return out;
    if(difficulties.includes(input.settings?.difficulty))out.settings.difficulty=input.settings.difficulty;
    out.settings.sound=input.settings?.sound===true;out.settings.reducedMotion=input.settings?.reducedMotion===true;
    for(const n of Object.keys(CHECKS)){const b=input.best?.[n];if(b && typeof b==='object')out.best[n]={learning:clamp(b.learning,0,100),arcade:clamp(b.arcade,0,60),independent:clamp(b.independent,0,4),completed:b.completed===true};}
    const a=input.active;
    if(a && Number.isInteger(a.level) && Object.hasOwn(CHECKS,a.level) && difficulties.includes(a.difficulty) && a.completed!==true){
      const r=newRun(a.level,a.difficulty);r.x=clamp(a.x,48,976);r.y=clamp(a.y,48,656);
      r.health=clamp(a.health,1,3);r.hits=clamp(a.hits,0,100000);r.seconds=clamp(a.seconds,0,10000000);
      const validIds=new Set(FILES.map(f=>f.id));
      r.flags=Array.isArray(a.flags)?[...new Set<string>(a.flags.filter((f:unknown)=>typeof f==='string'&&knownFlags.has(f)))]:[];
      r.files=Array.isArray(a.files)?[...new Set<string>(a.files.filter((f:unknown)=>typeof f==='string'&&validIds.has(f)))]:[];
      r.backup=Array.isArray(a.backup)?[...new Set<string>(a.backup.filter((f:unknown)=>typeof f==='string'&&validIds.has(f)))]:[];
      r.bits=Array.isArray(a.bits)?[...new Set<string>(a.bits.filter((f:unknown)=>typeof f==='string'&&/^bit-(?:[0-9]|1[01])$/.test(f)))]:[];
      for(const key of CHECKS[r.level]) {const c=a.checks?.[key]; r.checks[key]={done:c?.done===true,errors:clamp(c?.errors,0,100000)};}
      out.active=r;
    }
  }catch { /* A damaged or older save must not stop the game. */ }
  return out;
}
export function recordBest(save:Save,run:Run) {
  const prior=save.best[run.level];
  save.best[run.level]={learning:Math.max(prior?.learning||0,score(run)),arcade:Math.max(prior?.arcade||0,arcadeScore(run)),independent:Math.max(prior?.independent||0,Object.values(run.checks).filter(c=>c.done&&c.errors===0).length),completed:!!prior?.completed||run.completed};
}
export function totalXP(save:Save){return Object.values(save.best).reduce((sum,b)=>sum+b.learning+b.arcade,0);}
