import test from 'node:test';
import assert from 'node:assert/strict';
import {createComputerGame} from '../public/game/computer.js';
import {completedFeaturePanels,FeatureCompletionNotice} from '../public/game/view-state.js';

const fresh=()=>{const g=createComputerGame(false,'classic','medium',true,true,{battleship:true,discovery:true,objectives:true,shuffle:true,hiddenMines:true});g.gameId='game-a';return g;};
function finish(g){
 g.variants.battleship.sunk[0].fill(true);
 g.bonuses.fields.forEach(f=>f.claim={round:1,winners:[1]});
 g.variants.objectives.tasks.forEach(t=>{t.claims[0]=1;t.firstRound=1;});
 g.variants.hiddenMines.triggered.forEach(row=>row.fill(true));
 return g;
}

test('All completed detail cards fold once, preserving later manual reopening through repeat renders',()=>{
 const g=fresh(),notice=new FeatureCompletionNotice();assert.equal(notice.observe(g,0,'local').size,0);
 finish(g);const before=JSON.stringify(g);assert.deepEqual([...notice.observe(g,0,'local')].sort(),['battle','bonus','hiddenMines','objectives']);
 for(let n=0;n<5;n++)assert.equal(notice.observe(structuredClone(g),0,'local').size,0);
 assert.equal(JSON.stringify(g),before);
});

test('Each card remains active until its own full completion, including the inclusive last objective round',()=>{
 const g=fresh();g.variants.battleship.sunk[0][0]=true;g.bonuses.fields[0].claim={round:1,winners:[1]};g.variants.hiddenMines.triggered[0].fill(true);
 assert.deepEqual(completedFeaturePanels(g,0),{bonus:false,battle:false,objectives:false,hiddenMines:false});
 g.round=12;g.variants.objectives.tasks.forEach((t,i)=>{t.deadline=12;if(i)t.claims[0]=1;});
 assert.equal(completedFeaturePanels(g,0).objectives,false);g.round=13;assert.equal(completedFeaturePanels(g,0).objectives,true);
 g.variants.hiddenMines.triggered[1].fill(true);assert.equal(completedFeaturePanels(g,0).hiddenMines,true);
});

test('Pending objective completion waits for settled awards and cards only use the actual own participant',()=>{
 const g=fresh();g.variants.objectives.tasks.forEach(t=>t.pending[0]=1);g.variants.battleship.sunk[1].fill(true);
 assert.equal(completedFeaturePanels(g,0).objectives,false);assert.equal(completedFeaturePanels(g,0).battle,false);assert.equal(completedFeaturePanels(g,1).battle,true);
 g.variants.objectives.tasks.forEach(t=>{t.pending[0]=null;t.claims[0]=1;});assert.equal(completedFeaturePanels(g,0).objectives,true);assert.equal(completedFeaturePanels(g,1).objectives,false);
});

test('Completion never reads secret coordinates, foreign shots, private fleets or hidden opponent sheets',()=>{
 const g=finish(fresh());g.hiddenScores=true;
 for(const f of g.bonuses.fields)Object.defineProperty(f,'index',{get(){throw Error('treasure secret');}});
 Object.defineProperty(g.variants.battleship,'fleets',{get(){throw Error('fleet secret');}});
 Object.defineProperty(g.variants.battleship.sunk,1,{get(){throw Error('foreign sinking');}});
 Object.defineProperty(g.variants.hiddenMines,'positions',{get(){throw Error('mine secret');}});
 Object.defineProperty(g.players[1],'marks',{get(){throw Error('foreign sheet');}});
 assert.deepEqual(completedFeaturePanels(g,0),{bonus:true,battle:true,objectives:true,hiddenMines:true});
});

test('Separate games, participants and room contexts each receive their own completion transition',()=>{
 const g=finish(fresh()),notice=new FeatureCompletionNotice();assert.equal(notice.observe(g,0,'room:A').size,4);assert.equal(notice.observe(g,0,'room:A').size,0);
 assert.equal(notice.observe(g,0,'room:B').size,4);assert.equal(notice.observe({...g,gameId:'game-b'},0,'room:A').size,4);
 assert.deepEqual([...notice.observe(g,1,'room:A')].sort(),['bonus','hiddenMines']);
});

test('Game end folds all enabled detail cards once and a legacy replacement can complete again',()=>{
 const g=fresh();delete g.gameId;const notice=new FeatureCompletionNotice();notice.observe(g,0,'local');
 g.status='finished';assert.equal(notice.observe(g,0,'local').size,4);assert.equal(notice.observe(g,0,'local').size,0);
 const replacement=fresh();delete replacement.gameId;assert.equal(notice.observe(replacement,0,'local').size,0);finish(replacement);assert.equal(notice.observe(replacement,0,'local').size,4);
 assert.deepEqual(completedFeaturePanels(createComputerGame(),0),{bonus:false,battle:false,objectives:false,hiddenMines:false});
});
