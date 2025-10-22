"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agreement = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const product_schema_1 = require("./product.schema");
const _base_schema_1 = require("./_base.schema");
exports.agreement = (0, pg_core_1.pgTable)('agreement', {
    agreement_identifier: (0, pg_core_1.uuid)('agreement_identifier').primaryKey().defaultRandom(),
    agreement_type_code: (0, pg_core_1.varchar)('agreement_type_code', { length: 50 }).notNull(),
    agreement_name: (0, pg_core_1.varchar)('agreement_name', { length: 255 }),
    agreement_original_inception_date: (0, pg_core_1.date)('agreement_original_inception_date'),
    product_identifier: (0, pg_core_1.uuid)('product_identifier')
        .references(() => product_schema_1.product.product_identifier)
        .notNull(),
    driver_email: (0, pg_core_1.varchar)('driver_email', { length: 255 }),
    premium_amount: (0, pg_core_1.numeric)('premium_amount', { precision: 10, scale: 2 }),
    ..._base_schema_1.auditTimestamps,
});
//# sourceMappingURL=agreement.schema.js.map