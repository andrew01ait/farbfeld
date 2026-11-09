CREATE TABLE `notification_dispatches` (
	`device_id` text NOT NULL,
	`event` text NOT NULL,
	`room_code` text,
	`player_id` text,
	`endpoint_hash` text NOT NULL,
	`created_at` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`next_attempt_at` integer NOT NULL,
	`lease_until` integer DEFAULT 0 NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`state` text DEFAULT 'pending' NOT NULL,
	`delivery` text NOT NULL,
	PRIMARY KEY(`device_id`, `event`),
	FOREIGN KEY (`device_id`) REFERENCES `notification_devices`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`room_code`) REFERENCES `rooms`(`code`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `notification_dispatches_due` ON `notification_dispatches` (`state`,`next_attempt_at`,`lease_until`);--> statement-breakpoint
CREATE INDEX `notification_dispatches_device` ON `notification_dispatches` (`device_id`,`created_at`);