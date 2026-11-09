import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import {DatabaseSync} from 'node:sqlite';
import {pathToFileURL} from 'node:url';
import {findMove} from '../public/game/engine.js';
const sql=new DatabaseSync(':memory:');
for(const file of fs.readdirSync('drizzle').filter(name=>name.endsWith('.sql')).sort())sql.exec(fs.readFileSync('drizzle/'+file,'utf8'));
globalThis.__farbfeldTestEnv={DB:{prepare(query){return {bind(...params){return {async first(){return sql.prepare(query).get(...params)??null;},async all(){return {results:sql.prepare(query).all(...params)};},async run(){const result=sql.prepare(query).run(...params);return {meta:{changes:Number(result.changes)}};}};}};},async batch(statements){const out=[];for(const statement of statements)out.push(await statement.run());return out;}}};
let source=fs.readFileSync(new URL('../app/api/rooms/route.ts',import.meta.url),'utf8');
source=source.replace("import { env,waitUntil } from 'cloudflare:workers';",'const env=globalThis.__farbfeldTestEnv;const waitUntil=promise=>promise.catch(()=>{});').replace('../../../public/game/engine.js',pathToFileURL(process.cwd()+'/public/game/engine.js').href).replace('../../../public/game/game-info.js',pathToFileURL(process.cwd()+'/public/game/game-info.js').href).replace('../../../public/game/boards.js',pathToFileURL(process.cwd()+'/public/game/boards.js').href).replace('../../../public/game/reactions.js',pathToFileURL(process.cwd()+'/public/game/reactions.js').href).replace('../../../public/game/room-status.js',pathToFileURL(process.cwd()+'/public/game/room-status.js').href).replace('../../../lib/room-presence.js',pathToFileURL(process.cwd()+'/lib/room-presence.js').href).replace('../../../lib/notifications.js',pathToFileURL(process.cwd()+'/lib/notifications.js').href);
const compiled=ts.transpileModule(source.replace('../../../lib/room-retention.js',pathToFileURL(process.cwd()+'/lib/room-retention.js').href),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const {GET,POST}=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
const origin='https://farbfeld.test';
const request=async(input,options={})=>{const req=new Request(input,options);return req.method==='GET'?GET(req):POST(req);};
async function post(action,session={},extra={}){const response=await request(origin+'/api/rooms',{method:'POST',headers:{'Content-Type':'application/json',...(session.token?{'X-Player-Token':session.token}:{})},body:JSON.stringify({action,code:session.code,version:session.version,...extra})});const data=await response.json();return {status:response.status,...data};}
let a=await post('create',{}, {name:'Test A'});assert.equal(a.status,200,JSON.stringify(a));assert(a.token);assert.equal(a.members.length,1);const code=a.code,tokenA=a.token,idA=a.playerId;
let b=await post('join',{code},{name:'Test B'});assert.equal(b.status,200);const tokenB=b.token,idB=b.playerId;
a={...b,code,token:tokenA,playerId:idA};b={...b,code,token:tokenB,playerId:idB};
let denied=await request(origin+'/api/rooms?code='+code);assert.equal(denied.status,403);
assert.equal((await post('start',b)).status,403);
let s=await post('start',a);assert.equal(s.status,200,JSON.stringify(s));assert(s.game.gameId);assert.equal(s.game.players.length,2);assert.equal('token'in s.members[0],false);
a={...a,...s};b={...b,...s};
assert.equal((await post('join',{code},{name:'Too late'})).status,409);
assert.equal((await post('roll',b)).status,403);
s=await post('roll',a);assert.equal(s.status,200);a={...a,...s};b={...b,...s};
assert.equal((await post('roll',a)).status,400);
assert.equal((await post('move',b,{move:{pass:true}})).status,400);
let round=1,total=0;
while(s.game.status==='playing'&&s.game.round<200){const g=s.game;if(g.phase==='roll'){const session=g.players[g.active].id===idA?a:b;s=await post('roll',{...session,version:s.version});assert.equal(s.status,200,JSON.stringify(s));}const active=s.game.active,order=[active,1-active];for(const pid of order){const session=s.game.players[pid].id===idA?a:b;const move=findMove(s.game,pid)??{pass:true};const previous=s.version;s=await post('move',{...session,version:previous},{move});assert.equal(s.status,200,JSON.stringify(s));total++;if(total===1){const duplicate=await post('move',{...session,version:previous},{move});assert.equal(duplicate.status,409);}}
a.version=s.version;b.version=s.version;}
assert.equal(s.game.status,'finished');assert(total>=2);console.log(JSON.stringify({ok:true,rounds:s.game.round,acceptedMoves:total,checks:['create','join','member privacy','unauthorized read','host role','turn role','invalid repeat roll','passive ordering','optimistic version','full game to two colors']}));
let r=await post('rematch',{...a,version:s.version});assert.equal(r.status,200);assert.equal(r.game,null);console.log('Rematch to lobby: OK');
s=await post('start',{...a,version:r.version});assert.equal(s.status,200);
const beforeAbort=s.version,abortedGame=s.game.gameId;
assert.equal((await post('abort',{code,version:beforeAbort})).status,403);
const cancelled=await post('abort',{...b,version:beforeAbort});assert.equal(cancelled.status,200);
assert.equal(cancelled.game,null);assert.equal(cancelled.lastAbort.by,'Test B');assert.equal(cancelled.lastAbort.gameId,abortedGame);
const afterCancel=await request(origin+'/api/rooms?code='+code,{headers:{'X-Player-Token':tokenA}});
const observed=await afterCancel.json();assert.equal(observed.game,null);assert.equal(observed.lastAbort.by,'Test B');
const restarted=await post('start',{...a,version:cancelled.version});assert.equal(restarted.status,200);assert(restarted.game.gameId!==abortedGame);assert.equal(restarted.lastAbort,undefined);
assert.equal((await post('abort',{...b,version:beforeAbort})).status,409);
const unchanged=await request(origin+'/api/rooms?code='+code,{headers:{'X-Player-Token':tokenA}});assert.equal((await unchanged.json()).game.gameId,restarted.game.gameId);
console.log('Gemeinsamer Abbruch: Teilnehmerberechtigung, synchronisierter Hinweis, unveränderte Mitglieder, neue Partie und veraltete Wiederholung OK.');
// The server-backed alternative also permits exactly six separate phones.
const groupHost=await post('create',{}, {name:'Group Host'}),group=[{code:groupHost.code,token:groupHost.token}];let groupState=groupHost;
for(let i=1;i<6;i++){const joined=await post('join',{code:groupHost.code},{name:'Group '+(i+1)});assert.equal(joined.status,200);group.push({code:joined.code,token:joined.token});groupState=joined;}
assert.equal((await post('join',{code:groupHost.code},{name:'Seventh'})).status,409);
groupState=await post('start',{...group[0],version:groupState.version});assert.equal(groupState.status,200);assert.equal(groupState.game.players.length,6);
for(let round=0;round<6;round++){
 const active=groupState.game.active;assert.equal(active,round);groupState=await post('roll',{...group[active],version:groupState.version});assert.equal(groupState.status,200);
 for(const pid of [active,...group.map((_,i)=>i).filter(i=>i!==active)]){groupState=await post('move',{...group[pid],version:groupState.version},{move:{pass:true}});assert.equal(groupState.status,200);}
}
assert.equal(groupState.game.round,7);console.log('Internet-Spielraum: sechs getrennte Teilnehmer, siebter abgewiesen, aktive Rolle über alle sechs Geräte rotiert OK.');
// Concealed rooms redact at the API boundary and reveal only after game end.
const feat={features:['hidden-scores-v1']};
let ha=await post('create',{}, {name:'Hidden A',...feat}),hb=await post('join',{code:ha.code},{name:'Hidden B',...feat});
const ca={code:ha.code,token:ha.token},cb={code:ha.code,token:hb.token};
assert.equal((await post('options',{...cb,version:hb.version},{hiddenScores:true,...feat})).status,403);
let hs=await post('options',{...ca,version:hb.version},{hiddenScores:true,...feat});assert.equal(hs.status,200);assert.equal(hs.hiddenScores,true);
assert.equal((await post('join',{code:ha.code},{name:'Old client'})).status,400);
hs=await post('start',{...ca,version:hs.version},feat);assert.equal(hs.status,200);assert.deepEqual(hs.game.players[1],{id:hb.playerId,name:'Hidden B',hidden:true});assert.equal(hs.game.players[0].marks.length,105);
const ownView=async session=>{const res=await request(origin+'/api/rooms?code='+session.code,{headers:{'X-Player-Token':session.token,'X-Farbfeld-Features':'hidden-scores-v1'}});assert.equal(res.status,200);return res.json();};
let bv=await ownView(cb);assert.equal(bv.game.players[1].marks.length,105);assert.equal(bv.game.players[0].marks,undefined);
assert.equal((await request(origin+'/api/rooms?code='+ca.code,{headers:{'X-Player-Token':ca.token}})).status,409);
assert.equal((await post('options',{...ca,version:hs.version},{hiddenScores:false,...feat})).status,409);
hs=await post('roll',{...ca,version:hs.version},feat);assert.equal(hs.status,200);
hs=await post('move',{...ca,version:hs.version},{move:{pass:true},...feat});assert.equal(hs.status,200);
bv=await ownView(cb);hs=await post('move',{...cb,version:bv.version},{move:{pass:true},...feat});assert.equal(hs.status,200);assert.equal(hs.game.players[0].marks,undefined);
// Seed an imminent ending in the authoritative database, never in a client projection.
const hr=sql.prepare('SELECT state FROM rooms WHERE code = ?').get(ca.code),authoritative=JSON.parse(hr.state);
const {BOARD:officialBoard}=await import('../public/game/engine.js');officialBoard.forEach((color,i)=>{if(color==='g'||color==='y')authoritative.game.players[0].marks[i]=true;});
sql.prepare('UPDATE rooms SET state = ? WHERE code = ?').run(JSON.stringify(authoritative),ca.code);
hs=await ownView(cb);hs=await post('roll',{...cb,version:hs.version},feat);hs=await post('move',{...cb,version:hs.version},{move:{pass:true},...feat});assert.equal(hs.game.status,'playing');assert.equal(hs.game.players[0].marks,undefined);
hs=await post('move',{...ca,version:hs.version},{move:{pass:true},...feat});assert.equal(hs.game.status,'finished');assert(hs.game.players.every(p=>p.marks.length===105));
bv=await ownView(cb);assert(bv.game.players.every(p=>p.marks.length===105));assert.equal(bv.game.announcements.length,2);
console.log('Verdeckter Spielraum: Hostoption, Versionsschutz, eigenes Blatt je Token, kein fremder Inhalt in GET/POST, gemeinsame Auflösung am Spielende OK.');

const newFeatures={features:['hidden-scores-v1','boards-v1','reactions-v1']};
// Room names are host-owned metadata. Neither the code nor a running game changes.
assert.equal(a.roomName,''); // creation by an older client without the optional field
const namedHost=await post('create',{}, {name:'Name Host',roomName:'  Unsere\n  Sonntagsrunde 🦆  ',...newFeatures});
assert.equal(namedHost.status,200);assert.equal(namedHost.roomName,'Unsere Sonntagsrunde 🦆');
const namedGuest=await post('join',{code:namedHost.code},{name:'Name Guest',roomName:'Cannot override',...newFeatures});
assert.equal(namedGuest.roomName,namedHost.roomName);
const namedSessions=[namedHost,namedGuest].map(c=>({code:namedHost.code,token:c.token}));
assert.equal((await post('rename',{...namedSessions[1],version:namedGuest.version},{roomName:'Guest edit',...newFeatures})).status,403);
assert.equal((await post('rename',{code:namedHost.code,version:namedGuest.version},{roomName:'Anonymous'})).status,403);
for(const roomName of ['x'.repeat(49),{},null])assert.equal((await post('rename',{...namedSessions[0],version:namedGuest.version},{roomName,...newFeatures})).status,400);
assert.equal((await post('create',{}, {name:'Invalid',roomName:'x'.repeat(49)})).status,400);
assert.equal((await post('create',{}, {name:'Invalid',roomName:123})).status,400);
let namedState=await post('start',{...namedSessions[0],version:namedGuest.version},newFeatures);
namedState=await post('roll',{...namedSessions[0],version:namedState.version},newFeatures);
const gameBeforeRename=structuredClone(namedState.game),versionBeforeRename=namedState.version;
const markupName='<b>Ändrew & Bea</b> 🦆';
namedState=await post('rename',{...namedSessions[0],version:versionBeforeRename},{roomName:markupName,...newFeatures});
assert.equal(namedState.status,200);assert.equal(namedState.roomName,markupName);assert.equal(namedState.version,versionBeforeRename+1);
assert.deepEqual(namedState.game,gameBeforeRename);
const namedGuestView=await request(origin+'/api/rooms?code='+namedHost.code,{headers:{'X-Player-Token':namedGuest.token,'X-Farbfeld-Features':newFeatures.features.join(',')}});
assert.equal((await namedGuestView.json()).roomName,markupName);
assert.equal((await post('rename',{...namedSessions[0],version:versionBeforeRename},{roomName:'Stale',...newFeatures})).status,409);
namedState=await post('move',{...namedSessions[0],version:namedState.version},{move:findMove(namedState.game,0)||{pass:true},...newFeatures});
assert.equal(namedState.status,200);assert.equal(namedState.roomName,markupName);
namedState=await post('rename',{...namedSessions[0],version:namedState.version},{roomName:'   ',...newFeatures});
assert.equal(namedState.roomName,'');
// Read a pre-feature database record and keep the fallback backward-compatible.
const legacy=JSON.parse(sql.prepare('SELECT state FROM rooms WHERE code = ?').get(namedHost.code).state);delete legacy.roomName;
sql.prepare('UPDATE rooms SET state = ? WHERE code = ?').run(JSON.stringify(legacy),namedHost.code);
const legacyView=await request(origin+'/api/rooms?code='+namedHost.code,{headers:{'X-Player-Token':namedHost.token,'X-Farbfeld-Features':newFeatures.features.join(',')}});
assert.equal((await legacyView.json()).roomName,'');
console.log('Raumname: optionale Erstellung, Normalisierung, Hostrecht, Längen-/Typprüfung, Legacy-Räume, GET-Synchronisierung, Versionsschutz und unveränderte Würfel/Züge OK.');

// A rematch returns to the same lobby, where board choice is available again.
const rematchHost=await post('create',{}, {name:'Rematch Host',roomName:'Noch eine Runde',...newFeatures});
const rematchGuest=await post('join',{code:rematchHost.code},{name:'Rematch Guest'});
const rematchSessions=[rematchHost,rematchGuest].map(c=>({code:rematchHost.code,token:c.token}));
assert.equal(rematchGuest.supportsBoards,false);assert.deepEqual(rematchGuest.boardUpdateNeeded,['Rematch Guest']);
assert.equal((await post('options',{...rematchSessions[0],version:rematchGuest.version},{boardId:'river',...newFeatures})).status,409);
let rematchState=await post('hello',rematchSessions[1],newFeatures);
assert.equal(rematchState.supportsBoards,true);assert.deepEqual(rematchState.boardUpdateNeeded,[]);
rematchState=await post('start',{...rematchSessions[0],version:rematchState.version},newFeatures);
const rematchRecord=JSON.parse(sql.prepare('SELECT state FROM rooms WHERE code = ?').get(rematchHost.code).state);
rematchRecord.game.status='finished';rematchRecord.game.phase='finished';
sql.prepare('UPDATE rooms SET state = ? WHERE code = ?').run(JSON.stringify(rematchRecord),rematchHost.code);
assert.equal((await post('rematch',{...rematchSessions[1],version:rematchState.version},newFeatures)).status,403);
rematchState=await post('rematch',{...rematchSessions[0],version:rematchState.version},newFeatures);
assert.equal(rematchState.game,null);assert.equal(rematchState.roomName,'Noch eine Runde');assert.equal(rematchState.members.length,2);
rematchState=await post('options',{...rematchSessions[0],version:rematchState.version},{boardId:'mosaic',...newFeatures});
assert.equal(rematchState.status,200);assert.equal(rematchState.boardId,'mosaic');
rematchState=await post('start',{...rematchSessions[0],version:rematchState.version},newFeatures);
assert.equal(rematchState.status,200);assert.equal(rematchState.game.boardId,'mosaic');assert.equal(rematchState.roomName,'Noch eine Runde');
assert.equal((await post('remove',{...rematchSessions[0],version:rematchState.version},{memberId:rematchGuest.playerId,...newFeatures})).status,409);
rematchState=await post('abort',{...rematchSessions[0],version:rematchState.version},newFeatures);
assert.equal((await post('remove',{...rematchSessions[1],version:rematchState.version},{memberId:rematchHost.playerId,...newFeatures})).status,403);
assert.equal((await post('remove',{...rematchSessions[0],version:rematchState.version},{memberId:rematchHost.playerId,...newFeatures})).status,400);
assert.equal((await post('remove',{...rematchSessions[0],version:rematchState.version},{memberId:'unknown',...newFeatures})).status,404);
const beforeRemoval=rematchState.version;
rematchState=await post('remove',{...rematchSessions[0],version:beforeRemoval},{memberId:rematchGuest.playerId,...newFeatures});
assert.equal(rematchState.status,200);assert.equal(rematchState.members.length,1);assert.equal(rematchState.roomName,'Noch eine Runde');assert.equal(rematchState.boardId,'mosaic');
assert.equal((await request(origin+'/api/rooms?code='+rematchHost.code,{headers:{'X-Player-Token':rematchGuest.token}})).status,403);
assert.equal((await post('hello',rematchSessions[1],newFeatures)).status,403);
assert.equal((await post('remove',{...rematchSessions[0],version:beforeRemoval},{memberId:rematchGuest.playerId,...newFeatures})).status,409);
assert.equal((await post('start',{...rematchSessions[0],version:rematchState.version},newFeatures)).status,400);
const rejoined=await post('join',rematchSessions[1],{name:'Rematch Guest',...newFeatures});
assert.equal(rejoined.status,200);assert.notEqual(rejoined.playerId,rematchGuest.playerId);assert.notEqual(rejoined.token,rematchGuest.token);assert.equal(rejoined.members.length,2);assert.equal(rejoined.roomName,'Noch eine Runde');
console.log('Weitere Runde: fehlendes Brett-Feature verständlich zugeordnet, nach Update/hello freigegeben, gleicher Raum/Spieler/Name und anderes Brett OK.');
console.log('Besetzung: nur Gastgeber in der Lobby, kein Selbstentfernen, laufende Partie gesperrt, alter Zugang ungültig, erneuter Beitritt mit neuem Zugang und unveränderter Raum OK.');

// Both custom boards are fixed by the host, shared by every player, and use the
// actual rule engine through complete API matches. Older clients are explicit.
for(const boardId of ['river','mosaic']){
 const created=await post('create',{}, {name:'Board Host',...newFeatures});
 const joined=await post('join',{code:created.code},{name:'Board Guest',...newFeatures});
 const sessions=[{code:created.code,token:created.token},{code:created.code,token:joined.token}];
 assert.equal((await post('options',{...sessions[1],version:joined.version},{boardId,...newFeatures})).status,403);
 assert.equal((await post('options',{...sessions[0],version:joined.version},{boardId:'arbitrary',...newFeatures})).status,400);
 let state=await post('options',{...sessions[0],version:joined.version},{boardId,...newFeatures});assert.equal(state.status,200);assert.equal(state.boardId,boardId);
 assert.equal((await post('join',{code:created.code},{name:'Old app'})).status,400);
 state=await post('start',{...sessions[0],version:state.version},newFeatures);assert.equal(state.game.boardId,boardId);
 assert.equal((await request(origin+'/api/rooms?code='+created.code,{headers:{'X-Player-Token':joined.token}})).status,409);
 let moves=0;
 while(state.game.status==='playing'&&moves<700){
  if(state.game.phase==='roll')state=await post('roll',{...sessions[state.game.active],version:state.version},newFeatures);
  const active=state.game.active;
  for(const pid of [active,1-active]){const move=findMove(state.game,pid)||{pass:true};state=await post('move',{...sessions[pid],version:state.version},{move,...newFeatures});assert.equal(state.status,200,JSON.stringify(state));assert.equal(state.game.boardId,boardId);moves++;}
 }
 assert.equal(state.game.status,'finished');
}
console.log('Neue Spielbretter: Hostwahl, Versionsschutz und zwei vollständige API-Partien bis zur Auflösung OK.');

const reactionHost=await post('create',{}, {name:'Emoji Host',...newFeatures});
const reactionGuest=await post('join',{code:reactionHost.code},{name:'Emoji Guest',...newFeatures});
const reactionThird=await post('join',{code:reactionHost.code},{name:'Emoji Third',...newFeatures});
const reactionClients=[reactionHost,reactionGuest,reactionThird].map(c=>({code:reactionHost.code,token:c.token}));
let reactionState=await post('start',{...reactionClients[0],version:reactionThird.version},newFeatures);
const gameId=reactionState.game.gameId,turnVersion=reactionState.version,beforeReaction=sql.prepare('SELECT state FROM rooms WHERE code = ?').get(reactionHost.code).state;
const reaction=(client,id,to='all',emoji='kiss',match=gameId)=>post('reaction',{...reactionClients[client],version:0},{...newFeatures,actionId:id,to,emoji,gameId:match});
const reactionsFor=async client=>{const response=await request(origin+'/api/rooms?code='+reactionHost.code,{headers:{'X-Player-Token':reactionClients[client].token,'X-Farbfeld-Features':newFeatures.features.join(',')}});assert.equal(response.status,200);return (await response.json()).reactions;};
assert.equal((await reaction(0,'emoji-target-0001',1)).status,200);
assert.equal((await reactionsFor(1)).length,1);assert.equal((await reactionsFor(2)).length,0);assert.equal((await reactionsFor(0)).length,0);
assert.equal((await reaction(0,'emoji-target-0001',1)).status,200);assert.equal((await reactionsFor(1)).length,1);
assert.equal((await reaction(0,'emoji-too-fast-002',1)).status,429);
assert.equal((await reaction(1,'emoji-self-000003',1)).status,400);
assert.equal((await reaction(1,'emoji-foreign-004',99)).status,400);
assert.equal((await reaction(1,'emoji-invalid-005','all','unlisted')).status,400);
assert.equal((await reaction(1,'emoji-old-game-006','all','kiss','old-game')).status,409);
assert.equal((await post('reaction',{code:reactionHost.code},{...newFeatures,actionId:'emoji-no-auth-007',to:'all',emoji:'poop',gameId})).status,403);
assert.equal(sql.prepare('SELECT state FROM rooms WHERE code = ?').get(reactionHost.code).state,beforeReaction);
assert.equal(sql.prepare('SELECT version FROM rooms WHERE code = ?').get(reactionHost.code).version,turnVersion);
sql.prepare('UPDATE room_reactions SET created_at = created_at - 2000 WHERE room_code = ?').run(reactionHost.code);
assert.equal((await reaction(0,'emoji-everyone-008','all','laugh')).status,200);assert.equal((await reactionsFor(1)).length,1);assert.equal((await reactionsFor(2)).length,1);
// A roll selected before the reaction still commits at the same version.
reactionState=await post('roll',{...reactionClients[0],version:turnVersion},newFeatures);assert.equal(reactionState.status,200);
sql.prepare('UPDATE room_reactions SET created_at = created_at - 86400000 WHERE room_code = ?').run(reactionHost.code);
assert.equal((await reactionsFor(1)).length,0);
console.log('Emoji-Reaktionen: gezielt/alle, Authentifizierung, Whitelist, Deduplizierung, Rate, Ablauf und unveränderte Zugversion OK.');
