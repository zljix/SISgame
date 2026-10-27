import { DECISIONS, flowsFor, samplesFor, servicesFor, type MalwareKind, type ServiceSettings } from './missions.ts';
import { EXPERT_REVIEWS, JUNIOR_CHOICES, type ContentTier } from './curriculum.ts';
import { alertsFor, verdictsFor, WIFI_GUESTS, WIFI_SECURITY, wifiPreview, type AlertVerdict, type WifiSettings } from './network.ts';
import { budgetFor, cleanMeasures, cleanResponse, prioritiesFor, priorityFor, RESPONSE_ORDER, riskPreview, risksFor, type ResponseStep, type RiskPriority } from './operations.ts';
import { cleanHashAnswers, cleanSignatureAnswers, cleanSignatureKey, hashFilesFor, hashMatches, signedFilesFor, signaturePreview, type HashVerdict, type SignatureKey, type SignatureVerdict } from './integrity.ts';

export type Difficulty = 'relaxed' | 'easy' | 'medium' | 'hard';
export type Access = 'none' | 'read' | 'write';
export type Permissions = { student: Access; teacher: Access; guest: Access };
export type Check = { done: boolean; errors: number };
export interface Run {
  level: number; difficulty: Difficulty; content: ContentTier; x: number; y: number;
  review: { enabled: boolean; started: boolean; remaining: number; expired: boolean; answers: Record<string,string> };
  networkRules: Record<string, boolean>;
  permissions?: Partial<Record<'schedule'|'grades',Permissions>>;
  sampleAnswers?: Record<string,MalwareKind>;
  sessionChoice?: {event:string;response:string};
  serviceSettings?: ServiceSettings;
  alertAnswers: Record<string, AlertVerdict>;
  wifiSettings: WifiSettings;
  riskAnswers: Record<string, RiskPriority>;
  riskMeasures: string[];
  responseOrder: ResponseStep[];
  hashAnswers?: Record<string,HashVerdict>;
  signatureKey?: SignatureKey;
  signatureAnswers?: Record<string,SignatureVerdict>;
  flags: string[]; files: string[]; backup: string[]; bits: string[];
  checks: Record<string, Check>; health: number; hits: number; seconds: number;
  completed: boolean;
}
export interface Result { ok: boolean; title: string; message: string; complete?: boolean; review?: boolean }
export const VERSION = '0.11.0';
export const FILES = [
  { id: 'rad', name: 'Završni rad', text: 'Završni rad · posljednja spremljena inačica' },
  { id: 'mjerenja', name: 'Mjerenja', text: 'Temperatura: 23 °C · 12 mjerenja' },
  { id: 'nacrt', name: 'Nacrt', text: 'Nacrt sklopa · revizija 3' },
];
export const CHECKS: Record<number, string[]> = {
  1: ['door', 'ups', 'shred', 'drill'],
  2: ['schedule', 'grades', 'encrypt', 'deliver'],
  3: ['collect', 'backup', 'restore', 'verify'],
  4: ['containment', 'samples', 'recovery', 'malware-test'],
  5: ['sessions', 'identity', 'mfa', 'auth-test'],
  6: ['patches', 'accounts', 'services', 'harden-test'],
  7: ['message', 'verify-sender', 'report', 'phish-test'],
  8: ['channel', 'firewall', 'tls', 'network-test'],
  9: ['sensors', 'alerts', 'response', 'detection-test'],
  10: ['wifi-identity', 'wifi-config', 'wifi-maintenance', 'wifi-test'],
  11: ['assets', 'risk-analysis', 'risk-plan', 'risk-test'],
  12: ['incident-report', 'response-plan', 'recovery-source', 'incident-test'],
  13: ['hash-source', 'hash-lab', 'hash-response', 'hash-test'],
  14: ['sign-keys', 'sign-lab', 'sign-share', 'sign-test'],
};
export const CHECK_NAMES: Record<string, string> = {
  door: 'Kontrola pristupa prostoru', ups: 'Zaštita napajanja', shred: 'Sigurno uništavanje ispisa', drill: 'Provjera fizičke zaštite',
  schedule: 'Dostupnost rasporeda', grades: 'Najmanje potrebne ovlasti', encrypt: 'Šifriranje u prijenosu', deliver: 'Provjera zaštićenog prijenosa',
  collect: 'Odabir važnih podataka', backup: 'Odvojena sigurnosna kopija', restore: 'Obnova nakon kvara', verify: 'Provjera obnovljenog sadržaja',
  containment: 'Izolacija i prijava incidenta', samples: 'Prepoznavanje štetnog ponašanja', recovery: 'Oporavak iz pouzdanog izvora', 'malware-test': 'Provjera prije povratka u rad',
  sessions: 'Zapisi i opoziv sesija', identity: 'Jedinstvena lozinka', mfa: 'Dva različita faktora', 'auth-test': 'Provjera prijave i ovlasti',
  patches: 'Službene sigurnosne nadogradnje', accounts: 'Potrebne ovlasti računa', services: 'Samo potrebne usluge', 'harden-test': 'Siguran i dostupan sustav',
  message: 'Pregled sumnjive poruke', 'verify-sender': 'Neovisna provjera pošiljatelja', report: 'Sigurna prijava obmane', 'phish-test': 'Provjera sigurnog nastavka',
  channel: 'Zaštićen mrežni prijenos', firewall: 'Najmanji potreban mrežni pristup', tls: 'Provjera identiteta poslužitelja', 'network-test': 'Provjera dopuštenih i zabranjenih veza',
  sensors: 'Razlika otkrivanja i sprječavanja', alerts: 'Zaključivanje iz sigurnosnih zapisa', response: 'Ciljano ograničavanje incidenta', 'detection-test': 'Provjera zaštite i dopuštenog rada',
  'wifi-identity': 'Provjera mreže poznatim putem', 'wifi-config': 'Zaštita Wi-Fi veze i odvajanje gostiju', 'wifi-maintenance': 'Zaštita i održavanje pristupne točke', 'wifi-test': 'Provjera gostujućeg pristupa',
  assets: 'Imovina, prijetnje i slabosti', 'risk-analysis': 'Prioritet prema vjerojatnosti i učinku', 'risk-plan': 'Mjere unutar raspoloživog plana', 'risk-test': 'Provjera mjera i preostalog rizika',
  'incident-report': 'Činjenična prijava poznatim kanalom', 'response-plan': 'Plan ograničavanja, oporavka i provjere', 'recovery-source': 'Pouzdana kopija i poznati gubitak rada', 'incident-test': 'Odobren povratak i pouke incidenta',
  'hash-source': 'Pouzdan izvor očekivanog sažetka', 'hash-lab': 'Usporedba SHA-256 sažetaka', 'hash-response': 'Postupanje pri nepodudaranju', 'hash-test': 'Ponovna provjera sadržaja i granica zaključka',
  'sign-keys': 'Uloge ključeva i potvrda izvora', 'sign-lab': 'Provjera potpisa i povjerenja u ključ', 'sign-share': 'Zasebna zaštita povjerljivosti', 'sign-test': 'Provjera izvora, sadržaja i pristupa',
};
export function newRun(level: number, difficulty: Difficulty = 'easy', content: ContentTier = 'standard', timed = false): Run {
  if (!CHECKS[level]) throw new Error('Nepoznata misija');
  return { level, difficulty, content, review: {enabled:content==='expert'&&timed,started:false,remaining:90,expired:false,answers:{}}, networkRules:{}, alertAnswers:{}, wifiSettings:{security:content==='junior'?'wpa3':'',guests:''}, riskAnswers:{}, riskMeasures:[], responseOrder:cleanResponse([],content), ...(level===13?{hashAnswers:{}}:{}), ...(level===14?{signatureKey:'' as SignatureKey,signatureAnswers:{}}:{}), x: 112, y: 560, flags: [], files: [], backup: [], bits: [], checks: Object.fromEntries(CHECKS[level].map(k => [k, { done: false, errors: 0 }])), health: 3, hits: 0, seconds: 0, completed: false };
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
  return { ok: false, title, message:run.content==='junior'&&JUNIOR_CHOICES[key]?JUNIOR_CHOICES[key].help:message };
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
  if(run.content==='expert' && station===EXPERT_REVIEWS[run.level]?.station && !has(run,'expert-review')){
    if(!CHECKS[run.level].slice(0,-1).every(key=>run.checks[key].done))return {ok:false,title:'Priprema nije dovršena',message:'Najprije dovrši prethodne tri sigurnosne zadaće.'};
    return {ok:false,review:true,title:'Analiziraj završni slučaj',message:'Prije završne provjere primijeni mjere na novi slučaj.'};
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
  const decision = DECISIONS[station];
  if (decision?.level === run.level) {
    if (!decision.requires.every(key => run.checks[key]?.done)) return { ok: false, title: 'Priprema nije dovršena', message: decision.locked };
    const option = decision.options.find(option => option.id === choice);
    if (!option) return { ok: false, title: 'Odaberi ponuđeni postupak', message: 'Ovaj postupak nije dostupan na stanici.' };
    if (choice !== decision.correct) return wrong(run, station, 'Razmotri posljedicu postupka', option.feedback);
    return good(run, station, decision.title, decision.message);
  }
  return { ok: false, title: 'Nema radnje', message: 'Provjeri trenutačni cilj.' };
}
export function classifyMalware(run: Run, answers: Record<string, MalwareKind | ''>): Result {
  if (run.level !== 4 || run.completed) return { ok: false, title: 'Analiza nije dostupna', message: 'Pokreni misiju Sumnjivi program.' };
  if (!run.checks.containment.done) return { ok: false, title: 'Najprije izoliraj računalo', message: 'Ograniči mrežnu komunikaciju LAB-04 i prijavi incident prije analize.' };
  const samples=samplesFor(run.content);
  if (samples.some(sample => !answers[sample.id])) return { ok: false, title: 'Dovrši razvrstavanje', message: 'Odaberi vrstu za svaki prikazani izvještaj.' };
  const mistaken = samples.find(sample => answers[sample.id] !== sample.kind);
  if (mistaken) return wrong(run, 'samples', `${mistaken.label}: pogledaj način rada`, mistaken.explanation);
  return good(run, 'samples', 'Ponašanja su prepoznata', run.content==='junior'?'A: program koji vara (trojanski konj). B: program koji se sam širi (crv). Ne treba ih pokretati da bi proučio izvještaj.':'A: trojanski konj. B: crv. C: virus. Zaključak proizlazi iz opisanog ponašanja, ne iz naziva ili ikone datoteke. U stvarnosti jedan program može kombinirati više svojstava.');
}
export function secureSession(run: Run, event: string, response: string): Result {
  if (run.level !== 5 || run.completed) return { ok: false, title: 'Dnevnik nije dostupan', message: 'Pokreni misiju Tko se prijavio?' };
  if (!event || !response) return { ok: false, title: 'Odaberi događaj i postupak', message: 'Označi sumnjivu uspješnu prijavu i način zaštite računa.' };
  if (event !== 'unknown') return wrong(run, 'sessions', 'Provjeri ishod i uređaj', event === 'vpn' ? 'Vlasnik potvrđuje svoj uređaj i službenu VPN vezu. Nova IP adresa sama nije dokaz upada; usporedi sve dokaze.' : event === 'typo' ? 'Pogrešna lozinka ovdje nije stvorila sesiju. Traži uspješnu prijavu koju vlasnik ne prepoznaje; i neuspjele pokušaje vrijedi pratiti.' : 'Vlasnik potvrđuje prijavu sa školskog uređaja. Sama uspješna prijava nije dokaz incidenta: usporedi uređaj i potvrdu vlasnika.');
  if (response !== 'revoke') return wrong(run, 'sessions', 'Sesija i dalje može biti aktivna', response === 'erase' ? 'Brisanje zapisa ne prekida pristup, a uklanja tragove. Sačuvaj zapise, prijavi događaj i opozovi sesije računa.' : 'Sama promjena lozinke ne mora prekinuti postojeću sesiju. Potrebno je i izričito opozvati sesije te provjeriti pristup.');
  return good(run, 'sessions', 'Sesije su opozvane, zapisi sačuvani', 'Prijava u 22:43 je izdvojena za istragu. U simulaciji administrator privremeno blokira prijave i opoziva sve sesije računa. Vlasnik sada treba novu lozinku i dodatni faktor.');
}
export function configureServices(run: Run, settings: ServiceSettings): Result {
  if (run.level !== 6 || run.completed) return { ok: false, title: 'Postavke nisu dostupne', message: 'Pokreni misiju Ojačaj sustav.' };
  if (!['patches', 'accounts'].every(key => run.checks[key].done)) return { ok: false, title: 'Najprije pripremi sustav', message: 'Primijeni nadogradnje i postavi standardni korisnički račun.' };
  const mismatch = servicesFor(run.content).find(service => settings[service.id] !== service.expected);
  if (mismatch) return wrong(run, 'services', `${mismatch.label}: provjeri politiku`, mismatch.expected ? 'Ova je usluga potrebna. Isključivanjem svih usluga narušavaš rad ili održavanje sustava. Uključi je i ukloni samo nepotrebnu uslugu.' : 'Udaljeni pristup ovoj stanici nije odobren ni potreban. Isključi ga; potrebne školske usluge ostavi uključene.');
  return good(run, 'services', 'Rade samo potrebne usluge', 'Školske nadogradnje i predaja radova ostaju dostupne. Nepotreban udaljeni pristup je isključen. Završna provjera ispitat će i sigurnost i rad nastave.');
}
export function configureFirewall(run:Run,rules:Record<string,boolean>):Result {
  if(run.level!==8||run.completed)return {ok:false,title:'Pravila nisu dostupna',message:'Pokreni mrežnu misiju.'};
  if(!run.checks.channel.done)return {ok:false,title:'Najprije odaberi zaštićen prijenos',message:'Odaberi kanal koji štiti školski rad na putu do portala.'};
  run.networkRules={...(run.content==='junior'?{admin:true}:{}),...Object.fromEntries(flowsFor(run.content).map(flow=>[flow.id,rules[flow.id]===true]))};
  const mismatch=flowsFor(run.content).find(flow=>run.networkRules[flow.id]!==flow.allow);
  if(mismatch)return wrong(run,'firewall','Provjeri učinak pravila',mismatch.allow?'Potrebna veza je blokirana. Dopusti školski rad i odobreno upravljanje, uz ograničenje izvora.':'Nepoznati izvor dobio je pristup upravljanju. Odbij tu vezu; otvaranje svih veza nije potrebno.');
  return good(run,'firewall','Potrebne veze prolaze',run.content==='junior'?'Učenik može predati rad. Nepoznata osoba ne može upravljati školskim računalom.':'Učenik može predati rad. Ovlaštena administracija ostaje dopuštena, a nepoznati izvor ne može upravljati poslužiteljem.');
}
export function classifyAlerts(run:Run,answers:Record<string,string>):Result {
  if(run.level!==9||run.completed||run.checks.alerts.done)return {ok:false,title:'Analiza nije dostupna',message:'Nastavi do sljedećeg cilja u misiji Trag iza alarma.'};
  if(!run.checks.sensors.done)return {ok:false,title:'Najprije upoznaj senzore',message:'Na prvoj stanici usporedi upozorenje IDS-a i blokiranje IPS-a.'};
  const reports=alertsFor(run.content),verdicts=verdictsFor(run.content);
  run.alertAnswers=Object.fromEntries(reports.filter(report=>verdicts.some(([id])=>id===answers[report.id])).map(report=>[report.id,answers[report.id] as AlertVerdict]));
  if(reports.some(report=>!run.alertAnswers[report.id]))return {ok:false,title:'Dovrši pregled zapisa',message:'Odaberi zaključak za svaki prikazani zapis. Prazan odabir ne bilježi se kao pogreška.'};
  const mistaken=reports.find(report=>run.alertAnswers[report.id]!==report.answer);
  if(mistaken)return wrong(run,'alerts','Provjeri zapis '+mistaken.id.replace('maintenance','A').replace('compromised','B').replace('probe','C'),mistaken.feedback);
  return good(run,'alerts','Dokazi su razvrstani',run.content==='junior'?'A je dopuštena školska provjera. B je potvrđen neovlašten pristup. Zatraži ciljanu zaštitu LAB-09.':'A: potvrđeno održavanje. B: potvrđen incident na LAB-09. C: odbijeni pokušaji traže daljnju provjeru. Zadrži zapise i ograniči potvrđeni incident.');
}
export function configureWifi(run:Run,settings:WifiSettings):Result {
  if(run.level!==10||run.completed||run.checks['wifi-config'].done)return {ok:false,title:'Postavke nisu dostupne',message:'Nastavi do sljedećeg cilja u misiji Wi-Fi za prave goste.'};
  if(!run.checks['wifi-identity'].done)return {ok:false,title:'Najprije provjeri mrežu',message:'Koristi poznati školski kontakt i odobrene upute za povezivanje.'};
  run.wifiSettings={security:run.content==='junior'?'wpa3':WIFI_SECURITY.some(([id])=>id===settings.security)?settings.security:'',guests:WIFI_GUESTS.some(([id])=>id===settings.guests)?settings.guests:''};
  if(!run.wifiSettings.security||!run.wifiSettings.guests)return {ok:false,title:'Odaberi obje postavke',message:'Postavi zaštitu Wi-Fi veze i pristup gostiju prije provjere.'};
  const preview=wifiPreview(run.wifiSettings);
  if(!preview.protectedRadio)return wrong(run,'wifi-config','Zaštiti bežičnu vezu','Svi uređaji u ovoj misiji podržavaju WPA3-Personal. WEP je zastario, a otvorena mreža nema traženu zaštitu. Odaberi WPA3 i zasebnu dugu lozinku.');
  if(!preview.guestInternet)return wrong(run,'wifi-config','Gostima je potreban internet','Zadatak traži pristup internetu. Potpuna zabrana ne ispunjava cilj; odvoji goste od interne školske mreže.');
  if(preview.guestInternal)return wrong(run,'wifi-config','Gosti ne trebaju interne podatke','Dopusti internet, ali mrežnim pravilima odvoji goste od interne školske mreže. Sam naziv Gost nije zaštita.');
  return good(run,'wifi-config','Gostujuća mreža je odvojena','WPA3-Personal i zasebna duga lozinka štite bežičnu vezu. U simulaciji su primijenjena i pravila odvajanja: gosti imaju internet, ali nemaju put do interne školske mreže.');
}
export function assessRisks(run: Run, answers: Record<string, string>): Result {
  if (run.level !== 11 || run.completed || run.checks['risk-analysis'].done) return {ok:false,title:'Procjena nije dostupna',message:'Nastavi do sljedećeg cilja misije o riziku.'};
  if (!run.checks.assets.done) return {ok:false,title:'Najprije popiši imovinu',message:'Na prvoj stanici poveži podatke, usluge i uređaje s potrebama škole.'};
  const risks = risksFor(run.content), priorities = prioritiesFor(run.content);
  run.riskAnswers = Object.fromEntries(risks.filter(risk => priorities.some(([id]) => id === answers[risk.id])).map(risk => [risk.id, answers[risk.id] as RiskPriority]));
  if (risks.some(risk => !run.riskAnswers[risk.id])) return {ok:false,title:'Dovrši procjenu',message:'Odaberi prioritet za svaki prikazani slučaj. Prazan odabir nije pogreška.'};
  const mistaken = risks.find(risk => run.riskAnswers[risk.id] !== priorityFor(risk.likelihood, risk.impact));
  if (mistaken) return wrong(run,'risk-analysis',mistaken.label + ': usporedi dokaze',mistaken.feedback);
  return good(run,'risk-analysis','Prioriteti su obrazloženi','Sada odaberi mjere koje djeluju na opisane slabosti. Ni mala cijena uređaja ni lijep izgled ne govore koliko su važni podatci koje čuva.');
}
export function planRiskMeasures(run: Run, selected: readonly string[]): Result {
  if (run.level !== 11 || run.completed || run.checks['risk-plan'].done) return {ok:false,title:'Plan nije dostupan',message:'Nastavi do sljedećeg cilja misije o riziku.'};
  if (!run.checks['risk-analysis'].done) return {ok:false,title:'Najprije procijeni rizike',message:'Poveži vjerojatnost i učinak za svaki slučaj prije raspodjele resursa.'};
  run.riskMeasures = cleanMeasures(selected,run.content);
  if (!run.riskMeasures.length) return {ok:false,title:'Odaberi mjere',message:'Označi što želiš provesti. Prikaz ispod pokazuje trošak i očekivani učinak.'};
  const preview = riskPreview(run.content,run.riskMeasures);
  if (preview.cost > budgetFor(run.content)) return wrong(run,'risk-plan','Plan prelazi raspoložive resurse','Za ovu vježbu imaš ograničen broj jedinica rada. Izostavi mjeru koja ne rješava važniji opisani rizik.');
  if (!run.riskMeasures.includes('backup')) return wrong(run,'risk-plan','Radovi i dalje nemaju kopiju','UPS može pomoći pri nestanku struje, ali ne spašava jedine primjerke s pokvarenog diska. Odaberi odvojenu kopiju i provjeru obnove.');
  if (run.content !== 'junior' && !run.riskMeasures.includes('accounts')) return wrong(run,'risk-plan','Zajednički pristup je ostao','Nakon arhive zaštiti i račun za promjenu rasporeda. Ukloni zajedničku lozinku i dodijeli najmanje potrebne ovlasti.');
  return good(run,'risk-plan','Mjere odgovaraju rizicima','Plan stane u raspoložive resurse. Kopija ublažava gubitak pri kvaru; kvar i dalje može nastati. Predviđeni učinak treba provjeriti na sljedećoj stanici.');
}
export function planIncidentResponse(run: Run, order: readonly string[]): Result {
  if (run.level !== 12 || run.completed || run.checks['response-plan'].done) return {ok:false,title:'Plan nije dostupan',message:'Nastavi do sljedećeg cilja misije o incidentu.'};
  if (!run.checks['incident-report'].done) return {ok:false,title:'Najprije prijavi činjenice',message:'Sačuvaj opažanja i prijavi događaj poznatim školskim kanalom.'};
  run.responseOrder = cleanResponse(order,run.content);
  if (run.responseOrder.some(step => !step)) return {ok:false,title:'Dovrši sva tri koraka',message:'Odaberi redoslijed prema planu ovog slučaja. Prazno polje nije pogrešna odluka.'};
  const mismatch = run.responseOrder.findIndex((step,index) => step !== RESPONSE_ORDER[index]);
  if (mismatch !== -1) return wrong(run,'response-plan','Provjeri korak ' + (mismatch+1),[
    'Najprije ograniči širenje uz administratora i očuvaj dokaze. Brisanje zapisa otežava istragu; samo obnavljanje ne zaustavlja incident.',
    'Kad je širenje ograničeno, administrator uklanja uzrok i priprema obnovu iz provjerenog izvora. Ponavljanje izolacije nije oporavak.',
    'Prije povratka provjeri sadržaj, ovlasti i rad usluge. Administrator odobrava povezivanje uz nadzor. Prijava i čuvanje dokaza traju kroz sve korake.',
  ][mismatch]);
  return good(run,'response-plan','Plan je spreman za provedbu','Slijed je provjeren na modelu. Sada odaberi pouzdan izvor podataka. Komunikacija i čuvanje dokaza provode se tijekom cijelog postupka.');
}
export function submitExpertReview(run:Run,answers:Record<string,string>):Result {
  const review=EXPERT_REVIEWS[run.level];
  if(run.content!=='expert'||run.completed||!review)return {ok:false,title:'Analiza nije dostupna',message:'Ovaj zadatak pripada razini Expert.'};
  if(!CHECKS[run.level].slice(0,-1).every(key=>run.checks[key].done))return {ok:false,title:'Priprema nije dovršena',message:'Najprije primijeni mjere na prethodne tri stanice.'};
  if(run.review.enabled&&!run.review.started)return {ok:false,title:'Pokreni izazov ili isključi mjerenje',message:'Najprije pročitaj slučaj. Mjerenje je opcionalno i ne utječe na bodove znanja.'};
  run.review.answers=Object.fromEntries(review.questions.filter(question=>question.choices.some(([value])=>value===answers[question.id])).map(question=>[question.id,answers[question.id]]));
  if(review.questions.some(question=>!answers[question.id]))return {ok:false,title:'Dovrši plan postupanja',message:'Odaberi postupak za svaku stavku.'};
  const mistaken=review.questions.find(question=>answers[question.id]!==question.answer);
  if(mistaken)return wrong(run,review.station,'Provjeri: '+mistaken.label,mistaken.feedback);
  flag(run,'expert-review');return {ok:true,title:'Plan je obrazložen činjenicama',message:'Odabrane mjere odgovaraju dokazima i ograničenjima slučaja.'};
}
export function advanceReviewClock(run:Run,seconds:number){
  if(!run.review.enabled||!run.review.started||run.review.expired||has(run,'expert-review')||run.completed||!Number.isFinite(seconds)||seconds<=0)return;
  run.review.remaining=Math.max(0,run.review.remaining-seconds);
  run.review.expired=run.review.remaining===0;
}
export function applyPermissions(run: Run, kind: 'schedule' | 'grades', p: Permissions): Result {
  if (run.level !== 2 || run.completed) return { ok: false, title: 'Postavke nisu dostupne', message: 'Pokreni misiju Samo za ovlaštene.' };
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
  } else if (run.level === 3) {
    if (!has(run, 'collect')) return FILES.find(f => !run.files.includes(f.id))?.id || 'backup';
    if (!has(run, 'backup')) return 'backup'; if (!has(run, 'failure')) return 'failure'; if (!has(run, 'restore')) return 'backup'; if (!has(run, 'verify')) return 'verify';
  } else return CHECKS[run.level].find(key => !run.checks[key]?.done) || 'exit';
  return 'exit';
}

export function compareHashes(run:Run,answers:unknown):Result {
  if(run.level!==13||run.completed||run.checks['hash-lab'].done)return {ok:false,title:'Usporedba nije dostupna',message:'Zadatak pripada nedovršenoj misiji o sažetcima.'};
  if(!run.checks['hash-source'].done)return {ok:false,title:'Najprije potvrdi izvor',message:'Na prvoj stanici preuzmi očekivani sažetak poznatim školskim putem.'};
  run.hashAnswers=cleanHashAnswers(answers,run.content);
  const files=hashFilesFor(run.content);
  if(files.some(file=>!run.hashAnswers![file.id]))return {ok:false,title:'Usporedi sve primjerke',message:'Odaberi zaključak za svaku prikazanu datoteku. Prazno polje nije pogrešna odluka.'};
  const wrongFile=files.find(file=>run.hashAnswers![file.id]!== (hashMatches(file)?'same':'changed'));
  if(wrongFile)return wrong(run,'hash-lab','Ponovno usporedi sažetke',`${wrongFile.label}: ${hashMatches(wrongFile)?'sadržaj ima isti SHA-256 kao referenca. Sam naziv datoteke nije dio ove provjere sadržaja.':'SHA-256 se razlikuje. Isti naziv datoteke ne znači isti sadržaj.'}`);
  return good(run,'hash-lab','Usporedba je točna','Promijenjeno vrijeme ima drukčiji sažetak. Uspoređeni su podatci, a ne samo naziv datoteke. Podudaranje ne govori je li sadržaj bezopasan.');
}
export function verifySignatures(run:Run,key:unknown,answers:unknown):Result {
  if(run.level!==14||run.completed||run.checks['sign-lab'].done)return {ok:false,title:'Provjera nije dostupna',message:'Zadatak pripada nedovršenoj misiji o potpisima.'};
  if(!run.checks['sign-keys'].done)return {ok:false,title:'Najprije provjeri uloge ključeva',message:'Na prvoj stanici upoznaj privatni ključ za potpisivanje i potvrđeni javni ključ za provjeru.'};
  run.signatureKey=cleanSignatureKey(key);run.signatureAnswers=cleanSignatureAnswers(answers,run.content);
  const files=signedFilesFor(run.content);
  if(!run.signatureKey||files.some(file=>!run.signatureAnswers![file.id]))return {ok:false,title:'Dopuni provjeru',message:'Odaberi javni ključ i odluku za svaki zapis. Nepotpuna predaja ne bilježi pogrešku.'};
  if(run.signatureKey!=='school')return wrong(run,'sign-lab','Potvrdi čiji je ključ','Ključ iz iste poruke nema potvrđenu vezu sa školom. Za prihvaćanje školskog zapisa koristi javni ključ potvrđen poznatim putem.');
  const wrongFile=files.find(file=>run.signatureAnswers![file.id]!== (signaturePreview(file,run.signatureKey!).acceptable?'accept':'hold'));
  if(wrongFile)return wrong(run,'sign-lab','Poveži potpis i izvor',`${wrongFile.label}: ${signaturePreview(wrongFile,run.signatureKey).acceptable?'potpis prolazi uz potvrđeni školski ključ, pa ovaj neizmijenjeni zapis možeš prihvatiti.':'zapis ne prolazi provjeru potvrđenim školskim ključem. Zaustavi prihvaćanje i zatraži provjeru.'}`);
  return good(run,'sign-lab','Potpis i izvor su provjereni','Prihvaćen je izvorni školski zapis, a izmijenjeni ili nepotvrđeni zaustavljeni. Provjeren potpis ne skriva sadržaj niti jamči da je svaka uputa u njemu sigurna.');
}
