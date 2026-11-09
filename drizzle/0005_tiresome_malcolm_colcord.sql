ALTER TABLE `room_reactions` ADD `scale_percent` integer DEFAULT 100 NOT NULL;--> statement-breakpoint
ALTER TABLE `room_reactions` ADD `motion` text DEFAULT 'fly' NOT NULL;