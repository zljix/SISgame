import type { ContentTier } from './curriculum.ts';
// Fictional classroom scenarios. No samples, credentials or system changes are used.
export type DecisionOption = { id: string; label: string; detail: string; feedback: string };
export type Decision = {
  level: number; description: string; requires: string[]; locked: string;
  correct: string; options: DecisionOption[]; title: string; message: string;
};

export const DECISIONS: Record<string, Decision> = {
  containment: {
    level: 4, description: 'Zaštita je prijavila sumnjiv program na računalu LAB-04. Preuzmi ulogu ovlaštenog školskog administratora i spriječi daljnju komunikaciju računala.', requires: [], locked: '', correct: 'isolate',
    options: [
      { id: 'monitor', label: 'Ugasi samo monitor', detail: 'Zaslon je taman, računalo nastavlja raditi.', feedback: 'Gašenje zaslona ne prekida mrežnu komunikaciju ni rad programa.' },
      { id: 'isolate', label: 'Izoliraj i prijavi', detail: 'Prekini mrežne veze; sačuvaj zapise za analizu.', feedback: '' },
      { id: 'restart', label: 'Ponovno pokreni računalo', detail: 'Vrati ga na mrežu čim se pokrene.', feedback: 'Ponovno pokretanje samo po sebi ne uklanja infekciju. Najprije ograniči komunikaciju i prijavi događaj.' },
    ],
    title: 'LAB-04 je izoliran', message: 'Mrežne veze zaraženog računala su prekinute, a događaj prijavljen administratoru. Zapisi su sačuvani. Ostala školska računala nastavljaju raditi. Pregledaj izvještaje u laboratoriju.',
  },
  recovery: {
    level: 4, description: 'Pouzdana izvanmrežna provjera na LAB-04 otkrila je i rootkit koji skriva promjene sustava. Zapisi su sačuvani. Plan oporavka za ovaj slučaj traži čistu instalaciju.', requires: ['containment', 'samples'], locked: 'Najprije izoliraj LAB-04 i razvrstaj tri laboratorijska izvještaja.', correct: 'rebuild',
    options: [
      { id: 'scan', label: 'Vjeruj jednom čistom nalazu', detail: 'Alat pokrenut u zaraženom sustavu više ne prijavljuje ništa.', feedback: 'Rootkit može skrivati aktivnost. Jedan čist nalaz iz kompromitiranog sustava nije dovoljan za povjerenje u oporavak.' },
      { id: 'restore-all', label: 'Vrati sve stare programe', detail: 'Kopiraj i sumnjivi instalacijski paket.', feedback: 'Vraćanje zaraženog programa može obnoviti i infekciju. Potrebni su pouzdan sustav i provjereni podatci.' },
      { id: 'rebuild', label: 'Obnovi iz pouzdanog izvora', detail: 'Čist sustav, sigurnosne nadogradnje i provjereni podatci.', feedback: '' },
    ],
    title: 'Čist sustav je pripremljen', message: 'U simulaciji je sustav ponovno instaliran iz provjerenog izvora i ažuriran. Vraćeni su samo provjereni podatci. LAB-04 ostaje izoliran do završne provjere.',
  },
  'malware-test': {
    level: 4, description: 'U izoliranom okruženju provjeri sustav, nadogradnje i obnovljene dokumente prije povratka LAB-04 u rad.', requires: ['containment', 'samples', 'recovery'], locked: 'Izoliraj računalo, razvrstaj izvještaje i dovrši pouzdan oporavak.', correct: 'test',
    options: [{ id: 'test', label: 'Provjeri pa vrati u rad', detail: 'Pregled zaštite, provjera nadogradnji i otvaranje dokumenata.', feedback: '' }],
    title: 'Računalo je vraćeno u rad', message: 'Provjere u simulaciji su prošle: zaštita je aktivna, nadogradnje su primijenjene i dokumenti se ispravno otvaraju. Administrator odobrava ponovno povezivanje i nastavlja nadzor.',
  },
  identity: {
    level: 5, description: 'Sumnjive sesije su opozvane. Za školski račun odaberi novu lozinku. Ovdje biraš postupak; ne upisuj stvarne lozinke.', requires: ['sessions'], locked: 'Najprije pregledaj dnevnik i zaštiti račun opozivom sumnjivih sesija.', correct: 'unique',
    options: [
      { id: 'reuse', label: 'Preuzmi lozinku e-pošte', detail: 'Ista lozinka za dvije usluge.', feedback: 'Ako jedna usluga izgubi lozinke, ponovljena lozinka ugrožava i drugi račun. Svaki račun treba vlastitu lozinku.' },
      { id: 'unique', label: 'Duga, nasumična i jedinstvena', detail: 'Generiraj i spremi je u upravitelj lozinki.', feedback: '' },
      { id: 'suffix', label: 'Staroj dodaj broj 1', detail: 'Mala, predvidljiva promjena poznate lozinke.', feedback: 'Mala promjena kompromitirane lozinke lako se pogađa. Odaberi novu, dugu i jedinstvenu lozinku.' },
    ],
    title: 'Nova lozinka je postavljena', message: 'Račun ima dugu, nasumičnu lozinku koju ne koristi nijedna druga usluga. Upravitelj je čuva. Sljedeći je korak dodati neovisan faktor prijave.',
  },
  mfa: {
    level: 5, description: 'Uz lozinku dodaj drugi, različit faktor. Dva podatka koja znaš nisu dva različita faktora.', requires: ['identity'], locked: 'Najprije postavi novu, jedinstvenu lozinku.', correct: 'key',
    options: [
      { id: 'pin', label: 'Lozinka i još jedan PIN', detail: 'Oba podatka korisnik zna.', feedback: 'Lozinka i PIN pripadaju istom faktoru: nešto što znaš. Potreban je i drugi faktor.' },
      { id: 'question', label: 'Lozinka i ime ljubimca', detail: 'Dva odgovora koja se mogu saznati ili pogoditi.', feedback: 'Sigurnosno pitanje nije neovisan faktor posjedovanja. Osobni podatci često su dostupni drugima.' },
      { id: 'key', label: 'Lozinka i sigurnosni ključ', detail: 'Nešto što znaš i registrirani FIDO2 ključ koji posjeduješ.', feedback: '' },
    ],
    title: 'Uključena su dva faktora', message: 'Za ovu prijavu potrebni su lozinka i registrirani sigurnosni ključ. FIDO2 provjerava i kojoj se usluzi prijavljuješ. Uspješna prijava ne daje dodatna prava na tuđe datoteke.',
  },
  'auth-test': {
    level: 5, description: 'Provjeri da vlasnik računa može raditi, dok stara lozinka i opozvana sesija više ne omogućuju pristup.', requires: ['sessions', 'identity', 'mfa'], locked: 'Obradi sumnjivu sesiju, promijeni lozinku i uključi drugi faktor.', correct: 'test',
    options: [{ id: 'test', label: 'Pokreni provjere prijave', detail: 'Vlasnik, stara lozinka, nedostajući ključ i opozvana sesija.', feedback: '' }],
    title: 'Pristup je provjeren', message: 'Vlasnik s novom lozinkom i ključem: prihvaćen. Stara lozinka, prijava bez ključa i opozvana sesija: odbijene. Učenički račun i dalje nema pravo uređivati Ocjene.',
  },
  patches: {
    level: 6, description: 'Školska radna stanica ima poznatu ranjivost za koju postoji sigurnosna nadogradnja. Rad učenika je spremljen, a termin održavanja je počeo.', requires: [], locked: '', correct: 'official',
    options: [
      { id: 'official', label: 'Primijeni službene nadogradnje', detail: 'Provjereni kanal, potrebni restart i provjera inačice.', feedback: '' },
      { id: 'popup', label: 'Preuzmi alat iz oglasa', detail: 'Oglas obećava da će odmah popraviti sve probleme.', feedback: 'Oglas nije pouzdan izvor nadogradnje. Koristi službeni, provjereni kanal proizvođača ili školski sustav nadogradnji.' },
      { id: 'later', label: 'Trajno odgodi nadogradnju', detail: 'Računalo zasad izgleda ispravno.', feedback: 'Računalo može raditi i istodobno imati poznatu ranjivost. Primijeni dostupnu sigurnosnu nadogradnju u dogovorenom terminu.' },
    ],
    title: 'Nadogradnja je provjerena', message: 'Službena sigurnosna nadogradnja je instalirana, računalo ponovno pokrenuto i nova inačica potvrđena. Time je uklonjena poznata ranjivost iz ovog zadatka.',
  },
  accounts: {
    level: 6, description: 'Učeniku trebaju preglednik, uređivač dokumenata i predaja radova. Instalacije i promjene sustava obavlja ovlašteni administrator.', requires: ['patches'], locked: 'Najprije primijeni i provjeri sigurnosnu nadogradnju.', correct: 'standard',
    options: [
      { id: 'admin', label: 'Svi rade kao administratori', detail: 'Svaki program odmah dobiva široke ovlasti.', feedback: 'Svakodnevni rad ne traži administratorske ovlasti. Nepotrebno visoke ovlasti povećavaju posljedice pogreške ili infekcije.' },
      { id: 'standard', label: 'Standardni korisnik za rad', detail: 'Odvojen administrator i uključen UAC za ovlaštene promjene.', feedback: '' },
      { id: 'deny', label: 'Zabrani rad svim računima', detail: 'Nitko ne može koristiti školsku stanicu.', feedback: 'Zaštita treba omogućiti potreban rad. Standardni račun zadržava svakodnevne mogućnosti bez nepotrebnih ovlasti.' },
    ],
    title: 'Ovlasti su smanjene na potrebne', message: 'Učenik radi kao standardni korisnik. Ovlaštene promjene sustava traže administratorski račun i potvrdu kroz UAC. UAC ne zamjenjuje ostale zaštitne mjere.',
  },
  'harden-test': {
    level: 6, description: 'Isprobaj i dopuštene i zabranjene radnje. Sigurnost ne smije nepotrebno onemogućiti nastavu.', requires: ['patches', 'accounts', 'services'], locked: 'Dovrši nadogradnje, ovlasti računa i postavke usluga.', correct: 'test',
    options: [{ id: 'test', label: 'Provjeri radnu stanicu', detail: 'Predaja rada radi; nepotreban udaljeni pristup i neovlaštena instalacija su odbijeni.', feedback: '' }],
    title: 'Stanica je spremna za nastavu', message: 'Predaja rada i nadogradnje rade. Nepotrebna usluga udaljenog pristupa je isključena, a standardni račun ne može samostalno instalirati program za cijeli sustav. Provjera je uspješna.',
  },
};

export type MalwareKind = 'virus' | 'worm' | 'trojan';
export const MALWARE_SAMPLES: { id: string; label: string; evidence: string; kind: MalwareKind; explanation: string }[] = [
  { id: 'a', label: 'Izvještaj A', evidence: 'Predstavlja se kao koristan instalacijski program, a potajno krade podatke. U ovom izvještaju nema samoumnažanja.', kind: 'trojan', explanation: 'Trojanski konj prikriva zlonamjernu funkciju prividno korisnim programom.' },
  { id: 'b', label: 'Izvještaj B', evidence: 'Samostalno se umnaža preko mreže koristeći ranjivu uslugu. Za širenje nije potrebno otvarati zaraženu datoteku.', kind: 'worm', explanation: 'Crv se može samostalno širiti mrežom. Za razliku od virusa, ne treba program domaćin.' },
  { id: 'c', label: 'Izvještaj C', evidence: 'Dodaje svoj kôd drugim izvršnim datotekama. Aktivira se pokretanjem zaraženog programa i zarazi nove datoteke.', kind: 'virus', explanation: 'Virus se veže uz program ili datoteku domaćina i umnaža se njihovim izvođenjem.' },
];
export const LOGIN_EVENTS = [
  { id: 'school', time: '08:10', device: 'ŠKOLA-12', outcome: 'Uspješna prijava', detail: 'Poznati uređaj · vlasnik potvrđuje prijavu' },
  { id: 'typo', time: '08:11', device: 'ŠKOLA-12', outcome: 'Pogrešna lozinka', detail: 'Pristup odbijen · sesija nije stvorena' },
  { id: 'unknown', time: '22:43', device: 'NEPOZNAT-07', outcome: 'Uspješna prijava', detail: 'Novi uređaj · vlasnik ne prepoznaje prijavu' },
];
export type ServiceSettings = { updates: boolean; remote: boolean; coursework: boolean };
export const SERVICE_RULES: { id: keyof ServiceSettings; label: string; detail: string; expected: boolean }[] = [
  { id: 'updates', label: 'Sigurnosne nadogradnje', detail: 'Moraju ostati dostupne kroz školski kanal.', expected: true },
  { id: 'remote', label: 'Udaljeni pristup radnoj stanici', detail: 'Za ovu stanicu nije potreban ni odobren.', expected: false },
  { id: 'coursework', label: 'Predaja radova', detail: 'Školska usluga potrebna za nastavu.', expected: true },
];

export const VERIFICATION_REPORTS: Record<string, [string, string][]> = {
  'malware-test': [['Zaštita sustava', 'Aktivna nakon pouzdane obnove'], ['Sigurnosne nadogradnje', 'Primijenjene i provjerene'], ['Obnovljeni dokumenti', 'Otvaraju se; sadržaj odgovara kopiji'], ['Povratak na mrežu', 'Odobren uz nastavak nadzora']],
  'auth-test': [['Vlasnik i oba faktora', 'Prijava prihvaćena'], ['Stara lozinka ili nedostajući ključ', 'Prijava odbijena'], ['Opozvana stara sesija', 'Pristup odbijen'], ['Učenik mijenja Ocjene', 'Odbijeno: nema potrebnu ovlast']],
  'harden-test': [['Predaja školskog rada', 'Dopuštena i uspješna'], ['Sigurnosne nadogradnje', 'Kanal nadogradnji dostupan'], ['Nepotreban udaljeni pristup', 'Usluga isključena'], ['Neovlaštena instalacija', 'Standardnom računu odbijena']],
};

export function samplesFor(tier: ContentTier) {
  if(tier!=='junior')return MALWARE_SAMPLES;
  return [
    {...MALWARE_SAMPLES[0],evidence:'Obećava korisnu igru, ali potajno uzima privatne podatke.',explanation:'Trojanski konj se predstavlja kao koristan program, a skriva štetnu radnju.'},
    {...MALWARE_SAMPLES[1],evidence:'Sam se kopira preko mreže na druga računala.',explanation:'Crv se može samostalno širiti s računala na računalo.'},
  ];
}
export function eventsFor(tier: ContentTier) {
  if(tier==='junior')return LOGIN_EVENTS.filter(event=>event.id!=='typo');
  if(tier==='expert')return [...LOGIN_EVENTS,{id:'vpn',time:'16:05',device:'SLUŽBENI-VPN',outcome:'Uspješna prijava',detail:'Nova mrežna adresa · vlasnik potvrđuje uređaj i prijavu'}];
  return LOGIN_EVENTS;
}
export function servicesFor(tier: ContentTier) { return tier==='junior'?SERVICE_RULES.filter(rule=>rule.id!=='updates'):SERVICE_RULES; }

const decision=(level:number,description:string,requires:string[],correct:string,options:[string,string,string][],message:string):Decision=>({level,description,requires,locked:'Najprije dovrši prethodne korake označene na cilju.',correct,options:options.map(([id,label,detail])=>({id,label,detail,feedback:id===correct?'':detail+' Ponovno pročitaj cilj i odaberi postupak koji čuva podatke i potreban pristup.'})),title:'Postupak je primijenjen',message});
Object.assign(DECISIONS,{
  message:decision(7,'Školska poruka prijeti gašenjem računa i traži lozinku. Pregledaj poruku prije ikakve prijave.',[],'inspect',[
    ['trust','Vjeruj logotipu','Poruka izgleda kao školska obavijest.'],['inspect','Zastani i provjeri zahtjev','Ne upisuj tajne podatke u ponuđenu stranicu.'],['forward','Pošalji prijatelju da isproba','Druga osoba otvara istu sumnjivu poveznicu.'],
  ],'Prijetnja hitnim gašenjem i zahtjev za lozinkom traže oprez. Logotip se može kopirati. Sumnjivu poveznicu ne isprobavamo niti šaljemo prijateljima.'),
  'verify-sender':decision(7,'Provjeri postoji li stvarna školska obavijest. Ne oslanjaj se na kontakt iz sumnjive poruke.',['message'],'known',[
    ['reply','Odgovori na istu poruku','Odgovor može ponovno stići prevarantu.'],['known','Provjeri poznatim putem','Otvori spremljenu školsku oznaku ili kontaktiraj nastavnika poznatim kontaktom.'],
  ],'Provjera poznatim putem vodi do stvarne škole. U ovom scenariju škola potvrđuje da zahtjev nije njezin.'),
  report:decision(7,'Škola je potvrdila da poruka nije njezina. Sačuvaj podatke potrebne za prijavu i zaštiti druge.',['verify-sender'],'report',[
    ['share','Objavi poveznicu da je svi vide','Drugi bi je mogli otvoriti.'],['report','Prijavi školskom administratoru','Koristi dogovoreni kanal, zatim ukloni poruku iz pristigle pošte.'],
  ],'Poruka je prijavljena poznatim školskim kanalom u simulaciji. Ne prosljeđuješ aktivnu poveznicu prijateljima. Administrator može upozoriti druge i obraditi incident.'),
  'phish-test':decision(7,'Provjeri da lažna prijava ostaje zatvorena, a prava školska usluga dostupna.',['message','verify-sender','report'],'test',[
    ['test','Provjeri siguran nastavak','Prava oznaka radi; lažnoj stranici nisu predani podatci.'],
  ],'Prava školska stranica dostupna je iz poznate oznake. Lozinka i kod nisu predani lažnoj stranici, a sumnjiva poruka je prijavljena.'),
  channel:decision(8,'Učenik šalje rad školskom portalu. Odaberi prijenos koji štiti sadržaj i provjerava pravi poslužitelj.',[],'https',[
    ['http','Obični HTTP','Sadržaj ove veze nije zaštićen TLS-om.'],['https','HTTPS uz valjan certifikat','Zaštićen prijenos do provjerenog imena poslužitelja.'],
  ],'Odabran je HTTPS. Zaštita prijenosa uključuje i valjanu provjeru poslužitelja; sama oznaka HTTPS ne znači da je svaka stranica pouzdana.'),
  tls:decision(8,'Prilikom prijave pojavljuje se upozorenje: certifikat nije izdan za ime školskog portala.',['channel','firewall'],'stop',[
    ['bypass','Zanemari upozorenje','Nastavi unositi lozinku.'],['stop','Zaustavi prijavu i prijavi problem','Administrator treba ispraviti potvrdu identiteta poslužitelja.'],
  ],'Prijava je zaustavljena. U simulaciji administrator postavlja odgovarajući valjani certifikat, a preglednik ponovno provjerava ime, rok valjanosti i povjerenje. Tek tada dopušta prijavu.'),
  'network-test':decision(8,'Isprobaj dopuštene i zabranjene veze nakon ispravka certifikata.',['channel','firewall','tls'],'test',[
    ['test','Pošalji probne zahtjeve','Predaja rada i ovlaštena administracija trebaju raditi; neovlaštena administracija ne smije.'],
  ],'Školski HTTPS zahtjev prolazi. Administracija prolazi samo iz odobrene mreže, a neovlaštena veza je odbijena. Poslužitelj se predstavlja odgovarajućim certifikatom.'),
});
Object.assign(VERIFICATION_REPORTS,{
  'phish-test':[['Poznata školska oznaka','Prava usluga dostupna'],['Lažna prijava','Lozinka i kod nisu poslani'],['Prijava poruke','Administrator je obaviješten'],['Zaštita drugih','Sumnjiva poveznica nije dijeljena']],
  'network-test':[['Učenik → HTTPS','Predaja rada dopuštena'],['Administrator → SSH','Odobrena mreža dopuštena'],['Nepoznati izvor → SSH','Veza odbijena'],['Certifikat portala','Ime, valjanost i povjerenje provjereni']],
});
export const NETWORK_FLOWS = [
  {id:'web',label:'Učenik → školski portal',detail:'HTTPS · TCP 443 · predaja rada je potrebna',allow:true},
  {id:'admin',label:'Upravljačka mreža → poslužitelj',detail:'SSH · TCP 22 · odobrena administracija',allow:true},
  {id:'outside',label:'Nepoznati izvor → poslužitelj',detail:'SSH · TCP 22 · nema ovlast za upravljanje',allow:false},
];
export function flowsFor(tier:ContentTier){return tier==='junior'?NETWORK_FLOWS.filter(flow=>flow.id!=='admin'):NETWORK_FLOWS;}

Object.assign(DECISIONS, {
  sensors: {
    level: 9, description: 'Uspoređuješ dva probna načina rada. IDS šalje upozorenje administratoru. IPS uz otkrivanje može zaustaviti promet prema pravilima. Koji zaključak odgovara tome?', requires: [], locked: '', correct: 'compare',
    options: [
      {id:'auto',label:'Svaki alarm već je zaustavio vezu',detail:'Čim vidim upozorenje, smatram promet blokiranim.',feedback:'IDS u ovom načinu upozorava, ali ne blokira vezu. Provjeri što je alat stvarno učinio; alarm nije dokaz blokiranja.'},
      {id:'compare',label:'Razlikuj upozorenje i blokiranje',detail:'Provjeri zapis IDS-a i učinak pravila IPS-a.',feedback:''},
      {id:'perfect',label:'Bez alarma nema prijetnje',detail:'Osloni se samo na zaslon senzora.',feedback:'Senzor može propustiti prijetnju. Izostanak alarma nije dokaz da incidenta nema; usporedi i druge zapise.'},
    ], title:'Uloge senzora su jasne',message:'IDS je u probi zabilježio i prijavio događaj. IPS je uz zapis zaustavio probnu vezu koja odgovara pravilu. Sada provjeri stvarno značenje svakog upozorenja.',
  },
  response: {
    level:9, description:'Potvrđen je neovlašten pristup LAB-09. Administrator je odobrio izolaciju tog uređaja i pravilo za potvrđeni štetni promet. Školski portal mora ostati dostupan.',requires:['sensors','alerts'],locked:'Najprije usporedi senzore i razvrstaj sigurnosne zapise.',correct:'targeted',
    options:[
      {id:'all',label:'Blokiraj sav školski promet',detail:'Zaustavi i portal, nadogradnje i nastavu.',feedback:'Potvrđeni incident je ograničen na LAB-09. U ovom slučaju široka zabrana prekida potreban rad bez opravdanja. Primijeni odobrenu ciljanu mjeru.'},
      {id:'disable',label:'Ugasi upozorenja',detail:'Na ploči više nema alarma.',feedback:'Gašenje upozorenja ne zaustavlja incident. Ostavljaš neovlašteni pristup i gubiš nadzor.'},
      {id:'targeted',label:'Izoliraj LAB-09 i sačuvaj zapise',detail:'Primijeni odobreno ciljano pravilo; provjeri ostali rad.',feedback:''},
    ],title:'Incident je ograničen',message:'LAB-09 je izoliran za obradu. Ciljano IPS pravilo zaustavlja potvrđeni štetni promet. Zapisi ostaju dostupni administratoru, a školski portal radi. Izolacija nije dokaz uklonjenog uzroka incidenta.',
  },
  'detection-test':decision(9,'U odobrenoj simulaciji isprobaj ciljano pravilo i normalan školski rad. Ne šalju se stvarni napadi.',['sensors','alerts','response'],'test',[
    ['test','Pokreni sigurnu probu','Provjeri blokiranje, dopušteni rad i sačuvane zapise.'],
  ],'Probni štetni promet je zaustavljen, predaja rada prolazi, a odobreno održavanje nije pogrešno blokirano. LAB-09 ostaje izoliran do oporavka. Zapisi su sačuvani za nastavak obrade.'),
  'wifi-identity': {
    level:10,description:'Na popisu je više sličnih Wi-Fi naziva. Mreža Škola_Free ima najjači signal, ali nema potvrđenog vlasnika. Trebaš se povezati prema odobrenim školskim uputama.',requires:[],locked:'',correct:'known',
    options:[
      {id:'strongest',label:'Odaberi najjači signal',detail:'Mreža Škola_Free ima sve crtice.',feedback:'Jačina signala govori o vezi, ne o vlasniku. I nepoznata pristupna točka može imati jak signal.'},
      {id:'known',label:'Provjeri poznatim školskim kontaktom',detail:'Preuzmi odobrene postavke i slijedi upute za povezivanje.',feedback:''},
      {id:'name',label:'Vjeruj nazivu Škola',detail:'Naziv zvuči kao službena mreža.',feedback:'SSID, odnosno naziv mreže, može se kopirati. Sam naziv nije potvrda identiteta pristupne točke.'},
    ],title:'Upute dolaze iz provjerenog izvora',message:'Poznatim školskim kontaktom dobivene su odobrene postavke za ovaj prostor. Ne biraš mrežu samo prema nazivu ili signalu. Sljedeće pripremaš zaštićenu i odvojenu vezu za goste.',
  },
  'wifi-maintenance': {
    level:10,description:'Odvojena mreža za goste je pripremljena. Na pristupnoj točki ostala je početna administratorska lozinka, a proizvođač nudi sigurnosnu nadogradnju.',requires:['wifi-identity','wifi-config'],locked:'Najprije provjeri mrežu i pripremi zaštitu veze s odvojenim pristupom gostiju.',correct:'maintain',
    options:[
      {id:'rename',label:'Promijeni samo naziv mreže',detail:'Nov naziv umjesto staroga.',feedback:'Naziv ne mijenja administratorsku lozinku niti popravlja propust. Potrebna je zaštita upravljanja i službena nadogradnja.'},
      {id:'maintain',label:'Zaštiti upravljanje i nadogradi',detail:'Zasebna administratorska lozinka, službena nadogradnja i provjera.',feedback:''},
      {id:'hide',label:'Sakrij naziv mreže',detail:'Naziv se ne prikazuje na uobičajenom popisu.',feedback:'Skrivanje SSID-a nije zamjena za zaštitu pristupa ni nadogradnje. Mreža se time ne čini nevidljivom napadaču.'},
    ],title:'Pristupna točka je pripremljena',message:'U simulaciji administrator mijenja početnu lozinku za upravljanje, čuva je odvojeno od lozinke za goste i primjenjuje službenu nadogradnju. Sada treba isprobati povezivanje i odvajanje.',
  },
  'wifi-test':decision(10,'Gost treba otvoriti školski javni portal preko HTTPS-a, ali ne smije do interne školske mreže ili upravljanja pristupnom točkom.',['wifi-identity','wifi-config','wifi-maintenance'],'test',[
    ['test','Isprobaj gostujuću vezu','Provjeri i dopušteni internet i zabranjeni interni pristup.'],
  ],'Gost se povezuje zaštićenom vezom i može koristiti internet. Provjera interne školske mreže i upravljanja je odbijena. Web se i dalje koristi preko HTTPS-a; Wi-Fi zaštita ne zamjenjuje zaštitu cijelog web-prijenosa.'),
});
Object.assign(VERIFICATION_REPORTS, {
  'detection-test':[['Probni štetni promet','Ciljano IPS pravilo blokira vezu.'],['Školski portal','Dopuštena predaja rada prolazi.'],['Odobrena provjera','Potvrđeno održavanje nije pogrešno blokirano.'],['Obrada incidenta','LAB-09 ostaje izoliran; zapisi su sačuvani.']],
  'wifi-test':[['Bežična veza','WPA3-Personal i zasebna duga lozinka.'],['Gost → internet','Potreban pristup je dopušten.'],['Gost → interna mreža','Pristup je blokiran pravilima odvajanja.'],['Upravljanje i web','Upravljanje je zaštićeno; web koristi HTTPS.']],
});

Object.assign(DECISIONS, {
  assets: {
    level:11,description:'Škola priprema plan zaštite. Staro računalo čuva jedine primjerke učeničkih radova, druga usluga raspored, a novi zaslon javni plakat. Što treba popisati prije odluke?',requires:[],locked:'',correct:'context',
    options:[
      {id:'price',label:'Poredaj samo po nabavnoj cijeni',detail:'Najnoviji zaslon prvi dobiva zaštitu.',feedback:'Cijena uređaja ne govori koliko bi gubitak podataka ili prekid usluge naštetio školi. Staro računalo može čuvati nezamjenjiv rad.'},
      {id:'context',label:'Poveži podatke, usluge, uređaje i odgovorne osobe',detail:'Zabilježi što je važno za nastavu i koje bi posljedice imao gubitak ili promjena.',feedback:''},
      {id:'hardware',label:'Popiši samo fizičke uređaje',detail:'Datoteke i usluge izostavi iz plana.',feedback:'Sigurnosna imovina nisu samo uređaji. Bez podataka ili potrebne usluge školski rad može stati i kad je hardver ispravan.'},
    ],title:'Važnost imovine je zabilježena',message:'Arhiva čuva radove, račun omogućuje promjene rasporeda, a plakat prikazuje javne informacije. Za svaku stavku poznate su odgovorna osoba i posljedice problema. Slijedi procjena prema dokazima.',
  },
  'risk-test':decision(11,'Odobrene mjere sada se provode u simulaciji. Isprobaj obnovu radova i dopuštene radnje. Ocjena rizika nakon mjere je procjena koju treba potvrditi i pratiti.',['assets','risk-analysis','risk-plan'],'test',[
    ['test','Provedi i provjeri odabrane mjere','Sačuvaj rezultat provjere i dogovori daljnje praćenje.'],
  ],'Obnovljeni radovi odgovaraju kopiji. Rezultati odabranih mjera prikazani su u izvještaju. Kvar diska i druge prijetnje i dalje su mogući: odgovorna osoba prati stanje i planira zamjenu neispravnog diska.'),
  'incident-report': {
    level:12,description:'U 09:10 na LAB-12 ne otvaraju se školski radovi. Dostupna je poruka o grešci i zapis vremena. Uzrok i opseg još nisu poznati. U igri pomažeš ovlaštenom administratoru.',requires:[],locked:'',correct:'facts',
    options:[
      {id:'blame',label:'Objavi u razrednoj grupi tko je kriv',detail:'Pretpostavi uzrok i priloži sve dokumente.',feedback:'Uzrok i odgovornost nisu potvrđeni. Nagađanje i dijeljenje dokumenata povećavaju štetu; prijavi provjerene činjenice poznatim kanalom.'},
      {id:'facts',label:'Prijavi opažanja poznatim školskim kanalom',detail:'Navedi LAB-12, 09:10, što ne radi i sačuvanu poruku; označi nepoznati uzrok.',feedback:''},
      {id:'erase',label:'Prvo obriši poruke i zapise',detail:'Ukloni tragove pa vidi hoće li problem nestati.',feedback:'Brisanjem poruke ne uklanjaš uzrok, a otežavaš istragu. Sačuvaj opažanja i zatraži pomoć.'},
    ],title:'Prijava je zaprimljena u simulaciji',message:'Administrator ima uređaj, vrijeme i opis opažanja, bez nagađanja i javne objave podataka. Školski plan predviđa ograničavanje širenja uz čuvanje dokaza; sada složi nastavak postupka.',
  },
  'recovery-source': {
    level:12,description:'Plan je odobren, LAB-12 odvojen, zapisi sačuvani, a uzrok uklonjen u izoliranom okruženju. Kopija A u 08:00 provjerena je i čista. Izmjena rada nastala je u 08:20. Kopija B u 09:00 sadrži potvrđeno oštećen sadržaj. Koji izvor i izvještaj biraš?',requires:['incident-report','response-plan'],locked:'Najprije prijavi opažanja i složi plan odgovora.',correct:'verified',
    options:[
      {id:'newest',label:'Kopija B jer je najnovija',detail:'Vrati sadržaj iz 09:00.',feedback:'Ta je kopija provjereno oštećena. Vrijeme izrade nije dovoljan dokaz prikladnosti za obnovu.'},
      {id:'silent',label:'Kopija A i tvrdnja da ništa nije izgubljeno',detail:'Vrati 08:00, ali prešuti izmjenu iz 08:20.',feedback:'Kopija A nastala je prije izmjene u 08:20. Noviji rad nije u njoj i taj gubitak treba jasno prijaviti.'},
      {id:'verified',label:'Kopija A uz prijavu nedostajuće izmjene',detail:'Vrati 08:00; zabilježi da izmjena iz 08:20 nije vraćena.',feedback:''},
    ],title:'Pouzdan sadržaj je obnovljen',message:'U simulaciji obnavljaš provjerenu kopiju A i jasno bilježiš nedostajuću izmjenu. Obnova još nije odobrenje za povezivanje: slijedi provjera sadržaja, ovlasti i rada.',
  },
  'incident-test':decision(12,'Prije povratka LAB-12 provjeri obnovljene dokumente, ovlasti i školsku uslugu. Administrator odobrava povezivanje uz nadzor. Zabilježi naučeno i odgovornu osobu za poboljšanje plana.',['incident-report','response-plan','recovery-source'],'test',[
    ['test','Provjeri pa odobri povratak','Potvrdi rad, sačuvaj izvještaj i nastavi praćenje.'],
  ],'Sadržaj i ovlasti su provjereni, usluga radi, a administrator odobrava povratak uz nadzor. Gubitak izmjene iz 08:20 ostaje zabilježen. Dogovorene su češće provjerene kopije, odgovorna osoba i rok provjere plana.'),
});
Object.assign(VERIFICATION_REPORTS, {
  'risk-test':[['Obnova radova','Otvaranje i usporedba vraćenog sadržaja uspješni.'],['Račun rasporeda','Osobni računi i potrebne ovlasti provjereni.'],['Resursi','Prioritetne mjere stanu u pet jedinica rada.'],['Preostali rizik','Kvar je još moguć. Administrator prati disk i planira zamjenu.']],
  'incident-test':[['Obnovljeni sadržaj','Kopija A provjerena; izmjena iz 08:20 označena kao nedostajuća.'],['Rad i ovlasti','Školska usluga radi; neodobrene radnje su odbijene.'],['Odobren povratak','Administrator odobrava povezivanje uz nastavak nadzora.'],['Pouke','Izvještaj, odgovorna osoba i rok za provjeru poboljšanja su zabilježeni.']],
});

Object.assign(DECISIONS, {
  'hash-source':decision(13,'Za usporedbu trebaš očekivani SHA-256 sažetak odobrene školske obavijesti. Datoteka i popis sažetaka stigli su i u nepoznatoj poruci. Odaberi izvor kojem možeš opravdano vjerovati.',[],'known',[
    ['message','Uzmi sažetak iz iste nepoznate poruke','Netko je mogao zamijeniti i datoteku i priloženi sažetak.'],
    ['known','Potvrdi školsku objavu poznatim putem','Preuzmi očekivani sažetak za istu odobrenu inačicu.'],
    ['name','Usporedi samo naziv i veličinu','Različit sadržaj može imati isti naziv i veličinu.'],
  ],'Poznatim školskim putem potvrđena je referenca za obavijest o sastanku u 10:00. Na konzoli usporedi sažetke sadržaja s tom referencom.'),
  'hash-response':decision(13,'Primjerak B ima isti naziv kao odobrena datoteka, ali drugi SHA-256 i promijenjeno vrijeme sastanka. Uzrok promjene još nije utvrđen.',['hash-source','hash-lab'],'retry',[
    ['retry','Zaustavi uporabu i pribavi odobreni primjerak','Prijavi razliku, provjeri izvor i ponovno usporedi preuzeti sadržaj.'],
    ['rename','Preimenuj B u izvorni naziv','Preimenovanje ne vraća izvorne bajtove.'],
    ['replace','Zamijeni očekivani sažetak onim iz B','Uklonio bi trag razlike umjesto da provjeriš sadržaj.'],
  ],'Razlika je prijavljena. Škola je poznatim putem dostavila odobreni primjerak. Potrebna je nova usporedba, bez nagađanja je li razlika bila kvar ili namjerna izmjena.'),
  'hash-test':decision(13,'Ponovno preuzeti primjerak treba odgovarati potvrđenoj školskoj referenci. Provjera se odnosi na sadržaj i odabranu inačicu, a ne na bezopasnost svakog mogućeg programa.',['hash-source','hash-lab','hash-response'],'test',[
    ['test','Ponovi usporedbu i zabilježi granice','Potvrdi podudaranje sažetka; uporaba i dalje slijedi školsku politiku.'],
  ],'Novi primjerak podudara se s pouzdanom referencom. Razlika u B je dokumentirana. Naziv, sažetak, šifriranje i sigurnost uporabe imaju različite uloge.'),
  'sign-keys':decision(14,'Škola potpisuje raspored privatnim ključem. Za provjeru potpisa trebaš odgovarajući javni ključ i potvrdu da pripada školi. U vježbi je poznati školski kanal dostupan.',[],'public',[
    ['private','Traži privatni potpisni ključ škole','Njime bi se moglo potpisivati u ime škole; ne dijeli se primateljima.'],
    ['enclosed','Vjeruj bilo kojem ključu priloženom poruci','Priloženi ključ sam ne dokazuje kome pripada.'],
    ['public','Preuzmi potvrđeni školski javni ključ','Privatni ključ ostaje kod potpisnika, javni koristiš za provjeru.'],
  ],'Poznatim školskim putem potvrđen je javni ključ škole. Privatni potpisni ključ ostaje zaštićen kod potpisnika. Na konzoli odvojeno provjeri prolazi li potpis i možeš li vjerovati vezi ključa sa školom.'),
  'sign-share':decision(14,'Uz provjereni raspored treba poslati zaseban potpisani prilog s povjerljivim podatcima samo ovlaštenom nastavniku. Potpisani prilog trenutačno nije šifriran.',['sign-keys','sign-lab'],'protect',[
    ['public','Objavi prilog jer je potpisan','Potpis ne sprečava druge da čitaju sadržaj.'],
    ['protect','Šifriraj za primatelja i ograniči pristup','Zadrži potpis za provjeru, a ovlast i šifriranje za povjerljivost.'],
    ['send-key','Pošalji i privatni potpisni ključ','Primatelju za provjeru treba javni ključ, ne tajna potpisnika.'],
  ],'U simulaciji je prilog zasebno šifriran za ovlaštenog primatelja, a pristup ograničen. Potpis ostaje za provjeru podrijetla i cjelovitosti. Potpisni i pristupni podatci ne dijele se gostima.'),
  'sign-test':decision(14,'Isprobaj prihvaćanje izvornog rasporeda i odbijanje nevaljanog ili nepotvrđenog zapisa. Provjeri i čitljivost povjerljivog priloga za ovlaštenu osobu te zabranu gostu.',['sign-keys','sign-lab','sign-share'],'test',[
    ['test','Provjeri izvor, promjene i pristup','Potpis i povjerljivost provjeravaju se zasebno.'],
  ],'Izvorni školski zapis je prihvaćen. Izmijenjeni i nepotvrđeni zapisi nisu prihvaćeni. Ovlašteni primatelj otvara prilog, gost nema pristup. To je rezultat zadanog nastavnog modela.'),
});
Object.assign(VERIFICATION_REPORTS, {
  'hash-test':[['Pouzdana referenca','SHA-256 dobiven je iz potvrđenog izvora za istu inačicu.'],['Ponovni primjerak','Sadržaj odgovara očekivanom sažetku. Promjena naziva sama nije promjena sadržaja.'],['Nepodudaranje','Primjerak B zaustavljen je; razlika je prijavljena bez nagađanja uzroka.'],['Ograničenje','Sažetak ne daje povjerljivost, kopiju za obnovu ni jamstvo bezopasnosti programa.']],
  'sign-test':[['Ključ i izvor','Korišten je javni ključ potvrđen poznatim školskim putem. Privatni ostaje kod potpisnika.'],['Cjelovitost','Izvorni zapis A prolazi; izmijenjeni B ne prolazi sa starim potpisom.'],['Povjerenje','C se ne prihvaća kao školski zapis, čak ni kad potpis prolazi uz nepotvrđeni ključ iz poruke.'],['Povjerljivi prilog','Zasebna zaštita omogućuje ovlaštenom primatelju čitanje i ograničava pristup gostu.']],
});
