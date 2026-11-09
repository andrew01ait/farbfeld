import {CLASSIC,boardFor,requireBoardId} from './boards.js';
export {boardFor} from './boards.js';
// Shared deterministic rules. No browser or server dependencies.
export const COLORS = ['g','y','b','p','o'];
export const LABELS = {g:'Grün',y:'Gelb',b:'Blau',p:'Pink',o:'Orange','*':'Farbjoker'};
export const SHAPES = {g:'●',y:'◆',b:'■',p:'♥',o:'▲'};
export const ROWS = CLASSIC.rows;
export const BOARD = CLASSIC.cells;
export const STARS = CLASSIC.stars;
export const FIRST = [5,3,3,3,2,2,2,1,2,2,2,3,3,3,5];
export const LATER = [3,2,2,2,1,1,1,0,1,1,1,2,2,2,3];
export const COLS = 'ABCDEFGHIJKLMNO';
export const MINE_COST=5;
export const minesEnabled=g=>g?.mode==='computer'&&g.players?.length===2&&g.mines?.schema===1&&g.mines.enabled===true;
export function enableMines(game){
 if(game.mode!=='computer'||game.players.length!==2)throw Error('Minenangriff ist vorerst nur gegen den Computer verfügbar.');
 if(game.turn!==0||game.round!==1||game.phase!=='roll'||game.mines!==undefined||game.players.some(p=>p.marks.some(Boolean)))throw Error('Minenangriff kann nur vor einer neuen Partie gewählt werden.');
 return {...game,mines:{schema:1,enabled:true,unlocked:[false,false],used:[false,false],lastBlast:null}};
}
export function validMineState(game){
 const m=game?.mines;if(m===undefined)return true;
 if(!minesEnabled(game)||!['unlocked','used'].every(key=>Array.isArray(m[key])&&m[key].length===2&&m[key].every(v=>typeof v==='boolean'))||m.used.some((used,i)=>used&&!m.unlocked[i]))return false;
 const b=m.lastBlast;
 return b===null||b&&[0,1].includes(b.by)&&b.targetPid===1-b.by&&m.used[b.by]&&Number.isSafeInteger(b.turn)&&b.turn>=1&&Number.isInteger(b.target)&&b.target>=0&&b.target<105&&Array.isArray(b.cells)&&b.cells.length<=6&&new Set(b.cells).size===b.cells.length&&b.cells.every(i=>Number.isInteger(i)&&i>=0&&i<105&&(i===b.target||blastNeighbors(b.target).includes(i)));
}
export function blastNeighbors(i){
 const out=[],row=Math.floor(i/15),col=i%15;
 for(let y=-1;y<=1;y++)for(let x=-1;x<=1;x++)if((x||y)&&row+y>=0&&row+y<7&&col+x>=0&&col+x<15)out.push((row+y)*15+col+x);
 return out;
}
export function canUseMine(game,pid){return minesEnabled(game)&&validMineState(game)&&[0,1].includes(pid)&&game.mines.unlocked[pid]&&!game.mines.used[pid]&&canAct(game,pid);}
export function applyMineAttack(input,pid,target,rng=randomInt){
 if(!canUseMine(input,pid))throw Error('Minenangriff ist noch nicht freigeschaltet, bereits verbraucht oder gerade nicht möglich.');
 if(!Number.isInteger(target)||target<0||target>=105)throw Error('Wähle ein Feld auf dem gegnerischen Blatt.');
 const g=structuredClone(input),victim=1-pid,p=g.players[victim],near=blastNeighbors(target).filter(i=>p.marks[i]);
 const draw=max=>{const value=rng(max);if(!Number.isInteger(value)||value<0||value>=max)throw Error('Ungültiger Zufallswert.');return value;};
 const hit=!!p.marks[target],count=hit?Math.min(near.length,3+draw(3)):0,cells=hit?[target]:[];
 for(let n=0;n<count;n++){const index=draw(near.length);cells.push(near.splice(index,1)[0]);}
 if(hit){cells.forEach(i=>p.marks[i]=false);p.lastMove=p.lastMove.filter(i=>p.marks[i]);
 for(let c=0;c<15;c++)if(!Array.from({length:7},(_,r)=>p.marks[r*15+c]).every(Boolean))p.columns[c]=null;
 for(const color of COLORS)if(!boardFor(g).cells.every((c,i)=>c!==color||p.marks[i]))p.colors[color]=null;
 reassignMineBonuses(g);}
 g.mines.used[pid]=true;g.turn++;g.mines.lastBlast={by:pid,targetPid:victim,target,cells,turn:g.turn};
 return g;
}
// Only already-awarded completions participate here. Fresh marks still wait for
// shared round scoring. With two players, a sole remaining holder gets first rank.
function reassignMineBonuses(g){
 for(let col=0;col<15;col++){
  const holders=g.players.filter(p=>p.columns[col]!==null);
  if(!holders.length)g.columnClaims[col]=null;
  else if(holders.length===1){if(holders[0].columns[col]!==FIRST[col])g.columnClaims[col]=g.round;holders[0].columns[col]=FIRST[col];}
 }
 for(const color of COLORS){
  const holders=g.players.filter(p=>p.colors[color]!==null);
  if(!holders.length)g.colorClaims[color]=null;
  else if(holders.length===1){if(holders[0].colors[color]!==5)g.colorClaims[color]=g.round;holders[0].colors[color]=5;}
 }
 g.announcements=(g.announcements??[]).filter(event=>g.players[event.pid]?.colors?.[event.color]!=null).map(event=>({...event,points:g.players[event.pid].colors[event.color]}));
}
export function mineTargetView(game,attacker){
 if(!minesEnabled(game)||![0,1].includes(attacker))return null;
 const hidden=!!game.hiddenScores&&game.status!=='finished',layout=boardFor(game),target=game.players[1-attacker];
 return {hidden,cells:layout.cells.map((color,index)=>({index,color,star:layout.stars.includes(index),...(!hidden?{marked:!!target.marks[index]}:{})}))};
}
export function chooseComputerMineTarget(game,rng=randomInt){
 if(!canUseMine(game,1))return null;
 // A concealed human sheet is never inspected, even to prefer occupied cells.
 if(game.hiddenScores)return rng(105);
 const p=game.players[0],stars=new Set(boardFor(game).stars),board=boardFor(game).cells;
 let best=0,bestValue=-Infinity;
 for(let i=0;i<105;i++){
  if(!p.marks[i])continue;
  const near=blastNeighbors(i).filter(j=>p.marks[j]),expected=[3,4,5].reduce((n,k)=>n+Math.min(k,near.length),0)/3,probability=near.length?expected/near.length:0;
  const cells=[...(p.marks[i]?[{index:i,chance:1}]:[]),...near.map(index=>({index,chance:probability}))];
  let value=cells.reduce((n,c)=>n+c.chance*(stars.has(c.index)?3:1),0);
  for(let c=0;c<15;c++)if(p.columns[c]!==null)value+=p.columns[c]*Math.min(1,cells.filter(x=>x.index%15===c).reduce((n,x)=>n+x.chance,0));
  for(const color of COLORS)if(p.colors[color]!==null)value+=p.colors[color]*Math.min(1,cells.filter(x=>board[x.index]===color).reduce((n,x)=>n+x.chance,0));
  if(value>bestValue){bestValue=value;best=i;}
 }
 return best;
}
export function neighbors(i) { const out=[]; if(i%15)out.push(i-1); if(i%15<14)out.push(i+1);if(i>=15)out.push(i-15);if(i<90)out.push(i+15);return out; }
export function randomInt(max) { const a=new Uint32Array(1);const limit=0x100000000-0x100000000%max; do{crypto.getRandomValues(a);}while(a[0]>=limit);return a[0]%max; }
export function rollDice(solo=false,rng=randomInt){const n=solo?2:3;return {colors:Array.from({length:n},()=>[...COLORS,'*'][rng(6)]),numbers:Array.from({length:n},()=>[1,2,3,4,5,'?'][rng(6)])};}
export function player(name,id) {return {id,name,marks:Array(105).fill(false),jokers:8,columns:Array(15).fill(null),colors:Object.fromEntries(COLORS.map(c=>[c,null])),lastMove:[],passes:0};}
export function createGame(names,mode='solo',ids=[],options={}) {return {schema:1,mode,boardId:requireBoardId(options.boardId),hiddenScores:options.hiddenScores===true,announcements:[],players:names.map((n,i)=>player(n,ids[i]??String(i))),round:1,active:0,phase:'roll',dice:null,chosen:null,submitted:[],columnClaims:Array(15).fill(null),colorClaims:Object.fromEntries(COLORS.map(c=>[c,null])),status:'playing',log:[],turn:0};}
export function availableDice(game,pid){ if(!game.dice)return {colors:[],numbers:[]};const removed=game.round>3&&game.chosen&&pid!==game.active;return {colors:game.dice.colors.map((v,i)=>({value:v,index:i})).filter(d=>!removed||d.index!==game.chosen.ci),numbers:game.dice.numbers.map((v,i)=>({value:v,index:i})).filter(d=>!removed||d.index!==game.chosen.ni)}; }
export function canAct(game,pid){return game.status==='playing'&&game.phase==='choose'&&!game.submitted.includes(pid)&&(pid===game.active||game.submitted.includes(game.active));}
export function resolveChoice(game,pid,move){const d=availableDice(game,pid);const c=d.colors.find(x=>x.index===move.ci);const n=d.numbers.find(x=>x.index===move.ni);if(!c||!n)return {error:'Wähle je einen verfügbaren Farb- und Zahlenwürfel.'};const color=c.value==='*'?move.color:c.value;const count=n.value==='?'?move.count:n.value;if(!COLORS.includes(color))return {error:'Wähle eine Farbe für den Joker.'};if(!Number.isInteger(count)||count<1||count>5)return {error:'Der Zahlenjoker steht für 1 bis 5.'};const cost=Number(c.value==='*')+Number(n.value==='?');if(cost>game.players[pid].jokers)return {error:'Dafür hast du nicht genug Joker übrig.'};return {color,count,cost};}
export function validateCells(p,cells,color,count,partial=false,game=null){const {cells:board}=boardFor(game);if(!Array.isArray(cells)||new Set(cells).size!==cells.length)return 'Wähle jedes Feld nur einmal.';if(!cells.length)return 'Tippe auf das Spielfeld.';if(cells.length>count||(!partial&&cells.length!==count))return `Wähle genau ${count} zusammenhängende Felder.`;if(cells.some(i=>!Number.isInteger(i)||i<0||i>=105||p.marks[i]||board[i]!==color))return 'Alle neuen Felder müssen frei sein und dieselbe Farbe haben.';const set=new Set(cells),seen=new Set([cells[0]]),queue=[cells[0]];while(queue.length){for(const i of neighbors(queue.shift()))if(set.has(i)&&!seen.has(i)){seen.add(i);queue.push(i);}}if(seen.size!==set.size)return 'Die neuen Kreuze müssen untereinander waagrecht oder senkrecht verbunden sein.';if(!cells.some(i=>i%15===7||neighbors(i).some(j=>p.marks[j])))return 'Beginne in Spalte H oder schließe an deine bisherigen Kreuze an.';return null;}
export function applyMove(input,pid,move){if(!Number.isInteger(pid)||!input.players[pid])throw Error('Spieler nicht gefunden.');if(!canAct(input,pid))throw Error('Du bist noch nicht am Zug oder hast schon bestätigt.');const g=structuredClone(input),p=g.players[pid];if(move.pass){p.passes++;p.lastMove=[];}else{const choice=resolveChoice(g,pid,move);if(choice.error)throw Error(choice.error);const error=validateCells(p,move.cells,choice.color,choice.count,false,g);if(error)throw Error(error);move.cells.forEach(i=>p.marks[i]=true);p.jokers-=choice.cost;p.lastMove=[...move.cells];if(pid===g.active)g.chosen={ci:move.ci,ni:move.ni};}g.submitted.push(pid);g.log.push({round:g.round,pid,player:p.name,pass:!!move.pass,color:move.pass?null:boardFor(g).cells[move.cells[0]],count:move.pass?0:move.cells.length});g.log=g.log.slice(-120);g.turn++;if(g.submitted.length===g.players.length)finishRound(g);return g;}
export function finishRound(g){for(let c=0;c<15;c++){const completed=g.players.filter(p=>p.columns[c]===null&&Array.from({length:7},(_,r)=>p.marks[r*15+c]).every(Boolean));for(const p of completed){p.columns[c]=g.columnClaims[c]===null?FIRST[c]:LATER[c];}if(completed.length&&g.columnClaims[c]===null)g.columnClaims[c]=g.round;}
for(const color of COLORS){const completed=g.players.filter(p=>p.colors[color]===null&&boardFor(g).cells.every((c,i)=>c!==color||p.marks[i]));for(const p of completed){const index=g.players.indexOf(p);p.colors[color]=g.colorClaims[color]===null?5:3;if(minesEnabled(g))g.mines.unlocked[1-index]=true;g.announcements??=[];const pid=g.players.indexOf(p);g.announcements.push({id:g.round+':'+pid+':'+color,pid,name:p.name,color,round:g.round,points:p.colors[color]});}if(completed.length&&g.colorClaims[color]===null)g.colorClaims[color]=g.round;}
const end=g.mode==='solo'?g.round>=30:g.players.some(p=>COLORS.filter(c=>p.colors[c]!==null).length>=2);if(end){g.status='finished';g.phase='finished';return;}g.round++;g.active=(g.active+1)%g.players.length;g.phase='roll';g.dice=null;g.chosen=null;g.submitted=[];}
export function rollGame(input,rng=randomInt){if(input.status!=='playing'||input.phase!=='roll')throw Error('Dieser Wurf läuft bereits.');const g=structuredClone(input);g.dice=rollDice(g.mode==='solo',rng);g.phase='choose';g.turn++;return g;}
export function score(p,game=null){const columns=p.columns.reduce((s,x)=>s+(x??0),0),colors=Object.values(p.colors).reduce((s,x)=>s+(x??0),0),stars=boardFor(game).stars.filter(i=>!p.marks[i]).length;const mineCost=minesEnabled(game)&&game.mines.used[game.players.indexOf(p)]?MINE_COST:0;return {columns,colors,jokers:p.jokers,stars,penalty:stars*2,...(minesEnabled(game)?{mineCost}:{}),total:columns+colors+p.jokers-stars*2-mineCost,marked:p.marks.filter(Boolean).length};}
export function rankings(g){return g.players.map((p,i)=>({...score(p,g),name:p.name,id:p.id,index:i})).sort((a,b)=>b.total-a.total||b.jokers-a.jokers);}
export function findMove(g,pid,filter={}){
 const {cells:board,stars}=boardFor(g),p=g.players[pid],dice=availableDice(g,pid),required=Array.isArray(filter.cells)?filter.cells:[];
 let best=null,bestValue=-Infinity;
 for(const c of dice.colors){
  if(filter.ci!==undefined&&filter.ci!==null&&filter.ci!==c.index)continue;
  for(const n of dice.numbers){
   if(filter.ni!==undefined&&filter.ni!==null&&filter.ni!==n.index)continue;
   for(const color of c.value==='*'?COLORS:[c.value]){
    if(filter.color!==undefined&&filter.color!==null&&filter.color!==color)continue;
    for(const count of n.value==='?'?[1,2,3,4,5]:[n.value]){
     if(filter.count!==undefined&&filter.count!==null&&filter.count!==count||required.length>count)continue;
     const cost=Number(c.value==='*')+Number(n.value==='?');if(cost>p.jokers)continue;
     const seen=new Set();
     function grow(cells){
      const key=[...cells].sort((a,b)=>a-b).join(',');if(seen.has(key))return;seen.add(key);
      if(cells.length===count){
       if(required.some(i=>!cells.includes(i)))return;
       let value=count-cost*1.5+cells.filter(i=>stars.includes(i)).length*2.5;
       for(let col=0;col<15;col++){
        if(p.columns[col]!==null)continue;
        let missing=0;for(let r=0;r<7;r++)if(!p.marks[r*15+col]&&!cells.includes(r*15+col))missing++;
        if(!missing)value+=FIRST[col]*2;
       }
       if(value>bestValue){bestValue=value;best={ci:c.index,ni:n.index,color,count,cells:[...cells]};}
       return;
      }
      const options=new Set(cells.flatMap(neighbors));
      for(const i of options)if(!p.marks[i]&&board[i]===color&&!cells.includes(i))grow([...cells,i]);
     }
     for(let i=0;i<105;i++)if(!p.marks[i]&&board[i]===color&&(i%15===7||neighbors(i).some(j=>p.marks[j])))grow([i]);
    }
   }
  }
 }
 return best;
}
