CREATE TABLE `seen` (
	`user_id` text PRIMARY KEY NOT NULL,
	`at` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `cases` ADD `answered` integer DEFAULT 0 NOT NULL;