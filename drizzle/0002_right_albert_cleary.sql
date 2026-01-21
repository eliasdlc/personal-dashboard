ALTER TABLE "tasks" ADD COLUMN "energy_level" varchar(20) DEFAULT 'low_energy';--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "context_id" text;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "status_funnel" varchar(20) DEFAULT 'backlog';--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;