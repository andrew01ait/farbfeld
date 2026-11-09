import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,rollGame,applyMove,applyMineAttack,leaveGame,canAct,activePlayers,rankings,score,finishRound,blastNeighbors,validMineState,validLeavingState,FORFEIT_SCORE,MINE_FEATURE,LEAVE_FEATURE,bonusPoints,boardFor} from '../public/game/engine.js';
import {DirectGame,hostRecord,guestRecord,validRecord} from '../public/game/direct-game.js';
import {projectGame} from '../public/game/game-info.js';
import {mineDamage} from '../public/game/mine-ui.js';
import {mergeStats,summarizeStats,summarizeOpponent} from '../public/game/stats.js';
import {noticeForGame} from '../public/game/notification-policy.js';
function choosing(n=6,hidden=false){const g=createGame(Array.from({length:n},(_,i)=>'P'+i),'local',[],{mines:true,bonusFields:true,hiddenScores:hidden});g.phase='choose';g.dice={colors:['g','b','o'],numbers:[1,2,3]};g.mines.unlocked.fill(true);return g;}
function group(n=3,records=null){
 const queue=[],errors=[],saved=records?structuredClone(records):{},guests=new Map();
 const host=new DirectGame(records?.[0]||hostRecord('Host'),{save:r=>saved[0]=r,onError:e=>errors.push(e)});
 if(!records)for(let pid=2;pid<n;pid++)host.reserveGuest(pid);
 const flush=()=>{let count=0;while(queue.length){if(++count>1000)throw Error('message loop');const [receiver,message,pid]=queue.shift();receiver.receive(message,pid);}};
 for(let pid=1;pid<n;pid++){
  if(records?.[0].snapshot.game?.players[pid]?.left)continue;
  const snapshot=host.snapshot,offer={sessionId:snapshot.sessionId,secret:pid===1?host.record.secret:host.record.guestSecrets[pid],members:snapshot.members,pid};
  const guest=new DirectGame(records?.[pid]||guestRecord(offer,'Guest '+pid),{save:r=>saved[pid]=r,onError:e=>errors.push(e)});guests.set(pid,guest);
  host.attach(message=>queue.push([guest,message,1]),pid);guest.attach(message=>queue.push([host,message,pid]));flush();
 }
 return {host,guests,flush,saved,errors};
}
test('One six-player mine hits every active opponent independently, leaves the shooter intact and charges only once',()=>{
 const g=choosing(),target=52;g.players.forEach((p,pid)=>{if(pid!==2)p.marks[target]=true;blastNeighbors(target).forEach(i=>p.marks[i]=true);});const own=structuredClone(g.players[0]),empty=structuredClone(g.players[2]);
 const next=applyMineAttack(g,0,target,()=>0);assert.deepEqual(next.players[0],own);assert.deepEqual(next.players[2],empty);assert.equal(next.mines.lastBlast.targets.length,5);
 for(const hit of next.mines.lastBlast.targets){assert.equal(hit.cells.length,hit.pid===2?0:4);assert(!hit.cells.includes(target)||hit.pid!==2);}
 assert.equal(score(next.players[0],next).mineCost,5);assert.equal(next.turn,g.turn+1);assert(canAct(next,0));assert.throws(()=>applyMineAttack(next,0,target));assert(validMineState(next));
});
test('Colour completion unlocks every other participant and never the finder themselves',()=>{
 const g=createGame(['A','B','C','D'],'local',[],{mines:true});boardFor(g).cells.forEach((c,i)=>{if(c==='g')g.players[2].marks[i]=true;});finishRound(g);assert.deepEqual(g.mines.unlocked,[true,true,false,true]);
});
test('Hidden mine projections contain only the viewer’s damage and never another player’s completion ledger',()=>{
 const g=choosing(6,true);g.players.forEach(p=>{p.marks[52]=true;blastNeighbors(52).forEach(i=>p.marks[i]=true);});const next=applyMineAttack(g,0,52,()=>0);
 for(let pid=0;pid<6;pid++){
  const view=projectGame(next,pid);assert.equal(view.mines.columnRounds,undefined);assert.equal(view.mines.colorRounds,undefined);assert(validMineState(view,{allowProjection:true}));assert(!validMineState(view));
  assert(view.mines.lastBlast.targets.every(t=>t.pid===pid));assert.equal(view.mines.lastBlast.targets.length,pid===0?0:1);
  assert.equal(mineDamage(view,(pid+1)%6,pid),null);if(pid!==0)assert(mineDamage(view,pid,pid));
 }
});
test('Leaving before rolling or during a shared round preserves the remaining rotation and rejects future actions',()=>{
 for(const phase of ['roll','choose'])for(const pid of [0,1,5]){
  const original=createGame(['A','B','C','D','E','F'],'local',[],{mines:true,bonusFields:true});const g=phase==='choose'?rollGame(original,()=>0):original;const next=leaveGame(g,pid);
  assert.equal(next.status,'playing');assert.equal(next.players[pid].left,true);assert.equal(score(next.players[pid],next).total,-10);assert(validLeavingState(next));assert(!canAct(next,pid));assert.throws(()=>leaveGame(next,pid));assert.throws(()=>applyMove(next,pid,{pass:true}));
  if(phase==='roll')assert(!next.players[next.active].left);else{let round=next;for(const active of activePlayers(next))if(canAct(round,active))round=applyMove(round,active,{pass:true});assert.equal(round.round,2);assert(!round.players[round.active].left);}
 }
});
test('The sole remaining player wins even with a lower raw negative score than the quitter',()=>{
 let g=createGame(['A','B','C'],'room');g=leaveGame(g,0);assert.equal(g.status,'playing');g=leaveGame(g,1);
 assert.equal(g.status,'finished');assert.equal(g.finishReason,'last-player');assert.equal(g.active,2);assert.equal(rankings(g)[0].index,2);assert.equal(score(g.players[2],g).total,-22);assert.equal(score(g.players[0],g).total,FORFEIT_SCORE);assert.throws(()=>leaveGame(g,2));
 assert.equal(noticeForGame({...g,gameId:'ended'},0),null);assert.equal(noticeForGame({...g,gameId:'ended'},2).kind,'finished');
});
test('A departing guest no longer blocks direct readiness when disconnected; the saved match can resume',()=>{
 const p=group(6);assert(p.host.ready);p.host.act('options',{mines:true,bonusFields:true});p.flush();p.host.act('start');p.flush();p.guests.get(5).act('leave');p.flush();
 p.host.pause(5);p.flush();assert(p.host.ready);assert(p.guests.get(1).ready);assert(p.host.snapshot.game.players[5].left);
 const restored=group(6,p.saved);assert(restored.host.ready);assert(restored.host.snapshot.game.players[5].left);assert.equal(restored.guests.size,4);assert(validRecord(restored.saved[0]));
});
test('An offline host can forfeit as relay; remaining guests finish and the last one wins without changing authority',()=>{
 const p=group(3);p.host.act('start');p.flush();p.host.act('leave');p.flush();assert(p.host.ready);assert(p.host.snapshot.game.players[0].left);assert.equal(p.host.snapshot.game.active,1);
 p.guests.get(1).act('roll');p.flush();p.guests.get(1).act('move',{move:{pass:true}});p.flush();p.guests.get(2).act('move',{move:{pass:true}});p.flush();assert.equal(p.host.snapshot.game.round,2);
 p.guests.get(2).act('leave');p.flush();assert.equal(p.host.snapshot.game.status,'finished');assert.equal(rankings(p.host.snapshot.game)[0].index,1);assert.equal(p.host.pid,0);assert.equal(score(p.host.snapshot.game.players[0],p.host.snapshot.game).total,-10);
});
test('Loss of the offline relay pauses safely and reconnecting the original host retains the exact state',()=>{
 const p=group(3);p.host.act('start');p.flush();p.host.act('leave');p.flush();const before=JSON.stringify(p.host.snapshot.game);p.host.pause();p.guests.forEach(g=>g.pause());assert(!p.host.ready);assert.throws(()=>p.guests.get(1).act('roll'),/pausiert/);
 const resumed=group(3,p.saved);assert(resumed.host.ready);assert.equal(JSON.stringify(resumed.host.snapshot.game),before);assert.equal(JSON.stringify(resumed.guests.get(1).snapshot.game),before);
});
test('Direct mine actions are authenticated, applied once and projected without exposing hidden opponents',()=>{
 const p=group(3);p.host.act('options',{mines:true,hiddenScores:true,bonusFields:true});p.flush();p.host.act('start');p.flush();const g=p.host.record.snapshot.game;g.phase='choose';g.dice={colors:['g','b','o'],numbers:[1,2,3]};g.mines.unlocked.fill(true);g.players.forEach(player=>{player.marks[52]=true;blastNeighbors(52).forEach(i=>player.marks[i]=true);});p.host.broadcast();p.flush();
 const message=p.host.envelope('action',{action:'mine',target:52,gameId:g.gameId,round:g.round});p.host.apply(message,0,true);p.flush();const version=p.host.snapshot.version;p.host.apply(message,0,true);p.flush();assert.equal(p.host.snapshot.version,version);assert.equal(score(p.host.snapshot.game.players[0],p.host.snapshot.game).mineCost,5);assert.equal(p.host.snapshot.game.mines.lastBlast.targets.length,2);
 assert.deepEqual(p.guests.get(1).snapshot.game.mines.lastBlast.targets.map(t=>t.pid),[1]);assert.equal(p.guests.get(1).snapshot.game.bonuses.fields,undefined);
});
test('Immediate forfeit history is a loss, negative and deduplicated, without invented hidden opponent scores',()=>{
 const record={id:'forfeit-1',date:'2026-11-09T14:00:00Z',mode:'room',score:-10,ownPid:0,forfeit:true,players:[{name:'A',total:-10,jokers:8,left:true},{name:'B',hidden:true}]};
 const stats=mergeStats(null,[record,record]);assert.equal(stats.games.length,1);assert.equal(stats.games[0].score,-10);assert.equal(summarizeStats(stats).losses,1);assert.equal(summarizeStats(stats).wins,0);assert.equal(summarizeOpponent(stats,'B').recent[0].opponentScore,null);
});

test('Concurrent departures settle a shared bonus once and the last survivor cannot become a forfeit winner',()=>{
 let g=choosing(3,true);g.bonuses.fields=[7,8,9].map(index=>({index,claim:null,pending:[]}));g.dice={colors:['g','b','o'],numbers:[1,2,3]};
 g=applyMove(g,0,{ci:0,ni:0,cells:[7]});g=applyMove(g,1,{ci:0,ni:0,cells:[7]});g=leaveGame(g,0);assert.equal(g.status,'playing');g=leaveGame(g,1);
 assert.equal(g.status,'finished');assert.equal(g.round,1);assert.equal(bonusPoints(g,0),2);assert.equal(bonusPoints(g,1),2);assert.equal(rankings(g)[0].index,2);assert.equal(bonusPoints(g,2),0);
 const stats=mergeStats(null,[{id:'last-quitter',date:'2026-11-09T14:00:00Z',mode:'local',score:-10,ownPid:1,forfeit:true,players:g.players.map(p=>({name:p.name,jokers:p.jokers,total:score(p,g).total,left:!!p.left}))}]);assert.equal(summarizeStats(stats).wins,0);assert.equal(summarizeStats(stats).losses,1);
});
test('A later column holder inherits full points after all earlier opponents lose the column, without rewarding an unconfirmed completion',()=>{
 let g=choosing(4);g.round=4;g.players.forEach((p,pid)=>{for(let r=0;r<7;r++)p.marks[r*15+7]=true;p.columns[7]=pid===0?1:0;g.mines.columnRounds[pid][7]=pid===0?1:pid===1?2:3;});g.columnClaims[7]=1;g.active=1;
 // The shooter is the second chronological holder: all other holders lose H.
 g=applyMineAttack(g,1,52,()=>0);assert.equal(g.players[1].columns[7],1);assert.equal(g.columnClaims[7],2);
 // An empty centre for the shooter’s remaining rival cannot damage a surviving claim.
 g.players[2].marks[52]=true;for(let r=0;r<7;r++)g.players[2].marks[r*15+7]=true;g.players[2].columns[7]=0;g.mines.columnRounds[2][7]=3;
 g=leaveGame(g,1);assert.equal(g.players[2].columns[7],1);assert.equal(g.columnClaims[7],3);
});
test('Direct mines and departures reject another game at a matching version without mutation',()=>{
 const p=group(3);p.host.act('options',{mines:true});p.flush();p.host.act('start');p.flush();const g=p.host.snapshot.game;g.phase='choose';g.dice={colors:['g','b','o'],numbers:[1,2,3]};g.mines.unlocked.fill(true);
 const before=JSON.stringify(p.host.record);for(const action of ['mine','leave'])assert.throws(()=>p.host.apply(p.host.envelope('action',{action,target:52,gameId:'another-match',round:g.round}),0,true),/aktuelle/);assert.equal(JSON.stringify(p.host.record),before);
});

test('Tied surviving completion rounds share the full bonus after earlier holders leave',()=>{
 let g=choosing(4);g.round=4;g.players.forEach((p,pid)=>{for(let r=0;r<7;r++)p.marks[r*15+7]=true;p.columns[7]=pid===0?1:0;g.mines.columnRounds[pid][7]=pid===0?1:3;});g.columnClaims[7]=1;
 g=leaveGame(g,0);for(let pid=1;pid<4;pid++)assert.equal(g.players[pid].columns[7],1);assert.equal(g.columnClaims[7],3);
});

test('Malformed departed states cannot resume as an empty or single-player running group',()=>{
 assert.equal(validLeavingState({players:5}),false);let g=leaveGame(createGame(['A','B','C'],'local'),0);assert(validLeavingState(g));g.players[1].left=true;g.players[1].forfeit=-10;g.players[1].leftRound=1;assert.equal(validLeavingState(g),false);g.status='finished';g.finishReason='last-player';assert(validLeavingState(g));g.players[2].left=true;g.players[2].forfeit=-10;g.players[2].leftRound=1;assert.equal(validLeavingState(g),false);
});
