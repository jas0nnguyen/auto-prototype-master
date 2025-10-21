CREATE TABLE "account_agreement" (
	"account_agreement_identifier" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_identifier" uuid NOT NULL,
	"agreement_identifier" uuid NOT NULL,
	"relationship_type" varchar(50),
	"begin_date" timestamp DEFAULT now() NOT NULL,
	"end_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account" (
	"account_identifier" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_type_code" varchar(50) NOT NULL,
	"account_name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agreement" (
	"agreement_identifier" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agreement_type_code" varchar(50) NOT NULL,
	"agreement_name" varchar(255),
	"agreement_original_inception_date" date,
	"product_identifier" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessment" (
	"assessment_identifier" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"damage_description" text,
	"estimated_amount" numeric(12, 2),
	"assessment_date" date NOT NULL,
	"assessment_type" varchar(50),
	"assessor_party_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "communication_identity" (
	"communication_identifier" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"communication_type_code" varchar(50) NOT NULL,
	"communication_value" varchar(255) NOT NULL,
	"communication_qualifier_value" varchar(100),
	"geographic_location_identifier" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coverage_part" (
	"coverage_part_identifier" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"coverage_part_code" varchar(50) NOT NULL,
	"coverage_part_name" varchar(255) NOT NULL,
	"coverage_part_description" text,
	"coverage_category" varchar(50),
	"is_required" varchar(10) DEFAULT 'false',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "coverage_part_coverage_part_code_unique" UNIQUE("coverage_part_code")
);
--> statement-breakpoint
CREATE TABLE "coverage" (
	"coverage_identifier" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"coverage_code" varchar(50) NOT NULL,
	"coverage_name" varchar(255) NOT NULL,
	"coverage_description" text,
	"coverage_part_identifier" uuid NOT NULL,
	"product_identifier" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "discount" (
	"discount_identifier" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"policy_identifier" uuid,
	"discount_code" varchar(50) NOT NULL,
	"discount_name" varchar(255) NOT NULL,
	"discount_description" text,
	"discount_type" varchar(50),
	"discount_percentage" numeric(5, 2) NOT NULL,
	"discount_amount" numeric(10, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "geographic_location" (
	"geographic_location_identifier" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"geographic_location_type_code" varchar(50),
	"location_code" varchar(50),
	"location_name" varchar(255),
	"location_number" varchar(50),
	"state_code" varchar(2),
	"parent_geographic_location_identifier" uuid,
	"location_address_identifier" uuid,
	"physical_location_identifier" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "insurable_object" (
	"insurable_object_identifier" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"insurable_object_type_code" varchar(50) NOT NULL,
	"object_name" varchar(255),
	"object_description" varchar(500),
	"begin_date" timestamp DEFAULT now() NOT NULL,
	"end_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "location_address" (
	"location_address_identifier" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"line_1_address" varchar(255) NOT NULL,
	"line_2_address" varchar(255),
	"municipality_name" varchar(100) NOT NULL,
	"state_code" varchar(2) NOT NULL,
	"postal_code" varchar(20) NOT NULL,
	"country_code" varchar(3) DEFAULT 'USA',
	"begin_date" timestamp DEFAULT now() NOT NULL,
	"end_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account_party_role" (
	"account_party_role_identifier" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_identifier" uuid NOT NULL,
	"party_identifier" uuid NOT NULL,
	"party_role_code" varchar(50) NOT NULL,
	"begin_date" timestamp DEFAULT now() NOT NULL,
	"end_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agreement_party_role" (
	"agreement_party_role_identifier" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agreement_identifier" uuid NOT NULL,
	"party_identifier" uuid NOT NULL,
	"party_role_code" varchar(50) NOT NULL,
	"begin_date" timestamp DEFAULT now() NOT NULL,
	"end_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "insurable_object_party_role" (
	"insurable_object_party_role_identifier" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"insurable_object_identifier" uuid NOT NULL,
	"party_identifier" uuid NOT NULL,
	"party_role_code" varchar(50) NOT NULL,
	"begin_date" timestamp DEFAULT now() NOT NULL,
	"end_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "party" (
	"party_identifier" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"party_name" varchar(255) NOT NULL,
	"party_type_code" varchar(50) NOT NULL,
	"begin_date" timestamp DEFAULT now() NOT NULL,
	"end_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "person" (
	"person_identifier" uuid PRIMARY KEY NOT NULL,
	"prefix_name" varchar(20),
	"first_name" varchar(100) NOT NULL,
	"middle_name" varchar(100),
	"last_name" varchar(100) NOT NULL,
	"suffix_name" varchar(20),
	"full_legal_name" varchar(255),
	"nickname" varchar(100),
	"birth_date" date,
	"birth_place_name" varchar(255),
	"gender_code" varchar(20),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "policy_amount" (
	"policy_amount_identifier" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"policy_identifier" uuid NOT NULL,
	"geographic_location_identifier" uuid,
	"amount_type_code" varchar(50) NOT NULL,
	"amount_value" numeric(12, 2) NOT NULL,
	"currency_code" varchar(3) DEFAULT 'USD',
	"amount_description" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "policy_coverage_detail" (
	"policy_coverage_detail_identifier" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"policy_identifier" uuid NOT NULL,
	"coverage_identifier" uuid NOT NULL,
	"insurable_object_identifier" uuid,
	"effective_date" date NOT NULL,
	"expiration_date" date NOT NULL,
	"coverage_description" text,
	"is_included" varchar(10) DEFAULT 'true',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "policy_deductible" (
	"policy_deductible_identifier" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"policy_coverage_detail_identifier" uuid NOT NULL,
	"deductible_type_code" varchar(50) NOT NULL,
	"deductible_amount" numeric(10, 2) NOT NULL,
	"deductible_description" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "policy_limit" (
	"policy_limit_identifier" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"policy_coverage_detail_identifier" uuid NOT NULL,
	"limit_type_code" varchar(50) NOT NULL,
	"limit_amount" numeric(12, 2) NOT NULL,
	"limit_description" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "policy" (
	"policy_identifier" uuid PRIMARY KEY NOT NULL,
	"policy_number" varchar(50) NOT NULL,
	"effective_date" date NOT NULL,
	"expiration_date" date NOT NULL,
	"status_code" varchar(50) NOT NULL,
	"geographic_location_identifier" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "policy_policy_number_unique" UNIQUE("policy_number")
);
--> statement-breakpoint
CREATE TABLE "premium_calculation" (
	"premium_calculation_identifier" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"policy_identifier" uuid NOT NULL,
	"base_premium" numeric(10, 2) NOT NULL,
	"vehicle_factors" jsonb,
	"driver_factors" jsonb,
	"location_factors" jsonb,
	"coverage_factors" jsonb,
	"discounts_applied" jsonb,
	"surcharges_applied" jsonb,
	"total_factor_multiplier" numeric(8, 4),
	"subtotal_before_discounts" numeric(10, 2),
	"total_discount_amount" numeric(10, 2),
	"total_surcharge_amount" numeric(10, 2),
	"premium_tax_percentage" numeric(5, 2),
	"premium_tax_amount" numeric(10, 2),
	"policy_fee_amount" numeric(10, 2),
	"dmv_fee_amount" numeric(10, 2),
	"total_premium" numeric(10, 2) NOT NULL,
	"calculation_timestamp" timestamp DEFAULT now() NOT NULL,
	"calculation_version" varchar(20),
	"calculation_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product" (
	"product_identifier" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"line_of_business_identifier" uuid,
	"licensed_product_name" varchar(255) NOT NULL,
	"product_description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "product_licensed_product_name_unique" UNIQUE("licensed_product_name")
);
--> statement-breakpoint
CREATE TABLE "rating_factor" (
	"rating_factor_identifier" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"factor_name" varchar(100) NOT NULL,
	"factor_category" varchar(50) NOT NULL,
	"factor_code" varchar(50) NOT NULL,
	"factor_value" varchar(255),
	"factor_weight" numeric(5, 4),
	"factor_description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rating_table" (
	"rating_table_identifier" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"table_name" varchar(100) NOT NULL,
	"table_code" varchar(50) NOT NULL,
	"table_type" varchar(50) NOT NULL,
	"table_description" text,
	"lookup_key_1" varchar(100),
	"lookup_key_2" varchar(100),
	"lookup_key_3" varchar(100),
	"rate_value" numeric(10, 4) NOT NULL,
	"effective_date" date NOT NULL,
	"expiration_date" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "rating_table_table_code_unique" UNIQUE("table_code")
);
--> statement-breakpoint
CREATE TABLE "surcharge" (
	"surcharge_identifier" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"policy_identifier" uuid,
	"surcharge_code" varchar(50) NOT NULL,
	"surcharge_name" varchar(255) NOT NULL,
	"surcharge_description" text,
	"surcharge_type" varchar(50),
	"surcharge_percentage" numeric(5, 2) NOT NULL,
	"surcharge_amount" numeric(10, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vehicle" (
	"vehicle_identifier" uuid PRIMARY KEY NOT NULL,
	"vin" varchar(17),
	"license_plate_number" varchar(20),
	"license_plate_state_code" varchar(2),
	"year" integer NOT NULL,
	"make" varchar(100) NOT NULL,
	"model" varchar(100) NOT NULL,
	"body_style" varchar(50),
	"vehicle_type_code" varchar(50),
	"engine_type" varchar(50),
	"engine_displacement" numeric(5, 1),
	"fuel_type" varchar(50),
	"transmission_type" varchar(50),
	"purchase_date" date,
	"purchase_price" numeric(10, 2),
	"current_value" numeric(10, 2),
	"odometer_reading" integer,
	"annual_mileage" integer,
	"primary_use" varchar(50),
	"ownership_type" varchar(50),
	"anti_theft_device" varchar(100),
	"safety_features" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "vehicle_vin_unique" UNIQUE("vin")
);
--> statement-breakpoint
ALTER TABLE "account_agreement" ADD CONSTRAINT "account_agreement_account_identifier_account_account_identifier_fk" FOREIGN KEY ("account_identifier") REFERENCES "public"."account"("account_identifier") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_agreement" ADD CONSTRAINT "account_agreement_agreement_identifier_agreement_agreement_identifier_fk" FOREIGN KEY ("agreement_identifier") REFERENCES "public"."agreement"("agreement_identifier") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agreement" ADD CONSTRAINT "agreement_product_identifier_product_product_identifier_fk" FOREIGN KEY ("product_identifier") REFERENCES "public"."product"("product_identifier") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment" ADD CONSTRAINT "assessment_assessor_party_id_party_party_identifier_fk" FOREIGN KEY ("assessor_party_id") REFERENCES "public"."party"("party_identifier") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication_identity" ADD CONSTRAINT "communication_identity_geographic_location_identifier_geographic_location_geographic_location_identifier_fk" FOREIGN KEY ("geographic_location_identifier") REFERENCES "public"."geographic_location"("geographic_location_identifier") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coverage" ADD CONSTRAINT "coverage_coverage_part_identifier_coverage_part_coverage_part_identifier_fk" FOREIGN KEY ("coverage_part_identifier") REFERENCES "public"."coverage_part"("coverage_part_identifier") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coverage" ADD CONSTRAINT "coverage_product_identifier_product_product_identifier_fk" FOREIGN KEY ("product_identifier") REFERENCES "public"."product"("product_identifier") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discount" ADD CONSTRAINT "discount_policy_identifier_policy_policy_identifier_fk" FOREIGN KEY ("policy_identifier") REFERENCES "public"."policy"("policy_identifier") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_party_role" ADD CONSTRAINT "account_party_role_account_identifier_account_account_identifier_fk" FOREIGN KEY ("account_identifier") REFERENCES "public"."account"("account_identifier") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_party_role" ADD CONSTRAINT "account_party_role_party_identifier_party_party_identifier_fk" FOREIGN KEY ("party_identifier") REFERENCES "public"."party"("party_identifier") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agreement_party_role" ADD CONSTRAINT "agreement_party_role_agreement_identifier_agreement_agreement_identifier_fk" FOREIGN KEY ("agreement_identifier") REFERENCES "public"."agreement"("agreement_identifier") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agreement_party_role" ADD CONSTRAINT "agreement_party_role_party_identifier_party_party_identifier_fk" FOREIGN KEY ("party_identifier") REFERENCES "public"."party"("party_identifier") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurable_object_party_role" ADD CONSTRAINT "insurable_object_party_role_insurable_object_identifier_insurable_object_insurable_object_identifier_fk" FOREIGN KEY ("insurable_object_identifier") REFERENCES "public"."insurable_object"("insurable_object_identifier") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurable_object_party_role" ADD CONSTRAINT "insurable_object_party_role_party_identifier_party_party_identifier_fk" FOREIGN KEY ("party_identifier") REFERENCES "public"."party"("party_identifier") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person" ADD CONSTRAINT "person_person_identifier_party_party_identifier_fk" FOREIGN KEY ("person_identifier") REFERENCES "public"."party"("party_identifier") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policy_amount" ADD CONSTRAINT "policy_amount_policy_identifier_policy_policy_identifier_fk" FOREIGN KEY ("policy_identifier") REFERENCES "public"."policy"("policy_identifier") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policy_amount" ADD CONSTRAINT "policy_amount_geographic_location_identifier_geographic_location_geographic_location_identifier_fk" FOREIGN KEY ("geographic_location_identifier") REFERENCES "public"."geographic_location"("geographic_location_identifier") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policy_coverage_detail" ADD CONSTRAINT "policy_coverage_detail_policy_identifier_policy_policy_identifier_fk" FOREIGN KEY ("policy_identifier") REFERENCES "public"."policy"("policy_identifier") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policy_coverage_detail" ADD CONSTRAINT "policy_coverage_detail_coverage_identifier_coverage_coverage_identifier_fk" FOREIGN KEY ("coverage_identifier") REFERENCES "public"."coverage"("coverage_identifier") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policy_coverage_detail" ADD CONSTRAINT "policy_coverage_detail_insurable_object_identifier_insurable_object_insurable_object_identifier_fk" FOREIGN KEY ("insurable_object_identifier") REFERENCES "public"."insurable_object"("insurable_object_identifier") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policy_deductible" ADD CONSTRAINT "policy_deductible_policy_coverage_detail_identifier_policy_coverage_detail_policy_coverage_detail_identifier_fk" FOREIGN KEY ("policy_coverage_detail_identifier") REFERENCES "public"."policy_coverage_detail"("policy_coverage_detail_identifier") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policy_limit" ADD CONSTRAINT "policy_limit_policy_coverage_detail_identifier_policy_coverage_detail_policy_coverage_detail_identifier_fk" FOREIGN KEY ("policy_coverage_detail_identifier") REFERENCES "public"."policy_coverage_detail"("policy_coverage_detail_identifier") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policy" ADD CONSTRAINT "policy_policy_identifier_agreement_agreement_identifier_fk" FOREIGN KEY ("policy_identifier") REFERENCES "public"."agreement"("agreement_identifier") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policy" ADD CONSTRAINT "policy_geographic_location_identifier_geographic_location_geographic_location_identifier_fk" FOREIGN KEY ("geographic_location_identifier") REFERENCES "public"."geographic_location"("geographic_location_identifier") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "premium_calculation" ADD CONSTRAINT "premium_calculation_policy_identifier_policy_policy_identifier_fk" FOREIGN KEY ("policy_identifier") REFERENCES "public"."policy"("policy_identifier") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "surcharge" ADD CONSTRAINT "surcharge_policy_identifier_policy_policy_identifier_fk" FOREIGN KEY ("policy_identifier") REFERENCES "public"."policy"("policy_identifier") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle" ADD CONSTRAINT "vehicle_vehicle_identifier_insurable_object_insurable_object_identifier_fk" FOREIGN KEY ("vehicle_identifier") REFERENCES "public"."insurable_object"("insurable_object_identifier") ON DELETE cascade ON UPDATE no action;