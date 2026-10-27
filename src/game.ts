import Phaser from 'phaser';
import { collect, has, nextTarget, newRun, ready, type Run, type Result } from './core.ts';
import { COLS, LEVELS, ROWS, TILE, walls, route, movementTowards, type Station } from './data.ts';
import { stageZoom } from './controls.ts';
export interface Bridge {
  paused:boolean; axes:{x:number;y:number}; keyboardAxes:{x:number;y:number}; reducedMotion:boolean;
  interact:(station:Station)=>void; changed:()=>void; result:(result:Result)=>void;
  nearby:(station:Station|null)=>void; hit:()=>void; shield:(remaining:number)=>void;
}
type StationView={data:Station;icon:Phaser.GameObjects.Image;pad:Phaser.GameObjects.Arc;label:Phaser.GameObjects.Text;ring:Phaser.GameObjects.Arc};
export class Sector extends Phaser.Scene {
  run:Run = newRun(1); bridge:Bridge;
  player!:Phaser.GameObjects.Sprite; shadow!:Phaser.GameObjects.Ellipse; aura!:Phaser.GameObjects.Arc;
  stationViews:StationView[]=[]; blocked=walls();
  threats:{sprite:Phaser.GameObjects.Sprite;points:{x:number;y:number}[];step:number}[]=[];
  path:{x:number;y:number}[]=[]; pathLine!:Phaser.GameObjects.Graphics; ring!:Phaser.GameObjects.Arc;
  bits:{id:string;sprite:Phaser.GameObjects.Image}[]=[];
  near:Station|null=null; invincible=0; shieldFor=0; cooldown=0; tick=0; dirty=0; facing=1;
  constructor(bridge:Bridge){super('Sector');this.bridge=bridge;}
  init(data:{run?:Run}){if(data?.run)this.run=data.run;this.path=[];this.stationViews=[];this.threats=[];this.bits=[];this.near=null;this.invincible=0;this.shieldFor=0;this.cooldown=0;}
  create(){
    this.blocked=walls(this.run.level);this.makeTextures();this.drawMap();
    this.pathLine=this.add.graphics().setDepth(1);
    this.shadow=this.add.ellipse(this.run.x,this.run.y+13,27,10,0x000000,.3).setDepth(8);
    this.player=this.add.sprite(this.run.x,this.run.y,'hero').setOrigin(.5,.5).setDepth(10);
    this.aura=this.add.circle(this.run.x,this.run.y,25,0x66e3b3,.1).setStrokeStyle(2,0x66e3b3).setDepth(9).setVisible(false);
    this.ring=this.add.circle(0,0,24,0x66e3b3,.03).setStrokeStyle(2,0x66e3b3,.8).setDepth(4);
    for(const s of LEVELS[this.run.level-1].stations){
      const pad=this.add.circle(s.x,s.y+7,22,s.color,.1).setStrokeStyle(1,s.color,.26).setDepth(2);
      const ring=this.add.circle(s.x,s.y,23,s.color,0).setStrokeStyle(2,s.color,.5).setDepth(3);
      const icon=this.add.image(s.x,s.y,'icon-'+s.icon).setDepth(6);
      const label=this.add.text(s.x,s.y+28,s.label,{fontFamily:'system-ui',fontSize:'11px',color:'#c2d7df',align:'center',backgroundColor:'#142d38',padding:{x:5,y:3}}).setOrigin(.5,0).setDepth(7);
      this.stationViews.push({data:s,icon,pad,label,ring});
    }
    const bitTiles=[[3,14],[8,18],[8,9],[3,7],[13,5],[18,3],[18,12],[13,18],[23,11],[28,8],[29,16],[24,19]];
    bitTiles.forEach(([x,y],i)=>{const id='bit-'+i;const sprite=this.add.image(x*TILE+16,y*TILE+16,'bit').setDepth(3);this.bits.push({id,sprite});});
    const paths=[[[3,3],[8,3],[8,8],[3,8]],[[13,10],[18,10],[18,18],[13,18]],[[23,3],[28,3],[28,11],[23,11]]];
    if(this.run.difficulty!=='relaxed')paths.forEach((points,i)=>{const ps=points.map(([x,y])=>({x:x*TILE+16,y:y*TILE+16}));const sprite=this.add.sprite(ps[0].x,ps[0].y,'threat').setDepth(9);this.threats.push({sprite,points:ps,step:1});if(i===2&&this.run.difficulty==='easy')sprite.setAlpha(.8);});
    this.input.on('pointerdown',(p:Phaser.Input.Pointer)=>{if(!this.bridge.paused&&(p.wasTouch||p.button===0)){const point=this.cameras.main.getWorldPoint(p.x,p.y);this.walkTo(point.x,point.y);}});
    this.scale.on('resize',this.resize,this);this.events.once('shutdown',()=>this.scale.off('resize',this.resize,this));
    this.cameras.main.setBounds(0,0,COLS*TILE,ROWS*TILE);this.cameras.main.startFollow(this.player,true,.12,.12);this.resize();
    this.sync();this.bridge.changed();
  }
  resize(){this.cameras.main.setZoom(stageZoom(this.scale.width,this.scale.height));}
  startRun(run:Run){this.run=run;this.scene.restart({run});}
  resetInput(){this.path=[];this.bridge.axes={x:0,y:0};this.bridge.keyboardAxes={x:0,y:0};}
  walkTo(x:number,y:number){this.path=route(this.player.x,this.player.y,x,y,this.blocked);if(this.path.length)this.path.unshift({x:Math.floor(this.player.x/TILE)*TILE+16,y:Math.floor(this.player.y/TILE)*TILE+16});}
  guide(){if(this.bridge.paused||!this.player)return;const s=LEVELS[this.run.level-1].stations.find(s=>s.id===nextTarget(this.run));if(s)this.walkTo(s.x,s.y);}
  use(){if(!this.bridge.paused&&this.near)this.bridge.interact(this.near);}
  shield(){if(this.run.difficulty==='relaxed'||this.bridge.paused||this.cooldown>0)return;this.shieldFor=2.5;this.cooldown=7;this.burst(this.player.x,this.player.y,0x66e3b3);}
  canStand(x:number,y:number){return [[-10,-10],[10,-10],[-10,10],[10,10]].every(([dx,dy])=>!this.blocked.has(`${Math.floor((x+dx)/TILE)},${Math.floor((y+dy)/TILE)}`));}
  move(dx:number,dy:number){if(this.canStand(this.player.x+dx,this.player.y))this.player.x+=dx;if(this.canStand(this.player.x,this.player.y+dy))this.player.y+=dy;}
  sync(){
    for(const v of this.stationViews){
      const used=v.data.collectible&&(has(this.run,v.data.id)||this.run.files.includes(v.data.id)||has(this.run,'failure'));
      v.icon.setVisible(!used);v.pad.setVisible(!used);v.ring.setVisible(!used);v.label.setVisible(!used);
      const done=this.run.checks[v.data.id]?.done;
      v.icon.setAlpha(done?.6:1);v.pad.setFillStyle(done?0x66e3b3:v.data.color,done?.25:.08);
      v.ring.setStrokeStyle(1,done?0x66e3b3:v.data.color,done?.7:.3);
      if(v.data.id==='exit'){v.icon.setAlpha(ready(this.run)?1:.4);v.pad.setFillStyle(0x66e3b3,ready(this.run)?.35:.04);}
    }
    for(const b of this.bits)b.sprite.setVisible(!this.run.bits.includes(b.id));
  }
  update(_:number,delta:number){
    if(!this.player)return;
    const dt=Math.min(delta/1000,.12);this.tick+=dt;
    if(this.bridge.paused){this.pathLine.clear();return;}
    this.run.seconds+=dt;this.dirty+=dt;
    const keyboard=this.bridge.keyboardAxes;
    let x=keyboard.x||this.bridge.axes.x, y=keyboard.y||this.bridge.axes.y;
    if(x||y)this.path=[];
    let autoStep:{x:number;y:number}|null=null;if(!x&&!y&&this.path.length){const p=this.path[0],d=Math.hypot(p.x-this.player.x,p.y-this.player.y);if(d<2)this.path.shift();else{autoStep=movementTowards(this.player.x,this.player.y,p,155*dt);x=autoStep.x;y=autoStep.y;}}
    const mag=Math.hypot(x,y);if(mag>1){x/=mag;y/=mag;}
    const dx=autoStep?autoStep.x:x*155*dt,dy=autoStep?autoStep.y:y*155*dt;const steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/6));for(let i=0;i<steps;i++)this.move(dx/steps,dy/steps);
    if(x)this.facing=x>0?1:-1;this.player.setFlipX(this.facing<0);
    this.player.setScale(1,(x||y)&&!this.bridge.reducedMotion?1+Math.sin(this.tick*19)*.035:1);
    this.shadow.setPosition(this.player.x,this.player.y+13);this.aura.setPosition(this.player.x,this.player.y).setVisible(this.shieldFor>0);
    this.invincible=Math.max(0,this.invincible-dt);this.shieldFor=Math.max(0,this.shieldFor-dt);this.cooldown=Math.max(0,this.cooldown-dt);
    this.player.setAlpha(this.invincible>0&&!this.bridge.reducedMotion?(.6+.4*Math.sin(this.tick*25)):1);
    this.bridge.shield(this.cooldown);
    this.pathLine.clear();if(this.path.length&&!this.bridge.reducedMotion){this.pathLine.lineStyle(2,0x66e3b3,.23);this.pathLine.beginPath();this.pathLine.moveTo(this.player.x,this.player.y);for(const p of this.path)this.pathLine.lineTo(p.x,p.y);this.pathLine.strokePath();}
    const target=LEVELS[this.run.level-1].stations.find(s=>s.id===nextTarget(this.run));
    if(target){this.ring.setPosition(target.x,target.y).setVisible(this.run.difficulty!=='hard');this.ring.setScale(this.bridge.reducedMotion?1:1+Math.sin(this.tick*3)*.1);}
    const threatSpeed={relaxed:0,easy:35,medium:55,hard:75}[this.run.difficulty];
    for(const t of this.threats){
      const p=t.points[t.step],dx=p.x-t.sprite.x,dy=p.y-t.sprite.y,d=Math.hypot(dx,dy);if(d<3)t.step=(t.step+1)%t.points.length;else{t.sprite.x+=dx/d*threatSpeed*dt;t.sprite.y+=dy/d*threatSpeed*dt;}
      if(!this.bridge.reducedMotion)t.sprite.angle=Math.sin(this.tick*3)*6;
      if(Phaser.Math.Distance.Between(t.sprite.x,t.sprite.y,this.player.x,this.player.y)<24&&this.invincible<=0&&this.shieldFor<=0){
        this.run.hits++;this.run.health--;this.invincible=2.2;this.path=[];this.burst(this.player.x,this.player.y,0xff7f92);
        if(!this.bridge.reducedMotion)this.cameras.main.shake(100,.002);
        if(this.run.health<=0){this.run.health=3;this.player.setPosition(112,560);this.bridge.result({ok:false,title:'Natrag na ulaz',message:'Sigurnosne odluke i pronađeni podatci su sačuvani. Štit kratko štiti od arkadnih smetnji.'});}
        this.bridge.hit();this.bridge.changed();
      }
    }
    for(const b of this.bits){if(b.sprite.visible&&Phaser.Math.Distance.Between(b.sprite.x,b.sprite.y,this.player.x,this.player.y)<23){this.run.bits.push(b.id);b.sprite.setVisible(false);this.burst(b.sprite.x,b.sprite.y,0xffcf76);this.bridge.changed();}}
    let near:Station|null=null;let closest=56;
    for(const v of this.stationViews){if(!v.icon.visible)continue;const d=Phaser.Math.Distance.Between(v.data.x,v.data.y,this.player.x,this.player.y);
      if(v.data.collectible&&d<29){const res=collect(this.run,v.data.id);if(res.ok){this.burst(v.data.x,v.data.y,v.data.color);this.sync();this.bridge.result(res);this.bridge.changed();}else if(d<23&&!this.near){near=v.data;} }
      else if(d<closest){closest=d;near=v.data;}
    }
    if(near?.id!==this.near?.id){this.near=near;this.bridge.nearby(near);}
    this.run.x=this.player.x;this.run.y=this.player.y;
    if(this.dirty>4){this.dirty=0;this.bridge.changed();}
  }
  burst(x:number,y:number,color:number){if(this.bridge.reducedMotion)return;for(let i=0;i<7;i++){const p=this.add.rectangle(x,y,4,4,color).setDepth(15);const a=i/7*Math.PI*2;this.tweens.add({targets:p,x:x+Math.cos(a)*28,y:y+Math.sin(a)*28,alpha:0,duration:400,onComplete:()=>p.destroy()});}}
  drawMap(){
    const level=LEVELS[this.run.level-1];
    const g=this.add.graphics();g.fillStyle(0x12242f);g.fillRect(0,0,COLS*TILE,ROWS*TILE);
    for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
      const px=x*TILE,py=y*TILE;
      if(this.blocked.has(`${x},${y}`)){g.fillStyle(0x0a1726);g.fillRect(px,py,TILE,TILE);g.fillStyle(0x345466);g.fillRect(px,py,TILE,22);g.fillStyle(0x4b6b7c);g.fillRect(px,py,TILE,4);g.fillStyle(0x203c50);g.fillRect(px+2,py+7,TILE-4,13);}
      else{const region=x<11?0:x<21?1:2;const cs=level.floors||[0x1a3540,0x1e3549,0x213647];g.fillStyle(cs[region]);g.fillRect(px,py,TILE-1,TILE-1);if((x+y)%4===0){g.fillStyle(0x739aaa,.06);g.fillRect(px+8,py+8,2,2);}}
    }
    for(const [x,y] of [[2,2],[19,2],[23,19],[9,13]]){g.fillStyle(0x0d202d);g.fillRoundedRect(x*TILE,y*TILE,40,52,5);g.fillStyle(0x396374);g.fillRect(x*TILE+5,y*TILE+6,30,5);for(let i=0;i<3;i++){g.fillStyle(0x66e3b3,.5);g.fillRect(x*TILE+7,y*TILE+19+i*9,5,3);g.fillStyle(0x78959d,.3);g.fillRect(x*TILE+16,y*TILE+19+i*9,16,3);}}
    const titleStyle={fontFamily:'monospace',fontSize:'11px',color:'#71929f',letterSpacing:2};
    const rooms=level.rooms||['ULAZ','PODATCI','OPORAVAK'];
    this.add.text(58,395,'01 / '+rooms[0],titleStyle);this.add.text(402,285,'02 / '+rooms[1],titleStyle);this.add.text(725,495,'03 / '+rooms[2],titleStyle);
    this.add.rectangle(112,560,48,48,0x66e3b3,.05).setStrokeStyle(1,0x66e3b3,.3);this.add.text(112,592,'POČETAK',{...titleStyle,fontSize:'9px'}).setOrigin(.5,0);
  }
  makeTextures(){
    if(this.textures.exists('hero'))return;
    const g=this.make.graphics({x:0,y:0});
    const rect=(x:number,y:number,w:number,h:number,c:number)=>{g.fillStyle(c);g.fillRect(x,y,w,h);};
    rect(10,2,12,3,0x66e3b3);rect(5,5,22,18,0x79d9e8);rect(7,7,18,10,0x172d42);rect(10,10,4,4,0xd7ffff);rect(20,10,4,4,0xd7ffff);rect(9,23,14,6,0x6590be);rect(7,29,7,3,0x0a1726);rect(19,29,7,3,0x0a1726);rect(3,20,5,8,0x66e3b3);rect(24,20,5,8,0x66e3b3);rect(12,19,8,3,0x2f6584);g.generateTexture('hero',32,32);g.clear();
    rect(8,3,16,3,0xff9da8);rect(4,6,24,20,0xc65575);rect(1,11,4,9,0xf78b98);rect(27,11,4,9,0xf78b98);rect(7,9,18,11,0x4c243e);rect(9,12,4,4,0xffe3d1);rect(19,12,4,4,0xffe3d1);rect(10,25,4,4,0xf78b98);rect(20,25,4,4,0xf78b98);g.generateTexture('threat',32,32);g.clear();
    rect(5,0,6,16,0xffcf76);rect(0,5,16,6,0xffcf76);rect(6,3,4,10,0xfff4c4);g.generateTexture('bit',16,16);g.clear();
    for(const icon of ['card','door','power','file','shred','check','exit','access','lock','key','archive','backup','bug','log','update','network','radar','wifi']){
      rect(4,4,24,24,0x0b1b2c);rect(5,5,22,22,0x377088);
      const c=icon==='power'||icon==='backup'?0xffcf76:icon==='exit'?0x66e3b3:0xb4eaff;
      if(icon==='file'||icon==='card'){rect(9,7,14,18,c);rect(12,11,8,2,0x377088);rect(12,16,8,2,0x377088);if(icon==='card')rect(8,20,16,3,0x66e3b3);}
      else if(icon==='power'){g.fillStyle(c);g.fillPoints([{x:17,y:5},{x:9,y:18},{x:15,y:18},{x:13,y:28},{x:25,y:13},{x:18,y:13}],true);}
      else if(icon==='door'||icon==='lock'){rect(10,9,13,18,c);rect(13,6,8,4,c);rect(15,7,4,3,0x377088);rect(18,18,3,3,0x18394b);}
      else if(icon==='key'){g.lineStyle(4,c);g.strokeCircle(12,12,5);rect(14,15,11,4,c);rect(22,17,3,6,c);}
      else if(icon==='exit'){rect(8,13,16,6,c);g.fillStyle(c);g.fillTriangle(19,7,28,16,19,25);}
      else if(icon==='check'){g.lineStyle(4,c);g.beginPath();g.moveTo(7,16);g.lineTo(13,22);g.lineTo(25,9);g.strokePath();}
      else if(icon==='shred'){rect(8,7,16,11,c);rect(7,16,18,5,0x0b1b2c);for(let i=0;i<4;i++)rect(8+i*5,21,2,8,c);}
      else if(icon==='access'){rect(9,8,5,5,c);rect(8,15,7,8,c);rect(19,9,6,3,c);rect(19,15,6,3,c);rect(19,21,6,3,c);}
      else if(icon==='bug'){rect(11,9,11,16,0xff9bb1);rect(14,6,5,5,0xff9bb1);for(let i=0;i<3;i++){rect(7,11+i*5,4,2,c);rect(22,11+i*5,4,2,c);}rect(16,12,2,10,0x0b1b2c);}
      else if(icon==='log'){rect(8,7,17,19,c);for(let i=0;i<3;i++){rect(10,10+i*5,2,2,0x377088);rect(15,10+i*5,7,2,0x377088);}}
      else if(icon==='update'){g.lineStyle(3,c);g.strokeCircle(16,16,8);g.fillStyle(0xffcf76);g.fillTriangle(21,5,28,9,21,13);rect(15,11,3,10,0x66e3b3);rect(11,15,11,3,0x66e3b3);}
      else if(icon==='radar'){g.lineStyle(2,c);g.strokeCircle(16,16,10);g.strokeCircle(16,16,5);g.lineBetween(16,16,25,7);rect(9,19,3,3,0xffcf76);}
      else if(icon==='wifi'){g.lineStyle(2,c);g.beginPath();g.arc(16,21,13,Math.PI*1.2,Math.PI*1.8);g.strokePath();g.beginPath();g.arc(16,21,8,Math.PI*1.2,Math.PI*1.8);g.strokePath();rect(14,20,4,4,0x66e3b3);}
      else if(icon==='network'){rect(12,7,9,7,c);rect(15,14,3,8,c);rect(7,19,19,3,c);rect(6,21,7,5,0xffcf76);rect(21,21,7,5,0xffcf76);}
      else {rect(8,8,17,17,c);rect(10,10,13,3,0x377088);rect(11,18,4,4,0x377088);rect(18,18,4,4,0x66e3b3);}
      g.generateTexture('icon-'+icon,32,32);g.clear();
    }g.destroy();
  }
}
