export type Difficulty = 'easy' | 'medium' | 'hard';
export type Access = 'none' | 'read' | 'write';
export type Permissions = { student: Access; teacher: Access; guest: Access };
export type Check = { done: boolean; errors: number };
export interface Run {
  level: number; difficulty: Difficulty; x: number; y: number;
  flags: string[]; files: string[]; backup: string[]; bits: string[];
  checks: Record<string, Check>; health: number; hits: number; seconds: number;
  completed: boolean;
}
export interface Result { ok: boolean; title: string; message: string; complete?: boolean }
export const VERSION = '0.1.1';
export const FILES = [
  { id: 'rad', name: 'Završni rad', text: 'Završni rad · posljednja spremljena inačica' },
  { id: 'mjerenja', name: 'Mjerenja', text: 'Temperatura: 23 °C · 12 mjerenja' },
  { id: 'nacrt', name: 'Nacrt', text: 'Nacrt sklopa · revizija 3' },
];
export const CHECKS: Record<number, string[]> = {
  1: ['door', 'ups', 'shred', 'drill'],
  2: ['schedule', 'grades', 'encrypt', 'deliver'],
  3: ['collect', 'backup', 'restore', 'verify'],
};
export const CHECK_NAMES: Record<string, string> = {
  door: 'Kontrola pristupa prostoru', ups: 'Zaštita napajanja', shred: 'Sigurno uništavanje ispisa', drill: 'Provjera fizičke zaštite',
  schedule: 'Dostupnost rasporeda', grades: 'Najmanje potrebne ovlasti', encrypt: 'Šifriranje u prijenosu', deliver: 'Provjera zaštićenog prijenosa',
  collect: 'Odabir važnih podataka', backup: 'Odvojena sigurnosna kopija', restore: 'Obnova nakon kvara', verify: 'Provjera obnovljenog sadržaja',
};
export function newRun(level: number, difficulty: Difficulty = 'easy'): Run {
  if (!CHECKS[level]) throw new Error('Nepoznata misija');
  return { level, difficulty, x: 112, y: 560, flags: [], files: [], backup: [], bits: [], checks: Object.fromEntries(CHECKS[level].map(k => [k, { done: false, errors: 0 }])), health: 3, hits: 0, seconds: 0, completed: false };
}
export const has = (run: Run, flag: string) => run.flags.includes(flag);
export function flag(run: Run, name: string) { if (!has(run, name)) run.flags.push(name); }
export function score(run: Run) { return Object.values(run.checks).filter(c => c.done).length * 25; }
export function arcadeScore(run: Run) { return run.bits.length * 5; }
export function ready(run: Run) { return CHECKS[run.level].every(k => run.checks[k]?.done); }
function good(run: Run, key: string, title: string, message: string): Result {
  if (run.checks[key]) run.checks[key].done = true;
  flag(run, key); return { ok: true, title, message };
}
function wrong(run: Run, key: string, title: string, message: string): Result {
  if (run.checks[key] && !run.checks[key].done) run.checks[key].errors++;
  return { ok: false, title, message };
}
export function collect(run: Run, id: string): Result {
  if (id === 'card' && run.level === 1) { flag(run, id); return { ok: true, title: 'Službena kartica preuzeta', message: 'Kartica potvrđuje tvoju ovlast. Priđi ulaznim vratima i uključi provjeru pristupa.' }; }
  if (id === 'paper' && run.level === 1) { flag(run, id); return { ok: true, title: 'Osjetljiv ispis preuzet', message: 'Ispis sadrži osobne podatke. Odnesi ga do uništavača u servisnoj sobi.' }; }
  if (id === 'secret' && run.level === 2) {
    if (!has(run, 'grades')) return { ok: false, title: 'Najprije uredi ovlasti', message: 'Prije preuzimanja povjerljive datoteke postavi pristup mapi Ocjene.' };
    flag(run, id); return { ok: true, title: 'Datoteka je kod tebe', message: 'Prije prijenosa do arhive zaštiti je na stanici za šifriranje.' };
  }
  if (run.level === 3 && FILES.some(f => f.id === id) && !has(run, 'failure')) {
    if (!run.files.includes(id)) run.files.push(id);
    if (run.files.length === 3) return good(run, 'collect', 'Sve važne datoteke su odabrane', 'Odnesi ih do stanice za kopiranje i odaberi odvojenu pohranu.');
    return { ok: true, title: `${run.files.length}/3 datoteke`, message: 'Pronađi preostale dokumente označene plavom bojom.' };
  }
  return { ok: false, title: 'Trenutačno nije dostupno', message: 'Provjeri cilj misije.' };
}
export function act(run: Run, station: string, choice: string): Result {
  if (run.completed) return { ok: false, title: 'Misija je završena', message: 'Za novi pokušaj odaberi misiju na karti.' };
  if (station === 'exit') {
    if (!ready(run)) return { ok: false, title: 'Provjera još nije gotova', message: 'Dovrši sve četiri sigurnosne zadaće. Dodirni trenutačni cilj za put do sljedećeg mjesta.' };
    run.completed = true; return { ok: true, title: 'Sektor je osiguran!', message: 'Zaštitu si postavio i provjerio njezin učinak.', complete: true };
  }
  if (run.level === 1) {
    if (station === 'door') {
      if (!has(run, 'card')) return { ok: false, title: 'Potrebna je službena kartica', message: 'Preuzmi plavu karticu kod ulaza. Ovlast se mora provjeriti prije ulaska.' };
      if (choice === 'authorized') return good(run, 'door', 'Pristup je ograničen', 'Vrata sada propuštaju ovlaštene osobe. Kamera sama po sebi ne sprječava neovlašten ulazak.');
      return wrong(run, 'door', choice === 'camera' ? 'Kamera bilježi, vrata ostaju otvorena' : 'I ovlaštene osobe trebaju pristup', 'Postavi provjeru kartice: ovlaštena osoba smije ući, a neovlaštena ne smije.');
    }
    if (station === 'ups') {
      if (choice === 'server') return good(run, 'ups', 'Poslužitelj je na UPS-u', 'UPS daje ograničeno vrijeme za spremanje rada i uredno gašenje. Ne zamjenjuje sigurnosnu kopiju.');
      return wrong(run, 'ups', 'Odaberi kritičnu opremu', 'U ovoj sobi cilj je sačuvati rad poslužitelja pri kratkom nestanku struje. Projektor nije prioritet, a produžni kabel nema pričuvnu bateriju.');
    }
    if (station === 'shred') {
      if (!has(run, 'paper')) return { ok: false, title: 'Pronađi osjetljiv ispis', message: 'Preuzmi papir s osobnim podatcima u lijevoj gornjoj sobi.' };
      if (choice === 'destroy') return good(run, 'shred', 'Podatci su sigurno zbrinuti', 'Ispis je uništen odgovarajućim uništavačem papira. Cijeli list u košu mogao bi pročitati netko drugi.');
      return wrong(run, 'shred', 'Podatci su i dalje čitljivi', 'Za ovaj osjetljiv ispis odaberi odgovarajući uništavač papira. Samo presavijanje ili običan koš nisu dovoljni.');
    }
    if (station === 'drill') {
      if (!['door', 'ups', 'shred'].every(f => has(run, f))) return { ok: false, title: 'Priprema nije dovršena', message: 'Provjeri vrata, napajanje poslužitelja i osjetljiv ispis prije završne simulacije.' };
      return good(run, 'drill', 'Probni događaji su prošli', 'Neovlaštena kartica: odbijena. Ovlaštena kartica: prihvaćena. Nestanak struje: UPS omogućio spremanje i uredno gašenje. Ispis: nečitljiv.');
    }
  }
  if (run.level === 2) {
    if (station === 'encrypt') {
      if (!has(run, 'secret')) return { ok: false, title: 'Preuzmi povjerljivu datoteku', message: 'Datoteka te čeka na plavom terminalu u središnjoj sobi.' };
      if (choice === 'encrypt') return good(run, 'encrypt', 'Datoteka je šifrirana', 'Sadržaj je sada nečitljiv bez odgovarajućeg ključa. Ključ je u ovoj simulaciji dostupan samo ovlaštenoj arhivi.');
      return wrong(run, 'encrypt', 'Naziv ne štiti sadržaj', 'Preimenovanje ili skrivanje datoteke nije šifriranje. Šifriraj sadržaj prije prijenosa.');
    }
    if (station === 'deliver') {
      if (!has(run, 'encrypt')) return wrong(run, 'deliver', 'Datoteka još nije zaštićena', 'Najprije preuzmi i šifriraj povjerljivu datoteku. Sama mapa s lozinkom u nazivu ne štiti sadržaj.');
      return good(run, 'deliver', 'Prijenos je provjeren', 'Ovlaštena arhiva dešifrirala je datoteku svojim ključem i usporedila sadržaj s izvornikom. Pristup neovlaštenog korisnika odbijen je.');
    }
  }
  if (run.level === 3) {
    if (station === 'backup' && !has(run, 'failure')) {
      if (run.files.length !== 3) return { ok: false, title: 'Nedostaju važne datoteke', message: 'Pronađi završni rad, mjerenja i nacrt. Kopija mora obuhvatiti sve što treba sačuvati.' };
      if (choice === 'separate') { run.backup = [...run.files]; return good(run, 'backup', 'Odvojena kopija je spremna', 'Sve tri datoteke kopirane su na vanjski disk koji je nakon kopiranja odspojen i sigurno spremljen. Sada isprobaj kvar radnog diska.'); }
      return wrong(run, 'backup', 'Jedan kvar ugrozio bi obje kopije', 'Druga mapa ili particija na istom fizičkom disku ne štiti od njegova kvara. Za ovaj zadatak izaberi odvojeni vanjski disk.');
    }
    if (station === 'failure') {
      if (!has(run, 'backup') || run.backup.length !== 3) return { ok: false, title: 'Najprije osiguraj kopiju', message: 'Pripremi odvojenu kopiju sve tri datoteke prije probnog kvara.' };
      if (has(run, 'failure')) return { ok: true, title: 'Kvar je već simuliran', message: 'Vrati se do stanice za kopije i obnovi podatke na zamjenski disk.' };
      flag(run, 'failure'); run.files = []; return { ok: true, title: 'Radni disk je otkazao', message: 'Izvorne datoteke više nisu dostupne. Odvojena kopija je sačuvana. Vrati se do nje i pokreni obnovu na zamjenski disk.' };
    }
    if (station === 'backup' && has(run, 'failure')) {
      if (run.backup.length !== 3) return { ok: false, title: 'Kopija nije potpuna', message: 'Potrebna je kopija sve tri datoteke.' };
      run.files = [...run.backup]; return good(run, 'restore', 'Datoteke su obnovljene', 'Tri datoteke vraćene su na zamjenski disk. Preostaje otvoriti ih i provjeriti njihov sadržaj.');
    }
    if (station === 'verify') {
      if (!has(run, 'restore') || !FILES.every(f => run.files.includes(f.id))) return { ok: false, title: 'Najprije obnovi podatke', message: 'Obnova je gotova tek kad datoteke vratiš iz kopije. Zatim ih ovdje otvori i provjeri.' };
      return good(run, 'verify', 'Sadržaj sve tri datoteke je potvrđen', 'Obnovljene datoteke otvaraju se i odgovaraju spremljenoj inačici. Uspješno kopiranje samo po sebi nije dokaz uspješne obnove.');
    }
  }
  return { ok: false, title: 'Nema radnje', message: 'Provjeri trenutačni cilj.' };
}
export function applyPermissions(run: Run, kind: 'schedule' | 'grades', p: Permissions): Result {
  if (run.level !== 2) return { ok: false, title: 'Pogrešna misija', message: '' };
  const expected: Permissions = kind === 'schedule' ? { student: 'read', teacher: 'write', guest: 'read' } : { student: 'none', teacher: 'write', guest: 'none' };
  if (p.student === expected.student && p.teacher === expected.teacher && p.guest === expected.guest) return good(run, kind, 'Prava su primijenjena i isprobana', kind === 'schedule' ? 'Učenik i gost mogu čitati javni raspored. Nastavnik ga može čitati i mijenjati. Nitko nema nepotrebnu ovlast.' : 'Prema zadanoj politici ove simulacije mapu Ocjene otvara i mijenja samo ovlašteni nastavnik. Učenik i gost nemaju pristup ovoj mapi.');
  const role = p.student !== expected.student ? 'Učenik' : p.teacher !== expected.teacher ? 'Nastavnik' : 'Gost';
  return wrong(run, kind, `${role}: ovlast ne odgovara zadatku`, 'Pročitaj politiku iznad tablice. Čitanje omogućuje pregled, a uređivanje i pregled i promjenu. Potrebne korisnike ne smijemo nepotrebno blokirati.');
}
export function nextTarget(run: Run): string {
  if (run.level === 1) {
    if (!has(run, 'card')) return 'card'; if (!has(run, 'door')) return 'door'; if (!has(run, 'ups')) return 'ups';
    if (!has(run, 'paper')) return 'paper'; if (!has(run, 'shred')) return 'shred'; if (!has(run, 'drill')) return 'drill';
  } else if (run.level === 2) {
    if (!has(run, 'schedule')) return 'schedule'; if (!has(run, 'grades')) return 'grades'; if (!has(run, 'secret')) return 'secret';
    if (!has(run, 'encrypt')) return 'encrypt'; if (!has(run, 'deliver')) return 'deliver';
  } else {
    if (!has(run, 'collect')) return FILES.find(f => !run.files.includes(f.id))?.id || 'backup';
    if (!has(run, 'backup')) return 'backup'; if (!has(run, 'failure')) return 'failure'; if (!has(run, 'restore')) return 'backup'; if (!has(run, 'verify')) return 'verify';
  }
  return 'exit';
}
