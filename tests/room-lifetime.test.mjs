import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import {DatabaseSync} from 'node:sqlite';
import {pathToFileURL} from 'node:url';
import {createGame,findMove} from '../public/game/engine.js';
const origin='https://farbfeld.test',features=['hidden-scores-v1','boards-v1','reactions-v1'];
async function harness(t){
 let clock=1800000000000;const scheduled=[];t.mock.method(Date,'now',()=>clock);
 const sql=new DatabaseSync(':memory:');t.after(()=>sql.close());
 for(const file of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())sql.exec(fs.readFileSync('drizzle/'+file,'utf8'));
 const DB={prepare(query){let values=[];return {bind(...args){values=args;return this;},async first(){return sql.prepare(query).get(...values)||null;},async all(){return {results:sql.prepare(query).all(...values)};},async run(){return {meta:{changes:Number(sql.prepare(query).run(...values).changes)}};}};}};
 globalThis.__roomLifetimeEnv={DB};globalThis.__roomLifetimeWait=promise=>scheduled.push(promise);
 let source=fs.readFileSync('app/api/rooms/route.ts','utf8').replace("import { env,waitUntil } from 'cloudflare:workers';",'const env=globalThis.__roomLifetimeEnv;const waitUntil=globalThis.__roomLifetimeWait;');
 for(const file of ['engine','game-info','boards','reactions','room-status'])source=source.replace('../../../public/game/'+file+'.js',pathToFileURL(process.cwd()+'/public/game/'+file+'.js').href);
 for(const file of ['notifications','room-presence'])source=source.replace('../../../lib/'+file+'.js',pathToFileURL(process.cwd()+'/lib/'+file+'.js').href);
 const compiled=ts.transpileModule(source.replace('../../../lib/room-retention.js',pathToFileURL(process.cwd()+'/lib/room-retention.js').href),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
 const api=await import('data:text/javascript;base64,'+Buffer.from(compiled+'\n// '+crypto.randomUUID()).toString('base64'));
 const get=async(code,token)=>{const response=await api.GET(new Request(origin+'/api/rooms?code='+code,{headers:{'X-Player-Token':token,'X-Farbfeld-Features':features.join(',')}}));return {status:response.status,...await response.json()};};
 const post=async(action,session={},extra={})=>{const response=await api.POST(new Request(origin+'/api/rooms',{method:'POST',headers:{'Content-Type':'application/json',...(session.token?{'X-Player-Token':session.token}:{})},body:JSON.stringify({action,code:session.code,version:session.version,features,...extra})}));return {status:response.status,...await response.json()};};
 const seed=(code='LIFE2345',playing=true)=>{const room={members:[{id:'host',token:'fixture-host',name:'Host',features},{id:'guest',token:'fixture-guest',name:'Guest',features}],hostId:'host',roomName:'Unser fester Raum',createdAt:clock-8*86400000,lastActionAt:clock,boardId:'classic',game:playing?createGame(['Host','Guest'],'room',['host','guest']):null};if(room.game)room.game.gameId='retained-game';sql.prepare('INSERT INTO rooms(code,state,version,expires_at) VALUES(?,?,11,?)').run(code,JSON.stringify(room),clock-86400000);return room;};
 const state=code=>sql.prepare('SELECT * FROM rooms WHERE code = ?').get(code);
 return {sql,get,post,seed,state,scheduled,get now(){return clock;},advance:ms=>clock+=ms};
}
test('Laufende Bestands-Partie bleibt nach der alten Sieben-Tage-Grenze ohne Zustandsverlust erreichbar',async t=>{
 const h=await harness(t),code='LIFE2345';h.seed(code);const before=h.state(code);
 for(let i=0;i<3;i++){const data=await h.get(code,'fixture-host');assert.equal(data.status,200);assert.equal(data.game.gameId,'retained-game');assert.equal(data.presence.host,'online');}
 assert.deepEqual(h.state(code),before);assert.equal(h.scheduled.length,0);
 h.advance(400*86400000);const view=await h.get(code,'fixture-guest');assert.equal(view.status,200);assert.equal(view.game.round,1);assert.equal(view.version,11);assert.deepEqual(h.state(code),before);
});
test('Eine alte Lobby kann weiter beigetreten werden; fremde und entfernte Zugänge bleiben gesperrt',async t=>{
 const h=await harness(t),code='LOBB2345';h.seed(code,false);
 assert.equal((await h.get(code,'wrong')).status,403);assert.equal((await h.get('MISSING2','fixture-host')).status,404);
 assert.equal((await h.post('start',{code,token:'wrong',version:11})).status,403);
 const joined=await h.post('join',{code},{name:'Third'});assert.equal(joined.status,200);assert.equal(joined.members.length,3);assert.equal(joined.roomName,'Unser fester Raum');
 const removed=await h.post('remove',{code,token:'fixture-host',version:joined.version},{memberId:joined.playerId});assert.equal(removed.status,200);
 assert.equal((await h.get(code,joined.token)).status,403);assert.equal((await h.post('hello',{code,token:joined.token})).status,403);
});
test('Neue Räume haben eine Bereinigungsfrist, bleiben aber solange gespeichert wiederverwendbar',async t=>{
 const h=await harness(t),host=await h.post('create',{}, {name:'Host',roomName:'Dauerrunde'});assert.equal(host.status,200);assert.equal(h.state(host.code).expires_at,h.now+14*86400000);
 h.advance(366*86400000);const guest=await h.post('join',{code:host.code},{name:'Guest'});assert.equal(guest.status,200);
 const sessions=[host,guest].map(m=>({code:host.code,token:m.token}));let current=await h.post('start',{...sessions[0],version:guest.version});assert.equal(current.status,200);const gameId=current.game.gameId;
 for(let turns=0;current.game.status==='playing'&&turns<200;turns++){
  if(current.game.phase==='roll'){current=await h.post('roll',{...sessions[current.game.active],version:current.version});assert.equal(current.status,200);}
  const active=current.game.active;
  for(const pid of [active,1-active]){const previous=current.version,currentMove=findMove(current.game,pid)??{pass:true};current=await h.post('move',{...sessions[pid],version:previous},{move:currentMove});assert.equal(current.status,200);assert.equal((await h.post('move',{...sessions[pid],version:previous},{move:currentMove})).status,409);}
 }
 assert.equal(current.game.status,'finished');assert.equal((await h.post('rematch',{...sessions[1],version:current.version})).status,403);
 const lobby=await h.post('rematch',{...sessions[0],version:current.version});assert.equal(lobby.status,200);assert.equal(lobby.game,null);assert.equal(lobby.roomName,'Dauerrunde');assert.deepEqual(lobby.members,current.members);
 h.advance(366*86400000);const next=await h.post('start',{...sessions[0],version:lobby.version});assert.equal(next.status,200);assert.notEqual(next.game.gameId,gameId);assert.equal(next.roomName,'Dauerrunde');assert.deepEqual(next.members,lobby.members);assert.equal((await h.get(host.code,guest.token)).status,200);
});
