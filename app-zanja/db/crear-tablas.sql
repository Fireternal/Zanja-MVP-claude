-- ZANJA · todas las migraciones en un solo archivo.
-- Generado por scripts/sql-inicial.mjs. No editar a mano.
--
-- Para usarlo: panel de Cloudflare → D1 → tu base → Console,
-- pegar todo esto y ejecutar. Una sola vez, sobre una base recién creada:
-- si la base ya tiene tablas, esto da error y no hace falta.

CREATE TABLE IF NOT EXISTS d1_migrations(
	id         INTEGER PRIMARY KEY AUTOINCREMENT,
	name       TEXT UNIQUE,
	applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 0000_puzzling_marauders.sql
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
CREATE INDEX `cases_owner` ON `cases` (`owner`);
CREATE INDEX `cases_status` ON `cases` (`status`);
CREATE TABLE `reports` (
	`case_id` text NOT NULL,
	`user_id` text NOT NULL,
	`reason` text NOT NULL,
	`at` integer NOT NULL,
	PRIMARY KEY(`case_id`, `user_id`)
);
CREATE TABLE `votes` (
	`case_id` text NOT NULL,
	`user_id` text NOT NULL,
	`choice` text NOT NULL,
	`at` integer NOT NULL,
	PRIMARY KEY(`case_id`, `user_id`)
);
CREATE INDEX `votes_user` ON `votes` (`user_id`);
INSERT OR IGNORE INTO d1_migrations (name) VALUES ('0000_puzzling_marauders.sql');

-- 0001_gorgeous_talisman.sql
ALTER TABLE `cases` ADD `evidence` text;
INSERT OR IGNORE INTO d1_migrations (name) VALUES ('0001_gorgeous_talisman.sql');

-- 0002_heavy_dust.sql
ALTER TABLE `cases` ADD `story` text DEFAULT '' NOT NULL;
ALTER TABLE `cases` ADD `audience` text DEFAULT 'public' NOT NULL;
ALTER TABLE `cases` ADD `workflow` integer DEFAULT 0 NOT NULL;
INSERT OR IGNORE INTO d1_migrations (name) VALUES ('0002_heavy_dust.sql');
