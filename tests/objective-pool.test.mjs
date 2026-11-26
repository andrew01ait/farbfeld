import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,rollGame,applyMove,boardFor} from '../public/game/engine.js';
import {OBJECTIVE_POOL,enableVariants,validVariantState,objectiveProgress,noteVariantMove,settleVariantObjectives,objectivePoints} from '../public/game/variants.js';
import {objectivesHTML,variantHelpHTML,variantSetupHTML} from '../public/game/variant-ui.js';
import {projectGame} from '../public/game/game-info.js';

const seeded=seed=>{let s=seed||1;return max=>{s^=s<<13;s^=s>>>17;s^=s<<5;return (s>>>0)%max;};};
const definition=t=>JSON.stringify([t.type,t.target,t.color??null,t.deadline]);
const fresh=(seed=1,mode='computer',n=2)=>enableVariants(createGame(Array.from({length:n},(_,i)=>'Person '+i),mode),{objectives:true},seeded(seed));

test('Closed objectives show the viewer’s own progress and keep fulfilled goals at their target',()=>{
 const g=fresh(1,'room');
 g.hiddenScores=true;g.round=4;
 const tasks=g.variants.objectives.tasks;
 Object.assign(tasks[0],{type:'color',color:'g',target:10});
 Object.assign(tasks[1],{type:'stars',target:6});
 Object.assign(tasks[2],{type:'columns',target:3});
 g.players[0].marks.fill(true);
 for(const i of [0,1,2,7,15,30,45,60,75,90])g.players[1].marks[i]=true;
 const html=objectivesHTML(projectGame(g,1),1),summary=html.split('</summary>')[0];
 assert.deepEqual([...summary.matchAll(/<b>(\d+\/\d+ [^<]+)<\/b>/g)].map(match=>match[1]),['4/10 Grün','2/6 Sterne','1/3 Spalten']);
 assert.deepEqual([...html.matchAll(/aria-valuenow="(\d+)"/g)].map(match=>Number(match[1])),[4,2,1]);
 tasks[0].pending[1]=4;
 tasks[1].claims[1]=2;tasks[1].firstRound=2;
 g.players[1].marks.fill(false);
 const credited=objectivesHTML(projectGame(g,1),1).split('</summary>')[0];
 assert(credited.includes('✓ 10/10 Grün'));
 assert(credited.includes('✓ 6/6 Sterne'));
 assert(credited.includes('0/3 Spalten'));
});

test('Public pool has 40 immutable unique playable definitions covering all five colors and three deadlines',()=>{
 assert.equal(OBJECTIVE_POOL.length,40);assert(Object.isFrozen(OBJECTIVE_POOL));assert(OBJECTIVE_POOL.every(Object.isFrozen));assert.equal(new Set(OBJECTIVE_POOL.map(definition)).size,40);
 assert.equal(OBJECTIVE_POOL.filter(t=>t.type==='columns').length,4);assert.equal(OBJECTIVE_POOL.filter(t=>t.type==='stars').length,6);assert.equal(OBJECTIVE_POOL.filter(t=>t.type==='color').length,30);
 assert.deepEqual([...new Set(OBJECTIVE_POOL.filter(t=>t.type==='color').map(t=>t.color))].sort(),['b','g','o','p','y']);
 for(const t of OBJECTIVE_POOL){assert(t.target>0&&t.target<=({columns:15,stars:15,color:21}[t.type]));assert([12,20,null].includes(t.deadline));}
});

test('Each new match draws three distinct kinds and deadlines from the pool and every entry is reachable',()=>{
 const known=new Set(OBJECTIVE_POOL.map(definition)),seen=new Set(),sets=new Set();
 for(let seed=1;seed<=2048;seed++){
  const g=fresh(seed),tasks=g.variants.objectives.tasks;assert(validVariantState(g));assert.equal(tasks.length,3);assert.equal(new Set(tasks.map(t=>t.type)).size,3);assert.deepEqual(tasks.map(t=>t.deadline),[12,20,null]);assert.deepEqual(tasks.map(t=>t.id),[0,1,2]);
  for(const t of tasks){assert(known.has(definition(t)));seen.add(definition(t));assert.deepEqual(t.claims,[null,null]);assert.deepEqual(t.pending,[null,null]);}
  sets.add(tasks.map(definition).join('|'));
 }
 assert.equal(seen.size,40);assert(sets.size>100);assert.deepEqual(fresh(73).variants.objectives,fresh(73).variants.objectives);
});

test('All supported player counts share the same selected definitions in each authenticated projection',()=>{
 for(const mode of ['computer','local','direct','room'])for(let n=2;n<=(mode==='computer'?2:6);n++){
  const g=fresh(n*101,mode,n),tasks=g.variants.objectives.tasks;g.hiddenScores=true;
  for(let own=0;own<n;own++){
   const view=projectGame(g,own);assert(validVariantState(view,{allowProjection:true}));assert.deepEqual(view.variants.objectives.tasks.map(definition),tasks.map(definition));assert.equal(tasks[0].claims.length,n);
   view.variants.objectives.tasks[0].claims[own]=1;assert.equal(tasks[0].claims[own],null);
  }
 }
});

test('Reload, viewing, passing and rolling keep the initial selection; older repeated kinds remain valid',()=>{
 let g=fresh(91);const definitions=g.variants.objectives.tasks.map(definition);
 g=JSON.parse(JSON.stringify(g));const before=JSON.stringify(g);objectivesHTML(g);variantHelpHTML(g,{only:'objectives'});assert.equal(JSON.stringify(g),before);
 g=rollGame(g,seeded(9));g=applyMove(g,0,{pass:true});g=applyMove(g,1,{pass:true});assert.deepEqual(g.variants.objectives.tasks.map(definition),definitions);
 const old=fresh();old.variants.objectives.tasks=[3,6,10].map((target,id)=>({id,type:'stars',target,deadline:[12,20,null][id],firstRound:null,claims:[null,null],pending:[null,null]}));
 assert(validVariantState(old));const legacyBefore=JSON.stringify(old);assert.match(objectivesHTML(old),/10 Sterne/);variantHelpHTML(old,{only:'objectives'});assert.equal(JSON.stringify(old),legacyBefore);assert(validVariantState(JSON.parse(legacyBefore)));
});

test('Every catalog target measures its actual board criterion and respects its inclusive deadline and ties',()=>{
 for(const boardId of ['classic','river','mosaic'])for(const entry of OBJECTIVE_POOL){
  const g=enableVariants(createGame(['A','B'],'computer',[],{boardId}),{objectives:true},seeded(6));g.round=entry.deadline??30;
  const t={id:0,...entry,firstRound:null,claims:[null,null],pending:[null,null]};g.variants.objectives.tasks[0]=t;
  const board=boardFor(g),cells=entry.type==='columns'?Array.from({length:entry.target*7},(_,i)=>Math.floor(i/7)+i%7*15):entry.type==='stars'?board.stars.slice(0,entry.target):board.cells.flatMap((c,i)=>c===entry.color?[i]:[]).slice(0,entry.target);
  for(let pid=0;pid<2;pid++){cells.forEach(i=>g.players[pid].marks[i]=true);assert.equal(objectiveProgress(g,pid,t),entry.target);}
  const expired=structuredClone(g);if(entry.deadline!==null){expired.round=entry.deadline+1;noteVariantMove(expired,0,[],{});assert.equal(expired.variants.objectives.tasks[0].pending[0],null);}
  for(let pid=0;pid<2;pid++)noteVariantMove(g,pid,[],{});
  assert.deepEqual(t.pending,[g.round,g.round]);settleVariantObjectives(g);assert.deepEqual(t.claims,[g.round,g.round]);assert.equal(t.firstRound,g.round);assert(objectivePoints(g,0)>=5);assert(objectivePoints(g,1)>=5);
 }
});

test('Setup and help expose all 40 real catalog entries while showing selected goals separately',()=>{
 const g=fresh(),help=variantHelpHTML(g,{only:'objectives'});
 assert.match(variantSetupHTML(g),/Drei zufällige Ziele aus 40/);assert.match(help,/Alle 40 Aufträge ansehen/);assert.equal((help.match(/<li>/g)||[]).length,40);
 for(const color of ['Grün','Gelb','Blau','Pink','Orange'])assert(help.includes('Felder in '+color));assert.match(help,/Laufende Partien behalten ihre bisherigen Aufträge/);
 assert.equal((objectivesHTML(g).match(/class="objective /g)||[]).length,3);
});
