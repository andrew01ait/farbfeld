import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,rollGame,applyMove,applyMineAttack,findMove,score,boardFor,canAct,canUseMine,availableDice,COLORS,finishRound} from '../public/game/engine.js';
import {createComputerGame,chooseComputerMove,stepComputer,needsComputerTurn} from '../public/game/computer.js';
import {enableComputerVariants,confirmHumanFleet,placeFleetShip,randomizeHumanFleet,validVariantState,abilityCharges,shipPoints,objectivePoints,shuffleFreeColors} from '../public/game/variants.js';
import {moveFeedback} from '../public/game/view-state.js';
import {battlePanelHTML,cellVariantHTML,objectivesHTML,abilitiesHTML} from '../public/game/variant-ui.js';
const all={battleship:true,discovery:true,objectives:true,shuffle:true};
const fleet=[[7],[22,23],[37,38,39],[52,53,54,55],[67,68,69,70,71]];
const rng=seed=>max=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%max;};
function game(options=all){let g=createComputerGame(false,'classic','medium',true,false,options);if(options.battleship){g.variants.battleship.fleets=[structuredClone(fleet),structuredClone(fleet)];g=confirmHumanFleet(g);}return g;}
function ready(g,pid=0,index=7){g=structuredClone(g);g.phase='choose';g.dice={colors:[boardFor(g,pid).cells[index],boardFor(g,pid).cells[index],'*'],numbers:[1,1,'?']};return g;}
function shoot(g,pid,index,extra={}){g=ready(g,pid,index);const d=availableDice(g,pid);return applyMove(g,pid,{ci:d.colors[0].index,ni:d.numbers[0].index,cells:[index],...extra},rng(9));}
function fields(g){g.variants.discovery.fields=['color','number','extra','color','number','extra'].map((type,i)=>({type,index:[7,22,37,52,67,82][i],owner:null,round:null,used:false}));return g;}
function charge(g,type,pid=0){const f=g.variants.discovery.fields.find(f=>f.type===type);f.owner=pid;f.round=1;g.round=2;return f;}
function task(g,type='stars',target=1,deadline=12){const t=g.variants.objectives.tasks[0];Object.assign(t,{type,target,deadline,firstRound:null,claims:[null,null],pending:[null,null]});return t;}

test('All 16 combinations on four boards persist; variants reject human modes',()=>{
 for(const board of ['classic','river','mosaic','random'])for(let mask=0;mask<16;mask++){const options=Object.fromEntries(Object.keys(all).map((k,i)=>[k,!!(mask&1<<i)])),g=createComputerGame(false,board,'medium',false,false,options);assert.ok(validVariantState(g));assert.ok(validVariantState(JSON.parse(JSON.stringify(g))));if(!mask)assert.equal(g.variants,undefined);}
 for(const mode of ['solo','local','room','direct'])assert.throws(()=>enableComputerVariants(createGame(['A','B'],mode),all,rng(2)),/Computer/);
});
test('Fleet is straight, touching is permitted, overlapping and out-of-board placements fail',()=>{
 let g=createComputerGame(false,'classic','medium',false,false,{battleship:true});g.variants.battleship.fleets[0]=structuredClone(fleet);
 assert.throws(()=>rollGame(g),/Wurf/);assert.equal(canAct(ready(g),0),false);
 g=placeFleetShip(g,0,21);assert.ok(validVariantState(g));assert.throws(()=>placeFleetShip(g,0,22),/überlappen/);assert.throws(()=>placeFleetShip(g,4,14),/Brett/);
 assert.ok(validVariantState(randomizeHumanFleet(g,rng(5))));g=confirmHumanFleet(g);assert.throws(()=>placeFleetShip(g,0,0),/bestätigt/);
});
test('Only confirmed complete sinking pays; re-marking after mine cannot pay twice',()=>{
 let g=game({battleship:true});const original=JSON.stringify(g);g=shoot(g,0,7);assert.equal(shipPoints(g,0),5);assert.equal(shipPoints(g,1),0);assert.equal(JSON.parse(original).variants.battleship.shots[0][7],0);
 g.mines.unlocked[1]=true;g=applyMineAttack(g,1,7,rng(3));assert.equal(g.players[0].marks[7],false);assert.equal(shipPoints(g,0),5);
 g=applyMove(g,1,{pass:true});g=shoot(g,1,7);g=shoot(g,0,7);assert.equal(shipPoints(g,0),5);assert.ok(validVariantState(g));
});
test('Five ship bonuses are 5/4/3/2/1 with maximum 15; fleet elimination does not end Farbfeld',()=>{
 let g=game({battleship:true});const b=g.variants.battleship;
 for(let s=0;s<5;s++){for(const i of b.fleets[1][s])b.shots[0][i]=2;b.sunk[0][s]=true;b.revealed[0].push([...b.fleets[1][s]]);assert.equal(shipPoints(g,0),[5,9,12,14,15][s]);}
 finishRound(g,rng(4));assert.equal(g.status,'playing');assert.equal(score(g.players[0],g).shipBonus,15);assert.ok(validVariantState(g));
});
test('Discovery is globally exclusive and usable only after the finding round',()=>{
 let g=fields(game({discovery:true}));g=shoot(g,0,7);assert.equal(g.variants.discovery.fields[0].owner,0);assert.equal(abilityCharges(g,0,'color').length,0);g=shoot(g,1,7);assert.equal(abilityCharges(g,0,'color').length,1);assert.equal(abilityCharges(g,1,'color').length,0);assert.ok(validVariantState(g));
});
test('Luftangriff damage preserves finds and charges, including before round settlement',()=>{
 let g=fields(game({discovery:true}));g=shoot(g,0,7);g.mines.unlocked[1]=true;g=applyMineAttack(g,1,7,rng(5));assert.equal(g.players[0].marks[7],false);assert.equal(g.variants.discovery.fields[0].owner,0);g=applyMove(g,1,{pass:true});assert.equal(abilityCharges(g,0,'color').length,1);assert.ok(validVariantState(g));
});
test('Free color waives color joker, preserves number and consumes only a valid confirmed charge',()=>{
 let g=fields(game({discovery:true}));charge(g,'color');g=ready(g);g.players[0].jokers=0;g.dice.colors[0]='*';const before=JSON.stringify(g),move={ci:0,ni:0,color:boardFor(g,0).cells[7],ability:'color',cells:[7]};assert.throws(()=>applyMove(g,0,{...move,cells:[0]}));assert.equal(JSON.stringify(g),before);g=applyMove(g,0,move);assert.equal(g.players[0].jokers,0);assert.equal(g.variants.discovery.fields[0].used,true);assert.ok(validVariantState(g));
});
test('Number changes stay within 1–5; an extra cell must be free and touch the new group',()=>{
 let g=fields(game({discovery:true,battleship:true}));charge(g,'number');g=ready(g);assert.throws(()=>applyMove(g,0,{ci:0,ni:0,ability:'number',delta:-1,cells:[7]}),/zwischen 1 und 5/);g.dice.numbers[0]=5;assert.throws(()=>applyMove(g,0,{ci:0,ni:0,ability:'number',delta:1,cells:[7]}),/zwischen 1 und 5/);
 g=fields(game({discovery:true,battleship:true}));charge(g,'extra');g=ready(g);const move={ci:0,ni:0,ability:'extra',cells:[7]};assert.throws(()=>applyMove(g,0,{...move,extraCell:7}),/zusätzliches/);assert.throws(()=>applyMove(g,0,{...move,extraCell:9}),/angrenzen/);g=applyMove(g,0,{...move,extraCell:22});assert.equal(g.players[0].marks[22],true);assert.equal(g.variants.battleship.shots[0][22],2);assert.equal(g.variants.discovery.fields[1].owner,0);assert.equal(g.variants.discovery.fields[2].used,true);
});
test('Deadline includes round 12 and latched completion survives mine damage before settlement',()=>{
 let g=game({objectives:true});g.round=12;task(g);g=shoot(g,0,7);assert.equal(g.variants.objectives.tasks[0].pending[0],12);assert.equal(objectivePoints(g,0),0);g.mines.unlocked[1]=true;g=applyMineAttack(g,1,7,rng(8));g=applyMove(g,1,{pass:true});assert.equal(g.round,13);assert.equal(g.variants.objectives.tasks[0].claims[0],12);assert.equal(objectivePoints(g,0),5);assert.ok(validVariantState(g));
});
test('Race pays first-round ties five, later two, and expired objectives nothing',()=>{
 let g=game({objectives:true});task(g);g=shoot(g,0,7);g=shoot(g,1,7);assert.equal(objectivePoints(g,0),5);assert.equal(objectivePoints(g,1),5);
 g=game({objectives:true});task(g);g=shoot(g,0,7);g=applyMove(g,1,{pass:true});g=shoot(g,1,7);g=applyMove(g,0,{pass:true});assert.equal(objectivePoints(g,1),2);
 g=game({objectives:true});g.round=13;task(g);g=shoot(g,0,7);g=applyMove(g,1,{pass:true});assert.equal(objectivePoints(g,0),0);
});
test('Five-round mixing preserves marked colors, each color count and stable coordinates, exactly once',()=>{
 let g=game({shuffle:true,discovery:true,battleship:true});g.round=5;g.players[0].marks[7]=true;g.players[1].marks[22]=true;const old=structuredClone(g),r=rng(61);shuffleFreeColors(g,r);assert.equal(g.variants.mixing.lastRound,5);assert.equal(boardFor(g,0).cells[7],boardFor(old,0).cells[7]);assert.equal(boardFor(g,1).cells[22],boardFor(old,1).cells[22]);assert.notDeepEqual(g.variants.layouts[0],g.variants.layouts[1]);for(const p of [0,1])for(const c of COLORS)assert.equal(boardFor(g,p).cells.filter(x=>x===c).length,21);assert.deepEqual(g.variants.battleship,old.variants.battleship);assert.deepEqual(g.variants.discovery,old.variants.discovery);shuffleFreeColors(g,()=>{throw Error('double draw');});assert.ok(validVariantState(g));assert.ok(validVariantState(JSON.parse(JSON.stringify(g))));
});
test('A mine does not advance round five; mixing occurs only after both normal turns',()=>{
 let g=game({shuffle:true});g.round=5;g=ready(g);g.mines.unlocked[0]=true;g.players[1].marks[7]=true;g=applyMineAttack(g,0,7,rng(4));assert.equal(g.round,5);assert.equal(g.variants.mixing.lastRound,0);g=applyMove(g,0,{pass:true},rng(4));assert.equal(g.variants.mixing.lastRound,0);g=applyMove(g,1,{pass:true},rng(4));assert.equal(g.round,6);assert.equal(g.variants.mixing.lastRound,5);
});
test('Final-round objectives settle before the result; final round never draws a shuffle',()=>{
 let g=game({shuffle:true,objectives:true});g.round=5;const t=task(g);t.pending[0]=5;for(let i=0;i<105;i++)if(['g','y'].includes(boardFor(g,0).cells[i]))g.players[0].marks[i]=true;g=ready(g);g=applyMove(g,0,{pass:true});g=applyMove(g,1,{pass:true},()=>{throw Error('final mix');});assert.equal(g.status,'finished');assert.equal(objectivePoints(g,0),5);assert.equal(g.variants.mixing.lastRound,0);assert.ok(validVariantState(g));
});
test('Save validation rejects foreign mode, bad fleet, claim owners, duplicate finds and broken layouts',()=>{
 const original=game();for(const mutate of [g=>g.mode='solo',g=>g.variants.battleship.fleets[0][1]=[0,16],g=>g.variants.discovery.fields[0].owner=2,g=>g.variants.discovery.fields[1].index=g.variants.discovery.fields[0].index,g=>g.variants.layouts[0][0]='x',g=>g.variants.objectives.tasks[0].claims[0]=100]){const g=structuredClone(original);mutate(g);assert.equal(validVariantState(g),false);}
});
test('Target rendering never reads an unseen fleet; hidden mode redacts earned variant points',()=>{
 let g=game();const b=g.variants.battleship;b.shots[0][7]=2;b.sunk[0][0]=true;b.revealed[0]=[[7]];b.lastVolley={id:'2:0',by:0,round:1,results:[{index:7,hit:true}],sunk:[{cells:[7],points:5}]};g.hiddenScores=true;task(g);g.variants.objectives.tasks[0].claims[0]=1;g.variants.objectives.tasks[0].firstRound=1;
 assert.doesNotMatch(battlePanelHTML(g),/\+5|\+\d+ Punkte/);assert.doesNotMatch(objectivesHTML(g),/\+5|\+\d+ Punkte/);
 Object.defineProperty(b,'fleets',{get(){throw Error('private fleet');}});assert.doesNotThrow(()=>battlePanelHTML(g));assert.equal(cellVariantHTML(g,1,7).includes('own-ship'),false);assert.doesNotThrow(()=>abilitiesHTML(g,0,{},true));
});
test('Hints and feedback agree on required extra fields and number adjustments',()=>{
 let g=fields(game({discovery:true}));charge(g,'extra');g=ready(g);const h=findMove(g,0,{ability:'extra'});assert.ok(h);assert.equal(moveFeedback(g,0,{...h,extraCell:null},h.cells).code,'extra');assert.equal(moveFeedback(g,0,h,h.cells).valid,true);assert.doesNotThrow(()=>applyMove(g,0,h));
 charge(g,'number');g=ready(g);g.dice.numbers[0]=2;const n=findMove(g,0,{ci:0,ni:0,ability:'number',delta:-1});assert.ok(n);assert.equal(n.cells.length,1);assert.equal(moveFeedback(g,0,n,n.cells).valid,true);
});
test('Computer decisions inspect neither private fleet nor concealed human sheet and consume no future RNG',()=>{
 for(const difficulty of ['easy','medium','hard']){let g=game();g=ready(g,1);g.active=1;g.hiddenScores=true;g.computerDifficulty=difficulty;charge(g,'extra',1);Object.defineProperty(g.variants.battleship,'fleets',{get(){throw Error('secret fleet');}});for(const key of ['marks','columns','colors','jokers'])Object.defineProperty(g.players[0],key,{enumerable:false,get(){throw Error('hidden '+key);}});assert.doesNotThrow(()=>chooseComputerMove(g));}
});
test('Complete combined games end with legal moves and consistent scoring on every board and strength',()=>{
 for(const [board,level,hidden] of [['classic','easy',false],['classic','medium',false],['classic','hard',false],['river','medium',false],['mosaic','medium',true],['random','medium',true]]){
  let g=confirmHumanFleet(createComputerGame(hidden,board,level,true,true,all)),steps=0,r=rng(48);
  while(g.status==='playing'&&steps++<1200){if(needsComputerTurn(g))g=stepComputer(g,r);else if(g.phase==='roll')g=rollGame(g,r);else if(canAct(g,0)){if(canUseMine(g,0))g=applyMineAttack(g,0,7,r);else g=applyMove(g,0,chooseComputerMove(g,0)||{pass:true},r);}else throw Error('stalled game');assert.ok(validVariantState(g),board+' '+level+' round '+g.round);}
  assert.equal(g.status,'finished',board+' '+level+' ended');for(const p of g.players){const s=score(p,g);assert.equal(s.total,s.columns+s.colors+s.jokers-s.penalty-s.mineCost+s.bonus+s.shipBonus+s.objectiveBonus);assert.ok(s.shipBonus<=15);assert.ok(s.objectiveBonus<=15);}
 }
});

test('Exact combined score: sink + task + secret bonus at one discovery cell, mine before settlement, mix and refill',()=>{
 let g=fields(game());g.round=5;task(g);g.bonuses={schema:1,enabled:true,fields:[7,0,1].map(index=>({index,claim:null,pending:[]}))};
 assert.equal(score(g.players[0],g).total,-22);
 g=shoot(g,0,7);assert.equal(score(g.players[0],g).total,-15,'only star and sinking count before round settlement');
 g.mines.unlocked[1]=true;g=applyMineAttack(g,1,7,rng(4));assert.equal(score(g.players[0],g).total,-17,'mine removes star mark, preserves sunk bonus');assert.equal(score(g.players[1],g).total,-27,'mine costs its user exactly five');
 g=applyMove(g,1,{pass:true},rng(4));assert.equal(g.variants.mixing.lastRound,5);assert.equal(score(g.players[0],g).total,-10,'latched task five plus secret bonus two, star still open');assert.equal(g.variants.discovery.fields[0].owner,0);
 g=ready(g,1);g=applyMove(g,1,{pass:true});g=shoot(g,0,7);assert.equal(score(g.players[0],g).total,-8,'refill recovers only the two star points');assert.equal(score(g.players[0],g).shipBonus,5);assert.equal(score(g.players[0],g).objectiveBonus,5);assert.equal(score(g.players[0],g).bonus,2);assert.ok(validVariantState(g));
});
