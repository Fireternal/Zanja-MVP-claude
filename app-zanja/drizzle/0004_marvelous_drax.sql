CREATE TABLE `pulse` (
	`day` integer NOT NULL,
	`user_id` text NOT NULL,
	`choice` text NOT NULL,
	`at` integer NOT NULL,
	PRIMARY KEY(`day`, `user_id`)
);
--> statement-breakpoint
CREATE INDEX `pulse_day` ON `pulse` (`day`);