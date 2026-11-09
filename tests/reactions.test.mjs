import test from 'node:test';
import assert from 'node:assert/strict';
import {VersionTapCounter,REACTIONS,REACTION_FEATURE,REACTION_EXTRA_FEATURE,REACTION_INTERVAL,REACTION_TTL,REACTION_SEEN_KEY,validateReaction,ReactionOverlay} from '../public/game/reactions.js';
import {DirectGame,hostRecord,guestRecord} from '../public/game/direct-game.js';
import {BOARD_FEATURE} from '../public/game/boards.js';
function overlayHarness({storage=null}={}){
 const listeners={},body={children:[],append(node){this.children.push(node);node.parent=this;}};
 const document={hidden:false,body,addEventListener(type,fn){listeners[type]=fn;},querySelector(){return null;},createElement(){return {children:[],style:{setProperty(){}},setAttribute(){},append(...nodes){this.children.push(...nodes);},remove(){if(this.parent)this.parent.children=this.parent.children.filter(node=>node!==this);}};}};
 const timers=[];let now=1800000000000;
 const overlay=new ReactionOverlay({document,storage,reducedMotion:()=>false,now:()=>now,setTimer:fn=>timers.push(fn)});
 return {overlay,document,body,timers,listeners,get now(){return now;},advance(ms){now+=ms;}};
}
function memoryStorage(){const values=new Map();return {getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value),values};}
test('Erster Raumabruf zeigt eine verpasste Reaktion statt sie ungesehen zu verwerfen',()=>{
 const h=overlayHarness(),event={id:'room-reaction-001',senderId:'host',emoji:'kiss',name:'Robin',at:h.now};
 h.overlay.receiveRoom([event],'room:game:guest');assert.equal(h.body.children.length,1);
 h.overlay.receiveRoom([event],'room:game:guest');assert.equal(h.body.children.length,1);
});
test('Ein beim Verbergen zurückkehrender Raumabruf verbraucht die Reaktion nicht ungesehen',()=>{
 const h=overlayHarness(),event={id:'room-reaction-002',senderId:'host',emoji:'laugh',name:'Robin',at:h.now};
 h.document.hidden=true;h.overlay.receiveRoom([event],'room:game:guest');assert.equal(h.body.children.length,0);
 h.document.hidden=false;h.overlay.receiveRoom([event],'room:game:guest');assert.equal(h.body.children.length,1);
});
test('Gesehene Raumreaktionen bleiben nach Neustart stumm; neue und verspätete alte Ereignisse sind geordnet',()=>{
 const storage=memoryStorage(),h=overlayHarness({storage}),event={id:'room-persist-001',senderId:'host',emoji:'kiss',name:'Robin',at:h.now};
 h.overlay.receiveRoom([event],'room:game:guest');assert.equal(h.body.children.length,1);
 const restarted=overlayHarness({storage});restarted.advance(3600000);restarted.overlay.receiveRoom([event],'room:game:guest');assert.equal(restarted.body.children.length,0);
 const next={...event,id:'room-persist-002',emoji:'laugh',at:restarted.now};restarted.overlay.receiveRoom([next],'room:game:guest');assert.equal(restarted.body.children.length,1);
 restarted.overlay.receiveRoom([event],'room:game:guest');assert.equal(restarted.body.children.length,1);
 const rows=JSON.parse(storage.getItem(REACTION_SEEN_KEY));assert.equal(rows.length,1);assert.equal(rows[0].id,next.id);assert(!JSON.stringify(rows).includes('Robin'));
});
test('Nach Abwesenheit kommt nur die neueste Reaktion je Absender, auch ohne freigeschalteten Senden-Knopf',()=>{
 const h=overlayHarness(),events=[{id:'room-latest-001',senderId:'host',emoji:'kiss',at:h.now-3600000},{id:'room-latest-002',senderId:'host',emoji:'poop',at:h.now-1800000},{id:'room-latest-003',senderId:'third',emoji:'laugh',at:h.now}];
 h.overlay.receiveRoom(events,'room:game:guest');assert.equal(h.body.children.length,2);assert.deepEqual(h.body.children.map(node=>node.children[0].textContent),['💩','😂']);
});
test('Sechsergruppe zeigt maximal drei Flüge gleichzeitig und merkt ausstehende erst beim Anzeigen',()=>{
 const storage=memoryStorage(),h=overlayHarness({storage}),events=Array.from({length:5},(_,i)=>({id:'room-group-000'+i,senderId:'sender'+i,emoji:'kiss',at:h.now+i}));
 h.overlay.receiveRoom(events,'room:game:guest');assert.equal(h.body.children.length,3);assert.equal(h.overlay.roomPending.size,2);assert.equal(JSON.parse(storage.getItem(REACTION_SEEN_KEY)).length,3);
 h.overlay.receiveRoom(events,'room:game:guest');assert.equal(h.body.children.length,3);
 h.timers.shift()();h.timers.shift()();assert.equal(h.body.children.length,3);assert.equal(h.overlay.roomPending.size,0);assert.equal(JSON.parse(storage.getItem(REACTION_SEEN_KEY)).length,5);
});
test('Verbergen hält noch nicht angezeigte Flüge zurück; ein Raumwechsel verwirft ausstehende fremde Flüge',()=>{
 const h=overlayHarness(),events=Array.from({length:5},(_,i)=>({id:'room-hidden-00'+i,senderId:'sender'+i,emoji:'laugh',at:h.now}));
 h.overlay.receiveRoom(events,'room:game:guest');h.document.hidden=true;h.listeners.visibilitychange();assert.equal(h.body.children.length,0);assert.equal(h.overlay.roomPending.size,2);
 h.document.hidden=false;h.listeners.visibilitychange();assert.equal(h.body.children.length,2);assert.equal(h.overlay.roomPending.size,0);
 h.overlay.receiveRoom(events,'room:other-game:guest');assert(h.overlay.roomPending.size>0);h.overlay.receiveRoom([],'other-room:game:guest');assert.equal(h.overlay.roomPending.size,0);
});
test('Raum, Partie und Empfänger haben unabhängige Anzeigecursor',()=>{
 const storage=memoryStorage(),h=overlayHarness({storage}),event={id:'room-viewer-001',senderId:'host',emoji:'kiss',at:h.now};
 h.overlay.receiveRoom([event],'room:game:guest');h.overlay.receiveRoom([event],'room:game:third');assert.equal(h.body.children.length,2);
 const restarted=overlayHarness({storage});restarted.overlay.receiveRoom([event],'room:game:third');assert.equal(restarted.body.children.length,0);
});
test('Abgelaufene, fremde Emojiwerte und kaputter Speicher stören das Spiel nicht',()=>{
 const h=overlayHarness({storage:{getItem(){throw Error('blocked');},setItem(){throw Error('full');}}}),event={id:'room-expiry-001',senderId:'host',emoji:'kiss',at:h.now};
 h.overlay.receiveRoom([{...event,at:h.now-REACTION_TTL},{...event,emoji:'invalid'}],'room:game:guest');assert.equal(h.body.children.length,0);
 assert.doesNotThrow(()=>h.overlay.receiveRoom([event],'room:game:guest'));assert.equal(h.body.children.length,1);h.overlay.receiveRoom([event],'room:game:guest');assert.equal(h.body.children.length,1);
 const malformed=memoryStorage();malformed.setItem(REACTION_SEEN_KEY,'not-json');const next=overlayHarness({storage:malformed});assert.doesNotThrow(()=>next.overlay.receiveRoom([event],'room:game:guest'));assert.equal(next.body.children.length,1);
});
test('Der Standard-Animationstimer behält den Browserempfänger',t=>{
 t.mock.method(globalThis,'setTimeout',function(){assert.equal(this,globalThis);return 1;});
 const h=overlayHarness();const overlay=new ReactionOverlay({document:h.document,storage:null,reducedMotion:()=>false});overlay.receive({id:'timer-id',emoji:'kiss'});assert.equal(h.body.children.length,1);
});
test('Easter Egg öffnet exakt nach zehn aufeinanderfolgenden Versionstaps; Unterbrechung setzt zurück',()=>{
 const counter=new VersionTapCounter();for(let i=0;i<9;i++)assert.equal(counter.tap(i*100),false);assert.equal(counter.tap(900),true);
 assert.equal(counter.tap(1000),false);counter.reset();for(let i=0;i<5;i++)counter.tap(i*100);assert.equal(counter.tap(5000),false);assert.equal(counter.count,1);
 assert.deepEqual(REACTIONS.map(item=>item.symbol),['😘','💩','😂','👍','😲']);
 assert.throws(()=>validateReaction({emoji:'unknown',to:'all'},[{},{}],0));assert.throws(()=>validateReaction({emoji:'kiss',to:0},[{},{}],0));
});
function pair(){
 const events=[[],[]],errors=[],queue=[];let now=1000;
 const record=hostRecord('Robin'),offer={sessionId:record.snapshot.sessionId,secret:record.secret,hostName:'Robin'};
 const host=new DirectGame(record,{now:()=>now,onReaction:e=>events[0].push(e),onError:e=>errors.push(e)}),guest=new DirectGame(guestRecord(offer,'Bea'),{onReaction:e=>events[1].push(e),onError:e=>errors.push(e)});
 const flush=()=>{while(queue.length){const [client,message]=queue.shift();client.receive(message);}};
 host.attach(message=>queue.push([guest,message]));guest.attach(message=>queue.push([host,message]));flush();
 return {host,guest,events,errors,flush,advance(){now+=REACTION_INTERVAL+1;}};
}
test('Direkte Reaktionen erreichen den Gegner genau einmal und ändern weder Zugversion noch gespeicherten Spielstand',()=>{
 const p=pair();p.host.act('start');p.flush();const before=structuredClone(p.host.record),version=p.host.snapshot.version;
 p.host.sendReaction('kiss');p.flush();assert.equal(p.events[1].length,1);assert.equal(p.events[0].length,0);assert.equal(p.events[1][0].name,'Robin');
 assert.deepEqual(p.host.record,before);assert.equal(p.guest.snapshot.version,version);assert.equal(p.guest.pending,null);
 p.advance();const m=p.guest.envelope('reaction',{emoji:'poop',to:0,gameId:p.host.snapshot.game.gameId});p.host.receive(JSON.stringify(m));p.host.receive(JSON.stringify(m));p.flush();
 assert.equal(p.events[0].length,1);assert.equal(p.events[0][0].name,'Bea');assert.deepEqual(p.host.record,before);
});
test('Reaktionsfehler, fremde Partien und kurze Abstände blockieren keinen gültigen Spielzug',()=>{
 const p=pair();p.host.act('start');p.flush();p.host.sendReaction('laugh');p.flush();
 assert.throws(()=>p.host.sendReaction('poop'),/Moment/);assert.throws(()=>p.host.sendReaction('unknown'),/nicht verfügbar/);
 p.advance();const old=p.guest.envelope('reaction',{emoji:'kiss',to:'all',gameId:'wrong'});p.host.receive(JSON.stringify(old));p.flush();assert.equal(p.events[0].length,0);
 p.host.act('roll');p.flush();assert.equal(p.host.snapshot.game.phase,'choose');assert.equal(p.guest.snapshot.game.phase,'choose');
});
test('Neues Brett wird im Direktspiel gemeinsam festgelegt und bei gespeichertem Neustart behalten',()=>{
 const p=pair();assert(p.host.supportsBoards);assert(p.host.snapshot.capabilities.includes(REACTION_FEATURE));assert(p.guest.snapshot.capabilities.includes(BOARD_FEATURE));
 p.host.act('options',{boardId:'river'});p.flush();p.host.act('start');p.flush();assert.equal(p.guest.snapshot.game.boardId,'river');
 assert.throws(()=>p.host.act('options',{boardId:'mosaic'}),/steht während/);
 const restored=new DirectGame(JSON.parse(JSON.stringify(p.guest.record)));assert.equal(restored.snapshot.game.boardId,'river');
});
test('Direkte Sechsergruppe verteilt gezielte und gemeinsame Reaktionen ohne fremde Empfänger',()=>{
 const received=Array.from({length:6},()=>[]),queue=[],record=hostRecord('Host');let now=1000;
 const host=new DirectGame(record,{now:()=>now,onReaction:e=>received[0].push(e)}),guests=[];
 const flush=()=>{while(queue.length){const [client,message,actor]=queue.shift();client.receive(message,actor);}};
 for(let pid=1;pid<6;pid++){
  host.reserveGuest(pid===1?1:null);
  const guest=new DirectGame(guestRecord({sessionId:host.snapshot.sessionId,secret:pid===1?host.record.secret:host.record.guestSecrets[pid],members:host.snapshot.members,pid},'Gast '+pid),{onReaction:e=>received[pid].push(e)});
  guests.push(guest);host.attach(message=>queue.push([guest,message]),pid);guest.attach(message=>queue.push([host,message,pid]));flush();
 }
 assert(host.ready);host.act('start');flush();const before=JSON.stringify(host.record),version=host.snapshot.version;
 guests[0].sendReaction('kiss',4);flush();assert.deepEqual(received.map(events=>events.length),[0,0,0,0,1,0]);
 now+=REACTION_INTERVAL+1;guests[0].sendReaction('laugh','all');flush();assert.deepEqual(received.map(events=>events.length),[1,0,1,1,2,1]);
 assert.equal(JSON.stringify(host.record),before);assert(guests.every(guest=>guest.snapshot.version===version&&!guest.pending));
 host.pause(3);flush();assert.throws(()=>guests[0].sendReaction('poop'),/verbundenen Partie/);
});
test('Brettauswahl und Reaktionen geben bei älteren Direktclients eine Updatehilfe statt falscher Spielfelder',()=>{
 const p=pair(),link=p.host.links.get(1);link.features=[];
 assert.equal(p.host.supportsBoards,false);assert.throws(()=>p.host.act('options',{boardId:'river'}),/alle Handys Version/);
 p.host.act('start');p.flush();assert.equal(p.guest.snapshot.game.boardId,'classic');
 assert.throws(()=>p.host.sendReaction('kiss'),/Empfänger-Apps/);
 link.features=[BOARD_FEATURE,REACTION_FEATURE];p.host.sendReaction('laugh');p.flush();assert.equal(p.events[1].length,1);
});

test('Direktreaktionen übertragen Größe und Looping an die richtigen Empfänger ohne Spielstandsänderung',()=>{
 const p=pair();p.host.act('start');p.flush();const before=JSON.stringify(p.host.record);
 p.host.sendReaction('kiss','all',{scale:2.5,motion:'loop'});p.flush();assert.equal(p.events[1][0].scale,2.5);assert.equal(p.events[1][0].motion,'loop');
 p.advance();p.guest.sendReaction('laugh',0,{scale:1.5,motion:'bounce'});p.flush();assert.equal(p.events[0][0].scale,1.5);assert.equal(p.events[0][0].motion,'bounce');assert.equal(JSON.stringify(p.host.record),before);
 assert.throws(()=>p.guest.sendReaction('kiss',0,{scale:100,motion:'loop'}));
});


test('Neue Direktreaktionen erreichen beide Richtungen mit Effekten und ohne Spielstandsänderung',()=>{
 const p=pair();p.host.act('start');p.flush();const before=JSON.stringify(p.host.record);
 p.host.sendReaction('thumbsup','all',{scale:2.5,motion:'loop'});p.flush();
 assert.equal(p.events[1][0].emoji,'thumbsup');assert.equal(p.events[1][0].scale,2.5);
 p.advance();p.guest.sendReaction('amazed',0,{scale:1.5,motion:'bounce'});p.flush();
 assert.equal(p.events[0][0].emoji,'amazed');assert.equal(p.events[0][0].motion,'bounce');assert.equal(JSON.stringify(p.host.record),before);
});
test('Nur zusätzliche Emojis verlangen neue Direktclients; alte Auswahl bleibt verfügbar',()=>{
 const p=pair();p.host.act('start');p.flush();p.host.links.get(1).features=[BOARD_FEATURE,REACTION_FEATURE];
 assert.throws(()=>p.host.sendReaction('thumbsup'),/1\.12\.0/);p.host.sendReaction('kiss');p.flush();assert.equal(p.events[1][0].emoji,'kiss');
 p.guest.snapshot.capabilities=p.guest.snapshot.capabilities.filter(feature=>feature!==REACTION_EXTRA_FEATURE);
 assert.throws(()=>p.guest.sendReaction('amazed'),/Gastgeber-App.*1\.12\.0/);
});
test('Neue empfangene Emojis funktionieren ohne Freischaltung und überleben den Raum-Neustart genau einmal',()=>{
 const storage=memoryStorage(),h=overlayHarness({storage}),event={id:'extended-emoji-001',senderId:'host',emoji:'thumbsup',at:h.now};
 h.overlay.receiveRoom([event],'room:game:guest');assert.equal(h.body.children[0].children[0].textContent,'👍');
 const next=overlayHarness({storage});next.overlay.receiveRoom([event],'room:game:guest');assert.equal(next.body.children.length,0);
 next.overlay.receiveRoom([{...event,id:'extended-emoji-002',emoji:'amazed',at:h.now+1}],'room:game:guest');assert.equal(next.body.children[0].children[0].textContent,'😲');
});
