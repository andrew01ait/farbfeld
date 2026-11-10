import { env,waitUntil } from 'cloudflare:workers';
import {createGame,rollGame,applyMove,score,BONUS_FEATURE,bonusFieldsEnabled,MINE_FEATURE,minesEnabled,applyMineAttack,LEAVE_FEATURE,leaveGame} from '../../../public/game/engine.js';
import {projectGame,HIDDEN_FEATURE} from '../../../public/game/game-info.js';
import {BOARD_FEATURE,RANDOM_BOARD_FEATURE,requireBoardId} from '../../../public/game/boards.js';
import {REACTION_FEATURE,REACTION_EXTRA_FEATURE,reactionFeature,REACTION_TTL,REACTION_INTERVAL,validReactionId,validateReaction} from '../../../public/game/reactions.js';
import {enqueueRoomNotices,drainPushOutbox} from '../../../lib/notifications.js';
import {roomSkipStatus,homeRoomStatus} from '../../../public/game/room-status.js';
import {noteRoomPresence,readRoomPresence} from '../../../lib/room-presence.js';
import {ROOM_RETENTION,retentionInfo,markRoomUsed,cleanupRooms} from '../../../lib/room-retention.js';
type Member={id:string;token:string;name:string;features?:string[]};
type Room={members:Member[];hostId:string;game:any;createdAt:number;lastActionAt?:number;roomName?:string;hiddenScores?:boolean;boardId?:string;bonusFields?:boolean;mines?:boolean;rematchOf?:string;lastAbort?:{by:string;gameId:string;round:number}};
type ReactionRow={id:string;sender_id:string;emoji:string;created_at:number;scale_percent:number;motion:string};
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const roomCode=()=>Array.from(crypto.getRandomValues(new Uint8Array(8)),x=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[x%32]).join('');
const cleanName=(value:unknown)=>typeof value==='string'?value.trim().slice(0,24):'';
function cleanRoomName(value:unknown){
 if(value===undefined)return '';
 if(typeof value!=='string')throw Error('Bitte gib einen gültigen Raumnamen ein.');
 const name=value.replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim();
 if(name.length>48)throw Error('Der Raumname darf höchstens 48 Zeichen lang sein.');
 return name;
}
const features=(value:any)=>[HIDDEN_FEATURE,BOARD_FEATURE,REACTION_FEATURE,REACTION_EXTRA_FEATURE,BONUS_FEATURE,RANDOM_BOARD_FEATURE,MINE_FEATURE,LEAVE_FEATURE].filter(feature=>Array.isArray(value)&&value.includes(feature));
const supports=(room:Room,feature:string)=>room.members.every(member=>member.features?.includes(feature));
const needsGameClock=(room:Room)=>room.game?.status==='playing'&&!(Number.isSafeInteger(room.lastActionAt)&&(room.lastActionAt??0)>0);
function view(room:Room,version:number,viewer:string,retention?:any){
 const skip=roomSkipStatus(room);
 return {...(retention?retentionInfo(retention):{}),...skip,canSkip:room.hostId===viewer&&skip.canSkip,members:room.members.map(({id,name})=>({id,name})),hostId:room.hostId,roomName:room.roomName||'',hiddenScores:!!room.hiddenScores,boardId:room.boardId||'classic',mines:room.mines===true,supportsLeave:room.members.every(member=>room.game?.players.find((p:any)=>p.id===member.id)?.left||member.features?.includes(LEAVE_FEATURE)),supportsMines:supports(room,MINE_FEATURE),mineUpdateNeeded:room.members.filter(member=>!member.features?.includes(MINE_FEATURE)).map(member=>member.name),bonusFields:room.bonusFields===true,supportsBonusFields:supports(room,BONUS_FEATURE),bonusUpdateNeeded:room.members.filter(member=>!member.features?.includes(BONUS_FEATURE)).map(member=>member.name),supportsHidden:supports(room,HIDDEN_FEATURE),supportsBoards:supports(room,BOARD_FEATURE),supportsRandomBoard:supports(room,RANDOM_BOARD_FEATURE),randomUpdateNeeded:room.members.filter(member=>!member.features?.includes(RANDOM_BOARD_FEATURE)).map(member=>member.name),boardUpdateNeeded:room.members.filter(member=>!member.features?.includes(BOARD_FEATURE)).map(member=>member.name),game:projectGame(room.game,room.game?.players.findIndex((p:any)=>p.id===viewer)??-1),version,lastAbort:room.lastAbort};
}
function clientError(room:Room,clientFeatures:string[]){
 if(room.game?.players.some((p:any)=>p.left)&&!clientFeatures.includes(LEAVE_FEATURE))return 'Diese Partie benötigt Farbfeld 1.17.0 oder neuer. Bitte aktualisieren.';
 if(minesEnabled(room.game)&&!clientFeatures.includes(MINE_FEATURE))return 'Diese Minenpartie benötigt Farbfeld 1.17.0 oder neuer. Bitte aktualisieren.';
 if(room.game?.boardId==='random'&&!clientFeatures.includes(RANDOM_BOARD_FEATURE))return 'Dieses Zufallsbrett benötigt Farbfeld 1.17.0 oder neuer. Bitte aktualisieren.';
 if(bonusFieldsEnabled(room.game)&&!clientFeatures.includes(BONUS_FEATURE))return 'Diese Bonuspartie benötigt Farbfeld 1.17.0 oder neuer. Bitte aktualisieren.';
 if(room.game?.boardId&&room.game.boardId!=='classic'&&!clientFeatures.includes(BOARD_FEATURE))return 'Dieses Spielbrett benötigt Farbfeld 1.6.0 oder neuer. Bitte aktualisieren.';
 if(room.game?.hiddenScores&&room.game.status!=='finished'&&!clientFeatures.includes(HIDDEN_FEATURE))return 'Diese Partie spielt verdeckt. Bitte Farbfeld auf Version 1.5.0 oder neuer aktualisieren.';
 return null;
}
async function recentReactions(code:string,room:Room,viewer:string){
 if(!room.game)return [];
 const rows=await env.DB!.prepare('SELECT id,sender_id,emoji,created_at,scale_percent,motion FROM (SELECT id,sender_id,emoji,created_at,scale_percent,motion,ROW_NUMBER() OVER (PARTITION BY sender_id ORDER BY created_at DESC,id DESC) AS recipient_rank FROM room_reactions WHERE room_code = ? AND game_id = ? AND created_at > ? AND sender_id != ? AND (target_id = ? OR target_id = ?)) WHERE recipient_rank = 1 ORDER BY created_at,id LIMIT 5').bind(code,room.game.gameId,Date.now()-REACTION_TTL,viewer,viewer,'all').all<ReactionRow>();
 return rows.results.map(event=>({id:event.id,senderId:event.sender_id,emoji:event.emoji,scale:event.scale_percent/100,motion:event.motion,name:room.members.find(m=>m.id===event.sender_id)?.name||'Mitspieler',at:event.created_at}));
}
export async function GET(req:Request){
 try{
  const url=new URL(req.url),code=(url.searchParams.get('code')??'').toUpperCase();
  const featureHeader=req.headers.get('X-Farbfeld-Features'),clientFeatures=features(featureHeader?.split(','));
  // Every current client poll renews its own registration. Legacy rooms must
  // not depend on a one-time hello after installation or app updates.
  for(let attempt=0;attempt<3;attempt++){
   // A cleanup deadline never hides a row that is still stored.
   const row=await env.DB!.prepare('SELECT state,version,last_used_at,expires_at FROM rooms WHERE code = ?').bind(code).first<{state:string;version:number;last_used_at:number;expires_at:number}>();
   if(!row)return json({error:'Dieser Raum existiert nicht mehr.'},404);
   const room:Room=JSON.parse(row.state),me=room.members.find(m=>m.token===req.headers.get('X-Player-Token'));
   if(!me)return json({error:'Bitte tritt dem Raum zuerst bei.'},403);
   const needsClock=needsGameClock(room);
   if(needsClock||featureHeader!==null&&JSON.stringify(clientFeatures)!==JSON.stringify(me.features||[])){
    if(featureHeader!==null)me.features=clientFeatures;
    if(needsClock)room.lastActionAt=Date.now();
    const updated=await env.DB!.prepare('UPDATE rooms SET state = ?, version = version + 1 WHERE code = ? AND version = ?').bind(JSON.stringify(room),code,row.version).run();
    if(!updated.meta.changes)continue;
    row.version++;
   }
   const error=clientError(room,clientFeatures);if(error)return json({error},409);
   await noteRoomPresence(env.DB!,code,me.id);
   const presence=await readRoomPresence(env.DB!,code,room.members);
   return json({...view(room,row.version,me.id,row),presence,...(clientFeatures.includes(REACTION_FEATURE)?{reactions:await recentReactions(code,room,me.id)}:{})});
  }
  return json({error:'Der Spielraum hat sich gleichzeitig geändert. Bitte kurz warten und erneut prüfen.'},409);
 }catch{return json({error:'Der Spielraum ist gerade nicht erreichbar. Bitte versuche es erneut.'},503);}
}
async function sendReaction(code:string,room:Room,version:number,me:Member,body:any){
 if(!features(body.features).includes(REACTION_FEATURE))return json({error:'Für Reaktionen bitte Farbfeld aktualisieren.'},409);
 if(!room.game||body.gameId!==room.game.gameId||!validReactionId(body.actionId))return json({error:'Diese Reaktion gehört nicht zur aktuellen Partie.'},409);
 const from=room.members.findIndex(m=>m.id===me.id),value=validateReaction(body,room.members,from),target=value.to==='all'?'all':room.members[value.to].id;
 const recipients=room.members.filter((m,i)=>i!==from&&(value.to==='all'||i===value.to));
 if(recipients.some(m=>!m.features?.includes(reactionFeature(value.emoji))))return json({error:'Für diese Reaktion bitte die Empfänger-Apps aktualisieren'+(reactionFeature(value.emoji)===REACTION_EXTRA_FEATURE?' (mindestens Version 1.12.0).':'.')},409);
 const existing=await env.DB!.prepare('SELECT sender_id FROM room_reactions WHERE room_code = ? AND id = ?').bind(code,body.actionId).first<{sender_id:string}>();
 if(existing)return existing.sender_id===me.id?json({...view(room,version,me.id),reactionAck:body.actionId}):json({error:'Diese Reaktion ist bereits vergeben.'},409);
 const now=Date.now();
 const inserted=await env.DB!.batch([
  env.DB!.prepare('DELETE FROM room_reactions WHERE created_at <= ?').bind(now-REACTION_TTL),
  env.DB!.prepare('INSERT OR IGNORE INTO room_reactions (id,room_code,game_id,sender_id,target_id,emoji,created_at,scale_percent,motion) SELECT ?,?,?,?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM rooms WHERE code = ? AND json_extract(state, \'$.game.gameId\') = ?) AND NOT EXISTS (SELECT 1 FROM room_reactions WHERE room_code = ? AND sender_id = ? AND created_at > ?)').bind(body.actionId,code,room.game.gameId,me.id,target,value.emoji,now,Math.round(value.scale*100),value.motion,code,body.gameId,code,me.id,now-REACTION_INTERVAL),
  env.DB!.prepare('UPDATE rooms SET last_used_at = ?, expires_at = ? WHERE code = ? AND EXISTS (SELECT 1 FROM room_reactions WHERE room_code = ? AND id = ? AND sender_id = ?)').bind(now,now+ROOM_RETENTION,code,code,body.actionId,me.id),
 ]);
 if(!inserted[1].meta.changes){
  const duplicate=await env.DB!.prepare('SELECT sender_id FROM room_reactions WHERE room_code = ? AND id = ?').bind(code,body.actionId).first<{sender_id:string}>();
  if(duplicate?.sender_id!==me.id){const current=await env.DB!.prepare('SELECT state FROM rooms WHERE code = ?').bind(code).first<{state:string}>();if(!current)return json({error:'Dieser Raum wurde inzwischen bereinigt.'},404);if(JSON.parse(current.state).game?.gameId!==body.gameId)return json({error:'Diese Reaktion gehört nicht mehr zur aktuellen Partie.'},409);return json({error:'Einen kurzen Moment bis zur nächsten Reaktion warten.'},429);}
 }
 // Reactions count as use, without changing the turn/skip clock.
 const used=inserted[2].meta.changes?{last_used_at:now,expires_at:now+ROOM_RETENTION}:undefined;
 return json({...view(room,version,me.id,used),reactionAck:body.actionId});
}
export async function POST(req:Request){
 try{
  const origin=req.headers.get('Origin');if(origin&&origin!==new URL(req.url).origin)return json({error:'Ungültige Anfrage.'},403);
  const raw=await req.text();if(raw.length>12000)return json({error:'Anfrage zu groß.'},413);
  const body=JSON.parse(raw),action=body.action,token=req.headers.get('X-Player-Token'),clientFeatures=features(body.features);
  if(action==='index'){
   if(!Array.isArray(body.rooms)||body.rooms.length>50)return json({error:'Bitte höchstens 50 gespeicherte Räume prüfen.'},400);
   const sessions=body.rooms;
   if(sessions.some((m:any)=>!m||typeof m.code!=='string'||!/^[A-Z2-9]{8}$/.test(m.code)||typeof m.token!=='string'||!m.token||m.token.length>128)||new Set(sessions.map((m:any)=>m.code)).size!==sessions.length)return json({error:'Ungültige Raumzugänge.'},400);
   if(!sessions.length)return json({rooms:[]});
   const rows=await env.DB!.prepare('SELECT code,state,version,last_used_at,expires_at FROM rooms WHERE code IN ('+sessions.map(()=>'?').join(',')+')').bind(...sessions.map((m:any)=>m.code)).all<any>();
   const found=new Map(rows.results.map((row:any)=>[row.code,row]));
   const summaries=sessions.map((session:any)=>{
    const row:any=found.get(session.code);if(!row)return {code:session.code,access:'missing'};
    const room:Room=JSON.parse(row.state),pid=room.members.findIndex(m=>m.token===session.token);if(pid<0)return {code:session.code,access:'denied'};
    const game=room.game,ended=game?.status==='finished';
    return {code:session.code,access:'ok',roomName:room.roomName||'',memberCount:room.members.length,participants:room.members.map(m=>({name:m.name,host:m.id===room.hostId})),gameStatus:game?.status||'lobby',round:game?.round||null,version:row.version,turn:homeRoomStatus(game,room.members[pid].id),noticeEvent:game&&(ended||homeRoomStatus(game,room.members[pid].id).kind==='turn')?(ended?game.gameId+':finished':game.gameId+':'+game.round+':turn'):null,...retentionInfo(row),...(ended?{result:{id:game.gameId,date:new Date().toISOString(),mode:'room',players:game.players.map((p:any)=>({name:p.name,total:score(p,game).total,jokers:p.jokers,...(p.left?{left:true}:{})})),score:score(game.players[pid],game).total,ownPid:pid,rounds:game.round,boardId:game.boardId||'classic'}}:{})};
   });
   const active=sessions.find((session:any)=>session.code===body.activeCode),activeRow:any=active&&found.get(active.code);let reactionView:any={};
   if(activeRow){const activeRoom:Room=JSON.parse(activeRow.state),member=activeRoom.members.find(m=>m.token===active.token);if(member)reactionView={reactionRoom:active.code,reactionPlayerId:member.id,reactionGameId:activeRoom.game?.gameId||'',reactions:await recentReactions(active.code,activeRoom,member.id)};}
   return json({rooms:summaries,...reactionView});
  }
  if(action==='create'){
   const name=cleanName(body.name);if(!name)return json({error:'Wie heißt du?'},400);
   const boardId=requireBoardId(body.boardId);if(boardId!=='classic'&&!clientFeatures.includes(BOARD_FEATURE))return json({error:'Dieses Spielbrett benötigt Farbfeld 1.6.0.'},409);
   if(body.mines===true&&!clientFeatures.includes(MINE_FEATURE))return json({error:'Minen benötigen Farbfeld 1.17.0 oder neuer.'},409);
   if(body.bonusFields===true&&!clientFeatures.includes(BONUS_FEATURE))return json({error:'Bonusfelder benötigen Farbfeld 1.17.0 oder neuer.'},409);
   if(boardId==='random'&&!clientFeatures.includes(RANDOM_BOARD_FEATURE))return json({error:'Random benötigt Farbfeld 1.17.0 oder neuer.'},409);
   const member={id:crypto.randomUUID(),token:crypto.randomUUID(),name,features:clientFeatures};
   const room:Room={members:[member],hostId:member.id,game:null,createdAt:Date.now(),roomName:cleanRoomName(body.roomName),hiddenScores:body.hiddenScores===true,boardId,bonusFields:body.bonusFields===true,mines:body.mines===true};
   for(let tries=0;tries<3;tries++){
    const now=Date.now(),code=roomCode(),result=await env.DB!.prepare('INSERT OR IGNORE INTO rooms (code,state,version,expires_at,last_used_at) VALUES (?,?,1,?,?)').bind(code,JSON.stringify(room),now+ROOM_RETENTION,now).run();
    if(result.meta.changes){waitUntil(cleanupRooms(env.DB!,{excludeCode:code}).catch(()=>{}));return json({...view(room,1,member.id,{last_used_at:now,expires_at:now+ROOM_RETENTION}),code,token:member.token,playerId:member.id});}
   }
   return json({error:'Bitte versuche es erneut.'},503);
  }
  const code=String(body.code??'').toUpperCase().replaceAll(/[^A-Z0-9]/g,'');
  const row=await env.DB!.prepare('SELECT state,version,last_used_at,expires_at FROM rooms WHERE code = ?').bind(code).first<{state:string;version:number;last_used_at:number;expires_at:number}>();
  if(!row)return json({error:'Raum nicht gefunden. Bitte prüfe den Code.'},404);
  const room:Room=JSON.parse(row.state),previousGame=room.game;let me=room.members.find(m=>m.token===token),extra={};
  const error=clientError(room,clientFeatures);if(error)return json({error},409);
  if(action==='join'){
   if(me){const used=await markRoomUsed(env.DB!,code);waitUntil(cleanupRooms(env.DB!,{excludeCode:code}).catch(()=>{}));await noteRoomPresence(env.DB!,code,me.id);return json({...view(room,row.version,me.id,used),code,token:me.token,playerId:me.id});}
   if(room.game)return json({error:'Die Partie hat schon begonnen.'},409);
   if(room.members.length>=6)return json({error:'Dieser Raum ist mit 6 Personen voll.'},409);
   if(room.boardId==='random'&&!clientFeatures.includes(RANDOM_BOARD_FEATURE))return json({error:'Dieser Raum nutzt Random. Bitte Farbfeld auf Version 1.17.0 oder neuer aktualisieren.'},409);
   if(room.mines&&!clientFeatures.includes(MINE_FEATURE))return json({error:'Dieser Raum spielt mit Minen. Bitte Farbfeld 1.17.0 oder neuer öffnen.'},409);
   if(room.bonusFields&&!clientFeatures.includes(BONUS_FEATURE))return json({error:'Dieser Raum spielt mit Bonusfeldern. Bitte Farbfeld auf Version 1.17.0 oder neuer aktualisieren.'},409);
   if(room.hiddenScores&&!clientFeatures.includes(HIDDEN_FEATURE))return json({error:'Dieser Raum spielt verdeckt. Bitte Farbfeld auf Version 1.5.0 oder neuer aktualisieren.'},400);
   if(room.boardId&&room.boardId!=='classic'&&!clientFeatures.includes(BOARD_FEATURE))return json({error:'Dieses Spielbrett benötigt Farbfeld 1.6.0 oder neuer.'},400);
   const name=cleanName(body.name);if(!name)return json({error:'Bitte gib deinen Namen ein.'},400);
   me={id:crypto.randomUUID(),token:crypto.randomUUID(),name,features:clientFeatures};room.members.push(me);extra={code,token:me.token,playerId:me.id};
  }else if(action==='hello'||action==='open'){
   if(!me)return json({error:'Dein Zugang zum Raum fehlt.'},403);
   if(JSON.stringify(clientFeatures)===JSON.stringify(me.features||[])&&!needsGameClock(room)){const used=await markRoomUsed(env.DB!,code);waitUntil(cleanupRooms(env.DB!,{excludeCode:code}).catch(()=>{}));await noteRoomPresence(env.DB!,code,me.id);return json({...view(room,row.version,me.id,used),...(action==='open'?{presence:await readRoomPresence(env.DB!,code,room.members),reactions:clientFeatures.includes(REACTION_FEATURE)?await recentReactions(code,room,me.id):[]}:{})});}
   me.features=clientFeatures;
   if(needsGameClock(room))room.lastActionAt=Date.now();
  }else{
   if(!me)return json({error:'Dein Zugang zum Raum fehlt.'},403);
   if(action==='reaction')return await sendReaction(code,room,row.version,me,body);
   if(body.version!==row.version)return json({error:'Der Spielstand hat sich geändert. Bitte versuche es erneut.'},409);
   if(action==='rename'){
    if(me.id!==room.hostId)return json({error:'Nur der Gastgeber kann den Raumnamen ändern.'},403);
    if(!('roomName'in body))return json({error:'Bitte gib einen Raumnamen ein oder lasse ihn leer.'},400);
    room.roomName=cleanRoomName(body.roomName);
   }else if(action==='remove'){
    if(me.id!==room.hostId)return json({error:'Nur der Gastgeber kann Personen entfernen.'},403);
    if(room.game)return json({error:'Personen können vor dem Start oder zwischen zwei Partien entfernt werden. Nach Spielende zuerst „Noch einmal spielen“ wählen.'},409);
    if(body.memberId===room.hostId)return json({error:'Der Gastgeber bleibt im Raum.'},400);
    if(!room.members.some(member=>member.id===body.memberId))return json({error:'Diese Person ist nicht mehr im Raum.'},404);
    room.members=room.members.filter(member=>member.id!==body.memberId);
   }else if(action==='start'){
    if(me.id!==room.hostId)return json({error:'Nur der Gastgeber kann starten.'},403);
    if(room.game)return json({error:'Die Partie läuft bereits.'},409);
    if(room.members.length<2)return json({error:'Warte auf mindestens eine weitere Person.'},400);
    if(room.hiddenScores&&!supports(room,HIDDEN_FEATURE))return json({error:'Für verdeckte Punkte müssen alle Handys Version 1.5.0 oder neuer öffnen.'},409);
    if(room.boardId&&room.boardId!=='classic'&&!supports(room,BOARD_FEATURE))return json({error:'Für dieses Spielbrett müssen alle Handys Version 1.6.0 oder neuer öffnen.'},409);
    if(room.boardId==='random'&&(!clientFeatures.includes(RANDOM_BOARD_FEATURE)||!supports(room,RANDOM_BOARD_FEATURE)))return json({error:'Für Random müssen alle Handys Version 1.17.0 oder neuer öffnen.'},409);
    if(room.mines&&(!clientFeatures.includes(MINE_FEATURE)||!supports(room,MINE_FEATURE)))return json({error:'Für Minen müssen alle Handys Version 1.17.0 oder neuer öffnen.'},409);
    if(room.bonusFields&&(!clientFeatures.includes(BONUS_FEATURE)||!supports(room,BONUS_FEATURE)))return json({error:'Für Bonusfelder müssen alle Handys Version 1.17.0 oder neuer öffnen.'},409);
    room.game=createGame(room.members.map(m=>m.name),'room',room.members.map(m=>m.id),{hiddenScores:!!room.hiddenScores,boardId:requireBoardId(room.boardId),bonusFields:room.bonusFields===true,mines:room.mines===true});room.game.gameId=crypto.randomUUID();
    if(room.rematchOf){room.game.rematchOf=room.rematchOf;room.game.rematchBy=me.id;delete room.rematchOf;}
    room.lastActionAt=Date.now();delete room.lastAbort;
   }else if(action==='options'){
    if(me.id!==room.hostId)return json({error:'Nur der Gastgeber kann die Spielart wählen.'},403);
    if(room.game)return json({error:'Die Spielart steht während der Partie fest.'},409);
    if(body.hiddenScores===true&&!supports(room,HIDDEN_FEATURE))return json({error:'Für verdeckte Punkte müssen alle Handys Version 1.5.0 oder neuer öffnen.'},409);
    if('mines'in body){if(typeof body.mines!=='boolean')return json({error:'Bitte Minen ein- oder ausschalten.'},400);if(body.mines&&(!clientFeatures.includes(MINE_FEATURE)||!supports(room,MINE_FEATURE)))return json({error:'Für Minen müssen alle Handys Version 1.17.0 oder neuer öffnen.'},409);room.mines=body.mines;}
    if('bonusFields'in body){if(typeof body.bonusFields!=='boolean')return json({error:'Bitte Bonusfelder ein- oder ausschalten.'},400);if(body.bonusFields&&(!clientFeatures.includes(BONUS_FEATURE)||!supports(room,BONUS_FEATURE)))return json({error:'Für Bonusfelder müssen alle Handys Version 1.17.0 oder neuer öffnen.'},409);room.bonusFields=body.bonusFields;}
    if('hiddenScores'in body)room.hiddenScores=body.hiddenScores===true;
    if('boardId'in body){const boardId=requireBoardId(body.boardId);if(boardId==='random'&&(!clientFeatures.includes(RANDOM_BOARD_FEATURE)||!supports(room,RANDOM_BOARD_FEATURE)))return json({error:'Für Random müssen alle Handys Version 1.17.0 oder neuer öffnen.'},409);if(boardId!=='classic'&&!supports(room,BOARD_FEATURE))return json({error:'Für dieses Spielbrett müssen alle Handys Version 1.6.0 oder neuer öffnen.'},409);room.boardId=boardId;}
   }else if(action==='abort'){
    if(room.game?.status!=='playing')return json({error:'Es läuft keine Partie mehr.'},409);
    room.lastAbort={by:me.name,gameId:room.game.gameId,round:room.game.round};room.game=null;delete room.lastActionAt;
   }else if(action==='roll'){
    if(!room.game||room.game.players[room.game.active].id!==me.id)return json({error:'Die aktive Person würfelt.'},403);
    room.game=rollGame(room.game);room.lastActionAt=Date.now();
   }else if(action==='leave'){
    if(!room.game||body.gameId!==room.game.gameId)return json({error:'Diese Partie wurde inzwischen beendet oder ersetzt.'},409);
    if(!clientFeatures.includes(LEAVE_FEATURE)||room.members.some(member=>!room.game.players.find((p:any)=>p.id===member.id)?.left&&!member.features?.includes(LEAVE_FEATURE)))return json({error:'Zum gemeinsamen Verlassen müssen alle aktiven Apps Version 1.17.0 oder neuer öffnen.'},409);
    room.game=leaveGame(room.game,room.game.players.findIndex((p:any)=>p.id===me!.id));room.lastActionAt=Date.now();
    if(room.hostId===me.id){const successor=room.game.players.find((p:any)=>!p.left);if(successor)room.hostId=successor.id;}
   }else if(action==='mine'){
    if(!room.game||body.gameId!==room.game.gameId||body.round!==room.game.round)return json({error:'Dieser Minenangriff gehört nicht mehr zur aktuellen Spielsituation.'},409);
    room.game=applyMineAttack(room.game,room.game.players.findIndex((p:any)=>p.id===me!.id),body.target);room.lastActionAt=Date.now();
   }else if(action==='move'){
    if(!room.game)return json({error:'Das Spiel hat noch nicht begonnen.'},400);
    room.game=applyMove(room.game,room.game.players.findIndex((p:any)=>p.id===me!.id),body.move);room.lastActionAt=Date.now();
   }else if(action==='skip'){
    if(!room.game||me.id!==room.hostId)return json({error:'Nur der Gastgeber kann eine Person überspringen.'},403);
    if(!roomSkipStatus(room).canSkip)return json({error:'Überspringen ist erst nach 24 Stunden ohne Spielaktion möglich.'},409);
    room.game=applyMove(room.game,Number(body.pid),{pass:true});room.lastActionAt=Date.now();
   }else if(action==='rematch'){
    if(me.id!==room.hostId||room.game?.status!=='finished')return json({error:'Eine neue Partie kann der Gastgeber nach Spielende starten.'},403);
    room.rematchOf=room.game.gameId;room.members=room.members.filter(member=>!room.game.players.find((p:any)=>p.id===member.id)?.left);
    room.game=null;delete room.lastActionAt;
   }else return json({error:'Unbekannte Aktion.'},400);
  }
  const now=Date.now();
  const result=await env.DB!.prepare('UPDATE rooms SET state = ?, version = version + 1, last_used_at = ?, expires_at = ? WHERE code = ? AND version = ?').bind(JSON.stringify(room),now,now+ROOM_RETENTION,code,row.version).run();
  if(!result.meta.changes)return json({error:'Gleichzeitiger Zug. Bitte versuche es erneut.'},409);
  if(['open','hello','join'].includes(action))waitUntil(cleanupRooms(env.DB!,{excludeCode:code}).catch(()=>{}));
  await noteRoomPresence(env.DB!,code,me!.id);
  if(['start','roll','move','skip','leave'].includes(action)){
   try{await enqueueRoomNotices(env,code,previousGame,room.game);waitUntil(drainPushOutbox(env).catch(()=>console.error('Farbfeld push queue processing failed')));}
   catch{console.error('Farbfeld push queue persistence failed');}
  }
  return json({...view(room,row.version+1,me!.id,{last_used_at:now,expires_at:now+ROOM_RETENTION}),...extra,...(action==='open'?{presence:await readRoomPresence(env.DB!,code,room.members),reactions:clientFeatures.includes(REACTION_FEATURE)?await recentReactions(code,room,me!.id):[]}:{})});
 }catch(error){return json({error:error instanceof Error&&error.message.length<200&&!/D1|SQL|binding|JSON/i.test(error.message)?error.message:'Der Spielraum ist gerade nicht erreichbar. Dein letzter bestätigter Zug bleibt erhalten.'},(error as any)?.status===404?404:400);}
}
