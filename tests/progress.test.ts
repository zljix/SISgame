import test from 'node:test';
import assert from 'node:assert/strict';
import { act, newRun } from '../src/core.ts';
import { TIERS } from '../src/curriculum.ts';
import { emptySave, parseSave, profile, SAVE_KEY } from '../src/storage.ts';
import { practiceCase, setPracticeAnswer, submitPractice } from '../src/practice.ts';
import { createProgressBackup, MAX_BACKUP_BYTES, progressFilename, progressReport, progressSnapshot, readProgressBackup, RESTORE_POINT_KEY, restoreProgress } from '../src/progress.ts';

const now=new Date('2026-10-27T07:30:00.000Z');
function populatedSave(){
  const save=emptySave();save.settings.content='expert';save.settings.difficulty='relaxed';save.settings.reducedMotion=true;
  for(const tier of TIERS){
    const p=profile(save,tier);
    p.best[1]={learning:100,arcade:15,independent:3,completed:true};
    p.active=newRun(11,'hard',tier,true);act(p.active,'assets','context');
    p.active.riskAnswers={archive:'high'};p.active.riskMeasures=['backup'];
    if(tier==='expert'){p.active.review.started=true;p.active.review.remaining=47;p.active.review.answers={remaining:'disk'};}
    const scenario=practiceCase(1,tier)!;
    for(const q of scenario.questions)setPracticeAnswer(p.practice,p.best,1,tier,q.id,q.answer);
    if(tier==='standard'){
      setPracticeAnswer(p.practice,p.best,1,tier,'action','allow');submitPractice(p.practice,p.best,1,tier);
      setPracticeAnswer(p.practice,p.best,1,tier,'action','verify');
    }
    if(tier!=='junior')submitPractice(p.practice,p.best,1,tier);
  }
  // Use the same normalization as reloading the current game; invalid fixture answers are dropped.
  return parseSave(JSON.stringify(save));
}
class MemoryStore {
  values=new Map<string,string>();writes:string[]=[];failKey='';failRead=false;
  getItem(key:string){if(this.failRead)throw new Error('Denied');return this.values.get(key)??null;}
  setItem(key:string,value:string){this.writes.push(key);if(key===this.failKey)throw new Error('Quota');this.values.set(key,value);}
  removeItem(key:string){this.values.delete(key);}
}

test('Backup round trip preserves three tiers, campaign drafts, practice corrections and settings',()=>{
  const save=populatedSave(),before=JSON.stringify(save);
  const backup=readProgressBackup(createProgressBackup(save,now));
  assert.deepEqual(backup.save,save);assert.equal(backup.createdAt,now.toISOString());
  assert.equal(profile(backup.save,'standard').practice[1].firstCorrect,false);
  assert.equal(profile(backup.save,'junior').practice[1].solved,false);
  assert.equal(profile(backup.save,'expert').active!.review.remaining,47);
  assert.equal(JSON.stringify(save),before,'export is read-only');
});

test('Whitespace, BOM and property order do not corrupt an otherwise valid backup',()=>{
  const data=JSON.parse(createProgressBackup(populatedSave(),now));
  const reordered=Object.fromEntries(Object.entries(data).reverse());
  reordered.save=Object.fromEntries(Object.entries(data.save).reverse());
  assert.deepEqual(readProgressBackup('\uFEFF \n'+JSON.stringify(reordered)).save,populatedSave());
});

test('Unrelated files, truncated JSON, unsupported formats and incomplete saves are rejected',()=>{
  for(const raw of ['', 'null', '[]', '{}', '{', 'plain text', JSON.stringify(emptySave())])assert.throws(()=>readProgressBackup(raw));
  const base=JSON.parse(createProgressBackup(emptySave(),now));
  for(const change of [{format:'other-game'},{formatVersion:2},{save:{schema:2}},{save:{schema:99}},{extra:'unsupported'},{gameVersion:'<img src=x>'},{createdAt:'2026-02-30T07:30:00.000Z'},{createdAt:'not-a-date'}]){
    assert.throws(()=>readProgressBackup(JSON.stringify({...base,...change})));
  }
});

test('Import refuses silently normalized or unknown data instead of replacing it with defaults',()=>{
  const cases=[
    (data:any)=>data.save.settings.difficulty='impossible',
    (data:any)=>data.save.profiles.standard.best[1].learning=500,
    (data:any)=>data.save.profiles.standard.best[99]={learning:100,arcade:0,independent:4,completed:true},
    (data:any)=>data.save.profiles.standard.active.riskAnswers.archive='invented',
    (data:any)=>data.save.profiles.standard.practice[1].solved=false,
    (data:any)=>data.save.profiles.junior.practice[1].answers.extra='unknown',
    (data:any)=>data.save.profiles.expert.active.review.remaining=-1,
    (data:any)=>delete data.save.profiles.expert,
    (data:any)=>data.save.profiles.guest={best:{},active:null,practice:{}}
  ];
  for(const change of cases){const data=JSON.parse(createProgressBackup(populatedSave(),now));change(data);assert.throws(()=>readProgressBackup(JSON.stringify(data)));}
});

test('Size, nesting, excessive nodes and non-finite numbers are bounded before importing',()=>{
  assert.throws(()=>readProgressBackup(' '.repeat(MAX_BACKUP_BYTES+1)),/1 MB/);
  assert.throws(()=>readProgressBackup('č'.repeat(MAX_BACKUP_BYTES/2+1)),/1 MB/);
  let deep:unknown={};for(let i=0;i<30;i++)deep={deep};
  assert.throws(()=>readProgressBackup(JSON.stringify(deep)),/Struktura/);
  assert.throws(()=>readProgressBackup(JSON.stringify(Array.from({length:20001},()=>0))),/Struktura/);
  assert.throws(()=>readProgressBackup('{"a":1e999}'),/broj/);
});

test('Restoration writes a recoverable current snapshot before replacing all three profiles',()=>{
  const current=populatedSave(),next=emptySave(),store=new MemoryStore(),raw=JSON.stringify(current);
  store.values.set(SAVE_KEY,raw);
  const result=restoreProgress(store,current,readProgressBackup(createProgressBackup(next,now)),raw,now);
  assert.equal(result.ok,true);if(result.ok)assert.deepEqual(result.save,next);
  assert.deepEqual(store.writes,[RESTORE_POINT_KEY,SAVE_KEY]);
  assert.deepEqual(readProgressBackup(store.getItem(RESTORE_POINT_KEY)!).save,current);
  assert.deepEqual(JSON.parse(store.getItem(SAVE_KEY)!),next);
  assert.deepEqual(current,populatedSave(),'the caller changes memory only after success');
});

test('Blocked checkpoint storage cannot overwrite the existing game',()=>{
  const current=populatedSave(),raw=JSON.stringify(current),store=new MemoryStore();store.values.set(SAVE_KEY,raw);store.failKey=RESTORE_POINT_KEY;
  const result=restoreProgress(store,current,readProgressBackup(createProgressBackup(emptySave(),now)),raw,now);
  assert.equal(result.ok,false);assert.equal(store.getItem(SAVE_KEY),raw);assert.deepEqual(store.writes,[RESTORE_POINT_KEY]);
});

test('Failed final write preserves the current save and reinstates the previous restore point',()=>{
  for(const existingPoint of [null,createProgressBackup(emptySave(),now)]){
    const current=populatedSave(),raw=JSON.stringify(current),store=new MemoryStore();store.values.set(SAVE_KEY,raw);
    if(existingPoint)store.values.set(RESTORE_POINT_KEY,existingPoint);
    store.failKey=SAVE_KEY;
    const result=restoreProgress(store,current,readProgressBackup(createProgressBackup(emptySave(),now)),raw,now);
    assert.equal(result.ok,false);assert.equal(store.getItem(SAVE_KEY),raw);assert.equal(store.getItem(RESTORE_POINT_KEY),existingPoint);
  }
});

test('Stale previews and denied reads do not write either local record',()=>{
  const current=populatedSave(),store=new MemoryStore();store.values.set(SAVE_KEY,'newer-record');
  const backup=readProgressBackup(createProgressBackup(emptySave(),now));
  const stale=restoreProgress(store,current,backup,'older-record',now);
  assert.equal(stale.ok,false);assert.deepEqual(store.writes,[]);assert.equal(store.getItem(SAVE_KEY),'newer-record');
  store.failRead=true;assert.equal(restoreProgress(store,current,backup,null,now).ok,false);assert.deepEqual(store.writes,[]);
});

test('Mutation after preview is revalidated before touching storage',()=>{
  const store=new MemoryStore(),backup=readProgressBackup(createProgressBackup(emptySave(),now));
  (backup.save.settings as any).difficulty='tampered';
  assert.equal(restoreProgress(store,emptySave(),backup,null,now).ok,false);assert.deepEqual(store.writes,[]);
});

test('A restore point can recover previous work while retaining the state it replaces',()=>{
  const original=populatedSave(),replacement=emptySave(),store=new MemoryStore(),raw=JSON.stringify(original);store.values.set(SAVE_KEY,raw);
  const first=restoreProgress(store,original,readProgressBackup(createProgressBackup(replacement,now)),raw,now);assert.equal(first.ok,true);
  const point=readProgressBackup(store.getItem(RESTORE_POINT_KEY)!);
  const second=restoreProgress(store,replacement,point,store.getItem(SAVE_KEY),now);assert.equal(second.ok,true);
  assert.deepEqual(JSON.parse(store.getItem(SAVE_KEY)!),original);
  assert.deepEqual(readProgressBackup(store.getItem(RESTORE_POINT_KEY)!).save,replacement);
});

test('A new device accepts an empty baseline and keeps an empty restore point',()=>{
  const store=new MemoryStore(),save=populatedSave();
  assert.equal(restoreProgress(store,emptySave(),readProgressBackup(createProgressBackup(save,now)),null,now).ok,true);
  assert.deepEqual(JSON.parse(store.getItem(SAVE_KEY)!),save);
  assert.deepEqual(readProgressBackup(store.getItem(RESTORE_POINT_KEY)!).save,emptySave());
});

test('Progress summaries distinguish best campaign results, active attempts and practice status',()=>{
  const save=populatedSave(),standard=progressSnapshot(save,'standard'),junior=progressSnapshot(save,'junior');
  assert.equal(standard.completed,1);assert.equal(standard.learning,100);assert.equal(standard.arcade,15);
  assert.equal(standard.active!.level,11);assert.equal(standard.active!.learning,25);
  assert.equal(standard.rows[0].application,'Riješeno uz ispravak');assert.equal(junior.rows[0].application,'Započeto');
  assert.equal(standard.rows[1].application,'Još zaključano');assert.deepEqual(standard.practice.review,[1]);
  assert.equal(standard.practice.firstTry,0);assert.equal(progressSnapshot(save,'expert').practice.firstTry,1);
});

test('Readable report includes each tier without treating a report as a restorable backup',()=>{
  const save=populatedSave(),text=progressReport(save,now);
  assert.ok(text.startsWith('\uFEFF'));assert.match(text,/JUNIOR/);assert.match(text,/STANDARD/);assert.match(text,/EXPERT/);
  assert.match(text,/Riješeno uz ispravak/);assert.match(text,/Arkadni bonus: 15/);assert.match(text,/nije kopija za obnovu/);
  assert.throws(()=>readProgressBackup(text));
  assert.equal(progressFilename('backup',now),'SISgame-napredak-2026-10-27T07-30-00-000Z.json');
  assert.equal(progressFilename('report',now),'SISgame-moj-rad-2026-10-27T07-30-00-000Z.txt');
});
