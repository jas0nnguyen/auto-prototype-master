"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.policyAmount = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const policy_schema_1 = require("./policy.schema");
const geographic_location_schema_1 = require("./geographic-location.schema");
const _base_schema_1 = require("./_base.schema");
exports.policyAmount = (0, pg_core_1.pgTable)('policy_amount', {
    policy_amount_identifier: (0, pg_core_1.uuid)('policy_amount_identifier').primaryKey().defaultRandom(),
    policy_identifier: (0, pg_core_1.uuid)('policy_identifier')
        .references(() => policy_schema_1.policy.policy_identifier, { onDelete: 'cascade' })
        .notNull(),
    geographic_location_identifier: (0, pg_core_1.uuid)('geographic_location_identifier')
        .references(() => geographic_location_schema_1.geographicLocation.geographic_location_identifier),
    amount_type_code: (0, pg_core_1.varchar)('amount_type_code', { length: 50 }).notNull(),
    amount_value: (0, pg_core_1.decimal)('amount_value', { precision: 12, scale: 2 }).notNull(),
    currency_code: (0, pg_core_1.varchar)('currency_code', { length: 3 }).default('USD'),
    amount_description: (0, pg_core_1.varchar)('amount_description', { length: 500 }),
    ..._base_schema_1.auditTimestamps,
});
//# sourceMappingURL=policy-amount.schema.js.map