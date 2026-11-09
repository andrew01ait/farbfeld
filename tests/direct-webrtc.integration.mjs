// Optional native transport check. Runtime PWA has no Node/native dependency.
// FARBFELD_RTC_MODULE points to an installed @roamhq/wrtc package.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import {DatabaseSync} from 'node:sqlite';
import {createRequire} from 'node:module';
import {DirectSession} from '../public/game/direct.js';
import {DirectConnection} from '../public/game/direct-connection.js';
import {decodeQrText} from '../public/game/qr.js';
import {findMove} from '../public/game/engine.js';
const require=createRequire(import.meta.url);
const {RTCPeerConnection}=require(process.env.FARBFELD_RTC_MODULE||'@roamhq/wrtc');
class NativeConnection extends DirectConnection{constructor(options){super({...options,Peer:RTCPeerConnection});}}
const sql=new DatabaseSync(':memory:');
for(const file of fs.readdirSync('drizzle').filter(file=>file.endsWith('.sql')).sort())sql.exec(fs.readFileSync('drizzle/'+file,'utf8'));
globalThis.__farbfeldNativeEnv={DB:{prepare(query){return {bind(...params){return {async first(){return sql.prepare(query).get(...params)??null;},async run(){const result=sql.prepare(query).run(...params);return {meta:{changes:Number(result.changes)}};}};}};}}};
const source=fs.readFileSync('app/api/direct-pairing/route.ts','utf8').replace("import { env } from 'cloudflare:workers';",'const env=globalThis.__farbfeldNativeEnv;');
const compiled=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const {POST}=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
let internet=false,httpCalls=0;const saved={},errors=[],clients=[];
const fetcher=async(path,options)=>{httpCalls++;if(!internet)throw Error('Internet ausgeschaltet');return POST(new Request('https://farbfeld.test'+path,options));};
function client(role,record=null){
 const session=new DirectSession({saved:record,version:'1.2.0',Connection:NativeConnection,fetcher,save:r=>{saved[role]=structuredClone(r);},onError:message=>errors.push(message)});
 clients.push(session);return session;
}
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(predicate,label){const start=Date.now();while(Date.now()-start<22000){if(predicate())return;await delay(8);}throw Error(label);}
async function pairQr(h,g,resume=false){
 await h.host('Robin',resume);const offer=await decodeQrText(h.pairing.qr.join('\n'));
 assert.match(offer.description.sdp,/a=candidate:/);assert(!/ typ (srflx|relay)/.test(offer.description.sdp));
 await g.join(offer,'Bea');const answer=await decodeQrText(g.pairing.qr.join('\n'));
 assert.match(answer.description.sdp,/a=candidate:/);await h.accept(answer);
 await until(()=>h.ready&&g.ready,'DataChannel nicht verbunden');
 assert.equal(h.rtc.channel.ordered,true);assert.equal(h.rtc.channel.maxRetransmits,null);
}
async function step(h,g,pid,action,payload={}){
 const old=h.snapshot.version;(pid===0?h:g).act(action,payload);
 await until(()=>h.snapshot.version>old&&h.snapshot.version===g.snapshot.version&&!g.pending,'Zug nicht bestätigt');
 assert.deepEqual(h.snapshot,g.snapshot);
}
async function main(){
 let h=client('host'),g=client('guest');await pairQr(h,g);
 assert.equal(httpCalls,0);console.log('PASS: zwei native RTC-Clients, vollständige QR-Angebote/Antworten, 0 HTTP, host candidates only.');
 await step(h,g,0,'start');await step(h,g,0,'roll');await step(h,g,0,'move',{move:{pass:true}});await step(h,g,1,'move',{move:{pass:true}});
 const version=h.snapshot.version;h.disconnect();
 await until(()=>!g.ready,'Gast wurde nicht pausiert');assert.throws(()=>g.act('roll'),/pausiert/);
 h.dispose();g.dispose();h=client('host',saved.host);g=client('guest',saved.guest);
 await pairQr(h,g,true);assert.equal(h.snapshot.version,version);assert.equal(h.snapshot.game.round,2);assert.deepEqual(h.snapshot,g.snapshot);
 console.log('PASS: Verbindungsabbruch sperrt beide, beide Clients aus gespeicherten Ständen neu erzeugt, einmalige QR-Fortsetzung.');
 const duplicate=g.manager.envelope('action',{action:'roll'}),old=h.snapshot.version;
 g.rtc.send(JSON.stringify(duplicate));g.rtc.send(JSON.stringify(duplicate));
 await until(()=>h.snapshot.version===old+1&&g.snapshot.version===h.snapshot.version,'Doppelprüfung ohne Abgleich');await delay(30);
 assert.equal(h.snapshot.version,old+1);
 let moves=0;
 while(h.snapshot.game.status==='playing'&&moves<500){
  if(h.snapshot.game.phase==='roll')await step(h,g,h.snapshot.game.active,'roll');
  const active=h.snapshot.game.active;
  for(const pid of [active,1-active]){await step(h,g,pid,'move',{move:findMove(h.snapshot.game,pid)||{pass:true}});moves++;}
 }
 assert.equal(h.snapshot.game.status,'finished');assert.equal(httpCalls,0);assert.deepEqual(h.snapshot,g.snapshot);
 console.log('PASS: vollständige Partie über zuverlässigen/geordneten SCTP-DataChannel: '+moves+' Züge, '+h.snapshot.game.round+' Würfe, 0 HTTP.');
 h.dispose();g.dispose();
 internet=true;h=client('code-host');g=client('code-guest');await h.host('Robin');await h.createCode();const code=h.pairing.code;
 await g.joinCode(code,'Bea');await until(()=>h.ready&&g.ready,'Raumcode verbindet nicht');
 internet=false;const before=httpCalls;
 await step(h,g,0,'start');await step(h,g,0,'roll');await step(h,g,0,'move',{move:{pass:true}});await step(h,g,1,'move',{move:{pass:true}});
 assert.equal(httpCalls,before);assert.equal(h.snapshot.game.round,2);
 console.log('PASS: Raumcode mit echter API-Logik, anschließend Internetdienst gesperrt; Würfe und Züge laufen ohne weitere HTTP-Aufrufe.');
 assert.deepEqual(errors,[]);
}
try{await main();clients.forEach(client=>client.dispose());await delay(100);process.exit(0);}
catch(error){console.error(error);clients.forEach(client=>client.dispose());await delay(100);process.exit(1);}
