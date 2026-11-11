import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import {DatabaseSync} from 'node:sqlite';
import {pathToFileURL} from 'node:url';
import {createGame,findMove} from '../public/game/engine.js';
import {ROOM_RETENTION,CLEANUP_INTERVAL,cleanupRooms,markRoomUsed} from '../lib/room-retention.js';
const origin='https://farbfeld.test',features=['hidden-scores-v1','boards-v1','reactions-v1'];
async function harness(t){
 let clock=1800000000000;const scheduled=[];t.mock.method(Date,'now',()=>clock);
 const sql=new DatabaseSync(':memory:');t.after(()=>sql.close());
 for(const file of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())sql.exec(fs.readFileSync('drizzle/'+file,'utf8'));
 const DB={prepare(query){let values=[];return {bind(...args){values=args;return this;},async first(){return sql.prepare(query).get(...values)||null;},async all(){return {results:sql.prepare(query).all(...values)};},async run(){return {meta:{changes:Number(sql.prepare(query).run(...values).changes)}};},_run(){return {meta:{changes:Number(sql.prepare(query).run(...values).changes)}};}};}};
 DB.batch=async statements=>{sql.exec('BEGIN');try{const results=statements.map(statement=>statement._run());sql.exec('COMMIT');return results;}catch(error){sql.exec('ROLLBACK');throw error;}};
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
 return {sql,DB,get,post,seed,state,scheduled,get now(){return clock;},advance:ms=>clock+=ms};
}
test('Vierzehn Tage sind eine Bereinigungsfrist: gespeicherte Altpartie kann vorher unverändert reaktiviert werden',async t=>{
 const h=await harness(t),code='LIFE2345';h.seed(code);h.sql.prepare('UPDATE rooms SET last_used_at = ?,expires_at = ? WHERE code = ?').run(h.now-ROOM_RETENTION-1,h.now-1,code);const before=h.state(code);
 const read=await h.get(code,'fixture-host');assert.equal(read.status,200);assert.equal(read.cleanupDue,true);
 const index=await h.post('index',{}, {rooms:[{code,token:'fixture-host'}]});assert.equal(index.status,200);assert.equal(index.rooms[0].cleanupDue,true);assert.deepEqual(h.state(code),before);
 const reopened=await h.post('open',{code,token:'fixture-host'});assert.equal(reopened.status,200);assert.equal(reopened.game.gameId,'retained-game');assert.equal(reopened.version,before.version);assert.equal(reopened.cleanupDue,false);assert.equal(reopened.cleanupAt,h.now+ROOM_RETENTION);assert.equal(h.state(code).state,before.state);await Promise.all(h.scheduled);
});
test('Normale Abfragen, Index und ungültige Aktionen verlängern die Frist nicht; ein gültiger Zug schon',async t=>{
 const h=await harness(t),created=await h.post('create',{}, {name:'Host'});await Promise.all(h.scheduled);const code=created.code,initial=h.state(code);h.advance(3600000);
 await h.get(code,created.token);await h.post('index',{}, {rooms:[{code,token:created.token}]});assert.equal((await h.post('open',{code,token:'wrong'})).status,403);assert.equal((await h.post('rename',{code,token:created.token,version:0},{roomName:'stale'})).status,409);assert.deepEqual(h.state(code),initial);
 const joined=await h.post('join',{code},{name:'Guest'}),started=await h.post('start',{code,token:created.token,version:joined.version});await Promise.all(h.scheduled);const before=h.state(code);h.advance(5000);const rolled=await h.post('roll',{code,token:created.token,version:started.version});assert.equal(rolled.status,200);assert.equal(h.state(code).last_used_at,h.now);assert.equal(h.state(code).expires_at,h.now+ROOM_RETENTION);assert.notEqual(h.state(code).state,before.state);
});
test('Bestandsräume erhalten einmalig volle vierzehn Tage Schonfrist ohne Spielstands- oder Versionswechsel',async t=>{
 const h=await harness(t),code='GRAC2345';h.seed(code);const before=h.state(code);await cleanupRooms(h.DB,{now:h.now});const after=h.state(code);assert.equal(after.state,before.state);assert.equal(after.version,before.version);assert.equal(after.last_used_at,h.now);assert.equal(after.expires_at,h.now+ROOM_RETENTION);h.advance(CLEANUP_INTERVAL);await cleanupRooms(h.DB,{now:h.now});assert.equal(h.state(code).expires_at,after.expires_at);
});
test('Bereinigung löscht nur tatsächlich inaktive Räume in begrenzten, gedrosselten Transaktionen samt Nebeninformationen',async t=>{
 const h=await harness(t),codes=[];for(let i=0;i<26;i++){const code='OLDROO'+String.fromCharCode(65+Math.floor(i/26))+String.fromCharCode(65+i%26);h.seed(code);h.sql.prepare('UPDATE rooms SET last_used_at = ?,expires_at = ? WHERE code = ?').run(h.now-ROOM_RETENTION,h.now,code);codes.push(code);}
 const protectedCode='KEEP2345';h.seed(protectedCode);h.sql.prepare('UPDATE rooms SET last_used_at = ?,expires_at = ? WHERE code = ?').run(h.now-ROOM_RETENTION+1,h.now+1,protectedCode);
 const used=codes.at(-1);await markRoomUsed(h.DB,used,h.now);const victim=codes[0];
 h.sql.prepare('INSERT INTO room_presence(room_code,player_id,last_seen,expires_at) VALUES(?,?,?,?)').run(victim,'host',h.now,h.now+86400000);
 h.sql.prepare('INSERT INTO room_reactions(id,room_code,game_id,sender_id,target_id,emoji,created_at) VALUES(?,?,?,?,?,?,?)').run('cleanup-reaction',victim,'retained-game','host','all','kiss',h.now);
 h.sql.prepare('INSERT INTO notification_devices(id,secret_hash,endpoint_hash,subscription,room_code,player_id,updated_at) VALUES(?,?,?,?,?,?,?)').run('cleanup-device','hash','endpoint','{}',victim,'host',h.now);
 h.sql.prepare('INSERT INTO notification_room_bindings(device_id,room_code,player_id,updated_at) VALUES(?,?,?,?)').run('cleanup-device',victim,'host',h.now);
 assert.equal(await cleanupRooms(h.DB,{now:h.now}),20);assert(h.state(protectedCode));assert(h.state(used));assert.equal(h.sql.prepare('SELECT COUNT(*) AS n FROM room_presence WHERE room_code = ?').get(victim).n,0);assert.equal(h.sql.prepare('SELECT COUNT(*) AS n FROM room_reactions WHERE room_code = ?').get(victim).n,0);assert.equal(h.sql.prepare('SELECT COUNT(*) AS n FROM notification_room_bindings WHERE room_code = ?').get(victim).n,0);assert.equal(h.sql.prepare('SELECT room_code FROM notification_devices').get().room_code,'');assert.equal(await cleanupRooms(h.DB,{now:h.now}),0);
 h.advance(CLEANUP_INTERVAL);assert.equal(await cleanupRooms(h.DB,{now:h.now}),6);assert(h.state(used));assert.equal(h.state(protectedCode),undefined);
});
test('Eine zwischen Auswahl und Löschung erneuerte Aktivität wird von der atomaren Bereinigung erneut geprüft',async t=>{
 const h=await harness(t),code='RACE2345';h.seed(code);h.sql.prepare('UPDATE rooms SET last_used_at = ?,expires_at = ? WHERE code = ?').run(h.now-ROOM_RETENTION,h.now,code);
 const batch=h.DB.batch;h.DB.batch=async statements=>{await markRoomUsed(h.DB,code,h.now);return batch(statements);};assert.equal(await cleanupRooms(h.DB,{now:h.now}),0);assert(h.state(code));assert.equal(h.state(code).expires_at,h.now+ROOM_RETENTION);
});
test('Eine bereits physisch bereinigte Partie wird beim Öffnen nicht aus einem alten Lesestand scheinbar wiederhergestellt',async t=>{
 const h=await harness(t),code='GONE2345';h.seed(code);const prepare=h.DB.prepare;h.DB.prepare=query=>{const statement=prepare(query);if(query.startsWith('UPDATE rooms SET last_used_at')){const run=statement.run;statement.run=async()=>{h.sql.prepare('DELETE FROM rooms WHERE code = ?').run(code);return run();};}return statement;};const result=await h.post('open',{code,token:'fixture-host'});assert.equal(result.status,404);assert.equal(result.game,undefined);assert.equal(h.state(code),undefined);
});
test('Reaktionen hinterlassen bei gleichzeitiger Raumbereinigung oder neuer Partie keine verwaisten Ereignisse',async t=>{
 const h=await harness(t),batch=h.DB.batch;
 for(const [code,expected] of [['RGON2345',404],['RNEW2345',409]]){
  const room=h.seed(code);h.DB.batch=async statements=>{
   if(expected===404)h.sql.prepare('DELETE FROM rooms WHERE code = ?').run(code);
   else{room.game.gameId='new-game';h.sql.prepare('UPDATE rooms SET state = ? WHERE code = ?').run(JSON.stringify(room),code);}
   return batch(statements);
  };
  const result=await h.post('reaction',{code,token:'fixture-host'},{actionId:'race-reaction-'+code,gameId:'retained-game',emoji:'kiss',to:'all'});
  assert.equal(result.status,expected);assert.equal(h.sql.prepare('SELECT COUNT(*) AS n FROM room_reactions WHERE room_code = ?').get(code).n,0);
 }
});
test('Eine bestätigte Reaktion erneuert die Raumnutzung atomar, ein Duplikat verändert weder Frist noch Spielzug',async t=>{
 const h=await harness(t),code='REAC2345';h.seed(code);const before=h.state(code),event={actionId:'retention-reaction-0001',gameId:'retained-game',emoji:'laugh',to:'all'};
 const first=await h.post('reaction',{code,token:'fixture-host'},event);assert.equal(first.status,200);assert.equal(first.cleanupAt,h.now+ROOM_RETENTION);const after=h.state(code);assert.equal(after.last_used_at,h.now);assert.equal(after.state,before.state);assert.equal(after.version,before.version);
 h.advance(10000);assert.equal((await h.post('reaction',{code,token:'fixture-host'},event)).status,200);assert.deepEqual(h.state(code),after);assert.equal(h.sql.prepare('SELECT COUNT(*) AS n FROM room_reactions WHERE room_code = ?').get(code).n,1);
});
test('Ein Sammelabruf zeigt nur autorisierte Statuswerte, keine Blätter oder verdeckten Punkte',async t=>{
 const h=await harness(t),a='AAAA2345',b='BBBB2345';h.seed(a);const second=h.seed(b);second.game.hiddenScores=true;second.game.active=1;h.sql.prepare('UPDATE rooms SET state = ? WHERE code = ?').run(JSON.stringify(second),b);
 const before=[h.state(a),h.state(b)],result=await h.post('index',{}, {rooms:[{code:a,token:'fixture-host'},{code:b,token:'fixture-guest'},{code:'NONE2345',token:'other'}]});assert.equal(result.status,200);assert.equal(result.rooms.length,3);assert.equal(result.rooms[0].turn.kind,'turn');assert.equal(result.rooms[1].turn.kind,'turn');assert.equal(result.rooms[2].access,'missing');assert.deepEqual([h.state(a),h.state(b)],before);const raw=JSON.stringify(result);for(const privateValue of ['fixture-host','fixture-guest','"marks"','"score"','"jokers"'])assert(!raw.includes(privateValue));
 const denied=await h.post('index',{}, {rooms:[{code:a,token:'wrong'}]});assert.deepEqual(denied.rooms,[{code:a,access:'denied'}]);assert.equal((await h.post('index',{}, {rooms:Array(51).fill({code:a,token:'fixture-host'})})).status,400);assert.equal((await h.post('index',{}, {rooms:[{code:a,token:'fixture-host'},{code:a,token:'fixture-host'}]})).status,400);
});
test('Zwei Räume spielen unabhängig: zweite Partie beenden und neu starten erhält die erste samt Zugang und Würfeln',async t=>{
 const h=await harness(t),hosts=[],guests=[],states=[];for(let i=0;i<2;i++){const host=await h.post('create',{}, {name:'Host',roomName:'Parallel '+i}),guest=await h.post('join',{code:host.code},{name:'Guest'});hosts.push(host);guests.push(guest);states.push(await h.post('start',{...host,version:guest.version}));}await Promise.all(h.scheduled);
 states[0]=await h.post('roll',{...hosts[0],version:states[0].version});assert.equal(states[0].status,200);const paused=h.state(hosts[0].code);let current=states[1];const sessions=[hosts[1],guests[1]];
 for(let rounds=0;current.game.status==='playing'&&rounds<200;rounds++){if(current.game.phase==='roll')current=await h.post('roll',{...sessions[current.game.active],version:current.version});const active=current.game.active;for(const pid of [active,1-active]){current=await h.post('move',{...sessions[pid],version:current.version},{move:findMove(current.game,pid)||{pass:true}});assert.equal(current.status,200);}}
 assert.equal(current.game.status,'finished');const index=await h.post('index',{}, {rooms:hosts.map(host=>({code:host.code,token:host.token}))});assert.equal(index.rooms[0].gameStatus,'playing');assert.equal(index.rooms[1].gameStatus,'finished');assert.equal(index.rooms[1].result.ownPid,0);
 const rematch=await h.post('rematch',{...hosts[1],version:current.version}),next=await h.post('start',{...hosts[1],version:rematch.version});assert.equal(next.status,200);assert.deepEqual(h.state(hosts[0].code),paused);
 assert.equal((await h.post('move',{...hosts[0],token:hosts[1].token,version:states[0].version},{move:{pass:true}})).status,403);
 const reopened=await h.post('open',hosts[0]);assert.equal(reopened.game.gameId,states[0].game.gameId);assert.deepEqual(reopened.game.dice,states[0].game.dice);assert.equal((await h.post('move',{...hosts[0],version:reopened.version},{move:{pass:true}})).status,200);
});

test('Raumindex liefert Teilnehmer und aktuellen Gastgeber nur nach Prüfung des Raumtokens',async t=>{
 const h=await harness(t),code='HOST2345',room=h.seed(code);room.game.hiddenScores=true;room.hostId=room.members[1].id;h.sql.prepare('UPDATE rooms SET state = ? WHERE code = ?').run(JSON.stringify(room),code);
 const before=h.state(code),index=await h.post('index',{}, {rooms:[{code,token:'fixture-host'}]});assert.equal(index.status,200);assert.deepEqual(index.rooms[0].participants,room.members.map(m=>({name:m.name,host:m.id===room.hostId})));assert.deepEqual(h.state(code),before);
 const text=JSON.stringify(index);for(const forbidden of ['fixture-host','fixture-guest','"marks"','"jokers"','"score"'])assert(!text.includes(forbidden));
 const denied=await h.post('index',{}, {rooms:[{code,token:'not-a-member'}]});assert.deepEqual(denied.rooms,[{code,access:'denied'}]);
});
