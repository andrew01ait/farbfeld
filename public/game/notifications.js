import {noticeForGame,NOTICE_TTL,REMATCH_PUSH_CAPABILITY} from './notification-policy.js';
const hex=length=>[...crypto.getRandomValues(new Uint8Array(length))].map(value=>value.toString(16).padStart(2,'0')).join('');
const decode=value=>Uint8Array.from(atob(value.replaceAll('-','+').replaceAll('_','/')),letter=>letter.charCodeAt(0));
const bindingKey=room=>room?room.code+':'+room.playerId:'';
const outcomes={shown:['Browser hat die Anzeige angefordert.','Kein Beleg für eine sichtbare Android-Meldung oder dafür, dass du sie gelesen hast.'],foreground:['Empfangen · App war sichtbar.','Automatische Spielhinweise bleiben dann aus.'],seen:['Empfangen · bereits verarbeitet.','Dasselbe Ereignis wird nicht wieder angezeigt.'],cooldown:['Empfangen · Minutenlimit.','Bitte mindestens eine Minute nach dem letzten Hinweis warten.'],stale:['Empfangen · nicht mehr aktuell.','Die alte Spielgelegenheit wird nicht mehr angezeigt.'],'verify-network':['Empfangen · Prüfung nicht erreichbar.','Bitte die Internetverbindung prüfen.'],disabled:['Empfangen · Hinweise ausgeschaltet.','Benachrichtigungen bei Bedarf aktivieren.'],subscription:['Empfangen · Gerätezuordnung prüfen.','Internet-Push erneut verbinden.'],invalid:['Empfangen · Nachricht verworfen.','Bitte Farbfeld aktualisieren.'],'display-error':['Empfangen · Anzeige fehlgeschlagen.','Bitte die Benachrichtigungsfreigabe in Android und Chrome prüfen.']};
export function describePushDelivery(delivery){
 if(!delivery)return null;
 if(delivery.clickedAt)return {title:'Hinweis angetippt.',detail:'Farbfeld wurde über diesen Hinweis geöffnet.'};
 if(outcomes[delivery.outcome]){const [title,detail]=outcomes[delivery.outcome];return {title,detail:detail+(delivery.retryAt?' Ein begrenzter Wiederholungsversuch ist vorgemerkt.':'')};}
 if(delivery.transport==='accepted')return {title:'Push-Dienst hat angenommen.',detail:'Eine Rückmeldung deines Geräts fehlt noch. Status bei Bedarf erneut prüfen.'};
 if(delivery.transport==='expired')return {title:'Geräteverbindung abgelaufen.',detail:'Bitte Internet-Push erneut verbinden.'};
 if(delivery.transport==='pending'||delivery.retryAt)return {title:'Zustellung wird erneut versucht.',detail:'Ein begrenzter neuer Versuch ist vorgemerkt. Bereits angezeigte und überholte Züge bleiben still.'};
 const title=delivery.reason==='prepare'?'Server: Vorbereitung fehlgeschlagen.':delivery.reason==='foreground'?'Versand übersprungen · App sichtbar.':delivery.reason==='stale'?'Versand übersprungen · nicht mehr aktuell.':delivery.reason==='provider'?'Push-Dienst lehnt ab'+(Number.isInteger(delivery.httpStatus)?' (HTTP '+delivery.httpStatus+').':'.'):'Push-Dienst nicht erreicht.';
 return {title,detail:'Der Spielstand bleibt gespeichert. Status prüfen oder später einen neuen Test starten.'};
}
export class GameNotifications{
 constructor({onChange=()=>{},onOpen=()=>{},navigator=globalThis.navigator,document=globalThis.document,Notification=globalThis.Notification}={}){
  this.navigator=navigator;this.document=document;this.Notification=Notification;this.onChange=onChange;this.onOpen=onOpen;
  this.savedRooms=null;this.savedRoomsKey='';this.boundRoomsKey=null;this.boundRoomCodes=[];this.summarySeen=new Set();this.delivery=null;this.history=[];
  this.state={enabled:false,sound:false,pushReady:false,deviceId:'',deviceKey:''};this.room=null;this.bound=null;this.connection=null;this.resyncRequested=false;this.initialized=false;this.busy=false;this.error='';this.nextAttempt=0;this.previous=null;this.observed=false;this.seenEvent='';this.syncing=null;this.generation=0;
  navigator?.serviceWorker?.addEventListener('message',event=>{if(event.data?.type==='OPEN_FARBFELD_NOTIFICATION')onOpen(event.data);if(event.data?.type==='FARBFELD_PUSH_RECEIPT'){this.mergeDelivery(event.data.delivery);this.onChange();}});
 }
 mergeDelivery(value){
  if(!value||typeof value.event!=='string'||value.event.length>200||!Number.isSafeInteger(value.at)||this.delivery&&value.at<this.delivery.at)return;
  const current=this.delivery?.event===value.event?this.delivery:{event:value.event,at:value.at,transport:'pending'},clean={};
  if(value.attempt&&(value.attempt>(current.attempt||0))){for(const key of ['outcome','receivedAt','reason','httpStatus','retryAt'])delete current[key];}
  if(Number.isInteger(value.attempt))clean.attempt=value.attempt;
  if(Number.isSafeInteger(value.clickedAt))clean.clickedAt=value.clickedAt;
  if(value.retryAt===null||Number.isSafeInteger(value.retryAt))clean.retryAt=value.retryAt;
  if(['test','turn','finished','rematch'].includes(value.kind))clean.kind=value.kind;
  if(['pending','accepted','failed','expired'].includes(value.transport))clean.transport=value.transport;
  if(outcomes[value.outcome]&&Number.isSafeInteger(value.receivedAt)){clean.outcome=value.outcome;clean.receivedAt=value.receivedAt;}
  if(Number.isInteger(value.httpStatus))clean.httpStatus=value.httpStatus;
  if(['prepare','network','timeout','provider','foreground','stale','cooldown','subscription','deadline'].includes(value.reason))clean.reason=value.reason;
  this.delivery={...current,...clean};
 }
 get supported(){return !!(globalThis.isSecureContext!==false&&this.Notification&&this.navigator?.serviceWorker);}
 get permission(){return this.Notification?.permission||'unsupported';}
 async registration(){const registration=await this.navigator.serviceWorker.getRegistration();if(!registration?.active)throw Error('Bitte zuerst die Offline-Vorbereitung abwarten und Farbfeld aktualisieren.');return registration;}
 async call(action,value){
  const registration=await this.registration();
  return await new Promise((resolve,reject)=>{
   const channel=new MessageChannel(),timer=setTimeout(()=>{channel.port1.close();reject(Error('Bitte Farbfeld auf Version 1.7.0 aktualisieren.'));},5000);
   channel.port1.onmessage=event=>{clearTimeout(timer);channel.port1.close();if(!event.data?.ok)reject(Error(event.data?.error||'Benachrichtigungen sind nicht verfügbar.'));else resolve(event.data);};
   registration.active.postMessage({type:'FARBFELD_NOTIFICATIONS',action,value},[channel.port2]);
  });
 }
 async init(){
  if(!this.supported||this.initialized||this.initializing)return;this.initializing=true;
  try{const result=await this.call('get');this.state=result.state;this.error='';
   if(this.permission!=='granted'&&this.state.enabled){this.state=(await this.call('settings',{enabled:false})).state;await this.detach();}
   if(this.state.enabled&&this.state.pushReady&&!await (await this.registration()).pushManager?.getSubscription())this.state=(await this.call('settings',{pushReady:false})).state;
   if(!this.document.hidden)await this.call('clear');this.initialized=true;this.onChange();if(this.state.enabled)this.sync().catch(()=>{});
  }catch(error){this.error=error.message;this.onChange();}
  finally{this.initializing=false;}
 }
 async enable(){
  if(!this.supported)throw Error('Dieser Browser unterstützt keine App-Benachrichtigungen. Bitte Farbfeld in Chrome auf Android öffnen.');
  this.generation++;
  // Ask immediately inside the explicit button gesture, never during startup.
  const permission=this.permission==='granted'?'granted':await this.Notification.requestPermission();
  if(permission!=='granted')throw Error(permission==='denied'?'Benachrichtigungen sind in Chrome blockiert. Öffne die Website-Einstellungen für Farbfeld und erlaube Benachrichtigungen.':'Benachrichtigungen bleiben ausgeschaltet.');
  const current=(await this.call('get')).state;
  const identity=current.deviceId&&current.deviceKey?{}:{deviceId:hex(16),deviceKey:hex(32)};
  this.state=(await this.call('settings',{...identity,enabled:true})).state;this.freshDevice=!!identity.deviceId&&this.state.deviceId===identity.deviceId;this.initialized=true;this.error='';this.nextAttempt=0;this.onChange();
  // A working local alert must not depend on an Internet registration succeeding.
  await this.sync();
 }
 async request(action,value={},keepalive=false,room=this.room){
  const response=await fetch('/api/notifications',{method:'POST',headers:{'Content-Type':'application/json','X-Notification-Device':this.state.deviceId,'X-Notification-Key':this.state.deviceKey,...(room?.token?{'X-Player-Token':room.token}:{})},body:JSON.stringify({action,...value}),cache:'no-store',keepalive,signal:AbortSignal.timeout(action==='test-push'?10000:4000)});
  const result=await response.json();if(!response.ok){const error=Error(result.error||'Internet-Benachrichtigungen sind gerade nicht erreichbar.');error.status=response.status;error.delivery=result.delivery;throw error;}return result;
 }
 async detach(){
  const attempts=[];if(this.state.deviceId)attempts.push(this.request('disable',{},true));
  try{const subscription=await (await this.registration()).pushManager?.getSubscription();if(subscription)attempts.push(subscription.unsubscribe());}catch{}
  await Promise.allSettled(attempts);this.bound=null;this.boundRoomsKey=null;this.connection=null;
 }
 async disable(){
  this.generation++;
  this.state=(await this.call('settings',{enabled:false,pushReady:false})).state;this.onChange();await this.detach();
 }
 async setSound(sound){
  this.state=(await this.call('settings',{sound:!!sound})).state;this.onChange();if(this.state.pushReady)await this.request('settings',{sound:!!sound}).catch(()=>{});
 }
 setContext(room,game,pid,ready=true){
  const oldRoom=bindingKey(this.room);this.room=room?{...room}:null;
  if(oldRoom!==bindingKey(room)){this.resyncRequested=true;this.connection=null;this.nextAttempt=0;if(this.initialized&&this.state.enabled)this.sync().catch(()=>{});}
  const notice=ready?noticeForGame(game,pid):null,event=notice?.event||null;
  const previous=this.previous,observed=this.observed;this.previous=event;this.observed=true;
  if(!this.initialized||!this.state.enabled)return;
  if(!this.document.hidden){
   if(event&&this.seenEvent!==event){this.seenEvent=event;this.call('seen',{event}).catch(()=>{});}
   return;
  }
  if(game?.mode==='direct'&&observed&&event&&event!==previous)this.call('local',{schema:1,...notice,mode:'direct',at:Date.now(),expiresAt:Date.now()+NOTICE_TTL}).catch(()=>{});
 }
 setRooms(rooms){
  const next=(rooms||[]).slice(0,50).map(room=>({code:room.code,token:room.token})),key=JSON.stringify(next.slice().sort((a,b)=>a.code.localeCompare(b.code)));
  this.savedRooms=next;if(key===this.savedRoomsKey)return;this.savedRoomsKey=key;this.resyncRequested=true;this.nextAttempt=0;
  if(this.initialized&&this.state.enabled)this.sync().catch(()=>{});
 }
 seeRooms(summaries){
  if(!this.initialized||!this.state.enabled||this.document.hidden)return;
  const events=(summaries||[]).map(item=>item.noticeEvent).filter(event=>typeof event==='string'&&event.length<=200&&!this.summarySeen.has(event)).slice(0,50);
  if(!events.length)return;events.forEach(event=>this.summarySeen.add(event));while(this.summarySeen.size>128)this.summarySeen.delete(this.summarySeen.values().next().value);
  this.call('seen-list',{events}).catch(()=>{});
 }
 async sync(){
  if(!this.initialized||!this.state.enabled||this.permission!=='granted'||this.navigator.onLine===false)return;
  if(this.syncing)return this.syncing;
  if(Date.now()<this.nextAttempt)return;
  this.syncing=(async()=>{
   // A changed context is reconciled in this serial operation, without a new timer.
   for(let attempt=0;attempt<3;attempt++){
    this.resyncRequested=false;
    try{await this.performSync();}catch(error){if(this.resyncRequested&&this.state.enabled&&attempt<2)continue;throw error;}
    if(!this.resyncRequested||this.bound===bindingKey(this.room)&&(this.savedRooms===null||this.boundRoomsKey===this.savedRoomsKey)||!this.state.enabled)break;
   }
  })().catch(async error=>{this.error=error.message;this.nextAttempt=Date.now()+300000;if(error.status===403)this.state=(await this.call('settings',{pushReady:false})).state;this.onChange();}).finally(()=>{this.syncing=null;});return this.syncing;
 }
 async performSync(){
  const generation=this.generation,active=()=>generation===this.generation&&this.state.enabled;
  const worker=await this.call('get'),capabilities=worker.capabilities?.includes(REMATCH_PUSH_CAPABILITY)?[REMATCH_PUSH_CAPABILITY]:[];
  if(!active())return;
  if(!this.state.pushReady&&Date.now()<this.nextAttempt)return;
  if(!this.state.pushReady){
   const registration=await this.registration();if(!registration.pushManager)throw Error('Auf diesem Gerät sind nur lokale Benachrichtigungen verfügbar.');
   const response=await fetch('/api/notifications',{cache:'no-store',signal:AbortSignal.timeout(4000)}),config=await response.json();
   if(!response.ok||!config.configured||!config.publicKey)throw Error('Internet-Push wird bei einer verfügbaren Verbindung vorbereitet.');
   let subscription=await registration.pushManager.getSubscription();
   const applicationServerKey=decode(config.publicKey),previousKey=subscription?.options?.applicationServerKey;
   const changedKey=previousKey&&(new Uint8Array(previousKey).length!==applicationServerKey.length||new Uint8Array(previousKey).some((byte,index)=>byte!==applicationServerKey[index]));
   if(subscription&&(this.freshDevice||changedKey)){await subscription.unsubscribe();subscription=null;}
   subscription??=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey});this.freshDevice=false;
   if(!active()){await subscription.unsubscribe();return;}
   const target=this.room?{...this.room}:null;
   await this.request('register',{subscription:subscription.toJSON(),sound:this.state.sound,visible:!this.document.hidden,code:target?.code||'',capabilities},false,target);
   if(!active()){await this.detach();return;}
   this.state=(await this.call('settings',{pushReady:true})).state;if(!active())return;this.bound=bindingKey(target);this.error='';this.onChange();
  }
  const target=this.room?{...this.room}:null,key=bindingKey(target),code=target?.code||'';
  if(this.bound!==key){await this.request('bind',{code},false,target);if(!active()){await this.detach();return;}this.bound=key;this.onChange();}
  if(this.savedRooms!==null&&this.boundRoomsKey!==this.savedRoomsKey){const rooms=this.savedRooms.map(room=>({...room})),roomsKey=this.savedRoomsKey;const result=await this.request('bind-rooms',{rooms},false,target);if(!active())return;this.boundRoomsKey=roomsKey;this.boundRoomCodes=Array.isArray(result.codes)?result.codes:[];}
  await this.request('presence',{visible:!this.document.hidden,capabilities},false,target);
  if(active()&&this.error){this.error='';this.onChange();}
 }
 visibility(){
  if(!this.state.enabled)return;
  if(this.permission!=='granted'){this.disable().catch(()=>{});return;}
  if(!this.document.hidden){this.call('clear').catch(()=>{});this.sync().catch(()=>{});}
  else if(this.state.pushReady)this.request('presence',{visible:false},true).catch(()=>{});
 }
 async test(){if(!this.state.enabled)throw Error('Bitte Benachrichtigungen zuerst aktivieren.');return await this.call('test');}
 async testPush(){
  if(!this.state.enabled||this.permission!=='granted')throw Error('Bitte Benachrichtigungen zuerst aktivieren.');
  const worker=await this.call('get');if(!worker.capabilities?.includes('push-test-v1'))throw Error('Bitte Farbfeld auf Version 1.11.2 aktualisieren, damit auch der Internet-Test empfangen werden kann.');
  await this.retry();if(!this.state.pushReady||this.error)throw Error(this.error||'Internet-Push ist noch nicht eingerichtet.');
  try{
   const result=await this.request('test-push');this.mergeDelivery(result.delivery);
   if(result.delivery?.transport==='expired'){this.state=(await this.call('settings',{pushReady:false})).state;this.freshDevice=true;this.bound=null;this.boundRoomsKey=null;}
   this.onChange();return this.delivery;
  }catch(error){this.mergeDelivery(error.delivery);this.onChange();throw error;}
 }
 async checkConnection(){
  if(!this.state.enabled)throw Error('Bitte Benachrichtigungen zuerst aktivieren.');
  this.bound=null;this.connection=null;this.onChange();await this.retry();
  if(!this.state.pushReady||this.error)throw Error(this.error||'Internet-Push ist noch nicht bereit.');
  const response=await fetch('/api/notifications?status=1&history=1',{headers:{'X-Notification-Device':this.state.deviceId,'X-Notification-Key':this.state.deviceKey},cache:'no-store',signal:AbortSignal.timeout(4000)});
  const status=await response.json();if(!response.ok)throw Error(status.error||'Die Spielraum-Zuordnung konnte nicht geprüft werden.');
  this.mergeDelivery(status.delivery);
  this.history=Array.isArray(status.history)?status.history.filter(item=>typeof item?.event==='string'&&item.event.length<=200&&Number.isSafeInteger(item.at)&&['test','turn','finished','rematch'].includes(item.kind)).slice(0,20):[];
  if(!status.enabled||status.code!==(this.room?.code||'')||status.code&&status.hasRoomAccess===false){this.bound=null;this.error='Die Spielraum-Zuordnung ist noch nicht bestätigt. Bitte den Raum öffnen und erneut prüfen.';this.onChange();throw Error(this.error);}
  this.connection={code:status.code,hasRoomAccess:status.hasRoomAccess===true,foreground:status.foreground===true,notice:status.notice?.kind||null,lastAttemptAt:status.lastAttemptAt||null,checkedAt:Date.now()};this.onChange();return this.connection;
 }
 retry(){this.nextAttempt=0;return this.sync();}
}
