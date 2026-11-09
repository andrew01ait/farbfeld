import {createGame,rollGame,applyMove,COLORS} from './engine.js';
import {projectGame,HIDDEN_FEATURE} from './game-info.js';
import {BOARD_FEATURE,requireBoardId,validBoardId} from './boards.js';
import {REACTION_FEATURE,REACTION_EXTRA_FEATURE,reactionFeature,REACTION_INTERVAL,reactionFor,reactionEffect,validReactionId,validateReaction} from './reactions.js';
export const DIRECT_PROTOCOL=2;
export const MAX_DIRECT_PLAYERS=6;
export const DIRECT_KEY='farbfeld.direct.v1';
const clone=value=>structuredClone(value);
export function directId(){
  if(crypto.randomUUID)return crypto.randomUUID();
  const bytes=crypto.getRandomValues(new Uint8Array(16));bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
  const hex=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
  return [hex.slice(0,8),hex.slice(8,12),hex.slice(12,16),hex.slice(16,20),hex.slice(20)].join('-');
}
const uid=directId;
const name=value=>String(value||'').trim().slice(0,24);
const seat=i=>Number.isInteger(i)&&i>=1&&i<MAX_DIRECT_PLAYERS;
const secret=value=>typeof value==='string'&&value.length>=32&&value.length<=160;
export function hostRecord(hostName){
  const sessionId=uid();
  return {schema:1,role:'host',secret:uid()+uid(),guestSecrets:{},seen:[],pending:null,snapshot:{sessionId,version:0,members:[{id:sessionId+':0',name:name(hostName)||'Gastgeber'},{id:sessionId+':1',name:''}],game:null}};
}
export function guestRecord(offer,guestName,previous=null){
  const pid=offer.pid??1;
  const resume=previous?.schema===1&&previous.role==='guest'&&(previous.pid??1)===pid&&previous.snapshot?.sessionId===offer.sessionId;
  const members=offer.members?clone(offer.members):[{id:offer.sessionId+':0',name:name(offer.hostName)||'Gastgeber'},{id:offer.sessionId+':1',name:''}];
  if(members[pid])members[pid].name=name(guestName)||previous?.name||'Person '+(pid+1);
  return {schema:1,role:'guest',pid,secret:offer.secret,name:name(guestName)||previous?.name||'Person '+(pid+1),seen:[],pending:resume?previous.pending:null,snapshot:resume?clone(previous.snapshot):{sessionId:offer.sessionId,version:0,members,game:null}};
}
export function validRecord(record){
  return record?.schema===1&&['host','guest'].includes(record.role)&&secret(record.secret)&&Array.isArray(record.seen)&&record.seen.every(a=>a&&typeof a.id==='string'&&Number.isInteger(a.actor)&&a.actor>=0&&a.actor<MAX_DIRECT_PLAYERS)&&validSnapshot(record.snapshot)&&(!record.snapshot.game||(record.role==='host'?!record.snapshot.game.players.some(p=>p.hidden):!record.snapshot.game.players[record.pid??1]?.hidden))&&(record.role!=='guest'||seat(record.pid??1)&&(record.pid??1)<record.snapshot.members.length)&&(record.role!=='host'||!record.guestSecrets||typeof record.guestSecrets==='object'&&Object.entries(record.guestSecrets).every(([i,key])=>seat(Number(i))&&secret(key)))&&(!record.pending||(record.pending.type==='action'&&[1,DIRECT_PROTOCOL].includes(record.pending.protocol)&&record.pending.sessionId===record.snapshot.sessionId&&typeof record.pending.actionId==='string'&&Number.isSafeInteger(record.pending.version)&&record.pending.payload&&typeof record.pending.payload==='object'));
}
export function validSnapshot(s){
  if(!s||typeof s.sessionId!=='string'||s.sessionId.length>80||!Number.isSafeInteger(s.version)||s.version<0||!Array.isArray(s.members)||s.members.length<2||s.members.length>MAX_DIRECT_PLAYERS||!s.members.every((m,i)=>m&&m.id===s.sessionId+':'+i&&typeof m.name==='string'&&m.name.length<=24))return false;
  if(!validBoardId(s.boardId))return false;
  const g=s.game,n=s.members.length;if(!g)return true;
  return validBoardId(g.boardId)&&g.schema===1&&g.mode==='direct'&&Array.isArray(g.players)&&g.players.length===n&&g.players.every((p,i)=>p.id===s.members[i].id&&typeof p.name==='string'&&(p.hidden===true?g.hiddenScores===true&&g.status!=='finished':Array.isArray(p.marks)&&p.marks.length===105&&p.marks.every(x=>typeof x==='boolean')&&Number.isInteger(p.jokers)&&p.jokers>=0&&p.jokers<=8&&Array.isArray(p.columns)&&p.columns.length===15&&p.columns.every(x=>x===null||Number.isInteger(x)&&x>=0&&x<=5)&&Array.isArray(p.lastMove)&&COLORS.every(c=>p.colors?.[c]===null||[3,5].includes(p.colors?.[c]))))&&Number.isInteger(g.active)&&g.active>=0&&g.active<n&&Number.isSafeInteger(g.round)&&g.round>=1&&['roll','choose','finished'].includes(g.phase)&&['playing','finished'].includes(g.status)&&Array.isArray(g.submitted)&&new Set(g.submitted).size===g.submitted.length&&g.submitted.every(i=>Number.isInteger(i)&&i>=0&&i<n)&&Array.isArray(g.columnClaims)&&g.columnClaims.length===15&&COLORS.every(c=>g.colorClaims?.[c]===null||Number.isInteger(g.colorClaims?.[c]))&&Array.isArray(g.log)&&(g.phase!=='choose'||g.dice&&g.dice.colors?.length===3&&g.dice.numbers?.length===3);
}
export class DirectGame {
  constructor(record,{save=()=>{},onChange=()=>{},onError=()=>{},onReaction=()=>{},now=()=>Date.now(),rng}={}){
    if(!validRecord(record))throw Error('Der gespeicherte Direkt-Spielstand ist unvollständig.');
    this.record=clone(record);this.save=save;this.onChange=onChange;this.onError=onError;this.onReaction=onReaction;this.now=now;this.reactionSeen=new Set();this.reactionTimes=new Map();this.rng=rng;
    if(this.record.pending)this.record.pending.protocol=DIRECT_PROTOCOL;
    if(this.record.role==='host')this.record.snapshot.capabilities=[...new Set([...(Array.isArray(this.snapshot.capabilities)?this.snapshot.capabilities:[]),'abort-v1','group-v2',HIDDEN_FEATURE,BOARD_FEATURE,REACTION_FEATURE,REACTION_EXTRA_FEATURE])];
    this.links=new Map();this.remoteOnline=[];this.transportReady=false;this.ready=false;this.send=null;this.sentPending=false;this.storageFailed=false;
  }
  get snapshot(){return this.record.snapshot;}
  get pid(){return this.record.role==='host'?0:this.record.pid??1;}
  get pending(){return this.record.pending;}
  get supportsBoards(){return this.pid===0?[...this.links.values()].every(link=>link.authenticated&&link.features?.includes(BOARD_FEATURE)):!!this.snapshot.capabilities?.includes(BOARD_FEATURE);}
  get online(){return this.pid===0?[0,...[...this.links].filter(([,link])=>link.connected&&link.authenticated).map(([pid])=>pid)]:this.remoteOnline;}
  connected(pid){return this.pid===0?pid===0||!!(this.links.get(pid)?.connected&&this.links.get(pid)?.authenticated):this.transportReady&&this.remoteOnline.includes(pid);}
  refresh(){if(this.pid===0){this.transportReady=[...this.links.values()].some(link=>link.connected);this.ready=!this.storageFailed&&this.snapshot.members.every((member,pid)=>member.name&&this.connected(pid));}}
  envelope(type,payload={},actionId=uid(),version=this.snapshot.version){
    return {protocol:DIRECT_PROTOCOL,sessionId:this.snapshot.sessionId,version,actionId,type,payload};
  }
  persist(record){
    try{if(this.save(clone(record))===false)throw Error('Speichern fehlgeschlagen.');this.record=record;return true;}
    catch{this.storageFailed=true;this.ready=false;this.onError('Der Spielstand kann auf diesem Handy nicht gespeichert werden. Bitte Gerätespeicher freigeben. Die Partie pausiert.');this.broadcast();this.onChange();return false;}
  }
  emit(){this.onChange();}
  transmit(message,actor=1){
    const link=this.pid===0?this.links.get(actor):null,send=this.pid===0?link?.send:this.send;
    if((this.pid===0?!link?.connected:!this.transportReady)||!send)return false;
    try{if(send(JSON.stringify(message))===false)throw Error('Verbindung unterbrochen.');return true;}
    catch{this.pause(this.pid===0?actor:undefined);return false;}
  }
  attach(send,actor=1){
    this.sentPending=false;
    if(this.pid===0){
      if(!seat(actor)||!this.snapshot.members[actor])throw Error('Dieser Platz gehört nicht zur Direktpartie.');
      this.links.set(actor,{send,connected:true,authenticated:false});this.refresh();this.broadcast();
    }else{
      this.send=send;this.transportReady=true;this.ready=false;
      this.transmit(this.envelope('hello',{secret:this.record.secret,name:this.record.name,features:[HIDDEN_FEATURE,BOARD_FEATURE,REACTION_FEATURE,REACTION_EXTRA_FEATURE]}));
    }
    this.emit();
  }
  pause(actor){
    if(this.pid===0){for(const [pid,link] of this.links)if(actor===undefined||pid===actor){link.connected=false;link.authenticated=false;}this.refresh();this.broadcast();}
    else{this.transportReady=false;this.ready=false;this.remoteOnline=[];}
    this.sentPending=false;this.emit();
  }
  state(ack=null,error=null,actor=1){const snapshot={...this.snapshot,game:projectGame(this.snapshot.game,actor)};return this.envelope('state',{snapshot,ack,error,ready:this.ready,online:this.online});}
  broadcast(ack=null,actor=null,error=null){
    if(this.pid!==0)return;
    for(const [pid,link] of this.links)if(link.connected&&link.authenticated)this.transmit(this.state(pid===actor?ack:null,pid===actor?error:null,pid),pid);
  }
  reserveGuest(pid=null){
    if(this.pid!==0)throw Error('Nur der Gastgeber kann einladen.');
    if(pid===null){
      if(this.snapshot.game)throw Error('Die Gruppe steht während einer Partie fest. Bitte erst die Partie beenden.');
      pid=this.snapshot.members.findIndex((m,i)=>i>0&&!m.name);
      if(pid<0)pid=this.snapshot.members.length;
    }
    if(!seat(pid)||pid>this.snapshot.members.length)throw Error('Nach dem offiziellen Regelwerk können höchstens sechs Personen mitspielen.');
    if(this.connected(pid))throw Error('Dieses Handy ist bereits verbunden.');
    const next=clone(this.record);
    if(pid===next.snapshot.members.length){
      if(next.snapshot.game)throw Error('Die Gruppe steht während einer Partie fest.');
      next.snapshot.members.push({id:next.snapshot.sessionId+':'+pid,name:''});next.snapshot.version++;
    }
    next.guestSecrets??={};if(pid!==1&&!next.guestSecrets[pid])next.guestSecrets[pid]=uid()+uid();
    if(!this.persist(next))throw Error('Die Einladung konnte nicht gespeichert werden.');
    this.refresh();this.broadcast();this.emit();return pid;
  }
  cancelReservation(pid){
    if(this.pid!==0||this.snapshot.game||this.snapshot.members[pid]?.name||pid!==this.snapshot.members.length-1||pid===1)return;
    const next=clone(this.record);next.snapshot.members.pop();delete next.guestSecrets?.[pid];next.snapshot.version++;
    if(!this.persist(next))return;this.links.delete(pid);this.refresh();this.broadcast();this.emit();
  }
  receive(raw,actor=1){
    let m;
    try{
      if(typeof raw!=='string'||raw.length>100000)throw Error();
      m=JSON.parse(raw);
      if(m.protocol!==DIRECT_PROTOCOL||m.sessionId!==this.snapshot.sessionId||!Number.isSafeInteger(m.version)||m.version<0||typeof m.actionId!=='string'||m.actionId.length>100||!m.payload)throw Error();
    }catch{this.onError('Unpassende Verbindungsdaten. Bitte alle Apps aktualisieren und neu koppeln.');return;}
    if(!this.transportReady||this.storageFailed)return;
    if(this.pid===0){
      const link=this.links.get(actor);if(!link?.connected)return;
      if(m.type==='hello'){
        const key=actor===1?this.record.secret:this.record.guestSecrets?.[actor];
        if(!key||m.payload.secret!==key){this.onError('Das andere Handy gehört nicht zu diesem Platz in der Partie.');return;}
        if(this.snapshot.game?.boardId&&this.snapshot.game.boardId!=='classic'&&!m.payload.features?.includes(BOARD_FEATURE)){this.onError('Für dieses Spielbrett bitte alle Apps auf Version 1.6.0 oder neuer aktualisieren.');return;}
        const next=clone(this.record);
        if(!next.snapshot.game&&name(m.payload.name)&&next.snapshot.members[actor].name!==name(m.payload.name)){next.snapshot.members[actor].name=name(m.payload.name);next.snapshot.version++;}
        if(!this.persist(next))return;
        link.authenticated=true;link.features=Array.isArray(m.payload.features)?m.payload.features:[];this.refresh();this.emit();this.broadcast();return;
      }
      if(!link.authenticated)return;
      if(m.type==='action')this.apply(m,actor);
      else if(m.type==='reaction')this.relayReaction(m,actor);
      else if(m.type==='sync')this.transmit(this.state(null,null,actor),actor);
      return;
    }
    if(m.type==='reaction'){
      const event=m.payload,from=event.from;
      if(!validReactionId(m.actionId)||event.gameId!==this.snapshot.game?.gameId||!Number.isInteger(from)||!this.snapshot.members[from]||from===this.pid||!reactionFor(event.emoji)||(event.to!=='all'&&event.to!==this.pid))return;
      try{this.showReaction(m.actionId,from,event.emoji,reactionEffect(event));}catch{}return;
    }
    if(m.type==='reaction-error'){if(typeof m.payload.error==='string')this.onError(m.payload.error.slice(0,200));return;}
    if(m.type!=='state'||!validSnapshot(m.payload.snapshot)||m.payload.snapshot.sessionId!==this.snapshot.sessionId||m.payload.snapshot.version!==m.version||!m.payload.snapshot.members[this.pid]||m.payload.snapshot.game?.players[this.pid]?.hidden)return;
    if(m.version<this.snapshot.version){
      this.ready=false;this.onError('Der Gastgeber hat einen älteren Spielstand. Diese gespeicherte Partie wird nicht überschrieben. Bitte auf dem ursprünglichen Gastgeber-Handy fortsetzen.');this.emit();return;
    }
    const next=clone(this.record);next.snapshot=clone(m.payload.snapshot);
    const acknowledged=next.pending?.actionId===m.payload.ack;
    if(acknowledged)next.pending=null;
    if(!this.persist(next))return;
    this.remoteOnline=Array.isArray(m.payload.online)?m.payload.online.filter(pid=>Number.isInteger(pid)&&pid>=0&&pid<this.snapshot.members.length):[0,this.pid];
    this.ready=m.payload.ready!==false;if(acknowledged)this.sentPending=false;
    if(m.payload.error)this.onError(m.payload.error);
    this.emit();
    if(this.pending&&!this.sentPending){this.sentPending=true;this.transmit(this.pending);}
  }
  showReaction(id,from,emoji,effect={scale:1,motion:'fly'}){
    const key=from+':'+id;if(this.reactionSeen.has(key))return;
    this.reactionSeen.add(key);if(this.reactionSeen.size>512)this.reactionSeen.delete(this.reactionSeen.values().next().value);
    this.onReaction({id:key,emoji,...effect,name:this.snapshot.members[from].name});
  }
  sendReaction(emoji,to='all',effect={}){
    if(!this.ready||!this.snapshot.game)throw Error('Reaktionen sind während einer verbundenen Partie möglich.');
    if(!this.snapshot.capabilities?.includes(reactionFeature(emoji)))throw Error('Für diese Reaktion bitte auch die Gastgeber-App aktualisieren'+(reactionFeature(emoji)===REACTION_EXTRA_FEATURE?' (mindestens Version 1.12.0).':'.'));
    const value=validateReaction({emoji,to,...effect},this.snapshot.members,this.pid),message=this.envelope('reaction',{...value,gameId:this.snapshot.game.gameId});
    if(this.pid===0)this.relayReaction(message,0,true);
    else if(!this.transmit(message))throw Error('Die Reaktion konnte nicht gesendet werden.');
  }
  relayReaction(message,actor,local=false){
    try{
      if(!this.ready||!this.snapshot.game||message.payload.gameId!==this.snapshot.game.gameId||!validReactionId(message.actionId))throw Error('Diese Reaktion gehört nicht zur aktuellen Partie.');
      const {emoji,to,...effect}=validateReaction(message.payload,this.snapshot.members,actor),key=actor+':'+message.actionId;
      if(this.reactionSeen.has(key))return;
      if(this.now()-(this.reactionTimes.get(actor)??-Infinity)<REACTION_INTERVAL)throw Error('Einen kurzen Moment bis zur nächsten Reaktion warten.');
      const recipients=this.snapshot.members.map((_,i)=>i).filter(i=>i!==actor&&(to==='all'||to===i));
      if(recipients.some(i=>i!==0&&!this.links.get(i)?.features?.includes(reactionFeature(emoji))))throw Error('Für diese Reaktion bitte die Empfänger-Apps aktualisieren'+(reactionFeature(emoji)===REACTION_EXTRA_FEATURE?' (mindestens Version 1.12.0).':'.'));
      this.reactionTimes.set(actor,this.now());
      if(recipients.includes(0))this.showReaction(message.actionId,actor,emoji,effect);
      else{this.reactionSeen.add(key);if(this.reactionSeen.size>512)this.reactionSeen.delete(this.reactionSeen.values().next().value);}
      const event=this.envelope('reaction',{from:actor,to,emoji,...effect,gameId:this.snapshot.game.gameId},message.actionId);
      for(const pid of recipients)if(pid!==0)this.transmit(event,pid);
    }catch(error){if(local)throw error;this.transmit(this.envelope('reaction-error',{error:error.message}),actor);}
  }
  act(action,payload={}){
    if(!this.ready||this.storageFailed)throw Error('Die Direktverbindung ist unterbrochen oder ein Handy fehlt. Die Partie pausiert bis alle wieder verbunden sind.');
    if(this.pending)throw Error('Dein Zug wird noch vom Gastgeber bestätigt.');
    if(action==='abort'&&!this.snapshot.capabilities?.includes('abort-v1'))throw Error('Für den gemeinsamen Abbruch bitte auch die Gastgeber-App aktualisieren.');
    const message=this.envelope('action',{...payload,action,gameId:this.snapshot.game?.gameId??null,round:this.snapshot.game?.round??null});
    if(this.pid===0){this.apply(message,0,true);return message.actionId;}
    const next=clone(this.record);next.pending=message;
    if(!this.persist(next))throw Error('Der Zug konnte nicht gespeichert werden.');
    this.sentPending=true;this.transmit(message);this.emit();return message.actionId;
  }
  apply(message,actor,local=false){
    const duplicate=this.record.seen.some(x=>x.id===message.actionId&&x.actor===actor);
    if(duplicate){this.transmit(this.state(message.actionId,null,actor),actor);return;}
    try{
      if(!this.ready||this.storageFailed)throw Error('Die Partie pausiert bis zur Wiederverbindung aller Handys.');
      const {action,move,gameId,round}=message.payload;
      // Independent players may confirm the same roll concurrently. Rules still
      // validate their own sheet, dice and submitted flag against the latest state.
      const sameRoll=action==='move'&&this.snapshot.game&&gameId===this.snapshot.game.gameId&&round===this.snapshot.game.round&&message.version<=this.snapshot.version;
      if(message.version!==this.snapshot.version&&!sameRoll)throw Error('Der Spielstand wurde inzwischen aktualisiert. Bitte wähle deinen Zug erneut.');
      const next=clone(this.record),s=next.snapshot;
      if(action==='start'){
        if(actor!==0)throw Error('Nur der Gastgeber kann die Partie starten.');
        if(s.game)throw Error('Die Partie läuft bereits.');
        if(s.members.some(m=>!m.name))throw Error('Es fehlen noch Mitspielende.');
        if(s.boardId&&s.boardId!=='classic'&&!this.supportsBoards)throw Error('Für dieses Spielbrett müssen alle Handys Version 1.6.0 oder neuer öffnen.');
        s.game=createGame(s.members.map(m=>m.name),'direct',s.members.map(m=>m.id),{hiddenScores:!!s.hiddenScores,boardId:requireBoardId(s.boardId)});s.game.gameId=uid();delete s.lastAbort;
      }else if(action==='options'){
        if(actor!==0)throw Error('Nur der Gastgeber kann die Spielart wählen.');
        if(s.game)throw Error('Die Spielart steht während der Partie fest.');
        if(message.payload.hiddenScores===true&&[...this.links.values()].some(link=>!link.features?.includes(HIDDEN_FEATURE)))throw Error('Für verdeckte Punkte müssen alle Handys Version 1.5.0 oder neuer öffnen.');
        if('hiddenScores'in message.payload)s.hiddenScores=message.payload.hiddenScores===true;
        if('boardId'in message.payload){const boardId=requireBoardId(message.payload.boardId);if(boardId!=='classic'&&!this.supportsBoards)throw Error('Für dieses Spielbrett müssen alle Handys Version 1.6.0 oder neuer öffnen.');s.boardId=boardId;}
      }else if(action==='abort'){
        if(s.game?.status!=='playing')throw Error('Es läuft keine Partie mehr.');
        s.lastAbort={by:s.members[actor].name,gameId:s.game.gameId,round:s.game.round};s.game=null;
      }else if(action==='roll'){
        if(!s.game||s.game.active!==actor)throw Error('Die aktive Person würfelt.');
        s.game=rollGame(s.game,this.rng);
      }else if(action==='move'){
        if(!s.game)throw Error('Die Partie wurde noch nicht gestartet.');
        if(!move||typeof move!=='object')throw Error('Der Zug ist unvollständig.');
        s.game=applyMove(s.game,actor,move);
      }else if(action==='rematch'){
        if(actor!==0||s.game?.status!=='finished')throw Error('Nach Spielende kann der Gastgeber eine neue Partie starten.');
        s.game=null;
      }else throw Error('Unbekannte Spielaktion.');
      s.version++;next.seen.push({id:message.actionId,actor,version:s.version});next.seen=next.seen.slice(-2048);
      if(!this.persist(next))return;
      this.refresh();this.emit();this.broadcast(message.actionId,actor);
    }catch(error){
      if(local)throw error;
      this.transmit(this.state(message.actionId,error.message,actor),actor);
    }
  }
}
