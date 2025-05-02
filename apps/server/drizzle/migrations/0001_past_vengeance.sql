CREATE TABLE "two_factor_auth" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"secret" varchar NOT NULL,
	CONSTRAINT "two_factor_auth_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "two_factor_auth" ADD CONSTRAINT "two_factor_auth_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;