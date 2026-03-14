CREATE TABLE `achievements` (
	`id` text PRIMARY KEY NOT NULL,
	`achievement_id` text NOT NULL,
	`unlocked_at` integer
);
--> statement-breakpoint
CREATE TABLE `activities` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`timestamp` integer,
	`metadata` text
);
--> statement-breakpoint
CREATE TABLE `bimtek_lessons` (
	`id` text PRIMARY KEY NOT NULL,
	`module_id` text NOT NULL,
	`lesson_id` text NOT NULL,
	`completed` integer DEFAULT false,
	`completed_at` integer
);
--> statement-breakpoint
CREATE TABLE `bimtek_progress` (
	`module_id` text PRIMARY KEY NOT NULL,
	`completed_at` integer,
	`progress` real DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE `bookmarks` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`item_id` text NOT NULL,
	`title` text NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `certificates` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`participant_id` text NOT NULL,
	`participant_name` text NOT NULL,
	`event_title` text NOT NULL,
	`event_date` text NOT NULL,
	`instructor_name` text NOT NULL,
	`location` text NOT NULL,
	`issued_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `event_participants` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`company` text NOT NULL,
	`status` text DEFAULT 'registered',
	`registered_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `favorites` (
	`id` text PRIMARY KEY NOT NULL,
	`module_id` text NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `offline_events` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`instructor_name` text NOT NULL,
	`instructor_phone` text NOT NULL,
	`location` text NOT NULL,
	`city` text NOT NULL,
	`province` text NOT NULL,
	`date` text NOT NULL,
	`time` text NOT NULL,
	`duration` integer NOT NULL,
	`capacity` integer NOT NULL,
	`registered` integer DEFAULT 0,
	`price` integer NOT NULL,
	`module` text NOT NULL,
	`category` text NOT NULL,
	`status` text DEFAULT 'open',
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `profile` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text,
	`email` text,
	`company` text,
	`position` text,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `quiz_scores` (
	`id` text PRIMARY KEY NOT NULL,
	`category` text NOT NULL,
	`score` integer NOT NULL,
	`total_questions` integer NOT NULL,
	`taken_at` integer
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `settings_key_unique` ON `settings` (`key`);--> statement-breakpoint
CREATE TABLE `streak` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`current_streak` integer DEFAULT 0,
	`longest_streak` integer DEFAULT 0,
	`last_activity_date` text,
	`total_days` integer DEFAULT 0
);
