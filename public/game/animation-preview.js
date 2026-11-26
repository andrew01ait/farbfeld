import {boardFor} from './boards.js';
import {COLS,LABELS,SHAPES,createGame,rollGame,mineBlastTargets} from './engine.js';
import {mineControlsHtml,mineEffect,mineLostMark,playMineBlast} from './mine-ui.js';
import {battleTargetGridHTML,playVariantEffects,playGameBanner,shipSunkBanner} from './variant-ui.js';
import {shuffleFreeColors} from './variants.js';
import {gameOnlyScenes} from './animation-game.js';

const exampleMarks=[6,7,8,21,22,23,36,37,38,50,51,52,53,54,66,67,68,82,83];
const blast=(kind,target,cells)=>({kind,target,by:1,turn:12,targets:[{pid:0,cells}]});
const volley=(index,hit,sunk=[])=>({by:0,results:[{index,hit}],sunk});
const scenes=[
 {id:'airstrike-hit',label:'Luftangriff · Treffer',blasts:[blast('airstrike',52,[37,51,52,53,67])]},
 {id:'airstrike-miss',label:'Luftangriff · Leeres Ziel',blasts:[blast('airstrike',55,[])]},
 {id:'airstrike-ready',label:'Luftangriff · Freigeschaltet'},
 {id:'mine-single',label:'Versteckte Minen · Eine Mine',blasts:[blast('hidden',52,[37,51,52,53,67])]},
 {id:'mine-double',label:'Versteckte Minen · Zwei Minen gleichzeitig',blasts:[blast('hidden',52,[37,51,52,53,67]),blast('hidden',53,[38,53,54,67,68])]},
 {id:'ship-hit',label:'Schiffsboni · Treffer',volley:volley(52,true)},
 {id:'ship-miss',label:'Schiffsboni · Fehlschuss',volley:volley(52,false)},
 {id:'ship-horizontal',label:'Schiffsboni · Schiff waagrecht versenkt',volley:volley(53,true,[{cells:[51,52,53],points:3}])},
 {id:'ship-vertical',label:'Schiffsboni · Schiff senkrecht versenkt',volley:volley(67,true,[{cells:[37,52,67],points:3}])},
 {id:'mix',label:'Farben neu mischen'},
 {id:'roll',label:'Würfelwurf'},
];

export const animationScene=id=>scenes.find(scene=>scene.id===id)??gameOnlyScenes.find(scene=>scene.id===id);

export function animationPreviewHTML(selected){
 const options=items=>items.map(({id,label})=>`<option value="${id}"${id===selected?' selected':''}>${label}</option>`).join('');
 return `<div class="animation-preview">
  <div class="animation-preview-controls">
   <label class="visually-hidden" for="animation-preview-choice">Szene auswählen</label>
   <select id="animation-preview-choice" class="outline-btn"><optgroup label="Animationen">${options(scenes)}</optgroup><optgroup label="Weitere Spielszenen">${options(gameOnlyScenes)}</optgroup></select>
   <button class="primary" type="button" data-action="animation-game">Spielansicht öffnen</button>
   <button class="outline-btn" type="button" data-animation-play>Ausschnitt abspielen</button>
   <button class="text-btn" type="button" data-action="animation-back">← Diagnose</button>
  </div>
  <div class="animation-preview-stage" data-animation-stage></div>
  <span class="visually-hidden" role="status" data-animation-status></span>
 </div>`;
}

function exampleBoard(layout,{mark,patterns,damage=[]}){
 const damaged=new Set(damage);
 return `<div class="board numbered-board" data-player-board="0" role="img" aria-label="Beispielspielfeld mit Spalten A bis O und Zeilen 1 bis 7">
  <span aria-hidden="true"></span>${[...COLS].map((col,i)=>`<span class="col-label${i===7?' center':''}" style="grid-column:${i+2};grid-row:1" aria-hidden="true">${col}</span>`).join('')}
  ${Array.from({length:7},(_,row)=>`<span class="row-label" style="grid-column:1;grid-row:${row+2}" aria-hidden="true">${row+1}</span>`).join('')}
  ${layout.cells.map((color,i)=>{
   const lost=damaged.has(i),marked=exampleMarks.includes(i)&&!lost;
   const symbol=layout.stars.includes(i)?'<span class="star">☆</span>':patterns?'<span class="pattern">'+SHAPES[color]+'</span>':'';
   return `<span class="cell${marked?' marked':''}${lost?' mine-damaged':''}" data-i="${i}" data-color="${color}" style="--cell:var(--${color});grid-column:${i%15+2};grid-row:${Math.floor(i/15)+2}" aria-hidden="true">${symbol}${lost?'<span class="mine-ghost">'+mineLostMark+'</span>':''}${marked?'<span class="cell-stamp">'+mark+'</span>':''}</span>`;
  }).join('')}
 </div>`;
}

function shipScene(stage,shot,play){
 const shots=Array(105).fill(0),wrecks=new Set(),lastShot=shot.results[0];
 for(const ship of shot.sunk){
  for(const cell of ship.cells){
   if(cell!==lastShot.index)shots[cell]=2;
   if(play)wrecks.add(cell);
  }
 }
 if(play)shots[lastShot.index]=lastShot.hit?2:1;
 stage.innerHTML='<div class="battle-map-view">'+battleTargetGridHTML(shots,{wrecks})+'</div>';
 if(!play)return;
 const game={mode:'local',status:'playing',players:[{},{}],variants:{schema:1}};
 playVariantEffects(game,{volley:shot,root:stage,scroll:false});
 const message=shipSunkBanner(game,shot,0);
 if(message){
  stage.insertAdjacentHTML('beforeend','<div class="animation-preview-notice"></div>');
  return playGameBanner([message],{host:stage.lastElementChild});
 }
}

function mixingScene(stage,display,play){
 const game=createGame(['Du','Mitspieler'],'local',[],{variants:{shuffle:true}});
 if(play){
  let seed=173;
  game.round=5;
  game.players[0].marks=game.players[0].marks.map((_,i)=>exampleMarks.includes(i));
  shuffleFreeColors(game,max=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%max;});
 }
 stage.innerHTML=exampleBoard(boardFor(game,0),display);
 if(play)playVariantEffects(game,{mix:true,root:stage,scroll:false});
}

function diceScene(stage,play){
 const colors=['g','y','b'].map(color=>`<span class="die color" style="--cell:var(--${color})" role="img" aria-label="${LABELS[color]}">${SHAPES[color]}</span>`).join('');
 const numbers=[2,4,5].map(n=>`<span class="die">${n}</span>`).join('');
 stage.innerHTML=`<div class="animation-preview-dice${play?' roll-animation':''}"><div class="dice-row" role="group" aria-label="Farbwürfel">${colors}</div><div class="dice-row" role="group" aria-label="Zahlenwürfel">${numbers}</div></div>`;
}

export function mountAnimationPreview(element,{mark='×',patterns=false}={}){
 const select=element.querySelector('select'),stage=element.querySelector('[data-animation-stage]');
 const playButton=element.querySelector('[data-animation-play]'),status=element.querySelector('[data-animation-status]');
 const display={mark,patterns};
 let cleanupEffect=null,playTimer=null;
 const stop=()=>{
  clearTimeout(playTimer);playTimer=null;
  cleanupEffect?.();cleanupEffect=null;
  stage.getAnimations?.({subtree:true}).forEach(animation=>animation.cancel());
  stage.replaceChildren();
 };
 function show(play){
  stop();
  const scene=scenes.find(item=>item.id===select.value);
  playButton.hidden=stage.hidden=!scene;
  if(!scene){status.textContent='';return;}
  status.textContent=play?scene.label:'';
  if(scene.blasts){
   const effect=mineEffect(scene.blasts);
   const damage=play?mineBlastTargets(effect)[0].cells:[];
   stage.innerHTML=exampleBoard(boardFor('classic'),{...display,damage})+'<div class="animation-preview-notice"></div>';
   if(play)cleanupEffect=playMineBlast({...effect,attacker:'Mitspieler',root:stage,noticeHost:stage.lastElementChild,scroll:false});
  }else if(scene.volley)cleanupEffect=shipScene(stage,scene.volley,play);
  else if(scene.id==='mix')mixingScene(stage,display,play);
  else if(scene.id==='roll')diceScene(stage,play);
  else{
   const game=rollGame(createGame(['Du','Mitspieler'],'local',[],{mines:true}),()=>0);
   game.mines.unlocked[0]=play;
   stage.innerHTML='<div inert>'+mineControlsHtml(game,{highlight:play})+'</div>';
  }
 }
 const onSelect=()=>show(false);
 const onPlay=()=>{
  show(false);
  // The same starting frame is visible on every replay.
  playTimer=setTimeout(()=>show(true),180);
 };
 select.addEventListener('change',onSelect);
 playButton.addEventListener('click',onPlay);
 show(false);
 return ()=>{
  stop();
  select.removeEventListener('change',onSelect);
  playButton.removeEventListener('click',onPlay);
 };
}
