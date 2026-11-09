import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import {DatabaseSync} from 'node:sqlite';
import {pathToFileURL} from 'node:url';
import {createGame,rollGame} from '../public/game/engine.js';
import {PRESENCE_TTL,PRESENCE_WRITE_INTERVAL,SKIP_DELAY,homeRoomStatus} from '../public/game/room-status.js';
import {PRESENCE_RETENTION} from '../lib/room-presence.js';
const origin='https://farbfeld.test',code='PRES2345',features=['hidden-scores-v1','boards-v1','reactions-v1'];
async function harness(t){
 let clock=1800000000000,failPresence=false;const scheduled=[];
 t.mock.method(Date,'now',()=>clock);
 const sql=new DatabaseSync(':memory:');t.after(()=>sql.close());for(const file of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())sql.exec(fs.readFileSync('drizzle/'+file,'utf8'));
 const DB={prepare(query){let values=[];const verify=()=>{if(failPresence&&query.includes('room_presence'))throw Error('presence storage unavailable');};return {bind(...args){values=args;return this;},async first(){verify();return sql.prepare(query).get(...values)||null;},async all(){verify();return {results:sql.prepare(query).all(...values)};},async run(){verify();return {meta:{changes:Number(sql.prepare(query).run(...values).changes)}};}};}};
 globalThis.__roomStatusEnv={DB};globalThis.__roomStatusWait=promise=>scheduled.push(promise);
 let source=fs.readFileSync('app/api/rooms/route.ts','utf8').replace("import { env,waitUntil } from 'cloudflare:workers';",'const env=globalThis.__roomStatusEnv;const waitUntil=globalThis.__roomStatusWait;');
 for(const file of ['engine','game-info','boards','reactions','room-status'])source=source.replace('../../../public/game/'+file+'.js',pathToFileURL(process.cwd()+'/public/game/'+file+'.js').href);
 for(const file of ['notifications','room-presence'])source=source.replace('../../../lib/'+file+'.js',pathToFileURL(process.cwd()+'/lib/'+file+'.js').href);
 const compiled=ts.transpileModule(source.replace('../../../lib/room-retention.js',pathToFileURL(process.cwd()+'/lib/room-retention.js').href),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
 const api=await import('data:text/javascript;base64,'+Buffer.from(compiled+'\n// '+crypto.randomUUID()).toString('base64'));
 const room={members:[{id:'a',token:'test-host',name:'Robin',features},{id:'s',token:'test-guest',name:'Bea',features}],hostId:'a',createdAt:clock,game:rollGame(createGame(['Robin','Bea'],'room',['a','s'])),lastActionAt:clock};room.game.gameId='status-game';
 sql.prepare('INSERT INTO rooms(code,state,version,expires_at) VALUES(?,?,11,?)').run(code,JSON.stringify(room),clock+7*SKIP_DELAY);
 const state=()=>{const row=sql.prepare('SELECT state,version FROM rooms WHERE code = ?').get(code);return {...row,room:JSON.parse(row.state)};};
 const seed=value=>sql.prepare('UPDATE rooms SET state = ? WHERE code = ?').run(JSON.stringify(value),code);
 const get=async(token='test-host')=>{const response=await api.GET(new Request(origin+'/api/rooms?code='+code,{headers:{'X-Player-Token':token,'X-Farbfeld-Features':features.join(',')}}));return {status:response.status,data:await response.json()};};
 const post=async(action,token='test-host',extra={})=>{const response=await api.POST(new Request(origin+'/api/rooms',{method:'POST',headers:{'Content-Type':'application/json','X-Player-Token':token},body:JSON.stringify({action,code,version:state().version,features,...extra})}));return {status:response.status,data:await response.json()};};
 return {sql,room,state,seed,get,post,scheduled,get now(){return clock;},advance:ms=>clock+=ms,fail:()=>failPresence=true};
}
test('Status kennt einzelne authentifizierte Geräte, wird nach 90 Sekunden offline und ändert weder Spielstand noch Zugversion',async t=>{
 const h=await harness(t),before=h.state();
 const host=await h.get();assert.equal(host.data.presence.a,'online');assert.equal(host.data.presence.s,'unknown');
 const guest=await h.get('test-guest');assert.equal(guest.data.presence.s,'online');assert.equal(guest.data.presence.a,'online');
 h.advance(PRESENCE_TTL);const next=await h.get();assert.equal(next.data.presence.a,'online');assert.equal(next.data.presence.s,'offline');
 assert.equal(h.state().version,before.version);assert.deepEqual(h.state().room,before.room);assert.equal(h.scheduled.length,0);
 assert(!JSON.stringify(next.data.presence).includes('test-host'));assert.equal((await h.get('wrong')).status,403);
});
test('Vorhandenes Polling schreibt Präsenz höchstens alle dreißig Sekunden pro Gerät',async t=>{
 const h=await harness(t);await h.get();const last=()=>h.sql.prepare('SELECT last_seen FROM room_presence WHERE player_id = ?').get('a').last_seen;
 const initial=last();h.advance(PRESENCE_WRITE_INTERVAL-1);await h.get();assert.equal(last(),initial);
 h.advance(1);await h.get();assert.equal(last(),h.now);assert.equal(h.state().version,11);assert.equal(h.sql.prepare('SELECT COUNT(*) AS n FROM room_presence').get().n,1);
});
test('Präsenz hat eine eigene begrenzte Aufbewahrung unabhängig vom dauerhaften Raum',async t=>{
 const h=await harness(t);h.sql.prepare('UPDATE rooms SET expires_at = 0 WHERE code = ?').run(code);const before=h.state();
 assert.equal((await h.get()).data.presence.a,'online');assert.equal((await h.get('test-guest')).data.presence.s,'online');
 assert.equal(h.sql.prepare('SELECT expires_at FROM room_presence WHERE player_id = ?').get('s').expires_at,h.now+PRESENCE_RETENTION);
 h.advance(PRESENCE_TTL);assert.equal((await h.get()).data.presence.s,'offline');
 h.advance(PRESENCE_RETENTION);const current=await h.get();assert.equal(current.status,200);assert.equal(current.data.presence.a,'online');assert.equal(current.data.presence.s,'unknown');
 assert.deepEqual(h.state(),before);assert.equal(h.scheduled.length,0);
});
test('Ausfall der Status-Tabelle sperrt keine gültigen Züge und erzeugt keine falschen Online-Meldungen',async t=>{
 const h=await harness(t);h.fail();const result=await h.get();assert.equal(result.status,200);assert.equal(result.data.presence,null);
 const move=await h.post('move','test-host',{move:{pass:true}});assert.equal(move.status,200);assert.deepEqual(move.data.game.submitted,[0]);assert.equal(h.state().version,12);
});
test('Überspringen: nur Ersteller, vor 24 Stunden gesperrt, exakt danach möglich, anschließend erneut gesperrt',async t=>{
 const h=await harness(t);assert.equal((await h.get()).data.canSkip,false);assert.equal((await h.post('skip','test-host',{pid:0,canSkip:true,lastActionAt:h.now-SKIP_DELAY})).status,409);
 h.advance(SKIP_DELAY-1);assert.equal((await h.post('skip','test-host',{pid:0})).status,409);
 h.advance(1);assert.equal((await h.get('test-guest')).data.canSkip,false);assert.equal((await h.post('skip','test-guest',{pid:0})).status,403);
 assert.equal((await h.get()).data.canSkip,true);const skipped=await h.post('skip','test-host',{pid:0});assert.equal(skipped.status,200);assert.equal(skipped.data.canSkip,false);assert.deepEqual(skipped.data.game.submitted,[0]);
 assert.equal((await h.post('skip','test-host',{pid:1})).status,409);assert.equal(h.state().room.lastActionAt,h.now);
});
test('Normale Züge/Würfe setzen Wartezeit zurück, Umbenennen und Verbindungsabrufe nicht',async t=>{
 const h=await harness(t);h.advance(SKIP_DELAY);const eligible=h.state().room.lastActionAt;
 await h.get();await h.post('rename','test-host',{roomName:'Umbenannt'});assert.equal(h.state().room.lastActionAt,eligible);assert.equal((await h.get()).data.canSkip,true);
 await h.post('move','test-host',{move:{pass:true}});assert.equal(h.state().room.lastActionAt,h.now);assert.equal((await h.get()).data.canSkip,false);
 h.advance(5000);await h.post('move','test-guest',{move:{pass:true}});h.advance(5000);await h.post('roll','test-guest');assert.equal(h.state().room.lastActionAt,h.now);
});
test('Laufende Altpartie bekommt einmalig einen sicheren Zeitanker und nicht sofort eine Überspring-Freigabe',async t=>{
 const h=await harness(t);delete h.room.lastActionAt;h.seed(h.room);h.advance(SKIP_DELAY*2);
 const result=await h.get();assert.equal(result.data.canSkip,false);assert.equal(result.data.skipAvailableAt,h.now+SKIP_DELAY);assert.equal(h.state().version,12);assert.deepEqual(h.state().room.game,h.room.game);
 await h.get();assert.equal(h.state().version,12);
});
test('Startseitenstatus folgt echten Raumaktionen auch für das Gästehandy, ohne einen Zug auszuführen',async t=>{
 const h=await harness(t);assert.equal(homeRoomStatus((await h.get('test-guest')).data.game,'s').kind,'waiting');
 await h.post('move','test-host',{move:{pass:true}});let value=await h.get('test-guest');assert.equal(homeRoomStatus(value.data.game,'s').kind,'turn');const version=value.data.version;
 value=await h.get('test-guest');assert.equal(value.data.version,version);assert.equal(homeRoomStatus(value.data.game,'s').kind,'turn');
 await h.post('move','test-guest',{move:{pass:true}});value=await h.get('test-guest');assert.match(homeRoomStatus(value.data.game,'s').text,/würfeln/);
});
