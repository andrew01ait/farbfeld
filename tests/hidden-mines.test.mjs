import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,rollGame,applyMove,applyMineAttack,score,boardFor,blastNeighbors,canAct,canUseMine,damageBlasts,validMineState,leaveGame} from '../public/game/engine.js';
import {chooseComputerMove,needsComputerTurn,stepComputer} from '../public/game/computer.js';
import {enableComputerVariants,enableVariants,normalizeVariantOptions,hiddenMineCount,hiddenMinesEnabled,hiddenMinesPreparing,applyHiddenMineAction,confirmHumanFleet,variantsReady,validVariantState,shuffleFreeColors} from '../public/game/variants.js';
import {projectGame} from '../public/game/game-info.js';
import {cellVariantHTML,cellVariantLabel,variantSetupHTML,variantLobbyHTML,readVariantOptions,variantHelpHTML,GAME_BANNER_MS} from '../public/game/variant-ui.js';
import {hiddenMineSetupHtml,hiddenMineStatusHtml,hiddenMineReports,mineControlsHtml,mineDamage,mineEffect,playMineBlast,MINE_ANIMATION_MS} from '../public/game/mine-ui.js';
const all={battleship:true,discovery:true,objectives:true,shuffle:true};
const fleet=[[7],[22,23],[37,38,39],[52,53,54,55],[67,68,69,70,71]];
const seeded=seed=>max=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%max;};
function preparing({air=false,bonus=false,hidden=false,options={},board='classic'}={}){
 let g=enableComputerVariants(createGame(['Du','Computer'],'computer',[],{mines:air,bonusFields:bonus,hiddenScores:hidden,boardId:board}),{...options,hiddenMines:true},seeded(33));
 g.variants.hiddenMines.positions=[[103,104],[7,22]];
 if(options.battleship){g.variants.battleship.fleets=[structuredClone(fleet),structuredClone(fleet)];g=confirmHumanFleet(g);}
 return g;
}
const ready=options=>applyHiddenMineAction(preparing(options),0,{kind:'ready'});
function choosing(g,index=7,pid=0,count=1){g=structuredClone(g);g.active=pid;g.phase='choose';g.dice={colors:[boardFor(g,pid).cells[index],'*','*'],numbers:[count,'?','?']};return g;}
function shoot(g,index=7,pid=0,extra={}){return applyMove(choosing(g,index,pid),pid,{ci:0,ni:0,cells:[index],...extra},()=>0);}

test('Hidden mines have the agreed capacity in every supported new multiplayer game',()=>{
 for(const [n,count] of [[2,2],[3,2],[4,1],[5,1],[6,1]])assert.equal(hiddenMineCount(n),count);
 for(const n of [1,7,2.5,null,'2'])assert.throws(()=>hiddenMineCount(n));
 for(const mode of ['solo','local','room','direct'])assert.throws(()=>enableComputerVariants(createGame(['A','B'],mode),{hiddenMines:true},seeded(2)),/Computer/);
 assert.throws(()=>normalizeVariantOptions({hiddenMines:1}));
 for(const mode of ['room','local','direct'])for(const [n,count] of [[2,2],[3,2],[4,1],[5,1],[6,1]]){
  const g=createGame(Array(n).fill('Spieler'),mode,[],{variants:{hiddenMines:true}});
  assert.ok(hiddenMinesEnabled(g)&&validVariantState(g));assert.deepEqual(g.variants.hiddenMines.ready,Array(n).fill(false));assert.equal(g.variants.hiddenMines.positions.at(-1).length,count);
 }
 assert.equal(hiddenMinesEnabled(createGame(['A','B'],'computer')),false);
 assert.throws(()=>enableComputerVariants(rollGame(createGame(['A','B'],'computer'),seeded(1)),{hiddenMines:true},seeded(1)),/neuen Partie/);
 for(const board of ['classic','river','mosaic','random']){const g=preparing({board});assert.ok(validVariantState(g));assert.deepEqual(g.variants.hiddenMines.ready,[false,true]);assert.equal(g.mines,undefined);}
});

test('Secret placement is immutable, persists before confirmation and locks before the first roll',()=>{
 const g=preparing(),before=structuredClone(g);let next=applyHiddenMineAction(g,0,{kind:'place',slot:0,index:52});assert.deepEqual(g,before);assert.equal(next.variants.hiddenMines.positions[0][0],52);
 assert.throws(()=>applyHiddenMineAction(next,0,{kind:'place',slot:1,index:52}),/eigenes Feld/);
 for(const index of [-1,105,1.5])assert.throws(()=>applyHiddenMineAction(next,0,{kind:'place',slot:0,index}));
 assert.throws(()=>applyHiddenMineAction(next,1,{kind:'place',slot:0,index:52}),/vor Spielbeginn/);
 assert.throws(()=>rollGame(next),/Wurf/);assert.equal(canAct(choosing(next),0),false);assert.equal(needsComputerTurn(next),false);assert.equal(stepComputer(next),next);
 next=applyHiddenMineAction(next,0,{kind:'place',slot:0,index:7});assert.equal(next.variants.hiddenMines.positions[0][0],next.variants.hiddenMines.positions[1][0],'different owners may share a coordinate');
 next=JSON.parse(JSON.stringify(next));assert.ok(validVariantState(next));assert.ok(hiddenMinesPreparing(next));
 next=applyHiddenMineAction(next,0,{kind:'random'},seeded(9));assert.equal(new Set(next.variants.hiddenMines.positions[0]).size,2);assert.ok(validVariantState(next));
 next=applyHiddenMineAction(next,0,{kind:'ready'},()=>{throw Error('confirmation must not draw');});assert.ok(variantsReady(next));assert.equal(hiddenMinesPreparing(next),false);assert.ok(validVariantState(rollGame(next,seeded(3))));
 assert.throws(()=>applyHiddenMineAction(next,0,{kind:'random'},seeded(1)),/vor Spielbeginn/);
});

test('Both fleet and mine preparation must finish; neither confirmation bypasses the other',()=>{
 let g=enableVariants(createGame(['A','B'],'local'),{battleship:true,hiddenMines:true},seeded(4));
 assert.throws(()=>applyHiddenMineAction(g,0,{kind:'ready'}),/zuerst deine Flotte/);
 g=confirmHumanFleet(g,0);g=applyHiddenMineAction(g,0,{kind:'ready'});assert.deepEqual(g.variants.battleship.ready,[true,false]);assert.throws(()=>rollGame(g));
 g=confirmHumanFleet(g,1);assert.throws(()=>rollGame(g));g=applyHiddenMineAction(g,1,{kind:'ready'});assert.ok(variantsReady(g));
});

test('A confirmed step triggers one opposing mine, charges no points and leaves its owner intact',()=>{
 let g=choosing(ready({air:true}));g.mines.unlocked=[true,true];const before=structuredClone(g),owner=structuredClone(g.players[1]);
 const next=applyMove(g,0,{ci:0,ni:0,cells:[7]},()=>0),h=next.variants.hiddenMines;
 assert.deepEqual(g,before);assert.deepEqual(h.triggered,[[false,false],[true,false]]);assert.deepEqual(h.blasts[0].targets,[{pid:0,cells:[7]}]);assert.deepEqual(next.players[1],owner);assert.equal(next.players[0].marks[7],false);assert.deepEqual(next.players[0].lastMove,[]);
 assert.equal(next.turn,g.turn+1);assert.equal(next.round,g.round);assert.deepEqual(next.submitted,[0]);assert.deepEqual(next.dice,g.dice);assert.deepEqual(next.mines.used,[false,false]);assert.equal(score(next.players[0],next).total,score(before.players[0],before).total);assert.equal(score(next.players[1],next).mineCost,0);assert.equal(next.players[0].jokers,8);assert.ok(validVariantState(next));assert.ok(validMineState(next));
 assert.equal(canUseMine(next,1),true,'the normal second-player choice remains available');
});

test('Passing, aiming, own mines and airstrikes do not trigger hidden mines; refill cannot trigger twice',()=>{
 let g=ready({air:true});g.variants.hiddenMines.positions[0]=[7,104];g.variants.hiddenMines.positions[1]=[22,103];g=choosing(g);
 const own=applyMove(g,0,{ci:0,ni:0,cells:[7]},()=>{throw Error('safe mine must not draw');});assert.equal(own.players[0].marks[7],true);assert.deepEqual(own.variants.hiddenMines.triggered,[[false,false],[false,false]]);
 const pass=applyMove(g,0,{pass:true},()=>{throw Error('pass must not draw');});assert.equal(pass.variants.hiddenMines.blasts.length,0);
 g.mines.unlocked=[true,true];g.players[1].marks[7]=true;const attack=applyMineAttack(g,0,7,()=>0);assert.equal(attack.variants.hiddenMines.blasts.length,0);assert.deepEqual(attack.variants.hiddenMines.triggered,[[false,false],[false,false]]);
 let hit=shoot(ready());hit=applyMove(hit,1,{pass:true});hit=choosing(hit,7,1);hit=applyMove(hit,1,{pass:true});hit=applyMove(hit,0,{ci:0,ni:0,cells:[7]},()=>{throw Error('spent mine must not draw');});assert.equal(hit.variants.hiddenMines.blasts.length,1);assert.equal(hit.players[0].marks[7],true);assert.equal(score(hit.players[0],hit).total,-20);assert.ok(validVariantState(hit));
});

test('The extra-cell ability can trigger a mine and remains spent after the explosion',()=>{
 let g=ready({options:{discovery:true}});g.round=2;g.variants.hiddenMines.positions[1]=[8,104];const f=g.variants.discovery.fields.find(f=>f.type==='extra');f.owner=0;f.round=1;f.used=false;
 g=choosing(g,7);g=applyMove(g,0,{ci:0,ni:0,cells:[7],ability:'extra',extraCell:8},()=>0);
 assert.equal(g.variants.hiddenMines.triggered[1][0],true);assert.equal(g.variants.discovery.fields.find(x=>x.index===f.index).used,true);assert.equal(g.players[0].marks[8],false);assert.equal(g.players[0].jokers,8);assert.ok(validVariantState(g));
});

test('One move landing on both mines records both, removes each cross only once and draws nothing for an empty second centre',()=>{
 let g=ready();g.variants.hiddenMines.positions[1]=[0,1];g.players[0].marks[15]=true;g=choosing(g,0,0,2);let draws=0;
 g=applyMove(g,0,{ci:0,ni:0,cells:[0,1]},()=>{draws++;return 0;});
 const h=g.variants.hiddenMines;assert.equal(draws,3,'first blast draws count and two neighbours; second centre is already empty');assert.deepEqual(h.triggered[1],[true,true]);assert.deepEqual(h.blasts.map(b=>b.targets[0].cells),[[0,1,15],[]]);assert.equal(h.blasts[0].turn,h.blasts[1].turn);assert.equal(new Set(h.blasts.map(b=>b.id)).size,2);assert.ok(validVariantState(g));
 const effect=mineEffect(h.blasts);assert.equal(effect.triggerCount,2);assert.deepEqual(effect.impactTargets,[0,1]);assert.deepEqual(effect.targets,[{pid:0,cells:[0,1,15]}]);assert.deepEqual(mineDamage(g,0,0).cells,[0,1,15]);
});

test('Automatic damage shares the airstrike footprint for all three blast sizes, including corners',()=>{
 for(const target of [0,14,52,90,104])for(const extra of [3,4,5]){
  let g=ready({air:true});g.variants.hiddenMines.positions[1]=[target,target===104?103:104];g.players[0].marks[target]=true;blastNeighbors(target).forEach(i=>g.players[0].marks[i]=true);
  const expected=applyMineAttack({...choosing(g,target,1),mines:{...g.mines,unlocked:[true,true]}},1,target,max=>max===3?extra-3:0).mines.lastBlast.targets[0].cells;
  // Trigger via a normal one-cell move; the surrounding state is identical.
  g.players[0].marks[target]=false;if(!blastNeighbors(target).some(i=>i===target-1||i===target+1||i===target-15||i===target+15))throw Error('fixture adjacency');
  g=applyMove(choosing(g,target),0,{ci:0,ni:0,cells:[target]},max=>max===3?extra-3:0);
  assert.deepEqual(g.variants.hiddenMines.blasts[0].targets[0].cells,expected);assert.ok(validVariantState(g));
 }
});

test('Without paid airstrikes, hidden mines still transfer first colour bonuses and restore star penalties exactly',()=>{
 let g=ready();g.round=4;g.variants.hiddenMines.positions[1]=[52,104];const layout=boardFor(g),h=g.variants.hiddenMines;
 for(const p of g.players)layout.cells.forEach((c,i)=>{if(c==='g')p.marks[i]=true;});blastNeighbors(52).forEach(i=>g.players[0].marks[i]=true);
 g.players[0].colors.g=5;g.players[1].colors.g=3;g.colorClaims.g=2;h.rounds.colorRounds[0].g=2;h.rounds.colorRounds[1].g=3;
 const before0=score(g.players[0],g),before1=score(g.players[1],g),ownerMarks=[...g.players[1].marks];g=shoot(g,52);
 assert.deepEqual(g.variants.hiddenMines.blasts[0].targets[0].cells,[52,36,37,38]);assert.equal(g.players[0].colors.g,null);assert.equal(g.players[1].colors.g,5);assert.equal(g.colorClaims.g,3);assert.equal(g.variants.hiddenMines.rounds.colorRounds[0].g,null);assert.deepEqual(g.players[1].marks,ownerMarks);
 assert.equal(score(g.players[0],g).total,before0.total-7,'five colour points and one two-point star lost');assert.equal(score(g.players[1],g).total,before1.total+2,'the intact later completion inherits first');assert.equal(g.mines,undefined);assert.ok(validVariantState(g));
});

test('Sink, discovery, objective and bonus at one exploding cell remain earned through settlement, mixing and refill',()=>{
 let g=ready({air:true,bonus:true,options:all});g.round=5;
 g.variants.discovery.fields=['color','number','extra','color','number','extra'].map((type,i)=>({type,index:[7,22,37,52,67,82][i],owner:null,round:null,used:false}));
 Object.assign(g.variants.objectives.tasks[0],{type:'stars',target:1,deadline:12,firstRound:null,claims:[null,null],pending:[null,null]});
 g.bonuses.fields=[7,0,1].map(index=>({index,claim:null,pending:[]}));assert.equal(score(g.players[0],g).total,-22);
 g=shoot(g);assert.equal(score(g.players[0],g).total,-17);assert.equal(g.players[0].marks[7],false);assert.equal(g.variants.discovery.fields[0].owner,0);assert.deepEqual(g.mines.used,[false,false]);assert.equal(g.variants.hiddenMines.rounds,undefined,'reuse one completion ledger');
 g=applyMove(g,1,{pass:true},seeded(4));assert.equal(g.variants.mixing.lastRound,5);assert.equal(score(g.players[0],g).total,-10);
 g=choosing(g,7,1);g=applyMove(g,1,{pass:true});g=shoot(g,7,0);const s=score(g.players[0],g);
 assert.equal(s.total,-8);assert.equal(s.shipBonus,5);assert.equal(s.objectiveBonus,5);assert.equal(s.bonus,2);assert.equal(g.variants.hiddenMines.blasts.length,1);assert.ok(validVariantState(g));assert.ok(validMineState(g));
});

test('Mixing keeps every armed coordinate fixed, while saved damage survives reload for exactly the existing evidence window',()=>{
 let g=shoot(ready({options:{shuffle:true}}));const positions=structuredClone(g.variants.hiddenMines.positions),damage=mineDamage(g,0,0);assert.equal(damage.label,'Versteckte Mine');assert.match(hiddenMineStatusHtml(g,0,{open:true,damage:damage.hidden}),/Auf diesem Spielfeld · 1 Kreuz entfernt/);
 g.round=5;shuffleFreeColors(g,seeded(6));assert.deepEqual(g.variants.hiddenMines.positions,positions);g=JSON.parse(JSON.stringify(g));assert.ok(validVariantState(g));g.round=2;assert.deepEqual(mineDamage(g,0,0).cells,[7]);g.round=3;assert.equal(mineDamage(g,0,0),null);
});

test('Airstrike and hidden mine markers report separately for the board being viewed',()=>{
 let g=choosing(ready({air:true}),52,1);
 g.players[0].marks[52]=true;g.mines.unlocked[1]=true;
 g=shoot(applyMineAttack(g,1,52,()=>0));g.players[0].marks[52]=true;
 const damage=mineDamage(g,0,0);
 assert.deepEqual(damage.cells,[52,7]);assert.deepEqual(damage.airstrike.cells,[52]);assert.deepEqual(damage.hidden.cells,[7]);
 assert.match(mineControlsHtml(g,{damage:damage.airstrike}),/1 wieder angekreuzt/);
 assert.doesNotMatch(hiddenMineStatusHtml(g,0,{damage:damage.hidden}),/wieder angekreuzt/);
 g.hiddenScores=true;assert.equal(mineDamage(g,0,1),null);
});

test('Projected saves hide every untriggered opposing coordinate and every concealed foreign damage list',()=>{
 for(const hidden of [false,true])for(const own of [0,1]){
  const full=ready({hidden}),view=projectGame(full,own),h=view.variants.hiddenMines;
  assert.deepEqual(h.positions[own],full.variants.hiddenMines.positions[own]);assert.deepEqual(h.positions[1-own],[null,null]);assert.equal(h.rounds,undefined);assert.ok(validVariantState(view,{allowProjection:true}));assert.equal(validVariantState(view),false);
  const hit=projectGame(shoot(full),own);assert.equal(hit.variants.hiddenMines.positions[1][0],7);assert.equal(hit.variants.hiddenMines.positions[1][1],own===1?22:null);assert.ok(validVariantState(hit,{allowProjection:true}));
  assert.deepEqual(hit.variants.hiddenMines.blasts[0].targets,hidden&&own===1?[{pid:0,removed:1}]:[{pid:0,cells:[7]}]);
  full.status='finished';full.phase='finished';const revealed=projectGame(full,own);assert.deepEqual(revealed.variants.hiddenMines.positions,full.variants.hiddenMines.positions);assert.ok(validVariantState(revealed,{allowProjection:true}));
 }
});

test('A hidden explosion gives its owner counts and only the affected viewer their own coordinates',()=>{
 let game=createGame(['A','B','C','D'],'room',[],{hiddenScores:true,variants:{hiddenMines:true}});
 game.variants.hiddenMines.positions=[[0],[7],[1],[2]];
 for(let pid=0;pid<4;pid++)game=applyHiddenMineAction(game,pid,{kind:'ready'});
 game=shoot(game);const views=game.players.map((_,pid)=>projectGame(game,pid));
 assert.deepEqual(views[1].variants.hiddenMines.blasts[0].targets,[{pid:0,removed:1},{pid:2,removed:0},{pid:3,removed:0}]);
 assert.deepEqual(views[0].variants.hiddenMines.blasts[0].targets,[{pid:0,cells:[7]}]);
 assert.deepEqual(views[2].variants.hiddenMines.blasts,[]);assert.deepEqual(views[2].variants.hiddenMines.positions[1],[null]);
 assert(views.every(view=>validVariantState(view,{allowProjection:true})));
 assert.equal(hiddenMineReports(views[1],1).length,3);
 assert.equal(hiddenMineReports(views[1],1).some(report=>report.target!==undefined),false);
});

test('The computer plans all three difficulties without reading human mine coordinates or consuming randomness',()=>{
 for(const level of ['easy','medium','hard']){
  const g=choosing(ready({options:all}),7,1);g.computerDifficulty=level;Object.defineProperty(g.variants.hiddenMines.positions,0,{get(){throw Error('secret human mine coordinate read');}});
  const random=Math.random;Math.random=()=>{throw Error('planning RNG');};try{const move=chooseComputerMove(g,1);assert.ok(move===null||move.pass||Array.isArray(move.cells));}finally{Math.random=random;}
 }
});

test('Malformed mines cannot be loaded, projected states cannot be committed, and leaving during setup remains valid',()=>{
 const g=ready();for(const alter of [h=>h.positions[0].push(1),h=>h.positions[0][0]=105,h=>h.positions[0][0]=h.positions[0][1],h=>h.ready[1]=false,h=>h.triggered[1][0]=true,h=>h.rounds.colorRounds[0].g=99,h=>h.extra=true]){const bad=structuredClone(g);alter(bad.variants.hiddenMines);assert.equal(validVariantState(bad),false);}
 const hit=shoot(g);for(const alter of [b=>b.target=8,b=>b.slot=1,b=>b.id='bad',b=>b.turn=999,b=>b.targets[0].cells.push(104),b=>b.targets[0].cells=[7,7],b=>b.targets[0].pid=1]){const bad=structuredClone(hit);alter(bad.variants.hiddenMines.blasts[0]);assert.equal(validVariantState(bad),false);}
 assert.throws(()=>applyHiddenMineAction(projectGame(preparing(),0),0,{kind:'ready'}));assert.throws(()=>applyMove(projectGame(choosing(g),0),0,{pass:true}));
 const ended=leaveGame(preparing(),0);assert.equal(ended.status,'finished');assert.ok(validVariantState(ended));
 let group=createGame(['A','B','C'],'room',[],{variants:{hiddenMines:true}});group=leaveGame(group,1);
 assert.ok(validVariantState(group));assert.throws(()=>applyHiddenMineAction(group,1,{kind:'ready'}));
 for(const pid of [0,2])group=applyHiddenMineAction(group,pid,{kind:'ready'});
 assert.ok(validVariantState(rollGame(group,()=>0)));
});

test('Setup and in-game UI expose only owned mines and enable the lobby option for capable peers',()=>{
 const g=preparing();assert.match(variantSetupHTML(g),/variant-hiddenMines/);assert.match(variantSetupHTML(null,{players:6}),/variant-hiddenMines/);
 assert.deepEqual(readVariantOptions({querySelector:()=>null}),{battleship:false,discovery:false,objectives:false,shuffle:false,hiddenMines:false});
 assert.match(variantLobbyHTML({}, {host:true,supported:true}),/data-variant="hiddenMines" disabled/);
 assert.doesNotMatch(variantLobbyHTML({}, {host:true,supported:true,hiddenMinesSupported:true}),/data-variant="hiddenMines" disabled/);
 const positions=g.variants.hiddenMines.positions;Object.defineProperty(positions,1,{get(){throw Error('foreign hidden coordinate in UI');}});
 assert.equal((hiddenMineSetupHtml(g).match(/data-action="hidden-mine-place"/g)||[]).length,105);assert.match(hiddenMineSetupHtml(g),/Mine 1/);assert.match(hiddenMineStatusHtml(g),/2\/2 eigene Minen scharf/);assert.equal(mineControlsHtml(g),'');
 assert.match(cellVariantHTML(g,0,103,0),/own-mine-badge/);assert.match(cellVariantLabel(g,0,103,0),/für dich ungefährlich/);assert.doesNotMatch(cellVariantHTML(g,1,7,0),/own-mine/);assert.doesNotMatch(cellVariantLabel(g,1,7,0),/Mine/);
 g.hiddenScores=true;assert.doesNotMatch(hiddenMineStatusHtml(g),/feature-reward/);assert.match(variantHelpHTML(g),/keinen zusätzlichen Punkte-Einsatz/);
});

function effectEnvironment(reduced=false){
 const animations=[],created=[],queries=[],timers=[];const node=()=>{const n={children:[],setAttribute(){},append(child){this.children.push(child);},remove(){this.removed=true;},scrollIntoView(){},animate(frames,options){animations.push({cell:this,options});}};created.push(n);return n;};
 const board=node(),cells=new Map([0,1,15,52,53].map(i=>[i,node()])),body=node();const document={body,createElement:node,querySelector(selector){queries.push(selector);if(selector==='[data-player-board="0"]')return board;const m=selector.match(/^\[data-player-board="0"\] \[data-i="(\d+)"\]$/);return m?cells.get(Number(m[1])):null;},querySelectorAll:()=>[]};
 return {animations,created,queries,timers,cells,body,environment:{document,matchMedia:()=>({matches:reduced}),setTimeout(fn,ms){timers.push({fn,ms});}}};
}
test('Ground animations erupt at both confirmed centres with a longer banner',()=>{
 for(const reduced of [false,true]){
  const t=effectEnvironment(reduced);playMineBlast({kind:'hidden',by:1,target:0,impactTargets:[0,1],triggerCount:2,targets:[{pid:0,cells:[0,1,15]}],ownPid:0},t.environment);
  assert.match(t.body.children[0].innerHTML,/2 Minen ausgelöst · A1 \+ B1/);assert.match(t.body.children[0].innerHTML,/3 Kreuze entfernt/);assert.doesNotMatch(t.body.children[0].innerHTML,/Luftangriff/);assert.equal(t.animations.length,reduced?0:3);assert.equal(t.cells.get(52).children.length,0);
  if(!reduced){for(const centre of [0,1]){const markup=t.cells.get(centre).children[0].innerHTML;assert.match(markup,/viewBox="0 0 100 100"/);assert.match(markup,/ground-flash/);assert.equal((markup.match(/class="ground-fragment"/g)||[]).length,8);assert.doesNotMatch(markup,/airstrike-flight/);}assert.doesNotMatch(t.cells.get(15).children[0].innerHTML,/ground-flash/);}
  assert.deepEqual(t.timers.map(timer=>timer.ms),reduced?[GAME_BANNER_MS]:[GAME_BANNER_MS,MINE_ANIMATION_MS]);
  if(!reduced)t.timers[1].fn();assert.ok([...t.cells.values()].every(c=>c.children.every(n=>n.removed)));
  t.timers[0].fn();assert.ok(t.body.children[0].removed);
 }
});

test('Concealed ground effects and damage helpers never inspect a foreign damage payload',()=>{
 const foreign={pid:1};Object.defineProperty(foreign,'cells',{get(){throw Error('secret damage read');}});
 const blasts=[0,1].map(slot=>({kind:'hidden',by:0,turn:2,target:slot,targets:[foreign]})),effect=mineEffect(blasts,{own:0,concealed:true}),t=effectEnvironment();playMineBlast({...effect,ownPid:0,concealed:true},t.environment);
 assert.match(t.body.children[0].innerHTML,/Bericht unter „Versteckte Minen“/);assert.doesNotMatch(t.body.children[0].innerHTML,/A1|B1/);assert.deepEqual(t.animations,[]);assert.ok(!t.queries.some(q=>q.includes('data-player-board="1"')));
 const g=ready({hidden:true});g.variants.hiddenMines.blasts=blasts;assert.equal(mineDamage(g,1,0),null);
});

test('An owned mine keeps a permanent victim, removed-cross and coordinate report on the own panel',()=>{
 let g=ready();g.variants.hiddenMines.positions=[[7,104],[90,100]];g=shoot(g,7,1);const before=JSON.stringify(g),report=hiddenMineReports(g,0);
 assert.equal(report.length,1);assert.deepEqual(report[0],{id:'hidden:0:0',round:1,by:0,pid:1,removed:1,target:7,cells:[7]});
 const html=hiddenMineStatusHtml(g,0,{open:true});assert.match(html,/Deine Mine → Computer/);assert.match(html,/1 Kreuz entfernt/);assert.match(html,/Ausgelöst auf H1/);assert.match(html,/Entfernt: H1/);assert.equal(JSON.stringify(g),before);
 g=JSON.parse(JSON.stringify(g));g.round=20;assert.deepEqual(hiddenMineReports(g,0),report);assert.match(hiddenMineStatusHtml(g),/Computer: 1 entfernt/);
 g.players[1].name='<img onerror=bad>';assert.doesNotMatch(hiddenMineStatusHtml(g),/<img/);assert.match(hiddenMineStatusHtml(g),/&lt;img/);
});
test('Concealed mine reports expose the requested count while never reading target coordinates or foreign cell indices',()=>{
 let g=ready({hidden:true});g.variants.hiddenMines.positions=[[7,104],[90,100]];g=shoot(g,7,1);
 const blast=g.variants.hiddenMines.blasts[0];Object.defineProperty(blast,'target',{get(){throw Error('concealed target read');}});
 blast.targets[0].cells=new Proxy([7],{get(array,key){if(key!=='length')throw Error('concealed coordinate read');return array.length;}});
 const reports=hiddenMineReports(g,0);assert.equal(reports[0].removed,1);assert.equal(reports[0].target,undefined);assert.equal(reports[0].cells,undefined);
 const html=hiddenMineStatusHtml(g,0,{open:true});assert.match(html,/Computer: 1 entfernt/);assert.match(html,/1 Kreuz entfernt/);assert.match(html,/Position verdeckt/);assert.doesNotMatch(html,/H1|feature-reward|data-i=/);
});
test('Incoming mine reports identify the own damage and distinguish separate detonations without changing scores',()=>{
 const g=shoot(ready()),before=score(g.players[0],g),reports=hiddenMineReports(g,0);
 assert.equal(reports[0].by,1);assert.equal(reports[0].pid,0);assert.match(hiddenMineStatusHtml(g,0,{open:true}),/Gegnerische Mine → Du/);assert.deepEqual(score(g.players[0],g),before);
 g.variants.hiddenMines.blasts.push({...g.variants.hiddenMines.blasts[0],id:'hidden:1:1',slot:1,target:22,targets:[{pid:0,cells:[]}]});
 assert.deepEqual(hiddenMineReports(g,0).map(r=>r.removed),[1,0]);assert.match(hiddenMineStatusHtml(g),/Du: 0 entfernt/);
});
