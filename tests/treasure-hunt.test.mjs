import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,rollGame,applyMove,applyMineAttack,findMove,score,boardFor} from '../public/game/engine.js';
import {createComputerGame,chooseComputerMove} from '../public/game/computer.js';
import {bonusPoints,bonusChainPoints,bonusAwards,noteBonusMove,settleBonusFields,treasureHuntEnabled,treasureHuntView,treasureMoveValue,validBonusState,projectBonuses} from '../public/game/bonus-fields.js';
import {bonusStatusHtml,bonusSetupHtml,bonusHelpHtml,treasureMoveAnnouncement} from '../public/game/bonus-ui.js';
import {projectGame} from '../public/game/game-info.js';
const fresh=(indices=[8,60,104],hidden=false)=>{const g=createComputerGame(hidden,'classic','medium',true,true);g.bonuses.fields.forEach((f,i)=>f.index=indices[i]);return g;};
const choosing=(g,index=7)=>{g=structuredClone(g);g.active=0;g.phase='choose';g.dice={colors:[boardFor(g,0).cells[index],'*','*'],numbers:[1,'?','?']};return g;};
const settle=g=>applyMove(g,1,{pass:true});
test('Every new multiplayer hunt starts with per-player readings; solo retains its original rules',()=>{
 assert(treasureHuntEnabled(fresh()));
 for(const mode of ['local','room','direct'])for(const n of [2,6]){const g=createGame(Array(n).fill('Spieler'),mode,[],{bonusFields:true});assert(treasureHuntEnabled(g));assert.equal(g.bonuses.hunt.readings.length,n);assert(validBonusState(g));}
 const solo=createGame(['A'],'solo',[],{bonusFields:true});assert.equal(solo.bonuses.hunt,undefined);assert(!treasureHuntEnabled(solo));
 const legacy=fresh();delete legacy.bonuses.hunt;const next=settle(applyMove(choosing(legacy),0,{ci:0,ni:0,cells:[7]}));assert.equal(next.bonuses.hunt.chainBonus,false);assert.equal(treasureHuntView(next,0).reading.warmth,'hot');assert(validBonusState(next));
 assert(!treasureHuntEnabled(createComputerGame()));
});
test('Confirmed probes use shortest orthogonal distance, handle board edges and include every new cell',()=>{
 for(const [targets,cells,expected] of [[[8,60,104],[7],'hot'],[[9,60,104],[7],'warm'],[[10,60,104],[7],'warm'],[[11,60,104],[7],'cold'],[[15,60,104],[14],'cold'],[[11,60,104],[7,10],'hot']]){
  const g=fresh(targets);noteBonusMove(g,0,cells);assert.equal(treasureHuntView(g,0).reading.warmth,expected);assert.deepEqual(treasureHuntView(g,0).reading.cells,cells);
 }
});
test('Drafts, invalid moves, passes and re-rendering never probe or consume random values',()=>{
 const g=choosing(fresh()),before=JSON.stringify(g);assert.throws(()=>applyMove(g,0,{ci:0,ni:0,cells:[0]}));assert.equal(JSON.stringify(g),before);
 bonusStatusHtml(g);bonusHelpHtml(g);assert.equal(JSON.stringify(g),before);
 const passed=applyMove(g,0,{pass:true},()=>{throw Error('unexpected RNG');});assert.equal(treasureHuntView(passed,0).reading,null);
 const next=applyMove(g,0,{ci:0,ni:0,cells:[7]},()=>{throw Error('unexpected RNG');});assert.equal(treasureHuntView(next,0).reading.warmth,'hot');assert.equal(JSON.stringify(g),before);
});
test('A pending find excludes only the actor own find and keeps tied same-round finds possible',()=>{
 let g=applyMove(choosing(fresh([7,9,104])),0,{ci:0,ni:0,cells:[7]});
 assert.equal(bonusPoints(g,0),0);assert.equal(treasureHuntView(g,0).reading.found,1);assert.equal(treasureHuntView(g,0).reading.warmth,'warm');assert.equal(treasureHuntView(g,0).clue,null);
 g=applyMove(g,1,{ci:0,ni:0,cells:[7]});assert.deepEqual(bonusAwards(g)[0].winners,[0,1]);assert.equal(bonusPoints(g,0),2);assert.equal(bonusPoints(g,1),2);assert(validBonusState(g));
 for(const pid of [0,1])assert.deepEqual(treasureHuntView(g,pid).clue,{round:1,band:1});
});
test('Clues cover five columns, follow the next available treasure and disappear when all are taken',()=>{
 const g=fresh([7,4,104]);g.submitted=[0];noteBonusMove(g,0,[7]);settleBonusFields(g);assert.deepEqual(treasureHuntView(g,0).clue,{round:1,band:0});assert.equal(treasureHuntView(g,1).clue,null);
 g.round=2;g.submitted=[1];noteBonusMove(g,1,[4]);settleBonusFields(g);for(const pid of [0,1])assert.deepEqual(treasureHuntView(g,pid).clue,{round:2,band:2});
 g.round=3;g.submitted=[0];noteBonusMove(g,0,[104]);settleBonusFields(g);assert.equal(treasureHuntView(g,0).clue,null);assert.equal(treasureHuntView(g,1).clue,null);assert.equal(treasureHuntView(g,0).remaining,0);assert.equal(bonusPoints(g,0),4);
});
test('All three own finds award nine only after settlement, once, including ties and game end',()=>{
 let g=rollGame(fresh(),()=>5);const move=findMove(g,0,{count:3});assert.equal(move.cells.length,3);g.bonuses.fields.forEach((f,i)=>f.index=move.cells[i]);
 g=applyMove(g,0,move);assert.equal(bonusPoints(g,0),0);assert.equal(bonusChainPoints(g,0),0);
 g=applyMove(g,1,move);for(const pid of [0,1]){assert.equal(bonusPoints(g,pid),9);assert.equal(bonusChainPoints(g,pid),3);assert.equal(score(g.players[pid],g).bonus,9);}
 const before=JSON.stringify(g);bonusStatusHtml(g);bonusStatusHtml(g);assert.equal(JSON.stringify(g),before);settleBonusFields(g);assert.equal(bonusPoints(g,0),9);assert(validBonusState(JSON.parse(JSON.stringify(g))));
 let end=choosing(fresh([7,22,37]));for(const f of end.bonuses.fields.slice(1))f.claim={round:1,winners:[0]};boardFor(end).cells.forEach((c,i)=>{if(['g','y'].includes(c)&&i!==7)end.players[0].marks[i]=true;});
 end=settle(applyMove(end,0,{ci:0,ni:0,cells:[7]}));assert.equal(end.status,'finished');assert.equal(score(end.players[0],end).bonus,9);
});
test('Luftangriff damage preserves the measured probe, pending find, clue and permanent chain bonus',()=>{
 let g=rollGame(fresh(),()=>5);const move=findMove(g,0,{count:3});g.bonuses.fields.forEach((f,i)=>f.index=move.cells[i]);g.mines.unlocked=[true,true];
 g=applyMove(g,0,move);const reading=treasureHuntView(g,0).reading;
 g=applyMineAttack(g,1,move.cells[0],()=>0);assert.equal(g.players[0].marks[move.cells[0]],false);assert.deepEqual(treasureHuntView(g,0).reading,reading);g=settle(g);assert.equal(bonusPoints(g,0),9);
 const loaded=JSON.parse(JSON.stringify(g));assert(validBonusState(loaded));assert.deepEqual(treasureHuntView(loaded,0),treasureHuntView(g,0));assert.equal(bonusPoints(loaded,0),9);
});
test('Presentation and planning use only own hints and earned awards, never hidden locations or foreign readings',()=>{
 for(const level of ['easy','medium','hard']){
  const g=choosing(fresh());g.computerDifficulty=level;g.bonuses.hunt.readings[0]={round:1,cells:[7],found:0,warmth:'hot'};const expected=chooseComputerMove(g,0),html=bonusStatusHtml(g,{own:0});
  for(const field of g.bonuses.fields)Object.defineProperty(field,'index',{get(){throw Error('secret location read');}});
  Object.defineProperty(g.bonuses.hunt.readings,1,{get(){throw Error('foreign reading');}});Object.defineProperty(g.bonuses.hunt.clues,1,{get(){throw Error('foreign clue');}});
  assert.equal(bonusStatusHtml(g,{own:0}),html);assert.deepEqual(chooseComputerMove(g,0),expected);assert(treasureMoveValue(g,0,[8])>treasureMoveValue(g,0,[104]));
 }
});
test('Network projections preserve own readings and public chain scoring without secret or other-player hints',()=>{
 const g=fresh();noteBonusMove(g,0,[7]);const view=treasureHuntView(g,0);view.reading.cells[0]=104;assert.equal(treasureHuntView(g,0).reading.cells[0],7);
 const projected=projectBonuses(g);assert.deepEqual(projected,{schema:1,enabled:true,awards:[],remaining:3,chainBonus:true});assert.equal(projected.hunt,undefined);assert(validBonusState({...g,bonuses:projected},{allowProjection:true}));
 for(const hiddenScores of [false,true]){
  let multiplayer=createGame(['A','B','C'],'room',[],{bonusFields:true,hiddenScores});
  multiplayer.bonuses.fields.forEach((f,i)=>f.index=[8,60,104][i]);
  multiplayer=applyMove(choosing(multiplayer),0,{ci:0,ni:0,cells:[7]});
  const host=projectGame(multiplayer,0),guest=projectGame(multiplayer,2);
  assert.deepEqual(treasureHuntView(host,0),treasureHuntView(multiplayer,0));assert.equal(treasureHuntView(host,2),null);
  assert.deepEqual(treasureHuntView(guest,2).history,[]);assert.equal(guest.bonuses.fields,undefined);assert.equal(guest.bonuses.hunt,undefined);
  assert.match(bonusStatusHtml(host),/Heiß: H1/);assert.doesNotMatch(bonusStatusHtml(guest,{own:2}),/H1/);assert.match(bonusHelpHtml(guest,2),/insgesamt 9/);
 }
});
test('Strict save validation rejects solo hints, malformed probes, forged bands and malformed projections',()=>{
 const g=settle(applyMove(choosing(fresh([7,22,104])),0,{ci:0,ni:0,cells:[7]}));assert(validBonusState(g));
 for(const mutate of [x=>x.mode='solo',x=>x.bonuses.hunt.schema=2,x=>x.bonuses.hunt.readings.pop(),x=>x.bonuses.hunt.readings[0].round=999,x=>x.bonuses.hunt.readings[0].cells=[105],x=>x.bonuses.hunt.readings[0].cells=[7,7],x=>x.bonuses.hunt.readings[0].warmth='boiling',x=>x.bonuses.hunt.readings[0].found=4,x=>x.bonuses.hunt.clues[0].band=3,x=>x.bonuses.hunt.secret=7,x=>x.bonuses={...projectBonuses(x),hunt:x.bonuses.hunt}]){const bad=structuredClone(g);mutate(bad);assert(!validBonusState(bad));}
 const projection=projectGame(g,0);assert(validBonusState(projection,{allowProjection:true}));projection.bonuses.hint.viewer=2;assert(!validBonusState(projection,{allowProjection:true}));
});
test('Compact own progress, historical probe, coarse trail, chain reward and hidden points render consistently',()=>{
 let g=settle(applyMove(choosing(fresh([7,22,104])),0,{ci:0,ni:0,cells:[7]}));let html=bonusStatusHtml(g);assert.match(html,/Schatzsuche/);assert.match(html,/1\/3 eigene/);assert.match(html,/Suchzug W1 · H1/);assert.match(html,/Spalten F–J/);assert.match(html,/\+3 P/);assert.match(html,/data-action="bonus-help"/);assert.match(bonusSetupHtml(true,{treasureHunt:true}),/id="bonus-fields-label">Schatzsuche</);
 g.hiddenScores=true;html=bonusStatusHtml(g);assert.doesNotMatch(html,/\+\d|feature-reward|\d Punkte/);assert.match(html,/Kettenbonus/);g.status='finished';assert.match(bonusStatusHtml(g),/\+2/);
 assert.match(bonusHelpHtml(g),/insgesamt 9/);assert.doesNotMatch(bonusHelpHtml(createGame(['A'],'solo')),/Kettenbonus/);
});
test('Own confirmed move notices reveal only warmth or own pending find, never point totals or positions',()=>{
 const g=fresh(undefined,true);assert.equal(treasureMoveAnnouncement(g,0),'');noteBonusMove(g,0,[7]);assert.equal(treasureMoveAnnouncement(g,0),'Schatzsuche · Heiß. Abstand von deinen neuen Kreuzen.');
 const hit=fresh([7,22,104],true);noteBonusMove(hit,0,[7]);assert.match(treasureMoveAnnouncement(hit,0),/Wertung am Wurfende/);assert.doesNotMatch(treasureMoveAnnouncement(hit,0),/H1|\+\d/);assert.equal(treasureMoveAnnouncement(hit,1),'');
});

test('Legacy computer saves advertise their next hint without mutating during rendering, passing or invalid moves',()=>{
 const g=choosing(fresh());delete g.bonuses.hunt;const before=JSON.stringify(g);
 assert.match(bonusStatusHtml(g),/Hinweis nach Zug/);assert.match(bonusHelpHtml(g),/bisherige Punktewertung/);assert.doesNotMatch(bonusStatusHtml(g),/\+3/);
 assert.doesNotMatch(bonusStatusHtml({...g,status:'finished'}),/Hinweis nach Zug/);assert.equal(JSON.stringify(g),before);assert.throws(()=>applyMove(g,0,{ci:0,ni:0,cells:[0]}));assert.equal(JSON.stringify(g),before);
 assert.equal(applyMove(g,0,{pass:true}).bonuses.hunt,undefined);
 for(const f of g.bonuses.fields)Object.defineProperty(f,'index',{get(){throw Error('secret read while rendering');}});
 assert.match(bonusStatusHtml(g),/Hinweis nach Zug/);
});
test('The first real legacy search preserves past awards, supplies an earned trail and survives reload',()=>{
 const g=choosing(fresh([0,8,104]));delete g.bonuses.hunt;g.round=5;g.bonuses.fields[0].claim={round:1,winners:[0]};
 const before=score(g.players[0],g).bonus,next=applyMove(g,0,{ci:0,ni:0,cells:[7]});
 assert.equal(before,2);assert.equal(score(next.players[0],next).bonus,before);assert.equal(next.bonuses.hunt.chainBonus,false);
 const view=treasureHuntView(next,0);assert.equal(view.reading.warmth,'hot');assert.deepEqual(view.clue,{round:5,band:1});assert.equal(view.chainReward,0);
 const loaded=JSON.parse(JSON.stringify(next));assert(validBonusState(loaded));assert.deepEqual(treasureHuntView(loaded,0),view);assert.match(bonusStatusHtml(loaded),/Heiß: H1/);
 for(const flag of [true,0,'false',null]){const bad=structuredClone(next);bad.bonuses.hunt.chainBonus=flag;assert(!validBonusState(bad));}
});
test('Finishing an old computer treasure collection retains its original six-point ceiling',()=>{
 let g=rollGame(fresh(),()=>5);delete g.bonuses.hunt;const move=findMove(g,0,{count:3});g.bonuses.fields.forEach((f,i)=>f.index=move.cells[i]);
 g=applyMove(g,0,move);g=applyMove(g,1,move);
 for(const pid of [0,1]){assert.equal(bonusPoints(g,pid),6);assert.equal(bonusChainPoints(g,pid),0);assert.equal(score(g.players[pid],g).bonus,6);}
 assert.doesNotMatch(bonusStatusHtml(g),/\+3|Schatzkette vollendet/);assert(validBonusState(JSON.parse(JSON.stringify(g))));
});


test('Temperature names the actual closest confirmed field and explains orthogonal distance in the card',()=>{
 const g=fresh([11,60,104]);noteBonusMove(g,0,[7,10]);const reading=treasureHuntView(g,0).reading;assert.deepEqual(reading.focus,[10]);
 const html=bonusStatusHtml(g),summary=html.split('</summary>')[0];assert.match(summary,/Heiß: K1/);assert.doesNotMatch(summary,/Heiß.*W1/);assert.match(html,/Heiß: 1 Schritt/);assert.match(html,/Warm: 2–3/);assert.match(html,/Kalt: ab 4/);assert.match(html,/Diagonal zählt zwei Schritte/);assert.match(html,/Suchzug W1 · H1, K1/);
 const saved=JSON.parse(JSON.stringify(g));assert(validBonusState(saved));assert.deepEqual(treasureHuntView(saved,0).reading.focus,[10]);
 const bad=structuredClone(g);bad.bonuses.hunt.readings[0].focus=[104];assert(!validBonusState(bad));
});
test('Older persisted temperature readings show their own search coordinates without needing their round remembered',()=>{
 const g=fresh();g.bonuses.hunt.readings[0]={round:1,cells:[7,22,37],found:0,warmth:'warm'};const html=bonusStatusHtml(g),summary=html.split('</summary>')[0];
 assert(validBonusState(g));assert.match(summary,/Warm: H1, H2 \+1/);assert.match(html,/Warm: H1, H2, H3/);assert.match(html,/Suchzug W1 · H1, H2, H3/);
});

test('Each actual treasure distinguishes own or tied finds from unavailable opponent finds without reading locations',()=>{
 const g=fresh();g.round=3;g.bonuses.fields[0].claim={round:1,winners:[1]};g.bonuses.fields[2].claim={round:2,winners:[0,1]};
 const view=treasureHuntView(g,0);assert.deepEqual(view.treasures.map(t=>t.state),['taken','open','earned']);assert.equal(view.found,1);assert.equal(view.remaining,1);
 for(const f of g.bonuses.fields)Object.defineProperty(f,'index',{get(){throw Error('secret location read');}});
 let html=bonusStatusHtml(g);assert.match(html,/<s>Schatz 1<\/s>/);assert.doesNotMatch(html,/<s>Schatz [23]<\/s>/);assert.match(html,/Schatz 1: Vergeben an Computer in Wurf 1/);assert.match(html,/Schatz 3: Dein Fund in Wurf 2/);assert.match(html,/Kettenbonus nicht mehr erreichbar/);
 assert.equal((html.match(/aria-disabled="true"/g)||[]).length,2);
 g.hiddenScores=true;html=bonusStatusHtml(g);assert.doesNotMatch(html,/\+\d|feature-reward|\d Punkte/);assert.match(html,/<s>Schatz 1<\/s>/);
});

test('Seven real committed moves retain only the last five own probes in order across reload and passes',()=>{
 let g=fresh([0,14,104]);const expected=[];
 for(let n=0;n<7;n++){
  const cells=[7+n*15];g=settle(applyMove(choosing(g,cells[0]),0,{ci:0,ni:0,cells}));expected.push({round:n+1,cells});
 }
 const loaded=JSON.parse(JSON.stringify(g));assert(validBonusState(loaded));
 const view=treasureHuntView(loaded,0);assert.equal(view.history.length,5);assert.deepEqual(view.history.map(({round,cells})=>({round,cells})),expected.slice(-5));assert.deepEqual(view.history.at(-1),view.reading);assert.deepEqual(treasureHuntView(loaded,1).history,[]);
 const html=bonusStatusHtml(loaded);assert.match(html,/Deine letzten 5 Suchzüge/);assert.equal((html.match(/class="treasure-reading"/g)||[]).length,5);assert(html.indexOf('Suchzug W7')<html.indexOf('Suchzug W3'));assert.doesNotMatch(html,/Suchzug W[12] ·/);
 const passed=applyMove(choosing(loaded),0,{pass:true});assert.deepEqual(treasureHuntView(passed,0).history,view.history);
});

test('Legacy single probes are preserved lazily and same-round extra probes remain separate',()=>{
 const g=fresh();g.round=4;g.bonuses.hunt.readings[0]={round:2,cells:[7],found:0,warmth:'hot'};
 const before=JSON.stringify(g);assert.equal(treasureHuntView(g,0).history.length,1);bonusStatusHtml(g);assert.equal(JSON.stringify(g),before);
 noteBonusMove(g,0,[22]);noteBonusMove(g,0,[37]);
 assert.deepEqual(treasureHuntView(g,0).history.map(r=>r.round),[2,4,4]);assert.deepEqual(treasureHuntView(g,0).history.map(r=>r.cells),[[7],[22],[37]]);assert(validBonusState(g));
});

test('History is own-only, defensive, omitted from network views and never changes old temperatures after settlement',()=>{
 const g=fresh([8,60,104]);noteBonusMove(g,0,[7]);const original=treasureHuntView(g,0).history;
 g.bonuses.fields[0].claim={round:1,winners:[1]};assert.equal(treasureHuntView(g,0).history[0].warmth,'hot');
 Object.defineProperty(g.bonuses.hunt.history,1,{get(){throw Error('foreign history read');}});
 const view=treasureHuntView(g,0);view.history[0].cells[0]=104;view.treasures[0].winners[0]=0;assert.deepEqual(treasureHuntView(g,0).history,original);assert.equal(treasureHuntView(g,0).treasures[0].state,'taken');
 assert.doesNotThrow(()=>bonusStatusHtml(g));const projection=projectBonuses(g);assert(!('hunt'in projection));assert(!('history'in projection));
});

test('All awarded treasures end probing while the last five historical moves stay visible',()=>{
 const g=fresh([7,22,104]);noteBonusMove(g,0,[37]);const history=treasureHuntView(g,0).history;
 g.bonuses.fields.forEach(f=>{f.pending=[];f.claim={round:1,winners:[1]};});
 noteBonusMove(g,0,[52]);assert.deepEqual(treasureHuntView(g,0).history,history);assert.equal(treasureHuntView(g,0).remaining,0);
 const html=bonusStatusHtml(g);assert.match(html,/Suche beendet/);assert.match(html,/Suchzug W1 · H3/);assert.equal((html.match(/<s>Schatz/g)||[]).length,3);
});

test('Bounded saved history rejects malformed entries, mismatched latest readings and reversed rounds',()=>{
 const g=fresh();noteBonusMove(g,0,[7]);g.round=2;noteBonusMove(g,0,[22]);assert(validBonusState(g));
 const invalid=[h=>h.history=null,h=>h.history.pop(),h=>h.history[0]=Array(6).fill(h.readings[0]),h=>h.history[0][0].cells=[105],h=>h.history[0][0].focus=[104],h=>h.history[0][0].secret=8,h=>h.history[0][0].round=3,h=>h.history[0].reverse(),h=>h.history[0]=[],h=>h.history[0].at(-1).warmth='cold',h=>h.history[1]=[h.readings[0]]];
 for(const mutate of invalid){const bad=structuredClone(g);mutate(bad.bonuses.hunt);assert(!validBonusState(bad));}
});
