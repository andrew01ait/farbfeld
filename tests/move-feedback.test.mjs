import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,rollGame,findMove,applyMove,validateCells,resolveChoice} from '../public/game/engine.js';
import {moveFeedback} from '../public/game/view-state.js';
function game(colors=['b','g'],numbers=[1,3],jokers=8){
 const g=createGame(['A'],'solo');g.phase='choose';g.dice={colors,numbers};g.players[0].jokers=jokers;return g;
}
const blue3={ci:0,ni:1};
test('Würfelauswahl und verbleibende Felder werden als nächste Schritte erklärt',()=>{
 const g=game();assert.equal(moveFeedback(g,0,{}).code,'dice');
 const empty=moveFeedback(g,0,blue3,[]);assert.equal(empty.code,'select');assert.equal(empty.valid,false);
 const partial=moveFeedback(g,0,blue3,[52]);assert.equal(partial.code,'more');assert.match(partial.title,/2/);
});
test('Ein gültiger vollständiger Zug wird freigegeben und vom Regelwerk angenommen',()=>{
 const g=game(),cells=[51,52,67],result=moveFeedback(g,0,blue3,cells);
 assert.equal(result.code,'ready');assert.equal(result.valid,true);assert.equal(result.invalid,false);
 const next=applyMove(g,0,{...blue3,cells});assert.equal(next.round,2);assert.equal(moveFeedback(next,0,{}),null);
});
test('Fehlender Anschluss und getrennte vollständige Auswahl erhalten konkrete Fehler',()=>{
 const g=game();
 const anchor=moveFeedback(g,0,blue3,[8,9,10]);assert.equal(anchor.code,'anchor');assert.equal(anchor.invalid,true);assert.match(anchor.detail,/H/);
 const split=moveFeedback(g,0,blue3,[51,52,8]);assert.equal(split.code,'disconnected');assert.equal(split.invalid,true);
 const count=moveFeedback(g,0,blue3,[51,52,66,67]);assert.equal(count.code,'count');assert.equal(count.valid,false);
});
test('Eine noch überbrückbare diagonale Teilauswahl wird nicht als unmöglich markiert',()=>{
 const g=game(),result=moveFeedback(g,0,blue3,[51,67]);
 assert.equal(result.code,'complete_connection');assert.equal(result.invalid,false);
 const extended=findMove(g,0,{ci:0,ni:1,color:'b',count:3,cells:[51,67]});
 assert(extended&&extended.cells.includes(51)&&extended.cells.includes(67));
 assert.equal(validateCells(g.players[0],extended.cells,'b',3),null);
});
test('Nicht ergänzbare Teilauswahl und unmögliche Würfelkombination werden unterschieden',()=>{
 const g=game();
 assert.equal(moveFeedback(g,0,blue3,[8]).code,'extend');
 const impossible=moveFeedback(g,0,{ci:1,ni:1},[]);
 assert.equal(impossible.code,'combination');assert.equal(impossible.noMove,false);
 assert.equal(impossible.valid,false);assert.equal(impossible.invalid,false);
});
test('Ein vollständig unmöglicher Wurf empfiehlt Passen ohne Jokerkosten',()=>{
 const g=game(['g','g'],[5,5]);const result=moveFeedback(g,0,{},[]);
 assert.equal(result.code,'no_move');assert.equal(result.noMove,true);assert.equal(result.valid,false);
 assert.match(result.detail,/Passen/);
 const next=applyMove(g,0,{pass:true});assert.equal(next.players[0].jokers,g.players[0].jokers);
});
test('Joker-Auswahl und fehlende Joker werden sofort erklärt',()=>{
 const g=game(['*','b'],['?',1],1);
 const missing=moveFeedback(g,0,{ci:0,ni:1},[]);assert.equal(missing.code,'joker_choice');
 const tooMany=moveFeedback(g,0,{ci:0,ni:0,color:'b',count:3},[]);
 assert.equal(tooMany.code,'jokers');assert.match(tooMany.detail,/2 Joker/);assert.match(tooMany.detail,/noch 1/);
});
test('Jokerprüfung berücksichtigt gewählte Farbe, Zahl und bereits ausgewählte Felder',()=>{
 const g=game(['*','b'],['?',1]);
 const move=findMove(g,0,{ci:0,ni:0,color:'b',count:3,cells:[51,67]});assert(move);
 const choice=resolveChoice(g,0,move);assert.equal(choice.color,'b');assert.equal(choice.count,3);
 assert.equal(findMove(g,0,{ci:0,ni:0,color:'g',count:3}),null);
 assert.equal(moveFeedback(g,0,{ci:0,ni:0,color:'g',count:3},[]).code,'combination');
});
test('Wartezeit und herausgenommene Würfel führen nicht zu falschen Kein-Zug-Hinweisen',()=>{
 let g=createGame(['A','B'],'room');g.round=4;g.phase='choose';g.dice={colors:['g','b','o'],numbers:[1,3,2]};
 assert.equal(moveFeedback(g,1,{}),null);
 g=applyMove(g,0,{ci:0,ni:0,cells:[7]});
 assert.equal(moveFeedback(g,0,{}),null);
 assert.equal(moveFeedback(g,1,{ci:0,ni:1},[]).code,'unavailable');
 assert.equal(moveFeedback(g,1,{},[]).noMove,false);
});
test('Rückmeldungen stimmen über eine vollständige Partie mit gültigen Vorschlägen überein',()=>{
 let g=createGame(['A'],'solo'),seed=17;
 const rng=max=>{seed=(seed*1664525+1013904223)>>>0;return seed%max;};
 while(g.status==='playing'){
  g=rollGame(g,rng);const move=findMove(g,0);
  if(move){const result=moveFeedback(g,0,move,move.cells);assert.equal(result.valid,true);assert.equal(result.code,'ready');}
  else assert.equal(moveFeedback(g,0,{},[]).noMove,true);
  g=applyMove(g,0,move||{pass:true});
 }
 assert.equal(g.round,30);
});
