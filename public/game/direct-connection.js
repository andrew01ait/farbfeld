import {rtcFacts,localCandidateFacts} from './direct-diagnostics.js';
import {DIRECT_PROTOCOL,directId,validSnapshot} from './direct-game.js';
export const LAN_RTC_CONFIG=Object.freeze({iceServers:[],iceTransportPolicy:'all',bundlePolicy:'max-bundle'});
export function validateHandshake(value,kind){
  if(!value||value.protocol!==DIRECT_PROTOCOL||value.kind!==kind||typeof value.sessionId!=='string'||value.sessionId.length>80||typeof value.connectionId!=='string'||value.connectionId.length>80||value.description?.type!==kind||typeof value.description?.sdp!=='string'||value.description.sdp.length>60000)throw Error('Dieser QR-Code gehört nicht zu einer passenden Farbfeld-Kopplung. Bitte alle Apps aktualisieren.');
  if(kind==='offer'&&(!Number.isInteger(value.pid)||value.pid<1||value.pid>5||!validSnapshot({sessionId:value.sessionId,version:0,roomName:value.roomName,roomNameRevision:value.roomNameRevision,members:value.members,game:null})||!value.members[value.pid]))throw Error('Der Spielerplatz oder Name in diesem Angebot ist ungültig. Bitte alle Apps aktualisieren.');
  if(kind==='offer'&&(typeof value.secret!=='string'||value.secret.length<32||value.secret.length>160))throw Error('Der Zugang zur Direktpartie fehlt.');
  return value;
}
export function waitForIce(pc,timeout=20000,signal=null){
  return new Promise((resolve,reject)=>{
    let finished=false;
    // A missing Android interface can hold gathering open despite usable LAN
    // candidates. Prefer completion; at the deadline freeze available local UDP
    // data in one handshake, without another QR or Internet signaling exchange.
    const timer=setTimeout(()=>finish(localCandidateFacts(pc.localDescription?.sdp).udpCandidates>0?null:Error('Keine nutzbaren lokalen Verbindungsdaten erhalten. Bitte WLAN/Hotspot und lokale Netzwerkfreigabe prüfen und erneut versuchen.')),timeout);
    function finish(error){if(finished)return;finished=true;clearTimeout(timer);pc.removeEventListener('icegatheringstatechange',changed);signal?.removeEventListener('abort',cancelled);if(signal?.aborted)error=Error('Die Kopplung wurde abgebrochen.');if(error)reject(error);else {const description=pc.localDescription;resolve({type:description.type,sdp:description.sdp});}}
    function cancelled(){finish(Error('Die Kopplung wurde abgebrochen.'));}
    function changed(){if(pc.iceGatheringState==='complete')finish(pc.localDescription?.sdp.includes('a=candidate:')?null:Error('Der Browser stellt keine lokale Netzwerkadresse bereit. Bitte WLAN/Hotspot und Netzwerkberechtigung prüfen.'));}
    pc.addEventListener('icegatheringstatechange',changed);signal?.addEventListener('abort',cancelled,{once:true});if(signal?.aborted)cancelled();else changed();
  });
}
export class DirectConnection{
  constructor({onState=()=>{},onMessage=()=>{},onReady=()=>{},onDiagnostic=()=>{},Peer=globalThis.RTCPeerConnection}={}){
    if(!Peer)throw Error('Dieser Browser unterstützt keine Direktverbindung. Bitte aktuelles Chrome auf Android verwenden.');
    this.onDiagnostic=onDiagnostic;this.lastDiagnostic='';this.onState=onState;this.onMessage=onMessage;this.onReady=onReady;this.Peer=Peer;this.pc=null;this.channel=null;this.opened=false;this.timer=null;this.closed=false;
  }
  trace(extra={}){try{const facts={...rtcFacts(this),...extra},key=JSON.stringify(facts);if(key!==this.lastDiagnostic){this.lastDiagnostic=key;this.onDiagnostic('rtc',facts);}}catch{}}
  setup(){
    this.close(false);this.closed=false;this.opened=false;this.answerAccepted=false;this.operation=new AbortController();
    const pc=this.pc=new this.Peer({...LAN_RTC_CONFIG,iceServers:[]});
    const changed=()=>this.update();
    pc.addEventListener('icegatheringstatechange',()=>this.trace());
    pc.addEventListener('icecandidateerror',event=>this.trace({errorCode:event.errorCode}));
    pc.addEventListener('connectionstatechange',changed);pc.addEventListener('iceconnectionstatechange',changed);
    pc.addEventListener('datachannel',e=>this.bind(e.channel));
    this.onState('preparing');this.trace();return pc;
  }
  bind(channel){
    if(channel.label!=='farbfeld'){channel.close();return;}
    this.channel=channel;
    channel.addEventListener('open',()=>this.update());
    channel.addEventListener('close',()=>this.update());
    channel.addEventListener('error',()=>{this.trace({error:'network'});this.update();});
    channel.addEventListener('message',event=>{if(!this.closed)this.onMessage(event.data);});
  }
  update(){
    if(this.closed)return;
    this.trace();
    const state=this.pc?.connectionState,ice=this.pc?.iceConnectionState;
    const good=this.channel?.readyState==='open'&&state==='connected'&&['connected','completed'].includes(ice);
    if(good){
      clearTimeout(this.timer);this.timer=null;
      if(!this.opened){this.opened=true;this.onState('connected');this.onReady(data=>this.send(data));}
      return;
    }
    if(this.opened){this.opened=false;this.onState('disconnected');}
    if(state==='failed'||ice==='failed'||this.channel?.readyState==='closed'){clearTimeout(this.timer);this.onState('failed');}
    else if(state==='connecting'||ice==='checking'){this.onState('connecting');if(this.answerAccepted)this.connectTimeout();}
    else if(state==='disconnected'||ice==='disconnected')this.onState('disconnected');
  }
  connectTimeout(){
    if(this.timer||this.opened||!this.answerAccepted)return;
    this.timer=setTimeout(()=>{this.timer=null;if(!this.opened){this.trace({error:'connection-timeout'});this.onState('failed');}},30000);
  }
  async offer(record,appVersion,pid=1){
    const pc=this.setup();this.connectionId=directId();this.sessionId=record.snapshot.sessionId;
    this.bind(pc.createDataChannel('farbfeld',{ordered:true}));
    await pc.setLocalDescription(await pc.createOffer());
    const description=await waitForIce(pc,20000,this.operation.signal);if(pc.iceGatheringState!=='complete')this.trace({stage:'candidate-fallback'});this.trace({stage:'offer-ready'});
    return {protocol:DIRECT_PROTOCOL,kind:'offer',appVersion,sessionId:this.sessionId,connectionId:this.connectionId,pid,secret:pid===1?record.secret:record.guestSecrets[pid],members:record.snapshot.members,hostName:record.snapshot.members[0].name,roomName:record.snapshot.roomName,roomNameRevision:record.snapshot.roomNameRevision,description};
  }
  async answer(offer,appVersion){
    validateHandshake(offer,'offer');const pc=this.setup();this.connectionId=offer.connectionId;this.sessionId=offer.sessionId;
    await pc.setRemoteDescription(offer.description);await pc.setLocalDescription(await pc.createAnswer());
    const description=await waitForIce(pc,20000,this.operation.signal);if(this.closed)throw Error('Die Kopplung wurde abgebrochen.');if(pc.iceGatheringState!=='complete')this.trace({stage:'candidate-fallback'});this.trace({stage:'answer-ready'});this.onState('connecting');
    return {protocol:DIRECT_PROTOCOL,kind:'answer',appVersion,sessionId:this.sessionId,connectionId:this.connectionId,description};
  }
  async accept(answer){
    validateHandshake(answer,'answer');
    if(answer.sessionId!==this.sessionId||answer.connectionId!==this.connectionId)throw Error('Diese Antwort gehört zu einem älteren Angebot. Bitte den aktuellen Antwort-QR scannen.');
    if(!this.pc||this.pc.signalingState!=='have-local-offer')throw Error('Bitte zuerst ein neues Angebot auf diesem Gastgeber-Handy erzeugen.');
    await this.pc.setRemoteDescription(answer.description);if(this.closed)throw Error('Die Kopplung wurde abgebrochen.');this.answerAccepted=true;this.trace({stage:'answer-accepted'});this.onState('connecting');this.connectTimeout();
  }
  send(data){
    if(!this.opened||this.channel?.readyState!=='open'||this.channel.bufferedAmount>1000000)throw Error('Die Direktverbindung ist unterbrochen.');
    this.channel.send(data);return true;
  }
  close(notify=true){this.closed=true;this.opened=false;this.operation?.abort();clearTimeout(this.timer);this.timer=null;this.channel?.close();this.pc?.close();this.trace();this.channel=null;this.pc=null;if(notify)this.onState('closed');}
}
