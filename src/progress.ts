import { VERSION, score } from './core.ts';
import { TIERS, TIER_INFO, type ContentTier } from './curriculum.ts';
import { LEVELS, levelContent, missionNumber } from './data.ts';
import { PRACTICE_CASES, practiceSummary } from './practice.ts';
import { MODE_NAMES } from './study.ts';
import { parseSave, profile, readTopics, SAVE_KEY, type PlayMode, type Save } from './storage.ts';

export const MAX_BACKUP_BYTES=1024*1024;
export const RESTORE_POINT_KEY='sisgame.restore-point.v1';
export type ProgressBackup={format:'sisgame-progress';formatVersion:1;gameVersion:string;createdAt:string;save:Save};
type Store=Pick<Storage,'getItem'|'setItem'|'removeItem'>;
export type RestoreResult={ok:true;save:Save}|{ok:false;message:string};

// Compare structure independently of property order. External data must survive
// the existing save parser exactly, rather than silently dropping unsupported work.
function canonical(value:unknown):string {
  if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';
  if(value&&typeof value==='object')return '{'+Object.keys(value).sort().map(key=>JSON.stringify(key)+':'+canonical((value as Record<string,unknown>)[key])).join(',')+'}';
  return JSON.stringify(value);
}
function boundedTree(root:unknown){
  const pending:[unknown,number][]=[[root,0]];let nodes=0;
  while(pending.length){
    const [value,depth]=pending.pop()!;
    if(++nodes>20000||depth>16)throw new Error('Struktura kopije je prevelika ili nepodržana.');
    if(typeof value==='number'&&!Number.isFinite(value))throw new Error('Kopija sadrži nevaljan broj.');
    if(value&&typeof value==='object')for(const child of Object.values(value))pending.push([child,depth+1]);
  }
}
export function createProgressBackup(save:Save,now=new Date()):string {
  const backup:ProgressBackup={format:'sisgame-progress',formatVersion:1,gameVersion:VERSION,createdAt:now.toISOString(),save:parseSave(JSON.stringify(save))};
  return JSON.stringify(backup,null,2)+'\n';
}
export function readProgressBackup(text:string):ProgressBackup {
  if(new TextEncoder().encode(text).byteLength>MAX_BACKUP_BYTES)throw new Error('Kopija je veća od 1 MB. Odaberi JSON kopiju preuzetu iz SISgamea.');
  let input:unknown;
  try{input=JSON.parse(text.replace(/^\uFEFF/,''));}catch{throw new Error('Datoteka nije čitljiv JSON. Odaberi sigurnosnu kopiju napretka.');}
  boundedTree(input);
  if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('Ovo nije SISgame kopija napretka.');
  const data=input as Record<string,unknown>;
  if(data.format!=='sisgame-progress')throw new Error('Ovo nije SISgame kopija napretka. Sažetak rada nije datoteka za obnovu.');
  if(data.formatVersion!==1)throw new Error('Format kopije nije podržan. Provjeri imaš li odgovarajuću inačicu igre.');
  if(Object.keys(data).sort().join(',')!=='createdAt,format,formatVersion,gameVersion,save')throw new Error('Kopija sadrži nepodržana polja. Provjeri inačicu igre.');
  if(typeof data.gameVersion!=='string'||!/^\d{1,4}\.\d{1,4}\.\d{1,4}$/.test(data.gameVersion))throw new Error('Oznaka inačice u kopiji nije valjana.');
  if(typeof data.createdAt!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(data.createdAt)||!Number.isFinite(Date.parse(data.createdAt))||new Date(data.createdAt).toISOString()!==data.createdAt)throw new Error('Datum kopije nije valjan.');
  if(!data.save||typeof data.save!=='object'||(data.save as Record<string,unknown>).schema!==2)throw new Error('Zapis napretka u kopiji nije podržan.');
  const save=parseSave(JSON.stringify(data.save));
  if(canonical(save)!==canonical(data.save))throw new Error('Kopija sadrži oštećene ili nepodržane podatke. Napredak nije promijenjen.');
  return {format:'sisgame-progress',formatVersion:1,gameVersion:data.gameVersion,createdAt:data.createdAt,save};
}
export function restoreProgress(store:Store,current:Save,backup:ProgressBackup,expectedRaw:string|null,now=new Date()):RestoreResult {
  let oldPoint:string|null=null,checkpointWritten=false;
  try{
    // Revalidate at the mutation boundary; a preview is not permission to accept
    // a subsequently modified object or overwrite a newer local snapshot.
    const next=readProgressBackup(JSON.stringify(backup)).save;
    if(store.getItem(SAVE_KEY)!==expectedRaw)return {ok:false,message:'Spremljeni napredak promijenio se nakon otvaranja pregleda. Osvježi igru i ponovno pregledaj kopiju.'};
    oldPoint=store.getItem(RESTORE_POINT_KEY);
    store.setItem(RESTORE_POINT_KEY,createProgressBackup(current,now));checkpointWritten=true;
    store.setItem(SAVE_KEY,JSON.stringify(next));
    return {ok:true,save:next};
  }catch{
    if(checkpointWritten){try{if(oldPoint===null)store.removeItem(RESTORE_POINT_KEY);else store.setItem(RESTORE_POINT_KEY,oldPoint);}catch{/* The current save is still intact; a remaining checkpoint is also the current state. */}}
    return {ok:false,message:'Obnova nije spremljena. Provjeri dostupnost i prostor pohrane preglednika te valjanost kopije. Postojeći napredak ostaje sačuvan.'};
  }
}
export function progressSnapshot(save:Save,tier:ContentTier,mode:PlayMode='campaign'){
  const target=mode==='topics'?readTopics(save,tier):profile(save,tier),practice=practiceSummary(target.practice,target.best);
  const active=mode==='campaign'?profile(save,tier).active:null;
  const drafts=mode==='topics'?Object.values(readTopics(save,tier).drafts).sort((a,b)=>a.level-b.level):[];
  return {
    tier,mode,name:TIER_INFO[tier].name,completed:LEVELS.filter(l=>target.best[l.id]?.completed).length,
    learning:Object.values(target.best).reduce((sum,b)=>sum+b.learning,0),arcade:Object.values(target.best).reduce((sum,b)=>sum+b.arcade,0),practice,
    active:active?{level:active.level,title:levelContent(LEVELS[active.level-1],tier).title,learning:score(active)}:null,
    drafts:drafts.map(run=>({level:run.level,title:levelContent(LEVELS[run.level-1],tier).title,learning:score(run)})),
    rows:LEVELS.map(level=>{
      const best=target.best[level.id],entry=target.practice[level.id];
      const application=!best?.completed?'Još zaključano':entry?.solved?(entry.firstCorrect?'Riješeno iz prve':'Riješeno uz ispravak'):entry?.attempts?'Čeka ispravak':Object.keys(entry?.answers||{}).length?'Započeto':'Nije započeto';
      return {level:level.id,title:levelContent(level,tier).title,completed:!!best?.completed,learning:best?.learning||0,arcade:best?.arcade||0,independent:best?.independent||0,application};
    })
  };
}
export function progressReport(save:Save,now=new Date()):string {
  const lines=[`SISgame ${VERSION} — Moj rad`,`Vrijeme izrade (UTC): ${now.toISOString()}`,'',
    'Ovo je lokalni zapis vježbanja, bez imena i prijave. Nije dokaz identiteta, samostalnosti ni formalna ocjena.',
    'Iz prve = prva potpuna predaja uz dostupnu pomoć. Rezultati razina nisu međusobno usporedive ocjene.',
    'Bodovi učenja i arkadni bonus vode se odvojeno. Ovaj sažetak nije kopija za obnovu napretka.'];
  for(const mode of ['campaign','topics'] as const){
    lines.push('',MODE_NAMES[mode].toLocaleUpperCase('hr-HR'));
    for(const tier of TIERS){
      const state=progressSnapshot(save,tier,mode);
      lines.push('',`${state.name.toUpperCase()}`,`Završene misije: ${state.completed}/${LEVELS.length} | Učenje: ${state.learning}/${LEVELS.length*100} | Arkadni bonus: ${state.arcade}`,
        `Primjena: ${state.practice.solved}/${PRACTICE_CASES.length} riješeno | ${state.practice.firstTry} iz prve`,
        state.active?`Aktivni pokušaj: ${missionNumber(state.active.level)}. ${state.active.title} (${state.active.learning}/100 učenje)`:mode==='topics'?`Započete teme: ${state.drafts.length}.`:'Nema aktivne misije.',
        `Teme za ponavljanje: ${state.practice.review.length?state.practice.review.map(n=>levelContent(LEVELS[n-1],tier).title).join('; '):'nema zabilježenih ispravaka u dodatnim slučajevima'}.`,'');
      for(const draft of state.drafts)lines.push(`Započeta tema: ${missionNumber(draft.level)}. ${draft.title} (${draft.learning}/100 učenje).`);
      for(const row of state.rows)lines.push(`${missionNumber(row.level)}. ${row.title} — ${row.completed?'dovršeno':'nije dovršeno'}; učenje ${row.learning}/100; bonus ${row.arcade}; najviše ${row.independent}/4 zadaće bez ispravka; primjena: ${row.application}.`);
    }
  }
  return '\uFEFF'+lines.join('\r\n')+'\r\n';
}
export function progressFilename(kind:'backup'|'report',now=new Date()){
  return `SISgame-${kind==='backup'?'napredak':'moj-rad'}-${now.toISOString().replace(/[:.]/g,'-')}.${kind==='backup'?'json':'txt'}`;
}
