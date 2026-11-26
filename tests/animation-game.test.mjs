import test from 'node:test';
import assert from 'node:assert/strict';
import {animationPreviewHTML} from '../public/game/animation-preview.js';
import {animationGameScene} from '../public/game/animation-game.js';
import {animationTiming,recordedTime,editedTime} from '../public/game/animation-playback.js';
import {damageBlasts,validMineState} from '../public/game/engine.js';
import {bonusAwards,bonusChainPoints,treasureHuntView,validBonusState} from '../public/game/bonus-fields.js';
import {validVariantState} from '../public/game/variants.js';
import {completedFeaturePanels,mineInspectionChange} from '../public/game/view-state.js';
import {shipSunkBanner} from '../public/game/variant-ui.js';

test('Timing keeps recorded view order with longer, zero and simultaneous intervals',()=>{
 const recorded=[0,300,300,1200];
 const plan=animationTiming(recorded,1700,[800,900,200,0],1000);
 assert(plan.changed);
 assert.deepEqual(plan.steps.map(step=>step.at),[800,1700,1900,1900]);
 assert.equal(plan.tail.at,2900);
 assert.deepEqual(recordedTime(plan,400),{at:0,index:-1});
 assert.deepEqual(recordedTime(plan,1250),{at:150,index:0});
 assert.deepEqual(recordedTime(plan,1800),{at:300,index:1});
 assert.deepEqual(recordedTime(plan,1900),{at:1200,index:3});
 assert.deepEqual(recordedTime(plan,2400),{at:1450,index:3});
 assert.deepEqual(recordedTime(plan,3000),{at:1700,index:3});
 assert.equal(editedTime(plan,150),1250);
 assert.equal(editedTime(plan,300),1700);
 assert.equal(editedTime(plan,1100),1900);
 const reset=animationTiming(recorded,1700);
 assert(!reset.changed);
 assert.deepEqual(reset.steps.map(step=>step.at),recorded);
 assert.deepEqual(recordedTime(reset,300),{at:300,index:2});
});

test('Every demo choice is repeatable and uses valid engine states',()=>{
 const ids=[...animationPreviewHTML().matchAll(/<option value="([^"]+)"/g)].map(match=>match[1]);
 assert.equal(ids.length,24);assert.equal(new Set(ids).size,ids.length);
 for(const id of ids){
  const scene=animationGameScene(id);
  assert.deepEqual(scene,animationGameScene(id),id);
  for(const state of [scene.before,...scene.steps]){
   assert(validVariantState(state),id);assert(validMineState(state),id);assert(validBonusState(state),id);
  }
 }
});

test('Ship banners require a sinking and preserve concealed opponent information',()=>{
 const hit=animationGameScene('ship-hit').steps.at(-1);
 assert.equal(shipSunkBanner(hit,hit.variants.battleship.lastVolley,0),null);
 const sinking=animationGameScene('ship-horizontal').steps.at(-1),volley=sinking.variants.battleship.lastVolley;
 assert.deepEqual(shipSunkBanner(sinking,volley,0),{type:'battleship',title:'Schiff versenkt',detail:'Dein Angriff · Schiffslänge 3 · +3 Punkte'});
 sinking.hiddenScores=true;
 assert.doesNotMatch(shipSunkBanner(sinking,volley,0).detail,/Punkte/);
 assert.equal(shipSunkBanner(sinking,{by:0,get sunk(){throw Error('concealed sinking read');}},1),null);
});

test('Game demo covers the distinct scroll, scoring and toast inputs',()=>{
 const last=id=>animationGameScene(id).steps.at(-1);
 for(const [id,pid] of [['airstrike-hit',1],['airstrike-miss',1],['airstrike-concealed',undefined],['mine-outgoing',undefined],['mine-double',undefined]]){
  const state=last(id),blasts=damageBlasts(state);
  assert.equal(blasts.length,id==='mine-double'?2:1);
  assert.equal(mineInspectionChange(state,blasts,0),pid);
 }
 assert(last('airstrike-ready').mines.unlocked[0]);
 assert(last('ship-vertical').variants.battleship.lastVolley.sunk.length);
 assert(completedFeaturePanels(last('ship-final'),0).battle);
 for(const warmth of ['hot','warm','cold'])assert.equal(treasureHuntView(last('treasure-'+warmth),0).reading.warmth,warmth);
 const firstFind=animationGameScene('treasure-find');
 assert.equal(treasureHuntView(firstFind.steps[0],0).reading.found,1);
 assert.equal(bonusAwards(firstFind.steps[1]).length,1);
 assert.equal(bonusChainPoints(last('treasure-chain'),0),3);
 assert.equal(last('color-complete').announcements.length,1);
 assert(last('mix').variants.mixing.changed[0].length>0);
 assert.equal(last('finish').status,'finished');
});
