import type { ContentTier } from './curriculum.ts';

// Fictional classroom model: the ratings are supplied estimates, not measured probabilities.
export type RiskPriority = '' | 'low' | 'medium' | 'high';
export const PRIORITIES: [Exclude<RiskPriority, ''>, string][] = [
  ['low', 'Nizak'], ['medium', 'Srednji'], ['high', 'Visok'],
];
export const RISK_CASES = [
  { id: 'archive', label: 'Arhiva učeničkih radova', likelihood: 3, impact: 3,
    evidence: 'Disk više puta javlja greške. Radovi cijele škole nemaju odvojenu kopiju. Kvar bi mogao trajno izgubiti jedine primjerke.',
    simple: 'Disk često javlja greške. Na njemu su jedini primjerci školskih radova. Njihov gubitak bio bi velik problem.',
    feedback: 'Ponavljane greške i jedini primjerci važnih radova znače visok prioritet. Cijena računala nije jedino mjerilo vrijednosti.' },
  { id: 'account', label: 'Račun za promjenu rasporeda', likelihood: 2, impact: 2,
    evidence: 'Poznatu zajedničku lozinku koristi više osoba. Zabilježena je neodobrena promjena rasporeda jedne učionice. Izvorni raspored je sačuvan, ali nastava je ometena.',
    simple: '', feedback: 'Procjena tima za sljedeći mjesec ovdje je 2 × 2 = 4, odnosno srednji prioritet. I taj rizik zahtijeva mjeru; arhiva s ocjenom 9 ima prednost.' },
  { id: 'poster', label: 'Izgled javnog plakata', likelihood: 1, impact: 1,
    evidence: 'Rijetka greška promijeni boju ukrasa na javnom plakatu. Tekst ostaje točan i čitljiv; rad nastave i privatni podatci nisu ugroženi.',
    simple: 'Rijetko se promijeni boja ukrasa. Tekst se i dalje može čitati, nastava radi i nema privatnih podataka.',
    feedback: 'Rijetka kozmetička greška ima malen učinak u ovom slučaju. Nije prioritet ispred mogućeg gubitka radova i neovlaštenih promjena.' },
] as const;
export function risksFor(tier: ContentTier) { return RISK_CASES.filter(risk => tier !== 'junior' || risk.id !== 'account'); }
export function prioritiesFor(tier: ContentTier) { return PRIORITIES.filter(([id]) => tier !== 'junior' || id !== 'medium'); }
export function priorityFor(likelihood: number, impact: number): Exclude<RiskPriority, ''> {
  const rating = likelihood * impact;
  return rating >= 6 ? 'high' : rating >= 3 ? 'medium' : 'low';
}
export const MEASURES = [
  { id: 'backup', label: 'Odvojena kopija i proba obnove', cost: 3, detail: 'Sačuvaj radove na drugom uređaju, sigurno ga odspoji i provjeri vraćanje sadržaja.', simple: 'Napravi kopiju na drugom uređaju i provjeri možeš li vratiti radove.' },
  { id: 'accounts', label: 'Osobni računi i potrebne ovlasti', cost: 2, detail: 'Ukini zajedničku lozinku za promjene rasporeda; pravo promjene daj samo ovlaštenim osobama.', simple: '' },
  { id: 'ups', label: 'Dodatni UPS', cost: 2, detail: 'Pomaže pri nestanku struje. Ne uklanja greške diska ni zajedničku lozinku.', simple: '' },
  { id: 'design', label: 'Novi ukras javnog plakata', cost: 1, detail: 'Uredi izgled plakata; time ne štitiš arhivu ni račun.', simple: 'Promijeni izgled plakata. Školski radovi time ne dobivaju kopiju.' },
] as const;
export function measuresFor(tier: ContentTier) { return MEASURES.filter(measure => tier !== 'junior' || ['backup', 'design'].includes(measure.id)); }
export const budgetFor = (tier: ContentTier) => tier === 'junior' ? 3 : 5;
export function cleanMeasures(value: unknown, tier: ContentTier): string[] {
  return measuresFor(tier).filter(measure => Array.isArray(value) && value.includes(measure.id)).map(measure => measure.id);
}
export function riskPreview(tier: ContentTier, selected: readonly string[]) {
  const measures = cleanMeasures(selected, tier);
  return {
    cost: measuresFor(tier).filter(measure => measures.includes(measure.id)).reduce((total, measure) => total + measure.cost, 0),
    rows: risksFor(tier).map(risk => {
      const likelihood = risk.id === 'account' && measures.includes('accounts') ? 1 : risk.likelihood;
      const impact = risk.id === 'archive' && measures.includes('backup') ? 1 : risk.impact;
      return { id: risk.id, label: risk.label, before: priorityFor(risk.likelihood, risk.impact), after: priorityFor(likelihood, impact),
        detail: risk.id === 'archive' ? (measures.includes('backup') ? 'Kvar je i dalje moguć; provjerena kopija smanjuje gubitak rada.' : 'Jedini primjerci ostaju na disku koji javlja greške.')
          : risk.id === 'account' ? (measures.includes('accounts') ? 'Ukinut je poznati zajednički pristup. Preostale rizike treba pratiti.' : 'Zajednička lozinka i dalje omogućuje neodobrene promjene.')
          : 'Izgled ne utječe na točnost teksta ni rad nastave.' };
    }),
  };
}

export type ResponseStep = '' | 'contain' | 'recover' | 'verify' | 'erase';
export const RESPONSE_STEPS: { id: Exclude<ResponseStep, ''>; label: string; simple: string }[] = [
  { id: 'recover', label: 'Ukloni uzrok i obnovi iz provjerenog izvora', simple: 'Administrator popravlja i vraća provjerene podatke' },
  { id: 'verify', label: 'Provjeri rad i ovlasti; odobri povratak uz nadzor', simple: 'Provjeri rad pa dopusti povratak uz praćenje' },
  { id: 'contain', label: 'Ograniči širenje; prijavi i sačuvaj dokaze', simple: 'Odvoji pogođeno računalo, pozovi pomoć i sačuvaj zapise' },
  { id: 'erase', label: 'Obriši zapise i odmah vrati uređaj na mrežu', simple: 'Obriši zapise i odmah vrati računalo na mrežu' },
];
export const RESPONSE_ORDER: ResponseStep[] = ['contain', 'recover', 'verify'];
export function responseOptions(tier: ContentTier, index: number) {
  return tier === 'junior' ? RESPONSE_STEPS.filter(step => step.id === RESPONSE_ORDER[index] || step.id === 'erase') : RESPONSE_STEPS;
}
export function cleanResponse(value: unknown, tier: ContentTier): ResponseStep[] {
  return RESPONSE_ORDER.map((_, index) => tier === 'junior' && index === 1 ? 'recover'
    : responseOptions(tier, index).find(step => Array.isArray(value) && step.id === value[index])?.id || '');
}
export function responsePreview(order: readonly ResponseStep[]) {
  let isolated = false, restored = false, verified = false, evidenceLost = false;
  const steps = order.map(step => {
    if (!step) return { ok: false, text: 'Postupak još nije odabran.' };
    if (step === 'erase') { evidenceLost = true; isolated = false; restored = false; verified = false; return { ok: false, text: 'Zapisi su izgubljeni; povratak bez provjere može ponoviti incident.' }; }
    if (step === 'contain') { isolated = true; return { ok: !evidenceLost, text: evidenceLost ? 'Veza je ograničena, ali prethodno izbrisani zapisi nisu vraćeni.' : 'Širenje je ograničeno. Administrator obrađuje prijavu i čuva zapise.' }; }
    if (step === 'recover') { restored = isolated; return { ok: restored, text: restored ? 'Uzrok se uklanja i priprema obnova dok je uređaj odvojen.' : 'Preuranjena obnova: širenje još nije ograničeno.' }; }
    verified = isolated && restored && !evidenceLost;
    return { ok: verified, text: verified ? 'Nakon provjere rada i ovlasti dopušta se povratak uz nadzor.' : 'Povratak nije odobren: prethodna priprema nije potpuna.' };
  });
  return { steps, verified, evidenceLost };
}
