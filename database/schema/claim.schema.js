"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.claim = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const _base_schema_1 = require("./_base.schema");
const policy_schema_1 = require("./policy.schema");
const vehicle_schema_1 = require("./vehicle.schema");
const person_schema_1 = require("./person.schema");
exports.claim = (0, pg_core_1.pgTable)('claim', {
    claim_id: (0, pg_core_1.uuid)('claim_id').primaryKey().defaultRandom(),
    claim_number: (0, pg_core_1.varchar)('claim_number', { length: 20 }).notNull().unique(),
    policy_identifier: (0, pg_core_1.uuid)('policy_identifier')
        .notNull()
        .references(() => policy_schema_1.policy.policy_identifier, { onDelete: 'restrict' }),
    incident_date: (0, pg_core_1.date)('incident_date').notNull(),
    loss_type: (0, pg_core_1.varchar)('loss_type', { length: 50 }).notNull(),
    description: (0, pg_core_1.text)('description').notNull(),
    vehicle_identifier: (0, pg_core_1.uuid)('vehicle_identifier').references(() => vehicle_schema_1.vehicle.vehicle_identifier, {
        onDelete: 'set null',
    }),
    driver_identifier: (0, pg_core_1.uuid)('driver_identifier').references(() => person_schema_1.person.person_identifier, {
        onDelete: 'set null',
    }),
    status: (0, pg_core_1.varchar)('status', { length: 30 }).notNull().default('SUBMITTED'),
    estimated_loss_amount: (0, pg_core_1.varchar)('estimated_loss_amount', { length: 20 }),
    approved_amount: (0, pg_core_1.varchar)('approved_amount', { length: 20 }),
    paid_amount: (0, pg_core_1.varchar)('paid_amount', { length: 20 }),
    ..._base_schema_1.auditTimestamps,
});
//# sourceMappingURL=claim.schema.js.map