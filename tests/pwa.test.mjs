import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
const root=new URL('../public/',import.meta.url);
const {APP_VERSION}=await import('../public/game/pwa.js');
const currentCache=`farbfeld-v${APP_VERSION}`;
const offlineAssetCount=JSON.parse(await fs.readFile(new URL('version.json',root),'utf8')).offlineAssetCount;
async function harness(failingPath=null){
 let online=true,stalled=false,fetchCalls=0;const stores=new Map(),events={},removed=[];
 const cache={async put(key,res){stores.set(String(key),res.clone());},async match(key){return stores.get(String(key))?.clone();}};
 const caches={async open(){return cache;},async keys(){return ['farbfeld-v1.0.0',currentCache,'another-app'];},async delete(name){removed.push(name);if(name===currentCache)stores.clear();return true;},async match(key){return cache.match(key);}};
 const fetch=async(input,options)=>{
  fetchCalls++;if(stalled)return new Promise(()=>{});
  if(!online)throw Error('offline');const path=typeof input==='string'?input:new URL(input.url).pathname;
  if(typeof input==='string')assert.equal(options.credentials,'include','private Site assets require credentialed requests');
  if(path===failingPath)return new Response('Sign in required',{status:403,headers:{'Content-Type':'text/plain'}});
  const file=path==='/play'?'play.html':path.replace(/^\//,'');
  const bytes=await fs.readFile(new URL(file,root));
  const type=path.endsWith('.js')?'text/javascript':path.endsWith('.css')?'text/css':path==='/play'?'text/html':path.endsWith('.json')?'application/json':path.endsWith('.webmanifest')?'application/manifest+json':path.endsWith('.svg')?'image/svg+xml':'image/png';
  const res=new Response(bytes,{headers:{'Content-Type':type}});Object.defineProperty(res,'url',{value:'https://farbfeld.test'+path});return res;
 };
 const self={location:new URL('https://farbfeld.test'),addEventListener(name,fn){events[name]=fn;},async skipWaiting(){},clients:{async claim(){}}};
 vm.runInNewContext(await fs.readFile(new URL('sw.js',root),'utf8'),{self,caches,fetch,URL,Response,Error,Set,Promise,importScripts(path){assert.equal(path,'/game/notification-worker.js');}});
 return {stores,events,removed,get fetchCalls(){return fetchCalls;},setStalled(){stalled=true;},setOffline(){online=false;},async install(){let p;events.install({waitUntil(value){p=value;}});return p;},async cached(path,mode='cors'){let response;events.fetch({request:{url:'https://farbfeld.test'+path,method:'GET',mode},respondWith(value){response=value;}});return response?await response:null;},async status(){let task,result;events.message({data:{type:'OFFLINE_STATUS'},ports:[{postMessage(value){result=value;}}],waitUntil(p){task=p;}});await task;return result;}};
}
test('Private PWA: Manifest mit Anmeldedaten, kanonischer Start und stabile Identität',async()=>{
 const manifest=JSON.parse(await fs.readFile(new URL('manifest.webmanifest',root),'utf8'));
 const html=await fs.readFile(new URL('play.html',root),'utf8');
 assert.equal(manifest.display,'standalone');assert.equal(manifest.start_url,'/play');
 assert.equal(manifest.id,'/play.html','existing installations keep their identity');
 assert.match(html,/<link rel="manifest"[^>]*crossorigin="use-credentials"/);
 for(const {src,sizes}of manifest.icons){const bytes=await fs.readFile(new URL(src.slice(1),root));assert.equal(bytes.subarray(1,4).toString(),'PNG');const dim=sizes.split('x').map(Number);assert.equal(bytes.readUInt32BE(16),dim[0]);assert.equal(bytes.readUInt32BE(20),dim[1]);}
});
test('Offline-Download aller echten Dateien und Neustart über neue/alte Verknüpfungen',async()=>{
 const h=await harness();await h.install();assert.equal(h.stores.size,offlineAssetCount);
 const status=await h.status();assert.equal(status.ready,true);assert.equal(status.version,APP_VERSION);
 h.setOffline();for(const path of ['/','/play','/play/','/play.html']){const res=await h.cached(path,'navigate');assert((await res.text()).includes('data-farbfeld-app'));}
 for(const path of ['/game/ducky.svg','/game/engine.js','/game/stats.js','/game/room-status.js','/game/room-book.js','/game/boards.js','/game/reactions.js','/game/notification-policy.js','/game/notification-worker.js','/game/notifications.js','/game/game-info.js','/game/computer.js','/game/view-state.js','/game/board-view.js','/game/pwa.js','/game/direct-game.js','/game/direct-connection.js','/game/direct.js','/game/direct-ui.js','/game/direct-check.js','/game/direct-diagnostics.js','/game/mine-ui.js','/game/qr.js','/game/vendor/qrcode.js','/game/vendor/jsqr.js'])assert.equal((await h.cached(path)).status,200);
 assert.equal(await h.cached('/api/rooms?code=TEST'),null);
});
test('App startet aus dem vollständigen Cache auch bei hängendem Internet im WLAN-Hotspot',async()=>{
 const h=await harness();await h.install();const before=h.fetchCalls;h.setStalled();
 const response=await h.cached('/play?direct=1','navigate');
 assert.equal(response.status,200);assert.match(await response.text(),/data-farbfeld-app/);
 assert.equal(h.fetchCalls,before,'cached app navigation must not wait for a network request');
 assert.equal((await h.cached('/game/direct-check.js')).status,200);
 assert.equal((await h.cached('/game/vendor/jsqr.js')).status,200);
});
test('Fehlgeschlagener authentifizierter Download meldet nicht fälschlich Offline bereit',async()=>{
 const h=await harness('/game/board-view.js');await assert.rejects(h.install(),/Offline-Datei/);
 assert(h.removed.includes(currentCache));assert.equal((await h.status()).ready,false);
});
test('Offline ohne vollständigen Cache zeigt eine verständliche Meldung',async()=>{
 const h=await harness();h.setOffline();const response=await h.cached('/play','navigate');
 assert.equal(response.status,503);assert.match(await response.text(),/einmal online/);
});
test('Eine installierte App startet auch offline ohne erneute Registrierung',async()=>{
 const {MessageChannel}=await import('node:worker_threads');
 const source=(await fs.readFile(new URL('game/pwa.js',root),'utf8')).replaceAll('export ','');
 let registrations=0;
 const worker={postMessage(_message,ports){ports[0].postMessage({ready:true,version:APP_VERSION});ports[0].close();}};
 const navigator={onLine:false,serviceWorker:{async getRegistration(){return {active:worker};},async register(){registrations++;throw Error('offline registration');},addEventListener(){}}};
 const context={window:{isSecureContext:true,addEventListener(){}},navigator,matchMedia:()=>({matches:true}),MessageChannel,setTimeout,clearTimeout,Error,Promise,APP_VERSION};
 vm.createContext(context);vm.runInContext(source+'\nthis.offlinePwa=createPwa();',context);
 await context.offlinePwa.check();
 assert.equal(registrations,0);assert.equal(context.offlinePwa.state.status,'ready');
});

async function updateHarness({online=true,servedVersion=APP_VERSION,onChange=()=>{}}={}){
 const {MessageChannel}=await import('node:worker_threads');
 const events={},timers=[],calls={register:0,update:0,reload:0};let now=1000000;
 const worker={postMessage(_message,ports){ports[0].postMessage({ready:true,version:servedVersion});ports[0].close();}};
 const registration={active:worker,async update(){calls.update++;}};
 const navigator={onLine:online,serviceWorker:{async getRegistration(){return registration;},async register(){calls.register++;return registration;},addEventListener(){}}};
 const location={reload(){calls.reload++;}};
 const window={isSecureContext:true,location,addEventListener(name,listener){events[name]=listener;}};
 const document={hidden:false,addEventListener(name,listener){events[name]=listener;}};
 const context={window,location,navigator,document,Date:class extends Date{static now(){return now;}},setInterval(callback,delay){timers.push({callback,delay});},matchMedia:()=>({matches:true}),MessageChannel,setTimeout,clearTimeout,Error,Promise,onChange};
 vm.createContext(context);
 const source=(await fs.readFile(new URL('game/pwa.js',root),'utf8')).replaceAll('export ','');
 vm.runInContext(source+'\nthis.pwa=createPwa(onChange);',context);
 return {pwa:context.pwa,calls,events,timers,navigator,document,registration,advance(ms){now+=ms;},setVersion(version){servedVersion=version;}};
}
test('Vollständiger Offline-Cache wird vor einem hängenden Update im scheinbar aktiven WLAN bestätigt',async()=>{
 let ready;const localReady=new Promise(resolve=>{ready=resolve;});
 const h=await updateHarness({online:true,onChange:state=>{if(state.status==='ready')ready();}});let finish;
 h.navigator.serviceWorker.register=()=>new Promise(resolve=>{finish=resolve;});
 const checking=h.pwa.check();
 await localReady;
 assert.equal(h.pwa.state.offlineReady,true);assert.equal(h.pwa.state.status,'ready');
 assert.equal(typeof finish,'function');finish(h.registration);await checking;
 assert.equal(h.pwa.state.status,'ready');assert.equal(h.calls.reload,0);
});
test('Neue Offline-Version wird angeboten, ohne eine laufende Partie neu zu laden',async()=>{
 const h=await updateHarness({servedVersion:'9.9.9'});await h.pwa.check();
 assert.equal(h.pwa.state.version,APP_VERSION);
 assert.equal(h.pwa.state.status,'update');assert.equal(h.pwa.state.availableVersion,'9.9.9');
 assert.match(h.pwa.state.message,/9\.9\.9/);assert.equal(h.calls.reload,0);
});
test('Ein älterer aktiver Cache wird nicht als neue Version zum Zurückstufen angeboten',async()=>{
 const statuses=[],h=await updateHarness({servedVersion:'0.9.0',onChange:state=>statuses.push(state.status)});
 h.registration.update=async()=>h.setVersion(APP_VERSION);await h.pwa.check();
 assert.equal(statuses.includes('update'),false);assert.equal(h.pwa.state.status,'ready');assert.equal(h.pwa.state.availableVersion,null);assert.equal(h.calls.reload,0);
});
test('Nach der Offline-Nutzung wird bei neuer Internetverbindung auch aus Offline bereit auf Updates geprüft',async()=>{
 const h=await updateHarness({online:false});await h.pwa.check();
 assert.equal(h.pwa.state.status,'ready');assert.equal(h.calls.register,0);
 h.navigator.onLine=true;h.setVersion('9.9.9');await h.events.online();
 assert.equal(h.calls.register,1);assert.equal(h.calls.update,1);
 assert.equal(h.pwa.state.status,'update');assert.equal(h.pwa.state.availableVersion,'9.9.9');
 assert.equal(h.calls.reload,0);
});

test('Sichtbare Apps prüfen alle fünf Minuten und bieten neue vollständig geladene Versionen an',async()=>{
 const statuses=[],h=await updateHarness({onChange:state=>statuses.push(state.status)});await h.pwa.check();
 assert.equal(h.timers.length,1);assert.equal(h.timers[0].delay,5*60*1000);
 const before=h.calls.update;h.setVersion('9.9.9');h.advance(5*60*1000);statuses.length=0;
 await h.timers[0].callback();assert.equal(h.calls.update,before+1);
 assert.equal(h.pwa.state.status,'update');assert.equal(h.pwa.state.availableVersion,'9.9.9');
 assert.equal(statuses.includes('checking'),false);assert.equal(h.calls.reload,0);
});

test('Rückkehr prüft auf Updates, schnelle Wechsel und Hintergrund/Offline erzeugen keine Prüfflut',async()=>{
 const h=await updateHarness();await h.pwa.check();const before=h.calls.update;
 await h.events.visibilitychange();assert.equal(h.calls.update,before);
 h.advance(60001);h.document.hidden=true;await h.timers[0].callback();assert.equal(h.calls.update,before);
 h.document.hidden=false;h.navigator.onLine=false;await h.events.visibilitychange();assert.equal(h.calls.update,before);
 h.navigator.onLine=true;h.setVersion('9.9.9');await h.events.visibilitychange();assert.equal(h.calls.update,before+1);
 assert.equal(h.pwa.state.status,'update');await h.events.visibilitychange();assert.equal(h.calls.update,before+1);
 assert.equal(h.calls.reload,0);
});

test('Ein vorübergehender Netzfehler entfernt keinen bereits fertig geladenen Updatehinweis',async()=>{
 const h=await updateHarness({servedVersion:'9.9.9'});await h.pwa.check();
 h.registration.update=async()=>{throw Error('network gone');};h.advance(5*60*1000);
 await h.timers[0].callback();assert.equal(h.pwa.state.status,'update');assert.equal(h.pwa.state.availableVersion,'9.9.9');assert.equal(h.calls.reload,0);
});

test('Stille Hintergrundprüfung erhält bei Netzfehlern die bestehende Offlinebereitschaft',async()=>{
 const h=await updateHarness();await h.pwa.check();
 h.registration.update=async()=>{throw Error('network gone');};h.advance(5*60*1000);
 await h.timers[0].callback();assert.equal(h.pwa.state.status,'ready');assert.equal(h.pwa.state.offlineReady,true);
 await h.pwa.check(true);assert.equal(h.pwa.state.status,'error');assert.equal(h.pwa.state.offlineReady,true);
});

test('Ein umgeleitetes Worker-Update zeigt Umzugshilfe und erhält den vorhandenen Offline-Cache',async()=>{
 const {MessageChannel}=await import('node:worker_threads');
 const worker={postMessage(_message,ports){ports[0].postMessage({ready:true,version:APP_VERSION});ports[0].close();}};
 let unregistered=false;
 const registration={active:worker,async update(){throw Error('The script resource is behind a redirect, which is disallowed.');},async unregister(){unregistered=true;}};
 const navigator={onLine:true,serviceWorker:{async getRegistration(){return registration;},async register(){return registration;},addEventListener(){}}};
 const context={window:{isSecureContext:true,addEventListener(){}},navigator,matchMedia:()=>({matches:true}),MessageChannel,setTimeout,clearTimeout,Error,Promise};
 vm.createContext(context);vm.runInContext((await fs.readFile(new URL('game/pwa.js',root),'utf8')).replaceAll('export ','')+'\nthis.pwa=createPwa();',context);
 await context.pwa.check();assert.equal(context.pwa.state.status,'error');assert.equal(context.pwa.state.recovery,true);assert.equal(context.pwa.state.offlineReady,true);assert.match(context.pwa.state.message,/Hilfe beim App-Umzug/);assert.doesNotMatch(context.pwa.state.message,/ServiceWorker|script resource/);assert.equal(unregistered,false);
});
