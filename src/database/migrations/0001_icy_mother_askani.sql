ALTER TABLE "users" ALTER COLUMN "provider" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "provider_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_hash" text;