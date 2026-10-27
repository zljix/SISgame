import test from 'node:test';
import assert from 'node:assert/strict';
import { act, CHECKS, CHECK_NAMES, classifyAlerts, configureWifi, newRun, nextTarget, score, submitExpertReview } from '../src/core.ts';
import { EXPERT_REVIEWS, JUNIOR_CHOICES, JUNIOR_LESSONS, JUNIOR_REPORTS, TERMS, TIERS } from '../src/curriculum.ts';
import { LEVELS, missionNumber } from '../src/data.ts';
import { DECISIONS, VERIFICATION_REPORTS } from '../src/missions.ts';
import { alertsFor, verdictsFor, wifiPreview, type WifiSettings } from '../src/network.ts';
import { emptySave, parseSave, profile, recordBest, totalLearning } from '../src/storage.ts';

const correctAlerts={maintenance:'expected',compromised:'incident',probe:'investigate'};

test('IDS and Wi-Fi content has all four steps, Junior choices, terms and Expert cases',()=>{
  for(const level of LEVELS){
    assert.ok(JUNIOR_LESSONS[level.id]);assert.ok(TERMS[level.id]);assert.equal(EXPERT_REVIEWS[level.id].questions.length,3);
    for(const key of CHECKS[level.id])assert.ok(CHECK_NAMES[key],key);
  }
  for(const level of [9,10]){
    for(const [station,decision] of Object.entries(DECISIONS).filter(([,d])=>d.level===level)){
      assert.ok(JUNIOR_CHOICES[station]);assert.ok(JUNIOR_CHOICES[station].options.length<=2);
      for(const [id] of JUNIOR_CHOICES[station].options)assert.ok(decision.options.some(o=>o.id===id));
      assert.ok(JUNIOR_CHOICES[station].options.some(([id])=>id===decision.correct));
    }
    const final=CHECKS[level][3];assert.equal(VERIFICATION_REPORTS[final].length,4);assert.equal(JUNIOR_REPORTS[final].length,4);
  }
  assert.equal(missionNumber(9),'09');assert.equal(missionNumber(10),'10');
});

test('Alert analysis requires the sensor lesson, complete evidence and correct conclusions',()=>{
  const run=newRun(9);
  assert.equal(classifyAlerts(run,correctAlerts).ok,false);
  assert.equal(act(run,'sensors','auto').ok,false);assert.equal(act(run,'sensors','perfect').ok,false);
  assert.equal(act(run,'sensors','compare').ok,true);
  assert.equal(classifyAlerts(run,{maintenance:'expected'}).ok,false);assert.equal(run.checks.alerts.errors,0);
  assert.equal(classifyAlerts(run,{...correctAlerts,maintenance:'incident'}).ok,false);
  assert.equal(classifyAlerts(run,{...correctAlerts,compromised:'expected'}).ok,false);
  assert.equal(classifyAlerts(run,{...correctAlerts,probe:'incident'}).ok,false);
  assert.equal(classifyAlerts(run,{...correctAlerts,probe:'expected'}).ok,false);
  assert.equal(run.checks.alerts.errors,4);
  assert.equal(act(run,'response','targeted').ok,false);
  assert.equal(classifyAlerts(run,correctAlerts).ok,true);assert.equal(score(run),50);
  assert.equal(act(run,'response','all').ok,false);assert.equal(act(run,'response','disable').ok,false);
  assert.equal(act(run,'detection-test','test').ok,false);
  assert.equal(act(run,'response','targeted').ok,true);assert.equal(act(run,'detection-test','test').ok,true);
  assert.equal(nextTarget(run),'exit');assert.equal(act(run,'exit','finish').complete,true);
});

test('Junior alert workload is smaller without changing the security decision',()=>{
  const run=newRun(9,'hard','junior');act(run,'sensors','compare');
  assert.equal(alertsFor('junior').length,2);assert.equal(verdictsFor('junior').length,2);
  assert.equal(classifyAlerts(run,{maintenance:'expected',compromised:'incident'}).ok,true);
  const standard=newRun(9,'relaxed');act(standard,'sensors','compare');
  assert.equal(classifyAlerts(standard,{maintenance:'expected',compromised:'incident'}).ok,false);
  assert.equal(standard.checks.alerts.errors,0);
});

test('Wi-Fi rules preserve internet while blocking internal access; WEP and open networks fail',()=>{
  const run=newRun(10);
  assert.equal(configureWifi(run,{security:'wpa3',guests:'isolated'}).ok,false);
  assert.equal(act(run,'wifi-identity','name').ok,false);assert.equal(act(run,'wifi-identity','strongest').ok,false);
  act(run,'wifi-identity','known');
  assert.equal(configureWifi(run,{security:'wpa3',guests:''}).ok,false);assert.equal(run.checks['wifi-config'].errors,0);
  for(const settings of [{security:'wep',guests:'isolated'},{security:'open',guests:'isolated'},{security:'wpa3',guests:'blocked'},{security:'wpa3',guests:'internal'}] as WifiSettings[]){
    assert.equal(configureWifi(run,settings).ok,false);
  }
  assert.equal(run.checks['wifi-config'].errors,4);
  assert.equal(act(run,'wifi-maintenance','maintain').ok,false);assert.equal(act(run,'wifi-test','test').ok,false);
  assert.equal(configureWifi(run,{security:'wpa3',guests:'isolated'}).ok,true);
  assert.equal(act(run,'wifi-maintenance','hide').ok,false);assert.equal(act(run,'wifi-maintenance','rename').ok,false);
  act(run,'wifi-maintenance','maintain');assert.equal(act(run,'wifi-test','test').ok,true);assert.equal(score(run),100);
});

test('Wi-Fi preview shows actual chosen access, including unsafe and unavailable configurations',()=>{
  assert.deepEqual(wifiPreview({security:'wpa3',guests:'isolated'}),{protectedRadio:true,guestInternet:true,guestInternal:false});
  assert.deepEqual(wifiPreview({security:'open',guests:'internal'}),{protectedRadio:false,guestInternet:true,guestInternal:true});
  assert.deepEqual(wifiPreview({security:'wep',guests:'blocked'}),{protectedRadio:false,guestInternet:false,guestInternal:false});
  const run=newRun(10,'relaxed','junior');act(run,'wifi-identity','known');
  assert.equal(configureWifi(run,{security:'',guests:'isolated'}).ok,true);assert.equal(run.wifiSettings.security,'wpa3');
});

test('New console drafts survive reload separately for each tier without importing unknown keys',()=>{
  for(const level of [9,10]){
    const save=emptySave();
    for(const tier of TIERS){const run=newRun(level,'relaxed',tier);
      if(level===9){act(run,'sensors','compare');classifyAlerts(run,{maintenance:'incident'});}
      else{act(run,'wifi-identity','known');configureWifi(run,{security:tier==='junior'?'wpa3':'wep',guests:'internal'});}
      profile(save,tier).active=run;recordBest(save,run);
    }
    const restored=parseSave(JSON.stringify(save));assert.deepEqual(restored,save);
  }
  const save=emptySave(),run=newRun(9);run.alertAnswers={maintenance:'expected',injected:'incident'};profile(save).active=run;
  assert.deepEqual(profile(parseSave(JSON.stringify(save))).active!.alertAnswers,{maintenance:'expected'});
  profile(save).active=newRun(10);(profile(save).active as any).wifiSettings={security:'obsolete',guests:'invalid'};
  assert.deepEqual(profile(parseSave(JSON.stringify(save))).active!.wifiSettings,{security:'',guests:''});
});

test('v0.3 saves retain existing campaigns and can proceed to mission nine',()=>{
  const old=emptySave();for(const tier of TIERS){profile(old,tier).best[8]={learning:100,arcade:10,independent:4,completed:true};const a:any=newRun(8,'hard',tier);delete a.alertAnswers;delete a.wifiSettings;profile(old,tier).active=a;}
  const restored=parseSave(JSON.stringify(old));
  for(const tier of TIERS){assert.deepEqual(profile(restored,tier).best,profile(old,tier).best);assert.equal(profile(restored,tier).active!.level,8);assert.deepEqual(profile(restored,tier).active!.alertAnswers,{});assert.equal(totalLearning(restored,tier),100);}
  assert.equal(LEVELS.find(level=>level.id===9)!.id,9);assert.equal(profile(restored).best[8].completed,true);
});

test('Expert cases require correct new evidence and preserve corrections after reload',()=>{
  for(const level of [9,10]){const run=newRun(level,'relaxed','expert');
    if(level===9){act(run,'sensors','compare');classifyAlerts(run,correctAlerts);act(run,'response','targeted');}
    else{act(run,'wifi-identity','known');configureWifi(run,{security:'wpa3',guests:'isolated'});act(run,'wifi-maintenance','maintain');}
    const review=EXPERT_REVIEWS[level],final=CHECKS[level][3];assert.equal(act(run,final,'test').review,true);assert.equal(score(run),75);
    const answers=Object.fromEntries(review.questions.map(q=>[q.id,q.answer]));
    const first=review.questions[0];answers[first.id]=first.choices.find(([id])=>id!==first.answer)![0];
    assert.equal(submitExpertReview(run,answers).ok,false);assert.equal(run.checks[final].errors,1);
    const save=emptySave();profile(save,'expert').active=run;const restored=profile(parseSave(JSON.stringify(save)),'expert').active!;
    assert.deepEqual(restored.review.answers,answers);answers[first.id]=first.answer;
    assert.equal(submitExpertReview(restored,answers).ok,true);assert.equal(act(restored,final,'test').ok,true);
    assert.equal(restored.checks[final].errors,1);assert.equal(score(restored),100);
  }
});

test('New consoles reject wrong missions and cannot change already completed tasks',()=>{
  assert.equal(classifyAlerts(newRun(10),correctAlerts).ok,false);
  assert.equal(configureWifi(newRun(9),{security:'wpa3',guests:'isolated'}).ok,false);
  for(const level of [9,10]){const run=newRun(level),save=emptySave();
    if(level===9){act(run,'sensors','compare');classifyAlerts(run,correctAlerts);}
    else{act(run,'wifi-identity','known');configureWifi(run,{security:'wpa3',guests:'isolated'});}
    const before=structuredClone(run);recordBest(save,run);
    assert.equal(level===9?classifyAlerts(run,{}).ok:configureWifi(run,{security:'open',guests:'internal'}).ok,false);
    assert.deepEqual(run,before);recordBest(save,run);assert.equal(totalLearning(save),50);
    act(run,level===9?'response':'wifi-maintenance',level===9?'targeted':'maintain');act(run,CHECKS[level][3],'test');act(run,'exit','finish');
    const finished=structuredClone(run);classifyAlerts(run,correctAlerts);configureWifi(run,{security:'wpa3',guests:'isolated'});assert.deepEqual(run,finished);
  }
});
