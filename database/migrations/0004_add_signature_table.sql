-- Migration: Add signature table for digital signature storage
-- Feature: 004-tech-startup-flow-redesign
-- Created: 2025-11-12

-- Create signature table
CREATE TABLE IF NOT EXISTS "signature" (
  "signature_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "quote_id" uuid NOT NULL,
  "party_id" uuid NOT NULL,
  "signature_image_data" text NOT NULL,
  "signature_format" varchar(10) NOT NULL,
  "signature_date" timestamp DEFAULT now() NOT NULL,
  "ip_address" varchar(45),
  "user_agent" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Note: Foreign key constraints commented out for demo mode
-- In demo mode, party_id may equal quote_id and not exist in party table
-- CONSTRAINT "signature_quote_id_policy_policy_identifier_fk" FOREIGN KEY ("quote_id") REFERENCES "policy"("policy_identifier") ON DELETE CASCADE,
-- CONSTRAINT "signature_party_id_party_party_identifier_fk" FOREIGN KEY ("party_id") REFERENCES "party"("party_identifier") ON DELETE CASCADE

-- Create indexes for query optimization
CREATE INDEX IF NOT EXISTS "signature_quote_id_idx" ON "signature" ("quote_id");
CREATE INDEX IF NOT EXISTS "signature_party_id_idx" ON "signature" ("party_id");
