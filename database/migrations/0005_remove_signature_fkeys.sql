-- Migration: Remove foreign key constraints from signature table
-- Feature: 004-tech-startup-flow-redesign
-- Created: 2025-11-12
-- Reason: Demo mode requires flexibility - party_id may equal quote_id and not exist in party table

-- Drop foreign key constraint on party_id (if exists)
ALTER TABLE "signature" DROP CONSTRAINT IF EXISTS "signature_party_id_fkey";

-- Drop foreign key constraint on quote_id (if exists)
ALTER TABLE "signature" DROP CONSTRAINT IF EXISTS "signature_quote_id_fkey";

-- Note: Indexes are kept for query performance
-- signature_quote_id_idx and signature_party_id_idx remain active
