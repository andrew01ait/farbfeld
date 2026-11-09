import test from 'node:test';
import assert from 'node:assert/strict';
import {DirectGame,hostRecord,guestRecord,validRecord,DIRECT_PROTOCOL} from '../public/game/direct-game.js';
import {findMove,BOARD,COLORS} from '../public/game/engine.js';
import {LAN_RTC_CONFIG,validateHandshake,waitForIce} from '../public/game/direct-connection.js';
function pair({records=null}={}){
  const out=[],errors=[],saved={};
  const hRecord=records?.host||hostRecord('Robin');
  const offer={sessionId:hRecord.snapshot.sessionId,hostName:'Robin',secret:hRecord.secret};
  const gRecord=records?.guest||guestRecord(offer,'Bea');
  let seed=13;const rng=max=>{seed=(seed*1664525+1013904223)>>>0;return seed%max;};
  const host=new DirectGame(hRecord,{save:r=>{saved.host=r;},onError:e=>errors.push(e),rng});
  const guest=new DirectGame(gRecord,{save:r=>{saved.guest=r;},onError:e=>errors.push(e)});
  let dropHost=false,dropGuest=false;
  const flush=()=>{let n=0;while(out.length){if(++n>500)throw Error('message loop');const [target,message]=out.shift();target.receive(message);}};
  const link=()=>{host.attach(message=>{if(!dropHost)out.push([guest,message]);});guest.attach(message=>{if(!dropGuest)out.push([host,message]);});flush();};
  link();
  return {host,guest,flush,link,errors,saved,dropHost(value){dropHost=value;},dropGuest(value){dropGuest=value;},sync(){host.transmit(host.state());flush();}};
}
test('Direktprotokoll authentifiziert die zweite Person und hält Rollen getrennt',()=>{
  const p=pair();assert(p.host.ready&&p.guest.ready);assert.equal(p.guest.snapshot.members[1].name,'Bea');
  assert.equal(validRecord(p.saved.host),true);assert.equal(p.host.pid,0);assert.equal(p.guest.pid,1);
  p.guest.act('start');p.flush();assert.equal(p.host.snapshot.game,null);assert.match(p.errors.pop(),/Nur der Gastgeber/);
  p.host.act('start');p.flush();assert.equal(p.host.snapshot.game.mode,'direct');
  p.guest.act('roll');p.flush();assert.equal(p.host.snapshot.game.phase,'roll');
  p.host.act('roll');p.flush();assert.equal(p.guest.snapshot.game.phase,'choose');
  const version=p.host.snapshot.version;
  p.guest.act('move',{pid:0,move:{pass:true}});p.flush();
  assert.equal(p.host.snapshot.version,version);assert.match(p.errors.pop(),/noch nicht am Zug/);
});
test('Ungültige Sitzung, Protokoll und Gastschlüssel verändern den Gastgeberstand nicht',()=>{
  const p=pair(),version=p.host.snapshot.version;
  const fake=p.guest.envelope('hello',{secret:'falsch',name:'Eindringling'});
  p.host.receive(JSON.stringify(fake));assert.equal(p.host.snapshot.members[1].name,'Bea');
  fake.sessionId='andere-partie';p.host.receive(JSON.stringify(fake));
  fake.sessionId=p.host.snapshot.sessionId;fake.protocol=99;p.host.receive(JSON.stringify(fake));
  assert.equal(p.host.snapshot.version,version);
});
test('Doppelte Würfe und veraltete Aktionen werden nicht noch einmal angewandt',()=>{
  const p=pair();p.host.act('start');p.flush();
  const roll=p.host.envelope('action',{action:'roll'});p.host.apply(roll,0,true);p.flush();
  const dice=structuredClone(p.host.snapshot.game.dice),version=p.host.snapshot.version;
  p.host.apply(roll,0,true);p.flush();assert.equal(p.host.snapshot.version,version);assert.deepEqual(p.host.snapshot.game.dice,dice);
  const stale=p.guest.envelope('action',{action:'move',move:{pass:true}},crypto.randomUUID(),version-1);
  p.host.receive(JSON.stringify(stale));p.flush();assert.equal(p.host.snapshot.version,version);assert.match(p.errors.pop(),/inzwischen aktualisiert/);
});
test('Abbruch sperrt Aktionen; verlorene Bestätigung wird nach Neustart ohne Doppelzug abgeglichen',()=>{
  const p=pair();p.host.act('start');p.host.act('roll');p.host.act('move',{move:{pass:true}});p.flush();
  p.dropHost(true);p.guest.act('move',{move:{pass:true}});p.flush();
  assert(p.guest.pending);assert.equal(p.host.snapshot.game.round,2);
  p.host.pause();p.guest.pause();assert.throws(()=>p.host.act('roll'),/pausiert/);assert.throws(()=>p.guest.act('roll'),/pausiert/);
  const resumed=pair({records:p.saved});
  assert(resumed.host.ready&&resumed.guest.ready);assert.equal(resumed.guest.pending,null);
  assert.equal(resumed.host.snapshot.game.log.length,2);assert.equal(resumed.host.snapshot.game.round,2);
  assert.deepEqual(resumed.host.snapshot,resumed.guest.snapshot);
});
test('Lokaler Speicherfehler bestätigt keinen neuen Stand und pausiert',()=>{
  const p=pair();p.host.save=()=>{throw Error('quota');};const version=p.host.snapshot.version;
  p.host.act('start');assert.equal(p.host.ready,false);assert.equal(p.host.snapshot.version,version);assert.match(p.errors.pop(),/nicht gespeichert/);
});
test('Vollständige direkte Partie mit geteilten Würfen, Zugwechseln, Boni und Spielende',()=>{
  const p=pair();p.host.act('start');p.flush();let moves=0;
  while(p.host.snapshot.game.status==='playing'&&moves<500){
    let g=p.host.snapshot.game;
    if(g.phase==='roll'){(g.active===0?p.host:p.guest).act('roll');p.flush();}
    const order=[p.host.snapshot.game.active,1-p.host.snapshot.game.active];
    for(const pid of order){
      g=p.host.snapshot.game;const actor=pid===0?p.host:p.guest;
      actor.act('move',{move:findMove(g,pid)||{pass:true}});p.flush();moves++;
      assert.deepEqual(p.host.snapshot,p.guest.snapshot);
    }
  }
  assert.equal(p.host.snapshot.game.status,'finished');assert(moves>20&&moves<500);
  assert(p.host.snapshot.game.players.some(player=>COLORS.filter(c=>player.colors[c]!==null).length===2));
  assert(p.host.snapshot.game.players.some(player=>Object.values(player.colors).includes(5)));
  console.log('Direktpartie: '+moves+' Züge, '+p.host.snapshot.game.round+' Würfe.');
});
test('Direkte Wertung vergibt zuerst 5, später 3 und beendet erst nach allen Zügen',()=>{
  const p=pair();p.host.act('start');p.flush();
  const mark=(pid,color)=>BOARD.forEach((c,i)=>{if(c===color)p.host.record.snapshot.game.players[pid].marks[i]=true;});
  const finishRound=()=>{const active=p.host.snapshot.game.active;(active===0?p.host:p.guest).act('roll');p.flush();(active===0?p.host:p.guest).act('move',{move:{pass:true}});p.flush();(active===0?p.guest:p.host).act('move',{move:{pass:true}});p.flush();};
  mark(0,'g');p.sync();finishRound();assert.equal(p.host.snapshot.game.players[0].colors.g,5);
  mark(1,'g');p.sync();finishRound();assert.equal(p.guest.snapshot.game.players[1].colors.g,3);
  mark(0,'y');p.sync();const active=p.host.snapshot.game.active;
  (active===0?p.host:p.guest).act('roll');p.flush();(active===0?p.host:p.guest).act('move',{move:{pass:true}});p.flush();
  assert.equal(p.host.snapshot.game.status,'playing');
  (active===0?p.guest:p.host).act('move',{move:{pass:true}});p.flush();
  assert.equal(p.host.snapshot.game.status,'finished');assert.deepEqual(p.host.snapshot,p.guest.snapshot);
});
test('Lokale RTC-Konfiguration hat keine STUN-/TURN-Server; QR-Daten sind streng zugeordnet',()=>{
  assert.deepEqual(LAN_RTC_CONFIG.iceServers,[]);
  const offer={protocol:DIRECT_PROTOCOL,pid:1,members:[{id:'s:0',name:'A'},{id:'s:1',name:''}],kind:'offer',sessionId:'s',connectionId:'c',secret:'x'.repeat(64),description:{type:'offer',sdp:'a=candidate:local typ host'}};
  assert.equal(validateHandshake(offer,'offer'),offer);assert.throws(()=>validateHandshake(offer,'answer'),/QR-Code/);
});
test('ICE-Angebot wird erst nach vollständiger Kandidatensammlung ausgegeben',async()=>{
  const pc=new EventTarget();pc.iceGatheringState='gathering';pc.localDescription={type:'offer',sdp:'v=0'};
  let settled=false;const result=waitForIce(pc,1000).then(value=>{settled=true;return value;});
  await Promise.resolve();assert.equal(settled,false);
  pc.localDescription.sdp+='\\r\\na=candidate:1 local typ host';pc.iceGatheringState='complete';pc.dispatchEvent(new Event('icegatheringstatechange'));
  assert.match((await result).sdp,/candidate/);
});
test('Abgebrochene ICE-Sammlung endet sofort und ignoriert später eintreffende Kandidaten',async()=>{
 const pc=new EventTarget(),controller=new AbortController();pc.iceGatheringState='gathering';pc.localDescription={type:'offer',sdp:'v=0'};
 const result=waitForIce(pc,20000,controller.signal);controller.abort();await assert.rejects(result,/abgebrochen/);
 pc.iceGatheringState='complete';pc.localDescription.sdp+='a=candidate:late';pc.dispatchEvent(new Event('icegatheringstatechange'));
 await assert.rejects(waitForIce(pc,20000,controller.signal),/abgebrochen/);
});
test('Beschädigte Direkt-Spielstände werden vor dem Start abgewiesen',()=>{
 const r=hostRecord('Robin');assert(validRecord(r));assert.equal(validRecord({...r,seen:null}),false);assert.equal(validRecord({...r,pending:'kaputt'}),false);
 const p=pair();p.host.act('start');const invalid=structuredClone(p.host.record);invalid.snapshot.game.players[0].colors=null;assert.equal(validRecord(invalid),false);
});
test('Eine Direktpartie kann von beiden Personen abgebrochen werden; der Kanal bleibt für eine neue Partie nutzbar',()=>{
 const p=pair();p.host.act('start');p.flush();p.host.act('roll');p.flush();
 const oldGame=p.host.snapshot.game.gameId;
 p.guest.act('abort');const duplicate=structuredClone(p.guest.pending);p.flush();
 assert.equal(p.host.snapshot.game,null);assert.equal(p.guest.snapshot.game,null);
 assert.equal(p.host.snapshot.lastAbort.by,'Bea');assert.equal(p.host.snapshot.lastAbort.gameId,oldGame);
 assert(p.host.ready&&p.guest.ready);
 p.host.act('start');p.flush();const newId=p.host.snapshot.game.gameId,version=p.host.snapshot.version;
 assert.notEqual(newId,oldGame);assert.equal(p.host.snapshot.lastAbort,undefined);
 p.host.receive(JSON.stringify(duplicate));p.flush();
 assert.equal(p.host.snapshot.version,version);assert.equal(p.host.snapshot.game.gameId,newId);
 const stale=p.guest.envelope('action',{action:'move',move:{pass:true}},crypto.randomUUID(),version-2);
 p.host.receive(JSON.stringify(stale));p.flush();assert.equal(p.host.snapshot.game.turn,0);
});
test('Ein Abbruch bleibt nach Neustart erhalten und kann nicht als laufende Partie fortgesetzt werden',()=>{
 const p=pair();p.host.act('start');p.flush();p.host.act('abort');p.flush();
 const resumed=pair({records:p.saved});assert.equal(resumed.host.snapshot.game,null);
 assert.equal(resumed.guest.snapshot.lastAbort.by,'Robin');assert.equal(resumed.guest.pending,null);
 assert.throws(()=>resumed.host.act('roll'),/aktive Person/);
});
test('Ein alter Gastgeber ohne Abbruchfunktion verändert bei neuer Gast-App keine Partie',()=>{
 const p=pair();p.host.act('start');p.flush();
 const legacy=structuredClone(p.host.snapshot);delete legacy.capabilities;
 p.guest.receive(JSON.stringify(p.host.envelope('state',{snapshot:legacy})));
 assert.throws(()=>p.guest.act('abort'),/Gastgeber-App/);assert.equal(p.guest.pending,null);
 assert.equal(p.host.snapshot.game.status,'playing');
});

test('Bestehende Zweier-Speicherstände und eine ausstehende Protokoll-1-Aktion werden ohne Datenverlust fortgesetzt',()=>{
 const p=pair();p.host.act('start');p.host.act('roll');p.host.act('move',{move:{pass:true}});p.flush();
 p.dropGuest(true);p.guest.act('move',{move:{pass:true}});
 const legacy=structuredClone(p.saved);delete legacy.host.guestSecrets;delete legacy.guest.pid;
 legacy.guest.pending.protocol=1;legacy.host.snapshot.capabilities=['abort-v1'];
 assert(validRecord(legacy.host));assert(validRecord(legacy.guest));
 const resumed=pair({records:legacy});assert.equal(resumed.guest.pid,1);assert.equal(resumed.guest.pending,null);
 assert.equal(resumed.host.snapshot.game.round,2);assert.equal(resumed.host.snapshot.game.log.length,2);
 assert.deepEqual(resumed.host.snapshot,resumed.guest.snapshot);
 assert.equal(resumed.host.record.schema,1);assert.equal(resumed.guest.record.schema,1);
});
