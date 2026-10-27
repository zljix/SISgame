import test from 'node:test';
import assert from 'node:assert/strict';
import { act, collect, newRun, score } from '../src/core.ts';
import { LEVELS } from '../src/data.ts';
import { MISSION_GUIDES, missionOutcome, missionSteps } from '../src/learning.ts';

test('each mission connects all four live checkpoints to outcomes, an example and explanation',()=>{
  for(const level of LEVELS){
    const guide=MISSION_GUIDES[level.id];
    assert.ok(guide);
    for(const tier of ['junior','standard','expert'] as const){
      const run=newRun(level.id,'relaxed',tier);
      assert.ok(missionOutcome(level.id,tier).length>30);
      assert.deepEqual(missionSteps(run).map(s=>s.key),Object.keys(run.checks));
      assert.deepEqual(missionSteps(run).map(s=>s.state),['current','later','later','later']);
    }
    for(const text of Object.values(guide.example))assert.ok(text.length>10);
    assert.ok(guide.reflection.question.endsWith('?'));
    assert.ok(guide.reflection.answer.length>40);
    assert.ok(guide.juniorOutcome.length<=guide.outcome.length+10);
  }
});

test('a plan follows real progress and never marks a wrong decision as completed',()=>{
  const run=newRun(1);
  collect(run,'card');act(run,'door','camera');
  assert.equal(missionSteps(run)[0].state,'current');assert.equal(score(run),0);
  act(run,'door','authorized');
  assert.deepEqual(missionSteps(run).map(s=>s.state),['done','current','later','later']);
  act(run,'ups','server');collect(run,'paper');act(run,'shred','destroy');act(run,'drill','test');
  assert.equal(score(run),100);assert.ok(missionSteps(run).every(s=>s.state==='done'));
});
