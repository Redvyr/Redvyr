CREATE TABLE `consultations` (
	`id` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`plan_id` text NOT NULL,
	`plan_name` text NOT NULL,
	`base_price` integer NOT NULL,
	`add_ons_json` text DEFAULT '[]' NOT NULL,
	`estimated_total` integer NOT NULL,
	`customer_name` text NOT NULL,
	`business_name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`industry` text NOT NULL,
	`location` text NOT NULL,
	`existing_site` text DEFAULT '' NOT NULL,
	`goals` text NOT NULL,
	`payment_preference` text NOT NULL,
	`contact_preference` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `consultations_reference_unique` ON `consultations` (`reference`);