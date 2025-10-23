"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.product = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const _base_schema_1 = require("./_base.schema");
exports.product = (0, pg_core_1.pgTable)('product', {
    product_identifier: (0, pg_core_1.uuid)('product_identifier').primaryKey().defaultRandom(),
    line_of_business_identifier: (0, pg_core_1.uuid)('line_of_business_identifier'),
    licensed_product_name: (0, pg_core_1.varchar)('licensed_product_name', { length: 255 }).notNull().unique(),
    product_description: (0, pg_core_1.text)('product_description'),
    ..._base_schema_1.auditTimestamps,
});
//# sourceMappingURL=product.schema.js.map