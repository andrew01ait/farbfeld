import {variantsReady,variantChoiceError,extraCellError,noteVariantMove,settleVariantObjectives,shuffleFreeColors,shipPoints,objectivePoints,variantsEnabled,enableVariants,hiddenMinesEnabled} from './variants.js';
import {enableBonusFields,noteBonusMove,settleBonusFields,bonusFieldsEnabled,bonusPoints} from './bonus-fields.js';
export {BONUS_FEATURE,TREASURE_HUNT_FEATURE,treasureChainEnabled,bonusFieldsEnabled,bonusPoints,bonusAwards,validBonusState} from './bonus-fields.js';
import {CLASSIC,boardFor,requireBoardId,generateRandomBoard} from './boards.js';
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
export const MINE_FEATURE='mines-v1';
export const MINE_COVERAGE_FEATURE='airstrike-coverage-v1';
export const MINE_COVERAGE_CELLS=Math.ceil(BOARD.length*2/3);
export const LEAVE_FEATURE='leave-game-v1';
export const FORFEIT_SCORE=-10;
export const activePlayers=game=>game.players.map((p,i)=>p.left?-1:i).filter(i=>i>=0);
export function nextActivePlayer(game,from=game.active){for(let n=1;n<=game.players.length;n++){const pid=(from+n)%game.players.length;if(!game.players[pid].left)return pid;}return from;}
export const minesEnabled=g=>['computer','local','room','direct'].includes(g?.mode)&&g.players?.length>=2&&g.players.length<=6&&[1,2].includes(g.mines?.schema)&&g.mines.enabled===true;
export const mineCoverageEnabled=g=>g?.mines?.schema===2&&minesEnabled(g);
export function enableMines(game,{coverage=true}={}){
 if(!['computer','local','room','direct'].includes(game.mode)||game.players.length<2||game.players.length>6)throw Error('Luftangriff benötigt zwei bis sechs Personen.');
 if(game.status!=='playing'||game.turn!==0||game.round!==1||game.phase!=='roll'||game.mines!==undefined||game.players.some(p=>p.marks.some(Boolean)))throw Error('Luftangriff kann nur vor einer neuen Partie gewählt werden.');
 const n=game.players.length;
 const charge=()=>({unlocked:Array(n).fill(false),used:Array(n).fill(false)});
 return {...game,mines:{schema:coverage?2:1,enabled:true,...charge(),...(coverage?{coverage:charge()}:{}),columnRounds:Array.from({length:n},()=>Array(15).fill(null)),colorRounds:Array.from({length:n},()=>Object.fromEntries(COLORS.map(c=>[c,null]))),lastBlast:null}};
}
export const mineBlasts=game=>game?.mines?.blasts??(game?.mines?.lastBlast?[game.mines.lastBlast]:[]);
export const mineBlastTargets=blast=>Array.isArray(blast?.targets)?blast.targets:Number.isInteger(blast?.targetPid)&&Array.isArray(blast.cells)?[{pid:blast.targetPid,cells:blast.cells}]:[];
export function mineCharges(game,pid){
 if(!minesEnabled(game)||!game.players[pid])return [];
 const m=game.mines,charges=[{reason:'color',unlocked:m.unlocked[pid],used:m.used[pid]}];
 if(mineCoverageEnabled(game))charges.push({reason:'coverage',unlocked:m.coverage.unlocked[pid],used:m.coverage.used[pid]});
 return charges;
}
export const readyMineCharge=(game,pid)=>mineCharges(game,pid).find(charge=>charge.unlocked&&!charge.used)?.reason;
export const mineAttackCount=(game,pid)=>mineCharges(game,pid).filter(charge=>charge.used).length;
export function validMineState(game,{allowProjection=false}={}){
 const m=game?.mines;if(m===undefined)return true;if(!minesEnabled(game))return false;
 const n=game.players.length,projected=m.projected===true,pid=i=>Number.isInteger(i)&&i>=0&&i<n;
 const coverage=mineCoverageEnabled(game),validCharge=charge=>charge&&['unlocked','used'].every(key=>Array.isArray(charge[key])&&charge[key].length===n&&charge[key].every(v=>typeof v==='boolean'))&&!charge.used.some((used,i)=>used&&!charge.unlocked[i]);
 if(projected&&!allowProjection||!validCharge(m)||(coverage?!validCharge(m.coverage):m.coverage!==undefined))return false;
 const round=r=>r===null||Number.isSafeInteger(r)&&r>=1&&r<=game.round;
 if(m.columnRounds!==undefined||m.colorRounds!==undefined){if(!Array.isArray(m.columnRounds)||m.columnRounds.length!==n||!m.columnRounds.every(row=>Array.isArray(row)&&row.length===15&&row.every(round))||!Array.isArray(m.colorRounds)||m.colorRounds.length!==n||!m.colorRounds.every(row=>row&&COLORS.every(c=>round(row[c]))))return false;}
 else if(n!==2&&!projected)return false;
 const validBlast=blast=>{
  if(!blast||!pid(blast.by)||!(blast.charge===undefined?m.used[blast.by]:coverage&&blast.charge==='coverage'&&m.coverage.used[blast.by])||!(blast.round===undefined||Number.isSafeInteger(blast.round)&&blast.round>=1&&blast.round<=game.round)||!Number.isSafeInteger(blast.turn)||blast.turn<1||!(Number.isInteger(blast.target)&&blast.target>=0&&blast.target<105||projected&&blast.target===undefined))return false;
  const targets=mineBlastTargets(blast);return (projected?targets.length<=n-1:targets.length<=n-1&&targets.length>=game.players.filter((p,i)=>i!==blast.by&&!p.left).length)&&new Set(targets.map(t=>t?.pid)).size===targets.length&&targets.every(t=>t&&pid(t.pid)&&t.pid!==blast.by&&Array.isArray(t.cells)&&t.cells.length<=6&&new Set(t.cells).size===t.cells.length&&t.cells.every(i=>Number.isInteger(i)&&i>=0&&i<105&&blast.target!==undefined&&(i===blast.target||blastNeighbors(blast.target).includes(i))));
 };
 if(m.blasts!==undefined&&(!Array.isArray(m.blasts)||m.blasts.length>n*(coverage?2:1)||!m.blasts.every(validBlast)||new Set(m.blasts.map(b=>b.by+':'+(b.charge??'color'))).size!==m.blasts.length||m.blasts.length&&(m.blasts.at(-1).turn!==m.lastBlast?.turn||m.blasts.at(-1).by!==m.lastBlast?.by||m.blasts.at(-1).charge!==m.lastBlast?.charge)))return false;
 return m.lastBlast===null||validBlast(m.lastBlast);
}
export function projectMines(game,own){
 const m=game.mines,hidden=!!game.hiddenScores&&game.status!=='finished';
 const project=blast=>{if(!blast)return null;const targets=mineBlastTargets(blast).filter(t=>!hidden||t.pid===own).map(t=>({pid:t.pid,cells:[...t.cells]})),target=hidden&&blast.by!==own?targets[0]?.cells[0]:blast.target;return {by:blast.by,turn:blast.turn,...(blast.round!==undefined?{round:blast.round}:{}),...(target!==undefined?{target}:{}),...(blast.charge?{charge:blast.charge}:{}),targets};};
 const coverage=mineCoverageEnabled(game)?{coverage:{used:[...m.coverage.used],unlocked:m.coverage.unlocked.map((ready,pid)=>!hidden||pid===own?ready:m.coverage.used[pid])}}:{};
 return {schema:m.schema,enabled:true,projected:true,unlocked:[...m.unlocked],used:[...m.used],...coverage,blasts:mineBlasts(game).map(project),lastBlast:project(m.lastBlast)};
}
export function blastNeighbors(i){
 const out=[],row=Math.floor(i/15),col=i%15;
 for(let y=-1;y<=1;y++)for(let x=-1;x<=1;x++)if((x||y)&&row+y>=0&&row+y<7&&col+x>=0&&col+x<15)out.push((row+y)*15+col+x);
 return out;
}
export function canUseMine(game,pid){return minesEnabled(game)&&validMineState(game,{allowProjection:true})&&Number.isInteger(pid)&&!!readyMineCharge(game,pid)&&canAct(game,pid);}
function ensureMineRounds(g){
 const m=damageRounds(g);m.columnRounds??=g.players.map(()=>Array(15).fill(null));m.colorRounds??=g.players.map(()=>Object.fromEntries(COLORS.map(c=>[c,null])));
 g.players.forEach((p,pid)=>{p.columns.forEach((points,c)=>{if(points===null)m.columnRounds[pid][c]=null;else if(m.columnRounds[pid][c]===null)m.columnRounds[pid][c]=points===FIRST[c]?(g.columnClaims[c]??1):g.round;});for(const c of COLORS){if(p.colors[c]===null)m.colorRounds[pid][c]=null;else if(m.colorRounds[pid][c]===null)m.colorRounds[pid][c]=(g.announcements??[]).findLast(e=>e.pid===pid&&e.color===c)?.round??(p.colors[c]===5?(g.colorClaims[c]??1):g.round);}});
}
export function applyMineAttack(input,pid,target,rng=randomInt,reason){
 if(!canUseMine(input,pid)||input.mines.projected)throw Error('Luftangriff ist noch nicht freigeschaltet, bereits verbraucht oder gerade nicht möglich.');
 const charge=reason??readyMineCharge(input,pid);
 if(!mineCharges(input,pid).some(slot=>slot.reason===charge&&slot.unlocked&&!slot.used))throw Error('Dieser Luftangriff ist nicht mehr verfügbar. Bitte wähle das Ziel erneut.');
 if(!Number.isInteger(target)||target<0||target>=105)throw Error('Wähle ein Zielfeld für alle Gegner.');
 const g=structuredClone(input),targets=damageAt(g,pid,target,rng);
 const prior=mineBlasts(g),slot=charge==='coverage'?g.mines.coverage:g.mines;
 slot.used[pid]=true;g.turn++;
 g.mines.lastBlast={by:pid,target,targets,turn:g.turn,round:g.round,...(charge==='coverage'?{charge}:{}),...(g.players.length===2?{targetPid:targets[0].pid,cells:[...targets[0].cells]}:{})};
 g.mines.blasts=[...prior,g.mines.lastBlast];
 return g;
}
function unlockOpponentMines(game,actor,unlocked){
 game.players.forEach((p,pid)=>{if(pid!==actor&&!p.left)unlocked[pid]=true;});
}
const damageEnabled=g=>minesEnabled(g)||hiddenMinesEnabled(g);
const damageRounds=g=>minesEnabled(g)?g.mines:g.variants.hiddenMines.rounds;
export const damageBlasts=g=>[...mineBlasts(g),...(hiddenMinesEnabled(g)?g.variants.hiddenMines.blasts:[])];
function damageAt(g,pid,target,rng){
 const targets=[];ensureMineRounds(g);const rounds=damageRounds(g);let anyHit=false;
 const draw=max=>{const value=rng(max);if(!Number.isInteger(value)||value<0||value>=max)throw Error('Ungültiger Zufallswert.');return value;};
 for(let victim=0;victim<g.players.length;victim++)if(victim!==pid&&!g.players[victim].left){
  const p=g.players[victim],hit=!!p.marks[target],near=hit?blastNeighbors(target).filter(i=>p.marks[i]):[],count=hit?Math.min(near.length,3+draw(3)):0,cells=hit?[target]:[];
  for(let k=0;k<count;k++){const j=draw(near.length);cells.push(near.splice(j,1)[0]);}
  if(hit){anyHit=true;cells.forEach(i=>p.marks[i]=false);p.lastMove=p.lastMove.filter(i=>p.marks[i]);for(let c=0;c<15;c++)if(!Array.from({length:7},(_,r)=>p.marks[r*15+c]).every(Boolean)){p.columns[c]=null;rounds.columnRounds[victim][c]=null;}for(const c of COLORS)if(!boardFor(g,victim).cells.every((color,i)=>color!==c||p.marks[i])){p.colors[c]=null;rounds.colorRounds[victim][c]=null;}}
  targets.push({pid:victim,cells});
 }
 if(anyHit)reassignMineBonuses(g);
 return targets;
}
function triggerHiddenMines(g,pid,cells,rng){
 if(!hiddenMinesEnabled(g)||!cells.length)return;
 const h=g.variants.hiddenMines,entered=new Set(cells),queue=[];
 h.positions.forEach((positions,owner)=>{if(owner!==pid&&!g.players[owner].left)positions.forEach((target,slot)=>{if(!h.triggered[owner][slot]&&entered.has(target))queue.push({owner,target,slot});});});
 for(const {owner,target,slot} of queue){h.triggered[owner][slot]=true;const targets=damageAt(g,owner,target,rng);h.blasts.push({kind:'hidden',id:'hidden:'+owner+':'+slot,by:owner,slot,target,targets,round:g.round,turn:g.turn});}
}
function reassignMineBonuses(g){
 const ledger=damageRounds(g);
 for(let col=0;col<15;col++){
  const rounds=g.players.map((p,pid)=>p.left||p.columns[col]===null?null:ledger.columnRounds[pid][col]),earliest=Math.min(...rounds.filter(r=>r!==null));g.columnClaims[col]=Number.isFinite(earliest)?earliest:null;
  g.players.forEach((p,pid)=>{if(rounds[pid]!==null)p.columns[col]=rounds[pid]===earliest?FIRST[col]:LATER[col];});
 }
 for(const c of COLORS){
  const rounds=g.players.map((p,pid)=>p.left||p.colors[c]===null?null:ledger.colorRounds[pid][c]),earliest=Math.min(...rounds.filter(r=>r!==null));g.colorClaims[c]=Number.isFinite(earliest)?earliest:null;
  g.players.forEach((p,pid)=>{if(rounds[pid]!==null)p.colors[c]=rounds[pid]===earliest?5:3;});
 }
 g.announcements=(g.announcements??[]).filter(e=>g.players[e.pid]?.colors?.[e.color]!=null).map(e=>({...e,points:g.players[e.pid].colors[e.color]}));
}
export function mineTargetView(game,attacker){
 if(!minesEnabled(game)||!Number.isInteger(attacker)||attacker<0||attacker>=game.players.length)return null;
 const hidden=!!game.hiddenScores&&game.status!=='finished',shared=game.players.length>2,layout=boardFor(game,game.players.length===2?1-attacker:attacker),target=game.players.find((_,i)=>i!==attacker);
 return {hidden,shared,cells:layout.cells.map((color,index)=>({index,color,star:layout.stars.includes(index),...(!hidden&&!shared?{marked:!!target.marks[index]}:{})}))};
}
export function chooseComputerMineTarget(game,rng=randomInt){
 if(!canUseMine(game,1))return null;
 // A concealed human sheet is never inspected, even to prefer occupied cells.
 if(game.hiddenScores)return rng(105);
 const p=game.players[0],stars=new Set(boardFor(game,0).stars),board=boardFor(game,0).cells;
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
export function createGame(names,mode='solo',ids=[],options={}) {const game={schema:1,mode,boardId:requireBoardId(options.boardId),hiddenScores:options.hiddenScores===true,announcements:[],players:names.map((n,i)=>player(n,ids[i]??String(i))),round:1,active:0,phase:'roll',dice:null,chosen:null,submitted:[],columnClaims:Array(15).fill(null),colorClaims:Object.fromEntries(COLORS.map(c=>[c,null])),status:'playing',log:[],turn:0};if(game.boardId==='random')game.boardLayout=generateRandomBoard();const withBonus=options.bonusFields===true?enableBonusFields(game,randomInt,{treasureHunt:options.treasureHunt}):game;const configured=options.mines===true?enableMines(withBonus,{coverage:options.mineCoverage!==false}):withBonus;return options.variants===undefined?configured:enableVariants(configured,options.variants,randomInt);}
export function availableDice(game,pid){ if(!game.dice)return {colors:[],numbers:[]};const removed=game.round>3&&game.chosen&&pid!==game.active;return {colors:game.dice.colors.map((v,i)=>({value:v,index:i})).filter(d=>!removed||d.index!==game.chosen.ci),numbers:game.dice.numbers.map((v,i)=>({value:v,index:i})).filter(d=>!removed||d.index!==game.chosen.ni)}; }
export function canAct(game,pid){return variantsReady(game)&&game.status==='playing'&&!!game.players[pid]&&!game.players[pid].left&&game.phase==='choose'&&!game.submitted.includes(pid)&&(pid===game.active||game.submitted.includes(game.active));}
export function resolveChoice(game,pid,move){
 const d=availableDice(game,pid),c=d.colors.find(x=>x.index===move.ci),n=d.numbers.find(x=>x.index===move.ni);
 if(!c||!n)return {error:'Wähle je einen verfügbaren Farb- und Zahlenwürfel.'};
 const variantError=variantChoiceError(game,pid,move);if(variantError)return {error:variantError};
 const color=c.value==='*'||move.ability==='color'?move.color:c.value,baseCount=n.value==='?'?move.count:n.value,count=baseCount+(move.ability==='number'?move.delta:0);
 if(!COLORS.includes(color))return {error:'Wähle eine Farbe.'};
 if(!Number.isInteger(baseCount)||baseCount<1||baseCount>5||!Number.isInteger(count)||count<1||count>5)return {error:'Die Zahl muss auch nach der Anpassung zwischen 1 und 5 liegen.'};
 const cost=Number(c.value==='*'&&move.ability!=='color')+Number(n.value==='?');if(cost>game.players[pid].jokers)return {error:'Dafür hast du nicht genug Joker übrig.'};
 return {color,count,cost};
}
export function validateCells(p,cells,color,count,partial=false,game=null){const {cells:board}=boardFor(game,game?.players?.indexOf(p));if(!Array.isArray(cells)||new Set(cells).size!==cells.length)return 'Wähle jedes Feld nur einmal.';if(!cells.length)return 'Tippe auf das Spielfeld.';if(cells.length>count||(!partial&&cells.length!==count))return `Wähle genau ${count} zusammenhängende Felder.`;if(cells.some(i=>!Number.isInteger(i)||i<0||i>=105||p.marks[i]||board[i]!==color))return 'Alle neuen Felder müssen frei sein und dieselbe Farbe haben.';const set=new Set(cells),seen=new Set([cells[0]]),queue=[cells[0]];while(queue.length){for(const i of neighbors(queue.shift()))if(set.has(i)&&!seen.has(i)){seen.add(i);queue.push(i);}}if(seen.size!==set.size)return 'Die neuen Kreuze müssen untereinander waagrecht oder senkrecht verbunden sein.';if(!cells.some(i=>i%15===7||neighbors(i).some(j=>p.marks[j])))return 'Beginne in Spalte H oder schließe an deine bisherigen Kreuze an.';return null;}
export function applyMove(input,pid,move,rng=randomInt){
 if(input.variants?.projected||input.bonuses?.awards||input.mines?.projected)throw Error('Nur die Spielleitung bestätigt Züge.');
 if(!Number.isInteger(pid)||!input.players[pid])throw Error('Spieler nicht gefunden.');if(!canAct(input,pid))throw Error('Du bist noch nicht am Zug oder hast schon bestätigt.');
 const g=structuredClone(input),p=g.players[pid];let entered=[];
 if(move.pass){p.passes++;p.lastMove=[];}else{
  const choice=resolveChoice(g,pid,move);if(choice.error)throw Error(choice.error);
  const error=validateCells(p,move.cells,choice.color,choice.count,false,g)||extraCellError(g,pid,move);if(error)throw Error(error);
  const cells=move.ability==='extra'?[...move.cells,move.extraCell]:move.cells;
  cells.forEach(i=>p.marks[i]=true);p.jokers-=choice.cost;p.lastMove=[...cells];noteBonusMove(g,pid,cells);noteVariantMove(g,pid,cells,move);entered=cells;
  if(pid===g.active)g.chosen={ci:move.ci,ni:move.ni};
 }
 g.submitted.push(pid);g.log.push({round:g.round,pid,player:p.name,pass:!!move.pass,color:move.pass?null:boardFor(g,pid).cells[move.cells[0]],count:move.pass?0:move.cells.length,...(move.ability?{ability:move.ability}:{}),...(move.ability==='extra'?{extra:move.extraCell}:{})});g.log=g.log.slice(-120);g.turn++;
 triggerHiddenMines(g,pid,entered,rng);
 if(entered.length&&mineCoverageEnabled(g)&&p.marks.filter(Boolean).length>=MINE_COVERAGE_CELLS)unlockOpponentMines(g,pid,g.mines.coverage.unlocked);
 if(g.players.every((player,i)=>player.left||g.submitted.includes(i)))finishRound(g,rng);return g;
}
export function finishRound(g,rng=randomInt){settleBonusFields(g);settleVariantObjectives(g);if(damageEnabled(g))ensureMineRounds(g);for(let c=0;c<15;c++){const completed=g.players.filter(p=>!p.left&&p.columns[c]===null&&Array.from({length:7},(_,r)=>p.marks[r*15+c]).every(Boolean));for(const p of completed){p.columns[c]=g.columnClaims[c]===null?FIRST[c]:LATER[c];if(damageEnabled(g))damageRounds(g).columnRounds[g.players.indexOf(p)][c]=g.round;}if(completed.length&&g.columnClaims[c]===null)g.columnClaims[c]=g.round;}
for(const color of COLORS){const completed=g.players.filter(p=>!p.left&&p.colors[color]===null&&boardFor(g,g.players.indexOf(p)).cells.every((c,i)=>c!==color||p.marks[i]));for(const p of completed){const index=g.players.indexOf(p);p.colors[color]=g.colorClaims[color]===null?5:3;if(damageEnabled(g))damageRounds(g).colorRounds[index][color]=g.round;if(minesEnabled(g))unlockOpponentMines(g,index,g.mines.unlocked);g.announcements??=[];const pid=g.players.indexOf(p);g.announcements.push({id:g.round+':'+pid+':'+color,pid,name:p.name,color,round:g.round,points:p.colors[color]});}if(completed.length&&g.colorClaims[color]===null)g.colorClaims[color]=g.round;}
if(damageEnabled(g))reassignMineBonuses(g);
const end=g.mode==='solo'?g.round>=30:g.players.some(p=>!p.left&&COLORS.filter(c=>p.colors[c]!==null).length>=2);if(end){g.status='finished';g.phase='finished';return;}shuffleFreeColors(g,rng);g.round++;g.active=nextActivePlayer(g);g.phase='roll';g.dice=null;g.chosen=null;g.submitted=[];}
export function leaveGame(input,pid){
 if(input.variants?.projected)throw Error('Nur die Spielleitung bestätigt Aktionen.');
 if(input.status!=='playing'||!Number.isInteger(pid)||!input.players[pid]||input.players[pid].left||input.players.length<2)throw Error('Du kannst diese Partie gerade nicht verlassen.');
 const g=structuredClone(input);g.players[pid].left=true;g.players[pid].forfeit=FORFEIT_SCORE;g.players[pid].leftRound=g.round;g.turn++;
 if(damageEnabled(g)){ensureMineRounds(g);reassignMineBonuses(g);}
 if(g.phase==='choose'&&!g.submitted.includes(pid))g.submitted.push(pid);
 const active=activePlayers(g);
 if(active.length===1){if(g.phase==='choose'){const finalRound=g.round;finishRound(g);g.round=finalRound;}g.status='finished';g.phase='finished';g.active=active[0];g.finishReason='last-player';return g;}
 if(g.phase==='choose'&&active.every(i=>g.submitted.includes(i)))finishRound(g);
 else if(g.phase==='roll'&&g.active===pid)g.active=nextActivePlayer(g,pid);
 return g;
}
export function validLeavingState(game){if(!game)return true;if(!Array.isArray(game.players))return false;if(!game.players.every(p=>p&& (p.left===undefined||p.left===true&&p.forfeit===FORFEIT_SCORE&&Number.isSafeInteger(p.leftRound)&&p.leftRound>=1&&p.leftRound<=game.round)))return false;const active=activePlayers(game);return !game.players.some(p=>p.left)||active.length>=1&&(game.status!=='playing'||active.length>=2&&(!game.players[game.active]?.left||game.phase==='choose'&&game.submitted?.includes(game.active)))&&(game.finishReason!=='last-player'||game.status==='finished'&&active.length===1);}
export function rollGame(input,rng=randomInt){if(input.variants?.projected||!variantsReady(input)||input.status!=='playing'||input.phase!=='roll'||input.players[input.active]?.left)throw Error('Dieser Wurf läuft bereits.');const g=structuredClone(input);g.dice=rollDice(g.mode==='solo',rng);g.phase='choose';g.turn++;return g;}
export function score(p,game=null){
 const pid=game?.players.indexOf(p),columns=p.columns.reduce((s,x)=>s+(x??0),0),colors=Object.values(p.colors).reduce((s,x)=>s+(x??0),0),stars=boardFor(game,pid).stars.filter(i=>!p.marks[i]).length;
 const bonus=bonusPoints(game,pid),shipBonus=shipPoints(game,pid),objectiveBonus=objectivePoints(game,pid),mineCost=mineAttackCount(game,pid)*MINE_COST;
 return {columns,colors,jokers:p.jokers,stars,penalty:stars*2,...(minesEnabled(game)?{mineCost}:{}),...(bonusFieldsEnabled(game)?{bonus}:{}),...(variantsEnabled(game)&&game.variants.battleship?{shipBonus}:{}),...(variantsEnabled(game)&&game.variants.objectives?{objectiveBonus}:{}),...(p.left?{left:true,forfeit:FORFEIT_SCORE}:{}),total:p.left?FORFEIT_SCORE:columns+colors+p.jokers-stars*2-mineCost+bonus+shipBonus+objectiveBonus,marked:p.marks.filter(Boolean).length};
}
export function rankings(g){return g.players.map((p,i)=>({...score(p,g),name:p.name,id:p.id,index:i})).sort((a,b)=>Number(!!a.left)-Number(!!b.left)||b.total-a.total||b.jokers-a.jokers);}
export function findMove(g,pid,filter={}){
 if(!variantsReady(g))return null;
 const {cells:board,stars}=boardFor(g,pid),p=g.players[pid],dice=availableDice(g,pid),required=Array.isArray(filter.cells)?filter.cells:[];
 let best=null,bestValue=-Infinity;
 for(const c of dice.colors){
  if(filter.ci!==undefined&&filter.ci!==null&&filter.ci!==c.index)continue;
  for(const n of dice.numbers){
   if(filter.ni!==undefined&&filter.ni!==null&&filter.ni!==n.index)continue;
   for(const color of c.value==='*'||filter.ability==='color'?COLORS:[c.value]){
    if(filter.color!==undefined&&filter.color!==null&&filter.color!==color)continue;
    for(const baseCount of n.value==='?'?[1,2,3,4,5]:[n.value]){
     const move={ci:c.index,ni:n.index,color,count:baseCount,...(filter.ability?{ability:filter.ability,delta:filter.delta}:{})},resolved=resolveChoice(g,pid,move);if(resolved.error)continue;
     const {count,cost}=resolved;if(filter.count!==undefined&&filter.count!==null&&filter.count!==baseCount||required.length>count)continue;
     const seen=new Set();
     function grow(cells){
      const key=[...cells].sort((a,b)=>a-b).join(',');if(seen.has(key))return;seen.add(key);
      if(cells.length===count){
       if(required.some(i=>!cells.includes(i)))return;
       let extraCell;let all=cells;
       if(filter.ability==='extra'){const options=[...new Set(cells.flatMap(neighbors))].filter(i=>!p.marks[i]&&!cells.includes(i));if(!options.length)return;options.sort((a,b)=>Number(stars.includes(b))-Number(stars.includes(a)));extraCell=options[0];all=[...cells,extraCell];}
       let value=all.length-cost*1.5+all.filter(i=>stars.includes(i)).length*2.5;
       for(let col=0;col<15;col++){
        if(p.columns[col]!==null)continue;
        let missing=0;for(let r=0;r<7;r++)if(!p.marks[r*15+col]&&!all.includes(r*15+col))missing++;
        if(!missing)value+=FIRST[col]*2;
       }
       if(value>bestValue){bestValue=value;best={...move,cells:[...cells],...(extraCell!==undefined?{extraCell}:{})};}return;
      }
      for(const i of new Set(cells.flatMap(neighbors)))if(!p.marks[i]&&board[i]===color&&!cells.includes(i))grow([...cells,i]);
     }
     for(let i=0;i<105;i++)if(!p.marks[i]&&board[i]===color&&(i%15===7||neighbors(i).some(j=>p.marks[j])))grow([i]);
    }
   }
  }
 }
 return best;
}
