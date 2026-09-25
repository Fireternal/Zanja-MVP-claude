ALTER TABLE `cases` ADD `story` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `cases` ADD `audience` text DEFAULT 'public' NOT NULL;--> statement-breakpoint
ALTER TABLE `cases` ADD `workflow` integer DEFAULT 0 NOT NULL;