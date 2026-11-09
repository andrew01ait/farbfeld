import {createGame,canAct,rollGame,applyMove,findMove,randomInt,availableDice,neighbors,COLORS,FIRST,LATER,score,enableMines,canUseMine,chooseComputerMineTarget,applyMineAttack} from './engine.js';
import {boardFor} from './boards.js';

// The human always owns sheet 0. The computer uses the same dice and rule engine.
export const HUMAN=0;
export const COMPUTER=1;
export const COMPUTER_LEVELS=Object.freeze([
 Object.freeze({id:'easy',label:'Leicht',description:'Sammelt vor allem große Gruppen und Sterne. Der bisherige Computer.'}),
 Object.freeze({id:'medium',label:'Mittel',description:'Plant Farben und Spalten gezielt und teilt seine Joker ein.'}),
 Object.freeze({id:'hard',label:'Schwer',description:'Rechnet nächste Zugchancen voraus und achtet bei offenen Punkten auf deine Möglichkeiten.'}),
]);
export const validComputerDifficulty=value=>COMPUTER_LEVELS.some(level=>level.id===value);
// Old schema-1 saves retain the previous playing strength.
export const computerDifficulty=game=>validComputerDifficulty(game?.computerDifficulty)?game.computerDifficulty:'easy';
export const computerLevel=game=>COMPUTER_LEVELS.find(level=>level.id===computerDifficulty(game));

export function createComputerGame(hiddenScores=false,boardId='classic',difficulty='medium',withMines=false){
 if(!validComputerDifficulty(difficulty))throw Error('Wähle Leicht, Mittel oder Schwer.');
 const game={...createGame(['Du','Computer'],'computer',[],{hiddenScores,boardId}),computerDifficulty:difficulty};
 return withMines===true?enableMines(game):game;
}

export function changeComputerDifficulty(game,difficulty){
 if(game?.mode!=='computer'||game.status!=='playing')throw Error('Es läuft keine Computerpartie.');
 if(!validComputerDifficulty(difficulty))throw Error('Wähle Leicht, Mittel oder Schwer.');
 return {...game,computerDifficulty:difficulty};
}

export function needsComputerTurn(game){
 return game?.mode==='computer'&&game.players.length===2&&game.status==='playing'&&
  (game.phase==='roll'?game.active===COMPUTER:canAct(game,COMPUTER));
}

const ADJ=Array.from({length:105},(_,i)=>neighbors(i));
const BEAM=8;
const uniqueFaces=faces=>faces.filter((face,index)=>faces.findIndex(other=>other.value===face.value)===index);

// Connected shapes are shared by equivalent dice faces. A sheet has only 105
// cells, five colours and at most five newly marked cells per legal move.
function shapes(player,board){
 const result=Object.fromEntries(COLORS.map(color=>[color,Array.from({length:6},()=>[])]));
 for(const color of COLORS){
  const seen=new Set();
  function grow(cells){
   const sorted=cells.slice().sort((a,b)=>a-b),key=sorted.join(',');if(seen.has(key))return;seen.add(key);
   result[color][cells.length].push(sorted);if(cells.length===5)return;
   const candidates=new Set(cells.flatMap(i=>ADJ[i]));
   for(const i of candidates)if(!player.marks[i]&&board.cells[i]===color&&!cells.includes(i))grow([...cells,i]);
  }
  for(let i=0;i<105;i++)if(!player.marks[i]&&board.cells[i]===color&&(i%15===7||ADJ[i].some(j=>player.marks[j])))grow([i]);
 }
 return result;
}

function position(game,pid){
 const player=game.players[pid],board=boardFor(game),columns=Array(15).fill(0),colors=Object.fromEntries(COLORS.map(color=>[color,0]));
 let marked=0;for(let i=0;i<105;i++)if(player.marks[i]){marked++;columns[i%15]++;colors[board.cells[i]]++;}
 const frontier=new Set();for(let i=0;i<105;i++)if(!player.marks[i]&&(i%15===7||ADJ[i].some(j=>player.marks[j])))frontier.add(i);
 const columnValue=(col,count)=>player.columns[col]!==null?0:(game.columnClaims[col]===null?FIRST[col]:LATER[col])*(count===7?1:0.8*(count/7)**2.4);
 const colorValue=(color,count)=>player.colors[color]!==null?0:((game.colorClaims[color]===null?5:3)+7)*(count/21)**3;
 const jokerPrice=marked<60?1.65+(8-player.jokers)*0.13:1.1+(8-player.jokers)*0.04;
 const stars=new Set(board.stars);
 function value(cells,color,cost){
  let gain=cells.length*0.32-cost*jokerPrice;const added=new Map(),nextFrontier=new Set();
  for(const i of cells){if(stars.has(i))gain+=2;const col=i%15;added.set(col,(added.get(col)||0)+1);for(const j of ADJ[i])if(!player.marks[j]&&!cells.includes(j)&&!frontier.has(j))nextFrontier.add(j);}
  for(const [col,count] of added)gain+=columnValue(col,columns[col]+count)-columnValue(col,columns[col]);
  gain+=colorValue(color,colors[color]+cells.length)-colorValue(color,colors[color]);
  gain+=(nextFrontier.size-cells.filter(i=>frontier.has(i)).length)*0.035;
  return gain;
 }
 return {player,board,columns,colors,jokerPrice,value};
}

function candidates(game,pid){
 const state=position(game,pid),groups=shapes(state.player,state.board),dice=availableDice(game,pid),moves=[];
 for(const c of uniqueFaces(dice.colors))for(const n of uniqueFaces(dice.numbers)){
  const cost=Number(c.value==='*')+Number(n.value==='?');if(cost>state.player.jokers)continue;
  for(const color of c.value==='*'?COLORS:[c.value])for(const count of n.value==='?'?[1,2,3,4,5]:[n.value]){
   for(const cells of groups[color][count])moves.push({move:{ci:c.index,ni:n.index,color,count,cells},cost,value:state.value(cells,color,cost)});
  }
 }
 return moves.sort((a,b)=>b.value-a.value);
}

// Exact probabilities for unordered independent two-/three-die rolls, not a
// peek at the actual RNG. Wildcard costs still come from the eight-joker budget.
function rolls(count){
 const result=[],factorial=n=>n<2?1:n*factorial(n-1);
 function add(faces,start){if(faces.length===count){const frequencies=new Map();for(const face of faces)frequencies.set(face,(frequencies.get(face)||0)+1);result.push({faces:[...new Set(faces)],probability:factorial(count)/[...frequencies.values()].reduce((v,n)=>v*factorial(n),1)/6**count});return;}for(let face=start;face<6;face++)add([...faces,face],face);}
 add([],0);return result;
}
const FUTURE_ROLLS={2:rolls(2),3:rolls(3)};
function nextTurnValue(game,pid){
 const state=position(game,pid),groups=shapes(state.player,state.board),best=COLORS.map(()=>Array(5).fill(-Infinity));
 for(let c=0;c<5;c++)for(let n=0;n<5;n++)for(const cells of groups[COLORS[c]][n+1])best[c][n]=Math.max(best[c][n],state.value(cells,COLORS[c],0));
 const table=Array.from({length:6},()=>Array(6).fill(0));
 for(let c=0;c<6;c++)for(let n=0;n<6;n++){
  const cost=Number(c===5)+Number(n===5);if(cost>state.player.jokers)continue;
  for(const color of c===5?[0,1,2,3,4]:[c])for(const number of n===5?[0,1,2,3,4]:[n])table[c][n]=Math.max(table[c][n],best[color][number]-cost*state.jokerPrice);
 }
 // The passive player usually receives two dice of each kind after round 3.
 // The opponent's future removal is unknown; two fresh dice model that limit.
 const count=game.round>3&&game.active!==pid?2:3,possible=FUTURE_ROLLS[count];let expected=0;
 for(const colors of possible)for(const numbers of possible){let value=0;for(const color of colors.faces)for(const number of numbers.faces)value=Math.max(value,table[color][number]);expected+=value*colors.probability*numbers.probability;}
 return expected;
}

function privateAnalysis(game,pid){
 if(!game.hiddenScores)return game;
 // Do not let concealed human marks, scores or jokers affect a hard decision,
 // including indirectly via an engine simulation's end-of-game result.
 return {...game,players:game.players.map((p,i)=>i===pid?p:{...p,marks:Array(105).fill(false),columns:Array(15).fill(null),colors:Object.fromEntries(COLORS.map(c=>[c,null])),jokers:8,lastMove:[],passes:0})};
}

function hardMove(game,pid,moves){
 const gameView=privateAnalysis(game,pid),opponent=1-pid,beam=[],used=new Set(),pairs=new Set();
 const add=entry=>{const key=entry.move.ci+':'+entry.move.ni+':'+entry.move.cells.join(',');if(!used.has(key)&&beam.length<BEAM){used.add(key);beam.push(entry);}};
 // Keep distinct dice choices in the beam so denial can break positional ties.
 for(const entry of moves){const key=entry.move.ci+':'+entry.move.ni;if(!pairs.has(key)&&pairs.size<4){pairs.add(key);add(entry);}}
 for(const entry of moves){add(entry);if(beam.length===BEAM)break;}
 beam.push({move:null,value:0,cost:0});
 let best=null,bestValue=-Infinity;const futureCache=new Map();
 for(const entry of beam){
  let next=applyMove(gameView,pid,entry.move??{pass:true}),value=entry.value;
  if(!game.hiddenScores&&canAct(next,opponent)){
   const response=candidates(next,opponent)[0];value-=Math.max(0,response?.value||0)*0.6;
   next=applyMove(next,opponent,response&&response.value>0?response.move:{pass:true});
  }
  if(next.status==='finished'&&!game.hiddenScores){
   const own=score(next.players[pid],next),other=score(next.players[opponent],next),margin=own.total-other.total,tie=own.jokers-other.jokers;
   value=(margin>0||margin===0&&tie>0?1000:margin<0||margin===0&&tie<0?-1000:0)+margin+tie*0.01;
  }else if(next.status!=='finished'){
   // Finish the hypothetical current round for the future-dice model without
   // inspecting any hidden sheet or generating a new roll.
   if(next.phase==='choose'&&canAct(next,opponent))next=applyMove(next,opponent,{pass:true});
   if(next.status!=='finished'){
    const key=(entry.move?.cells.join(',')||'pass')+':'+entry.cost;
    if(!futureCache.has(key))futureCache.set(key,nextTurnValue(next,pid));
    value+=futureCache.get(key)*0.65;
   }
  }
  if(value>bestValue){bestValue=value;best=entry.move;}
 }
 return best;
}

export function chooseComputerMove(game,pid=COMPUTER){
 if(!canAct(game,pid))return null;
 const difficulty=computerDifficulty(game);if(difficulty==='easy')return findMove(game,pid);
 const moves=candidates(game,pid);if(difficulty==='medium')return moves[0]?.value>0?moves[0].move:null;
 return hardMove(game,pid,moves);
}

// One immutable, saveable step at a time. Every selected move is committed by
// the shared rule engine; only actual rolls and opted-in mine attacks consume the supplied RNG.
export function stepComputer(game,rng=randomInt){
 if(!needsComputerTurn(game))return game;
 if(game.phase==='roll')return rollGame(game,rng);
 if(canUseMine(game,COMPUTER))return applyMineAttack(game,COMPUTER,chooseComputerMineTarget(game,rng),rng);
 return applyMove(game,COMPUTER,chooseComputerMove(game)??{pass:true});
}
