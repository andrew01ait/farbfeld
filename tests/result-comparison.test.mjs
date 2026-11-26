import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,score} from '../public/game/engine.js';
import {createComputerGame} from '../public/game/computer.js';
import {resultComparison} from '../public/game/game-info.js';
import {resultComparisonHTML} from '../public/game/variant-ui.js';
const finished=()=>{const g=createComputerGame(false,'classic','medium',true,true,{battleship:true,discovery:true,objectives:true,shuffle:true});g.status='finished';g.phase='finished';return g;};

test('Every comparison category and difference reconciles with final authoritative totals',()=>{
 const g=finished();g.players[0].columns[7]=1;g.players[0].colors.g=5;g.players[0].jokers=3;g.players[1].jokers=7;g.players[1].marks[7]=true;g.mines.used[0]=true;
 g.bonuses.fields[0].claim={round:1,winners:[1]};g.variants.battleship.sunk[0][0]=true;g.variants.objectives.tasks[1].claims[1]=1;g.variants.objectives.tasks[1].firstRound=1;
 const before=JSON.stringify(g),data=resultComparison(g,0,1);
 assert.equal(data.rows.length,8);for(const side of ['own','selected','delta'])assert.equal(data.rows.reduce((n,r)=>n+r[side],0),data.total[side]);
 assert.equal(data.total.own,score(g.players[0],g).total);assert.equal(data.total.selected,score(g.players[1],g).total);assert.equal(data.total.delta,data.total.selected-data.total.own);
 assert.equal(data.rows.find(r=>r.type==='mines').own,-5);assert.equal(data.rows.find(r=>r.type==='stars').delta,2);assert.equal(JSON.stringify(g),before);
});

test('Six-player comparisons keep the actual own seat and each chosen participant even with duplicate names',()=>{
 const g=createGame(['Same','Same','C','D','E','Same'],'local');g.status='finished';g.phase='finished';
 g.players.forEach((p,i)=>p.jokers=i);
 for(let selected=0;selected<6;selected++){const data=resultComparison(g,3,selected);assert.equal(data.own,3);assert.equal(data.selected,selected);assert.equal(data.total.delta,selected-3);}
 const html=resultComparisonHTML(g,3,5);assert.equal((html.match(/data-action="result-compare"/g)||[]).length,5);assert.match(html,/data-i="5" aria-pressed="true"/);assert.doesNotMatch(html,/data-i="3"/);
 assert.match(html,/Same · Person 6/);g.players[0].name='Du';assert.match(resultComparisonHTML(g,3,0),/Du · Person 1/);
});

test('Unfinished or incomplete hidden data cannot reveal comparison details',()=>{
 const g=createGame(['A','B'],'local');Object.defineProperty(g.players[1],'marks',{get(){throw Error('hidden opponent read');}});
 for(const hiddenScores of [false,true]){g.hiddenScores=hiddenScores;assert.equal(resultComparison(g,0,1),null);assert.equal(resultComparisonHTML(g,0,1),'');}
 assert.equal(resultComparison(null,0,1),null);const end=finished();end.players[1].hidden=true;assert.equal(resultComparison(end,0,1),null);
 for(const index of [-1,2,1.5,'1'])assert.equal(resultComparison(finished(),0,index),null);
});

test('Forfeits display the fixed minus-ten result and omit ordinary contributions for that participant',()=>{
 const g=finished();g.players[1].left=true;g.players[1].columns[0]=5;
 const data=resultComparison(g,0,1);assert.equal(data.total.selected,-10);assert(data.rows.filter(r=>r.label!=='Partie verlassen').every(r=>r.selected===null&&r.delta===null));
 assert.equal(data.rows.at(-1).selected,-10);const html=resultComparisonHTML(g,0,1);assert.match(html,/fest −10 Punkte/);assert.match(html,/regulären Kategorien/);assert.match(html,/>–<\/td>/);
});

test('Completed concealed games reveal all categories, escape names and retain semantic table headers',()=>{
 const g=finished();g.hiddenScores=true;g.players[1].name='<img src=x>';
 const html=resultComparisonHTML(g,0,1);assert.match(html,/&lt;img src=x&gt;/);assert.doesNotMatch(html,/<img/);assert.match(html,/<caption>/);assert.match(html,/scope="col"/);assert.match(html,/scope="row"/);assert.match(html,/Differenz =/);assert.match(html,/Schiffsboni/);assert.match(html,/Aufträge/);
 assert.doesNotMatch(html,/Entdeckermodus|Farben neu mischen|Versteckte Minen/);
});

test('Unselected bonus categories and solo games do not gain comparison controls or invented point categories',()=>{
 const g=createGame(['A','B'],'local');g.status='finished';const data=resultComparison(g,0,1);assert.equal(data.rows.length,4);assert.deepEqual(data.rows.map(r=>r.type),['columns','colors','jokers','stars']);
 const solo=createGame(['Du'],'solo');solo.status='finished';assert.equal(resultComparisonHTML(solo,0,0),'');
});
