importScripts('/game/notification-worker.js');
const VERSION='1.34.2';
const CACHE=`farbfeld-v${VERSION}`;
const FILES=[
  '/play','/version.json','/game/style.css','/game/app.js',
  '/game/themes.js','/game/stats.js','/game/room-status.js','/game/room-book.js',
  '/game/engine.js','/game/variants.js','/game/variant-ui.js','/game/animation-preview.js',
  '/game/animation-game.js','/game/animation-review.js','/game/animation-playback.js','/game/boards.js',
  '/game/reactions.js','/game/notification-policy.js','/game/notification-worker.js','/game/notifications.js',
  '/game/game-info.js','/game/computer.js','/game/ducky.svg','/game/paw.svg',
  '/game/view-state.js','/game/board-view.js','/game/pwa.js','/game/direct-game.js',
  '/game/direct-connection.js','/game/direct.js','/game/direct-ui.js','/game/direct-check.js',
  '/game/direct-diagnostics.js','/game/mine-ui.js','/game/bonus-fields.js','/game/bonus-ui.js',
  '/game/tutorial.js','/game/tutorial/auftraege-plan.jpg','/game/tutorial/auftraege-plan.mp4','/game/tutorial/auftraege-start.jpg',
  '/game/tutorial/auftraege-start.mp4','/game/tutorial/auftraege.jpg','/game/tutorial/auftraege.mp4','/game/tutorial/entdecken-nutzen.jpg',
  '/game/tutorial/entdecken-nutzen.mp4','/game/tutorial/entdecken-start.jpg','/game/tutorial/entdecken-start.mp4','/game/tutorial/entdecken.jpg',
  '/game/tutorial/entdecken.mp4','/game/tutorial/grund-start.jpg','/game/tutorial/grund-start.mp4','/game/tutorial/grund-wertung.jpg',
  '/game/tutorial/grund-wertung.mp4','/game/tutorial/grundspiel.jpg','/game/tutorial/grundspiel.mp4','/game/tutorial/luft-bereit.jpg',
  '/game/tutorial/luft-bereit.mp4','/game/tutorial/luft-bericht.jpg','/game/tutorial/luft-bericht.mp4','/game/tutorial/luft-start.jpg',
  '/game/tutorial/luft-start.mp4','/game/tutorial/luftangriff.jpg','/game/tutorial/luftangriff.mp4','/game/tutorial/minen-auslegen.jpg',
  '/game/tutorial/minen-auslegen.mp4','/game/tutorial/minen-bericht.jpg','/game/tutorial/minen-bericht.mp4','/game/tutorial/minen-start.jpg',
  '/game/tutorial/minen-start.mp4','/game/tutorial/minen.jpg','/game/tutorial/minen.mp4','/game/tutorial/mischen-start.jpg',
  '/game/tutorial/mischen-start.mp4','/game/tutorial/mischen-termin.jpg','/game/tutorial/mischen-termin.mp4','/game/tutorial/mischen.jpg',
  '/game/tutorial/mischen.mp4','/game/tutorial/schatz-spur.jpg','/game/tutorial/schatz-spur.mp4','/game/tutorial/schatz-start.jpg',
  '/game/tutorial/schatz-start.mp4','/game/tutorial/schatzsuche.jpg','/game/tutorial/schatzsuche.mp4','/game/tutorial/schiffe-auslegen.jpg',
  '/game/tutorial/schiffe-auslegen.mp4','/game/tutorial/schiffe-karte.jpg','/game/tutorial/schiffe-karte.mp4','/game/tutorial/schiffe-start.jpg',
  '/game/tutorial/schiffe-start.mp4','/game/tutorial/schiffe.jpg','/game/tutorial/schiffe.mp4','/game/qr.js',
  '/game/vendor/qrcode.js','/game/vendor/jsqr.js','/game/vendor/qrcode-LICENSE.txt','/game/vendor/jsqr-LICENSE.txt',
  '/manifest.webmanifest','/icon.svg','/icon-192.png','/icon-512.png',
  '/icon-maskable.png'
];
const APP_PATHS=new Set(['/play','/play/','/play.html']);
function validType(path,response){
  const type=response.headers.get('content-type')||'';
  if(path==='/play')return type.includes('text/html');
  if(path.endsWith('.js'))return /javascript/.test(type);
  if(path.endsWith('.css'))return type.includes('text/css');
  if(path.endsWith('.webmanifest')||path.endsWith('.json'))return /json/.test(type);
  if(path.endsWith('.mp4'))return type.includes('video/mp4');
  if(path.endsWith('.jpg'))return type.includes('image/jpeg');
  if(path.endsWith('.png'))return type.includes('image/png');
  if(path.endsWith('.svg'))return type.includes('image/svg+xml');
  return true;
}
async function offlineStatus(){
  const cache=await caches.open(CACHE);
  const files=await Promise.all(FILES.map(file=>cache.match(file)));
  const status={version:VERSION,ready:files.every(Boolean)};
  if(!status.ready)return status;
  try{
    const metadata=await files[FILES.indexOf('/version.json')].json();
    if(metadata.version===VERSION&&metadata.releaseNotes?.[VERSION])status.releaseNotes=metadata.releaseNotes;
  }catch{}
  return status;
}
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
  if(event.data?.type==='OFFLINE_STATUS')event.waitUntil(offlineStatus().then(value=>event.ports?.[0]?.postMessage(value)));
});
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin||event.request.method!=='GET'||url.pathname.startsWith('/api/'))return;
  if(event.request.mode==='navigate'&&url.pathname==='/'){
    // Show the public homepage online and keep old bookmarks useful offline.
    event.respondWith(fetch(event.request).catch(async error=>{
      const saved=await caches.match('/play');
      if(saved)return saved;
      throw error;
    }));
    return;
  }
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
