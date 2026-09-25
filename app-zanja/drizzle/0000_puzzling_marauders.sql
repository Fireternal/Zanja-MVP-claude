CREATE TABLE `cases` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`q` text NOT NULL,
	`tag` text NOT NULL,
	`at` text NOT NULL,
	`a` text NOT NULL,
	`bt` text NOT NULL,
	`b` text NOT NULL,
	`emoji` text NOT NULL,
	`created` integer NOT NULL,
	`closes` integer NOT NULL,
	`status` text NOT NULL,
	`invite` text,
	`respondent` text,
	`duration` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `cases_owner` ON `cases` (`owner`);--> statement-breakpoint
CREATE INDEX `cases_status` ON `cases` (`status`);--> statement-breakpoint
CREATE TABLE `reports` (
	`case_id` text NOT NULL,
	`user_id` text NOT NULL,
	`reason` text NOT NULL,
	`at` integer NOT NULL,
	PRIMARY KEY(`case_id`, `user_id`)
);
--> statement-breakpoint
CREATE TABLE `votes` (
	`case_id` text NOT NULL,
	`user_id` text NOT NULL,
	`choice` text NOT NULL,
	`at` integer NOT NULL,
	PRIMARY KEY(`case_id`, `user_id`)
);
--> statement-breakpoint
CREATE INDEX `votes_user` ON `votes` (`user_id`);