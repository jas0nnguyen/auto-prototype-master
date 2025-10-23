"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.premiumCalculation = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const policy_schema_1 = require("./policy.schema");
const _base_schema_1 = require("./_base.schema");
exports.premiumCalculation = (0, pg_core_1.pgTable)('premium_calculation', {
    premium_calculation_identifier: (0, pg_core_1.uuid)('premium_calculation_identifier').primaryKey().defaultRandom(),
    policy_identifier: (0, pg_core_1.uuid)('policy_identifier')
        .references(() => policy_schema_1.policy.policy_identifier, { onDelete: 'cascade' })
        .notNull(),
    base_premium: (0, pg_core_1.decimal)('base_premium', { precision: 10, scale: 2 }).notNull(),
    vehicle_factors: (0, pg_core_1.jsonb)('vehicle_factors'),
    driver_factors: (0, pg_core_1.jsonb)('driver_factors'),
    location_factors: (0, pg_core_1.jsonb)('location_factors'),
    coverage_factors: (0, pg_core_1.jsonb)('coverage_factors'),
    discounts_applied: (0, pg_core_1.jsonb)('discounts_applied'),
    surcharges_applied: (0, pg_core_1.jsonb)('surcharges_applied'),
    total_factor_multiplier: (0, pg_core_1.decimal)('total_factor_multiplier', { precision: 8, scale: 4 }),
    subtotal_before_discounts: (0, pg_core_1.decimal)('subtotal_before_discounts', { precision: 10, scale: 2 }),
    total_discount_amount: (0, pg_core_1.decimal)('total_discount_amount', { precision: 10, scale: 2 }),
    total_surcharge_amount: (0, pg_core_1.decimal)('total_surcharge_amount', { precision: 10, scale: 2 }),
    premium_tax_percentage: (0, pg_core_1.decimal)('premium_tax_percentage', { precision: 5, scale: 2 }),
    premium_tax_amount: (0, pg_core_1.decimal)('premium_tax_amount', { precision: 10, scale: 2 }),
    policy_fee_amount: (0, pg_core_1.decimal)('policy_fee_amount', { precision: 10, scale: 2 }),
    dmv_fee_amount: (0, pg_core_1.decimal)('dmv_fee_amount', { precision: 10, scale: 2 }),
    total_premium: (0, pg_core_1.decimal)('total_premium', { precision: 10, scale: 2 }).notNull(),
    calculation_timestamp: (0, pg_core_1.timestamp)('calculation_timestamp').defaultNow().notNull(),
    calculation_version: (0, pg_core_1.varchar)('calculation_version', { length: 20 }),
    calculation_notes: (0, pg_core_1.text)('calculation_notes'),
    ..._base_schema_1.auditTimestamps,
});
//# sourceMappingURL=premium-calculation.schema.js.map