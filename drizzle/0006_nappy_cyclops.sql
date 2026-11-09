CREATE TABLE `notification_room_bindings` (
	`device_id` text NOT NULL,
	`room_code` text NOT NULL,
	`player_id` text NOT NULL,
	`last_event` text,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`device_id`, `room_code`),
	FOREIGN KEY (`device_id`) REFERENCES `notification_devices`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`room_code`) REFERENCES `rooms`(`code`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `notification_bindings_room` ON `notification_room_bindings` (`room_code`);--> statement-breakpoint
CREATE TABLE `room_maintenance` (
	`id` text PRIMARY KEY NOT NULL,
	`next_run_at` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE `rooms` ADD `last_used_at` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX `rooms_cleanup` ON `rooms` (`expires_at`);