import {buildPushPayload} from '@block65/webcrypto-web-push';
import {noticeForGame,noticeForGameEvent,NOTICE_COOLDOWN,NOTICE_TTL,PUSH_TTL} from '../public/game/notification-policy.js';

const DEVICE=/^[a-f0-9]{32}$/;
const KEY=/^[a-f0-9]{64}$/;
const PUSH_HOSTS=new Set(['fcm.googleapis.com','updates.push.services.mozilla.com','web.push.apple.com']);
export const PUSH_MAX_ATTEMPTS=4;
const HISTORY_LIMIT=20,DISPATCH_LEASE=15000;
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const PUSH_ENV=['FARBFELD_VAPID_PUBLIC_KEY','FARBFELD_VAPID_PRIVATE_KEY','FARBFELD_VAPID_SUBJECT'];
export const pushConfigured=env=>PUSH_ENV.every(name=>typeof env[name]==='string'&&env[name].length>10);
export const validDevice=(id,key)=>typeof id==='string'&&DEVICE.test(id)&&typeof key==='string'&&KEY.test(key);
export async function secretHash(value){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))].map(n=>n.toString(16).padStart(2,'0')).join('');}
export function validateSubscription(input){
 if(!input||typeof input.endpoint!=='string'||input.endpoint.length>2048)throw Error('Die Benachrichtigungsadresse ist ungültig.');
 const url=new URL(input.endpoint);
 const host=url.hostname.toLowerCase();
 if(url.protocol!=='https:'||url.port||url.username||url.password||url.hash||!url.pathname.slice(1)||!(PUSH_HOSTS.has(host)||/^[a-z0-9-]+\.notify\.windows\.com$/.test(host)))throw Error('Dieser Push-Dienst wird nicht unterstützt.');
 const auth=input.keys?.auth,p256dh=input.keys?.p256dh;
 if(typeof auth!=='string'||!/^[A-Za-z0-9_-]{22}$/.test(auth)||typeof p256dh!=='string'||!/^[A-Za-z0-9_-]{87}$/.test(p256dh))throw Error('Die Benachrichtigungsschlüssel sind ungültig.');
 const point=Uint8Array.from(atob(p256dh.replaceAll('-','+').replaceAll('_','/')),c=>c.charCodeAt(0));
 if(point.length!==65||point[0]!==4)throw Error('Die Benachrichtigungsschlüssel sind ungültig.');
 return {endpoint:url.href,expirationTime:null,keys:{auth,p256dh}};
}
export async function authenticatedDevice(db,id,key){
 if(!validDevice(id,key))return null;
 return await db.prepare('SELECT * FROM notification_devices WHERE id = ? AND secret_hash = ?').bind(id,await secretHash(key)).first();
}
const RECEIPTS=new Set(['shown','foreground','seen','cooldown','stale','verify-network','disabled','subscription','invalid','display-error']);
const REASONS=new Set(['prepare','network','timeout','provider','foreground','stale','cooldown','subscription','deadline','disabled']);
export function deliveryInfo(device){
 let value;try{value=JSON.parse(device?.delivery||'null');}catch{return null;}
 if(!value||typeof value.event!=='string'||value.event.length>200||!['test','turn','finished','rematch'].includes(value.kind)||!Number.isSafeInteger(value.at)||!['pending','accepted','failed','expired'].includes(value.transport))return null;
 return {event:value.event,kind:value.kind,at:value.at,transport:value.transport,...(Number.isInteger(value.httpStatus)&&value.httpStatus>=100&&value.httpStatus<=599?{httpStatus:value.httpStatus}:{}),...(REASONS.has(value.reason)?{reason:value.reason}:{}),...(Number.isInteger(value.attempt)&&value.attempt>=1&&value.attempt<=PUSH_MAX_ATTEMPTS?{attempt:value.attempt}:{}),...(Number.isSafeInteger(value.retryAt)&&value.retryAt>0?{retryAt:value.retryAt}:{}),...(Number.isSafeInteger(value.clickedAt)?{clickedAt:value.clickedAt}:{}),...(RECEIPTS.has(value.outcome)&&Number.isSafeInteger(value.receivedAt)?{outcome:value.outcome,receivedAt:value.receivedAt}:{})};
}
async function patchDelivery(db,id,event,patch,attempt=null){
 const guard=attempt===null?'':" AND COALESCE(json_extract(delivery, '$.attempt'),1) = ?";
 const args=[JSON.stringify(patch),id,event,...(attempt===null?[]:[attempt])];
 await db.batch([
  db.prepare("UPDATE notification_devices SET delivery = json_patch(delivery, ?) WHERE id = ? AND json_extract(delivery, '$.event') = ?"+guard).bind(...args),
  db.prepare('UPDATE notification_dispatches SET delivery = json_patch(delivery, ?) WHERE device_id = ? AND event = ?'+guard).bind(...args),
 ]);
}
export async function pushHistory(db,id){
 const rows=await db.prepare('SELECT delivery FROM notification_dispatches WHERE device_id = ? ORDER BY created_at DESC,event DESC LIMIT '+HISTORY_LIMIT).bind(id).all();
 return rows.results.map(deliveryInfo).filter(Boolean);
}
export async function recordPushReceipt(db,device,event,outcome,now=Date.now(),attempt=1){
 const row=await db.prepare('SELECT * FROM notification_dispatches WHERE device_id = ? AND event = ?').bind(device.id,event).first();
 const current=deliveryInfo(device),delivery=current?.event===event?current:deliveryInfo(row);
 if(!delivery||delivery.event!==event||!Number.isInteger(attempt)||attempt<1||attempt>PUSH_MAX_ATTEMPTS||(delivery.attempt||1)!==attempt||now<delivery.at||now-delivery.at>PUSH_TTL)return false;
 if(outcome==='clicked'){
  if(delivery.clickedAt||!['shown','seen'].includes(delivery.outcome))return false;
  await patchDelivery(db,device.id,event,{clickedAt:now},attempt);return true;
 }
 if(delivery.receivedAt||!RECEIPTS.has(outcome))return false;
 const patch={outcome,receivedAt:now},encoded=JSON.stringify(patch);
 // The first receipt wins per attempt, including a receipt racing the provider.
 const result=await db.prepare("UPDATE notification_devices SET delivery = json_patch(delivery, ?) WHERE id = ? AND json_extract(delivery, '$.event') = ? AND json_extract(delivery, '$.receivedAt') IS NULL AND COALESCE(json_extract(delivery, '$.attempt'),1) = ?").bind(encoded,device.id,event,attempt).run();
 let recorded=!!result.meta.changes;
 if(row){
  const history=await db.prepare("UPDATE notification_dispatches SET delivery = json_patch(delivery, ?) WHERE device_id = ? AND event = ? AND json_extract(delivery, '$.receivedAt') IS NULL AND COALESCE(json_extract(delivery, '$.attempt'),1) = ?").bind(encoded,device.id,event,attempt).run();recorded=recorded||!!history.meta.changes;
  if(recorded){
   const recover=['verify-network','display-error'].includes(outcome)&&row.room_code&&row.attempts<PUSH_MAX_ATTEMPTS&&row.expires_at>now+60000;
   await db.prepare('UPDATE notification_dispatches SET state = ?,next_attempt_at = ?,lease_until = 0 WHERE device_id = ? AND event = ? AND attempts = ?').bind(recover?'pending':'stopped',recover?now+60000:0,device.id,event,attempt).run();
   if(recover)await patchDelivery(db,device.id,event,{retryAt:now+60000},attempt);
  }
 }
 return recorded;
}
async function rememberDispatch(db,device,payload,{code=null,playerId=null,state='pending',attempts=0}={}){
 await db.prepare('INSERT OR IGNORE INTO notification_dispatches(device_id,event,room_code,player_id,endpoint_hash,created_at,expires_at,next_attempt_at,state,attempts,delivery) VALUES(?,?,?,?,?,?,?,?,?,?,?)').bind(device.id,payload.event,code,playerId,device.endpoint_hash,payload.at,payload.deliveryExpiresAt||payload.expiresAt,payload.at,state,attempts,JSON.stringify(payload.delivery||{event:payload.event,kind:payload.kind,at:payload.at,transport:'pending'})).run();
 await db.prepare('DELETE FROM notification_dispatches WHERE device_id = ? AND state != ? AND event NOT IN (SELECT event FROM notification_dispatches WHERE device_id = ? ORDER BY created_at DESC,event DESC LIMIT '+HISTORY_LIMIT+')').bind(device.id,'pending',device.id).run();
}
async function sendDevicePush(env,device,payload,{send=fetch,now=Date.now()}={}){
 let stage='prepare',patch,retryAfter=0;
 try{
  const subscription=validateSubscription(JSON.parse(device.subscription));
  const request=await buildPushPayload({data:payload,options:{ttl:Math.max(1,Math.ceil(((payload.deliveryExpiresAt||payload.expiresAt)-now)/1000)),urgency:'high',topic:'farbfeld-game'}},subscription,{subject:env.FARBFELD_VAPID_SUBJECT,publicKey:env.FARBFELD_VAPID_PUBLIC_KEY,privateKey:env.FARBFELD_VAPID_PRIVATE_KEY});
  stage='network';
  // workerd rejects "error". Manual mode never forwards a push to a redirect.
  const response=await send(subscription.endpoint,{...request,redirect:'manual',signal:AbortSignal.timeout(5000)});
  patch={transport:response.ok?'accepted':response.status===404||response.status===410?'expired':'failed',httpStatus:response.status,...(!response.ok?{reason:'provider'}:{})};
  const retry=response.headers.get('Retry-After');if(retry){const seconds=Number(retry),date=Date.parse(retry);retryAfter=Number.isFinite(seconds)&&seconds>=0?seconds*1000:Number.isFinite(date)?Math.max(0,date-now):0;}
  if(response.ok)console.info('Farbfeld push accepted',{status:response.status});
  else console.error('Farbfeld push rejected',{status:response.status});
 }catch(error){
  const allowed=new Set(['Error','TypeError','DataError','OperationError','InvalidAccessError','NotSupportedError','TimeoutError','AbortError']);
  patch={transport:'failed',reason:stage==='prepare'?'prepare':['TimeoutError','AbortError'].includes(error?.name)?'timeout':'network'};
  console.error('Farbfeld push dispatch failed',{types:[allowed.has(error?.name)?error.name:'Error']});
 }
 await patchDelivery(env.DB,device.id,payload.event,patch,payload.dispatchAttempt||null);
 const latest=await env.DB.prepare('SELECT * FROM notification_devices WHERE id = ?').bind(device.id).first();
 if(patch.transport==='expired')await env.DB.prepare('DELETE FROM notification_devices WHERE id = ? AND endpoint_hash = ?').bind(device.id,device.endpoint_hash).run();
 return {...(deliveryInfo(latest)?.event===payload.event?deliveryInfo(latest):{event:payload.event,kind:payload.kind,at:payload.at,...patch}),retryAfter};
}
export async function sendPushTest(env,device,{now=Date.now(),send=fetch}={}){
 if(!pushConfigured(env))throw Object.assign(Error('Internet-Push ist auf dem Server noch nicht eingerichtet.'),{status:503});
 const event='push-test:'+crypto.randomUUID(),delivery={event,kind:'test',at:now,transport:'pending'};
 const claim=await env.DB.prepare('UPDATE notification_devices SET last_sent = ?, delivery = ? WHERE id = ? AND enabled = 1 AND last_sent <= ?').bind(now,JSON.stringify(delivery),device.id,now-NOTICE_COOLDOWN).run();
 if(!claim.meta.changes){const current=await env.DB.prepare('SELECT * FROM notification_devices WHERE id = ?').bind(device.id).first();return {limited:true,retryAfter:Math.max(1,Math.ceil(((current?.last_sent||now)+NOTICE_COOLDOWN-now)/1000)),delivery:deliveryInfo(current)};}
 // An explicit test targets only this authenticated installation, without a room.
 const payload={schema:1,kind:'test',event,mode:'test',deviceId:device.id,at:now,expiresAt:now+NOTICE_TTL};
 await rememberDispatch(env.DB,device,{...payload,delivery:{...delivery,attempt:1}},{state:'stopped',attempts:1});
 await patchDelivery(env.DB,device.id,event,{attempt:1});
 const result=await sendDevicePush(env,device,payload,{send,now});delete result.retryAfter;
 return {limited:false,delivery:result};
}
const deviceNotice=(game,pid,device,event)=>{const notice=noticeForGameEvent(game,pid,event);return notice?.kind==='rematch'&&!device.rematch_ready?null:notice;};
/** @param {string|null} [event] */
export async function roomForDevice(db,device,now=Date.now(),code=device.room_code,event=null){
 if(!code)return null;
 let playerId=device.room_code===code?device.player_id:null;
 if(!playerId){const binding=await db.prepare('SELECT player_id FROM notification_room_bindings WHERE device_id = ? AND room_code = ?').bind(device.id,code).first();playerId=binding?.player_id;}
 if(!playerId)return null;
 const row=await db.prepare('SELECT state,version FROM rooms WHERE code = ?').bind(code).first();
 if(!row)return null;const room=JSON.parse(row.state),pid=room.members.findIndex(member=>member.id===playerId);
 if(pid<0)return null;
 let notice=deviceNotice(room.game,pid,device,event);
 if(event&&notice?.kind==='rematch'){
  const turn=await db.prepare('SELECT delivery FROM notification_dispatches WHERE device_id = ? AND event = ?').bind(device.id,room.game.gameId+':1:turn').first();
  if(deliveryInfo(turn)?.transport==='accepted')notice=null;
 }
 return {room,pid,code,version:row.version,notice};
}
export async function bindNotificationDevice(db,device,code,playerToken,now=Date.now()){
 if(!code){await db.prepare('UPDATE notification_devices SET room_code = ?, player_id = ?, last_event = NULL, updated_at = ? WHERE id = ?').bind('','',now,device.id).run();return;}
 if(typeof code!=='string'||!/^[A-Z2-9]{8}$/.test(code))throw Error('Der Spielraum ist ungültig.');
 const row=await db.prepare('SELECT state,version FROM rooms WHERE code = ?').bind(code).first();
 if(!row)throw Error('Dieser Spielraum ist nicht mehr verfügbar.');
 const room=JSON.parse(row.state),pid=room.members.findIndex(member=>member.token===playerToken);
 if(pid<0)throw Error('Dein Zugang zu diesem Spielraum fehlt.');
 const event=deviceNotice(room.game,pid,device)?.event||null;
 await db.batch([
  db.prepare('UPDATE notification_devices SET room_code = ?, player_id = ?, last_event = ?, updated_at = ? WHERE id = ?').bind(code,room.members[pid].id,event,now,device.id),
  db.prepare('INSERT INTO notification_room_bindings(device_id,room_code,player_id,last_event,updated_at) VALUES(?,?,?,?,?) ON CONFLICT(device_id,room_code) DO UPDATE SET player_id = excluded.player_id,last_event = excluded.last_event,updated_at = excluded.updated_at').bind(device.id,code,room.members[pid].id,event,now),
 ]);
}
export async function bindNotificationRooms(db,device,sessions,now=Date.now()){
 if(!Array.isArray(sessions)||sessions.length>50||sessions.some(m=>!m||typeof m.code!=='string'||!/^[A-Z2-9]{8}$/.test(m.code)||typeof m.token!=='string'||!m.token||m.token.length>128)||new Set(sessions.map(m=>m.code)).size!==sessions.length)throw Error('Ungültige gespeicherte Raumzugänge.');
 const found=sessions.length?(await db.prepare('SELECT code,state FROM rooms WHERE code IN ('+sessions.map(()=>'?').join(',')+')').bind(...sessions.map(m=>m.code)).all()).results:[];
 const valid=[];for(const session of sessions){const row=found.find(row=>row.code===session.code);if(!row)continue;const room=JSON.parse(row.state),member=room.members.find(m=>m.token===session.token);if(member)valid.push({code:session.code,playerId:member.id});}
 const keep=valid.length?' AND room_code NOT IN ('+valid.map(()=>'?').join(',')+')':'';
 const statements=[db.prepare('DELETE FROM notification_room_bindings WHERE device_id = ?'+keep).bind(device.id,...valid.map(m=>m.code))];
 for(const member of valid)statements.push(db.prepare('INSERT INTO notification_room_bindings(device_id,room_code,player_id,last_event,updated_at) VALUES(?,?,?,NULL,?) ON CONFLICT(device_id,room_code) DO UPDATE SET last_event = CASE WHEN player_id = excluded.player_id THEN last_event ELSE NULL END, player_id = excluded.player_id, updated_at = excluded.updated_at').bind(device.id,member.code,member.playerId,now));
 if(device.room_code&&!valid.some(m=>m.code===device.room_code&&m.playerId===device.player_id))statements.push(db.prepare("UPDATE notification_devices SET room_code = '',player_id = '',last_event = NULL WHERE id = ?").bind(device.id));
 await db.batch(statements);return valid.map(m=>m.code);
}
export async function enqueueRoomNotices(env,code,previousGame,game,{now=Date.now()}={}){
 if(!pushConfigured(env)||!game)return;
 const rows=await env.DB.prepare('SELECT d.*,COALESCE(b.player_id,d.player_id) AS target_player_id,b.device_id AS binding_id,b.last_event AS binding_event FROM notification_devices d LEFT JOIN notification_room_bindings b ON b.device_id = d.id AND b.room_code = ? WHERE d.enabled = 1 AND d.updated_at > ? AND (b.device_id IS NOT NULL OR d.room_code = ?)').bind(code,now-7*86400000,code).all();
 for(const device of rows.results){
  const pid=game.players.findIndex(player=>player.id===device.target_player_id),notice=deviceNotice(game,pid,device);
  if(!notice||notice.event===noticeForGame(previousGame,pid)?.event||(device.binding_id?device.binding_event:device.last_event)===notice.event)continue;
  const delivery={event:notice.event,kind:notice.kind,at:now,transport:'pending'};
  // A quick rematch may follow the final-score push inside the minute limit.
  // Keep this one notice durable until due; never bypass the global limit.
  if(notice.kind==='rematch'&&device.last_sent>now-NOTICE_COOLDOWN&&device.visible_until<now){
   const due=device.last_sent+NOTICE_COOLDOWN,queued={...delivery,reason:'cooldown',retryAt:due};
   const deferred=await env.DB.batch([
    env.DB.prepare('UPDATE notification_devices SET last_event = ?,delivery = ? WHERE id = ? AND enabled = 1 AND (last_event IS NULL OR last_event != ?) AND visible_until < ?').bind(notice.event,JSON.stringify(queued),device.id,notice.event,now),
    env.DB.prepare("INSERT OR IGNORE INTO notification_dispatches(device_id,event,room_code,player_id,endpoint_hash,created_at,expires_at,next_attempt_at,delivery) SELECT id,?,?,?,?,?,?,?,? FROM notification_devices WHERE id = ? AND json_extract(delivery,'$.event') = ? AND json_extract(delivery,'$.at') = ?").bind(notice.event,code,device.target_player_id,device.endpoint_hash,now,now+PUSH_TTL,due,JSON.stringify(queued),device.id,notice.event,now),
   ]);
   if(deferred[0].meta.changes&&device.binding_id)await env.DB.prepare('UPDATE notification_room_bindings SET last_event = ? WHERE device_id = ? AND room_code = ? AND player_id = ?').bind(notice.event,device.id,code,device.target_player_id).run();
   continue;
  }
  // Claim and durable insertion commit together; the HTTP response never waits
  // for the provider. A duplicate game action cannot create another delivery.
  const results=await env.DB.batch([
   env.DB.prepare('UPDATE notification_devices SET last_event = ?,last_sent = ?,delivery = ? WHERE id = ? AND enabled = 1 AND (last_event IS NULL OR last_event != ?) AND last_sent <= ? AND visible_until < ?').bind(notice.event,now,JSON.stringify(delivery),device.id,notice.event,now-NOTICE_COOLDOWN,now),
   env.DB.prepare("INSERT OR IGNORE INTO notification_dispatches(device_id,event,room_code,player_id,endpoint_hash,created_at,expires_at,next_attempt_at,delivery) SELECT id,?,?,?,?,?,?,?,? FROM notification_devices WHERE id = ? AND json_extract(delivery,'$.event') = ? AND json_extract(delivery,'$.at') = ?").bind(notice.event,code,device.target_player_id,device.endpoint_hash,now,now+PUSH_TTL,now,JSON.stringify(delivery),device.id,notice.event,now),
  ]);
  if(!results[0].meta.changes){
   const reason=device.visible_until>=now?'foreground':'cooldown';
   await rememberDispatch(env.DB,device,{...notice,at:now,expiresAt:now+PUSH_TTL,delivery:{...delivery,transport:'failed',reason}},{code,playerId:device.target_player_id,state:'stopped'});continue;
  }
  await env.DB.prepare("UPDATE notification_dispatches SET state = 'pending',created_at = ?,expires_at = ?,next_attempt_at = ?,delivery = ? WHERE device_id = ? AND event = ? AND state = 'stopped' AND attempts = 0 AND json_extract(delivery,'$.reason') IN ('foreground','cooldown')").bind(now,now+PUSH_TTL,now,JSON.stringify(delivery),device.id,notice.event).run();
  if(device.binding_id)await env.DB.prepare('UPDATE notification_room_bindings SET last_event = ? WHERE device_id = ? AND room_code = ? AND player_id = ?').bind(notice.event,device.id,code,device.target_player_id).run();
 }
}
async function stopDispatch(env,job,reason,now){
 await patchDelivery(env.DB,job.device_id,job.event,{transport:'failed',reason,retryAt:null});
 await env.DB.prepare("UPDATE notification_dispatches SET state = 'stopped',lease_until = 0 WHERE device_id = ? AND event = ?").bind(job.device_id,job.event).run();
}
export async function drainPushOutbox(env,{now=Date.now(),send=fetch,sleep=pause,clock=null,fast=true}={}){
 if(!pushConfigured(env))return {processed:0};
 const started=Date.now(),time=clock||(()=>now+Date.now()-started);
 const jobs=await env.DB.prepare("SELECT device_id,event FROM notification_dispatches WHERE state = 'pending' AND next_attempt_at <= ? AND lease_until <= ? ORDER BY next_attempt_at LIMIT 12").bind(now,now).all();
 let processed=0;
 const results=await Promise.allSettled(jobs.results.map(async key=>{
  for(let local=0;local<(fast?3:1)&&Date.now()-started<22000;local++){
   const at=time(),job=await env.DB.prepare('SELECT * FROM notification_dispatches WHERE device_id = ? AND event = ?').bind(key.device_id,key.event).first();
   if(!job||job.state!=='pending'||job.lease_until>at||job.next_attempt_at>at)break;
   if(job.expires_at<=at||job.attempts>=PUSH_MAX_ATTEMPTS){await stopDispatch(env,job,'deadline',at);break;}
   const claimed=await env.DB.prepare("UPDATE notification_dispatches SET lease_until = ?,attempts = attempts+1 WHERE device_id = ? AND event = ? AND state = 'pending' AND attempts = ? AND lease_until <= ? AND next_attempt_at <= ?").bind(at+DISPATCH_LEASE,key.device_id,key.event,job.attempts,at,at).run();
   if(!claimed.meta.changes)break;
   job.attempts++;processed++;
   const device=await env.DB.prepare('SELECT * FROM notification_devices WHERE id = ? AND enabled = 1').bind(job.device_id).first();
   const current=device&&await roomForDevice(env.DB,device,at,job.room_code,job.event);
   if(!device){await stopDispatch(env,job,'disabled',at);break;}
   if(device.endpoint_hash!==job.endpoint_hash){await stopDispatch(env,job,'subscription',at);break;}
   if(!current||current.room.members[current.pid]?.id!==job.player_id||current.notice?.event!==job.event){await stopDispatch(env,job,'stale',at);break;}
   if(device.visible_until>=at){await stopDispatch(env,job,'foreground',at);break;}
   const prior=deliveryInfo(job);
   if(prior?.kind==='rematch'){
    if(prior.reason==='cooldown'){
     const claim=await env.DB.prepare('UPDATE notification_devices SET last_sent = ? WHERE id = ? AND enabled = 1 AND last_sent <= ?').bind(at,device.id,at-NOTICE_COOLDOWN).run();
     if(!claim.meta.changes){const latest=await env.DB.prepare('SELECT last_sent FROM notification_devices WHERE id = ?').bind(device.id).first();const due=Math.max(at+1000,(latest?.last_sent||at)+NOTICE_COOLDOWN);
      await env.DB.prepare('UPDATE notification_dispatches SET attempts = attempts-1,next_attempt_at = ?,lease_until = 0 WHERE device_id = ? AND event = ? AND attempts = ?').bind(due,device.id,job.event,job.attempts).run();await patchDelivery(env.DB,device.id,job.event,{retryAt:due});break;
     }
    }
   }
   if(['shown','seen','foreground','stale','disabled','subscription','invalid','cooldown'].includes(prior?.outcome)){await stopDispatch(env,job,'stale',at);break;}
   const delivery={event:job.event,kind:current.notice.kind,at:job.created_at,transport:'pending',attempt:job.attempts};
   await env.DB.prepare('UPDATE notification_dispatches SET delivery = ? WHERE device_id = ? AND event = ?').bind(JSON.stringify(delivery),job.device_id,job.event).run();
   await env.DB.prepare("UPDATE notification_devices SET delivery = ? WHERE id = ? AND json_extract(delivery,'$.event') = ?").bind(JSON.stringify(delivery),job.device_id,job.event).run();
   const payload={schema:1,...current.notice,mode:'room',code:job.room_code,deviceId:device.id,at:job.created_at,expiresAt:job.created_at+NOTICE_TTL,deliveryExpiresAt:job.expires_at,dispatchAttempt:job.attempts};
   const result=await sendDevicePush(env,device,payload,{send,now:at});
   const saved=await env.DB.prepare('SELECT delivery,state FROM notification_dispatches WHERE device_id = ? AND event = ?').bind(job.device_id,job.event).first();
   if(!saved)break;
   const receipt=deliveryInfo(saved);
   const transient=result.reason==='network'||result.reason==='timeout'||result.reason==='provider'&&(result.httpStatus===429||result.httpStatus>=500);
   // Acceptance without a receipt is deliberately not retried. The service may
   // already have queued/delivered it. Only an explicit pre-display failure may recover.
   const displayRetry=['verify-network','display-error'].includes(receipt?.outcome);
   const retry=(transient||displayRetry)&&job.attempts<PUSH_MAX_ATTEMPTS&&!['shown','seen','foreground'].includes(receipt?.outcome);
   const delay=displayRetry?60000:Math.max(result.retryAfter||0,job.attempts===1?1000:3000),next=at+delay;
   const state=retry?'pending':result.transport==='accepted'?'accepted':'stopped';
   await env.DB.prepare('UPDATE notification_dispatches SET state = ?,next_attempt_at = ?,lease_until = 0 WHERE device_id = ? AND event = ? AND attempts = ?').bind(state,retry?next:0,job.device_id,job.event,job.attempts).run();
   await patchDelivery(env.DB,job.device_id,job.event,{retryAt:retry?next:null},job.attempts);
   if(!retry||delay>3000||!fast||local===2)break;
   await sleep(delay);
  }
 }));
 if(results.some(result=>result.status==='rejected'))console.error('Farbfeld push queue processing failed');
 // Bound retained diagnostics without deleting live work. The scheduled sweep
 // also cleans expired/interrupted jobs while both phones are closed.
 await env.DB.prepare("DELETE FROM notification_dispatches WHERE (created_at < ? AND state != 'pending') OR expires_at < ?").bind(time()-7*86400000,time()-86400000).run();
 const ids=[...new Set(jobs.results.map(job=>job.device_id))];
 for(const id of ids)await env.DB.prepare("DELETE FROM notification_dispatches WHERE device_id = ? AND state != 'pending' AND event NOT IN (SELECT event FROM notification_dispatches WHERE device_id = ? ORDER BY created_at DESC,event DESC LIMIT "+HISTORY_LIMIT+')').bind(id,id).run();
 return {processed};
}
export async function deliverRoomNotices(env,code,previousGame,game,options={}){
 await enqueueRoomNotices(env,code,previousGame,game,options);
 return drainPushOutbox(env,options);
}
export async function maintainPushOutbox(env,{now=Date.now(),...options}={}){
 await env.DB.prepare("INSERT OR IGNORE INTO room_maintenance(id,next_run_at) VALUES('push-outbox',0)").run();
 const claim=await env.DB.prepare("UPDATE room_maintenance SET next_run_at = ? WHERE id = 'push-outbox' AND next_run_at <= ?").bind(now+60000,now).run();
 if(!claim.meta.changes)return {ok:true,skipped:true};
 const result=await drainPushOutbox(env,{now,...options});
 await env.DB.prepare("INSERT INTO room_maintenance(id,next_run_at) VALUES('push-outbox-sweep',?) ON CONFLICT(id) DO UPDATE SET next_run_at = excluded.next_run_at").bind(now).run();
 return {ok:true,...result,lastSweepAt:now};
}
