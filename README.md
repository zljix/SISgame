# SISgame — Čuvari sustava

Poučna 2D arkada za predmet **Sigurnost informacijskih sustava**, namijenjena učenicima srednje tehničke škole. Prva inačica **0.1.0** sadrži tri dovršive misije, hrvatske upute, dodirne kontrole i tipkovnicu.

## Što je u igri

1. **Zaključaj rizik** — kontrola ulaza, UPS, osjetljivi ispisi i provjera mjera.
2. **Samo za ovlaštene** — prava na javni raspored i povjerljivu mapu, šifriranje i provjera prijenosa.
3. **Povratak podataka** — odabir važnih datoteka, odvojena kopija, simulirani kvar, obnova i provjera sadržaja.

Svaku misiju otvara kratka pouka. Lik istražuje prostorije, izbjegava arkadne smetnje i rukuje opremom. Sigurnosne postavke imaju objašnjene posljedice. Četiri završene zadaće donose 100 bodova učenja; žuti bitovi donose zaseban bonus. Bilježi se je li odluka bila samostalna ili ispravljena. Ponavljanje čuva najbolji rezultat i ne umnaža iste bodove. Misije se otključavaju redom.

**Simulacijska ograničenja:** prikaz prijetnji, provjera kartica, električne zaštite, šifriranja i kopiranja je didaktički model. Crvene pokretne smetnje i štit su arkadne prepreke, ne model rada antivirusnog programa. Podatci su izmišljeni. Program ne pristupa stvarnim školskim sustavima i ne izvodi stvarne sigurnosne napade.

## Pokretanje i upravljanje

- **Mobitel:** virtualna palica lijevo, `Djeluj` i `Štit` desno. Podržan je istodobni dodir palice i tipke.
- **Računalo:** WASD ili strelice, E za radnju, Q ili razmak za štit, Esc za pauzu.
- **Pomoć pri kretanju:** dodir/klik tla ili trenutačnog cilja pokreće kretanje do odredišta uz obilazak zidova. Ručno kretanje prekida tu putanju.
- Igra se prilagođava uspravnom i vodoravnom zaslonu. Na mobitelu je vodoravni prikaz pregledniji.
- U pozadini se igra pauzira. Zvuk je početno isključen, a postavke nude smanjeno gibanje.
- Težine mijenjaju brzinu smetnji i označavanje cilja; nastavni ciljevi su isti.

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

Napredak se sprema u `localStorage` pod ključem `sisgame.save.v1`, bez imena i prijave. Spremanje se obavlja tijekom igranja, nakon odluka i pri napuštanju. Ako je pohrana blokirana, igra prikazuje upozorenje i nastavlja raditi.

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

- `src/core.ts` — nastavna pravila i prijelazi stanja.
- `src/game.ts` — Phaser, mapa, kretanje, prepreke i likovi.
- `src/data.ts` — misije, pouke, mjesta i putanje.
- `src/main.ts` — izbornici, kontrole, konfiguracija zaštite i PWA.
- `src/storage.ts` — lokalni napredak, validacija formata i najbolji rezultati.
- `tests/` — provjere ključnih pravila, oporavka podataka, putanja i spremanja.

## Provjera prije uporabe u razredu

Automatizirani testovi provjeravaju pravila misija, dostupnost svih mjesta na mapi, sprečavanje ponovnog zbrajanja istih bodova te spremanje. Pregled u računalnom pregledniku ne zamjenjuje probu na stvarnom iPhoneu i Androidu. Prije nastavne uporabe provjerite višestruki dodir, okretanje zaslona, zaključavanje/otključavanje, povratak nakon zatvaranja, zvuk, offline pokretanje i ažuriranje.

Za proširenje kampanje predviđeno je sedam nastavnih cjelina i 26 tema; u ovoj inačici implementirane su samo gore navedene tri misije.

## Izvori i ovisnosti

Nastavni okvir: korisnikov priručnik SIS v4 i GIK za 4. razred. Projekt uključuje izvorno izrađene vektorske/pikselne elemente i generirane tonske efekte. Nema vanjskih fotografija ili preuzetih likova.

Phaser 3.90.0 i EventEmitter3 uključeni su pod MIT licencama; vidi [`public/THIRD_PARTY_NOTICES.txt`](public/THIRD_PARTY_NOTICES.txt). Vite i TypeScript koriste se samo tijekom razvoja i izgradnje.
