CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`icon` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
CREATE TABLE `exchanges` (
	`id` text PRIMARY KEY NOT NULL,
	`wallet_id` text NOT NULL,
	`kind` text NOT NULL,
	`exchanged_at` text NOT NULL,
	`from_currency` text DEFAULT 'KRW' NOT NULL,
	`from_amount_minor` integer NOT NULL,
	`to_currency` text NOT NULL,
	`to_amount_minor` integer NOT NULL,
	`fee_minor` integer DEFAULT 0 NOT NULL,
	`rate` text NOT NULL,
	`memo` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	FOREIGN KEY (`wallet_id`) REFERENCES `wallets`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `exchanges_wallet_time_idx` ON `exchanges` (`wallet_id`,`to_currency`,`exchanged_at`);--> statement-breakpoint
CREATE TABLE `ledgers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`base_currency` text DEFAULT 'KRW' NOT NULL,
	`timezone` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
CREATE TABLE `lot_allocations` (
	`transaction_id` text NOT NULL,
	`exchange_id` text NOT NULL,
	`amount_minor` integer NOT NULL,
	PRIMARY KEY(`transaction_id`, `exchange_id`),
	FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`exchange_id`) REFERENCES `exchanges`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `rate_cache` (
	`currency` text NOT NULL,
	`rate_date` text NOT NULL,
	`rate` text NOT NULL,
	`tts` text,
	`source` text NOT NULL,
	`effective_at` text NOT NULL,
	`fetched_at` text NOT NULL,
	PRIMARY KEY(`currency`, `rate_date`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`ledger_id` text NOT NULL,
	`wallet_id` text NOT NULL,
	`category_id` text,
	`refund_of_id` text,
	`type` text NOT NULL,
	`occurred_at` text NOT NULL,
	`timezone` text NOT NULL,
	`amount_minor` integer NOT NULL,
	`currency` text NOT NULL,
	`rate` text NOT NULL,
	`rate_source` text NOT NULL,
	`rate_status` text NOT NULL,
	`rate_as_of` text,
	`base_amount_minor` integer NOT NULL,
	`memo` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	FOREIGN KEY (`ledger_id`) REFERENCES `ledgers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`wallet_id`) REFERENCES `wallets`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `transactions_ledger_time_idx` ON `transactions` (`ledger_id`,`occurred_at`);--> statement-breakpoint
CREATE INDEX `transactions_wallet_time_idx` ON `transactions` (`wallet_id`,`currency`,`occurred_at`);--> statement-breakpoint
CREATE TABLE `wallets` (
	`id` text PRIMARY KEY NOT NULL,
	`ledger_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`est_fee_rate` text DEFAULT '0' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	FOREIGN KEY (`ledger_id`) REFERENCES `ledgers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `wallets_ledger_idx` ON `wallets` (`ledger_id`);