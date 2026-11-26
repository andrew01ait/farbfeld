import test from 'node:test';
import assert from 'node:assert/strict';
import {createComputerGame} from '../public/game/computer.js';
import {confirmHumanFleet,validVariantState} from '../public/game/variants.js';
import {availableDice,applyMove} from '../public/game/engine.js';
import {selectMoveColor,moveFeedback} from '../public/game/view-state.js';
import {battlePanelHTML,objectivesHTML,discoveryPanelHTML,mixingPanelHTML} from '../public/game/variant-ui.js';
const cells=[33,34,35,36];
function fixture({active=1,jokers=0}={}){
 let g=confirmHumanFleet(createComputerGame(false,'classic','medium',true,true,{battleship:true,discovery:true,objectives:true,shuffle:true}));
 g.round=4;g.turn=15;g.phase='choose';g.active=active;g.submitted=active===1?[1]:[];g.chosen=active===1?{ci:0,ni:0}:null;g.dice={colors:['*','o','o'],numbers:[2,3,4]};g.players[0].marks[21]=true;g.players[0].jokers=jokers;
 const field=g.variants.discovery.fields.find(f=>f.type==='color');field.owner=0;field.round=1;return g;
}
test('Screenshot regression: free green + four with the first die removed commits without a colour-die tap',()=>{
 const g=fixture(),before=JSON.stringify(g),draft={ability:'color',ci:null,ni:2,color:null,count:null};
 const choice=selectMoveColor(g,0,draft,'g');assert.equal(choice.ci,1,'bind only a remaining die');assert.equal(moveFeedback(g,0,choice,cells).valid,true);
 const next=applyMove(g,0,{...choice,cells});assert.ok(cells.every(i=>next.players[0].marks[i]));assert.equal(next.players[0].jokers,0);assert.equal(next.variants.discovery.fields.filter(f=>f.used).length,1);assert.equal(JSON.stringify(g),before);assert.ok(validVariantState(next));
});
test('An explicitly chosen replacement die is preserved and removed for the passive player',()=>{
 const g=fixture({active:0}),choice=selectMoveColor(g,0,{ability:'color',ci:2,ni:2},'g'),next=applyMove(g,0,{...choice,cells});
 assert.deepEqual(next.chosen,{ci:2,ni:2});assert.ok(!availableDice(next,1).colors.some(d=>d.index===2));assert.ok(!availableDice(next,1).numbers.some(d=>d.index===2));assert.equal(next.players[0].jokers,0);
});
test('Colour-first and number-first selection both reach a legal move; a stale removed die is rebound',()=>{
 for(const numberFirst of [false,true]){const g=fixture();let choice={ability:'color',ci:numberFirst?0:null,ni:numberFirst?2:null};choice=selectMoveColor(g,0,choice,'g');if(!numberFirst){assert.equal(moveFeedback(g,0,choice,[]).title,'Wähle einen Zahlenwürfel.');choice.ni=2;}assert.equal(moveFeedback(g,0,choice,cells).valid,true);assert.doesNotThrow(()=>applyMove(g,0,{...choice,cells}));}
});
test('Normal colour jokers still require a selected die; unearned abilities and invalid cells remain rejected',()=>{
 const g=fixture(),normal=selectMoveColor(g,0,{ability:null,ci:null,ni:2},'g');assert.equal(normal.ci,null);assert.throws(()=>applyMove(g,0,{...normal,cells}),/verfügbaren/);
 const choice=selectMoveColor(g,0,{ability:'color',ci:null,ni:2},'g'),before=JSON.stringify(g);assert.throws(()=>applyMove(g,0,{...choice,cells:[0,1,2,3]}));assert.equal(JSON.stringify(g),before);
 const field=g.variants.discovery.fields.find(f=>f.owner===0);field.used=true;assert.throws(()=>applyMove(g,0,{...choice,cells}),/nicht verfügbar/);
});
test('Free colour waives its own joker cost but keeps the number-joker budget',()=>{
 let g=fixture({jokers:1});g.dice.numbers[2]='?';const choice=selectMoveColor(g,0,{ability:'color',ci:null,ni:2,count:4},'g');const next=applyMove(g,0,{...choice,cells});assert.equal(next.players[0].jokers,0);
 g=fixture();g.dice.numbers[2]='?';assert.throws(()=>applyMove(g,0,{...choice,cells}),/nicht genug Joker/);
});
test('Each new element has its own card; collapsed panels and hidden data remain safe',()=>{
 const g=fixture();g.hiddenScores=true;Object.defineProperty(g.variants.battleship,'fleets',{get(){throw Error('private fleet');}});Object.defineProperty(g.players[1],'marks',{get(){throw Error('hidden opponent sheet');}});
 const cards=[battlePanelHTML(g),discoveryPanelHTML(g,0),objectivesHTML(g,0),mixingPanelHTML(g)];for(const html of cards){assert.match(html,/class="feature-panel /);assert.doesNotMatch(html,/\+\d+ Punkte/);}
 assert.doesNotMatch(cards[0],/aria-label="Schiffsboni" open/);assert.doesNotMatch(cards[2],/aria-label="Öffentliche Aufträge" open/);assert.match(objectivesHTML(g,0,{open:true}),/aria-label="Öffentliche Aufträge" open/);assert.match(cards[1],/Entdeckermodus/);assert.match(cards[3],/Farben neu mischen/);
});
