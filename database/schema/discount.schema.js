"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardDiscounts = exports.discount = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const policy_schema_1 = require("./policy.schema");
const _base_schema_1 = require("./_base.schema");
exports.discount = (0, pg_core_1.pgTable)('discount', {
    discount_identifier: (0, pg_core_1.uuid)('discount_identifier').primaryKey().defaultRandom(),
    policy_identifier: (0, pg_core_1.uuid)('policy_identifier')
        .references(() => policy_schema_1.policy.policy_identifier, { onDelete: 'cascade' }),
    discount_code: (0, pg_core_1.varchar)('discount_code', { length: 50 }).notNull(),
    discount_name: (0, pg_core_1.varchar)('discount_name', { length: 255 }).notNull(),
    discount_description: (0, pg_core_1.text)('discount_description'),
    discount_type: (0, pg_core_1.varchar)('discount_type', { length: 50 }),
    discount_percentage: (0, pg_core_1.decimal)('discount_percentage', { precision: 5, scale: 2 }).notNull(),
    discount_amount: (0, pg_core_1.decimal)('discount_amount', { precision: 10, scale: 2 }),
    ..._base_schema_1.auditTimestamps,
});
exports.StandardDiscounts = {
    GOOD_DRIVER: { code: 'GOOD_DRIVER', percentage: 15.00, description: 'Good Driver Discount (15-25%)' },
    MULTI_CAR: { code: 'MULTI_CAR', percentage: 10.00, description: 'Multi-Car Discount (5-15%)' },
    LOW_MILEAGE: { code: 'LOW_MILEAGE', percentage: 10.00, description: 'Low Mileage Discount (5-15%)' },
    ANTI_THEFT: { code: 'ANTI_THEFT', percentage: 5.00, description: 'Anti-Theft Device Discount (5-10%)' },
    SAFETY_FEATURES: { code: 'SAFETY_FEATURES', percentage: 5.00, description: 'Safety Features Discount (3-7%)' },
    DEFENSIVE_DRIVING: { code: 'DEFENSIVE_DRIVING', percentage: 10.00, description: 'Defensive Driving Course (5-15%)' },
    BUNDLED: { code: 'BUNDLED', percentage: 10.00, description: 'Bundled Policies Discount (10-20%)' },
};
//# sourceMappingURL=discount.schema.js.map