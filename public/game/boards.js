// Static, versioned board definitions shared by every client and the host.
// Missing boardId in older saves always means the unchanged Classic sheet.
export const BOARD_FEATURE='boards-v1';
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
export const validBoardId=id=>id===undefined||BOARDS.some(board=>board.id===id);
export const boardFor=value=>BOARDS.find(board=>board.id===(typeof value==='string'?value:value?.boardId))||CLASSIC;
export function requireBoardId(id='classic'){
 if(!validBoardId(id))throw Error('Dieses Spielbrett ist nicht verfügbar. Bitte alle Apps aktualisieren.');
 return id;
}
