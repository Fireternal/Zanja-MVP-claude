CREATE TABLE `users` (
	`uid` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`handle` text NOT NULL,
	`hash` text NOT NULL,
	`salt` text NOT NULL,
	`rounds` integer NOT NULL,
	`created` integer NOT NULL,
	`fails` integer DEFAULT 0 NOT NULL,
	`blocked` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_handle_unique` ON `users` (`handle`);