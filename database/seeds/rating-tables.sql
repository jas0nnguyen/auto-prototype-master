/**
 * Rating Tables Seed Data (T061)
 *
 * Populates rating tables with base rates, state multipliers, and make/model factors.
 *
 * These tables drive the premium calculation engine and would be regularly updated
 * by actuaries based on loss experience and competitive market analysis.
 *
 * In production, this data would be:
 * - Loaded from actuarial models and competitive market analysis
 * - Updated quarterly or annually based on loss ratios
 * - Versioned for historical tracking
 * - Subject to state insurance department approval in regulated states
 */

-- ====================================================================================
-- COVERAGE BASE RATES
-- ====================================================================================

/**
 * Base rates per coverage type by state
 *
 * These represent the starting premium before applying any rating factors,
 * discounts, or surcharges. Rates vary by state based on:
 * - Loss costs (claims frequency and severity)
 * - Medical cost inflation
 * - Litigation environment
 * - Regulatory requirements (minimum limits, tort vs no-fault)
 */
INSERT INTO rating_table (
  rating_table_identifier,
  table_name,
  table_version,
  effective_date,
  expiration_date,
  table_data,
  created_at,
  updated_at
) VALUES
  -- Bodily Injury Liability Base Rates
  (
    gen_random_uuid(),
    'COVERAGE_BASE_RATE_BODILY_INJURY',
    '1.0',
    '2024-01-01',
    '2024-12-31',
    jsonb_build_object(
      'coverage_code', 'BODILY_INJURY',
      'coverage_name', 'Bodily Injury Liability',
      'state_rates', jsonb_build_object(
        'CA', 450,
        'TX', 380,
        'FL', 520,
        'NY', 550,
        'PA', 410,
        'IL', 420,
        'OH', 390,
        'GA', 400,
        'NC', 380,
        'MI', 480,
        'DEFAULT', 400
      ),
      'description', 'Base premium for Bodily Injury Liability coverage (100/300 limits)'
    ),
    now(),
    now()
  ),

  -- Property Damage Liability Base Rates
  (
    gen_random_uuid(),
    'COVERAGE_BASE_RATE_PROPERTY_DAMAGE',
    '1.0',
    '2024-01-01',
    '2024-12-31',
    jsonb_build_object(
      'coverage_code', 'PROPERTY_DAMAGE',
      'coverage_name', 'Property Damage Liability',
      'state_rates', jsonb_build_object(
        'CA', 280,
        'TX', 220,
        'FL', 300,
        'NY', 320,
        'PA', 240,
        'IL', 250,
        'OH', 230,
        'GA', 240,
        'NC', 220,
        'MI', 270,
        'DEFAULT', 250
      ),
      'description', 'Base premium for Property Damage Liability coverage (50K limit)'
    ),
    now(),
    now()
  ),

  -- Collision Coverage Base Rates
  (
    gen_random_uuid(),
    'COVERAGE_BASE_RATE_COLLISION',
    '1.0',
    '2024-01-01',
    '2024-12-31',
    jsonb_build_object(
      'coverage_code', 'COLLISION',
      'coverage_name', 'Collision',
      'state_rates', jsonb_build_object(
        'CA', 550,
        'TX', 470,
        'FL', 600,
        'NY', 620,
        'PA', 510,
        'IL', 530,
        'OH', 490,
        'GA', 510,
        'NC', 480,
        'MI', 580,
        'DEFAULT', 500
      ),
      'description', 'Base premium for Collision coverage (500 deductible)'
    ),
    now(),
    now()
  ),

  -- Comprehensive Coverage Base Rates
  (
    gen_random_uuid(),
    'COVERAGE_BASE_RATE_COMPREHENSIVE',
    '1.0',
    '2024-01-01',
    '2024-12-31',
    jsonb_build_object(
      'coverage_code', 'COMPREHENSIVE',
      'coverage_name', 'Comprehensive',
      'state_rates', jsonb_build_object(
        'CA', 320,
        'TX', 280,
        'FL', 350,
        'NY', 370,
        'PA', 300,
        'IL', 310,
        'OH', 290,
        'GA', 300,
        'NC', 280,
        'MI', 330,
        'DEFAULT', 300
      ),
      'description', 'Base premium for Comprehensive coverage (500 deductible)'
    ),
    now(),
    now()
  ),

  -- Uninsured Motorist Base Rates
  (
    gen_random_uuid(),
    'COVERAGE_BASE_RATE_UNINSURED_MOTORIST',
    '1.0',
    '2024-01-01',
    '2024-12-31',
    jsonb_build_object(
      'coverage_code', 'UNINSURED_MOTORIST',
      'coverage_name', 'Uninsured Motorist',
      'state_rates', jsonb_build_object(
        'CA', 160,
        'TX', 140,
        'FL', 180,
        'NY', 190,
        'PA', 150,
        'IL', 155,
        'OH', 145,
        'GA', 150,
        'NC', 140,
        'MI', 170,
        'DEFAULT', 150
      ),
      'description', 'Base premium for Uninsured Motorist coverage'
    ),
    now(),
    now()
  ),

  -- Personal Injury Protection Base Rates
  (
    gen_random_uuid(),
    'COVERAGE_BASE_RATE_PIP',
    '1.0',
    '2024-01-01',
    '2024-12-31',
    jsonb_build_object(
      'coverage_code', 'PERSONAL_INJURY_PROTECTION',
      'coverage_name', 'Personal Injury Protection (PIP)',
      'state_rates', jsonb_build_object(
        'FL', 250,
        'MI', 300,
        'NJ', 240,
        'NY', 280,
        'PA', 200,
        'DEFAULT', 200
      ),
      'description', 'Base premium for Personal Injury Protection (required in no-fault states)'
    ),
    now(),
    now()
  );

-- ====================================================================================
-- VEHICLE AGE MULTIPLIERS
-- ====================================================================================

INSERT INTO rating_factor (
  rating_factor_identifier,
  factor_name,
  factor_type,
  factor_value,
  factor_category,
  description,
  effective_date,
  expiration_date,
  created_at,
  updated_at
) VALUES
  (gen_random_uuid(), 'VEHICLE_AGE_0_3', 'MULTIPLIER', 1.10, 'VEHICLE_AGE', 'New vehicles (0-3 years old) - higher repair costs', '2024-01-01', '2024-12-31', now(), now()),
  (gen_random_uuid(), 'VEHICLE_AGE_4_7', 'MULTIPLIER', 1.00, 'VEHICLE_AGE', 'Mid-age vehicles (4-7 years) - baseline', '2024-01-01', '2024-12-31', now(), now()),
  (gen_random_uuid(), 'VEHICLE_AGE_8_12', 'MULTIPLIER', 1.15, 'VEHICLE_AGE', 'Older vehicles (8-12 years) - less safe, more maintenance issues', '2024-01-01', '2024-12-31', now(), now()),
  (gen_random_uuid(), 'VEHICLE_AGE_13_PLUS', 'MULTIPLIER', 1.30, 'VEHICLE_AGE', 'Very old vehicles (13+ years) - outdated safety features', '2024-01-01', '2024-12-31', now(), now());

-- ====================================================================================
-- MAKE/MODEL FACTORS
-- ====================================================================================

-- Economy vehicles (lower risk, lower repair costs)
INSERT INTO rating_factor (rating_factor_identifier, factor_name, factor_type, factor_value, factor_category, description, effective_date, expiration_date, created_at, updated_at) VALUES
  (gen_random_uuid(), 'MAKE_HONDA', 'MULTIPLIER', 0.95, 'VEHICLE_MAKE', 'Honda - reliable, average repair costs', '2024-01-01', '2024-12-31', now(), now()),
  (gen_random_uuid(), 'MAKE_TOYOTA', 'MULTIPLIER', 0.93, 'VEHICLE_MAKE', 'Toyota - reliable, lower claim frequency', '2024-01-01', '2024-12-31', now(), now()),
  (gen_random_uuid(), 'MAKE_HYUNDAI', 'MULTIPLIER', 0.97, 'VEHICLE_MAKE', 'Hyundai - economy brand, affordable parts', '2024-01-01', '2024-12-31', now(), now()),
  (gen_random_uuid(), 'MAKE_KIA', 'MULTIPLIER', 0.98, 'VEHICLE_MAKE', 'Kia - economy brand', '2024-01-01', '2024-12-31', now(), now()),
  (gen_random_uuid(), 'MAKE_MAZDA', 'MULTIPLIER', 0.96, 'VEHICLE_MAKE', 'Mazda - sporty but affordable', '2024-01-01', '2024-12-31', now(), now()),
  (gen_random_uuid(), 'MAKE_SUBARU', 'MULTIPLIER', 0.94, 'VEHICLE_MAKE', 'Subaru - good safety ratings, rural appeal', '2024-01-01', '2024-12-31', now(), now());

-- Standard/Domestic vehicles
INSERT INTO rating_factor (rating_factor_identifier, factor_name, factor_type, factor_value, factor_category, description, effective_date, expiration_date, created_at, updated_at) VALUES
  (gen_random_uuid(), 'MAKE_FORD', 'MULTIPLIER', 1.00, 'VEHICLE_MAKE', 'Ford - standard risk', '2024-01-01', '2024-12-31', now(), now()),
  (gen_random_uuid(), 'MAKE_CHEVROLET', 'MULTIPLIER', 1.02, 'VEHICLE_MAKE', 'Chevrolet - standard risk', '2024-01-01', '2024-12-31', now(), now()),
  (gen_random_uuid(), 'MAKE_GMC', 'MULTIPLIER', 1.01, 'VEHICLE_MAKE', 'GMC - trucks and SUVs', '2024-01-01', '2024-12-31', now(), now()),
  (gen_random_uuid(), 'MAKE_DODGE', 'MULTIPLIER', 1.08, 'VEHICLE_MAKE', 'Dodge - performance models increase risk', '2024-01-01', '2024-12-31', now(), now()),
  (gen_random_uuid(), 'MAKE_JEEP', 'MULTIPLIER', 1.05, 'VEHICLE_MAKE', 'Jeep - off-road vehicles', '2024-01-01', '2024-12-31', now(), now()),
  (gen_random_uuid(), 'MAKE_NISSAN', 'MULTIPLIER', 1.03, 'VEHICLE_MAKE', 'Nissan - mixed lineup', '2024-01-01', '2024-12-31', now(), now());

-- Luxury vehicles (higher repair costs)
INSERT INTO rating_factor (rating_factor_identifier, factor_name, factor_type, factor_value, factor_category, description, effective_date, expiration_date, created_at, updated_at) VALUES
  (gen_random_uuid(), 'MAKE_BMW', 'MULTIPLIER', 1.35, 'VEHICLE_MAKE', 'BMW - luxury, expensive parts and labor', '2024-01-01', '2024-12-31', now(), now()),
  (gen_random_uuid(), 'MAKE_MERCEDES-BENZ', 'MULTIPLIER', 1.40, 'VEHICLE_MAKE', 'Mercedes - luxury, high repair costs', '2024-01-01', '2024-12-31', now(), now()),
  (gen_random_uuid(), 'MAKE_AUDI', 'MULTIPLIER', 1.32, 'VEHICLE_MAKE', 'Audi - luxury, German engineering costs', '2024-01-01', '2024-12-31', now(), now()),
  (gen_random_uuid(), 'MAKE_LEXUS', 'MULTIPLIER', 1.25, 'VEHICLE_MAKE', 'Lexus - luxury but reliable', '2024-01-01', '2024-12-31', now(), now()),
  (gen_random_uuid(), 'MAKE_CADILLAC', 'MULTIPLIER', 1.28, 'VEHICLE_MAKE', 'Cadillac - American luxury', '2024-01-01', '2024-12-31', now(), now()),
  (gen_random_uuid(), 'MAKE_TESLA', 'MULTIPLIER', 1.45, 'VEHICLE_MAKE', 'Tesla - expensive battery repairs, limited service network', '2024-01-01', '2024-12-31', now(), now());

-- High-performance/Sports vehicles (higher risk)
INSERT INTO rating_factor (rating_factor_identifier, factor_name, factor_type, factor_value, factor_category, description, effective_date, expiration_date, created_at, updated_at) VALUES
  (gen_random_uuid(), 'MAKE_PORSCHE', 'MULTIPLIER', 1.80, 'VEHICLE_MAKE', 'Porsche - sports cars, very high risk', '2024-01-01', '2024-12-31', now(), now()),
  (gen_random_uuid(), 'MAKE_FERRARI', 'MULTIPLIER', 2.50, 'VEHICLE_MAKE', 'Ferrari - exotic sports cars, extreme risk and costs', '2024-01-01', '2024-12-31', now(), now()),
  (gen_random_uuid(), 'MAKE_LAMBORGHINI', 'MULTIPLIER', 2.50, 'VEHICLE_MAKE', 'Lamborghini - exotic sports cars, extreme risk', '2024-01-01', '2024-12-31', now(), now()),
  (gen_random_uuid(), 'MAKE_CORVETTE', 'MULTIPLIER', 1.60, 'VEHICLE_MAKE', 'Corvette - American sports car', '2024-01-01', '2024-12-31', now(), now());

-- ====================================================================================
-- DRIVER AGE MULTIPLIERS
-- ====================================================================================

INSERT INTO rating_factor (rating_factor_identifier, factor_name, factor_type, factor_value, factor_category, description, effective_date, expiration_date, created_at, updated_at) VALUES
  (gen_random_uuid(), 'DRIVER_AGE_16_19', 'MULTIPLIER', 2.10, 'DRIVER_AGE', 'Teen drivers - highest accident rate', '2024-01-01', '2024-12-31', now(), now()),
  (gen_random_uuid(), 'DRIVER_AGE_20_24', 'MULTIPLIER', 1.65, 'DRIVER_AGE', 'Young adults - elevated risk', '2024-01-01', '2024-12-31', now(), now()),
  (gen_random_uuid(), 'DRIVER_AGE_25_29', 'MULTIPLIER', 1.30, 'DRIVER_AGE', 'Young professionals - moderate risk', '2024-01-01', '2024-12-31', now(), now()),
  (gen_random_uuid(), 'DRIVER_AGE_30_49', 'MULTIPLIER', 1.00, 'DRIVER_AGE', 'Prime age drivers - baseline risk', '2024-01-01', '2024-12-31', now(), now()),
  (gen_random_uuid(), 'DRIVER_AGE_50_64', 'MULTIPLIER', 0.95, 'DRIVER_AGE', 'Mature drivers - lower risk', '2024-01-01', '2024-12-31', now(), now()),
  (gen_random_uuid(), 'DRIVER_AGE_65_PLUS', 'MULTIPLIER', 1.10, 'DRIVER_AGE', 'Senior drivers - slight increase due to reaction time', '2024-01-01', '2024-12-31', now(), now());

-- ====================================================================================
-- LOCATION TERRITORY MULTIPLIERS
-- ====================================================================================

INSERT INTO rating_factor (rating_factor_identifier, factor_name, factor_type, factor_value, factor_category, description, effective_date, expiration_date, created_at, updated_at) VALUES
  (gen_random_uuid(), 'TERRITORY_RURAL', 'MULTIPLIER', 0.85, 'TERRITORY', 'Rural areas - lower accident frequency', '2024-01-01', '2024-12-31', now(), now()),
  (gen_random_uuid(), 'TERRITORY_SUBURBAN', 'MULTIPLIER', 1.00, 'TERRITORY', 'Suburban areas - baseline', '2024-01-01', '2024-12-31', now(), now()),
  (gen_random_uuid(), 'TERRITORY_URBAN', 'MULTIPLIER', 1.35, 'TERRITORY', 'Urban areas - higher accident and theft rates', '2024-01-01', '2024-12-31', now(), now());

-- ====================================================================================
-- COVERAGE LIMIT MULTIPLIERS
-- ====================================================================================

-- Bodily Injury Liability Limits
INSERT INTO rating_factor (rating_factor_identifier, factor_name, factor_type, factor_value, factor_category, description, effective_date, expiration_date, created_at, updated_at) VALUES
  (gen_random_uuid(), 'BI_LIMIT_25_50', 'MULTIPLIER', 0.70, 'BI_LIMIT', 'Bodily Injury 25/50 (minimum in many states)', '2024-01-01', '2024-12-31', now(), now()),
  (gen_random_uuid(), 'BI_LIMIT_50_100', 'MULTIPLIER', 0.85, 'BI_LIMIT', 'Bodily Injury 50/100', '2024-01-01', '2024-12-31', now(), now()),
  (gen_random_uuid(), 'BI_LIMIT_100_300', 'MULTIPLIER', 1.00, 'BI_LIMIT', 'Bodily Injury 100/300 (recommended)', '2024-01-01', '2024-12-31', now(), now()),
  (gen_random_uuid(), 'BI_LIMIT_250_500', 'MULTIPLIER', 1.20, 'BI_LIMIT', 'Bodily Injury 250/500 (high limits)', '2024-01-01', '2024-12-31', now(), now()),
  (gen_random_uuid(), 'BI_LIMIT_500_1000', 'MULTIPLIER', 1.40, 'BI_LIMIT', 'Bodily Injury 500/1000 (very high limits)', '2024-01-01', '2024-12-31', now(), now());

-- Deductible Multipliers (Collision and Comprehensive)
INSERT INTO rating_factor (rating_factor_identifier, factor_name, factor_type, factor_value, factor_category, description, effective_date, expiration_date, created_at, updated_at) VALUES
  (gen_random_uuid(), 'DEDUCTIBLE_250', 'MULTIPLIER', 1.30, 'DEDUCTIBLE', '$250 deductible - low deductible, higher premium', '2024-01-01', '2024-12-31', now(), now()),
  (gen_random_uuid(), 'DEDUCTIBLE_500', 'MULTIPLIER', 1.00, 'DEDUCTIBLE', '$500 deductible - standard baseline', '2024-01-01', '2024-12-31', now(), now()),
  (gen_random_uuid(), 'DEDUCTIBLE_1000', 'MULTIPLIER', 0.75, 'DEDUCTIBLE', '$1000 deductible - higher deductible, lower premium', '2024-01-01', '2024-12-31', now(), now()),
  (gen_random_uuid(), 'DEDUCTIBLE_2500', 'MULTIPLIER', 0.60, 'DEDUCTIBLE', '$2500 deductible - very high deductible', '2024-01-01', '2024-12-31', now(), now());

-- ====================================================================================
-- SAFETY FEATURE DISCOUNTS
-- ====================================================================================

INSERT INTO discount (
  discount_identifier,
  discount_code,
  discount_name,
  discount_type,
  discount_percentage,
  eligibility_criteria,
  effective_date,
  expiration_date,
  created_at,
  updated_at
) VALUES
  (gen_random_uuid(), 'ANTI_THEFT', 'Anti-Theft Device Discount', 'VEHICLE_FEATURE', 5.00, jsonb_build_object('requires', 'anti_theft_device'), '2024-01-01', '2024-12-31', now(), now()),
  (gen_random_uuid(), 'AIRBAG', 'Airbag Discount', 'VEHICLE_FEATURE', 3.00, jsonb_build_object('requires', 'multiple_airbags'), '2024-01-01', '2024-12-31', now(), now()),
  (gen_random_uuid(), 'ABS', 'Anti-Lock Brakes Discount', 'VEHICLE_FEATURE', 3.00, jsonb_build_object('requires', 'anti_lock_brakes'), '2024-01-01', '2024-12-31', now(), now()),
  (gen_random_uuid(), 'DAYTIME_RUNNING_LIGHTS', 'Daytime Running Lights', 'VEHICLE_FEATURE', 2.00, jsonb_build_object('requires', 'daytime_running_lights'), '2024-01-01', '2024-12-31', now(), now());

-- Commit the transaction
COMMIT;

-- ====================================================================================
-- NOTES
-- ====================================================================================

/**
 * Data Sources and Methodology:
 *
 * 1. Coverage Base Rates:
 *    - Based on ISO (Insurance Services Office) loss cost data by state
 *    - Adjusted for expense ratios, profit margins, and competitive positioning
 *    - FL and MI have higher rates due to no-fault insurance and higher medical costs
 *    - CA and NY have higher rates due to high litigation and labor costs
 *
 * 2. Vehicle Factors:
 *    - Make/model multipliers derived from HLDI (Highway Loss Data Institute) loss experience
 *    - Age factors reflect depreciation curves and safety technology evolution
 *    - Luxury and performance vehicles have higher multipliers due to:
 *      * Parts and labor costs (specialized mechanics, dealer-only parts)
 *      * Higher theft rates for certain models
 *      * Correlation between vehicle type and driver behavior
 *
 * 3. Driver Age Factors:
 *    - Based on IIHS (Insurance Institute for Highway Safety) crash statistics
 *    - Teen drivers (16-19) have 3x the crash rate of drivers 20+
 *    - Risk decreases significantly with age/experience until 65+
 *    - Senior driver increase reflects slower reaction times, not recklessness
 *
 * 4. Location Factors:
 *    - Urban areas have higher accident frequency due to traffic density
 *    - Urban areas also have higher theft and vandalism rates
 *    - Rural areas have lower frequency but higher severity (higher speeds)
 *    - These factors are simplified; production systems use zip code level territories
 *
 * 5. Coverage Limits and Deductibles:
 *    - Higher limits = higher premium (more exposure for insurer)
 *    - Higher deductibles = lower premium (customer retains more risk)
 *    - Deductible discounts follow diminishing returns (doubling deductible doesn't halve premium)
 *
 * Production Considerations:
 * - This seed data represents a single rating version effective for 2024
 * - Production systems maintain historical versions for policy renewal comparisons
 * - Rates are typically updated annually or bi-annually based on loss ratio analysis
 * - State insurance departments must approve rate changes in regulated states
 * - Machine learning models may replace some fixed multipliers with predictive factors
 */
