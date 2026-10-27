import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { act, CHECKS, compareHashes, newRun, nextTarget, score, submitExpertReview, verifySignatures, type Run } from '../src/core.ts';
import { EXPERT_REVIEWS, JUNIOR_CHOICES, JUNIOR_LESSONS, JUNIOR_REPORTS, TERMS, TIERS } from '../src/curriculum.ts';
import { LEVELS } from '../src/data.ts';
import { HASH_FILES, HASH_REFERENCE, hashFilesFor, hashMatches, signedFilesFor, SIGNED_FILES, signaturePreview } from '../src/integrity.ts';
import { DECISIONS, VERIFICATION_REPORTS } from '../src/missions.ts';
import { createProgressBackup, readProgressBackup } from '../src/progress.ts';
import { emptySave, parseSave, profile, recordBest, totalLearning } from '../src/storage.ts';

const hashAnswers={original:'same',changed:'changed',renamed:'same'};
const signatureAnswers={approved:'accept',edited:'hold',unknown:'hold'};
function prepare(run:Run){
  if(run.level===13){act(run,'hash-source','known');compareHashes(run,hashAnswers);act(run,'hash-response','retry');}
  else {act(run,'sign-keys','public');verifySignatures(run,'school',signatureAnswers);act(run,'sign-share','protect');}
}

test('Displayed SHA-256 values match the exact UTF-8 fixture contents, independent of filename',()=>{
  for(const file of [HASH_REFERENCE,...HASH_FILES]){
    assert.match(file.digest,/^[a-f0-9]{64}$/);
    assert.equal(createHash('sha256').update(file.text,'utf8').digest('hex'),file.digest);
  }
  assert.equal(HASH_FILES[0].name,HASH_FILES[1].name);
  assert.notEqual(HASH_FILES[0].digest,HASH_FILES[1].digest);
  assert.notEqual(HASH_FILES[0].name,HASH_FILES[2].name);
  assert.equal(HASH_FILES[0].digest,HASH_FILES[2].digest);
  assert.deepEqual(HASH_FILES.map(hashMatches),[true,false,true]);
});

test('Signature model separates mathematical validity, trusted identity and acceptance',()=>{
  const [original,edited,unknown]=SIGNED_FILES;
  assert.equal(signaturePreview(original,'').checked,false);
  assert.equal(signaturePreview(original,'school').acceptable,true);
  assert.equal(signaturePreview(edited,'school').valid,false);
  assert.equal(signaturePreview(original,'enclosed').valid,false);
  assert.equal(signaturePreview(unknown,'school').valid,false);
  const untrusted=signaturePreview(unknown,'enclosed');
  assert.equal(untrusted.valid,true);assert.equal(untrusted.trusted,false);assert.equal(untrusted.acceptable,false);
  assert.match(untrusted.text,/nije potvrđena/);
});

test('Hash comparison needs a confirmed reference, distinguishes incomplete work and preserves corrections',()=>{
  const run=newRun(13);
  assert.equal(compareHashes(run,hashAnswers).ok,false);assert.equal(run.hashAnswers&&Object.keys(run.hashAnswers).length,0);
  assert.equal(act(run,'hash-source','message').ok,false);assert.equal(act(run,'hash-source','name').ok,false);
  act(run,'hash-source','known');
  for(const answers of [{},{original:'same'},{...hashAnswers,changed:'not-a-verdict'}])assert.equal(compareHashes(run,answers).ok,false);
  assert.equal(run.checks['hash-lab'].errors,0);
  assert.equal(compareHashes(run,{...hashAnswers,changed:'same'}).ok,false);
  assert.equal(run.checks['hash-lab'].errors,1);assert.equal(score(run),25);
  assert.equal(act(run,'hash-response','retry').ok,false);
  assert.equal(compareHashes(run,hashAnswers).ok,true);assert.equal(nextTarget(run),'hash-response');
  assert.equal(act(run,'hash-response','replace').ok,false);assert.equal(act(run,'hash-response','rename').ok,false);
  act(run,'hash-response','retry');act(run,'hash-test','test');
  assert.equal(score(run),100);assert.equal(run.checks['hash-lab'].errors,1);
});

test('Valid signatures from an unconfirmed key cannot approve a school document',()=>{
  const run=newRun(14);
  assert.equal(verifySignatures(run,'school',signatureAnswers).ok,false);
  assert.equal(act(run,'sign-keys','private').ok,false);assert.equal(act(run,'sign-keys','enclosed').ok,false);
  act(run,'sign-keys','public');
  assert.equal(verifySignatures(run,'',signatureAnswers).ok,false);
  assert.equal(verifySignatures(run,'school',{approved:'accept'}).ok,false);
  assert.equal(run.checks['sign-lab'].errors,0);
  assert.equal(verifySignatures(run,'enclosed',{approved:'hold',edited:'hold',unknown:'accept'}).ok,false);
  assert.equal(verifySignatures(run,'school',{approved:'accept',edited:'accept',unknown:'hold'}).ok,false);
  assert.equal(verifySignatures(run,'school',{approved:'accept',edited:'hold',unknown:'accept'}).ok,false);
  assert.equal(run.checks['sign-lab'].errors,3);
  assert.equal(verifySignatures(run,'school',signatureAnswers).ok,true);
  assert.equal(act(run,'sign-share','public').ok,false);assert.equal(act(run,'sign-share','send-key').ok,false);
  assert.equal(act(run,'sign-test','test').ok,false);
  act(run,'sign-share','protect');act(run,'sign-test','test');assert.equal(score(run),100);
});

test('New console drafts, corrections and key selection survive save and backup round trips for every tier',()=>{
  for(const tier of TIERS)for(const level of [13,14]){
    const save=emptySave();save.settings.content=tier;
    const run=newRun(level,'relaxed',tier);profile(save).active=run;
    if(level===13){act(run,'hash-source','known');compareHashes(run,{original:'changed',changed:'same',renamed:'changed'});}
    else{act(run,'sign-keys','public');verifySignatures(run,'enclosed',{approved:'hold',edited:'hold',unknown:'accept'});}
    recordBest(save,run);
    assert.deepEqual(parseSave(JSON.stringify(save)),save);
    assert.deepEqual(readProgressBackup(createProgressBackup(save)).save,save);
    assert.equal(profile(save).active!.checks[level===13?'hash-lab':'sign-lab'].errors,1);
    assert.equal(totalLearning(save),25);
  }
});

test('Console restoration drops unknown values and other-tier fields while external import rejects them',()=>{
  const save=emptySave();profile(save).active=newRun(13);
  profile(save).active!.hashAnswers={original:'same',changed:'bogus',injected:'same'} as any;
  assert.deepEqual(profile(parseSave(JSON.stringify(save))).active!.hashAnswers,{original:'same'});
  const backup=JSON.parse(createProgressBackup(emptySave()));backup.save=save;
  assert.throws(()=>readProgressBackup(JSON.stringify(backup)));
  profile(save).active=newRun(14);
  profile(save,'standard').active!.signatureKey='private' as any;
  profile(save,'standard').active!.signatureAnswers={approved:'accept',edited:'bogus',unknown:'hold'} as any;
  const clean=profile(parseSave(JSON.stringify(save)),'standard').active!;
  assert.equal(clean.signatureKey,'');assert.deepEqual(clean.signatureAnswers,{approved:'accept',unknown:'hold'});
  const juniorSave=emptySave();profile(juniorSave,'junior').active=newRun(14,'easy','junior');
  profile(juniorSave,'junior').active!.signatureAnswers={approved:'accept',unknown:'hold'};
  assert.deepEqual(profile(parseSave(JSON.stringify(juniorSave)),'junior').active!.signatureAnswers,{approved:'accept'});
});

test('An actual 0.7 export keeps all previous results, practice records and active attempts',()=>{
  // Generated using the unmodified 0.7.0 source, not the current parser.
  const text=readFileSync(new URL('./fixtures/progress-v0.7.0.json',import.meta.url),'utf8');
  const original=JSON.parse(text),loaded=readProgressBackup(text);
  assert.equal(original.gameVersion,'0.7.0');assert.deepEqual(loaded.save,original.save);
  for(const tier of TIERS){const p=profile(loaded.save,tier);
    assert.equal(totalLearning(loaded.save,tier),1200);assert.ok(p.best[12].completed);assert.equal(p.best[13],undefined);
    assert.equal(p.active!.level,12);assert.equal(p.practice[1].solved,true);
    assert.equal('hashAnswers' in p.active!,false);assert.equal('signatureAnswers' in p.active!,false);
  }
  assert.deepEqual(readProgressBackup(createProgressBackup(loaded.save)).save,loaded.save);
});

test('New consoles cannot mutate unrelated missions, completed tasks or finished runs',()=>{
  for(const level of [1,12]){const run=newRun(level),before=structuredClone(run);compareHashes(run,hashAnswers);verifySignatures(run,'school',signatureAnswers);assert.deepEqual(run,before);}
  for(const level of [13,14]){
    const run=newRun(level);prepare(run);const before=structuredClone(run);
    compareHashes(run,{});verifySignatures(run,'enclosed',{});assert.deepEqual(run,before);
    act(run,CHECKS[level][3],'test');act(run,'exit','finish');const finished=structuredClone(run);
    compareHashes(run,hashAnswers);verifySignatures(run,'school',signatureAnswers);assert.deepEqual(run,finished);
    const save=emptySave();recordBest(save,run);recordBest(save,run);assert.equal(totalLearning(save),100);
  }
});

test('Both Expert cases require new evidence and preserve errors after reload without extra points',()=>{
  for(const level of [13,14]){
    const run=newRun(level,'hard','expert');prepare(run);const review=EXPERT_REVIEWS[level];
    assert.equal(act(run,review.station,'test').review,true);assert.equal(score(run),75);
    const answers=Object.fromEntries(review.questions.map(q=>[q.id,q.answer])),first=review.questions[0];
    answers[first.id]=first.choices.find(([id])=>id!==first.answer)![0];
    assert.equal(submitExpertReview(run,answers).ok,false);assert.equal(run.checks[review.station].errors,1);
    const save=emptySave();profile(save,'expert').active=run;
    const restored=profile(readProgressBackup(createProgressBackup(save)).save,'expert').active!;
    assert.deepEqual(restored.review.answers,answers);answers[first.id]=first.answer;
    assert.equal(submitExpertReview(restored,answers).ok,true);assert.equal(score(restored),75);
    assert.equal(act(restored,review.station,'test').ok,true);assert.equal(score(restored),100);
    assert.equal(restored.checks[review.station].errors,1);
  }
});

test('Junior workload is smaller and every new decision has an introduced lesson and final report',()=>{
  assert.deepEqual(TIERS.map(tier=>hashFilesFor(tier).length),[2,3,3]);
  assert.deepEqual(TIERS.map(tier=>signedFilesFor(tier).length),[2,3,3]);
  for(const level of [13,14]){
    assert.ok(LEVELS[level-1].lesson.length>=3);assert.equal(JUNIOR_LESSONS[level].flow.length,3);assert.ok(TERMS[level].length>=3);
    for(const [key,decision] of Object.entries(DECISIONS).filter(([,d])=>d.level===level)){
      const simple=JUNIOR_CHOICES[key];assert.ok(simple);assert.ok(simple.options.length<=2);
      assert.ok(simple.options.some(([id])=>id===decision.correct));
      for(const [id] of simple.options)assert.ok(decision.options.some(option=>option.id===id));
    }
    assert.equal(VERIFICATION_REPORTS[CHECKS[level][3]].length,4);assert.equal(JUNIOR_REPORTS[CHECKS[level][3]].length,4);
  }
});
