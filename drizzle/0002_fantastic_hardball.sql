CREATE TABLE `room_reactions` (
	`id` text NOT NULL,
	`room_code` text NOT NULL,
	`game_id` text NOT NULL,
	`sender_id` text NOT NULL,
	`target_id` text NOT NULL,
	`emoji` text NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`room_code`, `id`)
);
--> statement-breakpoint
CREATE INDEX `room_reactions_recent` ON `room_reactions` (`room_code`,`game_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `room_reactions_sender` ON `room_reactions` (`room_code`,`sender_id`,`created_at`);