// Classic service-worker companion. All preferences and deduplication survive restarts.
(() => {
 const DB_NAME='farbfeld.notifications.v1',STORE='settings',TAG='farbfeld-game',COOLDOWN=60000,PUSH_TTL=24*60*60*1000;
 const defaults=()=>({enabled:false,sound:false,deviceId:'',deviceKey:'',pushReady:false,lastShownAt:0,seen:[],pendingDisplay:null});
 let database,queue=Promise.resolve();
 function open(){
  if(database)return database;
  database=new Promise((resolve,reject)=>{
   const request=indexedDB.open(DB_NAME,1);
   request.onupgradeneeded=()=>request.result.createObjectStore(STORE);
   request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(Error('Benachrichtigungen können nicht gespeichert werden.'));
  });return database;
 }
 async function change(update){
  const db=await open();
  return new Promise((resolve,reject)=>{
   const transaction=db.transaction(STORE,'readwrite'),store=transaction.objectStore(STORE),request=store.get('device');let result;
   request.onsuccess=()=>{const current={...defaults(),...request.result};result=update(current)||current;store.put(result,'device');};
   transaction.oncomplete=()=>resolve(result);transaction.onerror=()=>reject(Error('Benachrichtigungen können nicht gespeichert werden.'));transaction.onabort=transaction.onerror;
  });
 }
 const read=()=>change(state=>state);
 const remember=(state,event)=>{if(typeof event==='string'&&event.length<=200&&!state.seen.includes(event))state.seen.push(event);state.seen=state.seen.slice(-128);};
 async function clear(){for(const notification of await self.registration.getNotifications({tag:TAG}))notification.close();}
 async function foreground(){return (await self.clients.matchAll({type:'window',includeUncontrolled:true})).some(client=>client.visibilityState==='visible'&&new URL(client.url).origin===self.location.origin);}
 function cleanNotice(value,{push=false}={}){
  const expiresAt=push&&value?.deliveryExpiresAt!==undefined?value.deliveryExpiresAt:value?.expiresAt;
  if(!value||value.schema!==1||!['turn','finished','test','rematch'].includes(value.kind)||typeof value.event!=='string'||value.event.length>200||!Number.isSafeInteger(value.at)||!Number.isSafeInteger(expiresAt)||expiresAt<=value.at||expiresAt-value.at>(push?PUSH_TTL:60000)||expiresAt<=Date.now()||value.at>Date.now()+10000)return null;
  if(push&&value.kind==='test'){
   if(value.mode!=='test'||!/^push-test:[a-f0-9-]{36}$/.test(value.event)||expiresAt-value.at>60000)return null;
   return {...value,title:'Farbfeld · Internet-Test',body:'Vom Server über den Push-Dienst auf dein Gerät.',mode:'test'};
  }
  if(push&&value.mode!=='room')return null;
  if(value.kind==='test')return {...value,title:'Farbfeld · Test',body:'So erinnern wir dich an deinen Zug. Höchstens einmal pro Minute.',mode:'test'};
  if(!['room','direct'].includes(value.mode)||typeof value.gameId!=='string'||value.gameId.length>100||!Number.isSafeInteger(value.round)||value.round<1)return null;
  if(value.mode==='room'&&!/^[A-Z2-9]{8}$/.test(value.code))return null;
  if(value.kind==='rematch'&&(!push||value.mode!=='room'||value.round!==1))return null;
  const expected=value.kind==='finished'?value.gameId+':finished':value.kind==='rematch'?value.gameId+':rematch':value.gameId+':'+value.round+':turn';if(value.event!==expected)return null;
  const text=value.kind==='finished'?['Farbfeld · Partie beendet','Eure Partie ist beendet. Ergebnis ansehen.']:value.kind==='rematch'?['Farbfeld · Revanche gestartet','Eure neue Partie ist gestartet. Spielraum öffnen.']:['Farbfeld · Du bist dran','Wurf '+value.round+': Du bist am Zug.'];
  return {...value,title:text[0],body:text[1]};
 }
 async function show(input,{test=false,push=false}={}){
  const notice=cleanNotice(input,{push});if(!notice)return {shown:false,reason:'invalid'};
  let state=await read();if(!state.enabled)return {shown:false,reason:'disabled'};
  if(!test&&!(push&&notice.kind==='test')&&await foreground()){
   await change(current=>{remember(current,notice.event);return current;});await clear();return {shown:false,reason:'foreground'};
  }
  if(push){
   if(!state.pushReady||state.deviceId!==notice.deviceId)return {shown:false,reason:'subscription'};
   // Never show a queued alert for an old round, ended/aborted game or old room.
   const query=notice.kind==='test'?'test='+encodeURIComponent(notice.event):'room='+encodeURIComponent(notice.code)+'&event='+encodeURIComponent(notice.event);
   let checked=false;
   // Two bounded checks belong to this push event; no timer or background poll.
   for(let attempt=0;attempt<2;attempt++){
    try{
     const response=await fetch('/api/notifications?status=1&'+query,{headers:{'X-Notification-Device':state.deviceId,'X-Notification-Key':state.deviceKey},cache:'no-store',signal:AbortSignal.timeout(5000)});
     if(response.status===429||response.status>=500){if(attempt===0)continue;return {shown:false,reason:'verify-network'};}
     if(!response.ok)return {shown:false,reason:'stale'};
     const status=await response.json();if(!status.enabled||(notice.kind==='test'?!status.testAllowed:status.code!==notice.code||status.notice?.event!==notice.event))return {shown:false,reason:'stale'};
     state.sound=status.sound===true;checked=true;break;
    }catch{if(attempt===1)return {shown:false,reason:'verify-network'};}
   }
   if(!checked)return {shown:false,reason:'verify-network'};
  }
  if(!test&&!(push&&notice.kind==='test')&&await foreground()){
   await change(current=>{remember(current,notice.event);return current;});await clear();return {shown:false,reason:'foreground'};
  }
  const now=Date.now();if((notice.deliveryExpiresAt||notice.expiresAt)<=now)return {shown:false,reason:'invalid'};
  // Recover the narrow show-success/persistence-crash window after a restart.
  const existing=(await self.registration.getNotifications({tag:TAG})).find(item=>item.data?.event===notice.event);
  if(existing){await change(current=>{remember(current,notice.event);current.lastShownAt=Math.max(current.lastShownAt,Number(existing.data.shownAt)||now);current.pendingDisplay=null;return current;});return {shown:false,reason:'seen'};}
  let claimed=false,reason='cooldown';
  state=await change(current=>{
   if(!current.enabled){reason='disabled';return current;}if(current.seen.includes(notice.event)){reason='seen';return current;}if(now-current.lastShownAt<COOLDOWN||current.pendingDisplay?.until>now)return current;
   current.pendingDisplay={event:notice.event,at:now,until:now+15000};claimed=true;return current;
  });
  if(!claimed)return {shown:false,limited:true,reason};
  const url=notice.mode==='room'?'/play?room='+notice.code:notice.mode==='direct'?'/play?direct=1':'/play';
  try{
   await self.registration.showNotification(notice.title,{body:notice.body,icon:'/icon-192.png',badge:'/icon-192.png',tag:TAG,renotify:state.sound===true,requireInteraction:false,silent:!state.sound,lang:'de',timestamp:now,data:{mode:notice.mode,code:notice.code||'',gameId:notice.gameId||'',url,event:notice.event,kind:notice.kind,shownAt:now,dispatchAttempt:notice.dispatchAttempt||1}});
  }catch(error){
   await change(current=>{if(current.pendingDisplay?.event===notice.event&&current.pendingDisplay.at===now)current.pendingDisplay=null;return current;});throw error;
  }
  // A rejected display never consumes the event or its one-minute allowance.
  await change(current=>{remember(current,notice.event);current.lastShownAt=now;if(current.pendingDisplay?.event===notice.event)current.pendingDisplay=null;return current;});
  return {shown:true};
 }
 function serial(operation){const task=queue.then(operation,operation);queue=task.catch(()=>{});return task;}
 self.addEventListener('message',event=>{
  if(event.data?.type!=='FARBFELD_NOTIFICATIONS')return;
  const reply=value=>event.ports?.[0]?.postMessage(value);
  event.waitUntil(serial(async()=>{
   const {action,value}=event.data;
   if(action==='get')return reply({ok:true,state:await read(),capabilities:['push-test-v1','push-receipt-v1','rematch-push-v1']});
   if(action==='settings'){
    const state=await change(current=>{
     if(typeof value?.enabled==='boolean')current.enabled=value.enabled;
     if(typeof value?.sound==='boolean')current.sound=value.sound;
     if(typeof value?.pushReady==='boolean')current.pushReady=value.pushReady;
     if(!current.deviceId&&!current.deviceKey&&/^[a-f0-9]{32}$/.test(value?.deviceId)&&/^[a-f0-9]{64}$/.test(value?.deviceKey)){current.deviceId=value.deviceId;current.deviceKey=value.deviceKey;}
     return current;
    });if(!state.enabled)await clear();return reply({ok:true,state});
   }
   if(action==='seen-list'){const events=Array.isArray(value?.events)?value.events.slice(0,50):[];await change(current=>{events.forEach(event=>remember(current,event));return current;});await clear();return reply({ok:true});}
   if(action==='seen'){await change(current=>{remember(current,value?.event);return current;});await clear();return reply({ok:true});}
   // A hidden startup or a queued visibility message must not dismiss an unread alert.
   if(action==='clear'){if(await foreground())await clear();return reply({ok:true});}
   if(action==='local')return reply({ok:true,...await show(value)});
   if(action==='test'){const now=Date.now();return reply({ok:true,...await show({schema:1,kind:'test',event:'test:'+now,at:now,expiresAt:now+60000},{test:true})});}
   reply({ok:false,error:'Unbekannte Benachrichtigungsaktion.'});
  }).catch(()=>reply({ok:false,error:'Benachrichtigungen sind auf diesem Gerät gerade nicht verfügbar.'})));
 });
 async function receipt(payload,result){
  const state=await read();if(!state.deviceId||!state.deviceKey||payload?.deviceId!==state.deviceId||typeof payload.event!=='string'||payload.event.length>200)return;
  const outcome=result.clicked?'clicked':result.shown?'shown':result.reason||'display-error';
  // One bounded receipt per push; never a polling loop or a game action.
  try{await fetch('/api/notifications',{method:'POST',headers:{'Content-Type':'application/json','X-Notification-Device':state.deviceId,'X-Notification-Key':state.deviceKey},body:JSON.stringify({action:'receipt',event:payload.event,outcome,attempt:payload.dispatchAttempt||1}),cache:'no-store',signal:AbortSignal.timeout(4000)});}catch{}
  const delivery={event:payload.event,kind:payload.kind,at:payload.at,outcome,receivedAt:Date.now(),...(result.clicked?{clickedAt:Date.now()}:{})};
  for(const client of await self.clients.matchAll({type:'window',includeUncontrolled:true}))if(new URL(client.url).origin===self.location.origin)client.postMessage({type:'FARBFELD_PUSH_RECEIPT',delivery});
 }
 self.addEventListener('push',event=>event.waitUntil(serial(async()=>{let payload;try{payload=event.data?.json();}catch{return;}let result;try{result=await show(payload,{push:true});}catch{result={shown:false,reason:'display-error'};}await receipt(payload,result);}).catch(()=>{})));
 self.addEventListener('notificationclick',event=>{
  if(event.notification.tag!==TAG)return;
  event.notification.close();
  event.waitUntil((async()=>{
   const data=event.notification.data||{};
   if(data.mode==='room'&&typeof data.event==='string'){const state=await read();await receipt({...data,deviceId:state.deviceId,kind:data.kind,at:data.shownAt},{clicked:true});}
   const url=data.mode==='room'&&/^[A-Z2-9]{8}$/.test(data.code)?'/play?room='+data.code:data.mode==='direct'?'/play?direct=1':'/play';
   const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});
   const existing=clients.find(client=>new URL(client.url).origin===self.location.origin&&['/play','/play/','/play.html','/'].includes(new URL(client.url).pathname));
   if(existing){await existing.focus();existing.postMessage({type:'OPEN_FARBFELD_NOTIFICATION',mode:data.mode,code:data.code||''});}
   else await self.clients.openWindow(url);
  })());
 });
 self.addEventListener('pushsubscriptionchange',event=>event.waitUntil(serial(async()=>{await change(state=>{state.pushReady=false;return state;});})));
})();
