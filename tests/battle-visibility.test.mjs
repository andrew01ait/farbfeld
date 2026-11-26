import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame} from '../public/game/engine.js';
import {confirmHumanFleet,validVariantState} from '../public/game/variants.js';
import {projectGame} from '../public/game/game-info.js';
import {cellVariantHTML,cellVariantLabel,battlePanelHTML,playVariantEffects} from '../public/game/variant-ui.js';

function fixture(hiddenScores=true){
 let g=createGame(['A','B'],'room',[],{hiddenScores,variants:{battleship:true}});
 g=confirmHumanFleet(confirmHumanFleet(g,0),1);
 const b=g.variants.battleship;
 for(let who=0;who<2;who++){
  const ship=b.fleets[1-who][0],water=Array.from({length:105},(_,i)=>i).find(i=>!b.fleets[1-who].flat().includes(i));
  b.shots[who][ship[0]]=2;b.shots[who][water]=1;b.sunk[who][0]=true;b.revealed[who]=[[...ship]];
 }
 b.lastVolley={id:'2:1',by:1,round:1,results:[{index:b.fleets[0][0][0],hit:true},{index:b.shots[1].indexOf(1),hit:false}],sunk:[{cells:[...b.fleets[0][0]],points:5}]};
 assert.ok(validVariantState(g));return g;
}

test('The numbered shot map keeps all seven rows and all original shot coordinates',()=>{
 const html=battlePanelHTML(fixture(),{open:true,own:1});
 const rows=[...html.matchAll(/class="battle-row" aria-hidden="true">(\d)<\/span>/g)];
 assert.deepEqual(rows.map(row=>row[1]),['1','2','3','4','5','6','7']);
 assert.equal([...html.matchAll(/data-shot="/g)].length,105);
 assert.match(html,/data-shot="0"[^>]+aria-label="A1:/);assert.match(html,/data-shot="104"[^>]+aria-label="O7:/);
 for(let i=0;i<7;i++)assert.ok(html.slice(rows[i].index).startsWith(rows[i][0]+'<span data-shot="'+i*15+'"'));
});

test('Hidden network views omit every foreign shot, hit, wreck and volley while retaining own attacks; finish reveals the original facts',()=>{
 const g=fixture(),before=JSON.stringify(g);
 for(const own of [0,1]){
  const view=projectGame(g,own),b=view.variants.battleship;
  assert.ok(b.shots[1-own].every(x=>x===0));assert.ok(b.sunk[1-own].every(x=>x===false));assert.deepEqual(b.revealed[1-own],[]);
  assert.deepEqual(b.shots[own],g.variants.battleship.shots[own]);assert.deepEqual(b.sunk[own],g.variants.battleship.sunk[own]);assert.deepEqual(b.revealed[own],g.variants.battleship.revealed[own]);
  assert.equal(b.lastVolley?.by===own,own===1);if(own===0)assert.equal(b.lastVolley,null);
  assert.ok(validVariantState(view,{allowProjection:true}));
 }
 assert.equal(JSON.stringify(g),before);
 g.status='finished';g.phase='finished';
 for(const own of [0,1]){const b=projectGame(g,own).variants.battleship;assert.deepEqual(b.shots,g.variants.battleship.shots);assert.deepEqual(b.revealed,g.variants.battleship.revealed);assert.deepEqual(b.lastVolley,g.variants.battleship.lastVolley);}
});

test('Open network views keep incoming hits, misses, wrecks and animations available',()=>{
 const g=fixture(false);
 for(const own of [0,1]){const b=projectGame(g,own).variants.battleship;assert.deepEqual(b.shots,g.variants.battleship.shots);assert.deepEqual(b.sunk,g.variants.battleship.sunk);assert.deepEqual(b.revealed,g.variants.battleship.revealed);assert.deepEqual(b.lastVolley,g.variants.battleship.lastVolley);}
});

test('Hidden UI never reads incoming coordinates from full local state or an older direct-host projection',()=>{
 for(const own of [0,1]){
  const g=fixture(),b=g.variants.battleship,index=b.fleets[own][0][0];
  Object.defineProperty(b.shots,1-own,{get(){throw Error('foreign shot read');}});
  assert.doesNotMatch(cellVariantHTML(g,own,index,own),/ship-hit/);
  assert.doesNotMatch(cellVariantLabel(g,own,index,own),/getroffen/);
  assert.match(battlePanelHTML(g,{own}),/Gegnerische Schüsse bleiben verdeckt/);
  assert.equal(playVariantEffects(g,{own,volley:{by:1-own,results:[{index,hit:true}],sunk:[]},document:{querySelector(){throw Error('foreign location scroll or effect');}}}),0);
 }
});

test('Shot and sinking feedback attaches SVGs directly to each target cell without screen-coordinate sizing',()=>{
 for(const own of [0,1])for(const by of [own,1-own])for(const reducedMotion of [false,true]){
  const g=fixture(false),cells=new Map([7,22].map(i=>[i,{children:[],scrollIntoView(){},append(e){this.children.push(e);},getBoundingClientRect(){throw Error('screen-coordinate positioning');}}]));
  const animations=[],root={querySelector(selector){return cells.get(Number(selector.match(/(?:data-shot|data-i)="(\d+)"/)[1]));},getBoundingClientRect(){throw Error('screen-coordinate root');}};
  const doc={querySelector(){return root;},createElement(){return {setAttribute(){},remove(){},animate(frames,options){animations.push({frames,options});return {finished:new Promise(()=>{})};}};}};
  const duration=playVariantEffects(g,{own,volley:{by,results:[{index:7,hit:true},{index:22,hit:false}],sunk:[{cells:[7],points:5}]},document:doc,reducedMotion});
  assert.equal(duration,reducedMotion?350:1600);assert.equal(cells.get(7).children.length,2);assert.equal(cells.get(22).children.length,1);
  for(const cell of cells.values())for(const effect of cell.children){assert.match(effect.className,/battle-cell-effect/);assert.match(effect.innerHTML,/<svg viewBox="0 0 24 24"/);assert.equal(effect.style,undefined);}
  assert.equal(animations.length,3);
 }
});

test('The preview shot stays on the supplied stage and does not scroll',()=>{
 const effects=[];
 const cell={append(effect){effects.push(effect);},scrollIntoView(){throw Error('preview scrolled');}};
 const stage={querySelector:selector=>selector==='.battle-target-grid'?{querySelector:()=>cell}:null};
 const document={querySelector(){throw Error('production board accessed');},createElement(){return {setAttribute(){},animate(){return {finished:new Promise(()=>{})};}};}};
 const duration=playVariantEffects(fixture(false),{volley:{by:0,results:[{index:52,hit:false}],sunk:[]},document,root:stage,scroll:false});
 assert.equal(duration,700);assert.match(effects[0].className,/water-effect/);
});

test('Whole sinking ships use the exact horizontal or vertical CSS grid area and remain absent for hidden opponent volleys',()=>{
 for(const ship of [[52,53,54],[52,67,82]])for(const numbered of [false,true]){
  const g=fixture(false),overlays=[],grid={classList:{contains:name=>numbered&&name==='numbered-board'},append(e){overlays.push(e);}},hull={remove(){},animate(){return {finished:new Promise(()=>{})};}};
  const cell={parentElement:grid,append(){},scrollIntoView(){},getBoundingClientRect(){throw Error('viewport geometry');}};
  const root={querySelector(){return cell;}};
  const doc={querySelector(){return root;},createElement(){return {style:{},setAttribute(){},remove(){},firstElementChild:hull,animate(){return {finished:new Promise(()=>{})};}};}};
  playVariantEffects(g,{own:0,volley:{by:1,results:[{index:52,hit:true}],sunk:[{cells:ship,points:3}]},document:doc,reducedMotion:false});
  assert.equal(overlays.length,1);const effect=overlays[0];assert.match(effect.className,/battle-sinking-ship/);
  assert.equal(effect.style.gridColumn,(numbered?9:8)+' / span '+(ship[1]===53?3:1));assert.equal(effect.style.gridRow,ship[1]===53?'5 / span 1':'5 / span 3');
  assert.match(effect.innerHTML,/ship-silhouette/);assert.match(effect.innerHTML,ship[1]===53?/viewBox="0 0 120 32"/:/viewBox="0 0 32 120"/);
  g.hiddenScores=true;playVariantEffects(g,{own:0,volley:{by:1,results:[{index:52,hit:true}],sunk:[{cells:ship,points:3}]},document:{querySelector(){throw Error('hidden ship location');}},reducedMotion:false});
 }
});
