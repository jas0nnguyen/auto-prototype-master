"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.policyDeductible = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const policy_coverage_detail_schema_1 = require("./policy-coverage-detail.schema");
const _base_schema_1 = require("./_base.schema");
exports.policyDeductible = (0, pg_core_1.pgTable)('policy_deductible', {
    policy_deductible_identifier: (0, pg_core_1.uuid)('policy_deductible_identifier').primaryKey().defaultRandom(),
    policy_coverage_detail_identifier: (0, pg_core_1.uuid)('policy_coverage_detail_identifier')
        .references(() => policy_coverage_detail_schema_1.policyCoverageDetail.policy_coverage_detail_identifier, { onDelete: 'cascade' })
        .notNull(),
    deductible_type_code: (0, pg_core_1.varchar)('deductible_type_code', { length: 50 }).notNull(),
    deductible_amount: (0, pg_core_1.decimal)('deductible_amount', { precision: 10, scale: 2 }).notNull(),
    deductible_description: (0, pg_core_1.varchar)('deductible_description', { length: 500 }),
    ..._base_schema_1.auditTimestamps,
});
//# sourceMappingURL=policy-deductible.schema.js.map