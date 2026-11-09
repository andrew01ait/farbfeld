CREATE TABLE `direct_pairings` (
	`code` text PRIMARY KEY NOT NULL,
	`host_token` text NOT NULL,
	`offer` text NOT NULL,
	`answer` text,
	`join_token` text,
	`expires_at` integer NOT NULL
);
