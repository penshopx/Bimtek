CREATE TABLE `quiz_questions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`question` text NOT NULL,
	`category` text NOT NULL,
	`options` text NOT NULL,
	`correct` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
