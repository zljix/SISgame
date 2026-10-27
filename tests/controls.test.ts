import test from 'node:test';
import assert from 'node:assert/strict';
import { controlMode, controlPreference, GameKeyboard, stageZoom } from '../src/controls.ts';

test('movement combines aliases and opposing keys without a stuck or accelerated axis',()=>{
  const keys=new GameKeyboard();
  keys.down({key:'W'},true);keys.down({key:'ArrowUp'},true);keys.down({key:'d'},true);
  assert.deepEqual(keys.axes(),{x:1,y:-1});
  keys.up('w');assert.deepEqual(keys.axes(),{x:1,y:-1});
  keys.down({key:'ArrowDown'},true);assert.deepEqual(keys.axes(),{x:1,y:0});
  keys.up('ArrowUp');keys.up('d');assert.deepEqual(keys.axes(),{x:0,y:1});
  keys.up('ArrowDown');assert.deepEqual(keys.axes(),{x:0,y:0});
});

test('focus loss, Tab, shortcuts and composition release movement and preserve native input',()=>{
  const keys=new GameKeyboard();
  for(const event of [{key:'Tab'},{key:'ArrowDown',ctrlKey:true},{key:'w',altKey:true},{key:'s',metaKey:true},{key:'e',isComposing:true}]){
    keys.down({key:'w'},true);
    assert.equal(keys.down(event,true).handled,false);
    assert.deepEqual(keys.axes(),{x:0,y:0});
  }
  keys.down({key:'a'},true);
  assert.equal(keys.down({key:' '},false).handled,false);
  assert.deepEqual(keys.axes(),{x:0,y:0});
  assert.equal(keys.down({key:'ArrowUp',repeat:true},true).handled,true);
  assert.deepEqual(keys.axes(),{x:0,y:0},'autorepeat after focus loss must not restart movement');
  keys.down({key:'ArrowUp'},true);keys.reset();assert.deepEqual(keys.axes(),{x:0,y:0});
});

test('game actions fire once per press and do not consume unrelated typing',()=>{
  const keys=new GameKeyboard();
  for(const [key,action] of [['e','use'],['q','shield'],[' ','shield'],['g','guide'],['h','lesson'],['Escape','pause']]){
    assert.deepEqual(keys.down({key},true),{handled:true,action});
    assert.deepEqual(keys.down({key,repeat:true},true),{handled:true});
    assert.equal(keys.down({key},false).handled,false);
  }
  assert.equal(keys.down({key:'Enter'},true).handled,false);
  assert.equal(keys.down({key:'p'},true).handled,false);
});

test('hybrid devices and manual preferences do not depend on screen size',()=>{
  assert.equal(controlMode('auto',true,false),'touch');
  assert.equal(controlMode('auto',true,true),'keyboard');
  assert.equal(controlMode('auto',false,true),'keyboard');
  assert.equal(controlMode('auto',false,false),'keyboard');
  assert.equal(controlMode('touch',false,true),'touch');
  assert.equal(controlMode('keyboard',true,false),'keyboard');
  assert.equal(controlPreference('broken'),'auto');
  assert.equal(controlPreference(null),'auto');
});

test('camera considers available height on short laptops and retains readable mobile scale',()=>{
  assert.equal(stageZoom(1440,320),1);
  assert.equal(stageZoom(1440,600),1);
  assert.equal(stageZoom(1920,1080),1.45);
  assert.equal(stageZoom(390,700),1.13);
  assert.ok(stageZoom(1200,800)>1&&stageZoom(1200,800)<1.2);
});
