import type { ContentTier } from './curriculum.ts';

export type HashVerdict='same'|'changed';
export type SignatureKey=''|'school'|'enclosed';
export type SignatureVerdict='accept'|'hold';

// Actual SHA-256 values of these exact UTF-8 strings, without a final newline.
// Fixtures are independently checked with node:crypto; no user file is read.
export const HASH_REFERENCE={
  name:'obavijest.txt',text:'SIS: sastanak u 10:00.',
  digest:'f6b82f9b0407d251baf55738ea04adabe62fc403155e81d3c6e6aabac6366315'
};
export const HASH_FILES=[
  {id:'original',label:'A · preuzeti primjerak',name:'obavijest.txt',text:HASH_REFERENCE.text,digest:HASH_REFERENCE.digest},
  {id:'changed',label:'B · promijenjeno vrijeme',name:'obavijest.txt',text:'SIS: sastanak u 11:00.',digest:'1fa18f763256192f9a09b628889295a81b169ea2e89f9e607bb35fb661abbe85'},
  {id:'renamed',label:'C · drugi naziv',name:'kopija.txt',text:HASH_REFERENCE.text,digest:HASH_REFERENCE.digest},
];
export const HASH_VERDICTS:[HashVerdict,string][]=[['same','Sažetak se podudara'],['changed','Sažetak se razlikuje']];
export const hashFilesFor=(tier:ContentTier)=>tier==='junior'?HASH_FILES.slice(0,2):HASH_FILES;
export const hashMatches=(file:typeof HASH_FILES[number])=>file.digest===HASH_REFERENCE.digest;

// Deliberately a teaching model, not cryptographic signature verification.
// The key labels are fictional; no private key or real certificate is included.
export const SIGNATURE_KEYS:[Exclude<SignatureKey,''>,string][]=[
  ['school','Školski javni ključ · potvrđen poznatim putem'],
  ['enclosed','Javni ključ iz poruke · veza sa školom nije potvrđena'],
];
export const SIGNED_FILES=[
  {id:'approved',label:'A · izvorni školski raspored',text:'Izlet: polazak u 08:00.',signingKey:'school',modified:false,detail:'Škola je potpisala ovu inačicu; sadržaj je ostao isti.'},
  {id:'edited',label:'B · raspored nakon izmjene',text:'Izlet: polazak u 09:00.',signingKey:'school',modified:true,detail:'Vrijeme je promijenjeno nakon potpisivanja. Priložen je stari potpis.'},
  {id:'unknown',label:'C · navodno školska obavijest',text:'Izlet: polazak u 08:00.',signingKey:'enclosed',modified:false,detail:'Potpis odgovara ključu iz poruke. Nije potvrđeno da taj ključ pripada školi.'},
] as const;
export const SIGNATURE_VERDICTS:[SignatureVerdict,string][]=[['accept','Prihvati kao potvrđeni školski zapis'],['hold','Zaustavi prihvaćanje i zatraži provjeru']];
export const signedFilesFor=(tier:ContentTier)=>tier==='junior'?SIGNED_FILES.slice(0,2):SIGNED_FILES;
export function signaturePreview(file:typeof SIGNED_FILES[number],key:SignatureKey){
  const checked=!!key,valid=checked&&!file.modified&&file.signingKey===key,trusted=key==='school';
  return {checked,valid,trusted,acceptable:valid&&trusted,
    text:!checked?'Najprije odaberi javni ključ.':`${valid?'Potpis prolazi':'Potpis ne prolazi'} · ${trusted?'ključ je potvrđen kao školski':'veza ključa sa školom nije potvrđena'}.`};
}
function cleanAnswers<T extends string>(input:unknown,ids:string[],values:readonly T[]):Record<string,T>{
  if(!input||typeof input!=='object'||Array.isArray(input))return {};
  const source=input as Record<string,unknown>;
  return Object.fromEntries(ids.flatMap(id=>values.includes(source[id] as T)?[[id,source[id] as T]]:[]));
}
export const cleanHashAnswers=(input:unknown,tier:ContentTier)=>cleanAnswers(input,hashFilesFor(tier).map(f=>f.id),HASH_VERDICTS.map(([id])=>id));
export const cleanSignatureAnswers=(input:unknown,tier:ContentTier)=>cleanAnswers(input,signedFilesFor(tier).map(f=>f.id),SIGNATURE_VERDICTS.map(([id])=>id));
export const cleanSignatureKey=(input:unknown):SignatureKey=>SIGNATURE_KEYS.some(([id])=>id===input)?input as SignatureKey:'';
