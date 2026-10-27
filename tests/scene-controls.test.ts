import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import { runInNewContext } from 'node:vm';
import * as core from '../src/core.ts';
import * as data from '../src/data.ts';
import * as controls from '../src/controls.ts';

// Exercise real Sector methods without a browser, rendering, navigation or network.
// Phaser drawing objects are replaced; movement, route finding and event handlers are real.
const source=stripTypeScriptTypes(await readFile(new URL('../src/game.ts',import.meta.url),'utf8'))
  .replace(/^import .*;\s*$/gm,'').replace('export class Sector','class Sector');
const Sector=runInNewContext(source+'\nSector;',{
  ...core,...data,...controls,
  Phaser:{Scene:class{},Math:{Distance:{Between:(x:number,y:number,a:number,b:number)=>Math.hypot(x-a,y-b)}}},
});
function fixture(){
  const handlers=new Map<string,(event:any)=>void>();
  const bridge={paused:false,axes:{x:0,y:0},keyboardAxes:{x:0,y:0},reducedMotion:true,
    interact(){},changed(){},result(){},nearby(){},hit(){},shield(){}};
  const drawable=(x=0,y=0)=>{
    const item:any={x,y,visible:true};
    const proxy:any=new Proxy(item,{get(target,key){
      if(key in target)return target[key];
      return (...args:any[])=>{if(key==='setPosition'){target.x=args[0];target.y=args[1];}if(key==='setVisible')target.visible=args[0];return proxy;};
    }});return proxy;
  };
  const scene=new Sector(bridge);
  scene.init({run:core.newRun(1,'relaxed')});
  scene.makeTextures=()=>{};scene.drawMap=()=>{};
  scene.add={graphics:drawable,circle:drawable,ellipse:drawable,sprite:drawable,image:drawable,text:drawable};
  scene.input={on:(name:string,handler:(event:any)=>void)=>handlers.set(name,handler)};
  scene.scale={width:1280,height:600,on(){},off(){}};scene.events={once(){}};
  scene.cameras={main:{setBounds(){},startFollow(){},setZoom(){},getWorldPoint:(x:number,y:number)=>({x,y})}};
  scene.create();
  return {scene,bridge,handlers};
}

test('real sector moves from keyboard and touch axes, normalizes diagonals, stops when paused',()=>{
  const {scene,bridge}=fixture();const start={x:scene.player.x,y:scene.player.y};
  bridge.keyboardAxes={x:1,y:1};scene.update(0,16);
  assert.ok(scene.player.x>start.x&&scene.player.y>start.y);
  assert.ok(Math.abs(Math.hypot(scene.player.x-start.x,scene.player.y-start.y)-155*.016)<.0001);
  const x=scene.player.x;bridge.keyboardAxes={x:0,y:0};bridge.axes={x:-1,y:0};scene.update(0,16);
  assert.ok(scene.player.x<x);
  bridge.paused=true;const before={x:scene.player.x,y:scene.player.y,seconds:scene.run.seconds};scene.update(0,16);
  assert.deepEqual({x:scene.player.x,y:scene.player.y,seconds:scene.run.seconds},before);
});

test('route can be interrupted by movement; resetting clears both input sources and route',()=>{
  const {scene,bridge}=fixture();scene.guide();assert.ok(scene.path.length>0);
  bridge.keyboardAxes={x:1,y:0};scene.update(0,16);assert.equal(scene.path.length,0);
  scene.guide();bridge.axes={x:1,y:0};scene.resetInput();
  assert.equal(scene.path.length,0);assert.equal(bridge.axes.x,0);assert.equal(bridge.keyboardAxes.x,0);
  bridge.paused=true;scene.guide();assert.equal(scene.path.length,0);
});

test('map accepts primary clicks and touch, ignores context clicks and all clicks during reading',()=>{
  const {scene,bridge,handlers}=fixture();let walks=0;
  scene.walkTo=()=>walks++;
  const pointer=(button:number,wasTouch=false)=>handlers.get('pointerdown')!({x:130,y:560,button,wasTouch});
  pointer(2);pointer(1);assert.equal(walks,0);
  pointer(0);pointer(-1,true);assert.equal(walks,2);
  bridge.paused=true;pointer(0);pointer(-1,true);assert.equal(walks,2);
});

test('activating the shield preserves a route and held movement in the real sector',()=>{
  const {scene,bridge}=fixture();scene.run.difficulty='easy';scene.guide();
  const route=JSON.stringify(scene.path);scene.shield();
  assert.ok(scene.shieldFor>0);assert.equal(JSON.stringify(scene.path),route);
  scene.cooldown=0;bridge.keyboardAxes={x:1,y:0};bridge.axes={x:0,y:-1};scene.shield();
  assert.equal(bridge.keyboardAxes.x,1);assert.equal(bridge.axes.y,-1);
  const before={x:scene.player.x,y:scene.player.y};scene.update(0,16);
  assert.ok(scene.player.x>before.x||scene.player.y<before.y);
});
