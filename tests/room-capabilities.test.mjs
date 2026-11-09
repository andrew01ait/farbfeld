import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import {DatabaseSync} from 'node:sqlite';
import {pathToFileURL} from 'node:url';
import {createGame,rollGame} from '../public/game/engine.js';
const all=['hidden-scores-v1','boards-v1','reactions-v1'],old=['hidden-scores-v1'];
const origin='https://farbfeld.test',code='ABCD2345';
async function harness(t){
 const sql=new DatabaseSync(':memory:');t.after(()=>sql.close());
 for(const file of fs.readdirSync('drizzle').filter(file=>file.endsWith('.sql')).sort())sql.exec(fs.readFileSync('drizzle/'+file,'utf8'));
 let beforeSave=null,writes=0;const scheduled=[];
 const DB={prepare(query){let values=[];return {bind(...args){values=args;return this;},async first(){return sql.prepare(query).get(...values)||null;},async all(){return {results:sql.prepare(query).all(...values)};},async run(){if(query.startsWith('UPDATE rooms SET state')){writes++;beforeSave?.();}return {meta:{changes:Number(sql.prepare(query).run(...values).changes)}};}};}};
 globalThis.__capabilitiesEnv={DB};globalThis.__capabilitiesWait=promise=>scheduled.push(promise);
 let source=fs.readFileSync('app/api/rooms/route.ts','utf8').replace("import { env,waitUntil } from 'cloudflare:workers';",'const env=globalThis.__capabilitiesEnv;const waitUntil=globalThis.__capabilitiesWait;');
 for(const file of ['engine','game-info','boards','reactions','room-status'])source=source.replace('../../../public/game/'+file+'.js',pathToFileURL(process.cwd()+'/public/game/'+file+'.js').href);
 source=source.replace('../../../lib/notifications.js',pathToFileURL(process.cwd()+'/lib/notifications.js').href);
 source=source.replace('../../../lib/room-presence.js',pathToFileURL(process.cwd()+'/lib/room-presence.js').href);
 const compiled=ts.transpileModule(source.replace('../../../lib/room-retention.js',pathToFileURL(process.cwd()+'/lib/room-retention.js').href),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
 const api=await import('data:text/javascript;base64,'+Buffer.from(compiled+'\n// '+crypto.randomUUID()).toString('base64'));
 const room={members:[{id:'host',token:'fixture-host',name:'Robin',features:all},{id:'guest',token:'fixture-guest',name:'Bea',features:old}],hostId:'host',roomName:'Bestandsraum',createdAt:Date.now()-6*86400000,boardId:'classic',game:null};
 sql.prepare('INSERT INTO rooms(code,state,version,expires_at) VALUES(?,?,11,?)').run(code,JSON.stringify(room),Date.now()+86400000);
 const state=()=>{const row=sql.prepare('SELECT state,version FROM rooms WHERE code = ?').get(code);return {...row,room:JSON.parse(row.state)};};
 const get=async(token='fixture-guest',features=all)=>{const response=await api.GET(new Request(origin+'/api/rooms?code='+code,{headers:{...(token?{'X-Player-Token':token}:{}),...(features===null?{}:{'X-Farbfeld-Features':features.join(',')})}}));return {status:response.status,data:await response.json()};};
 const post=async(action,version,extra={})=>{const response=await api.POST(new Request(origin+'/api/rooms',{method:'POST',headers:{'Content-Type':'application/json','X-Player-Token':'fixture-host'},body:JSON.stringify({action,code,version,features:all,...extra})}));return {status:response.status,data:await response.json()};};
 return {sql,room,state,get,post,scheduled,setBeforeSave:fn=>beforeSave=fn,get writes(){return writes;}};
}
test('Alter Raum: normaler Abruf aus aktualisiertem Gästeclient schaltet Bretter für alle frei, auch ohne hello',async t=>{
 const h=await harness(t),before=h.state();
 assert.equal((await h.get('fixture-host')).data.supportsBoards,false);
 const updated=await h.get();assert.equal(updated.status,200);assert.equal(updated.data.supportsBoards,true);assert.deepEqual(updated.data.boardUpdateNeeded,[]);assert.equal(updated.data.version,12);
 assert.equal((await h.get('fixture-host')).data.supportsBoards,true);
 const after=h.state();assert.deepEqual(after.room.members[1].features,all);assert.equal(after.room.createdAt,before.room.createdAt);assert.equal(after.room.roomName,'Bestandsraum');assert.equal(after.room.game,null);assert.equal(after.room.members[1].token,before.room.members[1].token);
 assert.equal((await h.get()).data.version,12);assert.equal(h.writes,1);assert.equal(h.scheduled.length,0);
 const options=await h.post('options',12,{boardId:'river'});assert.equal(options.status,200);assert.equal(options.data.boardId,'river');assert.equal(h.scheduled.length,0);
});
test('Brettprüfung autorisiert nur den eigenen Zugang; unbekannte Fähigkeiten und fremde Tokens geben niemanden frei',async t=>{
 const h=await harness(t);
 assert.equal((await h.get('wrong')).status,403);assert.equal((await h.get('')).status,403);assert.equal(h.writes,0);
 assert.deepEqual((await h.get('fixture-host')).data.boardUpdateNeeded,['Bea']);
 const unknown=await h.get('fixture-guest',[...old,'future-unsupported']);assert.equal(unknown.data.supportsBoards,false);assert.equal(h.writes,0);
 const legacy=await h.get('fixture-host',null);assert.equal(legacy.status,200);assert.deepEqual(h.state().room.members[0].features,all);assert.equal(h.writes,0);
 const upgraded=await h.get();assert.equal(upgraded.data.supportsBoards,true);
 const downgraded=await h.get('fixture-guest',old);assert.equal(downgraded.data.supportsBoards,false);assert.deepEqual(downgraded.data.boardUpdateNeeded,['Bea']);assert.equal(downgraded.data.version,13);
 assert.equal(h.scheduled.length,0);assert(!JSON.stringify(downgraded.data).includes('fixture-guest'));
});
test('Paralleler Spielzug und Raumname bleiben beim Wiederholen einer Fähigkeitsregistrierung erhalten',async t=>{
 const h=await harness(t),game=createGame(['Robin','Bea'],'room',['host','guest']);game.gameId='capability-race';
 h.room.game=game;h.sql.prepare('UPDATE rooms SET state = ? WHERE code = ?').run(JSON.stringify(h.room),code);
 const rolled=rollGame(game);let once=true;
 h.setBeforeSave(()=>{if(!once)return;once=false;const latest=h.state().room;latest.game=rolled;latest.roomName='Parallel geändert';h.sql.prepare('UPDATE rooms SET state = ?, version = version + 1 WHERE code = ?').run(JSON.stringify(latest),code);});
 const result=await h.get();assert.equal(result.status,200);assert.equal(result.data.version,13);assert.equal(result.data.supportsBoards,true);assert.equal(result.data.roomName,'Parallel geändert');assert.deepEqual(result.data.game,rolled);assert.deepEqual(h.state().room.game,rolled);assert.equal(h.writes,2);assert.equal(h.scheduled.length,0);
});
test('Gleichzeitig entfernter Gast wird durch eine erneute Registrierung nicht wieder eingesetzt',async t=>{
 const h=await harness(t);let once=true;
 h.setBeforeSave(()=>{if(!once)return;once=false;const latest=h.state().room;latest.members=latest.members.filter(m=>m.id!=='guest');h.sql.prepare('UPDATE rooms SET state = ?, version = version + 1 WHERE code = ?').run(JSON.stringify(latest),code);});
 const result=await h.get();assert.equal(result.status,403);assert.equal(h.state().room.members.length,1);assert.equal(h.state().version,12);assert.equal(h.writes,1);
});
test('Dauernder Versionskonflikt bleibt begrenzt; fehlende Räume ändern keine Fähigkeiten',async t=>{
 const h=await harness(t);h.setBeforeSave(()=>h.sql.prepare('UPDATE rooms SET version = version + 1 WHERE code = ?').run(code));
 assert.equal((await h.get()).status,409);assert.equal(h.writes,3);assert.deepEqual(h.state().room.members[1].features,old);
 h.sql.prepare('DELETE FROM rooms WHERE code = ?').run(code);
 assert.equal((await h.get()).status,404);assert.equal(h.writes,3);
});
test('Laufende Varianten prüfen die tatsächliche Unterstützung weiter und ändern beim Aktualisieren keine Felder',async t=>{
 const h=await harness(t);h.room.members[1].features=all;h.room.boardId='river';h.room.game=createGame(['Robin','Bea'],'room',['host','guest'],{boardId:'river'});h.room.game.gameId='existing-river';
 h.sql.prepare('UPDATE rooms SET state = ? WHERE code = ?').run(JSON.stringify(h.room),code);
 const oldClient=await h.get('fixture-guest',old);assert.equal(oldClient.status,409);assert.match(oldClient.data.error,/1\.6\.0/);assert.deepEqual(h.state().room.game,h.room.game);assert.deepEqual(h.state().room.members[1].features,old);
 const currentClient=await h.get();assert.equal(currentClient.status,200);assert.equal(currentClient.data.game.boardId,'river');assert.deepEqual(h.state().room.game,h.room.game);assert.equal(h.scheduled.length,0);
});
