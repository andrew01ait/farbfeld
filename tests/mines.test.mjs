import test from 'node:test';
import assert from 'node:assert/strict';
import {boardFor,COLORS,FIRST,LATER,canAct,applyMove,finishRound,rollGame,score,rankings,enableMines,minesEnabled,validMineState,blastNeighbors,canUseMine,applyMineAttack,mineTargetView,chooseComputerMineTarget,mineCharges} from '../public/game/engine.js';
import {BOARDS} from '../public/game/boards.js';
import {createComputerGame,stepComputer} from '../public/game/computer.js';
import {createGame,neighbors,findMove} from '../public/game/engine.js';
import {projectGame,scoreBreakdown} from '../public/game/game-info.js';
import {mineSetupHtml,mineControlsHtml,mineHelpHtml,mineTargetHtml,mineDamage,playMineBlast,MINE_ANIMATION_MS} from '../public/game/mine-ui.js';
import {GAME_BANNER_MS} from '../public/game/variant-ui.js';

function choosing({hidden=false,board='classic',actor=0}={}){
 const g=createComputerGame(hidden,board,'easy',true);g.phase='choose';g.active=actor;g.dice={colors:['g','b','o'],numbers:[1,2,3]};return g;
}
function armed(options){const g=choosing(options);g.mines.unlocked=[true,true];return g;}
function valuableTarget(board='classic'){
 const g=createComputerGame(false,board,'easy',true),layout=boardFor(g),p=g.players[1];
 const target=layout.cells.findIndex((c,i)=>c==='g'&&i>=15&&i<90&&i%15>0&&i%15<14);
 layout.cells.forEach((color,i)=>{if(color==='g'||i%15===target%15||blastNeighbors(target).includes(i))p.marks[i]=true;});
 finishRound(g);g.active=0;g.phase='choose';g.dice={colors:['g','b','o'],numbers:[1,2,3]};
 return {g,target};
}
test('Mines are selectable only before multiplayer games; legacy saves stay standard',()=>{
 for(const board of BOARDS.map(board=>board.id)){
  assert.equal(minesEnabled(createComputerGame(false,board)),false);
  assert(minesEnabled(createComputerGame(false,board,'hard',true)));
 }
 assert(minesEnabled(enableMines(createGame(['A','B'],'local'))));
 assert(minesEnabled(enableMines(createGame(['A','B'],'room'))));assert.throws(()=>enableMines(createGame(['Solo'],'solo')),/zwei bis sechs/);
 assert.throws(()=>enableMines(rollGame(createComputerGame())),/neuen Partie/);
 const old=createComputerGame();assert(validMineState(old));assert.equal(score(old.players[0],old).mineCost,undefined);
 assert.match(mineSetupHtml(),/id="mine-enabled"/);assert(!mineSetupHtml().includes(' checked'));assert(mineSetupHtml(true).includes(' checked'));
});
test('A colour completion unlocks the opponent only after shared round scoring',()=>{
 let g=choosing();const board=boardFor(g).cells;
 const target=board.findIndex((color,i)=>color==='g'&&neighbors(i).some(j=>board[j]==='g'));
 board.forEach((color,i)=>{g.players[0].marks[i]=color==='g'&&i!==target;});
 g=applyMove(g,0,{ci:0,ni:0,cells:[target]});assert.deepEqual(g.mines.unlocked,[false,false]);
 g=applyMove(g,1,{pass:true});assert.deepEqual(g.mines.unlocked,[false,true]);assert.equal(g.players[0].colors.g,5);
 assert.equal(g.players[0].jokers,8);assert.equal(g.mines.used[1],false);
});

test('Seventy confirmed fields unlock one independent airstrike for each active opponent',()=>{
 const target=52;
 for(const cells of [68,69]){
  const game=createGame(['A','B','C','D'],'room',[],{mines:true,hiddenScores:true});
  game.phase='choose';game.active=1;game.round=4;
  const board=boardFor(game,1).cells;
  game.dice={colors:[board[target],'g','o'],numbers:[1,2,3]};
  const spread=COLORS.flatMap(color=>board.flatMap((c,i)=>c===color&&i!==target?[i]:[]).slice(0,14)).slice(0,cells);
  for(const i of spread)game.players[1].marks[i]=true;
  game.players[3].left=true;
  assert(!canUseMine(game,0));
  const next=applyMove(game,1,{ci:0,ni:0,cells:[target]},()=>0);
  assert.deepEqual(next.mines.coverage.unlocked,cells===69?[true,false,true,false]:[false,false,false,false]);
  assert.deepEqual(next.mines.unlocked,[false,false,false,false]);
  const view=projectGame(next,0);
  assert.deepEqual(view.mines.coverage.unlocked,[cells===69,false,false,false]);
  if(cells===69){
   const hit=applyMineAttack(next,0,target,()=>0);
   assert(hit.players[1].marks.filter(Boolean).length<70);
   assert.equal(hit.mines.coverage.used[0],true);
   assert.equal(hit.mines.unlocked[0],false);
   assert.equal(hit.mines.coverage.unlocked[2],true);
   assert.equal(hit.mines.lastBlast.charge,'coverage');
   assert(!canUseMine(hit,0));
  }
 }
});

test('The two charges survive reload, cost five each and cannot be spent by stale retries',()=>{
 let game=armed();
 game.mines.coverage.unlocked[0]=true;
 game.players[1].marks[52]=true;
 game=applyMineAttack(game,0,52,()=>0,'color');
 assert.equal(score(game.players[0],game).mineCost,5);
 assert.throws(()=>applyMineAttack(game,0,52,()=>0,'color'),/nicht mehr verfügbar/);
 game=JSON.parse(JSON.stringify(game));
 assert(validMineState(game)&&canUseMine(game,0));
 game=applyMineAttack(game,0,52,()=>0,'coverage');
 assert.equal(score(game.players[0],game).mineCost,10);
 assert.deepEqual(mineCharges(game,0).map(charge=>charge.used),[true,true]);
 assert.deepEqual(game.mines.blasts.map(blast=>blast.charge??'color'),['color','coverage']);
 assert(validMineState(game));assert(!canUseMine(game,0));
 const duplicate=structuredClone(game);delete duplicate.mines.blasts[1].charge;delete duplicate.mines.lastBlast.charge;
 assert(!validMineState(duplicate));
 const legacy=createGame(['A','B'],'local',[],{mines:true,mineCoverage:false});
 assert.equal(legacy.mines.schema,1);assert(validMineState(legacy));
 assert.deepEqual(mineCharges(legacy,0).map(charge=>charge.reason),['color']);
});
test('A hit removes its centre and three to five occupied eight-way neighbours without touching normal-turn state',()=>{
 for(const extra of [3,4,5]){
  const g=armed();g.players[1].marks[52]=true;blastNeighbors(52).forEach(i=>g.players[1].marks[i]=true);
  const before=structuredClone(g),next=applyMineAttack(g,0,52,max=>max===3?extra-3:0);
  assert.equal(next.mines.lastBlast.cells.length,1+extra);assert(next.mines.lastBlast.cells.includes(52));
  assert(next.mines.lastBlast.cells.every(i=>i===52||blastNeighbors(52).includes(i)));assert.equal(new Set(next.mines.lastBlast.cells).size,1+extra);
  assert.deepEqual(g,before);assert.deepEqual(next.dice,g.dice);assert.deepEqual(next.submitted,g.submitted);assert.equal(next.round,g.round);assert.equal(next.active,g.active);assert.equal(next.phase,g.phase);assert.equal(next.turn,g.turn+1);
  assert(canAct(next,0));assert.equal(score(next.players[0],next).total,score(g.players[0],g).total-5);assert.equal(next.players[0].jokers,g.players[0].jokers);
 }
 assert.deepEqual(blastNeighbors(0),[1,15,16]);assert(!blastNeighbors(14).includes(15));
 const corner=armed();[0,...blastNeighbors(0)].forEach(i=>corner.players[1].marks[i]=true);
 assert.equal(applyMineAttack(corner,0,0,max=>max-1).mines.lastBlast.cells.length,4);
});
test('An empty centre is a complete miss even with eight occupied neighbours; it still costs five and spends the mine',()=>{
 const g=armed({hidden:true});blastNeighbors(52).forEach(i=>g.players[1].marks[i]=true);
 const victim=structuredClone(g.players[1]),before=score(g.players[0],g).total;
 const next=applyMineAttack(g,0,52,()=>{throw Error('a miss must not draw a blast');});
 assert.deepEqual(next.players[1],victim);assert.deepEqual(next.mines.lastBlast.cells,[]);assert.deepEqual(next.announcements,g.announcements);
 assert.equal(score(next.players[0],next).total,before-5);assert.equal(next.mines.used[0],true);assert(validMineState(next));assert(!canUseMine(next,0));
});
test('Destroying a scored column/colour removes its points immediately, restores star penalties and keeps jokers spent',()=>{
 const {g,target}=valuableTarget(),p=g.players[1],col=target%15,before=score(p,g);
 assert.equal(p.colors.g,5);assert.equal(p.columns[col],FIRST[col]);assert(canUseMine(g,0));p.jokers=3;
 const next=applyMineAttack(g,0,target,()=>0),after=score(next.players[1],next);
 assert.equal(next.players[1].colors.g,null);assert.equal(next.players[1].columns[col],null);assert.equal(next.players[1].jokers,3);
 assert(after.colors<before.colors);assert(after.columns<before.columns);assert(after.stars>=before.stars);
 assert.equal(scoreBreakdown(next,0,0).mineCost,5);assert.equal(rankings(next).find(row=>row.index===0).mineCost,5);
 const restored=JSON.parse(JSON.stringify(next));assert(validMineState(restored));assert.equal(score(restored.players[0],restored).mineCost,5);
});
test('A mine promotes the remaining completed column and colour, including the attacker total minus its fee',()=>{
 const {g,target}=valuableTarget(),col=target%15,layout=boardFor(g);
 layout.cells.forEach((color,i)=>{if(color==='g'||i%15===col)g.players[0].marks[i]=true;});finishRound(g);
 g.active=0;g.phase='choose';g.dice={colors:['g','b','o'],numbers:[1,2,3]};
 assert.equal(g.players[0].columns[col],LATER[col]);assert.equal(g.players[0].colors.g,3);
 const before=score(g.players[0],g).total,next=applyMineAttack(g,0,target,()=>0);
 assert.equal(next.players[0].columns[col],FIRST[col]);assert.equal(next.players[0].colors.g,5);
 assert.equal(score(next.players[0],next).total,before+(FIRST[col]-LATER[col])+2-5);
 assert.equal(next.players[1].columns[col],null);assert.equal(next.players[1].colors.g,null);
 assert.equal(next.announcements.find(e=>e.pid===0&&e.color==='g').points,5);
 next.mines.lastBlast.cells.forEach(i=>next.players[1].marks[i]=true);finishRound(next);
 assert.equal(next.players[1].columns[col],LATER[col]);assert.equal(next.players[1].colors.g,3);
 assert.equal(next.players[0].columns[col],FIRST[col]);assert.equal(next.players[0].colors.g,5);
 assert.equal(next.mines.used[0],true);assert.equal(next.mines.unlocked[0],true);
 const saved=JSON.parse(JSON.stringify(next));assert(validMineState(saved));assert.equal(score(saved.players[0],saved).mineCost,5);
});
test('If both holders lose a bonus, it is open again; the next completion gets full points',()=>{
 const {g,target}=valuableTarget(),col=target%15,layout=boardFor(g);
 layout.cells.forEach((color,i)=>{if(color==='g'||i%15===col)g.players[0].marks[i]=true;});finishRound(g);
 g.active=0;g.phase='choose';g.dice={colors:['g','b','o'],numbers:[1,2,3]};
 let next=applyMineAttack(g,0,target,()=>0);const firstBlast=[...next.mines.lastBlast.cells];
 next=applyMove(next,0,{pass:true});assert(canUseMine(next,1));next=applyMineAttack(next,1,target,()=>0);const secondBlast=[...next.mines.lastBlast.cells];
 assert.equal(next.columnClaims[col],null);assert.equal(next.colorClaims.g,null);
 secondBlast.forEach(i=>next.players[0].marks[i]=true);finishRound(next);
 assert.equal(next.players[0].columns[col],FIRST[col]);assert.equal(next.players[0].colors.g,5);
 firstBlast.forEach(i=>next.players[1].marks[i]=true);finishRound(next);
 assert.equal(next.players[1].columns[col],LATER[col]);assert.equal(next.players[1].colors.g,3);
 assert.deepEqual(next.mines.used,[true,true]);
});
test('Simultaneous first bonuses become a sole first bonus after damage; re-completion is later',()=>{
 const g=choosing(),target=16,col=target%15,layout=boardFor(g);
 for(const p of g.players)layout.cells.forEach((color,i)=>{if(color==='g'||i%15===col)p.marks[i]=true;});finishRound(g);
 assert(g.players.every(p=>p.columns[col]===FIRST[col]&&p.colors.g===5));
 g.active=0;g.phase='choose';g.dice={colors:['g','b','o'],numbers:[1,2,3]};const next=applyMineAttack(g,0,target,()=>0);
 assert.equal(next.players[0].columns[col],FIRST[col]);assert.equal(next.players[0].colors.g,5);
 next.mines.lastBlast.cells.forEach(i=>next.players[1].marks[i]=true);finishRound(next);
 assert.equal(next.players[1].columns[col],LATER[col]);assert.equal(next.players[1].colors.g,3);
});
test('Bonus transfer does not award unscored marks early, and a miss transfers nothing',()=>{
 const g=armed(),col=1;for(let row=0;row<7;row++)g.players[0].marks[row*15+col]=true;
 g.players[1].marks[52]=true;const next=applyMineAttack(g,0,52,()=>0);assert.equal(next.players[0].columns[col],null);
 const {g:both}=valuableTarget(),empty=both.players[1].marks.findIndex(mark=>!mark);
 const miss=applyMineAttack(both,0,empty,()=>{throw Error('no draw on miss');});
 assert.deepEqual(miss.players[1],both.players[1]);assert.deepEqual(miss.columnClaims,both.columnClaims);assert.deepEqual(miss.colorClaims,both.colorClaims);
});
test('An attack is an extra own-turn action, is never usable twice, and cannot undo a finished match',()=>{
 const g=armed(),before=JSON.stringify(g);assert.throws(()=>applyMineAttack(g,1,52));
 for(const target of [-1,105,1.5,null,'52'])assert.throws(()=>applyMineAttack(g,0,target));
 assert.equal(JSON.stringify(g),before);
 const used=applyMineAttack(g,0,52,()=>0);assert.throws(()=>applyMineAttack(used,0,52));
 const end=armed();boardFor(end).cells.forEach((color,i)=>end.players[1].marks[i]=['g','y'].includes(color));finishRound(end);
 assert.equal(end.status,'finished');assert(!canUseMine(end,0));assert.throws(()=>applyMineAttack(end,0,52));
});
test('Hidden targeting and its HTML are identical for different private opponent sheets',()=>{
 const a=armed({hidden:true}),b=structuredClone(a);a.players[1].marks.fill(true);b.players[1].marks.fill(false);
 assert.deepEqual(mineTargetView(a,0),mineTargetView(b,0));assert.equal(mineTargetHtml(a,52),mineTargetHtml(b,52));
 assert(!mineTargetHtml(a,52).includes('mine-marked'));assert(!mineTargetHtml(a,52).includes('angekreuzt'));assert(!mineTargetHtml(a,52).includes('×'));
 a.hiddenScores=false;assert(mineTargetHtml(a,52).includes('mine-marked'));
 assert.match(mineTargetHtml(b),/<b>Leer:<\/b> kein Schaden/);
});
test('A hidden computer chooses blindly without reading human marks, bonus totals or jokers',()=>{
 const g=armed({hidden:true,actor:1});
 for(const key of ['marks','columns','colors','jokers'])Object.defineProperty(g.players[0],key,{get(){throw Error('hidden data read: '+key);}});
 const calls=[];assert.equal(chooseComputerMineTarget(g,max=>{calls.push(max);return 17;}),17);assert.deepEqual(calls,[105]);
});
test('An open-board computer never mistakes occupied neighbours for a hit on an empty centre',()=>{
 const g=armed({actor:1});blastNeighbors(52).forEach(i=>g.players[0].marks[i]=true);
 const target=chooseComputerMineTarget(g);assert(g.players[0].marks[target]);assert.notEqual(target,52);
});
test('The computer spends its one mine as a separate saveable step, then makes its normal move',()=>{
 let g=armed({hidden:true,actor:1});g.players[0].marks[52]=true;blastNeighbors(52).forEach(i=>g.players[0].marks[i]=true);
 const attacked=stepComputer(g,max=>max===105?52:0);
 assert.equal(attacked.mines.used[1],true);assert.equal(attacked.mines.lastBlast.by,1);assert.deepEqual(attacked.submitted,[]);assert(canAct(attacked,1));
 const moved=stepComputer(attacked,()=>0);assert(moved.submitted.includes(1));assert.equal(moved.mines.used[1],true);assert.equal(moved.mines.lastBlast.turn,attacked.mines.lastBlast.turn);
});
test('Malformed mine metadata is rejected and a locked game never renders a usable attack button',()=>{
 const g=choosing();assert(validMineState(g));assert(!mineControlsHtml(g).includes('data-action="mine-aim"'));
 const bad=structuredClone(g);bad.mines.used[0]=true;assert(!validMineState(bad));
 const network=structuredClone(g);network.mode='solo';assert(!validMineState(network));assert.equal(mineControlsHtml(network),'');
 g.mines.unlocked[0]=true;assert(!mineControlsHtml(g).includes(' disabled'));
});

test('Airstrike help explains the unlocks supported by the actual match',()=>{
 const modern=createGame(['Du','Gegner'],'room',[],{mines:true,variants:{hiddenMines:true}});
 const currentHelp=mineHelpHtml(modern);
 assert.match(currentHelp,/bis zu zwei Luftangriffe/);
 assert.match(currentHelp,/mindestens 70 von 105 Feldern/);
 assert.match(currentHelp,/Ausgelöste Minen werden vorher ausgewertet/);
 const legacy=createGame(['Du','Gegner'],'room',[],{mines:true,mineCoverage:false});
 const legacyHelp=mineHelpHtml(legacy);
 assert.match(legacyHelp,/jede Person einen Luftangriff/);
 assert.doesNotMatch(legacyHelp,/70|bis zu zwei/);
 for(const help of [currentHelp,legacyHelp]){
  assert.match(help,/gemeinsame[nr]? Wertung des Wurfs/);
  assert.match(help,/Jeder Angriff kostet <b>5 Punkte/);
 }
});

test('Complete opted-in games on every board keep legal moves, bounded attacks, valid saves and final scoring',()=>{
 let seed=8127;const rng=max=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return Math.floor(seed/4294967296*max);};
 for(const board of BOARDS.map(b=>b.id))for(const hidden of [false,true]){
  let g=createComputerGame(hidden,board,'easy',true),steps=0;const spent=[0,0];
  while(g.status==='playing'&&steps++<1500){
   const previous=g;
   if(g.active===1&&g.phase==='roll'||canAct(g,1))g=stepComputer(g,rng);
   else if(g.phase==='roll')g=rollGame(g,rng);
   else if(canUseMine(g,0))g=applyMineAttack(g,0,rng(105),rng);
   else g=applyMove(g,0,findMove(g,0)??{pass:true});
   if(g.mines.lastBlast?.turn!==previous.mines.lastBlast?.turn)spent[g.mines.lastBlast.by]++;
   assert(validMineState(g));assert(g.players.every(p=>p.jokers>=0));
  }
  assert.equal(g.status,'finished',board);assert(spent.every(n=>n<=2));
  g.players.forEach((p,pid)=>{const s=score(p,g);assert.equal(s.mineCost,spent[pid]*5);assert.equal(s.total,s.columns+s.colors+s.jokers-s.penalty-s.mineCost);});
 }
});

test('Damage markers last through the next full round, survive reload and never reveal a hidden opponent',()=>{
 const g=armed();g.players[1].marks[52]=true;blastNeighbors(52).forEach(i=>g.players[1].marks[i]=true);const next=applyMineAttack(g,0,52,()=>0),round=next.round;
 const visible=mineDamage(next,1,0);assert.deepEqual(visible.cells,next.mines.lastBlast.cells);assert.equal(visible.airstrike.untilRound,round+1);assert.equal(mineDamage(next,0,0),null);
 const info=mineControlsHtml(next,{damage:visible.airstrike});assert.match(info,/Markiert bis Ende von Wurf \d/);assert.equal((info.match(new RegExp(visible.cells.length+' Kreuze entfernt','g'))??[]).length,1);
 const saved=JSON.parse(JSON.stringify(next));saved.round++;assert(validMineState(saved));assert(mineDamage(saved,1,0));saved.round++;assert.equal(mineDamage(saved,1,0),null);
 next.hiddenScores=true;assert.equal(mineDamage(next,1,0),null);assert(mineDamage(next,1,1));
 const old=structuredClone(next);delete old.mines.lastBlast.round;delete old.mines.blasts;assert(validMineState(old));assert.equal(mineDamage(old,1,1),null);
});
test('Both attacks retain their own one-round evidence even after the second explosion',()=>{
 let g=armed();g.players.forEach(p=>p.marks[52]=true);g=applyMineAttack(g,0,52,()=>0);g=applyMove(g,0,{pass:true});g=applyMineAttack(g,1,52,()=>0);
 assert(validMineState(g));assert.equal(g.mines.blasts.length,2);assert.deepEqual(mineDamage(g,0,0).cells,[52]);assert.deepEqual(mineDamage(g,1,0).cells,[52]);
 const bad=structuredClone(g);bad.mines.blasts[0].by=1;assert(!validMineState(bad));
 const miss=applyMineAttack(armed(),0,52,()=>0);assert.equal(mineDamage(miss,1,0),null);
});
test('A mine is visibly ready after unlock, remains emphasized after reload, then loses the ready state when spent',()=>{
 const g=choosing();assert(!mineControlsHtml(g).includes('mine-ready-badge'));g.mines.unlocked[0]=true;
 assert.match(mineControlsHtml(g,{highlight:true}),/mine-new/);assert.match(mineControlsHtml(g),/bereit – jetzt freigeschaltet/);assert.match(mineControlsHtml(JSON.parse(JSON.stringify(g))),/jetzt freigeschaltet/);
 const used=applyMineAttack(g,0,52,()=>0);assert(!mineControlsHtml(used).includes('mine-ready-badge'));
});
function effectEnvironment(reduced=false){
 const animations=[],created=[],queries=[],scrolled=[],timers=[];
 const node=()=>{const n={attributes:{},children:[],removed:false,setAttribute(k,v){this.attributes[k]=v;},remove(){this.removed=true;},append(child){this.children.push(child);},scrollIntoView(){scrolled.push(this);},animate(frames,options){animations.push({cell:this,frames,options});}};created.push(n);return n;};
 const board=node(),cellMap=new Map([52,53,68,84].map(i=>[i,node()]));
 const body=node(),document={body,createElement:node,querySelector(selector){queries.push(selector);if(selector==='[data-player-board="0"]')return board;const match=selector.match(/^\[data-player-board="0"\] \[data-i="(\d+)"\]$/);return match?cellMap.get(Number(match[1]))??null:null;},querySelectorAll(){return [];}};
 return {animations,created,queries,scrolled,timers,cellMap,body,environment:{document,matchMedia:()=>({matches:reduced}),setTimeout(fn,ms){timers.push({fn,ms});}}};
}
test('The animation preview uses its own board and notice area and can cancel a running blast',()=>{
 const fixture=effectEnvironment(),root=fixture.environment.document,cancelled=[];
 const environment={...fixture.environment,
  document:{createElement:root.createElement,querySelector(){throw Error('production board accessed');}},
  setTimeout(run,ms){fixture.timers.push({run,ms});return fixture.timers.length;},
  clearTimeout(timer){cancelled.push(timer);}
 };
 const stop=playMineBlast({by:1,target:52,targets:[{pid:0,cells:[52,53]}],root,noticeHost:fixture.body,scroll:false,messages:[{type:'bonus',title:'Schatz entdeckt',detail:'Du · +2'}]},environment);
 assert.equal(fixture.animations.length,2);assert.deepEqual(fixture.scrolled,[]);
 assert.match(fixture.body.children[0].innerHTML,/2 Kreuze entfernt/);
 assert.match(fixture.body.children[0].innerHTML,/Schatz entdeckt/);
 stop();assert.deepEqual(cancelled,[1,2]);assert(fixture.body.children[0].removed);
 assert(fixture.cellMap.get(52).children[0].removed);
});
test('The slower airstrike uses confirmed cells, with a banner that outlasts the effects',()=>{
 for(const reduced of [false,true]){
  const t=effectEnvironment(reduced);playMineBlast({by:1,target:52,targets:[{pid:0,cells:[52,53,68]}],ownPid:0,attacker:'A < B'},t.environment);
  assert.deepEqual(t.timers.map(timer=>timer.ms),reduced?[GAME_BANNER_MS]:[GAME_BANNER_MS,MINE_ANIMATION_MS]);assert.equal(GAME_BANNER_MS,6000);
  assert.equal(t.animations.length,reduced?0:3);assert.equal(t.cellMap.get(84).children.length,0,'older damage outside this attack does not replay');
  if(!reduced){assert.match(t.cellMap.get(52).children[0].innerHTML,/airstrike-flight/);assert.doesNotMatch(t.cellMap.get(53).children[0].innerHTML,/airstrike-flight/);assert.equal(t.animations[0].options.delay,1450);}else assert.equal(t.cellMap.get(52).children.length,0);
  assert.equal(t.body.children.length,1);assert.match(t.body.children[0].innerHTML,/Luftangriff von A &lt; B · H4/);assert.match(t.body.children[0].innerHTML,/3 Kreuze entfernt/);assert.equal(t.body.children[0].attributes.role,'status');
  assert.equal(t.scrolled[0],t.cellMap.get(52));
  for(const {cell} of t.animations)assert.ok([52,53,68].some(i=>t.cellMap.get(i)===cell));
  if(!reduced)t.timers[1].fn();assert.equal(t.body.children[0].removed,false);for(const cell of t.cellMap.values())assert.ok(cell.children.every(n=>n.removed));
  t.timers[0].fn();assert.ok(t.body.children[0].removed);
 }
});
test('The viewport reveals an off-screen hit before the effect and leaves an already visible area in place',()=>{
 for(const kind of ['hidden','airstrike']){
  for(const offscreen of [true,false]){
   const t=effectEnvironment(),{environment}=t,root=environment.document,anchor=t.cellMap.get(52),near=t.cellMap.get(53);
   const query=root.querySelector.bind(root),tray={getBoundingClientRect:()=>({top:322})};
   root.querySelector=selector=>selector==='.dice-card.choosing'?tray:query(selector);
   root.body.querySelector=()=>root.body.children.length?{getBoundingClientRect:()=>({bottom:92})}:null;
   environment.visualViewport={width:320,height:568};
   environment.getComputedStyle=()=>({position:'fixed'});
   anchor.closest=()=>({getBoundingClientRect:()=>({left:20,right:300})});
   anchor.style={scrollMargin:'2px'};
   const x=offscreen?518:100,y=offscreen?498:154,calls=[];
   anchor.getBoundingClientRect=()=>({left:x,right:x+32,top:y,bottom:y+32});
   near.getBoundingClientRect=()=>({left:x+32,right:x+64,top:y,bottom:y+32});
   anchor.scrollIntoView=options=>calls.push({options,margin:anchor.style.scrollMargin,effects:anchor.children.length});
   playMineBlast({kind,by:1,target:52,targets:[{pid:0,cells:[52,53]}]},environment);
   assert.deepEqual(calls,offscreen?[{options:{block:'center',inline:'center',behavior:'instant'},margin:'100px 32px 254px 0px',effects:0}]:[]);
   assert.equal(anchor.style.scrollMargin,'2px');
   assert.equal(anchor.children.length,1);
  }
 }
});
test('Hidden mine feedback cannot reveal or animate foreign damage, and a visible empty target has no removed crosses',()=>{
 let prior=null;
 for(const secretCells of [[],[52],[52,53,68]]){
  const t=effectEnvironment();playMineBlast({by:0,target:52,targets:[{pid:1,cells:secretCells}],ownPid:0,concealed:true},t.environment);
  const html=t.body.children[0].innerHTML;assert.match(html,/Ergebnis bleibt verdeckt/);assert.doesNotMatch(html,/Kreuz|kein Schaden/);assert.deepEqual(t.animations,[]);assert.ok(!t.queries.some(q=>q.includes('data-player-board="1"')));if(prior!==null)assert.equal(html,prior);prior=html;
 }
 const miss=effectEnvironment();playMineBlast({by:1,target:52,targets:[{pid:0,cells:[]}],ownPid:0},miss.environment);assert.equal(miss.animations.length,0);assert.match(miss.body.children[0].innerHTML,/Leeres Ziel · kein Schaden/);assert.equal(miss.cellMap.get(52).children.length,1);assert.match(miss.cellMap.get(52).children[0].className,/mine-impact-miss/);
});
test('Luftangriff targeting keeps coordinates and confirmation explicit, shows possible neighbours without promising random damage',()=>{
 const g=armed();g.players[1].marks[52]=true;const html=mineTargetHtml(g,52);
 assert.match(html,/Ziel H4/);assert.match(html,/H4 angreifen · −5 P/);assert.equal((html.match(/class="mine-cell[^"]*mine-near/g)||[]).length,8);assert.equal((html.match(/data-action="mine-target"/g)||[]).length,105);assert.match(html,/<details class="mine-rule-details"><summary>So wirkt der Angriff/);assert.doesNotMatch(html,/<details[^>]* open/);
 const empty=mineTargetHtml(g,0);assert.match(empty,/Leeres Ziel · kein Schaden/);assert.doesNotMatch(empty,/mine-near/);assert.match(mineTargetHtml(g),/data-action="mine-confirm" disabled/);
 const before=JSON.stringify(g);mineTargetHtml(g,52);assert.equal(JSON.stringify(g),before,'aiming is not an attack and costs nothing');
});

test('The mine card keeps a confirmed own target and outcome, without reading concealed damage',()=>{
 const empty=applyMineAttack(armed(),0,52,()=>0);assert.match(mineControlsHtml(empty),/Dein Angriff · H4/);assert.match(mineControlsHtml(empty),/Kein Treffer/);assert.match(mineControlsHtml(empty),/Wurf 1/);
 empty.hiddenScores=true;for(const blast of empty.mines.blasts)Object.defineProperty(blast,'targets',{get(){throw Error('concealed damage');}});
 assert.doesNotThrow(()=>mineControlsHtml(empty));assert.match(mineControlsHtml(empty),/Ergebnis verdeckt/);assert.doesNotMatch(mineControlsHtml(empty),/Kein Treffer|Kreuze entfernt/);
});
