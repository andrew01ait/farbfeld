import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,BOARD,finishRound,score,rollGame,applyMove,findMove} from '../public/game/engine.js';
import {projectGame,isHidden,isScoreHidden,scoreBreakdown,columnStatus,colorAnnouncements,colorCompletionText} from '../public/game/game-info.js';
import {mayInspect} from '../public/game/view-state.js';
function game(hiddenScores=false){const g=createGame(['A','B','C'],'room',[],{hiddenScores});g.gameId='test';return g;}
test('Punkteaufschlüsselung entspricht der Regelwertung, einschließlich Nullpunkten in Spalte H',()=>{
 const g=game();g.players[0].columns[7]=0;g.players[0].colors.g=3;g.players[0].jokers=6;
 const d=scoreBreakdown(g,0,0),s=score(g.players[0]);for(const key of ['columns','colors','jokers','penalty','total','stars'])assert.equal(d[key],s[key]);
 assert.equal(d.columnDetails[7].points,0);assert.equal(d.colorDetails.find(c=>c.color==='g').points,3);
});
test('Erstabschluss, späterer Abschluss und vollständig aber noch nicht gewertet werden unterschieden',()=>{
 const g=game();for(let row=0;row<7;row++)g.players[1].marks[row*15+7]=true;
 assert.deepEqual(columnStatus(g,1,7),{complete:false,pending:true,points:null,first:false,later:false,high:1,low:0});
 g.columnClaims[7]=1;finishRound(g);const later=columnStatus(g,1,7);assert.equal(later.points,0);assert.equal(later.complete,true);assert.equal(later.later,true);assert.equal(later.pending,false);
 for(let row=0;row<7;row++)g.players[0].marks[row*15]=true;finishRound(g);assert.equal(columnStatus(g,0,0).first,true);
});
test('Farbabschlüsse erzeugen je Person genau einen Hinweis nach der gemeinsamen Runde',()=>{
 const g=game();BOARD.forEach((c,i)=>{if(c==='g'){g.players[0].marks[i]=true;g.players[1].marks[i]=true;}});finishRound(g);
 assert.equal(g.announcements.length,2);assert(g.announcements.every(e=>e.points===5&&e.color==='g'&&e.round===1));
 finishRound(g);assert.equal(g.announcements.length,2);
 BOARD.forEach((c,i)=>{if(c==='g')g.players[2].marks[i]=true;});finishRound(g);assert.equal(g.announcements.at(-1).points,3);
});
test('Verdeckte Projektion enthält keine fremden Blätter, Joker, Punktedetails oder Zugdetails',()=>{
 const g=game(true);g.players[1].marks[7]=true;g.players[1].jokers=7;
 g.log=[{round:1,pid:0,player:'A',color:'g',count:1},{round:1,pid:1,player:'B',color:'g',count:1}];
 g.announcements=[{id:'1:1:g',pid:1,name:'B',color:'g',round:1,points:5}];
 const before=structuredClone(g),v=projectGame(g,0);assert.deepEqual(g,before);
 assert.deepEqual(v.players[1],{id:'1',name:'B',hidden:true});assert.equal(v.players[0].marks.length,105);
 assert.equal(v.log[1].count,undefined);assert.equal(v.announcements[0].points,undefined);
 assert.equal(scoreBreakdown(v,1,0),null);assert.equal(mayInspect(v,1,0),false);assert.equal(mayInspect(v,0,0),true);
 assert.equal(colorAnnouncements(g,0)[0].points,undefined);assert.equal(colorAnnouncements(g,1)[0].points,undefined);
});
test('Verdeckt verbirgt auch die eigenen Punkte und Boni bis zum Ende, das eigene Blatt bleibt spielbar',()=>{
 for(const mode of ['local','computer','room','direct']){
  const g=game(true);g.mode=mode;
  g.players[0].columns[7]=0;g.players[0].colors.g=5;g.players[0].jokers=6;
  g.announcements=[{id:'1:0:g',pid:0,name:'A',color:'g',round:1,points:5}];
  const expected=score(g.players[0]),own=projectGame(g,0);
  assert.equal(isScoreHidden(own),true);assert.equal(isHidden(own,0,0),false);
  assert.equal(mayInspect(own,0,0),true);assert.equal(mayInspect(own,1,0),false);
  assert.deepEqual(own.players[0].marks,g.players[0].marks);assert.equal(own.players[0].jokers,6);
  for(let pid=0;pid<g.players.length;pid++)assert.equal(scoreBreakdown(own,pid,0),null);
  assert.equal(colorAnnouncements(own,0)[0].points,undefined);
  g.status='finished';g.phase='finished';
  assert.equal(isScoreHidden(g),false);assert.equal(scoreBreakdown(g,0,0).total,expected.total);
  assert.equal(colorAnnouncements(g,0)[0].points,5);assert(mayInspect(g,1,0));
 }
});
test('Gleiche Namen legen keine fremden Zugdetails offen; nach Spielende werden alle Blätter und Punkte aufgedeckt',()=>{
 const g=game(true);g.players[1].name='A';g.log=[{round:1,player:'A',color:'y',count:5}];
 assert.equal(projectGame(g,0).log[0].count,undefined);
 g.status='finished';g.phase='finished';assert.equal(projectGame(g,0),g);assert.equal(isHidden(g,1,0),false);assert.equal(mayInspect(g,1,0),true);assert(scoreBreakdown(g,1,0));
});

test('Verdeckte Dreier-Partie kann ausschließlich mit den projizierten eigenen Informationen bis zur Auflösung gespielt werden',()=>{
 let g=game(true),seed=79,moves=0;const rng=max=>{seed=(seed*1664525+1013904223)>>>0;return seed%max;};
 while(g.status==='playing'&&moves<1200){g=rollGame(g,rng);const active=g.active;for(const pid of [active,...g.players.map((_,i)=>i).filter(i=>i!==active)]){const v=projectGame(g,pid);assert.equal(v.players[pid].marks.length,105);assert(v.players.every((p,i)=>i===pid||p.hidden));const move=findMove(v,pid)||{pass:true};g=applyMove(g,pid,move);moves++;}}
 assert.equal(g.status,'finished');assert(moves>30&&moves<1200);assert(projectGame(g,0).players.every(p=>p.marks.length===105));
});

test('Farbabschluss spricht Du korrekt an und behält Namen und verdeckte Punkte bei',()=>{
 for(const [name,verb] of [['Du','hast'],['du','hast'],['Computer','hat'],['Robin','hat']]){
  const event={id:'1:0:g',pid:0,name,color:'g',round:1,points:5};
  assert.equal(colorCompletionText(event),name+' '+verb+' Grün abgeschlossen · +5');
  assert.equal(colorCompletionText(event,{withPoints:false}),name+' '+verb+' Grün abgeschlossen');
  const g=game(true);g.announcements=[event];
  assert.equal(colorCompletionText(colorAnnouncements(g,0)[0]),name+' '+verb+' Grün abgeschlossen');
  g.status='finished';assert.equal(colorCompletionText(colorAnnouncements(g,0)[0]),name+' '+verb+' Grün abgeschlossen · +5');
 }
});
