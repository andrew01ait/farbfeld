import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,rollGame,applyMove} from '../public/game/engine.js';
import {DirectGame,hostRecord,guestRecord} from '../public/game/direct-game.js';
import {RoomConnectionState,PRESENCE_TTL,SKIP_DELAY,roomSkipStatus,homeRoomStatus,directPlayerStatus} from '../public/game/room-status.js';
const game=()=>createGame(['Robin','Bea','Alex'],'room',['a','s','x']);
test('Eigener Raumstatus folgt bestätigten Antworten, Fehlern und monotoner Frische; fremde Geräte bleiben bei Ausfall unbestätigt',()=>{
 let now=0;const state=new RoomConnectionState(()=>now);
 assert.equal(state.status('room','a','a'),'unknown');
 state.receive('room',{a:'online',s:'online',x:'offline'});assert.equal(state.status('room','a','a'),'online');assert.equal(state.status('room','s','a'),'online');assert.equal(state.status('room','x','a'),'offline');
 state.fail('room');assert.equal(state.status('room','a','a'),'offline');assert.equal(state.status('room','s','a'),'unknown');assert.equal(state.fresh('room'),false);
 state.receive('room',{s:'online'});assert.equal(state.status('room','a','a'),'online');
 now=PRESENCE_TTL;assert.equal(state.status('room','s','a'),'unknown');assert.equal(state.status('room','a','a'),'unknown');
 state.acknowledge('room');assert.equal(state.status('room','a','a'),'online');assert.equal(state.status('room','s','a'),'unknown');
 state.receive('other',{s:'online'});assert.equal(state.status('room','a','a'),'unknown');state.clear();assert.equal(state.fresh('other'),false);
});
test('Direktstatus verwendet authentifizierte Verbindungen auch bei pausierter Gruppe und fällt beim Trennen ab',()=>{
 const host=new DirectGame(hostRecord('Robin'));
 const guest=new DirectGame(guestRecord({sessionId:host.snapshot.sessionId,hostName:'Robin',secret:host.record.secret},'Bea'));
 assert.equal(directPlayerStatus(host,1),'offline');
 host.attach(raw=>guest.receive(raw),1);guest.attach(raw=>host.receive(raw,1));
 assert.equal(directPlayerStatus(host,1),'online');assert.equal(directPlayerStatus(guest,0),'online');
 host.reserveGuest(2);assert.equal(host.ready,false);assert.equal(directPlayerStatus(host,1),'online');assert.equal(directPlayerStatus(host,2),'offline');
 host.pause(1);guest.pause();assert.equal(directPlayerStatus(host,1),'offline');assert.equal(directPlayerStatus(guest,0),'offline');
});
test('Startkarte erkennt Würfeln und alle eigenen Auswahlgelegenheiten; bestätigter Zug bleibt Warten',()=>{
 let g=game();assert.equal(homeRoomStatus(g,'a').kind,'turn');assert.match(homeRoomStatus(g,'a').text,/würfeln/);assert.match(homeRoomStatus(g,'s').text,/Robin/);
 g=rollGame(g);assert.equal(homeRoomStatus(g,'a').kind,'turn');assert.equal(homeRoomStatus(g,'s').kind,'waiting');
 g=applyMove(g,0,{pass:true});assert.equal(homeRoomStatus(g,'s').kind,'turn');assert.equal(homeRoomStatus(g,'x').kind,'turn');
 g=applyMove(g,1,{pass:true});assert.equal(homeRoomStatus(g,'s').kind,'waiting');assert.match(homeRoomStatus(g,'s').text,/bestätigt/);
 g=applyMove(g,2,{pass:true});assert.equal(homeRoomStatus(g,'s').kind,'turn');assert.match(homeRoomStatus(g,'s').text,/würfeln/);
});
test('Startkarte trennt Lobby, Ende und unbekannte Rolle und verrät auch verdeckt keine Punkte',()=>{
 assert.equal(homeRoomStatus(null,'a').kind,'lobby');let g=game();g.hiddenScores=true;g.players[1].hidden=true;
 assert.equal(homeRoomStatus(g,'missing').kind,'unknown');g.status='finished';g.phase='finished';assert.equal(homeRoomStatus(g,'s').kind,'finished');assert.equal(homeRoomStatus(g,'s').button,'Ergebnis');
});
test('Überspringen öffnet frühestens genau nach 24 Stunden und nur bei laufender Auswahl',()=>{
 const room={game:rollGame(game()),lastActionAt:1000};
 assert.equal(roomSkipStatus(room,1000+SKIP_DELAY-1).canSkip,false);assert.equal(roomSkipStatus(room,1000+SKIP_DELAY).canSkip,true);
 room.lastActionAt+=1;assert.equal(roomSkipStatus(room,1000+SKIP_DELAY).canSkip,false);
 room.game.phase='roll';assert.equal(roomSkipStatus(room,1000+SKIP_DELAY*2).canSkip,false);
 delete room.lastActionAt;assert.equal(roomSkipStatus(room,SKIP_DELAY*10).skipAvailableAt,null);
 room.game.status='finished';assert.equal(roomSkipStatus(room,SKIP_DELAY*10).canSkip,false);
});
test('Akkusparende Abrufe pausieren vollständig im Hintergrund, ohne Netz und außerhalb von Raum/Startseite',async()=>{
 const {roomPollDelay}=await import('../public/game/room-status.js');const g=game();
 for(const options of [{visible:false},{online:false},{busy:true},{screen:'game'},{screen:'direct'}])assert.equal(roomPollDelay({screen:'room',game:g,...options}),null);
 assert.equal(roomPollDelay({screen:'home',game:null}),null);assert.equal(roomPollDelay({screen:'home',game:{...g,status:'finished'}}),null);
 assert.equal(roomPollDelay({screen:'home',game:g}),60000);assert.equal(roomPollDelay({screen:'home',game:g,failures:1}),60000);assert.equal(roomPollDelay({screen:'home',game:null,failures:1}),null);assert.equal(roomPollDelay({screen:'room',game:g,playerId:'a'}),30000);
 assert.equal(roomPollDelay({screen:'room',game:g,playerId:'s'}),6000);assert.equal(roomPollDelay({screen:'room',game:g,playerId:'s',idleFor:30000}),15000);assert.equal(roomPollDelay({screen:'room',game:g,playerId:'s',idleFor:120000}),30000);assert.equal(roomPollDelay({screen:'room',game:g,playerId:'s',idleFor:600000}),60000);
 assert.equal(roomPollDelay({screen:'room',failures:1}),30000);assert.equal(roomPollDelay({screen:'room',failures:4}),120000);
});
test('Wiederholtes Rendern erzeugt nur einen Timer und verschiebt die vorhandene Rückmeldung nicht; Hintergrund stoppt ihn',async()=>{
 const {RoomPollScheduler}=await import('../public/game/room-status.js');let now=0,hidden=false,calls=0,nextId=0;const timers=new Map();
 const scheduler=new RoomPollScheduler({now:()=>now,delay:()=>hidden?null:60000,run:async()=>{calls++;},setTimer:(fn,delay)=>{const id=++nextId;timers.set(id,{fn,at:now+delay});return id;},clearTimer:id=>timers.delete(id)});
 for(let i=0;i<100;i++){now+=10;scheduler.refresh();}assert.equal(timers.size,1);assert.equal(scheduler.due,60010);assert.equal(calls,0);
 hidden=true;scheduler.refresh();assert.equal(timers.size,0);now+=3600000;assert.equal(calls,0);
 hidden=false;scheduler.refresh(true);const [id,task]=[...timers][0];timers.delete(id);await task.fn();assert.equal(calls,1);assert.equal(timers.size,1);assert.equal(scheduler.due,now+60000);scheduler.stop();assert.equal(timers.size,0);
});
test('Standardtimer behalten den Browser-Window-Empfänger statt mit dem Scheduler als this aufzurufen',async t=>{
 const {RoomPollScheduler}=await import('../public/game/room-status.js');let set=0,cleared=0;
 t.mock.method(globalThis,'setTimeout',function(){assert.equal(this,globalThis);set++;return 99;});
 t.mock.method(globalThis,'clearTimeout',function(id){assert.equal(this,globalThis);assert.equal(id,99);cleared++;});
 const scheduler=new RoomPollScheduler({run:async()=>{},delay:()=>60000,now:()=>0});scheduler.refresh();scheduler.refresh();assert.equal(set,1);scheduler.stop();assert.equal(cleared,1);
});
