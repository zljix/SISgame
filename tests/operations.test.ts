import test from 'node:test';
import assert from 'node:assert/strict';
import { act, assessRisks, CHECKS, newRun, nextTarget, planIncidentResponse, planRiskMeasures, score, submitExpertReview, type Run } from '../src/core.ts';
import { EXPERT_REVIEWS, JUNIOR_CHOICES, JUNIOR_REPORTS, TIERS } from '../src/curriculum.ts';
import { DECISIONS, VERIFICATION_REPORTS } from '../src/missions.ts';
import { budgetFor, cleanResponse, measuresFor, priorityFor, responsePreview, riskPreview, risksFor } from '../src/operations.ts';
import { emptySave, parseSave, profile, recordBest, totalLearning } from '../src/storage.ts';

const priorities={archive:'high',account:'medium',poster:'low'};
const response=['contain','recover','verify'];
function prepareRisk(run:Run){act(run,'assets','context');assessRisks(run,priorities);}
function prepareIncident(run:Run){act(run,'incident-report','facts');planIncidentResponse(run,response);}

test('Risk assessment requires an inventory and distinguishes incomplete work from wrong priorities',()=>{
  const run=newRun(11);
  assert.equal(assessRisks(run,priorities).ok,false);
  assert.equal(planRiskMeasures(run,['backup','accounts']).ok,false);
  assert.equal(act(run,'assets','price').ok,false);
  assert.equal(act(run,'assets','hardware').ok,false);
  act(run,'assets','context');
  assert.equal(assessRisks(run,{archive:'high'}).ok,false);
  assert.equal(assessRisks(run,{...priorities,account:'unknown'}).ok,false);
  assert.equal(run.checks['risk-analysis'].errors,0);
  assert.equal(assessRisks(run,{...priorities,archive:'low'}).ok,false);
  assert.equal(run.checks['risk-analysis'].errors,1);
  assert.equal(assessRisks(run,priorities).ok,true);
  assert.equal(score(run),50);assert.equal(nextTarget(run),'risk-plan');
  assert.deepEqual([priorityFor(1,2),priorityFor(2,2),priorityFor(2,3)],['low','medium','high']);
});

test('A limited plan must protect important assets, not just spend its budget',()=>{
  const run=newRun(11);prepareRisk(run);
  assert.equal(planRiskMeasures(run,[]).ok,false);assert.equal(run.checks['risk-plan'].errors,0);
  assert.equal(planRiskMeasures(run,['backup','accounts','design']).ok,false,'over budget');
  assert.equal(planRiskMeasures(run,['accounts','ups','design']).ok,false,'spending five units without a backup');
  assert.equal(planRiskMeasures(run,['backup','ups']).ok,false,'missing account protection');
  assert.equal(planRiskMeasures(run,['backup']).ok,false,'a needed second measure remains affordable');
  assert.equal(act(run,'risk-test','test').ok,false);
  assert.equal(planRiskMeasures(run,['backup','accounts']).ok,true);
  assert.equal(run.checks['risk-plan'].errors,4);
  assert.equal(act(run,'risk-test','test').ok,true);assert.equal(score(run),100);
});

test('Preview models reduced consequences rather than claiming the disk cannot fail',()=>{
  const before=riskPreview('standard',[]),after=riskPreview('standard',['backup','accounts']);
  assert.equal(after.cost,5);
  assert.deepEqual(before.rows.map(row=>row.before),['high','medium','low']);
  assert.deepEqual(after.rows.map(row=>row.after),['medium','low','low']);
  assert.match(after.rows[0].detail,/Kvar je i dalje moguć/);
  assert.deepEqual(riskPreview('standard',['ups','design']).rows.map(row=>row.after),['high','medium','low']);
  assert.equal(riskPreview('standard',['backup','backup','unknown']).cost,3,'no duplicate cost or unknown discount');
});

test('Junior has two risk cases, a three-unit plan and a prepared middle response step',()=>{
  assert.equal(risksFor('junior').length,2);assert.equal(measuresFor('junior').length,2);assert.equal(budgetFor('junior'),3);
  const run=newRun(11,'hard','junior');act(run,'assets','context');
  assert.equal(assessRisks(run,{archive:'high',poster:'low'}).ok,true);
  assert.equal(planRiskMeasures(run,['backup','design']).ok,false);
  assert.equal(planRiskMeasures(run,['backup']).ok,true);
  assert.equal(score(run),75);
  assert.deepEqual(newRun(12,'relaxed','junior').responseOrder,['','recover','']);
  const incident=newRun(12,'relaxed','junior');act(incident,'incident-report','facts');
  assert.equal(planIncidentResponse(incident,['contain','','verify']).ok,true);
  assert.deepEqual(incident.responseOrder,response);
});

test('An incident plan cannot skip containment, reuse one step, erase evidence or reconnect too early',()=>{
  const run=newRun(12);assert.equal(planIncidentResponse(run,response).ok,false);
  assert.equal(act(run,'incident-report','blame').ok,false);act(run,'incident-report','facts');
  assert.equal(planIncidentResponse(run,['contain','','']).ok,false);
  assert.equal(run.checks['response-plan'].errors,0);
  for(const order of [['recover','contain','verify'],['contain','contain','verify'],['contain','verify','recover'],['erase','recover','verify']]){
    assert.equal(planIncidentResponse(run,order).ok,false);
  }
  assert.equal(run.checks['response-plan'].errors,4);
  assert.equal(act(run,'recovery-source','verified').ok,false);
  assert.equal(planIncidentResponse(run,response).ok,true);
  assert.equal(act(run,'recovery-source','newest').ok,false);
  assert.equal(act(run,'recovery-source','silent').ok,false);
  assert.equal(act(run,'incident-test','test').ok,false);
  assert.equal(act(run,'recovery-source','verified').ok,true);
  assert.equal(act(run,'incident-test','test').ok,true);assert.equal(score(run),100);
});

test('The response preview does not turn premature recovery or erased evidence into a safe result',()=>{
  assert.equal(responsePreview(['contain','recover','verify']).verified,true);
  const premature=responsePreview(['recover','contain','verify']);assert.equal(premature.verified,false);assert.equal(premature.steps[0].ok,false);
  const erased=responsePreview(['erase','contain','verify']);assert.equal(erased.evidenceLost,true);assert.equal(erased.verified,false);assert.equal(erased.steps[1].ok,false);
  assert.equal(responsePreview(['contain','verify','recover']).verified,false);
  assert.deepEqual(cleanResponse(['contain','bogus','verify'],'standard'),['contain','','verify']);
});

test('New drafts survive reload with corrections and reject unknown keys without damaging existing progress',()=>{
  for(const tier of TIERS)for(const level of [11,12]){
    const save=emptySave();save.settings.content=tier;
    profile(save,tier).best[10]={learning:100,arcade:25,independent:4,completed:true};
    const run=newRun(level,'relaxed',tier);
    if(level===11){act(run,'assets','context');assessRisks(run,{archive:'low',poster:'low',account:'low'});run.riskMeasures=['design'];}
    else{act(run,'incident-report','facts');planIncidentResponse(run,['erase','recover','verify']);}
    profile(save,tier).active=run;recordBest(save,run);
    assert.deepEqual(parseSave(JSON.stringify(save)),save);
  }
  const save=emptySave(),run=newRun(11);profile(save).active=run;
  (run as any).riskAnswers={archive:'high',account:'invalid',injected:'high'};run.riskMeasures=['backup','backup','injected'];
  const parsed=profile(parseSave(JSON.stringify(save))).active!;
  assert.deepEqual(parsed.riskAnswers,{archive:'high'});assert.deepEqual(parsed.riskMeasures,['backup']);
  (run as any).riskMeasures={bad:true};assert.deepEqual(profile(parseSave(JSON.stringify(save))).active!.riskMeasures,[]);
});

test('Version 0.4 progress and an interrupted Wi-Fi mission gain safe defaults without losing results',()=>{
  const old=emptySave();
  for(const tier of TIERS){const run:any=newRun(10,'medium',tier);delete run.riskAnswers;delete run.riskMeasures;delete run.responseOrder;
    run.wifiSettings={security:'wpa3',guests:'isolated'};profile(old,tier).active=run;
    profile(old,tier).best[10]={learning:100,arcade:35,independent:3,completed:true};
  }
  const restored=parseSave(JSON.stringify(old));
  for(const tier of TIERS){assert.deepEqual(profile(restored,tier).best,profile(old,tier).best);const run=profile(restored,tier).active!;
    assert.equal(run.level,10);assert.deepEqual(run.wifiSettings,{security:'wpa3',guests:'isolated'});assert.deepEqual(run.riskAnswers,{});assert.deepEqual(run.riskMeasures,[]);
    assert.equal(totalLearning(restored,tier),100);
  }
});

test('Risk and response consoles cannot mutate other missions or completed learning tasks',()=>{
  assert.equal(assessRisks(newRun(12),priorities).ok,false);
  assert.equal(planRiskMeasures(newRun(12),['backup']).ok,false);
  assert.equal(planIncidentResponse(newRun(11),response).ok,false);
  for(const level of [11,12]){
    const run=newRun(level),save=emptySave();
    if(level===11){prepareRisk(run);planRiskMeasures(run,['backup','accounts']);}
    else{prepareIncident(run);act(run,'recovery-source','verified');}
    const before=structuredClone(run);
    assessRisks(run,{});planRiskMeasures(run,['design']);planIncidentResponse(run,['erase']);assert.deepEqual(run,before);
    for(let i=0;i<3;i++){act(run,CHECKS[level][3],'test');recordBest(save,run);}assert.equal(totalLearning(save),100);
    act(run,'exit','finish');const finished=structuredClone(run);
    assessRisks(run,{});planRiskMeasures(run,['design']);planIncidentResponse(run,['erase']);assert.deepEqual(run,finished);
  }
});

test('Both new Expert cases preserve incorrect decisions and require analysis before the final check',()=>{
  for(const level of [11,12]){
    const run=newRun(level,'hard','expert'),review=EXPERT_REVIEWS[level];
    if(level===11){prepareRisk(run);planRiskMeasures(run,['backup','accounts']);}
    else{prepareIncident(run);act(run,'recovery-source','verified');}
    assert.equal(act(run,review.station,'test').review,true);
    const answers=Object.fromEntries(review.questions.map(q=>[q.id,q.answer]));
    const first=review.questions[0];answers[first.id]=first.choices.find(([id])=>id!==first.answer)![0];
    assert.equal(submitExpertReview(run,answers).ok,false);assert.equal(run.checks[review.station].errors,1);
    const save=emptySave();profile(save,'expert').active=run;const restored=profile(parseSave(JSON.stringify(save)),'expert').active!;
    assert.deepEqual(restored.review.answers,answers);answers[first.id]=first.answer;
    assert.equal(submitExpertReview(restored,answers).ok,true);assert.equal(act(restored,review.station,'test').ok,true);
    assert.equal(score(restored),100);assert.equal(restored.checks[review.station].errors,1);
  }
});

test('Both new missions include usable Junior decisions and verification reports',()=>{
  for(const level of [11,12]){
    for(const [key,decision] of Object.entries(DECISIONS).filter(([,d])=>d.level===level)){
      const simple=JUNIOR_CHOICES[key];assert.ok(simple);assert.ok(simple.options.length<=2);
      assert.ok(simple.options.some(([id])=>id===decision.correct));
      for(const [id] of simple.options)assert.ok(decision.options.some(option=>option.id===id));
    }
    assert.equal(VERIFICATION_REPORTS[CHECKS[level][3]].length,4);assert.equal(JUNIOR_REPORTS[CHECKS[level][3]].length,4);
  }
});
