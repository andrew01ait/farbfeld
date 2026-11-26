import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,rollGame,applyMove,applyMineAttack,canAct,canUseMine,findMove,boardFor,score,COLORS,FIRST,LATER,validMineState} from '../public/game/engine.js';
import {chooseComputerMove} from '../public/game/computer.js';
import {enableComputerVariants,enableVariants,confirmHumanFleet,applyHiddenMineAction,validVariantState,abilityCharges} from '../public/game/variants.js';
import {projectGame} from '../public/game/game-info.js';
import {validBonusState} from '../public/game/bonus-fields.js';
const names=['battleship','discovery','objectives','shuffle'];
function seeded(seed){return max=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%max;};}

// This oracle derives awards from saved facts, without using any production
// points helper. It also checks that destructive actions preserve earned facts.
function checkScores(g,label,prior=[0,0],journal){
 const persistent=[],settled=g.phase==='roll'||g.status==='finished',completedRound=g.status==='finished'?g.round:g.round-1;
 // Independent chronological ledger: completion is recorded only at a round
 // boundary, removed by actual damage, and never taken from engine point fields.
 for(let pid=0;pid<g.players.length;pid++){
  const p=g.players[pid],board=boardFor(g,pid);
  for(let col=0;col<15;col++){const full=Array.from({length:7},(_,r)=>p.marks[r*15+col]).every(Boolean);if(!full)journal.columns[pid][col]=null;else if(settled&&journal.columns[pid][col]===null)journal.columns[pid][col]=completedRound;}
  for(const c of COLORS){const full=board.cells.every((color,i)=>color!==c||p.marks[i]);if(!full)journal.colors[pid][c]=null;else if(settled&&journal.colors[pid][c]===null)journal.colors[pid][c]=completedRound;}
 }
 const earliest=rounds=>{const claimed=rounds.filter(r=>r!==null);return claimed.length?Math.min(...claimed):null;};
 for(let pid=0;pid<g.players.length;pid++){
  const p=g.players[pid],board=boardFor(g,pid),b=g.variants?.battleship;
  const ships=b?b.fleets[1-pid].reduce((sum,ship)=>sum+(ship.every(i=>b.shots[pid][i]===2)?6-ship.length:0),0):0;
  const objectives=(g.variants?.objectives?.tasks||[]).reduce((sum,t)=>{const own=t.claims[pid];return sum+(own===null?0:own===Math.min(...t.claims.filter(r=>r!==null))?5:2);},0);
  const found=(g.bonuses?.fields||[]).filter(f=>f.claim?.winners.includes(pid)).length;
  const bonus=found*2+(g.bonuses?.hunt?.schema===1&&g.bonuses.hunt.chainBonus!==false&&found===3?3:0);
  const expectedColumns=Array.from({length:15},(_,col)=>{const own=journal.columns[pid][col],first=earliest(journal.columns.map(a=>a[col]));assert.equal(g.columnClaims[col],first,label+' independent column claim');return own===null?null:own===first?FIRST[col]:LATER[col];});
  const expectedColors=Object.fromEntries(COLORS.map(c=>{const own=journal.colors[pid][c],first=earliest(journal.colors.map(a=>a[c]));assert.equal(g.colorClaims[c],first,label+' independent color claim');return [c,own===null?null:own===first?5:3];}));
  assert.deepEqual(p.columns,expectedColumns,label+' independently scored columns');assert.deepEqual(p.colors,expectedColors,label+' independently scored colors');
  const columns=expectedColumns.reduce((sum,n)=>sum+(n??0),0),colors=Object.values(expectedColors).reduce((sum,n)=>sum+(n??0),0),open=board.stars.filter(i=>!p.marks[i]).length,cost=5*(g.mines?.blasts??[]).filter(blast=>blast.by===pid).length;
  const actual=score(p,g);assert.equal(actual.total,columns+colors+p.jokers-2*open-cost+bonus+ships+objectives,label+' total for '+pid);assert.equal(actual.shipBonus??0,ships,label+' ships');assert.equal(actual.objectiveBonus??0,objectives,label+' objectives');assert.equal(actual.bonus??0,bonus,label+' bonus');assert.equal(actual.stars,open,label+' stars');assert.equal(actual.mineCost??0,cost,label+' mine cost');
  persistent[pid]=ships+objectives+bonus;assert.ok(persistent[pid]>=prior[pid],label+' permanent rewards must never regress');assert.ok(ships<=15&&objectives<=15&&bonus<=(g.bonuses?.hunt?.schema===1&&g.bonuses.hunt.chainBonus!==false?9:6),label+' reward caps');

 }
 assert.ok(validVariantState(g)&&validMineState(g)&&validBonusState(g),label+' valid saved state');return persistent;
}

test('256 complete feature combinations: four variants × airstrikes × hidden mines × bonus fields × hidden points',()=>{
 let totalMoves=0,mineAttacks=0,mixes=0,hiddenDetonations=0;
 for(let mask=0;mask<16;mask++)for(const mines of [false,true])for(const bonusFields of [false,true])for(const hiddenScores of [false,true])for(const hiddenMines of [false,true]){
  const boardId=hiddenMines?['classic','river','mosaic','random'][(mask+Number(mines)+Number(bonusFields)+Number(hiddenScores))%4]:'classic',label=JSON.stringify({mask,mines,bonusFields,hiddenScores,hiddenMines,boardId}),rng=seeded(4000+mask*17+Number(mines)*7+Number(bonusFields)*3),options=Object.fromEntries(names.map((n,i)=>[n,!!(mask&1<<i)]));
  let g=enableComputerVariants({...createGame(['Du','Computer'],'computer',[],{mines,bonusFields,hiddenScores,boardId}),computerDifficulty:'medium'},{...options,hiddenMines},rng);
  if(bonusFields)g.bonuses.fields.forEach((f,i)=>f.index=[7,22,37][i]);
  if(options.battleship)g=confirmHumanFleet(g);
  if(hiddenMines)g=applyHiddenMineAction(g,0,{kind:'ready'});
  const journal={columns:[Array(15).fill(null),Array(15).fill(null)],colors:[Object.fromEntries(COLORS.map(c=>[c,null])),Object.fromEntries(COLORS.map(c=>[c,null]))]};
  let steps=0,prior=checkScores(g,label,[0,0],journal),jokers=[8,8];
  while(g.status==='playing'&&steps++<1200){
   if(g.phase==='roll')g=rollGame(g,rng);
   else{
    const pid=g.submitted.includes(g.active)?1-g.active:g.active;assert.ok(canAct(g,pid),label+' turn');
    if(canUseMine(g,pid)){
     const target=g.players[1-pid].marks.findIndex(Boolean),before=structuredClone(g);g=applyMineAttack(g,pid,Math.max(0,target),rng);mineAttacks++;assert.equal(g.round,before.round,label+' mine is not a round');assert.deepEqual(g.variants,before.variants,label+' mine cannot change variant awards or colors');
    }else{
     const move=chooseComputerMove(g,pid)||{pass:true},before=structuredClone(g);
     if(!move.pass)jokers[pid]-=Number(g.dice.colors[move.ci]==='*'&&move.ability!=='color')+Number(g.dice.numbers[move.ni]==='?');
     g=applyMove(g,pid,move,rng);totalMoves++;
     if(g.variants?.mixing?.lastRound!==before.variants?.mixing?.lastRound){mixes++;for(let who=0;who<2;who++)for(let i=0;i<105;i++)if(before.players[who].marks[i]&&g.players[who].marks[i])assert.equal(boardFor(g,who).cells[i],boardFor(before,who).cells[i],label+' mixing preserves marked colors');}
    }
   }
   for(let who=0;who<2;who++)assert.equal(g.players[who].jokers,jokers[who],label+' exact joker budget');
   prior=checkScores(g,label,prior,journal);
   // Actual JSON round-trips at round boundaries, including after mixing.
   if(g.phase==='roll'){g=JSON.parse(JSON.stringify(g));assert.ok(validVariantState(g),label+' resume');}
  }
  assert.equal(g.status,'finished',label+' game ends');assert.equal(COLORS.some(c=>g.players[0].colors[c]!==null)||COLORS.some(c=>g.players[1].colors[c]!==null),true,label+' color progress');checkScores(g,label,prior,journal);hiddenDetonations+=g.variants?.hiddenMines?.blasts.length||0;
 }
 assert.ok(hiddenDetonations>100,'actual automatic mine detonations covered');
 assert.ok(totalMoves>5000,'broad move coverage');assert.ok(mineAttacks>20,'actual destructive attacks covered');assert.ok(mixes>100,'actual color changes covered');
});

// The same independent ledger covers human rooms, pass-and-play and direct
// authority states. Moves are selected only from each actor's projected view.
test('384 human scoring combinations include hidden mines, six-player groups and private views',()=>{
 let attacks=0,mixes=0,moves=0,abilities=0,detonations=0;
 for(const n of [2,6])for(let mask=0;mask<(n===2?16:8);mask++)for(const mines of [false,true])for(const bonusFields of [false,true])for(const hiddenScores of [false,true])for(const hiddenMines of [false,true]){
  const keys=n===2?names:names.slice(1),options={...Object.fromEntries(keys.map((key,i)=>[key,!!(mask&1<<i)])),hiddenMines},mode=['local','room','direct'][(mask+Number(mines)+Number(hiddenScores)+Number(hiddenMines))%3],rng=seeded(20000+n*17+mask*31),boardId=['classic','river','mosaic','random'][mask%4],label=JSON.stringify({n,mask,mines,bonusFields,hiddenScores,hiddenMines,mode,boardId});
  let g=enableVariants(createGame(Array.from({length:n},(_,i)=>'Person '+i),mode,[],{mines,bonusFields,hiddenScores,boardId}),options,rng);
  if(bonusFields)g.bonuses.fields.forEach((f,i)=>f.index=[7,22,37][i]);
  for(let pid=0;pid<n;pid++){
   if(options.battleship)g=confirmHumanFleet(g,pid);
   if(hiddenMines)g=applyHiddenMineAction(g,pid,{kind:'ready'});
  }
  const journal={columns:Array.from({length:n},()=>Array(15).fill(null)),colors:Array.from({length:n},()=>Object.fromEntries(COLORS.map(c=>[c,null])))},jokers=Array(n).fill(8);
  let prior=checkScores(g,label,Array(n).fill(0),journal),steps=0;
  while(g.status==='playing'&&steps++<1800){
   if(g.phase==='roll')g=rollGame(g,rng);
   else{
    const pid=[g.active,...g.players.map((_,i)=>i).filter(i=>i!==g.active)].find(i=>canAct(g,i)),view=projectGame(g,pid);assert.ok(Number.isInteger(pid),label+' live actor');
    assert.ok(validVariantState(view,{allowProjection:true})&&validBonusState(view,{allowProjection:true}),label+' projection');assert.equal(score(view.players[pid],view).total,score(g.players[pid],g).total,label+' projected score');
    if(canUseMine(g,pid)){const victim=(pid+1)%n,target=hiddenScores?7:Math.max(0,g.players[victim].marks.findIndex(Boolean)),before=structuredClone(g.variants);g=applyMineAttack(g,pid,target,rng);assert.deepEqual(g.variants,before);attacks++;}
    else{
     let move=null;for(const type of ['extra','number','color'])if(abilityCharges(view,pid,type).length){move=findMove(view,pid,{ability:type,delta:1});if(move)break;}
     move??=findMove(view,pid)||{pass:true};if(move.ability)abilities++;
     if(!move.pass)jokers[pid]-=Number(g.dice.colors[move.ci]==='*'&&move.ability!=='color')+Number(g.dice.numbers[move.ni]==='?');
     const before=structuredClone(g);g=applyMove(g,pid,move,rng);moves++;
     if(g.variants?.mixing?.lastRound!==before.variants?.mixing?.lastRound){mixes++;for(let who=0;who<n;who++)for(let i=0;i<105;i++)if(before.players[who].marks[i]&&g.players[who].marks[i])assert.equal(boardFor(g,who).cells[i],boardFor(before,who).cells[i]);}
    }
   }
   g.players.forEach((p,i)=>assert.equal(p.jokers,jokers[i],label+' joker budget'));prior=checkScores(g,label,prior,journal);
   if(g.phase==='roll'){g=JSON.parse(JSON.stringify(g));assert.ok(validVariantState(g));}
  }
  assert.equal(g.status,'finished',label+' finish');checkScores(g,label,prior,journal);detonations+=g.variants?.hiddenMines?.blasts.length??0;
 }
 assert.ok(moves>10000);assert.ok(attacks>50);assert.ok(mixes>100);assert.ok(abilities>100);assert.ok(detonations>100);
});
