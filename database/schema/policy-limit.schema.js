"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.policyLimit = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const policy_coverage_detail_schema_1 = require("./policy-coverage-detail.schema");
const _base_schema_1 = require("./_base.schema");
exports.policyLimit = (0, pg_core_1.pgTable)('policy_limit', {
    policy_limit_identifier: (0, pg_core_1.uuid)('policy_limit_identifier').primaryKey().defaultRandom(),
    policy_coverage_detail_identifier: (0, pg_core_1.uuid)('policy_coverage_detail_identifier')
        .references(() => policy_coverage_detail_schema_1.policyCoverageDetail.policy_coverage_detail_identifier, { onDelete: 'cascade' })
        .notNull(),
    limit_type_code: (0, pg_core_1.varchar)('limit_type_code', { length: 50 }).notNull(),
    limit_amount: (0, pg_core_1.decimal)('limit_amount', { precision: 12, scale: 2 }).notNull(),
    limit_description: (0, pg_core_1.varchar)('limit_description', { length: 500 }),
    ..._base_schema_1.auditTimestamps,
});
//# sourceMappingURL=policy-limit.schema.js.map