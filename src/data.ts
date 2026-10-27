import { JUNIOR_LESSONS, type ContentTier } from './curriculum.ts';
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
  { id: 7, title: 'Ne nasjedaj poruci', subtitle: 'PHISHING I PROVJERA', description: 'Pregledaj sumnjivu poruku, provjeri pošiljatelja i prijavi pokušaj prijevare.', color: '#ffa68b', rooms: ['PORUKE', 'PROVJERA', 'ODGOVOR'], floors: [0x3a303a, 0x2e354b, 0x203c42], debrief: 'Zašto HTTPS na poveznici iz poruke ne dokazuje da je poruku poslala škola?', lesson: [
    ['Phishing', 'Lažna poruka može oponašati školu, tražiti hitan odgovor i voditi na stranicu koja krade lozinku. U igri čitaš izmišljenu poruku.'],
    ['Neovisna provjera', 'Za provjeru koristi ranije poznati broj ili službeni portal iz vlastite oznake. Odgovaranje na sumnjivu poruku nije neovisna provjera.'],
    ['Prijava i zaštita', 'Prijavi sumnjivu poruku školskom administratoru i sačuvaj podatke za istragu. Nemoj je prosljeđivati razredu niti upisivati lozinku.'],
  ], stations: [at('message', 'Sumnjiva poruka', 5, 5, 'file', 0xffa68b), at('verify-sender', 'Provjera pošiljatelja', 16, 4, 'access'), at('report', 'Prijava prijevare', 16, 16, 'log'), at('phish-test', 'Provjera odgovora', 26, 17, 'check', 0xb4a1ff), exit] },
  { id: 8, title: 'Mreža pod nadzorom', subtitle: 'VATROZID I TLS', description: 'Omogući potreban prijenos, ograniči pristup i provjeri certifikat poslužitelja.', color: '#80d8ff', rooms: ['PRIJENOS', 'PRAVILA', 'POSLUŽITELJ'], floors: [0x183748, 0x203c44, 0x28354b], debrief: 'Što štiti TLS, a što pravila vatrozida? Zašto su školi potrebne obje mjere?', lesson: [
    ['Zaštićen prijenos', 'HTTPS koristi TLS za zaštitu podataka u prijenosu i provjeru poslužitelja. Ne jamči da je sadržaj stranice pošten.'],
    ['Potrebne veze', 'Vatrozid dopušta ili blokira veze prema pravilima. Dopusti školski rad i odobreno upravljanje, a blokiraj neovlašten pristup.'],
    ['Provjera certifikata', 'Certifikat treba odgovarati nazivu poslužitelja, biti važeći i dolaziti iz pouzdanog lanca. Upozorenje o pogrešnom nazivu treba istražiti i ispraviti.'],
  ], stations: [at('channel', 'Zaštićen kanal', 5, 5, 'key'), at('firewall', 'Mrežna pravila', 16, 4, 'network', 0xffcf76), at('tls', 'Provjera certifikata', 26, 5, 'lock'), at('network-test', 'Provjera mreže', 26, 17, 'check', 0x67e7ab), exit] },
  { id: 9, title: 'Trag iza alarma', subtitle: 'OTKRIVANJE I ODGOVOR', description: 'Usporedi senzore, istraži upozorenja i ograniči potvrđeni incident.', color: '#edb579', rooms: ['SENZORI', 'DOKAZI', 'ODGOVOR'], floors: [0x3b3040, 0x273948, 0x283c39], debrief: 'Zašto ni alarm ni izostanak alarma nisu sami po sebi dovoljan dokaz o stanju sustava?', lesson: [
    ['IDS i IPS', 'IDS prati događaje i upozorava na sumnjivo ponašanje. IPS može i zaustaviti promet prema pravilima. U ovoj misiji djeluješ uz ovlaštenog administratora.'],
    ['Upozorenje treba istražiti', 'Usporedi alarm s dnevnikom i potvrđenim održavanjem. Odobreni rad može izazvati lažni alarm. Odbijeni pokušaj nije dokaz uspješnog upada; potvrđena neovlaštena promjena jest dokaz incidenta.'],
    ['Ciljana zaštita', 'Sačuvaj zapise i ograniči potvrđeni incident. Isprobaj blokiranje štetnog prometa i dopušten školski rad. Senzor može propustiti prijetnju, zato provjeravamo više izvora.'],
  ], stations: [at('sensors', 'IDS i IPS', 5, 5, 'radar', 0xedb579), at('alerts', 'Istraga upozorenja', 16, 4, 'log'), at('response', 'Ciljana zaštita', 16, 16, 'network', 0xff9bb1), at('detection-test', 'Proba nadzora', 26, 17, 'check', 0x67e7ab), exit] },
  { id: 10, title: 'Wi-Fi za prave goste', subtitle: 'BEŽIČNA MREŽA', description: 'Provjeri mrežu, zaštiti bežičnu vezu i odvoji goste od školskih podataka.', color: '#a6d78b', rooms: ['POVEZIVANJE', 'GOSTI', 'ODRŽAVANJE'], floors: [0x243e3a, 0x24364a, 0x3b3443], debrief: 'Zašto naziv Gost i jaka Wi-Fi lozinka sami ne sprječavaju pristup internoj školskoj mreži?', lesson: [
    ['Provjeri kome se spajaš', 'SSID je naziv Wi-Fi mreže. Može se kopirati; jači signal i poznat naziv ne dokazuju vlasnika. Koristi odobrene upute i postavke dobivene poznatim školskim kontaktom.'],
    ['Zaštiti i odvoji', 'Svi uređaji ovog malog školskog prostora podržavaju WPA3-Personal. Koristi dugu, zasebnu Wi-Fi lozinku. Gosti trebaju internet, ali pravila odvajanja moraju blokirati njihovu vezu prema internoj školskoj mreži.'],
    ['Održavaj pristupnu točku', 'Pristupna točka povezuje bežične uređaje s mrežom. Promijeni početnu administratorsku lozinku i primijeni provjerene nadogradnje. Administratorska lozinka nije isto što i lozinka za Wi-Fi. HTTPS je i dalje potreban za web.'],
  ], stations: [at('wifi-identity', 'Provjera mreže', 6, 5, 'wifi', 0xa6d78b), at('wifi-config', 'Mreža za goste', 16, 4, 'network', 0x60d8ff), at('wifi-maintenance', 'Pristupna točka', 26, 6, 'update', 0xffcf76), at('wifi-test', 'Provjera odvajanja', 26, 17, 'check', 0x67e7ab), exit] },
  { id: 11, title: 'Što prvo zaštititi?', subtitle: 'IMOVINA I RIZIK', description: 'Usporedi rizike i rasporedi ograničene resurse na mjere koje štite školski rad.', color: '#f2c879', rooms: ['IMOVINA', 'PROCJENA', 'PLAN MJERA'], floors: [0x3c3441, 0x293a47, 0x2a413e], debrief: 'Zašto sigurnosna kopija smanjuje posljedicu kvara, ali ne mora smanjiti vjerojatnost da se disk pokvari?', lesson: [
    ['Što štitimo i od čega?', 'Imovina obuhvaća podatke, usluge i uređaje. Prijetnja je mogući štetni događaj, primjerice kvar diska. Slabost je stanje koje omogućuje štetu, primjerice nepostojanje kopije.'],
    ['Vjerojatnost i učinak', 'Vjerojatnost govori koliko je štetan događaj izgledan u promatranom razdoblju; učinak koliku bi štetu izazvao. U igri tim daje ocjene 1, 2 ili 3 za sljedeći mjesec. Umnožak 1–2 znači nizak, 3–4 srednji, a 6–9 visok prioritet. To je pojednostavljen školski model.'],
    ['Mjera i preostali rizik', 'Mjera treba djelovati na opisani problem. Kopija ublažava gubitak rada, ali ne popravlja disk. Resurse prvo usmjeri na važnije rizike, provjeri učinak i dogovori praćenje preostalog rizika.'],
  ], stations: [at('assets', 'Popis školske imovine', 5, 5, 'archive', 0xf2c879), at('risk-analysis', 'Ploča rizika', 16, 4, 'radar', 0xff9bb1), at('risk-plan', 'Raspodjela mjera', 16, 16, 'network', 0x60d8ff), at('risk-test', 'Provjera učinka mjera', 26, 17, 'check', 0x67e7ab), exit] },
  { id: 12, title: 'Smireno kroz incident', subtitle: 'PLAN I OPORAVAK', description: 'Prijavi činjenice, složi plan odgovora i odaberi provjerenu kopiju za povratak u rad.', color: '#c3adff', rooms: ['PRIJAVA', 'PLAN ODGOVORA', 'POVRATAK U RAD'], floors: [0x30354b, 0x3a3046, 0x203e43], debrief: 'Što bi prijavio ako čista kopija ne sadrži posljednju izmjenu rada? Kako bi spriječio da se ista slabost ponovi?', lesson: [
    ['Prijavi činjenice', 'Sigurnosni incident ugrožava podatke ili rad sustava. Zabilježi što, gdje i kada opažaš te prijavi poznatim školskim kanalom. Sačuvaj zapise; ne nagađaj tko je kriv niti dijeli osjetljive podatke razredu.'],
    ['Ograniči, oporavi, provjeri', 'Za ovaj slučaj administrator najprije ograničava širenje, zatim uklanja uzrok i obnavlja iz provjerenog izvora. Prije povezivanja provjerava rad i ovlasti. Komunikacija i čuvanje dokaza traju cijelo vrijeme; postupci se u stvarnosti mogu preklapati.'],
    ['Čista kopija i pouke', 'Najnovija kopija može sadržavati štetnu promjenu. Koristi provjerenu kopiju i jasno prijavi koji noviji rad nedostaje. Nakon odobrenog povratka nastavi nadzor i ažuriraj plan kako bi idući odgovor bio bolji.'],
  ], stations: [at('incident-report', 'Prijava događaja', 6, 5, 'log', 0xc3adff), at('response-plan', 'Plan postupanja', 16, 4, 'network', 0x60d8ff), at('recovery-source', 'Izvor za obnovu', 26, 6, 'backup', 0xffcf76), at('incident-test', 'Odobren povratak', 26, 17, 'check', 0x67e7ab), exit] },
  { id: 13, title: 'Je li sadržaj isti?', subtitle: 'SAŽETAK I CJELOVITOST', description: 'Provjeri izvor, usporedi sažetke datoteka i reagiraj na promjenu sadržaja.', color: '#7dded3', rooms: ['POUZDAN IZVOR', 'USPOREDBA', 'PONOVNA PROVJERA'], floors: [0x234047, 0x293d50, 0x263f3b], debrief: 'Zašto isti naziv nije dokaz istog sadržaja? Što ako su datoteka i očekivani sažetak došli iz iste sumnjive poruke?', lesson: [
    ['Sažetak sadržaja', 'Kriptografska hash funkcija iz podataka računa sažetak. SHA-256 daje 256 bitova, ovdje prikazanih kao 64 znaka 0–9 i a–f. Računa se iz točnih bajtova sadržaja. I mala izmjena tipično daje sasvim drukčiji sažetak; drugi naziv istog sadržaja ne mijenja ga.'],
    ['Pouzdana usporedba', 'Za provjeru cjelovitosti usporedi izračunani sažetak s očekivanim sažetkom iste inačice iz potvrđenog izvora. Različiti sažetci znače različite podatke. Podudaranje s nepouzdanim popisom ne potvrđuje školsko podrijetlo.'],
    ['Granice zaključka', 'Sažetak nije šifriranje: ne skriva datoteku i iz njega ne obnavljamo izvorni rad. Ni podudaranje samo po sebi ne jamči da je program bezopasan. Pri nepodudaranju zaustavi uporabu, provjeri izvor i preuzmi odobreni primjerak pa ponovi usporedbu.'],
  ], stations: [at('hash-source', 'Očekivani sažetak', 5, 5, 'log', 0x7dded3), at('hash-lab', 'Usporedba datoteka', 16, 4, 'archive', 0x60d8ff), at('hash-response', 'Postupak pri promjeni', 16, 16, 'network', 0xffcf76), at('hash-test', 'Ponovna provjera', 26, 17, 'check', 0x67e7ab), exit] },
  { id: 14, title: 'Čiji je potpis?', subtitle: 'POTPIS I POVJERENJE', description: 'Provjeri potpis, vezu javnog ključa sa školom i zasebno zaštiti povjerljivi prilog.', color: '#b6b5ff', rooms: ['ULOGE KLJUČEVA', 'PROVJERA POTPISA', 'SIGURNA PREDAJA'], floors: [0x30384d, 0x35334e, 0x244047], debrief: 'Može li potpis biti matematički valjan, a izvor nepotvrđen? Zašto potpisani povjerljivi prilog ipak treba zaštititi od čitanja?', lesson: [
    ['Dva ključa, dvije uloge', 'Digitalni potpis povezuje sadržaj s ključem potpisnika i pomaže otkriti izmjenu. Potpisnik potpisuje privatnim ključem koji čuva za sebe. Drugi provjeravaju potpis odgovarajućim javnim ključem. Slika rukom pisanog potpisa nije ta kriptografska provjera.'],
    ['Provjera i povjerenje', 'Uspješna provjera znači da potpis odgovara podatcima i odabranom javnom ključu. Prije zaključka tko je potpisnik moraš pouzdano potvrditi čiji je ključ. U ovoj vježbi školski ključ dobiven je poznatim putem; ključ iz neprovjerene poruke nema takvu potvrdu.'],
    ['Potpis ne skriva sadržaj', 'Potpis štiti provjeru cjelovitosti i podrijetla uz pouzdan ključ, ali ne daje povjerljivost niti jamči bezopasnost sadržaja. Osjetljiv prilog zasebno šifriraj za ovlaštenog primatelja i ograniči pristup. Privatni potpisni ključ ne šalje se primatelju.'],
  ], stations: [at('sign-keys', 'Uloge ključeva', 6, 5, 'key', 0xb6b5ff), at('sign-lab', 'Provjera potpisa', 16, 4, 'log', 0x60d8ff), at('sign-share', 'Povjerljivi prilog', 26, 6, 'lock', 0xffcf76), at('sign-test', 'Provjera predaje', 26, 17, 'check', 0x67e7ab), exit] },
];
export const missionNumber=(id:number)=>String(id).padStart(2,'0');
export function levelContent(level:Level,tier:ContentTier):Level {
  return tier==='junior'?{...level,...JUNIOR_LESSONS[level.id],debrief:undefined}:level;
}
export const TARGET_TEXT: Record<string, string> = {card:'Preuzmi službenu karticu',door:'Postavi kontrolu ulaza',ups:'Zaštiti napajanje poslužitelja',paper:'Preuzmi osjetljiv ispis',shred:'Sigurno uništi ispis',drill:'Isprobaj zaštitu',exit:'Dođi do izlaza',schedule:'Uredi prava na javni raspored',grades:'Uredi prava na mapu Ocjene',secret:'Preuzmi povjerljivu datoteku',encrypt:'Šifriraj datoteku',deliver:'Predaj i provjeri datoteku',rad:'Pronađi završni rad',mjerenja:'Pronađi mjerenja',nacrt:'Pronađi nacrt',backup:'Pripremi odvojenu kopiju',failure:'Pokreni probni kvar',verify:'Provjeri obnovljeni sadržaj'};
export const TILE = 32, COLS = 32, ROWS = 22;
Object.assign(TARGET_TEXT, { containment: 'Izoliraj i prijavi LAB-04', samples: 'Razvrstaj laboratorijske izvještaje', recovery: 'Obnovi sustav iz pouzdanog izvora', 'malware-test': 'Provjeri povratak u rad', sessions: 'Istraži sumnjivu prijavu', identity: 'Postavi jedinstvenu lozinku', mfa: 'Dodaj drugi faktor prijave', 'auth-test': 'Isprobaj zaštitu računa', patches: 'Primijeni sigurnosne nadogradnje', accounts: 'Postavi potrebne ovlasti', services: 'Uredi potrebne usluge', 'harden-test': 'Provjeri rad i zaštitu' });
const PASSAGES: Record<number, number[][]> = {
  4: [[3,4,16,17],[5,6,17,18],[7,8,9],[13,14,15],[25,26,27]],
  5: [[5,6,14,15],[3,4,17,18],[3,4,5],[17,18,19],[23,24,25]],
  6: [[8,9,16,17],[5,6,18,19],[6,7,8],[13,14,15],[27,28,29]],
  7: [[4,5,17,18],[5,6,16,17],[6,7,8],[15,16,17],[25,26,27]],
  8: [[6,7,15,16],[4,5,17,18],[4,5,6],[14,15,16],[27,28,29]],
  9: [[4,5,15,16],[6,7,18,19],[7,8,9],[16,17,18],[24,25,26]],
  10: [[7,8,17,18],[4,5,16,17],[4,5,6],[13,14,15],[26,27,28]],
  11: [[3,4,14,15],[7,8,16,17],[5,6,7],[17,18,19],[23,24,25]],
  12: [[6,7,18,19],[3,4,15,16],[7,8,9],[14,15,16],[27,28,29]],
  13: [[4,5,18,19],[7,8,16,17],[4,5,6],[15,16,17],[24,25,26]],
  14: [[7,8,15,16],[4,5,18,19],[6,7,8],[17,18,19],[25,26,27]],
};
Object.assign(TARGET_TEXT,{message:'Pregledaj sumnjivu poruku','verify-sender':'Provjeri pošiljatelja neovisnim putem',report:'Prijavi pokušaj prijevare','phish-test':'Provjeri postupak zaštite',channel:'Odaberi zaštićen prijenos',firewall:'Postavi potrebne mrežne veze',tls:'Provjeri identitet poslužitelja','network-test':'Isprobaj mrežnu zaštitu'});
Object.assign(TARGET_TEXT,{sensors:'Usporedi IDS i IPS',alerts:'Istraži upozorenja i druge zapise',response:'Ograniči potvrđeni incident','detection-test':'Isprobaj nadzor i dopušten rad','wifi-identity':'Provjeri mrežu poznatim putem','wifi-config':'Zaštiti vezu i odvoji goste','wifi-maintenance':'Zaštiti pristupnu točku','wifi-test':'Isprobaj internet i odvajanje gostiju'});
Object.assign(TARGET_TEXT,{assets:'Popiši što škola treba zaštititi','risk-analysis':'Odredi prioritet prema dokazima','risk-plan':'Rasporedi mjere unutar plana','risk-test':'Provjeri učinak i preostali rizik','incident-report':'Prijavi što, gdje i kada','response-plan':'Složi tri koraka postupanja','recovery-source':'Odaberi provjerenu kopiju','incident-test':'Provjeri i odobri povratak u rad'});
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

Object.assign(TARGET_TEXT,{'hash-source':'Potvrdi izvor očekivanog sažetka','hash-lab':'Usporedi sažetke sadržaja','hash-response':'Reagiraj na nepodudaranje','hash-test':'Ponovi provjeru odobrenog primjerka','sign-keys':'Upoznaj uloge i izvor ključeva','sign-lab':'Provjeri potpis i povjerenje','sign-share':'Zaštiti povjerljivi prilog','sign-test':'Isprobaj provjeru i siguran pristup'});
