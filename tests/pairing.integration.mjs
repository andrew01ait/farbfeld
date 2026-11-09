import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import {DatabaseSync} from 'node:sqlite';
const sql=new DatabaseSync(':memory:');
for(const file of fs.readdirSync('drizzle').filter(file=>file.endsWith('.sql')).sort())sql.exec(fs.readFileSync('drizzle/'+file,'utf8'));
globalThis.__farbfeldPairEnv={DB:{prepare(query){return {bind(...params){return {async first(){return sql.prepare(query).get(...params)??null;},async run(){const result=sql.prepare(query).run(...params);return {meta:{changes:Number(result.changes)}};}};}};}}};
let source=fs.readFileSync('app/api/direct-pairing/route.ts','utf8').replace("import { env } from 'cloudflare:workers';",'const env=globalThis.__farbfeldPairEnv;');
const compiled=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const {POST}=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
async function post(action,body={},token=null,origin=null){
  const response=await POST(new Request('https://farbfeld.test/api/direct-pairing',{method:'POST',headers:{'Content-Type':'application/json',...(token?{'X-Pairing-Token':token}:{}),...(origin?{Origin:origin}:{})},body:JSON.stringify({action,...body})}));
  assert.equal(response.headers.get('Cache-Control'),'no-store');return {status:response.status,...await response.json()};
}
const offer={protocol:1,kind:'offer',sessionId:'test-session',connectionId:'test-connection',secret:'g'.repeat(64),description:{type:'offer',sdp:'v=0\r\na=candidate:1 local typ host'}};
const answer={protocol:1,kind:'answer',sessionId:offer.sessionId,connectionId:offer.connectionId,description:{type:'answer',sdp:'v=0\r\na=candidate:2 local typ host'}};
assert.equal((await post('create')).status,400);
assert.equal((await post('create',{offer},null,'https://other.test')).status,403);
const host=await post('create',{offer});assert.equal(host.status,200);assert.match(host.code,/^[A-Z2-9]{8}$/);assert(host.expiresAt>Date.now()&&host.expiresAt<Date.now()+11*60000);
const guest=await post('offer',{code:host.code});assert.deepEqual(guest.offer,offer);assert(!guest.hostToken);assert(!guest.answer);
assert.equal((await post('poll',{code:host.code})).status,403);
assert.equal((await post('poll',{code:host.code},'wrong')).status,403);
assert.equal((await post('answer',{code:host.code,answer:{...answer,sessionId:'wrong'},joinToken:crypto.randomUUID()})).status,400);
const joinToken=crypto.randomUUID();
assert.equal((await post('answer',{code:host.code,answer,joinToken})).status,200);
assert.equal((await post('answer',{code:host.code,answer,joinToken})).status,200);
assert.equal((await post('answer',{code:host.code,answer,joinToken:crypto.randomUUID()})).status,409);
assert.deepEqual((await post('poll',{code:host.code},host.hostToken)).answer,answer);
assert.equal((await post('close',{code:host.code},host.hostToken)).status,200);
assert.equal((await post('offer',{code:host.code})).status,404);
const expired=await post('create',{offer});sql.prepare('UPDATE direct_pairings SET expires_at = ? WHERE code = ?').run(Date.now()-1,expired.code);
assert.equal((await post('offer',{code:expired.code})).status,404);
await post('create',{offer});assert.equal(sql.prepare('SELECT count(*) AS n FROM direct_pairings WHERE code = ?').get(expired.code).n,0);
console.log('Kurzlebige Direkt-Kopplung: Create, Offer, Host-Token, Antwort-Zuordnung, Idempotenz, Konflikt, Ablauf und Löschen OK.');

// New group protocol: one short-lived code carries one authenticated seat.
for(let pid=1;pid<=5;pid++){
 const groupOffer={...offer,protocol:2,pid,connectionId:'seat-'+pid,members:Array.from({length:pid+1},(_,i)=>({id:offer.sessionId+':'+i,name:i?'':'Host'}))};
 const h=await post('create',{offer:groupOffer});assert.equal(h.status,200);assert.equal((await post('offer',{code:h.code})).offer.pid,pid);
 assert.equal((await post('answer',{code:h.code,answer:{...answer,connectionId:groupOffer.connectionId},joinToken:crypto.randomUUID()})).status,400);
 const groupAnswer={...answer,protocol:2,connectionId:groupOffer.connectionId};
 assert.equal((await post('answer',{code:h.code,answer:groupAnswer,joinToken:crypto.randomUUID()})).status,200);
 assert.deepEqual((await post('poll',{code:h.code},h.hostToken)).answer,groupAnswer);
 await post('close',{code:h.code},h.hostToken);
}
assert.equal((await post('create',{offer:{...offer,protocol:2,pid:6}})).status,400);
console.log('Gruppenprotokoll: alle fünf Gastplätze, getrennte Codes, Protokoll-Zuordnung und Sechsergrenze OK.');
