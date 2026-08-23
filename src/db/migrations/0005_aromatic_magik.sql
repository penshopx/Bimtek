CREATE TABLE `quiz_attempts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`question_id` integer NOT NULL,
	`correct` integer NOT NULL,
	`attempted_at` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `quiz_questions` ADD `sort_order` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` ADD `bidang` text;--> statement-breakpoint
ALTER TABLE `users` ADD `jabatan_skk` text;--> statement-breakpoint
ALTER TABLE `users` ADD `kualifikasi_skk` text;