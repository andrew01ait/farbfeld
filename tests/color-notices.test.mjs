import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createGame,BOARD,finishRound,applyMineAttack} from '../public/game/engine.js';
import {colorAnnouncements,colorCompletionText,projectGame} from '../public/game/game-info.js';

// Exercise the actual app renderer, including its selection of events, without a DOM shim.
const app=readFileSync(new URL('../public/game/app.js',import.meta.url),'utf8');
const renderer=app.slice(app.indexOf('function completionsHTML(g){'),app.indexOf('\nfunction announceColors(g)'));
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const render=Function('colorAnnouncements','colorCompletionText','myPid','esc',renderer+';return completionsHTML;')(colorAnnouncements,colorCompletionText,()=>0,esc);
const fill=(g,pid)=>BOARD.forEach((c,i)=>{if(c==='g')g.players[pid].marks[i]=true;});

test('Confirmed colour cards survive many rounds, reload and every supported mode without exposing hidden points',()=>{
 for(const mode of ['solo','computer','local','room','direct'])for(const hiddenScores of [false,true]){
  const g=createGame(mode==='solo'?['Du']:['Du','Mika'],'local',[],{hiddenScores});g.mode=mode;
  fill(g,0);if(g.players[1])fill(g,1);finishRound(g);
  for(let i=0;i<12;i++)finishRound(g);
  const restored=JSON.parse(JSON.stringify(projectGame(g,0))),html=render(restored);
  assert.match(html,/Du hast Grün abgeschlossen/);
  if(g.players[1])assert.match(html,/Mika hat Grün abgeschlossen/);
  assert.equal((html.match(/class="completion-item"/g)||[]).length,g.players.length);
  assert.equal(html.includes('status-score'),!hiddenScores);
  if(hiddenScores)assert.doesNotMatch(html,/Punkte|\+5/);
 }
});

test('Persistent cards track mine losses, inherited bonuses and later recompletion from authoritative state',()=>{
 let g=createGame(['Robin','Mika'],'room',[],{mines:true});
 fill(g,0);finishRound(g);finishRound(g);fill(g,1);finishRound(g);
 g.round=20;g.active=1;g.phase='choose';g.dice={colors:['g','b','o'],numbers:[1,2,3]};
 assert.equal(g.players[1].colors.g,3);
 g=applyMineAttack(g,1,BOARD.indexOf('g'),()=>0);
 const html=render(JSON.parse(JSON.stringify(projectGame(g,0))));
 assert.doesNotMatch(html,/Robin hat Grün abgeschlossen/);
 assert.match(html,/Mika hat Grün abgeschlossen/);assert.match(html,/\+5/);assert.doesNotMatch(html,/\+3/);
 fill(g,0);finishRound(g);
 const restored=render(JSON.parse(JSON.stringify(g)));
 assert.match(restored,/Robin hat Grün abgeschlossen/);assert.match(restored,/\+3/);
 assert.equal((restored.match(/Mika hat Grün abgeschlossen/g)||[]).length,1);
});
