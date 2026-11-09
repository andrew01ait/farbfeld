import {DirectGame,hostRecord,guestRecord,validRecord,DIRECT_PROTOCOL,directId} from './direct-game.js';
import {DirectConnection,validateHandshake} from './direct-connection.js';
import {encodeQr} from './qr.js';
export class DirectSession{
  constructor({saved=null,save=()=>{},version,onChange=()=>{},onError=()=>{},onReaction=()=>{},fetcher=(...args)=>fetch(...args),Connection=DirectConnection}={}){
    this.save=save;this.version=version;this.onChange=onChange;this.onError=onError;this.onReaction=onReaction;this.fetcher=fetcher;this.Connection=Connection;
    this.manager=null;this.rtc=null;this.status='idle';this.pairing=null;this.pairingError='';this.signal=null;this.signalTimer=null;this.signalBusy=false;this.signalRequests=new Set();this.generation=0;this.peers=new Map();this.pairPid=1;this.pairingComplete=false;this.pairingInProgress=false;
    if(validRecord(saved))this.useRecord(saved);
    this.heartbeat=setInterval(()=>this.tick(),4000);
  }
  get saved(){return this.manager?.record||null;}
  get snapshot(){return this.manager?.snapshot||null;}
  get ready(){return !!this.manager?.ready;}
  get pid(){return this.manager?.pid??0;}
  get pending(){return this.manager?.pending||null;}
  emit(){this.onChange(this);}
  useRecord(record){
    this.manager=new DirectGame(record,{save:this.save,onChange:()=>{
      if(this.manager?.storageFailed)for(const peer of this.peers.values())if(peer.connection.opened)peer.connection.close();
      const paired=this.pid===0?this.manager?.connected(this.pairPid):this.manager?.transportReady&&this.online.includes(this.pid);
      if(this.pairingInProgress&&paired){this.pairingInProgress=false;this.pairingComplete=true;this.pairing=null;this.stopSignal(true);}
      this.refreshStatus();this.emit();
    },onError:this.onError,onReaction:this.onReaction});
    this.save(this.manager.record);
  }
  get online(){return this.manager?.online||[];}
  get lastMessage(){return this.peers.get(this.pairPid)?.lastMessage??0;}
  set lastMessage(value){const peer=this.peers.get(this.pairPid);if(peer)peer.lastMessage=value;}
  refreshStatus(){
    if(this.manager?.ready){this.status='connected';return;}
    const peer=this.peers.get(this.pairPid);
    if(peer)this.status=peer.status;
    else if(this.peers.size)this.status=this.online.length>1?'connected':'disconnected';
  }
  setup(pid=1){
    this.peers.get(pid)?.connection.close(false);this.manager?.pause(this.pid===0?pid:undefined);
    this.pairPid=pid;this.pairingComplete=false;this.pairingInProgress=true;this.status='preparing';this.pairing=null;this.pairingError='';
    const generation=this.generation,entry={status:'preparing',lastMessage:Date.now(),connection:null};
    const current=()=>generation===this.generation&&this.peers.get(pid)===entry;
    const connection=new this.Connection({
      onState:state=>{
        if(!current())return;
        entry.status=state;
        if(state!=='connected')this.manager?.pause(this.pid===0?pid:undefined);
        this.refreshStatus();this.emit();
      },
      onReady:send=>{if(!current()||!this.manager)return;entry.lastMessage=Date.now();entry.status='connected';this.status='connected';this.manager.attach(send,pid);},
      onMessage:raw=>{
        if(!current()||!this.manager)return;
        if(typeof raw!=='string'||raw.length>100000)return;
        let message;try{message=JSON.parse(raw);}catch{return;}
        if(message.protocol!==DIRECT_PROTOCOL||message.sessionId!==this.snapshot?.sessionId||typeof message.actionId!=='string'||!Number.isSafeInteger(message.version))return;
        entry.lastMessage=Date.now();
        if(message.type==='ping'){try{connection.send(JSON.stringify(this.manager.envelope('pong')));}catch{}this.recover(pid);return;}
        if(message.type==='pong'){this.recover(pid);return;}
        if(message.type==='resync'){if(this.pid!==0)this.manager.attach(data=>connection.send(data));return;}
        this.manager.receive(raw,pid);
      }
    });
    entry.connection=connection;this.peers.set(pid,entry);this.rtc=connection;return entry;
  }
  recover(pid=this.pairPid){
    const peer=this.peers.get(pid);
    if(peer?.status==='stalled'&&peer.connection.opened){
      peer.status='connected';this.status='connected';this.manager.attach(data=>peer.connection.send(data),pid);
      if(this.pid===0)peer.connection.send(JSON.stringify(this.manager.envelope('resync')));
      this.emit();
    }
  }
  tick(){
    for(const [pid,peer] of this.peers){
      if(!peer.connection.opened)continue;
      if(Date.now()-peer.lastMessage>16000&&peer.status==='connected'){peer.status='stalled';this.manager.pause(this.pid===0?pid:undefined);this.refreshStatus();this.emit();}
      try{peer.connection.send(JSON.stringify(this.manager.envelope('ping')));}catch{}
    }
  }
  async host(name,resume=false){
    if(!resume||!this.manager||this.manager.pid!==0){this.restart();this.useRecord(hostRecord(name));}
    // Reconnecting one member must keep every other established channel alive.
    const missing=this.snapshot.members.findIndex((m,i)=>i>0&&!this.manager.connected(i));
    return this.invite(missing<0?null:missing);
  }
  async invite(pid=null){
    if(!this.manager||this.pid!==0)throw Error('Bitte zuerst als Gastgeber ein Spiel erstellen.');
    this.cancelPairing();
    const target=this.manager.reserveGuest(pid),entry=this.setup(target),generation=this.generation;
    const current=()=>generation===this.generation&&this.peers.get(target)===entry&&this.pairPid===target;
    try{
      const data=await entry.connection.offer(this.manager.record,this.version,target);
      if(!current())return;
      let qr=[],qrError='';try{qr=await encodeQr(data);}catch(error){qrError=error.message;}if(!current())return;
      entry.status='offering';this.status='offering';this.pairing={kind:'offer',pid:target,data,qr,qrError,code:null,error:''};this.emit();
    }catch(error){if(!current())return;entry.status='failed';this.status='failed';this.pairingError=error.message;this.onError(error.message);this.emit();throw error;}
  }
  cancelPairing(){
    const pid=this.pairPid,entry=this.peers.get(pid);
    this.stopSignal(true);this.pairing=null;this.pairingComplete=false;this.pairingInProgress=false;
    if(this.pid===0&&entry&&!this.manager.connected(pid)){
      this.peers.delete(pid);entry.connection.close(false);this.manager.pause(pid);this.manager.cancelReservation(pid);
      if(this.rtc===entry.connection)this.rtc=null;
    }
    this.refreshStatus();
  }
  async join(offer,name,viaCode=false,expectedGeneration=null){
    validateHandshake(offer,'offer');
    if(expectedGeneration!==null&&expectedGeneration!==this.generation)return;
    const previous=this.manager?.record;
    if(previous?.snapshot.sessionId===offer.sessionId&&(previous.role!=='guest'||(previous.pid??1)!==offer.pid))throw Error('Dieses Angebot ist für einen anderen Spielerplatz. Bitte den Gastgeber bitten, deinen bisherigen Namen erneut zu koppeln.');
    if(expectedGeneration===null)this.restart();
    this.useRecord(guestRecord(offer,name,previous));const entry=this.setup(0),generation=this.generation;
    const current=()=>generation===this.generation&&this.peers.get(0)===entry;
    try{
      const data=await entry.connection.answer(offer,this.version);
      if(!current())return;
      let qr=[],qrError='';try{qr=await encodeQr(data);}catch(error){qrError=error.message;}if(!current()||this.ready)return;
      this.pairing={kind:'answer',pid:this.pid,data,qr,qrError,code:null,error:'',viaCode};this.emit();return data;
    }catch(error){if(!current())return;entry.status='failed';this.status='failed';this.pairingError=error.message;this.onError(error.message);this.emit();throw error;}
  }
  async accept(answer){const generation=this.generation,rtc=this.rtc;if(!rtc)throw Error('Die Kopplung wurde abgebrochen.');try{await rtc.accept(answer);if(generation===this.generation&&rtc===this.rtc)this.emit();}catch(error){if(generation===this.generation&&rtc===this.rtc)throw error;}}
  act(action,payload={}){if(!this.ready)throw Error('Die Partie pausiert bis alle Handys direkt verbunden sind.');return this.manager.act(action,payload);}
  async signalApi(action,body={},hostToken=null){
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
    this.signalRequests.add(controller);
    try{
      const response=await this.fetcher('/api/direct-pairing',{method:'POST',credentials:'include',cache:'no-store',signal:controller.signal,headers:{'Content-Type':'application/json',...(hostToken?{'X-Pairing-Token':hostToken}:{})},body:JSON.stringify({action,...body})});
      let data;try{data=await response.json();}catch{throw Error('Die Code-Kopplung benötigt Internet und Zugriff auf diese Website. Offline bitte QR verwenden.');}
      if(!response.ok)throw Error(data.error||'Die Code-Kopplung ist nicht erreichbar.');
      return data;
    }catch(error){if(error.name==='AbortError')throw Error('Die Code-Kopplung ist nicht erreichbar. Bitte Internet prüfen oder QR verwenden.');throw error;}
    finally{clearTimeout(timer);this.signalRequests.delete(controller);}
  }
  async createCode(){
    if(this.pairing?.kind!=='offer')throw Error('Bitte zuerst ein Verbindungsangebot erstellen.');
    const generation=this.generation,pairing=this.pairing;let data;
    try{data=await this.signalApi('create',{offer:pairing.data});}catch(error){if(generation!==this.generation||this.pairing!==pairing)return;pairing.error=error.message;this.emit();throw error;}
    if(generation!==this.generation||this.pairing!==pairing){this.signalApi('close',{code:data.code},data.hostToken).catch(()=>{});return;}
    this.signal={code:data.code,hostToken:data.hostToken,expiresAt:data.expiresAt,pairing};
    this.pairing.code=data.code;this.pairing.expiresAt=data.expiresAt;this.pairing.error='';this.emit();
    this.signalTimer=setInterval(()=>this.pollSignal(),1600);
    this.pollSignal();
  }
  async pollSignal(){
    if(!this.signal||this.signalBusy)return;
    if(Date.now()>this.signal.expiresAt){if(this.pairing)this.pairing.error='Dieser Code ist abgelaufen. Die QR-Kopplung bleibt verfügbar.';this.stopSignal();this.emit();return;}
    this.signalBusy=true;const generation=this.generation,signal=this.signal;
    try{
      const data=await this.signalApi('poll',{code:signal.code},signal.hostToken);
      if(generation!==this.generation||this.signal!==signal||this.pairing!==signal.pairing)return;
      if(data.answer){await this.accept(data.answer);if(generation===this.generation)this.stopSignal(true);}
    }catch(error){if(generation===this.generation&&this.signal===signal&&this.pairing){this.pairing.error=error.message;this.emit();}}
    finally{if(this.signal===signal)this.signalBusy=false;}
  }
  async joinCode(code,name){
    let generation=this.restart();this.status='preparing';this.emit();
    try{
      const data=await this.signalApi('offer',{code});if(generation!==this.generation)return false;
      const joining=this.join(data.offer,name,true,generation);
      const answer=await joining;if(generation!==this.generation||!answer)return false;
      await this.signalApi('answer',{code,answer,joinToken:directId()});if(generation!==this.generation)return false;
      if(this.pairing){this.pairing.viaCode=true;this.emit();}return true;
    }catch(error){if(generation!==this.generation)return false;throw error;}
  }
  stopSignal(close=false){const signal=this.signal;clearInterval(this.signalTimer);this.signalTimer=null;this.signal=null;this.signalBusy=false;if(close&&signal)this.signalApi('close',{code:signal.code},signal.hostToken).catch(()=>{});}
  restart(){this.generation++;for(const controller of this.signalRequests)controller.abort();this.stopSignal(true);for(const peer of this.peers.values())peer.connection.close(false);this.peers.clear();this.rtc=null;this.manager?.pause();this.pairing=null;this.pairingError='';this.pairingComplete=false;this.pairingInProgress=false;return this.generation;}
  disconnect(){this.restart();this.manager?.pause();this.status='closed';this.pairing=null;this.emit();}
  forget(){if(this.save(null)===false)throw Error('Die Direktpartie konnte nicht aus dem Gerätespeicher entfernt werden.');this.restart();this.rtc=null;this.manager=null;this.pairing=null;this.status='idle';this.emit();}
  dispose(){this.disconnect();clearInterval(this.heartbeat);}
}
