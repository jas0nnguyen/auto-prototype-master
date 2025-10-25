/**
 * Database Performance Indexes
 *
 * Optimizes query performance for frequently accessed columns
 * and common query patterns in the auto insurance system
 */

-- Policy indexes for quick lookups
CREATE INDEX IF NOT EXISTS idx_policy_quote_number ON policy(quote_number);
CREATE INDEX IF NOT EXISTS idx_policy_policy_number ON policy(policy_number);
CREATE INDEX IF NOT EXISTS idx_policy_status ON policy(status);
CREATE INDEX IF NOT EXISTS idx_policy_effective_date ON policy(effective_date);
CREATE INDEX IF NOT EXISTS idx_policy_expiration_date ON policy(expiration_date);

-- Composite index for common query pattern: filtering by status and date range
CREATE INDEX IF NOT EXISTS idx_policy_status_effective_date ON policy(status, effective_date);
CREATE INDEX IF NOT EXISTS idx_policy_status_expiration_date ON policy(status, expiration_date);

-- Party indexes for deduplication and lookup
CREATE INDEX IF NOT EXISTS idx_party_email_address ON party(email_address);
CREATE INDEX IF NOT EXISTS idx_party_created_at ON party(created_at);

-- Person indexes for name-based lookups
CREATE INDEX IF NOT EXISTS idx_person_first_name ON person(first_name);
CREATE INDEX IF NOT EXISTS idx_person_last_name ON person(last_name);
CREATE INDEX IF NOT EXISTS idx_person_full_name ON person(first_name, last_name);

-- Vehicle indexes for VIN lookups
CREATE INDEX IF NOT EXISTS idx_vehicle_vin ON vehicle(vehicle_identification_number);
CREATE INDEX IF NOT EXISTS idx_vehicle_make_model_year ON vehicle(make_name, model_name, model_year);

-- Claim indexes for portal queries
CREATE INDEX IF NOT EXISTS idx_claim_claim_number ON claim(claim_number);
CREATE INDEX IF NOT EXISTS idx_claim_status ON claim(claim_status_code);
CREATE INDEX IF NOT EXISTS idx_claim_incident_date ON claim(incident_date);

-- Payment indexes for billing history
CREATE INDEX IF NOT EXISTS idx_payment_status ON payment(payment_status_code);
CREATE INDEX IF NOT EXISTS idx_payment_payment_date ON payment(payment_date);

-- User account indexes for portal access
CREATE INDEX IF NOT EXISTS idx_user_account_email ON user_account(email);

-- Geographic location indexes for rating
CREATE INDEX IF NOT EXISTS idx_location_address_postal_code ON location_address(postal_code);
CREATE INDEX IF NOT EXISTS idx_geographic_location_state_code ON geographic_location(state_province_code);

-- Foreign key indexes to improve join performance
CREATE INDEX IF NOT EXISTS idx_policy_agreement_id ON policy(agreement_id);
CREATE INDEX IF NOT EXISTS idx_person_party_id ON person(party_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_insurable_object_id ON vehicle(insurable_object_id);
CREATE INDEX IF NOT EXISTS idx_policy_coverage_detail_policy_id ON policy_coverage_detail(policy_id);
CREATE INDEX IF NOT EXISTS idx_payment_policy_id ON payment(policy_id);
CREATE INDEX IF NOT EXISTS idx_claim_policy_id ON claim(policy_id);

-- Portal access optimization: policy number + status
CREATE INDEX IF NOT EXISTS idx_policy_portal_lookup ON policy(policy_number, status) WHERE status IN ('BOUND', 'IN_FORCE');

-- Quote expiration monitoring
CREATE INDEX IF NOT EXISTS idx_policy_expiration_monitoring ON policy(expiration_date, status) WHERE status = 'QUOTED';

-- Claim lifecycle tracking
CREATE INDEX IF NOT EXISTS idx_claim_lifecycle ON claim(policy_id, claim_status_code, incident_date);

-- COMMENT: These indexes improve common query patterns:
-- 1. Portal access: lookup by policy_number (idx_policy_policy_number)
-- 2. Quote retrieval: lookup by quote_number (idx_policy_quote_number)
-- 3. Billing history: payment status and date filters (idx_payment_status, idx_payment_payment_date)
-- 4. Claims listing: claim status and date filters (idx_claim_status, idx_claim_incident_date)
-- 5. Deduplication: email lookups (idx_party_email_address)
-- 6. Rating engine: ZIP code and state lookups (idx_location_address_postal_code, idx_geographic_location_state_code)
