import {bonusStatusHtml} from '../public/game/bonus-ui.js';
import {mineControlsHtml,hiddenMineStatusHtml} from '../public/game/mine-ui.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {ResultNotice} from '../public/game/view-state.js';
import {createComputerGame} from '../public/game/computer.js';
import {createGame,score} from '../public/game/engine.js';
import {confirmHumanFleet} from '../public/game/variants.js';
import {boardFor} from '../public/game/boards.js';
import {scoreBreakdownHTML,objectiveValidity,objectivesHTML,discoveryPanelHTML,mixingPanelHTML,battlePanelHTML} from '../public/game/variant-ui.js';
const finished=(id='match-a')=>({mode:'computer',gameId:id,status:'finished'});
test('A completed result is presented once per match/context, including repeated server snapshots',()=>{
 const n=new ResultNotice(),g=finished(),before=structuredClone(g);
 assert.equal(n.ready(g,'room:A'),true);assert.equal(n.claim(g,'room:A'),true);
 assert.equal(n.ready(structuredClone(g),'room:A'),false);assert.equal(n.claim(g,'room:A'),false);
 assert.equal(n.ready(g,'room:B'),true);assert.equal(n.claim(finished('match-b'),'room:A'),true);assert.equal(n.ready(g,'room:A'),false);
 assert.deepEqual(g,before);
});
test('A blocked dialog can defer acknowledgement; home/rerenders do not consume an unseen result',()=>{
 const n=new ResultNotice(),g=finished();for(let i=0;i<5;i++)assert.equal(n.ready(g,'local'),true);
 assert.equal(n.ready({...g,status:'playing'},'local'),false);assert.equal(n.ready(null,'local'),false);
 assert.equal(n.claim(g,'local'),true);assert.equal(n.ready(g,'local'),false);assert.equal(n.ready(finished('rematch'),'local'),true);
});
test('A room result missed during a rematch appears before the current match and is acknowledged across reload',()=>{
 const notice=new ResultNotice(),finishedRoom={...finished(),mode:'room'},context='room:A:guest';
 const nextRoom={...finishedRoom,gameId:'next',status:'playing'};
 assert.equal(notice.next(nextRoom,finishedRoom,context),finishedRoom);
 assert.equal(notice.next(nextRoom,finishedRoom,context),finishedRoom);
 notice.claim(finishedRoom,context);
 const restored=new ResultNotice(JSON.parse(JSON.stringify([...notice.seen])));
 assert.equal(restored.next(nextRoom,finishedRoom,context),undefined);
 assert.equal(restored.next(nextRoom,finishedRoom,'room:A:other-device'),finishedRoom);
});
test('Legacy saves can show a later result after a new playing match without changing their schema',()=>{
 const n=new ResultNotice(),g={mode:'local',status:'finished'};assert(n.claim(g,'local'));assert(!n.ready(g,'local'));
 assert(!n.ready({...g,status:'playing'},'local'));assert(n.claim(g,'local'));
});
test('Displayed icon contributions reconcile with engine totals including all variant rewards and mine cost',()=>{
 const g=confirmHumanFleet(createComputerGame(false,'classic','medium',true,true,{battleship:true,objectives:true}));g.status='finished';g.phase='finished';
 const p=g.players[0];p.columns[7]=2;p.colors.g=5;p.jokers=3;for(const i of boardFor(g).stars.slice(0,3))p.marks[i]=true;
 g.mines.used[0]=true;g.mines.unlocked[0]=true;g.bonuses.fields[0].claim={round:1,winners:[0]};
 const b=g.variants.battleship;b.shots[0][b.fleets[1][0][0]]=2;b.sunk[0][0]=true;b.revealed[0]=[[...b.fleets[1][0]]];
 const task=g.variants.objectives.tasks[0];task.claims[0]=1;task.firstRound=1;
 const s=score(p,g),before=JSON.stringify(g),html=scoreBreakdownHTML(s),parts=[...html.matchAll(/data-points="(-?\d+)"/g)].map(m=>Number(m[1]));
 assert.equal(s.total,2+5+3+2+5+5-24-5);assert.equal(parts.length,8);assert.equal(parts.reduce((a,b)=>a+b,0),s.total);
 assert.equal((html.match(/<svg/g)||[]).length,8);assert.match(html,/Schiffsboni/);assert.match(html,/Aufträge/);assert.match(html,/Luftangriff/);assert.equal(JSON.stringify(g),before);
});
test('Unselected variants and concealed/forfeited breakdowns do not gain invented score cards',()=>{
 const g=createGame(['Du'],'solo'),s=score(g.players[0],g),html=scoreBreakdownHTML(s);
 assert.equal((html.match(/data-points=/g)||[]).length,4);assert(!html.includes('Schiffsboni'));assert(!html.includes('Schatzsuche'));assert(!html.includes('Luftangriff'));
 assert.equal(scoreBreakdownHTML(null),'');assert.equal(scoreBreakdownHTML({...s,hidden:true}),'');assert.equal(scoreBreakdownHTML({...s,left:true}),'');
});
test('Objective countdown includes the current deadline round and ends when the match ends',()=>{
 for(const [round,remaining] of [[1,12],[11,2],[12,1],[13,0]])assert.equal(objectiveValidity({status:'playing',round},{deadline:12}).rounds,remaining);
 assert.match(objectiveValidity({status:'playing',round:12},{deadline:12}).label,/Letzte gültige Runde/);
 assert.equal(objectiveValidity({status:'finished',round:9},{deadline:12}).rounds,0);
 assert.equal(objectiveValidity({status:'playing',round:20},{deadline:null}).rounds,null);
 assert.equal(objectiveValidity({status:'playing',round:20},{deadline:null}).label,'Bis Spielende');
});
test('Every objective has a countdown in the closed summary and retains earned status after expiry',()=>{
 const g=createComputerGame(false,'classic','medium',false,false,{objectives:true});g.round=12;
 g.variants.objectives.tasks.forEach((t,i)=>t.deadline=[12,14,null][i]);
 let html=objectivesHTML(g),summary=html.split('</summary>')[0];
 assert.equal((summary.match(/class="objective-deadline /g)||[]).length,3);assert(summary.includes('Letzte Runde'));assert(summary.includes('3 Runden'));assert(summary.includes('Bis Spielende'));
 assert(html.includes('Letzte gültige Runde · Runde 12'));
 const t=g.variants.objectives.tasks[0];t.claims[0]=11;t.firstRound=11;g.round=13;html=objectivesHTML(g);
 assert(html.includes('✓ Erfüllt'));assert(html.includes('Frist beendet · Runde 12'));assert.equal(t.claims[0],11);
});

test('Legacy computer treasure header shows the selected participant total and own collection progress',()=>{
 const g=createComputerGame(false,'classic','medium',false,true);g.bonuses.fields.forEach((f,i)=>f.claim={round:1,winners:i===1?[0,1]:[1]});
 delete g.bonuses.hunt;
 assert.match(bonusStatusHtml(g,{own:1}),/aria-label="Schatzsuche: \+6 Punkte"/);
 assert.match(bonusStatusHtml(g,{own:0}),/aria-label="Schatzsuche: \+2 Punkte"/);
 assert.match(bonusStatusHtml(g,{own:1}),/class="feature-meta"[^]*3\/3 eigene/);
});
test('Objective header uses earned points, independently from the completed count and deadlines',()=>{
 const g=createComputerGame(false,'classic','medium',false,false,{objectives:true});g.round=3;
 g.variants.objectives.tasks[0].claims[0]=1;g.variants.objectives.tasks[0].firstRound=1;
 g.variants.objectives.tasks[1].claims=[2,1];g.variants.objectives.tasks[1].firstRound=1;
 const html=objectivesHTML(g);assert.match(html,/aria-label="Öffentliche Aufträge: \+7 Punkte"/);assert(html.includes('2/3 erfüllt'));assert(html.includes('objective-deadlines'));
});
test('All active rule headers conceal personal point totals until the end of a hidden game',()=>{
 const g=confirmHumanFleet(createComputerGame(true,'classic','medium',true,true,{battleship:true,discovery:true,objectives:true,shuffle:true}));
 for(const html of [bonusStatusHtml(g),mineControlsHtml(g),battlePanelHTML(g),discoveryPanelHTML(g),objectivesHTML(g),mixingPanelHTML(g)])assert(!html.includes('class="feature-reward'));
 g.hiddenScores=false;g.mines.used[0]=true;g.mines.unlocked[0]=true;
 assert.match(mineControlsHtml(g),/aria-label="Luftangriff: −5 Punkte"/);
 assert.doesNotMatch(discoveryPanelHTML(g),/feature-reward|0 Punkte/);
 assert.doesNotMatch(mixingPanelHTML(g),/feature-reward|0 Punkte/);
});

test('Features without point awards omit score badges while point-bearing features retain their totals',()=>{
 const g=createComputerGame(false,'classic','medium',true,true,{battleship:true,discovery:true,objectives:true,shuffle:true,hiddenMines:true});
 for(const status of ['playing','finished']){
  g.status=status;
  for(const html of [discoveryPanelHTML(g),mixingPanelHTML(g),hiddenMineStatusHtml(g),mineControlsHtml(g)])assert.doesNotMatch(html,/feature-reward|0 Punkte/);
  for(const html of [bonusStatusHtml(g),battlePanelHTML(g),objectivesHTML(g)])assert.match(html,/feature-reward/);
 }
 g.status='playing';g.mines.used[0]=true;assert.match(mineControlsHtml(g),/Luftangriff: −5 Punkte/);
 g.hiddenScores=true;assert.doesNotMatch(mineControlsHtml(g),/feature-reward|−5 Punkte/);
});
