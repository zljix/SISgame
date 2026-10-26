import test from 'node:test';
import assert from 'node:assert/strict';
import { act, CHECKS, classifyMalware, configureServices, newRun, nextTarget, ready, score, secureSession } from '../src/core.ts';
import { LEVELS, TARGET_TEXT, walls } from '../src/data.ts';
import { emptySave, parseSave, profile, recordBest, totalXP } from '../src/storage.ts';

const answers = { a: 'trojan', b: 'worm', c: 'virus' } as const;
const services = { updates: true, remote: false, coursework: true };

test('Every added mission has its own layout and a reachable target for each learning step', () => {
  assert.equal(new Set(LEVELS.slice(3).map(level => [...walls(level.id)].join('|'))).size, LEVELS.length - 3);
  for (const level of LEVELS) {
    const run = newRun(level.id);
    assert.equal(score(run), 0);
    assert.equal(act(run, 'exit', 'finish').ok, false);
    assert.ok(level.stations.some(station => station.id === nextTarget(run)));
    for (const station of level.stations) assert.ok(TARGET_TEXT[station.id], `${level.id}/${station.id}`);
    assert.equal(Object.keys(run.checks).length, 4);
  }
});

test('Malware containment precedes analysis; recovery and return to service cannot be skipped', () => {
  const run = newRun(4);
  assert.equal(classifyMalware(run, answers).ok, false);
  assert.equal(act(run, 'recovery', 'rebuild').ok, false);
  assert.equal(act(run, 'malware-test', 'test').ok, false);
  assert.equal(act(run, 'containment', 'monitor').ok, false);
  assert.equal(act(run, 'containment', 'isolate').ok, true);
  assert.equal(nextTarget(run), 'samples');
  assert.equal(classifyMalware(run, { ...answers, b: '' }).ok, false);
  assert.equal(run.checks.samples.errors, 0, 'incomplete forms are not a wrong decision');
  assert.equal(classifyMalware(run, { ...answers, b: 'virus' }).ok, false);
  assert.equal(run.checks.samples.errors, 1);
  assert.equal(classifyMalware(run, answers).ok, true);
  assert.equal(act(run, 'recovery', 'scan').ok, false);
  assert.equal(act(run, 'recovery', 'restore-all').ok, false);
  assert.equal(act(run, 'recovery', 'rebuild').ok, true);
  assert.equal(ready(run), false);
  assert.equal(act(run, 'malware-test', 'test').ok, true);
  assert.equal(nextTarget(run), 'exit');
  assert.equal(score(run), 100);
  assert.equal(act(run, 'exit', 'finish').complete, true);
});

test('A rejected password is not an open session; log deletion and password-only response leave the incident unresolved', () => {
  const run = newRun(5);
  assert.equal(secureSession(run, '', '').ok, false);
  assert.equal(run.checks.sessions.errors, 0);
  assert.equal(secureSession(run, 'typo', 'revoke').ok, false);
  assert.equal(secureSession(run, 'school', 'revoke').ok, false);
  assert.equal(secureSession(run, 'unknown', 'erase').ok, false);
  assert.equal(secureSession(run, 'unknown', 'password').ok, false);
  assert.equal(score(run), 0);
  assert.equal(nextTarget(run), 'sessions');
  assert.equal(secureSession(run, 'unknown', 'revoke').ok, true);
  assert.equal(nextTarget(run), 'identity');
  assert.equal(run.checks.sessions.errors, 4);
});

test('Account recovery requires new credentials, independent factors and testing before exit', () => {
  const run = newRun(5);
  assert.equal(act(run, 'identity', 'unique').ok, false);
  secureSession(run, 'unknown', 'revoke');
  assert.equal(act(run, 'mfa', 'key').ok, false);
  assert.equal(act(run, 'identity', 'reuse').ok, false);
  assert.equal(act(run, 'identity', 'suffix').ok, false);
  assert.equal(act(run, 'identity', 'unique').ok, true);
  assert.equal(act(run, 'mfa', 'pin').ok, false);
  assert.equal(act(run, 'mfa', 'question').ok, false);
  assert.equal(act(run, 'mfa', 'key').ok, true);
  assert.equal(act(run, 'exit', 'finish').ok, false);
  assert.equal(act(run, 'auth-test', 'test').ok, true);
  assert.equal(score(run), 100);
  assert.equal(act(run, 'exit', 'finish').complete, true);
});

test('Hardening preserves needed services instead of accepting all-on or all-off configurations', () => {
  const run = newRun(6);
  assert.equal(configureServices(run, services).ok, false);
  assert.equal(act(run, 'accounts', 'standard').ok, false);
  assert.equal(act(run, 'patches', 'popup').ok, false);
  assert.equal(act(run, 'patches', 'official').ok, true);
  assert.equal(act(run, 'accounts', 'admin').ok, false);
  assert.equal(act(run, 'accounts', 'deny').ok, false);
  assert.equal(act(run, 'accounts', 'standard').ok, true);
  assert.equal(configureServices(run, { updates: false, remote: false, coursework: false }).ok, false);
  assert.equal(configureServices(run, { updates: true, remote: true, coursework: true }).ok, false);
  assert.equal(configureServices(run, { ...services, coursework: false }).ok, false);
  assert.equal(act(run, 'harden-test', 'test').ok, false);
  assert.equal(configureServices(run, services).ok, true);
  assert.equal(act(run, 'harden-test', 'test').ok, true);
  assert.equal(score(run), 100);
  assert.equal(act(run, 'exit', 'finish').complete, true);
});

test('New actions reject wrong missions and unknown choices without granting points', () => {
  for (const level of [1, 2, 3]) {
    const run = newRun(level);
    assert.equal(classifyMalware(run, answers).ok, false);
    assert.equal(secureSession(run, 'unknown', 'revoke').ok, false);
    assert.equal(configureServices(run, services).ok, false);
    assert.equal(act(run, 'containment', 'isolate').ok, false);
    assert.equal(score(run), 0);
  }
  const run = newRun(4);
  assert.equal(act(run, 'containment', 'not-a-choice').ok, false);
  assert.deepEqual(run.flags, []);
});

test('Finished new missions are immutable and repeated actions do not farm points', () => {
  const run = newRun(5), save = emptySave();
  for (let i = 0; i < 3; i++) {
    secureSession(run, 'unknown', 'revoke');
    act(run, 'identity', 'unique');
    act(run, 'mfa', 'key');
    act(run, 'auth-test', 'test');
    recordBest(save, run);
  }
  assert.equal(totalXP(save), 100);
  act(run, 'exit', 'finish');
  const before = structuredClone(run);
  assert.equal(secureSession(run, 'unknown', 'erase').ok, false);
  assert.equal(act(run, 'identity', 'reuse').ok, false);
  assert.deepEqual(run, before);
});

test('Old v0.1/v0.2 results and an interrupted mission migrate only to Standard', () => {
  const active:any=newRun(2,'hard');delete active.content;delete active.review;delete active.networkRules;
  const old={schema:1,settings:{difficulty:'hard',sound:true,reducedMotion:false},best:{'1':{learning:100,arcade:20,independent:3,completed:true},'2':{learning:100,arcade:35,independent:4,completed:true},'3':{learning:100,arcade:10,independent:4,completed:true}},active};
  const parsed=parseSave(JSON.stringify(old));
  assert.equal(parsed.schema,2);assert.equal(parsed.settings.content,'standard');assert.equal(parsed.settings.timed,false);
  assert.equal(profile(parsed).active!.content,'standard');assert.equal(profile(parsed).active!.difficulty,'hard');
  assert.deepEqual(profile(parsed).best,old.best);assert.deepEqual(profile(parsed,'junior'),{best:{},active:null});assert.deepEqual(profile(parsed,'expert'),{best:{},active:null});
  assert.equal(totalXP(parsed),365);
});

test('All new mission checkpoints and results survive reload and preserve corrected decisions', () => {
  for (const level of [4, 5, 6]) {
    const save = emptySave(), run = newRun(level, 'medium');
    if (level === 4) { act(run, 'containment', 'isolate'); classifyMalware(run, { ...answers, a: 'virus' }); classifyMalware(run, answers); }
    if (level === 5) { secureSession(run, 'unknown', 'password'); secureSession(run, 'unknown', 'revoke'); act(run, 'identity', 'unique'); }
    if (level === 6) { act(run, 'patches', 'later'); act(run, 'patches', 'official'); act(run, 'accounts', 'standard'); }
    profile(save).active = run; recordBest(save, run);
    const parsed = parseSave(JSON.stringify(save));
    assert.deepEqual(parsed, save);
    assert.equal(nextTarget(profile(parsed).active!), CHECKS[level][2]);
    assert.equal(profile(parsed).best[level].independent, 1);
  }
});
