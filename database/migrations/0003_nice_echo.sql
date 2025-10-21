CREATE TABLE "document" (
	"document_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"policy_id" uuid,
	"claim_id" uuid,
	"document_number" varchar(20) NOT NULL,
	"document_type" varchar(50) NOT NULL,
	"document_name" varchar(255) NOT NULL,
	"storage_url" varchar(500) NOT NULL,
	"file_size" integer,
	"mime_type" varchar(100),
	"description" varchar(500),
	"generated_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "document_document_number_unique" UNIQUE("document_number")
);
--> statement-breakpoint
CREATE TABLE "event" (
	"event_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" varchar(50) NOT NULL,
	"event_subtype" varchar(50),
	"event_date" timestamp DEFAULT now() NOT NULL,
	"event_data" jsonb,
	"event_description" varchar(500),
	"actor_id" uuid,
	"actor_type" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment" (
	"payment_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"policy_id" uuid NOT NULL,
	"payment_number" varchar(20) NOT NULL,
	"payment_method" varchar(20) NOT NULL,
	"payment_status" varchar(20) NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"last_four_digits" varchar(4),
	"card_brand" varchar(20),
	"account_type" varchar(20),
	"transaction_id" varchar(100),
	"gateway_response" varchar(255),
	"payment_date" timestamp DEFAULT now() NOT NULL,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payment_payment_number_unique" UNIQUE("payment_number")
);
--> statement-breakpoint
CREATE TABLE "policy_event" (
	"policy_event_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"policy_id" uuid NOT NULL,
	"previous_status" varchar(20),
	"new_status" varchar(20),
	"change_reason" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "policy" DROP CONSTRAINT "policy_geographic_location_identifier_geographic_location_geographic_location_identifier_fk";
--> statement-breakpoint
ALTER TABLE "document" ADD CONSTRAINT "document_policy_id_policy_policy_identifier_fk" FOREIGN KEY ("policy_id") REFERENCES "public"."policy"("policy_identifier") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_policy_id_policy_policy_identifier_fk" FOREIGN KEY ("policy_id") REFERENCES "public"."policy"("policy_identifier") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policy_event" ADD CONSTRAINT "policy_event_event_id_event_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("event_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policy_event" ADD CONSTRAINT "policy_event_policy_id_policy_policy_identifier_fk" FOREIGN KEY ("policy_id") REFERENCES "public"."policy"("policy_identifier") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policy" DROP COLUMN "geographic_location_identifier";