CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`organization` text NOT NULL,
	`created_at` text NOT NULL,
	`last_login` text NOT NULL,
	`employer_id` text,
	`college_id` text,
	`consent` text DEFAULT '{}' NOT NULL,
	`completed` text DEFAULT '[]' NOT NULL,
	`last_activity` text,
	`joining_status` text DEFAULT 'No offer yet' NOT NULL,
	`joining_date` text,
	`date_reason` text,
	`job_role` text DEFAULT 'Software Engineer' NOT NULL,
	`history` text DEFAULT '[]' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `consent_events` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`choices` text NOT NULL,
	`created_at` text NOT NULL,
	`version` text NOT NULL
);
