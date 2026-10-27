import test from 'node:test';
import assert from 'node:assert/strict';
import { TIERS } from '../src/curriculum.ts';
import { LEVELS } from '../src/data.ts';
import { act, newRun } from '../src/core.ts';
import { PRACTICE_CASES, emptyPracticeProgress, parsePractice, practiceCase, practiceFeedback, practiceSummary, practiceUnlocked, setPracticeAnswer, submitPractice, type PracticeBook } from '../src/practice.ts';
import { emptySave, parseSave, profile, totalLearning } from '../src/storage.ts';

const completed=Object.fromEntries(LEVELS.map(l=>[l.id,{learning:100,arcade:20,independent:4,completed:true}]));
const answers=(level:number,tier:typeof TIERS[number])=>Object.fromEntries(practiceCase(level,tier)!.questions.map(q=>[q.id,q.answer]));

test('Every mission has a distinct transfer case with two Junior choices and a separate Expert inference',()=>{
  assert.deepEqual(PRACTICE_CASES.map(c=>c.level),LEVELS.map(l=>l.id));
  assert.equal(new Set(PRACTICE_CASES.map(c=>c.title)).size,LEVELS.length);
  for(const tier of TIERS)for(const level of LEVELS){
    const scenario=practiceCase(level.id,tier)!;
    assert.equal(scenario.questions.length,tier==='expert'?3:2);
    assert.ok(scenario.context&&scenario.reminder&&scenario.transfer);
    assert.equal(!!scenario.expertEvidence,tier==='expert');
    assert.equal(new Set(scenario.questions.map(q=>q.id)).size,scenario.questions.length);
    for(const q of scenario.questions){
      assert.equal(q.choices.length,tier==='junior'?2:3);
      assert.equal(q.choices.filter(c=>c.id===q.answer).length,1);
      assert.equal(new Set(q.choices.map(c=>c.id)).size,q.choices.length);
      assert.ok(q.choices.every(c=>c.label&&c.feedback));
    }
    assert.ok(practiceFeedback(scenario,answers(level.id,tier)).every(item=>item.correct));
  }
  assert.equal(practiceCase(999,'standard'),undefined);
});

test('A completed mission is required; unknown questions and choices cannot modify practice',()=>{
  const book:PracticeBook={};
  assert.equal(practiceUnlocked({},1),false);
  assert.equal(practiceUnlocked({1:{completed:false}},1),false);
  assert.equal(submitPractice(book,{},1,'standard'),'locked');
  assert.equal(setPracticeAnswer(book,{},1,'standard','action','verify'),false);
  assert.equal(setPracticeAnswer(book,completed,1,'standard','__proto__','verify'),false);
  assert.equal(setPracticeAnswer(book,completed,1,'standard','action','injected'),false);
  assert.equal(setPracticeAnswer(book,completed,999,'standard','action','verify'),false);
  assert.deepEqual(book,{});
});

test('Incomplete answers and repeated submissions do not inflate attempt counts',()=>{
  const book:PracticeBook={};
  assert.equal(submitPractice(book,completed,1,'standard'),'incomplete');
  assert.deepEqual(book,{});
  setPracticeAnswer(book,completed,1,'standard','action','allow');
  assert.equal(submitPractice(book,completed,1,'standard'),'incomplete');
  assert.equal(book[1].attempts,0);assert.equal(book[1].firstCorrect,null);
  setPracticeAnswer(book,completed,1,'standard','reason','authority');
  assert.equal(submitPractice(book,completed,1,'standard'),'incorrect');
  assert.equal(submitPractice(book,completed,1,'standard'),'incorrect');
  assert.equal(book[1].attempts,1);assert.equal(book[1].firstCorrect,false);
  assert.equal(book[1].solved,false);
  assert.deepEqual(practiceFeedback(practiceCase(1,'standard')!,book[1].submitted!).map(f=>f.correct),[false,true]);
});

test('Correction preserves the first result and solved cases cannot rewrite their evidence',()=>{
  const book:PracticeBook={1:{...emptyPracticeProgress(),answers:{action:'allow',reason:'camera'}}};
  assert.equal(submitPractice(book,completed,1,'standard'),'incorrect');
  for(const [id,value] of Object.entries(answers(1,'standard')))setPracticeAnswer(book,completed,1,'standard',id,value);
  assert.equal(submitPractice(book,completed,1,'standard'),'solved');
  assert.equal(book[1].attempts,2);assert.equal(book[1].firstCorrect,false);
  const before=structuredClone(book);
  assert.equal(setPracticeAnswer(book,completed,1,'standard','action','allow'),false);
  assert.equal(submitPractice(book,completed,1,'standard'),'already-solved');
  assert.deepEqual(book,before);
  assert.deepEqual(parsePractice(book,'standard',completed),book);
});

test('All transfer cases can be solved in every tier without altering campaign scores or active missions',()=>{
  const save=emptySave();
  for(const tier of TIERS){
    const target=profile(save,tier);target.best=structuredClone(completed);
    target.active=newRun(6,'hard',tier,true);act(target.active,'patches','official');
    const campaign=JSON.stringify({best:target.best,active:target.active});
    const total=totalLearning(save,tier);
    for(const {level} of PRACTICE_CASES){
      for(const [id,value] of Object.entries(answers(level,tier)))assert.equal(setPracticeAnswer(target.practice,target.best,level,tier,id,value),true);
      assert.equal(submitPractice(target.practice,target.best,level,tier),'solved');
      assert.equal(target.practice[level].firstCorrect,true);
    }
    assert.equal(totalLearning(save,tier),total);
    assert.equal(JSON.stringify({best:target.best,active:target.active}),campaign);
    const summary=practiceSummary(target.practice,target.best);
    assert.equal(summary.solved,PRACTICE_CASES.length);assert.equal(summary.firstTry,PRACTICE_CASES.length);assert.equal(summary.next,undefined);assert.deepEqual(summary.review,[]);
  }
  assert.deepEqual(parseSave(JSON.stringify(save)),save);
});

test('Existing schema 1 and schema 2 saves retain their campaign and gain empty practice records',()=>{
  const old={schema:1,settings:{difficulty:'relaxed'},best:{1:completed[1]},active:newRun(2,'relaxed')};
  const migrated=parseSave(JSON.stringify(old));
  assert.deepEqual(profile(migrated).best,old.best);assert.deepEqual(profile(migrated).active,old.active);assert.deepEqual(profile(migrated).practice,{});
  const previous=JSON.parse(JSON.stringify(emptySave()));
  previous.profiles.expert.best=completed;
  previous.profiles.expert.active=newRun(8,'easy','expert');
  for(const tier of TIERS)delete previous.profiles[tier].practice;
  const restored=parseSave(JSON.stringify(previous));
  assert.deepEqual(profile(restored,'expert').best,completed);
  assert.deepEqual(profile(restored,'expert').active,previous.profiles.expert.active);
  for(const tier of TIERS)assert.deepEqual(profile(restored,tier).practice,{});
});

test('Drafts, previous feedback and independent tier records survive reload',()=>{
  const save=emptySave();
  for(const tier of TIERS)profile(save,tier).best=structuredClone(completed);
  const junior=profile(save,'junior'),expert=profile(save,'expert');
  setPracticeAnswer(junior.practice,junior.best,2,'junior','action','roles');
  for(const [id,value] of Object.entries({...answers(2,'expert'),limit:'public'}))setPracticeAnswer(expert.practice,expert.best,2,'expert',id,value);
  submitPractice(expert.practice,expert.best,2,'expert');
  setPracticeAnswer(expert.practice,expert.best,2,'expert','limit','separate');
  const restored=parseSave(JSON.stringify(save));
  assert.deepEqual(restored,save);
  assert.equal(profile(restored,'junior').practice[2].attempts,0);
  assert.equal(profile(restored,'expert').practice[2].submitted!.limit,'public');
  assert.equal(profile(restored,'expert').practice[2].answers.limit,'separate');
  assert.deepEqual(profile(restored,'standard').practice,{});
  const target=profile(restored,'expert');submitPractice(target.practice,target.best,2,'expert');
  assert.equal(target.practice[2].firstCorrect,false);assert.equal(target.practice[2].solved,true);
});

test('Saved records discard invalid choices and require a complete correct submission for solved status',()=>{
  for(const bad of [null,4,[],false,'bad'])assert.deepEqual(parsePractice(bad,'junior',completed),{});
  const malformed={
    1:{answers:{action:'verify',reason:'camera',limit:'injected'},submitted:{action:'allow',reason:'camera'},solved:true,firstCorrect:true,attempts:-6},
    2:{answers:{action:'roles',reason:'need'},submitted:{action:'roles'},solved:true,attempts:100},
    3:{answers:{action:'separate'},submitted:answers(3,'junior'),attempts:Infinity},
    12:{answers:answers(12,'junior'),submitted:answers(12,'junior'),solved:true},
    999:{solved:true}
  };
  const partialBest={1:completed[1],2:completed[2],3:completed[3]};
  const clean=parsePractice(malformed,'junior',partialBest);
  assert.equal(clean[1].solved,false);assert.equal(clean[1].firstCorrect,false);assert.equal(clean[1].attempts,1);
  assert.equal(clean[1].answers.limit,undefined);
  assert.equal(clean[2].solved,false);assert.equal(clean[2].submitted,null);assert.equal(clean[2].attempts,0);
  assert.equal(clean[3].solved,true);assert.equal(clean[3].attempts,1);assert.deepEqual(clean[3].answers,answers(3,'junior'));
  assert.equal(clean[12],undefined);assert.equal(clean[999],undefined);
  assert.deepEqual(parsePractice(clean,'junior',partialBest),clean);
});

test('Summary prioritizes unfinished corrections and retains recommendations after a correction succeeds',()=>{
  const book:PracticeBook={5:{...emptyPracticeProgress(),answers:{...answers(5,'standard'),action:'password'}}};
  submitPractice(book,completed,5,'standard');
  assert.equal(practiceSummary(book,completed).next,5);
  setPracticeAnswer(book,completed,5,'standard','action','revoke');submitPractice(book,completed,5,'standard');
  const summary=practiceSummary(book,completed);
  assert.equal(summary.next,1);assert.equal(summary.solved,1);assert.equal(summary.firstTry,0);assert.deepEqual(summary.review,[5]);
});
