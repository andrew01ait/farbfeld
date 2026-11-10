import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectOfflineSetup,candidateSummary,offlineCheckReport} from '../public/game/direct-check.js';
const sdp='v=0\r\na=ice-pwd:secret-password\r\na=candidate:1 1 udp 2122260223 192.168.43.12 35000 typ host\r\na=candidate:2 1 udp 2122260222 device-secret.local 35001 typ host\r\n';
function fixture({candidates=true,complete=true,permission='prompt'}={}){
  const peers=[],queried=[];let camera=0,fetches=0;
  class Peer extends EventTarget{
    constructor(config){super();this.config=config;this.iceGatheringState=complete?'complete':'gathering';peers.push(this);}
    createDataChannel(label,options){this.label=label;this.ordered=options.ordered;return {close:()=>{this.channelClosed=true;}};}
    async createOffer(){return {type:'offer',sdp:candidates?sdp:'v=0\r\n'};}
    async setLocalDescription(value){this.localDescription=value;}
    close(){this.closed=true;}
  }
  const environment={isSecureContext:true,RTCPeerConnection:Peer,navigator:{onLine:false,mediaDevices:{getUserMedia(){camera++;throw Error('camera must stay off');}},permissions:{async query({name}){queried.push(name);if(name==='local-network')throw Error('unsupported');return {state:permission};}}},fetch(){fetches++;throw Error('must stay offline');}};
  return {environment,peers,queried,get camera(){return camera;},get fetches(){return fetches;}};
}
test('Offline-Prüfung benötigt weder Internet noch Kamera und lässt keine RTC-Verbindung offen',async()=>{
  const f=fixture(),progress=[];
  const result=await inspectOfflineSetup({version:'test',environment:f.environment,offlineInfo:{ready:true},onProgress:value=>progress.push(value)});
  assert(result.rows.some(row=>row.id==='rtc'&&row.state==='ok'));
  assert(result.rows.some(row=>row.id==='qr'&&row.state==='ok'));
  assert(result.rows.some(row=>row.id==='cache'&&row.state==='ok'));
  assert.equal(f.camera,0);assert.equal(f.fetches,0);assert(progress.length>=7);
  assert.deepEqual(f.peers[0].config.iceServers,[]);assert.equal(f.peers[0].ordered,true);
  assert(f.peers[0].closed&&f.peers[0].channelClosed);assert(f.queried.includes('local-network-access'));
  assert.deepEqual(result.candidates,{count:2,udp:2,mdns:true});
  const report=offlineCheckReport(result);
  for(const secret of ['192.168.43.12','device-secret.local','secret-password','35000'])assert(!report.includes(secret));
  assert.match(report,/zweiten Handy noch nicht bestätigt/);
});
test('Fehlende lokale Adressen werden von einem QR-Fehler getrennt erklärt',async()=>{
  const f=fixture({candidates:false,permission:'denied'}),result=await inspectOfflineSetup({version:'test',environment:f.environment});
  assert.equal(result.rows.find(row=>row.id==='rtc').state,'error');
  assert.match(result.rows.find(row=>row.id==='rtc').detail,/kein nutzbarer Angebots-QR/);
  assert.equal(result.rows.find(row=>row.id==='qr').state,'ok');
  assert.equal(result.rows.find(row=>row.id==='network-permission').state,'warning');
  assert(f.peers[0].closed);assert.equal(f.camera,0);
});
test('Adresssuche läuft begrenzt und ein Abbruch beendet nur den temporären Test',async()=>{
  const f=fixture({complete:false}),controller=new AbortController();let started;
  const collecting=new Promise(resolve=>{started=resolve;});
  const pending=inspectOfflineSetup({environment:f.environment,signal:controller.signal,onProgress:value=>{if(value.rows.some(row=>row.id==='rtc'))started();}});
  await collecting;controller.abort();await assert.rejects(pending,/abgebrochen/);
  assert(f.peers[0].closed&&f.peers[0].channelClosed);
  const timed=await inspectOfflineSetup({environment:f.environment,iceTimeout:5});
  assert.equal(timed.rows.find(row=>row.id==='rtc').state,'warning');assert.match(timed.rows.find(row=>row.id==='rtc').detail,/Adresssuche bleibt offen/);assert(f.peers[1].closed);
  const empty=fixture({complete:false,candidates:false}),failed=await inspectOfflineSetup({environment:empty.environment,iceTimeout:5});
  assert.equal(failed.rows.find(row=>row.id==='rtc').state,'error');assert(empty.peers[0].closed);
});
test('Nicht unterstützte Berechtigungsabfragen sperren einen erfolgreichen lokalen Test nicht',async()=>{
  const f=fixture();delete f.environment.navigator.permissions;
  const result=await inspectOfflineSetup({environment:f.environment});
  assert.equal(result.rows.find(row=>row.id==='network-permission').state,'info');
  assert.equal(result.rows.find(row=>row.id==='rtc').state,'ok');
});
test('Fehlende Browserfunktionen, Cache und QR-Fehler erhalten konkrete einzelne Ergebnisse',async()=>{
  const result=await inspectOfflineSetup({version:'test',environment:{isSecureContext:false,navigator:{}},qrCheck(){throw Error('decoder broken');}});
  for(const id of ['secure','qr','rtc'])assert.equal(result.rows.find(row=>row.id===id).state,'error');
  for(const id of ['cache','camera'])assert.equal(result.rows.find(row=>row.id===id).state,'warning');
  assert.deepEqual(candidateSummary('a=candidate:1 1 udp 1 1.2.3.4 99 typ relay\r\n'),{count:0,udp:0,mdns:false});
});
