"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.payment = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const _base_schema_1 = require("./_base.schema");
const policy_schema_1 = require("./policy.schema");
exports.payment = (0, pg_core_1.pgTable)('payment', {
    payment_id: (0, pg_core_1.uuid)('payment_id').primaryKey().defaultRandom(),
    policy_id: (0, pg_core_1.uuid)('policy_id')
        .notNull()
        .references(() => policy_schema_1.policy.policy_identifier, { onDelete: 'cascade' }),
    payment_number: (0, pg_core_1.varchar)('payment_number', { length: 20 }).notNull().unique(),
    payment_method: (0, pg_core_1.varchar)('payment_method', { length: 20 }).notNull(),
    payment_status: (0, pg_core_1.varchar)('payment_status', { length: 20 }).notNull(),
    amount: (0, pg_core_1.decimal)('amount', { precision: 10, scale: 2 }).notNull(),
    last_four_digits: (0, pg_core_1.varchar)('last_four_digits', { length: 4 }),
    card_brand: (0, pg_core_1.varchar)('card_brand', { length: 20 }),
    account_type: (0, pg_core_1.varchar)('account_type', { length: 20 }),
    transaction_id: (0, pg_core_1.varchar)('transaction_id', { length: 100 }),
    gateway_response: (0, pg_core_1.varchar)('gateway_response', { length: 255 }),
    payment_date: (0, pg_core_1.timestamp)('payment_date').notNull().defaultNow(),
    processed_at: (0, pg_core_1.timestamp)('processed_at'),
    ..._base_schema_1.auditTimestamps,
});
//# sourceMappingURL=payment.schema.js.map