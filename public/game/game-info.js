import {variantsEnabled,projectVariants} from './variants.js';
import {projectBonuses} from './bonus-fields.js';
import {COLORS,FIRST,LATER,LABELS,boardFor,score,bonusFieldsEnabled,minesEnabled,projectMines} from './engine.js';
export const HIDDEN_FEATURE='hidden-scores-v1';
export const isScoreHidden=game=>!!game?.hiddenScores&&game.status!=='finished';
export const isHidden=(game,pid,own)=>isScoreHidden(game)&&pid!==own;
export const validFinishTime=value=>Number.isSafeInteger(value)&&value>0&&value<=8640000000000000;
export function stampFinishedGame(game,at=Date.now()){
 return game?.status==='finished'&&!validFinishTime(game.finishedAt)&&validFinishTime(at)?{...game,finishedAt:at}:game;
}
export function gameResultRecord(game,ownPid,{id=game?.gameId,observedAt=Date.now(),title}={}){
 const own=game?.players?.[ownPid],completed=game?.status==='finished';
 if(!own||!id||!completed&&!own.left)return null;
 const finishedAt=completed&&validFinishTime(game.finishedAt)?game.finishedAt:null;
 const players=game.players.map((p,i)=>!completed&&game.hiddenScores&&i!==ownPid
  ?{name:p.name,hidden:true,...(p.left?{left:true}:{})}
  :{name:p.name,total:score(p,game).total,jokers:p.jokers,...(p.left?{left:true}:{})});
 const roomTitle=typeof title==='string'?title.trim().slice(0,48):'';
 return {id,date:new Date(finishedAt??observedAt).toISOString(),mode:game.mode,players,score:players[ownPid].total,ownPid,rounds:game.round,boardId:boardFor(game).id,completed,...(own.left?{forfeit:true}:{}),...(finishedAt?{finishedAt}:{}),...(roomTitle?{title:roomTitle}:{})};
}
// Server and host keep full sheets. Guests only receive their own sheet until reveal.
export function projectGame(game,own,{treasureHints=true}={}){
 if(!game)return game;
 if(!variantsEnabled(game)&&!bonusFieldsEnabled(game)&&!minesEnabled(game)&&(!game.hiddenScores||game.status==='finished'))return game;
 const out=structuredClone(game);
 if(variantsEnabled(game))out.variants=projectVariants(game,own);
 if(bonusFieldsEnabled(game))out.bonuses=projectBonuses(game,treasureHints?own:null);
 if(minesEnabled(game))out.mines=projectMines(game,own);
 if(!game.hiddenScores||game.status==='finished')return out;
 out.players=out.players.map((p,pid)=>isHidden(game,pid,own)?{id:p.id,name:p.name,hidden:true,...(p.left?{left:true,forfeit:p.forfeit,leftRound:p.leftRound}:{})}:p);
 out.log=out.log.map(entry=>entry.pid===own||(entry.pid===undefined&&entry.player===game.players[own]?.name&&game.players.filter(p=>p.name===entry.player).length===1)?entry:{round:entry.round,player:entry.player,hidden:true});
 out.announcements=(out.announcements||[]).map(event=>event.pid===own?event:((({points,...rest})=>rest)(event)));
 return out;
}
// Keep one completed scorecard alongside the new game. The score breakdown
// still uses the original rules and board; private clues and turn logs can go.
export function archiveFinishedGame(game){
 return game?.status==='finished'?projectGame({...game,log:[],announcements:[]},0,{treasureHints:false}):null;
}
export function scoreBreakdown(game,pid,own){
 if(isScoreHidden(game)||game.players[pid]?.hidden)return null;
 const p=game.players[pid],s=score(p,game);
 return {...s,name:p.name,columnDetails:p.columns.map((points,col)=>({column:String.fromCharCode(65+col),points})),colorDetails:COLORS.map(color=>({color,points:p.colors[color]}))};
}
export function resultComparison(game,own,selected){
 if(game?.status!=='finished'||!Number.isInteger(own)||!Number.isInteger(selected)||!game.players?.[own]||!game.players[selected]||game.players[own].hidden||game.players[selected].hidden)return null;
 const a=score(game.players[own],game),b=score(game.players[selected],game);
 const categories=[['columns','Spalten','columns',1],['colors','Farben','colors',1],['jokers','Übrige Joker','jokers',1],['stars','Offene Sterne','penalty',-1],['bonus','Schatzsuche','bonus',1],['battleship','Schiffsboni','shipBonus',1],['objectives','Aufträge','objectiveBonus',1],['mines','Luftangriff','mineCost',-1]];
 const rows=categories.filter(([, ,key])=>a[key]!==undefined||b[key]!==undefined).map(([type,label,key,sign])=>{const ownValue=a.left?null:sign*(a[key]??0),selectedValue=b.left?null:sign*(b[key]??0);return {type,label,own:ownValue,selected:selectedValue,delta:ownValue===null||selectedValue===null?null:selectedValue-ownValue};});
 if(a.left||b.left){const av=a.left?a.total:0,bv=b.left?b.total:0;rows.push({type:'result',label:'Partie verlassen',own:av,selected:bv,delta:bv-av});}
 return {own,selected,ownName:game.players[own].name,selectedName:game.players[selected].name,rows,ownLeft:!!a.left,selectedLeft:!!b.left,total:{own:a.total,selected:b.total,delta:b.total-a.total}};
}
export function columnStatus(game,pid,col){
 const p=game.players[pid],points=p.columns[col],filled=Array.from({length:7},(_,row)=>p.marks[row*15+col]).every(Boolean);
 return {complete:points!==null,pending:filled&&points===null,points,first:points===FIRST[col],later:points!==null&&points!==FIRST[col],high:FIRST[col],low:LATER[col]};
}
export function colorAnnouncements(game,own){
 return (Array.isArray(game?.announcements)?game.announcements:[]).filter(e=>e&&typeof e.id==='string'&&Number.isInteger(e.pid)&&e.pid>=0&&e.pid<game.players.length&&typeof e.name==='string'&&COLORS.includes(e.color)&&Number.isSafeInteger(e.round)&&e.round>=1&&(e.points===undefined||[3,5].includes(e.points))).map(event=>isScoreHidden(game)?(({points,...rest})=>rest)(event):event);
}

// Display-name grammar only; this never infers which person owns a device.
export function colorCompletionText(event,{withPoints=true}={}){
 const name=event.name,verb=name.trim().toLocaleLowerCase('de')==='du'?'hast':'hat';
 return name+' '+verb+' '+LABELS[event.color]+' abgeschlossen'+(withPoints&&event.points!==undefined?' · +'+event.points:'');
}
