// Hidden locations belong only to the authoritative saved game. UI, network
// projections and computer planning use settled awards and own clues.
export const BONUS_FEATURE='bonus-fields-v1';
export const TREASURE_HUNT_FEATURE='treasure-hunt-v1';
export const BONUS_POINTS=2;
export const BONUS_COUNT=3;
export const TREASURE_CHAIN_POINTS=3;
export const TREASURE_HISTORY_LIMIT=5;
export const bonusFieldsEnabled=game=>game?.bonuses?.schema===1&&game.bonuses.enabled===true;
const huntMode=game=>game.mode==='computer'?game.players?.length===2:['local','room','direct'].includes(game.mode)&&game.players?.length>=2&&game.players.length<=6;
export const treasureHuntAvailable=game=>bonusFieldsEnabled(game)&&huntMode(game)&&(Array.isArray(game.bonuses.fields)?game.status==='playing'||game.bonuses.hunt?.schema===1:!!game.bonuses.hint);
export const treasureHuntEnabled=game=>treasureHuntAvailable(game)&&!!(game.bonuses.hunt?.schema===1||game.bonuses.hint);
export const treasureChainEnabled=game=>bonusFieldsEnabled(game)&&(game.bonuses.hunt?.schema===1&&game.bonuses.hunt.chainBonus!==false||game.bonuses.chainBonus===true);
const newHunt=game=>({schema:1,readings:game.players.map(()=>null),clues:game.players.map(()=>null)});
export function enableBonusFields(game,rng,{treasureHunt=true}={}){
 if(game.status!=='playing'||game.turn!==0||game.round!==1||game.phase!=='roll'||game.bonuses!==undefined||game.players.some(p=>p.marks.some(Boolean)))throw Error('Schatzsuche kann nur vor einer neuen Partie gewählt werden.');
 const available=Array.from({length:105},(_,i)=>i),fields=[];
 for(let n=0;n<BONUS_COUNT;n++){
  const pick=rng(available.length);if(!Number.isInteger(pick)||pick<0||pick>=available.length)throw Error('Ungültiger Zufallswert.');
  fields.push({index:available.splice(pick,1)[0],claim:null,pending:[]});
 }
 return {...game,bonuses:{schema:1,enabled:true,fields,...(treasureHunt&&huntMode(game)?{hunt:newHunt(game)}:{})}};
}
function refreshTreasureClues(game){
 const next=game.bonuses.fields.find(f=>f.claim===null),awards=bonusAwards(game);
 game.bonuses.hunt.clues=game.players.map((_,pid)=>next&&awards.some(a=>a.winners.includes(pid))?{round:game.round,band:Math.floor(next.index%15/5)}:null);
}
export function noteBonusMove(game,pid,cells){
 if(!bonusFieldsEnabled(game)||!Array.isArray(game.bonuses.fields))return;
 // Legacy saves gain hints on their next committed move. Keep their
 // original six-point ceiling; rendering, passing and loading never change it.
 if(treasureHuntAvailable(game)&&game.bonuses.hunt===undefined){
  game.bonuses.hunt={...newHunt(game),chainBonus:false};
  refreshTreasureClues(game);
 }
 let found=0;
 for(const field of game.bonuses.fields)if(field.claim===null&&cells.includes(field.index)&&!field.pending.includes(pid)){field.pending.push(pid);found++;}
 if(treasureHuntEnabled(game)&&game.bonuses.fields.some(f=>f.claim===null)){
  // Only the authority measures a confirmed move. Never probe drafts or peek
  // at a different player's still-private pending discovery in this round.
  const targets=game.bonuses.fields.filter(f=>f.claim===null&&!f.pending.includes(pid));
  const distances=cells.map(i=>Math.min(...targets.map(f=>Math.abs(i%15-f.index%15)+Math.abs(Math.floor(i/15)-Math.floor(f.index/15))))),distance=Math.min(...distances);
  const focus=targets.length?cells.filter((_,i)=>distances[i]===distance):[];
  const hunt=game.bonuses.hunt;
  // Older saves retain their one actual measurement. Earlier probes cannot be
  // reconstructed from today's targets, which may already have been claimed.
  if(hunt.history===undefined)hunt.history=hunt.readings.map(r=>r?[structuredClone(r)]:[]);
  const reading={round:game.round,cells:[...cells],focus,found,warmth:!targets.length?null:distance<=1?'hot':distance<=3?'warm':'cold'};
  hunt.readings[pid]=reading;
  hunt.history[pid]=[...hunt.history[pid],structuredClone(reading)].slice(-TREASURE_HISTORY_LIMIT);
 }
}
export function settleBonusFields(game){
 if(!bonusFieldsEnabled(game)||!Array.isArray(game.bonuses.fields))return;
 let changed=false;
 for(const field of game.bonuses.fields)if(field.claim===null&&field.pending.length){field.claim={round:game.round,winners:[...field.pending].sort((a,b)=>a-b)};field.pending=[];changed=true;}
 if(changed&&treasureHuntEnabled(game)){
  // One coarse five-column band, never a target coordinate. Refresh when the
  // other player takes the hinted treasure; an obsolete trail must not linger.
  refreshTreasureClues(game);
 }
}
export function bonusAwards(game){
 if(!bonusFieldsEnabled(game))return [];
 if(Array.isArray(game.bonuses.awards))return game.bonuses.awards.map(a=>({slot:a.slot,round:a.round,winners:[...a.winners]}));
 return game.bonuses.fields.flatMap((field,slot)=>field.claim?[{slot,round:field.claim.round,winners:[...field.claim.winners]}]:[]);
}
export const bonusChainPoints=(game,pid)=>treasureChainEnabled(game)&&bonusAwards(game).filter(a=>a.winners.includes(pid)).length===BONUS_COUNT?TREASURE_CHAIN_POINTS:0;
export const bonusPoints=(game,pid)=>bonusAwards(game).filter(award=>award.winners.includes(pid)).length*BONUS_POINTS+bonusChainPoints(game,pid);
// Presentation and planning may read only these earned facts and coarse clues.
// In particular this accessor never touches a hidden field's index or pending.
export function treasureHuntView(game,pid){
 if(!treasureHuntAvailable(game)||!Number.isInteger(pid)||!game.players[pid])return null;
 const {hunt,hint}=game.bonuses;
 if(hint&&hint.viewer!==pid)return null;
 const awards=bonusAwards(game),found=awards.filter(a=>a.winners.includes(pid)).length;
 const treasures=Array.from({length:BONUS_COUNT},(_,slot)=>{const award=awards.find(a=>a.slot===slot);return {slot,state:!award?'open':award.winners.includes(pid)?'earned':'taken',winners:award?[...award.winners]:[],round:award?.round??null};});
 const reading=hint?.reading??hunt?.readings[pid]??null,clue=hint?.clue??hunt?.clues[pid]??null,history=hint?.history??hunt?.history?.[pid]??(reading?[reading]:[]);
 return {found,remaining:BONUS_COUNT-awards.length,treasures,history:structuredClone(history),chainReward:treasureChainEnabled(game)?TREASURE_CHAIN_POINTS:0,chainPoints:bonusChainPoints(game,pid),reading:structuredClone(reading),clue:clue?{...clue}:null};
}
export function treasureMoveValue(game,pid,cells){
 const view=treasureHuntView(game,pid);if(!view?.remaining)return 0;
 const reading=view.reading,clue=view.clue;
 if(!reading?.warmth&&!clue)return 0;
 let possible=Array.from({length:105},(_,i)=>i).filter(i=>!game.players[pid].marks[i]&&(!clue||Math.floor(i%15/5)===clue.band));
 // With multiple treasures the nearest reading may describe a different one
 // from the trail. Only combine those constraints for the final treasure.
 if(reading?.warmth&&(!clue||view.remaining===1))possible=possible.filter(i=>{
  const distance=Math.min(...reading.cells.map(j=>Math.abs(i%15-j%15)+Math.abs(Math.floor(i/15)-Math.floor(j/15))));
  return reading.warmth==='hot'?distance===1:reading.warmth==='warm'?distance>=2&&distance<=3:distance>=4;
 });
 return possible.length?cells.filter(i=>possible.includes(i)).length/possible.length*(BONUS_POINTS+(view.found===2?view.chainReward:0))*1.6:0;
}
export function projectBonuses(game,own=null){
 const awards=bonusAwards(game),view=treasureHuntView(game,own);
 return {schema:1,enabled:true,awards,remaining:BONUS_COUNT-awards.length,...(treasureChainEnabled(game)?{chainBonus:true}:{}),...(view?{hint:{viewer:own,reading:view.reading,clue:view.clue,history:view.history}}:{})};
}
export function validBonusState(game,{allowProjection=false}={}){
 const b=game?.bonuses;if(b===undefined)return true;
 if(!bonusFieldsEnabled(game)||!Array.isArray(game.players)||!Number.isSafeInteger(game.round)||game.round<1)return false;
 const ids=value=>Array.isArray(value)&&new Set(value).size===value.length&&value.every(pid=>Number.isInteger(pid)&&pid>=0&&pid<game.players.length);
 const claim=value=>value&&Number.isSafeInteger(value.round)&&value.round>=1&&value.round<=game.round&&ids(value.winners)&&value.winners.length>0;
 const round=n=>Number.isSafeInteger(n)&&n>=1&&n<=game.round;
 const reading=r=>r&&Object.keys(r).every(k=>['round','cells','focus','found','warmth'].includes(k))&&round(r.round)&&Array.isArray(r.cells)&&r.cells.length>=1&&r.cells.length<=6&&new Set(r.cells).size===r.cells.length&&r.cells.every(i=>Number.isInteger(i)&&i>=0&&i<105)&&Number.isInteger(r.found)&&r.found>=0&&r.found<=BONUS_COUNT&&[null,'cold','warm','hot'].includes(r.warmth)&&(r.focus===undefined||Array.isArray(r.focus)&&r.focus.length<=r.cells.length&&(r.warmth?r.focus.length>=1:r.focus.length===0)&&new Set(r.focus).size===r.focus.length&&r.focus.every(i=>r.cells.includes(i)));
 const sameCells=(a,b)=>a===undefined?b===undefined:Array.isArray(b)&&a.length===b.length&&a.every((n,i)=>n===b[i]);
 const sameReading=(a,b)=>a&&b&&a.round===b.round&&a.found===b.found&&a.warmth===b.warmth&&sameCells(a.cells,b.cells)&&sameCells(a.focus,b.focus);
 const historyMatches=(history,latest)=>Array.isArray(history)&&history.length<=TREASURE_HISTORY_LIMIT&&history.every((r,i)=>reading(r)&&(i===0||r.round>=history[i-1].round))&&(history.length?sameReading(history.at(-1),latest):latest===null);
 const clue=c=>c===null||c&&Object.keys(c).length===2&&round(c.round)&&Number.isInteger(c.band)&&c.band>=0&&c.band<=2;
 if(b.hunt!==undefined){
  if(!huntMode(game)||b.hunt?.schema!==1||!Array.isArray(b.fields))return false;
  const h=b.hunt,rows=values=>Array.isArray(values)&&values.length===game.players.length;
  if(Object.keys(h).some(k=>!['schema','readings','clues','chainBonus','history'].includes(k))||h.chainBonus!==undefined&&h.chainBonus!==false||!rows(h.readings)||!rows(h.clues))return false;
  if(!h.readings.every(r=>r===null||reading(r)))return false;
  if(h.history!==undefined&&(!rows(h.history)||!h.history.every((history,pid)=>historyMatches(history,h.readings[pid]))))return false;
  if(!h.clues.every(clue))return false;
 }
 if(Array.isArray(b.fields))return b.awards===undefined&&b.hint===undefined&&b.chainBonus===undefined&&b.fields.length===BONUS_COUNT&&new Set(b.fields.map(f=>f?.index)).size===BONUS_COUNT&&b.fields.every(f=>f&&Number.isInteger(f.index)&&f.index>=0&&f.index<105&&ids(f.pending)&&(f.claim===null?f.pending.every(pid=>game.submitted?.includes(pid)):claim(f.claim)&&f.pending.length===0));
 if(!allowProjection||b.fields!==undefined||b.hunt!==undefined||b.chainBonus!==undefined&&(!huntMode(game)||b.chainBonus!==true))return false;
 if(b.hint!==undefined){
  const h=b.hint;
  if(!huntMode(game)||!h||Object.keys(h).length!==4||!ids([h.viewer])||!(h.reading===null||reading(h.reading))||!clue(h.clue)||!historyMatches(h.history,h.reading))return false;
 }
 return Array.isArray(b.awards)&&b.awards.length<=BONUS_COUNT&&b.remaining===BONUS_COUNT-b.awards.length&&new Set(b.awards.map(a=>a?.slot)).size===b.awards.length&&b.awards.every(a=>Number.isInteger(a?.slot)&&a.slot>=0&&a.slot<BONUS_COUNT&&claim(a));
}
