/**
 * OMG Property & Casualty Data Model v1.0 - TypeScript Interfaces
 *
 * This file contains TypeScript interfaces for all 33 entities in the system:
 * - 27 OMG P&C Core Entities
 * - 6 Rating Engine Entities
 *
 * All entities follow OMG naming conventions and patterns including:
 * - UUID primary keys with {entity_name}_identifier naming
 * - Temporal tracking (begin_date, end_date) where applicable
 * - Audit timestamps (created_at, updated_at)
 * - Subtype patterns (Party → Person, Agreement → Policy)
 * - Party Role patterns for relationships
 */

import {
  BaseEntity,
  TemporalEntity,
  EffectiveDatedEntity,
  PartyIdentifier,
  AgreementIdentifier,
  PolicyIdentifier,
  AccountIdentifier,
  CommunicationIdentifier,
  GeographicLocationIdentifier,
  VehicleIdentifier,
  CoverageIdentifier,
  ClaimIdentifier,
  EventIdentifier,
  PaymentIdentifier,
  DocumentIdentifier,
  PartyTypeCode,
  CommunicationTypeCode,
  PolicyStatusCode,
  QuoteStatusCode,
  ClaimStatusCode,
  PaymentStatusCode,
  PartyRoleTypeCode,
  CoveragePartCode,
  EventTypeCode,
  DocumentTypeCode,
  GenderCode,
  StateCode,
  CurrencyCode,
} from '../entities/base';

// ===================================================================
// PARTY ENTITIES (5 entities)
// ===================================================================

/**
 * Party (OMG Core Entity #1)
 *
 * Represents a person, organization, or group of interest to the enterprise.
 */
export interface Party extends TemporalEntity {
  party_identifier: PartyIdentifier;
  party_name: string;
  party_type_code: PartyTypeCode;
}

/**
 * Person (OMG Core Entity #2)
 *
 * Subtype of Party representing individual persons.
 */
export interface Person extends BaseEntity {
  person_identifier: PartyIdentifier; // FK to Party (is-a relationship)
  prefix_name?: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  suffix_name?: string;
  full_legal_name?: string;
  nickname?: string;
  birth_date: Date;
  birth_place_name?: string;
  gender_code?: GenderCode;
}

/**
 * Communication Identity (OMG Core Entity #3)
 *
 * Represents contact methods (email, phone, mobile, fax) associated with a Party.
 */
export interface CommunicationIdentity extends BaseEntity {
  communication_identifier: CommunicationIdentifier;
  communication_type_code: CommunicationTypeCode;
  communication_value: string;
  communication_qualifier_value?: string;
  geographic_location_identifier?: GeographicLocationIdentifier;
}

/**
 * Geographic Location (OMG Core Entity #4)
 *
 * Represents jurisdictional and physical locations.
 */
export interface GeographicLocation extends BaseEntity {
  geographic_location_identifier: GeographicLocationIdentifier;
  geographic_location_type_code: string;
  location_code?: string;
  location_name?: string;
  location_number?: string;
  state_code?: StateCode;
  parent_geographic_location_identifier?: GeographicLocationIdentifier;
  location_address_identifier?: string;
  physical_location_identifier?: string;
}

/**
 * Location Address (OMG Core Entity #5)
 *
 * Represents physical addresses with standard components.
 */
export interface LocationAddress extends TemporalEntity {
  location_address_identifier: string;
  line_1_address: string;
  line_2_address?: string;
  municipality_name: string;
  state_code: StateCode;
  postal_code: string;
  country_code: string;
}

// ===================================================================
// ACCOUNT & PRODUCT ENTITIES (3 entities)
// ===================================================================

/**
 * Account (OMG Core Entity #6)
 *
 * Container for customer relationship holding one or more Agreements.
 */
export interface Account extends BaseEntity {
  account_identifier: AccountIdentifier;
  account_type_code: string;
  account_name: string;
}

/**
 * Product (OMG Core Entity #7)
 *
 * Represents the insurance offering (e.g., "Personal Auto Insurance").
 */
export interface Product extends BaseEntity {
  product_identifier: string;
  line_of_business_identifier: string;
  licensed_product_name: string;
  product_description?: string;
}

/**
 * User Account (Extension Entity #8)
 *
 * Extension entity for authentication and portal access.
 * NOTE: Demo mode - no password required, URL-based access only.
 */
export interface UserAccount extends BaseEntity {
  user_account_identifier: string;
  party_identifier: PartyIdentifier;
  email: string;
  email_verified: boolean;
  last_login?: Date;
  policy_access_token?: string; // UUID for URL-based access (demo mode)
}

// ===================================================================
// AGREEMENT & POLICY ENTITIES (9 entities)
// ===================================================================

/**
 * Agreement (OMG Core Entity #9)
 *
 * A legally binding contract among identified parties.
 */
export interface Agreement extends BaseEntity {
  agreement_identifier: AgreementIdentifier;
  agreement_type_code: string;
  agreement_name?: string;
  agreement_original_inception_date?: Date;
  product_identifier: string;
}

/**
 * Policy (OMG Core Entity #10)
 *
 * Subtype of Agreement representing an insurance contract.
 */
export interface Policy extends EffectiveDatedEntity {
  policy_identifier: PolicyIdentifier; // FK to Agreement (is-a relationship)
  policy_number: string;
  policy_status_code: PolicyStatusCode | QuoteStatusCode;
  geographic_location_identifier: GeographicLocationIdentifier;
  policy_original_effective_date?: Date;
  quote_number?: string;
  quote_expiration_date?: Date;
  total_premium_amount?: number;
  total_premium_currency?: CurrencyCode;
}

/**
 * Coverage Part (OMG Core Entity #11)
 *
 * Reference table defining types of insurance coverage.
 */
export interface CoveragePart extends BaseEntity {
  coverage_part_code: CoveragePartCode;
  coverage_part_name: string;
  coverage_part_description?: string;
  is_liability_coverage: boolean;
  is_optional: boolean;
}

/**
 * Coverage (OMG Core Entity #12)
 *
 * Represents a specific type of insurance coverage.
 */
export interface Coverage extends EffectiveDatedEntity {
  coverage_identifier: CoverageIdentifier;
  coverage_part_code: CoveragePartCode;
  coverage_name: string;
  coverage_description?: string;
}

/**
 * Policy Coverage Detail (OMG Core Entity #13)
 *
 * Links Policy to Coverage with specific limits and deductibles.
 */
export interface PolicyCoverageDetail extends EffectiveDatedEntity {
  policy_coverage_detail_identifier: string;
  policy_identifier: PolicyIdentifier;
  coverage_identifier: CoverageIdentifier;
  premium_amount: number;
  premium_currency: CurrencyCode;
}

/**
 * Policy Limit (OMG Core Entity #14)
 *
 * Defines coverage limits for Policy Coverage Detail.
 */
export interface PolicyLimit extends BaseEntity {
  policy_limit_identifier: string;
  policy_coverage_detail_identifier: string;
  limit_type_code: string;
  limit_amount: number;
  limit_currency: CurrencyCode;
}

/**
 * Policy Deductible (OMG Core Entity #15)
 *
 * Defines deductibles for Policy Coverage Detail.
 */
export interface PolicyDeductible extends BaseEntity {
  policy_deductible_identifier: string;
  policy_coverage_detail_identifier: string;
  deductible_type_code: string;
  deductible_amount: number;
  deductible_currency: CurrencyCode;
}

/**
 * Policy Amount (Money) (OMG Core Entity #16)
 *
 * Represents monetary amounts associated with policies.
 */
export interface PolicyAmount extends BaseEntity {
  policy_amount_identifier: string;
  policy_identifier: PolicyIdentifier;
  amount_type_code: string;
  amount_value: number;
  amount_currency: CurrencyCode;
}

/**
 * Assessment (OMG Core Entity #17)
 *
 * Represents assessment of damage or loss (used in claims).
 */
export interface Assessment extends BaseEntity {
  assessment_identifier: string;
  damage_description?: string;
  estimated_amount?: number;
  estimated_amount_currency?: CurrencyCode;
  assessment_date: Date;
  assessor_party_id?: PartyIdentifier;
}

// ===================================================================
// INSURABLE OBJECT ENTITIES (2 entities)
// ===================================================================

/**
 * Insurable Object (OMG Core Entity #18)
 *
 * Base entity for things that can be insured.
 */
export interface InsurableObject extends TemporalEntity {
  insurable_object_identifier: string;
  insurable_object_type_code: string;
  insurable_object_name?: string;
}

/**
 * Vehicle (OMG Core Entity #19)
 *
 * Subtype of Insurable Object representing vehicles.
 */
export interface Vehicle extends BaseEntity {
  vehicle_identifier: VehicleIdentifier; // FK to Insurable Object (is-a relationship)
  vin: string;
  make: string;
  model: string;
  year: number;
  trim?: string;
  body_type?: string;
  engine_size?: string;
  fuel_type?: string;
  transmission_type?: string;
  vehicle_usage_type?: string;
  annual_mileage?: number;
  ownership_status?: string;
  purchase_date?: Date;
  estimated_value?: number;
  nhtsa_overall_rating?: number;
  iihs_overall_rating?: string;
}

// ===================================================================
// PARTY ROLE RELATIONSHIP ENTITIES (1 entity - multiple tables)
// ===================================================================

/**
 * Agreement Party Role (OMG Pattern #20)
 *
 * Links Party to Agreement with role and temporal validity.
 */
export interface AgreementPartyRole extends TemporalEntity {
  agreement_party_role_identifier: string;
  agreement_identifier: AgreementIdentifier;
  party_identifier: PartyIdentifier;
  role_type_code: PartyRoleTypeCode;
}

/**
 * Account Party Role (OMG Pattern #21)
 *
 * Links Party to Account with role.
 */
export interface AccountPartyRole extends TemporalEntity {
  account_party_role_identifier: string;
  account_identifier: AccountIdentifier;
  party_identifier: PartyIdentifier;
  role_type_code: PartyRoleTypeCode;
}

/**
 * Insurable Object Party Role (OMG Pattern #22)
 *
 * Links Party to Insurable Object with role (owner, operator, etc.).
 */
export interface InsurableObjectPartyRole extends TemporalEntity {
  insurable_object_party_role_identifier: string;
  insurable_object_identifier: string;
  party_identifier: PartyIdentifier;
  role_type_code: PartyRoleTypeCode;
}

/**
 * Account Agreement (OMG Pattern #23)
 *
 * Links Account to Agreement.
 */
export interface AccountAgreement extends TemporalEntity {
  account_agreement_identifier: string;
  account_identifier: AccountIdentifier;
  agreement_identifier: AgreementIdentifier;
  relationship_type?: string;
}

// ===================================================================
// PAYMENT ENTITY (1 entity)
// ===================================================================

/**
 * Payment (Extension Entity #24)
 *
 * Represents payment transactions for policies.
 */
export interface Payment extends BaseEntity {
  payment_identifier: PaymentIdentifier;
  policy_identifier: PolicyIdentifier;
  party_identifier: PartyIdentifier;
  payment_method_type: string;
  payment_amount: number;
  payment_currency: CurrencyCode;
  payment_status: PaymentStatusCode;
  payment_date: Date;
  transaction_id?: string;
  last_four_digits?: string;
}

// ===================================================================
// EVENT ENTITIES (3 entities)
// ===================================================================

/**
 * Event (OMG Core Entity #25)
 *
 * Base entity for events that occur in the system.
 */
export interface Event extends BaseEntity {
  event_identifier: EventIdentifier;
  event_type_code: EventTypeCode;
  event_date: Date;
  event_description?: string;
}

/**
 * Policy Event (OMG Core Entity #26)
 *
 * Subtype of Event for policy-related events.
 */
export interface PolicyEvent extends BaseEntity {
  policy_event_identifier: EventIdentifier; // FK to Event (is-a relationship)
  policy_identifier: PolicyIdentifier;
}

/**
 * Claim Event (OMG Core Entity #27)
 *
 * Subtype of Event for claim-related events.
 */
export interface ClaimEvent extends BaseEntity {
  claim_event_identifier: EventIdentifier; // FK to Event (is-a relationship)
  claim_identifier: ClaimIdentifier;
}

// ===================================================================
// CLAIM ENTITIES (2 entities)
// ===================================================================

/**
 * Claim (OMG Core Entity #28)
 *
 * Represents an insurance claim.
 */
export interface Claim extends BaseEntity {
  claim_identifier: ClaimIdentifier;
  claim_number: string;
  policy_identifier: PolicyIdentifier;
  claim_status_code: ClaimStatusCode;
  claim_date: Date;
  incident_date: Date;
  incident_description: string;
  claim_amount?: number;
  claim_amount_currency?: CurrencyCode;
}

/**
 * Claim Party Role (OMG Pattern #29)
 *
 * Links Party to Claim with role (claimant, witness, adjuster).
 */
export interface ClaimPartyRole extends TemporalEntity {
  claim_party_role_identifier: string;
  claim_identifier: ClaimIdentifier;
  party_identifier: PartyIdentifier;
  role_type_code: PartyRoleTypeCode;
}

// ===================================================================
// DOCUMENT ENTITY (1 entity)
// ===================================================================

/**
 * Document (Extension Entity #30)
 *
 * Represents generated or uploaded documents.
 */
export interface Document extends BaseEntity {
  document_identifier: DocumentIdentifier;
  document_type_code: DocumentTypeCode;
  document_name: string;
  document_description?: string;
  file_path?: string;
  file_size_bytes?: number;
  mime_type?: string;
  policy_identifier?: PolicyIdentifier;
  claim_identifier?: ClaimIdentifier;
}

// ===================================================================
// RATING ENGINE ENTITIES (6 entities)
// ===================================================================

/**
 * Rating Factor (Rating Engine #1)
 *
 * Represents individual rating factors used in premium calculation.
 */
export interface RatingFactor extends BaseEntity {
  rating_factor_identifier: string;
  factor_category: string; // VEHICLE, DRIVER, LOCATION, COVERAGE
  factor_name: string;
  factor_value: string;
  factor_weight: number;
  effective_date: Date;
  expiration_date?: Date;
}

/**
 * Rating Table (Rating Engine #2)
 *
 * Lookup tables for rating multipliers.
 */
export interface RatingTable extends BaseEntity {
  rating_table_identifier: string;
  table_name: string;
  table_category: string;
  lookup_key: string;
  multiplier_value: number;
  effective_date: Date;
  expiration_date?: Date;
}

/**
 * Discount (Rating Engine #3)
 *
 * Represents premium discounts.
 */
export interface Discount extends BaseEntity {
  discount_identifier: string;
  discount_code: string;
  discount_name: string;
  discount_description?: string;
  discount_type: string; // PERCENTAGE, FLAT_AMOUNT
  discount_value: number;
  policy_identifier?: PolicyIdentifier;
}

/**
 * Surcharge (Rating Engine #4)
 *
 * Represents premium surcharges.
 */
export interface Surcharge extends BaseEntity {
  surcharge_identifier: string;
  surcharge_code: string;
  surcharge_name: string;
  surcharge_description?: string;
  surcharge_type: string; // PERCENTAGE, FLAT_AMOUNT
  surcharge_value: number;
  policy_identifier?: PolicyIdentifier;
}

/**
 * Premium Calculation (Rating Engine #5)
 *
 * Audit trail for premium calculations.
 */
export interface PremiumCalculation extends BaseEntity {
  premium_calculation_identifier: string;
  policy_identifier: PolicyIdentifier;
  base_premium: number;
  vehicle_factors: Record<string, number>;
  driver_factors: Record<string, number>;
  location_factors: Record<string, number>;
  coverage_factors: Record<string, number>;
  discounts: Record<string, number>;
  surcharges: Record<string, number>;
  taxes: Record<string, number>;
  fees: Record<string, number>;
  final_premium: number;
  calculation_timestamp: Date;
}

/**
 * Party Communication (OMG Pattern #33)
 *
 * Links Party to Communication Identity with temporal validity.
 */
export interface PartyCommunication extends TemporalEntity {
  party_communication_identifier: string;
  party_identifier: PartyIdentifier;
  communication_identifier: CommunicationIdentifier;
  is_preferred: boolean;
}

// ===================================================================
// HELPER TYPES
// ===================================================================

/**
 * All OMG entities union type
 */
export type OMGEntity =
  | Party
  | Person
  | CommunicationIdentity
  | GeographicLocation
  | LocationAddress
  | Account
  | Product
  | UserAccount
  | Agreement
  | Policy
  | CoveragePart
  | Coverage
  | PolicyCoverageDetail
  | PolicyLimit
  | PolicyDeductible
  | PolicyAmount
  | Assessment
  | InsurableObject
  | Vehicle
  | AgreementPartyRole
  | AccountPartyRole
  | InsurableObjectPartyRole
  | AccountAgreement
  | Payment
  | Event
  | PolicyEvent
  | ClaimEvent
  | Claim
  | ClaimPartyRole
  | Document
  | RatingFactor
  | RatingTable
  | Discount
  | Surcharge
  | PremiumCalculation
  | PartyCommunication;
