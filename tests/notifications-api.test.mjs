import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import {DatabaseSync} from 'node:sqlite';
import {pathToFileURL} from 'node:url';
import {createGame} from '../public/game/engine.js';
const origin='https://farbfeld.test',id='a'.repeat(32),key='b'.repeat(64);
async function harness(){
 const sql=new DatabaseSync(':memory:');for(const file of fs.readdirSync('drizzle').filter(name=>name.endsWith('.sql')).sort())sql.exec(fs.readFileSync('drizzle/'+file,'utf8'));
 const DB={prepare(query){let args=[];return {bind(...values){args=values;return this;},async first(){return sql.prepare(query).get(...args)||null;},async all(){return {results:sql.prepare(query).all(...args)};},async run(){return {meta:{changes:Number(sql.prepare(query).run(...args).changes)}};}};}};
 const env={DB,FARBFELD_VAPID_PUBLIC_KEY:'public-key-for-config',FARBFELD_VAPID_PRIVATE_KEY:'private-never-disclosed',FARBFELD_VAPID_SUBJECT:origin};
 DB.batch=async statements=>{const results=[];for(const statement of statements)results.push(await statement.run());return results;};
 globalThis.__notificationApiTest=env;
 const source=fs.readFileSync('app/api/notifications/route.ts','utf8').replace("import {env} from 'cloudflare:workers';",'const env=globalThis.__notificationApiTest;').replace('../../../lib/notifications.js',pathToFileURL(process.cwd()+'/lib/notifications.js').href).replace('../../../public/game/notification-policy.js',pathToFileURL(process.cwd()+'/public/game/notification-policy.js').href);
 const compiled=ts.transpileModule(source.replace('../../../lib/room-retention.js',pathToFileURL(process.cwd()+'/lib/room-retention.js').href),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
 const api=await import('data:text/javascript;base64,'+Buffer.from(compiled+'\n// '+crypto.randomUUID()).toString('base64'));
 const headers={'Content-Type':'application/json','Origin':origin,'X-Notification-Device':id,'X-Notification-Key':key};
 const point=await crypto.subtle.generateKey({name:'ECDH',namedCurve:'P-256'},true,['deriveBits']);
 const subscription={endpoint:'https://fcm.googleapis.com/fcm/send/fixture',keys:{p256dh:Buffer.from(await crypto.subtle.exportKey('raw',point.publicKey)).toString('base64url'),auth:Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('base64url')}};
 const post=async(action,extra={},overrides={})=>{const response=await api.POST(new Request(origin+'/api/notifications',{method:'POST',headers:{...headers,...overrides},body:JSON.stringify({action,...extra})}));return {status:response.status,data:await response.json()};};
 const get=async(status=false,overrides={})=>{const response=await api.GET(new Request(origin+'/api/notifications'+(status?'?status=1':''),{headers:{...headers,...overrides}}));return {status:response.status,data:await response.json()};};
 const game=createGame(['A','B'],'room',['host','guest']);game.gameId='api-notice';const room={hostId:'host',members:[{id:'host',token:'host-secret',name:'A'},{id:'guest',token:'guest-secret',name:'B'}],game};
 sql.prepare('INSERT INTO rooms(code,state,version,expires_at) VALUES(?,?,1,?)').run('ABCD2345',JSON.stringify(room),Date.now()+86400000);
 return {sql,post,get,subscription,env,api,headers};
}
test('Internet-Test-API verlangt Geräteauthentifizierung, versendet nur an sich selbst und quittiert ohne Partieänderung',async t=>{
 let clock=1800000000000;t.mock.method(Date,'now',()=>clock);const h=await harness();t.after(()=>h.sql.close());
 const pair=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']),jwk=await crypto.subtle.exportKey('jwk',pair.privateKey);
 Object.assign(h.env,{FARBFELD_VAPID_PUBLIC_KEY:Buffer.from(await crypto.subtle.exportKey('raw',pair.publicKey)).toString('base64url'),FARBFELD_VAPID_PRIVATE_KEY:jwk.d});
 await h.post('register',{subscription:h.subscription});const before=h.sql.prepare('SELECT * FROM rooms').get(),sent=[];
 t.mock.method(globalThis,'fetch',async(url,options)=>{sent.push({url,options});return new Response(null,{status:201});});
 assert.equal((await h.post('test-push',{}, {'X-Notification-Key':'c'.repeat(64)})).status,403);assert.equal(sent.length,0);
 const response=await h.post('test-push');assert.equal(response.status,200);const delivery=response.data.delivery;assert.equal(delivery.transport,'accepted');assert.equal(sent.length,1);assert.equal(sent[0].url,h.subscription.endpoint);
 assert.equal((await h.post('test-push')).status,429);assert.equal(sent.length,1);
 const readTest=async event=>{const response=await h.api.GET(new Request(origin+'/api/notifications?status=1&test='+encodeURIComponent(event),{headers:h.headers}));return await response.json();};
 assert.equal((await readTest(delivery.event)).testAllowed,true);assert.equal((await readTest('foreign')).testAllowed,false);
 assert.equal((await h.post('receipt',{event:'foreign',outcome:'shown'})).data.recorded,false);assert.equal((await h.post('receipt',{event:delivery.event,outcome:'shown'})).data.recorded,true);
 const checked=await readTest(delivery.event);assert.equal(checked.delivery.outcome,'shown');assert.equal(checked.delivery.subscription,undefined);assert.equal(checked.delivery.deviceKey,undefined);assert.deepEqual(h.sql.prepare('SELECT * FROM rooms').get(),before);
 clock+=60000;assert.equal((await readTest(delivery.event)).testAllowed,false);assert.equal(sent.length,1,'keine Hintergrund-Nachsendung');
});
test('Internet-Test bleibt bei ausgeschaltetem Gerät und fehlender Serverkonfiguration gesperrt',async t=>{
 const h=await harness();t.after(()=>h.sql.close());await h.post('register',{subscription:h.subscription});h.sql.prepare('UPDATE notification_devices SET enabled = 0').run();
 assert.equal((await h.post('test-push')).status,403);h.sql.prepare('UPDATE notification_devices SET enabled = 1').run();h.env.FARBFELD_VAPID_PRIVATE_KEY='';
 assert.equal((await h.post('test-push')).status,503);assert.equal(h.sql.prepare('SELECT last_sent FROM notification_devices').get().last_sent,0);
});
test('Notification-API: öffentlicher Konfigurationsabruf enthält ausschließlich den öffentlichen Schlüssel',async()=>{
 const h=await harness(),result=await h.get();assert.equal(result.status,200);assert.deepEqual(result.data,{configured:true,publicKey:h.env.FARBFELD_VAPID_PUBLIC_KEY});assert(!JSON.stringify(result).includes(h.env.FARBFELD_VAPID_PRIVATE_KEY));
});
test('Notification-API: Gerätezugang, Raumzuordnung, Präsenz und Abschalten ändern keine Zugversion',async()=>{
 const h=await harness();let result=await h.post('register',{subscription:h.subscription,visible:true,code:'ABCD2345'},{'X-Player-Token':'host-secret'});assert.equal(result.status,200,JSON.stringify(result));
 let device=h.sql.prepare('SELECT * FROM notification_devices').get();assert.notEqual(device.secret_hash,key);assert.equal(device.player_id,'host');assert.equal(device.last_event,'api-notice:1:turn');assert(device.visible_until>Date.now());assert.equal(device.sound,0);
 assert.equal((await h.get(true,{'X-Notification-Key':'c'.repeat(64)})).status,403);
 result=await h.get(true);assert.equal(result.data.notice.event,'api-notice:1:turn');assert.equal(result.data.sound,false);assert.equal(result.data.subscription,undefined);assert.equal(result.data.hasRoomAccess,true);assert.equal(result.data.foreground,true);assert.equal(result.data.lastAttemptAt,null);assert(!JSON.stringify(result.data).includes('host-secret'));
 assert.equal((await h.post('bind',{code:'ABCD2345'},{'X-Player-Token':'wrong'})).status,400);
 assert.equal((await h.post('presence',{visible:false})).status,200);assert.equal(h.sql.prepare('SELECT visible_until FROM notification_devices').get().visible_until,0);
 assert.equal((await h.post('settings',{sound:true})).status,200);assert.equal((await h.get(true)).data.sound,true);
 assert.equal((await h.post('bind',{code:''})).status,200);assert.equal((await h.get(true)).data.notice,null);
 assert.equal(h.sql.prepare('SELECT version FROM rooms').get().version,1);
 assert.equal((await h.post('disable')).status,200);assert.equal(h.sql.prepare('SELECT * FROM notification_devices').get(),undefined);assert.equal((await h.get(true)).status,403);
});
test('Notification-API: keine Registrierung über fremden Origin oder mit manipuliertem Ziel und fremden Geräteschlüsseln',async()=>{
 const h=await harness();assert.equal((await h.post('register',{subscription:h.subscription},{Origin:'https://evil.test'})).status,403);
 assert.equal((await h.post('register',{subscription:{...h.subscription,endpoint:'https://localhost/private'}})).status,400);
 assert.equal((await h.post('register',{subscription:h.subscription})).status,200);
 assert.equal((await h.post('register',{subscription:h.subscription},{'X-Notification-Key':'c'.repeat(64)})).status,403);
 assert.equal(h.sql.prepare('SELECT COUNT(*) AS n FROM notification_devices').get().n,1);
});
test('Revanche-Fähigkeit wird nur authentifiziert vom tatsächlich aktiven Worker übernommen; alte Clients bleiben kompatibel',async t=>{
 const h=await harness();t.after(()=>h.sql.close());
 await h.post('register',{subscription:h.subscription});const ready=()=>h.sql.prepare('SELECT rematch_ready FROM notification_devices').get().rematch_ready;
 assert.equal(ready(),0);
 assert.equal((await h.post('presence',{visible:true,capabilities:['rematch-push-v1']},{'X-Notification-Key':'c'.repeat(64)})).status,403);assert.equal(ready(),0);
 await h.post('presence',{visible:true,capabilities:['rematch-push-v1']});assert.equal(ready(),1);
 await h.post('presence',{visible:false});assert.equal(ready(),1,'fehlendes Feld eines alten Clients setzt keine Fähigkeit zurück');
 await h.post('presence',{visible:true,capabilities:[]});assert.equal(ready(),0,'ein ausdrücklich älterer Worker erhält keine unbekannte Push-Art');
 await h.post('register',{subscription:h.subscription,capabilities:['rematch-push-v1']});assert.equal(ready(),1);
});
test('Status prüft eine Revanche im persönlichen Raum auch nach Freigabe des ersten eigenen Zuges, ohne fremde Ereignisse freizugeben',async t=>{
 const h=await harness();t.after(()=>h.sql.close());const row=h.sql.prepare('SELECT state FROM rooms').get(),room=JSON.parse(row.state);
 Object.assign(room.game,{rematchOf:'previous-game',rematchBy:'host'});room.game.phase='choose';room.game.submitted=[0];
 h.sql.prepare('UPDATE rooms SET state = ?').run(JSON.stringify(room));
 await h.post('register',{subscription:h.subscription,capabilities:['rematch-push-v1'],code:'ABCD2345'},{'X-Player-Token':'guest-secret'});
 const check=async event=>{const result=await h.api.GET(new Request(origin+'/api/notifications?status=1&room=ABCD2345&event='+event,{headers:h.headers}));return await result.json();};
 assert.equal((await check('api-notice:rematch')).notice.kind,'rematch');assert.equal((await check('api-notice:1:turn')).notice.kind,'turn');assert.equal((await check('foreign:rematch')).notice,null);
 h.sql.prepare('INSERT INTO notification_dispatches(device_id,event,endpoint_hash,created_at,expires_at,next_attempt_at,delivery,state) VALUES(?,?,?,?,?,?,?,?)').run(id,'api-notice:1:turn','fixture-hash',100,100000,100,JSON.stringify({event:'api-notice:1:turn',at:100,kind:'turn',transport:'accepted',attempt:1}),'accepted');
 assert.equal((await check('api-notice:rematch')).notice,null,'ein bereits versandter eigener Zug ersetzt auch eine verspätet empfangene Startmeldung');
 room.game.submitted.push(1);h.sql.prepare('UPDATE rooms SET state = ?').run(JSON.stringify(room));assert.equal((await check('api-notice:rematch')).notice,null);
});
test('Raumaktionen planen Push erst nach erfolgreichem Commit; Zustellfehler ändern keinen Zug',async()=>{
 const h=await harness(),queued=[],scheduled=[];globalThis.__notificationHookEnv=h.env;globalThis.__notificationHook=(...args)=>{queued.push(args);return Promise.reject(Error('Push ist offline'));};globalThis.__notificationWait=promise=>scheduled.push(promise.catch(()=>{}));
 let source=fs.readFileSync('app/api/rooms/route.ts','utf8').replace("import { env,waitUntil } from 'cloudflare:workers';",'const env=globalThis.__notificationHookEnv;const waitUntil=globalThis.__notificationWait;').replace("import {enqueueRoomNotices,drainPushOutbox} from '../../../lib/notifications.js';",'const enqueueRoomNotices=globalThis.__notificationHook;const drainPushOutbox=async()=>{};');
 for(const file of ['engine','game-info','boards','reactions','room-status'])source=source.replace('../../../public/game/'+file+'.js',pathToFileURL(process.cwd()+'/public/game/'+file+'.js').href);
 source=source.replace('../../../lib/room-presence.js',pathToFileURL(process.cwd()+'/lib/room-presence.js').href);
 const compiled=ts.transpileModule(source.replace('../../../lib/room-retention.js',pathToFileURL(process.cwd()+'/lib/room-retention.js').href),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
 const {POST}=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
 const post=async(action,version,token='host-secret',extra={})=>{const response=await POST(new Request(origin+'/api/rooms',{method:'POST',headers:{'Content-Type':'application/json','X-Player-Token':token},body:JSON.stringify({action,version,code:'ABCD2345',...extra})}));return {status:response.status,data:await response.json()};};
 assert.equal((await post('roll',0)).status,409);assert.equal(queued.length,0);
 const rolled=await post('roll',1);assert.equal(rolled.status,200);assert.equal(queued.length,1);assert.equal(queued[0][2].phase,'roll');assert.equal(queued[0][3].phase,'choose');
 const renamed=await post('rename',rolled.data.version,'host-secret',{roomName:'Unsere Runde'});assert.equal(renamed.status,200);assert.equal(queued.length,1);assert.deepEqual(renamed.data.game,rolled.data.game);
 const moved=await post('move',renamed.data.version,'host-secret',{move:{pass:true}});assert.equal(moved.status,200);assert.equal(queued.length,2);
 assert.equal((await post('move',rolled.data.version,'host-secret',{move:{pass:true}})).status,409);assert.equal(queued.length,2);
 await Promise.all(scheduled);assert.equal(h.sql.prepare('SELECT version FROM rooms').get().version,moved.data.version);
 const stored=JSON.parse(h.sql.prepare('SELECT state FROM rooms').get().state);stored.game.status='finished';h.sql.prepare('UPDATE rooms SET state = ?').run(JSON.stringify(stored));
 const lobby=await post('rematch',moved.data.version);assert.equal(lobby.status,200);assert.equal(lobby.data.game,null);assert.equal(queued.length,2,'Rückkehr in die Lobby versendet nichts');
 const restarted=await post('start',lobby.data.version);assert.equal(restarted.status,200);assert.equal(queued.length,3);
 assert.equal(restarted.data.game.rematchOf,stored.game.gameId);assert.equal(restarted.data.game.rematchBy,'host');assert.notEqual(restarted.data.game.gameId,stored.game.gameId);
});

test('Zustellverlauf verlangt den Geräteschlüssel und enthält ausschließlich die eigene sichere Projektion',async()=>{
 const h=await harness();await h.post('register',{subscription:h.subscription});
 h.sql.prepare('INSERT INTO notification_dispatches(device_id,event,endpoint_hash,created_at,expires_at,next_attempt_at,delivery,state) VALUES(?,?,?,?,?,?,?,?)').run(id,'own-event','internal-hash',100,100000,100,JSON.stringify({event:'own-event',at:100,kind:'turn',transport:'accepted',attempt:1,endpoint:'PRIVATE',privateKey:'PRIVATE'}),'accepted');
 const request=overrides=>new Request(origin+'/api/notifications?status=1&history=1',{headers:{...h.headers,...overrides}});
 assert.equal((await h.api.GET(request({'X-Notification-Key':'c'.repeat(64)}))).status,403);
 const response=await h.api.GET(request({})),data=await response.json();assert.equal(data.history.length,1);assert.equal(data.history[0].event,'own-event');assert(!JSON.stringify(data.history).includes('PRIVATE'));assert.equal(data.history[0].device_id,undefined);assert.equal(data.history[0].room_code,undefined);
 const lean=await h.get(true);assert.equal(lean.data.history,undefined,'push-time revalidation does not load history');
});
