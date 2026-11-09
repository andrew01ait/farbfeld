import test from 'node:test';
import assert from 'node:assert/strict';
import {BOARDS} from '../public/game/boards.js';
import {BOARD,COLORS,createGame,rollGame,applyMove,findMove,canAct,resolveChoice,validateCells,score} from '../public/game/engine.js';
import {COMPUTER_LEVELS,computerDifficulty,computerLevel,validComputerDifficulty,changeComputerDifficulty,createComputerGame,chooseComputerMove,needsComputerTurn,stepComputer} from '../public/game/computer.js';

function choosing(difficulty='medium',hiddenScores=false){
 const game=createComputerGame(hiddenScores,'classic',difficulty);game.gameId='difficulty-fixture';game.phase='choose';game.active=1;game.round=4;
 game.dice={colors:['g','b','p'],numbers:[1,4,3]};return game;
}

test('Neue Computerpartien bieten drei Stärken, Mittel als Vorgabe; alte Spielstände behalten Leicht',()=>{
 assert.deepEqual(COMPUTER_LEVELS.map(level=>level.id),['easy','medium','hard']);
 assert.equal(computerDifficulty(createComputerGame()),'medium');
 for(const {id,label} of COMPUTER_LEVELS){const restored=JSON.parse(JSON.stringify(createComputerGame(true,'mosaic',id)));assert.equal(computerDifficulty(restored),id);assert.equal(computerLevel(restored).label,label);assert.equal(restored.boardId,'mosaic');assert(restored.hiddenScores);}
 const legacy=choosing('easy');delete legacy.computerDifficulty;
 assert.equal(computerDifficulty(legacy),'easy');assert.deepEqual(chooseComputerMove(legacy),findMove(legacy,1));
 assert(!validComputerDifficulty('expert'));assert.throws(()=>createComputerGame(false,'classic','expert'),/Leicht/);
});

test('Stärkewechsel erhält Würfel, Zug, bestätigte Kreuze und Schema-1-Exportstand',()=>{
 const game=choosing('easy'),before=JSON.stringify(game),next=changeComputerDifficulty(game,'hard');
 assert.equal(JSON.stringify(game),before);assert.notEqual(next,game);assert.equal(next.players,game.players);assert.equal(next.dice,game.dice);assert.equal(next.turn,game.turn);assert.equal(next.round,game.round);assert.equal(next.gameId,game.gameId);
 assert.equal(computerDifficulty(JSON.parse(JSON.stringify(next))),'hard');assert.equal(next.schema,1);
 assert.throws(()=>changeComputerDifficulty(game,'expert'),/Leicht/);
 assert.throws(()=>changeComputerDifficulty(createGame(['A'],'solo'),'hard'),/Computerpartie/);
});

test('Jede Stärke teilt exakt denselben Wurf und verwendet beim Entscheiden keine Zufallszahlen',()=>{
 const results=[];
 for(const {id} of COMPUTER_LEVELS){
  const game=createComputerGame(false,'classic',id);game.active=1;let calls=0;
  const rolled=stepComputer(game,max=>calls++%max);assert.equal(calls,6);results.push(rolled.dice);
  assert.doesNotThrow(()=>stepComputer(rolled,()=>{throw Error('future roll peek');}));
 }
 assert.deepEqual(results[0],results[1]);assert.deepEqual(results[1],results[2]);
});

test('Schwer verwendet in verdeckten Partien weder gegnerische Felder noch Joker oder Punkte',()=>{
 const game=choosing('hard',true),other=structuredClone(game),before=JSON.stringify(game);
 other.players[0].marks.fill(true);other.players[0].jokers=0;other.players[0].columns.fill(5);for(const color of COLORS)other.players[0].colors[color]=5;
 assert.deepEqual(chooseComputerMove(other),chooseComputerMove(game));assert.equal(JSON.stringify(game),before);
});

test('Schwer nimmt einen sicheren Sieg durch die zweite Farbe statt bloß mehr Felder anzukreuzen',()=>{
 const game=choosing('hard'),player=game.players[1];player.colors.b=5;
 BOARD.forEach((color,i)=>{if(color==='b'||color==='g'&&i!==7)player.marks[i]=true;});
 const move=chooseComputerMove(game);assert.equal(move.color,'g');assert.deepEqual(move.cells,[7]);
 let next=applyMove(game,1,move);next=applyMove(next,0,{pass:true});assert.equal(next.status,'finished');assert(score(next.players[1],next).total>score(next.players[0],next).total);
});

test('Leicht bleibt identisch zum bisherigen Hinweisalgorithmus; Mittel und Schwer halten Regeln und Jokerbudget ein',()=>{
 for(const board of BOARDS)for(const {id} of COMPUTER_LEVELS){
  const game=choosing(id);game.boardId=board.id;game.dice={colors:['*','b','p'],numbers:['?',4,3]};
  for(const jokers of [0,1,8]){
   game.players[1].jokers=jokers;const before=JSON.stringify(game),move=chooseComputerMove(game);
   if(id==='easy')assert.deepEqual(move,findMove(game,1));
   if(move){const choice=resolveChoice(game,1,move);assert(!choice.error);assert(choice.cost<=jokers);assert.equal(validateCells(game.players[1],move.cells,choice.color,choice.count,false,game),null);}
   assert.equal(JSON.stringify(game),before);
  }
 }
});

test('Alle Stärken spielen jedes Brett bis zum echten Spielende mit legalen Zügen',()=>{
 for(const board of BOARDS)for(const {id} of COMPUTER_LEVELS)for(let seed=1;seed<=3;seed++){
  let state=seed,game=createComputerGame(false,board.id,id),steps=0;
  const rng=max=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return Math.floor(state/4294967296*max);};
  while(game.status==='playing'&&steps++<1200){
   if(needsComputerTurn(game))game=stepComputer(game,rng);
   else if(game.phase==='roll')game=rollGame(game,rng);
   else{assert(canAct(game,0));game=applyMove(game,0,findMove(game,0)??{pass:true});}
   assert(game.players.every(p=>p.jokers>=0&&p.jokers<=8));
  }
  assert.equal(game.status,'finished',id+'/'+board.id+'/'+seed);assert(game.players.some(p=>COLORS.filter(c=>p.colors[c]!==null).length>=2));
 }
});
