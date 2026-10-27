# Metodička i didaktička analiza SISgamea

Analizirana osnova: **0.8.0**, commit `030de51`. Prilagodbe: **0.9.0**. Datum: 27. listopada 2026. Ovo je stručna analiza sadržaja i ponašanja koda, bez istraživanja s učenicima i bez tvrdnje o izmjerenoj učinkovitosti.

## Polazište i nalaz

Pregledano je svih 14 misija, 56 zadaća po razini, Junior prilagodbe, Expert analize, 14 dodatnih slučajeva, povratne informacije, bodovanje i upravljanje. Igra već ima smislen slijed **pouka → odluka → isprobavanje zaštite → novi slučaj**, odvojene nastavne razine i arkadni tempo, povratnu informaciju nakon pogreške i mogućnost ispravka bez gubitka bodova učenja. To je dobra osnova za vođeno vježbanje.

| Područje | Nalaz u 0.8.0 | Prilagodba u 0.9.0 |
| --- | --- | --- |
| Ishodi i orijentacija | Opis misije daje kontekst, ali nema zasebnog vidljivog ishoda ni pregleda četiriju zadaća. | Svaka misija dobiva ishod s opažljivom radnjom i plan stvarnih zadaća sa stanjem. Trenutačni cilj uključuje i pripremne predmete. |
| Uvođenje i primjeri | Pojmovi dolaze prije zadataka, ali tri odlomka pouke nisu uvijek dovoljna da pokažu kako se izvodi zaključak. | Kratak razrađen primjer odvaja situaciju, razlog i odluku. Uvod najprije pokazuje ishod i pouku; primjer i plan otvaraju se prema potrebi. |
| Kognitivno opterećenje | Istodobno kretanje, smetnje i čitanje mogu odvući pažnju; pauza tijekom čitanja već postoji. | U uvodu se nudi početak bez arkadnih smetnji uz sačuvanu razinu i odluke. Na širokom zaslonu plan je uz kartu, a pomoć ostaje dostupna tipkom H. |
| Aktivnost i povratna informacija | Učenik mijenja postavke i vidi posljedice, što je vrijednije od samog prepoznavanja pojma. Neki ponuđeni opisi izravno otkrivaju odgovor. | Kampanja je izričito vođena vježba. Završetak traži kratko obrazloženje prije otvaranja primjera odgovora i ističe primjenu u novom slučaju. Pomoć se ne skriva radi umjetnog otežavanja. |
| Vrednovanje | 100 bodova označuje četiri dovršene zadaće. Oznaka „samostalno” previše zaključuje jer su pouke i pregledi dostupni. | Dosljedna oznaka **bez ispravka**. Jasno se razlikuju dovršenost, prva potpuna predaja i dokaz samostalnog znanja. Pitanje za obrazlaganje ne dobiva automatsku ocjenu. |
| Diferencijacija | Junior pojednostavljuje sadržaj, Expert traži dodatne dokaze. Dobne granice nisu validirane. | Kraći ishodi za Junior; isti temeljni koncepti. Sadržaj se bira prema predznanju i čitanju, a tempo zasebno. Dob ostaje orijentacijska. |
| Računalo | WASD, strelice i E postoje, ali mobilne kontrole i upute dominiraju. Phaser globalno hvata tipke; obrasci i fokus nisu jasno odvojeni od karte. | Poseban raspored za tipkovnicu i miš, vidljive kratice, fokus karte, tipke G/H/E/Q/Esc, očuvane nativne tipke obrazaca, povrat fokusa i zaustavljanje pri izlasku iz karte. |
| Različiti uređaji | Veličina ekrana nije pouzdan pokazatelj dostupnog ulaza. | Automatski prikaz prema pokazivaču i ručni izbor **Automatski / Tipkovnica i miš / Dodir**. Tipkovnica i dodir ostaju dostupni neovisno o prikazu. |

## Povezanost ishoda, aktivnosti i dokaza

| Misija | Opažljivi ishod | Što učenik radi i što treba obrazložiti |
| --- | --- | --- |
| 1. Fizička zaštita | Odabrati i isprobati zaštitu ulaza, napajanja i ispisa. | Usporediti ovlast s pukim snimanjem; objasniti ograničeno trajanje UPS-a. |
| 2. Ovlasti i šifriranje | Dodijeliti najmanja potrebna prava i zaštititi povjerljivi prijenos. | Razlikovati čitanje i uređivanje te objasniti zašto ključ čuvamo odvojeno. |
| 3. Kopija i obnova | Izraditi odvojenu kopiju, obnoviti podatke i provjeriti sadržaj. | Objasniti zašto druga mapa na istom disku nije zaštita od kvara tog diska. |
| 4. Štetni program | Razvrstati ponašanje i odabrati ograničavanje i pouzdan oporavak. | Povezati zaključak s opisanim ponašanjem; razmotriti granicu čistog nalaza. |
| 5. Prijava | Protumačiti zapise i odabrati zaštitu računa i aktivnih sesija. | Razlikovati lozinku, sesiju, faktore prijave i ovlasti. |
| 6. Ojačavanje | Ograničiti ovlasti i usluge uz očuvanje potrebnog rada. | Provjeriti i zabranjenu radnju i dopuštenu školsku uporabu. |
| 7. Phishing | Procijeniti poruku, neovisno je provjeriti i sigurno prijaviti. | Objasniti zašto odgovor na istu poruku nije neovisna provjera. |
| 8. Mreža | Odabrati zaštićeni kanal, mrežna pravila i postupak pri upozorenju. | Razlikovati TLS od vatrozida i zaštitu prijenosa od poštenja sadržaja. |
| 9. Alarmi | Zaključiti iz više zapisa i odabrati ciljani odgovor. | Razlikovati odobreno održavanje, odbijen pokušaj i potvrđen incident. |
| 10. Wi-Fi | Provjeriti mrežu i zaštititi i odvojiti gostujući pristup. | Razlikovati naziv mreže, lozinku veze, administraciju i pravila odvajanja. |
| 11. Rizik | Procijeniti prioritet i rasporediti mjere unutar zadanih resursa. | Objasniti razliku smanjenja vjerojatnosti i smanjenja posljedice. |
| 12. Incident | Sastaviti činjeničnu prijavu i plan odobrenog oporavka. | Obrazložiti izbor čiste kopije i prijavu izgubljenog novijeg rada. |
| 13. Sažetci | Usporediti sažetke uz pouzdanu referencu i ograničiti zaključak. | Razlikovati naziv od sadržaja te cjelovitost od povjerljivosti i bezopasnosti. |
| 14. Potpisi | Razlikovati valjanost potpisa, povjerenje u ključ i povjerljivost. | Objasniti zašto valjan potpis uz nepotvrđen ključ ne potvrđuje školu. |

Završene zadaće pokazuju da je učenik prošao vođene postupke. Dodatni slučaj traži odluku i razlog na drugim činjenicama, ali i ondje ostaje pomoć. Za procjenu samostalnog ovladavanja nastavnik treba novu praktičnu zadaću i učenikovo obrazloženje. Pohranjeni najbolji rezultat nije potpuna povijest učenja.

## Metodička uporaba

Za prvi susret odabrati jednu misiju i tempo bez smetnji. Učenik pročita ishod i pouku, rastumači primjer, zatim primijeni postupak i provjeri posljedicu. Nakon pogreške prvo čita objašnjenje pa mijenja odluku. Na završetku usmeno ili kratko pisano odgovara na pitanje za obrazlaganje, uspoređuje ga s ponuđenim primjerom i prelazi na novi slučaj. Pri sljedećem susretu nastavnik može zadati drukčije činjenice i tražiti prisjećanje prije ponovnog čitanja pouke.

Za naprednijeg učenika primjer ostaje sklopljen, a Expert dodaje dokaze i ograničenja. Brže kretanje i veći arkadni bonus ne tumače se kao veće sigurnosno znanje. Slijed kampanje podupire postupnost, ali zaključane misije ograničavaju izravan nastavnikov izbor teme; izbornik slobodnog nastavnog redoslijeda nije dio ove prilagodbe.

## Osnova odluka i granice

- [IES / What Works Clearinghouse: Organizing Instruction and Study to Improve Student Learning](https://ies.ed.gov/ncee/wwc/PracticeGuide/1) podupire kombiniranje razrađenih primjera i rješavanja, ponovnu obradu sadržaja i pitanja koja traže objašnjenje. To je osnova dizajnerske odluke, **ne dokaz učinka ove igre**.
- [W3C: Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html) i [Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html) usmjeravaju ekvivalente pokazivačkih radnji, nativnu aktivaciju gumba i smislen povrat fokusa. Prilagodbe ne predstavljaju potvrdu potpune WCAG sukladnosti; karta i dalje ima vizualni sadržaj u platnu.
- Stručni izvori i ograničenja sigurnosnih modela ostaju u [CONTENT.md](CONTENT.md). Potpis je nastavni model, a izračunani SHA-256 primjeri su stvarne vrijednosti zadanih podataka. Nijedna misija ne daje ovlasti za promjene stvarne školske opreme.

Za pilotiranje treba promatrati može li učenik: bez pomoći pronaći trenutačni cilj na računalu i mobitelu; objasniti razlog odluke; nakon poruke sam ispraviti postupak; riješiti novi praktični slučaj. Zabilježiti gdje traži pomoć, što pogrešno zaključuje i koje su kontrole nejasne. Oznake dobi i duljinu teksta prilagoditi tek prema tim opažanjima.

Tehnička provjera i ograničenja najnovije inačice dokumentiraju se u [README.md](README.md). Automatski DOM testovi ne provjeravaju stvarni prikaz platna, raspored ni fizički uređaj.
