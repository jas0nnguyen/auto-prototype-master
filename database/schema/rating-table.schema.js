"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ratingTable = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const _base_schema_1 = require("./_base.schema");
exports.ratingTable = (0, pg_core_1.pgTable)('rating_table', {
    rating_table_identifier: (0, pg_core_1.uuid)('rating_table_identifier').primaryKey().defaultRandom(),
    table_name: (0, pg_core_1.varchar)('table_name', { length: 100 }).notNull(),
    table_code: (0, pg_core_1.varchar)('table_code', { length: 50 }).notNull().unique(),
    table_type: (0, pg_core_1.varchar)('table_type', { length: 50 }).notNull(),
    table_description: (0, pg_core_1.text)('table_description'),
    lookup_key_1: (0, pg_core_1.varchar)('lookup_key_1', { length: 100 }),
    lookup_key_2: (0, pg_core_1.varchar)('lookup_key_2', { length: 100 }),
    lookup_key_3: (0, pg_core_1.varchar)('lookup_key_3', { length: 100 }),
    rate_value: (0, pg_core_1.decimal)('rate_value', { precision: 10, scale: 4 }).notNull(),
    effective_date: (0, pg_core_1.date)('effective_date').notNull(),
    expiration_date: (0, pg_core_1.date)('expiration_date'),
    ..._base_schema_1.auditTimestamps,
});
//# sourceMappingURL=rating-table.schema.js.map