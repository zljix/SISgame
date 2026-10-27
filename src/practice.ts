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
        ['allow','Pustiti posjetitelja pa naknadno pregledati snimku kamere.','Naknadna snimka ne provjerava ovlast prije ulaska. Najprije potvrdi posjet poznatim školskim kontaktom.'],
        ['verify','Provjeriti ovlast poznatim kontaktom prije ulaska.','Ovlast provjeravaš prije ulaska, preko školskog kontakta koji već poznaješ.'],
        ['ban','Odbiti sadašnji i buduće servisne posjete toj prostoriji.','Ovlašten servis školi je potreban; treba provjeriti ovlast, a ne zabraniti svaki rad.']]),
      question('reason','Zašto je taj postupak primjeren?','authority','camera',[
        ['authority','Potvrđena ovlast povezuje posjetitelja s dopuštenim poslom i prostorom.','Pravilo pristupa povezuje provjerenog posjetitelja s dopuštenim poslom i prostorom.'],
        ['uniform','Radna odjeća potvrđuje da osoba pripada ovlaštenom servisu.','Radna odjeća može izgledati uvjerljivo, ali ne potvrđuje pripadnost servisu ni ovlast ulaska.'],
        ['camera','Snimanje kamerom samo sprječava ulazak neovlaštene osobe.','Kamera bilježi ulazak. U ovom slučaju ne provjerava ovlast niti zaključava pristup.']])
    ],
    expert:question('limit','Što vrijedi nakon potvrde naloga?','scope','all',[
      ['all','Serviser može ući i u ostale prostorije iste škole.','Ovlast za jedan posao nije opće dopuštenje pristupa.'],
      ['scope','Serviser može obaviti odobren posao samo u knjižnici.','Pristup ostaje ograničen na opseg potvrđenog naloga.'],
      ['paper','Serviser može pregledati ispise uz mrežnu opremu.','Servis mrežne opreme ne traži čitanje osjetljivih ispisa.']])
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
        ['everyone','Svima dati uređivanje završnog lista i nacrta radi lakše suradnje.','Čitatelji bi mogli mijenjati list i otvoriti nacrt iako za to nemaju ovlast.'],
        ['none','Zatvoriti obje mape čitateljima i uredništvu radi zaštite nacrta.','Time se sprječavaju i dopušteno čitanje i rad uredništva.'],
        ['roles','Svima dati čitanje lista; samo uredništvu pristup i uređivanje nacrta.','Prava prate potrebe uloga i izričito zadano pravilo.']]),
      question('reason','Zašto prava treba razlikovati?','need','login',[
        ['need','Prijava potvrđuje račun, a prava ovise o njegovoj ulozi.','Prijava provjerava račun, a ovlasti određuju što taj račun smije raditi.'],
        ['login','Prijava školskim računom dovoljna je za izmjenu zajedničkih datoteka.','Prijava i dopuštenje za izmjenu nisu ista stvar.'],
        ['secret','Javan naslov dokumenta dovoljan je za njegovo uređivanje.','Naziv datoteke ne zamjenjuje pravila pristupa.']])
    ],
    expert:question('limit','Kako postupiti s ključem?','separate','public',[
      ['separate','Ključ predati uredniku odvojenim, zaštićenim putem.','Zaštita šifriranog sadržaja ovisi i o ograničenom pristupu ključu.'],
      ['public','Ključ staviti uz šifrirani nacrt u javno dostupnu mapu.','Tko dobije šifrirani nacrt i njegov ključ može čitati sadržaj.'],
      ['delete','Jedini ključ ukloniti prije nego što urednik primi nacrt.','Ovlašteni urednik tada ne može pročitati poslani sadržaj.']])
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
        ['rename','Preimenovati mapu Kopija u Sigurno i ostaviti je na prijenosniku.','Naziv ne mijenja činjenicu da su izvornik i kopija na istom disku.'],
        ['separate','Snimke kopirati na vanjski disk, probno obnoviti pa sigurno odspojiti disk.','Odvojena kopija može preživjeti kvar izvornog diska, a proba provjerava obnovu.'],
        ['shortcut','Napraviti prečace do svih snimki i čuvati ih u drugoj mapi.','Prečac pokazuje na izvornik; ne sadrži dodatnu kopiju snimke.']]),
      question('reason','Što provjeriti nakon probne obnove?','content','names',[
        ['names','Podudaraju li se nazivi, bez otvaranja sadržaja snimki.','Nazivi mogu postojati i kada je sadržaj nečitljiv ili nepotpun.'],
        ['icon','Prikazuje li se disk uredno, bez upozorenja uz ikonu.','Ikona diska ne potvrđuje sadržaj vraćenih snimki.'],
        ['content','Jesu li sve potrebne snimke vraćene i ispravno se otvaraju.','Potrebni su i potpunost i upotrebljiv sadržaj.']])
    ],
    expert:question('limit','Što dokazuje jedna ispravna snimka?','limited','all',[
      ['all','Da je time potvrđena potpunost cijele kopije snimki.','Jedan uspješan uzorak ne dokazuje potpunost cijelog skupa.'],
      ['limited','Da taj primjerak radi; ostale snimke još treba provjeriti.','Opseg zaključka mora odgovarati opsegu provedene provjere.'],
      ['forever','Da buduće kopije više ne trebaju provjeru obnove.','Nove izmjene i kasnija oštećenja traže održavanje i ponovne provjere.']])
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
        ['contain','Prijaviti nastavniku i uz njega odvojiti uređaj od mreže.','Ograničavaš mogući problem i uključuješ osobu odgovornu za oporavak.'],
        ['share','Poslati dodatak drugoj ekipi radi usporedbe ponašanja na njihovu uređaju.','Time možeš proširiti problem na drugi uređaj.'],
        ['ignore','Isključiti upozorenja i nastaviti započeto crtanje robota.','Skrivanje upozorenja ne uklanja njegov uzrok.']]),
      question('reason','Zašto izgled korisnog dodatka nije dovoljan?','behavior','looks',[
        ['looks','Uredno sučelje potvrđuje sigurnost programa koji koristimo.','Izgled ne govori što program radi u pozadini.'],
        ['behavior','Koristan izgled može prikrivati štetno ponašanje programa u pozadini.','Opis i izgled treba razlikovati od stvarnog ponašanja i pouzdanosti izvora.'],
        ['brand','Naziv školskog alata potvrđuje njegovu namjenu i sigurnost.','Naziv programa opisuje ponuđenu namjenu, ali ne dokazuje sigurno ponašanje.']])
    ],
    expert:question('limit','Što treba napisati u prijavi?','facts','certainty',[
      ['certainty','Navesti rootkit kao potvrđen uzrok na temelju upozorenja.','Upozorenje bez dodatne analize ne potvrđuje određenu vrstu prijetnje.'],
      ['erase','Navesti da su zapisi obrisani kako bi prijava bila uredna.','Brisanjem zapisa gube se informacije potrebne za istraživanje.'],
      ['facts','Navesti opažanja i zapise; uzrok označiti nepotvrđenim.','Prijava jasno odvaja opažene činjenice od pretpostavke.']])
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
        ['password','Promijeniti lozinku i zaključiti da su time prekinute sve sesije.','Postojeće sesije u nekim aplikacijama mogu ostati aktivne.'],
        ['revoke','Prijaviti aktivnost, opozvati sesije, promijeniti lozinku i provjeriti pristup.','Plan obuhvaća i vjerodajnicu i već otvorene pristupe.'],
        ['share','Novu lozinku podijeliti članovima grupe da zajedno provjere račun.','Dijeljenjem nove lozinke ponovno gubiš kontrolu nad računom.']]),
      question('reason','Što dodaje dva različita faktora prijavi?','key','two',[
        ['two','Prva lozinka za račun i druga lozinka za dodatnu provjeru.','Obje su nešto što znaš; to nisu dvije različite vrste faktora.'],
        ['name','Ime i prezime učenika uz njegovu novu lozinku.','Ime i prezime ne dokazuju posjedovanje drugog faktora. Lozinka i sigurnosni ključ različite su vrste dokaza.'],
        ['key','Lozinka računa uz osobni sigurnosni ključ učenika.','Lozinka je ono što znaš, a osobni ključ ono što posjeduješ.']])
    ],
    expert:question('limit','Koji zaključak vrijedi i nakon opoziva?','app','mfa',[
      ['app','Prekid sesija aplikacije i očuvanje uloga treba provjeriti.','Opoziv treba provjeriti u aplikaciji; dokaz prijave ne dodjeljuje novu ovlast.'],
      ['mfa','Dodatni MFA svim članovima dodjeljuje pravo uređivanja.','MFA štiti prijavu, a prava uređivanja određuje zasebno pravilo ovlasti.'],
      ['none','Promjena lozinke sama potvrđuje svaki opoziv u aplikacijama.','Promjena lozinke ne potvrđuje prekid sesija u svakoj aplikaciji. Učinak opoziva treba isprobati.']])
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
        ['random','Instalirati ponuđeni popravak iz reklame kako bi se ubrzao nastavak rada.','Izvor nije provjeren i može donijeti dodatni problem.'],
        ['needed','Primijeniti službeni popravak i ostaviti samo potrebne usluge.','Smanjuješ nepotrebnu izloženost uz očuvanje rada radija.']]),
      question('reason','Koji račun treba za svakodnevno uređivanje zvuka?','standard','admin',[
        ['standard','Standardni račun s potrebnim pravima za uređivanje zvuka.','Za uobičajen rad ne treba trajna ovlast mijenjanja cijelog sustava.'],
        ['admin','Administratorski račun za sav rad, uključujući uređivanje zvuka.','Suvišne ovlasti povećavaju moguće posljedice pogreške ili zlouporabe.'],
        ['shared','Administratorski račun čiji su podatci javno dostupni ekipi.','Zajednički javni administratorski pristup ruši ograničenje ovlasti.']])
    ],
    expert:question('limit','Kako provjeriti promjenu?','both','shutdown',[
      ['shutdown','Provjeriti da računalo odbija svaki pokušaj korištenja.','Potpuni prekid korištenja ne dokazuje dobro postavljenu zaštitu.'],
      ['both','Isprobati potrebne usluge i odbijanje nepotrebnog pristupa.','Provjera obuhvaća i ograničenje pristupa i dopuštene funkcije.'],
      ['desktop','Provjeriti otvara li se radna površina nakon prijave.','Radna površina ne potvrđuje ispravnost potrebnih usluga ni ograničenja.']])
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
        ['known','Zadržati lozinku; poznatim kontaktom provjeriti i prijaviti zahtjev.','Provjera ne ovisi o poveznici ili kontaktu koji je poslala sumnjiva osoba.'],
        ['secret','Upisati lozinku jer školski znak na poruci potvrđuje njezin izvor.','Znak se može kopirati i ne potvrđuje pošiljatelja.'],
        ['reply','Odgovoriti istom računu i tražiti da potvrdi svoju poruku.','Odgovor iste osobe nije neovisna provjera.']]),
      question('reason','Što je ključan razlog za zastajanje?','request','design',[
        ['design','Uredan izgled potvrđuje školski izvor poruke.','Izgled poruke nije provjera njezina izvora.'],
        ['request','Nepotvrđen izvor traži lozinku i požuruje odluku.','Traženje lozinke uz pritisak razlog je za neovisnu provjeru, bez predaje tajne.'],
        ['qr','Sam QR format potvrđuje da je riječ o napadu na račun.','QR kod je način zapisa poveznice ili podatka. Izvor i zahtjev treba provjeriti; sam format nije dokaz napada.']])
    ],
    expert:question('limit','Što ovdje potvrđuje HTTPS?','connection','school',[
      ['school','Potvrđuje da je školu moguće prepoznati kao pošiljatelja poruke.','Valjan certifikat za tuđu domenu ne potvrđuje školsko podrijetlo.'],
      ['safe','Potvrđuje da je zahtjev za lozinkom dopušten i opravdan.','Zaštićena veza ne čini zahtjev vjerodostojnim.'],
      ['connection','Štiti vezu prema domeni; izvor poruke ostaje nepotvrđen.','Zaštita prijenosa i provjera opravdanosti zahtjeva različite su provjere.']])
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
        ['ignore','Zaobići upozorenje i poslati rad kako ne bi prošao rok predaje.','Rok ne uklanja problem provjere poslužitelja.'],
        ['stop','Zaustaviti prijavu i poznatim putem zatražiti provjeren ispravak.','Lozinku ne šalješ dok se problem identiteta poslužitelja ne provjeri.'],
        ['http','Prijeći na HTTP i ondje se prijaviti kako bi nestalo upozorenje.','Time uklanjaš zaštitu prijenosa umjesto da riješiš problem.']]),
      question('reason','Zašto samo pravilo vatrozida nije dovoljno?','different','firewall',[
        ['different','Dopuštanje veze ne potvrđuje identitet poslužitelja.','Vatrozid određuje dopušten promet; TLS provjerava poslužitelj i štiti prijenos.'],
        ['firewall','Dopuštanje veze vatrozidom ujedno popravlja certifikat poslužitelja.','Pravilo dopuštenog prometa ne ispravlja ime ili valjanost certifikata.'],
        ['address','Poznata adresa opravdava zanemarivanje upozorenja preglednika.','Upozorenje i na poznatoj adresi treba istražiti prije prijave.']])
    ],
    expert:question('limit','Koji pokus potvrđuje potrebne mrežne granice?','test','open',[
      ['open','Otvoriti upravljanje sa svih uređaja i provjeriti uspješnu prijavu.','Time se gubi zadano ograničenje administracije.'],
      ['block','Blokirati predaju i upravljanje pa provjeriti da obje veze ne prolaze.','Školska predaja mora ostati dostupna.'],
      ['test','Isprobati predaju te prihvat ovlaštene i odbijanje ostale administracije.','Potrebno je provjeriti i ono što pravila dopuštaju i ono što trebaju odbiti.']])
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
        ['ignore','Zanemariti alarme tog dana jer je nastavnik najavio provjeru.','Najava ne dokazuje da svaki događaj potječe od dopuštene provjere.'],
        ['ban','Trajno isključiti školsku mrežu kako se alarm ne bi ponavljao.','Bez provjere opsega time nepotrebno prekidaš i dopušteni rad.'],
        ['evidence','Usporediti izvor, vrijeme i opseg s odobrenjem nastavnika.','Dodatni dokazi omogućuju razlikovanje dopuštenog događaja od incidenta.']]),
      question('reason','Zašto se ne odlučuje samo prema alarmu?','signal','proof',[
        ['proof','Alarm sam potvrđuje da je otkriven stvarni napad.','Alarm može nastati i zbog dopuštenog događaja koji nalikuje sumnjivom ponašanju.'],
        ['signal','Alarm traži tumačenje uz dodatne dokaze o događaju.','Zaključak treba potkrijepiti podudarnim dokazima.'],
        ['silence','Izostanak alarma potvrđuje da sustav nema sigurnosni problem.','Senzor može propustiti incident ili nemati uvid u sve događaje.']])
    ],
    expert:question('limit','Kako postupiti s drugim zapisom?','separate','dismiss',[
      ['separate','Zasebno obraditi incident i ograničiti pogođeni pristup.','Dopuštenost jednog događaja ne opravdava drugi, nepovezani pristup.'],
      ['dismiss','Sve zapise proglasiti dopuštenima jer je školski pokus potvrđen.','Drugi zapis ima drugi izvor i potvrđenu neovlaštenu prijavu.'],
      ['disable','Isključiti nadzor dok upozorenja ne prestanu ometati provjeru.','Nestanak upozorenja zbog ugašenog nadzora ne potvrđuje sigurnost.']])
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
        ['isolate','Zatražiti odvajanje gostiju; isprobati internet i zabranu interne mape.','Pravilo mora dopustiti internet i spriječiti neovlašten interni pristup.'],
        ['rename','Promijeniti naziv u Sigurni gosti i zadržati postojeća pravila pristupa.','Naziv ne mijenja pravila pristupa.'],
        ['password','Promijeniti Wi-Fi lozinku i time smatrati interni pristup zaštićenim.','Nova lozinka ne uklanja prava koja dobiva već povezani gost.']]),
      question('reason','Zašto postojeća lozinka nije riješila problem?','boundary','name',[
        ['name','Odabir naziva Gosti automatski određuje zaštitu internih mapa.','Naziv mreže nije pravilo odvajanja pristupa.'],
        ['hidden','Skrivanje ikone interne mape dovoljno je da joj gost ne pristupi.','Skrivanje ikone ne oduzima pristup mapi.'],
        ['boundary','Povezivanje na Wi-Fi i pristup internoj mapi odvojena su prava.','Treba zasebno urediti kamo gost smije pristupiti nakon povezivanja.']]),
    ],
    expert:question('limit','Zašto i dalje koristiti HTTPS?','tls','wpa',[
      ['wpa','WPA3 štiti cijeli put od uređaja do udaljene web-stranice.','WPA3 štiti bežični dio veze, ne cijeli put do udaljene web-usluge.'],
      ['tls','HTTPS štiti web-vezu; WPA3 štiti njezin bežični dio.','Mjere se dopunjuju jer ne štite isti dio komunikacije.'],
      ['none','Odvajanje gostiju potvrđuje pouzdanost stranica koje posjećuju.','Odvajanje gostiju ne provjerava opravdanost zahtjeva pojedine web-stranice.']])
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
        ['poster','Urediti pano jer je noviji predmet.','Starost i izgled ne određuju važnost podataka i moguću štetu.'],
        ['backup','Kopirati snimke na drugi disk i isprobati obnovu.','Mjera štiti jedini sadržaj važan za nastavak emisije.'],
        ['nothing','Pričekati konačan kvar diska prije odluke o zaštiti snimki.','Poznate greške i jedini primjerci daju razlog za pravodobnu zaštitu.']]),
      question('reason','Zašto snimke imaju prednost?','impact','price',[
        ['impact','Disk često griješi, a gubitak snimki prekida emisiju.','Procjena povezuje mogućnost događaja s njegovom posljedicom.'],
        ['price','Noviji i skuplji predmet ima prednost pred starijom opremom.','Prioritet ovisi o mogućnosti štete i njezinim posljedicama, a ne samo o starosti ili cijeni predmeta.'],
        ['zero','Izrada jedne kopije trajno uklanja potrebu za daljnjom zaštitom.','Kopija ne sprječava kvar ni gubitak kasnijih izmjena. Treba je održavati i provjeravati.']])
    ],
    expert:question('limit','Koji preostali rizik treba pratiti?','remaining','fixed',[
      ['fixed','Disk nakon uspješne kopije smatrati popravljenim i zatvoriti praćenje.','Kopiranje podataka ne popravlja fizički disk.'],
      ['all','Novu snimku smatrati uključenom u već izrađenu kopiju.','Kopija ne sadrži izmjene nastale nakon njezina stvaranja.'],
      ['remaining','Pratiti kvar i nekopiranu snimku uz odgovornu osobu i rok.','Treba održavati kopiju i riješiti preostali problem izvornog diska.']])
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
        ['newest','Vratiti kopiju od 14:00 jer njezino vrijeme znači da je prikladnija.','Potvrđeno oštećena kopija nije pouzdan izvor obnove.'],
        ['hide','Vratiti kopiju od 13:00 bez prijave dviju posudbi koje nedostaju.','Prikaz bi bio nepotpun, a korisnici ne bi znali što nedostaje.'],
        ['clean','Vratiti čistu kopiju od 13:00 i prijaviti dvije nedostajuće posudbe.','Obnova koristi pouzdan izvor i jasno navodi granicu obnovljenih podataka.']]),
      question('reason','Kada odobriti nastavak rada?','verify','boots',[
        ['boots','Kad se prikaže početni zaslon, prije provjere podataka i pristupa.','Pokretanje ne dokazuje točnost podataka, prava pristupa ni uklonjen uzrok.'],
        ['verify','Kad se provjere podatci, ovlasti i rad te odobri povratak uz nadzor.','Povratak se temelji na provjerama, a ne samo na tome da se program otvara.'],
        ['erase','Kad se obrišu zapisi incidenta i aplikacija ponovno pokrene.','Zapise treba sačuvati prema postupku radi istraživanja i poboljšanja.']])
    ],
    expert:question('limit','Što učiniti s pravom gosta?','repair','accept',[
      ['repair','Ispraviti ovlasti i isprobati ih prije odobrenog povratka.','Oporavljena usluga mora imati i ispravno ograničen pristup.'],
      ['accept','Zadržati ovlasti gosta jer se obnovljeni podatci ispravno otvaraju.','Ispravni podatci ne opravdavaju neovlaštene izmjene.'],
      ['later','Provjeriti ovlasti tek nakon prijave promjene koju napravi gost.','Poznata pogrešna ovlast treba biti ispravljena i provjerena prije povratka.']])
  }
];


PRACTICE_CASES.push(
  {
    level:13,title:'Fotografija za školski arhiv',
    context:'Nastavnik je poznatim školskim putem dostavio izvornu fotografiju i njezin SHA-256. Učenik je napravio kopiju pod drugim nazivom. Kopija ima isti sažetak kao referenca, ali druga dostavljena datoteka ima drukčiji sažetak iako se zove jednako kao izvornik.',
    juniorContext:'Nastavnik je potvrdio sažetak izvorne fotografije. Kopija pod drugim nazivom ima isti sažetak. Drugi primjerak s izvornim nazivom ima drukčiji sažetak.',
    expertEvidence:'Program je pri spremanju promijenio metapodatke, odnosno dodatne podatke unutar datoteke. Slika izgleda isto, ali bajtovi datoteke više nisu isti.',
    reminder:'Sažetak se računa iz sadržaja datoteke. Naziv nije dovoljan za usporedbu, a očekivani sažetak treba dobiti iz pouzdanog izvora.',
    transfer:'Uz nastavnika usporedi SHA-256 dvaju primjeraka bezazlene probne datoteke. Preimenuj jedan pa ponovi; zatim izmijeni sadržaj pa ponovno usporedi.',
    questions:[
      question('action','Koji primjerak odgovara potvrđenom sažetku?','copy','name',[
        ['name','Primjerak s izvornim nazivom i drukčijim sažetkom sadržaja.','Naziv ne dokazuje isti sadržaj; različit sažetak pokazuje razliku podataka.'],
        ['copy','Preimenovana kopija čiji je sažetak jednak potvrđenom.','Naziv može biti drukčiji dok podatci ostaju isti. Usporedba se oslanja na potvrđenu referencu.'],
        ['both','Oba primjerka jer ih povezuje isti dan primitka datoteka.','Vrijeme primitka ne govori odgovaraju li podatci izvorniku.']]),
      question('reason','Zašto naziv nije dovoljan?','bytes','secret',[
        ['bytes','Sažetak ovisi o sadržaju, a promjena naziva ne mijenja taj sadržaj.','Promjena naziva sama ne mijenja bajtove sadržaja koje ovdje sažimamo.'],
        ['secret','Sažetak šifrira fotografiju pa njezin naziv više nije važan.','Hash nije šifriranje i ne skriva fotografiju.'],
        ['restore','Sažetak čuva cijelu fotografiju za obnovu pod drugim nazivom.','Za obnovu treba sačuvana datoteka, ne samo njezin sažetak.']])
    ],
    expert:question('limit','Što očekuješ nakon promjene metapodataka unutar datoteke?','different','same',[
      ['same','Isti sažetak jer vidljivi izgled fotografije nije promijenjen.','Izgled nije isto što i točni podatci cijele datoteke.'],
      ['attacker','Razlika sažetka sama bi potvrdila napad na tu fotografiju.','Poznata izmjena metapodataka može objasniti razliku bez napada.'],
      ['different','Tipično drugi sažetak jer su izmijenjeni podatci datoteke.','SHA-256 se računa iz bajtova, uključujući metapodatke koji su dio tih bajtova.']])
  },
  {
    level:14,title:'Potpisana potvrda za putovanje',
    context:'Digitalno potpisana školska potvrda sadrži osobne podatke učenika. Potpis prolazi uz javni ključ potvrđen poznatim školskim putem. Potvrdu smije primiti samo ovlašteni organizator, a netko predlaže objavu na javnoj ploči jer je dokument potpisan.',
    juniorContext:'Školska potvrda ima ispravan digitalni potpis, ali sadrži privatne podatke. Čitati je smije samo ovlašteni organizator. Predložena je javna objava.',
    expertEvidence:'Zasebna poruka izgleda kao školska. Potpis joj prolazi uz ključ priložen toj poruci, ali nije potvrđeno čiji je taj ključ.',
    reminder:'Potpis provjerava vezu sadržaja i ključa. Za zaključak o izvoru potvrdi vlasnika javnog ključa. Za skrivanje osjetljivog sadržaja trebaju zasebna zaštita i ovlasti.',
    transfer:'Uz nastavnika objasni što bi provjerio u izvještaju o potpisu probnog dokumenta: podudaranje, potpisnika i izvor povjerenja. Koristi samo probne podatke.',
    questions:[
      question('action','Kako predati potvrdu?','restricted','public',[
        ['public','Objaviti je na javnoj ploči jer potpis skriva osobne podatke.','Potpis ne skriva tekst. Javna objava otkrila bi osobne podatke.'],
        ['private-key','Predati je organizatoru zajedno sa školskim privatnim ključem.','Privatni ključ mora ostati kod potpisnika; primatelju nije potreban za provjeru.'],
        ['restricted','Predati je zaštićenim putem samo ovlaštenom organizatoru.','Zaštita čitljivosti i ovlasti potrebne su uz provjeru potpisa.']]),
      question('reason','Koja tvrdnja vrijedi za povjerljivi potpisani dokument?','privacy','identity',[
        ['identity','Potpis je slika koja nije povezana sa sadržajem dokumenta.','Digitalni potpis računalo provjerava uz sadržaj i javni ključ; nije samo slika.'],
        ['privacy','Potpisani sadržaj i dalje treba zaštititi od čitanja.','Digitalni potpis ne skriva sadržaj. Povjerljiv dokument treba zasebno šifriranje i ograničenje pristupa.'],
        ['everyone','Potpisom svi primatelji dobivaju ovlast čitanja dokumenta.','Ovlast ne proizlazi iz toga što je dokument potpisan.']])
    ],
    expert:question('limit','Možeš li zasebnu poruku odmah smatrati školskom?','verify','trust',[
      ['trust','Prihvatiti poruku jer potpis prolazi uz ključ koji joj je priložen.','Netko može poslati vlastiti ključ i vlastiti valjan potpis. Vezu sa školom treba potvrditi.'],
      ['verify','Poznatim putem prvo potvrditi da javni ključ pripada školi.','Matematičko podudaranje i povjerenje u identitet potpisnika odvojene su provjere.'],
      ['rename','Prihvatiti poruku nakon preimenovanja datoteke u skola.pdf.','Naziv ne potvrđuje potpisnika ni vlasnika ključa.']])
  }
);

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
