import type { ContentTier } from './curriculum.ts';

type Choice = { id:string; label:string; feedback:string };
export type PracticeQuestion = { id:string; prompt:string; answer:string; choices:Choice[]; juniorWrong:string };
type Scenario = {
  level:number; title:string; context:string; juniorContext:string; expertEvidence:string;
  reminder:string; transfer:string; questions:PracticeQuestion[]; expert:PracticeQuestion;
};
export type PracticeCase = Omit<Scenario,'expert'|'juniorContext'>;
export type PracticeProgress = {
  answers:Record<string,string>; submitted:Record<string,string>|null;
  attempts:number; solved:boolean; firstCorrect:boolean|null;
};
export type PracticeBook = Record<string,PracticeProgress>;
type CompletedMissions = Record<string,{completed:boolean}>;
const question=(id:string,prompt:string,answer:string,juniorWrong:string,choices:[string,string,string][]):PracticeQuestion=>({id,prompt,answer,juniorWrong,choices:choices.map(([id,label,feedback])=>({id,label,feedback}))});

// Original transfer scenarios: new facts, the same principles introduced in the missions.
export const PRACTICE_CASES:Scenario[] = [
  {
    level:1,title:'Serviser pred vratima',
    context:'U knjižnicu dolazi osoba u radnoj odjeći i kaže da treba popraviti mrežnu opremu. Posjet nije najavljen. Na vratima je kamera, ali osoba nema potvrđenu ovlast ulaska.',
    juniorContext:'Osoba kaže da je došla popraviti školsko računalo. Nastavnik je ne očekuje. Na ulazu je kamera. Treba odlučiti smije li ući.',
    expertEvidence:'Naknadno je potvrđen servisni nalog samo za knjižnicu. U susjednoj sobi čuvaju se osjetljivi ispisi.',
    reminder:'Odjeća ili tvrdnja nisu potvrda ovlasti. Kamera bilježi događaj, a pravilo pristupa određuje tko smije ući.',
    transfer:'U svojoj školi objasni komu bi se javio radi provjere nenajavljenog posjeta. Ne isprobavaj ulazak bez ovlasti.',
    questions:[
      question('action','Što učiniti prije ulaska?','verify','allow',[
        ['allow','Pustiti osobu jer je kamera snima.','Snimka ne potvrđuje ovlast i ne sprječava neovlašten ulazak.'],
        ['verify','Zadržati kontrolu ulaza i provjeriti posjet s odgovornom osobom poznatim kontaktom.','Ovlast provjeravaš prije ulaska, preko školskog kontakta koji već poznaješ.'],
        ['ban','Trajno zabraniti sve servisne posjete.','Ovlašten servis školi je potreban; treba provjeriti ovlast, a ne zabraniti svaki rad.']]),
      question('reason','Zašto je taj postupak primjeren?','authority','camera',[
        ['authority','Ulazak treba odobriti prema potvrđenoj ovlasti.','Pravilo pristupa povezuje provjerenog posjetitelja s dopuštenim poslom i prostorom.'],
        ['uniform','Radna odjeća uvijek dokazuje identitet.','Radna odjeća može izgledati uvjerljivo, ali nije provjera identiteta ili ovlasti.'],
        ['camera','Kamera sama zaključava pristup neovlaštenima.','Kamera snima; u ovom slučaju ne provjerava ovlast niti upravlja bravom.']])
    ],
    expert:question('limit','Što vrijedi nakon potvrde naloga?','scope','all',[
      ['all','Nalog za knjižnicu dopušta ulazak u sve prostorije.','Ovlast za jedan posao nije opće dopuštenje pristupa.'],
      ['scope','Dopušten je samo odobreni prostor i posao uz školski postupak posjeta.','Pristup ostaje ograničen na opseg potvrđenog naloga.'],
      ['paper','Nalog daje pravo pregledati sve ispise.','Servis mrežne opreme ne traži čitanje osjetljivih ispisa.']])
  },
  {
    level:2,title:'Uredništvo školskog lista',
    context:'Školski list ima javnu završnu verziju i radni nacrt. Pravilo glasi: čitatelji vide samo završnu verziju, članovi uredništva uređuju nacrt, a ostali učenici nemaju pristup nacrtu.',
    juniorContext:'Gotov školski list svi smiju čitati. Nacrt smiju vidjeti i mijenjati samo članovi uredništva. Treba postaviti prava mapa.',
    expertEvidence:'Nacrt se šalje ovlaštenom uredniku šifriran. Netko predlaže objaviti ključ u javnoj mapi uz završni list.',
    reminder:'Čitanje i uređivanje različite su ovlasti. Dopušta se ono što uloga treba za svoj posao, prema zadanom pravilu.',
    transfer:'Za jednu mapu u laboratorijskoj vježbi obrazloži tko treba čitanje, tko uređivanje, a tko nema potrebu za pristupom.',
    questions:[
      question('action','Koji plan prava odgovara pravilu?','roles','everyone',[
        ['everyone','Svima dopustiti uređivanje obiju mapa.','Čitatelji bi mogli mijenjati list i otvoriti nacrt iako za to nemaju ovlast.'],
        ['none','Svima zabraniti obje mape.','Time se sprječavaju i dopušteno čitanje i rad uredništva.'],
        ['roles','Čitateljima dati čitanje završne verzije, a uredništvu uređivanje nacrta. Ostalima zatvoriti nacrt.','Prava prate potrebe uloga i izričito zadano pravilo.']]),
      question('reason','Zašto prava treba razlikovati?','need','login',[
        ['need','Uspješna prijava ne daje automatski pravo na svaku datoteku.','Prijava provjerava račun, a ovlasti određuju što taj račun smije raditi.'],
        ['login','Svaki prijavljeni učenik smije mijenjati sve datoteke.','Prijava i dopuštenje za izmjenu nisu ista stvar.'],
        ['secret','Javan naslov datoteke znači da svi smiju uređivati njezin sadržaj.','Naziv datoteke ne zamjenjuje pravila pristupa.']])
    ],
    expert:question('limit','Kako postupiti s ključem?','separate','public',[
      ['separate','Dostaviti ga samo ovlaštenom uredniku odvojenim, zaštićenim putem.','Zaštita šifriranog sadržaja ovisi i o ograničenom pristupu ključu.'],
      ['public','Objaviti ga javno jer je sam nacrt šifriran.','Tko dobije šifrirani nacrt i njegov ključ može čitati sadržaj.'],
      ['delete','Izbrisati jedini ključ prije nego urednik otvori nacrt.','Ovlašteni urednik tada ne može pročitati poslani sadržaj.']])
  },
  {
    level:3,title:'Snimke za školsku izložbu',
    context:'Na jednom prijenosniku čuvaju se jedine snimke za izložbu. Mapa Kopija nalazi se na istom fizičkom disku. Dostupan je odobren vanjski disk i vrijeme za probnu obnovu.',
    juniorContext:'Jedine snimke izložbe su na prijenosniku. Mapa Kopija je na istom disku. Škola ima drugi, vanjski disk za sigurnosnu kopiju.',
    expertEvidence:'Jedna probno vraćena snimka radi, ali kopija još nije uspoređena s potpunim popisom potrebnih datoteka.',
    reminder:'Druga mapa na istom disku ne štiti od kvara tog diska. Kopiju treba odvojiti i provjeriti može li se iz nje vratiti potreban sadržaj.',
    transfer:'Na izmišljenim datotekama pokaži razliku između stvaranja kopije i provjere obnove. Izvornike ne briši radi pokusa.',
    questions:[
      question('action','Koji plan štiti snimke od kvara diska prijenosnika?','separate','rename',[
        ['rename','Preimenovati mapu Kopija u Sigurno.','Naziv ne mijenja činjenicu da su izvornik i kopija na istom disku.'],
        ['separate','Kopirati sve potrebne snimke na vanjski disk, probno ih obnoviti i sigurno odspojiti disk.','Odvojena kopija može preživjeti kvar izvornog diska, a proba provjerava obnovu.'],
        ['shortcut','Na radnoj površini napraviti prečac do snimki.','Prečac pokazuje na izvornik; ne sadrži dodatnu kopiju snimke.']]),
      question('reason','Što provjeriti nakon probne obnove?','content','names',[
        ['names','Samo postoje li nazivi datoteka.','Nazivi mogu postojati i kada je sadržaj nečitljiv ili nepotpun.'],
        ['icon','Samo izgleda li ikona diska uredno.','Ikona diska ne potvrđuje sadržaj vraćenih snimki.'],
        ['content','Jesu li potrebne datoteke vraćene i može li se otvoriti njihov ispravan sadržaj.','Potrebni su i potpunost i upotrebljiv sadržaj.']])
    ],
    expert:question('limit','Što dokazuje jedna ispravna snimka?','limited','all',[
      ['all','Da su sve snimke sigurno uključene u kopiju.','Jedan uspješan uzorak ne dokazuje potpunost cijelog skupa.'],
      ['limited','Da je taj primjerak čitljiv; još treba usporediti popis i provjeriti ostali potreban sadržaj.','Opseg zaključka mora odgovarati opsegu provedene provjere.'],
      ['forever','Da buduće provjere kopija više nisu potrebne.','Nove izmjene i kasnija oštećenja traže održavanje i ponovne provjere.']])
  },
  {
    level:4,title:'Dodatak za robotsku ekipu',
    context:'Ekipa je pokrenula neprovjeren dodatak za crtanje robota. Zaštitni alat sada javlja sumnjive veze. Nastavnik je dostupan, a školski postupak traži prijavu i odvajanje sumnjivog uređaja od mreže uz odgovornu osobu.',
    juniorContext:'Nakon pokretanja nepoznatog dodatka računalo javlja sumnjivu aktivnost. Nastavnik je blizu. Školsko pravilo kaže da mu to odmah prijavimo i uz njega odvojimo računalo od mreže.',
    expertEvidence:'Upozorenje ne navodi točan uzrok. Administrator traži sačuvane zapise i podatak o tome što je pokrenuto.',
    reminder:'Sumnju treba prijaviti i ograničiti prema školskom postupku. Ne šaljemo sumnjivi program drugima na isprobavanje i ne brišemo tragove naslijepo.',
    transfer:'Navedi činjenice koje bi prijavio nastavniku: uređaj, vrijeme, pokrenuti program i vidljivo upozorenje. Ne izvodi stvaran pokus sa sumnjivim programom.',
    questions:[
      question('action','Koji je sljedeći korak?','contain','share',[
        ['contain','Prijaviti nastavniku i uz njega odvojiti uređaj od mreže prema školskom postupku.','Ograničavaš mogući problem i uključuješ osobu odgovornu za oporavak.'],
        ['share','Poslati dodatak drugoj ekipi da ga isproba.','Time možeš proširiti problem na drugi uređaj.'],
        ['ignore','Isključiti upozorenja i nastaviti rad.','Skrivanje upozorenja ne uklanja njegov uzrok.']]),
      question('reason','Zašto izgled korisnog dodatka nije dovoljan?','behavior','looks',[
        ['looks','Lijepo sučelje dokazuje da je program siguran.','Izgled ne govori što program radi u pozadini.'],
        ['behavior','Program može obećavati koristan posao, a raditi i štetne radnje.','Opis i izgled treba razlikovati od stvarnog ponašanja i pouzdanosti izvora.'],
        ['brand','Naziv Robotski alat isključuje mogućnost štetnog ponašanja.','Naziv programa nije dokaz sigurnosti.']])
    ],
    expert:question('limit','Što treba napisati u prijavi?','facts','certainty',[
      ['certainty','Da je rootkit sigurno potvrđen, iako to nitko nije provjerio.','Upozorenje bez dodatne analize ne potvrđuje određenu vrstu prijetnje.'],
      ['erase','Da su svi zapisi obrisani radi urednosti.','Brisanjem zapisa gube se informacije potrebne za istraživanje.'],
      ['facts','Činjenice i sačuvane zapise, uz napomenu da uzrok još nije potvrđen.','Prijava jasno odvaja opažene činjenice od pretpostavke.']])
  },
  {
    level:5,title:'Račun na posuđenom tabletu',
    context:'Na posuđenom tabletu ostala je otvorena tvoja sesija školskog kluba. Poslije vidiš nepoznatu aktivnost. S pouzdanog uređaja možeš promijeniti lozinku i odjaviti aktivne sesije.',
    juniorContext:'Na posuđenom tabletu zaboravio si odjavu iz školskog kluba. Netko koristi tvoj račun. Nastavnik ti pomaže zaštititi račun s drugog, pouzdanog uređaja.',
    expertEvidence:'Klupska aplikacija ima vlastiti popis aktivnih sesija. Uspješna prijava ključem ne daje članu kluba uredničke ovlasti.',
    reminder:'Sesija je pristup koji može ostati otvoren nakon prijave. Promjena lozinke i prekid već otvorene sesije nisu uvijek ista radnja.',
    transfer:'U demonstracijskom računu pronađi odjavu i pregled sesija uz nastavnika. Objasni razliku između odjave i promjene lozinke.',
    questions:[
      question('action','Koji plan obuhvaća i otvoreni pristup?','revoke','password',[
        ['password','Promijeniti samo lozinku i pretpostaviti da su sve sesije prekinute.','Postojeće sesije u nekim aplikacijama mogu ostati aktivne.'],
        ['revoke','Prekinuti sumnjive sesije, promijeniti lozinku, provjeriti učinak i prijaviti aktivnost.','Plan obuhvaća i vjerodajnicu i već otvorene pristupe.'],
        ['share','Poslati novu lozinku grupi da svi provjere račun.','Dijeljenjem nove lozinke ponovno gubiš kontrolu nad računom.']]),
      question('reason','Što dodaje dva različita faktora prijavi?','key','two',[
        ['two','Dvije različite lozinke.','Obje su nešto što znaš; to nisu dvije različite vrste faktora.'],
        ['name','Ime i prezime uz lozinku.','Ime i prezime nisu dodatna tajna niti dokaz posjedovanja.'],
        ['key','Lozinka i osobni sigurnosni ključ.','Lozinka je ono što znaš, a osobni ključ ono što posjeduješ.']])
    ],
    expert:question('limit','Što još treba provjeriti?','app','mfa',[
      ['app','Jesu li prekinute i sesije klupske aplikacije te ostaju li uloge pravilno ograničene.','Opoziv treba provjeriti u aplikaciji; dokaz prijave ne dodjeljuje novu ovlast.'],
      ['mfa','Daje li uključeni MFA svim članovima pravo uređivanja.','MFA štiti prijavu, a prava uređivanja određuje zasebno pravilo ovlasti.'],
      ['none','Ništa, sama promjena lozinke potvrđuje svaki opoziv.','Učinak opoziva ovisi i o aplikacijskom upravljanju sesijama.']])
  },
  {
    level:6,title:'Računalo za školski radio',
    context:'Računalo školskog radija treba uređivač zvuka, službene nadogradnje i predaju snimki. Administratorska usluga za udaljeni pristup više se ne koristi. Objavljen je službeni sigurnosni popravak.',
    juniorContext:'Školski radio treba snimanje, slanje snimki i sigurnosne popravke. Jedan nepotreban daljinski pristup ostao je uključen. Administrator može urediti postavke.',
    expertEvidence:'Nakon promjene postavki administrator treba provjeriti i zaštitu i mogućnost uredne predaje emisije.',
    reminder:'Sigurnost treba omogućiti potreban rad. Službeni popravci uklanjaju poznate propuste, a nepotrebne usluge i suvišne ovlasti treba ograničiti.',
    transfer:'Na školskom popisu usluga obrazloži jednu potrebnu i jednu nepotrebnu uslugu. Stvarne postavke mijenja samo ovlaštena osoba.',
    questions:[
      question('action','Koji plan predložiti administratoru?','needed','alloff',[
        ['alloff','Isključiti snimanje, predaju i nadogradnje.','Isključio bi potreban rad i preuzimanje sigurnosnih popravaka.'],
        ['random','Instalirati prvi popravak iz reklame.','Izvor nije provjeren i može donijeti dodatni problem.'],
        ['needed','Primijeniti službeni popravak, zatvoriti nepotreban pristup i ostaviti potrebne funkcije.','Smanjuješ nepotrebnu izloženost uz očuvanje rada radija.']]),
      question('reason','Koji račun treba za svakodnevno uređivanje zvuka?','standard','admin',[
        ['standard','Standardni račun s pravima potrebnima za taj posao.','Za uobičajen rad ne treba trajna ovlast mijenjanja cijelog sustava.'],
        ['admin','Trajno administratorski račun, i kada posebne ovlasti nisu potrebne.','Suvišne ovlasti povećavaju moguće posljedice pogreške ili zlouporabe.'],
        ['shared','Javno objavljen administratorski račun.','Zajednički javni administratorski pristup ruši ograničenje ovlasti.']])
    ],
    expert:question('limit','Kako provjeriti promjenu?','both','shutdown',[
      ['shutdown','Potvrditi da se više nitko ne može koristiti računalom.','Potpuni prekid korištenja ne dokazuje dobro postavljenu zaštitu.'],
      ['both','Provjeriti da nepotreban pristup ne radi, a snimanje, predaja i nadogradnje rade.','Provjera obuhvaća i ograničenje pristupa i dopuštene funkcije.'],
      ['desktop','Pogledati samo je li se otvorila radna površina.','Radna površina ne potvrđuje ispravnost potrebnih usluga ni ograničenja.']])
  },
  {
    level:7,title:'QR kod za prijavu na izlet',
    context:'QR kod je slikovni kod koji može sadržavati poveznicu. U grupu stiže takva slika: „Upiši školsku lozinku u sljedećih pet minuta ili gubiš mjesto na izletu.” Slika ima školski znak, ali poruka dolazi s nepoznatog računa.',
    juniorContext:'QR kod je slikovni kod koji može voditi na web-stranicu. Nepoznata osoba šalje taj kod i traži školsku lozinku za izlet. Požuruje te, a slika ima školski znak.',
    expertEvidence:'Prikazana adresa ima HTTPS i valjan certifikat za svoju domenu. Nije potvrđeno da domena pripada školi.',
    reminder:'QR kod je način prikaza podatka ili poveznice, a ne potvrda pošiljatelja. Hitnost i poznat znak ne zamjenjuju provjeru poznatim kontaktom.',
    transfer:'Opiši kojim bi već poznatim kontaktom provjerio obavijest. Ne otvaraj stvarnu sumnjivu poveznicu radi vježbe.',
    questions:[
      question('action','Što učiniti s ovim zahtjevom?','known','secret',[
        ['known','Ne upisivati lozinku; provjeriti s nastavnikom poznatim kontaktom i prijaviti poruku.','Provjera ne ovisi o poveznici ili kontaktu koji je poslala sumnjiva osoba.'],
        ['secret','Upisati lozinku jer poruka ima školski znak.','Znak se može kopirati i ne potvrđuje pošiljatelja.'],
        ['reply','Pitati isti nepoznati račun je li poruka prava.','Odgovor iste osobe nije neovisna provjera.']]),
      question('reason','Što je ključan razlog za zastajanje?','request','design',[
        ['design','Uredna slika automatski dokazuje pouzdanost.','Izgled poruke nije provjera njezina izvora.'],
        ['request','Nepotvrđena poruka traži tajnu i požuruje odluku.','Traženje lozinke uz pritisak razlog je za neovisnu provjeru, bez predaje tajne.'],
        ['qr','Svaki QR kod uvijek je napad.','Sam format QR koda ne određuje je li sadržaj siguran; važni su izvor i zahtjev.']])
    ],
    expert:question('limit','Što ovdje potvrđuje HTTPS?','connection','school',[
      ['school','Da poruku sigurno šalje škola.','Valjan certifikat za tuđu domenu ne potvrđuje školsko podrijetlo.'],
      ['safe','Da je zahtjev za lozinkom opravdan.','Zaštićena veza ne čini zahtjev vjerodostojnim.'],
      ['connection','Zaštićenu vezu prema navedenoj domeni; podrijetlo poruke još treba provjeriti.','Zaštita prijenosa i provjera opravdanosti zahtjeva različite su provjere.']])
  },
  {
    level:8,title:'Predaja rada na webu',
    context:'Otvaraš poznatu adresu za predaju projekta. Preglednik javlja da certifikat vrijedi za drugo ime poslužitelja. Predaja traži prijavu školskim računom.',
    juniorContext:'Na poznatoj školskoj stranici pojavilo se upozorenje o certifikatu. Certifikat pomaže provjeriti poslužitelj. Stranica traži tvoju lozinku.',
    expertEvidence:'Administrator popravlja certifikat. Pravila mreže trebaju dopustiti predaju, ali upravljanje poslužiteljem samo s odobrenog računala.',
    reminder:'Kod upozorenja o certifikatu zaustavi prijavu i zatraži provjeru. Slanje lozinke preko nezaštićene veze nije rješenje.',
    transfer:'Objasni nastavniku razliku između zaštite veze i pravila koja određuju tko smije pristupiti upravljanju poslužiteljem.',
    questions:[
      question('action','Kako postupiti prije predaje?','stop','ignore',[
        ['ignore','Zaobići upozorenje da se stigne rok.','Rok ne uklanja problem provjere poslužitelja.'],
        ['stop','Zaustaviti prijavu, javiti administratoru poznatim putem i pričekati provjeren ispravak.','Lozinku ne šalješ dok se problem identiteta poslužitelja ne provjeri.'],
        ['http','Prijeći na HTTP i ondje poslati lozinku.','Time uklanjaš zaštitu prijenosa umjesto da riješiš problem.']]),
      question('reason','Zašto samo pravilo vatrozida nije dovoljno?','different','firewall',[
        ['different','Dopuštena veza i valjana provjera poslužitelja rješavaju različite probleme.','Vatrozid određuje dopušten promet; TLS provjerava poslužitelj i štiti prijenos.'],
        ['firewall','Vatrozid automatski popravlja svaki certifikat.','Pravilo dopuštenog prometa ne ispravlja ime ili valjanost certifikata.'],
        ['address','Poznata adresa znači da se svako upozorenje može zanemariti.','Upozorenje i na poznatoj adresi treba istražiti prije prijave.']])
    ],
    expert:question('limit','Koji pokus potvrđuje potrebne mrežne granice?','test','open',[
      ['open','Omogućiti upravljanje poslužiteljem sa svih uređaja.','Time se gubi zadano ograničenje administracije.'],
      ['block','Zabraniti i web-predaju i administraciju.','Školska predaja mora ostati dostupna.'],
      ['test','Provjeriti predaju te dopušten i nedopušten pristup upravljanju iz odgovarajućih uloga.','Potrebno je provjeriti i ono što pravila dopuštaju i ono što trebaju odbiti.']])
  },
  {
    level:9,title:'Alarm tijekom školske provjere',
    context:'Senzor javlja mnogo pokušaja povezivanja iz učionice. U rasporedu postoji odobrena provjera mreže, ali zapis još nije uspoređen s odobrenim vremenom, uređajem i opsegom provjere.',
    juniorContext:'Mrežni alarm se oglasio. Nastavnik danas provjerava mrežu, ali još ne znamo dolazi li alarm baš od te provjere.',
    expertEvidence:'Usklađeni zapis potvrđuje dopuštenu provjeru. Drugi zapis istodobno pokazuje neovlaštenu prijavu s drugog uređaja.',
    reminder:'Alarm je trag za provjeru. Usporedi izvor, vrijeme i opis događaja s dodatnim dokazima prije zaključka.',
    transfer:'Na dva izmišljena zapisa pokaži koje činjenice treba usporediti. Ne isključuj stvarne školske senzore.',
    questions:[
      question('action','Što prvo provjeriti?','evidence','ignore',[
        ['ignore','Zanemariti svaki alarm jer je provjera najavljena.','Najava ne dokazuje da svaki događaj potječe od dopuštene provjere.'],
        ['ban','Trajno isključiti mrežu cijeloj školi.','Bez provjere opsega time nepotrebno prekidaš i dopušteni rad.'],
        ['evidence','S nastavnikom usporediti uređaj, vrijeme i opseg zapisa s odobrenom provjerom.','Dodatni dokazi omogućuju razlikovanje dopuštenog događaja od incidenta.']]),
      question('reason','Zašto se ne odlučuje samo prema alarmu?','signal','proof',[
        ['proof','Svaki alarm dokazuje napad.','Alarm može nastati i zbog dopuštenog događaja koji nalikuje sumnjivom ponašanju.'],
        ['signal','Alarm upozorava na događaj koji treba protumačiti u kontekstu.','Zaključak treba potkrijepiti podudarnim dokazima.'],
        ['silence','Bez alarma sigurno nema problema.','Senzor može propustiti incident ili nemati uvid u sve događaje.']])
    ],
    expert:question('limit','Kako postupiti s drugim zapisom?','separate','dismiss',[
      ['separate','Obraditi potvrđenu neovlaštenu prijavu odvojeno i ograničiti odgovor na pogođeni pristup.','Dopuštenost jednog događaja ne opravdava drugi, nepovezani pristup.'],
      ['dismiss','Proglasiti sve zapise dopuštenima zbog školskog pokusa.','Drugi zapis ima drugi izvor i potvrđenu neovlaštenu prijavu.'],
      ['disable','Isključiti nadzor dok ne nestanu sva upozorenja.','Nestanak upozorenja zbog ugašenog nadzora ne potvrđuje sigurnost.']])
  },
  {
    level:10,title:'Mreža na dan otvorenih vrata',
    context:'Posjetitelji trebaju internet. Mreža nazvana Gosti ima jaku lozinku, ali testni gost može otvoriti internu mapu nastavnika. Organizator je poznatim putem potvrdio koja je mreža službena.',
    juniorContext:'Školski gosti trebaju internet. Mreža Gosti ima lozinku, ali gost može otvoriti i privatnu školsku mapu. To prema školskom pravilu ne smije.',
    expertEvidence:'Nakon odvajanja gostiju posjetitelji koriste HTTPS za svoje web-prijave. WPA3 je zaštita njihove bežične veze do pristupne točke.',
    reminder:'Naziv Gosti i jaka lozinka ne stvaraju sami granicu prema internim mapama. Granicu postavljaju i provjeravaju pravila mrežnog pristupa.',
    transfer:'Opiši dva očekivana rezultata testa iz uloge gosta: internet radi, a interna školska mapa nije dostupna.',
    questions:[
      question('action','Koju promjenu zatražiti?','isolate','rename',[
        ['isolate','Od administratora tražiti odvajanje pristupa gostiju te provjeriti internet i zabranu interne mape.','Pravilo mora dopustiti internet i spriječiti neovlašten interni pristup.'],
        ['rename','Preimenovati mrežu u Sigurni gosti.','Naziv ne mijenja pravila pristupa.'],
        ['password','Promijeniti samo Wi-Fi lozinku i smatrati problem riješenim.','Nova lozinka ne uklanja prava koja dobiva već povezani gost.']]),
      question('reason','Zašto postojeća lozinka nije riješila problem?','boundary','name',[
        ['name','Riječ Gosti automatski štiti sve interne mape.','Naziv mreže nije pravilo odvajanja pristupa.'],
        ['hidden','Dovoljno je sakriti ikonu interne mape.','Skrivanje ikone ne oduzima pristup mapi.'],
        ['boundary','Pravo povezivanja na Wi-Fi i pravo pristupa internim podatcima različite su granice.','Treba zasebno urediti kamo gost smije pristupiti nakon povezivanja.']]),
    ],
    expert:question('limit','Zašto i dalje koristiti HTTPS?','tls','wpa',[
      ['wpa','WPA3 zamjenjuje zaštitu web-veze sve do svakog web-poslužitelja.','WPA3 štiti bežični dio veze, ne cijeli put do udaljene web-usluge.'],
      ['tls','HTTPS štiti web-vezu prema poslužitelju; WPA3 ima drugi opseg zaštite.','Mjere se dopunjuju jer ne štite isti dio komunikacije.'],
      ['none','Odvojena mreža čini svaku web-stranicu pouzdanom.','Odvajanje gostiju ne provjerava opravdanost zahtjeva pojedine web-stranice.']])
  },
  {
    level:11,title:'Stari disk i novi pano',
    context:'Stari disk čuva jedine snimke školskog radija i često javlja greške. Njihov gubitak zaustavio bi pripremu emisije. Novi ukrasni pano nema spremljenih radova. Danas je moguće provesti samo jednu od dvije mjere: odvojenu kopiju snimki ili preuređenje panoa.',
    juniorContext:'Stari disk često griješi, a na njemu su jedine snimke emisije. Novi pano samo ukrašava zid. Danas možemo ili kopirati snimke na drugi disk ili uljepšati pano.',
    expertEvidence:'Kopija snimki uspješno je obnovljena. Izvorni disk i dalje javlja greške, a od tada je nastala nova snimka koja još nije kopirana.',
    reminder:'Prioritet ovisi o mogućnosti štete i posljedicama za rad, a ne samo o cijeni uređaja. Kopija ublažava gubitak podataka, ali ne popravlja disk.',
    transfer:'Za drugi izmišljeni školski primjer poveži imovinu, mogući događaj, posljedicu i jednu provedivu zaštitu.',
    questions:[
      question('action','Koju mjeru prvo odabrati?','backup','poster',[
        ['poster','Uljepšati pano jer je noviji od diska.','Starost i izgled ne određuju važnost podataka i moguću štetu.'],
        ['backup','Napraviti odvojenu kopiju snimki i provjeriti obnovu.','Mjera štiti jedini sadržaj važan za nastavak emisije.'],
        ['nothing','Ne učiniti ništa dok disk potpuno ne prestane raditi.','Poznate greške i jedini primjerci daju razlog za pravodobnu zaštitu.']]),
      question('reason','Zašto snimke imaju prednost?','impact','price',[
        ['impact','Greške su već česte, a gubitak jedinih snimki prekida važan posao.','Procjena povezuje mogućnost događaja s njegovom posljedicom.'],
        ['price','Uvijek treba zaštititi samo noviji i skuplji predmet.','Važnost uključuje podatke i posljedice prekida rada, a ne samo cijenu predmeta.'],
        ['zero','Svaka kopija zauvijek uklanja sve rizike.','Kopija ne sprječava svaki kvar niti automatski uključuje buduće promjene.']])
    ],
    expert:question('limit','Koji preostali rizik treba pratiti?','remaining','fixed',[
      ['fixed','Kopija je popravila disk pa više nema potrebe za praćenjem.','Kopiranje podataka ne popravlja fizički disk.'],
      ['all','Nova snimka sigurno je u ranijoj kopiji.','Kopija ne sadrži izmjene nastale nakon njezina stvaranja.'],
      ['remaining','Kvar diska i gubitak nove snimke; dodijeliti odgovornu osobu i rok zaštite.','Treba održavati kopiju i riješiti preostali problem izvornog diska.']])
  },
  {
    level:12,title:'Povratak sustava za posudbu',
    context:'Nakon incidenta administrator je zaustavio širenje, sačuvao zapise i uklonio uzrok. Čista kopija popisa posudbe je od 13:00. Dvije posudbe iz 13:15 nisu u njoj. Kopija od 14:00 potvrđeno je oštećena.',
    juniorContext:'Administrator je zaustavio problem. Kopija popisa od 13:00 je ispravna. U njoj nema dviju novijih posudbi. Novija kopija od 14:00 je oštećena.',
    expertEvidence:'Pri provjeri obnovljene aplikacije gost može mijenjati posudbe, što nije dopušteno. Imenovana je odgovorna osoba koja treba provjeriti popravak ovlasti prije povratka u rad.',
    reminder:'Najnovija kopija nije nužno upotrebljiva. Nakon obnove treba provjeriti sadržaj, priznati nedostajuće promjene i provjeriti prava prije odobrenog povratka.',
    transfer:'Sastavi kratku prijavu: što je vraćeno, što nedostaje, što još treba provjeriti i tko odobrava povratak.',
    questions:[
      question('action','Koji plan obnove odgovara dokazima?','clean','newest',[
        ['newest','Koristiti kopiju od 14:00 samo zato što je najnovija.','Potvrđeno oštećena kopija nije pouzdan izvor obnove.'],
        ['hide','Vratiti kopiju od 13:00 i prešutjeti dvije posudbe.','Prikaz bi bio nepotpun, a korisnici ne bi znali što nedostaje.'],
        ['clean','Vratiti provjerenu kopiju od 13:00 i prijaviti dvije nedostajuće posudbe radi provjere.','Obnova koristi pouzdan izvor i jasno navodi granicu obnovljenih podataka.']]),
      question('reason','Kada odobriti nastavak rada?','verify','boots',[
        ['boots','Čim se pojavi početni zaslon.','Pokretanje ne dokazuje točnost podataka, prava pristupa ni uklonjen uzrok.'],
        ['verify','Nakon provjere podataka, ovlasti i potrebnog rada, uz odobrenje odgovorne osobe i nadzor.','Povratak se temelji na provjerama, a ne samo na tome da se program otvara.'],
        ['erase','Nakon brisanja svih zapisa o incidentu.','Zapise treba sačuvati prema postupku radi istraživanja i poboljšanja.']])
    ],
    expert:question('limit','Što učiniti s pravom gosta?','repair','accept',[
      ['repair','Ispraviti i isprobati ovlasti prije odobrenog povratka aplikacije u rad.','Oporavljena usluga mora imati i ispravno ograničen pristup.'],
      ['accept','Prihvatiti ga jer su podatci obnovljeni.','Ispravni podatci ne opravdavaju neovlaštene izmjene.'],
      ['later','Dopustiti gostima rad pa provjeriti ovlasti tek kad stigne prijava štete.','Poznata pogrešna ovlast treba biti ispravljena i provjerena prije povratka.']])
  }
];

export function practiceCase(level:number,tier:ContentTier):PracticeCase|undefined {
  const scenario=PRACTICE_CASES.find(item=>item.level===level);if(!scenario)return;
  const {expert,juniorContext,...base}=scenario;
  const questions=tier==='expert'?[...scenario.questions,expert]:scenario.questions;
  return {...base,context:tier==='junior'?juniorContext:scenario.context,expertEvidence:tier==='expert'?scenario.expertEvidence:'',questions:questions.map(q=>({...q,choices:tier==='junior'?q.choices.filter(c=>c.id===q.answer||c.id===q.juniorWrong):[...q.choices]}))};
}
export const emptyPracticeProgress=():PracticeProgress=>({answers:{},submitted:null,attempts:0,solved:false,firstCorrect:null});
export function practiceUnlocked(best:CompletedMissions,level:number){return !!PRACTICE_CASES.find(c=>c.level===level)&&best[level]?.completed===true;}
export function practiceFeedback(scenario:PracticeCase,answers:Record<string,string>){return scenario.questions.map(q=>{const choice=q.choices.find(c=>c.id===answers[q.id]);return {id:q.id,correct:choice?.id===q.answer,message:choice?.feedback||'Odaberi odgovor.'};});}
const isComplete=(scenario:PracticeCase,answers:Record<string,string>)=>scenario.questions.every(q=>q.choices.some(c=>c.id===answers[q.id]));
const isCorrect=(scenario:PracticeCase,answers:Record<string,string>)=>scenario.questions.every(q=>answers[q.id]===q.answer);
const sameAnswers=(scenario:PracticeCase,a:Record<string,string>,b:Record<string,string>)=>scenario.questions.every(q=>a[q.id]===b[q.id]);
export function setPracticeAnswer(book:PracticeBook,best:CompletedMissions,level:number,tier:ContentTier,questionId:string,value:string){
  const scenario=practiceCase(level,tier),q=scenario?.questions.find(q=>q.id===questionId);
  if(!practiceUnlocked(best,level)||!q?.choices.some(c=>c.id===value)||book[level]?.solved)return false;
  const entry=book[level]??=emptyPracticeProgress();entry.answers[questionId]=value;return true;
}
export function submitPractice(book:PracticeBook,best:CompletedMissions,level:number,tier:ContentTier):'locked'|'incomplete'|'incorrect'|'solved'|'already-solved' {
  const scenario=practiceCase(level,tier);if(!scenario||!practiceUnlocked(best,level))return 'locked';
  const entry=book[level];if(entry?.solved)return 'already-solved';
  if(!entry||!isComplete(scenario,entry.answers))return 'incomplete';
  if(entry.submitted&&sameAnswers(scenario,entry.answers,entry.submitted))return 'incorrect';
  const correct=isCorrect(scenario,entry.answers);
  entry.attempts=Math.min(entry.attempts+1,100000);entry.firstCorrect??=correct;
  entry.submitted=Object.fromEntries(scenario.questions.map(q=>[q.id,entry.answers[q.id]]));entry.solved=correct;
  return correct?'solved':'incorrect';
}
export function practiceSummary(book:PracticeBook,best:CompletedMissions){
  const available=PRACTICE_CASES.filter(c=>practiceUnlocked(best,c.level));
  const solved=available.filter(c=>book[c.level]?.solved);
  const review=available.filter(c=>book[c.level]?.firstCorrect===false).map(c=>c.level);
  const next=available.find(c=>!book[c.level]?.solved&&book[c.level]?.attempts)||available.find(c=>!book[c.level]?.solved);
  return {available:available.length,solved:solved.length,firstTry:solved.filter(c=>book[c.level]?.firstCorrect===true).length,review,next:next?.level};
}
export function parsePractice(input:unknown,tier:ContentTier,best:CompletedMissions):PracticeBook {
  const out:PracticeBook={};if(!input||typeof input!=='object'||Array.isArray(input))return out;
  const source=input as Record<string,unknown>;
  for(const {level} of PRACTICE_CASES){
    if(!practiceUnlocked(best,level))continue;
    const raw=source[level];if(!raw||typeof raw!=='object'||Array.isArray(raw))continue;
    const value=raw as Record<string,unknown>,scenario=practiceCase(level,tier)!;
    const clean=(a:unknown)=>Object.fromEntries(scenario.questions.flatMap(q=>{
      if(!a||typeof a!=='object')return [];
      const answer=(a as Record<string,unknown>)[q.id];return q.choices.some(c=>c.id===answer)?[[q.id,answer as string]]:[];
    }));
    const entry=emptyPracticeProgress();entry.answers=clean(value.answers);
    const submitted=clean(value.submitted);
    if(isComplete(scenario,submitted)){
      entry.submitted=submitted;
      entry.attempts=typeof value.attempts==='number'&&Number.isFinite(value.attempts)?Math.max(1,Math.min(100000,Math.floor(value.attempts))):1;
      entry.solved=isCorrect(scenario,submitted);
      entry.firstCorrect=entry.solved&&entry.attempts===1;
      // A solved case is a stable record. Viewing it cannot rewrite its first result.
      if(entry.solved)entry.answers={...submitted};
    }
    if(Object.keys(entry.answers).length||entry.submitted)out[level]=entry;
  }
  return out;
}
