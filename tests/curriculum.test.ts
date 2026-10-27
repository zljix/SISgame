import test from 'node:test';
import assert from 'node:assert/strict';
import { act, advanceReviewClock, applyPermissions, arcadeScore, CHECKS, classifyAlerts, classifyMalware, collect, configureFirewall, configureServices, configureWifi, has, newRun, ready, score, secureSession, submitExpertReview, type Run } from '../src/core.ts';
import { LEVELS } from '../src/data.ts';
import { EXPERT_REVIEWS, TIERS } from '../src/curriculum.ts';
import { eventsFor, flowsFor, samplesFor, servicesFor } from '../src/missions.ts';
import { emptySave, parseSave, profile, recordBest, totalLearning } from '../src/storage.ts';

function prepare(run:Run){
  switch(run.level){
    case 1: collect(run,'card');act(run,'door','authorized');act(run,'ups','server');collect(run,'paper');act(run,'shred','destroy');break;
    case 2: applyPermissions(run,'schedule',{student:'read',teacher:'write',guest:'read'});applyPermissions(run,'grades',{student:'none',teacher:'write',guest:'none'});collect(run,'secret');act(run,'encrypt','encrypt');break;
    case 3: for(const id of ['rad','mjerenja','nacrt'])collect(run,id);act(run,'backup','separate');act(run,'failure','simulate');act(run,'backup','restore');break;
    case 4: act(run,'containment','isolate');classifyMalware(run,{a:'trojan',b:'worm',c:'virus'});act(run,'recovery','rebuild');break;
    case 5: secureSession(run,'unknown','revoke');act(run,'identity','unique');act(run,'mfa','key');break;
    case 6: act(run,'patches','official');act(run,'accounts','standard');configureServices(run,{updates:true,coursework:true,remote:false});break;
    case 7: act(run,'message','inspect');act(run,'verify-sender','known');act(run,'report','report');break;
    case 8: act(run,'channel','https');configureFirewall(run,{web:true,admin:true,outside:false});act(run,'tls','stop');break;
    case 9: act(run,'sensors','compare');classifyAlerts(run,{maintenance:'expected',compromised:'incident',probe:'investigate'});act(run,'response','targeted');break;
    case 10: act(run,'wifi-identity','known');configureWifi(run,{security:'wpa3',guests:'isolated'});act(run,'wifi-maintenance','maintain');break;
  }
}
const finalChoice=(level:number)=>level===2||level===3?'verify':'test';
const answers=(level:number)=>Object.fromEntries(EXPERT_REVIEWS[level].questions.map(q=>[q.id,q.answer]));

test('All campaign missions can be completed in all three content tiers, with required Expert analysis',()=>{
  for(const tier of TIERS)for(let level=1;level<=LEVELS.length;level++){
    const run=newRun(level,'relaxed',tier);prepare(run);
    const station=CHECKS[level][3];assert.equal(score(run),75,`${tier}/${level} preparation`);
    if(tier==='expert'){
      assert.equal(act(run,station,finalChoice(level)).review,true);
      assert.equal(score(run),75);assert.equal(ready(run),false);
      assert.equal(submitExpertReview(run,answers(level)).ok,true);
    }
    assert.equal(act(run,station,finalChoice(level)).ok,true,`${tier}/${level} final`);
    assert.equal(score(run),100);assert.equal(act(run,'exit','finish').complete,true);
  }
});

test('Expert delivery cannot bypass its case by completing folder permissions later',()=>{
  const run=newRun(2,'easy','expert');
  applyPermissions(run,'grades',{student:'none',teacher:'write',guest:'none'});collect(run,'secret');act(run,'encrypt','encrypt');
  assert.equal(act(run,'deliver','verify').ok,false);assert.equal(run.checks.deliver.done,false);
  applyPermissions(run,'schedule',{student:'read',teacher:'write',guest:'read'});
  assert.equal(act(run,'deliver','verify').review,true);assert.equal(ready(run),false);
});

test('Junior changes task load, while Standard and Expert preserve their evidence',()=>{
  assert.equal(samplesFor('junior').length,2);assert.equal(samplesFor('standard').length,3);
  const junior=newRun(4,'hard','junior'),standard=newRun(4,'relaxed','standard');
  act(junior,'containment','isolate');act(standard,'containment','isolate');
  assert.equal(classifyMalware(junior,{a:'trojan',b:'worm'}).ok,true);
  assert.equal(classifyMalware(standard,{a:'trojan',b:'worm'}).ok,false);
  assert.equal(standard.checks.samples.errors,0);
  assert.deepEqual(TIERS.map(tier=>eventsFor(tier).length),[2,3,4]);
  assert.equal(servicesFor('junior').length,2);assert.equal(flowsFor('junior').length,2);
  const expert=newRun(5,'relaxed','expert');assert.equal(secureSession(expert,'vpn','revoke').ok,false);
  assert.match(secureSession(expert,'vpn','revoke').message,/VPN/);
});

test('Knowledge and independent decisions do not depend on movement speed, collisions or the optional clock',()=>{
  for(const difficulty of ['relaxed','easy','medium','hard'] as const){
    const run=newRun(1,difficulty,'expert',true);prepare(run);
    run.health=1;run.hits=500;run.seconds=99999;run.bits=['bit-0','bit-1'];run.review.started=true;
    advanceReviewClock(run,1000);
    assert.equal(run.review.expired,true);assert.equal(score(run),75);assert.equal(run.checks.drill.errors,0);
    assert.equal(submitExpertReview(run,{first:'save',next:'shutdown',backup:'copy'}).ok,true);
    act(run,'drill','test');assert.equal(score(run),100);assert.equal(arcadeScore(run),10);
    assert.ok(Object.values(run.checks).every(check=>check.errors===0));
  }
});

test('Timer is off by default, starts after reading, and disabling it stops further countdown',()=>{
  const run=newRun(1,'relaxed','expert',true);prepare(run);
  advanceReviewClock(run,45);assert.equal(run.review.remaining,90);
  assert.equal(submitExpertReview(run,answers(1)).ok,false);assert.equal(run.checks.drill.errors,0);
  run.review.started=true;advanceReviewClock(run,12);assert.equal(run.review.remaining,78);
  run.review.enabled=false;advanceReviewClock(run,200);assert.equal(run.review.remaining,78);
  assert.equal(submitExpertReview(run,answers(1)).ok,true);
  assert.equal(newRun(1,'hard','expert').review.enabled,false);
  assert.equal(newRun(1,'hard','junior',true).review.enabled,false);
});

test('Expert feedback distinguishes incomplete work from a corrected decision without awarding extra points',()=>{
  const run=newRun(3,'easy','expert');prepare(run);
  assert.equal(submitExpertReview(run,{}).ok,false);assert.equal(run.checks.verify.errors,0);
  assert.equal(submitExpertReview(run,{source:'b',loss:'lost',proof:'open'}).ok,false);
  assert.equal(run.checks.verify.errors,1);assert.equal(score(run),75);assert.equal(has(run,'expert-review'),false);
  assert.equal(submitExpertReview(run,{source:'a',loss:'lost',proof:'open'}).ok,true);
  assert.equal(score(run),75);assert.equal(act(run,'verify','verify').ok,true);assert.equal(score(run),100);
});

test('Phishing needs independent verification and a safe report before legitimate work resumes',()=>{
  const run=newRun(7);assert.equal(act(run,'report','report').ok,false);
  assert.equal(act(run,'message','trust').ok,false);act(run,'message','inspect');
  assert.equal(act(run,'verify-sender','reply').ok,false);act(run,'verify-sender','known');
  assert.equal(act(run,'report','share').ok,false);assert.equal(act(run,'phish-test','test').ok,false);
  act(run,'report','report');assert.equal(act(run,'phish-test','test').ok,true);
  assert.equal(score(run),100);assert.equal(run.checks.message.errors,1);
});

test('Firewall rejects all-open and all-closed rules and certificate warnings cannot be bypassed',()=>{
  const run=newRun(8);assert.equal(configureFirewall(run,{web:true,admin:true}).ok,false);
  assert.equal(act(run,'channel','http').ok,false);act(run,'channel','https');
  assert.equal(configureFirewall(run,{web:false,admin:false,outside:false}).ok,false);
  assert.equal(run.networkRules.web,false);
  assert.equal(configureFirewall(run,{web:true,admin:true,outside:true}).ok,false);
  assert.equal(run.networkRules.outside,true);
  assert.equal(act(run,'network-test','test').ok,false);
  assert.equal(configureFirewall(run,{web:true,admin:true,outside:false}).ok,true);
  assert.equal(act(run,'tls','bypass').ok,false);assert.equal(act(run,'tls','stop').ok,true);
  assert.equal(act(run,'network-test','test').ok,true);assert.equal(score(run),100);
});

test('Switching content preserves three independent campaigns, active runs and best results',()=>{
  const save=emptySave();save.settings.content='expert';save.settings.difficulty='relaxed';save.settings.timed=true;
  for(const tier of TIERS){const run=newRun(8,'relaxed',tier,true);act(run,'channel','https');
    if(tier==='expert'){configureFirewall(run,{web:true,admin:true,outside:false});run.review.started=true;run.review.answers={web:'443',ssh:'world'};advanceReviewClock(run,32);}
    profile(save,tier).active=run;recordBest(save,run);
  }
  const restored=parseSave(JSON.stringify(save));assert.deepEqual(restored,save);
  assert.equal(totalLearning(restored),50);restored.settings.content='junior';assert.equal(totalLearning(restored),25);
  assert.equal(profile(restored,'expert').active!.review.remaining,58);
  assert.equal(profile(restored,'expert').active!.networkRules.outside,false);
  assert.deepEqual(profile(restored,'expert').active!.review.answers,{web:'443',ssh:'world'});
  profile(restored,'junior').best[8].learning=100;
  assert.equal(profile(restored,'standard').best[8].learning,25);
  assert.equal(profile(restored,'expert').best[8].learning,50);
});
