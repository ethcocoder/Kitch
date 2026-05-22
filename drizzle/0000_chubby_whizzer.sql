CREATE TABLE `analytics` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`eventType` text NOT NULL,
	`userId` integer,
	`productId` integer,
	`orderId` integer,
	`metadata` text,
	`createdAt` integer DEFAULT '"2026-05-22T14:47:35.313Z"' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `cmsContent` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key` text NOT NULL,
	`title` text,
	`content` text,
	`imageUrl` text,
	`order` integer DEFAULT 0,
	`published` integer DEFAULT true,
	`createdAt` integer DEFAULT '"2026-05-22T14:47:35.313Z"' NOT NULL,
	`updatedAt` integer DEFAULT '"2026-05-22T14:47:35.313Z"' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cmsContent_key_unique` ON `cmsContent` (`key`);--> statement-breakpoint
CREATE TABLE `features` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`icon` text,
	`imageUrl` text,
	`order` integer DEFAULT 0,
	`published` integer DEFAULT true,
	`createdAt` integer DEFAULT '"2026-05-22T14:47:35.314Z"' NOT NULL,
	`updatedAt` integer DEFAULT '"2026-05-22T14:47:35.314Z"' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `orderItems` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`orderId` integer NOT NULL,
	`productId` integer NOT NULL,
	`quantity` integer NOT NULL,
	`price` real NOT NULL,
	`createdAt` integer DEFAULT '"2026-05-22T14:47:35.313Z"' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`orderNumber` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`totalAmount` real NOT NULL,
	`itemCount` integer NOT NULL,
	`shippingAddress` text,
	`notes` text,
	`createdAt` integer DEFAULT '"2026-05-22T14:47:35.313Z"' NOT NULL,
	`updatedAt` integer DEFAULT '"2026-05-22T14:47:35.313Z"' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_orderNumber_unique` ON `orders` (`orderNumber`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`category` text NOT NULL,
	`price` real NOT NULL,
	`stock` integer DEFAULT 0 NOT NULL,
	`imageUrl` text,
	`sku` text,
	`featured` integer DEFAULT false,
	`createdAt` integer DEFAULT '"2026-05-22T14:47:35.313Z"' NOT NULL,
	`updatedAt` integer DEFAULT '"2026-05-22T14:47:35.313Z"' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_sku_unique` ON `products` (`sku`);--> statement-breakpoint
CREATE TABLE `testimonials` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`authorName` text NOT NULL,
	`authorTitle` text,
	`authorImage` text,
	`content` text NOT NULL,
	`rating` integer DEFAULT 5,
	`published` integer DEFAULT true,
	`order` integer DEFAULT 0,
	`createdAt` integer DEFAULT '"2026-05-22T14:47:35.313Z"' NOT NULL,
	`updatedAt` integer DEFAULT '"2026-05-22T14:47:35.313Z"' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`openId` text NOT NULL,
	`name` text,
	`email` text,
	`loginMethod` text,
	`role` text DEFAULT 'user' NOT NULL,
	`createdAt` integer DEFAULT '"2026-05-22T14:47:35.312Z"' NOT NULL,
	`updatedAt` integer DEFAULT '"2026-05-22T14:47:35.312Z"' NOT NULL,
	`lastSignedIn` integer DEFAULT '"2026-05-22T14:47:35.312Z"' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_openId_unique` ON `users` (`openId`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_openId_idx` ON `users` (`openId`);