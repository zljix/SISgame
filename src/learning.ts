import { CHECK_NAMES, CHECKS, type Run } from './core.ts';
import type { ContentTier } from './curriculum.ts';

interface MissionGuide {
  outcome:string;
  juniorOutcome:string;
  example:{title:string;situation:string;reason:string;decision:string};
  reflection:{question:string;answer:string};
}

// Analogous examples model a reasoned decision before the learner uses a console.
// Reflection is a prompt for explanation, not an automatically graded claim of mastery.
export const MISSION_GUIDES:Record<number,MissionGuide>={
  1:{
    outcome:'Odaberi zaštitu ulaza, napajanja i ispisa te isprobaj djeluje li u zadanim događajima.',
    juniorOutcome:'Zaštiti sobu, računalo i papir s osobnim podatcima. Provjeri radi li zaštita.',
    example:{title:'Posjetitelj u knjižnici',situation:'Posjetitelj želi u spremište knjiga. Kamera snima ulaz.',reason:'Snimanje bilježi ulazak, ali ne provjerava smije li osoba ući.',decision:'Knjižničar najprije provjerava ovlast. Kamera može biti dodatna pomoć.'},
    reflection:{question:'Zašto kamera sama ne zamjenjuje provjeru ovlasti na vratima?',answer:'Kamera bilježi događaj. Provjera ovlasti odlučuje tko smije ući, a vrata moraju provesti tu odluku.'},
  },
  2:{
    outcome:'Dodijeli najmanja potrebna prava te objasni kako šifriranje i odvojen ključ štite prijenos.',
    juniorOutcome:'Odredi tko smije čitati, a tko mijenjati datoteku. Zaštiti tajni sadržaj ključem.',
    example:{title:'Zajednički plakat',situation:'Razred treba pročitati plakat, a uređuju ga samo dva odabrana učenika.',reason:'Čitanje ne zahtijeva pravo promjene. Nepotrebno uređivanje omogućilo bi slučajno brisanje.',decision:'Razredu dodijeli čitanje, a urednicima uređivanje. Zatim isprobaj obje uloge.'},
    reflection:{question:'Zašto osobi koja samo čita ne dodjeljujemo i uređivanje?',answer:'Dobiva samo pravo potrebno za zadaću. Time ograničavamo slučajne i neovlaštene promjene, uz dostupan sadržaj.'},
  },
  3:{
    outcome:'Odaberi važne podatke, spremi odvojenu kopiju te obnovi i usporedi sadržaj nakon kvara.',
    juniorOutcome:'Spremi važne datoteke na drugi uređaj. Vrati ih nakon kvara i otvori za provjeru.',
    example:{title:'Snimka školskog radija',situation:'Snimka i njezina druga kopija nalaze se u dvije mape istog diska.',reason:'Ako taj disk otkaže, obje mape mogu postati nedostupne.',decision:'Spremi dodatnu kopiju na odvojeni uređaj i provjeri možeš li iz nje vratiti snimku.'},
    reflection:{question:'Zašto poruka „kopiranje završeno” nije posljednji korak zaštite?',answer:'Treba provjeriti može li se kopija obnoviti i odgovara li vraćeni sadržaj važnim podatcima. Sam naziv datoteke nije dovoljan.'},
  },
  4:{
    outcome:'Poveži ponašanje programa s vrstom prijetnje i odaberi izolaciju, prijavu i pouzdan oporavak.',
    juniorOutcome:'Prepoznaj što sumnjivi program radi. Odaberi kako zaustaviti širenje i zatražiti pomoć.',
    example:{title:'Dodatak koji se širi',situation:'Izvještaj navodi da se program sam prenosi na druga računala, bez programa domaćina.',reason:'Zaključujemo iz ponašanja. Samostalno širenje odgovara obilježju crva.',decision:'Ovlaštena osoba ograničava širenje, čuva zapise i provodi provjeru. Uzorak ne šaljemo drugima.'},
    reflection:{question:'Zašto jedan čist nalaz ne mora dokazati da je računalo pouzdano?',answer:'Provjera može propustiti skrivenu promjenu. Zato nalaz povezujemo s drugim zapisima, a u opisanom slučaju administrator provodi pouzdan oporavak.'},
  },
  5:{
    outcome:'Razlikuj pokušaj prijave od aktivne sesije te odaberi opoziv, jedinstvenu lozinku i drugi faktor.',
    juniorOutcome:'Provjeri prijave na račun. Zaštiti ga novom lozinkom i drukčijim drugim dokazom.',
    example:{title:'Račun na posuđenom računalu',situation:'Korisnik je promijenio lozinku, ali zapis i dalje pokazuje otvorenu sesiju na posuđenom računalu.',reason:'Promjena lozinke i zatvaranje već otvorene sesije nisu nužno ista radnja.',decision:'Provjeri i opozovi tu sesiju te isprobaj da pristup više ne radi.'},
    reflection:{question:'Jesu li dvije različite lozinke dva različita faktora prijave? Zašto?',answer:'Nisu. Obje su nešto što znaš. Sigurnosni ključ je primjer nečega što posjeduješ, pa daje drugu vrstu dokaza.'},
  },
  6:{
    outcome:'Odaberi nadogradnje, ovlasti i potrebne usluge te provjeri zaštitu i dostupnost školskog rada.',
    juniorOutcome:'Ažuriraj računalo i ograniči nepotrebne ovlasti. Provjeri da nastava i dalje može raditi.',
    example:{title:'Računalo za izložbu',situation:'Računalo treba prikazivati prezentaciju i primati odobrene nadogradnje. Udaljeno dijeljenje nije potrebno.',reason:'Isključivanje svega zaustavilo bi i potreban rad. Svaku uslugu povezujemo s konkretnom potrebom.',decision:'Ostavi potrebne usluge, ukloni nepotrebno dijeljenje i isprobaj prezentaciju i nadogradnju.'},
    reflection:{question:'Kako provjeriti zaštitu bez zaustavljanja nastave?',answer:'Isprobaj da je neovlaštena radnja odbijena i da dopušten školski rad uspijeva. Sama blokada svega nije dobar rezultat.'},
  },
  7:{
    outcome:'Izdvoji znakove obmane, neovisno provjeri pošiljatelja i prijavi poruku bez izlaganja lozinke.',
    juniorOutcome:'Prepoznaj sumnjivu poruku. Provjeri je poznatim putem i prijavi bez slanja lozinke.',
    example:{title:'Hitna poruka o izletu',situation:'Poruka s poznatim logotipom traži lozinku za hitnu potvrdu izleta.',reason:'Logotip se može kopirati, a žurnost nije dokaz da je zahtjev stvaran.',decision:'Otvori poznati školski portal iz svoje oznake ili pitaj poznati kontakt. Ne koristi poveznicu iz poruke.'},
    reflection:{question:'Zašto odgovor na sumnjivu poruku nije neovisna provjera?',answer:'Odgovor može dobiti isti nepoznati pošiljatelj. Neovisna provjera koristi ranije potvrđen kontakt ili portal.'},
  },
  8:{
    outcome:'Razlikuj zaštitu prijenosa i pravila pristupa te provjeri certifikat i potrebne mrežne veze.',
    juniorOutcome:'Zaštiti prijenos i dopusti samo potrebne veze. Istraži upozorenje o pogrešnom poslužitelju.',
    example:{title:'Web-stranica kluba',situation:'Stranica se otvara preko HTTPS-a, ali traži nepotrebne osobne podatke.',reason:'Zaštićena veza ne dokazuje da je sadržaj stranice pošten ili da su traženi podatci potrebni.',decision:'Prije unosa provjeri tko vodi stranicu i zašto traži podatke. HTTPS ostaje potreban za prijenos.'},
    reflection:{question:'Zašto HTTPS ne zamjenjuje pravila vatrozida?',answer:'TLS štiti prijenos i pomaže provjeriti poslužitelj. Vatrozid određuje koje su veze dopuštene. To su različite zadaće.'},
  },
  9:{
    outcome:'Usporedi alarm s drugim dokazima, razlikuj incident od dopuštenog rada i odaberi ciljani odgovor.',
    juniorOutcome:'Provjeri alarm uz zapise. Razlikuj odobren rad i potvrđen neovlašten pristup.',
    example:{title:'Noćno održavanje',situation:'Alarm bilježi mnogo veza u 20 sati. Potvrđeni plan i dnevnik pokazuju odobreno održavanje u to vrijeme.',reason:'Alarm je povod za provjeru. U ovom slučaju dodatni podatci objašnjavaju događaj.',decision:'Zabilježi nalaz i nastavi nadzor. Ne proglašavaj svaki sličan budući alarm bezopasnim.'},
    reflection:{question:'Dokazuje li izostanak alarma da nema prijetnje?',answer:'Ne. Senzor može nešto propustiti. Zaključak povezujemo s više izvora, opaženim promjenama i provjerom rada.'},
  },
  10:{
    outcome:'Provjeri izvor Wi-Fi mreže, zaštiti vezu i odvoji goste te isprobaj dopušteni i zabranjeni pristup.',
    juniorOutcome:'Provjeri kojoj se mreži spajaš. Gostima omogući internet, a zaštiti internu školsku mrežu.',
    example:{title:'Dvije mreže istog naziva',situation:'U blizini su dvije mreže nazvane Klub. Jedna ima jači signal.',reason:'Naziv se može kopirati, a jačina signala ne potvrđuje vlasnika.',decision:'Koristi upute dobivene poznatim kontaktom kluba. Ne biraj mrežu samo po imenu ili signalu.'},
    reflection:{question:'Je li naziv „Gosti” dovoljan da gosti ne pristupe internoj mreži?',answer:'Nije. Odvajanje moraju provesti mrežna pravila. Provjeri i da internet radi i da je interna veza blokirana.'},
  },
  11:{
    outcome:'Poveži imovinu, prijetnju i slabost, procijeni prioritet te obrazloži mjere i preostali rizik.',
    juniorOutcome:'Odredi što je najvažnije zaštititi. Izaberi mjere unutar plana i provjeri što još ostaje rizično.',
    example:{title:'Arhiv bez druge kopije',situation:'Važan arhiv postoji samo na jednom starom disku. Kvar bi zaustavio rad kluba.',reason:'Arhiv je imovina, kvar je prijetnja, a nedostatak kopije slabost. Kopija ublažava gubitak podataka.',decision:'Predloži odvojenu provjerenu kopiju. I dalje treba pratiti stanje diska jer se može pokvariti.'},
    reflection:{question:'Smanjuje li sigurnosna kopija vjerojatnost da se disk pokvari?',answer:'Ne mora je smanjiti. Kopija prvenstveno ublažava posljedicu kvara jer omogućuje povrat podataka; preostali rizik i dalje pratimo.'},
  },
  12:{
    outcome:'Sastavi činjeničnu prijavu i plan ograničavanja, pouzdanog oporavka i provjere prije povratka.',
    juniorOutcome:'Prijavi što vidiš. Odaberi siguran redoslijed pomoći, obnove i provjere rada.',
    example:{title:'Dvije kopije rasporeda',situation:'Kopija od petka ima potvrđenu štetnu promjenu. Provjerena kopija od četvrtka nema posljednje izmjene.',reason:'Najnovija kopija nije automatski pouzdana. Starija čista kopija može značiti gubitak novijeg rada.',decision:'Administrator bira provjeren izvor, jasno prijavljuje nedostajuće izmjene i provjerava obnovu prije povratka.'},
    reflection:{question:'Što treba prijaviti ako čista kopija ne sadrži posljednje izmjene?',answer:'Navedi koje razdoblje i koji rad nedostaju. Povratak sustava ne znači da su svi podatci potpuni; dogovori provjeru i daljnji postupak.'},
  },
  13:{
    outcome:'Usporedi SHA-256 s pouzdanom referencom i razlikuj cjelovitost od naziva, tajnosti i bezopasnosti.',
    juniorOutcome:'Usporedi sažetke sadržaja s pouzdanim popisom. Objasni zašto isti naziv ne jamči isti sadržaj.',
    example:{title:'Preimenovani tekst',situation:'Datoteka je preimenovana iz biljeska.txt u plan.txt. Njezin sadržaj ostao je potpuno isti.',reason:'Sažetak u ovoj provjeri računa se iz sadržaja, pa samo novi naziv ne mijenja SHA-256.',decision:'Usporedi sažetak sadržaja s pouzdanom referencom iste inačice. Naziv nije dokaz jednakosti.'},
    reflection:{question:'Što ako datoteka i očekivani sažetak dolaze iz iste sumnjive poruke?',answer:'Mogu se podudarati, a izvor i dalje nije potvrđen. Očekivani sažetak treba provjeriti pouzdanim putem. Podudaranje ne jamči bezopasnost.'},
  },
  14:{
    outcome:'Razlikuj uloge ključeva, prolazak provjere potpisa i povjerenje u izvor te zasebno zaštiti povjerljivost.',
    juniorOutcome:'Razlikuj privatni i javni ključ. Provjeri čiji je ključ i zaštiti tajni prilog od čitanja.',
    example:{title:'Potpis nepoznatog kluba',situation:'Potpis odgovara dokumentu i javnom ključu priloženom u poruci. Nitko nije potvrdio čiji je taj ključ.',reason:'Prolazak provjere povezuje potpis s podatcima i ključem. Sam ne potvrđuje vlasnika ključa.',decision:'Potvrdi ključ poznatim putem prije zaključka o pošiljatelju. Privatni ključ se ne traži niti šalje.'},
    reflection:{question:'Zašto potpisani povjerljivi prilog još treba šifriranje i ograničenje pristupa?',answer:'Potpis pomaže provjeriti sadržaj i podrijetlo uz pouzdan ključ, ali ne skriva sadržaj. Šifriranje i ovlasti zasebno štite od čitanja.'},
  },
};

export function missionOutcome(level:number,tier:ContentTier){
  const guide=MISSION_GUIDES[level];
  return tier==='junior'?guide.juniorOutcome:guide.outcome;
}

export function missionSteps(run:Run){
  const current=CHECKS[run.level].find(key=>!run.checks[key].done);
  return CHECKS[run.level].map(key=>({key,label:CHECK_NAMES[key],state:run.checks[key].done?'done':key===current?'current':'later'} as const));
}
