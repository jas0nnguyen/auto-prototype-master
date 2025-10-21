ALTER TABLE "agreement" ADD COLUMN "driver_email" varchar(255);--> statement-breakpoint
ALTER TABLE "agreement" ADD COLUMN "premium_amount" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "communication_identity" ADD COLUMN "party_identifier" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "communication_identity" ADD CONSTRAINT "communication_identity_party_identifier_party_party_identifier_fk" FOREIGN KEY ("party_identifier") REFERENCES "public"."party"("party_identifier") ON DELETE no action ON UPDATE no action;