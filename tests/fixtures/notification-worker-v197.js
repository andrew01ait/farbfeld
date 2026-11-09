// Classic service-worker companion. All preferences and deduplication survive restarts.
(() => {
 const DB_NAME='farbfeld.notifications.v1',STORE='settings',TAG='farbfeld-game',COOLDOWN=60000;
 const defaults=()=>({enabled:false,sound:false,deviceId:'',deviceKey:'',pushReady:false,lastShownAt:0,seen:[]});
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
 function cleanNotice(value){
  if(!value||value.schema!==1||!['turn','finished','test'].includes(value.kind)||typeof value.event!=='string'||value.event.length>200||!Number.isSafeInteger(value.at)||!Number.isSafeInteger(value.expiresAt)||value.expiresAt-value.at>60000||value.expiresAt<=Date.now()||value.at>Date.now()+10000)return null;
  if(value.kind==='test')return {...value,title:'Farbfeld · Test',body:'So erinnern wir dich an deinen Zug. Höchstens einmal pro Minute.',mode:'test'};
  if(!['room','direct'].includes(value.mode)||typeof value.gameId!=='string'||value.gameId.length>100||!Number.isSafeInteger(value.round)||value.round<1)return null;
  if(value.mode==='room'&&!/^[A-Z2-9]{8}$/.test(value.code))return null;
  const expected=value.kind==='finished'?value.gameId+':finished':value.gameId+':'+value.round+':turn';if(value.event!==expected)return null;
  return {...value,title:value.kind==='finished'?'Farbfeld · Partie beendet':'Farbfeld · Du bist dran',body:value.kind==='finished'?'Eure Partie ist beendet. Ergebnis ansehen.':'Wurf '+value.round+': Du bist am Zug.'};
 }
 async function show(input,{test=false,push=false}={}){
  const notice=cleanNotice(input);if(!notice)return {shown:false};
  let state=await read();if(!state.enabled)return {shown:false};
  if(!test&&await foreground()){
   await change(current=>{remember(current,notice.event);return current;});await clear();return {shown:false};
  }
  if(push){
   if(!state.pushReady||state.deviceId!==notice.deviceId)return {shown:false};
   // Never show a queued alert for an old round, ended/aborted game or old room.
   try{
    const response=await fetch('/api/notifications?status=1',{headers:{'X-Notification-Device':state.deviceId,'X-Notification-Key':state.deviceKey},cache:'no-store',signal:AbortSignal.timeout(4000)});
    const status=await response.json();if(!response.ok||!status.enabled||status.code!==notice.code||status.notice?.event!==notice.event)return {shown:false};
    state.sound=status.sound===true;
   }catch{return {shown:false};}
  }
  let claimed=false;const now=Date.now();
  state=await change(current=>{
   if(!current.enabled||current.seen.includes(notice.event)||now-current.lastShownAt<COOLDOWN)return current;
   remember(current,notice.event);current.lastShownAt=now;claimed=true;return current;
  });
  if(!claimed)return {shown:false,limited:true};
  const url=notice.mode==='room'?'/play?room='+notice.code:notice.mode==='direct'?'/play?direct=1':'/play';
  await self.registration.showNotification(notice.title,{body:notice.body,icon:'/icon-192.png',badge:'/icon-192.png',tag:TAG,renotify:false,requireInteraction:false,silent:!state.sound,lang:'de',timestamp:now,data:{mode:notice.mode,code:notice.code||'',gameId:notice.gameId||'',url}});
  return {shown:true};
 }
 function serial(operation){const task=queue.then(operation,operation);queue=task.catch(()=>{});return task;}
 self.addEventListener('message',event=>{
  if(event.data?.type!=='FARBFELD_NOTIFICATIONS')return;
  const reply=value=>event.ports?.[0]?.postMessage(value);
  event.waitUntil(serial(async()=>{
   const {action,value}=event.data;
   if(action==='get')return reply({ok:true,state:await read()});
   if(action==='settings'){
    const state=await change(current=>{
     if(typeof value?.enabled==='boolean')current.enabled=value.enabled;
     if(typeof value?.sound==='boolean')current.sound=value.sound;
     if(typeof value?.pushReady==='boolean')current.pushReady=value.pushReady;
     if(!current.deviceId&&!current.deviceKey&&/^[a-f0-9]{32}$/.test(value?.deviceId)&&/^[a-f0-9]{64}$/.test(value?.deviceKey)){current.deviceId=value.deviceId;current.deviceKey=value.deviceKey;}
     return current;
    });if(!state.enabled)await clear();return reply({ok:true,state});
   }
   if(action==='seen'){await change(current=>{remember(current,value?.event);return current;});await clear();return reply({ok:true});}
   if(action==='clear'){await clear();return reply({ok:true});}
   if(action==='local')return reply({ok:true,...await show(value)});
   if(action==='test'){const now=Date.now();return reply({ok:true,...await show({schema:1,kind:'test',event:'test:'+now,at:now,expiresAt:now+60000},{test:true})});}
   reply({ok:false,error:'Unbekannte Benachrichtigungsaktion.'});
  }).catch(()=>reply({ok:false,error:'Benachrichtigungen sind auf diesem Gerät gerade nicht verfügbar.'})));
 });
 self.addEventListener('push',event=>event.waitUntil(serial(async()=>{let payload;try{payload=event.data?.json();}catch{return;}await show(payload,{push:true});}).catch(()=>{})));
 self.addEventListener('notificationclick',event=>{
  if(event.notification.tag!==TAG)return;
  event.notification.close();
  event.waitUntil((async()=>{
   const data=event.notification.data||{};
   const url=data.mode==='room'&&/^[A-Z2-9]{8}$/.test(data.code)?'/play?room='+data.code:data.mode==='direct'?'/play?direct=1':'/play';
   const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});
   const existing=clients.find(client=>new URL(client.url).origin===self.location.origin&&['/play','/play/','/play.html','/'].includes(new URL(client.url).pathname));
   if(existing){await existing.focus();existing.postMessage({type:'OPEN_FARBFELD_NOTIFICATION',mode:data.mode,code:data.code||''});}
   else await self.clients.openWindow(url);
  })());
 });
 self.addEventListener('pushsubscriptionchange',event=>event.waitUntil(serial(async()=>{await change(state=>{state.pushReady=false;return state;});})));
})();
