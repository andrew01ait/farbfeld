export const NOTICE_COOLDOWN=60000;
export const NOTICE_TTL=60000;
// Let the push service wait for an unreachable phone; the worker revalidates the turn.
export const PUSH_TTL=24*60*60*1000;
export const NOTICE_TAG='farbfeld-game';
export const REMATCH_PUSH_CAPABILITY='rematch-push-v1';

// Only a host-confirmed Internet rematch, never merely returning to the lobby.
export function rematchNoticeForGame(game,pid){
 if(game?.mode!=='room'||!game.gameId||game.status!=='playing'||game.round!==1||!Number.isInteger(pid)||!game.players?.[pid]||game.players[pid].left||game.submitted?.includes(pid)||typeof game.rematchOf!=='string'||!game.rematchOf||game.rematchOf===game.gameId||!game.players.some(player=>player.id===game.rematchBy)||game.players[pid].id===game.rematchBy)return null;
 return {event:game.gameId+':rematch',kind:'rematch',title:'Farbfeld · Revanche gestartet',body:'Eure neue Partie ist gestartet. Spielraum öffnen.',gameId:game.gameId,round:1};
}

// A queued rematch remains useful until this player acts in the first round,
// even if the starter has already rolled and it has become their turn.
export function noticeForGameEvent(game,pid,event){
 const current=noticeForGame(game,pid);if(!event||current?.event===event)return current;
 const rematch=rematchNoticeForGame(game,pid);return rematch?.event===event?rematch:null;
}

// A roll and the active player's following choice are one opportunity.
// Never include scores, sheets, names, credentials or emojis in lock-screen text.
export function noticeForGame(game,pid){
 if(!game?.gameId||!Number.isInteger(pid)||!game.players?.[pid]||game.players[pid].left||!['room','direct'].includes(game.mode))return null;
 if(game.status==='finished')return {event:game.gameId+':finished',kind:'finished',title:'Farbfeld · Partie beendet',body:'Eure Partie ist beendet. Ergebnis ansehen.',gameId:game.gameId,round:game.round};
 if(game.status!=='playing')return null;
 const ready=game.phase==='roll'?game.active===pid:game.phase==='choose'&&!game.submitted.includes(pid)&&(game.active===pid||game.submitted.includes(game.active));
 if(!ready)return rematchNoticeForGame(game,pid);
 return {event:game.gameId+':'+game.round+':turn',kind:'turn',title:'Farbfeld · Du bist dran',body:'Wurf '+game.round+': '+(game.phase==='roll'?'Du würfelst als Nächstes.':'Wähle eine Farbe und eine Zahl.'),gameId:game.gameId,round:game.round};
}
