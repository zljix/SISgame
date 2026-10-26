import test from 'node:test';
import assert from 'node:assert/strict';
import { act, applyPermissions, collect, has, newRun, ready, score, nextTarget } from '../src/core.ts';
import { emptySave, parseSave, recordBest, totalXP } from '../src/storage.ts';
import { LEVELS, route, walls, movementTowards } from '../src/data.ts';

test('Every mission station is reachable from the entrance without crossing walls',()=>{
 const w=walls();for(const level of LEVELS)for(const s of level.stations){const steps=route(112,560,s.x,s.y,w);assert.ok(steps.length>0,`${level.id}/${s.id}`);for(const p of steps)assert.equal(w.has(`${Math.floor(p.x/32)},${Math.floor(p.y/32)}`),false);assert.deepEqual(steps.at(-1),{x:s.x,y:s.y});}
});
test('Exit is unavailable before all security checks, even after collecting bonus bits',()=>{const r=newRun(1);r.bits=['bit-0','bit-1'];assert.equal(act(r,'exit','finish').ok,false);assert.equal(r.completed,false);assert.equal(score(r),0);});
test('Physical security requires a card, actual access control, UPS and secure disposal',()=>{
 const r=newRun(1);assert.equal(act(r,'door','authorized').ok,false);collect(r,'card');assert.equal(act(r,'door','camera').ok,false);assert.equal(score(r),0);act(r,'door','authorized');act(r,'ups','server');assert.equal(act(r,'shred','destroy').ok,false);assert.equal(act(r,'drill','test').ok,false);collect(r,'paper');act(r,'shred','destroy');act(r,'drill','test');assert.equal(ready(r),true);assert.equal(score(r),100);assert.equal(r.checks.door.errors,1);assert.equal(act(r,'exit','finish').complete,true);
});
test('Repeated actions cannot multiply learning points',()=>{const r=newRun(1);collect(r,'card');for(let i=0;i<12;i++)act(r,'door','authorized');assert.equal(score(r),25);assert.equal(r.flags.filter(f=>f==='door').length,1);});
test('Access control preserves availability and rejects excessive privilege',()=>{
 const r=newRun(2);assert.equal(applyPermissions(r,'schedule',{student:'none',teacher:'none',guest:'none'}).ok,false);assert.equal(applyPermissions(r,'schedule',{student:'read',teacher:'write',guest:'read'}).ok,true);assert.equal(applyPermissions(r,'grades',{student:'read',teacher:'write',guest:'none'}).ok,false);assert.equal(applyPermissions(r,'grades',{student:'none',teacher:'write',guest:'none'}).ok,true);
});
test('Confidential delivery requires authorized collection and encryption',()=>{
 const r=newRun(2);assert.equal(collect(r,'secret').ok,false);assert.equal(act(r,'encrypt','encrypt').ok,false);assert.equal(act(r,'deliver','verify').ok,false);applyPermissions(r,'grades',{student:'none',teacher:'write',guest:'none'});collect(r,'secret');assert.equal(act(r,'encrypt','rename').ok,false);act(r,'encrypt','encrypt');assert.equal(act(r,'deliver','verify').ok,true);assert.deepEqual(r.backup,[]);
});
test('Copy needs all files and independent storage before a failure can be simulated',()=>{
 const r=newRun(3);collect(r,'rad');assert.equal(act(r,'backup','separate').ok,false);assert.equal(act(r,'failure','simulate').ok,false);collect(r,'mjerenja');collect(r,'nacrt');assert.equal(act(r,'backup','same').ok,false);assert.equal(act(r,'backup','partition').ok,false);assert.equal(has(r,'backup'),false);assert.equal(act(r,'backup','separate').ok,true);assert.equal(nextTarget(r),'failure');
});
test('Failure removes originals; restoring leaves the independent copy intact; verification is required',()=>{
 const r=newRun(3);for(const id of ['rad','mjerenja','nacrt'])collect(r,id);act(r,'backup','separate');act(r,'failure','simulate');assert.deepEqual(r.files,[]);assert.equal(r.backup.length,3);assert.equal(act(r,'verify','verify').ok,false);assert.equal(nextTarget(r),'backup');act(r,'backup','restore');assert.equal(r.files.length,3);assert.equal(r.backup.length,3);assert.equal(ready(r),false);act(r,'verify','verify');assert.equal(ready(r),true);assert.equal(score(r),100);assert.equal(act(r,'exit','finish').complete,true);
});
test('Collecting a document twice does not substitute for a missing document',()=>{const r=newRun(3);for(let i=0;i<3;i++)collect(r,'rad');assert.equal(r.files.length,1);assert.equal(has(r,'collect'),false);});
test('Best results persist across replays without farming repeated points',()=>{const s=emptySave(),r=newRun(1);collect(r,'card');act(r,'door','authorized');r.bits=['bit-0'];recordBest(s,r);recordBest(s,r);assert.equal(totalXP(s),30);recordBest(s,newRun(1));assert.equal(totalXP(s),30);});
test('A valid interrupted run restores files, decisions, coordinates and settings',()=>{const s=emptySave(),r=newRun(3,'medium');collect(r,'rad');r.x=200;r.y=150;s.active=r;s.settings.sound=true;const parsed=parseSave(JSON.stringify(s));assert.deepEqual(parsed,s);});
test('Corrupt or incompatible saved data does not prevent startup',()=>{assert.deepEqual(parseSave('broken'),emptySave());assert.deepEqual(parseSave('{"schema":9}'),emptySave());const s=parseSave('{"schema":1,"active":{"level":3,"difficulty":"easy","files":["rad","rad","unknown"],"x":-100,"y":1e100,"checks":{}},"best":{"1":{"learning":1e100,"arcade":-50}}}');assert.deepEqual(s.active?.files,['rad']);assert.equal(s.active?.x,48);assert.equal(s.best[1].learning,100);assert.equal(s.best[1].arcade,0);});

test('Touch navigation reaches every waypoint even with slow frames without oscillating',()=>{
 const path=route(112,560,304,208,walls());let x=112,y=560,frames=0;
 while(path.length && frames++<1500){const p=path[0];if(Math.hypot(p.x-x,p.y-y)<2){path.shift();continue;}const delta=movementTowards(x,y,p,155*.12);x+=delta.x;y+=delta.y;}
 assert.equal(path.length,0);assert.ok(Math.hypot(x-304,y-208)<2);
});
