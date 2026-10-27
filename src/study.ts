import { LEVELS, levelContent, missionNumber } from './data.ts';
import { TERMS, type ContentTier } from './curriculum.ts';
import { missionOutcome } from './learning.ts';
import type { PlayMode } from './storage.ts';

export const MODE_NAMES:Record<PlayMode,string>={campaign:'Kampanja',topics:'Vježbe po temama'};
// Free topic choice can skip concepts formerly encountered earlier in the campaign.
// Reuse the actual tier-adapted explanations instead of inventing another curriculum.
// Concepts have explicit tier mappings: Junior does not always use the same order.
const CONCEPTS={
  backup:{source:3,standard:0,junior:0},permissions:{source:2,standard:0,junior:0},
  encryption:{source:2,standard:2,junior:2},firewall:{source:8,standard:1,junior:0},
  password:{source:5,standard:1,junior:1},restore:{source:3,standard:2,junior:2},
  containment:{source:4,standard:1,junior:1},reference:{source:13,standard:1,junior:1},
} as const;
const PREPARATION:Record<number,(keyof typeof CONCEPTS)[]>= {
  4:['backup'],5:['permissions'],6:['permissions'],8:['encryption'],9:['firewall'],10:['firewall','password'],
  11:['backup'],12:['restore','containment'],13:['encryption','backup'],14:['encryption','reference'],
};
export function topicPreparation(level:number,tier:ContentTier){
  return (PREPARATION[level]||[]).map(concept=>{
    const mapping=CONCEPTS[concept],source=mapping.source;
    const lesson=levelContent(LEVELS[source-1],tier).lesson[mapping[tier==='junior'?'junior':'standard']];
    return {source,title:lesson[0],text:lesson[1]};
  });
}
const searchable=(text:string)=>text.normalize('NFD').replace(/\p{M}/gu,'').replace(/[đĐ]/g,'d').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
export function findTopics(query:string,tier:ContentTier){
  const words=searchable(query).split(/\s+/).filter(Boolean);
  return LEVELS.filter(base=>{
    const level=levelContent(base,tier);
    const text=searchable([missionNumber(base.id),base.title,base.subtitle,level.title,level.description,missionOutcome(base.id,tier),...level.lesson.flat(),...TERMS[base.id].flat()].join(' '));
    return words.every(word=>text.includes(word));
  });
}
