import {boardFor} from './boards.js';
const COLORS=['g','y','b','p','o'];
export const ABILITIES=Object.freeze([{id:'color',name:'Freie Farbwahl',symbol:'✳'},{id:'number',name:'Zahl anpassen',symbol:'±1'},{id:'extra',name:'Zusatzfeld',symbol:'+1'}].map(Object.freeze));
const cell=i=>Number.isInteger(i)&&i>=0&&i<105,pid=i=>i===0||i===1;
export const VARIANTS_FEATURE='variants-v1';
export const HIDDEN_MINES_FEATURE='hidden-mines-v1';
export const VARIANT_KEYS=Object.freeze(['battleship','discovery','objectives','shuffle','hiddenMines']);
// Public catalogue. These are the existing objective criteria, so saved tasks
// and older variants-v1 clients keep their original scoring and validation.
const OBJECTIVE_TIERS=[
 {deadline:12,columns:[1],stars:[3,4],color:[8,10]},
 {deadline:20,columns:[2],stars:[5,6],color:[12,14]},
 {deadline:null,columns:[3,4],stars:[8,10],color:[16,18]},
];
export const OBJECTIVE_POOL=Object.freeze(OBJECTIVE_TIERS.flatMap(tier=>[
 ...tier.columns.map(target=>({type:'columns',target,deadline:tier.deadline})),
 ...tier.stars.map(target=>({type:'stars',target,deadline:tier.deadline})),
 ...tier.color.flatMap(target=>COLORS.map(color=>({type:'color',target,color,deadline:tier.deadline}))),
]).map(Object.freeze));
export function normalizeVariantOptions(value={}){
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(k=>!VARIANT_KEYS.includes(k))||Object.values(value).some(v=>typeof v!=='boolean'))throw Error('Bitte gültige Varianten wählen.');
 return Object.fromEntries(VARIANT_KEYS.filter(k=>k!=='hiddenMines'||k in value).map(k=>[k,value[k]===true]));
}
export const hasVariantOptions=value=>VARIANT_KEYS.some(k=>value?.[k]===true);
export const variantsEnabled=g=>['computer','local','room','direct'].includes(g?.mode)&&g.players?.length>=2&&g.players.length<=6&&g.variants?.schema===1;
const participant=(g,i)=>Number.isInteger(i)&&i>=0&&i<g.players.length;
const neighbors=i=>[i%15?i-1:-1,i%15<14?i+1:-1,i>=15?i-15:-1,i<90?i+15:-1].filter(cell);
const ADJ=Array.from({length:105},(_,i)=>neighbors(i));
const draw=(rng,max)=>{const n=rng(max);if(!Number.isInteger(n)||n<0||n>=max)throw Error('Ungültiger Varianten-Zufallswert.');return n;};
export const computerVariants=g=>g?.mode==='computer'&&g.players?.length===2&&g.variants?.schema===1;
const activeReady=(g,ready)=>ready.every((done,p)=>done||g.players[p].left);
const beforeFirstRoll=g=>g.round===1&&g.phase==='roll'&&g.turn===g.players.filter(p=>p.left).length&&g.players.every(p=>!p.marks?.some(Boolean));
export const battlePreparing=g=>g?.status==='playing'&&variantsEnabled(g)&&!!g.variants.battleship&&!activeReady(g,g.variants.battleship.ready);
export const hiddenMinesEnabled=g=>variantsEnabled(g)&&!!g.variants.hiddenMines;
export const hiddenMinesPreparing=g=>g?.status==='playing'&&hiddenMinesEnabled(g)&&!activeReady(g,g.variants.hiddenMines.ready);
export const variantsReady=g=>!g?.variants||variantsEnabled(g)&&!battlePreparing(g)&&!hiddenMinesPreparing(g);
export function hiddenMineCount(players){if(!Number.isInteger(players)||players<2||players>6)throw Error('Minen benötigen zwei bis sechs Personen.');return players<=3?2:1;}
function randomMinePositions(count,rng){const free=Array.from({length:105},(_,i)=>i);return Array.from({length:count},()=>free.splice(draw(rng,free.length),1)[0]);}
export function applyHiddenMineAction(input,who,action,rng){
 if(!hiddenMinesPreparing(input)||!participant(input,who)||input.variants.projected||input.players[who].left||input.variants.hiddenMines.ready[who]||!beforeFirstRoll(input))throw Error('Die Minen können nur vor Spielbeginn ausgelegt werden.');
 if(input.variants.battleship&&!input.variants.battleship.ready[who])throw Error('Bestätige zuerst deine Flotte.');
 if(!action||typeof action!=='object'||Array.isArray(action))throw Error('Wähle eine Minenaktion.');
 const g=structuredClone(input),h=g.variants.hiddenMines;
 if(action.kind==='random')h.positions[who]=randomMinePositions(hiddenMineCount(g.players.length),rng);
 else if(action.kind==='ready'){if(!Array.isArray(h.positions[who])||h.positions[who].length!==hiddenMineCount(g.players.length)||!h.positions[who].every(cell)||new Set(h.positions[who]).size!==h.positions[who].length)throw Error('Platziere alle Minen auf verschiedenen Feldern.');h.ready[who]=true;}
 else if(action.kind==='place'){
  if(!Number.isInteger(action.slot)||action.slot<0||action.slot>=h.positions[who].length||!cell(action.index))throw Error('Wähle eine Mine und ein gültiges Feld.');
  if(h.positions[who].some((i,k)=>k!==action.slot&&i===action.index))throw Error('Jede Mine braucht ein eigenes Feld.');
  h.positions[who][action.slot]=action.index;
 }else throw Error('Wähle eine gültige Minenaktion.');
 return g;
}
export const fleetPlayer=g=>battlePreparing(g)?g.variants.battleship.ready.findIndex(ready=>!ready):g?.active??0;
function line(start,size,vertical){if(!cell(start)||!Number.isInteger(size)||size<1||size>5||(vertical?Math.floor(start/15)+size>7:start%15+size>15))return null;return Array.from({length:size},(_,i)=>start+i*(vertical?15:1));}
function validFleet(fleet){
 if(!Array.isArray(fleet)||fleet.length!==5)return false;
 const used=[];
 for(let s=0;s<5;s++){const cells=fleet[s];if(!Array.isArray(cells)||cells.length!==s+1||!cells.every(cell)||new Set(cells).size!==cells.length)return false;const sorted=[...cells].sort((a,b)=>a-b);if(![line(sorted[0],s+1,false),line(sorted[0],s+1,true)].some(a=>a&&a.every((x,i)=>x===sorted[i])))return false;used.push(...cells);}
 return new Set(used).size===15;
}
export function randomFleet(rng){
 const fleet=Array(5),used=new Set();
 for(let size=5;size>=1;size--){const options=[];for(let i=0;i<105;i++)for(const v of size===1?[false]:[false,true]){const a=line(i,size,v);if(a&&a.every(x=>!used.has(x)))options.push(a);}fleet[size-1]=options[draw(rng,options.length)];fleet[size-1].forEach(x=>used.add(x));}return fleet;
}
export function placeFleetShip(input,ship,start,vertical=false,who=0){
 if(!battlePreparing(input)||!participant(input,who)||input.variants.projected||input.players[who].left||input.variants.battleship.ready[who])throw Error('Die Flotte ist bereits bestätigt.');
 if(!Number.isInteger(ship)||ship<0||ship>4)throw Error('Wähle ein Schiff.');
 const cells=line(start,ship+1,vertical);if(!cells)throw Error('Das Schiff muss vollständig auf dem Brett liegen.');
 const occupied=new Set(input.variants.battleship.fleets[who].flatMap((a,i)=>i===ship?[]:a));if(cells.some(i=>occupied.has(i)))throw Error('Schiffe dürfen sich berühren, aber nicht überlappen.');
 const g=structuredClone(input);g.variants.battleship.fleets[who][ship]=cells;return g;
}
export function randomizeHumanFleet(input,rng,who=0){if(!battlePreparing(input)||!participant(input,who)||input.variants.projected||input.players[who].left||input.variants.battleship.ready[who])throw Error('Die Flotte ist bereits bestätigt.');const g=structuredClone(input);g.variants.battleship.fleets[who]=randomFleet(rng);return g;}
export function confirmHumanFleet(input,who=0){if(!battlePreparing(input)||!participant(input,who)||input.variants.projected||input.players[who].left||input.variants.battleship.ready[who]||!validFleet(input.variants.battleship.fleets[who]))throw Error('Platziere alle fünf Schiffe.');const g=structuredClone(input);g.variants.battleship.ready[who]=true;return g;}
export function applyFleetAction(input,who,action,rng){
 if(!action||typeof action!=='object'||Array.isArray(action))throw Error('Wähle eine Flottenaktion.');
 if(action.kind==='random')return randomizeHumanFleet(input,rng,who);
 if(action.kind==='ready')return confirmHumanFleet(input,who);
 if(action.kind==='place'&&typeof action.vertical==='boolean')return placeFleetShip(input,action.ship,action.start,action.vertical,who);
 throw Error('Wähle eine gültige Flottenaktion.');
}
function makeTasks(rng,n){
 // One of each kind avoids three nested goals of the same kind. Shuffle the
 // kinds across early/middle/end deadlines, then draw from the matching pool.
 // Only the match creator draws, once; render/load/AI never regenerate tasks.
 const types=['columns','stars','color'];
 for(let i=types.length-1;i>0;i--){const j=draw(rng,i+1);[types[i],types[j]]=[types[j],types[i]];}
 return OBJECTIVE_TIERS.map(({deadline},id)=>{
  const pool=OBJECTIVE_POOL.filter(t=>t.deadline===deadline&&t.type===types[id]),t=pool[draw(rng,pool.length)];
  return {id,...t,firstRound:null,claims:Array(n).fill(null),pending:Array(n).fill(null)};
 });
}
export function enableComputerVariants(input,options={},rng){
 if(input.mode!=='computer'&&hasVariantOptions(options))throw Error('Diese Einrichtung ist für Computerpartien.');
 return enableVariants(input,options,rng);
}
export function enableVariants(input,value={},rng){
 const options=normalizeVariantOptions(value);if(!hasVariantOptions(options))return input;
 const n=input.players.length;
 if(!['computer','local','room','direct'].includes(input.mode)||n<2||n>6||input.mode==='computer'&&n!==2)throw Error('Varianten benötigen zwei bis sechs Personen.');
 if(options.battleship&&n!==2)throw Error('Schiffsboni sind nur mit genau zwei Personen möglich.');
 if(input.variants||input.status!=='playing'||input.round!==1||input.turn!==0||input.phase!=='roll'||input.players.some(p=>p.left||p.marks.some(Boolean)))throw Error('Varianten werden vor einer neuen Partie gewählt.');
 const g=structuredClone(input),v=g.variants={schema:1};
 if(options.battleship)v.battleship={fleets:[randomFleet(rng),randomFleet(rng)],ready:[false,g.mode==='computer'],shots:[Array(105).fill(0),Array(105).fill(0)],sunk:[Array(5).fill(false),Array(5).fill(false)],revealed:[[],[]],lastVolley:null};
 if(options.discovery){const free=Array.from({length:105},(_,i)=>i);v.discovery={fields:['color','number','extra','color','number','extra'].map(type=>({index:free.splice(draw(rng,free.length),1)[0],type,owner:null,round:null,used:false}))};}
 if(options.objectives)v.objectives={tasks:makeTasks(rng,n)};
 if(options.shuffle){const colors=boardFor(g).cells;v.layouts=Array.from({length:n},()=>[...colors]);v.mixing={interval:5,lastRound:0,changed:Array.from({length:n},()=>[])};}
 if(options.hiddenMines){
  const count=hiddenMineCount(n);
  v.hiddenMines={positions:g.players.map(()=>randomMinePositions(count,rng)),ready:g.players.map((_,p)=>g.mode==='computer'&&p===1),triggered:g.players.map(()=>Array(count).fill(false)),blasts:[]};
  if(!g.mines)v.hiddenMines.rounds={columnRounds:g.players.map(()=>Array(15).fill(null)),colorRounds:g.players.map(()=>Object.fromEntries(COLORS.map(c=>[c,null])))};
 }
 return g;
}
export function abilityCharges(g,who,type,{readyOnly=true}={}){return variantsEnabled(g)&&participant(g,who)?(g.variants.discovery?.fields||[]).filter(f=>f.owner===who&&!f.used&&f.type===type&&(!readyOnly||f.round<g.round)):[];}
export function variantChoiceError(g,who,move){
 if(!move.ability)return move.extraCell===null||move.extraCell===undefined?null:'Wähle die Fähigkeit Zusatzfeld.';
 if(!variantsEnabled(g)||!ABILITIES.some(a=>a.id===move.ability)||!abilityCharges(g,who,move.ability).length)return 'Diese Fähigkeit ist noch nicht verfügbar.';
 return move.ability==='number'&&![1,-1].includes(move.delta)?'Wähle für die Zahl +1 oder −1.':null;
}
export function extraCellError(g,who,move){if(move.ability!=='extra')return null;const i=move.extraCell;if(!cell(i)||g.players[who].marks[i]||move.cells.includes(i))return 'Wähle ein zusätzliches freies Feld beliebiger Farbe.';return move.cells.some(j=>neighbors(j).includes(i))?null:'Das Zusatzfeld muss direkt an deinen neuen Zug angrenzen.';}
export function objectiveProgress(g,who,task,marks=g.players[who].marks){
 const board=boardFor(g,who);
 if(task.type==='columns')return Array.from({length:15},(_,c)=>Array.from({length:7},(_,r)=>marks[r*15+c]).every(Boolean)).filter(Boolean).length;
 if(task.type==='stars')return board.stars.filter(i=>marks[i]).length;
 return marks.reduce((n,m,i)=>n+Number(m&&board.cells[i]===task.color),0);
}
export function noteVariantMove(g,who,cells,move){
 if(!variantsEnabled(g))return;const v=g.variants;
 if(move.ability)abilityCharges(g,who,move.ability)[0].used=true;
 for(const f of v.discovery?.fields||[])if(f.owner===null&&cells.includes(f.index)){f.owner=who;f.round=g.round;}
 if(v.battleship){const b=v.battleship,results=[],sunk=[],other=1-who;
  for(const index of cells)if(!b.shots[who][index]){const hit=b.fleets[other].some(s=>s.includes(index));b.shots[who][index]=hit?2:1;results.push({index,hit});}
  for(let s=0;s<5;s++)if(!b.sunk[who][s]&&b.fleets[other][s].every(i=>b.shots[who][i]===2)){b.sunk[who][s]=true;const ship={cells:[...b.fleets[other][s]],points:5-s};sunk.push(ship);b.revealed[who].push([...ship.cells]);}
  if(results.length)b.lastVolley={id:(g.turn+1)+':'+who,by:who,round:g.round,results,sunk};
 }
 for(const t of v.objectives?.tasks||[])if(t.claims[who]===null&&t.pending[who]===null&&(t.deadline===null||g.round<=t.deadline)&&objectiveProgress(g,who,t)>=t.target)t.pending[who]=g.round;
}
export function settleVariantObjectives(g){if(!variantsEnabled(g))return;for(const t of g.variants.objectives?.tasks||[]){for(let p=0;p<g.players.length;p++)if(t.pending[p]!==null){t.claims[p]=t.pending[p];t.pending[p]=null;}const a=t.claims.filter(r=>r!==null);t.firstRound=a.length?Math.min(...a):null;}}
function freeColorGroups(colors,marks){
 const groups=[],owner=Array(105);
 for(let start=0;start<105;start++)if(!marks[start]&&!owner[start]){
  const group={color:colors[start],cells:[start]};groups.push(group);owner[start]=group;
  for(let k=0;k<group.cells.length;k++)for(const i of ADJ[group.cells[k]])if(!marks[i]&&!owner[i]&&colors[i]===group.color){owner[i]=group;group.cells.push(i);}
 }
 return {groups,owner};
}
function groupedFreeColors(old,marks,rng){
 // Exchange whole, equally sized free groups. Marked cells are barriers:
 // existing playable groups never split and every free colour count stays exact.
 const next=[...old];let parts=freeColorGroups(next,marks),best=[...old],bestLarge=-1,bestSingles=106,bestChanged=-1;
 for(let attempt=0;attempt<180;attempt++){
  const candidates=parts.groups.filter(a=>a.cells.length<=6&&parts.groups.some(b=>b.color!==a.color&&b.cells.length===a.cells.length));
  if(!candidates.length)break;
  const a=candidates[draw(rng,candidates.length)],others=parts.groups.filter(b=>b.color!==a.color&&b.cells.length===a.cells.length),b=others[draw(rng,others.length)];
  const joinedSize=(x,y)=>{
   const joined=new Set(x.cells.flatMap(i=>ADJ[i]).map(i=>parts.owner[i]).filter(group=>group&&group!==y&&group.color===y.color));
   return x.cells.length+[...joined].reduce((n,group)=>n+group.cells.length,0);
  };
  // Allow small islands to join, without making new oversized colour regions.
  // Larger regions in older saves stay intact and need not be regenerated.
  if(joinedSize(a,b)>6||joinedSize(b,a)>6)continue;
  a.cells.forEach(i=>next[i]=b.color);b.cells.forEach(i=>next[i]=a.color);parts=freeColorGroups(next,marks);
  const large=parts.groups.reduce((n,group)=>n+(group.cells.length>=3?group.cells.length:0),0),singles=parts.groups.filter(group=>group.cells.length===1).length,changed=next.reduce((n,c,i)=>n+Number(c!==old[i]),0);
  if(large>bestLarge||large===bestLarge&&(singles<bestSingles||singles===bestSingles&&changed>bestChanged)){best=[...next];bestLarge=large;bestSingles=singles;bestChanged=changed;}
 }
 return best;
}
export function shuffleFreeColors(g,rng){
 const v=g.variants;if(!variantsEnabled(g)||!v.mixing||v.projected||g.status!=='playing'||g.round%5!==0||v.mixing.lastRound===g.round)return;
 v.mixing.changed=[];
 for(let p=0;p<g.players.length;p++){if(g.players[p].left){v.mixing.changed.push([]);continue;}const old=v.layouts[p],next=groupedFreeColors(old,g.players[p].marks,rng);v.layouts[p]=next;v.mixing.changed.push(old.flatMap((color,i)=>color!==next[i]?[i]:[]));}
 v.mixing.lastRound=g.round;
}
export function shipPoints(g,p){return variantsEnabled(g)&&participant(g,p)?(g.variants.battleship?.sunk[p]||[]).reduce((n,s,i)=>n+(s?5-i:0),0):0;}
export function objectivePoints(g,p){return variantsEnabled(g)&&participant(g,p)?(g.variants.objectives?.tasks||[]).reduce((n,t)=>n+(t.claims[p]===null?0:t.claims[p]===t.firstRound?5:2),0):0;}
// AI evaluates only public finds, public tasks and its own previous shots.
export function variantMoveValue(g,p,cells){
 if(!variantsEnabled(g))return 0;let gain=0;const v=g.variants,set=new Set(cells);
 for(const f of v.discovery?.fields||[])if(f.owner===null&&set.has(f.index))gain+=2.1;
 const marks=g.players[p].marks.map((m,i)=>m||set.has(i));
 for(const t of v.objectives?.tasks||[])if(t.claims[p]===null&&t.pending[p]===null&&(t.deadline===null||g.round<=t.deadline)){const a=Math.min(t.target,objectiveProgress(g,p,t)),b=Math.min(t.target,objectiveProgress(g,p,t,marks));gain+=(b-a)/t.target*2+(a<t.target&&b===t.target?(t.firstRound===null?5:2):0);}
 if(v.battleship){const shots=v.battleship.shots[p],wrecks=new Set(v.battleship.revealed[p].flat());for(const i of cells)if(!shots[i]){gain+=.12;for(const j of neighbors(i))if(shots[j]===2&&!wrecks.has(j))gain+=.85;}}
 return gain;
}
// Only the authority holds both fleets. Public facts and the viewer's own layout
// remain usable for rendering/hints; a projection can never be a rules authority.
export function projectVariants(g,own){
 if(!variantsEnabled(g)||!participant(g,own))return undefined;
 const v=g.variants,out={schema:1,projected:true,viewer:own},ended=g.status==='finished',hidden=!!g.hiddenScores&&!ended;
 if(v.battleship){const b=v.battleship;out.battleship={fleets:b.fleets.map((f,p)=>p===own||ended?structuredClone(f):null),ready:[...b.ready],shots:b.shots.map((row,p)=>hidden&&p!==own?row.map(()=>0):[...row]),sunk:b.sunk.map((row,p)=>hidden&&p!==own?row.map(()=>false):[...row]),revealed:b.revealed.map((row,p)=>hidden&&p!==own?[]:structuredClone(row)),lastVolley:b.lastVolley&&(!hidden||b.lastVolley.by===own)?structuredClone(b.lastVolley):null};}
 if(v.discovery)out.discovery=structuredClone(v.discovery);
 if(v.objectives)out.objectives={tasks:v.objectives.tasks.map(t=>({...t,claims:[...t.claims],pending:t.pending.map((r,p)=>p===own?r:null)}))};
 if(v.mixing){out.layouts=v.layouts.map((a,p)=>!hidden||p===own?[...a]:null);out.mixing={...v.mixing,changed:v.mixing.changed.map((a,p)=>!hidden||p===own?[...a]:[])};}
 if(v.hiddenMines){
  const h=v.hiddenMines,blasts=h.blasts.flatMap(b=>{
   if(!hidden)return [{...b,targets:b.targets.map(t=>({pid:t.pid,cells:[...t.cells]}))}];
   if(b.by===own)return [{...b,targets:b.targets.map(t=>({pid:t.pid,removed:t.cells.length}))}];
   const incoming=b.targets.find(t=>t.pid===own&&t.cells.length);
   return incoming?[{...b,targets:[{pid:own,cells:[...incoming.cells]}]}]:[];
  });
  const revealed=new Set(blasts.map(b=>b.id));
  out.hiddenMines={positions:h.positions.map((a,p)=>a.map((i,k)=>p===own||ended||revealed.has('hidden:'+p+':'+k)?i:null)),ready:[...h.ready],triggered:h.triggered.map(a=>[...a]),blasts};
 }
 return out;
}
export function validVariantState(g,{allowProjection=false}={}){
 if(g?.variants===undefined)return true;
 try{
  if(!variantsEnabled(g))return false;
  const v=g.variants,n=g.players.length,projected=v.projected===true,ended=g.status==='finished',person=i=>participant(g,i),round=r=>Number.isSafeInteger(r)&&r>=1&&r<=g.round,nr=r=>r===null||round(r),array=(a,len,check)=>Array.isArray(a)&&a.length===len&&a.every(check);
  if(projected&&(!allowProjection||!person(v.viewer)))return false;
  if(!projected&&(v.projected!==undefined||v.viewer!==undefined))return false;
  if(Object.keys(v).some(k=>!['schema','battleship','discovery','objectives','mixing','layouts','hiddenMines',...(projected?['projected','viewer']:[])].includes(k))||!['battleship','discovery','objectives','mixing','hiddenMines'].some(k=>v[k]))return false;
  if(v.hiddenMines){
   const h=v.hiddenMines,count=hiddenMineCount(n),concealed=projected&&g.hiddenScores&&!ended;
   if(Object.keys(h).some(k=>!['positions','ready','triggered','blasts','rounds'].includes(k))||!array(h.ready,n,x=>typeof x==='boolean')||g.mode==='computer'&&!h.ready[1]||!array(h.triggered,n,a=>array(a,count,x=>typeof x==='boolean'))||!Array.isArray(h.blasts)||h.blasts.length>n*count)return false;
   const revealed=new Set(h.blasts.map(b=>b.id));
   const known=(p,k)=>!projected||ended||p===v.viewer||revealed.has('hidden:'+p+':'+k);
   if(!array(h.positions,n,(a,p)=>array(a,count,(i,k)=>known(p,k)?cell(i):i===null)&&new Set(a.filter(i=>i!==null)).size===a.filter(i=>i!==null).length))return false;
   if(!activeReady(g,h.ready)&&!ended&&(!beforeFirstRoll(g)||h.triggered.some(a=>a.some(Boolean))))return false;
   if(revealed.size!==h.blasts.length||(!concealed&&h.blasts.length!==h.triggered.flat().filter(Boolean).length)||concealed&&h.triggered[v.viewer].some((hit,k)=>hit&&!revealed.has('hidden:'+v.viewer+':'+k)))return false;
   for(const b of h.blasts){
    if(!b||b.kind!=='hidden'||!person(b.by)||!Number.isInteger(b.slot)||b.slot<0||b.slot>=count||!h.triggered[b.by][b.slot]||b.id!=='hidden:'+b.by+':'+b.slot||b.target!==h.positions[b.by][b.slot]||!round(b.round)||!Number.isSafeInteger(b.turn)||b.turn<1||b.turn>g.turn||!Array.isArray(b.targets)||new Set(b.targets.map(t=>t.pid)).size!==b.targets.length||b.targets.length>n-1)return false;
    const countsOnly=concealed&&b.by===v.viewer,incoming=concealed&&!countsOnly;
    if(incoming&&(b.targets.length!==1||b.targets[0].pid!==v.viewer||!b.targets[0].cells?.length)||!incoming&&b.targets.length<g.players.filter((p,i)=>i!==b.by&&!p.left).length)return false;
    for(const t of b.targets){
     if(!person(t.pid)||t.pid===b.by||Object.keys(t).length!==2)return false;
     if(countsOnly){if(!Number.isInteger(t.removed)||t.removed<0||t.removed>6)return false;}
     else if(!Array.isArray(t.cells)||t.cells.length>6||new Set(t.cells).size!==t.cells.length||t.cells.length&&t.cells[0]!==b.target||t.cells.some(i=>!cell(i)||Math.abs(i%15-b.target%15)>1||Math.abs(Math.floor(i/15)-Math.floor(b.target/15))>1))return false;
    }
   }
   if(projected||g.mines){if(h.rounds!==undefined)return false;}
   else if(!h.rounds||Object.keys(h.rounds).some(k=>!['columnRounds','colorRounds'].includes(k))||!array(h.rounds.columnRounds,n,a=>array(a,15,nr))||!array(h.rounds.colorRounds,n,a=>a&&Object.keys(a).length===5&&COLORS.every(c=>nr(a[c]))))return false;
  }
  if(v.battleship){
   const b=v.battleship;if(n!==2||!array(b.fleets,2,(fleet,p)=>projected&&!ended&&p!==v.viewer?fleet===null:validFleet(fleet))||!array(b.ready,2,x=>typeof x==='boolean')||g.mode==='computer'&&!b.ready[1])return false;
   if(!activeReady(g,b.ready)&&!ended&&!beforeFirstRoll(g))return false;
   if(!array(b.shots,2,a=>array(a,105,x=>[0,1,2].includes(x)))||!array(b.sunk,2,a=>array(a,5,x=>typeof x==='boolean'))||!array(b.revealed,2,Array.isArray))return false;
   if(projected&&g.hiddenScores&&!ended&&b.shots[1-v.viewer].includes(1))return false;
   for(let p=0;p<2;p++){
    const enemy=b.fleets[1-p],occupied=enemy&&new Set(enemy.flat()),wrecks=b.revealed[p];
    if(enemy&&(b.shots[p].some((shot,i)=>shot===1&&occupied.has(i)||shot===2&&!occupied.has(i))||enemy.some((ship,i)=>b.sunk[p][i]!==ship.every(j=>b.shots[p][j]===2))))return false;
    if(wrecks.length!==b.sunk[p].filter(Boolean).length||new Set(wrecks.map(a=>a.length)).size!==wrecks.length||wrecks.some(a=>!Array.isArray(a)||!a.length||a.length>5||!b.sunk[p][a.length-1]||new Set(a).size!==a.length||!a.every(i=>cell(i)&&b.shots[p][i]===2)||![line(a[0],a.length,false),line(a[0],a.length,true)].some(row=>row&&row.every((i,k)=>i===a[k]))||enemy&&!enemy.some((ship,i)=>b.sunk[p][i]&&JSON.stringify(ship)===JSON.stringify(a))))return false;
   }
   if(b.lastVolley!==null){const x=b.lastVolley;if(!x||!pid(x.by)||!round(x.round)||typeof x.id!=='string'||!/^\d+:[01]$/.test(x.id)||!Array.isArray(x.results)||x.results.length>6||new Set(x.results.map(r=>r.index)).size!==x.results.length||x.results.some(r=>!cell(r.index)||typeof r.hit!=='boolean'||b.shots[x.by][r.index]!==Number(r.hit)+1||projected&&g.hiddenScores&&!ended&&x.by!==v.viewer&&!r.hit)||!Array.isArray(x.sunk)||x.sunk.length>5||new Set(x.sunk.map(s=>JSON.stringify(s.cells))).size!==x.sunk.length||x.sunk.some(s=>!Array.isArray(s.cells)||s.cells.length<1||s.cells.length>5||s.points!==6-s.cells.length||!b.revealed[x.by].some(a=>JSON.stringify(a)===JSON.stringify(s.cells))))return false;}
  }
  if(v.discovery){const fields=v.discovery.fields;if(!Array.isArray(fields)||fields.length!==6||new Set(fields.map(f=>f.index)).size!==6||ABILITIES.some(a=>fields.filter(f=>f.type===a.id).length!==2)||fields.some(f=>!cell(f.index)||!ABILITIES.some(a=>a.id===f.type)||typeof f.used!=='boolean'||(f.owner===null?f.round!==null||f.used:!person(f.owner)||!round(f.round))))return false;}
  if(v.objectives){const tasks=v.objectives.tasks;if(!Array.isArray(tasks)||tasks.length!==3||tasks.some((t,i)=>t.id!==i||!['columns','stars','color'].includes(t.type)||!Number.isInteger(t.target)||t.target<1||t.target>({columns:15,stars:15,color:21}[t.type])||t.type==='color'&&!COLORS.includes(t.color)||!(t.deadline===null||Number.isSafeInteger(t.deadline)&&t.deadline>0&&t.deadline<=100000)||![t.claims,t.pending].every(a=>array(a,n,nr))||t.claims.some((r,p)=>r!==null&&(t.deadline!==null&&r>t.deadline||t.pending[p]!==null))||t.pending.some((r,p)=>r!==null&&(r!==g.round||t.deadline!==null&&r>t.deadline||projected&&p!==v.viewer))||t.firstRound!==(t.claims.some(r=>r!==null)?Math.min(...t.claims.filter(r=>r!==null)):null)))return false;}
  if(v.mixing){if(v.mixing.interval!==5||!Number.isInteger(v.mixing.lastRound)||v.mixing.lastRound<0||v.mixing.lastRound>g.round||v.mixing.lastRound%5||!array(v.layouts,n,(a,p)=>projected&&g.hiddenScores&&!ended&&p!==v.viewer?a===null:array(a,105,x=>COLORS.includes(x))&&COLORS.every(c=>a.filter(x=>x===c).length===21))||!array(v.mixing.changed,n,a=>Array.isArray(a)&&a.every(cell)&&new Set(a).size===a.length)||projected&&g.hiddenScores&&!ended&&v.mixing.changed.some((a,p)=>p!==v.viewer&&a.length))return false;}else if(v.layouts!==undefined)return false;
  return true;
 }catch{return false;}
}
