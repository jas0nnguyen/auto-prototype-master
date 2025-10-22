"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardSurcharges = exports.surcharge = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const policy_schema_1 = require("./policy.schema");
const _base_schema_1 = require("./_base.schema");
exports.surcharge = (0, pg_core_1.pgTable)('surcharge', {
    surcharge_identifier: (0, pg_core_1.uuid)('surcharge_identifier').primaryKey().defaultRandom(),
    policy_identifier: (0, pg_core_1.uuid)('policy_identifier')
        .references(() => policy_schema_1.policy.policy_identifier, { onDelete: 'cascade' }),
    surcharge_code: (0, pg_core_1.varchar)('surcharge_code', { length: 50 }).notNull(),
    surcharge_name: (0, pg_core_1.varchar)('surcharge_name', { length: 255 }).notNull(),
    surcharge_description: (0, pg_core_1.text)('surcharge_description'),
    surcharge_type: (0, pg_core_1.varchar)('surcharge_type', { length: 50 }),
    surcharge_percentage: (0, pg_core_1.decimal)('surcharge_percentage', { precision: 5, scale: 2 }).notNull(),
    surcharge_amount: (0, pg_core_1.decimal)('surcharge_amount', { precision: 10, scale: 2 }),
    ..._base_schema_1.auditTimestamps,
});
exports.StandardSurcharges = {
    YOUNG_DRIVER: { code: 'YOUNG_DRIVER', percentage: 50.00, description: 'Young Driver Surcharge (+30-100%)' },
    DUI: { code: 'DUI', percentage: 75.00, description: 'DUI/DWI Conviction (+50-100%)' },
    HIGH_PERFORMANCE: { code: 'HIGH_PERFORMANCE', percentage: 40.00, description: 'High-Performance Vehicle (+25-75%)' },
    ACCIDENT_FAULT: { code: 'ACCIDENT_FAULT', percentage: 20.00, description: 'At-Fault Accident (+15-40%)' },
    SPEEDING_TICKET: { code: 'SPEEDING_TICKET', percentage: 15.00, description: 'Speeding Violation (+10-25%)' },
    LAPSED_COVERAGE: { code: 'LAPSED_COVERAGE', percentage: 10.00, description: 'Lapsed Coverage (+5-20%)' },
    HIGH_RISK_ZIP: { code: 'HIGH_RISK_ZIP', percentage: 15.00, description: 'High-Risk Location (+10-30%)' },
    CREDIT_SCORE: { code: 'CREDIT_SCORE', percentage: 25.00, description: 'Poor Credit Score (+15-50%)' },
};
//# sourceMappingURL=surcharge.schema.js.map