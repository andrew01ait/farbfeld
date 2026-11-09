import {minesEnabled} from './engine.js';
import {boardFor,LABELS,canAct,availableDice,resolveChoice,validateCells,findMove} from './engine.js';
// Presentation state keeps the person taking a turn separate from the person viewing a sheet.
export function turnOrder(game) {
  return game.players.map((_,offset)=>(game.active+offset)%game.players.length);
}
export function nextLocalPlayer(game) {
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
 const key=[pid,filter.ci,filter.ni,filter.color,filter.count,[...(filter.cells||[])].sort((a,b)=>a-b).join(',')].join('/');
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
 if(!possibleMove(game,pid))return feedback('no_move','warning','Mit diesem Wurf ist kein Zug möglich.','Tippe auf „Passen“. Deine Joker bleiben dabei erhalten.',{noMove:true});
 if(choice.ci===null||choice.ci===undefined||choice.ni===null||choice.ni===undefined)return feedback('dice','info','Wähle eine Farbe und eine Zahl.','Danach markierst du genau diese Anzahl Felder auf deinem Spielfeld.');
 const dice=availableDice(game,pid),c=dice.colors.find(d=>d.index===choice.ci),n=dice.numbers.find(d=>d.index===choice.ni);
 if(!c||!n)return feedback('unavailable','error','Diese Würfel sind nicht mehr verfügbar.','Wähle eine der noch verfügbaren Farben und Zahlen.');
 const cost=Number(c.value==='*')+Number(n.value==='?'),player=game.players[pid];
 if(cost>player.jokers)return feedback('jokers','error','Nicht genug Joker übrig.','Benötigt: '+cost+' Joker. Du hast noch '+player.jokers+'. Wähle andere Würfel oder passe.');
 const result=resolveChoice(game,pid,choice);
 if(result.error)return feedback('joker_choice','info','Joker noch auswählen.',result.error);
 const {cells:board}=boardFor(game),{color,count}=result,filter={ci:choice.ci,ni:choice.ni,color,count};
 if(cells.some(i=>!Number.isInteger(i)||i<0||i>=board.length||player.marks[i]||board[i]!==color)||new Set(cells).size!==cells.length)return cellError('Felder',count);
 if(cells.length>count)return cellError('genau',count);
 if(cells.length===count){
  const error=validateCells(player,cells,color,count,false,game);
  if(error)return cellError(error,count);
  return feedback('ready','success','Dein Zug passt.','Genau '+count+' '+(count===1?'Feld':'Felder')+' in '+LABELS[color]+'. Tippe auf „Bestätigen“.'+(cost?' '+cost+' Joker werden verwendet.':''),{valid:true});
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
