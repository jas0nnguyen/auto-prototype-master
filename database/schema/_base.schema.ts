/**
 * Base Schema Utilities
 *
 * Shared types, helpers, and constants for Drizzle schema definitions.
 * This file provides common patterns used across all OMG entity schemas.
 */

import { timestamp } from 'drizzle-orm/pg-core';

/**
 * Standard audit timestamp columns
 *
 * All entities should include these for audit trail compliance.
 *
 * @example
 * ```typescript
 * export const myTable = pgTable('my_table', {
 *   id: uuid('id').primaryKey(),
 *   ...auditTimestamps,
 * });
 * ```
 */
export const auditTimestamps = {
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

/**
 * Temporal validity columns (OMG pattern)
 *
 * Used for entities that track effective date ranges.
 *
 * @example
 * ```typescript
 * export const agreement = pgTable('agreement', {
 *   agreement_id: uuid('agreement_id').primaryKey(),
 *   ...temporalTracking,
 * });
 * ```
 */
export const temporalTracking = {
  begin_date: timestamp('begin_date').notNull().defaultNow(),
  end_date: timestamp('end_date'), // nullable - null means currently valid
};

/**
 * Policy/Agreement effective dates (OMG pattern)
 *
 * Used for policies and agreements that have contract periods.
 */
export const effectiveDates = {
  effective_date: timestamp('effective_date').notNull(),
  expiration_date: timestamp('expiration_date').notNull(),
};

/**
 * Common status codes for entities
 */
export const EntityStatus = {
  // Quote statuses
  QUOTE_DRAFT: 'DRAFT',
  QUOTE_ACTIVE: 'ACTIVE',
  QUOTE_CONVERTED: 'CONVERTED',
  QUOTE_EXPIRED: 'EXPIRED',

  // Policy statuses (OMG pattern)
  POLICY_QUOTED: 'QUOTED',
  POLICY_BINDING: 'BINDING',
  POLICY_BOUND: 'BOUND',
  POLICY_ACTIVE: 'ACTIVE',
  POLICY_CANCELLED: 'CANCELLED',
  POLICY_EXPIRED: 'EXPIRED',

  // Claim statuses
  CLAIM_SUBMITTED: 'SUBMITTED',
  CLAIM_UNDER_REVIEW: 'UNDER_REVIEW',
  CLAIM_APPROVED: 'APPROVED',
  CLAIM_DENIED: 'DENIED',
  CLAIM_CLOSED: 'CLOSED',

  // Payment statuses
  PAYMENT_PENDING: 'PENDING',
  PAYMENT_PROCESSING: 'PROCESSING',
  PAYMENT_COMPLETED: 'COMPLETED',
  PAYMENT_FAILED: 'FAILED',
  PAYMENT_REFUNDED: 'REFUNDED',
} as const;

/**
 * Party type codes (OMG pattern)
 */
export const PartyTypeCode = {
  PERSON: 'PERSON',
  ORGANIZATION: 'ORGANIZATION',
  GROUPING: 'GROUPING',
} as const;

/**
 * Communication type codes (OMG pattern)
 */
export const CommunicationTypeCode = {
  EMAIL: 'EMAIL',
  PHONE: 'PHONE',
  MOBILE: 'MOBILE',
  FAX: 'FAX',
} as const;

/**
 * Party role type codes (OMG pattern)
 */
export const PartyRoleTypeCode = {
  // Agreement roles
  INSURED: 'INSURED',
  POLICY_OWNER: 'POLICY_OWNER',
  BENEFICIARY: 'BENEFICIARY',

  // Account roles
  ACCOUNT_HOLDER: 'ACCOUNT_HOLDER',

  // Insurable Object roles
  VEHICLE_OWNER: 'VEHICLE_OWNER',
  VEHICLE_OPERATOR: 'VEHICLE_OPERATOR',

  // Claim roles
  CLAIMANT: 'CLAIMANT',
  WITNESS: 'WITNESS',
  ADJUSTER: 'ADJUSTER',
} as const;

/**
 * Coverage part codes (standard auto insurance)
 */
export const CoveragePartCode = {
  BODILY_INJURY_LIABILITY: 'BI_LIABILITY',
  PROPERTY_DAMAGE_LIABILITY: 'PD_LIABILITY',
  PERSONAL_INJURY_PROTECTION: 'PIP',
  MEDICAL_PAYMENTS: 'MED_PAY',
  UNINSURED_MOTORIST_BI: 'UM_BI',
  UNINSURED_MOTORIST_PD: 'UM_PD',
  UNDERINSURED_MOTORIST: 'UIM',
  COLLISION: 'COLLISION',
  COMPREHENSIVE: 'COMPREHENSIVE',
  RENTAL_REIMBURSEMENT: 'RENTAL',
  ROADSIDE_ASSISTANCE: 'ROADSIDE',
} as const;

/**
 * Event type codes (OMG pattern)
 */
export const EventTypeCode = {
  // Policy events
  POLICY_CREATED: 'POLICY_CREATED',
  POLICY_BOUND: 'POLICY_BOUND',
  POLICY_ACTIVATED: 'POLICY_ACTIVATED',
  POLICY_CANCELLED: 'POLICY_CANCELLED',
  POLICY_RENEWED: 'POLICY_RENEWED',

  // Claim events
  CLAIM_FILED: 'CLAIM_FILED',
  CLAIM_ASSIGNED: 'CLAIM_ASSIGNED',
  CLAIM_INVESTIGATED: 'CLAIM_INVESTIGATED',
  CLAIM_SETTLED: 'CLAIM_SETTLED',
  CLAIM_CLOSED: 'CLAIM_CLOSED',

  // Payment events
  PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',
  PAYMENT_PROCESSED: 'PAYMENT_PROCESSED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
} as const;

/**
 * Document type codes
 */
export const DocumentTypeCode = {
  POLICY_DOCUMENT: 'POLICY_DOCUMENT',
  ID_CARD: 'ID_CARD',
  CLAIM_ATTACHMENT: 'CLAIM_ATTACHMENT',
  PROOF_OF_INSURANCE: 'PROOF_OF_INSURANCE',
  DECLARATION_PAGE: 'DECLARATION_PAGE',
} as const;

/**
 * Helper type to extract values from const objects
 */
export type ValueOf<T> = T[keyof T];
