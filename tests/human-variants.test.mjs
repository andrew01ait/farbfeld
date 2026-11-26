import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,rollGame,applyMove,leaveGame,findMove,score,boardFor,canAct,applyMineAttack} from '../public/game/engine.js';
import {enableVariants,normalizeVariantOptions,validVariantState,applyFleetAction,confirmHumanFleet,battlePreparing,abilityCharges,objectivePoints,VARIANTS_FEATURE} from '../public/game/variants.js';
import {projectGame} from '../public/game/game-info.js';
import {DirectGame,hostRecord,guestRecord,validRecord} from '../public/game/direct-game.js';
import {nextLocalPlayer,turnDescription} from '../public/game/view-state.js';
import {homeRoomStatus} from '../public/game/room-status.js';
import {noticeForGame} from '../public/game/notification-policy.js';
import {cellVariantHTML,cellVariantLabel,battlePanelHTML,abilitiesHTML} from '../public/game/variant-ui.js';
const all={battleship:true,discovery:true,objectives:true,shuffle:true};
const seeded=seed=>max=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%max;};
const fresh=(n=2,mode='local',variants=all,hiddenScores=false)=>createGame(Array.from({length:n},(_,i)=>'Person '+i),mode,[],{variants,hiddenScores,mines:true,bonusFields:true});
function group(n=2,{records=null,legacy=false}={}){
 const queue=[],errors=[],saved=records?structuredClone(records):{},guests=new Map(),wire=[];
 const host=new DirectGame(records?.[0]||hostRecord('Host'),{save:r=>saved[0]=r,onError:e=>errors.push(e),rng:seeded(71)});
 if(!records)for(let pid=2;pid<n;pid++)host.reserveGuest(pid);
 const flush=()=>{let count=0;while(queue.length){if(++count>1500)throw Error('message loop');const [receiver,message,pid]=queue.shift();receiver.receive(message,pid);}};
 let dropping=false;
 for(let pid=1;pid<n;pid++){
  const s=host.snapshot,guest=new DirectGame(records?.[pid]||guestRecord({sessionId:s.sessionId,secret:pid===1?host.record.secret:host.record.guestSecrets[pid],members:s.members,pid},'Guest '+pid),{save:r=>saved[pid]=r,onError:e=>errors.push(e)});guests.set(pid,guest);
  host.attach(message=>{wire.push({pid,message:JSON.parse(message)});if(!dropping)queue.push([guest,message,1]);},pid);
  guest.attach(message=>{if(legacy){const m=JSON.parse(message);if(m.type==='hello'){m.payload.features=m.payload.features.filter(x=>x!==VARIANTS_FEATURE);message=JSON.stringify(m);}}queue.push([host,message,pid]);});flush();
 }
 return {host,guests,flush,errors,saved,wire,dropHost:value=>{dropping=value;}};
}
function step(p,pid,action,payload={}){(pid===0?p.host:p.guests.get(pid)).act(action,payload);p.flush();}

test('Every approved multiplayer size/mode validates its combinations; ships are strictly a duel and solo stays unchanged',()=>{
 for(const mode of ['local','room','direct'])for(let n=2;n<=6;n++)for(let mask=0;mask<16;mask++){
  const options=Object.fromEntries(Object.keys(all).map((k,i)=>[k,!!(mask&1<<i)]));
  if(n!==2&&options.battleship){assert.throws(()=>fresh(n,mode,options),/genau zwei/);continue;}
  const g=fresh(n,mode,options);assert.ok(validVariantState(g));assert.ok(validVariantState(JSON.parse(JSON.stringify(g))));
  if(mask&&options.objectives)assert.equal(g.variants.objectives.tasks[0].claims.length,n);
  if(options.shuffle)assert.equal(g.variants.layouts.length,n);
 }
 assert.throws(()=>createGame(['Du'],'solo',[],{variants:all}),/zwei bis sechs/);
 for(const value of [null,[],{battleship:'true'},{unknown:true}])assert.throws(()=>normalizeVariantOptions(value));
});
test('Both humans place only their own fleet, freeze it independently and the local handover follows unconfirmed fleets',()=>{
 let g=fresh();assert.equal(nextLocalPlayer(g),0);assert.deepEqual(g.variants.battleship.ready,[false,false]);assert.throws(()=>rollGame(g));
 g=confirmHumanFleet(g,0);assert.equal(nextLocalPlayer(g),1);assert.throws(()=>applyFleetAction(g,0,{kind:'random'},seeded(1)));const fixed=structuredClone(g.variants.battleship.fleets[0]);
 g=applyFleetAction(g,1,{kind:'random'},seeded(2));assert.deepEqual(g.variants.battleship.fleets[0],fixed);g=confirmHumanFleet(g,1);assert.equal(battlePreparing(g),false);assert.equal(nextLocalPlayer(g),0);assert.doesNotThrow(()=>rollGame(g));assert.ok(validVariantState(g));
});
test('Each authenticated viewer receives only their own fleet, hidden layout and pending objective; finished matches reveal consistently',()=>{
 for(const hidden of [false,true]){
  let g=fresh(2,'room',all,hidden);g=confirmHumanFleet(confirmHumanFleet(g,0),1);g.round=5;g.variants.objectives.tasks[0].pending=[5,5];
  for(let pid=0;pid<2;pid++){const water=Array.from({length:105},(_,i)=>i).find(i=>!g.variants.battleship.fleets[1-pid].flat().includes(i));g.variants.battleship.shots[pid][water]=1;}
  g.variants.battleship.lastVolley={id:'2:1',by:1,round:5,results:[{index:g.variants.battleship.shots[1].indexOf(1),hit:false}],sunk:[]};
  for(const own of [0,1]){
   const view=projectGame(g,own);assert.deepEqual(view.variants.battleship.fleets[own],g.variants.battleship.fleets[own]);assert.equal(view.variants.battleship.fleets[1-own],null);assert.equal(view.variants.objectives.tasks[0].pending[1-own],null);assert.equal(view.variants.objectives.tasks[0].pending[own],5);
   if(hidden){assert.equal(view.variants.battleship.shots[1-own].includes(1),false);if(own===0)assert.equal(view.variants.battleship.lastVolley,null);}assert.equal(view.variants.battleship.shots[own].includes(1),true);
   assert.equal(view.variants.viewer,own);assert.ok(validVariantState(view,{allowProjection:true}));assert.equal(validVariantState(view),false);assert.equal(g.variants.battleship.fleets[1-own].length,5);
   if(hidden){assert.equal(view.variants.layouts[1-own],null);assert.equal(view.players[1-own].marks,undefined);}
   assert.throws(()=>rollGame(view));assert.throws(()=>leaveGame(view,own));
  }
  g.status='finished';g.phase='finished';for(const own of [0,1]){const view=projectGame(g,own);assert.deepEqual(view.variants.battleship.fleets,g.variants.battleship.fleets);assert.ok(validVariantState(view,{allowProjection:true}));assert.equal(score(view.players[own],view).total,score(g.players[own],g).total);}
 }
});
test('Six-player discovery stays globally exclusive and inclusive objective race settles every first-round tie, including seat six',()=>{
 let g=fresh(6,'room',{discovery:true,objectives:true,shuffle:true});g.round=12;g.phase='choose';g.dice={colors:['g','g','o'],numbers:[1,1,3]};g.variants.discovery.fields.forEach((f,i)=>f.index=[7,22,37,52,67,82][i]);
 const t=g.variants.objectives.tasks[0];Object.assign(t,{type:'stars',target:1,deadline:12});
 for(let pid=0;pid<6;pid++){g=applyMove(g,pid,{ci:pid===0?0:1,ni:pid===0?0:1,cells:[7]},seeded(2));assert.equal(g.variants.discovery.fields[0].owner,0);if(pid<5)assert.equal(objectivePoints(g,pid),0);}
 assert.equal(g.round,13);for(let pid=0;pid<6;pid++)assert.equal(objectivePoints(g,pid),5);assert.equal(abilityCharges(g,0,g.variants.discovery.fields[0].type).length>=1,true);assert.equal(abilityCharges(g,5,g.variants.discovery.fields[0].type).length,0);assert.ok(validVariantState(g));
});
test('Seat two renders its fleet, attacks and abilities while target rendering never reads an unknown enemy fleet',()=>{
 let g=fresh();g=confirmHumanFleet(confirmHumanFleet(g,0),1);const ownCell=g.variants.battleship.fleets[1][0][0];
 const f=g.variants.discovery.fields[0];f.owner=1;f.round=1;g.round=2;
 assert.match(cellVariantHTML(g,1,ownCell,1),/own-ship/);assert.match(cellVariantLabel(g,1,ownCell,1),/eigenes Schiff/);assert.match(abilitiesHTML(g,1,{},true),/Farbwahl/);
 Object.defineProperty(g.variants.battleship.fleets,0,{get(){throw Error('unseen opponent fleet');}});
 assert.doesNotThrow(()=>battlePanelHTML(g,{own:1}));assert.doesNotThrow(()=>cellVariantHTML(g,0,ownCell,1));assert.equal(cellVariantHTML(g,0,ownCell,1).includes('own-ship'),false);
});
test('Fleet placement is a real own turn for both people; confirming suppresses that placement prompt until both are ready',()=>{
 const g=fresh(2,'room');g.gameId='placement';for(const own of [0,1]){assert.equal(homeRoomStatus(g,g.players[own].id).kind,'turn');assert.match(noticeForGame(g,own).body,/Flotte/);assert.ok(turnDescription(g,own).indices.includes(own));}
 const next=confirmHumanFleet(g,0);assert.equal(homeRoomStatus(next,next.players[0].id).kind,'waiting');assert.equal(noticeForGame(next,0),null);assert.equal(noticeForGame(next,1).kind,'turn');
 const finished=leaveGame(next,0);assert.equal(finished.status,'finished');assert.ok(validVariantState(finished));
});
test('Direct variants require real hello support; local host flags cannot claim an old guest understands them',()=>{
 const p=group(2,{legacy:true});assert.equal(p.host.supportsVariants,false);const before=structuredClone(p.host.snapshot);assert.throws(()=>p.host.act('options',{variants:all}),/1.21.0/);assert.deepEqual(p.host.snapshot,before);
 p.host.record.snapshot.variants=all;assert.throws(()=>p.host.act('start'),/1.21.0/);
});
test('Direct fleet commands bind to authenticated seats, reject stale matches, deduplicate and never transmit the enemy fleet',()=>{
 const p=group();step(p,0,'options',{variants:all,mines:true,bonusFields:true,hiddenScores:true});step(p,0,'start');assert.throws(()=>p.host.act('roll'));
 const g=p.host.snapshot.game,first=structuredClone(g.variants.battleship.fleets[0]);step(p,1,'fleet',{pid:0,fleet:{kind:'random'}});assert.deepEqual(p.host.snapshot.game.variants.battleship.fleets[0],first);assert.deepEqual(p.host.snapshot.game.variants.battleship.ready,[false,false]);
 const version=p.host.snapshot.version,bad=p.guests.get(1).envelope('action',{action:'fleet',fleet:{kind:'ready'},gameId:'foreign',round:1});p.host.receive(JSON.stringify(bad));p.flush();assert.equal(p.host.snapshot.version,version);assert.match(p.errors.pop(),/aktuellen Partie/);
 const command=p.guests.get(1).envelope('action',{action:'fleet',fleet:{kind:'ready'},gameId:g.gameId,round:1});p.host.receive(JSON.stringify(command));p.flush();const settled=p.host.snapshot.version;p.host.receive(JSON.stringify(command));p.flush();assert.equal(p.host.snapshot.version,settled);assert.deepEqual(p.host.snapshot.game.variants.battleship.ready,[false,true]);
 step(p,0,'fleet',{fleet:{kind:'ready'}});step(p,0,'roll');step(p,0,'move',{move:findMove(projectGame(p.host.snapshot.game,0),0)||{pass:true}});step(p,1,'move',{move:findMove(p.guests.get(1).snapshot.game,1)||{pass:true}});assert.equal(p.host.snapshot.game.round,2);
 for(const {pid,message} of p.wire)if(message.payload.snapshot?.game){const v=message.payload.snapshot.game.variants;assert.equal(v.battleship.fleets[1-pid],null);assert.equal(v.layouts[1-pid],null);assert.equal(v.viewer,pid);}
 assert.ok(validRecord(p.saved[0]));assert.ok(validRecord(p.saved[1]));const resumed=group(2,{records:p.saved});assert.equal(resumed.host.snapshot.game.round,2);assert.deepEqual(resumed.guests.get(1).snapshot.game,projectGame(resumed.host.snapshot.game,1));
});
test('A lost direct fleet acknowledgement survives restart without randomizing or confirming twice',()=>{
 const p=group();step(p,0,'options',{variants:all});step(p,0,'start');p.dropHost(true);step(p,1,'fleet',{fleet:{kind:'ready'}});assert.ok(p.guests.get(1).pending);const version=p.host.snapshot.version,fleet=structuredClone(p.host.snapshot.game.variants.battleship.fleets[1]);
 const resumed=group(2,{records:p.saved});assert.equal(resumed.guests.get(1).pending,null);assert.equal(resumed.host.snapshot.version,version);assert.deepEqual(resumed.host.snapshot.game.variants.battleship.fleets[1],fleet);assert.deepEqual(resumed.errors,[]);
});
test('Six direct humans share all other variants, simultaneous same-round moves and saved projections through mixing',()=>{
 const p=group(6);assert.throws(()=>p.host.act('options',{variants:all}),/genau zwei/);step(p,0,'options',{variants:{discovery:true,objectives:true,shuffle:true},mines:true,bonusFields:true,hiddenScores:true});step(p,0,'start');
 for(let round=1;round<=6;round++){const g=p.host.snapshot.game,active=g.active;step(p,active,'roll');step(p,active,'move',{move:findMove(projectGame(p.host.snapshot.game,active),active)||{pass:true}});for(let pid=0;pid<6;pid++)if(pid!==active)(pid===0?p.host:p.guests.get(pid)).act('move',{move:findMove(projectGame(p.host.snapshot.game,pid),pid)||{pass:true}});p.flush();assert.equal(p.host.snapshot.game.round,round+1);for(let pid=1;pid<6;pid++){assert.ok(validRecord(p.saved[pid]));assert.deepEqual(p.guests.get(pid).snapshot.game,projectGame(p.host.snapshot.game,pid));}}
 assert.equal(p.host.snapshot.game.variants.mixing.lastRound,5);assert.deepEqual(p.errors,[]);const restored=group(6,{records:p.saved});assert.equal(restored.host.snapshot.game.round,7);assert.equal(restored.host.ready,true);
});
