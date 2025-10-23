"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolicyStatus = exports.policy = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const agreement_schema_1 = require("./agreement.schema");
const _base_schema_1 = require("./_base.schema");
exports.policy = (0, pg_core_1.pgTable)('policy', {
    policy_identifier: (0, pg_core_1.uuid)('policy_identifier')
        .primaryKey()
        .references(() => agreement_schema_1.agreement.agreement_identifier, { onDelete: 'cascade' }),
    policy_number: (0, pg_core_1.varchar)('policy_number', { length: 50 }).notNull().unique(),
    effective_date: (0, pg_core_1.date)('effective_date').notNull(),
    expiration_date: (0, pg_core_1.date)('expiration_date').notNull(),
    status_code: (0, pg_core_1.varchar)('status_code', { length: 50 }).notNull(),
    quote_snapshot: (0, pg_core_1.jsonb)('quote_snapshot'),
    marital_status: (0, pg_core_1.varchar)('marital_status', { length: 20 }),
    coverage_start_date: (0, pg_core_1.date)('coverage_start_date'),
    ..._base_schema_1.auditTimestamps,
});
exports.PolicyStatus = {
    QUOTED: 'QUOTED',
    BINDING: 'BINDING',
    BOUND: 'BOUND',
    ACTIVE: 'ACTIVE',
    CANCELLED: 'CANCELLED',
    EXPIRED: 'EXPIRED',
};
//# sourceMappingURL=policy.schema.js.map