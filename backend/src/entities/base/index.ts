/**
 * Base Entity Types
 *
 * Common interfaces and types shared across all OMG entities.
 * These base types enforce consistency and OMG compliance patterns.
 */

/**
 * Base entity interface with audit timestamps
 *
 * All entities should extend this interface to include
 * standard audit fields for tracking creation and modification.
 */
export interface BaseEntity {
  created_at: Date;
  updated_at: Date;
}

/**
 * Temporal entity interface (OMG pattern)
 *
 * Entities that track validity periods should extend this interface.
 * The begin_date and end_date define when the entity is/was valid.
 *
 * - begin_date: When the entity becomes valid
 * - end_date: When the entity becomes invalid (null = currently valid)
 */
export interface TemporalEntity extends BaseEntity {
  begin_date: Date;
  end_date: Date | null;
}

/**
 * Agreement temporal tracking (OMG pattern)
 *
 * Agreements and policies use effective/expiration dates
 * instead of begin/end dates to track contract periods.
 */
export interface EffectiveDatedEntity extends BaseEntity {
  effective_date: Date;
  expiration_date: Date;
}

/**
 * Party identifier type
 *
 * All Party references use UUIDs as identifiers.
 */
export type PartyIdentifier = string; // UUID

/**
 * Agreement identifier type
 *
 * All Agreement (and subtype) references use UUIDs.
 */
export type AgreementIdentifier = string; // UUID

/**
 * Policy identifier type
 *
 * Policies are subtypes of Agreement.
 */
export type PolicyIdentifier = AgreementIdentifier;

/**
 * Account identifier type
 */
export type AccountIdentifier = string; // UUID

/**
 * Communication identifier type
 */
export type CommunicationIdentifier = string; // UUID

/**
 * Geographic location identifier type
 */
export type GeographicLocationIdentifier = string; // UUID

/**
 * Vehicle identifier type
 */
export type VehicleIdentifier = string; // UUID

/**
 * Coverage identifier type
 */
export type CoverageIdentifier = string; // UUID

/**
 * Claim identifier type
 */
export type ClaimIdentifier = string; // UUID

/**
 * Event identifier type
 */
export type EventIdentifier = string; // UUID

/**
 * Payment identifier type
 */
export type PaymentIdentifier = string; // UUID

/**
 * Document identifier type
 */
export type DocumentIdentifier = string; // UUID

/**
 * Party type codes (OMG enumeration)
 */
export enum PartyTypeCode {
  PERSON = 'PERSON',
  ORGANIZATION = 'ORGANIZATION',
  GROUPING = 'GROUPING',
}

/**
 * Communication type codes (OMG enumeration)
 */
export enum CommunicationTypeCode {
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  MOBILE = 'MOBILE',
  FAX = 'FAX',
}

/**
 * Policy status codes (OMG pattern)
 *
 * Status transitions: QUOTED → BINDING → BOUND → ACTIVE
 *                     ACTIVE → CANCELLED or EXPIRED
 */
export enum PolicyStatusCode {
  QUOTED = 'QUOTED',
  BINDING = 'BINDING',
  BOUND = 'BOUND',
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

/**
 * Quote status codes
 */
export enum QuoteStatusCode {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  CONVERTED = 'CONVERTED',
  EXPIRED = 'EXPIRED',
}

/**
 * Claim status codes
 */
export enum ClaimStatusCode {
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  DENIED = 'DENIED',
  CLOSED = 'CLOSED',
}

/**
 * Payment status codes
 */
export enum PaymentStatusCode {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

/**
 * Party role type codes (OMG pattern)
 */
export enum PartyRoleTypeCode {
  // Agreement roles
  INSURED = 'INSURED',
  POLICY_OWNER = 'POLICY_OWNER',
  BENEFICIARY = 'BENEFICIARY',

  // Account roles
  ACCOUNT_HOLDER = 'ACCOUNT_HOLDER',

  // Insurable Object roles
  VEHICLE_OWNER = 'VEHICLE_OWNER',
  VEHICLE_OPERATOR = 'VEHICLE_OPERATOR',

  // Claim roles
  CLAIMANT = 'CLAIMANT',
  WITNESS = 'WITNESS',
  ADJUSTER = 'ADJUSTER',
}

/**
 * Coverage part codes (standard auto insurance)
 */
export enum CoveragePartCode {
  BODILY_INJURY_LIABILITY = 'BI_LIABILITY',
  PROPERTY_DAMAGE_LIABILITY = 'PD_LIABILITY',
  PERSONAL_INJURY_PROTECTION = 'PIP',
  MEDICAL_PAYMENTS = 'MED_PAY',
  UNINSURED_MOTORIST_BI = 'UM_BI',
  UNINSURED_MOTORIST_PD = 'UM_PD',
  UNDERINSURED_MOTORIST = 'UIM',
  COLLISION = 'COLLISION',
  COMPREHENSIVE = 'COMPREHENSIVE',
  RENTAL_REIMBURSEMENT = 'RENTAL',
  ROADSIDE_ASSISTANCE = 'ROADSIDE',
}

/**
 * Event type codes (OMG pattern)
 */
export enum EventTypeCode {
  // Policy events
  POLICY_CREATED = 'POLICY_CREATED',
  POLICY_BOUND = 'POLICY_BOUND',
  POLICY_ACTIVATED = 'POLICY_ACTIVATED',
  POLICY_CANCELLED = 'POLICY_CANCELLED',
  POLICY_RENEWED = 'POLICY_RENEWED',

  // Claim events
  CLAIM_FILED = 'CLAIM_FILED',
  CLAIM_ASSIGNED = 'CLAIM_ASSIGNED',
  CLAIM_INVESTIGATED = 'CLAIM_INVESTIGATED',
  CLAIM_SETTLED = 'CLAIM_SETTLED',
  CLAIM_CLOSED = 'CLAIM_CLOSED',

  // Payment events
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  PAYMENT_PROCESSED = 'PAYMENT_PROCESSED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
}

/**
 * Document type codes
 */
export enum DocumentTypeCode {
  POLICY_DOCUMENT = 'POLICY_DOCUMENT',
  ID_CARD = 'ID_CARD',
  CLAIM_ATTACHMENT = 'CLAIM_ATTACHMENT',
  PROOF_OF_INSURANCE = 'PROOF_OF_INSURANCE',
  DECLARATION_PAGE = 'DECLARATION_PAGE',
}

/**
 * Gender codes (for rating where permitted by state law)
 */
export enum GenderCode {
  MALE = 'M',
  FEMALE = 'F',
  OTHER = 'O',
  UNKNOWN = 'U',
}

/**
 * US State codes
 */
export type StateCode = string; // Two-letter state codes (CA, NY, TX, etc.)

/**
 * Currency code
 */
export type CurrencyCode = 'USD';

/**
 * Money type with currency
 */
export interface Money {
  amount: number;
  currency: CurrencyCode;
}

/**
 * Result type for operations that may fail
 */
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
