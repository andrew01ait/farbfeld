import test from 'node:test';
import assert from 'node:assert/strict';
import {BOARD_CHOICES,BOARDS,generateRandomBoard,validRandomBoard,validGameBoard,boardFor} from '../public/game/boards.js';
import {createGame,rollGame,applyMove,findMove,score,neighbors,canAct,validMineState,validBonusState} from '../public/game/engine.js';
import {createComputerGame,needsComputerTurn,stepComputer} from '../public/game/computer.js';
import {projectGame} from '../public/game/game-info.js';
const rngFor=seed=>max=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return Math.floor(seed/4294967296*max);};
test('Random generates fresh balanced layouts with the original colour/group/star/start-column constraints',()=>{
 assert.equal(BOARDS.length,3);assert.equal(BOARD_CHOICES.length,4);const distinct=new Set();
 for(let seed=1;seed<=20;seed++){
  const layout=generateRandomBoard(rngFor(seed));assert(validRandomBoard(layout));distinct.add(JSON.stringify(layout));
  const board=boardFor({boardId:'random',boardLayout:layout});assert.equal(board.cells.length,105);assert.equal(new Set(board.stars.map(i=>i%15)).size,15);assert.equal(new Set(board.cells.filter((_,i)=>i%15===7)).size,5);
  for(const color of ['g','y','b','p','o']){
   assert.equal(board.cells.filter(c=>c===color).length,21);assert.equal(board.stars.filter(i=>board.cells[i]===color).length,3);
   const seen=new Set(),sizes=[];for(let i=0;i<105;i++)if(board.cells[i]===color&&!seen.has(i)){const queue=[i];seen.add(i);let size=0;while(queue.length){const j=queue.pop();size++;for(const k of neighbors(j))if(board.cells[k]===color&&!seen.has(k)){seen.add(k);queue.push(k);}}sizes.push(size);}assert.deepEqual(sizes.sort((a,b)=>a-b),[1,2,3,4,5,6]);
  }
 }
 assert.equal(distinct.size,20);assert.deepEqual(generateRandomBoard(rngFor(99)),generateRandomBoard(rngFor(99)));
});
test('Generation remains bounded for degenerate randomness and rejects invalid RNG results',()=>{
 let calls=0;const layout=generateRandomBoard(()=>{calls++;return 0;});assert(validRandomBoard(layout));assert(calls<2500);
 assert.throws(()=>generateRandomBoard(()=>-1));assert.throws(()=>generateRandomBoard(max=>max));
});
test('A generated game persists one immutable printed plan across turns, clones and all player projections',()=>{
 let g=createGame(['A','B','C','D','E','F'],'room',[],{boardId:'random',hiddenScores:true,bonusFields:true});const layout=structuredClone(g.boardLayout),before=JSON.stringify(g);
 for(let pid=0;pid<6;pid++){const view=projectGame(g,pid);assert.deepEqual(view.boardLayout,layout);assert.equal(view.bonuses.fields,undefined);assert.equal(boardFor(view).id,'random');}assert.equal(JSON.stringify(g),before);
 g=rollGame(g,rngFor(3));for(let pid=0;pid<6;pid++)g=applyMove(g,pid,findMove(g,pid)??{pass:true});assert.deepEqual(g.boardLayout,layout);assert(validGameBoard(JSON.parse(JSON.stringify(g))));
 const printed=boardFor(g);assert(Object.isFrozen(printed.cells));assert.equal(boardFor(g),printed);
});
test('Missing, mutated or malformed random plans are rejected rather than becoming Classic',()=>{
 const g=createGame(['A'],'solo',[],{boardId:'random'});assert(validGameBoard(g));boardFor(g);
 for(const mutate of [x=>delete x.boardLayout,x=>x.boardLayout.rows.pop(),x=>x.boardLayout.rows[0]='x'.repeat(15),x=>x.boardLayout.stars[0]=105,x=>x.boardLayout.stars[0]=x.boardLayout.stars[1]]){const bad=structuredClone(g);mutate(bad);assert(!validGameBoard(bad));assert.throws(()=>boardFor(bad));}
 g.boardLayout.rows[0]='g'.repeat(15);assert(!validGameBoard(g));assert.throws(()=>boardFor(g));assert.equal(boardFor({}).id,'classic');
});
test('Random games finish normally in solo and six-player modes with permanent bonus awards',()=>{
 for(const mode of ['solo','local','room','direct']){
  let g=createGame(mode==='solo'?['A']:['A','B','C','D','E','F'],mode,[],{boardId:'random',bonusFields:true}),moves=0;const rng=rngFor(812),layout=structuredClone(g.boardLayout);
  while(g.status==='playing'&&moves<2400){g=rollGame(g,rng);const active=g.active;for(const pid of [active,...g.players.map((_,i)=>i).filter(i=>i!==active)]){g=applyMove(g,pid,findMove(g,pid)??{pass:true});moves++;}}
  assert.equal(g.status,'finished',mode);assert.deepEqual(g.boardLayout,layout);assert(validBonusState(g));g.players.forEach(p=>assert(Number.isFinite(score(p,g).total)));
 }
});
test('All computer strengths play Random with mines and bonus fields using the same saved board',()=>{
 for(const level of ['easy','medium','hard'])for(const hidden of [false,true]){
  let g=createComputerGame(hidden,'random',level,true,true),steps=0;const rng=rngFor(192),layout=JSON.stringify(g.boardLayout);
  while(g.status==='playing'&&steps++<1400){if(needsComputerTurn(g))g=stepComputer(g,rng);else if(g.phase==='roll')g=rollGame(g,rng);else{assert(canAct(g,0));g=applyMove(g,0,findMove(g,0)??{pass:true});}}
  assert.equal(g.status,'finished',level);assert.equal(JSON.stringify(g.boardLayout),layout);assert(validMineState(g));assert(validBonusState(g));
 }
});
