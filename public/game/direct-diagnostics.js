// Local, explicitly enabled diagnostics. Only allowlisted scalar facts cross this
// boundary: never store SDP, candidates, messages, snapshots or exception text.
export const DIAGNOSTICS_KEY='farbfeld.direct.diagnostics.v1';
export const DIAGNOSTICS_LIMIT=300;
export const CAPTURE_MS=30*60*1000;
export const RETENTION_MS=24*60*60*1000;
const TYPES=new Set(['capture','lifecycle','pairing','rtc','scan','session','message','action','error','check','stats']);
const ENUMS={
  role:['host','guest','none'],
  stage:['started','stopped','expired','reload','foreground','background','pagehide','offer-start','offer-ready','answer-start','answer-ready','answer-accepted','pair-complete','pair-cancelled','restored','disconnect','heartbeat-stalled','heartbeat-recovered','code-start','code-ready','code-failed'],
  connection:['new','connecting','connected','disconnected','failed','closed'],
  ice:['new','checking','connected','completed','failed','disconnected','closed'],
  gathering:['new','gathering','complete'],
  signaling:['stable','have-local-offer','have-remote-offer','have-local-pranswer','have-remote-pranswer','closed'],
  channel:['connecting','open','closing','closed'],
  status:['idle','preparing','offering','connecting','connected','failed','disconnected','stalled','closed'],
  messageType:['hello','state','action','resync','reaction','reaction-error'],
  action:['start','options','abort','roll','move','rematch'],
  gameStatus:['none','playing','finished'],phase:['lobby','roll','choose','finished'],
  kind:['offer','answer'],method:['qr','paste','code'],direction:['send','receive'],
  candidateType:['host','srflx','prflx','relay'],transportProtocol:['udp','tcp'],
  error:['aborted','permission-denied','no-candidates','ice-timeout','connection-timeout','qr-invalid','qr-render','handshake','storage','network','stale','rules','unknown','stats-unavailable'],
  checkId:['secure','cache','camera','qr','camera-permission','network-permission','rtc'],
  checkState:['ok','warning','info','error','checking'],
};
const NUMBERS={peer:5,localPlayer:5,revision:1e9,round:1e6,activePlayer:5,players:6,onlinePeers:6,qrRead:100,qrTotal:100,hostCandidates:256,udpCandidates:256,bufferedBytes:1e12,errorCode:999,bytesSent:1e12,bytesReceived:1e12,messagesSent:1e12,messagesReceived:1e12,rttMs:1e6};
const BOOLEANS=['ready','pending','mdns','selectedPair','cacheReady','secure','standalone','onlineHint','statsAvailable'];
const version=value=>typeof value==='string'&&/^\d{1,4}\.\d{1,4}\.\d{1,4}$/.test(value)?value:'unknown';
const integer=(value,max)=>Number.isSafeInteger(value)&&value>=0&&value<=max;
export function diagnosticFacts(value={}){
  const out={};
  for(const [key,values]of Object.entries(ENUMS))if(values.includes(value[key]))out[key]=value[key];
  for(const [key,max]of Object.entries(NUMBERS))if(integer(value[key],max))out[key]=value[key];
  for(const key of BOOLEANS)if(typeof value[key]==='boolean')out[key]=value[key];
  if(value.appVersion!==undefined)out.appVersion=version(value.appVersion);
  return out;
}
export function diagnosticError(error){
  if(error?.name==='NotAllowedError')return 'permission-denied';
  if(error?.name==='AbortError')return 'aborted';
  let message='';try{message=String(error?.message??error??'').slice(0,2000);}catch{}
  if(/abgebrochen|abort/i.test(message))return 'aborted';
  if(/notallowed|permission|berechtigung|freigabe.*block/i.test(message))return 'permission-denied';
  if(/keine lokale Netzwerkadresse|keine.*candidate/i.test(message))return 'no-candidates';
  if(/keine vollständigen lokalen|ice.*timeout/i.test(message))return 'ice-timeout';
  if(/timeout|zeitüberschreitung/i.test(message))return 'connection-timeout';
  if(/QR|FF1|decoder/i.test(message))return 'qr-invalid';
  if(/angebot|antwort|kopplung|spielerplatz/i.test(message))return 'handshake';
  if(/speicher/i.test(message))return 'storage';
  if(/inzwischen|veraltet|älteren/i.test(message))return 'stale';
  if(/internet|netz|fetch/i.test(message))return 'network';
  if(/zug|würfel|gastgeber|spielart|partie.*pausiert/i.test(message))return 'rules';
  return 'unknown';
}
export function localCandidateFacts(sdp=''){
  const lines=typeof sdp==='string'?sdp.slice(0,60000).split(/\r?\n/).filter(line=>line.startsWith('a=candidate:')&&/\btyp host\b/.test(line)):[];
  return {hostCandidates:Math.min(256,lines.length),udpCandidates:Math.min(256,lines.filter(line=>/\budp\b/i.test(line)).length),mdns:lines.some(line=>/\.local\b/.test(line))};
}
export function directSessionFacts(session){
  const s=session.snapshot,g=s?.game;
  return diagnosticFacts({role:session.saved?(session.pid===0?'host':'guest'):'none',localPlayer:session.pid,status:session.status,revision:s?.version,round:g?.round,activePlayer:g?.active,players:s?.members?.length,onlinePeers:session.online?.length,ready:session.ready,pending:!!session.pending,gameStatus:g?.status??'none',phase:g?.phase??'lobby'});
}
export function rtcFacts(connection){
  const pc=connection?.pc;
  return diagnosticFacts({connection:pc?.connectionState,ice:pc?.iceConnectionState,gathering:pc?.iceGatheringState,signaling:pc?.signalingState,channel:connection?.channel?.readyState,bufferedBytes:connection?.channel?.bufferedAmount,...localCandidateFacts(pc?.localDescription?.sdp)});
}
export async function readConnectionStats(connection,timeout=1200){
  const base={...rtcFacts(connection),statsAvailable:false};
  if(!connection?.pc||typeof connection.pc.getStats!=='function')return base;
  let timer;
  try{
    const stats=await Promise.race([connection.pc.getStats(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('timeout')),timeout);})]);
    const rows=[];stats.forEach(row=>rows.push(row));
    const transport=rows.find(row=>row.type==='transport'&&row.selectedCandidatePairId);
    const pair=transport?stats.get(transport.selectedCandidatePairId):rows.find(row=>row.type==='candidate-pair'&&row.nominated&&row.state==='succeeded');
    const candidate=pair?stats.get(pair.localCandidateId):null;
    const channel=rows.find(row=>row.type==='data-channel'&&row.dataChannelIdentifier===connection.channel?.id);
    return diagnosticFacts({...base,statsAvailable:true,selectedPair:!!pair,bytesSent:channel?.bytesSent??pair?.bytesSent,bytesReceived:channel?.bytesReceived??pair?.bytesReceived,messagesSent:channel?.messagesSent,messagesReceived:channel?.messagesReceived,rttMs:Number.isFinite(pair?.currentRoundTripTime)?Math.round(pair.currentRoundTripTime*1000):undefined,candidateType:candidate?.candidateType,transportProtocol:candidate?.protocol});
  }catch{return base;}finally{clearTimeout(timer);}
}
function environmentFacts(environment){
  try{
    const ua=String(environment.navigator?.userAgent??'').slice(0,1000);
    const match=['SamsungBrowser','EdgA','Edg','Firefox','FxiOS','CriOS','Chrome','Version'].map(name=>ua.match(new RegExp('('+name+')/(\\d{1,4})'))).find(Boolean);
    return {browser:match?({SamsungBrowser:'Samsung Internet',EdgA:'Edge',Edg:'Edge',Firefox:'Firefox',FxiOS:'Firefox',CriOS:'Chrome',Chrome:'Chrome',Version:'Safari'}[match[1]]):'unknown',browserMajor:match?Number(match[2]):null,platform:/Android/.test(ua)?'Android':/iPhone|iPad/.test(ua)?'iOS':/Windows/.test(ua)?'Windows':/Macintosh/.test(ua)?'macOS':/Linux/.test(ua)?'Linux':'unknown',standalone:!!(environment.matchMedia?.('(display-mode: standalone)').matches||environment.navigator?.standalone),secure:environment.isSecureContext===true};
  }catch{return {browser:'unknown',browserMajor:null,platform:'unknown',standalone:false,secure:false};}
}
function normalizeRecord(value,now){
  if(!value||value.schema!==1||!integer(value.startedAt,8.64e15)||value.startedAt>now+60000||now-value.startedAt>RETENTION_MS||!['A','B'].includes(value.device)||!integer(value.test,99)||value.test<1)return null;
  const events=(Array.isArray(value.events)?value.events:[]).slice(-DIAGNOSTICS_LIMIT).flatMap(row=>TYPES.has(row?.type)&&integer(row.at,8.64e15)&&integer(row.seq,1e9)?[{at:row.at,seq:row.seq,type:row.type,...diagnosticFacts(row)}]:[]);
  return {schema:1,device:value.device,test:value.test,network:['wifi','hotspot-a','hotspot-b','unknown'].includes(value.network)?value.network:'unknown',startedAt:value.startedAt,stoppedAt:integer(value.stoppedAt,8.64e15)?value.stoppedAt:null,enabled:value.enabled===true&&now-value.startedAt<CAPTURE_MS,captureVersion:version(value.captureVersion),dropped:integer(value.dropped,1e9)?value.dropped:0,events};
}
export class DirectDiagnostics{
  constructor({version:appVersion,storage,environment=globalThis,now=()=>Date.now()}={}){
    this.version=version(appVersion);this.environment=environment;this.now=now;this.storage=storage;this.storageAvailable=true;this.data=null;this.generation=0;
    try{const raw=storage?.getItem(DIAGNOSTICS_KEY);if(raw&&raw.length<200000)this.data=normalizeRecord(JSON.parse(raw),this.now());if(raw&&!this.data)storage?.removeItem(DIAGNOSTICS_KEY);}catch{this.storageAvailable=false;}
    this.record('lifecycle',{stage:'reload'});
  }
  state(){
    if(this.data&&this.now()-this.data.startedAt>RETENTION_MS){this.clear();return null;}
    if(this.data?.enabled&&this.now()-this.data.startedAt>=CAPTURE_MS){this.append('capture',{stage:'expired'});this.data.enabled=false;this.data.stoppedAt=this.now();this.persist();}
    return this.data?normalizeRecord(this.data,this.now()):null;
  }
  persist(){try{if(!this.storage)throw Error('unavailable');this.storage.setItem(DIAGNOSTICS_KEY,JSON.stringify(this.data));this.storageAvailable=true;}catch{this.storageAvailable=false;}}
  start({device,test=1,network='unknown'}={}){
    if(!['A','B'].includes(device)||!integer(test,99)||test<1)return false;
    this.data=normalizeRecord({schema:1,device,test,network,startedAt:this.now(),enabled:true,captureVersion:this.version,events:[]},this.now());
    this.generation++;this.record('capture',{stage:'started',appVersion:this.version});return true;
  }
  append(type,facts){
    const events=this.data.events,seq=(events.at(-1)?.seq??0)+1;
    events.push({at:this.now(),seq,type,...diagnosticFacts(facts)});
    if(events.length>DIAGNOSTICS_LIMIT){events.shift();this.data.dropped++;}
  }
  record(type,facts={}){try{if(!TYPES.has(type)||!this.state()?.enabled)return;this.append(type,facts);this.persist();}catch{/* Diagnostics must not interrupt a game. */}}
  error(error){this.record('error',{error:diagnosticError(error)});}
  stop(){if(this.state()?.enabled){this.record('capture',{stage:'stopped'});this.data.enabled=false;this.data.stoppedAt=this.now();this.persist();}}
  clear(){this.generation++;this.data=null;try{this.storage?.removeItem(DIAGNOSTICS_KEY);}catch{this.storageAvailable=false;}}
  check(result){
    for(const row of (result?.rows??[]).slice(0,12))this.record('check',{checkId:row.id,checkState:row.state,hostCandidates:result.candidates?.count,udpCandidates:result.candidates?.udp,mdns:result.candidates?.mdns});
  }
  lifecycle(stage){this.record('lifecycle',{stage,onlineHint:typeof this.environment.navigator?.onLine==='boolean'?this.environment.navigator.onLine:undefined});}
  async export(session){
    const initial=this.state();if(!initial)return null;
    const generation=this.generation,startedAt=initial.startedAt,device=initial.device,test=initial.test;
    const peers=[...(session?.peers??new Map())].slice(0,5);
    const connections=await Promise.all(peers.map(async([peer,entry])=>({peer,...await readConnectionStats(entry.connection)})));
    const current=this.state();if(this.generation!==generation||!current||current.startedAt!==startedAt||current.device!==device||current.test!==test)return null;
    for(const facts of connections)this.record('stats',facts);
    const at=new Date(this.now()),localDate=[at.getFullYear(),at.getMonth()+1,at.getDate()].map((n,i)=>String(n).padStart(i===0?4:2,'0')).join('');
    const data=this.state();if(!data)return null;
    return {filename:localDate+'_Farbfeld_OfflineDiagnose_'+data.device+'_Test'+data.test+'.json',report:{format:'farbfeld-offline-diagnostics',schema:1,appVersion:this.version,exportedAt:at.toISOString(),exportedAtVienna:at.toLocaleString('de-AT',{timeZone:'Europe/Vienna'}),environment:environmentFacts(this.environment),storageAvailable:this.storageAvailable,capture:data,session:session?directSessionFacts(session):{},connections:connections.map(diagnosticFacts)}};
  }
}
