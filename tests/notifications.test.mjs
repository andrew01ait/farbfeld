import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {createGame,rollGame,applyMove} from '../public/game/engine.js';
import {noticeForGame,noticeForGameEvent,REMATCH_PUSH_CAPABILITY} from '../public/game/notification-policy.js';
import {GameNotifications,describePushDelivery} from '../public/game/notifications.js';
import {authenticatedDevice,bindNotificationDevice,bindNotificationRooms,deliveryInfo,recordPushReceipt,roomForDevice,deliverRoomNotices,enqueueRoomNotices,drainPushOutbox,maintainPushOutbox,pushHistory,sendPushTest,secretHash,validateSubscription} from '../lib/notifications.js';

function database(){
 const sql=new DatabaseSync(':memory:');for(const file of fs.readdirSync('drizzle').filter(file=>file.endsWith('.sql')).sort())sql.exec(fs.readFileSync('drizzle/'+file,'utf8'));
 const DB={prepare(query){let args=[];return {bind(...values){args=values;return this;},async first(){return sql.prepare(query).get(...args)||null;},async all(){return {results:sql.prepare(query).all(...args)};},async run(){return {meta:{changes:Number(sql.prepare(query).run(...args).changes)}};}};}};
 DB.batch=async statements=>{sql.exec('BEGIN');try{const results=[];for(const statement of statements)results.push(await statement.run());sql.exec('COMMIT');return results;}catch(error){sql.exec('ROLLBACK');throw error;}};
 return {sql,DB};
}
const b64=bytes=>Buffer.from(bytes).toString('base64url');
async function keys(){
 const receiver=await crypto.subtle.generateKey({name:'ECDH',namedCurve:'P-256'},true,['deriveBits']);
 const publicKey=new Uint8Array(await crypto.subtle.exportKey('raw',receiver.publicKey)),auth=crypto.getRandomValues(new Uint8Array(16));
 const pair=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']),jwk=await crypto.subtle.exportKey('jwk',pair.privateKey);
 const env={FARBFELD_VAPID_SUBJECT:'https://farbfeld.test',FARBFELD_VAPID_PUBLIC_KEY:b64(await crypto.subtle.exportKey('raw',pair.publicKey)),FARBFELD_VAPID_PRIVATE_KEY:jwk.d};
 return {receiver,auth,publicKey,pair,env,subscription:{endpoint:'https://fcm.googleapis.com/fcm/send/example',keys:{p256dh:b64(publicKey),auth:b64(auth)}}};
}
async function decryptPush(body,receiver,auth,publicKey){
 const bytes=new Uint8Array(body),senderKey=bytes.slice(21,21+bytes[20]);
 assert.equal(new DataView(bytes.buffer,bytes.byteOffset).getUint32(16),4096);assert.equal(senderKey.length,65);
 const key=await crypto.subtle.importKey('raw',senderKey,{name:'ECDH',namedCurve:'P-256'},false,[]);
 const shared=new Uint8Array(await crypto.subtle.deriveBits({name:'ECDH',public:key},receiver.privateKey,256));
 const concat=(...values)=>Buffer.concat(values.map(value=>typeof value==='string'?Buffer.from(value):Buffer.from(value)));
 const hmac=async(key,value)=>new Uint8Array(await crypto.subtle.sign('HMAC',await crypto.subtle.importKey('raw',key,{name:'HMAC',hash:'SHA-256'},false,['sign']),value));
 const authPrk=await hmac(auth,shared),ikm=await hmac(authPrk,concat('WebPush: info\0',publicKey,senderKey,[1]));
 const prk=await hmac(bytes.slice(0,16),ikm),cek=(await hmac(prk,concat('Content-Encoding: aes128gcm\0',[1]))).slice(0,16),nonce=(await hmac(prk,concat('Content-Encoding: nonce\0',[1]))).slice(0,12);
 const plain=new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv:nonce},await crypto.subtle.importKey('raw',cek,'AES-GCM',false,['decrypt']),bytes.slice(21+bytes[20])));
 let end=plain.length-1;while(plain[end]===0)end--;assert.equal(plain[end],2,'RFC 8188 final-record delimiter');return JSON.parse(new TextDecoder().decode(plain.slice(0,end)));
}
async function fixture(){
 const db=database(),crypt=await keys(),now=1000000,code='ABCD2345',id='a'.repeat(32),secret='b'.repeat(64);
 let game=createGame(['Robin','Bea'],'room',['host','guest']);game.gameId='notification-test';
 const room={members:[{id:'host',name:'Robin',token:'host-token'},{id:'guest',name:'Bea',token:'guest-token'}],hostId:'host',game};
 db.sql.prepare('INSERT INTO rooms(code,state,version,expires_at) VALUES(?,?,1,?)').run(code,JSON.stringify(room),now+86400000);
 db.sql.prepare('INSERT INTO notification_devices(id,secret_hash,endpoint_hash,subscription,room_code,player_id,updated_at) VALUES(?,?,?,?,?,?,?)').run(id,await secretHash(secret),await secretHash(crypt.subscription.endpoint),JSON.stringify(crypt.subscription),code,'guest',now);
 const sent=[];const send=async(url,request)=>{sent.push({url,...request});return new Response(null,{status:201});};
 return {...db,...crypt,now,code,id,secret,game,room,sent,env:{...crypt.env,DB:db.DB},send,commit(next){room.game=next;db.sql.prepare('UPDATE rooms SET state = ?, version = version+1 WHERE code = ?').run(JSON.stringify(room),code);}};
}
test('Internet-Test sendet nur an das eigene Gerät, teilt das Minutenlimit und verändert keinen Spielzug',async t=>{
 const f=await fixture();t.after(()=>f.sql.close());const before=f.sql.prepare('SELECT * FROM rooms').get();
 f.sql.prepare('INSERT INTO notification_devices(id,secret_hash,endpoint_hash,subscription,room_code,player_id,updated_at) VALUES(?,?,?,?,?,?,?)').run('c'.repeat(32),'other-hash','other-endpoint',JSON.stringify(f.subscription),f.code,'host',f.now);
 const device=await authenticatedDevice(f.DB,f.id,f.secret),first=await sendPushTest(f.env,device,{now:f.now,send:f.send});
 assert.equal(first.delivery.transport,'accepted');assert.equal(first.delivery.httpStatus,201);assert.equal(f.sent.length,1);
 const payload=await decryptPush(f.sent[0].body,f.receiver,f.auth,f.publicKey);assert.equal(payload.kind,'test');assert.equal(payload.mode,'test');assert.equal(payload.deviceId,f.id);assert.equal(payload.code,undefined);assert.equal(f.sent[0].headers.ttl,'60');
 const second=await sendPushTest(f.env,device,{now:f.now+1000,send:f.send});assert.equal(second.limited,true);assert.equal(second.retryAfter,59);assert.equal(f.sent.length,1);
 const rolled=rollGame(f.game,()=>0),next=applyMove(rolled,0,{pass:true});f.commit(next);await deliverRoomNotices(f.env,f.code,rolled,next,{now:f.now+2000,send:f.send});assert.equal(f.sent.length,1);
 assert.equal(JSON.parse(before.state).game.gameId,JSON.parse(f.sql.prepare('SELECT state FROM rooms').get().state).game.gameId);
 assert.equal(f.sql.prepare('SELECT last_sent FROM notification_devices WHERE id = ?').get('c'.repeat(32)).last_sent,0);
});
test('Internet-Test unterscheidet Vorbereitung, Provider-Ablehnung und abgelaufenen Endpunkt, ohne Wiederholung',async t=>{
 for(const kind of ['prepare','provider','expired']){
  const f=await fixture();try{const device=await authenticatedDevice(f.DB,f.id,f.secret);let calls=0;
   const result=await sendPushTest(kind==='prepare'?{...f.env,FARBFELD_VAPID_PRIVATE_KEY:'invalid-but-configured'}:f.env,device,{now:f.now,send:async()=>{calls++;return new Response(null,{status:kind==='expired'?410:403});}});
   assert.equal(result.delivery.transport,kind==='expired'?'expired':'failed');assert.equal(result.delivery.reason,kind==='prepare'?'prepare':'provider');assert.equal(calls,kind==='prepare'?0:1);
   if(kind==='expired')assert.equal(await authenticatedDevice(f.DB,f.id,f.secret),null);else assert.equal(deliveryInfo(await authenticatedDevice(f.DB,f.id,f.secret)).transport,'failed');
  }finally{f.sql.close();}
 }
});
test('Gerätebestätigung vor der Providerantwort bleibt erhalten; fremde, alte und doppelte Quittungen bleiben wirkungslos',async t=>{
 const f=await fixture();t.after(()=>f.sql.close());const device=await authenticatedDevice(f.DB,f.id,f.secret);
 const result=await sendPushTest(f.env,device,{now:f.now,send:async()=>{
  const current=await authenticatedDevice(f.DB,f.id,f.secret),event=deliveryInfo(current).event;
  assert.equal(await recordPushReceipt(f.DB,current,'wrong-event','shown',f.now+1),false);
  assert.equal(await recordPushReceipt(f.DB,current,event,'arbitrary-text',f.now+1),false);
  assert.equal(await recordPushReceipt(f.DB,current,event,'shown',f.now+1),true);
  return new Response(null,{status:201});
 }});
 assert.equal(result.delivery.transport,'accepted');assert.equal(result.delivery.outcome,'shown');assert.equal(result.delivery.receivedAt,f.now+1);
 const current=await authenticatedDevice(f.DB,f.id,f.secret);assert.equal(await recordPushReceipt(f.DB,current,result.delivery.event,'seen',f.now+2),false);
 assert.equal(deliveryInfo(await authenticatedDevice(f.DB,f.id,f.secret)).outcome,'shown');
 f.sql.prepare('UPDATE notification_devices SET delivery = ? WHERE id = ?').run(JSON.stringify({...result.delivery,outcome:undefined,receivedAt:undefined,at:f.now-86400001}),f.id);
 assert.equal(await recordPushReceipt(f.DB,await authenticatedDevice(f.DB,f.id,f.secret),result.delivery.event,'shown',f.now),false);
});
test('Transportstatus gibt nur erlaubte Diagnosedaten zurück und verwechselt Providerannahme nicht mit Anzeige',()=>{
 const record={event:'fixture',kind:'test',at:100,transport:'accepted',subscription:'secret',privateKey:'secret',httpStatus:201};
 const clean=deliveryInfo({delivery:JSON.stringify(record)});assert.equal(clean.subscription,undefined);assert.equal(clean.privateKey,undefined);
 assert.match(describePushDelivery(clean).title,/Push-Dienst/);assert.match(describePushDelivery(clean).detail,/Rückmeldung.*fehlt/);
 assert.match(describePushDelivery({...clean,outcome:'shown',receivedAt:200}).title,/Browser.*Anzeige/);
 assert.match(describePushDelivery({...clean,outcome:'shown',receivedAt:200}).detail,/Kein Beleg.*sichtbare Android/);
 assert.match(describePushDelivery({...clean,outcome:'cooldown',receivedAt:200}).title,/Minutenlimit/);
 assert.equal(deliveryInfo({delivery:'broken'}),null);
});
test('Client verlangt den aktualisierten Worker für Internet-Tests und erhält eine früh eintreffende Gerätequittung',async()=>{
 const controller=syncingClient();controller.state.pushReady=true;controller.retry=async()=>{};
 controller.call=async()=>({capabilities:[]});await assert.rejects(controller.testPush(),/1\.11\.2/);
 controller.call=async()=>({capabilities:['push-test-v1']});let requests=0;
 controller.request=async action=>{assert.equal(action,'test-push');requests++;controller.mergeDelivery({event:'push-test:fixture',at:1000,kind:'test',outcome:'shown',receivedAt:1100});return {delivery:{event:'push-test:fixture',at:1000,kind:'test',transport:'accepted',httpStatus:201}};};
 const delivery=await controller.testPush();assert.equal(delivery.outcome,'shown');assert.equal(delivery.transport,'accepted');assert.equal(requests,1);
 controller.mergeDelivery({event:'older',at:900,transport:'failed'});assert.equal(controller.delivery.event,'push-test:fixture');
});
test('Alte Raumfrist sperrt weder Gerätebindung noch Push-Prüfung eines laufenden Spiels',async()=>{
 const f=await fixture();try{
  f.sql.prepare('UPDATE rooms SET expires_at = ? WHERE code = ?').run(f.now-1,f.code);
  const device=await authenticatedDevice(f.DB,f.id,f.secret);
  await bindNotificationDevice(f.DB,device,f.code,'guest-token',f.now);
  assert.equal((await roomForDevice(f.DB,await authenticatedDevice(f.DB,f.id,f.secret),f.now)).room.game.gameId,f.game.gameId);
  await assert.rejects(bindNotificationDevice(f.DB,device,f.code,'invalid-token',f.now),/Zugang/);
  const previous=rollGame(f.game,()=>0),next=applyMove(previous,0,{pass:true});f.commit(next);
  await deliverRoomNotices(f.env,f.code,previous,next,{now:f.now,send:f.send});
  assert.equal(f.sent.length,1);const payload=await decryptPush(f.sent[0].body,f.receiver,f.auth,f.publicKey);assert.equal(payload.event,'notification-test:1:turn');
  await deliverRoomNotices(f.env,f.code,previous,next,{now:f.now,send:f.send});assert.equal(f.sent.length,1);
 }finally{f.sql.close();}
});
test('Ein eigener Zug erzeugt genau ein Ereignis; Würfeln und Auswahl sind keine zwei Erinnerungen',()=>{
 let game=createGame(['A','B'],'room');game.gameId='one-turn';
 assert.equal(noticeForGame(game,1),null);const roll=noticeForGame(game,0);
 game=rollGame(game,()=>0);assert.equal(noticeForGame(game,0).event,roll.event);
 game=applyMove(game,0,{pass:true});assert.equal(noticeForGame(game,0),null);assert.equal(noticeForGame(game,1).event,'one-turn:1:turn');
 game=applyMove(game,1,{pass:true});assert.equal(noticeForGame(game,1).event,'one-turn:2:turn');assert.equal(noticeForGame(game,0),null);
 game.status='finished';assert.equal(noticeForGame(game,0).event,'one-turn:finished');assert(!/Bea|Robin|Punkte/.test(JSON.stringify(noticeForGame(game,0))));
 for(const mode of ['solo','local','computer']){game.mode=mode;assert.equal(noticeForGame(game,0),null);}
});
test('Revanche: nur der tatsächliche Neustart informiert wartende andere Mitglieder; ein eigener Zug hat Vorrang',()=>{
 let game=createGame(['A','B'],'room',['host','guest']);game.gameId='new-match';
 assert.equal(noticeForGame(game,1),null);assert.equal(noticeForGame(null,1),null);
 Object.assign(game,{rematchOf:'old-match',rematchBy:'host'});
 assert.equal(noticeForGame(game,0).kind,'turn');const notice=noticeForGame(game,1);assert.equal(notice.kind,'rematch');assert.equal(notice.event,'new-match:rematch');
 game=applyMove(rollGame(game,()=>0),0,{pass:true});assert.equal(noticeForGame(game,1).kind,'turn');
 assert.equal(noticeForGameEvent(game,1,notice.event).kind,'rematch','eine verzögerte Startmeldung bleibt für den ersten eigenen Zug aktuell');
 game=applyMove(game,1,{pass:true});assert.equal(noticeForGameEvent(game,1,notice.event),null);
 game.status='finished';assert.equal(noticeForGame(game,1).kind,'finished');assert.equal(noticeForGameEvent(game,1,notice.event),null);
});
const rematchGame=f=>({...f.game,gameId:'next-rematch',rematchOf:f.game.gameId,rematchBy:'host'});
test('Revanche-Push: neuer Worker, Opt-in, aktueller Zugang und Deduplizierung bleiben Voraussetzung',async()=>{
 for(const mode of ['ready','old-worker','foreground','disabled','removed']){
  const f=await fixture();try{
   const game=rematchGame(f);f.commit(game);f.sql.prepare('UPDATE notification_devices SET rematch_ready = 1').run();
   if(mode==='old-worker')f.sql.prepare('UPDATE notification_devices SET rematch_ready = 0').run();
   if(mode==='foreground')f.sql.prepare('UPDATE notification_devices SET visible_until = ?').run(f.now+45000);
   if(mode==='disabled')f.sql.prepare('UPDATE notification_devices SET enabled = 0').run();
   if(mode==='removed'){f.room.members=f.room.members.filter(member=>member.id!=='guest');f.commit(game);}
   await deliverRoomNotices(f.env,f.code,null,game,{now:f.now,send:f.send});assert.equal(f.sent.length,mode==='ready'?1:0,mode);
   if(mode==='ready'){
    const payload=await decryptPush(f.sent[0].body,f.receiver,f.auth,f.publicKey);assert.equal(payload.kind,'rematch');assert.equal(payload.event,'next-rematch:rematch');
    assert(!/Robin|Bea|guest-token|host-token|Punkte/.test(JSON.stringify(payload)));
    await deliverRoomNotices(f.env,f.code,null,game,{now:f.now+61000,send:f.send});assert.equal(f.sent.length,1);
    assert.equal((await pushHistory(f.DB,f.id))[0].kind,'rematch');
   }
  }finally{f.sql.close();}
 }
});
test('Schnelle Revanche bleibt bis nach dem Minutenlimit vorgemerkt und wird vor Versand erneut geprüft',async()=>{
 for(const change of ['current','aborted','old-worker']){
  const f=await fixture();try{
   const game=rematchGame(f);f.commit(game);f.sql.prepare('UPDATE notification_devices SET rematch_ready = 1,last_sent = ?').run(f.now-20000);
   await deliverRoomNotices(f.env,f.code,null,game,{now:f.now,send:f.send});assert.equal(f.sent.length,0);
   let job=f.sql.prepare('SELECT * FROM notification_dispatches').get();assert.equal(job.state,'pending');assert.equal(job.attempts,0);assert.equal(job.next_attempt_at,f.now+40000);
   await drainPushOutbox(f.env,{now:f.now+39999,send:f.send});assert.equal(f.sent.length,0);
   if(change==='aborted')f.commit(null);
   if(change==='old-worker')f.sql.prepare('UPDATE notification_devices SET rematch_ready = 0').run();
   await drainPushOutbox(f.env,{now:f.now+40000,send:f.send});assert.equal(f.sent.length,change==='current'?1:0,change);
   await drainPushOutbox(f.env,{now:f.now+120000,send:f.send});assert.equal(f.sent.length,change==='current'?1:0,'keine Wiederholung');
  }finally{f.sql.close();}
 }
});
test('Ein bereits angenommener erster Zug ersetzt eine noch aufgeschobene Revanche-Meldung',async t=>{
 const f=await fixture();t.after(()=>f.sql.close());const game=rematchGame(f);f.commit(game);
 f.sql.prepare('UPDATE notification_devices SET rematch_ready = 1,last_sent = ?').run(f.now-20000);
 await enqueueRoomNotices(f.env,f.code,null,game,{now:f.now});
 const rolled=rollGame(game,()=>0),ready=applyMove(rolled,0,{pass:true});f.commit(ready);
 await deliverRoomNotices(f.env,f.code,rolled,ready,{now:f.now+61000,send:f.send});assert.equal(f.sent.length,1);
 assert.equal((await decryptPush(f.sent[0].body,f.receiver,f.auth,f.publicKey)).kind,'turn');
 await drainPushOutbox(f.env,{now:f.now+122000,send:f.send});assert.equal(f.sent.length,1);
 assert.equal(f.sql.prepare("SELECT state FROM notification_dispatches WHERE event = 'next-rematch:rematch'").get().state,'stopped');
});
test('Push-Abonnements erlauben keine fremden Protokolle, privaten Ziele oder manipulierten Schlüssel',async()=>{
 const {subscription}=await keys();assert.deepEqual(validateSubscription(subscription),{...subscription,expirationTime:null});
 for(const endpoint of ['http://fcm.googleapis.com/x','https://127.0.0.1/x','https://localhost/x','https://fcm.googleapis.com.evil.test/x','https://fcm.googleapis.com@evil.test/x','https://fcm.googleapis.com:8443/x','https://evil.test/x'])assert.throws(()=>validateSubscription({...subscription,endpoint}));
 assert.throws(()=>validateSubscription({...subscription,keys:{auth:'short',p256dh:'short'}}));
});
test('Echter RFC-8291-Push ist entschlüsselbar und VAPID-signiert; enthält keine Punkte oder Zugangsschlüssel',async()=>{
 const f=await fixture(),before=rollGame(f.game,()=>0),after=applyMove(before,0,{pass:true});f.commit(after);
 await deliverRoomNotices(f.env,f.code,before,after,{now:f.now,send:f.send});assert.equal(f.sent.length,1);
 const request=f.sent[0];assert.equal(request.headers['content-encoding'],'aes128gcm');assert.equal(request.headers.ttl,'86400');assert.equal(request.headers.urgency,'high');assert.equal(request.headers.topic,'farbfeld-game');assert.equal(request.redirect,'manual');
 const payload=await decryptPush(request.body,f.receiver,f.auth,f.publicKey);assert.equal(payload.event,'notification-test:1:turn');assert.equal(payload.code,f.code);assert.equal(payload.deviceId,f.id);assert.equal(payload.expiresAt,f.now+60000);assert.equal(payload.deliveryExpiresAt,f.now+86400000);
 assert(!JSON.stringify(payload).includes('guest-token'));assert(!JSON.stringify(payload).includes(f.secret));assert(!JSON.stringify(payload).includes('Robin'));assert(!JSON.stringify(payload).includes('Punkte'));
 const [jwt,publicKey]=request.headers.authorization.replace('vapid t=','').split(', k=');assert.equal(publicKey,f.env.FARBFELD_VAPID_PUBLIC_KEY);
 const [header,body,signature]=jwt.split('.'),claims=JSON.parse(Buffer.from(body,'base64url'));assert.equal(claims.aud,'https://fcm.googleapis.com');
 assert(await crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},f.pair.publicKey,Buffer.from(signature,'base64url'),Buffer.from(header+'.'+body)));
 const version=f.sql.prepare('SELECT version FROM rooms WHERE code = ?').get(f.code).version;
 await deliverRoomNotices(f.env,f.code,before,after,{now:f.now+61000,send:f.send});assert.equal(f.sent.length,1,'persistente Deduplizierung');assert.equal(f.sql.prepare('SELECT version FROM rooms WHERE code = ?').get(f.code).version,version);
});
test('Foreground, Minutenlimit, veraltete Partien und Netzwerkfehler erzeugen keine Meldungsflut',async()=>{
 const f=await fixture(),before=rollGame(f.game,()=>0),after=applyMove(before,0,{pass:true});f.commit(after);
 f.sql.prepare('UPDATE notification_devices SET visible_until = ?').run(f.now+45000);
 await deliverRoomNotices(f.env,f.code,before,after,{now:f.now,send:f.send});assert.equal(f.sent.length,0);
 f.sql.prepare('UPDATE notification_devices SET visible_until = 0').run();
 await deliverRoomNotices(f.env,f.code,before,after,{now:f.now,send:f.send});assert.equal(f.sent.length,1);
 const next=applyMove(after,1,{pass:true});f.commit(next);await deliverRoomNotices(f.env,f.code,after,next,{now:f.now+1000,send:f.send});assert.equal(f.sent.length,1,'höchstens einmal pro Minute');
 const stale=structuredClone(next);stale.round=20;await deliverRoomNotices(f.env,f.code,next,stale,{now:f.now+61000,send:f.send});assert.equal(f.sent.length,1,'aktuelle Datenbank gewinnt');
 f.sql.prepare('UPDATE notification_devices SET last_sent = 0,last_event = NULL').run();
 await deliverRoomNotices(f.env,f.code,after,next,{now:f.now+62000,send:async()=>{throw Error('Push-Netzwerk fehlt');}});
 await deliverRoomNotices(f.env,f.code,after,next,{now:f.now+125000,send:f.send});assert.equal(f.sent.length,2,'ein fehlgeschlagener Versand darf begrenzt wiederhergestellt werden');
 await deliverRoomNotices(f.env,f.code,after,next,{now:f.now+190000,send:f.send});assert.equal(f.sent.length,2,'nach Annahme keine Wiederholung');
});
test('Geräteschlüssel sind gehasht; fremde Schlüssel bleiben gesperrt und abgelaufene Endpunkte werden entfernt',async()=>{
 const f=await fixture();assert(await authenticatedDevice(f.DB,f.id,f.secret));assert.equal(await authenticatedDevice(f.DB,f.id,'c'.repeat(64)),null);
 const before=rollGame(f.game,()=>0),after=applyMove(before,0,{pass:true});f.commit(after);
 await deliverRoomNotices(f.env,f.code,before,after,{now:f.now,send:async()=>new Response(null,{status:410})});assert.equal(await authenticatedDevice(f.DB,f.id,f.secret),null);
});
test('Ein fehlendes Push-Setup stört bestehende Spielräume nicht',async()=>{
 await deliverRoomNotices({},'ABCD2345',null,{},{});
});
test('Transportfehler protokollieren nur feste Fehlerklassen, keine Nachrichten, Endpunkte oder Schlüssel',async t=>{
 const f=await fixture();t.after(()=>f.sql.close());const before=rollGame(f.game,()=>0),after=applyMove(before,0,{pass:true}),logs=[];f.commit(after);t.mock.method(console,'error',(...args)=>logs.push(args));
 await deliverRoomNotices(f.env,f.code,before,after,{now:f.now,send:async()=>{throw new TypeError(f.subscription.endpoint+' '+f.secret);}});
 assert.equal(logs.length,3);for(const entry of logs)assert.deepEqual(entry,['Farbfeld push dispatch failed',{types:['TypeError']}]);assert(!JSON.stringify(logs).includes(f.subscription.endpoint));assert(!JSON.stringify(logs).includes(f.secret));
});
test('Eine seit einer Stunde geschlossene App benötigt keinen Präsenzabruf für einen neuen Zug; Push bleibt 24 Stunden zustellbar',async()=>{
 const f=await fixture(),before=rollGame(f.game,()=>0),after=applyMove(before,0,{pass:true}),now=f.now+3600000;f.commit(after);
 f.sql.prepare('UPDATE notification_devices SET visible_until = ?').run(f.now+45000);
 await deliverRoomNotices(f.env,f.code,before,after,{now,send:f.send});assert.equal(f.sent.length,1);
 const payload=await decryptPush(f.sent[0].body,f.receiver,f.auth,f.publicKey);
 assert.equal(f.sent[0].headers.ttl,'86400');assert.equal(payload.at,now);assert.equal(payload.expiresAt,now+60000);assert.equal(payload.deliveryExpiresAt,now+86400000);
 await deliverRoomNotices(f.env,f.code,before,after,{now:now+3600000,send:f.send});assert.equal(f.sent.length,1,'kein zweiter Versand desselben Zuges');
 assert.equal(f.sql.prepare('SELECT updated_at FROM notification_devices').get().updated_at,f.now,'keine Hintergrund-Präsenz nötig');
});
function localClient(){
 const calls=[],document={hidden:false},Notification={permission:'granted'},controller=new GameNotifications({document,Notification,navigator:{onLine:false,serviceWorker:{addEventListener(){}}}});
 controller.state.enabled=true;controller.initialized=true;controller.call=async(action,value)=>{calls.push({action,value});return {ok:true};};
 return {controller,calls,document};
}
test('Offline-Direktmodus meldet nur neue eigene Gelegenheiten, nicht Laden, sichtbare Züge oder gegnerische Aktionen',()=>{
 const f=localClient();let game=createGame(['A','B'],'direct');game.gameId='local';f.controller.setContext(null,game,1,true);assert.equal(f.calls.length,0);
 game=rollGame(game,()=>0);f.controller.setContext(null,game,1,true);f.document.hidden=true;game=applyMove(game,0,{pass:true});f.controller.setContext(null,game,1,true);assert.equal(f.calls.filter(call=>call.action==='local').length,1);
 f.controller.setContext(null,game,1,true);assert.equal(f.calls.filter(call=>call.action==='local').length,1);
 f.controller.setContext(null,game,1,false);assert.equal(f.calls.filter(call=>call.action==='local').length,1);
 f.document.hidden=false;f.controller.setContext(null,game,1,true);assert(f.calls.some(call=>call.action==='seen'));
});
test('Keine automatische Berechtigungsanfrage, kein Internetzwang für lokales Aktivieren und sofortiges Ausschalten',async()=>{
 let prompts=0,state={enabled:false,sound:false,pushReady:false,deviceId:'',deviceKey:''};const controller=new GameNotifications({document:{hidden:false},navigator:{onLine:false,serviceWorker:{addEventListener(){}}},Notification:{permission:'default',async requestPermission(){prompts++;return 'granted';}}});
 controller.call=async(action,value)=>{if(action==='settings')Object.assign(state,value);return {ok:true,state:{...state}};};controller.detach=async()=>{};
 await controller.init();assert.equal(prompts,0);assert.equal(controller.state.enabled,false);await controller.enable();assert.equal(prompts,1);assert(controller.state.enabled);assert.equal(controller.state.sound,false);assert.equal(controller.state.pushReady,false);
 await controller.disable();assert.equal(controller.state.enabled,false);assert.equal(controller.state.pushReady,false);
});
test('Erststart wartet auf Offline-Bereitschaft; erneute Initialisierung entfernt eine überholte Startmeldung',async()=>{
 const f=localClient();f.controller.initialized=false;let attempts=0;
 f.controller.call=async(action)=>{if(action==='get'&&++attempts===1)throw Error('Offline-Vorbereitung läuft.');return {state:{enabled:false,sound:false,pushReady:false}};};
 await f.controller.init();assert.equal(f.controller.initialized,false);assert(f.controller.error.includes('Vorbereitung'));
 await f.controller.init();assert.equal(f.controller.initialized,true);assert.equal(f.controller.error,'');await f.controller.init();assert.equal(attempts,2,'keine wiederholte Initialisierung nach Erfolg');
});
test('Initialisierung im Hintergrund entfernt keine ungelesene Benachrichtigung',async()=>{
 const f=localClient();f.controller.initialized=false;f.document.hidden=true;
 f.controller.call=async(action,value)=>{f.calls.push({action,value});return {state:{enabled:true,sound:false,pushReady:false}};};
 await f.controller.init();assert(f.controller.initialized);assert(!f.calls.some(call=>call.action==='clear'));
 f.document.hidden=false;f.controller.visibility();assert(f.calls.some(call=>call.action==='clear'),'erst die sichtbare Rückkehr darf aufräumen');
});

function syncingClient(){
 let stored={enabled:true,sound:false,pushReady:false,deviceId:'a'.repeat(32),deviceKey:'b'.repeat(64)};
 const navigator={onLine:true,serviceWorker:{addEventListener(){}}},controller=new GameNotifications({document:{hidden:false},navigator,Notification:{permission:'granted'}});
 controller.initialized=true;controller.state={...stored};controller.registration=async()=>({pushManager:{async getSubscription(){return {options:{},toJSON(){return {endpoint:'https://fcm.googleapis.com/fcm/send/fixture'};}};}}});
 controller.call=async(action,value)=>{if(action==='settings')Object.assign(stored,value);return {state:{...stored}};};
 return controller;
}
const gate=()=>{let resolve;const promise=new Promise(r=>{resolve=r;});return {promise,resolve};};
test('Client meldet Revanche-Unterstützung nur nach Bestätigung des aktiven Workers',async()=>{
 for(const supported of [false,true]){
  const controller=syncingClient(),original=controller.call,requests=[];controller.state.pushReady=true;
  controller.call=async(action,value)=>({...await original(action,value),capabilities:supported?[REMATCH_PUSH_CAPABILITY]:[]});
  controller.request=async(action,value)=>{requests.push({action,value});return {ok:true};};
  await controller.sync();assert.equal(controller.error,'');assert.deepEqual(requests.find(item=>item.action==='presence').value.capabilities,supported?[REMATCH_PUSH_CAPABILITY]:[]);
 }
});
test('Push-Registrierung bestätigt nur den tatsächlich gebundenen Raum und gleicht einen Raumwechsel im laufenden Request ab',async t=>{
 const controller=syncingClient(),started=gate(),release=gate(),calls=[];
 const first={code:'ABCD2345',playerId:'host',token:'first-secret'},second={code:'WXYZ6789',playerId:'guest',token:'second-secret'};
 controller.room=first;t.mock.method(globalThis,'fetch',async()=>Response.json({configured:true,publicKey:'BA'}));
 controller.request=async(action,value,keepalive,context=controller.room)=>{calls.push({action,value,context});if(action==='register'){started.resolve();await release.promise;}return {ok:true};};
 const pending=controller.sync();await started.promise;controller.setContext(second,null,0);release.resolve();await pending;
 assert.equal(controller.bound,'WXYZ6789:guest');
 const registration=calls.find(call=>call.action==='register');assert.equal(registration.value.code,'ABCD2345');assert.equal(registration.context.token,'first-secret');
 const binding=calls.find(call=>call.action==='bind');assert.equal(binding.value.code,'WXYZ6789');assert.equal(binding.context.token,'second-secret');
 assert.equal(calls.filter(call=>call.action==='register').length,1);
});
test('Raumwechsel während bind erhält den passenden Zugang und wird ohne zusätzlichen Poll-Timer nachgeführt',async()=>{
 const controller=syncingClient(),started=gate(),release=gate(),calls=[];
 controller.state.pushReady=true;controller.room={code:'ABCD2345',playerId:'host',token:'first-secret'};
 controller.request=async(action,value,keepalive,context=controller.room)=>{calls.push({action,value,context});if(action==='bind'&&value.code==='ABCD2345'){started.resolve();await release.promise;}return {ok:true};};
 const pending=controller.sync();await started.promise;controller.setContext({code:'WXYZ6789',playerId:'guest',token:'second-secret'},null,0);release.resolve();await pending;
 assert.equal(controller.bound,'WXYZ6789:guest');assert.deepEqual(calls.filter(call=>call.action==='bind').map(call=>call.context.token),['first-secret','second-secret']);
 const count=calls.filter(call=>call.action==='bind').length;await controller.sync();assert.equal(calls.filter(call=>call.action==='bind').length,count,'unveränderte Zuordnung wird nicht neu gebunden');
});
test('Erfolgreicher Push-Abgleich entfernt alte Fehler und bleibt bei Verbindungsfehlern begrenzt',async()=>{
 const controller=syncingClient();controller.state.pushReady=true;controller.room={code:'ABCD2345',playerId:'host',token:'secret'};controller.bound='ABCD2345:host';controller.error='Vorher nicht erreichbar.';
 let requests=0;controller.request=async()=>{requests++;return {ok:true};};await controller.sync();assert.equal(controller.error,'');assert.equal(requests,1);
 controller.request=async()=>{requests++;throw Error('Netz fehlt');};await controller.sync();assert.equal(controller.error,'Netz fehlt');assert.equal(requests,2);
 await controller.sync();assert.equal(requests,2,'Fehler-Backoff verhindert ständige Wiederholungen auch bei bestehendem Push-Abo');
 controller.request=async()=>{requests++;return {ok:true};};await controller.retry();assert.equal(requests,3);assert.equal(controller.error,'');
});
test('Manuelle Zuordnungsprüfung bestätigt den Serverstand ohne Test-Push oder zusätzliche automatische Schleife',async t=>{
 const controller=syncingClient(),calls=[],reads=[];controller.state.pushReady=true;controller.room={code:'ABCD2345',playerId:'host',token:'player-secret'};
 controller.request=async(action,value)=>{calls.push({action,value});return {ok:true};};
 t.mock.method(globalThis,'fetch',async(url,options)=>{reads.push({url,options});return Response.json({enabled:true,code:'ABCD2345',hasRoomAccess:true,foreground:true,notice:{kind:'turn'},lastAttemptAt:null});});
 const result=await controller.checkConnection();assert.equal(result.code,'ABCD2345');assert.equal(result.notice,'turn');assert.equal(result.hasRoomAccess,true);assert.equal(reads.length,1);assert.equal(reads[0].url,'/api/notifications?status=1&history=1');assert(!reads[0].options.method||reads[0].options.method==='GET');assert.deepEqual(calls.map(call=>call.action),['bind','presence']);assert(!JSON.stringify(result).includes('secret'));
});
test('Manuelle Zuordnungsprüfung zeigt fremde/ungültige Serverbindung nicht als erfolgreich an',async t=>{
 const controller=syncingClient();controller.state.pushReady=true;controller.room={code:'ABCD2345',playerId:'host',token:'secret'};controller.request=async()=>({ok:true});
 t.mock.method(globalThis,'fetch',async()=>Response.json({enabled:true,code:'WXYZ6789',hasRoomAccess:true}));
 await assert.rejects(controller.checkConnection(),/nicht bestätigt/);assert.equal(controller.bound,null);assert.equal(controller.connection,null);assert(controller.error);
});
test('Ausschalten während einer Raumbindung stellt danach keine Bindung oder Präsenz wieder her',async()=>{
 const controller=syncingClient(),started=gate(),release=gate(),calls=[];controller.state.pushReady=true;controller.room={code:'ABCD2345',playerId:'host',token:'secret'};
 controller.detach=async()=>{controller.bound=null;};controller.request=async(action)=>{calls.push(action);if(action==='bind'){started.resolve();await release.promise;}return {ok:true};};
 const pending=controller.sync();await started.promise;await controller.disable();release.resolve();await pending;
 assert.equal(controller.state.enabled,false);assert.equal(controller.bound,null);assert(!calls.includes('presence'));
});
test('Abgelehnter Push wird ohne Abonnement oder Geheimnisse protokolliert und nicht erneut versucht',async t=>{
 const f=await fixture(),before=rollGame(f.game,()=>0),after=applyMove(before,0,{pass:true});f.commit(after);const logs=[],send=t.mock.fn(async()=>new Response(null,{status:403}));t.mock.method(console,'error',(...args)=>logs.push(args));
 await deliverRoomNotices(f.env,f.code,before,after,{now:f.now,send});await deliverRoomNotices(f.env,f.code,before,after,{now:f.now+61000,send});
 assert.equal(send.mock.callCount(),1);assert.deepEqual(logs,[['Farbfeld push rejected',{status:403}]]);assert(!JSON.stringify(logs).includes(f.subscription.endpoint));assert(!JSON.stringify(logs).includes(f.secret));
});
test('Ein Gerät erhält Spielhinweise aus mehreren autorisierten Räumen mit gemeinsamer Minutensperre',async()=>{
 const f=await fixture();try{
  const otherCode='BBBB2345',otherGame=createGame(['Other A','Other B'],'room',['host','guest']);otherGame.gameId='other-game';const otherRoom={...f.room,game:otherGame,members:[{id:'host',name:'Other A',token:'other-host'},{id:'guest',name:'Other B',token:'other-guest'}]};
  f.sql.prepare('INSERT INTO rooms(code,state,version,expires_at) VALUES(?,?,1,0)').run(otherCode,JSON.stringify(otherRoom));const device=await authenticatedDevice(f.DB,f.id,f.secret);await bindNotificationDevice(f.DB,device,f.code,'guest-token',f.now);
  await bindNotificationRooms(f.DB,await authenticatedDevice(f.DB,f.id,f.secret),[{code:f.code,token:'guest-token'},{code:otherCode,token:'other-guest'}],f.now);assert.equal(f.sql.prepare('SELECT COUNT(*) AS n FROM notification_room_bindings').get().n,2);assert.equal(f.sql.prepare('SELECT room_code FROM notification_devices').get().room_code,f.code);
  const previous=rollGame(otherGame,()=>0),next=applyMove(previous,0,{pass:true});otherRoom.game=next;f.sql.prepare('UPDATE rooms SET state = ? WHERE code = ?').run(JSON.stringify(otherRoom),otherCode);
  await deliverRoomNotices(f.env,otherCode,previous,next,{now:f.now,send:f.send});assert.equal(f.sent.length,1);const payload=await decryptPush(f.sent[0].body,f.receiver,f.auth,f.publicKey);assert.equal(payload.code,otherCode);assert.equal((await roomForDevice(f.DB,await authenticatedDevice(f.DB,f.id,f.secret),f.now,otherCode)).notice.event,payload.event);
  await deliverRoomNotices(f.env,otherCode,previous,next,{now:f.now+61000,send:f.send});assert.equal(f.sent.length,1,'persistenter Ereignisschutz auch im anderen Raum');
  const aPrevious=rollGame(f.game,()=>0),aNext=applyMove(aPrevious,0,{pass:true});f.commit(aNext);await deliverRoomNotices(f.env,f.code,aPrevious,aNext,{now:f.now+5000,send:f.send});assert.equal(f.sent.length,1,'Minutenlimit gilt über alle Räume');
  const aRound=applyMove(aNext,1,{pass:true});f.commit(aRound);await deliverRoomNotices(f.env,f.code,aNext,aRound,{now:f.now+61000,send:f.send});assert.equal(f.sent.length,2);
  await bindNotificationRooms(f.DB,await authenticatedDevice(f.DB,f.id,f.secret),[{code:f.code,token:'guest-token'}],f.now+61000);assert.equal(await roomForDevice(f.DB,await authenticatedDevice(f.DB,f.id,f.secret),f.now+61000,otherCode),null);assert.equal(f.sql.prepare('SELECT COUNT(*) AS n FROM notification_room_bindings').get().n,1);
  f.sql.prepare('DELETE FROM notification_devices WHERE id = ?').run(f.id);assert.equal(f.sql.prepare('SELECT COUNT(*) AS n FROM notification_room_bindings').get().n,0);
 }finally{f.sql.close();}
});
test('Sammelbindung verlangt für jeden Raum den passenden Spielerzugang und verändert keine Spielstände',async()=>{
 const f=await fixture();try{
  const before=f.sql.prepare('SELECT * FROM rooms').get(),device=await authenticatedDevice(f.DB,f.id,f.secret);
  assert.deepEqual(await bindNotificationRooms(f.DB,device,[{code:f.code,token:'wrong'}],f.now),[]);assert.equal(f.sql.prepare('SELECT COUNT(*) AS n FROM notification_room_bindings').get().n,0);assert.deepEqual(f.sql.prepare('SELECT * FROM rooms').get(),before);
  assert.deepEqual(await bindNotificationRooms(f.DB,device,[{code:f.code,token:'guest-token'}],f.now),[f.code]);assert.deepEqual(f.sql.prepare('SELECT * FROM rooms').get(),before);
  await assert.rejects(bindNotificationRooms(f.DB,device,Array(51).fill({code:f.code,token:'guest-token'}),f.now));await assert.rejects(bindNotificationRooms(f.DB,device,[{code:f.code,token:'guest-token'},{code:f.code,token:'guest-token'}],f.now));
 }finally{f.sql.close();}
});
test('Client gleicht mehrere gespeicherte Räume ohne neuen Poll-Timer ab und markiert sichtbare Hinweise gesammelt',async()=>{
 const document={hidden:false},controller=new GameNotifications({document,navigator:{onLine:true,serviceWorker:{addEventListener(){}}},Notification:{permission:'granted'}}),requests=[],messages=[];
 const a={code:'AAAA2345',token:'token-a',playerId:'a'},b={code:'BBBB2345',token:'token-b',playerId:'b'};controller.initialized=true;controller.state={enabled:true,pushReady:true};controller.room=a;controller.bound=a.code+':'+a.playerId;
 controller.request=async(action,value,keepalive,target)=>{requests.push({action,value,target});return {ok:true,codes:(value.rooms||[]).map(room=>room.code)};};controller.call=async(action,value)=>{messages.push({action,value});return {ok:true};};
 controller.setRooms([a,b]);await controller.sync();assert.equal(requests.filter(item=>item.action==='bind-rooms').length,1);assert.deepEqual(controller.boundRoomCodes,[a.code,b.code]);controller.setContext(b,null,-1);await controller.sync();assert.equal(controller.bound,b.code+':'+b.playerId);assert.equal(requests.filter(item=>item.action==='bind-rooms').length,1,'Raumwechsel registriert nicht alle Räume erneut');
 controller.setRooms([b]);await controller.sync();assert.deepEqual(controller.boundRoomCodes,[b.code]);const events=[{noticeEvent:'a-game:1:turn'},{noticeEvent:'b-game:finished'}];controller.seeRooms(events);controller.seeRooms(events);await Promise.resolve();const seen=messages.filter(item=>item.action==='seen-list');assert.equal(seen.length,1);assert.deepEqual(seen[0].value.events,events.map(item=>item.noticeEvent));document.hidden=true;controller.seeRooms([{noticeEvent:'hidden-game:1:turn'}]);assert.equal(messages.filter(item=>item.action==='seen-list').length,1);
});

test('Outbox: 503 wird begrenzt wiederholt, derselbe Hinweis nach Annahme nicht erneut gesendet',async t=>{
 const f=await fixture();t.after(()=>f.sql.close());const before=rollGame(f.game,()=>0),after=applyMove(before,0,{pass:true});f.commit(after);
 let at=f.now,calls=0;const send=async()=>new Response(null,{status:++calls===1?503:201});
 await deliverRoomNotices(f.env,f.code,before,after,{now:at,clock:()=>at,sleep:async ms=>{at+=ms;},send});
 assert.equal(calls,2);const job=f.sql.prepare('SELECT * FROM notification_dispatches').get();assert.equal(job.state,'accepted');assert.equal(job.attempts,2);
 assert.equal((await pushHistory(f.DB,f.id))[0].attempt,2);assert.equal((await pushHistory(f.DB,f.id))[0].transport,'accepted');
 await drainPushOutbox(f.env,{now:at+60000,send});assert.equal(calls,2);assert.equal(f.sql.prepare('SELECT last_sent FROM notification_devices').get().last_sent,f.now);
});
test('Outbox: persistierter Versand übersteht einen abgebrochenen Request und konkurrierende Wiederaufnahme',async t=>{
 const f=await fixture();t.after(()=>f.sql.close());const before=rollGame(f.game,()=>0),after=applyMove(before,0,{pass:true});f.commit(after);const snapshot=f.sql.prepare('SELECT * FROM rooms').get();
 await enqueueRoomNotices(f.env,f.code,before,after,{now:f.now});assert.equal(f.sent.length,0);
 assert.equal(f.sql.prepare('SELECT state FROM notification_dispatches').get().state,'pending');
 await Promise.all([drainPushOutbox(f.env,{now:f.now+30000,send:f.send}),drainPushOutbox(f.env,{now:f.now+30000,send:f.send})]);
 assert.equal(f.sent.length,1);assert.deepEqual(f.sql.prepare('SELECT * FROM rooms').get(),snapshot);
});
test('Outbox: maximal vier Versuche, auch nach Neustart; Zeitvorgabe des Providers wird eingehalten',async t=>{
 const f=await fixture();t.after(()=>f.sql.close());const before=rollGame(f.game,()=>0),after=applyMove(before,0,{pass:true});f.commit(after);
 let at=f.now,calls=0;const send=async()=>{calls++;return new Response(null,{status:503});};
 await deliverRoomNotices(f.env,f.code,before,after,{now:at,clock:()=>at,sleep:async ms=>{at+=ms;},send});assert.equal(calls,3);
 await drainPushOutbox(f.env,{now:at+30000,send});assert.equal(calls,4);
 await drainPushOutbox(f.env,{now:at+90000,send});assert.equal(calls,4);assert.equal(f.sql.prepare('SELECT state FROM notification_dispatches').get().state,'stopped');
 const g=await fixture();try{g.commit(after);await enqueueRoomNotices(g.env,g.code,before,after,{now:g.now});let count=0;
  const throttled=async()=>{count++;return new Response(null,{status:count===1?429:201,headers:{'Retry-After':'120'}});};
  await drainPushOutbox(g.env,{now:g.now,send:throttled});assert.equal(count,1);
  await drainPushOutbox(g.env,{now:g.now+119000,send:throttled});assert.equal(count,1);
  await drainPushOutbox(g.env,{now:g.now+120000,send:throttled});assert.equal(count,2);
 }finally{g.sql.close();}
});
test('Outbox: überholte, abgemeldete, ersetzte und deaktivierte Ziele werden vor Versand verworfen',async()=>{
 for(const change of ['stale','unbound','endpoint','disabled','expired']){
  const f=await fixture();try{const before=rollGame(f.game,()=>0),after=applyMove(before,0,{pass:true});f.commit(after);await enqueueRoomNotices(f.env,f.code,before,after,{now:f.now});
   if(change==='stale')f.commit(applyMove(after,1,{pass:true}));
   if(change==='unbound')f.sql.prepare("UPDATE notification_devices SET room_code = '',player_id = ''").run();
   if(change==='endpoint')f.sql.prepare("UPDATE notification_devices SET endpoint_hash = 'new-endpoint'").run();
   if(change==='disabled')f.sql.prepare('UPDATE notification_devices SET enabled = 0').run();
   await drainPushOutbox(f.env,{now:f.now+(change==='expired'?86400001:100),send:f.send});assert.equal(f.sent.length,0,change);assert.equal(f.sql.prepare('SELECT state FROM notification_dispatches').get().state,'stopped',change);
  }finally{f.sql.close();}
 }
});
test('Outbox: fehlende Prüfung quittiert einen Wiederholungsbedarf; alte Versuch-Quittung überschreibt keinen neuen Versuch',async t=>{
 const f=await fixture();t.after(()=>f.sql.close());const before=rollGame(f.game,()=>0),after=applyMove(before,0,{pass:true});f.commit(after);
 await deliverRoomNotices(f.env,f.code,before,after,{now:f.now,send:f.send});let device=await authenticatedDevice(f.DB,f.id,f.secret),event=device.last_event;
 assert.equal(await recordPushReceipt(f.DB,device,event,'verify-network',f.now+10,1),true);
 assert.equal(f.sql.prepare('SELECT state FROM notification_dispatches').get().state,'pending');
 await drainPushOutbox(f.env,{now:f.now+61000,send:f.send});assert.equal(f.sent.length,2);
 device=await authenticatedDevice(f.DB,f.id,f.secret);assert.equal(await recordPushReceipt(f.DB,device,event,'shown',f.now+61001,1),false);
 assert.equal(await recordPushReceipt(f.DB,device,event,'shown',f.now+61001,2),true);
 await drainPushOutbox(f.env,{now:f.now+180000,send:f.send});assert.equal(f.sent.length,2);
});
test('Zustellverlauf bleibt auf zwanzig eigene Einträge begrenzt, mit Klickquittung ohne private Felder',async t=>{
 const f=await fixture();t.after(()=>f.sql.close());let first;
 for(let i=0;i<24;i++){
  const device=await authenticatedDevice(f.DB,f.id,f.secret),result=await sendPushTest(f.env,device,{now:f.now+i*61000,send:f.send});first??=result.delivery.event;
 }
 const history=await pushHistory(f.DB,f.id);assert.equal(history.length,20);assert(!history.some(item=>item.event===first));assert(!JSON.stringify(history).includes(f.subscription.endpoint));assert(!JSON.stringify(history).includes(f.secret));
 const device=await authenticatedDevice(f.DB,f.id,f.secret),event=history[0].event,at=history[0].at+1;
 assert.equal(await recordPushReceipt(f.DB,device,event,'shown',at,1),true);
 assert.equal(await recordPushReceipt(f.DB,await authenticatedDevice(f.DB,f.id,f.secret),event,'clicked',at+1,1),true);
 assert.equal((await pushHistory(f.DB,f.id))[0].clickedAt,at+1);
 assert.equal((await pushHistory(f.DB,'c'.repeat(32))).length,0);
});
test('Wiederaufnahme akzeptiert nur gespeicherte Ereignisse und ist global auf einen Lauf pro Minute begrenzt',async t=>{
 const f=await fixture();t.after(()=>f.sql.close());assert.deepEqual(await maintainPushOutbox(f.env,{now:f.now,send:f.send}),{ok:true,processed:0,lastSweepAt:f.now});assert.equal(f.sent.length,0);
 assert.equal((await maintainPushOutbox(f.env,{now:f.now+1000,send:f.send})).skipped,true);
});
