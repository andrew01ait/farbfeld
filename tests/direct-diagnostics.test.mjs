import test from 'node:test';
import assert from 'node:assert/strict';
import {DirectDiagnostics,DIAGNOSTICS_KEY,DIAGNOSTICS_LIMIT,CAPTURE_MS,RETENTION_MS,diagnosticFacts,diagnosticError,readConnectionStats} from '../public/game/direct-diagnostics.js';
import {DirectConnection} from '../public/game/direct-connection.js';

function fixture(){
  let clock=Date.parse('2026-11-09T12:00:00Z'),writes=0;
  const values=new Map([['farbfeld.direct.v1','game-secret'],['farbfeld.prefs.v1','preferences']]);
  const storage={getItem:k=>values.get(k)??null,setItem(k,v){writes++;values.set(k,v);},removeItem:k=>values.delete(k)};
  const environment={navigator:{userAgent:'Mozilla/5.0 (Linux; Android 10) Chrome/145.0 SamsungBrowser/30.0',onLine:false},isSecureContext:true,matchMedia:()=>({matches:true})};
  const create=()=>new DirectDiagnostics({version:'1.16.0',storage,environment,now:()=>clock});
  const log=create();
  return {log,create,storage,environment,values,get writes(){return writes;},advance(ms){clock+=ms;}};
}
const session=()=>({saved:{name:'Private Person',secret:'do-not-export'},pid:1,status:'connected',ready:true,pending:null,online:[0,1],snapshot:{sessionId:'private-session-id',version:12,members:[{name:'Private Host'},{name:'Private Person'}],game:{gameId:'private-game-id',status:'playing',phase:'choose',round:3,active:0,players:[{marks:[true],total:47,jokers:2}]}},peers:new Map()});

test('Diagnostics are opt-in and invalid labels never create a recording',async()=>{
  const f=fixture();f.log.record('pairing',{stage:'offer-start'});
  assert.equal(f.log.state(),null);assert.equal(f.writes,0);assert.equal(await f.log.export(session()),null);
  for(const args of [{device:'private-name'}, {device:'A',test:0},{device:'B',test:1.5},{device:'A',test:100}])assert.equal(f.log.start(args),false);
  assert.equal(f.writes,0);assert.equal(f.log.start({device:'A',test:2,network:'hotspot-a'}),true);
  assert.equal(f.log.state().network,'hotspot-a');
});
test('Records and JSON exports allowlist facts, including after local storage is tampered with',async()=>{
  const f=fixture();f.log.start({device:'B',test:2,network:'secret-ssid'});
  f.log.record('pairing',{stage:'offer-ready',qrTotal:2,appVersion:'token-secret',sdp:'192.168.1.2',secret:'join-secret',hostName:'Private Host',payload:{secret:'payload-secret'},connection:'address-secret'});
  f.log.error(Error('join-secret at https://private.example/?token=secret 192.168.1.2'));
  const stored=JSON.parse(f.values.get(DIAGNOSTICS_KEY));stored.secret='injected-secret';stored.events.push({type:'error',at:stored.startedAt,seq:99,error:'injected-secret',sdp:'secret-sdp',revision:12});
  f.values.set(DIAGNOSTICS_KEY,JSON.stringify(stored));
  const restored=f.create(),file=await restored.export(session()),text=JSON.stringify(file.report);
  for(const secret of ['192.168.1.2','join-secret','Private Host','Private Person','injected-secret','secret-sdp','private-session-id','private-game-id','payload-secret','do-not-export','secret-ssid','address-secret','token-secret'])assert(!text.includes(secret),secret);
  assert.equal(file.report.capture.network,'unknown');assert.equal(file.report.capture.events[1].qrTotal,2);
  assert.equal(file.report.environment.browser,'Samsung Internet');assert.equal(file.report.environment.browserMajor,30);
  assert.equal(file.report.environment.platform,'Android');assert.equal(file.report.session.revision,12);
  assert.equal(file.report.session.round,3);assert.equal(file.report.session.role,'guest');
  assert.equal(file.report.capture.device,'B');assert.equal(file.report.capture.test,2);
  assert.match(file.filename,/^20261109_Farbfeld_OfflineDiagnose_B_Test2\.json$/);
  assert.equal(file.report.exportedAt,'2026-11-09T12:00:00.000Z');assert(!text.includes('userAgent'));
});
test('Bounded logs survive reload and stop/clear never touch game or preference storage',()=>{
  const f=fixture();f.log.start({device:'A'});
  for(let i=0;i<DIAGNOSTICS_LIMIT+5;i++)f.log.record('action',{action:'roll',revision:i});
  assert.equal(f.log.state().events.length,DIAGNOSTICS_LIMIT);assert.equal(f.log.state().dropped,6);
  const restored=f.create();assert.equal(restored.state().enabled,true);assert.equal(restored.state().events.at(-1).stage,'reload');
  restored.stop();const n=restored.state().events.length;restored.record('error',{error:'network'});
  assert.equal(restored.state().events.length,n);assert.equal(f.create().state().enabled,false);
  restored.clear();assert.equal(restored.state(),null);assert(!f.values.has(DIAGNOSTICS_KEY));
  assert.equal(f.values.get('farbfeld.direct.v1'),'game-secret');assert.equal(f.values.get('farbfeld.prefs.v1'),'preferences');
});
test('Recording expires without a background timer and old reports are removed at next access',()=>{
  const f=fixture();f.log.start({device:'A'});f.advance(CAPTURE_MS);
  f.log.record('action',{action:'roll'});assert.equal(f.log.state().enabled,false);assert.equal(f.log.state().events.at(-1).stage,'expired');
  f.advance(RETENTION_MS);assert.equal(f.log.state(),null);assert(!f.values.has(DIAGNOSTICS_KEY));
});
test('Storage failure leaves a usable in-memory report and never escapes into gameplay',async()=>{
  const log=new DirectDiagnostics({version:'1.16.0',storage:{getItem(){throw Error('blocked');},setItem(){throw Error('full');},removeItem(){throw Error('blocked');}}});
  assert.equal(log.start({device:'A'}),true);assert.doesNotThrow(()=>log.record('pairing',{stage:'offer-start'}));
  const file=await log.export(session());assert.equal(file.report.storageAvailable,false);assert.equal(file.report.capture.events.length,2);
  assert.doesNotThrow(()=>log.clear());
});
test('Explicit connection statistics keep useful counters and discard all addresses and identifiers',async()=>{
  let calls=0;
  const connection={channel:{id:3,readyState:'open',bufferedAmount:0},pc:{connectionState:'connected',iceConnectionState:'completed',iceGatheringState:'complete',signalingState:'stable',localDescription:{sdp:'v=0\r\na=ice-pwd:password-secret\r\na=candidate:1 1 udp 1 private-device.local 1234 typ host\r\n'},getStats:async()=>{calls++;return new Map([
    ['transport-secret',{type:'transport',selectedCandidatePairId:'pair-secret'}],['pair-secret',{type:'candidate-pair',localCandidateId:'candidate-secret',currentRoundTripTime:.012,bytesSent:80,bytesReceived:120}],['candidate-secret',{type:'local-candidate',candidateType:'host',protocol:'udp',address:'192.168.43.2',port:1234}],['channel-secret',{type:'data-channel',dataChannelIdentifier:3,label:'private-label',messagesSent:5,messagesReceived:6,bytesSent:40,bytesReceived:60}]
  ]);}}};
  const facts=await readConnectionStats(connection);assert.equal(calls,1);
  assert.deepEqual(facts,{connection:'connected',ice:'completed',gathering:'complete',signaling:'stable',channel:'open',candidateType:'host',transportProtocol:'udp',hostCandidates:1,udpCandidates:1,bufferedBytes:0,bytesSent:40,bytesReceived:60,messagesSent:5,messagesReceived:6,rttMs:12,mdns:true,selectedPair:true,statsAvailable:true});
  assert(!/secret|192\.168|1234|private-device|private-label/.test(JSON.stringify(facts)));
});
test('Missing, rejected and stalled statistics do not delay an export indefinitely',async()=>{
  assert.equal((await readConnectionStats({})).statsAvailable,false);
  assert.equal((await readConnectionStats({pc:{getStats:async()=>{throw Error('unsupported');}}})).statsAvailable,false);
  assert.equal((await readConnectionStats({pc:{getStats:()=>new Promise(()=>{})}},5)).statsAvailable,false);
  const facts=await readConnectionStats({pc:{getStats:async()=>new Map([['p',{type:'candidate-pair',nominated:true,state:'succeeded',bytesSent:2}]])}});
  assert.equal(facts.selectedPair,true);assert.equal(facts.bytesSent,2);
});
test('An export in flight cannot attach an old connection to a new test started in the same millisecond',async()=>{
  const f=fixture();f.log.start({device:'A'});let resolve;
  const s=session();s.peers.set(0,{connection:{pc:{getStats:()=>new Promise(done=>{resolve=done;})}}});
  const pending=f.log.export(s);f.log.start({device:'A'});resolve(new Map());assert.equal(await pending,null);
  assert.equal(f.log.state().events.length,1);
});
test('Setup results omit their free text and normalize errors to fixed categories',async()=>{
  const f=fixture();f.log.start({device:'A'});f.log.check({rows:[{id:'rtc',state:'error',detail:'private-address'},{id:'secret',state:'secret'}],candidates:{count:2,udp:2,mdns:true}});
  assert.deepEqual(diagnosticFacts({connection:'192.168.1.1',peer:-1,errorCode:Infinity,secret:'no'}),{});
  assert.equal(diagnosticError({name:'NotAllowedError',message:'camera-secret'}),'permission-denied');
  assert.equal(diagnosticError(Error('Der Browser stellt keine lokale Netzwerkadresse bereit.')),'no-candidates');
  assert.equal(diagnosticError(Error('Keine vollständigen lokalen Verbindungsdaten erhalten.')),'ice-timeout');
  assert(!JSON.stringify((await f.log.export(session())).report).includes('private-address'));
});
test('Real DirectConnection observers capture RTC transitions without changing the LAN configuration',async()=>{
  const rows=[],peers=[];
  class Peer extends EventTarget{
    constructor(config){super();this.config=config;this.connectionState='new';this.iceConnectionState='new';this.iceGatheringState='complete';this.signalingState='stable';peers.push(this);}
    createDataChannel(){const channel=new EventTarget();channel.label='farbfeld';channel.readyState='connecting';channel.bufferedAmount=0;channel.close=()=>{channel.readyState='closed';};return channel;}
    async createOffer(){return {type:'offer',sdp:'v=0\r\na=candidate:1 1 udp 1 192.168.43.2 1234 typ host'};}
    async setLocalDescription(value){this.localDescription=value;this.signalingState='have-local-offer';}
    close(){this.connectionState='closed';}
  }
  const connection=new DirectConnection({Peer,onDiagnostic:(type,facts)=>rows.push({type,...diagnosticFacts(facts)})});
  const offer=await connection.offer({snapshot:{sessionId:'private-session',members:[{name:'Private Host'}]},secret:'private-secret'},'1.16.0');
  assert.equal(offer.secret,'private-secret');assert.deepEqual(peers[0].config.iceServers,[]);
  assert(rows.some(row=>row.stage==='offer-ready'&&row.hostCandidates===1));
  peers[0].connectionState='connecting';peers[0].iceConnectionState='checking';peers[0].dispatchEvent(new Event('connectionstatechange'));
  assert(rows.some(row=>row.ice==='checking'));connection.close();assert(rows.some(row=>row.connection==='closed'));
  assert(!JSON.stringify(rows).includes('192.168'));assert(!JSON.stringify(rows).includes('private-secret'));
  const broken=new DirectConnection({Peer,onDiagnostic(){throw Error('observer failure');}});
  await broken.offer({snapshot:{sessionId:'s',members:[{name:'Private Host'}]},secret:'test'},'1.16.0');assert.doesNotThrow(()=>broken.close());
});
