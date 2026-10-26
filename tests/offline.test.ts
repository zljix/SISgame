import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import path from 'node:path';

test('Built offline bundle can serve the game under /SISgame/ without network and preserves unrelated caches',async()=>{
 const handlers=new Map<string,(event:any)=>void>();
 const buckets=new Map<string,Map<string,Response>>();
 const origin='https://example.test/SISgame/';
 const normalize=(input:any,ignore=false)=>{const u=new URL(typeof input==='string'?input:input.url,origin);if(ignore)u.search='';return u.href;};
 let network=0;
 const caches={async open(key:string){if(!buckets.has(key))buckets.set(key,new Map());const bucket=buckets.get(key)!;return{
  async addAll(urls:string[]){for(const relative of urls){const pathname=new URL(relative,origin).pathname.replace('/SISgame/','');const data=await readFile(path.resolve('docs',pathname));bucket.set(normalize(relative),new Response(data));}},
  async match(req:any,options?:any){return bucket.get(normalize(req,options?.ignoreSearch))?.clone();}
 };},async keys(){return [...buckets.keys()];},async delete(key:string){return buckets.delete(key);}};
 buckets.set('another-app',new Map());buckets.set('sisgame:/OTHER/:old',new Map());buckets.set('sisgame:/SISgame/:old',new Map());
 const self={location:{href:origin+'sw.js'},addEventListener(name:string,handler:(e:any)=>void){handlers.set(name,handler);},clients:{async claim(){}},skipWaiting(){}};
 runInNewContext(await readFile('docs/sw.js','utf8'),{self,caches,URL,fetch:async()=>{network++;throw new Error('Offline');},Promise});
 const lifetime=async(name:string)=>{let promise:Promise<any>|undefined;handlers.get(name)!({waitUntil:(p:Promise<any>)=>promise=p});await promise;};
 await lifetime('install');await lifetime('activate');
 assert.ok(buckets.has('another-app'));assert.ok(buckets.has('sisgame:/OTHER/:old'));assert.equal(buckets.has('sisgame:/SISgame/:old'),false);
 const fetchOffline=async(url:string,mode='cors')=>{let response:Promise<Response>|undefined;handlers.get('fetch')!({request:{url,method:'GET',mode},respondWith:(p:Promise<Response>)=>response=p});assert.ok(response);return response!;};
 const home=await fetchOffline(origin,'navigate');assert.match(await home.text(),/SISgame/);
 const manifest=await fetchOffline(origin+'manifest.webmanifest');const json=await manifest.json();assert.equal(json.scope,'./');assert.equal(json.start_url,'./');
 const own=[...buckets.entries()].find(([key])=>key.startsWith('sisgame:/SISgame/:'))![1];
 for(const url of own.keys()){const response=await fetchOffline(url);assert.equal(response.status,200);}
 assert.equal(network,0);
 let reported:any;let work:Promise<any>|undefined;
 const check=async()=>{reported=undefined;handlers.get('message')!({data:{type:'CHECK_CACHE'},ports:[{postMessage:(m:any)=>reported=m}],waitUntil:(p:Promise<any>)=>work=p});await work;return reported.ready;};
 assert.equal(await check(),true);own.delete([...own.keys()].find(key=>key.includes('/assets/'))!);assert.equal(await check(),false);
 let intercepted=false;handlers.get('fetch')!({request:{url:'https://example.test/another-app/',method:'GET',mode:'navigate'},respondWith:()=>intercepted=true});assert.equal(intercepted,false);
});
