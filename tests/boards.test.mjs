import test from 'node:test';
import assert from 'node:assert/strict';
import {BOARDS,CLASSIC,boardFor,validBoardId} from '../public/game/boards.js';
import {BOARD,STARS,COLORS,neighbors,createGame,rollGame,applyMove,findMove,validateCells,score,finishRound} from '../public/game/engine.js';
import {moveFeedback} from '../public/game/view-state.js';
function components(board,color){
 const seen=new Set(),sizes=[];
 board.forEach((value,start)=>{if(value!==color||seen.has(start))return;const todo=[start];seen.add(start);let size=0;while(todo.length){const i=todo.pop();size++;for(const next of neighbors(i))if(board[next]===color&&!seen.has(next)){seen.add(next);todo.push(next);}}sizes.push(size);});
 return sizes.sort((a,b)=>a-b);
}
test('Classic bleibt unverändert; neue Bretter haben dieselben Farbgruppen, Stern- und Flächenanteile',()=>{
 assert.equal(BOARDS.length,3);assert.deepEqual(CLASSIC.cells,BOARD);assert.deepEqual(CLASSIC.stars,STARS);
 assert.equal(CLASSIC.rows.join('/'),'gggyyyygbbboyyy/ogygyyoopbboogg/bgpggggpppyyogg/bppgoobbggyyopb/poooopbbooopppp/pbbppppyyopbbbo/yybbbbpyyygggoo');
 assert.deepEqual(CLASSIC.stars,[7,11,17,19,24,30,36,50,58,76,78,83,85,89,102]);
 for(const board of BOARDS){
  assert.equal(board.rows.length,7);assert(board.rows.every(row=>row.length===15));assert.equal(board.cells.length,105);
  assert.equal(new Set(board.stars).size,15);assert.equal(new Set(board.stars.map(i=>i%15)).size,15);
  assert.equal(new Set(board.cells.filter((_,i)=>i%15===7)).size,5);
  for(const color of COLORS){assert.equal(board.cells.filter(c=>c===color).length,21);assert.equal(board.stars.filter(i=>board.cells[i]===color).length,3);assert.deepEqual(components(board.cells,color),[1,2,3,4,5,6]);}
 }
 assert.equal(new Set(BOARDS.map(board=>board.cells.join(''))).size,3);
});
test('Alte Spielstände bleiben Classic; unbekannte Bretter werden beim Erstellen abgewiesen',()=>{
 assert.equal(boardFor({}).id,'classic');assert.equal(validBoardId(undefined),true);
 assert.equal(boardFor(JSON.parse(JSON.stringify(createGame(['A'])))).id,'classic');
 assert.throws(()=>createGame(['A'],'solo',[],{boardId:'unknown'}),/Spielbrett/);
});
test('Farbprüfung, Zughinweis und Sternwertung verwenden das gewählte Brett',()=>{
 for(const board of BOARDS.slice(1)){
  const g=createGame(['A'],'solo',[],{boardId:board.id});g.phase='choose';g.dice={colors:['*','*'],numbers:['?','?']};
  const index=Array.from({length:7},(_,r)=>r*15+7).find(i=>board.cells[i]!==BOARD[i]);
  assert.notEqual(index,undefined);const color=board.cells[index],move={ci:0,ni:0,color,count:1,cells:[index]};
  assert.equal(validateCells(g.players[0],move.cells,color,1,false,g),null);assert.notEqual(validateCells(g.players[0],move.cells,BOARD[index],1,false,g),null);
  assert.equal(moveFeedback(g,0,move,move.cells).valid,true);const next=applyMove(g,0,move);assert.equal(next.log[0].color,color);
  const star=board.stars.find(i=>!STARS.includes(i));g.players[0].marks[star]=true;assert.equal(score(g.players[0],g).stars,14);assert.equal(score(g.players[0]).stars,15);
 }
});
test('Neue Bretter laufen vollständig solo und mit sechs Personen; Farbboni und Ende werden korrekt gewertet',()=>{
 for(const board of BOARDS.slice(1))for(const mode of ['solo','room']){
  let seed=777,moves=0,g=createGame(mode==='solo'?['A']:['A','B','C','D','E','F'],mode,[],{boardId:board.id});const rng=max=>{seed=(seed*1664525+1013904223)>>>0;return seed%max;};
  while(g.status==='playing'&&moves<2200){g=rollGame(g,rng);const active=g.active;for(const pid of [active,...g.players.map((_,i)=>i).filter(i=>i!==active)]){const move=findMove(g,pid)||{pass:true};g=applyMove(g,pid,move);moves++;assert.equal(g.boardId,board.id);}}
  assert.equal(g.status,'finished');assert.equal(mode==='solo'?g.round:0,mode==='solo'?30:0);
  if(mode!=='solo')assert(g.players.some(p=>Object.values(p.colors).filter(v=>v!==null).length===2));
  assert.equal(boardFor(JSON.parse(JSON.stringify(g))).id,board.id);
 }
 for(const board of BOARDS.slice(1)){const g=createGame(['A','B'],'room',[],{boardId:board.id});board.cells.forEach((c,i)=>{if(c==='g')g.players[0].marks[i]=true;});finishRound(g);assert.equal(g.players[0].colors.g,5);board.cells.forEach((c,i)=>{if(c==='g')g.players[1].marks[i]=true;});finishRound(g);assert.equal(g.players[1].colors.g,3);}
});
