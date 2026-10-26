export interface Station { id: string; label: string; x: number; y: number; icon: string; color: number; collectible?: boolean }
export interface Level { id: number; title: string; subtitle: string; description: string; color: string; lesson: [string, string][]; stations: Station[]; rooms?: [string, string, string]; floors?: [number, number, number]; debrief?: string }
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
  { id: 4, title: 'Sumnjivi program', subtitle: 'ZLONAMJERNI PROGRAMI', description: 'Izoliraj računalo, prepoznaj prijetnje i sigurno ga vrati u rad.', color: '#ff9bb1', rooms: ['IZOLACIJA', 'ANALIZA', 'OPORAVAK'], floors: [0x342b40, 0x2c3049, 0x203e46], debrief: 'Zašto jedan čist antivirusni nalaz nije dovoljan kada postoji sumnja na rootkit?', lesson: [
    ['Prepoznaj ponašanje', 'Virus se veže uz domaćina, crv se samostalno širi, a trojanski konj prikriva štetnu funkciju. Izvještaji su izmišljeni; ne pokrećeš stvarne uzorke.'],
    ['Ograniči incident', 'Izoliraj zaraženo računalo od mreže i prijavi događaj. Sačuvaj zapise. Nemoj sumnjive datoteke slati kolegama.'],
    ['Vrati povjerenje', 'Rootkit može skrivati promjene. U ovom slučaju ovlašteni administrator obnavlja sustav iz pouzdanog izvora i provjerava ga prije povratka u rad.'],
  ], stations: [at('containment', 'Izolacija LAB-04', 6, 16, 'network', 0xff9bb1), at('samples', 'Laboratorijski izvještaji', 5, 5, 'bug', 0xffcf76), at('recovery', 'Pouzdan oporavak', 16, 4, 'backup', 0x60d8ff), at('malware-test', 'Provjera sustava', 26, 17, 'check', 0xb4a1ff), exit] },
  { id: 5, title: 'Tko se prijavio?', subtitle: 'RAČUNI I DNEVNICI', description: 'Istraži sumnjivu prijavu i zaštiti račun s dva faktora.', color: '#b6a3ff', rooms: ['DNEVNIK', 'IDENTITET', 'PROVJERA'], floors: [0x292e47, 0x302d48, 0x203748], debrief: 'Zašto promjena lozinke i opoziv sesija nisu ista radnja? Objasni i razliku između prijave i ovlasti.', lesson: [
    ['Čitaj zapise u kontekstu', 'Uspješna prijava s nepoznatog uređaja traži provjeru s vlasnikom. Odbijena lozinka nije isto što i otvorena sesija. Zapise čuvamo.'],
    ['Zaštiti račun', 'Koristi dugu i jedinstvenu lozinku. Upravitelj lozinki pomaže u stvaranju i čuvanju. Kod incidenta provjeri i opozovi aktivne sesije.'],
    ['Dodaj drugi faktor', 'Lozinka je nešto što znaš; sigurnosni ključ nešto što posjeduješ. Dvije lozinke nisu dva različita faktora. Prijava ne proširuje ovlasti.'],
  ], stations: [at('sessions', 'Dnevnik prijava', 5, 6, 'log', 0xb6a3ff), at('identity', 'Nova lozinka', 16, 4, 'lock'), at('mfa', 'Drugi faktor', 16, 16, 'key', 0xffcf76), at('auth-test', 'Provjera prijave', 26, 5, 'check', 0x67e7ab), exit] },
  { id: 6, title: 'Ojačaj sustav', subtitle: 'SIGURNA RADNA STANICA', description: 'Ažuriraj sustav, smanji ovlasti i ostavi potrebne usluge.', color: '#7ddbdd', rooms: ['NADOGRADNJE', 'OVLASTI', 'USLUGE'], floors: [0x183c40, 0x213c48, 0x29394a], debrief: 'Zašto računalo s isključenim svim uslugama nije nužno dobro zaštićen školski sustav?', lesson: [
    ['Zatvori poznate propuste', 'Sigurnosne nadogradnje preuzimaj iz provjerenog izvora. Nakon potrebnog ponovnog pokretanja provjeri jesu li primijenjene.'],
    ['Smanji svakodnevne ovlasti', 'Učenik radi kao standardni korisnik. Administrator odobrava potrebne promjene sustava. UAC je jedna od zaštitnih mjera.'],
    ['Zadrži potreban rad', 'Ukloni nepotrebne usluge, ali omogući nastavu i nadogradnje. Isprobaj dopuštene i zabranjene radnje prije predaje računala.'],
  ], stations: [at('patches', 'Sigurnosne nadogradnje', 6, 5, 'update', 0x7ddbdd), at('accounts', 'Korisnički računi', 16, 4, 'access', 0xb6a3ff), at('services', 'Upravljačka ploča usluga', 26, 6, 'network', 0xffcf76), at('harden-test', 'Provjera radne stanice', 26, 17, 'check', 0x67e7ab), exit] },
];
export const TARGET_TEXT: Record<string, string> = {card:'Preuzmi službenu karticu',door:'Postavi kontrolu ulaza',ups:'Zaštiti napajanje poslužitelja',paper:'Preuzmi osjetljiv ispis',shred:'Sigurno uništi ispis',drill:'Isprobaj zaštitu',exit:'Dođi do izlaza',schedule:'Uredi prava na javni raspored',grades:'Uredi prava na mapu Ocjene',secret:'Preuzmi povjerljivu datoteku',encrypt:'Šifriraj datoteku',deliver:'Predaj i provjeri datoteku',rad:'Pronađi završni rad',mjerenja:'Pronađi mjerenja',nacrt:'Pronađi nacrt',backup:'Pripremi odvojenu kopiju',failure:'Pokreni probni kvar',verify:'Provjeri obnovljeni sadržaj'};
export const TILE = 32, COLS = 32, ROWS = 22;
Object.assign(TARGET_TEXT, { containment: 'Izoliraj i prijavi LAB-04', samples: 'Razvrstaj laboratorijske izvještaje', recovery: 'Obnovi sustav iz pouzdanog izvora', 'malware-test': 'Provjeri povratak u rad', sessions: 'Istraži sumnjivu prijavu', identity: 'Postavi jedinstvenu lozinku', mfa: 'Dodaj drugi faktor prijave', 'auth-test': 'Isprobaj zaštitu računa', patches: 'Primijeni sigurnosne nadogradnje', accounts: 'Postavi potrebne ovlasti', services: 'Uredi potrebne usluge', 'harden-test': 'Provjeri rad i zaštitu' });
const PASSAGES: Record<number, number[][]> = {
  4: [[3,4,16,17],[5,6,17,18],[7,8,9],[13,14,15],[25,26,27]],
  5: [[5,6,14,15],[3,4,17,18],[3,4,5],[17,18,19],[23,24,25]],
  6: [[8,9,16,17],[5,6,18,19],[6,7,8],[13,14,15],[27,28,29]],
};
export function walls(level = 1): Set<string> {
  const w = new Set<string>();
  const [left, right, west, center, east] = PASSAGES[level] || [[5,6,16,17],[9,10,17,18],[4,5,6],[15,16,17],[25,26,27]];
  for (let x=0;x<COLS;x++) {w.add(`${x},0`);w.add(`${x},${ROWS-1}`);}
  for (let y=0;y<ROWS;y++) {w.add(`0,${y}`);w.add(`${COLS-1},${y}`);}
  for (let y=1;y<ROWS-1;y++) {if (!left.includes(y)) w.add(`11,${y}`); if (!right.includes(y)) w.add(`21,${y}`);}
  for (let x=1;x<11;x++) if (!west.includes(x)) w.add(`${x},11`);
  for (let x=12;x<21;x++) if (!center.includes(x)) w.add(`${x},7`);
  for (let x=22;x<COLS-1;x++) if (!east.includes(x)) w.add(`${x},14`);
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
