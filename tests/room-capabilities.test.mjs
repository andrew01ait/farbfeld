import {RANDOM_BOARD_FEATURE,boardFor} from '../public/game/boards.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import {DatabaseSync} from 'node:sqlite';
import {pathToFileURL} from 'node:url';
import {createGame,rollGame,BONUS_FEATURE,bonusPoints,MINE_FEATURE,LEAVE_FEATURE,rankings,score} from '../public/game/engine.js';
const all=['hidden-scores-v1','boards-v1','reactions-v1',BONUS_FEATURE,RANDOM_BOARD_FEATURE,MINE_FEATURE,LEAVE_FEATURE],old=['hidden-scores-v1'];
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
 return {sql,room,state,get,post,api,scheduled,setBeforeSave:fn=>beforeSave=fn,get writes(){return writes;}};
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

test('Bonusfelder: nur Gastgeber, Lobby und bestätigte aktuelle Apps dürfen die Startregel ändern',async t=>{
 const h=await harness(t);assert.equal((await h.post('options',11,{bonusFields:true})).status,409);assert.equal(h.state().room.bonusFields,undefined);
 const refreshed=await h.get();assert.equal(refreshed.data.supportsBonusFields,true);assert.deepEqual(refreshed.data.bonusUpdateNeeded,[]);
 const version=h.state().version,guest=await h.api.POST(new Request(origin+'/api/rooms',{method:'POST',headers:{'Content-Type':'application/json','X-Player-Token':'fixture-guest'},body:JSON.stringify({action:'options',code,version,features:all,bonusFields:true})}));assert.equal(guest.status,403);
 const enabled=await h.post('options',version,{bonusFields:true});assert.equal(enabled.status,200);assert.equal(enabled.data.bonusFields,true);
 const started=await h.post('start',enabled.data.version);assert.equal(started.status,200);assert.equal(started.data.game.bonuses.fields,undefined);assert.equal(h.state().room.game.bonuses.fields.length,3);
 assert.equal((await h.post('options',started.data.version,{bonusFields:false})).status,409);
 const before=h.state().room.game;assert.equal((await h.get('fixture-guest',old)).status,409);assert.deepEqual(h.state().room.game,before);assert.equal((await h.get()).status,200);
});
test('Raum-Bonuswertung teilt erste Rundentreffer, lässt keine Positionen durchsickern und ändert keine Push-Regeln',async t=>{
 const h=await harness(t);await h.get();let result=await h.post('options',h.state().version,{bonusFields:true});result=await h.post('start',result.data.version);
 const raw=h.state().room;raw.game.phase='choose';raw.game.dice={colors:['g','b','o'],numbers:[1,2,3]};raw.game.bonuses.fields=[7,8,9].map(index=>({index,claim:null,pending:[]}));h.sql.prepare('UPDATE rooms SET state = ? WHERE code = ?').run(JSON.stringify(raw),code);
 result=await h.post('move',h.state().version,{move:{ci:0,ni:0,cells:[7]}});assert.equal(result.status,200);assert.deepEqual(result.data.game.bonuses,{schema:1,enabled:true,awards:[],remaining:3});
 const response=await h.api.POST(new Request(origin+'/api/rooms',{method:'POST',headers:{'Content-Type':'application/json','X-Player-Token':'fixture-guest'},body:JSON.stringify({action:'move',code,version:result.data.version,features:all,move:{ci:0,ni:0,cells:[7]}})}));assert.equal(response.status,200);const shared=await response.json();
 assert.equal(shared.game.bonuses.fields,undefined);assert.deepEqual(shared.game.bonuses.awards,[{slot:0,round:1,winners:[0,1]}]);assert.equal(bonusPoints(shared.game,0),2);assert.equal(bonusPoints(shared.game,1),2);assert.equal(bonusPoints(h.state().room.game,0),2);
 assert(!JSON.stringify(shared.game.bonuses).includes('index'));assert(!JSON.stringify(shared.game.bonuses).includes('pending'));
 await Promise.allSettled(h.scheduled);
});

test('Random: Server erzeugt einen gemeinsamen gespeicherten Plan und verlangt passende Apps',async t=>{
 const h=await harness(t);assert.equal((await h.post('options',11,{boardId:'random'})).status,409);await h.get();
 let response=await h.post('options',h.state().version,{boardId:'random',bonusFields:true});assert.equal(response.status,200);response=await h.post('start',response.data.version);assert.equal(response.status,200);
 const persisted=h.state().room.game;assert.equal(persisted.boardId,'random');assert.deepEqual(response.data.game.boardLayout,persisted.boardLayout);assert.equal(response.data.game.bonuses.fields,undefined);
 const guest=await h.get();assert.deepEqual(guest.data.game.boardLayout,persisted.boardLayout);assert.deepEqual(boardFor(guest.data.game).cells,boardFor(persisted).cells);
 const older=all.filter(f=>f!==RANDOM_BOARD_FEATURE);assert.equal((await h.get('fixture-guest',older)).status,409);assert.deepEqual(h.state().room.game,persisted);
});

test('Raum-Gastgeber verlässt: Rolle wandert weiter, ein letzter Spieler gewinnt und alte Zugänge werden zur Revanche entfernt',async t=>{
 const h=await harness(t);await h.get();const room=h.state().room;room.members.push({id:'third',token:'fixture-third',name:'Third',features:all});h.sql.prepare('UPDATE rooms SET state = ? WHERE code = ?').run(JSON.stringify(room),code);
 let response=await h.post('start',h.state().version);assert.equal(response.status,200);const gameId=response.data.game.gameId;
 response=await h.post('leave',response.data.version,{gameId});assert.equal(response.status,200);assert.equal(response.data.hostId,'guest');assert(response.data.game.players[0].left);assert.equal(response.data.game.status,'playing');assert.equal(response.data.game.active,1);
 assert.equal((await h.post('rename',response.data.version,{roomName:'No longer host'})).status,403);
 const as=async(token,action,extra={})=>{const r=await h.api.POST(new Request(origin+'/api/rooms',{method:'POST',headers:{'Content-Type':'application/json','X-Player-Token':token},body:JSON.stringify({action,code,version:h.state().version,features:all,...extra})}));return {status:r.status,data:await r.json()};};
 response=await as('fixture-third','leave',{gameId});assert.equal(response.status,200);assert.equal(response.data.game.status,'finished');assert.equal(rankings(response.data.game)[0].index,1);assert.equal(score(response.data.game.players[0],response.data.game).total,-10);
 response=await as('fixture-guest','rematch');assert.equal(response.status,200);assert.deepEqual(response.data.members.map(m=>m.id),['guest']);assert.equal((await h.get('fixture-host')).status,403);assert.equal((await as('fixture-guest','start')).status,400);
});
test('Raum-Minen treffen alle Gegner atomar; falsche Identität, Wiederholungen und fremde Partien ändern nichts',async t=>{
 const h=await harness(t);await h.get();let response=await h.post('options',h.state().version,{mines:true});assert.equal(response.status,200);response=await h.post('start',response.data.version);const room=h.state().room;room.game.phase='choose';room.game.dice={colors:['g','b','o'],numbers:[1,2,3]};room.game.mines.unlocked.fill(true);room.game.players[1].marks[52]=true;h.sql.prepare('UPDATE rooms SET state = ? WHERE code = ?').run(JSON.stringify(room),code);
 assert.equal((await h.post('mine',h.state().version,{target:52,gameId:'wrong',round:1})).status,409);
 const before=h.state().version;response=await h.post('mine',before,{target:52,gameId:room.game.gameId,round:1,pid:1});assert.equal(response.status,200);assert.equal(h.state().room.game.mines.used[0],true);assert.equal(h.state().room.game.mines.used[1],false);assert.equal(h.state().room.game.players[1].marks[52],false);
 assert.equal((await h.post('mine',before,{target:52,gameId:room.game.gameId,round:1})).status,409);assert.equal(h.state().version,before+1);
});

test('All optional rules start together in new two/six-player Internet games without revealing concealed sheets or bonus locations',async t=>{
 for(const n of [2,6])for(const hiddenScores of [false,true]){
  const h=await harness(t);await h.get();const room=h.state().room;
  for(let i=2;i<n;i++)room.members.push({id:'guest'+i,token:'fixture-guest'+i,name:'Guest '+i,features:all});
  h.sql.prepare('UPDATE rooms SET state = ? WHERE code = ?').run(JSON.stringify(room),code);
  let response=await h.post('options',h.state().version,{boardId:'random',mines:true,bonusFields:true,hiddenScores});assert.equal(response.status,200);
  assert.equal(response.data.supportsMines,true);assert.equal(response.data.supportsRandomBoard,true);assert.equal(response.data.supportsBonusFields,true);
  response=await h.post('start',response.data.version);assert.equal(response.status,200);const raw=h.state().room.game;
  assert.equal(raw.players.length,n);assert.equal(raw.boardId,'random');assert.equal(raw.hiddenScores,hiddenScores);assert.equal(raw.mines.unlocked.length,n);assert.equal(raw.bonuses.fields.length,3);
  for(let pid=0;pid<n;pid++){
   const view=(await h.get(pid===0?'fixture-host':pid===1?'fixture-guest':'fixture-guest'+pid)).data.game;
   assert.deepEqual(view.boardLayout,raw.boardLayout);assert.equal(view.bonuses.fields,undefined);assert.equal(view.bonuses.remaining,3);
   assert.equal(view.players[pid].marks.length,105);
   if(hiddenScores)assert(view.players.every((player,index)=>index===pid||player.hidden&&player.marks===undefined));
  }
  assert.equal((await h.post('options',h.state().version,{mines:false})).status,409);
  await Promise.allSettled(h.scheduled);
 }
});
