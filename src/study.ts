import { LEVELS, levelContent, missionNumber } from './data.ts';
import { TERMS, type ContentTier } from './curriculum.ts';
import { missionOutcome } from './learning.ts';
import type { PlayMode } from './storage.ts';

export const MODE_NAMES:Record<PlayMode,string>={campaign:'Kampanja',topics:'Vježbe po temama'};
// Free topic choice can skip concepts formerly encountered earlier in the campaign.
// Reuse the actual tier-adapted explanations instead of inventing another curriculum.
const PREPARATION:Record<number,[number,number][]>= {
  4:[[3,0]],5:[[2,0]],6:[[2,0]],8:[[2,2]],9:[[8,1]],10:[[8,1],[5,1]],
  11:[[3,0]],12:[[3,2],[4,1]],13:[[2,2],[3,0]],14:[[2,2],[13,1]],
};
export function topicPreparation(level:number,tier:ContentTier){
  return (PREPARATION[level]||[]).map(([source,index])=>{
    const lesson=levelContent(LEVELS[source-1],tier).lesson[index];
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
