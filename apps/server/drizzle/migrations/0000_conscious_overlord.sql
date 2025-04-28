CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"email" varchar NOT NULL,
	"username" varchar NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
