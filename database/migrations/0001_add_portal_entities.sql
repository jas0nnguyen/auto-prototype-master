-- Phase 5 (US3): Portal Access - Add User Account, Claim, Claim Party Role, Claim Event tables
-- Generated: 2025-10-21
-- Description: Adds portal and claims management entities for self-service functionality

-- User Account table (demo mode - URL-based access)
CREATE TABLE IF NOT EXISTS "user_account" (
  "account_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "policy_identifier" uuid NOT NULL,
  "email" varchar(255) NOT NULL,
  "access_token" uuid NOT NULL DEFAULT gen_random_uuid(),
  "last_accessed_at" timestamp,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "user_account_policy_identifier_fkey" FOREIGN KEY ("policy_identifier") REFERENCES "policy"("policy_identifier") ON DELETE CASCADE
);

-- Claim table
CREATE TABLE IF NOT EXISTS "claim" (
  "claim_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "claim_number" varchar(20) NOT NULL UNIQUE,
  "policy_identifier" uuid NOT NULL,
  "incident_date" date NOT NULL,
  "loss_type" varchar(50) NOT NULL,
  "description" text NOT NULL,
  "vehicle_identifier" uuid,
  "driver_identifier" uuid,
  "status" varchar(30) NOT NULL DEFAULT 'SUBMITTED',
  "estimated_loss_amount" varchar(20),
  "approved_amount" varchar(20),
  "paid_amount" varchar(20),
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "claim_policy_identifier_fkey" FOREIGN KEY ("policy_identifier") REFERENCES "policy"("policy_identifier") ON DELETE RESTRICT,
  CONSTRAINT "claim_vehicle_identifier_fkey" FOREIGN KEY ("vehicle_identifier") REFERENCES "vehicle"("vehicle_identifier") ON DELETE SET NULL,
  CONSTRAINT "claim_driver_identifier_fkey" FOREIGN KEY ("driver_identifier") REFERENCES "person"("person_identifier") ON DELETE SET NULL
);

-- Claim Party Role table
CREATE TABLE IF NOT EXISTS "claim_party_role" (
  "claim_party_role_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "claim_id" uuid NOT NULL,
  "party_id" uuid NOT NULL,
  "role_type_code" varchar(30) NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "claim_party_role_claim_id_fkey" FOREIGN KEY ("claim_id") REFERENCES "claim"("claim_id") ON DELETE CASCADE,
  CONSTRAINT "claim_party_role_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "party"("party_identifier") ON DELETE RESTRICT
);

-- Claim Event table
CREATE TABLE IF NOT EXISTS "claim_event" (
  "event_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "claim_id" uuid NOT NULL,
  "event_type" varchar(50) NOT NULL,
  "event_date" timestamp NOT NULL DEFAULT now(),
  "description" text,
  "metadata" text,
  "triggered_by" varchar(100),
  "created_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "claim_event_claim_id_fkey" FOREIGN KEY ("claim_id") REFERENCES "claim"("claim_id") ON DELETE CASCADE
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS "idx_user_account_policy" ON "user_account"("policy_identifier");
CREATE INDEX IF NOT EXISTS "idx_user_account_email" ON "user_account"("email");
CREATE INDEX IF NOT EXISTS "idx_user_account_access_token" ON "user_account"("access_token");
CREATE INDEX IF NOT EXISTS "idx_claim_policy" ON "claim"("policy_identifier");
CREATE INDEX IF NOT EXISTS "idx_claim_status" ON "claim"("status");
CREATE INDEX IF NOT EXISTS "idx_claim_number" ON "claim"("claim_number");
CREATE INDEX IF NOT EXISTS "idx_claim_party_role_claim" ON "claim_party_role"("claim_id");
CREATE INDEX IF NOT EXISTS "idx_claim_party_role_party" ON "claim_party_role"("party_id");
CREATE INDEX IF NOT EXISTS "idx_claim_event_claim" ON "claim_event"("claim_id");
CREATE INDEX IF NOT EXISTS "idx_claim_event_type" ON "claim_event"("event_type");
