export interface Station { id: string; label: string; x: number; y: number; icon: string; color: number; collectible?: boolean }
export interface Level { id: number; title: string; subtitle: string; description: string; color: string; lesson: [string, string][]; stations: Station[] }
const at = (id: string, label: string, x: number, y: number, icon: string, color = 0x60d8ff, collectible = false): Station => ({ id, label, x: x * 32 + 16, y: y * 32 + 16, icon, color, collectible });
const exit = at('exit', 'Izlaz', 28, 18, 'exit', 0x67e7ab);
export const LEVELS: Level[] = [
  { id: 1, title: 'Zaključaj rizik', subtitle: 'FIZIČKA ZAŠTITA', description: 'Provjeri ulaz, zaštiti napajanje i zbrini osjetljiv ispis.', color: '#66e3b3', lesson: [
    ['Kontrola pristupa', 'Ovlaštena osoba smije ući u poslužiteljsku sobu. Kartica pomaže provjeriti ovlast; kamera bilježi događaje.'],
    ['UPS', 'Pričuvno napajanje daje ograničeno vrijeme za spremanje rada i sigurno gašenje. Poslužitelj je u ovoj misiji prioritet.'],
    ['Osjetljiv ispis', 'Papir s osobnim podatcima treba sigurno uništiti. U običnom košu ostaje čitljiv.'],
  ], stations: [at('card', 'Službena kartica', 6, 16, 'card', 0x60d8ff, true), at('door', 'Ulazna vrata', 9, 6, 'door'), at('ups', 'UPS', 15, 4, 'power', 0xffcf76), at('paper', 'Osjetljiv ispis', 5, 5, 'file', 0x60d8ff, true), at('shred', 'Uništavač', 16, 15, 'shred'), at('drill', 'Probni događaji', 25, 5, 'check', 0xb4a1ff), exit] },
  { id: 2, title: 'Samo za ovlaštene', subtitle: 'PRAVA I ŠIFRIRANJE', description: 'Postavi prava na mape i sigurno prenesi povjerljivu datoteku.', color: '#70c8ff', lesson: [
    ['Najmanje potrebne ovlasti', 'Korisnik dobiva samo prava potrebna za posao. Uređivanje ovdje uključuje i čitanje.'],
    ['Politika pristupa', 'Javni raspored čitaju svi, a mijenja nastavnik. Mapu Ocjene u ovoj simulaciji smije otvarati i mijenjati samo ovlašteni nastavnik.'],
    ['Šifriranje', 'Šifrirani sadržaj ne može se razumljivo pročitati bez odgovarajućeg ključa. Ključ čuvamo odvojeno; šifriranje ne zamjenjuje kopiju.'],
  ], stations: [at('schedule', 'Javni raspored', 5, 5, 'access'), at('grades', 'Mapa Ocjene', 16, 4, 'lock', 0xffcf76), at('secret', 'Povjerljiva datoteka', 15, 12, 'file', 0x60d8ff, true), at('encrypt', 'Šifriranje', 26, 5, 'key', 0xb4a1ff), at('deliver', 'Sigurna arhiva', 26, 17, 'archive'), exit] },
  { id: 3, title: 'Povratak podataka', subtitle: 'KOPIJA I OPORAVAK', description: 'Sačuvaj tri dokumenta, isprobaj kvar i provjeri obnovu.', color: '#ffd087', lesson: [
    ['Sigurnosna kopija', 'Dodatna kopija omogućuje povrat podataka nakon gubitka. Odaberi sve važne datoteke.'],
    ['Odvojena pohrana', 'Za zaštitu od kvara radnog diska koristi drugi uređaj. U misiji vanjski disk nakon kopiranja odspajamo i sigurno spremamo.'],
    ['Obnova i provjera', 'Vrati podatke iz kopije na zamjenski disk, otvori ih i usporedi sadržaj. Kvar u igri je simuliran.'],
  ], stations: [at('rad', 'Završni rad', 5, 5, 'file', 0x60d8ff, true), at('mjerenja', 'Mjerenja', 16, 4, 'file', 0x60d8ff, true), at('nacrt', 'Nacrt', 25, 6, 'file', 0x60d8ff, true), at('backup', 'Stanica za kopije', 16, 16, 'backup', 0xffcf76), at('failure', 'Probni kvar', 7, 15, 'power', 0xff8a92), at('verify', 'Provjera sadržaja', 26, 17, 'check', 0xb4a1ff), exit] },
];
export const TARGET_TEXT: Record<string, string> = {card:'Preuzmi službenu karticu',door:'Postavi kontrolu ulaza',ups:'Zaštiti napajanje poslužitelja',paper:'Preuzmi osjetljiv ispis',shred:'Sigurno uništi ispis',drill:'Isprobaj zaštitu',exit:'Dođi do izlaza',schedule:'Uredi prava na javni raspored',grades:'Uredi prava na mapu Ocjene',secret:'Preuzmi povjerljivu datoteku',encrypt:'Šifriraj datoteku',deliver:'Predaj i provjeri datoteku',rad:'Pronađi završni rad',mjerenja:'Pronađi mjerenja',nacrt:'Pronađi nacrt',backup:'Pripremi odvojenu kopiju',failure:'Pokreni probni kvar',verify:'Provjeri obnovljeni sadržaj'};
export const TILE = 32, COLS = 32, ROWS = 22;
export function walls(): Set<string> {
  const w = new Set<string>();
  for (let x=0;x<COLS;x++) {w.add(`${x},0`);w.add(`${x},${ROWS-1}`);}
  for (let y=0;y<ROWS;y++) {w.add(`0,${y}`);w.add(`${COLS-1},${y}`);}
  for (let y=1;y<ROWS-1;y++) {if (![5,6,16,17].includes(y)) w.add(`11,${y}`); if (![9,10,17,18].includes(y)) w.add(`21,${y}`);}
  for (let x=1;x<11;x++) if (![4,5,6].includes(x)) w.add(`${x},11`);
  for (let x=12;x<21;x++) if (![15,16,17].includes(x)) w.add(`${x},7`);
  for (let x=22;x<COLS-1;x++) if (![25,26,27].includes(x)) w.add(`${x},14`);
  return w;
}
// Four-way breadth-first search keeps touch-to-walk routes inside passable tiles.
export function route(sx:number,sy:number,tx:number,ty:number,blocked:Set<string>): {x:number;y:number}[] {
  const start = `${Math.floor(sx/TILE)},${Math.floor(sy/TILE)}`, goal = `${Math.floor(tx/TILE)},${Math.floor(ty/TILE)}`;
  if(blocked.has(goal)) return [];
  const queue=[start], prev = new Map<string,string>(), visited=new Set([start]);
  for(let i=0;i<queue.length;i++){
    const current=queue[i]; if(current===goal) break;
    const [x,y]=current.split(',').map(Number);
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const nx=x+dx,ny=y+dy,k=`${nx},${ny}`;
      if(nx<1||ny<1||nx>=COLS-1||ny>=ROWS-1||visited.has(k)||blocked.has(k))continue;
      visited.add(k);prev.set(k,current);queue.push(k);
    }
  }
  if(!visited.has(goal))return [];
  const path:string[]=[];let k=goal;
  while(k!==start){path.push(k);k=prev.get(k)!;}
  return path.reverse().map(p=>{const [x,y]=p.split(',').map(Number);return{x:x*TILE+16,y:y*TILE+16};});
}

export function movementTowards(x:number,y:number,target:{x:number;y:number},maxStep:number){
  const dx=target.x-x,dy=target.y-y,distance=Math.hypot(dx,dy);
  const step=Math.min(maxStep,distance);
  return distance===0?{x:0,y:0}:{x:dx/distance*step,y:dy/distance*step};
}
