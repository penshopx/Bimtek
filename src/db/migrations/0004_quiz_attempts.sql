CREATE TABLE `quiz_attempts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`question_id` integer NOT NULL,
	`correct` integer NOT NULL,
	`attempted_at` text NOT NULL
);
