import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DirectSession} from '../public/game/direct.js';
import {DirectGame,hostRecord,guestRecord} from '../public/game/direct-game.js';
import {createGame} from '../public/game/engine.js';

const app=readFileSync(new URL('../public/game/app.js',import.meta.url),'utf8');
const code=app.slice(app.indexOf('function requestDiscardDirect('),app.indexOf('\nasync function confirmLeaveGame('));
function fixture(pid=0,n=2,{storageFailure=false}={}){
 const owner=new DirectGame(hostRecord('Robin','Sofa-Runde'));for(let i=2;i<n;i++)owner.reserveGuest(i);
 owner.snapshot.members.forEach((m,i)=>m.name='Person '+i);owner.snapshot.game=createGame(owner.snapshot.members.map(m=>m.name),'direct',owner.snapshot.members.map(m=>m.id));owner.snapshot.game.gameId='current-game';
 const record=pid===0?owner.record:guestRecord({sessionId:owner.snapshot.sessionId,secret:pid===1?owner.record.secret:owner.record.guestSecrets[pid],members:owner.snapshot.members,pid},'Person '+pid);
 if(pid!==0)record.snapshot=structuredClone(owner.snapshot);
 let stored=structuredClone(record),requests=0;const unrelated={solo:{round:8},rooms:['ONLINE01'],statistics:{wins:4}},before=structuredClone(unrelated);
 const direct=new DirectSession({saved:record,version:'1.19.3',save:r=>{if(r===null&&storageFailure)return false;stored=structuredClone(r);return true;},fetcher:()=>{requests++;throw Error('offline');}}),panels=[],toasts=[];
 const controller=Function('direct','openModal','toast','directUi','resetSelection','closeModal','render','window','currentGame','myPid','esc',
  'let screen="direct",inspectPid=null,handover=false,discardDirectRequest=null,pendingLeave=null,abortRequest=null;'+code+';return {requestDiscardDirect,confirmDiscardDirect,requestLeaveGame,get screen(){return screen;}};')
  (direct,(title,html,panel)=>panels.push({title,html,panel}),s=>toasts.push(s),{cancelUi(){}},()=>{},()=>{},()=>{},{scrollTo(){}},()=>direct.snapshot?.game,()=>direct.pid,s=>String(s));
 return {direct,controller,panels,toasts,unrelated,before,get stored(){return stored;},get requests(){return requests;},dispose(){direct.dispose();}};
}

for(const n of [2,6])for(const pid of [0,1])test('Paused '+n+'-phone direct match can be discarded locally by player '+pid+' without re-pairing',()=>{
 const f=fixture(pid,n);try{
  const original=structuredClone(f.direct.snapshot);f.controller.requestLeaveGame();assert.equal(f.panels.at(-1).panel,'direct-end');assert.match(f.panels.at(-1).html,/data-action="discard-direct-local"/);
  f.controller.requestDiscardDirect(true);assert.equal(f.panels.at(-1).panel,'discard-direct');assert.match(f.panels.at(-1).html,/Andere Handys behalten/);assert.deepEqual(f.direct.snapshot,original);assert(f.stored);
  f.controller.confirmDiscardDirect();assert.equal(f.stored,null);assert.equal(f.direct.saved,null);assert.equal(f.controller.screen,'home');assert.equal(f.requests,0);assert.deepEqual(f.unrelated,f.before);assert.deepEqual(original.game.players.map(p=>p.left),Array(n).fill(undefined));
 }finally{f.dispose();}
});

test('Stale discard confirmation reopens for the current session without deleting a replacement match',()=>{
 const f=fixture();try{
  f.controller.requestDiscardDirect(true);f.direct.manager.record.snapshot.game.gameId='replacement-game';f.controller.confirmDiscardDirect();assert.equal(f.direct.snapshot.game.gameId,'replacement-game');assert.equal(f.panels.at(-1).panel,'discard-direct');assert(f.stored);
  f.direct.generation++;f.controller.confirmDiscardDirect();assert(f.stored);assert.equal(f.direct.snapshot.game.gameId,'replacement-game');
 }finally{f.dispose();}
});

for(const pid of [0,1])test('Failed local removal keeps saved direct access and current game, player '+pid,()=>{
 const f=fixture(pid,2,{storageFailure:true});try{
  const before=structuredClone(f.direct.snapshot);f.controller.requestDiscardDirect(true);assert.throws(()=>f.controller.confirmDiscardDirect(),/Gerätespeicher/);assert.deepEqual(f.direct.snapshot,before);assert(f.stored);assert.equal(f.controller.screen,'direct');assert.equal(f.requests,0);
 }finally{f.dispose();}
});

for(const pid of [0,1])test('Connected leaving keeps the shared forfeit and an independent local-discard choice, player '+pid,()=>{
 const f=fixture(pid);try{
  f.direct.manager.ready=true;f.controller.requestLeaveGame();assert.equal(f.panels.at(-1).panel,'leave-game');assert.match(f.panels.at(-1).html,/Verlassen · −10 Punkte/);assert.match(f.panels.at(-1).html,/data-action="discard-direct-local"/);
  f.direct.manager.record.pending={actionId:'unconfirmed-move'};f.controller.requestDiscardDirect(true);f.controller.confirmDiscardDirect();assert.equal(f.stored,null);assert.equal(f.requests,0);assert.deepEqual(f.unrelated,f.before);
 }finally{f.dispose();}
});
