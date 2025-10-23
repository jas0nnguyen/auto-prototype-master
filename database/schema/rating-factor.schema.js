"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ratingFactor = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const _base_schema_1 = require("./_base.schema");
exports.ratingFactor = (0, pg_core_1.pgTable)('rating_factor', {
    rating_factor_identifier: (0, pg_core_1.uuid)('rating_factor_identifier').primaryKey().defaultRandom(),
    factor_name: (0, pg_core_1.varchar)('factor_name', { length: 100 }).notNull(),
    factor_category: (0, pg_core_1.varchar)('factor_category', { length: 50 }).notNull(),
    factor_code: (0, pg_core_1.varchar)('factor_code', { length: 50 }).notNull(),
    factor_value: (0, pg_core_1.varchar)('factor_value', { length: 255 }),
    factor_weight: (0, pg_core_1.decimal)('factor_weight', { precision: 5, scale: 4 }),
    factor_description: (0, pg_core_1.text)('factor_description'),
    ..._base_schema_1.auditTimestamps,
});
//# sourceMappingURL=rating-factor.schema.js.map