# SISgame — Čuvari sustava

Poučna 2D arkada za predmet **Sigurnost informacijskih sustava**, prvenstveno za uzrast **13–18 godina**, uz jednostavniji sadržaj za mlađe igrače. Inačica **0.4.0** sadrži deset dovršivih misija, hrvatske upute, dodirne kontrole i tipkovnicu.

## Jedna igra, tri razine sadržaja

| Nastavni sadržaj | Orijentacijska dob | Prilagodba zadataka |
| --- | --- | --- |
| Junior | 11–13 | Kraće pouke, slikovni koraci, dva izvještaja i jednostavniji izbori; dio postavki je pripremljen. |
| Standard | 14–16 | Puni scenariji, objašnjenja pojmova i postupno povezivanje zaštitnih mjera. |
| Expert | 16+ | Dodatna analiza dokaza i ograničenja u svakoj misiji; završna provjera traži obrazložen plan od tri odluke. |

**Nastavni sadržaj i tempo igranja biraju se odvojeno.** Svaki sadržaj može se igrati bez smetnji ili uz lagan, srednji odnosno brz arkadni tempo. Tempo se može promijeniti i za započetu misiju preko postavki na karti, uz sačuvane sigurnosne odluke. Expert nema obvezno odbrojavanje: opcionalni izazov od 90 sekundi počinje tek pritiskom na tipku nakon čitanja slučaja. Može se isključiti tijekom zadatka. Zatvaranje prozora i odlazak u pozadinu pauziraju mjerenje; istek dopušta nastavak bez kazne.

Dobne oznake su razvojna i pedagoška preporuka, **nisu formalna PEGI klasifikacija**. Igra ne traži datum rođenja. Odabir treba prilagoditi predznanju, čitanju i potrebama učenika; primjerenost treba potvrditi testiranjem u razredu.

![Odvojeni izbor nastavnog sadržaja i tempa](media/content-settings-v0.3.0.jpg)

## Što je u igri

1. **Zaključaj rizik** — kontrola ulaza, UPS, osjetljivi ispisi i provjera mjera.
2. **Samo za ovlaštene** — prava na javni raspored i povjerljivu mapu, šifriranje i provjera prijenosa.
3. **Povratak podataka** — odabir važnih datoteka, odvojena kopija, simulirani kvar, obnova i provjera sadržaja.

4. **Sumnjivi program** — izolacija incidenta, virus/crv/trojanski konj, rootkit i pouzdan oporavak.
5. **Tko se prijavio?** — analiza dnevnika, opoziv sesija, jedinstvena lozinka, MFA i provjera prijave.
6. **Ojačaj sustav** — službene nadogradnje, standardni račun/UAC, potrebne usluge i provjera dostupnosti.
7. **Ne nasjedaj poruci** — pregled izmišljene lažne poruke, neovisna provjera, prijava i siguran nastavak rada.
8. **Mreža pod nadzorom** — HTTPS, pravila dopuštenih veza, upozorenje o certifikatu i provjera zaštite.
9. **Trag iza alarma** — IDS/IPS, razvrstavanje upozorenja prema dokazima, ciljani odgovor i provjera dopuštenog rada.
10. **Wi-Fi za prave goste** — provjera mreže, WPA3-Personal, odvajanje gostiju, održavanje i provjera pristupa.

U inačici 0.4.0 kampanja ima **40 sigurnosnih zadaća po razini sadržaja**. Konzola upozorenja razlikuje odobreni rad, potrebnu daljnju provjeru i potvrđen incident. Wi-Fi konzola odmah prikazuje učinak odabranih postavki na bežičnu zaštitu, internet za goste i pristup internoj školskoj mreži. Oba nova obrasca spremaju nedovršene odabire. Junior ima kraće zapise i dio postavki pripremljen; Expert dodatni slučaj s tri povezane odluke.

![Wi-Fi konzola s prikazom posljedica odabranih pravila](media/wifi-console-v0.4.0.jpg)

Nove misije imaju različite prolaze, boje prostorija i opremu. Uz odluke na terminalima dodani su razvrstavanje izvještaja, pregled dnevnika i upravljačka ploča usluga. Završne provjere prikazuju učinak mjera; rezultati nude i pitanje za primjenu gradiva.

[Nastavni sadržaj, rješenja i stručni izvori](CONTENT.md) opisani su zasebno. Svaka razina sadržaja ima svoj napredak i započetu misiju. Postojeći napredak iz 0.1.x i 0.2.x automatski se prenosi u Standard; dovršena osma misija otključava devetu bez brisanja postojećih rezultata.

![Razvrstavanje izvještaja u novoj laboratorijskoj misiji](media/campaign-samples-v0.2.0.jpg)

Svaku misiju otvara kratka pouka. Lik istražuje prostorije, izbjegava arkadne smetnje i rukuje opremom. Sigurnosne postavke imaju objašnjene posljedice. Četiri završene zadaće donose 100 bodova učenja; žuti bitovi donose zaseban bonus. Bilježi se je li odluka bila samostalna ili ispravljena. Ponavljanje čuva najbolji rezultat i ne umnaža iste bodove. Misije se otključavaju redom.

**Simulacijska ograničenja:** prikaz prijetnji, provjera kartica, električne zaštite, šifriranja i kopiranja je didaktički model. Crvene pokretne smetnje i štit su arkadne prepreke, ne model rada antivirusnog programa. Podatci su izmišljeni. Program ne pristupa stvarnim školskim sustavima i ne izvodi stvarne sigurnosne napade.

## Mobilni vodoravni prikaz (0.1.2)

U postavkama pristupa Učenik, Nastavnik i Gost prikazani su u tri stupca, tako da se sve tri ovlasti vide odjednom. Naslov, zatvaranje i glavne tipke ostaju vidljivi; dugi sadržaj ostalih prozora može se pomicati.

Obavijest se sada prikazuje unutar postojeće statusne trake i ne mijenja visinu igrališta. Dodir sažetka otvara cijelo objašnjenje i pauzira igru. Poruka ostaje 12 sekundi, može se zatvoriti, a posljednje objašnjenje dostupno je i iz pauze preko tipke **Posljednja poruka**.

Visina igre prati vidljivo područje preglednika pri promjeni orijentacije i prikazu traka preglednika, uz očuvano korisnikovo zumiranje. Kontrole poštuju sigurne rubove zaslona.

![Sve tri ovlasti vidljive u vodoravnom prikazu](media/landscape-permissions-v0.1.2.jpg)

![Obavijest u statusnoj traci bez smanjivanja igrališta](media/landscape-notice-v0.1.2.jpg)

## Pokretanje i upravljanje

- **Mobitel:** virtualna palica lijevo, `Djeluj` i `Štit` desno. Podržan je istodobni dodir palice i tipke.
- **Računalo:** WASD ili strelice, E za radnju, Q ili razmak za štit, Esc za pauzu.
- **Pomoć pri kretanju:** dodir/klik tla ili trenutačnog cilja pokreće kretanje do odredišta uz obilazak zidova. Ručno kretanje prekida tu putanju.
- Igra se prilagođava uspravnom i vodoravnom zaslonu. Na mobitelu je vodoravni prikaz pregledniji.
- U pozadini se igra pauzira. Zvuk je početno isključen, a postavke nude smanjeno gibanje.
- Tempo mijenja samo arkadne smetnje i oznaku cilja na tlu. U načinu **Bez smetnji** nema sudara ni potrebe za štitom. Dodir cilja i dalje vodi do sljedeće stanice.

## Objava na GitHub Pagesu — ručno, kada vlasnik odluči

**Repozitorij ne uključuje automatsku objavu niti sam uključuje Pages.** Spremna statička inačica nalazi se u mapi [`docs/`](docs/).

Kada želite objaviti:

1. U repozitoriju otvorite **Settings → Pages**.
2. Kao izvor odaberite **Deploy from a branch**.
3. Odaberite granu **main** i mapu **/docs**, zatim spremite.
4. Koristite adresu koju nakon dovršene objave prikaže GitHub.

Sve putanje su relativne, a manifest i service worker ograničeni na mapu igre. Igra nema ovisnosti o vanjskom CDN-u, fontovima ili API-ju tijekom igranja. `docs/` već sadrži izgrađeni Phaser i ostale datoteke, pa za samu objavu nije potrebna instalacija Nodea.

## PWA i offline

Nakon prvog uspješnog učitavanja preko HTTPS-a, service worker sprema **sve datoteke konkretne inačice**. Gumb za instalaciju pozeleni tek nakon provjere da su datoteke u predmemoriji. Android omogućuje instalaciju kroz Chrome; na iPhoneu koristite Safari → Dijeli → Dodaj na početni zaslon. Samo dodavanje ikone ne jamči da su datoteke preuzete. Za novu inačicu treba mreža; ponuđeno ažuriranje primjenjuje se na korisnikov zahtjev.

Preglednik može obrisati lokalnu pohranu ili predmemoriju, primjerice nakon korisnikova brisanja podataka. Tada je za ponovno preuzimanje potreban internet. Offline rad nije dostupan otvaranjem `index.html` kao obične `file://` datoteke.

## Napredak i vrednovanje

Napredak se sprema u `localStorage` pod zadržanim ključem `sisgame.save.v1`, bez imena i prijave. Format je sada `schema: 2`, s odvojenim profilima za Junior, Standard i Expert; stari `schema: 1` migrira se u Standard. Spremanje se obavlja tijekom igranja, nakon odluka i pri napuštanju. Ako je pohrana blokirana, igra prikazuje upozorenje i nastavlja raditi.

Statusna traka i kampanja prikazuju samo bodove učenja. Arkadni bonus prikazuje se zasebno u pauzi i rezultatu. Brzina, sudari, energija i istek opcionalnog vremena ne mijenjaju bodove učenja ni oznaku samostalne odluke. Rezultati različitih razina sadržaja nisu usporedive standardizirane ocjene.

Lokalni rezultati su evidencija vježbanja, **nisu kriptografski dokaz znanja ili identiteta**. Korisnik može izmijeniti podatke u svojem pregledniku. Za pouzdano formalno vrednovanje potrebni su prijava, poslužiteljska obrada provjerljivih događaja i odgovarajuća provjera samostalnosti; samo potpisivanje broja bodova koji je poslao klijent nije dovoljno.

## Razvoj

Potreban je Node.js 22.12+ ili noviji podržani LTS.

```sh
npm ci
npm run dev
npm test
npm run build
```

`npm run build` provjerava TypeScript, izrađuje `docs/` i generira potpun popis datoteka za offline predmemoriju. Izvorni kôd je u `src/`; `docs/` treba ponovno izgraditi nakon svake izmjene. Nakon izmjene potrebno je commitati i izvorne i izgrađene datoteke. Ovisnosti su zaključane u `package-lock.json`.

- `src/curriculum.ts` — razine sadržaja, Junior prilagodbe, pojmovi i Expert slučajevi.
- `src/network.ts` — sigurnosni zapisi, Wi-Fi postavke i izračun prikazanih posljedica.
- `src/missions.ts` — sadržaj novih odluka, izvještaji, zapisi i pravila usluga.
- `src/core.ts` — nastavna pravila i prijelazi stanja.
- `src/game.ts` — Phaser, mapa, kretanje, prepreke i likovi.
- `src/data.ts` — misije, pouke, mjesta i putanje.
- `src/main.ts` — izbornici, kontrole, konfiguracija zaštite i PWA.
- `src/storage.ts` — lokalni napredak, validacija formata i najbolji rezultati.
- `tests/` — provjere ključnih pravila, oporavka podataka, putanja i spremanja.

## Provjera prije uporabe u razredu

41 automatizirani test provjerava pravila svih deset misija u sve tri razine sadržaja, dostupnost mjesta na svakoj mapi, preduvjete, pogrešne odluke, sprečavanje ponovnog zbrajanja bodova, migraciju starog napretka, neovisne profile, opcionalni sat, odvojeno bodovanje i offline paket. Pregled u računalnom pregledniku ne zamjenjuje probu na stvarnom iPhoneu i Androidu. Prije nastavne uporabe provjerite višestruki dodir, okretanje zaslona, zaključavanje/otključavanje, povratak nakon zatvaranja, zvuk, offline pokretanje i ažuriranje.

Postavke, Junior obrasci, Expert analiza i mrežna konzola provjereni su u Chromeu na 956 × 440, 956 × 378 uz simulirane sigurne rubove, 568 × 320 i 390 × 844. Dulji sadržaj pomiče se unutar prozora; zatvaranje i glavna tipka ostaju dostupni. Provjereni su ispravak Expert odgovora, nastavak nakon isteka vremena i povratak u započetu misiju nakon promjene sadržaja.

Nove konzole iz 0.4.0 dodatno su provjerene u Chromeu unutar prikaza 956 × 440, 568 × 320 i 390 × 844, s odvojenim izmišljenim testnim napretkom. Provjereni su ispravak odgovora, ponovno učitavanje nedovršenih odabira, Junior pojednostavljenja i Expert završni slučajevi. Na 568 × 320 zapisi se nižu jedan ispod drugoga, a glavna tipka i zatvaranje ostaju dostupni. To je provjera rasporeda u računalnom pregledniku, ne test višestrukog dodira na fizičkom telefonu.

Nastavni okvir obuhvaća sedam cjelina i 26 tema. Ova inačica ima deset misija koje objedinjuju dio tema; ne pokriva svih 26 nastavnih tema. Procjena imovine i rizika te širi operativni scenariji ostaju za nastavak razvoja. Detaljna veza s gradivom nalazi se u [CONTENT.md](CONTENT.md).

## Izvori i ovisnosti

Nastavni okvir: korisnikov priručnik SIS v4 i GIK za 4. razred. Projekt uključuje izvorno izrađene vektorske/pikselne elemente i generirane tonske efekte. Nema vanjskih fotografija ili preuzetih likova.

Phaser 3.90.0 i EventEmitter3 uključeni su pod MIT licencama; vidi [`public/THIRD_PARTY_NOTICES.txt`](public/THIRD_PARTY_NOTICES.txt). Vite i TypeScript koriste se samo tijekom razvoja i izgradnje.
