CREATE TABLE `notification_devices` (
	`id` text PRIMARY KEY NOT NULL,
	`secret_hash` text NOT NULL,
	`endpoint_hash` text NOT NULL,
	`subscription` text NOT NULL,
	`enabled` integer DEFAULT 1 NOT NULL,
	`sound` integer DEFAULT 0 NOT NULL,
	`room_code` text DEFAULT '' NOT NULL,
	`player_id` text DEFAULT '' NOT NULL,
	`visible_until` integer DEFAULT 0 NOT NULL,
	`last_sent` integer DEFAULT 0 NOT NULL,
	`last_event` text,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `notification_devices_room` ON `notification_devices` (`room_code`,`enabled`);