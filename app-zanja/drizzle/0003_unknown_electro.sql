CREATE TABLE `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`case_id` text NOT NULL,
	`user_id` text NOT NULL,
	`side` text NOT NULL,
	`body` text NOT NULL,
	`at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `comments_case` ON `comments` (`case_id`);--> statement-breakpoint
CREATE INDEX `comments_author` ON `comments` (`case_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `seconds` (
	`comment_id` text NOT NULL,
	`user_id` text NOT NULL,
	`at` integer NOT NULL,
	PRIMARY KEY(`comment_id`, `user_id`)
);
