// Reproducible local balance/performance probe; no network or user saves.
import {performance} from 'node:perf_hooks';
import {BOARDS} from '../public/game/boards.js';
import {rollGame,applyMove,findMove,score} from '../public/game/engine.js';
import {COMPUTER_LEVELS,createComputerGame,needsComputerTurn,stepComputer} from '../public/game/computer.js';

const games=Number(process.argv[2]||12);
if(!Number.isInteger(games)||games<1||games>100)throw Error('Pass 1–100 games per board and difficulty.');
const rows=[];
for(const level of COMPUTER_LEVELS)for(const board of BOARDS){
 let wins=0,draws=0,own=0,other=0,decisions=0,milliseconds=0,maxMilliseconds=0;
 for(let seed=1;seed<=games;seed++){
  let state=seed,game=createComputerGame(false,board.id,level.id),steps=0;
  const rng=max=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return Math.floor(state/4294967296*max);};
  while(game.status==='playing'&&steps++<1500){
   if(needsComputerTurn(game)){
    const choosing=game.phase==='choose',start=performance.now();game=stepComputer(game,rng);
    if(choosing){const elapsed=performance.now()-start;decisions++;milliseconds+=elapsed;maxMilliseconds=Math.max(maxMilliseconds,elapsed);}
   }else if(game.phase==='roll')game=rollGame(game,rng);
   else game=applyMove(game,0,findMove(game,0)??{pass:true});
  }
  if(game.status!=='finished')throw Error('Unfinished '+level.id+'/'+board.id+'/'+seed);
  const a=score(game.players[1],game),b=score(game.players[0],game),margin=a.total-b.total||a.jokers-b.jokers;
  wins+=Number(margin>0);draws+=Number(margin===0);own+=a.total;other+=b.total;
 }
 rows.push({difficulty:level.id,board:board.id,games,wins,draws,averageScore:+(own/games).toFixed(2),opponentAverage:+(other/games).toFixed(2),averageDecisionMs:+(milliseconds/decisions).toFixed(2),maxDecisionMs:+maxMilliseconds.toFixed(2)});
}
console.log(JSON.stringify({opponent:'legacy easy, human/first seat',seedRange:[1,games],rows},null,2));
