CREATE TABLE `document_checklist` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`jabatan_id` text NOT NULL,
	`document_id` text NOT NULL,
	`checked` integer DEFAULT false,
	`checked_at` text,
	`created_at` text NOT NULL
);
