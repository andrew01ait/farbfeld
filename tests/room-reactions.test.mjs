import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import {DatabaseSync} from 'node:sqlite';
import {pathToFileURL} from 'node:url';
import {createGame} from '../public/game/engine.js';
import {REACTION_TTL,REACTION_INTERVAL} from '../public/game/reactions.js';
const origin='https://farbfeld.test',code='EMOJ2345',features=['hidden-scores-v1','boards-v1','reactions-v1','reactions-extra-v1'];
async function harness(t){
 let now=1800000000000;const scheduled=[];t.mock.method(Date,'now',()=>now);
 const sql=new DatabaseSync(':memory:');t.after(()=>sql.close());for(const file of fs.readdirSync('drizzle').filter(file=>file.endsWith('.sql')).sort())sql.exec(fs.readFileSync('drizzle/'+file,'utf8'));
 const DB={prepare(query){let values=[];return {bind(...args){values=args;return this;},async first(){return sql.prepare(query).get(...values)||null;},async all(){return {results:sql.prepare(query).all(...values)};},async run(){return {meta:{changes:Number(sql.prepare(query).run(...values).changes)}};}};},async batch(statements){const results=[];for(const statement of statements)results.push(await statement.run());return results;}};
 globalThis.__roomReactionEnv={DB};globalThis.__roomReactionWait=promise=>scheduled.push(promise);
 let source=fs.readFileSync('app/api/rooms/route.ts','utf8').replace("import { env,waitUntil } from 'cloudflare:workers';",'const env=globalThis.__roomReactionEnv;const waitUntil=globalThis.__roomReactionWait;');
 for(const file of ['engine','game-info','boards','reactions','room-status'])source=source.replace('../../../public/game/'+file+'.js',pathToFileURL(process.cwd()+'/public/game/'+file+'.js').href);
 for(const file of ['notifications','room-presence'])source=source.replace('../../../lib/'+file+'.js',pathToFileURL(process.cwd()+'/lib/'+file+'.js').href);
 const compiled=ts.transpileModule(source.replace('../../../lib/room-retention.js',pathToFileURL(process.cwd()+'/lib/room-retention.js').href),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
 const api=await import('data:text/javascript;base64,'+Buffer.from(compiled+'\n// '+crypto.randomUUID()).toString('base64'));
 const members=['host','guest','third'].map(id=>({id,name:id,token:id+'-test-token',features})),game=createGame(members.map(m=>m.name),'room',members.map(m=>m.id));game.gameId='reaction-game';
 const room={members,hostId:'host',createdAt:now,lastActionAt:now,game};sql.prepare('INSERT INTO rooms(code,state,version,expires_at) VALUES(?,?,7,?)').run(code,JSON.stringify(room),now+7*REACTION_TTL);
 const get=async(viewer='guest')=>{const response=await api.GET(new Request(origin+'/api/rooms?code='+code,{headers:{'X-Player-Token':viewer+'-test-token','X-Farbfeld-Features':features.join(',')}}));return {status:response.status,data:await response.json()};};
 const send=async(id,{from='host',to=1,emoji='kiss',gameId=game.gameId,scale,motion}={})=>{const response=await api.POST(new Request(origin+'/api/rooms',{method:'POST',headers:{'Content-Type':'application/json','X-Player-Token':from+'-test-token'},body:JSON.stringify({action:'reaction',actionId:id,code,version:0,features,to,emoji,gameId,scale,motion})}));return {status:response.status,data:await response.json()};};
 return {sql,room,get,send,scheduled,advance:ms=>now+=ms,get now(){return now;},state:()=>sql.prepare('SELECT state,version FROM rooms WHERE code = ?').get(code)};
}
test('Eine Stunde nicht geöffneter Raum liefert dem richtigen Empfänger die ausstehende Reaktion',async t=>{
 const h=await harness(t),before=h.state();assert.equal((await h.send('offline-emoji-0001')).status,200);h.advance(3600000);
 const received=await h.get();assert.equal(received.status,200);assert.equal(received.data.reactions.length,1);assert.equal(received.data.reactions[0].senderId,'host');assert.equal(received.data.reactions[0].emoji,'kiss');
 assert.equal((await h.get('third')).data.reactions.length,0);assert.equal((await h.get('host')).data.reactions.length,0);assert.equal((await h.get('foreign')).status,403);
 assert.deepEqual(h.state(),before);assert.equal(h.scheduled.length,0,'keine Emoji-Pushs');assert(!JSON.stringify(received.data.reactions).includes('test-token'));
});
test('Nur die neueste passende Reaktion je Absender, mit getrennten Empfängern und unveränderter Idempotenz',async t=>{
 const h=await harness(t);await h.send('latest-emoji-0001');h.advance(REACTION_INTERVAL+1);await h.send('latest-emoji-0002',{to:'all',emoji:'laugh'});h.advance(REACTION_INTERVAL+1);await h.send('latest-emoji-0003',{to:2,emoji:'poop'});
 const guest=(await h.get()).data.reactions,third=(await h.get('third')).data.reactions;assert.deepEqual(guest.map(e=>e.id),['latest-emoji-0002']);assert.deepEqual(third.map(e=>e.id),['latest-emoji-0003']);
 assert.equal((await h.send('latest-emoji-0001')).status,200);assert.deepEqual((await h.get()).data.reactions.map(e=>e.id),['latest-emoji-0002']);
 h.advance(REACTION_INTERVAL+1);await h.send('other-sender-0001',{from:'third',to:1});assert.equal((await h.get()).data.reactions.length,2);
 assert.equal((await h.send('rate-limit-000001',{from:'third',to:1})).status,429);
});
test('24-Stunden-Grenze, fremde Räume/Partien und Cleanup lassen keine alten Reaktionen wieder erscheinen',async t=>{
 const h=await harness(t);await h.send('expiry-emoji-0001');
 h.sql.prepare('INSERT INTO room_reactions (id,room_code,game_id,sender_id,target_id,emoji,created_at) VALUES(?,?,?,?,?,?,?)').run('foreign-game-0001',code,'other-game','host','guest','kiss',h.now);
 h.sql.prepare('INSERT INTO room_reactions (id,room_code,game_id,sender_id,target_id,emoji,created_at) VALUES(?,?,?,?,?,?,?)').run('foreign-room-0001','OTHR2345',h.room.game.gameId,'host','guest','kiss',h.now);
 h.advance(REACTION_TTL-1);assert.deepEqual((await h.get()).data.reactions.map(e=>e.id),['expiry-emoji-0001']);h.advance(1);assert.equal((await h.get()).data.reactions.length,0);
 await h.send('after-expiry-0001');assert.equal(h.sql.prepare('SELECT COUNT(*) AS n FROM room_reactions').get().n,1);assert.deepEqual((await h.get()).data.reactions.map(e=>e.id),['after-expiry-0001']);
});

test('Größe und Bewegung bleiben für den späteren Empfänger erhalten; manipulierte Werte ändern keinen Zug',async t=>{
 const h=await harness(t),before=h.state();assert.equal((await h.send('sized-emoji-0001',{scale:2.25,motion:'loop'})).status,200);h.advance(3600000);
 const event=(await h.get()).data.reactions[0];assert.equal(event.scale,2.25);assert.equal(event.motion,'loop');assert.deepEqual(h.state(),before);
 assert.equal((await h.send('sized-emoji-0001',{scale:1,motion:'fly'})).status,200);assert.equal((await h.get()).data.reactions[0].scale,2.25);
 for(const extra of [{scale:999},{scale:'2'},{motion:'unknown'}])assert.equal((await h.send('invalid-size-0001',extra)).status,400);
 assert.equal(h.sql.prepare('SELECT COUNT(*) AS n FROM room_reactions').get().n,1);assert.deepEqual(h.state(),before);assert.equal(h.scheduled.length,0);
});


test('Zusätzliche Raumreaktionen werden gespeichert und zugestellt, ohne Zug oder Push zu erzeugen',async t=>{
 const h=await harness(t),before=h.state();
 for(const emoji of ['thumbsup','amazed']){
  assert.equal((await h.send('new-reaction-'+emoji,{emoji,scale:2,motion:'bounce'})).status,200);
  h.advance(3600000);const event=(await h.get()).data.reactions[0];assert.equal(event.emoji,emoji);assert.equal(event.scale,2);assert.equal(event.motion,'bounce');
 }
 assert.deepEqual(h.state(),before);assert.equal(h.scheduled.length,0);
});
test('Alte Empfänger erhalten eine Updatehilfe für neue Emojis, die drei bisherigen bleiben nutzbar',async t=>{
 const h=await harness(t);h.room.members[1].features=features.filter(feature=>feature!=='reactions-extra-v1');
 h.sql.prepare('UPDATE rooms SET state = ? WHERE code = ?').run(JSON.stringify(h.room),code);const before=h.state();
 const rejected=await h.send('old-recipient-new',{emoji:'amazed'});assert.equal(rejected.status,409);assert.match(rejected.data.error,/1\.12\.0/);
 assert.equal(h.sql.prepare('SELECT COUNT(*) AS n FROM room_reactions').get().n,0);assert.deepEqual(h.state(),before);
 assert.equal((await h.send('old-recipient-kiss',{emoji:'kiss'})).status,200);
 // A normal authenticated poll advertises the updated recipient, no new room needed.
 await h.get();h.advance(REACTION_INTERVAL+1);assert.equal((await h.send('updated-recipient',{emoji:'thumbsup'})).status,200);
});
