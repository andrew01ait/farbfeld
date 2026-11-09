import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
export const rooms = sqliteTable("rooms", {
  code: text("code").primaryKey(),
  state: text("state").notNull(),
  version: integer("version").notNull().default(1),
  // Cleanup eligibility only: retained rows remain readable until actual deletion.
  expiresAt: integer("expires_at").notNull(),
  lastUsedAt: integer("last_used_at").notNull().default(0),
}, table => [index("rooms_cleanup").on(table.expiresAt)]);
export const directPairings = sqliteTable("direct_pairings", {
  code: text("code").primaryKey(),
  hostToken: text("host_token").notNull(),
  offer: text("offer").notNull(),
  answer: text("answer"),
  joinToken: text("join_token"),
  expiresAt: integer("expires_at").notNull(),
});
export const roomReactions = sqliteTable("room_reactions", {
  id: text("id").notNull(),
  roomCode: text("room_code").notNull(),
  gameId: text("game_id").notNull(),
  senderId: text("sender_id").notNull(),
  targetId: text("target_id").notNull(),
  emoji: text("emoji").notNull(),
  scalePercent: integer("scale_percent").notNull().default(100),
  motion: text("motion").notNull().default('fly'),
  createdAt: integer("created_at").notNull(),
}, table => [
  primaryKey({columns:[table.roomCode,table.id]}),
  index("room_reactions_recent").on(table.roomCode,table.gameId,table.createdAt),
  index("room_reactions_sender").on(table.roomCode,table.senderId,table.createdAt),
]);
export const notificationDevices = sqliteTable("notification_devices", {
  id: text("id").primaryKey(),
  secretHash: text("secret_hash").notNull(),
  endpointHash: text("endpoint_hash").notNull(),
  subscription: text("subscription").notNull(),
  enabled: integer("enabled").notNull().default(1),
  sound: integer("sound").notNull().default(0),
  rematchReady: integer("rematch_ready").notNull().default(0),
  roomCode: text("room_code").notNull().default(''),
  playerId: text("player_id").notNull().default(''),
  visibleUntil: integer("visible_until").notNull().default(0),
  lastSent: integer("last_sent").notNull().default(0),
  lastEvent: text("last_event"),
  // Latest transport result and device receipt only; no subscription or payload.
  delivery: text("delivery"),
  updatedAt: integer("updated_at").notNull(),
}, table => [
  index("notification_devices_room").on(table.roomCode,table.enabled),
]);

export const roomPresence = sqliteTable("room_presence", {
  roomCode: text("room_code").notNull().references(() => rooms.code, {onDelete:"cascade"}),
  playerId: text("player_id").notNull(),
  lastSeen: integer("last_seen").notNull(),
  expiresAt: integer("expires_at").notNull(),
}, table => [
  primaryKey({columns:[table.roomCode,table.playerId]}),
  index("room_presence_expiry").on(table.expiresAt),
]);

export const roomMaintenance = sqliteTable("room_maintenance", {
  id: text("id").primaryKey(),
  nextRunAt: integer("next_run_at").notNull().default(0),
});
export const notificationRoomBindings = sqliteTable("notification_room_bindings", {
  deviceId: text("device_id").notNull().references(() => notificationDevices.id, {onDelete:"cascade"}),
  roomCode: text("room_code").notNull().references(() => rooms.code, {onDelete:"cascade"}),
  playerId: text("player_id").notNull(),
  lastEvent: text("last_event"),
  updatedAt: integer("updated_at").notNull(),
}, table => [primaryKey({columns:[table.deviceId,table.roomCode]}),index("notification_bindings_room").on(table.roomCode)]);

// Durable, bounded delivery history and pending sends. Never store push payloads
// or subscription secrets here. Device/room removal cancels queued work.
export const notificationDispatches = sqliteTable("notification_dispatches", {
  deviceId: text("device_id").notNull().references(() => notificationDevices.id, {onDelete:"cascade"}),
  event: text("event").notNull(),
  roomCode: text("room_code").references(() => rooms.code, {onDelete:"cascade"}),
  playerId: text("player_id"),
  endpointHash: text("endpoint_hash").notNull(),
  createdAt: integer("created_at").notNull(),
  expiresAt: integer("expires_at").notNull(),
  nextAttemptAt: integer("next_attempt_at").notNull(),
  leaseUntil: integer("lease_until").notNull().default(0),
  attempts: integer("attempts").notNull().default(0),
  state: text("state").notNull().default('pending'),
  delivery: text("delivery").notNull(),
}, table => [
  primaryKey({columns:[table.deviceId,table.event]}),
  index("notification_dispatches_due").on(table.state,table.nextAttemptAt,table.leaseUntil),
  index("notification_dispatches_device").on(table.deviceId,table.createdAt),
]);
