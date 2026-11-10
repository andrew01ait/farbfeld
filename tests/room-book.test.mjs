import test from 'node:test';
import assert from 'node:assert/strict';
import {RoomBook,RoomDrafts,ROOM_BOOK_KEY,LEGACY_ROOM_KEY,MAX_SAVED_ROOMS} from '../public/game/room-book.js';
import {createGame,rollGame} from '../public/game/engine.js';
function fixture(){const values=new Map();let now=100000;const storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};return {values,storage,book:new RoomBook({storage,now:()=>now}),advance:ms=>now+=ms};}
const session=(code='AAAA2345',token='fixture-a',playerId='host')=>({code,token,playerId,roomName:'Raum '+code});
test('Alter einzelner Zugang wird übernommen und beim Hinzufügen weiterer Räume erhalten',()=>{
 const h=fixture(),a=session(),b=session('BBBB2345','fixture-b');h.storage.setItem(LEGACY_ROOM_KEY,JSON.stringify(a));assert.equal(h.book.active().token,a.token);
 assert(h.book.save(b,{activate:true,opened:true}));assert.equal(h.book.entries().length,2);assert.equal(h.book.get(a.code).token,a.token);assert.equal(h.book.active().code,b.code);
 const fresh=new RoomBook({storage:h.storage});assert.deepEqual(fresh.entries(),h.book.entries());
});
test('Zwei Instanzen ergänzen Räume ohne die zuvor gespeicherten anderen Zugänge zu überschreiben',()=>{
 const h=fixture(),second=new RoomBook({storage:h.storage});h.book.save(session());second.save(session('BBBB2345','fixture-b'));h.book.save(session('CCCC2345','fixture-c'));assert.equal(second.entries().length,3);
});
test('Entfernen gilt nur für den gewählten Raum; ein alter Legacy-Zeiger setzt ihn nicht wieder ein',()=>{
 const h=fixture(),a=session(),b=session('BBBB2345','fixture-b');h.book.save(a,{activate:true});h.book.save(b);assert(h.book.remove(a.code));h.storage.setItem(LEGACY_ROOM_KEY,JSON.stringify(a));
 assert.equal(h.book.get(a.code),null);assert.equal(h.book.get(b.code).token,b.token);assert.equal(h.book.active().code,b.code);h.book.save(a,{activate:true});assert.equal(h.book.entries().length,2);
});
test('Metadaten eines alten Tabs können einen neu beigetretenen Spielerzugang nicht ersetzen',()=>{
 const h=fixture(),a=session();h.book.save(a);h.book.update(a.code,a.token,{version:3,access:'ok',turn:{kind:'turn',text:'Du bist dran',button:'Öffnen'}});
 h.book.save({...a,token:'replacement',playerId:'new-member'});assert.equal(h.book.update(a.code,a.token,{roomName:'Old tab'}),false);assert.equal(h.book.get(a.code).token,'replacement');assert.equal(h.book.get(a.code).summary,null);
});
test('Gespeicherte Übersichten enthalten keine Spielblätter, Gegnerpunkte oder fremden Zugangsschlüssel',()=>{
 const h=fixture(),a=session();h.book.save(a);h.book.update(a.code,a.token,{access:'ok',roomName:'<img onerror=alert(1)>',memberCount:2,gameStatus:'playing',round:2,version:3,turn:{kind:'waiting',text:'Warten',button:'Öffnen'},marks:[1],score:44,opponentToken:'private'});
 const raw=h.storage.getItem(ROOM_BOOK_KEY);assert(!raw.includes('opponentToken'));assert(!raw.includes('"score"'));assert(!raw.includes('"marks"'));assert.equal(h.book.get(a.code).summary.version,3);
});
test('Unveränderte Metadaten schreiben nicht bei jedem schnellen Statusabruf neu',()=>{
 const h=fixture(),a=session();h.book.save(a);const data={access:'ok',gameStatus:'playing',version:3};h.book.update(a.code,a.token,data);const before=h.storage.getItem(ROOM_BOOK_KEY);
 h.advance(6000);h.book.update(a.code,a.token,data);assert.equal(h.storage.getItem(ROOM_BOOK_KEY),before);h.advance(30000);h.book.update(a.code,a.token,data);assert.notEqual(h.storage.getItem(ROOM_BOOK_KEY),before);
});
test('Beschädigtes Buch übernimmt den Legacy-Zugang; fehlgeschlagene Speicherung löscht keine vorhandenen Einträge',()=>{
 const h=fixture(),a=session();h.storage.setItem(ROOM_BOOK_KEY,'broken');h.storage.setItem(LEGACY_ROOM_KEY,JSON.stringify(a));assert.equal(h.book.entries().length,1);h.book.save(a);const raw=h.storage.getItem(ROOM_BOOK_KEY);h.storage.setItem=()=>{throw Error('full');};assert.equal(h.book.save(session('BBBB2345','fixture-b')),false);assert.equal(h.values.get(ROOM_BOOK_KEY),raw);assert.equal(h.book.entries().length,2);
});
test('Die Speichergrenze ersetzt niemals einen bereits gespeicherten Raum',()=>{
 const h=fixture();for(let i=0;i<MAX_SAVED_ROOMS;i++)h.book.save(session('ROOMAA'+String.fromCharCode(65+Math.floor(i/26))+String.fromCharCode(65+i%26),'token-'+i));assert.equal(h.book.entries().length,MAX_SAVED_ROOMS);assert.throws(()=>h.book.save(session()),/50 Räume/);assert.equal(h.book.entries().length,MAX_SAVED_ROOMS);
});
test('Raumwechsel erhält getrennte Entwürfe, aber verwirft sie nach anderem Wurf oder anderer Partie',()=>{
 const drafts=new RoomDrafts(),a=rollGame(createGame(['A','B'],'room',['a','b']),()=>0),b=rollGame(createGame(['A','C'],'room',['a','c']),()=>0);a.gameId='game-a';b.gameId='game-b';const choice={ci:0,ni:0,color:null,count:null};drafts.save('room-a:a',a,0,choice,[7]);drafts.save('room-b:a',b,0,{...choice,ci:1},[8,9]);assert.deepEqual(drafts.restore('room-a:a',a,0).cells,[7]);assert.deepEqual(drafts.restore('room-b:a',b,0).cells,[8,9]);const copy=drafts.restore('room-a:a',a,0);copy.cells.push(99);assert.deepEqual(drafts.restore('room-a:a',a,0).cells,[7]);assert.equal(drafts.restore('room-a:a',{...a,round:2},0),null);assert.equal(drafts.restore('room-b:a',{...b,gameId:'new-game'},0),null);
});

test('Startvorschau bleibt bei drei Partien und priorisiert offene Züge über zuletzt geöffnete Räume',async()=>{
 const {savedGamesPreview}=await import('../public/game/room-book.js');
 const items=Array.from({length:52},(_,i)=>({key:'game:'+String(i).padStart(2,'0'),mode:i<50?'online':'offline',needsAction:[4,18,50,51].includes(i),lastOpenedAt:100-i,searchText:'Raum '+i})),before=structuredClone(items);
 const preview=savedGamesPreview(items);assert.equal(preview.length,3);assert.deepEqual(preview.map(e=>e.key),['game:04','game:18','game:50']);assert.equal(preview.every(e=>e.needsAction),true);assert.deepEqual(items,before);
});
test('Alle Räume paginiert fünfzig Internet- und zwei Offline-Partien vollständig ohne Duplikate',async()=>{
 const {filterSavedGames}=await import('../public/game/room-book.js');const items=Array.from({length:52},(_,i)=>({key:'room:'+i,mode:i<50?'online':'offline',lastOpenedAt:i,searchText:'Partie '+i})),seen=[];
 for(let page=0;page<6;page++){const result=filterSavedGames(items,{page});assert(result.entries.length<=10);assert.equal(result.pages,6);seen.push(...result.entries.map(e=>e.key));}
 assert.equal(new Set(seen).size,52);assert.equal(seen.length,52);assert.equal(filterSavedGames(items,{page:99}).page,5);assert.equal(filterSavedGames(items,{page:-1}).page,0);
});
test('Suche und Modusfilter finden Namen, Raumcodes und Personen auch auf späteren Seiten',async()=>{
 const {filterSavedGames}=await import('../public/game/room-book.js');const items=Array.from({length:24},(_,i)=>({key:'room:'+i,mode:i===23?'offline':'online',searchText:i===23?'Sofa-Runde Robin Bea':i===19?'Würfelrunde ABCD2345 Robin Bea':'Raum '+i}));
 assert.equal(filterSavedGames(items,{query:'  WÜRFELRUNDE  '}).entries[0].key,'room:19');assert.equal(filterSavedGames(items,{query:'abcd2345'}).total,1);assert.equal(filterSavedGames(items,{query:'BEA'}).total,2);assert.equal(filterSavedGames(items,{query:'Bea',filter:'offline',page:9}).page,0);assert.equal(filterSavedGames(items,{query:'Bea',filter:'offline'}).entries[0].key,'room:23');assert.equal(filterSavedGames(items,{query:'not found'}).total,0);
});
test('Leere oder verkleinerte Raumlisten klemmen die Seite sicher und löschen keine Zugänge',async()=>{
 const {filterSavedGames,savedGamesPreview}=await import('../public/game/room-book.js');assert.deepEqual(savedGamesPreview([]),[]);const result=filterSavedGames([],{filter:'online',page:100});assert.deepEqual([result.total,result.page,result.pages,result.start,result.end,result.entries.length],[0,0,1,0,0,0]);
 const values=[{key:'one',mode:'offline',searchText:'Ein Handy'}];assert.equal(filterSavedGames(values,{page:8}).entries[0],values[0]);assert.equal(values.length,1);
});
test('Teilnehmercache übernimmt nur begrenzte Namen und explizite Gastgebermarkierungen ohne Zugangsdaten',()=>{
 const h=fixture(),a=session();h.book.save(a);h.book.update(a.code,a.token,{access:'ok',participants:[{name:' Robin ',host:true,token:'private'},{name:'Bea',host:'yes'},{name:'x'.repeat(25)},{name:''},null,{name:'Alex',host:false},{name:'seventh',host:true}]});
 assert.deepEqual(h.book.get(a.code).summary.participants,[{name:'Robin',host:true},{name:'Bea',host:false},{name:'Alex',host:false}]);assert(!JSON.stringify(h.book.get(a.code).summary).includes('private'));h.book.update(a.code,a.token,{access:'denied'});assert.equal(h.book.get(a.code).summary.participants,undefined);
});
test('Alte Zugänge ohne Namensliste bleiben gültig und ein Gastgeberwechsel aktualisiert nur die Übersicht',()=>{
 const h=fixture(),a=session();h.book.save(a);assert.equal(h.book.get(a.code).summary,null);h.book.update(a.code,a.token,{access:'ok',version:12,participants:[{name:'Robin',host:true},{name:'Bea',host:false}]});h.book.update(a.code,a.token,{access:'ok',version:12,participants:[{name:'Robin',host:false},{name:'Bea',host:true}]});assert.equal(h.book.get(a.code).summary.version,12);assert.deepEqual(h.book.get(a.code).summary.participants.map(p=>p.host),[false,true]);assert.equal(h.book.get(a.code).token,a.token);
});
