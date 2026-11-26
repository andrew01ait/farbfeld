import {FORFEIT_SCORE} from './engine.js';
import {validFinishTime} from './game-info.js';
const MODES=['solo','local','computer','room','direct'];
export const statsCategory=mode=>mode==='solo'?'solo':mode==='computer'?'computer':['local','room','direct'].includes(mode)?'people':null;
const sameName=name=>name.normalize('NFKC').trim().replace(/\s+/g,' ').toLocaleLowerCase('de');
function record(value){
 if(!value||typeof value.id!=='string'||!value.id||value.id.length>200||!MODES.includes(value.mode)||!Number.isFinite(Date.parse(value.date))||!Number.isFinite(value.score)||Math.abs(value.score)>1000||!Array.isArray(value.players)||value.players.length<1||value.players.length>6)return null;
 const partial=value.forfeit===true;
 if(!value.players.every(p=>typeof p?.name==='string'&&p.name.length<=24&&(partial&&p.hidden===true||Number.isFinite(p.total)&&Math.abs(p.total)<=1000&&Number.isInteger(p.jokers)&&p.jokers>=0&&p.jokers<=8)))return null;
 const players=value.players.map(p=>partial&&p.hidden?{name:p.name,hidden:true,...(p.left?{left:true}:{})}:{name:p.name,total:p.left?FORFEIT_SCORE:p.total,jokers:p.jokers,...(p.left?{left:true}:{})});
 let ownPid=Number.isInteger(value.ownPid)&&value.ownPid>=0&&value.ownPid<players.length?value.ownPid:null;
 if(ownPid===null){
  if(['solo','local','computer'].includes(value.mode))ownPid=0;
  else {const matching=players.map((p,i)=>p.total===value.score?i:-1).filter(i=>i>=0);if(matching.length===1)ownPid=matching[0];}
 }
 if(partial&&(ownPid===null||players[ownPid].hidden||!players[ownPid].left))return null;
 return {id:value.id,date:new Date(value.date).toISOString(),mode:value.mode,boardId:['classic','river','mosaic','random'].includes(value.boardId)?value.boardId:'classic',score:players[ownPid]?.left?FORFEIT_SCORE:value.score,ownPid,players,...(partial?{forfeit:true}:{})};
}
export function validStats(value){return !!value&&value.schema===1&&Array.isArray(value.games)&&value.games.every(game=>record(game)!==null);}
export function mergeStats(value,entries=[]){
 const games=new Map();
 for(const item of [...(validStats(value)?value.games:[]),...entries]){const cleaned=record(item);if(cleaned&&!games.has(cleaned.id))games.set(cleaned.id,cleaned);}
 return {schema:1,games:[...games.values()]};
}
const compare=(a,b)=>Number(!!b.left)-Number(!!a.left)||(a.left&&b.left?0:a.total-b.total||a.jokers-b.jokers);
export const RECENT_RESULT_LIMIT=20;
function resultOutcome(game){
 if(game.mode==='solo')return 'solo';
 const own=game.players[game.ownPid];
 if(!own||own.hidden)return 'unknown';
 if(own.left)return 'forfeit';
 if(game.players.length<2||game.players.some(p=>p.hidden))return 'unknown';
 const best=game.players.reduce((a,b)=>compare(a,b)>=0?a:b);
 if(compare(own,best)<0)return 'loss';
 return game.players.filter(p=>compare(p,best)===0).length>1?'shared':'win';
}
export function storedResult(entry){
 const game=record(entry);
 if(!game||entry.completed===false&&!game.forfeit)return null;
 return {...game,completed:entry.completed===true,finishedAt:validFinishTime(entry.finishedAt)?entry.finishedAt:null,title:typeof entry.title==='string'?entry.title.slice(0,48):'',outcome:resultOutcome(game)};
}
export function recentResults(entries){
 const ids=new Set(),results=[];
 for(const entry of entries){
  if(entry?.completed===false||entry?.forfeit===true&&(entry.completed!==true||entry.mode==='local'&&/:left:\d+$/.test(entry.id)))continue;
  const result=storedResult(entry);
  if(!result||ids.has(result.id)||result.players.some(p=>p.hidden))continue;
  ids.add(result.id);
  results.push(result);
 }
 return results.sort((a,b)=>(b.finishedAt??Date.parse(b.date))-(a.finishedAt??Date.parse(a.date))).slice(0,RECENT_RESULT_LIMIT);
}
export function resultStandings(result){
 const players=result.players.map((p,pid)=>({...p,own:pid===result.ownPid,place:null}));
 if(result.forfeit&&!result.completed||players.some(p=>p.hidden))return players;
 const ordered=players.sort((a,b)=>compare(b,a));
 let place=1;
 return ordered.map((p,i)=>{
  if(i>0&&compare(p,ordered[i-1])<0)place=i+1;
  return {...p,place:p.left?null:place};
 });
}
function orderedGames(value,category){
 if(!['people','computer','solo'].includes(category))throw new RangeError('Unbekannter Statistikbereich.');
 const games=validStats(value)?value.games.map(record).filter(game=>statsCategory(game.mode)===category):[];
 return games.map((g,i)=>({g,i})).sort((a,b)=>Date.parse(a.g.date)-Date.parse(b.g.date)||a.i-b.i).map(item=>item.g);
}
export function summarizeStats(value,category='people'){
 const games=orderedGames(value,category);
 const result={played:games.length,wins:0,sharedWins:0,losses:0,unknown:0,currentStreak:0,longestStreak:0,best:null,average:null,opponents:[]},opponents=new Map();
 let total=0;
 for(const game of games){
  total+=game.score;result.best=result.best===null?game.score:Math.max(result.best,game.score);
  if(game.mode==='solo')continue;
  const own=game.players[game.ownPid];
  if(!own){result.unknown++;result.currentStreak=0;continue;}
  const best=game.players.reduce((a,b)=>compare(a,b)>=0?a:b),won=!own.left&&compare(own,best)===0;
  if(won){result.wins++;result.currentStreak++;result.longestStreak=Math.max(result.longestStreak,result.currentStreak);if(game.players.filter(p=>compare(p,best)===0).length>1)result.sharedWins++;}
  else {result.losses++;result.currentStreak=0;}
  game.players.forEach((other,pid)=>{
   if(pid===game.ownPid)return;
   const key=(game.mode==='computer'?'computer:':'person:')+sameName(other.name);
   const row=opponents.get(key)||{name:other.name,computer:game.mode==='computer',played:0,wins:0,draws:0,losses:0};
   const difference=compare(own,other);row.played++;if(difference>0)row.wins++;else if(difference<0)row.losses++;else row.draws++;
   opponents.set(key,row);
  });
 }
 result.average=games.length?Math.round(total/games.length*10)/10:null;
 result.opponents=[...opponents.values()].sort((a,b)=>b.played-a.played||a.name.localeCompare(b.name,'de'));
 return result;
}
export function summarizeOpponent(value,name,category='people'){
 const result={name,played:0,wins:0,draws:0,losses:0,currentStreak:0,longestStreak:0,best:null,average:null,winRate:null,recent:[]};
 let total=0;
 for(const game of orderedGames(value,category)){
  const own=game.players[game.ownPid];if(!own||game.mode==='solo')continue;
  game.players.forEach((other,pid)=>{
   if(pid===game.ownPid||sameName(other.name)!==sameName(name))return;
   if(!result.played)result.name=other.name;
   const difference=compare(own,other),outcome=difference>0?'win':difference<0?'loss':'draw';
   result.played++;total+=own.total;result.best=result.best===null?own.total:Math.max(result.best,own.total);
   if(outcome==='win'){result.wins++;result.currentStreak++;result.longestStreak=Math.max(result.longestStreak,result.currentStreak);}
   else{result[outcome==='draw'?'draws':'losses']++;result.currentStreak=0;}
   result.recent.unshift({date:game.date,boardId:game.boardId,mode:game.mode,score:own.total,opponentScore:other.hidden?null:other.total,jokers:own.jokers,opponentJokers:other.jokers,outcome});
   result.recent.length=Math.min(5,result.recent.length);
  });
 }
 if(result.played){result.average=Math.round(total/result.played*10)/10;result.winRate=Math.round(result.wins/result.played*100);}
 return result;
}
