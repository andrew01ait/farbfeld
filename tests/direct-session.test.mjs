import test from 'node:test';
import assert from 'node:assert/strict';
import {DirectSession} from '../public/game/direct.js';
import {DIRECT_PROTOCOL,validRecord} from '../public/game/direct-game.js';
import {decodeQrText} from '../public/game/qr.js';
import {findMove,BOARD} from '../public/game/engine.js';
const connections=new Map();
class TestConnection{
 constructor(options){Object.assign(this,options);this.opened=false;}
 async offer(record,appVersion,pid=1){this.id=crypto.randomUUID();connections.set(this.id,{host:this});this.onState('preparing');return {protocol:DIRECT_PROTOCOL,pid,members:record.snapshot.members,kind:'offer',sessionId:record.snapshot.sessionId,connectionId:this.id,secret:pid===1?record.secret:record.guestSecrets[pid],hostName:record.snapshot.members[0].name,description:{type:'offer',sdp:'v=0\r\na=candidate:1 local typ host'}};}
 async answer(offer){this.id=offer.connectionId;connections.get(this.id).guest=this;this.onState('connecting');return {protocol:DIRECT_PROTOCOL,kind:'answer',sessionId:offer.sessionId,connectionId:this.id,description:{type:'answer',sdp:'v=0\r\na=candidate:2 local typ host'}};}
 async accept(){const pair=connections.get(this.id);pair.host.peer=pair.guest;pair.guest.peer=pair.host;for(const c of [pair.host,pair.guest]){c.opened=true;c.onState('connected');c.onReady(data=>c.send(data));}}
 send(data){if(!this.opened)throw Error('closed');queueMicrotask(()=>{if(this.peer?.opened)this.peer.onMessage(data);});return true;}
 close(notify=true){const peer=this.peer;this.opened=false;if(notify)this.onState('closed');if(peer?.opened){peer.opened=false;peer.onState('disconnected');}}
}
const wait=async predicate=>{for(let i=0;i<1500;i++){if(predicate())return;await new Promise(resolve=>setTimeout(resolve,1));}throw Error('test timeout');};
function fixture(records={}){
 let internet=false,calls=0;const saved={},errors=[],signals=new Map(),clients=[];
 const fetcher=async(path,options)=>{
  calls++;if(!internet)throw Error('Kein Internet');const b=JSON.parse(options.body);let value={};
  if(b.action==='create'){signals.set('ABCDEFGH',{offer:b.offer});value={code:'ABCDEFGH',hostToken:'host-token',expiresAt:Date.now()+600000};}
  if(b.action==='offer')value={offer:signals.get(b.code).offer};
  if(b.action==='answer')signals.get(b.code).answer=b.answer;
  if(b.action==='poll')value={answer:signals.get(b.code).answer||null};
  if(b.action==='close')signals.delete(b.code);
  return Response.json(value);
 };
 const create=(role,record)=>{const session=new DirectSession({saved:record,version:'1.2.0',Connection:TestConnection,fetcher,save:r=>{saved[role]=structuredClone(r);},onError:e=>errors.push(e)});clients.push(session);return session;};
 const host=create('host',records.host),guest=create('guest',records.guest);
 return {host,guest,saved,errors,create,get calls(){return calls;},setInternet(value){internet=value;},dispose(){clients.forEach(c=>c.dispose());}};
}
async function qrPair(f,resume=false){await f.host.host('Robin',resume);const offer=await decodeQrText(f.host.pairing.qr.join('\n'));await f.guest.join(offer,'Bea');const answer=await decodeQrText(f.guest.pairing.qr.join('\n'));await f.host.accept(answer);await wait(()=>f.host.ready&&f.guest.ready);}
async function step(f,pid,action,payload={}){const old=f.host.snapshot.version;(pid===0?f.host:f.guest).act(action,payload);await wait(()=>f.host.snapshot.version>old&&f.host.snapshot.version===f.guest.snapshot.version&&!f.guest.pending);assert.deepEqual(f.host.snapshot,f.guest.snapshot);}
test('Zwei Session-Clients koppeln per vollständigen QR-Daten und spielen ohne Signalisierungs-HTTP bis Spielende',async()=>{
 const f=fixture();try{
  await qrPair(f);assert.equal(f.calls,0);await step(f,0,'start');let moves=0;
  while(f.host.snapshot.game.status==='playing'&&moves<500){
   if(f.host.snapshot.game.phase==='roll')await step(f,f.host.snapshot.game.active,'roll');
   const active=f.host.snapshot.game.active;for(const pid of [active,1-active]){await step(f,pid,'move',{move:findMove(f.host.snapshot.game,pid)||{pass:true}});moves++;}
  }
  assert.equal(f.host.snapshot.game.status,'finished');assert.equal(f.calls,0);assert.deepEqual(f.errors,[]);
 }finally{f.dispose();}
});
test('Raumcode braucht den Dienst nur bei der Kopplung; Internetverlust stoppt keine direkte Aktion',async()=>{
 const f=fixture();try{
  f.setInternet(true);await f.host.host('Robin');await f.host.createCode();const code=f.host.pairing.code;
  await f.guest.joinCode(code,'Bea');assert.equal(f.guest.pairing.viaCode,true);
  await f.host.pollSignal();await wait(()=>f.host.ready&&f.guest.ready);
  f.setInternet(false);const before=f.calls;
  await step(f,0,'start');await step(f,0,'roll');await step(f,0,'move',{move:{pass:true}});await step(f,1,'move',{move:{pass:true}});
  assert.equal(f.calls,before);assert.equal(f.host.snapshot.game.round,2);assert.equal(f.host.signalTimer,null);
 }finally{f.dispose();}
});
test('Heartbeat-Ausfall pausiert, Antwort gleicht automatisch ab; Neustart setzt gespeicherte Partie fort',async()=>{
 let f=fixture();try{
  await qrPair(f);await step(f,0,'start');await step(f,0,'roll');await step(f,0,'move',{move:{pass:true}});await step(f,1,'move',{move:{pass:true}});
  const version=f.host.snapshot.version;f.host.lastMessage=Date.now()-20000;f.host.tick();assert.equal(f.host.ready,false);
  await wait(()=>f.host.ready&&f.guest.ready);assert.equal(f.host.snapshot.version,version);
  f.host.disconnect();assert.equal(f.guest.ready,false);assert.throws(()=>f.guest.act('roll'),/pausiert/);
  const saved=structuredClone(f.saved);f.dispose();f=fixture(saved);assert.equal(f.host.ready,false);await qrPair(f,true);
  assert.equal(f.host.snapshot.version,version);assert.equal(f.host.snapshot.game.round,2);assert.deepEqual(f.host.snapshot,f.guest.snapshot);
 }finally{f.dispose();}
});
test('Eine getrennte Direktpartie lässt sich lokal vollständig verwerfen',async()=>{
 const f=fixture();try{
  await qrPair(f);await step(f,0,'start');f.guest.disconnect();
  assert.equal(f.host.ready,false);f.guest.forget();
  assert.equal(f.saved.guest,null);assert.equal(f.guest.saved,null);assert.equal(f.guest.snapshot,null);
  assert.equal(f.guest.ready,false);assert.equal(f.guest.rtc,null);
  assert.equal(f.saved.host.snapshot.game.status,'playing');
 }finally{f.dispose();}
});

function deferred(){let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};}
test('QR-Kapazitätsfehler verwirft kein gültiges Angebot und blockiert die Code-Alternative nicht',async()=>{
 const f=fixture();try{
  class LargeConnection extends TestConnection{async offer(...args){const offer=await super.offer(...args);offer.description.sdp+='\r\na=test:'+Array.from(crypto.getRandomValues(new Uint8Array(20000)),byte=>byte.toString(16).padStart(2,'0')).join('');return offer;}}
  f.host.Connection=LargeConnection;await f.host.host('Robin');
  assert.equal(f.host.pairing.qr.length,0);assert.match(f.host.pairing.qrError,/Zu viele/);
  assert.deepEqual(await decodeQrText(JSON.stringify(f.host.pairing.data)),f.host.pairing.data);
  assert.equal(f.host.status,'offering');assert.equal(f.calls,0);
  await assert.rejects(f.host.createCode(),/Kein Internet/);assert.match(f.host.pairing.error,/Kein Internet/);
  f.setInternet(true);await f.host.createCode();assert.equal(f.host.pairing.code,'ABCDEFGH');assert.equal(f.host.pairing.error,'');
 }finally{f.dispose();}
});
test('Abbruch während lokaler Angebotserstellung ignoriert späte ICE-Ergebnisse und alte Verbindungsereignisse',async()=>{
 const gate=deferred();let connection,saved,errors=[];
 class SlowConnection extends TestConnection{constructor(options){super(options);connection=this;}async offer(record,appVersion,pid=1){const offer=await super.offer(record);await gate.promise;return offer;}}
 const session=new DirectSession({Connection:SlowConnection,version:'test',save:value=>{saved=structuredClone(value);},onError:error=>errors.push(error)});
 try{
  const hosting=session.host('Robin');await Promise.resolve();assert(session.saved);
  session.forget();assert.equal(saved,null);assert.equal(session.status,'idle');assert.equal(session.rtc,null);
  connection.onState('connecting');connection.onReady(()=>true);connection.onMessage('{}');
  gate.resolve();await hosting;assert.equal(session.status,'idle');assert.equal(session.pairing,null);assert.equal(session.saved,null);assert.deepEqual(errors,[]);
 }finally{gate.resolve();session.dispose();}
});
test('Wartender QR-Gastgeber kann verworfen werden; ein neues Spiel hat eine neue Sitzung',async()=>{
 const f=fixture();try{
  await f.host.host('Robin');const id=f.host.snapshot.sessionId,old=f.host.rtc;
  assert(f.host.pairing);f.host.forget();assert.equal(f.saved.host,null);assert.equal(f.host.signalTimer,null);assert.equal(old.opened,false);
  await f.host.host('Robin');assert.notEqual(f.host.snapshot.sessionId,id);assert.equal(f.host.pairing.kind,'offer');
 }finally{f.dispose();}
});
test('Verspätetes Raumcode-Angebot erzeugt nach Abbruch keinen neuen Gast-Spielstand',async()=>{
 const f=fixture(),gate=deferred();let request;
 try{
  await f.host.host('Robin');const offer=f.host.pairing.data;
  f.guest.fetcher=async(_path,options)=>{request=options;return gate.promise;};
  const joining=f.guest.joinCode('ABCDEFGH','Bea');f.guest.forget();assert.equal(request.signal.aborted,true);
  gate.resolve(Response.json({offer}));assert.equal(await joining,false);
  assert.equal(f.guest.saved,null);assert.equal(f.saved.guest,null);assert.equal(f.guest.rtc,null);assert.equal(f.guest.status,'idle');assert.deepEqual(f.errors,[]);
 }finally{f.dispose();}
});
test('Verspätet erzeugter Raumcode wird nach Abbruch geschlossen und nie wieder angezeigt',async()=>{
 const f=fixture(),gate=deferred(),closed=[];let request;
 try{
  await f.host.host('Robin');f.host.fetcher=async(_path,options)=>{const body=JSON.parse(options.body);if(body.action==='create'){request=options;return gate.promise;}if(body.action==='close')closed.push(body.code);return Response.json({ok:true});};
  const creating=f.host.createCode();f.host.forget();assert.equal(request.signal.aborted,true);
  gate.resolve(Response.json({code:'ABCDEFGH',hostToken:'token',expiresAt:Date.now()+600000}));await creating;
  assert.deepEqual(closed,['ABCDEFGH']);assert.equal(f.host.pairing,null);assert.equal(f.host.signal,null);assert.equal(f.saved.host,null);
 }finally{f.dispose();}
});
test('Abbruch beim Übermitteln der Raumcode-Antwort bleibt nach einer verspäteten Bestätigung bestehen',async()=>{
 const f=fixture(),gate=deferred();let request;
 try{
  f.setInternet(true);await f.host.host('Robin');await f.host.createCode();const fetcher=f.guest.fetcher;
  f.guest.fetcher=async(path,options)=>{if(JSON.parse(options.body).action==='answer'){request=options;return gate.promise;}return fetcher(path,options);};
  const joining=f.guest.joinCode('ABCDEFGH','Bea'),generation=f.guest.generation;await wait(()=>request);assert(f.guest.saved);assert.equal(f.guest.generation,generation);
  f.guest.forget();assert.equal(request.signal.aborted,true);gate.resolve(Response.json({ok:true}));assert.equal(await joining,false);
  assert.equal(f.guest.saved,null);assert.equal(f.guest.pairing,null);assert.equal(f.guest.status,'idle');assert(f.host.saved);
 }finally{f.dispose();}
});
test('Laufende Raumcode-Abfrage wird abgebrochen; späte Antwort verbindet die verworfene Sitzung nicht',async()=>{
 const f=fixture(),gate=deferred();let request;
 try{
  f.setInternet(true);await f.host.host('Robin');const fetcher=f.host.fetcher;
  f.host.fetcher=async(path,options)=>{if(JSON.parse(options.body).action==='poll'){request=options;return gate.promise;}return fetcher(path,options);};
  await f.host.createCode();assert(request);f.host.forget();assert.equal(request.signal.aborted,true);
  gate.resolve(Response.json({answer:{protocol:1}}));await Promise.resolve();await Promise.resolve();
  assert.equal(f.host.signalTimer,null);assert.equal(f.host.signalBusy,false);assert.equal(f.host.saved,null);assert.equal(f.host.status,'idle');assert.deepEqual(f.errors,[]);
 }finally{f.dispose();}
});
test('Fehlgeschlagenes Entfernen im Speicher lässt die vorhandene Kopplung erhalten',async()=>{
 const f=fixture();try{
  await f.host.host('Robin');const id=f.host.snapshot.sessionId,generation=f.host.generation,save=f.host.save;
  f.host.save=()=>false;assert.throws(()=>f.host.forget(),/Gerätespeicher/);
  assert.equal(f.host.snapshot.sessionId,id);assert.equal(f.host.generation,generation);assert(f.host.pairing);
  f.host.save=save;f.host.forget();assert.equal(f.saved.host,null);
 }finally{f.dispose();}
});

async function group(f,count=6,viaCode=false){
 const clients=[f.host,f.guest];await f.host.host('Robin');
 for(let pid=1;pid<count;pid++){
  if(pid>1){await f.host.invite();clients.push(f.create('guest'+pid,null));}
  if(viaCode){await f.host.createCode();await clients[pid].joinCode(f.host.pairing.code,'Person '+(pid+1));await f.host.pollSignal();}
  else{const offer=await decodeQrText(f.host.pairing.qr.join('\n'));assert.equal(offer.pid,pid);await clients[pid].join(offer,'Person '+(pid+1));const answer=await decodeQrText(clients[pid].pairing.qr.join('\n'));await f.host.accept(answer);}
  await wait(()=>clients.slice(0,pid+1).every(c=>c.ready&&c.snapshot.version===f.host.snapshot.version));
 }
 return clients;
}
async function groupStep(clients,pid,action,payload={}){
 const old=clients[0].snapshot.version;clients[pid].act(action,payload);
 await wait(()=>clients[0].snapshot.version>old&&clients.every(c=>!c.pending&&c.snapshot.version===clients[0].snapshot.version));
 for(const client of clients)assert.deepEqual(client.snapshot,clients[0].snapshot);
}
test('Sechs getrennte Clients koppeln einmal per QR, weitere Einladungen erhalten alle bisherigen Kanäle',async()=>{
 const f=fixture();try{
  const clients=await group(f);assert.equal(f.calls,0);assert.equal(f.host.peers.size,5);
  assert.equal(f.host.online.length,6);assert.deepEqual(clients.map(c=>c.pid),[0,1,2,3,4,5]);
  clients.forEach(c=>assert(validRecord(c.saved)));
  assert.equal(new Set([f.host.saved.secret,...Object.values(f.host.saved.guestSecrets)]).size,5);
  await assert.rejects(f.host.invite(),/höchstens sechs/);assert(clients.every(c=>c.ready));
  await groupStep(clients,0,'start');assert.equal(f.host.snapshot.game.players.length,6);
  await assert.rejects(f.host.invite(),/Gruppe steht/);
  await groupStep(clients,0,'roll');await groupStep(clients,0,'move',{move:{pass:true}});
  const before=f.host.snapshot.version;
  // All five guests act on the same confirmed version, before any reply arrives.
  clients.slice(1).forEach(c=>c.act('move',{move:{pass:true}}));
  await wait(()=>clients.every(c=>!c.pending&&c.snapshot.version===before+5));
  assert.equal(f.host.snapshot.game.round,2);assert.equal(f.host.snapshot.game.log.length,6);
  assert.deepEqual(f.errors,[]);assert.equal(f.calls,0);
 }finally{f.dispose();}
});
test('Eigene Rollen bleiben bei sechs Handys gebunden; doppelte, alte und fremde Aktionen bewirken keinen weiteren Zug',async()=>{
 const f=fixture();try{
  const clients=await group(f);await groupStep(clients,0,'start');await groupStep(clients,0,'roll');
  await groupStep(clients,0,'move',{move:{pass:true}});
  const actor=clients[3],id=actor.act('move',{pid:2,move:{pass:true}}),duplicate=structuredClone(actor.pending);
  await wait(()=>!actor.pending);assert.equal(duplicate.actionId,id);
  assert.deepEqual(f.host.snapshot.game.submitted,[0,3]);
  const version=f.host.snapshot.version;actor.rtc.send(JSON.stringify(duplicate));await new Promise(r=>setTimeout(r,2));assert.equal(f.host.snapshot.version,version);
  const wrong=clients[2].manager.envelope('hello',{secret:clients[3].saved.secret,name:'Fremder'});
  clients[2].rtc.send(JSON.stringify(wrong));await new Promise(r=>setTimeout(r,2));assert.equal(f.host.snapshot.members[2].name,'Person 3');
  assert.match(f.errors.pop(),/Spielerplatz|Platz in der Partie/);
  const stale=clients[2].manager.envelope('action',{action:'move',gameId:f.host.snapshot.game.gameId,round:0,move:{pass:true}},crypto.randomUUID(),version-1);
  clients[2].rtc.send(JSON.stringify(stale));await new Promise(r=>setTimeout(r,2));assert.equal(f.host.snapshot.version,version);assert.match(f.errors.pop(),/inzwischen aktualisiert/);
  const foreign={...stale,sessionId:'fremd'};clients[2].rtc.send(JSON.stringify(foreign));await new Promise(r=>setTimeout(r,2));assert.equal(f.host.snapshot.version,version);
 }finally{f.dispose();}
});
test('Ein getrenntes Gruppenmitglied pausiert alle; gezielte Wiederkopplung lässt die anderen vier Kanäle offen',async()=>{
 const f=fixture();try{
  const clients=await group(f);await groupStep(clients,0,'start');await groupStep(clients,0,'roll');
  const old=f.host.snapshot.version,other=f.host.peers.get(1).connection;
  clients[3].disconnect();await wait(()=>clients.every(c=>!c.ready));
  clients.forEach(c=>assert.throws(()=>c.act('move',{move:{pass:true}}),/pausiert/));
  assert.equal(other.opened,true);await f.host.invite(3);assert.equal(other.opened,true);
  const offer=await decodeQrText(f.host.pairing.qr.join('\n'));assert.equal(offer.pid,3);
  await assert.rejects(clients[2].join(offer,'Person 3'),/anderen Spielerplatz/);assert.equal(clients[2].pid,2);
  await clients[3].join(offer,'Person 4');await f.host.accept(await decodeQrText(clients[3].pairing.qr.join('\n')));
  await wait(()=>clients.every(c=>c.ready));assert.equal(f.host.snapshot.version,old);
  clients.forEach(c=>assert.deepEqual(c.snapshot,f.host.snapshot));assert.equal(f.calls,0);
 }finally{f.dispose();}
});
test('Eine nicht angenommene Gruppeneinladung kann zurückgenommen werden, ohne die laufenden Kopplungen zu trennen',async()=>{
 const f=fixture();try{
  const clients=await group(f,3);const peers=[...f.host.peers.values()].map(p=>p.connection);
  await f.host.invite();assert.equal(f.host.snapshot.members.length,4);assert.equal(f.host.ready,false);
  f.host.cancelPairing();await wait(()=>clients.every(c=>c.ready));
  assert.equal(f.host.snapshot.members.length,3);assert(peers.every(p=>p.opened));assert.equal(f.host.pairing,null);
  await groupStep(clients,0,'start');assert.equal(f.host.snapshot.game.players.length,3);
 }finally{f.dispose();}
});
test('Sechs Clients setzen nach komplettem Offline-Neustart dieselbe Partie fort',async()=>{
 let f=fixture();try{
  let clients=await group(f);await groupStep(clients,0,'start');await groupStep(clients,0,'roll');await groupStep(clients,0,'move',{move:{pass:true}});
  const saved=structuredClone(f.saved),version=f.host.snapshot.version;f.dispose();f=fixture(saved);
  clients=[f.host,f.guest,...Array.from({length:4},(_,i)=>f.create('guest'+(i+2),saved['guest'+(i+2)]))];
  assert(clients.every(c=>!c.ready));
  for(let pid=1;pid<6;pid++){
   if(pid===1)await f.host.host('',true);else await f.host.invite(pid);
   await clients[pid].join(await decodeQrText(f.host.pairing.qr.join('\n')),'Person '+(pid+1));
   await f.host.accept(await decodeQrText(clients[pid].pairing.qr.join('\n')));
   await wait(()=>f.host.manager.connected(pid)&&clients[pid].online.includes(pid));
  }
  await wait(()=>clients.every(c=>c.ready));assert.equal(f.host.snapshot.version,version);
  assert.deepEqual(f.host.snapshot.game.submitted,[0]);
  for(let pid=1;pid<6;pid++)await groupStep(clients,pid,'move',{move:{pass:true}});
  assert.equal(f.host.snapshot.game.round,2);assert.equal(f.calls,0);
 }finally{f.dispose();}
});
test('Sechs Clients mit Raumcode-Kopplung brauchen nach Internetverlust keinen Signalisierungsdienst mehr',async()=>{
 const f=fixture();try{
  f.setInternet(true);const clients=await group(f,6,true);f.setInternet(false);const calls=f.calls;
  await groupStep(clients,0,'start');await groupStep(clients,0,'roll');await groupStep(clients,0,'move',{move:{pass:true}});
  for(let pid=1;pid<6;pid++)await groupStep(clients,pid,'move',{move:{pass:true}});
  assert.equal(f.host.snapshot.game.round,2);assert.equal(f.calls,calls);assert.equal(f.host.signalTimer,null);assert.deepEqual(f.errors,[]);
 }finally{f.dispose();}
});
test('Vollständige Sechser-Partie verteilt jeden Wurf einmal, rotiert alle Rollen und beendet alle sechs Spielstände gemeinsam',async()=>{
 const f=fixture();try{
  const clients=await group(f);await groupStep(clients,0,'start');let moves=0;const actives=new Set();
  while(f.host.snapshot.game.status==='playing'&&moves<1200){
   let g=f.host.snapshot.game;actives.add(g.active);await groupStep(clients,g.active,'roll');
   g=f.host.snapshot.game;const active=g.active;await groupStep(clients,active,'move',{move:findMove(g,active)||{pass:true}});moves++;
   g=f.host.snapshot.game;
   const remaining=clients.map((c,pid)=>({c,pid,move:findMove(g,pid)||{pass:true}})).filter(x=>x.pid!==active);
   const before=f.host.snapshot.version;remaining.forEach(({c,move})=>c.act('move',{move}));
   await wait(()=>clients.every(c=>!c.pending&&c.snapshot.version===before+5));moves+=5;
   for(const c of clients)assert.deepEqual(c.snapshot,f.host.snapshot);
  }
  assert.equal(f.host.snapshot.game.status,'finished');assert(moves>30&&moves<1200);assert.equal(actives.size,6);
  assert(f.host.snapshot.game.players.some(p=>Object.values(p.colors).filter(v=>v!==null).length>=2));
  assert(f.host.snapshot.game.players.some(p=>Object.values(p.colors).includes(5)));assert.equal(f.calls,0);assert.deepEqual(f.errors,[]);
 }finally{f.dispose();}
});

test('Sechs Spieler erhalten Gleichstands-Erstboni, spätere Boni und Spielende erst nach dem letzten Zug',async()=>{
 const f=fixture();try{
  const clients=await group(f);await groupStep(clients,0,'start');
  const mark=(pid,color)=>BOARD.forEach((c,i)=>{if(c===color)f.host.manager.record.snapshot.game.players[pid].marks[i]=true;});
  const round=async(beforeLast=()=>{})=>{const active=f.host.snapshot.game.active;await groupStep(clients,active,'roll');await groupStep(clients,active,'move',{move:{pass:true}});const rest=clients.map((_,pid)=>pid).filter(pid=>pid!==active);for(const pid of rest.slice(0,-1))await groupStep(clients,pid,'move',{move:{pass:true}});beforeLast();await groupStep(clients,rest.at(-1),'move',{move:{pass:true}});};
  mark(0,'g');mark(1,'g');await round(()=>assert.equal(f.host.snapshot.game.players[0].colors.g,null));
  assert.equal(f.host.snapshot.game.players[0].colors.g,5);assert.equal(f.host.snapshot.game.players[1].colors.g,5);
  mark(2,'g');mark(5,'g');await round();assert.equal(f.host.snapshot.game.players[2].colors.g,3);assert.equal(f.host.snapshot.game.players[5].colors.g,3);
  mark(0,'y');await round(()=>assert.equal(f.host.snapshot.game.status,'playing'));
  assert.equal(f.host.snapshot.game.status,'finished');clients.forEach(c=>assert.deepEqual(c.snapshot,f.host.snapshot));
  await groupStep(clients,0,'rematch');await groupStep(clients,0,'start');assert.equal(f.host.snapshot.game.players.length,6);
  await groupStep(clients,5,'abort');assert.equal(f.host.snapshot.game,null);assert.equal(f.host.snapshot.lastAbort.by,'Person 6');assert(clients.every(c=>c.ready));
 }finally{f.dispose();}
});

test('Speicherfehler auf einem Gast-Handy pausiert auch die übrigen fünf Clients',async()=>{
 const f=fixture();try{
  const clients=await group(f);await groupStep(clients,0,'start');const saved=structuredClone(f.saved.guest2);
  clients[2].manager.save=()=>false;f.host.act('roll');await wait(()=>clients.every(c=>!c.ready));
  assert.equal(clients[2].manager.storageFailed,true);assert.deepEqual(f.saved.guest2,saved);assert.match(f.errors.pop(),/nicht gespeichert/);
  clients.forEach(c=>assert.throws(()=>c.act('move',{move:{pass:true}}),/pausiert/));
 }finally{f.dispose();}
});

test('Eine weitere Einladung meldet nicht versehentlich die vorherige Kopplung als fertig',async()=>{
 const f=fixture();try{
  await qrPair(f);assert.equal(f.host.pairingComplete,true);const stages=[];
  f.host.onChange=()=>stages.push({ready:f.host.ready,complete:f.host.pairingComplete});
  await f.host.invite();assert.equal(f.host.pairing.kind,'offer');assert.equal(f.host.pairing.pid,2);
  assert(stages.length>0);assert(stages.every(stage=>!stage.ready&&!stage.complete));
 }finally{f.dispose();}
});

test('Verdeckte Direktpartie überträgt pro Gast nur das eigene Blatt und deckt am Ende alle auf',async()=>{
 const f=fixture();try{
  const clients=await group(f,3);
  await groupStep(clients,0,'options',{hiddenScores:true});
  f.host.act('start');await wait(()=>clients.every(c=>c.snapshot.game));
  assert.equal(f.host.snapshot.game.players[1].marks.length,105);
  assert.equal(clients[1].snapshot.game.players[0].marks,undefined);assert.equal(clients[1].snapshot.game.players[1].marks.length,105);assert.equal(clients[1].snapshot.game.players[2].jokers,undefined);
  assert.equal(clients[2].snapshot.game.players[1].marks,undefined);assert.equal(clients[2].snapshot.game.players[2].marks.length,105);
  clients.forEach(c=>assert(validRecord(c.saved)));
  BOARD.forEach((color,i)=>{if(color==='g'||color==='y')f.host.manager.record.snapshot.game.players[0].marks[i]=true;});
  f.host.act('roll');await wait(()=>clients.every(c=>c.snapshot.game.phase==='choose'));
  f.host.act('move',{move:{pass:true}});await wait(()=>clients[1].snapshot.game.submitted.includes(0));
  clients[1].act('move',{move:{pass:true}});await wait(()=>!clients[1].pending);
  assert.equal(clients[2].snapshot.game.status,'playing');assert.equal(clients[2].snapshot.game.players[0].marks,undefined);
  clients[2].act('move',{move:{pass:true}});await wait(()=>clients.every(c=>c.snapshot.game.status==='finished'));
  clients.forEach(c=>{assert(c.snapshot.game.players.every(p=>p.marks.length===105));assert.deepEqual(c.snapshot,f.host.snapshot);});
 }finally{f.dispose();}
});

test('Gespeicherte verdeckte Direktstände setzen nach Neustart die eigene Rolle fort, ohne fremde Blätter offenzulegen',async()=>{
 let f=fixture();try{
  let clients=await group(f,3);await groupStep(clients,0,'options',{hiddenScores:true});f.host.act('start');await wait(()=>clients.every(c=>c.snapshot.game));
  const saved=structuredClone(f.saved),id=f.host.snapshot.game.gameId;f.dispose();f=fixture(saved);clients=[f.host,f.guest,f.create('guest2',saved.guest2)];
  for(let pid=1;pid<3;pid++){if(pid===1)await f.host.host('',true);else await f.host.invite(pid);await clients[pid].join(await decodeQrText(f.host.pairing.qr.join('\n')),'Person '+(pid+1));await f.host.accept(await decodeQrText(clients[pid].pairing.qr.join('\n')));await wait(()=>f.host.manager.connected(pid));}
  await wait(()=>clients.every(c=>c.ready));assert.equal(f.host.snapshot.game.gameId,id);
  assert.equal(clients[1].snapshot.game.players[1].marks.length,105);assert.equal(clients[1].snapshot.game.players[2].marks,undefined);
  assert.equal(clients[2].snapshot.game.players[2].marks.length,105);assert.equal(clients[2].snapshot.game.players[0].marks,undefined);
 }finally{f.dispose();}
});
