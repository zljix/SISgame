import type { ContentTier } from './curriculum.ts';

// All evidence is fictional. These controls never inspect or change a real network.
export type AlertVerdict = '' | 'expected' | 'investigate' | 'incident';
export const ALERT_VERDICTS: [Exclude<AlertVerdict, ''>, string][] = [
  ['expected', 'Potvrđen odobreni rad'],
  ['investigate', 'Potrebna daljnja provjera'],
  ['incident', 'Potvrđen neovlašten pristup'],
];
export const ALERT_REPORTS = [
  { id: 'maintenance', label: 'A · 09:00 · Upozorenje senzora',
    evidence: 'Senzor prijavljuje mnogo provjera portova s uređaja ADMIN-02. Radni nalog i administrator potvrđuju odobreno ispitivanje u 09:00, s tog uređaja i prema tim poslužiteljima.',
    simple: 'Alarm se oglasio tijekom školske provjere. Nastavnik i radni nalog potvrđuju da je taj rad dopušten.',
    answer: 'expected', feedback: 'Izvor, vrijeme i opseg odgovaraju potvrđenom radnom nalogu. Ovo upozorenje nije potvrda napada. Sačuvaj zapis i zabilježi provjereni razlog.' },
  { id: 'compromised', label: 'B · 09:12 · Promjena na LAB-09',
    evidence: 'U dnevniku je uspješna prijava na LAB-09. Vlasnik je ne prepoznaje. Administrator je potvrdio da je ta sesija bez odobrenja promijenila zaštićenu datoteku.',
    simple: 'Netko je ušao u LAB-09 i promijenio zaštićenu datoteku. Administrator je provjerio da ta osoba nije imala dopuštenje.',
    answer: 'incident', feedback: 'Ovdje postoje dodatni dokazi: otvorena sesija i potvrđena neovlaštena promjena. To je incident koji zahtijeva postupanje, a ne samo očekivani rad.' },
  { id: 'probe', label: 'C · 09:18 · Odbijeni pokušaji',
    evidence: 'Vatrozid je odbio više veza iz nepoznatog izvora. U tim zapisima nema uspješne prijave ni promjene. Drugi zapisi još nisu pregledani.',
    simple: '', answer: 'investigate', feedback: 'Odbijeni pokušaji zaslužuju provjeru drugih zapisa. Ne dokazuju uspješan upad, ali ni da problema sigurno nema.' },
] as const;
export function alertsFor(tier: ContentTier) { return tier === 'junior' ? ALERT_REPORTS.slice(0, 2) : ALERT_REPORTS; }
export function verdictsFor(tier: ContentTier) { return ALERT_VERDICTS.filter(([id]) => tier !== 'junior' || id !== 'investigate'); }

export type WifiSettings = { security: '' | 'wpa3' | 'wep' | 'open'; guests: '' | 'isolated' | 'internal' | 'blocked' };
export const WIFI_SECURITY: [WifiSettings['security'], string][] = [
  ['wpa3', 'WPA3-Personal'], ['wep', 'WEP (zastarjelo)'], ['open', 'Otvorena mreža'],
];
export const WIFI_GUESTS: [WifiSettings['guests'], string][] = [
  ['isolated', 'Samo internet'],
  ['internal', 'Internet i interna mreža'],
  ['blocked', 'Bez pristupa mreži'],
];
export function wifiPreview(settings: WifiSettings) {
  return {
    protectedRadio: settings.security === 'wpa3',
    guestInternet: settings.guests === 'isolated' || settings.guests === 'internal',
    guestInternal: settings.guests === 'internal',
  };
}
