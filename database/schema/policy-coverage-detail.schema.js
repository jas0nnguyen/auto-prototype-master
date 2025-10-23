"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.policyCoverageDetail = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const policy_schema_1 = require("./policy.schema");
const coverage_schema_1 = require("./coverage.schema");
const insurable_object_schema_1 = require("./insurable-object.schema");
const _base_schema_1 = require("./_base.schema");
exports.policyCoverageDetail = (0, pg_core_1.pgTable)('policy_coverage_detail', {
    policy_coverage_detail_identifier: (0, pg_core_1.uuid)('policy_coverage_detail_identifier').primaryKey().defaultRandom(),
    policy_identifier: (0, pg_core_1.uuid)('policy_identifier')
        .references(() => policy_schema_1.policy.policy_identifier, { onDelete: 'cascade' })
        .notNull(),
    coverage_identifier: (0, pg_core_1.uuid)('coverage_identifier')
        .references(() => coverage_schema_1.coverage.coverage_identifier)
        .notNull(),
    insurable_object_identifier: (0, pg_core_1.uuid)('insurable_object_identifier')
        .references(() => insurable_object_schema_1.insurableObject.insurable_object_identifier),
    effective_date: (0, pg_core_1.date)('effective_date').notNull(),
    expiration_date: (0, pg_core_1.date)('expiration_date').notNull(),
    coverage_description: (0, pg_core_1.text)('coverage_description'),
    is_included: (0, pg_core_1.varchar)('is_included', { length: 10 }).default('true'),
    ..._base_schema_1.auditTimestamps,
});
//# sourceMappingURL=policy-coverage-detail.schema.js.map