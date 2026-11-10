import {RANDOM_BOARD_FEATURE,boardFor,validGameBoard} from '../public/game/boards.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {DirectGame,hostRecord,guestRecord,validRecord,validSnapshot,normalizeDirectRoomName,DIRECT_PROTOCOL} from '../public/game/direct-game.js';
import {findMove,BOARD,COLORS,BONUS_FEATURE,bonusPoints,validBonusState} from '../public/game/engine.js';
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

test('Direkte Bonuspartie hält Positionen geheim, vergibt beide Rundentreffer und dedupliziert verlorene Quittungen',()=>{
 const p=pair();p.host.act('options',{bonusFields:true});p.flush();p.host.act('start');p.flush();
 let g=p.host.snapshot.game;g.phase='choose';g.dice={colors:['g','b','o'],numbers:[1,2,3]};g.bonuses.fields=[7,8,9].map(index=>({index,claim:null,pending:[]}));p.sync();
 assert.equal(p.guest.snapshot.game.bonuses.fields,undefined);assert.equal(p.guest.snapshot.game.bonuses.awards.length,0);
 p.host.act('move',{move:{ci:0,ni:0,cells:[7]}});p.flush();assert.equal(p.guest.snapshot.game.bonuses.awards.length,0);
 p.dropHost(true);p.guest.act('move',{move:{ci:0,ni:0,cells:[7]}});p.flush();assert(p.guest.pending);
 assert.equal(bonusPoints(p.host.snapshot.game,0),2);assert.equal(bonusPoints(p.host.snapshot.game,1),2);
 const originalFields=p.host.snapshot.game.bonuses.fields.map(f=>f.index),resumed=pair({records:p.saved});
 assert.equal(resumed.guest.pending,null);assert.deepEqual(resumed.host.snapshot.game.bonuses.fields.map(f=>f.index),originalFields);
 for(const pid of [0,1])assert.equal(bonusPoints(resumed.guest.snapshot.game,pid),2);
 assert(validBonusState(resumed.host.snapshot.game));assert(validBonusState(resumed.guest.snapshot.game,{allowProjection:true}));assert.equal(resumed.guest.snapshot.game.bonuses.fields,undefined);
 assert.throws(()=>resumed.host.act('options',{bonusFields:false}),/während/);
});
test('Bonusoption und Start verlangen aktuelle Gegenstellen; Standardspiele bleiben mit alten Fähigkeiten möglich',()=>{
 const p=pair();p.host.links.get(1).features=p.host.links.get(1).features.filter(f=>f!==BONUS_FEATURE);
 assert.throws(()=>p.host.act('options',{bonusFields:true}),/1\.17\.0/);p.host.record.snapshot.bonusFields=true;
 assert.throws(()=>p.host.act('start'),/1\.17\.0/);p.host.act('options',{bonusFields:false});p.host.act('start');p.flush();assert.equal(p.host.snapshot.game.bonuses,undefined);
 const active=pair();active.host.act('options',{bonusFields:true});active.host.act('start');active.flush();active.host.pause(1);active.host.attach(()=>{},1);
 active.host.receive(JSON.stringify(active.guest.envelope('hello',{secret:active.guest.record.secret,name:'Guest',features:['hidden-scores-v1','boards-v1']})),1);
 assert.equal(active.host.links.get(1).authenticated,false);assert.equal(active.host.ready,false);assert.match(active.errors.at(-1),/1\.17\.0/);
});
test('Bonus-Revanchen ziehen neu, behalten die Startwahl und nehmen keine alten Prämien mit',()=>{
 const p=pair();p.host.act('options',{bonusFields:true});p.host.act('start');p.flush();const previousId=p.host.snapshot.game.gameId;
 p.host.record.snapshot.game.bonuses.fields[0].claim={round:1,winners:[0]};p.host.record.snapshot.game.status='finished';p.host.record.snapshot.game.phase='finished';
 p.host.act('rematch');p.flush();assert.equal(p.host.snapshot.bonusFields,true);p.host.act('start');p.flush();
 assert.notEqual(p.host.snapshot.game.gameId,previousId);assert.equal(bonusPoints(p.host.snapshot.game,0),0);assert(p.host.snapshot.game.bonuses.fields.every(f=>f.claim===null&&f.pending.length===0));assert.equal(p.guest.snapshot.game.bonuses.awards.length,0);
});

test('Random-Direktpartie teilt genau einen Plan und behält ihn bei der Wiederverbindung',()=>{
 const p=pair();p.host.act('options',{boardId:'random',bonusFields:true});p.flush();p.host.act('start');p.flush();
 const layout=structuredClone(p.host.snapshot.game.boardLayout);assert(validGameBoard(p.host.snapshot.game));assert.deepEqual(p.guest.snapshot.game.boardLayout,layout);assert.deepEqual(boardFor(p.guest.snapshot.game).cells,boardFor(p.host.snapshot.game).cells);
 const resumed=pair({records:p.saved});assert.deepEqual(resumed.host.snapshot.game.boardLayout,layout);assert.deepEqual(resumed.guest.snapshot.game.boardLayout,layout);
 resumed.host.record.snapshot.game.status='finished';resumed.host.record.snapshot.game.phase='finished';resumed.host.act('rematch');resumed.flush();resumed.host.act('start');resumed.flush();
 assert.equal(resumed.host.snapshot.game.boardId,'random');assert(validGameBoard(resumed.host.snapshot.game));assert.deepEqual(resumed.guest.snapshot.game.boardLayout,resumed.host.snapshot.game.boardLayout);assert.notDeepEqual(resumed.host.snapshot.game.boardLayout,layout);
});
test('Random kann mit alten Gegenstellen weder gewählt noch aus einer früheren Lobby gestartet werden',()=>{
 const p=pair();p.host.links.get(1).features=p.host.links.get(1).features.filter(f=>f!==RANDOM_BOARD_FEATURE);assert.throws(()=>p.host.act('options',{boardId:'random'}),/1\.17\.0/);
 p.host.record.snapshot.boardId='random';assert.throws(()=>p.host.act('start'),/1\.17\.0/);p.host.act('options',{boardId:'classic'});p.host.act('start');p.flush();assert.equal(p.host.snapshot.game.boardId,'classic');
});


test('Direct room names normalize whitespace, allow 48 characters and preserve unnamed legacy records',()=>{
 const record=hostRecord('Host','  Runde  am\n Sofa 🦆  ');assert.equal(record.snapshot.roomName,'Runde am Sofa 🦆');assert(validRecord(record));
 assert.equal(normalizeDirectRoomName('x'.repeat(48)).length,48);assert.throws(()=>normalizeDirectRoomName('x'.repeat(49)),/48/);assert.throws(()=>normalizeDirectRoomName({}),/Namen/);
 delete record.snapshot.roomName;delete record.snapshot.roomNameRevision;assert(validRecord(record));
 const host=new DirectGame(record);host.renameRoom('Legacy-Runde');assert.equal(host.snapshot.roomName,'Legacy-Runde');assert.equal(host.snapshot.version,0);
});
test('Only the direct host renames; name metadata does not change dice, game revisions or turn keys',async()=>{
 const {ownTurnKey}=await import('../public/game/view-state.js');const p=pair();p.host.act('start');p.host.act('roll');p.flush();
 const game=structuredClone(p.host.snapshot.game),revision=p.host.snapshot.version,key=ownTurnKey(game,0);
 assert.throws(()=>p.guest.renameRoom('Nicht erlaubt'),/Nur der Gastgeber/);
 p.host.renameRoom('  Gemeinsame Runde  ');p.flush();assert.equal(p.guest.snapshot.roomName,'Gemeinsame Runde');assert.equal(p.host.snapshot.roomNameRevision,1);
 assert.equal(p.host.snapshot.version,revision);assert.deepEqual(p.host.snapshot.game,game);assert.equal(ownTurnKey(p.host.snapshot.game,0),key);
 const bad=p.guest.envelope('rename',{roomName:'Fremder Name'});p.host.receive(JSON.stringify(bad));p.flush();assert.equal(p.host.snapshot.roomName,'Gemeinsame Runde');
 p.guest.act('rename',{roomName:'Fremder Name'});p.flush();assert.equal(p.host.snapshot.roomName,'Gemeinsame Runde');assert.match(p.errors.pop(),/Unbekannte Spielaktion/);
});
test('A host name update preserves an unacknowledged guest move and does not repeat its round',()=>{
 const p=pair();p.host.act('start');p.host.act('roll');p.host.act('move',{move:{pass:true}});p.flush();
 p.dropHost(true);p.guest.act('move',{move:{pass:true}});p.flush();assert(p.guest.pending);const version=p.host.snapshot.version,game=structuredClone(p.host.snapshot.game);
 p.host.renameRoom('Weitergespielte Runde');assert.equal(p.host.snapshot.version,version);assert.deepEqual(p.host.snapshot.game,game);
 p.dropHost(false);p.link();assert.equal(p.guest.pending,null);assert.equal(p.guest.snapshot.roomName,'Weitergespielte Runde');assert.equal(p.host.snapshot.version,version);assert.deepEqual(p.guest.snapshot,p.host.snapshot);assert.deepEqual(p.host.snapshot.game,game);
});
test('A paused direct session can be named by its original host and retains its name after reconnect',()=>{
 const p=pair();p.host.act('start');p.flush();const game=structuredClone(p.host.snapshot.game),version=p.host.snapshot.version;
 p.host.pause();p.guest.pause();p.host.renameRoom('Pausenrunde');assert.equal(p.host.ready,false);assert(validRecord(p.saved.host));
 const resumed=pair({records:p.saved});assert.equal(resumed.guest.snapshot.roomName,'Pausenrunde');assert.equal(resumed.host.snapshot.version,version);assert.deepEqual(resumed.host.snapshot.game,game);
});
test('Older metadata and malformed names cannot overwrite the current direct name',()=>{
 const p=pair(),old=p.host.state();p.host.renameRoom('Aktueller Name');p.flush();p.guest.receive(JSON.stringify(old));assert.equal(p.guest.snapshot.roomName,'Aktueller Name');
 for(const values of [{roomName:'x'.repeat(49)},{roomName:{}},{roomName:'  unnormalisiert  '},{roomNameRevision:-1},{roomNameRevision:1.5}])assert.equal(validSnapshot({...p.host.snapshot,...values}),false);
 assert.equal(p.host.renameRoom('Aktueller   Name'),false);assert.equal(p.host.snapshot.roomNameRevision,1);
 p.host.renameRoom('');p.flush();assert.equal(p.guest.snapshot.roomName,'');assert.equal(p.guest.snapshot.roomNameRevision,2);
});
test('A failed save does not confirm a direct room name or change the match',()=>{
 const p=pair();p.host.act('start');p.flush();const snapshot=structuredClone(p.host.snapshot);p.host.save=()=>{throw Error('quota');};assert.throws(()=>p.host.renameRoom('Nicht gespeichert'),/nicht gespeichert/);assert.deepEqual(p.host.snapshot,snapshot);
});
