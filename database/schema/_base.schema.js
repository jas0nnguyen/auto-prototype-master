"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentTypeCode = exports.EventTypeCode = exports.CoveragePartCode = exports.PartyRoleTypeCode = exports.CommunicationTypeCode = exports.PartyTypeCode = exports.EntityStatus = exports.effectiveDates = exports.temporalTracking = exports.auditTimestamps = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.auditTimestamps = {
    created_at: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updated_at: (0, pg_core_1.timestamp)('updated_at')
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
};
exports.temporalTracking = {
    begin_date: (0, pg_core_1.timestamp)('begin_date').notNull().defaultNow(),
    end_date: (0, pg_core_1.timestamp)('end_date'),
};
exports.effectiveDates = {
    effective_date: (0, pg_core_1.timestamp)('effective_date').notNull(),
    expiration_date: (0, pg_core_1.timestamp)('expiration_date').notNull(),
};
exports.EntityStatus = {
    QUOTE_DRAFT: 'DRAFT',
    QUOTE_ACTIVE: 'ACTIVE',
    QUOTE_CONVERTED: 'CONVERTED',
    QUOTE_EXPIRED: 'EXPIRED',
    POLICY_QUOTED: 'QUOTED',
    POLICY_BINDING: 'BINDING',
    POLICY_BOUND: 'BOUND',
    POLICY_ACTIVE: 'ACTIVE',
    POLICY_CANCELLED: 'CANCELLED',
    POLICY_EXPIRED: 'EXPIRED',
    CLAIM_SUBMITTED: 'SUBMITTED',
    CLAIM_UNDER_REVIEW: 'UNDER_REVIEW',
    CLAIM_APPROVED: 'APPROVED',
    CLAIM_DENIED: 'DENIED',
    CLAIM_CLOSED: 'CLOSED',
    PAYMENT_PENDING: 'PENDING',
    PAYMENT_PROCESSING: 'PROCESSING',
    PAYMENT_COMPLETED: 'COMPLETED',
    PAYMENT_FAILED: 'FAILED',
    PAYMENT_REFUNDED: 'REFUNDED',
};
exports.PartyTypeCode = {
    PERSON: 'PERSON',
    ORGANIZATION: 'ORGANIZATION',
    GROUPING: 'GROUPING',
};
exports.CommunicationTypeCode = {
    EMAIL: 'EMAIL',
    PHONE: 'PHONE',
    MOBILE: 'MOBILE',
    FAX: 'FAX',
};
exports.PartyRoleTypeCode = {
    INSURED: 'INSURED',
    POLICY_OWNER: 'POLICY_OWNER',
    BENEFICIARY: 'BENEFICIARY',
    ACCOUNT_HOLDER: 'ACCOUNT_HOLDER',
    VEHICLE_OWNER: 'VEHICLE_OWNER',
    VEHICLE_OPERATOR: 'VEHICLE_OPERATOR',
    CLAIMANT: 'CLAIMANT',
    WITNESS: 'WITNESS',
    ADJUSTER: 'ADJUSTER',
};
exports.CoveragePartCode = {
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
};
exports.EventTypeCode = {
    POLICY_CREATED: 'POLICY_CREATED',
    POLICY_BOUND: 'POLICY_BOUND',
    POLICY_ACTIVATED: 'POLICY_ACTIVATED',
    POLICY_CANCELLED: 'POLICY_CANCELLED',
    POLICY_RENEWED: 'POLICY_RENEWED',
    CLAIM_FILED: 'CLAIM_FILED',
    CLAIM_ASSIGNED: 'CLAIM_ASSIGNED',
    CLAIM_INVESTIGATED: 'CLAIM_INVESTIGATED',
    CLAIM_SETTLED: 'CLAIM_SETTLED',
    CLAIM_CLOSED: 'CLAIM_CLOSED',
    PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',
    PAYMENT_PROCESSED: 'PAYMENT_PROCESSED',
    PAYMENT_FAILED: 'PAYMENT_FAILED',
};
exports.DocumentTypeCode = {
    POLICY_DOCUMENT: 'POLICY_DOCUMENT',
    ID_CARD: 'ID_CARD',
    CLAIM_ATTACHMENT: 'CLAIM_ATTACHMENT',
    PROOF_OF_INSURANCE: 'PROOF_OF_INSURANCE',
    DECLARATION_PAGE: 'DECLARATION_PAGE',
};
//# sourceMappingURL=_base.schema.js.map