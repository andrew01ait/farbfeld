import {env} from 'cloudflare:workers';
import {authenticatedDevice,bindNotificationDevice,bindNotificationRooms,deliveryInfo,pushConfigured,recordPushReceipt,roomForDevice,pushHistory,secretHash,sendPushTest,validDevice,validateSubscription} from '../../../lib/notifications.js';
import {REMATCH_PUSH_CAPABILITY} from '../../../public/game/notification-policy.js';
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
const runtime=()=>env as unknown as Record<string,any>;
export async function GET(req:Request){
 const config=runtime();
 if(!new URL(req.url).searchParams.has('status'))return json({configured:pushConfigured(config),publicKey:pushConfigured(config)?config.FARBFELD_VAPID_PUBLIC_KEY:null});
 try{
  const device=await authenticatedDevice(config.DB,req.headers.get('X-Notification-Device'),req.headers.get('X-Notification-Key'));
  if(!device)return json({error:'Benachrichtigungszugang fehlt.'},403);
  const requested=new URL(req.url).searchParams.get('room')||device.room_code;
  if(requested&&!/^[A-Z2-9]{8}$/.test(requested))return json({error:'Ungültiger Spielraum.'},400);
  const event=new URL(req.url).searchParams.get('event');if(event&&event.length>200)return json({error:'Ungültiger Hinweis.'},400);
  const state=device.enabled&&await roomForDevice(config.DB,device,Date.now(),requested,event);
  const delivery=deliveryInfo(device),history=new URL(req.url).searchParams.has('history')?await pushHistory(config.DB,device.id):undefined,testEvent=new URL(req.url).searchParams.get('test');
  const testAllowed=!!(device.enabled&&delivery?.kind==='test'&&delivery.event===testEvent&&delivery.at<=Date.now()&&Date.now()<delivery.at+60000);
  return json({enabled:!!device.enabled,sound:!!device.sound,code:requested,notice:state?.notice||null,hasRoomAccess:!!state,foreground:device.visible_until>Date.now(),lastAttemptAt:device.last_sent||null,delivery,testAllowed,...(history?{history}:{})});
 }catch{return json({error:'Benachrichtigungen sind gerade nicht erreichbar.'},503);}
}
export async function POST(req:Request){
 try{
  const origin=req.headers.get('Origin');if(origin&&origin!==new URL(req.url).origin)return json({error:'Ungültige Anfrage.'},403);
  if(!req.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'Ungültiges Format.'},415);
  const raw=await req.text();if(raw.length>12000)return json({error:'Anfrage zu groß.'},413);
  const body=JSON.parse(raw),id=req.headers.get('X-Notification-Device'),key=req.headers.get('X-Notification-Key'),config=runtime(),now=Date.now();
  const rematchReady=Array.isArray(body.capabilities)?(body.capabilities.includes(REMATCH_PUSH_CAPABILITY)?1:0):null;
  if(!validDevice(id,key))return json({error:'Benachrichtigungszugang fehlt.'},403);
  let device=await authenticatedDevice(config.DB,id,key);
  if(body.action==='register'){
   if(!pushConfigured(config))return json({error:'Internet-Benachrichtigungen sind noch nicht bereit.'},503);
   const subscription=validateSubscription(body.subscription),hash=await secretHash(key!);
   const existing=await config.DB.prepare('SELECT secret_hash FROM notification_devices WHERE id = ?').bind(id).first();
   if(existing&&existing.secret_hash!==hash)return json({error:'Dieser Gerätezugang gehört zu einer anderen Installation.'},403);
   await config.DB.prepare('INSERT INTO notification_devices (id,secret_hash,endpoint_hash,subscription,enabled,sound,room_code,player_id,visible_until,last_sent,last_event,updated_at) VALUES (?,?,?,?,1,?,?,?,?,0,NULL,?) ON CONFLICT(id) DO UPDATE SET subscription = excluded.subscription, endpoint_hash = excluded.endpoint_hash, enabled = 1, sound = excluded.sound, visible_until = excluded.visible_until, updated_at = excluded.updated_at').bind(id,hash,await secretHash(subscription.endpoint),JSON.stringify(subscription),body.sound===true?1:0,'','',body.visible===true?now+45000:0,now).run();
   device=await authenticatedDevice(config.DB,id,key);
   if(rematchReady!==null){await config.DB.prepare('UPDATE notification_devices SET rematch_ready = ? WHERE id = ?').bind(rematchReady,id).run();device.rematch_ready=rematchReady;}
   await bindNotificationDevice(config.DB,device,body.code||'',req.headers.get('X-Player-Token'),now);
   return json({ok:true});
  }
  if(!device)return json({error:'Benachrichtigungszugang fehlt.'},403);
  if(body.action==='receipt')return json({ok:true,recorded:await recordPushReceipt(config.DB,device,body.event,body.outcome,now,body.attempt??1)});
  if(body.action==='test-push'){
   if(!device.enabled)return json({error:'Bitte Benachrichtigungen zuerst aktivieren.'},403);
   const result=await sendPushTest(config,device,{now});
   return result.limited?json({error:'Höchstens ein Internet-Push pro Minute. Bitte '+result.retryAfter+' Sekunden warten.',...result},429):json({ok:true,...result});
  }
  if(body.action==='disable'){
   await config.DB.prepare('DELETE FROM notification_devices WHERE id = ? AND secret_hash = ?').bind(id,device.secret_hash).run();return json({ok:true});
  }
  if(body.action==='bind-rooms')return json({ok:true,codes:await bindNotificationRooms(config.DB,device,body.rooms,now)});
  if(body.action==='bind')await bindNotificationDevice(config.DB,device,body.code||'',req.headers.get('X-Player-Token'),now);
  else if(body.action==='presence'){
   if(rematchReady!==null)await config.DB.prepare('UPDATE notification_devices SET rematch_ready = ? WHERE id = ?').bind(rematchReady,id).run();
   const state=body.visible===true?await roomForDevice(config.DB,device,now):null;
   if(body.visible===true)await config.DB.prepare('UPDATE notification_devices SET visible_until = ?, last_event = COALESCE(?,last_event), updated_at = ? WHERE id = ?').bind(now+45000,state?.notice?.event||null,now,id).run();
   else await config.DB.prepare('UPDATE notification_devices SET visible_until = 0, updated_at = ? WHERE id = ?').bind(now,id).run();
   if(body.visible===true&&state?.notice?.event)await config.DB.prepare('UPDATE notification_room_bindings SET last_event = ? WHERE device_id = ? AND room_code = ?').bind(state.notice.event,id,device.room_code).run();
  }else if(body.action==='settings')await config.DB.prepare('UPDATE notification_devices SET sound = ?, updated_at = ? WHERE id = ?').bind(body.sound===true?1:0,now,id).run();
  else return json({error:'Unbekannte Benachrichtigungsaktion.'},400);
  return json({ok:true});
 }catch(error){const unconfigured=!!(error&&typeof error==='object'&&'status' in error&&error.status===503);return json({error:unconfigured?'Internet-Push ist auf dem Server noch nicht eingerichtet.':'Benachrichtigungen konnten nicht eingerichtet werden. Dein Spiel läuft unverändert weiter.'},unconfigured?503:400);}
}
