import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';

// Use the same installed Worker runtime and compatibility settings as the app.
// Node's fetch accepts redirect:"error"; workerd rejects it before any I/O.
const require=createRequire(fs.realpathSync(new URL('../node_modules/wrangler/package.json',import.meta.url)));
const {Miniflare,NoOpLog}=await import(pathToFileURL(require.resolve('miniflare')));
const {build}=await import(pathToFileURL(require.resolve('esbuild')));
const root=fs.realpathSync(new URL('..',import.meta.url));
const bundled=await build({stdin:{sourcefile:'push-runtime-fixture.js',resolveDir:root,contents:`
 import {deliverRoomNotices,sendPushTest} from './lib/notifications.js';
 import {createGame,rollGame,applyMove} from './public/game/engine.js';
 const b64=bytes=>btoa(String.fromCharCode(...new Uint8Array(bytes))).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
 export default {async fetch(request,env){
  const pair=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']);
  const jwk=await crypto.subtle.exportKey('jwk',pair.privateKey),receiver=await crypto.subtle.generateKey({name:'ECDH',namedCurve:'P-256'},true,['deriveBits']);
  const subscription={endpoint:'https://fcm.googleapis.com/fcm/send/runtime-fixture',keys:{p256dh:b64(await crypto.subtle.exportKey('raw',receiver.publicKey)),auth:b64(crypto.getRandomValues(new Uint8Array(16)))}};
  const config={DB:env.DB,FARBFELD_VAPID_SUBJECT:'https://farbfeld.test',FARBFELD_VAPID_PUBLIC_KEY:b64(await crypto.subtle.exportKey('raw',pair.publicKey)),FARBFELD_VAPID_PRIVATE_KEY:jwk.d};
  const code='RUNT2345',id='a'.repeat(32),now=Date.now();
  const game=createGame(['Host','Guest'],'room',['host','guest']);game.gameId='runtime-game';
  const before=rollGame(game,()=>0),after=applyMove(before,0,{pass:true});
  const room={members:[{id:'host'},{id:'guest'}],hostId:'host',game:after};
  await env.DB.prepare('INSERT INTO rooms(code,state,version,expires_at) VALUES(?,?,1,?)').bind(code,JSON.stringify(room),now+86400000).run();
  await env.DB.prepare('INSERT INTO notification_devices(id,secret_hash,endpoint_hash,subscription,room_code,player_id,updated_at) VALUES(?,?,?,?,?,?,?)').bind(id,'fixture-secret-hash','fixture-endpoint-hash',JSON.stringify(subscription),code,'guest',now).run();
  if(new URL(request.url).pathname==='/internet-test'){
   const device=await env.DB.prepare('SELECT * FROM notification_devices WHERE id = ?').bind(id).first();
   const result=await sendPushTest(config,device,{now}),again=await sendPushTest(config,device,{now:now+1000});
   return Response.json({transport:result.delivery.transport,kind:result.delivery.kind,limited:again.limited});
  }
  // Exercise the real default fetch, not a send function injected into the library.
  await deliverRoomNotices(config,code,before,after,{now});
  await deliverRoomNotices(config,code,before,after,{now:now+61000});
  if(new URL(request.url).pathname==='/retry-fixture'){const job=await env.DB.prepare('SELECT attempts,state FROM notification_dispatches WHERE device_id = ?').bind(id).first();return Response.json(job);}
  const device=await env.DB.prepare('SELECT last_sent,last_event FROM notification_devices WHERE id = ?').bind(id).first();
  return Response.json({claimed:device.last_sent===now,event:device.last_event});
 }};
`},bundle:true,format:'esm',platform:'browser',target:'es2022',write:false});

async function fixture(t,status){
 const sent=[];
 const mf=new Miniflare({modules:true,script:bundled.outputFiles[0].text,compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],log:new NoOpLog(),d1Databases:{DB:'push-runtime-fixture'},outboundService:async request=>{
  sent.push({host:new URL(request.url).hostname,method:request.method,bytes:(await request.arrayBuffer()).byteLength,encoding:request.headers.get('content-encoding'),ttl:request.headers.get('ttl')});
  const code=Array.isArray(status)?status[Math.min(sent.length-1,status.length-1)]:status;
  return new Response(null,{status:code,headers:code===302?{Location:'https://redirect-target.invalid/'}:{}});
 }});
 t.after(()=>mf.dispose());
 const db=await mf.getD1Database('DB');
 for(const file of fs.readdirSync(root+'/drizzle').filter(name=>name.endsWith('.sql')).sort())for(const statement of fs.readFileSync(root+'/drizzle/'+file,'utf8').split('--> statement-breakpoint'))if(statement.trim())await db.prepare(statement).run();
 return {mf,sent};
}
test('Produktionsruntime: echter verschlüsselter Zug-Push erreicht den Transport genau einmal',async t=>{
 const {mf,sent}=await fixture(t,201),response=await mf.dispatchFetch('https://farbfeld.test/push-fixture');
 assert.equal(response.status,200);assert.deepEqual(await response.json(),{claimed:true,event:'runtime-game:1:turn'});
 assert.deepEqual(sent,[{host:'fcm.googleapis.com',method:'POST',bytes:4096,encoding:'aes128gcm',ttl:'86400'}]);
});
test('Produktionsruntime: Push-Redirect bleibt eine Ablehnung, ohne Weitergabe oder Wiederholung',async t=>{
 const {mf,sent}=await fixture(t,302),response=await mf.dispatchFetch('https://farbfeld.test/push-fixture');
 assert.equal(response.status,200);assert.equal((await response.json()).claimed,true);
 assert.equal(sent.length,1);assert.equal(sent[0].host,'fcm.googleapis.com');
});
test('Produktionsruntime: expliziter Internet-Test nutzt denselben Transport mit kurzer Frist und Minutenlimit',async t=>{
 const {mf,sent}=await fixture(t,201),response=await mf.dispatchFetch('https://farbfeld.test/internet-test');
 assert.deepEqual(await response.json(),{transport:'accepted',kind:'test',limited:true});assert.equal(sent.length,1);assert.equal(sent[0].ttl,'60');
});

test('Produktionsruntime: temporäres HTTP 503 wird mit echtem fetch und D1 einmal bis Annahme wiederholt',async t=>{
 const {mf,sent}=await fixture(t,[503,201]),response=await mf.dispatchFetch('https://farbfeld.test/retry-fixture');
 assert.equal(response.status,200);assert.deepEqual(await response.json(),{attempts:2,state:'accepted'});assert.equal(sent.length,2);assert(sent.every(item=>item.host==='fcm.googleapis.com'&&item.method==='POST'&&item.bytes===4096&&item.encoding==='aes128gcm'));
});
