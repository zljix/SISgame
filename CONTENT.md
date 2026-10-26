# SISgame — sadržaj kampanje 0.2.0

Igra ima šest misija i 24 sigurnosne zadaće. Misija traje koliko učeniku treba za istraživanje i odluke; nema vremenske kazne za čitanje. Nakon pouke učenik postavlja mjere, ispravlja pogreške i provjerava rezultat. Izlaz se otvara tek nakon četiri dovršene zadaće.

## Veza s nastavnim okvirom

Sadržaj nastavlja SIS priručnik i okvir od sedam cjelina / 26 tema. Jedna misija može objediniti više tema; šest misija **ne predstavlja svih 26 lekcija**.

| Misija | Područje | Što učenik treba pokazati |
| --- | --- | --- |
| 1. Zaključaj rizik | Fizički sloj | Provjeriti ovlast ulaska, odabrati UPS za kritičnu opremu i sigurno zbrinuti ispis. |
| 2. Samo za ovlaštene | Podatkovni sloj | Primijeniti zadanu politiku pristupa i zaštititi povjerljivi prijenos. |
| 3. Povratak podataka | Podatkovni sloj | Odvojiti kopiju od radnog diska, obnoviti sve datoteke i provjeriti sadržaj. |
| 4. Sumnjivi program | Aplikacijski sloj, teme 11–13 | Razlikovati virus, crv i trojanski konj iz ponašanja; ograničiti incident i izabrati pouzdan oporavak kod rootkita. |
| 5. Tko se prijavio? | Računalni sloj, teme 14–15 | Izdvojiti sumnjivu uspješnu prijavu, opozvati sesije, odabrati jedinstvenu lozinku i dva različita faktora. |
| 6. Ojačaj sustav | Računalni sloj, tema 16 | Primijeniti provjerene nadogradnje, koristiti standardni račun i ostaviti samo potrebne usluge. |

Za daljnje proširenje ostaju uvodni scenariji o imovini, prijetnji, ranjivosti i riziku te mrežne i operativne teme: promet, filtriranje, IDS/IPS, sigurni protokoli, TLS/certifikati, Wi-Fi, mrežni servisi, politike i socijalni inženjering. One u ovoj inačici nisu zasebne igrive misije.

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

## Vrednovanje i povratna informacija

- Četiri dovršene zadaće: najviše 100 bodova učenja po misiji; bonus bitovi odvojeni su od toga.
- Nepotpun obrazac i pokušaj prije preduvjeta ne bilježe se kao pogrešna odluka.
- Pogrešan potpuni odgovor daje objašnjenje i dopušta ispravak. U rezultatu se zadaća označava kao riješena uz ispravak.
- Ponovljena radnja ne daje dodatne bodove. Ponovljena misija čuva najbolje rezultate.
- Završna provjera prikazuje konkretne rezultate mjera, a pitanje za primjenu služi razgovoru ili kratkom pisanom obrazloženju u razredu.
- Lokalni rezultat nije dokaz identiteta ni formalna ocjena. Za vrednovanje tražite i objašnjenje odabira.

## Stručna provjera novih scenarija

Provjereno 27. listopada 2026. Izvori podupiru načela; dijalozi, uređaji, izvještaji i nastavni zadatci izvorno su napisani za igru.

- [NIST SP 800-83 Rev. 1 — Malware Incident Prevention and Handling](https://csrc.nist.gov/pubs/sp/800/83/r1/final): vrste zlonamjernih programa, ograničavanje incidenta i pouzdan oporavak.
- [NIST SP 800-63B-4 — Authentication and Authenticator Management](https://pages.nist.gov/800-63-4/sp800-63b.html): različiti faktori autentifikacije, jedinstvene lozinke i upravitelji lozinki.
- [Microsoft — Revoke user access](https://learn.microsoft.com/en-us/entra/identity/users/users-revoke-access): sesije, opoziv i ograničenja opoziva.
- [Microsoft — User Account Control](https://learn.microsoft.com/en-us/windows/security/application-security/application-control/user-account-control/): standardni korisnički kontekst i ovlaštene promjene.
