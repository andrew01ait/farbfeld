import {abilityCharges,extraCellError,battlePreparing} from './variants.js';
import {minesEnabled,mineBlastTargets} from './engine.js';
import {boardFor,LABELS,canAct,availableDice,resolveChoice,validateCells,findMove} from './engine.js';
import {bonusFieldsEnabled,bonusAwards,BONUS_COUNT} from './bonus-fields.js';

// Public completion facts only. No opponent sheet, private fleet, mine
// coordinate or hidden treasure location is needed to fold a finished card.
export function completedFeaturePanels(game,own){
 if(!game?.players?.[own])return {};
 const v=game.variants,ended=game.status==='finished',tasks=v?.objectives?.tasks,mines=v?.hiddenMines;
 return {
  bonus:bonusFieldsEnabled(game)&&(ended||bonusAwards(game).length===BONUS_COUNT),
  battle:!!v?.battleship&&(ended||v.battleship.sunk[own].every(Boolean)),
  objectives:!!tasks&&(ended||tasks.every(t=>t.claims[own]!==null||t.deadline!==null&&game.round>t.deadline)),
  hiddenMines:!!mines&&(ended||mines.triggered.every(row=>row.every(Boolean))),
 };
}
// Collapse on completion once. A person may reopen the completed details and
// keep them open through ordinary renders, polling and sheet inspection.
export class FeatureCompletionNotice {
 constructor(){this.seen=new Map();}
 observe(game,own,context){
  if(!game?.players?.[own])return new Set();
  const key=JSON.stringify([context,game.mode,game.gameId||'legacy',own]),now=completedFeaturePanels(game,own),before=this.seen.get(key)||{};
  this.seen.set(key,now);if(this.seen.size>100)this.seen.delete(this.seen.keys().next().value);
  return new Set(Object.keys(now).filter(k=>now[k]&&!before[k]));
 }
}
// Select the current person's next setup step, not the group's global phase.
// Existing option/authority checks still decide which mechanics can be enabled.
export function preparationStep(game,own){
 if(game?.status!=='playing'||!game.variants||!game.players?.[own]||game.players[own].left)return null;
 const v=game.variants;
 if(v.battleship&&!v.battleship.ready[own])return 'fleet';
 if(v.hiddenMines&&!v.hiddenMines.ready[own])return 'mines';
 return game.players.some((p,i)=>!p.left&&(v.battleship&&!v.battleship.ready[i]||v.hiddenMines&&!v.hiddenMines.ready[i]))?'waiting':null;
}
// Free colour still replaces one available die. Bind that die for the UI so
// choosing the ability, colour and number never needs an extra colour-die tap.
export function selectMoveColor(game,pid,choice,color){
 const next={...choice,color};
 if(choice.ability==='color'){
  const dice=availableDice(game,pid).colors;
  if(!dice.some(d=>d.index===choice.ci))next.ci=dice[0]?.index??null;
 }
 return next;
}
// Presentation state keeps the person taking a turn separate from the person viewing a sheet.
// Automatic mines report their result in the feature card, without changing the
// viewed sheet. Only an explicitly launched airstrike may inspect its victim.
export function mineInspectionChange(game,blasts,own){
 const attacks=blasts.filter(b=>b.kind!=='hidden'),outgoing=attacks.findLast(b=>b.by===own);
 if(outgoing){
  const visible=mineBlastTargets(outgoing).filter(t=>mayInspect(game,t.pid,own));
  return (visible.find(t=>t.cells.length)||visible[0])?.pid;
 }
 if(attacks.some(b=>mineBlastTargets(b).some(t=>t.pid===own&&t.cells.length)))return null;
 return undefined;
}
export function turnOrder(game) {
  return game.players.map((_,offset)=>(game.active+offset)%game.players.length);
}
export function nextLocalPlayer(game) {
  const preparing=game.players.findIndex((_,i)=>['fleet','mines'].includes(preparationStep(game,i)));
  if(preparing!==-1)return preparing;
  if (game.phase==='roll'||game.status==='finished') return game.active;
  return turnOrder(game).find(i=>!game.players[i].left&&!game.submitted.includes(i))??game.active;
}
export function choosingPlayers(game) {
  if(game.status!=='playing')return [];
  if(game.phase==='roll')return [game.active];
  if(!game.submitted.includes(game.active))return [game.active];
  return turnOrder(game).filter(i=>!game.players[i].left&&!game.submitted.includes(i));
}
export function mayInspect(game,requested,current) {
  if(game.hiddenScores&&game.status!=='finished'&&requested!==current)return false;
  return game.mode!=='local'||minesEnabled(game)||game.status==='finished'||requested===current;
}
export function playerRole(game,index) {
  if(game.players[index]?.left)return 'Ausgestiegen';
  if(game.status==='finished')return 'Ergebnis';
  if(game.submitted.includes(index))return 'Fertig ✓';
  if(game.mode==='local'&&index!==nextLocalPlayer(game))return 'Wartet';
  if(game.phase==='roll')return index===game.active?'Würfelt':'Wartet';
  if(!game.submitted.includes(game.active))return index===game.active?'Wählt zuerst':'Wartet';
  return 'Am Zug';
}
export function turnDescription(game,ownIndex) {
  if(game.status!=='playing')return null;
  if(battlePreparing(game))return {title:game.variants.battleship.ready[ownIndex]?'Warte auf die andere Flotte':'Platziere deine fünf Schiffe',detail:'Berühren ist erlaubt. Beide bestätigen ihre eigene Flotte vor dem ersten Wurf.',indices:game.players.flatMap((_,i)=>game.variants.battleship.ready[i]?[]:[i])};
  const indices=game.mode==='local'?[nextLocalPlayer(game)]:choosingPlayers(game);
  const names=indices.map(i=>game.players[i].name).join(', '),du=indices.length===1&&names.trim().toLocaleLowerCase('de')==='du';
  if(game.mode==='computer'){
    const computer=indices.includes(1);
    if(game.phase==='roll')return {title:computer?'Der Computer würfelt jetzt':'Du würfelst jetzt',detail:computer?'Der Wurf wird automatisch erzeugt.':'Ihr spielt beide mit demselben Wurf.',indices};
    if(computer)return {title:'Der Computer ist am Zug',detail:'Er wählt und setzt seine Kreuze automatisch.',indices};
    return {title:'Du bist am Zug',detail:game.round<=3?'Wähle aus allen Würfeln.':game.chosen?'Wähle aus den übrigen Würfeln.':'Alle Würfel stehen dir zur Verfügung.',indices};
  }
  if(game.phase==='roll')return {title:`${names} ${du?'würfelst':'würfelt'} jetzt`,detail:'Danach wird eine Farbe mit einer Zahl kombiniert.',indices};
  if(!game.submitted.includes(game.active))return {title:`${names} ${du?'wählst':'wählt'} zuerst`,detail:'Die anderen warten auf diese Auswahl.',indices};
  if(['room','direct'].includes(game.mode)&&game.submitted.includes(ownIndex))return {title:'Dein Zug ist gespeichert',detail:`Noch am Zug: ${names}.`,indices};
  return {title:`${names} ${indices.length===1?(du?'bist':'ist'):'sind'} am Zug`,detail:game.round<=3?'Wähle aus allen Würfeln.':'Wähle aus den übrigen Würfeln.',indices};
}

// Rule snapshots are immutable; repeated renders share availability checks.
const moveCache=new WeakMap();
function possibleMove(game,pid,filter={}){
 let cache=moveCache.get(game);if(!cache){cache=new Map();moveCache.set(game,cache);}
 const key=[pid,filter.ci,filter.ni,filter.color,filter.count,filter.ability,filter.delta,[...(filter.cells||[])].sort((a,b)=>a-b).join(',')].join('/');
 if(!cache.has(key))cache.set(key,!!findMove(game,pid,filter));
 return cache.get(key);
}
const feedback=(code,tone,title,detail,extra={})=>({code,tone,title,detail,valid:false,invalid:false,noMove:false,...extra});
function cellError(error,count){
 if(error.includes('untereinander'))return feedback('disconnected','error','Die Felder hängen nicht zusammen.','Verbinde alle gewählten Felder waagrecht oder senkrecht. Diagonal zählt nicht.',{invalid:true});
 if(error.includes('Beginne'))return feedback('anchor','error','Der Anschluss fehlt.','Wähle ein Feld in Spalte H oder direkt neben einem deiner bisherigen Kreuze.',{invalid:true});
 if(error.includes('genau'))return feedback('count','error','Die Anzahl passt noch nicht.','Für diesen Würfel brauchst du genau '+count+' '+(count===1?'Feld.':'zusammenhängende Felder.'),{invalid:true});
 return feedback('cells','error','Diese Felder passen nicht.','Wähle freie Felder in der gewählten Würfelfarbe und jedes Feld nur einmal.',{invalid:true});
}
export function moveFeedback(game,pid,choice={},cells=[]){
 if(!game||!canAct(game,pid))return null;
 const abilityOptions=['color','number','extra'].flatMap(ability=>abilityCharges(game,pid,ability).length?(ability==='number'?[-1,1].map(delta=>({ability,delta})):[{ability}]):[]);
 if(!possibleMove(game,pid)&&!abilityOptions.some(filter=>possibleMove(game,pid,filter)))return feedback('no_move','warning','Mit diesem Wurf ist kein Zug möglich.','Tippe auf „Passen“. Deine Joker bleiben dabei erhalten.',{noMove:true});
 if(choice.ci===null||choice.ci===undefined||choice.ni===null||choice.ni===undefined)return choice.ability==='color'?feedback('dice','info','Wähle einen Zahlenwürfel.','Mit Farbwahl wählst du die gewünschte Farbe direkt unter den Farbwürfeln.'):feedback('dice','info','Wähle eine Farbe und eine Zahl.','Danach markierst du genau diese Anzahl Felder auf deinem Spielfeld.');
 const dice=availableDice(game,pid),c=dice.colors.find(d=>d.index===choice.ci),n=dice.numbers.find(d=>d.index===choice.ni);
 if(!c||!n)return feedback('unavailable','error','Diese Würfel sind nicht mehr verfügbar.','Wähle eine der noch verfügbaren Farben und Zahlen.');
 const cost=Number(c.value==='*'&&choice.ability!=='color')+Number(n.value==='?'),player=game.players[pid];
 if(cost>player.jokers)return feedback('jokers','error','Nicht genug Joker übrig.','Benötigt: '+cost+' Joker. Du hast noch '+player.jokers+'. Wähle andere Würfel oder passe.');
 const result=resolveChoice(game,pid,choice);
 if(result.error)return feedback('joker_choice','info',choice.ability?'Fähigkeit noch ergänzen.':'Joker noch auswählen.',result.error);
 const {cells:board}=boardFor(game,pid),{color,count}=result,filter={ci:choice.ci,ni:choice.ni,color,count:n.value==='?'?choice.count:n.value,...(choice.ability?{ability:choice.ability,delta:choice.delta}:{})};
 if(cells.some(i=>!Number.isInteger(i)||i<0||i>=board.length||player.marks[i]||board[i]!==color)||new Set(cells).size!==cells.length)return cellError('Felder',count);
 if(cells.length>count)return cellError('genau',count);
 if(cells.length===count){
  const error=validateCells(player,cells,color,count,false,game);
  if(error)return cellError(error,count);
  const extraError=extraCellError(game,pid,{...choice,cells});if(extraError)return feedback('extra','info','Wähle dein Zusatzfeld.',extraError);
  return feedback('ready','success','Dein Zug passt.','Genau '+count+' '+(count===1?'Feld':'Felder')+' in '+LABELS[color]+(choice.ability==='extra'?' und ein angrenzendes Zusatzfeld':'')+'. Tippe auf „Bestätigen“.'+(cost?' '+cost+' Joker werden verwendet.':''),{valid:true});
 }
 if(!possibleMove(game,pid,filter))return feedback('combination','error','Mit dieser Kombination geht es nicht.','Für '+count+' '+(count===1?'Feld':'Felder')+' in '+LABELS[color]+' gibt es keinen gültigen Platz. Wähle andere Würfel oder „Tipp“.',{invalid:cells.length>0});
 if(cells.length&&!possibleMove(game,pid,{...filter,cells}))return feedback('extend','error','Diese Auswahl lässt sich nicht vervollständigen.','Damit erreichst du keine gültigen '+count+' Felder. Ändere die Auswahl oder nutze „Tipp“.',{invalid:true});
 if(!cells.length)return feedback('select','info','Markiere '+count+' '+(count===1?'Feld.':'zusammenhängende Felder.'),'Farbe '+LABELS[color]+' · Beginne in H oder neben einem bisherigen Kreuz.');
 const partialError=validateCells(player,cells,color,count,true,game);
 const remaining=count-cells.length;
 if(partialError)return feedback('complete_connection','warning','Verbinde deine Auswahl noch.','Noch '+remaining+' '+(remaining===1?'Feld':'Felder')+' wählen. Alle Felder müssen verbunden sein und an H oder bisherige Kreuze anschließen.');
 return feedback('more','info','Noch '+remaining+' '+(remaining===1?'Feld':'Felder')+' wählen.',cells.length+' von '+count+' markiert. Ergänze direkt angrenzende Felder in '+LABELS[color]+'.');
}

// Other players may submit concurrently; only changes relevant to this sheet
// invalidate the unconfirmed dice/cell selection on this device.
export function ownTurnKey(game,pid){
  if(!game)return '';
  return JSON.stringify([game.gameId,game.round,game.phase,game.active,game.status,game.players[pid],game.dice,game.chosen,game.submitted.includes(pid),game.submitted.includes(game.active)]);
}

// A result is acknowledged only when its dialog is actually shown.
export class ResultNotice {
 constructor(seen=[]){this.seen=new Set(Array.isArray(seen)?seen.filter(key=>typeof key==='string').slice(-100):[]);}
 key(game,context){return JSON.stringify([context,game?.mode,typeof game?.gameId==='string'?game.gameId:'legacy']);}
 seenInAnyContext(game){
  const suffix=','+JSON.stringify([game.mode,game.gameId]).slice(1);
  return [...this.seen].some(key=>key.endsWith(suffix));
 }
 ready(game,context){
  if(!game)return false;
  const key=this.key(game,context);
  if(game.status!=='finished'){if(!game.gameId)this.seen.delete(key);return false;}
  return !this.seen.has(key);
 }
 claim(game,context){if(!this.ready(game,context))return false;this.seen.add(this.key(game,context));if(this.seen.size>100)this.seen.delete(this.seen.values().next().value);return true;}
 next(current,previous,context){return [previous,current].find(game=>this.ready(game,context));}
}
