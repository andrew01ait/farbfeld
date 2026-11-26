import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,boardFor,score,COLORS} from '../public/game/engine.js';
import {generateRandomBoard} from '../public/game/boards.js';
import {enableVariants,shuffleFreeColors,validVariantState} from '../public/game/variants.js';
import {projectGame} from '../public/game/game-info.js';

const seeded=seed=>max=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%max;};
function fresh(board='classic',mode='computer',n=2){
 const g=createGame(Array.from({length:n},(_,i)=>'Person '+i),mode);
 g.boardId=board;if(board==='random')g.boardLayout=generateRandomBoard(seeded(906));
 return enableVariants(g,{shuffle:true},seeded(1));
}
// Independent observable geometry: only orthogonal, unmarked cells are playable
// together. A connection through an already marked cell must not count.
function regions(colors,marks){
 const remaining=new Set(colors.flatMap((_,i)=>marks[i]?[]:[i])),out=[];
 while(remaining.size){
  const start=remaining.values().next().value,region=[start];remaining.delete(start);
  for(let k=0;k<region.length;k++)for(const i of [region[k]-15,region[k]-1,region[k]+1,region[k]+15]){
   if(remaining.has(i)&&colors[i]===colors[start]&&Math.abs(i%15-region[k]%15)+Math.abs(Math.floor(i/15)-Math.floor(region[k]/15))===1){remaining.delete(i);region.push(i);}
  }
  out.push(region);
 }
 return out;
}
const counts=(colors,marks=[])=>COLORS.map(c=>colors.reduce((n,x,i)=>n+Number(x===c&&!marks[i]),0));
const largeCells=groups=>groups.reduce((n,g)=>n+(g.length>=3?g.length:0),0);
const singleCells=groups=>groups.filter(g=>g.length===1).length;
function permute(colors,rng){const out=[...colors];for(let i=out.length-1;i>0;i--){const j=rng(i+1);[out[i],out[j]]=[out[j],out[i]];}return out;}
function checkSheet(before,after,pid){
 const old=boardFor(before,pid).cells,next=boardFor(after,pid).cells,marks=before.players[pid].marks,a=regions(old,marks),b=regions(next,marks);
 assert.deepEqual(counts(next),[21,21,21,21,21]);
 assert.deepEqual(counts(next,marks),counts(old,marks),'exact remaining budget for every colour');
 old.forEach((c,i)=>{if(marks[i])assert.equal(next[i],c,'marked colour stays fixed');});
 for(const group of a)assert.ok(group.every(i=>next[i]===next[group[0]]),'a playable group must not break into single cells');
 assert.ok(largeCells(b)>=largeCells(a),'retain cells in groups of three or more');
 assert.ok(singleCells(b)<=singleCells(a),'do not create additional isolated free cells');
 assert.ok(Math.max(0,...b.map(g=>g.length))<=Math.max(6,...a.map(g=>g.length)),'no new oversized region');
 assert.deepEqual(after.variants.mixing.changed[pid],old.flatMap((c,i)=>c!==next[i]?[i]:[]),'animation uses precisely the changed coordinates');
 assert.deepEqual(score(after.players[pid],after),score(before.players[pid],before),'mixing alone changes no score component');
 assert.deepEqual(after.players[pid],before.players[pid]);
}

test('Grouped mixing preserves larger playable regions, exact colours and points on all four boards with different marked holes',()=>{
 let changed=0;
 for(const board of ['classic','river','mosaic','random'])for(const filled of [0,250,500,800])for(let seed=0;seed<12;seed++){
  const g=fresh(board),rng=seeded(2026+seed*97);g.round=5;
  for(const p of g.players)p.marks=p.marks.map(()=>rng(1000)<filled);
  const before=structuredClone(g);shuffleFreeColors(g,rng);
  for(let pid=0;pid<2;pid++){
   checkSheet(before,g,pid);changed+=g.variants.mixing.changed[pid].length;
   if(filled===0){const groups=regions(boardFor(g,pid).cells,g.players[pid].marks);assert.ok(largeCells(groups)>=90);assert.ok(groups.filter(a=>a.length>=4).length>=10);assert.ok(g.variants.mixing.changed[pid].length>=10,'still actually mixes the board');}
  }
  assert.ok(validVariantState(JSON.parse(JSON.stringify(g))));
 }
 assert.ok(changed>10000,'many actual colour changes across 384 individual sheets');
});

test('Existing scattered saves can form larger groups again without sacrificing their remaining connected groups',()=>{
 let oldSingles=0,newSingles=0,oldLarge=0,newLarge=0;
 for(const board of ['classic','river','mosaic','random'])for(const filled of [0,250,500])for(let seed=0;seed<16;seed++){
  const g=fresh(board),rng=seeded(9000+seed*71);g.round=10;
  for(let pid=0;pid<2;pid++){g.variants.layouts[pid]=permute(g.variants.layouts[pid],rng);g.players[pid].marks=g.players[pid].marks.map(()=>rng(1000)<filled);}
  const before=structuredClone(g);shuffleFreeColors(g,rng);
  for(let pid=0;pid<2;pid++){
   checkSheet(before,g,pid);
   const a=regions(boardFor(before,pid).cells,g.players[pid].marks),b=regions(boardFor(g,pid).cells,g.players[pid].marks);
   oldSingles+=singleCells(a);newSingles+=singleCells(b);oldLarge+=largeCells(a);newLarge+=largeCells(b);
  }
 }
 assert.ok(newSingles<oldSingles*.35,'substantially fewer isolated cells over 384 scattered sheets');
 assert.ok(newLarge>oldLarge*1.5,'substantially more playable cells in larger groups');
});

test('Repeated five-round mixing stays deterministic after JSON resume and across every supported authority mode',()=>{
 for(const mode of ['computer','local','direct','room']){
  let g=fresh('mosaic',mode,mode==='computer'?2:6),restored=JSON.parse(JSON.stringify(g)),r1=seeded(77),r2=seeded(77);
  for(let round=5;round<=40;round+=5){g.round=restored.round=round;const before=structuredClone(g);shuffleFreeColors(g,r1);shuffleFreeColors(restored,r2);assert.deepEqual(restored,g);for(let pid=0;pid<g.players.length;pid++)checkSheet(before,g,pid);restored=JSON.parse(JSON.stringify(restored));}
  assert.ok(validVariantState(g));
 }
});

test('Isolated holes, one-colour leftovers, full sheets and oversized legacy groups remain valid and bounded',()=>{
 const isolated=Array.from({length:105},(_,i)=>i).filter(i=>Math.floor(i/15)%2===0&&i%15%2===0);
 for(const free of [[],[7],[0,1],isolated]){
  const g=fresh();g.round=5;g.players.forEach(p=>p.marks=p.marks.map((_,i)=>!free.includes(i)));const before=structuredClone(g);let calls=0;
  shuffleFreeColors(g,()=>{calls++;return 0;});assert.ok(calls<=720);
  for(let pid=0;pid<2;pid++)checkSheet(before,g,pid);
  if(free.length<=2)assert.equal(calls,0,'no randomness when colours cannot change');
  else{assert.equal(regions(boardFor(g,0).cells,g.players[0].marks).length,free.length,'geometrically isolated holes may stay single');assert.ok(g.variants.mixing.changed[0].length>0);}
 }
 const g=fresh();g.round=5;g.variants.layouts=g.players.map(()=>COLORS.flatMap(c=>Array(21).fill(c)));const before=structuredClone(g);
 shuffleFreeColors(g,()=>{throw Error('legacy regions cannot be exchanged intact');});
 assert.deepEqual(g.variants.layouts,before.variants.layouts);for(let pid=0;pid<2;pid++)checkSheet(before,g,pid);
 for(const rng of [()=>-1,max=>max,()=>NaN,()=>.5]){const invalid=fresh();invalid.round=5;assert.throws(()=>shuffleFreeColors(invalid,rng),/Zufallswert/);}
});

test('Only an active scheduled authority mixes: projections, departed sheets, repeat calls and finished games do not draw',()=>{
 const noDraw=()=>{throw Error('unexpected random draw');};
 for(const change of [g=>g.round=4,g=>g.status='finished',g=>g.variants.mixing.lastRound=5]){const g=fresh();g.round=5;change(g);const before=structuredClone(g);shuffleFreeColors(g,noDraw);assert.deepEqual(g,before);}
 const g=fresh('river','room',6);g.round=5;g.hiddenScores=true;const view=projectGame(g,5),projected=structuredClone(view);shuffleFreeColors(view,noDraw);assert.deepEqual(view,projected);
 g.players[3].left=true;const departed=[...g.variants.layouts[3]];let calls=0;const rng=seeded(99);shuffleFreeColors(g,max=>{calls++;return rng(max);});assert.ok(calls<=5*360);assert.deepEqual(g.variants.layouts[3],departed);assert.deepEqual(g.variants.mixing.changed[3],[]);
 const after=structuredClone(g);shuffleFreeColors(g,noDraw);assert.deepEqual(g,after);
});
