import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,rollGame,score} from '../public/game/engine.js';
import {enableComputerVariants,enableVariants,confirmHumanFleet,applyHiddenMineAction,validVariantState,variantsReady} from '../public/game/variants.js';
import {preparationStep,nextLocalPlayer} from '../public/game/view-state.js';
import {fleetSetupHTML,preparationWaitingHTML} from '../public/game/variant-ui.js';
import {hiddenMineSetupHtml} from '../public/game/mine-ui.js';
const rng=()=>0;
const fresh=()=>enableComputerVariants(createGame(['Robin','Bea'],'computer'),{battleship:true,hiddenMines:true},rng);

test('Each person advances through their own preparation before waiting for another fleet',()=>{
 const g=fresh();
 // A presentation snapshot can describe independent readiness while an opponent
 // is still preparing; this must never change the enabled modes or authority.
 g.variants.battleship.ready=[false,false];g.variants.hiddenMines.ready=[false,false];
 const before=structuredClone(g);assert.equal(preparationStep(g,0),'fleet');assert.equal(preparationStep(g,1),'fleet');
 g.variants.battleship.ready[0]=true;assert.equal(preparationStep(g,0),'mines');assert.equal(preparationStep(g,1),'fleet');assert.equal(nextLocalPlayer(g),0,'keep the same person for their mines');
 g.variants.hiddenMines.ready[0]=true;assert.equal(preparationStep(g,0),'waiting');assert.equal(nextLocalPlayer(g),1,'handover only after both own steps');
 g.variants.battleship.ready[1]=true;assert.equal(preparationStep(g,1),'mines');g.variants.hiddenMines.ready[1]=true;assert.equal(preparationStep(g,0),null);assert.equal(preparationStep(g,1),null);assert.ok(variantsReady(g));
 assert.deepEqual(g.players,before.players);assert.equal(g.turn,before.turn);assert.equal(g.round,before.round);
});

test('Real confirmed setup preserves points and refuses rolls until every required own step is saved',()=>{
 const first=fresh(),before=structuredClone(first);assert.equal(preparationStep(first,0),'fleet');assert.throws(()=>rollGame(first));
 const fleet=confirmHumanFleet(first);assert.equal(preparationStep(fleet,0),'mines');assert.equal(variantsReady(fleet),false);assert.throws(()=>rollGame(fleet));assert.ok(validVariantState(fleet));
 const done=applyHiddenMineAction(fleet,0,{kind:'ready'});assert.equal(preparationStep(done,0),null);assert.ok(variantsReady(done));assert.ok(validVariantState(done));assert.ok(validVariantState(rollGame(done,rng)));
 assert.deepEqual(first,before);assert.deepEqual(done.players,before.players);assert.equal(done.turn,0);assert.equal(done.round,1);for(let i=0;i<2;i++)assert.equal(score(done.players[i],done).total,score(first.players[i],first).total);
});

test('Both placement editors expose all edge coordinates and the same accessible zoom actions without mutating positions',()=>{
 let g=fresh();const before=JSON.stringify(g),fleet=fleetSetupHTML(g);g=confirmHumanFleet(g);const mines=hiddenMineSetupHtml(g);
 for(const html of [fleet,mines]){assert.equal((html.match(/class="mine-row-label"/g)||[]).length,7);assert.equal((html.match(/class="mine-col-label"/g)||[]).length,15);assert.match(html,/aria-label="A1, /);assert.match(html,/aria-label="O7, /);assert.match(html,/data-placement-zoom/);for(const action of ['placement-zoom-out','placement-zoom-in','placement-fit'])assert.equal(html.split('data-action="'+action+'"').length,2);assert.match(html,/mit zwei Fingern zoomen/);}
 assert.equal((fleet.match(/data-action="fleet-place"/g)||[]).length,105);assert.equal((mines.match(/data-action="hidden-mine-place"/g)||[]).length,105);
 const freshAgain=fresh();assert.equal(JSON.stringify(freshAgain),before);assert.match(fleetSetupHTML(g),/Vorbereitung ist fertig/);
});

test('A fleet-only human game retains private handover and its waiting view reads readiness, never foreign positions',()=>{
 let g=enableVariants(createGame(['Robin','Bea < &'],'local'),{battleship:true},rng);assert.equal(preparationStep(g,0),'fleet');g=confirmHumanFleet(g,0);assert.equal(preparationStep(g,0),'waiting');assert.equal(nextLocalPlayer(g),1);
 Object.defineProperty(g.variants.battleship.fleets,1,{get(){throw Error('foreign fleet read');}});assert.match(preparationWaitingHTML(g,0),/Bea &lt; &amp;/);assert.equal(preparationStep(g,0),'waiting');
 const ordinary=createGame(['A','B'],'local');assert.equal(preparationStep(ordinary,0),null);assert.equal(preparationStep(ordinary,99),null);ordinary.status='finished';assert.equal(preparationStep(ordinary,0),null);
});
