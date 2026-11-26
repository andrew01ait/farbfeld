import {applyMineAttack,applyMove,boardFor,COLORS,createGame,rollGame} from './engine.js';
import {enableBonusFields} from './bonus-fields.js';
import {enableVariants} from './variants.js';

export const gameOnlyScenes=[
 {id:'airstrike-concealed',label:'Luftangriff · Verdeckte Partie'},
 {id:'mine-outgoing',label:'Versteckte Minen · Deine Mine beim Gegner'},
 {id:'ship-final',label:'Schiffsboni · Letztes Schiff'},
 {id:'treasure-hot',label:'Schatzsuche · Heiß'},
 {id:'treasure-warm',label:'Schatzsuche · Warm'},
 {id:'treasure-cold',label:'Schatzsuche · Kalt'},
 {id:'treasure-find',label:'Schatzsuche · Fund und Wertung'},
 {id:'treasure-chain',label:'Schatzsuche · Schatzkette'},
 {id:'color-complete',label:'Farbabschluss'},
 {id:'discovery',label:'Entdeckermodus · Fundort'},
 {id:'objective',label:'Öffentliche Aufträge · Erfüllt'},
 {id:'finish',label:'Spielende · Ergebnis'},
 {id:'reaction',label:'Emoji-Reaktion'},
];

const seeded=()=>{
 let seed=173;
 return max=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%max;};
};
const mark=(game,pid,indices)=>indices.forEach(i=>game.players[pid].marks[i]=true);
const sampleMarks=[7,22,36,37,38,50,53,54,66,67,68,82];
const fleet=[[0],[15,16],[51,52,53],[60,61,62,63],[90,91,92,93,94]];
const pass={pass:true};

// These prepared boards are synthetic. The transitions use the game engine.
export function animationGameScene(id){
 const rng=seeded();
 const airstrike=id.startsWith('airstrike-'),ground=id.startsWith('mine-'),ships=id.startsWith('ship-'),treasure=id.startsWith('treasure-');
 let game=createGame(['Du','Computer'],'computer',[],{mines:airstrike,hiddenScores:id==='airstrike-concealed'});
 game=enableVariants(game,{battleship:ships,hiddenMines:ground,shuffle:id==='mix',discovery:id==='discovery',objectives:id==='objective'},rng);
 if(treasure)game=enableBonusFields(game,rng);
 game.gameId='animation-demo';game.round=id==='mix'?5:4;

 const choose=(cells,pid=0)=>{
  game.active=pid;game.phase='choose';
  game.dice={colors:[boardFor(game,pid).cells[cells[0]],'*','*'],numbers:[cells.length,'?','?']};
  return {ci:0,ni:0,cells};
 };
 const move=(cells,{pid=0,settle=false}={})=>{
  const draft=choose(cells,pid),first=applyMove(game,pid,draft,rng);
  return {before:game,steps:settle?[first,applyMove(first,1-pid,pass,rng)]:[first],...(pid===0?{draft}:{})};
 };

 if(id==='roll')return {before:game,steps:[rollGame(game,rng)],roll:true,start:'dice'};
 if(id==='reaction')return {before:game,steps:[],reaction:true};
 if(id==='color-complete'||id==='airstrike-ready'||id==='finish'){
  const actor=id==='airstrike-ready'?1:0,target=7,layout=boardFor(game,actor).cells,color=layout[target];
  mark(game,actor,layout.flatMap((value,i)=>value===color&&i!==target?[i]:[]));
  if(id==='finish'){
   const prior=COLORS.find(value=>value!==color);
   mark(game,actor,layout.flatMap((value,i)=>value===prior?[i]:[]));
   game.players[actor].colors[prior]=5;game.colorClaims[prior]=1;
  }
  return move([target],{pid:actor,settle:true});
 }
 if(airstrike){
  choose([52]);game.mines.unlocked[0]=true;
  mark(game,0,sampleMarks);mark(game,1,[...sampleMarks,51,52]);
  const target=id==='airstrike-miss'?55:52;
  return {before:game,steps:[applyMineAttack(game,0,target,rng)],target};
 }
 if(ground){
  const outgoing=id==='mine-outgoing',double=id==='mine-double',owner=outgoing?0:1,actor=1-owner;
  const h=game.variants.hiddenMines;h.ready.fill(true);
  h.positions=[[0,1],[103,104]];h.positions[owner]=double?[51,52]:[52,104];
  mark(game,actor,sampleMarks);
  return move(double?[51,52]:[52],{pid:actor});
 }
 if(ships){
  const b=game.variants.battleship;b.ready.fill(true);b.fleets=[structuredClone(fleet),structuredClone(fleet)];
  if(id==='ship-vertical')b.fleets[1][2]=[37,52,67];
  const ship=b.fleets[1][2],sink=['ship-horizontal','ship-vertical','ship-final'].includes(id);
  const target=id==='ship-miss'?7:sink?52:51;
  if(sink){
   for(const i of ship)if(i!==target)b.shots[0][i]=2;
   if(id==='ship-final')b.fleets[1].forEach((cells,index)=>{
    if(index===2)return;
    b.sunk[0][index]=true;b.revealed[0].push([...cells]);cells.forEach(i=>b.shots[0][i]=2);
   });
  }
  if(target!==7)mark(game,0,[22,37,50,66,67]);
  return move([target]);
 }
 if(treasure){
  const temperature={ 'treasure-hot':8,'treasure-warm':9,'treasure-cold':11 };
  const target=temperature[id]??7;
  [target,60,104].forEach((i,slot)=>game.bonuses.fields[slot].index=i);
  if(id==='treasure-chain')game.bonuses.fields.slice(1).forEach(field=>field.claim={round:2,winners:[0]});
  return move([7],{settle:id==='treasure-find'||id==='treasure-chain'});
 }
 if(id==='discovery'){
  const fields=game.variants.discovery.fields;
  const other=fields.find(field=>field.index===7);
  if(other)other.index=fields[0].index;
  fields[0].index=7;
  return move([7]);
 }
 if(id==='objective'){
  const task=game.variants.objectives.tasks.find(t=>t.type==='stars');
  mark(game,0,boardFor(game,0).stars.filter(i=>i!==7).slice(0,task.target-1));
  return move([7],{settle:true});
 }
 if(id==='mix'){
  mark(game,0,sampleMarks);
  return move([52],{settle:true});
 }
 return null;
}
