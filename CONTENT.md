# SISgame — sadržaj kampanje 0.3.0

Igra ima osam misija i 32 sigurnosne zadaće po razini sadržaja. Misija traje koliko učeniku treba za istraživanje i odluke; nema vremenske kazne za čitanje. Nakon pouke učenik postavlja mjere, ispravlja pogreške i provjerava rezultat. Izlaz se otvara tek nakon četiri dovršene zadaće.

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
| Završetak | Provjera mjera | Provjera mjera i pitanje za primjenu | Obvezna analiza triju odluka prije završne provjere |

Tempo (bez smetnji / lagan / srednji / brz) ne bira nastavni sadržaj. Expert može biti bez smetnji i bez sata. Junior može imati brz arkadni tempo. Brzina i refleksi ne određuju bodove učenja.

Opcionalni Expert izazov ima 90 sekundi **aktivnog rješavanja dodatnog slučaja**, ne cijele misije. Početno je isključen. Dok učenik čita prije pritiska na Pokreni, sat ne teče. Zatvaranje analize ili odlazak iz aktivnog prozora zaustavlja mjerenje. Započeti odgovori i preostalo vrijeme spremaju se za nastavak. Isključivanje i istek dopuštaju nastavak bez gubitka bodova ili označavanja odgovora kao pogrešnog. Vrijeme služi vježbanju odluka pod pritiskom, ne procjeni znanja.

## Veza s nastavnim okvirom

Sadržaj nastavlja SIS priručnik i okvir od sedam cjelina / 26 tema. Jedna misija može objediniti više tema; osam misija **ne predstavlja svih 26 lekcija**.

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

Za daljnje proširenje ostaju samostalni scenariji procjene imovine i rizika, IDS/IPS, Wi-Fi i širi operativni postupci. Mrežne veze, TLS i phishing sada imaju zasebne misije. Opisi misija 4–6 u nastavku odgovaraju Standardu; Junior pojednostavljenja i Expert dodatci navedeni su zasebno.

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

Dodatni slučajevi su provjera primjene na novim činjenicama. Tri ispravne odluke otključavaju zadnju sigurnosnu zadaću; same ne daju dodatne bodove. Netočan potpun plan bilježi ispravak završne zadaće, nepotpun obrazac traži dopunu bez kazne.

## Veza mehanike i sigurnosnog problema

Postavljanje prava određuje tko smije čitati i mijenjati sadržaj. Odvojena kopija preživljava simulirani kvar, a obnova vraća datoteke koje igrač otvara i uspoređuje. Mrežni prekidači pokazuju učinak pravila na potreban i neovlašten pristup. Izvještaji i dnevnici traže zaključivanje iz opisanog ponašanja, a završne provjere traže prethodno provedene mjere.

Kretanje, bitovi, crvene prepreke i štit ostaju arkadni dio. Ne predstavljaju djelovanje antivirusnog programa i nisu dokaz znanja. Konzole su didaktički modeli; igra ne izvodi stvarno šifriranje, mrežne napade ili promjene školskih računa. Za razvoj prema dubljoj simulaciji treba testiranjem utvrditi gdje učenici razumiju posljedicu, a gdje samo pamte položaj točne tipke.

## Vrednovanje i povratna informacija

- Četiri dovršene zadaće: najviše 100 bodova učenja po misiji; bonus bitovi odvojeni su od toga. HUD i zbroj kampanje prikazuju isključivo učenje. Vrijeme, sudari i tempo ne mijenjaju taj rezultat.
- Nepotpun obrazac traži dopunu bez bilježenja pogreške. Provjere preduvjeta usmjeravaju na potrebne korake; nesiguran pokušaj predaje nezaštićene datoteke bilježi se kao odluka za ispravak.
- Pogrešan potpuni odgovor daje objašnjenje i dopušta ispravak. U rezultatu se zadaća označava kao riješena uz ispravak.
- Ponovljena radnja ne daje dodatne bodove. Ponovljena misija čuva najbolje rezultate.
- Završna provjera prikazuje konkretne rezultate mjera, a pitanje za primjenu služi razgovoru ili kratkom pisanom obrazloženju u razredu.
- Lokalni rezultat nije dokaz identiteta ni formalna ocjena. Za vrednovanje tražite i objašnjenje odabira.

## Prije nastavne uporabe

Predviđeno, ali još nije provedeno: isprobati s učenicima različitog predznanja i brzine čitanja. Promatrati razumijevanje odluke, čitljivost na vlastitom mobitelu, opterećenje tekstom, samostalno ispravljanje i prijenos na laboratorijsku vježbu. Brže kretanje ne treba tumačiti kao bolje sigurnosno znanje. Za usporedbu zadržati istu razinu sadržaja i tražiti kratko usmeno ili pisano obrazloženje. Tehnički i pedagoški rezultati pilotiranja trebaju voditi daljnje prilagodbe.

## Stručna provjera novih scenarija

Dopunjeno 26. listopada 2026. Izvori podupiru načela; dijalozi, uređaji, izvještaji i nastavni zadatci izvorno su napisani za igru.

- [NIST SP 800-83 Rev. 1 — Malware Incident Prevention and Handling](https://csrc.nist.gov/pubs/sp/800/83/r1/final): vrste zlonamjernih programa, ograničavanje incidenta i pouzdan oporavak.
- [NIST SP 800-63B-4 — Authentication and Authenticator Management](https://pages.nist.gov/800-63-4/sp800-63b.html): različiti faktori autentifikacije, jedinstvene lozinke i upravitelji lozinki.
- [Microsoft — Revoke user access](https://learn.microsoft.com/en-us/entra/identity/users/users-revoke-access): sesije, opoziv i ograničenja opoziva.
- [Microsoft — User Account Control](https://learn.microsoft.com/en-us/windows/security/application-security/application-control/user-account-control/): standardni korisnički kontekst i ovlaštene promjene.

- [FTC — How To Recognize and Avoid Phishing Scams](https://consumer.ftc.gov/articles/how-recognize-avoid-phishing-scams): provjera poznatim neovisnim kontaktom i prijava sumnjive poruke.
- [OWASP — Transport Layer Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html): zaštita prijenosa i valjana provjera identiteta poslužitelja.
