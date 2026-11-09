// Hidden locations belong only to the authoritative saved game. UI, network
// projections and computer planning use settled awards, never these locations.
export const BONUS_FEATURE='bonus-fields-v1';
export const BONUS_POINTS=2;
export const BONUS_COUNT=3;
export const bonusFieldsEnabled=game=>game?.bonuses?.schema===1&&game.bonuses.enabled===true;
export function enableBonusFields(game,rng){
 if(game.status!=='playing'||game.turn!==0||game.round!==1||game.phase!=='roll'||game.bonuses!==undefined||game.players.some(p=>p.marks.some(Boolean)))throw Error('Bonusfelder können nur vor einer neuen Partie gewählt werden.');
 const available=Array.from({length:105},(_,i)=>i),fields=[];
 for(let n=0;n<BONUS_COUNT;n++){
  const pick=rng(available.length);if(!Number.isInteger(pick)||pick<0||pick>=available.length)throw Error('Ungültiger Zufallswert.');
  fields.push({index:available.splice(pick,1)[0],claim:null,pending:[]});
 }
 return {...game,bonuses:{schema:1,enabled:true,fields}};
}
export function noteBonusMove(game,pid,cells){
 if(!bonusFieldsEnabled(game))return;
 for(const field of game.bonuses.fields)if(field.claim===null&&cells.includes(field.index)&&!field.pending.includes(pid))field.pending.push(pid);
}
export function settleBonusFields(game){
 if(!bonusFieldsEnabled(game))return;
 for(const field of game.bonuses.fields)if(field.claim===null&&field.pending.length){field.claim={round:game.round,winners:[...field.pending].sort((a,b)=>a-b)};field.pending=[];}
}
export function bonusAwards(game){
 if(!bonusFieldsEnabled(game))return [];
 if(Array.isArray(game.bonuses.awards))return game.bonuses.awards.map(a=>({slot:a.slot,round:a.round,winners:[...a.winners]}));
 return game.bonuses.fields.flatMap((field,slot)=>field.claim?[{slot,round:field.claim.round,winners:[...field.claim.winners]}]:[]);
}
export const bonusPoints=(game,pid)=>bonusAwards(game).filter(award=>award.winners.includes(pid)).length*BONUS_POINTS;
export const projectBonuses=game=>({schema:1,enabled:true,awards:bonusAwards(game),remaining:BONUS_COUNT-bonusAwards(game).length});
export function validBonusState(game,{allowProjection=false}={}){
 const b=game?.bonuses;if(b===undefined)return true;
 if(!bonusFieldsEnabled(game)||!Array.isArray(game.players)||!Number.isSafeInteger(game.round)||game.round<1)return false;
 const ids=value=>Array.isArray(value)&&new Set(value).size===value.length&&value.every(pid=>Number.isInteger(pid)&&pid>=0&&pid<game.players.length);
 const claim=value=>value&&Number.isSafeInteger(value.round)&&value.round>=1&&value.round<=game.round&&ids(value.winners)&&value.winners.length>0;
 if(Array.isArray(b.fields))return b.fields.length===BONUS_COUNT&&new Set(b.fields.map(f=>f?.index)).size===BONUS_COUNT&&b.fields.every(f=>f&&Number.isInteger(f.index)&&f.index>=0&&f.index<105&&ids(f.pending)&&(f.claim===null?f.pending.every(pid=>game.submitted?.includes(pid)):claim(f.claim)&&f.pending.length===0));
 return allowProjection&&Array.isArray(b.awards)&&b.awards.length<=BONUS_COUNT&&b.remaining===BONUS_COUNT-b.awards.length&&new Set(b.awards.map(a=>a?.slot)).size===b.awards.length&&b.awards.every(a=>Number.isInteger(a?.slot)&&a.slot>=0&&a.slot<BONUS_COUNT&&claim(a));
}
