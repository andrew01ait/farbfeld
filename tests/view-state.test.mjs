import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,rollGame,applyMove} from '../public/game/engine.js';
import {nextLocalPlayer,turnOrder,mayInspect,playerRole,turnDescription,ownTurnKey} from '../public/game/view-state.js';
import {boardLayout,pinchScale,clampZoom} from '../public/game/board-view.js';

test('Lokales Spiel: andere Namen übertragen niemals die Kontrolle',()=>{
 const game=createGame(['Robin','Bea'],'local');
 assert.equal(nextLocalPlayer(game),0);
 assert.equal(mayInspect(game,1,0),false);
 assert.equal(mayInspect(game,0,0),true);
 assert.equal(playerRole(game,0),'Würfelt');assert.equal(playerRole(game,1),'Wartet');
 assert.match(turnDescription(game,0).title,/Robin würfelt/);
});
test('Nach dem aktiven Zug wird die nächste tatsächliche Person hervorgehoben',()=>{
 let game=rollGame(createGame(['Robin','Bea'],'local'),()=>0);
 assert.equal(playerRole(game,0),'Wählt zuerst');
 game=applyMove(game,0,{pass:true});
 assert.equal(nextLocalPlayer(game),1);assert.equal(playerRole(game,0),'Fertig ✓');
 assert.equal(playerRole(game,1),'Am Zug');assert.match(turnDescription(game,1).title,/Bea ist am Zug/);
 game=applyMove(game,1,{pass:true});
 assert.equal(game.round,2);assert.equal(nextLocalPlayer(game),1);
 assert.equal(playerRole(game,0),'Wartet');assert.equal(playerRole(game,1),'Würfelt');
});
test('Ab einer anderen Startperson bleibt die lokale Weitergabe im Uhrzeigersinn',()=>{
 let game=createGame(['A','B','C','D'],'local');game.active=2;
 assert.deepEqual(turnOrder(game),[2,3,0,1]);game=rollGame(game,()=>0);game=applyMove(game,2,{pass:true});
 assert.equal(nextLocalPlayer(game),3);assert.equal(playerRole(game,0),'Wartet');
});
test('Im Raum darf man fremde Felder ansehen, nach Spielende auch lokal',()=>{
 const room=createGame(['A','B'],'room');assert.equal(mayInspect(room,1,0),true);
 const local=createGame(['A','B'],'local');local.status='finished';assert.equal(mayInspect(local,1,0),true);
});
test('Raumanzeige benennt alle wartenden Züge und den eigenen bestätigten Zug',()=>{
 let game=rollGame(createGame(['A','B','C'],'room'),()=>0);game=applyMove(game,0,{pass:true});
 assert.equal(turnDescription(game,0).title,'Dein Zug ist gespeichert');
 assert.deepEqual(turnDescription(game,1).indices,[1,2]);
 assert.equal(playerRole(game,1),'Am Zug');assert.equal(playerRole(game,2),'Am Zug');
});
test('Querformat nutzt die gesamte Breite und hält alle sieben Zeilen sichtbar',()=>{
 for(const [width,available]of[[593,230],[507,240],[900,340],[300,160]]){
  const layout=boardLayout(width,available,true);
  assert.equal(layout.width,width);
  assert(layout.height<=available+.01);
  assert(layout.cellHeight<=layout.cellWidth);
  assert(layout.cellHeight>0);
 }
 assert.equal(boardLayout(340,400,false).width,638);
});
test('Nach Wegscrollen des Kopfbereichs werden die Felder bei gleicher Breite größer',()=>{
 const headerVisible=boardLayout(593,210,true);
 const headerHidden=boardLayout(593,310,true);
 assert.equal(headerHidden.width,headerVisible.width);
 assert(headerHidden.cellHeight>headerVisible.cellHeight*1.5);
 assert.equal(headerHidden.height,310);
});
test('Sehr niedrige Querformat-Ansicht staucht Felder nicht zu schmalen Streifen',()=>{
 const minimum={minCellHeight:20,minCellRatio:2/3};
 const layout=boardLayout(493,99,true,minimum);
 assert.equal(layout.width,493);assert(layout.cellHeight>=20);
 assert(layout.cellHeight>=layout.cellWidth*2/3);
 assert(layout.height>99,'bei zu wenig Platz vertikal scrollen statt Felder zerquetschen');
 const narrow=boardLayout(250,40,true,minimum);assert.equal(narrow.cellHeight,narrow.cellWidth);
 assert(boardLayout(493,99,true).height<=99,'andere Spielmodi behalten die bisherige Einpassung');
});
test('Pinch vergrößert/verkleinert proportional und bleibt in Grenzen',()=>{
 assert.equal(pinchScale(1,100,150),1.5);assert.equal(pinchScale(1.5,150,75),.75);
 assert.equal(clampZoom(100),2.6);assert.equal(clampZoom(.01),.3);
});

test('Parallel bestätigte fremde Züge erhalten die eigene unbestätigte Auswahl',()=>{
 let game=rollGame(createGame(['A','B','C','D','E','F'],'direct'),()=>0);game.gameId='group';
 game=applyMove(game,0,{pass:true});const key=ownTurnKey(game,5);
 for(let pid=1;pid<5;pid++){game=applyMove(game,pid,{pass:true});assert.equal(ownTurnKey(game,5),key);}
 game=applyMove(game,5,{pass:true});assert.notEqual(ownTurnKey(game,5),key);
 assert.equal(game.round,2);assert.equal(playerRole(game,1),'Würfelt');
});
