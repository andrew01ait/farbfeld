importScripts('/game/notification-worker.js');
const VERSION='1.17.1';
const CACHE=`farbfeld-v${VERSION}`;
const FILES=['/play','/version.json','/game/style.css','/game/app.js','/game/themes.js','/game/stats.js','/game/room-status.js','/game/room-book.js','/game/engine.js','/game/boards.js','/game/reactions.js','/game/notification-policy.js','/game/notification-worker.js','/game/notifications.js','/game/game-info.js','/game/computer.js','/game/ducky.svg','/game/paw.svg','/game/view-state.js','/game/board-view.js','/game/pwa.js','/game/direct-game.js','/game/direct-connection.js','/game/direct.js','/game/direct-ui.js','/game/direct-check.js','/game/direct-diagnostics.js','/game/mine-ui.js','/game/bonus-fields.js','/game/bonus-ui.js','/game/qr.js','/game/vendor/qrcode.js','/game/vendor/jsqr.js','/game/vendor/qrcode-LICENSE.txt','/game/vendor/jsqr-LICENSE.txt','/manifest.webmanifest','/icon.svg','/icon-192.png','/icon-512.png','/icon-maskable.png'];
const APP_PATHS=new Set(['/','/play','/play/','/play.html']);
function validType(path,response){
  const type=response.headers.get('content-type')||'';
  if(path==='/play')return type.includes('text/html');
  if(path.endsWith('.js'))return /javascript/.test(type);
  if(path.endsWith('.css'))return type.includes('text/css');
  if(path.endsWith('.webmanifest')||path.endsWith('.json'))return /json/.test(type);
  if(path.endsWith('.png'))return type.includes('image/png');
  if(path.endsWith('.svg'))return type.includes('image/svg+xml');
  return true;
}
async function ready(){const cache=await caches.open(CACHE);return (await Promise.all(FILES.map(file=>cache.match(file)))).every(Boolean);}
self.addEventListener('install',event=>event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  try{
    for(const file of FILES){
      const response=await fetch(file,{cache:'reload',credentials:'include'});
      if(!response.ok||new URL(response.url||file,self.location.origin).origin!==self.location.origin||!validType(file,response))throw Error(`Offline-Datei nicht verfügbar: ${file}`);
      if(file==='/play'&&!(await response.clone().text()).includes('data-farbfeld-app'))throw Error('Die Spielseite ist nicht angemeldet oder nicht verfügbar.');
      await cache.put(file,response);
    }
    await self.skipWaiting();
  }catch(error){await caches.delete(CACHE);throw error;}
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  for(const key of await caches.keys())if(key.startsWith('farbfeld-')&&key!==CACHE)await caches.delete(key);
  await self.clients.claim();
})()));
self.addEventListener('message',event=>{
  if(event.data?.type==='OFFLINE_STATUS')event.waitUntil(ready().then(value=>event.ports?.[0]?.postMessage({version:VERSION,ready:value})));
});
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin||event.request.method!=='GET'||url.pathname.startsWith('/api/'))return;
  if(event.request.mode==='navigate'&&APP_PATHS.has(url.pathname)){
    event.respondWith((async()=>{
      // A Wi-Fi hotspot can look online while its Internet request hangs.
      // Start from the complete versioned app instead of waiting on that URL.
      // App updates still install atomically through registration.update().
      const saved=await (await caches.open(CACHE)).match('/play');
      if(saved)return saved;
      try{
        const response=await fetch(event.request);
        const final=new URL(response.url||event.request.url);
        if(response.ok&&final.origin===self.location.origin&&APP_PATHS.has(final.pathname)&&(await response.clone().text()).includes('data-farbfeld-app'))return response;
        return await caches.match('/play')||response;
      }catch{
        return await caches.match('/play')||new Response('Bitte Farbfeld einmal online öffnen, damit die Spieldateien gespeichert werden.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
      }
    })());
    return;
  }
  if(FILES.includes(url.pathname))event.respondWith(caches.match(url.pathname).then(response=>response||fetch(event.request)));
});
