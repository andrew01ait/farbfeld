import {projectBonuses} from './bonus-fields.js';
import {COLORS,FIRST,LATER,score,bonusFieldsEnabled,minesEnabled,projectMines} from './engine.js';
export const HIDDEN_FEATURE='hidden-scores-v1';
export const isScoreHidden=game=>!!game?.hiddenScores&&game.status!=='finished';
export const isHidden=(game,pid,own)=>isScoreHidden(game)&&pid!==own;
// Server and host keep full sheets. Guests only receive their own sheet until reveal.
export function projectGame(game,own){
 if(!game)return game;
 if(!bonusFieldsEnabled(game)&&!minesEnabled(game)&&(!game.hiddenScores||game.status==='finished'))return game;
 const out=structuredClone(game);
 if(bonusFieldsEnabled(game))out.bonuses=projectBonuses(game);
 if(minesEnabled(game))out.mines=projectMines(game,own);
 if(!game.hiddenScores||game.status==='finished')return out;
 out.players=out.players.map((p,pid)=>isHidden(game,pid,own)?{id:p.id,name:p.name,hidden:true,...(p.left?{left:true,forfeit:p.forfeit,leftRound:p.leftRound}:{})}:p);
 out.log=out.log.map(entry=>entry.pid===own||(entry.pid===undefined&&entry.player===game.players[own]?.name&&game.players.filter(p=>p.name===entry.player).length===1)?entry:{round:entry.round,player:entry.player,hidden:true});
 out.announcements=(out.announcements||[]).map(event=>event.pid===own?event:((({points,...rest})=>rest)(event)));
 return out;
}
export function scoreBreakdown(game,pid,own){
 if(isScoreHidden(game)||game.players[pid]?.hidden)return null;
 const p=game.players[pid],s=score(p,game);
 return {...s,name:p.name,columnDetails:p.columns.map((points,col)=>({column:String.fromCharCode(65+col),points})),colorDetails:COLORS.map(color=>({color,points:p.colors[color]}))};
}
export function columnStatus(game,pid,col){
 const p=game.players[pid],points=p.columns[col],filled=Array.from({length:7},(_,row)=>p.marks[row*15+col]).every(Boolean);
 return {complete:points!==null,pending:filled&&points===null,points,first:points===FIRST[col],later:points!==null&&points!==FIRST[col],high:FIRST[col],low:LATER[col]};
}
export function colorAnnouncements(game,own){
 return (Array.isArray(game?.announcements)?game.announcements:[]).filter(e=>e&&typeof e.id==='string'&&Number.isInteger(e.pid)&&e.pid>=0&&e.pid<game.players.length&&typeof e.name==='string'&&COLORS.includes(e.color)&&Number.isSafeInteger(e.round)&&e.round>=1&&(e.points===undefined||[3,5].includes(e.points))).map(event=>isScoreHidden(game)?(({points,...rest})=>rest)(event):event);
}
