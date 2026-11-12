CREATE TABLE `project_portfolios` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `name` text NOT NULL,
  `client_name` text DEFAULT '' NOT NULL,
  `location` text DEFAULT '' NOT NULL,
  `role` text NOT NULL,
  `target_jabatan_id` text DEFAULT '' NOT NULL,
  `started_year` text DEFAULT '' NOT NULL,
  `completed_year` text DEFAULT '' NOT NULL,
  `description` text NOT NULL,
  `outcomes` text DEFAULT '' NOT NULL,
  `evidence_ids` text DEFAULT '[]' NOT NULL,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `project_portfolios_owner_idx` ON `project_portfolios` (`user_id`);
