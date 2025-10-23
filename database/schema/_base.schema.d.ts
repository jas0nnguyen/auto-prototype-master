export declare const auditTimestamps: {
    created_at: import("drizzle-orm").HasDefault<import("drizzle-orm").NotNull<import("drizzle-orm/pg-core").PgTimestampBuilderInitial<"created_at">>>;
    updated_at: import("drizzle-orm").HasDefault<import("drizzle-orm").HasDefault<import("drizzle-orm").NotNull<import("drizzle-orm/pg-core").PgTimestampBuilderInitial<"updated_at">>>>;
};
export declare const temporalTracking: {
    begin_date: import("drizzle-orm").HasDefault<import("drizzle-orm").NotNull<import("drizzle-orm/pg-core").PgTimestampBuilderInitial<"begin_date">>>;
    end_date: import("drizzle-orm/pg-core").PgTimestampBuilderInitial<"end_date">;
};
export declare const effectiveDates: {
    effective_date: import("drizzle-orm").NotNull<import("drizzle-orm/pg-core").PgTimestampBuilderInitial<"effective_date">>;
    expiration_date: import("drizzle-orm").NotNull<import("drizzle-orm/pg-core").PgTimestampBuilderInitial<"expiration_date">>;
};
export declare const EntityStatus: {
    readonly QUOTE_DRAFT: "DRAFT";
    readonly QUOTE_ACTIVE: "ACTIVE";
    readonly QUOTE_CONVERTED: "CONVERTED";
    readonly QUOTE_EXPIRED: "EXPIRED";
    readonly POLICY_QUOTED: "QUOTED";
    readonly POLICY_BINDING: "BINDING";
    readonly POLICY_BOUND: "BOUND";
    readonly POLICY_ACTIVE: "ACTIVE";
    readonly POLICY_CANCELLED: "CANCELLED";
    readonly POLICY_EXPIRED: "EXPIRED";
    readonly CLAIM_SUBMITTED: "SUBMITTED";
    readonly CLAIM_UNDER_REVIEW: "UNDER_REVIEW";
    readonly CLAIM_APPROVED: "APPROVED";
    readonly CLAIM_DENIED: "DENIED";
    readonly CLAIM_CLOSED: "CLOSED";
    readonly PAYMENT_PENDING: "PENDING";
    readonly PAYMENT_PROCESSING: "PROCESSING";
    readonly PAYMENT_COMPLETED: "COMPLETED";
    readonly PAYMENT_FAILED: "FAILED";
    readonly PAYMENT_REFUNDED: "REFUNDED";
};
export declare const PartyTypeCode: {
    readonly PERSON: "PERSON";
    readonly ORGANIZATION: "ORGANIZATION";
    readonly GROUPING: "GROUPING";
};
export declare const CommunicationTypeCode: {
    readonly EMAIL: "EMAIL";
    readonly PHONE: "PHONE";
    readonly MOBILE: "MOBILE";
    readonly FAX: "FAX";
};
export declare const PartyRoleTypeCode: {
    readonly INSURED: "INSURED";
    readonly POLICY_OWNER: "POLICY_OWNER";
    readonly BENEFICIARY: "BENEFICIARY";
    readonly ACCOUNT_HOLDER: "ACCOUNT_HOLDER";
    readonly VEHICLE_OWNER: "VEHICLE_OWNER";
    readonly VEHICLE_OPERATOR: "VEHICLE_OPERATOR";
    readonly CLAIMANT: "CLAIMANT";
    readonly WITNESS: "WITNESS";
    readonly ADJUSTER: "ADJUSTER";
};
export declare const CoveragePartCode: {
    readonly BODILY_INJURY_LIABILITY: "BI_LIABILITY";
    readonly PROPERTY_DAMAGE_LIABILITY: "PD_LIABILITY";
    readonly PERSONAL_INJURY_PROTECTION: "PIP";
    readonly MEDICAL_PAYMENTS: "MED_PAY";
    readonly UNINSURED_MOTORIST_BI: "UM_BI";
    readonly UNINSURED_MOTORIST_PD: "UM_PD";
    readonly UNDERINSURED_MOTORIST: "UIM";
    readonly COLLISION: "COLLISION";
    readonly COMPREHENSIVE: "COMPREHENSIVE";
    readonly RENTAL_REIMBURSEMENT: "RENTAL";
    readonly ROADSIDE_ASSISTANCE: "ROADSIDE";
};
export declare const EventTypeCode: {
    readonly POLICY_CREATED: "POLICY_CREATED";
    readonly POLICY_BOUND: "POLICY_BOUND";
    readonly POLICY_ACTIVATED: "POLICY_ACTIVATED";
    readonly POLICY_CANCELLED: "POLICY_CANCELLED";
    readonly POLICY_RENEWED: "POLICY_RENEWED";
    readonly CLAIM_FILED: "CLAIM_FILED";
    readonly CLAIM_ASSIGNED: "CLAIM_ASSIGNED";
    readonly CLAIM_INVESTIGATED: "CLAIM_INVESTIGATED";
    readonly CLAIM_SETTLED: "CLAIM_SETTLED";
    readonly CLAIM_CLOSED: "CLAIM_CLOSED";
    readonly PAYMENT_RECEIVED: "PAYMENT_RECEIVED";
    readonly PAYMENT_PROCESSED: "PAYMENT_PROCESSED";
    readonly PAYMENT_FAILED: "PAYMENT_FAILED";
};
export declare const DocumentTypeCode: {
    readonly POLICY_DOCUMENT: "POLICY_DOCUMENT";
    readonly ID_CARD: "ID_CARD";
    readonly CLAIM_ATTACHMENT: "CLAIM_ATTACHMENT";
    readonly PROOF_OF_INSURANCE: "PROOF_OF_INSURANCE";
    readonly DECLARATION_PAGE: "DECLARATION_PAGE";
};
export type ValueOf<T> = T[keyof T];
