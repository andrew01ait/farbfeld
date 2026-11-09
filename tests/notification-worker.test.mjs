import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {IDBFactory} from 'fake-indexeddb';
const source=fs.readFileSync('public/game/notification-worker.js','utf8');
function harness({indexedDB=new IDBFactory(),clock={now:1000000},notifications=[],visible=false,closed=false,workerSource=source,statusForRoom=null,testAllowed=true,displayFails=false,receiptFails=false}={}){
 const events={},shown=[],opened=[],messages=[],receipts=[],fetches=[];let online=true,currentEvent='test-game:1:turn';
 const client={url:'https://farbfeld.test/play',visibilityState:visible?'visible':'hidden',async focus(){},postMessage(data){messages.push(data);}};
 const self={location:new URL('https://farbfeld.test/sw.js'),addEventListener(name,handler){events[name]=handler;},registration:{async getNotifications(){return notifications.filter(item=>!item.closed);},async showNotification(title,options){if(displayFails)throw Error('OS blocked');const notification={tag:options.tag,data:options.data,closed:false,close(){this.closed=true;}};notifications.push(notification);shown.push({title,options});}},clients:{async matchAll(){return closed?[]:[client];},async openWindow(url){opened.push(url);}}};
 const fetch=async(url,options={})=>{fetches.push({url,options});if(!online)throw Error('offline');if(options.method==='POST'){if(receiptFails)throw Error('receipt offline');receipts.push(JSON.parse(options.body));return Response.json({ok:true});}if(statusForRoom){const value=statusForRoom(new URL(url,'https://farbfeld.test').searchParams.get('room'));return value instanceof Response?value:Response.json(value);}return Response.json({enabled:true,sound:false,code:'ABCD2345',notice:{event:currentEvent},testAllowed});};
 vm.runInNewContext(workerSource,{self,indexedDB,Date:{now:()=>clock.now},URL,Promise,Error,Response,AbortSignal,fetch});
 async function message(action,value){let task,result;events.message({data:{type:'FARBFELD_NOTIFICATIONS',action,value},ports:[{postMessage(data){result=data;}}],waitUntil(promise){task=promise;}});await task;return result;}
 async function push(data){let task;events.push({data:{json(){return data;}},waitUntil(promise){task=promise;}});await task;}
 const notice=(round=1)=>({schema:1,kind:'turn',event:'test-game:'+round+':turn',gameId:'test-game',round,mode:'direct',at:clock.now,expiresAt:clock.now+60000});
 return {events,indexedDB,clock,client,shown,notifications,opened,messages,receipts,fetches,message,push,notice,setDisplayFailure(value){displayFails=value;},setOffline(){online=false;},setCurrent(event){currentEvent=event;}};
}
const internetTest=h=>({schema:1,kind:'test',event:'push-test:11111111-1111-4111-8111-111111111111',mode:'test',deviceId:'a'.repeat(32),at:h.clock.now,expiresAt:h.clock.now+60000});
const enablePush=h=>h.message('settings',{enabled:true,pushReady:true,deviceId:'a'.repeat(32),deviceKey:'b'.repeat(64)});
const rematchPush=h=>({...h.notice(),kind:'rematch',event:'test-game:rematch',mode:'room',code:'ABCD2345',deviceId:'a'.repeat(32),deliveryExpiresAt:h.clock.now+86400000,title:'PRIVATE',body:'PRIVATE'});
test('Revanche wird bei geschlossener App neutral angezeigt, serverseitig geprüft und über Neustarts dedupliziert',async()=>{
 const h=harness({closed:true});await enablePush(h);assert((await h.message('get')).capabilities.includes('rematch-push-v1'));
 const payload=rematchPush(h);h.setCurrent(payload.event);await h.push(payload);assert.equal(h.shown.length,1);
 assert.equal(h.shown[0].title,'Farbfeld · Revanche gestartet');assert.equal(h.shown[0].options.body,'Eure neue Partie ist gestartet. Spielraum öffnen.');assert.equal(h.shown[0].options.silent,true);
 assert(h.fetches[0].url.includes('&event=test-game%3Arematch'));assert.equal(h.receipts[0].outcome,'shown');
 const restored=harness({indexedDB:h.indexedDB,clock:h.clock,notifications:h.notifications,closed:true});restored.setCurrent(payload.event);await restored.push(payload);assert.equal(restored.shown.length,0);
 let clicked;h.events.notificationclick({notification:h.notifications[0],waitUntil(promise){clicked=promise;}});await clicked;assert.deepEqual(h.opened,['/play?room=ABCD2345']);assert.equal(h.receipts.at(-1).outcome,'clicked');
});
test('Revanche bleibt bei sichtbarer App still und verwirft überholte oder manipulierte Neustarts',async()=>{
 for(const mode of ['visible','stale','bad-round','direct']){
  const h=harness({visible:mode==='visible'});await enablePush(h);const payload=rematchPush(h);h.setCurrent(mode==='stale'?'other-game:rematch':payload.event);
  if(mode==='bad-round')payload.round=2;if(mode==='direct')payload.mode='direct';await h.push(payload);assert.equal(h.shown.length,0,mode);
  assert.equal(h.receipts[0].outcome,mode==='visible'?'foreground':mode==='stale'?'stale':'invalid');
 }
});
test('Internet-Test wird nach Serverprüfung auch im Vordergrund angezeigt und genau einmal quittiert',async()=>{
 const h=harness({visible:true});await enablePush(h);assert((await h.message('get')).capabilities.includes('push-test-v1'));
 await h.push(internetTest(h));assert.equal(h.shown.length,1);assert.equal(h.shown[0].title,'Farbfeld · Internet-Test');assert.equal(h.receipts.length,1);assert.equal(h.receipts[0].outcome,'shown');
 assert(h.fetches[0].url.includes('test=push-test%3A'));assert(h.messages.some(message=>message.type==='FARBFELD_PUSH_RECEIPT'&&message.delivery.outcome==='shown'));
});
test('Internet-Test ohne gültige Serverfreigabe oder innerhalb des Minutenlimits meldet die tatsächliche Sperre',async()=>{
 const stale=harness({testAllowed:false});await enablePush(stale);await stale.push(internetTest(stale));assert.equal(stale.shown.length,0);assert.equal(stale.receipts[0].outcome,'stale');
 const limited=harness({visible:true});await enablePush(limited);await limited.message('test');await limited.push(internetTest(limited));assert.equal(limited.shown.length,1);assert.equal(limited.receipts[0].outcome,'cooldown');
});
test('Automatische Pushs quittieren Vordergrund und fehlgeschlagene Anzeige ohne Spielhinweis-Flut',async()=>{
 const visible=harness({visible:true});await enablePush(visible);await visible.push({...visible.notice(),mode:'room',code:'ABCD2345',deviceId:'a'.repeat(32)});assert.equal(visible.shown.length,0);assert.equal(visible.receipts[0].outcome,'foreground');
 const blocked=harness({displayFails:true});await enablePush(blocked);await blocked.push(internetTest(blocked));assert.equal(blocked.shown.length,0);assert.equal(blocked.receipts[0].outcome,'display-error');
});
test('Eine nicht erreichbare Quittungs-API verhindert keine Anzeige und startet keinen neuen Versuch',async()=>{
 const h=harness({receiptFails:true});await enablePush(h);await h.push(internetTest(h));assert.equal(h.shown.length,1);assert.equal(h.fetches.filter(entry=>entry.options.method==='POST').length,1);assert(h.messages.some(message=>message.type==='FARBFELD_PUSH_RECEIPT'));
});
test('Service Worker: standardmäßig aus, lautloser Opt-in und keine Benachrichtigung ohne Zustimmung',async()=>{
 const h=harness();assert.equal((await h.message('get')).state.enabled,false);await h.message('local',h.notice());assert.equal(h.shown.length,0);
 await h.message('settings',{enabled:true});await h.message('local',h.notice());assert.equal(h.shown.length,1);assert.equal(h.shown[0].options.silent,true);assert.equal(h.shown[0].options.renotify,false);assert.equal(h.shown[0].options.tag,'farbfeld-game');
});
test('Service Worker: keine Flut bei Duplikaten, parallelen Ereignissen, Neustart oder schnellen Runden',async()=>{
 const h=harness();await h.message('settings',{enabled:true});
 await Promise.all(Array.from({length:10},()=>h.message('local',h.notice())));assert.equal(h.shown.length,1);
 await h.message('local',h.notice(2));assert.equal(h.shown.length,1);
 const restored=harness({indexedDB:h.indexedDB,clock:h.clock});await restored.message('local',restored.notice());assert.equal(restored.shown.length,0);
 h.clock.now+=61000;await restored.message('local',restored.notice(3));assert.equal(restored.shown.length,1);
 await restored.message('settings',{enabled:false});assert(restored.notifications.every(notification=>notification.closed));h.clock.now+=61000;await restored.message('local',restored.notice(4));assert.equal(restored.shown.length,1);
});
test('Service Worker: sichtbare App unterdrückt Meldungen und kehrt ohne verspätete Erinnerung zurück',async()=>{
 const h=harness({visible:true});await h.message('settings',{enabled:true});await h.message('local',h.notice());assert.equal(h.shown.length,0);
 h.client.visibilityState='hidden';await h.message('local',h.notice());assert.equal(h.shown.length,0,'kein Nachholen eines schon sichtbaren Zuges');
});
test('Aufräumen aus einem unsichtbaren Client schließt keinen ungelesenen Hinweis, auch nach Neustart',async()=>{
 const h=harness();await enablePush(h);await h.push({...h.notice(),mode:'room',code:'ABCD2345',deviceId:'a'.repeat(32)});
 assert.equal(h.shown.length,1);await h.message('clear');assert.equal(h.notifications[0].closed,false);
 const restored=harness({indexedDB:h.indexedDB,clock:h.clock,notifications:h.notifications});await restored.message('clear');assert.equal(h.notifications[0].closed,false);
 restored.client.visibilityState='visible';await restored.message('clear');assert.equal(h.notifications[0].closed,true);
});
test('Service Worker: Minutenlimit gilt auch für Testnachrichten; Ton bleibt eine ausdrückliche Wahl',async()=>{
 const h=harness();await h.message('settings',{enabled:true});assert.equal((await h.message('test')).shown,true);assert.equal((await h.message('test')).shown,false);assert.equal(h.shown.length,1);
 h.clock.now+=61000;await h.message('settings',{sound:true});await h.message('test');assert.equal(h.shown[1].options.silent,false);
});
test('Service Worker: fremde, abgelaufene und inzwischen überholte Push-Meldungen werden verworfen',async()=>{
 const h=harness();await h.message('settings',{enabled:true,pushReady:true,deviceId:'a'.repeat(32),deviceKey:'b'.repeat(64)});
 const payload={...h.notice(),mode:'room',code:'ABCD2345',deviceId:'a'.repeat(32)};
 await h.push({...payload,deviceId:'c'.repeat(32)});await h.push({...payload,expiresAt:h.clock.now-1});h.setCurrent('test-game:2:turn');await h.push(payload);assert.equal(h.shown.length,0);
 h.setCurrent(payload.event);await h.push(payload);assert.equal(h.shown.length,1);assert.equal(h.shown[0].options.data.url,'/play?room=ABCD2345');
 h.clock.now+=61000;h.setOffline();await h.push({...h.notice(2),mode:'room',code:'ABCD2345',deviceId:'a'.repeat(32)});assert.equal(h.shown.length,1);
});
test('Service Worker: nach einer Stunde verzögerter Push ohne geöffnetes Fenster wird einmal angezeigt, sofern der Zug aktuell ist',async()=>{
 const h=harness({closed:true});await h.message('settings',{enabled:true,pushReady:true,deviceId:'a'.repeat(32),deviceKey:'b'.repeat(64)});
 const payload={...h.notice(),mode:'room',code:'ABCD2345',deviceId:'a'.repeat(32),deliveryExpiresAt:h.clock.now+86400000};
 h.clock.now+=3600000;
 const restored=harness({indexedDB:h.indexedDB,clock:h.clock,closed:true});await restored.push(payload);assert.equal(restored.shown.length,1);
 await restored.push(payload);assert.equal(restored.shown.length,1,'persistente Deduplizierung trotz verzögerter Zustellung');
});
test('Service Worker: lange Zustellfrist zeigt weder erledigte noch bereits gelesene Züge oder abgelaufene Nachrichten',async()=>{
 const h=harness({closed:true});await h.message('settings',{enabled:true,pushReady:true,deviceId:'a'.repeat(32),deviceKey:'b'.repeat(64)});
 const payload={...h.notice(),mode:'room',code:'ABCD2345',deviceId:'a'.repeat(32),deliveryExpiresAt:h.clock.now+86400000};
 h.clock.now+=3600000;h.setCurrent('test-game:2:turn');await h.push(payload);assert.equal(h.shown.length,0,'Zug inzwischen beendet');
 h.setCurrent(payload.event);await h.message('seen',{event:payload.event});await h.push(payload);assert.equal(h.shown.length,0,'bereits gelesen');
 h.clock.now=payload.deliveryExpiresAt;await h.push(payload);assert.equal(h.shown.length,0,'24-Stunden-Frist abgelaufen');
});
test('Service Worker: nur Server-Push darf bis 24 Stunden warten; lokale Meldungen behalten eine Minute Gültigkeit',async()=>{
 const h=harness();await h.message('settings',{enabled:true});await h.message('local',{...h.notice(),expiresAt:h.clock.now+86400000});assert.equal(h.shown.length,0);
 await h.message('settings',{pushReady:true,deviceId:'a'.repeat(32),deviceKey:'b'.repeat(64)});
 await h.push({...h.notice(),mode:'room',code:'ABCD2345',deviceId:'a'.repeat(32),expiresAt:h.clock.now+86400001});assert.equal(h.shown.length,0);
 await h.push({...h.notice(),mode:'room',code:'ABCD2345',deviceId:'a'.repeat(32),deliveryExpiresAt:h.clock.now+86400001});assert.equal(h.shown.length,0);
});
test('Service Worker 1.9.7 erhält neue sofortige Pushes weiter; lange Gültigkeit ist eine additive Erweiterung',async()=>{
 const h=harness({closed:true,workerSource:fs.readFileSync('tests/fixtures/notification-worker-v197.js','utf8')});
 await h.message('settings',{enabled:true,pushReady:true,deviceId:'a'.repeat(32),deviceKey:'b'.repeat(64)});
 await h.push({...h.notice(),mode:'room',code:'ABCD2345',deviceId:'a'.repeat(32),deliveryExpiresAt:h.clock.now+86400000});assert.equal(h.shown.length,1);
});
test('Service Worker: Notification-Klick fokussiert die App ohne Neuladen einer unbestätigten Auswahl',async()=>{
 const h=harness();await h.message('settings',{enabled:true});await h.message('local',h.notice());let task;
 h.events.notificationclick({notification:h.notifications[0],waitUntil(promise){task=promise;}});await task;
 assert.equal(h.notifications[0].closed,true);assert.equal(h.opened.length,0);assert.equal(h.messages[0].type,'OPEN_FARBFELD_NOTIFICATION');assert.equal(h.messages[0].mode,'direct');
});
test('Service Worker prüft Push im angegebenen gespeicherten Raum statt nur im zuletzt geöffneten',async()=>{
 const requested=[],h=harness({closed:true,statusForRoom:code=>{requested.push(code);return {enabled:true,sound:false,code:code||'AAAA2345',notice:{event:'test-game:1:turn'}};}});await h.message('settings',{enabled:true,pushReady:true,deviceId:'a'.repeat(32),deviceKey:'b'.repeat(64)});
 await h.push({...h.notice(),mode:'room',code:'BBBB2345',deviceId:'a'.repeat(32)});assert.deepEqual(requested,['BBBB2345']);assert.equal(h.shown.length,1);assert.equal(h.shown[0].options.data.code,'BBBB2345');
});
test('Service Worker merkt sichtbare Raumübersichten gesammelt auch über einen Neustart',async()=>{
 const h=harness({closed:true});await h.message('settings',{enabled:true,pushReady:true,deviceId:'a'.repeat(32),deviceKey:'b'.repeat(64)});await h.message('seen-list',{events:['test-game:1:turn','other-game:finished']});const next=harness({closed:true,indexedDB:h.indexedDB,clock:h.clock});await next.push({...next.notice(),mode:'room',code:'ABCD2345',deviceId:'a'.repeat(32)});assert.equal(next.shown.length,0);assert((await next.message('get')).state.seen.includes('other-game:finished'));
});


test('Neue automatische Hinweise dürfen nach ausdrücklicher Tonwahl erneut aufmerksam machen, bleiben aber begrenzt',async()=>{
 const h=harness({closed:true,statusForRoom:code=>({enabled:true,sound:true,code,notice:{event:'test-game:'+round+':turn'}})});let round=1;await enablePush(h);await h.message('settings',{sound:true});
 const push=()=>h.push({...h.notice(round),mode:'room',code:'ABCD2345',deviceId:'a'.repeat(32)});
 await push();assert.equal(h.shown.length,1);assert.equal(h.shown[0].options.renotify,true);assert.equal(h.shown[0].options.silent,false);
 await push();assert.equal(h.shown.length,1);round=2;await push();assert.equal(h.shown.length,1);
 h.clock.now+=61000;await push();assert.equal(h.shown.length,2);assert.equal(h.shown[1].options.renotify,true);assert.equal(h.shown[1].options.tag,h.shown[0].options.tag);
 const quiet=harness({closed:true});await enablePush(quiet);await quiet.push({...quiet.notice(),mode:'room',code:'ABCD2345',deviceId:'a'.repeat(32)});
 assert.equal(quiet.shown[0].options.silent,true);assert.equal(quiet.shown[0].options.renotify,false);
});

test('Push-Prüfung erholt sich nach einmaligem Netz-/503-Fehler innerhalb desselben Ereignisses',async()=>{
 for(const mode of ['network','503']){
  let calls=0;const h=harness({closed:true,statusForRoom:()=>{if(++calls===1){if(mode==='network')throw Error('temporary');return new Response(null,{status:503});}return {enabled:true,code:'ABCD2345',sound:false,notice:{event:'test-game:1:turn'}};}});await enablePush(h);
  await h.push({...h.notice(),mode:'room',code:'ABCD2345',deviceId:'a'.repeat(32)});assert.equal(calls,2);assert.equal(h.shown.length,1);assert.equal(h.receipts[0].outcome,'shown');
 }
});
test('Abgelehnte Anzeige verbraucht weder Ereignis noch Minutenlimit und lässt sich wiederherstellen',async()=>{
 const h=harness({closed:true,displayFails:true});await enablePush(h);const payload={...h.notice(),mode:'room',code:'ABCD2345',deviceId:'a'.repeat(32)};
 await h.push(payload);let state=(await h.message('get')).state;assert(!state.seen.includes(payload.event));assert.equal(state.lastShownAt,0);assert.equal(state.pendingDisplay,null);
 h.setDisplayFailure(false);await h.push({...payload,dispatchAttempt:2});assert.equal(h.shown.length,1);assert.equal(h.receipts.at(-1).outcome,'shown');
});
test('Neustart nach erfolgreicher Anzeige vor Speicherung erzeugt keinen doppelten sichtbaren Hinweis',async()=>{
 const h=harness({closed:true});await enablePush(h);const payload={...h.notice(),mode:'room',code:'ABCD2345',deviceId:'a'.repeat(32)};await h.push(payload);
 const restored=harness({closed:true,clock:h.clock,notifications:h.notifications});await enablePush(restored);await restored.push(payload);assert.equal(restored.shown.length,0);assert.equal(restored.receipts[0].outcome,'seen');assert((await restored.message('get')).state.seen.includes(payload.event));
});
test('Rückkehr in den Vordergrund während der Serverprüfung unterdrückt den Hinweis weiterhin',async()=>{
 let h;h=harness({statusForRoom:()=>{h.client.visibilityState='visible';return {enabled:true,code:'ABCD2345',notice:{event:'test-game:1:turn'}};}});await enablePush(h);await h.push({...h.notice(),mode:'room',code:'ABCD2345',deviceId:'a'.repeat(32)});assert.equal(h.shown.length,0);assert.equal(h.receipts[0].outcome,'foreground');
});
test('Antippen eines automatischen Hinweises quittiert den Klick ohne Spielzug oder weitere Anzeige',async()=>{
 const h=harness();await enablePush(h);await h.push({...h.notice(),mode:'room',code:'ABCD2345',deviceId:'a'.repeat(32),dispatchAttempt:2});let task;
 h.events.notificationclick({notification:h.notifications[0],waitUntil(promise){task=promise;}});await task;assert.equal(h.shown.length,1);assert.equal(h.receipts.at(-1).outcome,'clicked');assert.equal(h.receipts.at(-1).attempt,2);
});

test('Dauerhafte Ablehnung der Prüfung wird nicht erneut abgefragt',async()=>{
 let calls=0;const h=harness({closed:true,statusForRoom:()=>{calls++;return new Response(null,{status:403});}});await enablePush(h);await h.push({...h.notice(),mode:'room',code:'ABCD2345',deviceId:'a'.repeat(32)});assert.equal(calls,1);assert.equal(h.shown.length,0);assert.equal(h.receipts[0].outcome,'stale');
});
test('Während der Prüfung abgelaufene Hinweise werden nicht nach Fristende angezeigt',async()=>{
 let h;h=harness({closed:true,statusForRoom:()=>{h.clock.now+=61000;return {enabled:true,code:'ABCD2345',notice:{event:'test-game:1:turn'}};}});await enablePush(h);await h.push({...h.notice(),mode:'room',code:'ABCD2345',deviceId:'a'.repeat(32)});assert.equal(h.shown.length,0);assert.equal(h.receipts[0].outcome,'invalid');
});
