import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DirectGame,hostRecord,guestRecord} from '../public/game/direct-game.js';
import {canAct,LABELS,SHAPES} from '../public/game/engine.js';

const app=readFileSync(new URL('../public/game/app.js',import.meta.url),'utf8');
const renderer=app.slice(app.indexOf('function directRollPreviewHTML('),app.indexOf('\nfunction diceHTML('));
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const render=Function('g','pid','screen','direct','inspectPid','canAct','LABELS','SHAPES','esc',renderer+';return directRollPreviewHTML(g,pid);');
const preview=(client,options={})=>render(client.snapshot.game,client.pid,options.screen??'direct',{ready:client.ready,pending:client.pending,...options},options.inspectPid??null,canAct,LABELS,SHAPES,esc);

function group(n,hiddenScores=false){
 const queue=[],errors=[],clients=[],host=new DirectGame(hostRecord('Alex <A>'),{rng:()=>0,onError:e=>errors.push(e)});
 clients.push(host);for(let pid=2;pid<n;pid++)host.reserveGuest(pid);
 const flush=()=>{let count=0;while(queue.length){assert(++count<1000);const [receiver,message,pid]=queue.shift();receiver.receive(message,pid);}};
 for(let pid=1;pid<n;pid++){
  const guest=new DirectGame(guestRecord({sessionId:host.snapshot.sessionId,secret:pid===1?host.record.secret:host.record.guestSecrets[pid],members:host.snapshot.members,pid},'Person '+pid),{onError:e=>errors.push(e)});
  clients.push(guest);host.attach(message=>queue.push([guest,message,1]),pid);guest.attach(message=>queue.push([host,message,pid]));flush();
 }
 host.act('options',{hiddenScores});flush();host.act('start');flush();return {host,clients,flush,errors};
}

for(const n of [2,6])for(const hidden of [false,true])test('Public roll reaches '+n+' direct players before the first choice, hidden='+hidden,()=>{
 const f=group(n,hidden);f.host.act('roll');f.flush();
 const dice=structuredClone(f.host.snapshot.game.dice),version=f.host.snapshot.version;
 assert.deepEqual(f.host.snapshot.game.submitted,[]);assert.equal(preview(f.host),'');
 for(const guest of f.clients.slice(1)){
  assert.deepEqual(guest.snapshot.game.dice,dice);assert.deepEqual(guest.snapshot.game.submitted,[]);
  const before=JSON.stringify(guest.record),html=preview(guest);assert.match(html,/Gemeinsamer Wurf/);assert.match(html,/Alex &lt;A&gt; wählt zuerst/);
  assert.equal((html.match(/class="roll-preview-die"/g)||[]).length,6);assert.doesNotMatch(html,/<button|data-action|Punkte|Joker übrig/);
  assert.equal(JSON.stringify(guest.record),before);assert.equal(canAct(guest.snapshot.game,guest.pid),false);
  if(hidden)assert.equal(guest.snapshot.game.players[0].marks,undefined);
 }
 f.clients[1].act('move',{move:{pass:true}});f.flush();assert.equal(f.host.snapshot.version,version);assert.deepEqual(f.host.snapshot.game.dice,dice);assert.match(f.errors.pop(),/noch nicht am Zug/);
 f.host.act('move',{move:{pass:true}});f.flush();
 for(const guest of f.clients.slice(1)){assert(canAct(guest.snapshot.game,guest.pid));assert.equal(preview(guest),'');}
 for(const guest of f.clients.slice(1)){guest.act('move',{move:{pass:true}});f.flush();}
 assert.equal(f.host.snapshot.game.active,1);f.clients[1].act('roll');f.flush();
 assert.deepEqual(f.host.snapshot.game.submitted,[]);assert.match(preview(f.host),/Person 1 wählt zuerst/);assert.equal(preview(f.clients[1]),'');
 for(const client of f.clients)assert.deepEqual(client.snapshot.game.dice,f.host.snapshot.game.dice);
 assert.deepEqual(f.errors,[]);
});

test('Preview is absent before rolling, while paused/pending, inspecting, submitted or outside direct games',()=>{
 const f=group(2),guest=f.clients[1];assert.equal(preview(guest),'');f.host.act('roll');f.flush();assert(preview(guest));
 for(const options of [{ready:false},{pending:{actionId:'waiting'}},{inspectPid:0},{screen:'room'}])assert.equal(preview(guest,options),'');
 const g=guest.snapshot.game;g.submitted.push(1);assert.equal(preview(guest),'');g.submitted=[];g.players[1].left=true;assert.equal(preview(guest),'');g.players[1].left=false;g.status='finished';assert.equal(preview(guest),'');
});
