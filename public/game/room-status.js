import {canAct} from './engine.js';
export const PRESENCE_TTL=90000;
export const PRESENCE_WRITE_INTERVAL=30000;
export const SKIP_DELAY=24*60*60*1000;
export const connectionLabels={online:'Online',offline:'Offline',unknown:'Verbindung wird geprüft'};
export function roomSkipStatus(room,now=Date.now()){
 const activity=room?.lastActionAt;
 const availableAt=room?.game?.status==='playing'&&Number.isSafeInteger(activity)&&activity>0?activity+SKIP_DELAY:null;
 return {skipAvailableAt:availableAt,canSkip:availableAt!==null&&now>=availableAt&&room.game.phase==='choose'};
}
export function homeRoomStatus(game,playerId){
 if(!game)return {kind:'lobby',text:'Lobby · Partie noch nicht gestartet',button:'Öffnen'};
 const pid=game.players.findIndex(player=>player.id===playerId);
 if(pid<0)return {kind:'unknown',text:'Spielerzugang prüfen',button:'Öffnen'};
 if(game.status==='finished')return {kind:'finished',text:'Partie beendet · Ergebnis ansehen',button:'Ergebnis'};
 if(game.phase==='roll'&&game.active===pid)return {kind:'turn',text:'Du bist dran · würfeln',button:'Weiterspielen'};
 if(game.phase==='choose'&&canAct(game,pid))return {kind:'turn',text:'Du bist dran · Felder wählen',button:'Weiterspielen'};
 if(game.submitted.includes(pid))return {kind:'waiting',text:'Dein Zug ist bestätigt · bitte warten',button:'Öffnen'};
 return {kind:'waiting',text:'Warten auf '+game.players[game.active].name,button:'Öffnen'};
}
export class RoomConnectionState{
 constructor(now=()=>performance.now()){this.now=now;this.clear();}
 clear(){this.code='';this.sampledAt=-Infinity;this.ackAt=-Infinity;this.failed=false;this.players=null;}
 acknowledge(code){if(this.code!==code){this.clear();this.code=code;}this.ackAt=this.now();this.failed=false;}
 receive(code,players){this.acknowledge(code);this.players=players&&typeof players==='object'?players:null;this.sampledAt=this.now();}
 fail(code){if(this.code===code)this.failed=true;}
 fresh(code){return this.code===code&&!this.failed&&this.now()-this.ackAt<PRESENCE_TTL;}
 status(code,id,ownId){
  if(this.code!==code)return 'unknown';
  if(id===ownId)return this.failed?'offline':this.fresh(code)?'online':'unknown';
  if(this.failed||this.now()-this.sampledAt>=PRESENCE_TTL)return 'unknown';
  const state=this.players?.[id];return ['online','offline'].includes(state)?state:'unknown';
 }
}
export function directPlayerStatus(manager,pid){return manager?.connected(pid)?'online':'offline';}
export function roomPollDelay({visible=true,online=true,screen='home',game=null,playerId=null,failures=0,idleFor=0,busy=false}={}){
 if(!visible||!online||busy||!['home','room'].includes(screen))return null;
 if(screen==='home'&&game?.status!=='playing')return null;
 if(failures)return Math.max(screen==='home'?60000:30000,Math.min(120000,30000*2**Math.min(failures-1,2)));
 if(screen==='home')return 60000;
 if(!game)return 15000;
 if(game.status==='finished')return 30000;
 if(homeRoomStatus(game,playerId).kind==='turn')return 30000;
 return idleFor>=600000?60000:idleFor>=120000?30000:idleFor>=30000?15000:6000;
}
export class RoomPollScheduler{
 constructor({run,delay,now=()=>performance.now(),setTimer=(fn,delay)=>globalThis.setTimeout(fn,delay),clearTimer=timer=>globalThis.clearTimeout(timer)}){this.run=run;this.delay=delay;this.now=now;this.setTimer=setTimer;this.clearTimer=clearTimer;this.timer=null;this.due=Infinity;}
 stop(){if(this.timer!==null)this.clearTimer(this.timer);this.timer=null;this.due=Infinity;}
 refresh(immediate=false){
  const delay=this.delay();if(delay===null){this.stop();return;}
  const due=this.now()+(immediate?0:delay);if(this.timer!==null&&this.due<=due)return;
  this.stop();this.due=due;this.timer=this.setTimer(async()=>{this.timer=null;this.due=Infinity;if(this.delay()===null)return;try{await this.run();}finally{this.refresh();}},Math.max(0,due-this.now()));
 }
}
