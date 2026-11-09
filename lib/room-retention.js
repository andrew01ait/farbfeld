export const ROOM_RETENTION=14*86400000;
export const CLEANUP_INTERVAL=6*3600000;
export const CLEANUP_BATCH=20;
export function retentionInfo(row,now=Date.now()){
 const used=Number(row?.last_used_at)||0,deadline=used>0?Number(row.expires_at)||0:0;
 return {lastUsedAt:used||null,cleanupAt:deadline||null,cleanupDue:deadline>0&&deadline<=now};
}
export async function markRoomUsed(db,code,now=Date.now()){
 const result=await db.prepare('UPDATE rooms SET last_used_at = ?, expires_at = ? WHERE code = ?').bind(now,now+ROOM_RETENTION,code).run();
 if(!result.meta.changes)throw Object.assign(Error('Dieser Raum wurde inzwischen bereinigt und ist nicht mehr vorhanden.'),{status:404});
 return {last_used_at:now,expires_at:now+ROOM_RETENTION};
}
// Opportunistic, globally throttled and bounded. Polling never invokes this.
// Renew the requested room before starting cleanup; retain all rows until a real
// deletion. The SQL predicate is rechecked atomically against concurrent use.
export async function cleanupRooms(db,{now=Date.now(),excludeCode=''}={}){
 await db.prepare("INSERT OR IGNORE INTO room_maintenance(id,next_run_at) VALUES('cleanup',0)").run();
 const claim=await db.prepare("UPDATE room_maintenance SET next_run_at = ? WHERE id = 'cleanup' AND next_run_at <= ?").bind(now+CLEANUP_INTERVAL,now).run();
 if(!claim.meta.changes)return 0;
 // Existing rooms get a full grace period. Do not infer last use from creation,
 // presence, old deadlines, or the separate 24-hour gameplay/skip clock.
 await db.prepare('UPDATE rooms SET last_used_at = ?, expires_at = ? WHERE code IN (SELECT code FROM rooms WHERE last_used_at = 0 ORDER BY code LIMIT 50)').bind(now,now+ROOM_RETENTION).run();
 const candidates='SELECT code FROM rooms WHERE last_used_at > 0 AND expires_at > 0 AND expires_at <= ? AND code != ? ORDER BY expires_at,code LIMIT '+CLEANUP_BATCH;
 const results=await db.batch([
  db.prepare('DELETE FROM room_reactions WHERE room_code IN ('+candidates+')').bind(now,excludeCode),
  db.prepare("UPDATE notification_devices SET room_code = '', player_id = '', last_event = NULL WHERE room_code IN ("+candidates+')').bind(now,excludeCode),
  db.prepare('DELETE FROM rooms WHERE code IN ('+candidates+')').bind(now,excludeCode),
 ]);
 // Presence and notification-room bindings use ON DELETE CASCADE.
 return Number(results.at(-1)?.meta?.changes)||0;
}
