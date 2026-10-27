import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { CHECKS, FILES, newRun, score, type Run } from '../src/core.ts';
import { TIERS, EXPERT_REVIEWS } from '../src/curriculum.ts';
import { LEVELS, levelContent } from '../src/data.ts';
import { samplesFor } from '../src/missions.ts';
import { alertsFor } from '../src/network.ts';
import { MISSION_GUIDES, missionOutcome } from '../src/learning.ts';
import { PRACTICE_CASES, practiceCase, setPracticeAnswer, submitPractice } from '../src/practice.ts';
import { createProgressBackup, MAX_BACKUP_BYTES, progressReport, progressSnapshot, readProgressBackup } from '../src/progress.ts';
import { checkpoint, emptySave, parseSave, profile, resultBook, savedRun } from '../src/storage.ts';
import { topicPreparation } from '../src/study.ts';

function consoleDraft(run:Run){
  if(run.level===2)run.permissions={schedule:{student:'write',teacher:'read',guest:run.content==='junior'?'read':'none'},grades:{student:'read',teacher:'write',guest:'none'}};
  if(run.level===4)run.sampleAnswers=Object.fromEntries(samplesFor(run.content).map(s=>[s.id,'worm']));
  if(run.level===5)run.sessionChoice={event:'school',response:'password'};
  if(run.level===6)run.serviceSettings={updates:run.content==='junior',remote:false,coursework:false};
  if(run.level===8)run.networkRules={web:true,admin:run.content==='junior',outside:true};
}

test('switching campaign missions preserves each attempt, corrections and separate topic work',()=>{
  const save=emptySave();
  for(const tier of TIERS){
    const first=newRun(2,'hard',tier);consoleDraft(first);first.checks.schedule={done:true,errors:1};
    checkpoint(save,first,'campaign');
    const second=newRun(1,'easy',tier);checkpoint(save,second,'campaign');
    const topic=newRun(2,'relaxed',tier);checkpoint(save,topic,'topics');
    assert.equal(savedRun(save,2,'campaign',tier),first);assert.equal(score(first),25);
    assert.equal(savedRun(save,2,'topics',tier),topic);
    checkpoint(save,first,'campaign');
    assert.equal(profile(save,tier).active,first);assert.equal(savedRun(save,1,'campaign',tier),second);
    assert.equal(profile(save,tier).drafts![2],undefined);
    first.completed=true;checkpoint(save,first,'campaign');
    assert.equal(savedRun(save,2,'campaign',tier),null);assert.equal(savedRun(save,1,'campaign',tier),second);
    assert.equal(savedRun(save,2,'topics',tier),topic);
    assert.equal(progressSnapshot(save,tier).drafts[0].level,1);
  }
  assert.deepEqual(readProgressBackup(createProgressBackup(save)).save,save);
  assert.match(progressReport(save),/Sačuvani pokušaj kampanje: 01/);
});

test('all 84 campaign and topic attempts fit a portable backup and preserve unsubmitted choices',()=>{
  const save=emptySave();
  for(const tier of TIERS)for(const mode of ['campaign','topics'] as const)for(const level of LEVELS){
    const run=newRun(level.id,'hard',tier,true);consoleDraft(run);
    run.files=FILES.map(f=>f.id);run.backup=[...run.files];run.bits=Array.from({length:12},(_,i)=>`bit-${i}`);
    run.flags=['card','paper','secret','failure',...Object.values(CHECKS).flat()];
    for(const check of Object.values(run.checks)){check.done=true;check.errors=100000;}
    if(tier==='expert')for(const q of EXPERT_REVIEWS[level.id].questions)run.review.answers[q.id]=q.answer;
    checkpoint(save,run,mode);
    const book=resultBook(save,mode,tier);book.best[level.id].completed=true;
    for(const q of practiceCase(level.id,tier)!.questions)setPracticeAnswer(book.practice,book.best,level.id,tier,q.id,q.answer);
    submitPractice(book.practice,book.best,level.id,tier);
  }
  const backup=createProgressBackup(save);
  assert.ok(Buffer.byteLength(backup)<MAX_BACKUP_BYTES);
  assert.deepEqual(parseSave(JSON.stringify(save)),save);
  const restored=readProgressBackup(backup).save;assert.deepEqual(restored,save);
  for(const tier of TIERS)for(const mode of ['campaign','topics'] as const)for(const level of LEVELS){
    assert.equal(savedRun(restored,level.id,mode,tier)!.checks[CHECKS[level.id][0]].errors,100000);
  }
});

test('untrusted campaign drafts cannot duplicate active work or inject unknown missions and choices',()=>{
  const save=emptySave();checkpoint(save,newRun(2,'easy','junior'),'campaign');checkpoint(save,newRun(6,'easy','junior'),'campaign');
  const raw:any=JSON.parse(JSON.stringify(save)),p=raw.profiles.junior;
  p.drafts[2].permissions={schedule:{student:'root',teacher:'write',guest:'write'},grades:{student:'none',teacher:'write',guest:'write'}};
  p.drafts[6]=newRun(6);p.drafts[99]=newRun(1);p.drafts[3]=newRun(4);p.drafts[5]=newRun(5);p.drafts[5].completed=true;
  p.active.serviceSettings={updates:false,remote:'yes',coursework:false,extra:true};
  const parsed=parseSave(JSON.stringify(raw)).profiles.junior;
  assert.deepEqual(Object.keys(parsed.drafts!),['2']);
  assert.deepEqual(parsed.drafts![2].permissions,{schedule:{student:'none',teacher:'write',guest:'read'},grades:{student:'none',teacher:'write',guest:'none'}});
  assert.deepEqual(parsed.active!.serviceSettings,{updates:true,remote:true,coursework:false});
  const backup=JSON.parse(createProgressBackup(save));backup.save=raw;
  assert.throws(()=>readProgressBackup(JSON.stringify(backup)),/oštećene ili nepodržane/);
});

test('0.10 exports preserve old draft shapes and practice results after choice wording changes',async()=>{
  const raw=await readFile(new URL('./fixtures/progress-v0.10.0.json',import.meta.url),'utf8'),original=JSON.parse(raw);
  assert.equal(original.gameVersion,'0.10.0');const restored=readProgressBackup(raw).save;
  assert.deepEqual(restored,original.save);
  for(const tier of TIERS){
    const p=profile(restored,tier);assert.equal(p.active!.level,6);assert.equal(p.active!.serviceSettings,undefined);
    assert.equal(p.drafts,undefined);assert.equal(p.topics!.drafts[14].signatureKey,'school');
    assert.equal(p.practice[1].solved,true);assert.equal(p.practice[1].firstCorrect,false);assert.equal(p.practice[1].attempts,2);
    for(const q of practiceCase(1,tier)!.questions)assert.equal(p.practice[1].submitted![q.id],q.answer);
  }
});

test('firewall prerequisites resolve the same concept in every tier rather than a shared paragraph index',()=>{
  for(const tier of TIERS)for(const level of [9,10]){
    const reminder=topicPreparation(level,tier).find(r=>r.source===8)!;
    assert.match(reminder.text,/vatrozid/i);
    assert.equal(reminder.text,levelContent(LEVELS[7],tier).lesson[tier==='junior'?0:1][1]);
  }
  assert.equal(alertsFor('junior').length,2);
  assert.doesNotMatch(missionOutcome(9,'junior'),/odbijen/i);
  assert.match(missionOutcome(9,'junior'),/odobren.*neovlašten/);
  assert.doesNotMatch(Object.values(MISSION_GUIDES[13].example).join(' '),/bajt/i);
});

test('answer length alone does not reliably solve practice cases in any tier',()=>{
  for(const tier of TIERS)for(const direction of [1,-1]){
    let guessed=0,total=0,solved=0;
    for(const scenario of PRACTICE_CASES){
      let all=true;
      for(const q of practiceCase(scenario.level,tier)!.questions){
        const pick=[...q.choices].sort((a,b)=>direction*(a.label.length-b.label.length))[0];
        const correct=pick.id===q.answer;guessed+=Number(correct);total++;all&&=correct;
      }
      solved+=Number(all);
    }
    assert.ok(guessed/total<=.6,`${tier}: length heuristic guessed ${guessed}/${total}`);
    assert.ok(solved<=3,`${tier}: length heuristic solved ${solved}/14 cases`);
  }
});
