import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { act, newRun } from '../src/core.ts';
import { TIERS } from '../src/curriculum.ts';
import { LEVELS, levelContent } from '../src/data.ts';
import { practiceCase, setPracticeAnswer, submitPractice } from '../src/practice.ts';
import { createProgressBackup, progressReport, progressSnapshot, readProgressBackup } from '../src/progress.ts';
import { checkpoint, emptySave, parseSave, profile, readTopics, resultBook, savedRun, totalLearning } from '../src/storage.ts';
import { findTopics, topicPreparation } from '../src/study.ts';

test('topic catalogue finds taught concepts with Croatian diacritics and never needs campaign unlocks',()=>{
  for(const tier of TIERS){
    assert.equal(findTopics('',tier).length,LEVELS.length);
    assert.ok(findTopics('sifriranje',tier).some(l=>l.id===2));
    assert.ok(findTopics('ŠIFRIRANJE',tier).some(l=>l.id===2));
    assert.ok(findTopics('SHA-256',tier).some(l=>l.id===13));
    assert.ok(findTopics('privatni ključ',tier).some(l=>l.id===14));
    assert.deepEqual(findTopics('<script>unmatched</script>',tier),[]);
  }
});

test('read-only topic summaries, search and exports do not create or change progress',()=>{
  const save=emptySave(),before=JSON.stringify(save);
  for(const tier of TIERS){readTopics(save,tier);progressSnapshot(save,tier,'topics');findTopics('kopija',tier);}
  progressReport(save);createProgressBackup(save);
  assert.equal(JSON.stringify(save),before);
});

test('topic checkpoints preserve separate drafts and cannot overwrite or unlock a campaign',()=>{
  const save=emptySave();const campaign=newRun(2,'hard');act(campaign,'schedule','anything');checkpoint(save,campaign,'campaign');
  const before=JSON.stringify(profile(save));
  const signatures=newRun(14,'relaxed');act(signatures,'sign-keys','private');act(signatures,'sign-keys','public');checkpoint(save,signatures,'topics');
  const hash=newRun(13,'easy');hash.hashAnswers={renamed:'same'};checkpoint(save,hash,'topics');
  const {topics,...unchanged}=profile(save);
  assert.equal(JSON.stringify(unchanged),before);assert.equal(totalLearning(save),0);
  assert.equal(topics!.drafts[14].checks['sign-keys'].errors,1);
  assert.deepEqual(topics!.drafts[13].hashAnswers,{renamed:'same'});
  assert.equal(savedRun(save,2,'campaign','standard'),campaign);
  assert.equal(savedRun(save,13,'campaign','standard'),null);
  assert.equal(savedRun(save,14,'topics','standard'),signatures);
});

test('topic completion removes only its own draft, preserves best work and unlocks only its own cases',()=>{
  const save=emptySave(),first=newRun(13,'relaxed'),other=newRun(14,'easy');
  checkpoint(save,first,'topics');checkpoint(save,other,'topics');
  for(const check of Object.values(first.checks))check.done=true;
  first.completed=true;checkpoint(save,first,'topics');checkpoint(save,first,'topics');
  const topics=readTopics(save);
  assert.equal(topics.drafts[13],undefined);assert.equal(topics.drafts[14],other);assert.equal(topics.best[13].learning,100);
  assert.equal(profile(save).best[13],undefined);
  const scenario=practiceCase(13,'standard')!;
  const book=resultBook(save,'topics','standard');
  for(const q of scenario.questions)assert.equal(setPracticeAnswer(book.practice,book.best,13,'standard',q.id,q.answer),true);
  assert.equal(submitPractice(book.practice,book.best,13,'standard'),'solved');
  assert.equal(profile(save).practice[13],undefined);
  assert.equal(setPracticeAnswer(profile(save).practice,profile(save).best,13,'standard',scenario.questions[0].id,scenario.questions[0].answer),false);
  checkpoint(save,newRun(13,'hard'),'topics');assert.equal(topics.best[13].learning,100);
});

test('all topic drafts and corrections survive reload and portable backup independently per tier',()=>{
  const save=emptySave();
  for(const tier of TIERS)for(const level of LEVELS){
    const run=newRun(level.id,'relaxed',tier);Object.values(run.checks)[0].errors=2;
    if(level.id===14){run.signatureKey='school';run.signatureAnswers={approved:'accept'};}
    checkpoint(save,run,'topics');
  }
  const reloaded=parseSave(JSON.stringify(save));
  assert.deepEqual(reloaded,save);assert.deepEqual(readProgressBackup(createProgressBackup(save)).save,save);
  for(const tier of TIERS){assert.equal(Object.keys(readTopics(reloaded,tier).drafts).length,14);assert.equal(profile(reloaded,tier).active,null);}
});

test('untrusted topic drafts are bounded by mission, content tier and existing validators',()=>{
  const save=emptySave();checkpoint(save,newRun(14,'relaxed','junior'),'topics');
  const raw:any=JSON.parse(JSON.stringify(save));const topics=raw.profiles.junior.topics;
  topics.drafts[99]=newRun(1);topics.drafts[13]=newRun(12);topics.drafts[14].content='expert';topics.drafts[14].signatureKey='not-a-key';
  topics.best[99]={learning:100,arcade:0,independent:4,completed:true};
  const parsed=readTopics(parseSave(JSON.stringify(raw)),'junior');
  assert.deepEqual(Object.keys(parsed.drafts),['14']);assert.equal(parsed.drafts[14].content,'junior');assert.equal(parsed.drafts[14].signatureKey,'');
  assert.equal(parsed.best[99],undefined);
  const backup=JSON.parse(createProgressBackup(save));backup.save=raw;
  assert.throws(()=>readProgressBackup(JSON.stringify(backup)),/oštećene ili nepodržane/);
});

test('a real 0.9 export retains signature drafts and does not invent topic records',async()=>{
  const raw=await readFile(new URL('./fixtures/progress-v0.9.0.json',import.meta.url),'utf8'),original=JSON.parse(raw);
  const restored=readProgressBackup(raw);assert.equal(original.gameVersion,'0.9.0');assert.deepEqual(restored.save,original.save);
  for(const tier of TIERS){assert.equal(profile(restored.save,tier).active!.signatureKey,'school');assert.equal(profile(restored.save,tier).topics,undefined);}
});

test('summaries and reports explicitly separate campaign results from completed and unfinished topics',()=>{
  const save=emptySave(),run=newRun(14,'easy','expert');act(run,'sign-keys','public');checkpoint(save,run,'topics');
  const topic=progressSnapshot(save,'expert','topics'),campaign=progressSnapshot(save,'expert');
  assert.equal(topic.learning,25);assert.equal(topic.drafts[0].level,14);assert.equal(topic.active,null);
  assert.equal(campaign.learning,0);assert.equal(campaign.drafts.length,0);
  const report=progressReport(save);assert.match(report,/KAMPANJA/);assert.match(report,/VJEŽBE PO TEMAMA/);assert.match(report,/Započeta tema: 14/);
});


test('free-choice preparation reuses real earlier explanations adapted to the chosen tier',()=>{
  for(const tier of TIERS){
    const reminders=topicPreparation(14,tier);
    assert.deepEqual(reminders.map(p=>p.source),[2,13]);
    assert.equal(reminders[0].text,levelContent(LEVELS[1],tier).lesson[2][1]);
    assert.deepEqual(topicPreparation(1,tier),[]);
    for(const level of LEVELS)for(const reminder of topicPreparation(level.id,tier)){
      assert.ok(reminder.source<level.id);assert.ok(reminder.title&&reminder.text);
    }
  }
});
