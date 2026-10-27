# SISgame — sadržaj kampanje 0.6.0

Igra ima dvanaest misija i 48 sigurnosnih zadaća po razini sadržaja. Inačica 0.6.0 dodaje po jedan novi slučaj primjene nakon svake misije, s odvojenom evidencijom vježbanja. Misija traje koliko učeniku treba za istraživanje i odluke; nema vremenske kazne za čitanje. Nakon pouke učenik postavlja mjere, ispravlja pogreške i provjerava rezultat. Izlaz se otvara tek nakon četiri dovršene zadaće.

## Dob, predznanje i pristupačnost

Primarna razvojna publika je 13–18 godina, s naglaskom na srednju školu. Junior (11–13), Standard (14–16) i Expert (16+) su orijentacijske oznake sadržaja; nisu formalna PEGI klasifikacija niti rezultat provedenog testiranja s učenicima. Izbor nije zaključan dobi.

| Prilagodba | Junior | Standard | Expert |
| --- | --- | --- | --- |
| Pouka | Kratke rečenice i tri slikovna koraka | Pouka i rječnik pojmova | Pouka, pojmovi i dodatni slučaj |
| Jednostavni izbori | Najviše dvije mogućnosti | Puni ponuđeni postupci | Puni postupci i analiza posljedica |
| Prava mapa | Učenik i nastavnik; gost je pripremljen | Tri uloge | Tri uloge + čuvanje ključa i ovlasti |
| Zlonamjerni programi | Dva izvještaja: trojanski konj i crv | Tri izvještaja, uključujući virus; rootkit u oporavku | Tri izvještaja + posljedice krađe vjerodajnica |
| Prijave | Dva zapisa | Tri zapisa, uključujući odbijenu lozinku | Četiri zapisa, uključujući legitimni VPN |
| Usluge i mreža | Dvije promjenjive postavke; ostale su pripremljene | Tri usluge / mrežne veze | Puni skup + prioritizacija ranjivosti i mrežna ograničenja |
| IDS/IPS zapisi | Dva kratka zapisa i dva zaključka | Tri zapisa i tri zaključka | Puni skup + slučaj propuštene prijetnje |
| Wi-Fi | WPA3 unaprijed pripremljen; dva izbora pristupa gostiju | Izbor zaštite i tri mogućnosti gostujućeg pristupa | Puni skup + provjera stvarnog odvajanja |
| Rizik i mjere | Dva slučaja bez računanja; tri jedinice rada | Tri slučaja, ocjene V × U; pet jedinica rada | Puni skup + preostali rizik i provjera učinka |
| Plan incidenta | Prvi i zadnji korak; srednji pripremljen | Tri koraka i posljedice redoslijeda | Puni skup + provjera ovlasti, nastavak rada i pouke |
| Završetak | Provjera mjera | Provjera mjera i pitanje za primjenu | Obvezna analiza triju odluka prije završne provjere |

Tempo (bez smetnji / lagan / srednji / brz) ne bira nastavni sadržaj. Expert može biti bez smetnji i bez sata. Junior može imati brz arkadni tempo. Brzina i refleksi ne određuju bodove učenja.

Opcionalni Expert izazov ima 90 sekundi **aktivnog rješavanja dodatnog slučaja**, ne cijele misije. Početno je isključen. Dok učenik čita prije pritiska na Pokreni, sat ne teče. Zatvaranje analize ili odlazak iz aktivnog prozora zaustavlja mjerenje. Započeti odgovori i preostalo vrijeme spremaju se za nastavak. Isključivanje i istek dopuštaju nastavak bez gubitka bodova ili označavanja odgovora kao pogrešnog. Vrijeme služi vježbanju odluka pod pritiskom, ne procjeni znanja.

## Veza s nastavnim okvirom

Sadržaj nastavlja SIS priručnik i okvir od sedam cjelina / 26 tema. Jedna misija može objediniti više tema; dvanaest misija **ne predstavlja svih 26 lekcija**.

| Misija | Područje | Što učenik treba pokazati |
| --- | --- | --- |
| 1. Zaključaj rizik | Fizički sloj | Provjeriti ovlast ulaska, odabrati UPS za kritičnu opremu i sigurno zbrinuti ispis. |
| 2. Samo za ovlaštene | Podatkovni sloj | Primijeniti zadanu politiku pristupa i zaštititi povjerljivi prijenos. |
| 3. Povratak podataka | Podatkovni sloj | Odvojiti kopiju od radnog diska, obnoviti sve datoteke i provjeriti sadržaj. |
| 4. Sumnjivi program | Aplikacijski sloj, teme 11–13 | Razlikovati virus, crv i trojanski konj iz ponašanja; ograničiti incident i izabrati pouzdan oporavak kod rootkita. |
| 5. Tko se prijavio? | Računalni sloj, teme 14–15 | Izdvojiti sumnjivu uspješnu prijavu, opozvati sesije, odabrati jedinstvenu lozinku i dva različita faktora. |
| 6. Ojačaj sustav | Računalni sloj, tema 16 | Primijeniti provjerene nadogradnje, koristiti standardni račun i ostaviti samo potrebne usluge. |
| 7. Ne nasjedaj poruci | Socijalni inženjering i operativni postupci | Prepoznati sumnjiv zahtjev, provjeriti ga neovisnim putem i sigurno prijaviti. |
| 8. Mreža pod nadzorom | Mrežni sloj i sigurni protokoli | Dopustiti potreban promet, ograničiti administraciju i reagirati na pogrešan certifikat. |
| 9. Trag iza alarma | Mrežni nadzor i odgovor na incident | Razlikovati IDS i IPS, zaključivati iz dodatnih dokaza i primijeniti ciljani odgovor uz očuvanje rada. |
| 10. Wi-Fi za prave goste | Bežična mreža i odvajanje pristupa | Provjeriti mrežu poznatim putem, zaštititi vezu i provjeriti granice gostujućeg pristupa. |
| 11. Što prvo zaštititi? | Imovina, rizik i mjere | Povezati imovinu s nastavom, odrediti prioritete iz zadanih procjena i odabrati provedive mjere. |
| 12. Smireno kroz incident | Operativni odgovor i oporavak | Prijaviti činjenice, složiti plan, odabrati pouzdan izvor i provjeriti povratak uz nadzor. |

Procjena imovine i rizika te plan odgovora na incident sada imaju samostalne misije. Dodatni slučajevi sada omogućuju vođenu primjenu na novim činjenicama; prijenos u praktičan rad i dalje treba provjeriti u nastavi. Mrežne veze, TLS i phishing također imaju zasebne misije. Opisi misija 4–6 u nastavku odgovaraju Standardu; Junior pojednostavljenja i Expert dodatci navedeni su zasebno.

## 4. Sumnjivi program

**Scenarij:** zaštita na LAB-04 prijavljuje sumnjiv program. Učenik igra ulogu ovlaštenog školskog administratora. Crvene arkadne smetnje nisu stvarni zlonamjerni programi.

1. **Izolacija:** prekini mrežne veze LAB-04, prijavi incident i sačuvaj zapise. Gašenje monitora ne zaustavlja program, a ponovno pokretanje nije dokaz čišćenja.
2. **Analiza:** razvrstaj tri unaprijed pripremljena laboratorijska izvještaja. A je trojanski konj (prikrivena štetna funkcija), B crv (samostalno mrežno širenje), C virus (zaraza programa domaćina). Razvrstavanje slijedi opaženo ponašanje; stvarni programi mogu kombinirati svojstva.
3. **Oporavak:** izvanmrežna provjera otkrila je i rootkit. Za ovaj konkretni slučaj plan nalaže obnovu iz pouzdanog izvora, nadogradnje i vraćanje provjerenih podataka. Ne prenosi se sumnjivi instalacijski paket.
4. **Provjera:** provjeri aktivnu zaštitu, nadogradnje i otvaranje obnovljenih dokumenata. Administrator tek zatim odobrava ponovno povezivanje uz nadzor.

**Pitanje nakon igre:** Zašto jedan čist antivirusni nalaz nije dovoljan kada postoji sumnja na rootkit?

**Očekivano obrazloženje:** kompromitirani sustav može skrivati promjene. Povjerenje zahtijeva pouzdan izvor provjere/oporavka i provjeru rada; to ne znači da svaka infekcija uvijek zahtijeva ponovnu instalaciju.

## 5. Tko se prijavio?

**Scenarij:** vlasnik potvrđuje jutarnju prijavu sa školskog računala. Ne prepoznaje kasniju uspješnu prijavu s drugog uređaja.

1. **Dnevnik:** odaberi događaj u 22:43, prijavi ga i opozovi sesije uz čuvanje zapisa i privremenu blokadu prijava. Pogrešna lozinka u 08:11 nije stvorila sesiju. Neuspjele pokušaje također vrijedi pratiti; ovdje se traži postojeći neovlašteni pristup.
2. **Lozinka:** odaberi novu, dugu, nasumičnu i jedinstvenu lozinku spremljenu u upravitelju. Igra nikad ne traži stvarnu lozinku.
3. **MFA:** lozinka i registrirani FIDO2 sigurnosni ključ predstavljaju znanje i posjedovanje. Lozinka + PIN i lozinka + sigurnosno pitanje nisu dva različita faktora.
4. **Provjera:** vlasnik s oba faktora dobiva pristup; stara lozinka, nedostajući ključ i opozvana sesija ne prolaze. Prijavljeni učenik i dalje ne smije mijenjati Ocjene.

**Pitanje nakon igre:** Zašto promjena lozinke i opoziv sesija nisu ista radnja? Kako se prijava razlikuje od ovlasti?

**Očekivano obrazloženje:** postojeći token/sesija može ostati valjan nakon promjene lozinke, ovisno o usluzi. Potrebni su opoziv i provjera pristupa. Autentifikacija provjerava identitet, dok autorizacija određuje dopuštene radnje. Trenutačni opoziv u igri je pojednostavljenje; stvarne usluge mogu imati odgodu i zasebne aplikacijske sesije.

## 6. Ojačaj sustav

**Scenarij:** u dogovorenom terminu održavanja priprema se školska radna stanica. Učenički rad je spremljen.

1. **Nadogradnje:** primijeni službenu sigurnosnu nadogradnju, obavi potreban restart i provjeri inačicu. Oglas s navodnim popravkom nije pouzdan izvor.
2. **Računi:** standardni korisnik za svakodnevni rad; odvojen ovlašteni administrator i uključen UAC za potrebne promjene sustava.
3. **Usluge:** ostavi nadogradnje i školsku predaju radova uključene; isključi udaljeni pristup koji u scenariju nije potreban ni odobren. To je politika ove stanice, a ne opća zabrana udaljene administracije.
4. **Provjera:** školski rad i nadogradnje ostaju dostupni. Nepotreban udaljeni pristup i neovlaštena instalacija za cijeli sustav ne prolaze.

**Pitanje nakon igre:** Zašto isključivanje svih usluga nije dobro rješenje?

**Očekivano obrazloženje:** sigurnost uključuje i dostupnost potrebnog rada. Mjere trebaju smanjiti nepotreban pristup uz očuvanje nastave i održavanja.

## 7. Ne nasjedaj poruci

**Scenarij:** poruka s imenom „Školska podrška” prijeti gašenjem računa za deset minuta. Pošiljatelj je `podrska@potvrda.example`, poveznica `portal.skola.example.potvrda.example`, a poznata školska adresa `portal.skola.example`. Svi nazivi su izmišljeni; poveznica nije aktivna i nikad se ne traži prava lozinka.

1. Zastani i pregledaj zahtjev, adresu i vremenski pritisak. Logotip sam ne potvrđuje pošiljatelja.
2. Provjeri poznatim školskim kontaktom ili spremljenom oznakom. Odgovor na istu poruku nije neovisna provjera.
3. Kad škola potvrdi obmanu, prijavi je administratoru dogovorenim kanalom. Poruku ne šalji prijateljima na isprobavanje.
4. Pravi portal treba ostati dostupan, a lažnoj stranici ne predaju se lozinka i jednokratni kod.

**Expert:** i valjana HTTPS veza može završiti na pogrešnoj domeni. Treba prepoznati `potvrda.example`, razlikovati zaštitu prijenosa od vjerodostojnosti zahtjeva i nastaviti preko poznate oznake.

## 8. Mreža pod nadzorom

**Scenarij:** učenik predaje rad školskom portalu. Administracija je dopuštena samo iz upravljačke mreže.

1. Odaberi HTTPS s provjerom pravog poslužitelja.
2. Prekidači mrežnih pravila odmah prikazuju **PROLAZI / BLOKIRANO** za konkretne veze. Potrebna predaja preko TCP 443 i odobrena administracija preko TCP 22 moraju prolaziti; administracija iz nepoznatog izvora mora biti blokirana. Ni „sve otvoreno” ni „sve zatvoreno” ne ispunjavaju zadatak. U Junioru je ovlaštena administracija pripremljena, a učenik uređuje preostale dvije veze.
3. Pojavljuje se upozorenje o pogrešnom imenu u certifikatu. Zaustavi prijavu i zatraži ispravak. Simulirani administrator postavlja odgovarajući certifikat; provjeravaju se ime, valjanost i povjerenje.
4. Isprobaj potreban rad i zabranu neovlaštenog pristupa.

**Expert:** plan navodi potrebnu uslugu TCP 443, ograničenje TCP 22 na upravljačku mrežu i popravak certifikata. Poznavanje brojeva portova uvodi se u pouci slučaja prije primjene.

## 9. Trag iza alarma

**Scenarij:** učenik uz ovlaštenog administratora istražuje izmišljene zapise i priprema ciljani odgovor. Nema slanja stvarnih napada.

1. **Senzori:** usporedi IDS koji u probi javlja događaj s IPS-om koji uz otkrivanje može zaustaviti promet prema pravilu. Alarm nije dokaz da je promet blokiran; izostanak alarma nije potvrda da nema incidenta.
2. **Zapisi:** A odgovara potvrđenom nalogu za održavanje (odobreni rad); B sadrži potvrđenu neovlaštenu promjenu (incident); C sadrži odbijene pokušaje bez pregledanih drugih zapisa (daljnja provjera). Junior obrađuje A i B. Nepotpun obrazac ne bilježi pogrešku, a pogrešan potpuni odgovor objašnjava koji dokaz treba ponovno razmotriti.
3. **Odgovor:** izoliraj LAB-09 i primijeni odobreno ciljano pravilo uz sačuvane zapise. U ovom ograničenom slučaju nisu opravdani gašenje nadzora ni blokiranje svih školskih veza. Izolacija ne dokazuje uklonjen uzrok.
4. **Provjera:** probni štetni promet je blokiran, predaja rada i odobrena provjera prolaze, a zapisi ostaju dostupni. LAB-09 ostaje izoliran do daljnje obrade i oporavka.

**Expert:** dnevnik potvrđuje incident iako senzor šuti. Obradi dokaz, ograniči iznimku za odobrenu provjeru na potvrđen izvor/opseg/termin te isprobaj i zaštitu i potreban rad.

## 10. Wi-Fi za prave goste

**Scenarij:** mali školski prostor prima goste. Svi uređaji u ovom scenariju podržavaju WPA3-Personal. To je namjerno ograničen didaktički primjer, a ne univerzalan projekt školske bežične infrastrukture; poslovna autentifikacija i stariji uređaji nisu obuhvaćeni.

1. **Identitet mreže:** preuzmi odobrene postavke poznatim školskim kontaktom. Najjači signal ili poznati SSID sami ne potvrđuju vlasnika.
2. **Postavke:** odaberi WPA3-Personal i internet bez pristupa internoj školskoj mreži. Simulacija postavlja zasebnu dugu Wi-Fi lozinku bez traženja stvarnih tajnih podataka. Tri pokazatelja prikazuju posljedice odabira: zaštitu bežične veze, internet gosta i internu mrežu. WEP i nezaštićena veza ne ispunjavaju ovaj zadatak; potpuna zabrana prometa onemogućuje potreban rad. Junior ima WPA3 pripremljen i bira između odvojenog i preširokog pristupa.
3. **Održavanje:** ovlašteni administrator mijenja početnu lozinku za upravljanje i primjenjuje službenu nadogradnju. Skriveni ili promijenjeni SSID to ne zamjenjuje. Lozinka za upravljanje nije ista namjena kao lozinka za spajanje gosta.
4. **Provjera:** gost ima internet, ali ne i put do interne školske mreže i upravljanja. Web-prijenos i dalje treba HTTPS. Naziv Gost nije dokaz odvajanja; potrebno je provjeriti učinak mrežnih pravila.

**Expert:** i uz WPA3 gost može imati preširoka mrežna prava. Ispravi odvajanje, provjeri ga iz gostujuće mreže i zadrži HTTPS za web.

Nedovršeni odabiri na konzolama upozorenja i Wi-Fi postavki automatski se spremaju. Obnova provjerava dopuštene vrijednosti, ne pretvara ih u službeno dokazane rezultate.

## 11. Što prvo zaštititi?

**Scenarij:** škola mora zaštititi radove i potrebne usluge uz ograničene resurse. Popis obuhvaća arhivu, račun za promjenu rasporeda i javni plakat. Ocjene su zadane procjene školskog tima za sljedeći mjesec.

1. **Imovina:** poveži podatke, usluge i uređaje s nastavom te zabilježi odgovorne osobe i posljedice problema. Nabavna cijena uređaja nije jedino mjerilo vrijednosti.
2. **Procjena:** u školskom modelu vjerojatnost i učinak imaju ocjene 1–3. Umnožak 1–2 daje nizak, 3–4 srednji, a 6–9 visok prioritet. Ocjene nisu izmjerene vjerojatnosti i ne daju novčani gubitak.
3. **Plan mjera:** pet jedinica rada rasporedi na odvojenu kopiju s probom obnove (3) i osobne račune s potrebnim ovlastima (2). Dodatni UPS ne uklanja opisani kvar diska; ukras plakata ne štiti podatke. Prikaz troška i očekivanog preostalog rizika mijenja se odmah, a potvrda bilježi odluku.
4. **Provjera:** odabrane mjere provode se u simulaciji. Uspoređuju se obnovljeni radovi i provjeravaju ovlasti. Administrator prati preostali rizik i planira zamjenu problematičnog diska.

| Slučaj | Vjerojatnost | Učinak | Početni prioritet | Učinak ciljane mjere u modelu |
| --- | --- | --- | --- | --- |
| Jedini radovi na disku koji javlja greške | 3 | 3 | 9 — visok | Provjerena kopija smanjuje učinak na 1; 3 — srednji. Kvar je i dalje moguć. |
| Zajednička lozinka za promjenu rasporeda | 2 | 2 | 4 — srednji | Uklanjanje zajedničkog pristupa smanjuje procijenjenu vjerojatnost na 1; 2 — nizak. |
| Rijetka promjena boje ukrasa na javnom plakatu | 1 | 1 | 1 — nizak | Nije prioritet prije zaštite radova i ovlasti; nema učinka na sadržaj ni nastavu. |

**Junior:** samo arhiva i plakat, bez umnoška ocjena. Učenik bira visok ili nizak prioritet i raspolaže s tri jedinice rada. Točan plan je odvojena kopija s probom obnove. Račun za promjenu rasporeda nije dio njegova završnog izvještaja.

**Pitanje nakon igre:** Zašto kopija smanjuje posljedicu kvara, a ne mora smanjiti vjerojatnost da se disk pokvari?

**Očekivano obrazloženje:** kopija omogućuje povrat podataka, ali ne uklanja hardversku slabost. Najnovije promjene nakon izrade kopije i dalje mogu nedostajati. Nije ispravno tvrditi da je rizik nula. Zamjenu diska i učestalost kopija treba zasebno planirati.

## 12. Smireno kroz incident

**Scenarij:** u 09:10 na LAB-12 nije moguće otvoriti školske radove. Uzrok i opseg u početku nisu poznati. Učenik sudjeluje uz ovlaštenog administratora, bez pristupa stvarnim sustavima.

1. **Prijava:** poznatim školskim kanalom prijavi uređaj, vrijeme i opažanja, uz sačuvanu poruku i jasno označen nepoznati uzrok. Ne nagađaj krivca i ne objavljuj dokumente u razrednoj grupi.
2. **Plan:** složi tri koraka za ovaj slučaj: ograničavanje širenja uz prijavu i čuvanje dokaza; uklanjanje uzroka i priprema obnove iz provjerenog izvora; provjera rada i ovlasti prije odobrenog povratka uz nadzor. Konzola pokazuje posljedice redoslijeda. Time se provjerava **plan**, ne izvodi stvarna promjena uređaja. Komunikacija i rad s dokazima traju kroz cijeli postupak; aktivnosti se u praksi mogu preklapati.
3. **Izvor obnove:** nakon odobrenog ograničavanja i uklanjanja uzroka biraj kopiju A iz 08:00, koja je provjerena i čista. Kopija B iz 09:00 potvrđeno je oštećena. Izmjena iz 08:20 nije u kopiji A i mora biti prijavljena kao nedostajuća. Povrat čiste kopije uz tvrdnju da ništa nije izgubljeno također je pogrešan odgovor.
4. **Povratak i pouke:** provjeri dokumente, ovlasti i uslugu. Administrator odobrava povezivanje uz nadzor. Izvještaj bilježi nedostajući rad te odgovornu osobu i rok provjere poboljšanih kopija.

**Junior:** srednji korak popravka je pripremljen. Učenik odabire prvi i završni korak među dvije mogućnosti po koraku. Izvor obnove bira između oštećene novije kopije i čiste starije uz prijavu gubitka rada.

**Pitanje nakon igre:** Što prijaviti ako kopija ne sadrži posljednju izmjenu? Kako iz incidenta napraviti korisno poboljšanje?

**Očekivano obrazloženje:** navesti točno što je obnovljeno i što nedostaje; ne izjednačiti pokretanje računala s punim oporavkom. Poboljšanje treba imati odgovornu osobu, rok i provjeru provedbe.

## Expert slučajevi i očekivani zaključci

| Misija | Novi dokaz ili ograničenje | Plan koji odgovara slučaju |
| --- | --- | --- |
| 1 | UPS ima 4 minute; spremanje traje 1, gašenje 2 minute. | Odmah spremiti, uredno ugasiti, i dalje održavati odvojenu kopiju. |
| 2 | Ključ i šifrirana datoteka predloženi su za javnu mapu. | Ključ odvojeno i ograničeno; gost bez prava; primatelj provjerava sadržaj. |
| 3 | Čista kopija 10:00, promjena 10:20, kvar 10:30, oštećena kopija 11:00. | Obnoviti kopiju A, prijaviti nedostajuću promjenu u 10:20 i provjeriti sadržaj. |
| 4 | Uređaj je obnovljen, ali ukradena lozinka i aktivna sesija ostaju problem. | Opozvati sesiju, promijeniti lozinku s čistog uređaja, sačuvati zapise. |
| 5 | MFA je uspio, ali učenik nema pravo mijenjanja ocjena; aplikacija drži vlastitu sesiju. | Odbiti neovlaštenu promjenu, opozvati i provjeriti aplikacijsku sesiju, dopustiti legitiman rad. |
| 6 | Javni servis aktivno je napadan, lokalna aplikacija ima kozmetičku grešku. | Prioritet javnom servisu; službena zakrpa; provjera zaštite i dostupnosti. |
| 7 | Lažna domena ima valjan HTTPS certifikat. | Prepoznati domenu, razumjeti granice TLS-a, provjeriti poznatim putem. |
| 8 | Potrebni su školski web i ograničeni SSH; certifikat ima pogrešno ime. | Dopustiti potreban web, ograničiti administraciju, ispraviti certifikat. |
| 9 | Senzor šuti, ali drugi izvor potvrđuje incident; odobreni skener stvara lažne alarme. | Obraditi potvrđen dokaz, usko ograničiti iznimku i provjeriti zaštitu i dostupnost. |
| 10 | WPA3 je uključen, ali gost vidi internu mapu. | Popraviti mrežna pravila, isprobati ih iz uloge gosta i zadržati HTTPS. |
| 11 | Kopija je provjerena, ali disk i dalje javlja greške, a novije izmjene nisu kopirane. | Razlikovati vjerojatnost kvara od gubitka rada, provjeriti obnovu i evidentirati preostali rizik s odgovornom osobom i rokom. |
| 12 | Obnovljena mapa gostu dopušta izmjene; odvojena učionica radi, a poboljšanje kopija nema vlasnika. | Ispraviti ovlasti prije povezivanja, sačuvati opravdano dostupan rad i dodijeliti provjerljiv zadatak poboljšanja. |

Dodatni slučajevi su provjera primjene na novim činjenicama. Tri ispravne odluke otključavaju zadnju sigurnosnu zadaću; same ne daju dodatne bodove. Netočan potpun plan bilježi ispravak završne zadaće, nepotpun obrazac traži dopunu bez kazne.

## Dodatna primjena nakon završene misije (0.6.0)

Ovi slučajevi dostupni su svim razinama sadržaja. Ne zamjenjuju obveznu Expert analizu unutar misije i ne uvode nove ishode. Otvaraju se tek nakon odgovarajuće misije, pa učenik već ima pouku, primjer i vođeni zadatak. Na raspolaganju su kratki podsjetnik i cijela prethodna pouka; kod QR koda pojam je objašnjen i u samom opisu novog slučaja.

| Nakon misije | Nova situacija | Očekivana odluka i razlog | Dodatni zaključak za Expert |
| --- | --- | --- | --- |
| 1 | Nenajavljeni serviser | Provjera ovlasti poznatim školskim kontaktom; kamera ne odobrava ulazak. | Potvrđeni nalog ograničen je na odobren prostor i posao. |
| 2 | Uredništvo školskog lista | Čitanje završne verzije i uređivanje nacrta prema ulogama; prijava nije opća ovlast. | Ključ se dostavlja ovlaštenom uredniku odvojeno i zaštićeno. |
| 3 | Snimke školske izložbe | Odvojena kopija i provjera vraćenog sadržaja; nazivi sami nisu dovoljni. | Uspješan primjerak ne potvrđuje potpunost cijele kopije. |
| 4 | Dodatak za robotsku ekipu | Prijava i odvajanje uz nastavnika prema postupku; koristan izgled ne dokazuje sigurno ponašanje. | Prijaviti činjenice i ne tvrditi nepotvrđenu vrstu prijetnje. |
| 5 | Račun na posuđenom tabletu | Prekinuti sumnjive sesije, zaštititi lozinku i provjeriti učinak; lozinka i osobni ključ različiti su faktori. | Provjeriti aplikacijske sesije i zasebne ovlasti. |
| 6 | Računalo školskog radija | Službeni popravak, zatvaranje nepotrebnog pristupa i standardni račun za rad. | Provjeriti i ograničenje i potrebne funkcije radija. |
| 7 | QR kod za izlet | Ne predavati lozinku; provjeriti poznatim kontaktom. Hitnost i znak škole nisu dokaz. | HTTPS štiti vezu prema domeni, ali ne potvrđuje školsko podrijetlo poruke. |
| 8 | Web-predaja rada | Zaustaviti prijavu kod pogrešnog certifikata; vatrozid ne popravlja TLS. | Isprobati dopuštenu predaju i obje granice pristupa upravljanju. |
| 9 | Alarm tijekom školske provjere | Usporediti izvor, vrijeme i opseg s odobrenjem; alarm je trag za tumačenje. | Zasebno obraditi potvrđenu neovlaštenu prijavu drugog uređaja. |
| 10 | Dan otvorenih vrata | Stvarno odvojiti goste i isprobati granicu; naziv i lozinka ne postavljaju ovlasti. | WPA3 i HTTPS imaju različit opseg zaštite. |
| 11 | Stari disk i ukrasni pano | Zaštititi jedine snimke zbog čestih grešaka i posljedica prekida rada. | Kopija ne popravlja disk niti uključuje kasnije promjene. |
| 12 | Sustav za posudbu | Koristiti čistu kopiju, prijaviti nedostajuće posudbe i provjeriti povratak. | Nepravilne ovlasti gosta treba popraviti i isprobati prije odobrenja rada. |

Junior ima kraći opis i **2 pitanja s po 2 odgovora**. Standard ima **2 pitanja s po 3 odgovora**. Expert dobiva dodatni dokaz i **3 pitanja s po 3 odgovora**. U cijelom skupu to je 24 odluke za Junior/Standard odnosno 36 za Expert. U svim razinama učenik odabire i postupak i obrazloženje. Odabir ponuđenog obrazloženja treba dopuniti usmenim ili praktičnim objašnjenjem u nastavi.

Svaka potpuna predaja daje objašnjenje uz pojedino pitanje. Netočne odluke mogu se ispraviti; prazna predaja i uzastopna ponovljena predaja istih odabira ne povećavaju broj pokušaja. Nakon točnog rješenja slučaj se prikazuje kao zapis koji se više ne prepisuje. Oznaka „iz prve” znači točan prvi potpuni odgovor uz dostupnu pomoć. Ne čuva se puna povijest svih odgovora, nego odabiri, posljednja potpuna predaja, broj pokušaja i točnost prve predaje.

Pregled prikazuje riješene slučajeve i teme u kojima je trebalo ispravljati odluku. Te preporuke ostaju vidljive i nakon uspješnog ispravka. Junior, Standard i Expert imaju odvojene zapise; promjena sadržaja ne prenosi rezultat. Aktivna arkadna misija ostaje sačuvana, a dodatni slučajevi ne donose bodove kampanje niti uvjetuju sljedeću misiju. Nema mjerenja vremena. Nakon rješenja slijedi prijedlog male, sigurne primjene uz nastavnika; ona nije automatski provjerena samim rješenjem u igri.

## Veza mehanike i sigurnosnog problema

Postavljanje prava određuje tko smije čitati i mijenjati sadržaj. Odvojena kopija preživljava simulirani kvar, a obnova vraća datoteke koje igrač otvara i uspoređuje. Mrežni prekidači pokazuju učinak pravila na potreban i neovlašten pristup. Plan mjera pokazuje potrošene jedinice i preostali rizik; plan incidenta prikazuje posljedice redoslijeda prije potvrde. Ti su prikazi pomoć u učenju, pa oznaka „samostalno” znači bez pogrešne predaje, a ne rad bez takve pomoći. Izvještaji i dnevnici traže zaključivanje iz opisanog ponašanja, a završne provjere traže prethodno provedene mjere. Dodatni slučajevi odvajaju izbor postupka od obrazloženja, a Expert traži i zaključak o granici provedenog postupka.

Kretanje, bitovi, crvene prepreke i štit ostaju arkadni dio. Ne predstavljaju djelovanje antivirusnog programa i nisu dokaz znanja. Konzole su didaktički modeli; igra ne izvodi stvarno šifriranje, mrežne napade ili promjene školskih računa. Za razvoj prema dubljoj simulaciji treba testiranjem utvrditi gdje učenici razumiju posljedicu, a gdje samo pamte položaj točne tipke.

## Vrednovanje i povratna informacija

- Četiri dovršene zadaće: najviše 100 bodova učenja po misiji; bonus bitovi odvojeni su od toga. HUD i zbroj kampanje prikazuju isključivo učenje. Vrijeme, sudari i tempo ne mijenjaju taj rezultat.
- Nepotpun obrazac traži dopunu bez bilježenja pogreške. Provjere preduvjeta usmjeravaju na potrebne korake; nesiguran pokušaj predaje nezaštićene datoteke bilježi se kao odluka za ispravak.
- Pogrešan potpuni odgovor daje objašnjenje i dopušta ispravak. U rezultatu se zadaća označava kao riješena uz ispravak.
- Ponovljena radnja ne daje dodatne bodove. Ponovljena misija čuva najbolje rezultate.
- Završna provjera prikazuje konkretne rezultate mjera, a pitanje za primjenu služi razgovoru ili kratkom pisanom obrazloženju u razredu.
- Dodatna primjena odvojeno bilježi točnost prve potpune predaje i ispravke, uz dostupnu pouku. Taj rezultat ne povećava bodove kampanje.
- Lokalni rezultat nije dokaz identiteta ni formalna ocjena. Za vrednovanje tražite i objašnjenje odabira.

## Prije nastavne uporabe

Predviđeno, ali još nije provedeno: isprobati s učenicima različitog predznanja i brzine čitanja. Promatrati razumijevanje odluke, čitljivost na vlastitom mobitelu, opterećenje tekstom, samostalno ispravljanje i prijenos na laboratorijsku vježbu. Brže kretanje ne treba tumačiti kao bolje sigurnosno znanje. Za usporedbu zadržati istu razinu sadržaja i tražiti kratko usmeno ili pisano obrazloženje. Tehnički i pedagoški rezultati pilotiranja trebaju voditi daljnje prilagodbe.

## Stručna provjera novih scenarija

Dopunjeno 27. listopada 2026. Izvori podupiru načela; dijalozi, uređaji, izvještaji i nastavni zadatci izvorno su napisani za igru.

- [NIST SP 800-83 Rev. 1 — Malware Incident Prevention and Handling](https://csrc.nist.gov/pubs/sp/800/83/r1/final): vrste zlonamjernih programa, ograničavanje incidenta i pouzdan oporavak.
- [NIST SP 800-63B-4 — Authentication and Authenticator Management](https://pages.nist.gov/800-63-4/sp800-63b.html): različiti faktori autentifikacije, jedinstvene lozinke i upravitelji lozinki.
- [Microsoft — Revoke user access](https://learn.microsoft.com/en-us/entra/identity/users/users-revoke-access): sesije, opoziv i ograničenja opoziva.
- [Microsoft — User Account Control](https://learn.microsoft.com/en-us/windows/security/application-security/application-control/user-account-control/): standardni korisnički kontekst i ovlaštene promjene.

- [FTC — How To Recognize and Avoid Phishing Scams](https://consumer.ftc.gov/articles/how-recognize-avoid-phishing-scams): provjera poznatim neovisnim kontaktom i prijava sumnjive poruke.
- [OWASP — Transport Layer Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html): zaštita prijenosa i valjana provjera identiteta poslužitelja.

- [NIST SP 800-94 — Guide to Intrusion Detection and Prevention Systems](https://csrc.nist.gov/pubs/sp/800/94/final): osnovna razlika IDS/IPS, lažni alarmi, propuštene prijetnje i prilagodba pravila. Riječ je o završnom izdanju iz 2007.; nacrt revizije 1 nije postao završno izdanje. Koristi se za temeljne pojmove, ne kao pregled aktualnih proizvoda.
- [Apple — Recommended settings for Wi-Fi routers and access points](https://support.apple.com/en-us/102766): WPA3-Personal uz kompatibilne uređaje, izbjegavanje WEP-a, ograničenja skrivenog SSID-a i održavanje uređaja.
- [FTC — How To Secure Your Home Wi-Fi Network](https://consumer.ftc.gov/articles/how-secure-your-home-wi-fi-network): zasebna zaštita upravljanja i Wi-Fi pristupa te odvajanje gostujuće mreže. Kućni okvir izvora ovdje podupire osnovna načela malog didaktičkog scenarija.
- [NIST SP 800-30 Rev. 1 — Guide for Conducting Risk Assessments](https://nvlpubs.nist.gov/nistpubs/legacy/sp/nistspecialpublication800-30r1.pdf): kontekst procjene, prijetnje, slabosti, vjerojatnost i učinak. Ljestvica V × U, njezini pragovi i jedinice rada u igri vlastiti su didaktički model, ne preuzeta NIST ljestvica.
- [NIST SP 800-61 Rev. 3 — Incident Response Recommendations](https://csrc.nist.gov/pubs/sp/800/61/r3/final): usklađen odgovor, očuvanje dokaza, komunikacija, provjera izvora za obnovu, provjera obnovljenih sustava i poboljšanje postupaka. Tri koraka u igri odnose se na određeni školski slučaj; nisu tvrdnja da se sve aktivnosti u praksi provode strogo jedna nakon druge.
