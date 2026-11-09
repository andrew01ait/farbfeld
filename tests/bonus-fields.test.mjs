import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,rollGame,applyMove,finishRound,score,rankings,canAct,applyMineAttack,findMove,boardFor} from '../public/game/engine.js';
import {enableBonusFields,bonusFieldsEnabled,bonusPoints,bonusAwards,validBonusState,projectBonuses} from '../public/game/bonus-fields.js';
import {createComputerGame,chooseComputerMove,stepComputer} from '../public/game/computer.js';
import {projectGame,scoreBreakdown} from '../public/game/game-info.js';
import {BOARDS} from '../public/game/boards.js';
import {bonusSetupHtml,bonusOptionHtml,bonusStatusHtml,bonusAnnouncement} from '../public/game/bonus-ui.js';
function fields(game,indices=[7,8,9]){game.bonuses={schema:1,enabled:true,fields:indices.map(index=>({index,claim:null,pending:[]}))};return game;}
function choosing(n=2,mode='local',hidden=false){const g=fields(createGame(Array.from({length:n},(_,i)=>'Player '+i),mode,[],{hiddenScores:hidden}));g.phase='choose';g.dice={colors:['g','b','o'],numbers:[1,2,3]};return g;}
const green={ci:0,ni:0,cells:[7]};
function finishPasses(game){let g=game;while(g.phase==='choose'){const pid=g.players.findIndex((_,i)=>canAct(g,i));g=applyMove(g,pid,{pass:true});}return g;}
test('Optional starts create three unique hidden fields on every board and every supported player count',()=>{
 for(const b of BOARDS)for(const n of [1,2,6]){
  const g=createGame(Array.from({length:n},(_,i)=>'P'+i),n===1?'solo':'local',[],{boardId:b.id,bonusFields:true});
  assert(bonusFieldsEnabled(g));assert(validBonusState(g));assert.equal(new Set(g.bonuses.fields.map(f=>f.index)).size,3);assert.equal(bonusPoints(g,0),0);
 }
 assert(bonusFieldsEnabled(createComputerGame(false,'classic','medium',true,true)));
 const legacy=createGame(['A','B'],'local');assert(validBonusState(legacy));assert(!bonusFieldsEnabled(legacy));assert.equal(score(legacy.players[0],legacy).bonus,undefined);
});
test('Generation samples without replacement, checks RNG and cannot change a running game',()=>{
 const g=createGame(['A','B'],'local'),calls=[];const enabled=enableBonusFields(g,max=>{calls.push(max);return max-1;});
 assert.deepEqual(calls,[105,104,103]);assert.deepEqual(enabled.bonuses.fields.map(f=>f.index),[104,103,102]);assert.equal(g.bonuses,undefined);
 assert.throws(()=>enableBonusFields(enabled,()=>0));assert.throws(()=>enableBonusFields(rollGame(g),()=>0));
 for(const rng of [()=>-1,()=>105,()=>1.5])assert.throws(()=>enableBonusFields(g,rng),/Zufallswert/);
});
test('A hit is reserved privately and awarded only after the shared round; all six tied players receive two points',()=>{
 let g=choosing(6);const before=structuredClone(g);g=applyMove(g,0,green);
 assert.equal(bonusPoints(g,0),0);assert.deepEqual(g.bonuses.fields[0].pending,[0]);assert.deepEqual(bonusAwards(g),[]);assert(validBonusState(g));assert.deepEqual(before.players[0].marks,Array(105).fill(false));
 for(const pid of [5,1,4,2,3]){assert.equal(bonusPoints(g,0),0);g=applyMove(g,pid,green);}
 assert.deepEqual(bonusAwards(g),[{slot:0,round:1,winners:[0,1,2,3,4,5]}]);
 for(let pid=0;pid<6;pid++){assert.equal(bonusPoints(g,pid),2);assert.equal(score(g.players[pid],g).bonus,2);}
 assert(validBonusState(g));
});
test('Only the first shared round wins a field; a later player receives no second award',()=>{
 let g=choosing();g=finishPasses(applyMove(g,0,green));assert.equal(bonusPoints(g,0),2);assert.equal(bonusPoints(g,1),0);
 g.phase='choose';g.dice={colors:['g','b','o'],numbers:[1,2,3]};g=applyMove(g,1,green);g=applyMove(g,0,{pass:true});
 assert.deepEqual(bonusAwards(g)[0].winners,[0]);assert.equal(bonusPoints(g,1),0);assert.equal(bonusAwards(g).length,1);
});
test('One move can earn all three fields, and bonuses count in the last solo round and rankings',()=>{
 const fresh=rollGame(createGame(['Solo'],'solo'),()=>5),move=findMove(fresh,0,{count:3});assert.equal(move.cells.length,3);
 fields(fresh,move.cells);fresh.round=30;const done=applyMove(fresh,0,move);assert.equal(done.status,'finished');assert.equal(bonusPoints(done,0),6);
 const s=score(done.players[0],done);assert.equal(s.total,s.columns+s.colors+s.jokers-s.penalty+s.bonus);assert.equal(rankings(done)[0].total,s.total);assert.equal(scoreBreakdown(done,0,0).bonus,s.bonus);
});
test('The match-ending shared round still awards every tied finder before final scoring',()=>{
 let g=choosing();const layout=boardFor(g);layout.cells.forEach((c,i)=>{if(['g','y'].includes(c)&&i!==7)g.players[0].marks[i]=true;});
 g=applyMove(g,0,green);assert.equal(g.status,'playing');g=applyMove(g,1,green);assert.equal(g.status,'finished');assert.equal(bonusPoints(g,0),2);assert.equal(bonusPoints(g,1),2);assert.throws(()=>applyMove(g,0,green));
});
test('Passing and invalid moves neither reserve nor award fields',()=>{
 const g=choosing(),before=structuredClone(g);assert.throws(()=>applyMove(g,0,{ci:0,ni:0,cells:[8]}));assert.deepEqual(g,before);
 const done=finishPasses(applyMove(g,0,{pass:true}));assert.equal(bonusAwards(done).length,0);assert(done.bonuses.fields.every(f=>!f.pending.length));
});
test('Mine damage cannot remove a pending bonus or its later permanent award',()=>{
 let g=fields(createComputerGame(false,'classic','easy',true,true));g.phase='choose';g.dice={colors:['g','b','o'],numbers:[1,2,3]};g.mines.unlocked=[true,true];
 g=applyMove(g,0,green);g=applyMineAttack(g,1,7,()=>0);assert.equal(g.players[0].marks[7],false);assert.deepEqual(g.bonuses.fields[0].pending,[0]);
 g=applyMove(g,1,{pass:true});assert.equal(bonusPoints(g,0),2);assert.equal(score(g.players[1],g).mineCost,5);
 const saved=JSON.parse(JSON.stringify(g));assert(validBonusState(saved));assert.equal(bonusPoints(saved,0),2);
 g.phase='choose';g.active=0;g.dice={colors:['g','b','o'],numbers:[1,2,3]};g=finishPasses(applyMove(g,0,green));assert.equal(bonusPoints(g,0),2);assert.equal(bonusAwards(g).length,1);
});
test('Already settled bonus points survive both centre and surrounding mine damage without transfer',()=>{
 let g=fields(createComputerGame(false,'classic','easy',true,true));g.phase='choose';g.dice={colors:['g','b','o'],numbers:[1,2,3]};g=applyMove(g,0,green);g=finishPasses(g);
 g.phase='choose';g.active=1;g.dice={colors:['g','b','o'],numbers:[1,2,3]};g.mines.unlocked=[true,true];
 const awards=bonusAwards(g),next=applyMineAttack(g,1,7,()=>0);assert.equal(next.players[0].marks[7],false);assert.deepEqual(bonusAwards(next),awards);assert.equal(score(next.players[0],next).bonus,2);assert.equal(bonusPoints(next,1),0);
});
test('All projections keep unclaimed locations, pending winners and even claimed coordinates private',()=>{
 for(const hidden of [false,true]){
  let g=choosing(2,'room',hidden);g=applyMove(g,0,green);const before=structuredClone(g),view=projectGame(g,1);
  assert.equal(view.bonuses.fields,undefined);assert.deepEqual(view.bonuses,{schema:1,enabled:true,awards:[],remaining:3});assert(validBonusState(view,{allowProjection:true}));assert(!validBonusState(view));assert.deepEqual(g,before);
  g=applyMove(g,1,green);const settled=projectGame(g,1);assert.equal(settled.bonuses.fields,undefined);assert.deepEqual(settled.bonuses.awards,[{slot:0,round:1,winners:[0,1]}]);assert(!JSON.stringify(settled.bonuses).includes('index'));
  g.status='finished';assert.equal(projectGame(g,0).bonuses.fields,undefined);
 }
});
test('A public view and the full game score the same awards; rendering does not mutate either state',()=>{
 let g=finishPasses(applyMove(choosing(),0,green));const p=projectGame(g,0),before=structuredClone(p);
 assert.equal(score(p.players[0],p).total,score(g.players[0],g).total);bonusStatusHtml(p);bonusAwards(p).reverse();assert.deepEqual(p,before);assert.deepEqual(projectBonuses(g),p.bonuses);
});
test('Hidden bonus notices identify discovery without exposing coordinates, private marks or totals',()=>{
 let g=choosing(2,'local',true);g.players[0].name='<img onerror=bad>';g=finishPasses(applyMove(g,0,green));
 const html=bonusStatusHtml(g);assert(html.includes('&lt;img'));assert(!html.includes('<img'));assert(!html.includes('+2'));assert(!html.includes('H1'));assert(!html.includes('data-i'));
 assert.equal(bonusAnnouncement(g,bonusAwards(g)[0]),'<img onerror=bad>');assert.match(bonusSetupHtml(),/id="bonus-fields"/);assert(!bonusSetupHtml().includes(' checked'));assert(bonusSetupHtml(true).includes(' checked'));
 assert.match(bonusOptionHtml(false,true,'room-bonus',false,['Old <client>']),/disabled/);assert.match(bonusOptionHtml(false,true,'room-bonus',false,['Old <client>']),/Old &lt;client&gt;/);
});
test('Bonus state validation rejects duplicate locations, forged winners and mixed private/public states',()=>{
 const g=choosing();for(const mutate of [x=>x.bonuses.fields.pop(),x=>x.bonuses.fields[0].index=105,x=>x.bonuses.fields[1].index=x.bonuses.fields[0].index,x=>x.bonuses.fields[0].pending=[1],x=>x.bonuses.fields[0].claim={round:1,winners:[8]},x=>x.bonuses.fields[0].claim={round:2,winners:[0]},x=>x.bonuses.enabled=false]){const bad=structuredClone(g);mutate(bad);assert(!validBonusState(bad));}
 const publicView=projectGame(g,0);publicView.bonuses.remaining=2;assert(!validBonusState(publicView,{allowProjection:true}));
});
test('All computer strengths ignore unknown bonus locations, including hypothetical hard moves',()=>{
 for(const hidden of [false,true])for(const level of ['easy','medium','hard']){
  let a=fields(createComputerGame(hidden,'classic',level,false,true));a=rollGame(a,()=>0);const b=structuredClone(a);b.bonuses.fields.forEach((f,i)=>f.index=90+i);
  const expected=chooseComputerMove(a,0);assert.deepEqual(chooseComputerMove(b,0),expected);
  for(const field of a.bonuses.fields)Object.defineProperty(field,'index',{get(){throw Error('secret location read');}});
  assert.deepEqual(chooseComputerMove(a,0),expected);
 }
});
test('Complete optional computer games on every board keep bounded permanent bonuses and valid saves',()=>{
 let seed=123;const rng=max=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return Math.floor(seed/4294967296*max);};
 for(const board of BOARDS)for(const hidden of [false,true]){
  let g=createComputerGame(hidden,board.id,'easy',true,true),steps=0;const previous=[0,0];
  while(g.status==='playing'&&steps++<1800){
   if(g.phase==='roll'&&g.active===1||canAct(g,1))g=stepComputer(g,rng);else if(g.phase==='roll')g=rollGame(g,rng);else g=applyMove(g,0,findMove(g,0)??{pass:true});
   assert(validBonusState(g));for(let pid=0;pid<2;pid++){const points=bonusPoints(g,pid);assert(points>=previous[pid]&&points<=6&&points%2===0);previous[pid]=points;}
  }
  assert.equal(g.status,'finished');assert(validBonusState(JSON.parse(JSON.stringify(g))));
 }
});

test('Compact bonus notices and expandable history retain tied winners, round and concealed rewards',()=>{
 for(const n of [2,6])for(const hiddenScores of [false,true]){
  let g=choosing(n,'local',hiddenScores);g.players[0].name='Du';g.players[1].name='Computer';
  for(let pid=0;pid<n;pid++)g=applyMove(g,pid,green);
  const award=bonusAwards(g)[0],names=g.players.map(p=>p.name).join(' & '),html=bonusStatusHtml(g);
  assert.equal(bonusAnnouncement(g,award),names+(hiddenScores?'':' · je +2'));
  assert(html.includes('<details>'));assert(html.includes('aria-label="Wurf 1"'));assert(html.includes('1/3'));
  assert(html.includes(names.replaceAll('&','&amp;')));assert(!html.includes('Bonusfeld gefunden'));
  if(n===6)assert(html.includes('Alle 6'));
  assert.equal(html.includes('+2'),!hiddenScores);
  g.status='finished';assert(bonusStatusHtml(g).includes('je +2'));
 }
 let g=finishPasses(applyMove(choosing(),0,green));g.players[0].name='Du';
 assert.equal(bonusAnnouncement(g,bonusAwards(g)[0]),'Du · +2');
 const empty=bonusStatusHtml(choosing());assert(empty.includes('Noch unentdeckt'));assert(!empty.includes('<details>'));assert(empty.includes('0/3'));
});
