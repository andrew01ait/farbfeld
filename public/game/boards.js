// Static, versioned board definitions shared by every client and the host.
// Missing boardId in older saves always means the unchanged Classic sheet.
export const BOARD_FEATURE='boards-v1';
export const RANDOM_BOARD_FEATURE='random-board-v1';
const define=(id,name,description,rows,stars)=>Object.freeze({id,name,description,rows:Object.freeze(rows),cells:Object.freeze(rows.join('').split('')),stars:Object.freeze(stars)});
export const CLASSIC=define('classic','Classic','Das vertraute Original-Spielfeld.',[
 'gggyyyygbbboyyy',
 'ogygyyoopbboogg',
 'bgpggggpppyyogg',
 'bppgoobbggyyopb',
 'poooopbbooopppp',
 'pbbppppyyopbbbo',
 'yybbbbpyyygggoo',
],[7,11,17,19,24,30,36,50,58,76,78,83,85,89,102]);
export const RIVER=define("river","Flusslauf","Versetzte Farbgruppen eröffnen neue Wege.",["ypyyyyppbbggggy", "ypybbbpopoobgyy", "ggooogooppbbypy", "bbbpoggbpbbbggg", "ogbpobbgpyopggg", "oggppybbpyppooo", "oogpyybyyyypooo"],[10, 12, 17, 24, 41, 43, 45, 51, 65, 68, 78, 89, 91, 94, 97]);
export const MOSAIC=define("mosaic","Mosaik","Verzahnte Farbinseln für neue Entscheidungen.",["bbbyppppbppyyyo", "ggbypogbbypppyy", "ggbpooobyypbopo", "ooopbygggyyyogo", "ooppbyyybbooogo", "oybbbboogggbpgg", "pppggyyyggbbpgg"],[1, 5, 13, 24, 25, 30, 38, 44, 49, 52, 62, 72, 81, 93, 101]);
export const BOARDS=Object.freeze([CLASSIC,RIVER,MOSAIC]);
export const RANDOM=Object.freeze({...CLASSIC,id:'random',name:'Random',description:'Ein neues gemeinsames Spielfeld bei jedem Start.'});
export const BOARD_CHOICES=Object.freeze([...BOARDS,RANDOM]);
export const validBoardId=id=>id===undefined||BOARD_CHOICES.some(board=>board.id===id);
const COLORS=['g','y','b','p','o'];
const ADJ=Array.from({length:105},(_,i)=>[...(i%15?[i-1]:[]),...(i%15<14?[i+1]:[]),...(i>=15?[i-15]:[]),...(i<90?[i+15]:[])]);
function groups(cells){
 const seen=new Set(),result=[];
 for(let start=0;start<105;start++)if(!seen.has(start)){const color=cells[start],group=[],todo=[start];seen.add(start);while(todo.length){const i=todo.pop();group.push(i);for(const j of ADJ[i])if(cells[j]===color&&!seen.has(j)){seen.add(j);todo.push(j);}}result.push({color,cells:group});}
 return result;
}
function validGroups(cells){
 if(new Set(cells.filter((_,i)=>i%15===7)).size!==5)return false;
 const bins=Object.fromEntries(COLORS.map(c=>[c,Array(7).fill(0)]));
 for(const group of groups(cells)){if(group.cells.length>6)return false;bins[group.color][group.cells.length]++;}
 return COLORS.every(c=>bins[c].slice(1).every(n=>n===1));
}
function secureIndex(max){const out=new Uint32Array(1),limit=0x100000000-0x100000000%max;do{crypto.getRandomValues(out);}while(out[0]>=limit);return out[0]%max;}
export function generateRandomBoard(rng=secureIndex){
 const draw=max=>{const n=rng(max);if(!Number.isInteger(n)||n<0||n>=max)throw Error('Ungültiger Zufallswert für das Spielbrett.');return n;};
 const shuffle=values=>{const out=[...values];for(let i=out.length-1;i>0;i--){const j=draw(i+1);[out[i],out[j]]=[out[j],out[i]];}return out;};
 const base=BOARDS[draw(BOARDS.length)],palette=shuffle(COLORS),flipX=draw(2),flipY=draw(2);
 const cells=Array.from({length:105},(_,i)=>palette[COLORS.indexOf(base.cells[(flipY?6-Math.floor(i/15):Math.floor(i/15))*15+(flipX?14-i%15:i%15)])]);
 // Bounded group recolouring and local swaps produce fresh layouts while
 // retaining exactly one connected group of each size 1..6 per colour.
 for(let attempt=0;attempt<180;attempt++){
  const size=1+draw(6),candidates=groups(cells).filter(g=>g.cells.length===size),a=draw(5),b=(a+1+draw(4))%5,first=candidates[a],second=candidates[b];
  first.cells.forEach(i=>cells[i]=second.color);second.cells.forEach(i=>cells[i]=first.color);
  if(!validGroups(cells)){first.cells.forEach(i=>cells[i]=first.color);second.cells.forEach(i=>cells[i]=second.color);}
 }
 for(let attempt=0;attempt<240;attempt++){const a=draw(105),b=draw(105);if(cells[a]===cells[b])continue;[cells[a],cells[b]]=[cells[b],cells[a]];if(!validGroups(cells))[cells[a],cells[b]]=[cells[b],cells[a]];}
 // Match three slots per colour to distinct columns, then choose one row.
 const slots=shuffle(COLORS.flatMap(c=>[c,c,c])),edges=slots.map(color=>shuffle(Array.from({length:15},(_,col)=>col).filter(col=>cells.some((c,i)=>i%15===col&&c===color)))),owner=Array(15).fill(-1);
 function assign(slot,seen){for(const col of edges[slot])if(!seen.has(col)){seen.add(col);if(owner[col]<0||assign(owner[col],seen)){owner[col]=slot;return true;}}return false;}
 for(let slot=0;slot<15;slot++)if(!assign(slot,new Set()))throw Error('Das Zufallsbrett konnte nicht aufgebaut werden.');
 const stars=owner.map((slot,col)=>{const options=Array.from({length:7},(_,row)=>row*15+col).filter(i=>cells[i]===slots[slot]);return options[draw(options.length)];});
 return {schema:1,rows:Array.from({length:7},(_,r)=>cells.slice(r*15,r*15+15).join('')),stars};
}
export function validRandomBoard(layout){
 if(layout?.schema!==1||!Array.isArray(layout.rows)||layout.rows.length!==7||!layout.rows.every(row=>typeof row==='string'&&/^[gybpo]{15}$/.test(row))||!Array.isArray(layout.stars)||layout.stars.length!==15||layout.stars.some(i=>!Number.isInteger(i)||i<0||i>=105)||new Set(layout.stars.map(i=>i%15)).size!==15)return false;
 const cells=layout.rows.join('').split('');return COLORS.every(c=>cells.filter(x=>x===c).length===21&&layout.stars.filter(i=>cells[i]===c).length===3)&&validGroups(cells);
}
export const validGameBoard=game=>validBoardId(game?.boardId)&&(game?.boardId!=='random'||validRandomBoard(game.boardLayout));
const dynamicBoards=new WeakMap();
export function boardFor(value){
 const id=typeof value==='string'?value:value?.boardId;
 if(id!=='random'||typeof value==='string')return BOARD_CHOICES.find(board=>board.id===id)||CLASSIC;
 const layout=value.boardLayout,signature=layout&&Array.isArray(layout.rows)&&Array.isArray(layout.stars)?layout.rows.join('/')+'|'+layout.stars.join(','):null,cached=layout&&dynamicBoards.get(layout);
 if(cached&&cached.signature===signature)return cached.board;
 if(!validRandomBoard(layout))throw Error('Das gespeicherte Zufallsbrett fehlt oder ist unvollständig. Bitte alle Apps aktualisieren.');
 const board=define('random','Random',RANDOM.description,[...layout.rows],[...layout.stars]);dynamicBoards.set(layout,{signature,board});return board;
}
export function requireBoardId(id='classic'){
 if(!validBoardId(id))throw Error('Dieses Spielbrett ist nicht verfügbar. Bitte alle Apps aktualisieren.');
 return id;
}
