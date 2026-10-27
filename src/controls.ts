export type ControlPreference='auto'|'keyboard'|'touch';
export type ControlMode=Exclude<ControlPreference,'auto'>;
export const CONTROL_KEY='sisgame.controls.v1';
export const controlPreference=(value:unknown):ControlPreference=>value==='keyboard'||value==='touch'?value:'auto';
export function controlMode(preference:ControlPreference,coarse:boolean,fine:boolean):ControlMode{
  return preference==='auto'?(coarse&&!fine?'touch':'keyboard'):preference;
}

type GameAction='use'|'shield'|'guide'|'lesson'|'pause';
type KeyInput={key:string;repeat?:boolean;ctrlKey?:boolean;metaKey?:boolean;altKey?:boolean;isComposing?:boolean};
const directions:Record<string,{x:number;y:number}>={
  w:{x:0,y:-1},arrowup:{x:0,y:-1},s:{x:0,y:1},arrowdown:{x:0,y:1},
  a:{x:-1,y:0},arrowleft:{x:-1,y:0},d:{x:1,y:0},arrowright:{x:1,y:0},
};
const actions:Record<string,GameAction>={e:'use',q:'shield',' ':'shield',g:'guide',h:'lesson',escape:'pause'};

// DOM focus decides eligibility. No global Phaser capture: native forms retain their keys.
export class GameKeyboard{
  private held=new Set<string>();
  reset(){this.held.clear();}
  down(event:KeyInput,enabled:boolean):{handled:boolean;action?:GameAction}{
    if(!enabled||event.ctrlKey||event.metaKey||event.altKey||event.isComposing){this.reset();return {handled:false};}
    const key=event.key.toLowerCase();
    if(key==='tab'){this.reset();return {handled:false};}
    if(Object.hasOwn(directions,key)){
      // After focus loss, require a fresh press instead of resuming a held key's repeat.
      if(!event.repeat)this.held.add(key);
      return {handled:true};
    }
    if(Object.hasOwn(actions,key))return {handled:true,...(!event.repeat?{action:actions[key]}:{})};
    return {handled:false};
  }
  up(key:string){this.held.delete(key.toLowerCase());}
  axes(){
    // Holding W and Up is one direction; opposing directions cancel.
    const values=[...this.held].map(key=>directions[key]);
    return {x:Number(values.some(d=>d.x>0))-Number(values.some(d=>d.x<0)),y:Number(values.some(d=>d.y>0))-Number(values.some(d=>d.y<0))};
  }
}

// Preserve readable map labels on small screens; avoid excessive zoom on short laptops.
export function stageZoom(width:number,height:number){
  if(height<400)return 1;
  if(width<540)return 1.13;
  return Math.max(1,Math.min(1.45,width/1024,height/704));
}
