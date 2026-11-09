import {PRESENCE_TTL,PRESENCE_WRITE_INTERVAL} from '../public/game/room-status.js';
export const PRESENCE_RETENTION=7*86400000;
// Advisory liveness is separate from the authoritative game/CAS version.
// It must never make a committed game action fail.
export async function noteRoomPresence(db,code,playerId,now=Date.now()){
 try{
  const result=await db.prepare('INSERT INTO room_presence (room_code,player_id,last_seen,expires_at) SELECT code,?,?,? FROM rooms WHERE code = ? ON CONFLICT (room_code,player_id) DO UPDATE SET last_seen = excluded.last_seen, expires_at = excluded.expires_at WHERE room_presence.last_seen <= excluded.last_seen - ?').bind(playerId,now,now+PRESENCE_RETENTION,code,PRESENCE_WRITE_INTERVAL).run();
  if(result.meta.changes)await db.prepare('DELETE FROM room_presence WHERE expires_at <= ?').bind(now).run();
  return true;
 }catch{return false;}
}
export async function readRoomPresence(db,code,members,now=Date.now()){
 try{
  const rows=await db.prepare('SELECT player_id,last_seen FROM room_presence WHERE room_code = ? AND expires_at > ?').bind(code,now).all();
  const seen=new Map(rows.results.map(row=>[row.player_id,row.last_seen]));
  return Object.fromEntries(members.map(member=>[member.id,seen.has(member.id)?now-seen.get(member.id)<PRESENCE_TTL?'online':'offline':'unknown']));
 }catch{return null;}
}
