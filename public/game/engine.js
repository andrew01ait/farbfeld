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
export function finishRound(g){for(let c=0;c<15;c++){const completed=g.players.filter(p=>p.columns[c]===null&&Array.from({length:7},(_,r)=>p.marks[r*15+c]).every(Boolean));for(const p of completed)p.columns[c]=g.columnClaims[c]===null?FIRST[c]:LATER[c];if(completed.length&&g.columnClaims[c]===null)g.columnClaims[c]=g.round;}
for(const color of COLORS){const completed=g.players.filter(p=>p.colors[color]===null&&boardFor(g).cells.every((c,i)=>c!==color||p.marks[i]));for(const p of completed){p.colors[color]=g.colorClaims[color]===null?5:3;g.announcements??=[];const pid=g.players.indexOf(p);g.announcements.push({id:g.round+':'+pid+':'+color,pid,name:p.name,color,round:g.round,points:p.colors[color]});}if(completed.length&&g.colorClaims[color]===null)g.colorClaims[color]=g.round;}
const end=g.mode==='solo'?g.round>=30:g.players.some(p=>COLORS.filter(c=>p.colors[c]!==null).length>=2);if(end){g.status='finished';g.phase='finished';return;}g.round++;g.active=(g.active+1)%g.players.length;g.phase='roll';g.dice=null;g.chosen=null;g.submitted=[];}
export function rollGame(input,rng=randomInt){if(input.status!=='playing'||input.phase!=='roll')throw Error('Dieser Wurf läuft bereits.');const g=structuredClone(input);g.dice=rollDice(g.mode==='solo',rng);g.phase='choose';g.turn++;return g;}
export function score(p,game=null){const columns=p.columns.reduce((s,x)=>s+(x??0),0),colors=Object.values(p.colors).reduce((s,x)=>s+(x??0),0),stars=boardFor(game).stars.filter(i=>!p.marks[i]).length;return {columns,colors,jokers:p.jokers,stars,penalty:stars*2,total:columns+colors+p.jokers-stars*2,marked:p.marks.filter(Boolean).length};}
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
