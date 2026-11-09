import test from 'node:test';
import assert from 'node:assert/strict';
import {BOARD,COLORS,createGame,rollGame,applyMove,availableDice,canAct,findMove,rankings} from '../public/game/engine.js';
import {HUMAN,COMPUTER,createComputerGame,needsComputerTurn,stepComputer} from '../public/game/computer.js';
import {turnDescription,playerRole,mayInspect} from '../public/game/view-state.js';

function choosing(round=1,active=0){
 const game=createComputerGame();game.round=round;game.active=active;game.phase='choose';
 game.dice={colors:['g','b','o'],numbers:[1,3,2]};return game;
}
test('Computerpartie: zwei eigene Blätter, Mensch beginnt und drei gemeinsame Würfel',()=>{
 let game=createComputerGame();assert.equal(game.mode,'computer');assert.deepEqual(game.players.map(p=>p.name),['Du','Computer']);
 assert.equal(game.active,HUMAN);assert.equal(needsComputerTurn(game),false);assert.equal(stepComputer(game),game);
 game=rollGame(game,()=>0);assert.equal(game.dice.colors.length,3);assert.equal(game.dice.numbers.length,3);
 assert.equal(needsComputerTurn(game),false);assert.equal(mayInspect(game,COMPUTER,HUMAN),true);
 assert.match(turnDescription(game,HUMAN).title,/Du bist am Zug/);
});
test('Computer wartet, zieht einmal und würfelt danach selbständig als aktive Person',()=>{
 let game=choosing();const before=JSON.stringify(game);assert.equal(stepComputer(game),game);assert.equal(JSON.stringify(game),before);
 game=applyMove(game,HUMAN,{ci:0,ni:0,cells:[7]});assert(needsComputerTurn(game));
 assert.equal(playerRole(game,HUMAN),'Fertig ✓');assert.deepEqual(turnDescription(game,HUMAN).indices,[COMPUTER]);
 const pending=game;game=stepComputer(game);assert.equal(pending.players[COMPUTER].marks.filter(Boolean).length,0);
 assert.equal(game.round,2);assert.equal(game.active,COMPUTER);assert.equal(game.phase,'roll');
 const rolled=stepComputer(game,()=>0);assert.equal(rolled.phase,'choose');assert.equal(rolled.turn,game.turn+1);
 const moved=stepComputer(rolled);assert.deepEqual(moved.submitted,[COMPUTER]);assert(canAct(moved,HUMAN));
 assert.equal(needsComputerTurn(moved),false);assert.equal(stepComputer(moved),moved);
 assert.match(turnDescription(moved,HUMAN).title,/Du bist am Zug/);
});
test('Ab Wurf vier verwendet der Computer nur das übrige Würfelpaar',()=>{
 let game=applyMove(choosing(4),HUMAN,{ci:0,ni:0,cells:[7]});
 assert.equal(availableDice(game,COMPUTER).colors.length,2);
 game=stepComputer(game);assert.equal(game.log.at(-1).player,'Computer');assert.notEqual(game.log.at(-1).color,'g');
 const active=stepComputer(choosing(4,COMPUTER));assert(active.chosen);
 const remaining=availableDice(active,HUMAN);
 assert(!remaining.colors.some(d=>d.index===active.chosen.ci));assert(!remaining.numbers.some(d=>d.index===active.chosen.ni));
});
test('Ohne gültigen Platz passt der Computer und verbraucht keine Joker',()=>{
 let game=choosing(4,COMPUTER);game.dice={colors:['g','g','g'],numbers:[5,5,5]};
 assert.equal(findMove(game,COMPUTER),null);const next=stepComputer(game);
 assert.equal(next.players[COMPUTER].jokers,8);assert.equal(next.players[COMPUTER].passes,1);
 assert.equal(next.chosen,null);assert.equal(availableDice(next,HUMAN).colors.length,3);
});
test('Computer erhält Farb-Erstboni gleichzeitig oder die späteren drei Punkte',()=>{
 let game=choosing();game.dice={colors:['g','g','g'],numbers:[1,1,1]};
 for(const player of game.players)BOARD.forEach((color,i)=>{if(color==='g'&&i!==7)player.marks[i]=true;});
 game=applyMove(game,HUMAN,{ci:0,ni:0,cells:[7]});assert.equal(game.players[HUMAN].colors.g,null);
 game=stepComputer(game);assert.equal(game.players[HUMAN].colors.g,5);assert.equal(game.players[COMPUTER].colors.g,5);
 let later=choosing(8,COMPUTER);later.colorClaims.g=3;later.dice={colors:['g','g','g'],numbers:[1,1,1]};
 BOARD.forEach((color,i)=>{if(color==='g'&&i!==7)later.players[COMPUTER].marks[i]=true;});
 later=stepComputer(later);later=applyMove(later,HUMAN,{pass:true});assert.equal(later.players[COMPUTER].colors.g,3);
});
test('Zweite vollständige Farbe beendet erst den gemeinsamen Wurf; danach spielt der Computer nicht weiter',()=>{
 let game=choosing(45,COMPUTER);game.dice={colors:['g','g','g'],numbers:[1,1,1]};
 const bot=game.players[COMPUTER];bot.colors.b=5;
 BOARD.forEach((color,i)=>{if(color==='b'||color==='g'&&i!==7)bot.marks[i]=true;});
 game=stepComputer(game);assert.equal(game.status,'playing');assert(canAct(game,HUMAN));
 game=applyMove(game,HUMAN,{pass:true});assert.equal(game.status,'finished');assert.equal(game.players[COMPUTER].colors.g,5);
 assert.equal(needsComputerTurn(game),false);assert.equal(stepComputer(game),game);
 assert.equal(rankings(game).length,2);
});
test('Gespeicherter Zwischenstand setzt Würfeln oder Zug ohne Wiederholung fort; andere Modi unverändert',()=>{
 let game=choosing(4,COMPUTER);const stored=JSON.parse(JSON.stringify(game));
 const next=stepComputer(stored);const restored=JSON.parse(JSON.stringify(next));
 assert.equal(stepComputer(restored),restored);assert.equal(restored.players[COMPUTER].marks.filter(Boolean).length,next.log.at(-1).count);
 for(const mode of ['solo','local','room','direct']){const other=createGame(['A','B'],mode);assert.equal(needsComputerTurn(other),false);assert.equal(stepComputer(other),other);}
});
test('Zwanzig vollständige Computerpartien enden regulär mit legalen Zügen und gültiger Wertung',()=>{
 for(let seed=1;seed<=20;seed++){
  let state=seed,game=createComputerGame(),steps=0;
  const rng=max=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state%max;};
  while(game.status==='playing'&&steps++<1200){
   if(needsComputerTurn(game))game=stepComputer(game,rng);
   else if(game.phase==='roll')game=rollGame(game,rng);
   else {assert(canAct(game,HUMAN));game=applyMove(game,HUMAN,findMove(game,HUMAN)??{pass:true});}
   assert(game.players.every(player=>player.jokers>=0));
  }
  assert.equal(game.status,'finished','seed '+seed);assert(game.players.some(p=>COLORS.filter(c=>p.colors[c]!==null).length>=2));
  assert(rankings(game).every(player=>Number.isFinite(player.total)));
 }
});
