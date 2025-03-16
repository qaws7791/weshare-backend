ALTER TABLE "reservations" ADD COLUMN "group_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" DROP COLUMN "pickup_time";--> statement-breakpoint
ALTER TABLE "reservations" DROP COLUMN "return_time";